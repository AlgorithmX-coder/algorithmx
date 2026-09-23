"use client";

/**
 * WhoseIsIt: the NAME THE OWNER drill (Week 18, "Other People's Things").
 *
 * A shared tablet is a shelf with everybody's things on it, and a child who is
 * about to poke at something never gets as far as "should I?" because they
 * never asked the question before it: WHOSE IS THIS? So that is the only
 * question this game asks. One thing at a time comes up on the shelf, open, and
 * the child taps the name tag of the person it belongs to. Get the owner right
 * and the lid takes care of itself: anybody else's closes, and their own stays
 * open with a cheerful go-ahead.
 *
 * Making the ANSWER be a person, rather than a yes or a no, is the whole design.
 * A right-or-wrong button teaches a child to judge a thing; a row of names
 * teaches them that there is somebody on the other end of it. That is what
 * respect actually is at this age, and it is why Sarah's reason on a correct
 * answer always names a FEELING ("Sam would go pink if he knew you had read
 * that") rather than a rule. Rules are for locks. This beat is about people.
 *
 * It is deliberately NOT a temptation game. Nothing here dares the child, tells
 * them nobody would know, or makes them refuse something they want: that frames
 * privacy as a test of willpower they might one day fail. Here it is simply a
 * fact about the shelf. Most things are not yours. That is all.
 *
 * Verb: NAME THE OWNER. Nothing else in the library answers with a person. It
 * is NOT a two-bin sort (Hook Sort is, this same week): nothing is carried and
 * there are more than two answers. It is NOT a judged good-or-bad call (the
 * Glass Check, the Frost Mirror are): no thing on this shelf is bad, and the
 * child's own thing is answered exactly the same way as everybody else's. It is
 * NOT a hunt among decoys (Button Hunt is, this same week): every name tag is a
 * real person and none of them is a trap. It is NOT the Log Out sweep (this
 * same week): nothing here is closed by the child at all, the lid follows from
 * the name.
 *
 * Nothing races the child: tap-only, untimed, no lose state, and a wrong name
 * costs nothing beyond Sarah saying who it actually belongs to.
 *
 * Learn-Loop wiring: Raccoon boast in the intro (`threat`) - though Week 18
 * keeps him OFF this beat, since it is an empathy beat (the W5 and W11
 * precedent) - Sarah's how-to once and each thing's `readAloud` as it comes up
 * (audio-only, `recordedOnly`, taps held, released by the shared
 * SPOKEN_GATE_MAX_MS), a one-take spoken verdict on the call ("That's right!" +
 * that thing's `why` via VerdictVoice; a wrong name: WrongAnswerPanel speaks
 * "Not quite." + its `explanation`), hint tiers, and a payoff on the complete
 * beat gated on `!verdict.speaking` so it can never cut Sarah off. The next
 * thing arrives from the verdict's own callback. A synchronous ref latch shuts
 * the name tags the instant one is pressed, because `canTap` only closes once
 * React re-renders on `verdict.speaking` and a quick second tap would otherwise
 * restart the verdict and cut Sarah off (the real Week 12 bug).
 *
 * The THINGS are shuffled every play. The NAME TAGS are not: they are the
 * household, they sit in the same order all game, and a child learning to look
 * for a person should find the same faces in the same places.
 *
 * CRITICAL for the week author: every spoken string arrives through props
 * (`introNarration`, `coachLines`, `threat`, each thing's `readAloud`, its
 * `why` and `explanation`, `hints`, `completeNarration`). The clip generator
 * reads the WEEK FILE, so anything left to a component default is never
 * recorded and plays as silence, with no error anywhere. Each thing's `label`
 * and `detail` are READ ON SCREEN, never spoken, and `detail` must never give
 * the owner away in words the tags also use.
 *
 * Authoring: five things reads best (four to six works), three or four owners,
 * and EXACTLY ONE owner carries `isChild`. At least one thing must belong to
 * the child, or the lesson collapses into "touch nothing", which is not true
 * and not the point. A `why` for somebody else's thing names what THEY would
 * feel; a `why` for the child's own says plainly that it is theirs and they can
 * get on with it. Keep `label` to about 18 characters and `detail` to about 44.
 * Every icon must be in PixIcon's MAP or it renders as a flat system emoji.
 *
 * Layout budget at the owner's 1414x771 window (HUD 64 + stage padding 40, so
 * the stage holds ~627px before it grows): header 29 + marginBottom 10 + board
 * 26 + eyebrow 22 + shelf 246 + gap 12 + ask row 20 + tags 96 + strip 28 + hint
 * gap 8 = ~497px, so the shelf and every name tag are on screen without a
 * scroll. At 400px the tags fall to two columns and nothing scrolls sideways.
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
// she reads is already on screen), same recipe as GlassCheck / FrostMirror.
const AUDIO_ONLY_STYLE = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  pointerEvents: "none",
} as const;
// SPOKEN_GATE_MAX_MS is shared: see app/lib/gameEngine/spokenGate.ts.

export interface ShelfOwner {
  id: string;
  /** The name on the tag. Read on screen, never spoken. */
  label: string;
  icon: string;
  /** EXACTLY ONE owner carries this: the child themselves. */
  isChild?: boolean;
}

