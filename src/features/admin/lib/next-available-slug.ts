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
