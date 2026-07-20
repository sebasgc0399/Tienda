"use server"

import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import type { ProductAvailability } from "@/types/database"

import type { ActionResult } from "../lib/action-result"
import { fail, ok } from "../lib/action-result"
import { isValidAvailability } from "../lib/availability-options"
import type { SlugSource } from "../lib/resolve-unique-slug"
import { resolveSlugOrError } from "../lib/resolve-unique-slug"
import { revalidatePublicCatalog } from "../lib/revalidate"
import { slugify } from "../lib/slugify"
import { withAdmin } from "../lib/with-admin"

// RF-4 (admin-panel.md): edit a product's fields. display_order is
// intentionally not handled here — it is only changed from the list's ▲▼
// controls (reorder-product.ts), same split as update-category.ts.
export async function updateProduct(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  return withAdmin(async () => {
    const id = formData.get("id")
    const name = formData.get("name")
    const slugInput = formData.get("slug")
    const description = formData.get("description")
    const currentSlug = formData.get("current_slug")
    const priceInput = formData.get("price")
    const categoryId = formData.get("category_id")
    const availabilityInput = formData.get("availability")
    const isFeatured = formData.get("is_featured")
    const isActive = formData.get("is_active")
    const slugSourceInput = formData.get("slugSource")
    const slugSource: SlugSource =
      slugSourceInput === "manual" ? "manual" : "auto"

    if (typeof id !== "string" || id === "") {
      return fail("No se encontró el producto a editar")
    }

    if (typeof name !== "string" || name.trim() === "") {
      return fail("El nombre es obligatorio", {
        name: "El nombre es obligatorio",
      })
    }

    if (typeof description !== "string" || description.trim() === "") {
      return fail("La descripción es obligatoria", {
        description: "La descripción es obligatoria",
      })
    }

    const price = typeof priceInput === "string" ? Number(priceInput) : NaN
    if (!Number.isInteger(price) || price <= 0) {
      return fail("El precio debe ser un número entero positivo", {
        price: "El precio debe ser un número entero positivo",
      })
    }

    if (typeof categoryId !== "string" || categoryId.trim() === "") {
      return fail("La categoría es obligatoria", {
        category_id: "La categoría es obligatoria",
      })
    }

    if (
      typeof availabilityInput !== "string" ||
      !isValidAvailability(availabilityInput)
    ) {
      return fail("La disponibilidad no es válida", {
        availability: "La disponibilidad no es válida",
      })
    }
    const availability: ProductAvailability = availabilityInput

    const admin = createAdminClient()

    // Same readable-error guard as create-product.ts: never let a bad
    // category_id surface as a raw Postgres FK-violation message.
    const { data: category, error: categoryError } = await admin
      .from("categories")
      .select("id")
      .eq("id", categoryId)
      .maybeSingle()

    if (categoryError) {
      return fail("No se pudo verificar la categoría. Intenta de nuevo.")
    }
    if (!category) {
      return fail("La categoría seleccionada no existe", {
        category_id: "La categoría seleccionada no existe",
      })
    }

    const base = slugify(
      typeof slugInput === "string" && slugInput.trim() !== ""
        ? slugInput
        : name,
    )
    const resolution = await resolveSlugOrError(
      admin,
      "products",
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
      .from("products")
      .update({
        name: name.trim(),
        slug,
        description: description.trim(),
        price,
        category_id: categoryId,
        availability,
        is_featured: isFeatured === "on",
        is_active: isActive === "on",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      return fail("No se pudo guardar el producto. Intenta de nuevo.")
    }

    revalidatePublicCatalog()

    return ok(undefined, "Producto guardado")
  })
}
