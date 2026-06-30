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

import { useEffect, useState } from "react";
import { useMotionIntensity } from "@/app/lib/gameEngine/useMotionIntensity";
import { useGameAudio } from "@/app/lib/gameEngine/useGameAudio";
import GameButton from "@/app/components/lesson/GameButton";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import PixIcon from "@/app/components/lesson/PixIcon";

/* ─────────────── Intro beat ─────────────── */

const HEAD_SRC: Record<"adam" | "layla", string> = {
  adam: "/game/characters/adam-head.png",
  layla: "/game/characters/layla-head.png",
};

export interface ExerciseIntroBeatProps {
  title: string;
  subtitle?: string;
  icon?: string;
  /** Called when the child taps "Let's go" or auto-dismisses. */
  onDismiss: () => void;
  /** Auto-dismiss after this many ms. 0 = manual only. Default 0. */
  autoMs?: number;
  /**
   * Optional spoken narration that explains the task. When present, the
   * intro becomes the RICH, character-led, PACED variant: a portrait + the
   * narration read aloud + the start button held back until the child has
   * had time to hear it (we never want kids clicking straight past the
   * instructions). Falls back to the simple title/subtitle card otherwise.
   */
  narration?: { speaker?: "adam" | "layla"; lines: string[] };
  /** Which character fronts the intro (defaults to the narration speaker). */
  character?: "adam" | "layla";
  /** Optional exercise logo path. When set, the intro shows this themed logo
   *  INSTEAD of the speaker portrait — the narrator isn't a character, so a
   *  logo avoids a face/voice mismatch on the intro. */
  logo?: string;
  /** Warm welcoming eyebrow shown above the title (e.g. "Welcome, Cyber Hero!"). */
  welcome?: string;
}

export default function ExerciseIntroBeat({
  title,
  subtitle,
  icon,
  onDismiss,
  welcome = "Welcome, Cyber Hero!",
  autoMs = 0,
  narration,
  character,
  logo,
}: ExerciseIntroBeatProps) {
  const intensity = useMotionIntensity();
  const audio = useGameAudio();
  const paced = !!narration && narration.lines.length > 0;
  const speaker = character ?? narration?.speaker ?? "adam";
  const accent = speaker === "adam" ? "#00e5ff" : "#ff5fb3";
  // Hold the start button back until the child has had time to hear the
  // narration. Non-paced intros are ready immediately.
  // Seconds to hold the start button while the narration plays — shown as a
  // visible countdown so the child clearly knows WHEN they can move on
  // (≈ the spoken length; Sarah runs slow at speed 0.85).
  const gateSecs = paced
    ? Math.min(Math.round((narration?.lines.length ?? 1) * 1.1 + 1), 5)
    : 0;
  const [secsLeft, setSecsLeft] = useState(gateSecs);
  const canStart = !paced || secsLeft <= 0;

  useEffect(() => {
    audio.transition();
  }, [audio]);

  // Paced countdown: ONE stable interval (deps [paced] only) so frequent
  // re-renders from the game underneath (e.g. Memory Match's timer) can't keep
  // resetting a per-tick timeout and freeze the counter. Clears itself at 0.
  useEffect(() => {
    if (!paced) return;
    const id = window.setInterval(() => {
      setSecsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(id);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [paced]);

  // Non-paced auto-dismiss (legacy autoMs callers).
  useEffect(() => {
    if (paced || autoMs <= 0) return;
    const id = window.setTimeout(onDismiss, autoMs);
    return () => window.clearTimeout(id);
  }, [paced, autoMs, onDismiss]);

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
        background: "rgba(8, 10, 22, 0.88)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        animation: intensity === 0 ? undefined : "exIntroFade 240ms ease-out",
        fontFamily:
          "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: paced ? 470 : 420,
          textAlign: "center",
          color: "#fff7e6",
          background: paced
            ? "linear-gradient(180deg, rgba(18,24,58,0.92) 0%, rgba(10,14,36,0.94) 100%)"
            : "transparent",
          border: paced ? `1px solid ${accent}55` : "none",
          borderRadius: paced ? 22 : 0,
          padding: paced ? "26px 22px 24px" : 0,
          boxShadow: paced
            ? "0 24px 60px -28px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)"
            : "none",
        }}
      >
        {paced ? (
          <div
            style={{
              width: 86,
              height: 86,
              borderRadius: "50%",
              margin: "0 auto 12px",
              overflow: "hidden",
              border: `3px solid ${accent}`,
              boxShadow: `0 0 22px ${accent}88`,
              background: "#0f1530",
              animation:
                intensity === 0
                  ? undefined
                  : "exIntroIconPop 600ms cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logo ?? HEAD_SRC[speaker]}
              alt={logo ? "" : speaker === "adam" ? "Adam" : "Layla"}
              style={
                logo
                  ? { width: "100%", height: "100%", objectFit: "contain", padding: 12 }
                  : { width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 22%" }
              }
            />
          </div>
        ) : (
          icon && (
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
              <PixIcon emoji={icon} size={64} />
            </div>
          )
        )}
        {welcome && (
          <div
            style={{
              display: "inline-block",
              margin: "0 0 10px",
              padding: "5px 16px",
              borderRadius: 999,
              background: `${accent}1a`,
              border: `1px solid ${accent}66`,
              color: accent,
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: "0.03em",
            }}
          >
            ✦ {welcome} ✦
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

        {paced ? (
          <div style={{ margin: "10px 0 16px", textAlign: "left" }}>
            <InfoNarration lines={narration!.lines} speaker={speaker} />
          </div>
        ) : (
          subtitle && (
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
          )
        )}

        {canStart ? (
          <GameButton variant="primary" size="lg" onClick={onDismiss}>
            {paced ? "I'm ready →" : "Let's go →"}
          </GameButton>
        ) : (
          <div
            style={{
              padding: "13px 0 4px",
              color: accent,
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              opacity: 0.9,
              animation: intensity === 0 ? undefined : "exIntroListen 1.6s ease-in-out infinite",
            }}
          >
            🔊 Listen first… {secsLeft}
          </div>
        )}
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
        @keyframes exIntroListen {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
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
  /** Warm encouraging line under the title (defaults to a generic one). */
  encouragement?: string;
}

export function ExerciseCompleteBeat({
  title,
  stars = 3,
  statLines = [],
  onContinue,
  onRetry,
  encouragement = "You're getting stronger, Cyber Hero!",
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
        {encouragement && (
          <p style={{ margin: "0 0 14px", color: "#9fe9ff", fontSize: 15, fontWeight: 700, lineHeight: 1.4 }}>
            {encouragement}
          </p>
        )}
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
