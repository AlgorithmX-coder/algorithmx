"use client";

/*
 * THE TRAIL PLANNER - Week 12 signature exercise (Digital Footprint).
 *
 * Snowfield fantasy: fresh snow between HOME and the FUN FORT. The child
 * DRAWS their route with a finger (canvas pointer trace) and the snow
 * remembers every bit - the trail stays printed. Loud "post zones" dot
 * the field (a billboard, a megaphone stand, a school signpost); a route
 * passing through one stamps huge glowing footprints there. Then the
 * Track Hound replays the exact trail (a cursor retraces it) and calls
 * out everything it learned. Round 2: draw again, smarter, staying on
 * quiet ground. Round 1 is unloseable - the replay IS the feedback.
 * WIN = the round-2 trail avoids every post zone: the path glows gold,
 * the Hound wanders off confused, and onComplete() fires once.
 *
 * Teaches: your footprint is permanent + you can plan the tracks you
 * leave.
 *
 * Canvas stack (all hi-DPI via setupHiDpiCanvas, logical 720x460):
 *   scene (bottom)  - snowfield, HOME, FUN FORT, post zones; drawn once
 *   trail (middle)  - persistent groove + footprints + big zone stamps
 *   fx    (top)     - zone glows, Track Hound, gold path, snow, confetti
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import PixIcon from "@/app/components/lesson/PixIcon";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import {
  setupHiDpiCanvas,
  getPointerLogicalPos,
} from "@/app/lib/gameEngine/canvas";

/* ────────────────────────── constants ────────────────────────── */

const CANVAS_W = 720;
const CANVAS_H = 460;

const TRAIL_STEP = 8; // interpolation step along the drawn path
const FOOT_STEP = 26; // distance between stamped footprints
const RESUME_REACH = 150; // how far from the trail end a re-grab may land
const HOME_SLACK = 12; // extra start-circle forgiveness
const FORT_SLACK = 8; // extra finish-circle forgiveness
const ZONE_SLACK_R2 = -10; // round 2 forgives grazing a zone edge

const REPLAY_MIN_SPEED = 230; // px/s
const REPLAY_MAX_SECONDS = 6;
const SNIFF_PAUSE_MS = 1050;
const BUST_RESET_MS = 1200;
const CONFUSED_MS = 2300;
const WIN_DELAY_MS = 2800;

const FONT_STACK = "'Fredoka', 'Quicksand', ui-rounded, system-ui, sans-serif";

const CONFETTI_COLORS = [
  "#ffd166",
  "#7df0ff",
  "#ff6b6b",
  "#8bffb0",
  "#c9a7ff",
  "#fff3d6",
];

const HOME = { x: 72, y: 232, r: 62 };
const FORT = { x: 648, y: 232, r: 64 };

type Phase =
  | "intro"
  | "draw1"
  | "replay1"
  | "verdict1"
  | "draw2"
  | "replay2"
  | "confused"
  | "win";

interface Pt {
  x: number;
  y: number;
}

interface PostZone {
  id: string;
  x: number;
  y: number;
  r: number;
  label: string;
  /** Hound speech bubble during the round-1 replay. */
  chip: string;
  /** Bullet line in the verdict panel. */
  bullet: string;
  /** Caught line when the round-2 trail touches the zone. */
  bust: string;
  /** PixIcon emoji for the bullet. */
  icon: string;
}

const POST_ZONES: PostZone[] = [
  {
    id: "billboard",
    x: 214,
    y: 118,
    r: 60,
    label: "BIG BILLBOARD",
    chip: "You crossed the billboard... it showed your FACE!",
    bullet: "The big billboard flashed your picture, so the Hound knows your face",
    bust: "The billboard flashed your picture!",
    icon: "👀",
  },
  {
    id: "megaphone",
    x: 368,
    y: 242,
    r: 64,
    label: "MEGAPHONE",
    chip: "You passed the megaphone... it shouted your NAME!",
    bullet: "The megaphone shouted your name for everyone to hear",
    bust: "The megaphone shouted your name!",
    icon: "💬",
  },
  {
    id: "signpost",
    x: 538,
    y: 344,
    r: 58,
    label: "SCHOOL SIGN",
    chip: "You passed the school sign... now I know your school!",
    bullet: "The school sign told the Hound where you go to school",
    bust: "The school sign told on you!",
    icon: "🏫",
  },
];

interface FootStamp {
  x: number;
  y: number;
  angle: number;
  side: 1 | -1;
  big: boolean;
}

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
}

interface ReplayState {
  active: boolean;
  dist: number;
  total: number;
  cum: number[];
  events: { d: number; id: string }[];
  next: number;
  pauseUntil: number;
  speed: number;
  segIdx: number;
  done: boolean;
}

interface HoundState {
  x: number;
  y: number;
  face: 1 | -1;
}

interface FxBag {
  flashStart: number | null;
  flakes: Particle[];
  confetti: Particle[];
  goldStart: number | null;
  wanderStart: number | null;
  wanderFrom: Pt | null;
}

/* ─────────────────────── geometry helpers ─────────────────────── */

function inZone(p: Pt, z: PostZone, slack: number): boolean {
  const dx = p.x - z.x;
  const dy = p.y - z.y;
  const r = z.r + slack;
  return dx * dx + dy * dy <= r * r;
}

function dist2d(a: Pt, b: Pt): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Deterministic 0..1 noise so scene sparkles are stable across redraws. */
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

/* ─────────────────────── scene draw helpers ───────────────────── */

