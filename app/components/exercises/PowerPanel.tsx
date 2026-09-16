"use client";

/**
 * PowerPanel: the FIND-IN-ORDER drill (Week 6, "Neon Arcade"; the "player"
 * skin returns for the video weeks).
 *
 * A nasty message lands in a game (or the wrong video starts playing) and the
 * child has to find the THREE power buttons in the fixed order every Learn
 * screen teaches: REPORT, then BLOCK, then TELL a grown-up. The panel is a
 * real-looking menu full of identical buttons (a grid of tiles, a vertical
 * list, or a narrow sidebar beside a fake screen) in a random order every
 * round, with decoys mixed in. Three progress pips light up as each step is
 * found. Tapping a real step too early ("BLOCK before REPORT") pauses to
 * teach why the order matters; tapping a decoy teaches what that button does
 * instead. Nothing is timed and nothing is lost: every wrong tap is a lesson
 * and the round waits.
 *
 * Why it is not the inspectors, the Clue Stamper or the Guard Count (owner:
 * "we never copy an exercise"): there is no verdict to pick and no set to mark;
 * the child must FIND three specific controls hidden among look-alikes and
 * press them in SEQUENCE, so the skill is "where is it and what comes first".
 *
 * Learn-Loop wiring: the Raccoon's boast folds into the intro (`threat`),
 * Sarah speaks the how-to once as the board appears and reads every round as
 * it arrives (audio-only, `recordedOnly`, taps held), the third step is spoken
 * as one take ("That's right!" + why) and the next round waits for her, every
 * wrong tap speaks through WrongAnswerPanel, hint tiers escalate per round.
 * Round 1 guides itself: the next right button breathes until tapped. Rounds
 * are shuffled per play and the buttons are shuffled per round, so position
 * never encodes the answer; every button shares one style and no icon.
 */

import { Fragment, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGameAudio } from "@/app/lib/gameEngine/useGameAudio";
import { useExerciseFeedback } from "@/app/lib/gameEngine/useExerciseFeedback";
import { useMotionIntensity } from "@/app/lib/gameEngine/useMotionIntensity";
import { useShuffledOnce } from "@/app/lib/gameEngine/useShuffledOnce";
import { isAudioMuted, subscribeAudioMute } from "@/app/lib/audioMute";
import { useLessonTheme } from "@/app/components/lesson/LessonThemeContext";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import ExerciseIntroBeat, { ExerciseCompleteBeat } from "@/app/components/lesson/ExerciseBeats";
import WrongAnswerPanel from "@/app/components/lesson/WrongAnswerPanel";
import HintBubble from "@/app/components/lesson/HintBubble";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import { useVerdictVoice } from "@/app/components/lesson/VerdictVoice";
import PixIcon from "@/app/components/lesson/PixIcon";
import { SPOKEN_GATE_MAX_MS } from "@/app/lib/gameEngine/spokenGate";

// Audio-only narration: Sarah's voice with no visible narration box (the text
// she reads is already on screen), same recipe as the Clue Stamper.
const AUDIO_ONLY_STYLE = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  pointerEvents: "none",
} as const;
// SPOKEN_GATE_MAX_MS is shared: see app/lib/gameEngine/spokenGate.ts.

export interface PanelButton {
  id: string;
  /** The button's text, two or three words at most. */
  label: string;
  /** Which power step this button is. Omit for a decoy. */
  step?: 1 | 2 | 3;
  /** A decoy's teach line for the wrong-answer panel ("Mute only hides it
   *  from you. The Raccoon can still talk to others."). */
  note?: string;
}

export interface PanelRound {
  id: string;
  /** menu: the nasty message. player: the wrong video's title. */
  prompt: string;
  /** Sarah's read-aloud as the round arrives (one clip). */
  readAloud: string;
  /** How the buttons are arranged this round. */
  layout: "grid" | "list" | "sidebar";
  /** Real steps and decoys together; shuffled per round. */
  buttons: PanelButton[];
  /** [why step 1 comes first, why step 2 comes before step 3]: spoken by the
   *  wrong-answer panel when a step is tapped too early. */
  stepTeach: [string, string];
  /** Sarah's reason on the third step ("That's right!" + why). */
  why: string;
}

