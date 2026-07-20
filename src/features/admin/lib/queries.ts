import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import type { Category } from "@/types/database"

import type { AdminCategoryRow } from "../types"
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
