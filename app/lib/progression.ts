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

/**
 * The rank ladder, scaled to the whole 20-week course.
 *
 * The old ladder topped out at 8,000 XP. The course awards 25 XP per
 * answerable item and there are 1,271 of them across the twenty weeks
 * (~31,775 XP), plus boss XP on top - so a child hit "Cyber Hero", the FINAL
 * rank, somewhere in WEEK 4, then played sixteen more weeks with the rank bar
 * frozen full and nothing left to climb. That is UAT W7 2a.
 *
 * These thresholds spread the five promotions across the course instead:
 *
 *   Agent          600   mid week 1   - an early win, which a 6-year-old needs
 *   Specialist   3,000   week 2
 *   Expert       8,000   week 4-5
 *   Commander   16,000   week 9-10
 *   Cyber Hero  30,000   week 16-19   - the crown lands in the final stretch
 *
 * Those weeks are cumulative 25 XP x items, so they are a ceiling on how long
 * it takes: boss XP pulls every promotion earlier. Cyber Hero sits just under
 * the ~31,775 XP a child banks from items alone, so finishing the course
 * earns the crown even without a single boss bonus.
 *
 * Raising a threshold would DEMOTE anyone already playing, which is the one
 * thing a reward ladder for young children must never do. It cannot happen
 * here: see the `floorRankName` argument to `getRank` and `getRankWithFloor`.
 */
export const RANKS: RankInfo[] = [
  { name: "Recruit", minXP: 0, colour: "#94a3b8", icon: "🛡️" },
  { name: "Agent", minXP: 600, colour: "#60a5fa", icon: "⚡" },
  { name: "Specialist", minXP: 3000, colour: "#34d399", icon: "🔰" },
  { name: "Expert", minXP: 8000, colour: "#f59e0b", icon: "⭐" },
  { name: "Commander", minXP: 16000, colour: "#f97316", icon: "🏆" },
  { name: "Cyber Hero", minXP: 30000, colour: "#ef4444", icon: "👑" },
];

/** Index of a rank by name, or -1 when the name is not one of ours. */
function rankIndexByName(name: string | undefined | null): number {
  if (!name) return -1;
  return RANKS.findIndex((r) => r.name === name);
}

export interface RankProgress {
  current: RankInfo;
  next: RankInfo | null;
  xpIntoRank: number;
  xpNeededForNext: number;
  progressPct: number; // 0..1 into the current rank toward the next
}

/**
 * Returns current + next rank plus the fill percentage toward the next.
 *
 * `floorRankName` is the rank the player has ALREADY been shown (persisted as
 * `currentRank`). A player never drops below it, so re-scaling the ladder can
 * never take a rank away from a child who has already earned it - they simply
 * hold their rank while their XP catches up to the new threshold.
 */
export function getRank(
  totalXP: number,
  floorRankName?: string | null
): RankProgress {
  let idx = 0;
  for (let i = 0; i < RANKS.length; i++) {
    if (totalXP >= RANKS[i].minXP) idx = i;
    else break;
  }

  // Never demote below a rank the player has already been shown.
  idx = Math.max(idx, rankIndexByName(floorRankName));

  const current = RANKS[idx];
  const next: RankInfo | null = RANKS[idx + 1] ?? null;
  // A floored player can sit below their own rank's threshold, so clamp at 0
  // rather than reporting negative progress.
  const xpIntoRank = Math.max(0, totalXP - current.minXP);
  const span = next ? next.minXP - current.minXP : 1;
  const xpNeededForNext = next ? Math.max(0, next.minXP - totalXP) : 0;
  const progressPct = next ? Math.max(0, Math.min(1, xpIntoRank / span)) : 1;
  return { current, next, xpIntoRank, xpNeededForNext, progressPct };
}

/**
 * `getRank` for the player on THIS device, with their saved rank as the floor.
 * Use this anywhere a rank is shown to the player from local progression.
 */
