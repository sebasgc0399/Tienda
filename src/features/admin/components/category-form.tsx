"use client"

import { useActionState, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import type { Category } from "@/types/database"

import { createCategory } from "../actions/create-category"
import { updateCategory } from "../actions/update-category"
import type { ActionResult } from "../lib/action-result"
import { slugify } from "../lib/slugify"
import { FieldError } from "./field-error"
import { FormAlert } from "./form-alert"

type CategoryFormProps =
  { mode: "create" } | { mode: "edit"; category: Category }

const SLUG_CHANGE_WARNING =
  "Cambiar el enlace romperá los links de WhatsApp ya compartidos. ¿Continuar?"

// Adapters give useActionState a single, consistent action signature
// regardless of mode: createCategory returns ActionResult<{ id }> (used for
// the post-create redirect server-side), updateCategory returns plain
// ActionResult — this component only ever reads status/message/fieldErrors,
// so both are normalized to ActionResult here.
async function submitCreate(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const result = await createCategory(null, formData)
  // Narrow ActionResult<{ id }> down to plain ActionResult: the `id` is
  // only needed server-side for the post-create redirect (create-category.ts),
  // this component never reads response data.
  if (result.status === "success") {
    return { status: "success", message: result.message }
  }
  return result
}

async function submitUpdate(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  return updateCategory(prevState, formData)
}

// RF-3 (admin-panel.md): create/edit form for a category. Slug stays
// editable and pre-loaded; changing it on an already-published category
// asks for explicit confirmation before submitting (RF-3, "Generación de
// slug") since it breaks previously shared WhatsApp links.
export function CategoryForm(props: CategoryFormProps) {
  const isEdit = props.mode === "edit"
  const originalSlug = isEdit ? props.category.slug : null

  const [state, formAction, pending] = useActionState(
    isEdit ? submitUpdate : submitCreate,
    null,
  )

  const [slug, setSlug] = useState(isEdit ? props.category.slug : "")
  const [slugTouched, setSlugTouched] = useState(false)
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null)

  const fieldErrors = state?.status === "error" ? state.fieldErrors : undefined

  // Auto-vs-manual for the slug pipeline (admin-panel.md, "Generación de
  // slug"): create mode is manual once the owner has typed into the slug
  // field herself (slugTouched); edit mode is manual only once the
  // (re-slugified) value actually diverges from the slug it was pre-loaded
  // with — an unchanged slug is a no-op regardless of source, so it is safe
  // to keep tagging it "auto". Derived directly from render state, no effect
  // needed.
  const slugSource: "auto" | "manual" = isEdit
    ? slugify(slug) !== originalSlug
      ? "manual"
      : "auto"
    : slugTouched
      ? "manual"
      : "auto"

  function handleNameBlur(event: React.FocusEvent<HTMLInputElement>) {
    if (isEdit || slugTouched) {
      return
    }
    setSlug(slugify(event.target.value))
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (!isEdit || !originalSlug) {
      return
    }

    const formData = new FormData(event.currentTarget)
    const nextSlug = slugify(String(formData.get("slug") ?? ""))

    if (nextSlug !== originalSlug) {
      event.preventDefault()
      setPendingFormData(formData)
    }
  }

  function confirmSlugChange() {
    if (pendingFormData) {
      formAction(pendingFormData)
    }
    setPendingFormData(null)
  }

  return (
    <>
      <form
        action={formAction}
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
        {isEdit ? (
          <input type="hidden" name="id" value={props.category.id} />
        ) : null}
        {isEdit ? (
          <input type="hidden" name="current_slug" value={originalSlug ?? ""} />
        ) : null}
        <input type="hidden" name="slugSource" value={slugSource} />

        <FormAlert state={state} />

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            name="name"
            defaultValue={isEdit ? props.category.name : ""}
            onBlur={handleNameBlur}
            aria-invalid={Boolean(fieldErrors?.name)}
          />
          <FieldError message={fieldErrors?.name} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            name="slug"
            value={slug}
            onChange={(event) => {
              setSlugTouched(true)
              setSlug(event.target.value)
            }}
            aria-invalid={Boolean(fieldErrors?.slug)}
          />
          <FieldError message={fieldErrors?.slug} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={isEdit ? (props.category.description ?? "") : ""}
          />
          <FieldError message={fieldErrors?.description} />
        </div>

        {isEdit ? (
          <div className="flex items-center gap-2.5">
            <Switch
              id="is_active"
              name="is_active"
              defaultChecked={props.category.is_active}
            />
            <Label htmlFor="is_active">Activa</Label>
          </div>
        ) : null}

        <Button type="submit" disabled={pending} className="w-fit">
          {isEdit ? "Guardar" : "Crear categoría"}
        </Button>
      </form>

      <Dialog
        open={pendingFormData !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingFormData(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar el enlace</DialogTitle>
            <DialogDescription>{SLUG_CHANGE_WARNING}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancelar
            </DialogClose>
            <Button variant="destructive" onClick={confirmSlugChange}>
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
