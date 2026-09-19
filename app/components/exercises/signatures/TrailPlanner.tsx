"use client";

/**
 * READ YOUR OWN TRAIL: Week 12 (Digital Footprint: Tracks in the Snow)
 * signature exercise, rebuilt as a data-driven, TAP-ONLY, UNTIMED concept game
 * to the Learn-Loop standard (the same conversion the Great Climb-Out got for
 * Week 10 and the Calm-Down Console for Week 11).
 *
 * The old Trail Planner asked the child to DRAW a route with a finger and
 * timed a hound chasing it. Nothing is drawn or timed any more.
 *
 * The child now stands in The Snowfield at the end of their own trail, with
 * the low sun behind it throwing every print into relief. They walk the trail
 * BACK, stretch by stretch, reading it the way a stranger would:
 *
 *   Each stretch says what a stranger can read off it (the stop's
 *   `readAloud`), and three uniform choices float in underneath. They wear the
 *   same paint, the same size and the same chrome, so nothing gives the answer
 *   away: exactly one is the ranger's move, and the other two leave the pointy
 *   bit sitting in the snow.
 *
 *   Right call: the print turns gold, the hero walks on to the next stretch
 *     and Sarah says "That's right!" + the option's `why` in one take.
 *   Wrong call: a stranger's eye blinks over that stretch, the shared teach
 *     panel speaks "Not quite." + the option's `explanation`, that choice is
 *     marked, and the SAME stretch waits for the retry. The hero never loses
 *     ground: a trail you have already walked cannot be un-walked.
 *
 * There is no timer, no drawing, no chase and no fail state: the only thing
 * that ever moves the hero is a tap. Reading the last stretch lifts the sun,
 * turns the whole trail gold and raises the "TRAIL READ!" banner, then the
 * complete beat speaks the payoff. Concept 5: scan your own trail.
 *
 * Learn-Loop wiring: the Raccoon's boast folds into the shared intro
 * (`threat`); Sarah speaks the how-to once as the board appears (`coachLines`),
 * then each stretch's `readAloud` and every option `label` as the stretch
 * arrives (audio only, `recordedOnly`, the board held while she speaks and
 * released by the shared spoken gate); a right call speaks through
 * VerdictVoice, a wrong one through WrongAnswerPanel; the complete beat speaks
 * the payoff, and it is held back until Sarah has finished (the Week 9 bug).
 * Round 1 guides the MECHANIC only: the choice row breathes and the band says
 * what to do, never which choice.
 *
 * EVERY spoken string comes from the week file. The clip generator reads the
 * week, never this engine, so the defaults below exist for one reason only:
 * to keep the legacy signature mount (`{ onComplete, narration, accent }`)
 * compiling and playable with no content file.
 *
 * Layout: the header, prompt strip, snowfield panel, choice band and hint all
 * fit the owner's 1414x771 window (the snowfield shrinks with the window), and
 * the choice row stacks rather than scrolling sideways at 400px.
 */

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
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
// the Great Climb-Out and the Calm-Down Console.
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

