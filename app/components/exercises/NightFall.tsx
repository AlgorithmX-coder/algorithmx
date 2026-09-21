"use client";

/**
 * NightFall: the LAST HOUR BELONGS TO YOUR BODY drill (Week 13, "Night Fall").
 *
 * A bedroom at dusk, with a strip of sky above it. Things are dotted around
 * the room on their own little spots: a tablet face up on the pillow, a
 * handheld still humming on the desk, a phone on charge by the bed, and, in
 * among them, things that are not screens at all and belong exactly where they
 * are, like a book, the lamp and a glass of water.
 *
 * The child taps a thing to send it OUT for the night: to the kitchen shelf,
 * the hall, the charger by the door. Every thing that goes out darkens the
 * sky one step and the room settles a little more. Tapping something that
 * belongs in the room is gentle: Sarah says why it stays, it does not move an
 * inch, and it keeps a small STAYS tag from then on. When the last screen is
 * out, the sky is full night and the stars come out over a quiet room.
 *
 * The sky IS the reward. It is not a score and not a clock: it is the evening
 * arriving, one step at a time, because the child made room for it. Nothing
 * here says screens are bad. The screens are lovely; they just sleep somewhere
 * else, so the last hour can belong to the body that has to get up tomorrow.
 *
 * Why it is not Track Back, the Drill Run, Who Would Know or the Trail Planner
 * (owner: "we never copy an exercise"): all four of those are read a situation,
 * tap one of three cards. Here there is no question and no card row. There is
 * a place, full of the child's own things, and the child works across all of it
 * in whatever order they like, clearing what glows and leaving what does not,
 * while the world around them changes as they go. Clear the room, darken the
 * sky, not pick one of three.
 *
 * Nothing races the child: tap-only, untimed, no timers, no lose state, no
 * penalty for a thing that stays beyond Sarah explaining why it stays.
 *
 * Learn-Loop wiring: Raccoon boast in the intro (`threat`), Sarah's how-to once
 * and every thing's `readAloud` spoken as it is picked up (audio-only,
 * `recordedOnly`, taps held, released by the shared SPOKEN_GATE_MAX_MS), then a
 * one-take spoken verdict ("That's right!" + that thing's `why` via
 * VerdictVoice; a thing that stays: WrongAnswerPanel speaks "Not quite." + that
 * thing's `explanation`), hint tiers, and a payoff on the complete beat gated
 * on `!verdict.speaking` so it can never cut Sarah off. The starlit room is
 * held from the verdict's own callback, so no payoff can cut her off either.
 * The room is shuffled once, so the screens are never in the authored order. A
 * synchronous ref latch shuts the room the instant a thing is tapped, because
 * `canTap` only closes once React re-renders on `verdict.speaking` and a quick
 * second tap would otherwise restart the verdict and cut Sarah off (the real
 * Week 12 bug).
 *
 * The first move guides the MECHANIC only: every thing in the room breathes,
 * equally, screens and book alike, so the glow says "tap one of these", never
 * which one goes out. Every tile wears the same paper, size and ink.
 *
 * CRITICAL for the week author: every spoken string arrives through props
 * (`introNarration`, `coachLines`, `threat`, each thing's `readAloud`, `why`
 * and `explanation`, `hints`, `completeNarration`). The clip generator reads
 * the WEEK FILE, so anything left to a component default is never recorded and
 * plays as silence, with no error anywhere.
 *
 * Authoring: five to seven things, of which two or three have `moveOut: false`
 * (a room with nothing left in it is not a bedroom, and the child has to have
 * something kind to be right about). Keep a `label` to about 18 characters (it
 * sits under the icon on a tile), `readAloud` to one short sentence, and `why`
 * and `explanation` to one kid-sized sentence each. `why` is what Sarah says
 * as a thing goes out; `explanation` is the calm line for a thing that stays,
 * so every thing needs both. Every icon must be in PixIcon's MAP or it renders
 * as a flat system emoji.
 *
 * Layout budget at the owner's 1414x771 window (HUD 64 + stage padding 40, so
 * the stage holds ~627px before it grows): header 29 + marginBottom 10 + board
 * 26 (padding and border) + sky 78 + room 200 + gap 12 + prompt 20 + gap 6 +
 * out shelf 96 + strip 28 + hint gap 8 = ~513px, so the sky, the whole room
 * and the shelf are on screen without a scroll. At 400px the tiles fall into
 * rows of three and nothing scrolls sideways.
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

export interface RoomThing { id: string; label: string; icon: string; readAloud: string; moveOut: boolean; why: string; explanation: string; }
export interface NightFallProps {
  things: RoomThing[];
  introTitle?: string; introSubtitle?: string; introIcon?: string;
  roomLabel?: string;        // default "YOUR ROOM"
  outLabel?: string;         // default "OUT FOR THE NIGHT"
  stayLabel?: string;        // default "STAYS"
  askPrompt?: string;        // default "Tap what goes out for the night"
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

/** Fixed chrome copy the props above do not cover (never spoken, so it can
 *  safely live here). Warm on purpose: this is bedtime, not a telling-off. */
