import "server-only"

import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Cookie-less anon client for public catalog reads: no `cookies()` call, so
// pages using it stay ISR-compatible (static render + revalidate) instead of
// being forced into dynamic rendering. Still 100% subject to RLS (anon role)
// — it never bypasses policies, unlike ./admin. Session-bound reads (admin
// panel, authenticated flows) keep using ./server.
export function hasSupabaseEnv(): boolean {
  return (
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  )
}

export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
}
