// Pure slug generation from a category/product name (docs/specs/admin-panel.md,
// "Generación de slug"): NFD-normalize to split accented letters into their
// base letter + combining mark, strip the marks via the Unicode Diacritic
// property, lowercase, then collapse any run of characters outside [a-z0-9]
// into a single "-". Leading/trailing "-" are trimmed so punctuation at the
// edges never leaks into the slug.
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
