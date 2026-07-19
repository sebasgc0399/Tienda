// Hand-written row types matching supabase/migrations/20260719120000_init_catalog.sql.
// Replace with generated types once a Supabase project ref exists:
// pnpm dlx supabase gen types typescript --project-id <ref> > src/types/database.ts

export type ProductAvailability = "in_stock" | "out_of_stock" | "made_to_order"

export type Category = {
  id: string
  slug: string
  name: string
  description: string | null
  storage_path: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Product = {
  id: string
  slug: string
  name: string
  description: string
  price: number
  category_id: string
  is_featured: boolean
  availability: ProductAvailability
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export type ProductImage = {
  id: string
  product_id: string
  storage_path: string
  alt_text: string | null
  is_primary: boolean
  display_order: number
  created_at: string
}
