"use client";

/**
 * RevealBoard — the REVEAL engine (cause → effect).
 *
 * A board of glowing cards (Week 2: the Raccoon's "wish list" of private
 * details, visually continuous with the golden cards he harvests in the
 * intro video). Tapping a card flips it open and plays a short pantomime
 * vignette — beat by beat, child-paced — showing what the Raccoon COULD
 * do with that detail, then closes on a counter-line ("…so it stays
 * PRIVATE") and stamps the card with a shield. When every card is
 * stamped, the board locks shut and the exercise completes.
 *
 * There is deliberately NO fail state: REVEAL teaches consequence, it
 * doesn't quiz. Every reveal is a win (audio + XP), so the child is
 * rewarded for curiosity — tap everything, learn everything.
 *
 * Data-driven on purpose: the same component powers the build sheet's
 * other REVEAL beats (unmask-profile W3, loot-box odds W7, screenshot
 * permanence W8, …) by swapping the items array.
 */

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGameAudio } from "@/app/lib/gameEngine/useGameAudio";
import { useExerciseFeedback } from "@/app/lib/gameEngine/useExerciseFeedback";
import { useMotionIntensity } from "@/app/lib/gameEngine/useMotionIntensity";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import ExerciseIntroBeat, { ExerciseCompleteBeat } from "@/app/components/lesson/ExerciseBeats";
import CoachCaption from "@/app/components/lesson/CoachCaption";
import GameButton from "@/app/components/lesson/GameButton";
import PixIcon from "@/app/components/lesson/PixIcon";

export interface RevealItem {
  id: string;
  label: string;
  icon: string;
  steps: { icon?: string; text: string }[];
  counter: string;
}

export interface RevealBoardProps {
  title: string;
  subtitle?: string;
  items: RevealItem[];
  finale?: string;
  /** Emoji (PixIcon key) fronting the board header. Default the Raccoon —
   *  pass e.g. "💬" for beats that aren't about him (W5's support board). */
  boardIcon?: string;
  introNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  coachLines?: { speaker?: "adam" | "layla"; lines: string[] };
  onComplete: (score: number) => void;
  onCorrect?: () => void;
  onAnswered?: (data: {
    questionKey: string;
    selectedIndex: number;
    correctIndex: number;
    wasCorrect: boolean;
  }) => void;
}

type Phase = "intro" | "board" | "finished";

