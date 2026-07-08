"use client";

/**
 * PlaquePeek — the address-peephole INSPECT drill (Week 16).
 *
 * One link-door at a time floats in wearing a shiny plaque that CLAIMS a
 * destination. The child must lift the plaque (a mandatory, penalty-free
 * peek) to reveal the real address underneath, then make the call: does
 * the door go where it says, or is it a sneaky door? Wrong calls teach
 * gently and allow another go.
 *
 * The forced peek is the lesson: you can't judge a door by its paint —
 * you judge it by the address under the plaque. Distinct from clueBoard
 * (many clues, one verdict) and the inspectors (zones on one artefact):
 * this is a two-step lift-then-judge rhythm repeated per door.
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

export interface PeekDoor {
  id: string;
  /** The shiny plaque's claim, e.g. "FREE GAME COINS!" */
  claim: string;
  /** Emoji rendered via PixIcon on the plaque. */
  icon: string;
  /** The real address revealed under the plaque. */
  address: string;
  /** True = the address matches the claim (an honest door). */
  matches: boolean;
  /** Teach copy shown on a wrong verdict for this door. */
  note: string;
}

export interface PlaquePeekProps {
  doors: PeekDoor[];
  /** Copy overrides (defaults keep the W16 doorway skin). */
  introTitle?: string;
  introSubtitle?: string;
  introIcon?: string;
  /** Pulsing label on the unlifted plaque. */
  peekPrompt?: string;
  matchLabel?: string;
  sneakyLabel?: string;
  matchToast?: string;
  sneakyToast?: string;
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

export default function PlaquePeek({
  doors,
  introTitle,
  introSubtitle,
  introIcon,
  peekPrompt,
  matchLabel,
  sneakyLabel,
  matchToast,
  sneakyToast,
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
}: PlaquePeekProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;

  const [showIntro, setShowIntro] = useState(true);
  const [doorIdx, setDoorIdx] = useState(0);
  const [peeked, setPeeked] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);
  const [firstTryCount, setFirstTryCount] = useState(0);
  const [wrongOnCurrent, setWrongOnCurrent] = useState(false);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  const finished = doorIdx >= doors.length;
  const door = doors[doorIdx];

  const reportedTier = useRef(0);
  const reportTier = (n: number) => {
    const tier = n >= 2 ? 2 : n >= 1 ? 1 : 0;
    if (tier > reportedTier.current) {
      reportedTier.current = tier;
      onHintReached?.(tier as 1 | 2);
    }
  };

  const lift = () => {
    if (!door || showIntro || peeked || finished) return;
    setHasInteracted(true);
    audio.hover();
    setPeeked(true);
  };

  // verdictIdx: 0 = "goes where it says", 1 = "sneaky door"
  const call = (verdictIdx: number) => {
    if (!door || !peeked || feedback || finished) return;
    const wasCorrect = (verdictIdx === 0) === door.matches;
    onAnswered?.({
      questionKey: `door-${door.id}`,
      selectedIndex: verdictIdx,
      correctIndex: door.matches ? 0 : 1,
      wasCorrect,
    });
    if (wasCorrect) {
      audio.correct();
      fx.correct({
        xp: 25,
        text: door.matches ? (matchToast ?? "HONEST DOOR!") : (sneakyToast ?? "SNEAKY DOOR CAUGHT!"),
      });
      onCorrect?.();
      if (!wrongOnCurrent) setFirstTryCount((n) => n + 1);
      setWrongOnCurrent(false);
      setPeeked(false);
      setDoorIdx((i) => i + 1);
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
        title: wrongTitle ?? "Read the plaque again!",
        explanation: door.note,
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
          title={introTitle ?? "The Address Peephole"}
          subtitle={introSubtitle ?? "Every door wears a shiny sign - but the truth lives on the little plaque underneath. Lift it, read it, make the call."}
          icon={introIcon ?? "🚪"}
          narration={introNarration}
          character={introNarration?.speaker}
          onDismiss={() => setShowIntro(false)}
        />
      )}

