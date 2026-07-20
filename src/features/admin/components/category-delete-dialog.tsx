"use client"

import { Trash2Icon } from "lucide-react"
import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Category } from "@/types/database"

import { deleteCategory } from "../actions/delete-category"
import { reassignCategoryProducts } from "../actions/reassign-category-products"
import { toggleCategoryActive } from "../actions/toggle-category-active"
import { DeleteDialog } from "./delete-dialog"

type CategoryDeleteDialogProps = {
  category: Pick<Category, "id" | "name">
  productCount: number
  otherCategories: Pick<Category, "id" | "name">[]
}

// Composes the generic DeleteDialog shell with the category-specific
// resolution paths from admin-panel.md ("Eliminar categoría con productos
// asociados"): "Desactivar" is always offered as the safe default;
// deleting outright only works with zero products, otherwise the products
// must be reassigned first — done here as one user action that runs both
// mutations in sequence, surfacing whichever step fails.
export function CategoryDeleteDialog({
  category,
  productCount,
  otherCategories,
}: CategoryDeleteDialogProps) {
  const [open, setOpen] = useState(false)
  const [targetId, setTargetId] = useState<string | null>(
    otherCategories[0]?.id ?? null,
  )
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const canReassign = otherCategories.length > 0

  function handleDeactivate() {
    setError(null)
    startTransition(async () => {
      const result = await toggleCategoryActive(category.id, false)
      if (result.status === "success") {
        setOpen(false)
      } else {
        setError(result.message)
      }
    })
  }

  function handleDelete() {
    setError(null)
    startTransition(async () => {
      const result = await deleteCategory(category.id)
      if (result.status === "success") {
        setOpen(false)
      } else {
        setError(result.message)
      }
    })
  }

  function handleReassignAndDelete() {
    if (!targetId) {
      return
    }
    setError(null)
    startTransition(async () => {
      const reassigned = await reassignCategoryProducts(category.id, targetId)
      if (reassigned.status !== "success") {
        setError(reassigned.message)
        return
      }
      const deleted = await deleteCategory(category.id)
      if (deleted.status === "success") {
        setOpen(false)
      } else {
        setError(deleted.message)
      }
    })
  }

  return (
    <DeleteDialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-destructive hover:text-destructive"
          aria-label={`Eliminar ${category.name}`}
        />
      }
      triggerLabel={<Trash2Icon aria-hidden="true" />}
      title={`Eliminar "${category.name}"`}
      description={
        productCount > 0
          ? `Esta categoría todavía tiene ${productCount} producto(s). Desactívala, o reasigna sus productos a otra categoría antes de eliminarla.`
          : "Esta acción no se puede deshacer."
      }
      actions={
        <>
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={handleDeactivate}
          >
            Desactivar
          </Button>
          {productCount > 0 ? (
            <Button
              type="button"
              variant="destructive"
              disabled={pending || !canReassign || !targetId}
              onClick={handleReassignAndDelete}
            >
              Reasignar y eliminar
            </Button>
          ) : (
            <Button
              type="button"
              variant="destructive"
              disabled={pending}
              onClick={handleDelete}
            >
              Eliminar
            </Button>
          )}
        </>
      }
    >
      {productCount > 0 && canReassign ? (
        <Select
          items={otherCategories.map((option) => ({
            value: option.id,
            label: option.name,
          }))}
          value={targetId ?? undefined}
          onValueChange={(value) => setTargetId(value as string)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Elige una categoría" />
          </SelectTrigger>
          <SelectContent>
            {otherCategories.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
      {productCount > 0 && !canReassign ? (
        <p className="text-muted-foreground text-sm">
          No hay otra categoría para reasignar los productos. Desactívala en su
          lugar.
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
    </DeleteDialog>
  )
}
