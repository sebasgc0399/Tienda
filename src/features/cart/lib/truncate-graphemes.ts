// Grapheme-safe truncation for product names embedded in the WhatsApp
// message (used by build-whatsapp-url.ts's pathological-name fallback). A
// raw string.slice()/substring() can split a surrogate pair mid-emoji,
// producing a lone surrogate that makes encodeURIComponent throw a
// URIError downstream — docs/specs/cart-whatsapp-checkout.md, "Caracteres
// especiales y emojis" explicitly calls this out.
export function truncateGraphemes(value: string, maxGraphemes: number): string {
  const segmenter = new Intl.Segmenter("es", { granularity: "grapheme" })
  const graphemes = [...segmenter.segment(value)].map(
    (segment) => segment.segment,
  )

  if (graphemes.length <= maxGraphemes) {
    return value
  }

  return graphemes.slice(0, maxGraphemes).join("")
}
