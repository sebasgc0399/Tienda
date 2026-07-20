import { describe, expect, it } from "vitest"

import {
  ACCEPTED_MIME,
  MAX_IMAGE_BYTES,
  validateImageFile,
} from "./validate-image-file"

const RF5_MESSAGE = "La imagen debe ser JPG, PNG o WEBP y pesar menos de 5 MB"

describe("validateImageFile", () => {
  it.each(ACCEPTED_MIME)("accepts a small %s file", (type) => {
    expect(validateImageFile({ type, size: 1024 })).toEqual({ ok: true })
  })

  it("rejects an unsupported type like image/gif", () => {
    expect(validateImageFile({ type: "image/gif", size: 1024 })).toEqual({
      ok: false,
      message: RF5_MESSAGE,
    })
  })

  it("rejects a non-image type like application/pdf", () => {
    expect(validateImageFile({ type: "application/pdf", size: 1024 })).toEqual({
      ok: false,
      message: RF5_MESSAGE,
    })
  })

  it("rejects a file exactly at the 5 MB boundary (not strictly under it)", () => {
    expect(
      validateImageFile({ type: "image/jpeg", size: MAX_IMAGE_BYTES }),
    ).toEqual({ ok: false, message: RF5_MESSAGE })
  })

  it("accepts a file one byte under the 5 MB boundary", () => {
    expect(
      validateImageFile({ type: "image/jpeg", size: MAX_IMAGE_BYTES - 1 }),
    ).toEqual({ ok: true })
  })
})
