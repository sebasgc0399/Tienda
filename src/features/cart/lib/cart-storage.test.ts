import { describe, expect, it } from "vitest"

import type { StorageLike } from "./cart-storage"
import {
  CART_STORAGE_KEY,
  CART_STORAGE_VERSION,
  loadCart,
  saveCart,
} from "./cart-storage"
import type { CartItem } from "./cart-types"

// Hand-rolled in-memory fake — no jsdom dependency, matches the
// StorageLike surface loadCart/saveCart actually use.
function createMemoryStorage(): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>()

  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value)
    },
  }
}

const item: CartItem = {
  productId: "prod-1",
  slug: "ramo-jabones-clasico",
  name: "Ramo Jabones Clásico",
  price: 45000,
  availability: "in_stock",
  quantity: 2,
  image: { storage_path: "products/ramo-1.jpg", alt_text: "Ramo de jabones" },
}

describe("saveCart / loadCart round trip", () => {
  it("persists and reloads items unchanged", () => {
    const storage = createMemoryStorage()

    saveCart(storage, [item])

    expect(loadCart(storage)).toEqual([item])
  })

  it("writes a versioned envelope", () => {
    const storage = createMemoryStorage()

    saveCart(storage, [item])

    const raw = storage.data.get(CART_STORAGE_KEY)
    expect(JSON.parse(raw!)).toEqual({
      version: CART_STORAGE_VERSION,
      items: [item],
    })
  })
})

describe("loadCart edge cases", () => {
  it("returns [] when the key is missing", () => {
    const storage = createMemoryStorage()
    expect(loadCart(storage)).toEqual([])
  })

  it("returns [] on malformed JSON", () => {
    const storage = createMemoryStorage()
    storage.setItem(CART_STORAGE_KEY, "{not json")

    expect(loadCart(storage)).toEqual([])
  })

  it("returns [] for an unknown version", () => {
    const storage = createMemoryStorage()
    storage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({ version: 2, items: [item] }),
    )

    expect(loadCart(storage)).toEqual([])
  })

  it("returns [] when items is not an array", () => {
    const storage = createMemoryStorage()
    storage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({ version: CART_STORAGE_VERSION, items: "nope" }),
    )

    expect(loadCart(storage)).toEqual([])
  })

  it("filters out items with an invalid shape and keeps the valid ones", () => {
    const storage = createMemoryStorage()
    const invalidPrice = { ...item, productId: "prod-2", price: -1 }
    const invalidQuantity = { ...item, productId: "prod-3", quantity: 0 }
    const invalidAvailability = {
      ...item,
      productId: "prod-4",
      availability: "discontinued",
    }
    const missingField = {
      slug: "no-id",
      name: "Falta productId",
      price: 1000,
      quantity: 1,
      availability: "in_stock",
    }

    storage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({
        version: CART_STORAGE_VERSION,
        items: [
          item,
          invalidPrice,
          invalidQuantity,
          invalidAvailability,
          missingField,
        ],
      }),
    )

    expect(loadCart(storage)).toEqual([item])
  })

  it("loads a legacy item without an image field as image: null", () => {
    const storage = createMemoryStorage()
    const legacyItem: Record<string, unknown> = { ...item }
    delete legacyItem.image

    storage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({
        version: CART_STORAGE_VERSION,
        items: [legacyItem],
      }),
    )

    expect(loadCart(storage)).toEqual([{ ...legacyItem, image: null }])
  })

  it("normalizes a malformed image to null but keeps the item", () => {
    const storage = createMemoryStorage()
    const malformedImageItem = { ...item, image: { storage_path: 123 } }

    storage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({
        version: CART_STORAGE_VERSION,
        items: [malformedImageItem],
      }),
    )

    expect(loadCart(storage)).toEqual([{ ...item, image: null }])
  })
})
