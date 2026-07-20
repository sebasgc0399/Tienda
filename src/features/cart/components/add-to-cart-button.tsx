"use client"

import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { isPurchasable } from "@/features/catalog/lib/availability"
import type { ProductImageRef } from "@/features/catalog/types"
import type { ProductAvailability } from "@/types/database"

import { useCart } from "./cart-provider"

const ADDED_FEEDBACK_MS = 1500

type AddToCartButtonProps = {
  productId: string
  slug: string
  name: string
  price: number
  availability: ProductAvailability
  image: ProductImageRef | null
}

// Feedback per ADR-0007 ("etiqueta + escala breve"): the press scale plus a
// transient "Añadido" label that reverts on its own — confirmation happens
// right where the user tapped, on top of the header badge incrementing.
// The label state is set from the click handler (and its scheduled timeout),
// never from an effect; the only effect below is unmount cleanup.
// prefers-reduced-motion disables the scale (ADR-0007).
export function AddToCartButton({
  productId,
  slug,
  name,
  price,
  availability,
  image,
}: AddToCartButtonProps) {
  const { add } = useCart()
  const [added, setAdded] = useState(false)
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const disabled = !isPurchasable(availability)

  useEffect(() => {
    return () => {
      if (resetTimer.current) {
        clearTimeout(resetTimer.current)
      }
    }
  }, [])

  function handleClick() {
    add({ productId, slug, name, price, availability, image })
    setAdded(true)
    if (resetTimer.current) {
      clearTimeout(resetTimer.current)
    }
    resetTimer.current = setTimeout(() => setAdded(false), ADDED_FEEDBACK_MS)
  }

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
      onClick={handleClick}
      className="min-h-11 w-full transition-transform active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100"
    >
      <span aria-live="polite">
        {added ? "Añadido ✓" : "Añadir al carrito"}
      </span>
    </Button>
  )
}
