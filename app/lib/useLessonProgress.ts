"use client";

/**
 * Client-side glue between the lesson UI and the persistence layer.
 *
 * The hook:
 *   - Calls `startOrResumeAttempt` on mount and stores the attemptId
 *     + resume index in refs.
 *   - Tracks the start time of the current screen so we can record
 *     a duration on advance.
 *   - Exposes `saveScreen` / `saveQuestion` / `saveBoss` /
 *     `complete` callbacks that the lesson wires to its existing
 *     navigate / boss-end paths.
 *   - Emits the corresponding Plausible events alongside DB writes.
 *
 * Server failures are caught and logged - persistence should never
 * crash gameplay.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  startOrResumeAttempt,
  restartAttempt,
  saveScreenResult,
  saveQuestionResponse,
  saveBossResult,
  completeAttempt,
  type ScreenResultInput,
  type QuestionResponseInput,
  type BossResultInput,
} from "@/app/lib/lessonProgress.actions";
import { analytics } from "@/app/lib/analytics";

export interface UseLessonProgressOptions {
  weekNumber: number;
  /** Stable map of screen index → screen type, from the WeekContent. */
  screenTypes: readonly string[];
}

export interface UseLessonProgressApi {
  /** Resolved attempt id once startOrResumeAttempt has returned. */
  attemptId: string | null;
  /** Last completed screen index on an existing attempt; null until resolved. */
  resumeIndex: number | null;
  /** True while the initial server round-trip is in flight. */
  loading: boolean;
  /**
   * True when an unfinished attempt was found with progress > 0 and
   * the caller hasn't yet decided to continue or restart. Flips to
   * false after `acknowledgeResume()` or `restart()`.
   */
  pendingResume: boolean;
  /**
   * The child chose to continue from `resumeIndex`. Hook stops
   * advertising `pendingResume = true`. Caller is responsible for
   * actually changing the screen index in its own state machine.
   */
  acknowledgeResume: () => void;
  /**
   * The child chose to restart. Hook creates a fresh LessonAttempt
   * (attemptNumber bumped) and returns when the new id is live.
   * After this returns, `attemptId` points at the new attempt and
   * `pendingResume` is false. `resumeIndex` is forced to 0.
   */
  restart: () => Promise<void>;
  /** Reset the start-time stopwatch for a screen the child just landed on. */
  markScreenStart: (screenIndex: number) => void;
  /**
   * Persist a per-screen outcome + emit screen_completed analytics
   * event. `hintTierReached` is auto-included from the internal
   * per-screen max so callers don't have to thread it through.
   */
  saveScreen: (input: {
    screenIndex: number;
    wrongCount: number;
    xpEarned: number;
    starsEarned: number;
  }) => void;
  /** Persist a question-level answer. Errors are swallowed. */
  saveQuestion: (input: Omit<QuestionResponseInput, "attemptId">) => void;
  /** Persist a boss outcome. */
  saveBoss: (input: Omit<BossResultInput, "attemptId">) => void;
  /** Mark the lesson complete and emit lesson_completed. */
  complete: (input: { totalXp: number; finalScreenIndex: number }) => void;
  /** Emit a wrong-answer event. DB writes happen via saveScreen/saveQuestion. */
  reportWrong: (screenIndex: number, questionKey?: string) => void;
  /**
   * Record that a hint tier was shown on this screen. The hook tracks
   * the highest tier reached per screen and emits a `hint_used`
   * Plausible event the first time each tier becomes visible. The
   * persisted hintTierReached on saveScreen is the max recorded here.
   */
  reportHint: (screenIndex: number, tier: 1 | 2 | 3) => void;
  reportBossStarted: () => void;
  reportExerciseQuit: (screenIndex: number) => void;
}

