"use client";

/**
 * GoodnightGadgets - Week 14 (Smart Devices) signature exercise.
 *
 * Bedtime in a smart home. Every gadget that can SENSE the child shows
 * little blinking "SEES" / "HEARS" chips while it is awake, and each one
 * needs ITS OWN gesture to be tucked in: drag the lens cap onto the
 * camera, pull the smart speaker's plug out of the outlet (rubber-band
 * resistance, then a satisfying pop), swipe the laptop lid shut, tap the
 * tablet's sleep button. Harmless friends (the night-light, the teddy)
 * have no eyes and no ears; tapping them gives a soft teach ("no eyes,
 * no ears, this one can stay"), never a red fail. When every sensing
 * device is asleep the room dims to a peaceful blue-green, the gadgets
 * snore, a green moon rises in the window, and onComplete() fires once
 * from the finish button.
 *
 * Teaches: audit a room with one hero question (can it see or hear me?)
 * and different devices need different off-switches.
 *
 * Forgiving by design: no timer, no fail state, wrong gestures just get
 * a friendly hint. Works with touch and mouse via pointer events.
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

/* ------------------------------------------------------------------ */
/* Constants + content                                                */
/* ------------------------------------------------------------------ */

const STAGE_W = 920;
const STAGE_H = 520;

/* Camera geometry (design px) */
const LENS_X = 118;
const LENS_Y = 125;
const CAP_HOME_X = 176;
const CAP_HOME_Y = 128;
const CAP_DROP_RADIUS = 48;

/* Speaker plug */
const PULL_NEEDED = 92; // raw pointer travel (design px) before the pop
const PULL_VISUAL_MAX = 34; // rubber-band cap on the visible stretch

/* Laptop lid */
const LID_TRAVEL = 120; // raw downward travel (design px) for a full close
const LID_CLOSE_AT = 0.5; // release past this progress finishes the close
const LID_MAX_DEG = 82;

type DeviceId = "camera" | "speaker" | "laptop" | "tablet";
type Phase = "intro" | "play" | "night";
type ToastTone = "green" | "soft" | "hint";

interface Toast {
  key: number;
  tone: ToastTone;
  title: string;
  body?: string;
}

const DEVICES: DeviceId[] = ["camera", "speaker", "laptop", "tablet"];

const SLEEP_TOAST: Record<DeviceId, { title: string; body: string }> = {
  camera: { title: "Cap on!", body: "Now the camera cannot see you." },
  speaker: { title: "Pop! Unplugged!", body: "Now the speaker cannot hear you." },
  laptop: { title: "Lid closed!", body: "No peeking and no listening." },
  tablet: { title: "Fast asleep!", body: "Its camera and mic are resting." },
};

