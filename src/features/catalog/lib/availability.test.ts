import { describe, expect, it } from "vitest"

import { getAvailabilityLabel, isPurchasable } from "./availability"

describe("getAvailabilityLabel", () => {
  it("labels out_of_stock as Agotado", () => {
    expect(getAvailabilityLabel("out_of_stock")).toBe("Agotado")
  })

  it("labels made_to_order as Sobre pedido", () => {
    expect(getAvailabilityLabel("made_to_order")).toBe("Sobre pedido")
  })

  it("returns null for in_stock (no badge)", () => {
    expect(getAvailabilityLabel("in_stock")).toBeNull()
  })
})

describe("isPurchasable", () => {
  it("is false only for out_of_stock", () => {
    expect(isPurchasable("out_of_stock")).toBe(false)
  })

  it("is true for in_stock", () => {
    expect(isPurchasable("in_stock")).toBe(true)
  })

  it("is true for made_to_order", () => {
    expect(isPurchasable("made_to_order")).toBe(true)
  })
})