export interface ShelfThing {
  id: string;
  /** What the thing is. Read on screen, never spoken. */
  label: string;
  /** The little line under it. Read on screen, never spoken, and it must never
   *  name the owner in the same words the tags use. */
  detail: string;
  icon: string;
  /** Read aloud as the thing comes up. Never says whose it is. */
  readAloud: string;
  /** Which owner it belongs to. */
  ownerId: string;
  /** SPOKEN on the right name. For somebody else's thing this must name what
   *  THEY would feel, never a rule. */
  why: string;
  /** SPOKEN on a wrong name. */
  explanation: string;
}

export interface WhoseIsItProps {
  things: ShelfThing[];
  owners: ShelfOwner[];
  introTitle?: string;
  introSubtitle?: string;
  introIcon?: string;
  /** Chrome, never spoken. */
  shelfLabel?: string;
  askPrompt?: string;
  tagsLabel?: string;
  counterLabel?: string;
  mineLabel?: string;
  theirsLabel?: string;
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

/** Fixed chrome copy the props do not cover (never spoken). */
const CALL_TOAST = "OWNER FOUND!";
const WRONG_TITLE = "Have another look at that one";
const EMPTY_THINGS: ShelfThing[] = [];
const EMPTY_OWNERS: ShelfOwner[] = [];

const KID_FONT = "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif";
const LABEL_FONT = "'Space Grotesk', sans-serif";

/** Geometry (px). */
const BOX_W = 320;
const BOX_H = 216;
const TAG_MIN_H = 96;
const TAG_MIN_W = 140;

/** Paints. A warm morning shelf: the open box is the brightest thing on the
 *  board, because the thing inside it is what the child came to look at. */
const ROOM = "linear-gradient(180deg, #33283f 0%, #261e31 60%, #1c1626 100%)";
const BOX_BODY = "linear-gradient(180deg, #d8b98c 0%, #b8925f 100%)";
const BOX_EDGE = "#7f6034";
const BOX_INSIDE = "linear-gradient(180deg, #fff8ec 0%, #f4e4c8 100%)";
const INK = "#2e2417";
const MINE_GREEN = "#2f8f5b";
const THEIRS_BLUE = "#4a6fa8";
const RIGHT_GREEN = "#16a34a";

export default function WhoseIsIt({
  things,
  owners,
  introTitle = "Other People's Things",
  introSubtitle = "A shared tablet is everybody's shelf. Before you touch anything, ask whose it is.",
  introIcon = "👪",
  shelfLabel = "ON THE SHARED SHELF",
  askPrompt = "Whose is this?",
  tagsLabel = "THE NAME TAGS",
  counterLabel = "Thing",
  mineLabel = "YOURS. GO AHEAD!",
  theirsLabel = "LID DOWN",
  completeTitle = "Shelf sorted!",
  completeLine = "Whose is this, Cyber Hero. Ask that first and the rest works itself out.",
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
}: WhoseIsItProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;
  const accent = useLessonTheme()?.accent ?? "#2b7fff";
  // Both content voices are Sarah; in-game read-alouds and verdict reasons are
  // recorded under "adam", so every manifest lookup here uses that key.
  const voice = "adam" as const;

  const [showIntro, setShowIntro] = useState(true);
  const [idx, setIdx] = useState(0);
  const [narr, setNarr] = useState<"howto" | "read" | "idle">("idle");
  /** The owner named, once it was the right one. */
  const [named, setNamed] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [thingWrongs, setThingWrongs] = useState(0);
  const [totalWrongs, setTotalWrongs] = useState(0);

  // The THINGS are shuffled every play. The NAME TAGS are not: they are the
  // household, and a child learning to look for a person should find the same
  // faces in the same places all game.
  const deck = useShuffledOnce(things ?? EMPTY_THINGS, { key: "whose-is-it" });
  const tags = owners ?? EMPTY_OWNERS;
  const finished = deck.length > 0 && idx >= deck.length;
  const thing = deck[idx];
  const settled = named !== null;
  const owner = thing ? tags.find((o) => o.id === thing.ownerId) : undefined;
  const isMine = !!owner?.isChild;
  // Thing 1 guides the MECHANIC only: every tag breathes together, so the glow
  // says "one of these people", never which one.
  const guided = idx === 0;

  const verdict = useVerdictVoice(voice);
  const speaking = narr !== "idle" || verdict.speaking || !!feedback || settled;
  const handlingRef = useRef(false);

  // Safety releases for the spoken gate (never leave the shelf held).
  useEffect(() => {
    if (narr === "idle") return;
    const id = window.setTimeout(() => setNarr("idle"), SPOKEN_GATE_MAX_MS);
    return () => window.clearTimeout(id);
  }, [narr]);
  useEffect(() => subscribeAudioMute((muted) => { if (muted) setNarr("idle"); }), []);

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
    setNamed(null);
    setThingWrongs(0);
    setNarr(isAudioMuted() ? "idle" : "read");
  };

