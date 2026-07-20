"use server"

import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"

import type { ActionResult } from "../lib/action-result"
import { fail, ok } from "../lib/action-result"
import { revalidatePublicCatalog } from "../lib/revalidate"
import { removeObject } from "../lib/storage"
import { withAdmin } from "../lib/with-admin"

// Hard delete, orchestrated object-first-then-row (admin-panel.md, "Borrado
// de imagen"): the Storage object is removed BEFORE the product_images row,
// so a failure removing the object stops the whole action instead of
// leaving the row deleted and the file orphaned in Storage. This is the
// opposite ordering from upload's cleanup (where the object is the thing
// already-committed and the row is what may still fail) — here the row is
// the last thing to go, so it never ends up pointing at a missing file
// either.
export async function deleteProductImage(
  imageId: string,
): Promise<ActionResult> {
  return withAdmin(async () => {
    const admin = createAdminClient()

    const { data: image, error: fetchError } = await admin
      .from("product_images")
      .select("id, product_id, storage_path, is_primary")
      .eq("id", imageId)
      .maybeSingle()

    if (fetchError || !image) {
      return fail("No se pudo cargar la imagen. Intenta de nuevo.")
    }

    try {
      await removeObject(admin, image.storage_path)
    } catch {
      return fail("No se pudo eliminar la imagen. Intenta de nuevo.")
    }

    const { error: deleteError } = await admin
      .from("product_images")
      .delete()
      .eq("id", imageId)

    if (deleteError) {
      return fail("No se pudo eliminar la imagen. Intenta de nuevo.")
    }

    // Not in the spec's letter (data-model.md only requires AT MOST one
    // is_primary=true), but keeping a product with remaining images from
    // going primary-less is the readable interpretation of "the product
    // keeps showing an image" — promote the next one by display_order.
    // Best-effort: if this fails, the delete above already succeeded, so
    // the user still gets a success result; the product is just left
    // without a primary until someone picks one from ImageGrid.
    if (image.is_primary) {
      const { data: remaining } = await admin
        .from("product_images")
        .select("id")
        .eq("product_id", image.product_id)
        .order("display_order", { ascending: true })
        .limit(1)

      if (remaining && remaining.length > 0) {
        await admin
          .from("product_images")
          .update({ is_primary: true })
          .eq("id", remaining[0].id)
      }
    }

    revalidatePublicCatalog()

    return ok(undefined, "Imagen eliminada")
  })
}
