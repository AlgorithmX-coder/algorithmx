"use client";

/**
 * DraftScrub: the CHECK IT BEFORE IT GOES drill (Week 17, "The Highlighter
 * Check").
 *
 * A post is written. It is not sent yet. That gap, between writing a thing and
 * it leaving your hands, is the only place in this whole week where a child has
 * complete power, and this game lives entirely inside it. The draft comes up on
 * the phone a line at a time, and for each line the child decides: this line
 * goes as it is, or this line gets swapped for a safer one.
 *
 * The lesson is NOT "your posts are dangerous, say less". A child taught that
 * learns to be frightened of their own news, and the Raccoon would be delighted.
 * The lesson is that a post has two kinds of line in it: the line that says what
 * you DID, which is the whole reason you are posting, and the line that says
 * WHERE you are and WHEN you will be there, which is the part a stranger can
 * actually use. Swapping the second kind costs the post nothing. "Back at
 * Oakfield Primary tomorrow at half eight" becomes "Back at school tomorrow",
 * and it is still the same happy news. So every swap in this game must leave the
 * post just as fun as it was, and the child ends holding a finished draft they
 * would genuinely want to send, not a blanked-out one.
 *
 * Verb: REWRITE YOUR OWN WORDS BEFORE THEY LEAVE. Nothing else in the library
 * lets the child CHANGE the thing being judged. It is NOT a find-the-clue game
 * (Week 3's and Week 8's clue stampers are): nothing is hidden, every line is
 * plainly on screen from the first moment, and finding is not the skill. It is
 * NOT a judge-somebody-else's-message game (Week 2's reveal board, Week 4's
 * inspector are): these are the child's OWN words about their OWN day, which is
 * the only reason the swap can be judged on whether it keeps the fun. It is NOT
 * a two-bin sort (Hook Sort is): nothing is carried anywhere, and a swapped line
 * stays exactly where it was in the post. It is NOT the Frost Mirror (this same
 * week): that board decides WHO may look at a thing that does not change, and
 * this one changes the thing itself while everyone who could see it still can.
 *
 * The lines are worked TOP TO BOTTOM and never shuffled, because they are a
 * sentence and a shuffled sentence is not one. That means the usual protection
 * (shuffle so no run of answers can be learned) is not available here, so the
 * AUTHOR carries it instead: keeps and swaps must be interleaved, never two
 * swaps then two keeps, or the child learns the rhythm instead of the reason.
 *
 * Nothing races the child: tap-only, untimed, no lose state, and a wrong call
 * costs nothing beyond Sarah explaining what that line hands over.
 *
 * Learn-Loop wiring: Raccoon boast in the intro (`threat`), Sarah's how-to once
 * as the draft opens and each line's `readAloud` spoken as it comes up (audio-
 * only, `recordedOnly`, taps held, released by the shared SPOKEN_GATE_MAX_MS),
 * a one-take spoken verdict on the call ("That's right!" + that line's `why` via
 * VerdictVoice; a wrong call: WrongAnswerPanel speaks "Not quite." + that line's
 * `explanation`), hint tiers per line, and a payoff on the complete beat gated
 * on `!verdict.speaking` so it can never cut Sarah off. The complete beat reads
 * the FINISHED post back, assembled from whatever each line ended up as, so the
 * child sees that they still have their news. A synchronous ref latch shuts both
 * answers the instant one is pressed, because `canTap` only closes once React
 * re-renders on `verdict.speaking` and a quick second tap would otherwise
 * restart the verdict and cut Sarah off (the real Week 12 bug).
 *
 * CRITICAL for the week author: every spoken string arrives through props
 * (`introNarration`, `coachLines`, `threat`, each line's `readAloud`, its `why`
 * and `explanation`, `hints`, `completeNarration`). The clip generator reads the
 * WEEK FILE, so anything left to a component default is never recorded and plays
 * as silence, with no error anywhere. `text` and `swapTo` are READ ON SCREEN,
 * never spoken. `why` is spoken ONLY when the call is right and `explanation`
 * ONLY when it is wrong, so a line in the wrong field is silent even though the
 * field is full.
 *
 * Authoring: five or six lines reads best. Every line that is NOT safe must
 * carry a `swapTo`, and that swap has to keep the news: if the swapped post is
 * duller than the original, the game has taught the wrong thing and a child will
 * simply stop posting instead of posting well. At least two lines must be safe,
 * and they have to be genuinely worth keeping (the fun, the feeling, the thing
 * that happened), never filler. Keep each `text` to about 52 characters so the
 * draft reads like a real post rather than an essay, and `readAloud`, `why` and
 * `explanation` to one kid-sized sentence each. Never put the school's real name
 * or a real place in a `swapTo`. Every icon must be in PixIcon's MAP or it
 * renders as a flat system emoji.
 *
 * Layout budget at the owner's 1414x771 window (HUD 64 + stage padding 40, so
 * the stage holds ~627px before it grows): header 29 + marginBottom 10 + board
 * 26 + eyebrow 22 + phone 300 (six lines at ~44 plus chrome) + gap 12 + ask row
 * 20 + answers 84 + strip 28 + hint gap 8 = ~539px, so the whole draft and both
 * answers are on screen without a scroll. At 400px the answers fall to one
 * column, the draft keeps its full width, and nothing scrolls sideways.
 */

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGameAudio } from "@/app/lib/gameEngine/useGameAudio";
import { useExerciseFeedback } from "@/app/lib/gameEngine/useExerciseFeedback";
import { useMotionIntensity } from "@/app/lib/gameEngine/useMotionIntensity";
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

