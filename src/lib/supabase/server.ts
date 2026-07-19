import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Session-bound server client (anon key + cookies): RLS applies.
// This is the client Server Components use for public catalog reads
// (CLAUDE.md section 3).
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
