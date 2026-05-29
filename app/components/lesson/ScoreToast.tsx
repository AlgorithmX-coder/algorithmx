"use client";

/**
 * Shared "+25 XP" / "STREAK ×3" / "SPEED BONUS" floater.
 *
 * Replaces the per-exercise floater code (CyberScanner's in-canvas
 * floater, SpamBlaster's addFloater, etc.) with a single DOM-overlay
 * component that exercises drop into a fixed-position layer. Motion
 * intensity is read once at mount and held; subsequent renders
 * preserve the same animation.
 *
 * The component is *self-removing*: it auto-unmounts after
 * `durationMs`. Callers track a list of active toasts in their own
 * state (a simple `id` keyed array) and let each one disappear on
 * its own schedule.
 */

import { useEffect, useState } from "react";
import { useMotionIntensity } from "@/app/lib/gameEngine/useMotionIntensity";

export type ScoreToastTone = "xp" | "streak" | "bonus" | "danger";

export interface ScoreToastProps {
  /** Display text. Keep short - 1-3 words max. */
  text: string;
  /** Visual treatment. */
  tone?: ScoreToastTone;
  /** Anchor position in viewport units. Default centre-top. */
  x?: number; // CSS px from left, OR omit for centre
  y?: number; // CSS px from top
  /** Lifetime in ms. Default 900. */
  durationMs?: number;
  /** Called when the toast finishes its animation and can be unmounted. */
  onDone?: () => void;
}

const TONE_COLOUR: Record<ScoreToastTone, { fg: string; shadow: string }> = {
  xp:     { fg: "#7eff97", shadow: "rgba(126, 255, 151, 0.55)" },
  streak: { fg: "#fbbf24", shadow: "rgba(251, 191, 36, 0.55)" },
  bonus:  { fg: "#7df0ff", shadow: "rgba(125, 240, 255, 0.55)" },
  danger: { fg: "#ff5fb3", shadow: "rgba(255, 95, 179, 0.55)" },
};

export default function ScoreToast({
  text,
  tone = "xp",
  x,
  y,
  durationMs = 900,
  onDone,
}: ScoreToastProps) {
  const intensity = useMotionIntensity();
  const [done, setDone] = useState(false);

  // Auto-unmount after duration. Even in reduced-motion mode we still
  // hide after the duration so the toast doesn't linger forever.
  useEffect(() => {
    const id = window.setTimeout(() => {
      setDone(true);
      onDone?.();
    }, durationMs);
    return () => window.clearTimeout(id);
  }, [durationMs, onDone]);

  if (done) return null;

  const palette = TONE_COLOUR[tone];

  // Reduced-motion: render a static glowing label that fades only.
  // Normal motion: float upwards while fading.
  const animation =
    intensity === 0
      ? "scoreToastStatic"
      : "scoreToastFloat";
  const ampPx = Math.round(40 * intensity); // float distance scaled by intensity

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: x !== undefined || y !== undefined ? "absolute" : "fixed",
        top: y ?? "30%",
        left: x ?? "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        zIndex: 60,
        fontFamily:
          "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
        fontWeight: 900,
        fontSize: 22,
        color: palette.fg,
        textShadow: `0 0 12px ${palette.shadow}, 0 2px 0 rgba(0,0,0,0.45)`,
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
        animation: `${animation} ${durationMs}ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
        // CSS variable consumed by the float keyframe below
        ["--score-toast-amp" as string]: `${ampPx}px`,
      }}
    >
      {text}
      <style>{`
        @keyframes scoreToastFloat {
          0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.6); }
          25%  { opacity: 1; transform: translate(-50%, calc(-50% - 4px)) scale(1.1); }
          70%  { opacity: 1; transform: translate(-50%, calc(-50% - var(--score-toast-amp))) scale(1); }
          100% { opacity: 0; transform: translate(-50%, calc(-50% - var(--score-toast-amp) - 12px)) scale(0.95); }
        }
        @keyframes scoreToastStatic {
          0%   { opacity: 0; }
          15%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
