import type { Metadata } from "next"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { ProductList } from "@/features/admin/components/product-list"
import { getAdminProducts } from "@/features/admin/lib/queries"

export const metadata: Metadata = {
  title: "Productos",
}

export default async function ProductosPage() {
  const products = await getAdminProducts()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-semibold">Productos</h1>
        <Button
          render={<Link href="/admin/productos/nuevo" />}
          nativeButton={false}
        >
          Nuevo producto
        </Button>
      </div>

      <ProductList products={products} />
    </div>
  )
}
