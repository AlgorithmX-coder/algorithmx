"use client";

/**
 * DontFeedTheFire — Week 5 (Cyberbullying) signature exercise.
 *
 * A cozy campfire scene. Mean-message "sparks" land beside the fire one at
 * a time, each with a big jiggling red REPLY button begging to be tapped.
 * The hero move is RESTRAINT: press and HOLD the cool blue river stone and
 * the spark visibly starves (shrinks + dims over ~2.2s) and fizzles to ash.
 * Releasing early lets it re-inflate a little, never fully reset, so the
 * drill is forgiving. Tapping REPLY flares the flame and teaches ("your
 * reply is firewood") with no score loss. The final beat INVERTS the verb:
 * a friend is being picked on, and the right move is to TAP the green
 * STAND UP button. Win = every spark starved + 1 friend supported.
 *
 * Content is data-driven (sparks, the friend round, the three teach panels
 * and every beat's copy are props); the defaults below keep the legacy
 * signature mount unchanged. Visuals: react + framer-motion + ExerciseFrame
 * + PixIcon + inline SVG.
 *
 * Learn-Loop wiring: the Raccoon's boast folds into the shared intro
 * (`threat`), Sarah speaks the how-to once as the campfire appears
 * (`coachLines`) and reads each spark aloud as it lands (audio-only,
 * `recordedOnly`, the stone and REPLY held while she speaks), a starved
 * spark gets a spoken verdict with its reason ("That's right!" + `why` via
 * the shared VerdictVoice, the ash puff playing under her voice), STAND UP
 * likewise, the REPLY / stone-on-friend teaches speak through
 * WrongAnswerPanel, and the complete beat speaks the payoff
 * (`completeNarration`). Press-and-hold is the only input on a spark; STAND
 * UP is a plain tap; nothing drags.
 *
 * SKINS. `skin="campfire"` (the default) is the shipped Week 5 board, byte
 * for byte. `skin="signal"` repaints the same mechanic for Week 11's
 * lighthouse coast as "Starve the Signal": the campfire becomes a rogue
 * transmitter out on the dark water, sparks become incoming pings, a reply
 * is the POWER that keeps their signal strong, and the blue river stone
 * becomes the lighthouse desk's brass QUIET DIAL. Hold the dial and the
 * signal fades to silence; the friend beat inverts to SEND HELP. Nothing on
 * the signal board is frightening and nothing blames the child.
 */

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import {
  motion,
  AnimatePresence,
  useAnimationControls,
  useReducedMotion,
} from "framer-motion";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import ExerciseIntroBeat, { ExerciseCompleteBeat } from "@/app/components/lesson/ExerciseBeats";
import WrongAnswerPanel from "@/app/components/lesson/WrongAnswerPanel";
import PixIcon from "@/app/components/lesson/PixIcon";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import { useVerdictVoice } from "@/app/components/lesson/VerdictVoice";
import { useGameAudio } from "@/app/lib/gameEngine/useGameAudio";
import { isAudioMuted, subscribeAudioMute } from "@/app/lib/audioMute";
import { SPOKEN_GATE_MAX_MS } from "@/app/lib/gameEngine/spokenGate";

// Audio-only narration: Sarah's voice with no visible narration box (the text
// she reads is already on screen), same recipe as ClueStamper.
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

/** Which world the board is painted in. "campfire" = the shipped Week 5 look. */
export type FireSkin = "campfire" | "signal";

export interface FireSpark {
  id: string;
  from: string;
  text: string;
  /** Sarah's read-aloud as the spark lands (audio only). */
  readAloud?: string;
  /** Sarah's reason on the spoken verdict ("That's right!" + why). */
  why?: string;
}

export interface FireTeach {
  title: string;
  body: string;
  tip: string;
}

export interface DontFeedTheFireProps {
  onComplete: () => void;
  /** Spoken intro (the signature registry passes this as `narration`). */
  narration?: { speaker?: "adam" | "layla"; lines: string[] };
  accent?: string;
  /** World paint + board wording. Default "campfire" = the shipped Week 5 board. */
  skin?: FireSkin;
  /** The child the last round is about. Default: the skin's friend ("Maya" on campfire). */
  friendName?: string;
  /** The kind message that slots in when the child stands up. Default: the skin's line. */
  friendSupportLine?: string;
  /** The mean sparks, in order. Default: the three legacy sparks. */
  sparks?: FireSpark[];
  /** The final "a friend is picked on" round. Default: the legacy round. */
  friendRound?: FireSpark;
  /** Teach panels (WrongAnswerPanel): REPLY on a spark / REPLY on the friend / the stone on the friend. */
  teachSpark?: FireTeach;
  teachFriend?: FireTeach;
  teachStoneOnFriend?: FireTeach;
  introTitle?: string;
  introSubtitle?: string;
  introIcon?: string;
  /** Optional "Spot the Danger" Raccoon preamble folded into the intro. */
  threat?: { raccoonLine: string };
  /** Optional spoken payoff on the complete screen. */
  completeNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  completeTitle?: string;
  completeLine?: string;
  /** The how-to, spoken once as the campfire appears (audio only). */
  coachLines?: { speaker?: "adam" | "layla"; lines: string[] };
}

/* ------------------------------------------------------------------ */
/* Default content (the legacy signature mount)                       */
/* ------------------------------------------------------------------ */

const SPARKS: FireSpark[] = [
  {
    id: "spark-1",
    from: "grumbler_77",
    text: "You're the WORST at this game!",
  },
  {
    id: "spark-2",
    from: "anon_kid",
    text: "Nobody wants you on this team.",
  },
  {
    id: "spark-3",
    from: "mega_meanie",
    text: "That was SO silly. Just log off!",
  },
];

const FRIEND_ROUND: FireSpark = {
  id: "friend-1",
  from: "loud_larry",
  text: "Look at Maya's drawing. It's SO bad! Everyone laugh at her!",
};

const TEACH_SPARK: FireTeach = {
  title: "Whoa! That's firewood!",
  body: "Your reply is firewood. It makes the fire bigger. A hero starves it.",
  tip: "Press and HOLD the blue river stone instead. No firewood, no fire.",
};

const TEACH_FRIEND: FireTeach = {
  title: "Mean words back are still firewood!",
  body: "Firing back at the bully feeds the fire, even for a friend.",
  tip: "Stand up the kind way. Tap the green STAND UP button.",
};

const TEACH_STONE_ON_FRIEND: FireTeach = {
  title: "This spark isn't aimed at you!",
  body: "Maya needs you. Staying quiet leaves a friend all alone.",
  tip: "Tap the green STAND UP button to help her and tell a grown-up.",
};

const DEFAULT_INTRO_SUBTITLE =
  "Mean messages are sparks. A reply is firewood, it makes the fire bigger. Press and HOLD the cool river stone to starve each spark until it fizzles out.";
const DEFAULT_COMPLETE_LINE =
  "No firewood, no fire. And when a friend is picked on, heroes stand up and tell a grown-up.";

const DEFAULT_FRIEND_NAME = "Maya";
const DEFAULT_FRIEND_SUPPORT_LINE =
  "Maya's drawing is awesome! Be kind. I'm telling a grown-up too.";

/* ------------------------------------------------------------------ */
/* Default content for the "signal" skin (Week 11, the lighthouse)     */
/* ------------------------------------------------------------------ */

const SIGNAL_PINGS: FireSpark[] = [
  {
    id: "ping-1",
    from: "grumble_gull",
    text: "You're rubbish at this game. Answer me!",
  },
  {
    id: "ping-2",
    from: "no_name_caller",
    text: "Nobody on this coast wants you around.",
  },
  {
    id: "ping-3",
    from: "buzz_bother",
    text: "Say something back. I'm waiting!",
  },
];

const SIGNAL_FRIEND_ROUND: FireSpark = {
  id: "friend-ping",
  from: "loudhailer_lou",
  text: "Look at Priya's painting. It's SO wobbly! Everyone laugh at her!",
};

