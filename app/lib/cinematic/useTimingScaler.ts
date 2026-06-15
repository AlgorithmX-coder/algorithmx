"use client";

/**
 * AlgorithmX Cinematic Engine — Timing Scaler (the accessibility backbone)
 * =======================================================================
 *
 * The single place reduced-motion timing is computed. Every cinematic
 * scene scales its durations through `t()` instead of re-deriving the
 * comfort/reduced-motion maths inline (the Password Vault reimplemented
 * this in two separate places).
 *
 * Wraps the existing `useMotionIntensity()`:
 *   intensity 1    → normal           (scale 1)
 *   intensity 0.45 → comfort mode     (scale 0.55, snappier)
 *   intensity 0    → OS reduced-motion (scale 0.2, near-instant)
 *
 * `t(ms)` returns the scaled millisecond duration, never below a floor
 * (default 60ms) so even at full reduction a beat is perceptible. The
 * mapping matches the vault's open-sequence scaler exactly; callers that
 * need the vault's reveal-cascade floor (40ms) can pass it as the second
 * argument.
 */

import { useCallback, useMemo } from "react";
import { useMotionIntensity } from "@/app/lib/gameEngine/useMotionIntensity";

export interface TimingScaler {
  /** Raw motion intensity: 1 (normal), 0.45 (comfort), 0 (reduced). */
  intensity: number;
  /**
   * Scale a millisecond duration by the current intensity, clamped to a
   * floor. `floor` defaults to 60ms (the vault climax floor); pass 40 for
   * the vault reveal-cascade behaviour.
   */
  t: (ms: number, floor?: number) => number;
  /** True when OS reduced-motion is requested (intensity === 0). */
  reduced: boolean;
}

export function useTimingScaler(): TimingScaler {
  const intensity = useMotionIntensity();

  const t = useCallback(
    (ms: number, floor = 60) => {
      const scale = intensity === 0 ? 0.2 : intensity < 1 ? 0.55 : 1;
      return Math.max(floor, Math.round(ms * scale));
    },
    [intensity],
  );

  return useMemo(
    () => ({ intensity, t, reduced: intensity === 0 }),
    [intensity, t],
  );
}
