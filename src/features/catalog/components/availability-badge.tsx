import { cn } from "@/lib/utils"
import type { ProductAvailability } from "@/types/database"

import { getAvailabilityLabel } from "../lib/availability"

type AvailabilityBadgeProps = {
  availability: ProductAvailability
  className?: string
}

// Sage is reserved for tags/badges only (docs/specs/design-system.md,
// direction A "Barrio Cálido"). bg-sage/20 + text-foreground keeps AA
// contrast comfortably above 4.5:1 since foreground text stays dark
// regardless of the light sage tint behind it.
export function AvailabilityBadge({
  availability,
  className,
}: AvailabilityBadgeProps) {
  const label = getAvailabilityLabel(availability)

  if (!label) {
    return null
  }

  return (
    <span
      className={cn(
        "w-fit rounded-md px-2 py-0.5 text-sm font-medium",
        availability === "out_of_stock"
          ? "bg-muted text-muted-foreground"
          : "bg-sage/20 text-foreground",
        className,
      )}
    >
      {label}
    </span>
  )
}
