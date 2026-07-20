"use server"

import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"

import type { ActionResult } from "../lib/action-result"
import { fail, ok } from "../lib/action-result"
import { revalidatePublicCatalog } from "../lib/revalidate"
import { withAdmin } from "../lib/with-admin"

// RF-8 (admin-panel.md): inline is_active toggle from the product list —
// both directions, reversibly, from the single Activo Switch. This is the
// only activation/deactivation path for products (admin UX audit session 2,
// finding A) — no separate destructive-with-confirmation action exists.
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