const SIGNAL_TEACH_PING: FireTeach = {
  title: "Whoa! That's power!",
  body: "Every reply you send is power for their signal. It makes it stronger. A hero starves it.",
  tip: "Press and HOLD the brass quiet dial instead. No power, no signal.",
};

const SIGNAL_TEACH_FRIEND: FireTeach = {
  title: "Pinging back is still power!",
  body: "Sending mean words back keeps their signal strong, even for a friend.",
  tip: "Help the kind way. Tap the green SEND HELP button.",
};

const SIGNAL_TEACH_DIAL_ON_FRIEND: FireTeach = {
  title: "This ping isn't aimed at you!",
  body: "A friend out there needs you. Staying quiet leaves them all alone.",
  tip: "Tap the green SEND HELP button to help her and tell a grown-up.",
};

const SIGNAL_INTRO_SUBTITLE =
  "Mean messages are pings. Every reply is power, it keeps their signal strong. Press and HOLD the brass quiet dial to starve each ping until the signal fades out.";
const SIGNAL_COMPLETE_LINE =
  "No power, no signal. And when a friend is getting pinged, heroes send help and tell a grown-up.";
const SIGNAL_FRIEND_NAME = "Priya";
const SIGNAL_FRIEND_SUPPORT_LINE =
  "Priya's painting is brilliant! Be kind. I'm telling a grown-up too.";

/* ------------------------------------------------------------------ */
/* Board wording per skin (the campfire column is today's copy)        */
/* ------------------------------------------------------------------ */

interface FireSkinCopy {
  headerSub: string; // line under the title while pings/sparks are landing
  friendHeaderSub: string; // the same line on the friend round
  friendHeaderStood: (name: string) => string; // ...once the child has helped
  capHolding: string; // caption while the dial/stone is held
  capIdle: string; // caption prompting the hold
  capAsh: string; // caption after the item is starved
  capFriend: (name: string) => string; // caption on the friend round
  capStood: string; // caption after standing up / sending help
  cardStarving: string; // status under the card while it drains
  cardRelapse: string; // ...after an early release
  cardNew: string; // ...when the card first lands
  puffTitle: string; // the "it's gone" puff headline
  puffLine: string; // ...and its one-line reason
  friendSad: string; // how the friend is doing before help
  friendGlad: string; // ...and after
  msgEmoji: string; // PixIcon on a message card
  replyLabel: string; // the tempting wrong button
  replySub: string;
  replyAria: string;
  holdLabel: string; // the hold control (river stone / quiet dial)
  holdSub: string;
  holdCaption: string;
  holdAria: string;
  smallHoldAria: string; // the small hold control on the friend round
  standLabel: string; // the right move on the friend round
  standSub: (name: string) => string;
  standAria: string;
  statNoun: string; // "3 sparks starved" / "3 pings faded"
  statVerb: string;
}

const SKIN_COPY: Record<FireSkin, FireSkinCopy> = {
  campfire: {
    headerSub: "Mean messages are sparks. Don't give them firewood.",
    friendHeaderSub: "A friend needs you. This one is different!",
    friendHeaderStood: (name) => `You stood up for ${name}!`,
    capHolding: "Keep holding... the spark is starving!",
    capIdle: "Press and HOLD the river stone. Starve the spark.",
    capAsh: "The spark fizzled out. No firewood, no fire!",
    capFriend: (name) => `${name} is being picked on. What does a hero do?`,
    capStood: "Kind words + telling a grown-up. That's hero strength!",
    cardStarving: "Starving the spark...",
    cardRelapse: "It's coming back a little! Hold again!",
    cardNew: "A mean spark landed!",
    puffTitle: "Fzzz... spark starved!",
    puffLine: "No reply, no firewood, no fire.",
    friendSad: "feels very small right now...",
    friendGlad: "is beaming. You've got her back!",
    msgEmoji: "💬",
    replyLabel: "REPLY!",
    replySub: "SAY IT BACK!",
    replyAria: "Reply to the mean message",
    holdLabel: "HOLD",
    holdSub: "RIVER STONE",
    holdCaption: "Stay cool",
    holdAria: "Hold the river stone to starve the spark",
    smallHoldAria: "Hold the river stone",
    standLabel: "STAND UP",
    standSub: (name) => `HELP ${name.toUpperCase()} + TELL A GROWN-UP`,
    standAria: "Stand up for your friend",
    statNoun: "spark",
    statVerb: "starved",
  },
  signal: {
    headerSub: "Mean messages are pings. Don't give their signal power.",
    friendHeaderSub: "A friend is getting pinged. This one is different!",
    friendHeaderStood: (name) => `You sent help to ${name}!`,
    capHolding: "Keep holding... the signal is fading!",
    capIdle: "Press and HOLD the quiet dial. Starve the ping.",
    capAsh: "The ping faded to silence. No power, no signal!",
    capFriend: (name) => `${name} is getting mean pings. What does a hero do?`,
    capStood: "Help sent + a grown-up told. That's hero strength!",
    cardStarving: "Starving the signal...",
    cardRelapse: "It's climbing back a little! Hold again!",
    cardNew: "A mean ping came in!",
    puffTitle: "Shhh... signal starved!",
    puffLine: "No reply, no power, no signal.",
    friendSad: "is feeling very small out there...",
    friendGlad: "is beaming. Help is on the way!",
    msgEmoji: "📣",
    replyLabel: "PING BACK!",
    replySub: "SEND IT BACK!",
    replyAria: "Reply to the mean ping",
    holdLabel: "HOLD",
    holdSub: "QUIET DIAL",
    holdCaption: "Stay calm",
    holdAria: "Hold the quiet dial to starve the ping",
    smallHoldAria: "Hold the quiet dial",
    standLabel: "SEND HELP",
    standSub: (name) => `HELP ${name.toUpperCase()} + TELL A GROWN-UP`,
    standAria: "Send help to your friend",
    statNoun: "ping",
    statVerb: "faded",
  },
};

/* Timing (ms) */
const HOLD_MS = 2200; // full hold to starve a spark
const DECAY_MS = 2600; // re-inflate speed after releasing early
const REINFLATE = 0.16; // how much progress a release can give back, max
const ASH_MS = 1350; // the ash puff stays at least this long before the next beat

/* Palette */
const EMBER = "#ff9d4d";
const EMBER_DEEP = "#ff7a2e";
const STONE_BLUE = "#7dd3fc";
const GOOD_GREEN = "#34d399";
const BAD_RED = "#ff5d5d";

/* Palette for the "signal" skin: a violet rogue transmitter, brass dial */
const WAVE = "#c4b5fd";
const WAVE_DEEP = "#8b5cf6";
const DIAL_BRASS = "#fbbf24";

type Phase = "intro" | "play" | "friend" | "celebrate";
type SparkState = "burning" | "ash";

