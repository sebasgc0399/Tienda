import { describe, expect, it } from "vitest"

import { swapOrder } from "./order-swap"

const distinctOrder = [
  { id: "a", display_order: 0 },
  { id: "b", display_order: 1 },
  { id: "c", display_order: 2 },
]

const allZero = [
  { id: "a", display_order: 0 },
  { id: "b", display_order: 0 },
  { id: "c", display_order: 0 },
]

describe("swapOrder", () => {
  it("swaps display_order with the previous item on 'up'", () => {
    expect(swapOrder(distinctOrder, "b", "up")).toEqual([
      { id: "b", display_order: 0 },
      { id: "a", display_order: 1 },
    ])
  })

  it("swaps display_order with the next item on 'down'", () => {
    expect(swapOrder(distinctOrder, "b", "down")).toEqual([
      { id: "b", display_order: 2 },
      { id: "c", display_order: 1 },
    ])
  })

  it("is a no-op ([]) moving the first item up", () => {
    expect(swapOrder(distinctOrder, "a", "up")).toEqual([])
  })

  it("is a no-op ([]) moving the last item down", () => {
    expect(swapOrder(distinctOrder, "c", "down")).toEqual([])
  })

  it("returns [] for an id not present in the list", () => {
    expect(swapOrder(distinctOrder, "unknown", "up")).toEqual([])
  })

  it("falls back to a full reindex when adjacent items share display_order (seed data all 0)", () => {
    const updates = swapOrder(allZero, "b", "up")

    expect(updates).toEqual([
      { id: "a", display_order: 1 },
      { id: "b", display_order: 0 },
      { id: "c", display_order: 2 },
    ])

    // The reindexed result, sorted by the new display_order, puts b before a.
    const sorted = [...updates].sort(
      (x, y) => x.display_order - y.display_order,
    )
    expect(sorted.map((u) => u.id)).toEqual(["b", "a", "c"])
  })

  it("reindex fallback also applies moving down", () => {
    const updates = swapOrder(allZero, "b", "down")

    expect(updates).toEqual([
      { id: "a", display_order: 0 },
      { id: "b", display_order: 2 },
      { id: "c", display_order: 1 },
    ])

    const sorted = [...updates].sort(
      (x, y) => x.display_order - y.display_order,
    )
    expect(sorted.map((u) => u.id)).toEqual(["a", "c", "b"])
  })
})
