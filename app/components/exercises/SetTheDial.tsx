"use client";

/**
 * SetTheDial: the SET IT BEFORE YOU START drill (Week 13, "Set the Dial").
 *
 * The child stands at a control desk in the power station, OUTSIDE the screen,
 * before anything has switched on. A situation opens on the desk ("Saturday
 * morning, the tablet is charged and the whole day is yours") and Sarah reads
 * it out. Under it sit three dials, and the child turns each one until the
 * plan on the desk is the plan they want:
 *
 *   HOW LONG    how much screen this is going to be
 *   WHAT AFTER  what the power goes into once the screen goes off
 *   WHO KNOWS   who else knows the plan, so it is not yours alone to hold
 *
 * Every dial cycles through its own choices on a tap, and NOTHING is judged
 * while the child turns them. The judged moment is the big AGREE press at the
 * bottom, and what gets judged is the WHOLE PLAN: Sarah names what is good
 * about it, or, if a dial is still doing nothing for the child, says what is
 * missing and the desk marks WHICH DIAL to look at again (never which value to
 * put it on). The child turns that dial and agrees again. That is the lesson
 * in one gesture: a plan made at the desk, before the screen, is easy; the
 * same decision made from inside the screen is much, much harder.
 *
 * Never anti-screen. Every HOW LONG dial has a real amount of screen on it,
 * because balance means SOME, not none. Nothing here tells a child off for
 * loving their game.
 *
 * Why it is not Track Back, the Drill Run, Who Would Know or the Trail Planner
 * (owner: "we never copy an exercise"): all four of those are read a situation,
 * tap one of three cards. Here there are no cards and no single answer. The
 * child BUILDS a thing out of three independent parts, holds it, changes their
 * mind, and commits it with a separate press, and the verdict is on the
 * combination rather than on a pick. Compose and commit, not pick one of three.
 *
 * Nothing races the child: tap-only, untimed, no timers, no lose state, no
 * penalty for a plan with a gap in it beyond Sarah explaining it.
 *
 * Learn-Loop wiring: Raccoon boast in the intro (`threat`), Sarah's how-to once
 * and every round's `readAloud` spoken as the situation opens (audio-only,
 * `recordedOnly`, taps held, released by the shared SPOKEN_GATE_MAX_MS), a
 * one-take spoken verdict on the AGREE press ("That's right!" + the round's
 * `why` via VerdictVoice; a plan with a gap: WrongAnswerPanel speaks "Not
 * quite." + the round's `explanation`), hint tiers per round, and a payoff on
 * the complete beat gated on `!verdict.speaking` so it can never cut Sarah
 * off. The next round is opened from the verdict's own callback, so no payoff
 * can cut her off either. Rounds play in authored order; the choices inside
 * each dial are shuffled, so a dial's good value is never in a fixed slot. A
 * synchronous ref latch shuts the AGREE press the instant it is taken, because
 * `canTap` only closes once React re-renders on `verdict.speaking` and a quick
 * second press would otherwise restart the verdict and cut Sarah off (the real
 * Week 12 bug).
 *
 * Round 1 guides the MECHANIC only: all three dials breathe together until
 * they have each been turned, then the AGREE press breathes. The glow says
 * "turn these" and "now commit it", never which value is the good one. Every
 * dial wears the same face, the same size and the same ink, set or unset.
 *
 * CRITICAL for the week author: every spoken string arrives through props
 * (`introNarration`, `coachLines`, `threat`, each round's `readAloud`, `why`
 * and `explanation`, `hints`, `completeNarration`). The clip generator reads
 * the WEEK FILE, so anything left to a component default is never recorded and
 * plays as silence, with no error anywhere.
 *
 * Authoring: give every dial three choices (a two-item list always comes back
 * reversed, so the shuffle needs three), and exactly one `isGood: true` per
 * dial. A plan is right only when all three dials sit on a good choice. Keep a
 * choice `label` to about 22 characters (it sits inside the dial face), a
 * `situation` to about 80, `readAloud` to one sentence, and `why` and
 * `explanation` to one kid-sized sentence each. `why` is what Sarah says about
 * a whole good plan; `explanation` is the calm teach line when a dial is still
 * doing nothing for the child. Every icon must be in PixIcon's MAP or it
 * renders as a flat system emoji.
 *
 * Layout budget at the owner's 1414x771 window (HUD 64 + stage padding 40, so
 * the stage holds ~627px before it grows): header 29 + marginBottom 10 + board
 * 26 (padding and border) + situation 116 (eyebrow 16, gap 6, card 94) + gap 12
 * + three dial rows 190 (3 x 58 + 2 x 8) + gap 12 + agree 52 + strip 28 + hint
 * gap 8 = ~483px, so the situation, all three dials and the press are on screen
 * without a scroll. At 400px each dial row stacks its face under its name and
 * nothing scrolls sideways.
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
// she reads is already on screen), same recipe as DrillRun / TrackBack.
const AUDIO_ONLY_STYLE = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  pointerEvents: "none",
} as const;
// SPOKEN_GATE_MAX_MS is shared: see app/lib/gameEngine/spokenGate.ts.

export interface DialChoice { id: string; label: string; icon: string; isGood: boolean; }
export interface PlanRound {
  id: string;
  situation: string;        // shown on the desk
  readAloud: string;        // spoken as the round opens
  dials: { howLong: DialChoice[]; whatAfter: DialChoice[]; whoKnows: DialChoice[] };
  why: string;              // Sarah's reason when the whole plan is good
  explanation: string;      // Sarah's teach when something is missing
}
export interface SetTheDialProps {
  rounds: PlanRound[];
  introTitle?: string; introSubtitle?: string; introIcon?: string;
  deskLabel?: string;        // default "THE PLAN DESK"
  howLongLabel?: string;     // default "HOW LONG"
  whatAfterLabel?: string;   // default "WHAT AFTER"
  whoKnowsLabel?: string;    // default "WHO KNOWS"
  agreeLabel?: string;       // default "AGREE IT"
  completeTitle?: string; completeLine?: string;
  hints?: { tier1: string; tier2: string };
  introNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  coachLines?: { speaker?: "adam" | "layla"; lines: string[] };
  threat?: { raccoonLine: string };
  completeNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  onComplete: (score: number) => void;
  onCorrect?: () => void; onWrong?: () => void;
  onHintReached?: (tier: 1 | 2 | 3) => void;
  onAnswered?: (o: { questionKey: string; selectedIndex: number; correctIndex: number; wasCorrect: boolean }) => void;
}

type DialKey = "howLong" | "whatAfter" | "whoKnows";
const DIAL_KEYS: DialKey[] = ["howLong", "whatAfter", "whoKnows"];

/** Fixed chrome copy the props above do not cover (never spoken, so it can
 *  safely live here). Warm on purpose: a gap in a plan is not a telling-off. */