export interface TrailStop { id: string; label: string; icon: string; readAloud: string; options: { id: string; label: string; icon: string; isRight: boolean; why: string; explanation: string }[]; }
export interface TrailPlannerProps {
  stops?: TrailStop[];               // optional: built-in defaults keep the legacy registry mount working
  introTitle?: string; introSubtitle?: string; introIcon?: string;
  trailLabel?: string;               // default "YOUR TRAIL"
  askPrompt?: string;                // default "What would you do with this one?"
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
 * One choice under a stretch. A local alias of the inline option type above, so
 * the exported prop contract stays byte-identical to the one the week file and
 * `types.ts` are wired against.
 */
type TrailOption = TrailStop["options"][number];

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
 * Window height that is not the snowfield: lesson HUD 64 + stage padding 80 +
 * frame padding 32 + header 28 + gaps 24 + strip 40 + choice band 134 + hint
 * room 70 + 8 spare. At 1414x771 the snowfield takes its full height and
 * nothing needs a scroll.
 */
const HEIGHT_RESERVE_PX = 480;
const MAX_SCENE_H = 270;
const MIN_SCENE_H = 168;

/** Where the snow starts inside the scene (fraction of the scene height). */
const HORIZON_FRAC = 0.36;
/** Room the choice band needs under the snowfield. */
const BAND_MIN_H = 130;

/** Marker geometry: the print nearest the child is full size, far ones shrink. */
const MARK_MAX = 46;
/** Loose prints strewn along the trail between the marked stretches. */
const LOOSE_PRINTS = 15;

const PEEK_MS = 720;
const PEEK_MS_REDUCED = 260;
const NEXT_STOP_MS = 780;
const SUNRISE_MS = 1500;

const GOOD_GREEN = "#34d399";
const BAD_RED = "#ff5d5d";
const SUN_GOLD = "#ffd27a";
const SNOW_BLUE = "#9fb9dd";
const DEFAULT_TINT = "#bfe3ff";

const WRONG_TITLE = "A stranger can still read that one";
const FALLBACK_EXPLANATION =
  "That move leaves the pointy bit sitting in the snow. Look for the one that tidies it up.";

/* ------------------------------------------------------------------ */
/* Default content (the legacy signature mount)                       */
/* ------------------------------------------------------------------ */

/*
 * Authoring rule for a stretch: exactly ONE option has `isRight: true`. Only a
 * right option's `why` is ever spoken (it can never be tapped wrongly) and only
 * a wrong option's `explanation` is ever spoken (it can never be right), so the
 * unused half of each pair stays empty rather than being filled with copy no
 * child hears. `label` is the short name of the stretch on the board; the words
 * Sarah reads out are `readAloud`.
 *
 * Not every stretch is a problem: the last one here is a track worth keeping,
 * so "read your trail" never collapses into "delete everything".
 */
const STOPS: TrailStop[] = [
  {
    id: "jumper-photo",
    label: "The school-jumper photo",
    icon: "📸",
    readAloud:
      "Here is the first stretch of your trail. A stranger reading it can see the school badge on your jumper, so now they know where you go every morning. What would you do with this one?",
    options: [
      {
        id: "repost-plain",
        label: "Take it down, post the same photo without the badge",
        icon: "🗑️",
        isRight: true,
        why: "You kept the happy photo and took the badge away, so the stranger loses the one thing that told them where you go.",
        explanation: "",
      },
      {
        id: "leave-jumper",
        label: "Leave it, it is only a jumper",
        icon: "👍",
        isRight: false,
        why: "",
        explanation: "A jumper with a badge on it is a signpost to your school. Fresh snow keeps that print until you tidy it.",
      },
      {
        id: "add-class",
        label: "Add a caption saying which class you are in",
        icon: "🏷️",
        isRight: false,
        why: "",
        explanation: "That presses a second, deeper print. Now the stranger knows your school AND the room you sit in.",
      },
    ],
  },
  {
    id: "park-at-four",
    label: "The park at four o'clock",
    icon: "📍",
    readAloud:
      "The next stretch says you are at the same park every day at four o'clock. A stranger reading it knows exactly where to stand and when. What would you do with this one?",
    options: [
      {
        id: "drop-the-when",
        label: "Take the place and the time out, keep the fun bit",
        icon: "✋",
        isRight: true,
        why: "The fun still belongs to you. It is the WHERE and the when a stranger uses, and you just brushed both away.",
        explanation: "",
      },
      {
        id: "post-again",
        label: "Post it again tomorrow so friends can find you",
        icon: "🔔",
        isRight: false,
        why: "",
        explanation: "Your friends already know where you play. Posting it again only stamps the same print deeper for everyone else.",
      },
      {
        id: "lots-of-kids",
        label: "Leave it up, loads of kids play there",
        icon: "🏠",
        isRight: false,
        why: "",
        explanation: "Loads of kids play there, but only your trail says YOU are there at four. That is the print a stranger follows.",
      },
    ],
  },
  {
    id: "grumpy-message",
    label: "The grumpy message",
    icon: "💬",
    readAloud:
      "Further back there is a grumpy message you sent about a friend on a bad day. A stranger reading it thinks that is just how you talk. What would you do with this one?",
    options: [
      {
        id: "take-down-say-sorry",
        label: "Take it down and say sorry to your friend",
        icon: "🗑️",
        isRight: true,
        why: "You tidied the print AND you mended the person, Cyber Hero. That is the whole ranger job in one move.",
        explanation: "",
      },
      {
        id: "everyone-joking",
        label: "Leave it, everyone was joking",
        icon: "😂",
        isRight: false,
        why: "",
        explanation: "A joke you have to explain is not a joke to the person in it, and the words sit in the snow long after the day is over.",
      },
      {
        id: "explain-post",
        label: "Post another message explaining it",
        icon: "📣",
        isRight: false,
        why: "",
        explanation: "That is two prints now instead of one, and the grumpy one is still there underneath the new one.",
      },
    ],
  },
  {
    id: "helping-hand",
    label: "The helping-hand post",
    icon: "✨",
    readAloud:
      "The last stretch is the day you helped a new kid find their classroom and somebody posted a thank you. A stranger reading it sees somebody KIND. What would you do with this one?",
    options: [
      {
        id: "leave-it-shining",
        label: "Leave that one exactly where it is",
        icon: "🌟",
        isRight: true,
        why: "Not every track is a problem. That one is golden, and a trail full of golden prints is the one worth leaving.",
        explanation: "",
      },
      {
        id: "delete-everything",
        label: "Delete it too, everything has to go",
        icon: "🗑️",
        isRight: false,
        why: "",
        explanation: "Reading your trail is not scrubbing it blank. Wiping the kind prints away only leaves the pointy ones behind.",
      },
      {
        id: "add-address",
        label: "Add your address so they can send a card",
        icon: "🏠",
        isRight: false,
        why: "",
        explanation: "A kind print does not need your address on it. That would stamp the one thing a stranger really wants.",
      },
    ],
  },
];

const DEFAULT_INTRO_SUBTITLE =
  "The low sun is out and every print you left is showing. Walk your trail back and read it the way a stranger would.";
const DEFAULT_COMPLETE_LINE =
  "Once a week, walk your own trail. Tidy the pointy prints, and leave the golden ones shining.";
const DEFAULT_HINTS = {
  tier1: "Read the stretch like a stranger. What does it tell them about where you are?",
  tier2: "Pick the move that takes the telling bit away and keeps the happy bit.",
};

const EMPTY_OPTIONS: TrailOption[] = [];

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

// A read-aloud only starts when there is something to say and the lesson is not
// muted, so the spoken gate never waits on a clip that cannot play.
const canRead = (text?: string) => !isAudioMuted() && !!text;

/** The snowfield height for a window: never taller than the design, never so
 *  short the trail stops reading. Read through useSyncExternalStore, so a
 *  resize re-renders with no effect-driven state. */
const sceneHeightFor = (vh: number) => Math.round(clamp(vh - HEIGHT_RESERVE_PX, MIN_SCENE_H, MAX_SCENE_H));
const subscribeViewport = (onChange: () => void) => {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
};
const readSceneH = () => sceneHeightFor(window.innerHeight);
const serverSceneH = () => MAX_SCENE_H;

/**
 * Trail geometry. `t` runs 0 (the oldest stretch, far off by the low sun) to 1
 * (where the child is standing now). The trail is laid out in percentages of
 * the snow area, so it holds its shape at 400px and at 1414px alike, and the
 * far end sits smaller and higher for depth.
 */
const trailLeftPct = (t: number) => 10 + 80 * t;
const trailBottomFrac = (t: number) => 0.72 - 0.6 * t + 0.05 * Math.sin(t * 4.2);
const trailScale = (t: number) => 0.62 + 0.38 * t;
/** The `t` of a stretch, oldest first. */
const stopT = (i: number, total: number) => (total <= 1 ? 0.5 : i / (total - 1));

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

type Narr = "howto" | "read" | "option" | "idle";
type Phase = "walk" | "read-out";

export default function TrailPlanner({
  stops = STOPS,
  introTitle = "Read Your Own Trail",
  introSubtitle = DEFAULT_INTRO_SUBTITLE,
  introIcon = "📍",
  trailLabel = "YOUR TRAIL",
  askPrompt = "What would you do with this one?",
  completeTitle = "You read your whole trail!",
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
}: TrailPlannerProps) {
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

  const [showIntro, setShowIntro] = useState(true);
  const [idx, setIdx] = useState(0);
  // Stretches already read and tidied: they turn gold and stay gold, so the
  // child can see how much of their own trail they have walked.
  const [read, setRead] = useState(0);
  // Read-aloud chain: the how-to once as the board appears ("howto"), then each
  // stretch's read-aloud ("read") and every option label in the order they are
  // shown ("option", which one = optionRead). Taps are held while she speaks.
  const [narr, setNarr] = useState<Narr>("idle");
  const [optionRead, setOptionRead] = useState(0);
  const [phase, setPhase] = useState<Phase>("walk");
  // A stranger's eye blinking over the stretch the child just misread.
  const [peeking, setPeeking] = useState(false);
  // Options already tapped on this stretch: marked after the teach, so the
  // retry narrows instead of repeating.
  const [marked, setMarked] = useState<readonly string[]>([]);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [stopWrongs, setStopWrongs] = useState(0);
  const [totalWrongs, setTotalWrongs] = useState(0);

  const completedRef = useRef(false);
  const timersRef = useRef<number[]>([]);
  /** Shuts a stretch the instant it is answered, before React re-renders. */
  const answeringRef = useRef(false);

  const later = (fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  };
  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  const total = Math.max(1, stops.length);
  const finished = idx >= stops.length;
  const stop: TrailStop | undefined = stops[idx];
  const authored = stop?.options ?? EMPTY_OPTIONS;
  // The order the child picks from is muddled on every play (and re-muddled for
  // every stretch), never the authored order.
  const shuffled = useShuffledOnce(authored, { key: idx });
  // useShuffledOnce re-shuffles in a layout effect, so for one pre-paint commit
  // after a stretch change it still holds the previous stretch's options. Fall
  // back to the authored list for that commit, so nothing reads the wrong label.
  const options =
    shuffled.length === authored.length && shuffled.every((o) => authored.includes(o)) ? shuffled : authored;

  // Spoken verdicts: Sarah says "That's right!" + why and the next stretch waits
  // for her. Wrong calls speak through WrongAnswerPanel.
  const verdict = useVerdictVoice(voice);
  const speaking = narr !== "idle" || verdict.speaking || !!feedback;
  const canTap = !showIntro && !finished && !!stop && !speaking && !peeking && phase === "walk";

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

  const readStopThenOptions = (s: TrailStop | undefined) => {
    if (!s) {
      setNarr("idle");
      return;
    }
    setOptionRead(0);
    setNarr(canRead(s.readAloud) ? "read" : canRead(s.options[0]?.label) ? "option" : "idle");
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
    else readStopThenOptions(stops[0]);
  };

  const advance = () => {
    const next = idx + 1;
    setIdx(next);
    setMarked([]);
    setStopWrongs(0);
    setOptionRead(0);
    answeringRef.current = false;
    if (next < stops.length) readStopThenOptions(stops[next]);
    else setNarr("idle");
  };

  /* ---------------- the only judged tap ---------------- */

  const choose = (option: TrailOption) => {
    if (!stop || !canTap || marked.includes(option.id)) return;
    // `canTap` only closes once React has re-rendered on verdict.speaking, and a
    // right answer never marks its option, so a quick second tap landed inside
    // that window and restarted the verdict, cutting Sarah off mid-sentence.
    // This latch shuts the stretch synchronously; `advance` reopens it.
    if (answeringRef.current) return;
    answeringRef.current = true;
    onAnswered?.({
      questionKey: `trail-${stop.id}`,
      selectedIndex: stop.options.findIndex((o) => o.id === option.id),
      correctIndex: stop.options.findIndex((o) => o.isRight),
      wasCorrect: option.isRight,
    });

    if (option.isRight) {
      // fx.correct plays its own chime (no audio.correct() here).
      fx.correct({ xp: 25 });
      onCorrect?.();
      const walked = idx + 1;
      setRead(walked);
      later(() => audio.drop(), reduce ? 40 : 180);
      const out = walked >= total;
      if (out) {
        setPhase("read-out");
        later(() => audio.unlock(), reduce ? 120 : 520);
      }
      // Sarah: "That's right!" + why, one take; then a beat and the next stretch.
      verdict.say("right", option.why, () => later(advance, reduce ? 200 : out ? SUNRISE_MS : NEXT_STOP_MS));
      return;
    }

    // Wrong: a stranger's eye blinks over the stretch, then the teach panel (it
    // speaks "Not quite." + explanation itself). The same stretch waits, and the
    // hero keeps every step already walked.
    audio.wrong();
    onWrong?.();
    setPeeking(true);
    setTotalWrongs((n) => n + 1);
    const prior = stopWrongs;
    setStopWrongs(prior + 1);
    setMarked((prev) => [...prev, option.id]);
    const panel = {
      title: WRONG_TITLE,
      explanation: option.explanation || FALLBACK_EXPLANATION,
      tip: prior >= 1 ? hints.tier2 : hints.tier1,
    };
    later(
      () => {
        setPeeking(false);
        setFeedback(panel);
        // the same stretch waits, so the child must be able to tap again
        answeringRef.current = false;
      },
      reduce ? PEEK_MS_REDUCED : PEEK_MS,
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

  const horizon = Math.round(sceneH * HORIZON_FRAC);
  const snowH = sceneH - horizon;
  const sunD = Math.round(clamp(sceneH * 0.26, 52, 76));
  const readOut = phase === "read-out";
  const remaining = Math.max(0, total - read);
  // The hero stands on the stretch being read; once the trail is read they walk
  // on past the last print, out of the snowfield.
  const heroT = finished || readOut ? 1.06 : stopT(Math.min(idx, stops.length - 1), total);
  // Round 1 teaches the MECHANIC only: the whole choice row breathes, equally,
  // so the glow can never point at an answer.
  const guided = idx === 0 && stopWrongs === 0 && canTap;
  const stripText = readOut ? "TRAIL READ!" : stop?.readAloud ?? "";
  const stripIcon = readOut ? "🎉" : "🔍";
  const bandLine = readOut
    ? "EVERY PRINT CHECKED"
    : guided
      ? "Round 1: tap what you would do"
      : stopWrongs > 0
        ? "Try another move, Cyber Hero"
        : remaining === 1
          ? "1 stretch left to read"
          : `${remaining} stretches left to read`;
  const hintText = stopWrongs >= 2 ? hints.tier2 : stopWrongs === 1 ? hints.tier1 : undefined;
  const hintTier = (stopWrongs >= 2 ? 2 : 1) as 1 | 2;
  const readingLabel = narr === "option" ? options[optionRead]?.label ?? "" : "";

  return (
    <ExerciseFrame maxWidth={FRAME_MAX_W} padding={`${FRAME_PAD_Y}px 0`} decor>
      {fx.layer()}
      {verdict.element}

      {/* Sarah's read-alouds (audio only): the how-to once, then each stretch's
          read-aloud and every option label as the stretch arrives. */}
      {!showIntro && !finished && stop && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration
              key="tpl-howto"
              speaker={coachLines.speaker ?? voice}
              lines={coachLines.lines}
              accent={tint}
              recordedOnly
              onDone={() => readStopThenOptions(stop)}
            />
          )}
          {narr === "read" && stop.readAloud && (
            <InfoNarration
              key={`tpl-read-${stop.id}`}
              speaker={voice}
              lines={[stop.readAloud]}
              accent={tint}
              recordedOnly
              onDone={onReadDone}
            />
          )}
          {narr === "option" && readingLabel && (
            <InfoNarration
              key={`tpl-label-${stop.id}-${optionRead}`}
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
            Stretch {Math.min(idx + 1, stops.length)} of {stops.length}
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
              background: readOut ? "rgba(52,211,153,0.16)" : `${tint}1a`,
              border: `1px solid ${readOut ? GOOD_GREEN : `${tint}59`}`,
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

        {/* ------------ the snowfield: the trail + the choice band ------------ */}
        <div
          style={{
            position: "relative",
            borderRadius: 20,
            overflow: "hidden",
            background: "#0e1730",
            border: `2px solid ${tint}33`,
            boxShadow: "inset 0 0 60px rgba(0,0,0,0.45)",
          }}
        >
          {/* ---- the snowfield scene ---- */}
          <div style={{ position: "relative", height: sceneH }}>
            {/* the sky, cold at the top and warm down at the low sun */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                height: horizon,
                background: readOut
                  ? "linear-gradient(180deg, #2b4a86 0%, #6f8ec6 44%, #ffcf8e 100%)"
                  : "linear-gradient(180deg, #1d2c52 0%, #47598e 46%, #d79a6a 100%)",
                transition: "background 700ms ease",
              }}
            />
            {/* the low sun: it lifts a little once the whole trail is read */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                right: "14%",
                bottom: snowH - (readOut ? Math.round(sunD * 0.28) : Math.round(sunD * 0.52)),
                width: sunD,
                height: sunD,
                borderRadius: "50%",
                background: `radial-gradient(circle at 50% 46%, #fff3d0 0%, ${SUN_GOLD} 58%, rgba(255,196,110,0.25) 100%)`,
                boxShadow: `0 0 56px ${SUN_GOLD}aa`,
                transition: "bottom 900ms ease",
              }}
            />
            {/* a far stand of firs, so the skyline reads as ground and not fog */}
            <TreeLine snowH={snowH} />

            {/* the snow itself */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: snowH,
                background: "linear-gradient(180deg, #e8f1ff 0%, #d5e4f8 38%, #b9cfec 100%)",
              }}
            />
            {/* the low sun's sheen lying across the snow */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: snowH,
                background: `radial-gradient(ellipse at 84% 4%, ${SUN_GOLD}66 0%, transparent 58%)`,
                pointerEvents: "none",
              }}
            />

            {/* ---- the trail: a groove, loose prints, then the marked stretches ---- */}
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: snowH }}>
              <TrailGroove total={total} gold={readOut} />

              {Array.from({ length: LOOSE_PRINTS }, (_, i) => {
                const t = -0.08 + (i * 1.16) / (LOOSE_PRINTS - 1);
                const s = trailScale(t);
                const walkedTo = finished || readOut ? 1.1 : stopT(Math.min(idx, stops.length - 1), total);
                const lit = readOut || t <= walkedTo + 0.02;
                return (
                  <div
                    key={`print-${i}`}
                    aria-hidden
                    style={{
                      position: "absolute",
                      left: `${trailLeftPct(t)}%`,
                      bottom: Math.round(trailBottomFrac(t) * snowH),
                      width: 0,
                      height: 0,
                      zIndex: 2,
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: "50%",
                        bottom: 0,
                        transform: `translateX(-50%) rotate(${i % 2 === 0 ? -12 : 10}deg)`,
                        width: Math.round(10 * s),
                        height: Math.round(15 * s),
                        borderRadius: "50% 50% 46% 46%",
                        background: lit ? "rgba(255,203,110,0.55)" : "rgba(108,140,186,0.5)",
                        boxShadow: lit ? `0 0 10px ${SUN_GOLD}77` : "inset 0 2px 4px rgba(50,80,130,0.5)",
                        transition: "background 420ms ease, box-shadow 420ms ease",
                      }}
                    />
                  </div>
                );
              })}

              {stops.map((s, i) => {
                const t = stopT(i, total);
                const size = Math.round(MARK_MAX * trailScale(t));
                const state: MarkState =
                  i < read ? "read" : i === idx && !finished ? (peeking ? "peeked" : "now") : "ahead";
                return (
                  <div
                    key={s.id}
                    style={{
                      position: "absolute",
                      left: `${trailLeftPct(t)}%`,
                      bottom: Math.round(trailBottomFrac(t) * snowH),
                      width: 0,
                      height: 0,
                      zIndex: 3 + i,
                    }}
                  >
                    <PrintMark stop={s} size={size} state={state} tint={tint} reduce={reduce} />
                  </div>
                );
              })}

              {/* the hero walking their own trail back: only a tap moves them */}
              <div
                style={{
                  position: "absolute",
                  left: `${trailLeftPct(heroT)}%`,
                  bottom: Math.round(trailBottomFrac(heroT) * snowH),
                  width: 0,
                  height: 0,
                  zIndex: 20,
                  pointerEvents: "none",
                  transition: reduce ? "left 180ms linear, bottom 180ms linear" : "left 700ms ease, bottom 700ms ease",
                }}
              >
                <div style={{ position: "absolute", left: "50%", bottom: 2, transform: "translateX(-50%)" }}>
                  <RangerKid height={Math.round(58 * trailScale(Math.min(heroT, 1)))} reduce={reduce} />
                </div>
              </div>
            </div>

            {/* a soft vignette so the board reads as one lit surface */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 25,
                pointerEvents: "none",
                background: "radial-gradient(ellipse at 50% 46%, transparent 56%, rgba(8,14,30,0.45) 100%)",
              }}
            />

            {/* the last stretch: the sun comes up on the whole trail */}
            {readOut && (
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
                  background: "linear-gradient(180deg, #ffe6b4 0%, #fff6de 54%, #eaf4ff 100%)",
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
                  <PixIcon emoji="📍" size={30} style={{ flexShrink: 0 }} />
                  <span style={{ overflowWrap: "anywhere" }}>TRAIL READ!</span>
                </motion.div>
              </motion.div>
            )}
          </div>

          {/* ---- the choice band: uniform moves for this stretch ---- */}
          <div
            style={{
              position: "relative",
              zIndex: 31,
              minHeight: BAND_MIN_H,
              boxSizing: "border-box",
              padding: "7px 10px 10px",
              background: "linear-gradient(180deg, rgba(8,14,30,0.6) 0%, rgba(8,14,30,0.9) 46%)",
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
                color: readOut ? GOOD_GREEN : tint,
                minHeight: 14,
                textAlign: "center",
              }}
            >
              <span>{trailLabel}</span>
              <span style={{ color: "#c6d4ee", letterSpacing: "0.08em" }}>{bandLine}</span>
            </div>

            {!readOut && stop && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 7,
                  color: "#eef6ff",
                  fontSize: 14,
                  fontWeight: 800,
                  lineHeight: 1.25,
                  textAlign: "center",
                }}
              >
                <PixIcon emoji={stop.icon} size={20} style={{ flexShrink: 0 }} />
                <span style={{ overflowWrap: "anywhere" }}>{stop.label}</span>
                <span style={{ color: "#a9bcda", fontWeight: 700, overflowWrap: "anywhere" }}>{askPrompt}</span>
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
                animation: guided && !reduce ? "tplGuide 1.6s ease-in-out infinite" : undefined,
                boxShadow: guided ? `0 0 0 3px ${tint}55, 0 0 18px ${tint}66` : undefined,
              }}
            >
              {/* Once the trail is read, there is nothing left to decide. */}
              {!readOut &&
                options.map((option, i) => (
                  <MoveTile
                    key={`${stop?.id ?? "none"}-${option.id}`}
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
        {hintText && !readOut && (
          <div style={{ maxWidth: 560, width: "100%", margin: "0 auto" }}>
            <HintBubble tier={hintTier} speaker={voice} text={hintText} />
          </div>
        )}

        <style>{`
          @keyframes tplGuide { 0%,100% { box-shadow: 0 0 0 3px ${tint}55, 0 0 16px ${tint}66 } 50% { box-shadow: 0 0 0 7px ${tint}22, 0 0 30px ${tint} } }
          @keyframes tplNow { 0%,100% { box-shadow: 0 0 0 3px rgba(255,255,255,0.7), 0 0 18px ${SUN_GOLD} } 50% { box-shadow: 0 0 0 6px rgba(255,255,255,0.28), 0 0 30px ${SUN_GOLD} } }
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
            `${stops.length} stretch${stops.length === 1 ? "" : "es"} read, ${totalWrongs === 0 ? "nothing missed" : totalWrongs === 1 ? "1 second look" : `${totalWrongs} second looks`}`,
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
/* The trail groove                                                   */
/* ------------------------------------------------------------------ */

/**
 * The scuffed line the prints sit in. Drawn in a stretched viewBox so the trail
 * keeps its shape at any width; `vectorEffect="non-scaling-stroke"` keeps the
 * groove one even thickness instead of smearing with the stretch.
 */
function TrailGroove({ total, gold }: { total: number; gold: boolean }) {
  const steps = Math.max(2, total * 3);
  const ts = [-0.1, ...Array.from({ length: steps }, (_, i) => i / (steps - 1)), 1.1];
  const d = ts
    .map((t, i) => `${i === 0 ? "M" : "L"} ${trailLeftPct(t).toFixed(2)} ${((1 - trailBottomFrac(t)) * 100).toFixed(2)}`)
    .join(" ");
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1, pointerEvents: "none" }}
    >
      <path
        d={d}
        fill="none"
        stroke={gold ? "rgba(255,196,110,0.75)" : "rgba(122,156,205,0.5)"}
        strokeWidth={9}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        style={{ transition: "stroke 520ms ease" }}
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* The tree line                                                      */
/* ------------------------------------------------------------------ */

/** A far stand of snowy firs on the skyline, so the horizon reads as ground. */
function TreeLine({ snowH }: { snowH: number }) {
  const trees = [6, 13, 19, 27, 34, 46, 55, 63, 71, 79, 88, 95];
  return (
    <div
      aria-hidden
      style={{ position: "absolute", left: 0, right: 0, bottom: snowH - 4, height: 26, pointerEvents: "none", zIndex: 1 }}
    >
      {trees.map((x, i) => {
        const h = 14 + ((i * 7) % 11);
        return (
          <div
            key={x}
            style={{
              position: "absolute",
              left: `${x}%`,
              bottom: 0,
              width: 0,
              height: 0,
              borderLeft: `${Math.round(h * 0.34)}px solid transparent`,
              borderRight: `${Math.round(h * 0.34)}px solid transparent`,
              borderBottom: `${h}px solid rgba(30,52,86,0.68)`,
              transform: "translateX(-50%)",
            }}
          />
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* One marked stretch of the trail                                    */
/* ------------------------------------------------------------------ */

type MarkState = "ahead" | "now" | "peeked" | "read";

/**
 * A stretch of the trail the child has to read. Every stretch wears the same
 * paint until it is reached, so the trail never hints at which one is the
 * problem: the one being read glows, a misread one blinks a stranger's eye,
 * and a tidied one turns gold and stays gold.
 *
 * The wrapper the mark sits in is zero-size and the mark centres itself inside
 * it, so the pulsing mark can animate scale without fighting a static translate.
 */
function PrintMark({
  stop,
  size,
  state,
  tint,
  reduce,
}: {
  stop: TrailStop;
  size: number;
  state: MarkState;
  tint: string;
  reduce: boolean;
}) {
  const read = state === "read";
  const now = state === "now";
  const peeked = state === "peeked";
  const border = peeked ? BAD_RED : read ? SUN_GOLD : now ? "#ffffff" : `${tint}88`;
  const bg = peeked
    ? "linear-gradient(180deg, rgba(92,26,38,0.95) 0%, rgba(52,14,24,0.96) 100%)"
    : read
      ? "linear-gradient(180deg, rgba(255,226,170,0.95) 0%, rgba(255,196,110,0.92) 100%)"
      : "linear-gradient(180deg, rgba(30,46,78,0.94) 0%, rgba(18,28,52,0.96) 100%)";
  return (
    <div style={{ position: "absolute", left: "50%", bottom: 0, transform: "translateX(-50%)" }}>
      {/* the long blue shadow the low sun throws off every print */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: "50%",
          bottom: -3,
          width: Math.round(size * 1.5),
          height: Math.round(size * 0.34),
          marginLeft: -Math.round(size * 1.16),
          borderRadius: "50%",
          background: `linear-gradient(90deg, transparent 0%, ${SNOW_BLUE}bb 70%)`,
          filter: "blur(2px)",
        }}
      />
      <motion.div
        animate={peeked && !reduce ? { scale: [1, 1.12, 1] } : { scale: 1 }}
        transition={peeked && !reduce ? { duration: 0.5 } : { duration: 0.2 }}
        title={stop.label}
        style={{
          position: "relative",
          display: "grid",
          placeItems: "center",
          width: size,
          height: size,
          borderRadius: "48% 52% 44% 56% / 56% 46% 54% 44%",
          border: `2px solid ${border}`,
          background: bg,
          boxShadow: read
            ? `0 0 18px ${SUN_GOLD}88`
            : peeked
              ? `0 0 18px ${BAD_RED}99`
              : "0 8px 18px -12px rgba(8,16,34,0.9)",
          animation: now && !reduce ? "tplNow 1.7s ease-in-out infinite" : undefined,
          transition: "border-color 300ms ease, background 300ms ease, box-shadow 300ms ease",
        }}
      >
        <PixIcon emoji={peeked ? "👀" : read ? "✨" : stop.icon} size={Math.round(size * 0.56)} />
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The choices                                                        */
/* ------------------------------------------------------------------ */

/**
 * One move the child could make on this stretch. Every tile wears the same
 * paint, the same size and the same chrome, so the row never hints at the
 * ranger's move. A tile only changes once the child has committed to it and
 * heard why.
 */
function MoveTile({
  option,
  order,
  tint,
  reduce,
  held,
  marked,
  onPick,
}: {
  option: TrailOption;
  /** Position in the row: drives which side it drifts in from. */
  order: number;
  tint: string;
  reduce: boolean;
  /** Sarah is speaking, or the trail is already read: not tappable right now. */
  held: boolean;
  /** Already tapped on this stretch and taught: out of the running. */
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
            : "linear-gradient(180deg, rgba(28,42,74,0.95) 0%, rgba(14,22,44,0.96) 100%)",
          color: marked ? "#ffd2d2" : "#eef6ff",
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

/* ------------------------------------------------------------------ */
/* The hero                                                           */
/* ------------------------------------------------------------------ */

/**
 * The Cyber Hero in a snow coat, walking their own trail back with the low sun
 * behind them. Nothing about the figure is judged: it simply stands on the
 * stretch being read.
 */
function RangerKid({ height, reduce }: { height: number; reduce: boolean }) {
  const width = Math.round((height * 62) / 92);
  return (
    <motion.svg
      width={width}
      height={height}
      viewBox="0 0 62 92"
      aria-hidden
      animate={reduce ? undefined : { y: [0, -1.5, 0] }}
      transition={reduce ? undefined : { repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
      style={{ display: "block", overflow: "visible", filter: "drop-shadow(0 6px 8px rgba(40,70,120,0.45))" }}
    >
      {/* the long shadow the low sun throws to the left */}
      <ellipse cx={14} cy={88} rx={26} ry={4.5} fill="rgba(120,152,198,0.55)" />
      {/* boots + snow trousers */}
      <rect x={20} y={62} width={9} height={22} rx={4.5} fill="#28457a" />
      <rect x={33} y={62} width={9} height={22} rx={4.5} fill="#28457a" />
      <ellipse cx={24} cy={86} rx={7} ry={4} fill="#1b2b48" />
      <ellipse cx={37} cy={86} rx={7} ry={4} fill="#1b2b48" />
      {/* coat */}
      <rect x={17} y={36} width={28} height={32} rx={12} fill="#39b8d8" />
      <rect x={17} y={54} width={28} height={7} rx={3.5} fill="#2b93b0" />
      {/* arms */}
      <path d="M20 44 C13 50 11 58 13 64" fill="none" stroke="#39b8d8" strokeWidth={8} strokeLinecap="round" />
      <path d="M42 44 C49 50 51 58 49 64" fill="none" stroke="#2fa6c6" strokeWidth={8} strokeLinecap="round" />
      {/* head + bobble hat */}
      <circle cx={31} cy={26} r={13} fill="#ffd9a8" />
      <path d="M18 24 A13 13 0 0 1 44 24 Z" fill="#ff8f6b" />
      <rect x={17} y={22} width={28} height={6} rx={3} fill="#ffd9d0" />
      <circle cx={31} cy={9} r={4.5} fill="#ffd9d0" />
      {/* face */}
      <circle cx={26} cy={29} r={1.9} fill="#2b2233" />
      <circle cx={36} cy={29} r={1.9} fill="#2b2233" />
      <path d="M26 35 Q31 39 36 35" fill="none" stroke="#2b2233" strokeWidth={2} strokeLinecap="round" />
      {/* scarf */}
      <path d="M21 38 Q31 44 41 38" fill="none" stroke="#ffd166" strokeWidth={5} strokeLinecap="round" />
    </motion.svg>
  );
}