/** The two answers. Fixed in this order on every line and every play. */
export type LineCall = "keep" | "swap";
const CALLS: LineCall[] = ["keep", "swap"];

export interface DraftLine {
  id: string;
  /** The line as the child first wrote it. Read on screen, never spoken. */
  text: string;
  /** True when the line goes as it is. */
  safe: boolean;
  /**
   * What the line becomes when it is swapped. REQUIRED on every line that is
   * not safe, and it must keep the news: a swap that flattens the post teaches
   * a child to stop posting rather than to post well. Read on screen.
   */
  swapTo?: string;
  /** Spoken as this line comes up. Never says which way it goes. */
  readAloud: string;
  /** SPOKEN on the right call. */
  why: string;
  /** SPOKEN on a wrong call. */
  explanation: string;
}

export interface DraftScrubProps {
  lines: DraftLine[];
  introTitle?: string;
  introSubtitle?: string;
  introIcon?: string;
  /** Chrome, never spoken. */
  draftLabel?: string;
  keepLabel?: string;
  swapLabel?: string;
  askPrompt?: string;
  postedByLabel?: string;
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
const CALL_TOAST = "LINE CHECKED!";
const WRONG_TITLE = "Have another read of that line";
const EMPTY_LINES: DraftLine[] = [];

const KID_FONT = "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif";
const LABEL_FONT = "'Space Grotesk', sans-serif";

/** Geometry (px). */
const PHONE_MAX_W = 452;
const ANSWER_MIN_H = 84;
const ANSWER_MIN_W = 214;

/** Paints. A bright phone draft on a dark hall: the draft is the brightest
 *  thing on the board because the draft is what the child came to read. */
const HALL = "linear-gradient(180deg, #221d46 0%, #1a1638 62%, #141029 100%)";
const PHONE_SHELL = "linear-gradient(180deg, #2d2a44 0%, #23203a 100%)";
const PAPER = "#fffdf7";
const INK = "#241d33";
const KEEP_GREEN = "#2f8f5b";
const SWAP_AMBER = "#b8762a";
const RIGHT_GREEN = "#16a34a";
const SWAPPED_BG = "#e8f7ec";
const WAITING_BG = "#f2eee4";

export default function DraftScrub({
  lines,
  introTitle = "The Highlighter Check",
  introSubtitle = "Your post is written but not sent. Read it line by line and fix the bits that hand over a map.",
  introIcon = "🔍",
  draftLabel = "YOUR DRAFT, NOT SENT YET",
  keepLabel = "KEEP IT",
  swapLabel = "SWAP IT",
  askPrompt = "Does this line go as it is?",
  postedByLabel = "Pip",
  completeTitle = "Draft ready to send!",
  completeLine = "Still your news, Cyber Hero. Just without the map to your front door.",
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
}: DraftScrubProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;
  const accent = useLessonTheme()?.accent ?? "#2b7fff";
  // Both content voices are Sarah; in-game read-alouds and verdict reasons are
  // recorded under "adam", so every manifest lookup here uses that key. Never
  // derive it from the intro narration's speaker.
  const voice = "adam" as const;

  // The draft is NOT shuffled: it is a sentence, and a shuffled sentence is not
  // one. The author interleaves keeps and swaps instead (see the header).
  const deck = lines?.length ? lines : EMPTY_LINES;

  const [showIntro, setShowIntro] = useState(true);
  const [idx, setIdx] = useState(0);
  const [narr, setNarr] = useState<"howto" | "read" | "idle">("idle");
  /** How each settled line ended up: kept as written, or swapped. */
  const [settled, setSettled] = useState<Record<string, LineCall>>({});
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [lineWrongs, setLineWrongs] = useState(0);
  const [totalWrongs, setTotalWrongs] = useState(0);

  const finished = idx >= deck.length;
  const line = deck[idx];
  const verdict = useVerdictVoice(voice);
  const speaking = narr !== "idle" || verdict.speaking || !!feedback || (!!line && !!settled[line.id]);
  // `speaking` only closes once React has re-rendered, so a quick second tap
  // landed inside that window and restarted the verdict, cutting Sarah off
  // mid-sentence (the Week 12 bug). This latch shuts both answers synchronously.
  const handlingRef = useRef(false);
  // Line 1 teaches the mechanic only: both answers breathe together, so the
  // glow says "one of these two", never which.
  const guided = idx === 0;

  // Safety releases for the spoken gate (never leave the draft held).
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
    setLineWrongs(0);
    setNarr(isAudioMuted() ? "idle" : "read");
  };

