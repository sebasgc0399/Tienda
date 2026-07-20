import type { ProductAvailability } from "@/types/database"

// UI copy in Spanish on purpose (public-facing catalog labels).
export function getAvailabilityLabel(
  availability: ProductAvailability,
): string | null {
  switch (availability) {
    case "out_of_stock":
      return "Agotado"
    case "made_to_order":
      return "Sobre pedido"
    case "in_stock":
      return null
  }
}

export function isPurchasable(availability: ProductAvailability): boolean {
  return availability !== "out_of_stock"
}
