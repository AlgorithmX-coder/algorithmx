import { prisma } from "@/app/lib/prisma";
import type { Progress } from "@prisma/client";

/**
 * Single source of truth for writing a Progress row.
 *
 * Both /api/progress and the server actions in lessonProgress.actions
 * funnel through here so the upsert / ownership / star-merge logic
 * lives in exactly one place. Re-running the same call (same week,
 * weaker stars) cannot downgrade a row — stars are taken as
 * `max(existing, incoming)` and `completedAt` is never cleared once
 * set.
 *
 * Ownership: the caller passes both the signed-in `userId` AND the
 * `childProfileId`. We verify the child belongs to the user before
 * any write. Routes/actions that have already verified can use the
 * `skipOwnershipCheck` shortcut — never expose it to client input.
 */

export type UpsertProgressInput = {
  /** Signed-in user, used for the ChildProfile ownership check. */
  userId: string;
  childProfileId: string;
  productSlug: string;
  week: number;
  screen: number;
  stars: number;
  completed?: boolean;
  /** Set true ONLY by callers that already verified ownership. */
  skipOwnershipCheck?: boolean;
};

export type ProgressServiceError =
  | { kind: "child_not_found" }
  | { kind: "child_not_owned" }
  | { kind: "product_not_found" }
  | { kind: "course_content_not_found" }
  | { kind: "invalid_stars" };

export type UpsertProgressResult =
  | { ok: true; row: Progress }
  | { ok: false; error: ProgressServiceError };

export async function upsertProgress(
  input: UpsertProgressInput,
): Promise<UpsertProgressResult> {
  const {
    userId,
    childProfileId,
    productSlug,
    week,
    screen,
    stars,
    completed,
    skipOwnershipCheck,
  } = input;

  if (stars < 0 || stars > 3 || !Number.isFinite(stars)) {
    return { ok: false, error: { kind: "invalid_stars" } };
  }

  if (!skipOwnershipCheck) {
    const child = await prisma.childProfile.findUnique({
      where: { id: childProfileId },
      select: { id: true, userId: true },
    });
    if (!child) return { ok: false, error: { kind: "child_not_found" } };
    if (child.userId !== userId) {
      return { ok: false, error: { kind: "child_not_owned" } };
    }
  }

  const product = await prisma.product.findUnique({
    where: { slug: productSlug },
    select: { id: true },
  });
  if (!product) return { ok: false, error: { kind: "product_not_found" } };

  const courseContent = await prisma.courseContent.findUnique({
    where: { productId_week: { productId: product.id, week } },
    select: { id: true },
  });
  if (!courseContent) {
    return { ok: false, error: { kind: "course_content_not_found" } };
  }

  const existing = await prisma.progress.findUnique({
    where: {
      childProfileId_productId_week: {
        childProfileId,
        productId: product.id,
        week,
      },
    },
    select: { stars: true, screen: true, completedAt: true },
  });

  const nextScreen = existing ? Math.max(existing.screen, screen) : screen;
  const nextStars = existing ? Math.max(existing.stars, stars) : stars;
  const nextCompletedAt = existing?.completedAt
    ? existing.completedAt
    : completed === true
      ? new Date()
      : null;

  const row = await prisma.progress.upsert({
    where: {
      childProfileId_productId_week: {
        childProfileId,
        productId: product.id,
        week,
      },
    },
    create: {
      childProfileId,
      productId: product.id,
      courseContentId: courseContent.id,
      week,
      screen: nextScreen,
      stars: nextStars,
      completedAt: nextCompletedAt,
    },
    update: {
      screen: nextScreen,
      stars: nextStars,
      completedAt: nextCompletedAt,
    },
  });

  return { ok: true, row };
}

/**
 * Resolve the active child for an authenticated user. The lesson hook
 * doesn't carry a `childProfileId` through its public API, so we pick
 * the first (most-recently-created) child. Multi-child support arrives
 * later via a session-level selector.
 */
export async function resolveActiveChildProfileId(
  userId: string,
): Promise<string | null> {
  const child = await prisma.childProfile.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  return child?.id ?? null;
}

/**
 * Delete the Progress row for (child, product, week). Used by
 * "restart this week" flows.
 */
export async function resetWeekProgress(opts: {
  userId: string;
  childProfileId: string;
  productSlug: string;
  week: number;
}): Promise<{ ok: true } | { ok: false; error: ProgressServiceError }> {
  const child = await prisma.childProfile.findUnique({
    where: { id: opts.childProfileId },
    select: { id: true, userId: true },
  });
  if (!child) return { ok: false, error: { kind: "child_not_found" } };
  if (child.userId !== opts.userId) {
    return { ok: false, error: { kind: "child_not_owned" } };
  }
  const product = await prisma.product.findUnique({
    where: { slug: opts.productSlug },
    select: { id: true },
  });
  if (!product) return { ok: false, error: { kind: "product_not_found" } };

  await prisma.progress.deleteMany({
    where: {
      childProfileId: opts.childProfileId,
      productId: product.id,
      week: opts.week,
    },
  });
  return { ok: true };
}
