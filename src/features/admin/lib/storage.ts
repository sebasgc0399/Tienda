import "server-only"

import type { createAdminClient } from "@/lib/supabase/admin"

const BUCKET = "product-images"

type AdminClient = ReturnType<typeof createAdminClient>

// Uploads a new object to Storage. Always `upsert: false` (data-model.md,
// "Convención de storage_path"): every upload targets a fresh
// {owner_id}/{uuid}.{ext} key, so an "Asset Already Exists" error signals a
// real bug (e.g. a retry racing itself), not something to paper over by
// overwriting.
export async function uploadObject(
  admin: AdminClient,
  key: string,
  file: File,
): Promise<void> {
  const { error } = await admin.storage.from(BUCKET).upload(key, file, {
    upsert: false,
    contentType: file.type,
  })

  if (error) {
    throw new Error(`Failed to upload object "${key}": ${error.message}`)
  }
}

// Removes an object from Storage. Tolerates a "not found" failure on
// purpose: this is called from best-effort cleanup paths (e.g. deleting the
// previous cover after a new one has already been saved) where the object
// may legitimately already be gone — that is not a reason to fail a
// mutation that already committed successfully elsewhere. Any OTHER storage
// error still throws so a genuine failure is not silently swallowed.
export async function removeObject(
  admin: AdminClient,
  key: string,
): Promise<void> {
  const { error } = await admin.storage.from(BUCKET).remove([key])

  if (error && !/not.?found/i.test(error.message)) {
    throw new Error(`Failed to remove object "${key}": ${error.message}`)
  }
}
