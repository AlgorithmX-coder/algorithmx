"use client";

/**
 * StickerPeel: the PEEL TEST drill (Week 16, "The Sticker Trick").
 *
 * A poster is up on a board: a cafe menu, a bus stop, the leisure centre wall.
 * Printed on it is a code square. Some of those squares were printed WITH the
 * poster, in the same run of ink, and some are stickers somebody walked up and
 * pasted on top of the real one. You cannot always tell by looking, and this
 * drill never asks the child to: it asks the child to USE A THUMB.
 *
 * The child presses the corner of the code and watches what happens. A printed
 * code does not budge: the thumb slides over the ink and the paper stays flat.
 * A sticker comes up. The corner peels back, it keeps a little curl, and under
 * it is the code that was there first. Then, and only then, the child makes the
 * one judged call of the poster: printed on, or stuck on top?
 *
 * Verb: PRESS A CORNER AND SEE WHETHER IT LIFTS. Nothing in the library does
 * this. It is NOT a read-a-situation-tap-one-of-three-cards game (Track Back,
 * the Drill Run, Who Would Know, the Trail Planner, the Day Jug and the Speaker
 * Diary are): there is no situation to read and no card row, the evidence is a
 * physical thing the child's own thumb produces, and the call is about the
 * paper, not about the story. It is NOT a compare-two-pictures-and-spot-the-
 * change game (Lens Check is, and it shipped in Week 14): there is only ever one
 * poster on screen, nothing is shown twice, and there is no "before". It is NOT
 * a spot-the-one-difference-in-a-lookalike game (Week 4's sender line-up and
 * Week 9's whisker count are): the posters are not lookalikes of each other,
 * nothing on the poster gives the answer away to a careful eye, and looking
 * harder cannot solve it at all. Only the peel can. It is NOT a two-bin sort
 * (Hook Sort is): nothing is carried anywhere and nothing is put into anything.
 * It is NOT a hunt among decoy controls (Button Hunt and the Power Panel are):
 * there is exactly one thing to press before the reveal, the code itself, and
 * no decoys anywhere near it.
 *
 * Every poster is drawn to the SAME recipe: same paper, same ink, same code
 * square in the same place, with the corner tab on every single one. Nothing is
 * tilted, shadowed or bubbled before the press, because a tell the child can see
 * from the sofa would turn this back into a spot-the-difference game and would
 * teach the wrong habit: in the real world you cannot see it, you feel it.
 *
 * Nothing races the child: tap-only, untimed, no lose state, and a wrong call
 * costs nothing beyond Sarah explaining what the peel actually showed.
 *
 * Learn-Loop wiring: Raccoon boast in the intro (`threat`), Sarah's how-to once
 * and every poster's `readAloud` spoken as the poster goes up (audio-only,
 * `recordedOnly`, taps held, released by the shared SPOKEN_GATE_MAX_MS), a
 * one-take spoken verdict on the call ("That's right!" + that poster's `why` via
 * VerdictVoice; a wrong call: WrongAnswerPanel speaks "Not quite." + that
 * poster's `explanation`), hint tiers per poster, and a payoff on the complete
 * beat gated on `!verdict.speaking` so it can never cut Sarah off. The next
 * poster goes up from the verdict's own callback, so no payoff can cut her off
 * either. A synchronous ref latch shuts both call buttons the instant one is
 * pressed, because `canTap` only closes once React re-renders on
 * `verdict.speaking` and a quick second tap would otherwise restart the verdict
 * and cut Sarah off (the real Week 12 bug).
 *
 * Posters are SHUFFLED every play (three or more of them, so the shuffle bites).
 * The two call buttons are FIXED in place, printed-on then lifted, because the
 * child learns their positions and the answer is never in the order. Poster 1
 * guides the MECHANIC only: the code square breathes until it is pressed, then
 * BOTH call buttons breathe together, which shows what to do and never which
 * call is right.
 *
 * CRITICAL for the week author: every spoken string arrives through props
 * (`introNarration`, `coachLines`, `threat`, each poster's `readAloud`, its
 * `why` and `explanation`, `hints`, `completeNarration`). The clip generator
 * reads the WEEK FILE, so anything left to a component default is never recorded
 * and plays as silence, with no error anywhere. `place` and `tell` are READ ON
 * SCREEN, never spoken: put the spoken sentence in `readAloud`. `why` is spoken
 * ONLY when the call is right and `explanation` ONLY when it is wrong, so a line
 * in the wrong field is silent even though the field is full.
 *
 * Authoring: four posters reads best (three to six works), and roughly half of
 * them stickers, never all one way and never strictly alternating (the shuffle
 * handles the order). Keep `place` to about 24 characters, `tell` to one short
 * line (it is what the thumb found, written as a sensation: "the corner came
 * straight up, and there is another code under it"), and `readAloud`, `why` and
 * `explanation` to one kid-sized sentence each. Every icon must be in PixIcon's
 * MAP or it renders as a flat system emoji.
 *
 * Layout budget at the owner's 1414x771 window (HUD 64 + stage padding 40, so
 * the stage holds ~627px before it grows): header 29 + marginBottom 10 + board
 * 26 (padding and border) + eyebrow 22 + poster 244 + gap 12 + peel readout 50 +
 * gap 8 + ask row 20 + gap 8 + call buttons 92 + strip 28 + hint gap 8 = ~557px,
 * so the poster, what the peel found and both calls are on screen without a
 * scroll. At 400px the poster's printed side and its code square stack, the two
 * calls fall into one column, and nothing scrolls sideways.
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

export interface PeelSpot {
  id: string;
  place: string;            // "the cafe menu", on the board
  icon: string;
  readAloud: string;        // spoken as the poster comes up
  isSticker: boolean;       // true = a fake pasted on top
  tell: string;             // what the peel reveals, shown after the test
  why: string;              // Sarah on the right call
  explanation: string;      // Sarah's teach on the wrong call
}
export interface StickerPeelProps {
  spots: PeelSpot[];
  introTitle?: string; introSubtitle?: string; introIcon?: string;
  boardLabel?: string;      // default "OUT AND ABOUT"
  peelLabel?: string;       // default "PEEL TEST"
  stuckLabel?: string;      // default "PRINTED ON"
  liftedLabel?: string;     // default "IT LIFTED"
  askPrompt?: string;       // default "Printed on, or stuck on top?"
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
 *  safely live here). Matter-of-fact on purpose: a sticker is a thing to test,
 *  not a thing to be frightened of. */
