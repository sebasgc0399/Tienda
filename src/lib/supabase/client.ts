import { createBrowserClient } from "@supabase/ssr"

// Browser client (anon key): RLS applies. For "use client" leaves only.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