export default function RevealBoard({
  title,
  subtitle,
  items,
  finale,
  boardIcon = "🦝",
  introNarration,
  coachLines,
  onComplete,
  onCorrect,
  onAnswered,
}: RevealBoardProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;

  const [phase, setPhase] = useState<Phase>("intro");
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [active, setActive] = useState<RevealItem | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  // Locking beat between the last stamp and the completion overlay.
  const [boardLocked, setBoardLocked] = useState(false);

  // The counter-line renders as its own final beat after the steps.
  const onCounterBeat = active !== null && stepIdx >= active.steps.length;

  const openCard = (item: RevealItem) => {
    if (phase !== "board" || active || revealed.has(item.id) || boardLocked) return;
    setHasInteracted(true);
    audio.tap();
    setActive(item);
    setStepIdx(0);
  };

  const advanceVignette = () => {
    if (!active) return;
    if (!onCounterBeat) {
      audio.tap();
      setStepIdx((s) => s + 1);
      return;
    }
    // Counter-line acknowledged → stamp the card, back to the board.
    const id = active.id;
    audio.correct();
    fx.correct({ xp: 25, text: "GUARDED!" });
    onCorrect?.();
    onAnswered?.({
      questionKey: `reveal-${id}`,
      selectedIndex: 0,
      correctIndex: 0,
      wasCorrect: true,
    });
    const next = new Set(revealed);
    next.add(id);
    setRevealed(next);
    setActive(null);
    setStepIdx(0);
    if (next.size >= items.length) {
      // Let the stamp land, then slam the board shut before the win beat.
      setBoardLocked(true);
      window.setTimeout(() => {
        fx.unlock({ text: `${title.toUpperCase()}: DENIED!` });
        setPhase("finished");
      }, reduce ? 400 : 1100);
    }
  };

  // 3 + 2 layout for five cards; flows naturally for other counts.
  const gridCols = useMemo(() => (items.length <= 4 ? 2 : 3), [items.length]);

  return (
    <ExerciseFrame maxWidth={760} decor>
      {fx.layer()}

      {phase === "intro" && (
        <ExerciseIntroBeat
          title={title}
          subtitle={subtitle ?? "Tap a card to see the Raccoon's sneaky plan for it."}
          icon={boardIcon}
          narration={introNarration}
          character={introNarration?.speaker}
          onDismiss={() => setPhase("board")}
        />
      )}

      {/* ── The wish-list board ── */}
      <motion.div
        animate={
          boardLocked && !reduce
            ? { scale: [1, 1.02, 0.96], rotate: [0, -0.6, 0] }
            : { scale: 1, rotate: 0 }
        }
        transition={{ duration: 0.7 }}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          padding: "18px 16px 16px",
          borderRadius: 20,
          // The Raccoon's corkboard — warm cork against the cosmic frame,
          // echoing the conspiracy wall from the intro video.
          background:
            "linear-gradient(180deg, rgba(96,64,34,0.92) 0%, rgba(70,45,24,0.94) 100%)",
          border: "3px solid rgba(140,96,52,0.9)",
          boxShadow:
            "inset 0 0 34px rgba(0,0,0,0.45), 0 18px 44px -22px rgba(0,0,0,0.8)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
          <PixIcon emoji={boardIcon} size={34} />
          <div
            style={{
              fontSize: 17,
              fontWeight: 900,
              letterSpacing: "0.05em",
              color: "#ffd9a0",
              textShadow: "0 2px 6px rgba(0,0,0,0.6)",
              textTransform: "uppercase",
            }}
          >
            {title}
          </div>
          <PixIcon emoji="📍" size={26} />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
            gap: 12,
          }}
        >
          {items.map((item) => {
            const done = revealed.has(item.id);
            return (
              <motion.button
                key={item.id}
                onClick={() => openCard(item)}
                disabled={done || !!active || phase !== "board" || boardLocked}
                whileHover={done || reduce ? undefined : { scale: 1.04, rotate: -1 }}
                whileTap={done || reduce ? undefined : { scale: 0.96 }}
                aria-label={
                  done ? `${item.label} — guarded` : `Reveal the Raccoon's plan for ${item.label}`
                }
                style={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  padding: "16px 8px 12px",
                  borderRadius: 14,
                  cursor: done ? "default" : "pointer",
                  touchAction: "manipulation",
                  // Unrevealed = the video's glowing golden card; revealed =
                  // dimmed with the shield stamp on top.
                  background: done
                    ? "linear-gradient(180deg, #3c3a33 0%, #2b2a25 100%)"
                    : "linear-gradient(180deg, #ffe9a8 0%, #f5c854 100%)",
                  border: done ? "2px solid #57554c" : "2px solid #ffdf8e",
                  boxShadow: done
                    ? "inset 0 2px 8px rgba(0,0,0,0.5)"
                    : "0 0 18px rgba(255,214,110,0.55), 0 6px 14px -6px rgba(0,0,0,0.65)",
                  color: done ? "#8d8b80" : "#4a3208",
                  fontFamily: "inherit",
                }}
              >
                {/* Board pin */}
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    top: -7,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: "radial-gradient(circle at 35% 30%, #ff8d8d, #b91c1c)",
                    boxShadow: "0 2px 3px rgba(0,0,0,0.55)",
                  }}
                />
                <PixIcon emoji={item.icon} size={44} style={done ? { filter: "grayscale(0.9) opacity(0.55)" } : undefined} />
                <span style={{ fontSize: 14, fontWeight: 900, lineHeight: 1.15, textAlign: "center" }}>
                  {item.label}
                </span>
                {!done && (
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#7a5a14", letterSpacing: "0.04em" }}>
                    TAP TO REVEAL
                  </span>
                )}
                {done && (
                  <motion.span
                    initial={reduce ? false : { scale: 2.2, opacity: 0, rotate: -18 }}
                    animate={{ scale: 1, opacity: 1, rotate: -12 }}
                    transition={{ type: "spring", stiffness: 300, damping: 16 }}
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      pointerEvents: "none",
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "4px 10px",
                        borderRadius: 999,
                        background: "rgba(10, 26, 18, 0.85)",
                        border: "2px solid #7eff97",
                        color: "#7eff97",
                        fontSize: 12,
                        fontWeight: 900,
                        letterSpacing: "0.06em",
                      }}
                    >
                      <PixIcon emoji="🛡️" size={16} /> PRIVATE!
                    </span>
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </div>

        <div style={{ textAlign: "center", fontSize: 12.5, fontWeight: 800, color: "#e8c890" }}>
          {boardLocked
            ? "Wish list DENIED — nothing left for him to grab!"
            : `${revealed.size} of ${items.length} guarded`}
        </div>
      </motion.div>

      {/* ── Vignette overlay: the Raccoon's plan, beat by beat ── */}
      <AnimatePresence>
        {active && (
          <motion.div
            key={active.id}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={`The Raccoon's plan for ${active.label}`}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 26,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 18,
              background: "rgba(8, 10, 22, 0.88)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            <motion.div
              key={`${active.id}-${stepIdx}`}
              initial={reduce ? false : { y: 18, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              style={{
                width: "100%",
                maxWidth: 430,
                textAlign: "center",
                borderRadius: 20,
                padding: "22px 20px 20px",
                background: onCounterBeat
                  ? "linear-gradient(180deg, rgba(12,42,28,0.96) 0%, rgba(8,26,18,0.97) 100%)"
                  : "linear-gradient(180deg, rgba(34,20,52,0.96) 0%, rgba(20,12,34,0.97) 100%)",
                border: onCounterBeat ? "2px solid #7eff9788" : "2px solid #c084fc66",
                boxShadow: "0 24px 60px -28px rgba(0,0,0,0.8)",
                color: "#fff7e6",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "4px 14px",
                  borderRadius: 999,
                  marginBottom: 12,
                  background: onCounterBeat ? "#7eff971a" : "#c084fc22",
                  border: onCounterBeat ? "1px solid #7eff9766" : "1px solid #c084fc66",
                  color: onCounterBeat ? "#7eff97" : "#dab6ff",
                  fontSize: 12.5,
                  fontWeight: 900,
                  letterSpacing: "0.05em",
                }}
              >
                {onCounterBeat ? (
                  <>
                    <PixIcon emoji="🛡️" size={16} /> YOUR MOVE, CYBER HERO
                  </>
                ) : (
                  <>
                    <PixIcon emoji="🦝" size={16} /> THE RACCOON&apos;S PLAN · {active.label.toUpperCase()}
                  </>
                )}
              </div>

              <div style={{ marginBottom: 10 }}>
                <PixIcon
                  emoji={onCounterBeat ? "🛡️" : active.steps[stepIdx]?.icon ?? active.icon}
                  size={72}
                />
              </div>

              <p style={{ margin: "0 0 18px", fontSize: 17.5, lineHeight: 1.45, fontWeight: 700 }}>
                {onCounterBeat ? active.counter : active.steps[stepIdx]?.text}
              </p>

              {/* Step dots */}
              <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 16 }} aria-hidden>
                {[...active.steps, null].map((_, i) => (
                  <span
                    key={i}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: i <= stepIdx ? (onCounterBeat ? "#7eff97" : "#c084fc") : "rgba(255,255,255,0.18)",
                    }}
                  />
                ))}
              </div>

              <GameButton
                variant={onCounterBeat ? "success" : "primary"}
                size="lg"
                onClick={advanceVignette}
              >
                {onCounterBeat ? "🛡️ Keep it private!" : "What's he up to? →"}
              </GameButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {coachLines && phase === "board" && !hasInteracted && (
        <CoachCaption lines={coachLines.lines} speaker={coachLines.speaker} />
      )}

      {phase === "finished" && (
        <ExerciseCompleteBeat
          title="Wish list: DENIED!"
          stars={3}
          statLines={[
            `${items.length} private details guarded`,
            finale ?? "The Raccoon gets NOTHING.",
          ]}
          onContinue={() => onComplete(items.length)}
        />
      )}
    </ExerciseFrame>
  );
}
