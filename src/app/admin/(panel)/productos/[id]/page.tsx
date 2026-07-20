import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
    <div className="flex max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href="/admin/productos"
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 w-fit rounded-md text-sm outline-none hover:underline focus-visible:ring-3"
        >
          ← Productos
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-heading text-2xl font-semibold md:text-3xl">
            {product.name}
          </h1>
          <span
            className={
              product.is_active
                ? "bg-secondary text-secondary-foreground inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                : "text-muted-foreground inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium"
            }
          >
            {product.is_active ? "Activo" : "Inactivo"}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[1fr_380px] lg:items-start lg:gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Datos</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductForm
              mode="edit"
              product={product}
              categories={categories}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Imágenes</CardTitle>
            <CardDescription>
              La primera imagen o la marcada como principal se usa en el
              catálogo.
            </CardDescription>
            <CardAction>
              <ImageUploader productId={id} />
            </CardAction>
          </CardHeader>
          <CardContent>
            <ImageGrid images={images} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
