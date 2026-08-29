"use client";

/**
 * TruePriceLever - Week 7 (In-Game Spending) signature exercise.
 *
 * A glittery loot shop. The child gets a pouch of 5 golden coins for the
 * WHOLE shop, always visible. Four shiny deals appear one at a time; each
 * has a brass TRUTH LEVER the child pulls down and HOLDS while a paper
 * receipt physically unspools showing the REAL total. Drip traps ("1 coin
 * a DAY!") print +1 +1 +1 in red adding up huge; honest deals print one
 * calm green line. Only after the receipt is fully printed can the child
 * choose BUY or WALK AWAY. The Star Cape costs more than 2 coins, so its
 * choices stay locked until the ASK A GROWN-UP bell is rung. Buying a trap
 * drains the pouch red, then a teach beat refunds it ("Lucky this is just
 * practice!") and play continues; there is no hard fail. Win = a fair item
 * bought, the bell used, and coins still left in the pouch.
 *
 * Self-contained by design: deps are react + framer-motion + ExerciseFrame
 * + PixIcon + inline SVG/CSS only.
 */

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import type { Variants } from "framer-motion";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import PixIcon from "@/app/components/lesson/PixIcon";
import InfoNarration from "@/app/components/lesson/InfoNarration";

/* ------------------------------------------------------------------ */
/* Content                                                            */
/* ------------------------------------------------------------------ */

const START_COINS = 5;

interface ReceiptLine {
  label: string;
  amount: string;
  bad: boolean;
  note?: boolean;
}

interface Deal {
  id: string;
  name: string;
  art: "hat" | "box" | "pass" | "cape";
  priceTag: string;
  advertised: number;
  honest: boolean;
  trueCost: number;
  needsGrownUp: boolean;
  mustBuy?: boolean;
  receipt: ReceiptLine[];
  totalLabel: string;
  stamp: "FAIR!" | "TRICK!";
  teachTitle?: string;
  teachBody?: string;
  teachTip?: string;
}

const DEALS: Deal[] = [
  {
    id: "hat",
    name: "Cool Hat",
    art: "hat",
    priceTag: "2 coins",
    advertised: 2,
    honest: true,
    trueCost: 2,
    needsGrownUp: false,
    receipt: [
      { label: "Cool Hat", amount: "2 coins", bad: false },
      { label: "Hidden tricks", amount: "none!", bad: false },
    ],
    totalLabel: "TRUE PRICE: 2 coins",
    stamp: "FAIR!",
  },
  {
    id: "box",
    name: "Mystery Box",
    art: "box",
    priceTag: "1 coin!!",
    advertised: 1,
    honest: false,
    trueCost: 5,
    needsGrownUp: false,
    receipt: [
      { label: "Mystery Box", amount: "1 coin", bad: true },
      { label: "No dragon! Try again", amount: "+1", bad: true },
      { label: "Still no dragon", amount: "+1", bad: true },
      { label: "Just one more", amount: "+1", bad: true },
      { label: "And one more", amount: "+1", bad: true },
    ],
    totalLabel: "TRUE PRICE: 5 coins (no dragon!)",
    stamp: "TRICK!",
    teachTitle: "The box gobbled your pouch!",
    teachBody:
      "Mystery boxes keep whispering ONE more try. That is how a 1-coin box empties a whole pouch.",
    teachTip: "Lucky this is just practice! Take the refund, and next time trust the receipt.",
  },
  {
    id: "pass",
    name: "Mega Pass",
    art: "pass",
    priceTag: "only 1 coin a DAY!",
    advertised: 1,
    honest: false,
    trueCost: 7,
    needsGrownUp: false,
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
    teachTitle: "Tiny prices grow HUGE!",
    teachBody:
      "One coin a day sounds tiny, but the drip never stops. In one week it costs more than your whole pouch.",
    teachTip: "Lucky this is just practice! When a price repeats every day, pull the lever and add it up.",
  },
  {
    id: "cape",
    name: "Star Cape",
    art: "cape",
    priceTag: "3 coins",
    advertised: 3,
    honest: true,
    trueCost: 3,
    needsGrownUp: true,
    receipt: [
      { label: "Star Cape", amount: "3 coins", bad: false },
      { label: "Hidden tricks", amount: "none!", bad: false },
      { label: "Over 2 coins", amount: "ask a grown-up", bad: false, note: true },
    ],
    totalLabel: "TRUE PRICE: 3 coins",
    stamp: "FAIR!",
  },
];

const HAT_AGAIN: Deal = {
  ...DEALS[0],
  id: "hat-again",
  name: "Cool Hat (back on the shelf!)",
  mustBuy: true,
};

