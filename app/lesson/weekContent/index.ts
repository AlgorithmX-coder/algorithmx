import { WEEK_1 } from "./week1";
import { WEEK_2 } from "./week2";
import { WEEK_3 } from "./week3";
import { WEEK_4 } from "./week4";
import { WEEK_5 } from "./week5";
import { WEEK_6 } from "./week6";
import { WEEK_7 } from "./week7";
import { WEEK_8 } from "./week8";
import { WEEK_9 } from "./week9";
import { WEEK_10 } from "./week10";
import { WEEK_11 } from "./week11";
import { WEEK_12 } from "./week12";
import { WEEK_13 } from "./week13";
import { WEEK_14 } from "./week14";
import type { WeekContent } from "./types";

export type { WeekContent, BossQuestion, ScreenDef } from "./types";

export const WEEK_CONTENT: Record<number, WeekContent> = {
  1: WEEK_1,
  2: WEEK_2,
  3: WEEK_3,
  4: WEEK_4,
  5: WEEK_5,
  6: WEEK_6,
  7: WEEK_7,
  8: WEEK_8,
  9: WEEK_9,
  10: WEEK_10,
  11: WEEK_11,
  12: WEEK_12,
  13: WEEK_13,
  14: WEEK_14,
};

export function getWeekContent(weekNumber: number): WeekContent | null {
  return WEEK_CONTENT[weekNumber] ?? null;
}

export function getAvailableWeeks(): number[] {
  return Object.keys(WEEK_CONTENT)
    .map(Number)
    .sort((a, b) => a - b);
}
