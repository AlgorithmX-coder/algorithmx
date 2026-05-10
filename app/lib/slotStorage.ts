/**
 * Slot-aware localStorage key helper.
 *
 * Many lesson-runtime keys (mid-lesson save, inventory, ad-hoc per-week
 * caches) were originally global. After the save-slot system shipped,
 * those keys leak between slots - Adam's save shows up under Layla.
 *
 * Wrap every per-player storage key through `slotKey(base)` and the
 * read/write will land under `<base>::slot-N` automatically. Falls back
 * to the legacy bare key when no slot is active so older single-blob
 * installs keep working.
 */

const ACTIVE_SLOT_KEY = "algorithmx-active-slot-v1";

export function getActiveSlotIdSafe(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(ACTIVE_SLOT_KEY);
  } catch {
    return null;
  }
}

/**
 * Returns the namespaced key for the currently active slot, falling
 * back to the bare base key when no slot is active. Pass the same
 * `base` from every call site that should share a slot's data.
 */
export function slotKey(base: string): string {
  const id = getActiveSlotIdSafe();
  return id ? `${base}::${id}` : base;
}

/**
 * Returns the namespaced key for a SPECIFIC slot id without touching
 * the active-slot pointer. Used by deleteSlot to wipe a slot's blobs
 * without first switching to that slot.
 */
export function slotKeyFor(base: string, id: string): string {
  return `${base}::${id}`;
}

/**
 * One-shot migration helper. If a legacy bare key exists and the
 * slot-namespaced equivalent does not, copy the legacy value across
 * so the active slot picks up the in-flight progress on first load.
 *
 * Idempotent: a second call sees the namespaced key already exists
 * and no-ops.
 */
export function migrateLegacyKey(base: string): void {
  if (typeof window === "undefined") return;
  const id = getActiveSlotIdSafe();
  if (!id) return;
  try {
    const namespaced = `${base}::${id}`;
    if (window.localStorage.getItem(namespaced) !== null) return;
    const legacy = window.localStorage.getItem(base);
    if (legacy === null) return;
    window.localStorage.setItem(namespaced, legacy);
  } catch {
    /* ignore */
  }
}

/**
 * Clears every base key that is used by the lesson runtime, scoped to
 * the given slot id. Call this from `deleteSlot` so removing a save
 * doesn't leak the deleted player's data into the next one to occupy
 * the slot id.
 */
export const PER_SLOT_BASE_KEYS = [
  // Mid-lesson autosave (LessonPlayer SAVE_KEY).
  "algorithmx:lesson:week-1:state",
  "algorithmx:lesson:week-2:state",
  // Inventory: ax-inventory-v1::week-X - wrap that base. Inventory
  // already adds the `::weekKey` suffix; we also append `::slotId`.
  // (Both suffixes are added by the inventory module via slotKey.)
  // Saved password (the kid's chosen password text from the password lab).
  "ax-w1-saved-password",
];

export function wipeSlotKeys(slotId: string): void {
  if (typeof window === "undefined") return;
  for (const base of PER_SLOT_BASE_KEYS) {
    try {
      window.localStorage.removeItem(slotKeyFor(base, slotId));
    } catch {
      /* ignore */
    }
  }
  /* Inventory uses a compound base - remove every key beginning with
   * `ax-inventory-v1::` and ending with `::slotId`. */
  try {
    const remove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (!k) continue;
      if (k.startsWith("ax-inventory-v1::") && k.endsWith(`::${slotId}`)) {
        remove.push(k);
      }
    }
    remove.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}
