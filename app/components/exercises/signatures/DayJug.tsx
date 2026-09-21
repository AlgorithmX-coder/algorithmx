"use client";

/**
 * THE DAY JUG: Week 13 (Screen Time: Balance Your Power) concept game, rebuilt
 * as a data-driven, TAP-ONLY, UNTIMED concept game to the Learn-Loop standard
 * (the same conversion the Great Climb-Out got for Week 10, the Calm-Down
 * Console for Week 11 and Read Your Own Trail for Week 12).
 *
 * The old Day Jug asked the child to DRAG a jug along a rail and HOLD it still
 * over a cup to tilt and pour, with a live trickle draining in real time.
 * Nothing is dragged, held or timed any more.
 *
 * The child now stands in The Power Station with today's jug hanging full over
 * a row of cups. Concept 2, THE TRADE: a day holds only so much, so pouring
 * more into one cup means less in another. This is a budget, never a telling
 * off. Screens are brilliant, they simply have a size, and the question is
 * never "none", it is "how much".
 *
 *   Each pour says what wants the day (the pour's `readAloud`), and three
 *   uniform choices slide in underneath. They wear the same paint, the same
 *   size and the same chrome, so nothing gives the answer away: exactly one is
 *   the hero's trade, and the other two pretend the jug can grow.
 *
 *   Right call: the jug tips, a stream runs into that cup, the cup lights and
 *     stays lit, the jug's own level drops by one share, and Sarah says
 *     "That's right!" + the option's `why` in one take.
 *   Wrong call: the cup trembles and spills, the shared teach panel speaks
 *     "Not quite." + the option's `explanation`, that choice is marked, and
 *     the SAME pour waits for the retry. Nothing already poured is lost: a cup
 *     the hero has filled stays filled.
 *
 * There is no timer, no dragging, no hold and no fail state: the only thing
 * that ever pours the jug is a tap. The last pour empties the jug, lights the
 * whole row and raises the "DAY BALANCED!" banner, then the complete beat
 * speaks the payoff.
 *
 * Learn-Loop wiring: the Raccoon's boast folds into the shared intro
 * (`threat`); Sarah speaks the how-to once as the board appears (`coachLines`),
 * then each pour's `readAloud` and every option `label` as the pour arrives
 * (audio only, `recordedOnly`, the board held while she speaks and released by
 * the shared spoken gate); a right call speaks through VerdictVoice, a wrong
 * one through WrongAnswerPanel; the complete beat speaks the payoff, and it is
 * held back until Sarah has finished (the Week 9 bug). Round 1 guides the
 * MECHANIC only: the choice row breathes and the band says what to do, never
 * which choice.
 *
 * EVERY spoken string comes from the week file. The clip generator reads the
 * week, never this engine, so the defaults below exist for one reason only:
 * to keep the legacy signature mount (`{ onComplete, narration, accent }`)
 * compiling and playable with no content file.
 *
 * Layout: the header, prompt strip, station panel, choice band and hint all fit
 * the owner's 1414x771 window (the station shrinks with the window), and the
 * choice row stacks rather than scrolling sideways at 400px.
 */

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import ExerciseIntroBeat, { ExerciseCompleteBeat } from "@/app/components/lesson/ExerciseBeats";
import WrongAnswerPanel from "@/app/components/lesson/WrongAnswerPanel";
import HintBubble from "@/app/components/lesson/HintBubble";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import PixIcon from "@/app/components/lesson/PixIcon";
import { useVerdictVoice } from "@/app/components/lesson/VerdictVoice";
import { useLessonTheme } from "@/app/components/lesson/LessonThemeContext";
import { useGameAudio } from "@/app/lib/gameEngine/useGameAudio";
import { useExerciseFeedback } from "@/app/lib/gameEngine/useExerciseFeedback";
import { useMotionIntensity } from "@/app/lib/gameEngine/useMotionIntensity";
import { useShuffledOnce } from "@/app/lib/gameEngine/useShuffledOnce";
import { isAudioMuted, subscribeAudioMute } from "@/app/lib/audioMute";
import { SPOKEN_GATE_MAX_MS } from "@/app/lib/gameEngine/spokenGate";

