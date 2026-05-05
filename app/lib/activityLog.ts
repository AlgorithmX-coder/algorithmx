/**
 * activityLog — small append-only log of recent achievements across
 * all save slots. Drives the recent-activity marquee on the title
 * screen (so the kid sees "Adam earned Phishing Hunter" sliding by).
 *
 * Stored under one localStorage key, keeps the last MAX entries.
 */

export type ActivityKind = "rank-up" | "badge" | "completion";

export interface ActivityEntry {
  /** Stable id — used for React keys + dedupe. */
  id: string;
  /** Unix ms timestamp. */
  ts: number;
  /** Hero name (from the slot record at log time). */
  slotName: string;
  kind: ActivityKind;
  /** Human-readable line ("earned Phishing Hunter"). */
  text: string;
  /** Hex accent for the entry. */
  accent: string;
  /** Single-glyph icon (emoji). */
  icon: string;
}

const STORAGE_KEY = "algorithmx-activity-v1";
const MAX_ENTRIES = 24;

function read(): ActivityEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as ActivityEntry[];
  } catch {
    return [];
  }
}

function write(entries: ActivityEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(entries.slice(0, MAX_ENTRIES)),
    );
  } catch {
    /* quota — ignore */
  }
}

export function appendActivity(
  entry: Omit<ActivityEntry, "id" | "ts" | "slotName">,
): void {
  if (typeof window === "undefined") return;
  /* Look up the active slot's name so the entry reads like
   * "Adam earned Phishing Hunter" rather than just "earned Phishing
   * Hunter". Falls back to "Cyber Hero" if no slot is active. */
  let slotName = "Cyber Hero";
  try {
    const id = window.localStorage.getItem("algorithmx-active-slot-v1");
    if (id) {
      const slotsRaw = window.localStorage.getItem(
        "algorithmx-save-slots-v1",
      );
      if (slotsRaw) {
        const slots = JSON.parse(slotsRaw) as Record<
          string,
          { name?: string }
        >;
        if (slots[id]?.name) slotName = slots[id].name!;
      }
    }
  } catch {
    /* ignore */
  }

  const list = read();
  /* Dedupe — drop any older entry with the same kind + text. */
  const filtered = list.filter(
    (e) => !(e.kind === entry.kind && e.text === entry.text),
  );
  const full: ActivityEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ts: Date.now(),
    slotName,
  };
  filtered.unshift(full);
  write(filtered);

  try {
    window.dispatchEvent(new CustomEvent("algorithmx:activity"));
  } catch {
    /* ignore */
  }
}

export function listActivity(limit = MAX_ENTRIES): ActivityEntry[] {
  return read().slice(0, limit);
}

export function clearActivity(): void {
  write([]);
}
