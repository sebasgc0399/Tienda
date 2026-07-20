import type { Metadata } from "next"

import { ProductForm } from "@/features/admin/components/product-form"
import { getCategoryOptions } from "@/features/admin/lib/queries"

export const metadata: Metadata = {
  title: "Nuevo producto",
}

export default async function NuevoProductoPage() {
  const categories = await getCategoryOptions()

  return (
    <div className="flex max-w-lg flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold">Nuevo producto</h1>
      <ProductForm mode="create" categories={categories} />
    </div>
  )
}