const HINT_TOAST: Record<DeviceId, string> = {
  camera: "Drag the round lens cap onto its eye!",
  speaker: "Grab the plug and pull it out of the outlet!",
  laptop: "Swipe down on the screen to shut the lid!",
  tablet: "Tap the little glowing sleep button!",
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export default function GoodnightGadgets({ onComplete, narration, accent }: { onComplete: () => void; narration?: { speaker?: "adam" | "layla"; lines: string[] }; accent?: string }) {
  const reduce = !!useReducedMotion();

  const [phase, setPhase] = useState<Phase>("intro");
  const [asleep, setAsleep] = useState<Record<DeviceId, boolean>>({
    camera: false,
    speaker: false,
    laptop: false,
    tablet: false,
  });
  const [toast, setToast] = useState<Toast | null>(null);
  const [wobble, setWobble] = useState<{ teddy: number; nightlight: number }>({
    teddy: 0,
    nightlight: 0,
  });
  const [popBurst, setPopBurst] = useState(false);

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
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2800);
  };
  useEffect(
    () => () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    },
    []
  );

  /* -------- sleep + win -------- */

  const sleepDevice = (id: DeviceId) => {
    setAsleep((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
    const t = SLEEP_TOAST[id];
    showToast("green", t.title, t.body);
  };

  useEffect(() => {
    if (phase === "play" && DEVICES.every((d) => asleep[d])) {
      const t = window.setTimeout(() => setPhase("night"), 900);
      timersRef.current.push(t);
    }
  }, [asleep, phase]);

  const completedRef = useRef(false);
  const finish = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  };

  const hintFor = (id: DeviceId) => {
    if (!asleep[id] && phase === "play") showToast("hint", HINT_TOAST[id]);
  };

  const onHarmless = (which: "teddy" | "nightlight") => {
    if (phase !== "play") return;
    setWobble((w) => ({ ...w, [which]: w[which] + 1 }));
    if (which === "teddy") {
      showToast("soft", "Teddy can stay!", "Button eyes cannot see. Cuddle friends are not gadgets.");
    } else {
      showToast("soft", "The night-light can stay!", "No eyes, no ears. It only glows.");
    }
  };

  /* -------- GESTURE 1: drag the lens cap onto the camera -------- */

  const [capDrag, setCapDrag] = useState<{ dx: number; dy: number } | null>(null);
  const capDragRef = useRef({ dx: 0, dy: 0 });
  const capStartRef = useRef<{ x: number; y: number } | null>(null);

  const onCapDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (asleep.camera || phase !== "play") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    capStartRef.current = { x: e.clientX, y: e.clientY };
    capDragRef.current = { dx: 0, dy: 0 };
    setCapDrag({ dx: 0, dy: 0 });
  };
  const onCapMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!capStartRef.current) return;
    const s = scaleRef.current || 1;
    const d = {
      dx: (e.clientX - capStartRef.current.x) / s,
      dy: (e.clientY - capStartRef.current.y) / s,
    };
    capDragRef.current = d;
    setCapDrag(d);
  };
  const onCapUp = () => {
    if (!capStartRef.current) return;
    capStartRef.current = null;
    const d = capDragRef.current;
    const cx = CAP_HOME_X + d.dx;
    const cy = CAP_HOME_Y + d.dy;
    if (Math.hypot(cx - LENS_X, cy - LENS_Y) <= CAP_DROP_RADIUS) {
      sleepDevice("camera");
    }
    setCapDrag(null);
  };

  /* -------- GESTURE 2: pull the speaker plug out of the outlet -------- */

  const [plugPull, setPlugPull] = useState<{ dx: number; dy: number } | null>(null);
  const plugStartRef = useRef<{ x: number; y: number } | null>(null);
  const plugMaxRef = useRef(0);

  const onPlugDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (asleep.speaker || phase !== "play") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    plugStartRef.current = { x: e.clientX, y: e.clientY };
    plugMaxRef.current = 0;
    setPlugPull({ dx: 0, dy: 0 });
  };
  const onPlugMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!plugStartRef.current) return;
    const s = scaleRef.current || 1;
    const dx = (e.clientX - plugStartRef.current.x) / s;
    const dy = (e.clientY - plugStartRef.current.y) / s;
    const mag = Math.hypot(dx, dy);
    plugMaxRef.current = Math.max(plugMaxRef.current, mag);
    if (mag >= PULL_NEEDED) {
      // POP! The plug comes free.
      plugStartRef.current = null;
      setPlugPull(null);
      setPopBurst(true);
      later(() => setPopBurst(false), 700);
      sleepDevice("speaker");
      return;
    }
    setPlugPull({ dx, dy });
  };
  const onPlugUp = () => {
    if (!plugStartRef.current) return;
    plugStartRef.current = null;
    if (plugMaxRef.current < 10) hintFor("speaker");
    setPlugPull(null);
  };

  /* -------- GESTURE 3: swipe the laptop lid shut -------- */

  const [lidDrag, setLidDrag] = useState<number | null>(null);
  const lidStartRef = useRef<number | null>(null);
  const lidProgRef = useRef(0);
  const lidMovedRef = useRef(0);

  const onLidDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (asleep.laptop || phase !== "play") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    lidStartRef.current = e.clientY;
    lidProgRef.current = 0;
    lidMovedRef.current = 0;
    setLidDrag(0);
  };
  const onLidMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (lidStartRef.current === null) return;
    const s = scaleRef.current || 1;
    const dy = (e.clientY - lidStartRef.current) / s;
    lidMovedRef.current = Math.max(lidMovedRef.current, Math.abs(dy));
    const p = clamp(dy / LID_TRAVEL, 0, 1);
    lidProgRef.current = p;
    setLidDrag(p);
  };
  const onLidUp = () => {
    if (lidStartRef.current === null) return;
    lidStartRef.current = null;
    if (lidProgRef.current >= LID_CLOSE_AT) {
      sleepDevice("laptop");
    } else if (lidMovedRef.current < 10) {
      hintFor("laptop");
    }
    setLidDrag(null);
  };

  /* -------- GESTURE 4: tap the tablet's sleep button -------- */

  const onTabletButton = () => {
    if (asleep.tablet || phase !== "play") return;
    sleepDevice("tablet");
  };

  /* -------- derived visuals -------- */

  const sleptCount = DEVICES.filter((d) => asleep[d]).length;
  const lidProgress = asleep.laptop ? 1 : lidDrag ?? 0;

  // Rubber-band stretch for the plug while pulling.
  let plugVis = { x: 0, y: 0 };
  if (plugPull) {
    const mag = Math.hypot(plugPull.dx, plugPull.dy);
    if (mag > 0) {
      const f = Math.min(PULL_VISUAL_MAX, mag * 0.4) / mag;
      plugVis = { x: plugPull.dx * f, y: plugPull.dy * f };
    }
  }

  const springBack = { type: "spring" as const, stiffness: 300, damping: 24 };

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
              color: "#9fe8ff",
              textTransform: "uppercase",
            }}
          >
            Goodnight, Gadgets
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 12px",
              borderRadius: 999,
              background: "rgba(10,18,44,0.7)",
              border: "1px solid rgba(125,240,255,0.35)",
              fontSize: 12.5,
              fontWeight: 700,
              color: "#cfe6ff",
            }}
          >
            <PixIcon emoji="👀" size={16} />
            <span>Ask: can it SEE or HEAR me?</span>
          </div>
        </div>
        <ProgressHud asleep={asleep} count={sleptCount} />
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
              border: "1px solid rgba(125,240,255,0.18)",
              background: "linear-gradient(180deg, #2b3168 0%, #232a58 60%, #1d2450 100%)",
            }}
          >
            {/* floor */}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 392,
                bottom: 0,
                background: "linear-gradient(180deg, #2a2352 0%, #221c45 100%)",
                borderTop: "3px solid rgba(140,150,220,0.35)",
              }}
            />
            {/* rug */}
            <div
              style={{
                position: "absolute",
                left: 340,
                top: 448,
                width: 250,
                height: 44,
                borderRadius: "50%",
                background: "radial-gradient(ellipse, rgba(90,110,220,0.35), rgba(90,110,220,0.08) 70%)",
                border: "2px solid rgba(140,150,230,0.2)",
              }}
            />

            {/* window with night sky (the green moon rises here on win) */}
            <WindowPiece moonUp={phase === "night"} reduce={reduce} />

            {/* wall poster, just for charm */}
            <div
              style={{
                position: "absolute",
                left: 262,
                top: 84,
                width: 52,
                height: 64,
                borderRadius: 8,
                background: "#1b2144",
                border: "2px solid rgba(140,150,230,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PixIcon emoji="🚀" size={30} />
            </div>

            {/* ---------------- CAMERA on its shelf ---------------- */}
            {/* shelf */}
            <div
              style={{
                position: "absolute",
                left: 36,
                top: 150,
                width: 172,
                height: 12,
                borderRadius: 6,
                background: "linear-gradient(180deg, #6d5a9e, #55437f)",
                boxShadow: "0 6px 10px rgba(0,0,0,0.25)",
              }}
            />
            {/* camera body (tap = hint) */}
            <div
              role="button"
              aria-label="Smart camera"
              onClick={() => hintFor("camera")}
              style={{
                position: "absolute",
                left: 48,
                top: 98,
                width: 88,
                height: 52,
                borderRadius: 14,
                background: "linear-gradient(180deg, #e7ecff, #b9c3ea)",
                border: "2px solid #7a86bb",
                cursor: asleep.camera ? "default" : "pointer",
              }}
            >
              {/* recording LED */}
              {!asleep.camera ? (
                <motion.div
                  animate={reduce ? undefined : { opacity: [1, 0.2, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  style={{
                    position: "absolute",
                    left: 10,
                    top: 8,
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#ff5f6b",
                    boxShadow: "0 0 8px rgba(255,95,107,0.9)",
                  }}
                />
              ) : (
                <div
                  style={{
                    position: "absolute",
                    left: 10,
                    top: 8,
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#3c4570",
                  }}
                />
              )}
            </div>
            {/* lens (drop target), positioned at LENS_X/LENS_Y */}
            <div
              style={{
                position: "absolute",
                left: LENS_X - 19,
                top: LENS_Y - 19,
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: asleep.camera
                  ? "#2a2f52"
                  : "radial-gradient(circle at 40% 35%, #7fd8ff 0%, #1c3f77 45%, #0b1533 80%)",
                border: "3px solid #59639a",
                pointerEvents: "none",
              }}
            />
            {/* dashed drop hint around the lens */}
            {!asleep.camera && phase === "play" && (
              <motion.div
                animate={reduce ? undefined : { scale: [1, 1.12, 1], opacity: [0.5, 0.9, 0.5] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                style={{
                  position: "absolute",
                  left: LENS_X - 27,
                  top: LENS_Y - 27,
                  width: 54,
                  height: 54,
                  borderRadius: "50%",
                  border: "2px dashed rgba(125,240,255,0.55)",
                  pointerEvents: "none",
                }}
              />
            )}
            {/* cap ON the lens once the camera sleeps */}
            <AnimatePresence>
              {asleep.camera && (
                <motion.div
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={springBack}
                  style={{
                    position: "absolute",
                    left: LENS_X - 22,
                    top: LENS_Y - 22,
                    pointerEvents: "none",
                  }}
                >
                  <CapDisc />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ---------------- DRESSER + SPEAKER + OUTLET ---------------- */}
            {/* dresser */}
            <div
              style={{
                position: "absolute",
                left: 300,
                top: 348,
                width: 180,
                height: 152,
                borderRadius: "12px 12px 4px 4px",
                background: "linear-gradient(180deg, #5d4b90, #4a3a78)",
                border: "2px solid rgba(30,20,60,0.5)",
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: 14,
                    right: 14,
                    top: 14 + i * 46,
                    height: 34,
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      width: 26,
                      height: 6,
                      borderRadius: 3,
                      transform: "translate(-50%,-50%)",
                      background: "rgba(255,255,255,0.35)",
                    }}
                  />
                </div>
              ))}
            </div>
            {/* speaker (tap = hint) */}
            <div
              role="button"
              aria-label="Smart speaker"
              onClick={() => hintFor("speaker")}
              style={{
                position: "absolute",
                left: 358,
                top: 260,
                width: 64,
                height: 88,
                borderRadius: 16,
                background: asleep.speaker
                  ? "linear-gradient(180deg, #494f79, #383d63)"
                  : "linear-gradient(180deg, #59608f, #434871)",
                border: "2px solid rgba(20,24,52,0.6)",
                cursor: asleep.speaker ? "default" : "pointer",
                overflow: "hidden",
              }}
            >
              {/* light ring on top */}
              <motion.div
                animate={
                  asleep.speaker || reduce
                    ? undefined
                    : { boxShadow: ["0 0 6px rgba(65,230,255,0.5)", "0 0 16px rgba(65,230,255,0.95)", "0 0 6px rgba(65,230,255,0.5)"] }
                }
                transition={{ duration: 1.6, repeat: Infinity }}
                style={{
                  position: "absolute",
                  left: 8,
                  top: 6,
                  right: 8,
                  height: 8,
                  borderRadius: 999,
                  background: asleep.speaker ? "#2b3157" : "#41e6ff",
                }}
              />
              {/* grill dots */}
              <div
                style={{
                  position: "absolute",
                  left: 10,
                  right: 10,
                  top: 24,
                  bottom: 10,
                  backgroundImage: "radial-gradient(rgba(230,238,255,0.35) 1.5px, transparent 1.6px)",
                  backgroundSize: "9px 9px",
                  opacity: asleep.speaker ? 0.4 : 0.8,
                }}
              />
            </div>

            {/* outlet + cord + plug (own SVG layer in local coords) */}
            <div style={{ position: "absolute", left: 330, top: 300, width: 260, height: 190 }}>
              <svg width={260} height={190} viewBox="0 0 260 190" style={{ display: "block" }}>
                {/* outlet plate on the wall */}
                <rect x={182} y={20} width={36} height={48} rx={7} fill="#c9d1f2" stroke="#7a86bb" strokeWidth={2} />
                <rect x={193} y={31} width={14} height={5} rx={2} fill="#39406e" />
                <rect x={193} y={52} width={14} height={5} rx={2} fill="#39406e" />
                {/* cord: from the speaker base, drooping to the plug */}
                {(() => {
                  const px = asleep.speaker ? 150 : 168 + plugVis.x;
                  const py = asleep.speaker ? 132 : 44 + plugVis.y;
                  const tailX = px - 14;
                  const tailY = py;
                  return (
                    <path
                      d={`M 88 52 C 88 130, ${tailX - 46} ${tailY + 56}, ${tailX} ${tailY}`}
                      fill="none"
                      stroke="#1f2650"
                      strokeWidth={5}
                      strokeLinecap="round"
                    />
                  );
                })()}
                {/* the plug itself */}
                {!asleep.speaker ? (
                  <g transform={`translate(${plugVis.x}, ${plugVis.y})`}>
                    {/* prongs sliding out as it stretches */}
                    <rect x={180} y={36} width={Math.max(2, 12 + plugVis.x)} height={4} rx={2} fill="#e8d27b" />
                    <rect x={180} y={53} width={Math.max(2, 12 + plugVis.x)} height={4} rx={2} fill="#e8d27b" />
                    <rect x={152} y={31} width={30} height={31} rx={8} fill="#3a4180" stroke="#171c40" strokeWidth={2} />
                    <rect x={158} y={38} width={12} height={17} rx={4} fill="#5a63a8" />
                  </g>
                ) : (
                  /* popped: dangling free below the dresser edge */
                  <motion.g
                    initial={{ rotate: -30, x: 20, y: -50 }}
                    animate={{ rotate: 24, x: 0, y: 0 }}
                    transition={{ type: "spring", stiffness: 160, damping: 9 }}
                    style={{ originX: "150px", originY: "132px" }}
                  >
                    <rect x={136} y={118} width={30} height={28} rx={8} fill="#3a4180" stroke="#171c40" strokeWidth={2} />
                    <rect x={166} y={124} width={14} height={4} rx={2} fill="#e8d27b" />
                    <rect x={166} y={136} width={14} height={4} rx={2} fill="#e8d27b" />
                  </motion.g>
                )}
                {/* pop burst */}
                {popBurst && (
                  <motion.g
                    initial={{ scale: 0.4, opacity: 1 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 0.55, ease: "easeOut" }}
                    style={{ originX: "196px", originY: "44px" }}
                  >
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
                      <line
                        key={a}
                        x1={196 + 12 * Math.cos((a * Math.PI) / 180)}
                        y1={44 + 12 * Math.sin((a * Math.PI) / 180)}
                        x2={196 + 24 * Math.cos((a * Math.PI) / 180)}
                        y2={44 + 24 * Math.sin((a * Math.PI) / 180)}
                        stroke="#ffe084"
                        strokeWidth={4}
                        strokeLinecap="round"
                      />
                    ))}
                  </motion.g>
                )}
              </svg>
              {/* POP! label */}
              <AnimatePresence>
                {popBurst && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0, y: 6 }}
                    animate={{ scale: 1, opacity: 1, y: -6 }}
                    exit={{ opacity: 0 }}
                    style={{
                      position: "absolute",
                      left: 170,
                      top: -14,
                      fontSize: 20,
                      fontWeight: 900,
                      color: "#ffe084",
                      textShadow: "0 2px 6px rgba(0,0,0,0.5)",
                    }}
                  >
                    POP!
                  </motion.div>
                )}
              </AnimatePresence>
              {/* big invisible grab area over the plug */}
              {!asleep.speaker && (
                <motion.div
                  onPointerDown={onPlugDown}
                  onPointerMove={onPlugMove}
                  onPointerUp={onPlugUp}
                  onPointerCancel={onPlugUp}
                  animate={
                    reduce || plugPull || asleep.speaker || phase !== "play"
                      ? { x: plugVis.x, y: plugVis.y }
                      : { x: [0, -5, 0], y: 0 }
                  }
                  transition={
                    plugPull
                      ? { duration: 0 }
                      : reduce || phase !== "play"
                        ? springBack
                        : { duration: 1.6, repeat: Infinity, repeatDelay: 0.8 }
                  }
                  style={{
                    position: "absolute",
                    left: 140,
                    top: 16,
                    width: 62,
                    height: 62,
                    cursor: "grab",
                    touchAction: "none",
                    borderRadius: 12,
                  }}
                  aria-label="Speaker plug. Pull it out of the outlet."
                  role="button"
                />
              )}
            </div>

            {/* ---------------- DESK + LAPTOP ---------------- */}
            {/* desk */}
            <div
              style={{
                position: "absolute",
                left: 56,
                top: 372,
                width: 216,
                height: 13,
                borderRadius: 6,
                background: "linear-gradient(180deg, #6d5a9e, #55437f)",
              }}
            />
            {[70, 246].map((x) => (
              <div
                key={x}
                style={{
                  position: "absolute",
                  left: x,
                  top: 385,
                  width: 12,
                  height: 114,
                  borderRadius: 4,
                  background: "#4a3a78",
                }}
              />
            ))}
            {/* laptop */}
            <div style={{ position: "absolute", left: 89, top: 260, width: 150, height: 112 }}>
              {/* base slab */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  bottom: 0,
                  width: 150,
                  height: 12,
                  borderRadius: "3px 3px 8px 8px",
                  background: "linear-gradient(180deg, #aab4e4, #7d88c4)",
                  border: "1px solid #5a659f",
                }}
              />
              {/* closed-lid slab, fades in as the lid comes down */}
              <motion.div
                animate={{ opacity: lidProgress > 0.85 ? 1 : 0 }}
                transition={{ duration: 0.25 }}
                style={{
                  position: "absolute",
                  left: 2,
                  bottom: 11,
                  width: 146,
                  height: 8,
                  borderRadius: 4,
                  background: "linear-gradient(180deg, #cdd5f7, #97a1d6)",
                  pointerEvents: "none",
                }}
              />
              {/* sleep LED once closed */}
              {asleep.laptop && (
                <motion.div
                  animate={reduce ? undefined : { opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2.4, repeat: Infinity }}
                  style={{
                    position: "absolute",
                    right: 12,
                    bottom: 14,
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#6fe89b",
                    boxShadow: "0 0 8px rgba(110,255,170,0.8)",
                  }}
                />
              )}
              {/* lid, folding away from the child */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  bottom: 12,
                  width: 150,
                  height: 92,
                  perspective: 620,
                  perspectiveOrigin: "50% 100%",
                }}
              >
                <motion.div
                  onPointerDown={onLidDown}
                  onPointerMove={onLidMove}
                  onPointerUp={onLidUp}
                  onPointerCancel={onLidUp}
                  animate={{ rotateX: lidProgress * LID_MAX_DEG }}
                  transition={lidDrag !== null ? { duration: 0 } : springBack}
                  style={{
                    position: "absolute",
                    inset: 0,
                    transformOrigin: "50% 100%",
                    borderRadius: "10px 10px 3px 3px",
                    background: "#232a58",
                    border: "3px solid #5a659f",
                    overflow: "hidden",
                    cursor: asleep.laptop ? "default" : "grab",
                    touchAction: "none",
                  }}
                  aria-label="Laptop lid. Swipe down to close it."
                  role="button"
                >
                  {/* glowing screen, dims while closing */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 4,
                      borderRadius: 7,
                      background: "linear-gradient(135deg, #3ec3ff 0%, #7c5cff 100%)",
                      opacity: clamp(1 - lidProgress * 1.2, 0, 1),
                    }}
                  >
                    {/* webcam dot + live light */}
                    <div
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: 3,
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        transform: "translateX(-50%)",
                        background: "#101636",
                      }}
                    />
                    <motion.div
                      animate={reduce ? undefined : { opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: 3,
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        transform: "translateX(calc(-50% + 10px))",
                        background: "#6fe89b",
                        boxShadow: "0 0 6px rgba(110,255,170,0.9)",
                      }}
                    />
                    {/* cheerful video on screen */}
                    <div
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: "52%",
                        transform: "translate(-50%,-50%)",
                        width: 0,
                        height: 0,
                        borderTop: "12px solid transparent",
                        borderBottom: "12px solid transparent",
                        borderLeft: "20px solid rgba(255,255,255,0.9)",
                      }}
                    />
                  </div>
                  {/* swipe-down affordance */}
                  {!asleep.laptop && lidDrag === null && phase === "play" && (
                    <motion.div
                      animate={reduce ? undefined : { y: [0, 10, 0], opacity: [0.9, 0.4, 0.9] }}
                      transition={{ duration: 1.6, repeat: Infinity }}
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: 18,
                        transform: "translateX(-50%)",
                        pointerEvents: "none",
                      }}
                    >
                      <svg width={26} height={30} viewBox="0 0 26 30">
                        <path
                          d="M13 3 v18 M5 14 l8 9 8-9"
                          stroke="#ffffff"
                          strokeWidth={4}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                      </svg>
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </div>

            {/* ---------------- NIGHTSTAND + NIGHT-LIGHT (harmless) ---------------- */}
            <div
              style={{
                position: "absolute",
                left: 566,
                top: 420,
                width: 88,
                height: 80,
                borderRadius: "10px 10px 4px 4px",
                background: "linear-gradient(180deg, #5d4b90, #4a3a78)",
                border: "2px solid rgba(30,20,60,0.5)",
              }}
            />
            {/* warm glow (stays on all night, that is the point) */}
            <motion.div
              animate={reduce ? undefined : { opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{
                position: "absolute",
                left: 545,
                top: 300,
                width: 130,
                height: 130,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(255,190,110,0.4) 0%, transparent 65%)",
                pointerEvents: "none",
                zIndex: 3,
              }}
            />
            <motion.div
              key={`nl-${wobble.nightlight}`}
              animate={wobble.nightlight ? { rotate: [0, -7, 7, -4, 0] } : undefined}
              transition={{ duration: 0.5 }}
              onClick={() => onHarmless("nightlight")}
              role="button"
              aria-label="Night-light. It has no eyes and no ears."
              style={{ position: "absolute", left: 584, top: 354, cursor: "pointer", zIndex: 4 }}
            >
              <svg width={52} height={68} viewBox="0 0 52 68">
                <rect x={20} y={34} width={12} height={26} rx={5} fill="#e8d9c2" />
                <rect x={12} y={58} width={28} height={8} rx={4} fill="#c9b797" />
                <path d="M4 34 C4 14, 48 14, 48 34 Z" fill="#ffb473" stroke="#e08b4a" strokeWidth={2} />
                <circle cx={16} cy={27} r={2.5} fill="#fff1dd" />
                <circle cx={30} cy={22} r={3} fill="#fff1dd" />
                <circle cx={40} cy={28} r={2} fill="#fff1dd" />
              </svg>
            </motion.div>

            {/* ---------------- BED + TEDDY + TABLET ---------------- */}
            {/* headboard */}
            <div
              style={{
                position: "absolute",
                left: 878,
                top: 330,
                width: 26,
                height: 168,
                borderRadius: "10px 10px 0 0",
                background: "linear-gradient(180deg, #5d4b90, #4a3a78)",
              }}
            />
            {/* bed base + legs */}
            <div
              style={{
                position: "absolute",
                left: 664,
                top: 440,
                width: 240,
                height: 28,
                borderRadius: 6,
                background: "#4a3a78",
              }}
            />
            {[672, 884].map((x) => (
              <div
                key={x}
                style={{ position: "absolute", left: x, top: 468, width: 12, height: 30, background: "#3c2f63", borderRadius: 3 }}
              />
            ))}
            {/* mattress + pillow + blanket */}
            <div
              style={{
                position: "absolute",
                left: 664,
                top: 410,
                width: 240,
                height: 32,
                borderRadius: "10px 10px 4px 4px",
                background: "linear-gradient(180deg, #d7ddfb, #b4bdec)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 806,
                top: 392,
                width: 66,
                height: 24,
                borderRadius: 12,
                background: "#eef1ff",
                border: "2px solid #c2caf0",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 664,
                top: 402,
                width: 150,
                height: 44,
                borderRadius: "16px 22px 4px 8px",
                background: "linear-gradient(180deg, #2f8f83, #256f66)",
                border: "2px solid rgba(15,60,54,0.5)",
              }}
            />

            {/* teddy (harmless) */}
            <motion.div
              key={`teddy-${wobble.teddy}`}
              animate={wobble.teddy ? { rotate: [0, -8, 8, -4, 0] } : undefined}
              transition={{ duration: 0.5 }}
              onClick={() => onHarmless("teddy")}
              role="button"
              aria-label="Teddy bear. It has no camera eyes and no microphone ears."
              style={{ position: "absolute", left: 806, top: 318, cursor: "pointer", zIndex: 4 }}
            >
              <svg width={76} height={84} viewBox="0 0 76 84">
                <circle cx={22} cy={16} r={9} fill="#a8713f" />
                <circle cx={54} cy={16} r={9} fill="#a8713f" />
                <circle cx={22} cy={16} r={4.5} fill="#d9a56b" />
                <circle cx={54} cy={16} r={4.5} fill="#d9a56b" />
                <circle cx={38} cy={30} r={19} fill="#b07a4f" />
                <ellipse cx={38} cy={37} rx={8.5} ry={6.5} fill="#e6c090" />
                <circle cx={31} cy={26} r={2.6} fill="#241a10" />
                <circle cx={45} cy={26} r={2.6} fill="#241a10" />
                <ellipse cx={38} cy={35} rx={3} ry={2.2} fill="#241a10" />
                <ellipse cx={38} cy={62} rx={17} ry={19} fill="#b07a4f" />
                <ellipse cx={38} cy={64} rx={9} ry={11} fill="#e6c090" />
                <circle cx={18} cy={58} r={7.5} fill="#a8713f" />
                <circle cx={58} cy={58} r={7.5} fill="#a8713f" />
              </svg>
            </motion.div>

            {/* tablet, propped on the blanket */}
            <div
              role="button"
              aria-label="Tablet"
              onClick={() => hintFor("tablet")}
              style={{
                position: "absolute",
                left: 686,
                top: 344,
                width: 104,
                height: 76,
                transform: "rotate(-5deg)",
                borderRadius: 12,
                background: "#20264e",
                border: "3px solid #59639a",
                cursor: asleep.tablet ? "default" : "pointer",
                zIndex: 4,
              }}
            >
              {/* screen */}
              <div
                style={{
                  position: "absolute",
                  inset: 5,
                  borderRadius: 8,
                  overflow: "hidden",
                  background: asleep.tablet
                    ? "linear-gradient(180deg, #10142e, #0b0f24)"
                    : "linear-gradient(135deg, #ff9f68 0%, #ff5f9e 55%, #7c5cff 100%)",
                }}
              >
                {!asleep.tablet ? (
                  <>
                    {/* front camera dot */}
                    <div
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: 2,
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        transform: "translateX(-50%)",
                        background: "#101636",
                      }}
                    />
                    {/* smiley on the bright screen */}
                    <svg
                      width={34}
                      height={34}
                      viewBox="0 0 34 34"
                      style={{ position: "absolute", left: "50%", top: "54%", transform: "translate(-50%,-50%)" }}
                    >
                      <circle cx={17} cy={17} r={13} fill="rgba(255,255,255,0.92)" />
                      <circle cx={12.5} cy={14} r={2} fill="#2b2f55" />
                      <circle cx={21.5} cy={14} r={2} fill="#2b2f55" />
                      <path d="M11 20 q6 6 12 0" stroke="#2b2f55" strokeWidth={2.4} fill="none" strokeLinecap="round" />
                    </svg>
                  </>
                ) : (
                  <svg
                    width={26}
                    height={26}
                    viewBox="0 0 26 26"
                    style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)" }}
                  >
                    <path
                      d="M18 3 a10 10 0 1 0 6 14 a8.5 8.5 0 0 1 -6 -14"
                      fill="#6fe89b"
                      opacity={0.9}
                    />
                  </svg>
                )}
              </div>
              {/* chunky sleep button on the bezel */}
              <div
                role="button"
                aria-label="Tablet sleep button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTabletButton();
                }}
                style={{
                  position: "absolute",
                  right: -22,
                  top: 12,
                  width: 48,
                  height: 48,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: asleep.tablet ? "default" : "pointer",
                }}
              >
                <motion.div
                  animate={
                    asleep.tablet || reduce
                      ? undefined
                      : { boxShadow: ["0 0 4px rgba(125,240,255,0.5)", "0 0 14px rgba(125,240,255,1)", "0 0 4px rgba(125,240,255,0.5)"] }
                  }
                  transition={{ duration: 1.6, repeat: Infinity }}
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: asleep.tablet ? "#2b3157" : "#22d3ee",
                    border: "3px solid #eaf6ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      border: "2.5px solid #10254a",
                      borderTopColor: "transparent",
                      transform: "rotate(45deg)",
                    }}
                  />
                </motion.div>
              </div>
            </div>

            {/* ---------------- sense chips + snores ---------------- */}
            <SenseSpot x={46} y={48} eye asleepNow={asleep.camera} reduce={reduce} />
            <SenseSpot x={344} y={208} ear asleepNow={asleep.speaker} reduce={reduce} />
            <SenseSpot x={96} y={222} eye ear asleepNow={asleep.laptop} reduce={reduce} />
            <SenseSpot x={672} y={298} eye ear asleepNow={asleep.tablet} reduce={reduce} />

            {/* ---------------- draggable lens cap (topmost in the room) ---------------- */}
            {!asleep.camera && (
              <motion.div
                onPointerDown={onCapDown}
                onPointerMove={onCapMove}
                onPointerUp={onCapUp}
                onPointerCancel={onCapUp}
                animate={{
                  x: capDrag?.dx ?? 0,
                  y: capDrag?.dy ?? 0,
                  scale: capDrag ? 1.12 : 1,
                }}
                transition={capDrag ? { duration: 0 } : springBack}
                style={{
                  position: "absolute",
                  left: CAP_HOME_X - 28,
                  top: CAP_HOME_Y - 28,
                  width: 56,
                  height: 56,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: capDrag ? "grabbing" : "grab",
                  touchAction: "none",
                  zIndex: capDrag ? 30 : 6,
                }}
                aria-label="Lens cap. Drag it onto the camera lens."
                role="button"
              >
                <CapDisc />
              </motion.div>
            )}

            {/* ---------------- night falls ---------------- */}
            <AnimatePresence>
              {phase === "night" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.4 }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(180deg, rgba(8,48,62,0.5) 0%, rgba(5,36,50,0.68) 100%)",
                    pointerEvents: "none",
                    zIndex: 8,
                  }}
                />
              )}
            </AnimatePresence>
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
                maxWidth: "min(92%, 560px)",
                padding: "10px 18px",
                borderRadius: 16,
                background:
                  toast.tone === "green"
                    ? "linear-gradient(180deg, #10402c, #0c3323)"
                    : toast.tone === "soft"
                      ? "linear-gradient(180deg, #1d2a55, #172246)"
                      : "linear-gradient(180deg, #10314a, #0c2739)",
                border:
                  toast.tone === "green"
                    ? "2px solid rgba(52,211,153,0.8)"
                    : toast.tone === "soft"
                      ? "2px solid rgba(140,170,255,0.7)"
                      : "2px solid rgba(34,211,238,0.7)",
                boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
              }}
            >
              <PixIcon emoji={toast.tone === "green" ? "✅" : toast.tone === "soft" ? "✨" : "👆"} size={26} />
              <div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 900,
                    color: toast.tone === "green" ? "#8ff5c0" : toast.tone === "soft" ? "#cdd9ff" : "#9fe8ff",
                  }}
                >
                  {toast.title}
                </div>
                {toast.body && (
                  <div style={{ fontSize: 13, color: "#dfe7ff", marginTop: 1 }}>{toast.body}</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* intro */}
      {phase === "intro" && (
        <IntroOverlay onStart={() => setPhase("play")} narration={narration} accent={accent} />
      )}

      {/* finish banner */}
      {phase === "night" && <NightBanner onFinish={finish} />}
    </ExerciseFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Pieces                                                             */
/* ------------------------------------------------------------------ */

/** The lens cap disc (used loose on the shelf AND snapped onto the lens). */
function CapDisc() {
  return (
    <svg width={44} height={44} viewBox="0 0 44 44" style={{ display: "block" }}>
      <circle cx={22} cy={22} r={20} fill="#1a1d38" stroke="#59639a" strokeWidth={3} />
      <circle cx={22} cy={22} r={12} fill="none" stroke="#39406e" strokeWidth={2.5} />
      <circle cx={22} cy={22} r={5} fill="#2c3260" />
      <path d="M22 4 v5 M22 35 v5 M4 22 h5 M35 22 h5" stroke="#59639a" strokeWidth={3} strokeLinecap="round" />
    </svg>
  );
}

/** Sense chips ("SEES" / "HEARS") that blink while awake, or a snore once asleep. */
function SenseSpot({
  x,
  y,
  eye,
  ear,
  asleepNow,
  reduce,
}: {
  x: number;
  y: number;
  eye?: boolean;
  ear?: boolean;
  asleepNow: boolean;
  reduce: boolean;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        display: "flex",
        gap: 6,
        pointerEvents: "none",
        zIndex: 7,
      }}
    >
      <AnimatePresence>
        {!asleepNow && eye && <SenseChip key="eye" kind="sees" reduce={reduce} />}
        {!asleepNow && ear && <SenseChip key="ear" kind="hears" reduce={reduce} />}
      </AnimatePresence>
      {asleepNow && <Zzz reduce={reduce} />}
    </div>
  );
}

