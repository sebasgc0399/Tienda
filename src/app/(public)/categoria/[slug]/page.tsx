import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCategories } from "@/features/catalog/actions/get-categories"
import { getCategoryBySlug } from "@/features/catalog/actions/get-category-by-slug"
import { getProductsByCategory } from "@/features/catalog/actions/get-products-by-category"
import { ProductCard } from "@/features/catalog/components/product-card"

type CategoryPageProps = {
  params: Promise<{ slug: string }>
}

// Prebuild every active category at build time (ISR, revalidate = 3600
// inherited from (public)/layout.tsx) — new categories appear after the
// next revalidation window instead of needing a redeploy.
export async function generateStaticParams() {
  const categories = await getCategories()

  return categories.map((category) => ({ slug: category.slug }))
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)

  if (!category) {
    return {}
  }

  return {
    title: category.name,
    description: category.description ?? undefined,
  }
}

// RF-3 (public-catalog.md): products ordered by display_order ascending,
// as returned by getProductsByCategory — no re-sort here. An inactive or
// nonexistent category collapses to 404 (edge case, same doc).
export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)

  if (!category) {
    notFound()
  }

  const products = await getProductsByCategory(category.id)

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <header>
        <h1 className="font-display text-3xl md:text-4xl">{category.name}</h1>
        {category.description ? (
          <p className="text-muted-foreground mt-4 max-w-2xl">
            {category.description}
          </p>
        ) : null}
      </header>

      {products.length === 0 ? (
        <p className="text-muted-foreground py-16 text-center">
          Sin productos por el momento
        </p>
      ) : (
        <>
          <h2 className="sr-only">Productos</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
