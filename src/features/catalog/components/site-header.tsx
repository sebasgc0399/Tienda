import { MessageCircle } from "lucide-react"
import Link from "next/link"

import type { CategorySummary } from "../types"
import { CartButton } from "./cart-button"
import { CategoryMegaMenu } from "./category-mega-menu"
import { MobileNav } from "./mobile-nav"

type SiteHeaderProps = {
  categories: CategorySummary[]
}

export function SiteHeader({ categories }: SiteHeaderProps) {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER

  return (
    <header className="bg-background/95 border-border supports-backdrop-filter:bg-background/80 sticky top-0 z-40 border-b backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="font-heading focus-visible:ring-ring/50 rounded-md text-xl font-bold outline-none focus-visible:ring-3"
        >
          Tienda
        </Link>

        <CategoryMegaMenu categories={categories} className="hidden lg:flex" />

        <div className="flex items-center gap-1">
          <CartButton />
          {whatsappNumber ? (
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Pedir por WhatsApp"
              className="hover:bg-muted focus-visible:ring-ring/50 flex size-11 items-center justify-center rounded-md outline-none focus-visible:ring-3"
            >
              <MessageCircle className="size-5" aria-hidden="true" />
            </a>
          ) : null}
          <MobileNav categories={categories} className="lg:hidden" />
        </div>
      </div>
    </header>
  )
}