// Audio-only narration: Sarah's voice with no visible narration box (the words
// she reads are already on the strip and on the choices), the same recipe as
// Read Your Own Trail and the Great Climb-Out.
const AUDIO_ONLY_STYLE = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  pointerEvents: "none",
} as const;
// SPOKEN_GATE_MAX_MS is shared: see app/lib/gameEngine/spokenGate.ts.

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export interface JugPour { id: string; label: string; icon: string; readAloud: string; options: { id: string; label: string; icon: string; isRight: boolean; why: string; explanation: string }[]; }
export interface DayJugProps {
  pours?: JugPour[];                 // optional: built-in defaults keep the legacy registry mount working
  introTitle?: string; introSubtitle?: string; introIcon?: string;
  jugLabel?: string;                 // default "TODAY'S JUG"
  askPrompt?: string;                // default "What has to give?"
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

/**
 * One choice under a pour. A local alias of the inline option type above, so
 * the exported prop contract stays byte-identical to the one the week file and
 * `types.ts` are wired against.
 */
type JugOption = JugPour["options"][number];

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

const FRAME_MAX_W = 860;
const FRAME_PAD_Y = 16;
/**
 * ExerciseFrame gives a DOM board no side padding of its own and its corners
 * are rounded by 28px, so a flush board collides with the curve and with the
 * frame's corner ornaments. The whole column is inset instead (the same fix
 * BelieveOMeter now carries).
 */
const BOARD_INSET_X = 22;
const BOARD_GAP = 8;
const HEADER_H = 28;
const STRIP_H = 40;

/**
 * Window height that is not the station scene: lesson HUD 64 + stage padding 80
 * + frame padding 32 + header 28 + gaps 24 + strip 40 + choice band 134 + hint
 * room 70 + 8 spare. At 1414x771 the station takes its full height and nothing
 * needs a scroll.
 */
const HEIGHT_RESERVE_PX = 480;
const MAX_SCENE_H = 270;
const MIN_SCENE_H = 168;

/** Room the choice band needs under the station. */
const BAND_MIN_H = 130;

/**
 * Where the spout sits across the jug's own width (0 = its left edge, 1 = its
 * right). The jug hangs so that its spout is just left of the cup's centre:
 * any further right and the jug's body runs off the panel over the first cup
 * at 400px, any further left and the stream stops looking like it came out of
 * the spout.
 */
const JUG_SPOUT_FRAC = 0.84;
/** How far right of the cup's centre the stream falls, in jug widths. */
const STREAM_OFFSET_FRAC = 0.18;

/** How much of a cup the day fills when its pour has been traded. */
const CUP_FILL_FRAC = 0.74;

const SPILL_MS = 720;
const SPILL_MS_REDUCED = 260;
const NEXT_POUR_MS = 820;
const STREAM_MS = 760;
const BALANCE_MS = 1500;

const GOOD_GREEN = "#34d399";
const BAD_RED = "#ff5d5d";
const DAY_GOLD = "#ffc46e";
const WATER = "#6fe3d6";
const DEFAULT_TINT = "#5fe0d2";

const WRONG_TITLE = "That one spills somewhere else";
const FALLBACK_EXPLANATION =
  "That pour takes from a cup nobody chose. Look for the one that decides where the time comes from.";

/* ------------------------------------------------------------------ */
/* Default content (the legacy signature mount)                       */
/* ------------------------------------------------------------------ */

/*
 * Authoring rule for a pour: exactly ONE option has `isRight: true`. Only a
 * right option's `why` is ever spoken (it can never be tapped wrongly) and only
 * a wrong option's `explanation` is ever spoken (it can never be right), so the
 * unused half of each pair stays empty rather than being filled with copy no
 * child hears. `label` is the short name of the cup on the board; the words
 * Sarah reads out are `readAloud`.
 *
 * Tone rule for this week: NEVER anti-screen. Balance means SOME, not none. The
 * screens cup is a cup like any other, and its wrong answers include "pour it
 * to zero" as well as "fill it to the brim", so the lesson can never collapse
 * into "screens are bad".
 */
const POURS: JugPour[] = [
  {
    id: "extra-hour",
    label: "One more hour on the game",
    icon: "🎮",
    readAloud:
      "Here is today's jug, Cyber Hero, and it is already full to the brim. You want one more hour on the game tonight. The jug never gets any bigger, so what has to give?",
    options: [
      {
        id: "choose-the-cup",
        label: "Choose which cup that hour comes out of",
        icon: "👆",
        isRight: true,
        why: "That is the trade. The hour is still yours to spend, you just decide where it comes from instead of letting it vanish.",
        explanation: "",
      },
      {
        id: "stretch-the-day",
        label: "Stretch the day so it holds a bit more",
        icon: "⏱️",
        isRight: false,
        why: "",
        explanation: "The jug holds one day and not a drop more. An extra hour always comes out of another cup.",
      },
      {
        id: "nobody-notices",
        label: "Pour it and hope nobody notices",
        icon: "🚫",
        isRight: false,
        why: "",
        explanation: "The jug empties even when nobody is looking. Something got less, you just did not get to choose what.",
      },
    ],
  },
  {
    id: "two-good-things",
    label: "Football and the new episode",
    icon: "💪",
    readAloud:
      "Two good things want the same last cup: football in the park, and the new episode everyone is talking about. There is only enough day for one of them, so what has to give?",
    options: [
      {
        id: "pick-and-plan",
        label: "Pick the one you want most, plan the other for tomorrow",
        icon: "🎯",
        isRight: true,
        why: "Nothing got banned there. You chose one for today and you put the other one safely in tomorrow's jug.",
        explanation: "",
      },
      {
        id: "half-each",
        label: "Do both at once, half watching and half playing",
        icon: "🔔",
        isRight: false,
        why: "",
        explanation: "Split the cup in two and both get a half, so neither one feels good. One whole thing beats two halves.",
      },
      {
        id: "drop-both",
        label: "Drop both, it is easier to do nothing",
        icon: "🚫",
        isRight: false,
        why: "",
        explanation: "Balance is not giving good things up. The cup is yours to pour, you simply get to choose where it goes.",
      },
    ],
  },
  {
    id: "screens-cup",
    label: "How much goes in the screens cup",
    icon: "📱",
    readAloud:
      "Now the screens cup. Screens are brilliant: games, videos, calling your cousin. The question is never none, it is how much, so what has to give?",
    options: [
      {
        id: "pour-on-purpose",
        label: "Pour a good scoop in on purpose, and stop where you planned",
        icon: "✋",
        isRight: true,
        why: "Some, not none. You poured a proper scoop AND you knew where the top of it was before you started.",
        explanation: "",
      },
      {
        id: "empty-the-cup",
        label: "Pour nothing in at all, screens are bad",
        icon: "🚫",
        isRight: false,
        why: "",
        explanation: "Screens are not the bad guy here. Emptying that cup is not balance, it just tips the day the other way.",
      },
      {
        id: "fill-to-the-brim",
        label: "Fill it to the brim and see what is left over",
        icon: "⏱️",
        isRight: false,
        why: "",
        explanation: "Fill one cup to the brim and the others only get the drips. That is how the rest of your good things disappear.",
      },
    ],
  },
  {
    id: "recharge-cup",
    label: "The cup that refills the jug",
    icon: "⚡",
    readAloud:
      "One cup is different from all the others. Sleep is the cup that refills tomorrow's jug, and everything else will pour out of it if you let them, so what has to give?",
    options: [
      {
        id: "recharge-first",
        label: "Fill the recharge cup first, then share out the rest",
        icon: "⚡",
        isRight: true,
        why: "Brilliant. Fill the cup that recharges you first, and tomorrow starts with a full jug instead of half of one.",
        explanation: "",
      },
      {
        id: "borrow-from-sleep",
        label: "Borrow from sleep, you can catch it up later",
        icon: "🚫",
        isRight: false,
        why: "",
        explanation: "Sleep is the one cup you cannot borrow from. Take it tonight and tomorrow's jug starts half empty.",
      },
      {
        id: "last-drops",
        label: "Give it whatever drops are left at the end",
        icon: "👍",
        isRight: false,
        why: "",
        explanation: "Whatever is left at the end is never very much. The cup that recharges you gets poured first, not last.",
      },
    ],
  },
];

const DEFAULT_INTRO_SUBTITLE =
  "The Power Station is humming and today's jug is full to the brim. Every cup you fill takes from the ones beside it, so pour like a Cyber Hero.";
const DEFAULT_COMPLETE_LINE =
  "A day holds what it holds. Choose where it pours, and every cup gets its share.";
const DEFAULT_HINTS = {
  tier1: "The jug never gets bigger. Pouring more into one cup means less in another.",
  tier2: "Pick the move that CHOOSES where the time comes from, instead of pretending the day got longer.",
};

const EMPTY_OPTIONS: JugOption[] = [];

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

// A read-aloud only starts when there is something to say and the lesson is not
// muted, so the spoken gate never waits on a clip that cannot play.
const canRead = (text?: string) => !isAudioMuted() && !!text;

/** The station height for a window: never taller than the design, never so
 *  short the cups stop reading. Read through useSyncExternalStore, so a
 *  resize re-renders with no effect-driven state. */
const sceneHeightFor = (vh: number) => Math.round(clamp(vh - HEIGHT_RESERVE_PX, MIN_SCENE_H, MAX_SCENE_H));
const subscribeViewport = (onChange: () => void) => {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
};
const readSceneH = () => sceneHeightFor(window.innerHeight);
const serverSceneH = () => MAX_SCENE_H;
/** The window's width, read the same way: the jug is capped against it so it
 *  can never hang off the panel over the leftmost cup on a phone. */
const readVw = () => window.innerWidth;
const serverVw = () => 1414;

/** Where a cup stands along the shelf, in percent of the station width. */
const cupLeftPct = (i: number, total: number) => ((i + 0.5) / Math.max(1, total)) * 100;

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

type Narr = "howto" | "read" | "option" | "idle";
type Phase = "pour" | "balanced";

export default function DayJug({
  pours = POURS,
  introTitle = "The Day Jug",
  introSubtitle = DEFAULT_INTRO_SUBTITLE,
  introIcon = "⚡",
  jugLabel = "TODAY'S JUG",
  askPrompt = "What has to give?",
  completeTitle = "You traded every pour!",
  completeLine = DEFAULT_COMPLETE_LINE,
  hints = DEFAULT_HINTS,
  introNarration,
  coachLines,
  threat,
  completeNarration,
  onComplete,
  onCorrect,
  onWrong,
  onHintReached,
  onAnswered,
}: DayJugProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;
  const tint = useLessonTheme()?.accent ?? DEFAULT_TINT;
  // Both content voices are Sarah; in-game read-alouds and verdict reasons are
  // recorded under "adam", so every manifest lookup here uses that key. Never
  // derive it from the intro narration's speaker (that left games silent).
  const voice = "adam" as const;
  const sceneH = useSyncExternalStore(subscribeViewport, readSceneH, serverSceneH);
  const vw = useSyncExternalStore(subscribeViewport, readVw, serverVw);

  const [showIntro, setShowIntro] = useState(true);
  const [idx, setIdx] = useState(0);
  // Cups already traded and filled: they light and stay lit, so the child can
  // see the day leaving the jug and landing somewhere they chose.
  const [filled, setFilled] = useState(0);
  // Read-aloud chain: the how-to once as the board appears ("howto"), then each
  // pour's read-aloud ("read") and every option label in the order they are
  // shown ("option", which one = optionRead). Taps are held while she speaks.
  const [narr, setNarr] = useState<Narr>("idle");
  const [optionRead, setOptionRead] = useState(0);
  const [phase, setPhase] = useState<Phase>("pour");
  // The jug tipping and the stream running into the cup just traded.
  const [streaming, setStreaming] = useState(false);
  // The cup trembling after a pour that took from somewhere nobody chose.
  const [spilling, setSpilling] = useState(false);
  // Options already tapped on this pour: marked after the teach, so the retry
  // narrows instead of repeating.
  const [marked, setMarked] = useState<readonly string[]>([]);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [pourWrongs, setPourWrongs] = useState(0);
  const [totalWrongs, setTotalWrongs] = useState(0);

  const completedRef = useRef(false);
  const timersRef = useRef<number[]>([]);
  /** Shuts a pour the instant it is answered, before React re-renders. */
  const answeringRef = useRef(false);

  const later = (fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  };
  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  const total = Math.max(1, pours.length);
  const finished = idx >= pours.length;
  const pour: JugPour | undefined = pours[idx];
  const authored = pour?.options ?? EMPTY_OPTIONS;
  // The order the child picks from is muddled on every play (and re-muddled for
  // every pour), never the authored order.
  const shuffled = useShuffledOnce(authored, { key: idx });
  // useShuffledOnce re-shuffles in a layout effect, so for one pre-paint commit
  // after a pour change it still holds the previous pour's options. Fall back to
  // the authored list for that commit, so nothing reads the wrong label.
  const options =
    shuffled.length === authored.length && shuffled.every((o) => authored.includes(o)) ? shuffled : authored;

  // Spoken verdicts: Sarah says "That's right!" + why and the next pour waits
  // for her. Wrong calls speak through WrongAnswerPanel.
  const verdict = useVerdictVoice(voice);
  const speaking = narr !== "idle" || verdict.speaking || !!feedback;
  const canTap = !showIntro && !finished && !!pour && !speaking && !spilling && phase === "pour";

  // Safety releases for the spoken gate (never leave the board held).
  useEffect(() => {
    if (narr === "idle") return;
    const id = window.setTimeout(() => setNarr("idle"), SPOKEN_GATE_MAX_MS);
    return () => window.clearTimeout(id);
  }, [narr, optionRead]);
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

  /* ---------------- the read-aloud chain ---------------- */

  const readPourThenOptions = (p: JugPour | undefined) => {
    if (!p) {
      setNarr("idle");
      return;
    }
    setOptionRead(0);
    setNarr(canRead(p.readAloud) ? "read" : canRead(p.options[0]?.label) ? "option" : "idle");
  };
  const onReadDone = () => {
    setOptionRead(0);
    setNarr(canRead(options[0]?.label) ? "option" : "idle");
  };
  const onOptionDone = () => {
    const next = optionRead + 1;
    if (next < options.length && canRead(options[next]?.label)) setOptionRead(next);
    else setNarr("idle");
  };

  /* ---------------- beats ---------------- */

  const startBoard = () => {
    setShowIntro(false);
    if (isAudioMuted()) {
      setNarr("idle");
      return;
    }
    if (coachLines) setNarr("howto");
    else readPourThenOptions(pours[0]);
  };

  const advance = () => {
    const next = idx + 1;
    setIdx(next);
    setMarked([]);
    setPourWrongs(0);
    setOptionRead(0);
    answeringRef.current = false;
    if (next < pours.length) readPourThenOptions(pours[next]);
    else setNarr("idle");
  };

  /* ---------------- the only judged tap ---------------- */

  const choose = (option: JugOption) => {
    if (!pour || !canTap || marked.includes(option.id)) return;
    // `canTap` only closes once React has re-rendered on verdict.speaking, and a
    // right answer never marks its option, so a quick second tap landed inside
    // that window and restarted the verdict, cutting Sarah off mid-sentence.
    // This latch shuts the pour synchronously; `advance` reopens it.
    if (answeringRef.current) return;
    answeringRef.current = true;
    onAnswered?.({
      questionKey: `jug-${pour.id}`,
      selectedIndex: pour.options.findIndex((o) => o.id === option.id),
      correctIndex: pour.options.findIndex((o) => o.isRight),
      wasCorrect: option.isRight,
    });

    if (option.isRight) {
      // fx.correct plays its own chime (no audio.correct() here).
      fx.correct({ xp: 25 });
      onCorrect?.();
      const poured = idx + 1;
      setFilled(poured);
      setStreaming(true);
      later(() => setStreaming(false), reduce ? 200 : STREAM_MS);
      later(() => audio.drop(), reduce ? 40 : 180);
      const out = poured >= total;
      if (out) {
        setPhase("balanced");
        later(() => audio.unlock(), reduce ? 120 : 520);
      }
      // Sarah: "That's right!" + why, one take; then a beat and the next pour.
      verdict.say("right", option.why, () => later(advance, reduce ? 200 : out ? BALANCE_MS : NEXT_POUR_MS));
      return;
    }

    // Wrong: the cup trembles and spills, then the teach panel (it speaks "Not
    // quite." + explanation itself). The same pour waits, and every cup already
    // filled stays filled.
    audio.wrong();
    onWrong?.();
    setSpilling(true);
    setTotalWrongs((n) => n + 1);
    const prior = pourWrongs;
    setPourWrongs(prior + 1);
    setMarked((prev) => [...prev, option.id]);
    const panel = {
      title: WRONG_TITLE,
      explanation: option.explanation || FALLBACK_EXPLANATION,
      tip: prior >= 1 ? hints.tier2 : hints.tier1,
    };
    later(
      () => {
        setSpilling(false);
        setFeedback(panel);
        // the same pour waits, so the child must be able to tap again
        answeringRef.current = false;
      },
      reduce ? SPILL_MS_REDUCED : SPILL_MS,
    );
  };

  const stars = totalWrongs === 0 ? 3 : totalWrongs <= 2 ? 2 : 1;
  const score = stars === 3 ? 100 : stars === 2 ? 70 : 40;
  const complete = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete(score);
  };

