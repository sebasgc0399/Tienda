"use server"

import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"

import type { ActionResult } from "../lib/action-result"
import { fail, ok } from "../lib/action-result"
import { revalidatePublicCatalog } from "../lib/revalidate"
import { withAdmin } from "../lib/with-admin"

// RF-8 (admin-panel.md): inline is_active toggle from the category list.
// Also the "safe default" resolution offered by the delete dialog when a
// category still has products (see delete-category.ts).
export async function toggleCategoryActive(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  return withAdmin(async () => {
    const admin = createAdminClient()

    const { error } = await admin
      .from("categories")
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (error) {
      return fail("No se pudo actualizar la categoría. Intenta de nuevo.")
    }

    revalidatePublicCatalog()

    return ok(undefined)
  })
}
