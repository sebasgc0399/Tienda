import { getFeaturedProducts } from "@/features/catalog/actions/get-featured-products"
import { BrandStory } from "@/features/catalog/components/brand-story"
import { FeaturedBento } from "@/features/catalog/components/featured-bento"
import { Hero } from "@/features/catalog/components/hero"

export default async function HomePage() {
  const featured = await getFeaturedProducts()

  return (
    <>
      <Hero product={featured[0]} />
      <FeaturedBento products={featured.slice(1)} />
      <BrandStory />
    </>
  )
}
