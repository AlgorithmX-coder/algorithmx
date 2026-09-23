"use client";

/**
 * GlassCheck: the READ IT OR ADMIT YOU CANNOT drill (Week 16, "Clear Glass,
 * Frosted Glass").
 *
 * The Doorway Maze has a corridor of doors, and they come to the child one at a
 * time. Every door carries a sign promising where it goes, and every door has a
 * pane of glass in it. Some panes are CLEAR: the address is written right there
 * and the child can read it, all of it, before deciding anything. Some panes are
 * FROSTED: there is something behind the glass, but it is a pattern, not words,
 * and no amount of staring turns it into an address. That is a QR code, exactly
 * as it is: a link with the writing taken off it.
 *
 * So the child's job is not "is this good or bad". It is "what does THIS door
 * need of me?" A clear pane can be read and judged on the spot: walk through, or
 * not this one. A frosted pane needs a grown-up, every single time, no matter
 * how friendly the sign around it is, because the child has not been given the
 * thing a decision is made of. The whole lesson is that "I can't read this" is a
 * correct and complete answer, and saying it is the win, not a shrug.
 *
 * Verb: READ THE PANE, OR ADMIT YOU CANNOT. No other engine in the library asks
 * a child to notice that the evidence itself is missing. It is NOT a read-a-
 * situation-tap-one-of-three-cards game (Track Back, the Drill Run, Who Would
 * Know, the Trail Planner, the Day Jug and the Speaker Diary are): the three
 * buttons here are not cards about a story, they never move, they mean the same
 * thing on every door, and the thing being judged is a piece of glass in front
 * of the child, not a sentence about somebody else's afternoon. It is NOT a
 * compare-two-pictures-and-spot-the-change game (Lens Check is, and it shipped
 * in Week 14): one door, one pane, nothing to compare it with. It is NOT a
 * spot-the-one-difference-in-a-lookalike game (Week 4's sender line-up and Week
 * 9's whisker count are): the doors are not versions of one another, and on a
 * frosted door there is no difference to find at all, which is the point. It is
 * NOT a two-bin sort (Hook Sort is): nothing is carried anywhere, and the third
 * answer is not a bin, it is an admission. It is NOT a hunt among decoy controls
 * (Button Hunt and the Power Panel are): the three answers are never hidden,
 * never disguised and never shuffled, and no tap is a trap.
 *
 * Every door is built to the same recipe: the same frame, the same slab, the
 * same pane in the same place, the same sign board over it. The only thing that
 * differs is what is written on the glass, or that nothing is. The sign never
 * tells the child the answer either: a lovely sign sits over a frosted pane as
 * happily as over a clear one, which is how the trick actually works.
 *
 * Nothing races the child: tap-only, untimed, no lose state, and a wrong call
 * costs nothing beyond Sarah explaining what that door was really asking for.
 *
 * Learn-Loop wiring: Raccoon boast in the intro (`threat`), Sarah's how-to once
 * and every door's `readAloud` spoken as the door slides in (audio-only,
 * `recordedOnly`, taps held, released by the shared SPOKEN_GATE_MAX_MS), a
 * one-take spoken verdict on the call ("That's right!" + that door's `why` via
 * VerdictVoice; a wrong call: WrongAnswerPanel speaks "Not quite." + that door's
 * `explanation`), hint tiers per door, and a payoff on the complete beat gated
 * on `!verdict.speaking` so it can never cut Sarah off. The next door slides in
 * from the verdict's own callback, so no payoff can cut her off either. A
 * synchronous ref latch shuts all three answers the instant one is pressed,
 * because `canTap` only closes once React re-renders on `verdict.speaking` and a
 * quick second tap would otherwise restart the verdict and cut Sarah off (the
 * real Week 12 bug).
 *
 * The DOORS are shuffled every play. The three answers are FIXED in place, walk
 * then stop then grown-up, on every door and every play, because the child is
 * learning where "ask a grown-up" lives and the answer is never in the order.
 * Door 1 guides the MECHANIC only: all three answers breathe together, so the
 * glow says "one of these three", never which one.
 *
 * CRITICAL for the week author: every spoken string arrives through props
 * (`introNarration`, `coachLines`, `threat`, each door's `readAloud`, its `why`
 * and `explanation`, `hints`, `completeNarration`). The clip generator reads the
 * WEEK FILE, so anything left to a component default is never recorded and plays
 * as silence, with no error anywhere. `sign` and `pane` are READ ON SCREEN,
 * never spoken: put the spoken sentence in `readAloud`, and never read the
 * address out loud in it (a child who is told the address has not read the
 * pane). `why` is spoken ONLY when the call is right and `explanation` ONLY when
 * it is wrong, so a line in the wrong field is silent even though the field is
 * full.
 *
 * Authoring: five doors reads best (four to six works), and every set needs at
 * least one of each answer: a clear pane whose address matches its sign
 * (`walk`), a clear pane whose address plainly does not (`stop`), and at least
 * two frosted panes (`pane: ""`). A FROSTED PANE'S ONLY CORRECT VERDICT IS
 * `grown-up`; authoring `walk` or `stop` on an empty pane teaches the opposite
 * of the concept, because there was nothing there to judge. Keep `sign` to about
 * 34 characters, `pane` to about 40 (it is an address, so write it as one, all
 * lower case, no spaces), and `readAloud`, `why` and `explanation` to one
 * kid-sized sentence each. Every icon must be in PixIcon's MAP or it renders as
 * a flat system emoji.
 *
 * Layout budget at the owner's 1414x771 window (HUD 64 + stage padding 40, so
 * the stage holds ~627px before it grows): header 29 + marginBottom 10 + board
 * 26 (padding and border) + eyebrow 22 + sign 46 + door 252 + gap 12 + ask row
 * 20 + gap 8 + answers 100 + strip 28 + hint gap 8 = ~561px, so the sign, the
 * pane and all three answers are on screen without a scroll. At 400px the three
 * answers fall into one column and the door keeps its full width, and nothing
 * scrolls sideways.
 */

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
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
// she reads is already on screen), same recipe as LensCheck / SpeakerDiary.
const AUDIO_ONLY_STYLE = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  pointerEvents: "none",
} as const;
// SPOKEN_GATE_MAX_MS is shared: see app/lib/gameEngine/spokenGate.ts.

