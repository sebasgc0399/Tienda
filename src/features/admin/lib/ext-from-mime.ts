// Storage key extension, derived from the already-validated MIME type — not
// from the client's filename (docs/specs/data-model.md, "Convención de
// storage_path"): a phone's "IMG_0001.jpg" can be a re-encoded PNG, so the
// MIME type is the only trustworthy source for the extension.
const MIME_TO_EXT = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const

type ImageExt = (typeof MIME_TO_EXT)[keyof typeof MIME_TO_EXT]

// Throws on anything outside the three accepted MIME types. This is
// unreachable in practice once validateImageFile() has run first — the
// throw exists to surface a bug loudly (e.g. this being called before
// validation) instead of silently writing a wrong/empty extension to Storage.
export function extFromMime(mime: string): ImageExt {
  if (mime in MIME_TO_EXT) {
    return MIME_TO_EXT[mime as keyof typeof MIME_TO_EXT]
  }

  throw new Error(`Unsupported image MIME type: ${mime}`)
}
