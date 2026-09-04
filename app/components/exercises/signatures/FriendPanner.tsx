"use client";

/*
 * THE FRIEND PANNER - Week 17 signature exercise (Social Media).
 *
 * Gold-rush fantasy on The Feed: a glittering river rushes past and a
 * counter brags "100 FOLLOWERS!". The child scoops a gold-pan in and
 * SHAKES it (rapid wiggle-drag or repeated taps). With every shake,
 * grey STRANGER pebbles bounce and fall through the mesh while the
 * brag counter tumbles. What settles is a handful of GOLD nuggets,
 * faces the child actually knows in real life, plus two pieces of
 * FOOL'S GOLD ("SuperFan2000, says nice things!"). Tapping a fool's
 * gold piece asks ONE question: "Do you know them OFF the screen?"
 * A "No" flips it to grey gravel; choosing to keep it just crumbles
 * it red with a gentle teach. Nothing is failable. Final act: set the
 * profile shield to "Just my gold" (friends only) -> green -> win.
 *
 * The lesson IS the mechanic: watching 100 shrink to 4 makes
 * "the count was never the treasure" land, and the shield turns the
 * feeling into an action.
 *
 * Pure DOM + framer-motion (no canvas): ~30 absolutely-positioned
 * pebble nodes inside the pan, spring-ish bounces via shared
 * animation controls, shake detection from pointer wiggle + taps.
 */

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useAnimationControls,
  type Variants,
} from "framer-motion";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import PixIcon from "@/app/components/lesson/PixIcon";
import { useGameAudio } from "@/app/lib/gameEngine/useGameAudio";

/* ────────────────────────── constants ────────────────────────── */

const GREY_COUNT = 24;
const TOTAL_PEBBLES = 30; // 24 grey + 4 gold + 2 fool's gold
const FOLLOWERS_START = 100;
const REAL_FRIENDS = 4;

const BURST_SIZE = 3; // grey pebbles shed per shake burst
const BURST_COOLDOWN_MS = 300;
const FALL_MS = 900;
const CRUMBLE_MS = 950;
const MODAL_FEEDBACK_MS = 2100;
const WIN_DELAY_MS = 3400;

const GOLD_FRIENDS = [
  { name: "Maya", sub: "from school" },
  { name: "Leo", sub: "next door" },
  { name: "Nana", sub: "family" },
  { name: "Sam", sub: "soccer team" },
];
const FOOL_GOLD = [
  { name: "SuperFan2000", sub: "says nice things!" },
  { name: "GamerBuddy99", sub: "sends 100 hearts!" },
];
// Spiral slots reserved for the special pebbles (spread apart).
const GOLD_AT = [3, 10, 17, 25];
const FOOL_AT = [7, 21];

const CONFETTI_COLORS = [
  "#ffd166",
  "#7df0ff",
  "#ff6b6b",
  "#8bffb0",
  "#c9a7ff",
  "#fff3d6",
];

type Phase = "intro" | "shake" | "inspect" | "shield" | "win";
type PebbleKind = "grey" | "gold" | "fool";
type PebbleStatus = "in" | "falling" | "crumbling" | "gone";

interface Pebble {
  id: number;
  kind: PebbleKind;
  /** Position inside the mesh, percent coordinates. */
  x: number;
  y: number;
  size: number;
  /** Lightness variance for grey pebbles. */
  tone: number;
  /** Irregular border-radius so no two pebbles look stamped. */
  radius: string;
  label?: string;
  sub?: string;
  status: PebbleStatus;
  /** Fool's gold that has been flipped to plain grey gravel. */
  gravel?: boolean;
  /** Fool's gold already answered (leaves the follower count). */
  resolved?: boolean;
}

interface FoolModalState {
  id: number;
  name: string;
  sub: string;
  answered: "no" | "keep" | null;
}

/* ─────────────────────────── helpers ─────────────────────────── */

/** Deterministic 0..1 noise so layout is stable across renders. */
function prand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function makePebbles(): Pebble[] {
  const out: Pebble[] = [];
  let goldIdx = 0;
  let foolIdx = 0;
  for (let i = 0; i < TOTAL_PEBBLES; i++) {
    // Golden-angle spiral keeps ~30 pebbles evenly packed in the pan.
    const r = Math.sqrt((i + 0.5) / TOTAL_PEBBLES);
    const th = i * 2.39996;
    const x = 50 + r * 37 * Math.cos(th) + (prand(i * 3 + 1) - 0.5) * 6;
    const y = 52 + r * 30 * Math.sin(th) + (prand(i * 3 + 2) - 0.5) * 8;

    const isGold = GOLD_AT.includes(i);
    const isFool = FOOL_AT.includes(i);
    const kind: PebbleKind = isGold ? "gold" : isFool ? "fool" : "grey";

    const a = 44 + Math.round(prand(i * 9 + 3) * 12);
    const b = 44 + Math.round(prand(i * 9 + 4) * 12);
    const c = 44 + Math.round(prand(i * 9 + 5) * 12);
    const d = 44 + Math.round(prand(i * 9 + 6) * 12);

    let label: string | undefined;
    let sub: string | undefined;
    if (isGold) {
      label = GOLD_FRIENDS[goldIdx].name;
      sub = GOLD_FRIENDS[goldIdx].sub;
      goldIdx++;
    } else if (isFool) {
      label = FOOL_GOLD[foolIdx].name;
      sub = FOOL_GOLD[foolIdx].sub;
      foolIdx++;
    }

    out.push({
      id: i,
      kind,
      x: Math.min(88, Math.max(12, x)),
      y: Math.min(84, Math.max(18, y)),
      size: kind === "grey" ? 30 + Math.round(prand(i * 5 + 7) * 12) : 46,
      tone: 40 + Math.round(prand(i * 5 + 8) * 20),
      radius: `${a}% ${100 - a}% ${b}% ${100 - b}% / ${c}% ${d}% ${100 - d}% ${100 - c}%`,
      label,
      sub,
      status: "in",
    });
  }
  return out;
}

