"use client";

/**
 * WeakSorter - Week 1's reworked screen-6 exercise.
 *
 * CyberScanner already covers strong/weak classification; this screen
 * teaches the *reason* a password is weak. The child sees a weak
 * password and taps which of four reasons applies:
 *   - Too short
 *   - Common word
 *   - Has your name / birthday
 *   - Keyboard pattern
 *
 * Wrong answers pause the activity and surface a kid-friendly
 * explanation via the shared WrongAnswerPanel. Tiered hints appear in
 * the HintBubble after 1 / 2 / 3 wrong on the screen. Respects comfort
 * mode (no time pressure, no shake).
 */

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  useExerciseFeedback,
  useGameAudio,
  useMotionIntensity,
} from "@/app/lib/gameEngine";
// correctAnswerBurst is KEPT (not routed through fx.unlock/fx.correct)
// because the toolkit equivalents fire smaller bursts + push a toast;
// matching the current single-fire completion burst exactly requires
// the legacy helper. Flagged in the migration report.
import { correctAnswerBurst } from "@/app/lib/celebrations";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import WrongAnswerPanel from "@/app/components/lesson/WrongAnswerPanel";
import HintBubble from "@/app/components/lesson/HintBubble";
import GameButton from "@/app/components/lesson/GameButton";
import ExerciseIntroBeat from "@/app/components/lesson/ExerciseBeats";
import PixIcon from "@/app/components/lesson/PixIcon";

export interface WeakReason {
  id: string;
  label: string;
  example: string;
}

export interface WeakItem {
  text: string;
  reasonId: string;
  explanation: string;
}

export interface WeakSorterHints {
  tier1: string;
  tier2: string;
  tier3: string;
}

export interface WeakSorterProps {
  reasons: WeakReason[];
  items: WeakItem[];
  hints?: WeakSorterHints;
  introNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  onComplete: (score: number) => void;
  onCorrect?: () => void;
  onWrong?: () => void;
  /** See CyberScanner.onHintReached. WeakSorter measures wrongOnCurrent
   * per item; the parent hook keeps the max across the whole screen. */
  onHintReached?: (tier: 1 | 2 | 3) => void;
}

const REASON_TINT: Record<number, { border: string; bg: string }> = {
  0: { border: "#ff5fb3", bg: "rgba(255, 95, 179, 0.12)" },
  1: { border: "#ffd158", bg: "rgba(255, 209, 88, 0.12)" },
  2: { border: "#7c5cff", bg: "rgba(124, 92, 255, 0.12)" },
  3: { border: "#00e5ff", bg: "rgba(0, 229, 255, 0.12)" },
};

