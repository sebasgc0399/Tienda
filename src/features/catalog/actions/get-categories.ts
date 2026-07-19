import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { Category } from "@/types/database"

type CategorySummary = Pick<
  Category,
  "id" | "slug" | "name" | "description" | "display_order"
>

export async function getCategories(): Promise<CategorySummary[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name, description, display_order")
    .eq("is_active", true)
    .order("display_order", { ascending: true })

  if (error) {
    throw new Error(`Failed to load categories: ${error.message}`)
  }

  return data ?? []
}