// "read" is only ever entered for an item that has something to read, so the
// spoken gate can never wait on a clip that does not exist (mute-aware).
const readOrIdle = (text?: string): "read" | "idle" => (!isAudioMuted() && text ? "read" : "idle");

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export default function DontFeedTheFire({
  onComplete,
  narration,
  accent,
  skin = "campfire",
  sparks = skin === "signal" ? SIGNAL_PINGS : SPARKS,
  friendRound = skin === "signal" ? SIGNAL_FRIEND_ROUND : FRIEND_ROUND,
  teachSpark = skin === "signal" ? SIGNAL_TEACH_PING : TEACH_SPARK,
  teachFriend = skin === "signal" ? SIGNAL_TEACH_FRIEND : TEACH_FRIEND,
  teachStoneOnFriend = skin === "signal" ? SIGNAL_TEACH_DIAL_ON_FRIEND : TEACH_STONE_ON_FRIEND,
  introTitle = skin === "signal" ? "Starve the Signal" : "Don't Feed the Fire",
  introSubtitle = skin === "signal" ? SIGNAL_INTRO_SUBTITLE : DEFAULT_INTRO_SUBTITLE,
  introIcon = skin === "signal" ? "🔔" : "⚡",
  threat,
  completeNarration,
  completeTitle = skin === "signal" ? "The signal faded out!" : "The fire went out!",
  completeLine = skin === "signal" ? SIGNAL_COMPLETE_LINE : DEFAULT_COMPLETE_LINE,
  friendName = skin === "signal" ? SIGNAL_FRIEND_NAME : DEFAULT_FRIEND_NAME,
  friendSupportLine = skin === "signal" ? SIGNAL_FRIEND_SUPPORT_LINE : DEFAULT_FRIEND_SUPPORT_LINE,
  coachLines,
}: DontFeedTheFireProps) {
  // Every board string for this skin; the campfire column is the shipped copy.
  const t = SKIN_COPY[skin];
  const reduce = !!useReducedMotion();
  const audio = useGameAudio();
  // Both content voices are Sarah; in-game read-alouds and verdict reasons are
  // recorded under "adam", so every manifest lookup here uses that key.
  const voice = "adam" as const;

  const [phase, setPhase] = useState<Phase>("intro");
  const [sparkIdx, setSparkIdx] = useState(0);
  const [sparkState, setSparkState] = useState<SparkState>("burning");
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const [teach, setTeach] = useState<null | FireTeach>(null);
  const [stood, setStood] = useState(false);
  const [starvedCount, setStarvedCount] = useState(0);
  // Read-aloud chain: the how-to once as the campfire appears, then each
  // spark (and the friend round) as it lands. The stone and REPLY are held
  // while she speaks. "idle" = nothing playing.
  const [narr, setNarr] = useState<"howto" | "read" | "idle">("idle");

  const holdingRef = useRef(false);
  const teachOpenRef = useRef(false);
  const progressRef = useRef(0);
  const floorRef = useRef(0); // decay never drops below this
  const completedRef = useRef(false);
  const timersRef = useRef<number[]>([]);
  const ashAtRef = useRef(0);
  const stoodAtRef = useRef(0);

  const later = (fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  };
  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  const flameControls = useAnimationControls();
  const sceneControls = useAnimationControls();

  teachOpenRef.current = teach !== null;

  // Spoken verdicts: Sarah says "That's right!" + why when a spark starves and
  // when the child stands up; the next beat waits for her. The REPLY and
  // stone-on-friend teaches speak through WrongAnswerPanel.
  const verdict = useVerdictVoice(voice);
  const speaking = narr !== "idle" || verdict.speaking || !!teach;

  // Safety releases for the spoken gate (never leave the campfire held).
  useEffect(() => {
    if (narr === "idle") return;
    const id = window.setTimeout(() => setNarr("idle"), SPOKEN_GATE_MAX_MS);
    return () => window.clearTimeout(id);
  }, [narr]);
  useEffect(() => subscribeAudioMute((muted) => { if (muted) setNarr("idle"); }), []);

  /* ---------------- derived ---------------- */

  const calm = stood || phase === "celebrate";
  const spark = sparks[Math.min(sparkIdx, sparks.length - 1)];
  const flameSettle = 1 - starvedCount * 0.07; // fire calms as sparks starve
  // What Sarah reads for the current item (a burning spark, or the friend round).
  const currentRead =
    phase === "friend" ? friendRound.readAloud : phase === "play" && sparkState === "burning" ? spark?.readAloud : undefined;
  const currentReadId = phase === "friend" ? friendRound.id : spark?.id ?? "none";

  /* ---------------- beats ---------------- */

  const start = () => {
    setPhase("play");
    setNarr(isAudioMuted() ? "idle" : coachLines ? "howto" : readOrIdle(sparks[0]?.readAloud));
  };

  const advanceToNextSpark = () => {
    progressRef.current = 0;
    floorRef.current = 0;
    setProgress(0);
    if (sparkIdx >= sparks.length - 1) {
      setPhase("friend");
      setNarr(readOrIdle(friendRound.readAloud));
    } else {
      const next = sparks[sparkIdx + 1];
      setSparkIdx((i) => i + 1);
      setSparkState("burning");
      setNarr(readOrIdle(next?.readAloud));
    }
  };

  /* ---------------- hold-to-starve loop ---------------- */

  useEffect(() => {
    if (phase !== "play" || sparkState !== "burning") return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(now - last, 50);
      last = now;
      let p = progressRef.current;
      if (holdingRef.current && !teachOpenRef.current) {
        p = Math.min(1, p + dt / HOLD_MS);
        // A release may re-inflate the spark a little, but never past this floor.
        floorRef.current = Math.max(floorRef.current, Math.max(0, p - REINFLATE));
      } else if (p > floorRef.current) {
        p = Math.max(floorRef.current, p - dt / DECAY_MS);
      }
      if (p !== progressRef.current) {
        progressRef.current = p;
        setProgress(p);
      }
      if (p >= 1) {
        // Spark starved: fizzle to ash while Sarah says why, then the next beat.
        holdingRef.current = false;
        setHolding(false);
        audio.correct();
        setSparkState("ash");
        setStarvedCount((n) => n + 1);
        ashAtRef.current = performance.now();
        // The ash puff keeps its legacy minimum on screen even when the verdict
        // is instant (muted / nothing recorded); otherwise it waits for her.
        verdict.say("right", sparks[sparkIdx]?.why ?? null, () => {
          const wait = Math.max(0, ASH_MS - (performance.now() - ashAtRef.current));
          later(advanceToNextSpark, wait);
        });
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, sparkState, sparkIdx]);

  /* ---------------- interactions ---------------- */

  const startHold = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (phase !== "play" || sparkState !== "burning" || speaking) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* pointer capture is best-effort */
    }
    audio.tap();
    holdingRef.current = true;
    setHolding(true);
  };

  const endHold = () => {
    holdingRef.current = false;
    setHolding(false);
  };

  const flareAndTeach = (lesson: FireTeach) => {
    endHold();
    if (!reduce) {
      flameControls.start({
        scale: [1, 1.32, 1.08, 1],
        transition: { duration: 0.7, times: [0, 0.25, 0.65, 1] },
      });
      sceneControls.start({
        x: [0, -7, 7, -4, 4, 0],
        transition: { duration: 0.45 },
      });
    }
    later(() => setTeach(lesson), reduce ? 60 : 430);
  };

  const tapReply = () => {
    if (speaking) return;
    audio.wrong();
    flareAndTeach(phase === "friend" ? teachFriend : teachSpark);
  };

  const tapStoneOnFriend = () => {
    if (speaking) return;
    audio.wrong();
    setTeach(teachStoneOnFriend);
  };

  const tapStandUp = () => {
    if (stood || speaking) return;
    audio.correct();
    setStood(true);
    stoodAtRef.current = performance.now();
    const reveal = reduce ? 900 : 2000;
    // Sarah: "That's right!" + why; the supportive message plays under her,
    // and the celebration waits for both her and the legacy reveal time.
    verdict.say("right", friendRound.why ?? null, () => {
      const wait = Math.max(0, reveal - (performance.now() - stoodAtRef.current));
      later(() => {
        audio.unlock();
        setPhase("celebrate");
      }, wait);
    });
  };

  const finish = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  };

  return (
    <ExerciseFrame maxWidth={780} padding={24}>
      {verdict.element}

      {/* Sarah's read-alouds (audio only): the how-to once, then each spark / the friend round as it lands. */}
      {(phase === "play" || phase === "friend") && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="dff-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent={accent ?? "#ff8e6e"} recordedOnly onDone={() => setNarr(readOrIdle(currentRead))} />
          )}
          {narr === "read" && currentRead && (
            <InfoNarration key={`dff-read-${currentReadId}`} speaker={voice} lines={[currentRead]} accent={accent ?? "#ff8e6e"} recordedOnly onDone={() => setNarr("idle")} />
          )}
        </div>
      )}

      <motion.div
        animate={sceneControls}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        {/* ---------- header ---------- */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#ffc38a",
            }}
          >
            {introTitle}
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#cfd6f6",
              marginTop: 4,
            }}
          >
            {phase === "friend"
              ? stood
                ? t.friendHeaderStood(friendName)
                : t.friendHeaderSub
              : t.headerSub}
          </div>
          <ProgressChips
            sparks={sparks}
            starved={starvedCount}
            current={phase === "play" ? sparkIdx : -1}
            friendActive={phase === "friend" || phase === "celebrate"}
            friendDone={stood}
            skin={skin}
          />
        </div>

        {/* ---------- scene ---------- */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: 26,
            minHeight: 230,
          }}
        >
          {skin === "signal" ? (
            <SignalTower
              calm={calm}
              settle={flameSettle}
              reduce={reduce}
              flameControls={flameControls}
            />
          ) : (
            <Campfire
              calm={calm}
              settle={flameSettle}
              reduce={reduce}
              flameControls={flameControls}
            />
          )}

          <div style={{ width: 300, maxWidth: "100%" }}>
            <AnimatePresence mode="wait">
              {phase === "play" && sparkState === "burning" && spark && (
                <SparkCard
                  key={spark.id}
                  from={spark.from}
                  text={spark.text}
                  progress={progress}
                  holding={holding}
                  reduce={reduce}
                  skin={skin}
                  copy={t}
                />
              )}
              {phase === "play" && sparkState === "ash" && spark && (
                <AshPuff key={`${spark.id}-ash`} reduce={reduce} skin={skin} copy={t} />
              )}
              {(phase === "friend" || phase === "celebrate") && (
                <FriendScene
                  key="friend"
                  from={friendRound.from}
                  text={friendRound.text}
                  stood={stood}
                  reduce={reduce}
                  copy={t}
                  friendName={friendName}
                  supportLine={friendSupportLine}
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ---------- controls ---------- */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: 30,
            minHeight: 150,
          }}
        >
          {(phase === "play" || (phase === "friend" && !stood)) && (
            <ReplyButton onTap={tapReply} reduce={reduce} disabled={speaking} copy={t} />
          )}

          {phase === "play" && (
            <RiverStone
              progress={progress}
              holding={holding}
              disabled={sparkState !== "burning"}
              held={speaking}
              onDown={startHold}
              onUp={endHold}
              skin={skin}
              copy={t}
            />
          )}

          {phase === "friend" && !stood && (
            <>
              <StandUpButton
                onTap={tapStandUp}
                reduce={reduce}
                disabled={speaking}
                copy={t}
                friendName={friendName}
              />
              <SmallStone onTap={tapStoneOnFriend} disabled={speaking} skin={skin} copy={t} />
            </>
          )}
        </div>

        {/* ---------- caption ---------- */}
        <div
          style={{
            textAlign: "center",
            fontSize: 13,
            fontWeight: 800,
            color: "#9fb1d8",
            minHeight: 18,
          }}
        >
          {phase === "play" &&
            sparkState === "burning" &&
            (holding ? t.capHolding : t.capIdle)}
          {phase === "play" && sparkState === "ash" && t.capAsh}
          {phase === "friend" && !stood && t.capFriend(friendName)}
          {phase === "friend" && stood && t.capStood}
        </div>
      </motion.div>

      {/* ---------- overlays ---------- */}
      {phase === "intro" && (
        <ExerciseIntroBeat
          title={introTitle}
          subtitle={introSubtitle}
          icon={introIcon}
          narration={narration}
          character={narration?.speaker}
          threat={threat}
          accent={accent}
          onDismiss={start}
        />
      )}

      {teach && (
        <WrongAnswerPanel
          title={teach.title}
          explanation={teach.body}
          tip={teach.tip}
          onContinue={() => setTeach(null)}
        />
      )}

      {phase === "celebrate" && (
        <ExerciseCompleteBeat
          title={completeTitle}
          stars={3}
          statLines={[
            `${starvedCount} ${t.statNoun}${starvedCount === 1 ? "" : "s"} ${t.statVerb}`,
            completeLine,
          ]}
          narration={completeNarration}
          onContinue={finish}
        />
      )}
    </ExerciseFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Header progress chips: one slot per spark + 1 friend heart          */
