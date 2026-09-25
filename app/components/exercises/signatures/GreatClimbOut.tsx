"use client";

/**
 * THE GREAT CLIMB-OUT: Week 10 (YouTube and autoplay) signature exercise,
 * rebuilt as a data-driven, TAP-ONLY, UNTIMED concept game to the Learn-Loop
 * standard (the same conversion Flip the Box got for Week 9).
 *
 * The child is deep in a glowing video burrow: burrow walls studded with ever
 * weirder thumbnails, a ladder up the middle, a circle of daylight at the top
 * and the burrow floor below. The climb is now TURN BASED, not a rhythm drill.
 *
 * Each rung floats three tokens in beside the hero. They wear the same paint,
 * the same size and the same chrome, so nothing gives the answer away: exactly
 * one is the GRIP (a move the child makes on purpose) and the other two are the
 * belt's bait (a move the app makes for them).
 *
 *   Right call: the hero climbs one rung toward daylight and Sarah says
 *     "That's right!" + the token's `why` in one take, then the next rung
 *     floats in.
 *   Wrong call: the hero slips ONE rung (never below the start rung), the
 *     shared teach panel speaks "Not quite." + the token's `explanation`, the
 *     bait is marked, and the SAME rung waits for the retry.
 *
 * There is no timer, no drift, no rhythm, no hold and no fail state: the only
 * thing that ever moves the hero is a tap. Reaching the top rung floods the
 * burrow with sky and raises the "YOU CLIMBED OUT!" banner, then the complete
 * beat speaks the payoff.
 *
 * Learn-Loop wiring: the Raccoon's boast folds into the shared intro
 * (`threat`); Sarah speaks the how-to once as the board appears (`coachLines`),
 * then each rung's `prompt` and every token `label` as the rung floats in
 * (audio only, `recordedOnly`, the board held while she speaks and released by
 * the shared spoken gate); a right call speaks through VerdictVoice, a wrong
 * one through WrongAnswerPanel; the complete beat speaks the payoff. Round 1
 * guides the MECHANIC only: the token row breathes and the band says what to
 * do, never which token. The defaults below keep the legacy signature mount
 * (`{ onComplete, narration, accent }`) playable with no content file.
 *
 * Layout: the header, prompt strip, burrow panel, token row and hint all fit
 * the owner's 1414x771 window (the burrow scene shrinks with the window), and
 * the token row stacks rather than scrolling sideways at 400px.
 */

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { CSSProperties } from "react";
import { motion, useAnimationControls } from "framer-motion";
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
// she reads are already on the strip and on the tokens), the same recipe as
// Flip the Box and Four Eyes.
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

