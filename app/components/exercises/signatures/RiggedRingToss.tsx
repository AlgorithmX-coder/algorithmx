"use client";

/*
 * THE RIGGED RING TOSS - Week 4 signature exercise (Scams & Tricks).
 *
 * Carnival fantasy: the child flicks rings (drag back + release, simple
 * slingshot arc) at a FAIR booth and wins twice. Then a gaudy new booth
 * opens: "EVERYONE WINS! FREE MEGA COINS!" - but a hidden magnet pings
 * every ring away at the last second, no matter how perfect the throw.
 * After two rigged throws a big "I SMELL A TRICK!" button appears;
 * pressing it x-rays the booth (DOM overlay) to expose the magnet and
 * the Hacker Raccoon crouched under the counter. The child slams a
 * CLOSED stamp on the booth -> green "TRICK SPOTTED!" -> onComplete().
 *
 * There is NO losable state. The rigged booth being unwinnable IS the
 * lesson: too-good-to-be-true was never fair. Walk away and report.
 *
 * Canvas stack (hi-DPI via setupHiDpiCanvas, logical 720x420):
 *   scene (bottom) - the booth, redrawn on booth swap + resize
 *   fx    (top)    - ring flight, aim dots, sparks, confetti, rAF loop
 * DOM overlays handle intro, the booth switch, the x-ray reveal, and
 * the CLOSED stamp.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import PixIcon from "@/app/components/lesson/PixIcon";
import {
  setupHiDpiCanvas,
  getPointerLogicalPos,
} from "@/app/lib/gameEngine/canvas";
import { useGameAudio } from "@/app/lib/gameEngine/useGameAudio";

/* ────────────────────────── constants ────────────────────────── */

const CANVAS_W = 720;
const CANVAS_H = 420;

const G = 1050; // gravity, logical px/s^2
const REST = { x: 360, y: 366 }; // where the next ring waits

interface Peg {
  x: number;
  tipY: number;
}
const PEGS: Peg[] = [
  { x: 265, tipY: 212 },
  { x: 360, tipY: 202 },
  { x: 455, tipY: 212 },
];
const COUNTER_TOP_Y = 256;

// Forgiving capture: any descent passing this close to a peg tip lands.
const CAPTURE_R = 70;
// The rigged magnet reaches even further, so every decent throw "pings".
const DEFLECT_R = 120;

const HONEST_WINS_NEEDED = 2;
const RIGGED_THROWS_FOR_BUTTON = 2;

const WIN_DELAY_MS = 3000;
const FLARE_MS = 950;

const CONFETTI_COLORS = [
  "#ffd166",
  "#7df0ff",
  "#ff6b6b",
  "#8bffb0",
  "#c9a7ff",
  "#fff3d6",
];

const FONT_STACK = "'Fredoka', 'Quicksand', ui-rounded, system-ui, sans-serif";

type Phase = "intro" | "honest" | "switch" | "rigged" | "xray" | "win";
type Booth = "honest" | "rigged";
type RingState = "rest" | "drag" | "fly" | "gone";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rot: number;
  vr: number;
  life: number;
  maxLife: number;
  grav: number;
  shape: "rect" | "dot";
}

interface Flare {
  text: string;
  x: number;
  y: number;
  color: string;
  size: number;
  t0: number;
}

interface Landed {
  peg: number;
  slot: number;
}

interface GameState {
  ringState: RingState;
  rx: number;
  ry: number;
  rvx: number;
  rvy: number;
  spin: number;
  dragStartX: number;
  dragStartY: number;
  pullX: number;
  pullY: number;
  deflected: boolean;
  landed: Landed[];
  particles: Particle[];
  flares: Flare[];
}

function makeGameState(): GameState {
  return {
    ringState: "rest",
    rx: REST.x,
    ry: REST.y,
    rvx: 0,
    rvy: 0,
    spin: 0,
    dragStartX: 0,
    dragStartY: 0,
    pullX: 0,
    pullY: 0,
    deflected: false,
    landed: [],
    particles: [],
    flares: [],
  };
}

/* ─────────────────────── small math helpers ───────────────────── */

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

/** Deterministic 0..1 noise so decorative sprinkles are stable. */
function prand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function starburstPath(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outer: number,
  inner: number
) {
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i * Math.PI) / spikes - Math.PI / 2;
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

/**
 * Turn a slingshot pull (start - current pointer) into launch velocity.
 * Very forgiving for ages 6-9: every real drag reaches peg height, and
 * a strong aim assist bends the throw toward the nearest peg. At the
 * rigged booth the assist is even STRONGER so every throw looks perfect
 * right up until the magnet pings it away.
 */
function computeLaunch(
  pullX: number,
  pullY: number,
  booth: Booth
): { vx: number; vy: number } | null {
  if (Math.hypot(pullX, pullY) < 24) return null; // ignore accidental taps
  let vx = clamp(pullX * 5, -430, 430);
  const vy = clamp(pullY * 5, -880, -640);

  // Time until the ring falls back through peg-tip height.
  const a = G / 2;
  const c = REST.y - PEGS[1].tipY;
  const disc = vy * vy - 4 * a * c;
  if (disc > 0) {
    const t = (-vy + Math.sqrt(disc)) / (2 * a);
    const landX = REST.x + vx * t;
    let best = PEGS[0];
    let bestD = Infinity;
    for (const p of PEGS) {
      const d = Math.abs(landX - p.x);
      if (d < bestD) {
        bestD = d;
        best = p;
      }
    }
    const idealVx = (best.x - REST.x) / t;
    const assist = booth === "honest" ? 0.5 : 0.68;
    vx = vx + (idealVx - vx) * assist;
  }
  return { vx, vy };
}

