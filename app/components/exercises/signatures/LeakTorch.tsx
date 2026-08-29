"use client";

/*
 * THE LEAK TORCH - Week 2 signature exercise (Private Info).
 *
 * Safehouse fantasy: the bedroom lights are out. The child drags a round
 * torch beam (SVG mask spotlight that follows the pointer) around a dark
 * room. Private-info leaks hidden in plain sight glow GOLD when the beam
 * passes over them (full name on a trophy, school crest on a hoodie, home
 * address on a parcel, house number out the window). Tapping a glowing
 * leak slaps a shield sticker over it: sealed leaks stop glowing and get
 * a green tick. Safe objects (teddy, ball, lamp) glow a calm blue and, if
 * tapped, give a soft amber teach line. Never a red fail, no timer, no
 * losable state. WIN: all four leaks sealed, the room lights come up in
 * green, "Safehouse secured!", then onComplete() fires exactly once.
 *
 * Everything is inline SVG/CSS. The scene is painted in its LIT colors
 * and a masked darkness rect does the "lights out" so the win beat is
 * just fading that rect away.
 */

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import PixIcon from "@/app/components/lesson/PixIcon";

/* ────────────────────────── constants ────────────────────────── */

const VIEW_W = 720;
const VIEW_H = 460;

/** Distance from beam center at which an object counts as "lit". */
const LIT_R = 100;
/** Outer feather radius of the darkness hole (visual beam size). */
const HOLE_R = 150;
/** Pointer travel below this (logical px) counts as a tap, not a drag. */
const TAP_SLOP = 16;

const WIN_LIGHTS_DELAY_MS = 750; // last sticker pop → lights up
const WIN_COMPLETE_MS = 3200; // lights up → onComplete()
const TOAST_MS = 2600;

const STICKER_ROT = [-8, 7, -5, 10];

type Phase = "intro" | "play" | "win";

interface Pt {
  x: number;
  y: number;
}

interface RoomObject {
  id: string;
  kind: "leak" | "safe";
  /** Hotspot center in viewBox coords. */
  x: number;
  y: number;
  /** Generous tap/glow radius (big touch targets). */
  hitR: number;
  /** Green chip shown when a leak is sealed. */
  sealMsg?: string;
  /** Amber teach line shown when a safe object is tapped. */
  safeMsg?: string;
}

const OBJECTS: RoomObject[] = [
  {
    id: "window",
    kind: "leak",
    x: 147,
    y: 118,
    hitR: 48,
    sealMsg: "Sealed! Now strangers cannot spot your house number.",
  },
  {
    id: "trophy",
    kind: "leak",
    x: 315,
    y: 130,
    hitR: 48,
    sealMsg: "Sealed! Your full name is private info.",
  },
  {
    id: "hoodie",
    kind: "leak",
    x: 517,
    y: 128,
    hitR: 50,
    sealMsg: "Sealed! Your school name stays secret.",
  },
  {
    id: "parcel",
    kind: "leak",
    x: 400,
    y: 378,
    hitR: 52,
    sealMsg: "Sealed! Your home address stays hidden.",
  },
  {
    id: "teddy",
    kind: "safe",
    x: 150,
    y: 284,
    hitR: 46,
    safeMsg: "That one is fine for anyone to see. Teddy tells no secrets.",
  },
  {
    id: "ball",
    kind: "safe",
    x: 285,
    y: 412,
    hitR: 42,
    safeMsg: "That one is fine for anyone to see. A ball does not give you away.",
  },
  {
    id: "lamp",
    kind: "safe",
    x: 630,
    y: 244,
    hitR: 46,
    safeMsg: "That one is fine for anyone to see. Lamps make light, not leaks.",
  },
];

const LEAKS = OBJECTS.filter((o) => o.kind === "leak");

interface Toast {
  key: number;
  tone: "green" | "amber";
  text: string;
  xPct: number;
  yPct: number;
}

/* ────────────────────────── helpers ────────────────────────── */

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

/** Glow treatment for an object group. */
function objStyle(
  lit: boolean,
  kind: "leak" | "safe",
  isSealed: boolean
): CSSProperties {
  if (isSealed) return { transition: "filter 300ms ease" };
  if (!lit) return { transition: "filter 300ms ease" };
  return {
    transition: "filter 300ms ease",
    filter:
      kind === "leak"
        ? "drop-shadow(0 0 10px rgba(255,206,92,0.9)) brightness(1.18)"
        : "drop-shadow(0 0 8px rgba(170,205,255,0.75)) brightness(1.1)",
  };
}