export interface GlassDoor {
  id: string;
  sign: string;             // what the poster around it promises
  icon: string;
  readAloud: string;        // spoken as the door slides in
  pane: string;             // the address on a clear pane; EMPTY STRING = frosted
  verdict: "walk" | "stop" | "grown-up";
  why: string;
  explanation: string;
}
export interface GlassCheckProps {
  doors: GlassDoor[];
  introTitle?: string; introSubtitle?: string; introIcon?: string;
  clearLabel?: string;      // default "CLEAR PANE"
  frostedLabel?: string;    // default "FROSTED PANE"
  walkLabel?: string;       // default "SAFE TO WALK"
  stopLabel?: string;       // default "NOT THIS ONE"
  grownUpLabel?: string;    // default "ASK A GROWN-UP"
  askPrompt?: string;       // default "What does this door need?"
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

type DoorVerdict = GlassDoor["verdict"];

/** The three answers, FIXED in this order on every door and every play: the
 *  child is learning where they live. Never shuffled, never re-ordered. */
const VERDICTS: DoorVerdict[] = ["walk", "stop", "grown-up"];

/** Fixed chrome copy the props above do not cover (never spoken, so it can
 *  safely live here). Calm on purpose: a door you cannot read is not a scare,
 *  it is simply a door with a grown-up shaped lock on it. */
const CALL_TOAST = "DOOR CHECKED!";
const WRONG_TITLE = "Have another look at that pane";
const FROSTED_NOTE = "A pattern, not words. There is nothing here to read.";
const SIGN_EYEBROW = "THE SIGN SAYS";
const ANSWER_EYEBROW = "WHAT THIS DOOR NEEDS";

const EMPTY_DOORS: GlassDoor[] = [];
const KID_FONT = "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif";
const LABEL_FONT = "'Space Grotesk', sans-serif";
const CODE_FONT = "'Space Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
/** Geometry (px). */
const DOOR_W = 244;
const DOOR_H = 252;
const PANE_H = 118;
const ANSWER_MIN_H = 100;
const ANSWER_MIN_W = 186;
/** Paints. A pale door in a dark corridor: a tappable thing is never painted on
 *  a ground anywhere near its own shade, and the glass is the brightest thing
 *  on the board because the glass is what the child came to read. */
const CORRIDOR = "linear-gradient(180deg, #241f4a 0%, #191541 58%, #14102f 100%)";
const DOOR_SLAB = "linear-gradient(180deg, #e8dcc6 0%, #d8c8ac 100%)";
const DOOR_EDGE = "#8f7a58";
const PAPER = "#fff6e8";
const INK = "#2a1f18";
const GLASS_CLEAR = "linear-gradient(180deg, #ffffff 0%, #eef8ff 100%)";
const GLASS_FROST = "linear-gradient(180deg, #dce9f4 0%, #c6d8e8 100%)";
const WALK_GREEN = "#16a34a";
const STOP_RED = "#d8705f";
const GROWN_BLUE = "#2d6ea8";
const RIGHT_GREEN = "#16a34a";

/** A deterministic little code pattern, so a door looks the same on the server
 *  and on the client (a random one would trip hydration). It is the thing
 *  behind a frosted pane: something is there, and none of it is words. */
const patternFor = (seed: string, n: number): boolean[] => {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  const out: boolean[] = [];
  for (let i = 0; i < n * n; i++) {
    h = (Math.imul(h, 1664525) + 1013904223) >>> 0;
    out.push(((h >>> 17) & 1) === 1);
  }
  return out;
};

export default function GlassCheck({
  doors,
  introTitle = "Clear Glass, Frosted Glass",
  introSubtitle = "Some doors let you read where they go. Some do not. Both are fine to meet.",
  introIcon = "🚪",
  clearLabel = "CLEAR PANE",
  frostedLabel = "FROSTED PANE",
  walkLabel = "SAFE TO WALK",
  stopLabel = "NOT THIS ONE",
  grownUpLabel = "ASK A GROWN-UP",
  askPrompt = "What does this door need?",
  completeTitle = "Corridor checked!",
  completeLine = "You can read a link, Cyber Hero. You cannot read a code, and saying so is the right answer.",
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
}: GlassCheckProps) {
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
  // Read-aloud chain: the how-to once as the corridor opens, then each door's
  // line as it slides in. Taps are held while she speaks.
  const [narr, setNarr] = useState<"howto" | "read" | "idle">("idle");
  // The answer given, once it was the right one.
  const [called, setCalled] = useState<DoorVerdict | null>(null);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [doorWrongs, setDoorWrongs] = useState(0);
  const [totalWrongs, setTotalWrongs] = useState(0);

  // The DOORS are shuffled every play; the three answers below never are.
  const deck = useShuffledOnce(doors ?? EMPTY_DOORS, { key: "glass-check" });
  const finished = idx >= deck.length;
  const door = deck[idx];
  const settled = called !== null;
  // A pane with nothing written on it is frosted: that is the whole signal, and
  // its only right answer is the grown-up.
  const frosted = !door || door.pane.trim() === "";
  // Door 1 teaches the mechanic only: all three answers breathe together, so
  // the glow can never point at one of them.
  const guided = idx === 0;

  // What is behind a frosted pane: something, and not one word of it.
  const shape = useMemo(() => patternFor(door?.id ?? "none", 9), [door?.id]);

  // Spoken verdicts: Sarah says "That's right!" + why, and the next door waits
  // for her. A wrong call speaks through WrongAnswerPanel.
  const verdict = useVerdictVoice(voice);
  const speaking = narr !== "idle" || verdict.speaking || !!feedback || settled;
  // `speaking` only closes once React has re-rendered, so a quick second tap
  // landed inside that window and restarted the verdict, cutting Sarah off
  // mid-sentence (the Week 12 bug). This latch shuts the answers synchronously.
  const handlingRef = useRef(false);

  // Safety releases for the spoken gate (never leave the corridor held).
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
    // The how-to first if there is one, then the first door reads itself out.
    setNarr(isAudioMuted() ? "idle" : coachLines ? "howto" : "read");
  };

