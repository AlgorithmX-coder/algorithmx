"use client";

/*
 * THE KEYHOLE CHECK - Week 16 signature exercise (QR Codes & Links).
 *
 * Doorway-maze fantasy: the child walks a maze of doors. Every door wears
 * a chunky QR-style keyhole pattern and claims a sender ("From: Mom").
 * The child's trusted KEYRING holds the REAL key pattern for each sender.
 * Drag the matching key onto the door and it superimposes: on an honest
 * door every tooth lights green; on a sneaky copycat door exactly ONE
 * tooth flashes red where the patterns disagree. Then the verdict:
 * UNLOCK (honest, opens to warm light) or CHAIN IT (fake, rattles with
 * the Raccoon grumbling behind it). Unlocking a mismatch springs a soft
 * red trap net plus a gentle teach beat, then the child chains it anyway.
 * Four doors, all judged = win.
 *
 * Lesson: QR codes and links look samey. Compare against a trusted
 * source before you open. The "QR pattern" is a decorative 5x5 grid,
 * deliberately NOT a scannable code.
 *
 * All DOM + inline SVG + framer-motion. No timer, no losable state.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactElement,
} from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import PixIcon from "@/app/components/lesson/PixIcon";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import { useGameAudio } from "@/app/lib/gameEngine/useGameAudio";

/* ────────────────────────── constants ────────────────────────── */

const FONT_STACK = "'Fredoka', 'Quicksand', ui-rounded, system-ui, sans-serif";

const GRID = 5; // pattern is a 5x5 grid of "teeth"
const DROP_INFLATE = 64; // generous drop forgiveness for small hands

const COMPARE_MS = 2150; // scan animation before the verdict buttons show
const ADVANCE_MS = 2500; // pause on a resolved door before walking on
const WIN_COMPLETE_MS = 2800; // celebratory beat before onComplete()

const GREEN = "#34d399";
const RED = "#ff6b6b";
const AMBER = "#ffd166";
const INK = "#232a52"; // pattern "teeth" color
const PAPER = "#f6ead0"; // pattern plate color
const BRASS = "#e0a83f";

/* ─────────────────────────── data ────────────────────────────── */

/** "#" = raised tooth, "." = flat. Decorative, not a real QR code. */
const toPattern = (rows: readonly string[]): boolean[] =>
  rows.flatMap((row) => row.split("").map((ch) => ch === "#"));

interface Sender {
  id: string;
  name: string;
  color: string;
  /** The REAL trusted pattern held on the child's keyring. */
  pattern: boolean[];
}

interface Door {
  id: string;
  senderId: string;
  honest: boolean;
  /** Index of the single flipped tooth on a fake door (-1 when honest). */
  flipCell: number;
  /** Tempting message written on the door. */
  lure: string;
  /** Warm beat when an honest door opens. */
  safeLine: string;
  /** Raccoon bark from behind a chained fake. */
  grumble: string;
}

const SENDERS: Sender[] = [
  {
    id: "megagame",
    name: "MegaGame Store",
    color: "#63d8ff",
    pattern: toPattern(["#.#.#", ".###.", "##.##", ".###.", "#.#.#"]),
  },
  {
    id: "mom",
    name: "Mom",
    color: "#ffcf5e",
    pattern: toPattern(["##.##", "#...#", "..#..", "#...#", "##.##"]),
  },
  {
    id: "prize",
    name: "Prize Palace",
    color: "#ff9ad5",
    pattern: toPattern(["..#..", ".###.", "##.##", ".#.#.", "#...#"]),
  },
  {
    id: "grandpa",
    name: "Grandpa Joe",
    color: "#7be0a3",
    pattern: toPattern(["###.#", "#....", "####.", "....#", "#.###"]),
  },
];

const DOORS: Door[] = [
  {
    id: "door-mom",
    senderId: "mom",
    honest: true,
    flipCell: -1,
    lure: "Fresh cookies inside!",
    safeLine: "Every tooth matched. It really is Mom's door. Cookies!",
    grumble: "",
  },
  {
    id: "door-megagame",
    senderId: "megagame",
    honest: false,
    flipCell: 12,
    lure: "FREE 500 gems! Open fast!",
    safeLine: "",
    grumble: "Grrr! Who taught you to check the teeth?!",
  },
  {
    id: "door-grandpa",
    senderId: "grandpa",
    honest: true,
    flipCell: -1,
    lure: "I made you a new puzzle!",
    safeLine: "A perfect match. Grandpa's puzzle is waiting!",
    grumble: "",
  },
  {
    id: "door-prize",
    senderId: "prize",
    honest: false,
    flipCell: 7,
    lure: "You won a HUGE prize!",
    safeLine: "",
    grumble: "My best trick door! No fair!",
  },
];

