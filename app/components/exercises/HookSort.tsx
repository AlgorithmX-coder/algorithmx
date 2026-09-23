"use client";

/**
 * HookSort — the calm binary SORT: one thing at a time, two big calls.
 *
 * TWO SKINS.
 *
 * `skin: "dock"` (the default, and untouched) is the original Fishing Dock:
 * one message at a time dangles on a fishing line over the water and the child
 * makes the call with two big buttons: REEL IN (it's real — the line winds up
 * and the message lands safely in the keep-net) or CUT THE LINE (it's a scam —
 * snip! the bait drops into the deep). Every pixel, string and timing of that
 * skin is exactly as it shipped, because the weeks that still mount it have
 * not been rebuilt yet.
 *
 * `skin: "house"` is the Week 14 Ears Check, for The Listening House. One
 * ordinary house thing comes to rest on a lamp-lit mat and the child makes the
 * Scout's call with two big buttons: has it got EARS, or is it fast asleep?
 * Every call sends the thing into one of two open nooks under the board, so
 * both shelves fill up as the child works and the round ends with the house
 * mapped: this is who hears, this is who does not. That map IS the reward.
 *
 * The house skin is deliberately CURIOUS, NEVER CREEPY (the owner's Week 14
 * tone rule). It is a warm evening room, not a stakeout: the lamp is on, the
 * palette is honey and cocoa, the EARS ON nook glows a friendly lantern-cyan
 * and the ASLEEP nook a soft moonlit lilac. Neither call is coloured as a
 * danger, neither answer makes a thing "bad to own", and the surprise the
 * round is built around (a telly, a games console and a talking toy have ears;
 * a kettle and a teddy do not) lands as a discovery, never as a warning about
 * the child's own home.
 *
 * Nothing races the child in either skin: tap-only, untimed, one thing in
 * play, no lose state, and a wrong call costs nothing but Sarah explaining it.
 *
 * Learn-Loop wiring (both skins): Raccoon boast in the intro (`threat`),
 * Sarah's how-to once and every thing's `readAloud` spoken as it arrives
 * (audio-only, `recordedOnly`, taps held while she speaks, released by the
 * shared SPOKEN_GATE_MAX_MS and by the master mute), a one-take spoken verdict
 * on every call ("That's right!" + that thing's `why` via VerdictVoice; a
 * wrong call: WrongAnswerPanel speaks "Not quite." + that thing's
 * `explanation`), hint tiers, and a payoff on the complete beat gated on
 * `!verdict.speaking` so it can never cut Sarah off. The next thing is walked
 * in from the verdict's own callback, for exactly the same reason. The list is
 * shuffled once per play, so the authored alternation is never the answer.
 *
 * A synchronous ref latch shuts both calls the instant one is made, because
 * `speaking` only closes once React has re-rendered and a quick second tap
 * inside that window would restart the verdict and cut Sarah off mid-sentence
 * (the real Week 12 bug). The latch is released from the verdict callback on a
 * right call and at once on a wrong one, so a retry is always one tap.
 *
 * The first thing guides the MECHANIC only: BOTH call buttons breathe
 * together, equally, so the glow says "one of these two", never which one.
 *
 * CRITICAL for the week author: every spoken string arrives through props
 * (`introNarration`, `coachLines`, `threat`, each item's `readAloud`, `why`
 * and `explanation`, `hints`, `completeNarration`). The clip generator reads
 * the WEEK FILE, so anything left to a component default is never recorded and
 * plays as silence, with no error anywhere. Which field is spoken where:
 *   - the thing arrives -> `item.readAloud`
 *   - a RIGHT call      -> `item.why`         (after the shared "That's right!")
 *   - a WRONG call      -> `item.explanation` (after the shared "Not quite.")
 * A line in the wrong one of those three is silent even when it is not empty.
 *
 * Authoring (house skin): six to eight things, mixed so neither call runs three
 * in a row, and at least one genuine surprise on each side. `isScam: true`
 * means the CUT button is the right call, which in this skin is EARS ON. Keep
 * `text` to about 30 characters, `readAloud` to one short sentence, and `why`
 * and `explanation` to one kid-sized sentence each. Every icon must be in
 * PixIcon's MAP or it renders as a flat system emoji.
 *
 * Layout budget at the owner's 1414x771 window (HUD 64 + stage padding 40, so
 * the stage holds ~627px before it grows): header 29 + marginBottom 10 + board
 * 26 (padding and border) + thing 132 + gap 12 + ask row 20 + gap 10 + calls 52
 * + gap 12 + nooks 104 + strip 28 + hint gap 8 = ~443px, so the thing, both
 * calls and both nooks are on screen without a scroll. At 400px the two calls
 * and the two nooks each fall into one column and nothing scrolls sideways.
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
import CoachCaption from "@/app/components/lesson/CoachCaption";
import WrongAnswerPanel from "@/app/components/lesson/WrongAnswerPanel";
import HintBubble from "@/app/components/lesson/HintBubble";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import { useVerdictVoice } from "@/app/components/lesson/VerdictVoice";
import GameButton from "@/app/components/lesson/GameButton";
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

export interface HookItem {
  id: string;
  text: string;
  /** Emoji rendered via PixIcon on the dangling card. */
  icon?: string;
  /** True = a scam — the right call is CUT THE LINE (house skin: EARS ON). */
  isScam: boolean;
  /** SPOKEN as the thing arrives. Week file only, or it plays as silence. */
  readAloud?: string;
  /** SPOKEN on a RIGHT call, after the shared "That's right!". Week file only. */
  why?: string;
  /** SPOKEN on a WRONG call after "Not quite.", and shown in the panel. */
  explanation: string;
}

