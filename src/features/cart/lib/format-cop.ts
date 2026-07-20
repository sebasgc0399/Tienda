const formatter = new Intl.NumberFormat("es-CO", {
  maximumFractionDigits: 0,
})

// Separate from lib/format-currency.ts on purpose: that one uses
// style: "currency", which for es-CO inserts a non-breaking space (U+00A0)
// between "$" and the number — verified output is "$ 45.000", not
// "$45.000". The WhatsApp message format is contractual (docs/specs/
// cart-whatsapp-checkout.md, "Formato del mensaje") and requires "$45.000"
// with no space. An NBSP would also survive encodeURIComponent as
// "%C2%A0", bloating the already length-capped wa.me URL for nothing.
export function formatCop(amount: number): string {
  return "$" + formatter.format(amount)
}
