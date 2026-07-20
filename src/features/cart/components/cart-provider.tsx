"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react"

import {
  addItem,
  cartQuantity,
  cartTotal,
  removeItem,
  setItemQuantity,
} from "../lib/cart-operations"
import { loadCart, saveCart } from "../lib/cart-storage"
import type { CartItem } from "../lib/cart-types"

type CartContextValue = {
  items: CartItem[]
  hydrated: boolean
  totalQuantity: number
  total: number
  add: (item: Omit<CartItem, "quantity">) => void
  remove: (productId: string) => void
  setQuantity: (productId: string, quantity: number) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

// Module-level store so the cart is read through useSyncExternalStore —
// React's documented answer for synchronizing with an external system
// (localStorage) on mount without the setState-in-effect cascading-render
// anti-pattern (react-hooks/set-state-in-effect); see
// https://react.dev/learn/you-might-not-need-an-effect. One CartProvider is
// mounted per browser tab (in (public)/layout.tsx), so a single
// module-level store matches the "no cross-tab sync" scope from the plan.
const EMPTY_CART: CartItem[] = []
const listeners = new Set<() => void>()
let cachedItems: CartItem[] = EMPTY_CART

// Lazy, memoized read: the first call after mount loads from localStorage
// and caches the result so later calls return the SAME array reference —
// required by useSyncExternalStore to avoid re-rendering forever.
function getSnapshot(): CartItem[] {
  if (cachedItems === EMPTY_CART) {
    cachedItems = loadCart(window.localStorage)
  }
  return cachedItems
}

// The server render (and the pre-hydration client render) can't touch
// localStorage — returning the same EMPTY_CART reference both times keeps
// those two renders identical, so there is no hydration mismatch.
function getServerSnapshot(): CartItem[] {
  return EMPTY_CART
}

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange)
  return () => listeners.delete(onStoreChange)
}

function commit(next: CartItem[]): void {
  cachedItems = next
  saveCart(window.localStorage, next)
  listeners.forEach((listener) => listener())
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  // True once the real, localStorage-backed snapshot has replaced the
  // server placeholder. loadCart always returns a freshly created array
  // (even an empty one), so this reference check is reliable regardless of
  // whether the actual stored cart is empty.
  const hydrated = items !== EMPTY_CART

  const add = useCallback(
    (item: Omit<CartItem, "quantity">) => commit(addItem(getSnapshot(), item)),
    [],
  )
  const remove = useCallback(
    (productId: string) => commit(removeItem(getSnapshot(), productId)),
    [],
  )
  const setQuantity = useCallback(
    (productId: string, quantity: number) =>
      commit(setItemQuantity(getSnapshot(), productId, quantity)),
    [],
  )
  const clear = useCallback(() => commit([]), [])

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      hydrated,
      totalQuantity: cartQuantity(items),
      total: cartTotal(items),
      add,
      remove,
      setQuantity,
      clear,
    }),
    [items, hydrated, add, remove, setQuantity, clear],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }

  return context
}
