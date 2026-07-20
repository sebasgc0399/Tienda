// View-model for the admin category list/detail screens. Row types stay in
// src/types/database.ts; product_count is not a database column, it is
// computed in lib/queries.ts and only exists so the category list and the
// delete flow can decide between "Eliminar" and "Reasignar y eliminar"
// (admin-panel.md, "Eliminar categoría con productos asociados").

import type { Category } from "@/types/database"

export type AdminCategoryRow = Category & { product_count: number }
