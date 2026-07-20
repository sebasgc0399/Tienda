import { ShoppingBag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type CartButtonProps = {
  className?: string
}

// TODO(cart): wire to cart trigger when features/cart lands
export function CartButton({ className }: CartButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Carrito"
      inert
      className={cn("size-11", className)}
    >
      <ShoppingBag aria-hidden="true" />
    </Button>
  )
}