const OUT_TOAST = "OUT FOR THE NIGHT!";
const WRONG_TITLE = "That one belongs in here";
const SHELF_EMPTY = "Nothing out yet. Tap a screen to send it off";
const SKY_LABEL = "THE SKY";

const EMPTY_THINGS: RoomThing[] = [];
const KID_FONT = "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif";
const LABEL_FONT = "'Space Grotesk', sans-serif";
/** Geometry (px). */
const SKY_H = 78;
const ROOM_MIN_H = 200;
const TILE_W = 106;
const TILE_MIN_H = 88;
const SHELF_MIN_H = 76;
/** Paints. Dusk over a warm room: the tiles are paper, the room is deep, so a
 *  thing that can be tapped is never painted on a ground the same shade. */
const DUSK = "linear-gradient(180deg, #4a3a78 0%, #8f5f8a 58%, #e8a06a 100%)";
const NIGHT = "linear-gradient(180deg, #050a1e 0%, #0b1030 62%, #17204a 100%)";
const WALL = "linear-gradient(180deg, #2b2450 0%, #1b1740 62%, #171334 100%)";
const FLOOR = "linear-gradient(180deg, #2a2148 0%, #1d1838 100%)";
const PAPER = "#fff6e8";
const INK = "#2a1f18";
const OUT_BLUE = "#9fd2ff";
const STAY_WARM = "#ffb347";

/** A fixed star field (no randomness in render): each star comes out once the
 *  sky has darkened past its own step, so the night arrives gradually. */
const STARS: { x: number; y: number; s: number; at: number }[] = [
  { x: 9, y: 30, s: 3, at: 0.18 },
  { x: 21, y: 58, s: 2, at: 0.5 },
  { x: 30, y: 22, s: 4, at: 0.3 },
  { x: 43, y: 46, s: 2.5, at: 0.62 },
  { x: 52, y: 18, s: 3, at: 0.38 },
  { x: 63, y: 54, s: 2, at: 0.74 },
  { x: 71, y: 26, s: 3.5, at: 0.46 },
  { x: 82, y: 48, s: 2.5, at: 0.86 },
  { x: 91, y: 24, s: 3, at: 0.66 },
];

