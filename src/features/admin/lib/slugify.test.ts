import { describe, expect, it } from "vitest"

import { slugify } from "./slugify"

describe("slugify", () => {
  it("strips accents and collapses spaces", () => {
    expect(slugify("Ramó Rosás")).toBe("ramo-rosas")
  })

  it("collapses symbols surrounded by spaces into a single hyphen", () => {
    expect(slugify("Gorras & Más")).toBe("gorras-mas")
  })

  it("maps ñ to n", () => {
    expect(slugify("Ñandú")).toBe("nandu")
  })

  it("treats underscores as separators", () => {
    expect(slugify("ramo_de_flores")).toBe("ramo-de-flores")
  })

  it("collapses repeated separators from consecutive symbols", () => {
    expect(slugify("--a--b--")).toBe("a-b")
  })

  it("returns an empty string for input made entirely of symbols", () => {
    expect(slugify("!!!")).toBe("")
  })

  it("returns an empty string for empty input", () => {
    expect(slugify("")).toBe("")
  })
})
