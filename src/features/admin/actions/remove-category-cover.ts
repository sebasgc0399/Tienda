"use server"

import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"

import type { ActionResult } from "../lib/action-result"
import { fail, ok } from "../lib/action-result"
import { revalidatePublicCatalog } from "../lib/revalidate"
import { removeObject } from "../lib/storage"
import { withAdmin } from "../lib/with-admin"

// Clears a category's cover. Row cleared first, object removal is
// best-effort cleanup after — same anti-orphan ordering rationale as
// upload-category-cover.ts, applied in reverse (nothing should ever point
// at a missing file).
export async function removeCategoryCover(
  categoryId: string,
): Promise<ActionResult> {
  return withAdmin(async () => {
    const admin = createAdminClient()

    const { data: existing, error: fetchError } = await admin
      .from("categories")
      .select("storage_path")
      .eq("id", categoryId)
      .maybeSingle()

    if (fetchError || !existing) {
      return fail("No se pudo cargar la categoría. Intenta de nuevo.")
    }

    if (!existing.storage_path) {
      return ok(undefined)
    }

    const { error: updateError } = await admin
      .from("categories")
      .update({ storage_path: null, updated_at: new Date().toISOString() })
      .eq("id", categoryId)

    if (updateError) {
      return fail("No se pudo quitar la portada. Intenta de nuevo.")
    }

    await removeObject(admin, existing.storage_path).catch(() => {})

    revalidatePublicCatalog()

    return ok(undefined, "Portada eliminada")
  })
}
