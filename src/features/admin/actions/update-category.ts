"use server"

import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"

import type { ActionResult } from "../lib/action-result"
import { fail, ok } from "../lib/action-result"
import type { SlugSource } from "../lib/resolve-unique-slug"
import { resolveSlugOrError } from "../lib/resolve-unique-slug"
import { revalidatePublicCatalog } from "../lib/revalidate"
import { slugify } from "../lib/slugify"
import { withAdmin } from "../lib/with-admin"

// RF-3 (admin-panel.md): edit a category's name, slug, description and
// is_active. display_order is intentionally not handled here — it is only
// changed from the list's ▲▼ controls (reorder-category.ts).
export async function updateCategory(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  return withAdmin(async () => {
    const id = formData.get("id")
    const name = formData.get("name")
    const slugInput = formData.get("slug")
    const description = formData.get("description")
    const currentSlug = formData.get("current_slug")
    const isActive = formData.get("is_active")
    const slugSourceInput = formData.get("slugSource")
    const slugSource: SlugSource =
      slugSourceInput === "manual" ? "manual" : "auto"

    if (typeof id !== "string" || id === "") {
      return fail("No se encontró la categoría a editar")
    }

    if (typeof name !== "string" || name.trim() === "") {
      return fail("El nombre es obligatorio", {
        name: "El nombre es obligatorio",
      })
    }

    const admin = createAdminClient()

    const base = slugify(
      typeof slugInput === "string" && slugInput.trim() !== ""
        ? slugInput
        : name,
    )
    const resolution = await resolveSlugOrError(
      admin,
      "categories",
      base,
      slugSource,
      typeof currentSlug === "string" ? currentSlug : undefined,
    )

    if (!resolution.ok) {
      return fail("Ese slug ya está en uso, elige otro.", {
        slug: "Ese slug ya está en uso, elige otro.",
      })
    }

    const slug = resolution.slug

    const { error } = await admin
      .from("categories")
      .update({
        name: name.trim(),
        slug,
        description:
          typeof description === "string" && description.trim() !== ""
            ? description.trim()
            : null,
        is_active: isActive === "on",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      return fail("No se pudo guardar la categoría. Intenta de nuevo.")
    }

    revalidatePublicCatalog()

    return ok(undefined, "Categoría guardada")
  })
}