function drawHome(ctx: CanvasRenderingContext2D) {
  const { x, y, r } = HOME;
  // Soft green "safe start" glow + ring.
  const glow = ctx.createRadialGradient(x, y, 8, x, y, r);
  glow.addColorStop(0, "rgba(46, 204, 113, 0.28)");
  glow.addColorStop(1, "rgba(46, 204, 113, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(35, 170, 95, 0.85)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();

  // Little house: body, roof with snow cap, door, glowing window.
  roundRectPath(ctx, x - 28, y - 14, 56, 44, 6);
  ctx.fillStyle = "#f6e7d4";
  ctx.fill();
  ctx.strokeStyle = "#b98d5e";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 36, y - 10);
  ctx.lineTo(x, y - 44);
  ctx.lineTo(x + 36, y - 10);
  ctx.closePath();
  ctx.fillStyle = "#e05a4e";
  ctx.fill();
  ctx.strokeStyle = "#b4463c";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.92)";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x - 26, y - 20);
  ctx.lineTo(x, y - 42);
  ctx.lineTo(x + 26, y - 20);
  ctx.stroke();
  ctx.lineCap = "butt";
  roundRectPath(ctx, x - 8, y + 6, 16, 24, 4);
  ctx.fillStyle = "#8a5a34";
  ctx.fill();
  roundRectPath(ctx, x + 12, y - 4, 12, 12, 3);
  ctx.fillStyle = "#ffd166";
  ctx.fill();

  ctx.fillStyle = "#1e4e7e";
  ctx.font = `800 15px ${FONT_STACK}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("HOME", x, y + r + 16);
}

function drawFort(ctx: CanvasRenderingContext2D) {
  const { x, y, r } = FORT;
  const glow = ctx.createRadialGradient(x, y, 8, x, y, r);
  glow.addColorStop(0, "rgba(80, 180, 255, 0.26)");
  glow.addColorStop(1, "rgba(80, 180, 255, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(60, 160, 255, 0.85)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();

  // Snow-block wall with crenellations.
  roundRectPath(ctx, x - 42, y, 84, 40, 6);
  ctx.fillStyle = "#fbfdff";
  ctx.fill();
  ctx.strokeStyle = "#9ec3e8";
  ctx.lineWidth = 3;
  ctx.stroke();
  for (let i = 0; i < 3; i++) {
    const bx = x - 38 + i * 30;
    roundRectPath(ctx, bx, y - 12, 18, 14, 3);
    ctx.fillStyle = "#fbfdff";
    ctx.fill();
    ctx.strokeStyle = "#9ec3e8";
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(158, 195, 232, 0.7)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 40, y + 20);
  ctx.lineTo(x + 40, y + 20);
  ctx.moveTo(x - 14, y);
  ctx.lineTo(x - 14, y + 20);
  ctx.moveTo(x + 14, y + 20);
  ctx.lineTo(x + 14, y + 40);
  ctx.stroke();

  // Flag.
  ctx.strokeStyle = "#8a6a4a";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x, y - 12);
  ctx.lineTo(x, y - 54);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + 2, y - 52);
  ctx.lineTo(x + 38, y - 42);
  ctx.lineTo(x + 2, y - 32);
  ctx.closePath();
  ctx.fillStyle = "#ff8c2e";
  ctx.fill();

  ctx.fillStyle = "#1e4e7e";
  ctx.font = `800 15px ${FONT_STACK}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("FUN FORT", x, y + r + 16);
}

