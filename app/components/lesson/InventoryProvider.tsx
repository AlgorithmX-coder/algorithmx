"use client";

/**
 * InventoryProvider — global state for the Week-1 inventory bar.
 *
 * Owns:
 *   - earned: Set<string>  (which items the kid has unlocked)
 *   - flying: { item, originX, originY }  (item currently animating
 *     from its action point into its inventory slot — null when idle)
 *   - reveal: { item } | null  (item whose "did-you-know" line is
 *     currently being delivered by Adam/Layla in the speech bubble)
 *
 * The flying + reveal beats are deliberately separate so the fly can
 * land before the dialogue pops. The full Reveal-Then-Earn sequence is:
 *
 *   earn(itemId, originX, originY)
 *     → flying state set; <EarnItemEffect/> tweens an icon from the
 *       click point into the matching slot in <InventoryBar/>
 *     → on landing, flying clears and reveal is set; the bubble shows
 *     → on bubble dismiss / timeout, reveal clears
 *
 * Persistence: earned set is mirrored to localStorage under a per-week
 * key so a kid who reloads keeps their earned items.
 */

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  INVENTORY_ITEMS,
  InventoryItem,
  getItem,
  loadEarnedItems,
  saveEarnedItems,
} from "@/app/lib/inventory";

interface FlyingItem {
  item: InventoryItem;
  originX: number;
  originY: number;
  /** Render-frame nonce so we can re-trigger fly even if the same id
   *  is earned twice in quick succession (rare but cheap to support). */
  nonce: number;
}

interface RevealItem {
  item: InventoryItem;
  nonce: number;
}

interface InventoryContextValue {
  /** Set of earned item ids — read-only from consumers. */
  earned: Set<string>;
  /** All catalog items in display order. Useful so InventoryBar can
   *  render empty slots for not-yet-earned items without re-importing
   *  the catalog. */
  catalog: InventoryItem[];
  /** Trigger an earn beat. If the item is already earned this is a
   *  no-op (we don't replay the fly animation on repeat triggers — the
   *  caller may earn the same screen multiple times via retries). */
  earn: (itemId: string, originX: number, originY: number) => void;
  /** Currently-animating fly. Read by <EarnItemEffect/>. */
  flying: FlyingItem | null;
  /** Currently-displayed reveal. Read by the caller's bubble surface
   *  (we don't render the bubble here so the existing CharacterGuide
   *  can pick it up via a registered handler). */
  reveal: RevealItem | null;
  /** Imperative hooks called by <EarnItemEffect/> when the fly tween
   *  finishes (clears flying, opens reveal) and by the bubble owner
   *  when the reveal is dismissed. */
  onFlyLanded: () => void;
  onRevealDismiss: () => void;
}

const InventoryContext = createContext<InventoryContextValue | null>(null);

export interface InventoryProviderProps {
  children: ReactNode;
  /** Stable string identifying which week's inventory this is — used
   *  as the localStorage namespace. e.g. "week-1". */
  weekKey: string;
}

export function InventoryProvider({
  children,
  weekKey,
}: InventoryProviderProps) {
  // Hydrate earned set from localStorage on mount. We don't pre-fill
  // synchronously in useState because that's not SSR-safe; instead we
  // start empty and reconcile on first effect, which is fine since the
  // bar's initial paint shows all-empty slots either way.
  const [earned, setEarned] = useState<Set<string>>(() => new Set());
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const stored = loadEarnedItems(weekKey);
    if (stored.size > 0) setEarned(stored);
  }, [weekKey]);

  const [flying, setFlying] = useState<FlyingItem | null>(null);
  const [reveal, setReveal] = useState<RevealItem | null>(null);
  const nonceRef = useRef(0);

  const earn = useCallback(
    (itemId: string, originX: number, originY: number) => {
      const item = getItem(itemId);
      if (!item) {
        if (process.env.NODE_ENV !== "production") {
          // eslint-disable-next-line no-console
          console.warn(`[InventoryProvider] earn(): unknown item id "${itemId}"`);
        }
        return;
      }
      // Already earned? Skip the animation but still let the kid see
      // the bar light up (no harm; tracker for re-completion).
      setEarned((prev) => {
        if (prev.has(itemId)) return prev;
        const next = new Set(prev);
        next.add(itemId);
        saveEarnedItems(weekKey, next);
        return next;
      });
      nonceRef.current += 1;
      setFlying({ item, originX, originY, nonce: nonceRef.current });
    },
    [weekKey]
  );

  const onFlyLanded = useCallback(() => {
    setFlying((prev) => {
      if (!prev) return null;
      // Hand the item off to the reveal slot.
      setReveal({ item: prev.item, nonce: prev.nonce });
      return null;
    });
  }, []);

  const onRevealDismiss = useCallback(() => {
    setReveal(null);
  }, []);

  const value = useMemo<InventoryContextValue>(
    () => ({
      earned,
      catalog: INVENTORY_ITEMS,
      earn,
      flying,
      reveal,
      onFlyLanded,
      onRevealDismiss,
    }),
    [earned, earn, flying, reveal, onFlyLanded, onRevealDismiss]
  );

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory(): InventoryContextValue {
  const ctx = useContext(InventoryContext);
  if (!ctx) {
    throw new Error("useInventory() called outside <InventoryProvider/>");
  }
  return ctx;
}

/** Optional non-throwing variant for code paths that may render
 *  outside the provider (e.g. shared sub-components used in standalone
 *  pages like the dev preview harness). Returns null if no context. */
export function useInventoryOptional(): InventoryContextValue | null {
  return useContext(InventoryContext);
}
