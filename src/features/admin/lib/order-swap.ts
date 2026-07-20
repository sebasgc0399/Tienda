// Pure computation for the ▲▼ reorder controls (docs/specs/admin-panel.md,
// RF-9): given a list already sorted by display_order ascending, returns the
// display_order updates needed to move one row past its adjacent neighbor.
// `list` is scoped by the caller to whatever the order is relative to
// (products within one category, or categories globally).
export type OrderUpdate = { id: string; display_order: number }

type Orderable = { id: string; display_order: number }

export function swapOrder<T extends Orderable>(
  list: T[],
  id: string,
  direction: "up" | "down",
): OrderUpdate[] {
  const index = list.findIndex((item) => item.id === id)

  if (index === -1) {
    return []
  }

  const targetIndex = direction === "up" ? index - 1 : index + 1

  if (targetIndex < 0 || targetIndex >= list.length) {
    return []
  }

  const current = list[index]
  const target = list[targetIndex]

  // Seed/legacy data can have every row at display_order 0 within a
  // category (see CLAUDE.md-linked seed notes). Swapping two equal values
  // is a no-op that would leave ▲▼ visually broken on the very first
  // click. When the two adjacent rows share a display_order, fall back to
  // reindexing the WHOLE list by current array position (0, 1, 2, ...),
  // with the moved row and its neighbor's positions swapped — this gives
  // every row a distinct, correctly ordered value in one step.
  if (current.display_order === target.display_order) {
    return list.map((item, position) => {
      const resolvedPosition =
        position === index
          ? targetIndex
          : position === targetIndex
            ? index
            : position

      return { id: item.id, display_order: resolvedPosition }
    })
  }

  return [
    { id: current.id, display_order: target.display_order },
    { id: target.id, display_order: current.display_order },
  ]
}
