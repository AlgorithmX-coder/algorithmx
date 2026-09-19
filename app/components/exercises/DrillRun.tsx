"use client";

/**
 * DrillRun: the LIVE THE PROTOCOL IN ORDER drill (Week 11, "The Drill Run").
 *
 * The lighthouse runs a practice call-out. A situation card opens at the top
 * of the board ("a message arrives that makes your tummy drop") and Sarah
 * reads it out. Under it stand three uniform cards: what do you do next? The
 * RIGHT one is the next step of the emergency protocol, and taking it ADVANCES
 * the drill: the rail along the top lights that step and the next situation
 * opens, so the five steps are lived one after another instead of being
 * arranged on a board. A card that is not the next move teaches calmly and the
 * same step waits, with every card still out, so the retry is one tap.
 *
 * The rail is the whole point. It is not a score and not a clock: it is the
 * protocol itself, filling in from left to right as the child walks it, so by
 * the last step they have been through the real thing in the real order rather
 * than reading it off a poster.
 *
 * Why it is not the Step Order board or the Power Panel (owner: "we never copy
 * an exercise"): Step Order hands the child all the steps at once and asks
 * them to sort them onto a board, and the Power Panel is a hunt for three
 * buttons pressed in a set order on one machine. Here there is no pile to
 * sort and nothing to find. Each step arrives as a SITUATION the child is
 * standing in, the choice is always a fresh three, and the only way to see
 * step four is to have actually taken step three. The order is not the answer
 * being tested; the order is the experience.
 *
 * Nothing races the child: tap-only, untimed, no lose state, no penalty for a
 * wrong move beyond Sarah explaining it, and the child is never blamed for the
 * situation they are standing in.
 *
 * Learn-Loop wiring: Raccoon boast in the intro (`threat`, allowed here: this
 * beat is the drill, not a feelings beat), Sarah's how-to once and every
 * step's `situation` read aloud as it opens (audio-only, `recordedOnly`, taps
 * held, released by the shared SPOKEN_GATE_MAX_MS), a one-take spoken verdict
 * on the move ("That's right!" + that card's `why` via VerdictVoice; wrong:
 * WrongAnswerPanel speaks "Not quite." + that card's `explanation`), hint
 * tiers per step, and a payoff on the complete beat that is gated on
 * `!verdict.speaking` so it can never cut Sarah off. The next situation is
 * opened from the verdict's own callback, so no payoff can cut her off either.
 * Steps play in authored order (the order IS the lesson); the three cards are
 * shuffled per step. Step 1 guides the MECHANIC only: all three cards breathe
 * together, which shows what to do and hides which one is next.
 *
 * Authoring: exactly one option per step has `isRight: true`, and three
 * options a step (a two-item list always comes back reversed, so the shuffle
 * needs three). Keep `stepLabel` to about 10 characters (it sits under a rail
 * pip), a card label to about 26, `situation` to about 70, and `why` and
 * `explanation` to one kid-sized sentence each. `why` is what Sarah says on
 * the right move; `explanation` is the calm teach line for a wrong one, so
 * every option needs one. Every icon must be in PixIcon's MAP or it renders as
 * a flat system emoji.
 *
 * Layout budget at the owner's 1414x771 window (HUD 64 + stage padding 40, so
 * the stage holds ~627px before it grows): header 29 + marginBottom 10 + board
 * 26 (padding and border) + rail 64 + gap 12 + situation 116 (eyebrow 16, gap
 * 6, card 94) + gap 12 + prompt 20 + gap 8 + cards 104 + strip 28 + hint gap 8
 * = ~437px, so the rail, the situation, all three cards and the strip are on
 * screen without a scroll. At 400px the cards fall into one column and the
 * rail pips shrink, and nothing scrolls sideways.
 */

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
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
// she reads is already on screen), same recipe as WhoKnows / PausePower.
const AUDIO_ONLY_STYLE = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  pointerEvents: "none",
} as const;
// SPOKEN_GATE_MAX_MS is shared: see app/lib/gameEngine/spokenGate.ts.

