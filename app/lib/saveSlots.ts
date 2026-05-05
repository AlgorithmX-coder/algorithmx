/**
 * Save-slot system — 3 slots, each with its own namespaced progression
 * blob in localStorage.  Mirrors the slot-picker pattern from console games
 * (pick a save, see hours/last-played + progress, "New Game" / "Continue").
 *
 * Slot data is intentionally a tiny summary used by the title screen.
 * The actual gameplay state (XP, badges, week progress) lives under the
 * progression.ts blob, namespaced per slot via the activeSlotId.
 */

export interface SaveSlot {
  /** Stable identifier — `slot-1`, `slot-2`, `slot-3`. */
  id: string;
  /** Free-form display name the player chose (or default). */
  name: string;
  /** Avatar/character key — drives the slot card portrait. */
  avatar: "adam" | "layla";
  /** Unix ms when the slot was created. */
  createdAt: number;
  /** Unix ms of the last save event (any progression mutation). */
  lastPlayedAt: number;
  /** Cached summary so the title screen does not load the full state. */
  totalXP: number;
  /** Highest week number unlocked. 1 by default. */
  weekUnlocked: number;
  /** Sum of stars earned across all weeks. Drives the "★ x12" chip. */
  totalStars: number;
  /** Total time played in seconds (best-effort, ticks while in lesson). */
  playSeconds: number;
}

const SLOTS_KEY = "algorithmx-save-slots-v1";
const ACTIVE_SLOT_KEY = "algorithmx-active-slot-v1";

const DEFAULT_NAMES: Record<SaveSlot["avatar"], string> = {
  adam: "Adam",
  layla: "Layla",
};

const SLOT_IDS = ["slot-1", "slot-2", "slot-3"] as const;

function readSlots(): Record<string, SaveSlot> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(SLOTS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, SaveSlot>;
  } catch {
    return {};
  }
}

function writeSlots(slots: Record<string, SaveSlot>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SLOTS_KEY, JSON.stringify(slots));
  } catch {
    /* quota — ignore */
  }
}

export function listSlots(): (SaveSlot | null)[] {
  const slots = readSlots();
  return SLOT_IDS.map((id) => slots[id] ?? null);
}

export function getSlot(id: string): SaveSlot | null {
  return readSlots()[id] ?? null;
}

export function createSlot(params: {
  id: string;
  name?: string;
  avatar: SaveSlot["avatar"];
}): SaveSlot {
  const now = Date.now();
  const slot: SaveSlot = {
    id: params.id,
    name: params.name?.trim() || DEFAULT_NAMES[params.avatar],
    avatar: params.avatar,
    createdAt: now,
    lastPlayedAt: now,
    totalXP: 0,
    weekUnlocked: 1,
    totalStars: 0,
    playSeconds: 0,
  };
  const slots = readSlots();
  slots[params.id] = slot;
  writeSlots(slots);
  setActiveSlot(params.id);
  return slot;
}

export function deleteSlot(id: string): void {
  const slots = readSlots();
  delete slots[id];
  writeSlots(slots);
  if (getActiveSlotId() === id) {
    clearActiveSlot();
  }
  // Wipe the namespaced progression blob too.
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(`algorithmx-progression-${id}`);
    } catch {
      /* ignore */
    }
  }
}

export function updateSlot(id: string, patch: Partial<SaveSlot>): void {
  const slots = readSlots();
  const current = slots[id];
  if (!current) return;
  slots[id] = { ...current, ...patch, id };
  writeSlots(slots);
}

/** Mark slot as just played — bump lastPlayedAt, optionally tick playSeconds. */
export function touchSlot(id: string, addSeconds = 0): void {
  const slots = readSlots();
  const current = slots[id];
  if (!current) return;
  slots[id] = {
    ...current,
    lastPlayedAt: Date.now(),
    playSeconds: current.playSeconds + addSeconds,
  };
  writeSlots(slots);
}

export function getActiveSlotId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(ACTIVE_SLOT_KEY);
  } catch {
    return null;
  }
}

export function setActiveSlot(id: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ACTIVE_SLOT_KEY, id);
  } catch {
    /* ignore */
  }
}

export function clearActiveSlot(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(ACTIVE_SLOT_KEY);
  } catch {
    /* ignore */
  }
}

/* ─────────────────────────── DISPLAY HELPERS ─────────────────────────── */

export function formatRelative(ms: number): string {
  const diff = Date.now() - ms;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min ago`;
  if (diff < 86_400_000) {
    const h = Math.floor(diff / 3_600_000);
    return h === 1 ? "1 hour ago" : `${h} hours ago`;
  }
  const d = Math.floor(diff / 86_400_000);
  return d === 1 ? "1 day ago" : `${d} days ago`;
}

export function formatPlayTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

/**
 * One-shot migration: if the legacy single-blob progression exists but
 * no slots do, create slot-1 from it so existing players don't lose
 * progress on first visit after the slot system ships.
 */
export function migrateLegacyIfNeeded(): void {
  if (typeof window === "undefined") return;
  const slots = readSlots();
  if (Object.keys(slots).length > 0) return;
  try {
    const legacy = window.localStorage.getItem("algorithmx-progression");
    if (!legacy) return;
    const parsed = JSON.parse(legacy) as { totalXP?: number };
    const totalXP = parsed.totalXP ?? 0;
    const slot: SaveSlot = {
      id: "slot-1",
      name: "Cyber Hero",
      avatar: "adam",
      createdAt: Date.now(),
      lastPlayedAt: Date.now(),
      totalXP,
      weekUnlocked: 1,
      totalStars: 0,
      playSeconds: 0,
    };
    writeSlots({ "slot-1": slot });
    setActiveSlot("slot-1");
    // Move the legacy blob into the namespaced key so progression.ts can
    // read it via the active-slot lookup.
    window.localStorage.setItem(
      `algorithmx-progression-slot-1`,
      legacy,
    );
  } catch {
    /* ignore */
  }
}

export const AVAILABLE_SLOT_IDS = SLOT_IDS;
