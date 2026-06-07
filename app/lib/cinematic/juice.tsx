"use client";

/**
 * AlgorithmX Cinematic Engine — Juice Vocabulary
 * ==============================================
 *
 * The shared "game-feel" helpers every cinematic scene uses: confetti
 * bursts, light beams, a white flash, a sparkle field, and the shake
 * class names. These were lifted and generalised out of
 * `PasswordVault.tsx` so every PLAY scene speaks one juice language
 * instead of re-inventing particles per scene.
 *
 * Accessibility: every helper takes an `intensity` value (the
 * 0 / 0.45 / 1 motion-intensity scalar). At `intensity === 0` (OS
 * reduced-motion) animated helpers render nothing or skip the burst,
 * matching the vault's existing behaviour.
 *
 * Keyframes referenced here (`cineBeamIn`, `cineSparkleRise`, the shake
 * classes) are provided by `<JuiceKeyframes />` from `./juiceKeyframes`.
 * A scene mounts that once to get the whole keyframe library.
 *
 * NOTE: named `.tsx` (not `.ts` as in the kit sketch) because it
 * exports React components, which require JSX compilation.
 */

import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { COSMIC } from "./tokens";

/* ────────────────────────────────────────────────────────────── */
/* Palettes                                                       */
/* ────────────────────────────────────────────────────────────── */

/**
 * The celebration confetti colour set (from the vault's `fireBurst`).
 * Tokenised hues come from {@link COSMIC}; the soft-cyan / ember /
 * violet accents have no token equivalent yet and stay as literals.
 */
export const CONFETTI_COLORS: string[] = [
  COSMIC.gold, // #fde047
  COSMIC.lime, // #7eff97
  "#7df0ff", // soft cyan (no token yet)
  COSMIC.neonPink, // #ff5fb3
  "#ff7a59", // ember (no token yet)
  "#a855f7", // violet (no token yet)
];

/** The "correct answer" puff palette (from useExerciseFeedback). */
const CORRECT_COLORS: string[] = [COSMIC.lime, "#7df0ff", COSMIC.gold];
/** The "big unlock" burst palette (from useExerciseFeedback). */
const UNLOCK_COLORS: string[] = [
  COSMIC.lime,
  "#7df0ff",
  COSMIC.gold,
  "#ff7a59",
  "#a855f7",
];

/* ────────────────────────────────────────────────────────────── */
/* Confetti helpers                                               */
/* ────────────────────────────────────────────────────────────── */

/**
 * Fire a single confetti burst at a normalised viewport origin.
 * Generalised verbatim from the vault's `fireBurst`. `count` is the raw
 * particle count (the caller is responsible for scaling it by intensity
 * if desired — the vault passes `count * intensity`).
 */
export function fireBurst(
  originX: number,
  originY: number,
  count: number,
  velocity: number,
  colors: string[] = CONFETTI_COLORS,
): void {
  try {
    confetti({
      particleCount: Math.max(8, Math.round(count)),
      spread: 100,
      startVelocity: velocity,
      ticks: 130,
      gravity: 0.85,
      origin: { x: originX, y: originY },
      scalar: 1.05,
      colors,
    });
  } catch {
    /* canvas-confetti optional */
  }
}

/**
 * Small "correct answer" confetti puff, scaled by motion intensity.
 * Standalone copy of the preset inside `useExerciseFeedback.correct` so
 * scenes can fire it directly. Skipped entirely at `intensity === 0`.
 */
export function correctPuff(
  intensity: number,
  origin: { x: number; y: number } = { x: 0.5, y: 0.55 },
): void {
  if (intensity <= 0) return;
  try {
    confetti({
      particleCount: Math.round(18 * intensity),
      spread: 50,
      startVelocity: 22,
      ticks: 80,
      origin,
      scalar: 0.7,
      colors: CORRECT_COLORS,
    });
  } catch {
    /* noop */
  }
}

/**
 * Big "unlock / win" confetti burst, scaled by motion intensity.
 * Standalone copy of the preset inside `useExerciseFeedback.unlock`.
 * Skipped entirely at `intensity === 0`.
 */
export function unlockBurst(
  intensity: number,
  origin: { x: number; y: number } = { x: 0.5, y: 0.5 },
): void {
  if (intensity <= 0) return;
  try {
    confetti({
      particleCount: Math.round(80 * intensity),
      spread: 100,
      startVelocity: 38,
      ticks: 140,
      origin,
      scalar: 1.0,
      colors: UNLOCK_COLORS,
    });
  } catch {
    /* noop */
  }
}

