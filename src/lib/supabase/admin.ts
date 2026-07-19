import "server-only"

import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Admin client (service_role key): BYPASSES RLS. Only for server-side
// mutations (admin panel Server Actions). The "server-only" import makes
// any client-bundle inclusion a build error (CLAUDE.md section 9).
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set")
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { persistSession: false } },
  )
}
