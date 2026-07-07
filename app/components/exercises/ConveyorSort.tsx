"use client";

/**
 * ConveyorSort — the Sorting Machine (binary SORT on a moving belt).
 *
 * One card at a time rides a conveyor belt toward the scanner. The child
 * sends it into one of TWO chutes before it arrives. Right chute → the
 * machine stamps it and the next card rolls on; wrong chute (or letting
 * the scanner catch it) → the belt pauses and teaches via
 * WrongAnswerPanel. Categories are data, so the same machine can sort
 * share/keep-private (W2), day activities (W13), device types (W14)…
 *
 * Deliberately unlike weakSorter (static four-way diagnosis) and
 * cyberScanner (canvas beam-drift): this is a DOM machine with physical
 * chutes, one card in play, and generous pacing that doubles in comfort
 * mode.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGameAudio } from "@/app/lib/gameEngine/useGameAudio";
import { useExerciseFeedback } from "@/app/lib/gameEngine/useExerciseFeedback";
import { useMotionIntensity } from "@/app/lib/gameEngine/useMotionIntensity";
import { useComfortMode } from "@/app/lib/comfortMode";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import ExerciseIntroBeat, { ExerciseCompleteBeat } from "@/app/components/lesson/ExerciseBeats";
import CoachCaption from "@/app/components/lesson/CoachCaption";
import WrongAnswerPanel from "@/app/components/lesson/WrongAnswerPanel";
import HintBubble from "@/app/components/lesson/HintBubble";
import PixIcon from "@/app/components/lesson/PixIcon";

export interface ConveyorCategory {
  id: string;
  label: string;
  icon: string;
  tone: "safe" | "lock" | "flag";
}

export interface ConveyorItem {
  id: string;
  text: string;
  icon?: string;
  categoryId: string;
  explanation: string;
}

export interface ConveyorSortProps {
  categories: ConveyorCategory[];
  items: ConveyorItem[];
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

const TONE = {
  safe: { accent: "#7eff97", tint: "rgba(52, 211, 153, 0.16)", border: "#34d399" },
  lock: { accent: "#7df0ff", tint: "rgba(0, 179, 255, 0.14)", border: "#38bdf8" },
  flag: { accent: "#ff8f8f", tint: "rgba(239, 68, 68, 0.16)", border: "#ef4444" },
} as const;

// Seconds a card takes to cross the belt (before comfort scaling).
function rideSecs(i: number) {
  if (i === 0) return 11;
  if (i < 3) return 9;
  if (i < 6) return 7.5;
  return 6.5;
}

export default function ConveyorSort({
  categories,
  items,
  hints,
  introNarration,
  coachLines,
  onComplete,
  onCorrect,
  onWrong,
  onHintReached,
  onAnswered,
}: ConveyorSortProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const comfort = useComfortMode();
  const reduce = intensity < 1;

  const [showIntro, setShowIntro] = useState(true);
  const [idx, setIdx] = useState(0);
  const [progress, setProgress] = useState(0); // 0..1 across the belt
  const [paused, setPaused] = useState(false);
  const [stamp, setStamp] = useState<null | { categoryId: string }>(null);
  const [wrongCount, setWrongCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  const finished = idx >= items.length;
  const item = items[idx];
  const runningRef = useRef(false);
  runningRef.current = !showIntro && !finished && !paused && !stamp && !feedback;

  // Report hint tiers as they first become visible.
  const reportedTier = useRef(0);
  useEffect(() => {
    const tier = wrongCount >= 2 ? 2 : wrongCount >= 1 ? 1 : 0;
    if (tier > reportedTier.current) {
      reportedTier.current = tier;
      onHintReached?.(tier as 1 | 2);
    }
  }, [wrongCount, onHintReached]);

  // Drive the belt. One interval, progress accumulates only while running.
  useEffect(() => {
    if (showIntro || finished) return;
    const tick = 50;
    const id = window.setInterval(() => {
      if (!runningRef.current) return;
      const secs = rideSecs(idx) * (comfort.enabled ? 2 : 1);
      setProgress((p) => Math.min(1, p + tick / 1000 / secs));
    }, tick);
    return () => window.clearInterval(id);
  }, [showIntro, finished, idx, comfort.enabled]);

  // Scanner caught the card → gentle timeout teach.
  useEffect(() => {
    if (progress < 1 || !item || paused || feedback || stamp) return;
    audio.wrong();
    onWrong?.();
    setWrongCount((n) => n + 1);
    setPaused(true);
    setFeedback({
      title: "The scanner beat you to it!",
      explanation: `That one was "${item.text}" — ${item.explanation}`,
      tip: "No rush next time - the belt always waits after a stumble.",
    });
    onAnswered?.({
      questionKey: `sort-${item.id}`,
      selectedIndex: -1,
      correctIndex: categories.findIndex((c) => c.id === item.categoryId),
      wasCorrect: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  const choose = (categoryId: string) => {
    if (!runningRef.current || !item) return;
    setHasInteracted(true);
    const correctIdx = categories.findIndex((c) => c.id === item.categoryId);
    const chosenIdx = categories.findIndex((c) => c.id === categoryId);
    const wasCorrect = categoryId === item.categoryId;
    onAnswered?.({
      questionKey: `sort-${item.id}`,
      selectedIndex: chosenIdx,
      correctIndex: correctIdx,
      wasCorrect,
    });
    if (wasCorrect) {
      audio.drop();
      fx.correct({ xp: 25 });
      onCorrect?.();
      setCorrectCount((n) => n + 1);
      setStamp({ categoryId });
      window.setTimeout(() => {
        setStamp(null);
        setProgress(0);
        setIdx((i) => i + 1);
      }, reduce ? 350 : 700);
    } else {
      audio.wrong();
      onWrong?.();
      setWrongCount((n) => n + 1);
      setPaused(true);
      const right = categories.find((c) => c.id === item.categoryId);
      setFeedback({
        title: `That one belongs in ${right?.label ?? "the other chute"}`,
        explanation: item.explanation,
        tip: hints?.tier1,
      });
    }
  };

  const gotIt = () => {
    setFeedback(null);
    setPaused(false);
    setStamp(null);
    setProgress(0);
    setIdx((i) => i + 1);
  };

  const stars = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1;
  const beltX = 4 + progress * 68; // % across the machine face

  const stampCat = useMemo(
    () => (stamp ? categories.find((c) => c.id === stamp.categoryId) : null),
    [stamp, categories],
  );

  return (
    <ExerciseFrame maxWidth={760} decor>
      {fx.layer()}

      {showIntro && (
        <ExerciseIntroBeat
          title="The Sorting Machine"
          subtitle="Send each card down the right chute before it reaches the scanner."
          icon="🌍"
          narration={introNarration}
          character={introNarration?.speaker}
          onDismiss={() => setShowIntro(false)}
        />
      )}

      {/* ── The machine ── */}
      <div
        style={{
          borderRadius: 20,
          padding: "16px 14px 14px",
          background: "linear-gradient(180deg, rgba(26,33,71,0.9) 0%, rgba(15,21,48,0.95) 100%)",
          border: "2px solid rgba(122,140,255,0.35)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 18px 44px -22px rgba(0,0,0,0.8)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
            padding: "0 4px",
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 900, letterSpacing: "0.06em", color: "#9fb1ff" }}>
            THE SORTING MACHINE
          </span>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: "#7d8cc9" }}>
            Card {Math.min(idx + 1, items.length)} of {items.length}
          </span>
        </div>

        {/* Belt */}
        <div
          style={{
            position: "relative",
            height: 132,
            borderRadius: 14,
            overflow: "hidden",
            background: "linear-gradient(180deg, #10162e 0%, #0b1024 100%)",
            border: "1px solid rgba(122,140,255,0.25)",
          }}
        >
          {/* Moving track */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 26,
              background:
                "repeating-linear-gradient(90deg, #232a4e 0 26px, #1a2040 26px 52px)",
              animation: reduce || !runningRef.current ? undefined : "beltRoll 1.1s linear infinite",
              borderTop: "2px solid rgba(122,140,255,0.35)",
            }}
          />
          {/* Scanner at the end of the line */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              right: 10,
              top: 8,
              bottom: 30,
              width: 46,
              borderRadius: 10,
              background: "linear-gradient(180deg, rgba(124,92,255,0.32), rgba(124,92,255,0.12))",
              border: "1px solid rgba(160,106,255,0.6)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
            }}
          >
            <PixIcon emoji="👀" size={22} />
            <span style={{ fontSize: 8.5, fontWeight: 900, color: "#c9b6ff", letterSpacing: "0.08em" }}>
              SCAN
            </span>
            <div
              style={{
                width: 3,
                alignSelf: "stretch",
                margin: "2px auto 0",
                background: "linear-gradient(180deg, transparent, rgba(192,132,252,0.8))",
              }}
            />
          </div>

          {/* The riding card */}
          <AnimatePresence>
            {item && !finished && (
              <motion.div
                key={item.id}
                initial={reduce ? false : { opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0, y: 40, scale: 0.85 }}
                style={{
                  position: "absolute",
                  left: `${beltX}%`,
                  bottom: 22,
                  width: 178,
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: "linear-gradient(180deg, #fff7e6 0%, #ffe9bd 100%)",
                  border: "2px solid #f5c854",
                  boxShadow: "0 8px 18px -8px rgba(0,0,0,0.7)",
                  color: "#4a3208",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  transition: paused || stamp ? "none" : "left 60ms linear",
                }}
              >
                {item.icon && <PixIcon emoji={item.icon} size={26} />}
                <span style={{ fontSize: 13.5, fontWeight: 800, lineHeight: 1.2 }}>{item.text}</span>
                {stampCat && (
                  <motion.span
                    initial={reduce ? false : { scale: 2, opacity: 0, rotate: -14 }}
                    animate={{ scale: 1, opacity: 1, rotate: -9 }}
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      pointerEvents: "none",
                    }}
                  >
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: 999,
                        background: "rgba(10,20,14,0.85)",
                        border: `2px solid ${TONE[stampCat.tone].accent}`,
                        color: TONE[stampCat.tone].accent,
                        fontSize: 12,
                        fontWeight: 900,
                        letterSpacing: "0.05em",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <PixIcon emoji={stampCat.icon} size={15} /> SORTED!
                    </span>
                  </motion.span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Chutes */}
        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          {categories.map((cat) => {
            const t = TONE[cat.tone];
            return (
              <motion.button
                key={cat.id}
                onClick={() => choose(cat.id)}
                disabled={!item || finished || paused || !!stamp || showIntro}
                whileHover={reduce ? undefined : { scale: 1.02 }}
                whileTap={reduce ? undefined : { scale: 0.97 }}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  padding: "14px 10px 12px",
                  borderRadius: 14,
                  cursor: "pointer",
                  touchAction: "manipulation",
                  background: t.tint,
                  border: `2px solid ${t.border}`,
                  boxShadow: `0 8px 22px -12px ${t.accent}55, inset 0 1px 0 rgba(255,255,255,0.08)`,
                  color: t.accent,
                  fontFamily: "inherit",
                }}
                aria-label={`Send the card to ${cat.label}`}
              >
                <PixIcon emoji={cat.icon} size={34} />
                <span style={{ fontSize: 14.5, fontWeight: 900, letterSpacing: "0.03em" }}>
                  {cat.label}
                </span>
                <span aria-hidden style={{ fontSize: 10.5, fontWeight: 800, opacity: 0.75, letterSpacing: "0.1em" }}>
                  ▼ CHUTE ▼
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Tiered hints (reserved space so the layout doesn't jump) */}
        <div style={{ padding: wrongCount > 0 ? "10px 4px 0" : 0 }}>
          {wrongCount === 1 && hints && <HintBubble tier={1} speaker="layla" text={hints.tier1} />}
          {wrongCount >= 2 && hints && <HintBubble tier={2} speaker="layla" text={hints.tier2} />}
        </div>
      </div>

      {coachLines && !showIntro && !hasInteracted && !finished && (
        <CoachCaption lines={coachLines.lines} speaker={coachLines.speaker} />
      )}

      {feedback && (
        <WrongAnswerPanel
          title={feedback.title}
          explanation={feedback.explanation}
          tip={feedback.tip}
          onContinue={gotIt}
        />
      )}

      {finished && (
        <ExerciseCompleteBeat
          title="Belt cleared!"
          stars={stars}
          statLines={[
            `${correctCount}/${items.length} sorted first try`,
            "The vault is locked and the share pile is safe.",
          ]}
          onContinue={() => onComplete(correctCount)}
        />
      )}

      <style>{`
        @keyframes beltRoll {
          from { background-position-x: 0; }
          to { background-position-x: -52px; }
        }
      `}</style>
    </ExerciseFrame>
  );
}
