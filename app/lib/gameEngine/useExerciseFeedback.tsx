"use client";

/**
 * Standardised correct / wrong / streak / unlock feedback for any
 * exercise. Returns a small API that fires the appropriate juice
 * preset:
 *
 *   const fx = useExerciseFeedback({ getAnchor })
 *   fx.correct({ xp: 25 })
 *   fx.wrong()
 *   fx.streak(3)
 *   fx.unlock()
 *
 * What each preset does:
 *   correct:   audio "correct" + "+XP" ScoreToast (optional) + confetti
 *              burst (scaled by motion intensity, comfort-aware)
 *   wrong:     audio softWrong + "OOPS" toast in danger tone
 *   streak:    audio streak chime + "STREAK ×N" toast in streak tone
 *   unlock:    audio unlock + full confetti burst + optional XP toast
 *
 * Toasts are rendered into a <FeedbackLayer/> the parent exercise
 * mounts inside its frame. The exercise calls `fx.layer()` once in
 * its JSX to mount the layer.
 *
 * No exercise component should fire audio/particles/toasts directly
 * any more - call this hook. This is the toolkit's single biggest
 * lever for cross-exercise consistency.
 */

import { useCallback, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { useGameAudio } from "@/app/lib/gameEngine/useGameAudio";
import { useMotionIntensity } from "@/app/lib/gameEngine/useMotionIntensity";
import ScoreToast, { type ScoreToastTone } from "@/app/components/lesson/ScoreToast";

interface ToastEntry {
  id: number;
  text: string;
  tone: ScoreToastTone;
  x?: number;
  y?: number;
  durationMs: number;
}

export interface ExerciseFeedbackOptions {
  /**
   * Optional anchor used by all toasts when no explicit (x,y) is
   * passed. The function should return viewport-pixel coords (e.g.
   * the centre of the active card). If omitted, toasts use 50% top.
   */
  getAnchor?: () => { x: number; y: number } | null;
}

export interface ExerciseFeedbackApi {
  /**
   * Fires the "correct" preset. `xp` adds a "+N XP" toast. `text`
   * overrides the toast text.
   */
  correct: (opts?: { xp?: number; text?: string; tone?: ScoreToastTone }) => void;
  /**
   * Fires the "wrong" preset. `text` overrides the toast text.
   */
  wrong: (opts?: { text?: string }) => void;
  /**
   * Streak chime + toast. Only plays a chime at multiples of 3, 5, 7.
   */
  streak: (count: number) => void;
  /**
   * Big-win celebration: confetti + sound + optional toast.
   */
  unlock: (opts?: { xp?: number; text?: string }) => void;
  /**
   * Add an arbitrary toast (custom tone/text/position). Use for
   * "SPEED BONUS" or other exercise-specific shouts.
   */
  toast: (input: { text: string; tone?: ScoreToastTone; durationMs?: number; x?: number; y?: number }) => void;
  /**
   * JSX to mount inside the exercise's positioning context. Renders
   * all active toasts. Call this once in your component JSX (typically
   * as a sibling to the canvas or main card).
   */
  layer: () => React.ReactNode;
}

let nextToastId = 1;

export function useExerciseFeedback(
  opts: ExerciseFeedbackOptions = {}
): ExerciseFeedbackApi {
  const audio = useGameAudio();
  const intensity = useMotionIntensity();
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const getAnchorRef = useRef(opts.getAnchor);
  getAnchorRef.current = opts.getAnchor;

  const pushToast = useCallback(
    (input: { text: string; tone?: ScoreToastTone; durationMs?: number; x?: number; y?: number }) => {
      const anchor = !input.x && !input.y ? getAnchorRef.current?.() ?? null : null;
      setToasts((prev) => [
        ...prev,
        {
          id: nextToastId++,
          text: input.text,
          tone: input.tone ?? "xp",
          x: input.x ?? anchor?.x,
          y: input.y ?? anchor?.y,
          durationMs: input.durationMs ?? 900,
        },
      ]);
    },
    []
  );

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const correct = useCallback<ExerciseFeedbackApi["correct"]>(
    ({ xp, text, tone } = {}) => {
      audio.correct();
      if (xp || text) {
        pushToast({
          text: text ?? `+${xp ?? 0} XP`,
          tone: tone ?? "xp",
        });
      }
      // Small confetti puff for "correct" - scaled by motion intensity.
      // Skipped entirely under strict reduced-motion (intensity = 0).
      if (intensity > 0) {
        try {
          confetti({
            particleCount: Math.round(18 * intensity),
            spread: 50,
            startVelocity: 22,
            ticks: 80,
            origin: { x: 0.5, y: 0.55 },
            scalar: 0.7,
            colors: ["#7eff97", "#7df0ff", "#fde047"],
          });
        } catch {
          /* canvas-confetti optional */
        }
      }
    },
    [audio, intensity, pushToast]
  );

  const wrong = useCallback<ExerciseFeedbackApi["wrong"]>(
    ({ text } = {}) => {
      audio.wrong();
      pushToast({
        text: text ?? "Try again!",
        tone: "danger",
        durationMs: 700,
      });
    },
    [audio, pushToast]
  );

  const streak = useCallback<ExerciseFeedbackApi["streak"]>(
    (count) => {
      if (count >= 3) {
        audio.streak(count);
        pushToast({
          text: `STREAK ×${count}`,
          tone: "streak",
          durationMs: 1100,
        });
      }
    },
    [audio, pushToast]
  );

  const unlock = useCallback<ExerciseFeedbackApi["unlock"]>(
    ({ xp, text } = {}) => {
      audio.unlock();
      if (xp || text) {
        pushToast({
          text: text ?? `+${xp ?? 0} XP`,
          tone: "bonus",
          durationMs: 1200,
        });
      }
      if (intensity > 0) {
        try {
          confetti({
            particleCount: Math.round(80 * intensity),
            spread: 100,
            startVelocity: 38,
            ticks: 140,
            origin: { x: 0.5, y: 0.5 },
            scalar: 1.0,
            colors: ["#7eff97", "#7df0ff", "#fde047", "#ff7a59", "#a855f7"],
          });
        } catch {
          /* noop */
        }
      }
    },
    [audio, intensity, pushToast]
  );

  const toast = useCallback<ExerciseFeedbackApi["toast"]>(
    (input) => pushToast(input),
    [pushToast]
  );

  const layer = useCallback(() => {
    return (
      <>
        {toasts.map((t) => (
          <ScoreToast
            key={t.id}
            text={t.text}
            tone={t.tone}
            x={t.x}
            y={t.y}
            durationMs={t.durationMs}
            onDone={() => dismiss(t.id)}
          />
        ))}
      </>
    );
  }, [toasts, dismiss]);

  return useMemo(
    () => ({ correct, wrong, streak, unlock, toast, layer }),
    [correct, wrong, streak, unlock, toast, layer]
  );
}
