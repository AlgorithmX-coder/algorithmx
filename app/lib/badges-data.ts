/**
 * The badge catalogue, derived from the weeks themselves.
 *
 * Mirror of stickers-data.ts: lives outside badges.actions.ts because
 * Next.js 16 forbids any non-async export from a `"use server"` file. One
 * badge per week; the `id` is `week-N` so it lines up exactly with
 * progression.ts WEEK_BADGES, the client `earnBadge("week-N")` calls, and
 * the `badgeIds` in getProgressionSnapshot.
 *
 * This was a hand-written list of twenty names and twenty emoji, kept in
 * step with each week's own `badgeName` and `badgeIcon` by hand. It also
 * knew nothing about `badgeArt` - the bespoke medal drawn for every one of
 * the twenty weeks - so the badge case in Cyber HQ showed a padlock emoji
 * where the week had a gold Password Protector medal sitting on disk.
 *
 * Owner, 2026-10-16: "I don't want any obsolete emojis or pictures lying
 * around once we've created the new ones."
 *
 * So the week is the single source, as it is for stickers. A week names its
 * badge and points at its art in its own file, and this is built from that.
 */

import { WEEK_CONTENT } from "@/app/lesson/weekContent";

export interface BadgeCatalogueItem {
  week: number;
  id: string;
  name: string;
  icon: string;
  /** The week's bespoke medal art. Optional, so a week without it still renders. */
  art?: string;
}

export interface EarnedBadgeDTO {
  week: number;
  id: string;
  name: string;
  icon: string;
  art?: string;
  earnedAt: Date;
}

function buildCatalogue(): BadgeCatalogueItem[] {
  return Object.keys(WEEK_CONTENT)
    .map(Number)
    .sort((a, b) => a - b)
    .map((week) => {
      const content = WEEK_CONTENT[week];
      return {
        week,
        id: `week-${week}`,
        name: content.badgeName,
        icon: content.badgeIcon,
        art: content.badgeArt,
      };
    });
}

export const BADGE_CATALOGUE: readonly BadgeCatalogueItem[] = buildCatalogue();