export default function NightFall({
  things,
  introTitle = "Night Fall",
  introSubtitle = "Send the screens out for the night and watch the sky go dark.",
  introIcon = "🌟",
  roomLabel = "YOUR ROOM",
  outLabel = "OUT FOR THE NIGHT",
  stayLabel = "STAYS",
  askPrompt = "Tap what goes out for the night",
  completeTitle = "Night has fallen!",
  completeLine = "The last hour is yours now, Cyber Hero. Your body gets the quiet, and the screens get a rest too.",
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
}: NightFallProps) {
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
  // Read-aloud chain: the how-to once as the room opens, then the thing that
  // has just been picked up. Taps are held while she speaks.
  const [narr, setNarr] = useState<"howto" | "read" | "idle">("idle");
  const [reading, setReading] = useState<RoomThing | null>(null);
  // Things sent out for the night, in the order the child cleared them.
  const [out, setOut] = useState<{ id: string; label: string; icon: string }[]>([]);
  // Things the child tried to move that belong in the room: they keep a gentle
  // STAYS tag from then on, and never judge the child twice for the same tile.
  const [stays, setStays] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [done, setDone] = useState(false);
  const [wrongsSince, setWrongsSince] = useState(0);
  const [totalWrongs, setTotalWrongs] = useState(0);

  // The room is shuffled once, so the screens are never in authored order.
  const room = useShuffledOnce(things ?? EMPTY_THINGS, { key: "nightfall-room" });
  const outTotal = things.filter((t) => t.moveOut).length;
  const progress = outTotal === 0 ? 1 : Math.min(out.length / outTotal, 1);
  const nightIsIn = progress >= 1;
  const remaining = Math.max(outTotal - out.length, 0);

  // Spoken verdicts: Sarah says "That's right!" + why once the thing has been
  // read out. A thing that stays speaks through WrongAnswerPanel.
  const verdict = useVerdictVoice(voice);
  const speaking = narr !== "idle" || verdict.speaking || !!feedback || done;
  // `speaking` only closes once React has re-rendered, so a quick second tap
  // landed inside that window and restarted the verdict, cutting Sarah off
  // mid-sentence (the Week 12 bug). This latch shuts the room synchronously.
  const handlingRef = useRef(false);
  // The thing being read out, whether it was the last screen in the room, and
  // the wrong count AT THE TAP (the state has already moved on by the time
  // Sarah has finished reading, so the hint tier has to travel with it).
  const pendingRef = useRef<{ thing: RoomThing; last: boolean; wrongs: number } | null>(null);

  // Safety releases for the spoken gate (never leave the room held).
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
    setNarr(isAudioMuted() ? "idle" : coachLines ? "howto" : "idle");
  };

  /* ───────── Sarah's verdict, once the thing has been read out ───────── */
  const resolve = (thing: RoomThing, last: boolean, wrongs: number) => {
    pendingRef.current = null;
    if (thing.moveOut) {
      // Sarah: "That's right!" + this thing's why. The starlit room is held
      // from her callback, so the payoff can never cut her off.
      verdict.say("right", thing.why, () => {
        handlingRef.current = false;
        if (last) window.setTimeout(() => setDone(true), reduce ? 200 : 1300);
      });
    } else {
      // WrongAnswerPanel speaks "Not quite." + this teach line itself; the
      // thing has not moved and the room waits, so the next tap is free.
      setFeedback({
        title: WRONG_TITLE,
        explanation: thing.explanation,
        tip: wrongs >= 2 ? hints?.tier2 : hints?.tier1,
      });
      handlingRef.current = false;
    }
  };

  /* ───────── The only judged tap: a thing in the room ───────── */
  const pickUp = (thing: RoomThing) => {
    if (speaking || out.some((o) => o.id === thing.id)) return;
    // A thing already explained as staying is settled: tapping it again is a
    // friendly nothing, never a second wrong for the same tile.
    if (stays.includes(thing.id)) {
      audio.tap();
      return;
    }
    if (handlingRef.current) return;
    handlingRef.current = true;
    onAnswered?.({
      questionKey: `nightfall-${thing.id}`,
      // 0 = "out for the night", 1 = "stays in the room". The room is one
      // question per thing, so the dashboard always reads the same numbers.
      selectedIndex: 0,
      correctIndex: thing.moveOut ? 0 : 1,
      wasCorrect: thing.moveOut,
    });

    let last = false;
    let wrongs = wrongsSince;
    if (thing.moveOut) {
      // The thing leaves the room at once (that is the satisfying part) and
      // the sky takes its step; Sarah's reason follows it out.
      audio.drop();
      fx.correct({ xp: 25, text: OUT_TOAST });
      onCorrect?.();
      setWrongsSince(0);
      wrongs = 0;
      const nextOut = [...out, { id: thing.id, label: thing.label, icon: thing.icon }];
      setOut(nextOut);
      last = nextOut.length >= outTotal;
    } else {
      audio.wrong();
      onWrong?.();
      setTotalWrongs((n) => n + 1);
      wrongs = wrongsSince + 1;
      setWrongsSince(wrongs);
      setStays((prev) => (prev.includes(thing.id) ? prev : [...prev, thing.id]));
    }

    // Sarah reads the thing out as it is picked up, and the verdict follows
    // when she has finished, so the two are never on top of each other.
    if (isAudioMuted()) {
      resolve(thing, last, wrongs);
      return;
    }
    pendingRef.current = { thing, last, wrongs };
    setReading(thing);
    setNarr("read");
  };

  const stars = totalWrongs === 0 ? 3 : totalWrongs <= 2 ? 2 : 1;
  const hintText = wrongsSince >= 2 ? hints?.tier2 : wrongsSince === 1 ? hints?.tier1 : undefined;
  const hintTier = (wrongsSince >= 2 ? 2 : 1) as 1 | 2;
  // The first move teaches the mechanic only: every tile breathes together,
  // screens and book alike, so the glow can never point at an answer.
  const guided = out.length === 0 && stays.length === 0 && !speaking;
  const guideStyle = (on: boolean): CSSProperties =>
    on
      ? { boxShadow: `0 0 0 3px ${accent}66, 0 0 22px ${accent}88`, animation: reduce ? undefined : "nfGuide 1.4s ease-in-out infinite" }
      : {};
  const strip = nightIsIn
    ? "THE ROOM IS READY. GOODNIGHT, CYBER HERO"
    : wrongsSince > 0
      ? "Have another look. Which ones light up at you?"
      : guided
        ? "Tap one thing to send it out for the night"
        : remaining === 1
          ? "One more to go, then the stars come out"
          : `${remaining} more to send out`;

  const eyebrowStyle: CSSProperties = {
    fontFamily: LABEL_FONT,
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: accent,
  };

  /* ───────── The sky: dusk turning to full night, step by step ───────── */
  const sky: ReactNode = (
    <div
      aria-hidden
      style={{
        position: "relative",
        width: "100%",
        height: SKY_H,
        borderRadius: "16px 16px 0 0",
        overflow: "hidden",
        background: DUSK,
        borderBottom: "1px solid rgba(255,247,230,0.14)",
      }}
    >
      <motion.div
        animate={{ opacity: progress }}
        transition={{ duration: reduce ? 0 : 0.9, ease: "easeOut" }}
        style={{ position: "absolute", inset: 0, background: NIGHT }}
      />
      {/* The last of the sun along the horizon, fading as the night comes in. */}
      <motion.div
        animate={{ opacity: 1 - progress }}
        transition={{ duration: reduce ? 0 : 0.9, ease: "easeOut" }}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 26,
          background: "linear-gradient(180deg, rgba(255,176,102,0) 0%, rgba(255,176,102,0.75) 100%)",
        }}
      />
      {STARS.map((st, i) => (
        <motion.span
          key={`star-${i}`}
          animate={{ opacity: progress >= st.at ? 1 : 0, scale: progress >= st.at ? 1 : 0.5 }}
          transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 0.08 * (i % 4) }}
          style={{
            position: "absolute",
            left: `${st.x}%`,
            top: `${st.y}%`,
            width: st.s,
            height: st.s,
            borderRadius: "50%",
            background: "#fff7e6",
            boxShadow: "0 0 8px rgba(255,247,230,0.9)",
          }}
        />
      ))}
    </div>
  );

  /* ───────── One thing on its spot. Same paper, size and ink, every tile ───────── */
  const renderThing = (t: RoomThing, order: number): ReactNode => {
    const isOut = out.some((o) => o.id === t.id);
    if (isOut) return null;
    const settled = stays.includes(t.id);
    // A gentle scatter: the spots sit at slightly different heights, so the
    // room reads as a room and not as a row of buttons. Deterministic.
    const lift = [0, -12, 8, -6, 12, -10, 4][order % 7];
    return (
      // The wrapper carries the arrival and the leaving, so a thing that goes
      // out lifts off its spot and away instead of blinking out of the room.
      <motion.div
        key={t.id}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduce ? { opacity: 0, transition: { duration: 0.15 } } : { opacity: 0, y: -26, scale: 0.86, transition: { duration: 0.34 } }}
        transition={{ duration: 0.26, delay: reduce ? 0 : 0.06 * order }}
        style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", marginTop: 12 + lift, marginBottom: 12 - lift }}
      >
        <motion.button
          type="button"
          aria-label={settled ? `${t.label}, ${stayLabel}` : t.label}
          onClick={() => pickUp(t)}
          disabled={speaking}
          whileTap={speaking || reduce ? undefined : { scale: 0.96 }}
          style={{
            position: "relative",
            width: TILE_W,
            minHeight: TILE_MIN_H,
            padding: "10px 8px",
            borderRadius: 16,
            // Every tile wears the same paper, size and ink: nothing may hint
            // at what goes out before the tap.
            background: PAPER,
            border: `3px solid ${settled ? STAY_WARM : "#ffffff"}`,
            boxShadow: settled
              ? `0 0 18px ${STAY_WARM}55, inset 0 0 0 1.5px rgba(42,31,24,0.14)`
              : "0 12px 22px -12px rgba(0,0,0,0.9), inset 0 0 0 1.5px rgba(42,31,24,0.14)",
            color: INK,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            fontFamily: KID_FONT,
            fontSize: 13.5,
            fontWeight: 800,
            lineHeight: 1.2,
            textAlign: "center",
            cursor: speaking ? "wait" : "pointer",
            touchAction: "manipulation",
            transition: "border-color 200ms ease, box-shadow 200ms ease",
            ...guideStyle(guided),
          }}
        >
          <PixIcon emoji={t.icon} size={34} />
          <span style={{ overflowWrap: "anywhere" }}>{t.label}</span>
          {settled && (
            // Centred by a zero-height flex strip, never by a static
            // translate(-50%): this span animates y, and the two would fight.
            <span aria-hidden style={{ position: "absolute", top: -11, left: 0, right: 0, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
              <motion.span
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22 }}
                style={{
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: STAY_WARM,
                  color: INK,
                  fontFamily: LABEL_FONT,
                  fontSize: 9.5,
                  fontWeight: 900,
                  letterSpacing: "0.12em",
                  whiteSpace: "nowrap",
                }}
              >
                {stayLabel}
              </motion.span>
            </span>
          )}
        </motion.button>
        {/* The spot the thing is standing on. */}
        <span
          aria-hidden
          style={{
            marginTop: 5,
            width: TILE_W - 26,
            height: 8,
            borderRadius: "50%",
            background: "rgba(0,0,0,0.42)",
            filter: "blur(2px)",
          }}
        />
      </motion.div>
    );
  };

  /* ───────── The shelf: everything that went out for the night ───────── */
  const shelf: ReactNode = (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, minHeight: 16, ...eyebrowStyle }}>
        <PixIcon emoji="🚪" size={16} />
        <span>{outLabel}</span>
        <span style={{ marginLeft: "auto", color: "rgba(255,247,230,0.65)" }}>
          {out.length} of {outTotal}
        </span>
      </div>
      <div
        role="status"
        aria-label={outLabel}
        style={{
          minHeight: SHELF_MIN_H,
          borderRadius: 16,
          border: out.length ? `2px solid ${OUT_BLUE}aa` : "2px dashed rgba(255,255,255,0.18)",
          background: out.length ? "rgba(159,210,255,0.12)" : "rgba(0,0,0,0.18)",
          padding: "10px 12px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          alignContent: "center",
          justifyContent: out.length ? "flex-start" : "center",
          gap: 8,
          color: "#fff7e6",
          fontFamily: KID_FONT,
          transition: "border-color 220ms ease, background 220ms ease",
        }}
      >
        {out.length === 0 ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, opacity: 0.6, fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", textAlign: "center" }}>
            <PixIcon emoji="👆" size={20} />
            {SHELF_EMPTY}
          </span>
        ) : (
          out.map((o, i) => (
            <motion.span
              key={o.id}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 320, damping: 20, delay: i === out.length - 1 ? 0.1 : 0 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                maxWidth: "100%",
                padding: "6px 11px 6px 7px",
                borderRadius: 999,
                background: "rgba(8,10,22,0.55)",
                border: `1.5px solid ${OUT_BLUE}`,
                fontSize: 13.5,
                fontWeight: 800,
                lineHeight: 1.2,
                overflowWrap: "anywhere",
              }}
            >
              <PixIcon emoji={o.icon} size={20} />
              {o.label}
            </motion.span>
          ))
        )}
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
          subtitle={introSubtitle}
          icon={introIcon}
          narration={introNarration}
          threat={threat}
          character={introNarration?.speaker}
          onDismiss={startBoard}
        />
      )}

      {/* Sarah's read-alouds (audio only): the how-to once, then each thing as
          it is picked up. Every line comes from the week file. */}
      {!showIntro && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="nf-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
          {narr === "read" && reading && (
            <InfoNarration
              key={`nf-read-${reading.id}-${out.length}-${stays.length}`}
              speaker={voice}
              lines={[reading.readAloud]}
              accent={accent}
              recordedOnly
              onDone={() => {
                setNarr("idle");
                const p = pendingRef.current;
                if (p) resolve(p.thing, p.last, p.wrongs);
              }}
            />
          )}
        </div>
      )}

      {!showIntro && (
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Side padding keeps the header clear of the frame's corner ornaments. */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "2px 22px 0" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: accent }}>
              <PixIcon emoji={introIcon} size={16} />
              {introTitle}
            </span>
            <span style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c9b8ff" }}>
              {SKY_LABEL}: {Math.round(progress * 100)}%
            </span>
          </div>

          {/* The board: the sky, the room, the shelf. Inset 22px so it never
              collides with the frame's rounded corners. */}
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
            {/* Sky and room are one window: the sky sits on top of the wall. */}
            <div style={{ width: "100%", borderRadius: 18, overflow: "hidden", border: "1.5px solid rgba(255,247,230,0.2)" }}>
              {sky}
              <div
                style={{
                  position: "relative",
                  minHeight: ROOM_MIN_H,
                  background: WALL,
                  padding: "10px 12px 14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                {/* The lamp glow: warm, and it stays warm. The room settles,
                    it never goes gloomy on a child at bedtime. */}
                <span aria-hidden style={{ position: "absolute", top: -20, right: 18, width: 180, height: 120, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,196,110,0.28) 0%, rgba(255,196,110,0) 70%)", pointerEvents: "none" }} />
                {/* The floor. */}
                <span aria-hidden style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 46, background: FLOOR, borderTop: "1px solid rgba(255,247,230,0.12)" }} />

                <div style={{ display: "flex", alignItems: "center", gap: 6, minHeight: 16, position: "relative", ...eyebrowStyle }}>
                  <PixIcon emoji="🏠" size={16} />
                  <span>{roomLabel}</span>
                  <span style={{ marginLeft: "auto", color: "rgba(255,247,230,0.65)" }}>
                    {nightIsIn ? "QUIET" : "STILL GLOWING"}
                  </span>
                </div>

                <div
                  role="group"
                  aria-label={askPrompt}
                  style={{
                    position: "relative",
                    flex: 1,
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    paddingBottom: 8,
                  }}
                >
                  <AnimatePresence>{room.map(renderThing)}</AnimatePresence>
                  {nightIsIn && (
                    <motion.div
                      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 16px",
                        borderRadius: 999,
                        background: "rgba(8,10,22,0.6)",
                        border: `2px solid ${OUT_BLUE}`,
                        color: "#fff7e6",
                        fontFamily: KID_FONT,
                        fontSize: 15,
                        fontWeight: 800,
                      }}
                    >
                      <PixIcon emoji="⭐" size={26} />
                      <span>{completeTitle}</span>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ ...eyebrowStyle, minHeight: 14, display: "flex", alignItems: "center", gap: 6, textAlign: "center" }}>
                <PixIcon emoji="❓" size={16} />
                {askPrompt}
              </div>
              {shelf}
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
            @keyframes nfGuide { 0%,100% { box-shadow: 0 0 0 3px ${accent}55, 0 0 16px ${accent}77 } 50% { box-shadow: 0 0 0 6px ${accent}22, 0 0 28px ${accent} } }
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
      {done && !verdict.speaking && (
        <ExerciseCompleteBeat
          title={completeTitle}
          stars={stars}
          statLines={[
            `${out.length} screen${out.length === 1 ? "" : "s"} out for the night, and the room kept what it needed`,
            completeLine,
          ]}
          narration={completeNarration}
          onContinue={() => onComplete(stars === 3 ? 100 : stars === 2 ? 70 : 40)}
        />
      )}
    </ExerciseFrame>
  );
}
