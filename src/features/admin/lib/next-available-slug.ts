// Pure uniqueness resolution for a candidate slug (docs/specs/admin-panel.md,
// "Generación de slug"): appends an incremental numeric suffix ("-2", "-3", ...)
// until a free slug is found. `taken` is expected to hold every OTHER slug
// already in use in the same table (unrelated slugs are fine, they are just
// ignored); `ownSlug` exempts the row being edited from colliding with itself.
export function nextAvailableSlug(
  base: string,
  taken: string[],
  ownSlug?: string,
): string {
  const isFree = (candidate: string) =>
    candidate === ownSlug || !taken.includes(candidate)

  if (isFree(base)) {
    return base
  }

  let suffix = 2
  let candidate = `${base}-${suffix}`

  while (!isFree(candidate)) {
    suffix += 1
    candidate = `${base}-${suffix}`
  }

  return candidate
}

// Pure collision check for a manually-entered slug (docs/specs/admin-panel.md,
// "Generación de slug"): unlike nextAvailableSlug's auto-suffix path, a slug
// the owner typed by hand must never be silently changed — this only answers
// whether `desired` is already used by a DIFFERENT row. `taken` holds every
// other slug already in use in the table (same shape nextAvailableSlug
// expects); `currentSlug` exempts the row being edited from colliding with
// its own unchanged slug.
export function isSlugTaken(
  desired: string,
  taken: string[],
  currentSlug?: string,
): boolean {
  return desired !== currentSlug && taken.includes(desired)
}
