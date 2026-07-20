import "server-only"

import { createPublicClient, hasSupabaseEnv } from "@/lib/supabase/public"

import type { CategoryDetail } from "../types"

export async function getCategoryBySlug(
  slug: string,
): Promise<CategoryDetail | null> {
  if (!hasSupabaseEnv()) {
    return null
  }

  const supabase = createPublicClient()

  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name, description, storage_path")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to load category "${slug}": ${error.message}`)
  }

  return data
}
