"use client"

import { Menu } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

import type { CategorySummary } from "../types"

type MobileNavProps = {
  categories: CategorySummary[]
  className?: string
}

const linkClassName =
  "focus-visible:ring-ring/50 rounded-md px-2 py-3 text-base font-medium outline-none focus-visible:ring-3"

export function MobileNav({ categories, className }: MobileNavProps) {
  const pathname = usePathname()

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Abrir menú"
            className={cn("size-11", className)}
          />
        }
      >
        <Menu aria-hidden="true" />
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Categorías</SheetTitle>
        </SheetHeader>
        {/* Flat list on purpose (no accordions) — design-system.md, Navegación > Mobile */}
        <nav aria-label="Categorías" className="flex flex-col gap-1 px-4 pb-4">
          <SheetClose
            nativeButton={false}
            render={
              <Link
                href="/"
                className={cn(
                  linkClassName,
                  pathname === "/" ? "text-primary" : "text-foreground",
                )}
              />
            }
          >
            Inicio
          </SheetClose>
          {categories.map((category) => {
            const href = `/categoria/${category.slug}`

            return (
              <SheetClose
                key={category.id}
                nativeButton={false}
                render={
                  <Link
                    href={href}
                    className={cn(
                      linkClassName,
                      pathname === href ? "text-primary" : "text-foreground",
                    )}
                  />
                }
              >
                {category.name}
              </SheetClose>
            )
          })}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
