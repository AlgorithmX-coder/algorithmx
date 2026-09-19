"use client";

/**
 * THE CALM-DOWN CONSOLE: Week 11 (Something Wrong? Emergency Protocol)
 * signature exercise, rebuilt as a data-driven, TAP-ONLY, UNTIMED concept game
 * to the Learn-Loop standard (the same conversion the Great Climb-Out got for
 * Week 10 and Flip the Box for Week 9).
 *
 * Week 11 is the SENSITIVE week, so this beat is built warmth-first: there is
 * no siren, no shaking room, no countdown, no lose state and no Hacker Raccoon
 * anywhere. Nothing here can go wrong.
 *
 * The child stands at a quiet console with a breathing ring in the middle.
 * The breath is TAP-PACED, never held (Week 10's Pause Power is the hold game,
 * and this ships one week later):
 *
 *   Tap BREATHE IN  -> the ring grows and stays full, for as long as they like.
 *   Tap BREATHE OUT -> the ring softens back down. That is one whole breath.
 *   Tap the button that is not lit -> nothing happens. The ring simply waits,
 *     and the strip says so kindly. No buzzer, no penalty, no `onWrong`.
 *
 * Around the console sit the hero's BLAME-STONES: the things a child wrongly
 * blames themselves for ("I clicked it", "I replied", "I didn't tell anyone").
 * After each completed breath the child taps one stone to lift it off; Sarah
 * says, in one take, why that one was never theirs to carry, and the hero on
 * the console stands a little taller with every stone that goes.
 *
 * When every stone is off, the console shows the week's first truth, Sarah
 * reads it, and the complete beat fires. Concept 1: it is never your fault.
 *
 * Learn-Loop wiring: no `threat` prop exists on this engine by design (this
 * beat never carries a Raccoon boast); Sarah speaks the how-to once as the
 * console appears (`coachLines`), then every stone's words as they settle in
 * (audio only, `recordedOnly`, taps held while she speaks and released by the
 * shared spoken gate); each lift speaks through VerdictVoice in one take; the
 * truth line and then the complete beat speak the payoff, and the complete beat
 * is held back until Sarah has finished (the Week 9 bug). Round 1 guides the
 * MECHANIC only: the IN button breathes and the strip says what to tap, never
 * which stone to lift. The defaults below keep the legacy signature mount
 * (`{ onComplete, narration, accent }`) playable with no content file.
 *
 * Layout: header, strip, console (hero + ring + breath buttons + stone band)
 * and hint all fit the owner's 1414x771 window (the console shrinks with the
 * window), and the stones wrap rather than scrolling sideways at 400px.
 */

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import ExerciseIntroBeat, { ExerciseCompleteBeat } from "@/app/components/lesson/ExerciseBeats";
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
// she reads are already on the strip and on the stones), the same recipe as the
// Great Climb-Out and Flip the Box.
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

export interface CalmStone {
  id: string;
  /** The heavy thought written on the stone. Sarah reads it as it settles in. */
  label: string;
  /** PixIcon emoji. */
  icon: string;
  /** Sarah's one-take reason why this one was never the child's to carry. */
  why: string;
}
export interface CalmConsoleProps {
  stones?: CalmStone[];
  breathsPerStone?: number;
  introTitle?: string; introSubtitle?: string; introIcon?: string;
  inLabel?: string;
  outLabel?: string;
  stonesLabel?: string;
  truthLine?: string;
  completeTitle?: string; completeLine?: string;
  hints?: { tier1: string; tier2: string };
  introNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  coachLines?: { speaker?: "adam" | "layla"; lines: string[] };
  completeNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  onComplete: (score: number) => void;
  onCorrect?: () => void;
  /**
   * Part of the shared engine contract and accepted for call-site
   * compatibility, but NEVER called: nothing in this beat can be wrong, and a
   * mistimed breath tap must never be reported as a child's mistake.
   */
  onWrong?: () => void;
  onHintReached?: (tier: 1 | 2 | 3) => void;
  onAnswered?: (o: { questionKey: string; selectedIndex: number; correctIndex: number; wasCorrect: boolean }) => void;
}

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