/* ------------------------------------------------------------------ */

function ProgressChips({
  sparks,
  starved,
  current,
  friendActive,
  friendDone,
  skin,
}: {
  sparks: FireSpark[];
  starved: number;
  current: number;
  friendActive: boolean;
  friendDone: boolean;
  skin: FireSkin;
}) {
  // Chip paint: ember on the campfire board, violet on the signal board.
  const tone =
    skin === "signal"
      ? { soft: "rgba(167,139,250,0.18)", ring: WAVE, glow: "rgba(167,139,250,0.5)" }
      : { soft: "rgba(255,157,77,0.18)", ring: EMBER, glow: "rgba(255,157,77,0.5)" };
  const chip = (active: boolean, done: boolean, key: string, kind: "flame" | "heart") => (
    <span
      key={key}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 34,
        height: 34,
        borderRadius: 12,
        background: done
          ? kind === "heart"
            ? "rgba(52,211,153,0.2)"
            : "rgba(255,255,255,0.08)"
          : active
          ? kind === "heart"
            ? "rgba(52,211,153,0.16)"
            : tone.soft
          : "rgba(255,255,255,0.05)",
        border: `2px solid ${
          done
            ? kind === "heart"
              ? GOOD_GREEN
              : "rgba(255,255,255,0.3)"
            : active
            ? kind === "heart"
              ? GOOD_GREEN
              : tone.ring
            : "rgba(255,255,255,0.14)"
        }`,
        boxShadow: active
          ? `0 0 14px ${kind === "heart" ? "rgba(52,211,153,0.5)" : tone.glow}`
          : undefined,
        opacity: active || done ? 1 : 0.55,
      }}
    >
      {kind === "flame" ? (
        done ? (
          <CheckIcon size={16} color="#a7f3d0" />
        ) : skin === "signal" ? (
          <WaveGlyph size={18} dim={!active} />
        ) : (
          <FlameGlyph size={18} dim={!active} />
        )
      ) : done ? (
        <CheckIcon size={16} color="#a7f3d0" />
      ) : (
        <HeartGlyph size={16} active={active} />
      )}
    </span>
  );

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: 8,
        marginTop: 10,
      }}
    >
      {sparks.map((s, i) => chip(i === current, i < starved, s.id, "flame"))}
      {chip(friendActive && !friendDone, friendDone, "friend-chip", "heart")}
    </div>
  );
}

function FlameGlyph({ size, dim }: { size: number; dim?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 2 C15 7 19 10 19 15 A7 7 0 0 1 5 15 C5 10 9 7 12 2 Z"
        fill={dim ? "rgba(255,157,77,0.4)" : EMBER}
      />
      <path
        d="M12 9 C13.6 11.5 15.5 13 15.5 15.6 A3.5 3.5 0 0 1 8.5 15.6 C8.5 13 10.4 11.5 12 9 Z"
        fill={dim ? "rgba(255,226,122,0.4)" : "#ffe27a"}
      />
    </svg>
  );
}

/** The signal skin's stand-in for a flame: a little transmitter throwing arcs. */
function WaveGlyph({ size, dim }: { size: number; dim?: boolean }) {
  const near = dim ? "rgba(196,181,253,0.4)" : WAVE;
  const far = dim ? "rgba(139,92,246,0.4)" : WAVE_DEEP;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <circle cx={12} cy={18.4} r={2.6} fill={near} />
      <path
        d="M7.4 15 A6.5 6.5 0 0 1 16.6 15"
        fill="none"
        stroke={near}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
      <path
        d="M4.6 11.4 A10.5 10.5 0 0 1 19.4 11.4"
        fill="none"
        stroke={far}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
      <path
        d="M2.4 8 A14.2 14.2 0 0 1 21.6 8"
        fill="none"
        stroke={far}
        strokeWidth={2}
        strokeLinecap="round"
        opacity={0.75}
      />
    </svg>
  );
}

function HeartGlyph({ size, active }: { size: number; active?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 21 C7 16.5 3 13.4 3 9.2 A4.6 4.6 0 0 1 12 7.6 A4.6 4.6 0 0 1 21 9.2 C21 13.4 17 16.5 12 21 Z"
        fill={active ? GOOD_GREEN : "rgba(52,211,153,0.45)"}
      />
    </svg>
  );
}

function CheckIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M4 12.5 L9.5 18 L20 6.5"
        fill="none"
        stroke={color}
        strokeWidth={3.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Campfire (inline SVG, warm flicker, green when calm)               */
/* ------------------------------------------------------------------ */

function Campfire({
  calm,
  settle,
  reduce,
  flameControls,
}: {
  calm: boolean;
  settle: number;
  reduce: boolean;
  flameControls: ReturnType<typeof useAnimationControls>;
}) {
  const flicker = (dur: number, amt: number) =>
    reduce
      ? {}
      : {
          animate: {
            scaleY: [1, 1 + amt, 1 - amt * 0.6, 1 + amt * 0.5, 1],
            scaleX: [1, 1 - amt * 0.5, 1 + amt * 0.4, 1, 1],
          },
          transition: { repeat: Infinity, duration: dur, ease: "easeInOut" as const },
        };

  const originBottom: CSSProperties = {
    transformBox: "fill-box",
    transformOrigin: "50% 100%",
  };

  return (
    <div style={{ position: "relative", width: 230, height: 220 }}>
      {/* warm ground glow */}
      <motion.div
        animate={
          reduce
            ? { opacity: calm ? 0.85 : 0.7 }
            : { opacity: calm ? [0.8, 0.95, 0.8] : [0.55, 0.8, 0.55] }
        }
        transition={reduce ? undefined : { repeat: Infinity, duration: 2.6, ease: "easeInOut" }}
        style={{
          position: "absolute",
          left: "50%",
          bottom: 0,
          transform: "translateX(-50%)",
          width: 260,
          height: 170,
          borderRadius: "50%",
          background: calm
            ? "radial-gradient(ellipse at 50% 80%, rgba(52,211,153,0.4) 0%, transparent 68%)"
            : "radial-gradient(ellipse at 50% 80%, rgba(255,157,77,0.42) 0%, transparent 68%)",
          filter: "blur(10px)",
          transition: "background 900ms ease",
          pointerEvents: "none",
        }}
      />

      {/* rising ember dots */}
      {!reduce &&
        [0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={{ y: [-4, -78], opacity: [0, 1, 0], x: [0, i % 2 === 0 ? 10 : -12] }}
            transition={{
              repeat: Infinity,
              duration: 2.4 + i * 0.5,
              delay: i * 0.7,
              ease: "easeOut",
            }}
            style={{
              position: "absolute",
              left: `${44 + i * 6}%`,
              bottom: 120,
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: calm ? "#7dffb0" : "#ffcf7a",
              transition: "background 900ms ease",
              pointerEvents: "none",
            }}
          />
        ))}

      <svg viewBox="0 0 200 200" width="100%" height="100%" aria-hidden>
        {/* base scale settles as sparks starve; inner group takes the flare */}
        <motion.g animate={{ scale: settle }} style={originBottom}>
          <motion.g animate={flameControls} style={originBottom}>
            {/* warm flames */}
            <motion.g
              animate={{ opacity: calm ? 0 : 1 }}
              transition={{ duration: 0.9 }}
              style={originBottom}
            >
              <motion.path
                d="M100 34 C126 72 148 98 148 128 C148 158 127 176 100 176 C73 176 52 158 52 128 C52 98 74 72 100 34 Z"
                fill={EMBER_DEEP}
                style={originBottom}
                {...flicker(2.1, 0.05)}
              />
              <motion.path
                d="M100 66 C118 92 132 108 132 130 C132 152 118 165 100 165 C82 165 68 152 68 130 C68 108 82 92 100 66 Z"
                fill="#ffb13d"
                style={originBottom}
                {...flicker(1.7, 0.07)}
              />
              <motion.path
                d="M100 96 C110 112 118 122 118 136 C118 150 110 158 100 158 C90 158 82 150 82 136 C82 122 90 112 100 96 Z"
                fill="#ffe27a"
                style={originBottom}
                {...flicker(1.3, 0.09)}
              />
            </motion.g>
            {/* calm green flames (crossfade in on the win beat) */}
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: calm ? 1 : 0 }}
              transition={{ duration: 0.9 }}
              style={originBottom}
            >
              <motion.path
                d="M100 34 C126 72 148 98 148 128 C148 158 127 176 100 176 C73 176 52 158 52 128 C52 98 74 72 100 34 Z"
                fill="#2fbf7f"
                style={originBottom}
                {...flicker(2.3, 0.04)}
              />
              <motion.path
                d="M100 66 C118 92 132 108 132 130 C132 152 118 165 100 165 C82 165 68 152 68 130 C68 108 82 92 100 66 Z"
                fill="#7dffb0"
                style={originBottom}
                {...flicker(1.9, 0.05)}
              />
              <motion.path
                d="M100 96 C110 112 118 122 118 136 C118 150 110 158 100 158 C90 158 82 150 82 136 C82 122 90 112 100 96 Z"
                fill="#d9ffe8"
                style={originBottom}
                {...flicker(1.5, 0.06)}
              />
            </motion.g>
          </motion.g>
        </motion.g>

        {/* logs */}
        <g>
          <rect
            x={38}
            y={158}
            width={124}
            height={17}
            rx={8.5}
            fill="#7a4a21"
            transform="rotate(-9 100 166)"
          />
          <rect
            x={38}
            y={158}
            width={124}
            height={17}
            rx={8.5}
            fill="#8f5827"
            transform="rotate(9 100 166)"
          />
          <rect
            x={30}
            y={170}
            width={140}
            height={15}
            rx={7.5}
            fill="#6b3f1c"
          />
        </g>
        {/* ring of stones */}
        {[22, 52, 148, 178].map((x, i) => (
          <ellipse
            key={i}
            cx={x}
            cy={188}
            rx={13}
            ry={8}
            fill={i % 2 === 0 ? "#5b6478" : "#6d7790"}
          />
        ))}
        <ellipse cx={86} cy={193} rx={14} ry={7} fill="#525b6e" />
        <ellipse cx={118} cy={193} rx={13} ry={7} fill="#67718a" />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Signal tower (the "signal" skin's centrepiece): a rogue transmitter */
/* out on the dark water, its arcs shrinking as pings are starved      */
/* ------------------------------------------------------------------ */

function SignalTower({
  calm,
  settle,
  reduce,
  flameControls,
}: {
  calm: boolean;
  settle: number;
  reduce: boolean;
  flameControls: ReturnType<typeof useAnimationControls>;
}) {
  const originBottom: CSSProperties = {
    transformBox: "fill-box",
    transformOrigin: "50% 100%",
  };
  // Each arc breathes outward on its own beat, so the mast looks like it is
  // transmitting rather than just sitting there.
  const breathe = (dur: number, amt: number, delay: number) =>
    reduce
      ? {}
      : {
          animate: { scale: [1, 1 + amt, 1], opacity: [0.9, 1, 0.9] },
          transition: {
            repeat: Infinity,
            duration: dur,
            delay,
            ease: "easeInOut" as const,
          },
        };

  const ARCS = [
    { d: "M74 96 A26 26 0 0 1 126 96", w: 9, dur: 1.9, amt: 0.08, delay: 0 },
    { d: "M58 96 A42 42 0 0 1 142 96", w: 8, dur: 2.2, amt: 0.07, delay: 0.18 },
    { d: "M42 96 A58 58 0 0 1 158 96", w: 7, dur: 2.5, amt: 0.06, delay: 0.36 },
    { d: "M26 96 A74 74 0 0 1 174 96", w: 6, dur: 2.8, amt: 0.05, delay: 0.54 },
  ];

  return (
    <div style={{ position: "relative", width: 230, height: 220 }}>
      {/* water glow under the mast */}
      <motion.div
        animate={
          reduce
            ? { opacity: calm ? 0.85 : 0.7 }
            : { opacity: calm ? [0.8, 0.95, 0.8] : [0.55, 0.8, 0.55] }
        }
        transition={reduce ? undefined : { repeat: Infinity, duration: 2.6, ease: "easeInOut" }}
        style={{
          position: "absolute",
          left: "50%",
          bottom: 0,
          transform: "translateX(-50%)",
          width: 260,
          height: 150,
          borderRadius: "50%",
          background: calm
            ? "radial-gradient(ellipse at 50% 80%, rgba(52,211,153,0.36) 0%, transparent 68%)"
            : "radial-gradient(ellipse at 50% 80%, rgba(139,92,246,0.42) 0%, transparent 68%)",
          filter: "blur(10px)",
          transition: "background 900ms ease",
          pointerEvents: "none",
        }}
      />

      {/* outgoing ping dots */}
      {!reduce &&
        [0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={{ y: [0, -70], opacity: [0, 1, 0], x: [0, i % 2 === 0 ? 14 : -16] }}
            transition={{
              repeat: Infinity,
              duration: 2.4 + i * 0.5,
              delay: i * 0.7,
              ease: "easeOut",
            }}
            style={{
              position: "absolute",
              left: `${46 + i * 5}%`,
              bottom: 128,
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: calm ? "#7dffb0" : "#ddd0ff",
              transition: "background 900ms ease",
              pointerEvents: "none",
            }}
          />
        ))}

      <svg viewBox="0 0 200 200" width="100%" height="100%" aria-hidden>
        {/* arcs settle as pings are starved; the inner group takes the flare */}
        <motion.g animate={{ scale: settle }} style={originBottom}>
          <motion.g animate={flameControls} style={originBottom}>
            {/* transmitting arcs */}
            <motion.g animate={{ opacity: calm ? 0 : 1 }} transition={{ duration: 0.9 }}>
              {ARCS.map((a, i) => (
                <motion.path
                  key={a.d}
                  d={a.d}
                  fill="none"
                  stroke={i < 2 ? WAVE : WAVE_DEEP}
                  strokeWidth={a.w}
                  strokeLinecap="round"
                  style={originBottom}
                  {...breathe(a.dur, a.amt, a.delay)}
                />
              ))}
            </motion.g>
            {/* quiet green arcs (crossfade in on the win beat) */}
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: calm ? 1 : 0 }}
              transition={{ duration: 0.9 }}
            >
              {ARCS.slice(0, 2).map((a) => (
                <path
                  key={`calm-${a.d}`}
                  d={a.d}
                  fill="none"
                  stroke="#7dffb0"
                  strokeWidth={a.w - 2}
                  strokeLinecap="round"
                  opacity={0.8}
                />
              ))}
            </motion.g>
          </motion.g>
        </motion.g>

        {/* dish + mast */}
        <g>
          <ellipse cx={100} cy={100} rx={19} ry={7} fill="#5b6478" />
          <rect x={95} y={100} width={10} height={70} rx={5} fill="#6d7790" />
          <rect x={80} y={126} width={40} height={7} rx={3.5} fill="#525b6e" />
          <rect x={86} y={146} width={28} height={6} rx={3} fill="#525b6e" />
          <motion.circle
            cx={100}
            cy={96}
            r={7}
            fill={calm ? "#7dffb0" : WAVE}
            animate={reduce ? undefined : { opacity: [0.7, 1, 0.7] }}
            transition={reduce ? undefined : { repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            style={{ transition: "fill 900ms ease" }}
          />
        </g>

        {/* buoy hull + night water */}
        <path d="M74 170 L126 170 L116 186 L84 186 Z" fill="#3b4557" />
        <ellipse cx={100} cy={188} rx={34} ry={7} fill="#2b3444" />
        <ellipse cx={46} cy={192} rx={30} ry={6} fill="#262f3d" />
        <ellipse cx={154} cy={192} rx={30} ry={6} fill="#262f3d" />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Spark card: the mean message that starves while the stone is held  */
/* ------------------------------------------------------------------ */

function SparkCard({
  from,
  text,
  progress,
  holding,
  reduce,
  skin,
  copy,
}: {
  from: string;
  text: string;
  progress: number;
  holding: boolean;
  reduce: boolean;
  skin: FireSkin;
  copy: FireSkinCopy;
}) {
  const shrink = 1 - progress * 0.42;
  const fade = 1 - progress * 0.58;
  // Card paint: scorched-ember card on the campfire board, a violet transmission
  // card on the signal board.
  const paint =
    skin === "signal"
      ? {
          border: `2.5px solid rgba(167,139,250,${0.75 * fade + 0.2})`,
          background: "linear-gradient(180deg, rgba(49,26,94,0.92) 0%, rgba(24,14,48,0.95) 100%)",
          glowHeld: "0 0 18px -4px rgba(167,139,250,0.4)",
          glow: "0 0 30px -6px rgba(139,92,246,0.75)",
          text: "#eee6ff",
          from: "#c9b6ff",
          idleStatus: "rgba(201,182,255,0.75)",
          hold: DIAL_BRASS,
        }
      : {
          border: `2.5px solid rgba(255,125,60,${0.75 * fade + 0.2})`,
          background: "linear-gradient(180deg, rgba(90,36,10,0.92) 0%, rgba(46,18,8,0.95) 100%)",
          glowHeld: "0 0 18px -4px rgba(255,157,77,0.4)",
          glow: "0 0 30px -6px rgba(255,120,50,0.75)",
          text: "#ffe9d6",
          from: "#ffb98a",
          idleStatus: "rgba(255,185,138,0.75)",
          hold: STONE_BLUE,
        };

  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { x: 70, opacity: 0, scale: 0.8 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.25 } }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <div
        style={{
          transform: `scale(${shrink})`,
          opacity: fade,
          filter: `saturate(${1 - progress * 0.75})`,
          transformOrigin: "50% 50%",
          transition: "transform 90ms linear, opacity 90ms linear",
        }}
      >
        <div
          style={{
            position: "relative",
            padding: "14px 16px 16px",
            borderRadius: 18,
            border: paint.border,
            background: paint.background,
            boxShadow: holding ? paint.glowHeld : paint.glow,
            color: paint.text,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <PixIcon emoji={copy.msgEmoji} size={22} />
            <span
              style={{
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: "0.06em",
                color: paint.from,
              }}
            >
              {from}
            </span>
            <motion.span
              animate={
                reduce || holding
                  ? { scale: 1 }
                  : { scale: [1, 1.18, 1], rotate: [0, -6, 6, 0] }
              }
              transition={
                reduce || holding
                  ? undefined
                  : { repeat: Infinity, duration: 1.1, ease: "easeInOut" }
              }
              style={{ marginLeft: "auto", display: "inline-flex" }}
            >
              {skin === "signal" ? (
                <WaveGlyph size={22 - progress * 8} />
              ) : (
                <FlameGlyph size={22 - progress * 8} />
              )}
            </motion.span>
          </div>
          <div style={{ fontSize: 16.5, fontWeight: 800, lineHeight: 1.4 }}>
            {text}
          </div>
        </div>
      </div>

      {/* starving status under the card */}
      <div
        style={{
          textAlign: "center",
          marginTop: 10,
          fontSize: 12.5,
          fontWeight: 900,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: holding ? paint.hold : paint.idleStatus,
          minHeight: 16,
        }}
      >
        {progress > 0.03
          ? holding
            ? copy.cardStarving
            : copy.cardRelapse
          : copy.cardNew}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Ash puff shown after a spark starves                               */
/* ------------------------------------------------------------------ */

function AshPuff({
  reduce,
  skin,
  copy,
}: {
  reduce: boolean;
  skin: FireSkin;
  copy: FireSkinCopy;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 240, damping: 18 }}
      style={{ textAlign: "center" }}
    >
      {skin === "signal" ? (
        /* signal skin: the bars drop to nothing and the channel goes quiet */
        <svg viewBox="0 0 120 80" width={140} aria-hidden style={{ display: "block", margin: "0 auto" }}>
          {[
            { x: 30, h: 8 },
            { x: 48, h: 6 },
            { x: 66, h: 4 },
            { x: 84, h: 3 },
          ].map((b, i) => (
            <motion.rect
              key={b.x}
              x={b.x}
              y={64 - b.h}
              width={12}
              height={b.h}
              rx={3}
              fill="rgba(148,163,184,0.75)"
              animate={reduce ? undefined : { opacity: [0.85, 0.35, 0.85] }}
              transition={
                reduce
                  ? undefined
                  : { repeat: Infinity, duration: 2 + i * 0.3, ease: "easeInOut" }
              }
            />
          ))}
          <path
            d="M24 30 L96 30"
            stroke="rgba(148,163,184,0.5)"
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray="6 8"
          />
        </svg>
      ) : (
      <svg viewBox="0 0 120 80" width={140} aria-hidden style={{ display: "block", margin: "0 auto" }}>
        {[
          { cx: 46, cy: 52, r: 16, o: 0.8 },
          { cx: 66, cy: 44, r: 13, o: 0.65 },
          { cx: 80, cy: 56, r: 11, o: 0.55 },
          { cx: 56, cy: 62, r: 12, o: 0.7 },
        ].map((c, i) => (
          <motion.circle
            key={i}
            cx={c.cx}
            cy={c.cy}
            r={c.r}
            fill={`rgba(148,163,184,${c.o})`}
            animate={reduce ? undefined : { cy: [c.cy, c.cy - 6, c.cy] }}
            transition={
              reduce
                ? undefined
                : { repeat: Infinity, duration: 2 + i * 0.3, ease: "easeInOut" }
            }
          />
        ))}
      </svg>
      )}
      <div
        style={{
          fontSize: 15,
          fontWeight: 900,
          color: "#a7f3d0",
          marginTop: 4,
        }}
      >
        {copy.puffTitle}
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: "#9fb1d8", marginTop: 4 }}>
        {copy.puffLine}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Friend beat: Maya is picked on; STAND UP is the hero move          */
/* ------------------------------------------------------------------ */

function FriendScene({
  from,
  text,
  stood,
  reduce,
  copy,
  friendName,
  supportLine,
}: {
  from: string;
  text: string;
  stood: boolean;
  reduce: boolean;
  copy: FireSkinCopy;
  friendName: string;
  supportLine: string;
}) {
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { x: 70, opacity: 0, scale: 0.85 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", stiffness: 240, damping: 20 }}
      style={{ display: "flex", flexDirection: "column", gap: 12 }}
    >
      {/* the bully's message */}
      <div
        style={{
          padding: "12px 14px",
          borderRadius: 16,
          border: "2.5px solid rgba(255,93,93,0.65)",
          background:
            "linear-gradient(180deg, rgba(84,18,26,0.92) 0%, rgba(44,10,16,0.95) 100%)",
          color: "#ffdede",
          opacity: stood ? 0.45 : 1,
          transition: "opacity 700ms ease",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 6,
          }}
        >
          <PixIcon emoji={copy.msgEmoji} size={20} />
          <span style={{ fontSize: 12, fontWeight: 900, color: "#ff9d9d" }}>
            {from}
          </span>
        </div>
        <div style={{ fontSize: 15.5, fontWeight: 800, lineHeight: 1.4 }}>
          {text}
        </div>
      </div>

      {/* Maya */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 12px",
          borderRadius: 16,
          border: `2.5px solid ${stood ? GOOD_GREEN : "rgba(255,255,255,0.18)"}`,
          background: stood
            ? "rgba(52,211,153,0.14)"
            : "rgba(255,255,255,0.05)",
          boxShadow: stood ? "0 0 28px -6px rgba(52,211,153,0.8)" : undefined,
          transition: "all 700ms ease",
        }}
      >
        <motion.div
          animate={
            stood && !reduce
              ? { scale: [1, 1.14, 1], rotate: [0, -4, 4, 0] }
              : { scale: 1 }
          }
          transition={{ duration: 0.7 }}
          style={{ display: "inline-flex", flexShrink: 0 }}
        >
          <FriendFace beaming={stood} />
        </motion.div>
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 900,
              color: stood ? "#a7f3d0" : "#cfd6f6",
            }}
          >
            {friendName}
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "#9fb1d8" }}>
            {stood ? copy.friendGlad : copy.friendSad}
          </div>
        </div>
      </div>

      {/* your supportive message slots in */}
      <AnimatePresence>
        {stood && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { y: 22, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 280, damping: 20 }}
            style={{
              alignSelf: "flex-end",
              maxWidth: 270,
              padding: "10px 14px",
              borderRadius: "16px 4px 16px 16px",
              background: "rgba(52,211,153,0.18)",
              border: `2px solid ${GOOD_GREEN}`,
              boxShadow: "0 0 24px -4px rgba(52,211,153,0.6)",
              color: "#c9ffd9",
              fontSize: 14.5,
              fontWeight: 800,
              lineHeight: 1.4,
            }}
          >
            {supportLine}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function FriendFace({ beaming }: { beaming: boolean }) {
  return (
    <svg viewBox="0 0 80 80" width={58} height={58} aria-hidden>
      <circle cx={40} cy={42} r={30} fill="#ffd9a8" />
      {/* hair */}
      <path
        d="M12 40 C12 18 26 8 40 8 C54 8 68 18 68 40 C68 30 58 24 40 24 C22 24 12 30 12 40 Z"
        fill="#5b3a1e"
      />
      {/* eyes */}
      {beaming ? (
        <>
          <path d="M27 40 Q31 35 35 40" fill="none" stroke="#3a2a16" strokeWidth={3} strokeLinecap="round" />
          <path d="M45 40 Q49 35 53 40" fill="none" stroke="#3a2a16" strokeWidth={3} strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx={31} cy={40} r={3.2} fill="#3a2a16" />
          <circle cx={49} cy={40} r={3.2} fill="#3a2a16" />
          {/* a little tear */}
          <circle cx={31} cy={49} r={2.1} fill="#7dd3fc" />
        </>
      )}
      {/* mouth */}
      {beaming ? (
        <path
          d="M28 50 Q40 62 52 50"
          fill="none"
          stroke="#3a2a16"
          strokeWidth={3.4}
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M30 57 Q40 50 50 57"
          fill="none"
          stroke="#3a2a16"
          strokeWidth={3.2}
          strokeLinecap="round"
        />
      )}
      {/* blush */}
      <circle cx={24} cy={48} r={4} fill="rgba(255,138,120,0.45)" />
      <circle cx={56} cy={48} r={4} fill="rgba(255,138,120,0.45)" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Buttons                                                            */
/* ------------------------------------------------------------------ */

function ReplyButton({
  onTap,
  reduce,
  disabled,
  copy,
}: {
  onTap: () => void;
  reduce: boolean;
  disabled?: boolean;
  copy: FireSkinCopy;
}) {
  return (
    <motion.button
      type="button"
      onClick={onTap}
      disabled={disabled}
      aria-label={copy.replyAria}
      animate={reduce ? undefined : { rotate: [-2.5, 2.5, -2.5], scale: [1, 1.06, 1] }}
      transition={reduce ? undefined : { repeat: Infinity, duration: 0.85, ease: "easeInOut" }}
      whileTap={disabled ? undefined : { scale: 0.93 }}
      style={{
        minWidth: 156,
        minHeight: 68,
        padding: "14px 26px",
        borderRadius: 18,
        border: "3px solid #ff8a8a",
        background: `linear-gradient(180deg, ${BAD_RED} 0%, #d63031 100%)`,
        color: "#fff",
        fontSize: 21,
        fontWeight: 900,
        letterSpacing: "0.06em",
        cursor: disabled ? "wait" : "pointer",
        opacity: disabled ? 0.85 : undefined,
        fontFamily: "inherit",
        boxShadow: "0 12px 30px -10px rgba(255,93,93,0.9), 0 0 22px rgba(255,93,93,0.35)",
        touchAction: "manipulation",
      }}
    >
      {copy.replyLabel}
      <span
        style={{
          display: "block",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.12em",
          opacity: 0.85,
        }}
      >
        {copy.replySub}
      </span>
    </motion.button>
  );
}

function RiverStone({
  progress,
  holding,
  disabled,
  held,
  onDown,
  onUp,
  skin,
  copy,
}: {
  progress: number;
  holding: boolean;
  disabled: boolean;
  /** Held while Sarah speaks: still visible, not yet pressable. */
  held?: boolean;
  onDown: (e: ReactPointerEvent<HTMLButtonElement>) => void;
  onUp: () => void;
  skin: FireSkin;
  copy: FireSkinCopy;
}) {
  const R = 62;
  const C = 2 * Math.PI * R;
  // The hold control: a cool blue river stone, or the lighthouse desk's brass dial.
  const dial =
    skin === "signal"
      ? {
          main: DIAL_BRASS,
          track: "rgba(251,191,36,0.2)",
          rim: "rgba(251,191,36,0.55)",
          face: "radial-gradient(circle at 34% 28%, #ffe9a8 0%, #c98a1e 45%, #6b4708 100%)",
          label: "#fff7e0",
          glowHold: (p: number) =>
            `0 0 34px rgba(251,191,36,${0.35 + p * 0.45}), 0 10px 24px -10px rgba(0,0,0,0.6)`,
          glowIdle: "0 10px 24px -10px rgba(0,0,0,0.6), 0 0 16px rgba(251,191,36,0.25)",
        }
      : {
          main: STONE_BLUE,
          track: "rgba(125,211,252,0.2)",
          rim: "rgba(125,211,252,0.55)",
          face: "radial-gradient(circle at 34% 28%, #b6e3fa 0%, #5f8fb4 45%, #34506e 100%)",
          label: "#eaf6ff",
          glowHold: (p: number) =>
            `0 0 34px rgba(125,211,252,${0.35 + p * 0.45}), 0 10px 24px -10px rgba(0,0,0,0.6)`,
          glowIdle: "0 10px 24px -10px rgba(0,0,0,0.6), 0 0 16px rgba(125,211,252,0.25)",
        };
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ position: "relative", width: 140, height: 140, margin: "0 auto" }}>
        {/* progress ring */}
        <svg
          width={140}
          height={140}
          viewBox="0 0 140 140"
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            transform: "rotate(-90deg)",
            pointerEvents: "none",
          }}
        >
          <circle
            cx={70}
            cy={70}
            r={R}
            fill="none"
            stroke={dial.track}
            strokeWidth={9}
          />
          <circle
            cx={70}
            cy={70}
            r={R}
            fill="none"
            stroke={dial.main}
            strokeWidth={9}
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - progress)}
            style={{ transition: "stroke-dashoffset 80ms linear" }}
          />
        </svg>

        {/* the stone */}
        <motion.button
          type="button"
          aria-label={copy.holdAria}
          onPointerDown={onDown}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onLostPointerCapture={onUp}
          onContextMenu={(e) => e.preventDefault()}
          disabled={disabled || held}
          animate={{ scale: holding ? 0.94 : 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 24 }}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            // Centred with margins, NOT translate(-50%,-50%): framer-motion's
            // `scale` animation replaces the transform wholesale, which dropped
            // the centring and left the stone sitting bottom-right of its ring
            // over the STAY COOL label (seen in the Week 5 rebuild screenshots).
            marginLeft: -53,
            marginTop: -53,
            width: 106,
            height: 106,
            borderRadius: "48% 52% 50% 50% / 52% 48% 52% 48%",
            border: `3px solid ${holding ? dial.main : dial.rim}`,
            background: dial.face,
            color: dial.label,
            fontSize: 17,
            fontWeight: 900,
            letterSpacing: "0.08em",
            cursor: disabled ? "default" : held ? "wait" : "pointer",
            fontFamily: "inherit",
            boxShadow: holding ? dial.glowHold(progress) : dial.glowIdle,
            touchAction: "none",
            userSelect: "none",
            WebkitUserSelect: "none",
            WebkitTouchCallout: "none",
            opacity: disabled ? 0.5 : held ? 0.85 : 1,
          }}
        >
          {copy.holdLabel}
          <span
            style={{
              display: "block",
              fontSize: 10.5,
              fontWeight: 800,
              letterSpacing: "0.1em",
              opacity: 0.85,
            }}
          >
            {copy.holdSub}
          </span>
        </motion.button>
      </div>
      <div
        style={{
          marginTop: 6,
          fontSize: 11.5,
          fontWeight: 900,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: dial.main,
        }}
      >
        {copy.holdCaption}
      </div>
    </div>
  );
}

