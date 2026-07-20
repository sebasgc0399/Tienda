import type { ActionResult } from "../lib/action-result"

type FormAlertProps = {
  state: ActionResult | null
}

// Top-of-form banner for both the generic "error" status and
// "session_expired" (admin-panel.md, "Sesión expirada" edge case): on
// session_expired, withAdmin() returns a result instead of throwing, so
// useActionState re-renders the form in place — no redirect, no data loss —
// and this banner is what tells the owner why the save didn't go through.
export function FormAlert({ state }: FormAlertProps) {
  if (!state || state.status === "success") {
    return null
  }

  return (
    <p
      role="alert"
      className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm"
    >
      {state.message}
    </p>
  )
}
