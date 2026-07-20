import { slotFeatured } from "../lib/bento"
import type { FeaturedProduct } from "../types"
import { ProductCard } from "./product-card"

type FeaturedBentoProps = {
  products: FeaturedProduct[]
}

// Asymmetric "bento" block: receives the featured list with the hero item
// already excluded by the caller (src/app/(public)/page.tsx passes
// `featured.slice(1)` — created_at DESC, per RF-1); the first product of
// what's left takes the large 2x2 slot, the rest fill 1x1 cells —
// docs/specs/public-catalog.md RF-1, docs/specs/design-system.md Home.
export function FeaturedBento({ products }: FeaturedBentoProps) {
  if (products.length === 0) {
    return null
  }

  const { hero, rest } = slotFeatured(products)

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <h2 className="font-heading text-3xl font-bold">Nuestros favoritos</h2>
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {hero ? (
          <div className="col-span-2 row-span-2">
            <ProductCard product={hero} large priority />
          </div>
        ) : null}
        {rest.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