const FRAME_MAX_W = 820;
const FRAME_PAD_X = 20;
const FRAME_PAD_Y = 16;
const BOARD_GAP = 8;
const HEADER_H = 28;
const STRIP_H = 40;

/**
 * Window height that is not the console scene: lesson HUD 64 + stage padding 80
 * + frame padding 32 + header 28 + gaps 24 + strip 40 + breath buttons 74 +
 * stone band 122 + hint room 70 + 22 spare. At 1414x771 the scene takes its
 * full height and nothing needs a scroll.
 */
const HEIGHT_RESERVE_PX = 556;
const MAX_SCENE_H = 224;
const MIN_SCENE_H = 132;

/** How long the ring takes to fill / soften. Nothing is judged on this. */
const RISE_MS = 1900;
const FALL_MS = 2100;
const RISE_MS_REDUCED = 320;
const FALL_MS_REDUCED = 320;
/** How long the "the ring is waiting for you" note stays on the strip. */
const WAIT_NOTE_MS = 2600;

const RING_LOW = 0.56;
const RING_HIGH = 1;

const CALM_AQUA = "#7df0ff";
const WARM_GOLD = "#ffd58a";
const GOOD_GREEN = "#34d399";
const STONE_GREY = "#8d93a8";
const DEFAULT_TINT = "#9ad9ff";

/* ------------------------------------------------------------------ */
/* Default content (the legacy signature mount)                       */
/* ------------------------------------------------------------------ */

/*
 * Authoring rule for a stone: the label is the heavy thought in the CHILD'S
 * words, and `why` is Sarah's reason it was never theirs, one or two kid-sized
 * sentences that read naturally after the shared "That's right!" lead. A stone
 * never blames the child, and never names the Raccoon.
 */
const STONES: CalmStone[] = [
  {
    id: "clicked",
    label: "“I clicked it”",
    icon: "🖱️",
    why: "That stone was never yours. You clicked something that looked normal, and the person who sent it made that choice, not you.",
  },
  {
    id: "replied",
    label: "“I replied”",
    icon: "💬",
    why: "That one was never yours either. You answered the way kind people answer, and being kind is never the thing that went wrong.",
  },
  {
    id: "opened",
    label: "“I opened the message”",
    icon: "📬",
    why: "Opening a message cannot make anybody unkind, Cyber Hero. They had already chosen that before it ever reached your screen.",
  },
  {
    id: "told-no-one",
    label: "“I didn't tell anyone”",
    icon: "🤐",
    why: "Waiting is not a crime. Grown-ups are glad whenever you tell them, and telling one today counts just as much.",
  },
];

const DEFAULT_INTRO_SUBTITLE =
  "Breathe with the ring at your own speed, then lift the heavy stones off, one at a time.";
const DEFAULT_TRUTH_LINE = "It is never your fault. Not a little bit. Not ever.";
const DEFAULT_COMPLETE_LINE =
  "When something horrid lands on your screen, breathe slowly and tell a grown-up. It was never yours to carry.";
const DEFAULT_HINTS = {
  tier1: "Tap the button that is glowing. The ring waits as long as you need it to.",
  tier2: "Tap BREATHE IN and let the ring grow big. When it is big, tap BREATHE OUT.",
};

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

// A read-aloud only starts when there is something to say and the lesson is not
// muted, so the spoken gate never waits on a clip that cannot play.
const canRead = (text?: string) => !isAudioMuted() && !!text;