export interface ClimbRungToken {
  id: string;
  /** The words on the token. Sarah reads this as the rung floats in. */
  label: string;
  /** PixIcon emoji. Neutral: it describes the move, it never marks it. */
  icon: string;
  /** Exactly one token per rung is the grip (the move the child makes). */
  isGrip: boolean;
  /** Sarah's reason on a right call ("That's right!" + why). Grip only. */
  why: string;
  /** Sarah's teach on a wrong call ("Not quite." + explanation). Bait only. */
  explanation: string;
}
export interface ClimbRung {
  id: string;
  /** The moment, in the child's words. Sarah reads it as the rung floats in. */
  prompt: string;
  tokens: ClimbRungToken[];
}
export interface GreatClimbOutProps {
  rungs?: ClimbRung[];
  introTitle?: string; introSubtitle?: string; introIcon?: string;
  surfaceLabel?: string;
  bannerLine?: string;
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

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

const FRAME_MAX_W = 860;
const FRAME_PAD_X = 20;
const FRAME_PAD_Y = 16;
const BOARD_GAP = 8;
const HEADER_H = 28;
const STRIP_H = 40;

/**
 * Window height that is not the burrow scene: lesson HUD 64 + stage padding 80
 * + frame padding 32 + header 28 + gaps 24 + strip 40 + token band 96 + hint
 * room 70 + 8 spare. At 1414x771 the scene takes its full height and nothing
 * needs a scroll.
 */
const HEIGHT_RESERVE_PX = 442;
const MAX_SCENE_H = 300;
const MIN_SCENE_H = 196;

/** Scene geometry. */
const LADDER_W = 62;
const HERO_W = 46;
const HERO_H = 50;
/** The hero's feet on the burrow floor (px up from the scene bottom). */
const FOOT_Y = 20;
/** Room the token band needs under the scene. */
const BAND_MIN_H = 96;

const SLIP_MS = 700;
const SLIP_MS_REDUCED = 260;
const NEXT_RUNG_MS = 800;
const SURFACE_MS = 1500;

const GOOD_GREEN = "#34d399";
const BAD_RED = "#ff5d5d";
const SKY_BLUE = "#8fd3ff";
const LADDER_WOOD = "#a06a34";
const DEFAULT_TINT = "#ffc9f0";

const WRONG_TITLE = "That one pulls you deeper";
const FALLBACK_EXPLANATION = "That one is the burrow talking, not you. Look for the move YOU make on purpose.";

/** Glowing thumbnails sunk into the burrow wall: weirdest down at the floor. */
const WALL_THUMBS: ReadonlyArray<{ t: number; side: "left" | "right"; title: string; time: string; hue: number; weird: number }> = [
  { t: 0.04, side: "left", title: "?????", time: "99:99", hue: 350, weird: 1 },
  { t: 0.26, side: "right", title: "Why is this 10 hours", time: "10:00:00", hue: 322, weird: 0.85 },
  { t: 0.48, side: "left", title: "24 hours of slime", time: "24:00", hue: 278, weird: 0.6 },
  { t: 0.70, side: "right", title: "Cats, but backward", time: "7:07", hue: 232, weird: 0.32 },
  { t: 0.90, side: "left", title: "Puppy learns to wave", time: "2:10", hue: 200, weird: 0.1 },
];

/* ------------------------------------------------------------------ */
/* Default content (the legacy signature mount)                       */
/* ------------------------------------------------------------------ */

/*
 * Authoring rule for a rung: exactly ONE token is the grip. Only a grip's `why`
 * is ever spoken (a grip can never be tapped wrongly) and only a bait's
 * `explanation` is ever spoken (a bait can never be right), so the unused half
 * of each pair stays empty rather than being filled with copy no child hears.
 */
const RUNGS: ClimbRung[] = [
  {
    id: "countdown",
    prompt: "Your video ended and the next one is already counting down. Which move climbs you up a rung?",
    tokens: [
      {
        id: "pause-ask",
        label: "Pause it and ask: do I WANT this one?",
        icon: "⏸️",
        isGrip: true,
        why: "Pausing hands the choice back to you, and the countdown has to wait until you have made it.",
        explanation: "",
      },
      {
        id: "slime-pranks",
        label: "Next video: 100 slime pranks!",
        icon: "😂",
        isGrip: false,
        why: "",
        explanation: "A video you never chose is not a video you wanted. That one is the burrow picking for you.",
      },
      {
        id: "three-two-one",
        label: "3, 2, 1, playing next!",
        icon: "⏱️",
        isGrip: false,
        why: "",
        explanation: "The countdown is not asking you, it is telling you. Letting it run is how the burrow gets deeper.",
      },
    ],
  },
  {
    id: "one-more",
    prompt: "You said one more video four videos ago. Which move climbs you up a rung?",
    tokens: [
      {
        id: "say-the-number",
        label: "Say your number out loud: ONE more, then stop",
        icon: "✋",
        isGrip: true,
        why: "A number you say out loud turns one more into a real plan, and a plan is easy to keep.",
        explanation: "",
      },
      {
        id: "autoplay-knows",
        label: "Autoplay picked a good one, keep going",
        icon: "🎮",
        isGrip: false,
        why: "",
        explanation: "Autoplay does not know you at all. It only knows how to keep you watching one more time.",
      },
      {
        id: "no-number",
        label: "One more, then one more, then one more",
        icon: "🌀",
        isGrip: false,
        why: "",
        explanation: "One more with no number on it never ends. That is the burrow, Cyber Hero, not a choice.",
      },
    ],
  },
  {
    id: "body-signal",
    prompt: "Your eyes feel scratchy and your legs have gone fuzzy. Which move climbs you up a rung?",
    tokens: [
      {
        id: "notice-body",
        label: "Notice your body and STOP for now",
        icon: "🧠",
        isGrip: true,
        why: "Your body tells you when the burrow has had you too long, and listening to it is a real superpower.",
        explanation: "",
      },
      {
        id: "ignore-it",
        label: "Ignore it, the next one is short",
        icon: "⏱️",
        isGrip: false,
        why: "",
        explanation: "Short videos still add up. Ignoring your body is how one more turns into a whole afternoon.",
      },
      {
        id: "get-comfier",
        label: "Lie down so it feels comfier",
        icon: "📱",
        isGrip: false,
        why: "",
        explanation: "Getting comfier keeps you in the burrow. Your scratchy eyes are still asking you to stop.",
      },
    ],
  },
  {
    id: "the-last-rung",
    prompt: "You are one rung from daylight. Which move gets you all the way out of the burrow?",
    tokens: [
      {
        id: "close-and-go",
        label: "Close it and go DO the thing you planned",
        icon: "🚪",
        isGrip: true,
        why: "Closing it on purpose is the whole climb. You chose to stop, so the burrow does not get a say.",
        explanation: "",
      },
      {
        id: "check-trending",
        label: "Just check what is trending first",
        icon: "🔔",
        isGrip: false,
        why: "",
        explanation: "One more check is one more rung down. Trending is the burrow calling you back inside.",
      },
      {
        id: "leave-it-playing",
        label: "Leave it playing while you go",
        icon: "📱",
        isGrip: false,
        why: "",
        explanation: "A video still playing is a rope back down the burrow. Stop it first, then go.",
      },
    ],
  },
];

const DEFAULT_INTRO_SUBTITLE = "You are deep in the video burrow. Tap the move that climbs you toward daylight.";
const DEFAULT_COMPLETE_LINE = "When the next video starts on its own, pause and choose. Stopping is a superpower.";
const DEFAULT_HINTS = {
  tier1: "One move is something YOU do on purpose. The other two are things the app does to you.",
  tier2: "Look for the move where you choose: pause it, say your number, notice your body, close it.",
};

const EMPTY_TOKENS: ClimbRungToken[] = [];

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

// A read-aloud only starts when there is something to say and the lesson is not
// muted, so the spoken gate never waits on a clip that cannot play.
const canRead = (text?: string) => !isAudioMuted() && !!text;

/** The burrow scene height for a window: never taller than the design, never
 *  so short the ladder stops reading. Read through useSyncExternalStore, so a
 *  resize re-renders with no effect-driven state. */
const sceneHeightFor = (vh: number) => Math.round(clamp(vh - HEIGHT_RESERVE_PX, MIN_SCENE_H, MAX_SCENE_H));
const subscribeViewport = (onChange: () => void) => {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
};
const readSceneH = () => sceneHeightFor(window.innerHeight);
const serverSceneH = () => MAX_SCENE_H;

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

type Narr = "howto" | "prompt" | "token" | "idle";
type Phase = "climb" | "surfaced";

export default function GreatClimbOut({
  rungs = RUNGS,
  introTitle = "The Great Climb-Out",
  introSubtitle = DEFAULT_INTRO_SUBTITLE,
  introIcon = "⏸️",
  surfaceLabel = "DAYLIGHT",
  bannerLine = "YOU CLIMBED OUT!",
  completeTitle = "You climbed out!",
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
}: GreatClimbOutProps) {
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
  const heroCtrl = useAnimationControls();

  const [showIntro, setShowIntro] = useState(true);
  const [idx, setIdx] = useState(0);
  // The hero's rung: 0 is the burrow floor, rungs.length is daylight. A right
  // call always lands the hero on the rung for the round just answered, so the
  // last right call always reaches the top, however many slips came before.
  const [level, setLevel] = useState(0);
  // Read-aloud chain: the how-to once as the board appears ("howto"), then each
  // rung's prompt ("prompt") and every token label in the order they are shown
  // ("token", which one = tokenRead). Taps are held while she speaks.
  const [narr, setNarr] = useState<Narr>("idle");
  const [tokenRead, setTokenRead] = useState(0);
  const [phase, setPhase] = useState<Phase>("climb");
  // Bait already tapped this rung: marked after the teach, so the retry narrows.
  const [slipped, setSlipped] = useState<readonly string[]>([]);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [rungWrongs, setRungWrongs] = useState(0);
  const [totalWrongs, setTotalWrongs] = useState(0);

  const completedRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  const later = (fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  };
  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  const steps = Math.max(1, rungs.length);
  const finished = idx >= rungs.length;
  const rung: ClimbRung | undefined = rungs[idx];
  const authored = rung?.tokens ?? EMPTY_TOKENS;
  // The order the child picks from is muddled on every play (and re-muddled for
  // every rung), never the authored order.
  const shuffled = useShuffledOnce(authored, { key: idx });
  // useShuffledOnce re-shuffles in a layout effect, so for one pre-paint commit
  // after a rung change it still holds the previous rung's tokens. Fall back to
  // the authored list for that commit, so nothing ever reads the wrong label.
  const tokens =
    shuffled.length === authored.length && shuffled.every((t) => authored.includes(t)) ? shuffled : authored;

  // Spoken verdicts: Sarah says "That's right!" + why and the next rung waits
  // for her. Wrong calls speak through WrongAnswerPanel.
  const verdict = useVerdictVoice(voice);
  const speaking = narr !== "idle" || verdict.speaking || !!feedback;
  const canTap = !showIntro && !finished && !!rung && !speaking && phase === "climb";

  // Safety releases for the spoken gate (never leave the board held).
  useEffect(() => {
    if (narr === "idle") return;
    const id = window.setTimeout(() => setNarr("idle"), SPOKEN_GATE_MAX_MS);
    return () => window.clearTimeout(id);
  }, [narr, tokenRead]);
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

  const readPromptThenTokens = (r: ClimbRung | undefined) => {
    if (!r) {
      setNarr("idle");
      return;
    }
    setTokenRead(0);
    setNarr(canRead(r.prompt) ? "prompt" : canRead(r.tokens[0]?.label) ? "token" : "idle");
  };
  const onPromptDone = () => {
    setTokenRead(0);
    setNarr(canRead(tokens[0]?.label) ? "token" : "idle");
  };
  const onTokenDone = () => {
    const next = tokenRead + 1;
    if (next < tokens.length && canRead(tokens[next]?.label)) setTokenRead(next);
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
    else readPromptThenTokens(rungs[0]);
  };

  const advance = () => {
    const next = idx + 1;
    setIdx(next);
    setSlipped([]);
    setRungWrongs(0);
    setTokenRead(0);
    if (next < rungs.length) readPromptThenTokens(rungs[next]);
    else setNarr("idle");
  };

  /* ---------------- the only judged tap ---------------- */

  const choose = (token: ClimbRungToken) => {
    if (!rung || !canTap || slipped.includes(token.id)) return;
    onAnswered?.({
      questionKey: `climb-${rung.id}`,
      selectedIndex: rung.tokens.findIndex((t) => t.id === token.id),
      correctIndex: rung.tokens.findIndex((t) => t.isGrip),
      wasCorrect: token.isGrip,
    });

    if (token.isGrip) {
      // fx.correct plays its own chime (no audio.correct() here).
      fx.correct({ xp: 25 });
      onCorrect?.();
      const reached = idx + 1;
      setLevel(reached);
      if (!reduce) void heroCtrl.start({ scale: [1, 1.07, 1], transition: { duration: 0.4, ease: "easeOut" } });
      const out = reached >= steps;
      if (out) {
        setPhase("surfaced");
        later(() => audio.unlock(), reduce ? 120 : 520);
      }
      // Sarah: "That's right!" + why, one take; then a beat and the next rung.
      verdict.say("right", token.why, () => later(advance, reduce ? 200 : out ? SURFACE_MS : NEXT_RUNG_MS));
      return;
    }

    // Wrong: the hero slips one rung (never below the floor), then the teach
    // panel (it speaks "Not quite." + explanation itself). The same rung waits.
    audio.wrong();
    onWrong?.();
    setLevel((l) => Math.max(0, l - 1));
    later(() => audio.drop(), reduce ? 60 : 240);
    if (!reduce) void heroCtrl.start({ rotate: [0, -6, 5, 0], transition: { duration: 0.45 } });
    setTotalWrongs((n) => n + 1);
    const prior = rungWrongs;
    setRungWrongs(prior + 1);
    setSlipped((prev) => [...prev, token.id]);
    const panel = {
      title: WRONG_TITLE,
      explanation: token.explanation || FALLBACK_EXPLANATION,
      tip: prior >= 1 ? hints.tier2 : hints.tier1,
    };
    later(() => setFeedback(panel), reduce ? SLIP_MS_REDUCED : SLIP_MS);
  };

  const stars = totalWrongs === 0 ? 3 : totalWrongs <= 2 ? 2 : 1;
  const score = stars === 3 ? 100 : stars === 2 ? 70 : 40;
  const complete = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete(score);
  };

