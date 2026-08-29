"use client";

/**
 * GreatClimbOut — Week 10 (YouTube rabbit hole) signature exercise.
 *
 * The child has slid deep into a glowing video burrow. Autoplay is gravity:
 * a gentle, constant downward drift pulls the view back down. A ladder runs
 * up the middle. The child taps two big grips in a steady LEFT-RIGHT-LEFT
 * rhythm to climb toward a daylight circle at the top, past ever-weirder
 * glowing thumbnails. Juicy "NEXT VIDEO!" bubbles drift across the ladder
 * begging for a tap; touching one slides the child down one body-length
 * ("one more video means deeper"), but never below the start. There is no
 * fail state: the pull is slow and forgiving. Reaching the surface = sky +
 * birdsong (visual) + a green "YOU CHOSE TO STOP!" banner, then onComplete.
 *
 * Self-contained by design: all copy lives here, deps are react +
 * framer-motion + ExerciseFrame + PixIcon + inline SVG only.
 */

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import {
  motion,
  AnimatePresence,
  useAnimationControls,
  useReducedMotion,
} from "framer-motion";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import PixIcon from "@/app/components/lesson/PixIcon";

/* ------------------------------------------------------------------ */
/* Tuning                                                             */
/* ------------------------------------------------------------------ */

const GOAL = 12; // rungs from start to daylight
const STEP_PX = 46; // one body-length, in world pixels
const VIEW_H = 430; // scene viewport height
const BELOW_PX = 170; // world below the start (deepest weirdness)
const ABOVE_PX = 250; // world above the goal (the daylight mouth)
const WORLD_H = BELOW_PX + GOAL * STEP_PX + ABOVE_PX;
const CHILD_BOTTOM = 118; // where the child sits on screen (px from bottom)
const WORLD_BOTTOM = CHILD_BOTTOM - BELOW_PX; // world anchor offset

const DRIFT_PER_MS = 1 / 4500; // autoplay-gravity: 1 rung per 4.5s, gentle
const LURE_FIRST_MS = 4200;
const LURE_EVERY_MS = 6400;
const LURE_CROSS_MS = 7200;

/* Palette */
const GOOD_GREEN = "#34d399";
const BAD_RED = "#ff5d5d";
const SKY_BLUE = "#8fd3ff";
const LADDER_WOOD = "#a06a34";

type Phase = "intro" | "climb" | "surfacing" | "celebrate";
type Side = "left" | "right";

type Lure = { id: number; dir: 1 | -1; topPct: number };
type Toast = { id: number; kind: "slip" | "hint"; text: string };

const LURE_SUBS = [
  "SO JUICY!",
  "JUST ONE MORE!",
  "YOU WILL LOVE IT!",
  "EVERYONE IS WATCHING!",
];

/* The burrow walls: ever-weirder glowing thumbnails, weirdest at the bottom */
type ThumbDef = {
  y: number; // rungs above the start (negative = below)
  side: Side;
  title: string;
  time: string;
  hue: number;
  weird: number; // 0 normal .. 1 very weird
  eyes?: boolean;
};

