"use server"

import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"

import type { ActionResult } from "../lib/action-result"
import { fail, ok } from "../lib/action-result"
import { swapOrder } from "../lib/order-swap"
import { revalidatePublicCatalog } from "../lib/revalidate"
import { withAdmin } from "../lib/with-admin"

// RF-9 (admin-panel.md): swap display_order with the adjacent product
// WITHIN THE SAME CATEGORY (data-model.md, products.display_order is only
// meaningful inside its own category) — unlike reorder-category.ts, this
// needs the product's own siblings, not the full admin list, so it looks
// up category_id first and scopes the sibling query to it.
export async function reorderProduct(
  id: string,
  direction: "up" | "down",
): Promise<ActionResult> {
  return withAdmin(async () => {
    const admin = createAdminClient()

    const { data: product, error: productError } = await admin
      .from("products")
      .select("category_id")
      .eq("id", id)
      .maybeSingle()

    if (productError || !product) {
      return fail("No se pudo reordenar el producto. Intenta de nuevo.")
    }

    const { data: siblings, error: siblingsError } = await admin
      .from("products")
      .select("id, display_order")
      .eq("category_id", product.category_id)
      .order("display_order", { ascending: true })

    if (siblingsError) {
      return fail("No se pudo reordenar el producto. Intenta de nuevo.")
    }

    const updates = swapOrder(siblings ?? [], id, direction)

    if (updates.length === 0) {
      return ok(undefined)
    }

    for (const update of updates) {
      const { error } = await admin
        .from("products")
        .update({
          display_order: update.display_order,
          updated_at: new Date().toISOString(),
        })
        .eq("id", update.id)

      if (error) {
        return fail("No se pudo reordenar el producto. Intenta de nuevo.")
      }
    }

    revalidatePublicCatalog()

    return ok(undefined)
  })
}
