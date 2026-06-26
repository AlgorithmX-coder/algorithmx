"use server";

/**
 * Server actions for lesson progress persistence — flat model.
 *
 * One Progress row per (childProfile, product, week). The "attempt"
 * concept from the old schema (LessonAttempt/ScreenResult/
 * QuestionResponse/BossResult) is gone. The hook public API is
 * preserved so the lesson UI didn't have to be rewritten — internally
 * each action collapses to an upsert on the single Progress row via
 * the shared `upsertProgress` helper that also backs /api/progress.
 *
 * Semantics, in short:
 *   - `attemptId` = the Progress row id. Stable across resumes.
 *   - Star rating, screen index and completedAt are MAX-merged so a
 *     later weaker pass can never downgrade earlier success.
 *   - Per-question / per-hint analytics is no-op'd at the DB layer;
 *     the client analytics layer (Plausible) still fires.
 *
 * The signature shape of every action and type export is preserved
 * verbatim so the consumers (useLessonProgress, DynamicLesson) do
 * not need to change.
 */

import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import {
  upsertProgress,
  resolveActiveChildProfileId,
  resetWeekProgress,
} from "@/app/lib/progressService";

/** Slug of the only product whose lesson player this hook currently drives. */
const PRODUCT_SLUG = "cyber-heroes";

/* ─────────────── shared helpers ─────────────── */

