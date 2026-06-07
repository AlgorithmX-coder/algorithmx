"use client";

/**
 * AlgorithmX Cinematic Engine — Climax State Machine (the cinematic backbone)
 * ==========================================================================
 *
 * A declarative, reusable version of the multi-stage "climax" the Password
 * Vault hardcodes (`armed → anticipation → unlocking → opening → revealed`
 * via a `useEffect` full of chained `setTimeout`s).
 *
 * The caller passes an ordered array of stage definitions. The hook walks
 * them in order, scaling every duration through `useTimingScaler` and
 * firing each stage's `onEnter` (audio cue, confetti, etc.) on entry. All
 * timers are cleaned up on unmount.
 *
 * Reduced-motion: durations collapse via the scaler (near-instant) but
 * EVERY `onEnter` still fires, so audio structure and analytics-adjacent
 * side effects are preserved — matching the vault's behaviour.
 *
 * Usage:
 *   const climax = useClimaxSequence([
 *     { id: "armed",        durationMs: 360,  onEnter: () => audio.bossPhaseChange() },
 *     { id: "anticipation", durationMs: 900,  onEnter: () => fireBeams() },
 *     { id: "unlocking",    durationMs: 620,  onEnter: () => audio.bossHit() },
 *     { id: "opening",      durationMs: 1050, onEnter: () => { audio.victory(); burst(); } },
 *     { id: "revealed",     durationMs: 0,    onEnter: () => audio.badgeEarned() },
 *   ]);
 *   // climax.start() to begin; climax.stage is the current id; climax.isComplete when done.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useTimingScaler } from "./useTimingScaler";

export interface ClimaxStage {
  /** Stable id for this stage; becomes the value of `stage`. */
  id: string;
  /** Unscaled duration before advancing to the next stage. */
  durationMs: number;
  /** Fired once, on entry to this stage (audio / confetti / etc.). */
  onEnter?: () => void;
}

export interface ClimaxController {
  /**
   * The current stage id, or `null` before `start()`. The TERMINAL stage
   * PERSISTS — once entered, `stage` stays pinned to the last stage's id
   * (the scene's final resting state, e.g. the vault's "revealed"); it
   * never falls back to `null`. Use `isComplete` to detect the end.
   */
  stage: string | null;
  /** Current stage index (-1 before start; clamps at stages.length - 1). */
  index: number;
  /** Begin the sequence. Idempotent — a second call is ignored. */
  start: () => void;
  /** True once the final stage's duration has elapsed (stage stays pinned). */
  isComplete: boolean;
}

export function useClimaxSequence(stages: ClimaxStage[]): ClimaxController {
  const { t } = useTimingScaler();
  const [index, setIndex] = useState(-1);
  const [complete, setComplete] = useState(false);

  const timersRef = useRef<number[]>([]);
  const startedRef = useRef(false);
  // Latest values captured in refs so `start` can stay referentially
  // stable (safe to call from an event handler / effect) without going
  // stale on the stage list or the scaler. Synced in an effect (never
  // mutated during render).
  const stagesRef = useRef(stages);
  const tRef = useRef(t);
  useEffect(() => {
    stagesRef.current = stages;
    tRef.current = t;
  });

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const start = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const s = stagesRef.current;
    if (s.length === 0) {
      setComplete(true); // empty sequence is immediately complete
      return;
    }

    // Enter stage 0 immediately.
    setIndex(0);
    s[0].onEnter?.();

    // Schedule each transition at the cumulative scaled time. The final
    // stage does NOT advance past itself — it persists as the resting
    // state; its timer only flips `complete`.
    let acc = 0;
    for (let i = 0; i < s.length; i++) {
      acc += tRef.current(s[i].durationMs);
      const isLast = i === s.length - 1;
      const nextIndex = i + 1;
      const id = window.setTimeout(() => {
        if (isLast) {
          setComplete(true);
        } else {
          setIndex(nextIndex);
          s[nextIndex]?.onEnter?.();
        }
      }, acc);
      timersRef.current.push(id);
    }
  }, []);

  // Clean up every pending timer on unmount.
  useEffect(() => clearTimers, [clearTimers]);

  const stage = index >= 0 && index < stages.length ? stages[index].id : null;

  return { stage, index, start, isComplete: complete };
}
