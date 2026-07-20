import type { NextConfig } from "next"

const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined

const nextConfig: NextConfig = {
  images: {
    // Product images are served from each fork's own Supabase Storage bucket,
    // so the allowed hostname derives from the env instead of being hardcoded.
    remotePatterns: supabaseHostname
      ? [
          {
            protocol: "https",
            hostname: supabaseHostname,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
  experimental: {
    // Still under `experimental` in Next 16.2.10 (verified against this
    // project's installed next/dist/server/config-shared.d.ts and the
    // v16.2.9 docs — it has not moved to a top-level key). Default is 1MB;
    // raised to cover the 5MB image cap (validate-image-file.ts) plus
    // multipart/form-data overhead. Unblocks both the product image
    // uploader (image-uploader.tsx) and the category CoverUploader, which
    // hit the default limit before this change.
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
}

export default nextConfig