  /* ---------------- render values ---------------- */

  // Scene geometry, derived from the live scene height so the ladder, the
  // daylight and the hero keep their proportions on a short window.
  const sunD = Math.round(clamp(sceneH * 0.3, 68, 92));
  // The top rung leaves the daylight circle and its label clear of the hero's head.
  const topY = Math.max(FOOT_Y + 30, sceneH - (6 + sunD + 20 + HERO_H));
  const gap = (topY - FOOT_Y) / steps;
  const ladderTop = sceneH - Math.round(sunD * 0.55);
  // Wall thumbnails, bottom up, skipping any that would crowd the one below it
  // on the same wall (a short window has less wall to hang them on).
  const wallSpan = sceneH - 104;
  const lastOnSide: Record<"left" | "right", number> = { left: -999, right: -999 };
  const wallThumbs = WALL_THUMBS.map((def) => ({ def, bottom: Math.round(18 + def.t * wallSpan) })).filter(({ def, bottom }) => {
    if (bottom - lastOnSide[def.side] < 58) return false;
    lastOnSide[def.side] = bottom;
    return true;
  });
  const surfaced = phase === "surfaced";
  const remaining = Math.max(0, steps - level);
  // Round 1 teaches the MECHANIC only: the whole token row breathes, equally,
  // so the glow can never point at an answer.
  const guided = idx === 0 && rungWrongs === 0 && canTap;
  const stripText = surfaced ? bannerLine : rung?.prompt ?? "";
  const stripIcon = surfaced ? "🎉" : "❓";
  const bandLine = surfaced
    ? surfaceLabel
    : guided
      ? "Round 1: tap the move that climbs you out"
      : rungWrongs > 0
        ? "Try another move, Cyber Hero"
        : remaining === 1
          ? "1 rung to daylight"
          : `${remaining} rungs to daylight`;
  const hintText = rungWrongs >= 2 ? hints.tier2 : rungWrongs === 1 ? hints.tier1 : undefined;
  const hintTier = (rungWrongs >= 2 ? 2 : 1) as 1 | 2;
  const readingLabel = narr === "token" ? tokens[tokenRead]?.label ?? "" : "";

