"use client";

/**
 * LensCheck: the LITTLE GLASS EYES drill (Week 14, "Little Glass Eyes").
 *
 * The same corner of a room, twice, side by side. On the left is A MOMENT AGO;
 * on the right is RIGHT NOW. Everything is in the same place in both pictures:
 * the same shelf, the same things, the same order. Between the two pictures one
 * thing has woken up, and it is showing it: its little light has come on and
 * the cover has slid off its lens. The child looks from one picture to the
 * other and taps the thing that woke.
 *
 * Verb: COMPARE TWO STATES AND SPOT WHAT WOKE UP. No other engine in the
 * library does this. It is NOT a read-a-situation-tap-one-of-three-cards game
 * (Track Back, the Drill Run, Who Would Know, the Trail Planner and the Day Jug
 * are): there is no question card, no three-card row, and the answer is not a
 * sentence, it is a thing in a picture. It is NOT a hunt for the right control
 * among decoy buttons (Button Hunt and the Power Panel are, and the Power Panel
 * shipped one week ago): nothing here is a control, nothing is switched, and
 * the wrong taps are not decoys, they are honest things that simply did not
 * change. It is NOT a bedroom tidy-up (Night Fall is): nothing is moved, sent
 * out or cleared, and the room is exactly as full at the end as at the start.
 * It is NOT a two-bin sort (Hook Sort is, and Week 14 concept 1 already uses
 * it): there is nowhere to put anything.
 *
 * Every thing in the picture carries the same little status light, in both
 * pictures, so nothing is decorated differently before the tap: the only thing
 * that tells the woken one apart is that its light is ON and its lens cover is
 * OPEN in the second picture, which is exactly the real-world tell the concept
 * is teaching. The light is bright amber on cream paper on a deep wall, so it
 * is legible at 400px without being a flashing arrow.
 *
 * Tapping something that did not change is a gentle teach, never a fail: Sarah
 * says what it is and why it has no lens to wake, the thing keeps a small NO
 * CHANGE tag from then on, and the round waits. Nothing in here is frightening:
 * a camera is an ordinary thing that shows you when it is awake, and knowing
 * the tell is the whole point.
 *
 * Learn-Loop wiring: Raccoon boast in the intro (`threat`), Sarah's how-to once
 * and every round's `readAloud` spoken as the round opens (audio-only,
 * `recordedOnly`, taps held, released by the shared SPOKEN_GATE_MAX_MS), a
 * one-take spoken verdict on the tap ("That's right!" + the woken spot's `why`
 * via VerdictVoice; a spot that did not change: WrongAnswerPanel speaks "Not
 * quite." + that spot's `explanation`), hint tiers per round, and a payoff on
 * the complete beat gated on `!verdict.speaking` so it can never cut Sarah off.
 * The next round is opened from the verdict's own callback, so no payoff can
 * cut her off either. A synchronous ref latch shuts the picture the instant a
 * spot is tapped, because `canTap` only closes once React re-renders on
 * `verdict.speaking` and a quick second tap would otherwise restart the verdict
 * and cut Sarah off (the real Week 12 bug).
 *
 * Rounds run in AUTHORED order (they walk through one house, room by room);
 * the spots inside a round are shuffled, and the same shuffled order is used
 * for BOTH pictures, so the two really are the same corner twice. Round 1
 * guides the MECHANIC only: every thing in RIGHT NOW breathes together, woken
 * and unchanged alike, so the glow says "tap one of these", never which one.
 *
 * CRITICAL for the week author: every spoken string arrives through props
 * (`introNarration`, `coachLines`, `threat`, each round's `readAloud`, each
 * spot's `why` and `explanation`, `hints`, `completeNarration`). The clip
 * generator reads the WEEK FILE, so anything left to a component default is
 * never recorded and plays as silence, with no error anywhere. `place`, `label`
 * and `teach` are READ ON SCREEN, never spoken: put the spoken sentence in
 * `readAloud`, and the spoken reason for the woken spot in its `why`. `why` is
 * spoken ONLY on the spot that woke and `explanation` ONLY on one that did not,
 * so a line in the wrong field is silent even though the field is full.
 *
 * Authoring: four rounds reads best (three to five works), and FOUR spots a
 * round (three is thin, five is the most that stays legible, six starts to
 * shrink the labels at 400px). Exactly one spot per round has `woke: true`, and
 * the other three are ordinary things in that corner that did not change. Keep
 * `place` to about 20 characters, a spot `label` to about 16 (it sits under the
 * icon), `teach` to one short line, and `readAloud`, `why` and `explanation` to
 * one kid-sized sentence each. Every icon must be in PixIcon's MAP or it
 * renders as a flat system emoji.
 *
 * Layout budget at the owner's 1414x771 window (HUD 64 + stage padding 40, so
 * the stage holds ~627px before it grows): header 29 + marginBottom 10 + board
 * 26 (padding and border) + place row 22 + pictures 258 (panel label 26 + scene
 * 232 for two rows of four) + gap 12 + ask row 20 + gap 8 + teach slot 46 +
 * strip 28 + hint gap 8 = ~467px, so both pictures, the prompt and the takeaway
 * are on screen without a scroll. At 400px the two pictures stack, three tiles
 * to a row, and nothing scrolls sideways.
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
// she reads is already on screen), same recipe as TrackBack / NightFall.
const AUDIO_ONLY_STYLE = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  pointerEvents: "none",
} as const;
// SPOKEN_GATE_MAX_MS is shared: see app/lib/gameEngine/spokenGate.ts.

export interface LensRound {
  id: string;
  place: string;            // "the hallway", on the page
  readAloud: string;        // spoken as the round opens
  spots: { id: string; label: string; icon: string; woke: boolean; why: string; explanation: string }[];
  teach: string;            // the one-line takeaway once the round is solved
}
export interface LensCheckProps {
  rounds: LensRound[];
  introTitle?: string; introSubtitle?: string; introIcon?: string;
  beforeLabel?: string;     // default "A MOMENT AGO"
  afterLabel?: string;      // default "RIGHT NOW"
  askPrompt?: string;       // default "What just woke up?"
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

type LensSpot = LensRound["spots"][number];

/** Fixed chrome copy the props above do not cover (never spoken, so it can
 *  safely live here). Curious on purpose: a lens is a thing to know, not fear. */
