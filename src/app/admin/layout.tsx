// Force-dynamic: every /admin/** request must re-check the session
// (admin-panel.md, RF-2) instead of serving a cached/static render.
export const dynamic = "force-dynamic"

// Minimal shell shared by /admin/login and the protected (panel) segment:
// no public header/footer/CartProvider — the root layout already provides
// fonts and theme tokens. The (panel) layout adds its own full-width chrome
// (nav + main) on top of this centered wrapper.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-muted/30 flex min-h-svh flex-col items-center justify-center p-4">
      {children}
    </div>
  )
}
