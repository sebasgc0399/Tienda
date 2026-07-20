"use server"

import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"

import type { ActionResult } from "../lib/action-result"
import { fail, ok } from "../lib/action-result"
import { revalidatePublicCatalog } from "../lib/revalidate"
import { withAdmin } from "../lib/with-admin"

// RF-8 (admin-panel.md): inline is_active toggle from the product list —
// both directions (unlike softDeleteProduct, which only ever deactivates
// and carries its own confirmation copy). Also what ActivateProductButton
// calls to reactivate a product without a confirmation dialog, since that
// direction isn't destructive.
export async function toggleProductActive(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  return withAdmin(async () => {
    const admin = createAdminClient()

    const { error } = await admin
      .from("products")
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (error) {
      return fail("No se pudo actualizar el producto. Intenta de nuevo.")
    }

    revalidatePublicCatalog()

    return ok(undefined)
  })
}
