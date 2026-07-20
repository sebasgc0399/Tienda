import type { ProductAvailability } from "@/types/database"

// Snapshot kept in localStorage for instant UI rendering. The checkout flow
// never trusts this price/availability directly — it always revalidates
// against the database first (see reconcile-cart.ts, docs/specs/
// cart-whatsapp-checkout.md "Producto no disponible entre añadir y
// checkout").
export type CartItem = {
  productId: string
  slug: string
  name: string
  price: number
  availability: ProductAvailability
  quantity: number
}
