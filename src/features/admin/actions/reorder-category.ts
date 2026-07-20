"use server"

import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"

import type { ActionResult } from "../lib/action-result"
import { fail, ok } from "../lib/action-result"
import { swapOrder } from "../lib/order-swap"
import { getAdminCategories } from "../lib/queries"
import { revalidatePublicCatalog } from "../lib/revalidate"
import { withAdmin } from "../lib/with-admin"

// RF-9 (admin-panel.md): swap display_order with the adjacent category
// (global order, not scoped to a parent — categories have no parent).
// swapOrder() is pure; this action just applies whatever updates it
// computes from the current, already-ordered list.
export async function reorderCategory(
  id: string,
  direction: "up" | "down",
): Promise<ActionResult> {
  return withAdmin(async () => {
    const categories = await getAdminCategories()
    const updates = swapOrder(categories, id, direction)

    if (updates.length === 0) {
      return ok(undefined)
    }

    const admin = createAdminClient()

    for (const update of updates) {
      const { error } = await admin
        .from("categories")
        .update({
          display_order: update.display_order,
          updated_at: new Date().toISOString(),
        })
        .eq("id", update.id)

      if (error) {
        return fail("No se pudo reordenar la categoría. Intenta de nuevo.")
      }
    }

    revalidatePublicCatalog()

    return ok(undefined)
  })
}
