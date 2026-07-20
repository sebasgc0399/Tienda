import { ImageIcon } from "lucide-react"
import Image from "next/image"

import { getPublicImageUrl } from "@/lib/supabase/storage-url"

import type { ProductImageRef } from "../types"

type ProductImageProps = {
  image: ProductImageRef | null
  name: string
  sizes?: string
  priority?: boolean
}

const DEFAULT_SIZES = "(min-width: 1024px) 25vw, 50vw"

// Single component that handles the "product with no image" edge case
// (docs/specs/design-system.md, Casos borde) for both the product card and
// the PDP gallery. Hover-zoom classes live on the <Image> itself so they
// only activate when an ancestor carries the "group" class (product-card.tsx);
// they are inert elsewhere (no group ancestor = no group-hover match).
export function ProductImage({
  image,
  name,
  sizes = DEFAULT_SIZES,
  priority = false,
}: ProductImageProps) {
  if (!image) {
    return (
      <div
        role="img"
        aria-label={name}
        className="bg-secondary flex aspect-square items-center justify-center overflow-hidden rounded-lg"
      >
        <ImageIcon
          aria-hidden="true"
          className="text-muted-foreground size-10"
        />
      </div>
    )
  }

  return (
    <div className="relative aspect-square overflow-hidden rounded-lg">
      <Image
        src={getPublicImageUrl(image.storage_path)}
        alt={image.alt_text ?? name}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
    </div>
  )
}
