"use client"

import { Button } from "@/components/ui/button"
import { isPurchasable } from "@/features/catalog/lib/availability"
import type { ProductAvailability } from "@/types/database"

import { useCart } from "./cart-provider"

type AddToCartButtonProps = {
  productId: string
  slug: string
  name: string
  price: number
  availability: ProductAvailability
}

// Feedback stays purely tactile (press scale) on purpose: a success-style
// label would be a false confirmation on top of the real one — the header
// badge incrementing is the visible confirmation that the item was added.
// prefers-reduced-motion disables the scale (ADR-0007).
export function AddToCartButton({
  productId,
  slug,
  name,
  price,
  availability,
}: AddToCartButtonProps) {
  const { add } = useCart()
  const disabled = !isPurchasable(availability)

  return (
    <Button
      type="button"
      size="lg"
      disabled={disabled}
      aria-label={
        disabled
          ? `Añadir ${name} al carrito — no disponible`
          : `Añadir ${name} al carrito`
      }
      onClick={() => add({ productId, slug, name, price, availability })}
      className="min-h-11 w-full transition-transform active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100"
    >
      Añadir al carrito
    </Button>
  )
}
