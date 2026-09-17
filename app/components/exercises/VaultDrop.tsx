"use client";

/**
 * VaultDrop — "The Treasure Table" (the DRAG sort), showcase edition.
 *
 * Art-directed to the approved reference: a starry royal-purple scene,
 * two glassy destination cards (cork SHARE BOARD art / ornate golden
 * VAULT door art), a golden ticket treasure in the middle with dashed
 * guide paths, glossy pedestal action buttons, Layla's "You decide!"
 * moment, and a motto strip. One treasure at a time; the child DRAGS it
 * to either destination card OR its matching glossy button (all four
 * are live drop zones), or just taps the buttons. No timer. Wrong drops
 * bounce back and teach.
 *
 * Skins (`skin` prop): "treasure" is Week 2's Treasure Table (default,
 * unchanged). "dock" is Week 9's "The Delivery Dock": one app parcel at a time
 * rolls onto a warehouse loading dock wearing a shipping label that says where
 * it came from (the item's `text`), and the child sorts it onto the REAL SHOP
 * SHELF (the first destination, `isPrivate: false`) or SEND IT BACK (the
 * second, `isPrivate: true`). Same drag + tap controls, drop zones, judging,
 * questionKeys and verdict voice. The dock adds the Learn-Loop read-aloud
 * chain: Sarah speaks the how-to once as the board appears (audio only, in
 * place of the visible coach caption) and reads each parcel's `readAloud` as it
 * arrives, holding taps while she speaks.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGameAudio } from "@/app/lib/gameEngine/useGameAudio";
import { useExerciseFeedback } from "@/app/lib/gameEngine/useExerciseFeedback";
import { useMotionIntensity } from "@/app/lib/gameEngine/useMotionIntensity";
import { playSound } from "@/app/lib/sounds";
import { useShuffledOnce } from "@/app/lib/gameEngine/useShuffledOnce";
import { isAudioMuted, subscribeAudioMute } from "@/app/lib/audioMute";
import { useLessonTheme } from "@/app/components/lesson/LessonThemeContext";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import ExerciseIntroBeat, { ExerciseCompleteBeat } from "@/app/components/lesson/ExerciseBeats";
import CoachCaption from "@/app/components/lesson/CoachCaption";
import WrongAnswerPanel from "@/app/components/lesson/WrongAnswerPanel";
import { useVerdictVoice } from "@/app/components/lesson/VerdictVoice";
import HintBubble from "@/app/components/lesson/HintBubble";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import PixIcon from "@/app/components/lesson/PixIcon";
import { SPOKEN_GATE_MAX_MS } from "@/app/lib/gameEngine/spokenGate";

/** "treasure" = Week 2's Treasure Table (default); "dock" = Week 9's Delivery Dock. */
export type VaultDropSkin = "treasure" | "dock";

export interface VaultDropItem {
  id: string;
  text: string;
  /** PixIcon emoji. Treasure skin: on the treasure card. Dock skin: only on the
   *  parcel once it sits on the shelf (the incoming parcel wears one uniform app
   *  tile, so an icon can never give the answer away before the sort). */
  icon: string;
  /**
   * Which destination the item belongs in: false = the FIRST destination
   * ("keep"), true = the SECOND ("away"). The name is Week 2's. Treasure skin:
   * false = the share board, true = the vault. Dock skin: false = the real
   * shop shelf, true = SEND IT BACK.
   */
  isPrivate: boolean;
  explanation: string;
  /** Sarah's reason on a RIGHT answer ("That's right!" + why); defaults to the wrong-side text. */
  why?: string;
  /** Dock skin: Sarah reads this as the parcel arrives (audio only, recorded
   *  under "adam", taps held until she finishes). Ignored on the treasure skin. */
  readAloud?: string;
}

/** Copy per destination: `keep` = the first destination (isPrivate false),
 *  `away` = the second destination (isPrivate true). */
export interface VaultDropSides {
  keep?: string;
  away?: string;
}

