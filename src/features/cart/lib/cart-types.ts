import type { ProductAvailability } from "@/types/database"

// Same shape as catalog's ProductImageRef (src/features/catalog/types.ts).
// Defined locally instead of imported to keep the cart feature independent
// from catalog's module — cart only needs the two fields it renders.
export type CartItemImage = {
  storage_path: string
  alt_text: string | null
}

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
  image: CartItemImage | null
}
