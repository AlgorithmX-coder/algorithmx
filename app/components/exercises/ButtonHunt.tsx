"use client";

/**
 * ButtonHunt — the find-the-button drill (FIND, Week 6+).
 *
 * A realistic app/game menu mock full of buttons. The child must find
 * and tap the TARGET controls in order (e.g. Report, then Block).
 * Tapping a decoy teaches gently what that button does instead. Each
 * found target stamps with confetti; all found → the menu seals.
 *
 * The muscle-memory drill for "every game has these buttons - here's
 * where they live". Re-themable per week: W6 game lobby, W10 video
 * player escape, W11 chat block, W14 device mute, W18 log-out.
 */

import { useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { useGameAudio } from "@/app/lib/gameEngine/useGameAudio";
import { useExerciseFeedback } from "@/app/lib/gameEngine/useExerciseFeedback";
import { useMotionIntensity } from "@/app/lib/gameEngine/useMotionIntensity";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import ExerciseIntroBeat, { ExerciseCompleteBeat } from "@/app/components/lesson/ExerciseBeats";
import CoachCaption from "@/app/components/lesson/CoachCaption";
import WrongAnswerPanel from "@/app/components/lesson/WrongAnswerPanel";
import HintBubble from "@/app/components/lesson/HintBubble";
import PixIcon from "@/app/components/lesson/PixIcon";

export interface HuntButton {
  id: string;
  label: string;
  /** Emoji rendered via PixIcon on the button. */
  icon: string;
  /** Position in the find-order (1-based). Omit/0 = decoy. */
  targetOrder?: number;
  /** Decoys: gentle teach copy about what this button really does.
   *  Targets: the celebration line when found. */
  note: string;
}

export interface ButtonHuntProps {
  /** Menu title (e.g. "Mega Blasters — Player Menu"). */
  menuTitle: string;
  /** The situation line above the menu (e.g. "This player is being mean."). */
  scenario: string;
  buttons: HuntButton[];
  introTitle: string;
  introSubtitle?: string;
  introIcon?: string;
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

export default function ButtonHunt({
  menuTitle,
  scenario,
  buttons,
  introTitle,
  introSubtitle,
  introIcon = "🔍",
  hints,
  introNarration,
  coachLines,
  onComplete,
  onCorrect,
  onWrong,
  onHintReached,
  onAnswered,
}: ButtonHuntProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;

  const [showIntro, setShowIntro] = useState(true);
  const [foundCount, setFoundCount] = useState(0);
  const [foundIds, setFoundIds] = useState<Set<string>>(new Set());
  const [wrongCount, setWrongCount] = useState(0);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [finished, setFinished] = useState(false);

  const targets = useMemo(
    () => buttons.filter((b) => (b.targetOrder ?? 0) > 0).sort((a, b) => (a.targetOrder! - b.targetOrder!)),
    [buttons],
  );
  const nextTarget = targets[foundCount];

  const reportedTier = useRef(0);
  const reportTier = (n: number) => {
    const tier = n >= 2 ? 2 : n >= 1 ? 1 : 0;
    if (tier > reportedTier.current) {
      reportedTier.current = tier;
      onHintReached?.(tier as 1 | 2);
    }
  };

  const tap = (btn: HuntButton, idx: number) => {
    if (showIntro || finished || foundIds.has(btn.id)) return;
    setHasInteracted(true);
    const wasCorrect = nextTarget?.id === btn.id;
    onAnswered?.({
      questionKey: `hunt-${btn.id}`,
      selectedIndex: idx,
      correctIndex: buttons.findIndex((b) => b.id === nextTarget?.id),
      wasCorrect,
    });
    if (wasCorrect) {
      audio.correct();
      fx.correct({ xp: 25, text: `${btn.label.toUpperCase()} — FOUND!` });
      onCorrect?.();
      const nextIds = new Set(foundIds);
      nextIds.add(btn.id);
      setFoundIds(nextIds);
      const n = foundCount + 1;
      setFoundCount(n);
      if (n >= targets.length) {
        window.setTimeout(() => setFinished(true), reduce ? 500 : 1200);
      }
    } else {
      audio.wrong();
      onWrong?.();
      setWrongCount((c) => {
        const v = c + 1;
        reportTier(v);
        return v;
      });
      setFeedback({
        title: (btn.targetOrder ?? 0) > 0 ? "Right button - wrong moment!" : `That's the ${btn.label} button`,
        explanation: btn.note,
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
          title={introTitle}
          subtitle={introSubtitle}
          icon={introIcon}
          narration={introNarration}
          character={introNarration?.speaker}
          onDismiss={() => setShowIntro(false)}
        />
      )}

      {/* scenario line */}
      <div
        style={{
          textAlign: "center",
          maxWidth: 600,
          margin: "0 auto 14px",
          padding: "10px 16px",
          borderRadius: 14,
          background: "rgba(255,209,88,0.08)",
          border: "1px solid rgba(255,209,88,0.35)",
          color: "#ffe9b0",
          fontSize: 15,
          fontWeight: 800,
          lineHeight: 1.4,
        }}
      >
        {scenario}{" "}
        {nextTarget && !finished && (
          <span style={{ color: "#7df0ff" }}>Find: {nextTarget.label}!</span>
        )}
      </div>

      {/* menu mock */}
      <div
        style={{
          borderRadius: 18,
          overflow: "hidden",
          border: "2px solid rgba(122,140,255,0.4)",
          boxShadow: "0 18px 44px -22px rgba(0,0,0,0.8)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 16px",
            background: "linear-gradient(135deg, #234a3a 0%, #1a2c50 100%)",
          }}
        >
          <PixIcon emoji="🎮" size={24} />
          <div style={{ fontSize: 16, fontWeight: 900, color: "#fff7e6" }}>{menuTitle}</div>
          <span
            style={{
              marginLeft: "auto",
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: "0.07em",
              color: "#9fb1ff",
              padding: "3px 9px",
              borderRadius: 999,
              border: "1px solid rgba(159,177,255,0.4)",
            }}
          >
            {foundCount}/{targets.length} FOUND
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0,1fr))",
            gap: 10,
            padding: 14,
            background: "linear-gradient(180deg, rgba(12,18,48,0.95), rgba(8,12,32,0.98))",
          }}
        >
          {buttons.map((btn, i) => {
            const found = foundIds.has(btn.id);
            return (
              <motion.button
                key={btn.id}
                type="button"
                onClick={() => tap(btn, i)}
                onPointerEnter={() => !found && audio.hover()}
                disabled={showIntro || finished || found}
                animate={found && !reduce ? { scale: [1, 1.06, 1] } : {}}
                whileHover={found || reduce ? undefined : { y: -3 }}
                whileTap={found ? undefined : { scale: 0.96 }}
                style={{
                  minHeight: 76,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "10px 8px",
                  borderRadius: 14,
                  border: `2px solid ${found ? "#7eff97" : "rgba(125,240,255,0.35)"}`,
                  background: found
                    ? "linear-gradient(165deg, rgba(126,255,151,0.22), rgba(12,30,18,0.92))"
                    : "linear-gradient(165deg, rgba(0,229,255,0.08), rgba(12,18,48,0.92))",
                  color: found ? "#c9ffd9" : "#eaf9ff",
                  fontSize: 13.5,
                  fontWeight: 800,
                  cursor: found ? "default" : "pointer",
                  fontFamily: "inherit",
                  boxShadow: found
                    ? "0 0 24px -6px rgba(126,255,151,0.7)"
                    : "0 10px 24px -16px rgba(0,229,255,0.7)",
                  touchAction: "manipulation",
                }}
              >
                <PixIcon emoji={btn.icon} size={26} />
                {btn.label}
                {found && <span style={{ fontSize: 11, color: "#7eff97" }}>✓ found</span>}
              </motion.button>
            );
          })}
        </div>
      </div>

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
          title="You know exactly where they live!"
          stars={stars}
          statLines={[
            targets.map((t) => t.label).join(" → "),
            "Muscle memory: installed.",
          ]}
          onContinue={() => onComplete(targets.length)}
        />
      )}
    </ExerciseFrame>
  );
}