/** The stone in the friend round: pressing it teaches gently. */
function SmallStone({
  onTap,
  disabled,
  skin,
  copy,
}: {
  onTap: () => void;
  disabled?: boolean;
  skin: FireSkin;
  copy: FireSkinCopy;
}) {
  // Matches the big control: river stone on the campfire board, brass dial on signal.
  const small =
    skin === "signal"
      ? {
          rim: "rgba(251,191,36,0.4)",
          face: "radial-gradient(circle at 34% 28%, #f0d089 0%, #a9761c 45%, #5c3d06 100%)",
          label: "#fdf0cf",
        }
      : {
          rim: "rgba(125,211,252,0.4)",
          face: "radial-gradient(circle at 34% 28%, #9cc9e4 0%, #52799c 45%, #2d445e 100%)",
          label: "#d9eefc",
        };
  return (
    <motion.button
      type="button"
      aria-label={copy.smallHoldAria}
      onPointerDown={onTap}
      onContextMenu={(e) => e.preventDefault()}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.94 }}
      style={{
        width: 86,
        height: 86,
        borderRadius: "48% 52% 50% 50% / 52% 48% 52% 48%",
        border: `3px solid ${small.rim}`,
        background: small.face,
        color: small.label,
        fontSize: 13,
        fontWeight: 900,
        letterSpacing: "0.08em",
        cursor: disabled ? "wait" : "pointer",
        fontFamily: "inherit",
        boxShadow: "0 8px 20px -10px rgba(0,0,0,0.6)",
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
        opacity: disabled ? 0.7 : 0.85,
      }}
    >
      {copy.holdLabel}
    </motion.button>
  );
}