function SenseChip({ kind, reduce }: { kind: "sees" | "hears"; reduce: boolean }) {
  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={reduce ? { scale: 1, opacity: 1 } : { scale: [1, 1.07, 1], opacity: 1 }}
      exit={{ scale: 0, opacity: 0, transition: { duration: 0.3 } }}
      transition={reduce ? undefined : { scale: { duration: 2.2, repeat: Infinity }, opacity: { duration: 0.3 } }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 9px",
        borderRadius: 999,
        background: "rgba(8,13,34,0.9)",
        border: `1.5px solid ${kind === "sees" ? "rgba(125,240,255,0.7)" : "rgba(255,209,102,0.7)"}`,
        boxShadow: "0 4px 10px rgba(0,0,0,0.35)",
      }}
    >
      {kind === "sees" ? (
        <motion.div
          animate={reduce ? undefined : { scaleY: [1, 1, 0.12, 1, 1] }}
          transition={{ duration: 3.2, repeat: Infinity, times: [0, 0.45, 0.5, 0.55, 1] }}
          style={{ display: "flex" }}
        >
          <svg width={17} height={13} viewBox="0 0 24 18">
            <ellipse cx={12} cy={9} rx={11} ry={7.5} fill="#eaf6ff" stroke="#39406e" strokeWidth={1.5} />
            <circle cx={12} cy={9} r={4} fill="#2b3f8f" />
            <circle cx={13.5} cy={7.5} r={1.3} fill="#fff" />
          </svg>
        </motion.div>
      ) : (
        <svg width={17} height={14} viewBox="0 0 17 14">
          <circle cx={3.5} cy={7} r={2.4} fill="#ffd166" />
          <motion.path
            d="M8 3 a5 5 0 0 1 0 8"
            stroke="#ffd166"
            strokeWidth={1.8}
            fill="none"
            strokeLinecap="round"
            animate={reduce ? undefined : { opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          />
          <motion.path
            d="M11 1 a8 8 0 0 1 0 12"
            stroke="#ffd166"
            strokeWidth={1.8}
            fill="none"
            strokeLinecap="round"
            animate={reduce ? undefined : { opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: 0.25 }}
          />
        </svg>
      )}
      <span
        style={{
          fontSize: 10,
          fontWeight: 900,
          letterSpacing: 1.2,
          color: kind === "sees" ? "#bfefff" : "#ffe6ae",
        }}
      >
        {kind === "sees" ? "SEES" : "HEARS"}
      </span>
    </motion.div>
  );
}

