/**
 * Which weeks have a written teacher pack.
 *
 * Seven of twenty are written. The first three were not an accident of ordering:
 * these are the three the format was proved against, because they are the
 * three that break a format if anything does. Week 1 is ordinary, week 11
 * has no villain and carries a safeguarding briefing, week 20 teaches
 * nothing new. The other seventeen are content work, and each one is a data
 * file in this folder and nothing else.
 */
import { WEEK_1 } from "./week1";
import { WEEK_2 } from "./week2";
import { WEEK_3 } from "./week3";
import { WEEK_4 } from "./week4";
import { WEEK_5 } from "./week5";
import { WEEK_11 } from "./week11";
import { WEEK_20 } from "./week20";
import type { Pack } from "./types";

export type { Pack, Slide, Concept, SceneKey, Heard } from "./types";

const PACKS: Record<number, Pack> = {
  1: WEEK_1,
  2: WEEK_2,
  3: WEEK_3,
  4: WEEK_4,
  5: WEEK_5,
  11: WEEK_11,
  20: WEEK_20,
};

/** Null for a week nobody has written yet, which the route turns into a 404
 *  rather than an empty deck a teacher would open in front of a class. */
export function getPack(week: number): Pack | null {
  return PACKS[week] ?? null;
}

/** In teaching order, for the index page. */
export function writtenWeeks(): Pack[] {
  return Object.keys(PACKS).map(Number).sort((a, b) => a - b).map((n) => PACKS[n]);
}