export interface HookSortProps {
  items: HookItem[];
  /** Visual skin: the W4 fishing dock (default), the W14 listening house, or
   *  the W18 charging rack. House and rack share a layout and differ in paint
   *  and copy; the dock is untouched by both. */
  skin?: "dock" | "house" | "rack";
  /** Copy overrides (re-theme per week; defaults keep the W4 dock skin). */
  introTitle?: string;
  introSubtitle?: string;
  introIcon?: string;
  reelLabel?: string;
  cutLabel?: string;
  reelToast?: string;
  cutToast?: string;
  wrongScamTitle?: string;
  wrongRealTitle?: string;
  completeTitle?: string;
  completeLine?: string;
  /** Counter noun in the progress line ("CATCH 3 of 8"). Never spoken. */
  progressNoun?: string;
  /** House skin only: the board's question row. Never spoken. */
  askPrompt?: string;
  /** House skin only: the two nooks the calls fill up. Never spoken. */
  cutBinLabel?: string;
  reelBinLabel?: string;
  hints?: { tier1: string; tier2: string };
  introNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  coachLines?: { speaker?: "adam" | "layla"; lines: string[] };
  threat?: { raccoonLine: string };
  completeNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  onComplete: (score: number) => void;
  onCorrect?: () => void;
  onWrong?: () => void;
  onHintReached?: (tier: 1 | 2 | 3) => void;
  onAnswered?: (data: {
    questionKey: string;
    selectedIndex: number;
    correctIndex: number;
    wasCorrect: boolean;
  }) => void;
}

const KID_FONT = "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif";
const LABEL_FONT = "'Space Grotesk', sans-serif";
/** Geometry (px), house skin. */
const THING_MIN_H = 132;
const NOOK_MIN_H = 92;
/** Paints, house skin. A lamp-lit evening room: honey, cocoa, two nooks. */
interface SortPalette {
  bg: string;
  board: string;
  mat: string;
  /** The hue of the CUT nook (house: ears on; rack: not mine). */
  cutHue: string;
  cutHueDeep: string;
  /** The hue of the REEL nook (house: sleeping; rack: mine). */
  reelHue: string;
  reelHueDeep: string;
  ink: string;
}

/** Week 14's lamp-lit evening room: honey and cocoa, two warm nooks. */
const HOUSE_PALETTE: SortPalette = {
  bg: "linear-gradient(180deg, #2f1f10 0%, #241708 58%, #180f06 100%)",
  board: "linear-gradient(180deg, rgba(0,0,0,0.26) 0%, rgba(0,0,0,0.42) 100%)",
  mat: "radial-gradient(ellipse at 50% 42%, rgba(255,201,138,0.22) 0%, rgba(255,201,138,0.06) 58%, transparent 74%)",
  cutHue: "#45e3ff", cutHueDeep: "#2da8c9",
  reelHue: "#b9a7ff", reelHueDeep: "#7c6bd6",
  ink: "#fff3e2",
};

