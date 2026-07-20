import type { CartItem } from "./cart-types"

// RF-1: the cart lives in localStorage under a fixed key, versioned so a
// future shape change can invalidate old envelopes instead of crashing on
// them.
export const CART_STORAGE_KEY = "tienda:cart"
export const CART_STORAGE_VERSION = 1

// Minimal surface of the DOM Storage interface actually used. Accepting
// this instead of the global `Storage` type keeps loadCart/saveCart
// importable and testable under plain Node (no jsdom, no top-level
// `window`/`localStorage` reference anywhere in this module).
export type StorageLike = Pick<Storage, "getItem" | "setItem">

const AVAILABILITY_VALUES = new Set([
  "in_stock",
  "out_of_stock",
  "made_to_order",
])

function isValidItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) {
    return false
  }

  const item = value as Record<string, unknown>

  return (
    typeof item.productId === "string" &&
    typeof item.slug === "string" &&
    typeof item.name === "string" &&
    typeof item.price === "number" &&
    item.price >= 0 &&
    typeof item.quantity === "number" &&
    Number.isInteger(item.quantity) &&
    item.quantity >= 1 &&
    typeof item.availability === "string" &&
    AVAILABILITY_VALUES.has(item.availability)
  )
}

// Never throws: a missing key, malformed JSON, unknown envelope version, or
// a non-array `items` field all resolve to an empty cart. Individual items
// that fail shape validation are dropped rather than rejecting the whole
// cart, so one corrupted row doesn't wipe out an otherwise valid cart.
export function loadCart(storage: StorageLike): CartItem[] {
  const raw = storage.getItem(CART_STORAGE_KEY)

  if (raw === null) {
    return []
  }

  let parsed: unknown

  try {
    parsed = JSON.parse(raw)
  } catch {
    return []
  }

  if (typeof parsed !== "object" || parsed === null) {
    return []
  }

  const envelope = parsed as Record<string, unknown>

  if (envelope.version !== CART_STORAGE_VERSION) {
    return []
  }

  if (!Array.isArray(envelope.items)) {
    return []
  }

  return envelope.items.filter(isValidItem)
}

export function saveCart(storage: StorageLike, items: CartItem[]): void {
  storage.setItem(
    CART_STORAGE_KEY,
    JSON.stringify({ version: CART_STORAGE_VERSION, items }),
  )
}
