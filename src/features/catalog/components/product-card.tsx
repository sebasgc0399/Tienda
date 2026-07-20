import Link from "next/link"

import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/format-currency"
import { cn } from "@/lib/utils"

import type { ProductCardData } from "../types"
import { AvailabilityBadge } from "./availability-badge"
import { ProductImage } from "./product-image"

type ProductCardProps = {
  product: ProductCardData
  large?: boolean
  priority?: boolean
}

// Fixed anatomy: image -> name -> price -> availability
// (docs/specs/design-system.md, Product card). The whole card is a single
// Link — no nested links inside — and carries the "group" class so
// ProductImage's baked-in hover-zoom classes activate on hover/focus.
export function ProductCard({
  product,
  large = false,
  priority = false,
}: ProductCardProps) {
  return (
    <Link
      href={`/producto/${product.slug}`}
      className="group focus-visible:ring-ring/50 block rounded-lg outline-none focus-visible:ring-3"
    >
      <Card className="h-full">
        <CardContent className="flex flex-col gap-3">
          <ProductImage
            image={product.image}
            name={product.name}
            priority={priority}
            sizes={
              large
                ? "(min-width: 1024px) 50vw, 100vw"
                : "(min-width: 1024px) 25vw, 50vw"
            }
          />
          <div className="flex flex-col gap-1">
            <h3
              className={cn(
                "font-heading line-clamp-2 font-bold",
                large ? "text-xl" : "text-base",
              )}
            >
              {product.name}
            </h3>
            <p className={cn("font-medium", large ? "text-lg" : "text-sm")}>
              {formatCurrency(product.price)}
            </p>
            <AvailabilityBadge availability={product.availability} />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