export interface VaultDropProps {
  items: VaultDropItem[];
  /** Visual skin: "treasure" (Week 2, default) or "dock" (Week 9). */
  skin?: VaultDropSkin;
  /** Intro beat copy, either skin. Defaults: treasure "The Treasure Table" /
   *  "Drag each treasure to the share board or the vault." / "🛡️"; dock
   *  "The Delivery Dock" / DOCK_COPY.introSubtitle / "📥". */
  introTitle?: string;
  introSubtitle?: string;
  introIcon?: string;
  /** Dock skin only: the two destination names (zone headings and buttons).
   *  Default { keep: "REAL SHOP SHELF", away: "SEND IT BACK" }. */
  destinationLabels?: VaultDropSides;
  /** The strip along the bottom of the scene, either skin. Defaults: treasure
   *  "⭐ Make smart choices. Share kindly. Keep treasures safe. 💜"; dock
   *  DOCK_COPY.motto (drawn after a ✅ icon). */
  motto?: string;
  /** The fx toast on a right sort, either skin: one string for both sides or
   *  per side. Defaults: treasure { keep: "PINNED!", away: "LOCKED!" }; dock
   *  { keep: "ON THE SHELF!", away: "SENT BACK!" }. */
  rightToast?: string | VaultDropSides;
  /** The WrongAnswerPanel title on a wrong sort, picked by where the item
   *  BELONGS, either skin: one string for both or per side. Defaults: treasure
   *  { keep: "That one was safe to share!", away: "Whoa - that one is private
   *  treasure!" }; dock { keep: "That one came from the real shop!", away:
   *  "Whoa, that one has to go back!" }. */
  wrongTitle?: string | VaultDropSides;
  /** Complete-beat title, either skin. Defaults: treasure "Every treasure
   *  sorted!"; dock "Every parcel sorted!". */
  completeTitle?: string;
  /** Optional last complete-beat line, either skin. Defaults: treasure none;
   *  dock "Real shop apps on the shelf. Everything else sent back." */
  completeLine?: string;
  hints?: { tier1: string; tier2: string };
  introNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  coachLines?: { speaker?: "adam" | "layla"; lines: string[] };
  /** Optional "Spot the Danger" Raccoon preamble folded into the intro. */
  threat?: { raccoonLine: string };
  /** Optional spoken "you're protected" payoff on the complete screen. */
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

const ROUNDED = "ui-rounded, 'Fredoka', 'Quicksand', system-ui, sans-serif";

// Deterministic starfield (x%, y%, px, opacity) — no randomness in render.
const STARS: [number, number, number, number][] = [
  [4, 8, 10, 0.8], [12, 30, 7, 0.5], [7, 62, 8, 0.6], [16, 84, 9, 0.7],
  [28, 5, 8, 0.6], [38, 16, 6, 0.4], [50, 4, 9, 0.7], [63, 12, 7, 0.5],
  [76, 6, 10, 0.8], [88, 18, 7, 0.5], [95, 40, 9, 0.7], [92, 68, 8, 0.6],
  [85, 90, 9, 0.7], [55, 92, 7, 0.5], [30, 94, 8, 0.6], [70, 45, 6, 0.4],
];

/* ── Dock skin (Week 9, "The Delivery Dock") ── */

/** The dock skin's default copy (every entry can be overridden by a prop). */
const DOCK_COPY = {
  introTitle: "The Delivery Dock",
  introSubtitle: "Read each parcel's label. Parcels from the real shop go on the shelf. Everything else gets sent back.",
  introIcon: "📥",
  keep: "REAL SHOP SHELF",
  away: "SEND IT BACK",
  motto: "Apps come from the real app store. Everything else goes back.",
  keepToast: "ON THE SHELF!",
  awayToast: "SENT BACK!",
  keepWrong: "That one came from the real shop!",
  awayWrong: "Whoa, that one has to go back!",
  completeTitle: "Every parcel sorted!",
  completeLine: "Real shop apps on the shelf. Everything else sent back.",
} as const;

const DOCK_BLUE = "#2b7fff";

// Audio-only narration: Sarah's voice with no visible narration box (the label
// she reads is already on the parcel), same recipe as NameTagCheck / UndoTest.
const AUDIO_ONLY_STYLE = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  pointerEvents: "none",
} as const;
// SPOKEN_GATE_MAX_MS is shared: see app/lib/gameEngine/spokenGate.ts.

/** Black and amber safety stripes (dock edge, send-back hatch frame). */
const HAZARD = "repeating-linear-gradient(-45deg, #ffb020 0 8px, #1a1d24 8px 16px)";
/** A plain cardboard box face: the same stock for every parcel. */
const CARDBOARD = "linear-gradient(180deg, #e2b27a 0%, #cf9a5e 55%, #b98145 100%)";
/** The warehouse wall behind the dock: steel blue with corrugated ridges and warm lamp light. */
const DOCK_SCENE_BG =
  "radial-gradient(ellipse at 50% -12%, rgba(255,190,110,0.26) 0%, transparent 48%), radial-gradient(ellipse at 12% -6%, rgba(255,190,110,0.14) 0%, transparent 34%), radial-gradient(ellipse at 88% -6%, rgba(255,190,110,0.14) 0%, transparent 34%), repeating-linear-gradient(90deg, rgba(255,255,255,0.045) 0 2px, transparent 2px 26px), linear-gradient(180deg, #0e2d5a 0%, #0a2248 55%, #071a36 100%)";

/** Pick a side's copy from a string-or-per-side prop. */
function sideCopy(v: string | VaultDropSides | undefined, side: keyof VaultDropSides, fallback: string): string {
  return typeof v === "string" ? v : v?.[side] ?? fallback;
}

/** A little cardboard box drawn at (left, top), `size` px wide. Decor only. */
function miniBox(left: number, top: number, size: number): React.CSSProperties {
  return {
    position: "absolute",
    left,
    top,
    width: size,
    height: Math.round(size * 0.82),
    borderRadius: 3,
    background: CARDBOARD,
    boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.15), 0 2px 3px rgba(0,0,0,0.45)",
  };
}

