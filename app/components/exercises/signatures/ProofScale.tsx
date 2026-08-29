"use client";

/*
 * THE PROOF SCALE - Week 15 signature exercise (AI & Chatbots).
 *
 * Robot-lab fantasy: a Know-It-All robot beeps out confident claims one
 * at a time. A brass lab scale sits in the middle of the lab. The child
 * drags the CLAIM card onto the left pan, then hunts the evidence shelf
 * for the MATCHING proof book and drags it onto the right pan. A real
 * fact plus its book weighs the pan down and stamps TRUE (green). A
 * made-up claim has NO matching book anywhere on the shelf, so the child
 * slams the big red NO PROOF buzzer and the weightless claim floats up
 * and pops (red). Wrong book: the scale just wobbles level and nudges
 * gently. No timer, no losable state.
 *
 * Anti-hallucination lesson: a confident voice is weightless without a
 * real source. Check before you believe.
 *
 * All DOM + framer-motion + inline SVG. The beam is a rotating div; each
 * pan counter-rotates around its hang point so the dishes stay level
 * while the beam tips (classic balance-scale trick).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
  type PanInfo,
} from "framer-motion";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import PixIcon from "@/app/components/lesson/PixIcon";

/* ────────────────────────── constants ────────────────────────── */

const FONT_STACK = "'Fredoka', 'Quicksand', ui-rounded, system-ui, sans-serif";

// Scale geometry (px, inside a 600-wide stage).
const STAGE_W = 600;
const STAGE_H = 292;
const BEAM_W = 440;
const BEAM_H = 14;
const PIVOT_Y = 92; // beam center line, from stage top
const HANG_INSET = 14; // hang points sit this far in from each beam end
const HANGER_W = 164; // hit box width around each pan
const HANGER_H = 158; // hit box height below each hang point

const TILT_PROOF = 12; // degrees, right (book) side down on a proved claim
const DROP_INFLATE = 56; // generous drop forgiveness for small hands

const ADVANCE_MS = 2300; // pause on a resolved claim before the next one
const NUDGE_MS = 3000;

const GREEN = "#34d399";
const GREEN_SOFT = "#8bffb0";
const RED = "#ff6b6b";
const AMBER = "#ffd166";
const BRASS = "#e0a83f";
const BRASS_DARK = "#9c6f1e";
const CREAM = "#fff7e0";

/* ─────────────────────────── data ────────────────────────────── */

interface Book {
  id: string;
  title: string;
  icon: string;
  color: string;
}

interface Claim {
  id: string;
  /** What the robot beeps in its speech bubble. */
  speech: string;
  /** Short text on the draggable claim card. */
  card: string;
  /** Topic word used in gentle nudges. */
  topic: string;
  /** Matching proof book, or null when the claim is made up. */
  bookId: string | null;
  /** One-line teach beat shown when the claim is resolved. */
  fact: string;
}

const BOOKS: Book[] = [
  { id: "space", title: "Space Facts", icon: "⭐", color: "#4f6bd0" },
  { id: "dino", title: "Dinosaur Days", icon: "🦖", color: "#6b8f3c" },
  { id: "ocean", title: "Ocean Animals", icon: "🐙", color: "#2a9d8f" },
  { id: "robot", title: "Robot Repair", icon: "⚙️", color: "#8a5cd5" },
  { id: "cake", title: "Cake Baking", icon: "🎂", color: "#d55c8a" },
];

const CLAIMS: Claim[] = [
  {
    id: "moon",
    speech: "The Moon has NO air. Beep! I am 100 percent sure!",
    card: "The Moon has no air",
    topic: "the Moon and space",
    bookId: "space",
    fact: "TRUE! The proof book weighs it down. Nice checking!",
  },
  {
    id: "spider",
    speech: "Spiders have TEN legs. Beep beep! Trust me!",
    card: "Spiders have ten legs",
    topic: "spiders",
    bookId: null,
    fact: "POP! No book about that anywhere. Great catch!",
  },
  {
    id: "octopus",
    speech: "An octopus has THREE hearts. Beep! For sure!",
    card: "An octopus has three hearts",
    topic: "octopuses and the ocean",
    bookId: "ocean",
    fact: "TRUE! Two hearts for the gills, one for the body!",
  },
  {
    id: "carrot",
    speech: "Carrots grow TALLER when you sing to them. Bleep!",
    card: "Carrots grow taller if you sing",
    topic: "carrots",
    bookId: null,
    fact: "POP! No proof book, no belief. You are a fact checker!",
  },
];

type Phase = "intro" | "play" | "win";
type Stage = "claim" | "evidence" | "resolved";
type Verdict = "true" | "busted";

interface Nudge {
  text: string;
  kind: "nudge" | "good";
}

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

/* ─────────────────── confidence gauge (SVG) ──────────────────── */