const CALL_TOAST = "PEEL TESTED!";
const WRONG_TITLE = "Have another look at what your thumb found";
const PEEL_HINT = "Press the corner";
const PEEL_EYEBROW = "WHAT YOUR THUMB FOUND";
const PEEL_WAITING = "Press the corner of the code to find out";
const UNDER_TAG = "THE REAL ONE";
const POSTER_CAPTION = "SCAN ME";
const CALL_EYEBROW = "MAKE THE CALL";

const EMPTY_SPOTS: PeelSpot[] = [];
const KID_FONT = "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif";
const LABEL_FONT = "'Space Grotesk', sans-serif";
/** Geometry (px). */
const CODE_BOX = 128;
const FLAP = 54;
const CALL_MIN_H = 92;
const CALL_MIN_W = 200;
const POSTER_MIN_H = 244;
/** Paints. Warm poster paper pinned on a dark cork board: a tappable thing is
 *  never painted on a ground anywhere near its own shade. */
const CORK = "linear-gradient(180deg, #2b2450 0%, #1b1740 62%, #171334 100%)";
const PAPER = "#fff6e8";
const CODE_PAPER = "#ffffff";
const INK = "#2a1f18";
const FAINT_INK = "rgba(42,31,24,0.6)";
const PRINT_BLUE = "#2d6ea8";
const STICKER_AMBER = "#ffb347";
const CALL_GREEN = "#16a34a";

