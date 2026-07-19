import { describe, expect, it } from "vitest"

import { formatCurrency } from "./format-currency"

describe("formatCurrency", () => {
  it("formats COP with dot thousands separators and no decimals", () => {
    const result = formatCurrency(45000)
    expect(result).toContain("45.000")
    expect(result).toContain("$")
    expect(result).not.toContain(",")
  })

  it("formats zero", () => {
    expect(formatCurrency(0)).toContain("0")
  })

  it("formats amounts over a million", () => {
    expect(formatCurrency(1250000)).toContain("1.250.000")
  })
})