const WOKE_TOAST = "SPOTTED IT!";
const WRONG_TITLE = "That one is exactly the same";
const SAME_TAG = "NO CHANGE";
const SCENE_EMPTY = "Look from one picture to the other";

const EMPTY_SPOTS: LensSpot[] = [];
const KID_FONT = "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif";
const LABEL_FONT = "'Space Grotesk', sans-serif";
/** Geometry (px). */
const PANEL_MIN_W = 300;
const SCENE_MIN_H = 214;
const TILE_W = 92;
const TILE_MIN_H = 94;
const LAMP = 22;
/** Paints. Cream things on a deep wall: a tappable thing is never painted on a
 *  ground anywhere near its own shade, so the little light reads at a glance. */
const WALL = "linear-gradient(180deg, #2b2450 0%, #1b1740 62%, #171334 100%)";
const FLOOR = "linear-gradient(180deg, #2a2148 0%, #1d1838 100%)";
const PAPER = "#fff6e8";
const INK = "#2a1f18";
const AWAKE = "#ffb347";
const SAME_BLUE = "#9fd2ff";
const FOUND_GREEN = "#16a34a";

export default function LensCheck({
  rounds,
  introTitle = "Little Glass Eyes",
  introSubtitle = "The same corner, twice. Something in it just woke up. Can you spot it?",
  introIcon = "👀",
  beforeLabel = "A MOMENT AGO",
  afterLabel = "RIGHT NOW",
  askPrompt = "What just woke up?",
  completeTitle = "Every eye spotted!",
  completeLine = "A lens that is awake usually shows it, Cyber Hero. Now you know where to look.",
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
}: LensCheckProps) {
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
  // Read-aloud chain: the how-to once as the first corner opens, then each
  // round's line as its two pictures arrive. Taps are held while she speaks.
  const [narr, setNarr] = useState<"howto" | "read" | "idle">("idle");
  // The woken spot, once it has been found.
  const [found, setFound] = useState<string | null>(null);
  // Spots the child has already been told did not change: they keep a NO CHANGE
  // tag and are never judged a second time for the same tap.
  const [same, setSame] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [roundWrongs, setRoundWrongs] = useState(0);
  const [totalWrongs, setTotalWrongs] = useState(0);

  // Rounds run in AUTHORED order (they walk through one house); the spots
  // inside a round are shuffled once, and BOTH pictures use that same order.
  const finished = idx >= rounds.length;
  const round = rounds[idx];
  const scene = useShuffledOnce(round?.spots ?? EMPTY_SPOTS, { key: round?.id ?? "done" });
  const solved = found !== null;
  // Round 1 teaches the mechanic only: every thing in RIGHT NOW breathes
  // together, so the glow can never point at the one that woke.
  const guided = idx === 0;

  // Spoken verdicts: Sarah says "That's right!" + why, and the next corner
  // waits for her. A spot that did not change speaks through WrongAnswerPanel.
  const verdict = useVerdictVoice(voice);
  const speaking = narr !== "idle" || verdict.speaking || !!feedback || solved;
  // `speaking` only closes once React has re-rendered, so a quick second tap
  // landed inside that window and restarted the verdict, cutting Sarah off
  // mid-sentence (the Week 12 bug). This latch shuts the picture synchronously.
  const handlingRef = useRef(false);

  // Safety releases for the spoken gate (never leave the picture held).
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
    // The how-to first if there is one, then the first corner reads itself out.
    setNarr(isAudioMuted() ? "idle" : coachLines ? "howto" : "read");
  };

  const advance = () => {
    handlingRef.current = false;
    setIdx((i) => i + 1);
    setFound(null);
    setSame([]);
    setRoundWrongs(0);
    setNarr(isAudioMuted() ? "idle" : "read");
  };

  /* ───────── The only judged tap: a thing in the RIGHT NOW picture ───────── */
  const check = (spot: LensSpot) => {
    if (!round || speaking || solved) return;
    // A spot already explained as unchanged is settled: tapping it again is a
    // friendly nothing, never a second wrong for the same thing.
    if (same.includes(spot.id)) {
      audio.tap();
      return;
    }
    if (handlingRef.current) return;
    handlingRef.current = true;
    onAnswered?.({
      questionKey: `lenscheck-${round.id}`,
      // Indexes are into the round's AUTHORED spot list, whatever slot the
      // shuffle put a thing in, so the dashboard always reads the same numbers.
      selectedIndex: round.spots.findIndex((s) => s.id === spot.id),
      correctIndex: round.spots.findIndex((s) => s.woke),
      wasCorrect: spot.woke,
    });
    if (spot.woke) {
      audio.select();
      fx.correct({ xp: 25, text: WOKE_TOAST });
      onCorrect?.();
      setFound(spot.id);
      // Sarah: "That's right!" + this spot's why, then the takeaway line has a
      // moment on screen before the next corner. Moving on from her callback is
      // what keeps a payoff from ever cutting her off.
      verdict.say("right", spot.why, () => {
        window.setTimeout(advance, reduce ? 300 : 1600);
      });
    } else {
      audio.wrong();
      onWrong?.();
      setTotalWrongs((n) => n + 1);
      const rw = roundWrongs + 1;
      setRoundWrongs(rw);
      setSame((prev) => (prev.includes(spot.id) ? prev : [...prev, spot.id]));
      // WrongAnswerPanel speaks "Not quite." + this teach line itself; nothing
      // moves and the same corner waits, so the next look is one tap.
      setFeedback({ title: WRONG_TITLE, explanation: spot.explanation, tip: rw >= 2 ? hints?.tier2 : hints?.tier1 });
      handlingRef.current = false;
    }
  };

  const stars = totalWrongs === 0 ? 3 : totalWrongs <= 2 ? 2 : 1;
  const hintText = roundWrongs >= 2 ? hints?.tier2 : roundWrongs === 1 ? hints?.tier1 : undefined;
  const hintTier = (roundWrongs >= 2 ? 2 : 1) as 1 | 2;
  const guideStyle = (on: boolean): CSSProperties =>
    on
      ? { boxShadow: `0 0 0 3px ${accent}66, 0 0 22px ${accent}88`, animation: reduce ? undefined : "lcGuide 1.4s ease-in-out infinite" }
      : {};
  const strip = solved
    ? "Spotted it. Everything else is exactly the same"
    : roundWrongs > 0
      ? "Look again. Which one has its little light ON?"
      : guided
        ? "Round 1: look at both pictures, then tap what changed"
        : `Tap what woke up in ${afterLabel.toLowerCase()}`;

  const eyebrowStyle: CSSProperties = {
    fontFamily: LABEL_FONT,
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: accent,
  };

  /* ───────── The little light every thing carries, in both pictures ─────────
   *  Asleep: a dark cover sits over the lens. Awake: the cover has slid off and
   *  the lens is lit. It is the SAME part on every tile, so nothing is
   *  decorated differently before the tap; only its state changes. */
  const lamp = (lit: boolean): ReactNode => (
    <span
      aria-hidden
      style={{
        position: "absolute",
        top: 6,
        right: 6,
        width: LAMP,
        height: LAMP,
        borderRadius: "50%",
        overflow: "hidden",
        border: `2px solid ${lit ? AWAKE : "rgba(42,31,24,0.34)"}`,
        background: lit
          ? "radial-gradient(circle at 34% 32%, #fff6dd 0%, #ffc46e 42%, #e08a24 100%)"
          : "rgba(42,31,24,0.14)",
        boxShadow: lit ? `0 0 12px ${AWAKE}, 0 0 3px #fff6dd inset` : "inset 0 1px 3px rgba(0,0,0,0.3)",
      }}
    >
      {/* The cover. `initial` matches `animate`, so the picture arrives in its
          state instead of sliding open while the child watches (which would
          point straight at the answer). */}
      <motion.span
        initial={{ x: lit ? "112%" : "0%" }}
        animate={{ x: lit ? "112%" : "0%" }}
        transition={{ duration: 0 }}
        style={{
          position: "absolute",
          inset: -1,
          borderRadius: "50%",
          background: "linear-gradient(180deg, #6c5a47 0%, #453729 100%)",
          boxShadow: "inset 0 -2px 3px rgba(0,0,0,0.35)",
        }}
      />
    </span>
  );

  /* ───────── One thing on the shelf. Same paper, size and ink, every tile ───────── */
  const renderSpot = (spot: LensSpot, order: number, side: "before" | "after"): ReactNode => {
    const lit = side === "after" && spot.woke;
    const settled = side === "after" && same.includes(spot.id);
    const isFound = side === "after" && found === spot.id;
    const body: ReactNode = (
      <>
        {lamp(lit)}
        <PixIcon emoji={spot.icon} size={30} />
        <span style={{ overflowWrap: "anywhere" }}>{spot.label}</span>
      </>
    );
    const tileStyle: CSSProperties = {
      position: "relative",
      width: TILE_W,
      minHeight: TILE_MIN_H,
      padding: "10px 7px 8px",
      borderRadius: 14,
      // Every tile wears the same paper, size and ink in BOTH pictures: the
      // only difference between them is the little light.
      background: PAPER,
      border: `3px solid ${isFound ? FOUND_GREEN : settled ? SAME_BLUE : "#ffffff"}`,
      boxShadow: isFound
        ? `0 0 20px ${FOUND_GREEN}80, inset 0 0 0 1.5px rgba(42,31,24,0.14)`
        : "0 12px 22px -12px rgba(0,0,0,0.9), inset 0 0 0 1.5px rgba(42,31,24,0.14)",
      color: INK,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      fontFamily: KID_FONT,
      fontSize: 11.5,
      fontWeight: 800,
      lineHeight: 1.15,
      textAlign: "center",
    };

    if (side === "before") {
      return (
        <span key={`b-${spot.id}`} aria-hidden style={{ ...tileStyle, opacity: 0.94 }}>
          {body}
        </span>
      );
    }

    return (
      <motion.button
        key={`a-${spot.id}`}
        type="button"
        aria-label={settled ? `${spot.label}, ${SAME_TAG}` : spot.label}
        onClick={() => check(spot)}
        disabled={speaking}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.24, delay: reduce ? 0 : 0.05 * order }}
        whileTap={speaking || reduce ? undefined : { scale: 0.96 }}
        style={{
          ...tileStyle,
          cursor: speaking ? "wait" : "pointer",
          touchAction: "manipulation",
          transition: "border-color 200ms ease, box-shadow 200ms ease",
          ...guideStyle(guided && !speaking && same.length === 0),
        }}
      >
        {body}
        {settled && (
          // Centred by a zero-height flex strip, never by a static translate:
          // this tag animates y, and the two would fight.
          <span aria-hidden style={{ position: "absolute", top: -11, left: 0, right: 0, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
            <motion.span
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
              style={{
                padding: "2px 8px",
                borderRadius: 999,
                background: SAME_BLUE,
                color: INK,
                fontFamily: LABEL_FONT,
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: "0.1em",
                whiteSpace: "nowrap",
              }}
            >
              {SAME_TAG}
            </motion.span>
          </span>
        )}
        {isFound && (
          <motion.span
            aria-hidden
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 380, damping: 14 }}
            style={{ position: "absolute", bottom: -10, left: 0, right: 0, display: "flex", justifyContent: "center" }}
          >
            <PixIcon emoji="✅" size={24} />
          </motion.span>
        )}
      </motion.button>
    );
  };

  /* ───────── One picture of the corner ───────── */
  const picture = (side: "before" | "after"): ReactNode => {
    const label = side === "before" ? beforeLabel : afterLabel;
    return (
      <div
        style={{
          flex: `1 1 ${PANEL_MIN_W}px`,
          minWidth: 0,
          borderRadius: 16,
          overflow: "hidden",
          border: side === "after" ? `2px solid ${accent}aa` : "1.5px solid rgba(255,247,230,0.2)",
          boxShadow: side === "after" ? `0 0 0 1px ${accent}22` : "none",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 10px",
            minHeight: 26,
            background: side === "after" ? `${accent}2e` : "rgba(255,255,255,0.06)",
            borderBottom: "1px solid rgba(255,247,230,0.14)",
            fontFamily: LABEL_FONT,
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: side === "after" ? "#fff7e6" : "rgba(255,247,230,0.7)",
          }}
        >
          <PixIcon emoji={side === "after" ? "👀" : "⏱️"} size={15} />
          <span style={{ overflowWrap: "anywhere" }}>{label}</span>
        </div>
        <div
          role={side === "after" ? "group" : undefined}
          aria-label={side === "after" ? askPrompt : undefined}
          aria-hidden={side === "before" ? true : undefined}
          style={{
            position: "relative",
            minHeight: SCENE_MIN_H,
            background: WALL,
            padding: "12px 10px 18px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            alignContent: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          {/* The shelf the things are standing on, so a picture reads as a
              corner of a room rather than a row of buttons. */}
          <span aria-hidden style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 34, background: FLOOR, borderTop: "1px solid rgba(255,247,230,0.12)" }} />
          {scene.length === 0 ? (
            <span style={{ position: "relative", fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,247,230,0.6)" }}>
              {SCENE_EMPTY}
            </span>
          ) : (
            scene.map((spot, i) => renderSpot(spot, i, side))
          )}
        </div>
      </div>
    );
  };

  return (
    <ExerciseFrame maxWidth={900} decor>
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

      {/* Sarah's read-alouds (audio only): the how-to once, then each corner as
          its two pictures arrive. Every line comes from the week file. */}
      {!showIntro && !finished && round && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="lc-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent={accent} recordedOnly onDone={() => setNarr("read")} />
          )}
          {narr === "read" && (
            <InfoNarration key={`lc-read-${round.id}`} speaker={voice} lines={[round.readAloud]} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
        </div>
      )}

      {!showIntro && !finished && round && (
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Side padding keeps the header clear of the frame's corner ornaments. */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "2px 22px 0" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: accent }}>
              <PixIcon emoji={introIcon} size={16} />
              {introTitle}
            </span>
            <span style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c9b8ff" }}>
              Corner {Math.min(idx + 1, rounds.length)} of {rounds.length}
            </span>
          </div>

          {/* The board: the place, the two pictures, the prompt, the takeaway.
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
              <PixIcon emoji="🏠" size={16} />
              <span style={{ overflowWrap: "anywhere" }}>{round.place}</span>
              <span style={{ marginLeft: "auto", color: "rgba(255,247,230,0.65)" }}>
                {Math.min(idx + (solved ? 1 : 0), rounds.length)} of {rounds.length} spotted
              </span>
            </div>

            {/* The same corner, twice. Same things, same order, same tiles: the
                only difference is which little light is on. */}
            <div style={{ width: "100%", display: "flex", flexWrap: "wrap", gap: 10, alignItems: "stretch" }}>
              {picture("before")}
              {picture("after")}
            </div>

            <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ ...eyebrowStyle, minHeight: 14, display: "flex", alignItems: "center", gap: 6, textAlign: "center" }}>
                <PixIcon emoji="❓" size={16} />
                {askPrompt}
              </div>
              {/* The takeaway slot keeps its height whether or not the line is
                  showing, so the board never jumps under the child's finger. */}
              <div style={{ width: "100%", minHeight: 46, display: "flex", justifyContent: "center", alignItems: "center" }}>
                <AnimatePresence mode="wait">
                  {solved && (
                    <motion.div
                      key={`teach-${round.id}`}
                      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, transition: { duration: 0.15 } }}
                      transition={{ duration: 0.3 }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 10,
                        maxWidth: "100%",
                        padding: "9px 14px",
                        borderRadius: 999,
                        background: "rgba(8,10,22,0.6)",
                        border: `2px solid ${AWAKE}`,
                        color: "#fff7e6",
                        fontFamily: KID_FONT,
                        fontSize: 14.5,
                        fontWeight: 800,
                        lineHeight: 1.25,
                        textAlign: "center",
                        overflowWrap: "anywhere",
                      }}
                    >
                      <PixIcon emoji="💡" size={24} />
                      <span>{round.teach}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
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
            @keyframes lcGuide { 0%,100% { box-shadow: 0 0 0 3px ${accent}55, 0 0 16px ${accent}77 } 50% { box-shadow: 0 0 0 6px ${accent}22, 0 0 28px ${accent} } }
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
            `${rounds.length} corner${rounds.length === 1 ? "" : "s"} checked, and every little glass eye showed you it was awake`,
            completeLine,
          ]}
          narration={completeNarration}
          onContinue={() => onComplete(stars === 3 ? 100 : stars === 2 ? 70 : 40)}
        />
      )}
    </ExerciseFrame>
  );
}