export function getRankWithFloor(totalXP: number): RankProgress {
  return getRank(totalXP, getProgressionState().currentRank);
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
 * Namespaced storage key - reads the currently active save slot
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

/**
 * Read the progression blob for a SPECIFIC slot without touching the
 * active-slot pointer. Used by the title-screen slot cards so they
 * can render per-week stars without forcing a reload.
 */
export function getSlotProgressionState(slotId: string): ProgressionState {
  if (typeof window === "undefined") return { ...EMPTY_STATE };
  try {
    const raw = window.localStorage.getItem(
      `algorithmx-progression-${slotId}`,
    );
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
    /* quota or serialisation failure - ignore */
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
  // The saved rank is the floor on both reads, so a player who was promoted
  // under an older, shorter ladder holds their rank instead of being demoted,
  // and does not get a second "RANK UP" for a rank they already hold when
  // their XP finally reaches the new threshold.
  const floor = state.currentRank;
  const oldRank = getRank(state.totalXP, floor).current;
  state.totalXP = Math.max(0, state.totalXP + amount);

  const weekMatch = source.match(/week-(\d+)/);
  if (weekMatch) {
    const w = parseInt(weekMatch[1], 10);
    state.weeklyXP[w] = (state.weeklyXP[w] ?? 0) + amount;
  }

  const newRank = getRank(state.totalXP, floor).current;
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
    fireBigMomentSafe(newRank.colour);
    void import("./activityLog").then(({ appendActivity }) =>
      appendActivity({
        kind: "rank-up",
        text: `promoted to ${newRank.name}`,
        accent: newRank.colour,
        icon: newRank.icon,
      }),
    );
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
  fireBigMomentSafe("#ffd158");
  void import("./activityLog").then(({ appendActivity }) =>
    appendActivity({
      kind: "badge",
      text: `earned ${meta?.name ?? badgeId}`,
      accent: "#ffd158",
      icon: "🏅",
    }),
  );
}

/**
 * Reconcile the local progression blob with durable server state.
 *
 * Pulls the active child's reward snapshot (per-week xp / stars /
 * completed + earned `week-N` badge ids) and MAX-merges it into
 * localStorage so XP, rank, stars and badges survive a cleared browser
 * or a brand-new device. It never LOWERS a local value (the device may
 * hold an in-progress session the server hasn't recorded yet) and never
 * throws — a guest, an offline read, or a failed fetch just leaves the
 * local state untouched.
 *
 * Safe to call on every lesson mount: one server read, and at most one
 * localStorage write (only when something actually changed). No toasts
 * fire — this is a silent sync, not a fresh achievement.
 */
export async function hydrateProgressionFromServer(): Promise<void> {
  if (typeof window === "undefined") return;

  let snap: {
    totalXp: number;
    weeks: { week: number; xp: number; stars: number; completed: boolean }[];
    badgeIds: string[];
  } | null = null;
  try {
    const { getProgressionSnapshot } = await import("./lessonProgress.actions");
    snap = await getProgressionSnapshot();
  } catch {
    return; // not signed in / offline / action failed — keep local state
  }
  if (!snap) return;

  const state = getProgressionState();
  let changed = false;

  for (const w of snap.weeks) {
    const cur = state.weekProgress[w.week] ?? {
      completed: false,
      xpEarned: 0,
      stars: 0,
      bestAccuracy: 0,
    };
    const merged: WeekProgress = {
      completed: cur.completed || w.completed,
      xpEarned: Math.max(cur.xpEarned, w.xp),
      stars: Math.max(cur.stars, w.stars),
      bestAccuracy: cur.bestAccuracy,
    };
    if (
      merged.completed !== cur.completed ||
      merged.xpEarned !== cur.xpEarned ||
      merged.stars !== cur.stars ||
      state.weekProgress[w.week] === undefined
    ) {
      changed = true;
    }
    state.weekProgress[w.week] = merged;

    const nextWeekly = Math.max(state.weeklyXP[w.week] ?? 0, w.xp);
    if (nextWeekly !== (state.weeklyXP[w.week] ?? 0)) changed = true;
    state.weeklyXP[w.week] = nextWeekly;
  }

  for (const id of snap.badgeIds) {
    if (!state.badges.includes(id)) {
      state.badges.push(id);
      changed = true;
    }
  }

  const nextTotal = Math.max(state.totalXP, snap.totalXp);
  if (nextTotal !== state.totalXP) {
    state.totalXP = nextTotal;
    changed = true;
  }
  state.currentRank = getRank(state.totalXP).current.name;

  if (changed) saveProgression(state);
}

function fireBigMomentSafe(colour: string): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(
      new CustomEvent("algorithmx:big-moment", { detail: { colour } }),
    );
  } catch {
    /* ignore */
  }
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