const THUMBS: ThumbDef[] = [
  { y: 11.2, side: "right", title: "Puppy Learns to Wave", time: "2:10", hue: 205, weird: 0.05 },
  { y: 9.8, side: "left", title: "Top 10 Coolest Bikes", time: "4:32", hue: 195, weird: 0.15 },
  { y: 8.3, side: "right", title: "Cats... but Backward", time: "7:07", hue: 230, weird: 0.35 },
  { y: 6.8, side: "left", title: "24 Hours of Slime", time: "24:00", hue: 260, weird: 0.5 },
  { y: 5.3, side: "right", title: "Robot Eats Spaghetti #47", time: "38:00", hue: 280, weird: 0.65 },
  { y: 3.8, side: "left", title: "Screaming Vegetables?", time: "1:03:00", hue: 300, weird: 0.8 },
  { y: 2.3, side: "right", title: "Why Is This 10 Hours Long", time: "10:00:00", hue: 320, weird: 0.9 },
  { y: 0.7, side: "left", title: "Do Not Watch This One", time: "??:??", hue: 335, weird: 1, eyes: true },
  { y: -1.4, side: "right", title: "?????", time: "99:99:99", hue: 350, weird: 1 },
];

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export default function GreatClimbOut({
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
  const [height, setHeight] = useState(0); // rungs above the start, float
  const [nextSide, setNextSide] = useState<Side>("left");
  const [lure, setLure] = useState<Lure | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [taps, setTaps] = useState(0);
  const [slips, setSlips] = useState(0);

  const heightRef = useRef(0);
  const lureRef = useRef<Lure | null>(null);
  const completedRef = useRef(false);
  const seqRef = useRef(0);
  const toastSeqRef = useRef(0);
  const timersRef = useRef<number[]>([]);

  const later = (fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  };
  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);
  useEffect(() => {
    lureRef.current = lure;
  }, [lure]);

  const childCtrl = useAnimationControls();
  const leftCtrl = useAnimationControls();
  const rightCtrl = useAnimationControls();

  /* -------- autoplay-as-gravity: slow constant downward drift -------- */

  useEffect(() => {
    if (phase !== "climb") return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(now - last, 60);
      last = now;
      const h = Math.max(0, heightRef.current - dt * DRIFT_PER_MS);
      heightRef.current = h;
      // Skip sub-pixel state churn while resting on the burrow floor.
      setHeight((prev) => (Math.abs(prev - h) > 0.004 ? h : prev));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  /* -------- "NEXT VIDEO!" lure spawner -------- */

  useEffect(() => {
    if (phase !== "climb") return;
    let cancelled = false;
    const timers: number[] = [];
    const spawn = () => {
      if (cancelled) return;
      if (!lureRef.current && heightRef.current < GOAL - 0.5) {
        const id = ++seqRef.current;
        const b: Lure = {
          id,
          dir: Math.random() < 0.5 ? 1 : -1,
          topPct: 22 + Math.random() * 36,
        };
        lureRef.current = b;
        setLure(b);
        timers.push(
          window.setTimeout(() => {
            setLure((cur) => (cur && cur.id === id ? null : cur));
          }, LURE_CROSS_MS + 400)
        );
      }
      timers.push(window.setTimeout(spawn, LURE_EVERY_MS));
    };
    timers.push(window.setTimeout(spawn, LURE_FIRST_MS));
    return () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [phase]);

  /* -------- helpers -------- */

  const showToast = (kind: Toast["kind"], text: string) => {
    const id = ++toastSeqRef.current;
    setToast({ id, kind, text });
    later(
      () => setToast((t) => (t && t.id === id ? null : t)),
      kind === "slip" ? 2200 : 1500
    );
  };

  /* -------- interactions -------- */

  const tapGrip = (side: Side) => {
    if (phase !== "climb") return;
    const ctrl = side === "left" ? leftCtrl : rightCtrl;
    if (side !== nextSide) {
      // Forgiving: no slide, just a wobble and a nudge to alternate.
      ctrl.start({ x: [0, -7, 7, -5, 5, 0], transition: { duration: 0.4 } });
      showToast(
        "hint",
        nextSide === "left" ? "Other hand! Tap LEFT." : "Other hand! Tap RIGHT."
      );
      return;
    }
    const h = Math.min(GOAL, heightRef.current + 1);
    heightRef.current = h;
    setHeight(h);
    setNextSide(side === "left" ? "right" : "left");
    setTaps((n) => n + 1);
    ctrl.start({ scale: [1, 0.92, 1.06, 1], transition: { duration: 0.35 } });
    childCtrl.start({
      y: [0, -10, 0],
      transition: { duration: 0.4, ease: "easeOut" },
    });
    if (h >= GOAL - 1e-6) {
      heightRef.current = GOAL;
      setHeight(GOAL);
      setLure(null);
      setPhase("surfacing");
      later(() => setPhase("celebrate"), reduce ? 400 : 1300);
    }
  };

  const popLure = (id: number) => {
    if (phase !== "climb") return;
    setLure((cur) => (cur && cur.id === id ? null : cur));
    const h = Math.max(0, heightRef.current - 1);
    heightRef.current = h;
    setHeight(h);
    setSlips((n) => n + 1);
    showToast(
      "slip",
      h === 0
        ? "One more video means deeper! Lucky the floor caught you. Climb!"
        : "One more video means deeper! Down you slide. Climb!"
    );
  };

  const finish = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  };

  /* -------- derived -------- */

  const pct = Math.min(1, height / GOAL);
  const remaining = Math.max(0, Math.ceil(GOAL - height - 0.001));
  const slipping = toast?.kind === "slip";

  const caption =
    phase === "climb"
      ? slipping
        ? "Shake it off, hero. Back to climbing!"
        : remaining <= 3
        ? "Almost out! Keep the rhythm going!"
        : `Tap the ${nextSide === "left" ? "LEFT" : "RIGHT"} grip. Steady left-right-left!`
      : phase === "surfacing"
      ? "You reached the daylight!"
      : "";

  return (
    <ExerciseFrame maxWidth={860} padding={24}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        {/* ---------- header ---------- */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#ffc9f0",
            }}
          >
            The Great Climb-Out
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#cfd6f6",
              marginTop: 4,
            }}
          >
            Climb out of the video burrow. Steady taps beat the pull!
          </div>
          {/* climb progress */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              maxWidth: 460,
              margin: "10px auto 0",
            }}
          >
            <MiniLadderGlyph size={20} />
            <div
              style={{
                flex: 1,
                height: 14,
                borderRadius: 999,
                background: "rgba(255,255,255,0.08)",
                border: "1.5px solid rgba(255,255,255,0.14)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${pct * 100}%`,
                  height: "100%",
                  borderRadius: 999,
                  background: slipping
                    ? `linear-gradient(90deg, ${BAD_RED}, #ff8a8a)`
                    : `linear-gradient(90deg, #0e9f6e, ${GOOD_GREEN})`,
                  boxShadow: slipping
                    ? "0 0 12px rgba(255,93,93,0.7)"
                    : "0 0 12px rgba(52,211,153,0.55)",
                  transition: "width 320ms ease, background 240ms ease",
                }}
              />
            </div>
            <SunGlyph size={22} />
          </div>
        </div>

        {/* ---------- the burrow scene ---------- */}
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 560,
            margin: "0 auto",
            height: VIEW_H,
            borderRadius: 22,
            overflow: "hidden",
            background: "#140d24",
            border: "2px solid rgba(125,240,255,0.14)",
            boxShadow: "inset 0 0 60px rgba(0,0,0,0.55)",
          }}
        >
          {/* the world: slides DOWN as the child climbs, DRIFTS back up */}
          <motion.div
            animate={{ y: height * STEP_PX }}
            transition={{ type: "spring", stiffness: 90, damping: 20, mass: 0.8 }}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: WORLD_BOTTOM,
              height: WORLD_H,
            }}
          >
            {/* burrow strata: warm near the surface, deep purple below */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, #7a5a33 0%, #4a3320 30%, #2c2138 62%, #171026 100%)",
              }}
            />
            {/* wall roots */}
            <RootDoodle left={-6} bottom={BELOW_PX + 8.9 * STEP_PX} flip={false} />
            <RootDoodle left={-6} bottom={BELOW_PX + 4.6 * STEP_PX} flip={false} />
            <RootDoodle left={-6} bottom={BELOW_PX + 1.2 * STEP_PX} flip={true} />

            <Daylight reduce={reduce} />
            <Ladder />
            {THUMBS.map((t) => (
              <Thumb key={t.title} t={t} reduce={reduce} />
            ))}
          </motion.div>

          {/* the child, fixed on screen while the world moves */}
          <motion.div
            animate={childCtrl}
            style={{
              position: "absolute",
              left: "50%",
              x: "-50%",
              bottom: CHILD_BOTTOM - 6,
              zIndex: 3,
              pointerEvents: "none",
            }}
          >
            <ClimberKid side={nextSide} reduce={reduce} />
          </motion.div>

          {/* tunnel vignette */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 4,
              pointerEvents: "none",
              background:
                "radial-gradient(ellipse at 50% 45%, transparent 52%, rgba(8,5,16,0.6) 100%)",
            }}
          />
          {/* daylight spill grows as the child nears the top */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 4,
              pointerEvents: "none",
              background:
                "linear-gradient(180deg, rgba(255,236,170,0.16), transparent 45%)",
              opacity: pct,
              transition: "opacity 300ms ease",
            }}
          />

          {/* HUD: rungs remaining */}
          {(phase === "climb" || phase === "intro") && (
            <div
              style={{
                position: "absolute",
                top: 12,
                left: 12,
                zIndex: 5,
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "7px 12px",
                borderRadius: 999,
                background: "rgba(10,7,20,0.75)",
                border: "1.5px solid rgba(255,255,255,0.16)",
                fontSize: 12.5,
                fontWeight: 900,
                color: "#e7ecff",
              }}
            >
              <SunGlyph size={16} />
              {remaining === 1 ? "1 rung to daylight" : `${remaining} rungs to daylight`}
            </div>
          )}

          {/* the lure bubble */}
          <AnimatePresence>
            {lure && phase === "climb" && (
              <LureBubble
                key={lure.id}
                lure={lure}
                reduce={reduce}
                onPop={() => popLure(lure.id)}
              />
            )}
          </AnimatePresence>

          {/* toast */}
          <AnimatePresence>
            {toast && (
              <motion.div
                key={toast.id}
                initial={{ y: -24, opacity: 0, scale: 0.92 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -12, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                style={{
                  position: "absolute",
                  top: 12,
                  left: "50%",
                  x: "-50%",
                  zIndex: 7,
                  maxWidth: "86%",
                  padding: "10px 16px",
                  borderRadius: 14,
                  textAlign: "center",
                  fontSize: 14,
                  fontWeight: 900,
                  lineHeight: 1.35,
                  background:
                    toast.kind === "slip"
                      ? "rgba(120,20,28,0.95)"
                      : "rgba(15,40,80,0.95)",
                  border: `2.5px solid ${toast.kind === "slip" ? BAD_RED : "#7dd3fc"}`,
                  color: toast.kind === "slip" ? "#ffd9d9" : "#d9efff",
                  boxShadow: "0 10px 30px -8px rgba(0,0,0,0.7)",
                }}
              >
                {toast.text}
              </motion.div>
            )}
          </AnimatePresence>

          {/* surfacing flash: the sky takes over */}
          {(phase === "surfacing" || phase === "celebrate") && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reduce ? 0.2 : 0.9 }}
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 6,
                background:
                  "linear-gradient(180deg, #bfe6ff 0%, #fff6d9 60%, #ffe9a0 100%)",
              }}
            />
          )}
        </div>

        {/* ---------- the two climbing grips ---------- */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <GripButton
            side="left"
            active={phase === "climb" && nextSide === "left"}
            disabled={phase !== "climb"}
            ctrl={leftCtrl}
            reduce={reduce}
            onPress={() => tapGrip("left")}
          />
          <GripButton
            side="right"
            active={phase === "climb" && nextSide === "right"}
            disabled={phase !== "climb"}
            ctrl={rightCtrl}
            reduce={reduce}
            onPress={() => tapGrip("right")}
          />
        </div>

        {/* ---------- caption ---------- */}
        <div
          style={{
            textAlign: "center",
            fontSize: 13,
            fontWeight: 800,
            color: slipping ? "#ff9d9d" : "#9fb1d8",
            minHeight: 18,
          }}
        >
          {caption}
        </div>
      </div>

      {/* ---------- overlays ---------- */}
      {phase === "intro" && (
        <IntroOverlay
          onStart={() => setPhase("climb")}
          reduce={reduce}
          narration={narration}
          accent={accent}
        />
      )}
      {phase === "celebrate" && (
        <CelebrateOverlay
          taps={taps}
          slips={slips}
          onContinue={finish}
          reduce={reduce}
        />
      )}
    </ExerciseFrame>
  );
}