export interface DrillStep { id: string; situation: string; stepLabel: string; options: { id: string; label: string; icon: string; isRight: boolean; why: string; explanation: string }[]; }
export interface DrillRunProps {
  steps: DrillStep[];
  introTitle?: string; introSubtitle?: string; introIcon?: string;
  railLabel?: string;             // default "THE DRILL"
  situationLabel?: string;        // default "WHAT'S HAPPENING"
  completeTitle?: string; completeLine?: string;
  hints?: { tier1: string; tier2: string };
  introNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  coachLines?: { speaker?: "adam" | "layla"; lines: string[] };
  threat?: { raccoonLine: string };   // allowed here: this beat is the drill, not a feelings beat
  completeNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  onComplete: (score: number) => void;
  onCorrect?: () => void; onWrong?: () => void;
  onHintReached?: (tier: 1 | 2 | 3) => void;
  onAnswered?: (o: { questionKey: string; selectedIndex: number; correctIndex: number; wasCorrect: boolean }) => void;
}

type DrillOption = DrillStep["options"][number];

/** Fixed copy the props above do not cover (engine chrome, not authored
 *  content). Calm on purpose: a wrong move is a redirect, never a telling-off. */
const NEXT_PROMPT = "What do you do next?";
const STEP_TOAST = "STEP DONE!";
const WRONG_TITLE = "That is not the next move";

const EMPTY_OPTIONS: DrillOption[] = [];
const KID_FONT = "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif";
const LABEL_FONT = "'Space Grotesk', sans-serif";
/** Geometry (px). */
const RAIL_PIP = 30;
const SITUATION_MIN_H = 94;
const CARD_MIN_H = 104;
const CARD_MIN_W = 190;
/** Paints. Warm lamp light on a dark coast: nothing here is an alarm. */
const SITUATION_BG = "linear-gradient(180deg, rgba(255,209,88,0.13) 0%, rgba(255,209,88,0.05) 100%)";
const PAPER = "#fff6e8";
const INK = "#2a1f18";
const DONE_GREEN = "#7ee2a8";

