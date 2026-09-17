"use client";

/**
 * FourEyes: the CALL AND DECIDE TOGETHER drill (Week 9, "Four Eyes").
 *
 * Every round is an install moment. Two copies of the same app page sit side
 * by side. "Your eyes" is the page as a child sees it: the icon, the name, the
 * star line, a tagline, fun screenshots and a big GET button, with the small
 * print too faint to read. "Grown-up's eyes" is the same page behind frosted
 * glass with a lock on it. The two decisions under the pages, INSTALL
 * TOGETHER and SKIP IT TOGETHER, are locked as well. The child taps CALL MY
 * GROWN-UP: the frost slides away and the grown-up's copy of the page shows
 * what the faint small print really says, each detail a marker ("Made by:
 * Unknown Dev 4412", "Wants: your contacts", "Coin shop inside", or "Made by:
 * City Library" on an app that is fine). The child taps every marker; Sarah
 * reads it and the marker shows what the grown-up thinks (Uh-oh, or Checks
 * out). Only when every marker has been read do the two decisions unlock:
 * the same paint and size, their sides flipped at random each round. At least
 * one round is a genuinely fine app, so skipping everything never wins.
 * Tapping GET on the child's own page installs nothing; it only nudges them
 * back to the grown-up (not judged, not scored).
 *
 * Why it is not Guard Count, the Undo Test, Flip the Box or the Request
 * Inspector (owner: "we never copy an exercise"): there are no guard slots to
 * count as HERE or MISSING across two rooms (Guard Count), nothing is shared,
 * deleted or checked on friends' phones (Undo Test), no box is turned through
 * its faces (Flip the Box), and the child is not tapping zones on the one form
 * they can already read (Request Inspector). The verb is CALL IN A SECOND PAIR
 * OF EYES: the child's own view never changes, a second view of the very same
 * page is summoned, and it shows what the first one hid. The lock on the
 * decision is the lesson itself: nothing installs until the grown-up has
 * looked too.
 *
 * Learn-Loop wiring: Raccoon boast in the intro (`threat`), Sarah's how-to
 * once, every round read aloud as it arrives and every marker read as it is
 * tapped (audio-only, `recordedOnly`, taps held), a spoken verdict on the
 * right decision ("That's right!" + why via VerdictVoice; wrong:
 * WrongAnswerPanel speaks "Not quite." + the round's teach line and every
 * marker stays read, so the retry is one tap), hint tiers per round, a spoken
 * payoff on the complete beat. Rounds and markers play in authored order.
 * Round 1 guides the MECHANIC only: CALL breathes until it is tapped, then
 * every unread marker breathes; the two decisions never glow. Tap-only, no
 * timer, no lose state.
 *
 * Authoring: 1 to 3 spots a round (label about 30 characters or fewer), 2 or
 * 3 perks (about 22 characters each), a tagline of one or two short lines.
 * Every icon (appIcon, spot icons) must be in PixIcon's MAP.
 *
 * Layout budget at the owner's 1414x771 window (HUD 64 + stage padding 40, so
 * the stage holds ~627px before it grows): header 29 + board 26 (padding and
 * border) + panel 436 (padding and border 24, eyebrow 18 + gap 6, page 388:
 * app header 46, tagline 36, three 48px markers 156, screenshots 56, GET 40,
 * gaps 32, padding and border 22) + decisions 64 (always shown, locked) +
 * strip 28 + hint gap 8 = ~591px (~606px if a long marker label wraps once it
 * is read), so CALL, every marker, both decisions and the strip are on screen
 * without a scroll.
 */

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGameAudio } from "@/app/lib/gameEngine/useGameAudio";
import { useExerciseFeedback } from "@/app/lib/gameEngine/useExerciseFeedback";
import { useMotionIntensity } from "@/app/lib/gameEngine/useMotionIntensity";
import { fisherYates } from "@/app/lib/gameEngine/useShuffledOnce";
import { isAudioMuted, subscribeAudioMute } from "@/app/lib/audioMute";
import { useLessonTheme } from "@/app/components/lesson/LessonThemeContext";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import ExerciseIntroBeat, { ExerciseCompleteBeat } from "@/app/components/lesson/ExerciseBeats";
import WrongAnswerPanel from "@/app/components/lesson/WrongAnswerPanel";
import HintBubble from "@/app/components/lesson/HintBubble";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import GameButton from "@/app/components/lesson/GameButton";
import { useVerdictVoice } from "@/app/components/lesson/VerdictVoice";
import PixIcon from "@/app/components/lesson/PixIcon";
import { SPOKEN_GATE_MAX_MS } from "@/app/lib/gameEngine/spokenGate";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Audio-only narration: Sarah's voice with no visible narration box (the text
// she reads is already on screen), same recipe as UndoTest / AskRing.
const AUDIO_ONLY_STYLE = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  pointerEvents: "none",
} as const;
// SPOKEN_GATE_MAX_MS is shared: see app/lib/gameEngine/spokenGate.ts.

