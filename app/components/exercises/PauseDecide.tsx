"use client";

/**
 * PauseDecide — "The Pause Button" (DECIDE, device-framed).
 *
 * Renders chooseYourPath scenario data with presentation: "device": each
 * moment is staged INSIDE an app screen (chrome + icon + message), and
 * the choice is always between the app's tempting call-to-action and a
 * big red PAUSE button. Behavioural rehearsal, not a quiz: the pause
 * action LOOKS like pausing — that's the pedagogy.
 *
 * Deliberately not a reskin of ChooseYourPath's wooden adventure doors
 * (Week 1's skin stays untouched); the shared piece is only the data
 * shape and the completion contract.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGameAudio } from "@/app/lib/gameEngine/useGameAudio";
import { useExerciseFeedback } from "@/app/lib/gameEngine/useExerciseFeedback";
import { useMotionIntensity } from "@/app/lib/gameEngine/useMotionIntensity";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import ExerciseIntroBeat, { ExerciseCompleteBeat } from "@/app/components/lesson/ExerciseBeats";
import WrongAnswerPanel from "@/app/components/lesson/WrongAnswerPanel";
import GameButton from "@/app/components/lesson/GameButton";
import PixIcon from "@/app/components/lesson/PixIcon";

export interface PauseScenario {
  setup: string;
  choices: { text: string; isSafe: boolean; consequence: string }[];
  frame?: { appName: string; icon: string };
}

export interface PauseDecideProps {
  scenarios: PauseScenario[];
  introNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  onComplete: (score: number) => void;
  onCorrect?: () => void;
  onWrong?: () => void;
}

export default function PauseDecide({
  scenarios,
  introNarration,
  onComplete,
  onCorrect,
  onWrong,
}: PauseDecideProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;

  const [showIntro, setShowIntro] = useState(true);
  const [idx, setIdx] = useState(0);
  const [pausedFx, setPausedFx] = useState(false);
  const [safeCard, setSafeCard] = useState<null | string>(null);
  const [wrongPanel, setWrongPanel] = useState<null | string>(null);
  const [wrongCount, setWrongCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const finished = idx >= scenarios.length;
  const sc = scenarios[idx];
  const tempting = sc?.choices.find((c) => !c.isSafe);
  const pauseChoice = sc?.choices.find((c) => c.isSafe);

  const advance = () => {
    setSafeCard(null);
    setWrongPanel(null);
    setPausedFx(false);
    setIdx((i) => i + 1);
  };

  const chooseTempting = () => {
    if (!tempting || safeCard || wrongPanel) return;
    audio.wrong();
    onWrong?.();
    setWrongCount((n) => n + 1);
    setWrongPanel(tempting.consequence);
  };

  const choosePause = () => {
    if (!pauseChoice || safeCard || wrongPanel) return;
    audio.correct();
    fx.correct({ xp: 25, text: "PAUSED!" });
    onCorrect?.();
    setCorrectCount((n) => n + 1);
    setPausedFx(true);
    window.setTimeout(() => setSafeCard(pauseChoice.consequence), reduce ? 250 : 650);
  };

  const stars = wrongCount === 0 ? 3 : wrongCount <= 1 ? 2 : 1;

  return (
    <ExerciseFrame maxWidth={640} decor>
      {fx.layer()}

      {showIntro && (
        <ExerciseIntroBeat
          title="The Pause Button"
          subtitle="Feel the 'hmm, not sure' tingle? Hit PAUSE and ask first."
          icon="⏸️"
          narration={introNarration}
          character={introNarration?.speaker}
          onDismiss={() => setShowIntro(false)}
        />
      )}

      {sc && (
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={reduce ? false : { x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={reduce ? undefined : { x: -40, opacity: 0 }}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            {/* The device screen */}
            <motion.div
              animate={
                pausedFx
                  ? { filter: "grayscale(0.7) brightness(0.8)", scale: 0.985 }
                  : { filter: "grayscale(0) brightness(1)", scale: 1 }
              }
              style={{
                borderRadius: 20,
                overflow: "hidden",
                border: "3px solid rgba(122,140,255,0.5)",
                boxShadow: "0 18px 44px -22px rgba(0,0,0,0.85)",
                position: "relative",
              }}
            >
              {/* App chrome */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "10px 14px",
                  background: "linear-gradient(135deg, #313d85 0%, #1e2757 100%)",
                }}
              >
                {sc.frame && <PixIcon emoji={sc.frame.icon} size={24} />}
                <span style={{ fontSize: 14.5, fontWeight: 900, color: "#fff7e6" }}>
                  {sc.frame?.appName ?? "App"}
                </span>
                <span aria-hidden style={{ marginLeft: "auto", display: "flex", gap: 5 }}>
                  {["#ff5fb3", "#ffd158", "#7eff97"].map((c) => (
                    <span key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c, opacity: 0.8 }} />
                  ))}
                </span>
              </div>

              {/* In-app message */}
              <div
                style={{
                  padding: "22px 18px 24px",
                  background: "linear-gradient(180deg, #eef1ff 0%, #dde4ff 100%)",
                  textAlign: "center",
                }}
              >
                <motion.div
                  animate={reduce || pausedFx ? undefined : { scale: [1, 1.02, 1] }}
                  transition={{ repeat: Infinity, duration: 1.6 }}
                  style={{
                    display: "inline-block",
                    padding: "16px 18px",
                    borderRadius: 16,
                    background: "linear-gradient(180deg, #ffffff, #f2f5ff)",
                    border: "2px solid #c3cdf5",
                    boxShadow: "0 10px 24px -14px rgba(30,39,87,0.6)",
                    color: "#1e2757",
                    fontSize: 16,
                    fontWeight: 800,
                    lineHeight: 1.45,
                    maxWidth: 440,
                  }}
                >
                  {sc.setup}
                </motion.div>
              </div>

              {/* PAUSED overlay */}
              <AnimatePresence>
                {pausedFx && (
                  <motion.div
                    initial={reduce ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(10,14,36,0.45)",
                    }}
                  >
                    <motion.span
                      initial={reduce ? false : { scale: 2.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 15 }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 26px",
                        borderRadius: 999,
                        background: "rgba(8,10,22,0.9)",
                        border: "3px solid #ff5f5f",
                        color: "#ffb1b1",
                        fontSize: 24,
                        fontWeight: 900,
                        letterSpacing: "0.12em",
                      }}
                    >
                      <PixIcon emoji="⏸️" size={30} /> PAUSED
                    </motion.span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* The two moves */}
            <div style={{ display: "flex", gap: 12, alignItems: "stretch" }}>
              {tempting && (
                <motion.button
                  onClick={chooseTempting}
                  disabled={!!safeCard || !!wrongPanel || showIntro}
                  whileHover={reduce ? undefined : { scale: 1.02 }}
                  whileTap={reduce ? undefined : { scale: 0.97 }}
                  style={{
                    flex: 1.4,
                    padding: "14px 14px",
                    borderRadius: 14,
                    cursor: "pointer",
                    touchAction: "manipulation",
                    fontFamily: "inherit",
                    fontSize: 14.5,
                    fontWeight: 900,
                    lineHeight: 1.3,
                    background: "linear-gradient(180deg, #ffe9a8 0%, #f5c854 100%)",
                    border: "2px solid #ffdf8e",
                    boxShadow: "0 0 16px rgba(255,214,110,0.4)",
                    color: "#4a3208",
                  }}
                >
                  ✨ {tempting.text}
                </motion.button>
              )}
              <motion.button
                onClick={choosePause}
                disabled={!!safeCard || !!wrongPanel || showIntro}
                whileHover={reduce ? undefined : { scale: 1.04 }}
                whileTap={reduce ? undefined : { scale: 0.94 }}
                aria-label={pauseChoice?.text ?? "Pause and ask a grown-up"}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  padding: "14px 12px",
                  borderRadius: 16,
                  cursor: "pointer",
                  touchAction: "manipulation",
                  fontFamily: "inherit",
                  background: "radial-gradient(circle at 50% 26%, #ff6b6b 0%, #d92f3e 68%, #a91f2e 100%)",
                  border: "3px solid #ff9d9d",
                  boxShadow: "0 10px 26px -10px rgba(217,47,62,0.8), inset 0 2px 0 rgba(255,255,255,0.25)",
                  color: "#fff",
                }}
              >
                <PixIcon emoji="⏸️" size={30} />
                <span style={{ fontSize: 15, fontWeight: 900, letterSpacing: "0.05em", lineHeight: 1.25, textAlign: "center" }}>
                  {pauseChoice?.text ?? "PAUSE — ask first"}
                </span>
              </motion.button>
            </div>

            <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: "#7d8cc9" }}>
              Moment {Math.min(idx + 1, scenarios.length)} of {scenarios.length}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Safe-pick consequence card */}
      <AnimatePresence>
        {safeCard && (
          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 18,
              background: "rgba(8,10,22,0.85)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            <motion.div
              initial={reduce ? false : { y: 18, scale: 0.96, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              style={{
                maxWidth: 420,
                textAlign: "center",
                borderRadius: 20,
                padding: "24px 20px 20px",
                background: "linear-gradient(180deg, rgba(12,42,28,0.96) 0%, rgba(8,26,18,0.97) 100%)",
                border: "2px solid #7eff9788",
                color: "#fff7e6",
              }}
            >
              <PixIcon emoji="🦸" size={54} />
              <h3 style={{ margin: "10px 0 8px", fontSize: 21, fontWeight: 900, color: "#7eff97" }}>
                Hero move!
              </h3>
              <p style={{ margin: "0 0 18px", fontSize: 15.5, lineHeight: 1.45, fontWeight: 700 }}>
                {safeCard}
              </p>
              <GameButton variant="success" size="lg" onClick={advance}>
                Next moment →
              </GameButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {wrongPanel && (
        <WrongAnswerPanel
          title="Ooh - that was the Raccoon's favourite button"
          explanation={wrongPanel}
          tip="When something online is exciting AND asks for your info - that's exactly the moment to PAUSE."
          onContinue={advance}
        />
      )}

      {finished && (
        <ExerciseCompleteBeat
          title="Pause power: mastered!"
          stars={stars}
          statLines={[
            `${correctCount}/${scenarios.length} moments paused first try`,
            "Backup team: always one tap away.",
          ]}
          onContinue={() => onComplete(correctCount)}
        />
      )}
    </ExerciseFrame>
  );
}
