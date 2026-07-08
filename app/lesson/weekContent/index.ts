import { WEEK_1 } from "./week1";
import { WEEK_2 } from "./week2";
import { WEEK_3 } from "./week3";
import { WEEK_4 } from "./week4";
import { WEEK_5 } from "./week5";
import { WEEK_6 } from "./week6";
import { WEEK_7 } from "./week7";
import { WEEK_8 } from "./week8";
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
};

export function getWeekContent(weekNumber: number): WeekContent | null {
  return WEEK_CONTENT[weekNumber] ?? null;
}

export function getAvailableWeeks(): number[] {
  return Object.keys(WEEK_CONTENT)
    .map(Number)
    .sort((a, b) => a - b);
}
