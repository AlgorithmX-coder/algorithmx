"use client";

/**
 * Mission Debrief.
 *
 * Final-act recap that consolidates Week 1 by CONCEPT instead of by
 * screen. Four cards (Strength / Secrecy / Uniqueness / Phishing)
 * light up in sequence with a satisfying spring animation, each one
 * stating what the child learned in that pillar. Layla narrates the
 * summary while the cards reveal.
 *
 * Today the cards show static "you learned X" copy from the data
 * file. Once the parent dashboard's ScreenResult/QuestionResponse
 * aggregations are wired to surface per-concept performance, the
 * cards can pull live stats ("9 of 10 correct on strength") - the
 * component is built so a future `stats` prop slots in without a
 * data-file change.
 *
 * Toolkit-native: uses ExerciseFrame chrome, ExerciseCompleteBeat
 * for the final tap, useExerciseFeedback for celebration, and
 * InfoNarration for the read-aloud track.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  useExerciseFeedback,
  useGameAudio,
  useMotionIntensity,
} from "@/app/lib/gameEngine";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import GameButton from "@/app/components/lesson/GameButton";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import PixIcon from "@/app/components/lesson/PixIcon";
import { WorldBackdrop } from "@/app/components/game/missionWorldStyles";
import { useClosingPalette, cardShade, REWARD } from "@/app/components/lesson/closingSuite";
import { useLessonTheme } from "@/app/components/lesson/LessonThemeContext";
import { useShortViewport } from "@/app/components/lesson/LessonStage";

export interface DebriefConcept {
  id: string;
  label: string;
  /** Hex accent colour. */
  accent: string;
  icon: string;
  summary: string;
}

export interface MissionDebriefProps {
  title: string;
  subtitle?: string;
  concepts: DebriefConcept[];
  narration?: { speaker?: "adam" | "layla"; lines: string[] };
  onComplete: () => void;
}

const CARD_STAGGER_MS = 380;

