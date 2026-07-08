"use client";

/**
 * PasscodeForge — the lock-forging BUILD drill (Week 18).
 *
 * An anvil, a code bar with empty slots, and a GUESS-O-METER. One slot
 * at a time, three glowing metal blanks are offered — each stamped with
 * a digit pair and the little story a guesser would read off it ("starts
 * 1-2-3-4!", "your birth year — the family knows it"). Hammer the blank
 * with nothing to guess: CLANG, the pair stamps into the code bar and
 * the meter climbs. Forge every slot → the padlock clicks shut.
 *
 * Deliberately NOT a W1 password re-teach: the lesson is HAVING a lock
 * on a device, and not making its code guessable. Distinct from
 * usernameBuilder (category slot picks) and dayBalancer (swap-to-level):
 * sequential forging with a quality meter and a physical strike beat.
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

export interface ForgeOption {
  /** The digit pair stamped on the metal blank, e.g. "58". */
  digits: string;
  /** The kid-readable tell under the digits (what a guesser would see). */
  tell: string;
  /** True = nothing to guess; exactly one per round. */
  isStrong: boolean;
  /** Shown in the WrongAnswerPanel when a guessable blank is hammered. */
  explanation: string;
}

export interface ForgeRound {
  id: string;
  /** Round prompt, e.g. "Forge the FIRST pair". */
  prompt: string;
  /** 3 metal blanks; exactly one isStrong. */
  options: ForgeOption[];
}

