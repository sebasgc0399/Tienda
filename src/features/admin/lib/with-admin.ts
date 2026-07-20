import "server-only"

import type { User } from "@supabase/supabase-js"

import type { ActionResult } from "./action-result"
import { sessionExpired } from "./action-result"
import { requireAdmin, SessionExpiredError } from "./auth"

// Wraps a mutating admin Server Action: verifies the session first
// (requireAdmin — admin-panel.md, Seguridad), then converts an expired
// session into an ActionResult instead of letting it throw, so
// useActionState can re-render the in-progress form (see SessionExpiredError
// doc comment in ./auth). Any other error propagates — it is a real bug,
// not an expected UX case this wrapper should paper over.
export async function withAdmin<T>(
  fn: (user: User) => Promise<ActionResult<T>>,
): Promise<ActionResult<T>> {
  let user: User

  try {
    user = await requireAdmin()
  } catch (error) {
    if (error instanceof SessionExpiredError) {
      return sessionExpired<T>()
    }
    throw error
  }

  return fn(user)
}
