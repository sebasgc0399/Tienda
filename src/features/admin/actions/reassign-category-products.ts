"use server"

import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"

import type { ActionResult } from "../lib/action-result"
import { fail, ok } from "../lib/action-result"
import { revalidatePublicCatalog } from "../lib/revalidate"
import { withAdmin } from "../lib/with-admin"

// Alternative resolution offered by the delete dialog when a category
// still has products (admin-panel.md, "Eliminar categoría con productos
// asociados"): move every product from `fromId` to `toId` so the category
// can then be deleted outright. Called right before deleteCategory() from
// the UI, not merged into one action, so a failure at either step surfaces
// its own readable message.
export async function reassignCategoryProducts(
  fromId: string,
  toId: string,
): Promise<ActionResult> {
  return withAdmin(async () => {
    const admin = createAdminClient()

    const { error } = await admin
      .from("products")
      .update({ category_id: toId, updated_at: new Date().toISOString() })
      .eq("category_id", fromId)

    if (error) {
      return fail("No se pudieron reasignar los productos. Intenta de nuevo.")
    }

    revalidatePublicCatalog()

    return ok(undefined, "Productos reasignados")
  })
}
