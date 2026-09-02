"use client";

/*
 * THE BARGAINSTER - Week 4 boss signature (Scams & Tricks: Real or Fake?).
 *
 * The Hacker Raccoon's scam contraption squats on a moonlit dock and dangles
 * a whole rig of glowing "deals" on fishing lines over the water. Sneaky
 * twist: it has also snagged some of YOUR real notes and wrapped them in the
 * same shiny packaging, hiding its bait among the genuine.
 *
 * The child taps any dangling parcel to REEL IT IN and read it big. Every
 * baited offer hides one classic tell (a swapped letter, a prize you never
 * entered, a panic countdown, a request for private info or a password).
 * Then they choose:
 *   CUT THE HOOK  -> correct for baited scams: the line snaps, the lure
 *                    splashes into the water, the Bargainster recoils and a
 *                    gear on its rig stops spinning.
 *   LET IT DRIFT  -> correct for real, harmless things: the note is set
 *                    free and floats gently away.
 * A wrong choice never fails the child: judge() carries a kind teach line
 * and the parcel stays reeled in for another try. Clear every line to jam
 * the machine -> done() -> the engine's weak-point question + gear pop.
 *
 * Contract: BossSignatureProps (config, accent, judge, done, reduce).
 * Self-contained: built-in default lure set so it fully plays with no config
 * (previewable at /dev/boss-sig?m=w4Bargainster). No canvas; DOM + SVG only.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent as RMouseEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import PixIcon from "@/app/components/lesson/PixIcon";
import type { BossSignatureProps } from "@/app/components/game/bossSignatures";

const MONO = "'JetBrains Mono', ui-monospace, Menlo, monospace";
const ROUNDED = "ui-rounded, 'Fredoka', 'Quicksand', system-ui, sans-serif";

/* ───────────────────────── data ───────────────────────── */

interface LureDef {
  id: string;
  /** PixIcon emoji shown on the dangling parcel and the inspect card. */
  icon: string;
  /** Short teaser on the parcel tag. */
  label: string;
  /** Full offer text shown when reeled in. */
  offer: string;
  isScam: boolean;
  /**
   * The lesson beat. For scams: the tell, revealed on a correct cut and
   * taught on a wrong "let it drift". For real things: why it is safe,
   * taught on a wrong cut.
   */
  tell: { title: string; explanation: string };
}

const DEFAULT_LURES: LureDef[] = [
  {
    id: "5tarmart",
    icon: "🏷️",
    label: "MEGA SALE",
    offer: "5tarMart MEGA SALE! New phones 90% off, today only. Tap fast!",
    isScam: true,
    tell: {
      title: "Swapped letter!",
      explanation:
        "Look at the name: 5tarMart starts with a 5, not an S. Scammers copy real stores and change one tiny letter, hoping you read too fast.",
    },
  },
  {
    id: "lucky-winner",
    icon: "🏆",
    label: "YOU WON!",
    offer: "CONGRATULATIONS!! You are our LUCKY WINNER! Claim your free tablet right now!",
    isScam: true,
    tell: {
      title: "A prize you never entered!",
      explanation:
        "You cannot win a contest you never joined. A surprise 'winner' message is bait on a hook, not luck.",
    },
  },
  {
    id: "grandma-note",
    icon: "✉️",
    label: "From Grandma",
    offer: "Hi sweetheart, it's Grandma. Cookies will be warm when you get home from school. Love you!",
    isScam: false,
    tell: {
      title: "That one's real!",
      explanation:
        "It's just a kind note from Grandma. No prizes, no hurry, no asking for secrets. Real things can drift on by.",
    },
  },
  {
    id: "countdown",
    icon: "⚡",
    label: "ENDS SOON",
    offer: "FLASH DEAL! Free game coins end in 10... 9... 8... HURRY! Don't think, just click!",
    isScam: true,
    tell: {
      title: "Panic countdown!",
      explanation:
        "Real deals let you take your time. A ticking clock shouting 'don't think' is a trick to rush you past the truth.",
    },
  },
  {
    id: "free-coins",
    icon: "🎮",
    label: "FREE COINS",
    offer: "FREE game money! 10,000 coins instantly. Just type your password in the box below!",
    isScam: true,
    tell: {
      title: "It asked for your password!",
      explanation:
        "No real prize ever needs your password. Anyone who asks for it is trying to steal your account.",
    },
  },
  {
    id: "practice-reminder",
    icon: "📋",
    label: "Reminder",
    offer: "Your calendar: Soccer practice today at 4 pm. Bring your water bottle.",
    isScam: false,
    tell: {
      title: "That one's real!",
      explanation:
        "It's your own reminder that you set yourself. It doesn't promise prizes or rush you. Let it drift.",
    },
  },
  {
    id: "puppy-raffle",
    icon: "🎁",
    label: "PUPPY PRIZE",
    offer: "You won the Grand Puppy Raffle! Just send your home address to collect your free puppy!",
    isScam: true,
    tell: {
      title: "It's fishing for your info!",
      explanation:
        "You never entered a puppy raffle, and real prizes never need your home address. This hook wants your private info.",
    },
  },
];

