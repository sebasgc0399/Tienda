import { createClient } from "@/lib/supabase/client"

import type { FreshProductRow } from "./reconcile-cart"

// Impure (network I/O) — deliberately has no unit test; covered by the
// Playwright end-to-end pass instead. Browser client (anon key): subject to
// RLS, so an inactive/deleted product simply comes back as an absent row,
// which reconcileCart already treats as "removed".
export async function fetchFreshRows(
  productIds: string[],
): Promise<FreshProductRow[]> {
  if (productIds.length === 0) {
    return []
  }

  const supabase = createClient()

  const { data, error } = await supabase
    .from("products")
    .select("id, availability, is_active, price")
    .in("id", productIds)

  if (error) {
    throw new Error(`Failed to revalidate cart: ${error.message}`)
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    availability: row.availability,
    is_active: row.is_active,
    price: row.price,
  }))
}
