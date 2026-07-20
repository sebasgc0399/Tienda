import "server-only"

import type { createAdminClient } from "@/lib/supabase/admin"

import { isSlugTaken, nextAvailableSlug } from "./next-available-slug"

type AdminClient = ReturnType<typeof createAdminClient>

// "auto": the slug was derived from name (or left unchanged on an edit) —
// silent suffixing is fine, the owner never typed it by hand. "manual": the
// owner typed this slug herself — a collision must be reported, never
// silently changed (docs/specs/admin-panel.md, "Generación de slug").
export type SlugSource = "auto" | "manual"

export type SlugResolution = { ok: true; slug: string } | { ok: false }

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

// Branches the slug pipeline on how `desired` was produced (admin-panel.md,
// "Generación de slug"): "auto" delegates to resolveUniqueSlug and always
// resolves, suffixing on collision. "manual" never mutates `desired` — it
// either confirms the slug is free (or belongs to the row being edited,
// exempted via `currentSlug`) or reports the collision as { ok: false } so
// the caller can surface a readable Spanish error instead of a silent
// suffix or a raw Postgres UNIQUE-violation message.
export async function resolveSlugOrError(
  admin: AdminClient,
  table: "categories" | "products",
  desired: string,
  slugSource: SlugSource,
  currentSlug?: string,
): Promise<SlugResolution> {
  if (slugSource === "auto") {
    const slug = await resolveUniqueSlug(admin, table, desired, currentSlug)
    return { ok: true, slug }
  }

  const { data, error } = await admin
    .from(table)
    .select("slug")
    .eq("slug", desired)

  if (error) {
    throw new Error(`Failed to check slug uniqueness: ${error.message}`)
  }

  const taken = (data ?? []).map((row: { slug: string }) => row.slug)

  if (isSlugTaken(desired, taken, currentSlug)) {
    return { ok: false }
  }

  return { ok: true, slug: desired }
}
