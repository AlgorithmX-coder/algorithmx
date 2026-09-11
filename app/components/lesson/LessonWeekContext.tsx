"use client";

/**
 * LessonWeekContext - the current week NUMBER, provided by DynamicLesson next
 * to LessonThemeContext, so deep shared components (game intros, quick-checks,
 * the threat scene) can resolve the week's THEMED character art
 * (see app/lib/weekCharacters.ts) without threading a prop through every
 * exercise. null (outside a lesson) -> callers fall back to the shared sprites.
 */
import { createContext, useContext } from "react";

export const LessonWeekContext = createContext<number | null>(null);

export function useLessonWeek(): number | null {
  return useContext(LessonWeekContext);
}
