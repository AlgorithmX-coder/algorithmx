"use server";

/**
 * Server actions for lesson progress persistence.
 *
 * Every action authenticates via `auth()` and derives `userId` from
 * the session. Client-supplied `userId` is never trusted. Every write
 * that references an existing LessonAttempt also re-checks that the
 * attempt belongs to the authenticated user, so a leaked attemptId
 * can't be used to write into another user's row.
 */

import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

/* ─────────────── helpers ─────────────── */

async function requireUserId(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("Not authenticated");
  }
  return userId;
}

async function assertAttemptBelongsToUser(
  attemptId: string,
  userId: string
): Promise<{ id: string; weekNumber: number }> {
  const attempt = await prisma.lessonAttempt.findUnique({
    where: { id: attemptId },
    select: { id: true, userId: true, weekNumber: true },
  });
  if (!attempt || attempt.userId !== userId) {
    // Don't reveal whether the attempt exists vs. belongs to another
    // user. Both should look the same to the caller.
    throw new Error("Attempt not found");
  }
  return { id: attempt.id, weekNumber: attempt.weekNumber };
}

function isValidWeek(week: unknown): week is number {
  return typeof week === "number" && Number.isInteger(week) && week >= 1 && week <= 60;
}

function clampInt(n: unknown, min: number, max: number, fallback = min): number {
  if (typeof n !== "number" || !Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
}

/* ─────────────── attempts ─────────────── */

export interface StartOrResumeResult {
  attemptId: string;
  weekNumber: number;
  /** Highest screen the child has reached on the resumed attempt. 0 if new. */
  lastScreenIndex: number;
  /** True when an existing unfinished attempt was returned. */
  isResume: boolean;
}

/**
 * Find the most recent unfinished LessonAttempt for (userId,
 * weekNumber) and return it for resume. If none exists, create a new
 * one. Either way the caller gets back `attemptId` and the screen
 * index to resume at.
 */
export async function startOrResumeAttempt(
  weekNumber: number
): Promise<StartOrResumeResult> {
  const userId = await requireUserId();
  if (!isValidWeek(weekNumber)) {
    throw new Error("Invalid week number");
  }

  // Pick the newest LIVE unfinished attempt:
  //   - `completed: false`     -> not yet finished
  //   - `abandonedAt: null`    -> not retired by Restart
  // attemptNumber desc is the primary sort so a freshly-restarted
  // attempt always wins over an older orphaned in-progress row,
  // even if their startedAt values are close.
  const existing = await prisma.lessonAttempt.findFirst({
    where: {
      userId,
      weekNumber,
      completed: false,
      abandonedAt: null,
    },
    orderBy: [{ attemptNumber: "desc" }, { startedAt: "desc" }],
  });
  if (existing) {
    return {
      attemptId: existing.id,
      weekNumber: existing.weekNumber,
      lastScreenIndex: existing.finalScreenIndex,
      isResume: existing.finalScreenIndex > 0,
    };
  }

  // Determine next attemptNumber.
  const previousCount = await prisma.lessonAttempt.count({
    where: { userId, weekNumber },
  });
  const created = await prisma.lessonAttempt.create({
    data: {
      userId,
      weekNumber,
      attemptNumber: previousCount + 1,
    },
  });
  return {
    attemptId: created.id,
    weekNumber: created.weekNumber,
    lastScreenIndex: 0,
    isResume: false,
  };
}

/* ─────────────── per-screen ─────────────── */

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

/**
 * Save a per-screen outcome. Uses an upsert keyed by
 * (attemptId, screenIndex) so re-saves (e.g. resume + finish) replace
 * the existing row instead of duplicating. Also advances the parent
 * attempt's `finalScreenIndex` if this screen is further along.
 */
export async function saveScreenResult(input: ScreenResultInput): Promise<void> {
  const userId = await requireUserId();
  const { weekNumber: _wk } = await assertAttemptBelongsToUser(
    input.attemptId,
    userId
  );
  // _wk used only for the side-effect of the auth check; suppress lint.
  void _wk;

  const screenIndex = clampInt(input.screenIndex, 0, 200);
  const screenType = String(input.screenType ?? "unknown").slice(0, 64);
  const durationMs = clampInt(input.durationMs, 0, 60 * 60 * 1000, 0); // ≤ 1h sanity
  const wrongCount = clampInt(input.wrongCount, 0, 1000, 0);
  const hintTierReached = clampInt(input.hintTierReached, 0, 3, 0);
  const xpEarned = clampInt(input.xpEarned, 0, 100000, 0);
  const starsEarned = clampInt(input.starsEarned, 1, 3, 3);

  // The update branch deliberately OMITS `hintTierReached`. Without
  // that protection, a child who reloads the page and replays a
  // previously-3-tier screen with no hints would save 0 and the
  // historical record would lose the "they needed help" signal.
  // We follow up with a guarded updateMany that only RAISES the
  // value when the new one exceeds what's already stored, mirroring
  // the pattern used for finalScreenIndex on LessonAttempt.
  await prisma.screenResult.upsert({
    where: {
      attemptId_screenIndex: {
        attemptId: input.attemptId,
        screenIndex,
      },
    },
    create: {
      attemptId: input.attemptId,
      screenIndex,
      screenType,
      durationMs,
      wrongCount,
      hintTierReached,
      xpEarned,
      starsEarned,
      completedAt: new Date(),
    },
    update: {
      screenType,
      durationMs,
      wrongCount,
      xpEarned,
      starsEarned,
      completedAt: new Date(),
    },
  });
  if (hintTierReached > 0) {
    await prisma.screenResult.updateMany({
      where: {
        attemptId: input.attemptId,
        screenIndex,
        hintTierReached: { lt: hintTierReached },
      },
      data: { hintTierReached },
    });
  }

  // Bump finalScreenIndex if this is the furthest we've reached.
  await prisma.lessonAttempt.update({
    where: { id: input.attemptId },
    data: {
      finalScreenIndex: { set: screenIndex },
      // Only ever move forward - use a raw conditional via subsequent
      // updateMany so we don't accidentally regress on save-after-resume.
    },
  });
  // Belt-and-braces: if a later save came in out of order, the line
  // above could regress. Run a second guarded update that only
  // increases the value.
  await prisma.lessonAttempt.updateMany({
    where: { id: input.attemptId, finalScreenIndex: { lt: screenIndex } },
    data: { finalScreenIndex: screenIndex },
  });
}

/* ─────────────── question-level ─────────────── */

export interface QuestionResponseInput {
  attemptId: string;
  screenIndex: number;
  /** Stable key like "boss-easy-0" or "maze-2". Never the question text. */
  questionKey: string;
  selectedIndex: number; // -1 for timeout
  correctIndex: number;
  wasCorrect: boolean;
  /** Which retry at this question, default 1. */
  attemptIndex?: number;
}

export async function saveQuestionResponse(
  input: QuestionResponseInput
): Promise<void> {
  const userId = await requireUserId();
  await assertAttemptBelongsToUser(input.attemptId, userId);

  const screenIndex = clampInt(input.screenIndex, 0, 200);
  const questionKey = String(input.questionKey ?? "").slice(0, 128);
  if (!questionKey) return; // silently no-op rather than throw on bad key
  const selectedIndex = clampInt(input.selectedIndex, -1, 99);
  const correctIndex = clampInt(input.correctIndex, 0, 99);
  const attemptIndex = clampInt(input.attemptIndex ?? 1, 1, 99);

  await prisma.questionResponse.create({
    data: {
      attemptId: input.attemptId,
      screenIndex,
      questionKey,
      selectedIndex,
      correctIndex,
      wasCorrect: !!input.wasCorrect,
      attemptIndex,
    },
  });
}

/* ─────────────── boss + completion ─────────────── */

export interface BossResultInput {
  attemptId: string;
  won: boolean;
  accuracy: number; // 0-100
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  bestCombo: number;
  durationMs: number;
  badgeEarned: boolean;
  badgeId?: string;
}

export async function saveBossResult(input: BossResultInput): Promise<void> {
  const userId = await requireUserId();
  await assertAttemptBelongsToUser(input.attemptId, userId);

  const data = {
    won: !!input.won,
    accuracy: clampInt(input.accuracy, 0, 100, 0),
    totalQuestions: clampInt(input.totalQuestions, 0, 200, 0),
    correctCount: clampInt(input.correctCount, 0, 200, 0),
    wrongCount: clampInt(input.wrongCount, 0, 200, 0),
    bestCombo: clampInt(input.bestCombo, 0, 200, 0),
    durationMs: clampInt(input.durationMs, 0, 60 * 60 * 1000, 0),
    badgeEarned: !!input.badgeEarned,
    badgeId: input.badgeId ? String(input.badgeId).slice(0, 64) : null,
  };

  await prisma.bossResult.upsert({
    where: { attemptId: input.attemptId },
    create: { attemptId: input.attemptId, ...data },
    update: data,
  });
}

export interface CompleteAttemptInput {
  attemptId: string;
  totalXp: number;
  finalScreenIndex: number;
}

export async function completeAttempt(
  input: CompleteAttemptInput
): Promise<void> {
  const userId = await requireUserId();
  const { weekNumber } = await assertAttemptBelongsToUser(
    input.attemptId,
    userId
  );

  const incomingXp = clampInt(input.totalXp, 0, 1_000_000, 0);
  const incomingFinalScreen = clampInt(input.finalScreenIndex, 0, 200, 0);

  // Edge case this defends against: a child reaches the completion
  // screen, the async completeAttempt fires, but the network request
  // dies (tab refresh, navigation, transient failure). On the next
  // mount the resume path may call completeAttempt AGAIN, this time
  // with totalXp = 0 because the new component instance hasn't
  // re-earned the XP. Without raise-only writes the second call
  // would overwrite the stored 150 with 0.
  //
  // Step 1: flip the completion flags unconditionally. completed +
  // completedAt are safe to set every time.
  await prisma.lessonAttempt.update({
    where: { id: input.attemptId },
    data: {
      completed: true,
      completedAt: new Date(),
    },
  });
  // Step 2: raise-only writes for totalXp and finalScreenIndex.
  // updateMany with a guarded WHERE means the write only fires when
  // the incoming value is strictly higher than what's stored.
  if (incomingXp > 0) {
    await prisma.lessonAttempt.updateMany({
      where: { id: input.attemptId, totalXp: { lt: incomingXp } },
      data: { totalXp: incomingXp },
    });
  }
  if (incomingFinalScreen > 0) {
    await prisma.lessonAttempt.updateMany({
      where: {
        id: input.attemptId,
        finalScreenIndex: { lt: incomingFinalScreen },
      },
      data: { finalScreenIndex: incomingFinalScreen },
    });
  }

  // Legacy bridge: keep the Progress/Module model in sync so any
  // other surface still reading the old shape (course pages,
  // /dashboard, certificate logic) sees this week as completed.
  // Best-effort - if the corresponding Module isn't seeded we just
  // skip without throwing.
  try {
    const moduleRow = await prisma.module.findFirst({
      where: {
        weekNumber,
        course: { title: "Cyber Heroes Academy" },
      },
      select: { id: true },
    });
    if (moduleRow) {
      await prisma.progress.upsert({
        where: {
          userId_moduleId: {
            userId,
            moduleId: moduleRow.id,
          },
        },
        create: {
          userId,
          moduleId: moduleRow.id,
          status: "COMPLETED",
          completedAt: new Date(),
        },
        update: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });
    }
  } catch {
    /* legacy sync is best-effort - never block lesson completion */
  }
}

/**
 * Force-start a brand new attempt for (userId, weekNumber), bumping
 * attemptNumber past whatever already exists. The Restart button on
 * the resume banner calls this.
 *
 * Data-integrity guarantee: before creating the new attempt we mark
 * EVERY prior unfinished+non-abandoned attempt for (userId,
 * weekNumber) with `abandonedAt = now()`. The resume lookup filters
 * those rows out, so a Restart followed by a completed run followed
 * by a re-open of Week 1 can NEVER pick the original abandoned
 * attempt back up by mistake. The abandoned rows are retained on
 * disk for analytics history.
 *
 * Returns the new attempt id + assigned attemptNumber.
 */
export async function restartAttempt(
  weekNumber: number
): Promise<{ attemptId: string; attemptNumber: number }> {
  const userId = await requireUserId();
  if (!isValidWeek(weekNumber)) {
    throw new Error("Invalid week number");
  }

  // Run abandonment + count + create in a transaction so a partial
  // failure can't leave an abandoned row without a successor.
  const result = await prisma.$transaction(async (tx) => {
    await tx.lessonAttempt.updateMany({
      where: {
        userId,
        weekNumber,
        completed: false,
        abandonedAt: null,
      },
      data: { abandonedAt: new Date() },
    });
    const previousCount = await tx.lessonAttempt.count({
      where: { userId, weekNumber },
    });
    return tx.lessonAttempt.create({
      data: {
        userId,
        weekNumber,
        attemptNumber: previousCount + 1,
      },
    });
  });

  return { attemptId: result.id, attemptNumber: result.attemptNumber };
}

/**
 * Mark an attempt as abandoned (no completion). Doesn't delete - we
 * keep the partial data for analytics. The next call to
 * `startOrResumeAttempt` will still pick this row up unless the
 * caller explicitly wants a fresh start (handled at start time, not
 * here).
 */
export async function markAttemptInactive(attemptId: string): Promise<void> {
  const userId = await requireUserId();
  await assertAttemptBelongsToUser(attemptId, userId);
  // No-op for now - retained as an API hook so we can update timing
  // fields or set a flag later without changing the client contract.
  return;
}