  /* ───────── THE CALL: naming the owner ───────── */
  const name = (ownerId: string) => {
    if (!thing || speaking || settled) return;
    if (handlingRef.current) return;
    handlingRef.current = true;
    const right = ownerId === thing.ownerId;
    onAnswered?.({
      questionKey: `whoseisit-${thing.id}`,
      // The tags never shuffle, so their index means the same thing on every
      // play and the dashboard always reads the same numbers.
      selectedIndex: tags.findIndex((o) => o.id === ownerId),
      correctIndex: tags.findIndex((o) => o.id === thing.ownerId),
      wasCorrect: right,
    });
    if (right) {
      audio.select();
      fx.correct({ xp: 25, text: CALL_TOAST });
      onCorrect?.();
      setNamed(ownerId);
      // Sarah: "That's right!" + this thing's why, then the next thing comes up.
      verdict.say("right", thing.why, () => {
        window.setTimeout(advance, reduce ? 250 : 1100);
      });
    } else {
      audio.wrong();
      onWrong?.();
      setTotalWrongs((n) => n + 1);
      const tw = thingWrongs + 1;
      setThingWrongs(tw);
      setFeedback({ title: WRONG_TITLE, explanation: thing.explanation, tip: tw >= 2 ? hints?.tier2 : hints?.tier1 });
      handlingRef.current = false;
    }
  };

  const stars = totalWrongs === 0 ? 3 : totalWrongs <= 2 ? 2 : 1;
  const hintText = thingWrongs >= 2 ? hints?.tier2 : thingWrongs === 1 ? hints?.tier1 : undefined;
  const hintTier = (thingWrongs >= 2 ? 2 : 1) as 1 | 2;
  const guideStyle = (on: boolean): CSSProperties =>
    on
      ? { boxShadow: `0 0 0 3px ${accent}66, 0 0 22px ${accent}88`, animation: reduce ? undefined : "wiGuide 1.4s ease-in-out infinite" }
      : {};
  const strip = settled
    ? isMine ? "Yours! The next thing is coming" : "Lid down. The next thing is coming"
    : thingWrongs > 0
      ? "Have another think. Read the little line under it again"
      : guided
        ? "Thing 1: look at it, then tap whose it is"
        : "Look at it, then tap whose it is";