  return (
    <ExerciseFrame maxWidth={FRAME_MAX_W} padding={`${FRAME_PAD_Y}px ${FRAME_PAD_X}px`} decor>
      {fx.layer()}
      {verdict.element}

      {/* Sarah's read-alouds (audio only): the how-to once, then each rung's
          prompt and every token label as the rung floats in. */}
      {!showIntro && !finished && rung && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration
              key="gco-howto"
              speaker={coachLines.speaker ?? voice}
              lines={coachLines.lines}
              accent={tint}
              recordedOnly
              onDone={() => readPromptThenTokens(rung)}
            />
          )}
          {narr === "prompt" && rung.prompt && (
            <InfoNarration
              key={`gco-prompt-${rung.id}`}
              speaker={voice}
              lines={[rung.prompt]}
              accent={tint}
              recordedOnly
              onDone={onPromptDone}
            />
          )}
          {narr === "token" && readingLabel && (
            <InfoNarration
              key={`gco-label-${rung.id}-${tokenRead}`}
              speaker={voice}
              lines={[readingLabel]}
              accent={tint}
              recordedOnly
              onDone={onTokenDone}
            />
          )}
        </div>
      )}

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          gap: BOARD_GAP,
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
            // Side padding keeps the header clear of the frame's corner ornaments.
            padding: "0 16px",
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
              color: "#dbeaff",
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
            Rung {Math.min(idx + 1, rungs.length)} of {rungs.length}
          </span>
        </div>

        {/* ------------ the prompt strip (every word Sarah reads) ------------ */}
        <div style={{ display: "flex", justifyContent: "center", padding: "0 12px" }}>
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
              background: surfaced ? "rgba(52,211,153,0.16)" : `${tint}1a`,
              border: `1px solid ${surfaced ? GOOD_GREEN : `${tint}59`}`,
              color: "#eef6ff",
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

        {/* ------------ the burrow: ladder scene + the floating tokens ------------ */}
        <div
          style={{
            position: "relative",
            margin: "0 12px",
            borderRadius: 20,
            overflow: "hidden",
            background: "#140d24",
            border: `2px solid ${tint}33`,
            boxShadow: "inset 0 0 60px rgba(0,0,0,0.55)",
          }}
        >
          {/* ---- the ladder scene ---- */}
          <div style={{ position: "relative", height: sceneH }}>
            {/* burrow strata: warm near the surface, deep purple down at the floor */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(180deg, #7a5a33 0%, #4a3320 26%, #2c2138 60%, #171026 100%)",
              }}
            />
            <RootDoodle bottom={Math.round(sceneH * 0.5)} flip={false} />
            <RootDoodle bottom={Math.round(sceneH * 0.16)} flip />

            <Daylight sunD={sunD} label={surfaceLabel} reduce={reduce} />
            <Ladder height={ladderTop} gap={gap} steps={steps} />

            {wallThumbs.map(({ def, bottom }) => (
              <WallThumb key={def.title} t={def} bottom={bottom} reduce={reduce} />
            ))}

            {/* the burrow floor: the hero can slip to it, never past it */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: 16,
                background: "linear-gradient(180deg, #3f2c1c 0%, #241733 100%)",
                borderTop: "2px solid rgba(255,255,255,0.08)",
                zIndex: 2,
              }}
            />

            {/* the hero on the ladder: only a tap ever moves them */}
            <motion.div
              animate={{ y: -level * gap }}
              transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 130, damping: 17, mass: 0.7 }}
              style={{
                position: "absolute",
                left: "50%",
                bottom: FOOT_Y,
                marginLeft: -HERO_W / 2,
                width: HERO_W,
                zIndex: 3,
                pointerEvents: "none",
              }}
            >
              <motion.div animate={heroCtrl} style={{ transformOrigin: "50% 90%" }}>
                <ClimberKid reduce={reduce} />
              </motion.div>
            </motion.div>

            {/* tunnel vignette + the daylight spill growing as the hero climbs */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 4,
                pointerEvents: "none",
                background: "radial-gradient(ellipse at 50% 45%, transparent 52%, rgba(8,5,16,0.6) 100%)",
              }}
            />
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 4,
                pointerEvents: "none",
                background: "linear-gradient(180deg, rgba(255,236,170,0.2), transparent 48%)",
                opacity: level / steps,
                transition: "opacity 320ms ease",
              }}
            />

            {/* the top rung: the sky takes the burrow and the banner lands */}
            {surfaced && (
              <motion.div
                initial={reduce ? { opacity: 0 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: reduce ? 0.2 : 0.8 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 16,
                  background: "linear-gradient(180deg, #bfe6ff 0%, #fff6d9 62%, #ffe9a0 100%)",
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
                  <PixIcon emoji="✋" size={30} style={{ flexShrink: 0 }} />
                  <span style={{ overflowWrap: "anywhere" }}>{bannerLine}</span>
                </motion.div>
              </motion.div>
            )}
          </div>

          {/* ---- the token band: three uniform tokens floating in beside the hero ---- */}
          <div
            style={{
              position: "relative",
              zIndex: 6,
              minHeight: BAND_MIN_H,
              boxSizing: "border-box",
              padding: "7px 10px 10px",
              background: "linear-gradient(180deg, rgba(8,5,16,0.55) 0%, rgba(8,5,16,0.88) 46%)",
              borderTop: `1px solid ${tint}26`,
            }}
          >
            <div
              style={{
                textAlign: "center",
                marginBottom: 6,
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: surfaced ? GOOD_GREEN : tint,
                minHeight: 14,
              }}
            >
              {bandLine}
            </div>
            <div
              role="group"
              aria-label="Your next move"
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                justifyContent: "center",
                borderRadius: 16,
                padding: 2,
                animation: guided && !reduce ? "gcoGuide 1.6s ease-in-out infinite" : undefined,
                boxShadow: guided ? `0 0 0 3px ${tint}55, 0 0 18px ${tint}66` : undefined,
              }}
            >
              {/* Once the hero is out, the burrow has nothing left to float. */}
              {!surfaced &&
                tokens.map((token, i) => (
                  <TokenTile
                    key={`${rung?.id ?? "none"}-${token.id}`}
                    token={token}
                    order={i}
                    tint={tint}
                    reduce={reduce}
                    held={!canTap}
                    marked={slipped.includes(token.id)}
                    onPick={() => choose(token)}
                  />
                ))}
            </div>
          </div>
        </div>

        {/* ------------ the tiered hint ------------ */}
        {hintText && !surfaced && (
          <div style={{ maxWidth: 560, margin: "0 auto", padding: "0 12px" }}>
            <HintBubble tier={hintTier} speaker={voice} text={hintText} />
          </div>
        )}

        <style>{`
          @keyframes gcoGuide { 0%,100% { box-shadow: 0 0 0 3px ${tint}55, 0 0 16px ${tint}66 } 50% { box-shadow: 0 0 0 7px ${tint}22, 0 0 30px ${tint} } }
          @keyframes gcoFloat { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-3px) } }
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

      {finished && !showIntro && (
        <ExerciseCompleteBeat
          title={completeTitle}
          stars={stars}
          statLines={[
            `${rungs.length} rung${rungs.length === 1 ? "" : "s"} climbed, ${totalWrongs === 0 ? "no slips" : totalWrongs === 1 ? "1 slip" : `${totalWrongs} slips`}`,
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
/* The tokens                                                         */
/* ------------------------------------------------------------------ */

/**
 * One floating token. Every token on a rung wears the same paint, the same
 * size and the same chrome, so the row never hints at the grip. A token only
 * changes once the child has committed to it and heard why.
 */
function TokenTile({
  token,
  order,
  tint,
  reduce,
  held,
  marked,
  onPick,
}: {
  token: ClimbRungToken;
  /** Position in the row: drives which side it drifts in from. */
  order: number;
  tint: string;
  reduce: boolean;
  /** Sarah is speaking, or the hero is already out: not tappable right now. */
  held: boolean;
  /** Already tapped on this rung and taught: out of the running. */
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
      style={{ flex: "1 1 200px", minWidth: 0, maxWidth: 264 }}
    >
      <div style={{ animation: reduce ? undefined : `gcoFloat 4.2s ease-in-out ${order * 0.5}s infinite` }}>
        <motion.button
          type="button"
          aria-label={token.label}
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
              : "linear-gradient(180deg, rgba(38,28,72,0.95) 0%, rgba(20,14,42,0.96) 100%)",
            color: marked ? "#ffd2d2" : "#f3ecff",
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
          <span aria-hidden style={{ flexShrink: 0, display: "grid", placeItems: "center", width: 34, height: 34 }}>
            <PixIcon emoji={token.icon} size={30} />
          </span>
          {/* The card SHOUTS in caps, but the caps live here rather than in the
              authored string. ElevenLabs mangled one all-caps label outright:
              SEARCH FOR WHAT I CAME FOR came out as She for what I came for
              (Abdullah, retest W10), because a label is BOTH what the child
              reads and what Sarah says. Uppercasing in CSS lets such a label be
              written as an ordinary sentence, so it is pronounced properly,
              while the card looks exactly as it always has. Labels still
              authored in caps are unaffected: uppercasing caps is a no-op. */}
          <span style={{ flex: 1, minWidth: 0, overflowWrap: "anywhere", textTransform: "uppercase" }}>{token.label}</span>
          {marked && <PixIcon emoji="⚠️" size={18} style={{ flexShrink: 0 }} />}
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* World pieces                                                       */
/* ------------------------------------------------------------------ */

/** The burrow mouth at the top: the light shaft, the daylight circle, grass. */
function Daylight({ sunD, label, reduce }: { sunD: number; label: string; reduce: boolean }) {
  return (
    <div aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: sunD + 46, pointerEvents: "none", zIndex: 1 }}>
      {/* light shaft spilling down the tunnel */}
      <div
        style={{
          position: "absolute",
          top: sunD * 0.7,
          left: "50%",
          transform: "translateX(-50%)",
          width: sunD * 1.9,
          height: sunD * 2.4,
          background: "linear-gradient(180deg, rgba(255,240,180,0.3), transparent 84%)",
          clipPath: "polygon(24% 0%, 76% 0%, 100% 100%, 0% 100%)",
        }}
      />
      {/* the daylight circle */}
      <motion.div
        animate={reduce ? undefined : { scale: [1, 1.04, 1], opacity: [0.93, 1, 0.93] }}
        transition={reduce ? undefined : { repeat: Infinity, duration: 3.4, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: 6,
          left: "50%",
          marginLeft: -sunD / 2,
          width: sunD,
          height: sunD,
          borderRadius: "50%",
          background: `radial-gradient(circle at 50% 42%, #fffbe8 0%, #ffe9a0 42%, ${SKY_BLUE} 72%, #6db8ef 100%)`,
          boxShadow: "0 0 46px 14px rgba(255,238,170,0.5), 0 0 96px 30px rgba(255,238,170,0.22)",
          border: "5px solid rgba(80,54,28,0.9)",
        }}
      />
      {/* grass tufts on the rim */}
      <svg
        viewBox="0 0 200 40"
        width={sunD * 1.7}
        height={sunD * 0.34}
        aria-hidden
        style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)" }}
      >
        {[14, 44, 78, 116, 152, 182].map((x, i) => (
          <path
            key={i}
            d={`M${x} 38 Q${x - 5} 22 ${x - 9} 12 M${x} 38 Q${x} 18 ${x + 2} 8 M${x} 38 Q${x + 6} 24 ${x + 10} 14`}
            fill="none"
            stroke={i % 2 === 0 ? "#4ea94e" : "#63c163"}
            strokeWidth={3.4}
            strokeLinecap="round"
          />
        ))}
      </svg>
      {/* the surface, named */}
      <span
        style={{
          position: "absolute",
          top: sunD + 8,
          left: "50%",
          transform: "translateX(-50%)",
          padding: "2px 10px",
          borderRadius: 999,
          background: "rgba(10,7,20,0.72)",
          border: "1.5px solid rgba(255,238,170,0.55)",
          color: "#ffe9a0",
          fontSize: 10.5,
          fontWeight: 900,
          letterSpacing: "0.16em",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
    </div>
  );
}

