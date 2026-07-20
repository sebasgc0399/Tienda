import { describe, expect, it } from "vitest"

import { formatCop } from "./format-cop"

describe("formatCop", () => {
  it("formats 45000 as $45.000 with no space", () => {
    expect(formatCop(45000)).toBe("$45.000")
  })

  it("formats 125000 as $125.000", () => {
    expect(formatCop(125000)).toBe("$125.000")
  })

  it("formats 1250000 as $1.250.000", () => {
    expect(formatCop(1250000)).toBe("$1.250.000")
  })

  it("formats 0 as $0", () => {
    expect(formatCop(0)).toBe("$0")
  })
})
