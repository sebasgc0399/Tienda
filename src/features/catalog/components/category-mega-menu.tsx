"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

import type { CategorySummary } from "../types"

type CategoryMegaMenuProps = {
  categories: CategorySummary[]
  className?: string
}

// NN/g "Timing Guidelines for Exposing Hidden Content": open delay 500ms,
// reveal transition 100ms, close delay 500ms (docs/specs/design-system.md).
const OPEN_DELAY_MS = 500
const CLOSE_DELAY_MS = 500

export function CategoryMegaMenu({
  categories,
  className,
}: CategoryMegaMenuProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function clearTimers() {
    if (openTimer.current) clearTimeout(openTimer.current)
    if (closeTimer.current) clearTimeout(closeTimer.current)
    openTimer.current = null
    closeTimer.current = null
  }

  // Timers are only for pointer hover-intent; keyboard focus and clicks
  // react immediately (a timed delay on a deliberate keyboard/click action
  // would just feel like lag, not an accidental-hover guard).
  function handleMouseEnter() {
    clearTimers()
    openTimer.current = setTimeout(() => setOpen(true), OPEN_DELAY_MS)
  }

  function handleMouseLeave() {
    clearTimers()
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS)
  }

  function handleTriggerClick() {
    clearTimers()
    setOpen((current) => !current)
  }

  function handleFocus() {
    clearTimers()
    setOpen(true)
  }

  function handleBlur(event: React.FocusEvent<HTMLElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      clearTimers()
      setOpen(false)
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      clearTimers()
      setOpen(false)
      triggerRef.current?.focus()
    }
  }

  useEffect(() => clearTimers, [])

  if (categories.length === 0) {
    return null
  }

  return (
    <nav
      aria-label="Categorías"
      className={cn("relative", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={handleTriggerClick}
        className="hover:bg-muted focus-visible:ring-ring/50 flex h-11 items-center rounded-md px-3 text-sm font-medium outline-none focus-visible:ring-3"
      >
        Categorías
      </button>

      <div
        data-state={open ? "open" : "closed"}
        inert={!open}
        className="border-border bg-popover absolute top-full left-0 max-h-[70vh] w-[min(90vw,40rem)] overflow-y-auto rounded-b-lg border p-4 shadow-lg transition-[opacity,transform] duration-100 ease-out data-[state=closed]:-translate-y-1 data-[state=closed]:opacity-0 data-[state=open]:translate-y-0 data-[state=open]:opacity-100 motion-reduce:transition-none"
      >
        <ul className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
          {categories.map((category) => {
            const href = `/categoria/${category.slug}`
            const isActive = pathname === href

            return (
              <li key={category.id}>
                <Link
                  href={href}
                  className={cn(
                    "font-heading focus-visible:ring-ring/50 block rounded-md px-2 py-1.5 text-base font-semibold outline-none focus-visible:ring-3",
                    isActive
                      ? "text-primary"
                      : "text-foreground hover:text-primary",
                  )}
                >
                  {category.name}
                </Link>
                {category.description ? (
                  <p className="text-muted-foreground mt-1 px-2 text-sm">
                    {category.description}
                  </p>
                ) : null}
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