const PLAN_TOAST = "PLAN SET!";
const WRONG_TITLE = "Your plan is nearly there";
const UNSET_FACE = "Not set yet";
const LOOK_AGAIN = "LOOK AGAIN";
const DIAL_HINT = "Tap to turn";

const EMPTY_CHOICES: DialChoice[] = [];
const KID_FONT = "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif";
const LABEL_FONT = "'Space Grotesk', sans-serif";
/** Geometry (px). */
const KNOB = 40;
const SITUATION_MIN_H = 94;
const DIAL_MIN_H = 58;
const AGREE_MIN_H = 52;
/** Paints. A warm control desk in the power station: lit, calm, never an alarm. */
const SITUATION_BG = "linear-gradient(180deg, rgba(255,209,88,0.13) 0%, rgba(255,209,88,0.05) 100%)";
const PAPER = "#fff6e8";
const INK = "#2a1f18";
const SET_GREEN = "#16a34a";
const LOOK_AMBER = "#ffb347";

export default function SetTheDial({
  rounds,
  introTitle = "Set the Dial",
  introSubtitle = "Turn all three dials to make your plan, then agree it.",
  introIcon = "⚙️",
  deskLabel = "THE PLAN DESK",
  howLongLabel = "HOW LONG",
  whatAfterLabel = "WHAT AFTER",
  whoKnowsLabel = "WHO KNOWS",
  agreeLabel = "AGREE IT",
  completeTitle = "Every plan agreed!",
  completeLine = "You set it before you started, Cyber Hero. That is the easy place to decide.",
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
}: SetTheDialProps) {
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
  // Read-aloud chain: the how-to once as the desk opens, then each round's
  // line as its situation opens. Taps are held while she speaks.
  const [narr, setNarr] = useState<"howto" | "read" | "idle">("idle");
  // Where each dial is pointing, as an index into that dial's shuffled
  // choices. null = the child has not turned it yet.
  const [pos, setPos] = useState<Record<DialKey, number | null>>({ howLong: null, whatAfter: null, whoKnows: null });
  // The dials the desk has asked the child to look at again (never a value).
  const [lookAgain, setLookAgain] = useState<DialKey[]>([]);
  // Set once the whole plan has been agreed and Sarah is saying why.
  const [agreed, setAgreed] = useState(false);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [roundWrongs, setRoundWrongs] = useState(0);
  const [totalWrongs, setTotalWrongs] = useState(0);

  // The rounds play in AUTHORED order; only the choices inside each dial are
  // shuffled, so a dial's good value is never in a fixed slot.
  const finished = idx >= rounds.length;
  const r = rounds[idx];
  const roundKey = r?.id ?? "done";
  const howLongDeck = useShuffledOnce(r?.dials.howLong ?? EMPTY_CHOICES, { key: `${roundKey}-how-long` });
  const whatAfterDeck = useShuffledOnce(r?.dials.whatAfter ?? EMPTY_CHOICES, { key: `${roundKey}-what-after` });
  const whoKnowsDeck = useShuffledOnce(r?.dials.whoKnows ?? EMPTY_CHOICES, { key: `${roundKey}-who-knows` });
  const decks: Record<DialKey, DialChoice[]> = { howLong: howLongDeck, whatAfter: whatAfterDeck, whoKnows: whoKnowsDeck };
  const dialNames: Record<DialKey, string> = { howLong: howLongLabel, whatAfter: whatAfterLabel, whoKnows: whoKnowsLabel };
  const dialIcons: Record<DialKey, string> = { howLong: "⏱️", whatAfter: "💪", whoKnows: "👪" };

  // Spoken verdicts: Sarah says "That's right!" + why, and the next round waits
  // for her. A plan with a gap speaks through WrongAnswerPanel.
  const verdict = useVerdictVoice(voice);
  const speaking = narr !== "idle" || verdict.speaking || !!feedback || agreed;
  // `speaking` only closes once React has re-rendered, so a quick second press
  // of AGREE landed inside that window and restarted the verdict, cutting Sarah
  // off mid-sentence (the Week 12 bug). This latch shuts it synchronously.
  const agreeingRef = useRef(false);

  const choiceAt = (k: DialKey): DialChoice | null => {
    const i = pos[k];
    return i === null ? null : decks[k][i] ?? null;
  };
  const allSet = DIAL_KEYS.every((k) => pos[k] !== null);
  const planGood = allSet && DIAL_KEYS.every((k) => choiceAt(k)?.isGood === true);

  // Safety releases for the spoken gate (never leave the desk held).
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
    setPos({ howLong: null, whatAfter: null, whoKnows: null });
    setLookAgain([]);
    setAgreed(false);
    setRoundWrongs(0);
    setNarr(isAudioMuted() ? "idle" : "read");
    agreeingRef.current = false;
  };

  /* ───────── TURN: the unjudged taps. Nothing is scored out here ───────── */
  const turn = (k: DialKey) => {
    if (!r || speaking) return;
    const deck = decks[k];
    if (deck.length === 0) return;
    audio.select();
    setPos((prev) => {
      const at = prev[k];
      return { ...prev, [k]: at === null ? 0 : (at + 1) % deck.length };
    });
    // Turning a flagged dial clears its flag: the child is looking at it again.
    setLookAgain((prev) => prev.filter((d) => d !== k));
  };

  /* ───────── AGREE: the only judged press. The WHOLE plan is judged ───────── */
  const agree = () => {
    if (!r || speaking || !allSet) return;
    if (agreeingRef.current) return;
    agreeingRef.current = true;
    onAnswered?.({
      questionKey: `setthedial-${r.id}`,
      // A plan is one answer: 0 = the whole plan was good, 1 = a dial was
      // still doing nothing for the child, so the dashboard reads the same
      // numbers however the dials were turned.
      selectedIndex: planGood ? 0 : 1,
      correctIndex: 0,
      wasCorrect: planGood,
    });
    if (planGood) {
      fx.correct({ xp: 25, text: PLAN_TOAST });
      onCorrect?.();
      setAgreed(true);
      // Sarah: "That's right!" + this plan's why, then the next situation.
      // Advancing from her callback is what keeps a payoff from ever cutting
      // her off.
      verdict.say("right", r.why, () => {
        window.setTimeout(advance, reduce ? 200 : 900);
      });
    } else {
      audio.wrong();
      onWrong?.();
      setTotalWrongs((n) => n + 1);
      const rw = roundWrongs + 1;
      setRoundWrongs(rw);
      // The desk marks WHICH dial to look at again, never which value to put
      // it on: the child turns it themselves and agrees again.
      setLookAgain(DIAL_KEYS.filter((k) => choiceAt(k)?.isGood !== true));
      // WrongAnswerPanel speaks "Not quite." + this teach line itself; every
      // dial keeps its value, so the fix is one turn and one press.
      setFeedback({ title: WRONG_TITLE, explanation: r.explanation, tip: rw >= 2 ? hints?.tier2 : hints?.tier1 });
      agreeingRef.current = false;
    }
  };

  const stars = totalWrongs === 0 ? 3 : totalWrongs <= 2 ? 2 : 1;
  const hintText = roundWrongs >= 2 ? hints?.tier2 : roundWrongs === 1 ? hints?.tier1 : undefined;
  const hintTier = (roundWrongs >= 2 ? 2 : 1) as 1 | 2;
  // Round 1 teaches the mechanic only: the dials breathe together until each
  // has been turned, then the press breathes. Never one dial, never one value.
  const guided = idx === 0 && roundWrongs === 0 && !agreed && !speaking;
  const guideDials = guided && !allSet;
  const guideAgree = guided && allSet;
  const guideStyle = (on: boolean): CSSProperties =>
    on
      ? { boxShadow: `0 0 0 3px ${accent}66, 0 0 22px ${accent}88`, animation: reduce ? undefined : "sdGuide 1.4s ease-in-out infinite" }
      : {};
  const strip = agreed
    ? PLAN_TOAST
    : lookAgain.length > 0
      ? "Give that dial another turn, then agree it again"
      : !allSet
        ? guided
          ? "Round 1: tap each dial to turn it"
          : "Turn all three dials to build your plan"
        : `Happy with your plan? Press ${agreeLabel}`;

  const eyebrowStyle: CSSProperties = {
    fontFamily: LABEL_FONT,
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: accent,
  };

  /* ───────── The situation: what the child is standing in front of ───────── */
  const situation: ReactNode = r ? (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, minHeight: 16, ...eyebrowStyle }}>
        <PixIcon emoji="⚡" size={16} />
        <span>{deskLabel}</span>
        <span style={{ marginLeft: "auto", color: "rgba(255,247,230,0.65)" }}>
          {Math.min(idx + (agreed ? 1 : 0), rounds.length)} of {rounds.length}
        </span>
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
            key={`sit-${r.id}`}
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
              <PixIcon emoji="🎮" size={32} />
            </span>
            <span style={{ flex: 1, minWidth: 0, fontFamily: KID_FONT, fontSize: 16.5, fontWeight: 800, lineHeight: 1.3, overflowWrap: "anywhere" }}>
              {r.situation}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  ) : null;

  /* ───────── One dial. Same face, size and ink, set or unset ───────── */
  const renderDial = (k: DialKey, order: number): ReactNode => {
    if (!r) return null;
    const at = pos[k];
    const choice = choiceAt(k);
    const flagged = lookAgain.includes(k);
    // Nothing is judged out here, so a set dial goes green only once the whole
    // plan has been agreed: a dial must never give its own answer away.
    const sealedGood = agreed;
    return (
      <motion.button
        key={`${r.id}-${k}`}
        type="button"
        aria-label={`${dialNames[k]}: ${choice ? choice.label : UNSET_FACE}. ${DIAL_HINT}`}
        onClick={() => turn(k)}
        disabled={speaking}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.24, delay: reduce ? 0 : 0.08 + order * 0.07 }}
        whileTap={speaking || reduce ? undefined : { scale: 0.985 }}
        style={{
          position: "relative",
          width: "100%",
          minHeight: DIAL_MIN_H,
          padding: "8px 12px",
          borderRadius: 16,
          // Every dial wears the same paper, size and ink, every round: nothing
          // may hint at the good value before the press.
          background: PAPER,
          border: `3px solid ${sealedGood ? SET_GREEN : flagged ? LOOK_AMBER : "#ffffff"}`,
          boxShadow: sealedGood
            ? "0 0 20px rgba(22,163,74,0.45), inset 0 0 0 1.5px rgba(42,31,24,0.14)"
            : "0 10px 20px -12px rgba(0,0,0,0.85), inset 0 0 0 1.5px rgba(42,31,24,0.14)",
          color: INK,
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
          textAlign: "left",
          cursor: speaking ? "wait" : "pointer",
          touchAction: "manipulation",
          transition: "border-color 200ms ease, box-shadow 200ms ease",
          ...guideStyle(guideDials),
        }}
      >
        {/* The knob: it turns a notch with every tap, so the tap feels like a
            dial and not a card. A plain div, so no SVG transform-box trap. */}
        <motion.span
          aria-hidden
          animate={{ rotate: at === null ? -50 : -50 + ((at + 1) * 360) / Math.max(decks[k].length + 1, 2) }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 18 }}
          style={{
            flexShrink: 0,
            width: KNOB,
            height: KNOB,
            borderRadius: "50%",
            background: "radial-gradient(circle at 34% 30%, #ffffff 0%, #e9dcc6 58%, #cdbb9c 100%)",
            border: `2px solid ${INK}`,
            display: "grid",
            placeItems: "center",
            boxShadow: "inset 0 -2px 4px rgba(42,31,24,0.22)",
          }}
        >
          {/* The pointer line, from the middle out to the rim. */}
          <span style={{ display: "block", width: 3, height: KNOB / 2 - 5, marginBottom: KNOB / 2, borderRadius: 2, background: INK }} />
        </motion.span>

        <span
          style={{
            flexShrink: 0,
            minWidth: 88,
            fontFamily: LABEL_FONT,
            fontSize: 10.5,
            fontWeight: 900,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "rgba(42,31,24,0.72)",
            lineHeight: 1.25,
            overflowWrap: "anywhere",
          }}
        >
          {dialNames[k]}
        </span>

        {/* The face: what this dial currently says. */}
        <span
          style={{
            flex: "1 1 150px",
            minWidth: 0,
            minHeight: 36,
            padding: "5px 10px",
            borderRadius: 11,
            background: choice ? "rgba(42,31,24,0.07)" : "rgba(42,31,24,0.045)",
            border: `2px ${choice ? "solid" : "dashed"} rgba(42,31,24,0.28)`,
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: KID_FONT,
            fontSize: 14.5,
            fontWeight: 800,
            lineHeight: 1.2,
            color: choice ? INK : "rgba(42,31,24,0.55)",
            overflowWrap: "anywhere",
          }}
        >
          {choice ? (
            <>
              <PixIcon emoji={choice.icon} size={24} />
              <span style={{ minWidth: 0 }}>{choice.label}</span>
            </>
          ) : (
            <>
              <PixIcon emoji="👆" size={22} />
              <span style={{ minWidth: 0 }}>{UNSET_FACE}</span>
            </>
          )}
        </span>

        {flagged && (
          <motion.span
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            style={{
              flexShrink: 0,
              padding: "3px 8px",
              borderRadius: 999,
              background: LOOK_AMBER,
              color: INK,
              fontFamily: LABEL_FONT,
              fontSize: 9.5,
              fontWeight: 900,
              letterSpacing: "0.12em",
            }}
          >
            {LOOK_AGAIN}
          </motion.span>
        )}

        {sealedGood && (
          <motion.span
            aria-hidden
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 380, damping: 14 }}
            style={{ position: "absolute", top: -10, right: -8, display: "grid", placeItems: "center" }}
          >
            <PixIcon emoji="✅" size={24} />
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

      {/* Sarah's read-alouds (audio only): the how-to once, then each round.
          Every line comes from the week file, never from a default. */}
      {!showIntro && !finished && r && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="sd-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent={accent} recordedOnly onDone={() => setNarr("read")} />
          )}
          {narr === "read" && (
            <InfoNarration key={`sd-read-${r.id}`} speaker={voice} lines={[r.readAloud]} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
        </div>
      )}

      {!showIntro && !finished && r && (
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Side padding keeps the header clear of the frame's corner ornaments. */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "2px 22px 0" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: accent }}>
              <PixIcon emoji={introIcon} size={16} />
              {introTitle}
            </span>
            <span style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c9b8ff" }}>
              Plan {Math.min(idx + 1, rounds.length)} of {rounds.length}
            </span>
          </div>

          {/* The desk: the situation, the three dials, the press. Inset 22px so
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
            {situation}

            <div
              role="group"
              aria-label={deskLabel}
              style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}
            >
              {DIAL_KEYS.map((k, i) => (
                <div key={k} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, minHeight: 14, ...eyebrowStyle }}>
                    <PixIcon emoji={dialIcons[k]} size={14} />
                    <span>{dialNames[k]}</span>
                    <span style={{ marginLeft: "auto", color: "rgba(255,247,230,0.5)", letterSpacing: "0.12em" }}>{DIAL_HINT}</span>
                  </div>
                  {renderDial(k, i)}
                </div>
              ))}
            </div>

            {/* The commit. Nothing at all is judged until this is pressed. */}
            <motion.button
              type="button"
              aria-label={agreeLabel}
              onClick={agree}
              disabled={speaking || !allSet}
              whileTap={speaking || !allSet || reduce ? undefined : { scale: 0.97 }}
              style={{
                width: "100%",
                minHeight: AGREE_MIN_H,
                padding: "10px 16px",
                borderRadius: 16,
                background: allSet ? `linear-gradient(180deg, ${accent} 0%, ${accent}cc 100%)` : "rgba(255,255,255,0.08)",
                border: `3px solid ${allSet ? "#ffffff" : "rgba(255,247,230,0.22)"}`,
                boxShadow: allSet ? `0 12px 26px -14px ${accent}, inset 0 1px 0 rgba(255,255,255,0.35)` : "none",
                color: allSet ? "#0b0f22" : "rgba(255,247,230,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                fontFamily: LABEL_FONT,
                fontSize: 15,
                fontWeight: 900,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: !allSet ? "default" : speaking ? "wait" : "pointer",
                touchAction: "manipulation",
                transition: "background 220ms ease, border-color 220ms ease, color 220ms ease",
                ...guideStyle(guideAgree),
              }}
            >
              <PixIcon emoji="👍" size={24} />
              <span style={{ overflowWrap: "anywhere" }}>{agreeLabel}</span>
            </motion.button>
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
            @keyframes sdGuide { 0%,100% { box-shadow: 0 0 0 3px ${accent}55, 0 0 16px ${accent}77 } 50% { box-shadow: 0 0 0 6px ${accent}22, 0 0 28px ${accent} } }
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
            `${rounds.length} plan${rounds.length === 1 ? "" : "s"} set at the desk, before a single screen switched on`,
            completeLine,
          ]}
          narration={completeNarration}
          onContinue={() => onComplete(stars === 3 ? 100 : stars === 2 ? 70 : 40)}
        />
      )}
    </ExerciseFrame>
  );
}
