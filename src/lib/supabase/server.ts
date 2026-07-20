import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Session-bound server client (anon key + cookies): RLS applies.
// For session-dependent reads (admin panel, authenticated flows). Public
// catalog reads use ./public instead, which skips cookies() to stay
// ISR-compatible (CLAUDE.md section 3).
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Cookie writes are not allowed during Server Component render;
            // session refresh happens in the proxy instead.
          }
        },
      },
    },
  )
}
