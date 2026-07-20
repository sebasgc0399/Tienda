import { describe, expect, it } from "vitest"

import { slotFeatured } from "./bento"

describe("slotFeatured", () => {
  it("returns null hero and empty rest for an empty list", () => {
    expect(slotFeatured([])).toEqual({ hero: null, rest: [] })
  })

  it("slots the first of 4 items as hero and keeps the other 3 as rest", () => {
    const products = [1, 2, 3, 4]
    expect(slotFeatured(products)).toEqual({ hero: 1, rest: [2, 3, 4] })
  })

  it("slots the first of 8 items as hero and keeps the other 7 as rest", () => {
    const products = [1, 2, 3, 4, 5, 6, 7, 8]
    expect(slotFeatured(products)).toEqual({
      hero: 1,
      rest: [2, 3, 4, 5, 6, 7, 8],
    })
  })
})
