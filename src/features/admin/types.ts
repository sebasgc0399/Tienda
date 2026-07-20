// View-model for the admin category list/detail screens. Row types stay in
// src/types/database.ts; product_count is not a database column, it is
// computed in lib/queries.ts and only exists so the category list and the
// delete flow can decide between "Eliminar" and "Reasignar y eliminar"
// (admin-panel.md, "Eliminar categoría con productos asociados").

import type { Category, Product } from "@/types/database"

export type AdminCategoryRow = Category & { product_count: number }

// View-model for the admin product list (RF-4/RF-8, admin-panel.md):
// category_name and primary_image_path are not database columns, they are
// computed in lib/queries.ts (joined category name, picked primary image)
// so the list/table can render without a second round-trip per row.
export type AdminProductRow = Product & {
  category_name: string
  primary_image_path: string | null
}

// Option shape for ProductForm's category Select — every category
// (including inactive ones, since an inactive category can still own
// products) reduced to just what the dropdown needs.
export type CategoryOption = Pick<Category, "id" | "name">
