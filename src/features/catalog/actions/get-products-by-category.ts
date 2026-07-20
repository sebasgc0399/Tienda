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
      "id, slug, name, price, availability, product_images(storage_path, alt_text, is_primary, display_order)",
    )
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .order("display_order", { ascending: true })

  if (error) {
    throw new Error(
      `Failed to load products for category "${categoryId}": ${error.message}`,
    )
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    price: row.price,
    availability: row.availability,
    image: pickPrimaryImage(row.product_images),
  }))
}
