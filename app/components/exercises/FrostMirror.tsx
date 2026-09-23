"use client";

/**
 * FrostMirror: the WHO CAN SEE THIS drill (Week 17, "Frost the Mirror").
 *
 * The Raccoon's whole Hall of Mirrors trick is that a profile hangs in a hall
 * where anybody walking past can stop and stare into it for as long as they
 * like. So the child is given their own mirror, all six panes clear, and the
 * job is to go round it pane by pane and decide which ones a stranger gets to
 * look through.
 *
 * The board is deliberately the WHOLE mirror at once, and the child may work
 * the panes in any order they like. That is not a convenience, it is the
 * lesson: a profile is not met one line at a time, it is met all in one look,
 * and six small things that each felt harmless add up to a stranger knowing
 * where a child goes to school, what they look like and when they are out. A
 * child who has stood back and seen all six of their own panes in one frame has
 * understood something a stack of one-at-a-time cards cannot teach them.
 *
 * And it is not "frost everything". A profile with nothing on it is not the
 * win, and a child told to hide their whole self learns that being online is
 * something to be afraid of. Some panes are lovely left clear: a drawing they
 * made, a team they support, the fact that they like dogs. The skill is telling
 * those apart from the panes that hand a stranger a map, so at least one pane
 * in every set must be a genuine LEAVE IT CLEAR.
 *
 * Verb: STAND BACK, THEN CHOOSE YOUR AUDIENCE, PANE BY PANE, IN ANY ORDER. This
 * is ACCOUNT privacy, and Week 14's switch board is DEVICE privacy: that week
 * turns hardware off (a microphone, a camera, a history), and this one decides
 * who is allowed to look at something that stays switched on. The two must
 * never trade ground. It is NOT a settings switch board (Week 14's is): nothing
 * here toggles on or off, every pane stays on the mirror whichever way it is
 * called, and the answer is an audience, not a state. It is NOT a one-card-at-
 * a-time judged queue (Week 16's doorways, the Glass Check, the Rope Line are):
 * there is no queue, no next, and no order at all. It is NOT a two-bin sort
 * (Hook Sort is): nothing is carried anywhere and nothing leaves the mirror.
 * It is NOT a hunt among decoys (Button Hunt, the Power Panel are): all six
 * panes are real, all six must be answered, and none is a trap.
 *
 * CRITICAL: every pane wears the SAME clear glass until it is called. A pane
 * that hints at its own answer before the child taps it hands over the game
 * (the Week 14 chip bug, where a label tagged the safe rows on sight).
 *
 * Nothing races the child: tap-only, untimed, no lose state, and a wrong call
 * costs nothing beyond Sarah explaining what that pane really shows.
 *
 * Learn-Loop wiring: Raccoon boast in the intro (`threat`), Sarah's how-to once
 * as the mirror lights up and each pane's `readAloud` spoken when the child
 * lifts it (audio-only, `recordedOnly`, taps held, released by the shared
 * SPOKEN_GATE_MAX_MS), a one-take spoken verdict on the call ("That's right!" +
 * that pane's `why` via VerdictVoice; a wrong call: WrongAnswerPanel speaks
 * "Not quite." + that pane's `explanation`), hint tiers, and a payoff on the
 * complete beat gated on `!verdict.speaking` so it can never cut Sarah off. A
 * synchronous ref latch shuts both answers the instant one is pressed, because
 * `canTap` only closes once React re-renders on `verdict.speaking` and a quick
 * second tap would otherwise restart the verdict and cut Sarah off (the real
 * Week 12 bug).
 *
 * The PANES are shuffled every play, so the mirror never lays out the same way
 * twice. The two answers are FIXED in place, frost then clear, on every pane and
 * every play. The first pane lifted guides the MECHANIC only: both answers
 * breathe together, so the glow says "one of these two", never which.
 *
 * CRITICAL for the week author: every spoken string arrives through props
 * (`introNarration`, `coachLines`, `threat`, each pane's `readAloud`, its `why`
 * and `explanation`, `hints`, `completeNarration`). The clip generator reads the
 * WEEK FILE, so anything left to a component default is never recorded and plays
 * as silence, with no error anywhere. `label` and `shows` are READ ON SCREEN,
 * never spoken. `why` is spoken ONLY when the call is right and `explanation`
 * ONLY when it is wrong, so a line in the wrong field is silent even though the
 * field is full.
 *
 * Authoring: six panes is the shape the board is built for (four to six works).
 * At least one must be `frost: false`, and the clear ones must be genuinely
 * lovely to leave clear, never a trick. Write `shows` as the thing itself, as it
 * would appear on a profile ("Oakfield Primary, Class 4B", not "Your school"),
 * because the whole skill is reading what is actually there. Keep `label` to
 * about 20 characters, `shows` to about 46, and `readAloud`, `why` and
 * `explanation` to one kid-sized sentence each. A `why` for a clear pane has to
 * say what makes it safe, not merely that it is. Every icon must be in PixIcon's
 * MAP or it renders as a flat system emoji.
 *
 * Layout budget at the owner's 1414x771 window (HUD 64 + stage padding 40, so
 * the stage holds ~627px before it grows): header 29 + marginBottom 10 + board
 * 26 + eyebrow 22 + mirror 300 (two rows of 138 + gap) + gap 12 + ask row 20 +
 * answers 84 + strip 28 + hint gap 8 = ~539px, so the whole mirror and both
 * answers are on screen without a scroll. At narrow widths the panes fall to two
 * columns at 760px and one at 430px, the answers to one, and nothing scrolls
 * sideways.
 */

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
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
// she reads is already on screen), same recipe as GlassCheck / RopeLine.
const AUDIO_ONLY_STYLE = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  pointerEvents: "none",
} as const;
// SPOKEN_GATE_MAX_MS is shared: see app/lib/gameEngine/spokenGate.ts.

