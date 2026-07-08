"use client";

/**
 * DayBalancer — the see-saw BUILD drill (Week 13).
 *
 * A cartoon see-saw holds a kid's day: one side stacked with screen
 * blocks, tipping the plank right over. One screen block at a time
 * lights up with its story and the child swaps it for a replacement -
 * but the decoys are FAKE recharges (still screens in disguise), so
 * real judgment is needed. Each true swap physically lifts the plank a
 * step. It ends LEVEL with two screen blocks still aboard - balance
 * means SOME, not none - and a grown-up co-signs the finished plan.
 *
 * Deliberately unlike teamPoster (fill empty slots) and trailStamper
 * (stamp a path): this one starts over-loaded and the build action is
 * swapping weight until the plank sits level.
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

export interface BalancerOption {
  label: string;
  /** Emoji rendered via PixIcon on the card. */
  icon: string;
  /** True = a real recharge that balances the day. Exactly one per swap. */
  isBalancing: boolean;
  /** Teach copy when a fake-recharge decoy is picked. */
  note: string;
}

export interface BalancerSwap {
  id: string;
  /** The highlighted screen block's story ("Cartoons at breakfast AND..."). */
  story: string;
  /** Chip label/icon for the block sitting on the screen side. */
  blockLabel: string;
  blockIcon: string;
  /** Three options; decoys are screens-in-disguise. */
  options: BalancerOption[];
}

export interface DayBalancerProps {
  /** Screen blocks that STAY on the plank (balance keeps the fun). */
  keptBlocks: { label: string; icon: string }[];
  swaps: BalancerSwap[];
  /** Copy overrides (defaults keep the W13 day-plan skin). */
  introTitle?: string;
  introSubtitle?: string;
  introIcon?: string;
  meterLabel?: string;
  leftLabel?: string;
  rightLabel?: string;
  swapToast?: string;
  wrongTitle?: string;
  /** The grown-up sign-off line on the complete beat. */
  cosignLine?: string;
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

// Degrees; screen side down. Kept gentle: the plank is ~660px wide, so
// even small angles swing the ends far - the padding on the see-saw
// band below must absorb sin(angle) * half-width of vertical overflow.
const TILT_START = -6;

function Chip({ label, icon, tone, pulse }: { label: string; icon: string; tone: "screen" | "recharge"; pulse?: boolean }) {
  return (
    <motion.div
      layout
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.5, opacity: 0 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "5px 8px",
        borderRadius: 9,
        border: pulse
          ? "2px solid #ffd158"
          : tone === "screen"
            ? "1.5px solid rgba(255,143,143,0.6)"
            : "1.5px solid rgba(126,255,151,0.65)",
        background: tone === "screen" ? "rgba(80,20,40,0.75)" : "rgba(16,64,44,0.8)",
        color: "#eaf9ff",
        fontSize: 10.5,
        fontWeight: 800,
        lineHeight: 1.15,
        maxWidth: 118,
        boxShadow: pulse ? "0 0 16px -2px rgba(255,209,88,0.9)" : "none",
      }}
    >
      <PixIcon emoji={icon} size={16} />
      <span>{label}</span>
    </motion.div>
  );
}

