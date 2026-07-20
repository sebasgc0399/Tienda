import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ImageGrid } from "@/features/admin/components/image-grid"
import { ImageUploader } from "@/features/admin/components/image-uploader"
import { ProductForm } from "@/features/admin/components/product-form"
import {
  getAdminProduct,
  getCategoryOptions,
  getProductImages,
} from "@/features/admin/lib/queries"

export const metadata: Metadata = {
  title: "Editar producto",
}

type ProductoEditPageProps = {
  params: Promise<{ id: string }>
}

export default async function ProductoEditPage({
  params,
}: ProductoEditPageProps) {
  const { id } = await params
  const [product, categories] = await Promise.all([
    getAdminProduct(id),
    getCategoryOptions(),
  ])

  if (!product) {
    notFound()
  }

  const images = await getProductImages(id)

  return (
    <div className="flex max-w-lg flex-col gap-8">
      <h1 className="font-heading text-2xl font-semibold">{product.name}</h1>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Datos</h2>
        <ProductForm mode="edit" product={product} categories={categories} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Imágenes</h2>
        <p className="text-muted-foreground text-sm">
          La primera imagen o la marcada como principal se usa en el catálogo.
        </p>
        <ImageGrid images={images} />
        <ImageUploader productId={id} />
      </section>
    </div>
  )
}