  const advance = () => {
    handlingRef.current = false;
    setIdx((i) => i + 1);
    setCalled(null);
    setDoorWrongs(0);
    setNarr(isAudioMuted() ? "idle" : "read");
  };

  /* ───────── THE CALL: the only judged tap of the door ───────── */
  const call = (choice: DoorVerdict) => {
    if (!door || speaking || settled) return;
    if (handlingRef.current) return;
    handlingRef.current = true;
    const right = choice === door.verdict;
    onAnswered?.({
      questionKey: `glasscheck-${door.id}`,
      // The three answers are FIXED: walk is 0, stop is 1, grown-up is 2, on
      // every door and every play, so the dashboard always reads the same
      // numbers.
      selectedIndex: VERDICTS.indexOf(choice),
      correctIndex: VERDICTS.indexOf(door.verdict),
      wasCorrect: right,
    });
    if (right) {
      audio.select();
      fx.correct({ xp: 25, text: CALL_TOAST });
      onCorrect?.();
      setCalled(choice);
      // Sarah: "That's right!" + this door's why, then the next door slides in.
      // Moving on from her callback is what keeps a payoff from ever cutting
      // her off.
      verdict.say("right", door.why, () => {
        window.setTimeout(advance, reduce ? 250 : 1000);
      });
    } else {
      audio.wrong();
      onWrong?.();
      setTotalWrongs((n) => n + 1);
      const dw = doorWrongs + 1;
      setDoorWrongs(dw);
      // WrongAnswerPanel speaks "Not quite." + this teach line itself; the door
      // stays exactly where it is and all three answers stay out, so the next
      // go is one tap.
      setFeedback({ title: WRONG_TITLE, explanation: door.explanation, tip: dw >= 2 ? hints?.tier2 : hints?.tier1 });
      handlingRef.current = false;
    }
  };

