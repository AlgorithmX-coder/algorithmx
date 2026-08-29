"use client";

/**
 * CalmDownConsole — Week 11 (Emergency Protocol) signature exercise.
 *
 * Something has gone wrong online and the Alert Center is chaos: sirens
 * flash, the room shakes, and the three emergency steps on the wall are a
 * blur. A glowing breath-ring pulses in the middle. The child PRESSES AND
 * HOLDS while the ring expands (breathe in) and RELEASES as it shrinks
 * (breathe out). Every completed breath calms one layer of the room (siren
 * fades, shaking stops, one wall step sharpens into focus). Off-rhythm
 * holds never punish; the guide simply re-syncs ("Find my rhythm again").
 * After 3 breaths the room is calm and readable, and the child taps the
 * big TELL A GROWN-UP button. Win = room calmed + grown-up told.
 *
 * Teaches: step one of ANY emergency is calming yourself. The steps
 * literally cannot be read until you do.
 *
 * Self-contained by design: all copy lives here, deps are react +
 * framer-motion + ExerciseFrame + PixIcon + inline SVG only.
 */

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import PixIcon from "@/app/components/lesson/PixIcon";

/* ------------------------------------------------------------------ */
/* Content                                                            */
/* ------------------------------------------------------------------ */

const STEPS = [
  { emoji: "✋", label: "STEP 1", text: "STOP. Take slow hero breaths." },
  { emoji: "⏸️", label: "STEP 2", text: "STEP AWAY. Do not tap anything else." },
  { emoji: "💬", label: "STEP 3", text: "TELL a grown-up right away." },
] as const;

const CALM_MESSAGES = [
  "Great breath! The sirens are fading...",
  "Another one! The shaking stopped.",
  "The room is calm. Look at the wall!",
] as const;

const METER_LABELS = ["PANIC!", "CALMING...", "ALMOST...", "CALM"] as const;

/* Timing (ms) */
const INHALE_MS = 2800;
const HOLD_TOP_MS = 650;
const EXHALE_MS = 2800;
const RESYNC_MS = 1600;
const SUCCESS_MS = 1300;
const BREATHS_NEEDED = 3;

/* Palette */
const CYAN = "#7df0ff";
const GOOD_GREEN = "#34d399";
const BAD_RED = "#ff5d5d";
const SOFT_INK = "#e7ecff";

type Phase = "intro" | "play" | "tell" | "celebrate";
type Stage = "idle" | "inhale" | "top" | "exhale" | "success" | "resync" | "done";
type MsgKey = "idle" | "inhale" | "top" | "exhale" | "letgo" | "resync" | "success";

