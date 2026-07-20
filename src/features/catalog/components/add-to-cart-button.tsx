"use client"

import { Button } from "@/components/ui/button"
import type { ProductAvailability } from "@/types/database"

import { isPurchasable } from "../lib/availability"

type AddToCartButtonProps = {
  availability: ProductAvailability
  productName: string
}

// The cart feature doesn't exist yet — this ships the button's full visual
// contract now (plan's "Carrito sin feature cart" seam) so features/cart can
// wire the real action later without touching this component's markup.
// Feedback stays purely tactile (press scale) on purpose: a success-style
// label would be a false confirmation, since nothing is actually added yet.
// prefers-reduced-motion disables the scale (ADR-0007).
export function AddToCartButton({
  availability,
  productName,
}: AddToCartButtonProps) {
  const disabled = !isPurchasable(availability)

  return (
    <Button
      type="button"
      size="lg"
      disabled={disabled}
      aria-label={
        disabled
          ? `Añadir ${productName} al carrito — no disponible`
          : `Añadir ${productName} al carrito`
      }
      onClick={() => {
        // TODO(cart): call cart add action when features/cart lands
      }}
      className="min-h-11 w-full transition-transform active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100"
    >
      Añadir al carrito
    </Button>
  )
}
