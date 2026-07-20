"use client"

import { Minus, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ProductImage } from "@/features/catalog/components/product-image"
import { formatCurrency } from "@/lib/format-currency"
import { cn } from "@/lib/utils"

import { itemSubtotal } from "../lib/cart-operations"
import type { CartItem } from "../lib/cart-types"
import type { ReconcileOutcome, ReconcileStatus } from "../lib/reconcile-cart"
import { useCart } from "./cart-provider"

type CartItemRowProps = {
  item: CartItem
  outcome?: ReconcileOutcome
}

// Blocking flags require the item to be removed before checkout can
// proceed (docs/specs/cart-whatsapp-checkout.md, "Producto no disponible
// entre añadir y checkout"); the other two are informational only.
const BLOCKING_STATUSES = new Set<ReconcileStatus>(["out_of_stock", "removed"])

const FLAG_COPY: Record<
  Exclude<ReconcileStatus, "unchanged" | "availability_changed">,
  string
> = {
  price_changed: "Precio actualizado",
  out_of_stock: "Agotado",
  removed: "Ya no está disponible",
}

// "availability_changed" fires for BOTH directions (in_stock -> made_to_order
// and back), so its copy must depend on the item's FRESH availability
// instead of assuming one direction. `item` here is already the reconciled
// row when an outcome exists (see cart-sheet.tsx), so item.availability is
// up to date. out_of_stock never reaches this map: reconcileCart reports
// that case as its own "out_of_stock" status before it ever checks for an
// availability change.
const AVAILABILITY_FLAG_COPY: Partial<
  Record<CartItem["availability"], string>
> = {
  made_to_order: "Ahora es sobre pedido",
  in_stock: "Ya está disponible",
}

export function CartItemRow({ item, outcome }: CartItemRowProps) {
  const { remove, setQuantity } = useCart()

  const flag =
    !outcome || outcome.status === "unchanged"
      ? null
      : outcome.status === "availability_changed"
        ? (AVAILABILITY_FLAG_COPY[item.availability] ?? null)
        : FLAG_COPY[outcome.status]
  const isBlocking = outcome ? BLOCKING_STATUSES.has(outcome.status) : false

  return (
    <li className="flex items-start gap-3 py-3">
      <div className="size-16 shrink-0">
        <ProductImage image={item.image} name={item.name} sizes="64px" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 font-medium">{item.name}</p>
        <p className="text-muted-foreground text-sm">
          {formatCurrency(item.price)}
        </p>
        {flag ? (
          <p
            className={cn(
              "text-sm",
              isBlocking ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {flag}
          </p>
        ) : null}

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="size-11"
              aria-label="Reducir cantidad"
              disabled={item.quantity === 1}
              onClick={() => setQuantity(item.productId, item.quantity - 1)}
            >
              <Minus aria-hidden="true" />
            </Button>
            <span aria-live="polite" className="w-6 text-center text-sm">
              {item.quantity}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="size-11"
              aria-label="Aumentar cantidad"
              onClick={() => setQuantity(item.productId, item.quantity + 1)}
            >
              <Plus aria-hidden="true" />
            </Button>
          </div>
          <p className="font-medium">{formatCurrency(itemSubtotal(item))}</p>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        aria-label={`Quitar ${item.name} del carrito`}
        onClick={() => remove(item.productId)}
        className="shrink-0"
      >
        <Trash2 aria-hidden="true" />
      </Button>
    </li>
  )
}
