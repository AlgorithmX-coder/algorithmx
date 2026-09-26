"use client";

/**
 * TestDrive: the PLAY AND WATCH drill (Week 9, "The Test Drive").
 *
 * Every round is one FREE app on a phone, with a big shiny FREE tag tied to
 * the top of it. Beside the phone stand three empty meters: TIME, COINS and
 * INFO. The child taps PLAY ONE MINUTE, and each tap plays the next minute of
 * the app on the phone screen as a card ("Level 1: so much fun!", "30-second
 * ad", "Level 2 is locked: 500 coins"). A minute that costs something fills
 * one step of that meter and wears the meter's chip; a minute that costs
 * nothing leaves every meter still. When every minute is played the FREE tag
 * becomes tappable. Flipping it shows an empty REAL PRICE spot and four
 * identical stickers: Your time, Your coins, Your info, Truly free. The child
 * taps the real price; a right pick sticks it on the tag and stamps it.
 * Playing the minutes is a demonstration the child performs with their own
 * finger, so it cannot be wrong; only the sticker is judged.
 *
 * Why it is not Strings Attached, the Odds Jar or the True-Price Lever
 * (owner: "we never copy an exercise"): no offer is linked to a token
 * (Strings Attached), no marbles roll out before a true sentence is picked
 * (Odds Jar), and no lever is held while a receipt prints (True-Price Lever).
 * The verb is TEST-DRIVE: the child plays the app minute by minute and
 * watches which meter fills, so "free still gets paid" is something they
 * measured, and the answer is a price read off those meters, not a
 * buy-or-walk-away call and not a true/false card.
 *
 * Learn-Loop wiring: Raccoon boast in the intro (`threat`), Sarah's how-to
 * once, every round read aloud as it arrives and every minute read as it
 * appears (audio-only, `recordedOnly`, taps held), a spoken verdict on the
 * right sticker ("That's right!" + why via VerdictVoice; wrong:
 * WrongAnswerPanel speaks "Not quite." + the round's teach line and the
 * stickers stay for the retry), hint tiers per round, a spoken payoff on the
 * complete beat. Rounds play in authored order; the four stickers are
 * shuffled per round. Round 1 guides the MECHANIC only: PLAY breathes while
 * minutes are left, then the tag breathes until it is flipped; the stickers
 * never glow. Tap-only, no timer, no lose state. Every sticker wears the same
 * paper, size and ink.
 *
 * Authoring: 3 to 5 minutes a round, each minute's text about 45 characters
 * or fewer (two lines on the phone). Write the minutes so the answer's meter
 * clearly rises most, or, for "free", so no meter moves at all. Every icon
 * (appIcon and each minute's icon) must be in PixIcon's MAP.
 *
 * Layout budget at the owner's 1414x771 window (HUD 64 + stage padding 40, so
 * the stage holds ~627px before it grows): header 29 + board 26 (padding and
 * border) + tallest column + strip 30 + hint gap 8. Left column = tag 64 +
 * phone 336 with 4 minutes (392 with 5); right column = meters 257 + gap 14 +
 * action slot 150 = 421. Total ~514px with 4 minutes, ~549px with 5. The
 * stickers live inside the action slot where PLAY was, so the tag, PLAY, the
 * stickers and the strip are all on screen without a scroll.
 */

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion } from "motion/react";
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