export default function WeakSorter({
  reasons,
  items,
  hints,
  introNarration,
  onComplete,
  onCorrect,
  onWrong,
  onHintReached,
}: WeakSorterProps) {
  // Toolkit hooks. `reduce` preserves the original threshold
  // (enabled || prefersReducedMotion) by mapping to intensity < 1.
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;

  const [showIntro, setShowIntro] = useState(true);
  const [idx, setIdx] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [wrongTotal, setWrongTotal] = useState<number>(0);
  const [wrongOnCurrent, setWrongOnCurrent] = useState<number>(0);

  // Emit hint tier whenever wrongOnCurrent crosses a threshold.
  // Same mapping as the other reaction-style exercises (1/2/≥3).
  useEffect(() => {
    if (!onHintReached) return;
    if (wrongOnCurrent === 0) return;
    const tier: 1 | 2 | 3 =
      wrongOnCurrent === 1 ? 1 : wrongOnCurrent === 2 ? 2 : 3;
    onHintReached(tier);
  }, [wrongOnCurrent, onHintReached]);
  const [feedback, setFeedback] = useState<null | {
    title: string;
    explanation: string;
    tip?: string;
  }>(null);
  const [pulseKey, setPulseKey] = useState<number>(0);
  // Brief "STAMPED" beat after a correct answer - shows the matched
  // reason label across the card before the next card slides in. This
  // is the moment of satisfaction; without it the screen feels like
  // a multiple-choice quiz.
  const [stamp, setStamp] = useState<null | { label: string; key: number }>(null);
  // Card-entry direction: true = slide in from right (next), false = no slide
  // (first card on mount). Resets on reset.
  const [cardKey, setCardKey] = useState<number>(0);

  const current = items[idx];
  const reasonsById = useMemo(() => {
    const m = new Map<string, WeakReason>();
    reasons.forEach((r) => m.set(r.id, r));
    return m;
  }, [reasons]);

  const finished = idx >= items.length;

  // After the burst on a correct answer, advance to next item.
  useEffect(() => {
    if (!finished) return;
    void correctAnswerBurst();
  }, [finished]);

  const handleTap = (reasonId: string) => {
    if (feedback || !current) return;
    const correct = reasonId === current.reasonId;
    if (correct) {
      audio.correct();
      audio.drop(); // tactile stamp as the answer locks into place
      setCorrectCount((n) => n + 1);
      setWrongOnCurrent(0);
      setPulseKey((k) => k + 1);
      // Satisfying STAMP beat - the reason label punches across the
      // card before the next one slides in. Skipped under reduced
      // motion (still get pulseKey scale + sound + green flash).
      if (!reduce) {
        const tappedReason = reasonsById.get(reasonId);
        setStamp({ label: tappedReason?.label ?? "Correct!", key: Date.now() });
      }
      onCorrect?.();
      // Advance after a beat so the stamp and pulse register. The
      // delay is longer in regular play because the stamp animation
      // is 600ms and we want it to land.
      const advanceDelay = reduce ? 250 : 700;
      window.setTimeout(() => {
        setStamp(null);
        setIdx((i) => i + 1);
        setCardKey((k) => k + 1);
      }, advanceDelay);
    } else {
      audio.wrong();
      setWrongTotal((n) => n + 1);
      setWrongOnCurrent((n) => n + 1);
      onWrong?.();
      const correctReason = reasonsById.get(current.reasonId);
      setFeedback({
        title: `That one was actually "${correctReason?.label ?? "different"}"`,
        explanation: current.explanation,
        tip: correctReason
          ? `${correctReason.label}: e.g. ${correctReason.example}`
          : undefined,
      });
    }
  };

  const dismissFeedback = () => {
    setFeedback(null);
    // We do NOT advance on wrong - the child should try again on the
    // same card so the explanation has somewhere to land.
  };

  const hintTier: 0 | 1 | 2 | 3 =
    wrongOnCurrent >= 3
      ? 3
      : wrongOnCurrent === 2
        ? 2
        : wrongOnCurrent === 1
          ? 1
          : 0;
  const hintText =
    hintTier === 0
      ? null
      : hintTier === 1
        ? hints?.tier1 ?? "Look at what's wrong with this password."
        : hintTier === 2
          ? hints?.tier2 ?? "Compare it to the rules you learned."
          : hints?.tier3 ?? "Check each reason carefully.";

  if (finished) {
    const accuracy = items.length
      ? Math.round((correctCount / items.length) * 100)
      : 0;
    const stars = wrongTotal === 0 ? 3 : wrongTotal <= 2 ? 2 : 1;
    return (
      <ExerciseFrame
        maxWidth={1100}
        padding={28}
        background="linear-gradient(180deg, #0f1530 0%, #1a2147 55%, #252d5e 100%)"
        style={{ color: "#fff7e6", textAlign: "center" }}
      >
        <div style={{ fontSize: 64, marginBottom: 8 }}><PixIcon emoji="🕵️" size={70} /></div>
        <h2
          style={{
            margin: "0 0 6px",
            fontSize: 26,
            fontWeight: 900,
            background: "linear-gradient(135deg, #7eff97, #00e5ff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Weakness Detective!
        </h2>
        <p style={{ color: "#cbd5e1", margin: "0 0 4px" }}>
          You spotted {correctCount} of {items.length} weak-password
          reasons.
        </p>
        <p style={{ color: "#94a3b8", margin: "0 0 18px" }}>
          {accuracy}% · {Array.from({ length: stars }, (_, i) => (<PixIcon key={i} emoji="⭐" size={16} />))}
        </p>
        <GameButton
          variant="primary"
          size="lg"
          onClick={() => onComplete(correctCount)}
        >
          Continue →
        </GameButton>
        {fx.layer()}
      </ExerciseFrame>
    );
  }

  return (
    <ExerciseFrame
      maxWidth={1100}
      padding={24}
      background="linear-gradient(180deg, #0f1530 0%, #1a2147 55%, #252d5e 100%)"
      style={{ color: "#fff7e6" }}
    >
      {showIntro && (
        <ExerciseIntroBeat
          title="Weakness Detective"
          subtitle="For each password, work out WHY it's weak."
          icon="🕵️"
          narration={introNarration}
          character={introNarration?.speaker ?? "adam"}
          onDismiss={() => setShowIntro(false)}
        />
      )}
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 11,
            letterSpacing: "0.14em",
            color: "#7df0ff",
            textTransform: "uppercase",
            fontWeight: 800,
          }}
        >
          Weakness Detective
        </span>
        <span
          style={{
            fontSize: 12,
            color: "#cbd5e1",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {idx + 1} / {items.length}
        </span>
      </div>

      {/* The weak password - slides in from the right on advance,
          gets a green flash + stamp overlay on correct, scales softly
          on wrong (handled by pulseKey). */}
      <motion.div
        key={cardKey}
        initial={reduce ? false : { x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 26 }}
        style={{
          position: "relative",
          padding: "26px 18px",
          marginBottom: 18,
          background: stamp
            ? "rgba(126, 255, 151, 0.14)"
            : "rgba(255, 95, 179, 0.08)",
          border: `2px solid ${stamp ? "rgba(126, 255, 151, 0.75)" : "rgba(255, 95, 179, 0.55)"}`,
          borderRadius: 16,
          textAlign: "center",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 28,
          fontWeight: 700,
          color: stamp ? "#a0ffb0" : "#ff9bcb",
          letterSpacing: "0.04em",
          wordBreak: "break-all",
          transition: "background 200ms ease-out, border-color 200ms ease-out, color 200ms ease-out",
          overflow: "hidden",
        }}
      >
        {current?.text}
        {/* The STAMP overlay - rotates in, settles, fades out */}
        {stamp && !reduce && (
          <div
            key={stamp.key}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              animation: "wsStamp 600ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
            }}
          >
            <span
              style={{
                padding: "6px 18px",
                border: "3px solid #7eff97",
                borderRadius: 8,
                color: "#7eff97",
                background: "rgba(15, 21, 48, 0.85)",
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 18,
                fontWeight: 900,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                boxShadow: "0 0 18px rgba(126, 255, 151, 0.45)",
                transform: "rotate(-6deg)",
              }}
            >
              ✓ {stamp.label}
            </span>
          </div>
        )}
        <style>{`
          @keyframes wsStamp {
            0%   { opacity: 0; transform: scale(0.4) rotate(-30deg); }
            55%  { opacity: 1; transform: scale(1.06) rotate(-6deg); }
            85%  { opacity: 1; transform: scale(1) rotate(-6deg); }
            100% { opacity: 0; transform: scale(1) rotate(-6deg); }
          }
        `}</style>
      </motion.div>

      <p
        style={{
          textAlign: "center",
          color: "#cbd5e1",
          fontSize: 14,
          margin: "0 0 14px",
        }}
      >
        This password is WEAK. <strong style={{ color: "#fff" }}>Why?</strong>{" "}
        Tap the reason below.
      </p>

      {/* Hint area - always reserves space so reasons don't jump */}
      <div style={{ minHeight: 56, marginBottom: 12 }}>
        {hintText && (
          <HintBubble
            tier={hintTier as 1 | 2 | 3}
            text={hintText}
            speaker="adam"
          />
        )}
      </div>

      {/* Reason buttons - generous tap targets (≥64px tall), clear
          hover/active states, satisfying press animation. */}
      <div
        role="group"
        aria-label="Reason this password is weak"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 12,
        }}
      >
        {reasons.map((r, i) => {
          const tint = REASON_TINT[i] ?? REASON_TINT[0];
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => handleTap(r.id)}
              onPointerEnter={(e) => {
                if (reduce || feedback) return;
                const el = e.currentTarget as HTMLButtonElement;
                el.style.borderColor = "#fff";
                el.style.transform = "translateY(-2px)";
                el.style.boxShadow = `0 8px 24px -8px ${tint.border}`;
                audio.hover();
              }}
              onPointerLeave={(e) => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.borderColor = tint.border;
                el.style.transform = "";
                el.style.boxShadow = "";
              }}
              onPointerDown={(e) => {
                if (reduce || feedback) return;
                (e.currentTarget as HTMLButtonElement).style.transform =
                  "translateY(1px) scale(0.98)";
              }}
              onPointerUp={(e) => {
                if (reduce || feedback) return;
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
              }}
              disabled={!!feedback}
              style={{
                minHeight: 68,
                padding: "14px 16px",
                background: tint.bg,
                border: `2px solid ${tint.border}`,
                borderRadius: 14,
                color: "#fff",
                fontWeight: 800,
                fontSize: 15,
                cursor: feedback ? "default" : "pointer",
                textAlign: "left",
                fontFamily:
                  "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
                opacity: feedback ? 0.55 : 1,
                // Wider transition window covers hover lift, active
                // press, shadow grow and border flash all in one.
                transition:
                  "transform 140ms cubic-bezier(0.34, 1.56, 0.64, 1), border-color 160ms ease-out, box-shadow 160ms ease-out",
                lineHeight: 1.3,
                touchAction: "manipulation",
              }}
            >
              <div style={{ fontSize: 16, marginBottom: 4 }}>{r.label}</div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  color: "#cbd5e1",
                  fontWeight: 500,
                }}
              >
                e.g. {r.example}
              </div>
            </button>
          );
        })}
      </div>

      {feedback && (
        <WrongAnswerPanel
          title={feedback.title}
          explanation={feedback.explanation}
          tip={feedback.tip}
          speaker="layla"
          onContinue={dismissFeedback}
        />
      )}
      {fx.layer()}
    </ExerciseFrame>
  );
}
