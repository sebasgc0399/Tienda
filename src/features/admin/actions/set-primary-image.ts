"use server"

import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"

import type { ActionResult } from "../lib/action-result"
import { fail, ok } from "../lib/action-result"
import { revalidatePublicCatalog } from "../lib/revalidate"
import { withAdmin } from "../lib/with-admin"

// RF-6 (admin-panel.md): mark an image as the product's primary. Unset the
// current primary FIRST, then set the new one — never the reverse. The
// partial unique index one_primary_image_per_product (data-model.md,
// "Resuelta: unicidad de is_primary") rejects a second row with
// is_primary=true for the same product_id, so setting first would violate
// it while both rows are briefly true; unsetting first is the only order
// that never has two trues at once.
export async function setPrimaryImage(imageId: string): Promise<ActionResult> {
  return withAdmin(async () => {
    const admin = createAdminClient()

    const { data: image, error: fetchError } = await admin
      .from("product_images")
      .select("id, product_id")
      .eq("id", imageId)
      .maybeSingle()

    if (fetchError || !image) {
      return fail(
        "No se pudo marcar la imagen como principal. Intenta de nuevo.",
      )
    }

    const { error: unsetError } = await admin
      .from("product_images")
      .update({ is_primary: false })
      .eq("product_id", image.product_id)
      .eq("is_primary", true)

    if (unsetError) {
      return fail(
        "No se pudo marcar la imagen como principal. Intenta de nuevo.",
      )
    }

    const { error: setError } = await admin
      .from("product_images")
      .update({ is_primary: true })
      .eq("id", imageId)

    if (setError) {
      return fail(
        "No se pudo marcar la imagen como principal. Intenta de nuevo.",
      )
    }

    revalidatePublicCatalog()

    return ok(undefined, "Imagen marcada como principal")
  })
}