export default function MissionDebrief({
  title,
  subtitle,
  concepts,
  narration,
  onComplete,
}: MissionDebriefProps) {
  const intensity = useMotionIntensity();
  /* The week's own colour, instead of five unrelated authored accents. The
   * authored one stays as the fallback for a week with no theme, so nothing
   * changes for those. See closingSuite.ts for why the four closing screens
   * share this. */
  const pal = useClosingPalette();
  const theme = useLessonTheme();
  const shadeFor = (authored: string, i: number) =>
    theme ? cardShade(pal.accent, i, concepts.length) : authored;
  const fx = useExerciseFeedback();
  const audio = useGameAudio();
  const shortViewport = useShortViewport();

  // Number of cards currently visible. Animates up one by one with
  // a small audio tick to feel rewarding.
  const [revealedCount, setRevealedCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (revealedCount >= concepts.length) {
      setDone(true);
      return;
    }
    const id = window.setTimeout(
      () => {
        setRevealedCount((n) => n + 1);
        audio.starEarned();
      },
      revealedCount === 0 ? 500 : CARD_STAGGER_MS
    );
    return () => window.clearTimeout(id);
  }, [revealedCount, concepts.length, audio]);

  // Fire one big celebration when all cards are up. Guarded by a ref:
  // fx's identity changes when its own toast re-renders, so an unguarded
  // [done, fx] effect re-fires unlock forever (max-update-depth loop).
  const unlockFired = useRef(false);
  useEffect(() => {
    if (!done || unlockFired.current) return;
    unlockFired.current = true;
    fx.unlock({ xp: 50, text: "MISSION COMPLETE!" });
  }, [done, fx]);

  const handleContinue = useCallback(() => {
    onComplete();
  }, [onComplete]);

  return (
    <ExerciseFrame
      maxWidth={1000}
      padding={28}
      background="linear-gradient(180deg, #050a1a 0%, #1a1f4d 70%, #062019 100%)"
      style={{ isolation: "isolate" }}
    >
      {/* The week's world behind the debrief (world weeks only) */}
      <WorldBackdrop intensity={0.36} motes moteCount={14} moteOpacity={0.45} />
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <span
          style={{
            display: "inline-block",
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 11,
            letterSpacing: "0.22em",
            color: "#7df0ff",
            textTransform: "uppercase",
            fontWeight: 800,
            marginBottom: 8,
          }}
        >
          ✦ Mission Debrief
        </span>
        <h2
          style={{
            margin: "0 0 6px",
            fontSize: 28,
            fontWeight: 900,
            background: "linear-gradient(135deg, #7eff97, #00e5ff, #7c5cff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            lineHeight: 1.15,
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            style={{
              margin: 0,
              color: "#cbd5e1",
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Narration block (drives Layla's "you learned X" track).
        *
        * She SPEAKS every line; the board PRINTS the first and the last. The
        * lines between them restate the five concept cards sitting directly
        * underneath, one for one, word for word - "You keep it secret" above
        * a card titled "Keep It Secret". Printing both put 216px of duplicate
        * text on a board already 250px too tall for the owner's window, so
        * the fit was shrinking the whole screen to 0.72 and a six-year-old
        * was reading 17px titles at 12px.
        *
        * The opener and the closer are the two that are NOT on a card, so
        * they are the two that stay. The audio is untouched, which was the
        * owner's condition for this trim: no clip is re-recorded. */}
      {narration && (
        <InfoNarration
          lines={narration.lines}
          showOnly={
            narration.lines.length > 3
              ? [0, narration.lines.length - 1]
              : undefined
          }
          speaker={narration.speaker ?? "layla"}
        />
      )}

      {/* Concept progress pips - one per card; gold when revealed */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 8,
          marginBottom: 14,
        }}
        aria-label={`${revealedCount} of ${concepts.length} concepts revealed`}
      >
        {concepts.map((c, i) => {
          const on = i < revealedCount;
          return (
            <span
              key={c.id}
              style={{
                width: 28,
                height: 6,
                borderRadius: 3,
                background: on
                  ? `linear-gradient(90deg, ${shadeFor(c.accent, i)}, ${REWARD})`
                  : "rgba(255,255,255,0.12)",
                boxShadow: on ? `0 0 8px ${shadeFor(c.accent, i)}` : "none",
                transition: "background 240ms ease, box-shadow 240ms ease",
              }}
            />
          );
        })}
      </div>

      {/* Concept cards - reveal one at a time with spring + audio tick */}
      <div
        style={{
          display: "grid",
          // 220px wraps five concepts as four-plus-one, and that orphan row
          // is ~125px of a board already 965px tall against ~450px of room on
          // the tester's laptop, which pushed "Claim your stickers" off the
          // bottom. A narrower track puts all five on one row. Untouched at or
          // above STAGE_FIT_HEIGHT.
          gridTemplateColumns: shortViewport
            ? "repeat(auto-fit, minmax(132px, 1fr))"
            : "repeat(auto-fit, minmax(165px, 1fr))",
          gap: 14,
          marginBottom: 18,
        }}
      >
        {concepts.map((c, i) => {
          const visible = i < revealedCount;
          return (
            <motion.div
              key={c.id}
              initial={
                intensity === 0
                  ? { opacity: 0 }
                  : { opacity: 0, y: 24, scale: 0.85 }
              }
              animate={
                visible
                  ? intensity === 0
                    ? { opacity: 1 }
                    : { opacity: 1, y: 0, scale: 1 }
                  : intensity === 0
                    ? { opacity: 0 }
                    : { opacity: 0, y: 24, scale: 0.85 }
              }
              transition={
                intensity === 0
                  ? { duration: 0.2 }
                  : { type: "spring", stiffness: 280, damping: 22 }
              }
              style={{
                position: "relative",
                overflow: "hidden",
                padding: "30px 11px 13px",
                borderRadius: 16,
                /* The ground is the week's tint; the SHADE does the
                   identifying work on the rail, the well and the number. A
                   hex alpha cannot be appended to shadeFor's hsl() string. */
                background: `linear-gradient(180deg, rgba(${pal.accentRGB}, 0.16), rgba(9, 13, 32, 0.92))`,
                border: `1px solid rgba(${pal.accentRGB}, 0.38)`,
                boxShadow: visible
                  ? `0 14px 34px -14px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.07)`
                  : "none",
                textAlign: "center",
                fontFamily:
                  "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
              }}
            >
              {/* The rail. One saturated band per card, in that card's own
                  shade, so the row reads as five distinct skills at a glance
                  while still belonging to the week's colour. The previous
                  version put the shade on a 2px border all the way round,
                  which at five near-identical violets read as no difference
                  at all. */}
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: shadeFor(c.accent, i),
                }}
              />

              {/* The step number. The five concepts ARE a sequence - the week
                  teaches them in this order and the recaps count through them
                  - so numbering is information, not decoration. */}
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  top: 9,
                  left: 10,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  color: shadeFor(c.accent, i),
                  opacity: 0.95,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* The icon sits in a lit well rather than floating, which is
                  what stops the card reading as a plain box. */}
              <div
                style={{
                  width: 54,
                  height: 54,
                  margin: "0 auto 9px",
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  background: `radial-gradient(circle at 50% 38%, rgba(${pal.accentRGB}, 0.30), rgba(5, 8, 22, 0.55) 70%)`,
                  boxShadow: visible
                    ? `inset 0 0 0 1px rgba(${pal.accentRGB}, 0.40)`
                    : "none",
                }}
              >
                <PixIcon emoji={c.icon} size={38} />
              </div>

              <div
                style={{
                  fontSize: 16,
                  fontWeight: 900,
                  color: "#fff7e6",
                  lineHeight: 1.15,
                  marginBottom: 5,
                }}
              >
                {c.label}
              </div>

              {/* A hairline in the card's shade, separating the name of the
                  skill from what it actually means. */}
              <span
                aria-hidden
                style={{
                  display: "block",
                  width: 26,
                  height: 2,
                  margin: "0 auto 7px",
                  borderRadius: 2,
                  background: shadeFor(c.accent, i),
                  opacity: 0.75,
                }}
              />

              <div
                style={{
                  fontSize: 12,
                  color: "#c9d4ee",
                  lineHeight: 1.42,
                }}
              >
                {c.summary}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* "ALL UNLOCKED" achievement stamp + reward headline + CTA */}
      {done && (
        <motion.div
          initial={intensity === 0 ? { opacity: 0 } : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42 }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
          }}
        >
          <motion.div
            initial={
              intensity === 0
                ? { opacity: 0 }
                : { opacity: 0, scale: 1.4, rotate: -5 }
            }
            animate={{ opacity: 1, scale: 1, rotate: -3 }}
            transition={
              intensity === 0
                ? { duration: 0.16 }
                : { type: "spring", stiffness: 340, damping: 13, delay: 0.05 }
            }
            style={{
              padding: "6px 18px",
              borderRadius: 8,
              background: "rgba(253,224,71,0.95)",
              border: "3px double rgba(15,21,48,0.7)",
              color: "#1a1033",
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 900,
              fontSize: 12,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              boxShadow: "0 8px 18px rgba(253,224,71,0.5)",
            }}
          >
            ✓ All {concepts.length} skills unlocked
          </motion.div>
          <div
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(20px, 3.6vw, 28px)",
              fontWeight: 900,
              background:
                "linear-gradient(135deg, #fde047 0%, #ff7a59 60%, #ff5fb3 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: "0 0 22px rgba(253,224,71,0.45)",
              textAlign: "center",
              letterSpacing: "0.02em",
            }}
          >
            Time to claim your reward
          </div>
          <GameButton
            variant="primary"
            size="lg"
            onClick={handleContinue}
            icon="🎉"
            style={{ minWidth: 240 }}
          >
            Claim your stickers →
          </GameButton>
        </motion.div>
      )}
      {!done && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <GameButton
            variant="primary"
            size="lg"
            onClick={handleContinue}
            disabled
            style={{ minWidth: 240, opacity: 0.55 }}
          >
            Revealing skills…
          </GameButton>
        </div>
      )}

      {fx.layer()}
    </ExerciseFrame>
  );
}