  /* ---------------- render values ---------------- */

  const balanced = phase === "balanced";
  const remaining = Math.max(0, total - filled);
  // Cup + jug geometry: both shrink with the window, and the shelf keeps its
  // clearance so nothing ever overlaps the choice band.
  const shelfH = Math.round(clamp(sceneH * 0.07, 10, 18));
  const cupH = Math.round(clamp(sceneH * 0.32, 52, 88));
  const cupW = Math.round(cupH * 0.78);
  // The jug is capped against the window's width as well as its height, so on a
  // phone it still hangs clear of the panel edge over the leftmost cup.
  const jugW = Math.min(Math.round(clamp(sceneH * 0.34, 54, 92) * 0.92), Math.round(clamp(vw * 0.12, 40, 92)));
  const jugH = Math.round(jugW / 0.92);
  const riser = Math.round(clamp(sceneH * 0.07, 10, 22));
  const jugBottom = shelfH + cupH + riser;
  // The jug hangs over the cup it is about to pour; once the day is shared out
  // it settles back over the middle of the row, empty.
  const jugAtPct = finished || balanced ? 50 : cupLeftPct(Math.min(idx, total - 1), total);
  // The stream falls from the spout into the mouth of that cup.
  const streamTop = shelfH + cupH - Math.round(cupH * 0.14);
  const streamH = Math.max(8, jugBottom - streamTop);
  // The jug's own level: one share of the day leaves for every cup filled.
  const jugFill = clamp(1 - filled / total, 0, 1);
  // Round 1 teaches the MECHANIC only: the whole choice row breathes, equally,
  // so the glow can never point at an answer.
  const guided = idx === 0 && pourWrongs === 0 && canTap;
  const stripText = balanced ? "DAY BALANCED!" : pour?.readAloud ?? "";
  const stripIcon = balanced ? "🎉" : "⚡";
  const bandLine = balanced
    ? "EVERY CUP GOT ITS SHARE"
    : guided
      ? "Round 1: tap what has to give"
      : pourWrongs > 0
        ? "Try another trade, Cyber Hero"
        : remaining === 1
          ? "1 pour left in the jug"
          : `${remaining} pours left in the jug`;
  const hintText = pourWrongs >= 2 ? hints.tier2 : pourWrongs === 1 ? hints.tier1 : undefined;
  const hintTier = (pourWrongs >= 2 ? 2 : 1) as 1 | 2;
  const readingLabel = narr === "option" ? options[optionRead]?.label ?? "" : "";

