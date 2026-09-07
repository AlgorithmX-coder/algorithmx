"use server";

/**
 * Account-synced progress for Cyber Explorers (case = week under the
 * "cyberexplorers" product). This is an ADDITIVE layer over the runtimes'
 * localStorage save: every action is best-effort and returns quietly (never
 * throws) when the visitor isn't signed in, has no child profile, or the
 * content rows aren't seeded yet — so the live localStorage experience keeps
 * working unchanged and server sync simply activates once its prerequisites
 * exist (an authed parent with a ChildProfile + the seeded CourseContent).
 *
 * Child is auto-resolved (resolveActiveChildProfileId picks the user's child);
 * no picker UI is required. upsertProgress has no entitlement gate — it needs
 * only the product, the CourseContent row for that week, and an owned child.
 */

import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { upsertProgress, resolveActiveChildProfileId } from "@/app/lib/progressService";

const SLUG = "cyberexplorers";

export type ExplorersCaseProgress = { completed: boolean; screen: number; xp: number };
export type ExplorersProgress = { byCase: Record<number, ExplorersCaseProgress>; totalXp: number };

/** Save one case's progress to the account. Fire-and-forget from the client. */
export async function saveExplorersProgress(
  caseNumber: number,
  opts: { screen?: number; completed?: boolean; xp?: number } = {},
): Promise<{ ok: boolean; skipped?: string }> {
  try {
    if (!Number.isInteger(caseNumber) || caseNumber < 1 || caseNumber > 20) return { ok: false, skipped: "bad-case" };
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { ok: false, skipped: "no-user" };
    const childProfileId = await resolveActiveChildProfileId(userId);
    if (!childProfileId) return { ok: false, skipped: "no-child" };
    const res = await upsertProgress({
      userId,
      childProfileId,
      productSlug: SLUG,
      week: caseNumber,
      screen: Math.max(0, Math.trunc(opts.screen ?? 0)),
      stars: 0, // Explorers has no star rating; completion is tracked via completedAt
      xp: Math.max(0, Math.trunc(opts.xp ?? 0)),
      completed: opts.completed ?? false,
    });
    return res.ok ? { ok: true } : { ok: false, skipped: res.error.kind };
  } catch {
    return { ok: false, skipped: "error" };
  }
}

/** Read the child's Explorers progress (which cases are done, furthest screen, XP). */
export async function loadExplorersProgress(): Promise<ExplorersProgress> {
  const empty: ExplorersProgress = { byCase: {}, totalXp: 0 };
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return empty;
    const childProfileId = await resolveActiveChildProfileId(userId);
    if (!childProfileId) return empty;
    const product = await prisma.product.findUnique({ where: { slug: SLUG }, select: { id: true } });
    if (!product) return empty;
    const rows = await prisma.progress.findMany({
      where: { childProfileId, productId: product.id },
      select: { week: true, screen: true, xp: true, completedAt: true },
    });
    const byCase: Record<number, ExplorersCaseProgress> = {};
    let totalXp = 0;
    for (const r of rows) {
      byCase[r.week] = { completed: r.completedAt != null, screen: r.screen, xp: r.xp };
      totalXp += r.xp;
    }
    return { byCase, totalXp };
  } catch {
    return empty;
  }
}