  /* ───────── THE CALL: keep this line, or swap it ───────── */
  const call = (choice: LineCall) => {
    if (!line || speaking) return;
    if (handlingRef.current) return;
    handlingRef.current = true;
    const want: LineCall = line.safe ? "keep" : "swap";
    const right = choice === want;
    onAnswered?.({
      questionKey: `draftscrub-${line.id}`,
      // The answers are FIXED: keep is 0, swap is 1, on every line and every
      // play, so the dashboard always reads the same numbers.
      selectedIndex: CALLS.indexOf(choice),
      correctIndex: CALLS.indexOf(want),
      wasCorrect: right,
    });
    if (right) {
      audio.select();
      fx.correct({ xp: 25, text: CALL_TOAST });
      onCorrect?.();
      setSettled((s) => ({ ...s, [line.id]: choice }));
      // Sarah: "That's right!" + this line's why, then the next line comes up.
      // Moving on from her callback is what keeps a payoff from ever cutting
      // her off.
      verdict.say("right", line.why, () => {
        window.setTimeout(advance, reduce ? 250 : 1000);
      });
    } else {
      audio.wrong();
      onWrong?.();
      setTotalWrongs((n) => n + 1);
      const lw = lineWrongs + 1;
      setLineWrongs(lw);
      // WrongAnswerPanel speaks "Not quite." + this teach line itself; the line
      // stays exactly where it is and both answers stay out, so the next go is
      // one tap.
      setFeedback({ title: WRONG_TITLE, explanation: line.explanation, tip: lw >= 2 ? hints?.tier2 : hints?.tier1 });
      handlingRef.current = false;
    }
  };

  /** What a line ended up saying: the swap if it was swapped, else as written. */
  const finalText = (l: DraftLine): string =>
    settled[l.id] === "swap" && l.swapTo ? l.swapTo : l.text;

  const stars = totalWrongs === 0 ? 3 : totalWrongs <= 2 ? 2 : 1;
  const hintText = lineWrongs >= 2 ? hints?.tier2 : lineWrongs === 1 ? hints?.tier1 : undefined;
  const hintTier = (lineWrongs >= 2 ? 2 : 1) as 1 | 2;
  const guideStyle = (on: boolean): CSSProperties =>
    on
      ? { boxShadow: `0 0 0 3px ${accent}66, 0 0 22px ${accent}88`, animation: reduce ? undefined : "dsGuide 1.4s ease-in-out infinite" }
      : {};
  const swapped = deck.filter((l) => settled[l.id] === "swap").length;
  const strip = line && settled[line.id]
    ? "Line sorted. The next one is coming up"
    : lineWrongs > 0
      ? "Have another read. Does that line say WHERE, or WHEN?"
      : guided
        ? "Line 1: read it, then pick keep it or swap it"
        : "Read the glowing line, then keep it or swap it";

