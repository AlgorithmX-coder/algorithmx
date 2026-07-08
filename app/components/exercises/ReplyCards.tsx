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
  /** 3-4 options; exactly one isSafe. */
  replies: ReplyOption[];
}

export interface ReplyCardsProps {
  rounds: ReplyRound[];
  /** Visual skin: fanned chat cards (default), tall kindness DOORS (W5), brass LEVERS (W8) or bobbing BALLOONS (W18). */
  skin?: "cards" | "doors" | "levers" | "balloons";
  /** Intro copy overrides (re-theme per week). */
  introTitle?: string;
  introSubtitle?: string;
  introIcon?: string;
  /** In-game copy overrides (defaults keep the W3 chat skin). */
  pickLabel?: string;
  roundNoun?: string;
  correctToast?: string;
  wrongTitle?: string;
  completeTitle?: string;
  completeLine?: string;
  scoreNoun?: string;
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

const CARD_TILT = [-4, 0, 4, -2];

export default function ReplyCards({
  rounds,
  skin = "cards",
  introTitle,
  introSubtitle,
  introIcon,
  pickLabel,
  roundNoun,
  correctToast,
  wrongTitle,
  completeTitle,
  completeLine,
  scoreNoun,
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
      fx.correct({ xp: 25, text: correctToast ?? "SAFE REPLY!" });
      onCorrect?.();
      setCorrectCount((n) => n + 1);
      setSent(i);
      window.setTimeout(() => setIdx((n) => n + 1), reduce ? 800 : 1600);
    } else {
      audio.wrong();
      onWrong?.();
      setWrongCount((n) => n + 1);
      setFeedback({
        title: wrongTitle ?? "Hmm - that reply isn't safe",
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
          title={introTitle ?? "The Safe Reply"}
          subtitle={introSubtitle ?? "A message lands. Pick the reply a hero would send."}
          icon={introIcon ?? "💬"}
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
                  ▼ {pickLabel ?? "Pick your reply"} · {roundNoun ?? "Message"} {Math.min(idx + 1, rounds.length)} of {rounds.length} ▼
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${round.replies.length}, minmax(0,1fr))`,
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
                      animate={{
                        y: 0,
                        opacity: 1,
                        rotate: reduce || skin !== "cards" ? 0 : CARD_TILT[i % CARD_TILT.length],
                      }}
                      transition={{ delay: reduce ? 0 : 0.08 * i, type: "spring", stiffness: 260, damping: 20 }}
                      whileHover={reduce ? undefined : { y: -6, rotate: 0, scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      style={
                        skin === "balloons"
                          ? {
                              position: "relative",
                              minHeight: 148,
                              padding: "22px 16px 30px",
                              // balloon silhouette: round top, gathered base
                              borderRadius: "50% 50% 46% 46% / 58% 58% 40% 40%",
                              border: "2.5px solid rgba(255,138,171,0.6)",
                              background:
                                "radial-gradient(circle at 32% 26%, rgba(255,255,255,0.28), transparent 42%), linear-gradient(180deg, rgba(255,95,179,0.3) 0%, rgba(84,18,52,0.94) 100%)",
                              color: "#ffe3f0",
                              fontSize: 14.5,
                              fontWeight: 900,
                              lineHeight: 1.35,
                              cursor: "pointer",
                              fontFamily: "inherit",
                              boxShadow: "0 16px 34px -18px rgba(255,95,179,0.85)",
                              touchAction: "manipulation",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              textAlign: "center",
                            }
                          : skin === "levers"
                          ? {
                              position: "relative",
                              minHeight: 176,
                              padding: "16px 14px 14px",
                              borderRadius: 16,
                              border: "2.5px solid rgba(255, 209, 88, 0.55)",
                              background:
                                "linear-gradient(180deg, rgba(64,48,16,0.94) 0%, rgba(32,23,8,0.96) 100%)",
                              color: "#ffe9b3",
                              fontSize: 15,
                              fontWeight: 900,
                              letterSpacing: "0.04em",
                              lineHeight: 1.35,
                              cursor: "pointer",
                              fontFamily: "inherit",
                              boxShadow: "0 16px 34px -18px rgba(255,209,88,0.75)",
                              touchAction: "manipulation",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "flex-end",
                              gap: 10,
                              textAlign: "center",
                            }
                          : skin === "doors"
                          ? {
                              position: "relative",
                              minHeight: 168,
                              padding: "26px 24px 16px 12px",
                              borderRadius: "48px 48px 10px 10px",
                              border: "2.5px solid rgba(255, 209, 88, 0.6)",
                              background:
                                "linear-gradient(180deg, rgba(255,209,88,0.18) 0%, rgba(84,52,18,0.92) 100%)",
                              color: "#fff3d6",
                              fontSize: 14.5,
                              fontWeight: 800,
                              lineHeight: 1.35,
                              cursor: "pointer",
                              fontFamily: "inherit",
                              boxShadow: "0 16px 34px -18px rgba(255,209,88,0.85)",
                              touchAction: "manipulation",
                            }
                          : {
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
                            }
                      }
                    >
                      {skin === "doors" && (
                        <span
                          aria-hidden
                          style={{
                            position: "absolute",
                            right: 12,
                            top: "52%",
                            width: 9,
                            height: 9,
                            borderRadius: "50%",
                            background: "#ffd158",
                            boxShadow: "0 0 8px rgba(255,209,88,0.9)",
                          }}
                        />
                      )}
                      {skin === "balloons" && (
                        <span
                          aria-hidden
                          style={{
                            position: "absolute",
                            left: "50%",
                            bottom: -22,
                            width: 0,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          {/* knot + curling string — identical on every balloon */}
                          <span
                            style={{
                              width: 10,
                              height: 8,
                              marginLeft: -5,
                              borderRadius: "0 0 6px 6px",
                              background: "rgba(255,138,171,0.85)",
                            }}
                          />
                          <span
                            style={{
                              width: 2,
                              height: 16,
                              marginLeft: -1,
                              borderRadius: 2,
                              background: "rgba(255,227,240,0.55)",
                            }}
                          />
                        </span>
                      )}
                      {skin === "levers" && (
                        <span
                          aria-hidden
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            marginBottom: 2,
                          }}
                        >
                          {/* brass knob, shaft and base plate — identical on both levers */}
                          <span
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: "50%",
                              background: "radial-gradient(circle at 35% 30%, #ffe9b3, #d99a1f 72%)",
                              boxShadow: "0 0 12px rgba(255,209,88,0.65)",
                            }}
                          />
                          <span
                            style={{
                              width: 7,
                              height: 42,
                              borderRadius: 4,
                              background: "linear-gradient(180deg, #caa64a, #8a6a1f)",
                            }}
                          />
                          <span
                            style={{
                              width: 58,
                              height: 10,
                              borderRadius: 4,
                              background: "#6b521a",
                              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)",
                            }}
                          />
                        </span>
                      )}
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
          title={completeTitle ?? "Every reply a hero reply!"}
          stars={stars}
          statLines={[
            `${correctCount}/${rounds.length} ${scoreNoun ?? "safe replies"} first try`,
            completeLine ?? "Never meet. Never send. Tell a grown-up.",
          ]}
          onContinue={() => onComplete(correctCount)}
        />
      )}
    </ExerciseFrame>
  );
}
