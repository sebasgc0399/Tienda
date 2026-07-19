import { formatCurrency } from "@/lib/format-currency"
import type { Product } from "@/types/database"

type FeaturedStripProps = {
  products: Pick<Product, "id" | "slug" | "name" | "price">[]
}

export function FeaturedStrip({ products }: FeaturedStripProps) {
  if (products.length === 0) {
    return (
      <p className="text-muted-foreground">Aún no hay productos destacados.</p>
    )
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <li
          key={product.id}
          className="border-border bg-card rounded-lg border p-4"
        >
          {/* Placeholder box: seed data has no image binaries in Storage */}
          <div className="bg-secondary mb-3 aspect-square rounded-lg" />
          <h3 className="text-sm font-bold">{product.name}</h3>
          <p className="mt-1 text-sm">{formatCurrency(product.price)}</p>
        </li>
      ))}
    </ul>
  )
}
