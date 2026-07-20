import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import type { Category, Product, ProductImage } from "@/types/database"

import type {
  AdminCategoryRow,
  AdminProductRow,
  CategoryOption,
} from "../types"
import { getAdminUser, SessionExpiredError } from "./auth"

// Self-guarded reads: the admin panel must see inactive rows too (RLS only
// exposes is_active=true, even to `authenticated`), so these reads go
// through createAdminClient() (service_role, bypasses RLS). Because that
// key bypasses RLS entirely, every function here re-checks the session as
// its FIRST line instead of trusting the (panel) layout gate or the proxy —
// defense in depth so this data layer never runs unauthenticated on its own
// (admin-panel.md plan, "Lecturas admin").
export async function getAdminCategories(): Promise<AdminCategoryRow[]> {
  const user = await getAdminUser()
  if (!user) {
    throw new SessionExpiredError()
  }

  const admin = createAdminClient()

  const [categoriesResult, productsResult] = await Promise.all([
    admin
      .from("categories")
      .select("*")
      .order("display_order", { ascending: true }),
    admin.from("products").select("category_id"),
  ])

  if (categoriesResult.error) {
    throw new Error(
      `Failed to load categories: ${categoriesResult.error.message}`,
    )
  }
  if (productsResult.error) {
    throw new Error(
      `Failed to count products per category: ${productsResult.error.message}`,
    )
  }

  const counts = new Map<string, number>()
  for (const row of productsResult.data ?? []) {
    const categoryId = row.category_id as string
    counts.set(categoryId, (counts.get(categoryId) ?? 0) + 1)
  }

  return (categoriesResult.data ?? []).map((category: Category) => ({
    ...category,
    product_count: counts.get(category.id) ?? 0,
  }))
}

export async function getAdminCategory(id: string): Promise<Category | null> {
  const user = await getAdminUser()
  if (!user) {
    throw new SessionExpiredError()
  }

  const admin = createAdminClient()

  const { data, error } = await admin
    .from("categories")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to load category "${id}": ${error.message}`)
  }

  return data
}

type AdminProductQueryRow = Product & {
  categories: { name: string; display_order: number } | null
  product_images: Array<{
    storage_path: string
    is_primary: boolean
    display_order: number
  }>
}

// Prefers the image flagged is_primary; falls back to the lowest
// display_order; returns null when the product has no images yet. Kept
// local instead of reusing catalog's pickPrimaryImage() (features/catalog/
// lib/pick-primary-image.ts) so this data layer doesn't reach across the
// feature boundary for a five-line helper (ADR-0006).
function pickPrimaryImagePath(
  images: AdminProductQueryRow["product_images"],
): string | null {
  if (images.length === 0) {
    return null
  }

  const primary = images.find((image) => image.is_primary)
  const picked =
    primary ?? [...images].sort((a, b) => a.display_order - b.display_order)[0]

  return picked.storage_path
}

// Same self-guard as getAdminCategories: is_active isn't filtered, so
// deactivated products stay visible to the admin. Sorting happens in JS
// after the fetch, by category display_order then the product's own
// display_order — a product's display_order is only meaningful within its
// own category (data-model.md, products.display_order), not globally.
//
// category_id is a required tiebreaker between those two keys, not
// cosmetic: category display_order is only unique by convention (the admin
// UI keeps it sequential via reorderCategory, but nothing in the schema
// enforces it), so two categories can legitimately tie on display_order.
// Without a tiebreaker, a tie falls straight through to the product-level
// sort, which compares display_order across every product regardless of
// category and interleaves rows from the tied categories — ProductList's
// groupByCategory then sees a non-contiguous run and emits the same
// category twice. category_id (the product's own FK, already on every
// row) is a primary key, so it can never itself tie — that's what
// actually guarantees each category's rows end up contiguous.
export async function getAdminProducts(): Promise<AdminProductRow[]> {
  const user = await getAdminUser()
  if (!user) {
    throw new SessionExpiredError()
  }

  const admin = createAdminClient()

  const { data, error } = await admin.from("products").select(
    `*, categories(name, display_order),
     product_images(storage_path, is_primary, display_order)`,
  )

  if (error) {
    throw new Error(`Failed to load products: ${error.message}`)
  }

  const withCategoryOrder = (data ?? []).map((row: AdminProductQueryRow) => {
    const { categories, product_images, ...product } = row
    return {
      row: {
        ...product,
        category_name: categories?.name ?? "",
        primary_image_path: pickPrimaryImagePath(product_images),
      },
      categoryOrder: categories?.display_order ?? 0,
    }
  })

  withCategoryOrder.sort((a, b) => {
    if (a.categoryOrder !== b.categoryOrder) {
      return a.categoryOrder - b.categoryOrder
    }
    if (a.row.category_id !== b.row.category_id) {
      return a.row.category_id.localeCompare(b.row.category_id)
    }
    return a.row.display_order - b.row.display_order
  })

  return withCategoryOrder.map((item) => item.row)
}

export async function getAdminProduct(id: string): Promise<Product | null> {
  const user = await getAdminUser()
  if (!user) {
    throw new SessionExpiredError()
  }

  const admin = createAdminClient()

  const { data, error } = await admin
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to load product "${id}": ${error.message}`)
  }

  return data
}

// Every category, including inactive ones, for ProductForm's category
// Select — an inactive category can still own products, so the form must
// be able to show/keep that assignment, not just offer active categories.
export async function getCategoryOptions(): Promise<CategoryOption[]> {
  const user = await getAdminUser()
  if (!user) {
    throw new SessionExpiredError()
  }

  const admin = createAdminClient()

  const { data, error } = await admin
    .from("categories")
    .select("id, name")
    .order("display_order", { ascending: true })

  if (error) {
    throw new Error(`Failed to load categories: ${error.message}`)
  }

  return data ?? []
}

// Same self-guard as the other admin reads: product_images has no is_active
// of its own (data-model.md, RF-2), but this still goes through
// createAdminClient() alongside every other admin read, so it checks the
// session itself rather than relying on the caller. Ordered by
// display_order (RF-7 gallery order) with created_at as the tiebreaker for
// rows that share a display_order (e.g. freshly uploaded, still at the
// default 0).
export async function getProductImages(
  productId: string,
): Promise<ProductImage[]> {
  const user = await getAdminUser()
  if (!user) {
    throw new SessionExpiredError()
  }

  const admin = createAdminClient()

  const { data, error } = await admin
    .from("product_images")
    .select("*")
    .eq("product_id", productId)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true })

  if (error) {
    throw new Error(
      `Failed to load images for product "${productId}": ${error.message}`,
    )
  }

  return data ?? []
}