/** A deterministic little code pattern, so a poster looks the same on the
 *  server and on the client (a random one would trip hydration). Two seeds
 *  never draw the same square, which is what makes the code UNDER a sticker
 *  visibly a different code. */
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

export default function StickerPeel({
  spots,
  introTitle = "The Sticker Trick",
  introSubtitle = "Some codes are printed on. Some are stickers. Press the corner and find out.",
  introIcon = "🏷️",
  boardLabel = "OUT AND ABOUT",
  peelLabel = "PEEL TEST",
  stuckLabel = "PRINTED ON",
  liftedLabel = "IT LIFTED",
  askPrompt = "Printed on, or stuck on top?",
  completeTitle = "Every corner tested!",
  completeLine = "A sticker always lifts, Cyber Hero. Your thumb knows what your eyes cannot see.",
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
}: StickerPeelProps) {
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
  // Read-aloud chain: the how-to once as the board opens, then each poster's
  // line as it goes up. Taps are held while she speaks.
  const [narr, setNarr] = useState<"howto" | "read" | "idle">("idle");
  // The unjudged peel test: has the child's thumb been on the corner yet?
  const [peeled, setPeeled] = useState(false);
  // The judged call, once it was the right one.
  const [called, setCalled] = useState<"stuck" | "lifted" | null>(null);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [spotWrongs, setSpotWrongs] = useState(0);
  const [totalWrongs, setTotalWrongs] = useState(0);

  // Posters are shuffled every play (never the authored order).
  const deck = useShuffledOnce(spots ?? EMPTY_SPOTS, { key: "sticker-peel" });
  const finished = idx >= deck.length;
  const spot = deck[idx];
  const settled = called !== null;
  // Poster 1 teaches the mechanic only: the code breathes until it is pressed,
  // then BOTH calls breathe together, so the glow never points at an answer.
  const guided = idx === 0;

  // The codes on this poster. `under` is the code that was there first, and it
  // only ever comes into view when a sticker has actually been peeled back.
  const codeTop = useMemo(() => patternFor(spot?.id ?? "none", 9), [spot?.id]);
  const codeUnder = useMemo(() => patternFor(`${spot?.id ?? "none"}~real`, 9), [spot?.id]);

  // Spoken verdicts: Sarah says "That's right!" + why, and the next poster waits
  // for her. A wrong call speaks through WrongAnswerPanel.
  const verdict = useVerdictVoice(voice);
  const speaking = narr !== "idle" || verdict.speaking || !!feedback || settled;
  // `speaking` only closes once React has re-rendered, so a quick second tap
  // landed inside that window and restarted the verdict, cutting Sarah off
  // mid-sentence (the Week 12 bug). This latch shuts the calls synchronously.
  const handlingRef = useRef(false);

  // Safety releases for the spoken gate (never leave the board held).
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
    // The how-to first if there is one, then the first poster reads itself out.
    setNarr(isAudioMuted() ? "idle" : coachLines ? "howto" : "read");
  };

  const advance = () => {
    handlingRef.current = false;
    setIdx((i) => i + 1);
    setPeeled(false);
    setCalled(null);
    setSpotWrongs(0);
    setNarr(isAudioMuted() ? "idle" : "read");
  };

  /* ───────── THE PEEL TEST: the unjudged tap, and the whole point ───────── */
  const peel = () => {
    if (!spot || peeled || speaking) return;
    // A sticker coming away and a thumb sliding over dry ink are not the same
    // sound, and the child hears the difference before reading a word of it.
    if (spot.isSticker) audio.cardFlip();
    else audio.tap();
    setPeeled(true);
  };

  /* ───────── THE CALL: the only judged tap of the poster ───────── */
  const call = (choice: "stuck" | "lifted") => {
    if (!spot || speaking || settled || !peeled) return;
    if (handlingRef.current) return;
    handlingRef.current = true;
    const right = (choice === "lifted") === spot.isSticker;
    onAnswered?.({
      questionKey: `stickerpeel-${spot.id}`,
      // The two calls are FIXED: printed-on is 0, lifted is 1, on every poster
      // and every play, so the dashboard always reads the same numbers.
      selectedIndex: choice === "stuck" ? 0 : 1,
      correctIndex: spot.isSticker ? 1 : 0,
      wasCorrect: right,
    });
    if (right) {
      audio.drop();
      fx.correct({ xp: 25, text: CALL_TOAST });
      onCorrect?.();
      setCalled(choice);
      // Sarah: "That's right!" + this poster's why, then the next poster goes
      // up. Moving on from her callback is what keeps a payoff from ever
      // cutting her off.
      verdict.say("right", spot.why, () => {
        window.setTimeout(advance, reduce ? 250 : 1100);
      });
    } else {
      audio.wrong();
      onWrong?.();
      setTotalWrongs((n) => n + 1);
      const sw = spotWrongs + 1;
      setSpotWrongs(sw);
      // WrongAnswerPanel speaks "Not quite." + this teach line itself; the
      // peeled corner stays exactly as the child left it and the same poster
      // waits, so the second look is one tap.
      setFeedback({ title: WRONG_TITLE, explanation: spot.explanation, tip: sw >= 2 ? hints?.tier2 : hints?.tier1 });
      handlingRef.current = false;
    }
  };

  const stars = totalWrongs === 0 ? 3 : totalWrongs <= 2 ? 2 : 1;
  const hintText = spotWrongs >= 2 ? hints?.tier2 : spotWrongs === 1 ? hints?.tier1 : undefined;
  const hintTier = (spotWrongs >= 2 ? 2 : 1) as 1 | 2;
  const guideStyle = (on: boolean): CSSProperties =>
    on
      ? { boxShadow: `0 0 0 3px ${accent}66, 0 0 22px ${accent}88`, animation: reduce ? undefined : "spGuide 1.4s ease-in-out infinite" }
      : {};
  const strip = settled
    ? "Called it. On to the next poster"
    : !peeled
      ? guided
        ? "Poster 1: press the corner of the code with your thumb"
        : PEEL_HINT
      : guided
        ? "Now say what your thumb found"
        : spotWrongs > 0
          ? "Have another think. Did that corner come up, or not?"
          : "Say what your thumb found";

  const eyebrowStyle: CSSProperties = {
    fontFamily: LABEL_FONT,
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: accent,
  };

  /* ───────── One code square, drawn from its own seed ───────── */
  const codeGrid = (cells: boolean[], size: number, dark: string): ReactNode => (
    <span
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        gridTemplateColumns: `repeat(9, 1fr)`,
        gridTemplateRows: `repeat(9, 1fr)`,
        padding: Math.round(size * 0.07),
        gap: 1,
      }}
    >
      {cells.map((on, i) => (
        <span key={i} style={{ background: on ? dark : "transparent", borderRadius: 1 }} />
      ))}
    </span>
  );

  /* ───────── The code on the poster, with its peelable corner ─────────
   *  Every poster's code is drawn the same way, in the same place, with the
   *  same corner tab: nothing about it says sticker or printed before the
   *  press. Only what the corner DOES is different. */
  const codeSquare = (): ReactNode => {
    if (!spot) return null;
    const lifted = peeled && spot.isSticker;
    // One square face, drawn three times: the code underneath, the code on
    // show, and the corner flap's own front.
    const face: CSSProperties = {
      position: "absolute",
      top: 0,
      left: 0,
      width: CODE_BOX,
      height: CODE_BOX,
      boxSizing: "border-box",
      borderRadius: 8,
      background: CODE_PAPER,
      border: "2px solid rgba(42,31,24,0.2)",
      overflow: "hidden",
    };
    return (
      <div style={{ position: "relative", width: CODE_BOX, height: CODE_BOX, flexShrink: 0, perspective: 620 }}>
        {/* The code that was there first. It sits under the whole square and is
            only ever uncovered by a corner that actually comes up. */}
        <span
          aria-hidden
          style={{ ...face, border: `2px solid ${lifted ? CALL_GREEN : "rgba(42,31,24,0.2)"}` }}
        >
          {codeGrid(codeUnder, CODE_BOX, "#12345a")}
        </span>

        {/* The code on show, with its top-left corner cut away along the fold
            line. The flap below sits exactly in that gap, so on every poster
            the square simply looks whole until something actually lifts. */}
        <span
          aria-hidden
          style={{ ...face, clipPath: `polygon(${FLAP}px 0, 100% 0, 100% 100%, 0 100%, 0 ${FLAP}px)` }}
        >
          {codeGrid(codeTop, CODE_BOX, INK)}
        </span>

        {/* THE CORNER, identical on every poster. A sticker folds right back
            over the diagonal and lies there showing its sticky back; printed
            ink gives the one nudge a thumb can manage and settles flat again.
            The fold is a 3D rotate about the diagonal itself, with the origin
            ON that axis, done on a plain element: an SVG would default
            `transform-box` to fill-box and put the fold in the wrong place. */}
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: FLAP,
            height: FLAP,
            clipPath: "polygon(0 0, 100% 0, 0 100%)",
            transformOrigin: `${FLAP}px 0px`,
            transformStyle: "preserve-3d",
            transform: lifted ? "rotate3d(-1, 1, 0, 168deg)" : undefined,
            transition: reduce ? "transform 180ms ease" : "transform 620ms cubic-bezier(0.22,0.72,0.26,1)",
            // A printed corner: one honest nudge, then flat again.
            animation: peeled && !spot.isSticker && !reduce ? "spStuck 460ms ease-in-out 1" : undefined,
            // The sticky back of the sticker, seen once it is folded over.
            background: "linear-gradient(135deg, #ffffff 0%, #f2e7d4 62%, #dccdb2 100%)",
            filter: lifted ? "drop-shadow(3px 3px 9px rgba(0,0,0,0.5))" : undefined,
            pointerEvents: "none",
          }}
        >
          <span style={{ ...face, backfaceVisibility: "hidden" }}>
            {codeGrid(codeTop, CODE_BOX, INK)}
          </span>
        </span>

        {/* The same little "press here" mark on every poster, gone the moment
            the thumb has been. It says WHERE to press, never what will happen. */}
        {!peeled && (
          <span aria-hidden style={{ position: "absolute", top: -11, left: -11, display: "grid", placeItems: "center", pointerEvents: "none" }}>
            <PixIcon emoji="👆" size={26} />
          </span>
        )}

        {/* The tag on the code that was underneath, so a six year old is in no
            doubt about what just came into view. */}
        {lifted && (
          <span aria-hidden style={{ position: "absolute", left: -6, bottom: -12, display: "flex" }}>
            <motion.span
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24 }}
              style={{
                padding: "2px 8px",
                borderRadius: 999,
                background: CALL_GREEN,
                color: "#ffffff",
                fontFamily: LABEL_FONT,
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: "0.1em",
                whiteSpace: "nowrap",
              }}
            >
              {UNDER_TAG}
            </motion.span>
          </span>
        )}
      </div>
    );
  };

  /* ───────── One call button. Same paper, size and ink, both of them ───────── */
  const renderCall = (choice: "stuck" | "lifted", label: string, icon: string): ReactNode => {
    const chosen = called === choice;
    const glow = guided && peeled && !settled && !speaking;
    return (
      <motion.button
        key={choice}
        type="button"
        aria-label={label}
        onClick={() => call(choice)}
        disabled={speaking || !peeled}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.97 }}
        animate={{ opacity: peeled ? 1 : 0.5, y: 0, scale: 1 }}
        transition={{ duration: 0.24 }}
        whileTap={speaking || !peeled || reduce ? undefined : { scale: 0.97 }}
        style={{
          position: "relative",
          flex: `1 1 ${CALL_MIN_W}px`,
          minWidth: 0,
          minHeight: CALL_MIN_H,
          padding: "10px 12px",
          borderRadius: 14,
          // Both calls wear the same paper, size and ink on every poster:
          // nothing may hint at the answer before the tap.
          background: PAPER,
          border: `3px solid ${chosen ? CALL_GREEN : "#ffffff"}`,
          boxShadow: chosen
            ? `0 0 20px ${CALL_GREEN}80, inset 0 0 0 2px rgba(42,31,24,0.16)`
            : "0 10px 20px -12px rgba(0,0,0,0.85), inset 0 0 0 2px rgba(42,31,24,0.14)",
          color: INK,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          fontFamily: KID_FONT,
          fontSize: 15,
          fontWeight: 800,
          lineHeight: 1.2,
          textAlign: "center",
          cursor: !peeled ? "default" : speaking ? "wait" : "pointer",
          touchAction: "manipulation",
          transition: "border-color 200ms ease, box-shadow 200ms ease, opacity 240ms ease",
          ...guideStyle(glow),
        }}
      >
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

      {/* Sarah's read-alouds (audio only): the how-to once, then each poster as
          it goes up. Gated on !showIntro, always: a board line that starts while
          the intro card is still open clobbers the intro's own clip and the
          "I'm ready" button never appears (the SignBingo / SenderLineup bug).
          Every line comes from the week file. */}
      {!showIntro && !finished && spot && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="sp-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent={accent} recordedOnly onDone={() => setNarr("read")} />
          )}
          {narr === "read" && (
            <InfoNarration key={`sp-read-${spot.id}`} speaker={voice} lines={[spot.readAloud]} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
        </div>
      )}

      {!showIntro && !finished && spot && (
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Side padding keeps the header clear of the frame's corner ornaments. */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "2px 22px 0" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: accent }}>
              <PixIcon emoji={introIcon} size={16} />
              {introTitle}
            </span>
            <span style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c9b8ff" }}>
              Poster {Math.min(idx + 1, deck.length)} of {deck.length}
            </span>
          </div>

          {/* The board: the poster, what the thumb found, and the two calls.
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
              <PixIcon emoji="📌" size={16} />
              <span style={{ overflowWrap: "anywhere" }}>{boardLabel}</span>
              <span style={{ marginLeft: "auto", color: "rgba(255,247,230,0.65)" }}>
                {Math.min(idx + (settled ? 1 : 0), deck.length)} of {deck.length} tested
              </span>
            </div>

            {/* THE POSTER, pinned up on the board. One poster at a time: there is
                never a second picture to compare it with, because the answer is
                not visible in any picture. */}
            <div
              style={{
                width: "100%",
                minHeight: POSTER_MIN_H,
                borderRadius: 16,
                background: CORK,
                border: "1.5px solid rgba(255,247,230,0.18)",
                padding: "14px 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={spot.id}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: -14, rotate: -1.5 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.14 } }}
                  transition={{ duration: 0.3 }}
                  style={{
                    width: "100%",
                    maxWidth: 560,
                    borderRadius: 12,
                    background: PAPER,
                    border: "3px solid #ffffff",
                    boxShadow: "0 16px 30px -16px rgba(0,0,0,0.95)",
                    padding: "12px 14px",
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 14,
                  }}
                >
                  {/* The printed side of the poster: where you are, and some ink
                      that is definitely the poster's own. */}
                  <div style={{ flex: "1 1 220px", minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: KID_FONT, fontSize: 17, fontWeight: 900, color: INK, lineHeight: 1.2, overflowWrap: "anywhere" }}>
                      <PixIcon emoji={spot.icon} size={28} />
                      {spot.place}
                    </span>
                    <span aria-hidden style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {[100, 84, 92, 66].map((w, i) => (
                        <span key={i} style={{ height: 7, width: `${w}%`, borderRadius: 4, background: i === 0 ? PRINT_BLUE : "rgba(42,31,24,0.18)" }} />
                      ))}
                    </span>
                    <span style={{ fontFamily: LABEL_FONT, fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: FAINT_INK }}>
                      {POSTER_CAPTION}
                    </span>
                  </div>

                  {/* The code, and its corner. */}
                  <motion.button
                    type="button"
                    aria-label={`${peelLabel}: ${spot.place}`}
                    onClick={peel}
                    disabled={speaking || peeled}
                    whileTap={speaking || peeled || reduce ? undefined : { scale: 0.97 }}
                    style={{
                      position: "relative",
                      flexShrink: 0,
                      padding: 8,
                      borderRadius: 14,
                      background: "rgba(42,31,24,0.06)",
                      border: `2px solid ${peeled ? "rgba(42,31,24,0.18)" : `${STICKER_AMBER}`}`,
                      cursor: peeled ? "default" : speaking ? "wait" : "pointer",
                      touchAction: "manipulation",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 8,
                      ...guideStyle(guided && !peeled && !speaking),
                    }}
                  >
                    {codeSquare()}
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: LABEL_FONT, fontSize: 10, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", color: peeled ? FAINT_INK : INK }}>
                      <PixIcon emoji="👆" size={16} />
                      {peeled ? PEEL_EYEBROW : peelLabel}
                    </span>
                  </motion.button>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* What the thumb found. The slot keeps its height whether or not
                the line is showing, so the board never jumps under a finger. */}
            <div style={{ width: "100%", minHeight: 50, display: "flex", justifyContent: "center", alignItems: "center" }}>
              <AnimatePresence mode="wait">
                {peeled ? (
                  <motion.div
                    key={`tell-${spot.id}`}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, transition: { duration: 0.12 } }}
                    transition={{ duration: 0.28 }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                      maxWidth: "100%",
                      padding: "9px 14px",
                      borderRadius: 999,
                      background: "rgba(8,10,22,0.6)",
                      border: `2px solid ${STICKER_AMBER}`,
                      color: "#fff7e6",
                      fontFamily: KID_FONT,
                      fontSize: 14.5,
                      fontWeight: 800,
                      lineHeight: 1.25,
                      textAlign: "center",
                      overflowWrap: "anywhere",
                    }}
                  >
                    <PixIcon emoji="🔍" size={24} />
                    <span>{spot.tell}</span>
                  </motion.div>
                ) : (
                  <motion.span
                    key={`wait-${spot.id}`}
                    initial={reduce ? { opacity: 0 } : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.12 } }}
                    style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,247,230,0.6)", textAlign: "center", padding: "0 10px" }}
                  >
                    {PEEL_WAITING}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ ...eyebrowStyle, minHeight: 14, display: "flex", alignItems: "center", gap: 6, textAlign: "center" }}>
                <PixIcon emoji="❓" size={16} />
                {askPrompt}
              </div>
              {/* The two calls never move: printed-on then lifted, every poster,
                  every play, so the child learns where they live. */}
              <div
                role="group"
                aria-label={CALL_EYEBROW}
                style={{ width: "100%", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}
              >
                {renderCall("stuck", stuckLabel, "🎨")}
                {renderCall("lifted", liftedLabel, "🏷️")}
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
            @keyframes spGuide { 0%,100% { box-shadow: 0 0 0 3px ${accent}55, 0 0 16px ${accent}77 } 50% { box-shadow: 0 0 0 6px ${accent}22, 0 0 28px ${accent} } }
            @keyframes spStuck { 0%,100% { transform: rotate3d(-1,1,0,0deg) } 45% { transform: rotate3d(-1,1,0,9deg) } }
            @media (prefers-reduced-motion: reduce) { @keyframes spStuck { 0%,100% { transform: none } } }
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
            `${deck.length} poster${deck.length === 1 ? "" : "s"} peel tested, and every sticker gave itself away at the corner`,
            completeLine,
          ]}
          narration={completeNarration}
          onContinue={() => onComplete(stars === 3 ? 100 : stars === 2 ? 70 : 40)}
        />
      )}
    </ExerciseFrame>
  );
}
