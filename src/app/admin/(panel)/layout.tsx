import Link from "next/link"
import { redirect } from "next/navigation"

import { LogoutButton } from "@/features/admin/components/logout-button"
import { getAdminUser } from "@/features/admin/lib/auth"

// RF-2 (admin-panel.md): UX-level gate for the protected screens — not the
// security boundary (that's requireAdmin() on every mutating Server
// Action, see CLAUDE.md §9).
export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getAdminUser()

  if (!user) {
    redirect("/admin/login")
  }

  return (
    <div className="flex w-full max-w-5xl flex-1 flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-6">
          <Link
            href="/admin/productos"
            className="font-heading text-lg font-semibold"
          >
            Tienda · Admin
          </Link>
          <nav className="text-muted-foreground flex items-center gap-4 text-sm">
            <Link href="/admin/productos" className="hover:text-foreground">
              Productos
            </Link>
            <Link href="/admin/categorias" className="hover:text-foreground">
              Categorías
            </Link>
          </nav>
        </div>
        <LogoutButton />
      </header>

      <main className="flex-1">{children}</main>
    </div>
  )
}
