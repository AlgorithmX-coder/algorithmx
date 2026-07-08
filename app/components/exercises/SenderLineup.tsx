"use client";

/**
 * SenderLineup — the Lookalike Lineup (SELECT, Week 4).
 *
 * Four sender badges stand on podiums. Three are the real deal; one is a
 * lookalike imposter (a letter off, a suspicious address, a costume-shop
 * copy). Tap the imposter — its disguise falls off with an IMPOSTER!
 * stamp. Tap a real sender by mistake and it teaches why that one checks
 * out. One round per lineup. Practises fake-SENDER spotting only — link
 * mechanics live in Week 16.
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

export interface LineupSender {
  id: string;
  /** Display name on the badge (e.g. "Roblox" vs "Rob1ox"). */
  name: string;
  /** Small supporting detail line (e.g. the from-address). */
  detail: string;
  /** Emoji rendered via PixIcon as the badge crest. */
  icon: string;
  /** True = the lookalike imposter (exactly one per round). */
  isFake: boolean;
  /** Teach copy: why this one is fake / why it checks out. */
  note: string;
}

export interface LineupRound {
  id: string;
  /** The situation, e.g. "Four messages say your game needs an update…" */
  prompt: string;
  senders: LineupSender[];
}

export interface SenderLineupProps {
  rounds: LineupRound[];
  /** Copy overrides (re-theme per week; defaults keep the W4 sender skin). */
  introTitle?: string;
  introSubtitle?: string;
  introIcon?: string;
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

export default function SenderLineup({
  rounds,
  introTitle,
  introSubtitle,
  introIcon,
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
}: SenderLineupProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;

  const [showIntro, setShowIntro] = useState(true);
  const [idx, setIdx] = useState(0);
  const [busted, setBusted] = useState<string | null>(null); // imposter id once caught
  const [wrongCount, setWrongCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  const finished = idx >= rounds.length;
  const round = rounds[idx];

  useEffect(() => {
    setBusted(null);
  }, [idx]);

  const reportedTier = useRef(0);
  useEffect(() => {
    const tier = wrongCount >= 2 ? 2 : wrongCount >= 1 ? 1 : 0;
    if (tier > reportedTier.current) {
      reportedTier.current = tier;
      onHintReached?.(tier as 1 | 2);
    }
  }, [wrongCount, onHintReached]);

  const pick = (senderIdx: number) => {
    if (!round || busted || showIntro || feedback) return;
    setHasInteracted(true);
    const sender = round.senders[senderIdx];
    const correctIndex = round.senders.findIndex((s) => s.isFake);
    onAnswered?.({
      questionKey: `lineup-${round.id}`,
      selectedIndex: senderIdx,
      correctIndex,
      wasCorrect: sender.isFake,
    });
    if (sender.isFake) {
      audio.correct();
      fx.correct({ xp: 25, text: "IMPOSTER BUSTED!" });
      onCorrect?.();
      setCorrectCount((n) => n + 1);
      setBusted(sender.id);
      window.setTimeout(() => setIdx((i) => i + 1), reduce ? 800 : 1600);
    } else {
      audio.wrong();
      onWrong?.();
      setWrongCount((n) => n + 1);
      setFeedback({
        title: `${sender.name} is actually the real one`,
        explanation: sender.note,
        tip: hints?.tier1,
      });
    }
  };

  const stars = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1;

  return (
    <ExerciseFrame maxWidth={860} decor>
      {fx.layer()}

      {showIntro && (
        <ExerciseIntroBeat
          title={introTitle ?? "The Lookalike Lineup"}
          subtitle={introSubtitle ?? "One of these senders is wearing a disguise. Read carefully - then bust the imposter!"}
          icon={introIcon ?? "🕵️"}
          narration={introNarration}
          character={introNarration?.speaker}
          onDismiss={() => setShowIntro(false)}
        />
      )}

      {round && !finished && (
        <AnimatePresence mode="wait">
          <motion.div
            key={round.id}
            initial={reduce ? false : { x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={reduce ? undefined : { x: -40, opacity: 0 }}
          >
            {/* Situation prompt */}
            <div
              style={{
                textAlign: "center",
                maxWidth: 620,
                margin: "0 auto 20px",
                padding: "12px 18px",
                borderRadius: 14,
                background: "rgba(0,229,255,0.08)",
                border: "1px solid rgba(125,240,255,0.35)",
                color: "#dff6ff",
                fontSize: 16,
                fontWeight: 800,
                lineHeight: 1.4,
              }}
            >
              {round.prompt}
            </div>

            {/* The lineup */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0,1fr))",
                gap: 12,
                alignItems: "end",
              }}
            >
              {round.senders.map((s, i) => {
                const isBusted = busted === s.id;
                return (
                  <motion.button
                    key={s.id}
                    type="button"
                    onClick={() => pick(i)}
                    onPointerEnter={() => audio.hover()}
                    disabled={!!busted || !!feedback}
                    initial={reduce ? false : { y: 30, opacity: 0 }}
                    animate={
                      isBusted && !reduce
                        ? { y: 0, opacity: 1, rotate: [0, -4, 4, -2, 0] }
                        : { y: 0, opacity: 1 }
                    }
                    transition={{ delay: reduce ? 0 : 0.07 * i, type: "spring", stiffness: 260, damping: 20 }}
                    whileHover={reduce || busted ? undefined : { y: -6 }}
                    whileTap={busted ? undefined : { scale: 0.96 }}
                    style={{
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 8,
                      padding: "18px 10px 14px",
                      borderRadius: 16,
                      border: `2px solid ${isBusted ? "#ff5fb3" : "rgba(125,240,255,0.4)"}`,
                      background: isBusted
                        ? "linear-gradient(165deg, rgba(255,95,179,0.2), rgba(30,8,26,0.92))"
                        : "linear-gradient(165deg, rgba(0,229,255,0.1), rgba(12,18,48,0.92))",
                      color: "#eaf9ff",
                      cursor: busted ? "default" : "pointer",
                      fontFamily: "inherit",
                      minHeight: 168,
                      boxShadow: isBusted
                        ? "0 0 34px -4px rgba(255,95,179,0.7)"
                        : "0 14px 30px -18px rgba(0,229,255,0.7)",
                      touchAction: "manipulation",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        padding: 9,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.08)",
                        border: "1.5px solid rgba(255,255,255,0.2)",
                      }}
                    >
                      <PixIcon emoji={s.icon} size={34} />
                    </span>
                    <span style={{ fontSize: 15.5, fontWeight: 900, letterSpacing: "0.01em" }}>{s.name}</span>
                    <span
                      style={{
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: "#9fb1ff",
                        lineHeight: 1.3,
                        wordBreak: "break-all",
                      }}
                    >
                      {s.detail}
                    </span>
                    {/* podium base */}
                    <span
                      aria-hidden
                      style={{
                        marginTop: "auto",
                        width: "70%",
                        height: 8,
                        borderRadius: 4,
                        background: "rgba(125,240,255,0.18)",
                      }}
                    />
                    {isBusted && (
                      <motion.span
                        initial={reduce ? false : { scale: 1.7, opacity: 0, rotate: -12 }}
                        animate={{ scale: 1, opacity: 1, rotate: -8 }}
                        style={{
                          position: "absolute",
                          top: "38%",
                          padding: "5px 12px",
                          borderRadius: 10,
                          fontSize: 15,
                          fontWeight: 900,
                          letterSpacing: "0.06em",
                          background: "rgba(60,8,32,0.92)",
                          border: "2.5px solid #ff5fb3",
                          color: "#ff9bcb",
                        }}
                      >
                        IMPOSTER! 🎭
                      </motion.span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            <div
              style={{
                textAlign: "center",
                marginTop: 14,
                fontSize: 12,
                fontWeight: 800,
                color: "#7d8cc9",
                letterSpacing: "0.1em",
              }}
            >
              LINEUP {Math.min(idx + 1, rounds.length)} OF {rounds.length}
            </div>

            <div style={{ maxWidth: 560, margin: "8px auto 0" }}>
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
          title={completeTitle ?? "Every imposter busted!"}
          stars={stars}
          statLines={[
            `${correctCount}/${rounds.length} lineups solved first try`,
            completeLine ?? "Real senders cleared, lookalikes exposed.",
          ]}
          onContinue={() => onComplete(correctCount)}
        />
      )}
    </ExerciseFrame>
  );
}
