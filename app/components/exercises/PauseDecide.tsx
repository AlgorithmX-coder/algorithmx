"use client";

/**
 * PauseDecide - "The Pause Button" (DECIDE, device-framed).
 *
 * Renders chooseYourPath scenario data with presentation: "device": each
 * moment is staged INSIDE an app screen (chrome + icon + message), then the
 * child picks between two moves. Behavioural rehearsal, not a quiz.
 *
 * FAIRNESS (owner 2026-09-11: "is there any option where I'll be able to
 * choose the other answer?"): the two moves are NEUTRAL cards of ONE style,
 * and the safe move's SIDE is randomised per moment, so neither colour nor
 * position gives the answer away before the child decides. The meaning is
 * revealed only AFTER the pick: the picked card turns green (+ the safe FX and
 * the "Hero move!" card) or red (+ the wrong-answer teach).
 *
 * NO SEQUENCE (owner rule): the moments play in a random order every time
 * (useShuffledOnce), stable within a play.
 *
 * FILL THE FRAME (owner: "fill the spaces correctly"): the column stretches
 * to the frame's floor, Layla + her "You decide!" pill and the progress dots
 * take the top row, the device screen breathes, and the two cards sit at the
 * bottom - no empty band.
 *
 * Deliberately not a reskin of ChooseYourPath's wooden adventure doors; the
 * shared piece is only the data shape and the completion contract.
 */

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGameAudio } from "@/app/lib/gameEngine/useGameAudio";
import { useExerciseFeedback } from "@/app/lib/gameEngine/useExerciseFeedback";
import { useMotionIntensity } from "@/app/lib/gameEngine/useMotionIntensity";
import { useShuffledOnce, fisherYates } from "@/app/lib/gameEngine/useShuffledOnce";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import ExerciseIntroBeat, { ExerciseCompleteBeat } from "@/app/components/lesson/ExerciseBeats";
import WrongAnswerPanel from "@/app/components/lesson/WrongAnswerPanel";
import GameButton from "@/app/components/lesson/GameButton";
import PixIcon from "@/app/components/lesson/PixIcon";
import InfoNarration from "@/app/components/lesson/InfoNarration";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface PauseScenario {
  setup: string;
  choices: { text: string; isSafe: boolean; consequence: string }[];
  frame?: { appName: string; icon: string };
  /** How the SAFE move reads once revealed. "pause" (default) = PAUSED!;
   *  "ask" = GOOD CALL! (asking a trusted grown-up, the one safe helper);
   *  "go" = GOOD CALL! (the go-ahead IS the safe move here, e.g. typing your
   *  password into your OWN real login screen). Varying this stops the drill
   *  being "always tap PAUSE" and makes it a real decision. */
  safeKind?: "pause" | "ask" | "go";
}

type PauseChoice = PauseScenario["choices"][number];

export interface PauseDecideProps {
  scenarios: PauseScenario[];
  introNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  /** Optional "Spot the Danger" Raccoon preamble folded into the intro. */
  threat?: { raccoonLine: string };
  /** When true, Sarah reads each scenario (and its outcome) aloud, with the
   *  no-skip guard holding the cards until she finishes - matching the
   *  classroom principle used in ChooseYourPath. Opt-in so device weeks that
   *  ship no per-scenario recordings stay silent + unchanged. */
  speakScenarios?: boolean;
  /** Optional spoken payoff on the complete beat (Sarah's "you're protected"
   *  line); the beat's guard holds Continue until she finishes. */
  completeNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  onComplete: (score: number) => void;
  onCorrect?: () => void;
  onWrong?: () => void;
  /** Optional per-moment report for the parent dashboard. Indices are the
   *  DISPLAYED positions (0 = left card, 1 = right card), which vary per play. */
  onAnswered?: (outcome: {
    questionKey: string;
    selectedIndex: number;
    correctIndex: number;
    wasCorrect: boolean;
  }) => void;
}

