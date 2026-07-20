import type { ProductDetail } from "../types"
import { ProductImage } from "./product-image"

type ProductGalleryProps = {
  images: ProductDetail["images"]
  name: string
}

// Editorial vertical stack: every image visible, no carousel, no thumbnail
// strip (docs/specs/design-system.md, PDP > Galería). Images arrive already
// ordered by display_order asc (get-product-by-slug.ts), so this renders
// them as-is. Zero images falls back to ProductImage's own placeholder
// (docs/specs/public-catalog.md, Casos borde).
export function ProductGallery({ images, name }: ProductGalleryProps) {
  if (images.length === 0) {
    return <ProductImage image={null} name={name} priority />
  }

  return (
    <div className="space-y-4">
      {images.map((image, index) => (
        <ProductImage
          key={image.id}
          image={image}
          name={name}
          priority={index === 0}
          sizes="(min-width: 1024px) 66vw, 100vw"
        />
      ))}
    </div>
  )
}