/* ------------------------------------------------------------------ */
/* World pieces                                                       */
/* ------------------------------------------------------------------ */

/** The burrow mouth at the top of the world: sky, sun glow, grass. */
function Daylight({ reduce }: { reduce: boolean }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: ABOVE_PX,
        pointerEvents: "none",
      }}
    >
      {/* light shaft spilling down the tunnel */}
      <div
        style={{
          position: "absolute",
          top: 90,
          left: "50%",
          transform: "translateX(-50%)",
          width: 190,
          height: 320,
          background:
            "linear-gradient(180deg, rgba(255,240,180,0.32), transparent 85%)",
          clipPath: "polygon(22% 0%, 78% 0%, 100% 100%, 0% 100%)",
        }}
      />
      {/* the daylight circle */}
      <motion.div
        animate={
          reduce
            ? undefined
            : { scale: [1, 1.05, 1], opacity: [0.92, 1, 0.92] }
        }
        transition={
          reduce
            ? undefined
            : { repeat: Infinity, duration: 3.4, ease: "easeInOut" }
        }
        style={{
          position: "absolute",
          top: 36,
          left: "50%",
          transform: "translateX(-50%)",
          width: 150,
          height: 150,
          borderRadius: "50%",
          background: `radial-gradient(circle at 50% 42%, #fffbe8 0%, #ffe9a0 42%, ${SKY_BLUE} 72%, #6db8ef 100%)`,
          boxShadow:
            "0 0 60px 18px rgba(255,238,170,0.55), 0 0 120px 40px rgba(255,238,170,0.25)",
          border: "6px solid rgba(80,54,28,0.9)",
        }}
      />
      {/* grass tufts on the rim */}
      <svg
        viewBox="0 0 200 40"
        width={190}
        height={38}
        aria-hidden
        style={{
          position: "absolute",
          top: 24,
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        {[14, 44, 78, 116, 152, 182].map((x, i) => (
          <path
            key={i}
            d={`M${x} 38 Q${x - 5} 22 ${x - 9} 12 M${x} 38 Q${x} 18 ${x + 2} 8 M${x} 38 Q${x + 6} 24 ${x + 10} 14`}
            fill="none"
            stroke={i % 2 === 0 ? "#4ea94e" : "#63c163"}
            strokeWidth={3.4}
            strokeLinecap="round"
          />
        ))}
      </svg>
    </div>
  );
}

