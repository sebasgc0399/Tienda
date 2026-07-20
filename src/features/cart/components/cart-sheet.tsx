"use client"

import { ShoppingBag } from "lucide-react"
import { useState } from "react"

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

import { cartTotal } from "../lib/cart-operations"
import type { CartItem } from "../lib/cart-types"
import { reconcileCart, type ReconcileOutcome } from "../lib/reconcile-cart"
import { fetchFreshRows } from "../lib/revalidate-cart"
import { CartItemRow } from "./cart-item-row"
import { useCart } from "./cart-provider"
import { CheckoutControl, type CheckoutPhase } from "./checkout-control"

// Pre-checkout revalidation state (docs/specs/cart-whatsapp-checkout.md,
// "Producto no disponible entre añadir y checkout"; plan decision
// "Revalidación pre-checkout"). Lives here, not in CheckoutControl, because
// both the footer control AND the item rows need the same outcomes/
// reconciled data — CheckoutControl stays presentational.
type CheckoutState = {
  phase: CheckoutPhase
  outcomes: ReconcileOutcome[] | null
  reconciled: CartItem[] | null
  hasBlocking: boolean
  reconciledFor: CartItem[] | null
}

const IDLE_CHECKOUT: CheckoutState = {
  phase: "idle",
  outcomes: null,
  reconciled: null,
  hasBlocking: false,
  reconciledFor: null,
}

export function CartSheet() {
  const { items, hydrated, totalQuantity } = useCart()
  const [checkout, setCheckout] = useState<CheckoutState>(IDLE_CHECKOUT)

  // Anti-stale guard, as pure derivation — no effect (react-hooks v7
  // hard-errors on setState-in-effect; see cart-provider.tsx for why this
  // codebase already avoids that pattern). `items` gets a fresh array
  // reference on every cart mutation (add/remove/setQuantity), so comparing
  // it against the reference a result was computed for is enough to detect
  // staleness: once it no longer matches, the result silently falls back to
  // idle without any extra bookkeeping or synchronization.
  const isCurrent = checkout.reconciledFor === items
  const phase: CheckoutPhase = isCurrent ? checkout.phase : "idle"
  const outcomes = isCurrent ? checkout.outcomes : null
  const reconciled = isCurrent ? checkout.reconciled : null
  const hasBlocking = isCurrent ? checkout.hasBlocking : false

  const reconciledByProductId = new Map(
    (reconciled ?? []).map((reconciledItem) => [
      reconciledItem.productId,
      reconciledItem,
    ]),
  )
  // Rows and the footer total both read through this map so they always
  // agree with each other: once revalidation has fresh data for an item,
  // its displayed price switches from the localStorage snapshot to the DB
  // price everywhere at once, matching the amount the WhatsApp message
  // will use once the control reaches the ready phase.
  const displayItems = items.map(
    (item) => reconciledByProductId.get(item.productId) ?? item,
  )
  const displayTotal = cartTotal(displayItems)

  async function handleCheckout() {
    const itemsAtStart = items

    setCheckout({
      phase: "revalidating",
      outcomes: null,
      reconciled: null,
      hasBlocking: false,
      reconciledFor: itemsAtStart,
    })

    try {
      const rows = await fetchFreshRows(
        itemsAtStart.map((item) => item.productId),
      )
      const result = reconcileCart(itemsAtStart, rows)

      setCheckout({
        phase: result.hasBlocking ? "idle" : "ready",
        outcomes: result.outcomes,
        reconciled: result.reconciled,
        hasBlocking: result.hasBlocking,
        reconciledFor: itemsAtStart,
      })
    } catch {
      setCheckout({
        phase: "error",
        outcomes: null,
        reconciled: null,
        hasBlocking: false,
        reconciledFor: itemsAtStart,
      })
    }
  }

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
              <CartItemRow
                key={item.productId}
                item={reconciledByProductId.get(item.productId) ?? item}
                outcome={outcomes?.find(
                  (outcome) => outcome.productId === item.productId,
                )}
              />
            ))}
          </ul>
        )}

        {items.length > 0 ? (
          <SheetFooter>
            <div className="flex items-center justify-between">
              <span className="font-medium">Total</span>
              <span className="font-medium">
                {formatCurrency(displayTotal)}
              </span>
            </div>
            <CheckoutControl
              phase={phase}
              hasBlocking={hasBlocking}
              reconciled={reconciled}
              onCheckout={handleCheckout}
            />
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
