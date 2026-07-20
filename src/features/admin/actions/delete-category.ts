"use server"

import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"

import type { ActionResult } from "../lib/action-result"
import { fail, ok } from "../lib/action-result"
import { revalidatePublicCatalog } from "../lib/revalidate"
import { withAdmin } from "../lib/with-admin"

// Deletes a category outright. Only succeeds when no product still
// references it — checked explicitly first so the UI gets a readable
// Spanish message instead of the raw Postgres FK-violation error
// (admin-panel.md, "Eliminar categoría con productos asociados"; data-model.md,
// categories -> products is ON DELETE RESTRICT).
export async function deleteCategory(id: string): Promise<ActionResult> {
  return withAdmin(async () => {
    const admin = createAdminClient()

    const { count, error: countError } = await admin
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("category_id", id)

    if (countError) {
      return fail("No se pudo verificar la categoría. Intenta de nuevo.")
    }

    if (count && count > 0) {
      return fail(
        "La categoría todavía tiene productos. Reasígnalos o desactívala.",
      )
    }

    const { error } = await admin.from("categories").delete().eq("id", id)

    if (error) {
      return fail("No se pudo eliminar la categoría. Intenta de nuevo.")
    }

    revalidatePublicCatalog()

    return ok(undefined, "Categoría eliminada")
  })
}