/* Neutral action card - identical for both moves until the reveal. */
const CARD_NEUTRAL: CSSProperties = {
  background: "linear-gradient(180deg, rgba(62,76,156,0.96) 0%, rgba(40,50,116,0.98) 100%)",
  border: "2px solid rgba(160,174,255,0.6)",
  boxShadow: "0 14px 28px -16px rgba(0,0,0,0.85), inset 0 2px 0 rgba(255,255,255,0.14)",
  color: "#fff7e6",
};
const CARD_GOOD: CSSProperties = {
  background: "radial-gradient(circle at 50% 20%, #6be08a 0%, #2fb45a 68%, #1f8a45 100%)",
  border: "2px solid #a9f0c0",
  boxShadow: "0 14px 30px -12px rgba(47,180,90,0.85), inset 0 2px 0 rgba(255,255,255,0.28)",
  color: "#ffffff",
};
const CARD_BAD: CSSProperties = {
  background: "radial-gradient(circle at 50% 20%, #ff6b6b 0%, #d92f3e 68%, #a91f2e 100%)",
  border: "2px solid #ff9d9d",
  boxShadow: "0 14px 30px -12px rgba(217,47,62,0.85), inset 0 2px 0 rgba(255,255,255,0.25)",
  color: "#ffffff",
};