const senderById = (id: string): Sender => {
  const s = SENDERS.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown sender ${id}`);
  return s;
};

/** What the door actually shows: the real pattern, or one flipped tooth. */
const doorPatternFor = (door: Door): boolean[] => {
  const real = senderById(door.senderId).pattern;
  return door.honest
    ? real
    : real.map((v, i) => (i === door.flipCell ? !v : v));
};

/* ──────────────────────── small helpers ──────────────────────── */

function hitsRect(
  info: PanInfo,
  el: HTMLElement | null,
  inflate: number
): boolean {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  const x = info.point.x - window.scrollX;
  const y = info.point.y - window.scrollY;
  return (
    x >= r.left - inflate &&
    x <= r.right + inflate &&
    y >= r.top - inflate &&
    y <= r.bottom + inflate
  );
}

/* ─────────────────── static pattern grid (DOM) ───────────────── */

function PatternGrid({
  pattern,
  cell,
  gap,
}: {
  pattern: boolean[];
  cell: number;
  gap: number;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${GRID}, ${cell}px)`,
        gap,
        width: cell * GRID + gap * (GRID - 1),
      }}
    >
      {pattern.map((filled, i) => (
        <div
          key={i}
          style={{
            width: cell,
            height: cell,
            borderRadius: Math.max(2, Math.round(cell / 5)),
            background: filled ? INK : "transparent",
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────── key art ─────────────────────────── */

function KeyFace({ sender }: { sender: Sender }) {
  const cell = 8;
  const gap = 1;
  const gridSize = cell * GRID + gap * (GRID - 1); // 44
  const x0 = 38 - gridSize / 2;
  const y0 = 34 - gridSize / 2;
  return (
    <svg width={76} height={108} viewBox="0 0 76 108" aria-hidden>
      {/* head */}
      <circle
        cx={38}
        cy={34}
        r={31}
        fill={sender.color}
        stroke="rgba(0,0,0,0.35)"
        strokeWidth={3}
      />
      <circle cx={38} cy={34} r={25} fill={PAPER} />
      {/* real pattern on the head */}
      {sender.pattern.map((filled, i) =>
        filled ? (
          <rect
            key={i}
            x={x0 + (i % GRID) * (cell + gap)}
            y={y0 + Math.floor(i / GRID) * (cell + gap)}
            width={cell}
            height={cell}
            rx={2}
            fill={INK}
          />
        ) : null
      )}
      {/* shaft + teeth */}
      <rect
        x={33}
        y={62}
        width={10}
        height={42}
        rx={3}
        fill={sender.color}
        stroke="rgba(0,0,0,0.35)"
        strokeWidth={2.5}
      />
      <rect x={42} y={84} width={11} height={7} rx={2} fill={sender.color} />
      <rect x={42} y={95} width={8} height={7} rx={2} fill={sender.color} />
    </svg>
  );
}

/* ─────────────────── door scenery bits (SVG) ─────────────────── */

function MazeBackdrop() {
  return (
    <svg
      viewBox="0 0 600 320"
      preserveAspectRatio="xMidYMax slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      aria-hidden
    >
      {/* glow at the end of the corridor */}
      <radialGradient id="khc-glow" cx="50%" cy="62%" r="55%">
        <stop offset="0%" stopColor="rgba(125,240,255,0.16)" />
        <stop offset="100%" stopColor="rgba(125,240,255,0)" />
      </radialGradient>
      <rect x={0} y={0} width={600} height={320} fill="url(#khc-glow)" />
      {/* perspective floor lines converging on the door */}
      <g stroke="rgba(125,240,255,0.14)" strokeWidth={2}>
        <line x1={-30} y1={320} x2={230} y2={196} />
        <line x1={90} y1={320} x2={252} y2={202} />
        <line x1={630} y1={320} x2={370} y2={196} />
        <line x1={510} y1={320} x2={348} y2={202} />
      </g>
      {/* faraway maze doorways left and right */}
      <g fill="rgba(60,72,140,0.5)" stroke="rgba(125,240,255,0.18)" strokeWidth={2}>
        <path d="M60 236 v-66 a30 30 0 0 1 60 0 v66 z" />
        <path d="M480 236 v-66 a30 30 0 0 1 60 0 v66 z" />
      </g>
      {/* floor line */}
      <line
        x1={0}
        y1={238}
        x2={600}
        y2={238}
        stroke="rgba(125,240,255,0.22)"
        strokeWidth={2}
      />
    </svg>
  );
}

function TrapNet() {
  const lines: ReactElement[] = [];
  for (let i = -3; i <= 6; i++) {
    lines.push(
      <line
        key={`a${i}`}
        x1={i * 40}
        y1={0}
        x2={i * 40 + 120}
        y2={220}
        stroke="rgba(255,92,92,0.85)"
        strokeWidth={4}
      />,
      <line
        key={`b${i}`}
        x1={i * 40 + 120}
        y1={0}
        x2={i * 40}
        y2={220}
        stroke="rgba(255,92,92,0.85)"
        strokeWidth={4}
      />
    );
  }
  return (
    <svg
      viewBox="0 0 180 220"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      aria-hidden
    >
      {lines}
    </svg>
  );
}

function Chains() {
  return (
    <svg
      viewBox="0 0 200 270"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      aria-hidden
    >
      {[
        { x1: -10, y1: 84, x2: 210, y2: 170 },
        { x1: -10, y1: 186, x2: 210, y2: 96 },
      ].map((b, bi) => (
        <g key={bi}>
          <line
            x1={b.x1}
            y1={b.y1}
            x2={b.x2}
            y2={b.y2}
            stroke="#4a4f66"
            strokeWidth={14}
            strokeLinecap="round"
          />
          {[0.12, 0.3, 0.48, 0.66, 0.84].map((t, i) => (
            <circle
              key={i}
              cx={b.x1 + (b.x2 - b.x1) * t}
              cy={b.y1 + (b.y2 - b.y1) * t}
              r={9}
              fill="none"
              stroke="#8b93b4"
              strokeWidth={5}
            />
          ))}
        </g>
      ))}
    </svg>
  );
}

/* ─────────────────── superimposed compare panel ──────────────── */

function ComparePanel({
  door,
  sender,
  doorPattern,
}: {
  door: Door;
  sender: Sender;
  doorPattern: boolean[];
}) {
  const cell = 26;
  const gap = 4;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -12 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      style={{
        position: "absolute",
        left: "50%",
        top: 8,
        transform: "translateX(-50%)",
        zIndex: 30,
        background: "rgba(16,20,44,0.94)",
        border: `2px solid ${BRASS}`,
        borderRadius: 18,
        padding: "12px 16px 10px",
        boxShadow: "0 18px 40px rgba(0,0,0,0.5)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 900,
          letterSpacing: 1.2,
          color: AMBER,
          marginBottom: 8,
          textTransform: "uppercase",
        }}
      >
        {sender.name}&apos;s real key on this door
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${GRID}, ${cell}px)`,
          gap,
          background: PAPER,
          padding: 8,
          borderRadius: 12,
          margin: "0 auto",
          width: cell * GRID + gap * (GRID - 1) + 16,
        }}
      >
        {doorPattern.map((doorFilled, i) => {
          const match = sender.pattern[i] === doorFilled;
          return (
            <div
              key={i}
              style={{
                position: "relative",
                width: cell,
                height: cell,
                borderRadius: 5,
                background: doorFilled ? INK : "transparent",
              }}
            >
              {/* scan overlay lights each tooth in turn */}
              <motion.div
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.045 }}
                style={{
                  position: "absolute",
                  inset: 1,
                  borderRadius: 4,
                  background: match
                    ? "rgba(52,211,153,0.45)"
                    : "rgba(255,80,80,0.8)",
                  border: match
                    ? "2px solid rgba(52,211,153,0.9)"
                    : "2px solid #ff5050",
                }}
              />
              {!match && (
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [1, 0.55, 1] }}
                  transition={{
                    delay: 1.5,
                    duration: 0.9,
                    repeat: Infinity,
                  }}
                  style={{
                    position: "absolute",
                    inset: -4,
                    borderRadius: 8,
                    border: "3px solid #ff5050",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.45 }}
        style={{
          marginTop: 8,
          fontSize: 15,
          fontWeight: 900,
          color: door.honest ? GREEN : RED,
        }}
      >
        {door.honest ? "Every tooth matches!" : "One tooth does not match!"}
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════ main component ═══════════════════════ */

type Phase = "intro" | "drag" | "compare" | "verdict" | "result" | "win";
type Outcome = "safe" | "chained" | "trap";

export default function KeyholeCheck({
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
  const [doorIndex, setDoorIndex] = useState(0);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [trapped, setTrapped] = useState(false);
  const [results, setResults] = useState<Array<"safe" | "chained" | null>>(
    () => DOORS.map(() => null)
  );
  const [hint, setHint] = useState<string | null>(null);
  const [hintKey, setHintKey] = useState(0);
  const [shakeSeq, setShakeSeq] = useState(0);

  const doorRef = useRef<HTMLDivElement | null>(null);
  const doneRef = useRef(false);
  const timeoutsRef = useRef<number[]>([]);

  const schedule = useCallback((fn: () => void, ms: number) => {
    timeoutsRef.current.push(window.setTimeout(fn, ms));
  }, []);

  useEffect(() => {
    const timeouts = timeoutsRef.current;
    return () => {
      timeouts.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const door = DOORS[doorIndex];
  const sender = senderById(door.senderId);
  const doorPattern = doorPatternFor(door);

  const showHint = useCallback((text: string) => {
    setHint(text);
    setHintKey((k) => k + 1);
  }, []);

  /* ── flow ── */

  const finalize = useCallback(
    (kind: "safe" | "chained") => {
      setResults((rs) => {
        const copy = [...rs];
        copy[doorIndex] = kind;
        return copy;
      });
      schedule(() => {
        if (doorIndex >= DOORS.length - 1) {
          setPhase("win");
          audio.unlock();
          schedule(() => {
            if (!doneRef.current) {
              doneRef.current = true;
              onComplete();
            }
          }, WIN_COMPLETE_MS);
        } else {
          setDoorIndex(doorIndex + 1);
          setPhase("drag");
          setOutcome(null);
          setTrapped(false);
          setHint(null);
        }
      }, ADVANCE_MS);
    },
    [doorIndex, onComplete, schedule, audio]
  );

  const handleKeyDragEnd = useCallback(
    (dragged: Sender) => (_e: unknown, info: PanInfo) => {
      if (phase !== "drag") return;
      if (!hitsRect(info, doorRef.current, DROP_INFLATE)) return;
      if (dragged.id === door.senderId) {
        audio.drop();
        setHint(null);
        setPhase("compare");
        schedule(() => setPhase("verdict"), COMPARE_MS);
      } else {
        audio.wrong();
        showHint(
          `That key opens doors from ${dragged.name}. This door says it is from ${sender.name}.`
        );
      }
    },
    [phase, door.senderId, sender.name, schedule, showHint, audio]
  );

  const handleVerdict = useCallback(
    (unlock: boolean) => {
      if (phase !== "verdict") return;
      if (door.honest && unlock) {
        audio.correct();
        setOutcome("safe");
        setPhase("result");
        finalize("safe");
      } else if (!door.honest && !unlock) {
        audio.correct();
        setOutcome("chained");
        setShakeSeq((s) => s + 1);
        setPhase("result");
        finalize("chained");
      } else if (!door.honest && unlock) {
        // opened a fake: soft trap net + teach beat, then let them chain it
        audio.wrong();
        setOutcome("trap");
        setTrapped(true);
        setPhase("result");
      } else {
        // tried to chain an honest door: gentle nudge, no penalty
        audio.wrong();
        setShakeSeq((s) => s + 1);
        showHint(
          `Look again! Every tooth glowed green, so this door really is from ${sender.name}. Try UNLOCK!`
        );
      }
    },
    [phase, door.honest, sender.name, finalize, showHint, audio]
  );

  const handleChainAfterTrap = useCallback(() => {
    if (outcome !== "trap") return;
    audio.tap();
    setOutcome("chained");
    setShakeSeq((s) => s + 1);
    finalize("chained");
  }, [outcome, finalize, audio]);

  /* ── derived display bits ── */

  const doorOpen = outcome === "safe" || outcome === "trap";
  const chained = outcome === "chained";
  const comparing = phase === "compare" || phase === "verdict";

  let resultLine: string | null = null;
  if (phase === "result") {
    if (outcome === "safe") resultLine = door.safeLine;
    else if (outcome === "trap")
      resultLine = "Whoa, a trap net! One tooth off means it is not the real door.";
    else if (outcome === "chained")
      resultLine = trapped
        ? "Chained! Now that trick door cannot fool anyone."
        : "Good catch, hero! One tooth off means a copycat door.";
  }

  /* ═══════════════════════ render ═══════════════════════ */

  return (
    <ExerciseFrame padding={24}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          fontFamily: FONT_STACK,
          userSelect: "none",
        }}
      >
        {/* ── header ── */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              fontSize: 24,
              fontWeight: 900,
              letterSpacing: 1.5,
            }}
          >
            <PixIcon emoji="🔑" size={30} />
            THE KEYHOLE CHECK
            <PixIcon emoji="🚪" size={30} />
          </div>
          <div style={{ fontSize: 14, opacity: 0.85, marginTop: 2 }}>
            Check the pattern with your trusted keyring before you open!
          </div>
          {/* progress dots */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 10,
              marginTop: 8,
            }}
          >
            {DOORS.map((d, i) => {
              const done = results[i] !== null;
              const active = i === doorIndex && !done;
              return (
                <motion.div
                  key={d.id}
                  animate={active ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                  transition={
                    active
                      ? { repeat: Infinity, duration: 1.4 }
                      : { duration: 0.2 }
                  }
                  style={{
                    width: 13,
                    height: 13,
                    borderRadius: "50%",
                    background: done
                      ? GREEN
                      : active
                        ? AMBER
                        : "rgba(255,255,255,0.2)",
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* ── maze scene ── */}
        <div
          style={{
            position: "relative",
            height: 312,
            borderRadius: 20,
            overflow: "hidden",
            background:
              "linear-gradient(180deg, rgba(10,14,34,0.55) 0%, rgba(24,30,66,0.55) 100%)",
          }}
        >
          <MazeBackdrop />

          {/* the current door */}
          <AnimatePresence mode="wait">
            <motion.div
              key={door.id}
              initial={{ opacity: 0, scale: 0.55, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.3, filter: "blur(4px)" }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              style={{
                position: "absolute",
                left: "50%",
                bottom: 14,
                transform: "translateX(-50%)",
                marginLeft: -100,
                width: 200,
                height: 272,
              }}
            >
              {/* floor shadow */}
              <div
                style={{
                  position: "absolute",
                  left: 10,
                  right: 10,
                  bottom: -8,
                  height: 18,
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.45)",
                  filter: "blur(6px)",
                }}
              />

              {/* shake wrapper (chained rattle + honest-chain wobble) */}
              <motion.div
                key={`shake-${shakeSeq}`}
                animate={
                  shakeSeq > 0 ? { x: [0, -8, 7, -5, 3, 0] } : { x: 0 }
                }
                transition={{ duration: 0.55 }}
                style={{ position: "absolute", inset: 0 }}
              >
                <div
                  ref={doorRef}
                  style={{
                    position: "absolute",
                    inset: 0,
                    perspective: 900,
                  }}
                >
                  {/* what is BEHIND the door */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "96px 96px 14px 14px",
                      overflow: "hidden",
                      background:
                        outcome === "safe"
                          ? "radial-gradient(circle at 50% 40%, #ffe9ae 0%, #f2b04e 55%, #a3641f 100%)"
                          : outcome === "trap"
                            ? "radial-gradient(circle at 50% 45%, #571522 0%, #2a0a12 100%)"
                            : "#0b0f24",
                      border: "3px solid rgba(0,0,0,0.4)",
                    }}
                  >
                    {outcome === "trap" && (
                      <>
                        <TrapNet />
                        <div
                          style={{
                            position: "absolute",
                            left: "50%",
                            top: "42%",
                            transform: "translate(-50%, -50%)",
                          }}
                        >
                          <PixIcon emoji="🪤" size={54} />
                        </div>
                      </>
                    )}
                    {outcome === "safe" && (
                      <>
                        {[
                          { left: "22%", top: "30%", d: 0 },
                          { left: "66%", top: "20%", d: 0.4 },
                          { left: "48%", top: "56%", d: 0.8 },
                        ].map((s, i) => (
                          <motion.div
                            key={i}
                            animate={{
                              y: [0, -8, 0],
                              opacity: [0.7, 1, 0.7],
                            }}
                            transition={{
                              repeat: Infinity,
                              duration: 1.6,
                              delay: s.d,
                            }}
                            style={{
                              position: "absolute",
                              left: s.left,
                              top: s.top,
                            }}
                          >
                            <PixIcon emoji="✨" size={30} />
                          </motion.div>
                        ))}
                      </>
                    )}
                  </div>

                  {/* the door leaf */}
                  <motion.div
                    animate={
                      doorOpen
                        ? { rotateY: -84 }
                        : chained
                          ? { rotateY: 0, rotate: [0, -0.8, 0.8, 0] }
                          : { rotateY: 0, rotate: 0 }
                    }
                    transition={
                      chained
                        ? {
                            rotateY: { type: "spring", stiffness: 160, damping: 20 },
                            rotate: {
                              repeat: Infinity,
                              duration: 0.5,
                              repeatDelay: 1.3,
                            },
                          }
                        : { type: "spring", stiffness: 120, damping: 18 }
                    }
                    style={{
                      position: "absolute",
                      inset: 0,
                      transformOrigin: "left center",
                      backfaceVisibility: "hidden",
                      borderRadius: "96px 96px 14px 14px",
                      background:
                        "linear-gradient(180deg, #a4713d 0%, #8a5a2c 55%, #71461f 100%)",
                      border: "4px solid #5c3a17",
                      boxShadow: "inset 0 0 0 3px rgba(255,255,255,0.08)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      paddingTop: 26,
                      gap: 8,
                    }}
                  >
                    {/* sender plaque */}
                    <div
                      style={{
                        background: PAPER,
                        border: `2px solid ${BRASS}`,
                        borderRadius: 10,
                        padding: "5px 12px",
                        textAlign: "center",
                        color: "#3a2c12",
                        maxWidth: 168,
                      }}
                    >
                      <div style={{ fontSize: 15, fontWeight: 900 }}>
                        From: {sender.name}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          fontStyle: "italic",
                          opacity: 0.85,
                        }}
                      >
                        {door.lure}
                      </div>
                    </div>

                    {/* QR-style keyhole plate (the drop target) */}
                    <div
                      style={{
                        background: PAPER,
                        border: `3px solid ${BRASS}`,
                        borderRadius: 12,
                        padding: 8,
                        boxShadow: "0 4px 10px rgba(0,0,0,0.35)",
                      }}
                    >
                      <PatternGrid pattern={doorPattern} cell={14} gap={2} />
                    </div>

                    {/* little keyhole + knob for flavor */}
                    <svg width={40} height={30} viewBox="0 0 40 30" aria-hidden>
                      <circle cx={20} cy={10} r={7} fill="#3a2410" />
                      <path d="M16 14 L24 14 L27 27 L13 27 Z" fill="#3a2410" />
                    </svg>
                    <div
                      style={{
                        position: "absolute",
                        right: 14,
                        top: 150,
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        background: BRASS,
                        boxShadow: "inset -2px -2px 3px rgba(0,0,0,0.4)",
                      }}
                    />
                  </motion.div>

                  {/* chains slam over a judged fake */}
                  <AnimatePresence>
                    {chained && (
                      <motion.div
                        initial={{ opacity: 0, scale: 1.4 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 18 }}
                        style={{ position: "absolute", inset: 0, zIndex: 5 }}
                      >
                        <Chains />
                        <div
                          style={{
                            position: "absolute",
                            left: "50%",
                            top: "46%",
                            transform: "translate(-50%, -50%)",
                          }}
                        >
                          <PixIcon emoji="🔒" size={46} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Raccoon grumbles behind a chained fake */}
              <AnimatePresence>
                {chained && !door.honest && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.7 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: 0.45, type: "spring", stiffness: 260, damping: 18 }}
                    style={{
                      position: "absolute",
                      top: -46,
                      left: "50%",
                      transform: "translateX(-50%)",
                      marginLeft: -10,
                      zIndex: 10,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      background: "#fff",
                      color: "#33240f",
                      borderRadius: 14,
                      padding: "6px 12px",
                      fontSize: 13,
                      fontWeight: 800,
                      whiteSpace: "nowrap",
                      boxShadow: "0 8px 18px rgba(0,0,0,0.4)",
                    }}
                  >
                    <PixIcon emoji="🦝" size={24} />
                    {door.grumble}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>

          {/* superimposed pattern check */}
          <AnimatePresence>
            {comparing && (
              <ComparePanel
                door={door}
                sender={sender}
                doorPattern={doorPattern}
              />
            )}
          </AnimatePresence>
        </div>

        {/* ── hint / prompt line ── */}
        <div style={{ minHeight: 26, textAlign: "center" }}>
          <AnimatePresence mode="wait">
            {hint ? (
              <motion.div
                key={`hint-${hintKey}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: AMBER,
                }}
              >
                {hint}
              </motion.div>
            ) : phase === "drag" ? (
              <motion.div
                key="prompt-drag"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ fontSize: 14, opacity: 0.85, fontWeight: 600 }}
              >
                The door says it is from {sender.name}. Drag that key onto the
                door to check!
              </motion.div>
            ) : phase === "compare" ? (
              <motion.div
                key="prompt-compare"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ fontSize: 14, opacity: 0.85, fontWeight: 600 }}
              >
                Checking every tooth...
              </motion.div>
            ) : phase === "result" && resultLine ? (
              <motion.div
                key={`result-${outcome ?? "none"}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: outcome === "trap" ? RED : GREEN,
                }}
              >
                {resultLine}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* ── bottom dock: keyring / verdict buttons / trap chain ── */}
        <div
          style={{
            minHeight: 168,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {phase === "verdict" ? (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 800 }}>
                Do the teeth say REAL or FAKE?
              </div>
              <div style={{ display: "flex", gap: 18 }}>
                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => handleVerdict(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontFamily: FONT_STACK,
                    fontSize: 18,
                    fontWeight: 900,
                    letterSpacing: 1,
                    padding: "14px 26px",
                    borderRadius: 16,
                    border: "3px solid rgba(0,0,0,0.25)",
                    background: GREEN,
                    color: "#0b2b1c",
                    cursor: "pointer",
                    boxShadow: "0 8px 18px rgba(52,211,153,0.35)",
                  }}
                >
                  <PixIcon emoji="🔑" size={24} />
                  UNLOCK
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => handleVerdict(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontFamily: FONT_STACK,
                    fontSize: 18,
                    fontWeight: 900,
                    letterSpacing: 1,
                    padding: "14px 26px",
                    borderRadius: 16,
                    border: "3px solid rgba(0,0,0,0.25)",
                    background: RED,
                    color: "#3d0b0b",
                    cursor: "pointer",
                    boxShadow: "0 8px 18px rgba(255,107,107,0.35)",
                  }}
                >
                  <PixIcon emoji="🔒" size={24} />
                  CHAIN IT
                </motion.button>
              </div>
            </motion.div>
          ) : phase === "result" && outcome === "trap" ? (
            <motion.button
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={handleChainAfterTrap}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontFamily: FONT_STACK,
                fontSize: 18,
                fontWeight: 900,
                letterSpacing: 1,
                padding: "14px 30px",
                borderRadius: 16,
                border: "3px solid rgba(0,0,0,0.25)",
                background: AMBER,
                color: "#3d2a05",
                cursor: "pointer",
                boxShadow: "0 8px 18px rgba(255,209,102,0.35)",
              }}
            >
              <PixIcon emoji="🔒" size={24} />
              CHAIN IT NOW
            </motion.button>
          ) : (
            /* trusted keyring */
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                width: "100%",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 900,
                  letterSpacing: 1.6,
                  color: AMBER,
                  textTransform: "uppercase",
                }}
              >
                Your trusted keyring
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 20,
                  paddingTop: 6,
                  borderTop: "3px solid rgba(224,168,63,0.5)",
                  width: "min(560px, 100%)",
                }}
              >
                {SENDERS.map((s) => {
                  const draggable = phase === "drag";
                  const inUse = comparing && s.id === door.senderId;
                  return (
                    <motion.div
                      key={s.id}
                      drag={draggable}
                      dragSnapToOrigin
                      dragMomentum={false}
                      onDragEnd={handleKeyDragEnd(s)}
                      whileDrag={{ scale: 1.15, zIndex: 60 }}
                      whileHover={draggable ? { y: -6 } : undefined}
                      animate={{ opacity: inUse ? 0.25 : draggable ? 1 : 0.55 }}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 2,
                        cursor: draggable ? "grab" : "default",
                        touchAction: "none",
                        position: "relative",
                      }}
                    >
                      <KeyFace sender={s} />
                      <div
                        style={{
                          fontSize: 11.5,
                          fontWeight: 800,
                          padding: "3px 10px",
                          borderRadius: 999,
                          border: `2px solid ${s.color}`,
                          background: "rgba(255,255,255,0.08)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {s.name}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── intro overlay ── */}
      <AnimatePresence>
        {phase === "intro" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 40,
              background: "rgba(10,14,32,0.82)",
              backdropFilter: "blur(3px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT_STACK,
              // The card grew with the narration block: allow the overlay to
              // scroll on short viewports so the start button never clips.
              overflowY: "auto",
            }}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 20 }}
              style={{
                // Auto margins keep the card centered when it fits and make
                // it scrollable from the top (not clipped) when it doesn't.
                margin: "auto",
                maxWidth: 460,
                textAlign: "center",
                padding: "28px 30px",
                borderRadius: 22,
                background: "rgba(22,28,60,0.95)",
                border: "2px solid rgba(255,209,102,0.5)",
                boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
              }}
            >
              <PixIcon emoji="🔑" size={44} />
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 900,
                  letterSpacing: 1.5,
                  margin: "8px 0 6px",
                }}
              >
                THE KEYHOLE CHECK
              </div>
              <div style={{ fontSize: 15, lineHeight: 1.5, opacity: 0.92 }}>
                Sneaky doors in this maze copy real ones. Their keyhole
                patterns look almost the same, but a copycat always has one
                tooth wrong!
              </div>
              <div
                style={{
                  textAlign: "left",
                  margin: "14px auto 18px",
                  display: "inline-flex",
                  flexDirection: "column",
                  gap: 8,
                  fontSize: 14.5,
                  fontWeight: 700,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <PixIcon emoji="🚪" size={22} /> Read who the door says it is
                  from.
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <PixIcon emoji="🔑" size={22} /> Drag that sender&apos;s key
                  onto the door.
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <PixIcon emoji="✅" size={22} /> All green teeth? UNLOCK it!
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <PixIcon emoji="🔒" size={22} /> A red tooth? CHAIN IT shut!
                </div>
              </div>
              {narration && narration.lines.length > 0 && (
                <div style={{ textAlign: "left" }}>
                  <InfoNarration
                    lines={narration.lines}
                    accent={accent ?? "#b44dff"}
                  />
                </div>
              )}
              <div>
                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setPhase("drag")}
                  style={{
                    fontFamily: FONT_STACK,
                    fontSize: 19,
                    fontWeight: 900,
                    letterSpacing: 1.2,
                    padding: "14px 34px",
                    borderRadius: 16,
                    border: "3px solid rgba(0,0,0,0.25)",
                    background: AMBER,
                    color: "#3d2a05",
                    cursor: "pointer",
                    boxShadow: "0 10px 24px rgba(255,209,102,0.35)",
                  }}
                >
                  ENTER THE MAZE
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── win overlay ── */}
      <AnimatePresence>
        {phase === "win" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 40,
              background: "rgba(10,14,32,0.85)",
              backdropFilter: "blur(3px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT_STACK,
              // Scroll-safe like the intro overlay: on a short viewport the
              // overlay scrolls instead of clipping the celebration card.
              overflowY: "auto",
            }}
          >
            <motion.div
              initial={{ scale: 0.6, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 16 }}
              style={{ textAlign: "center", maxWidth: 440, padding: 24, margin: "auto" }}
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 1.6 }}
              >
                <PixIcon emoji="🏆" size={72} />
              </motion.div>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 900,
                  letterSpacing: 2,
                  color: AMBER,
                  margin: "10px 0 8px",
                }}
              >
                MAZE MASTER!
              </div>
              <div style={{ fontSize: 16, lineHeight: 1.5, opacity: 0.95 }}>
                You checked every pattern before opening a single door!
              </div>
              <div
                style={{
                  marginTop: 12,
                  fontSize: 14.5,
                  lineHeight: 1.5,
                  fontWeight: 700,
                  color: "#8bffb0",
                }}
              >
                QR codes and links can look almost the same. Always compare
                with a source you trust before you open!
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 16,
                  marginTop: 14,
                }}
              >
                {[0, 0.3, 0.6].map((d, i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -8, 0], rotate: [0, 12, -12, 0] }}
                    transition={{ repeat: Infinity, duration: 1.8, delay: d }}
                  >
                    <PixIcon emoji={i === 1 ? "⭐" : "✨"} size={30} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ExerciseFrame>
  );
}