  return (
    <ExerciseFrame maxWidth={FRAME_MAX_W} padding={`${FRAME_PAD_Y}px 0`} decor>
      {fx.layer()}
      {verdict.element}

      {/* Sarah's read-alouds (audio only): the how-to once, then each pour's
          read-aloud and every option label as the pour arrives. */}
      {!showIntro && !finished && pour && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration
              key="djg-howto"
              speaker={coachLines.speaker ?? voice}
              lines={coachLines.lines}
              accent={tint}
              recordedOnly
              onDone={() => readPourThenOptions(pour)}
            />
          )}
          {narr === "read" && pour.readAloud && (
            <InfoNarration
              key={`djg-read-${pour.id}`}
              speaker={voice}
              lines={[pour.readAloud]}
              accent={tint}
              recordedOnly
              onDone={onReadDone}
            />
          )}
          {narr === "option" && readingLabel && (
            <InfoNarration
              key={`djg-label-${pour.id}-${optionRead}`}
              speaker={voice}
              lines={[readingLabel]}
              accent={tint}
              recordedOnly
              onDone={onOptionDone}
            />
          )}
        </div>
      )}

      {/* The whole board is inset: flush content collided with the frame's 28px
          rounded corners and its corner ornaments. */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          gap: BOARD_GAP,
          padding: `0 ${BOARD_INSET_X}px`,
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        {/* ------------ header ------------ */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            flexWrap: "wrap",
            minHeight: HEADER_H,
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              fontWeight: 900,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#dffaf5",
            }}
          >
            <PixIcon emoji={introIcon} size={20} />
            {introTitle}
          </span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: tint,
              whiteSpace: "nowrap",
            }}
          >
            Pour {Math.min(idx + 1, pours.length)} of {pours.length}
          </span>
        </div>

        {/* ------------ the prompt strip (every word Sarah reads) ------------ */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div
            aria-live="polite"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              minHeight: STRIP_H,
              boxSizing: "border-box",
              padding: "6px 18px",
              borderRadius: 14,
              background: balanced ? "rgba(52,211,153,0.16)" : `${tint}1a`,
              border: `1px solid ${balanced ? GOOD_GREEN : `${tint}59`}`,
              color: "#effcf9",
              fontSize: 16,
              fontWeight: 800,
              lineHeight: 1.3,
              textAlign: "center",
            }}
          >
            <PixIcon emoji={stripIcon} size={22} style={{ flexShrink: 0 }} />
            <span style={{ overflowWrap: "anywhere" }}>{stripText}</span>
          </div>
        </div>

        {/* ------------ the station: the jug, the cups, the choice band ------------ */}
        <div
          style={{
            position: "relative",
            borderRadius: 20,
            overflow: "hidden",
            background: "#08211d",
            border: `2px solid ${tint}33`,
            boxShadow: "inset 0 0 60px rgba(0,0,0,0.5)",
          }}
        >
          {/* ---- the Power Station scene ---- */}
          <div style={{ position: "relative", height: sceneH }}>
            {/* the station wall: cool teal above, the sunrise warmth below */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                background: balanced
                  ? "linear-gradient(180deg, #0f4238 0%, #1d5c4c 46%, #5c4620 100%)"
                  : "linear-gradient(180deg, #08251f 0%, #103a31 48%, #2c2413 100%)",
                transition: "background 700ms ease",
              }}
            />
            {/* the warm glow of the generators behind the shelf */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                background: `radial-gradient(ellipse at 50% 96%, ${DAY_GOLD}${balanced ? "55" : "33"} 0%, transparent 62%)`,
                transition: "background 700ms ease",
                pointerEvents: "none",
              }}
            />
            {/* the feed pipe the jug hangs from, with its bolts */}
            <StationPipe tint={tint} lit={balanced} />

            {/* ---- the cups on their shelf ---- */}
            <div style={{ position: "absolute", inset: 0 }}>
              {pours.map((p, i) => {
                const state: CupState =
                  i < filled ? "filled" : i === idx && !finished ? (spilling ? "spilled" : "now") : "waiting";
                return (
                  <div
                    key={p.id}
                    style={{
                      position: "absolute",
                      left: `${cupLeftPct(i, total)}%`,
                      bottom: shelfH,
                      width: 0,
                      height: 0,
                      zIndex: 4 + i,
                    }}
                  >
                    <DayCup pour={p} w={cupW} h={cupH} state={state} tint={tint} reduce={reduce} />
                  </div>
                );
              })}

              {/* the stream: it only ever runs on a trade the child made */}
              {streaming && !reduce && (
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: `${cupLeftPct(clamp(filled - 1, 0, total - 1), total)}%`,
                    bottom: streamTop,
                    width: 0,
                    height: 0,
                    zIndex: 18,
                    pointerEvents: "none",
                  }}
                >
                  <motion.div
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={{ scaleY: 1, opacity: 1 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    style={{
                      position: "absolute",
                      left: Math.round(jugW * STREAM_OFFSET_FRAC) - 5,
                      bottom: 0,
                      originX: 0.5,
                      originY: 0,
                      width: 10,
                      height: streamH,
                      borderRadius: 6,
                      background: `linear-gradient(180deg, ${DAY_GOLD} 0%, ${WATER} 100%)`,
                      boxShadow: `0 0 16px ${WATER}99`,
                    }}
                  />
                </div>
              )}

              {/* the jug itself: it hangs over the cup it is pouring into, and
                  its own level drops by one share for every cup filled. The
                  wrapper is zero-size, so the tipping jug can animate its
                  rotation without fighting a static translate. */}
              <div
                style={{
                  position: "absolute",
                  left: `${jugAtPct}%`,
                  bottom: jugBottom,
                  width: 0,
                  height: 0,
                  zIndex: 20,
                  pointerEvents: "none",
                  transition: reduce ? "left 180ms linear" : "left 700ms ease",
                }}
              >
                <motion.div
                  animate={{ rotate: streaming && !reduce ? 17 : 0 }}
                  transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 200, damping: 16 }}
                  style={{
                    position: "absolute",
                    // the spout sits over the cup's mouth, so the jug's body
                    // hangs a little to the left of the cup it pours into
                    left: -Math.round(jugW * (JUG_SPOUT_FRAC - STREAM_OFFSET_FRAC)),
                    bottom: 0,
                    originX: 0.5,
                    originY: 0.85,
                  }}
                >
                  <JugVessel w={jugW} h={jugH} fill={jugFill} tint={tint} />
                </motion.div>
              </div>

              {/* the shelf the cups stand on */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: shelfH,
                  zIndex: 6,
                  background: "linear-gradient(180deg, #2d4a43 0%, #16302b 58%, #0c211d 100%)",
                  borderTop: `2px solid ${balanced ? GOOD_GREEN : `${tint}88`}`,
                  boxShadow: `0 -6px 18px -10px ${DAY_GOLD}`,
                  transition: "border-color 400ms ease",
                }}
              />
            </div>

            {/* a soft vignette so the board reads as one lit surface */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 25,
                pointerEvents: "none",
                background: "radial-gradient(ellipse at 50% 48%, transparent 58%, rgba(4,14,12,0.48) 100%)",
              }}
            />

            {/* the last pour: the whole station lights up */}
            {balanced && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: reduce ? 0.2 : 0.8 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 30,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 16,
                  background: "linear-gradient(180deg, #ffe3ae 0%, #d8f6ee 56%, #b8ece2 100%)",
                }}
              >
                <motion.div
                  initial={reduce ? { opacity: 0 } : { scale: 0.86, opacity: 0, y: 14 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 260, damping: 18, delay: 0.25 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    maxWidth: "94%",
                    padding: "14px 22px",
                    borderRadius: 18,
                    border: "3px solid #7dffb0",
                    background: `linear-gradient(180deg, ${GOOD_GREEN} 0%, #0e9f6e 100%)`,
                    color: "#053b2a",
                    fontSize: 24,
                    fontWeight: 900,
                    letterSpacing: "0.03em",
                    lineHeight: 1.2,
                    textAlign: "center",
                    boxShadow: "0 18px 46px -18px rgba(9,60,40,0.7)",
                  }}
                >
                  <PixIcon emoji="⚡" size={30} style={{ flexShrink: 0 }} />
                  <span style={{ overflowWrap: "anywhere" }}>DAY BALANCED!</span>
                </motion.div>
              </motion.div>
            )}
          </div>

          {/* ---- the choice band: uniform trades for this pour ---- */}
          <div
            style={{
              position: "relative",
              zIndex: 31,
              minHeight: BAND_MIN_H,
              boxSizing: "border-box",
              padding: "7px 10px 10px",
              background: "linear-gradient(180deg, rgba(5,20,17,0.6) 0%, rgba(5,20,17,0.92) 46%)",
              borderTop: `1px solid ${tint}26`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                flexWrap: "wrap",
                marginBottom: 6,
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: balanced ? GOOD_GREEN : tint,
                minHeight: 14,
                textAlign: "center",
              }}
            >
              <span>{jugLabel}</span>
              <span style={{ color: "#c2ded8", letterSpacing: "0.08em" }}>{bandLine}</span>
            </div>

            {!balanced && pour && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 7,
                  color: "#effcf9",
                  fontSize: 14,
                  fontWeight: 800,
                  lineHeight: 1.25,
                  textAlign: "center",
                }}
              >
                <PixIcon emoji={pour.icon} size={20} style={{ flexShrink: 0 }} />
                <span style={{ overflowWrap: "anywhere" }}>{pour.label}</span>
                <span style={{ color: "#9fc4bd", fontWeight: 700, overflowWrap: "anywhere" }}>{askPrompt}</span>
              </div>
            )}

            <div
              role="group"
              aria-label={askPrompt}
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                justifyContent: "center",
                borderRadius: 16,
                padding: 2,
                animation: guided && !reduce ? "djgGuide 1.6s ease-in-out infinite" : undefined,
                boxShadow: guided ? `0 0 0 3px ${tint}55, 0 0 18px ${tint}66` : undefined,
              }}
            >
              {/* Once the day is shared out, there is nothing left to decide. */}
              {!balanced &&
                options.map((option, i) => (
                  <TradeTile
                    key={`${pour?.id ?? "none"}-${option.id}`}
                    option={option}
                    order={i}
                    tint={tint}
                    reduce={reduce}
                    held={!canTap}
                    marked={marked.includes(option.id)}
                    onPick={() => choose(option)}
                  />
                ))}
            </div>
          </div>
        </div>

        {/* ------------ the tiered hint ------------ */}
        {hintText && !balanced && (
          <div style={{ maxWidth: 560, width: "100%", margin: "0 auto" }}>
            <HintBubble tier={hintTier} speaker={voice} text={hintText} />
          </div>
        )}

        <style>{`
          @keyframes djgGuide { 0%,100% { box-shadow: 0 0 0 3px ${tint}55, 0 0 16px ${tint}66 } 50% { box-shadow: 0 0 0 7px ${tint}22, 0 0 30px ${tint} } }
          @keyframes djgNow { 0%,100% { box-shadow: 0 0 0 3px rgba(255,255,255,0.7), 0 0 18px ${DAY_GOLD} } 50% { box-shadow: 0 0 0 6px rgba(255,255,255,0.26), 0 0 30px ${DAY_GOLD} } }
        `}</style>
      </div>

      {/* ------------ overlays ------------ */}
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

      {feedback && (
        <WrongAnswerPanel
          title={feedback.title}
          explanation={feedback.explanation}
          tip={feedback.tip}
          onContinue={() => setFeedback(null)}
        />
      )}

      {/* The payoff waits for Sarah: a complete beat that mounts while the last
          line is still speaking would cut her off (the Week 9 bug). */}
      {finished && !showIntro && !speaking && (
        <ExerciseCompleteBeat
          title={completeTitle}
          stars={stars}
          statLines={[
            `${pours.length} pour${pours.length === 1 ? "" : "s"} traded, ${totalWrongs === 0 ? "nothing spilled" : totalWrongs === 1 ? "1 spill mopped up" : `${totalWrongs} spills mopped up`}`,
            completeLine,
          ]}
          narration={completeNarration}
          onContinue={complete}
        />
      )}
    </ExerciseFrame>
  );
}

