"use client"

import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"

import { softDeleteProduct } from "../actions/soft-delete-product"
import { DeleteDialog } from "./delete-dialog"

type ProductDeleteDialogProps = {
  productId: string
  productName: string
}

// RF-10 (admin-panel.md): confirmation before the only destructive action
// products expose — desactivar (soft-delete; "Borrado de producto" edge
// case rules out a physical delete in v1). Simpler than
// CategoryDeleteDialog: there is no FK-blocked path or reassignment flow
// for products, so there is only one confirm button.
export function ProductDeleteDialog({
  productId,
  productName,
}: ProductDeleteDialogProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleDeactivate() {
    setError(null)
    startTransition(async () => {
      const result = await softDeleteProduct(productId)
      if (result.status === "success") {
        setOpen(false)
      } else {
        setError(result.message)
      }
    })
  }

  return (
    <DeleteDialog
      open={open}
      onOpenChange={setOpen}
      trigger={<Button variant="destructive" size="sm" />}
      triggerLabel="Desactivar"
      title={`Desactivar "${productName}"`}
      description="El producto se desactivará y dejará de mostrarse en el catálogo. No se elimina."
      actions={
        <Button
          type="button"
          variant="destructive"
          disabled={pending}
          onClick={handleDeactivate}
        >
          Desactivar
        </Button>
      }
    >
      {error ? (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
    </DeleteDialog>
  )
}
