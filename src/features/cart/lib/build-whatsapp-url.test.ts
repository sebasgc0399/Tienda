import { describe, expect, it } from "vitest"

import type { MessageLineItem } from "./build-whatsapp-message"
import { buildWhatsappMessage } from "./build-whatsapp-message"
import { buildWhatsappUrl, WA_URL_MAX_LENGTH } from "./build-whatsapp-url"
import { formatCop } from "./format-cop"

const NUMBER = "573001234567"

function decodeMessage(url: string): string {
  const [, encoded] = url.split("?text=")
  return decodeURIComponent(encoded)
}

describe("buildWhatsappUrl", () => {
  it("decodes to the exact message when under the length cap", () => {
    const items: MessageLineItem[] = [
      { name: "Ramo Primavera", quantity: 2, price: 45000 },
      { name: "Gorra Bordada", quantity: 1, price: 35000 },
    ]

    const url = buildWhatsappUrl(NUMBER, items)

    expect(url.startsWith(`https://wa.me/${NUMBER}?text=`)).toBe(true)
    expect(decodeMessage(url)).toBe(buildWhatsappMessage(items))
    expect(url.length).toBeLessThanOrEqual(WA_URL_MAX_LENGTH)
  })

  it("drops trailing item lines and appends 'y N productos más' when the full message overflows, keeping the total over all items", () => {
    const items: MessageLineItem[] = Array.from({ length: 60 }, (_, i) => ({
      name: `Producto artesanal numero ${i + 1} con un nombre bastante largo`,
      quantity: 1,
      price: 45000,
    }))

    const url = buildWhatsappUrl(NUMBER, items)
    const message = decodeMessage(url)
    const hiddenMatch = message.match(/y (\d+) productos más/)

    expect(url.length).toBeLessThanOrEqual(WA_URL_MAX_LENGTH)
    expect(hiddenMatch).not.toBeNull()

    const hiddenCount = Number(hiddenMatch![1])
    const visibleCount = items.length - hiddenCount

    expect(visibleCount).toBeGreaterThan(0)
    expect(visibleCount).toBeLessThan(items.length)

    const expectedTotal = items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    )
    expect(message).toContain(`Total: ${formatCop(expectedTotal)}`)
  })

  it("never throws and stays within the cap for a single pathological emoji-heavy name", () => {
    const items: MessageLineItem[] = [
      { name: "🌸".repeat(1500), quantity: 1, price: 45000 },
    ]

    let url = ""
    expect(() => {
      url = buildWhatsappUrl(NUMBER, items)
    }).not.toThrow()

    expect(url.length).toBeLessThanOrEqual(WA_URL_MAX_LENGTH)
    expect(() => decodeURIComponent(url.split("?text=")[1])).not.toThrow()
  })

  it("never throws for a pathological emoji name mixed with another item", () => {
    const items: MessageLineItem[] = [
      { name: "🌸🎀🧧".repeat(500), quantity: 1, price: 45000 },
      { name: "Gorra Bordada", quantity: 1, price: 35000 },
    ]

    let url = ""
    expect(() => {
      url = buildWhatsappUrl(NUMBER, items)
    }).not.toThrow()

    expect(url.length).toBeLessThanOrEqual(WA_URL_MAX_LENGTH)
  })
})