/** The two answers. Fixed in this order on every pane and every play. */
export type PaneCall = "frost" | "clear";
const CALLS: PaneCall[] = ["frost", "clear"];

export interface MirrorPane {
  id: string;
  /** What this corner of the profile is. Read on screen, never spoken. */
  label: string;
  icon: string;
  /** The thing itself, exactly as a profile would show it. Read on screen. */
  shows: string;
  /** Spoken when the child lifts this pane. Never says the answer. */
  readAloud: string;
  /** True when only friends should see it; false when it is lovely left open. */
  frost: boolean;
  /** SPOKEN on the right call, whichever way it was got. */
  why: string;
  /** SPOKEN on a wrong call. */
  explanation: string;
}

export interface FrostMirrorProps {
  panes: MirrorPane[];
  introTitle?: string;
  introSubtitle?: string;
  introIcon?: string;
  /** Chrome, never spoken. */
  mirrorLabel?: string;
  frostLabel?: string;
  clearLabel?: string;
  askPrompt?: string;
  liftPrompt?: string;
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
const CALL_TOAST = "PANE SORTED!";
const WRONG_TITLE = "Have another look through that pane";
const EMPTY_PANES: MirrorPane[] = [];

const KID_FONT = "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif";
const LABEL_FONT = "'Space Grotesk', sans-serif";

/** Geometry (px). */
const PANE_MIN_H = 132;
const ANSWER_MIN_H = 84;
const ANSWER_MIN_W = 214;

/** Paints. Every pane wears the same clear glass until it is called: a pane
 *  that looks different before the tap has told the child the answer. */
const HALL = "linear-gradient(180deg, #221d46 0%, #1a1638 62%, #141029 100%)";
const FRAME_GOLD = "#c9a85f";
const GLASS_CLEAR = "linear-gradient(160deg, #f4fbff 0%, #dcecfa 52%, #cfe3f5 100%)";
const GLASS_FROSTED = "linear-gradient(160deg, #cfe0ee 0%, #b7cde0 52%, #a8c0d6 100%)";
const INK = "#20303f";
const FROST_BLUE = "#2d6ea8";
const OPEN_GREEN = "#2f8f5b";
const RIGHT_GREEN = "#16a34a";

export default function FrostMirror({
  panes,
  introTitle = "Frost the Mirror",
  introSubtitle = "Your profile hangs in the hall with every pane clear. Decide who gets to look through each one.",
  introIcon = "🔒",
  mirrorLabel = "YOUR PROFILE MIRROR",
  frostLabel = "FROST IT (FRIENDS ONLY)",
  clearLabel = "LEAVE IT CLEAR (ANYONE)",
  askPrompt = "Who should see this pane?",
  liftPrompt = "Tap a pane to lift it and have a proper look",
  completeTitle = "Mirror sorted!",
  completeLine = "Not hidden, Cyber Hero. Yours. You chose who looks through every single pane.",
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
}: FrostMirrorProps) {
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
  const [narr, setNarr] = useState<"howto" | "read" | "idle">("idle");
  /** The pane currently lifted off the mirror, if any. */
  const [lifted, setLifted] = useState<string | null>(null);
  /** Panes already called, and which way they went. */
  const [done, setDone] = useState<Record<string, PaneCall>>({});
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [paneWrongs, setPaneWrongs] = useState(0);
  const [totalWrongs, setTotalWrongs] = useState(0);

  // The PANES are shuffled every play, so the mirror never lays out the same
  // way twice. The two answers below never shuffle.
  const deck = useShuffledOnce(panes ?? EMPTY_PANES, { key: "frost-mirror" });
  const doneCount = Object.keys(done).length;
  const finished = deck.length > 0 && doneCount >= deck.length;
  const pane = useMemo(() => deck.find((p) => p.id === lifted) ?? null, [deck, lifted]);

  const verdict = useVerdictVoice(voice);
  const speaking = narr !== "idle" || verdict.speaking || !!feedback;
  // `speaking` only closes once React has re-rendered, so a quick second tap
  // landed inside that window and restarted the verdict, cutting Sarah off
  // mid-sentence (the Week 12 bug). This latch shuts both answers synchronously.
  const handlingRef = useRef(false);
  // The first pane the child lifts guides the mechanic only.
  const [everCalled, setEverCalled] = useState(false);

  // Safety releases for the spoken gate (never leave the mirror held).
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
    setNarr(isAudioMuted() || !coachLines ? "idle" : "howto");
  };

