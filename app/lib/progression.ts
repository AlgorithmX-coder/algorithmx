/**
 * Cross-app XP, rank, and badge progression.
 *
 * State is persisted to localStorage under a single key. All mutators read,
 * transform, and write the full blob so the file stays ACID-ish for the
 * cases we care about (single tab).
 */

export interface RankInfo {
  name: string;
  minXP: number;
  colour: string;
  icon: string;
}

export const RANKS: RankInfo[] = [
  { name: "Recruit", minXP: 0, colour: "#94a3b8", icon: "🛡️" },
  { name: "Agent", minXP: 500, colour: "#60a5fa", icon: "⚡" },
  { name: "Specialist", minXP: 1500, colour: "#34d399", icon: "🔰" },
  { name: "Expert", minXP: 3000, colour: "#f59e0b", icon: "⭐" },
  { name: "Commander", minXP: 5000, colour: "#f97316", icon: "🏆" },
  { name: "Cyber Hero", minXP: 8000, colour: "#ef4444", icon: "👑" },
];

export interface RankProgress {
  current: RankInfo;
  next: RankInfo | null;
  xpIntoRank: number;
  xpNeededForNext: number;
  progressPct: number; // 0..1 into the current rank toward the next
}

/** Returns current + next rank plus the fill percentage toward the next. */
export function getRank(totalXP: number): RankProgress {
  let current = RANKS[0];
  let nextIdx = -1;
  for (let i = 0; i < RANKS.length; i++) {
    if (totalXP >= RANKS[i].minXP) {
      current = RANKS[i];
      nextIdx = i + 1;
    } else break;
  }
  const next: RankInfo | null = RANKS[nextIdx] ?? null;
  const xpIntoRank = totalXP - current.minXP;
  const span = next ? next.minXP - current.minXP : 1;
  const xpNeededForNext = next ? Math.max(0, next.minXP - totalXP) : 0;
  const progressPct = next ? Math.max(0, Math.min(1, xpIntoRank / span)) : 1;
  return { current, next, xpIntoRank, xpNeededForNext, progressPct };
}

export interface XPBreakdown {
  base: number;
  accuracyBonus: number;
  comboBonus: number;
  speedBonus: number;
  perfectBonus: number;
  total: number;
}

export function calculateLessonXP(params: {
  correctAnswers: number;
  totalQuestions: number;
  maxCombo: number;
  fastAnswers: number;
  perfectExercises: number;
}): XPBreakdown {
  const base = params.correctAnswers * 50;
  const accuracyBonus =
    params.totalQuestions > 0
      ? Math.round((params.correctAnswers / params.totalQuestions) * 100)
      : 0;
  const comboBonus = params.maxCombo * 25;
  const speedBonus = params.fastAnswers * 10;
  const perfectBonus = params.perfectExercises * 50;
  const total = base + accuracyBonus + comboBonus + speedBonus + perfectBonus;
  return { base, accuracyBonus, comboBonus, speedBonus, perfectBonus, total };
}

export function calculateBossXP(params: {
  won: boolean;
  accuracy: number; // 0-100
  maxCombo: number;
  starsEarned: number; // 0-3
}): number {
  if (!params.won) return 0;
  // Mirror the in-game formula (100 + correct*15 + maxCombo*25) using
  // accuracy as a proxy for correct answers out of 10.
  const correct = Math.round(params.accuracy / 10);
  const base = 100;
  const accBonus = correct * 15;
  const comboBonus = params.maxCombo * 25;
  const starBonus =
    params.starsEarned >= 3 ? 100 : params.starsEarned === 2 ? 50 : 25;
  return base + accBonus + comboBonus + starBonus;
}

export interface WeekProgress {
  completed: boolean;
  xpEarned: number;
  stars: number;
  bestAccuracy: number;
}

export interface ProgressionState {
  totalXP: number;
  weeklyXP: Record<number, number>;
  badges: string[];
  weekProgress: Record<number, WeekProgress>;
  currentRank: string;
}

const LEGACY_STORAGE_KEY = "algorithmx-progression";
const ACTIVE_SLOT_STORAGE_KEY = "algorithmx-active-slot-v1";