export interface PowerPanelProps {
  /** "menu" = a game's player menu. "player" = a video player's controls.
   *  Default "menu". */
  skin?: "menu" | "player";
  /** Shuffled per play. */
  rounds: PanelRound[];
  introTitle?: string;
  introSubtitle?: string;
  introIcon?: string;
  /** The label on the panel chrome. Defaults "Player menu" / "Video player". */
  panelTitle?: string;
  /** The three progress pips, in order. Default ["REPORT", "BLOCK", "TELL"]. */
  stepLabels?: [string, string, string];
  wrongTitle?: string;
  completeTitle?: string;
  completeLine?: string;
  hints?: { tier1: string; tier2: string };
  introNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  /** The how-to, spoken once as the board appears (audio only). */
  coachLines?: { speaker?: "adam" | "layla"; lines: string[] };
  /** Optional "Spot the Danger" Raccoon preamble folded into the intro. */
  threat?: { raccoonLine: string };
  /** Optional spoken "you're protected" payoff on the complete screen. */
  completeNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  onComplete: (score: number) => void;
  onCorrect?: () => void;
  onWrong?: () => void;
  onHintReached?: (tier: 1 | 2 | 3) => void;
  onAnswered?: (o: {
    questionKey: string;
    selectedIndex: number;
    correctIndex: number;
    wasCorrect: boolean;
  }) => void;
}

const DEFAULT_STEPS: [string, string, string] = ["REPORT", "BLOCK", "TELL"];
const KEY_FONT = "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif";

