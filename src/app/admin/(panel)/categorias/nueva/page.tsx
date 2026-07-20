import type { Metadata } from "next"
import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CategoryForm } from "@/features/admin/components/category-form"

export const metadata: Metadata = {
  title: "Nueva categoría",
}

export default function NuevaCategoriaPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href="/admin/categorias"
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 w-fit rounded-md text-sm outline-none hover:underline focus-visible:ring-3"
        >
          ← Categorías
        </Link>
        <h1 className="font-heading text-2xl font-semibold md:text-3xl">
          Nueva categoría
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Datos</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryForm mode="create" />
        </CardContent>
      </Card>
    </div>
  )
}
