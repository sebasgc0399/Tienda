import { Button } from "@/components/ui/button"

import { logout } from "../actions/logout"

// Plain <form action> bound to the server action: no client JS needed for
// a single submit button, so this stays a Server Component.
export function LogoutButton() {
  return (
    <form action={logout}>
      <Button type="submit" variant="outline" size="sm">
        Cerrar sesión
      </Button>
    </form>
  )
}
