import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
    <div className="flex max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href="/admin/categorias"
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 w-fit rounded-md text-sm outline-none hover:underline focus-visible:ring-3"
        >
          ← Categorías
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-heading text-2xl font-semibold md:text-3xl">
            {category.name}
          </h1>
          <span
            className={
              category.is_active
                ? "bg-secondary text-secondary-foreground inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                : "text-muted-foreground inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium"
            }
          >
            {category.is_active ? "Activa" : "Inactiva"}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[1fr_380px] lg:items-start lg:gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Datos</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryForm mode="edit" category={category} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Portada</CardTitle>
            <CardDescription>
              Se muestra en el menú de categorías del catálogo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CoverUploader
              categoryId={category.id}
              storagePath={category.storage_path}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