export default function DrillRun({
  steps,
  introTitle = "The Drill Run",
  introSubtitle = "A practice call-out. Read what is happening, then tap what you do next.",
  introIcon = "🔔",
  railLabel = "THE DRILL",
  situationLabel = "WHAT'S HAPPENING",
  completeTitle = "Drill complete!",
  completeLine = "You know the whole protocol now, Cyber Hero. Calm, in order, every single time.",
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
}: DrillRunProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;
  const accent = useLessonTheme()?.accent ?? "#2b7fff";
  // Both content voices are Sarah; in-game read-alouds and verdict reasons are
  // recorded under "adam", so every manifest lookup here uses that key. Never
  // derive it from the intro narration's speaker.
  const voice = "adam" as const;

  const [showIntro, setShowIntro] = useState(true);
  const [idx, setIdx] = useState(0);
  // Read-aloud chain: the how-to once as the drill starts, then each situation
  // as it opens. Taps are held while she speaks. "idle" = nothing playing.
  const [narr, setNarr] = useState<"howto" | "read" | "idle">("idle");
  // The move just taken, once it was the right one: its check lands and the
  // rail pip fills while Sarah says why, then the next situation opens.
  const [cleared, setCleared] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [stepWrongs, setStepWrongs] = useState(0);
  const [totalWrongs, setTotalWrongs] = useState(0);

  // The steps play in AUTHORED order (that order is the whole lesson); only
  // the three cards inside a step are shuffled.
  const finished = idx >= steps.length;
  const s = steps[idx];
  const deck = useShuffledOnce(s?.options ?? EMPTY_OPTIONS, { key: s?.id ?? "done" });
  const sealed = cleared !== null;
  // Step 1 teaches the mechanic only: all three cards breathe together, so the
  // glow says "tap one of these", never which one.
  const guided = idx === 0;

  // Spoken verdicts: Sarah says "That's right!" + why, and the next situation
  // waits for her. Wrong moves speak through WrongAnswerPanel.
  const verdict = useVerdictVoice(voice);
  const speaking = narr !== "idle" || verdict.speaking || !!feedback || sealed;

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
    setCleared(null);
    setStepWrongs(0);
    setNarr(isAudioMuted() ? "idle" : "read");
  };

  /* ───────── MOVE: the only judged tap. The right one advances the drill ───────── */
  const move = (o: DrillOption) => {
    if (!s || speaking || sealed) return;
    onAnswered?.({
      questionKey: `drillrun-${s.id}`,
      // Indexes are into the step's AUTHORED option list, whatever slot the
      // shuffle put a card in, so the dashboard always reads the same numbers.
      selectedIndex: s.options.findIndex((x) => x.id === o.id),
      correctIndex: s.options.findIndex((x) => x.isRight),
      wasCorrect: o.isRight,
    });
    if (o.isRight) {
      fx.correct({ xp: 25, text: STEP_TOAST });
      onCorrect?.();
      setCleared(o.id);
      // Sarah: "That's right!" + this move's why; the rail pip fills under her,
      // then the next situation opens. Advancing from her callback is what
      // keeps a payoff from ever cutting her off.
      verdict.say("right", o.why, () => {
        window.setTimeout(advance, reduce ? 200 : 900);
      });
    } else {
      audio.wrong();
      onWrong?.();
      setTotalWrongs((n) => n + 1);
      const sw = stepWrongs + 1;
      setStepWrongs(sw);
      // WrongAnswerPanel speaks "Not quite." + this teach line itself; every
      // card stays out and the same step waits, so the retry is one tap.
      setFeedback({ title: WRONG_TITLE, explanation: o.explanation, tip: sw >= 2 ? hints?.tier2 : hints?.tier1 });
    }
  };

  const stars = totalWrongs === 0 ? 3 : totalWrongs <= 2 ? 2 : 1;
  const hintText = stepWrongs >= 2 ? hints?.tier2 : stepWrongs === 1 ? hints?.tier1 : undefined;
  const hintTier = (stepWrongs >= 2 ? 2 : 1) as 1 | 2;
  const guideStyle = (on: boolean): CSSProperties =>
    on
      ? { boxShadow: `0 0 0 3px ${accent}66, 0 0 22px ${accent}88`, animation: reduce ? undefined : "drGuide 1.4s ease-in-out infinite" }
      : {};
  const strip = sealed
    ? STEP_TOAST
    : guided
      ? "Step 1: tap what you would do next"
      : stepWrongs > 0
        ? "Have another think. What comes next in the drill?"
        : "Read what is happening, then tap your next move";

  const eyebrowStyle: CSSProperties = {
    fontFamily: LABEL_FONT,
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: accent,
  };

  /* ───────── The rail: the protocol itself, filling in as it is lived ───────── */
  const rail: ReactNode = (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, minHeight: 16, ...eyebrowStyle }}>
        <PixIcon emoji="📋" size={16} />
        <span>{railLabel}</span>
        <span style={{ marginLeft: "auto", color: "rgba(255,247,230,0.65)" }}>
          {Math.min(idx + (sealed ? 1 : 0), steps.length)} of {steps.length}
        </span>
      </div>
      <div role="list" aria-label={railLabel} style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
        {steps.map((st, i) => {
          const done = i < idx || (i === idx && sealed);
          const now = i === idx && !sealed;
          return (
            <div
              key={st.id}
              role="listitem"
              aria-label={`${st.stepLabel}${done ? ", done" : now ? ", now" : ""}`}
              style={{ position: "relative", flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}
            >
              {/* Half connectors, so the rail reads as one line of steps. */}
              {i > 0 && (
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    top: RAIL_PIP / 2 - 1,
                    left: 0,
                    width: "50%",
                    height: 2,
                    background: i <= idx ? DONE_GREEN : "rgba(255,247,230,0.18)",
                  }}
                />
              )}
              {i < steps.length - 1 && (
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    top: RAIL_PIP / 2 - 1,
                    left: "50%",
                    width: "50%",
                    height: 2,
                    background: done ? DONE_GREEN : "rgba(255,247,230,0.18)",
                  }}
                />
              )}
              <span
                aria-hidden
                style={{
                  position: "relative",
                  zIndex: 1,
                  width: RAIL_PIP,
                  height: RAIL_PIP,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  background: done ? "rgba(126,226,168,0.2)" : now ? `${accent}2e` : "rgba(0,0,0,0.3)",
                  border: `2px solid ${done ? DONE_GREEN : now ? accent : "rgba(255,247,230,0.24)"}`,
                  boxShadow: now && !reduce ? `0 0 14px ${accent}88` : "none",
                  color: done ? DONE_GREEN : now ? "#fff7e6" : "rgba(255,247,230,0.5)",
                  fontFamily: LABEL_FONT,
                  fontSize: 13,
                  fontWeight: 900,
                  lineHeight: 1,
                  transition: "background 240ms ease, border-color 240ms ease",
                }}
              >
                {done ? <PixIcon emoji="✅" size={20} /> : i + 1}
              </span>
              <span
                style={{
                  fontFamily: LABEL_FONT,
                  fontSize: 9.5,
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  textAlign: "center",
                  lineHeight: 1.2,
                  color: done ? DONE_GREEN : now ? "#fff7e6" : "rgba(255,247,230,0.5)",
                  overflowWrap: "anywhere",
                }}
              >
                {st.stepLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  /* ───────── The situation: where the child is standing right now ───────── */
  const situation: ReactNode = s ? (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, minHeight: 16, ...eyebrowStyle }}>
        <PixIcon emoji="🔔" size={16} />
        <span>{situationLabel}</span>
      </div>
      <div
        role="status"
        style={{
          minHeight: SITUATION_MIN_H,
          borderRadius: 18,
          background: SITUATION_BG,
          border: "1.5px solid rgba(255,209,88,0.45)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
          padding: "12px 14px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          color: "#fff7e6",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`sit-${s.id}`}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            transition={{ duration: 0.26 }}
            style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}
          >
            <span
              aria-hidden
              style={{
                flexShrink: 0,
                width: 52,
                height: 52,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                background: "rgba(8,6,14,0.4)",
                border: "2px solid rgba(255,209,88,0.5)",
              }}
            >
              <PixIcon emoji="📱" size={32} />
            </span>
            <span style={{ flex: 1, minWidth: 0, fontFamily: KID_FONT, fontSize: 16.5, fontWeight: 800, lineHeight: 1.3, overflowWrap: "anywhere" }}>
              {s.situation}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  ) : null;

  /* ───────── The three moves. Same paper, size and ink, every step ───────── */
  const renderCard = (o: DrillOption, order: number): ReactNode => {
    if (!s) return null;
    const chosen = cleared === o.id;
    const glow = guided && !sealed && !speaking;
    return (
      <motion.button
        key={`${s.id}-${o.id}`}
        type="button"
        aria-label={o.label}
        onClick={() => move(o)}
        disabled={speaking}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.24, delay: reduce ? 0 : 0.1 + order * 0.08 }}
        whileTap={speaking || reduce ? undefined : { scale: 0.97 }}
        style={{
          position: "relative",
          flex: `1 1 ${CARD_MIN_W}px`,
          minWidth: 0,
          minHeight: CARD_MIN_H,
          padding: "10px 12px",
          borderRadius: 16,
          // Every card wears the same paper, size and ink, every step: nothing
          // may hint at the next move before the tap.
          background: PAPER,
          border: `3px solid ${chosen ? "#16a34a" : "#ffffff"}`,
          boxShadow: chosen
            ? "0 0 20px rgba(22,163,74,0.5), inset 0 0 0 1.5px rgba(42,31,24,0.14)"
            : "0 10px 20px -12px rgba(0,0,0,0.85), inset 0 0 0 1.5px rgba(42,31,24,0.14)",
          color: INK,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          fontFamily: KID_FONT,
          fontSize: 15,
          fontWeight: 800,
          lineHeight: 1.2,
          textAlign: "center",
          cursor: speaking ? "wait" : "pointer",
          touchAction: "manipulation",
          transition: "border-color 200ms ease, box-shadow 200ms ease",
          ...guideStyle(glow),
        }}
      >
        <PixIcon emoji={o.icon} size={32} />
        <span style={{ overflowWrap: "anywhere" }}>{o.label}</span>
        {chosen && (
          <motion.span
            aria-hidden
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 380, damping: 14 }}
            style={{ position: "absolute", top: -10, right: -8, display: "grid", placeItems: "center" }}
          >
            <PixIcon emoji="✅" size={26} />
          </motion.span>
        )}
      </motion.button>
    );
  };

  return (
    <ExerciseFrame maxWidth={860} decor>
      {fx.layer()}
      {verdict.element}

      {showIntro && (
        <ExerciseIntroBeat
          title={introTitle}
          subtitle={introSubtitle}
          icon={introIcon}
          narration={introNarration}
          threat={threat}
          character={introNarration?.speaker}
          onDismiss={startBoard}
        />
      )}

      {/* Sarah's read-alouds (audio only): the how-to once, then each situation. */}
      {!showIntro && !finished && s && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="dr-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent={accent} recordedOnly onDone={() => setNarr("read")} />
          )}
          {narr === "read" && (
            <InfoNarration key={`dr-read-${s.id}`} speaker={voice} lines={[s.situation]} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
        </div>
      )}

      {!showIntro && !finished && s && (
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Side padding keeps the header clear of the frame's corner ornaments. */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "2px 22px 0" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: accent }}>
              <PixIcon emoji={introIcon} size={16} />
              {introTitle}
            </span>
            <span style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c9b8ff" }}>
              Step {Math.min(idx + 1, steps.length)} of {steps.length}
            </span>
          </div>

          {/* The board: the rail, the situation, the three moves. Inset 22px so
              it never collides with the frame's rounded corners. */}
          <div
            style={{
              margin: "0 22px",
              padding: "12px 12px 12px",
              borderRadius: 18,
              background: "linear-gradient(180deg, rgba(0,0,0,0.26) 0%, rgba(0,0,0,0.4) 100%)",
              border: `1px solid ${accent}44`,
              boxShadow: `0 18px 40px -22px rgba(0,0,0,0.8), inset 0 0 0 1px ${accent}14`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            {rail}
            {situation}

            <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ ...eyebrowStyle, minHeight: 14, display: "flex", alignItems: "center", gap: 6 }}>
                <PixIcon emoji="❓" size={16} />
                {NEXT_PROMPT}
              </div>
              <div
                role="group"
                aria-label={NEXT_PROMPT}
                style={{ width: "100%", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}
              >
                {deck.map(renderCard)}
              </div>
            </div>
          </div>

          {/* On-board instructions: the current beat, in the child's words. */}
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <div style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: accent, minHeight: 16, padding: "0 16px" }}>
              {strip}
            </div>
          </div>

          <div style={{ maxWidth: 560, margin: "8px auto 0" }}>
            {hintText && <HintBubble tier={hintTier} speaker={voice} text={hintText} />}
          </div>

          <style>{`
            @keyframes drGuide { 0%,100% { box-shadow: 0 0 0 3px ${accent}55, 0 0 16px ${accent}77 } 50% { box-shadow: 0 0 0 6px ${accent}22, 0 0 28px ${accent} } }
          `}</style>
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

      {/* The payoff waits for Sarah: a complete beat that mounts while the last
          verdict is still speaking would cut her off (the Week 9 bug). */}
      {finished && !verdict.speaking && (
        <ExerciseCompleteBeat
          title={completeTitle}
          stars={stars}
          statLines={[
            `${steps.length} step${steps.length === 1 ? "" : "s"} of the protocol, run in order`,
            completeLine,
          ]}
          narration={completeNarration}
          onContinue={() => onComplete(stars === 3 ? 100 : stars === 2 ? 70 : 40)}
        />
      )}
    </ExerciseFrame>
  );
}