function LitRing({ o, isSealed }: { o: RoomObject; isSealed: boolean }) {
  if (o.kind === "leak" && isSealed) {
    return (
      <circle
        cx={o.x}
        cy={o.y}
        r={o.hitR}
        fill="rgba(90,220,140,0.08)"
        stroke="rgba(90,220,140,0.6)"
        strokeWidth={2.5}
      />
    );
  }
  const gold = o.kind === "leak";
  return (
    <circle
      className={gold ? "lt-pulse" : undefined}
      cx={o.x}
      cy={o.y}
      r={o.hitR}
      fill={gold ? "rgba(255,206,92,0.12)" : "rgba(170,205,255,0.07)"}
      stroke={gold ? "rgba(255,206,92,0.95)" : "rgba(170,205,255,0.6)"}
      strokeWidth={gold ? 3.5 : 2.5}
      strokeDasharray={gold ? undefined : "6 8"}
    />
  );
}

function IntroChip({ icon, text }: { icon: string; text: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 14,
        padding: "10px 16px",
        fontSize: 15,
        fontWeight: 700,
        textAlign: "left",
      }}
    >
      <PixIcon emoji={icon} size={28} />
      <span>{text}</span>
    </div>
  );
}

/* ────────────────────────── component ────────────────────────── */

export default function LeakTorch({ onComplete }: { onComplete: () => void }) {
  const rawId = useId();
  const uid = `lt${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const [phase, setPhase] = useState<Phase>("intro");
  const [torch, setTorch] = useState<Pt>({ x: VIEW_W / 2, y: VIEW_H / 2 });
  const [sealed, setSealed] = useState<string[]>([]);
  const [toast, setToast] = useState<Toast | null>(null);

  const sceneRef = useRef<HTMLDivElement | null>(null);
  const pendingPos = useRef<Pt | null>(null);
  const rafRef = useRef<number | null>(null);
  const downPos = useRef<Pt | null>(null);
  const toastKey = useRef(0);
  const doneRef = useRef(false);

  const sealedSet = new Set(sealed);
  const litIds = new Set<string>();
  if (phase === "play") {
    for (const o of OBJECTS) {
      if (Math.hypot(torch.x - o.x, torch.y - o.y) < LIT_R) litIds.add(o.id);
    }
  }

  /* ── pointer plumbing (rAF-throttled so the beam feels smooth) ── */

  const toLogical = useCallback(
    (e: React.PointerEvent<HTMLDivElement>): Pt | null => {
      const el = sceneRef.current;
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return null;
      return {
        x: ((e.clientX - rect.left) / rect.width) * VIEW_W,
        y: ((e.clientY - rect.top) / rect.height) * VIEW_H,
      };
    },
    []
  );

  const scheduleTorch = useCallback((p: Pt) => {
    pendingPos.current = p;
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      if (pendingPos.current) setTorch(pendingPos.current);
    });
  }, []);

  useEffect(
    () => () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    },
    []
  );

  const showToast = useCallback((tone: Toast["tone"], text: string, o: RoomObject) => {
    toastKey.current += 1;
    setToast({
      key: toastKey.current,
      tone,
      text,
      xPct: clamp((o.x / VIEW_W) * 100, 16, 84),
      yPct: clamp(((o.y - o.hitR - 10) / VIEW_H) * 100, 8, 92),
    });
  }, []);

  const handleTap = useCallback(
    (p: Pt) => {
      let best: RoomObject | null = null;
      let bestD = Infinity;
      for (const o of OBJECTS) {
        const d = Math.hypot(p.x - o.x, p.y - o.y);
        if (d < o.hitR && d < bestD) {
          best = o;
          bestD = d;
        }
      }
      if (!best) return;
      const target = best;
      if (target.kind === "leak") {
        setSealed((prev) => {
          if (prev.includes(target.id)) return prev;
          showToast("green", target.sealMsg ?? "Sealed!", target);
          return [...prev, target.id];
        });
      } else {
        showToast("amber", target.safeMsg ?? "That one is fine for anyone to see.", target);
      }
    },
    [showToast]
  );

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (phase !== "play") return;
    const p = toLogical(e);
    if (!p) return;
    downPos.current = p;
    scheduleTorch(p);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* pointer capture is a nicety, not a requirement */
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (phase !== "play") return;
    const p = toLogical(e);
    if (p) scheduleTorch(p);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (phase !== "play") return;
    const p = toLogical(e);
    if (p && downPos.current) {
      const travel = Math.hypot(p.x - downPos.current.x, p.y - downPos.current.y);
      if (travel < TAP_SLOP) handleTap(p);
    }
    downPos.current = null;
  };

  /* ── toast auto-dismiss ── */

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(
      () => setToast((cur) => (cur && cur.key === toast.key ? null : cur)),
      TOAST_MS
    );
    return () => clearTimeout(t);
  }, [toast]);

  /* ── win sequencing: last sticker pop → lights up → onComplete ── */

  useEffect(() => {
    if (phase !== "play" || sealed.length < LEAKS.length) return;
    const t = setTimeout(() => setPhase("win"), WIN_LIGHTS_DELAY_MS);
    return () => clearTimeout(t);
  }, [phase, sealed]);

  useEffect(() => {
    if (phase !== "win") return;
    const t = setTimeout(() => {
      if (!doneRef.current) {
        doneRef.current = true;
        onComplete();
      }
    }, WIN_COMPLETE_MS);
    return () => clearTimeout(t);
  }, [phase, onComplete]);

  const remaining = LEAKS.length - sealed.length;
  const torchVisible = phase === "play";

  /* ────────────────────────── render ────────────────────────── */

  return (
    <ExerciseFrame padding={24} maxWidth={960} aspectRatio={{ w: 720, h: 460 }} reserve={300}>
      <style>{`
        .lt-pulse { animation: ltPulse 1.3s ease-in-out infinite; }
        @keyframes ltPulse { 0%, 100% { opacity: 0.35; } 50% { opacity: 1; } }
      `}</style>

      {/* HUD */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 14,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <PixIcon emoji="🔍" size={32} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: 0.4 }}>
              THE LEAK TORCH
            </div>
            <div style={{ fontSize: 12.5, opacity: 0.75 }}>
              Find the private info hiding in the dark
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(0,0,0,0.28)",
            borderRadius: 999,
            padding: "8px 14px",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, opacity: 0.85 }}>
            Leaks sealed
          </span>
          {LEAKS.map((l) => (
            <PixIcon
              key={l.id}
              emoji="🛡️"
              size={22}
              style={
                sealedSet.has(l.id)
                  ? { filter: "drop-shadow(0 0 6px rgba(90,220,140,0.85))" }
                  : { opacity: 0.25, filter: "grayscale(1)" }
              }
            />
          ))}
          <span style={{ fontSize: 13, fontWeight: 800, color: "#8bffb0" }}>
            {sealed.length}/{LEAKS.length}
          </span>
        </div>
      </div>

      {/* SCENE */}
      <div
        ref={sceneRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "720 / 460",
          borderRadius: 18,
          overflow: "hidden",
          background: "#0a0f22",
          touchAction: "none",
          userSelect: "none",
          WebkitUserSelect: "none",
          WebkitTapHighlightColor: "transparent",
          cursor: phase === "play" ? "none" : "default",
          boxShadow: "0 12px 34px -14px rgba(0,0,0,0.6)",
        }}
      >
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            display: "block",
            pointerEvents: "none",
          }}
        >
          <defs>
            <radialGradient id={`${uid}-hole`}>
              <stop offset="0%" stopColor="#000000" />
              <stop offset="55%" stopColor="#000000" />
              <stop offset="100%" stopColor="#ffffff" />
            </radialGradient>
            <radialGradient id={`${uid}-warm`}>
              <stop offset="0%" stopColor="#ffd678" stopOpacity={0.3} />
              <stop offset="60%" stopColor="#ffd678" stopOpacity={0.1} />
              <stop offset="100%" stopColor="#ffd678" stopOpacity={0} />
            </radialGradient>
            <linearGradient id={`${uid}-beam`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#bed7ff" stopOpacity={0.14} />
              <stop offset="100%" stopColor="#bed7ff" stopOpacity={0} />
            </linearGradient>
            <mask
              id={`${uid}-dark`}
              maskUnits="userSpaceOnUse"
              x={0}
              y={0}
              width={VIEW_W}
              height={VIEW_H}
            >
              <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="#ffffff" />
              <circle cx={torch.x} cy={torch.y} r={HOLE_R} fill={`url(#${uid}-hole)`} />
            </mask>
          </defs>

          {/* ── room base (painted lit; darkness rect dims it) ── */}
          <rect x={0} y={0} width={720} height={318} fill="#3f4a78" />
          <rect x={0} y={306} width={720} height={12} fill="#2e3757" />
          <rect x={0} y={318} width={720} height={142} fill="#6b5138" />
          {[104, 208, 312, 416, 520, 624].map((px) => (
            <line
              key={px}
              x1={px}
              y1={318}
              x2={px}
              y2={460}
              stroke="rgba(0,0,0,0.18)"
              strokeWidth={2}
            />
          ))}
          <line x1={0} y1={366} x2={720} y2={366} stroke="rgba(0,0,0,0.14)" strokeWidth={2} />
          <line x1={0} y1={414} x2={720} y2={414} stroke="rgba(0,0,0,0.14)" strokeWidth={2} />
          <ellipse cx={370} cy={430} rx={140} ry={26} fill="#46557f" />
          <ellipse cx={370} cy={430} rx={104} ry={18} fill="#54679a" />

          {/* poster (pure decor) */}
          <rect x={612} y={54} width={74} height={96} rx={6} fill="#31537d" stroke="#243b58" strokeWidth={4} />
          <circle cx={649} cy={94} r={15} fill="#ffd76a" />
          <ellipse cx={649} cy={94} rx={24} ry={7} fill="none" stroke="#f0a92e" strokeWidth={3} />
          <circle cx={628} cy={70} r={2} fill="#dfe8ff" />
          <circle cx={670} cy={128} r={2} fill="#dfe8ff" />

          {/* ── LEAK: window with the house number across the street ── */}
          <g style={objStyle(litIds.has("window"), "leak", sealedSet.has("window"))}>
            <rect x={50} y={44} width={134} height={124} rx={4} fill="#141c38" />
            <circle cx={80} cy={70} r={11} fill="#ffedbb" />
            <circle cx={85} cy={66} r={9} fill="#141c38" />
            <circle cx={150} cy={60} r={2} fill="#dfe8ff" />
            <circle cx={110} cy={54} r={1.6} fill="#dfe8ff" />
            <circle cx={166} cy={90} r={1.6} fill="#dfe8ff" />
            <polygon points="96,110 131,88 166,110" fill="#3a4a75" />
            <rect x={100} y={110} width={62} height={58} fill="#46577f" />
            <rect x={112} y={132} width={16} height={36} fill="#2c3a60" />
            <rect x={138} y={130} width={16} height={14} fill="#ffe9a8" />
            <rect x={134} y={110} width={26} height={15} rx={3} fill="#ffd76a" />
            <text x={147} y={122} textAnchor="middle" fontSize={12} fontWeight={800} fill="#4a3306">
              27
            </text>
            <rect x={44} y={38} width={146} height={136} rx={6} fill="none" stroke="#8a704f" strokeWidth={9} />
            <line x1={117} y1={44} x2={117} y2={170} stroke="#8a704f" strokeWidth={5} />
            <line x1={48} y1={104} x2={186} y2={104} stroke="#8a704f" strokeWidth={5} />
          </g>

          {/* ── LEAK: trophy with a full name ── */}
          <g style={objStyle(litIds.has("trophy"), "leak", sealedSet.has("trophy"))}>
            <rect x={248} y={168} width={150} height={11} rx={3} fill="#8a704f" />
            <rect x={258} y={179} width={8} height={14} fill="#6d5638" />
            <rect x={380} y={179} width={8} height={14} fill="#6d5638" />
            <path
              d="M 295 96 L 335 96 L 331 124 Q 315 136 299 124 Z"
              fill="#ffd76a"
              stroke="#d8a832"
              strokeWidth={2}
            />
            <path
              d="M 295 100 Q 281 104 289 118 Q 292 122 297 120"
              fill="none"
              stroke="#d8a832"
              strokeWidth={4}
            />
            <path
              d="M 335 100 Q 349 104 341 118 Q 338 122 333 120"
              fill="none"
              stroke="#d8a832"
              strokeWidth={4}
            />
            <rect x={310} y={132} width={10} height={12} fill="#d8a832" />
            <rect x={297} y={144} width={36} height={10} rx={2} fill="#b8871f" />
            <rect x={291} y={154} width={48} height={14} rx={3} fill="#6d4f14" />
            <text
              x={315}
              y={164}
              textAnchor="middle"
              fontSize={8}
              fontWeight={800}
              letterSpacing={0.5}
              fill="#ffe9b0"
            >
              ALEX PARKER
            </text>
            <text x={315} y={116} textAnchor="middle" fontSize={12} fill="#a8791a">
              ★
            </text>
          </g>

          {/* ── LEAK: hoodie with the school crest ── */}
          <g style={objStyle(litIds.has("hoodie"), "leak", sealedSet.has("hoodie"))}>
            <circle cx={517} cy={50} r={5} fill="#c9d4f0" />
            <ellipse cx={517} cy={72} rx={26} ry={14} fill="#8e2e3c" />
            <path
              d="M 483 74 Q 517 60 551 74 L 559 178 Q 517 194 475 178 Z"
              fill="#b23a4a"
            />
            <path d="M 483 76 L 469 150 Q 466 162 476 164 L 486 160 Z" fill="#9e3242" />
            <path d="M 551 76 L 565 150 Q 568 162 558 164 L 548 160 Z" fill="#9e3242" />
            <line x1={509} y1={80} x2={507} y2={100} stroke="#f0e6d0" strokeWidth={3} />
            <line x1={525} y1={80} x2={527} y2={100} stroke="#f0e6d0" strokeWidth={3} />
            <path
              d="M 517 102 L 531 108 L 531 122 Q 531 132 517 138 Q 503 132 503 122 L 503 108 Z"
              fill="#ffd76a"
              stroke="#d8a832"
              strokeWidth={2}
            />
            <circle cx={517} cy={117} r={6} fill="#2e7d4f" />
            <rect x={515} y={121} width={4} height={7} fill="#6d4f14" />
            <text
              x={517}
              y={155}
              textAnchor="middle"
              fontSize={9}
              fontWeight={800}
              letterSpacing={1}
              fill="#ffe9b0"
            >
              OAKWOOD
            </text>
            <path d="M 477 172 Q 517 186 557 172" stroke="#8e2e3c" strokeWidth={4} fill="none" />
          </g>

          {/* ── SAFE: bed + teddy ── */}
          <g style={objStyle(litIds.has("teddy"), "safe", false)}>
            <rect x={22} y={214} width={16} height={126} rx={5} fill="#7a5a36" />
            <rect x={222} y={266} width={14} height={78} rx={5} fill="#7a5a36" />
            <rect x={34} y={296} width={192} height={30} rx={9} fill="#dfe4f5" />
            <rect x={34} y={312} width={192} height={32} fill="#5a76c9" />
            <rect x={34} y={316} width={192} height={7} fill="#7d94dd" />
            <ellipse cx={72} cy={296} rx={30} ry={13} fill="#f2f4fc" />
            <rect x={40} y={344} width={10} height={12} fill="#5b4326" />
            <rect x={208} y={344} width={10} height={12} fill="#5b4326" />
            <circle cx={139} cy={258} r={7} fill="#a8764e" />
            <circle cx={161} cy={258} r={7} fill="#a8764e" />
            <circle cx={150} cy={270} r={16} fill="#b9855c" />
            <ellipse cx={150} cy={276} rx={8} ry={6} fill="#dcb289" />
            <circle cx={144} cy={266} r={2.2} fill="#3a2a1a" />
            <circle cx={156} cy={266} r={2.2} fill="#3a2a1a" />
            <circle cx={150} cy={274} r={2.4} fill="#3a2a1a" />
            <ellipse cx={150} cy={299} rx={17} ry={15} fill="#b9855c" />
            <ellipse cx={150} cy={301} rx={9} ry={8} fill="#dcb289" />
            <ellipse cx={133} cy={295} rx={6} ry={9} fill="#a8764e" />
            <ellipse cx={167} cy={295} rx={6} ry={9} fill="#a8764e" />
          </g>

          {/* ── SAFE: ball ── */}
          <g style={objStyle(litIds.has("ball"), "safe", false)}>
            <ellipse cx={285} cy={434} rx={20} ry={4} fill="rgba(0,0,0,0.25)" />
            <circle cx={285} cy={412} r={21} fill="#f2f4fc" stroke="#c8cede" strokeWidth={1.5} />
            <polygon points="285,404 293,410 290,419 280,419 277,410" fill="#39415e" />
            <line x1={285} y1={404} x2={285} y2={392} stroke="#39415e" strokeWidth={2} />
            <line x1={293} y1={410} x2={305} y2={407} stroke="#39415e" strokeWidth={2} />
            <line x1={290} y1={419} x2={297} y2={430} stroke="#39415e" strokeWidth={2} />
            <line x1={280} y1={419} x2={273} y2={430} stroke="#39415e" strokeWidth={2} />
            <line x1={277} y1={410} x2={265} y2={407} stroke="#39415e" strokeWidth={2} />
          </g>

          {/* ── LEAK: parcel with the home address ── */}
          <g style={objStyle(litIds.has("parcel"), "leak", sealedSet.has("parcel"))}>
            <polygon points="352,352 374,330 470,330 448,352" fill="#caa06b" />
            <polygon points="448,352 470,330 470,392 448,414" fill="#96693e" />
            <polygon points="405,352 427,330 439,330 417,352" fill="#e8d9b8" opacity={0.8} />
            <rect x={352} y={352} width={96} height={62} fill="#b98955" />
            <rect x={394} y={352} width={12} height={62} fill="#e8d9b8" opacity={0.8} />
            <rect x={362} y={362} width={76} height={38} rx={3} fill="#f5f1e6" />
            <text x={400} y={377} textAnchor="middle" fontSize={9} fontWeight={800} fill="#3a3a3a">
              ALEX PARKER
            </text>
            <text x={400} y={391} textAnchor="middle" fontSize={9} fontWeight={700} fill="#3a3a3a">
              12 Maple Street
            </text>
          </g>

          {/* ── SAFE: desk + lamp ── */}
          <g style={objStyle(litIds.has("lamp"), "safe", false)}>
            <rect x={556} y={298} width={152} height={12} rx={3} fill="#8a704f" />
            <rect x={564} y={310} width={10} height={104} fill="#6d5638" />
            <rect x={690} y={310} width={10} height={104} fill="#6d5638" />
            <rect x={664} y={288} width={34} height={10} rx={2} fill="#4f8f6a" />
            <rect x={627} y={252} width={7} height={46} fill="#3d4460" />
            <ellipse cx={630} cy={298} rx={18} ry={5} fill="#3d4460" />
            <polygon points="604,252 656,252 646,222 614,222" fill="#ffd76a" stroke="#d8a832" strokeWidth={2} />
            <ellipse cx={630} cy={256} rx={20} ry={6} fill="rgba(255,231,150,0.5)" />
          </g>

          {/* soft moonlight spilling from the window */}
          <polygon points="46,172 190,172 258,318 6,318" fill={`url(#${uid}-beam)`} />

          {/* lit / sealed rings (under the darkness so they show in-beam) */}
          {OBJECTS.map((o) => {
            const isSealed = o.kind === "leak" && sealedSet.has(o.id);
            if (!isSealed && !litIds.has(o.id)) return null;
            return <LitRing key={o.id} o={o} isSealed={isSealed} />;
          })}

          {/* ── darkness with the torch hole ── */}
          <rect
            x={0}
            y={0}
            width={VIEW_W}
            height={VIEW_H}
            fill="#04060f"
            opacity={phase === "win" ? 0 : 0.93}
            style={{ transition: "opacity 1100ms ease" }}
            mask={`url(#${uid}-dark)`}
          />

          {/* warm torch light + rim */}
          <circle
            cx={torch.x}
            cy={torch.y}
            r={HOLE_R * 0.9}
            fill={`url(#${uid}-warm)`}
            opacity={torchVisible ? 1 : 0}
            style={{ transition: "opacity 700ms ease" }}
          />
          <circle
            cx={torch.x}
            cy={torch.y}
            r={LIT_R}
            fill="none"
            stroke="rgba(255,238,200,0.35)"
            strokeWidth={2.5}
            opacity={torchVisible ? 1 : 0}
            style={{ transition: "opacity 700ms ease" }}
          />

          {/* green wash when the safehouse is secured */}
          <rect
            x={0}
            y={0}
            width={VIEW_W}
            height={VIEW_H}
            fill="rgba(120,235,160,0.12)"
            opacity={phase === "win" ? 1 : 0}
            style={{ transition: "opacity 1200ms ease" }}
          />
        </svg>

        {/* hint twinkles over unsealed leaks (above the dark, very subtle) */}
        {phase === "play" &&
          LEAKS.filter((l) => !sealedSet.has(l.id)).map((l, i) => (
            <motion.div
              key={l.id}
              animate={{ opacity: [0, 0.5, 0], scale: [0.6, 1, 0.6], x: "-50%", y: "-50%" }}
              transition={{ duration: 2.6, repeat: Infinity, delay: i * 0.9, repeatDelay: 2.4 }}
              style={{
                position: "absolute",
                left: `${(l.x / VIEW_W) * 100}%`,
                top: `${((l.y - l.hitR * 0.55) / VIEW_H) * 100}%`,
                pointerEvents: "none",
                lineHeight: 0,
              }}
            >
              <PixIcon emoji="✨" size={16} />
            </motion.div>
          ))}

        {/* shield stickers on sealed leaks */}
        {LEAKS.map((l, i) =>
          sealedSet.has(l.id) ? (
            <motion.div
              key={l.id}
              initial={{ x: "-50%", y: "-50%", scale: 2.1, rotate: -22, opacity: 0 }}
              animate={{ x: "-50%", y: "-50%", scale: 1, rotate: STICKER_ROT[i], opacity: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 18 }}
              style={{
                position: "absolute",
                left: `${(l.x / VIEW_W) * 100}%`,
                top: `${(l.y / VIEW_H) * 100}%`,
                pointerEvents: "none",
                zIndex: 3,
              }}
            >
              <div style={{ position: "relative", width: 52, height: 52, display: "grid", placeItems: "center" }}>
                <PixIcon
                  emoji="🛡️"
                  size={50}
                  style={{
                    filter:
                      "drop-shadow(0 2px 6px rgba(0,0,0,0.5)) drop-shadow(0 0 10px rgba(90,220,140,0.65))",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    right: -6,
                    bottom: -6,
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "#17b862",
                    display: "grid",
                    placeItems: "center",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
                    fontSize: 14,
                    fontWeight: 900,
                    color: "#ffffff",
                  }}
                >
                  ✓
                </div>
              </div>
            </motion.div>
          ) : null
        )}

        {/* feedback bubble (green seal / amber teach; never red) */}
        <AnimatePresence>
          {toast && phase === "play" && (
            <motion.div
              key={toast.key}
              initial={{ opacity: 0, scale: 0.9, x: "-50%", y: "-96%" }}
              animate={{ opacity: 1, scale: 1, x: "-50%", y: "-108%" }}
              exit={{ opacity: 0, scale: 0.95, x: "-50%", y: "-118%" }}
              style={{
                position: "absolute",
                left: `${toast.xPct}%`,
                top: `${toast.yPct}%`,
                pointerEvents: "none",
                zIndex: 5,
                display: "flex",
                alignItems: "center",
                gap: 8,
                maxWidth: 250,
                padding: "10px 14px",
                borderRadius: 14,
                fontSize: 13.5,
                fontWeight: 700,
                textAlign: "left",
                background:
                  toast.tone === "green"
                    ? "linear-gradient(180deg, #12452c, #0d3322)"
                    : "linear-gradient(180deg, #4a3c14, #38300f)",
                border:
                  toast.tone === "green"
                    ? "1.5px solid rgba(90,220,140,0.65)"
                    : "1.5px solid rgba(255,206,92,0.65)",
                color: toast.tone === "green" ? "#c9ffdd" : "#ffe9b0",
                boxShadow: "0 8px 22px -8px rgba(0,0,0,0.65)",
              }}
            >
              <PixIcon emoji={toast.tone === "green" ? "✅" : "💡"} size={20} />
              <span>{toast.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* intro overlay */}
        <AnimatePresence>
          {phase === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 10,
                // The start button lives in a PINNED footer that is always on
                // screen; the instructions scroll above it. On a short viewport
                // this stops the button being clipped off the bottom of the
                // fixed-aspect scene (which previously trapped the child here).
                display: "flex",
                flexDirection: "column",
                background: "rgba(8,11,24,0.82)",
                backdropFilter: "blur(3px)",
              }}
            >
              <div
                style={{
                  flex: "1 1 auto",
                  minHeight: 0,
                  overflowY: "auto",
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "safe center",
                  padding: "16px 12px 6px",
                }}
              >
                <div style={{ textAlign: "center", maxWidth: 520 }}>
                  <PixIcon emoji="🔍" size={52} />
                  <h2
                    style={{
                      margin: "8px 0 6px",
                      fontSize: 26,
                      fontWeight: 900,
                      letterSpacing: 1,
                      color: "#ffd76a",
                    }}
                  >
                    THE LEAK TORCH
                  </h2>
                  <p style={{ margin: "0 0 14px", fontSize: 15, opacity: 0.9, lineHeight: 1.4 }}>
                    Lights out! Private info is hiding in plain sight all over this
                    room. Sweep the torch beam and find it before a snoop does.
                  </p>
                  <div style={{ display: "grid", gap: 8 }}>
                    <IntroChip icon="👀" text="Drag the beam to search the dark" />
                    <IntroChip icon="🛡️" text="Tap a gold glow to seal the leak" />
                    <IntroChip icon="✅" text="Seal all 4 leaks to win" />
                  </div>
                </div>
              </div>
              <div
                style={{
                  flex: "0 0 auto",
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  padding: "10px 12px 16px",
                  background:
                    "linear-gradient(180deg, rgba(8,11,24,0) 0%, rgba(8,11,24,0.92) 42%)",
                }}
              >
                <button
                  onClick={() => setPhase("play")}
                  style={{
                    minHeight: 54,
                    padding: "14px 34px",
                    borderRadius: 999,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 18,
                    fontWeight: 900,
                    fontFamily: "inherit",
                    color: "#3a2a05",
                    background: "linear-gradient(180deg, #ffd76a, #f0a92e)",
                    boxShadow: "0 10px 26px -8px rgba(240,169,46,0.7)",
                  }}
                >
                  Turn on the torch
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* win overlay */}
        <AnimatePresence>
          {phase === "win" && (
            <motion.div
              key="win"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 10,
                display: "grid",
                placeItems: "center",
                background:
                  "radial-gradient(ellipse at 50% 45%, rgba(18,69,44,0.82) 0%, rgba(8,20,14,0.9) 100%)",
              }}
            >
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.85 }}
                style={{ textAlign: "center", padding: 24 }}
              >
                <PixIcon emoji="🏆" size={64} />
                <h2
                  style={{
                    margin: "10px 0 8px",
                    fontSize: 32,
                    fontWeight: 900,
                    letterSpacing: 1,
                    color: "#8bffb0",
                    textShadow: "0 0 24px rgba(90,220,140,0.55)",
                  }}
                >
                  Safehouse secured!
                </h2>
                <p style={{ margin: "0 0 14px", fontSize: 16, opacity: 0.92, lineHeight: 1.45, maxWidth: 420 }}>
                  All 4 leaks sealed. Nothing in this room tells strangers who
                  you are or where you live.
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
                  {LEAKS.map((l) => (
                    <PixIcon
                      key={l.id}
                      emoji="🛡️"
                      size={32}
                      style={{ filter: "drop-shadow(0 0 8px rgba(90,220,140,0.8))" }}
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* footer hint */}
      <div
        style={{
          textAlign: "center",
          marginTop: 12,
          fontSize: 14,
          opacity: 0.8,
          minHeight: 20,
          fontWeight: 600,
        }}
      >
        {phase === "play" &&
          (sealed.length === 0
            ? "Drag the torch beam around the room. A gold glow means private info is showing."
            : remaining > 0
              ? `Great sealing! ${remaining} more leak${remaining === 1 ? "" : "s"} to find.`
              : "All sealed!")}
      </div>
    </ExerciseFrame>
  );
}
