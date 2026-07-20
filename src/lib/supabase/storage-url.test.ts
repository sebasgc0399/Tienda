import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { getPublicImageUrl } from "./storage-url"

describe("getPublicImageUrl", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co")
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("builds the public object URL with the default bucket", () => {
    const result = getPublicImageUrl("categories/gorras.jpg")
    expect(result).toBe(
      "https://example.supabase.co/storage/v1/object/public/product-images/categories/gorras.jpg",
    )
  })

  it("accepts an explicit bucket", () => {
    const result = getPublicImageUrl("logo.png", "branding")
    expect(result).toBe(
      "https://example.supabase.co/storage/v1/object/public/branding/logo.png",
    )
  })

  it("does not produce a double slash when the path has a leading slash", () => {
    const result = getPublicImageUrl("/products/foo.jpg")
    expect(result).toBe(
      "https://example.supabase.co/storage/v1/object/public/product-images/products/foo.jpg",
    )
  })

  it("does not produce a double slash when the base URL has a trailing slash", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co/")
    const result = getPublicImageUrl("products/foo.jpg")
    expect(result).toBe(
      "https://example.supabase.co/storage/v1/object/public/product-images/products/foo.jpg",
    )
  })
})
