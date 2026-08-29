"use client";

/*
 * THE DAY JUG - Week 13 signature exercise (Screen-Time Balance).
 *
 * Sunrise fantasy: the whole day is water in ONE big jug. Four glass
 * cups wait below it: SCREENS, OUTSIDE, FAMILY, SLEEP, each with a
 * green "just right" band printed on the glass. The child DRAGS the
 * jug left/right and HOLDS it still over a cup to tilt and pour.
 * Liquid visibly leaves the jug and fills the cup, and because the
 * jug always runs dry, filling one cup starves another. That trade
 * is the whole lesson: balance is a finite-resource choice. Some
 * screens, not none, but every hour poured is an hour gone.
 *
 * Overfilling a cup (SCREENS especially) makes it fizz and tremble
 * red. Never a fail: the child just taps a cup to scoop liquid back
 * into the jug, fully reversible. WIN = all four cups inside their
 * green bands with the jug empty. The sun rises over the jug's rim
 * with a gold shimmer, then onComplete() fires once.
 *
 * Pure DOM + framer-motion + inline SVG. No canvas, no timers to
 * lose against, no numbers on screen (bands are read visually).
 */

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue } from "framer-motion";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import PixIcon from "@/app/components/lesson/PixIcon";

/* ────────────────────────── tuning ────────────────────────── */

const TOTAL = 10; // the whole day, in jug units (never shown as numbers)
const POUR_RATE = 1.1; // units per second while tilted
const SCOOP = 0.6; // units returned per cup tap
const DWELL_MS = 280; // hold-still time before the jug tilts
const EPS = 0.01;
const WIN_DELAY_MS = 2600;

const JUG_W = 120;
const JUG_H = 130;
const STREAM_H = 185; // spout down into the cups below

const FONT_STACK = "'Fredoka', 'Quicksand', ui-rounded, system-ui, sans-serif";

const GOOD = "#4ade80";
const OVER = "#ff5c6c";
const WATER = "#5bc9f5";
const GOLD = "#ffd166";

interface CupSpec {
  id: string;
  label: string;
  icon: string;
  cap: number; // how much the glass can physically hold
  min: number; // bottom of the green band
  max: number; // top of the green band
  accent: string;
}

// Feasibility: band minimums sum to 7.9 and maximums to 13.4, so a
// TOTAL of 10 always has many winning pours (e.g. 2 + 2 + 2 + 4).
const CUPS: CupSpec[] = [
  { id: "screens", label: "SCREENS", icon: "📱", cap: 4, min: 0.8, max: 2.0, accent: "#7df0ff" },
  { id: "outside", label: "OUTSIDE", icon: "🌳", cap: 5, min: 1.8, max: 3.2, accent: "#8bffb0" },
  { id: "family", label: "FAMILY", icon: "👪", cap: 5, min: 1.8, max: 3.2, accent: "#ffb1e0" },
  { id: "sleep", label: "SLEEP", icon: "🌙", cap: 6, min: 3.5, max: 5.0, accent: "#c9a7ff" },
];

type Phase = "intro" | "play" | "win";
type CupStatus = "low" | "good" | "over";
type Tone = "info" | "good" | "warn" | "bad";

interface Sim {
  jug: number;
  cups: number[];
}

interface Droplet {
  id: number;
  cup: number;
}

function statusOf(amount: number, spec: CupSpec): CupStatus {
  if (amount > spec.max + EPS) return "over";
  if (amount >= spec.min - EPS) return "good";
  return "low";
}

/* ────────────────────────── component ────────────────────────── */