/* ────────────────────────────────────────────────────────────── */
/* Shake class names                                              */
/* ────────────────────────────────────────────────────────────── */

/** Medium camera-shake class (provided by <JuiceKeyframes />). */
export const SHAKE_MD = "cine-shake-md";
/** Large camera-shake class (provided by <JuiceKeyframes />). */
export const SHAKE_LG = "cine-shake-lg";

/* ────────────────────────────────────────────────────────────── */
/* Beams                                                          */
/* ────────────────────────────────────────────────────────────── */

/** A point expressed as a percent offset from the scene centre. */
export interface BeamPoint {
  x: number;
  y: number;
}

/**
 * Light beams shooting from each point toward the centre. Generalised
 * from the vault's `LockBeams` — takes generic `positions` (percent
 * offsets from centre) instead of lock-specific data. Renders nothing
 * at `intensity === 0`.
 */
export function Beams({
  positions,
  intensity,
}: {
  positions: BeamPoint[];
  intensity: number;
}) {
  if (intensity === 0) return null;
  return (
    <>
      {positions.map((pos, i) => {
        const length = Math.sqrt(pos.x * pos.x + pos.y * pos.y);
        // angle FROM the point toward centre
        const angle = (Math.atan2(-pos.y, -pos.x) * 180) / Math.PI;
        if (length < 1) return null;
        return (
          <span
            key={i}
            aria-hidden
            style={{
              position: "absolute",
              top: `${50 + pos.y}%`,
              left: `${50 + pos.x}%`,
              width: `${length}%`,
              height: 2,
              transformOrigin: "0% 50%",
              transform: `rotate(${angle}deg)`,
              background:
                "linear-gradient(90deg, rgba(125,240,255,0) 0%, rgba(125,240,255,0.9) 40%, #fff 100%)",
              filter: "blur(0.6px) drop-shadow(0 0 6px #7df0ff)",
              animation: "cineBeamIn 540ms ease-out both",
              pointerEvents: "none",
              zIndex: 3,
            }}
          />
        );
      })}
    </>
  );
}

/* ────────────────────────────────────────────────────────────── */
/* Sparkle field                                                  */
/* ────────────────────────────────────────────────────────────── */

/**
 * Drifting sparkles rising bottom-to-top. Copied as-is from the vault
 * (already generic). CSS-only — no per-frame JS. Renders nothing at
 * `intensity === 0`.
 */
export function SparkleField({ intensity = 1 }: { intensity?: number }) {
  if (intensity === 0) return null;
  const sparkles = [
    { x: 18, delay: 0 },
    { x: 34, delay: 0.6 },
    { x: 50, delay: 1.2 },
    { x: 66, delay: 0.3 },
    { x: 82, delay: 1.6 },
    { x: 12, delay: 2.0 },
    { x: 28, delay: 0.9 },
    { x: 44, delay: 1.8 },
    { x: 60, delay: 0.5 },
    { x: 76, delay: 2.3 },
    { x: 92, delay: 1.1 },
    { x: 22, delay: 1.4 },
    { x: 70, delay: 0.2 },
    { x: 88, delay: 2.6 },
  ];
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {sparkles.map((s, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: `${s.x}%`,
            bottom: -10,
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: "#fff8dc",
            boxShadow: "0 0 8px rgba(253,224,71,0.85)",
            animation: `cineSparkleRise 4.6s linear infinite`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/* Flash overlay                                                  */
/* ────────────────────────────────────────────────────────────── */

/**
 * The white/gold screen flash for a big impact beat (extracted from the
 * vault's CLANG flash). Wraps its own `AnimatePresence` so the caller
 * just toggles `show`. At `intensity === 0` the flash is faint and quick
 * (kept, not removed, because a brief flash is information not motion).
 */
export function FlashOverlay({
  show,
  intensity,
  zIndex = 25,
  background = "radial-gradient(circle at center, #fff 0%, #fde047 30%, transparent 70%)",
}: {
  show: boolean;
  intensity: number;
  zIndex?: number;
  background?: string;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="cine-flash"
          initial={{ opacity: 0 }}
          animate={{ opacity: intensity === 0 ? 0.3 : 0.85 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: intensity === 0 ? 0.12 : 0.24,
            ease: "easeOut",
          }}
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background,
            pointerEvents: "none",
            zIndex,
            mixBlendMode: "screen",
          }}
        />
      )}
    </AnimatePresence>
  );
}