export interface PasscodeForgeProps {
  rounds: ForgeRound[];
  introTitle?: string;
  introSubtitle?: string;
  introIcon?: string;
  /** Label over the quality meter (default GUESS-O-METER). */
  meterLabel?: string;
  strikeToast?: string;
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

export default function PasscodeForge({
  rounds,
  introTitle,
  introSubtitle,
  introIcon,
  meterLabel,
  strikeToast,
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
}: PasscodeForgeProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;

  const [showIntro, setShowIntro] = useState(true);
  const [idx, setIdx] = useState(0);
  const [forged, setForged] = useState<string[]>([]);
  const [wrongCount, setWrongCount] = useState(0);
  const [firstTryCount, setFirstTryCount] = useState(0);
  const [roundClean, setRoundClean] = useState(true);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  const finished = idx >= rounds.length;
  const round = rounds[idx];

  useEffect(() => {
    setRoundClean(true);
  }, [idx]);

  const reportedTier = useRef(0);
  useEffect(() => {
    const tier = wrongCount >= 2 ? 2 : wrongCount >= 1 ? 1 : 0;
    if (tier > reportedTier.current) {
      reportedTier.current = tier;
      onHintReached?.(tier as 1 | 2);
    }
  }, [wrongCount, onHintReached]);

  const strike = (i: number) => {
    if (!round || showIntro || finished) return;
    setHasInteracted(true);
    const option = round.options[i];
    const correctIndex = round.options.findIndex((o) => o.isStrong);
    onAnswered?.({
      questionKey: `forge-${round.id}`,
      selectedIndex: i,
      correctIndex,
      wasCorrect: option.isStrong,
    });
    if (option.isStrong) {
      audio.correct();
      fx.correct({ xp: 25, text: strikeToast ?? "CLANG! GUESS-PROOF!" });
      onCorrect?.();
      if (roundClean) setFirstTryCount((n) => n + 1);
      setForged((f) => [...f, option.digits]);
      window.setTimeout(() => setIdx((n) => n + 1), reduce ? 500 : 1000);
    } else {
      audio.wrong();
      onWrong?.();
      setRoundClean(false);
      setWrongCount((n) => n + 1);
      setFeedback({
        title: wrongTitle ?? "A guesser would crack that one!",
        explanation: option.explanation,
        tip: hints?.tier1,
      });
    }
  };

  const stars = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1;

  return (
    <ExerciseFrame maxWidth={760} decor>
      {fx.layer()}

      {showIntro && (
        <ExerciseIntroBeat
          title={introTitle ?? "The Passcode Forge"}
          subtitle={introSubtitle ?? "Hammer a lock code onto the tablet - pick the metal with NOTHING for a guesser to read."}
          icon={introIcon ?? "🔨"}
          narration={introNarration}
          character={introNarration?.speaker}
          onDismiss={() => setShowIntro(false)}
        />
      )}

      {/* Code bar: one slot per round */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <PixIcon emoji={finished ? "🔒" : "🔓"} size={30} />
        {rounds.map((r, i) => {
          const done = i < forged.length;
          return (
            <motion.div
              key={r.id}
              animate={done && !reduce && i === forged.length - 1 ? { scale: [1.25, 1] } : {}}
              style={{
                minWidth: 72,
                padding: "10px 0",
                textAlign: "center",
                borderRadius: 12,
                border: done ? "2.5px solid #ffd158" : "2.5px dashed rgba(125,140,201,0.5)",
                background: done
                  ? "linear-gradient(180deg, rgba(255,209,88,0.22), rgba(64,44,10,0.9))"
                  : "rgba(20,16,40,0.6)",
                color: done ? "#ffe9b0" : "#7d8cc9",
                fontSize: 22,
                fontWeight: 900,
                letterSpacing: "0.14em",
                boxShadow: done ? "0 0 20px -6px rgba(255,209,88,0.8)" : "none",
              }}
            >
              {done ? forged[i] : "· ·"}
            </motion.div>
          );
        })}
      </div>

      {/* Guess-o-meter */}
      <div style={{ maxWidth: 420, margin: "0 auto 16px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: "0.12em",
            color: "#7d8cc9",
            marginBottom: 4,
          }}
        >
          <span>{meterLabel ?? "GUESS-O-METER"}</span>
          <span style={{ color: forged.length >= rounds.length ? "#7eff97" : "#ffd158" }}>
            {forged.length >= rounds.length ? "GUESS-PROOF!" : `${forged.length}/${rounds.length} FORGED`}
          </span>
        </div>
        <div
          style={{
            height: 12,
            borderRadius: 999,
            background: "rgba(20,16,40,0.8)",
            border: "1px solid rgba(125,140,201,0.4)",
            overflow: "hidden",
          }}
        >
          <motion.div
            animate={{ width: `${(forged.length / rounds.length) * 100}%` }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 20 }}
            style={{
              height: "100%",
              borderRadius: 999,
              background: "linear-gradient(90deg, #ffd158, #7eff97)",
              boxShadow: "0 0 14px rgba(255,209,88,0.7)",
            }}
          />
        </div>
      </div>

      {/* The anvil: current round's metal blanks */}
      {round && (
        <AnimatePresence mode="wait">
          <motion.div
            key={round.id}
            initial={reduce ? false : { y: 26, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? undefined : { y: -26, opacity: 0 }}
          >
            <div
              style={{
                textAlign: "center",
                fontSize: 13,
                fontWeight: 900,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#ffe9b0",
                marginBottom: 12,
              }}
            >
              🔨 {round.prompt} · {Math.min(idx + 1, rounds.length)} of {rounds.length}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${round.options.length}, minmax(0,1fr))`,
                gap: 12,
                maxWidth: 620,
                margin: "0 auto",
              }}
            >
              {round.options.map((o, i) => (
                <motion.button
                  key={`${round.id}-${o.digits}`}
                  type="button"
                  onClick={() => strike(i)}
                  onPointerEnter={() => audio.hover()}
                  initial={reduce ? false : { y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: reduce ? 0 : 0.07 * i, type: "spring", stiffness: 260, damping: 20 }}
                  whileHover={reduce ? undefined : { y: -4, scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    minHeight: 128,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "14px 10px",
                    borderRadius: 14,
                    // raw metal blank fresh off the fire
                    border: "2.5px solid rgba(255,169,88,0.55)",
                    background: "linear-gradient(180deg, rgba(84,52,20,0.94), rgba(38,22,8,0.96))",
                    color: "#ffe9b0",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    boxShadow: "0 14px 30px -18px rgba(255,169,88,0.8)",
                    touchAction: "manipulation",
                  }}
                >
                  <span style={{ fontSize: 30, fontWeight: 900, letterSpacing: "0.2em" }}>{o.digits}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 800, lineHeight: 1.35, color: "#e8c99a", textAlign: "center" }}>
                    {o.tell}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      <div style={{ maxWidth: 560, margin: "10px auto 0" }}>
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
          title={completeTitle ?? "The lock clicks shut!"}
          stars={stars}
          statLines={[
            `Code forged: ${forged.join(" · ")} — ${firstTryCount}/${rounds.length} clean strikes`,
            completeLine ?? "A device with a front door - and a code nobody can stumble into.",
          ]}
          onContinue={() => onComplete(forged.length)}
        />
      )}
    </ExerciseFrame>
  );
}