/** The ladder up the middle of the burrow. */
function Ladder() {
  const ladderH = WORLD_H - ABOVE_PX + 80; // pokes into the burrow mouth
  const rungs = Math.floor(ladderH / STEP_PX);
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: 96,
        height: ladderH,
        zIndex: 1,
      }}
    >
      {(["left", "right"] as const).map((s) => (
        <div
          key={s}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            [s]: 0,
            width: 9,
            borderRadius: 5,
            background: `linear-gradient(90deg, ${LADDER_WOOD}, #7a4a21)`,
            boxShadow: "0 0 8px rgba(0,0,0,0.5)",
          }}
        />
      ))}
      {Array.from({ length: rungs }, (_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            bottom: i * STEP_PX + 16,
            left: 4,
            right: 4,
            height: 10,
            borderRadius: 5,
            background: "linear-gradient(180deg, #c98a48, #96602c)",
            boxShadow: "0 2px 3px rgba(0,0,0,0.45)",
          }}
        />
      ))}
    </div>
  );
}

/** A glowing video thumbnail sunk into the burrow wall. */
function Thumb({ t, reduce }: { t: ThumbDef; reduce: boolean }) {
  const wobble = 2 + t.weird * 3.5;
  return (
    <motion.div
      animate={reduce ? undefined : { rotate: [-wobble, wobble, -wobble] }}
      transition={
        reduce
          ? undefined
          : {
              repeat: Infinity,
              duration: 2.8 - t.weird * 1.2,
              ease: "easeInOut",
            }
      }
      style={{
        position: "absolute",
        bottom: BELOW_PX + t.y * STEP_PX,
        [t.side]: 10,
        width: 120,
        zIndex: 2,
      }}
    >
      <div
        style={{
          position: "relative",
          height: 70,
          borderRadius: 12,
          overflow: "hidden",
          background: `linear-gradient(160deg, hsl(${t.hue} 75% ${52 - t.weird * 14}%), hsl(${(t.hue + 45) % 360} 85% ${30 - t.weird * 8}%))`,
          border: "2.5px solid rgba(255,255,255,0.28)",
          boxShadow: `0 0 ${16 + t.weird * 26}px hsla(${t.hue}, 90%, 60%, ${0.35 + t.weird * 0.3})`,
        }}
      >
        {/* play triangle */}
        <svg
          viewBox="0 0 24 24"
          width={26}
          height={26}
          aria-hidden
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <circle cx={12} cy={12} r={11} fill="rgba(255,255,255,0.28)" />
          <path d="M9.5 7.5 L17 12 L9.5 16.5 Z" fill="#fff" />
        </svg>
        {/* duration chip */}
        <span
          style={{
            position: "absolute",
            right: 4,
            bottom: 4,
            padding: "1px 5px",
            borderRadius: 5,
            background: "rgba(0,0,0,0.7)",
            color: "#fff",
            fontSize: 9,
            fontWeight: 800,
          }}
        >
          {t.time}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          marginTop: 4,
          fontSize: 10.5,
          fontWeight: 800,
          lineHeight: 1.25,
          textAlign: "center",
          color: `hsl(${t.hue} 70% ${82 - t.weird * 10}%)`,
        }}
      >
        {t.eyes && <PixIcon emoji="👀" size={15} />}
        <span>{t.title}</span>
      </div>
    </motion.div>
  );
}

