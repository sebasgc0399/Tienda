import { describe, expect, it } from "vitest"

import type { CartItem } from "./cart-types"
import type { FreshProductRow } from "./reconcile-cart"
import { reconcileCart } from "./reconcile-cart"

function makeItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    productId: "prod-1",
    slug: "ramo-jabones-clasico",
    name: "Ramo Jabones Clásico",
    price: 45000,
    availability: "in_stock",
    quantity: 1,
    ...overrides,
  }
}

function makeRow(overrides: Partial<FreshProductRow> = {}): FreshProductRow {
  return {
    id: "prod-1",
    availability: "in_stock",
    is_active: true,
    price: 45000,
    ...overrides,
  }
}

describe("reconcileCart", () => {
  it("marks unchanged when nothing differs", () => {
    const items = [makeItem()]

    const result = reconcileCart(items, [makeRow()])

    expect(result.outcomes).toEqual([
      { productId: "prod-1", status: "unchanged" },
    ])
    expect(result.reconciled).toEqual(items)
    expect(result.hasBlocking).toBe(false)
  })

  it("marks removed and excludes the item when the row is missing", () => {
    const items = [makeItem()]

    const result = reconcileCart(items, [])

    expect(result.outcomes).toEqual([
      { productId: "prod-1", status: "removed" },
    ])
    expect(result.reconciled).toEqual([])
    expect(result.hasBlocking).toBe(true)
  })

  it("marks removed and excludes the item when the row is inactive", () => {
    const items = [makeItem()]

    const result = reconcileCart(items, [makeRow({ is_active: false })])

    expect(result.outcomes).toEqual([
      { productId: "prod-1", status: "removed" },
    ])
    expect(result.reconciled).toEqual([])
    expect(result.hasBlocking).toBe(true)
  })

  it("marks out_of_stock and excludes the item", () => {
    const items = [makeItem()]

    const result = reconcileCart(items, [
      makeRow({ availability: "out_of_stock" }),
    ])

    expect(result.outcomes).toEqual([
      { productId: "prod-1", status: "out_of_stock" },
    ])
    expect(result.reconciled).toEqual([])
    expect(result.hasBlocking).toBe(true)
  })

  it("marks price_changed and carries the fresh price on the reconciled item", () => {
    const items = [makeItem({ price: 45000 })]

    const result = reconcileCart(items, [makeRow({ price: 50000 })])

    expect(result.outcomes).toEqual([
      { productId: "prod-1", status: "price_changed" },
    ])
    expect(result.reconciled).toEqual([{ ...items[0], price: 50000 }])
    expect(result.hasBlocking).toBe(false)
  })

  it("marks availability_changed and carries fresh availability when still purchasable", () => {
    const items = [makeItem({ availability: "in_stock" })]

    const result = reconcileCart(items, [
      makeRow({ availability: "made_to_order" }),
    ])

    expect(result.outcomes).toEqual([
      { productId: "prod-1", status: "availability_changed" },
    ])
    expect(result.reconciled).toEqual([
      { ...items[0], availability: "made_to_order" },
    ])
    expect(result.hasBlocking).toBe(false)
  })

  it("prefers price_changed and updates both fields when price and availability both change", () => {
    const items = [makeItem({ price: 45000, availability: "in_stock" })]

    const result = reconcileCart(items, [
      makeRow({ price: 50000, availability: "made_to_order" }),
    ])

    expect(result.outcomes).toEqual([
      { productId: "prod-1", status: "price_changed" },
    ])
    expect(result.reconciled).toEqual([
      { ...items[0], price: 50000, availability: "made_to_order" },
    ])
  })

  it("computes hasBlocking true for a mixed cart and excludes only the blocking item", () => {
    const items = [
      makeItem({ productId: "prod-1" }),
      makeItem({
        productId: "prod-2",
        slug: "gorra-bordada-flores",
        name: "Gorra Bordada",
      }),
    ]
    const rows = [
      makeRow({ id: "prod-1" }),
      makeRow({ id: "prod-2", availability: "out_of_stock" }),
    ]

    const result = reconcileCart(items, rows)

    expect(result.hasBlocking).toBe(true)
    expect(result.reconciled).toEqual([items[0]])
  })

  it("computes hasBlocking false when every item is unchanged or non-blocking", () => {
    const items = [makeItem()]

    const result = reconcileCart(items, [makeRow({ price: 50000 })])

    expect(result.hasBlocking).toBe(false)
  })
})
