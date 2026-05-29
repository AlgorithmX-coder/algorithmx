"use client";

/**
 * Standardised intro + completion beats for exercises.
 *
 * Today each exercise has its own ExerciseIntro / PixarFinishOverlay
 * / hand-rolled celebration JSX. <ExerciseIntroBeat> and
 * <ExerciseCompleteBeat> are the shared replacements - same look,
 * same audio, same character reaction, every time.
 *
 * Both honour comfort mode via useMotionIntensity (no surprise scale
 * pops in reduced-motion).
 *
 * Usage:
 *   {showIntro && (
 *     <ExerciseIntroBeat
 *       title="Cyber Scanner"
 *       subtitle="Tap STRONG or WEAK before each card escapes"
 *       icon="🔍"
 *       onDismiss={() => setShowIntro(false)}
 *     />
 *   )}
 *
 *   {finished && (
 *     <ExerciseCompleteBeat
 *       title="Drill complete!"
 *       stars={stars}
 *       statLines={[`${correct}/${total} correct`, `Best streak ${best}`]}
 *       onContinue={onComplete}
 *       onRetry={onReset}
 *     />
 *   )}
 */

import { useEffect } from "react";
import { useMotionIntensity } from "@/app/lib/gameEngine/useMotionIntensity";
import { useGameAudio } from "@/app/lib/gameEngine/useGameAudio";
import GameButton from "@/app/components/lesson/GameButton";

/* ─────────────── Intro beat ─────────────── */

export interface ExerciseIntroBeatProps {
  title: string;
  subtitle?: string;
  icon?: string;
  /** Called when the child taps "Let's go" or auto-dismisses. */
  onDismiss: () => void;
  /** Auto-dismiss after this many ms. 0 = manual only. Default 0. */
  autoMs?: number;
}

export default function ExerciseIntroBeat({
  title,
  subtitle,
  icon,
  onDismiss,
  autoMs = 0,
}: ExerciseIntroBeatProps) {
  const intensity = useMotionIntensity();
  const audio = useGameAudio();

  useEffect(() => {
    audio.transition();
    if (autoMs > 0) {
      const id = window.setTimeout(onDismiss, autoMs);
      return () => window.clearTimeout(id);
    }
  }, [audio, autoMs, onDismiss]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ex-intro-title"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 25,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background: "rgba(8, 10, 22, 0.85)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        animation: intensity === 0 ? undefined : "exIntroFade 240ms ease-out",
      }}
    >
      <div
        style={{
          maxWidth: 420,
          textAlign: "center",
          color: "#fff7e6",
          fontFamily:
            "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
        }}
      >
        {icon && (
          <div
            style={{
              fontSize: 56,
              marginBottom: 6,
              animation:
                intensity === 0
                  ? undefined
                  : "exIntroIconPop 600ms cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            {icon}
          </div>
        )}
        <h2
          id="ex-intro-title"
          style={{
            margin: "0 0 8px",
            fontSize: 26,
            fontWeight: 900,
            background: "linear-gradient(135deg, #00e5ff, #7c5cff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            style={{
              margin: "0 0 18px",
              color: "#cbd5e1",
              fontSize: 15,
              lineHeight: 1.4,
            }}
          >
            {subtitle}
          </p>
        )}
        <GameButton
          variant="primary"
          size="lg"
          onClick={onDismiss}
        >
          Let&apos;s go →
        </GameButton>
      </div>
      <style>{`
        @keyframes exIntroFade {
          from { opacity: 0 }
          to { opacity: 1 }
        }
        @keyframes exIntroIconPop {
          0%   { opacity: 0; transform: scale(0.4); }
          60%  { opacity: 1; transform: scale(1.18); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

/* ─────────────── Complete beat ─────────────── */

export interface ExerciseCompleteBeatProps {
  title: string;
  /** 1, 2 or 3. */
  stars?: number;
  /** Optional stat lines below the stars. */
  statLines?: string[];
  /** Continue (advance to next screen). */
  onContinue: () => void;
  /** Retry (reset exercise). Optional. */
  onRetry?: () => void;
}

export function ExerciseCompleteBeat({
  title,
  stars = 3,
  statLines = [],
  onContinue,
  onRetry,
}: ExerciseCompleteBeatProps) {
  const intensity = useMotionIntensity();
  const audio = useGameAudio();

  useEffect(() => {
    audio.starEarned();
  }, [audio]);

  const clamped = Math.max(0, Math.min(3, Math.round(stars)));
  const starString = "★".repeat(clamped) + "☆".repeat(3 - clamped);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ex-complete-title"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 30,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background: "rgba(8, 10, 22, 0.85)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        animation: intensity === 0 ? undefined : "exCompleteFade 240ms ease-out",
      }}
    >
      <div
        style={{
          maxWidth: 420,
          textAlign: "center",
          color: "#fff7e6",
          fontFamily:
            "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 44,
            marginBottom: 8,
            letterSpacing: 6,
            color: "#fde047",
            textShadow: "0 0 18px rgba(253, 224, 71, 0.55)",
            animation:
              intensity === 0
                ? undefined
                : "exCompleteStarsIn 700ms cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {starString}
        </div>
        <h2
          id="ex-complete-title"
          style={{
            margin: "0 0 12px",
            fontSize: 26,
            fontWeight: 900,
            background: "linear-gradient(135deg, #7eff97, #00e5ff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {title}
        </h2>
        {statLines.length > 0 && (
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: "0 0 18px",
              color: "#cbd5e1",
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            {statLines.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        )}
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <GameButton variant="primary" size="lg" onClick={onContinue}>
            Continue →
          </GameButton>
          {onRetry && (
            <GameButton variant="ghost" size="lg" onClick={onRetry}>
              🔄 Retry
            </GameButton>
          )}
        </div>
      </div>
      <style>{`
        @keyframes exCompleteFade {
          from { opacity: 0 }
          to { opacity: 1 }
        }
        @keyframes exCompleteStarsIn {
          0%   { opacity: 0; transform: scale(0.5) rotate(-12deg); }
          60%  { opacity: 1; transform: scale(1.2) rotate(4deg); }
          100% { opacity: 1; transform: scale(1) rotate(0); }
        }
      `}</style>
    </div>
  );
}
