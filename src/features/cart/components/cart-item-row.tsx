"use client"

import { Minus, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
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

const FLAG_COPY: Record<Exclude<ReconcileStatus, "unchanged">, string> = {
  price_changed: "Precio actualizado",
  out_of_stock: "Agotado",
  availability_changed: "Ahora es sobre pedido",
  removed: "Ya no está disponible",
}

export function CartItemRow({ item, outcome }: CartItemRowProps) {
  const { remove, setQuantity } = useCart()

  const flag =
    outcome && outcome.status !== "unchanged" ? FLAG_COPY[outcome.status] : null
  const isBlocking = outcome ? BLOCKING_STATUSES.has(outcome.status) : false

  return (
    <li className="flex items-start gap-3 py-3">
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

        <div className="mt-2 flex items-center gap-2">
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
      </div>

      <div className="flex flex-col items-end gap-2">
        <p className="font-medium">{formatCurrency(itemSubtotal(item))}</p>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Quitar ${item.name} del carrito`}
          onClick={() => remove(item.productId)}
        >
          <Trash2 aria-hidden="true" />
        </Button>
      </div>
    </li>
  )
}
