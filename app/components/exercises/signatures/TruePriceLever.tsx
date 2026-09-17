"use client";

/**
 * TruePriceLever: Week 7 (In-Game Spending) signature exercise, rebuilt as a
 * data-driven concept game to the Learn-Loop standard.
 *
 * A glittery loot shop. The child gets a pouch of golden coins for the WHOLE
 * shop, always visible. Shiny deals appear one at a time; each has a brass
 * TRUTH LEVER the child pulls down and HOLDS while a paper receipt physically
 * unspools showing the REAL total. Drip traps ("1 coin a DAY!") print +1 +1 +1
 * in red adding up huge; honest deals print calm green lines. A deal may
 * carry a flashing pressure banner and a fake countdown clock: the clock is
 * display only, freezes the moment the lever is first pulled, and is stamped
 * FAKE once the receipt is out. Only after the receipt is fully printed do two
 * IDENTICAL buttons appear, BUY and WALK AWAY (same style, no colour hint),
 * and the child decides. A right BUY spends the advertised coins; a wrong BUY
 * drains the TRUE cost red, the teach panel explains, the coins refund, and
 * the SAME deal stays on screen for the retry. There is no hard fail.
 *
 * Content is data-driven (every deal, its receipt, stamp, right move, spoken
 * read-aloud, verdict reason and teach panel are props); the defaults below
 * keep the legacy signature mount unchanged. Deals play in authored order.
 *
 * Learn-Loop wiring: the Raccoon's boast folds into the shared intro
 * (`threat`), Sarah speaks the how-to once as the shop opens (`coachLines`)
 * and reads each deal aloud as it appears (audio-only, `recordedOnly`, the
 * lever and buttons held while she speaks), a right move gets a spoken
 * verdict with its reason ("That's right!" + `why` via the shared
 * VerdictVoice), a wrong move speaks through WrongAnswerPanel, and the
 * complete beat speaks the payoff (`completeNarration`). Hold is the one
 * non-tap verb here; BUY and WALK AWAY are plain taps; nothing drags.
 *
 * Self-contained visuals: react + framer-motion + ExerciseFrame + PixIcon +
 * inline SVG/CSS only.
 */

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import type { Variants } from "framer-motion";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import ExerciseIntroBeat, { ExerciseCompleteBeat } from "@/app/components/lesson/ExerciseBeats";
import WrongAnswerPanel from "@/app/components/lesson/WrongAnswerPanel";
import PixIcon from "@/app/components/lesson/PixIcon";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import { useVerdictVoice } from "@/app/components/lesson/VerdictVoice";
import { useGameAudio } from "@/app/lib/gameEngine/useGameAudio";
import { useExerciseFeedback } from "@/app/lib/gameEngine/useExerciseFeedback";
import { useMotionIntensity } from "@/app/lib/gameEngine/useMotionIntensity";
import { isAudioMuted, subscribeAudioMute } from "@/app/lib/audioMute";
import { SPOKEN_GATE_MAX_MS } from "@/app/lib/gameEngine/spokenGate";

// Audio-only narration: Sarah's voice with no visible narration box (the text
// she reads is already on screen), same recipe as the Clue Stamper.
const AUDIO_ONLY_STYLE = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  pointerEvents: "none",
} as const;
// SPOKEN_GATE_MAX_MS is shared: see app/lib/gameEngine/spokenGate.ts.

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export interface LeverReceiptLine { label: string; amount: string; bad: boolean; note?: boolean }
export interface LeverDeal {
  id: string; name: string; art: "hat" | "box" | "pass" | "cape";
  priceTag: string;
  pressure?: string;
  countdown?: boolean;
  advertised: number;
  trueCost: number;
  receipt: LeverReceiptLine[];
  totalLabel: string;
  stamp: "FAIR!" | "TRICK!";
  rightMove: "buy" | "walk";
  readAloud: string;
  why: string;
  teach: { title: string; body: string; tip: string };
}
export interface TruePriceLeverProps {
  deals?: LeverDeal[];
  startCoins?: number;
  introTitle?: string; introSubtitle?: string; introIcon?: string;
  shopLabel?: string; leverHint?: string; buyLabel?: string; walkLabel?: string; fakeStamp?: string;
  completeTitle?: string; completeLine?: string;
  hints?: { tier1: string; tier2: string };
  narration?: { speaker?: "adam" | "layla"; lines: string[] };
  coachLines?: { speaker?: "adam" | "layla"; lines: string[] };
  threat?: { raccoonLine: string };
  completeNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  accent?: string;
  onComplete: (score?: number) => void;
  onCorrect?: () => void; onWrong?: () => void;
  onHintReached?: (tier: 1 | 2 | 3) => void;
  onAnswered?: (o: { questionKey: string; selectedIndex: number; correctIndex: number; wasCorrect: boolean }) => void;
}

/* ------------------------------------------------------------------ */
/* Default content (the legacy signature mount)                       */
/* ------------------------------------------------------------------ */

const START_COINS = 5;