  const eyebrowStyle: CSSProperties = {
    fontFamily: LABEL_FONT,
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: accent,
  };

  /* ───────── One line of the draft ───────── */
  const renderLine = (l: DraftLine, i: number) => {
    const state = settled[l.id];
    const current = i === idx && !state;
    const waiting = i > idx;
    const wasSwapped = state === "swap";
    return (
      <motion.div
        key={l.id}
        initial={reduce ? { opacity: 0 } : { opacity: 0, x: 10 }}
        animate={{ opacity: waiting ? 0.42 : 1, x: 0 }}
        transition={{ duration: 0.24 }}
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "9px 11px",
          borderRadius: 10,
          background: wasSwapped ? SWAPPED_BG : waiting ? WAITING_BG : PAPER,
          border: `2px solid ${current ? accent : state ? RIGHT_GREEN : "rgba(36,29,51,0.12)"}`,
          boxShadow: current ? `0 0 16px ${accent}66` : "none",
          color: INK,
          fontFamily: KID_FONT,
          fontSize: 14,
          fontWeight: 700,
          lineHeight: 1.3,
          transition: "border-color 220ms ease, background 320ms ease, box-shadow 220ms ease",
          ...guideStyle(false),
        }}
      >
        {/* The highlighter runs down the line the child is on, so a six year
            old always knows which words they are being asked about. */}
        <span
          aria-hidden
          style={{
            width: 4,
            alignSelf: "stretch",
            borderRadius: 999,
            background: current ? accent : wasSwapped ? RIGHT_GREEN : state ? RIGHT_GREEN : "rgba(36,29,51,0.14)",
            transition: "background 260ms ease",
          }}
        />
        <AnimatePresence mode="wait">
          <motion.span
            key={wasSwapped ? "swapped" : "original"}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            transition={{ duration: 0.26 }}
            style={{ flex: 1, minWidth: 0, overflowWrap: "anywhere" }}
          >
            {wasSwapped ? l.swapTo : l.text}
          </motion.span>
        </AnimatePresence>
        {state && (
          <PixIcon emoji={wasSwapped ? "🔀" : "👍"} size={20} />
        )}
      </motion.div>
    );
  };

  /* ───────── One of the two answers ───────── */
  const renderAnswer = (c: LineCall) => {
    const face = c === "keep"
      ? { label: keepLabel, icon: "👍", tint: KEEP_GREEN, note: "It goes as it is" }
      : { label: swapLabel, icon: "🔀", tint: SWAP_AMBER, note: "Say it a safer way" };
    const glow = guided && !!line && !settled[line.id] && !feedback && narr === "idle";
    return (
      <motion.button
        key={c}
        type="button"
        aria-label={face.label}
        onClick={() => call(c)}
        disabled={speaking}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        whileTap={speaking || reduce ? undefined : { scale: 0.97 }}
        style={{
          position: "relative",
          flex: `1 1 ${ANSWER_MIN_W}px`,
          minWidth: 0,
          minHeight: ANSWER_MIN_H,
          padding: "10px 12px",
          borderRadius: 14,
          // Both answers wear the same paper, size and ink on every line: only
          // their own fixed meaning tells them apart, never the line on screen.
          background: "#fff6e8",
          border: "3px solid #ffffff",
          boxShadow: "0 10px 20px -12px rgba(0,0,0,0.85), inset 0 0 0 2px rgba(36,29,51,0.14)",
          color: INK,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          fontFamily: KID_FONT,
          fontSize: 14.5,
          fontWeight: 800,
          lineHeight: 1.2,
          textAlign: "center",
          cursor: speaking ? "wait" : "pointer",
          touchAction: "manipulation",
          transition: "box-shadow 200ms ease",
          ...guideStyle(glow),
        }}
      >
        {/* A colour band per answer, in the same place on both: a landmark for
            a six year old, and it says nothing about the line on screen. */}
        <span aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, borderRadius: "11px 11px 0 0", background: face.tint }} />
        <PixIcon emoji={face.icon} size={24} />
        <span style={{ overflowWrap: "anywhere" }}>{face.label}</span>
        <span style={{ fontFamily: LABEL_FONT, fontSize: 9.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.6 }}>
          {face.note}
        </span>
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

      {/* Sarah's read-alouds (audio only): the how-to once, then each line as it
          comes up. Gated on !showIntro, always: a board line that starts while
          the intro card is still open clobbers the intro's own clip and the
          "I'm ready" button never appears (the SignBingo / SenderLineup bug).
          Every line comes from the week file. */}
      {!showIntro && !finished && line && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="ds-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent={accent} recordedOnly onDone={() => setNarr("read")} />
          )}
          {narr === "read" && (
            <InfoNarration key={`ds-read-${line.id}`} speaker={voice} lines={[line.readAloud]} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
        </div>
      )}

      {!showIntro && !finished && line && (
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Side padding keeps the header clear of the frame's corner ornaments. */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "2px 22px 0" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: accent }}>
              <PixIcon emoji={introIcon} size={16} />
              {introTitle}
            </span>
            <span style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c9b8ff" }}>
              Line {Math.min(idx + 1, deck.length)} of {deck.length}
            </span>
          </div>

          {/* The board: the hall, the phone in it, and the two answers. Inset
              22px so it never collides with the frame's rounded corners. */}
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
              <PixIcon emoji="📱" size={16} />
              <span>{draftLabel}</span>
              <span style={{ marginLeft: "auto", color: "rgba(255,247,230,0.65)" }}>
                {swapped} line{swapped === 1 ? "" : "s"} made safer so far
              </span>
            </div>

            {/* THE HALL, with the phone standing in it. */}
            <div
              style={{
                width: "100%",
                borderRadius: 16,
                background: HALL,
                border: "1.5px solid rgba(255,247,230,0.18)",
                padding: "12px 10px 14px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              {/* THE PHONE. The whole draft stays on screen the whole time, so
                  the child can see their post growing safer line by line. */}
              <div
                style={{
                  width: "100%",
                  maxWidth: PHONE_MAX_W,
                  borderRadius: 20,
                  background: PHONE_SHELL,
                  border: "3px solid rgba(255,247,230,0.26)",
                  boxShadow: "0 18px 34px -18px rgba(0,0,0,0.95)",
                  padding: "10px 9px 12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "0 3px" }}>
                  <PixIcon emoji="👤" size={20} />
                  <span style={{ fontFamily: KID_FONT, fontSize: 13, fontWeight: 900, color: "#f4efff" }}>{postedByLabel}</span>
                  <span style={{ marginLeft: "auto", fontFamily: LABEL_FONT, fontSize: 9, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: "#ffc98a" }}>
                    Not sent
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {deck.map(renderLine)}
                </div>
              </div>
            </div>

            <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ ...eyebrowStyle, minHeight: 14, display: "flex", alignItems: "center", gap: 6, textAlign: "center" }}>
                <PixIcon emoji="❓" size={16} />
                {askPrompt}
              </div>
              {/* The two answers never move: keep then swap, every line, every
                  play, so the child learns where they live. */}
              <div
                role="group"
                aria-label={askPrompt}
                style={{ width: "100%", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}
              >
                {CALLS.map(renderAnswer)}
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
            @keyframes dsGuide { 0%,100% { box-shadow: 0 0 0 3px ${accent}55, 0 0 16px ${accent}77 } 50% { box-shadow: 0 0 0 6px ${accent}22, 0 0 28px ${accent} } }
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
          verdict is still speaking would cut her off (the Week 9 bug). It reads
          the FINISHED post back, so the child ends holding their news rather
          than a blanked-out page. */}
      {finished && !verdict.speaking && (
        <ExerciseCompleteBeat
          title={completeTitle}
          stars={stars}
          statLines={[
            deck.map(finalText).join(" "),
            completeLine,
          ]}
          narration={completeNarration}
          onContinue={() => onComplete(stars === 3 ? 100 : stars === 2 ? 70 : 40)}
        />
      )}
    </ExerciseFrame>
  );
}
