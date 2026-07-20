import { formatCurrency } from "@/lib/format-currency"
import type { ProductAvailability } from "@/types/database"

import { AddToCartButton } from "./add-to-cart-button"
import { AvailabilityBadge } from "./availability-badge"

type ProductBuyBoxProps = {
  name: string
  price: number
  availability: ProductAvailability
  description: string
}

// Content-only: the caller positions the sticky wrapper
// (lg:sticky lg:top-20 lg:self-start), this component just renders the box
// (docs/specs/design-system.md, PDP > Buy-box).
export function ProductBuyBox({
  name,
  price,
  availability,
  description,
}: ProductBuyBoxProps) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-3xl md:text-4xl">{name}</h1>
      <p className="text-2xl font-semibold">{formatCurrency(price)}</p>
      <AvailabilityBadge availability={availability} />
      <AddToCartButton availability={availability} productName={name} />
      <p className="text-muted-foreground whitespace-pre-line">{description}</p>
    </div>
  )
}
