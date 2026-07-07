"use client";

/**
 * ReplyCards — the safe-reply SELECT drill (Week 3).
 *
 * An incoming chat message lands and three reply cards fan out below it.
 * Tap the safe reply → it slots into the chat with a green glow and the
 * next round arrives. Tap a risky one → it bounces back and teaches via
 * WrongAnswerPanel. One decision per round, no meter, no branching —
 * deliberately the calm single-shot counterpart to ChatSimulator's
 * escalating conversation.
 */

import { useEffect, useRef, useState } from "react";
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

export interface ReplyOption {
  text: string;
  isSafe: boolean;
  explanation: string;
}

export interface ReplyRound {
  id: string;
  from: string;
  fromIcon: string;
  message: string;
  replies: ReplyOption[];
}

export interface ReplyCardsProps {
  rounds: ReplyRound[];
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

const CARD_TILT = [-4, 0, 4];

export default function ReplyCards({
  rounds,
  hints,
  introNarration,
  coachLines,
  onComplete,
  onCorrect,
  onWrong,
  onHintReached,
  onAnswered,
}: ReplyCardsProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;

  const [showIntro, setShowIntro] = useState(true);
  const [idx, setIdx] = useState(0);
  const [sent, setSent] = useState<number | null>(null); // reply index slotted into the chat
  const [wrongCount, setWrongCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  const finished = idx >= rounds.length;
  const round = rounds[idx];

  useEffect(() => {
    setSent(null);
  }, [idx]);

  const reportedTier = useRef(0);
  useEffect(() => {
    const tier = wrongCount >= 2 ? 2 : wrongCount >= 1 ? 1 : 0;
    if (tier > reportedTier.current) {
      reportedTier.current = tier;
      onHintReached?.(tier as 1 | 2);
    }
  }, [wrongCount, onHintReached]);

  const pick = (i: number) => {
    if (!round || sent !== null || showIntro) return;
    setHasInteracted(true);
    const reply = round.replies[i];
    const correctIndex = round.replies.findIndex((r) => r.isSafe);
    onAnswered?.({
      questionKey: `reply-${round.id}`,
      selectedIndex: i,
      correctIndex,
      wasCorrect: reply.isSafe,
    });
    if (reply.isSafe) {
      audio.correct();
      fx.correct({ xp: 25, text: "SAFE REPLY!" });
      onCorrect?.();
      setCorrectCount((n) => n + 1);
      setSent(i);
      window.setTimeout(() => setIdx((n) => n + 1), reduce ? 800 : 1600);
    } else {
      audio.wrong();
      onWrong?.();
      setWrongCount((n) => n + 1);
      setFeedback({
        title: "Hmm - that reply isn't safe",
        explanation: reply.explanation,
        tip: hints?.tier1,
      });
    }
  };

  const stars = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1;

  return (
    <ExerciseFrame maxWidth={720} decor>
      {fx.layer()}

      {showIntro && (
        <ExerciseIntroBeat
          title="The Safe Reply"
          subtitle="A message lands. Pick the reply a hero would send."
          icon="💬"
          narration={introNarration}
          character={introNarration?.speaker}
          onDismiss={() => setShowIntro(false)}
        />
      )}

      {round && (
        <AnimatePresence mode="wait">
          <motion.div
            key={round.id}
            initial={reduce ? false : { x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={reduce ? undefined : { x: -40, opacity: 0 }}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            {/* Incoming message bubble */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <span
                style={{
                  display: "inline-flex",
                  padding: 7,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.08)",
                  border: "1.5px solid rgba(255,255,255,0.2)",
                  flexShrink: 0,
                }}
              >
                <PixIcon emoji={round.fromIcon} size={30} />
              </span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 900, color: "#9fb1ff", marginBottom: 4 }}>
                  {round.from}
                </div>
                <motion.div
                  initial={reduce ? false : { scale: 0.92, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  style={{
                    maxWidth: 460,
                    padding: "12px 16px",
                    borderRadius: "4px 18px 18px 18px",
                    background: "rgba(124,92,255,0.16)",
                    border: "1.5px solid rgba(124,92,255,0.5)",
                    color: "#e6e1ff",
                    fontSize: 16,
                    fontWeight: 700,
                    lineHeight: 1.4,
                  }}
                >
                  {round.message}
                </motion.div>
              </div>
            </div>

            {/* The child's sent reply slots in here */}
            {sent !== null && (
              <motion.div
                initial={reduce ? false : { y: 24, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                style={{ display: "flex", justifyContent: "flex-end" }}
              >
                <div
                  style={{
                    maxWidth: 460,
                    padding: "12px 16px",
                    borderRadius: "18px 4px 18px 18px",
                    background: "rgba(52,211,153,0.18)",
                    border: "2px solid #34d399",
                    boxShadow: "0 0 26px -4px rgba(52,211,153,0.65)",
                    color: "#c9ffd9",
                    fontSize: 16,
                    fontWeight: 800,
                    lineHeight: 1.4,
                  }}
                >
                  {round.replies[sent].text} <span style={{ color: "#7eff97" }}>✓</span>
                </div>
              </motion.div>
            )}

            {/* Fanned reply cards */}
            {sent === null && (
              <div>
                <div
                  style={{
                    textAlign: "center",
                    fontSize: 12,
                    fontWeight: 900,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "#7d8cc9",
                    margin: "4px 0 10px",
                  }}
                >
                  ▼ Pick your reply · Message {Math.min(idx + 1, rounds.length)} of {rounds.length} ▼
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0,1fr))",
                    gap: 12,
                    alignItems: "stretch",
                  }}
                >
                  {round.replies.map((r, i) => (
                    <motion.button
                      key={i}
                      type="button"
                      onClick={() => pick(i)}
                      onPointerEnter={() => audio.hover()}
                      initial={reduce ? false : { y: 30, opacity: 0, rotate: 0 }}
                      animate={{ y: 0, opacity: 1, rotate: reduce ? 0 : CARD_TILT[i % 3] }}
                      transition={{ delay: reduce ? 0 : 0.08 * i, type: "spring", stiffness: 260, damping: 20 }}
                      whileHover={reduce ? undefined : { y: -6, rotate: 0, scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        minHeight: 108,
                        padding: "14px 12px",
                        borderRadius: 16,
                        border: "2px solid rgba(125,240,255,0.5)",
                        background: "linear-gradient(165deg, rgba(0,229,255,0.16), rgba(12,18,48,0.9))",
                        color: "#eaf9ff",
                        fontSize: 14.5,
                        fontWeight: 800,
                        lineHeight: 1.35,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        boxShadow: "0 14px 30px -18px rgba(0,229,255,0.8)",
                        touchAction: "manipulation",
                      }}
                    >
                      {r.text}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ padding: wrongCount > 0 ? "2px 4px 0" : 0 }}>
              {wrongCount === 1 && hints && <HintBubble tier={1} speaker="layla" text={hints.tier1} />}
              {wrongCount >= 2 && hints && <HintBubble tier={2} speaker="layla" text={hints.tier2} />}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

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
          title="Every reply a hero reply!"
          stars={stars}
          statLines={[
            `${correctCount}/${rounds.length} safe replies first try`,
            "Never meet. Never send. Tell a grown-up.",
          ]}
          onContinue={() => onComplete(correctCount)}
        />
      )}
    </ExerciseFrame>
  );
}
