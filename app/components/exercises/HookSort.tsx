"use client";

/**
 * HookSort — the Fishing Dock (binary SORT, Week 4).
 *
 * One message at a time dangles on a fishing line over the water. The
 * child makes the call with two big buttons: REEL IN (it's real — the
 * line winds up and the message lands safely in the keep-net) or CUT THE
 * LINE (it's a scam — snip! the bait drops into the deep). Wrong calls
 * pause and teach via WrongAnswerPanel. No timer, one catch in play —
 * deliberately the calm, deliberate opposite of the conveyor machine
 * (W3) and the drift-tap scanner (W1).
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
import GameButton from "@/app/components/lesson/GameButton";
import PixIcon from "@/app/components/lesson/PixIcon";

export interface HookItem {
  id: string;
  text: string;
  /** Emoji rendered via PixIcon on the dangling card. */
  icon?: string;
  /** True = a scam — the right call is CUT THE LINE. */
  isScam: boolean;
  /** Shown in the WrongAnswerPanel on a wrong call. */
  explanation: string;
}

export interface HookSortProps {
  items: HookItem[];
  /** Copy overrides (re-theme per week; defaults keep the W4 dock skin). */
  introTitle?: string;
  introSubtitle?: string;
  introIcon?: string;
  reelLabel?: string;
  cutLabel?: string;
  reelToast?: string;
  cutToast?: string;
  wrongScamTitle?: string;
  wrongRealTitle?: string;
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

export default function HookSort({
  items,
  introTitle,
  introSubtitle,
  introIcon,
  reelLabel,
  cutLabel,
  reelToast,
  cutToast,
  wrongScamTitle,
  wrongRealTitle,
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
}: HookSortProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;

  const [showIntro, setShowIntro] = useState(true);
  const [idx, setIdx] = useState(0);
  // null = dangling; "reeled" = wound up into the net; "cut" = dropped
  const [resolved, setResolved] = useState<null | "reeled" | "cut">(null);
  const [wrongCount, setWrongCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  const finished = idx >= items.length;
  const item = items[idx];

  useEffect(() => {
    setResolved(null);
  }, [idx]);

  const reportedTier = useRef(0);
  useEffect(() => {
    const tier = wrongCount >= 2 ? 2 : wrongCount >= 1 ? 1 : 0;
    if (tier > reportedTier.current) {
      reportedTier.current = tier;
      onHintReached?.(tier as 1 | 2);
    }
  }, [wrongCount, onHintReached]);

  const call = (cut: boolean) => {
    if (!item || resolved || showIntro || feedback) return;
    setHasInteracted(true);
    const wasCorrect = cut === item.isScam;
    onAnswered?.({
      questionKey: `hook-${item.id}`,
      selectedIndex: cut ? 1 : 0,
      correctIndex: item.isScam ? 1 : 0,
      wasCorrect,
    });
    if (wasCorrect) {
      audio.correct();
      fx.correct({ xp: 25, text: cut ? (cutToast ?? "SCAM CUT LOOSE!") : (reelToast ?? "REAL - REELED IN!") });
      onCorrect?.();
      setCorrectCount((n) => n + 1);
      setResolved(cut ? "cut" : "reeled");
      window.setTimeout(() => setIdx((i) => i + 1), reduce ? 700 : 1400);
    } else {
      audio.wrong();
      onWrong?.();
      setWrongCount((n) => n + 1);
      setFeedback({
        title: item.isScam ? (wrongScamTitle ?? "Careful - that one was a SCAM") : (wrongRealTitle ?? "Wait - that one was real!"),
        explanation: item.explanation,
        tip: hints?.tier1,
      });
    }
  };

  const stars = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1;

  return (
    <ExerciseFrame
      maxWidth={760}
      background="linear-gradient(180deg, #0a1230 0%, #0a1f4d 55%, #06355c 100%)"
      style={{ position: "relative", overflow: "hidden" }}
    >
      {fx.layer()}

      {/* Water at the bottom of the scene */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 110,
          background: "linear-gradient(180deg, rgba(0,180,255,0.16) 0%, rgba(0,90,170,0.4) 100%)",
          borderTop: "2px solid rgba(125,240,255,0.35)",
        }}
      />

      {showIntro && (
        <ExerciseIntroBeat
          title={introTitle ?? "The Fishing Dock"}
          subtitle={introSubtitle ?? "Messages are on the lines. Reel in the real ones - cut the scams loose!"}
          icon={introIcon ?? "🪤"}
          narration={introNarration}
          character={introNarration?.speaker}
          onDismiss={() => setShowIntro(false)}
        />
      )}

      {item && !finished && (
        <div style={{ position: "relative", zIndex: 2, minHeight: 430 }}>
          {/* Rod + line + dangling message */}
          <AnimatePresence mode="wait">
            <motion.div
              key={item.id}
              initial={reduce ? false : { y: -220, opacity: 0 }}
              animate={
                resolved === "reeled"
                  ? { y: -240, opacity: 0 }
                  : resolved === "cut"
                    ? { y: 260, opacity: 0, rotate: 8 }
                    : { y: 0, opacity: 1 }
              }
              exit={reduce ? undefined : { opacity: 0 }}
              transition={
                resolved
                  ? { duration: reduce ? 0.3 : 0.8, ease: "easeIn" }
                  : { type: "spring", stiffness: 140, damping: 18 }
              }
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                paddingTop: 6,
              }}
            >
              {/* the line */}
              <div
                aria-hidden
                style={{
                  width: 2,
                  height: 84,
                  background: "linear-gradient(180deg, rgba(255,255,255,0.5), rgba(255,255,255,0.15))",
                }}
              />
              {/* the hook card */}
              <motion.div
                animate={reduce || resolved ? {} : { rotate: [-1.4, 1.4, -1.4] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  maxWidth: 470,
                  padding: "16px 20px",
                  borderRadius: 16,
                  background: "linear-gradient(165deg, #fff8e8 0%, #ffe9bd 100%)",
                  border: "2px solid #d9a83c",
                  boxShadow: "0 18px 40px -18px rgba(0,0,0,0.75)",
                  color: "#4a3208",
                  fontSize: 17,
                  fontWeight: 800,
                  lineHeight: 1.4,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                {item.icon && <PixIcon emoji={item.icon} size={34} />}
                <span>{item.text}</span>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Call buttons */}
          <div
            style={{
              display: "flex",
              gap: 14,
              justifyContent: "center",
              marginTop: 26,
              position: "relative",
              zIndex: 3,
            }}
          >
            <GameButton
              variant="success"
              size="lg"
              disabled={!!resolved || !!feedback}
              onClick={() => call(false)}
            >
              {reelLabel ?? "🎣 REEL IN - it's real"}
            </GameButton>
            <GameButton
              variant="danger"
              size="lg"
              disabled={!!resolved || !!feedback}
              onClick={() => call(true)}
            >
              {cutLabel ?? "✂️ CUT THE LINE - scam!"}
            </GameButton>
          </div>

          <div
            style={{
              textAlign: "center",
              marginTop: 12,
              fontSize: 12,
              fontWeight: 800,
              color: "#7d9cc9",
              letterSpacing: "0.1em",
            }}
          >
            CATCH {Math.min(idx + 1, items.length)} OF {items.length} ·{" "}
            {correctCount} sorted right
          </div>

          <div style={{ maxWidth: 560, margin: "10px auto 0" }}>
            {wrongCount === 1 && hints && <HintBubble tier={1} speaker="adam" text={hints.tier1} />}
            {wrongCount >= 2 && hints && <HintBubble tier={2} speaker="adam" text={hints.tier2} />}
          </div>
        </div>
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
          title={completeTitle ?? "The dock is clear!"}
          stars={stars}
          statLines={[
            `${correctCount}/${items.length} calls right first try`,
            completeLine ?? "Real ones reeled in, scams cut loose.",
          ]}
          onContinue={() => onComplete(correctCount)}
        />
      )}
    </ExerciseFrame>
  );
}
