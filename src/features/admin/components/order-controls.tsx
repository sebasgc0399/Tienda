import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

import type { ActionResult } from "../lib/action-result"

type OrderControlsProps = {
  id: string
  reorderAction: (id: string, direction: "up" | "down") => Promise<ActionResult>
  disableUp?: boolean
  disableDown?: boolean
}

// React's <form action> prop type only allows (formData) => void |
// Promise<void>; our Server Actions return ActionResult so direct callers
// (e.g. category-delete-dialog.tsx) can read status/message. Bound and
// passed to <form action>, React discards whatever the action returns — the
// wider return type is only a TypeScript mismatch, not a runtime one.
type FormAction = (formData: FormData) => void | Promise<void>

// Two single-button mini-forms, each bound to the reorder Server Action via
// .bind() (Next.js's documented pattern for passing extra arguments to a
// Server Action) — no client JS required, works with JS disabled too
// (admin-panel.md RF-9: ▲▼ only, no free-text order input to avoid
// duplicate/gapped values). Stays a Server Component: nothing here needs
// client-side state.
export function OrderControls({
  id,
  reorderAction,
  disableUp = false,
  disableDown = false,
}: OrderControlsProps) {
  return (
    <div className="flex items-center gap-1">
      <form
        action={reorderAction.bind(null, id, "up") as unknown as FormAction}
      >
        <Button
          type="submit"
          variant="ghost"
          size="icon-sm"
          aria-label="Subir"
          disabled={disableUp}
        >
          <ChevronUpIcon aria-hidden="true" />
        </Button>
      </form>
      <form
        action={reorderAction.bind(null, id, "down") as unknown as FormAction}
      >
        <Button
          type="submit"
          variant="ghost"
          size="icon-sm"
          aria-label="Bajar"
          disabled={disableDown}
        >
          <ChevronDownIcon aria-hidden="true" />
        </Button>
      </form>
    </div>
  )
}