const GROWN_UP_YES =
  "I checked the lever with you. Three coins is a fair price, and you would still have coins left. Your choice, hero!";
const GROWN_UP_NO =
  "It is a fair price, but it would take your LAST coins. A smart shopper always keeps some in the pouch. Let's skip it today.";

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

type Phase = "intro" | "shop" | "celebrate";
type SpendKind = "fair" | "trap" | "refund";

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
  onComplete,
  narration,
  accent,
}: {
  onComplete: () => void;
  narration?: { speaker?: "adam" | "layla"; lines: string[] };
  accent?: string;
}) {
  const reduce = !!useReducedMotion();

  const [phase, setPhase] = useState<Phase>("intro");
  const [dealIdx, setDealIdx] = useState(0);
  const [bonusBeat, setBonusBeat] = useState(false);
  const [coins, setCoins] = useState(START_COINS);
  const [owned, setOwned] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [bellRung, setBellRung] = useState(false);
  const [grownUp, setGrownUp] = useState<null | { text: string; allowBuy: boolean }>(null);
  const [bellUsed, setBellUsed] = useState(false);
  const [teach, setTeach] = useState<null | {
    title: string;
    body: string;
    tip: string;
    drained: number;
    refundTo: number;
  }>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<null | { text: string; tone: "good" | "warm" }>(null);
  const [spendKind, setSpendKind] = useState<SpendKind>("fair");
  const [drainFlash, setDrainFlash] = useState(false);

  const completedRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  const later = (fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  };
  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  const deal = bonusBeat ? HAT_AGAIN : DEALS[Math.min(dealIdx, DEALS.length - 1)];

  /* Fresh lever + bell for every beat (LeverStation remounts via key) */
  const resetBeat = () => {
    setRevealed(false);
    setBellRung(false);
    setGrownUp(null);
  };

  const showToast = (text: string, tone: "good" | "warm") => {
    setToast({ text, tone });
    later(() => setToast(null), 2400);
  };

  const finish = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  };

  const advance = (ownedAfter: number) => {
    if (!bonusBeat && dealIdx < DEALS.length - 1) {
      resetBeat();
      setDealIdx((i) => i + 1);
      setBusy(false);
    } else if (ownedAfter > 0) {
      later(() => setPhase("celebrate"), 300);
    } else {
      resetBeat();
      setBonusBeat(true);
      setBusy(false);
      showToast("The shopkeeper waves you back. One fair treat is smart too!", "warm");
    }
  };

  const buyFair = () => {
    if (busy || teach) return;
    setBusy(true);
    setSpendKind("fair");
    setCoins((c) => c - deal.advertised);
    setOwned((o) => [...o, deal.id]);
    const ownedAfter = owned.length + 1;
    showToast("Fair deal! It is yours.", "good");
    later(() => advance(ownedAfter), 1300);
  };

  const buyTrap = () => {
    if (busy || teach) return;
    setBusy(true);
    setSpendKind("trap");
    setDrainFlash(true);
    const have = coins;
    const drained = Math.min(have, deal.trueCost);
    const openTeach = () => {
      setDrainFlash(false);
      setTeach({
        title: deal.teachTitle ?? "That was a trap!",
        body: deal.teachBody ?? "The true price was much bigger than the tag.",
        tip: deal.teachTip ?? "Lucky this is just practice!",
        drained,
        refundTo: have,
      });
    };
    if (reduce) {
      setCoins(have - drained);
      later(openTeach, 500);
    } else {
      for (let i = 0; i < drained; i++) {
        later(() => setCoins((c) => Math.max(0, c - 1)), 250 + i * 270);
      }
      later(openTeach, 250 + drained * 270 + 500);
    }
  };

  const takeRefund = () => {
    if (!teach) return;
    const { drained, refundTo } = teach;
    const ownedNow = owned.length;
    setTeach(null);
    setSpendKind("refund");
    showToast("Coins refunded. Phew!", "good");
    if (reduce) {
      setCoins(refundTo);
      later(() => advance(ownedNow), 700);
    } else {
      for (let i = 0; i < drained; i++) {
        later(() => setCoins((c) => Math.min(refundTo, c + 1)), 200 + i * 150);
      }
      later(() => advance(ownedNow), 200 + drained * 150 + 700);
    }
  };

  const walkAway = () => {
    if (busy || teach) return;
    setBusy(true);
    showToast(
      deal.honest ? "Saving is smart too!" : "Smart move! You dodged a coin trap.",
      "good",
    );
    later(() => advance(owned.length), 1100);
  };

  const ringBell = () => {
    if (bellRung || busy || teach) return;
    setBellRung(true);
    setBellUsed(true);
    const allowBuy = coins - deal.advertised >= 1;
    later(() => setGrownUp({ text: allowBuy ? GROWN_UP_YES : GROWN_UP_NO, allowBuy }), 750);
  };

  const beatNumber = bonusBeat ? DEALS.length : dealIdx + 1;
  const choicesLocked = deal.needsGrownUp && !grownUp;

  return (
    <ExerciseFrame padding={24} maxWidth={880}>
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 14,
          minHeight: 500,
        }}
      >
        {/* ------------ header: shop sign + pouch + my stuff ------------ */}
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
            THE LOOT SHOP
          </div>
          <Pouch coins={coins} spendKind={spendKind} flash={drainFlash} />
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
            {owned.map((id) => (
              <span
                key={id}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: "rgba(52, 211, 153, 0.14)",
                  border: `1px solid rgba(52, 211, 153, 0.5)`,
                }}
              >
                <PixIcon emoji="✅" size={16} />
                {id.startsWith("hat") ? "Cool Hat" : "Star Cape"}
              </span>
            ))}
          </div>
        )}

        {/* ------------ beat chips ------------ */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {DEALS.map((d, i) => {
            const done = bonusBeat || i < dealIdx || phase === "celebrate";
            const current = !bonusBeat && i === dealIdx && phase === "shop";
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
                  boxShadow: current ? `0 0 12px rgba(255, 215, 94, 0.6)` : undefined,
                }}
              />
            );
          })}
          <span style={{ fontSize: 13, fontWeight: 800, opacity: 0.7, marginLeft: 4 }}>
            Deal {beatNumber} of {DEALS.length}
          </span>
        </div>

        {/* ------------ main board ------------ */}
        <div
          style={{
            display: "flex",
            gap: 20,
            justifyContent: "center",
            alignItems: "stretch",
            flexWrap: "wrap",
          }}
        >
          <DealCard key={`card-${deal.id}`} deal={deal} reduce={reduce} />
          <LeverStation
            key={`lever-${deal.id}`}
            deal={deal}
            done={revealed}
            reduce={reduce}
            onRevealed={() => setRevealed(true)}
          />
        </div>

        {/* ------------ action area ------------ */}
        <div style={{ minHeight: 118, display: "flex", flexDirection: "column", gap: 10 }}>
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
                Pull the TRUTH LEVER and HOLD it to print the real price!
              </motion.div>
            )}

            {revealed && choicesLocked && (
              <motion.div
                key="bell"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  alignSelf: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 800, color: GOLD }}>
                  This deal is over 2 coins! Ring the bell before you choose.
                </div>
                <motion.button
                  onClick={ringBell}
                  whileTap={{ scale: 0.92 }}
                  animate={
                    bellRung
                      ? { rotate: [0, -20, 16, -10, 6, 0] }
                      : reduce
                        ? {}
                        : { rotate: [0, -6, 6, 0] }
                  }
                  transition={
                    bellRung
                      ? { duration: 0.7 }
                      : { repeat: Infinity, duration: 1.6, repeatDelay: 0.6 }
                  }
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                    padding: "12px 26px",
                    borderRadius: 18,
                    border: `2px solid ${GOLD}`,
                    background: "linear-gradient(180deg, rgba(255,215,94,0.25), rgba(255,165,40,0.15))",
                    color: "#ffe9b0",
                    fontWeight: 900,
                    fontSize: 17,
                    cursor: bellRung ? "default" : "pointer",
                    letterSpacing: 0.5,
                  }}
                >
                  <PixIcon emoji="🔔" size={44} />
                  {bellRung ? "DING!" : "ASK A GROWN-UP"}
                </motion.button>
              </motion.div>
            )}

            {revealed && !choicesLocked && (
              <motion.div
                key="choices"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}
              >
                {grownUp && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      maxWidth: 560,
                      padding: "10px 14px",
                      borderRadius: 16,
                      background: "rgba(231, 236, 255, 0.08)",
                      border: "1px solid rgba(231, 236, 255, 0.25)",
                      fontSize: 15,
                      fontWeight: 700,
                      lineHeight: 1.45,
                    }}
                  >
                    <PixIcon emoji="👪" size={34} />
                    <span>{grownUp.text}</span>
                  </div>
                )}
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
                  {(!deal.needsGrownUp || (grownUp && grownUp.allowBuy)) && (
                    <BigButton
                      onClick={deal.honest ? buyFair : buyTrap}
                      disabled={busy}
                      kind="buy"
                    >
                      <CoinSvg size={22} />
                      BUY for {deal.advertised} {deal.advertised === 1 ? "coin" : "coins"}
                    </BigButton>
                  )}
                  {!deal.mustBuy && (
                    <BigButton onClick={walkAway} disabled={busy} kind="walk">
                      {deal.needsGrownUp && grownUp && !grownUp.allowBuy
                        ? "SAVE MY COINS"
                        : "WALK AWAY"}
                    </BigButton>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ------------ toast ------------ */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.text}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            style={{
              position: "absolute",
              bottom: 18,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              pointerEvents: "none",
              zIndex: 6,
            }}
          >
            <div
              style={{
                padding: "10px 20px",
                borderRadius: 999,
                fontSize: 16,
                fontWeight: 900,
                color: "#08221a",
                background: toast.tone === "good" ? GOOD_GREEN : GOLD,
                boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
              }}
            >
              {toast.text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------ trap teach overlay ------------ */}
      <AnimatePresence>
        {teach && (
          <motion.div
            key="teach"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
              background: "rgba(10, 12, 28, 0.78)",
            }}
          >
            <motion.div
              initial={{ scale: reduce ? 1 : 0.85, y: reduce ? 0 : 16 }}
              animate={{ scale: 1, y: 0 }}
              style={{
                maxWidth: 480,
                width: "100%",
                borderRadius: 22,
                padding: "22px 24px",
                background: "linear-gradient(180deg, #2a1a2e, #1d1430)",
                border: `2px solid ${BAD_RED}`,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                textAlign: "center",
                alignItems: "center",
              }}
            >
              <PixIcon emoji="💡" size={48} />
              <div style={{ fontSize: 22, fontWeight: 900, color: BAD_RED }}>{teach.title}</div>
              <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.5 }}>
                {teach.drained} {teach.drained === 1 ? "coin" : "coins"} vanished! {teach.body}
              </div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: GOOD_GREEN,
                  background: "rgba(52, 211, 153, 0.12)",
                  border: "1px solid rgba(52, 211, 153, 0.4)",
                  borderRadius: 12,
                  padding: "8px 12px",
                  lineHeight: 1.45,
                }}
              >
                {teach.tip}
              </div>
              <BigButton onClick={takeRefund} kind="buy">
                <CoinSvg size={22} />
                REFUND MY COINS
              </BigButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------ intro overlay ------------ */}
      {phase === "intro" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 9,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            background: "rgba(10, 12, 28, 0.86)",
          }}
        >
          <motion.div
            initial={{ scale: reduce ? 1 : 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              maxWidth: 520,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
              textAlign: "center",
              // The spoken-instruction block makes the intro taller; on short
              // viewports the card scrolls internally so the start button is
              // always reachable (never clipped by the centered overlay).
              maxHeight: "100%",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", gap: 6 }}>
              {Array.from({ length: START_COINS }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: reduce ? 0 : -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: reduce ? 0 : 0.12 * i }}
                >
                  <CoinSvg size={34} />
                </motion.div>
              ))}
            </div>
            <div style={{ fontSize: 30, fontWeight: 900, color: GOLD, letterSpacing: 1 }}>
              THE TRUE-PRICE LEVER
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.55 }}>
              Welcome to the Loot Shop! You have 5 golden coins for the WHOLE shop.
              Some shiny deals hide their true price. Pull the brass TRUTH LEVER on
              every deal and HOLD it: a paper receipt prints the REAL total. And if
              anything costs more than 2 coins, ring the ASK A GROWN-UP bell first!
            </div>
            {narration && narration.lines.length > 0 && (
              <div style={{ width: "100%", textAlign: "left" }}>
                <InfoNarration lines={narration.lines} accent={accent ?? "#ff4e6a"} />
              </div>
            )}
            <BigButton onClick={() => setPhase("shop")} kind="buy">
              OPEN THE SHOP
            </BigButton>
          </motion.div>
        </div>
      )}

      {/* ------------ win overlay ------------ */}
      {phase === "celebrate" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 9,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            background: "rgba(8, 22, 16, 0.88)",
          }}
        >
          <motion.div
            initial={{ scale: reduce ? 1 : 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              maxWidth: 520,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              textAlign: "center",
            }}
          >
            <div style={{ display: "flex", gap: 10 }}>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: reduce ? 0 : -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: reduce ? 0 : 0.18 * i, type: "spring", stiffness: 300 }}
                >
                  <PixIcon emoji="⭐" size={54} />
                </motion.div>
              ))}
            </div>
            <div style={{ fontSize: 34, fontWeight: 900, color: GOOD_GREEN, letterSpacing: 1 }}>
              SMART SHOPPER!
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
              <WinChip>
                <PixIcon emoji="✅" size={20} /> You checked every TRUE price
              </WinChip>
              {bellUsed && (
                <WinChip>
                  <PixIcon emoji="🔔" size={20} /> You asked a grown-up on the big deal
                </WinChip>
              )}
              <WinChip>
                {Array.from({ length: coins }).map((_, i) => (
                  <CoinSvg key={i} size={20} />
                ))}
                {coins} {coins === 1 ? "coin" : "coins"} still in your pouch
              </WinChip>
            </div>
            <BigButton onClick={finish} kind="buy">
              COLLECT MY STARS
            </BigButton>
          </motion.div>
        </div>
      )}
    </ExerciseFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Pouch                                                              */