/** Floating snore over a sleeping gadget. */
function Zzz({ reduce }: { reduce: boolean }) {
  if (reduce) {
    return (
      <div style={{ fontWeight: 900, color: "#8ff5c0", fontSize: 16, textShadow: "0 0 8px rgba(110,255,170,0.5)" }}>
        Zzz
      </div>
    );
  }
  return (
    <div style={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: [0, 1, 0], y: [6, -12] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.55, ease: "easeOut" }}
          style={{
            fontWeight: 900,
            color: "#8ff5c0",
            fontSize: 11 + i * 4,
            lineHeight: 1,
            textShadow: "0 0 8px rgba(110,255,170,0.6)",
          }}
        >
          z
        </motion.span>
      ))}
    </div>
  );
}

/** The window: night sky, twinkling stars, and the green moon on the win. */
function WindowPiece({ moonUp, reduce }: { moonUp: boolean; reduce: boolean }) {
  const stars = [
    { x: 26, y: 26 },
    { x: 74, y: 16 },
    { x: 122, y: 34 },
    { x: 48, y: 62 },
    { x: 104, y: 72 },
  ];
  return (
    <div
      style={{
        position: "absolute",
        left: 380,
        top: 36,
        width: 190,
        height: 168,
        borderRadius: 14,
        border: "9px solid #3a4384",
        background: "linear-gradient(180deg, #0b1130 0%, #101a3e 100%)",
        overflow: "hidden",
        boxShadow: "inset 0 0 24px rgba(0,0,0,0.5)",
      }}
    >
      {stars.map((s, i) => (
        <motion.div
          key={i}
          animate={reduce ? undefined : { opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2 + (i % 3) * 0.7, repeat: Infinity, delay: i * 0.4 }}
          style={{
            position: "absolute",
            left: s.x,
            top: s.y,
            width: 3.5,
            height: 3.5,
            borderRadius: "50%",
            background: "#dfe9ff",
          }}
        />
      ))}
      {/* window cross bar */}
      <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 6, background: "#3a4384", transform: "translateX(-50%)" }} />
      {/* the green moon rises */}
      {moonUp && (
        <motion.div
          initial={{ y: 150, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: reduce ? 0.4 : 1.8, ease: "easeOut", delay: 0.2 }}
          style={{ position: "absolute", left: 62, top: 24 }}
        >
          <svg width={62} height={62} viewBox="0 0 62 62">
            <circle cx={31} cy={31} r={26} fill="#6fe89b" />
            <circle cx={22} cy={24} r={5} fill="#54cf82" />
            <circle cx={38} cy={38} r={7} fill="#54cf82" />
            <circle cx={40} cy={20} r={3.5} fill="#54cf82" />
          </svg>
          <div
            style={{
              position: "absolute",
              inset: -14,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(110,255,170,0.35) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
        </motion.div>
      )}
    </div>
  );
}

