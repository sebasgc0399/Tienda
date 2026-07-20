import { describe, expect, it } from "vitest"

import { buildWhatsappMessage } from "./build-whatsapp-message"

describe("buildWhatsappMessage", () => {
  it("matches the spec's two-item example exactly", () => {
    const message = buildWhatsappMessage([
      { name: "Ramo Primavera", quantity: 2, price: 45000 },
      { name: "Gorra Bordada", quantity: 1, price: 35000 },
    ])

    expect(message).toBe(
      [
        "Hola, quiero hacer este pedido:",
        "",
        "1. Ramo Primavera x2 - $45.000 c/u = $90.000",
        "2. Gorra Bordada x1 - $35.000 c/u = $35.000",
        "",
        "Total: $125.000",
      ].join("\n"),
    )
  })

  it("formats a single item", () => {
    const message = buildWhatsappMessage([
      { name: "Ramo Primavera", quantity: 1, price: 45000 },
    ])

    expect(message).toBe(
      [
        "Hola, quiero hacer este pedido:",
        "",
        "1. Ramo Primavera x1 - $45.000 c/u = $45.000",
        "",
        "Total: $45.000",
      ].join("\n"),
    )
  })

  it("never ends with a trailing newline", () => {
    const message = buildWhatsappMessage([
      { name: "Ramo Primavera", quantity: 1, price: 45000 },
    ])

    expect(message.endsWith("\n")).toBe(false)
  })
})