/** Squiggly wall root for texture. */
function RootDoodle({
  left,
  bottom,
  flip,
}: {
  left: number;
  bottom: number;
  flip: boolean;
}) {
  return (
    <svg
      viewBox="0 0 90 50"
      width={86}
      height={48}
      aria-hidden
      style={{
        position: "absolute",
        bottom,
        [flip ? "right" : "left"]: left,
        transform: flip ? "scaleX(-1)" : undefined,
        opacity: 0.55,
      }}
    >
      <path
        d="M0 10 Q28 6 40 20 Q48 30 44 44 M14 12 Q30 18 34 34"
        fill="none"
        stroke="#5b3a1e"
        strokeWidth={6}
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* The climbing kid (seen from behind, straddling the ladder)         */
/* ------------------------------------------------------------------ */

function ClimberKid({ side, reduce }: { side: Side; reduce: boolean }) {
  // The arm on `side` reaches up for the next rung; its hand gets the cue ring.
  const mirror = (x: number) => 130 - x;
  const upHand = side === "left" ? { x: 24, y: 20 } : { x: mirror(24), y: 20 };
  const upPath =
    side === "left"
      ? "M48 62 C38 50 30 38 24 26"
      : `M${mirror(48)} 62 C${mirror(38)} 50 ${mirror(30)} 38 ${mirror(24)} 26`;
  const downHand = side === "left" ? { x: mirror(22), y: 56 } : { x: 22, y: 56 };
  const downPath =
    side === "left"
      ? `M${mirror(48)} 64 C${mirror(38)} 62 ${mirror(28)} 60 ${mirror(22)} 56`
      : "M48 64 C38 62 28 60 22 56";

  return (
    <motion.svg
      width={130}
      height={128}
      viewBox="0 0 130 128"
      aria-hidden
      animate={reduce ? undefined : { rotate: [-1.2, 1.2, -1.2] }}
      transition={
        reduce
          ? undefined
          : { repeat: Infinity, duration: 3.2, ease: "easeInOut" }
      }
      style={{ display: "block", transformOrigin: "50% 82%" }}
    >
      {/* legs + shoes */}
      <rect x={48} y={90} width={13} height={26} rx={6.5} fill="#2f5f9e" />
      <rect x={69} y={90} width={13} height={26} rx={6.5} fill="#2f5f9e" />
      <ellipse cx={54} cy={118} rx={10} ry={6} fill="#26324a" />
      <ellipse cx={76} cy={118} rx={10} ry={6} fill="#26324a" />
      {/* arms behind the body */}
      <path
        d={upPath}
        fill="none"
        stroke="#3ec6ad"
        strokeWidth={12}
        strokeLinecap="round"
      />
      <path
        d={downPath}
        fill="none"
        stroke="#35ab95"
        strokeWidth={12}
        strokeLinecap="round"
      />
      <circle cx={downHand.x} cy={downHand.y} r={8} fill="#ffd9a8" />
      {/* hoodie body */}
      <rect x={40} y={46} width={50} height={50} rx={18} fill="#3ec6ad" />
      {/* backpack */}
      <rect x={49} y={52} width={32} height={38} rx={11} fill="#ffb347" />
      <rect x={49} y={66} width={32} height={7} rx={3.5} fill="#e08f1f" />
      {/* head: hair from behind + ears */}
      <circle cx={65} cy={29} r={19} fill="#5b3a1e" />
      <circle cx={46} cy={31} r={5} fill="#ffd9a8" />
      <circle cx={84} cy={31} r={5} fill="#ffd9a8" />
      {/* the reaching hand + its green cue ring */}
      <circle cx={upHand.x} cy={upHand.y} r={8} fill="#ffd9a8" />
      <motion.circle
        cx={upHand.x}
        cy={upHand.y - 2}
        r={14}
        fill="none"
        stroke={GOOD_GREEN}
        strokeWidth={3}
        strokeDasharray="5 6"
        animate={reduce ? { opacity: 0.7 } : { opacity: [0.35, 0.95, 0.35] }}
        transition={
          reduce
            ? undefined
            : { repeat: Infinity, duration: 1.1, ease: "easeInOut" }
        }
      />
    </motion.svg>
  );
}

/* ------------------------------------------------------------------ */
/* The juicy "NEXT VIDEO!" lure                                       */
/* ------------------------------------------------------------------ */

function LureBubble({
  lure,
  onPop,
  reduce,
}: {
  lure: Lure;
  onPop: () => void;
  reduce: boolean;
}) {
  return (
    <motion.div
      initial={{ left: lure.dir === 1 ? "-28%" : "104%" }}
      animate={{ left: lure.dir === 1 ? "104%" : "-28%" }}
      exit={{
        opacity: 0,
        scale: 1.45,
        transition: { duration: reduce ? 0.15 : 0.35 },
      }}
      transition={{ duration: LURE_CROSS_MS / 1000, ease: "linear" }}
      style={{
        position: "absolute",
        top: `${lure.topPct}%`,
        zIndex: 5,
        width: 152,
      }}
    >
      <motion.button
        type="button"
        aria-label="Next video bubble. Tapping it pulls you deeper!"
        onClick={onPop}
        animate={
          reduce
            ? undefined
            : { rotate: [-3, 3, -3], scale: [1, 1.06, 1] }
        }
        transition={
          reduce
            ? undefined
            : { repeat: Infinity, duration: 0.9, ease: "easeInOut" }
        }
        whileTap={{ scale: 0.88 }}
        style={{
          width: "100%",
          padding: "12px 14px",
          borderRadius: 999,
          border: "3px solid #ffd1e0",
          background: "linear-gradient(180deg, #ff7ab0 0%, #ff4d6d 100%)",
          color: "#fff",
          cursor: "pointer",
          fontFamily: "inherit",
          boxShadow:
            "0 10px 26px -8px rgba(255,77,109,0.9), 0 0 22px rgba(255,122,176,0.5)",
          touchAction: "manipulation",
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            fontSize: 16,
            fontWeight: 900,
            letterSpacing: "0.03em",
          }}
        >
          <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden>
            <circle cx={12} cy={12} r={11} fill="rgba(255,255,255,0.3)" />
            <path d="M9.5 7.5 L17 12 L9.5 16.5 Z" fill="#fff" />
          </svg>
          NEXT VIDEO!
        </span>
        <span
          style={{
            display: "block",
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.14em",
            opacity: 0.9,
            marginTop: 2,
          }}
        >
          {LURE_SUBS[lure.id % LURE_SUBS.length]}
        </span>
      </motion.button>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Grip buttons                                                       */
/* ------------------------------------------------------------------ */

function GripButton({
  side,
  active,
  disabled,
  ctrl,
  reduce,
  onPress,
}: {
  side: Side;
  active: boolean;
  disabled: boolean;
  ctrl: ReturnType<typeof useAnimationControls>;
  reduce: boolean;
  onPress: () => void;
}) {
  return (
    <motion.button
      type="button"
      aria-label={`Tap the ${side} grip to climb`}
      animate={ctrl}
      disabled={disabled}
      onPointerDown={(e) => {
        e.preventDefault();
        onPress();
      }}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        minWidth: 150,
        minHeight: 92,
        padding: "10px 22px",
        borderRadius: 22,
        border: `3px solid ${active ? GOOD_GREEN : "rgba(255,255,255,0.16)"}`,
        background: active
          ? "linear-gradient(180deg, rgba(52,211,153,0.24) 0%, rgba(14,90,60,0.55) 100%)"
          : "rgba(255,255,255,0.05)",
        color: active ? "#c9ffd9" : "#8b96bd",
        cursor: disabled ? "default" : "pointer",
        fontFamily: "inherit",
        boxShadow: active
          ? "0 12px 30px -10px rgba(52,211,153,0.8), 0 0 22px rgba(52,211,153,0.3)"
          : "0 8px 20px -12px rgba(0,0,0,0.6)",
        opacity: disabled ? 0.5 : 1,
        touchAction: "manipulation",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
        transition: "border-color 200ms ease, box-shadow 200ms ease",
      }}
    >
      <motion.span
        animate={active && !reduce ? { scale: [1, 1.12, 1] } : { scale: 1 }}
        transition={
          active && !reduce
            ? { repeat: Infinity, duration: 0.9, ease: "easeInOut" }
            : undefined
        }
        style={{ display: "inline-flex" }}
      >
        <HandGlyph size={34} mirror={side === "right"} lit={active} />
      </motion.span>
      <span style={{ fontSize: 19, fontWeight: 900, letterSpacing: "0.08em" }}>
        {side === "left" ? "LEFT" : "RIGHT"}
      </span>
      <span
        style={{
          fontSize: 10.5,
          fontWeight: 800,
          letterSpacing: "0.16em",
          color: active ? GOOD_GREEN : "rgba(139,150,189,0.7)",
        }}
      >
        {active ? "TAP ME!" : "WAIT..."}
      </span>
    </motion.button>
  );
}

function HandGlyph({
  size,
  mirror,
  lit,
}: {
  size: number;
  mirror?: boolean;
  lit?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 60 60"
      width={size}
      height={size}
      aria-hidden
      style={{ transform: mirror ? "scaleX(-1)" : undefined }}
    >
      {/* mitten palm */}
      <path
        d="M16 30 C16 14 24 6 32 6 C42 6 48 15 48 30 L48 42 C48 50 43 55 35 55 L27 55 C20 55 16 50 16 44 Z"
        fill={lit ? "#a7f3d0" : "#7c88ad"}
      />
      {/* thumb */}
      <path
        d="M16 34 C10 32 7 27 9 22 C11 18 16 18 18 22 L20 28"
        fill={lit ? "#a7f3d0" : "#7c88ad"}
      />
      {/* finger lines */}
      {[26, 33, 40].map((x) => (
        <line
          key={x}
          x1={x}
          y1={9}
          x2={x}
          y2={20}
          stroke={lit ? "#0e9f6e" : "#4a5578"}
          strokeWidth={2.4}
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Small glyphs                                                       */
/* ------------------------------------------------------------------ */

function SunGlyph({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <circle cx={12} cy={12} r={5.5} fill="#ffd158" />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4;
        return (
          <line
            key={i}
            x1={12 + Math.cos(a) * 8}
            y1={12 + Math.sin(a) * 8}
            x2={12 + Math.cos(a) * 11}
            y2={12 + Math.sin(a) * 11}
            stroke="#ffd158"
            strokeWidth={2.2}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

function MiniLadderGlyph({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <rect x={6} y={2} width={3} height={20} rx={1.5} fill={LADDER_WOOD} />
      <rect x={15} y={2} width={3} height={20} rx={1.5} fill={LADDER_WOOD} />
      {[5, 11, 17].map((y) => (
        <rect key={y} x={7} y={y} width={10} height={2.6} rx={1.3} fill="#c98a48" />
      ))}
    </svg>
  );
}

function NoteGlyph({ size, color }: { size: number; color: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <circle cx={7.5} cy={18.5} r={4} fill={color} />
      <rect x={10.2} y={3.5} width={2.4} height={15.5} rx={1.2} fill={color} />
      <path d="M10.2 3.5 C16 4.5 17.5 8 12.6 10.5 L12.6 6 Z" fill={color} />
    </svg>
  );
}

function BirdGlyph({ size, color }: { size: number; color: string }) {
  return (
    <svg viewBox="0 0 28 12" width={size} height={(size * 12) / 28} aria-hidden>
      <path
        d="M1 10 Q7 1 14 10 Q21 1 27 10"
        fill="none"
        stroke={color}
        strokeWidth={2.6}
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Overlays                                                           */
/* ------------------------------------------------------------------ */

const overlayBase: CSSProperties = {
  position: "absolute",
  inset: 0,
  zIndex: 8,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
};

function IntroOverlay({
  onStart,
  reduce,
  narration,
  accent,
}: {
  onStart: () => void;
  reduce: boolean;
  narration?: { speaker?: "adam" | "layla"; lines: string[] };
  accent?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        ...overlayBase,
        // Scroll (never clip) when the card outgrows short viewports; the
        // child's `margin: auto` keeps it centered whenever it fits.
        overflowY: "auto",
        background: "rgba(10, 6, 20, 0.8)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
    >
      <motion.div
        initial={reduce ? { opacity: 0 } : { y: 24, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 22 }}
        style={{
          margin: "auto",
          maxWidth: 460,
          textAlign: "center",
          padding: "28px 26px",
          borderRadius: 24,
          border: "2px solid rgba(255,122,176,0.5)",
          background:
            "linear-gradient(180deg, rgba(44,24,56,0.97) 0%, rgba(20,13,36,0.98) 100%)",
          boxShadow: "0 30px 70px -20px rgba(0,0,0,0.8)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
          <MiniLadderGlyph size={52} />
        </div>
        <div
          style={{
            fontSize: 26,
            fontWeight: 900,
            color: "#ffd1e0",
            marginBottom: 12,
          }}
        >
          The Great Climb-Out
        </div>
        <div
          style={{
            fontSize: 15.5,
            fontWeight: 700,
            lineHeight: 1.55,
            color: "#e6ddf2",
            marginBottom: 8,
          }}
        >
          Whoops! The video burrow pulled you down deep. One more video, one
          more video... and now the daylight is way up there.
        </div>
        <div
          style={{
            fontSize: 15.5,
            fontWeight: 800,
            lineHeight: 1.55,
            color: "#bfe8ff",
            marginBottom: 14,
          }}
        >
          Tap LEFT, then RIGHT, then LEFT to climb the ladder. Steady as a
          drum!
        </div>
        {/* the do-not-tap warning */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 14px",
            borderRadius: 999,
            border: `2px solid ${BAD_RED}`,
            background: "rgba(255,93,93,0.12)",
            marginBottom: 20,
          }}
        >
          <span
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              padding: "4px 10px",
              borderRadius: 999,
              background: "linear-gradient(180deg, #ff7ab0, #ff4d6d)",
              color: "#fff",
              fontSize: 11,
              fontWeight: 900,
            }}
          >
            NEXT VIDEO!
            <svg
              viewBox="0 0 40 40"
              width={40}
              height={40}
              aria-hidden
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%) scale(1.5)",
              }}
            >
              <circle
                cx={20}
                cy={20}
                r={16}
                fill="none"
                stroke={BAD_RED}
                strokeWidth={3.4}
              />
              <line
                x1={9}
                y1={31}
                x2={31}
                y2={9}
                stroke={BAD_RED}
                strokeWidth={3.4}
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span style={{ fontSize: 13, fontWeight: 900, color: "#ffb3b3" }}>
            Don&apos;t tap the juicy bubbles!
          </span>
        </div>
        {narration && narration.lines.length > 0 && (
          <InfoNarration lines={narration.lines} accent={accent ?? "#b8e34b"} />
        )}
        <div>
          <motion.button
            type="button"
            onClick={onStart}
            whileTap={{ scale: 0.95 }}
            whileHover={reduce ? undefined : { scale: 1.04 }}
            style={{
              minWidth: 190,
              minHeight: 58,
              padding: "14px 32px",
              borderRadius: 16,
              border: "3px solid #7dffb0",
              background: `linear-gradient(180deg, ${GOOD_GREEN} 0%, #0e9f6e 100%)`,
              color: "#053b2a",
              fontSize: 18,
              fontWeight: 900,
              letterSpacing: "0.05em",
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: "0 12px 30px -10px rgba(52,211,153,0.95)",
              touchAction: "manipulation",
            }}
          >
            Start climbing!
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CelebrateOverlay({
  taps,
  slips,
  onContinue,
  reduce,
}: {
  taps: number;
  slips: number;
  onContinue: () => void;
  reduce: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduce ? 0.2 : 0.5 }}
      style={{
        ...overlayBase,
        overflow: "hidden",
        background: "linear-gradient(180deg, #9fd9ff 0%, #cfeeff 58%, #e8f8ff 100%)",
      }}
    >
      {/* sun */}
      <motion.div
        animate={reduce ? undefined : { rotate: 360 }}
        transition={
          reduce
            ? undefined
            : { repeat: Infinity, duration: 40, ease: "linear" }
        }
        style={{ position: "absolute", top: 18, right: 26 }}
      >
        <SunGlyph size={86} />
      </motion.div>

      {/* birds + birdsong notes */}
      {[
        { top: "12%", dur: 13, delay: 0, size: 30 },
        { top: "20%", dur: 17, delay: 3, size: 24 },
        { top: "7%", dur: 21, delay: 7, size: 20 },
      ].map((b, i) => (
        <motion.div
          key={i}
          initial={{ left: "-10%" }}
          animate={reduce ? { left: "40%" } : { left: "110%" }}
          transition={
            reduce
              ? { duration: 0.4 }
              : {
                  repeat: Infinity,
                  duration: b.dur,
                  delay: b.delay,
                  ease: "linear",
                }
          }
          style={{ position: "absolute", top: b.top }}
        >
          <BirdGlyph size={b.size} color="#2b5a7a" />
        </motion.div>
      ))}
      {[
        { left: "14%", top: "26%", delay: 0 },
        { left: "24%", top: "18%", delay: 0.9 },
        { left: "8%", top: "14%", delay: 1.7 },
      ].map((n, i) => (
        <motion.div
          key={i}
          animate={
            reduce
              ? { opacity: 0.75 }
              : { y: [0, -26], opacity: [0, 1, 0] }
          }
          transition={
            reduce
              ? undefined
              : {
                  repeat: Infinity,
                  duration: 2.6,
                  delay: n.delay,
                  ease: "easeOut",
                }
          }
          style={{ position: "absolute", left: n.left, top: n.top }}
        >
          <NoteGlyph size={18} color="#2b5a7a" />
        </motion.div>
      ))}

      {/* grassy hill + the burrow mouth you just climbed out of */}
      <div
        style={{
          position: "absolute",
          bottom: -46,
          left: "-10%",
          width: "120%",
          height: 190,
          borderRadius: "50% 50% 0 0 / 100% 100% 0 0",
          background: "linear-gradient(180deg, #63c163 0%, #3f9c4f 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 26,
          left: "50%",
          transform: "translateX(-50%)",
          width: 120,
          height: 44,
          borderRadius: "50%",
          background: "radial-gradient(ellipse at 50% 45%, #1c1230 0%, #2c2138 70%, #3f2c1c 100%)",
          border: "5px solid #4a6e2f",
        }}
      >
        {/* the ladder tip poking out */}
        <svg
          viewBox="0 0 60 40"
          width={54}
          height={36}
          aria-hidden
          style={{
            position: "absolute",
            left: "50%",
            top: -22,
            transform: "translateX(-50%)",
          }}
        >
          <rect x={14} y={0} width={6} height={38} rx={3} fill={LADDER_WOOD} />
          <rect x={40} y={0} width={6} height={38} rx={3} fill={LADDER_WOOD} />
          <rect x={16} y={8} width={28} height={5} rx={2.5} fill="#c98a48" />
          <rect x={16} y={22} width={28} height={5} rx={2.5} fill="#c98a48" />
        </svg>
      </div>

      {/* the banner */}
      <motion.div
        initial={reduce ? { opacity: 0 } : { y: 30, opacity: 0, scale: 0.92 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 230, damping: 20, delay: reduce ? 0 : 0.25 }}
        style={{
          position: "relative",
          maxWidth: 440,
          textAlign: "center",
          padding: "26px 26px 28px",
          borderRadius: 24,
          border: "3px solid #7dffb0",
          background: `linear-gradient(180deg, ${GOOD_GREEN} 0%, #0e9f6e 100%)`,
          boxShadow:
            "0 30px 70px -20px rgba(9,60,40,0.6), 0 0 50px -8px rgba(52,211,153,0.7)",
          color: "#053b2a",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 10 }}>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              initial={reduce ? { opacity: 0 } : { scale: 0, rotate: -30 }}
              animate={reduce ? { opacity: 1 } : { scale: 1, rotate: 0 }}
              transition={
                reduce
                  ? { delay: 0.1 * i }
                  : { delay: 0.4 + 0.16 * i, type: "spring", stiffness: 300, damping: 14 }
              }
              style={{ display: "inline-flex" }}
            >
              <PixIcon emoji="⭐" size={40} />
            </motion.span>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            fontSize: 27,
            fontWeight: 900,
            letterSpacing: "0.02em",
            marginBottom: 10,
          }}
        >
          <PixIcon emoji="✋" size={34} />
          YOU CHOSE TO STOP!
        </div>
        <div
          style={{
            fontSize: 15.5,
            fontWeight: 800,
            lineHeight: 1.6,
            marginBottom: 6,
          }}
        >
          You climbed out of the video burrow, one steady tap at a time.
          {" "}
          {taps === 1 ? "1 climb" : `${taps} climbs`}!
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 800,
            lineHeight: 1.5,
            color: "#0a5c40",
            marginBottom: 8,
          }}
        >
          {slips > 0
            ? `The bubbles pulled you down ${slips === 1 ? "1 time" : `${slips} times`} and you STILL made it out.`
            : "You did not touch a single NEXT VIDEO bubble. Incredible!"}
        </div>
        <div
          style={{
            fontSize: 13.5,
            fontWeight: 700,
            lineHeight: 1.55,
            color: "#064534",
            marginBottom: 18,
          }}
        >
          When videos keep pulling you deeper, stopping is a superpower. You
          can climb out any time you choose.
        </div>
        <motion.button
          type="button"
          onClick={onContinue}
          whileTap={{ scale: 0.95 }}
          whileHover={reduce ? undefined : { scale: 1.04 }}
          style={{
            minWidth: 190,
            minHeight: 58,
            padding: "14px 34px",
            borderRadius: 16,
            border: "3px solid #0e9f6e",
            background: "linear-gradient(180deg, #f3fff8 0%, #d3f5e6 100%)",
            color: "#053b2a",
            fontSize: 18,
            fontWeight: 900,
            letterSpacing: "0.05em",
            cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: "0 12px 30px -10px rgba(6,50,34,0.55)",
            touchAction: "manipulation",
          }}
        >
          Continue
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
