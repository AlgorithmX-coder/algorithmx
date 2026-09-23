"use client";

/**
 * RopeLine: the WHAT IS THE NUMBER FOR drill (Week 17, "The 13+ Sign").
 *
 * The Raccoon's Hall of Mirrors is a gallery, and a gallery has rooms. Every
 * room has a velvet rope across it and a brass plate on a stand with a number
 * on it. The child stands at the rope, looks through at what is actually going
 * on in there, and puts the right number on the stand.
 *
 * The whole lesson is in that verb. A six year old meets the 13+ sign as a
 * verdict on THEM: you are too small, you are not clever enough, come back when
 * you are better. It is not. The number is a label on the ROOM. It describes
 * what is inside it, the way a label on a jar describes the jam. A room where
 * everyone is a stranger and anybody can say anything to anybody gets a 13
 * because of what happens in the room, and it would carry that 13 if the child
 * were nine, nineteen or ninety on the day they read it. Once a child can hand
 * out the numbers themselves, "not yet" stops being a door slammed at them and
 * becomes a fact about a room, which is a thing you can be perfectly cheerful
 * about.
 *
 * Verb: READ THE ROOM, THEN LABEL IT. Nothing else in the library asks a child
 * to RATE something. It is NOT a good-or-bad judgement (Hook Sort, the Friend
 * Panner and every two-bin sort are): no room here is bad, and two of the three
 * answers are rooms the child may walk straight into. It is NOT a spot-the-trick
 * game (Week 4's line-up, Week 16's doorways are): nothing in these rooms is
 * lying about itself, and the plate is not hidden anywhere on screen to be
 * found. It is NOT a pick-what-you-would-do card game (Track Back, the Drill
 * Run, the Trail Planner are): the child is not in the story, and the answer
 * does not change with how they feel about it. It is NOT an ordering game (Step
 * Order is): the three plates mean three different rooms, not three steps, and
 * the numbers never need to be put in a row.
 *
 * Every room is built to the same recipe: the same archway, the same rope, the
 * same stand in the same place, and the same three plates on the shelf beside
 * it. The only thing that differs is what the child can see going on through
 * the arch. The room's NAME never gives the number away either, because in real
 * life the friendly name over an app is exactly the part that does not tell you.
 *
 * Nothing races the child: tap-only, untimed, no lose state, and a wrong plate
 * costs nothing beyond Sarah explaining what is in that room.
 *
 * Learn-Loop wiring: Raccoon boast in the intro (`threat`), Sarah's how-to once
 * and every room's `readAloud` spoken as the arch slides in (audio-only,
 * `recordedOnly`, taps held, released by the shared SPOKEN_GATE_MAX_MS), a
 * one-take spoken verdict on the call ("That's right!" + that room's `why` via
 * VerdictVoice; a wrong plate: WrongAnswerPanel speaks "Not quite." + that
 * room's `explanation`), hint tiers per room, and a payoff on the complete beat
 * gated on `!verdict.speaking` so it can never cut Sarah off. The next room
 * arrives from the verdict's own callback, so no payoff can cut her off either.
 * A synchronous ref latch shuts all three plates the instant one is pressed,
 * because `canTap` only closes once React re-renders on `verdict.speaking` and
 * a quick second tap would otherwise restart the verdict and cut Sarah off (the
 * real Week 12 bug).
 *
 * The ROOMS are shuffled every play. The three plates are FIXED in place, 3 then
 * 7 then 13, on every room and every play: they are a number line, and a number
 * line that shuffles is not one. Room 1 guides the MECHANIC only: all three
 * plates breathe together, so the glow says "one of these three", never which.
 *
 * CRITICAL for the week author: every spoken string arrives through props
 * (`introNarration`, `coachLines`, `threat`, each room's `readAloud`, its `why`
 * and `explanation`, `hints`, `completeNarration`). The clip generator reads the
 * WEEK FILE, so anything left to a component default is never recorded and plays
 * as silence, with no error anywhere. `name` and `inside` are READ ON SCREEN,
 * never spoken: put the spoken sentence in `readAloud`, and never say the number
 * out loud in it (a child who is told the answer has not read the room). `why`
 * is spoken ONLY when the plate is right and `explanation` ONLY when it is
 * wrong, so a line in the wrong field is silent even though the field is full.
 *
 * Authoring: five rooms reads best (four to six works), and every set needs at
 * least one of each plate, with at least two 13s, because the 13 is the one the
 * week is actually about. Write `inside` as what a child would SEE happening,
 * never as a rule ("Anyone in the world can send you a message here", not "Not
 * suitable for children"): the child is reading a room, not a rating notice.
 * Keep `name` to about 26 characters, `inside` to about 90, and `readAloud`,
 * `why` and `explanation` to one kid-sized sentence each. A `why` has to earn
 * the number from the room ("Strangers can talk to anyone in there, so it waits
 * until you are thirteen"), never from the child ("You are too young"). Every
 * icon must be in PixIcon's MAP or it renders as a flat system emoji.
 *
 * Layout budget at the owner's 1414x771 window (HUD 64 + stage padding 40, so
 * the stage holds ~627px before it grows): header 29 + marginBottom 10 + board
 * 26 (padding and border) + eyebrow 22 + arch 250 + gap 12 + ask row 20 + gap 8
 * + plates 104 + strip 28 + hint gap 8 = ~561px, so the arch and all three
 * plates are on screen without a scroll. At 400px the three plates fall into one
 * column and the arch keeps its full width, and nothing scrolls sideways.
 */