export default function DayJug({ onComplete, narration, accent }: { onComplete: () => void; narration?: { speaker?: "adam" | "layla"; lines: string[] }; accent?: string }) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [sim, setSim] = useState<Sim>({ jug: TOTAL, cups: [0, 0, 0, 0] });
  const [pourTarget, setPourTarget] = useState<number | null>(null);
  const [hoverCup, setHoverCup] = useState<number | null>(null);
  const [hasPoured, setHasPoured] = useState(false);
  const [droplets, setDroplets] = useState<Droplet[]>([]);

  const simRef = useRef<Sim>(sim);
  const phaseRef = useRef<Phase>(phase);
  const holdingRef = useRef(false);
  const dwellRef = useRef<{ cup: number | null; since: number }>({ cup: null, since: 0 });
  const pourRef = useRef<number | null>(null);
  const hoverRef = useRef<number | null>(null);
  const pouredOnceRef = useRef(false);
  const doneRef = useRef(false);
  const dropIdRef = useRef(0);

  const jugRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const cupRefs = useRef<Array<HTMLDivElement | null>>([]);

  const x = useMotionValue(0);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  /* pointer hold (window listeners so a release anywhere ends the pour) */
  useEffect(() => {
    const up = () => {
      holdingRef.current = false;
    };
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    window.addEventListener("blur", up);
    return () => {
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      window.removeEventListener("blur", up);
    };
  }, []);

  /* simulation loop: hover detection, dwell-to-tilt, pour transfer */
  useEffect(() => {
    if (phase !== "play") return;
    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = Math.min((t - last) / 1000, 0.05);
      last = t;
      const jugEl = jugRef.current;
      if (jugEl && phaseRef.current === "play") {
        const jr = jugEl.getBoundingClientRect();
        const cx = jr.left + jr.width / 2;
        let over: number | null = null;
        for (let i = 0; i < CUPS.length; i++) {
          const el = cupRefs.current[i];
          if (!el) continue;
          const r = el.getBoundingClientRect();
          if (cx >= r.left - 8 && cx <= r.right + 8) {
            over = i;
            break;
          }
        }
        if (over !== hoverRef.current) {
          hoverRef.current = over;
          setHoverCup(over);
        }

        let pouringInto: number | null = null;
        if (holdingRef.current && over !== null) {
          if (dwellRef.current.cup !== over) dwellRef.current = { cup: over, since: t };
          const ready = t - dwellRef.current.since >= DWELL_MS;
          if (ready) {
            const spec = CUPS[over];
            const s = simRef.current;
            const room = spec.cap - s.cups[over];
            if (s.jug > EPS && room > EPS) {
              const d = Math.min(POUR_RATE * dt, s.jug, room);
              const cups = s.cups.slice();
              cups[over] += d;
              const next: Sim = { jug: Math.max(0, s.jug - d), cups };
              simRef.current = next;
              setSim(next);
              pouringInto = over;
              if (!pouredOnceRef.current) {
                pouredOnceRef.current = true;
                setHasPoured(true);
              }
              // WIN: the jug just ran dry with every cup inside its band
              if (
                next.jug <= EPS &&
                CUPS.every((c, ci) => statusOf(next.cups[ci], c) === "good")
              ) {
                holdingRef.current = false;
                pourRef.current = null;
                setPourTarget(null);
                setPhase("win");
                animate(x, 0, { type: "spring", stiffness: 70, damping: 16 });
                return; // stop the loop; the phase change also cleans up
              }
            }
          }
        } else {
          dwellRef.current = { cup: null, since: 0 };
        }
        if (pouringInto !== pourRef.current) {
          pourRef.current = pouringInto;
          setPourTarget(pouringInto);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, x]);

  /* onComplete fires once, a beat after the sun has risen */
  useEffect(() => {
    if (phase !== "win") return;
    const t = setTimeout(() => {
      if (!doneRef.current) {
        doneRef.current = true;
        onComplete();
      }
    }, WIN_DELAY_MS);
    return () => clearTimeout(t);
  }, [phase, onComplete]);

  /* tap a cup: scoop liquid back into the jug (fully reversible) */
  const scoop = (i: number) => {
    if (phaseRef.current !== "play") return;
    const s = simRef.current;
    const d = Math.min(SCOOP, s.cups[i], TOTAL - s.jug);
    if (d <= EPS) return;
    const cups = s.cups.slice();
    cups[i] -= d;
    const next: Sim = { jug: Math.min(TOTAL, s.jug + d), cups };
    simRef.current = next;
    setSim(next);
    const id = ++dropIdRef.current;
    setDroplets((ds) => [...ds, { id, cup: i }]);
  };

  /* derived UI state */
  const jugEmpty = sim.jug <= EPS;
  const statuses = CUPS.map((c, i) => statusOf(sim.cups[i], c));
  const overIdx = statuses.findIndex((s) => s === "over");
  const allGood = statuses.every((s) => s === "good");

  let message = "";
  let tone: Tone = "info";
  if (phase === "play") {
    if (overIdx >= 0) {
      message = `Too much in ${CUPS[overIdx].label}! Pour some back? Tap the red cup.`;
      tone = "bad";
    } else if (pourTarget !== null) {
      message = `Pouring into ${CUPS[pourTarget].label}...`;
      tone = "info";
    } else if (jugEmpty && !allGood) {
      message = "The jug is dry! Tap a cup to pour some back.";
      tone = "warn";
    } else if (allGood && !jugEmpty) {
      message = "Looking good! Pour every last drop. The whole day goes somewhere!";
      tone = "good";
    } else if (hasPoured) {
      message = "Fill every cup up to its green band!";
      tone = "info";
    } else {
      message = "Drag the jug over a cup. Hold still to pour!";
      tone = "info";
    }
  }

  const toneStyles: Record<Tone, { bg: string; border: string; color: string }> = {
    info: { bg: "rgba(15, 22, 52, 0.72)", border: "rgba(125, 240, 255, 0.35)", color: "#e7ecff" },
    good: { bg: "rgba(22, 62, 40, 0.82)", border: "rgba(74, 222, 128, 0.55)", color: "#c9f7d8" },
    warn: { bg: "rgba(70, 52, 16, 0.82)", border: "rgba(255, 209, 102, 0.55)", color: "#ffe9b8" },
    bad: { bg: "rgba(72, 20, 30, 0.85)", border: "rgba(255, 92, 108, 0.6)", color: "#ffd4d9" },
  };

  const tilting = pourTarget !== null;

  return (
    <ExerciseFrame padding={24} maxWidth={880}>
      <style>{`
        @keyframes dj-stream-flow {
          from { background-position-y: 0; }
          to { background-position-y: 26px; }
        }
        @keyframes dj-bubble-rise {
          0% { transform: translateY(0) scale(0.6); opacity: 0; }
          20% { opacity: 0.9; }
          100% { transform: translateY(-64px) scale(1.1); opacity: 0; }
        }
        @keyframes dj-sun-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div
        style={{
          position: "relative",
          borderRadius: 20,
          overflow: "hidden",
          padding: "16px 18px 18px",
          background:
            "linear-gradient(180deg, #171f4a 0%, #2c2a63 42%, #6d4467 72%, #c97e58 96%)",
          boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.08) inset",
          userSelect: "none",
          fontFamily: FONT_STACK,
        }}
      >
        {/* header */}
        <div style={{ textAlign: "center", marginBottom: 6 }}>
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: 2,
              color: "#fff3d6",
              textShadow: "0 2px 12px rgba(255, 209, 102, 0.35)",
            }}
          >
            {"THE DAY JUG"}
          </div>
          <div style={{ fontSize: 14, color: "rgba(231, 236, 255, 0.85)", marginTop: 2 }}>
            {"One day. Four cups. Pour it just right."}
          </div>
        </div>

        {/* jug track */}
        <div
          ref={trackRef}
          style={{
            position: "relative",
            height: 210,
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            paddingTop: 8,
          }}
        >
          {/* the sun, hidden behind the jug rim until the win */}
          <motion.div
            aria-hidden
            initial={{ opacity: 0, y: 120, scale: 0.5 }}
            animate={phase === "win" ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ delay: 0.25, duration: 1.5, ease: "easeOut" }}
            style={{
              position: "absolute",
              top: 4,
              left: "50%",
              marginLeft: -70,
              width: 140,
              height: 140,
              zIndex: 0,
              pointerEvents: "none",
            }}
          >
            <SunSvg />
          </motion.div>

          <motion.div
            ref={jugRef}
            drag={phase === "play" ? "x" : false}
            dragConstraints={trackRef}
            dragElastic={0.08}
            dragMomentum={false}
            onPointerDown={() => {
              if (phaseRef.current === "play") holdingRef.current = true;
            }}
            style={{
              x,
              position: "relative",
              width: JUG_W,
              height: JUG_H,
              zIndex: 2,
              cursor: phase === "play" ? "grab" : "default",
              touchAction: "none",
            }}
            whileTap={phase === "play" ? { scale: 1.04 } : undefined}
          >
            {/* pour stream (unrotated wrapper keeps it falling straight down) */}
            <AnimatePresence>
              {tilting && (
                <motion.div
                  key="stream"
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{ scaleY: 1, opacity: 0.9 }}
                  exit={{ scaleY: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  style={{
                    position: "absolute",
                    left: -2,
                    top: 58,
                    width: 9,
                    height: STREAM_H,
                    pointerEvents: "none",
                    transformOrigin: "top",
                    borderRadius: 5,
                    zIndex: 1,
                    background:
                      `linear-gradient(180deg, ${WATER}, #8fdcff), ` +
                      "repeating-linear-gradient(180deg, rgba(255,255,255,0) 0 12px, rgba(255,255,255,0.4) 12px 18px)",
                    backgroundBlendMode: "overlay",
                    animation: "dj-stream-flow 0.32s linear infinite",
                    boxShadow: "0 0 10px rgba(91, 201, 245, 0.5)",
                  }}
                />
              )}
            </AnimatePresence>

            {/* the jug itself, tilting to pour */}
            <motion.div
              animate={{ rotate: tilting ? -26 : 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
              style={{ position: "relative", width: "100%", height: "100%", zIndex: 2 }}
            >
              <JugSvg levelPct={sim.jug / TOTAL} />
            </motion.div>

            {/* first-time hint */}
            <AnimatePresence>
              {phase === "play" && !hasPoured && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: "absolute",
                    top: JUG_H + 6,
                    left: "50%",
                    x: "-50%",
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "5px 12px",
                    borderRadius: 999,
                    background: "rgba(15, 22, 52, 0.8)",
                    border: "1px solid rgba(125, 240, 255, 0.4)",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#c9f2ff",
                    zIndex: 3,
                  }}
                >
                  <PixIcon emoji="👆" size={18} />
                  {"Hold to pour"}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* cups row */}
        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "center",
            gap: 18,
            marginTop: 6,
          }}
        >
          {CUPS.map((spec, i) => (
            <Cup
              key={spec.id}
              spec={spec}
              amount={sim.cups[i]}
              status={statuses[i]}
              highlighted={hoverCup === i && phase === "play"}
              receiving={pourTarget === i}
              onScoop={() => scoop(i)}
              dropletIds={droplets.filter((d) => d.cup === i).map((d) => d.id)}
              onDropletDone={(id) =>
                setDroplets((ds) => ds.filter((dd) => dd.id !== id))
              }
              refCb={(el) => {
                cupRefs.current[i] = el;
              }}
            />
          ))}
        </div>

        {/* message bar */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 14, minHeight: 40 }}>
          {phase === "play" && (
            <motion.div
              key={message}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: "9px 18px",
                borderRadius: 999,
                fontSize: 15,
                fontWeight: 700,
                background: toneStyles[tone].bg,
                border: `1px solid ${toneStyles[tone].border}`,
                color: toneStyles[tone].color,
                textAlign: "center",
                maxWidth: "92%",
              }}
            >
              {message}
            </motion.div>
          )}
        </div>

        {/* gold shimmer over the whole scene on win */}
        <AnimatePresence>
          {phase === "win" && (
            <motion.div
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1.2 }}
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background:
                  "radial-gradient(circle at 50% 26%, rgba(255, 209, 102, 0.4) 0%, rgba(255, 209, 102, 0.12) 40%, transparent 70%)",
                zIndex: 4,
              }}
            />
          )}
        </AnimatePresence>

        {/* win banner + sparkles */}
        <AnimatePresence>
          {phase === "win" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 6,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                pointerEvents: "none",
                paddingBottom: 18,
              }}
            >
              {[
                { left: "12%", top: "20%", delay: 0.7 },
                { left: "84%", top: "16%", delay: 0.9 },
                { left: "22%", top: "58%", delay: 1.1 },
                { left: "78%", top: "52%", delay: 1.3 },
                { left: "50%", top: "10%", delay: 1.0 },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0], scale: [0.4, 1.15, 0.7] }}
                  transition={{ delay: s.delay, duration: 1.2 }}
                  style={{ position: "absolute", left: s.left, top: s.top }}
                >
                  <PixIcon emoji="✨" size={30} />
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.6, type: "spring", stiffness: 160, damping: 16 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 26px",
                  borderRadius: 20,
                  background: "linear-gradient(180deg, rgba(24, 60, 40, 0.94), rgba(16, 44, 30, 0.94))",
                  border: `2px solid ${GOOD}`,
                  boxShadow: "0 12px 40px rgba(0, 0, 0, 0.45), 0 0 30px rgba(74, 222, 128, 0.35)",
                }}
              >
                <PixIcon emoji="✅" size={40} />
                <div>
                  <div style={{ fontSize: 21, fontWeight: 800, color: "#d9ffe6" }}>
                    {"A perfectly balanced day!"}
                  </div>
                  <div style={{ fontSize: 14, color: "rgba(217, 255, 230, 0.85)", marginTop: 2 }}>
                    {"Some screens, lots of sleep, and every drop went somewhere on purpose."}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* intro overlay */}
        <AnimatePresence>
          {phase === "intro" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 8,
                display: "flex",
                flexDirection: "column",
                padding: 24,
                textAlign: "center",
                background: "rgba(10, 14, 34, 0.82)",
                backdropFilter: "blur(6px)",
                // The spoken-instruction block makes the intro taller; on short
                // viewports the overlay scrolls internally so the start button
                // is always reachable. The inner wrapper's auto margins keep it
                // dead-centre whenever everything fits (same look as before).
                overflowY: "auto",
              }}
            >
              <div
                style={{
                  margin: "auto",
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <div style={{ width: 84, height: 91 }}>
                  <JugSvg levelPct={1} />
                </div>
                <div
                  style={{
                    fontSize: 30,
                    fontWeight: 800,
                    letterSpacing: 3,
                    color: "#fff3d6",
                    textShadow: "0 2px 16px rgba(255, 209, 102, 0.45)",
                  }}
                >
                  {"THE DAY JUG"}
                </div>
                <div
                  style={{
                    fontSize: 16,
                    lineHeight: 1.55,
                    color: "rgba(231, 236, 255, 0.92)",
                    maxWidth: 460,
                  }}
                >
                  {"Your whole day is water in one jug. Pour it into four cups: "}
                  <b>{"Screens"}</b>
                  {", "}
                  <b>{"Outside"}</b>
                  {", "}
                  <b>{"Family"}</b>
                  {" and "}
                  <b>{"Sleep"}</b>
                  {". Fill each cup up to its green band. When the jug runs dry, the day is spent!"}
                </div>
                {narration && narration.lines.length > 0 && (
                  <div style={{ width: "100%", maxWidth: 460, textAlign: "left" }}>
                    <InfoNarration lines={narration.lines} accent={accent ?? "#2ec4b6"} />
                  </div>
                )}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                  {[
                    { icon: "👆", text: "Drag the jug, hold to pour" },
                    { icon: "🎯", text: "Green band = just right" },
                    { icon: "✅", text: "Tap a cup to pour back" },
                  ].map((chip) => (
                    <div
                      key={chip.text}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        padding: "7px 13px",
                        borderRadius: 999,
                        background: "rgba(125, 240, 255, 0.1)",
                        border: "1px solid rgba(125, 240, 255, 0.3)",
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#c9f2ff",
                      }}
                    >
                      <PixIcon emoji={chip.icon} size={18} />
                      {chip.text}
                    </div>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setPhase("play")}
                  style={{
                    marginTop: 6,
                    padding: "14px 38px",
                    borderRadius: 999,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 18,
                    fontWeight: 800,
                    fontFamily: FONT_STACK,
                    letterSpacing: 1,
                    color: "#231303",
                    background: `linear-gradient(180deg, ${GOLD}, #f0a94b)`,
                    boxShadow: "0 8px 26px rgba(255, 209, 102, 0.4)",
                  }}
                >
                  {"Start the Day"}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ExerciseFrame>
  );
}