  const eyebrowStyle: CSSProperties = {
    fontFamily: LABEL_FONT, fontSize: 10, fontWeight: 800,
    letterSpacing: "0.2em", textTransform: "uppercase", color: accent,
  };

  /* ───────── One name tag ───────── */
  const renderTag = (o: ShelfOwner) => {
    const chosen = named === o.id;
    const glow = guided && !settled && !feedback && narr === "idle";
    return (
      <motion.button
        key={o.id}
        type="button"
        aria-label={o.label}
        onClick={() => name(o.id)}
        disabled={speaking}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        whileTap={speaking || reduce ? undefined : { scale: 0.97 }}
        style={{
          position: "relative",
          flex: `1 1 ${TAG_MIN_W}px`,
          minWidth: 0,
          minHeight: TAG_MIN_H,
          padding: "10px 12px",
          borderRadius: 14,
          // Every tag wears the same card, size and ink: only the name on it
          // tells them apart, never the thing on the shelf.
          background: "#fff6e8",
          border: `3px solid ${chosen ? RIGHT_GREEN : "#ffffff"}`,
          boxShadow: chosen
            ? `0 0 20px ${RIGHT_GREEN}80, inset 0 0 0 2px rgba(46,36,23,0.16)`
            : "0 10px 20px -12px rgba(0,0,0,0.85), inset 0 0 0 2px rgba(46,36,23,0.14)",
          color: INK,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 5, fontFamily: KID_FONT, fontSize: 14.5, fontWeight: 800, lineHeight: 1.2,
          textAlign: "center",
          cursor: speaking ? "wait" : "pointer",
          touchAction: "manipulation",
          transition: "border-color 200ms ease, box-shadow 200ms ease",
          ...guideStyle(glow),
        }}
      >
        <PixIcon emoji={o.icon} size={28} />
        <span style={{ overflowWrap: "anywhere" }}>{o.label}</span>
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

      {/* Sarah's read-alouds (audio only). Gated on !showIntro, always: a board
          line that starts while the intro card is still open clobbers the
          intro's own clip and the "I'm ready" button never appears (the
          SignBingo / SenderLineup bug). Every line comes from the week file. */}
      {!showIntro && !finished && thing && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="wi-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent={accent} recordedOnly onDone={() => setNarr("read")} />
          )}
          {narr === "read" && (
            <InfoNarration key={`wi-read-${thing.id}`} speaker={voice} lines={[thing.readAloud]} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
        </div>
      )}

      {!showIntro && !finished && thing && (
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "2px 22px 0" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: accent }}>
              <PixIcon emoji={introIcon} size={16} />
              {introTitle}
            </span>
            <span style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c9b8ff" }}>
              {counterLabel} {Math.min(idx + 1, deck.length)} of {deck.length}
            </span>
          </div>

          <div
            style={{
              margin: "0 22px", padding: "12px", borderRadius: 18,
              background: "linear-gradient(180deg, rgba(0,0,0,0.26) 0%, rgba(0,0,0,0.4) 100%)",
              border: `1px solid ${accent}44`,
              boxShadow: `0 18px 40px -22px rgba(0,0,0,0.8), inset 0 0 0 1px ${accent}14`,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
            }}
          >
            <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 6, minHeight: 18, ...eyebrowStyle }}>
              <PixIcon emoji="🏠" size={16} />
              <span>{shelfLabel}</span>
              <span style={{ marginLeft: "auto", color: "rgba(255,247,230,0.65)" }}>
                {Math.min(idx + (settled ? 1 : 0), deck.length)} of {deck.length} named
              </span>
            </div>

            {/* THE SHELF. One open box at a time, same box, same place. */}
            <div
              style={{
                width: "100%", borderRadius: 16, background: ROOM,
                border: "1.5px solid rgba(255,247,230,0.18)", padding: "14px 10px 16px",
                display: "flex", justifyContent: "center", overflow: "hidden",
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={thing.id}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0, transition: { duration: 0.12 } } : { opacity: 0, y: -16, transition: { duration: 0.16 } }}
                  transition={{ duration: 0.3 }}
                  style={{ width: "100%", maxWidth: BOX_W, display: "flex", flexDirection: "column", alignItems: "center" }}
                >
                  {/* THE LID. It closes by itself once the owner is named, and
                      only for somebody else's thing: the child's own stays open.
                      The lid follows the name, which is the whole point. */}
                  <motion.div
                    aria-hidden
                    animate={{ rotateX: settled && !isMine ? 0 : -104 }}
                    transition={{ duration: reduce ? 0.2 : 0.55 }}
                    style={{
                      width: "100%", height: 26, borderRadius: "10px 10px 2px 2px",
                      background: BOX_BODY, border: `3px solid ${BOX_EDGE}`,
                      transformOrigin: "bottom center", transformStyle: "preserve-3d",
                      boxShadow: "0 6px 12px -6px rgba(0,0,0,0.8)",
                    }}
                  />
                  <div
                    style={{
                      width: "100%", minHeight: BOX_H, borderRadius: "2px 2px 14px 14px",
                      background: BOX_BODY, border: `4px solid ${BOX_EDGE}`, borderTop: "none",
                      padding: 10, display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "0 18px 34px -18px rgba(0,0,0,0.95)",
                    }}
                  >
                    <div
                      style={{
                        width: "100%", minHeight: BOX_H - 30, borderRadius: 10,
                        background: BOX_INSIDE, border: "2px solid rgba(46,36,23,0.2)",
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        gap: 7, padding: "12px 10px", textAlign: "center", color: INK,
                        fontFamily: KID_FONT,
                      }}
                    >
                      <PixIcon emoji={thing.icon} size={40} />
                      <span style={{ fontSize: 16.5, fontWeight: 900, lineHeight: 1.16, overflowWrap: "anywhere" }}>{thing.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.26, opacity: 0.76, overflowWrap: "anywhere" }}>{thing.detail}</span>
                      {settled && (
                        <motion.span
                          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 340, damping: 15 }}
                          style={{
                            marginTop: 2, padding: "4px 12px", borderRadius: 999,
                            background: isMine ? `${MINE_GREEN}22` : `${THEIRS_BLUE}22`,
                            border: `2px solid ${isMine ? MINE_GREEN : THEIRS_BLUE}`,
                            color: isMine ? MINE_GREEN : THEIRS_BLUE,
                            fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 900, letterSpacing: "0.1em",
                          }}
                        >
                          {isMine ? mineLabel : theirsLabel}
                        </motion.span>
                      )}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ ...eyebrowStyle, minHeight: 14, display: "flex", alignItems: "center", gap: 6, textAlign: "center" }}>
                <PixIcon emoji="❓" size={16} />
                {askPrompt}
              </div>
              {/* The name tags never move: they are the household, in the same
                  order all game. */}
              <div
                role="group"
                aria-label={tagsLabel}
                style={{ width: "100%", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}
              >
                {tags.map(renderTag)}
              </div>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: 12 }}>
            <div style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: accent, minHeight: 16, padding: "0 16px" }}>
              {strip}
            </div>
          </div>

          <div style={{ maxWidth: 560, margin: "8px auto 0" }}>
            {hintText && <HintBubble tier={hintTier} speaker={voice} text={hintText} />}
          </div>

          <style>{`
            @keyframes wiGuide { 0%,100% { box-shadow: 0 0 0 3px ${accent}55, 0 0 16px ${accent}77 } 50% { box-shadow: 0 0 0 6px ${accent}22, 0 0 28px ${accent} } }
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
            `${deck.length} things on the shelf, and you found a person behind every one of them`,
            completeLine,
          ]}
          narration={completeNarration}
          onContinue={() => onComplete(stars === 3 ? 100 : stars === 2 ? 70 : 40)}
        />
      )}
    </ExerciseFrame>
  );
}