export interface FourEyesSpot { id: string; label: string; icon: string; fishy: boolean; readAloud: string }
export interface FourEyesRound { id: string; appName: string; appIcon: string; kidView: { tagline: string; stars: string; perks: string[] }; readAloud: string; spots: FourEyesSpot[]; rightMove: "install" | "skip"; why: string; whyWrong: string }
export interface FourEyesProps {
  rounds: FourEyesRound[];
  introTitle?: string; introSubtitle?: string; introIcon?: string;
  yourEyesLabel?: string; grownUpEyesLabel?: string; callLabel?: string; installLabel?: string; skipLabel?: string;
  getLabel?: string; fishyChip?: string; fineChip?: string;
  installToast?: string; skipToast?: string; wrongTitle?: string; completeTitle?: string; completeLine?: string;
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

/** The two decisions. `onAnswered` reports indexes into this list (0 install,
 *  1 skip), whatever side the button sat on. */
type Move = "install" | "skip";
const MOVES: Move[] = ["install", "skip"];
type View = "kid" | "grown";

const EMPTY_SPOTS: FourEyesSpot[] = [];
const EMPTY_PERKS: string[] = [];
const KID_FONT = "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif";
const LABEL_FONT = "'Space Grotesk', sans-serif";
/** Geometry (px): two panels side by side, or stacked on a narrow board. */
const PANEL_MIN_W = 320;
const PANEL_MAX_W = 392;
const PANEL_GAP = 18;
/** Board padding (12 + 12) the wide test adds to the two panels. */
const WIDE_MIN = PANEL_MIN_W * 2 + PANEL_GAP + 24;
/** One small-print row: a faint line pair to the child, a marker to the grown-up. */
const ROW_MIN_H = 48;
const SHOT_H = 56;
const DECIDE_W = 280;
/** Paints. */
const PANEL_BG = "linear-gradient(180deg, rgba(18,24,58,0.92) 0%, rgba(10,14,36,0.94) 100%)";
const PAGE_BG = "linear-gradient(180deg, #101a3a 0%, #0a1128 100%)";
/** Screenshot tiles are painted by position, never by content. */
const SHOT_PAINT = [
  "linear-gradient(135deg, #7c5cff 0%, #ff6fb5 100%)",
  "linear-gradient(135deg, #16c6c1 0%, #2b7fff 100%)",
  "linear-gradient(135deg, #ffb13d 0%, #ff6a3d 100%)",
];
/** Faint small-print line widths (%), by row: the same squiggle every play. */
const PRINT_LINES: ReadonlyArray<readonly [number, number]> = [
  [78, 52],
  [62, 70],
  [84, 40],
];

export default function FourEyes({
  rounds,
  introTitle = "Four Eyes",
  introSubtitle = "Call your grown-up, look at the app together, then decide together.",
  introIcon = "👪",
  yourEyesLabel = "Your eyes",
  grownUpEyesLabel = "Grown-up's eyes",
  callLabel = "CALL MY GROWN-UP",
  installLabel = "INSTALL TOGETHER",
  skipLabel = "SKIP IT TOGETHER",
  getLabel = "GET",
  fishyChip = "Uh-oh",
  fineChip = "Checks out",
  installToast = "INSTALLED TOGETHER!",
  skipToast = "SKIPPED TOGETHER!",
  wrongTitle = "Look again, together",
  completeTitle = "Four eyes on every app!",
  completeLine = "New app? Get your grown-up. Four eyes catch what two eyes miss.",
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
}: FourEyesProps) {
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
  // Read-aloud chain: the how-to once as the board appears, each round as it
  // arrives, then each marker as it is tapped. Taps are held while she speaks.
  // "idle" = nothing playing.
  const [narr, setNarr] = useState<"howto" | "read" | "spot" | "idle">("idle");
  // The marker "spot" plays (its id).
  const [spotId, setSpotId] = useState<string | null>(null);
  // The grown-up has been called this round: the frost is gone.
  const [called, setCalled] = useState(false);
  // Markers read this round (by spot id).
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());
  // "sealed" = a right decision: the seal lands while Sarah says why, then the
  // next app arrives.
  const [phase, setPhase] = useState<"play" | "sealed">("play");
  const [outcome, setOutcome] = useState<Move | null>(null);
  // Which side each decision sits on, flipped fairly as each round arrives (a
  // two-item useShuffledOnce would always swap, which is a pattern, not a flip).
  const [moveOrder, setMoveOrder] = useState<Move[]>(MOVES);
  // GET taps on the child's own page this round (0 = no nudge showing).
  const [nudge, setNudge] = useState(0);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [roundWrongs, setRoundWrongs] = useState(0);
  const [totalWrongs, setTotalWrongs] = useState(0);
  // The board element and its width: two pages side by side need room, and a
  // narrow frame stacks the grown-up's page under the child's.
  const [boardEl, setBoardEl] = useState<HTMLDivElement | null>(null);
  const [boardW, setBoardW] = useState(0);

