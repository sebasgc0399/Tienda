const formatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
})

// Prices are stored as integer COP with no decimals (see docs/specs/data-model.md).
export function formatCurrency(amount: number): string {
  return formatter.format(amount)
}
