import { describe, expect, it } from "vitest"

import {
  addItem,
  cartQuantity,
  cartTotal,
  itemSubtotal,
  removeItem,
  setItemQuantity,
} from "./cart-operations"
import type { CartItem } from "./cart-types"

const jabonSnapshot: Omit<CartItem, "quantity"> = {
  productId: "prod-1",
  slug: "ramo-jabones-clasico",
  name: "Ramo Jabones Clásico",
  price: 45000,
  availability: "in_stock",
  image: { storage_path: "products/jabon-1.jpg", alt_text: "Ramo de jabones" },
}

const gorraSnapshot: Omit<CartItem, "quantity"> = {
  productId: "prod-2",
  slug: "gorra-bordada-flores",
  name: "Gorra Bordada",
  price: 35000,
  availability: "in_stock",
  image: null,
}

describe("addItem", () => {
  it("appends a new product with quantity 1", () => {
    expect(addItem([], jabonSnapshot)).toEqual([
      { ...jabonSnapshot, quantity: 1 },
    ])
  })

  it("increments quantity for an existing product and preserves array order", () => {
    const cart = [
      { ...jabonSnapshot, quantity: 1 },
      { ...gorraSnapshot, quantity: 1 },
    ]

    expect(addItem(cart, jabonSnapshot)).toEqual([
      { ...jabonSnapshot, quantity: 2 },
      { ...gorraSnapshot, quantity: 1 },
    ])
  })

  it("keeps snapshot fields from the existing item, not the incoming one", () => {
    const cart = [{ ...jabonSnapshot, quantity: 1 }]
    const staleSnapshot = { ...jabonSnapshot, price: 99999 }

    const result = addItem(cart, staleSnapshot)

    expect(result[0].price).toBe(45000)
    expect(result[0].quantity).toBe(2)
  })

  it("does not mutate the input array", () => {
    const cart = [{ ...jabonSnapshot, quantity: 1 }]
    const result = addItem(cart, gorraSnapshot)

    expect(result).not.toBe(cart)
    expect(cart).toHaveLength(1)
  })

  it("keeps the existing item's image when the same product is added again", () => {
    const cart = [{ ...jabonSnapshot, quantity: 1 }]
    const staleSnapshot = {
      ...jabonSnapshot,
      image: { storage_path: "products/stale.jpg", alt_text: null },
    }

    const result = addItem(cart, staleSnapshot)

    expect(result[0].image).toEqual(jabonSnapshot.image)
  })
})

describe("removeItem", () => {
  it("removes the matching item", () => {
    const cart = [
      { ...jabonSnapshot, quantity: 1 },
      { ...gorraSnapshot, quantity: 2 },
    ]

    expect(removeItem(cart, "prod-1")).toEqual([
      { ...gorraSnapshot, quantity: 2 },
    ])
  })

  it("returns the same contents for an unknown id", () => {
    const cart = [{ ...jabonSnapshot, quantity: 1 }]
    expect(removeItem(cart, "unknown")).toEqual(cart)
  })
})

describe("setItemQuantity", () => {
  it("sets the quantity for the matching item", () => {
    const cart = [{ ...jabonSnapshot, quantity: 1 }]
    expect(setItemQuantity(cart, "prod-1", 5)).toEqual([
      { ...jabonSnapshot, quantity: 5 },
    ])
  })

  it("clamps zero to 1", () => {
    const cart = [{ ...jabonSnapshot, quantity: 3 }]
    expect(setItemQuantity(cart, "prod-1", 0)[0].quantity).toBe(1)
  })

  it("clamps negative values to 1", () => {
    const cart = [{ ...jabonSnapshot, quantity: 3 }]
    expect(setItemQuantity(cart, "prod-1", -5)[0].quantity).toBe(1)
  })

  it("is a no-op for an unknown id", () => {
    const cart = [{ ...jabonSnapshot, quantity: 1 }]
    expect(setItemQuantity(cart, "unknown", 5)).toEqual(cart)
  })
})

describe("itemSubtotal", () => {
  it("multiplies price by quantity", () => {
    expect(itemSubtotal({ ...jabonSnapshot, quantity: 2 })).toBe(90000)
  })
})

describe("cartTotal", () => {
  it("sums subtotals across items", () => {
    const cart = [
      { ...jabonSnapshot, quantity: 2 },
      { ...gorraSnapshot, quantity: 1 },
    ]

    expect(cartTotal(cart)).toBe(125000)
  })

  it("is 0 for an empty cart", () => {
    expect(cartTotal([])).toBe(0)
  })
})

describe("cartQuantity", () => {
  it("sums quantities across items", () => {
    const cart = [
      { ...jabonSnapshot, quantity: 2 },
      { ...gorraSnapshot, quantity: 3 },
    ]

    expect(cartQuantity(cart)).toBe(5)
  })

  it("is 0 for an empty cart", () => {
    expect(cartQuantity([])).toBe(0)
  })
})
