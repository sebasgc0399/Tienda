import {
  buildWhatsappMessage,
  type MessageLineItem,
} from "./build-whatsapp-message"
import { truncateGraphemes } from "./truncate-graphemes"

// Adopted safe threshold for the full wa.me URL — docs/specs/
// cart-whatsapp-checkout.md "Longitud máxima de la URL wa.me".
export const WA_URL_MAX_LENGTH = 2000

// `allItems` is always the full cart (used for the total and the hidden
// count); `visibleItems` is the prefix actually rendered as numbered lines.
// The total is NEVER computed over `visibleItems` — the spec requires it to
// always reflect the whole cart, even when items are hidden. Delegates the
// actual line/total layout to buildWhatsappMessage so the contractual
// format (docs/specs/cart-whatsapp-checkout.md "Formato del mensaje") lives
// in exactly one module.
function buildMessage(
  allItems: MessageLineItem[],
  visibleItems: MessageLineItem[],
): string {
  const hiddenCount = allItems.length - visibleItems.length
  const total = allItems.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0,
  )

  return buildWhatsappMessage(visibleItems, {
    total,
    extraLine: hiddenCount > 0 ? `y ${hiddenCount} productos más` : undefined,
  })
}

function buildUrl(number: string, message: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}

function countGraphemes(value: string): number {
  return [
    ...new Intl.Segmenter("es", { granularity: "grapheme" }).segment(value),
  ].length
}

// Pathological fallback: even a single kept item (plus the "y N productos
// más" suffix for the rest, if any) overflows the cap — almost certainly a
// single item with a very long or emoji-heavy name. Binary-searches the
// longest grapheme-safe prefix of that name that still fits, appending "…".
// truncateGraphemes guarantees no surrogate pair is split, so
// encodeURIComponent never throws here.
function buildUrlWithTruncatedFirstName(
  number: string,
  allItems: MessageLineItem[],
): string {
  const [first] = allItems
  const graphemeCount = countGraphemes(first.name)

  let low = 0
  let high = graphemeCount - 1
  let bestName = "…"

  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    const candidateName = truncateGraphemes(first.name, mid) + "…"
    const candidateUrl = buildUrl(
      number,
      buildMessage(allItems, [{ ...first, name: candidateName }]),
    )

    if (candidateUrl.length <= WA_URL_MAX_LENGTH) {
      bestName = candidateName
      low = mid + 1
    } else {
      high = mid - 1
    }
  }

  return buildUrl(
    number,
    buildMessage(allItems, [{ ...first, name: bestName }]),
  )
}

// Builds the wa.me URL, staying within WA_URL_MAX_LENGTH for all realistic
// inputs and never throwing URIError. If the full message fits, uses it
// as-is. Otherwise drops trailing item lines one at a time (never the
// total, which always covers the whole cart) until it fits, appending "y N
// productos más". If even a single item doesn't fit, falls back to
// truncating that item's name toward "…" via
// buildUrlWithTruncatedFirstName. That fallback has a theoretical floor:
// if the URL is still over the cap even with the name reduced to the
// single character "…" (e.g. a pathologically long phone number), the
// returned URL can exceed WA_URL_MAX_LENGTH — there is no further
// fallback beyond that point.
export function buildWhatsappUrl(
  number: string,
  items: MessageLineItem[],
): string {
  const fullUrl = buildUrl(number, buildMessage(items, items))

  if (fullUrl.length <= WA_URL_MAX_LENGTH) {
    return fullUrl
  }

  for (let keepCount = items.length - 1; keepCount >= 1; keepCount--) {
    const visible = items.slice(0, keepCount)
    const url = buildUrl(number, buildMessage(items, visible))

    if (url.length <= WA_URL_MAX_LENGTH) {
      return url
    }
  }

  return buildUrlWithTruncatedFirstName(number, items)
}
