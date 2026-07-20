import type { Metadata } from "next"

import { CategoryForm } from "@/features/admin/components/category-form"

export const metadata: Metadata = {
  title: "Nueva categoría",
}

export default function NuevaCategoriaPage() {
  return (
    <div className="flex max-w-lg flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold">Nueva categoría</h1>
      <CategoryForm mode="create" />
    </div>
  )
}
