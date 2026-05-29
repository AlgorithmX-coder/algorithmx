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

import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  useExerciseFeedback,
  useGameAudio,
  useMotionIntensity,
} from "@/app/lib/gameEngine";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import GameButton from "@/app/components/lesson/GameButton";
import InfoNarration from "@/app/components/lesson/InfoNarration";

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
  const fx = useExerciseFeedback();
  const audio = useGameAudio();

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

  // Fire one big celebration when all 4 cards are up.
  useEffect(() => {
    if (!done) return;
    fx.unlock({ xp: 50, text: "WEEK 1 COMPLETE!" });
  }, [done, fx]);

  const handleContinue = useCallback(() => {
    onComplete();
  }, [onComplete]);

  return (
    <ExerciseFrame
      maxWidth={1000}
      padding={28}
      background="linear-gradient(180deg, #050a1a 0%, #1a1f4d 70%, #062019 100%)"
    >
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

      {/* Narration block (drives Layla's "you learned X" track). */}
      {narration && (
        <InfoNarration
          lines={narration.lines}
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
                  ? `linear-gradient(90deg, ${c.accent}, #fde047)`
                  : "rgba(255,255,255,0.12)",
                boxShadow: on ? `0 0 8px ${c.accent}aa` : "none",
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
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
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
                padding: "20px 18px",
                borderRadius: 18,
                background: `linear-gradient(180deg, ${c.accent}22, rgba(15, 21, 48, 0.85))`,
                border: `2px solid ${c.accent}88`,
                boxShadow: visible ? `0 12px 36px ${c.accent}33` : "none",
                textAlign: "center",
                fontFamily:
                  "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
              }}
            >
              <div
                style={{
                  fontSize: 44,
                  lineHeight: 1,
                  marginBottom: 8,
                  filter: visible ? `drop-shadow(0 0 14px ${c.accent}88)` : undefined,
                }}
              >
                {c.icon}
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  letterSpacing: "0.18em",
                  color: c.accent,
                  textTransform: "uppercase",
                  fontWeight: 800,
                  marginBottom: 4,
                  textShadow: `0 0 12px ${c.accent}55`,
                }}
              >
                You learned
              </div>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 900,
                  color: "#fff7e6",
                  marginBottom: 6,
                }}
              >
                {c.label}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#cbd5e1",
                  lineHeight: 1.45,
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