/** Week 18's charging rack: cool slate and morning steel, nothing like the
 *  evening room four weeks earlier, so a parent could never take one board
 *  for the other. */
const RACK_PALETTE: SortPalette = {
  bg: "linear-gradient(180deg, #16202e 0%, #101825 58%, #0b1119 100%)",
  board: "linear-gradient(180deg, rgba(0,0,0,0.24) 0%, rgba(0,0,0,0.4) 100%)",
  mat: "radial-gradient(ellipse at 50% 42%, rgba(146,199,255,0.2) 0%, rgba(146,199,255,0.06) 58%, transparent 74%)",
  cutHue: "#ffb45c", cutHueDeep: "#d2823a",
  reelHue: "#5fe0a8", reelHueDeep: "#2f9e73",
  ink: "#eef6ff",
};

export default function HookSort({
  items,
  skin = "dock",
  introTitle,
  introSubtitle,
  introIcon,
  reelLabel,
  cutLabel,
  reelToast,
  cutToast,
  wrongScamTitle,
  wrongRealTitle,
  completeTitle,
  completeLine,
  progressNoun,
  askPrompt,
  cutBinLabel,
  reelBinLabel,
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
}: HookSortProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;
  const accent = useLessonTheme()?.accent ?? "#2b7fff";
  // Both alternative skins run the house LAYOUT; only the paint differs.
  const house = skin === "house" || skin === "rack";
  const pal = skin === "rack" ? RACK_PALETTE : HOUSE_PALETTE;
  // Both content voices are Sarah; in-game read-alouds and verdict reasons are
  // recorded under "adam", so every manifest lookup here uses that key. Never
  // derive it from the intro narration's speaker.
  const voice = "adam" as const;

  const [showIntro, setShowIntro] = useState(true);
  const [idx, setIdx] = useState(0);
  // null = dangling; "reeled" = wound up into the net; "cut" = dropped
  const [resolved, setResolved] = useState<null | "reeled" | "cut">(null);
  const [wrongCount, setWrongCount] = useState(0);
  const [itemWrongs, setItemWrongs] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  // Read-aloud chain: the how-to once as the board opens, then each thing as it
  // arrives. Taps are held while she speaks. "idle" = nothing playing.
  const [narr, setNarr] = useState<"howto" | "read" | "idle">("idle");
  // House skin: the things already called, in the order the child sorted them.
  const [sorted, setSorted] = useState<{ id: string; icon?: string; text: string; ears: boolean }[]>([]);

  // Anti-sequence: the catches come up in a random order every play (authored
  // lists alternate real/scam). The REEL / CUT buttons keep their sides.
  const shownItems = useShuffledOnce(items);
  const finished = idx >= shownItems.length;
  const item = shownItems[idx];

  // Spoken verdicts: Sarah says "That's right!" + why, and the next thing waits
  // for her. Wrong calls speak through WrongAnswerPanel.
  const verdict = useVerdictVoice(voice);
  const speaking = narr !== "idle" || verdict.speaking || !!feedback || !!resolved;
  // `speaking` only closes once React has re-rendered, so a quick second tap
  // landed inside that window and restarted the verdict, cutting Sarah off
  // mid-sentence (the Week 12 bug). This latch shuts both calls synchronously.
  const handlingRef = useRef(false);

  // Safety releases for the spoken gate (never leave the board held).
  useEffect(() => {
    if (narr === "idle") return;
    const id = window.setTimeout(() => setNarr("idle"), SPOKEN_GATE_MAX_MS);
    return () => window.clearTimeout(id);
  }, [narr]);
  useEffect(() => subscribeAudioMute((muted) => { if (muted) setNarr("idle"); }), []);

  const reportedTier = useRef(0);
  useEffect(() => {
    const tier = wrongCount >= 2 ? 2 : wrongCount >= 1 ? 1 : 0;
    if (tier > reportedTier.current) {
      reportedTier.current = tier;
      onHintReached?.(tier as 1 | 2);
    }
  }, [wrongCount, onHintReached]);

  const startBoard = () => {
    setShowIntro(false);
    if (isAudioMuted()) {
      setNarr("idle");
      return;
    }
    // The dock keeps its visible CoachCaption, which plays that same clip
    // itself, so only the house skin speaks the how-to through this chain -
    // otherwise the two would talk over each other.
    setNarr(house && coachLines ? "howto" : shownItems[0]?.readAloud ? "read" : "idle");
  };

  // The only place idx ever moves, so the per-thing state is cleared here
  // rather than from an effect that watches it, and Sarah is handed the next
  // thing's read-aloud in the same beat.
  const advance = () => {
    const next = idx + 1;
    setIdx(next);
    setResolved(null);
    setItemWrongs(0);
    setNarr(!isAudioMuted() && shownItems[next]?.readAloud ? "read" : "idle");
  };

  const call = (cut: boolean) => {
    if (!item || resolved || showIntro || feedback) return;
    if (speaking) return;
    // Synchronous: a second tap in the same frame must never reach the verdict.
    if (handlingRef.current) return;
    handlingRef.current = true;
    setHasInteracted(true);
    const wasCorrect = cut === item.isScam;
    onAnswered?.({
      questionKey: `hook-${item.id}`,
      selectedIndex: cut ? 1 : 0,
      correctIndex: item.isScam ? 1 : 0,
      wasCorrect,
    });
    if (wasCorrect) {
      audio.correct();
      fx.correct({ xp: 25, text: cut ? (cutToast ?? "SCAM CUT LOOSE!") : (reelToast ?? "REAL - REELED IN!") });
      onCorrect?.();
      setCorrectCount((n) => n + 1);
      setResolved(cut ? "cut" : "reeled");
      setSorted((prev) => [...prev, { id: item.id, icon: item.icon, text: item.text, ears: cut }]);
      // Sarah: "That's right!" + this thing's why, then the next one. Walking on
      // from her callback is what keeps a payoff from ever cutting her off.
      verdict.say("right", item.why, () => {
        handlingRef.current = false;
        window.setTimeout(advance, reduce ? 200 : 900);
      });
    } else {
      audio.wrong();
      onWrong?.();
      setWrongCount((n) => n + 1);
      const w = itemWrongs + 1;
      setItemWrongs(w);
      // WrongAnswerPanel speaks "Not quite." + this teach line itself; the same
      // thing waits where it is, so the retry is one tap.
      setFeedback({
        title: item.isScam ? (wrongScamTitle ?? "Careful - that one was a SCAM") : (wrongRealTitle ?? "Wait - that one was real!"),
        explanation: item.explanation,
        tip: w >= 2 ? hints?.tier2 : hints?.tier1,
      });
      handlingRef.current = false;
    }
  };

  const stars = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1;

  /* ─────────────────────────── HOUSE SKIN ─────────────────────────── */
  // The first thing teaches the mechanic only: BOTH calls breathe together, so
  // the glow can never point at an answer.
  const guided = house && idx === 0 && !hasInteracted && !speaking;
  const guideStyle = (on: boolean): CSSProperties =>
    on
      ? { boxShadow: `0 0 0 3px ${accent}66, 0 0 22px ${accent}88`, animation: reduce ? undefined : "hsGuide 1.4s ease-in-out infinite" }
      : {};
  const remaining = Math.max(shownItems.length - idx - (resolved ? 1 : 0), 0);
  const houseStrip = resolved
    ? "Good call. Here comes the next one"
    : itemWrongs > 0
      ? "Have another think about this one"
      : guided
        ? "Make the call with one of the two big buttons"
        : remaining <= 1
          ? "Last one, Cyber Hero"
          : `${remaining} more things to check`;

  const eyebrowStyle: CSSProperties = {
    fontFamily: LABEL_FONT,
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: accent,
  };

  /** One nook under the board, filling up as the child makes the calls. */
  const nook = (ears: boolean): ReactNode => {
    const hue = ears ? pal.cutHue : pal.reelHue;
    const kept = sorted.filter((s) => s.ears === ears);
    const label = ears ? (cutBinLabel ?? "EARS ON") : (reelBinLabel ?? "FAST ASLEEP");
    return (
      <div style={{ flex: "1 1 220px", minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, minHeight: 16, ...eyebrowStyle, color: hue }}>
          <PixIcon emoji={ears ? "🔔" : "🤫"} size={16} />
          <span style={{ overflowWrap: "anywhere" }}>{label}</span>
          <span style={{ marginLeft: "auto", color: "rgba(255,243,226,0.65)" }}>{kept.length}</span>
        </div>
        <div
          role="status"
          aria-label={label}
          style={{
            minHeight: NOOK_MIN_H,
            borderRadius: 16,
            border: kept.length ? `2px solid ${hue}aa` : "2px dashed rgba(255,243,226,0.18)",
            background: kept.length ? `${hue}14` : "rgba(0,0,0,0.18)",
            padding: "9px 11px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            alignContent: "center",
            justifyContent: kept.length ? "flex-start" : "center",
            gap: 7,
            color: pal.ink,
            fontFamily: KID_FONT,
            transition: "border-color 220ms ease, background 220ms ease",
          }}
        >
          {kept.length === 0 ? (
            <span style={{ opacity: 0.55, fontFamily: LABEL_FONT, fontSize: 10.5, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", textAlign: "center" }}>
              Nothing here yet
            </span>
          ) : (
            kept.map((s, i) => (
              <motion.span
                key={s.id}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 320, damping: 20, delay: i === kept.length - 1 ? 0.1 : 0 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  maxWidth: "100%",
                  padding: "5px 10px 5px 6px",
                  borderRadius: 999,
                  background: "rgba(10,7,4,0.6)",
                  border: `1.5px solid ${hue}`,
                  fontSize: 12.5,
                  fontWeight: 800,
                  lineHeight: 1.2,
                  overflowWrap: "anywhere",
                }}
              >
                {s.icon && <PixIcon emoji={s.icon} size={18} />}
                {s.text}
              </motion.span>
            ))
          )}
        </div>
      </div>
    );
  };

  /** The two calls. Same size, same weight; neither is coloured as a danger,
   *  because in this house neither answer makes a thing bad to own. */
  const houseCalls: ReactNode = (
    <div style={{ width: "100%", display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", position: "relative", zIndex: 3 }}>
      <GameButton
        variant="primary"
        size="lg"
        disabled={speaking}
        onClick={() => call(true)}
        style={{
          flex: "1 1 210px",
          maxWidth: 320,
          background: `linear-gradient(135deg, ${pal.cutHue}, ${pal.cutHueDeep})`,
          color: "#04212b",
          boxShadow: `0 6px 22px ${pal.cutHue}55`,
          ...guideStyle(guided),
        }}
      >
        {cutLabel ?? "✂️ CUT THE LINE - scam!"}
      </GameButton>
      <GameButton
        variant="primary"
        size="lg"
        disabled={speaking}
        onClick={() => call(false)}
        style={{
          flex: "1 1 210px",
          maxWidth: 320,
          background: `linear-gradient(135deg, ${pal.reelHue}, ${pal.reelHueDeep})`,
          color: "#140d24",
          boxShadow: `0 6px 22px ${pal.reelHue}55`,
          ...guideStyle(guided),
        }}
      >
        {reelLabel ?? "🎣 REEL IN - it's real"}
      </GameButton>
    </div>
  );

  const houseBoard: ReactNode = item && !finished ? (
    <div style={{ position: "relative", zIndex: 2 }}>
      {/* Side padding keeps the header clear of the frame's corner ornaments. */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "2px 22px 0" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: accent }}>
          <PixIcon emoji={introIcon ?? "🏠"} size={16} />
          {introTitle ?? "The Fishing Dock"}
        </span>
        <span style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#ffc98a" }}>
          {progressNoun ?? "CATCH"} {Math.min(idx + 1, shownItems.length)} of {shownItems.length}
        </span>
      </div>

      {/* The board: the mat, the two calls, the two nooks. Inset 22px so it
          never collides with the frame's rounded corners. */}
      <div
        style={{
          margin: "0 22px",
          padding: 12,
          borderRadius: 18,
          background: pal.board,
          border: `1px solid ${accent}44`,
          boxShadow: `0 18px 40px -22px rgba(0,0,0,0.8), inset 0 0 0 1px ${accent}14`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* The thing, at rest on its lamp-lit mat */}
        <div
          style={{
            width: "100%",
            minHeight: THING_MIN_H,
            borderRadius: 18,
            background: pal.mat,
            border: "1.5px solid rgba(255,201,138,0.28)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px 12px",
            overflow: "hidden",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={item.id}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.94 }}
              animate={
                resolved === "cut"
                  ? { opacity: 0, y: -30, scale: 0.9 }
                  : resolved === "reeled"
                    ? { opacity: 0, y: 30, scale: 0.9 }
                    : { opacity: 1, y: 0, scale: 1 }
              }
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              transition={resolved ? { duration: reduce ? 0.3 : 0.6, ease: "easeIn" } : { type: "spring", stiffness: 220, damping: 22 }}
              style={{ display: "flex", alignItems: "center", gap: 14, maxWidth: 520 }}
            >
              <motion.span
                aria-hidden
                animate={reduce || resolved ? {} : { y: [0, -4, 0] }}
                transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  flexShrink: 0,
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(10,7,4,0.5)",
                  border: "2px solid rgba(255,201,138,0.55)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
                }}
              >
                {item.icon && <PixIcon emoji={item.icon} size={42} />}
              </motion.span>
              <span
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontFamily: KID_FONT,
                  fontSize: 19,
                  fontWeight: 800,
                  lineHeight: 1.3,
                  color: pal.ink,
                  overflowWrap: "anywhere",
                }}
              >
                {item.text}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{ ...eyebrowStyle, minHeight: 14, display: "flex", alignItems: "center", gap: 6, textAlign: "center" }}>
            <PixIcon emoji="❓" size={16} />
            {askPrompt ?? "Make the call"}
          </div>
          {houseCalls}
        </div>

        <div style={{ width: "100%", display: "flex", flexWrap: "wrap", gap: 10 }}>
          {nook(true)}
          {nook(false)}
        </div>
      </div>

      {/* On-board instructions: the current beat, in the child's words. */}
      <div style={{ textAlign: "center", marginTop: 12 }}>
        <div style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: accent, minHeight: 16, padding: "0 16px" }}>
          {houseStrip}
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: "8px auto 0" }}>
        {itemWrongs > 0 && hints && (
          <HintBubble tier={itemWrongs >= 2 ? 2 : 1} speaker={voice} text={itemWrongs >= 2 ? hints.tier2 : hints.tier1} />
        )}
      </div>

      <style>{`
        @keyframes hsGuide { 0%,100% { box-shadow: 0 0 0 3px ${accent}55, 0 0 16px ${accent}77 } 50% { box-shadow: 0 0 0 6px ${accent}22, 0 0 28px ${accent} } }
      `}</style>
    </div>
  ) : null;

  return (
    <ExerciseFrame
      maxWidth={house ? 860 : 760}
      background={house ? pal.bg : "linear-gradient(180deg, #0a1230 0%, #0a1f4d 55%, #06355c 100%)"}
      style={{ position: "relative", overflow: "hidden" }}
    >
      {fx.layer()}
      {verdict.element}

      {/* Water at the bottom of the scene (dock skin only) */}
      {!house && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 110,
            background: "linear-gradient(180deg, rgba(0,180,255,0.16) 0%, rgba(0,90,170,0.4) 100%)",
            borderTop: "2px solid rgba(125,240,255,0.35)",
          }}
        />
      )}

      {showIntro && (
        <ExerciseIntroBeat
          title={introTitle ?? "The Fishing Dock"}
          subtitle={introSubtitle ?? "Messages are on the lines. Reel in the real ones - cut the scams loose!"}
          icon={introIcon ?? (house ? "🏠" : "🪤")}
          narration={introNarration}
          threat={threat}
          character={introNarration?.speaker}
          // Full-screen modal: in-frame, a long intro was clipped by this frame's
          // overflow and "I'm ready" could not be tapped (UAT batch 3 sweep).
          overlay
          onDismiss={startBoard}
        />
      )}

      {/* Sarah's read-alouds (audio only): the how-to once, then each thing as
          it arrives. Every line comes from the week file, never from a default. */}
      {!showIntro && !finished && item && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration
              key="hs-howto"
              speaker={coachLines.speaker ?? voice}
              lines={coachLines.lines}
              accent={accent}
              recordedOnly
              onDone={() => setNarr(!isAudioMuted() && item.readAloud ? "read" : "idle")}
            />
          )}
          {narr === "read" && item.readAloud && (
            <InfoNarration key={`hs-read-${item.id}`} speaker={voice} lines={[item.readAloud]} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
        </div>
      )}

      {house
        ? houseBoard
        : item && !finished && (
            <div style={{ position: "relative", zIndex: 2, minHeight: 430 }}>
              {/* Rod + line + dangling message */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={item.id}
                  initial={reduce ? false : { y: -220, opacity: 0 }}
                  animate={
                    resolved === "reeled"
                      ? { y: -240, opacity: 0 }
                      : resolved === "cut"
                        ? { y: 260, opacity: 0, rotate: 8 }
                        : { y: 0, opacity: 1 }
                  }
                  exit={reduce ? undefined : { opacity: 0 }}
                  transition={
                    resolved
                      ? { duration: reduce ? 0.3 : 0.8, ease: "easeIn" }
                      : { type: "spring", stiffness: 140, damping: 18 }
                  }
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    paddingTop: 6,
                  }}
                >
                  {/* the line */}
                  <div
                    aria-hidden
                    style={{
                      width: 2,
                      height: 84,
                      background: "linear-gradient(180deg, rgba(255,255,255,0.5), rgba(255,255,255,0.15))",
                    }}
                  />
                  {/* the hook card */}
                  <motion.div
                    animate={reduce || resolved ? {} : { rotate: [-1.4, 1.4, -1.4] }}
                    transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                      maxWidth: 470,
                      padding: "16px 20px",
                      borderRadius: 16,
                      background: "linear-gradient(165deg, #fff8e8 0%, #ffe9bd 100%)",
                      border: "2px solid #d9a83c",
                      boxShadow: "0 18px 40px -18px rgba(0,0,0,0.75)",
                      color: "#4a3208",
                      fontSize: 17,
                      fontWeight: 800,
                      lineHeight: 1.4,
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    {item.icon && <PixIcon emoji={item.icon} size={34} />}
                    <span>{item.text}</span>
                  </motion.div>
                </motion.div>
              </AnimatePresence>

              {/* Call buttons */}
              <div
                style={{
                  display: "flex",
                  gap: 14,
                  justifyContent: "center",
                  marginTop: 26,
                  position: "relative",
                  zIndex: 3,
                }}
              >
                <GameButton
                  variant="success"
                  size="lg"
                  disabled={!!resolved || !!feedback || speaking}
                  onClick={() => call(false)}
                >
                  {reelLabel ?? "🎣 REEL IN - it's real"}
                </GameButton>
                <GameButton
                  variant="danger"
                  size="lg"
                  disabled={!!resolved || !!feedback || speaking}
                  onClick={() => call(true)}
                >
                  {cutLabel ?? "✂️ CUT THE LINE - scam!"}
                </GameButton>
              </div>

              <div
                style={{
                  textAlign: "center",
                  marginTop: 12,
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#7d9cc9",
                  letterSpacing: "0.1em",
                }}
              >
                {progressNoun ?? "CATCH"} {Math.min(idx + 1, shownItems.length)} OF {shownItems.length} ·{" "}
                {correctCount} sorted right
              </div>

              <div style={{ maxWidth: 560, margin: "10px auto 0" }}>
                {wrongCount === 1 && hints && <HintBubble tier={1} speaker="adam" text={hints.tier1} />}
                {wrongCount >= 2 && hints && <HintBubble tier={2} speaker="adam" text={hints.tier2} />}
              </div>
            </div>
          )}

      {/* The dock keeps its visible teach-once caption; the house skin speaks
          its how-to instead (audio only), so the two never stack. */}
      {!house && coachLines && !showIntro && !hasInteracted && !finished && (
        <CoachCaption lines={coachLines.lines} speaker={coachLines.speaker} />
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
          title={completeTitle ?? "The dock is clear!"}
          stars={stars}
          statLines={[
            `${correctCount}/${shownItems.length} calls right first try`,
            completeLine ?? "Real ones reeled in, scams cut loose.",
          ]}
          narration={completeNarration}
          onContinue={() => onComplete(correctCount)}
        />
      )}
    </ExerciseFrame>
  );
}