/** Fresh Bargainster barks when a line gets cut (cycled, never repeated back to back). */
const BARKS = [
  "Hey!! That was my juiciest bait!",
  "Quit snipping my lines, kid!",
  "Grrr! You actually READ it?!",
  "My beautiful bargains! Ruined!",
  "That deal was 100% fake... I mean FREE!",
];

/** Where each line hangs on the board (percent of board width / line length). */
const SLOTS: { x: number; y: number }[] = [
  { x: 8, y: 38 },
  { x: 22, y: 58 },
  { x: 36, y: 34 },
  { x: 50, y: 60 },
  { x: 64, y: 36 },
  { x: 78, y: 57 },
  { x: 92, y: 40 },
];

const STARS: { x: number; y: number; s: number }[] = [
  { x: 5, y: 19, s: 2 },
  { x: 17, y: 26, s: 2.5 },
  { x: 31, y: 18, s: 2 },
  { x: 45, y: 24, s: 2 },
  { x: 58, y: 17, s: 2.5 },
  { x: 71, y: 27, s: 2 },
  { x: 96, y: 24, s: 2 },
];

function parseLures(config?: Record<string, unknown>): LureDef[] {
  const raw = config?.lures;
  if (!Array.isArray(raw)) return DEFAULT_LURES;
  const out: LureDef[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const t = (o.tell && typeof o.tell === "object" ? o.tell : {}) as Record<string, unknown>;
    if (typeof o.id !== "string" || typeof o.offer !== "string") continue;
    out.push({
      id: o.id,
      icon: typeof o.icon === "string" ? o.icon : "🎁",
      label: typeof o.label === "string" ? o.label : "PRIZE",
      offer: o.offer,
      isScam: o.isScam !== false,
      tell: {
        title: typeof t.title === "string" ? t.title : "Look closer!",
        explanation:
          typeof t.explanation === "string"
            ? t.explanation
            : "Check for a tell before you trust a shiny deal.",
      },
    });
  }
  return out.length >= 2 ? out : DEFAULT_LURES;
}

/* ─────────────────────── tiny inline SVGs ─────────────────────── */

function ScissorsGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
      <circle cx="6" cy="6" r="2.6" />
      <circle cx="6" cy="18" r="2.6" />
      <path d="M8.2 7.6 L20 17" />
      <path d="M8.2 16.4 L20 7" />
    </svg>
  );
}

function WaveGlyph() {
  return (
    <svg width="22" height="18" viewBox="0 0 24 20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
      <path d="M2 7 q3 -3.5 6 0 t6 0 t6 0" />
      <path d="M2 14 q3 -3.5 6 0 t6 0 t6 0" />
    </svg>
  );
}

