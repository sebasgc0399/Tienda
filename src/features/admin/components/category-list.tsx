import { ImageIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { getPublicImageUrl } from "@/lib/supabase/storage-url"

import { reorderCategory } from "../actions/reorder-category"
import { toggleCategoryActive } from "../actions/toggle-category-active"
import type { AdminCategoryRow } from "../types"
import { CategoryDeleteDialog } from "./category-delete-dialog"
import { InlineToggle } from "./inline-toggle"
import { OrderControls } from "./order-controls"

type CategoryListProps = {
  categories: AdminCategoryRow[]
}

function CategoryThumb({ storagePath }: { storagePath: string | null }) {
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

// Server-fed presentational list (RF-3, admin-panel.md): desktop table /
// mobile cards (design-system.md, "Panel de administración"). Interactivity
// lives entirely in the leaf client components (InlineToggle,
// CategoryDeleteDialog) — this component itself stays a Server Component.
export function CategoryList({ categories }: CategoryListProps) {
  if (categories.length === 0) {
    return (
      <p className="text-muted-foreground">
        Todavía no hay categorías. Crea la primera para empezar.
      </p>
    )
  }

  return (
    <>
      <table className="hidden w-full text-left text-sm md:table">
        <thead className="text-muted-foreground border-b">
          <tr>
            <th className="py-2 pr-4 font-medium">Portada</th>
            <th className="py-2 pr-4 font-medium">Nombre</th>
            <th className="py-2 pr-4 font-medium">Productos</th>
            <th className="py-2 pr-4 font-medium">Orden</th>
            <th className="py-2 pr-4 font-medium">Activa</th>
            <th className="py-2 pr-4 font-medium">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category, index) => (
            <tr key={category.id} className="border-b last:border-0">
              <td className="py-3 pr-4">
                <CategoryThumb storagePath={category.storage_path} />
              </td>
              <td className="py-3 pr-4">
                <div className="font-medium">{category.name}</div>
                <div className="text-muted-foreground text-xs">
                  {category.slug}
                </div>
              </td>
              <td className="py-3 pr-4">{category.product_count}</td>
              <td className="py-3 pr-4">
                <OrderControls
                  id={category.id}
                  reorderAction={reorderCategory}
                  disableUp={index === 0}
                  disableDown={index === categories.length - 1}
                />
              </td>
              <td className="py-3 pr-4">
                <InlineToggle
                  id={category.id}
                  checked={category.is_active}
                  action={toggleCategoryActive}
                  label={`Activa: ${category.name}`}
                />
              </td>
              <td className="py-3 pr-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    render={<Link href={`/admin/categorias/${category.id}`} />}
                    nativeButton={false}
                  >
                    Editar
                  </Button>
                  <CategoryDeleteDialog
                    category={category}
                    productCount={category.product_count}
                    otherCategories={categories.filter(
                      (other) => other.id !== category.id,
                    )}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="flex flex-col gap-3 md:hidden">
        {categories.map((category, index) => (
          <li key={category.id} className="rounded-lg border p-3">
            <div className="flex items-start gap-3">
              <CategoryThumb storagePath={category.storage_path} />
              <div className="min-w-0 flex-1">
                <div className="font-medium">{category.name}</div>
                <div className="text-muted-foreground text-xs">
                  {category.slug}
                </div>
                <div className="text-muted-foreground text-xs">
                  {category.product_count} producto(s)
                </div>
              </div>
              <InlineToggle
                id={category.id}
                checked={category.is_active}
                action={toggleCategoryActive}
                label={`Activa: ${category.name}`}
              />
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <OrderControls
                id={category.id}
                reorderAction={reorderCategory}
                disableUp={index === 0}
                disableDown={index === categories.length - 1}
              />
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  render={<Link href={`/admin/categorias/${category.id}`} />}
                  nativeButton={false}
                >
                  Editar
                </Button>
                <CategoryDeleteDialog
                  category={category}
                  productCount={category.product_count}
                  otherCategories={categories.filter(
                    (other) => other.id !== category.id,
                  )}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
