/**
 * The sticker catalogue, derived from the weeks themselves.
 *
 * Lives outside stickers.actions.ts because Next.js 16 forbids any
 * non-async export from a `"use server"` file. Both the actions file
 * (which IS server-only) and consumer pages (like /cyberhq) import it.
 *
 * It used to be a hand-written list, and that list had drifted badly from
 * the game:
 *
 *   the lesson awarded        the catalogue knew about
 *   -------------------       ------------------------
 *   Password Protector        Password Master
 *   Key Master                Secret Keeper
 *   Secret Keeper             Phish Spotter   <- phishing is week 4
 *
 * Cyber HQ derives what a child owns from this catalogue alone, so a child
 * finished week 1, was shown three stickers by the lesson, and then found
 * three DIFFERENT ones in their collection, including one for a week they
 * had not reached. Worse, the list only ever had three entries, all tagged
 * week 1, while the twenty week files author 62 stickers between them:
 * weeks 2 to 20 contributed nothing to Cyber HQ at all.
 *
 * Two hand-maintained copies of one list will always drift, so there is only
 * one now. A week authors its stickers in its own file, beside the screen
 * that awards them, and the catalogue is built from that. Adding a sticker
 * to a week is all it takes for Cyber HQ to know about it.
 */

import { WEEK_CONTENT } from "@/app/lesson/weekContent";

export interface StickerCatalogueItem {
  id: string;
  name: string;
  icon: string;
  /** Bespoke art: the week's cast in that week's costume. Optional. */
  art?: string;
  description: string;
  weekNumber: number;
}

export interface EarnedStickerDTO {
  id: string;
  name: string;
  icon: string;
  art?: string;
  description: string;
  weekNumber: number;
  earnedAt: Date;
}

/**
 * Every sticker in the game, in week order and then in the order its week
 * awards them. That order drives the default sort on /cyberhq.
 *
 * A duplicate id across two weeks would make a sticker ambiguous - which
 * week unlocks it? - so the first week to claim an id keeps it. There are no
 * duplicates today; this is here so that introducing one costs a missing
 * sticker rather than a double-counted one.
 */
function buildCatalogue(): StickerCatalogueItem[] {
  const out: StickerCatalogueItem[] = [];
  const seen = new Set<string>();
  const weeks = Object.keys(WEEK_CONTENT)
    .map(Number)
    .sort((a, b) => a - b);
  for (const weekNumber of weeks) {
    for (const screen of WEEK_CONTENT[weekNumber]?.screens ?? []) {
      if (screen.type !== "stickerUnlock") continue;
      for (const s of screen.stickers) {
        if (seen.has(s.id)) continue;
        seen.add(s.id);
        out.push({
          id: s.id,
          name: s.name,
          icon: s.icon,
          art: s.art,
          description: s.description,
          weekNumber,
        });
      }
    }
  }
  return out;
}

export const STICKER_CATALOGUE: readonly StickerCatalogueItem[] = buildCatalogue();