  const stars = totalWrongs === 0 ? 3 : totalWrongs <= 2 ? 2 : 1;
  const hintText = doorWrongs >= 2 ? hints?.tier2 : doorWrongs === 1 ? hints?.tier1 : undefined;
  const hintTier = (doorWrongs >= 2 ? 2 : 1) as 1 | 2;
  const guideStyle = (on: boolean): CSSProperties =>
    on
      ? { boxShadow: `0 0 0 3px ${accent}66, 0 0 22px ${accent}88`, animation: reduce ? undefined : "gcGuide 1.4s ease-in-out infinite" }
      : {};
  const strip = settled
    ? "Called it. The next door is coming"
    : doorWrongs > 0
      ? "Have another think. Can you READ this pane, or not?"
      : guided
        ? "Door 1: look at the pane, then pick one of the three"
        : "Look at the pane, then pick what this door needs";

  const eyebrowStyle: CSSProperties = {
    fontFamily: LABEL_FONT,
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: accent,
  };

  const answerFace = (v: DoorVerdict): { label: string; icon: string; tint: string } =>
    v === "walk"
      ? { label: walkLabel, icon: "👍", tint: WALK_GREEN }
      : v === "stop"
        ? { label: stopLabel, icon: "✋", tint: STOP_RED }
        : { label: grownUpLabel, icon: "👪", tint: GROWN_BLUE };

