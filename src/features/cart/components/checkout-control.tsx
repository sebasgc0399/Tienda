"use client"

import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { buildWhatsappUrl } from "../lib/build-whatsapp-url"
import type { CartItem } from "../lib/cart-types"

export type CheckoutPhase = "idle" | "revalidating" | "ready" | "error"

type CheckoutControlProps = {
  phase: CheckoutPhase
  hasBlocking: boolean
  reconciled: CartItem[] | null
  onCheckout: () => void
}

// RF-8: never hardcoded, read once at module scope — Next.js inlines
// NEXT_PUBLIC_* references at build time, so this is safe to read directly
// in a client component and doesn't need to be threaded down as a prop
// (same pattern as site-header.tsx / site-footer.tsx).
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER

// Two-phase checkout footer control (RF-7; plan decision "Apertura
// wa.me"). Press 1 (idle/error -> revalidating) is a plain <button> that
// can never open a tab by itself. Only once revalidation reports no
// blocking outcomes does the control become a real `<a href>` built from
// reconciled (fresh) data — press 2 is then an ordinary anchor click in a
// real user gesture, immune to popup blockers (unlike a programmatic
// window.open() after an await). Purely presentational: the checkout state
// machine and the anti-stale guard live in cart-sheet.tsx, which also needs
// the same outcomes/reconciled data for the item rows.
export function CheckoutControl({
  phase,
  hasBlocking,
  reconciled,
  onCheckout,
}: CheckoutControlProps) {
  if (!WHATSAPP_NUMBER) {
    return (
      <div className="flex flex-col gap-1">
        <Button type="button" className="w-full" disabled>
          Pedir por WhatsApp
        </Button>
        <p className="text-muted-foreground text-xs">
          El número de WhatsApp no está configurado.
        </p>
      </div>
    )
  }

  if (phase === "ready" && reconciled) {
    // Built only here, in the ready render path, from reconciled (fresh)
    // data — never stored in state ahead of time, so there is a single
    // source of truth for the URL the customer actually opens.
    const href = buildWhatsappUrl(
      WHATSAPP_NUMBER,
      reconciled.map(({ name, quantity, price }) => ({
        name,
        quantity,
        price,
      })),
    )

    return (
      <div className="flex flex-col gap-1">
        <p className="text-muted-foreground text-xs">
          Pedido verificado. Revisa el mensaje antes de enviarlo.
        </p>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: "default" }), "w-full")}
        >
          Abrir WhatsApp
        </a>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {hasBlocking ? (
        <p role="alert" className="text-destructive text-sm">
          Algunos productos ya no están disponibles. Quítalos para continuar.
        </p>
      ) : null}
      {phase === "error" ? (
        <p role="alert" className="text-destructive text-sm">
          No se pudo verificar el carrito. Intenta de nuevo.
        </p>
      ) : null}
      <Button
        type="button"
        className="w-full"
        disabled={phase === "revalidating" || hasBlocking}
        aria-busy={phase === "revalidating"}
        onClick={onCheckout}
      >
        {phase === "revalidating"
          ? "Verificando disponibilidad…"
          : "Pedir por WhatsApp"}
      </Button>
    </div>
  )
}
