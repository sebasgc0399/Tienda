import type { ProductAvailability } from "@/types/database"

import type { CartItem } from "./cart-types"

export type FreshProductRow = {
  id: string
  availability: ProductAvailability
  is_active: boolean
  price: number
}

export type ReconcileStatus =
  | "unchanged"
  | "price_changed"
  | "availability_changed"
  | "out_of_stock"
  | "removed"

export type ReconcileOutcome = {
  productId: string
  status: ReconcileStatus
}

export type ReconcileResult = {
  reconciled: CartItem[]
  outcomes: ReconcileOutcome[]
  hasBlocking: boolean
}

const BLOCKING_STATUSES: ReconcileStatus[] = ["removed", "out_of_stock"]

// Pre-checkout revalidation (docs/specs/cart-whatsapp-checkout.md,
// "Producto no disponible entre añadir y checkout"). Pure: takes the cart
// snapshot plus freshly-fetched rows and reports what changed, never
// mutating the input.
export function reconcileCart(
  items: CartItem[],
  rows: FreshProductRow[],
): ReconcileResult {
  const rowsById = new Map(rows.map((row) => [row.id, row]))
  const reconciled: CartItem[] = []
  const outcomes: ReconcileOutcome[] = []

  for (const item of items) {
    const row = rowsById.get(item.productId)

    if (!row || !row.is_active) {
      outcomes.push({ productId: item.productId, status: "removed" })
      continue
    }

    if (row.availability === "out_of_stock") {
      outcomes.push({ productId: item.productId, status: "out_of_stock" })
      continue
    }

    const priceChanged = row.price !== item.price
    const availabilityChanged = row.availability !== item.availability

    if (priceChanged) {
      // Precedence when BOTH price and availability changed: report
      // "price_changed" (price is the security-sensitive edge case the
      // spec calls out — anti-devtools-tampering) but still refresh both
      // fields on the reconciled item either way.
      reconciled.push({
        ...item,
        price: row.price,
        availability: row.availability,
      })
      outcomes.push({ productId: item.productId, status: "price_changed" })
      continue
    }

    if (availabilityChanged) {
      reconciled.push({ ...item, availability: row.availability })
      outcomes.push({
        productId: item.productId,
        status: "availability_changed",
      })
      continue
    }

    reconciled.push(item)
    outcomes.push({ productId: item.productId, status: "unchanged" })
  }

  const hasBlocking = outcomes.some((outcome) =>
    BLOCKING_STATUSES.includes(outcome.status),
  )

  return { reconciled, outcomes, hasBlocking }
}
