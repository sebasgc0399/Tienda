import "server-only"

import { createPublicClient, hasSupabaseEnv } from "@/lib/supabase/public"

import type { ProductDetail } from "../types"

// Without a generated Database type, postgrest-js can't infer the
// cardinality of `categories!inner(...)` from the select string and
// defaults it to an array — but a product belongs to exactly one category,
// so PostgREST always returns a single object for this join at runtime.
type ProductBySlugRow = Omit<ProductDetail, "category"> & {
  categories: ProductDetail["category"]
  product_images: ProductDetail["images"]
}

export async function getProductBySlug(
  slug: string,
): Promise<ProductDetail | null> {
  if (!hasSupabaseEnv()) {
    return null
  }

  const supabase = createPublicClient()

  const { data, error } = await supabase
    .from("products")
    .select(
      `id, slug, name, description, price, availability,
       categories!inner(slug, name, is_active),
       product_images(id, storage_path, alt_text, is_primary, display_order)`,
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .eq("categories.is_active", true)
    .order("display_order", { referencedTable: "product_images" })
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to load product "${slug}": ${error.message}`)
  }

  if (!data) {
    return null
  }

  const row = data as unknown as ProductBySlugRow

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    price: row.price,
    availability: row.availability,
    category: {
      slug: row.categories.slug,
      name: row.categories.name,
    },
    images: row.product_images,
  }
}
