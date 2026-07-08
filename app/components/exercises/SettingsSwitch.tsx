"use client";

/**
 * SettingsSwitch — the find-and-flip settings drill (SCENE/FIND, Week 6+).
 *
 * A realistic settings panel with toggle rows. Some rows are already safe;
 * the child must find the UNSAFE ones and flip them. Flipping a risky
 * setting to safe = a satisfying clunk + teach line; tapping an
 * already-safe row teaches gently why it's fine as-is. All unsafe rows
 * flipped → the panel seals with a shield stamp.
 *
 * Reusable across weeks via the header props: W6 game-lobby settings,
 * W14 smart-device privacy, W17 social-profile lockdown, W19 family
 * device rounds.
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

export interface SettingRow {
  id: string;
  /** Setting label ("Who can join my game"). */
  label: string;
  /** Current value shown on the row ("Anyone in the world"). */
  value: string;
  /** The safe value it flips to ("Friends only"). */
  safeValue?: string;
  /** Emoji rendered via PixIcon on the row. */
  icon: string;
  /** True = starts risky and must be flipped. */
  isRisky: boolean;
  /** Teach copy: why it needed flipping / why it was already fine. */
  note: string;
}

export interface SettingsSwitchProps {
  /** Panel title (e.g. "Mega Blasters — Settings"). */
  panelTitle: string;
  rows: SettingRow[];
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

export default function SettingsSwitch({
  panelTitle,
  rows,
  introTitle,
  introSubtitle,
  introIcon = "⚙️",
  hints,
  introNarration,
  coachLines,
  onComplete,
  onCorrect,
  onWrong,
  onHintReached,
  onAnswered,
}: SettingsSwitchProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;

  const [showIntro, setShowIntro] = useState(true);
  const [flipped, setFlipped] = useState<Set<string>>(new Set());
  const [wrongCount, setWrongCount] = useState(0);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [finished, setFinished] = useState(false);

  const riskyTotal = useMemo(() => rows.filter((r) => r.isRisky).length, [rows]);
  const flippedCount = flipped.size;

  const reportedTier = useRef(0);
  const reportTier = (n: number) => {
    const tier = n >= 2 ? 2 : n >= 1 ? 1 : 0;
    if (tier > reportedTier.current) {
      reportedTier.current = tier;
      onHintReached?.(tier as 1 | 2);
    }
  };

  const tap = (row: SettingRow, idx: number) => {
    if (showIntro || finished || flipped.has(row.id)) return;
    setHasInteracted(true);
    onAnswered?.({
      questionKey: `setting-${row.id}`,
      selectedIndex: idx,
      correctIndex: row.isRisky ? idx : -1,
      wasCorrect: row.isRisky,
    });
    if (row.isRisky) {
      audio.correct();
      fx.correct({ xp: 25, text: "LOCKED IN!" });
      onCorrect?.();
      const next = new Set(flipped);
      next.add(row.id);
      setFlipped(next);
      if (next.size >= riskyTotal) {
        window.setTimeout(() => setFinished(true), reduce ? 500 : 1200);
      }
    } else {
      audio.wrong();
      onWrong?.();
      setWrongCount((n) => {
        const v = n + 1;
        reportTier(v);
        return v;
      });
      setFeedback({
        title: "That one's already safe!",
        explanation: row.note,
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

      {/* Settings panel */}
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
            background: "linear-gradient(135deg, #2a3573 0%, #1c2450 100%)",
          }}
        >
          <PixIcon emoji="⚙️" size={24} />
          <div style={{ fontSize: 16, fontWeight: 900, color: "#fff7e6" }}>{panelTitle}</div>
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
            {flippedCount}/{riskyTotal} SECURED
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {rows.map((row, i) => {
            const safe = !row.isRisky || flipped.has(row.id);
            const justFlipped = flipped.has(row.id);
            return (
              <motion.button
                key={row.id}
                type="button"
                onClick={() => tap(row, i)}
                onPointerEnter={() => !safe && audio.hover()}
                disabled={showIntro || finished || justFlipped}
                animate={justFlipped && !reduce ? { scale: [1, 1.015, 1] } : {}}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "13px 16px",
                  textAlign: "left",
                  fontFamily: "inherit",
                  cursor: justFlipped ? "default" : "pointer",
                  background: safe
                    ? "linear-gradient(90deg, rgba(52,211,153,0.10), rgba(12,18,48,0.92))"
                    : "linear-gradient(90deg, rgba(239,68,68,0.12), rgba(12,18,48,0.92))",
                  border: "none",
                  borderBottom: "1px solid rgba(122,140,255,0.18)",
                  touchAction: "manipulation",
                }}
              >
                <PixIcon emoji={row.icon} size={26} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 900, color: "#eaf9ff" }}>{row.label}</div>
                  <div
                    style={{
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: safe ? "#a0ffb0" : "#ff9b9b",
                    }}
                  >
                    {justFlipped && row.safeValue ? row.safeValue : row.value}
                  </div>
                </div>
                {/* the toggle */}
                <div
                  aria-hidden
                  style={{
                    width: 46,
                    height: 24,
                    borderRadius: 999,
                    flexShrink: 0,
                    position: "relative",
                    background: safe ? "rgba(52,211,153,0.5)" : "rgba(239,68,68,0.4)",
                    border: `1.5px solid ${safe ? "#34d399" : "#ef4444"}`,
                    transition: "background 250ms ease, border-color 250ms ease",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: 2,
                      left: safe ? 24 : 2,
                      width: 17,
                      height: 17,
                      borderRadius: "50%",
                      background: "#fff",
                      transition: "left 250ms ease",
                    }}
                  />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div
        style={{
          textAlign: "center",
          marginTop: 12,
          fontSize: 12,
          fontWeight: 700,
          color: "#7d8cc9",
        }}
      >
        Tap the RISKY settings to flip them safe — the green ones are already fine
      </div>

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
          title="Panel secured!"
          stars={stars}
          statLines={[
            `All ${riskyTotal} risky settings flipped safe`,
            "Locked down like a pro.",
          ]}
          onContinue={() => onComplete(riskyTotal)}
        />
      )}
    </ExerciseFrame>
  );
}