/* ------------------------------------------------------------------ */

function Pouch({
  coins,
  spendKind,
  flash,
}: {
  coins: number;
  spendKind: SpendKind;
  flash: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 14px",
        borderRadius: 16,
        background: flash ? "rgba(255, 93, 93, 0.16)" : "rgba(255, 215, 94, 0.08)",
        border: `2px solid ${flash ? BAD_RED : "rgba(255, 215, 94, 0.45)"}`,
        boxShadow: flash ? `0 0 18px rgba(255, 93, 93, 0.5)` : undefined,
        transition: "all 0.3s ease",
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: 1.5, color: GOLD }}>
        POUCH
      </span>
      <div style={{ display: "flex", gap: 5 }}>
        {Array.from({ length: START_COINS }).map((_, i) => (
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
/* Deal card                                                          */
/* ------------------------------------------------------------------ */

function DealCard({ deal, reduce }: { deal: Deal; reduce: boolean }) {
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
    </motion.div>
  );
}

function ItemArt({ kind }: { kind: Deal["art"] }) {
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
  done,
  reduce,
  onRevealed,
}: {
  deal: Deal;
  done: boolean;
  reduce: boolean;
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
  const revealCbRef = useRef(onRevealed);
  useEffect(() => {
    revealCbRef.current = onRevealed;
  }, [onRevealed]);

  /* stop holding when the pointer lifts anywhere */
  useEffect(() => {
    if (!holding) return;
    const stop = () => {
      holdingRef.current = false;
      setHolding(false);
    };
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
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
      if (holdingRef.current && !doneRef.current) {
        const next = Math.min(1, progress.get() + dt / speed);
        progress.set(next);
        if (next >= 1) {
          doneRef.current = true;
          revealCbRef.current();
          return;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [holding, reduce, progress]);

  const startHold = () => {
    if (doneRef.current) return;
    holdingRef.current = true;
    setHolding(true);
  };

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
        <div
          role="button"
          aria-label="Truth lever. Press and hold to print the true price."
          onPointerDown={startHold}
          style={{
            position: "relative",
            width: 120,
            height: 148,
            cursor: done ? "default" : "pointer",
            touchAction: "none",
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
        </div>
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
            animate={reduce ? {} : { scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 1.1 }}
            style={{
              fontSize: 13,
              fontWeight: 900,
              letterSpacing: 1,
              color: holding ? GOLD : "rgba(231,236,255,0.75)",
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
                  color: deal.honest ? INK_GOOD : INK_BAD,
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
                  border: `4px double ${deal.honest ? INK_GOOD : INK_BAD}`,
                  borderRadius: 8,
                  color: deal.honest ? INK_GOOD : INK_BAD,
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

function BigButton({
  children,
  onClick,
  disabled,
  kind,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  kind: "buy" | "walk";
}) {
  const buyStyle: CSSProperties = {
    background: `linear-gradient(180deg, ${GOLD}, ${GOLD_DEEP})`,
    color: "#5b3a05",
    border: "2px solid rgba(255, 240, 190, 0.8)",
  };
  const walkStyle: CSSProperties = {
    background: "linear-gradient(180deg, #4a5aa8, #35418a)",
    color: "#e7ecff",
    border: "2px solid rgba(160, 180, 255, 0.6)",
  };
  return (
    <motion.button
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
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.55 : 1,
        boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
        fontFamily: "inherit",
        ...(kind === "buy" ? buyStyle : walkStyle),
      }}
    >
      {children}
    </motion.button>
  );
}

function WinChip({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 16px",
        borderRadius: 999,
        background: "rgba(52, 211, 153, 0.12)",
        border: "1px solid rgba(52, 211, 153, 0.45)",
        fontSize: 16,
        fontWeight: 800,
      }}
    >
      {children}
    </div>
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
