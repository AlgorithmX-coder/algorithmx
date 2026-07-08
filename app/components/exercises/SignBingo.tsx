"use client";

/**
 * SignBingo — the bingo-card SELECT drill (Week 13).
 *
 * A 2×2 bingo card of body-signs sits on the board. One scene at a time
 * plays above it ("Maya blinks and blinks - her eyes feel like
 * sandpaper...") and the child taps the sign the scene is showing. A
 * right tap stamps that square; a wrong tap teaches gently and the same
 * scene replays. All four squares stamped → BINGO!
 *
 * Deliberately unlike buttonHunt (find controls among decoys) and
 * quickCheck recall (one question): this is a match-the-scene-to-the-
 * sign card that fills up square by square.
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

export interface BingoSign {
  id: string;
  /** Square label ("Dry, scratchy eyes"). */
  label: string;
  /** Emoji rendered via PixIcon on the square. */
  icon: string;
}

export interface BingoRound {
  id: string;
  /** The mini scene played above the card. */
  scene: string;
  /** Emoji badge on the scene card. */
  sceneIcon?: string;
  /** Which sign this scene shows. */
  signId: string;
  /** Teach copy on a wrong tap for this scene. */
  note: string;
}

export interface SignBingoProps {
  signs: BingoSign[];
  rounds: BingoRound[];
  /** Copy overrides (defaults keep the W13 body-bell skin). */
  introTitle?: string;
  introSubtitle?: string;
  introIcon?: string;
  cardTitle?: string;
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

export default function SignBingo({
  signs,
  rounds,
  introTitle,
  introSubtitle,
  introIcon,
  cardTitle,
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
}: SignBingoProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;

  const [showIntro, setShowIntro] = useState(true);
  const [roundIdx, setRoundIdx] = useState(0);
  const [stamped, setStamped] = useState<Set<string>>(new Set());
  const [wrongCount, setWrongCount] = useState(0);
  const [firstTryCount, setFirstTryCount] = useState(0);
  const [wrongOnCurrent, setWrongOnCurrent] = useState(false);
  const [wobbleId, setWobbleId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  const finished = roundIdx >= rounds.length;
  const round = rounds[roundIdx];

  const reportedTier = useRef(0);
  const reportTier = (n: number) => {
    const tier = n >= 2 ? 2 : n >= 1 ? 1 : 0;
    if (tier > reportedTier.current) {
      reportedTier.current = tier;
      onHintReached?.(tier as 1 | 2);
    }
  };

  const tap = (sign: BingoSign, idx: number) => {
    if (!round || showIntro || feedback || finished) return;
    setHasInteracted(true);
    // A square that's already stamped just wobbles - no penalty.
    if (stamped.has(sign.id)) {
      setWobbleId(sign.id);
      window.setTimeout(() => setWobbleId(null), 420);
      return;
    }
    onAnswered?.({
      questionKey: `bingo-${round.id}`,
      selectedIndex: idx,
      correctIndex: signs.findIndex((s) => s.id === round.signId),
      wasCorrect: sign.id === round.signId,
    });
    if (sign.id === round.signId) {
      audio.correct();
      fx.correct({ xp: 25, text: stampToast ?? "SIGN SPOTTED!" });
      onCorrect?.();
      if (!wrongOnCurrent) setFirstTryCount((n) => n + 1);
      setWrongOnCurrent(false);
      setStamped((prev) => new Set(prev).add(sign.id));
      setRoundIdx((i) => i + 1);
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
        title: wrongTitle ?? "Not that bell!",
        explanation: round.note,
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
          title={introTitle ?? "Break-Sign Bingo"}
          subtitle={introSubtitle ?? "Four scenes, four body-bells. Tap the sign each scene is showing and fill the card!"}
          icon={introIcon ?? "🔔"}
          narration={introNarration}
          character={introNarration?.speaker}
          onDismiss={() => setShowIntro(false)}
        />
      )}

      {/* Scene card */}
      {round && !finished && (
        <AnimatePresence mode="wait">
          <motion.div
            key={round.id}
            initial={reduce ? false : { y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? undefined : { y: -24, opacity: 0 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              maxWidth: 620,
              margin: "0 auto 14px",
              padding: "13px 16px",
              borderRadius: 14,
              background: "rgba(0,229,255,0.08)",
              border: "1px solid rgba(125,240,255,0.35)",
              color: "#dff6ff",
              fontSize: 15,
              fontWeight: 800,
              lineHeight: 1.4,
            }}
          >
            {round.sceneIcon && <PixIcon emoji={round.sceneIcon} size={34} />}
            <span style={{ flex: 1 }}>{round.scene}</span>
          </motion.div>
        </AnimatePresence>
      )}

      {/* The bingo card */}
      <div
        style={{
          maxWidth: 560,
          margin: "0 auto",
          padding: "14px 14px 16px",
          borderRadius: 18,
          background: "linear-gradient(180deg, #12305c 0%, #0c1e42 100%)",
          border: "2px solid rgba(126,255,151,0.4)",
          boxShadow: "0 18px 44px -22px rgba(0,0,0,0.8)",
        }}
      >
        <div style={{ textAlign: "center", fontSize: 12, fontWeight: 900, letterSpacing: "0.14em", color: "#7eff97", marginBottom: 10 }}>
          {cardTitle ?? "BREAK-SIGN BINGO"} · {stamped.size}/{signs.length}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 10 }}>
          {signs.map((s, i) => {
            const isStamped = stamped.has(s.id);
            return (
              <motion.button
                key={s.id}
                type="button"
                onClick={() => tap(s, i)}
                onPointerEnter={() => audio.hover()}
                disabled={!!feedback || finished}
                animate={wobbleId === s.id && !reduce ? { rotate: [0, -4, 4, -2, 0] } : { rotate: 0 }}
                whileHover={reduce || isStamped ? undefined : { y: -4 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  minHeight: 108,
                  padding: "14px 10px",
                  borderRadius: 14,
                  border: isStamped ? "2.5px solid #34d399" : "2px solid rgba(125,240,255,0.4)",
                  background: isStamped
                    ? "linear-gradient(165deg, rgba(52,211,153,0.28), rgba(9,40,32,0.9))"
                    : "linear-gradient(165deg, rgba(0,229,255,0.1), rgba(12,18,48,0.92))",
                  color: "#eaf9ff",
                  fontSize: 14,
                  fontWeight: 800,
                  lineHeight: 1.3,
                  fontFamily: "inherit",
                  cursor: isStamped ? "default" : "pointer",
                  boxShadow: isStamped ? "0 0 22px -6px rgba(52,211,153,0.8)" : "0 14px 30px -18px rgba(0,229,255,0.7)",
                  touchAction: "manipulation",
                }}
              >
                <PixIcon emoji={s.icon} size={34} />
                {s.label}
                {isStamped && (
                  <motion.div
                    initial={reduce ? false : { scale: 2, opacity: 0, rotate: -14 }}
                    animate={{ scale: 1, opacity: 1, rotate: -8 }}
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 8,
                      padding: "3px 8px",
                      borderRadius: 8,
                      background: "#34d399",
                      color: "#04180f",
                      fontSize: 11,
                      fontWeight: 900,
                      letterSpacing: "0.08em",
                    }}
                  >
                    ✓ SPOTTED
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
        {!finished && (
          <div style={{ textAlign: "center", marginTop: 10, fontSize: 12, fontWeight: 800, color: "#7d8cc9", letterSpacing: "0.1em" }}>
            SCENE {Math.min(roundIdx + 1, rounds.length)} OF {rounds.length}
          </div>
        )}
      </div>

      <div style={{ maxWidth: 560, margin: "8px auto 0" }}>
        {wrongCount === 1 && hints && <HintBubble tier={1} speaker="layla" text={hints.tier1} />}
        {wrongCount >= 2 && hints && <HintBubble tier={2} speaker="layla" text={hints.tier2} />}
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
          title={completeTitle ?? "BINGO! Full card!"}
          stars={stars}
          statLines={[
            `${firstTryCount}/${rounds.length} signs spotted first try`,
            completeLine ?? "Four body-bells learned - when one rings, it's break time.",
          ]}
          onContinue={() => onComplete(firstTryCount)}
        />
      )}
    </ExerciseFrame>
  );
}
