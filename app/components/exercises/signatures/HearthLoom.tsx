"use client";

/**
 * HearthLoom - Week 19 (Family Firewall) signature exercise.
 *
 * The family sits around the hearth. Above each member floats an incoming
 * TROUBLE bubble: Gran has a fake "you won a prize!" text, the little
 * brother has a stranger friend-request, and Dad has an urgent "your
 * account is locked!" email. On the wall above the fire hang the DEFENSE
 * CHARMS the child learned across the course. The child drags a glowing
 * thread (an SVG line) from the right charm down to the right family
 * member. A correct thread weaves gold and the trouble bounces off; a
 * wrong match fizzles red mid-air with a one-line teach, then the child
 * simply tries again (no hard fail, nothing is consumed).
 *
 * WIN: all three family members threaded. The loom completes a glowing
 * family blanket, the hearth flares warm green, and onComplete() fires
 * once from the finish button.
 *
 * Teaches (transfer + stealth recap before graduation): look at SOMEONE
 * ELSE's situation, diagnose the trick, and prescribe the right learned
 * defense.
 *
 * Forgiving by design: no timer, no fail state, wrong threads fizzle and
 * teach. Works with touch and mouse via pointer events.
 *
 * Self-contained by design: all copy lives here, deps are react +
 * framer-motion + ExerciseFrame + PixIcon + inline SVG/CSS only.
 */

import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import PixIcon from "@/app/components/lesson/PixIcon";
import { useGameAudio } from "@/app/lib/gameEngine/useGameAudio";

/* ------------------------------------------------------------------ */
/* Constants + content                                                */
/* ------------------------------------------------------------------ */

const STAGE_W = 960;
const STAGE_H = 600;

const BEAM_Y = 46; // wooden beam the charms hang from
const CHARM_Y = 126; // vertical center of each charm disc
const CHARM_R = 36;
const THREAD_START_Y = CHARM_Y + CHARM_R + 2; // threads sprout under the disc

const PERSON_HIT_R = 95; // generous drop radius around a person
const BUBBLE_HIT_R = 88; // dropping on the trouble bubble also counts

type CharmId = "truth" | "ask" | "link" | "meet" | "tell";
type PersonId = "gran" | "brother" | "dad";
type Phase = "intro" | "play" | "woven";
type ToastTone = "green" | "red" | "soft" | "hint";

interface Charm {
  id: CharmId;
  label: string;
  emoji: string;
  x: number;
}

const CHARMS: Charm[] = [
  { id: "meet", label: "Never-Meet Rule", emoji: "🚫", x: 112 },
  { id: "truth", label: "Truth Check", emoji: "🔍", x: 300 },
  { id: "tell", label: "Tell a Grown-up", emoji: "💬", x: 480 },
  { id: "link", label: "Check the Link", emoji: "🔗", x: 662 },
  { id: "ask", label: "Ask First", emoji: "✋", x: 848 },
];

const CHARM_BY_ID = Object.fromEntries(CHARMS.map((c) => [c.id, c])) as Record<
  CharmId,
  Charm
>;

const charmAnchor = (id: CharmId) => ({
  x: CHARM_BY_ID[id].x,
  y: THREAD_START_Y,
});

interface Person {
  id: PersonId;
  name: string;
  hintName: string;
  x: number; // body center (design px)
  y: number;
  bubbleX: number;
  bubbleY: number;
  dir: 1 | -1; // which way the trouble bounces off
  bubbleTag: string;
  bubbleEmoji: string;
  bubbleText: string;
  teach: string; // one-line teach on a wrong thread
  winTitle: string;
  winBody: string;
  safeLine: string; // tap a solved person
}

const PEOPLE: Person[] = [
  {
    id: "gran",
    name: "Gran",
    hintName: "Gran",
    x: 150,
    y: 436,
    bubbleX: 152,
    bubbleY: 290,
    dir: -1,
    bubbleTag: "TEXT MESSAGE",
    bubbleEmoji: "🎁",
    bubbleText: "You won a BIG prize! Tap now to claim it!",
    teach:
      "Gran's prize text needs the Truth Check. Too good to be true? Check if it is real!",
    winTitle: "Truth Check woven!",
    winBody: "The fake prize bounces right off Gran.",
    safeLine: "Gran is safe! Her golden thread is already woven.",
  },
  {
    id: "brother",
    name: "Brother",
    hintName: "your brother",
    x: 308,
    y: 468,
    bubbleX: 300,
    bubbleY: 322,
    dir: -1,
    bubbleTag: "FRIEND REQUEST",
    bubbleEmoji: "🎭",
    bubbleText: "Hi! Add me? From: someone you do not know",
    teach:
      "A stranger's friend request needs Ask First. Check with a grown-up before saying yes!",
    winTitle: "Ask First woven!",
    winBody: "Your brother asks before adding anyone new.",
    safeLine: "Your brother is safe! His golden thread is already woven.",
  },
  {
    id: "dad",
    name: "Dad",
    hintName: "Dad",
    x: 788,
    y: 436,
    bubbleX: 786,
    bubbleY: 290,
    dir: 1,
    bubbleTag: "URGENT EMAIL",
    bubbleEmoji: "✉️",
    bubbleText: "Your account is LOCKED! Click here fast!",
    teach:
      "Dad's scary email needs Check the Link. Slow down and look before anyone clicks!",
    winTitle: "Check the Link woven!",
    winBody: "Dad spots the fake lock-out email right away.",
    safeLine: "Dad is safe! His golden thread is already woven.",
  },
];

const CORRECT: Record<PersonId, CharmId> = {
  gran: "truth",
  brother: "ask",
  dad: "link",
};

