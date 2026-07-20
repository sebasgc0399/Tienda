import { CartProvider } from "@/features/cart/components/cart-provider"
import { getCategories } from "@/features/catalog/actions/get-categories"
import { SiteFooter } from "@/features/catalog/components/site-footer"
import { SiteHeader } from "@/features/catalog/components/site-header"

// ISR: this segment (and every page under it) is prebuilt and revalidated
// hourly instead of rendered per-request — see the plan's ISR decision and
// CLAUDE.md section 3 (public client has no cookies(), so it stays static).
export const revalidate = 3600

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const categories = await getCategories()

  return (
    <CartProvider>
      <SiteHeader categories={categories} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </CartProvider>
  )
}
