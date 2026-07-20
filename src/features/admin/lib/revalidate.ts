import "server-only"

import { revalidatePath } from "next/cache"

// Revalidates the whole app, not a narrower path: the (public) layout
// renders the category nav (mega-menu) on every public route, so a
// path-scoped revalidation would miss nav changes and slug renames on
// routes other than the one that triggered the mutation. "/" with type
// "layout" walks up to the root layout, which every route (public and
// /admin/**) shares, so this also keeps the admin lists themselves fresh
// after a mutation (plan "Revalidación ISR").
export function revalidatePublicCatalog(): void {
  revalidatePath("/", "layout")
}
