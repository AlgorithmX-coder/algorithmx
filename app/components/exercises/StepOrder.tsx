"use client";

/**
 * StepOrder — the stepping-stones ORDER game (Week 5+).
 *
 * A calm river scene with N empty stepping stones. The step tiles float
 * below in shuffled order; the child taps them in the order they'd do
 * them, and each correct tap hops onto the next stone. A wrong tap
 * wobbles with a gentle nudge — no splash, no fail. All stones filled →
 * the path glows and the crossing completes.
 *
 * The GAME-sized sibling of QuickCheck's "order" prove: same idea, but a
 * staged scene with narrated intro, per-step affirmations and reusable
 * dressing (W5 calm-path, W11 protocol launchpad, W13 power-off ritual
 * can all re-theme via props).
 */

import { useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { useGameAudio } from "@/app/lib/gameEngine/useGameAudio";
import { useExerciseFeedback } from "@/app/lib/gameEngine/useExerciseFeedback";
import { useMotionIntensity } from "@/app/lib/gameEngine/useMotionIntensity";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import ExerciseIntroBeat, { ExerciseCompleteBeat } from "@/app/components/lesson/ExerciseBeats";
import CoachCaption from "@/app/components/lesson/CoachCaption";
import HintBubble from "@/app/components/lesson/HintBubble";
import PixIcon from "@/app/components/lesson/PixIcon";

export interface OrderStep {
  id: string;
  /** Short step label ("Don't reply"). */
  text: string;
  /** Emoji rendered via PixIcon on the tile/stone. */
  icon: string;
  /** Affirmation shown when this step lands ("That's it - starve the fire!"). */
  affirmation?: string;
}

export interface StepOrderProps {
  /** Steps in CORRECT order; display order is shuffled deterministically. */
  steps: OrderStep[];
  /** Intro copy (re-theme per week). */
  introTitle: string;
  introSubtitle?: string;
  introIcon?: string;
  hints?: { tier1: string; tier2: string };
  introNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  coachLines?: { speaker?: "adam" | "layla"; lines: string[] };
  onComplete: (score: number) => void;
  onCorrect?: () => void;
  onWrong?: () => void;
  onHintReached?: (tier: 1 | 2 | 3) => void;
  onAnswered?: (data: {
    questionKey: string;
    selectedIndex: number;
    correctIndex: number;
    wasCorrect: boolean;
  }) => void;
}

// Deterministic shuffle (rotate by half) so the authored order is never
// the display order, without Math.random hydration mismatches.
function displayOrder<T>(arr: T[]): T[] {
  const k = Math.max(1, Math.floor(arr.length / 2));
  return [...arr.slice(k), ...arr.slice(0, k)];
}

export default function StepOrder({
  steps,
  introTitle,
  introSubtitle,
  introIcon = "🔢",
  hints,
  introNarration,
  coachLines,
  onComplete,
  onCorrect,
  onWrong,
  onHintReached,
  onAnswered,
}: StepOrderProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;

  const [showIntro, setShowIntro] = useState(true);
  const [placedCount, setPlacedCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [affirmation, setAffirmation] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [finished, setFinished] = useState(false);

  const tiles = useMemo(() => displayOrder(steps), [steps]);
  const placedIds = useMemo(
    () => new Set(steps.slice(0, placedCount).map((s) => s.id)),
    [steps, placedCount],
  );

  const reportedTier = useRef(0);
  const reportTier = (n: number) => {
    const tier = n >= 2 ? 2 : n >= 1 ? 1 : 0;
    if (tier > reportedTier.current) {
      reportedTier.current = tier;
      onHintReached?.(tier as 1 | 2);
    }
  };

  const pick = (step: OrderStep) => {
    if (showIntro || finished || placedIds.has(step.id)) return;
    setHasInteracted(true);
    const expected = steps[placedCount];
    const wasCorrect = step.id === expected.id;
    onAnswered?.({
      questionKey: `step-${step.id}`,
      selectedIndex: tiles.findIndex((t) => t.id === step.id),
      correctIndex: tiles.findIndex((t) => t.id === expected.id),
      wasCorrect,
    });
    if (wasCorrect) {
      audio.correct();
      setWrongId(null);
      setAffirmation(step.affirmation ?? null);
      const next = placedCount + 1;
      setPlacedCount(next);
      onCorrect?.();
      if (next >= steps.length) {
        fx.correct({ xp: 25, text: "PATH COMPLETE!" });
        window.setTimeout(() => setFinished(true), reduce ? 500 : 1200);
      }
    } else {
      audio.wrong();
      setWrongId(step.id);
      onWrong?.();
      setWrongCount((n) => {
        const v = n + 1;
        reportTier(v);
        return v;
      });
    }
  };

  const stars = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1;

  return (
    <ExerciseFrame
      maxWidth={820}
      background="linear-gradient(180deg, #0a1230 0%, #10265c 60%, #0a3a4d 100%)"
      style={{ position: "relative", overflow: "hidden" }}
    >
      {fx.layer()}

      {/* the river */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "34%",
          height: 130,
          background: "linear-gradient(180deg, rgba(0,180,255,0.14) 0%, rgba(0,120,200,0.28) 100%)",
          borderTop: "2px solid rgba(125,240,255,0.25)",
          borderBottom: "2px solid rgba(125,240,255,0.25)",
        }}
      />

      {showIntro && (
        <ExerciseIntroBeat
          title={introTitle}
          subtitle={introSubtitle}
          icon={introIcon}
          narration={introNarration}
          character={introNarration?.speaker}
          onDismiss={() => setShowIntro(false)}
        />
      )}

      <div style={{ position: "relative", zIndex: 2, minHeight: 440, paddingTop: 8 }}>
        {/* Stepping stones across the river */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${steps.length}, minmax(0,1fr))`,
            gap: 12,
            alignItems: "center",
            margin: "70px auto 96px",
            maxWidth: 660,
          }}
        >
          {steps.map((s, i) => {
            const filled = i < placedCount;
            return (
              <motion.div
                key={s.id}
                animate={filled && !reduce ? { scale: [1.12, 1] } : {}}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <div
                  style={{
                    width: "100%",
                    minHeight: 84,
                    borderRadius: "46% 54% 52% 48% / 58% 56% 44% 42%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                    padding: "10px 8px",
                    background: filled
                      ? "linear-gradient(165deg, #3f7350 0%, #274d34 100%)"
                      : "linear-gradient(165deg, #3a4569 0%, #262e4d 100%)",
                    border: `2.5px solid ${filled ? "#7eff97" : "rgba(125,240,255,0.35)"}`,
                    boxShadow: filled
                      ? "0 0 28px -4px rgba(126,255,151,0.6)"
                      : "0 10px 24px -14px rgba(0,0,0,0.8)",
                    transition: "background 300ms ease, border-color 300ms ease",
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 900,
                      color: filled ? "#c9ffd9" : "#7d8cc9",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {i + 1}
                  </span>
                  {filled ? (
                    <>
                      <PixIcon emoji={s.icon} size={26} />
                      <span
                        style={{
                          fontSize: 12.5,
                          fontWeight: 800,
                          color: "#eafff0",
                          textAlign: "center",
                          lineHeight: 1.2,
                        }}
                      >
                        {s.text}
                      </span>
                    </>
                  ) : (
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#5d6a99" }}>?</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* affirmation line */}
        <div
          style={{
            minHeight: 24,
            textAlign: "center",
            marginTop: -78,
            marginBottom: 54,
            fontSize: 15,
            fontWeight: 800,
            color: "#7eff97",
          }}
        >
          {affirmation}
        </div>

        {/* Shuffled step tiles */}
        {!finished && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${tiles.length}, minmax(0,1fr))`,
              gap: 12,
              maxWidth: 660,
              margin: "0 auto",
            }}
          >
            {tiles.map((t) => {
              const used = placedIds.has(t.id);
              const isWrong = wrongId === t.id;
              return (
                <motion.button
                  key={t.id}
                  type="button"
                  disabled={used || showIntro}
                  onClick={() => pick(t)}
                  onPointerEnter={() => !used && audio.hover()}
                  animate={
                    isWrong && !reduce
                      ? { x: [0, -7, 7, -5, 5, 0] }
                      : used
                        ? { opacity: 0.25, y: -6 }
                        : { opacity: 1, y: 0 }
                  }
                  whileHover={used || reduce ? undefined : { y: -4 }}
                  whileTap={used ? undefined : { scale: 0.96 }}
                  style={{
                    minHeight: 96,
                    padding: "12px 10px",
                    borderRadius: 16,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    border: "2px solid rgba(255, 209, 88, 0.55)",
                    background: "linear-gradient(165deg, rgba(255,209,88,0.16), rgba(30,24,8,0.9))",
                    color: "#fff3d6",
                    fontSize: 14.5,
                    fontWeight: 800,
                    lineHeight: 1.3,
                    cursor: used ? "default" : "pointer",
                    fontFamily: "inherit",
                    boxShadow: "0 14px 30px -18px rgba(255,209,88,0.8)",
                    touchAction: "manipulation",
                  }}
                >
                  <PixIcon emoji={t.icon} size={30} />
                  {t.text}
                </motion.button>
              );
            })}
          </div>
        )}

        <div style={{ maxWidth: 560, margin: "14px auto 0" }}>
          {wrongCount === 1 && hints && <HintBubble tier={1} speaker="layla" text={hints.tier1} />}
          {wrongCount >= 2 && hints && <HintBubble tier={2} speaker="layla" text={hints.tier2} />}
        </div>
      </div>

      {coachLines && !showIntro && !hasInteracted && !finished && (
        <CoachCaption lines={coachLines.lines} speaker={coachLines.speaker} />
      )}

      {finished && (
        <ExerciseCompleteBeat
          title="You crossed the river!"
          stars={stars}
          statLines={[
            `All ${steps.length} steps in the right order`,
            "That path is yours now - for real life too.",
          ]}
          onContinue={() => onComplete(steps.length - Math.min(wrongCount, steps.length - 1))}
        />
      )}
    </ExerciseFrame>
  );
}
