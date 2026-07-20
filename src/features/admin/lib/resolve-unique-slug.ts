import "server-only"

import type { createAdminClient } from "@/lib/supabase/admin"

import { nextAvailableSlug } from "./next-available-slug"

type AdminClient = ReturnType<typeof createAdminClient>

// Resolves `desired` to a slug that is free in `table`, delegating the pure
// suffix logic to nextAvailableSlug() (admin-panel.md, "Generación de
// slug"). Fetches every OTHER slug that could collide: an exact match on
// `desired` plus any slug already using it as a numeric-suffix base
// (`desired-2`, `desired-3`, ...) — so the picked suffix is always the true
// next free one instead of guessing from a single row. `currentSlug`
// exempts the row being edited from colliding with its own current slug.
export async function resolveUniqueSlug(
  admin: AdminClient,
  table: "categories" | "products",
  desired: string,
  currentSlug?: string,
): Promise<string> {
  const { data, error } = await admin
    .from(table)
    .select("slug")
    .or(`slug.eq.${desired},slug.like.${desired}-%`)

  if (error) {
    throw new Error(`Failed to check slug uniqueness: ${error.message}`)
  }

  const taken = (data ?? []).map((row: { slug: string }) => row.slug)

  return nextAvailableSlug(desired, taken, currentSlug)
}
