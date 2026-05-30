/**
 * Static sticker catalogue + shared types.
 *
 * Lives outside stickers.actions.ts because Next.js 16 forbids any
 * non-async export from a `"use server"` file. The catalogue is a
 * constant, so it must live in a plain module that both the actions
 * file (which IS server-only) and consumer pages (like /cyberhq) can
 * import freely.
 */

export interface StickerCatalogueItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  weekNumber: number;
}

export interface EarnedStickerDTO {
  id: string;
  name: string;
  icon: string;
  description: string;
  weekNumber: number;
  earnedAt: Date;
}

/**
 * The canonical list of all stickers in the game. Adding a sticker
 * here is the ONLY way to introduce a new one - awardStickers (in
 * stickers.actions.ts) checks incoming ids against this list and
 * silently drops unknowns. Order here also drives the default sort
 * on /cyberhq.
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
