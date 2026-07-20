import type { CartItem } from "./cart-types"

// Pure operations over CartItem[] — always return a new array, never mutate
// the input (docs/specs/cart-whatsapp-checkout.md RF-2..RF-6).

// Existing product: increments quantity in place (array order preserved)
// and keeps the snapshot fields from the item ALREADY in the cart, not the
// incoming one — a stale add-to-cart click shouldn't silently overwrite
// name/price/availability. Deliberate refresh of those fields happens only
// through reconcile-cart.ts at checkout time.
export function addItem(
  items: CartItem[],
  next: Omit<CartItem, "quantity">,
): CartItem[] {
  const existingIndex = items.findIndex(
    (item) => item.productId === next.productId,
  )

  if (existingIndex === -1) {
    return [...items, { ...next, quantity: 1 }]
  }

  return items.map((item, index) =>
    index === existingIndex ? { ...item, quantity: item.quantity + 1 } : item,
  )
}

export function removeItem(items: CartItem[], productId: string): CartItem[] {
  return items.filter((item) => item.productId !== productId)
}

// Unknown productId is a no-op (RF-4: quantity edits target an existing
// item; there is nothing to clamp for a row that isn't in the cart).
export function setItemQuantity(
  items: CartItem[],
  productId: string,
  quantity: number,
): CartItem[] {
  const clamped = Math.max(1, quantity)

  return items.map((item) =>
    item.productId === productId ? { ...item, quantity: clamped } : item,
  )
}

export function itemSubtotal(item: CartItem): number {
  return item.price * item.quantity
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + itemSubtotal(item), 0)
}

export function cartQuantity(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0)
}
