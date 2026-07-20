import { describe, expect, it } from "vitest"

import { extFromMime } from "./ext-from-mime"

describe("extFromMime", () => {
  it("maps image/jpeg to jpg", () => {
    expect(extFromMime("image/jpeg")).toBe("jpg")
  })

  it("maps image/png to png", () => {
    expect(extFromMime("image/png")).toBe("png")
  })

  it("maps image/webp to webp", () => {
    expect(extFromMime("image/webp")).toBe("webp")
  })

  it("throws on an unsupported MIME type", () => {
    expect(() => extFromMime("image/gif")).toThrow(
      "Unsupported image MIME type: image/gif",
    )
  })
})