export default function PowerPanel({
  skin = "menu",
  rounds,
  introTitle = "Power Panel",
  introSubtitle,
  introIcon = "⚡",
  panelTitle,
  stepLabels = DEFAULT_STEPS,
  wrongTitle = "Find the power buttons in order!",
  completeTitle = "Every button found!",
  completeLine,
  hints,
  introNarration,
  coachLines,
  threat,
  completeNarration,
  onComplete,
  onCorrect,
  onWrong,
  onHintReached,
  onAnswered,
}: PowerPanelProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;
  const accent = useLessonTheme()?.accent ?? "#4ff0ff";
  // Both content voices are Sarah; in-game read-alouds and verdict reasons are
  // recorded under "adam", so every manifest lookup here uses that key.
  const voice = "adam" as const;
  const isPlayer = skin === "player";
  const subtitle = introSubtitle ?? `Find ${stepLabels[0]}, then ${stepLabels[1]}, then ${stepLabels[2]}. In that order.`;
  const chrome = panelTitle ?? (isPlayer ? "Video player" : "Player menu");

  const [showIntro, setShowIntro] = useState(true);
  const [idx, setIdx] = useState(0);
  // How many power steps are done this round (0..3); the next expected is step + 1.
  const [step, setStep] = useState(0);
  // Read-aloud chain: the how-to once as the board appears, then each round as
  // it arrives. Taps are held while she speaks. "idle" = nothing playing.
  const [narr, setNarr] = useState<"howto" | "read" | "idle">("idle");
  // "sealed" = all three found: the pips glow while Sarah says why, then the
  // next round slides in.
  const [phase, setPhase] = useState<"play" | "sealed">("play");
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [roundWrongs, setRoundWrongs] = useState(0);
  const [totalWrongs, setTotalWrongs] = useState(0);

  // Anti-sequence: the rounds come up in a random order every play, and the
  // buttons of each round are shuffled as it arrives (keyed by round id), so
  // where a button sits never says what it is.
  const shown = useShuffledOnce(rounds);
  const finished = idx >= shown.length;
  const r = shown[idx];
  const keys = useShuffledOnce(r?.buttons ?? [], { key: r?.id });
  const expected = step + 1;

  // Spoken verdicts (owner 2026-09-12): Sarah says "That's right!" + why on the
  // third step and the next round waits for her. Wrong taps speak through
  // WrongAnswerPanel.
  const verdict = useVerdictVoice(voice);
  const speaking = narr !== "idle" || verdict.speaking || !!feedback || phase === "sealed";
  // Round 1 teaches itself: the next right button breathes until tapped.
  const guided = idx === 0 && phase === "play";

  // Safety releases for the spoken gate (never leave the board held).
  useEffect(() => {
    if (narr === "idle") return;
    const id = window.setTimeout(() => setNarr("idle"), SPOKEN_GATE_MAX_MS);
    return () => window.clearTimeout(id);
  }, [narr]);
  useEffect(() => subscribeAudioMute((muted) => { if (muted) setNarr("idle"); }), []);

  // Hint tiers reported once each (for the parent dashboard).
  const reportedTier = useRef(0);
  useEffect(() => {
    const tier = totalWrongs >= 2 ? 2 : totalWrongs >= 1 ? 1 : 0;
    if (tier > reportedTier.current) {
      reportedTier.current = tier;
      onHintReached?.(tier as 1 | 2);
    }
  }, [totalWrongs, onHintReached]);

  const startBoard = () => {
    setShowIntro(false);
    setNarr(isAudioMuted() ? "idle" : coachLines ? "howto" : "read");
  };

  const advance = () => {
    setIdx((i) => i + 1);
    setStep(0);
    setRoundWrongs(0);
    setPhase("play");
    setNarr(isAudioMuted() ? "idle" : "read");
  };

  const press = (b: PanelButton) => {
    if (!r || speaking) return;
    // A step already found stays lit and does nothing.
    if (b.step !== undefined && b.step < expected) return;
    const right = b.step === expected;
    onAnswered?.({
      questionKey: `power-${r.id}-step${expected}`,
      selectedIndex: r.buttons.indexOf(b),
      correctIndex: r.buttons.findIndex((x) => x.step === expected),
      wasCorrect: right,
    });
    if (right) {
      audio.correct();
      fx.correct({ xp: expected >= 3 ? 25 : 10, text: `${stepLabels[expected - 1]}!` });
      onCorrect?.();
      setStep(expected);
      if (expected >= 3) {
        setPhase("sealed");
        // Sarah: "That's right!" + the round's why, one take; the pips glow
        // under her, then the next round slides in.
        verdict.say("right", r.why, () => {
          window.setTimeout(advance, reduce ? 200 : 900);
        });
      }
      return;
    }
    audio.wrong();
    onWrong?.();
    setTotalWrongs((n) => n + 1);
    const rw = roundWrongs + 1;
    setRoundWrongs(rw);
    const tip = rw >= 2 ? hints?.tier2 : hints?.tier1;
    // WrongAnswerPanel speaks "Not quite." + this explanation itself.
    if (b.step !== undefined) {
      // Skipped ahead: teach why the missed step comes first.
      setFeedback({ title: wrongTitle, explanation: expected === 1 ? r.stepTeach[0] : r.stepTeach[1], tip });
    } else {
      // A decoy: teach what that button really does.
      setFeedback({
        title: wrongTitle,
        explanation: b.note ?? hints?.tier1 ?? `That button does not stop it. Find ${stepLabels[expected - 1]} first.`,
        tip,
      });
    }
  };

  const stars = totalWrongs === 0 ? 3 : totalWrongs <= 2 ? 2 : 1;
  const hintText = roundWrongs >= 2 ? hints?.tier2 : roundWrongs === 1 ? hints?.tier1 : undefined;
  const hintTier = (roundWrongs >= 2 ? 2 : 1) as 1 | 2;
  const stripText = guided
    ? `Round 1: tap the glowing button. First ${stepLabels[0]}, then ${stepLabels[1]}, then ${stepLabels[2]}`
    : phase === "sealed"
      ? "All three found!"
      : `Find ${stepLabels[expected - 1]} on the ${isPlayer ? "player" : "menu"}`;

  /* The fake screen: the nasty message (menu) or the wrong video (player). */
  const screen = (
    <div
      style={{
        position: "relative",
        borderRadius: 16,
        background: "linear-gradient(180deg, #0a0e24 0%, #060818 100%)",
        border: `1px solid ${accent}55`,
        boxShadow: `inset 0 0 0 1px ${accent}22, 0 18px 40px -22px rgba(0,0,0,0.7)`,
        overflow: "hidden",
        color: "#fff7e6",
        minHeight: isPlayer ? 150 : 96,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {isPlayer ? (
        <>
          {/* A dark video area with a play glyph, then the title bar and a progress line. */}
          <div aria-hidden style={{ flex: 1, minHeight: 96, display: "grid", placeItems: "center", background: "radial-gradient(ellipse at 50% 40%, #1a2150 0%, #060818 75%)" }}>
            <span style={{ width: 46, height: 46, borderRadius: "50%", display: "grid", placeItems: "center", background: "rgba(255,255,255,0.12)", border: "2px solid rgba(255,255,255,0.4)", fontSize: 18, paddingLeft: 4 }}>▶</span>
          </div>
          <div aria-hidden style={{ height: 4, background: "rgba(255,255,255,0.12)" }}>
            <div style={{ width: "34%", height: "100%", background: accent }} />
          </div>
          <div style={{ padding: "10px 14px 12px" }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: accent, marginBottom: 4 }}>Now playing</div>
            <div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.3, wordBreak: "break-word" }}>{r?.prompt}</div>
          </div>
        </>
      ) : (
        <div style={{ padding: "12px 14px 14px", display: "flex", gap: 12, alignItems: "flex-start" }}>
          <span aria-hidden style={{ width: 42, height: 42, borderRadius: "50%", display: "grid", placeItems: "center", background: `${accent}22`, border: `1px solid ${accent}66`, flexShrink: 0 }}>
            <PixIcon emoji="🎮" size={26} />
          </span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: accent, marginBottom: 6 }}>A player says</div>
            <div style={{ display: "inline-block", padding: "10px 14px", borderRadius: "4px 16px 16px 16px", background: "rgba(255,255,255,0.09)", border: "1px solid rgba(255,255,255,0.16)", fontSize: 16, fontWeight: 650, lineHeight: 1.4, wordBreak: "break-word" }}>
              {r?.prompt}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  /* The panel: identical buttons in the round's layout. */
  const layout = r?.layout ?? "grid";
  const panel = (
    <div
      style={{
        borderRadius: 16,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.14)",
        padding: 10,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        flex: layout === "sidebar" ? "0 0 210px" : undefined,
        minWidth: layout === "sidebar" ? 180 : undefined,
      }}
    >
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color: "#c9b8ff", textAlign: "center", padding: "2px 0" }}>
        {chrome}
      </div>
      <div
        role="group"
        aria-label={chrome}
        style={
          layout === "grid"
            ? { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }
            : { display: "flex", flexDirection: "column", gap: 8 }
        }
      >
        {keys.map((b) => {
          const done = b.step !== undefined && b.step <= step;
          const glow = guided && !speaking && b.step === expected;
          return (
            <motion.button
              key={b.id}
              type="button"
              aria-label={done ? `${b.label}, found` : b.label}
              onClick={() => press(b)}
              disabled={speaking || done}
              whileTap={speaking || done || reduce ? undefined : { scale: 0.96 }}
              style={{
                position: "relative",
                minHeight: layout === "grid" ? 64 : 50,
                width: "100%",
                padding: "8px 12px",
                borderRadius: 12,
                // Every key the same slate, the same rim, the same ink, on every
                // round: nothing here can hint at which one is a power button.
                background: done ? `${accent}26` : "linear-gradient(180deg, #2a3150 0%, #1a2040 100%)",
                border: `2px solid ${done ? accent : glow ? accent : "rgba(255,255,255,0.18)"}`,
                color: "#fff7e6",
                fontFamily: KEY_FONT,
                fontSize: 14,
                fontWeight: 800,
                lineHeight: 1.2,
                textAlign: layout === "grid" ? "center" : "left",
                cursor: done ? "default" : speaking ? "wait" : "pointer",
                boxShadow: glow ? `0 0 0 3px ${accent}66, 0 0 22px ${accent}88` : "inset 0 -3px 0 rgba(0,0,0,0.25)",
                animation: glow && !reduce ? "ppGuide 1.4s ease-in-out infinite" : undefined,
                transition: "background 220ms ease-out, border-color 220ms ease-out",
                display: "flex",
                alignItems: "center",
                justifyContent: layout === "grid" ? "center" : "space-between",
                gap: 8,
              }}
            >
              <span style={{ minWidth: 0, wordBreak: "break-word" }}>{b.label}</span>
              {/* Post-tap only: the step number on a found power button. */}
              {done && (
                <span aria-hidden style={{ flexShrink: 0, width: 22, height: 22, borderRadius: "50%", display: "grid", placeItems: "center", background: accent, color: "#04140f", fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, fontWeight: 900 }}>
                  {b.step}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  return (
    <ExerciseFrame maxWidth={860} decor>
      {fx.layer()}
      {verdict.element}

      {showIntro && (
        <ExerciseIntroBeat
          title={introTitle}
          subtitle={subtitle}
          icon={introIcon}
          narration={introNarration}
          threat={threat}
          character={introNarration?.speaker}
          onDismiss={startBoard}
        />
      )}

      {/* Sarah's read-alouds (audio only): the how-to once, then each round. */}
      {!showIntro && !finished && r && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="pp-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent={accent} recordedOnly onDone={() => setNarr("read")} />
          )}
          {narr === "read" && (
            <InfoNarration key={`pp-read-${r.id}`} speaker={voice} lines={[r.readAloud]} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
        </div>
      )}

      {!showIntro && !finished && r && (
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Side padding keeps the header clear of the frame's corner ornaments. */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "2px 22px 0" }}>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: accent }}>
              ⚡ Power Panel
            </span>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c9b8ff" }}>
              Round {Math.min(idx + 1, shown.length)} of {shown.length}
            </span>
          </div>

          {/* Three progress pips: the order is the lesson, so they stay in place. */}
          <div role="list" aria-label="Power steps" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 12, padding: "0 12px", flexWrap: "wrap" }}>
            {stepLabels.map((label, i) => {
              const lit = step > i;
              const next = phase === "play" && step === i;
              return (
                <Fragment key={i}>
                  {i > 0 && <span aria-hidden style={{ width: 22, height: 3, borderRadius: 2, background: step >= i ? accent : "rgba(255,255,255,0.18)", transition: "background 220ms ease-out" }} />}
                  <motion.div
                    role="listitem"
                    aria-label={`${i + 1}. ${label}${lit ? ", done" : next ? ", next" : ""}`}
                    animate={lit && !reduce ? { scale: 1.06 } : { scale: 1 }}
                    transition={{ type: "spring", stiffness: 380, damping: 18 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 12px 6px 6px",
                      borderRadius: 999,
                      background: lit ? `${accent}26` : "rgba(255,255,255,0.05)",
                      border: `2px solid ${lit ? accent : next ? `${accent}88` : "rgba(255,255,255,0.16)"}`,
                      boxShadow: lit ? `0 0 16px ${accent}66` : "none",
                      color: lit ? "#fff7e6" : "#c9b8ff",
                      transition: "background 220ms ease-out, border-color 220ms ease-out, box-shadow 220ms ease-out",
                    }}
                  >
                    <span aria-hidden style={{ width: 24, height: 24, borderRadius: "50%", display: "grid", placeItems: "center", background: lit ? accent : "rgba(255,255,255,0.1)", color: lit ? "#04140f" : "#c9b8ff", fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, fontWeight: 900 }}>
                      {lit ? "✓" : i + 1}
                    </span>
                    <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase" }}>{label}</span>
                  </motion.div>
                </Fragment>
              );
            })}
          </div>

          {/* The fake screen + the panel, arranged per the round's layout. */}
          <div style={{ padding: "0 12px" }}>
            {layout === "sidebar" ? (
              <div style={{ display: "flex", gap: 12, alignItems: "stretch", flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 340px", minWidth: 260, display: "flex", flexDirection: "column" }}>{screen}</div>
                {panel}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: layout === "list" ? 560 : undefined, margin: layout === "list" ? "0 auto" : undefined }}>
                {screen}
                {panel}
              </div>
            )}
          </div>

          {/* All three found: a seal over the panel while Sarah says why. */}
          <AnimatePresence>
            {phase === "sealed" && (
              <motion.div
                key="seal"
                aria-hidden
                initial={reduce ? { opacity: 0, x: "-50%" } : { opacity: 0, x: "-50%", scale: 1.8, rotate: -20 }}
                animate={{ opacity: 1, x: "-50%", scale: 1, rotate: -6 }}
                exit={{ opacity: 0, x: "-50%" }}
                transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 380, damping: 14, delay: 0.15 }}
                style={{
                  position: "absolute",
                  left: "50%",
                  bottom: 64,
                  padding: "8px 18px",
                  borderRadius: 10,
                  border: "4px double #34d399",
                  color: "#a0ffb0",
                  background: "rgba(8,10,22,0.85)",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 900,
                  fontSize: 18,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  boxShadow: "0 0 18px rgba(52,211,153,0.5)",
                  zIndex: 3,
                  pointerEvents: "none",
                }}
              >
                ✅ {stepLabels[0]} · {stepLabels[1]} · {stepLabels[2]}
              </motion.div>
            )}
          </AnimatePresence>

          {/* On-board instructions: the current step, in the child's words. */}
          <div style={{ textAlign: "center", marginTop: 14 }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: accent, minHeight: 16 }}>
              {stripText}
            </div>
          </div>

          <div style={{ maxWidth: 560, margin: "8px auto 0" }}>
            {hintText && <HintBubble tier={hintTier} speaker={voice} text={hintText} />}
          </div>

          <style>{`@keyframes ppGuide { 0%,100% { box-shadow: 0 0 0 3px ${accent}55, 0 0 16px ${accent}77 } 50% { box-shadow: 0 0 0 6px ${accent}22, 0 0 28px ${accent} } }`}</style>
        </div>
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
          title={completeTitle}
          stars={stars}
          statLines={[
            `${shown.length} rounds, every button found`,
            completeLine ?? `${stepLabels[0]}, ${stepLabels[1]}, ${stepLabels[2]}: you know the order.`,
          ]}
          narration={completeNarration}
          onContinue={() => onComplete(stars === 3 ? 100 : stars === 2 ? 70 : 40)}
        />
      )}
    </ExerciseFrame>
  );
}