export default function DayBalancer({
  keptBlocks,
  swaps,
  introTitle,
  introSubtitle,
  introIcon,
  meterLabel,
  leftLabel,
  rightLabel,
  swapToast,
  wrongTitle,
  cosignLine,
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
}: DayBalancerProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;

  const [showIntro, setShowIntro] = useState(true);
  const [swapIdx, setSwapIdx] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [firstTryCount, setFirstTryCount] = useState(0);
  const [wrongOnCurrent, setWrongOnCurrent] = useState(false);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  const finished = swapIdx >= swaps.length;
  const swap = swaps[swapIdx];
  const balance = Math.round((swapIdx / swaps.length) * 100);
  const angle = TILT_START * (1 - swapIdx / swaps.length);

  const reportedTier = useRef(0);
  const reportTier = (n: number) => {
    const tier = n >= 2 ? 2 : n >= 1 ? 1 : 0;
    if (tier > reportedTier.current) {
      reportedTier.current = tier;
      onHintReached?.(tier as 1 | 2);
    }
  };

  const pick = (idx: number) => {
    if (!swap || showIntro || feedback || finished) return;
    setHasInteracted(true);
    const option = swap.options[idx];
    onAnswered?.({
      questionKey: `swap-${swap.id}`,
      selectedIndex: idx,
      correctIndex: swap.options.findIndex((o) => o.isBalancing),
      wasCorrect: option.isBalancing,
    });
    if (option.isBalancing) {
      audio.correct();
      fx.correct({ xp: 25, text: swapToast ?? "REAL RECHARGE!" });
      onCorrect?.();
      if (!wrongOnCurrent) setFirstTryCount((n) => n + 1);
      setWrongOnCurrent(false);
      setSwapIdx((i) => i + 1);
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
        title: wrongTitle ?? "Still a screen in disguise!",
        explanation: option.note,
        tip: hints?.tier1,
      });
    }
  };

  const stars = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1;

  // Plank contents: remaining swap blocks + the kept-for-fun blocks on the
  // screen side; every completed swap's true recharge on the other side.
  const leftChips = [
    ...swaps.slice(swapIdx).map((s) => ({ key: s.id, label: s.blockLabel, icon: s.blockIcon, pulse: s.id === swap?.id })),
    ...keptBlocks.map((b, i) => ({ key: `kept-${i}`, label: b.label, icon: b.icon, pulse: false })),
  ];
  const rightChips = swaps.slice(0, swapIdx).map((s) => {
    const o = s.options.find((x) => x.isBalancing);
    return { key: s.id, label: o?.label ?? "", icon: o?.icon ?? "✅" };
  });

  return (
    <ExerciseFrame maxWidth={860} decor>
      {fx.layer()}

      {showIntro && (
        <ExerciseIntroBeat
          title={introTitle ?? "The See-Saw Day"}
          subtitle={introSubtitle ?? "This day plan is tipping over with screens! Swap blocks for REAL recharges until it sits level."}
          icon={introIcon ?? "⚡"}
          narration={introNarration}
          character={introNarration?.speaker}
          onDismiss={() => setShowIntro(false)}
        />
      )}

      {/* Balance meter */}
      <div style={{ maxWidth: 660, margin: "0 auto 10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, fontWeight: 900, letterSpacing: "0.1em", color: "#7eff97", marginBottom: 4 }}>
          <span>{meterLabel ?? "BALANCE"}</span>
          <span>{balance}%</span>
        </div>
        <div style={{ height: 10, borderRadius: 999, background: "rgba(126,255,151,0.14)", border: "1px solid rgba(126,255,151,0.35)", overflow: "hidden" }}>
          <motion.div
            animate={{ width: `${balance}%` }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 20 }}
            style={{ height: "100%", background: "linear-gradient(90deg, #7eff97, #34d399)", boxShadow: "0 0 14px rgba(126,255,151,0.8)" }}
          />
        </div>
      </div>

      {/* The see-saw */}
      <div style={{ maxWidth: 660, margin: "0 auto 10px", padding: "6px 4px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, fontWeight: 900, letterSpacing: "0.12em", color: "#7d8cc9", padding: "0 8px 4px" }}>
          <span style={{ color: "#ff9bcb" }}>{leftLabel ?? "SCREEN SIDE"}</span>
          <span style={{ color: "#7eff97" }}>{rightLabel ?? "RECHARGE SIDE"}</span>
        </div>
        {/* Clearance band: absorbs the rotated plank's vertical overflow so
            the tilt never covers the labels above or the story card below. */}
        <div style={{ padding: "36px 0" }}>
        <motion.div
          animate={{ rotate: angle }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 60, damping: 14 }}
          style={{
            minHeight: 64,
            borderRadius: 14,
            border: "2px solid rgba(125,240,255,0.4)",
            background: "linear-gradient(180deg, rgba(18,48,92,0.9), rgba(12,30,66,0.9))",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            padding: "8px 10px",
            transformOrigin: "50% 50%",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, flex: 1 }}>
            <AnimatePresence>
              {leftChips.map((c) => (
                <Chip key={c.key} label={c.label} icon={c.icon} tone="screen" pulse={c.pulse} />
              ))}
            </AnimatePresence>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, flex: 1, justifyContent: "flex-end" }}>
            <AnimatePresence>
              {rightChips.map((c) => (
                <Chip key={c.key} label={c.label} icon={c.icon} tone="recharge" />
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
        {/* pivot */}
        <div aria-hidden style={{ width: 0, height: 0, margin: "0 auto", borderLeft: "16px solid transparent", borderRight: "16px solid transparent", borderBottom: "18px solid rgba(125,240,255,0.45)" }} />
        </div>
      </div>

      {/* Current swap */}
      {swap && !finished && (
        <AnimatePresence mode="wait">
          <motion.div
            key={swap.id}
            initial={reduce ? false : { x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={reduce ? undefined : { x: -40, opacity: 0 }}
          >
            <div
              style={{
                textAlign: "center",
                maxWidth: 640,
                margin: "0 auto 12px",
                padding: "12px 18px",
                borderRadius: 14,
                background: "rgba(255,209,88,0.09)",
                border: "1px solid rgba(255,209,88,0.4)",
                color: "#ffe9b8",
                fontSize: 15,
                fontWeight: 800,
                lineHeight: 1.4,
              }}
            >
              {swap.story}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 10, maxWidth: 640, margin: "0 auto" }}>
              {swap.options.map((o, i) => (
                <motion.button
                  key={`${swap.id}-${i}`}
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
                    minHeight: 108,
                    padding: "14px 10px",
                    borderRadius: 16,
                    border: "2px solid rgba(125,240,255,0.4)",
                    background: "linear-gradient(165deg, rgba(0,229,255,0.1), rgba(12,18,48,0.92))",
                    color: "#eaf9ff",
                    fontSize: 13.5,
                    fontWeight: 800,
                    lineHeight: 1.35,
                    fontFamily: "inherit",
                    cursor: "pointer",
                    boxShadow: "0 14px 30px -18px rgba(0,229,255,0.7)",
                    touchAction: "manipulation",
                  }}
                >
                  <PixIcon emoji={o.icon} size={28} />
                  {o.label}
                </motion.button>
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: 12, fontSize: 12, fontWeight: 800, color: "#7d8cc9", letterSpacing: "0.1em" }}>
              SWAP {Math.min(swapIdx + 1, swaps.length)} OF {swaps.length}
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
          title={completeTitle ?? "The see-saw sits LEVEL!"}
          stars={stars}
          statLines={[
            cosignLine ?? "👪 CO-SIGNED! This plan belongs to both of you now.",
            completeLine ?? "Screen fun stayed aboard - balance means SOME, not none.",
          ]}
          onContinue={() => onComplete(firstTryCount)}
        />
      )}
    </ExerciseFrame>
  );
}
