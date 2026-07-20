import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { getProductBySlug } from "@/features/catalog/actions/get-product-by-slug"
import { getProductSlugs } from "@/features/catalog/actions/get-product-slugs"
import { MobileBuyBar } from "@/features/catalog/components/mobile-buy-bar"
import { ProductBuyBox } from "@/features/catalog/components/product-buy-box"
import { ProductGallery } from "@/features/catalog/components/product-gallery"
import { pickPrimaryImage } from "@/features/catalog/lib/pick-primary-image"
import { getPublicImageUrl } from "@/lib/supabase/storage-url"

type ProductPageProps = {
  params: Promise<{ slug: string }>
}

const DESCRIPTION_MAX_LENGTH = 160

// Truncates at a word boundary near DESCRIPTION_MAX_LENGTH — a simple,
// SEO-friendly excerpt, not a full summarization algorithm.
function truncateDescription(description: string): string {
  if (description.length <= DESCRIPTION_MAX_LENGTH) {
    return description
  }

  return `${description.slice(0, DESCRIPTION_MAX_LENGTH).replace(/\s+\S*$/, "")}…`
}

// Prebuild every active product at build time (ISR, revalidate = 3600
// inherited from (public)/layout.tsx).
export async function generateStaticParams() {
  const slugs = await getProductSlugs()

  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    return {}
  }

  const primaryImage = pickPrimaryImage(product.images)

  return {
    title: product.name,
    description: truncateDescription(product.description),
    openGraph: primaryImage
      ? { images: [getPublicImageUrl(primaryImage.storage_path)] }
      : undefined,
  }
}

// RF-4 (public-catalog.md): gallery + name + description + price +
// availability. An inactive or nonexistent product collapses to 404 (edge
// case, same doc) via getProductBySlug's categories!inner join.
export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <Link
        href={`/categoria/${product.category.slug}`}
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 mb-6 inline-block rounded-md text-sm outline-none focus-visible:ring-3"
      >
        ← {product.category.name}
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProductGallery images={product.images} name={product.name} />
        </div>

        <div className="lg:sticky lg:top-20 lg:self-start">
          <MobileBuyBar
            name={product.name}
            price={product.price}
            availability={product.availability}
          >
            <ProductBuyBox
              name={product.name}
              price={product.price}
              availability={product.availability}
              description={product.description}
            />
          </MobileBuyBar>
        </div>
      </div>
    </div>
  )
}