/** What a FREE app really costs. */
export type PriceKind = "time" | "coins" | "info" | "free";
export interface TestDriveMinute { id: string; text: string; icon: string; cost: "time" | "coins" | "info" | "none"; readAloud: string }
export interface TestDriveRound { id: string; appName: string; appIcon: string; readAloud: string; minutes: TestDriveMinute[]; answer: PriceKind; why: string; whyWrong: string }
export interface TestDriveProps {
  rounds: TestDriveRound[];
  introTitle?: string; introSubtitle?: string; introIcon?: string;
  freeTag?: string; playLabel?: string; flipLabel?: string; realPriceLabel?: string; metersTitle?: string;
  meterLabels?: Partial<Record<"time" | "coins" | "info", string>>;
  priceLabels?: Partial<Record<PriceKind, string>>;
  rightToast?: string; wrongTitle?: string; completeTitle?: string; completeLine?: string;
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

type MeterKind = "time" | "coins" | "info";
const METERS: MeterKind[] = ["time", "coins", "info"];
/** The four stickers in their fixed order. `onAnswered` reports indexes into
 *  this list (0 time, 1 coins, 2 info, 3 free), whatever slot a sticker sat in. */
const PRICE_KINDS: PriceKind[] = ["time", "coins", "info", "free"];
/** One icon per price, shared by its meter, its minute chip and its sticker. */
const PRICE_ICON: Record<PriceKind, string> = { time: "⏱️", coins: "💎", info: "🆔", free: "🎁" };
/** Meter colours. Meters are evidence, not choices, so they may differ. */
const METER_INK: Record<MeterKind, string> = { time: "#63d2ff", coins: "#ffc94d", info: "#ff8fc7" };
const DEFAULT_METER_LABELS: Record<MeterKind, string> = { time: "Time", coins: "Coins", info: "Info" };
const DEFAULT_PRICE_LABELS: Record<PriceKind, string> = { time: "Your time", coins: "Your coins", info: "Your info", free: "Truly free" };

const EMPTY_MINUTES: TestDriveMinute[] = [];
const KID_FONT = "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif";
const LABEL_FONT = "'Space Grotesk', sans-serif";
/** Geometry (px). The wide board is [tag over phone] + [meters over action]. */
const PHONE_W = 330;
const RIGHT_W = 300;
const COL_GAP = 40;
/** Board padding (12 + 12) the wide test adds to the two columns. */
const WIDE_MIN = PHONE_W + COL_GAP + RIGHT_W + 24;
const TAG_W = 178;
const TAG_H = 78;
/** How far the tag hangs down over the phone's top bezel. */
const TAG_TUCK = 14;
const SLOT_MIN_H = 50;
const TUBE_W = 46;
const TUBE_H = 132;
const TUBE_H_NARROW = 92;
/** The action slot under the meters holds PLAY, then the 2x2 sticker sheet. */
const ACTION_H = 150;
const STICKER_H = 58;
/** Paints. */
const DEVICE = "linear-gradient(180deg, #25304f 0%, #141a2e 100%)";
const SCREEN = "#0a0f1f";
const PAPER = "#fff6e8";
const INK = "#2a1f18";
const TAG_GOLD = "linear-gradient(135deg, #ffe58a 0%, #ffbf47 45%, #ff9124 100%)";

export default function TestDrive({
  rounds,
  introTitle = "The Test Drive",
  introSubtitle = "Play a FREE app one minute at a time. Watch the meters, then flip the tag.",
  introIcon = "🎮",
  freeTag = "FREE",
  playLabel = "PLAY ONE MINUTE",
  flipLabel = "Flip the tag",
  realPriceLabel = "Real price",
  metersTitle = "What it cost you",
  meterLabels,
  priceLabels,
  rightToast = "REAL PRICE FOUND!",
  wrongTitle = "Look at the meters again",
  completeTitle = "Every FREE tag flipped!",
  completeLine = "Most FREE apps get paid another way: your time, your coins or your info.",
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
}: TestDriveProps) {
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
  // arrives, then each minute as it is played. Taps are held while she
  // speaks. "idle" = nothing playing.
  const [narr, setNarr] = useState<"howto" | "read" | "minute" | "idle">("idle");
  // Minutes played this round (they play in authored order).
  const [played, setPlayed] = useState(0);
  // The FREE tag has been flipped: the stickers are out.
  const [flipped, setFlipped] = useState(false);
  // "stamped" = the right sticker is on the tag: the stamp lands while Sarah
  // says why, then the next app arrives.
  const [phase, setPhase] = useState<"play" | "stamped">("play");
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [roundWrongs, setRoundWrongs] = useState(0);
  const [totalWrongs, setTotalWrongs] = useState(0);
  // The board element and its width: the two columns need room side by side,
  // and a narrow frame stacks the meters under the phone instead.
  const [boardEl, setBoardEl] = useState<HTMLDivElement | null>(null);
  const [boardW, setBoardW] = useState(0);

  // Authored order for the apps; the stickers are shuffled per round so the
  // real price is never in one slot.
  const finished = idx >= rounds.length;
  const r = rounds[idx];
  const minutes = r?.minutes ?? EMPTY_MINUTES;
  const stickers = useShuffledOnce(PRICE_KINDS, { key: r?.id ?? "done" });
  const allPlayed = played >= minutes.length;
  const canFlip = !!r && allPlayed && !flipped && phase === "play";
  const stamped = phase === "stamped";
  const lastMinute = played > 0 ? minutes[played - 1] : undefined;
  // Round 1 teaches the mechanic only: PLAY breathes, then the tag.
  const guided = idx === 0;
  const wide = boardW === 0 || boardW >= WIDE_MIN;

  // Spoken verdicts: Sarah says "That's right!" + why and the next app waits
  // for her. Wrong stickers speak through WrongAnswerPanel.
  const verdict = useVerdictVoice(voice);
  const speaking = narr !== "idle" || verdict.speaking || !!feedback || stamped;

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
    setNarr(isAudioMuted() ? "idle" : coachLines ? "howto" : "read");
  };

