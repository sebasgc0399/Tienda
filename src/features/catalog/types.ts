// View-models for the public catalog feature. These narrow the raw
// database row types (src/types/database.ts) to what each read actually
// selects and shapes (embedded primary image, category summary, etc.).

import type { Category, Product } from "@/types/database"

export type ProductImageRef = {
  storage_path: string
  alt_text: string | null
}

export type ProductCardData = Pick<
  Product,
  "id" | "slug" | "name" | "price" | "availability"
> & {
  image: ProductImageRef | null
}

export type FeaturedProduct = ProductCardData

export type CategorySummary = Pick<
  Category,
  "id" | "slug" | "name" | "description" | "display_order" | "storage_path"
>

export type CategoryDetail = Pick<
  Category,
  "id" | "slug" | "name" | "description" | "storage_path"
>

export type ProductDetail = Pick<
  Product,
  "id" | "slug" | "name" | "description" | "price" | "availability"
> & {
  category: { slug: string; name: string }
  images: (ProductImageRef & {
    id: string
    display_order: number
    is_primary: boolean
  })[]
}
