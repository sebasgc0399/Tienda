import type { ProductImageRef } from "../types"

type ImageCandidate = ProductImageRef & {
  is_primary: boolean
  display_order: number
}

// Prefers the image flagged is_primary; falls back to the lowest
// display_order; returns null when there are no images at all.
export function pickPrimaryImage(
  images: ImageCandidate[],
): ProductImageRef | null {
  if (images.length === 0) {
    return null
  }

  const primary = images.find((image) => image.is_primary)
  const picked =
    primary ?? [...images].sort((a, b) => a.display_order - b.display_order)[0]

  return { storage_path: picked.storage_path, alt_text: picked.alt_text }
}
