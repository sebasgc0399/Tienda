"use server"

import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import type { ProductAvailability } from "@/types/database"

import type { ActionResult } from "../lib/action-result"
import { fail, ok } from "../lib/action-result"
import { isValidAvailability } from "../lib/availability-options"
import { revalidatePublicCatalog } from "../lib/revalidate"
import { withAdmin } from "../lib/with-admin"

// RF-8 (admin-panel.md): inline availability change from the product list
// (AvailabilitySelect). Re-validates against the enum server-side even
// though the Select only ever sends one of its own option values — this
// action is a plain exported function, callable from anywhere, not just
// that one component.
export async function setProductAvailability(
  id: string,
  availability: ProductAvailability,
): Promise<ActionResult> {
  return withAdmin(async () => {
    if (!isValidAvailability(availability)) {
      return fail("La disponibilidad no es válida")
    }

    const admin = createAdminClient()

    const { error } = await admin
      .from("products")
      .update({ availability, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (error) {
      return fail("No se pudo actualizar la disponibilidad. Intenta de nuevo.")
    }

    revalidatePublicCatalog()

    return ok(undefined)
  })
}
