"use client";

/**
 * TrailStamper — the golden-trail BUILD drill (Week 12).
 *
 * A snow path with footprint spots climbs across the board. At each spot
 * the child chooses between two track-stamps — one they'd be proud of in
 * a year, one they'd regret. The proud stamp presses a golden footprint
 * into the path and the TRAIL GLOW meter rises; the regret stamp gets a
 * gentle teach panel and another go. Finish with a full golden trail.
 *
 * The agency beat of footprint week: tracks aren't scary — you get to
 * CHOOSE the ones you leave.
 */

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGameAudio } from "@/app/lib/gameEngine/useGameAudio";
import { useExerciseFeedback } from "@/app/lib/gameEngine/useExerciseFeedback";
import { useMotionIntensity } from "@/app/lib/gameEngine/useMotionIntensity";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import ExerciseIntroBeat, { ExerciseCompleteBeat } from "@/app/components/lesson/ExerciseBeats";
import CoachCaption from "@/app/components/lesson/CoachCaption";
import WrongAnswerPanel from "@/app/components/lesson/WrongAnswerPanel";
import HintBubble from "@/app/components/lesson/HintBubble";
import PixIcon from "@/app/components/lesson/PixIcon";

export interface StampOption {
  label: string;
  /** Emoji rendered via PixIcon on the stamp card. */
  icon: string;
  /** True = the proud, golden track. Exactly one per spot. */
  isProud: boolean;
  /** Teach copy shown when the regret stamp is picked. */
  note: string;
}

export interface StampSpot {
  id: string;
  /** The moment, e.g. "Priya posted her new painting..." */
  prompt: string;
  /** Two options; exactly one isProud. */
  options: StampOption[];
}

