"use server";

/**
 * Cyber HQ sticker actions — derived from Progress.
 *
 * The old EarnedSticker table was dropped. Stickers are now derived
 * at read-time from completed Progress rows: completing week N
 * unlocks every sticker in the catalogue with `weekNumber === N`.
 * No new persistence table.
 *
 * The catalogue + types live in `./stickers-data` because Next.js
 * 16 forbids non-async exports from a `"use server"` file. We
 * re-export the types here so call-sites that historically imported
 * them from `stickers.actions` keep compiling unchanged.
 *
 * Trade-offs vs the old shape:
 *   - Per-exercise stickers (e.g. "phish-spotter" historically
 *     awarded mid-week for getting a phishing question right) are
 *     now coarsely tied to week completion. If a designer wants
 *     sub-week granularity again, introduce a sticker-claim table
 *     in a later batch — do NOT bolt a new column onto Progress.
 *   - `awardStickers` is a no-op that returns []. The "newly
 *     earned" celebration won't fire from this call — instead the
 *     completion screen should diff a getEarnedStickers before/after
 *     call if it wants the same UX. Today the one-time celebration
 *     on week completion is acceptable.
 */

import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { resolveActiveChildProfileId } from "@/app/lib/progressService";
import {
  STICKER_CATALOGUE,
  type EarnedStickerDTO,
} from "./stickers-data";

// Re-export so existing `import { EarnedStickerDTO } from
// "@/app/lib/stickers.actions"` call sites keep working. Types
// are erased at build time and don't violate the use-server rule.
export type { EarnedStickerDTO, StickerCatalogueItem } from "./stickers-data";

const PRODUCT_SLUG = "cyber-heroes";

async function requireUserId(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

/**
 * No-op write — kept on the API surface so DynamicLesson's call site
 * doesn't have to change. Sticker membership is derived at read time
 * by `getEarnedStickers` from completed Progress rows; there is no
 * persistence step to perform here.
 */
export async function awardStickers(
  stickerIds: string[],
): Promise<EarnedStickerDTO[]> {
  // Still authenticate so an unsigned caller fails the same way it
  // used to. Then return [] so the celebration no-ops gracefully.
  await requireUserId();
  void stickerIds;
  return [];
}

/**
 * Every sticker the signed-in family's active child has earned,
 * derived from completed Progress rows on the cyber-heroes product.
 * `earnedAt` = the Progress.completedAt timestamp for the week that
 * unlocked the sticker. Stickers whose weekNumber doesn't map to a
 * completed Progress row are omitted (i.e. still locked on /cyberhq).
 */
export async function getEarnedStickers(): Promise<EarnedStickerDTO[]> {
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

  // week → completedAt for O(1) lookup below.
  const completedByWeek = new Map<number, Date>();
  for (const row of completed) {
    if (row.completedAt) completedByWeek.set(row.week, row.completedAt);
  }

  const result: EarnedStickerDTO[] = [];
  for (const sticker of STICKER_CATALOGUE) {
    const earnedAt = completedByWeek.get(sticker.weekNumber);
    if (!earnedAt) continue;
    result.push({
      id: sticker.id,
      name: sticker.name,
      icon: sticker.icon,
      description: sticker.description,
      weekNumber: sticker.weekNumber,
      earnedAt,
    });
  }

  return result;
}
