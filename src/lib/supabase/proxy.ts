import { createServerClient } from "@supabase/ssr"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

// Request/response cookie bridge for src/proxy.ts — the official
// @supabase/ssr Next.js middleware pattern (see supabase/ssr docs and
// vercel/next.js's examples/with-supabase/lib/supabase/proxy.ts), adapted
// to Next.js 16 proxy naming. setAll writes rotated cookies to BOTH
// request.cookies (so this same request sees them if code reads cookies
// again downstream) and a freshly regenerated NextResponse.
//
// The response is recreated (not just mutated) on every setAll call
// because `NextResponse.next({ request })` snapshots the request headers
// at call time — reusing the original response object after mutating
// request.cookies would ship the pre-rotation headers to the next handler.
//
// `response` is exposed as a getter, not a plain property: setAll can run
// during `await supabase.auth.getClaims()` in src/proxy.ts, which happens
// AFTER this function has already returned. Callers must read `.response`
// only after that await settles (see src/proxy.ts) — reading it earlier
// (e.g. via early destructuring) would capture the stale pre-rotation
// response.
export function createProxyClient(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
          Object.entries(headers).forEach(([key, value]) =>
            response.headers.set(key, value),
          )
        },
      },
    },
  )

  return {
    supabase,
    get response() {
      return response
    },
  }
}
