"use client";

/**
 * CoinCounter: the COUNT drill (Week 7, "The Coin Counter").
 *
 * A gem-shop pack sits on the left with its shiny price tag, a till in the
 * middle, and the child's piggy bank on the right, full of identical real
 * coins. The child pays for the pack ONE COIN AT A TIME: every tap sends a
 * coin flying into the till, the till's digits tick up and the bank's total
 * ticks down. When the till reaches the price the pack is paid and the till
 * prints a receipt that says, in plain words, where the money really went.
 * The bank carries over from pack to pack, so it drains for real, and the
 * last pack is authored to be unaffordable: the bank runs dry first, the till
 * says so, and the one right move is to tap I CAN'T AFFORD IT.
 *
 * Why it is not the inspectors, the stampers or the Guard Count (owner: "we
 * never copy an exercise"): nothing is judged real or fake and nothing is
 * marked; the verb is COUNT. The child physically moves the money and watches
 * it leave, and there is no wrong path: this is a demonstration engine whose
 * lesson is the counting itself. Every coin is identical; the only glow is the
 * round-1 guide and the STOP button, which appears only once the bank is empty.
 *
 * Learn-Loop wiring: Raccoon boast in the intro (`threat`), Sarah's how-to
 * once and every pack read aloud as it arrives (audio-only, `recordedOnly`,
 * taps held), a spoken verdict on every settled pack ("That's right!" + why
 * via VerdictVoice) with the next pack waiting for her, a spoken payoff on the
 * complete beat. Packs play in AUTHORED order (the drain is the story).
 * Tap-only, no timer, no lose state.
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
import InfoNarration from "@/app/components/lesson/InfoNarration";
import GameButton from "@/app/components/lesson/GameButton";
import { useVerdictVoice } from "@/app/components/lesson/VerdictVoice";
import PixIcon from "@/app/components/lesson/PixIcon";
import { SPOKEN_GATE_MAX_MS } from "@/app/lib/gameEngine/spokenGate";

// Audio-only narration: Sarah's voice with no visible narration box (the text
// she reads is already on screen), same recipe as ClueStamper / ChatFixer.
const AUDIO_ONLY_STYLE = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  pointerEvents: "none",
} as const;
// SPOKEN_GATE_MAX_MS is shared: see app/lib/gameEngine/spokenGate.ts.

export interface CoinPack {
  id: string;
  /** The pack's shop name, e.g. "Mega Gem Bundle". */
  name: string;
  /** How many shiny gems the pack sells. */
  gems: number;
  /** The price in real coins, deducted from the bank when paid. */
  price: number;
  /** Sarah's read-aloud as the pack lands in the shop (one clip). */
  readAloud: string;
  /** The line the till prints once the pack is paid. */
  receipt: string;
  /** Sarah's reason on settling the pack ("That's right!" + why), paid or stopped. */
  why: string;
}

export interface CoinCounterProps {
  /** Played in AUTHORED order: the last pack is designed to be unaffordable. */
  packs: CoinPack[];
  /** Real coins in the piggy bank at the start. Carries over across packs. */
  startBank: number;
  introTitle?: string;
  introSubtitle?: string;
  introIcon?: string;
  /** Panel eyebrows. */
  shopLabel?: string;
  tillLabel?: string;
  bankLabel?: string;
  /** The unit word after every total. Default "coins". */
  coinWord?: string;
  /** The one button that appears when the bank runs dry. */
  stopLabel?: string;
  /** fx.correct toasts. */
  paidToast?: string;
  stopToast?: string;
  /** Printed under the receipt once a pack is paid. */
  fullNote?: string;
  /** Shown on the till when the bank is empty before the price is reached. */
  shortNote?: string;
  completeTitle?: string;
  completeLine?: string;
  /** Accepted for parity with the other engines; there is no wrong path here,
   *  so no hint tier is ever reached and nothing is shown. */
  hints?: { tier1: string; tier2: string };
  introNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  /** The how-to, spoken once as the board appears (audio only). */
  coachLines?: { speaker?: "adam" | "layla"; lines: string[] };
  /** Optional "Spot the Danger" Raccoon preamble folded into the intro. */
  threat?: { raccoonLine: string };
  /** Optional spoken "you're protected" payoff on the complete screen. */
  completeNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  onComplete: (score: number) => void;
  onCorrect?: () => void;
  /** Never fires: this engine has no wrong path. */
  onWrong?: () => void;
  /** Never fires: no hint tier is reachable without a wrong path. */
  onHintReached?: (tier: 1 | 2 | 3) => void;
  onAnswered?: (o: {
    questionKey: string;
    selectedIndex: number;
    correctIndex: number;
    wasCorrect: boolean;
  }) => void;
}

