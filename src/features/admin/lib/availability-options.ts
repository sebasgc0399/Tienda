import type { ProductAvailability } from "@/types/database"

// Admin-facing labels for every enum value. Deliberately separate from the
// public catalog's getAvailabilityLabel (features/catalog/lib/availability.ts),
// which returns null for "in_stock" to hide the badge on public product
// cards — the admin panel always needs an explicit, visible label so the
// owner can tell at a glance what she picked (RF-8, admin-panel.md).
export const AVAILABILITY_OPTIONS: Array<{
  value: ProductAvailability
  label: string
}> = [
  { value: "in_stock", label: "Disponible" },
  { value: "out_of_stock", label: "Agotado" },
  { value: "made_to_order", label: "Sobre pedido" },
]

const AVAILABILITY_VALUES = AVAILABILITY_OPTIONS.map((option) => option.value)

export function isValidAvailability(
  value: string,
): value is ProductAvailability {
  return (AVAILABILITY_VALUES as string[]).includes(value)
}
