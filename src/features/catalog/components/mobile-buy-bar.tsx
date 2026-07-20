"use client"

import { useEffect, useRef, useState } from "react"

import { formatCurrency } from "@/lib/format-currency"
import { cn } from "@/lib/utils"
import type { ProductAvailability } from "@/types/database"

import { AddToCartButton } from "./add-to-cart-button"

type MobileBuyBarProps = {
  name: string
  price: number
  availability: ProductAvailability
  children: React.ReactNode
}

// Wraps the in-flow buy-box (children) with a sentinel that an
// IntersectionObserver watches: when that sentinel scrolls out of view, this
// fixed bar re-exposes the "Añadir al carrito" CTA on mobile
// (docs/specs/design-system.md, PDP > Buy-bar mobile). Starts hidden so
// there's no flash before the sentinel's real position is known. Animates
// only transform/opacity — never height/top — to avoid layout shift.
export function MobileBuyBar({
  name,
  price,
  availability,
  children,
}: MobileBuyBarProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) {
      return
    }

    const observer = new IntersectionObserver(([entry]) => {
      setVisible(!entry.isIntersecting)
    })

    observer.observe(sentinel)

    return () => observer.disconnect()
  }, [])

  return (
    <>
      <div ref={sentinelRef}>{children}</div>

      <div
        aria-hidden={!visible}
        className={cn(
          "bg-background border-border fixed inset-x-0 bottom-0 z-30 border-t px-4 py-3 pb-[env(safe-area-inset-bottom)] transition-[transform,opacity] duration-200 ease-out motion-reduce:transition-none lg:hidden",
          visible
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-full opacity-0",
        )}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <span className="text-lg font-semibold">{formatCurrency(price)}</span>
          <div className="w-40">
            <AddToCartButton availability={availability} productName={name} />
          </div>
        </div>
      </div>
    </>
  )
}