/**
 * Namespaced storage key — reads the currently active save slot
 * (set by the title-screen slot picker) and reads/writes the
 * progression blob under `algorithmx-progression-{slotId}`.
 *
 * Falls back to the legacy single-blob key if no active slot exists,
 * so existing single-player saves keep working until the user picks
 * a slot for the first time.
 */
function storageKey(): string {
  if (typeof window === "undefined") return LEGACY_STORAGE_KEY;
  try {
    const slotId = window.localStorage.getItem(ACTIVE_SLOT_STORAGE_KEY);
    if (slotId) return `algorithmx-progression-${slotId}`;
  } catch {
    /* ignore */
  }
  return LEGACY_STORAGE_KEY;
}

const EMPTY_STATE: ProgressionState = {
  totalXP: 0,
  weeklyXP: {},
  badges: [],
  weekProgress: {},
  currentRank: RANKS[0].name,
};

export function getProgressionState(): ProgressionState {
  if (typeof window === "undefined") return { ...EMPTY_STATE };
  try {
    const raw = window.localStorage.getItem(storageKey());
    if (!raw) return { ...EMPTY_STATE };
    const parsed = JSON.parse(raw) as Partial<ProgressionState>;
    return {
      totalXP: parsed.totalXP ?? 0,
      weeklyXP: parsed.weeklyXP ?? {},
      badges: parsed.badges ?? [],
      weekProgress: parsed.weekProgress ?? {},
      currentRank: parsed.currentRank ?? RANKS[0].name,
    };
  } catch {
    return { ...EMPTY_STATE };
  }
}

function saveProgression(state: ProgressionState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(), JSON.stringify(state));
  } catch {
    /* quota or serialisation failure — ignore */
  }
  /* Mirror summary into the active slot record so the title-screen
   * picker reflects fresh totals on the next visit. Hands-off if the
   * slot system isn't wired (legacy single-blob users). */
  syncSlotSummary(state);
  /* Notify the in-tab autosave indicator. The native `storage` event
   * only fires on OTHER tabs, so we need a custom event for the same
   * tab feedback. */
  try {
    window.dispatchEvent(new CustomEvent("algorithmx:autosave"));
  } catch {
    /* ignore */
  }
}

function syncSlotSummary(state: ProgressionState): void {
  if (typeof window === "undefined") return;
  try {
    const slotId = window.localStorage.getItem("algorithmx-active-slot-v1");
    if (!slotId) return;
    const slotsRaw = window.localStorage.getItem(
      "algorithmx-save-slots-v1",
    );
    if (!slotsRaw) return;
    const slots = JSON.parse(slotsRaw) as Record<
      string,
      {
        id: string;
        totalXP: number;
        totalStars: number;
        weekUnlocked: number;
        lastPlayedAt: number;
        [k: string]: unknown;
      }
    >;
    const slot = slots[slotId];
    if (!slot) return;
    const totalStars = Object.values(state.weekProgress).reduce(
      (sum, w) => sum + (w?.stars ?? 0),
      0,
    );
    const weekUnlocked = Object.entries(state.weekProgress)
      .filter(([, w]) => w?.completed)
      .reduce((max, [k]) => Math.max(max, parseInt(k, 10) + 1), 1);
    slots[slotId] = {
      ...slot,
      totalXP: state.totalXP,
      totalStars,
      weekUnlocked: Math.max(slot.weekUnlocked, weekUnlocked),
      lastPlayedAt: Date.now(),
    };
    window.localStorage.setItem(
      "algorithmx-save-slots-v1",
      JSON.stringify(slots),
    );
  } catch {
    /* ignore */
  }
}

/**
 * Add XP and report whether the player crossed a rank threshold.
 * `source` is a free-form tag; if it matches `week-N`, the N is used
 * to bucket weeklyXP (e.g. "boss-battle-week-1", "lesson-week-2").
 */