import { useEffect, useRef, useState, type CSSProperties } from "react";
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
// she reads is already on screen), same recipe as GlassCheck / LensCheck.
const AUDIO_ONLY_STYLE = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  pointerEvents: "none",
} as const;
// SPOKEN_GATE_MAX_MS is shared: see app/lib/gameEngine/spokenGate.ts.

/** The three plates on the shelf. Fixed in this order, every room, every play:
 *  they are a number line and the child is learning to read along it. */
export type AgePlate = "3" | "7" | "13";
const PLATES: AgePlate[] = ["3", "7", "13"];

export interface GalleryRoom {
  id: string;
  /** The friendly name over the arch. Read on screen, never spoken. */
  name: string;
  icon: string;
  /** What the child can SEE going on in there. Read on screen, never spoken. */
  inside: string;
  /** Spoken as the arch slides in. Never says the number. */
  readAloud: string;
  plate: AgePlate;
  /** SPOKEN on the right plate. Earns the number from the ROOM, never from the
   *  child's age. */
  why: string;
  /** SPOKEN on a wrong plate. */
  explanation: string;
}

export interface RopeLineProps {
  rooms: GalleryRoom[];
  introTitle?: string;
  introSubtitle?: string;
  introIcon?: string;
  /** Chrome, never spoken. */
  ropeLabel?: string;
  insideLabel?: string;
  shelfLabel?: string;
  askPrompt?: string;
  counterLabel?: string;
  completeTitle?: string;
  completeLine?: string;
  hints?: { tier1: string; tier2: string };
  introNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  coachLines?: { speaker?: "adam" | "layla"; lines: string[] };
  threat?: { raccoonLine: string };
  completeNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  onComplete: (score: number) => void;
  onCorrect?: () => void;
  onWrong?: () => void;
  onHintReached?: (tier: 1 | 2 | 3) => void;
  onAnswered?: (o: { questionKey: string; selectedIndex: number; correctIndex: number; wasCorrect: boolean }) => void;
}

/** Fixed chrome copy the props do not cover (never spoken, so it can safely
 *  live here). Warm on purpose: a number on a room is not a telling-off. */
const CALL_TOAST = "PLATE ON!";
const WRONG_TITLE = "Have another look in that room";
const EMPTY_ROOMS: GalleryRoom[] = [];

const KID_FONT = "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif";
const LABEL_FONT = "'Space Grotesk', sans-serif";

/** Geometry (px). */
const ARCH_W = 366;
const ARCH_H = 186;
const PLATE_MIN_H = 104;
const PLATE_MIN_W = 150;

/** Paints. A warm lit gallery against the week's cool feed-blue chrome: the
 *  brass plates are the brightest thing on the board because the plates are
 *  what the child came to put on. */
