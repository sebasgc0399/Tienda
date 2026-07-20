import "server-only"

import { createPublicClient, hasSupabaseEnv } from "@/lib/supabase/public"

import type { CategorySummary } from "../types"

export async function getCategories(): Promise<CategorySummary[]> {
  if (!hasSupabaseEnv()) {
    return []
  }

  const supabase = createPublicClient()

  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name, description, display_order, storage_path")
    .eq("is_active", true)
    .order("display_order", { ascending: true })

  if (error) {
    throw new Error(`Failed to load categories: ${error.message}`)
  }

  return data ?? []
}
