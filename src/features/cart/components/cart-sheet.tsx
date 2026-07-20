"use client"

import { ShoppingBag } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { formatCurrency } from "@/lib/format-currency"

import { CartItemRow } from "./cart-item-row"
import { useCart } from "./cart-provider"

export function CartSheet() {
  const { items, hydrated, totalQuantity, total } = useCart()

  // The badge (and the count in the trigger's aria-label) only reflects the
  // real cart after hydration — the server render and first client render
  // always start from an empty cart, so there is nothing to gate there.
  const showBadge = hydrated && totalQuantity > 0
  const triggerLabel =
    totalQuantity > 0 ? `Carrito, ${totalQuantity} productos` : "Carrito"

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={triggerLabel}
            className="relative size-11"
          />
        }
      >
        <ShoppingBag aria-hidden="true" />
        {showBadge ? (
          <span className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 grid h-5 min-w-5 place-items-center rounded-full px-1 text-xs">
            {totalQuantity}
          </span>
        ) : null}
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Tu carrito</SheetTitle>
        </SheetHeader>

        {!hydrated ? null : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-1 px-4 text-center">
            <p className="font-medium">Tu carrito está vacío</p>
            <p className="text-muted-foreground text-sm">
              Agrega productos desde el catálogo.
            </p>
          </div>
        ) : (
          <ul className="flex-1 divide-y overflow-y-auto px-4">
            {items.map((item) => (
              <CartItemRow key={item.productId} item={item} />
            ))}
          </ul>
        )}

        {items.length > 0 ? (
          <SheetFooter>
            <div className="flex items-center justify-between">
              <span className="font-medium">Total</span>
              <span className="font-medium">{formatCurrency(total)}</span>
            </div>
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
