"use server"

import "server-only"

import { redirect } from "next/navigation"

import { createAdminClient } from "@/lib/supabase/admin"
import type { ProductAvailability } from "@/types/database"

import type { ActionResult } from "../lib/action-result"
import { fail, ok } from "../lib/action-result"
import { isValidAvailability } from "../lib/availability-options"
import { resolveUniqueSlug } from "../lib/resolve-unique-slug"
import { revalidatePublicCatalog } from "../lib/revalidate"
import { slugify } from "../lib/slugify"
import { withAdmin } from "../lib/with-admin"

type CreateProductData = { id: string }

// RF-4 (admin-panel.md): create a product. Slug pipeline mirrors
// create-category.ts; price, category_id and availability get extra
// server-side validation the category form doesn't need, since
// products.price/category_id/availability are all NOT NULL
// (data-model.md, "products").
export async function createProduct(
  prevState: ActionResult<CreateProductData> | null,
  formData: FormData,
): Promise<ActionResult<CreateProductData>> {
  const result = await withAdmin<CreateProductData>(async () => {
    const name = formData.get("name")
    const slugInput = formData.get("slug")
    const description = formData.get("description")
    const priceInput = formData.get("price")
    const categoryId = formData.get("category_id")
    const availabilityInput = formData.get("availability")
    const isFeatured = formData.get("is_featured")

    if (typeof name !== "string" || name.trim() === "") {
      return fail<CreateProductData>("El nombre es obligatorio", {
        name: "El nombre es obligatorio",
      })
    }

    if (typeof description !== "string" || description.trim() === "") {
      return fail<CreateProductData>("La descripción es obligatoria", {
        description: "La descripción es obligatoria",
      })
    }

    const price = typeof priceInput === "string" ? Number(priceInput) : NaN
    if (!Number.isInteger(price) || price <= 0) {
      return fail<CreateProductData>(
        "El precio debe ser un número entero positivo",
        { price: "El precio debe ser un número entero positivo" },
      )
    }

    if (typeof categoryId !== "string" || categoryId.trim() === "") {
      return fail<CreateProductData>("La categoría es obligatoria", {
        category_id: "La categoría es obligatoria",
      })
    }

    if (
      typeof availabilityInput !== "string" ||
      !isValidAvailability(availabilityInput)
    ) {
      return fail<CreateProductData>("La disponibilidad no es válida", {
        availability: "La disponibilidad no es válida",
      })
    }
    const availability: ProductAvailability = availabilityInput

    const admin = createAdminClient()

    // Never trust the FK to surface a readable error on its own: an
    // insert against a nonexistent category_id would bubble up as a raw
    // Postgres FK-violation message, which admin-panel.md explicitly
    // rules out ("nunca el error crudo de Postgres").
    const { data: category, error: categoryError } = await admin
      .from("categories")
      .select("id")
      .eq("id", categoryId)
      .maybeSingle()

    if (categoryError) {
      return fail<CreateProductData>(
        "No se pudo verificar la categoría. Intenta de nuevo.",
      )
    }
    if (!category) {
      return fail<CreateProductData>("La categoría seleccionada no existe", {
        category_id: "La categoría seleccionada no existe",
      })
    }

    const base = slugify(
      typeof slugInput === "string" && slugInput.trim() !== ""
        ? slugInput
        : name,
    )
    const slug = await resolveUniqueSlug(admin, "products", base)

    const { data, error } = await admin
      .from("products")
      .insert({
        name: name.trim(),
        slug,
        description: description.trim(),
        price,
        category_id: categoryId,
        availability,
        is_featured: isFeatured === "on",
      })
      .select("id")
      .single()

    if (error || !data) {
      return fail<CreateProductData>(
        "No se pudo crear el producto. Intenta de nuevo.",
      )
    }

    revalidatePublicCatalog()

    return ok<CreateProductData>({ id: data.id }, "Producto creado")
  })

  // redirect() throws internally (NEXT_REDIRECT) — it must stay OUTSIDE any
  // try/catch or it gets swallowed as a regular error instead of performing
  // the navigation. withAdmin()'s own try/catch only wraps requireAdmin(),
  // so this call site outside it is the safe place (see create-category.ts).
  if (result.status === "success" && result.data) {
    redirect(`/admin/productos/${result.data.id}`)
  }

  return result
}