/* ────────────────────────── the jug ────────────────────────── */

function JugSvg({ levelPct }: { levelPct: number }) {
  const uid = useId();
  const clipId = `dj-jug-clip-${uid.replace(/[^a-zA-Z0-9-]/g, "")}`;
  const innerTop = 24;
  const innerBottom = 114;
  const innerH = innerBottom - innerTop;
  const h = Math.max(0, Math.min(1, levelPct)) * innerH;
  const y = innerBottom - h;

  return (
    <svg
      viewBox={`0 0 ${JUG_W} ${JUG_H}`}
      width="100%"
      height="100%"
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={26} y={20} width={64} height={96} rx={12} />
        </clipPath>
      </defs>

      {/* liquid (geometry attrs transition via CSS so scoops rise smoothly) */}
      <g clipPath={`url(#${clipId})`}>
        <rect
          x={20}
          y={y}
          width={80}
          height={h + 4}
          fill={WATER}
          opacity={0.9}
          style={{ transition: "y 0.2s linear, height 0.2s linear" }}
        />
        <rect
          x={20}
          y={y}
          width={80}
          height={4}
          fill="#bfeaff"
          opacity={0.85}
          style={{ transition: "y 0.2s linear" }}
        />
      </g>

      {/* glass body */}
      <rect
        x={24}
        y={16}
        width={72}
        height={102}
        rx={14}
        fill="rgba(255, 255, 255, 0.08)"
        stroke="rgba(255, 255, 255, 0.6)"
        strokeWidth={3}
      />
      {/* spout */}
      <path
        d="M26 20 L8 30 L28 36 Z"
        fill="rgba(255, 255, 255, 0.14)"
        stroke="rgba(255, 255, 255, 0.6)"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      {/* handle */}
      <path
        d="M96 38 C 116 42, 116 82, 96 88"
        fill="none"
        stroke="rgba(255, 255, 255, 0.6)"
        strokeWidth={7}
        strokeLinecap="round"
      />
      {/* glass shine */}
      <rect x={32} y={26} width={8} height={80} rx={4} fill="rgba(255, 255, 255, 0.16)" />
      <text
        x={60}
        y={72}
        textAnchor="middle"
        fontSize={13}
        fontWeight={800}
        letterSpacing={2}
        fill="rgba(255, 255, 255, 0.75)"
        style={{ fontFamily: FONT_STACK }}
      >
        {"TODAY"}
      </text>
    </svg>
  );
}

