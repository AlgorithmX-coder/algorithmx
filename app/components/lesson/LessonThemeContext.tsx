"use client";

/**
 * Carries the optional per-week visual theme (WeekTheme) down to the shared
 * lesson chrome (LessonStage, ExerciseFrame, …) without prop-drilling through
 * dozens of screen cases and 40+ exercise call sites.
 *
 * value === null  →  the week has no theme  →  every consumer keeps its exact
 * current hardcoded look. Only themed weeks change anything.
 */

import { createContext, useContext } from "react";
import type { WeekTheme } from "@/app/lesson/weekContent/weekThemes";

export const LessonThemeContext = createContext<WeekTheme | null>(null);

export function useLessonTheme(): WeekTheme | null {
  return useContext(LessonThemeContext);
}
