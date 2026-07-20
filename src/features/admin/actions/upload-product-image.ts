"use server"

import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import type { ProductImage } from "@/types/database"

import type { ActionResult } from "../lib/action-result"
import { fail, ok } from "../lib/action-result"
import { extFromMime } from "../lib/ext-from-mime"
import { revalidatePublicCatalog } from "../lib/revalidate"
import { removeObject, uploadObject } from "../lib/storage"
import { validateImageFile } from "../lib/validate-image-file"
import { withAdmin } from "../lib/with-admin"

// RF-5 (admin-panel.md): one file per action call — image-uploader.tsx
// calls this once per selected file, sequentially, so a failure mid-batch
// is scoped to that one file (plan, "Subida de imágenes"). Order is
// anti-orphan: Storage object first, then the product_images row; if the
// row insert fails, the already-uploaded object is removed so nothing in
// Storage is left unreferenced (admin-panel.md, "Falla de subida a
// Storage").
export async function uploadProductImage(
  productId: string,
  formData: FormData,
): Promise<ActionResult<ProductImage>> {
  return withAdmin(async () => {
    const file = formData.get("file")

    if (!(file instanceof File) || file.size === 0) {
      return fail<ProductImage>("Selecciona una imagen para subir")
    }

    const validation = validateImageFile(file)
    if (!validation.ok) {
      return fail<ProductImage>(validation.message)
    }

    const altTextInput = formData.get("alt_text")
    const altText =
      typeof altTextInput === "string" && altTextInput.trim() !== ""
        ? altTextInput.trim()
        : null

    const admin = createAdminClient()

    const { data: product, error: productError } = await admin
      .from("products")
      .select("id")
      .eq("id", productId)
      .maybeSingle()

    if (productError || !product) {
      return fail<ProductImage>(
        "No se pudo subir la imagen: el producto no existe.",
      )
    }

    // Needed to decide is_primary (first image for this product becomes
    // primary automatically) and the next display_order (appended to the
    // end of the gallery) — data-model.md, product_images.display_order.
    const { data: existingImages, error: existingError } = await admin
      .from("product_images")
      .select("display_order")
      .eq("product_id", productId)

    if (existingError) {
      return fail<ProductImage>("No se pudo subir la imagen. Intenta de nuevo.")
    }

    const isFirstImage = (existingImages?.length ?? 0) === 0
    const nextDisplayOrder = existingImages?.length
      ? Math.max(...existingImages.map((image) => image.display_order)) + 1
      : 0

    const key = `${productId}/${crypto.randomUUID()}.${extFromMime(file.type)}`

    try {
      await uploadObject(admin, key, file)
    } catch {
      return fail<ProductImage>("No se pudo subir la imagen. Intenta de nuevo.")
    }

    const { data: inserted, error: insertError } = await admin
      .from("product_images")
      .insert({
        product_id: productId,
        storage_path: key,
        alt_text: altText,
        is_primary: isFirstImage,
        display_order: nextDisplayOrder,
      })
      .select("*")
      .single()

    if (insertError || !inserted) {
      // The object already landed in Storage but the row failed: clean up
      // so it doesn't stay orphaned (same anti-orphan rule as
      // upload-category-cover.ts). Best-effort — the failure below is what
      // the user sees either way.
      await removeObject(admin, key).catch(() => {})
      return fail<ProductImage>(
        "No se pudo guardar la imagen. Intenta de nuevo.",
      )
    }

    revalidatePublicCatalog()

    return ok<ProductImage>(inserted, "Imagen subida")
  })
}
