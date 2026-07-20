import { AddToCartButton } from "@/features/cart/components/add-to-cart-button"
import { formatCurrency } from "@/lib/format-currency"
import type { ProductAvailability } from "@/types/database"

import type { ProductImageRef } from "../types"
import { AvailabilityBadge } from "./availability-badge"

type ProductBuyBoxProps = {
  id: string
  slug: string
  name: string
  price: number
  availability: ProductAvailability
  description: string
  image: ProductImageRef | null
}

// Content-only: the caller positions the sticky wrapper
// (lg:sticky lg:top-20 lg:self-start), this component just renders the box
// (docs/specs/design-system.md, PDP > Buy-box).
export function ProductBuyBox({
  id,
  slug,
  name,
  price,
  availability,
  description,
  image,
}: ProductBuyBoxProps) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-3xl md:text-4xl">{name}</h1>
      <p className="text-2xl font-semibold">{formatCurrency(price)}</p>
      <AvailabilityBadge availability={availability} />
      <AddToCartButton
        productId={id}
        slug={slug}
        name={name}
        price={price}
        availability={availability}
        image={image}
      />
      <p className="text-muted-foreground whitespace-pre-line">{description}</p>
    </div>
  )
}