export default function PauseDecide({
  scenarios,
  introNarration,
  threat,
  speakScenarios = false,
  completeNarration,
  onComplete,
  onCorrect,
  onWrong,
  onAnswered,
}: PauseDecideProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;

  // NO SEQUENCE: random moment order per play, stable within the play.
  const order = useShuffledOnce(scenarios);

  // FAIRNESS: which SIDE the safe move sits on, per moment (indexed by play
  // position). Balanced (about half left, half right, parity flipped at
  // random) then shuffled, so one play always lets the child pick the other
  // side too. Set in a layout effect, never a state initializer, so the
  // server and first client render agree (no hydration mismatch).
  const [safeOnRight, setSafeOnRight] = useState<boolean[]>(() => scenarios.map(() => false));
  useIsoLayoutEffect(() => {
    const flip = Math.random() < 0.5;
    setSafeOnRight(fisherYates(scenarios.map((_, i) => (i % 2 === 1) !== flip)));
    // Once per mount, like useShuffledOnce (authored arrays churn identity).
  }, []);

  const [showIntro, setShowIntro] = useState(true);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<null | { side: number; correct: boolean }>(null);
  const [pausedFx, setPausedFx] = useState(false);
  const [safeCard, setSafeCard] = useState<null | string>(null);
  const [wrongPanel, setWrongPanel] = useState<null | string>(null);
  const [wrongCount, setWrongCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // Reveal timers die with the component.
  const timersRef = useRef<number[]>([]);
  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);
  const later = (fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  };

  const finished = idx >= order.length;
  const sc = order[idx];
  const tempting = sc?.choices.find((c) => !c.isSafe);
  const safeChoice = sc?.choices.find((c) => c.isSafe);
  const safeRight = safeOnRight[idx] ?? false;
  // The two cards in DISPLAY order (left, right).
  const cards: (PauseChoice | undefined)[] = sc
    ? safeRight
      ? [tempting, safeChoice]
      : [safeChoice, tempting]
    : [];

  // The safe move's revealed look: PAUSED! (don't share) vs GOOD CALL! (ask a
  // trusted grown-up, or go ahead because THIS one really is safe).
  const safeKind: "pause" | "ask" | "go" = sc?.safeKind ?? "pause";
  const safeIsPause = safeKind === "pause";
  const safeIcon = safeKind === "ask" ? "👪" : safeKind === "go" ? "✅" : "⏸️";
  const safeFxText = safeIsPause ? "PAUSED!" : "GOOD CALL!";
  const safeOverlayLabel = safeIsPause ? "PAUSED" : "GOOD CALL";
  const safeOverlayBorder = safeIsPause ? "3px solid #ff5f5f" : "3px solid #5fe08a";
  const safeOverlayColor = safeIsPause ? "#ffb1b1" : "#b1ffc4";
  // The wrong-pick teach header/tip must match what the safe move WAS here:
  // a child who paused on a "go" moment did not press the Raccoon's button.
  const wrongTitle =
    safeKind === "go"
      ? "Hmm - that one was actually safe"
      : safeKind === "ask"
        ? "Hmm - not the safe helper"
        : "Ooh - that was the Raccoon's favourite button";
  const wrongTip =
    safeKind === "go"
      ? "Typing your password into YOUR OWN real login is fine. PAUSE when someone ELSE asks for it."
      : safeKind === "ask"
        ? "Stuck with a password? The ONE safe person to ask is a parent or a grown-up you trust."
        : "When something online is exciting AND asks for your info - that's exactly the moment to PAUSE.";

  const locked = !!picked || !!safeCard || !!wrongPanel || showIntro;

  const advance = () => {
    setSafeCard(null);
    setWrongPanel(null);
    setPausedFx(false);
    setPicked(null);
    setIdx((i) => i + 1);
  };

  const choose = (side: number) => {
    if (!sc || locked) return;
    const choice = cards[side];
    if (!choice) return;
    const wasCorrect = choice.isSafe;
    setPicked({ side, correct: wasCorrect });
    onAnswered?.({
      questionKey: `pause-${scenarios.indexOf(sc)}`,
      selectedIndex: side,
      correctIndex: safeRight ? 1 : 0,
      wasCorrect,
    });
    if (wasCorrect) {
      audio.correct();
      fx.correct({ xp: 25, text: safeFxText });
      onCorrect?.();
      setCorrectCount((n) => n + 1);
      setPausedFx(true);
      later(() => setSafeCard(choice.consequence), reduce ? 250 : 650);
    } else {
      audio.wrong();
      onWrong?.();
      setWrongCount((n) => n + 1);
      // Short beat so the red card is SEEN before the teach panel covers it.
      later(() => setWrongPanel(choice.consequence), reduce ? 200 : 600);
    }
  };

  const stars = wrongCount === 0 ? 3 : wrongCount <= 1 ? 2 : 1;
  const total = order.length;

  return (
    <ExerciseFrame maxWidth={640} decor padding={20} style={{ display: "flex", flexDirection: "column" }}>
      {fx.layer()}

      {showIntro && (
        <ExerciseIntroBeat
          title="The Pause Button"
          subtitle="Feel the 'hmm, not sure' tingle? Hit PAUSE and ask first."
          icon="⏸️"
          narration={introNarration}
          threat={threat}
          character={introNarration?.speaker}
          onDismiss={() => setShowIntro(false)}
        />
      )}

      {/* Sarah reads each scenario aloud, then its outcome after a pick.
          Audio-only (visually hidden) so it never duplicates the on-screen
          app message; the click-guard still holds the two cards / Continue
          until she finishes. setup + consequence are recorded under speaker
          "adam" (see the narration generator), so we narrate them with
          speaker="adam" regardless of the intro's speaker. recordedOnly =
          stay silent (no robotic TTS) if a line isn't recorded. */}
      {speakScenarios && !showIntro && sc && (
        <div
          aria-hidden
          style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", pointerEvents: "none" }}
        >
          {!safeCard && !wrongPanel && (
            <InfoNarration key={`pd-setup-${idx}`} speaker="adam" lines={[sc.setup]} accent="#7df0ff" recordedOnly />
          )}
          {safeCard && (
            <InfoNarration key={`pd-safe-${idx}`} speaker="adam" lines={[safeCard]} accent="#7eff97" recordedOnly />
          )}
          {wrongPanel && (
            <InfoNarration key={`pd-wrong-${idx}`} speaker="adam" lines={[wrongPanel]} accent="#ff9db0" recordedOnly />
          )}
        </div>
      )}

      {sc && (
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={reduce ? false : { x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={reduce ? undefined : { x: -40, opacity: 0 }}
            style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", gap: 18 }}
          >
            {/* Top row: the "You decide!" pill, progress dots on the right (owner: no portrait here) */}
            <div data-pd-head style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 54 }}>
              <div
                style={{
                  position: "relative",
                  padding: "8px 16px",
                  borderRadius: 999,
                  borderBottomLeftRadius: 4,
                  background: "linear-gradient(180deg, #7c5cff, #5b3fd4)",
                  border: "1.5px solid #b39dff",
                  color: "#ffffff",
                  fontSize: 14.5,
                  fontWeight: 900,
                  whiteSpace: "nowrap",
                  boxShadow: "0 8px 18px -8px rgba(124,92,255,0.9)",
                  letterSpacing: "0.01em",
                }}
              >
                You decide! ⭐
              </div>
              <div
                role="img"
                aria-label={`Moment ${Math.min(idx + 1, total)} of ${total}`}
                style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 7, padding: "0 4px" }}
              >
                {order.map((_, i) => {
                  const done = i < idx;
                  const current = i === idx;
                  return (
                    <span
                      key={i}
                      style={{
                        width: current ? 24 : 11,
                        height: 11,
                        borderRadius: 999,
                        background: done ? "#7eff97" : current ? "#ffd158" : "rgba(255,255,255,0.22)",
                        boxShadow: current ? "0 0 12px rgba(255,209,88,0.75)" : done ? "0 0 8px rgba(126,255,151,0.5)" : undefined,
                        transition: "all 260ms ease",
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* The device screen - grows to use the frame's spare height */}
            <motion.div
              data-pd-device
              animate={
                pausedFx
                  ? { filter: "grayscale(0.7) brightness(0.8)", scale: 0.985 }
                  : { filter: "grayscale(0) brightness(1)", scale: 1 }
              }
              style={{
                flex: 1,
                minHeight: 176,
                display: "flex",
                flexDirection: "column",
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
                  padding: "11px 14px",
                  background: "linear-gradient(135deg, #313d85 0%, #1e2757 100%)",
                }}
              >
                {sc.frame && <PixIcon emoji={sc.frame.icon} size={24} />}
                <span style={{ fontSize: 15, fontWeight: 900, color: "#fff7e6" }}>
                  {sc.frame?.appName ?? "App"}
                </span>
                <span aria-hidden style={{ marginLeft: "auto", display: "flex", gap: 5 }}>
                  {["#ff5fb3", "#ffd158", "#7eff97"].map((c) => (
                    <span key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c, opacity: 0.8 }} />
                  ))}
                </span>
              </div>

              {/* In-app message - centred in whatever height the device has */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
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
                    padding: "18px 20px",
                    borderRadius: 16,
                    background: "linear-gradient(180deg, #ffffff, #f2f5ff)",
                    border: "2px solid #c3cdf5",
                    boxShadow: "0 10px 24px -14px rgba(30,39,87,0.6)",
                    color: "#1e2757",
                    fontSize: 17.5,
                    fontWeight: 800,
                    lineHeight: 1.45,
                    maxWidth: 460,
                  }}
                >
                  {sc.setup}
                </motion.div>
              </div>

              {/* PAUSED / GOOD CALL overlay */}
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
                        border: safeOverlayBorder,
                        color: safeOverlayColor,
                        fontSize: 24,
                        fontWeight: 900,
                        letterSpacing: "0.12em",
                      }}
                    >
                      <PixIcon emoji={safeIcon} size={30} /> {safeOverlayLabel}
                    </motion.span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* The two moves: NEUTRAL twins until the pick reveals them */}
            <div data-pd-cards style={{ display: "flex", gap: 14, alignItems: "stretch" }}>
              {cards.map((choice, side) => {
                if (!choice) return null;
                const isPicked = picked?.side === side;
                const revealGood = isPicked && picked.correct;
                const revealBad = isPicked && !picked.correct;
                const dim = !!picked && !isPicked;
                const look = revealGood ? CARD_GOOD : revealBad ? CARD_BAD : CARD_NEUTRAL;
                return (
                  <motion.button
                    key={`${idx}-${side}`}
                    data-pd-card={side}
                    onClick={() => choose(side)}
                    disabled={locked}
                    aria-label={choice.text}
                    animate={revealGood ? { scale: [1, 1.06, 1] } : revealBad ? { x: reduce ? 0 : [0, -6, 6, -4, 0] } : { scale: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    whileHover={reduce || locked ? undefined : { scale: 1.03, y: -2 }}
                    whileTap={reduce || locked ? undefined : { scale: 0.96 }}
                    style={{
                      flex: 1,
                      minHeight: 86,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                      padding: "16px 18px",
                      borderRadius: 18,
                      cursor: locked ? "default" : "pointer",
                      touchAction: "manipulation",
                      fontFamily: "inherit",
                      fontSize: 16.5,
                      fontWeight: 900,
                      lineHeight: 1.3,
                      textAlign: "center",
                      opacity: dim ? 0.45 : 1,
                      transition: "background 220ms ease, border-color 220ms ease, box-shadow 220ms ease, opacity 220ms ease",
                      ...look,
                    }}
                  >
                    {revealGood && <PixIcon emoji="✅" size={26} />}
                    {revealBad && <PixIcon emoji="🚫" size={26} />}
                    <span>{choice.text}</span>
                  </motion.button>
                );
              })}
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
          title={wrongTitle}
          explanation={wrongPanel}
          tip={wrongTip}
          onContinue={advance}
        />
      )}

      {finished && (
        <ExerciseCompleteBeat
          title="Pause power: mastered!"
          stars={stars}
          statLines={[
            `${correctCount}/${total} safe choices first try`,
            "Backup team: always one tap away.",
          ]}
          narration={completeNarration}
          onContinue={() => onComplete(correctCount)}
        />
      )}
    </ExerciseFrame>
  );
}

/* Small round Layla portrait (54px). Uses the week's costumed idle sprite when
 * the week has one (app/lib/weekCharacters.ts) and falls back to the shared
 * sprite on error. The full-body idle art is cropped to the head. */