/** The console scene height for a window: never taller than the design, never
 *  so short the ring stops reading. Read through useSyncExternalStore, so a
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

type Narr = "howto" | "stone" | "truth" | "idle";
type Phase = "breath" | "lift" | "truth";
type Breath = "low" | "rising" | "high" | "falling";

export default function CalmDownConsole({
  stones = STONES,
  breathsPerStone = 1,
  introTitle = "The Calm-Down Console",
  introSubtitle = DEFAULT_INTRO_SUBTITLE,
  introIcon = "💪",
  inLabel = "BREATHE IN",
  outLabel = "BREATHE OUT",
  stonesLabel = "NOT YOURS TO CARRY",
  truthLine = DEFAULT_TRUTH_LINE,
  completeTitle = "Every stone lifted!",
  completeLine = DEFAULT_COMPLETE_LINE,
  hints = DEFAULT_HINTS,
  introNarration,
  coachLines,
  completeNarration,
  onComplete,
  onCorrect,
  onHintReached,
  onAnswered,
}: CalmConsoleProps) {
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
  const [phase, setPhase] = useState<Phase>("breath");
  const [breath, setBreath] = useState<Breath>("low");
  const [breaths, setBreaths] = useState(0);
  const [totalBreaths, setTotalBreaths] = useState(0);
  const [lifted, setLifted] = useState<readonly string[]>([]);
  const [done, setDone] = useState(false);
  // Read-aloud chain: the how-to once as the console appears ("howto"), then
  // every stone's words in the order they sit ("stone", which one = stoneRead),
  // and the week's truth at the end ("truth"). Taps are held while she speaks.
  const [narr, setNarr] = useState<Narr>("idle");
  const [stoneRead, setStoneRead] = useState(0);
  // The child tapped the button that is not lit: the ring just waits, and the
  // strip says so. Purely a nudge; nothing is scored and nothing is wrong.
  const [waiting, setWaiting] = useState(false);
  const [stuck, setStuck] = useState(0);

  const breathsRef = useRef(0);
  const completedRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  const later = (fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  };
  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  // The order the stones sit in is muddled on every play, never the authored one.
  const shuffled = useShuffledOnce(stones);
  const list =
    shuffled.length === stones.length && shuffled.every((s) => stones.includes(s)) ? shuffled : stones;

  // Spoken lifts: Sarah says "That's right!" + why in one take, and the next
  // breath waits for her.
  const verdict = useVerdictVoice(voice);
  const speaking = narr !== "idle" || verdict.speaking;
  const perStone = Math.max(1, Math.round(breathsPerStone));
  const remaining = list.filter((s) => !lifted.includes(s.id)).length;
  const riseMs = reduce ? RISE_MS_REDUCED : RISE_MS;
  const fallMs = reduce ? FALL_MS_REDUCED : FALL_MS;

  const live = !showIntro && !done && !speaking;
  const canBreathe = live && phase === "breath";
  const canLift = live && phase === "lift";

  // Safety releases for the spoken gate (never leave the console held).
  useEffect(() => {
    if (narr === "idle") return;
    const id = window.setTimeout(() => setNarr("idle"), SPOKEN_GATE_MAX_MS);
    return () => window.clearTimeout(id);
  }, [narr, stoneRead]);
  useEffect(() => subscribeAudioMute((muted) => { if (muted) setNarr("idle"); }), []);

  // Hint tiers reported once each (for the parent dashboard).
  const reportedTier = useRef(0);
  useEffect(() => {
    const tier = stuck >= 3 ? 2 : stuck >= 1 ? 1 : 0;
    if (tier > reportedTier.current) {
      reportedTier.current = tier;
      onHintReached?.(tier as 1 | 2);
    }
  }, [stuck, onHintReached]);

  /* ---------------- the read-aloud chain ---------------- */

  const readStones = () => {
    setStoneRead(0);
    setNarr(canRead(list[0]?.label) ? "stone" : "idle");
  };
  const onStoneDone = () => {
    const next = stoneRead + 1;
    if (next < list.length && canRead(list[next]?.label)) setStoneRead(next);
    else setNarr("idle");
  };

  const startBoard = () => {
    setShowIntro(false);
    if (isAudioMuted()) {
      setNarr("idle");
      return;
    }
    if (coachLines) setNarr("howto");
    else readStones();
  };

  /* ---------------- the truth, once every stone is off ---------------- */

  const toTruth = () => {
    setPhase("truth");
    if (canRead(truthLine)) setNarr("truth");
    else later(() => setDone(true), reduce ? 200 : 700);
  };

  /* ---------------- the breath (tap-paced, never held) ---------------- */

  // The button that is not lit is never disabled: a tap on it is answered by a
  // kind line, so a child who taps the "wrong" one is never met with silence.
  const note = () => {
    setWaiting(true);
    setStuck((n) => n + 1);
    audio.hint();
    later(() => setWaiting(false), WAIT_NOTE_MS);
  };

  const tapIn = () => {
    if (!canBreathe) return;
    if (breath !== "low") {
      note();
      return;
    }
    setWaiting(false);
    audio.tap();
    setBreath("rising");
    later(() => setBreath("high"), riseMs);
  };

  const tapOut = () => {
    if (!canBreathe) return;
    if (breath !== "high") {
      note();
      return;
    }
    setWaiting(false);
    audio.tap();
    setBreath("falling");
    later(() => {
      setBreath("low");
      audio.heal();
      setTotalBreaths((n) => n + 1);
      const n = breathsRef.current + 1;
      if (n >= perStone) {
        breathsRef.current = 0;
        setBreaths(0);
        // A console authored with no stones (or every stone already off) has
        // nothing left to lift, so the breath lands straight on the truth.
        if (remaining === 0) toTruth();
        else setPhase("lift");
      } else {
        breathsRef.current = n;
        setBreaths(n);
      }
    }, fallMs);
  };

  /* ---------------- lifting a stone (no wrong path) ---------------- */

  const lift = (stone: CalmStone, index: number) => {
    if (!canLift || lifted.includes(stone.id)) return;
    onAnswered?.({
      questionKey: `calm-${stone.id}`,
      selectedIndex: index,
      correctIndex: index,
      wasCorrect: true,
    });
    // fx.correct plays its own chime (no audio.correct() here).
    fx.correct({ xp: 20 });
    onCorrect?.();
    setWaiting(false);
    const next = [...lifted, stone.id];
    setLifted(next);
    const allOff = next.length >= list.length;
    // Sarah: "That's right!" + why, one take; then the next breath, or the
    // week's truth once every stone is off.
    verdict.say("right", stone.why, () => {
      if (allOff) toTruth();
      else setPhase("breath");
    });
  };

  const onTruthDone = () => {
    setNarr("idle");
    later(() => setDone(true), reduce ? 120 : 420);
  };

  // No timer, no fail and no wrong answer: every hero who finishes finishes
  // with three stars.
  const stars = 3;
  const complete = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete(100);
  };

  /* ---------------- render values ---------------- */

  const ringD = Math.round(clamp(sceneH - 34, 96, 172));
  const heroH = Math.round(clamp(sceneH * 0.88, 104, 190));
  const heroW = Math.round((heroH * 92) / 150);
  const grown = breath === "rising" || breath === "high";
  const ringTarget = grown ? RING_HIGH : RING_LOW;
  const ringMs = breath === "rising" ? riseMs : breath === "falling" ? fallMs : 260;
  const idleRing = breath === "low" && !reduce && canBreathe;
  const ringColour = phase === "truth" ? GOOD_GREEN : grown ? WARM_GOLD : CALM_AQUA;
  // Round 1 teaches the MECHANIC only: the IN button breathes on the very first
  // breath, so the glow can never point at a stone.
  const guided = canBreathe && totalBreaths === 0 && breath === "low" && lifted.length === 0;

  const stripText = waiting
    ? "The ring waits for you. Tap the button that is glowing."
    : phase === "truth"
      ? truthLine
      : phase === "lift"
        ? "Now tap a stone to lift it off."
        : breath === "low"
          ? `Tap ${inLabel} and let the ring grow.`
          : breath === "rising"
            ? "Breathing in, slow and steady..."
            : breath === "high"
              ? `Tap ${outLabel} and let the ring soften.`
              : "Breathing out, nice and slow...";
  const stripIcon = phase === "truth" ? "💪" : waiting ? "💬" : "🧠";
  const bandLine =
    phase === "truth"
      ? "ALL LIFTED"
      : guided
        ? "Round 1: tap the glowing button"
        : phase === "lift"
          ? "One breath done. Pick a stone."
          : perStone > 1
            ? `Breath ${Math.min(breaths + 1, perStone)} of ${perStone}`
            : `${remaining} stone${remaining === 1 ? "" : "s"} still on your shoulders`;
  const hintText = stuck >= 3 ? hints.tier2 : stuck >= 1 ? hints.tier1 : undefined;
  const hintTier = (stuck >= 3 ? 2 : 1) as 1 | 2;
  const readingLabel = narr === "stone" ? list[stoneRead]?.label ?? "" : "";

  return (
    <ExerciseFrame maxWidth={FRAME_MAX_W} padding={`${FRAME_PAD_Y}px ${FRAME_PAD_X}px`} decor>
      {fx.layer()}
      {verdict.element}

      {/* Sarah's read-alouds (audio only): the how-to once, then every stone's
          words, then the week's truth when the last stone is off. */}
      {!showIntro && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration
              key="cdc-howto"
              speaker={coachLines.speaker ?? voice}
              lines={coachLines.lines}
              accent={tint}
              recordedOnly
              onDone={readStones}
            />
          )}
          {narr === "stone" && readingLabel && (
            <InfoNarration
              key={`cdc-stone-${stoneRead}`}
              speaker={voice}
              lines={[readingLabel]}
              accent={tint}
              recordedOnly
              onDone={onStoneDone}
            />
          )}
          {narr === "truth" && truthLine && (
            <InfoNarration
              key="cdc-truth"
              speaker={voice}
              lines={[truthLine]}
              accent={tint}
              recordedOnly
              onDone={onTruthDone}
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
            {list.length - remaining} of {list.length} lifted
          </span>
        </div>

        {/* ------------ the strip (every word Sarah reads, plus what to tap) ------------ */}
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
              background: phase === "truth" ? "rgba(52,211,153,0.16)" : `${tint}1a`,
              border: `1px solid ${phase === "truth" ? GOOD_GREEN : `${tint}59`}`,
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

        {/* ------------ the console: hero + ring, breath taps, stone band ------------ */}
        <div
          style={{
            position: "relative",
            margin: "0 12px",
            borderRadius: 20,
            overflow: "hidden",
            background: "linear-gradient(180deg, #16243a 0%, #111a2e 58%, #0d1424 100%)",
            border: `2px solid ${tint}33`,
            boxShadow: "inset 0 0 60px rgba(0,0,0,0.42)",
          }}
        >
          {/* ---- the calm scene ---- */}
          <div
            style={{
              position: "relative",
              height: sceneH,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              padding: "0 14px",
              boxSizing: "border-box",
            }}
          >
            {/* a soft warm glow behind the console, never a siren */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                background: `radial-gradient(ellipse at 62% 58%, ${tint}22 0%, transparent 62%)`,
              }}
            />

            <HeroWithStones
              carrying={remaining}
              total={list.length}
              width={heroW}
              height={heroH}
              reduce={reduce}
            />

            {/* the breathing ring */}
            <div
              style={{
                position: "relative",
                width: ringD,
                height: ringD,
                flexShrink: 0,
                display: "grid",
                placeItems: "center",
              }}
            >
              <motion.div
                aria-hidden
                animate={idleRing ? { scale: [RING_LOW, RING_LOW + 0.04, RING_LOW] } : { scale: ringTarget }}
                transition={
                  idleRing
                    ? { repeat: Infinity, duration: 4.4, ease: "easeInOut" }
                    : { duration: ringMs / 1000, ease: "easeInOut" }
                }
                style={{
                  position: "absolute",
                  width: ringD,
                  height: ringD,
                  borderRadius: "50%",
                  background: `radial-gradient(circle at 50% 45%, ${ringColour}2e 0%, transparent 70%)`,
                  boxShadow: `0 0 34px ${ringColour}55`,
                }}
              />
              <motion.div
                aria-hidden
                animate={idleRing ? { scale: [RING_LOW, RING_LOW + 0.04, RING_LOW] } : { scale: ringTarget }}
                transition={
                  idleRing
                    ? { repeat: Infinity, duration: 4.4, ease: "easeInOut" }
                    : { duration: ringMs / 1000, ease: "easeInOut" }
                }
                style={{
                  width: ringD,
                  height: ringD,
                  boxSizing: "border-box",
                  borderRadius: "50%",
                  border: `6px solid ${ringColour}`,
                  background: "rgba(255,255,255,0.03)",
                }}
              />
              <span aria-hidden style={{ position: "absolute", display: "grid", placeItems: "center", pointerEvents: "none" }}>
                <PixIcon emoji={phase === "truth" ? "✨" : "💪"} size={Math.round(ringD * 0.24)} />
              </span>
            </div>
          </div>

          {/* ---- the two breath taps: never a hold, never a race ---- */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              justifyContent: "center",
              padding: "0 10px 10px",
            }}
          >
            <BreathButton
              label={inLabel}
              icon="⬆️"
              colour={CALM_AQUA}
              lit={canBreathe && breath === "low"}
              held={!canBreathe}
              guided={guided}
              reduce={reduce}
              onTap={tapIn}
            />
            <BreathButton
              label={outLabel}
              icon="⬇️"
              colour={WARM_GOLD}
              lit={canBreathe && breath === "high"}
              held={!canBreathe}
              guided={false}
              reduce={reduce}
              onTap={tapOut}
            />
          </div>

          {/* ---- the blame-stones: lift one after every breath ---- */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              boxSizing: "border-box",
              padding: "7px 10px 10px",
              background: "linear-gradient(180deg, rgba(8,12,24,0.5) 0%, rgba(8,12,24,0.86) 46%)",
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
                color: phase === "truth" ? GOOD_GREEN : tint,
                minHeight: 14,
                textAlign: "center",
              }}
            >
              <span>{stonesLabel}</span>
              <span style={{ color: "#c6d4ee", letterSpacing: "0.08em" }}>{bandLine}</span>
            </div>
            <div
              role="group"
              aria-label={stonesLabel}
              style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}
            >
              {list.map((stone, i) => (
                <StoneTile
                  key={stone.id}
                  stone={stone}
                  order={i}
                  tint={tint}
                  reduce={reduce}
                  lifted={lifted.includes(stone.id)}
                  held={!canLift}
                  onLift={() => lift(stone, i)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ------------ the tiered hint ------------ */}
        {hintText && phase !== "truth" && (
          <div style={{ maxWidth: 560, margin: "0 auto", padding: "0 12px" }}>
            <HintBubble tier={hintTier} speaker={voice} text={hintText} />
          </div>
        )}

        <style>{`
          @keyframes cdcGuide { 0%,100% { box-shadow: 0 0 0 3px ${tint}55, 0 0 16px ${tint}66 } 50% { box-shadow: 0 0 0 7px ${tint}22, 0 0 30px ${tint} } }
          @keyframes cdcFloat { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-4px) } }
        `}</style>
      </div>

      {/* ------------ overlays ------------ */}
      {showIntro && (
        <ExerciseIntroBeat
          title={introTitle}
          subtitle={introSubtitle}
          icon={introIcon}
          narration={introNarration}
          character={introNarration?.speaker}
          // This engine never carries a threat, and the frame is wide (820px):
          // without `overlay` a threat-less intro renders as a big empty box.
          overlay
          onDismiss={startBoard}
        />
      )}

      {/* The payoff waits for Sarah: a complete beat that mounts while the last
          line is still speaking would cut her off (the Week 9 bug). */}
      {done && !speaking && (
        <ExerciseCompleteBeat
          title={completeTitle}
          stars={stars}
          statLines={[
            `${list.length} stone${list.length === 1 ? "" : "s"} lifted, ${totalBreaths} calm breath${totalBreaths === 1 ? "" : "s"}`,
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
/* The breath taps                                                    */
/* ------------------------------------------------------------------ */

/**
 * One breath button. The lit one is the one the ring is waiting for; the other
 * still takes a tap (it answers with a kind line) so a child is never met with
 * a dead button. Nothing here is ever a hold.
 */
function BreathButton({
  label,
  icon,
  colour,
  lit,
  held,
  guided,
  reduce,
  onTap,
}: {
  label: string;
  icon: string;
  colour: string;
  /** The ring is waiting for this one. */
  lit: boolean;
  /** Sarah is speaking, or it is time to lift a stone: not tappable right now. */
  held: boolean;
  /** Round 1 mechanic glow (the IN button only). */
  guided: boolean;
  reduce: boolean;
  onTap: () => void;
}) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onTap}
      disabled={held}
      whileTap={held || reduce ? undefined : { scale: 0.96 }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        flex: "1 1 170px",
        maxWidth: 240,
        minHeight: 54,
        boxSizing: "border-box",
        padding: "8px 16px",
        borderRadius: 16,
        border: `2px solid ${lit ? colour : "rgba(255,255,255,0.18)"}`,
        background: lit
          ? `linear-gradient(180deg, ${colour}33 0%, ${colour}14 100%)`
          : "linear-gradient(180deg, rgba(38,48,72,0.9) 0%, rgba(20,26,44,0.95) 100%)",
        color: lit ? "#f6fdff" : "#c3ccdf",
        fontFamily: "inherit",
        fontSize: 15,
        fontWeight: 900,
        letterSpacing: "0.08em",
        lineHeight: 1.2,
        cursor: held ? "wait" : "pointer",
        opacity: held ? 0.8 : 1,
        boxShadow: lit ? `0 10px 26px -14px ${colour}, inset 0 0 18px ${colour}22` : "none",
        transition: "border-color 240ms ease, background 240ms ease, color 240ms ease",
        touchAction: "manipulation",
        animation: guided && !reduce ? "cdcGuide 1.8s ease-in-out infinite" : undefined,
      }}
    >
      <PixIcon emoji={icon} size={22} style={{ flexShrink: 0 }} />
      <span style={{ overflowWrap: "anywhere" }}>{label}</span>
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/* The blame-stones                                                   */
/* ------------------------------------------------------------------ */

/**
 * One blame-stone. Every stone wears the same grey until the child lifts it,
 * and a lifted one floats up pale and gold instead of vanishing, so the hero
 * can see everything they have already put down.
 */
function StoneTile({
  stone,
  order,
  tint,
  reduce,
  lifted,
  held,
  onLift,
}: {
  stone: CalmStone;
  /** Position in the row: drives which side it settles in from. */
  order: number;
  tint: string;
  reduce: boolean;
  lifted: boolean;
  /** Sarah is speaking, or it is time to breathe: not tappable right now. */
  held: boolean;
  onLift: () => void;
}) {
  const fromLeft = order % 2 === 0;
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, x: fromLeft ? -22 : 22, y: 8 }}
      animate={lifted ? { opacity: 1, x: 0, y: reduce ? 0 : -6 } : { opacity: 1, x: 0, y: 0 }}
      transition={
        reduce
          ? { duration: 0.2, delay: order * 0.04 }
          : { type: "spring", stiffness: 220, damping: 22, delay: 0.08 + order * 0.09 }
      }
      style={{ flex: "1 1 160px", minWidth: 0, maxWidth: 210 }}
    >
      <div style={{ animation: lifted && !reduce ? `cdcFloat 4.6s ease-in-out ${order * 0.4}s infinite` : undefined }}>
        <motion.button
          type="button"
          aria-label={lifted ? `${stone.label} (lifted)` : stone.label}
          aria-disabled={lifted || undefined}
          onClick={onLift}
          disabled={held || lifted}
          whileTap={held || lifted || reduce ? undefined : { scale: 0.96 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "100%",
            minHeight: 60,
            boxSizing: "border-box",
            padding: "8px 12px",
            // An organic stone, not a card: the same shape lifted or not.
            borderRadius: "46% 54% 52% 48% / 58% 46% 54% 42%",
            border: `2px solid ${lifted ? "rgba(255,213,138,0.75)" : "rgba(255,255,255,0.14)"}`,
            background: lifted
              ? "linear-gradient(180deg, rgba(255,226,170,0.26) 0%, rgba(255,201,120,0.12) 100%)"
              : `linear-gradient(180deg, ${STONE_GREY}59 0%, rgba(38,42,58,0.96) 100%)`,
            color: lifted ? "#ffeec6" : "#eef2fb",
            textAlign: "left",
            fontFamily: "inherit",
            fontSize: 14,
            fontWeight: 800,
            lineHeight: 1.25,
            cursor: lifted ? "default" : held ? "wait" : "pointer",
            opacity: lifted ? 0.9 : held ? 0.85 : 1,
            boxShadow: lifted
              ? "0 12px 26px -18px rgba(255,213,138,0.9)"
              : `0 10px 24px -16px #000, inset 0 0 18px ${tint}12`,
            transition: "border-color 240ms ease, background 240ms ease, color 240ms ease, opacity 240ms ease",
            touchAction: "manipulation",
          }}
        >
          <span aria-hidden style={{ flexShrink: 0, display: "grid", placeItems: "center", width: 32, height: 32 }}>
            <PixIcon emoji={lifted ? "✨" : stone.icon} size={28} />
          </span>
          <span style={{ flex: 1, minWidth: 0, overflowWrap: "anywhere" }}>{stone.label}</span>
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* The hero                                                           */
/* ------------------------------------------------------------------ */

/**
 * The hero at the console with the stones they are still carrying stacked on
 * their shoulders. Every stone lifted straightens them up a little: the figure
 * leans back to upright, and their face softens, as `carrying` falls to zero.
 *
 * Motion + SVG: a pixel origin is measured from the element's own fill-box
 * unless `transformBox: "view-box"` is set, so the lean rotates about the
 * hero's feet (46, 146) in the viewBox, not about the group's own bounds.
 */
function HeroWithStones({
  carrying,
  total,
  width,
  height,
  reduce,
}: {
  carrying: number;
  total: number;
  width: number;
  height: number;
  reduce: boolean;
}) {
  const load = total > 0 ? clamp(carrying / total, 0, 1) : 0;
  const rocks = Array.from({ length: Math.min(carrying, 4) }, (_, i) => i);
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 92 150"
      aria-hidden
      style={{ display: "block", flexShrink: 0, overflow: "visible" }}
    >
      <motion.g
        animate={{ rotate: -7 * load, y: 5 * load }}
        transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 140, damping: 18 }}
        style={{ transformBox: "view-box", originX: 46, originY: 146 }}
      >
        {/* the stones still on their shoulders */}
        {rocks.map((i) => (
          <ellipse
            key={i}
            cx={46 + (i % 2 === 0 ? -3 : 3)}
            cy={44 - i * 11}
            rx={21 - i * 2.4}
            ry={7.5 - i * 0.5}
            fill={i % 2 === 0 ? "#7f8698" : "#6d7386"}
            stroke="rgba(0,0,0,0.25)"
            strokeWidth={1.2}
          />
        ))}
        {/* legs + shoes */}
        <rect x={31} y={112} width={11} height={26} rx={5.5} fill="#2f5f9e" />
        <rect x={50} y={112} width={11} height={26} rx={5.5} fill="#2f5f9e" />
        <ellipse cx={36} cy={142} rx={9} ry={5} fill="#26324a" />
        <ellipse cx={57} cy={142} rx={9} ry={5} fill="#26324a" />
        {/* arms up, holding the load steady */}
        <path d="M33 96 C26 84 24 72 26 60" fill="none" stroke="#3ec6ad" strokeWidth={10} strokeLinecap="round" />
        <path d="M59 96 C66 84 68 72 66 60" fill="none" stroke="#35ab95" strokeWidth={10} strokeLinecap="round" />
        <circle cx={26} cy={57} r={6.5} fill="#ffd9a8" />
        <circle cx={66} cy={57} r={6.5} fill="#ffd9a8" />
        {/* hoodie body */}
        <rect x={27} y={80} width={38} height={38} rx={14} fill="#3ec6ad" />
        {/* head */}
        <circle cx={46} cy={66} r={15} fill="#ffd9a8" />
        <circle cx={46} cy={58} r={15} fill="#5b3a1e" />
        <circle cx={41} cy={68} r={1.9} fill="#2b2233" />
        <circle cx={52} cy={68} r={1.9} fill="#2b2233" />
        <path
          d={load > 0.5 ? "M41 75 Q46.5 74 52 75" : "M41 74 Q46.5 79 52 74"}
          fill="none"
          stroke="#2b2233"
          strokeWidth={2}
          strokeLinecap="round"
        />
      </motion.g>
    </svg>
  );
}