export function addXP(
  amount: number,
  source: string
): {
  newTotal: number;
  leveledUp: boolean;
  oldRank: RankInfo;
  newRank: RankInfo;
} {
  const state = getProgressionState();
  const oldRank = getRank(state.totalXP).current;
  state.totalXP = Math.max(0, state.totalXP + amount);

  const weekMatch = source.match(/week-(\d+)/);
  if (weekMatch) {
    const w = parseInt(weekMatch[1], 10);
    state.weeklyXP[w] = (state.weeklyXP[w] ?? 0) + amount;
  }

  const newRank = getRank(state.totalXP).current;
  state.currentRank = newRank.name;
  saveProgression(state);

  const leveledUp = newRank.name !== oldRank.name;
  if (leveledUp) {
    fireAchievementSafe({
      id: `rank-${newRank.name}`,
      kicker: "RANK UP",
      title: newRank.name,
      subtitle: `${state.totalXP.toLocaleString()} XP earned`,
      icon: newRank.icon,
      accent: newRank.colour,
      sound: "levelUp",
    });
  }

  return {
    newTotal: state.totalXP,
    leveledUp,
    oldRank,
    newRank,
  };
}

export function earnBadge(badgeId: string): void {
  const state = getProgressionState();
  if (state.badges.includes(badgeId)) return;
  state.badges.push(badgeId);
  saveProgression(state);

  const meta = WEEK_BADGES.find((b) => b.id === badgeId);
  fireAchievementSafe({
    id: `badge-${badgeId}`,
    kicker: "BADGE EARNED",
    title: meta?.name ?? badgeId,
    subtitle: meta ? `Week ${meta.week} complete` : undefined,
    icon: "🏅",
    accent: "#ffd158",
    sound: "badgeEarned",
  });
}

/**
 * Fires an achievement toast via the global host if mounted. Imported
 * lazily so the progression module stays usable in non-DOM contexts
 * (server renders, tests).
 */
function fireAchievementSafe(payload: {
  id: string;
  kicker: string;
  title: string;
  subtitle?: string;
  icon: string;
  accent: string;
  sound?: string;
}): void {
  if (typeof window === "undefined") return;
  const fn = (window as unknown as {
    __axAchievement__?: (a: typeof payload) => void;
  }).__axAchievement__;
  if (typeof fn === "function") fn(payload);
}

export function getWeekProgress(week: number): WeekProgress {
  const state = getProgressionState();
  return (
    state.weekProgress[week] ?? {
      completed: false,
      xpEarned: 0,
      stars: 0,
      bestAccuracy: 0,
    }
  );
}

export function setWeekProgress(
  week: number,
  patch: Partial<WeekProgress>
): void {
  const state = getProgressionState();
  const current = state.weekProgress[week] ?? {
    completed: false,
    xpEarned: 0,
    stars: 0,
    bestAccuracy: 0,
  };
  state.weekProgress[week] = { ...current, ...patch };
  saveProgression(state);
}

/**
 * Canonical badge names for all 20 weeks. Used by BadgeSlots.
 * Week 1-3 names are fixed; the rest follow the curriculum sketch.
 */
export const WEEK_BADGES: { week: number; id: string; name: string }[] = [
  { week: 1, id: "week-1", name: "Password Protector" },
  { week: 2, id: "week-2", name: "Privacy Guardian" },
  { week: 3, id: "week-3", name: "Stranger Danger Shield" },
  { week: 4, id: "week-4", name: "Phishing Hunter" },
  { week: 5, id: "week-5", name: "Scam Spotter" },
  { week: 6, id: "week-6", name: "Footprint Tracker" },
  { week: 7, id: "week-7", name: "Two-Factor Champion" },
  { week: 8, id: "week-8", name: "Link Inspector" },
  { week: 9, id: "week-9", name: "Cyberbully Blocker" },
  { week: 10, id: "week-10", name: "Screen Time Master" },
  { week: 11, id: "week-11", name: "Wi-Fi Warrior" },
  { week: 12, id: "week-12", name: "App Permission Pro" },
  { week: 13, id: "week-13", name: "Safe Search Sleuth" },
  { week: 14, id: "week-14", name: "Malware Manager" },
  { week: 15, id: "week-15", name: "Identity Defender" },
  { week: 16, id: "week-16", name: "Backup Boss" },
  { week: 17, id: "week-17", name: "Update Ninja" },
  { week: 18, id: "week-18", name: "Social Savvy" },
  { week: 19, id: "week-19", name: "Digital Citizen" },
  { week: 20, id: "week-20", name: "Cyber Hero Graduate" },
];