/* ────────────────────────── a cup ────────────────────────── */

function Cup({
  spec,
  amount,
  status,
  highlighted,
  receiving,
  onScoop,
  dropletIds,
  onDropletDone,
  refCb,
}: {
  spec: CupSpec;
  amount: number;
  status: CupStatus;
  highlighted: boolean;
  receiving: boolean;
  onScoop: () => void;
  dropletIds: number[];
  onDropletDone: (id: number) => void;
  refCb: (el: HTMLDivElement | null) => void;
}) {
  const innerTop = 18;
  const innerBottom = 158;
  const innerH = innerBottom - innerTop;
  const hFor = (v: number) => (v / spec.cap) * innerH;
  const liquidH = hFor(amount);
  const liquidY = innerBottom - liquidH;
  const bandTop = innerBottom - hFor(spec.max);
  const bandH = hFor(spec.max) - hFor(spec.min);
  const fillPct = Math.min(1, amount / spec.cap);

  const liquidColor = status === "over" ? OVER : status === "good" ? GOOD : WATER;
  const surfaceColor = status === "over" ? "#ffb3bb" : status === "good" ? "#c9f7d8" : "#bfeaff";

  return (
    <div
      ref={refCb}
      onClick={onScoop}
      role="button"
      aria-label={`${spec.label} cup, tap to pour some back`}
      style={{
        position: "relative",
        flex: "0 1 150px",
        minWidth: 96,
        cursor: "pointer",
        borderRadius: 16,
        padding: "4px 2px 2px",
        boxShadow: highlighted
          ? "0 0 0 2px rgba(255, 243, 214, 0.65), 0 0 22px rgba(255, 209, 102, 0.35)"
          : "none",
        transition: "box-shadow 0.2s",
      }}
    >
      {/* status chip */}
      <AnimatePresence>
        {status === "good" && (
          <motion.div
            key="good"
            initial={{ opacity: 0, scale: 0.6, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6 }}
            style={{
              position: "absolute",
              top: -8,
              left: "50%",
              x: "-50%",
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "3px 10px",
              borderRadius: 999,
              background: "rgba(22, 62, 40, 0.92)",
              border: `1px solid ${GOOD}`,
              fontSize: 12,
              fontWeight: 800,
              color: "#c9f7d8",
              whiteSpace: "nowrap",
              zIndex: 3,
            }}
          >
            <PixIcon emoji="✅" size={14} />
            {"Just right!"}
          </motion.div>
        )}
        {status === "over" && (
          <motion.div
            key="over"
            initial={{ opacity: 0, scale: 0.6, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6 }}
            style={{
              position: "absolute",
              top: -8,
              left: "50%",
              x: "-50%",
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "3px 10px",
              borderRadius: 999,
              background: "rgba(72, 20, 30, 0.94)",
              border: `1px solid ${OVER}`,
              fontSize: 12,
              fontWeight: 800,
              color: "#ffd4d9",
              whiteSpace: "nowrap",
              zIndex: 3,
            }}
          >
            <PixIcon emoji="🚫" size={14} />
            {"Too much!"}
          </motion.div>
        )}
      </AnimatePresence>

      {/* trembles when overfilled */}
      <motion.div
        animate={status === "over" ? { x: [0, -2.5, 2.5, -1.5, 1.5, 0] } : { x: 0 }}
        transition={
          status === "over" ? { duration: 0.4, repeat: Infinity } : { duration: 0.2 }
        }
        style={{
          position: "relative",
          filter:
            status === "good"
              ? "drop-shadow(0 0 12px rgba(74, 222, 128, 0.45))"
              : status === "over"
                ? "drop-shadow(0 0 12px rgba(255, 92, 108, 0.5))"
                : receiving
                  ? "drop-shadow(0 0 10px rgba(91, 201, 245, 0.45))"
                  : "none",
        }}
      >
        <svg viewBox="0 0 120 170" width="100%" style={{ display: "block" }}>
          <defs>
            <clipPath id={`dj-cup-${spec.id}`}>
              <path d="M18 16 L26 150 Q27 156 34 156 L86 156 Q93 156 94 150 L102 16 Z" />
            </clipPath>
          </defs>

          {/* liquid (geometry attrs transition via CSS so scoops drop smoothly) */}
          <g clipPath={`url(#dj-cup-${spec.id})`}>
            <rect
              x={10}
              y={liquidY}
              width={100}
              height={liquidH + 4}
              fill={liquidColor}
              opacity={0.88}
              style={{ transition: "y 0.2s linear, height 0.2s linear, fill 0.3s" }}
            />
            <rect
              x={10}
              y={liquidY}
              width={100}
              height={3.5}
              fill={surfaceColor}
              opacity={0.9}
              style={{ transition: "y 0.2s linear, fill 0.3s" }}
            />
          </g>

          {/* green "just right" band on the glass */}
          <g clipPath={`url(#dj-cup-${spec.id})`}>
            <rect
              x={10}
              y={bandTop}
              width={100}
              height={bandH}
              fill={GOOD}
              opacity={status === "good" ? 0.3 : 0.15}
            />
            <line
              x1={10}
              y1={bandTop}
              x2={110}
              y2={bandTop}
              stroke={GOOD}
              strokeWidth={2}
              strokeDasharray="5 4"
              opacity={0.85}
            />
            <line
              x1={10}
              y1={bandTop + bandH}
              x2={110}
              y2={bandTop + bandH}
              stroke={GOOD}
              strokeWidth={2}
              strokeDasharray="5 4"
              opacity={0.85}
            />
            <text
              x={60}
              y={bandTop + bandH / 2 + 4}
              textAnchor="middle"
              fontSize={11}
              fontWeight={700}
              fill="#baf7cf"
              opacity={0.95}
              style={{ fontFamily: FONT_STACK }}
            >
              {"just right"}
            </text>
          </g>

          {/* glass outline */}
          <path
            d="M18 16 L26 150 Q27 156 34 156 L86 156 Q93 156 94 150 L102 16 Z"
            fill="rgba(10, 16, 40, 0.28)"
            stroke="rgba(255, 255, 255, 0.55)"
            strokeWidth={3}
            strokeLinejoin="round"
          />
          {/* glass shine */}
          <path d="M28 24 L33 140" stroke="rgba(255, 255, 255, 0.18)" strokeWidth={6} strokeLinecap="round" fill="none" />
        </svg>

        {/* red fizz bubbles when overfilled */}
        {status === "over" && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: "18%",
              right: "18%",
              bottom: "8%",
              height: `${Math.max(0.15, fillPct) * 78}%`,
              overflow: "hidden",
              pointerEvents: "none",
            }}
          >
            {[0, 1, 2, 3, 4].map((b) => (
              <span
                key={b}
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: `${12 + b * 18}%`,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "rgba(255, 179, 187, 0.9)",
                  animation: `dj-bubble-rise 1.1s linear ${b * 0.22}s infinite`,
                }}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* scoop droplets floating back up toward the jug */}
      <AnimatePresence>
        {dropletIds.map((id) => (
          <motion.div
            key={id}
            initial={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
            animate={{ opacity: 0, y: -150, scale: 0.6, x: "-50%" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            onAnimationComplete={() => onDropletDone(id)}
            style={{
              position: "absolute",
              left: "50%",
              top: 4,
              width: 18,
              height: 22,
              borderRadius: "50% 50% 55% 55%",
              background: `radial-gradient(circle at 35% 30%, #bfeaff, ${WATER})`,
              boxShadow: "0 0 10px rgba(91, 201, 245, 0.6)",
              pointerEvents: "none",
              zIndex: 5,
            }}
          />
        ))}
      </AnimatePresence>

      {/* label */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          marginTop: 6,
        }}
      >
        <PixIcon emoji={spec.icon} size={20} />
        <span
          style={{
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: 1.5,
            color: spec.accent,
          }}
        >
          {spec.label}
        </span>
      </div>
    </div>
  );
}

/* ────────────────────────── the sun ────────────────────────── */

function SunSvg() {
  return (
    <svg viewBox="0 0 140 140" width="100%" height="100%" style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id="dj-sun-core" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor="#fff7dd" />
          <stop offset="55%" stopColor={GOLD} />
          <stop offset="100%" stopColor="#f59e2c" />
        </radialGradient>
      </defs>
      <g style={{ transformOrigin: "70px 70px", animation: "dj-sun-spin 24s linear infinite" }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <rect
            key={i}
            x={67}
            y={2}
            width={6}
            height={22}
            rx={3}
            fill={GOLD}
            opacity={0.85}
            transform={`rotate(${i * 30} 70 70)`}
          />
        ))}
      </g>
      <circle cx={70} cy={70} r={38} fill="url(#dj-sun-core)" />
      <circle cx={70} cy={70} r={46} fill="none" stroke={GOLD} strokeWidth={2} opacity={0.4} />
    </svg>
  );
}