export default function VaultDrop({
  items,
  skin,
  introTitle,
  introSubtitle,
  introIcon,
  destinationLabels,
  motto,
  rightToast,
  wrongTitle,
  completeTitle,
  completeLine,
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
}: VaultDropProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;
  const dock = skin === "dock";
  // In-game read-alouds and verdict reasons are recorded under "adam" (both
  // content voices are Sarah), so every in-game lookup uses that key.
  const voice = "adam" as const;
  const accent = useLessonTheme()?.accent ?? DOCK_BLUE;
  const keepLabel = destinationLabels?.keep ?? DOCK_COPY.keep;
  const awayLabel = destinationLabels?.away ?? DOCK_COPY.away;

  const [showIntro, setShowIntro] = useState(true);
  const [idx, setIdx] = useState(0);
  const [pinned, setPinned] = useState<VaultDropItem[]>([]);
  const [vaulted, setVaulted] = useState(0);
  const [vaultChomp, setVaultChomp] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [dragging, setDragging] = useState(false);
  // Dock skin read-aloud chain: the how-to once as the board appears, then each
  // parcel's label as it arrives. Taps wait for her. "idle" = nothing playing
  // (the treasure skin never leaves idle: it keeps its visible coach caption).
  const [narr, setNarr] = useState<"howto" | "read" | "idle">("idle");

  const boardRef = useRef<HTMLDivElement>(null);
  const vaultRef = useRef<HTMLDivElement>(null);
  const pinBtnRef = useRef<HTMLButtonElement>(null);
  const lockBtnRef = useRef<HTMLButtonElement>(null);
  const reportedTier = useRef(0);

  // Anti-sequence: treasures come to the table in a random order every play
  // (authored lists alternate share/private). Board and vault keep their sides.
  const shownItems = useShuffledOnce(items);
  const finished = idx >= shownItems.length;
  const item = shownItems[idx];

  // Safety releases for the spoken gate (never leave the dock held).
  useEffect(() => {
    if (narr === "idle") return;
    const id = window.setTimeout(() => setNarr("idle"), SPOKEN_GATE_MAX_MS);
    return () => window.clearTimeout(id);
  }, [narr]);
  useEffect(() => subscribeAudioMute((muted) => { if (muted) setNarr("idle"); }), []);

  /** Dock: the parcel's label is read only when it has one and sound is on. */
  const readFor = (it: VaultDropItem | undefined) => (!isAudioMuted() && it?.readAloud ? "read" : "idle");
  const startDock = () => {
    setShowIntro(false);
    setNarr(isAudioMuted() ? "idle" : coachLines ? "howto" : readFor(item));
  };
  const advanceDock = () => {
    const next = shownItems[idx + 1];
    setIdx((i) => i + 1);
    setNarr(readFor(next));
  };

  const bumpHints = () => {
    setWrongCount((n) => {
      const next = n + 1;
      const tier = next >= 2 ? 2 : 1;
      if (tier > reportedTier.current) {
        reportedTier.current = tier;
        onHintReached?.(tier as 1 | 2);
      }
      return next;
    });
  };

  // Spoken verdicts (owner 2026-09-12): Sarah says "That's right!" + why and
  // the next item waits for her; wrong picks speak through WrongAnswerPanel.
  // useVerdictVoice's default key is "adam", so both skins look up the same key.
  const verdict = useVerdictVoice(voice);
  // Dock: taps wait while Sarah reads or says a verdict.
  const dockHeld = dock && (narr !== "idle" || verdict.speaking);
  const sortCurrent = (toVault: boolean) => {
    if (!item || feedback || finished || verdict.speaking || (dock && narr !== "idle")) return;
    setHasInteracted(true);
    const wasCorrect = toVault === item.isPrivate;
    onAnswered?.({
      questionKey: `vault-${item.id}`,
      selectedIndex: toVault ? 1 : 0,
      correctIndex: item.isPrivate ? 1 : 0,
      wasCorrect,
    });
    if (wasCorrect) {
      onCorrect?.();
      setCorrectCount((n) => n + 1);
      if (toVault) {
        playSound("lock");
        setVaulted((v) => v + 1);
        setVaultChomp(true);
        window.setTimeout(() => setVaultChomp(false), 550);
        fx.correct({ xp: 25, text: sideCopy(rightToast, "away", dock ? DOCK_COPY.awayToast : "LOCKED!") });
      } else {
        audio.drop();
        setPinned((p) => [...p, item]);
        fx.correct({ xp: 25, text: sideCopy(rightToast, "keep", dock ? DOCK_COPY.keepToast : "PINNED!") });
      }
      verdict.say("right", item.why ?? item.explanation, dock ? advanceDock : () => setIdx((i) => i + 1));
    } else {
      audio.wrong();
      onWrong?.();
      bumpHints();
      setFeedback({
        title: item.isPrivate
          ? sideCopy(wrongTitle, "away", dock ? DOCK_COPY.awayWrong : "Whoa - that one is private treasure!")
          : sideCopy(wrongTitle, "keep", dock ? DOCK_COPY.keepWrong : "That one was safe to share!"),
        explanation: item.explanation,
        tip: hints?.tier1,
      });
    }
  };

  const handleDragEnd = (point: { x: number; y: number }) => {
    setDragging(false);
    const inRect = (el: HTMLElement | null) => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return point.x >= r.left && point.x <= r.right && point.y >= r.top && point.y <= r.bottom;
    };
    if (inRect(vaultRef.current) || inRect(lockBtnRef.current)) sortCurrent(true);
    else if (inRect(boardRef.current) || inRect(pinBtnRef.current)) sortCurrent(false);
  };

  const stars = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1;
  // Optional last stat line on the complete beat (the treasure skin has none by default).
  const finalLine = completeLine ?? (dock ? DOCK_COPY.completeLine : undefined);
  const glassCard: React.CSSProperties = {
    borderRadius: 20,
    background: "linear-gradient(180deg, rgba(88,66,180,0.28) 0%, rgba(46,32,110,0.34) 100%)",
    border: "1.5px solid rgba(168,142,255,0.45)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14), 0 14px 34px -18px rgba(0,0,0,0.8)",
    backdropFilter: "blur(6px)",
  };

  const starfield = useMemo(
    () =>
      STARS.map(([x, y, s, o], i) => (
        <span
          key={i}
          aria-hidden
          style={{
            position: "absolute",
            left: `${x}%`,
            top: `${y}%`,
            fontSize: s,
            opacity: o,
            color: i % 3 === 0 ? "#ffd158" : "#cdbcff",
            animation: reduce ? undefined : `vdTwinkle ${2.2 + (i % 4) * 0.7}s ease-in-out ${i * 0.35}s infinite`,
            pointerEvents: "none",
          }}
        >
          {i % 2 === 0 ? "✦" : "✧"}
        </span>
      )),
    [reduce],
  );

  return (
    <ExerciseFrame maxWidth={860} decor={false} background="transparent">
      {fx.layer()}
      {verdict.element}

      {showIntro && (
        <ExerciseIntroBeat
          title={introTitle ?? (dock ? DOCK_COPY.introTitle : "The Treasure Table")}
          subtitle={introSubtitle ?? (dock ? DOCK_COPY.introSubtitle : "Drag each treasure to the share board or the vault.")}
          icon={introIcon ?? (dock ? DOCK_COPY.introIcon : "🛡️")}
          narration={introNarration}
          threat={threat}
          character={introNarration?.speaker}
          onDismiss={dock ? startDock : () => setShowIntro(false)}
        />
      )}

      {/* Dock: Sarah's read-alouds (audio only): the how-to once, then each parcel's label. */}
      {dock && !showIntro && !finished && item && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="vd-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent={accent} recordedOnly onDone={() => setNarr(readFor(item))} />
          )}
          {narr === "read" && item.readAloud && (
            <InfoNarration key={`vd-read-${item.id}`} speaker={voice} lines={[item.readAloud]} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
        </div>
      )}

      {dock ? (
      /* ── The Delivery Dock: shelf and send-back zones, the parcel on the dock, the two buttons ── */
      <div
        style={{
          position: "relative",
          borderRadius: 26,
          padding: "16px 18px 14px",
          overflow: "hidden",
          fontFamily: ROUNDED,
          background: DOCK_SCENE_BG,
          border: "2px solid rgba(102,169,255,0.35)",
          boxShadow: "0 24px 60px -24px rgba(0,0,0,0.9)",
        }}
      >
        {/* ── Destination zones (drop targets; the buttons below are the taps) ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, position: "relative", zIndex: 2 }}>
          {/* The real shop shelf (first destination, isPrivate false) */}
          <div
            ref={boardRef}
            aria-label={`${keepLabel}: drop parcels here`}
            style={{
              ...glassCard,
              background: "linear-gradient(180deg, rgba(43,127,255,0.24) 0%, rgba(8,30,66,0.6) 100%)",
              padding: "12px 14px",
              minHeight: 108,
              border: dragging ? "2px dashed #9cc8ff" : "1.5px solid rgba(102,169,255,0.45)",
              boxShadow: dragging ? "0 0 26px rgba(102,169,255,0.45), inset 0 1px 0 rgba(255,255,255,0.14)" : (glassCard.boxShadow as string),
              transition: "border 150ms ease, box-shadow 150ms ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* A steel shelving unit with boxes on it */}
              <span aria-hidden style={{ position: "relative", width: 66, height: 60, flexShrink: 0 }}>
                <span style={{ position: "absolute", left: 2, top: 0, bottom: 0, width: 4, borderRadius: 2, background: "#8fb4e8" }} />
                <span style={{ position: "absolute", right: 2, top: 0, bottom: 0, width: 4, borderRadius: 2, background: "#8fb4e8" }} />
                <span style={{ position: "absolute", left: 0, right: 0, top: 26, height: 4, borderRadius: 2, background: "#cfe0ff" }} />
                <span style={{ position: "absolute", left: 0, right: 0, bottom: 2, height: 4, borderRadius: 2, background: "#cfe0ff" }} />
                <span style={miniBox(9, 9, 20)} />
                <span style={miniBox(33, 12, 16)} />
                <span style={miniBox(12, 37, 18)} />
                <span style={miniBox(34, 35, 22)} />
              </span>
              <div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#ffffff", letterSpacing: "0.02em", lineHeight: 1.1, textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}>
                  {keepLabel}
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "#9cc8ff", marginTop: 2 }}>
                  {pinned.length} on the shelf
                </div>
              </div>
            </div>
            {/* The parcels already shelved, on a steel plank */}
            {pinned.length > 0 && (
              <div style={{ position: "relative", marginTop: 8, padding: "0 4px 6px", display: "flex", flexWrap: "wrap", gap: 6 }}>
                <span aria-hidden style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 5, borderRadius: 3, background: "linear-gradient(180deg, #cfe0ff, #7f9fcf)" }} />
                <AnimatePresence>
                  {pinned.map((p) => (
                    <motion.span
                      key={p.id}
                      initial={reduce ? false : { y: -18, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      style={{
                        position: "relative",
                        display: "grid",
                        placeItems: "center",
                        width: 34,
                        height: 28,
                        borderRadius: 4,
                        background: CARDBOARD,
                        boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.15), 0 3px 5px rgba(0,0,0,0.45)",
                      }}
                    >
                      <span aria-hidden style={{ position: "absolute", top: 0, left: "50%", marginLeft: -4, width: 8, height: 7, background: "rgba(43,127,255,0.6)" }} />
                      <PixIcon emoji={p.icon} size={17} />
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Send it back (second destination, isPrivate true) */}
          <motion.div
            ref={vaultRef}
            aria-label={`${awayLabel}: drop parcels here`}
            animate={vaultChomp && !reduce ? { scale: [1, 1.04, 0.985, 1] } : { scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{
              ...glassCard,
              background: "linear-gradient(180deg, rgba(255,157,61,0.2) 0%, rgba(40,26,14,0.62) 100%)",
              padding: "12px 14px",
              minHeight: 108,
              display: "flex",
              alignItems: "center",
              gap: 12,
              justifyContent: "space-between",
              border: dragging ? "2px dashed #ffc98a" : "1.5px solid rgba(255,176,92,0.45)",
              boxShadow: dragging ? "0 0 26px rgba(255,157,61,0.45), inset 0 1px 0 rgba(255,255,255,0.14)" : (glassCard.boxShadow as string),
              transition: "border 150ms ease, box-shadow 150ms ease",
            }}
          >
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#ffffff", letterSpacing: "0.02em", lineHeight: 1.1, textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}>
                {awayLabel}
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "#ffc98a", marginTop: 2 }}>
                {vaulted} sent back
              </div>
            </div>
            {/* The return hatch: a dark chute in a striped frame, a back-arrow over it */}
            <motion.span
              aria-hidden
              animate={vaultChomp && !reduce ? { rotate: [0, -6, 4, 0] } : undefined}
              style={{ position: "relative", display: "block", width: 86, height: 80, flexShrink: 0, padding: 6, borderRadius: 12, background: HAZARD, boxShadow: "0 6px 12px rgba(0,0,0,0.55)" }}
            >
              <span style={{ display: "block", width: "100%", height: "100%", borderRadius: 7, background: "radial-gradient(ellipse at 50% 28%, #22324f 0%, #070b14 82%)", boxShadow: "inset 0 8px 14px rgba(0,0,0,0.85)" }} />
              <svg viewBox="0 0 40 40" width="46" height="46" style={{ position: "absolute", left: 20, top: 17, overflow: "visible" }}>
                <path d="M 31 29 C 31 16, 22 11, 12 14" stroke="#ffd9a8" strokeWidth={4.5} fill="none" strokeLinecap="round" />
                <path d="M 15 6 L 9 14.5 L 17 20" stroke="#ffd9a8" strokeWidth={4.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.span>
          </motion.div>
        </div>

        {/* ── The parcel on the dock ── */}
        <div style={{ position: "relative", zIndex: 3, textAlign: "center", padding: "14px 0 4px" }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: "#ffffff", textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}>
            ↖ Read the label, then send it the right way ↗
          </div>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#ffc98a", marginTop: 2, letterSpacing: "0.06em" }}>
            {`Parcel ${Math.min(idx + 1, shownItems.length)} of ${shownItems.length}`}
          </div>

          <div style={{ minHeight: 112, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 8 }}>
            <AnimatePresence mode="wait">
              {item && !finished && (
                <motion.div
                  key={item.id}
                  drag={!feedback && !dockHeld}
                  dragSnapToOrigin
                  dragElastic={0.18}
                  whileDrag={{ scale: 1.06, rotate: 2, zIndex: 30 }}
                  onDragStart={() => {
                    setDragging(true);
                    setHasInteracted(true);
                    audio.tap();
                  }}
                  onDragEnd={(_e, info) => handleDragEnd(info.point)}
                  initial={reduce ? false : { x: -60, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={reduce ? undefined : { opacity: 0, scale: 0.75 }}
                  style={{
                    position: "relative",
                    padding: "14px 12px 10px",
                    borderRadius: 10,
                    cursor: dockHeld ? "wait" : "grab",
                    touchAction: "none",
                    // Every parcel is the same box, the same tape and the same label paper.
                    background: CARDBOARD,
                    border: "2px solid #a8733c",
                    boxShadow: "0 16px 26px -12px rgba(0,0,0,0.8), inset 0 -5px 0 rgba(0,0,0,0.12), inset 0 2px 0 rgba(255,255,255,0.35)",
                    color: "#2a1a08",
                  }}
                >
                  {/* Packing tape across the lid */}
                  <span aria-hidden style={{ position: "absolute", left: 0, right: 0, top: 3, height: 8, background: "rgba(43,127,255,0.55)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35)" }} />
                  {/* The shipping label */}
                  <div
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "9px 12px",
                      borderRadius: 7,
                      background: "#fffdf7",
                      border: "1.5px solid rgba(90,60,20,0.28)",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.25)",
                    }}
                  >
                    {/* The same app tile on every parcel: an item's own icon could give the answer
                        away before the sort, so it only shows once the parcel is on the shelf. */}
                    <span aria-hidden style={{ display: "grid", placeItems: "center", width: 52, height: 52, flexShrink: 0, borderRadius: 13, background: "linear-gradient(135deg, #eaf2ff 0%, #c9dcff 100%)", border: "1.5px solid rgba(43,127,255,0.35)" }}>
                      <PixIcon emoji="📱" size={38} />
                    </span>
                    <span style={{ display: "block", textAlign: "left" }}>
                      <span style={{ display: "block", fontSize: 10, fontWeight: 900, letterSpacing: "0.18em", color: "#8a6a3a" }}>SHIPPING LABEL</span>
                      <span style={{ display: "block", fontSize: 18, fontWeight: 900, lineHeight: 1.22, maxWidth: 300, marginTop: 2 }}>{item.text}</span>
                    </span>
                    {/* Barcode */}
                    <span aria-hidden style={{ width: 26, height: 44, flexShrink: 0, background: "repeating-linear-gradient(90deg, #2a1a08 0 2px, transparent 2px 4px, #2a1a08 4px 5px, transparent 5px 8px)", opacity: 0.8 }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {finished && (
              <div style={{ fontSize: 16, fontWeight: 900, color: "#9cd8ff" }}>Dock cleared!</div>
            )}
          </div>

          {/* The roller conveyor the parcel rides in on, with a striped dock edge */}
          <div aria-hidden style={{ margin: "4px auto 0", width: "72%", height: 14, borderRadius: 7, background: "repeating-linear-gradient(90deg, #7f98bf 0 13px, #3d4f6d 13px 17px)", boxShadow: "inset 0 3px 3px rgba(255,255,255,0.28), 0 6px 10px rgba(0,0,0,0.5)" }} />
          <div aria-hidden style={{ margin: "0 auto", width: "76%", height: 6, borderRadius: 2, background: HAZARD, opacity: 0.9 }} />

          {/* Dashed guide paths to the buttons */}
          <svg aria-hidden width="100%" height="30" viewBox="0 0 800 34" style={{ display: "block", opacity: 0.6 }}>
            <path d="M 330 4 C 260 18, 210 22, 165 28" stroke="#66a9ff" strokeWidth="2.5" strokeDasharray="6 7" fill="none" strokeLinecap="round" />
            <path d="M 470 4 C 540 18, 590 22, 635 28" stroke="#66a9ff" strokeWidth="2.5" strokeDasharray="6 7" fill="none" strokeLinecap="round" />
            <path d="M 172 22 L 163 29 L 174 32" stroke="#66a9ff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 628 22 L 637 29 L 626 32" stroke="#66a9ff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* ── Action row: the two destination buttons (the tap path) + Layla's moment ── */}
        <div style={{ position: "relative", zIndex: 3, display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 20, alignItems: "end" }}>
          <motion.button
            ref={pinBtnRef}
            type="button"
            aria-label={keepLabel}
            onClick={() => sortCurrent(false)}
            disabled={!item || finished || !!feedback || showIntro || dockHeld}
            whileHover={reduce || dockHeld ? undefined : { scale: 1.03, y: -2 }}
            whileTap={reduce || dockHeld ? undefined : { scale: 0.96 }}
            style={{
              display: "flex", alignItems: "center", gap: 12, justifyContent: "center",
              minHeight: 62, padding: "12px 16px", borderRadius: 18, cursor: dockHeld ? "wait" : "pointer", touchAction: "manipulation", fontFamily: "inherit",
              background: "linear-gradient(180deg, #6fb0ff 0%, #2b7fff 60%, #1c5fd0 100%)",
              border: dragging ? "2.5px dashed #dcebff" : "2.5px solid #a8ccff",
              boxShadow: "0 12px 28px -10px rgba(43,127,255,0.75), inset 0 2px 0 rgba(255,255,255,0.45)",
              color: "#ffffff", textAlign: "left",
              opacity: dockHeld ? 0.75 : 1,
              transition: "border 150ms ease, opacity 150ms ease",
            }}
          >
            <PixIcon emoji="📥" size={30} />
            <span style={{ fontSize: 17, fontWeight: 900, lineHeight: 1.15, textShadow: "0 2px 6px rgba(0,0,0,0.35)" }}>{keepLabel}</span>
          </motion.button>

          {/* Layla: you decide! */}
          <div style={{ position: "relative", textAlign: "center", minWidth: 136, padding: "0 6px" }}>
            <div
              style={{
                display: "inline-block", marginBottom: 4, padding: "4px 12px", borderRadius: 999, borderBottomLeftRadius: 3,
                background: `linear-gradient(180deg, #4d95ff, ${DOCK_BLUE})`, border: "1.5px solid #a8ccff",
                color: "#ffffff", fontSize: 11.5, fontWeight: 900, whiteSpace: "nowrap",
                boxShadow: "0 6px 16px -6px rgba(43,127,255,0.8)",
              }}
            >
              You decide!
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/game/characters/layla-head.png" alt="Layla" style={{ display: "block", margin: "0 auto", width: 54, height: 54, objectFit: "contain", filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.55))" }} />
          </div>

          <motion.button
            ref={lockBtnRef}
            type="button"
            aria-label={awayLabel}
            onClick={() => sortCurrent(true)}
            disabled={!item || finished || !!feedback || showIntro || dockHeld}
            whileHover={reduce || dockHeld ? undefined : { scale: 1.03, y: -2 }}
            whileTap={reduce || dockHeld ? undefined : { scale: 0.96 }}
            style={{
              display: "flex", alignItems: "center", gap: 12, justifyContent: "center",
              minHeight: 62, padding: "12px 16px", borderRadius: 18, cursor: dockHeld ? "wait" : "pointer", touchAction: "manipulation", fontFamily: "inherit",
              background: "linear-gradient(180deg, #ffc27a 0%, #f59331 60%, #d9731a 100%)",
              border: dragging ? "2.5px dashed #ffe6c4" : "2.5px solid #ffd9a8",
              boxShadow: "0 12px 28px -10px rgba(245,147,49,0.75), inset 0 2px 0 rgba(255,255,255,0.5)",
              color: "#ffffff", textAlign: "left",
              opacity: dockHeld ? 0.75 : 1,
              transition: "border 150ms ease, opacity 150ms ease",
            }}
          >
            <PixIcon emoji="🚫" size={30} />
            <span style={{ fontSize: 17, fontWeight: 900, lineHeight: 1.15, textShadow: "0 2px 6px rgba(0,0,0,0.35)" }}>{awayLabel}</span>
          </motion.button>
        </div>

        {/* ── Motto strip (always visible: the dock's how-to is spoken, not captioned) ── */}
        <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", marginTop: 18 }}>
          <span
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 18px", borderRadius: 999,
              background: "rgba(6,20,44,0.75)", border: "1px solid rgba(102,169,255,0.4)",
              color: "#cfe3ff", fontSize: 12, fontWeight: 800, letterSpacing: "0.02em", textAlign: "center",
            }}
          >
            <PixIcon emoji="✅" size={16} />
            {motto ?? DOCK_COPY.motto}
          </span>
        </div>
      </div>
      ) : (
      /* ── The scene ── */
      <div
        style={{
          position: "relative",
          borderRadius: 26,
          padding: "18px 18px 14px",
          overflow: "hidden",
          fontFamily: ROUNDED,
          background:
            "radial-gradient(ellipse at 50% -10%, rgba(124,92,255,0.4) 0%, transparent 55%), radial-gradient(ellipse at 12% 110%, rgba(76,29,149,0.55) 0%, transparent 55%), radial-gradient(ellipse at 88% 110%, rgba(76,29,149,0.55) 0%, transparent 55%), linear-gradient(180deg, #2a1b5e 0%, #1d1145 55%, #150c33 100%)",
          border: "2px solid rgba(168,142,255,0.35)",
          boxShadow: "0 24px 60px -24px rgba(0,0,0,0.9)",
        }}
      >
        {starfield}

        {/* ── Destination cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, position: "relative", zIndex: 2 }}>
          {/* Share board */}
          <div
            ref={boardRef}
            aria-label="Share board - safe to share"
            style={{
              ...glassCard,
              padding: "12px 14px",
              minHeight: 108,
              border: dragging ? "2px dashed #5eead4" : (glassCard.border as string),
              boxShadow: dragging ? "0 0 26px rgba(94,234,212,0.4), inset 0 1px 0 rgba(255,255,255,0.14)" : (glassCard.boxShadow as string),
              transition: "border 150ms ease, box-shadow 150ms ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/cyberheroes/icons/share-board.png" alt="" style={{ width: 74, height: 74, objectFit: "contain", transform: "rotate(-4deg)", filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.5))" }} />
              <div>
                <div style={{ fontSize: 21, fontWeight: 900, color: "#ffffff", letterSpacing: "0.02em", textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}>
                  SHARE BOARD
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "#b9a8f5" }}>Safe things get pinned here</div>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: pinned.length ? 8 : 0 }}>
              <AnimatePresence>
                {pinned.map((p) => (
                  <motion.span
                    key={p.id}
                    initial={reduce ? false : { scale: 1.6, opacity: 0, rotate: -8 }}
                    animate={{ scale: 1, opacity: 1, rotate: (p.id.charCodeAt(0) % 7) - 3 }}
                    style={{
                      position: "relative",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "4px 9px",
                      borderRadius: 7,
                      background: "#fff7e6",
                      border: "1px solid #e8cf9e",
                      color: "#4a3208",
                      fontSize: 10.5,
                      fontWeight: 800,
                      boxShadow: "0 3px 7px rgba(0,0,0,0.45)",
                    }}
                  >
                    <span aria-hidden style={{ position: "absolute", top: -4, left: "50%", width: 7, height: 7, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #ff8d8d, #b91c1c)" }} />
                    <PixIcon emoji={p.icon} size={13} /> {p.text}
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* The vault */}
          <motion.div
            ref={vaultRef}
            aria-label="The vault - keep private"
            animate={vaultChomp && !reduce ? { scale: [1, 1.04, 0.985, 1] } : { scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{
              ...glassCard,
              padding: "12px 14px",
              minHeight: 108,
              display: "flex",
              alignItems: "center",
              gap: 12,
              justifyContent: "space-between",
              border: dragging ? "2px dashed #ffd158" : (glassCard.border as string),
              boxShadow: dragging ? "0 0 26px rgba(255,209,88,0.4), inset 0 1px 0 rgba(255,255,255,0.14)" : (glassCard.boxShadow as string),
              transition: "border 150ms ease, box-shadow 150ms ease",
            }}
          >
            <div>
              <div style={{ fontSize: 21, fontWeight: 900, color: "#ffffff", letterSpacing: "0.02em", textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}>
                THE VAULT
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "#7fe6c3" }}>
                {vaulted} treasure{vaulted === 1 ? "" : "s"} locked away
              </div>
            </div>
            <motion.img
              src="/cyberheroes/icons/vault-door.png"
              alt=""
              animate={vaultChomp && !reduce ? { rotate: [0, -6, 4, 0] } : undefined}
              style={{ width: 86, height: 86, objectFit: "contain", filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.55)) drop-shadow(0 0 18px rgba(255,190,80,0.35))" }}
            />
          </motion.div>
        </div>

        {/* ── The treasure ── */}
        <div style={{ position: "relative", zIndex: 3, textAlign: "center", padding: "16px 0 6px" }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: "#ffffff", textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}>
            ↖ Drag it to the right place ↗
          </div>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#ffd158", marginTop: 2, letterSpacing: "0.06em" }}>
            ✦ Treasure {Math.min(idx + 1, shownItems.length)} of {shownItems.length} ✦
          </div>

          <div style={{ minHeight: 108, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 10 }}>
            <AnimatePresence mode="wait">
              {item && !finished && (
                <motion.div
                  key={item.id}
                  drag={!feedback}
                  dragSnapToOrigin
                  dragElastic={0.18}
                  whileDrag={{ scale: 1.08, rotate: 2, zIndex: 30 }}
                  onDragStart={() => {
                    setDragging(true);
                    setHasInteracted(true);
                    audio.tap();
                  }}
                  onDragEnd={(_e, info) => handleDragEnd(info.point)}
                  initial={reduce ? false : { y: 24, opacity: 0, scale: 0.9 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={reduce ? undefined : { opacity: 0, scale: 0.7 }}
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "16px 22px",
                    borderRadius: 16,
                    cursor: "grab",
                    touchAction: "none",
                    background: "linear-gradient(180deg, #ffedb0 0%, #f7cf5e 78%, #eab53e 100%)",
                    border: "2.5px solid #ffe291",
                    boxShadow: "0 0 34px rgba(255,214,110,0.55), 0 14px 26px -10px rgba(0,0,0,0.75), inset 0 2px 0 rgba(255,255,255,0.55)",
                    color: "#4a3208",
                  }}
                >
                  {/* Ticket inner border */}
                  <span aria-hidden style={{ position: "absolute", inset: 5, borderRadius: 11, border: "1.5px dashed rgba(140,96,20,0.4)", pointerEvents: "none" }} />
                  <PixIcon emoji={item.icon} size={42} />
                  <span style={{ fontSize: 19, fontWeight: 900, lineHeight: 1.22, maxWidth: 320, textAlign: "left" }}>
                    {item.text}
                  </span>
                  <span aria-hidden style={{ position: "absolute", top: -9, right: -7, fontSize: 15, color: "#ffd158" }}>✦</span>
                  <span aria-hidden style={{ position: "absolute", bottom: -8, left: -9, fontSize: 12, color: "#ffd158" }}>✧</span>
                </motion.div>
              )}
            </AnimatePresence>
            {finished && (
              <div style={{ fontSize: 16, fontWeight: 900, color: "#7fe6c3" }}>Table cleared! ✨</div>
            )}
          </div>

          {/* Dashed guide paths to the buttons */}
          <svg aria-hidden width="100%" height="34" viewBox="0 0 800 34" style={{ display: "block", opacity: 0.6 }}>
            <path d="M 330 4 C 260 18, 210 22, 165 28" stroke="#a88eff" strokeWidth="2.5" strokeDasharray="6 7" fill="none" strokeLinecap="round" />
            <path d="M 470 4 C 540 18, 590 22, 635 28" stroke="#a88eff" strokeWidth="2.5" strokeDasharray="6 7" fill="none" strokeLinecap="round" />
            <path d="M 172 22 L 163 29 L 174 32" stroke="#a88eff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 628 22 L 637 29 L 626 32" stroke="#a88eff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* ── Action row: glossy buttons + Layla's moment ── */}
        <div style={{ position: "relative", zIndex: 3, display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 20, alignItems: "end" }}>
          <motion.button
            ref={pinBtnRef}
            onClick={() => sortCurrent(false)}
            disabled={!item || finished || !!feedback || showIntro}
            whileHover={reduce ? undefined : { scale: 1.03, y: -2 }}
            whileTap={reduce ? undefined : { scale: 0.96 }}
            style={{
              display: "flex", alignItems: "center", gap: 12, justifyContent: "center",
              padding: "14px 16px", borderRadius: 18, cursor: "pointer", touchAction: "manipulation", fontFamily: "inherit",
              background: "linear-gradient(180deg, #5eeaa5 0%, #22b573 60%, #178a56 100%)",
              border: dragging ? "2.5px dashed #d3ffe9" : "2.5px solid #a4f5cd",
              boxShadow: "0 12px 28px -10px rgba(34,181,115,0.75), inset 0 2px 0 rgba(255,255,255,0.45)",
              color: "#ffffff", textAlign: "left",
              transition: "border 150ms ease",
            }}
          >
            <PixIcon emoji="📌" size={30} />
            <span>
              <span style={{ display: "block", fontSize: 17.5, fontWeight: 900, textShadow: "0 2px 6px rgba(0,0,0,0.35)" }}>Pin to board</span>
              <span style={{ display: "block", fontSize: 12, fontWeight: 700, opacity: 0.9 }}>Share with friends</span>
            </span>
          </motion.button>

          {/* Layla: you decide! (wide enough for the nowrap pill; bottom-aligned
              with the buttons so the head never pokes into the motto strip) */}
          <div style={{ position: "relative", textAlign: "center", minWidth: 136, padding: "0 6px" }}>
            <div
              style={{
                display: "inline-block", marginBottom: 4, padding: "4px 12px", borderRadius: 999, borderBottomLeftRadius: 3,
                background: "linear-gradient(180deg, #7c5cff, #5b3fd4)", border: "1.5px solid #b39dff",
                color: "#ffffff", fontSize: 11.5, fontWeight: 900, whiteSpace: "nowrap",
                boxShadow: "0 6px 16px -6px rgba(124,92,255,0.8)",
              }}
            >
              You decide! ⭐
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/game/characters/layla-head.png" alt="Layla" style={{ display: "block", margin: "0 auto", width: 54, height: 54, objectFit: "contain", filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.55))" }} />
          </div>

          <motion.button
            ref={lockBtnRef}
            onClick={() => sortCurrent(true)}
            disabled={!item || finished || !!feedback || showIntro}
            whileHover={reduce ? undefined : { scale: 1.03, y: -2 }}
            whileTap={reduce ? undefined : { scale: 0.96 }}
            style={{
              display: "flex", alignItems: "center", gap: 12, justifyContent: "center",
              padding: "14px 16px", borderRadius: 18, cursor: "pointer", touchAction: "manipulation", fontFamily: "inherit",
              background: "linear-gradient(180deg, #ffcf5e 0%, #f59e0b 60%, #d97706 100%)",
              border: dragging ? "2.5px dashed #ffedc2" : "2.5px solid #ffe1a1",
              boxShadow: "0 12px 28px -10px rgba(245,158,11,0.75), inset 0 2px 0 rgba(255,255,255,0.5)",
              color: "#ffffff", textAlign: "left",
              transition: "border 150ms ease",
            }}
          >
            <PixIcon emoji="🔒" size={30} />
            <span>
              <span style={{ display: "block", fontSize: 17.5, fontWeight: 900, textShadow: "0 2px 6px rgba(0,0,0,0.35)" }}>Lock in vault</span>
              <span style={{ display: "block", fontSize: 12, fontWeight: 700, opacity: 0.9 }}>Keep it safe</span>
            </span>
          </motion.button>
        </div>

        {/* ── Motto strip ── */}
        {/* Hidden while the coach caption toast sits over this row (first interaction dismisses it). */}
        <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", marginTop: 26, visibility: coachLines && !hasInteracted && !showIntro ? "hidden" : "visible" }}>
          <span
            style={{
              padding: "6px 18px", borderRadius: 999,
              background: "rgba(30,18,70,0.7)", border: "1px solid rgba(168,142,255,0.4)",
              color: "#cdbcff", fontSize: 12, fontWeight: 800, letterSpacing: "0.02em",
            }}
          >
            {motto ?? "⭐ Make smart choices. Share kindly. Keep treasures safe. 💜"}
          </span>
        </div>

        <style>{`
          @keyframes vdTwinkle {
            0%, 100% { opacity: 0.25; transform: scale(0.9); }
            50% { opacity: 1; transform: scale(1.15); }
          }
        `}</style>
      </div>
      )}

      {/* Hints */}
      <div style={{ padding: wrongCount > 0 ? "8px 4px 0" : 0 }}>
        {wrongCount === 1 && hints && <HintBubble tier={1} speaker="layla" text={hints.tier1} />}
        {wrongCount >= 2 && hints && <HintBubble tier={2} speaker="layla" text={hints.tier2} />}
      </div>

      {/* The dock speaks its how-to (audio only) instead of this caption. */}
      {!dock && coachLines && !showIntro && !hasInteracted && !finished && (
        <CoachCaption lines={coachLines.lines} speaker={coachLines.speaker} />
      )}

      {feedback && (
        <WrongAnswerPanel
          title={feedback.title}
          explanation={feedback.explanation}
          tip={feedback.tip}
          onContinue={() => {
            setFeedback(null);
            if (dock) advanceDock();
            else setIdx((i) => i + 1);
          }}
        />
      )}

      {finished && (
        <ExerciseCompleteBeat
          title={completeTitle ?? (dock ? DOCK_COPY.completeTitle : "Every treasure sorted!")}
          stars={stars}
          statLines={[
            `${correctCount}/${shownItems.length} sorted first try`,
            dock
              ? `${pinned.length} on the shelf · ${vaulted} sent back`
              : `${vaulted} locked in the vault · ${pinned.length} pinned to share`,
            ...(finalLine ? [finalLine] : []),
          ]}
          narration={completeNarration}
          onContinue={() => onComplete(correctCount)}
        />
      )}
    </ExerciseFrame>
  );
}