function HookGlyph() {
  return (
    <svg width="14" height="18" viewBox="0 0 14 18" aria-hidden style={{ display: "block" }}>
      <path d="M7 0 v7 a4.5 4.5 0 1 0 6 4" fill="none" stroke="#cdd9ee" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ───────────────────────── component ───────────────────────── */

type LureStatus = "cut" | "drift" | "gone" | undefined; // undefined = still hanging

export default function W4Bargainster({ config, accent, judge, done, reduce }: BossSignatureProps) {
  const lures = useMemo(() => parseLures(config), [config]);
  const slots = useMemo(() => {
    const n = lures.length;
    if (n >= SLOTS.length || n <= 1) return lures.map((_, i) => SLOTS[i % SLOTS.length]);
    return lures.map((_, i) => SLOTS[Math.round((i * (SLOTS.length - 1)) / (n - 1))]);
  }, [lures]);

  const [statuses, setStatuses] = useState<Record<string, LureStatus>>({});
  const [inspect, setInspect] = useState<{ id: string; phase: "deciding" | "reveal" } | null>(null);
  const [wrongTick, setWrongTick] = useState(0);
  const [recoilTick, setRecoilTick] = useState(0);
  const [bark, setBark] = useState<string | null>(null);

  const finishedRef = useRef(false);
  const cutCountRef = useRef(0);
  const timersRef = useRef<number[]>([]);
  const later = useCallback((fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  }, []);
  useEffect(
    () => () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
    },
    [],
  );

  const active = inspect ? lures.find((l) => l.id === inspect.id) : undefined;
  const cleared = lures.filter((l) => statuses[l.id] !== undefined).length;
  const allGone = lures.length > 0 && lures.every((l) => statuses[l.id] === "gone");

  /* Every line cleared -> jam the machine exactly once. */
  useEffect(() => {
    if (!allGone || finishedRef.current) return;
    const id = window.setTimeout(() => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      done();
    }, 650);
    return () => window.clearTimeout(id);
  }, [allGone, done]);

  const reelIn = (id: string) => {
    if (inspect || finishedRef.current || statuses[id] !== undefined) return;
    setInspect({ id, phase: "deciding" });
  };

  /** choice: 0 = cut the hook, 1 = let it drift. */
  const decide = (choice: 0 | 1, e: RMouseEvent<HTMLButtonElement>) => {
    if (!inspect || inspect.phase !== "deciding" || !active) return;
    const lure = active;
    const correct: 0 | 1 = lure.isScam ? 0 : 1;
    const at = { x: e.clientX, y: e.clientY };
    if (choice === correct) {
      judge(`w4sig-${lure.id}`, true, choice, correct, undefined, at);
      setInspect({ id: lure.id, phase: "reveal" });
      later(() => {
        setInspect(null);
        setStatuses((s) => ({ ...s, [lure.id]: lure.isScam ? "cut" : "drift" }));
        if (lure.isScam) {
          setRecoilTick((t) => t + 1);
          const line = BARKS[cutCountRef.current % BARKS.length];
          cutCountRef.current += 1;
          setBark(line);
          later(() => setBark((b) => (b === line ? null : b)), 2300);
        }
        later(() => setStatuses((s) => ({ ...s, [lure.id]: "gone" })), reduce ? 500 : 1250);
      }, 1800);
    } else {
      judge(
        `w4sig-${lure.id}`,
        false,
        choice,
        correct,
        { title: lure.tell.title, explanation: lure.tell.explanation },
        at,
      );
      setWrongTick((t) => t + 1);
    }
  };

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        fontFamily: ROUNDED,
      }}
    >
      {/* how-to hint */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          padding: "7px 16px",
          borderRadius: 999,
          maxWidth: "94%",
          background: "rgba(255,255,255,0.95)",
          border: `3px solid ${accent}`,
          boxShadow: "0 10px 26px -14px rgba(10,14,34,0.6)",
        }}
      >
        <PixIcon emoji="👆" size={24} />
        <span style={{ fontSize: 14.5, fontWeight: 900, color: "#1d2b4f", lineHeight: 1.25 }}>
          Reel in each dangling deal. Cut the baited hooks. Set the real notes free!
        </span>
      </div>

      {/* the dock board */}
      <div style={{ width: "min(780px, 100%)", padding: "0 4px" }}>
        <div
          style={{
            position: "relative",
            width: "100%",
            height: 380,
            borderRadius: 20,
            overflow: "hidden",
            border: `3px solid ${accent}`,
            boxShadow: `0 18px 44px -18px rgba(6,12,30,0.85), 0 0 26px -8px ${accent}66`,
            background:
              "linear-gradient(180deg, #0b1230 0%, #101c44 30%, #0d2b4e 58%, #0a3a5c 72%, #083048 100%)",
          }}
        >
          {/* stars */}
          {STARS.map((st, i) => (
            <div
              key={`star-${i}`}
              style={{
                position: "absolute",
                left: `${st.x}%`,
                top: `${st.y}%`,
                width: st.s,
                height: st.s,
                borderRadius: 999,
                background: "rgba(235,244,255,0.8)",
              }}
            />
          ))}

          {/* moon + its reflection */}
          <div
            style={{
              position: "absolute",
              right: 24,
              top: 64,
              width: 52,
              height: 52,
              borderRadius: 999,
              background: "radial-gradient(circle at 38% 34%, #fffdf2, #ffedb8)",
              boxShadow: "0 0 34px 10px rgba(255,240,190,0.35)",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: 36,
              top: "72%",
              bottom: 26,
              width: 28,
              background:
                "linear-gradient(180deg, rgba(255,244,214,0.18), rgba(255,244,214,0.02))",
              filter: "blur(1px)",
            }}
          />

          {/* water surface shimmer */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: "72%",
              height: 2,
              background:
                "linear-gradient(90deg, transparent, rgba(140,220,255,0.55), rgba(140,220,255,0.25), transparent)",
            }}
          />
          <motion.div
            animate={reduce ? undefined : { opacity: [0.14, 0.3, 0.14] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: "74%",
              bottom: 0,
              opacity: 0.2,
              background:
                "repeating-linear-gradient(180deg, rgba(150,220,255,0.28) 0 2px, transparent 2px 14px)",
            }}
          />

          {/* the wooden dock edge the hero stands on */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 26,
              borderTop: "3px solid #3a2814",
              background:
                "repeating-linear-gradient(90deg, #6b4a2b 0 46px, #5c3f24 46px 48px, #7d5732 48px 94px, #5c3f24 94px 96px)",
            }}
          />

          {/* dangling lures (lines start behind the rig bar) */}
          {lures.map((lure, i) => {
            const slot = slots[i];
            const status = statuses[lure.id];
            if (status === "gone") return null;
            const anim =
              status === "cut"
                ? { y: reduce ? 26 : 190, x: 0, rotate: reduce ? 0 : 11, opacity: 0 }
                : status === "drift"
                  ? { y: reduce ? 26 : 96, x: reduce ? 0 : 150, rotate: reduce ? 0 : -8, opacity: 0 }
                  : reduce
                    ? { y: 0, x: 0, rotate: 0, opacity: 1 }
                    : { y: [0, 6, 0], x: 0, rotate: 0, opacity: 1 };
            const transition =
              status === "cut"
                ? { duration: reduce ? 0.4 : 0.75, ease: "easeIn" as const }
                : status === "drift"
                  ? { duration: reduce ? 0.4 : 1.1, ease: "easeOut" as const }
                  : reduce
                    ? { duration: 0.3 }
                    : { duration: 2.6 + i * 0.33, repeat: Infinity, ease: "easeInOut" as const };
            return (
              <motion.div
                key={lure.id}
                initial={reduce ? false : { opacity: 0, y: -20 }}
                animate={anim}
                transition={transition}
                style={{
                  position: "absolute",
                  left: `${slot.x}%`,
                  top: 0,
                  height: `${slot.y}%`,
                  width: 0,
                  zIndex: 5,
                }}
              >
                {/* the fishing line */}
                <div
                  style={{
                    position: "absolute",
                    left: -1.5,
                    top: 0,
                    bottom: 0,
                    width: 3,
                    background:
                      "linear-gradient(180deg, rgba(220,235,255,0.12), rgba(220,235,255,0.55))",
                  }}
                />
                {/* hook + parcel */}
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    transform: "translateX(-50%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <HookGlyph />
                  <motion.button
                    onClick={() => reelIn(lure.id)}
                    whileTap={reduce ? undefined : { scale: 0.92 }}
                    aria-label={`Reel in: ${lure.label}`}
                    style={{
                      width: 92,
                      padding: "9px 6px 8px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                      borderRadius: 14,
                      cursor: "pointer",
                      touchAction: "manipulation",
                      fontFamily: "inherit",
                      background: "linear-gradient(180deg, #ffe9a8, #ffc95c 55%, #f0a83a)",
                      border: "2.5px solid #b97f1f",
                      boxShadow:
                        "0 10px 22px -10px rgba(6,12,30,0.8), 0 0 18px -4px rgba(255,209,102,0.7)",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: 8.5,
                        fontWeight: 800,
                        letterSpacing: "0.12em",
                        color: "#7a4d0e",
                      }}
                    >
                      DEAL
                    </span>
                    <PixIcon emoji={lure.icon} size={30} />
                    <span
                      style={{
                        fontSize: 11.5,
                        fontWeight: 900,
                        color: "#5a3a08",
                        lineHeight: 1.15,
                        textAlign: "center",
                      }}
                    >
                      {lure.label}
                    </span>
                  </motion.button>
                </div>
              </motion.div>
            );
          })}

          {/* splash rings where a cut lure hits the water */}
          {!reduce &&
            lures.map((lure, i) =>
              statuses[lure.id] === "cut" ? (
                <motion.div
                  key={`splash-${lure.id}`}
                  initial={{ scale: 0.3, opacity: 0.9 }}
                  animate={{ scale: 4.4, opacity: 0 }}
                  transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                  style={{
                    position: "absolute",
                    left: `calc(${slots[i].x}% - 10px)`,
                    top: "calc(72% - 5px)",
                    width: 20,
                    height: 10,
                    borderRadius: "50%",
                    border: "2.5px solid rgba(160,225,255,0.85)",
                    zIndex: 6,
                  }}
                />
              ) : null,
            )}

          {/* THE BARGAINSTER rig bar (recoils when a line is cut) */}
          <motion.div
            key={`rig-${recoilTick}`}
            animate={recoilTick > 0 && !reduce ? { x: [0, -8, 8, -5, 5, 0] } : { x: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 56,
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "0 14px",
              background: "linear-gradient(180deg, #4a3016, #2e1d0c)",
              borderBottom: "3px solid #1c1206",
              boxShadow: "0 8px 20px -8px rgba(0,0,0,0.7)",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.35)",
                border: "2px solid #7a5a2c",
                flexShrink: 0,
              }}
            >
              <PixIcon emoji="🦝" size={30} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 13,
                  fontWeight: 900,
                  letterSpacing: "0.13em",
                  color: "#ffd166",
                  whiteSpace: "nowrap",
                }}
              >
                THE BARGAINSTER
              </div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 9,
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  color: "rgba(255,179,71,0.85)",
                  whiteSpace: "nowrap",
                }}
              >
                DEALS! PRIZES! 100% FREE*
              </div>
            </div>

            {/* blinking marquee bulbs */}
            <div style={{ display: "flex", gap: 6, marginLeft: 6 }}>
              {[0, 1, 2, 3, 4].map((b) => (
                <motion.div
                  key={b}
                  animate={reduce ? { opacity: 0.7 } : { opacity: [0.25, 1, 0.25] }}
                  transition={reduce ? undefined : { duration: 1.2, repeat: Infinity, delay: b * 0.22 }}
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 999,
                    background: "#ffd166",
                    boxShadow: "0 0 8px 2px rgba(255,209,102,0.55)",
                  }}
                />
              ))}
            </div>

            {/* gear jam meter: one gear per line, stops when that line clears */}
            <div style={{ marginLeft: "auto", display: "flex", gap: 4, alignItems: "center" }}>
              {lures.map((lure, i) => {
                const stopped = statuses[lure.id] !== undefined;
                return (
                  <motion.div
                    key={`gear-${lure.id}`}
                    animate={stopped || reduce ? { rotate: 0 } : { rotate: 360 }}
                    transition={
                      stopped || reduce
                        ? { duration: 0.3 }
                        : { duration: 3 + (i % 3), repeat: Infinity, ease: "linear" }
                    }
                    style={{ display: "flex", opacity: stopped ? 0.3 : 1, filter: stopped ? "grayscale(1)" : undefined }}
                  >
                    <PixIcon emoji="⚙" size={17} />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Bargainster bark bubble */}
          <AnimatePresence>
            {bark && (
              <motion.div
                key={bark}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  position: "absolute",
                  top: 62,
                  left: 12,
                  zIndex: 12,
                  maxWidth: 250,
                  padding: "7px 11px",
                  borderRadius: 12,
                  borderTopLeftRadius: 3,
                  background: "rgba(255,255,255,0.96)",
                  border: "2.5px solid #ffb347",
                  boxShadow: "0 10px 24px -12px rgba(6,12,30,0.8)",
                  fontSize: 12.5,
                  fontWeight: 800,
                  color: "#1d2b4f",
                  lineHeight: 1.3,
                }}
              >
                {bark}
              </motion.div>
            )}
          </AnimatePresence>

          {/* inspect overlay: the reeled-in parcel, read big + decide */}
          <AnimatePresence>
            {inspect && active && (
              <motion.div
                key="inspect"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 30,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 14,
                  background: "rgba(5,9,24,0.64)",
                }}
              >
                <motion.div
                  key={`card-${inspect.id}`}
                  initial={reduce ? false : { y: 46, scale: 0.86, opacity: 0 }}
                  animate={{ y: 0, scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  style={{ width: "min(440px, 100%)" }}
                >
                  <motion.div
                    key={`shake-${wrongTick}`}
                    animate={wrongTick > 0 && !reduce ? { x: [0, -9, 9, -6, 6, 0] } : { x: 0 }}
                    transition={{ duration: 0.45 }}
                    style={{
                      background: "rgba(255,255,255,0.97)",
                      border: `3px solid ${accent}`,
                      borderRadius: 18,
                      padding: 16,
                      boxShadow: "0 22px 50px -18px rgba(4,8,22,0.9)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 11,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                      <div
                        style={{
                          width: 54,
                          height: 54,
                          borderRadius: 14,
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "linear-gradient(180deg, #ffe9a8, #f0a83a)",
                          border: "2.5px solid #b97f1f",
                        }}
                      >
                        <PixIcon emoji={active.icon} size={36} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontFamily: MONO,
                            fontSize: 10.5,
                            fontWeight: 900,
                            letterSpacing: "0.14em",
                            color: "#0ea5c6",
                          }}
                        >
                          REELED IN
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: "#1d2b4f", lineHeight: 1.2 }}>
                          Baited hook or the real thing?
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        background: "#fff7e2",
                        border: "2.5px dashed #d9a642",
                        borderRadius: 12,
                        padding: "12px 14px",
                        fontSize: 15.5,
                        fontWeight: 800,
                        color: "#3a2f18",
                        lineHeight: 1.45,
                      }}
                    >
                      {active.offer}
                    </div>

                    {inspect.phase === "deciding" ? (
                      <div style={{ display: "flex", gap: 11 }}>
                        <motion.button
                          onClick={(e) => decide(0, e)}
                          whileTap={reduce ? undefined : { scale: 0.94 }}
                          style={{
                            flex: 1,
                            minHeight: 62,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            borderRadius: 14,
                            cursor: "pointer",
                            touchAction: "manipulation",
                            fontFamily: "inherit",
                            fontSize: 15,
                            fontWeight: 900,
                            color: "#ffffff",
                            background: "linear-gradient(180deg, #3a4a6e, #243254)",
                            border: "3px solid #8d9bbf",
                            boxShadow: "0 12px 26px -12px rgba(10,14,34,0.7)",
                          }}
                        >
                          <ScissorsGlyph />
                          CUT THE HOOK
                        </motion.button>
                        <motion.button
                          onClick={(e) => decide(1, e)}
                          whileTap={reduce ? undefined : { scale: 0.94 }}
                          style={{
                            flex: 1,
                            minHeight: 62,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            borderRadius: 14,
                            cursor: "pointer",
                            touchAction: "manipulation",
                            fontFamily: "inherit",
                            fontSize: 15,
                            fontWeight: 900,
                            color: "#ffffff",
                            background: "linear-gradient(180deg, #1e8fc4, #0d5e8a)",
                            border: "3px solid #7fd4ff",
                            boxShadow: "0 12px 26px -12px rgba(10,14,34,0.7)",
                          }}
                        >
                          <WaveGlyph />
                          LET IT DRIFT
                        </motion.button>
                      </div>
                    ) : (
                      <motion.div
                        initial={reduce ? false : { scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{
                          background: "#eafff0",
                          border: "3px solid #2fae4e",
                          borderRadius: 12,
                          padding: "11px 13px",
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <PixIcon emoji="✅" size={22} />
                          <span style={{ fontSize: 15, fontWeight: 900, color: "#15803d", lineHeight: 1.2 }}>
                            {active.isScam ? "HOOK CUT! " : "SET FREE! "}
                            {active.tell.title}
                          </span>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#1d5c33", lineHeight: 1.4 }}>
                          {active.tell.explanation}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* progress */}
      <div
        style={{
          fontFamily: MONO,
          fontSize: 11,
          fontWeight: 900,
          letterSpacing: "0.12em",
          color: "#eafff0",
          padding: "5px 14px",
          borderRadius: 999,
          background: "rgba(10,16,38,0.72)",
          border: `2px solid ${accent}88`,
          textShadow: "0 1px 6px rgba(13,24,58,0.8)",
        }}
      >
        LINES CLEARED {cleared} / {lures.length}
      </div>
    </div>
  );
}
