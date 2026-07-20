import "server-only"

import { createPublicClient, hasSupabaseEnv } from "@/lib/supabase/public"

import { pickPrimaryImage } from "../lib/pick-primary-image"
import type { ProductCardData } from "../types"

export async function getProductsByCategory(
  categoryId: string,
): Promise<ProductCardData[]> {
  if (!hasSupabaseEnv()) {
    return []
  }

  const supabase = createPublicClient()

  const { data, error } = await supabase
    .from("products")
    .select(
      `id, slug, name, price, availability,
       categories!inner(is_active),
       product_images(storage_path, alt_text, is_primary, display_order)`,
    )
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .eq("categories.is_active", true)
    .order("display_order", { ascending: true })

  if (error) {
    throw new Error(
      `Failed to load products for category "${categoryId}": ${error.message}`,
    )
  }

  // RLS already scopes rows to active categories/products; the
  // categories.is_active filter above is defense-in-depth for the join.
  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    price: row.price,
    availability: row.availability,
    image: pickPrimaryImage(row.product_images),
  }))
}
