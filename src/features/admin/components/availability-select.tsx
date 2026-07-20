"use client"

import { useTransition } from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ProductAvailability } from "@/types/database"

import { setProductAvailability } from "../actions/set-product-availability"
import { AVAILABILITY_OPTIONS } from "../lib/availability-options"

type AvailabilitySelectProps = {
  id: string
  value: ProductAvailability
  label: string
}

// RF-8 (admin-panel.md): inline availability change from the product list.
// Same "no local mirror, useTransition + router refresh" pattern as
// InlineToggle (see its doc comment) — value stays fully derived from the
// prop instead of local state, avoiding setState-in-effect (ESLint
// react-hooks v7 / React Compiler).
export function AvailabilitySelect({
  id,
  value,
  label,
}: AvailabilitySelectProps) {
  const [pending, startTransition] = useTransition()

  function handleValueChange(next: string | null) {
    if (!next) {
      return
    }
    startTransition(async () => {
      await setProductAvailability(id, next as ProductAvailability)
    })
  }

  return (
    <Select
      items={AVAILABILITY_OPTIONS}
      value={value}
      onValueChange={handleValueChange}
      disabled={pending}
    >
      <SelectTrigger aria-label={label} size="sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {AVAILABILITY_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
