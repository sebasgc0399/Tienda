import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { Product } from "@/types/database"

type FeaturedProduct = Pick<Product, "id" | "slug" | "name" | "price">

// Featured ordering rule: created_at DESC (docs/specs/public-catalog.md RF-1).
export async function getFeaturedProducts(): Promise<FeaturedProduct[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("products")
    .select("id, slug, name, price, categories!inner(is_active)")
    .eq("is_featured", true)
    .eq("is_active", true)
    .eq("categories.is_active", true)
    .order("created_at", { ascending: false })
    .limit(4)

  if (error) {
    throw new Error(`Failed to load featured products: ${error.message}`)
  }

  // Pick only the FeaturedProduct fields, dropping the join-only `categories` field.
  return (data ?? []).map(({ id, slug, name, price }) => ({
    id,
    slug,
    name,
    price,
  }))
}
