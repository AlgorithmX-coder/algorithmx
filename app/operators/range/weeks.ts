/* Registry of BUILT engagements, keyed by week number.
 *
 * A week appears here once its WeekDef + Act surface exist. The play route and
 * the course map read this to tell built weeks from the still-to-come ones in
 * the locked 16-week curriculum, so there is a single source of "what's
 * actually playable" as content is authored week by week. */

import type { WeekDef } from "./Engagement";
import { WEEK1 } from "./week01";

export const BUILT_WEEKS: Record<number, WeekDef> = {
  1: WEEK1,
};

export function builtWeek(n: number): WeekDef | null {
  return BUILT_WEEKS[n] ?? null;
}

export const HIGHEST_BUILT_WEEK = Math.max(...Object.keys(BUILT_WEEKS).map(Number));
