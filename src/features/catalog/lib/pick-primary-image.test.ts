import { describe, expect, it } from "vitest"

import { pickPrimaryImage } from "./pick-primary-image"

describe("pickPrimaryImage", () => {
  it("returns null for an empty list", () => {
    expect(pickPrimaryImage([])).toBeNull()
  })

  it("prefers the image flagged is_primary regardless of display_order", () => {
    const result = pickPrimaryImage([
      {
        storage_path: "b.jpg",
        alt_text: "B",
        is_primary: false,
        display_order: 0,
      },
      {
        storage_path: "a.jpg",
        alt_text: "A",
        is_primary: true,
        display_order: 1,
      },
    ])
    expect(result).toEqual({ storage_path: "a.jpg", alt_text: "A" })
  })

  it("falls back to the lowest display_order when none is primary", () => {
    const result = pickPrimaryImage([
      {
        storage_path: "b.jpg",
        alt_text: "B",
        is_primary: false,
        display_order: 2,
      },
      {
        storage_path: "a.jpg",
        alt_text: "A",
        is_primary: false,
        display_order: 1,
      },
    ])
    expect(result).toEqual({ storage_path: "a.jpg", alt_text: "A" })
  })
})
