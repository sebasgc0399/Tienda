"use client"

import Image from "next/image"
import { useState } from "react"

import { getPublicImageUrl } from "@/lib/supabase/storage-url"
import { cn } from "@/lib/utils"

import type { ProductDetail } from "../types"
import { ProductImage } from "./product-image"

type ProductGalleryProps = {
  images: ProductDetail["images"]
  name: string
}

const MAIN_SIZES = "(min-width: 1024px) 66vw, 100vw"
const THUMB_SIZES = "80px"

// Master-detail gallery (Clemont reference pattern, docs/specs/design-system.md
// PDP > Galería): a sticky thumbnail rail drives a single large main image
// instead of stacking every photo full-size. "use client" is required for the
// selection state (ADR-0006 leaf exception).
//
// Zero images keeps the existing ProductImage placeholder untouched
// (docs/specs/public-catalog.md, Casos borde); one image skips the rail
// entirely since there is nothing to switch between.
//
// All main images are mounted up front and toggled with opacity/aria-hidden
// instead of swapping a single <Image src> — switching src on one <Image>
// re-triggers its loading state on every click (visible flash on the first
// switch to each photo), while mounting all of them and cross-fading avoids
// that reload entirely at the cost of a few extra requests for a small
// per-product photo set. `order-*` classes reflow the rail from a bottom
// strip (mobile) to a left column (desktop, `lg:grid-cols-[auto_1fr]`)
// without duplicating markup.
export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  if (images.length === 0) {
    return <ProductImage image={null} name={name} priority />
  }

  if (images.length === 1) {
    return (
      <ProductImage image={images[0]} name={name} priority sizes={MAIN_SIZES} />
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
      <div className="order-2 flex gap-2 overflow-x-auto lg:sticky lg:top-20 lg:order-1 lg:max-h-[70vh] lg:w-20 lg:flex-col lg:self-start lg:overflow-x-visible lg:overflow-y-auto">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setSelectedIndex(index)}
            aria-label={`Imagen ${index + 1} de ${images.length}`}
            aria-current={index === selectedIndex}
            className={cn(
              "focus-visible:ring-ring/50 relative aspect-square w-16 shrink-0 overflow-hidden rounded-md border-2 outline-none focus-visible:ring-3 lg:w-20",
              index === selectedIndex
                ? "border-primary"
                : "hover:border-border border-transparent",
            )}
          >
            <Image
              src={getPublicImageUrl(image.storage_path)}
              alt=""
              fill
              sizes={THUMB_SIZES}
              className="object-cover"
            />
          </button>
        ))}
      </div>

      <div className="relative order-1 aspect-square overflow-hidden rounded-lg lg:order-2">
        {images.map((image, index) => (
          <Image
            key={image.id}
            src={getPublicImageUrl(image.storage_path)}
            alt={index === selectedIndex ? image.alt_text || name : ""}
            aria-hidden={index !== selectedIndex}
            fill
            sizes={MAIN_SIZES}
            priority={index === 0}
            className={cn(
              "object-cover transition-opacity duration-300 motion-reduce:transition-none",
              index === selectedIndex
                ? "opacity-100"
                : "pointer-events-none opacity-0",
            )}
          />
        ))}
      </div>
    </div>
  )
}
