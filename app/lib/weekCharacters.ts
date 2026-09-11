/**
 * Per-week THEMED character sprites (owner mandate 2026-09-11: Adam, Layla and
 * the Hacker Raccoon should suit each week's world, not one generic look).
 *
 * The themed HERO art already exists at public/game/characters/wNN/
 * {hero}-{outfit}-{pose}.png (idle / attack / celebrate) - this module just
 * names each week's outfit so scenes can resolve it. The Raccoon is themed the
 * same way at wNN/raccoon-{outfit}-{mood}.png.
 *
 * SAFE BY DEFAULT: anything missing (a week with no entry, a mood that only
 * exists in the shared set, raccoon art not generated yet) falls back to the
 * shared sprite - wire `fallbackToShared` as the <img onError> so the swap is
 * automatic and a week with no themed file renders exactly as before.
 */
import type { SyntheticEvent } from "react";

export type CharacterName = "adam" | "layla" | "raccoon";

/** Week -> costume slug used in the wNN filenames (from the shipped art set). */
export const WEEK_OUTFITS: Record<number, string> = {
  1: "locksmith",
  2: "forgeapron",
  3: "detective",
  4: "fisher",
  5: "artist",
  6: "esports",
  7: "guard",
  8: "photographer",
  9: "inspector",
  10: "rescue",
  11: "captain",
  12: "ranger",
  13: "pj",
  14: "scout",
  15: "reporter",
  16: "inspector",
  17: "knight",
  18: "pajama",
  19: "cardigan",
  20: "gradsuit",
};

/** The shared (un-themed) sprite every week used before theming. */
export function sharedCharacterSrc(character: CharacterName, mood: string): string {
  return `/game/characters/${character}-${mood}.png`;
}

/** The week's themed sprite when the week has an outfit; else the shared one. */
export function weekCharacterSrc(
  week: number | undefined,
  character: CharacterName,
  mood: string,
): string {
  const outfit = week ? WEEK_OUTFITS[week] : undefined;
  if (!outfit) return sharedCharacterSrc(character, mood);
  const NN = String(week).padStart(2, "0");
  return `/game/characters/w${NN}/${character}-${outfit}-${mood}.png`;
}

/**
 * <img onError> handler: if the themed file is missing, swap to the shared
 * sprite (once - never loops if the shared one is missing too).
 */
export function fallbackToShared(character: CharacterName, mood: string) {
  return (e: SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const shared = sharedCharacterSrc(character, mood);
    if (img.src.endsWith(shared)) return;
    img.src = shared;
  };
}
