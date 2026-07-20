"use server"

import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"

import type { ActionResult } from "../lib/action-result"
import { fail, ok } from "../lib/action-result"
import { swapOrder } from "../lib/order-swap"
import { revalidatePublicCatalog } from "../lib/revalidate"
import { withAdmin } from "../lib/with-admin"

// RF-7 (admin-panel.md): swap display_order with the adjacent image WITHIN
// THE SAME PRODUCT's gallery — mirrors reorder-product.ts, scoped to
// product_images by product_id instead of products by category_id.
export async function reorderProductImage(
  imageId: string,
  direction: "up" | "down",
): Promise<ActionResult> {
  return withAdmin(async () => {
    const admin = createAdminClient()

    const { data: image, error: imageError } = await admin
      .from("product_images")
      .select("product_id")
      .eq("id", imageId)
      .maybeSingle()

    if (imageError || !image) {
      return fail("No se pudo reordenar la imagen. Intenta de nuevo.")
    }

    const { data: siblings, error: siblingsError } = await admin
      .from("product_images")
      .select("id, display_order")
      .eq("product_id", image.product_id)
      .order("display_order", { ascending: true })

    if (siblingsError) {
      return fail("No se pudo reordenar la imagen. Intenta de nuevo.")
    }

    const updates = swapOrder(siblings ?? [], imageId, direction)

    if (updates.length === 0) {
      return ok(undefined)
    }

    for (const update of updates) {
      const { error } = await admin
        .from("product_images")
        .update({ display_order: update.display_order })
        .eq("id", update.id)

      if (error) {
        return fail("No se pudo reordenar la imagen. Intenta de nuevo.")
      }
    }

    revalidatePublicCatalog()

    return ok(undefined)
  })
}
