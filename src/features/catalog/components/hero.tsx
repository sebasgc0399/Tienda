import Link from "next/link"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import type { FeaturedProduct } from "../types"
import { ProductImage } from "./product-image"

type HeroProps = {
  product?: FeaturedProduct
}

// Static, editorial hero (no autorotating carousel) — docs/specs/design-system.md, Home.
// When a featured product exists, both the CTA and the image link to it (the
// spec requires the hero image to be clickable to the product it depicts).
export function Hero({ product }: HeroProps) {
  return (
    <section
      className={cn(
        "mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 md:py-24",
        product ? "lg:grid-cols-2 lg:items-center" : null,
      )}
    >
      <div className="flex max-w-prose flex-col gap-6">
        <h1 className="font-heading text-4xl font-bold text-balance md:text-5xl">
          Detalles hechos a mano, pensados para regalar
        </h1>
        <p className="text-muted-foreground text-base">
          Cada detalle se arma a mano, pieza por pieza, para acompañar cada
          ocasión especial.
        </p>
        {product ? (
          <Button
            render={<Link href={`/producto/${product.slug}`} />}
            nativeButton={false}
            className="w-fit"
          >
            Ver producto
          </Button>
        ) : null}
      </div>

      {product ? (
        <Link
          href={`/producto/${product.slug}`}
          aria-label={`Ver ${product.name}`}
          className="group focus-visible:ring-ring/50 block rounded-lg outline-none focus-visible:ring-3"
        >
          <ProductImage
            image={product.image}
            name={product.name}
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
          />
        </Link>
      ) : null}
    </section>
  )
}