      {/* Corridor progress */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 14 }}>
        {doors.map((d, i) => (
          <div
            key={d.id}
            style={{
              width: 26,
              height: 34,
              borderRadius: "10px 10px 4px 4px",
              border: i < doorIdx ? "2px solid #ffd158" : i === doorIdx ? "2px dashed #c084fc" : "2px dashed rgba(125,140,201,0.4)",
              background: i < doorIdx ? "linear-gradient(180deg, #ffe9ad, #e8a413)" : "rgba(255,255,255,0.05)",
              boxShadow: i < doorIdx ? "0 0 14px -2px rgba(255,209,88,0.8)" : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 900,
              color: i === doorIdx ? "#c084fc" : "rgba(125,140,201,0.7)",
            }}
          >
            {i < doorIdx ? "✓" : i + 1}
          </div>
        ))}
      </div>

      {door && !finished && (
        <AnimatePresence mode="wait">
          <motion.div
            key={door.id}
            initial={reduce ? false : { x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={reduce ? undefined : { x: -40, opacity: 0 }}
          >
            {/* The door */}
            <div
              style={{
                maxWidth: 460,
                margin: "0 auto",
                padding: "22px 20px 18px",
                borderRadius: "26px 26px 14px 14px",
                background: "linear-gradient(180deg, #2b1d55 0%, #3d2a6e 55%, #2b1d55 100%)",
                border: "2.5px solid rgba(192,132,252,0.55)",
                boxShadow: "0 22px 48px -20px rgba(192,132,252,0.65)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 14,
                position: "relative",
              }}
            >
              {/* doorknob */}
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  right: 16,
                  top: "48%",
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: "linear-gradient(145deg, #ffe9ad, #e8a413)",
                  boxShadow: "0 0 10px rgba(255,209,88,0.7)",
                }}
              />

              {/* The shiny sign (the claim) */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 18px",
                  borderRadius: 12,
                  background: "linear-gradient(165deg, rgba(255,209,88,0.2), rgba(255,209,88,0.08))",
                  border: "1.5px solid rgba(255,209,88,0.5)",
                  color: "#ffe9ad",
                  fontSize: 16.5,
                  fontWeight: 900,
                  textAlign: "center",
                  lineHeight: 1.3,
                }}
              >
                <PixIcon emoji={door.icon} size={30} />
                {door.claim}
              </div>

              {/* The plaque / peephole */}
              {!peeked ? (
                <motion.button
                  type="button"
                  onClick={lift}
                  onPointerEnter={() => audio.hover()}
                  animate={reduce ? undefined : { y: [0, -3, 0] }}
                  transition={reduce ? undefined : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: 12,
                    border: "2px dashed rgba(125,240,255,0.55)",
                    background: "rgba(0,229,255,0.08)",
                    color: "#7df0ff",
                    fontSize: 13.5,
                    fontWeight: 900,
                    letterSpacing: "0.08em",
                    fontFamily: "inherit",
                    cursor: "pointer",
                    touchAction: "manipulation",
                  }}
                >
                  👆 {peekPrompt ?? "LIFT THE PLAQUE - READ THE REAL ADDRESS"}
                </motion.button>
              ) : (
                <motion.div
                  initial={reduce ? false : { rotateX: -80, opacity: 0 }}
                  animate={{ rotateX: 0, opacity: 1 }}
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 160, damping: 18 }}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 12,
                    background: "linear-gradient(180deg, #f5f9ff, #dde9fb)",
                    border: "2px solid rgba(125,240,255,0.6)",
                    color: "#1e2a52",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 10.5, fontWeight: 900, letterSpacing: "0.14em", color: "#5a6da8", marginBottom: 4 }}>
                    THE REAL ADDRESS
                  </div>
                  <div style={{ fontSize: 15.5, fontWeight: 900, lineHeight: 1.35, overflowWrap: "anywhere" }}>
                    {door.address}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Verdict buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 12, maxWidth: 560, margin: "16px auto 0" }}>
              <motion.button
                type="button"
                onClick={() => call(0)}
                onPointerEnter={() => audio.hover()}
                disabled={!peeked || !!feedback}
                whileHover={reduce || !peeked ? undefined : { y: -3 }}
                whileTap={peeked ? { scale: 0.96 } : undefined}
                style={{
                  padding: "16px 12px",
                  borderRadius: 14,
                  border: "2px solid rgba(126,255,151,0.55)",
                  background: peeked ? "linear-gradient(165deg, rgba(126,255,151,0.14), rgba(12,18,48,0.92))" : "rgba(255,255,255,0.04)",
                  color: peeked ? "#b9ffc9" : "rgba(185,255,201,0.35)",
                  fontSize: 14.5,
                  fontWeight: 900,
                  fontFamily: "inherit",
                  cursor: peeked ? "pointer" : "not-allowed",
                  touchAction: "manipulation",
                }}
              >
                ✅ {matchLabel ?? "GOES WHERE IT SAYS"}
              </motion.button>
              <motion.button
                type="button"
                onClick={() => call(1)}
                onPointerEnter={() => audio.hover()}
                disabled={!peeked || !!feedback}
                whileHover={reduce || !peeked ? undefined : { y: -3 }}
                whileTap={peeked ? { scale: 0.96 } : undefined}
                style={{
                  padding: "16px 12px",
                  borderRadius: 14,
                  border: "2px solid rgba(255,95,179,0.55)",
                  background: peeked ? "linear-gradient(165deg, rgba(255,95,179,0.14), rgba(12,18,48,0.92))" : "rgba(255,255,255,0.04)",
                  color: peeked ? "#ffc9e3" : "rgba(255,201,227,0.35)",
                  fontSize: 14.5,
                  fontWeight: 900,
                  fontFamily: "inherit",
                  cursor: peeked ? "pointer" : "not-allowed",
                  touchAction: "manipulation",
                }}
              >
                🚫 {sneakyLabel ?? "SNEAKY DOOR!"}
              </motion.button>
            </div>

            <div style={{ textAlign: "center", marginTop: 12, fontSize: 12, fontWeight: 800, color: "#7d8cc9", letterSpacing: "0.1em" }}>
              DOOR {Math.min(doorIdx + 1, doors.length)} OF {doors.length}
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
          title={completeTitle ?? "Every plaque peeked!"}
          stars={stars}
          statLines={[
            `${firstTryCount}/${doors.length} doors called right first try`,
            completeLine ?? "You never judged a door by its paint - only by its address.",
          ]}
          onContinue={() => onComplete(firstTryCount)}
        />
      )}
    </ExerciseFrame>
  );
}
