"use server"

import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"

import type { ActionResult } from "../lib/action-result"
import { fail, ok } from "../lib/action-result"
import { extFromMime } from "../lib/ext-from-mime"
import { revalidatePublicCatalog } from "../lib/revalidate"
import { removeObject, uploadObject } from "../lib/storage"
import { validateImageFile } from "../lib/validate-image-file"
import { withAdmin } from "../lib/with-admin"

// RF-5 (admin-panel.md): single-file cover upload for a category. Order is
// anti-orphan on purpose (plan, "Portada de categoría"): upload the new
// object first, then point the row at it, then best-effort delete the old
// object — the row never references a missing file, even if the final
// cleanup step fails.
export async function uploadCategoryCover(
  categoryId: string,
  formData: FormData,
): Promise<ActionResult> {
  return withAdmin(async () => {
    const file = formData.get("file")

    if (!(file instanceof File) || file.size === 0) {
      return fail("Selecciona una imagen para subir")
    }

    const validation = validateImageFile(file)
    if (!validation.ok) {
      return fail(validation.message)
    }

    const admin = createAdminClient()

    const { data: existing, error: fetchError } = await admin
      .from("categories")
      .select("storage_path")
      .eq("id", categoryId)
      .maybeSingle()

    if (fetchError) {
      return fail("No se pudo cargar la categoría. Intenta de nuevo.")
    }

    const key = `categories/${categoryId}/${crypto.randomUUID()}.${extFromMime(file.type)}`

    try {
      await uploadObject(admin, key, file)
    } catch {
      return fail("No se pudo subir la imagen. Intenta de nuevo.")
    }

    const { error: updateError } = await admin
      .from("categories")
      .update({ storage_path: key, updated_at: new Date().toISOString() })
      .eq("id", categoryId)

    if (updateError) {
      // The row update failed after the object already landed in Storage:
      // clean up so it doesn't stay orphaned (admin-panel.md, "Falla de
      // subida a Storage"). Best-effort — the primary failure below is what
      // the user sees either way.
      await removeObject(admin, key).catch(() => {})
      return fail("No se pudo guardar la portada. Intenta de nuevo.")
    }

    const previousPath = existing?.storage_path
    if (previousPath) {
      await removeObject(admin, previousPath).catch(() => {})
    }

    revalidatePublicCatalog()

    return ok(undefined, "Portada actualizada")
  })
}
