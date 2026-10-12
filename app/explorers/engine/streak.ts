/**
 * Daily play streak — a day counts the moment the agent makes real progress
 * (lifetime XP goes up), not merely on opening the app. Persisted locally;
 * cross-device sync isn't needed for a counter this low-stakes.
 */
const KEY = "explorers:streak";

interface StreakState {
  count: number;
  lastDate: string; // "YYYY-MM-DD"
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function readStreak(): StreakState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as StreakState;
  } catch {}
  return { count: 0, lastDate: "" };
}

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
}

/**
 * Call once per session when genuine new progress is detected (XP went up
 * since last visit). Idempotent within a day. Returns the updated streak.
 */
export function recordDailyActivity(): StreakState {
  const state = readStreak();
  const now = today();
  if (state.lastDate === now) return state; // already counted today
  const gap = state.lastDate ? daysBetween(state.lastDate, now) : null;
  const next: StreakState = { count: gap === 1 ? state.count + 1 : 1, lastDate: now };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  return next;
}

export function getStreak(): StreakState {
  const state = readStreak();
  // A streak more than a day stale (missed yesterday) reads as broken, even
  // though we don't rewrite it until the next real activity resets it.
  if (state.lastDate && daysBetween(state.lastDate, today()) > 1) return { count: 0, lastDate: state.lastDate };
  return state;
}
