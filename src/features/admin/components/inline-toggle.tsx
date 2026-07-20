"use client"

import { useTransition } from "react"

import { Switch } from "@/components/ui/switch"

import type { ActionResult } from "../lib/action-result"

type InlineToggleProps = {
  id: string
  checked: boolean
  action: (id: string, next: boolean) => Promise<ActionResult>
  label: string
}

// Switch bound to a Server Action call wrapped in useTransition — no
// setState-in-effect (ESLint react-hooks v7 / React Compiler): this
// component keeps no local mirror of `checked`, it stays fully derived from
// the prop. After the action resolves, revalidatePublicCatalog() marks the
// whole app (including this admin route) stale, and the automatic router
// refresh that follows a Server Action call brings the new value back down
// as a prop — simpler than optimistic local state, at the cost of a small
// visual delay while `pending` is true.
export function InlineToggle({
  id,
  checked,
  action,
  label,
}: InlineToggleProps) {
  const [pending, startTransition] = useTransition()

  function handleCheckedChange(next: boolean) {
    startTransition(async () => {
      await action(id, next)
    })
  }

  return (
    <Switch
      checked={checked}
      onCheckedChange={handleCheckedChange}
      disabled={pending}
      aria-label={label}
    />
  )
}
