import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Productos",
}

// Placeholder — replaced by the product list/CRUD in a later slice.
export default function ProductosPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold">Productos</h1>
      <p className="text-muted-foreground mt-2">Próximamente.</p>
    </div>
  )
}
