"use client";

/**
 * Plausible analytics event emitter.
 *
 * The PlausibleScript component already loads plausible.js when
 * `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is set; it exposes a global
 * `window.plausible(name, { props })` function. This module wraps
 * that call and:
 *
 *   - No-ops cleanly when plausible isn't loaded (dev, staging
 *     without the env var, ad-blocker).
 *   - Centralises the event names so we don't drift across the app.
 *   - Restricts props to non-sensitive metadata (weekNumber,
 *     screenIndex, screenType, etc.). NEVER question text, child
 *     name, email, or other PII.
 */

type EventName =
  | "lesson_started"
  | "screen_completed"
  | "wrong_answer"
  | "hint_used"
  | "boss_started"
  | "boss_completed"
  | "lesson_completed"
  | "exercise_quit";

interface PlausibleFn {
  (name: string, options?: { props?: Record<string, string | number | boolean> }): void;
}

declare global {
  interface Window {
    plausible?: PlausibleFn;
  }
}

/** Common prop shape for every event. */
export interface BaseEventProps {
  weekNumber?: number;
  screenIndex?: number;
  screenType?: string;
}

export function emitEvent(
  name: EventName,
  props: Record<string, string | number | boolean> = {}
): void {
  if (typeof window === "undefined") return;
  const fn = window.plausible;
  if (typeof fn !== "function") return;
  try {
    fn(name, { props });
  } catch {
    /* never let an analytics failure affect gameplay */
  }
}

/* ───────────────── Typed convenience emitters ─────────────────
 * Each is a thin wrapper so call sites don't have to remember the
 * prop names. Use these from DynamicLesson + exercise components.
 */

export const analytics = {
  lessonStarted(p: { weekNumber: number; isResume: boolean }) {
    emitEvent("lesson_started", p);
  },
  screenCompleted(p: {
    weekNumber: number;
    screenIndex: number;
    screenType: string;
    durationMs: number;
    wrongCount: number;
    hintTierReached: number;
    starsEarned: number;
  }) {
    emitEvent("screen_completed", p);
  },
  wrongAnswer(p: {
    weekNumber: number;
    screenIndex: number;
    screenType: string;
    questionKey?: string;
  }) {
    emitEvent("wrong_answer", {
      weekNumber: p.weekNumber,
      screenIndex: p.screenIndex,
      screenType: p.screenType,
      ...(p.questionKey ? { questionKey: p.questionKey } : {}),
    });
  },
  hintUsed(p: {
    weekNumber: number;
    screenIndex: number;
    screenType: string;
    tier: 1 | 2 | 3;
  }) {
    emitEvent("hint_used", p);
  },
  bossStarted(p: { weekNumber: number }) {
    emitEvent("boss_started", p);
  },
  bossCompleted(p: {
    weekNumber: number;
    won: boolean;
    accuracy: number;
    bestCombo: number;
    durationMs: number;
  }) {
    emitEvent("boss_completed", p);
  },
  lessonCompleted(p: {
    weekNumber: number;
    totalXp: number;
    durationMs: number;
  }) {
    emitEvent("lesson_completed", p);
  },
  exerciseQuit(p: {
    weekNumber: number;
    screenIndex: number;
    screenType: string;
    durationMs: number;
  }) {
    emitEvent("exercise_quit", p);
  },
};