/** Smoothstep so the ring eases at both ends of a breath. */
function smooth(p: number): number {
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  return p * p * (3 - 2 * p);
}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export default function CalmDownConsole({ onComplete }: { onComplete: () => void }) {
  const reduce = !!useReducedMotion();

  const [phase, setPhase] = useState<Phase>("intro");
  const [stage, setStage] = useState<Stage>("idle");
  const [calm, setCalm] = useState(0);
  const [holding, setHolding] = useState(false);
  const [msgKey, setMsgKey] = useState<MsgKey>("idle");

  const phaseRef = useRef<Phase>("intro");
  const stageRef = useRef<Stage>("idle");
  const stageStartRef = useRef(0);
  const holdingRef = useRef(false);
  const calmRef = useRef(0);
  const releasedRef = useRef(false);
  const lateWarnRef = useRef(false);
  const lastTsRef = useRef(0);
  const completedRef = useRef(false);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  /* Breath fullness 0..1 drives the ring size + glow every frame. */
  const fullness = useMotionValue(0.08);
  const ringScale = useTransform(fullness, [0, 1], [0.5, 1.12]);
  const glowOpacity = useTransform(fullness, [0, 1], [0.22, 0.85]);

  const goStage = (s: Stage) => {
    stageRef.current = s;
    stageStartRef.current = typeof performance !== "undefined" ? performance.now() : Date.now();
    setStage(s);
  };

  /* --------------------------- game loop --------------------------- */

  useEffect(() => {
    if (phase !== "play") return;
    let raf = 0;
    lastTsRef.current = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(50, now - lastTsRef.current);
      lastTsRef.current = now;
      const el = now - stageStartRef.current;
      const v = fullness.get();
      const lerpTo = (target: number, rate: number) => {
        fullness.set(v + (target - v) * Math.min(1, dt * rate));
      };

      switch (stageRef.current) {
        case "idle": {
          // Still holding from the last breath? Roll straight into the next
          // inhale so a small hand never gets "stuck".
          if (holdingRef.current) {
            releasedRef.current = false;
            lateWarnRef.current = false;
            goStage("inhale");
            setMsgKey("inhale");
            break;
          }
          // Gentle invitation pulse so the ring visibly "breathes" on its own.
          const target = 0.08 + 0.05 * (0.5 + 0.5 * Math.sin(now / 650));
          lerpTo(target, 0.008);
          break;
        }
        case "inhale": {
          const p = el / INHALE_MS;
          if (!holdingRef.current) {
            // Released early. Near the top counts; otherwise gently re-sync.
            if (p >= 0.7) {
              releasedRef.current = true;
              lateWarnRef.current = false;
              goStage("exhale");
              setMsgKey("exhale");
            } else {
              goStage("resync");
              setMsgKey("resync");
            }
            break;
          }
          if (p >= 1) {
            fullness.set(1);
            goStage("top");
            setMsgKey("top");
            break;
          }
          lerpTo(smooth(p), 0.02);
          break;
        }
        case "top": {
          fullness.set(1);
          if (!holdingRef.current || el >= HOLD_TOP_MS) {
            releasedRef.current = !holdingRef.current;
            lateWarnRef.current = false;
            goStage("exhale");
            setMsgKey("exhale");
          }
          break;
        }
        case "exhale": {
          const p = el / EXHALE_MS;
          if (!holdingRef.current) releasedRef.current = true;
          if (holdingRef.current && p > 0.4 && !lateWarnRef.current) {
            lateWarnRef.current = true;
            setMsgKey("letgo");
          }
          if (p >= 1) {
            if (releasedRef.current) {
              calmRef.current += 1;
              setCalm(calmRef.current);
              goStage("success");
              setMsgKey("success");
            } else {
              goStage("resync");
              setMsgKey("resync");
            }
            break;
          }
          lerpTo(1 - smooth(p), 0.02);
          break;
        }
        case "success": {
          lerpTo(0.08, 0.006);
          if (el >= SUCCESS_MS) {
            if (calmRef.current >= BREATHS_NEEDED) {
              goStage("done");
              setPhase("tell");
            } else {
              goStage("idle");
              setMsgKey("idle");
            }
          }
          break;
        }
        case "resync": {
          lerpTo(0.08, 0.01);
          if (el >= RESYNC_MS) {
            goStage("idle");
            setMsgKey("idle");
          }
          break;
        }
        case "done":
          lerpTo(0.08, 0.006);
          break;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  /* ------------------------- press / release ------------------------ */

  const press = () => {
    if (phaseRef.current !== "play") return;
    holdingRef.current = true;
    setHolding(true);
    const s = stageRef.current;
    if (s === "idle" || s === "resync") {
      releasedRef.current = false;
      lateWarnRef.current = false;
      goStage("inhale");
      setMsgKey("inhale");
    }
  };

  const release = () => {
    holdingRef.current = false;
    setHolding(false);
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* pointer capture is best-effort */
    }
    press();
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (e.code === "Space" || e.code === "Enter") {
      e.preventDefault();
      if (!e.repeat) press();
    }
  };
  const onKeyUp = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (e.code === "Space" || e.code === "Enter") {
      e.preventDefault();
      release();
    }
  };

  /* --------------------------- celebrate ---------------------------- */

  useEffect(() => {
    if (phase !== "celebrate") return;
    const t = setTimeout(() => {
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete();
      }
    }, 2600);
    return () => clearTimeout(t);
  }, [phase, onComplete]);

  /* ---------------------------- visuals ----------------------------- */

  const chaosLevel = Math.max(0, BREATHS_NEEDED - calm); // 3 → 0
  const shakeAmp = reduce ? 0 : [0, 1.4, 3.5, 7][chaosLevel];
  const strobe = [
    { peak: 0, dur: 2 },
    { peak: 0.07, dur: 1.7 },
    { peak: 0.17, dur: 0.95 },
    { peak: 0.3, dur: 0.55 },
  ][chaosLevel];

  const message: string = (() => {
    switch (msgKey) {
      case "idle":
        return calm === 0 ? "Press and HOLD to breathe in with me" : "Press and HOLD for the next breath";
      case "inhale":
        return "Breathe in... fill the ring";
      case "top":
        return "Hold it...";
      case "exhale":
        return "And breathe out... let it shrink";
      case "letgo":
        return "Let go softly to breathe out";
      case "resync":
        return "That's okay. Find my rhythm again";
      case "success":
        return CALM_MESSAGES[Math.min(CALM_MESSAGES.length - 1, Math.max(0, calm - 1))];
    }
  })();

  const messageColor =
    msgKey === "success" ? GOOD_GREEN : msgKey === "resync" ? CYAN : msgKey === "letgo" ? "#ffd08a" : SOFT_INK;

  const ringBorder = stage === "success" ? GOOD_GREEN : holding ? "#aef6ff" : CYAN;

  return (
    <ExerciseFrame padding={24}>
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        {/* ------------------------------ HUD ------------------------------ */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <PixIcon emoji="🔔" size={26} />
            <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: 1.5, color: SOFT_INK }}>
              ALERT CENTER
            </span>
          </div>

          {/* Calm meter: three segments turn red → green, one per breath */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", gap: 6 }}>
              {[0, 1, 2].map((i) => {
                const lit = i < calm;
                return (
                  <motion.div
                    key={i}
                    animate={
                      lit || reduce
                        ? { opacity: 1 }
                        : { opacity: [0.9, 0.35, 0.9] }
                    }
                    transition={lit || reduce ? { duration: 0.3 } : { duration: 0.5 + calm * 0.35, repeat: Infinity }}
                    style={{
                      width: 44,
                      height: 14,
                      borderRadius: 7,
                      background: lit ? GOOD_GREEN : BAD_RED,
                      boxShadow: lit
                        ? `0 0 10px rgba(52, 211, 153, 0.7)`
                        : `0 0 10px rgba(255, 93, 93, 0.55)`,
                    }}
                  />
                );
              })}
            </div>
            <span
              style={{
                fontWeight: 800,
                fontSize: 14,
                letterSpacing: 1,
                minWidth: 92,
                color: calm >= BREATHS_NEEDED ? GOOD_GREEN : calm > 0 ? "#ffd08a" : BAD_RED,
              }}
            >
              {METER_LABELS[Math.min(calm, METER_LABELS.length - 1)]}
            </span>
          </div>
        </div>

        {/* ------------------------------ ROOM ----------------------------- */}
        <motion.div
          key={`shake-${chaosLevel}`}
          animate={
            shakeAmp === 0
              ? { x: 0, y: 0 }
              : {
                  x: [0, -shakeAmp, shakeAmp, -shakeAmp * 0.6, shakeAmp * 0.6, 0],
                  y: [0, shakeAmp * 0.5, -shakeAmp * 0.5, shakeAmp * 0.3, -shakeAmp * 0.3, 0],
                }
          }
          transition={shakeAmp === 0 ? { duration: 0.4 } : { duration: 0.38, repeat: Infinity, ease: "linear" }}
          style={{
            position: "relative",
            borderRadius: 20,
            overflow: "hidden",
            background: "linear-gradient(180deg, rgba(8, 12, 30, 0.85) 0%, rgba(13, 19, 44, 0.85) 100%)",
            border: "1px solid rgba(125, 240, 255, 0.14)",
            minHeight: 470,
            display: "flex",
            flexDirection: "column",
            padding: "18px 16px 16px",
          }}
        >
          {/* siren strobe vignette */}
          <motion.div
            aria-hidden
            animate={
              strobe.peak === 0
                ? { opacity: 0 }
                : reduce
                  ? { opacity: strobe.peak * 0.5 }
                  : { opacity: [strobe.peak, strobe.peak * 0.2, strobe.peak] }
            }
            transition={
              strobe.peak === 0 || reduce ? { duration: 0.8 } : { duration: strobe.dur, repeat: Infinity }
            }
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background:
                "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(255, 60, 60, 0.55) 100%)",
              zIndex: 2,
            }}
          />

          {/* siren lamps */}
          {[{ left: 18 }, { right: 18 }].map((pos, i) => (
            <motion.div
              key={i}
              aria-hidden
              animate={
                strobe.peak === 0
                  ? { opacity: 0.12 }
                  : reduce
                    ? { opacity: 0.5 }
                    : { opacity: [1, 0.25, 1] }
              }
              transition={
                strobe.peak === 0 || reduce
                  ? { duration: 0.8 }
                  : { duration: strobe.dur, repeat: Infinity, delay: i * strobe.dur * 0.5 }
              }
              style={{
                position: "absolute",
                top: 14,
                ...pos,
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: strobe.peak === 0 ? GOOD_GREEN : BAD_RED,
                boxShadow:
                  strobe.peak === 0
                    ? "0 0 14px rgba(52, 211, 153, 0.8)"
                    : "0 0 22px 6px rgba(255, 70, 70, 0.75)",
                zIndex: 3,
              }}
            />
          ))}

          {/* floating warning triangles during heavy chaos */}
          <AnimatePresence>
            {chaosLevel >= 2 &&
              ([
                { top: "16%", left: "8%", delay: 0 },
                { top: "12%", right: "10%", delay: 0.3 },
                { bottom: "22%", left: "12%", delay: 0.6 },
              ] as Array<{
                top?: string;
                bottom?: string;
                left?: string;
                right?: string;
                delay: number;
              }>).map((pos, i) => (
                <motion.div
                  key={`warn-${i}`}
                  aria-hidden
                  initial={{ opacity: 0 }}
                  animate={reduce ? { opacity: 0.5 } : { opacity: [0.8, 0.2, 0.8] }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={
                    reduce
                      ? { duration: 0.6 }
                      : { duration: 0.9, repeat: Infinity, delay: pos.delay }
                  }
                  style={{
                    position: "absolute",
                    top: pos.top,
                    bottom: pos.bottom,
                    left: pos.left,
                    right: pos.right,
                    zIndex: 3,
                    pointerEvents: "none",
                  }}
                >
                  <svg width="34" height="30" viewBox="0 0 34 30">
                    <path
                      d="M17 2 L32 28 H2 Z"
                      fill="#ffb020"
                      stroke="#ff8a00"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                    <rect x="15.4" y="9" width="3.2" height="9.5" rx="1.6" fill="#3a2a00" />
                    <circle cx="17" cy="23" r="2.1" fill="#3a2a00" />
                  </svg>
                </motion.div>
              ))}
          </AnimatePresence>

          {/* -------------------- protocol wall (3 steps) -------------------- */}
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
              zIndex: 4,
              marginTop: 8,
            }}
          >
            {STEPS.map((step, i) => {
              const readable = calm > i;
              return (
                <motion.div
                  key={step.label}
                  animate={{
                    filter: readable ? "blur(0px)" : `blur(${Math.max(4, 7 - calm * 1.2)}px)`,
                    opacity: readable ? 1 : 0.7,
                    scale: readable ? 1 : 0.98,
                  }}
                  transition={{ duration: 0.7 }}
                  style={{
                    width: 200,
                    minWidth: 160,
                    padding: "12px 14px",
                    borderRadius: 14,
                    background: "rgba(10, 16, 38, 0.8)",
                    border: readable
                      ? "2px solid rgba(52, 211, 153, 0.6)"
                      : "1px solid rgba(255, 93, 93, 0.35)",
                    boxShadow: readable ? "0 0 18px rgba(52, 211, 153, 0.25)" : "none",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    textAlign: "center",
                  }}
                >
                  <PixIcon emoji={step.emoji} size={30} />
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: 2,
                      color: readable ? GOOD_GREEN : "rgba(231, 236, 255, 0.6)",
                    }}
                  >
                    {step.label}
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3, color: SOFT_INK }}>
                    {step.text}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* ----------------------- center: breath ring ---------------------- */}
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 4,
              minHeight: 250,
            }}
          >
            <AnimatePresence mode="wait">
              {phase !== "tell" && phase !== "celebrate" ? (
                <motion.button
                  key="breath-ring"
                  type="button"
                  aria-label="Press and hold to breathe in, let go to breathe out"
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.5 }}
                  onPointerDown={onPointerDown}
                  onPointerUp={release}
                  onPointerCancel={release}
                  onLostPointerCapture={release}
                  onKeyDown={onKeyDown}
                  onKeyUp={onKeyUp}
                  onContextMenu={(e) => e.preventDefault()}
                  style={{
                    position: "relative",
                    width: 290,
                    height: 290,
                    borderRadius: "50%",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    touchAction: "none",
                    WebkitTapHighlightColor: "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                  }}
                >
                  {/* dashed guide ring = the breathe-in target size */}
                  <motion.div
                    aria-hidden
                    animate={reduce ? { rotate: 0 } : { rotate: 360 }}
                    transition={reduce ? undefined : { duration: 26, repeat: Infinity, ease: "linear" }}
                    style={{
                      position: "absolute",
                      width: 252,
                      height: 252,
                      borderRadius: "50%",
                      border: "3px dashed rgba(125, 240, 255, 0.4)",
                    }}
                  />
                  {/* glow that swells with the breath */}
                  <motion.div
                    aria-hidden
                    style={{
                      position: "absolute",
                      width: 250,
                      height: 250,
                      borderRadius: "50%",
                      background:
                        "radial-gradient(circle, rgba(125, 240, 255, 0.35) 0%, transparent 70%)",
                      opacity: glowOpacity,
                      scale: ringScale,
                    }}
                  />
                  {/* the breath ring itself */}
                  <motion.div
                    animate={{ borderColor: ringBorder }}
                    transition={{ duration: 0.4 }}
                    style={{
                      position: "absolute",
                      width: 216,
                      height: 216,
                      borderRadius: "50%",
                      border: `6px solid ${CYAN}`,
                      background:
                        "radial-gradient(circle, rgba(20, 34, 70, 0.9) 0%, rgba(15, 24, 52, 0.7) 100%)",
                      scale: ringScale,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 0 24px rgba(125, 240, 255, 0.3)",
                    }}
                  >
                    <PixIcon emoji="🌀" size={48} style={{ opacity: 0.9 }} />
                  </motion.div>
                  {/* green pop on each completed breath */}
                  <AnimatePresence>
                    {stage === "success" && (
                      <motion.div
                        key={`pop-${calm}`}
                        aria-hidden
                        initial={{ scale: 0.55, opacity: 0.85 }}
                        animate={{ scale: 1.55, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.9, ease: "easeOut" }}
                        style={{
                          position: "absolute",
                          width: 216,
                          height: 216,
                          borderRadius: "50%",
                          border: `6px solid ${GOOD_GREEN}`,
                          pointerEvents: "none",
                        }}
                      />
                    )}
                  </AnimatePresence>
                </motion.button>
              ) : (
                <motion.div
                  key="tell-zone"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <span style={{ fontSize: 18, fontWeight: 700, color: SOFT_INK, textAlign: "center" }}>
                    You can read the steps now. Do the last one!
                  </span>
                  <motion.button
                    type="button"
                    onClick={() => {
                      if (phase === "tell") setPhase("celebrate");
                    }}
                    animate={reduce ? { scale: 1 } : { scale: [1, 1.05, 1] }}
                    transition={reduce ? undefined : { duration: 1.4, repeat: Infinity }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "20px 38px",
                      borderRadius: 999,
                      border: "none",
                      cursor: "pointer",
                      background: `linear-gradient(180deg, ${GOOD_GREEN} 0%, #10b981 100%)`,
                      color: "#04251a",
                      fontSize: 25,
                      fontWeight: 800,
                      letterSpacing: 0.5,
                      boxShadow: "0 0 34px rgba(52, 211, 153, 0.5)",
                      fontFamily: "inherit",
                    }}
                  >
                    <PixIcon emoji="💬" size={34} />
                    TELL A GROWN-UP
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* --------------------------- coach line --------------------------- */}
          <div
            style={{
              minHeight: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 4,
            }}
          >
            {phase === "play" && (
              <AnimatePresence mode="wait">
                <motion.span
                  key={`${msgKey}-${calm}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    fontSize: 19,
                    fontWeight: 700,
                    color: messageColor,
                    textAlign: "center",
                  }}
                >
                  {message}
                </motion.span>
              </AnimatePresence>
            )}
          </div>
        </motion.div>

        {/* ------------------------------ INTRO ----------------------------- */}
        <AnimatePresence>
          {phase === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                ...overlayStyle,
                zIndex: 30,
              }}
            >
              <motion.div
                animate={reduce ? { rotate: 0 } : { rotate: [-8, 8, -8] }}
                transition={reduce ? undefined : { duration: 0.5, repeat: Infinity }}
              >
                <PixIcon emoji="🔔" size={64} />
              </motion.div>
              <h2 style={{ fontSize: 30, fontWeight: 800, margin: 0, color: SOFT_INK, textAlign: "center" }}>
                THE CALM-DOWN CONSOLE
              </h2>
              <p
                style={{
                  fontSize: 18,
                  lineHeight: 1.5,
                  maxWidth: 460,
                  textAlign: "center",
                  margin: 0,
                  color: "rgba(231, 236, 255, 0.9)",
                }}
              >
                Uh oh! Something went wrong online and the Alert Center is going WILD. The emergency
                steps are on the wall, but you cannot read them yet. Calm the room with slow hero
                breaths.
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 18px",
                  borderRadius: 12,
                  background: "rgba(125, 240, 255, 0.1)",
                  border: "1px solid rgba(125, 240, 255, 0.3)",
                }}
              >
                <PixIcon emoji="👆" size={26} />
                <span style={{ fontSize: 16, fontWeight: 700, color: CYAN }}>
                  Press and HOLD the ring to breathe in. Let GO to breathe out.
                </span>
              </div>
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  goStage("idle");
                  setMsgKey("idle");
                  setPhase("play");
                }}
                style={{
                  padding: "16px 42px",
                  borderRadius: 999,
                  border: "none",
                  cursor: "pointer",
                  background: `linear-gradient(180deg, ${CYAN} 0%, #38bdf8 100%)`,
                  color: "#062033",
                  fontSize: 21,
                  fontWeight: 800,
                  letterSpacing: 1,
                  boxShadow: "0 0 28px rgba(125, 240, 255, 0.45)",
                  fontFamily: "inherit",
                }}
              >
                I&apos;M READY
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---------------------------- CELEBRATE ---------------------------- */}
        <AnimatePresence>
          {phase === "celebrate" && (
            <motion.div
              key="celebrate"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              style={{
                ...overlayStyle,
                zIndex: 40,
              }}
            >
              <motion.div
                initial={{ scale: 0.4 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 16 }}
              >
                <PixIcon emoji="✅" size={84} />
              </motion.div>
              <h2 style={{ fontSize: 28, fontWeight: 800, margin: 0, color: GOOD_GREEN, textAlign: "center" }}>
                Emergency handled!
              </h2>
              <p
                style={{
                  fontSize: 18,
                  lineHeight: 1.5,
                  maxWidth: 440,
                  textAlign: "center",
                  margin: 0,
                  color: "rgba(231, 236, 255, 0.92)",
                }}
              >
                You calmed yourself FIRST, then told a grown-up. That is exactly what a Cyber Hero
                does in an emergency.
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3 + i * 0.15, type: "spring", stiffness: 300, damping: 14 }}
                  >
                    <PixIcon emoji="⭐" size={40} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ExerciseFrame>
  );
}

const overlayStyle: CSSProperties = {
  position: "absolute",
  inset: -24,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 18,
  padding: 28,
  background: "rgba(8, 11, 26, 0.82)",
  backdropFilter: "blur(6px)",
  WebkitBackdropFilter: "blur(6px)",
};