  // Authored order: each app builds on the last.
  const finished = idx >= rounds.length;
  const r = rounds[idx];
  const spots = r?.spots ?? EMPTY_SPOTS;
  const perks = r?.kidView.perks ?? EMPTY_PERKS;
  const allRead = called && spots.every((s) => readIds.has(s.id));
  const unlocked = allRead && phase === "play";
  const readTarget = narr === "spot" && spotId ? spots.find((s) => s.id === spotId) ?? null : null;
  // Round 1 teaches the mechanic only: CALL, then the markers.
  const guided = idx === 0;
  const wide = boardW === 0 || boardW >= WIDE_MIN;

  // Spoken verdicts: Sarah says "That's right!" + why and the next app waits
  // for her. Wrong decisions speak through WrongAnswerPanel.
  const verdict = useVerdictVoice(voice);
  const speaking = narr !== "idle" || verdict.speaking || !!feedback || phase === "sealed";

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

  // Track the board's width (before paint, so the layout never flashes).
  useIsoLayoutEffect(() => {
    if (!boardEl) return;
    const measure = () => setBoardW(boardEl.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(boardEl);
    return () => ro.disconnect();
  }, [boardEl]);

  const startBoard = () => {
    setShowIntro(false);
    setMoveOrder(fisherYates(MOVES));
    setNarr(isAudioMuted() ? "idle" : coachLines ? "howto" : "read");
  };

  const advance = () => {
    setIdx((i) => i + 1);
    setCalled(false);
    setReadIds(new Set());
    setSpotId(null);
    setOutcome(null);
    setNudge(0);
    setRoundWrongs(0);
    setMoveOrder(fisherYates(MOVES));
    setPhase("play");
    setNarr(isAudioMuted() ? "idle" : "read");
  };

  // CALL: the second pair of eyes arrives and the frost slides away.
  const callGrownUp = () => {
    if (!r || speaking || phase !== "play" || called) return;
    audio.transition();
    setCalled(true);
    setNudge(0);
  };

  // READ: a marker the grown-up spotted. Sarah reads it; it shows their call.
  const readSpot = (s: FourEyesSpot) => {
    if (!r || speaking || phase !== "play" || !called || readIds.has(s.id)) return;
    if (s.fishy) audio.cardFlip();
    else audio.select();
    setReadIds((prev) => new Set(prev).add(s.id));
    setNudge(0);
    if (s.readAloud && !isAudioMuted()) {
      setSpotId(s.id);
      setNarr("spot");
    }
  };

  // GET on the child's own page: installs nothing, points back to the grown-up.
  const tapGet = () => {
    if (!r || speaking || phase !== "play") return;
    audio.tap();
    setNudge((n) => n + 1);
  };

  // DECIDE TOGETHER: the only judged tap, unlocked once every marker is read.
  const decide = (move: Move) => {
    if (!r || speaking || !unlocked) return;
    const right = move === r.rightMove;
    onAnswered?.({
      questionKey: `foureyes-${r.id}`,
      selectedIndex: MOVES.indexOf(move),
      correctIndex: MOVES.indexOf(r.rightMove),
      wasCorrect: right,
    });
    setNudge(0);
    if (right) {
      fx.correct({ xp: 25, text: move === "install" ? installToast : skipToast });
      onCorrect?.();
      setOutcome(move);
      setPhase("sealed");
      // Sarah: "That's right!" + the round's why; the seal lands under her,
      // then the next app arrives.
      verdict.say("right", r.why, () => {
        window.setTimeout(advance, reduce ? 200 : 900);
      });
    } else {
      audio.wrong();
      onWrong?.();
      setTotalWrongs((n) => n + 1);
      const rw = roundWrongs + 1;
      setRoundWrongs(rw);
      // WrongAnswerPanel speaks "Not quite." + this teach line itself; every
      // marker stays read, so the retry is one tap.
      setFeedback({ title: wrongTitle, explanation: r.whyWrong, tip: rw >= 2 ? hints?.tier2 : hints?.tier1 });
    }
  };

  const stars = totalWrongs === 0 ? 3 : totalWrongs <= 2 ? 2 : 1;
  const hintText = roundWrongs >= 2 ? hints?.tier2 : roundWrongs === 1 ? hints?.tier1 : undefined;
  const hintTier = (roundWrongs >= 2 ? 2 : 1) as 1 | 2;
  const callGlow = guided && !called && !speaking && phase === "play";
  const guideStyle = (on: boolean): CSSProperties =>
    on
      ? { boxShadow: `0 0 0 3px ${accent}66, 0 0 22px ${accent}88`, animation: reduce ? undefined : "feGuide 1.4s ease-in-out infinite" }
      : {};
  const toRead = spots.filter((s) => !readIds.has(s.id)).length;
  const strip =
    phase === "sealed"
      ? outcome === "install"
        ? installToast
        : skipToast
      : !called
        ? nudge > 0
          ? `Not on your own! Tap ${callLabel} first`
          : guided
            ? `Round 1: tap ${callLabel}`
            : `New app? Tap ${callLabel} first`
        : !allRead
          ? nudge > 0
            ? "Not yet! Read every spot with your grown-up"
            : guided && readIds.size === 0
              ? "Round 1: tap each glowing spot to read it"
              : `Tap every spot your grown-up found. ${toRead} more to go`
          : nudge > 0
            ? "Decide together first, with the buttons below"
            : "Every spot read. Now decide together";

  const eyebrowStyle: CSSProperties = {
    fontFamily: LABEL_FONT,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: accent,
  };
  /** The store's GET pill: the same look on both pages. */
  const getPillStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    minHeight: 40,
    borderRadius: 999,
    background: "#eaf1ff",
    border: `2px solid ${accent}`,
    color: "#0b1a3a",
    fontFamily: LABEL_FONT,
    fontSize: 17,
    fontWeight: 900,
    letterSpacing: "0.16em",
  };