  /* ───────── Lifting a pane off the mirror ───────── */
  const lift = (p: MirrorPane) => {
    if (speaking || done[p.id]) return;
    if (lifted === p.id) return;
    audio.select();
    setLifted(p.id);
    setPaneWrongs(0);
    setNarr(isAudioMuted() ? "idle" : "read");
  };

  /* ───────── THE CALL: who gets to look through it ───────── */
  const call = (choice: PaneCall) => {
    if (!pane || speaking) return;
    if (handlingRef.current) return;
    handlingRef.current = true;
    const want: PaneCall = pane.frost ? "frost" : "clear";
    const right = choice === want;
    onAnswered?.({
      questionKey: `frostmirror-${pane.id}`,
      // The answers are FIXED: frost is 0, clear is 1, on every pane and every
      // play, so the dashboard always reads the same numbers.
      selectedIndex: CALLS.indexOf(choice),
      correctIndex: CALLS.indexOf(want),
      wasCorrect: right,
    });
    if (right) {
      audio.select();
      fx.correct({ xp: 25, text: CALL_TOAST });
      onCorrect?.();
      setDone((d) => ({ ...d, [pane.id]: choice }));
      setEverCalled(true);
      // Sarah: "That's right!" + this pane's why. The pane settles onto the
      // mirror from her callback, so no payoff can cut her off.
      verdict.say("right", pane.why, () => {
        handlingRef.current = false;
        setLifted(null);
        setPaneWrongs(0);
      });
    } else {
      audio.wrong();
      onWrong?.();
      setTotalWrongs((n) => n + 1);
      const pw = paneWrongs + 1;
      setPaneWrongs(pw);
      // WrongAnswerPanel speaks "Not quite." + this teach line itself; the pane
      // stays lifted and both answers stay out, so the next go is one tap.
      setFeedback({ title: WRONG_TITLE, explanation: pane.explanation, tip: pw >= 2 ? hints?.tier2 : hints?.tier1 });
      handlingRef.current = false;
    }
  };

  const stars = totalWrongs === 0 ? 3 : totalWrongs <= 2 ? 2 : 1;
  const hintText = paneWrongs >= 2 ? hints?.tier2 : paneWrongs === 1 ? hints?.tier1 : undefined;
  const hintTier = (paneWrongs >= 2 ? 2 : 1) as 1 | 2;
  const guideStyle = (on: boolean): CSSProperties =>
    on
      ? { boxShadow: `0 0 0 3px ${accent}66, 0 0 22px ${accent}88`, animation: reduce ? undefined : "fmGuide 1.4s ease-in-out infinite" }
      : {};
  const strip = pane
    ? paneWrongs > 0
      ? "Have another think. Could a stranger USE what that pane shows?"
      : !everCalled
        ? "Now pick one of the two: frost it, or leave it clear"
        : "Who gets to look through this one?"
    : finished
      ? "Every pane called. Stand back and look at your mirror"
      : liftPrompt;