  /* ───────── The pane: the whole game, in one piece of glass ───────── */
  const paneBlock = (): ReactNode => {
    if (!door) return null;
    const tagTint = frosted ? GROWN_BLUE : "#1d4e74";
    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          minHeight: PANE_H,
          borderRadius: 10,
          background: frosted ? GLASS_FROST : GLASS_CLEAR,
          border: `3px solid ${DOOR_EDGE}`,
          boxShadow: "inset 0 2px 10px rgba(0,0,0,0.22)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
          padding: "10px 10px 8px",
        }}
      >
        {frosted ? (
          <>
            {/* Something IS behind the glass. It is simply not words, and no
                amount of looking will make it any. */}
            <span
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                display: "grid",
                placeItems: "center",
                filter: "blur(3.4px)",
                opacity: 0.55,
              }}
            >
              <span
                style={{
                  width: 74,
                  height: 74,
                  display: "grid",
                  gridTemplateColumns: "repeat(9, 1fr)",
                  gridTemplateRows: "repeat(9, 1fr)",
                  gap: 1,
                }}
              >
                {shape.map((on, i) => (
                  <span key={i} style={{ background: on ? "#2b3d52" : "transparent", borderRadius: 1 }} />
                ))}
              </span>
            </span>
            {/* The etched frosting itself, so the pane reads as glass rather
                than as a broken picture. */}
            <span
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                background: "repeating-linear-gradient(135deg, rgba(255,255,255,0.55) 0px, rgba(255,255,255,0.55) 5px, rgba(255,255,255,0.16) 5px, rgba(255,255,255,0.16) 11px)",
              }}
            />
            <span
              style={{
                position: "relative",
                maxWidth: "100%",
                fontFamily: KID_FONT,
                fontSize: 13,
                fontWeight: 800,
                lineHeight: 1.3,
                color: "#233549",
                textAlign: "center",
                overflowWrap: "anywhere",
              }}
            >
              {FROSTED_NOTE}
            </span>
          </>
        ) : (
          <span
            style={{
              position: "relative",
              maxWidth: "100%",
              fontFamily: CODE_FONT,
              fontSize: 15,
              fontWeight: 700,
              lineHeight: 1.35,
              color: INK,
              textAlign: "center",
              wordBreak: "break-all",
            }}
          >
            {door.pane}
          </span>
        )}

        {/* The pane's own label. It names what KIND of glass this is, which is
            the thing the child is being taught to notice, and it is the same
            two words on every door of that kind. */}
        <span
          style={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "3px 9px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.8)",
            border: `2px solid ${tagTint}`,
            color: tagTint,
            fontFamily: LABEL_FONT,
            fontSize: 9.5,
            fontWeight: 900,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          <PixIcon emoji={frosted ? "🌀" : "👀"} size={14} />
          {frosted ? frostedLabel : clearLabel}
        </span>
      </div>
    );
  };

  /* ───────── One answer. Same paper, size and ink, all three ───────── */
  const renderAnswer = (v: DoorVerdict): ReactNode => {
    const { label, icon, tint } = answerFace(v);
    const chosen = called === v;
    const glow = guided && !settled && !speaking;
    return (
      <motion.button
        key={v}
        type="button"
        aria-label={label}
        onClick={() => call(v)}
        disabled={speaking}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.24 }}
        whileTap={speaking || reduce ? undefined : { scale: 0.97 }}
        style={{
          position: "relative",
          flex: `1 1 ${ANSWER_MIN_W}px`,
          minWidth: 0,
          minHeight: ANSWER_MIN_H,
          padding: "10px 12px",
          borderRadius: 14,
          // All three answers wear the same paper, size and ink on every door:
          // only their own fixed meaning tells them apart, never the door.
          background: PAPER,
          border: `3px solid ${chosen ? RIGHT_GREEN : "#ffffff"}`,
          boxShadow: chosen
            ? `0 0 20px ${RIGHT_GREEN}80, inset 0 0 0 2px rgba(42,31,24,0.16)`
            : "0 10px 20px -12px rgba(0,0,0,0.85), inset 0 0 0 2px rgba(42,31,24,0.14)",
          color: INK,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          fontFamily: KID_FONT,
          fontSize: 14.5,
          fontWeight: 800,
          lineHeight: 1.2,
          textAlign: "center",
          cursor: speaking ? "wait" : "pointer",
          touchAction: "manipulation",
          transition: "border-color 200ms ease, box-shadow 200ms ease",
          ...guideStyle(glow),
        }}
      >
        {/* A colour band per answer, in the same place on all three: it is a
            landmark for a six year old who is learning where they live, and it
            says nothing whatever about the door on screen. */}
        <span aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, borderRadius: "11px 11px 0 0", background: tint }} />
        <PixIcon emoji={icon} size={30} />
        <span style={{ overflowWrap: "anywhere" }}>{label}</span>
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

      {/* Sarah's read-alouds (audio only): the how-to once, then each door as it
          slides in. Gated on !showIntro, always: a board line that starts while
          the intro card is still open clobbers the intro's own clip and the
          "I'm ready" button never appears (the SignBingo / SenderLineup bug).
          Every line comes from the week file. */}
      {!showIntro && !finished && door && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="gc-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent={accent} recordedOnly onDone={() => setNarr("read")} />
          )}
          {narr === "read" && (
            <InfoNarration key={`gc-read-${door.id}`} speaker={voice} lines={[door.readAloud]} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
        </div>
      )}

      {!showIntro && !finished && door && (
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Side padding keeps the header clear of the frame's corner ornaments. */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "2px 22px 0" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: accent }}>
              <PixIcon emoji={introIcon} size={16} />
              {introTitle}
            </span>
            <span style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c9b8ff" }}>
              Door {Math.min(idx + 1, deck.length)} of {deck.length}
            </span>
          </div>

          {/* The board: the corridor, the door in it, and the three answers.
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
              <PixIcon emoji="🚪" size={16} />
              <span>{SIGN_EYEBROW}</span>
              <span style={{ marginLeft: "auto", color: "rgba(255,247,230,0.65)" }}>
                {Math.min(idx + (settled ? 1 : 0), deck.length)} of {deck.length} checked
              </span>
            </div>

            {/* THE CORRIDOR. One door at a time slides in, sign and all. */}
            <div
              style={{
                width: "100%",
                borderRadius: 16,
                background: CORRIDOR,
                border: "1.5px solid rgba(255,247,230,0.18)",
                padding: "12px 10px 16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                overflow: "hidden",
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={door.id}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, x: 58 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduce ? { opacity: 0, transition: { duration: 0.12 } } : { opacity: 0, x: -44, transition: { duration: 0.16 } }}
                  transition={{ duration: 0.32 }}
                  style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}
                >
                  {/* THE SIGN over the door: what it promises. A lovely sign
                      sits over a frosted pane exactly as happily as over a
                      clear one, which is how the trick works in real life. */}
                  <div
                    style={{
                      maxWidth: 420,
                      minHeight: 40,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 9,
                      padding: "8px 14px",
                      borderRadius: 10,
                      background: PAPER,
                      border: "2px solid #ffffff",
                      boxShadow: "0 10px 20px -12px rgba(0,0,0,0.9)",
                      color: INK,
                      fontFamily: KID_FONT,
                      fontSize: 15.5,
                      fontWeight: 900,
                      lineHeight: 1.25,
                      textAlign: "center",
                      overflowWrap: "anywhere",
                    }}
                  >
                    <PixIcon emoji={door.icon} size={26} />
                    <span>{door.sign}</span>
                  </div>

                  {/* THE DOOR. Same frame, same slab, same pane in the same
                      place, every single time. */}
                  <div
                    style={{
                      width: "100%",
                      maxWidth: DOOR_W,
                      minHeight: DOOR_H,
                      borderRadius: "14px 14px 6px 6px",
                      background: DOOR_SLAB,
                      border: `5px solid ${DOOR_EDGE}`,
                      boxShadow: "0 18px 34px -18px rgba(0,0,0,0.95), inset 0 0 0 2px rgba(255,255,255,0.4)",
                      padding: "14px 14px 16px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                    }}
                  >
                    {paneBlock()}
                    {/* The handle, so a slab with a window in it reads as a
                        door to a six year old. */}
                    <span aria-hidden style={{ width: "100%", display: "flex", justifyContent: "flex-end", alignItems: "center", paddingRight: 2 }}>
                      <span style={{ width: 30, height: 10, borderRadius: 999, background: "linear-gradient(180deg, #f3e6c8 0%, #b99a64 100%)", boxShadow: "0 2px 4px rgba(0,0,0,0.35)" }} />
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
              {/* The three answers never move: walk, stop, grown-up, every door,
                  every play, so the child learns where they live. */}
              <div
                role="group"
                aria-label={ANSWER_EYEBROW}
                style={{ width: "100%", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}
              >
                {VERDICTS.map(renderAnswer)}
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
            @keyframes gcGuide { 0%,100% { box-shadow: 0 0 0 3px ${accent}55, 0 0 16px ${accent}77 } 50% { box-shadow: 0 0 0 6px ${accent}22, 0 0 28px ${accent} } }
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
            `${deck.length} door${deck.length === 1 ? "" : "s"} checked, and every frosted pane got the grown-up it needed`,
            completeLine,
          ]}
          narration={completeNarration}
          onContinue={() => onComplete(stars === 3 ? 100 : stars === 2 ? 70 : 40)}
        />
      )}
    </ExerciseFrame>
  );
}