const DEALS: LeverDeal[] = [
  {
    id: "hat",
    name: "Cool Hat",
    art: "hat",
    priceTag: "2 coins",
    advertised: 2,
    trueCost: 2,
    receipt: [
      { label: "Cool Hat", amount: "2 coins", bad: false },
      { label: "Hidden tricks", amount: "none!", bad: false },
    ],
    totalLabel: "TRUE PRICE: 2 coins",
    stamp: "FAIR!",
    rightMove: "buy",
    readAloud: "A Cool Hat for two coins. Pull the lever and check the real price.",
    why: "The receipt matched the tag. Two coins and no hidden tricks, so this deal is fair.",
    teach: {
      title: "That hat was a fair deal!",
      body: "The receipt showed two coins and no hidden tricks. When the true price matches the tag, buying is fine.",
      tip: "Walk away from tricks, not from fair deals. Trust the receipt.",
    },
  },
  {
    id: "box",
    name: "Mystery Box",
    art: "box",
    priceTag: "1 coin!!",
    pressure: "Rare dragon inside?!",
    advertised: 1,
    trueCost: 5,
    receipt: [
      { label: "Mystery Box", amount: "1 coin", bad: true },
      { label: "No dragon! Try again", amount: "+1", bad: true },
      { label: "Still no dragon", amount: "+1", bad: true },
      { label: "Just one more", amount: "+1", bad: true },
      { label: "And one more", amount: "+1", bad: true },
    ],
    totalLabel: "TRUE PRICE: 5 coins (no dragon!)",
    stamp: "TRICK!",
    rightMove: "walk",
    readAloud: "A Mystery Box for one coin. Pull the lever and see what it really costs.",
    why: "The receipt kept printing plus one, plus one. One coin became five, so walking away was smart.",
    teach: {
      title: "The box gobbled your pouch!",
      body: "Mystery boxes keep whispering ONE more try. That is how a 1-coin box empties a whole pouch.",
      tip: "Lucky this is just practice! Take the refund, and next time trust the receipt.",
    },
  },
  {
    id: "pass",
    name: "Mega Pass",
    art: "pass",
    priceTag: "only 1 coin a DAY!",
    pressure: "Offer ends soon!",
    countdown: true,
    advertised: 1,
    trueCost: 7,
    receipt: [
      { label: "Day 1", amount: "1 coin", bad: true },
      { label: "Day 2", amount: "+1", bad: true },
      { label: "Day 3", amount: "+1", bad: true },
      { label: "Day 4", amount: "+1", bad: true },
      { label: "Day 5", amount: "+1", bad: true },
      { label: "It never stops", amount: "+1 +1 +1", bad: true },
    ],
    totalLabel: "TRUE PRICE: 7 coins in week ONE",
    stamp: "TRICK!",
    rightMove: "walk",
    readAloud: "A Mega Pass for only one coin a day. Pull the lever and add it up.",
    why: "One coin a day never stops. Seven coins in one week is more than your whole pouch.",
    teach: {
      title: "Tiny prices grow HUGE!",
      body: "One coin a day sounds tiny, but the drip never stops. In one week it costs more than your whole pouch.",
      tip: "Lucky this is just practice! When a price repeats every day, pull the lever and add it up.",
    },
  },
  {
    id: "cape",
    name: "Star Cape",
    art: "cape",
    priceTag: "3 coins",
    advertised: 3,
    trueCost: 3,
    receipt: [
      { label: "Star Cape", amount: "3 coins", bad: false },
      { label: "Hidden tricks", amount: "none!", bad: false },
      { label: "Big price, no drip", amount: "fair", bad: false, note: true },
    ],
    totalLabel: "TRUE PRICE: 3 coins",
    stamp: "FAIR!",
    rightMove: "buy",
    readAloud: "A Star Cape for three coins. Pull the lever and check the real price.",
    why: "Three coins on the tag and three coins on the receipt. No drip and no tricks, so it is a fair deal.",
    teach: {
      title: "The cape was fair!",
      body: "Big is not the same as tricky. The receipt showed three coins and nothing hidden.",
      tip: "A fair price can be big. Look for hidden lines, not just the number.",
    },
  },
];

const DEFAULT_INTRO_SUBTITLE =
  "A deal flashes. Pull and hold the lever, read the real total, then BUY or WALK AWAY.";
const DEFAULT_LEVER_HINT = "Pull the TRUTH LEVER and HOLD it to print the real price!";
const DEFAULT_COMPLETE_LINE = "The receipt never lies. The countdown always does.";

/* Palette */
const GOLD = "#ffd75e";
const GOLD_DEEP = "#f0a72b";
const GOOD_GREEN = "#34d399";
const BAD_RED = "#ff5d5d";
const BRASS_HI = "#eec87c";
const BRASS_LO = "#b98a3e";
const PAPER = "#fffdf2";
const INK_GOOD = "#15803d";
const INK_BAD = "#d92d2d";
const INK_NOTE = "#b45309";
const INK_FAINT = "#8a7f63";

type SpendKind = "fair" | "trap" | "refund";

/* The fake clock starts here (display only, never gates anything). */
const FAKE_CLOCK_START_S = 180;

// "read" is only ever entered for a deal that has something to read, so the
// spoken gate can never wait on a clip that does not exist (mute-aware).
const readOrIdle = (text?: string): "read" | "idle" => (!isAudioMuted() && text ? "read" : "idle");

/* Sawtooth bottom edge for the receipt paper */
const SAW_CLIP = (() => {
  const pts = ["0% 0%", "100% 0%"];
  for (let i = 10; i >= 0; i--) {
    pts.push(`${i * 10}% ${i % 2 === 0 ? "100%" : "calc(100% - 7px)"}`);
  }
  return `polygon(${pts.join(", ")})`;
})();