function ConfidenceGauge({
  conf,
  idp,
}: {
  conf: MotionValue<number>;
  idp: string;
}) {
  const angle = useTransform(conf, (v) => (1 - v / 100) * Math.PI);
  const nx = useTransform(angle, (a) => 56 + 40 * Math.cos(a));
  const ny = useTransform(angle, (a) => 56 - 40 * Math.sin(a));
  const label = useTransform(conf, (v) => `${Math.round(v)}%`);
  return (
    <div style={{ textAlign: "center", lineHeight: 1 }}>
      <svg width={112} height={66} viewBox="0 0 112 66" aria-hidden>
        <defs>
          <linearGradient id={`${idp}-gaugeArc`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={RED} />
            <stop offset="55%" stopColor={AMBER} />
            <stop offset="100%" stopColor={GREEN} />
          </linearGradient>
        </defs>
        <path
          d="M12 56 A44 44 0 0 1 100 56"
          fill="none"
          stroke="rgba(0,0,0,0.35)"
          strokeWidth={13}
          strokeLinecap="round"
        />
        <path
          d="M12 56 A44 44 0 0 1 100 56"
          fill="none"
          stroke={`url(#${idp}-gaugeArc)`}
          strokeWidth={9}
          strokeLinecap="round"
        />
        <motion.line
          x1={56}
          y1={56}
          x2={nx}
          y2={ny}
          stroke="#f5f9ff"
          strokeWidth={4}
          strokeLinecap="round"
        />
        <circle cx={56} cy={56} r={6} fill="#f5f9ff" />
        <circle cx={56} cy={56} r={3} fill="#2b3358" />
      </svg>
      <div
        style={{
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: 1.2,
          color: "#aeb8e8",
        }}
      >
        CONFIDENCE{" "}
        <motion.span style={{ color: "#f5f9ff" }}>{label}</motion.span>
      </div>
    </div>
  );
}

/* ───────────────────── the Know-It-All robot ─────────────────── */

type Mood = "confident" | "oops" | "deflated";

function RobotFigure({
  mood,
  conf,
  idp,
}: {
  mood: Mood;
  conf: MotionValue<number>;
  idp: string;
}) {
  return (
    <div style={{ position: "relative", width: 168, textAlign: "center" }}>
      <motion.svg
        width={168}
        height={182}
        viewBox="0 0 168 182"
        aria-hidden
        animate={
          mood === "deflated"
            ? { rotate: [0, -2, 2, -1, 0], y: [0, 4, 4] }
            : mood === "oops"
              ? { x: [0, -4, 4, -2, 0] }
              : { y: [0, -3, 0] }
        }
        transition={
          mood === "confident"
            ? { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.9 }
        }
      >
        <defs>
          <linearGradient id={`${idp}-metal`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9fb2e8" />
            <stop offset="100%" stopColor="#5f6fa8" />
          </linearGradient>
          <linearGradient id={`${idp}-belly`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#39406e" />
            <stop offset="100%" stopColor="#232948" />
          </linearGradient>
        </defs>
        {/* antenna */}
        <line x1={84} y1={26} x2={84} y2={8} stroke="#8ea0dd" strokeWidth={4} />
        <motion.circle
          cx={84}
          cy={8}
          r={6}
          fill={mood === "deflated" ? "#8b93b8" : RED}
          animate={
            mood === "deflated" ? { opacity: 0.5 } : { opacity: [1, 0.35, 1] }
          }
          transition={
            mood === "deflated"
              ? undefined
              : { duration: 1.1, repeat: Infinity }
          }
        />
        {/* head */}
        <rect
          x={40}
          y={24}
          width={88}
          height={58}
          rx={16}
          fill={`url(#${idp}-metal)`}
          stroke="#3d4573"
          strokeWidth={3}
        />
        {/* ears */}
        <rect x={30} y={42} width={10} height={22} rx={5} fill="#7d8cc4" />
        <rect x={128} y={42} width={10} height={22} rx={5} fill="#7d8cc4" />
        {/* eyes */}
        {mood === "deflated" ? (
          <g stroke="#1d2340" strokeWidth={4} strokeLinecap="round">
            <line x1={57} y1={44} x2={69} y2={56} />
            <line x1={69} y1={44} x2={57} y2={56} />
            <line x1={99} y1={44} x2={111} y2={56} />
            <line x1={111} y1={44} x2={99} y2={56} />
          </g>
        ) : (
          <g>
            <circle
              cx={63}
              cy={50}
              r={mood === "oops" ? 11 : 9}
              fill="#1d2340"
            />
            <circle
              cx={105}
              cy={50}
              r={mood === "oops" ? 11 : 9}
              fill="#1d2340"
            />
            <circle cx={66} cy={47} r={3} fill="#7df0ff" />
            <circle cx={108} cy={47} r={3} fill="#7df0ff" />
            {mood === "confident" && (
              <g stroke="#3d4573" strokeWidth={3} strokeLinecap="round">
                <line x1={53} y1={37} x2={71} y2={40} />
                <line x1={115} y1={37} x2={97} y2={40} />
              </g>
            )}
          </g>
        )}
        {/* mouth */}
        {mood === "confident" && (
          <path
            d="M66 68 Q84 76 102 66"
            fill="none"
            stroke="#1d2340"
            strokeWidth={4}
            strokeLinecap="round"
          />
        )}
        {mood === "oops" && <circle cx={84} cy={69} r={7} fill="#1d2340" />}
        {mood === "deflated" && (
          <path
            d="M64 70 Q74 64 84 70 Q94 76 104 70"
            fill="none"
            stroke="#1d2340"
            strokeWidth={4}
            strokeLinecap="round"
          />
        )}
        {/* body */}
        <rect
          x={34}
          y={90}
          width={100}
          height={78}
          rx={18}
          fill={`url(#${idp}-metal)`}
          stroke="#3d4573"
          strokeWidth={3}
        />
        {/* chest panel that holds the gauge */}
        <rect
          x={46}
          y={98}
          width={76}
          height={58}
          rx={10}
          fill={`url(#${idp}-belly)`}
          stroke="#3d4573"
          strokeWidth={2}
        />
        {/* arms */}
        <rect x={16} y={100} width={16} height={44} rx={8} fill="#7d8cc4" />
        <rect x={136} y={100} width={16} height={44} rx={8} fill="#7d8cc4" />
      </motion.svg>
      {/* gauge sits over the chest panel */}
      <div style={{ position: "absolute", left: 28, top: 96 }}>
        <ConfidenceGauge conf={conf} idp={idp} />
      </div>
    </div>
  );
}

/* ────────────── pan assembly (counter-rotating hanger) ───────── */

function Hanger({
  side,
  negTilt,
  panRef,
  children,
}: {
  side: "left" | "right";
  negTilt: MotionValue<number>;
  panRef: React.RefObject<HTMLDivElement | null>;
  children?: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "absolute",
        top: BEAM_H / 2,
        left: side === "left" ? HANG_INSET : undefined,
        right: side === "right" ? HANG_INSET : undefined,
        width: 0,
        height: 0,
      }}
    >
      <motion.div style={{ rotate: negTilt, transformOrigin: "0px 0px" }}>
        <div
          ref={panRef}
          style={{
            position: "absolute",
            left: -HANGER_W / 2,
            top: -6,
            width: HANGER_W,
            height: HANGER_H,
          }}
        >
          <svg
            width={HANGER_W}
            height={HANGER_H}
            viewBox={`0 0 ${HANGER_W} ${HANGER_H}`}
            style={{ position: "absolute", inset: 0 }}
            aria-hidden
          >
            <circle
              cx={HANGER_W / 2}
              cy={8}
              r={5}
              fill="none"
              stroke={BRASS}
              strokeWidth={3}
            />
            <line
              x1={HANGER_W / 2}
              y1={12}
              x2={20}
              y2={104}
              stroke={BRASS_DARK}
              strokeWidth={2.5}
            />
            <line
              x1={HANGER_W / 2}
              y1={12}
              x2={HANGER_W - 20}
              y2={104}
              stroke={BRASS_DARK}
              strokeWidth={2.5}
            />
            {/* dish */}
            <path
              d={`M14 104 Q${HANGER_W / 2} 150 ${HANGER_W - 14} 104 Q${
                HANGER_W / 2
              } 122 14 104 Z`}
              fill={BRASS}
              stroke={BRASS_DARK}
              strokeWidth={2}
            />
            <ellipse
              cx={HANGER_W / 2}
              cy={104}
              rx={HANGER_W / 2 - 14}
              ry={9}
              fill="#f0c060"
              stroke={BRASS_DARK}
              strokeWidth={2}
            />
          </svg>
          {/* item slot, sitting on the dish rim */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              bottom: HANGER_H - 104,
              display: "flex",
              justifyContent: "center",
            }}
          >
            {children}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────── claim card + book visuals ───────────────── */

function ClaimCardFace({ text, width }: { text: string; width: number }) {
  return (
    <div
      style={{
        width,
        borderRadius: 12,
        background: CREAM,
        border: "2px solid #e8c96a",
        boxShadow: "0 8px 18px rgba(0,0,0,0.35)",
        padding: "8px 10px 10px",
        color: "#3a2c12",
        textAlign: "center",
      }}
    >
      <div
        style={{
          display: "inline-block",
          background: RED,
          color: "#fff",
          fontSize: 10,
          fontWeight: 900,
          letterSpacing: 1.4,
          borderRadius: 6,
          padding: "2px 8px",
          marginBottom: 5,
        }}
      >
        CLAIM
      </div>
      <div style={{ fontSize: 14, fontWeight: 800, lineHeight: 1.25 }}>
        {text}
      </div>
    </div>
  );
}

function BookFace({ book, width }: { book: Book; width: number }) {
  return (
    <div
      style={{
        width,
        borderRadius: 10,
        background: book.color,
        border: "2px solid rgba(0,0,0,0.3)",
        boxShadow:
          "inset 6px 0 0 rgba(0,0,0,0.22), inset -3px 0 0 rgba(255,255,255,0.35), 0 8px 16px rgba(0,0,0,0.35)",
        padding: "10px 6px 8px 12px",
        textAlign: "center",
        color: "#fff",
      }}
    >
      <PixIcon emoji={book.icon} size={30} />
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          lineHeight: 1.15,
          marginTop: 4,
          textShadow: "0 1px 2px rgba(0,0,0,0.4)",
        }}
      >
        {book.title}
      </div>
    </div>
  );
}

