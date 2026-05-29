"use server";

/**
 * Cyber HQ sticker persistence.
 *
 * Stickers are a static catalogue in code (STICKER_CATALOGUE below);
 * the DB only tracks which user has earned which sticker id (with
 * optional weekNumber). All writes go through `awardStickers` which:
 *
 *   - Authenticates via auth()
 *   - Validates each sticker id against the catalogue (a leaked
 *     server-action call can't make up a sticker the catalogue
 *     doesn't know about)
 *   - Filters out duplicates (idempotent - awarding a sticker the
 *     user already has is a no-op, not an error)
 *
 * Reads (`getEarnedStickers`) return the user's earned set joined
 * against the catalogue so the parent dashboard and /cyberhq route
 * can render them in one go.
 */

import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export interface StickerCatalogueItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  weekNumber: number;
}

/**
 * The canonical list of all stickers in the game. Adding a sticker
 * here is the ONLY way to introduce a new one - awardStickers checks
 * incoming ids against this list and silently drops unknowns. Order
 * here also drives the default sort on /cyberhq.
 */
export const STICKER_CATALOGUE: readonly StickerCatalogueItem[] = [
  {
    id: "password-master",
    name: "Password Master",
    icon: "🔐",
    description: "Built strong passwords the Raccoon can't crack.",
    weekNumber: 1,
  },
  {
    id: "secret-keeper",
    name: "Secret Keeper",
    icon: "🤐",
    description: "Stood firm when asked to share. Passwords stay secret.",
    weekNumber: 1,
  },
  {
    id: "phish-spotter",
    name: "Phish Spotter",
    icon: "🔍",
    description: "Inspected the bait and didn't bite. Sharp eyes!",
    weekNumber: 1,
  },
];

const CATALOGUE_BY_ID = new Map(
  STICKER_CATALOGUE.map((s) => [s.id, s] as const)
);

export interface EarnedStickerDTO {
  id: string;
  name: string;
  icon: string;
  description: string;
  weekNumber: number;
  earnedAt: Date;
}

async function requireUserId(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

/**
 * Award one or more stickers to the authenticated user. Idempotent:
 * stickers the user already has are silently skipped. Returns the
 * set of stickers that were NEWLY earned this call (for the
 * unlock-celebration UI).
 */
export async function awardStickers(
  stickerIds: string[]
): Promise<EarnedStickerDTO[]> {
  const userId = await requireUserId();
  if (!Array.isArray(stickerIds) || stickerIds.length === 0) return [];

  // Filter to valid catalogue ids only.
  const valid = Array.from(
    new Set(
      stickerIds
        .filter((id): id is string => typeof id === "string")
        .filter((id) => CATALOGUE_BY_ID.has(id))
    )
  );
  if (valid.length === 0) return [];

  // Find which of the requested ids the user already has so we don't
  // count them as "newly earned".
  const existing = await prisma.earnedSticker.findMany({
    where: { userId, stickerId: { in: valid } },
    select: { stickerId: true },
  });
  const existingIds = new Set(existing.map((e) => e.stickerId));
  const toCreate = valid.filter((id) => !existingIds.has(id));
  if (toCreate.length === 0) return [];

  // createMany with skipDuplicates so a race against another tab
  // can't violate the (userId, stickerId) unique index.
  await prisma.earnedSticker.createMany({
    data: toCreate.map((stickerId) => {
      const meta = CATALOGUE_BY_ID.get(stickerId)!;
      return {
        userId,
        stickerId,
        weekNumber: meta.weekNumber,
      };
    }),
    skipDuplicates: true,
  });

  // Re-query the rows we just inserted to get their earnedAt
  // timestamps. Keeps the return shape stable for the client.
  const fresh = await prisma.earnedSticker.findMany({
    where: { userId, stickerId: { in: toCreate } },
    orderBy: { earnedAt: "asc" },
  });
  return fresh.map((row) => {
    const meta = CATALOGUE_BY_ID.get(row.stickerId)!;
    return {
      id: row.stickerId,
      name: meta.name,
      icon: meta.icon,
      description: meta.description,
      weekNumber: meta.weekNumber,
      earnedAt: row.earnedAt,
    };
  });
}

/**
 * Read the authenticated user's earned-stickers catalogue. Used by
 * /cyberhq and the parent dashboard. Joins against the in-code
 * catalogue so unknown ids (e.g. a sticker we later removed) silently
 * drop instead of crashing the render.
 */
export async function getEarnedStickers(): Promise<EarnedStickerDTO[]> {
  const userId = await requireUserId();
  const rows = await prisma.earnedSticker.findMany({
    where: { userId },
    orderBy: { earnedAt: "asc" },
  });
  return rows
    .map((row) => {
      const meta = CATALOGUE_BY_ID.get(row.stickerId);
      if (!meta) return null;
      return {
        id: row.stickerId,
        name: meta.name,
        icon: meta.icon,
        description: meta.description,
        weekNumber: meta.weekNumber,
        earnedAt: row.earnedAt,
      } satisfies EarnedStickerDTO;
    })
    .filter((s): s is EarnedStickerDTO => s !== null);
}