async function requireUserId(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

function isValidWeek(week: number): boolean {
  return Number.isInteger(week) && week >= 1 && week <= 200;
}

function clampInt(value: unknown, min: number, max: number, fallback = min): number {
  const n = typeof value === "number" && Number.isFinite(value) ? Math.trunc(value) : fallback;
  return Math.max(min, Math.min(max, n));
}

/* ─────────────── type exports (preserved verbatim) ─────────────── */

export interface StartOrResumeResult {
  attemptId: string;
  weekNumber: number;
  /** Highest screen the child has reached on the resumed attempt. 0 if new. */
  lastScreenIndex: number;
  /** True when an existing unfinished attempt was returned. */
  isResume: boolean;
}

export interface ScreenResultInput {
  attemptId: string;
  screenIndex: number;
  screenType: string;
  durationMs: number;
  wrongCount: number;
  hintTierReached: number; // 0/1/2/3
  xpEarned: number;
  starsEarned: number; // 1/2/3
}

export interface QuestionResponseInput {
  attemptId: string;
  screenIndex: number;
  questionKey: string;
  selectedIndex: number;
  correctIndex: number;
  wasCorrect: boolean;
  attemptIndex?: number;
}

export interface BossResultInput {
  attemptId: string;
  won: boolean;
  accuracy: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  bestCombo: number;
  durationMs: number;
  badgeEarned: boolean;
  badgeId?: string;
}

export interface CompleteAttemptInput {
  attemptId: string;
  totalXp: number;
  finalScreenIndex: number;
}

/* ─────────────── actions ─────────────── */

/**
 * Find or create the Progress row for the user's active child + this
 * week. Returns the row id as `attemptId` and the highest screen
 * reached so far. The Progress row is created with stars=0/screen=0
 * the first time so subsequent saveScreenResult calls have a target
 * to upsert against.
 */
export async function startOrResumeAttempt(
  weekNumber: number,
): Promise<StartOrResumeResult> {
  const userId = await requireUserId();
  if (!isValidWeek(weekNumber)) {
    throw new Error("Invalid week number");
  }

  const childProfileId = await resolveActiveChildProfileId(userId);
  if (!childProfileId) {
    throw new Error(
      "No child profile yet. Create one from the dashboard before starting a lesson.",
    );
  }

  // Ensure a row exists so every later upsert has the same target id.
  // skipOwnershipCheck is safe — we just resolved the child from this
  // session user's own profiles.
  const result = await upsertProgress({
    userId,
    childProfileId,
    productSlug: PRODUCT_SLUG,
    week: weekNumber,
    screen: 0,
    stars: 0,
    skipOwnershipCheck: true,
  });
  if (!result.ok) {
    throw new Error(`Could not start attempt: ${result.error.kind}`);
  }

  return {
    attemptId: result.row.id,
    weekNumber,
    lastScreenIndex: result.row.screen,
    isResume: result.row.screen > 0,
  };
}

/**
 * Persist a per-screen outcome. Collapses to an upsert that raises
 * the stored `screen` and `stars` (never lowers). The fine-grained
 * analytics fields (durationMs, hintTierReached, wrongCount) are
 * silently dropped at the DB layer; Plausible still receives them
 * via the hook.
 */
export async function saveScreenResult(input: ScreenResultInput): Promise<void> {
  const userId = await requireUserId();
  const screenIndex = clampInt(input.screenIndex, 0, 200);
  const starsEarned = clampInt(input.starsEarned, 0, 3, 3);

  const childProfileId = await resolveActiveChildProfileId(userId);
  if (!childProfileId) return; // no child = nothing to write; never throw

  await upsertProgress({
    userId,
    childProfileId,
    productSlug: PRODUCT_SLUG,
    week: await weekFromAttemptId(input.attemptId, childProfileId),
    screen: screenIndex,
    stars: starsEarned,
    skipOwnershipCheck: true,
  });
}

/**
 * Per-question analytics is no longer persisted (the dropped
 * QuestionResponse model held that). Kept as a no-op so the client
 * hook's `saveQuestion` callback doesn't have to special-case it.
 */
export async function saveQuestionResponse(
  _input: QuestionResponseInput,
): Promise<void> {
  return;
}

/**
 * Boss outcome collapses to a star write on the week's Progress row.
 * Winning the boss without losing health = 3 stars; otherwise 1 star
 * for participation. The merge in upsertProgress means a re-attempt
 * with worse stars cannot lower the previous best.
 */
export async function saveBossResult(input: BossResultInput): Promise<void> {
  const userId = await requireUserId();
  const childProfileId = await resolveActiveChildProfileId(userId);
  if (!childProfileId) return;

  const week = await weekFromAttemptId(input.attemptId, childProfileId);
  const stars = input.won ? (input.wrongCount === 0 ? 3 : 2) : 1;

  await upsertProgress({
    userId,
    childProfileId,
    productSlug: PRODUCT_SLUG,
    week,
    screen: 0, // do not lower; upsertProgress takes max(existing, this)
    stars,
    completed: input.won,
    skipOwnershipCheck: true,
  });
}

/**
 * Mark the week complete. Sets `completedAt = now`, raises the stored
 * `screen` to `finalScreenIndex`, and persists the week's total XP
 * (max-merged so a weaker replay can't lower it). Cumulative XP / rank
 * is the sum of this across the child's weeks; the client progression
 * blob is hydrated from it on the next lesson load.
 */
export async function completeAttempt(
  input: CompleteAttemptInput,
): Promise<void> {
  const userId = await requireUserId();
  const childProfileId = await resolveActiveChildProfileId(userId);
  if (!childProfileId) return;

  const week = await weekFromAttemptId(input.attemptId, childProfileId);
  const finalScreenIndex = clampInt(input.finalScreenIndex, 0, 200, 0);

  await upsertProgress({
    userId,
    childProfileId,
    productSlug: PRODUCT_SLUG,
    week,
    screen: finalScreenIndex,
    stars: 0, // do not lower; merged via max
    xp: clampInt(input.totalXp, 0, 1_000_000, 0),
    completed: true,
    skipOwnershipCheck: true,
  });
}

/* ─────────────── progression snapshot (server → client hydrate) ─────────────── */

export interface ProgressionWeekSnapshot {
  week: number;
  /** Best total XP stored for this week. */
  xp: number;
  stars: number;
  completed: boolean;
}

export interface ProgressionSnapshot {
  /** Sum of per-week xp — the durable cumulative total. */
  totalXp: number;
  weeks: ProgressionWeekSnapshot[];
  /** `week-N` badge ids for every completed week (matches WEEK_BADGES). */
  badgeIds: string[];
}

/**
 * Durable reward state for the signed-in family's active child, read
 * from Progress. The client merges this into its localStorage
 * progression blob on lesson load (max-merge, never lowering local),
 * so XP / rank / badges survive a cleared browser or a new device.
 *
 * Returns an empty snapshot (never throws) when there's no session or
 * no child yet, so the client hydrate path stays a no-op for guests.
 */
export async function getProgressionSnapshot(): Promise<ProgressionSnapshot> {
  const empty: ProgressionSnapshot = { totalXp: 0, weeks: [], badgeIds: [] };

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return empty;

  const childProfileId = await resolveActiveChildProfileId(userId);
  if (!childProfileId) return empty;

  const rows = await prisma.progress.findMany({
    where: { childProfileId, product: { slug: PRODUCT_SLUG } },
    select: { week: true, xp: true, stars: true, completedAt: true },
  });

  const weeks: ProgressionWeekSnapshot[] = rows.map((r) => ({
    week: r.week,
    xp: r.xp,
    stars: r.stars,
    completed: r.completedAt !== null,
  }));

  return {
    totalXp: weeks.reduce((sum, w) => sum + w.xp, 0),
    weeks,
    badgeIds: weeks.filter((w) => w.completed).map((w) => `week-${w.week}`),
  };
}

/**
 * Wipe the current week's Progress row and create a fresh one. The
 * returned attemptId is the new row id. `attemptNumber` is kept in
 * the return type for the consumer but is always 1 now — the old
 * "stack of attempts" concept is gone.
 */
export async function restartAttempt(
  weekNumber: number,
): Promise<{ attemptId: string; attemptNumber: number }> {
  const userId = await requireUserId();
  if (!isValidWeek(weekNumber)) {
    throw new Error("Invalid week number");
  }
  const childProfileId = await resolveActiveChildProfileId(userId);
  if (!childProfileId) {
    throw new Error("No child profile to restart against.");
  }

  await resetWeekProgress({
    userId,
    childProfileId,
    productSlug: PRODUCT_SLUG,
    week: weekNumber,
  });

  // Re-create a zeroed row so saveScreenResult has a target.
  const fresh = await upsertProgress({
    userId,
    childProfileId,
    productSlug: PRODUCT_SLUG,
    week: weekNumber,
    screen: 0,
    stars: 0,
    skipOwnershipCheck: true,
  });
  if (!fresh.ok) {
    throw new Error(`Could not restart: ${fresh.error.kind}`);
  }
  return { attemptId: fresh.row.id, attemptNumber: 1 };
}

/**
 * Retained as an API hook for the client (it called this on tab
 * close in the old schema). Flat model has nothing to mark — it's a
 * no-op. Kept so the signature contract holds.
 */
export async function markAttemptInactive(_attemptId: string): Promise<void> {
  return;
}

/* ─────────────── internal ─────────────── */

/**
 * The hook only carries `attemptId` (= Progress.id) between calls.
 * Resolve the week from that id, but fall back to looking it up via
 * the child + product if the row was lost mid-session (e.g. a
 * Restart that swapped the id). Returns a number so callers can feed
 * upsertProgress; throws if nothing matches.
 */
async function weekFromAttemptId(
  attemptId: string,
  childProfileId: string,
): Promise<number> {
  const row = await prisma.progress.findUnique({
    where: { id: attemptId },
    select: { week: true, childProfileId: true },
  });
  if (row && row.childProfileId === childProfileId) {
    return row.week;
  }
  // The hook may have stale ids after a Restart. Fall back to the
  // most-recently-updated row for this child + product so writes
  // still land somewhere reasonable rather than throwing mid-screen.
  const fallback = await prisma.progress.findFirst({
    where: {
      childProfileId,
      product: { slug: PRODUCT_SLUG },
    },
    orderBy: { updatedAt: "desc" },
    select: { week: true },
  });
  if (fallback) return fallback.week;
  throw new Error(`Cannot resolve week from attemptId ${attemptId}`);
}