export interface TrailStamperProps {
  spots: StampSpot[];
  /** Copy overrides (defaults keep the W12 snow-trail skin). */
  introTitle?: string;
  introSubtitle?: string;
  introIcon?: string;
  meterLabel?: string;
  stampToast?: string;
  wrongTitle?: string;
  completeTitle?: string;
  completeLine?: string;
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

export default function TrailStamper({
  spots,
  introTitle,
  introSubtitle,
  introIcon,
  meterLabel,
  stampToast,
  wrongTitle,
  completeTitle,
  completeLine,
  hints,
  introNarration,
  coachLines,
  onComplete,
  onCorrect,
  onWrong,
  onHintReached,
  onAnswered,
}: TrailStamperProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;

  const [showIntro, setShowIntro] = useState(true);
  const [spotIdx, setSpotIdx] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [firstTryCount, setFirstTryCount] = useState(0);
  const [wrongOnCurrent, setWrongOnCurrent] = useState(false);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  const finished = spotIdx >= spots.length;
  const spot = spots[spotIdx];
  const glow = Math.round((spotIdx / spots.length) * 100);

  const reportedTier = useRef(0);
  const reportTier = (n: number) => {
    const tier = n >= 2 ? 2 : n >= 1 ? 1 : 0;
    if (tier > reportedTier.current) {
      reportedTier.current = tier;
      onHintReached?.(tier as 1 | 2);
    }
  };

  const pick = (idx: number) => {
    if (!spot || showIntro || feedback || finished) return;
    setHasInteracted(true);
    const option = spot.options[idx];
    onAnswered?.({
      questionKey: `stamp-${spot.id}`,
      selectedIndex: idx,
      correctIndex: spot.options.findIndex((o) => o.isProud),
      wasCorrect: option.isProud,
    });
    if (option.isProud) {
      audio.correct();
      fx.correct({ xp: 25, text: stampToast ?? "GOLDEN STAMP!" });
      onCorrect?.();
      if (!wrongOnCurrent) setFirstTryCount((n) => n + 1);
      setWrongOnCurrent(false);
      setSpotIdx((i) => i + 1);
    } else {
      audio.wrong();
      onWrong?.();
      setWrongOnCurrent(true);
      setWrongCount((c) => {
        const v = c + 1;
        reportTier(v);
        return v;
      });
      setFeedback({
        title: wrongTitle ?? "That one stains the snow",
        explanation: option.note,
        tip: hints?.tier1,
      });
    }
  };

  const stars = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1;

  return (
    <ExerciseFrame maxWidth={820} decor>
      {fx.layer()}

      {showIntro && (
        <ExerciseIntroBeat
          title={introTitle ?? "The Golden Trail"}
          subtitle={introSubtitle ?? "Five footprint spots, two stamps each. Press only the tracks you'd be proud of in a year."}
          icon={introIcon ?? "⭐"}
          narration={introNarration}
          character={introNarration?.speaker}
          onDismiss={() => setShowIntro(false)}
        />
      )}

      {/* Glow meter */}
      <div style={{ maxWidth: 640, margin: "0 auto 12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, fontWeight: 900, letterSpacing: "0.1em", color: "#ffd158", marginBottom: 4 }}>
          <span>{meterLabel ?? "TRAIL GLOW"}</span>
          <span>{glow}%</span>
        </div>
        <div style={{ height: 10, borderRadius: 999, background: "rgba(255,209,88,0.15)", border: "1px solid rgba(255,209,88,0.35)", overflow: "hidden" }}>
          <motion.div
            animate={{ width: `${glow}%` }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 20 }}
            style={{ height: "100%", background: "linear-gradient(90deg, #ffd158, #ffb347)", boxShadow: "0 0 14px rgba(255,209,88,0.8)" }}
          />
        </div>
      </div>

      {/* The snow path */}
      <div
        style={{
          maxWidth: 640,
          margin: "0 auto 16px",
          padding: "16px 14px",
          borderRadius: 16,
          background: "linear-gradient(180deg, #eef5ff 0%, #d9e7fb 100%)",
          border: "2px solid rgba(125,240,255,0.4)",
          display: "flex",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        {spots.map((s, i) => {
          const stamped = i < spotIdx;
          const current = i === spotIdx;
          return (
            <div
              key={s.id}
              style={{
                flex: 1,
                minHeight: 64,
                borderRadius: 12,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                border: stamped
                  ? "2.5px solid #e8a413"
                  : current
                    ? "2.5px dashed #3b82f6"
                    : "2.5px dashed rgba(60,90,140,0.35)",
                background: stamped ? "linear-gradient(165deg, #fff3cf, #ffe08a)" : "rgba(255,255,255,0.55)",
                boxShadow: stamped ? "0 0 20px -4px rgba(232,164,19,0.75)" : "none",
              }}
            >
              {stamped ? (
                <motion.div initial={reduce ? false : { scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                  <PixIcon emoji={spots[i].options.find((o) => o.isProud)?.icon ?? "⭐"} size={26} />
                </motion.div>
              ) : (
                <span style={{ fontSize: 16, fontWeight: 900, color: current ? "#3b82f6" : "rgba(60,90,140,0.5)" }}>{i + 1}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Current spot */}
      {spot && !finished && (
        <AnimatePresence mode="wait">
          <motion.div
            key={spot.id}
            initial={reduce ? false : { x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={reduce ? undefined : { x: -40, opacity: 0 }}
          >
            <div
              style={{
                textAlign: "center",
                maxWidth: 620,
                margin: "0 auto 14px",
                padding: "12px 18px",
                borderRadius: 14,
                background: "rgba(0,229,255,0.08)",
                border: "1px solid rgba(125,240,255,0.35)",
                color: "#dff6ff",
                fontSize: 15.5,
                fontWeight: 800,
                lineHeight: 1.4,
              }}
            >
              {spot.prompt}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 12, maxWidth: 620, margin: "0 auto" }}>
              {spot.options.map((o, i) => (
                <motion.button
                  key={`${spot.id}-${i}`}
                  type="button"
                  onClick={() => pick(i)}
                  onPointerEnter={() => audio.hover()}
                  disabled={!!feedback}
                  whileHover={reduce ? undefined : { y: -4 }}
                  whileTap={{ scale: 0.96 }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    minHeight: 120,
                    padding: "16px 12px",
                    borderRadius: 16,
                    border: "2px solid rgba(125,240,255,0.4)",
                    background: "linear-gradient(165deg, rgba(0,229,255,0.1), rgba(12,18,48,0.92))",
                    color: "#eaf9ff",
                    fontSize: 14.5,
                    fontWeight: 800,
                    lineHeight: 1.35,
                    fontFamily: "inherit",
                    cursor: "pointer",
                    boxShadow: "0 14px 30px -18px rgba(0,229,255,0.7)",
                    touchAction: "manipulation",
                  }}
                >
                  <PixIcon emoji={o.icon} size={30} />
                  {o.label}
                </motion.button>
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: 12, fontSize: 12, fontWeight: 800, color: "#7d8cc9", letterSpacing: "0.1em" }}>
              FOOTPRINT {Math.min(spotIdx + 1, spots.length)} OF {spots.length}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      <div style={{ maxWidth: 560, margin: "8px auto 0" }}>
        {wrongCount === 1 && hints && <HintBubble tier={1} speaker="adam" text={hints.tier1} />}
        {wrongCount >= 2 && hints && <HintBubble tier={2} speaker="adam" text={hints.tier2} />}
      </div>

      {coachLines && !showIntro && !hasInteracted && !finished && (
        <CoachCaption lines={coachLines.lines} speaker={coachLines.speaker} />
      )}

      {feedback && (
        <WrongAnswerPanel
          title={feedback.title}
          explanation={feedback.explanation}
          tip={feedback.tip}
          onContinue={() => setFeedback(null)}
        />
      )}

      {finished && (
        <ExerciseCompleteBeat
          title={completeTitle ?? "The whole trail is glowing!"}
          stars={stars}
          statLines={[
            `${firstTryCount}/${spots.length} golden stamps first try`,
            completeLine ?? "Tracks you chose, tracks you're proud of - that's ranger work.",
          ]}
          onContinue={() => onComplete(firstTryCount)}
        />
      )}
    </ExerciseFrame>
  );
}