interface Fizzle {
  key: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface Toast {
  key: number;
  tone: ToastTone;
  title: string;
  body?: string;
}

/** A softly sagging thread path between two points. */
const threadPath = (x1: number, y1: number, x2: number, y2: number) => {
  const mx = (x1 + x2) / 2;
  const my =
    (y1 + y2) / 2 + Math.min(70, Math.hypot(x2 - x1, y2 - y1) * 0.18);
  return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
};

const springy = { type: "spring" as const, stiffness: 300, damping: 24 };

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export default function HearthLoom({
  onComplete,
  narration,
  accent,
}: {
  onComplete: () => void;
  narration?: { speaker?: "adam" | "layla"; lines: string[] };
  accent?: string;
}) {
  const reduce = !!useReducedMotion();
  const audio = useGameAudio();

  const [phase, setPhase] = useState<Phase>("intro");
  const [solved, setSolved] = useState<Record<PersonId, boolean>>({
    gran: false,
    brother: false,
    dad: false,
  });
  const [shake, setShake] = useState<Record<PersonId, number>>({
    gran: 0,
    brother: 0,
    dad: 0,
  });
  const [burst, setBurst] = useState<Record<PersonId, number>>({
    gran: 0,
    brother: 0,
    dad: 0,
  });
  const [fizzles, setFizzles] = useState<Fizzle[]>([]);
  const [toast, setToast] = useState<Toast | null>(null);
  const [catWobble, setCatWobble] = useState(0);

  /* -------- responsive scale (design px -> screen px) -------- */

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const scaleRef = useRef(1);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const apply = () => {
      const s = Math.max(0.2, el.clientWidth / STAGE_W);
      scaleRef.current = s;
      setScale(s);
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* -------- timers (all cleared on unmount) -------- */

  const timersRef = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  };
  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  /* -------- toast -------- */

  const toastTimerRef = useRef<number | null>(null);
  const showToast = (tone: ToastTone, title: string, body?: string) => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setToast({ key: Date.now(), tone, title, body });
    toastTimerRef.current = window.setTimeout(() => setToast(null), 3400);
  };
  useEffect(
    () => () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    },
    []
  );

  /* -------- win -------- */

  const solvedCount = PEOPLE.filter((p) => solved[p.id]).length;
  const solvedCountRef = useRef(0);
  solvedCountRef.current = solvedCount;

  useEffect(() => {
    if (phase === "play" && PEOPLE.every((p) => solved[p.id])) {
      const t = window.setTimeout(() => {
        audio.unlock();
        setPhase("woven");
      }, 1000);
      timersRef.current.push(t);
    }
  }, [solved, phase, audio]);

  // Gentle nudge if nothing is woven after a while.
  useEffect(() => {
    if (phase !== "play") return;
    const t = window.setTimeout(() => {
      if (solvedCountRef.current === 0) {
        setToast({
          key: Date.now(),
          tone: "hint",
          title: "Try Gran first!",
          body: "A prize that sounds too good needs the Truth Check.",
        });
      }
    }, 15000);
    timersRef.current.push(t);
  }, [phase]);

  const completedRef = useRef(false);
  const finish = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  };

  /* -------- thread dragging (charm -> person) -------- */

  const usedCharm = (id: CharmId) =>
    PEOPLE.some((p) => solved[p.id] && CORRECT[p.id] === id);

  const [drag, setDrag] = useState<{ charm: CharmId; x: number; y: number } | null>(
    null
  );
  const dragRef = useRef<{ charm: CharmId; x: number; y: number } | null>(null);
  const startPtRef = useRef<{ x: number; y: number } | null>(null);
  const movedRef = useRef(0);

  const toDesign = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = wrapRef.current;
    const s = scaleRef.current || 1;
    if (!el) return { x: 0, y: 0 };
    const r = el.getBoundingClientRect();
    return { x: (e.clientX - r.left) / s, y: (e.clientY - r.top) / s };
  };

  const onCharmDown = (id: CharmId, e: ReactPointerEvent<HTMLDivElement>) => {
    if (phase !== "play" || usedCharm(id)) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    startPtRef.current = toDesign(e);
    movedRef.current = 0;
    const a = charmAnchor(id);
    const d = { charm: id, x: a.x, y: a.y };
    dragRef.current = d;
    setDrag(d);
  };

  const onCharmMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const p = toDesign(e);
    if (startPtRef.current) {
      movedRef.current = Math.max(
        movedRef.current,
        Math.hypot(p.x - startPtRef.current.x, p.y - startPtRef.current.y)
      );
    }
    const d = { ...dragRef.current, x: p.x, y: p.y };
    dragRef.current = d;
    setDrag(d);
  };

  const onCharmUp = () => {
    const d = dragRef.current;
    if (!d) return;
    dragRef.current = null;
    startPtRef.current = null;
    setDrag(null);

    const target = PEOPLE.find(
      (p) =>
        !solved[p.id] &&
        (Math.hypot(d.x - p.x, d.y - p.y) <= PERSON_HIT_R ||
          Math.hypot(d.x - p.bubbleX, d.y - p.bubbleY) <= BUBBLE_HIT_R)
    );

    if (!target) {
      if (movedRef.current < 12) {
        showToast(
          "hint",
          "Drag the thread!",
          "Pull this charm's thread down to a family member."
        );
      } else {
        showToast("soft", "Almost!", "Let go right on the family member who needs it.");
      }
      return;
    }

    const a = charmAnchor(d.charm);
    if (CORRECT[target.id] === d.charm) {
      audio.correct();
      setSolved((prev) => ({ ...prev, [target.id]: true }));
      setBurst((prev) => ({ ...prev, [target.id]: prev[target.id] + 1 }));
      showToast("green", target.winTitle, target.winBody);
    } else {
      audio.wrong();
      const key = Date.now() + Math.random();
      setFizzles((f) => [
        ...f,
        { key, x1: a.x, y1: a.y, x2: target.x, y2: target.y - 40 },
      ]);
      later(() => setFizzles((f) => f.filter((z) => z.key !== key)), 900);
      setShake((prev) => ({ ...prev, [target.id]: prev[target.id] + 1 }));
      showToast("red", "Not that charm!", target.teach);
    }
  };

  /* -------- friendly taps -------- */

  const onPersonTap = (p: Person) => {
    if (phase !== "play") return;
    audio.tap();
    if (solved[p.id]) {
      showToast("soft", "Already woven!", p.safeLine);
    } else {
      showToast(
        "hint",
        `Help ${p.hintName}!`,
        `Look at the trouble above ${p.hintName}, then drag the charm that beats it.`
      );
    }
  };

  const onCatTap = () => {
    if (phase !== "play") return;
    audio.tap();
    setCatWobble((w) => w + 1);
    showToast("soft", "The cat is fine!", "No phone, no messages, just naps.");
  };

  /* ---------------------------------------------------------------- */

  return (
    <ExerciseFrame padding={24} maxWidth={1060} touchActionNone>
      {/* header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 900,
              letterSpacing: 2.5,
              color: "#ffd9a0",
              textTransform: "uppercase",
            }}
          >
            The Hearth Loom
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 12px",
              borderRadius: 999,
              background: "rgba(30,16,26,0.7)",
              border: "1px solid rgba(255,209,102,0.4)",
              fontSize: 12.5,
              fontWeight: 700,
              color: "#ffe6c4",
            }}
          >
            <PixIcon emoji="🧠" size={16} />
            <span>Ask: which charm beats THIS trick?</span>
          </div>
        </div>
        <LoomHud solved={solved} count={solvedCount} />
      </div>

      {/* stage (fixed design coordinates, scaled to fit) */}
      <div
        ref={wrapRef}
        style={{ position: "relative", width: "100%", height: Math.round(STAGE_H * scale) }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: STAGE_W,
            height: STAGE_H,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {/* -------------------- the room -------------------- */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 18,
              overflow: "hidden",
              border: "1px solid rgba(255,209,102,0.2)",
              background: "linear-gradient(180deg, #46284a 0%, #3c2240 58%, #331d38 100%)",
            }}
          >
            {/* floor */}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 470,
                bottom: 0,
                background: "linear-gradient(180deg, #4a3124 0%, #3c2719 100%)",
                borderTop: "3px solid rgba(200,150,100,0.35)",
                backgroundImage:
                  "linear-gradient(90deg, rgba(30,18,10,0.35) 2px, transparent 2px)",
                backgroundSize: "120px 100%",
              }}
            />
            {/* rug */}
            <div
              style={{
                position: "absolute",
                left: 100,
                top: 506,
                width: 760,
                height: 78,
                borderRadius: "50%",
                background:
                  "radial-gradient(ellipse, rgba(200,90,70,0.5) 0%, rgba(160,70,60,0.28) 55%, rgba(160,70,60,0.08) 80%)",
                border: "2px solid rgba(230,150,110,0.25)",
              }}
            />

            {/* warm ambient glow from the fire */}
            <div
              style={{
                position: "absolute",
                left: 250,
                top: 250,
                width: 460,
                height: 330,
                borderRadius: "50%",
                background:
                  phase === "woven"
                    ? "radial-gradient(ellipse, rgba(110,255,170,0.2) 0%, transparent 70%)"
                    : "radial-gradient(ellipse, rgba(255,150,60,0.17) 0%, transparent 70%)",
                pointerEvents: "none",
                filter: "blur(6px)",
              }}
            />

            {/* -------------------- the hearth -------------------- */}
            {/* chimney breast (bricks) */}
            <div
              style={{
                position: "absolute",
                left: 350,
                top: 200,
                width: 260,
                height: 270,
                background: "#8a4a3a",
                backgroundImage:
                  "linear-gradient(rgba(60,25,20,0.45) 2px, transparent 2px)," +
                  "linear-gradient(90deg, rgba(60,25,20,0.45) 2px, transparent 2px)",
                backgroundSize: "46px 22px",
                borderRadius: "10px 10px 0 0",
                boxShadow: "inset 0 0 30px rgba(30,10,8,0.4)",
              }}
            />
            {/* framed family photo on the chimney */}
            <div
              style={{
                position: "absolute",
                left: 452,
                top: 206,
                width: 56,
                height: 58,
                borderRadius: 6,
                background: "#2a1a14",
                border: "4px solid #b4854a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PixIcon emoji="👪" size={34} />
            </div>
            {/* mantel shelf */}
            <div
              style={{
                position: "absolute",
                left: 334,
                top: 268,
                width: 292,
                height: 16,
                borderRadius: 6,
                background: "linear-gradient(180deg, #8a5c32, #5d3d22)",
                boxShadow: "0 6px 10px rgba(0,0,0,0.3)",
              }}
            />
            {/* firebox arch */}
            <div
              style={{
                position: "absolute",
                left: 408,
                top: 310,
                width: 144,
                height: 160,
                borderRadius: "72px 72px 0 0",
                background: "#170f0c",
                boxShadow: "inset 0 0 26px rgba(0,0,0,0.8)",
                overflow: "hidden",
              }}
            >
              <HearthFire green={phase === "woven"} reduce={reduce} />
            </div>
            {/* hearthstone */}
            <div
              style={{
                position: "absolute",
                left: 388,
                top: 468,
                width: 184,
                height: 18,
                borderRadius: 9,
                background: "linear-gradient(180deg, #6f6a70, #565158)",
              }}
            />

            {/* -------------------- charm beam + charms -------------------- */}
            {/* beam */}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: BEAM_Y - 12,
                height: 22,
                background: "linear-gradient(180deg, #7a5230, #5d3d22)",
                borderBottom: "3px solid #40280f",
                zIndex: 13,
              }}
            />
            {/* hanging strings */}
            {CHARMS.map((c) => (
              <div
                key={`string-${c.id}`}
                style={{
                  position: "absolute",
                  left: c.x - 1.5,
                  top: BEAM_Y + 10,
                  width: 3,
                  height: CHARM_Y - CHARM_R - (BEAM_Y + 10),
                  background: "#caa46a",
                  zIndex: 13,
                }}
              />
            ))}

            {/* -------------------- the cat (harmless) -------------------- */}
            <motion.div
              key={`cat-${catWobble}`}
              animate={catWobble ? { rotate: [0, -6, 6, -3, 0] } : undefined}
              transition={{ duration: 0.5 }}
              onClick={onCatTap}
              role="button"
              aria-label="Sleeping cat. It has no phone and no trouble."
              style={{ position: "absolute", left: 838, top: 466, cursor: "pointer", zIndex: 4 }}
            >
              <CatFig />
            </motion.div>

            {/* -------------------- the family -------------------- */}
            {PEOPLE.map((p) => (
              <PersonSpot
                key={p.id}
                p={p}
                isSolved={solved[p.id]}
                shakeKey={shake[p.id]}
                burstKey={burst[p.id]}
                reduce={reduce}
                onTap={() => onPersonTap(p)}
              />
            ))}

            {/* -------------------- trouble bubbles -------------------- */}
            <AnimatePresence>
              {phase !== "intro" &&
                PEOPLE.filter((p) => !solved[p.id]).map((p) => (
                  <TroubleBubble key={p.id} p={p} reduce={reduce} />
                ))}
            </AnimatePresence>

            {/* drop-target rings while a thread is being dragged */}
            {drag &&
              phase === "play" &&
              PEOPLE.filter((p) => !solved[p.id]).map((p) => (
                <motion.div
                  key={`ring-${p.id}`}
                  animate={
                    reduce
                      ? { opacity: 0.7 }
                      : { scale: [1, 1.07, 1], opacity: [0.5, 0.9, 0.5] }
                  }
                  transition={{ duration: 1.3, repeat: Infinity }}
                  style={{
                    position: "absolute",
                    left: p.x - 88,
                    top: p.y - 98,
                    width: 176,
                    height: 176,
                    borderRadius: "50%",
                    border: "3px dashed rgba(125,240,255,0.65)",
                    zIndex: 9,
                    pointerEvents: "none",
                  }}
                />
              ))}

            {/* -------------------- thread layer (SVG) -------------------- */}
            <svg
              width={STAGE_W}
              height={STAGE_H}
              viewBox={`0 0 ${STAGE_W} ${STAGE_H}`}
              style={{ position: "absolute", inset: 0, zIndex: 12, pointerEvents: "none" }}
            >
              {/* woven gold threads */}
              {PEOPLE.filter((p) => solved[p.id]).map((p) => {
                const a = charmAnchor(CORRECT[p.id]);
                const d = threadPath(a.x, a.y, p.x, p.y - 46);
                return (
                  <g key={`gold-${p.id}`}>
                    <motion.path
                      d={d}
                      stroke="rgba(255,209,102,0.3)"
                      strokeWidth={10}
                      fill="none"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: reduce ? 0.2 : 0.6, ease: "easeOut" }}
                    />
                    <motion.path
                      d={d}
                      stroke="#ffe084"
                      strokeWidth={3.5}
                      fill="none"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: reduce ? 0.2 : 0.6, ease: "easeOut" }}
                    />
                  </g>
                );
              })}

              {/* red fizzles on wrong threads */}
              {fizzles.map((f) => (
                <motion.g
                  key={f.key}
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <path
                    d={threadPath(f.x1, f.y1, f.x2, f.y2)}
                    stroke="#ff6b6b"
                    strokeWidth={4}
                    fill="none"
                    strokeDasharray="6 10"
                    strokeLinecap="round"
                  />
                  <motion.circle
                    cx={f.x2}
                    cy={f.y2}
                    fill="none"
                    stroke="#ff6b6b"
                    strokeWidth={3}
                    initial={{ r: 6, opacity: 1 }}
                    animate={{ r: 26, opacity: 0 }}
                    transition={{ duration: 0.55 }}
                  />
                </motion.g>
              ))}

              {/* the live thread while dragging */}
              {drag &&
                (() => {
                  const a = charmAnchor(drag.charm);
                  const d = threadPath(a.x, a.y, drag.x, drag.y);
                  return (
                    <g>
                      <path
                        d={d}
                        stroke="rgba(125,240,255,0.28)"
                        strokeWidth={11}
                        fill="none"
                        strokeLinecap="round"
                      />
                      <path
                        d={d}
                        stroke="#9fe8ff"
                        strokeWidth={4}
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray="12 9"
                      />
                      <circle
                        cx={drag.x}
                        cy={drag.y}
                        r={8}
                        fill="#eaffff"
                        stroke="#7df0ff"
                        strokeWidth={3}
                      />
                    </g>
                  );
                })()}
            </svg>

            {/* -------------------- charm discs (drag sources) -------------------- */}
            {CHARMS.map((c, i) => {
              const used = usedCharm(c.id);
              const active = drag?.charm === c.id;
              return (
                <div key={c.id}>
                  <motion.div
                    onPointerDown={(e) => onCharmDown(c.id, e)}
                    onPointerMove={onCharmMove}
                    onPointerUp={onCharmUp}
                    onPointerCancel={onCharmUp}
                    animate={
                      used || reduce || active || phase !== "play"
                        ? { rotate: 0, scale: active ? 1.12 : 1 }
                        : { rotate: [-2.5, 2.5, -2.5], scale: 1 }
                    }
                    transition={
                      used || reduce || active || phase !== "play"
                        ? springy
                        : {
                            rotate: { duration: 3 + i * 0.35, repeat: Infinity, ease: "easeInOut" },
                            scale: springy,
                          }
                    }
                    role="button"
                    aria-label={`${c.label} charm. Drag its thread to a family member.`}
                    aria-disabled={used}
                    style={{
                      position: "absolute",
                      left: c.x - CHARM_R,
                      top: CHARM_Y - CHARM_R,
                      width: CHARM_R * 2,
                      height: CHARM_R * 2,
                      borderRadius: "50%",
                      background: "radial-gradient(circle at 35% 30%, #5a3f2e, #37231a)",
                      border: used
                        ? "3.5px solid rgba(255,209,102,0.35)"
                        : "3.5px solid #ffd166",
                      boxShadow: active
                        ? "0 0 26px rgba(255,224,132,0.85)"
                        : used
                          ? "none"
                          : "0 0 14px rgba(255,209,102,0.4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: used || phase !== "play" ? "default" : "grab",
                      touchAction: "none",
                      opacity: used ? 0.45 : 1,
                      zIndex: 14,
                      transformOrigin: "50% -60px",
                    }}
                  >
                    <PixIcon emoji={c.emoji} size={36} />
                    {used && (
                      <div style={{ position: "absolute", right: -6, top: -6 }}>
                        <PixIcon emoji="✅" size={24} />
                      </div>
                    )}
                  </motion.div>
                  {/* label pill */}
                  <div
                    style={{
                      position: "absolute",
                      left: c.x - 64,
                      top: CHARM_Y + CHARM_R + 6,
                      width: 128,
                      textAlign: "center",
                      zIndex: 14,
                      pointerEvents: "none",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 9px",
                        borderRadius: 999,
                        background: "rgba(20,12,30,0.78)",
                        border: "1px solid rgba(255,209,102,0.45)",
                        color: "#ffe3b0",
                        fontSize: 11.5,
                        fontWeight: 800,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {c.label}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* -------------------- the win: green flare + family blanket -------------------- */}
            {phase === "woven" && (
              <>
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: [0, 0.85, 0.5], scale: [0.5, 1.3, 1.15] }}
                  transition={{ duration: reduce ? 0.5 : 1.6, times: [0, 0.4, 1] }}
                  style={{
                    position: "absolute",
                    left: 220,
                    top: 220,
                    width: 520,
                    height: 380,
                    borderRadius: "50%",
                    background:
                      "radial-gradient(ellipse, rgba(110,255,170,0.4) 0%, transparent 68%)",
                    pointerEvents: "none",
                    zIndex: 22,
                  }}
                />
                <FamilyBlanket reduce={reduce} />
                {!reduce &&
                  [
                    { x: 170, y: 380, d: 0.4 },
                    { x: 480, y: 340, d: 0.8 },
                    { x: 790, y: 380, d: 1.2 },
                  ].map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: [0, 1, 0], y: -40 }}
                      transition={{ duration: 2.2, delay: s.d, repeat: Infinity, repeatDelay: 1.4 }}
                      style={{
                        position: "absolute",
                        left: s.x,
                        top: s.y,
                        pointerEvents: "none",
                        zIndex: 26,
                      }}
                    >
                      <PixIcon emoji="✨" size={26} />
                    </motion.div>
                  ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* toast */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 14,
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none",
          zIndex: 35,
        }}
      >
        <AnimatePresence mode="wait">
          {toast && (
            <motion.div
              key={toast.key}
              initial={{ y: 24, opacity: 0, scale: 0.94 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 10, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                maxWidth: "min(92%, 580px)",
                padding: "10px 18px",
                borderRadius: 16,
                background:
                  toast.tone === "green"
                    ? "linear-gradient(180deg, #10402c, #0c3323)"
                    : toast.tone === "red"
                      ? "linear-gradient(180deg, #4a1420, #380f18)"
                      : toast.tone === "soft"
                        ? "linear-gradient(180deg, #1d2a55, #172246)"
                        : "linear-gradient(180deg, #10314a, #0c2739)",
                border:
                  toast.tone === "green"
                    ? "2px solid rgba(52,211,153,0.8)"
                    : toast.tone === "red"
                      ? "2px solid rgba(255,107,107,0.8)"
                      : toast.tone === "soft"
                        ? "2px solid rgba(140,170,255,0.7)"
                        : "2px solid rgba(34,211,238,0.7)",
                boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
              }}
            >
              <PixIcon
                emoji={
                  toast.tone === "green"
                    ? "✅"
                    : toast.tone === "red"
                      ? "💡"
                      : toast.tone === "soft"
                        ? "✨"
                        : "👆"
                }
                size={26}
              />
              <div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 900,
                    color:
                      toast.tone === "green"
                        ? "#8ff5c0"
                        : toast.tone === "red"
                          ? "#ffb3a8"
                          : toast.tone === "soft"
                            ? "#cdd9ff"
                            : "#9fe8ff",
                  }}
                >
                  {toast.title}
                </div>
                {toast.body && (
                  <div style={{ fontSize: 13, color: "#f0e7ff", marginTop: 1 }}>{toast.body}</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* intro */}
      {phase === "intro" && (
        <IntroOverlay
          onStart={() => setPhase("play")}
          narration={narration}
          accent={accent}
        />
      )}

      {/* finish banner */}
      {phase === "woven" && <WovenBanner onFinish={finish} />}
    </ExerciseFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Family figures                                                     */
/* ------------------------------------------------------------------ */

function PersonSpot({
  p,
  isSolved,
  shakeKey,
  burstKey,
  reduce,
  onTap,
}: {
  p: Person;
  isSolved: boolean;
  shakeKey: number;
  burstKey: number;
  reduce: boolean;
  onTap: () => void;
}) {
  return (
    <div
      onClick={onTap}
      role="button"
      aria-label={`${p.name}. ${isSolved ? "Protected by a woven thread." : "Needs the right defense charm."}`}
      style={{
        position: "absolute",
        left: p.x - 62,
        top: p.y - 72,
        width: 124,
        height: 152,
        zIndex: 4,
        cursor: "pointer",
      }}
    >
      <motion.div
        key={`shake-${shakeKey}`}
        animate={shakeKey ? { rotate: [0, -5, 5, -3, 0] } : undefined}
        transition={{ duration: 0.5 }}
      >
        {p.id === "gran" ? <GranFig /> : p.id === "brother" ? <BrotherFig /> : <DadFig />}
      </motion.div>

      {/* golden shawl + check once protected */}
      {isSolved && (
        <>
          <motion.svg
            width={124}
            height={152}
            viewBox="0 0 124 152"
            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <path
              d={p.id === "brother" ? "M28 76 Q62 96 96 76" : "M26 70 Q62 92 98 70"}
              stroke="#ffd166"
              strokeWidth={9}
              strokeLinecap="round"
              fill="none"
              opacity={0.9}
            />
          </motion.svg>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...{ type: "spring" as const, stiffness: 300, damping: 18 }, delay: 0.45 }}
            style={{ position: "absolute", left: "50%", top: -30, transform: "translateX(-50%)" }}
          >
            <PixIcon emoji="✅" size={30} />
          </motion.div>
        </>
      )}

      {/* gold burst when the trouble bounces off */}
      {burstKey > 0 && (
        <motion.div
          key={`burst-${burstKey}`}
          initial={{ scale: 0.4, opacity: 1 }}
          animate={{ scale: reduce ? 1 : 1.7, opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          style={{
            position: "absolute",
            left: "50%",
            top: 30,
            width: 110,
            height: 110,
            marginLeft: -55,
            borderRadius: "50%",
            border: "4px solid rgba(255,224,132,0.9)",
            boxShadow: "0 0 24px rgba(255,224,132,0.7)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* name pill */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: -6,
          transform: "translateX(-50%)",
          padding: "2px 12px",
          borderRadius: 999,
          background: "rgba(20,12,30,0.8)",
          border: isSolved
            ? "1.5px solid rgba(110,255,170,0.7)"
            : "1.5px solid rgba(255,209,102,0.45)",
          color: isSolved ? "#8ff5c0" : "#ffe3b0",
          fontSize: 12,
          fontWeight: 900,
          whiteSpace: "nowrap",
        }}
      >
        {p.name}
      </div>
    </div>
  );
}

function GranFig() {
  return (
    <svg width={124} height={152} viewBox="0 0 124 152" style={{ display: "block" }}>
      <ellipse cx={62} cy={140} rx={52} ry={11} fill="#6c3f8c" opacity={0.9} />
      <path d="M62 62 L30 134 Q62 144 94 134 Z" fill="#b58ad6" stroke="#8a5aa8" strokeWidth={2} />
      <circle cx={36} cy={106} r={8} fill="#f2c9a0" />
      <circle cx={88} cy={106} r={8} fill="#f2c9a0" />
      {/* phone in her hands */}
      <g transform="rotate(-6 62 104)">
        <rect x={49} y={88} width={26} height={40} rx={5} fill="#2a2f52" stroke="#171c40" strokeWidth={2} />
        <rect x={53} y={94} width={18} height={26} rx={3} fill="#ffe9c9" />
        <rect x={60} y={98} width={4} height={11} rx={2} fill="#e05a4e" />
        <circle cx={62} cy={114} r={2.5} fill="#e05a4e" />
      </g>
      {/* head */}
      <circle cx={62} cy={38} r={23} fill="#f2c9a0" />
      <path d="M39 34 Q42 12 62 12 Q82 12 85 34 Q74 23 62 23 Q50 23 39 34" fill="#dcdff0" />
      <circle cx={62} cy={8} r={9} fill="#dcdff0" />
      {/* glasses */}
      <circle cx={53} cy={38} r={6.5} fill="rgba(255,255,255,0.18)" stroke="#6a5580" strokeWidth={2} />
      <circle cx={71} cy={38} r={6.5} fill="rgba(255,255,255,0.18)" stroke="#6a5580" strokeWidth={2} />
      <path d="M59.5 38 h5" stroke="#6a5580" strokeWidth={2} />
      <circle cx={53} cy={38} r={2} fill="#3a2f55" />
      <circle cx={71} cy={38} r={2} fill="#3a2f55" />
      <path d="M55 50 q7 5 14 0" stroke="#b3563e" strokeWidth={2.4} fill="none" strokeLinecap="round" />
      <circle cx={44} cy={45} r={3.4} fill="rgba(240,130,120,0.5)" />
      <circle cx={80} cy={45} r={3.4} fill="rgba(240,130,120,0.5)" />
    </svg>
  );
}

function BrotherFig() {
  return (
    <svg width={124} height={152} viewBox="0 0 124 152" style={{ display: "block" }}>
      <ellipse cx={62} cy={140} rx={46} ry={10} fill="#2f6f8f" opacity={0.9} />
      {/* body */}
      <path d="M62 74 L40 132 Q62 140 84 132 Z" fill="#4aa3c7" stroke="#33809f" strokeWidth={2} />
      <path d="M48 96 h28" stroke="#e8f4ff" strokeWidth={5} strokeLinecap="round" opacity={0.8} />
      <path d="M44 112 h36" stroke="#e8f4ff" strokeWidth={5} strokeLinecap="round" opacity={0.8} />
      <circle cx={42} cy={116} r={7} fill="#f7d3ab" />
      <circle cx={82} cy={116} r={7} fill="#f7d3ab" />
      {/* tablet in his lap */}
      <g transform="rotate(5 62 118)">
        <rect x={48} y={106} width={28} height={22} rx={4} fill="#20264e" stroke="#171c40" strokeWidth={2} />
        <rect x={52} y={110} width={20} height={14} rx={2} fill="#7cc3ff" />
      </g>
      {/* head */}
      <circle cx={62} cy={52} r={19} fill="#f7d3ab" />
      <path d="M43 50 Q44 30 62 30 Q80 30 81 50 Q72 40 62 41 Q52 40 43 50" fill="#6a4426" />
      <path d="M56 30 q4 -8 10 -4" stroke="#6a4426" strokeWidth={5} fill="none" strokeLinecap="round" />
      <circle cx={55} cy={52} r={2.4} fill="#3a2f55" />
      <circle cx={69} cy={52} r={2.4} fill="#3a2f55" />
      <path d="M56 61 q6 5 12 0" stroke="#b3563e" strokeWidth={2.4} fill="none" strokeLinecap="round" />
      <circle cx={48} cy={58} r={2.6} fill="rgba(240,130,120,0.5)" />
      <circle cx={76} cy={58} r={2.6} fill="rgba(240,130,120,0.5)" />
    </svg>
  );
}

function DadFig() {
  return (
    <svg width={124} height={152} viewBox="0 0 124 152" style={{ display: "block" }}>
      <ellipse cx={62} cy={140} rx={52} ry={11} fill="#2f6f5a" opacity={0.9} />
      {/* sweater */}
      <path d="M62 62 L32 134 Q62 144 92 134 Z" fill="#3f8f6e" stroke="#2c6f53" strokeWidth={2} />
      <path d="M50 74 h24" stroke="#2c6f53" strokeWidth={3} strokeLinecap="round" />
      <circle cx={38} cy={108} r={8} fill="#e8b98a" />
      <circle cx={86} cy={108} r={8} fill="#e8b98a" />
      {/* laptop with the scary email */}
      <g transform="rotate(-4 62 112)">
        <rect x={46} y={92} width={32} height={24} rx={3} fill="#20264e" stroke="#171c40" strokeWidth={2} />
        <rect x={50} y={96} width={24} height={16} rx={2} fill="#ffe9c9" />
        <path d="M52 98 l10 7 10 -7" stroke="#e05a4e" strokeWidth={2} fill="none" />
        <rect x={42} y={116} width={40} height={5} rx={2.5} fill="#39406e" />
      </g>
      {/* head */}
      <circle cx={62} cy={38} r={22} fill="#e8b98a" />
      <path d="M40 34 Q42 14 62 14 Q82 14 84 34 Q73 25 62 25 Q51 25 40 34" fill="#3a2a20" />
      <circle cx={54} cy={37} r={2.4} fill="#2a2018" />
      <circle cx={70} cy={37} r={2.4} fill="#2a2018" />
      {/* mustache + smile */}
      <path d="M52 47 q10 6 20 0" stroke="#3a2a20" strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d="M57 54 q5 3 10 0" stroke="#8a4a34" strokeWidth={2.2} fill="none" strokeLinecap="round" />
    </svg>
  );
}

function CatFig() {
  return (
    <svg width={82} height={52} viewBox="0 0 82 52" style={{ display: "block" }}>
      <ellipse cx={40} cy={40} rx={30} ry={12} fill="#e8a06a" />
      <path d="M66 38 q14 -4 10 -16" stroke="#e8a06a" strokeWidth={7} fill="none" strokeLinecap="round" />
      <circle cx={22} cy={28} r={13} fill="#e8a06a" />
      <path d="M12 20 l3 -9 6 6 Z" fill="#e8a06a" />
      <path d="M31 19 l6 -7 2 9 Z" fill="#e8a06a" />
      <path d="M15 29 q3 3 6 0 M25 29 q3 3 6 0" stroke="#7a4a28" strokeWidth={2} fill="none" strokeLinecap="round" />
      <path d="M45 34 q4 -5 9 -2 M52 40 q4 -5 9 -2" stroke="#c77f47" strokeWidth={2.5} fill="none" strokeLinecap="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Trouble bubbles                                                    */
/* ------------------------------------------------------------------ */

function TroubleBubble({ p, reduce }: { p: Person; reduce: boolean }) {
  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={reduce ? { scale: 1, opacity: 1, y: 0 } : { scale: 1, opacity: 1, y: [0, -7, 0] }}
      exit={{
        x: p.dir * 180,
        y: -150,
        rotate: p.dir * 30,
        opacity: 0,
        scale: 0.7,
        transition: { duration: 0.65, ease: "easeIn" },
      }}
      transition={
        reduce
          ? { duration: 0.3 }
          : {
              y: { duration: 2.6, repeat: Infinity, ease: "easeInOut" },
              scale: { type: "spring", stiffness: 260, damping: 20 },
              opacity: { duration: 0.3 },
            }
      }
      style={{
        position: "absolute",
        left: p.bubbleX - 98,
        top: p.bubbleY - 52,
        width: 196,
        zIndex: 8,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          borderRadius: 14,
          border: "2.5px solid rgba(255,120,110,0.85)",
          background: "linear-gradient(180deg, #3a1830, #2a1226)",
          boxShadow: "0 12px 26px rgba(0,0,0,0.4), 0 0 18px rgba(255,110,100,0.25)",
          padding: "8px 10px 10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <span
            style={{
              padding: "2px 8px",
              borderRadius: 999,
              background: "rgba(255,110,100,0.2)",
              color: "#ffb3a8",
              fontSize: 9.5,
              fontWeight: 900,
              letterSpacing: 1.4,
            }}
          >
            {p.bubbleTag}
          </span>
          <motion.span
            animate={reduce ? undefined : { rotate: [0, -12, 12, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 1.2 }}
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: "#ff6b6b",
              color: "#fff",
              fontSize: 13,
              fontWeight: 900,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 8px rgba(255,107,107,0.8)",
            }}
          >
            !
          </motion.span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <PixIcon emoji={p.bubbleEmoji} size={30} />
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#ffe3da", lineHeight: 1.35 }}>
            {p.bubbleText}
          </div>
        </div>
      </div>
      {/* tail down toward the person */}
      <div
        style={{
          width: 0,
          height: 0,
          margin: "0 auto",
          borderLeft: "10px solid transparent",
          borderRight: "10px solid transparent",
          borderTop: "12px solid rgba(255,120,110,0.85)",
        }}
      />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Hearth fire                                                        */
/* ------------------------------------------------------------------ */

function HearthFire({ green, reduce }: { green: boolean; reduce: boolean }) {
  const cols = green
    ? { outer: "#1faf7a", mid: "#34d399", inner: "#c8ffe0", glow: "rgba(110,255,170,0.5)" }
    : { outer: "#e2622b", mid: "#ff9f43", inner: "#ffe084", glow: "rgba(255,150,60,0.5)" };
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, top: 0 }}>
      {/* glow inside the firebox */}
      <motion.div
        animate={reduce ? undefined : { opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.8, repeat: Infinity }}
        style={{
          position: "absolute",
          left: 10,
          right: 10,
          bottom: -20,
          height: 110,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${cols.glow} 0%, transparent 70%)`,
          filter: "blur(4px)",
        }}
      />
      <svg
        width={120}
        height={112}
        viewBox="0 0 120 112"
        style={{ position: "absolute", left: 12, bottom: 6, display: "block" }}
      >
        {/* logs */}
        <rect x={18} y={94} width={84} height={12} rx={6} fill="#5d3d22" transform="rotate(-6 60 100)" />
        <rect x={22} y={96} width={76} height={11} rx={5.5} fill="#6f4a2a" transform="rotate(7 60 100)" />
        {/* flames */}
        <motion.path
          d="M60 98 C 30 70, 44 40, 60 8 C 76 40, 90 70, 60 98"
          fill={cols.outer}
          animate={reduce ? undefined : { scaleY: [1, 1.07, 0.95, 1], scaleX: [1, 0.97, 1.03, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "60px 98px" }}
        />
        <motion.path
          d="M60 96 C 40 74, 50 50, 60 26 C 70 50, 80 74, 60 96"
          fill={cols.mid}
          animate={reduce ? undefined : { scaleY: [1, 0.94, 1.06, 1] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "60px 96px" }}
        />
        <motion.path
          d="M60 94 C 50 80, 54 62, 60 48 C 66 62, 70 80, 60 94"
          fill={cols.inner}
          animate={reduce ? undefined : { scaleY: [1, 1.1, 0.92, 1] }}
          transition={{ duration: 0.7, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "60px 94px" }}
        />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Win pieces                                                         */
/* ------------------------------------------------------------------ */

/** The completed loom: a glowing woven blanket draped across the family's laps. */
function FamilyBlanket({ reduce }: { reduce: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0.4 : 0.9, delay: 0.3, ease: "easeOut" }}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: STAGE_W,
        height: STAGE_H,
        pointerEvents: "none",
        zIndex: 24,
      }}
    >
      <svg width={STAGE_W} height={STAGE_H} viewBox={`0 0 ${STAGE_W} ${STAGE_H}`}>
        <defs>
          <pattern id="hl-weave" width={22} height={22} patternUnits="userSpaceOnUse">
            <rect width={22} height={22} fill="rgba(255,209,102,0.18)" />
            <path d="M0 11 H22" stroke="rgba(255,224,132,0.55)" strokeWidth={3} />
            <path d="M11 0 V22" stroke="rgba(110,255,170,0.5)" strokeWidth={3} />
          </pattern>
        </defs>
        <motion.path
          d="M70 462 Q 480 434 890 462 L 890 546 Q 480 578 70 546 Z"
          fill="url(#hl-weave)"
          stroke="#ffd166"
          strokeWidth={3.5}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: reduce ? 0.3 : 1.1, delay: 0.35, ease: "easeInOut" }}
        />
        {/* fringe tassels */}
        {Array.from({ length: 12 }, (_, i) => 110 + i * 68).map((x, i) => (
          <path
            key={i}
            d={`M ${x} ${552 + Math.sin(i) * 5} v 14`}
            stroke="#ffd166"
            strokeWidth={3}
            strokeLinecap="round"
          />
        ))}
      </svg>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* HUD + overlays                                                     */
/* ------------------------------------------------------------------ */

function LoomHud({ solved, count }: { solved: Record<PersonId, boolean>; count: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ display: "flex", gap: 6 }}>
        {PEOPLE.map((p) => (
          <div
            key={p.id}
            style={{
              padding: "3px 10px",
              borderRadius: 999,
              fontSize: 11.5,
              fontWeight: 900,
              color: solved[p.id] ? "#0c2b1c" : "rgba(255,230,196,0.6)",
              background: solved[p.id]
                ? "linear-gradient(180deg, #6fe89b, #34d399)"
                : "rgba(30,16,26,0.7)",
              border: solved[p.id]
                ? "2px solid #a7f6c8"
                : "2px solid rgba(255,209,102,0.3)",
              boxShadow: solved[p.id] ? "0 0 10px rgba(110,255,170,0.5)" : undefined,
              transition: "all 0.3s ease",
            }}
          >
            {p.name}
          </div>
        ))}
      </div>
      <div style={{ fontSize: 13, fontWeight: 800, color: "#ffe6c4" }}>{count} of 3 woven</div>
    </div>
  );
}

function IntroOverlay({
  onStart,
  narration,
  accent,
}: {
  onStart: () => void;
  narration?: { speaker?: "adam" | "layla"; lines: string[] };
  accent?: string;
}) {
  const rows: { color: string; text: string }[] = [
    { color: "#ffd166", text: "Read the trouble bubble above each family member" },
    { color: "#7df0ff", text: "Find the wall charm that beats that trick" },
    { color: "#8ff5c0", text: "Drag a glowing thread from the charm to that person" },
  ];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background: "rgba(18,10,20,0.84)",
      }}
    >
      <motion.div
        initial={{ y: 24, scale: 0.96 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        style={{
          width: "min(100%, 500px)",
          borderRadius: 24,
          padding: "26px 28px",
          background: "linear-gradient(180deg, #3a2038, #2a1628)",
          border: "1px solid rgba(255,209,102,0.4)",
          boxShadow: "0 30px 60px rgba(0,0,0,0.45)",
          textAlign: "center",
          // The spoken-instruction block makes the card taller; on short
          // viewports the card scrolls internally so the start button is
          // always reachable (never clipped by the centered overlay).
          maxHeight: "100%",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 10 }}>
          <PixIcon emoji="👪" size={34} />
          <PixIcon emoji="🛡️" size={34} />
        </div>
        <div style={{ fontSize: 27, fontWeight: 900, color: "#ffefd9", marginBottom: 8 }}>
          The Hearth Loom
        </div>
        <div style={{ fontSize: 15, lineHeight: 1.5, color: "#eed7e8", marginBottom: 16 }}>
          Your family is cozy by the fire, but three tricky messages are buzzing in! You know a{" "}
          <b style={{ color: "#ffd166" }}>defense charm</b> for every trick. Weave a thread from
          the right charm to the right person:
        </div>
        <div style={{ display: "grid", gap: 8, marginBottom: 16, textAlign: "left" }}>
          {rows.map((r) => (
            <div
              key={r.text}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.05)",
                fontSize: 14,
                fontWeight: 700,
                color: "#f4e3ef",
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: r.color,
                  boxShadow: `0 0 8px ${r.color}`,
                  flexShrink: 0,
                }}
              />
              {r.text}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 14, color: "#d4b8ca", marginBottom: 18 }}>
          A wrong thread just fizzles. Try as many times as you like!
        </div>
        {narration && narration.lines.length > 0 && (
          <div style={{ textAlign: "left" }}>
            <InfoNarration lines={narration.lines} accent={accent ?? "#ffb26b"} />
          </div>
        )}
        <button
          onClick={onStart}
          style={{
            fontSize: 19,
            fontWeight: 900,
            padding: "14px 40px",
            borderRadius: 999,
            border: "none",
            cursor: "pointer",
            color: "#3a2408",
            background: "linear-gradient(180deg, #ffe084, #ffc94d)",
            boxShadow: "0 10px 26px rgba(255,201,77,0.4)",
            fontFamily: "inherit",
          }}
        >
          Start weaving
        </button>
      </motion.div>
    </motion.div>
  );
}

function WovenBanner({ onFinish }: { onFinish: () => void }) {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 22,
        display: "flex",
        justifyContent: "center",
        zIndex: 45,
        pointerEvents: "none",
      }}
    >
      <motion.div
        initial={{ y: 46, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, type: "spring", stiffness: 220, damping: 22 }}
        style={{
          pointerEvents: "auto",
          width: "min(92%, 540px)",
          borderRadius: 22,
          padding: "20px 26px",
          textAlign: "center",
          background: "linear-gradient(180deg, #0d3a2a, #0a2e21)",
          border: "2px solid rgba(52,211,153,0.75)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5), 0 0 30px rgba(52,211,153,0.25)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 6 }}>
          <PixIcon emoji="👪" size={26} />
          <PixIcon emoji="🏆" size={26} />
          <PixIcon emoji="✨" size={26} />
        </div>
        <div style={{ fontSize: 23, fontWeight: 900, color: "#8ff5c0", letterSpacing: 1 }}>
          THE FAMILY BLANKET IS WOVEN!
        </div>
        <div style={{ fontSize: 14.5, color: "#d9f5e6", margin: "8px 0 16px", lineHeight: 1.5 }}>
          Three tricks flew in, and three charms bounced them right off. You looked at each
          trouble, picked the right defense, and kept your whole family safe.{" "}
          <b>That is what a family firewall does.</b>
        </div>
        <button
          onClick={onFinish}
          style={{
            fontSize: 18,
            fontWeight: 900,
            padding: "12px 44px",
            borderRadius: 999,
            border: "none",
            cursor: "pointer",
            color: "#07130c",
            background: "linear-gradient(180deg, #6fe89b, #34d399)",
            boxShadow: "0 10px 26px rgba(52,211,153,0.45)",
            fontFamily: "inherit",
          }}
        >
          Finish
        </button>
      </motion.div>
    </div>
  );
}
