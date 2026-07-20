import "server-only"

import type { User } from "@supabase/supabase-js"

import { createClient } from "@/lib/supabase/server"

// Thrown by requireAdmin() when there is no valid, server-verified user.
// Mutating Server Actions catch this via withAdmin() and convert it into an
// ActionResult "session_expired" instead of redirecting — a redirect would
// discard the in-progress form. useActionState then re-renders in place
// with the typed data still on screen (admin-panel.md, "Sesión expirada"
// edge case).
export class SessionExpiredError extends Error {
  constructor() {
    super("Session expired")
    this.name = "SessionExpiredError"
  }
}

// getUser() round-trips to the Supabase Auth server — never getSession(),
// whose embedded user is unverified client-side state (admin-panel.md,
// Seguridad).
export async function getAdminUser(): Promise<User | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    return null
  }

  return data.user
}

// First line of every mutating admin Server Action (admin-panel.md,
// Seguridad): the /admin/** redirect (RF-2) is UX for the owner, not the
// security boundary — Server Actions are independent POST endpoints that
// Next.js does not protect just because the calling page lives under
// /admin/**.
export async function requireAdmin(): Promise<User> {
  const user = await getAdminUser()

  if (!user) {
    throw new SessionExpiredError()
  }

  return user
}