  const eyebrowStyle: CSSProperties = {
    fontFamily: LABEL_FONT,
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: accent,
  };

  /* ───────── One pane on the mirror ───────── */
  const renderPane = (p: MirrorPane) => {
    const settledAs = done[p.id];
    const isFrosted = settledAs === "frost";
    const isLifted = lifted === p.id;
    return (
      <motion.button
        key={p.id}
        type="button"
        aria-label={`${p.label}: ${p.shows}`}
        onClick={() => lift(p)}
        disabled={speaking || !!settledAs}
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: isLifted ? 1.03 : 1 }}
        transition={{ duration: 0.26 }}
        whileTap={speaking || settledAs || reduce ? undefined : { scale: 0.97 }}
        style={{
          position: "relative",
          minHeight: PANE_MIN_H,
          padding: "12px 11px",
          borderRadius: 12,
          // Every un-called pane wears the SAME clear glass. A pane that looks
          // different before it is tapped has already told the child the answer
          // (the Week 14 chip bug).
          background: isFrosted ? GLASS_FROSTED : GLASS_CLEAR,
          border: `3px solid ${isLifted ? accent : settledAs ? RIGHT_GREEN : "rgba(255,255,255,0.75)"}`,
          boxShadow: isLifted
            ? `0 0 22px ${accent}88, inset 0 0 0 2px rgba(255,255,255,0.5)`
            : "0 10px 20px -12px rgba(0,0,0,0.85), inset 0 0 0 2px rgba(255,255,255,0.45)",
          color: INK,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          textAlign: "center",
          fontFamily: KID_FONT,
          cursor: speaking || settledAs ? "default" : "pointer",
          touchAction: "manipulation",
          overflow: "hidden",
          transition: "border-color 220ms ease, box-shadow 220ms ease, background 320ms ease",
        }}
      >
        {/* The etched frosting, once this pane has been called frosted. It is
            drawn OVER the content so the child can see that the thing is still
            there, just not on show to a stranger. */}
        {isFrosted && (
          <span
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background: "repeating-linear-gradient(135deg, rgba(255,255,255,0.62) 0px, rgba(255,255,255,0.62) 5px, rgba(255,255,255,0.2) 5px, rgba(255,255,255,0.2) 11px)",
              backdropFilter: "blur(1px)",
            }}
          />
        )}
        <PixIcon emoji={p.icon} size={26} />
        <span style={{ position: "relative", fontFamily: LABEL_FONT, fontSize: 9.5, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.66 }}>
          {p.label}
        </span>
        <span style={{ position: "relative", fontSize: 13.5, fontWeight: 800, lineHeight: 1.26, overflowWrap: "anywhere", filter: isFrosted ? "blur(1.6px)" : undefined }}>
          {p.shows}
        </span>
        {settledAs && (
          <motion.span
            aria-hidden
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 380, damping: 14 }}
            style={{ position: "absolute", top: 5, right: 5, display: "grid", placeItems: "center" }}
          >
            <PixIcon emoji={isFrosted ? "🔒" : "👍"} size={22} />
          </motion.span>
        )}
      </motion.button>
    );
  };

  /* ───────── One of the two answers ───────── */
  const renderAnswer = (c: PaneCall) => {
    const face = c === "frost"
      ? { label: frostLabel, icon: "🔒", tint: FROST_BLUE }
      : { label: clearLabel, icon: "👀", tint: OPEN_GREEN };
    const glow = !everCalled && !!pane && !feedback && narr === "idle";
    return (
      <motion.button
        key={c}
        type="button"
        aria-label={face.label}
        onClick={() => call(c)}
        disabled={speaking || !pane}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
        animate={{ opacity: pane ? 1 : 0.42, y: 0 }}
        transition={{ duration: 0.22 }}
        whileTap={speaking || !pane || reduce ? undefined : { scale: 0.97 }}
        style={{
          position: "relative",
          flex: `1 1 ${ANSWER_MIN_W}px`,
          minWidth: 0,
          minHeight: ANSWER_MIN_H,
          padding: "10px 12px",
          borderRadius: 14,
          // Both answers wear the same paper, size and ink on every pane: only
          // their own fixed meaning tells them apart, never the pane on screen.
          background: "#fff6e8",
          border: "3px solid #ffffff",
          boxShadow: "0 10px 20px -12px rgba(0,0,0,0.85), inset 0 0 0 2px rgba(32,48,63,0.14)",
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
          cursor: speaking || !pane ? "default" : "pointer",
          touchAction: "manipulation",
          transition: "opacity 220ms ease, box-shadow 200ms ease",
          ...guideStyle(glow),
        }}
      >
        {/* A colour band per answer, in the same place on both: a landmark for
            a six year old, and it says nothing about the pane on screen. */}
        <span aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, borderRadius: "11px 11px 0 0", background: face.tint }} />
        <PixIcon emoji={face.icon} size={26} />
        <span style={{ overflowWrap: "anywhere" }}>{face.label}</span>
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

      {/* Sarah's read-alouds (audio only): the how-to once, then each pane as
          the child lifts it. Gated on !showIntro, always: a board line that
          starts while the intro card is still open clobbers the intro's own
          clip and the "I'm ready" button never appears (the SignBingo /
          SenderLineup bug). Every line comes from the week file. */}
      {!showIntro && !finished && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="fm-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
          {narr === "read" && pane && (
            <InfoNarration key={`fm-read-${pane.id}`} speaker={voice} lines={[pane.readAloud]} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
        </div>
      )}

      {!showIntro && !finished && (
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Side padding keeps the header clear of the frame's corner ornaments. */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "2px 22px 0" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: accent }}>
              <PixIcon emoji={introIcon} size={16} />
              {introTitle}
            </span>
            <span style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c9b8ff" }}>
              {doneCount} of {deck.length} called
            </span>
          </div>

          {/* The board: the hall, the mirror on its wall, and the two answers.
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
              <PixIcon emoji="🆔" size={16} />
              <span>{mirrorLabel}</span>
              <span style={{ marginLeft: "auto", color: "rgba(255,247,230,0.65)" }}>
                Work them in any order you like
              </span>
            </div>

            {/* THE MIRROR: the whole profile in one look, which is exactly how
                a stranger meets it. */}
            <div
              style={{
                width: "100%",
                borderRadius: 16,
                background: HALL,
                border: `4px solid ${FRAME_GOLD}`,
                padding: 10,
                boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.14), 0 18px 40px -22px rgba(0,0,0,0.9)",
                display: "grid",
                gap: 8,
              }}
              className="fmMirrorGrid"
            >
              {deck.map(renderPane)}
            </div>

            <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ ...eyebrowStyle, minHeight: 14, display: "flex", alignItems: "center", gap: 6, textAlign: "center" }}>
                <PixIcon emoji="❓" size={16} />
                {askPrompt}
              </div>
              {/* The two answers never move: frost then clear, every pane,
                  every play, so the child learns where they live. They dim
                  until a pane is lifted, because there is nothing to answer
                  about until then. */}
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
            .fmMirrorGrid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
            @media (max-width: 760px) { .fmMirrorGrid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
            @media (max-width: 430px) { .fmMirrorGrid { grid-template-columns: minmax(0, 1fr); } }
            @keyframes fmGuide { 0%,100% { box-shadow: 0 0 0 3px ${accent}55, 0 0 16px ${accent}77 } 50% { box-shadow: 0 0 0 6px ${accent}22, 0 0 28px ${accent} } }
          `}</style>
        </div>
      )}

      <AnimatePresence>
        {feedback && (
          <WrongAnswerPanel
            title={feedback.title}
            explanation={feedback.explanation}
            tip={feedback.tip}
            onContinue={() => setFeedback(null)}
          />
        )}
      </AnimatePresence>

      {/* The payoff waits for Sarah: a complete beat that mounts while the last
          verdict is still speaking would cut her off (the Week 9 bug). */}
      {finished && !verdict.speaking && (
        <ExerciseCompleteBeat
          title={completeTitle}
          stars={stars}
          statLines={[
            `${deck.length} panes called, and the ones worth showing are still on show`,
            completeLine,
          ]}
          narration={completeNarration}
          onContinue={() => onComplete(stars === 3 ? 100 : stars === 2 ? 70 : 40)}
        />
      )}
    </ExerciseFrame>
  );
}
