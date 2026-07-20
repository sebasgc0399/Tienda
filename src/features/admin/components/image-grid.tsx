"use client"

import { StarIcon, Trash2Icon } from "lucide-react"
import Image from "next/image"
import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { getPublicImageUrl } from "@/lib/supabase/storage-url"
import type { ProductImage } from "@/types/database"

import { deleteProductImage } from "../actions/delete-product-image"
import { reorderProductImage } from "../actions/reorder-product-image"
import { setPrimaryImage } from "../actions/set-primary-image"
import { DeleteDialog } from "./delete-dialog"
import { OrderControls } from "./order-controls"

type ImageGridProps = {
  images: ProductImage[]
}

type ImageTileProps = {
  image: ProductImage
  disableUp: boolean
  disableDown: boolean
}

// One tile owns its own primary-toggle and delete mutation state
// (useTransition, no local mirror of server state — same "stays derived
// from the prop, the post-action refresh brings the new value back down"
// pattern as InlineToggle/AvailabilitySelect). Reorder is delegated to
// OrderControls, a plain <form action> component with no client state of
// its own, same as ProductList/CategoryList use it — works with JS
// disabled too (RF-9).
function ImageTile({ image, disableUp, disableDown }: ImageTileProps) {
  const [pending, startTransition] = useTransition()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSetPrimary() {
    setError(null)
    startTransition(async () => {
      const result = await setPrimaryImage(image.id)
      if (result.status !== "success") {
        setError(result.message)
      }
    })
  }

  function handleDelete() {
    setError(null)
    startTransition(async () => {
      const result = await deleteProductImage(image.id)
      if (result.status === "success") {
        setDeleteOpen(false)
      } else {
        setError(result.message)
      }
    })
  }

  return (
    <li className="flex flex-col gap-2 rounded-lg border p-2">
      <div className="bg-secondary relative aspect-square overflow-hidden rounded-md">
        <Image
          src={getPublicImageUrl(image.storage_path)}
          alt={image.alt_text ?? ""}
          fill
          sizes="(min-width: 1024px) 180px, 50vw"
          className="object-cover"
        />
        {image.is_primary ? (
          <span className="bg-primary text-primary-foreground pointer-events-none absolute top-1.5 left-1.5 rounded px-1.5 py-0.5 text-xs font-medium">
            Principal
          </span>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-1">
        {image.is_primary ? null : (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={pending}
            aria-label="Marcar como principal"
            onClick={handleSetPrimary}
          >
            <StarIcon aria-hidden="true" />
          </Button>
        )}

        <OrderControls
          id={image.id}
          reorderAction={reorderProductImage}
          disableUp={disableUp}
          disableDown={disableDown}
        />

        <DeleteDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          trigger={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-destructive hover:text-destructive"
              disabled={pending}
              aria-label="Eliminar imagen"
            />
          }
          triggerLabel={<Trash2Icon aria-hidden="true" />}
          title="Eliminar imagen"
          description="¿Eliminar esta imagen? Esta acción no se puede deshacer."
          actions={
            <Button
              type="button"
              variant="destructive"
              disabled={pending}
              onClick={handleDelete}
            >
              Eliminar
            </Button>
          }
        >
          {error ? (
            <p role="alert" className="text-destructive text-sm">
              {error}
            </p>
          ) : null}
        </DeleteDialog>
      </div>
    </li>
  )
}

// RF-6/RF-7 (admin-panel.md): image gallery for one product, fed by
// getProductImages() from the parent RSC page (already ordered by
// display_order). "use client" lives at the grid level only for the tiles'
// interactivity — the data fetch itself stays server-side in the page.
export function ImageGrid({ images }: ImageGridProps) {
  if (images.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Este producto todavía no tiene imágenes.
      </p>
    )
  }

  return (
    <ul className="grid grid-cols-2 gap-3">
      {images.map((image, index) => (
        <ImageTile
          key={image.id}
          image={image}
          disableUp={index === 0}
          disableDown={index === images.length - 1}
        />
      ))}
    </ul>
  )
}