/** The ladder up the middle of the burrow: one rung per climb, plus spares
 *  above and below so it never looks like it stops. */
function Ladder({ height, gap, steps }: { height: number; gap: number; steps: number }) {
  const rungs: number[] = [];
  for (let i = -1; i <= steps + 1; i++) rungs.push(i);
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        bottom: 0,
        left: "50%",
        marginLeft: -LADDER_W / 2,
        width: LADDER_W,
        height,
        zIndex: 2,
      }}
    >
      {(["left", "right"] as const).map((s) => (
        <div
          key={s}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            [s]: 0,
            width: 8,
            borderRadius: 4,
            background: `linear-gradient(90deg, ${LADDER_WOOD}, #7a4a21)`,
            boxShadow: "0 0 8px rgba(0,0,0,0.5)",
          }}
        />
      ))}
      {rungs.map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            bottom: FOOT_Y + i * gap - 5,
            left: 3,
            right: 3,
            height: 8,
            borderRadius: 4,
            background: "linear-gradient(180deg, #c98a48, #96602c)",
            boxShadow: "0 2px 3px rgba(0,0,0,0.45)",
          }}
        />
      ))}
    </div>
  );
}

/** A glowing video thumbnail sunk into the burrow wall. */
function WallThumb({
  t,
  bottom,
  reduce,
}: {
  t: { t: number; side: "left" | "right"; title: string; time: string; hue: number; weird: number };
  /** Where it hangs on the wall (px up from the scene bottom). */
  bottom: number;
  reduce: boolean;
}) {
  const wobble = 1.6 + t.weird * 2.6;
  return (
    <motion.div
      aria-hidden
      animate={reduce ? undefined : { rotate: [-wobble, wobble, -wobble] }}
      transition={reduce ? undefined : { repeat: Infinity, duration: 3 - t.weird * 1.1, ease: "easeInOut" }}
      style={{ position: "absolute", bottom, [t.side]: 6, width: 82, zIndex: 1 }}
    >
      <div
        style={{
          position: "relative",
          height: 46,
          borderRadius: 9,
          overflow: "hidden",
          background: `linear-gradient(160deg, hsl(${t.hue} 75% ${52 - t.weird * 14}%), hsl(${(t.hue + 45) % 360} 85% ${30 - t.weird * 8}%))`,
          border: "2px solid rgba(255,255,255,0.26)",
          boxShadow: `0 0 ${12 + t.weird * 20}px hsla(${t.hue}, 90%, 60%, ${0.32 + t.weird * 0.3})`,
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width={20}
          height={20}
          aria-hidden
          style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
        >
          <circle cx={12} cy={12} r={11} fill="rgba(255,255,255,0.28)" />
          <path d="M9.5 7.5 L17 12 L9.5 16.5 Z" fill="#fff" />
        </svg>
        <span
          style={{
            position: "absolute",
            right: 3,
            bottom: 3,
            padding: "0 4px",
            borderRadius: 4,
            background: "rgba(0,0,0,0.7)",
            color: "#fff",
            fontSize: 8,
            fontWeight: 800,
          }}
        >
          {t.time}
        </span>
      </div>
      <div
        style={{
          marginTop: 3,
          fontSize: 9,
          fontWeight: 800,
          lineHeight: 1.2,
          textAlign: "center",
          color: `hsl(${t.hue} 70% ${82 - t.weird * 10}%)`,
        }}
      >
        {t.title}
      </div>
    </motion.div>
  );
}

/** Squiggly wall root, for texture. */
function RootDoodle({ bottom, flip }: { bottom: number; flip: boolean }) {
  const place: CSSProperties = flip ? { right: -6 } : { left: -6 };
  return (
    <svg
      viewBox="0 0 90 50"
      width={74}
      height={41}
      aria-hidden
      style={{ position: "absolute", bottom, ...place, transform: flip ? "scaleX(-1)" : undefined, opacity: 0.5, zIndex: 1 }}
    >
      <path
        d="M0 10 Q28 6 40 20 Q48 30 44 44 M14 12 Q30 18 34 34"
        fill="none"
        stroke="#5b3a1e"
        strokeWidth={6}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** The climbing hero, seen from behind, straddling the ladder. */
function ClimberKid({ reduce }: { reduce: boolean }) {
  return (
    <motion.svg
      width={HERO_W}
      height={HERO_H}
      viewBox="0 0 92 100"
      aria-hidden
      animate={reduce ? undefined : { rotate: [-1.2, 1.2, -1.2] }}
      transition={reduce ? undefined : { repeat: Infinity, duration: 3.4, ease: "easeInOut" }}
      style={{ display: "block", transformOrigin: "50% 84%" }}
    >
      {/* legs + shoes */}
      <rect x={30} y={70} width={11} height={22} rx={5.5} fill="#2f5f9e" />
      <rect x={51} y={70} width={11} height={22} rx={5.5} fill="#2f5f9e" />
      <ellipse cx={35} cy={94} rx={9} ry={5} fill="#26324a" />
      <ellipse cx={57} cy={94} rx={9} ry={5} fill="#26324a" />
      {/* both arms up on the rung above */}
      <path d="M34 48 C27 38 22 30 18 20" fill="none" stroke="#3ec6ad" strokeWidth={11} strokeLinecap="round" />
      <path d="M58 48 C65 38 70 30 74 20" fill="none" stroke="#35ab95" strokeWidth={11} strokeLinecap="round" />
      <circle cx={18} cy={18} r={7} fill="#ffd9a8" />
      <circle cx={74} cy={18} r={7} fill="#ffd9a8" />
      {/* hoodie body */}
      <rect x={26} y={34} width={40} height={40} rx={15} fill="#3ec6ad" />
      {/* backpack */}
      <rect x={33} y={39} width={26} height={30} rx={9} fill="#ffb347" />
      <rect x={33} y={50} width={26} height={6} rx={3} fill="#e08f1f" />
      {/* head from behind + ears */}
      <circle cx={46} cy={21} r={15} fill="#5b3a1e" />
      <circle cx={31} cy={23} r={4} fill="#ffd9a8" />
      <circle cx={61} cy={23} r={4} fill="#ffd9a8" />
    </motion.svg>
  );
}