/** 4 sleep slots + count. */
function ProgressHud({ asleep, count }: { asleep: Record<DeviceId, boolean>; count: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ display: "flex", gap: 6 }}>
        {DEVICES.map((d) => (
          <div
            key={d}
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 900,
              color: asleep[d] ? "#0c2b1c" : "rgba(207,230,255,0.5)",
              background: asleep[d] ? "linear-gradient(180deg, #6fe89b, #34d399)" : "rgba(10,18,44,0.7)",
              border: asleep[d] ? "2px solid #a7f6c8" : "2px solid rgba(125,240,255,0.3)",
              boxShadow: asleep[d] ? "0 0 10px rgba(110,255,170,0.5)" : undefined,
              transition: "all 0.3s ease",
            }}
          >
            z
          </div>
        ))}
      </div>
      <div style={{ fontSize: 13, fontWeight: 800, color: "#cfe6ff" }}>{count} of 4 asleep</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Overlays                                                           */
/* ------------------------------------------------------------------ */

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
    { color: "#7df0ff", text: "Camera: drag its cap onto the lens" },
    { color: "#ffd166", text: "Speaker: pull its plug from the outlet" },
    { color: "#b79cff", text: "Laptop: swipe its lid shut" },
    { color: "#8ff5c0", text: "Tablet: tap its sleep button" },
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
        background: "rgba(9,12,30,0.82)",
      }}
    >
      <motion.div
        initial={{ y: 24, scale: 0.96 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        style={{
          width: "min(100%, 500px)",
          borderRadius: 24,
          background: "linear-gradient(180deg, #171d44, #121737)",
          border: "1px solid rgba(125,240,255,0.35)",
          boxShadow: "0 30px 60px rgba(0,0,0,0.45)",
          textAlign: "center",
          // The spoken-instruction block makes the card taller than a short
          // viewport. The content scrolls in its own region and the start
          // button lives in a PINNED footer, so it is always on screen.
          display: "flex",
          flexDirection: "column",
          maxHeight: "100%",
          overflow: "hidden",
        }}
      >
        <div style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto", padding: "26px 28px 10px" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 10 }}>
          <PixIcon emoji="👀" size={34} />
          <PixIcon emoji="🔔" size={34} />
        </div>
        <div style={{ fontSize: 27, fontWeight: 900, color: "#eaf2ff", marginBottom: 8 }}>
          Goodnight, Gadgets
        </div>
        <div style={{ fontSize: 15, lineHeight: 1.5, color: "#c6d3f7", marginBottom: 16 }}>
          It is bedtime, hero! Ask every gadget one question:{" "}
          <b style={{ color: "#9fe8ff" }}>can it SEE or HEAR me?</b> If it can, tuck it in. Each
          gadget sleeps its own way:
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
                color: "#dfe7ff",
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
        <div style={{ fontSize: 14, color: "#aebadf", marginBottom: 18 }}>
          No eyes and no ears? Then it can stay up with you.
        </div>
        {narration && narration.lines.length > 0 && (
          <div style={{ textAlign: "left" }}>
            <InfoNarration lines={narration.lines} accent={accent ?? "#45e3ff"} />
          </div>
        )}
        </div>
        <div style={{ flex: "0 0 auto", padding: "12px 28px 20px" }}>
        <button
          onClick={onStart}
          style={{
            fontSize: 19,
            fontWeight: 900,
            padding: "14px 40px",
            borderRadius: 999,
            border: "none",
            cursor: "pointer",
            color: "#07130c",
            background: "linear-gradient(180deg, #6fe89b, #34d399)",
            boxShadow: "0 10px 26px rgba(52,211,153,0.4)",
            fontFamily: "inherit",
          }}
        >
          Start bedtime
        </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function NightBanner({ onFinish }: { onFinish: () => void }) {
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
          width: "min(92%, 520px)",
          borderRadius: 22,
          padding: "20px 26px",
          textAlign: "center",
          background: "linear-gradient(180deg, #0d3a2a, #0a2e21)",
          border: "2px solid rgba(52,211,153,0.75)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5), 0 0 30px rgba(52,211,153,0.25)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 6 }}>
          <PixIcon emoji="⭐" size={26} />
          <PixIcon emoji="✨" size={26} />
          <PixIcon emoji="⭐" size={26} />
        </div>
        <div style={{ fontSize: 24, fontWeight: 900, color: "#8ff5c0", letterSpacing: 1 }}>
          GOODNIGHT, GADGETS!
        </div>
        <div style={{ fontSize: 14.5, color: "#d9f5e6", margin: "8px 0 16px", lineHeight: 1.5 }}>
          Every eye and ear is off, and your gadget friends are snoring. You checked the whole room
          like a hero: <b>can it see or hear me?</b>
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