function drawZone(ctx: CanvasRenderingContext2D, z: PostZone) {
  // Loud orange zone disc + dashed ring.
  ctx.fillStyle = "rgba(255, 150, 60, 0.14)";
  ctx.beginPath();
  ctx.arc(z.x, z.y, z.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.setLineDash([10, 8]);
  ctx.strokeStyle = "rgba(255, 140, 50, 0.75)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(z.x, z.y, z.r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  if (z.id === "billboard") {
    // Posts + board showing a big "YOU!" picture.
    ctx.strokeStyle = "#8a6a4a";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(z.x - 24, z.y + 18);
    ctx.lineTo(z.x - 24, z.y + 42);
    ctx.moveTo(z.x + 24, z.y + 18);
    ctx.lineTo(z.x + 24, z.y + 42);
    ctx.stroke();
    ctx.lineCap = "butt";
    roundRectPath(ctx, z.x - 42, z.y - 34, 84, 52, 8);
    ctx.fillStyle = "#ffe9b8";
    ctx.fill();
    ctx.strokeStyle = "#c98a2e";
    ctx.lineWidth = 3;
    ctx.stroke();
    // Simple face on the board.
    ctx.fillStyle = "#eab98d";
    ctx.beginPath();
    ctx.arc(z.x - 18, z.y - 10, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#2b2320";
    ctx.beginPath();
    ctx.arc(z.x - 21, z.y - 12, 1.6, 0, Math.PI * 2);
    ctx.arc(z.x - 15, z.y - 12, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#a3502e";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(z.x - 18, z.y - 8, 4, Math.PI * 0.15, Math.PI * 0.85);
    ctx.stroke();
    ctx.fillStyle = "#a04e12";
    ctx.font = `800 14px ${FONT_STACK}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("YOU!", z.x + 16, z.y - 10);
    // Flash rays.
    ctx.strokeStyle = "rgba(255, 170, 60, 0.9)";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(z.x - 48, z.y - 40);
    ctx.lineTo(z.x - 40, z.y - 33);
    ctx.moveTo(z.x + 48, z.y - 40);
    ctx.lineTo(z.x + 40, z.y - 33);
    ctx.moveTo(z.x, z.y - 44);
    ctx.lineTo(z.x, z.y - 37);
    ctx.stroke();
    ctx.lineCap = "butt";
  } else if (z.id === "megaphone") {
    // Stand + cone + sound arcs.
    ctx.strokeStyle = "#8a6a4a";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(z.x, z.y + 10);
    ctx.lineTo(z.x, z.y + 44);
    ctx.stroke();
    ctx.lineCap = "butt";
    ctx.fillStyle = "rgba(90, 70, 40, 0.4)";
    ctx.beginPath();
    ctx.ellipse(z.x, z.y + 46, 20, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(z.x - 18, z.y + 2);
    ctx.lineTo(z.x + 16, z.y - 16);
    ctx.lineTo(z.x + 16, z.y + 14);
    ctx.closePath();
    ctx.fillStyle = "#5a6fb8";
    ctx.fill();
    ctx.strokeStyle = "#3d4c85";
    ctx.lineWidth = 3;
    ctx.stroke();
    roundRectPath(ctx, z.x - 26, z.y - 4, 10, 12, 3);
    ctx.fillStyle = "#3d4c85";
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 140, 50, 0.9)";
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(z.x + 20, z.y - 2, 12 + i * 8, -0.6, 0.6);
      ctx.stroke();
    }
  } else {
    // School signpost: pole + arrow sign.
    ctx.strokeStyle = "#8a6a4a";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(z.x, z.y - 26);
    ctx.lineTo(z.x, z.y + 40);
    ctx.stroke();
    ctx.lineCap = "butt";
    ctx.beginPath();
    ctx.moveTo(z.x - 42, z.y - 30);
    ctx.lineTo(z.x + 28, z.y - 30);
    ctx.lineTo(z.x + 44, z.y - 15);
    ctx.lineTo(z.x + 28, z.y);
    ctx.lineTo(z.x - 42, z.y);
    ctx.closePath();
    ctx.fillStyle = "#bfe3ff";
    ctx.fill();
    ctx.strokeStyle = "#4c86c2";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "#1e4e7e";
    ctx.font = `800 15px ${FONT_STACK}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SCHOOL", z.x - 4, z.y - 15);
  }

  ctx.fillStyle = "rgba(150, 84, 20, 0.9)";
  ctx.font = `800 11px ${FONT_STACK}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(z.label, z.x, z.y + z.r - 10);
}

function drawScene(ctx: CanvasRenderingContext2D) {
  const W = CANVAS_W;
  const H = CANVAS_H;
  ctx.clearRect(0, 0, W, H);

  // Fresh snow.
  const snow = ctx.createLinearGradient(0, 0, 0, H);
  snow.addColorStop(0, "#f4f9ff");
  snow.addColorStop(1, "#d9e7fa");
  ctx.fillStyle = snow;
  ctx.fillRect(0, 0, W, H);

  // Soft drifts.
  for (let i = 0; i < 9; i++) {
    const dx = prand(i * 9 + 2) * W;
    const dy = prand(i * 9 + 3) * H;
    const dr = 50 + prand(i * 9 + 4) * 90;
    ctx.fillStyle =
      i % 2 === 0 ? "rgba(255, 255, 255, 0.5)" : "rgba(178, 204, 238, 0.22)";
    ctx.beginPath();
    ctx.ellipse(dx, dy, dr, dr * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Sparkles.
  for (let i = 0; i < 42; i++) {
    const sx = prand(i * 5 + 21) * W;
    const sy = prand(i * 5 + 22) * H;
    ctx.fillStyle = `rgba(255, 255, 255, ${0.35 + prand(i * 5 + 23) * 0.5})`;
    ctx.beginPath();
    ctx.arc(sx, sy, 1 + prand(i * 5 + 24) * 1.6, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const z of POST_ZONES) drawZone(ctx, z);
  drawHome(ctx);
  drawFort(ctx);
}

/* ─────────────────────── trail draw helpers ───────────────────── */

function drawGrooveSeg(ctx: CanvasRenderingContext2D, a: Pt, b: Pt) {
  ctx.strokeStyle = "rgba(158, 186, 230, 0.5)";
  ctx.lineWidth = 13;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
}

function drawGroovePolyline(ctx: CanvasRenderingContext2D, pts: Pt[]) {
  if (pts.length < 2) return;
  ctx.strokeStyle = "rgba(158, 186, 230, 0.5)";
  ctx.lineWidth = 13;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.stroke();
}

function drawFootStamp(ctx: CanvasRenderingContext2D, s: FootStamp) {
  ctx.save();
  ctx.translate(s.x, s.y);
  ctx.rotate(s.angle);
  if (s.big) {
    // Huge glowing boot print stamped inside a post zone.
    ctx.shadowColor = "rgba(255, 150, 40, 0.9)";
    ctx.shadowBlur = 18;
    ctx.fillStyle = "#ff8c2e";
    roundRectPath(ctx, -16, s.side * 9 - 9, 24, 18, 8);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(14, s.side * 9, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(255, 240, 214, 0.85)";
    ctx.lineWidth = 2;
    roundRectPath(ctx, -16, s.side * 9 - 9, 24, 18, 8);
    ctx.stroke();
  } else {
    // Small alternating boot prints along the trail.
    ctx.fillStyle = "rgba(84, 116, 186, 0.6)";
    ctx.beginPath();
    ctx.ellipse(0, s.side * 6, 7, 4.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(8, s.side * 6, 3.4, 2.6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/* ────────────────────────── fx helpers ────────────────────────── */

function drawHound(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  face: 1 | -1,
  t: number,
  sniffing: boolean,
  alpha: number
) {
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

  // Ground shadow.
  ctx.fillStyle = "rgba(40, 60, 100, 0.22)";
  ctx.beginPath();
  ctx.ellipse(x, y + 3, 26, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.translate(x, y);
  ctx.scale(face, 1);

  const wag = Math.sin(t * 10) * 0.5;
  const bob = sniffing ? 0 : Math.sin(t * 9) * 1.6;

  // Tail.
  ctx.strokeStyle = "#8a5a2e";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-20, -18);
  ctx.quadraticCurveTo(-30, -28 + wag * 8, -34, -22 + wag * 10);
  ctx.stroke();

  // Legs (simple walk cycle).
  const swing = sniffing ? 0 : Math.sin(t * 10) * 4;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(-13, -10 + bob);
  ctx.lineTo(-13 - swing, 1);
  ctx.moveTo(-6, -10 + bob);
  ctx.lineTo(-6 + swing, 1);
  ctx.moveTo(4, -10 + bob);
  ctx.lineTo(4 - swing, 1);
  ctx.moveTo(11, -10 + bob);
  ctx.lineTo(11 + swing, 1);
  ctx.stroke();

  // Body.
  ctx.fillStyle = "#b07f45";
  ctx.strokeStyle = "#8a5a2e";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(-3, -16 + bob, 18, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Head: lowered to the snow when sniffing, up when walking.
  const hx = sniffing ? 17 : 14;
  const hy = sniffing ? -13 + bob : -26 + bob;
  ctx.fillStyle = "#b07f45";
  ctx.beginPath();
  ctx.arc(hx, hy, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Floppy ear.
  ctx.fillStyle = "#7a4f22";
  ctx.beginPath();
  ctx.ellipse(hx - 5, hy - 4, 4.6, 8, -0.5, 0, Math.PI * 2);
  ctx.fill();
  // Snout + nose.
  ctx.fillStyle = "#c99a63";
  ctx.beginPath();
  ctx.ellipse(hx + 9, hy + (sniffing ? 5 : 3), 7, 5, sniffing ? 0.5 : 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#3a2a1a";
  ctx.beginPath();
  ctx.arc(hx + 14, hy + (sniffing ? 9 : 4), 2.6, 0, Math.PI * 2);
  ctx.fill();
  // Eye.
  ctx.beginPath();
  ctx.arc(hx + 2, hy - 3, 1.8, 0, Math.PI * 2);
  ctx.fill();
  // Red collar.
  ctx.strokeStyle = "#e34d4d";
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.arc(hx - 6, hy + 8, 7, -0.4, 1.6);
  ctx.stroke();

  // Sniff rings puffing off the nose.
  if (sniffing) {
    const phase = (t * 2) % 1;
    ctx.strokeStyle = `rgba(120, 150, 210, ${(0.7 * (1 - phase)).toFixed(3)})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(hx + 16, hy + 11, 4 + phase * 10, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

function drawGoldTrail(ctx: CanvasRenderingContext2D, pts: Pt[], now: number) {
  if (pts.length < 2) return;
  const pulse = 0.5 + 0.5 * Math.sin(now / 300);
  ctx.save();
  ctx.shadowColor = "rgba(255, 200, 70, 0.9)";
  ctx.shadowBlur = 14 + 8 * pulse;
  ctx.strokeStyle = "rgba(255, 196, 64, 0.9)";
  ctx.lineWidth = 7;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(255, 244, 214, 0.85)";
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.restore();
}

/* ─────────────────────────── component ────────────────────────── */

export default function TrailPlanner({
  onComplete,
  narration,
  accent,
}: {
  onComplete: () => void;
  narration?: { speaker?: "adam" | "layla"; lines: string[] };
  accent?: string;
}) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [round, setRound] = useState<1 | 2>(1);
  const [revealed, setRevealed] = useState<string[]>([]);
  const [tip, setTip] = useState<string | null>(null);
  const [bustMsg, setBustMsg] = useState<string | null>(null);
  const [hasInk, setHasInk] = useState(false);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<HTMLCanvasElement | null>(null);
  const trailRef = useRef<HTMLCanvasElement | null>(null);
  const fxRef = useRef<HTMLCanvasElement | null>(null);
  const trailCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const fxCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  const phaseRef = useRef<Phase>("intro");
  const roundRef = useRef<1 | 2>(1);
  const pointsRef = useRef<Pt[]>([]);
  const stampsRef = useRef<FootStamp[]>([]);
  const footDistRef = useRef(0);
  const footSideRef = useRef<1 | -1>(1);
  const hitZonesRef = useRef<Set<string>>(new Set());
  const zoneGlowRef = useRef<Map<string, { start: number; called: boolean }>>(
    new Map()
  );
  const drawingRef = useRef(false);
  const trailDoneRef = useRef(false);
  const bustingRef = useRef(false);
  const firedRef = useRef(false);

  const replayRef = useRef<ReplayState>({
    active: false,
    dist: 0,
    total: 0,
    cum: [],
    events: [],
    next: 0,
    pauseUntil: 0,
    speed: REPLAY_MIN_SPEED,
    segIdx: 0,
    done: false,
  });
  const houndRef = useRef<HoundState>({ x: HOME.x, y: HOME.y, face: 1 });
  const fxBagRef = useRef<FxBag>({
    flashStart: null,
    flakes: [],
    confetti: [],
    goldStart: null,
    wanderStart: null,
    wanderFrom: null,
  });

  const verdictTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const confusedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bustTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const winTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  /* ── canvas setup (re-setup on resize, replaying the trail) ── */
  const setupCanvases = useCallback(() => {
    const scene = sceneRef.current;
    const trail = trailRef.current;
    const fx = fxRef.current;
    if (!scene || !trail || !fx) return;
    const ss = setupHiDpiCanvas(scene, {
      logicalWidth: CANVAS_W,
      logicalHeight: CANVAS_H,
      maxDpr: 2,
    });
    const ts = setupHiDpiCanvas(trail, {
      logicalWidth: CANVAS_W,
      logicalHeight: CANVAS_H,
      maxDpr: 2,
    });
    const fs = setupHiDpiCanvas(fx, {
      logicalWidth: CANVAS_W,
      logicalHeight: CANVAS_H,
      maxDpr: 2,
    });
    if (!ss || !ts || !fs) return;
    trailCtxRef.current = ts.ctx;
    fxCtxRef.current = fs.ctx;

    drawScene(ss.ctx);
    drawGroovePolyline(ts.ctx, pointsRef.current);
    for (const s of stampsRef.current) drawFootStamp(ts.ctx, s);
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

  /* ── timers cleanup ── */
  useEffect(() => {
    return () => {
      for (const t of [
        verdictTimerRef,
        confusedTimerRef,
        bustTimerRef,
        winTimerRef,
        tipTimerRef,
      ]) {
        if (t.current) clearTimeout(t.current);
      }
    };
  }, []);

  /* ── small helpers ── */
  const showTip = useCallback((text: string) => {
    setTip(text);
    if (tipTimerRef.current) clearTimeout(tipTimerRef.current);
    tipTimerRef.current = setTimeout(() => setTip(null), 1900);
  }, []);

  const revealZone = useCallback((id: string) => {
    setRevealed((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const spawnFlakes = useCallback((count: number) => {
    const bag = fxBagRef.current;
    for (let i = 0; i < count; i++) {
      bag.flakes.push({
        x: Math.random() * CANVAS_W,
        y: -30 - Math.random() * 60,
        vx: (Math.random() - 0.5) * 60,
        vy: 160 + Math.random() * 180,
        size: 2 + Math.random() * 3.5,
        color: "#ffffff",
        rot: 0,
        vr: 0,
        life: 1.4 + Math.random() * 0.8,
      });
    }
  }, []);

  const clearTrail = useCallback(() => {
    pointsRef.current = [];
    stampsRef.current = [];
    footDistRef.current = 0;
    footSideRef.current = 1;
    hitZonesRef.current.clear();
    zoneGlowRef.current.clear();
    trailDoneRef.current = false;
    trailCtxRef.current?.clearRect(0, 0, CANVAS_W, CANVAS_H);
  }, []);

  /* ── win + replay endings (stable for the rAF loop) ── */
  const startWin = useCallback(() => {
    setPhase("win");
    const bag = fxBagRef.current;
    bag.wanderStart = performance.now();
    bag.wanderFrom = { x: houndRef.current.x, y: houndRef.current.y };
    bag.confetti = [];
    for (let i = 0; i < 110; i++) {
      bag.confetti.push({
        x: CANVAS_W * (0.15 + 0.7 * Math.random()),
        y: -20 - Math.random() * 60,
        vx: (Math.random() - 0.5) * 170,
        vy: 70 + Math.random() * 190,
        size: 6 + Math.random() * 7,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 9,
        life: 2 + Math.random() * 1.3,
      });
    }
    winTimerRef.current = setTimeout(() => {
      if (!firedRef.current) {
        firedRef.current = true;
        onCompleteRef.current();
      }
    }, WIN_DELAY_MS);
  }, []);

  const endReplay = useCallback(() => {
    verdictTimerRef.current = setTimeout(() => {
      if (roundRef.current === 1 && hitZonesRef.current.size > 0) {
        setPhase("verdict1");
      } else {
        // Quiet trail (round 2, or a sneaky round 1): the Hound learned
        // nothing. Gold path, confused Hound, then the win.
        fxBagRef.current.goldStart = performance.now();
        setPhase("confused");
        confusedTimerRef.current = setTimeout(() => startWin(), CONFUSED_MS);
      }
    }, 550);
  }, [startWin]);

  /* ── trail mechanics ── */
  const stampBigPrints = useCallback((entry: Pt, prev: Pt, z: PostZone) => {
    const ctx = trailCtxRef.current;
    if (!ctx) return;
    let dx = entry.x - prev.x;
    let dy = entry.y - prev.y;
    const len = Math.hypot(dx, dy);
    if (len < 0.01) {
      dx = 1;
      dy = 0;
    } else {
      dx /= len;
      dy /= len;
    }
    const angle = Math.atan2(dy, dx);
    for (let k = 0; k < 3; k++) {
      const s: FootStamp = {
        x: entry.x + dx * k * 34,
        y: entry.y + dy * k * 34,
        angle,
        side: k % 2 === 0 ? 1 : -1,
        big: true,
      };
      stampsRef.current.push(s);
      drawFootStamp(ctx, s);
    }
  }, []);

  const triggerBust = useCallback(
    (z: PostZone) => {
      if (bustingRef.current) return;
      bustingRef.current = true;
      drawingRef.current = false;
      const bag = fxBagRef.current;
      bag.flashStart = performance.now();
      zoneGlowRef.current.set(z.id, {
        start: performance.now(),
        called: true,
      });
      spawnFlakes(70);
      setBustMsg(`${z.bust} Fresh snow... try a quieter path!`);
      bustTimerRef.current = setTimeout(() => {
        clearTrail();
        bustingRef.current = false;
      }, BUST_RESET_MS);
    },
    [clearTrail, spawnFlakes]
  );

  const finishTrail = useCallback(() => {
    drawingRef.current = false;
    trailDoneRef.current = true;
    const pts = pointsRef.current;
    if (pts.length < 2) return;
    const cum: number[] = new Array(pts.length);
    cum[0] = 0;
    let total = 0;
    for (let i = 1; i < pts.length; i++) {
      total += dist2d(pts[i - 1], pts[i]);
      cum[i] = total;
    }
    const events: { d: number; id: string }[] = [];
    if (roundRef.current === 1) {
      for (const z of POST_ZONES) {
        if (!hitZonesRef.current.has(z.id)) continue;
        for (let i = 0; i < pts.length; i++) {
          if (inZone(pts[i], z, 0)) {
            events.push({ d: cum[i], id: z.id });
            break;
          }
        }
      }
      events.sort((a, b) => a.d - b.d);
    }
    replayRef.current = {
      active: true,
      dist: 0,
      total,
      cum,
      events,
      next: 0,
      pauseUntil: 0,
      speed: Math.max(REPLAY_MIN_SPEED, total / REPLAY_MAX_SECONDS),
      segIdx: 0,
      done: false,
    };
    houndRef.current = { x: pts[0].x, y: pts[0].y, face: 1 };
    setPhase(roundRef.current === 1 ? "replay1" : "replay2");
  }, []);

  const appendTrail = useCallback(
    (to: Pt) => {
      const ctx = trailCtxRef.current;
      const pts = pointsRef.current;
      if (!ctx || pts.length === 0) return;
      const from = pts[pts.length - 1];
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const span = Math.hypot(dx, dy);
      if (span < 0.5) return;
      const steps = Math.max(1, Math.ceil(span / TRAIL_STEP));
      for (let s = 1; s <= steps; s++) {
        const prev = pts[pts.length - 1];
        const p: Pt = {
          x: from.x + (dx * s) / steps,
          y: from.y + (dy * s) / steps,
        };
        drawGrooveSeg(ctx, prev, p);
        pts.push(p);

        footDistRef.current += dist2d(prev, p);
        if (footDistRef.current >= FOOT_STEP) {
          footDistRef.current = 0;
          footSideRef.current = footSideRef.current === 1 ? -1 : 1;
          const stamp: FootStamp = {
            x: p.x,
            y: p.y,
            angle: Math.atan2(p.y - prev.y, p.x - prev.x),
            side: footSideRef.current,
            big: false,
          };
          stampsRef.current.push(stamp);
          drawFootStamp(ctx, stamp);
        }

        if (roundRef.current === 1) {
          for (const z of POST_ZONES) {
            if (!hitZonesRef.current.has(z.id) && inZone(p, z, 0)) {
              hitZonesRef.current.add(z.id);
              zoneGlowRef.current.set(z.id, {
                start: performance.now(),
                called: false,
              });
              stampBigPrints(p, prev, z);
            }
          }
        } else {
          for (const z of POST_ZONES) {
            if (inZone(p, z, ZONE_SLACK_R2)) {
              stampBigPrints(p, prev, z);
              triggerBust(z);
              return;
            }
          }
        }

        if (dist2d(p, FORT) <= FORT.r + FORT_SLACK) {
          finishTrail();
          return;
        }
      }
    },
    [finishTrail, stampBigPrints, triggerBust]
  );

  /* ── pointer handlers ── */
  const isDrawPhase = phase === "draw1" || phase === "draw2";

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const ph = phaseRef.current;
    if ((ph !== "draw1" && ph !== "draw2") || bustingRef.current) return;
    if (trailDoneRef.current) return;
    const canvas = trailRef.current;
    if (!canvas) return;
    const pos = getPointerLogicalPos(canvas, e, CANVAS_W, CANVAS_H);
    const pts = pointsRef.current;

    if (pts.length === 0) {
      if (dist2d(pos, HOME) > HOME.r + HOME_SLACK) {
        showTip("Put your finger on the glowing HOME circle to start!");
        return;
      }
      e.currentTarget.setPointerCapture(e.pointerId);
      drawingRef.current = true;
      pts.push(pos);
      setHasInk(true);
      setBustMsg(null);
      return;
    }

    if (dist2d(pos, pts[pts.length - 1]) > RESUME_REACH) {
      showTip("Keep walking from the end of your trail!");
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    setBustMsg(null);
    appendTrail(pos);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drawingRef.current) return;
    const canvas = trailRef.current;
    if (!canvas) return;
    appendTrail(getPointerLogicalPos(canvas, e, CANVAS_W, CANVAS_H));
  };

  const endDraw = () => {
    drawingRef.current = false;
  };

  /* ── round 2 kickoff ── */
  const startRound2 = () => {
    clearTrail();
    roundRef.current = 2;
    setRound(2);
    setRevealed([]);
    setBustMsg(null);
    spawnFlakes(60);
    setPhase("draw2");
  };

  /* ── fx render loop ── */
  useEffect(() => {
    let raf = 0;
    let running = true;
    let lastNow = performance.now();

    const loop = (now: number) => {
      if (!running) return;
      const dt = Math.min(0.05, (now - lastNow) / 1000);
      lastNow = now;
      const ctx = fxCtxRef.current;
      if (ctx) {
        ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
        const ph = phaseRef.current;
        const bag = fxBagRef.current;
        const pts = pointsRef.current;

        // Round-2 "danger" pulse on every post zone ring.
        if (ph === "draw2" || ph === "replay2") {
          const a = 0.16 + 0.1 * Math.sin(now / 260);
          ctx.strokeStyle = `rgba(255, 90, 60, ${a.toFixed(3)})`;
          ctx.lineWidth = 7;
          for (const z of POST_ZONES) {
            ctx.beginPath();
            ctx.arc(z.x, z.y, z.r, 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        // Glow on zones the trail has stepped in.
        for (const [id, glow] of zoneGlowRef.current) {
          const z = POST_ZONES.find((zz) => zz.id === id);
          if (!z) continue;
          const pulse = 0.5 + 0.5 * Math.sin(now / 240);
          const strong = glow.called;
          ctx.fillStyle = strong
            ? `rgba(255, 80, 50, ${(0.1 + 0.08 * pulse).toFixed(3)})`
            : `rgba(255, 150, 60, ${(0.08 + 0.06 * pulse).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(z.x, z.y, z.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = strong
            ? `rgba(255, 70, 50, ${(0.5 + 0.25 * pulse).toFixed(3)})`
            : `rgba(255, 130, 40, ${(0.4 + 0.2 * pulse).toFixed(3)})`;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(z.x, z.y, z.r, 0, Math.PI * 2);
          ctx.stroke();
        }

        // "Continue here" pulse when a trail is paused mid-draw.
        if (
          (ph === "draw1" || ph === "draw2") &&
          pts.length > 0 &&
          !drawingRef.current &&
          !trailDoneRef.current &&
          !bustingRef.current
        ) {
          const last = pts[pts.length - 1];
          const pr = 12 + 5 * Math.sin(now / 220);
          ctx.strokeStyle = "rgba(60, 130, 255, 0.65)";
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.arc(last.x, last.y, pr, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Gold path once the quiet trail is proven.
        if ((ph === "confused" || ph === "win") && bag.goldStart !== null) {
          drawGoldTrail(ctx, pts, now);
        }

        // Track Hound replay.
        const rp = replayRef.current;
        if (rp.active && pts.length > 1) {
          if (now >= rp.pauseUntil) {
            rp.dist = Math.min(rp.total, rp.dist + rp.speed * dt);
          }
          if (rp.next < rp.events.length && rp.dist >= rp.events[rp.next].d) {
            const ev = rp.events[rp.next];
            rp.next++;
            rp.pauseUntil = now + SNIFF_PAUSE_MS;
            const glow = zoneGlowRef.current.get(ev.id);
            if (glow) glow.called = true;
            revealZone(ev.id);
          }
          while (
            rp.segIdx < pts.length - 2 &&
            rp.cum[rp.segIdx + 1] < rp.dist
          ) {
            rp.segIdx++;
          }
          const i = rp.segIdx;
          const segLen = rp.cum[i + 1] - rp.cum[i] || 1;
          const t = Math.min(1, Math.max(0, (rp.dist - rp.cum[i]) / segLen));
          const hx = pts[i].x + (pts[i + 1].x - pts[i].x) * t;
          const hy = pts[i].y + (pts[i + 1].y - pts[i].y) * t;
          if (Math.abs(pts[i + 1].x - pts[i].x) > 0.01) {
            houndRef.current.face = pts[i + 1].x >= pts[i].x ? 1 : -1;
          }
          houndRef.current.x = hx;
          houndRef.current.y = hy;
          drawHound(
            ctx,
            hx,
            hy,
            houndRef.current.face,
            now / 1000,
            now < rp.pauseUntil,
            1
          );
          if (rp.dist >= rp.total && !rp.done) {
            rp.done = true;
            rp.active = false;
            endReplay();
          }
        }

        // Confused Hound sniffing at the trail end.
        if (ph === "confused") {
          drawHound(
            ctx,
            houndRef.current.x,
            houndRef.current.y,
            houndRef.current.face,
            now / 1000,
            true,
            1
          );
        }

        // Win: the Hound wanders off and fades away.
        if (ph === "win" && bag.wanderStart !== null && bag.wanderFrom) {
          const t = (now - bag.wanderStart) / 1600;
          if (t < 1) {
            const wx = bag.wanderFrom.x + (-90 - bag.wanderFrom.x) * t;
            const wy = bag.wanderFrom.y + 26 * t;
            drawHound(ctx, wx, wy, -1, now / 1000, false, 1 - t);
          }
        }

        // Red caught-flash.
        if (bag.flashStart !== null) {
          const t = now - bag.flashStart;
          if (t > 650) {
            bag.flashStart = null;
          } else {
            ctx.fillStyle = `rgba(255, 70, 60, ${(0.4 * (1 - t / 650)).toFixed(3)})`;
            ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
          }
        }

        // Falling snow flakes (fresh-snow resets).
        if (bag.flakes.length > 0) {
          const alive: Particle[] = [];
          for (const f of bag.flakes) {
            f.life -= dt;
            if (f.life <= 0 || f.y > CANVAS_H + 20) continue;
            f.x += f.vx * dt;
            f.y += f.vy * dt;
            ctx.globalAlpha = Math.min(1, f.life / 0.5);
            ctx.fillStyle = f.color;
            ctx.beginPath();
            ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
            alive.push(f);
          }
          bag.flakes = alive;
        }

        // Confetti at the win.
        if (bag.confetti.length > 0) {
          const alive: Particle[] = [];
          for (const p of bag.confetti) {
            p.life -= dt;
            if (p.life <= 0 || p.y > CANVAS_H + 30) continue;
            p.vy += 300 * dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.rot += p.vr * dt;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.globalAlpha = Math.min(1, p.life / 0.6);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
            ctx.restore();
            alive.push(p);
          }
          bag.confetti = alive;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
    };
  }, [endReplay, revealZone]);

  /* ── copy per phase ── */
  const hintText = bustMsg
    ? bustMsg
    : phase === "intro"
      ? "Fresh snow ahead..."
      : phase === "draw1"
        ? hasInk
          ? "Keep going... reach the FUN FORT!"
          : "Draw your path from HOME to the FUN FORT!"
        : phase === "replay1"
          ? "Uh oh... the TRACK HOUND found your footprints!"
          : phase === "verdict1"
            ? "The snow told the Hound your whole story..."
            : phase === "draw2"
              ? "Sneak round! Reach the fort on QUIET snow. Stay out of the orange post zones!"
              : phase === "replay2"
                ? "The Hound is sniffing your new trail..."
                : phase === "confused"
                  ? "Only quiet snow! The Hound learned NOTHING."
                  : "Gold trail! You planned every footprint. Hero move!";

  const hintColor = bustMsg
    ? "#ff8a8a"
    : phase === "confused" || phase === "win"
      ? "#8bffb0"
      : phase === "replay1"
        ? "#ffb4a1"
        : "#e7ecff";

  const hitZones = POST_ZONES.filter((z) => revealed.includes(z.id));

  /* ────────────────────────── render ────────────────────────── */
  return (
    <ExerciseFrame padding={24}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <PixIcon emoji="📍" size={34} />
          <div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: 1.5,
                color: "#bfe3ff",
                textShadow: "0 0 18px rgba(90, 170, 255, 0.4)",
              }}
            >
              THE TRAIL PLANNER
            </div>
            <div style={{ fontSize: 13, opacity: 0.75 }}>
              Snow rule: fresh snow remembers every single step.
            </div>
          </div>
        </div>

        {/* ── The snowfield tray ── */}
        <div
          style={{
            position: "relative",
            borderRadius: 20,
            padding: 12,
            background: "linear-gradient(180deg, #1c3a5e 0%, #142c49 100%)",
            boxShadow:
              "inset 0 4px 14px rgba(0, 0, 0, 0.5), 0 8px 24px rgba(0, 0, 0, 0.35), 0 0 0 2px rgba(125, 200, 255, 0.16)",
          }}
        >
          <div
            ref={wrapRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endDraw}
            onPointerCancel={endDraw}
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: `${CANVAS_W} / ${CANVAS_H}`,
              borderRadius: 14,
              overflow: "hidden",
              touchAction: "none",
              cursor: isDrawPhase ? "crosshair" : "default",
              boxShadow: "inset 0 0 22px rgba(20, 50, 100, 0.25)",
            }}
          >
            <canvas
              ref={sceneRef}
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                display: "block",
              }}
            />
            <canvas
              ref={trailRef}
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                display: "block",
              }}
            />
            <canvas
              ref={fxRef}
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                display: "block",
                pointerEvents: "none",
              }}
            />

            {/* Round badge */}
            {phase !== "intro" && (
              <div
                style={{
                  position: "absolute",
                  top: 10,
                  left: 10,
                  padding: "5px 12px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: 1.2,
                  color: round === 2 ? "#ffe1d1" : "#123",
                  background:
                    round === 2
                      ? "linear-gradient(180deg, #7c5cff 0%, #5a3ecc 100%)"
                      : "linear-gradient(180deg, #ffd166 0%, #ffb347 100%)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                  pointerEvents: "none",
                }}
              >
                {round === 2 ? "ROUND 2 · SNEAK" : "ROUND 1 · WALK"}
              </div>
            )}

            {/* Tip chip */}
            <AnimatePresence>
              {tip && (
                <motion.div
                  key="tip"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: "absolute",
                    top: 12,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "#4a3411",
                    color: "#ffd166",
                    fontSize: 14,
                    fontWeight: 800,
                    padding: "7px 16px",
                    borderRadius: 999,
                    whiteSpace: "nowrap",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.35)",
                    pointerEvents: "none",
                  }}
                >
                  {tip}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hound speech bubbles over the zones it called out */}
            <AnimatePresence>
              {(phase === "replay1" || phase === "verdict1") &&
                hitZones.map((z) => (
                  <motion.div
                    key={z.id}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 380, damping: 22 }}
                    style={{
                      position: "absolute",
                      left: `${(z.x / CANVAS_W) * 100}%`,
                      top: `${((z.y - z.r - 6) / CANVAS_H) * 100}%`,
                      transform: "translate(-50%, -100%)",
                      background: "#ffffff",
                      border: "2.5px solid #ff8c2e",
                      color: "#8a3a10",
                      fontSize: 12.5,
                      fontWeight: 800,
                      padding: "6px 11px",
                      borderRadius: 14,
                      maxWidth: 220,
                      textAlign: "center",
                      lineHeight: 1.3,
                      boxShadow: "0 5px 14px rgba(0, 0, 0, 0.3)",
                      pointerEvents: "none",
                      zIndex: 2,
                    }}
                  >
                    {z.chip}
                  </motion.div>
                ))}
            </AnimatePresence>

            {/* Confused Hound bubble */}
            <AnimatePresence>
              {phase === "confused" && (
                <motion.div
                  key="confused"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 380, damping: 22 }}
                  style={{
                    position: "absolute",
                    left: "78%",
                    top: "26%",
                    transform: "translate(-50%, -100%)",
                    background: "#ffffff",
                    border: "2.5px solid #7dc4ff",
                    color: "#1e4e7e",
                    fontSize: 13,
                    fontWeight: 800,
                    padding: "7px 12px",
                    borderRadius: 14,
                    maxWidth: 230,
                    textAlign: "center",
                    lineHeight: 1.35,
                    boxShadow: "0 5px 14px rgba(0, 0, 0, 0.3)",
                    pointerEvents: "none",
                    zIndex: 2,
                  }}
                >
                  ?!? I followed every footprint... and learned NOTHING!
                </motion.div>
              )}
            </AnimatePresence>

            {/* Intro overlay */}
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
                    justifyContent: "center",
                    gap: 14,
                    textAlign: "center",
                    padding: 24,
                    background:
                      "radial-gradient(circle at 50% 30%, rgba(18, 44, 84, 0.9) 0%, rgba(10, 24, 48, 0.95) 75%)",
                    zIndex: 3,
                  }}
                >
                  <PixIcon emoji="🏠" size={52} />
                  <div
                    style={{ fontSize: 24, fontWeight: 800, color: "#bfe3ff" }}
                  >
                    Fresh snow just fell!
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      lineHeight: 1.5,
                      maxWidth: 440,
                      opacity: 0.92,
                    }}
                  >
                    Draw your path from HOME to the FUN FORT with your finger.
                    Careful: the snow remembers EVERY footprint you leave, and
                    the loud post zones tell everyone who walked by!
                  </div>
                  {/* Spoken "here's what to do" (Sarah) - lives INSIDE this
                      themed intro so the flavour stays the game's own. The
                      wrapper is the one shrinkable flex child (minHeight 0 +
                      internal scroll) so on short viewports it compresses and
                      scrolls instead of pushing the start button off-screen. */}
                  {narration && narration.lines.length > 0 && (
                    <div
                      style={{
                        width: "100%",
                        maxWidth: 440,
                        textAlign: "left",
                        minHeight: 0,
                        overflowY: "auto",
                      }}
                    >
                      <InfoNarration
                        lines={narration.lines}
                        accent={accent ?? "#a8e4ff"}
                      />
                    </div>
                  )}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPhase("draw1")}
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
                    Start walking
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Win banner */}
            <AnimatePresence>
              {phase === "win" && (
                <motion.div
                  key="win"
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 420,
                    damping: 18,
                    delay: 0.35,
                  }}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "20%",
                    transform: "translateX(-50%)",
                    marginLeft: -130,
                    width: 260,
                    textAlign: "center",
                    background:
                      "linear-gradient(180deg, #2ecc71 0%, #1f8a4c 100%)",
                    color: "#ffffff",
                    fontSize: 27,
                    fontWeight: 900,
                    letterSpacing: 2,
                    padding: "12px 0",
                    borderRadius: 20,
                    boxShadow: "0 10px 26px rgba(20, 90, 50, 0.55)",
                    border: "3px solid rgba(255, 255, 255, 0.75)",
                    pointerEvents: "none",
                    zIndex: 3,
                  }}
                >
                  QUIET TRACKS!
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Hint line (snowfield footer) */}
          <div
            aria-live="polite"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginTop: 10,
              minHeight: 24,
              fontSize: 15,
              fontWeight: 700,
              color: hintColor,
              textAlign: "center",
            }}
          >
            {(phase === "replay1" || phase === "replay2") && (
              <PixIcon emoji="🔍" size={20} />
            )}
            {hintText}
          </div>
        </div>

        {/* ── Below the tray: legend / verdict panel / win caption ── */}
        <div style={{ minHeight: 120, position: "relative" }}>
          <AnimatePresence mode="wait">
            {(phase === "intro" ||
              phase === "draw1" ||
              phase === "draw2" ||
              phase === "replay1" ||
              phase === "replay2") && (
              <motion.div
                key="legend"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: 12,
                  paddingTop: 6,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 13.5,
                    fontWeight: 700,
                    padding: "8px 14px",
                    borderRadius: 999,
                    background: "rgba(255, 140, 50, 0.14)",
                    border: "1.5px solid rgba(255, 140, 50, 0.5)",
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: "#ff8c2e",
                      flexShrink: 0,
                    }}
                  />
                  Loud post zones shout your secrets
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 13.5,
                    fontWeight: 700,
                    padding: "8px 14px",
                    borderRadius: 999,
                    background: "rgba(125, 200, 255, 0.12)",
                    border: "1.5px solid rgba(125, 200, 255, 0.45)",
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: "#eaf4ff",
                      flexShrink: 0,
                    }}
                  />
                  Quiet snow keeps them
                </div>
              </motion.div>
            )}

            {/* Verdict panel after the round-1 replay */}
            {phase === "verdict1" && (
              <motion.div
                key="verdict"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 26 }}
                style={{
                  background: "rgba(160, 60, 20, 0.24)",
                  border: "2px solid rgba(255, 140, 60, 0.6)",
                  borderRadius: 18,
                  padding: "16px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 900, color: "#ffb47a" }}>
                  The snow remembered EVERYTHING!
                </div>
                <div style={{ fontSize: 14.5, opacity: 0.95 }}>
                  The Track Hound read your footprints like a book:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {hitZones.map((z) => (
                    <div
                      key={z.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        fontSize: 14.5,
                        fontWeight: 700,
                      }}
                    >
                      <PixIcon emoji={z.icon} size={22} />
                      {z.bullet}
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 14, opacity: 0.85 }}>
                  Footprints in snow never fade. But YOU choose where they go!
                </div>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startRound2}
                  style={{
                    alignSelf: "center",
                    marginTop: 4,
                    minHeight: 56,
                    padding: "0 34px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 18,
                    fontWeight: 800,
                    fontFamily: "inherit",
                    letterSpacing: 1,
                    color: "#ffffff",
                    background:
                      "linear-gradient(180deg, #7c5cff 0%, #5a3ecc 100%)",
                    border: "none",
                    borderRadius: 16,
                    cursor: "pointer",
                    boxShadow: "0 6px 18px rgba(110, 80, 220, 0.45)",
                  }}
                >
                  <PixIcon emoji="✨" size={22} />
                  ROUND 2: Fresh snow, quiet path
                </motion.button>
              </motion.div>
            )}

            {/* Confused note + win caption */}
            {(phase === "confused" || phase === "win") && (
              <motion.div
                key="win-caption"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  minHeight: 64,
                  paddingTop: 8,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 19,
                    fontWeight: 900,
                    color: "#8bffb0",
                  }}
                >
                  <PixIcon emoji="⭐" size={26} />
                  You planned your tracks like a hero!
                  <PixIcon emoji="⭐" size={26} />
                </div>
                <div style={{ fontSize: 14, opacity: 0.85, maxWidth: 520 }}>
                  The snow still remembered your whole path. But you planned it,
                  so it told the Hound nothing at all.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </ExerciseFrame>
  );
}
