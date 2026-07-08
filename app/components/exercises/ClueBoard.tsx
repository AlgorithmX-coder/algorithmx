"use client";

/**
 * ClueBoard — the detective-corkboard INSPECT (Week 8 debut).
 *
 * One "photo" sits pinned at the centre of a corkboard with its clue
 * chips waiting on it. Tap a clue → a red-thread evidence card pins
 * itself beside the photo and reveals what that clue gives away. Once
 * every clue is strung, the verdict panel slides in for one judgement
 * call (e.g. "safe to share as-is?"). Right → CASE CLOSED stamp; wrong
 * → WrongAnswerPanel teaches and the child tries again.
 *
 * Deliberately unlike profileInspector (stat-chip profile card) and
 * phishInspector (message-anatomy zones): this is a photo SCENE with
 * spatial clue hotspots and pin-string theatre. Everything is data so
 * later weeks (trail telescope, address peephole, draft highlighter)
 * can re-dress it via props.
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

export interface BoardClue {
  id: string;
  /** PixIcon key shown on the photo hotspot. */
  icon: string;
  /** Short chip label, e.g. "School crest". */
  label: string;
  /** The evidence card: what this clue gives away. */
  evidence: string;
}

export interface ClueBoardVerdictOption {
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface ClueBoardProps {
  /** Intro copy overrides (re-theme per week). */
  introTitle?: string;
  introSubtitle?: string;
  introIcon?: string;
  /** Caption under the pinned photo, e.g. "Saturday's photo". */
  photoTitle: string;
  /** Big central PixIcon standing in for the photo's subject. */
  photoIcon?: string;
  /** The clue hotspots waiting on the photo (2-4 feel best). */
  clues: BoardClue[];
  /** The judgement call once every clue is strung. */
  verdict: {
    prompt: string;
    options: ClueBoardVerdictOption[];
  };
  /** Stamp text on a correct verdict. */
  stampText?: string;
  /** Complete-beat copy overrides (re-theme per week). */
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

export default function ClueBoard({
  introTitle,
  introSubtitle,
  introIcon,
  photoTitle,
  photoIcon,
  clues,
  verdict,
  stampText,
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
}: ClueBoardProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;

  const [showIntro, setShowIntro] = useState(true);
  const [found, setFound] = useState<Set<string>>(new Set());
  const [wrongCount, setWrongCount] = useState(0);
  const [solved, setSolved] = useState(false);
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  const allFound = clues.every((c) => found.has(c.id));

  const reportedTier = useRef(0);
  useEffect(() => {
    const tier = wrongCount >= 2 ? 2 : wrongCount >= 1 ? 1 : 0;
    if (tier > reportedTier.current) {
      reportedTier.current = tier;
      onHintReached?.(tier as 1 | 2);
    }
  }, [wrongCount, onHintReached]);

  const inspect = (clue: BoardClue) => {
    if (found.has(clue.id) || solved || showIntro) return;
    setHasInteracted(true);
    audio.tap();
    fx.toast({ text: "CLUE PINNED!", tone: "danger" });
    setFound((prev) => new Set(prev).add(clue.id));
  };

  const decide = (i: number) => {
    if (!allFound || solved || feedback) return;
    const option = verdict.options[i];
    const correctIndex = verdict.options.findIndex((o) => o.isCorrect);
    onAnswered?.({
      questionKey: "clueboard-verdict",
      selectedIndex: i,
      correctIndex,
      wasCorrect: option.isCorrect,
    });
    if (option.isCorrect) {
      audio.correct();
      fx.correct({ xp: 25, text: stampText ?? "CASE CLOSED!" });
      onCorrect?.();
      setSolved(true);
      window.setTimeout(() => setFinished(true), reduce ? 900 : 1700);
    } else {
      audio.wrong();
      onWrong?.();
      setWrongCount((n) => n + 1);
      setFeedback({
        title: "Look at the evidence again, detective",
        explanation: option.explanation,
        tip: hints?.tier1,
      });
    }
  };

  const stars = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1;

  return (
    <ExerciseFrame maxWidth={780} decor>
      {fx.layer()}

      {showIntro && (
        <ExerciseIntroBeat
          title={introTitle ?? "The Clue Board"}
          subtitle={introSubtitle ?? "Pin every clue to the board, then make the call."}
          icon={introIcon ?? "🔍"}
          narration={introNarration}
          character={introNarration?.speaker}
          onDismiss={() => setShowIntro(false)}
        />
      )}

      {/* ── The corkboard ── */}
      <div
        style={{
          position: "relative",
          borderRadius: 20,
          padding: "16px 14px 14px",
          background:
            "radial-gradient(circle at 20% 15%, rgba(150,103,44,0.35), transparent 55%), linear-gradient(180deg, #4a351d 0%, #3a2a12 100%)",
          backgroundColor: "#42301a",
          border: "10px solid #2b1d0d",
          boxShadow: "inset 0 2px 14px rgba(0,0,0,0.55), 0 18px 44px -22px rgba(0,0,0,0.8)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
            padding: "0 4px",
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 900, letterSpacing: "0.08em", color: "#ffd9a0" }}>
            EVIDENCE BOARD
          </span>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: "#d9b98c" }}>
            Clues pinned: {found.size} of {clues.length}
          </span>
        </div>

        <div style={{ display: "flex", gap: 14, alignItems: "stretch", flexWrap: "wrap" }}>
          {/* The pinned photo */}
          <div style={{ flex: "1 1 280px", minWidth: 260, position: "relative" }}>
            <motion.div
              initial={reduce ? false : { rotate: -3, y: -12, opacity: 0 }}
              animate={{ rotate: -1.5, y: 0, opacity: 1 }}
              style={{
                position: "relative",
                borderRadius: 6,
                padding: "14px 14px 12px",
                background: "linear-gradient(180deg, #fdf8ee 0%, #f3e9d2 100%)",
                boxShadow: "0 14px 30px -12px rgba(0,0,0,0.75)",
                color: "#3c2c10",
              }}
            >
              {/* Board pin */}
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  top: -9,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "radial-gradient(circle at 35% 30%, #ff8f8f, #c02626 70%)",
                  boxShadow: "0 3px 6px rgba(0,0,0,0.5)",
                }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "16px 0 10px",
                }}
              >
                <PixIcon emoji={photoIcon ?? "🏠"} size={84} />
              </div>

              {/* Clue chips ON the photo */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {clues.map((clue) => {
                  const isFound = found.has(clue.id);
                  return (
                    <motion.button
                      key={clue.id}
                      type="button"
                      onClick={() => inspect(clue)}
                      onPointerEnter={() => audio.hover()}
                      animate={
                        isFound || reduce
                          ? { scale: 1 }
                          : { scale: [1, 1.045, 1], transition: { repeat: Infinity, duration: 1.6 } }
                      }
                      whileTap={{ scale: 0.95 }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        padding: "8px 10px",
                        borderRadius: 10,
                        border: isFound ? "2px solid #c02626" : "2px dashed #b08a3e",
                        background: isFound ? "rgba(192,38,38,0.08)" : "rgba(255,244,214,0.85)",
                        color: isFound ? "#8a1f1f" : "#5a4212",
                        fontSize: 12.5,
                        fontWeight: 900,
                        cursor: isFound ? "default" : "pointer",
                        fontFamily: "inherit",
                        textAlign: "left",
                        touchAction: "manipulation",
                        opacity: isFound ? 0.75 : 1,
                      }}
                      aria-label={isFound ? `${clue.label} - pinned` : `Inspect ${clue.label}`}
                    >
                      <PixIcon emoji={clue.icon} size={22} />
                      <span>{clue.label}</span>
                      {isFound && (
                        <span aria-hidden style={{ marginLeft: "auto", display: "inline-flex" }}>
                          <PixIcon emoji="📍" size={14} />
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              <div
                style={{
                  marginTop: 10,
                  textAlign: "center",
                  fontSize: 13.5,
                  fontWeight: 800,
                  fontStyle: "italic",
                  color: "#6a4f1c",
                }}
              >
                {photoTitle}
              </div>

              {/* CASE CLOSED stamp */}
              {solved && (
                <motion.div
                  initial={reduce ? false : { scale: 2.4, opacity: 0, rotate: -20 }}
                  animate={{ scale: 1, opacity: 1, rotate: -12 }}
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
                      padding: "8px 18px",
                      border: "4px solid #c02626",
                      borderRadius: 10,
                      color: "#c02626",
                      fontSize: 26,
                      fontWeight: 900,
                      letterSpacing: "0.12em",
                      background: "rgba(253,248,238,0.82)",
                    }}
                  >
                    {stampText ?? "CASE CLOSED!"}
                  </span>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Evidence cards pin in as clues are found */}
          <div style={{ flex: "1 1 240px", minWidth: 230, display: "flex", flexDirection: "column", gap: 10 }}>
            {clues.map((clue, i) => {
              const isFound = found.has(clue.id);
              return (
                <AnimatePresence key={clue.id}>
                  {isFound ? (
                    <motion.div
                      initial={reduce ? false : { x: 36, opacity: 0, rotate: 4 }}
                      animate={{ x: 0, opacity: 1, rotate: i % 2 === 0 ? 1.6 : -1.6 }}
                      style={{
                        position: "relative",
                        padding: "10px 12px 10px 26px",
                        borderRadius: 6,
                        background: "linear-gradient(180deg, #fff7de 0%, #f7ecc8 100%)",
                        boxShadow: "0 10px 22px -10px rgba(0,0,0,0.7)",
                        color: "#4a3208",
                      }}
                    >
                      {/* red thread stub + pin */}
                      <span
                        aria-hidden
                        style={{
                          position: "absolute",
                          left: -14,
                          top: "50%",
                          width: 26,
                          height: 2.5,
                          background: "#c02626",
                          transform: "rotate(-14deg)",
                          borderRadius: 2,
                        }}
                      />
                      <span
                        aria-hidden
                        style={{
                          position: "absolute",
                          left: 8,
                          top: "calc(50% - 6px)",
                          width: 11,
                          height: 11,
                          borderRadius: "50%",
                          background: "radial-gradient(circle at 35% 30%, #ff8f8f, #c02626 70%)",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.45)",
                        }}
                      />
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                        <PixIcon emoji={clue.icon} size={18} />
                        <span style={{ fontSize: 11.5, fontWeight: 900, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                          {clue.label}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.35 }}>{clue.evidence}</div>
                    </motion.div>
                  ) : (
                    <div
                      aria-hidden
                      style={{
                        minHeight: 58,
                        borderRadius: 6,
                        border: "2px dashed rgba(255,217,160,0.35)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "rgba(255,217,160,0.5)",
                        fontSize: 11,
                        fontWeight: 800,
                        letterSpacing: "0.14em",
                      }}
                    >
                      EVIDENCE SLOT
                    </div>
                  )}
                </AnimatePresence>
              );
            })}
          </div>
        </div>

        {/* Verdict panel once every clue is strung */}
        <AnimatePresence>
          {allFound && !solved && (
            <motion.div
              initial={reduce ? false : { y: 26, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              style={{
                marginTop: 14,
                padding: "14px 14px 12px",
                borderRadius: 14,
                background: "rgba(20,14,5,0.72)",
                border: "1.5px solid rgba(255,209,88,0.5)",
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  fontSize: 15.5,
                  fontWeight: 900,
                  color: "#ffe9b3",
                  marginBottom: 10,
                }}
              >
                {verdict.prompt}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${verdict.options.length}, minmax(0,1fr))`,
                  gap: 10,
                }}
              >
                {verdict.options.map((o, i) => (
                  <motion.button
                    key={i}
                    type="button"
                    onClick={() => decide(i)}
                    onPointerEnter={() => audio.hover()}
                    whileHover={reduce ? undefined : { scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    style={{
                      padding: "13px 12px",
                      borderRadius: 12,
                      border: "2px solid rgba(125,240,255,0.55)",
                      background: "linear-gradient(165deg, rgba(0,229,255,0.14), rgba(12,18,48,0.9))",
                      color: "#eaf9ff",
                      fontSize: 14.5,
                      fontWeight: 900,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      touchAction: "manipulation",
                    }}
                  >
                    {o.text}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tiered hints */}
        <div style={{ padding: wrongCount > 0 ? "10px 4px 0" : 0 }}>
          {wrongCount === 1 && hints && <HintBubble tier={1} speaker="layla" text={hints.tier1} />}
          {wrongCount >= 2 && hints && <HintBubble tier={2} speaker="layla" text={hints.tier2} />}
        </div>
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
          title={completeTitle ?? "Case closed, detective!"}
          stars={stars}
          statLines={[
            `${clues.length}/${clues.length} clues pinned to the board`,
            completeLine ?? "Photos talk - now you hear every word.",
          ]}
          onContinue={() => onComplete(stars)}
        />
      )}
    </ExerciseFrame>
  );
}
