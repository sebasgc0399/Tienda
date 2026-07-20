const DEFAULT_BUCKET = "product-images"

// Pure string builder for Supabase Storage public object URLs. No
// "server-only" here on purpose: NEXT_PUBLIC_ vars are inlined client-side,
// and this needs to be importable from client components too.
export function getPublicImageUrl(
  storagePath: string,
  bucket: string = DEFAULT_BUCKET,
): string {
  const baseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(
    /\/+$/,
    "",
  )
  const path = storagePath.replace(/^\/+/, "")

  return `${baseUrl}/storage/v1/object/public/${bucket}/${path}`
}