/* ═══════════════════════ main component ═══════════════════════ */

export default function ProofScale({
  onComplete,
  narration,
  accent,
}: {
  onComplete: () => void;
  narration?: { speaker?: "adam" | "layla"; lines: string[] };
  accent?: string;
}) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [claimIdx, setClaimIdx] = useState(0);
  const [stage, setStage] = useState<Stage>("claim");
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [placedBookId, setPlacedBookId] = useState<string | null>(null);
  const [usedBookIds, setUsedBookIds] = useState<string[]>([]);
  const [judged, setJudged] = useState<Verdict[]>([]);
  const [nudge, setNudge] = useState<Nudge | null>(null);
  const [nudgeKey, setNudgeKey] = useState(0);
  const [mood, setMood] = useState<Mood>("confident");

  const tilt = useMotionValue(0);
  const negTilt = useTransform(tilt, (t) => -t);
  const buzzShake = useMotionValue(0);
  const boardConf = useMotionValue(99);
  const winConf = useMotionValue(99);

  const leftPanRef = useRef<HTMLDivElement | null>(null);
  const rightPanRef = useRef<HTMLDivElement | null>(null);
  const timersRef = useRef<number[]>([]);
  const doneRef = useRef(false);

  const claim = CLAIMS[claimIdx];

  const later = useCallback((fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  }, []);

  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  const showNudge = useCallback(
    (text: string, kind: Nudge["kind"]) => {
      setNudge({ text, kind });
      setNudgeKey((k) => k + 1);
      if (kind === "nudge") {
        later(() => setNudge((n) => (n?.text === text ? null : n)), NUDGE_MS);
      }
    },
    [later]
  );

  /* ── flow ── */

  const goNext = useCallback(
    (fromIdx: number) => {
      const next = fromIdx + 1;
      if (next >= CLAIMS.length) {
        setPhase("win");
        return;
      }
      setClaimIdx(next);
      setStage("claim");
      setVerdict(null);
      setPlacedBookId(null);
      setNudge(null);
      setMood("confident");
      animate(tilt, 0, { type: "spring", stiffness: 150, damping: 15 });
    },
    [tilt]
  );

  const handleClaimDragEnd = useCallback(
    (_e: unknown, info: PanInfo) => {
      if (stage !== "claim") return;
      if (hitsRect(info, leftPanRef.current, DROP_INFLATE)) {
        setStage("evidence");
        setNudge(null);
        // tiny settle wiggle so the drop feels physical
        animate(tilt, [0, -2.5, 1.5, 0], { duration: 0.7, ease: "easeInOut" });
      }
    },
    [stage, tilt]
  );

  const handleBookDragEnd = useCallback(
    (book: Book) => (_e: unknown, info: PanInfo) => {
      if (stage !== "evidence" || verdict) return;
      if (!hitsRect(info, rightPanRef.current, DROP_INFLATE)) return;
      if (book.id === claim.bookId) {
        setPlacedBookId(book.id);
        setUsedBookIds((ids) => [...ids, book.id]);
        setVerdict("true");
        setStage("resolved");
        setJudged((j) => [...j, "true"]);
        showNudge(claim.fact, "good");
        animate(tilt, TILT_PROOF, {
          type: "spring",
          stiffness: 110,
          damping: 9,
          delay: 0.15,
        });
        later(() => goNext(claimIdx), ADVANCE_MS);
      } else {
        // wrong book: wobble level, nudge gently, book snaps home
        animate(tilt, [0, -6, 5, -3.5, 2, 0], {
          duration: 0.9,
          ease: "easeInOut",
        });
        showNudge(
          `Hmm, does that book really talk about ${claim.topic}? Look for one that does!`,
          "nudge"
        );
      }
    },
    [stage, verdict, claim, claimIdx, tilt, showNudge, later, goNext]
  );

  const handleBuzzer = useCallback(() => {
    if (stage !== "evidence" || verdict) return;
    if (claim.bookId === null) {
      setVerdict("busted");
      setStage("resolved");
      setJudged((j) => [...j, "busted"]);
      setMood("oops");
      showNudge(claim.fact, "good");
      animate(tilt, [0, 3.5, -2, 0], { duration: 0.8, ease: "easeOut" });
      later(() => goNext(claimIdx), ADVANCE_MS + 200);
    } else {
      animate(buzzShake, [0, -7, 7, -5, 5, 0], { duration: 0.5 });
      showNudge(
        `Beep? Wait. I think one of those books DOES talk about ${claim.topic}. Peek again!`,
        "nudge"
      );
    }
  }, [stage, verdict, claim, claimIdx, tilt, buzzShake, showNudge, later, goNext]);

  /* ── win: deflate the robot, stamp the seal, complete once ── */

  useEffect(() => {
    if (phase !== "win") return;
    const anim = animate(winConf, 11, {
      duration: 1.5,
      delay: 0.5,
      ease: "easeOut",
    });
    const t = window.setTimeout(() => {
      if (!doneRef.current) {
        doneRef.current = true;
        onComplete();
      }
    }, 2600);
    timersRef.current.push(t);
    return () => anim.stop();
  }, [phase, winConf, onComplete]);

  const placedBook = BOOKS.find((b) => b.id === placedBookId) ?? null;
  const statusDefault =
    stage === "claim"
      ? "Drag the CLAIM card onto the left pan of the scale."
      : stage === "evidence"
        ? "Find the matching proof book for the right pan. No book? Slam NO PROOF!"
        : "";
  const status = nudge ?? (statusDefault ? { text: statusDefault, kind: "info" } : null);
  const statusColor =
    status === null
      ? "transparent"
      : status.kind === "nudge"
        ? AMBER
        : status.kind === "good"
          ? GREEN_SOFT
          : "#aeb8e8";

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
        {/* header */}
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
                fontWeight: 900,
                letterSpacing: 1,
                color: "#f5f9ff",
              }}
            >
              THE PROOF SCALE
            </div>
            <div style={{ fontSize: 13, color: "#aeb8e8", fontWeight: 600 }}>
              Weigh the robot&apos;s claims. Only real proof is heavy!
            </div>
          </div>
          {/* progress stamps */}
          <div style={{ display: "flex", gap: 8 }} aria-label="progress">
            {CLAIMS.map((c, i) => {
              const done = judged[i];
              const current = phase === "play" && i === claimIdx && !done;
              return (
                <motion.div
                  key={c.id}
                  animate={
                    current ? { scale: [1, 1.12, 1] } : { scale: 1 }
                  }
                  transition={
                    current
                      ? { duration: 1.2, repeat: Infinity }
                      : { type: "spring", stiffness: 300, damping: 18 }
                  }
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: done
                      ? done === "true"
                        ? "rgba(52,211,153,0.22)"
                        : "rgba(255,107,107,0.22)"
                      : "rgba(255,255,255,0.06)",
                    border: `2px solid ${
                      done
                        ? done === "true"
                          ? GREEN
                          : RED
                        : current
                          ? "#7df0ff"
                          : "rgba(255,255,255,0.2)"
                    }`,
                    fontSize: 16,
                    fontWeight: 900,
                    color: done === "busted" ? RED : GREEN,
                  }}
                >
                  {done === "true" ? (
                    <PixIcon emoji="✅" size={18} />
                  ) : done === "busted" ? (
                    "✗"
                  ) : (
                    ""
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* main lab row */}
        <div
          style={{
            display: "flex",
            gap: 16,
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          {/* robot column */}
          <div
            style={{
              width: 210,
              minWidth: 190,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <RobotFigure mood={mood} conf={boardConf} idp="board" />
            {/* speech bubble */}
            <div
              style={{
                position: "relative",
                background: "rgba(255,255,255,0.08)",
                border: "1.5px solid rgba(125,240,255,0.35)",
                borderRadius: 14,
                padding: "10px 12px",
                fontSize: 14,
                fontWeight: 700,
                color: "#e7ecff",
                minHeight: 58,
                width: "100%",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -8,
                  left: "50%",
                  transform: "translateX(-50%) rotate(45deg)",
                  width: 14,
                  height: 14,
                  background: "#1c2450",
                  borderLeft: "1.5px solid rgba(125,240,255,0.35)",
                  borderTop: "1.5px solid rgba(125,240,255,0.35)",
                }}
              />
              <AnimatePresence mode="wait">
                <motion.div
                  key={claim.id + mood}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                >
                  {mood === "oops"
                    ? "Bzzt... I made that one up. Good catch!"
                    : claim.speech}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* the draggable claim card, presented by the robot */}
            <div style={{ height: 92, display: "flex", alignItems: "center" }}>
              <AnimatePresence>
                {phase === "play" && stage === "claim" && (
                  <motion.div
                    key={claim.id}
                    drag
                    dragSnapToOrigin
                    dragMomentum={false}
                    onDragEnd={handleClaimDragEnd}
                    whileDrag={{ scale: 1.08, zIndex: 60 }}
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1, y: [0, -5, 0] }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{
                      y: { duration: 1.4, repeat: Infinity, ease: "easeInOut" },
                    }}
                    style={{
                      cursor: "grab",
                      touchAction: "none",
                      position: "relative",
                      zIndex: 20,
                    }}
                    role="button"
                    aria-label={`Claim card: ${claim.card}. Drag onto the left scale pan.`}
                  >
                    <ClaimCardFace text={claim.card} width={168} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* shelf + scale column */}
          <div
            style={{
              flex: 1,
              minWidth: 380,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {/* evidence shelf */}
            <div style={{ position: "relative", zIndex: 10 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 1.6,
                  color: BRASS,
                  marginBottom: 4,
                }}
              >
                EVIDENCE SHELF
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  justifyContent: "center",
                  alignItems: "flex-end",
                  padding: "6px 8px 10px",
                }}
              >
                {BOOKS.map((book) => {
                  const used = usedBookIds.includes(book.id);
                  const draggable =
                    phase === "play" &&
                    stage === "evidence" &&
                    !verdict &&
                    !used;
                  return (
                    <motion.div
                      key={book.id}
                      drag={draggable}
                      dragSnapToOrigin
                      dragMomentum={false}
                      onDragEnd={handleBookDragEnd(book)}
                      whileDrag={{ scale: 1.1, zIndex: 60 }}
                      whileHover={draggable ? { y: -6 } : undefined}
                      animate={{ opacity: used ? 0.35 : draggable ? 1 : 0.55 }}
                      style={{
                        cursor: draggable ? "grab" : "default",
                        touchAction: "none",
                        position: "relative",
                      }}
                      role="button"
                      aria-label={
                        used
                          ? `${book.title}, already used`
                          : `Proof book: ${book.title}`
                      }
                    >
                      <BookFace book={book} width={92} />
                      {used && (
                        <div
                          style={{
                            position: "absolute",
                            top: -8,
                            right: -8,
                          }}
                        >
                          <PixIcon emoji="✅" size={22} />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
              {/* wooden shelf plank */}
              <div
                style={{
                  height: 12,
                  borderRadius: 6,
                  background:
                    "linear-gradient(180deg, #a8703a 0%, #7c4c22 100%)",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.4)",
                }}
              />
            </div>

            {/* scale stage */}
            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: STAGE_W,
                height: STAGE_H,
                margin: "0 auto",
              }}
            >
              {/* post + base */}
              <svg
                width={STAGE_W}
                height={STAGE_H}
                viewBox={`0 0 ${STAGE_W} ${STAGE_H}`}
                style={{
                  position: "absolute",
                  inset: 0,
                  maxWidth: "100%",
                }}
                aria-hidden
              >
                <defs>
                  <linearGradient id="ps-brass" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f0c060" />
                    <stop offset="100%" stopColor={BRASS_DARK} />
                  </linearGradient>
                </defs>
                <rect
                  x={STAGE_W / 2 - 9}
                  y={PIVOT_Y}
                  width={18}
                  height={STAGE_H - PIVOT_Y - 26}
                  rx={6}
                  fill="url(#ps-brass)"
                  stroke={BRASS_DARK}
                  strokeWidth={2}
                />
                <path
                  d={`M${STAGE_W / 2 - 74} ${STAGE_H - 8} L${
                    STAGE_W / 2 - 46
                  } ${STAGE_H - 30} L${STAGE_W / 2 + 46} ${STAGE_H - 30} L${
                    STAGE_W / 2 + 74
                  } ${STAGE_H - 8} Z`}
                  fill="url(#ps-brass)"
                  stroke={BRASS_DARK}
                  strokeWidth={2}
                />
                <rect
                  x={STAGE_W / 2 - 80}
                  y={STAGE_H - 10}
                  width={160}
                  height={8}
                  rx={4}
                  fill={BRASS_DARK}
                />
              </svg>

              {/* beam (rotates) with hanging pans (counter-rotate) */}
              <motion.div
                style={{
                  position: "absolute",
                  left: `calc(50% - ${BEAM_W / 2}px)`,
                  top: PIVOT_Y - BEAM_H / 2,
                  width: BEAM_W,
                  height: BEAM_H,
                  borderRadius: BEAM_H / 2,
                  background:
                    "linear-gradient(180deg, #f0c060 0%, #c08a2e 60%, #9c6f1e 100%)",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.45)",
                  rotate: tilt,
                  transformOrigin: "center center",
                }}
              >
                <Hanger side="left" negTilt={negTilt} panRef={leftPanRef}>
                  {(stage === "evidence" || stage === "resolved") && (
                    <motion.div
                      animate={
                        verdict === "busted"
                          ? {
                              y: -132,
                              opacity: [1, 1, 0],
                              scale: [1, 1.12, 1.3],
                              rotate: -8,
                            }
                          : { y: 0, opacity: 1 }
                      }
                      transition={
                        verdict === "busted"
                          ? {
                              duration: 1.05,
                              ease: "easeOut",
                              opacity: { times: [0, 0.8, 1], duration: 1.05 },
                            }
                          : undefined
                      }
                      style={{ position: "relative" }}
                    >
                      <ClaimCardFace text={claim.card} width={134} />
                      {/* TRUE stamp */}
                      <AnimatePresence>
                        {verdict === "true" && (
                          <motion.div
                            initial={{ scale: 2.4, opacity: 0, rotate: -20 }}
                            animate={{ scale: 1, opacity: 1, rotate: -12 }}
                            transition={{
                              type: "spring",
                              stiffness: 420,
                              damping: 20,
                              delay: 0.35,
                            }}
                            style={{
                              position: "absolute",
                              inset: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              pointerEvents: "none",
                            }}
                          >
                            <div
                              style={{
                                border: `4px solid ${GREEN}`,
                                borderRadius: 10,
                                padding: "2px 14px",
                                fontSize: 26,
                                fontWeight: 900,
                                letterSpacing: 2,
                                color: GREEN,
                                background: "rgba(10,24,16,0.55)",
                              }}
                            >
                              TRUE
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                  {stage === "claim" && phase === "play" && (
                    <motion.div
                      animate={{ opacity: [0.4, 0.9, 0.4] }}
                      transition={{ duration: 1.6, repeat: Infinity }}
                      style={{
                        width: 120,
                        height: 66,
                        borderRadius: 12,
                        border: "2px dashed rgba(125,240,255,0.6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: 800,
                        color: "#7df0ff",
                        textAlign: "center",
                        letterSpacing: 0.5,
                      }}
                    >
                      CLAIM
                      <br />
                      HERE
                    </motion.div>
                  )}
                </Hanger>
                <Hanger side="right" negTilt={negTilt} panRef={rightPanRef}>
                  {placedBook ? (
                    <motion.div
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 16 }}
                    >
                      <BookFace book={placedBook} width={92} />
                    </motion.div>
                  ) : stage === "evidence" && phase === "play" ? (
                    <motion.div
                      animate={{ opacity: [0.4, 0.9, 0.4] }}
                      transition={{ duration: 1.6, repeat: Infinity }}
                      style={{
                        width: 96,
                        height: 66,
                        borderRadius: 12,
                        border: `2px dashed rgba(224,168,63,0.8)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: 800,
                        color: BRASS,
                        textAlign: "center",
                        letterSpacing: 0.5,
                      }}
                    >
                      PROOF
                      <br />
                      HERE
                    </motion.div>
                  ) : null}
                </Hanger>
                {/* pivot cap */}
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle at 35% 30%, #ffe1a0, #b8862e 70%)",
                    border: `2px solid ${BRASS_DARK}`,
                  }}
                />
              </motion.div>

              {/* NO PROOF burst over the left pan area */}
              <AnimatePresence>
                {verdict === "busted" && (
                  <motion.div
                    key="pop"
                    initial={{ scale: 0.3, opacity: 0, rotate: -10 }}
                    animate={{ scale: 1.05, opacity: 1, rotate: -6 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 16,
                      delay: 0.75,
                    }}
                    style={{
                      position: "absolute",
                      left: `calc(50% - ${BEAM_W / 2 - HANG_INSET}px)`,
                      top: 8,
                      transform: "translateX(-50%)",
                      pointerEvents: "none",
                      zIndex: 30,
                    }}
                  >
                    <div style={{ position: "relative", marginLeft: -70 }}>
                      <svg width={140} height={90} viewBox="0 0 140 90" aria-hidden>
                        <g stroke={RED} strokeWidth={5} strokeLinecap="round">
                          <line x1={70} y1={44} x2={70} y2={10} />
                          <line x1={70} y1={44} x2={104} y2={22} />
                          <line x1={70} y1={44} x2={116} y2={48} />
                          <line x1={70} y1={44} x2={36} y2={22} />
                          <line x1={70} y1={44} x2={24} y2={48} />
                          <line x1={70} y1={44} x2={48} y2={76} />
                          <line x1={70} y1={44} x2={92} y2={76} />
                        </g>
                      </svg>
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: "50%",
                          transform: "translateX(-50%) rotate(-6deg)",
                          background: RED,
                          color: "#fff",
                          fontWeight: 900,
                          fontSize: 18,
                          letterSpacing: 1.5,
                          borderRadius: 10,
                          padding: "4px 14px",
                          whiteSpace: "nowrap",
                          boxShadow: "0 6px 16px rgba(255,107,107,0.4)",
                        }}
                      >
                        NO PROOF!
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* the buzzer */}
              <motion.div
                style={{
                  position: "absolute",
                  right: 0,
                  bottom: 4,
                  x: buzzShake,
                  textAlign: "center",
                }}
              >
                <motion.button
                  type="button"
                  onClick={handleBuzzer}
                  disabled={phase !== "play" || stage !== "evidence" || !!verdict}
                  whileTap={
                    phase === "play" && stage === "evidence" && !verdict
                      ? { scale: 0.85 }
                      : undefined
                  }
                  animate={
                    phase === "play" && stage === "evidence" && !verdict
                      ? { scale: [1, 1.04, 1] }
                      : { scale: 1 }
                  }
                  transition={{ duration: 1.6, repeat: Infinity }}
                  aria-label="No proof buzzer. Press when no book matches the claim."
                  style={{
                    width: 92,
                    height: 92,
                    borderRadius: "50%",
                    border: "6px solid #5a1a1a",
                    background:
                      stage === "evidence" && !verdict && phase === "play"
                        ? "radial-gradient(circle at 35% 30%, #ff9a8a, #d92b2b 65%)"
                        : "radial-gradient(circle at 35% 30%, #9a6a6a, #6a3232 65%)",
                    boxShadow:
                      "0 10px 20px rgba(0,0,0,0.45), inset 0 -8px 12px rgba(0,0,0,0.35)",
                    cursor:
                      stage === "evidence" && !verdict && phase === "play"
                        ? "pointer"
                        : "default",
                    color: "#fff",
                    fontFamily: FONT_STACK,
                    fontWeight: 900,
                    fontSize: 13,
                    letterSpacing: 0.8,
                    lineHeight: 1.15,
                  }}
                >
                  NO
                  <br />
                  PROOF!
                </motion.button>
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: 1.2,
                    color: "#aeb8e8",
                  }}
                >
                  SLAM IF MADE UP
                </div>
              </motion.div>
            </div>

            {/* status line */}
            <div
              style={{
                minHeight: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: "0 8px",
              }}
            >
              <AnimatePresence mode="wait">
                {status && (
                  <motion.div
                    key={nudgeKey + (status.kind === "nudge" ? "-n" : status.text)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    style={{
                      fontSize: 15,
                      fontWeight: 800,
                      color: statusColor,
                    }}
                  >
                    {status.text}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────── intro overlay ───────────────────── */}
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
              zIndex: 50,
              background: "rgba(12,17,38,0.9)",
              backdropFilter: "blur(4px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              // The spoken-instruction block makes the intro taller than a
              // short viewport. Content scrolls in its own region and the start
              // button sits in a PINNED footer, so it is always on screen.
              overflow: "hidden",
              padding: 0,
              textAlign: "center",
              fontFamily: FONT_STACK,
            }}
          >
            <div
              style={{
                flex: "1 1 auto",
                minHeight: 0,
                overflowY: "auto",
                justifyContent: "safe center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
                width: "100%",
                padding: "24px 24px 8px",
              }}
            >
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              style={{ fontSize: 44 }}
            >
              <PixIcon emoji="🤖" size={56} />
            </motion.div>
            <div
              style={{
                fontSize: 30,
                fontWeight: 900,
                letterSpacing: 1.5,
                color: "#f5f9ff",
              }}
            >
              THE PROOF SCALE
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#c6cef2",
                maxWidth: 460,
                lineHeight: 1.5,
              }}
            >
              The Know-It-All Robot sounds SO sure about everything. But is it
              right? Weigh every claim against real proof!
            </div>
            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                justifyContent: "center",
                maxWidth: 560,
              }}
            >
              {[
                { icon: "👆", text: "Drag the CLAIM onto the scale" },
                { icon: "🔍", text: "Find its matching proof book" },
                { icon: "✋", text: "No book? Slam NO PROOF!" },
              ].map((step, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "rgba(255,255,255,0.07)",
                    border: "1.5px solid rgba(125,240,255,0.3)",
                    borderRadius: 12,
                    padding: "8px 14px",
                    fontSize: 14,
                    fontWeight: 800,
                    color: "#e7ecff",
                  }}
                >
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: "#7df0ff",
                      color: "#0c1126",
                      fontSize: 13,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {i + 1}
                  </span>
                  <PixIcon emoji={step.icon} size={22} />
                  {step.text}
                </div>
              ))}
            </div>
            {/* Spoken "here's what to do" instruction (Sarah), authored on the
                week's signature screen def. Auto-plays + Read-aloud button. */}
            {narration && narration.lines.length > 0 && (
              <div style={{ width: "100%", maxWidth: 560, textAlign: "left" }}>
                <InfoNarration lines={narration.lines} accent={accent ?? "#3dffc4"} />
              </div>
            )}
            </div>
            <div style={{ flex: "0 0 auto", padding: "12px 24px 20px", display: "flex", justifyContent: "center" }}>
            <motion.button
              type="button"
              onClick={() => setPhase("play")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                border: "none",
                borderRadius: 16,
                padding: "14px 44px",
                fontSize: 20,
                fontWeight: 900,
                letterSpacing: 1,
                fontFamily: FONT_STACK,
                color: "#0a1a10",
                background: `linear-gradient(180deg, ${GREEN_SOFT}, ${GREEN})`,
                boxShadow: "0 10px 26px rgba(52,211,153,0.4)",
                cursor: "pointer",
              }}
            >
              START WEIGHING
            </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────────────── win overlay ───────────────────── */}
      <AnimatePresence>
        {phase === "win" && (
          <motion.div
            key="win"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 50,
              background: "rgba(12,17,38,0.92)",
              backdropFilter: "blur(4px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: 24,
              textAlign: "center",
              fontFamily: FONT_STACK,
              overflow: "hidden",
            }}
          >
            {/* sparkles */}
            {[
              { left: "14%", top: "20%", d: 0.2 },
              { left: "82%", top: "16%", d: 0.6 },
              { left: "8%", top: "68%", d: 1.0 },
              { left: "88%", top: "62%", d: 1.4 },
              { left: "24%", top: "84%", d: 0.8 },
              { left: "70%", top: "86%", d: 1.2 },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: [0, 1, 0], scale: [0.4, 1.1, 0.5], y: -18 }}
                transition={{
                  duration: 2.2,
                  delay: s.d,
                  repeat: Infinity,
                  repeatDelay: 0.8,
                }}
                style={{ position: "absolute", left: s.left, top: s.top }}
              >
                <PixIcon emoji="✨" size={26} />
              </motion.div>
            ))}

            <div style={{ position: "relative" }}>
              <RobotFigure mood="deflated" conf={winConf} idp="win" />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0], y: -26, x: 14 }}
                transition={{ duration: 1.6, delay: 0.6 }}
                style={{
                  position: "absolute",
                  top: 12,
                  right: -22,
                  fontSize: 15,
                  fontWeight: 800,
                  color: "#aeb8e8",
                  fontStyle: "italic",
                }}
              >
                pssss...
              </motion.div>
              {/* CHECKED! seal */}
              <motion.div
                initial={{ scale: 2.6, opacity: 0, rotate: -30 }}
                animate={{ scale: 1, opacity: 1, rotate: -10 }}
                transition={{
                  type: "spring",
                  stiffness: 320,
                  damping: 17,
                  delay: 1.9,
                }}
                style={{
                  position: "absolute",
                  top: 26,
                  left: "50%",
                  marginLeft: -74,
                  width: 148,
                  height: 148,
                  borderRadius: "50%",
                  border: `5px double ${GREEN}`,
                  background: "rgba(10,26,16,0.72)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  boxShadow: "0 0 40px rgba(52,211,153,0.45)",
                }}
              >
                <PixIcon emoji="✅" size={40} />
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    letterSpacing: 2,
                    color: GREEN_SOFT,
                  }}
                >
                  CHECKED!
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.3 }}
              style={{
                fontSize: 24,
                fontWeight: 900,
                color: "#f5f9ff",
                letterSpacing: 0.5,
              }}
            >
              All claims weighed!
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.6 }}
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#c6cef2",
                maxWidth: 460,
                lineHeight: 1.5,
              }}
            >
              A loud, confident voice is not proof. Real facts come with real
              sources. You checked before you believed, and that is a
              superpower!
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ExerciseFrame>
  );
}
