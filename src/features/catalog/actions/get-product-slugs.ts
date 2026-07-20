import "server-only"

import { createPublicClient, hasSupabaseEnv } from "@/lib/supabase/public"

// Used only by generateStaticParams (producto/[slug]) to prebuild every
// active product at build time. Same defense-in-depth as the other actions:
// products.is_active AND categories.is_active both gate visibility (edge
// cases in docs/specs/public-catalog.md).
export async function getProductSlugs(): Promise<string[]> {
  if (!hasSupabaseEnv()) {
    return []
  }

  const supabase = createPublicClient()

  const { data, error } = await supabase
    .from("products")
    .select("slug, categories!inner(is_active)")
    .eq("is_active", true)
    .eq("categories.is_active", true)

  if (error) {
    throw new Error(`Failed to load product slugs: ${error.message}`)
  }

  return (data ?? []).map((row) => row.slug)
}
