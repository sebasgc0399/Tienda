import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { createProxyClient } from "@/lib/supabase/proxy"

// Detects the Supabase auth cookie — chunked as `sb-<ref>-auth-token.0`,
// `.1`, ... for large tokens — so the login redirect can tell "session just
// expired" (cookies were present but invalid) apart from "first visit, no
// session at all". Read from the ORIGINAL request, before getClaims() can
// mutate request.cookies via a token refresh (CLAUDE.md §9 / RF-2: the
// expiry banner only applies to the first case).
const AUTH_COOKIE_PATTERN = /^sb-.*-auth-token/

export default async function proxy(request: NextRequest) {
  const hadAuthCookies = request.cookies
    .getAll()
    .some((cookie) => AUTH_COOKIE_PATTERN.test(cookie.name))

  const client = createProxyClient(request)

  // CLAUDE.md §9: call getClaims() immediately after creating the client,
  // on every matched request — this is what rotates/persists the session
  // token. `client.response` is read AFTER this await (never destructured
  // alongside `supabase` above it): a token refresh writes the rotated
  // cookies into it during this call, so reading it earlier would ship
  // stale cookies to the browser.
  const { data } = await client.supabase.auth.getClaims()
  const response = client.response

  // /admin/login always passes — no auto-redirect for an already-logged-in
  // user in v1 (plan decision: "Login/logout").
  if (request.nextUrl.pathname.startsWith("/admin/login")) {
    return response
  }

  if (data) {
    return response
  }

  const loginUrl = new URL("/admin/login", request.url)
  if (hadAuthCookies) {
    loginUrl.searchParams.set("motivo", "expirada")
  }

  const redirectResponse = NextResponse.redirect(loginUrl)
  // Carry over any cookies the token-refresh attempt wrote (rotated or
  // cleared) so the browser stays in sync even on the redirect path.
  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie)
  })

  return redirectResponse
}

// RF-2 (admin-panel.md): only /admin/** pays the proxy cost — the public
// catalog (ISR) never runs this.
export const config = {
  matcher: ["/admin/:path*"],
}