/* ------------------------------------------------------------------ */
/* The station pipe                                                   */
/* ------------------------------------------------------------------ */

/**
 * The feed pipe running across the top of the Power Station, with its bolts and
 * a row of little pilot lights. Pure scenery: it never marks an answer.
 */
function StationPipe({ tint, lit }: { tint: string; lit: boolean }) {
  const bolts = [8, 22, 36, 50, 64, 78, 92];
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        height: 18,
        zIndex: 2,
        background: "linear-gradient(180deg, #2c4c45 0%, #16332d 52%, #0b221e 100%)",
        borderBottom: `1px solid ${tint}44`,
        pointerEvents: "none",
      }}
    >
      {bolts.map((x, i) => (
        <span
          key={x}
          style={{
            position: "absolute",
            left: `${x}%`,
            top: 5,
            width: 7,
            height: 7,
            marginLeft: -3.5,
            borderRadius: "50%",
            background: i % 2 === 0 ? (lit ? DAY_GOLD : `${tint}cc`) : "rgba(180,206,200,0.45)",
            boxShadow: i % 2 === 0 ? `0 0 8px ${lit ? DAY_GOLD : tint}` : "none",
            transition: "background 500ms ease, box-shadow 500ms ease",
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The jug                                                            */
/* ------------------------------------------------------------------ */

/**
 * Today's jug: one day of water, and not a drop more. The level is the whole
 * point of the game, so it is the only thing about the jug that ever changes.
 * The day is clipped to the body path, so it reads as water inside glass rather
 * than as a bar sitting on top of it.
 */
function JugVessel({
  w,
  h,
  fill,
  tint,
}: {
  w: number;
  h: number;
  /** 0 (empty) to 1 (a whole day). */
  fill: number;
  tint: string;
}) {
  const rawId = useId();
  const clipId = `djg-jug-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const body =
    "M22 12 L62 12 Q70 12 71 24 L75 82 Q76 94 64 94 L24 94 Q12 94 13 82 L17 24 Q18 12 22 12 Z";
  // The water surface inside the body, in viewBox units (16 = brim, 94 = base).
  const surface = 94 - clamp(fill, 0, 1) * 78;
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 90 100"
      aria-hidden
      style={{ display: "block", overflow: "visible", filter: "drop-shadow(0 8px 12px rgba(4,20,16,0.55))" }}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={body} />
        </clipPath>
      </defs>

      {/* the handle */}
      <path
        d="M14 30 Q1 42 6 62 Q9 74 19 78"
        fill="none"
        stroke="rgba(190,226,220,0.5)"
        strokeWidth={6}
        strokeLinecap="round"
      />
      {/* the spout lip */}
      <path
        d="M62 12 L86 19 L76 31 L68 19 Z"
        fill="rgba(190,226,220,0.42)"
        stroke="rgba(226,248,244,0.6)"
        strokeWidth={1.6}
        strokeLinejoin="round"
      />

      {/* the glass */}
      <path
        d={body}
        fill="rgba(146,198,190,0.2)"
        stroke="rgba(226,248,244,0.75)"
        strokeWidth={2.4}
        strokeLinejoin="round"
      />

      {/* the day itself, clipped inside the glass */}
      <g clipPath={`url(#${clipId})`}>
        <rect x={0} y={surface} width={90} height={100 - surface} fill={DAY_GOLD} />
        <rect x={0} y={surface} width={90} height={4.5} fill="rgba(255,255,255,0.55)" />
      </g>

      {/* the measure marks: the jug is exactly the same size every single day */}
      {[0.25, 0.5, 0.75].map((m) => (
        <line
          key={m}
          x1={54}
          x2={68}
          y1={94 - m * 78}
          y2={94 - m * 78}
          stroke={`${tint}99`}
          strokeWidth={1.6}
          strokeLinecap="round"
        />
      ))}

      {/* a highlight down the glass, so it reads as glass */}
      <path d="M27 20 Q23 52 26 88" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={3} strokeLinecap="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* One cup on the shelf                                               */
/* ------------------------------------------------------------------ */

type CupState = "waiting" | "now" | "spilled" | "filled";

/**
 * One cup of the day. Every cup wears the same glass until its pour arrives, so
 * the row never hints at which trade is coming: the cup being poured glows, a
 * cup that spilled trembles red, and a cup that got its share lights gold and
 * stays lit.
 *
 * The wrapper the cup sits in is zero-size and the cup centres itself inside
 * it, so a trembling cup can animate without fighting a static translate.
 */
function DayCup({
  pour,
  w,
  h,
  state,
  tint,
  reduce,
}: {
  pour: JugPour;
  w: number;
  h: number;
  state: CupState;
  tint: string;
  reduce: boolean;
}) {
  const filled = state === "filled";
  const now = state === "now";
  const spilled = state === "spilled";
  const border = spilled ? BAD_RED : filled ? DAY_GOLD : now ? "#ffffff" : `${tint}88`;
  const liquidH = Math.round(h * (filled ? CUP_FILL_FRAC : 0));
  return (
    <div style={{ position: "absolute", left: -Math.round(w / 2), bottom: 0, width: w }}>
      <motion.div
        animate={spilled && !reduce ? { x: [0, -4, 4, -3, 0], rotate: [0, -3, 3, -2, 0] } : { x: 0, rotate: 0 }}
        transition={spilled && !reduce ? { duration: 0.55 } : { duration: 0.2 }}
        title={pour.label}
        style={{
          position: "relative",
          width: w,
          height: h,
          boxSizing: "border-box",
          borderRadius: "8px 8px 18px 18px",
          border: `2px solid ${border}`,
          borderTopWidth: 3,
          overflow: "hidden",
          background: spilled
            ? "linear-gradient(180deg, rgba(92,26,38,0.85) 0%, rgba(46,12,20,0.92) 100%)"
            : "linear-gradient(180deg, rgba(146,198,190,0.2) 0%, rgba(10,38,33,0.55) 100%)",
          boxShadow: filled
            ? `0 0 18px ${DAY_GOLD}88`
            : spilled
              ? `0 0 18px ${BAD_RED}99`
              : "0 8px 18px -12px rgba(4,20,16,0.9)",
          animation: now && !reduce ? "djgNow 1.7s ease-in-out infinite" : undefined,
          transition: "border-color 300ms ease, box-shadow 300ms ease",
        }}
      >
        {/* the share of the day this cup got */}
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: liquidH,
            background: `linear-gradient(180deg, ${DAY_GOLD} 0%, ${WATER} 100%)`,
            boxShadow: filled ? `0 -2px 10px ${DAY_GOLD}77` : "none",
            transition: reduce ? "none" : "height 620ms ease",
          }}
        />
        {/* the cup's own emblem, always readable above its liquid */}
        <span
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: Math.round(h * 0.1),
            display: "grid",
            placeItems: "center",
          }}
        >
          <PixIcon emoji={spilled ? "🚫" : filled ? "✨" : pour.icon} size={Math.round(w * 0.52)} />
        </span>
        {/* a highlight down the glass */}
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: Math.round(w * 0.16),
            top: Math.round(h * 0.12),
            width: 3,
            height: Math.round(h * 0.66),
            borderRadius: 3,
            background: "rgba(255,255,255,0.3)",
          }}
        />
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The choices                                                        */
/* ------------------------------------------------------------------ */

/**
 * One trade the child could make on this pour. Every tile wears the same paint,
 * the same size and the same chrome, so the row never hints at the hero's
 * trade. A tile only changes once the child has committed to it and heard why.
 */
function TradeTile({
  option,
  order,
  tint,
  reduce,
  held,
  marked,
  onPick,
}: {
  option: JugOption;
  /** Position in the row: drives which side it drifts in from. */
  order: number;
  tint: string;
  reduce: boolean;
  /** Sarah is speaking, or the day is already shared out: not tappable now. */
  held: boolean;
  /** Already tapped on this pour and taught: out of the running. */
  marked: boolean;
  onPick: () => void;
}) {
  const fromLeft = order % 2 === 0;
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, x: fromLeft ? -26 : 26, y: 10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={
        reduce
          ? { duration: 0.2, delay: order * 0.05 }
          : { type: "spring", stiffness: 220, damping: 22, delay: 0.1 + order * 0.11 }
      }
      style={{ flex: "1 1 200px", minWidth: 0, maxWidth: 258 }}
    >
      <motion.button
        type="button"
        aria-label={option.label}
        aria-disabled={marked || undefined}
        onClick={onPick}
        disabled={held || marked}
        whileTap={held || marked || reduce ? undefined : { scale: 0.96 }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          width: "100%",
          minHeight: 62,
          boxSizing: "border-box",
          padding: "8px 12px",
          borderRadius: 16,
          border: `2px solid ${marked ? BAD_RED : `${tint}77`}`,
          background: marked
            ? "linear-gradient(180deg, rgba(60,20,34,0.9) 0%, rgba(30,12,22,0.95) 100%)"
            : "linear-gradient(180deg, rgba(18,54,47,0.95) 0%, rgba(8,30,26,0.96) 100%)",
          color: marked ? "#ffd2d2" : "#effcf9",
          textAlign: "left",
          fontFamily: "inherit",
          fontSize: 14.5,
          fontWeight: 800,
          lineHeight: 1.25,
          cursor: marked ? "default" : held ? "wait" : "pointer",
          opacity: marked ? 0.72 : held ? 0.85 : 1,
          boxShadow: marked ? "none" : `0 10px 24px -14px ${tint}, inset 0 0 18px rgba(255,255,255,0.04)`,
          transition: "border-color 220ms ease, background 220ms ease, opacity 220ms ease",
          touchAction: "manipulation",
        }}
      >
        <span aria-hidden style={{ flexShrink: 0, display: "grid", placeItems: "center", width: 32, height: 32 }}>
          <PixIcon emoji={marked ? "🚫" : option.icon} size={28} />
        </span>
        <span style={{ flex: 1, minWidth: 0, overflowWrap: "anywhere" }}>{option.label}</span>
      </motion.button>
    </motion.div>
  );
}
