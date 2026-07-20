import { describe, expect, it } from "vitest"

import { isSlugTaken, nextAvailableSlug } from "./next-available-slug"

describe("nextAvailableSlug", () => {
  it("returns the base slug when it is free", () => {
    expect(nextAvailableSlug("ramo-rosas", [])).toBe("ramo-rosas")
  })

  it("ignores unrelated taken slugs", () => {
    expect(nextAvailableSlug("ramo-rosas", ["gorra-azul"])).toBe("ramo-rosas")
  })

  it("appends -2 when the base is taken", () => {
    expect(nextAvailableSlug("ramo-rosas", ["ramo-rosas"])).toBe("ramo-rosas-2")
  })

  it("appends -3 when the base and -2 are both taken", () => {
    expect(
      nextAvailableSlug("ramo-rosas", ["ramo-rosas", "ramo-rosas-2"]),
    ).toBe("ramo-rosas-3")
  })

  it("fills the first gap instead of skipping past a later taken suffix", () => {
    expect(
      nextAvailableSlug("ramo-rosas", ["ramo-rosas", "ramo-rosas-3"]),
    ).toBe("ramo-rosas-2")
  })

  it("exempts the row's own slug so editing without changing it keeps it", () => {
    expect(nextAvailableSlug("ramo-rosas", ["ramo-rosas"], "ramo-rosas")).toBe(
      "ramo-rosas",
    )
  })

  it("treats a base that already ends in a numeric suffix as a literal string", () => {
    expect(nextAvailableSlug("promo-2", ["promo-2"])).toBe("promo-2-2")
  })
})

describe("isSlugTaken", () => {
  it("returns false when the slug is free", () => {
    expect(isSlugTaken("ramo-rosas", [])).toBe(false)
  })

  it("returns true when a different row already uses the slug", () => {
    expect(isSlugTaken("ramo-rosas", ["ramo-rosas"])).toBe(true)
  })

  it("returns false when the only match is the row's own current slug", () => {
    expect(isSlugTaken("ramo-rosas", ["ramo-rosas"], "ramo-rosas")).toBe(false)
  })

  it("ignores unrelated taken slugs", () => {
    expect(isSlugTaken("ramo-rosas", ["gorra-azul"])).toBe(false)
  })
})
