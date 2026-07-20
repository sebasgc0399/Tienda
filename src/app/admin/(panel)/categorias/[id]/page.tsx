import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { CategoryForm } from "@/features/admin/components/category-form"
import { CoverUploader } from "@/features/admin/components/cover-uploader"
import { getAdminCategory } from "@/features/admin/lib/queries"

export const metadata: Metadata = {
  title: "Editar categoría",
}

type CategoriaEditPageProps = {
  params: Promise<{ id: string }>
}

export default async function CategoriaEditPage({
  params,
}: CategoriaEditPageProps) {
  const { id } = await params
  const category = await getAdminCategory(id)

  if (!category) {
    notFound()
  }

  return (
    <div className="flex max-w-lg flex-col gap-8">
      <h1 className="font-heading text-2xl font-semibold">{category.name}</h1>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Portada</h2>
        <CoverUploader
          categoryId={category.id}
          storagePath={category.storage_path}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Datos</h2>
        <CategoryForm mode="edit" category={category} />
      </section>
    </div>
  )
}
