"use server"

import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"

import type { ActionResult } from "../lib/action-result"
import { fail, ok } from "../lib/action-result"
import { revalidatePublicCatalog } from "../lib/revalidate"
import { withAdmin } from "../lib/with-admin"

// Soft-delete only (admin-panel.md, "Borrado de producto"): sets
// is_active=false, never a physical DELETE. This is the confirmed,
// one-way action behind ProductDeleteDialog's "Desactivar" — the inline
// Switch (toggle-product-active.ts) stays available for both directions.
export async function softDeleteProduct(id: string): Promise<ActionResult> {
  return withAdmin(async () => {
    const admin = createAdminClient()

    const { error } = await admin
      .from("products")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (error) {
      return fail("No se pudo desactivar el producto. Intenta de nuevo.")
    }

    revalidatePublicCatalog()

    return ok(undefined, "Producto desactivado")
  })
}
