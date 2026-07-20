// Splits the featured-products list into the "hero" slot (first item, large
// bento cell) and the rest, per the ordering already applied by the query
// (created_at DESC — docs/specs/public-catalog.md RF-1).
export function slotFeatured<T>(products: T[]): {
  hero: T | null
  rest: T[]
} {
  const [hero = null, ...rest] = products

  return { hero, rest }
}