/** Every pebble still sitting in the pan hops on each shake burst. */
const pebbleBounce: Variants = {
  bounce: (i: number) => ({
    y: [0, -(9 + ((i * 13) % 15)), 0],
    transition: {
      duration: 0.38,
      delay: ((i * 7) % 5) * 0.03,
      ease: "easeOut",
    },
  }),
};

/* ───────────────────── tiny SVG pebble faces ─────────────────── */

function StrangerSilhouette() {
  return (
    <svg viewBox="0 0 40 40" style={{ width: "62%", height: "62%" }}>
      <circle cx={20} cy={13} r={7} fill="rgba(24, 28, 44, 0.55)" />
      <path
        d="M6 36 a14 11 0 0 1 28 0 Z"
        fill="rgba(24, 28, 44, 0.55)"
      />
    </svg>
  );
}

function FriendFace() {
  return (
    <svg viewBox="0 0 40 40" style={{ width: "66%", height: "66%" }}>
      <circle cx={14} cy={16} r={2.6} fill="#6b4a00" />
      <circle cx={26} cy={16} r={2.6} fill="#6b4a00" />
      <path
        d="M12 24 q8 8 16 0"
        fill="none"
        stroke="#6b4a00"
        strokeWidth={3}
        strokeLinecap="round"
      />
    </svg>
  );
}

