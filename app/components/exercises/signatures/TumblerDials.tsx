"use client";

/**
 * TumblerDials: "THE TUMBLER DIALS" spin-a-dial signature drill
 * (Week 1, Passwords, brass-vault feel).
 *
 * Three big brass vault dials sit in a vault door: a WORD ring, a NUMBER
 * ring, and a SYMBOL ring. The child SPINS a dial (circular drag with
 * pointer-angle math, snapping to the nearest slot on release) so the
 * glowing notch lands on a slot. Landing on a STRONG choice drives the
 * tumbler home with a heavy clunk, fills a piece of the password preview,
 * and climbs the strength gauge. Landing on an obvious choice ("password",
 * "1234", no symbol) buzzes red, springs the dial back one slot, and drops
 * a one-line teach. Seat all three tumblers and the gauge hits gold, the
 * door swings open on a light burst, and the finished strong password is
 * revealed before onComplete() fires (exactly once).
 *
 * Forgiving by design: no timer, no fail state, a weak pick just bounces
 * back. One verb: SPIN. Works with touch and mouse via pointer events.
 */

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import {
  motion,
  AnimatePresence,
  animate,
  useMotionValue,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import PixIcon from "@/app/components/lesson/PixIcon";

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

type RingId = "word" | "number" | "symbol";

interface DialSlot {
  /** The value that seats into the password (empty string = no symbol). */
  label: string;
  /** Chip text when it differs from the label (the "none" slot). */
  display?: string;
  /** Render as an empty dashed socket instead of a brass chip. */
  ghost?: boolean;
  good: boolean;
  /** One-line teach shown when this decoy is landed on. */
  teach?: string;
}

interface RingDef {
  id: RingId;
  name: string;
  emoji: string;
  /** Exactly 4 slots; index 0 sits at 12 o'clock when rotation = 0. */
  slots: DialSlot[];
}

const SLOT_STEP = 90;
const SLOT_COUNT = 4;

const RINGS: RingDef[] = [
  {
    id: "word",
    name: "WORD",
    emoji: "🔠",
    slots: [
      { label: "dragon", good: true },
      {
        label: "password",
        good: false,
        teach: 'The Raccoon guesses "password" first, every single time!',
      },
      { label: "rocket", good: true },
      { label: "purple", good: true },
    ],
  },
  {
    id: "number",
    name: "NUMBER",
    emoji: "🔢",
    slots: [
      { label: "42", good: true },
      { label: "7", good: true },
      {
        label: "1234",
        good: false,
        teach: "1-2-3-4 is the very first number the Raccoon tries!",
      },
      { label: "93", good: true },
    ],
  },
  {
    id: "symbol",
    name: "SYMBOL",
    emoji: "🔣",
    slots: [
      { label: "!", good: true },
      { label: "*", good: true },
      {
        label: "",
        display: "none",
        ghost: true,
        good: false,
        teach: "No symbol? Too easy! The Raccoon slips right in!",
      },
      { label: "#", good: true },
    ],
  },
];

/* Each dial starts BETWEEN slots so nothing looks chosen yet. */
const START_ROTATION: Record<RingId, number> = {
  word: 45,
  number: 135,
  symbol: 225,
};

const GOLD = "#ffd76a";
const GREEN = "#3fe08d";
const RED = "#ff5d5d";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const rad = (deg: number) => (deg * Math.PI) / 180;
const wrap = (n: number, m: number) => ((n % m) + m) % m;
/** Signed smallest difference a - b in degrees, in (-180, 180]. */
const angleDelta = (a: number, b: number) => wrap(a - b + 180, 360) - 180;

/* ------------------------------------------------------------------ */
/* Slot chip (rides on the rotating disc, stays upright)               */
/* ------------------------------------------------------------------ */

function SlotChip({
  slot,
  angle,
  rotation,
  seated,
  dimmed,
}: {
  slot: DialSlot;
  angle: number;
  rotation: MotionValue<number>;
  seated: boolean;
  dimmed: boolean;
}) {
  /* Counter-rotate so the text stays readable while it orbits. */
  const upright = useTransform(rotation, (r) => -r);
  /* 0..1 closeness to the notch at 12 o'clock, for a gentle spotlight. */
  const near = useTransform(rotation, (r) => {
    const d = Math.abs(angleDelta(angle + r, 0));
    return Math.max(0, 1 - d / 60);
  });
  const scale = useTransform(near, (n) => 1 + n * 0.18);
  const glow = useTransform(near, (n) => `brightness(${1 + n * 0.3})`);

  const text = slot.display ?? slot.label;
  const fontSize = text.length >= 6 ? 12 : text.length >= 4 ? 14 : 17;

  const look: CSSProperties = seated
    ? {
        background: "linear-gradient(180deg, #7df0b2 0%, #2ec97f 100%)",
        border: "2px solid rgba(6,90,50,0.7)",
        color: "#053a22",
        boxShadow: "0 0 12px rgba(63,224,141,0.65), inset 0 1px 2px rgba(255,255,255,0.5)",
      }
    : slot.ghost
      ? {
          background: "rgba(18,24,46,0.6)",
          border: "2px dashed rgba(154,164,200,0.6)",
          color: "#aab3d6",
          boxShadow: "none",
        }
      : {
          background: "linear-gradient(180deg, #f6dc9b 0%, #dfb45f 55%, #bd8c36 100%)",
          border: "1px solid rgba(90,58,12,0.55)",
          color: "#3a2606",
          boxShadow: "0 3px 6px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.5)",
        };

  return (
    <div
      style={{
        position: "absolute",
        left: `${50 + 34 * Math.sin(rad(angle))}%`,
        top: `${50 - 34 * Math.cos(rad(angle))}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <motion.div
        style={{
          rotate: upright,
          scale,
          filter: glow,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: 34,
          padding: "5px 9px",
          borderRadius: 10,
          fontWeight: 900,
          fontSize,
          letterSpacing: 0.4,
          whiteSpace: "nowrap",
          opacity: dimmed ? 0.45 : 1,
          ...look,
        }}
      >
        {text}
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Spin hint (arc arrow + pill on the first dial)                      */
/* ------------------------------------------------------------------ */

function SpinHint() {
  return (
    <>
      <motion.div
        aria-hidden
        style={{ position: "absolute", inset: -10, pointerEvents: "none", zIndex: 6 }}
        animate={{ rotate: [0, 26, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", display: "block" }}>
          <path
            d="M 50 3 A 47 47 0 0 1 93 33"
            fill="none"
            stroke={GOLD}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="2 8"
            opacity="0.9"
          />
          <path d="M 97 24 L 93 40 L 80 31 Z" fill={GOLD} />
        </svg>
      </motion.div>
      <motion.div
        aria-hidden
        style={{
          position: "absolute",
          top: -16,
          left: "50%",
          x: "-50%",
          zIndex: 7,
          pointerEvents: "none",
          padding: "4px 12px",
          borderRadius: 999,
          background: GOLD,
          color: "#4a3006",
          fontWeight: 900,
          fontSize: 13,
          letterSpacing: 1,
          boxShadow: "0 3px 10px rgba(0,0,0,0.4)",
        }}
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      >
        SPIN!
      </motion.div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Brass dial                                                          */
/* ------------------------------------------------------------------ */

function BrassDial({
  ring,
  startRotation,
  seatedLabel,
  disabled,
  showHint,
  onFirstTouch,
  onSeat,
  onDecoy,
}: {
  ring: RingDef;
  startRotation: number;
  /** The label seated on this dial, or null while still open. */
  seatedLabel: string | null;
  disabled: boolean;
  showHint: boolean;
  onFirstTouch: () => void;
  onSeat: (slot: DialSlot) => void;
  onDecoy: (slot: DialSlot) => void;
}) {
  const reduceMotion = useReducedMotion();
  const rotation = useMotionValue(startRotation);
  const shakeX = useMotionValue(0);
  const pulse = useMotionValue(1);
  const [flash, setFlash] = useState<"good" | "bad" | null>(null);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const busyRef = useRef(false);
  const dragRef = useRef<{ pointerId: number; lastAngle: number; total: number } | null>(null);
  const flashTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(flashTimer.current), []);

  const seated = seatedLabel !== null;
  const interactive = !disabled && !seated;

  const flashFor = (kind: "good" | "bad", ms: number) => {
    window.clearTimeout(flashTimer.current);
    setFlash(kind);
    flashTimer.current = window.setTimeout(() => setFlash(null), ms);
  };

  const pointerAngle = (e: ReactPointerEvent<HTMLDivElement>): number | null => {
    const el = rootRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    /* Ignore the shaky zone right on the center cap. */
    if (Math.hypot(dx, dy) < 9) return null;
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  };

  const settle = (target: number, spinDir: 1 | -1) => {
    const idx = wrap(Math.round(-target / SLOT_STEP), SLOT_COUNT);
    const slot = ring.slots[idx];
    if (slot.good) {
      /* Heavy CLUNK: quick compress-and-release on the whole dial. */
      if (!reduceMotion) {
        animate(pulse, [1, 0.93, 1.04, 1], { duration: 0.45, times: [0, 0.35, 0.7, 1] });
      }
      flashFor("good", 1000);
      busyRef.current = false;
      onSeat(slot);
    } else {
      flashFor("bad", 800);
      if (!reduceMotion) {
        animate(shakeX, [0, -9, 9, -7, 7, -4, 4, 0], { duration: 0.5, ease: "easeOut" });
      }
      onDecoy(slot);
      /* Spring back one slot, against the direction the child spun. */
      const back = target - spinDir * SLOT_STEP;
      window.setTimeout(() => {
        animate(rotation, back, { type: "spring", stiffness: 210, damping: 18 }).then(() => {
          busyRef.current = false;
        });
      }, 240);
    }
  };

  const finishDrag = (e: ReactPointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const d = dragRef.current;
    if (!d || e.pointerId !== d.pointerId) return;
    dragRef.current = null;
    try {
      rootRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* pointer already gone */
    }
    busyRef.current = true;
    const r = rotation.get();
    const base = Math.round(r / SLOT_STEP) * SLOT_STEP;
    /* A tap (barely any spin) flicks the dial forward one slot. */
    const wasTap = !cancelled && Math.abs(d.total) < 10;
    const target = wasTap ? base + SLOT_STEP : base;
    const spinDir: 1 | -1 = d.total >= 0 ? 1 : -1;
    animate(rotation, target, { type: "spring", stiffness: 320, damping: 26 }).then(() => {
      settle(target, spinDir);
    });
  };

  const handleDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!interactive || busyRef.current || dragRef.current) return;
    const a = pointerAngle(e);
    if (a === null) return;
    onFirstTouch();
    try {
      rootRef.current?.setPointerCapture(e.pointerId);
    } catch {
      /* capture is best-effort */
    }
    dragRef.current = { pointerId: e.pointerId, lastAngle: a, total: 0 };
  };

  const handleMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d || e.pointerId !== d.pointerId) return;
    const a = pointerAngle(e);
    if (a === null) return;
    const delta = angleDelta(a, d.lastAngle);
    d.lastAngle = a;
    d.total += delta;
    rotation.set(rotation.get() + delta);
  };

  const notchColor = seated || flash === "good" ? GREEN : flash === "bad" ? RED : GOLD;
  const ringGlow = seated
    ? `0 0 0 4px rgba(63,224,141,0.5), 0 0 26px rgba(63,224,141,0.4)`
    : flash === "bad"
      ? `0 0 0 4px rgba(255,93,93,0.55), 0 0 26px rgba(255,93,93,0.45)`
      : flash === "good"
        ? `0 0 0 4px rgba(63,224,141,0.5), 0 0 26px rgba(63,224,141,0.4)`
        : "0 0 0 0 rgba(0,0,0,0)";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <motion.div
        ref={rootRef}
        aria-label={`${ring.name} dial`}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={(e) => finishDrag(e, false)}
        onPointerCancel={(e) => finishDrag(e, true)}
        style={{
          x: shakeX,
          scale: pulse,
          position: "relative",
          width: "clamp(150px, 24vw, 220px)",
          aspectRatio: "1",
          borderRadius: "50%",
          touchAction: "none",
          userSelect: "none",
          WebkitUserSelect: "none",
          cursor: interactive ? "grab" : "default",
        }}
      >
        {/* Brass rim */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background:
              "conic-gradient(from 210deg, #8a5c1f, #e8c87e, #a9782f, #f4dfa5, #8a5c1f, #d9ab52, #8a5c1f)",
            boxShadow: `0 10px 24px rgba(0,0,0,0.45), inset 0 2px 6px rgba(255,255,255,0.35), inset 0 -4px 10px rgba(0,0,0,0.4), ${ringGlow}`,
            transition: "box-shadow 0.25s ease",
          }}
        />
        {/* Rivets around the rim */}
        {Array.from({ length: 8 }).map((_, i) => {
          const a = i * 45 + 22.5;
          return (
            <div
              key={i}
              aria-hidden
              style={{
                position: "absolute",
                left: `${50 + 45.5 * Math.sin(rad(a))}%`,
                top: `${50 - 45.5 * Math.cos(rad(a))}%`,
                width: "5.5%",
                height: "5.5%",
                transform: "translate(-50%, -50%)",
                borderRadius: "50%",
                background: "radial-gradient(circle at 35% 30%, #f2d891 0%, #a9782f 55%, #6a4514 100%)",
                boxShadow: "inset 0 -1px 2px rgba(0,0,0,0.5)",
              }}
            />
          );
        })}
        {/* Rotating disc with the choice chips */}
        <motion.div
          style={{
            rotate: rotation,
            position: "absolute",
            inset: "11%",
            borderRadius: "50%",
            background: "radial-gradient(circle at 50% 35%, #46507a 0%, #2c3458 55%, #1f2645 100%)",
            boxShadow: "inset 0 4px 14px rgba(0,0,0,0.55), inset 0 0 0 2px rgba(217,171,82,0.35)",
          }}
        >
          {ring.slots.map((slot, i) => (
            <SlotChip
              key={i}
              slot={slot}
              angle={i * SLOT_STEP}
              rotation={rotation}
              seated={seated && slot.good && seatedLabel === slot.label}
              dimmed={seated && !(slot.good && seatedLabel === slot.label)}
            />
          ))}
        </motion.div>
        {/* Landing window under the notch */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "13%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "36%",
            height: "20%",
            borderRadius: 14,
            border: `2px dashed ${notchColor}`,
            opacity: 0.35,
            zIndex: 1,
            pointerEvents: "none",
            transition: "border-color 0.2s ease",
          }}
        />
        {/* Center cap */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: "24%",
            aspectRatio: "1",
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            background: "radial-gradient(circle at 35% 30%, #f4dfa5 0%, #c99b45 50%, #7a4f16 100%)",
            boxShadow: "0 2px 6px rgba(0,0,0,0.5), inset 0 -2px 4px rgba(0,0,0,0.4)",
            zIndex: 2,
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "58%",
              height: 3,
              borderRadius: 2,
              background: "rgba(60,38,8,0.75)",
              transform: "rotate(45deg)",
            }}
          />
        </div>
        {/* Fixed glowing notch at 12 o'clock */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "-5%",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 3,
            pointerEvents: "none",
            width: 0,
            height: 0,
            borderLeft: "12px solid transparent",
            borderRight: "12px solid transparent",
            borderTop: `17px solid ${notchColor}`,
            filter: `drop-shadow(0 0 7px ${notchColor})`,
            transition: "border-color 0.2s ease, filter 0.2s ease",
          }}
        />
        {showHint && <SpinHint />}
      </motion.div>
      {/* Name plate / LOCKED badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 14px",
          borderRadius: 999,
          background: seated ? "rgba(63,224,141,0.16)" : "rgba(0,0,0,0.3)",
          border: `2px solid ${seated ? "rgba(63,224,141,0.7)" : "rgba(217,171,82,0.45)"}`,
          transition: "background 0.25s ease, border-color 0.25s ease",
        }}
      >
        <PixIcon emoji={seated ? "✅" : ring.emoji} size={22} />
        <span
          style={{
            fontWeight: 900,
            letterSpacing: 1.5,
            fontSize: 14,
            color: seated ? "#5cf0a8" : GOLD,
          }}
        >
          {seated ? "LOCKED!" : ring.name}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Strength gauge + password preview                                   */
/* ------------------------------------------------------------------ */

function StrengthGauge({ count }: { count: number }) {
  const gold = count >= 3;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ fontSize: 12, fontWeight: 900, letterSpacing: 1.5, color: "#b9c3ea" }}>
        VAULT STRENGTH
      </span>
      <div style={{ display: "flex", gap: 6 }}>
        {[0, 1, 2].map((i) => {
          const lit = i < count;
          return (
            <motion.div
              key={i}
              animate={lit ? { scale: [1, 1.25, 1] } : { scale: 1 }}
              transition={{ duration: 0.4 }}
              style={{
                width: 44,
                height: 16,
                borderRadius: 8,
                background: !lit
                  ? "rgba(0,0,0,0.4)"
                  : gold
                    ? "linear-gradient(180deg, #ffe9a8 0%, #ffc94d 55%, #e0a12e 100%)"
                    : "linear-gradient(180deg, #7df0b2 0%, #2ec97f 100%)",
                border: `1px solid ${lit ? (gold ? "rgba(255,215,106,0.9)" : "rgba(63,224,141,0.8)") : "rgba(120,130,170,0.4)"}`,
                boxShadow: lit
                  ? gold
                    ? "0 0 14px rgba(255,201,77,0.7)"
                    : "0 0 10px rgba(63,224,141,0.5)"
                  : "inset 0 2px 4px rgba(0,0,0,0.5)",
              }}
            />
          );
        })}
      </div>
      <motion.span
        key={gold ? "gold" : count}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          fontSize: 14,
          fontWeight: 900,
          letterSpacing: 1,
          color: gold ? GOLD : "#8ef5bd",
          textShadow: gold ? "0 0 10px rgba(255,201,77,0.8)" : undefined,
        }}
      >
        {gold ? "GOLD!" : `${count}/3`}
      </motion.span>
    </div>
  );
}

function PasswordPlate({
  seated,
  gold,
}: {
  seated: Partial<Record<RingId, string>>;
  gold: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 16px",
        borderRadius: 14,
        background: "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.25) 100%)",
        border: `2px solid ${gold ? GOLD : "rgba(217,171,82,0.45)"}`,
        boxShadow: gold ? "0 0 18px rgba(255,201,77,0.5)" : undefined,
        transition: "border-color 0.3s ease, box-shadow 0.3s ease",
      }}
    >
      <PixIcon emoji="🔑" size={24} />
      <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: 1.5, color: "#b9c3ea" }}>
        YOUR PASSWORD
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {RINGS.map((ring) => {
          const value = seated[ring.id];
          return value !== undefined ? (
            <motion.span
              key={ring.id}
              initial={{ scale: 0.3, y: 8, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 18 }}
              style={{
                padding: "3px 8px",
                borderRadius: 8,
                background: gold
                  ? "linear-gradient(180deg, #ffe9a8 0%, #ffc94d 100%)"
                  : "linear-gradient(180deg, #7df0b2 0%, #2ec97f 100%)",
                color: gold ? "#4a3006" : "#053a22",
                fontWeight: 900,
                fontSize: 16,
              }}
            >
              {value}
            </motion.span>
          ) : (
            <span
              key={ring.id}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "3px 8px",
                borderRadius: 8,
                border: "2px dashed rgba(154,164,200,0.5)",
                color: "#8a93bd",
                fontWeight: 800,
                fontSize: 13,
              }}
            >
              <PixIcon emoji={ring.emoji} size={14} />?
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

type Phase = "play" | "opening" | "open";

export default function TumblerDials({ onComplete }: { onComplete: () => void }) {
  const reduceMotion = useReducedMotion();
  const [seated, setSeated] = useState<Partial<Record<RingId, string>>>({});
  const [phase, setPhase] = useState<Phase>("play");
  const [toast, setToast] = useState<{ id: number; kind: "good" | "bad"; text: string } | null>(
    null,
  );
  const [hasSpun, setHasSpun] = useState(false);

  const doneRef = useRef(false);
  const toastId = useRef(0);
  const toastTimer = useRef<number | undefined>(undefined);

  const seatedCount = RINGS.filter((r) => seated[r.id] !== undefined).length;
  const finalPassword = `${seated.word ?? ""}${seated.number ?? ""}${seated.symbol ?? ""}`;

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const showToast = (kind: "good" | "bad", text: string) => {
    window.clearTimeout(toastTimer.current);
    toastId.current += 1;
    setToast({ id: toastId.current, kind, text });
    toastTimer.current = window.setTimeout(() => setToast(null), kind === "bad" ? 3000 : 1800);
  };

  const handleSeat = (ring: RingDef, slot: DialSlot) => {
    setSeated((prev) => ({ ...prev, [ring.id]: slot.label }));
    showToast("good", `CLUNK! The ${ring.name} tumbler is locked!`);
  };

  const handleDecoy = (slot: DialSlot) => {
    showToast("bad", slot.teach ?? "The Raccoon guesses that one first!");
  };

  /* Win sequence: gold beat, door swings open, celebration, onComplete. */
  useEffect(() => {
    if (seatedCount < 3) return;
    const t1 = window.setTimeout(() => {
      setToast(null);
      setPhase("opening");
    }, 850);
    const t2 = window.setTimeout(() => setPhase("open"), 1900);
    const t3 = window.setTimeout(() => {
      if (doneRef.current) return;
      doneRef.current = true;
      onComplete();
    }, 5300);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seatedCount]);

  return (
    <ExerciseFrame padding={24}>
      <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Header */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "clamp(20px, 3vw, 30px)",
              fontWeight: 900,
              letterSpacing: 2,
              color: GOLD,
              textShadow: "0 2px 12px rgba(255,201,77,0.35)",
            }}
          >
            THE TUMBLER DIALS
          </div>
          <div style={{ marginTop: 4, fontSize: "clamp(13px, 1.6vw, 16px)", color: "#c6cef2" }}>
            {seatedCount >= 3
              ? "GOLD! Every tumbler is locked. The vault is opening!"
              : "Spin each dial until the glowing notch points at a STRONG choice. Lock all three tumblers to open the vault!"}
          </div>
        </div>

        {/* Password preview + strength gauge */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px 24px",
          }}
        >
          <PasswordPlate seated={seated} gold={seatedCount >= 3} />
          <StrengthGauge count={seatedCount} />
        </div>

        {/* Vault door with the three dials */}
        <div style={{ position: "relative", perspective: 1300 }}>
          {/* Light burst behind the swinging door */}
          {phase !== "play" && (
            <motion.div
              aria-hidden
              initial={{ scale: 0.1, opacity: 0 }}
              animate={{ scale: 2.2, opacity: 1 }}
              transition={{ duration: 1.1, ease: "easeOut" }}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                x: "-50%",
                y: "-50%",
                width: 340,
                height: 340,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(255,231,150,0.95) 0%, rgba(255,196,86,0.5) 40%, transparent 70%)",
                zIndex: 0,
                pointerEvents: "none",
              }}
            />
          )}
          <motion.div
            animate={
              phase === "play"
                ? { rotateY: 0, opacity: 1 }
                : reduceMotion
                  ? { rotateY: 0, opacity: 0 }
                  : { rotateY: -74, x: "-4%", opacity: 0.12 }
            }
            transition={{ duration: 1, ease: [0.55, 0.06, 0.35, 1] }}
            style={{
              transformOrigin: "0% 50%",
              position: "relative",
              zIndex: 1,
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "flex-start",
              gap: "clamp(10px, 2vw, 26px)",
              padding: "clamp(16px, 2.5vw, 28px)",
              borderRadius: 22,
              background: "linear-gradient(155deg, #454f6f 0%, #2b3352 55%, #232a47 100%)",
              border: "3px solid rgba(217,171,82,0.5)",
              boxShadow:
                "inset 0 2px 8px rgba(255,255,255,0.12), inset 0 -6px 16px rgba(0,0,0,0.35), 0 14px 34px rgba(0,0,0,0.4)",
            }}
          >
            {/* Corner rivets on the door */}
            {[
              { top: 10, left: 10 },
              { top: 10, right: 10 },
              { bottom: 10, left: 10 },
              { bottom: 10, right: 10 },
            ].map((pos, i) => (
              <div
                key={i}
                aria-hidden
                style={{
                  position: "absolute",
                  ...pos,
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle at 35% 30%, #f2d891 0%, #a9782f 55%, #6a4514 100%)",
                  boxShadow: "inset 0 -1px 2px rgba(0,0,0,0.5)",
                }}
              />
            ))}
            {RINGS.map((ring, i) => (
              <BrassDial
                key={ring.id}
                ring={ring}
                startRotation={START_ROTATION[ring.id]}
                seatedLabel={seated[ring.id] ?? null}
                disabled={phase !== "play"}
                showHint={i === 0 && !hasSpun && seated.word === undefined}
                onFirstTouch={() => setHasSpun(true)}
                onSeat={(slot) => handleSeat(ring, slot)}
                onDecoy={handleDecoy}
              />
            ))}
          </motion.div>
        </div>

        {/* Feedback toast (fixed height so the board never jumps) */}
        <div
          style={{
            minHeight: 48,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <AnimatePresence mode="wait">
            {toast && phase === "play" && (
              <motion.div
                key={toast.id}
                initial={{ y: 10, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -8, opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 18px",
                  borderRadius: 999,
                  fontWeight: 800,
                  fontSize: "clamp(13px, 1.6vw, 16px)",
                  background:
                    toast.kind === "bad" ? "rgba(255,93,93,0.16)" : "rgba(63,224,141,0.16)",
                  border: `2px solid ${toast.kind === "bad" ? "rgba(255,93,93,0.7)" : "rgba(63,224,141,0.7)"}`,
                  color: toast.kind === "bad" ? "#ffb3b3" : "#8ef5bd",
                }}
              >
                <PixIcon emoji={toast.kind === "bad" ? "🦝" : "✅"} size={26} />
                <span>{toast.text}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Celebration overlay */}
        {phase === "open" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{
              position: "absolute",
              inset: -24,
              zIndex: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "radial-gradient(circle at 50% 42%, rgba(56,44,12,0.55) 0%, rgba(10,14,34,0.9) 68%)",
            }}
          >
            {/* Floating sparkles */}
            {[
              { left: "16%", top: "22%", delay: 0 },
              { left: "80%", top: "18%", delay: 0.4 },
              { left: "12%", top: "68%", delay: 0.8 },
              { left: "84%", top: "64%", delay: 1.2 },
            ].map((s, i) => (
              <motion.div
                key={i}
                aria-hidden
                style={{ position: "absolute", left: s.left, top: s.top }}
                animate={{ y: [0, -26], opacity: [0, 1, 0] }}
                transition={{
                  duration: 1.8,
                  delay: s.delay,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              >
                <PixIcon emoji="✨" size={26} />
              </motion.div>
            ))}
            <motion.div
              initial={{ scale: 0.4, y: 26, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.1 }}
              style={{ textAlign: "center", padding: 20, maxWidth: 460 }}
            >
              <PixIcon emoji="🔓" size={90} />
              <div
                style={{
                  marginTop: 8,
                  fontSize: "clamp(26px, 4vw, 40px)",
                  fontWeight: 900,
                  letterSpacing: 2,
                  color: GOLD,
                  textShadow: "0 0 22px rgba(255,201,77,0.7)",
                }}
              >
                VAULT OPEN!
              </div>
              <div
                style={{
                  display: "inline-block",
                  marginTop: 12,
                  padding: "10px 22px",
                  borderRadius: 14,
                  background: "linear-gradient(180deg, #ffe9a8 0%, #ffc94d 55%, #e0a12e 100%)",
                  color: "#4a3006",
                  fontWeight: 900,
                  fontSize: "clamp(20px, 3vw, 28px)",
                  letterSpacing: 1,
                  boxShadow: "0 0 26px rgba(255,201,77,0.6)",
                }}
              >
                {finalPassword}
              </div>
              <div style={{ marginTop: 12, fontSize: "clamp(14px, 1.8vw, 17px)", color: "#dfe5ff" }}>
                A word + a number + a symbol. The Raccoon could guess for YEARS and never crack it!
              </div>
              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.4 + i * 0.15 }}
                  >
                    <PixIcon emoji={i === 1 ? "🏆" : "⭐"} size={i === 1 ? 48 : 36} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </ExerciseFrame>
  );
}