const coinVariants: Variants = {
  enter: { scale: 0, y: -14, opacity: 0 },
  in: { scale: 1, y: 0, opacity: 1 },
  exit: (kind: SpendKind) =>
    kind === "trap"
      ? {
          y: 42,
          rotate: 50,
          scale: 0.6,
          opacity: 0,
          filter: "drop-shadow(0 0 10px rgba(255,70,70,0.95))",
          transition: { duration: 0.45 },
        }
      : {
          y: -28,
          scale: 0.7,
          opacity: 0,
          filter: "drop-shadow(0 0 10px rgba(80,230,150,0.9))",
          transition: { duration: 0.5 },
        },
};

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export default function TruePriceLever({
  deals = DEALS,
  startCoins = START_COINS,
  introTitle = "The True-Price Lever",
  introSubtitle = DEFAULT_INTRO_SUBTITLE,
  introIcon = "🧾",
  shopLabel = "THE LOOT SHOP",
  leverHint = DEFAULT_LEVER_HINT,
  buyLabel = "BUY",
  walkLabel = "WALK AWAY",
  fakeStamp = "FAKE",
  completeTitle = "Every true price printed!",
  completeLine = DEFAULT_COMPLETE_LINE,
  hints,
  narration,
  coachLines,
  threat,
  completeNarration,
  accent,
  onComplete,
  onCorrect,
  onWrong,
  onHintReached,
  onAnswered,
}: TruePriceLeverProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;
  // Both content voices are Sarah; in-game read-alouds and verdict reasons are
  // recorded under "adam", so every manifest lookup here uses that key.
  const voice = "adam" as const;

  const [showIntro, setShowIntro] = useState(true);
  const [idx, setIdx] = useState(0);
  const [coins, setCoins] = useState(startCoins);
  const [owned, setOwned] = useState<string[]>([]);
  // The receipt is fully printed for the current deal (choices appear).
  const [revealed, setRevealed] = useState(false);
  // The lever has been pulled at least once on this deal: the guide glow
  // drops and the fake clock freezes.
  const [pulled, setPulled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [dealWrongs, setDealWrongs] = useState(0);
  const [totalWrongs, setTotalWrongs] = useState(0);
  const [spendKind, setSpendKind] = useState<SpendKind>("fair");
  const [drainFlash, setDrainFlash] = useState(false);
  // Read-aloud chain: the how-to once as the shop opens, then each deal as it
  // appears. The lever and buttons are held while she speaks. "idle" = nothing
  // playing.
  const [narr, setNarr] = useState<"howto" | "read" | "idle">("idle");

  const completedRef = useRef(false);
  const timersRef = useRef<number[]>([]);
  // Coins drained by a wrong BUY, refunded when the teach panel closes.
  const refundRef = useRef<null | { drained: number; refundTo: number }>(null);

  const later = (fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  };
  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  const finished = idx >= deals.length;
  const deal: LeverDeal | undefined = deals[Math.min(idx, deals.length - 1)];

  // Spoken verdicts: Sarah says "That's right!" + why on a right move and the
  // next deal waits for her. Wrong moves speak through WrongAnswerPanel.
  const verdict = useVerdictVoice(voice);
  const speaking = narr !== "idle" || verdict.speaking || !!feedback || busy;
  // Round 1 teaches itself: the lever glows until it is first pulled.
  const guided = idx === 0 && !pulled && !revealed;

  // Safety releases for the spoken gate (never leave the shop held).
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

  /* ---------------- beats ---------------- */

  const startBoard = () => {
    setShowIntro(false);
    setNarr(isAudioMuted() ? "idle" : coachLines ? "howto" : readOrIdle(deals[0]?.readAloud));
  };

  const advance = () => {
    const next = idx + 1;
    setIdx(next);
    setRevealed(false);
    setPulled(false);
    setDealWrongs(0);
    setBusy(false);
    setNarr(next < deals.length ? readOrIdle(deals[next]?.readAloud) : "idle");
  };

  /* ---------------- the decision ---------------- */

  const choose = (buy: boolean) => {
    if (!deal || !revealed || speaking) return;
    const correctIndex = deal.rightMove === "buy" ? 0 : 1;
    const selectedIndex = buy ? 0 : 1;
    const right = selectedIndex === correctIndex;
    onAnswered?.({ questionKey: `lever-${deal.id}`, selectedIndex, correctIndex, wasCorrect: right });

    if (right) {
      setBusy(true);
      // fx.correct plays its own chime (no audio.correct() here).
      fx.correct({ xp: 25, text: deal.stamp === "TRICK!" ? "TRAP DODGED!" : "FAIR DEAL!" });
      onCorrect?.();
      if (buy) {
        // A fair buy: the advertised coins float out green.
        setSpendKind("fair");
        setCoins((c) => Math.max(0, c - deal.advertised));
        setOwned((o) => [...o, deal.name]);
      }
      // Sarah: "That's right!" + the deal's why, one take; the next deal waits.
      verdict.say("right", deal.why, () => later(advance, reduce ? 200 : 900));
      return;
    }

    audio.wrong();
    onWrong?.();
    setTotalWrongs((n) => n + 1);
    const prior = dealWrongs;
    setDealWrongs(prior + 1);
    const panel = {
      title: deal.teach.title,
      explanation: deal.teach.body,
      tip: hints ? (prior >= 1 ? hints.tier2 : hints.tier1) : deal.teach.tip,
    };

    if (!buy) {
      // Walked away from a fair deal: teach, no coin change, same deal stays.
      refundRef.current = null;
      setFeedback(panel);
      return;
    }

    // Bought a trap: the TRUE cost drains red, then the teach panel opens.
    setBusy(true);
    setSpendKind("trap");
    setDrainFlash(true);
    const have = coins;
    const drained = Math.min(have, deal.trueCost);
    refundRef.current = { drained, refundTo: have };
    const openPanel = () => {
      setDrainFlash(false);
      setFeedback(panel);
    };
    if (reduce || drained === 0) {
      setCoins(have - drained);
      later(openPanel, drained === 0 ? 150 : 500);
    } else {
      for (let i = 0; i < drained; i++) {
        later(() => setCoins((c) => Math.max(0, c - 1)), 250 + i * 270);
      }
      later(openPanel, 250 + drained * 270 + 500);
    }
  };

  // The teach panel closes: refund any drained coins and keep the SAME deal
  // (receipt still printed) so the retry is one tap.
  const closePanel = () => {
    const pending = refundRef.current;
    refundRef.current = null;
    setFeedback(null);
    if (!pending || pending.drained === 0) {
      setBusy(false);
      return;
    }
    audio.tap();
    setSpendKind("refund");
    if (reduce) {
      setCoins(pending.refundTo);
      later(() => setBusy(false), 500);
    } else {
      for (let i = 0; i < pending.drained; i++) {
        later(() => setCoins((c) => Math.min(pending.refundTo, c + 1)), 200 + i * 150);
      }
      later(() => setBusy(false), 200 + pending.drained * 150 + 400);
    }
  };

  const stars = totalWrongs === 0 ? 3 : totalWrongs <= 1 ? 2 : 1;
  const score = stars === 3 ? 100 : stars === 2 ? 70 : 40;
  const finish = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete(score);
  };

  const honest = deal?.stamp === "FAIR!";

  return (
    <ExerciseFrame maxWidth={880} padding={24} decor>
      {fx.layer()}
      {verdict.element}

      {/* Sarah's read-alouds (audio only): the how-to once, then each deal as it appears. */}
      {!showIntro && !finished && deal && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="tpl-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent={accent ?? GOLD} recordedOnly onDone={() => setNarr(readOrIdle(deal.readAloud))} />
          )}
          {narr === "read" && deal.readAloud && (
            <InfoNarration key={`tpl-read-${deal.id}`} speaker={voice} lines={[deal.readAloud]} accent={accent ?? GOLD} recordedOnly onDone={() => setNarr("idle")} />
          )}
        </div>
      )}

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 14,
          minHeight: 500,
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        {/* ------------ header: shop sign + pouch ------------ */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 16px",
              borderRadius: 14,
              background: "rgba(255, 215, 94, 0.12)",
              border: "1px solid rgba(255, 215, 94, 0.4)",
              fontWeight: 900,
              fontSize: 18,
              letterSpacing: 1.5,
              color: GOLD,
            }}
          >
            <PixIcon emoji="✨" size={22} />
            {shopLabel}
          </div>
          <Pouch coins={coins} total={startCoins} spendKind={spendKind} flash={drainFlash} />
        </div>

        {owned.length > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
              fontSize: 14,
              fontWeight: 800,
              color: "#bfe9d4",
            }}
          >
            <span style={{ opacity: 0.8, letterSpacing: 1 }}>MY STUFF:</span>
            {owned.map((name, i) => (
              <span
                key={`${name}-${i}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: "rgba(52, 211, 153, 0.14)",
                  border: "1px solid rgba(52, 211, 153, 0.5)",
                }}
              >
                <PixIcon emoji="✅" size={16} />
                {name}
              </span>
            ))}
          </div>
        )}

        {/* ------------ beat chips + counter ------------ */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {deals.map((d, i) => {
            const done = i < idx;
            const current = i === idx && !finished;
            return (
              <div
                key={d.id}
                style={{
                  width: current ? 30 : 14,
                  height: 14,
                  borderRadius: 999,
                  transition: "all 0.35s ease",
                  background: done
                    ? GOOD_GREEN
                    : current
                      ? GOLD
                      : "rgba(231, 236, 255, 0.18)",
                  boxShadow: current ? "0 0 12px rgba(255, 215, 94, 0.6)" : undefined,
                }}
              />
            );
          })}
          <span style={{ fontSize: 13, fontWeight: 800, opacity: 0.7, marginLeft: 4 }}>
            Deal {Math.min(idx + 1, deals.length)} of {deals.length}
          </span>
        </div>

        {/* ------------ main board ------------ */}
        {deal && (
          <div
            style={{
              display: "flex",
              gap: 20,
              justifyContent: "center",
              alignItems: "stretch",
              flexWrap: "wrap",
            }}
          >
            <DealCard
              key={`card-${deal.id}`}
              deal={deal}
              reduce={reduce}
              ticking={!showIntro && !finished}
              frozen={pulled}
              stamped={revealed}
              fakeStamp={fakeStamp}
            />
            <LeverStation
              key={`lever-${deal.id}`}
              deal={deal}
              honest={honest}
              done={revealed}
              reduce={reduce}
              disabled={speaking}
              glow={guided && !speaking}
              onFirstPull={() => setPulled(true)}
              onRevealed={() => {
                audio.drop(); // the receipt's stamp-thunk payoff
                setRevealed(true);
              }}
            />
          </div>
        )}

        {/* ------------ action area ------------ */}
        <div style={{ minHeight: 96, display: "flex", flexDirection: "column", gap: 10 }}>
          <AnimatePresence mode="wait">
            {!revealed && (
              <motion.div
                key="hint"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  alignSelf: "center",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 18px",
                  borderRadius: 16,
                  background: "rgba(125, 240, 255, 0.1)",
                  border: "1px solid rgba(125, 240, 255, 0.35)",
                  fontSize: 17,
                  fontWeight: 800,
                }}
              >
                <PixIcon emoji="👆" size={26} />
                {leverHint}
              </motion.div>
            )}

            {revealed && (
              <motion.div
                key="choices"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}
              >
                {/* Two IDENTICAL neutral buttons: nothing here hints at the answer. */}
                <ChoiceButton onClick={() => choose(true)} disabled={speaking}>
                  {buyLabel}
                </ChoiceButton>
                <ChoiceButton onClick={() => choose(false)} disabled={speaking}>
                  {walkLabel}
                </ChoiceButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <style>{`@keyframes tplGuide { 0%,100% { box-shadow: 0 0 0 3px rgba(255,215,94,0.35), 0 0 16px rgba(255,215,94,0.5) } 50% { box-shadow: 0 0 0 7px rgba(255,215,94,0.14), 0 0 30px rgba(255,215,94,0.9) } }`}</style>
      </div>

      {/* ------------ overlays ------------ */}
      {showIntro && (
        <ExerciseIntroBeat
          title={introTitle}
          subtitle={introSubtitle}
          icon={introIcon}
          narration={narration}
          threat={threat}
          character={narration?.speaker}
          onDismiss={startBoard}
        />
      )}

      {feedback && (
        <WrongAnswerPanel
          title={feedback.title}
          explanation={feedback.explanation}
          tip={feedback.tip}
          onContinue={closePanel}
        />
      )}

      {finished && (
        <ExerciseCompleteBeat
          title={completeTitle}
          stars={stars}
          statLines={[
            `${deals.length} true price${deals.length === 1 ? "" : "s"} printed`,
            `${coins} coin${coins === 1 ? "" : "s"} still in your pouch`,
            completeLine,
          ]}
          narration={completeNarration}
          onContinue={finish}
        />
      )}
    </ExerciseFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Pouch                                                              */
/* ------------------------------------------------------------------ */

function Pouch({
  coins,
  total,
  spendKind,
  flash,
}: {
  coins: number;
  total: number;
  spendKind: SpendKind;
  flash: boolean;
}) {
  return (
    <div
      aria-label={`Pouch: ${coins} of ${total} coins`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 14px",
        borderRadius: 16,
        background: flash ? "rgba(255, 93, 93, 0.16)" : "rgba(255, 215, 94, 0.08)",
        border: `2px solid ${flash ? BAD_RED : "rgba(255, 215, 94, 0.45)"}`,
        boxShadow: flash ? "0 0 18px rgba(255, 93, 93, 0.5)" : undefined,
        transition: "all 0.3s ease",
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: 1.5, color: GOLD }}>
        POUCH
      </span>
      <div style={{ display: "flex", gap: 5 }}>
        {Array.from({ length: Math.max(total, coins) }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              border: "2px dashed rgba(255, 215, 94, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AnimatePresence custom={spendKind} initial={false}>
              {i < coins && (
                <motion.div
                  key="coin"
                  custom={spendKind}
                  variants={coinVariants}
                  initial="enter"
                  animate="in"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 420, damping: 26 }}
                  style={{ display: "flex" }}
                >
                  <CoinSvg size={24} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
      <span style={{ fontSize: 18, fontWeight: 900, color: GOLD, minWidth: 30 }}>x {coins}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Deal card (art + price tag + optional pressure banner + fake clock) */
/* ------------------------------------------------------------------ */

function DealCard({
  deal,
  reduce,
  ticking,
  frozen,
  stamped,
  fakeStamp,
}: {
  deal: LeverDeal;
  reduce: boolean;
  /** The fake clock only runs while the shop is open (not under the intro). */
  ticking: boolean;
  /** Frozen the moment the lever is first pulled. */
  frozen: boolean;
  /** The receipt is out: the clock gets its FAKE label. */
  stamped: boolean;
  fakeStamp: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: reduce ? 0 : -24 }}
      animate={{ opacity: 1, x: 0 }}
      style={{
        position: "relative",
        width: 250,
        borderRadius: 20,
        padding: "18px 16px 16px",
        background: "linear-gradient(160deg, #2b355f, #3a2f6b)",
        border: "1px solid rgba(255, 215, 110, 0.5)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        overflow: "hidden",
      }}
    >
      {!reduce && (
        <motion.div
          aria-hidden
          animate={{ x: ["-120%", "220%"] }}
          transition={{ repeat: Infinity, duration: 2.8, repeatDelay: 1.4, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            width: 60,
            background:
              "linear-gradient(100deg, transparent, rgba(255,255,255,0.14), transparent)",
            pointerEvents: "none",
          }}
        />
      )}
      <div style={{ position: "absolute", top: 8, right: 10 }}>
        <PixIcon emoji="✨" size={20} />
      </div>

      {/* Pressure banner: flashes, means nothing. */}
      {deal.pressure && (
        <motion.div
          animate={reduce ? { opacity: 1 } : { opacity: [1, 0.45, 1], scale: [1, 1.03, 1] }}
          transition={reduce ? undefined : { repeat: Infinity, duration: 0.9, ease: "easeInOut" }}
          style={{
            alignSelf: "stretch",
            textAlign: "center",
            padding: "5px 10px",
            borderRadius: 10,
            background: `linear-gradient(180deg, ${BAD_RED}, #c92a2a)`,
            color: "#fff",
            fontWeight: 900,
            fontSize: 13,
            letterSpacing: 1.2,
            textTransform: "uppercase",
            boxShadow: "0 4px 14px rgba(255, 93, 93, 0.45)",
          }}
        >
          {deal.pressure}
        </motion.div>
      )}

      <ItemArt kind={deal.art} />
      <div style={{ fontSize: 20, fontWeight: 900, textAlign: "center" }}>{deal.name}</div>
      <motion.div
        animate={reduce ? {} : { rotate: [-3, 3, -3] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
        style={{
          padding: "6px 16px",
          borderRadius: 999,
          background: `linear-gradient(180deg, ${GOLD}, ${GOLD_DEEP})`,
          color: "#5b3a05",
          fontWeight: 900,
          fontSize: 17,
          boxShadow: "0 4px 14px rgba(255, 200, 60, 0.35)",
        }}
      >
        {deal.priceTag}
      </motion.div>

      {deal.countdown && (
        <FakeClock ticking={ticking} frozen={frozen} stamped={stamped} label={fakeStamp} reduce={reduce} />
      )}
    </motion.div>
  );
}

/**
 * The shop's countdown: display only. It ticks down from 3:00, freezes the
 * moment the lever is first pulled, never gates anything and never expires
 * into a lose state (it simply parks at 0:00).
 */
function FakeClock({
  ticking,
  frozen,
  stamped,
  label,
  reduce,
}: {
  ticking: boolean;
  frozen: boolean;
  stamped: boolean;
  label: string;
  reduce: boolean;
}) {
  const [secs, setSecs] = useState(FAKE_CLOCK_START_S);
  useEffect(() => {
    if (!ticking || frozen) return;
    const id = window.setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
  }, [ticking, frozen]);
  const mm = Math.floor(secs / 60);
  const ss = String(secs % 60).padStart(2, "0");
  const live = !frozen && !reduce;

  return (
    <div
      aria-hidden
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "5px 12px",
        borderRadius: 999,
        background: frozen ? "rgba(231, 236, 255, 0.08)" : "rgba(255, 93, 93, 0.16)",
        border: `1px solid ${frozen ? "rgba(231, 236, 255, 0.3)" : `${BAD_RED}99`}`,
        color: frozen ? "#cfd6f6" : "#ffd0d0",
        fontWeight: 900,
        fontSize: 15,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
        transition: "all 0.3s ease",
      }}
    >
      <motion.span
        animate={live ? { opacity: [1, 0.35, 1] } : { opacity: 1 }}
        transition={live ? { repeat: Infinity, duration: 1, ease: "easeInOut" } : undefined}
        style={{ display: "inline-flex" }}
      >
        <PixIcon emoji="⏱" size={18} />
      </motion.span>
      <span>
        {mm}:{ss}
      </span>
      {!frozen && (
        <motion.span
          animate={live ? { opacity: [1, 0.4, 1] } : { opacity: 1 }}
          transition={live ? { repeat: Infinity, duration: 0.7, ease: "easeInOut" } : undefined}
          style={{ fontSize: 10, letterSpacing: 1.4, fontFamily: "inherit" }}
        >
          HURRY!
        </motion.span>
      )}
      <AnimatePresence>
        {stamped && (
          <motion.span
            key="fake"
            initial={{ scale: reduce ? 1 : 2, opacity: 0, rotate: -12 }}
            animate={{ scale: 1, opacity: 1, rotate: -12 }}
            transition={{ type: "spring", stiffness: 340, damping: 18 }}
            style={{
              position: "absolute",
              right: -10,
              top: -13,
              padding: "1px 7px",
              border: `3px double ${INK_BAD}`,
              borderRadius: 6,
              background: "rgba(255, 253, 242, 0.92)",
              color: INK_BAD,
              fontWeight: 900,
              fontSize: 12,
              letterSpacing: 1,
              fontFamily: "inherit",
            }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

function ItemArt({ kind }: { kind: LeverDeal["art"] }) {
  return (
    <svg width={130} height={100} viewBox="0 0 130 100" aria-hidden>
      <defs>
        <linearGradient id="tpl-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe38f" />
          <stop offset="1" stopColor="#f0a72b" />
        </linearGradient>
      </defs>
      {kind === "hat" && (
        <g>
          <path d="M 25 62 A 40 40 0 0 1 105 62 Z" fill="#4f8ef7" />
          <path d="M 25 62 A 40 40 0 0 1 65 24 L 65 62 Z" fill="#3b76d6" />
          <ellipse cx="65" cy="63" rx="46" ry="9" fill="#2f5cad" />
          <ellipse cx="88" cy="66" rx="26" ry="6" fill="#6ba3f9" />
          <circle cx="65" cy="24" r="6" fill="#ffd75e" />
        </g>
      )}
      {kind === "box" && (
        <g>
          <rect x="35" y="38" width="60" height="48" rx="8" fill="#8b5cf6" />
          <rect x="29" y="28" width="72" height="18" rx="6" fill="#6d3fd6" />
          <rect x="60" y="28" width="10" height="58" fill="#ffd75e" />
          <text
            x="65"
            y="74"
            textAnchor="middle"
            fontSize="26"
            fontWeight="900"
            fill="#fff"
            fontFamily="inherit"
          >
            ?
          </text>
          <path d="M 20 20 l 3 6 6 3 -6 3 -3 6 -3 -6 -6 -3 6 -3 Z" fill="#ffd75e" />
          <path d="M 108 46 l 2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z" fill="#ffd75e" />
        </g>
      )}
      {kind === "pass" && (
        <g transform="rotate(-8 65 55)">
          <rect x="18" y="34" width="94" height="44" rx="8" fill="url(#tpl-gold)" />
          <rect
            x="24"
            y="40"
            width="82"
            height="32"
            rx="5"
            fill="none"
            stroke="#a86e12"
            strokeWidth="2"
            strokeDasharray="5 4"
          />
          <path d="M 40 56 l 4 8 -9 -5 h 10 l -9 5 Z" fill="#a86e12" transform="rotate(-18 40 56)" />
          <text
            x="74"
            y="62"
            textAnchor="middle"
            fontSize="16"
            fontWeight="900"
            fill="#7a4c08"
            fontFamily="inherit"
          >
            MEGA
          </text>
        </g>
      )}
      {kind === "cape" && (
        <g>
          <path
            d="M 65 16 C 40 26 34 52 30 84 C 44 76 52 82 65 74 C 78 82 86 76 100 84 C 96 52 90 26 65 16 Z"
            fill="#ef4466"
          />
          <path
            d="M 65 16 C 48 24 42 46 40 76 C 50 70 58 76 65 70 Z"
            fill="#d12e50"
          />
          <path d="M 65 38 l 5 10 11 1 -8 8 2 11 -10 -5 -10 5 2 -11 -8 -8 11 -1 Z" fill="#ffd75e" />
          <ellipse cx="65" cy="16" rx="14" ry="5" fill="#ffb0c0" />
        </g>
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Lever + receipt station                                            */
/* ------------------------------------------------------------------ */

const UNSPOOL_MS = 1900;
const UNSPOOL_MS_REDUCED = 1000;

function LeverStation({
  deal,
  honest,
  done,
  reduce,
  disabled,
  glow,
  onFirstPull,
  onRevealed,
}: {
  deal: LeverDeal;
  honest: boolean;
  done: boolean;
  reduce: boolean;
  /** Held while Sarah speaks or a beat is settling: visible, not pullable. */
  disabled: boolean;
  /** Round-1 guide: the lever breathes gold until it is first pulled. */
  glow: boolean;
  onFirstPull: () => void;
  onRevealed: () => void;
}) {
  const [holding, setHolding] = useState(false);
  const progress = useMotionValue(0);
  const angle = useTransform(progress, [0, 1], [-52, 54]);
  const fullH = 18 + deal.receipt.length * 30 + 54;
  const paperH = useTransform(progress, (p) => Math.max(10, p * fullH));
  const barScale = useTransform(progress, (p) => Math.max(0.001, p));

  const holdingRef = useRef(false);
  const doneRef = useRef(false);
  const pulledRef = useRef(false);
  // Read by the unspool tick so a hold never prints while the lever is held
  // back (Sarah speaking, a beat settling).
  const disabledRef = useRef(disabled);
  const revealCbRef = useRef(onRevealed);
  const firstPullCbRef = useRef(onFirstPull);
  useEffect(() => {
    disabledRef.current = disabled;
    revealCbRef.current = onRevealed;
    firstPullCbRef.current = onFirstPull;
  }, [disabled, onRevealed, onFirstPull]);

  const endHold = () => {
    holdingRef.current = false;
    setHolding(false);
  };

  /* Backstop: stop holding when the pointer lifts anywhere (pointer capture
     already routes the up to the lever, this covers a lost capture). */
  useEffect(() => {
    if (!holding) return;
    const stop = () => {
      holdingRef.current = false;
      setHolding(false);
    };
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    window.addEventListener("blur", stop);
    return () => {
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
      window.removeEventListener("blur", stop);
    };
  }, [holding]);

  /* unspool loop while holding */
  useEffect(() => {
    if (!holding || doneRef.current) return;
    const speed = reduce ? UNSPOOL_MS_REDUCED : UNSPOOL_MS;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      if (disabledRef.current) {
        // The lever was held back mid-pull: let go, keep the progress.
        holdingRef.current = false;
        setHolding(false);
        return;
      }
      if (holdingRef.current && !doneRef.current) {
        const next = Math.min(1, progress.get() + dt / speed);
        progress.set(next);
        if (next >= 1) {
          doneRef.current = true;
          holdingRef.current = false;
          setHolding(false);
          revealCbRef.current();
          return;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [holding, reduce, progress]);

  const beginHold = () => {
    if (doneRef.current || disabled) return;
    if (!pulledRef.current) {
      pulledRef.current = true;
      firstPullCbRef.current();
    }
    holdingRef.current = true;
    setHolding(true);
  };

  const startHold = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (doneRef.current || disabled) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* pointer capture is best-effort */
    }
    beginHold();
  };

  // Keyboard hold: Space or Enter down = pull, up = release.
  const keyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== " " && e.key !== "Enter") return;
    e.preventDefault();
    if (e.repeat) return;
    beginHold();
  };
  const keyUp = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== " " && e.key !== "Enter") return;
    e.preventDefault();
    endHold();
  };

  const label = done
    ? "Truth lever. The true price is printed."
    : "Truth lever. Press and hold to print the true price.";

  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        alignItems: "flex-start",
        padding: "14px 16px",
        borderRadius: 20,
        background: "rgba(15, 21, 48, 0.55)",
        border: "1px solid rgba(125, 240, 255, 0.2)",
      }}
    >
      {/* ---- the brass lever ---- */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          userSelect: "none",
        }}
      >
        <button
          type="button"
          aria-label={label}
          aria-pressed={holding}
          disabled={done || disabled}
          onPointerDown={startHold}
          onPointerUp={endHold}
          onPointerCancel={endHold}
          onLostPointerCapture={endHold}
          onKeyDown={keyDown}
          onKeyUp={keyUp}
          onContextMenu={(e) => e.preventDefault()}
          style={{
            position: "relative",
            width: 120,
            height: 148,
            padding: 0,
            border: "none",
            background: "transparent",
            borderRadius: 18,
            color: "inherit",
            fontFamily: "inherit",
            cursor: done ? "default" : disabled ? "wait" : "pointer",
            touchAction: "none",
            userSelect: "none",
            WebkitUserSelect: "none",
            WebkitTouchCallout: "none",
            opacity: disabled && !done ? 0.85 : 1,
            boxShadow: glow ? "0 0 0 3px rgba(255,215,94,0.35), 0 0 16px rgba(255,215,94,0.5)" : undefined,
            animation: glow && !reduce ? "tplGuide 1.4s ease-in-out infinite" : undefined,
            transition: "box-shadow 220ms ease-out",
          }}
        >
          {/* base plate */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 10,
              width: 100,
              height: 92,
              borderRadius: 16,
              background: `linear-gradient(180deg, ${BRASS_HI}, ${BRASS_LO})`,
              boxShadow: "inset 0 2px 4px rgba(255,255,255,0.5), 0 6px 16px rgba(0,0,0,0.4)",
            }}
          />
          {/* slot arc */}
          <svg
            width={120}
            height={148}
            viewBox="0 0 120 148"
            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
            aria-hidden
          >
            <path
              d="M 22 74 A 46 46 0 0 1 98 74"
              fill="none"
              stroke="#4a3413"
              strokeWidth="9"
              strokeLinecap="round"
            />
          </svg>
          {/* arm + knob (rotates about the base pivot) */}
          <motion.div
            style={{
              position: "absolute",
              left: 53,
              bottom: 36,
              width: 14,
              height: 86,
              borderRadius: 8,
              transformOrigin: "50% calc(100% - 8px)",
              rotate: angle,
              background: "linear-gradient(90deg, #8a6428, #c89a52, #8a6428)",
              boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -16,
                left: "50%",
                transform: "translateX(-50%)",
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "radial-gradient(circle at 35% 30%, #ffe9a8, #c98f3c 70%)",
                boxShadow: "0 4px 10px rgba(0,0,0,0.45)",
              }}
            />
          </motion.div>
          {/* pivot cap */}
          <div
            style={{
              position: "absolute",
              left: 50,
              bottom: 34,
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: "radial-gradient(circle at 35% 30%, #f7dfa4, #9a7028)",
            }}
          />
          {/* engraved label */}
          <div
            style={{
              position: "absolute",
              bottom: 8,
              left: 0,
              right: 0,
              textAlign: "center",
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: 1.4,
              color: "#5d4218",
            }}
          >
            TRUTH LEVER
          </div>
        </button>
        {/* progress bar */}
        <div
          style={{
            width: 100,
            height: 8,
            borderRadius: 999,
            background: "rgba(255,255,255,0.14)",
            overflow: "hidden",
          }}
        >
          <motion.div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 999,
              transformOrigin: "0% 50%",
              scaleX: barScale,
              background: done ? GOOD_GREEN : GOLD,
            }}
          />
        </div>
        {!done && (
          <motion.div
            aria-hidden
            animate={reduce || disabled ? {} : { scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 1.1 }}
            style={{
              fontSize: 13,
              fontWeight: 900,
              letterSpacing: 1,
              color: holding ? GOLD : disabled ? "rgba(231,236,255,0.45)" : "rgba(231,236,255,0.75)",
            }}
          >
            {holding ? "PRINTING..." : "HOLD ME!"}
          </motion.div>
        )}
      </div>

      {/* ---- the receipt printer ---- */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div
          style={{
            width: 246,
            height: 16,
            borderRadius: 8,
            background: "#263041",
            boxShadow: "inset 0 -3px 5px rgba(0,0,0,0.5)",
            zIndex: 2,
          }}
        />
        <motion.div
          animate={holding && !done && !reduce ? { rotate: [0, -0.6, 0.6, 0] } : { rotate: 0 }}
          transition={holding && !done ? { repeat: Infinity, duration: 0.25 } : undefined}
          style={{ position: "relative", width: 230 }}
        >
          <motion.div
            style={{
              width: "100%",
              height: paperH,
              overflow: "hidden",
              background: PAPER,
              clipPath: SAW_CLIP,
              boxShadow: "0 8px 20px rgba(0,0,0,0.35)",
            }}
          >
            <div
              style={{
                padding: "10px 12px 14px",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
              }}
            >
              {deal.receipt.map((line, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    height: 30,
                    fontSize: line.note ? 12 : 14,
                    fontWeight: 800,
                    color: line.note ? INK_NOTE : line.bad ? INK_BAD : INK_GOOD,
                  }}
                >
                  <span>{line.label}</span>
                  <span
                    style={{
                      flex: 1,
                      borderBottom: `2px dotted ${INK_FAINT}`,
                      margin: "0 6px 4px",
                      opacity: 0.6,
                    }}
                  />
                  <span>{line.amount}</span>
                </div>
              ))}
              <div
                style={{
                  marginTop: 6,
                  paddingTop: 8,
                  borderTop: "2px dashed #b8ad8d",
                  fontSize: 15,
                  fontWeight: 900,
                  color: honest ? INK_GOOD : INK_BAD,
                }}
              >
                {deal.totalLabel}
              </div>
            </div>
          </motion.div>
          {/* stamp */}
          <AnimatePresence>
            {done && (
              <motion.div
                key="stamp"
                initial={{ scale: reduce ? 1 : 2.4, opacity: 0, rotate: -10 }}
                animate={{ scale: 1, opacity: 1, rotate: -10 }}
                transition={{ type: "spring", stiffness: 340, damping: 18 }}
                style={{
                  position: "absolute",
                  right: 6,
                  bottom: 10,
                  padding: "4px 12px",
                  border: `4px double ${honest ? INK_GOOD : INK_BAD}`,
                  borderRadius: 8,
                  color: honest ? INK_GOOD : INK_BAD,
                  fontWeight: 900,
                  fontSize: 20,
                  letterSpacing: 1,
                  background: "rgba(255, 253, 242, 0.85)",
                }}
              >
                {deal.stamp}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Small shared bits                                                  */
/* ------------------------------------------------------------------ */

/** The decision button: BUY and WALK AWAY share this exact look. */
function ChoiceButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.94 }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        minHeight: 56,
        minWidth: 180,
        padding: "12px 26px",
        borderRadius: 18,
        fontSize: 18,
        fontWeight: 900,
        letterSpacing: 0.5,
        cursor: disabled ? "wait" : "pointer",
        opacity: disabled ? 0.55 : 1,
        boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
        fontFamily: "inherit",
        background: "linear-gradient(180deg, #3d4a8c, #2b3670)",
        color: "#f4efdc",
        border: `2px solid ${BRASS_HI}b3`,
      }}
    >
      {children}
    </motion.button>
  );
}

function CoinSvg({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" aria-hidden style={{ display: "block" }}>
      <defs>
        <radialGradient id="tpl-coin" cx="0.35" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#ffe9a0" />
          <stop offset="0.6" stopColor="#ffd75e" />
          <stop offset="1" stopColor="#e09422" />
        </radialGradient>
      </defs>
      <circle cx="18" cy="18" r="16" fill="url(#tpl-coin)" stroke="#b8791a" strokeWidth="2" />
      <circle cx="18" cy="18" r="11" fill="none" stroke="#c98f2e" strokeWidth="1.6" />
      <path
        d="M 18 10.5 l 2.2 4.5 5 0.7 -3.6 3.5 0.9 4.9 -4.5 -2.3 -4.5 2.3 0.9 -4.9 -3.6 -3.5 5 -0.7 Z"
        fill="#fff3c4"
        stroke="#c98f2e"
        strokeWidth="0.8"
      />
    </svg>
  );
}
