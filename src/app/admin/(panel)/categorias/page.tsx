import type { Metadata } from "next"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { CategoryList } from "@/features/admin/components/category-list"
import { getAdminCategories } from "@/features/admin/lib/queries"

export const metadata: Metadata = {
  title: "Categorías",
}

export default async function CategoriasPage() {
  const categories = await getAdminCategories()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-semibold">Categorías</h1>
        <Button
          render={<Link href="/admin/categorias/nueva" />}
          nativeButton={false}
        >
          Nueva categoría
        </Button>
      </div>

      <CategoryList categories={categories} />
    </div>
  )
}
