"use server";

/**
 * Cyber HQ badge actions — derived from Progress.
 *
 * Sibling of stickers.actions.ts. A week badge is earned the moment
 * that week is completed, so — exactly like stickers — earned badges
 * are derived at read time from `Progress.completedAt`; there is no
 * separate badge-award table or write step. `earnedAt` is the week's
 * completedAt timestamp. Badges whose week isn't completed are omitted
 * (they render locked on /cyberhq).
 *
 * The catalogue + types live in `./badges-data` because Next.js 16
 * forbids non-async exports from a `"use server"` file; we re-export
 * the types here so call sites can import them from either module.
 */

import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { resolveActiveChildProfileId } from "@/app/lib/progressService";
import { BADGE_CATALOGUE, type EarnedBadgeDTO } from "./badges-data";

export type { EarnedBadgeDTO, BadgeCatalogueItem } from "./badges-data";

const PRODUCT_SLUG = "cyber-heroes";

async function requireUserId(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

/**
 * Every week badge the signed-in family's active child has earned,
 * derived from completed Progress rows on the cyber-heroes product.
 */
export async function getEarnedBadges(): Promise<EarnedBadgeDTO[]> {
  const userId = await requireUserId();
  const childProfileId = await resolveActiveChildProfileId(userId);
  if (!childProfileId) return [];

  const completed = await prisma.progress.findMany({
    where: {
      childProfileId,
      product: { slug: PRODUCT_SLUG },
      completedAt: { not: null },
    },
    select: { week: true, completedAt: true },
  });

  const completedByWeek = new Map<number, Date>();
  for (const row of completed) {
    if (row.completedAt) completedByWeek.set(row.week, row.completedAt);
  }

  const result: EarnedBadgeDTO[] = [];
  for (const badge of BADGE_CATALOGUE) {
    const earnedAt = completedByWeek.get(badge.week);
    if (!earnedAt) continue;
    result.push({
      week: badge.week,
      id: badge.id,
      name: badge.name,
      icon: badge.icon,
      earnedAt,
    });
  }

  return result;
}
