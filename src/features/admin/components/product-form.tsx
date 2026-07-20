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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import type { Product } from "@/types/database"

import { createProduct } from "../actions/create-product"
import { updateProduct } from "../actions/update-product"
import type { ActionResult } from "../lib/action-result"
import { AVAILABILITY_OPTIONS } from "../lib/availability-options"
import { slugify } from "../lib/slugify"
import type { CategoryOption } from "../types"
import { FieldError } from "./field-error"
import { FormAlert } from "./form-alert"

type ProductFormProps =
  | { mode: "create"; categories: CategoryOption[] }
  | { mode: "edit"; product: Product; categories: CategoryOption[] }

const SLUG_CHANGE_WARNING =
  "Cambiar el enlace romperá los links de WhatsApp ya compartidos. ¿Continuar?"

// Adapters give useActionState a single, consistent action signature
// regardless of mode — same reasoning as CategoryForm's submitCreate/
// submitUpdate (see its doc comment).
async function submitCreate(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const result = await createProduct(null, formData)
  if (result.status === "success") {
    return { status: "success", message: result.message }
  }
  return result
}

async function submitUpdate(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  return updateProduct(prevState, formData)
}

// RF-4 (admin-panel.md): create/edit form for a product. Slug behavior
// (pre-fill, editable, confirm Dialog on change) mirrors CategoryForm;
// price, category and availability are the fields data-model.md's
// "products" table adds on top of what categories need.
export function ProductForm(props: ProductFormProps) {
  const isEdit = props.mode === "edit"
  const originalSlug = isEdit ? props.product.slug : null

  const [state, formAction, pending] = useActionState(
    isEdit ? submitUpdate : submitCreate,
    null,
  )

  const [slug, setSlug] = useState(isEdit ? props.product.slug : "")
  const [slugTouched, setSlugTouched] = useState(false)
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null)

  const fieldErrors = state?.status === "error" ? state.fieldErrors : undefined

  // Auto-vs-manual for the slug pipeline (admin-panel.md, "Generación de
  // slug") — same rule as CategoryForm (see its doc comment): create mode is
  // manual once the owner has typed into the slug field herself
  // (slugTouched); edit mode is manual only once the (re-slugified) value
  // actually diverges from the slug it was pre-loaded with. Derived directly
  // from render state, no effect needed.
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
          <input type="hidden" name="id" value={props.product.id} />
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
            defaultValue={isEdit ? props.product.name : ""}
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
            defaultValue={isEdit ? props.product.description : ""}
            aria-invalid={Boolean(fieldErrors?.description)}
          />
          <FieldError message={fieldErrors?.description} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="price">Precio</Label>
          <Input
            id="price"
            name="price"
            type="number"
            inputMode="numeric"
            step={1}
            min={1}
            defaultValue={isEdit ? props.product.price : undefined}
            aria-invalid={Boolean(fieldErrors?.price)}
          />
          <p className="text-muted-foreground text-xs">
            En pesos, sin decimales. Ej: 65000
          </p>
          <FieldError message={fieldErrors?.price} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="category_id">Categoría</Label>
          <Select
            name="category_id"
            items={props.categories.map((category) => ({
              value: category.id,
              label: category.name,
            }))}
            defaultValue={isEdit ? props.product.category_id : undefined}
            required
          >
            <SelectTrigger id="category_id" className="w-full">
              <SelectValue placeholder="Elige una categoría" />
            </SelectTrigger>
            <SelectContent>
              {props.categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError message={fieldErrors?.category_id} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="availability">Disponibilidad</Label>
          <Select
            name="availability"
            items={AVAILABILITY_OPTIONS}
            defaultValue={isEdit ? props.product.availability : "in_stock"}
            required
          >
            <SelectTrigger id="availability" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AVAILABILITY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError message={fieldErrors?.availability} />
        </div>

        <div className="flex items-center gap-2.5">
          <Switch
            id="is_featured"
            name="is_featured"
            defaultChecked={isEdit ? props.product.is_featured : false}
          />
          <Label htmlFor="is_featured">Destacado</Label>
        </div>

        {isEdit ? (
          <div className="flex items-center gap-2.5">
            <Switch
              id="is_active"
              name="is_active"
              defaultChecked={props.product.is_active}
            />
            <Label htmlFor="is_active">Activo</Label>
          </div>
        ) : null}

        <Button type="submit" disabled={pending} className="w-fit">
          {isEdit ? "Guardar" : "Crear producto"}
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