const KID_FONT = "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif";
const LABEL_FONT = "'Space Grotesk', sans-serif";
const MONO_FONT = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace";
/** Every coin wears the same gold: nothing here can hint at anything. */
const COIN_FACE: CSSProperties = {
  borderRadius: "50%",
  background: "radial-gradient(circle at 35% 30%, #fff1bf 0%, #f5c04a 42%, #c98a1e 78%, #8a5a12 100%)",
  border: "2px solid #7a4e0e",
  boxShadow: "inset 0 0 0 3px rgba(255,255,255,0.28), 0 3px 8px rgba(0,0,0,0.45)",
};
/** Typewriter pace for the receipt (ms per character). */
const PRINT_MS = 36;

export default function CoinCounter({
  packs,
  startBank,
  introTitle = "The Coin Counter",
  introSubtitle = "Pay for each pack with real coins, and stop when the bank runs dry.",
  introIcon = "🪙",
  shopLabel = "Gem shop",
  tillLabel = "Till",
  bankLabel = "Piggy bank",
  coinWord = "coins",
  stopLabel = "I CAN'T AFFORD IT",
  paidToast = "PAID! REAL MONEY.",
  stopToast = "SMART STOP!",
  fullNote = "That was real money",
  shortNote = "Not enough coins in the bank",
  completeTitle = "Every pack counted!",
  completeLine = "Coins are money with a costume on.",
  introNarration,
  coachLines,
  threat,
  completeNarration,
  onComplete,
  onCorrect,
  onAnswered,
}: CoinCounterProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;
  const accent = useLessonTheme()?.accent ?? "#ffd158";
  // Both content voices are Sarah; in-game read-alouds and verdict reasons are
  // recorded under "adam", so every manifest lookup here uses that key.
  const voice = "adam" as const;

  const [showIntro, setShowIntro] = useState(true);
  const [idx, setIdx] = useState(0);
  // Read-aloud chain: the how-to once as the board appears, then each pack as
  // it arrives. Taps are held while she speaks. "idle" = nothing playing.
  const [narr, setNarr] = useState<"howto" | "read" | "idle">("idle");
  // "sealed" = the pack is settled (paid or stopped): the receipt prints or the
  // STOPPED seal lands while Sarah says why, then the next pack arrives.
  const [phase, setPhase] = useState<"play" | "sealed">("play");
  // The real coins left in the bank, by id: the tapped coin leaves and the rest
  // close up. Carries over across packs and is never refilled.
  const [coins, setCoins] = useState<number[]>(() => Array.from({ length: Math.max(0, Math.floor(startBank)) }, (_, i) => i));
  // Coins paid into the till for the current pack.
  const [till, setTill] = useState(0);
  const [outcome, setOutcome] = useState<"paid" | "stopped" | null>(null);
  // Typewriter progress on the receipt (characters shown).
  const [printed, setPrinted] = useState(0);
  // The coin in flight from the bank to the till (a one-shot per tap).
  const [flight, setFlight] = useState<{ n: number } | null>(null);
  const [guidedTaps, setGuidedTaps] = useState(0);
  const [paidCount, setPaidCount] = useState(0);
  const [stoppedCount, setStoppedCount] = useState(0);
  const flightSeq = useRef(0);

  // Authored order, on purpose: the bank drains pack by pack and the last one
  // is written to be the one it cannot cover.
  const finished = idx >= packs.length;
  const c = packs[idx];
  const bank = coins.length;
  // The bank ran dry before the price was reached: the till stops and the one
  // right move is the STOP button.
  const short = !!c && phase === "play" && bank === 0 && till < c.price;
  // Round 1 teaches itself: the first coin breathes until the child has made
  // that first tap.
  const guided = idx === 0 && guidedTaps === 0;

  // Spoken verdicts: Sarah says "That's right!" + why and the next pack waits
  // for her. There is no wrong verdict in this engine.
  const verdict = useVerdictVoice(voice);
  const speaking = narr !== "idle" || verdict.speaking || phase === "sealed";

  // Safety releases for the spoken gate (never leave the board held).
  useEffect(() => {
    if (narr === "idle") return;
    const id = window.setTimeout(() => setNarr("idle"), SPOKEN_GATE_MAX_MS);
    return () => window.clearTimeout(id);
  }, [narr]);
  useEffect(() => subscribeAudioMute((muted) => { if (muted) setNarr("idle"); }), []);

  // A flight is a one-shot: clear it once landed so the next tap re-triggers.
  useEffect(() => {
    if (!flight) return;
    const id = window.setTimeout(() => setFlight(null), 480);
    return () => window.clearTimeout(id);
  }, [flight]);

  // The receipt types itself out one character at a time once the pack is paid.
  const printing = phase === "sealed" && outcome === "paid";
  const receiptLen = c?.receipt.length ?? 0;
  useEffect(() => {
    if (!printing || reduce || printed >= receiptLen) return;
    const id = window.setTimeout(() => setPrinted((n) => n + 1), PRINT_MS);
    return () => window.clearTimeout(id);
  }, [printing, reduce, printed, receiptLen]);

  const startBoard = () => {
    setShowIntro(false);
    setNarr(isAudioMuted() ? "idle" : coachLines ? "howto" : "read");
  };

  const advance = () => {
    setIdx((i) => i + 1);
    setTill(0);
    setOutcome(null);
    setPrinted(0);
    setFlight(null);
    setPhase("play");
    setNarr(isAudioMuted() ? "idle" : "read");
  };

  // Settle the pack. Both outcomes are the right move for their pack: index 0
  // = paid the price in full, index 1 = stopped because the bank ran dry.
  const settle = (kind: "paid" | "stopped") => {
    if (!c) return;
    const at = kind === "paid" ? 0 : 1;
    onAnswered?.({ questionKey: `pack-${c.id}`, selectedIndex: at, correctIndex: at, wasCorrect: true });
    fx.correct({ xp: 20, text: kind === "paid" ? paidToast : stopToast });
    onCorrect?.();
    if (kind === "paid") setPaidCount((n) => n + 1);
    else setStoppedCount((n) => n + 1);
    setOutcome(kind);
    setPhase("sealed");
    // Sarah: "That's right!" + the pack's why; the receipt prints (or the seal
    // lands) under her, then the next pack arrives.
    verdict.say("right", c.why, () => {
      window.setTimeout(advance, reduce ? 200 : 900);
    });
  };

  const tapCoin = (id: number) => {
    if (!c || speaking || short || till >= c.price) return;
    audio.drop();
    setGuidedTaps((n) => (n === 0 ? 1 : n));
    setCoins((prev) => prev.filter((k) => k !== id));
    const nextTill = till + 1;
    setTill(nextTill);
    if (!reduce) {
      flightSeq.current += 1;
      setFlight({ n: flightSeq.current });
    }
    // The till stops taking coins at the price: this tap pays the pack.
    if (nextTill >= c.price) settle("paid");
  };

  const tapStop = () => {
    if (!c || speaking || !short) return;
    settle("stopped");
  };

  const shownReceipt = c ? (reduce ? c.receipt : c.receipt.slice(0, printed)) : "";
  const receiptDone = printing && (reduce || printed >= receiptLen);
  const guideStyle = (on: boolean) =>
    on
      ? { boxShadow: `0 0 0 3px ${accent}66, 0 0 22px ${accent}88`, animation: reduce ? undefined : "ccGuide 1.4s ease-in-out infinite" }
      : {};
  const strip = guided
    ? "Round 1: tap a coin to pay it into the till"
    : short
      ? "The bank is empty. Tap the glowing button"
      : "Tap coins into the till until the price is paid";

  const panelStyle = (extra: CSSProperties): CSSProperties => ({
    position: "relative",
    borderRadius: 18,
    background: "linear-gradient(180deg, rgba(18,24,58,0.92) 0%, rgba(10,14,36,0.94) 100%)",
    // Every panel the same rim, on every pack: nothing here can hint.
    border: `1px solid ${accent}55`,
    boxShadow: `0 18px 40px -22px rgba(0,0,0,0.7), inset 0 0 0 1px ${accent}22`,
    padding: "12px 12px 14px",
    color: "#fff7e6",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    ...extra,
  });
  const eyebrowStyle: CSSProperties = {
    fontFamily: LABEL_FONT,
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: accent,
  };

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

      {/* Sarah's read-alouds (audio only): the how-to once, then each pack. */}
      {!showIntro && !finished && c && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="cc-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent={accent} recordedOnly onDone={() => setNarr("read")} />
          )}
          {narr === "read" && (
            <InfoNarration key={`cc-read-${c.id}`} speaker={voice} lines={[c.readAloud]} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
        </div>
      )}

      {!showIntro && !finished && c && (
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Side padding keeps the header clear of the frame's corner ornaments. */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "2px 22px 0" }}>
            <span style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: accent }}>
              🪙 {introTitle}
            </span>
            <span style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c9b8ff" }}>
              Pack {Math.min(idx + 1, packs.length)} of {packs.length}
            </span>
          </div>

          {/* Shop | Till | Piggy bank */}
          <div style={{ display: "flex", gap: 14, alignItems: "stretch", flexWrap: "wrap", justifyContent: "center", padding: "0 12px" }}>
            {/* The shop pack card */}
            <motion.div
              key={`shop-${c.id}`}
              initial={reduce ? { opacity: 0 } : { opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              style={panelStyle({ flex: "1 1 190px", minWidth: 180, maxWidth: 250 })}
            >
              <div style={eyebrowStyle}>{shopLabel}</div>
              <span style={{ width: 72, height: 72, borderRadius: 18, display: "grid", placeItems: "center", background: `${accent}1c`, border: `1px solid ${accent}55` }}>
                <PixIcon emoji="💎" size={50} />
              </span>
              <div style={{ fontFamily: LABEL_FONT, fontWeight: 900, fontSize: 17, lineHeight: 1.2, textAlign: "center", wordBreak: "break-word" }}>{c.name}</div>
              <div style={{ fontFamily: KID_FONT, fontSize: 14, fontWeight: 700, color: "#c9b8ff" }}>
                {c.gems} gem{c.gems === 1 ? "" : "s"}
              </div>
              {/* The shiny tag: the price in REAL coins. */}
              <div
                style={{
                  marginTop: 2,
                  padding: "6px 14px 6px 22px",
                  borderRadius: "999px 8px 8px 999px",
                  background: "linear-gradient(135deg, #fff1bf 0%, #f5c04a 55%, #d59a2a 100%)",
                  color: "#2a1a08",
                  fontFamily: LABEL_FONT,
                  fontWeight: 900,
                  fontSize: 15,
                  letterSpacing: "0.04em",
                  boxShadow: "0 6px 16px -6px rgba(245,192,74,0.7), inset 0 1px 0 rgba(255,255,255,0.7)",
                  position: "relative",
                  whiteSpace: "nowrap",
                }}
              >
                <span aria-hidden style={{ position: "absolute", left: 8, top: "50%", marginTop: -4, width: 8, height: 8, borderRadius: "50%", background: "#2a1a08", opacity: 0.6 }} />
                {c.price} {coinWord}
              </div>
            </motion.div>

            {/* The till */}
            <div style={panelStyle({ flex: "1 1 220px", minWidth: 200, maxWidth: 290, overflow: "hidden" })}>
              <div style={eyebrowStyle}>{tillLabel}</div>
              {/* The running total, big, with the coin flying in from the bank's side. */}
              <div style={{ position: "relative", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <motion.div
                  key={`till-${c.id}-${till}`}
                  initial={reduce || till === 0 ? false : { scale: 1.22 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 420, damping: 18 }}
                  aria-live="polite"
                  aria-label={`${tillLabel}: ${till} of ${c.price} ${coinWord}`}
                  style={{
                    fontFamily: LABEL_FONT,
                    fontWeight: 900,
                    fontSize: 52,
                    lineHeight: 1,
                    color: accent,
                    textShadow: `0 0 18px ${accent}66`,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {till}
                </motion.div>
                <div style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c9b8ff", marginTop: 4 }}>
                  of {c.price} {coinWord}
                </div>
                <AnimatePresence>
                  {flight && (
                    <motion.span
                      key={flight.n}
                      aria-hidden
                      initial={{ x: 120, y: -36, opacity: 0.95, scale: 0.95 }}
                      animate={{ x: 0, y: 8, opacity: 0, scale: 0.45 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.42, ease: "easeIn" }}
                      style={{ position: "absolute", top: 8, left: "50%", marginLeft: -16, width: 32, height: 32, ...COIN_FACE, pointerEvents: "none" }}
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* The receipt slot: a dark slit the paper comes out of. */}
              <div aria-hidden style={{ width: "92%", height: 9, borderRadius: 5, background: "#070914", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.9), 0 1px 0 rgba(255,255,255,0.08)" }} />

              {/* Paid: the receipt prints itself (typewriter). */}
              <AnimatePresence>
                {outcome === "paid" && (
                  <motion.div
                    key="paper"
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: -18, scaleY: 0.3 }}
                    animate={{ opacity: 1, y: 0, scaleY: 1 }}
                    exit={{ opacity: 0 }}
                    transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 260, damping: 22 }}
                    style={{
                      transformOrigin: "top center",
                      width: "86%",
                      marginTop: -4,
                      background: "#fffaf0",
                      color: "#2a1a08",
                      borderRadius: "2px 2px 6px 6px",
                      borderBottom: "3px dashed rgba(42,26,8,0.35)",
                      padding: "8px 10px 10px",
                      fontFamily: MONO_FONT,
                      fontSize: 12.5,
                      lineHeight: 1.45,
                      textAlign: "left",
                      boxShadow: "0 10px 22px -10px rgba(0,0,0,0.7)",
                    }}
                  >
                    <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.24em", textTransform: "uppercase", color: "#8a5a12", textAlign: "center", marginBottom: 4 }}>
                      Receipt
                    </div>
                    <div style={{ fontWeight: 800, marginBottom: 2 }}>{c.name}</div>
                    <div aria-live="polite">
                      {shownReceipt}
                      {!receiptDone && (
                        <span aria-hidden style={{ display: "inline-block", width: 7, height: 12, marginLeft: 1, verticalAlign: "-2px", background: "#2a1a08", animation: "ccCaret 0.7s steps(1) infinite" }} />
                      )}
                    </div>
                    {receiptDone && (
                      <motion.div
                        initial={reduce ? false : { opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ marginTop: 6, paddingTop: 4, borderTop: "1px dashed rgba(42,26,8,0.35)", fontWeight: 900, fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", textAlign: "center" }}
                      >
                        {fullNote}
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Short: the till says so and the one button appears. */}
              <AnimatePresence>
                {short && (
                  <motion.div
                    key="short"
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, width: "100%", marginTop: 2 }}
                  >
                    <div
                      role="status"
                      style={{
                        padding: "7px 12px",
                        borderRadius: 10,
                        background: "rgba(239,68,68,0.14)",
                        border: "1px solid rgba(255,95,95,0.5)",
                        color: "#ffd6d6",
                        fontFamily: KID_FONT,
                        fontWeight: 800,
                        fontSize: 13,
                        lineHeight: 1.3,
                        textAlign: "center",
                      }}
                    >
                      {shortNote}
                    </div>
                    <div style={{ display: "inline-block", borderRadius: 16, ...guideStyle(!speaking) }}>
                      <GameButton variant="primary" size="lg" icon="✋" onClick={tapStop} disabled={speaking} aria-label={stopLabel}>
                        {stopLabel}
                      </GameButton>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Stopped: the seal lands only after the right move (never before). */}
              <AnimatePresence>
                {phase === "sealed" && outcome === "stopped" && (
                  <motion.div
                    key="seal"
                    initial={reduce ? { opacity: 0, x: "-50%" } : { opacity: 0, x: "-50%", scale: 1.8, rotate: -20 }}
                    animate={{ opacity: 1, x: "-50%", scale: 1, rotate: -6 }}
                    exit={{ opacity: 0, x: "-50%" }}
                    transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 380, damping: 14, delay: 0.15 }}
                    style={{
                      position: "absolute",
                      left: "50%",
                      bottom: 18,
                      padding: "8px 16px",
                      borderRadius: 10,
                      border: "4px double #34d399",
                      color: "#a0ffb0",
                      background: "rgba(8,10,22,0.85)",
                      fontFamily: LABEL_FONT,
                      fontWeight: 900,
                      fontSize: 17,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                      boxShadow: "0 0 18px rgba(52,211,153,0.5)",
                      zIndex: 3,
                    }}
                  >
                    ✋ Stopped
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* The piggy bank: identical real coins, carried over across packs. */}
            <div style={panelStyle({ flex: "1 1 230px", minWidth: 210, maxWidth: 320 })}>
              <div style={eyebrowStyle}>{bankLabel}</div>
              <motion.div
                key={`bank-${bank}`}
                initial={reduce ? false : { scale: 1.12 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 420, damping: 18 }}
                aria-live="polite"
                style={{ fontFamily: LABEL_FONT, fontWeight: 900, fontSize: 22, lineHeight: 1, color: "#fff7e6", fontVariantNumeric: "tabular-nums" }}
              >
                {bank} <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c9b8ff" }}>{coinWord}</span>
              </motion.div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, justifyContent: "center", alignContent: "flex-start", width: "100%", minHeight: 52, padding: "4px 2px" }}>
                <AnimatePresence initial={false}>
                  {coins.map((id, i) => {
                    const glow = guided && i === 0 && !speaking && !short;
                    return (
                      <motion.button
                        key={id}
                        layout={!reduce}
                        type="button"
                        aria-label="Coin"
                        onClick={() => tapCoin(id)}
                        disabled={speaking || short || till >= c.price}
                        exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.4, y: -12, transition: { duration: 0.18 } }}
                        whileTap={speaking || reduce ? undefined : { scale: 0.9 }}
                        style={{
                          width: 38,
                          height: 38,
                          padding: 0,
                          cursor: speaking ? "wait" : "pointer",
                          ...COIN_FACE,
                          ...guideStyle(glow),
                        }}
                      />
                    );
                  })}
                </AnimatePresence>
                {bank === 0 && (
                  <span style={{ alignSelf: "center", fontFamily: LABEL_FONT, fontSize: 10, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,247,230,0.4)", padding: "12px 0" }}>
                    Empty
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* On-board instructions: the current step, in the child's words. */}
          <div style={{ textAlign: "center", marginTop: 14 }}>
            <div style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: accent, minHeight: 16, padding: "0 16px" }}>
              {strip}
            </div>
          </div>

          <style>{`
            @keyframes ccGuide { 0%,100% { box-shadow: 0 0 0 3px ${accent}55, 0 0 16px ${accent}77 } 50% { box-shadow: 0 0 0 6px ${accent}22, 0 0 28px ${accent} } }
            @keyframes ccCaret { 0%,100% { opacity: 1 } 50% { opacity: 0 } }
          `}</style>
        </div>
      )}

      {finished && (
        <ExerciseCompleteBeat
          title={completeTitle}
          stars={3}
          statLines={[`${paidCount} pack${paidCount === 1 ? "" : "s"} paid, ${stoppedCount} stopped`, completeLine]}
          narration={completeNarration}
          onContinue={() => onComplete(100)}
        />
      )}
    </ExerciseFrame>
  );
}