function StandUpButton({
  onTap,
  reduce,
  disabled,
  copy,
  friendName,
}: {
  onTap: () => void;
  reduce: boolean;
  disabled?: boolean;
  copy: FireSkinCopy;
  friendName: string;
}) {
  // Motion owns opacity here (the entrance fade), so the held look lives in `animate`.
  const idle = disabled ? 0.85 : 1;
  return (
    <motion.button
      type="button"
      onClick={onTap}
      disabled={disabled}
      aria-label={copy.standAria}
      initial={reduce ? { opacity: 0 } : { scale: 0.6, opacity: 0 }}
      animate={
        reduce
          ? { opacity: idle }
          : { scale: [1, 1.06, 1], opacity: idle }
      }
      transition={
        reduce
          ? { duration: 0.2 }
          : { scale: { repeat: Infinity, duration: 1.4, ease: "easeInOut" }, opacity: { duration: 0.3 } }
      }
      whileTap={disabled ? undefined : { scale: 0.93 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        minWidth: 190,
        minHeight: 74,
        padding: "14px 26px",
        borderRadius: 20,
        border: "3px solid #7dffb0",
        background: `linear-gradient(180deg, ${GOOD_GREEN} 0%, #0e9f6e 100%)`,
        color: "#053b2a",
        fontSize: 20,
        fontWeight: 900,
        letterSpacing: "0.05em",
        cursor: disabled ? "wait" : "pointer",
        fontFamily: "inherit",
        boxShadow: "0 14px 34px -10px rgba(52,211,153,0.95), 0 0 26px rgba(52,211,153,0.4)",
        touchAction: "manipulation",
      }}
    >
      <PixIcon emoji="💪" size={34} />
      <span style={{ textAlign: "left" }}>
        {copy.standLabel}
        <span
          style={{
            display: "block",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.1em",
          }}
        >
          {copy.standSub(friendName)}
        </span>
      </span>
    </motion.button>
  );
}