const HALL = "linear-gradient(180deg, #2b2450 0%, #1f1a3e 60%, #171331 100%)";
const ROOM_GLOW = "radial-gradient(120% 90% at 50% 18%, #fff3d4 0%, #f3ddb0 44%, #d9bd86 100%)";
const ARCH_EDGE = "#c9a85f";
const BRASS = "linear-gradient(180deg, #f6e2a8 0%, #d9b866 52%, #b8934a 100%)";
const BRASS_EDGE = "#8a6c33";
const INK = "#2c2213";
const ROPE_RED = "#9c2f3d";
const RIGHT_GREEN = "#16a34a";

export default function RopeLine({
  rooms,
  introTitle = "The Number on the Room",
  introSubtitle = "Every room in the gallery wears a number. Look inside, then put the right one on the stand.",
  introIcon = "🔢",
  ropeLabel = "OVER THE ROPE",
  insideLabel = "WHAT GOES ON IN THERE",
  shelfLabel = "THE PLATES ON THE SHELF",
  askPrompt = "Which number belongs on this room?",
  counterLabel = "Room",
  completeTitle = "Every room labelled!",
  completeLine = "The number was never about you, Cyber Hero. It was always about the room.",
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
}: RopeLineProps) {
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
  // Read-aloud chain: the how-to once as the gallery opens, then each room's
  // line as its arch slides in. Taps are held while she speaks.
  const [narr, setNarr] = useState<"howto" | "read" | "idle">("idle");
  const [placed, setPlaced] = useState<AgePlate | null>(null);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [roomWrongs, setRoomWrongs] = useState(0);
  const [totalWrongs, setTotalWrongs] = useState(0);

  // The ROOMS are shuffled every play; the three plates below never are.
  const deck = useShuffledOnce(rooms ?? EMPTY_ROOMS, { key: "rope-line" });
  const finished = idx >= deck.length;
  const room = deck[idx];
  const settled = placed !== null;
  // Room 1 teaches the mechanic only: all three plates breathe together, so the
  // glow can never point at one of them.
  const guided = idx === 0;

  const verdict = useVerdictVoice(voice);
  const speaking = narr !== "idle" || verdict.speaking || !!feedback || settled;
  // `speaking` only closes once React has re-rendered, so a quick second tap
  // landed inside that window and restarted the verdict, cutting Sarah off
  // mid-sentence (the Week 12 bug). This latch shuts the plates synchronously.
  const handlingRef = useRef(false);

  // Safety releases for the spoken gate (never leave the gallery held).
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
    handlingRef.current = false;
    setIdx((i) => i + 1);
    setPlaced(null);
    setRoomWrongs(0);
    setNarr(isAudioMuted() ? "idle" : "read");
  };

  /* ───────── THE CALL: putting a plate on the stand ───────── */
  const place = (choice: AgePlate) => {
    if (!room || speaking || settled) return;
    if (handlingRef.current) return;
    handlingRef.current = true;
    const right = choice === room.plate;
    onAnswered?.({
      questionKey: `ropeline-${room.id}`,
      // The plates are FIXED: 3 is 0, 7 is 1, 13 is 2, on every room and every
      // play, so the dashboard always reads the same numbers.
      selectedIndex: PLATES.indexOf(choice),
      correctIndex: PLATES.indexOf(room.plate),
      wasCorrect: right,
    });
    if (right) {
      audio.select();
      fx.correct({ xp: 25, text: CALL_TOAST });
      onCorrect?.();
      setPlaced(choice);
      // Sarah: "That's right!" + this room's why, then the next arch slides in.
      // Moving on from her callback is what keeps a payoff from ever cutting
      // her off.
      verdict.say("right", room.why, () => {
        window.setTimeout(advance, reduce ? 250 : 1000);
      });
    } else {
      audio.wrong();
      onWrong?.();
      setTotalWrongs((n) => n + 1);
      const rw = roomWrongs + 1;
      setRoomWrongs(rw);
      // WrongAnswerPanel speaks "Not quite." + this teach line itself; the room
      // stays exactly where it is and all three plates stay on the shelf, so
      // the next go is one tap.
      setFeedback({ title: WRONG_TITLE, explanation: room.explanation, tip: rw >= 2 ? hints?.tier2 : hints?.tier1 });
      handlingRef.current = false;
    }
  };

  const stars = totalWrongs === 0 ? 3 : totalWrongs <= 2 ? 2 : 1;
  const hintText = roomWrongs >= 2 ? hints?.tier2 : roomWrongs === 1 ? hints?.tier1 : undefined;
  const hintTier = (roomWrongs >= 2 ? 2 : 1) as 1 | 2;
  const guideStyle = (on: boolean): CSSProperties =>
    on
      ? { boxShadow: `0 0 0 3px ${accent}66, 0 0 22px ${accent}88`, animation: reduce ? undefined : "rlGuide 1.4s ease-in-out infinite" }
      : {};
  const strip = settled
    ? "Plate on. The next room is coming"
    : roomWrongs > 0
      ? "Have another think. What is actually GOING ON in there?"
      : guided
        ? "Room 1: look over the rope, then pick one of the three plates"
        : "Look over the rope, then pick the plate that fits the room";

  const eyebrowStyle: CSSProperties = {
    fontFamily: LABEL_FONT,
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: accent,
  };

  /* ───────── A plate on the shelf ───────── */
  const renderPlate = (p: AgePlate) => {
    const chosen = placed === p;
    const glow = guided && !settled && !feedback && narr === "idle";
    return (
      <motion.button
        key={p}
        type="button"
        aria-label={`${p} plus`}
        onClick={() => place(p)}
        disabled={speaking}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.24 }}
        whileTap={speaking || reduce ? undefined : { scale: 0.97 }}
        style={{
          position: "relative",
          flex: `1 1 ${PLATE_MIN_W}px`,
          minWidth: 0,
          minHeight: PLATE_MIN_H,
          padding: "12px 12px",
          borderRadius: 14,
          // All three plates wear the same brass, size and ink on every room:
          // only their own number tells them apart, never the room on screen.
          background: BRASS,
          border: `3px solid ${chosen ? RIGHT_GREEN : "#fff4d6"}`,
          boxShadow: chosen
            ? `0 0 20px ${RIGHT_GREEN}80, inset 0 0 0 2px rgba(44,34,19,0.18)`
            : "0 10px 20px -12px rgba(0,0,0,0.85), inset 0 0 0 2px rgba(44,34,19,0.16)",
          color: INK,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          fontFamily: KID_FONT,
          cursor: speaking ? "wait" : "pointer",
          touchAction: "manipulation",
          transition: "border-color 200ms ease, box-shadow 200ms ease",
          ...guideStyle(glow),
        }}
      >
        <span style={{ fontSize: 34, fontWeight: 900, lineHeight: 1 }}>
          {p}
          <span style={{ fontSize: 22 }}>+</span>
        </span>
        <span style={{ fontFamily: LABEL_FONT, fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.72 }}>
          and over
        </span>
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
    <ExerciseFrame maxWidth={880} decor>
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

      {/* Sarah's read-alouds (audio only): the how-to once, then each room as
          its arch slides in. Gated on !showIntro, always: a board line that
          starts while the intro card is still open clobbers the intro's own
          clip and the "I'm ready" button never appears (the SignBingo /
          SenderLineup bug). Every line comes from the week file. */}
      {!showIntro && !finished && room && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="rl-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent={accent} recordedOnly onDone={() => setNarr("read")} />
          )}
          {narr === "read" && (
            <InfoNarration key={`rl-read-${room.id}`} speaker={voice} lines={[room.readAloud]} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
        </div>
      )}

      {!showIntro && !finished && room && (
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Side padding keeps the header clear of the frame's corner ornaments. */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "2px 22px 0" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: accent }}>
              <PixIcon emoji={introIcon} size={16} />
              {introTitle}
            </span>
            <span style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c9b8ff" }}>
              {counterLabel} {Math.min(idx + 1, deck.length)} of {deck.length}
            </span>
          </div>

          {/* The board: the hall, the arch in it, and the shelf of plates.
              Inset 22px so it never collides with the frame's rounded corners. */}
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
            <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 6, minHeight: 18, ...eyebrowStyle }}>
              <PixIcon emoji="👀" size={16} />
              <span>{ropeLabel}</span>
              <span style={{ marginLeft: "auto", color: "rgba(255,247,230,0.65)" }}>
                {Math.min(idx + (settled ? 1 : 0), deck.length)} of {deck.length} labelled
              </span>
            </div>

            {/* THE HALL. One arch at a time, rope and all. */}
            <div
              style={{
                width: "100%",
                borderRadius: 16,
                background: HALL,
                border: "1.5px solid rgba(255,247,230,0.18)",
                padding: "12px 10px 14px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                overflow: "hidden",
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={room.id}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, x: 58 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduce ? { opacity: 0, transition: { duration: 0.12 } } : { opacity: 0, x: -44, transition: { duration: 0.16 } }}
                  transition={{ duration: 0.32 }}
                  style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}
                >
                  {/* THE ARCH: the lit room, seen over the rope. The name over
                      it never gives the number away, which is exactly how a
                      friendly app name works in real life. */}
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      maxWidth: ARCH_W,
                      minHeight: ARCH_H,
                      borderRadius: "140px 140px 12px 12px",
                      background: ROOM_GLOW,
                      border: `5px solid ${ARCH_EDGE}`,
                      boxShadow: "0 18px 34px -18px rgba(0,0,0,0.95), inset 0 0 0 2px rgba(255,255,255,0.45)",
                      padding: "20px 20px 26px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      gap: 8,
                      overflow: "hidden",
                    }}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: KID_FONT, fontSize: 16, fontWeight: 900, color: INK, textAlign: "center", overflowWrap: "anywhere" }}>
                      <PixIcon emoji={room.icon} size={26} />
                      <span>{room.name}</span>
                    </span>
                    <span style={{ fontFamily: LABEL_FONT, fontSize: 9.5, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(44,34,19,0.62)" }}>
                      {insideLabel}
                    </span>
                    <span style={{ fontFamily: KID_FONT, fontSize: 14.5, fontWeight: 700, lineHeight: 1.32, color: INK, textAlign: "center", overflowWrap: "anywhere" }}>
                      {room.inside}
                    </span>

                    {/* THE ROPE across the arch, and the empty stand under it.
                        Same rope, same stand, same place, every single room. */}
                    <span aria-hidden style={{ position: "absolute", left: 0, right: 0, bottom: 34, height: 9, background: `linear-gradient(180deg, #c2495a 0%, ${ROPE_RED} 100%)`, borderRadius: 999, boxShadow: "0 3px 6px rgba(0,0,0,0.35)" }} />
                    <span
                      aria-hidden
                      style={{
                        position: "absolute",
                        left: "50%",
                        bottom: 4,
                        transform: "translateX(-50%)",
                        width: 74,
                        height: 26,
                        borderRadius: 6,
                        background: settled ? BRASS : "linear-gradient(180deg, #6f6350 0%, #4d4437 100%)",
                        border: `2px solid ${settled ? BRASS_EDGE : "#3a3327"}`,
                        display: "grid",
                        placeItems: "center",
                        fontFamily: KID_FONT,
                        fontSize: 15,
                        fontWeight: 900,
                        color: settled ? INK : "rgba(255,247,230,0.35)",
                        boxShadow: "0 4px 10px -4px rgba(0,0,0,0.8)",
                        transition: "background 260ms ease, color 260ms ease",
                      }}
                    >
                      {settled ? `${placed}+` : "?"}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ ...eyebrowStyle, minHeight: 14, display: "flex", alignItems: "center", gap: 6, textAlign: "center" }}>
                <PixIcon emoji="❓" size={16} />
                {askPrompt}
              </div>
              {/* The three plates never move: 3, 7, 13, every room, every play.
                  They are a number line, and a number line that shuffles is
                  not one. */}
              <div
                role="group"
                aria-label={shelfLabel}
                style={{ width: "100%", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}
              >
                {PLATES.map(renderPlate)}
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
            @keyframes rlGuide { 0%,100% { box-shadow: 0 0 0 3px ${accent}55, 0 0 16px ${accent}77 } 50% { box-shadow: 0 0 0 6px ${accent}22, 0 0 28px ${accent} } }
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
            `${deck.length} room${deck.length === 1 ? "" : "s"} read and labelled, every number earned from what was inside`,
            completeLine,
          ]}
          narration={completeNarration}
          onContinue={() => onComplete(stars === 3 ? 100 : stars === 2 ? 70 : 40)}
        />
      )}
    </ExerciseFrame>
  );
}
