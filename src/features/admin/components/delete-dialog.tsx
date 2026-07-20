"use client"

import type { ReactElement, ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type DeleteDialogProps = {
  trigger: ReactElement
  triggerLabel: ReactNode
  title: string
  description: ReactNode
  children?: ReactNode
  actions: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

// Generic confirmation shell for destructive/state-changing actions (RF-10,
// admin-panel.md): every such action in the panel opens through this
// Dialog. `actions` holds the caller's own submit control(s) — a bound
// <form action>, a useTransition handler, whatever the mutation needs — so
// each caller keeps ownership of its own pending state; "Cancelar" is the
// only behavior this component owns itself.
export function DeleteDialog({
  trigger,
  triggerLabel,
  title,
  description,
  children,
  actions,
  open,
  onOpenChange,
}: DeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={trigger}>{triggerLabel}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancelar
          </DialogClose>
          {actions}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
