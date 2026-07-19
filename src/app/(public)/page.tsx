import { getCategories } from "@/features/catalog/actions/get-categories"
import { getFeaturedProducts } from "@/features/catalog/actions/get-featured-products"
import { CategoryList } from "@/features/catalog/components/category-list"
import { FeaturedStrip } from "@/features/catalog/components/featured-strip"

// Temporary data-proof home: verifies DB + RLS + theme + fonts end-to-end.
// The real catalog home replaces this (docs/specs/public-catalog.md).
export default async function HomePage() {
  const hasSupabaseEnv =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  const [categories, products] = hasSupabaseEnv
    ? await Promise.all([getCategories(), getFeaturedProducts()])
    : [[], []]

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <h1 className="font-heading text-4xl font-bold text-balance">
        Detalles hechos a mano, pensados para regalar
      </h1>
      {!hasSupabaseEnv ? (
        <p className="text-muted-foreground mt-4 text-sm">
          Configura las variables de entorno de Supabase para ver datos reales
          (ver docs/guides/setup-desde-cero.md).
        </p>
      ) : null}
      <section className="mt-12">
        <h2 className="font-heading text-3xl font-bold">Nuestras categorías</h2>
        <div className="mt-6">
          <CategoryList categories={categories} />
        </div>
      </section>
      <section className="mt-12">
        <h2 className="font-heading text-3xl font-bold">Los favoritos</h2>
        <div className="mt-6">
          <FeaturedStrip products={products} />
        </div>
      </section>
    </main>
  )
}