export function useLessonProgress(
  options: UseLessonProgressOptions
): UseLessonProgressApi {
  const { weekNumber, screenTypes } = options;
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [resumeIndex, setResumeIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  // True when an existing in-progress attempt was found and the
  // caller hasn't yet decided continue vs restart.
  const [pendingResume, setPendingResume] = useState<boolean>(false);

  const attemptIdRef = useRef<string | null>(null);
  const lessonStartedAt = useRef<number>(performance.now());
  const screenStartedAt = useRef<number>(performance.now());
  // Highest hint tier shown per screen. Map so we can keep one row
  // per screenIndex and read it back on saveScreen.
  const hintMaxRef = useRef<Map<number, number>>(new Map());

  // Start or resume the attempt as soon as we have a week number.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setPendingResume(false);
    hintMaxRef.current.clear();
    startOrResumeAttempt(weekNumber)
      .then((r) => {
        if (cancelled) return;
        attemptIdRef.current = r.attemptId;
        setAttemptId(r.attemptId);
        setResumeIndex(r.lastScreenIndex);
        // Only surface the resume banner if there's actually progress
        // to resume to. A brand-new attempt (lastScreenIndex === 0)
        // should not show the banner.
        setPendingResume(r.isResume && r.lastScreenIndex > 0);
        lessonStartedAt.current = performance.now();
        analytics.lessonStarted({
          weekNumber: r.weekNumber,
          isResume: r.isResume,
        });
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.warn("[useLessonProgress] startOrResumeAttempt failed:", err);
        if (!cancelled) {
          attemptIdRef.current = null;
          setAttemptId(null);
          setResumeIndex(0);
          setPendingResume(false);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [weekNumber]);

  const acknowledgeResume = useCallback(() => {
    setPendingResume(false);
  }, []);

  const restart = useCallback(async () => {
    try {
      const r = await restartAttempt(weekNumber);
      attemptIdRef.current = r.attemptId;
      setAttemptId(r.attemptId);
      setResumeIndex(0);
      setPendingResume(false);
      hintMaxRef.current.clear();
      lessonStartedAt.current = performance.now();
      screenStartedAt.current = performance.now();
      // A restart counts as a fresh lesson_started for analytics so
      // funnel reports can distinguish the second-attempt sessions.
      analytics.lessonStarted({ weekNumber, isResume: false });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("[useLessonProgress] restart failed:", err);
    }
  }, [weekNumber]);

  const markScreenStart = useCallback((_screenIndex: number) => {
    screenStartedAt.current = performance.now();
  }, []);

  const saveScreen = useCallback<UseLessonProgressApi["saveScreen"]>(
    ({ screenIndex, wrongCount, xpEarned, starsEarned }) => {
      const id = attemptIdRef.current;
      if (!id) return;
      const screenType = screenTypes[screenIndex] ?? "unknown";
      const durationMs = Math.max(0, performance.now() - screenStartedAt.current);
      // Hint tier is auto-tracked by reportHint - read the max here
      // so callers never have to remember to pass it through.
      const hintTierReached = hintMaxRef.current.get(screenIndex) ?? 0;

      const payload: ScreenResultInput = {
        attemptId: id,
        screenIndex,
        screenType,
        durationMs,
        wrongCount,
        hintTierReached,
        xpEarned,
        starsEarned,
      };
      void saveScreenResult(payload).catch((err) => {
        // eslint-disable-next-line no-console
        console.warn("[useLessonProgress] saveScreenResult failed:", err);
      });
      analytics.screenCompleted({
        weekNumber,
        screenIndex,
        screenType,
        durationMs: Math.round(durationMs),
        wrongCount,
        hintTierReached,
        starsEarned,
      });
    },
    [screenTypes, weekNumber]
  );

  const saveQuestion = useCallback<UseLessonProgressApi["saveQuestion"]>(
    (input) => {
      const id = attemptIdRef.current;
      if (!id) return;
      void saveQuestionResponse({ attemptId: id, ...input }).catch((err) => {
        // eslint-disable-next-line no-console
        console.warn("[useLessonProgress] saveQuestionResponse failed:", err);
      });
    },
    []
  );

  const saveBoss = useCallback<UseLessonProgressApi["saveBoss"]>(
    (input) => {
      const id = attemptIdRef.current;
      if (!id) return;
      void saveBossResult({ attemptId: id, ...input }).catch((err) => {
        // eslint-disable-next-line no-console
        console.warn("[useLessonProgress] saveBossResult failed:", err);
      });
      analytics.bossCompleted({
        weekNumber,
        won: input.won,
        accuracy: input.accuracy,
        bestCombo: input.bestCombo,
        durationMs: input.durationMs,
      });
    },
    [weekNumber]
  );

  const complete = useCallback<UseLessonProgressApi["complete"]>(
    ({ totalXp, finalScreenIndex }) => {
      const id = attemptIdRef.current;
      if (!id) return;
      const durationMs = Math.round(performance.now() - lessonStartedAt.current);
      void completeAttempt({ attemptId: id, totalXp, finalScreenIndex }).catch(
        (err) => {
          // eslint-disable-next-line no-console
          console.warn("[useLessonProgress] completeAttempt failed:", err);
        }
      );
      analytics.lessonCompleted({ weekNumber, totalXp, durationMs });
    },
    [weekNumber]
  );

  const reportWrong = useCallback<UseLessonProgressApi["reportWrong"]>(
    (screenIndex, questionKey) => {
      const screenType = screenTypes[screenIndex] ?? "unknown";
      analytics.wrongAnswer({
        weekNumber,
        screenIndex,
        screenType,
        questionKey,
      });
    },
    [screenTypes, weekNumber]
  );

  const reportHint = useCallback<UseLessonProgressApi["reportHint"]>(
    (screenIndex, tier) => {
      const prev = hintMaxRef.current.get(screenIndex) ?? 0;
      if (tier <= prev) return; // already counted; don't re-emit analytics
      hintMaxRef.current.set(screenIndex, tier);
      const screenType = screenTypes[screenIndex] ?? "unknown";
      analytics.hintUsed({ weekNumber, screenIndex, screenType, tier });
    },
    [screenTypes, weekNumber]
  );

  const reportBossStarted = useCallback(() => {
    analytics.bossStarted({ weekNumber });
  }, [weekNumber]);

  const reportExerciseQuit = useCallback<UseLessonProgressApi["reportExerciseQuit"]>(
    (screenIndex) => {
      const screenType = screenTypes[screenIndex] ?? "unknown";
      const durationMs = Math.max(0, performance.now() - screenStartedAt.current);
      analytics.exerciseQuit({
        weekNumber,
        screenIndex,
        screenType,
        durationMs: Math.round(durationMs),
      });
    },
    [screenTypes, weekNumber]
  );

  return {
    attemptId,
    resumeIndex,
    loading,
    pendingResume,
    acknowledgeResume,
    restart,
    markScreenStart,
    saveScreen,
    saveQuestion,
    saveBoss,
    complete,
    reportWrong,
    reportHint,
    reportBossStarted,
    reportExerciseQuit,
  };
}
