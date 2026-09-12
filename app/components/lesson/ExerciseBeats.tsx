"use client";
import { useLessonWeek } from "@/app/components/lesson/LessonWeekContext";
import { weekCharacterSrc, fallbackToShared } from "@/app/lib/weekCharacters";

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
import { useLessonTheme } from "@/app/components/lesson/LessonThemeContext";
import { useWeekWorld, WorldBackdrop, CARD_MATERIALS, CardDecoration } from "@/app/components/game/missionWorldStyles";

/* ─────────────── Intro beat ─────────────── */

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
  /**
   * Optional accent colour (hex) that overrides the speaker cyan/pink for the
   * card chrome (eyebrow, border, title gradient, narration box). Used by the
   * signature-game intro so the "here's what to do" card matches the week's
   * theme instead of clashing with the game's art. Omit = classic look.
   */
  accent?: string;
  /** Optional exercise logo path. When set, the intro shows this themed logo
   *  INSTEAD of the speaker portrait — the narrator isn't a character, so a
   *  logo avoids a face/voice mismatch on the intro. */
  logo?: string;
  /** Warm welcoming eyebrow shown above the title (e.g. "Welcome, Cyber Hero!"). */
  welcome?: string;
  /**
   * Optional "Spot the Danger" preamble folded into the intro: the Hacker
   * Raccoon reveals the trick he'll try (his taunt), shown ABOVE the warm coach
   * mission so the whole get-ready is ONE screen with ONE "I'm ready" gate — no
   * separate threat screen. `raccoonLine` is his boast (shown as text, in his
   * voice-bubble). When present the "Welcome" pill is dropped so there's a
   * single eyebrow ("Spot the Danger").
   */
  threat?: { raccoonLine: string };
  /** Force the full-viewport modal presentation even without a `threat`. Use
   *  for a threat-less intro hosted in a WIDE game frame (e.g. SignBingo's 820px
   *  frame), where the default in-frame overlay renders as a big empty box. */
  overlay?: boolean;
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
  accent: accentOverride,
  threat,
  overlay = false,
}: ExerciseIntroBeatProps) {
  // A merged (threat) intro OR an explicit `overlay` request covers the whole
  // viewport (a real modal); plain intros stay an in-frame overlay.
  const fullScreen = !!threat || overlay;
  const intensity = useMotionIntensity();
  const audio = useGameAudio();
  const paced = !!narration && narration.lines.length > 0;
  const speaker = character ?? narration?.speaker ?? "adam";
  const week = useLessonWeek();
  // Themed accent: an explicit override wins, else the WEEK theme accent (so
  // every game intro on a themed week is one colour — no off-theme cyan/pink),
  // else the classic speaker cyan/pink for un-themed weeks.
  const themeAccent = useLessonTheme()?.accent;
  const accent = accentOverride ?? themeAccent ?? (speaker === "adam" ? "#00e5ff" : "#ff5fb3");
  const themed = !!(accentOverride ?? themeAccent);
  // Per-week world (owner 2026-09-12): the week's live scene shows through the
  // dimmed overlay and the card borrows the world's material for its rim.
  const world = useWeekWorld();
  const mat = world ? CARD_MATERIALS[world.card.material] : null;
  // NO-SKIP gate (owner 2026-09-07): the start button stays hidden until the
  // narration FINISHES, so the child can't skip the teaching voice. The click-
  // guard blocks the screen while it speaks; when it ends, the guard lifts and
  // the button appears. InfoNarration fires onDone on end / block / error / its
  // own safety-release, so this can't stick. Non-paced intros are ready at once.
  const [narrationDone, setNarrationDone] = useState(false);
  const canStart = !paced || narrationDone;

  useEffect(() => {
    audio.transition();
  }, [audio]);

  // Final belt-and-suspenders: release the gate after a generous length-based
  // max even if onDone never fires, so the button is never permanently stuck.
  useEffect(() => {
    if (!paced) return;
    const maxMs = Math.min(60000, 8000 + (narration?.lines.length ?? 1) * 4500);
    const id = window.setTimeout(() => setNarrationDone(true), maxMs);
    return () => window.clearTimeout(id);
  }, [paced, narration?.lines.length]);

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
        // A merged (threat) intro carries more content than the small game
        // frame is tall, so it covers the whole viewport (a real modal) to get
        // the room; plain intros stay an in-frame overlay as before. `overlay`
        // forces the modal for threat-less intros in wide frames.
        position: fullScreen ? "fixed" : "absolute",
        inset: 0,
        zIndex: fullScreen ? 90 : 25,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        overflowY: "auto",
        padding: 20,
        background: "rgba(8, 10, 22, 0.88)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        isolation: "isolate",
        animation: intensity === 0 ? undefined : "exIntroFade 240ms ease-out",
        fontFamily:
          "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* The week's world behind the card (world weeks only) */}
      <WorldBackdrop intensity={0.42} />
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: threat ? 560 : paced ? 470 : 420,
          margin: "auto 0",
          // Card grows to fit ALL its content (danger + title + the FULL
          // narration + button) so nothing is squeezed into a scroll sliver.
          // The overlay itself (inset:0, overflowY:auto) scrolls if the whole
          // card is ever taller than the frame, so "I'm ready" stays reachable.
          display: "flex",
          flexDirection: "column",
          textAlign: "center",
          color: "#fff7e6",
          background: paced
            ? "linear-gradient(180deg, rgba(18,24,58,0.92) 0%, rgba(10,14,36,0.94) 100%)"
            : "transparent",
          border: paced ? `1px solid ${mat?.edge ?? accent}${mat ? "" : "55"}` : "none",
          borderRadius: paced ? 22 : 0,
          padding: threat ? "18px 22px 18px" : paced ? "26px 22px 24px" : 0,
          boxShadow: paced
            ? mat
              ? `0 24px 60px -28px rgba(0,0,0,0.7), inset 0 0 0 2px ${mat.edge}66, inset 0 1px 0 rgba(255,255,255,0.08)`
              : "0 24px 60px -28px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)"
            : "none",
        }}
      >
        {mat && paced && <CardDecoration deco={mat.deco} edge={mat.edge} tone="chrome" />}
        {/* Spot-the-Danger preamble: the Raccoon reveals his trick, folded in
            above the warm mission so the get-ready is ONE screen (no separate
            threat scene). Leads the card with its own eyebrow. */}
        {threat && (
          <div style={{ flexShrink: 0, marginBottom: 12 }}>
            <div
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: accent,
                marginBottom: 8,
              }}
            >
              ◇ Spot the Danger ◇
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={weekCharacterSrc(week ?? undefined, "raccoon", "taunt")}
                onError={fallbackToShared("raccoon", "taunt")}
                alt="The Hacker Raccoon"
                style={{
                  height: 76,
                  flexShrink: 0,
                  objectFit: "contain",
                  filter: `drop-shadow(0 10px 20px ${accent}66)`,
                  animation: intensity === 0 ? undefined : "exThreatBob 2.6s ease-in-out infinite",
                }}
              />
              <div
                style={{
                  maxWidth: 320,
                  padding: "13px 18px",
                  borderRadius: 16,
                  background: `${accent}1c`,
                  border: `1px solid ${accent}70`,
                  color: "#f0e4ff",
                  fontStyle: "italic",
                  fontSize: 15,
                  fontWeight: 600,
                  lineHeight: 1.4,
                  textAlign: "left",
                }}
              >
                &ldquo;{threat.raccoonLine}&rdquo;
              </div>
            </div>
          </div>
        )}

        {/* R10: no character/logo emblem on paced (narrated) intros — the
            narrator isn't a character, so the intro leads with the title. The
            legacy non-paced variant keeps its small object icon. */}
        {!paced && icon && (
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
        )}
        {!threat && welcome && (
          <div
            style={{
              display: "inline-block",
              alignSelf: "center",
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
            background: themed
              ? `linear-gradient(135deg, ${accent}, ${accent}aa)`
              : "linear-gradient(135deg, #00e5ff, #7c5cff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {title}
        </h2>

        {paced ? (
          <div style={{ margin: "10px 0 16px", textAlign: "left" }}>
            {/* The guard blocks the screen while Sarah speaks (no skip); when
                she finishes, onDone lifts the gate so "I'm ready" appears. One
                "Listening…" indicator (the old countdown pill is gone). */}
            <InfoNarration
              lines={narration!.lines}
              speaker={speaker}
              accent={accent}
              onDone={() => setNarrationDone(true)}
            />
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
          <div style={{ flexShrink: 0, textAlign: "center" }}>
            <GameButton variant="primary" size="lg" onClick={onDismiss}>
              {paced ? "I'm ready →" : "Let's go →"}
            </GameButton>
          </div>
        ) : null}
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
        @keyframes exThreatBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
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
  /**
   * Optional spoken Sarah acknowledgment, read aloud on completion:
   * "Well done! Now you can X — carry it into the real world. This is what you
   * learned." The Learn Loop's "You're protected" payoff, on the game itself.
   */
  narration?: { speaker?: "adam" | "layla"; lines: string[] };
}

export function ExerciseCompleteBeat({
  title,
  stars = 3,
  statLines = [],
  onContinue,
  onRetry,
  encouragement = "You're getting stronger, Cyber Hero!",
  narration,
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
        // margin:auto on the card centres it when it fits and top-aligns +
        // scrolls when the acknowledgment makes it taller than the frame, so
        // the Continue button is NEVER clipped off the bottom.
        overflowY: "auto",
        padding: 20,
        background: "rgba(8, 10, 22, 0.85)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        isolation: "isolate",
        animation: intensity === 0 ? undefined : "exCompleteFade 240ms ease-out",
      }}
    >
      {/* The week's world + motes behind the complete card (world weeks only) */}
      <WorldBackdrop intensity={0.38} motes moteCount={12} />
      <div
        style={{
          position: "relative",
          margin: "auto",
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
        {/* Spoken acknowledgment — audio-only (visually hidden) so it never
            pushes the Continue button off-screen; the title + stat lines carry
            the visible "well done", and Sarah reads the full payoff aloud. */}
        {narration && narration.lines.length > 0 && (
          <div aria-hidden style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", pointerEvents: "none" }}>
            <InfoNarration lines={narration.lines} speaker={narration.speaker} accent="#7eff97" />
          </div>
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