function FoolFace() {
  return (
    <svg viewBox="0 0 40 40" style={{ width: "70%", height: "70%" }}>
      {/* too-cool star sunglasses: shiny, but you cannot see the eyes */}
      <path
        d="M13 15 l1.6 3.4 3.6.3 -2.7 2.4 .8 3.5 -3.3-1.9 -3.3 1.9 .8-3.5 -2.7-2.4 3.6-.3 Z"
        fill="#3a3216"
      />
      <path
        d="M27 15 l1.6 3.4 3.6.3 -2.7 2.4 .8 3.5 -3.3-1.9 -3.3 1.9 .8-3.5 -2.7-2.4 3.6-.3 Z"
        fill="#3a3216"
      />
      <path
        d="M14 30 q6 5 12 0"
        fill="none"
        stroke="#3a3216"
        strokeWidth={3}
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ─────────────────────────── component ───────────────────────── */

export default function FriendPanner({
  onComplete,
  narration,
  accent,
}: {
  onComplete: () => void;
  narration?: { speaker?: "adam" | "layla"; lines: string[] };
  accent?: string;
}) {
  const audio = useGameAudio();
  const [phase, setPhase] = useState<Phase>("intro");
  const [pebbles, setPebbles] = useState<Pebble[]>(makePebbles);
  const [hasShaken, setHasShaken] = useState(false);
  const [modal, setModal] = useState<FoolModalState | null>(null);
  const [foolsDone, setFoolsDone] = useState(0);
  const [shieldMsg, setShieldMsg] = useState<string | null>(null);
  const [shieldOn, setShieldOn] = useState(false);

  const panCtrl = useAnimationControls();
  const pebbleCtrl = useAnimationControls();
  const everyoneCtrl = useAnimationControls();

  const phaseRef = useRef<Phase>("intro");
  const completedRef = useRef(false);
  const lastBurstRef = useRef(0);
  const timersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const shakeRef = useRef({
    active: false,
    lastX: 0,
    prevDx: 0,
    dist: 0,
    revs: 0,
    moved: 0,
    downT: 0,
  });

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const t of timers) clearTimeout(t);
    };
  }, []);

  const later = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timersRef.current.push(t);
  };

  const patchPebble = (id: number, patch: Partial<Pebble>) => {
    setPebbles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
    );
  };

  /* ── derived counts ── */
  const greysIn = pebbles.filter(
    (p) => p.kind === "grey" && p.status === "in"
  ).length;
  const foolsIn = pebbles.filter(
    (p) => p.kind === "fool" && p.status === "in" && !p.resolved
  ).length;
  const followers =
    phase === "intro"
      ? FOLLOWERS_START
      : REAL_FRIENDS +
        foolsIn +
        Math.round(greysIn * ((FOLLOWERS_START - 6) / GREY_COUNT));

  /* ── shake bursts: pan wiggle + pebble hop + shed 3 greys ── */
  const doBurst = () => {
    if (phaseRef.current !== "shake") return;
    const now = performance.now();
    if (now - lastBurstRef.current < BURST_COOLDOWN_MS) return;
    lastBurstRef.current = now;
    setHasShaken(true);
    // One thunk per shake burst (cooldown-gated above, never per pointermove).
    audio.drop();

    void panCtrl.start({
      rotate: [0, -4, 4, -3, 3, 0],
      x: [0, -9, 9, -6, 6, 0],
      transition: { duration: 0.42, ease: "easeInOut" },
    });
    void pebbleCtrl.start("bounce");

    const dropped: number[] = [];
    setPebbles((prev) => {
      const targets = prev
        .filter((p) => p.kind === "grey" && p.status === "in")
        .sort((a, b) => prand(a.id * 7.3) - prand(b.id * 7.3))
        .slice(0, BURST_SIZE);
      for (const t of targets) {
        if (!dropped.includes(t.id)) dropped.push(t.id);
      }
      return prev.map((p) =>
        dropped.includes(p.id) ? { ...p, status: "falling" as const } : p
      );
    });
    later(() => {
      setPebbles((prev) =>
        prev.map((p) =>
          dropped.includes(p.id) && p.status === "falling"
            ? { ...p, status: "gone" as const }
            : p
        )
      );
    }, FALL_MS);
  };

  /* ── pan empties of greys -> detective time ── */
  useEffect(() => {
    if (phase === "shake" && greysIn === 0) {
      later(() => {
        if (phaseRef.current === "shake") setPhase("inspect");
      }, 1000);
    }
  }, [phase, greysIn]);

  /* ── both fool's gold pieces resolved -> shield time ── */
  useEffect(() => {
    if (phase === "inspect" && foolsDone >= FOOL_GOLD.length) {
      later(() => {
        if (phaseRef.current === "inspect") setPhase("shield");
      }, 1500);
    }
  }, [phase, foolsDone]);

  /* ── shake detection: wiggle-drag or repeated taps ── */
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (phaseRef.current !== "shake") return;
    const s = shakeRef.current;
    s.active = true;
    s.lastX = e.clientX;
    s.prevDx = 0;
    s.dist = 0;
    s.revs = 0;
    s.moved = 0;
    s.downT = performance.now();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* pointer capture is best-effort */
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = shakeRef.current;
    if (!s.active) return;
    const dx = e.clientX - s.lastX;
    s.lastX = e.clientX;
    const step = Math.abs(dx);
    s.moved += step;
    s.dist += step;
    if (dx * s.prevDx < 0 && step > 3) s.revs += 1;
    if (step > 3) s.prevDx = dx;
    // A couple of direction flips OR a decent scrub = one shake burst.
    if (s.revs >= 2 || s.dist > 150) {
      s.revs = 0;
      s.dist = 0;
      doBurst();
    }
  };

  const handlePointerUp = () => {
    const s = shakeRef.current;
    if (!s.active) return;
    s.active = false;
    // Quick tap with barely any movement also shakes. Forgiving!
    if (s.moved < 16 && performance.now() - s.downT < 450) doBurst();
  };

  /* ── fool's gold question ── */
  const handleFoolTap = (p: Pebble) => {
    if (phaseRef.current !== "inspect" || modal || p.resolved) return;
    if (p.kind !== "fool" || p.status !== "in") return;
    audio.tap();
    setModal({ id: p.id, name: p.label ?? "", sub: p.sub ?? "", answered: null });
  };

  const answerFool = (answer: "no" | "keep") => {
    if (!modal || modal.answered) return;
    const id = modal.id;
    if (answer === "no") audio.correct();
    else audio.wrong();
    setModal({ ...modal, answered: answer });
    patchPebble(id, { resolved: true });
    later(() => {
      setModal(null);
      if (answer === "no") {
        // Flip to grey gravel, then let it fall through the mesh.
        patchPebble(id, { gravel: true });
        later(() => patchPebble(id, { status: "falling" }), 550);
        later(() => patchPebble(id, { status: "gone" }), 550 + FALL_MS);
      } else {
        // Kept it? It crumbles red in the pan. Gentle teach, no fail.
        patchPebble(id, { status: "crumbling" });
        later(() => patchPebble(id, { status: "gone" }), CRUMBLE_MS);
      }
      setFoolsDone((d) => d + 1);
    }, MODAL_FEEDBACK_MS);
  };

  /* ── the profile shield ── */
  const chooseEveryone = () => {
    if (phaseRef.current !== "shield") return;
    audio.wrong();
    setShieldMsg("Then strangers can scoop YOU into their pan! Try the other one.");
    void everyoneCtrl.start({
      x: [0, -9, 9, -6, 6, 0],
      transition: { duration: 0.45 },
    });
  };

  const chooseGold = () => {
    if (phaseRef.current !== "shield" || shieldOn) return;
    audio.correct();
    setShieldOn(true);
    setShieldMsg(null);
    later(() => {
      audio.unlock();
      setPhase("win");
      later(() => {
        if (!completedRef.current) {
          completedRef.current = true;
          onComplete();
        }
      }, WIN_DELAY_MS);
    }, 800);
  };

  /* ── copy per phase ── */
  let hintText = "";
  let hintColor = "#e7ecff";
  if (phase === "shake") {
    if (!hasShaken) {
      hintText = "Grab the pan and SHAKE! Wiggle it fast, or tap tap tap!";
    } else if (greysIn > 12) {
      hintText = "Grey pebbles are strangers. Shake them through the mesh!";
    } else if (greysIn > 0) {
      hintText = "Keep going! Only REAL gold stays in a pan.";
      hintColor = "#ffd166";
    } else {
      hintText = "Whoa... look what is left. Shiny!";
      hintColor = "#ffd166";
    }
  } else if (phase === "inspect") {
    hintText =
      foolsDone === 0
        ? "Detective time! Tap each nugget with a ? to check it."
        : foolsDone < FOOL_GOLD.length
          ? "One more sparkly nugget to check!"
          : "All checked. Real gold only!";
    hintColor = "#7df0ff";
  } else if (phase === "shield") {
    hintText = "Last step, hero! Who should see your pan?";
    hintColor = "#7df0ff";
  } else if (phase === "win") {
    hintText = "The count was never the treasure. YOU knew the real gold!";
    hintColor = "#8bffb0";
  }

  /* ── counter pill styling ── */
  const counterIsBrag = followers > 6;
  const counterText =
    phase === "shield" || phase === "win"
      ? "4 REAL FRIENDS"
      : counterIsBrag
        ? `${followers} FOLLOWERS!`
        : `${followers} left in the pan...`;
  const counterColor =
    phase === "shield" || phase === "win"
      ? "#8bffb0"
      : counterIsBrag
        ? "#ffd166"
        : "#c9a7ff";

  /* ────────────────────────── render ────────────────────────── */
  return (
    <ExerciseFrame padding={24} touchActionNone>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          maxWidth: 760,
          margin: "0 auto",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: 1.5,
                color: "#ffd166",
                textShadow: "0 0 18px rgba(255, 180, 80, 0.35)",
              }}
            >
              THE FRIEND PANNER
            </div>
            <div style={{ fontSize: 13, opacity: 0.75 }}>
              Pan the Feed river. Keep only the real gold.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(0, 0, 0, 0.25)",
              padding: "8px 14px",
              borderRadius: 999,
            }}
          >
            <PixIcon emoji={counterIsBrag && phase !== "win" ? "✨" : "⭐"} size={22} />
            <motion.span
              key={counterText}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              style={{
                fontSize: 14,
                fontWeight: 900,
                letterSpacing: 1,
                color: counterColor,
              }}
            >
              {counterText}
            </motion.span>
          </div>
        </div>

        {/* ── The river stage ── */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{
            position: "relative",
            width: "100%",
            height: 360,
            borderRadius: 16,
            overflow: "hidden",
            touchAction: "none",
            cursor: phase === "shake" ? "grab" : "default",
            background:
              "linear-gradient(180deg, #101838 0%, #16225a 34%, #1b3a6e 46%, #14304f 62%, #241b3f 100%)",
            boxShadow:
              "inset 0 0 24px rgba(0, 0, 0, 0.45), 0 0 0 2px rgba(125, 240, 255, 0.16)",
          }}
        >
          {/* Glittering Feed river band */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: "24%",
              height: "22%",
              background:
                "linear-gradient(180deg, rgba(60, 140, 220, 0.55), rgba(70, 180, 235, 0.6) 50%, rgba(45, 110, 190, 0.5))",
              boxShadow: "0 0 30px rgba(90, 190, 255, 0.3)",
            }}
          />
          {/* drifting glitter in the current */}
          <motion.div
            aria-hidden
            animate={{ x: [0, 46] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
            style={{
              position: "absolute",
              left: -60,
              right: -60,
              top: "26%",
              height: "8%",
              backgroundImage:
                "repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.22) 0 10px, transparent 10px 46px)",
              opacity: 0.5,
              pointerEvents: "none",
            }}
          />
          <motion.div
            aria-hidden
            animate={{ x: [0, -38] }}
            transition={{ duration: 3.1, repeat: Infinity, ease: "linear" }}
            style={{
              position: "absolute",
              left: -60,
              right: -60,
              top: "36%",
              height: "7%",
              backgroundImage:
                "repeating-linear-gradient(90deg, rgba(255, 240, 190, 0.2) 0 8px, transparent 8px 38px)",
              opacity: 0.5,
              pointerEvents: "none",
            }}
          />
          {/* twinkling sparkles on the water */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={`spark-${i}`}
              aria-hidden
              animate={{ opacity: [0.15, 0.9, 0.15], scale: [0.7, 1.2, 0.7] }}
              transition={{
                duration: 1.6 + prand(i * 11 + 2),
                repeat: Infinity,
                delay: prand(i * 11 + 4) * 1.4,
              }}
              style={{
                position: "absolute",
                left: `${8 + prand(i * 11 + 6) * 84}%`,
                top: `${26 + prand(i * 11 + 8) * 16}%`,
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#fff3d6",
                boxShadow: "0 0 10px 3px rgba(255, 240, 200, 0.6)",
                pointerEvents: "none",
              }}
            />
          ))}
          {/* THE FEED tag */}
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 14,
              display: "flex",
              alignItems: "center",
              gap: 7,
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 3,
              color: "#7df0ff",
              opacity: 0.85,
            }}
          >
            <PixIcon emoji="💬" size={18} />
            THE FEED RIVER
          </div>

          {/* ── The gold pan ── */}
          <motion.div
            animate={panCtrl}
            style={{
              position: "absolute",
              left: "50%",
              top: 92,
              width: "min(480px, 84%)",
              height: 226,
              marginLeft: "min(-240px, -42%)",
              zIndex: 2,
            }}
          >
            {/* handle */}
            <div
              style={{
                position: "absolute",
                right: -46,
                top: "42%",
                width: 62,
                height: 22,
                borderRadius: 12,
                background: "linear-gradient(180deg, #8d93a8, #565c73)",
                border: "2px solid #3d4257",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.35)",
              }}
            />
            {/* pan body */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50% / 58% 58% 46% 46%",
                background: "linear-gradient(180deg, #9aa1b6 0%, #5a6075 70%, #464b60 100%)",
                border: "4px solid #3d4257",
                boxShadow: shieldOn
                  ? "inset 0 10px 24px rgba(0, 0, 0, 0.45), 0 0 0 4px rgba(107, 255, 158, 0.75), 0 0 34px rgba(107, 255, 158, 0.45)"
                  : "inset 0 10px 24px rgba(0, 0, 0, 0.45), 0 10px 22px rgba(0, 0, 0, 0.4)",
              }}
            />
            {/* mesh floor (the holes strangers fall through) */}
            <div
              style={{
                position: "absolute",
                inset: "16px 22px 20px 22px",
                borderRadius: "50% / 55%",
                background: "#6a7188",
                backgroundImage:
                  "radial-gradient(circle, rgba(18, 22, 40, 0.55) 2.6px, transparent 3.4px)",
                backgroundSize: "20px 17px",
                boxShadow: "inset 0 6px 16px rgba(0, 0, 0, 0.4)",
              }}
            />

            {/* pebbles */}
            <div style={{ position: "absolute", inset: "16px 22px 20px 22px" }}>
              {pebbles
                .filter((p) => p.status !== "gone")
                .map((p) => {
                  const looksGrey = p.kind === "grey" || p.gravel;
                  const isFoolLive =
                    p.kind === "fool" && !p.gravel && p.status === "in";
                  const showLabel =
                    (p.kind === "gold" || isFoolLive) &&
                    (phase === "inspect" ||
                      phase === "shield" ||
                      phase === "win");
                  const tappable = isFoolLive && phase === "inspect" && !p.resolved;

                  const outerAnim =
                    p.status === "falling"
                      ? {
                          y: 250,
                          opacity: 0,
                          rotate: p.id % 2 === 0 ? 60 : -55,
                        }
                      : p.status === "crumbling"
                        ? {
                            scale: [1, 1.2, 0.55, 0],
                            rotate: [0, -12, 12, 0],
                            opacity: [1, 1, 0.7, 0],
                          }
                        : { y: 0, opacity: 1 };
                  const outerTrans =
                    p.status === "falling"
                      ? { duration: 0.85, ease: "easeIn" as const }
                      : p.status === "crumbling"
                        ? { duration: 0.9, ease: "easeOut" as const }
                        : { duration: 0.3 };

                  const bg = looksGrey
                    ? `radial-gradient(circle at 35% 30%, hsl(222 8% ${p.tone + 16}%), hsl(222 10% ${p.tone}%))`
                    : p.kind === "gold"
                      ? "radial-gradient(circle at 35% 30%, #ffe9a8, #f0b429 62%, #c98a1e)"
                      : "radial-gradient(circle at 35% 30%, #f8ffb8, #ddc832 62%, #9a8f1c)";

                  return (
                    <motion.div
                      key={p.id}
                      animate={outerAnim}
                      transition={outerTrans}
                      onClick={() => handleFoolTap(p)}
                      style={{
                        position: "absolute",
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: p.size,
                        height: p.size * 0.88,
                        marginLeft: -p.size / 2,
                        marginTop: (-p.size * 0.88) / 2,
                        zIndex: looksGrey ? 3 : 4,
                        cursor: tappable ? "pointer" : "inherit",
                        pointerEvents: tappable ? "auto" : "none",
                      }}
                    >
                      {/* hop layer, driven by shared shake controls */}
                      <motion.div
                        variants={pebbleBounce}
                        custom={p.id}
                        animate={pebbleCtrl}
                        style={{ width: "100%", height: "100%" }}
                      >
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: p.radius,
                            background:
                              p.status === "crumbling"
                                ? "radial-gradient(circle at 35% 30%, #b8747a, #7d4a52)"
                                : bg,
                            border: looksGrey
                              ? "2px solid rgba(10, 14, 28, 0.3)"
                              : "2px solid rgba(120, 80, 0, 0.4)",
                            boxShadow:
                              p.status === "crumbling"
                                ? "0 0 16px rgba(255, 90, 90, 0.7)"
                                : looksGrey
                                  ? "0 3px 6px rgba(0, 0, 0, 0.35)"
                                  : "0 0 14px rgba(255, 200, 80, 0.55), 0 3px 6px rgba(0, 0, 0, 0.35)",
                          }}
                        >
                          {looksGrey ? (
                            <StrangerSilhouette />
                          ) : p.kind === "gold" ? (
                            <FriendFace />
                          ) : (
                            <FoolFace />
                          )}
                        </div>

                        {/* glint on gold + fool's gold */}
                        {!looksGrey && p.status === "in" && (
                          <motion.span
                            aria-hidden
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              delay: prand(p.id * 13 + 1) * 1.5,
                            }}
                            style={{
                              position: "absolute",
                              top: "16%",
                              left: "20%",
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: "#ffffff",
                              boxShadow: "0 0 8px 2px rgba(255, 255, 255, 0.8)",
                              pointerEvents: "none",
                            }}
                          />
                        )}

                        {/* ? badge + pulsing tap ring on unchecked fool's gold */}
                        {tappable && (
                          <>
                            <div
                              style={{
                                position: "absolute",
                                top: -8,
                                right: -8,
                                width: 22,
                                height: 22,
                                borderRadius: "50%",
                                background: "#7b2ff0",
                                color: "#fff",
                                fontSize: 14,
                                fontWeight: 900,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.4)",
                              }}
                            >
                              ?
                            </div>
                            <motion.div
                              aria-hidden
                              animate={{
                                scale: [1, 1.35, 1],
                                opacity: [0.7, 0.15, 0.7],
                              }}
                              transition={{ duration: 1.2, repeat: Infinity }}
                              style={{
                                position: "absolute",
                                inset: -8,
                                borderRadius: "50%",
                                border: "3px dashed rgba(201, 167, 255, 0.9)",
                                pointerEvents: "none",
                              }}
                            />
                          </>
                        )}

                        {/* name chip once the crowd is gone */}
                        <AnimatePresence>
                          {showLabel && (
                            <motion.div
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              style={{
                                position: "absolute",
                                top: "104%",
                                left: "50%",
                                transform: "translateX(-50%)",
                                background: isFoolLive
                                  ? "rgba(123, 47, 240, 0.85)"
                                  : "rgba(20, 90, 50, 0.85)",
                                color: "#fff",
                                fontSize: 10,
                                fontWeight: 800,
                                padding: "3px 8px",
                                borderRadius: 999,
                                whiteSpace: "nowrap",
                                pointerEvents: "none",
                              }}
                            >
                              {p.label}
                              {p.kind === "gold" && p.sub ? ` · ${p.sub}` : ""}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </motion.div>
                  );
                })}
            </div>

            {/* shield badge once friends-only is on */}
            <AnimatePresence>
              {shieldOn && (
                <motion.div
                  key="pan-shield"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 18 }}
                  style={{
                    position: "absolute",
                    left: "50%",
                    bottom: -14,
                    transform: "translateX(-50%)",
                    zIndex: 6,
                  }}
                >
                  <PixIcon emoji="🛡️" size={46} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Pulsing shake hint until the first burst */}
          <AnimatePresence>
            {phase === "shake" && !hasShaken && (
              <motion.div
                key="shake-hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, x: [0, -26, 26, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "48%",
                  marginLeft: -34,
                  width: 68,
                  height: 68,
                  borderRadius: "50%",
                  background: "rgba(255, 214, 110, 0.22)",
                  border: "3px dashed rgba(255, 214, 110, 0.8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                  zIndex: 5,
                }}
              >
                <PixIcon emoji="👆" size={36} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Win banner + confetti over the stage */}
          <AnimatePresence>
            {phase === "win" && (
              <motion.div
                key="win-banner"
                initial={{ y: -70, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 380, damping: 20 }}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "6%",
                  x: "-50%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "linear-gradient(180deg, #2ecc71 0%, #1f8a4c 100%)",
                  color: "#ffffff",
                  fontSize: 22,
                  fontWeight: 900,
                  letterSpacing: 2,
                  padding: "10px 24px",
                  borderRadius: 999,
                  border: "3px solid rgba(255, 255, 255, 0.75)",
                  boxShadow: "0 10px 26px rgba(20, 90, 50, 0.55)",
                  whiteSpace: "nowrap",
                  zIndex: 8,
                }}
              >
                <PixIcon emoji="✅" size={26} />
                REAL TREASURE FOUND!
              </motion.div>
            )}
          </AnimatePresence>
          {phase === "win" &&
            Array.from({ length: 20 }, (_, i) => (
              <motion.div
                key={`confetti-${i}`}
                aria-hidden
                initial={{ y: -30, opacity: 1, rotate: 0 }}
                animate={{
                  y: 400,
                  opacity: [1, 1, 0],
                  rotate: prand(i * 3 + 1) > 0.5 ? 340 : -340,
                }}
                transition={{
                  duration: 1.7 + prand(i * 3 + 2) * 1.1,
                  delay: prand(i * 3 + 3) * 0.6,
                  ease: "easeIn",
                }}
                style={{
                  position: "absolute",
                  left: `${5 + prand(i * 3 + 4) * 90}%`,
                  top: 0,
                  width: 9 + prand(i * 3 + 5) * 6,
                  height: 7 + prand(i * 3 + 6) * 5,
                  background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                  borderRadius: 2,
                  pointerEvents: "none",
                  zIndex: 7,
                }}
              />
            ))}

          {/* ── Intro overlay ── */}
          <AnimatePresence>
            {phase === "intro" && (
              <motion.div
                key="intro"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  // `safe center` + scroll: with the spoken-instruction block the
                  // column can outgrow the 360px stage; plain `center` would clip
                  // BOTH ends (stage is overflow:hidden) and strand the button.
                  justifyContent: "safe center",
                  overflowY: "auto",
                  gap: 10,
                  textAlign: "center",
                  padding: 24,
                  zIndex: 10,
                  background:
                    "radial-gradient(circle at 50% 30%, rgba(30, 50, 110, 0.92) 0%, rgba(12, 16, 44, 0.96) 75%)",
                }}
              >
                <PixIcon emoji="✨" size={48} />
                <div
                  style={{
                    fontSize: "clamp(26px, 6vw, 36px)",
                    fontWeight: 900,
                    letterSpacing: 1,
                    color: "#ffd166",
                    textShadow: "0 0 24px rgba(255, 200, 90, 0.5)",
                  }}
                >
                  100 FOLLOWERS!
                </div>
                <div
                  style={{
                    fontSize: 15,
                    lineHeight: 1.5,
                    maxWidth: 440,
                    opacity: 0.92,
                  }}
                >
                  Wow, the Feed river says you are FAMOUS! But is a follower
                  the same as a friend? Scoop your gold-pan in and shake to
                  find the REAL treasure.
                </div>
                {narration && narration.lines.length > 0 && (
                  <InfoNarration lines={narration.lines} accent={accent ?? "#38b6ff"} />
                )}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPhase("shake")}
                  style={{
                    marginTop: 6,
                    padding: "14px 30px",
                    fontSize: 19,
                    fontWeight: 800,
                    fontFamily: "inherit",
                    color: "#3a2200",
                    background: "linear-gradient(180deg, #ffd166 0%, #ffb347 100%)",
                    border: "none",
                    borderRadius: 999,
                    cursor: "pointer",
                    boxShadow: "0 6px 18px rgba(255, 180, 70, 0.4)",
                  }}
                >
                  Scoop the pan!
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Fool's gold question card ── */}
          <AnimatePresence>
            {modal && (
              <motion.div
                key="fool-modal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 20,
                  zIndex: 10,
                  background: "rgba(8, 10, 26, 0.72)",
                }}
              >
                <motion.div
                  initial={{ scale: 0.85, y: 14 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 380, damping: 24 }}
                  style={{
                    width: "min(400px, 94%)",
                    background: "linear-gradient(180deg, #232a52 0%, #1a2040 100%)",
                    border: modal.answered
                      ? modal.answered === "no"
                        ? "3px solid rgba(46, 204, 113, 0.8)"
                        : "3px solid rgba(255, 110, 110, 0.8)"
                      : "3px solid rgba(255, 209, 102, 0.6)",
                    borderRadius: 20,
                    padding: "18px 20px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 10,
                    textAlign: "center",
                    boxShadow: "0 16px 40px rgba(0, 0, 0, 0.5)",
                  }}
                >
                  {!modal.answered ? (
                    <>
                      <div
                        style={{
                          width: 56,
                          height: 52,
                          borderRadius: "48% 52% 55% 45% / 52% 48% 55% 45%",
                          background:
                            "radial-gradient(circle at 35% 30%, #f8ffb8, #ddc832 62%, #9a8f1c)",
                          border: "2px solid rgba(120, 80, 0, 0.4)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 0 16px rgba(255, 220, 90, 0.55)",
                        }}
                      >
                        <FoolFace />
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 900, color: "#ffd166" }}>
                        {modal.name}
                      </div>
                      <div style={{ fontSize: 14, opacity: 0.85 }}>
                        Follows you and {modal.sub} So shiny!
                      </div>
                      <div
                        style={{
                          fontSize: 17,
                          fontWeight: 800,
                          color: "#7df0ff",
                          marginTop: 2,
                        }}
                      >
                        Do you know them OFF the screen?
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          flexWrap: "wrap",
                          justifyContent: "center",
                          marginTop: 4,
                        }}
                      >
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.94 }}
                          onClick={() => answerFool("no")}
                          style={{
                            minHeight: 54,
                            padding: "0 22px",
                            fontSize: 16,
                            fontWeight: 800,
                            fontFamily: "inherit",
                            color: "#fff",
                            background: "linear-gradient(180deg, #2ecc71 0%, #1f8a4c 100%)",
                            border: "none",
                            borderRadius: 999,
                            cursor: "pointer",
                            boxShadow: "0 6px 16px rgba(30, 140, 80, 0.45)",
                          }}
                        >
                          No, only online
                        </motion.button>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.94 }}
                          onClick={() => answerFool("keep")}
                          style={{
                            minHeight: 54,
                            padding: "0 22px",
                            fontSize: 16,
                            fontWeight: 800,
                            fontFamily: "inherit",
                            color: "#3a2200",
                            background: "linear-gradient(180deg, #ffd166 0%, #ffb347 100%)",
                            border: "none",
                            borderRadius: 999,
                            cursor: "pointer",
                            boxShadow: "0 6px 16px rgba(255, 180, 70, 0.35)",
                          }}
                        >
                          Keep them anyway!
                        </motion.button>
                      </div>
                    </>
                  ) : modal.answered === "no" ? (
                    <>
                      <PixIcon emoji="✅" size={44} />
                      <div style={{ fontSize: 19, fontWeight: 900, color: "#8bffb0" }}>
                        Right! That is a stranger.
                      </div>
                      <div style={{ fontSize: 14.5, lineHeight: 1.5, opacity: 0.92 }}>
                        Nice words are lovely, but if you only know someone
                        online, they stay a stranger. Into the gravel it goes!
                      </div>
                    </>
                  ) : (
                    <>
                      <PixIcon emoji="🎭" size={44} />
                      <div style={{ fontSize: 19, fontWeight: 900, color: "#ff9d9d" }}>
                        Oof... watch it crumble!
                      </div>
                      <div style={{ fontSize: 14.5, lineHeight: 1.5, opacity: 0.92 }}>
                        It sparkled, but you have never met {modal.name}. A
                        stranger who says nice things is still a stranger.
                        Fool&apos;s gold!
                      </div>
                    </>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Hint line ── */}
        <div
          style={{
            minHeight: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontSize: 15,
            fontWeight: 700,
            textAlign: "center",
            color: hintColor,
          }}
        >
          {hintText}
        </div>

        {/* ── Controls / teach zone ── */}
        <div style={{ minHeight: 110, position: "relative" }}>
          <AnimatePresence mode="wait">
            {phase === "shake" && (
              <motion.div
                key="shake-meter"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    background: "rgba(0, 0, 0, 0.25)",
                    padding: "10px 18px",
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 800,
                    letterSpacing: 1,
                    color: "#c9d2ff",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <PixIcon emoji="🔍" size={20} />
                  STRANGERS SHAKEN OUT: {GREY_COUNT - greysIn} / {GREY_COUNT}
                </div>
              </motion.div>
            )}

            {phase === "inspect" && (
              <motion.div
                key="inspect-card"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 26 }}
                style={{
                  background: "rgba(123, 47, 240, 0.2)",
                  border: "2px solid rgba(201, 167, 255, 0.5)",
                  borderRadius: 18,
                  padding: "12px 18px",
                  textAlign: "center",
                  fontSize: 14.5,
                  fontWeight: 700,
                  lineHeight: 1.5,
                }}
              >
                100 followers shrank to {REAL_FRIENDS + foolsIn}! But two of
                these nuggets look... TOO shiny. Real gold is someone you know
                in real life.
              </motion.div>
            )}

            {phase === "shield" && (
              <motion.div
                key="shield-panel"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 26 }}
                style={{
                  background: "rgba(20, 60, 120, 0.28)",
                  border: "2px solid rgba(125, 240, 255, 0.5)",
                  borderRadius: 18,
                  padding: "14px 18px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 17, fontWeight: 900, color: "#7df0ff" }}>
                  Set your profile shield: who can see your pan?
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    flexWrap: "wrap",
                    justifyContent: "center",
                  }}
                >
                  <motion.button
                    type="button"
                    animate={everyoneCtrl}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={chooseEveryone}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      minHeight: 58,
                      padding: "0 24px",
                      fontSize: 16,
                      fontWeight: 800,
                      fontFamily: "inherit",
                      color: "#e7ecff",
                      background: "rgba(0, 0, 0, 0.3)",
                      border: "2px solid rgba(255, 255, 255, 0.25)",
                      borderRadius: 999,
                      cursor: "pointer",
                    }}
                  >
                    <PixIcon emoji="🌍" size={26} />
                    Everyone, all 100!
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={chooseGold}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      minHeight: 58,
                      padding: "0 24px",
                      fontSize: 16,
                      fontWeight: 800,
                      fontFamily: "inherit",
                      color: "#fff",
                      background: shieldOn
                        ? "linear-gradient(180deg, #2ecc71 0%, #1f8a4c 100%)"
                        : "linear-gradient(180deg, #ffd166 0%, #ffb347 100%)",
                      border: "none",
                      borderRadius: 999,
                      cursor: "pointer",
                      boxShadow: "0 6px 18px rgba(255, 190, 80, 0.4)",
                      ...(shieldOn ? {} : { color: "#3a2200" }),
                    }}
                  >
                    <PixIcon emoji="🛡️" size={26} />
                    {shieldOn ? "Shield ON!" : "Just my gold"}
                  </motion.button>
                </div>
                {shieldMsg && (
                  <motion.div
                    key={shieldMsg}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ fontSize: 14, fontWeight: 800, color: "#ff9d9d" }}
                  >
                    {shieldMsg}
                  </motion.div>
                )}
              </motion.div>
            )}

            {phase === "win" && (
              <motion.div
                key="win-panel"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 26 }}
                style={{
                  background: "rgba(30, 120, 70, 0.28)",
                  border: "2px solid rgba(46, 204, 113, 0.6)",
                  borderRadius: 18,
                  padding: "14px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    fontSize: 19,
                    fontWeight: 900,
                    color: "#8bffb0",
                  }}
                >
                  <PixIcon emoji="🎉" size={24} />
                  100 followers. 4 real friends. You found the gold!
                  <PixIcon emoji="🎉" size={24} />
                </div>
                {[
                  "A big follower number is just a number. The count was never the treasure.",
                  "Real gold is someone you know OFF the screen, like family and school friends.",
                  "Friends-only keeps your treasure with your gold. Hero move!",
                ].map((line) => (
                  <div
                    key={line}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      fontSize: 14.5,
                      fontWeight: 700,
                    }}
                  >
                    <PixIcon emoji="✅" size={20} />
                    {line}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </ExerciseFrame>
  );
}
