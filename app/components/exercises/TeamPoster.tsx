"use client";

/**
 * TeamPoster — the poster-building BUILD drill (Week 11 debut).
 *
 * A warm poster with empty slots and a tray of candidate tiles below.
 * Tap a tile that belongs → it flies up onto the next open slot with a
 * glow; tap one that doesn't → a gentle teach panel explains why the
 * poster is only for the real team. The poster completes when every
 * belonging tile is placed. Special tiles (e.g. the Childline number)
 * get a golden frame so they stand out on the finished poster.
 *
 * Re-dressable via the copy props (W11 My-Team poster; W19 family-rules
 * quilt is the earmarked reuse).
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

export interface PosterTile {
  id: string;
  /** Big label on the tile (e.g. "Mum or Dad", "Childline 0800 1111"). */
  label: string;
  /** Optional small line under the label. */
  detail?: string;
  /** Emoji rendered via PixIcon on the tile. */
  icon: string;
  /** True = belongs on the poster. */
  isTeam: boolean;
  /** Golden frame on the poster (e.g. the Childline tile). */
  special?: boolean;
  /** Teach copy: why it belongs / why it doesn't. */
  note: string;
}

export interface TeamPosterProps {
  tiles: PosterTile[];
  /** Copy overrides (re-theme per week; defaults keep the W11 team skin). */
  introTitle?: string;
  introSubtitle?: string;
  introIcon?: string;
  posterTitle?: string;
  trayPrompt?: string;
  placedToast?: string;
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

export default function TeamPoster({
  tiles,
  introTitle,
  introSubtitle,
  introIcon,
  posterTitle,
  trayPrompt,
  placedToast,
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
}: TeamPosterProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;

  const [showIntro, setShowIntro] = useState(true);
  const [placedIds, setPlacedIds] = useState<string[]>([]);
  const [wrongCount, setWrongCount] = useState(0);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [finished, setFinished] = useState(false);

  const teamTiles = tiles.filter((t) => t.isTeam);
  const placed = (id: string) => placedIds.includes(id);

  const reportedTier = useRef(0);
  const reportTier = (n: number) => {
    const tier = n >= 2 ? 2 : n >= 1 ? 1 : 0;
    if (tier > reportedTier.current) {
      reportedTier.current = tier;
      onHintReached?.(tier as 1 | 2);
    }
  };

  const tap = (tile: PosterTile, idx: number) => {
    if (showIntro || finished || placed(tile.id) || feedback) return;
    setHasInteracted(true);
    onAnswered?.({
      questionKey: `poster-${tile.id}`,
      selectedIndex: idx,
      correctIndex: idx,
      wasCorrect: tile.isTeam,
    });
    if (tile.isTeam) {
      audio.correct();
      fx.correct({ xp: 25, text: placedToast ?? "ON THE TEAM!" });
      onCorrect?.();
      const next = [...placedIds, tile.id];
      setPlacedIds(next);
      if (next.length >= teamTiles.length) {
        window.setTimeout(() => setFinished(true), reduce ? 600 : 1400);
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
        title: wrongTitle ?? "Not for the poster",
        explanation: tile.note,
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
          title={introTitle ?? "The My-Team Poster"}
          subtitle={introSubtitle ?? "Fill every slot with someone who's truly on your team - then it's up on the wall forever."}
          icon={introIcon ?? "👪"}
          narration={introNarration}
          character={introNarration?.speaker}
          onDismiss={() => setShowIntro(false)}
        />
      )}

      {/* The poster */}
      <div
        style={{
          maxWidth: 620,
          margin: "0 auto",
          borderRadius: 18,
          padding: "16px 16px 18px",
          background: "linear-gradient(180deg, #fff7e6 0%, #ffe9c4 100%)",
          border: "3px solid #e8b64f",
          boxShadow: "0 18px 44px -20px rgba(0,0,0,0.75), 0 0 0 6px rgba(232,182,79,0.15)",
        }}
      >
        <div
          style={{
            textAlign: "center",
            fontSize: 20,
            fontWeight: 900,
            letterSpacing: "0.12em",
            color: "#8a5a12",
            marginBottom: 12,
          }}
        >
          {posterTitle ?? "★ MY TEAM ★"}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(teamTiles.length, 4)}, minmax(0,1fr))`,
            gap: 10,
          }}
        >
          {teamTiles.map((slotTile, slotIdx) => {
            const filledId = placedIds[slotIdx];
            const filled = filledId ? teamTiles.find((t) => t.id === filledId) : undefined;
            return (
              <div
                key={slotTile.id}
                style={{
                  minHeight: 116,
                  borderRadius: 14,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "10px 6px",
                  border: filled
                    ? `2.5px solid ${filled.special ? "#e8a413" : "#3fae5c"}`
                    : "2.5px dashed rgba(138,90,18,0.4)",
                  background: filled
                    ? filled.special
                      ? "linear-gradient(165deg, #fff3cf, #ffe08a)"
                      : "linear-gradient(165deg, #eaffef, #c8f5d4)"
                    : "rgba(138,90,18,0.06)",
                  boxShadow: filled
                    ? filled.special
                      ? "0 0 26px -6px rgba(232,164,19,0.8)"
                      : "0 0 20px -8px rgba(63,174,92,0.7)"
                    : "none",
                }}
              >
                {filled ? (
                  <motion.div
                    initial={reduce ? false : { scale: 1.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}
                  >
                    <PixIcon emoji={filled.icon} size={34} />
                    <span style={{ fontSize: 12.5, fontWeight: 900, color: "#2c5a1e", textAlign: "center", lineHeight: 1.25 }}>
                      {filled.label}
                    </span>
                    {filled.detail && (
                      <span style={{ fontSize: 10.5, fontWeight: 800, color: "#8a5a12", textAlign: "center" }}>{filled.detail}</span>
                    )}
                  </motion.div>
                ) : (
                  <span style={{ fontSize: 26, fontWeight: 900, color: "rgba(138,90,18,0.45)" }}>?</span>
                )}
              </div>
            );
          })}
        </div>
        <div
          style={{
            textAlign: "center",
            marginTop: 10,
            fontSize: 11.5,
            fontWeight: 800,
            letterSpacing: "0.08em",
            color: "#a5771f",
          }}
        >
          {placedIds.length}/{teamTiles.length} ON THE POSTER
        </div>
      </div>

      {/* The tray */}
      <div style={{ maxWidth: 680, margin: "16px auto 0" }}>
        <div
          style={{
            textAlign: "center",
            fontSize: 13.5,
            fontWeight: 800,
            color: "#cfe3ff",
            marginBottom: 10,
          }}
        >
          {trayPrompt ?? "Tap everyone who belongs on your team"}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 10,
          }}
        >
          <AnimatePresence>
            {tiles.map((tile, i) => {
              if (placed(tile.id)) return null;
              return (
                <motion.button
                  key={tile.id}
                  type="button"
                  onClick={() => tap(tile, i)}
                  onPointerEnter={() => audio.hover()}
                  disabled={showIntro || finished || !!feedback}
                  initial={reduce ? false : { y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={reduce ? undefined : { scale: 0.6, opacity: 0 }}
                  transition={{ delay: reduce ? 0 : 0.05 * i, type: "spring", stiffness: 260, damping: 22 }}
                  whileHover={reduce ? undefined : { y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    padding: "12px 8px",
                    minHeight: 96,
                    borderRadius: 14,
                    border: "2px solid rgba(125,240,255,0.4)",
                    background: "linear-gradient(165deg, rgba(0,229,255,0.1), rgba(12,18,48,0.92))",
                    color: "#eaf9ff",
                    fontFamily: "inherit",
                    cursor: "pointer",
                    boxShadow: "0 12px 26px -16px rgba(0,229,255,0.7)",
                    touchAction: "manipulation",
                  }}
                >
                  <PixIcon emoji={tile.icon} size={30} />
                  <span style={{ fontSize: 13, fontWeight: 900, lineHeight: 1.25, textAlign: "center" }}>{tile.label}</span>
                  {tile.detail && (
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: "#9fb1ff", textAlign: "center" }}>{tile.detail}</span>
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: "10px auto 0" }}>
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
          title={completeTitle ?? "Your team is ready!"}
          stars={stars}
          statLines={[
            `${teamTiles.length}/${teamTiles.length} team spots filled`,
            completeLine ?? "Up on the wall - you are never, ever alone.",
          ]}
          onContinue={() => onComplete(teamTiles.length)}
        />
      )}
    </ExerciseFrame>
  );
}