  /** One faint small-print row, as the child's eyes see it (unreadable). */
  const renderFinePrint = (s: FourEyesSpot, i: number): ReactNode => {
    const [a, b] = PRINT_LINES[i % PRINT_LINES.length];
    return (
      <div
        key={`print-${r?.id ?? "none"}-${s.id}`}
        aria-hidden
        style={{
          minHeight: ROW_MIN_H,
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.05)",
          padding: "6px 12px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 7,
        }}
      >
        <span style={{ display: "block", width: `${a}%`, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.13)" }} />
        <span style={{ display: "block", width: `${b}%`, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.08)" }} />
      </div>
    );
  };

  /** One marker, as the grown-up's eyes see it: tap to read. */
  const renderSpot = (s: FourEyesSpot, order: number): ReactNode => {
    if (!r) return null;
    const isRead = readIds.has(s.id);
    const glow = guided && !isRead && !speaking && phase === "play";
    const chip = s.fishy ? fishyChip : fineChip;
    const ring = isRead ? (s.fishy ? "#ffb020" : "#34d399") : accent;
    return (
      <motion.button
        key={`${r.id}-${s.id}`}
        type="button"
        aria-label={isRead ? `${s.label}: ${chip}` : `Spot: ${s.label}`}
        aria-pressed={isRead}
        onClick={() => readSpot(s)}
        disabled={speaking || isRead}
        initial={reduce ? { opacity: 0 } : { opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.28, delay: reduce ? 0 : 0.2 + order * 0.12 }}
        whileTap={speaking || isRead || reduce ? undefined : { scale: 0.97 }}
        style={{
          position: "relative",
          width: "100%",
          minHeight: ROW_MIN_H,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "5px 10px 5px 6px",
          borderRadius: 12,
          // Every unread marker wears the same highlight; only reading one
          // shows what the grown-up thinks of it.
          background: isRead ? (s.fishy ? "rgba(255,176,32,0.14)" : "rgba(52,211,153,0.13)") : `${accent}26`,
          border: `2px solid ${isRead ? `${ring}bb` : `${accent}cc`}`,
          color: "#fff7e6",
          textAlign: "left",
          fontFamily: KID_FONT,
          cursor: isRead ? "default" : speaking ? "wait" : "pointer",
          touchAction: "manipulation",
          transition: "background 220ms ease, border-color 220ms ease",
          ...guideStyle(glow),
        }}
      >
        <span aria-hidden style={{ flexShrink: 0, width: 32, height: 32, borderRadius: "50%", display: "grid", placeItems: "center", background: "rgba(8,10,22,0.55)", border: `1.5px solid ${ring}` }}>
          <PixIcon emoji={isRead ? (s.fishy ? "⚠️" : "👍") : "🔍"} size={20} />
        </span>
        <span aria-hidden style={{ flexShrink: 0, display: "grid", placeItems: "center" }}>
          <PixIcon emoji={s.icon} size={22} />
        </span>
        <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <span style={{ fontSize: 14, fontWeight: 800, lineHeight: 1.2, overflowWrap: "anywhere" }}>{s.label}</span>
          {isRead && (
            <motion.span
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              style={{ marginTop: 2, fontFamily: LABEL_FONT, fontSize: 10.5, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", color: s.fishy ? "#ffd68a" : "#9dfbbd" }}
            >
              {chip}
            </motion.span>
          )}
        </span>
      </motion.button>
    );
  };

  /** One fun screenshot tile from the store page. */
  const renderShot = (p: string, i: number): ReactNode => (
    <div
      key={`shot-${r?.id ?? "none"}-${i}`}
      style={{
        position: "relative",
        flex: "1 1 0",
        minWidth: 0,
        height: SHOT_H,
        borderRadius: 10,
        overflow: "hidden",
        background: SHOT_PAINT[i % SHOT_PAINT.length],
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.18)",
        padding: "5px 7px",
        display: "flex",
        alignItems: "flex-end",
      }}
    >
      <span aria-hidden style={{ position: "absolute", top: 4, right: 5, opacity: 0.85 }}>
        {r && <PixIcon emoji={r.appIcon} size={18} />}
      </span>
      <span style={{ position: "relative", fontSize: 11.5, fontWeight: 800, lineHeight: 1.15, color: "#ffffff", textShadow: "0 1px 3px rgba(0,0,0,0.65)", overflowWrap: "anywhere" }}>{p}</span>
    </div>
  );

  /** The app page. The child's copy keeps its small print faint; the
   *  grown-up's copy shows the markers once the grown-up is here (under the
   *  frost it is the same faint page, so nothing leaks early). */
  const renderPage = (view: View): ReactNode => {
    if (!r) return null;
    const grown = view === "grown";
    const open = grown && called;
    // The grown-up looks past the shiny parts, so they fade on that copy.
    const dim = open ? 0.42 : 1;
    // The grown-up's copy repeats the child's page: hide the repeats from
    // screen readers and keep only its markers.
    const repeat = grown ? true : undefined;
    return (
      <div
        aria-hidden={grown && !called ? true : undefined}
        style={{
          height: "100%",
          borderRadius: 16,
          background: PAGE_BG,
          border: `1px solid ${open ? `${accent}77` : "rgba(255,255,255,0.1)"}`,
          padding: 10,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          color: "#fff7e6",
          fontFamily: KID_FONT,
        }}
      >
        <div aria-hidden={repeat} style={{ display: "flex", alignItems: "center", gap: 10, opacity: dim, transition: "opacity 300ms ease" }}>
          <span
            style={{
              flexShrink: 0,
              width: 46,
              height: 46,
              borderRadius: 13,
              display: "grid",
              placeItems: "center",
              background: `linear-gradient(135deg, ${accent}55 0%, ${accent}22 100%)`,
              border: `1px solid ${accent}88`,
            }}
          >
            <PixIcon emoji={r.appIcon} size={32} />
          </span>
          <span style={{ minWidth: 0 }}>
            <span style={{ display: "block", fontFamily: LABEL_FONT, fontSize: 17, fontWeight: 900, lineHeight: 1.15, overflowWrap: "anywhere" }}>{r.appName}</span>
            {/* The star line as authored ("★★★★★" or "4.9 stars"), in gold. */}
            <span style={{ display: "block", marginTop: 3, fontSize: 14, fontWeight: 700, lineHeight: 1.2, letterSpacing: "0.04em", color: "#ffd24a", overflowWrap: "anywhere" }}>
              {r.kidView.stars}
            </span>
          </span>
        </div>

        <div aria-hidden={repeat} style={{ minHeight: 36, fontSize: 14.5, fontWeight: 700, lineHeight: 1.25, opacity: dim, overflowWrap: "anywhere", transition: "opacity 300ms ease" }}>
          {r.kidView.tagline}
        </div>

        {/* The small print: faint lines to the child, markers to the grown-up. */}
        <div role={open ? "group" : undefined} aria-label={open ? `What your grown-up spotted in ${r.appName}` : undefined} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {spots.map((s, i) => (open ? renderSpot(s, i) : renderFinePrint(s, i)))}
        </div>

        <div aria-hidden={repeat} style={{ display: "flex", gap: 6, marginTop: "auto", opacity: dim, transition: "opacity 300ms ease" }}>
          {perks.map(renderShot)}
        </div>

        {grown ? (
          <span aria-hidden style={{ ...getPillStyle, opacity: dim }}>
            {getLabel}
          </span>
        ) : (
          <motion.button
            type="button"
            aria-label={`${getLabel}: ${r.appName}`}
            onClick={tapGet}
            disabled={speaking}
            whileTap={speaking || reduce ? undefined : { scale: 0.97 }}
            style={{
              ...getPillStyle,
              cursor: speaking ? "wait" : "pointer",
              boxShadow: `0 8px 18px -10px ${accent}`,
              touchAction: "manipulation",
            }}
          >
            {getLabel}
          </motion.button>
        )}
      </div>
    );
  };

  /** One panel: its eyebrow, the page, and (grown-up's) the frost and CALL. */
  const renderPanel = (view: View): ReactNode => {
    if (!r) return null;
    const grown = view === "grown";
    return (
      <section
        key={view}
        aria-label={grown ? grownUpEyesLabel : yourEyesLabel}
        style={{
          flex: wide ? "1 1 0" : "0 0 auto",
          width: wide ? undefined : "100%",
          minWidth: 0,
          maxWidth: PANEL_MAX_W,
          borderRadius: 18,
          background: PANEL_BG,
          border: `1px solid ${grown && called ? accent : `${accent}55`}`,
          boxShadow: `0 18px 40px -22px rgba(0,0,0,0.7), inset 0 0 0 1px ${accent}22`,
          padding: "10px 12px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          transition: "border-color 300ms ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, minHeight: 18, padding: "0 2px", ...eyebrowStyle }}>
          <PixIcon emoji={grown ? "👪" : "👀"} size={18} />
          <span>{grown ? grownUpEyesLabel : yourEyesLabel}</span>
        </div>
        <div style={{ position: "relative", flex: 1, borderRadius: 16, overflow: "hidden" }}>
          {renderPage(view)}
          {grown && (
            <AnimatePresence>
              {!called && (
                <motion.div
                  key={`frost-${r.id}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0, transition: { duration: 0.2 } } : { y: "-102%", transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] } }}
                  transition={{ duration: 0.25 }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 3,
                    borderRadius: 16,
                    background: "linear-gradient(180deg, rgba(150,185,255,0.22) 0%, rgba(16,28,62,0.8) 100%)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.22)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 14,
                    padding: 16,
                  }}
                >
                  <span aria-hidden style={{ width: 72, height: 72, borderRadius: "50%", display: "grid", placeItems: "center", background: "rgba(8,12,30,0.55)", border: "1px solid rgba(255,255,255,0.25)" }}>
                    <PixIcon emoji="🔒" size={40} />
                  </span>
                  <span style={{ display: "inline-block", borderRadius: 16, ...guideStyle(callGlow) }}>
                    {/* A GET tap re-keys this wrapper, so the button wiggles once. */}
                    <span key={`wiggle-${nudge}`} style={{ display: "inline-block", animation: nudge > 0 && !reduce ? "feWiggle 0.55s ease-in-out" : undefined }}>
                      <GameButton variant="primary" size="lg" icon="👪" onClick={callGrownUp} disabled={speaking || phase !== "play"} aria-label={callLabel} style={{ minWidth: 220 }}>
                        {callLabel}
                      </GameButton>
                    </span>
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </section>
    );
  };

  // Complete-beat story: every app on the list and what the four eyes decided.
  const installApps = rounds.filter((x) => x.rightMove === "install").length;
  const skipApps = rounds.length - installApps;

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

      {/* Sarah's read-alouds (audio only): the how-to once, each app, each marker. */}
      {!showIntro && !finished && r && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="fe-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent={accent} recordedOnly onDone={() => setNarr("read")} />
          )}
          {narr === "read" && (
            <InfoNarration key={`fe-read-${r.id}`} speaker={voice} lines={[r.readAloud]} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
          {narr === "spot" && readTarget && (
            <InfoNarration
              key={`fe-spot-${r.id}-${readTarget.id}`}
              speaker={voice}
              lines={[readTarget.readAloud]}
              accent={accent}
              recordedOnly
              onDone={() => setNarr("idle")}
            />
          )}
        </div>
      )}

      {!showIntro && !finished && r && (
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Side padding keeps the header clear of the frame's corner ornaments. */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "2px 22px 0" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: accent }}>
              <PixIcon emoji={introIcon} size={16} />
              {introTitle}
            </span>
            <span style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c9b8ff" }}>
              Round {Math.min(idx + 1, rounds.length)} of {rounds.length}
            </span>
          </div>

          {/* The board: the child's page | the grown-up's page (stacked when narrow). */}
          <div
            ref={setBoardEl}
            style={{
              position: "relative",
              margin: "0 14px",
              padding: "12px 12px 12px",
              borderRadius: 18,
              background: "linear-gradient(180deg, rgba(0,0,0,0.26) 0%, rgba(0,0,0,0.4) 100%)",
              border: `1px solid ${accent}44`,
              boxShadow: `0 18px 40px -22px rgba(0,0,0,0.8), inset 0 0 0 1px ${accent}14`,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: wide ? "row" : "column",
                alignItems: wide ? "stretch" : "center",
                justifyContent: "center",
                gap: PANEL_GAP,
              }}
            >
              {renderPanel("kid")}
              {renderPanel("grown")}
            </div>

            {/* The seal lands only after a right decision (never before). */}
            <AnimatePresence>
              {phase === "sealed" && outcome && (
                <motion.div
                  key={`seal-${r.id}-${outcome}`}
                  role="status"
                  initial={reduce ? { opacity: 0, x: "-50%", y: "-50%" } : { opacity: 0, x: "-50%", y: "-50%", scale: 1.8, rotate: -18 }}
                  animate={{ opacity: 1, x: "-50%", y: "-50%", scale: 1, rotate: -6 }}
                  exit={{ opacity: 0, x: "-50%", y: "-50%", transition: { duration: 0.12 } }}
                  transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 380, damping: 14, delay: 0.15 }}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    zIndex: 5,
                    maxWidth: "90%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "10px 18px",
                    borderRadius: 12,
                    border: "4px double #34d399",
                    color: "#a0ffb0",
                    background: "rgba(8,10,22,0.92)",
                    fontFamily: LABEL_FONT,
                    fontWeight: 900,
                    fontSize: 18,
                    letterSpacing: "0.1em",
                    lineHeight: 1.2,
                    textTransform: "uppercase",
                    textAlign: "center",
                    boxShadow: "0 0 22px rgba(52,211,153,0.5)",
                    pointerEvents: "none",
                  }}
                >
                  <PixIcon emoji="👪" size={24} />
                  <span>{outcome === "install" ? installToast : skipToast}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* The two decisions: locked until every marker is read. Same paint,
              same size; the sides are flipped at random per round. */}
          <div role="group" aria-label="Decide together" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginTop: 12, padding: "0 12px" }}>
            {moveOrder.map((move) => {
              const label = move === "install" ? installLabel : skipLabel;
              return (
                <GameButton
                  key={move}
                  variant="primary"
                  size="lg"
                  icon={unlocked ? "👪" : "🔒"}
                  onClick={() => decide(move)}
                  disabled={speaking || !unlocked}
                  aria-label={label}
                  style={{ width: DECIDE_W, maxWidth: "100%" }}
                >
                  {label}
                </GameButton>
              );
            })}
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
            @keyframes feGuide { 0%,100% { box-shadow: 0 0 0 3px ${accent}55, 0 0 16px ${accent}77 } 50% { box-shadow: 0 0 0 6px ${accent}22, 0 0 28px ${accent} } }
            @keyframes feWiggle { 0%,100% { transform: rotate(0deg) } 20% { transform: rotate(-4deg) } 40% { transform: rotate(4deg) } 60% { transform: rotate(-3deg) } 80% { transform: rotate(2deg) } }
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

      {finished && (
        <ExerciseCompleteBeat
          title={completeTitle}
          stars={stars}
          statLines={[
            `${rounds.length} app${rounds.length === 1 ? "" : "s"} checked with four eyes: ${installApps} installed together, ${skipApps} skipped together`,
            completeLine,
          ]}
          narration={completeNarration}
          onContinue={() => onComplete(stars === 3 ? 100 : stars === 2 ? 70 : 40)}
        />
      )}
    </ExerciseFrame>
  );
}
