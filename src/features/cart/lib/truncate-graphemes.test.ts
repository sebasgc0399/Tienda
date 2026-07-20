import { describe, expect, it } from "vitest"

import { truncateGraphemes } from "./truncate-graphemes"

describe("truncateGraphemes", () => {
  it("cuts an emoji-containing name at a grapheme boundary", () => {
    expect(truncateGraphemes("Ramo🌸Primavera", 5)).toBe("Ramo🌸")
  })

  it("returns the value unchanged when within the limit", () => {
    expect(truncateGraphemes("Ramo", 10)).toBe("Ramo")
  })

  it("returns the value unchanged when exactly at the limit", () => {
    expect(truncateGraphemes("Ramo", 4)).toBe("Ramo")
  })

  it("never splits a surrogate pair — result stays encodeURIComponent-safe", () => {
    const result = truncateGraphemes("Ramo🌸Primavera", 5)
    expect(() => encodeURIComponent(result)).not.toThrow()
  })
})
