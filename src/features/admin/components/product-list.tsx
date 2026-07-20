import { ImageIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/format-currency"
import { getPublicImageUrl } from "@/lib/supabase/storage-url"

import { reorderProduct } from "../actions/reorder-product"
import { toggleProductActive } from "../actions/toggle-product-active"
import { toggleProductFeatured } from "../actions/toggle-product-featured"
import type { AdminProductRow } from "../types"
import { ActivateProductButton } from "./activate-product-button"
import { AvailabilitySelect } from "./availability-select"
import { InlineToggle } from "./inline-toggle"
import { OrderControls } from "./order-controls"
import { ProductDeleteDialog } from "./product-delete-dialog"

type ProductListProps = {
  products: AdminProductRow[]
}

function ProductThumb({ storagePath }: { storagePath: string | null }) {
  if (!storagePath) {
    return (
      <div className="bg-secondary flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md">
        <ImageIcon
          aria-hidden="true"
          className="text-muted-foreground size-5"
        />
      </div>
    )
  }

  return (
    <div className="relative size-12 shrink-0 overflow-hidden rounded-md">
      <Image
        src={getPublicImageUrl(storagePath)}
        alt=""
        fill
        sizes="48px"
        className="object-cover"
      />
    </div>
  )
}

// Actions column: "Editar" always shows; the destructive slot swaps
// between ProductDeleteDialog ("Desactivar", with confirmation — RF-10)
// and ActivateProductButton ("Activar", no confirmation needed) depending
// on the product's current is_active — the inline Switch next to it stays
// available either way as the quick toggle.
function ProductRowActions({ product }: { product: AdminProductRow }) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        render={<Link href={`/admin/productos/${product.id}`} />}
        nativeButton={false}
      >
        Editar
      </Button>
      {product.is_active ? (
        <ProductDeleteDialog
          productId={product.id}
          productName={product.name}
        />
      ) : (
        <ActivateProductButton id={product.id} />
      )}
    </div>
  )
}

// Server-fed presentational list (RF-4, admin-panel.md): desktop table /
// mobile cards (design-system.md, "Panel de administración"), sorted by
// category then by each product's own display_order (lib/queries.ts,
// getAdminProducts) — contiguous per category, so ▲▼ boundaries are just
// "does the neighboring row belong to a different category". Interactivity
// lives entirely in the leaf client components (AvailabilitySelect,
// InlineToggle, ProductDeleteDialog, ActivateProductButton) — this
// component itself stays a Server Component.
export function ProductList({ products }: ProductListProps) {
  if (products.length === 0) {
    return (
      <p className="text-muted-foreground">
        Todavía no hay productos. Crea el primero para empezar.
      </p>
    )
  }

  return (
    <>
      <table className="hidden w-full text-left text-sm md:table">
        <thead className="text-muted-foreground border-b">
          <tr>
            <th className="py-2 pr-4 font-medium">Foto</th>
            <th className="py-2 pr-4 font-medium">Nombre</th>
            <th className="py-2 pr-4 font-medium">Categoría</th>
            <th className="py-2 pr-4 font-medium">Precio</th>
            <th className="py-2 pr-4 font-medium">Disponibilidad</th>
            <th className="py-2 pr-4 font-medium">Destacado</th>
            <th className="py-2 pr-4 font-medium">Activo</th>
            <th className="py-2 pr-4 font-medium">Orden</th>
            <th className="py-2 pr-4 font-medium">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => {
            const disableUp =
              index === 0 ||
              products[index - 1].category_id !== product.category_id
            const disableDown =
              index === products.length - 1 ||
              products[index + 1].category_id !== product.category_id

            return (
              <tr key={product.id} className="border-b last:border-0">
                <td className="py-3 pr-4">
                  <ProductThumb storagePath={product.primary_image_path} />
                </td>
                <td className="py-3 pr-4">
                  <div className="font-medium">{product.name}</div>
                  <div className="text-muted-foreground text-xs">
                    {product.slug}
                  </div>
                </td>
                <td className="py-3 pr-4">{product.category_name}</td>
                <td className="py-3 pr-4">{formatCurrency(product.price)}</td>
                <td className="py-3 pr-4">
                  <AvailabilitySelect
                    id={product.id}
                    value={product.availability}
                    label={`Disponibilidad: ${product.name}`}
                  />
                </td>
                <td className="py-3 pr-4">
                  <InlineToggle
                    id={product.id}
                    checked={product.is_featured}
                    action={toggleProductFeatured}
                    label={`Destacado: ${product.name}`}
                  />
                </td>
                <td className="py-3 pr-4">
                  <InlineToggle
                    id={product.id}
                    checked={product.is_active}
                    action={toggleProductActive}
                    label={`Activo: ${product.name}`}
                  />
                </td>
                <td className="py-3 pr-4">
                  <OrderControls
                    id={product.id}
                    reorderAction={reorderProduct}
                    disableUp={disableUp}
                    disableDown={disableDown}
                  />
                </td>
                <td className="py-3 pr-4">
                  <ProductRowActions product={product} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <ul className="flex flex-col gap-3 md:hidden">
        {products.map((product, index) => {
          const disableUp =
            index === 0 ||
            products[index - 1].category_id !== product.category_id
          const disableDown =
            index === products.length - 1 ||
            products[index + 1].category_id !== product.category_id

          return (
            <li key={product.id} className="rounded-lg border p-3">
              <div className="flex items-start gap-3">
                <ProductThumb storagePath={product.primary_image_path} />
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{product.name}</div>
                  <div className="text-muted-foreground text-xs">
                    {product.slug}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {product.category_name}
                  </div>
                  <div className="text-sm">{formatCurrency(product.price)}</div>
                </div>
                <InlineToggle
                  id={product.id}
                  checked={product.is_active}
                  action={toggleProductActive}
                  label={`Activo: ${product.name}`}
                />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <AvailabilitySelect
                  id={product.id}
                  value={product.availability}
                  label={`Disponibilidad: ${product.name}`}
                />
                <InlineToggle
                  id={product.id}
                  checked={product.is_featured}
                  action={toggleProductFeatured}
                  label={`Destacado: ${product.name}`}
                />
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <OrderControls
                  id={product.id}
                  reorderAction={reorderProduct}
                  disableUp={disableUp}
                  disableDown={disableDown}
                />
                <ProductRowActions product={product} />
              </div>
            </li>
          )
        })}
      </ul>
    </>
  )
}
