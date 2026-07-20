"use server"

import "server-only"

import { redirect } from "next/navigation"

import { createAdminClient } from "@/lib/supabase/admin"

import type { ActionResult } from "../lib/action-result"
import { fail, ok } from "../lib/action-result"
import { resolveUniqueSlug } from "../lib/resolve-unique-slug"
import { revalidatePublicCatalog } from "../lib/revalidate"
import { slugify } from "../lib/slugify"
import { withAdmin } from "../lib/with-admin"

type CreateCategoryData = { id: string }

// RF-3 (admin-panel.md): create a category. Slug is auto-derived from name
// when left empty, or re-slugified + de-duplicated when provided (RF-3,
// "Generación de slug").
export async function createCategory(
  prevState: ActionResult<CreateCategoryData> | null,
  formData: FormData,
): Promise<ActionResult<CreateCategoryData>> {
  const result = await withAdmin<CreateCategoryData>(async () => {
    const name = formData.get("name")
    const slugInput = formData.get("slug")
    const description = formData.get("description")

    if (typeof name !== "string" || name.trim() === "") {
      return fail<CreateCategoryData>("El nombre es obligatorio", {
        name: "El nombre es obligatorio",
      })
    }

    const base = slugify(
      typeof slugInput === "string" && slugInput.trim() !== ""
        ? slugInput
        : name,
    )

    const admin = createAdminClient()
    const slug = await resolveUniqueSlug(admin, "categories", base)

    const { data, error } = await admin
      .from("categories")
      .insert({
        name: name.trim(),
        slug,
        description:
          typeof description === "string" && description.trim() !== ""
            ? description.trim()
            : null,
      })
      .select("id")
      .single()

    if (error || !data) {
      return fail<CreateCategoryData>(
        "No se pudo crear la categoría. Intenta de nuevo.",
      )
    }

    revalidatePublicCatalog()

    return ok<CreateCategoryData>({ id: data.id }, "Categoría creada")
  })

  // redirect() throws internally (NEXT_REDIRECT) — it must stay OUTSIDE any
  // try/catch or it gets swallowed as a regular error instead of performing
  // the navigation. withAdmin()'s own try/catch only wraps requireAdmin(),
  // so this call site outside it is the safe place.
  if (result.status === "success" && result.data) {
    redirect(`/admin/categorias/${result.data.id}`)
  }

  return result
}
