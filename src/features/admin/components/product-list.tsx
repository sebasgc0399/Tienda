import { ImageIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Fragment } from "react"

import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/format-currency"
import { getPublicImageUrl } from "@/lib/supabase/storage-url"

import { reorderProduct } from "../actions/reorder-product"
import { toggleProductActive } from "../actions/toggle-product-active"
import { toggleProductFeatured } from "../actions/toggle-product-featured"
import type { AdminProductRow } from "../types"
import { AvailabilitySelect } from "./availability-select"
import { InlineToggle } from "./inline-toggle"
import { OrderControls } from "./order-controls"

type ProductListProps = {
  products: AdminProductRow[]
}

type ProductGroup = {
  categoryId: string
  categoryName: string
  products: AdminProductRow[]
}

// getAdminProducts (lib/queries.ts) sorts by category display_order, then
// category_id, then the product's own display_order — contiguous by
// category in practice. This still accumulates into a Map keyed by
// category_id (preserving first-seen insertion order) instead of assuming
// that contiguity by comparing against only the last-seen group: a
// non-contiguous input (e.g. a future regression in that sort) degrades to
// re-using the existing group instead of silently emitting the same
// category as two separate groups with duplicate React keys — the bug this
// replaced. ▲▼ boundaries (disableUp/disableDown) are a per-group index
// check: first item of a group disables ▲, last disables ▼.
function groupByCategory(products: AdminProductRow[]): ProductGroup[] {
  const groups = new Map<string, ProductGroup>()

  for (const product of products) {
    const group = groups.get(product.category_id)
    if (group) {
      group.products.push(product)
    } else {
      groups.set(product.category_id, {
        categoryId: product.category_id,
        categoryName: product.category_name,
        products: [product],
      })
    }
  }

  return [...groups.values()]
}

const TABLE_COLUMN_COUNT = 8

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

function ProductNameLink({ product }: { product: AdminProductRow }) {
  return (
    <Link
      href={`/admin/productos/${product.id}`}
      className="focus-visible:ring-ring/50 block w-fit rounded-md font-medium outline-none hover:underline focus-visible:ring-3"
    >
      {product.name}
    </Link>
  )
}

function CategoryGroupHeading({ name }: { name: string }) {
  return (
    <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
      {name}
    </span>
  )
}

// Actions column: "Editar" is the only row action left — activation and
// deactivation both live on the Activo Switch now (finding A, admin UX
// audit session 2), which covers both directions reversibly (RF-8), so the
// old destructive-with-confirmation "Desactivar"/"Activar" pair is gone.
function ProductRowActions({ product }: { product: AdminProductRow }) {
  return (
    <Button
      variant="outline"
      size="sm"
      render={<Link href={`/admin/productos/${product.id}`} />}
      nativeButton={false}
    >
      Editar
    </Button>
  )
}

// Server-fed presentational list (RF-4, admin-panel.md): desktop table /
// mobile cards (design-system.md, "Panel de administración"), grouped by
// category with a subheader per group (see groupByCategory above).
// Interactivity lives entirely in the leaf client components
// (AvailabilitySelect, InlineToggle) — this component itself stays a
// Server Component.
export function ProductList({ products }: ProductListProps) {
  if (products.length === 0) {
    return (
      <p className="text-muted-foreground">
        Todavía no hay productos. Crea el primero para empezar.
      </p>
    )
  }

  const groups = groupByCategory(products)

  return (
    <>
      <table className="hidden w-full text-left text-sm md:table">
        <thead className="text-muted-foreground border-b">
          <tr>
            <th className="py-2 pr-4 font-medium">Foto</th>
            <th className="py-2 pr-4 font-medium">Nombre</th>
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
          {groups.map((group) => (
            <Fragment key={group.categoryId}>
              <tr>
                <td
                  colSpan={TABLE_COLUMN_COUNT}
                  className="bg-muted/40 py-2 pr-4"
                >
                  <CategoryGroupHeading name={group.categoryName} />
                </td>
              </tr>
              {group.products.map((product, index) => {
                const disableUp = index === 0
                const disableDown = index === group.products.length - 1

                return (
                  <tr key={product.id} className="border-b last:border-0">
                    <td className="py-3 pr-4">
                      <ProductThumb storagePath={product.primary_image_path} />
                    </td>
                    <td className="py-3 pr-4">
                      <ProductNameLink product={product} />
                      <div className="text-muted-foreground text-xs">
                        {product.slug}
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      {formatCurrency(product.price)}
                    </td>
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
            </Fragment>
          ))}
        </tbody>
      </table>

      <div className="flex flex-col gap-4 md:hidden">
        {groups.map((group) => (
          <section key={group.categoryId} className="flex flex-col gap-3">
            <CategoryGroupHeading name={group.categoryName} />
            <ul className="flex flex-col gap-3">
              {group.products.map((product, index) => {
                const disableUp = index === 0
                const disableDown = index === group.products.length - 1

                return (
                  <li key={product.id} className="rounded-lg border p-3">
                    <div className="flex items-start gap-3">
                      <ProductThumb storagePath={product.primary_image_path} />
                      <div className="min-w-0 flex-1">
                        <ProductNameLink product={product} />
                        <div className="text-muted-foreground text-xs">
                          {product.slug}
                        </div>
                        <div className="text-sm">
                          {formatCurrency(product.price)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <AvailabilitySelect
                        id={product.id}
                        value={product.availability}
                        label={`Disponibilidad: ${product.name}`}
                      />
                      <div className="flex items-center gap-1.5">
                        <InlineToggle
                          id={product.id}
                          checked={product.is_featured}
                          action={toggleProductFeatured}
                          label={`Destacado: ${product.name}`}
                        />
                        <span
                          aria-hidden="true"
                          className="text-muted-foreground text-xs"
                        >
                          Destacado
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <InlineToggle
                          id={product.id}
                          checked={product.is_active}
                          action={toggleProductActive}
                          label={`Activo: ${product.name}`}
                        />
                        <span
                          aria-hidden="true"
                          className="text-muted-foreground text-xs"
                        >
                          Activo
                        </span>
                      </div>
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
          </section>
        ))}
      </div>
    </>
  )
}