/** How far the waiting ring visually stretches toward the pointer. */
function stretchOffset(pullX: number, pullY: number): { x: number; y: number } {
  let ox = -pullX * 0.35;
  let oy = -pullY * 0.35;
  const len = Math.hypot(ox, oy);
  if (len > 64) {
    ox = (ox / len) * 64;
    oy = (oy / len) * 64;
  }
  return { x: ox, y: oy };
}

/* ────────────────────── canvas draw helpers ───────────────────── */

function drawRing(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tilt: number,
  flat = false
) {
  const ry = flat ? 8 : 13;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  ctx.lineWidth = 9;
  ctx.strokeStyle = "#ff5d5d";
  ctx.beginPath();
  ctx.ellipse(0, 0, 26, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
  ctx.beginPath();
  ctx.ellipse(0, -2, 20, ry * 0.6, 0, Math.PI * 1.05, Math.PI * 1.95);
  ctx.stroke();
  ctx.restore();
}

function drawPeg(ctx: CanvasRenderingContext2D, x: number, tipY: number) {
  ctx.fillStyle = "#d9a45f";
  ctx.strokeStyle = "#7a4c28";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x - 8, COUNTER_TOP_Y);
  ctx.lineTo(x - 4.5, tipY + 8);
  ctx.lineTo(x + 4.5, tipY + 8);
  ctx.lineTo(x + 8, COUNTER_TOP_Y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Gold target ball on top.
  ctx.beginPath();
  ctx.arc(x, tipY + 2, 8, 0, Math.PI * 2);
  ctx.fillStyle = "#ffd166";
  ctx.fill();
  ctx.strokeStyle = "#c98a1e";
  ctx.stroke();
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.beginPath();
  ctx.arc(x - 2.5, tipY - 0.5, 2.4, 0, Math.PI * 2);
  ctx.fill();
}

function drawPlush(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string
) {
  ctx.strokeStyle = "rgba(40, 20, 40, 0.35)";
  ctx.lineWidth = 2;
  // Ears.
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x - 9, y - 14, 5.5, 0, Math.PI * 2);
  ctx.arc(x + 9, y - 14, 5.5, 0, Math.PI * 2);
  ctx.fill();
  // Body.
  ctx.beginPath();
  ctx.ellipse(x, y + 15, 15, 17, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Head.
  ctx.beginPath();
  ctx.arc(x, y - 4, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Belly.
  ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
  ctx.beginPath();
  ctx.ellipse(x, y + 17, 8, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  // Face.
  ctx.fillStyle = "#2b2320";
  ctx.beginPath();
  ctx.arc(x - 4.5, y - 6, 1.8, 0, Math.PI * 2);
  ctx.arc(x + 4.5, y - 6, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#2b2320";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(x, y - 1, 4.5, Math.PI * 0.2, Math.PI * 0.8);
  ctx.stroke();
}

function drawCoinStack(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  n: number
) {
  for (let i = 0; i < n; i++) {
    const y = baseY - i * 7;
    ctx.fillStyle = "#ffd166";
    ctx.strokeStyle = "#c98a1e";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x, y, 15, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.fillStyle = "#a86f10";
  ctx.font = `800 9px ${FONT_STACK}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("$", x, baseY - (n - 1) * 7);
}

/** The full booth scene. Redrawn on booth swap + resize only. */
function drawScene(ctx: CanvasRenderingContext2D, booth: Booth) {
  const W = CANVAS_W;
  const H = CANVAS_H;
  ctx.clearRect(0, 0, W, H);

  // ── Night carnival sky ──
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#1c1440");
  sky.addColorStop(0.6, "#2c1e5c");
  sky.addColorStop(1, "#3b2a72");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 26; i++) {
    const sx = prand(i * 3 + 40) * W;
    const sy = prand(i * 3 + 41) * H * 0.45;
    ctx.fillStyle = `rgba(255, 245, 220, ${(0.18 + 0.4 * prand(i * 3 + 42)).toFixed(2)})`;
    ctx.beginPath();
    ctx.arc(sx, sy, 1.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Booth back panel ──
  const BX = 150;
  const BW = 420;
  const BY = 100;
  const BH = COUNTER_TOP_Y - BY;
  if (booth === "honest") {
    ctx.fillStyle = "#f3e2c3";
    ctx.fillRect(BX, BY, BW, BH);
    ctx.fillStyle = "#c94f4f";
    for (let x = BX; x < BX + BW; x += 60) {
      ctx.fillRect(x, BY, 30, BH);
    }
  } else {
    ctx.fillStyle = "#2a1548";
    ctx.fillRect(BX, BY, BW, BH);
    // Gaudy gold rays from the top center.
    ctx.save();
    ctx.beginPath();
    ctx.rect(BX, BY, BW, BH);
    ctx.clip();
    const cx = BX + BW / 2;
    for (let i = 0; i < 10; i++) {
      const a0 = (i / 10) * Math.PI;
      const a1 = ((i + 0.5) / 10) * Math.PI;
      ctx.fillStyle = i % 2 === 0 ? "rgba(255, 209, 102, 0.22)" : "rgba(123, 47, 240, 0.3)";
      ctx.beginPath();
      ctx.moveTo(cx, BY);
      ctx.lineTo(cx + Math.cos(a0) * 600, BY + Math.sin(a0) * 600);
      ctx.lineTo(cx + Math.cos(a1) * 600, BY + Math.sin(a1) * 600);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
    // Glitter dots.
    for (let i = 0; i < 18; i++) {
      const gx = BX + 14 + prand(i * 7 + 5) * (BW - 28);
      const gy = BY + 8 + prand(i * 7 + 6) * (BH - 20);
      ctx.fillStyle = "rgba(255, 226, 150, 0.75)";
      starburstPath(ctx, gx, gy, 4, 3.6, 1.2);
      ctx.fill();
    }
  }
  ctx.strokeStyle = "rgba(40, 22, 10, 0.5)";
  ctx.lineWidth = 3;
  ctx.strokeRect(BX, BY, BW, BH);

  // ── Prize shelf ──
  ctx.fillStyle = "#8a5a30";
  ctx.fillRect(BX + 14, 168, BW - 28, 9);
  if (booth === "honest") {
    drawPlush(ctx, 255, 138, "#8bd7ff");
    drawPlush(ctx, 360, 136, "#ffb6d5");
    drawPlush(ctx, 465, 138, "#b7f0a9");
  } else {
    drawCoinStack(ctx, 250, 162, 4);
    drawCoinStack(ctx, 330, 162, 5);
    drawCoinStack(ctx, 410, 162, 4);
    // "FREE!" starburst.
    ctx.fillStyle = "#ffd166";
    starburstPath(ctx, 494, 142, 10, 30, 17);
    ctx.fill();
    ctx.strokeStyle = "#c9184a";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#c9184a";
    ctx.font = `900 13px ${FONT_STACK}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("FREE!", 494, 142);
  }

  // ── Boardwalk floor ──
  const floorY = 316;
  const floor = ctx.createLinearGradient(0, floorY, 0, H);
  floor.addColorStop(0, "#7a5533");
  floor.addColorStop(1, "#513520");
  ctx.fillStyle = floor;
  ctx.fillRect(0, floorY, W, H - floorY);
  ctx.strokeStyle = "rgba(40, 24, 10, 0.4)";
  ctx.lineWidth = 2;
  for (let x = 24; x < W + 20; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, floorY);
    ctx.lineTo(x - 16, H);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(255, 235, 200, 0.18)";
  ctx.beginPath();
  ctx.moveTo(0, floorY + 1);
  ctx.lineTo(W, floorY + 1);
  ctx.stroke();

  // ── Counter front skirt (the raccoon hides behind this) ──
  ctx.fillStyle = booth === "honest" ? "#7a4c28" : "#4a2a78";
  ctx.fillRect(BX, 272, BW, 60);
  ctx.strokeStyle = "rgba(20, 10, 5, 0.4)";
  ctx.lineWidth = 2;
  for (let x = BX + 42; x < BX + BW; x += 42) {
    ctx.beginPath();
    ctx.moveTo(x, 274);
    ctx.lineTo(x, 330);
    ctx.stroke();
  }
  if (booth === "rigged") {
    // Tiny foreshadow: a dark gap with two amber eyes peeking out.
    ctx.fillStyle = "rgba(10, 4, 18, 0.9)";
    ctx.beginPath();
    ctx.ellipse(330, 306, 16, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffb347";
    ctx.beginPath();
    ctx.arc(325, 305, 2.2, 0, Math.PI * 2);
    ctx.arc(335, 305, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Counter top board (pegs sit on this) ──
  ctx.fillStyle = "#a9713f";
  ctx.fillRect(BX - 10, COUNTER_TOP_Y, BW + 20, 18);
  ctx.strokeStyle = "#6b4322";
  ctx.lineWidth = 2.5;
  ctx.strokeRect(BX - 10, COUNTER_TOP_Y, BW + 20, 18);

  // ── Pegs ──
  for (const p of PEGS) drawPeg(ctx, p.x, p.tipY);

  // ── Poles ──
  ctx.fillStyle = "#8a5a30";
  ctx.fillRect(142, 58, 9, 200);
  ctx.fillRect(569, 58, 9, 200);

  // ── Awning ──
  const ax0 = 120;
  const ax1 = 600;
  const ay = 6;
  const ah = 52;
  const stripeW = 48;
  const cA = booth === "honest" ? "#d94f4f" : "#7b2ff0";
  const cB = booth === "honest" ? "#f6ead0" : "#ffd166";
  let si = 0;
  for (let x = ax0; x < ax1; x += stripeW) {
    const w = Math.min(stripeW, ax1 - x);
    ctx.fillStyle = si % 2 === 0 ? cA : cB;
    ctx.fillRect(x, ay, w, ah);
    // Scallop bulge at the bottom of each stripe.
    ctx.beginPath();
    ctx.arc(x + w / 2, ay + ah, w / 2, 0, Math.PI);
    ctx.fill();
    si++;
  }
  ctx.fillStyle = "#5d3a1f";
  ctx.fillRect(ax0 - 6, ay - 4, ax1 - ax0 + 12, 8);
  // String-light bulbs at the scallop joins.
  for (let x = ax0 + stripeW; x < ax1; x += stripeW) {
    const color = CONFETTI_COLORS[(x / stripeW) % CONFETTI_COLORS.length | 0];
    ctx.fillStyle = "rgba(255, 240, 200, 0.25)";
    ctx.beginPath();
    ctx.arc(x, ay + ah + 4, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, ay + ah + 4, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Hanging sign ──
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (booth === "honest") {
    roundRectPath(ctx, 220, 66, 280, 38, 10);
    ctx.fillStyle = "#b07a42";
    ctx.fill();
    ctx.strokeStyle = "#6b4322";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "#fff3d6";
    ctx.font = `800 21px ${FONT_STACK}`;
    ctx.fillText("LUCKY RING TOSS", 360, 86);
  } else {
    roundRectPath(ctx, 192, 62, 336, 46, 12);
    ctx.fillStyle = "#ffd166";
    ctx.fill();
    ctx.strokeStyle = "#e0a12f";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = "#c9184a";
    ctx.font = `900 23px ${FONT_STACK}`;
    ctx.fillText("EVERYONE WINS!", 360, 78);
    ctx.fillStyle = "#7b2ff0";
    ctx.font = `800 14px ${FONT_STACK}`;
    ctx.fillText("FREE MEGA COINS!", 360, 98);
    ctx.fillStyle = "#ffd166";
    for (const bx of [176, 544]) {
      starburstPath(ctx, bx, 85, 8, 16, 8);
      ctx.fill();
      ctx.strokeStyle = "#c9184a";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  // ── Throw spot: dashed chalk circle + spare rings ──
  ctx.strokeStyle = "rgba(255, 250, 230, 0.35)";
  ctx.lineWidth = 2.5;
  ctx.setLineDash([7, 7]);
  ctx.beginPath();
  ctx.ellipse(REST.x, REST.y + 8, 44, 15, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  drawRing(ctx, 282, 384, 0, true);
  drawRing(ctx, 444, 388, 0, true);
}

/* ─────────────────────── particle spawning ────────────────────── */

function spawnSparks(gs: GameState, x: number, y: number) {
  for (let i = 0; i < 16; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 130 + Math.random() * 260;
    const life = 0.45 + Math.random() * 0.3;
    gs.particles.push({
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 70,
      size: 2.6 + Math.random() * 3,
      color: ["#ffd166", "#fff3d6", "#7df0ff"][i % 3],
      rot: 0,
      vr: 0,
      life,
      maxLife: life,
      grav: 420,
      shape: "dot",
    });
  }
}

function spawnBurst(gs: GameState, x: number, y: number, n: number) {
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.9;
    const sp = 130 + Math.random() * 220;
    const life = 0.9 + Math.random() * 0.6;
    gs.particles.push({
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      size: 5 + Math.random() * 6,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 9,
      life,
      maxLife: life,
      grav: 700,
      shape: "rect",
    });
  }
}

function spawnWinConfetti(gs: GameState) {
  for (let i = 0; i < 120; i++) {
    const life = 2 + Math.random() * 1.3;
    gs.particles.push({
      x: CANVAS_W * (0.12 + 0.76 * Math.random()),
      y: -20 - Math.random() * 60,
      vx: (Math.random() - 0.5) * 170,
      vy: 70 + Math.random() * 190,
      size: 6 + Math.random() * 7,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 9,
      life,
      maxLife: life,
      grav: 300,
      shape: "rect",
    });
  }
}

/* ─────────────────────────── component ────────────────────────── */

export default function RiggedRingToss({
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
  const [honestWins, setHonestWins] = useState(0);
  const [riggedThrows, setRiggedThrows] = useState(0);
  const [hasThrown, setHasThrown] = useState(false);
  const [stamped, setStamped] = useState(false);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<HTMLCanvasElement | null>(null);
  const fxRef = useRef<HTMLCanvasElement | null>(null);
  const sceneCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const fxCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  const gsRef = useRef<GameState>(makeGameState());
  const phaseRef = useRef<Phase>("intro");
  const boothRef = useRef<Booth>("honest");
  const completedRef = useRef(false);
  const timersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const t of timers) clearTimeout(t);
    };
  }, []);

  /* ── canvas setup (and re-setup on resize) ── */
  const setupCanvases = useCallback(() => {
    const scene = sceneRef.current;
    const fx = fxRef.current;
    if (!scene || !fx) return;
    const ss = setupHiDpiCanvas(scene, {
      logicalWidth: CANVAS_W,
      logicalHeight: CANVAS_H,
      maxDpr: 2,
    });
    const fs = setupHiDpiCanvas(fx, {
      logicalWidth: CANVAS_W,
      logicalHeight: CANVAS_H,
      maxDpr: 2,
    });
    if (!ss || !fs) return;
    sceneCtxRef.current = ss.ctx;
    fxCtxRef.current = fs.ctx;
    drawScene(ss.ctx, boothRef.current);
  }, []);

  useEffect(() => {
    let lastW = -1;
    const wrap = wrapRef.current;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0;
      if (Math.abs(w - lastW) < 2) return;
      lastW = w;
      setupCanvases();
    });
    if (wrap) ro.observe(wrap);
    return () => ro.disconnect();
  }, [setupCanvases]);

  /* ── booth swap on phase change ── */
  useEffect(() => {
    const booth: Booth =
      phase === "rigged" || phase === "xray" || phase === "win"
        ? "rigged"
        : "honest";
    if (booth !== boothRef.current) {
      boothRef.current = booth;
      const gs = gsRef.current;
      gs.landed = [];
      gs.ringState = "rest";
      gs.rx = REST.x;
      gs.ry = REST.y;
      gs.deflected = false;
      const ctx = sceneCtxRef.current;
      if (ctx) drawScene(ctx, booth);
    }
    if (phase === "xray" || phase === "win") {
      gsRef.current.ringState = "gone";
    }
  }, [phase]);

  /* ── advance to the rigged booth after two fair wins ── */
  useEffect(() => {
    if (phase === "honest" && honestWins >= HONEST_WINS_NEEDED) {
      const t = setTimeout(() => setPhase("switch"), 1400);
      timersRef.current.push(t);
      return () => clearTimeout(t);
    }
  }, [phase, honestWins]);

  /* ── game loop: physics + fx drawing ── */
  useEffect(() => {
    let raf = 0;
    let running = true;
    let last = performance.now();

    const landOnPeg = (i: number, now: number) => {
      const gs = gsRef.current;
      const peg = PEGS[i];
      const slot = gs.landed.filter((l) => l.peg === i).length;
      gs.landed.push({ peg: i, slot });
      gs.ringState = "rest";
      gs.rx = REST.x;
      gs.ry = REST.y;
      audio.correct();
      spawnBurst(gs, peg.x, peg.tipY, 26);
      gs.flares.push({
        text: "YOU WIN!",
        x: peg.x,
        y: peg.tipY - 30,
        color: "#6dff9e",
        size: 28,
        t0: now,
      });
      setHonestWins((w) => w + 1);
    };

    const deflect = (now: number) => {
      const gs = gsRef.current;
      gs.deflected = true;
      const dir = gs.rx >= REST.x ? 1 : -1;
      gs.rvx = dir * (400 + Math.random() * 140);
      gs.rvy = -240;
      audio.wrong();
      spawnSparks(gs, gs.rx, gs.ry);
      gs.flares.push({
        text: "TINK?!",
        x: clamp(gs.rx, 70, CANVAS_W - 70),
        y: gs.ry - 16,
        color: "#ffd166",
        size: 26,
        t0: now,
      });
    };

    const resolveMiss = (now: number) => {
      const gs = gsRef.current;
      const fx = clamp(gs.rx, 70, CANVAS_W - 70);
      gs.ringState = "rest";
      gs.rx = REST.x;
      gs.ry = REST.y;
      if (phaseRef.current === "rigged") {
        gs.flares.push({
          text: "MISS?!",
          x: fx,
          y: 290,
          color: "#ff7b7b",
          size: 28,
          t0: now,
        });
        setRiggedThrows((t) => t + 1);
      } else {
        audio.wrong();
        gs.flares.push({
          text: "Almost!",
          x: fx,
          y: 290,
          color: "#ffd166",
          size: 24,
          t0: now,
        });
      }
    };

    const loop = (now: number) => {
      if (!running) return;
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      const gs = gsRef.current;
      const currentPhase = phaseRef.current;

      /* physics */
      if (gs.ringState === "fly") {
        gs.rvy += G * dt;
        gs.rx += gs.rvx * dt;
        gs.ry += gs.rvy * dt;
        gs.spin += dt * 9;

        if (currentPhase === "honest") {
          if (gs.rvy > -140) {
            let best = -1;
            let bestD = CAPTURE_R;
            for (let i = 0; i < PEGS.length; i++) {
              const d = Math.hypot(gs.rx - PEGS[i].x, gs.ry - PEGS[i].tipY);
              if (d < bestD) {
                bestD = d;
                best = i;
              }
            }
            if (best >= 0) landOnPeg(best, now);
          }
        } else if (currentPhase === "rigged" && !gs.deflected) {
          for (const p of PEGS) {
            if (Math.hypot(gs.rx - p.x, gs.ry - p.tipY) < DEFLECT_R) {
              deflect(now);
              break;
            }
          }
        }

        if (
          gs.ringState === "fly" &&
          (gs.ry > CANVAS_H + 50 || gs.rx < -70 || gs.rx > CANVAS_W + 70)
        ) {
          resolveMiss(now);
        }
      }

      /* drawing */
      const ctx = fxCtxRef.current;
      if (ctx) {
        ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

        // Landed rings resting near the peg bases.
        for (const l of gs.landed) {
          const peg = PEGS[l.peg];
          drawRing(ctx, peg.x, peg.tipY + 40 - l.slot * 9, 0, true);
        }

        // The active ring.
        if (currentPhase === "honest" || currentPhase === "rigged") {
          if (gs.ringState === "rest") {
            drawRing(ctx, REST.x, REST.y, 0);
          } else if (gs.ringState === "drag") {
            const off = stretchOffset(gs.pullX, gs.pullY);
            const v = computeLaunch(
              gs.pullX,
              gs.pullY,
              currentPhase === "rigged" ? "rigged" : "honest"
            );
            if (v) {
              // Dotted trajectory preview.
              let sx = REST.x + off.x;
              let sy = REST.y + off.y;
              const svx = v.vx;
              let svy = v.vy;
              const step = 0.032;
              for (let i = 0; i < 46; i++) {
                svy += G * step;
                sx += svx * step;
                sy += svy * step;
                if (sy > 334 && svy > 0) break;
                if (i % 2 === 0) {
                  ctx.fillStyle = `rgba(255, 255, 255, ${(0.55 * (1 - i / 46)).toFixed(3)})`;
                  ctx.beginPath();
                  ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
                  ctx.fill();
                }
              }
            }
            drawRing(ctx, REST.x + off.x, REST.y + off.y, 0);
          } else if (gs.ringState === "fly") {
            drawRing(ctx, gs.rx, gs.ry, Math.sin(gs.spin) * 0.5);
          }
        }

        // Particles.
        const alive: Particle[] = [];
        for (const p of gs.particles) {
          p.life -= dt;
          if (p.life <= 0 || p.y > CANVAS_H + 30) continue;
          p.vy += p.grav * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.rot += p.vr * dt;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.globalAlpha = Math.min(1, p.life / Math.min(0.6, p.maxLife));
          ctx.fillStyle = p.color;
          if (p.shape === "rect") {
            ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
          alive.push(p);
        }
        gs.particles = alive;

        // Text flares.
        const liveFlares: Flare[] = [];
        for (const f of gs.flares) {
          const age = (now - f.t0) / FLARE_MS;
          if (age > 1) continue;
          const alpha = age < 0.15 ? age / 0.15 : 1 - (age - 0.15) / 0.85;
          ctx.save();
          ctx.globalAlpha = Math.max(0, alpha);
          ctx.font = `900 ${f.size}px ${FONT_STACK}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.lineWidth = 5;
          ctx.strokeStyle = "rgba(20, 10, 30, 0.8)";
          const fy = f.y - 46 * age;
          ctx.strokeText(f.text, f.x, fy);
          ctx.fillStyle = f.color;
          ctx.fillText(f.text, f.x, fy);
          ctx.restore();
          liveFlares.push(f);
        }
        gs.flares = liveFlares;
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
    };
  }, [audio]);

  /* ── slingshot drag mechanics ── */
  const toLogical = useCallback((e: { clientX: number; clientY: number }) => {
    const scene = sceneRef.current;
    if (!scene) return null;
    return getPointerLogicalPos(scene, e, CANVAS_W, CANVAS_H);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = phaseRef.current;
    if (p !== "honest" && p !== "rigged") return;
    const gs = gsRef.current;
    if (gs.ringState !== "rest") return;
    const pos = toLogical(e);
    if (!pos) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    gs.ringState = "drag";
    gs.dragStartX = pos.x;
    gs.dragStartY = pos.y;
    gs.pullX = 0;
    gs.pullY = 0;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const gs = gsRef.current;
    if (gs.ringState !== "drag") return;
    const pos = toLogical(e);
    if (!pos) return;
    gs.pullX = gs.dragStartX - pos.x;
    gs.pullY = gs.dragStartY - pos.y;
  };

  const handlePointerUp = () => {
    const gs = gsRef.current;
    if (gs.ringState !== "drag") return;
    const booth: Booth = phaseRef.current === "rigged" ? "rigged" : "honest";
    const v = computeLaunch(gs.pullX, gs.pullY, booth);
    if (!v) {
      gs.ringState = "rest";
      return;
    }
    const off = stretchOffset(gs.pullX, gs.pullY);
    gs.rx = REST.x + off.x;
    gs.ry = REST.y + off.y;
    gs.rvx = v.vx;
    gs.rvy = v.vy;
    gs.spin = 0;
    gs.deflected = false;
    gs.ringState = "fly";
    audio.tap();
    setHasThrown(true);
  };

  /* ── expose + stamp + win ── */
  const handleSmell = () => {
    if (phaseRef.current !== "rigged") return;
    audio.tap();
    gsRef.current.ringState = "gone";
    setPhase("xray");
  };

  const handleStamp = () => {
    if (stamped) return;
    audio.drop();
    setStamped(true);
    const t1 = setTimeout(() => {
      audio.unlock();
      setPhase("win");
      spawnWinConfetti(gsRef.current);
      const t2 = setTimeout(() => {
        if (!completedRef.current) {
          completedRef.current = true;
          onComplete();
        }
      }, WIN_DELAY_MS);
      timersRef.current.push(t2);
    }, 1100);
    timersRef.current.push(t1);
  };

  /* ── copy per phase ── */
  let hintText = "";
  let hintColor = "#e7ecff";
  if (phase === "honest") {
    hintText = !hasThrown
      ? "Press, drag DOWN, and let go to flick your ring!"
      : honestWins === 0
        ? "Flick the ring onto a golden peg!"
        : honestWins === 1
          ? "Beautiful toss! Land one more ring."
          : "Two wins! You are a natural.";
  } else if (phase === "rigged") {
    if (riggedThrows === 0) {
      hintText = "Same game, shiny new booth. Give it a toss!";
    } else if (riggedThrows === 1) {
      hintText = "Wait... that ring was going straight in!";
      hintColor = "#ffd166";
    } else {
      hintText = "Every ring pings away at the LAST second. Fishy!";
      hintColor = "#ff9d7a";
    }
  } else if (phase === "xray") {
    hintText = stamped
      ? "Booth CLOSED. Hero work!"
      : "X-ray on! Look who is hiding under the counter...";
    hintColor = "#7df0ff";
  } else if (phase === "win") {
    hintText = "You cannot lose a rigged game. You can only walk away!";
    hintColor = "#8bffb0";
  }

  const abs: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    display: "block",
  };

  /* ────────────────────────── render ────────────────────────── */
  return (
    <ExerciseFrame padding={24} touchActionNone>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          maxWidth: 800,
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
              THE RING TOSS ALLEY
            </div>
            <div style={{ fontSize: 13, opacity: 0.75 }}>
              Win fair and square. Sniff out the booths that are not.
            </div>
          </div>

          {(phase === "honest" || phase === "switch") && (
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
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: 1.5,
                  color: "#8bffb0",
                }}
              >
                FAIR WINS
              </span>
              {[0, 1].map((i) => (
                <PixIcon
                  key={i}
                  emoji="⭐"
                  size={24}
                  style={{
                    filter:
                      i < honestWins ? "none" : "grayscale(1) opacity(0.3)",
                  }}
                />
              ))}
            </div>
          )}

          {(phase === "rigged" || phase === "xray" || phase === "win") && (
            <div style={{ display: "flex", gap: 8 }}>
              <div
                style={{
                  background: "rgba(0, 0, 0, 0.25)",
                  padding: "8px 14px",
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: 1,
                  color: "#ffd166",
                }}
              >
                THROWS: {riggedThrows}
              </div>
              <div
                style={{
                  background: "rgba(160, 30, 30, 0.3)",
                  padding: "8px 14px",
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: 1,
                  color: "#ff8a8a",
                }}
              >
                WINS: 0
              </div>
            </div>
          )}
        </div>

        {/* ── Booth stage ── */}
        <div
          ref={wrapRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: `${CANVAS_W} / ${CANVAS_H}`,
            borderRadius: 16,
            overflow: "hidden",
            touchAction: "none",
            cursor:
              phase === "honest" || phase === "rigged" ? "grab" : "default",
            boxShadow:
              "inset 0 0 24px rgba(0, 0, 0, 0.45), 0 0 0 2px rgba(255, 209, 102, 0.18)",
          }}
        >
          <canvas ref={sceneRef} style={abs} />
          <canvas ref={fxRef} style={{ ...abs, pointerEvents: "none" }} />

          {/* Pulsing drag hint until the first throw */}
          <AnimatePresence>
            {phase === "honest" && !hasThrown && (
              <motion.div
                key="drag-hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: [0, 44, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "72%",
                  marginLeft: -30,
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  background: "rgba(255, 214, 110, 0.25)",
                  border: "3px dashed rgba(255, 214, 110, 0.8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                }}
              >
                <PixIcon emoji="👆" size={34} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* CLOSED stamp slam */}
          <AnimatePresence>
            {stamped && (
              <motion.div
                key="closed-stamp"
                initial={{ scale: 2.8, opacity: 0, rotate: -26 }}
                animate={{ scale: 1, opacity: 1, rotate: -10 }}
                transition={{ type: "spring", stiffness: 500, damping: 22 }}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "38%",
                  x: "-50%",
                  y: "-50%",
                  border: "6px solid #ff4d4d",
                  color: "#ff4d4d",
                  fontSize: "clamp(34px, 8vw, 58px)",
                  fontWeight: 900,
                  letterSpacing: 8,
                  padding: "4px 26px",
                  borderRadius: 14,
                  background: "rgba(24, 4, 8, 0.4)",
                  textShadow: "0 0 22px rgba(255, 60, 60, 0.5)",
                  boxShadow: "0 0 30px rgba(255, 60, 60, 0.35)",
                  pointerEvents: "none",
                  zIndex: 6,
                }}
              >
                CLOSED
              </motion.div>
            )}
          </AnimatePresence>

          {/* Win banner over the stage */}
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
                  top: "7%",
                  x: "-50%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background:
                    "linear-gradient(180deg, #2ecc71 0%, #1f8a4c 100%)",
                  color: "#ffffff",
                  fontSize: 24,
                  fontWeight: 900,
                  letterSpacing: 2,
                  padding: "10px 26px",
                  borderRadius: 999,
                  border: "3px solid rgba(255, 255, 255, 0.75)",
                  boxShadow: "0 10px 26px rgba(20, 90, 50, 0.55)",
                  whiteSpace: "nowrap",
                  zIndex: 7,
                }}
              >
                <PixIcon emoji="✅" size={28} />
                TRICK SPOTTED!
              </motion.div>
            )}
          </AnimatePresence>

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
                  overflowY: "auto",
                  textAlign: "center",
                  padding: 24,
                  zIndex: 8,
                  background:
                    "radial-gradient(circle at 50% 30%, rgba(60, 30, 100, 0.9) 0%, rgba(18, 10, 40, 0.95) 75%)",
                }}
              >
                {/* margin auto = centered when it fits, scrollable when tall
                    (never clips the start button on short viewports). */}
                <div
                  style={{
                    margin: "auto 0",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <PixIcon emoji="🎯" size={52} />
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#ffd166" }}>
                    Step right up!
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      lineHeight: 1.5,
                      maxWidth: 430,
                      opacity: 0.92,
                    }}
                  >
                    Flick rings onto the pegs and win prizes! Keep your hero
                    nose ready. Some booths play fair... and some do NOT.
                  </div>
                  {narration && narration.lines.length > 0 && (
                    <InfoNarration lines={narration.lines} accent={accent ?? "#e84dff"} />
                  )}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPhase("honest")}
                    style={{
                      marginTop: 6,
                      padding: "14px 30px",
                      fontSize: 19,
                      fontWeight: 800,
                      fontFamily: "inherit",
                      color: "#3a2200",
                      background:
                        "linear-gradient(180deg, #ffd166 0%, #ffb347 100%)",
                      border: "none",
                      borderRadius: 999,
                      cursor: "pointer",
                      boxShadow: "0 6px 18px rgba(255, 180, 70, 0.4)",
                    }}
                  >
                    Let me play!
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Booth-switch overlay ── */}
          <AnimatePresence>
            {phase === "switch" && (
              <motion.div
                key="switch"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  // "safe center" + internal scroll: the CTA can never clip
                  // off a short viewport (matches the intro overlay pattern).
                  justifyContent: "safe center",
                  overflowY: "auto",
                  gap: 12,
                  textAlign: "center",
                  padding: 24,
                  zIndex: 8,
                  background:
                    "radial-gradient(circle at 50% 35%, rgba(110, 40, 200, 0.92) 0%, rgba(30, 8, 60, 0.96) 80%)",
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    letterSpacing: 2,
                    color: "#c9a7ff",
                  }}
                >
                  A NEW BOOTH JUST OPENED!
                </div>
                <motion.div
                  animate={{ rotate: [-2, 2, -2], scale: [1, 1.04, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    background:
                      "linear-gradient(180deg, #ffd166 0%, #f4b13e 100%)",
                    borderRadius: 18,
                    padding: "16px 30px",
                    boxShadow: "0 10px 30px rgba(255, 190, 70, 0.4)",
                    border: "3px solid #fff3d6",
                  }}
                >
                  <div
                    style={{
                      fontSize: "clamp(24px, 5vw, 34px)",
                      fontWeight: 900,
                      letterSpacing: 1,
                      color: "#c9184a",
                    }}
                  >
                    EVERYONE WINS!
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 800,
                      color: "#7b2ff0",
                      marginTop: 2,
                    }}
                  >
                    FREE MEGA COINS! NO LOSING! 100% REAL!
                  </div>
                </motion.div>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPhase("rigged")}
                  style={{
                    marginTop: 4,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "14px 28px",
                    fontSize: 18,
                    fontWeight: 800,
                    fontFamily: "inherit",
                    color: "#2a1548",
                    background:
                      "linear-gradient(180deg, #ffe9a8 0%, #ffd166 100%)",
                    border: "none",
                    borderRadius: 999,
                    cursor: "pointer",
                    boxShadow: "0 6px 18px rgba(255, 200, 90, 0.4)",
                  }}
                >
                  <PixIcon emoji="🎁" size={24} />
                  Ooo! Try the new booth
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── X-ray overlay ── */}
          <AnimatePresence>
            {(phase === "xray" || phase === "win") && (
              <motion.div
                key="xray"
                initial={{ opacity: 0 }}
                animate={{ opacity: phase === "win" ? 0.55 : 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 4,
                  background: "rgba(6, 14, 38, 0.88)",
                  overflow: "hidden",
                  pointerEvents: "none",
                }}
              >
                {/* Scan sweep */}
                <motion.div
                  initial={{ top: "-4%" }}
                  animate={{ top: "104%" }}
                  transition={{ duration: 1.1, ease: "easeInOut" }}
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    height: 4,
                    background: "rgba(125, 240, 255, 0.9)",
                    boxShadow: "0 0 24px 6px rgba(125, 240, 255, 0.5)",
                  }}
                />

                {/* X-RAY tag */}
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    left: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: "#7df0ff",
                    fontSize: 13,
                    fontWeight: 800,
                    letterSpacing: 3,
                  }}
                >
                  <motion.div
                    animate={{ opacity: [1, 0.25, 1] }}
                    transition={{ duration: 1.1, repeat: Infinity }}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: "#7df0ff",
                      boxShadow: "0 0 12px 3px rgba(125, 240, 255, 0.6)",
                    }}
                  />
                  X-RAY VISION
                </div>

                {/* Dashed booth cutaway */}
                <div
                  style={{
                    position: "absolute",
                    left: "19%",
                    top: "57%",
                    width: "62%",
                    height: "26%",
                    border: "3px dashed rgba(125, 240, 255, 0.75)",
                    borderRadius: 12,
                  }}
                />

                {/* Force-field arcs above the magnet */}
                <motion.svg
                  viewBox="0 0 120 60"
                  animate={{ opacity: [0.25, 0.85, 0.25] }}
                  transition={{ duration: 1.3, repeat: Infinity }}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "44%",
                    width: "22%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  {[46, 34, 22].map((r) => (
                    <path
                      key={r}
                      d={`M ${60 - r} 58 A ${r} ${r} 0 0 1 ${60 + r} 58`}
                      fill="none"
                      stroke="#ff5d5d"
                      strokeWidth={3}
                      strokeDasharray="6 6"
                      strokeLinecap="round"
                    />
                  ))}
                </motion.svg>

                {/* The hidden magnet */}
                <motion.svg
                  viewBox="0 0 100 100"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [1, 1.1, 1], opacity: 1 }}
                  transition={{
                    scale: { duration: 1.4, repeat: Infinity, delay: 0.7 },
                    opacity: { duration: 0.4, delay: 0.55 },
                  }}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "58%",
                    width: "13%",
                    transform: "translate(-50%, -50%)",
                    filter: "drop-shadow(0 0 14px rgba(255, 80, 80, 0.7))",
                  }}
                >
                  <path
                    d="M20 8 h22 v34 a8 8 0 0 0 16 0 V8 h22 v36 a38 38 0 0 1 -60 0 Z"
                    fill="#e63946"
                    stroke="#8f1d28"
                    strokeWidth={3}
                  />
                  <rect x={20} y={8} width={22} height={13} fill="#f1f1f1" />
                  <rect x={58} y={8} width={22} height={13} fill="#f1f1f1" />
                </motion.svg>

                {/* Magnet label */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  style={{
                    position: "absolute",
                    left: "66%",
                    top: "52%",
                    background: "#c92a2a",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 800,
                    padding: "5px 12px",
                    borderRadius: 999,
                    whiteSpace: "nowrap",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
                  }}
                >
                  HIDDEN MAGNET!
                </motion.div>

                {/* The crouching Hacker Raccoon */}
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0, rotate: -6 }}
                  transition={{ delay: 1.05, type: "spring" }}
                  style={{
                    position: "absolute",
                    left: "34%",
                    top: "63%",
                  }}
                >
                  <PixIcon emoji="🦝" size={72} />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.25 }}
                  style={{
                    position: "absolute",
                    left: "22%",
                    top: "86%",
                    background: "#7b2ff0",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 800,
                    padding: "5px 12px",
                    borderRadius: 999,
                    whiteSpace: "nowrap",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
                  }}
                >
                  The Hacker Raccoon!
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
        <div style={{ minHeight: 96, position: "relative" }}>
          <AnimatePresence mode="wait">
            {phase === "rigged" && riggedThrows >= RIGGED_THROWS_FOR_BUTTON && (
              <motion.div
                key="smell"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ display: "flex", justifyContent: "center" }}
              >
                <motion.button
                  type="button"
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ duration: 1.1, repeat: Infinity }}
                  whileTap={{ scale: 0.94 }}
                  onClick={handleSmell}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    minHeight: 66,
                    padding: "0 34px",
                    fontSize: 21,
                    fontWeight: 900,
                    fontFamily: "inherit",
                    letterSpacing: 1,
                    color: "#fff",
                    background:
                      "linear-gradient(180deg, #ff9d4d 0%, #e8632c 100%)",
                    border: "3px solid rgba(255, 240, 210, 0.6)",
                    borderRadius: 999,
                    cursor: "pointer",
                    boxShadow: "0 8px 24px rgba(240, 120, 40, 0.5)",
                  }}
                >
                  <PixIcon emoji="🕵️" size={30} />
                  I SMELL A TRICK!
                </motion.button>
              </motion.div>
            )}

            {phase === "xray" && !stamped && (
              <motion.div
                key="busted"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 26 }}
                style={{
                  background: "rgba(160, 30, 30, 0.28)",
                  border: "2px solid rgba(255, 82, 82, 0.6)",
                  borderRadius: 18,
                  padding: "14px 20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 900, color: "#ff9d9d" }}>
                  BUSTED! The booth was rigged all along!
                </div>
                <div style={{ fontSize: 14.5, opacity: 0.95, maxWidth: 560 }}>
                  A hidden magnet pinged every ring away. Nobody could EVER
                  win. The sign said EVERYONE WINS just to pull you in.
                </div>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleStamp}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    minHeight: 60,
                    padding: "0 30px",
                    fontSize: 19,
                    fontWeight: 900,
                    fontFamily: "inherit",
                    letterSpacing: 1,
                    color: "#fff",
                    background:
                      "linear-gradient(180deg, #ff5d5d 0%, #c9184a 100%)",
                    border: "none",
                    borderRadius: 16,
                    cursor: "pointer",
                    boxShadow: "0 6px 18px rgba(220, 50, 70, 0.5)",
                  }}
                >
                  <PixIcon emoji="🚫" size={26} />
                  SLAM THE CLOSED STAMP!
                </motion.button>
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
                  <PixIcon emoji="⭐" size={24} />
                  Trick exposed. Booth closed. Hero move!
                  <PixIcon emoji="⭐" size={24} />
                </div>
                {[
                  "A game you can never win is not a game. It is a trick.",
                  "Words like FREE and EVERYONE WINS are bait. Too good to be true is a warning sign.",
                  "Walk away and tell a grown-up. That is what heroes do!",
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
