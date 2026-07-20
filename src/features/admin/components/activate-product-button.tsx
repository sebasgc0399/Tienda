"use client"

import { useTransition } from "react"

import { Button } from "@/components/ui/button"

import { toggleProductActive } from "../actions/toggle-product-active"

type ActivateProductButtonProps = {
  id: string
}

// Non-destructive counterpart to ProductDeleteDialog's "Desactivar" — shown
// in its place once a product is already inactive. Reactivating needs no
// confirmation, so this skips the Dialog and calls toggleProductActive
// directly, same useTransition pattern as InlineToggle.
export function ActivateProductButton({ id }: ActivateProductButtonProps) {
  const [pending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      await toggleProductActive(id, true)
    })
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={handleClick}
    >
      Activar
    </Button>
  )
}