  const advance = () => {
    setIdx((i) => i + 1);
    setPlayed(0);
    setFlipped(false);
    setRoundWrongs(0);
    setPhase("play");
    setNarr(isAudioMuted() ? "idle" : "read");
  };

  // PLAY ONE MINUTE: the next minute lands on the phone, its meter rises, and
  // Sarah reads it.
  const playMinute = () => {
    if (!r || speaking || phase !== "play" || played >= r.minutes.length) return;
    const m = r.minutes[played];
    if (m.cost === "none") audio.select();
    else audio.drop();
    setPlayed(played + 1);
    if (m.readAloud && !isAudioMuted()) setNarr("minute");
  };

  // FLIP: only once every minute has been played.
  const flipTag = () => {
    if (!canFlip || speaking) return;
    audio.cardFlip();
    setFlipped(true);
  };

  // STICK: the only judged tap.
  const pickSticker = (kind: PriceKind) => {
    if (!r || speaking || phase !== "play" || !flipped) return;
    const right = kind === r.answer;
    onAnswered?.({
      questionKey: `testdrive-${r.id}`,
      selectedIndex: PRICE_KINDS.indexOf(kind),
      correctIndex: PRICE_KINDS.indexOf(r.answer),
      wasCorrect: right,
    });
    if (right) {
      fx.correct({ xp: 25, text: rightToast });
      onCorrect?.();
      setPhase("stamped");
      // Sarah: "That's right!" + the round's why; the stamp lands under her,
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
      // WrongAnswerPanel speaks "Not quite." + this teach line itself; the
      // stickers stay so the retry is one tap.
      setFeedback({ title: wrongTitle, explanation: r.whyWrong, tip: rw >= 2 ? hints?.tier2 : hints?.tier1 });
    }
  };

  const meterLabel = (k: MeterKind) => meterLabels?.[k] ?? DEFAULT_METER_LABELS[k];
  const priceLabel = (k: PriceKind) => priceLabels?.[k] ?? DEFAULT_PRICE_LABELS[k];
  const countOf = (k: MeterKind) => minutes.slice(0, played).filter((m) => m.cost === k).length;
  // Every meter has a step per minute (at least three), so a full meter means
  // every minute cost that.
  const segments = Math.max(3, minutes.length);

  const stars = totalWrongs === 0 ? 3 : totalWrongs <= 2 ? 2 : 1;
  const hintText = roundWrongs >= 2 ? hints?.tier2 : roundWrongs === 1 ? hints?.tier1 : undefined;
  const hintTier = (roundWrongs >= 2 ? 2 : 1) as 1 | 2;
  const playGlow = guided && !allPlayed && !speaking;
  const tagGlow = guided && canFlip && !speaking;
  const guideStyle = (on: boolean): CSSProperties =>
    on
      ? { boxShadow: `0 0 0 3px ${accent}66, 0 0 22px ${accent}88`, animation: reduce ? undefined : "tdGuide 1.4s ease-in-out infinite" }
      : {};
  const toPlay = minutes.length - played;
  const strip = stamped
    ? rightToast
    : !allPlayed
      ? guided
        ? `Round 1: tap ${playLabel} and watch the meters`
        : `Tap ${playLabel}. ${toPlay} more to play`
      : !flipped
        ? guided
          ? `Round 1: every minute played. ${flipLabel} to see the real price`
          : `Every minute played. ${flipLabel} to see the real price`
        : "Tap the sticker that shows the real price";

