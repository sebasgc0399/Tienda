// Client-side pre-check before uploading to Storage (docs/specs/admin-panel.md
// RF-5). This is a UX shortcut, NOT the security/authoritative boundary —
// the same rules must be re-checked server-side before the actual upload.
export const ACCEPTED_MIME = ["image/jpeg", "image/png", "image/webp"] as const

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

// Exact copy from docs/specs/admin-panel.md, "Casos borde" (RF-5), reused
// for both the wrong-type and the too-heavy case so the UI never needs to
// pick between two near-identical messages.
const ERROR_MESSAGE = "La imagen debe ser JPG, PNG o WEBP y pesar menos de 5 MB"

type ImageFileLike = { type: string; size: number }

export type ImageFileValidation = { ok: true } | { ok: false; message: string }

export function validateImageFile(file: ImageFileLike): ImageFileValidation {
  const isAcceptedType = (ACCEPTED_MIME as readonly string[]).includes(
    file.type,
  )

  // Strict "<": the spec copy says "pesar menos de 5 MB" ("weigh LESS THAN
  // 5 MB"), so a file exactly at MAX_IMAGE_BYTES is not "less than" the
  // limit and must be rejected, not accepted at the boundary.
  const isUnderLimit = file.size < MAX_IMAGE_BYTES

  if (!isAcceptedType || !isUnderLimit) {
    return { ok: false, message: ERROR_MESSAGE }
  }

  return { ok: true }
}
