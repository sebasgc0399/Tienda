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

export type BuildWhatsappMessageOptions = {
  // Total to display. Defaults to the sum over `items`. build-whatsapp-url.ts
  // uses this to render only a visible prefix of item lines while the total
  // still reflects the whole cart (docs/specs/cart-whatsapp-checkout.md,
  // "Longitud máxima de la URL wa.me").
  total?: number
  // Extra line appended right after the item lines, before the blank line
  // and the total (e.g. "y N productos más").
  extraLine?: string
}

// Exact layout is contractual — docs/specs/cart-whatsapp-checkout.md
// "Formato del mensaje". Do not reflow/reformat without updating the spec
// in the same PR (CLAUDE.md section 8). This is the ONLY place that
// assembles the message layout — build-whatsapp-url.ts consumes it instead
// of duplicating it (see its `options` usage).
export function buildWhatsappMessage(
  items: MessageLineItem[],
  options: BuildWhatsappMessageOptions = {},
): string {
  const lines = items.map(itemLine)

  if (options.extraLine) {
    lines.push(options.extraLine)
  }

  const total =
    options.total ??
    items.reduce((sum, item) => sum + item.quantity * item.price, 0)

  return [
    "Hola, quiero hacer este pedido:",
    "",
    ...lines,
    "",
    `Total: ${formatCop(total)}`,
  ].join("\n")
}