  const eyebrowStyle: CSSProperties = {
    fontFamily: LABEL_FONT,
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: accent,
  };
  /** A face of the tag: both faces share the same box and hide their back. */
  const faceStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    borderRadius: 16,
    overflow: "hidden",
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  };

  /* ───────── The FREE tag, tied over the top of the phone ───────── */
  const tagAria = flipped
    ? `${realPriceLabel}: ${stamped && r ? priceLabel(r.answer) : "not stuck on yet"}`
    : canFlip
      ? flipLabel
      : `${freeTag} tag`;
  const tag: ReactNode = r ? (
    <div style={{ position: "relative", zIndex: 2, width: "100%", height: TAG_H - TAG_TUCK, display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
      <motion.button
        key={`tag-${r.id}`}
        type="button"
        aria-label={tagAria}
        onClick={flipTag}
        disabled={speaking || !canFlip}
        initial={reduce ? { opacity: 0, rotate: -4 } : { opacity: 0, y: -16, rotate: -12 }}
        animate={{ opacity: 1, y: 0, rotate: -4 }}
        transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 260, damping: 16 }}
        whileTap={canFlip && !speaking && !reduce ? { scale: 0.96 } : undefined}
        style={{
          position: "relative",
          width: TAG_W,
          height: TAG_H,
          padding: 0,
          border: "none",
          borderRadius: 16,
          background: "transparent",
          perspective: 900,
          cursor: canFlip && !speaking ? "pointer" : "default",
          touchAction: "manipulation",
          ...guideStyle(tagGlow),
        }}
      >
        <motion.span
          initial={false}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 170, damping: 17 }}
          style={{ position: "absolute", inset: 0, display: "block", transformStyle: "preserve-3d" }}
        >
          {/* Front: the shiny FREE promise. */}
          <span
            style={{
              ...faceStyle,
              background: TAG_GOLD,
              border: "3px solid #fff3c4",
              boxShadow: "0 12px 24px -12px rgba(0,0,0,0.85), inset 0 -4px 0 rgba(160,70,0,0.25)",
              color: "#4a2300",
            }}
          >
            <span
              aria-hidden
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                marginTop: -7,
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: "#0a1733",
                boxShadow: "inset 0 2px 3px rgba(0,0,0,0.6), 0 0 0 2px rgba(255,255,255,0.55)",
              }}
            />
            {/* The PIN through that hole. The punch hole on its own promised an
                attachment that was not there, so the tag read as hanging in
                mid-air (Abdullah, W9 5c). A domed metal head sitting in the
                hole is what makes it read as pinned on. */}
            <span
              aria-hidden
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                marginTop: -5,
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "radial-gradient(circle at 34% 30%, #ffffff 0%, #d7deeb 38%, #8d9ab4 72%, #5b6780 100%)",
                boxShadow: "0 1px 2px rgba(0,0,0,0.55), inset 0 -1px 1px rgba(0,0,0,0.25)",
                pointerEvents: "none",
              }}
            />
            {!reduce && (
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: 0,
                  width: "38%",
                  background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%)",
                  animation: "tdShine 2.8s ease-in-out infinite",
                  pointerEvents: "none",
                }}
              />
            )}
            <span style={{ position: "relative", paddingLeft: 14, fontFamily: LABEL_FONT, fontSize: 34, fontWeight: 900, letterSpacing: "0.08em", lineHeight: 1, textShadow: "0 1px 0 rgba(255,255,255,0.6)" }}>
              {freeTag}
            </span>
            {/* The caption keeps its line, so FREE never jumps when it appears. */}
            <span
              style={{
                position: "relative",
                minHeight: 14,
                marginTop: 5,
                paddingLeft: 14,
                fontFamily: LABEL_FONT,
                fontSize: 10.5,
                fontWeight: 900,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#6b3500",
                opacity: canFlip ? 1 : 0,
                transition: "opacity 200ms ease",
              }}
            >
              {flipLabel}
            </span>
          </span>

          {/* Back: the real price spot, empty until the right sticker lands. */}
          <span style={{ ...faceStyle, transform: "rotateY(180deg)", background: PAPER, border: "3px solid #ffffff", color: INK, gap: 4, padding: "6px 10px" }}>
            <span style={{ fontFamily: LABEL_FONT, fontSize: 10, fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(42,31,24,0.72)" }}>
              {realPriceLabel}
            </span>
            <span
              style={{
                width: "100%",
                height: 40,
                borderRadius: 10,
                border: stamped ? "3px double #16a34a" : "2px dashed rgba(42,31,24,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {stamped ? (
                <motion.span
                  key={`stuck-${r.id}`}
                  // Settles SQUARE to its box. A child rotate is relative to
                  // the parent, and the whole card already sits at -4deg, so a
                  // -3 here landed the price 3deg off the box it sits in and
                  // read as crooked text in a straight frame (Abdullah, W9 5d).
                  // The stamp-in tilt stays: it is the arrival that should feel
                  // thrown, not the resting state.
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.7, rotate: -14 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 380, damping: 14, delay: 0.1 }}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: KID_FONT, fontSize: 15, fontWeight: 900, lineHeight: 1.1, whiteSpace: "nowrap" }}
                >
                  <PixIcon emoji={PRICE_ICON[r.answer]} size={22} />
                  {priceLabel(r.answer)}
                </motion.span>
              ) : (
                <PixIcon emoji="❓" size={20} />
              )}
            </span>
          </span>
        </motion.span>
      </motion.button>
    </div>
  ) : null;

  /* ───────── The phone: the app bar, then one slot per minute ───────── */
  const renderMinute = (m: TestDriveMinute, i: number): ReactNode => {
    if (!r) return null;
    const newest = i === played - 1 && !flipped && phase === "play";
    const ink = m.cost === "none" ? null : METER_INK[m.cost];
    return (
      <motion.div
        key={`${r.id}-${m.id}`}
        role="listitem"
        initial={reduce ? { opacity: 0 } : { opacity: 0, x: 28, scale: 0.96 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 340, damping: 24 }}
        style={{
          minHeight: SLOT_MIN_H,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 8px",
          borderRadius: 12,
          background: ink ? `${ink}1f` : "rgba(255,255,255,0.07)",
          border: `2px solid ${newest ? accent : ink ? `${ink}66` : "rgba(255,255,255,0.12)"}`,
          color: "#fff7e6",
          fontFamily: KID_FONT,
          transition: "border-color 220ms ease",
        }}
      >
        <span aria-hidden style={{ flexShrink: 0, width: 30, display: "grid", placeItems: "center" }}>
          <PixIcon emoji={m.icon} size={26} />
        </span>
        <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 700, lineHeight: 1.25, overflowWrap: "anywhere" }}>{m.text}</span>
        {m.cost !== "none" && (
          <span
            role="img"
            aria-label={`Costs ${meterLabel(m.cost)}`}
            style={{
              flexShrink: 0,
              display: "inline-flex",
              alignItems: "center",
              gap: 2,
              padding: "2px 6px 2px 3px",
              borderRadius: 999,
              background: "rgba(8,10,22,0.6)",
              border: `1.5px solid ${METER_INK[m.cost]}`,
              color: METER_INK[m.cost],
              fontFamily: LABEL_FONT,
              fontSize: 12,
              fontWeight: 900,
              lineHeight: 1,
            }}
          >
            <PixIcon emoji={PRICE_ICON[m.cost]} size={16} />
            +1
          </span>
        )}
      </motion.div>
    );
  };

  const renderSlot = (i: number): ReactNode => (
    <div
      key={`${r?.id ?? "none"}-slot-${i}`}
      role="listitem"
      aria-label={`Minute ${i + 1}, not played yet`}
      style={{
        minHeight: SLOT_MIN_H,
        borderRadius: 12,
        border: "1.5px dashed rgba(255,255,255,0.16)",
        display: "grid",
        placeItems: "center",
        color: "rgba(255,247,230,0.38)",
        fontFamily: LABEL_FONT,
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
      }}
    >
      Minute {i + 1}
    </div>
  );

  const phone: ReactNode = r ? (
    <div
      style={{
        position: "relative",
        zIndex: 1,
        width: PHONE_W,
        maxWidth: "100%",
        padding: "22px 10px 10px",
        borderRadius: 30,
        background: DEVICE,
        border: `2px solid ${accent}88`,
        boxShadow: `0 0 0 3px ${accent}1f, 0 18px 36px -20px rgba(0,0,0,0.9)`,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        color: "#fff7e6",
      }}
    >
      {/* App bar: the app, and how far the test drive has got. */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 4px" }}>
        <span style={{ flexShrink: 0, width: 44, height: 44, borderRadius: 12, display: "grid", placeItems: "center", background: `${accent}26`, border: `1px solid ${accent}77` }}>
          <PixIcon emoji={r.appIcon} size={30} />
        </span>
        <span style={{ minWidth: 0 }}>
          <span style={{ display: "block", fontFamily: LABEL_FONT, fontWeight: 900, fontSize: 16, lineHeight: 1.2, overflowWrap: "anywhere" }}>{r.appName}</span>
          <span style={{ display: "block", marginTop: 2, fontFamily: LABEL_FONT, fontSize: 10.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#c9b8ff" }}>
            {played} of {minutes.length} minutes played
          </span>
        </span>
      </div>

      {/* The screen: every minute's slot, filled in order as it is played. */}
      <div
        role="list"
        aria-label={`${r.appName}, minute by minute`}
        style={{ borderRadius: 18, background: SCREEN, border: "1px solid rgba(255,255,255,0.08)", padding: 8, display: "flex", flexDirection: "column", gap: 6 }}
      >
        {minutes.map((m, i) => (i < played ? renderMinute(m, i) : renderSlot(i)))}
      </div>
      <span aria-hidden style={{ alignSelf: "center", width: 64, height: 4, borderRadius: 3, background: "rgba(255,255,255,0.2)" }} />
    </div>
  ) : null;

  /* ───────── The meters: TIME, COINS, INFO ───────── */
  const renderMeter = (k: MeterKind): ReactNode => {
    if (!r) return null;
    const c = countOf(k);
    const ink = METER_INK[k];
    const tubeH = wide ? TUBE_H : TUBE_H_NARROW;
    const segH = (tubeH - 12 - (segments - 1) * 3) / segments;
    return (
      <div
        key={k}
        role="meter"
        aria-label={meterLabel(k)}
        aria-valuemin={0}
        aria-valuemax={segments}
        aria-valuenow={c}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, minWidth: 72 }}
      >
        <motion.span
          key={`icon-${r.id}-${k}-${c}`}
          initial={reduce || c === 0 ? false : { scale: 1.4 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 420, damping: 14 }}
          style={{ display: "grid", placeItems: "center", height: 30 }}
        >
          <PixIcon emoji={PRICE_ICON[k]} size={28} />
        </motion.span>
        <span
          style={{
            position: "relative",
            width: TUBE_W,
            height: tubeH,
            padding: 4,
            borderRadius: 16,
            background: "rgba(255,255,255,0.05)",
            border: `2px solid ${c > 0 ? ink : "rgba(255,255,255,0.2)"}`,
            boxShadow: c > 0 ? `0 0 16px ${ink}55, inset 0 0 10px rgba(0,0,0,0.5)` : "inset 0 0 10px rgba(0,0,0,0.5)",
            display: "flex",
            flexDirection: "column-reverse",
            gap: 3,
            transition: "border-color 250ms ease, box-shadow 250ms ease",
          }}
        >
          {Array.from({ length: segments }, (_, s) => (
            <span key={s} style={{ position: "relative", flexShrink: 0, height: segH, borderRadius: 6, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
              {s < c && (
                <motion.span
                  key={`fill-${r.id}`}
                  initial={reduce ? { opacity: 0 } : { scaleY: 0 }}
                  animate={reduce ? { opacity: 1 } : { scaleY: 1 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  style={{ position: "absolute", inset: 0, transformOrigin: "bottom", borderRadius: 6, background: `linear-gradient(180deg, ${ink} 0%, ${ink}bb 100%)` }}
                />
              )}
            </span>
          ))}
          {/* "+1" floats off the top of the meter as it rises. */}
          {c > 0 && !reduce && (
            <motion.span
              key={`pop-${r.id}-${k}-${c}`}
              aria-hidden
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: -26 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              style={{
                position: "absolute",
                left: "50%",
                top: -8,
                marginLeft: -14,
                width: 28,
                textAlign: "center",
                fontFamily: LABEL_FONT,
                fontSize: 14,
                fontWeight: 900,
                color: ink,
                textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                pointerEvents: "none",
              }}
            >
              +1
            </motion.span>
          )}
        </span>
        <span style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: c > 0 ? ink : "#c9b8ff" }}>{meterLabel(k)}</span>
        <span style={{ fontFamily: LABEL_FONT, fontSize: 20, fontWeight: 900, lineHeight: 1, color: c > 0 ? ink : "rgba(255,247,230,0.5)", fontVariantNumeric: "tabular-nums" }}>{c}</span>
      </div>
    );
  };

  const meters: ReactNode = r ? (
    <div
      role="group"
      aria-label={metersTitle}
      style={{
        width: "100%",
        borderRadius: 18,
        background: "linear-gradient(180deg, rgba(18,24,58,0.92) 0%, rgba(10,14,36,0.94) 100%)",
        border: `1px solid ${accent}55`,
        boxShadow: `0 18px 40px -22px rgba(0,0,0,0.7), inset 0 0 0 1px ${accent}22`,
        padding: "10px 12px 12px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <div style={eyebrowStyle}>{metersTitle}</div>
      <div style={{ display: "flex", justifyContent: "space-around", width: "100%", gap: 8 }}>{METERS.map(renderMeter)}</div>
    </div>
  ) : null;

  /* ───────── The action slot: PLAY, then the four stickers ───────── */
  const renderSticker = (k: PriceKind): ReactNode => {
    if (!r) return null;
    const stuck = stamped && r.answer === k;
    return (
      <motion.button
        key={k}
        type="button"
        aria-label={`Sticker: ${priceLabel(k)}`}
        onClick={() => pickSticker(k)}
        disabled={speaking}
        whileTap={speaking || reduce ? undefined : { scale: 0.96 }}
        style={{
          position: "relative",
          width: "100%",
          minHeight: STICKER_H,
          padding: "8px 10px",
          borderRadius: 14,
          // Every sticker the same paper, size and ink, every round: nothing
          // here can hint at the real price. Only a right pick stamps one.
          background: PAPER,
          border: "3px solid #ffffff",
          boxShadow: "0 8px 16px -10px rgba(0,0,0,0.85), inset 0 0 0 1.5px rgba(42,31,24,0.14)",
          color: INK,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          fontFamily: KID_FONT,
          fontSize: 15,
          fontWeight: 800,
          lineHeight: 1.2,
          textAlign: "center",
          cursor: speaking ? "wait" : "pointer",
          touchAction: "manipulation",
        }}
      >
        <PixIcon emoji={PRICE_ICON[k]} size={24} />
        <span>{priceLabel(k)}</span>
        {stuck && (
          <motion.span
            aria-hidden
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 380, damping: 14 }}
            style={{ position: "absolute", top: -10, right: -8, display: "grid", placeItems: "center" }}
          >
            <PixIcon emoji="✅" size={24} />
          </motion.span>
        )}
      </motion.button>
    );
  };

  const action: ReactNode = r ? (
    <div style={{ width: "100%", minHeight: wide ? ACTION_H : undefined, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      {!flipped ? (
        !allPlayed ? (
          <span style={{ display: "inline-block", borderRadius: 16, ...guideStyle(playGlow) }}>
            <GameButton variant="primary" size="lg" icon="🎮" onClick={playMinute} disabled={speaking || allPlayed} aria-label={playLabel} style={{ minWidth: 230 }}>
              {playLabel}
            </GameButton>
          </span>
        ) : (
          // PLAY steps aside once its job is done; the tag is next.
          <div
            role="status"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 14px",
              borderRadius: 999,
              background: `${accent}1f`,
              border: `1px solid ${accent}66`,
              color: "#fff7e6",
              fontFamily: KID_FONT,
              fontSize: 14,
              fontWeight: 800,
            }}
          >
            <PixIcon emoji="✔️" size={18} />
            All {minutes.length} minutes played
          </div>
        )
      ) : (
        <motion.div
          key={`sheet-${r.id}`}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.25 }}
          role="group"
          aria-label={realPriceLabel}
          style={{ width: "100%", display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}
        >
          {stickers.map(renderSticker)}
        </motion.div>
      )}
    </div>
  ) : null;

  // Complete-beat story: every app on the list, and how it really got paid.
  const freeApps = rounds.filter((x) => x.answer === "free").length;
  const paidApps = rounds.length - freeApps;

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

      {/* Sarah's read-alouds (audio only): the how-to once, each app, each minute. */}
      {!showIntro && !finished && r && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="td-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent={accent} recordedOnly onDone={() => setNarr("read")} />
          )}
          {narr === "read" && (
            <InfoNarration key={`td-read-${r.id}`} speaker={voice} lines={[r.readAloud]} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
          {narr === "minute" && lastMinute && (
            <InfoNarration
              key={`td-min-${r.id}-${lastMinute.id}`}
              speaker={voice}
              lines={[lastMinute.readAloud]}
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

          {/* The board: the tagged phone | the meters over PLAY and the stickers. */}
          <div
            ref={setBoardEl}
            style={{
              margin: "0 14px",
              padding: "12px 12px 12px",
              borderRadius: 18,
              background: "linear-gradient(180deg, rgba(0,0,0,0.26) 0%, rgba(0,0,0,0.4) 100%)",
              border: `1px solid ${accent}44`,
              boxShadow: `0 18px 40px -22px rgba(0,0,0,0.8), inset 0 0 0 1px ${accent}14`,
            }}
          >
            {wide ? (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: COL_GAP }}>
                <div style={{ width: PHONE_W, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
                  {tag}
                  {phone}
                </div>
                <div style={{ width: RIGHT_W, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                  {meters}
                  {action}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                <div style={{ width: PHONE_W, maxWidth: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  {tag}
                  {phone}
                </div>
                <div style={{ width: RIGHT_W, maxWidth: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                  {meters}
                  {action}
                </div>
              </div>
            )}
          </div>

          {/* On-board instructions: the current beat, in the child's words. */}
          <div style={{ textAlign: "center", marginTop: 14 }}>
            <div style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: accent, minHeight: 16, padding: "0 16px" }}>
              {strip}
            </div>
          </div>

          <div style={{ maxWidth: 560, margin: "8px auto 0" }}>
            {hintText && <HintBubble tier={hintTier} speaker={voice} text={hintText} />}
          </div>

          <style>{`
            @keyframes tdGuide { 0%,100% { box-shadow: 0 0 0 3px ${accent}55, 0 0 16px ${accent}77 } 50% { box-shadow: 0 0 0 6px ${accent}22, 0 0 28px ${accent} } }
            @keyframes tdShine { 0% { transform: translateX(-120%) skewX(-18deg) } 55%,100% { transform: translateX(290%) skewX(-18deg) } }
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
            `${rounds.length} FREE app${rounds.length === 1 ? "" : "s"} test-driven: ${paidApps} paid another way, ${freeApps} truly free`,
            completeLine,
          ]}
          narration={completeNarration}
          onContinue={() => onComplete(stars === 3 ? 100 : stars === 2 ? 70 : 40)}
        />
      )}
    </ExerciseFrame>
  );
}
