import { formatCop } from "./format-cop"

export type MessageLineItem = {
  name: string
  quantity: number
  price: number
}

function itemLine(item: MessageLineItem, index: number): string {
  const subtotal = item.quantity * item.price

  return `${index + 1}. ${item.name} x${item.quantity} - ${formatCop(item.price)} c/u = ${formatCop(subtotal)}`
}

// Exact layout is contractual — docs/specs/cart-whatsapp-checkout.md
// "Formato del mensaje". Do not reflow/reformat without updating the spec
// in the same PR (CLAUDE.md section 8).
export function buildWhatsappMessage(items: MessageLineItem[]): string {
  const lines = items.map(itemLine)
  const total = items.reduce((sum, item) => sum + item.quantity * item.price, 0)

  return [
    "Hola, quiero hacer este pedido:",
    "",
    ...lines,
    "",
    `Total: ${formatCop(total)}`,
  ].join("\n")
}
