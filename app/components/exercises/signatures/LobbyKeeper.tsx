"use client";

/*
 * THE LOBBY KEEPER - Week 6 signature exercise (Gaming Safety).
 *
 * Neon arcade fantasy: the child's game lobby has three glowing entry
 * lanes, each ending in a sliding door. Players drift SLOWLY toward the
 * doors. Real teammates carry the child's glowing gold TEAM BADGE;
 * imposters shimmer with a visible glitch and have NO badge. The child
 * drags Adam sideways like a goalkeeper: standing in an imposter's lane
 * bounces them away with a green "DENIED!" zap; stepping aside lets a
 * badge carrier walk in for a high five.
 *
 * There is NO losable state. A missed imposter bonks on the inner door
 * and floats back for another slow approach with a hint arrow. Blocking
 * a real friend just makes them wait, badge held high, until the child
 * steps aside. WIN = all three teammates inside + all three imposters
 * denied -> green "PARTY SAFE!" -> onComplete().
 *
 * Lesson: you are the bouncer of your own game. Check the badge (do I
 * actually know this player?) before anyone gets in.
 *
 * Canvas stack (hi-DPI via setupHiDpiCanvas, logical 720x420):
 *   scene (bottom) - lanes, doors, marquee; drawn once + on resize
 *   fx    (top)    - movers, Adam, door panels, particles, rAF loop
 * DOM overlays handle the intro, HUD, hints, and the win panel.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
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

const SPAWN_Y = 64; // where arrivals appear (far, small)
const RETRY_Y = 112; // how far a bonked imposter floats back up
const BLOCK_Y = 238; // reaching this with Adam in the lane = contact
const DOOR_Y = 316; // reaching this = enter (badge) or bonk (no badge)
const KEEPER_Y = 284; // Adam's standing line

const WALK_SPEED = 44; // logical px/s - slow, floaty, well telegraphed
const FLOAT_BACK_SPEED = 80;

const ADAM_MIN_X = 90;
const ADAM_MAX_X = 630;
const LANE_GRAB = 84; // Adam counts as "in a lane" within this of center

const WIN_DELAY_MS = 3200;
const FLARE_MS = 950;

const DOOR_W = 128;
const LANE_W = 168;

interface LaneDef {
  cx: number;
  color: string;
}
const LANES: LaneDef[] = [
  { cx: 150, color: "#38e1ff" },
  { cx: 360, color: "#ff5df1" },
  { cx: 570, color: "#ffd166" },
];

const CONFETTI_COLORS = [
  "#ffd166",
  "#7df0ff",
  "#ff6b6b",
  "#8bffb0",
  "#c9a7ff",
  "#fff3d6",
];

const FONT_STACK = "'Fredoka', 'Quicksand', ui-rounded, system-ui, sans-serif";

type Phase = "intro" | "play" | "win";
type MoverKind = "real" | "imposter";
type MoverState = "walk" | "wait" | "deny" | "enter" | "bonkback";

interface ArrivalDef {
  kind: MoverKind;
  lane: number;
  body: string;
  hair: string;
  skin: string;
}

/*
 * Fixed arrival script (3 real + 3 imposters). Opens with a real friend
 * so the child SEES the badge working before the first block is needed.
 */
const ARRIVALS: ArrivalDef[] = [
  { kind: "real", lane: 0, body: "#4fc6ff", hair: "#4a2c14", skin: "#f2c19a" },
  { kind: "imposter", lane: 2, body: "#a06bff", hair: "#241a3d", skin: "#d9c2b0" },
  { kind: "real", lane: 1, body: "#ff8ecb", hair: "#1f1b18", skin: "#c68a5a" },
  { kind: "imposter", lane: 0, body: "#59d6c4", hair: "#20303c", skin: "#e3c6ad" },
  { kind: "imposter", lane: 1, body: "#ff9d6b", hair: "#33241c", skin: "#d9b490" },
  { kind: "real", lane: 2, body: "#7ef0a2", hair: "#5b3a1e", skin: "#ffd9b8" },
];

const TEAMMATES_TOTAL = ARRIVALS.filter((a) => a.kind === "real").length;
const IMPOSTERS_TOTAL = ARRIVALS.length - TEAMMATES_TOTAL;

interface Mover {
  id: number;
  kind: MoverKind;
  lane: number;
  y: number;
  xOff: number; // only used by the deny fling
  vx: number;
  vy: number;
  rot: number;
  alpha: number;
  state: MoverState;
  retry: number;
  resolved: boolean;
  bobPhase: number;
  body: string;
  hair: string;
  skin: string;
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

interface GameState {
  movers: Mover[];
  spawnIndex: number;
  nextSpawnAt: number;
  adamX: number;
  targetX: number;
  denyFlashT0: number;
  doorOpen: number[]; // per-lane openness 0..1
  lobby: number;
  denied: number;
  seenReal: boolean;
  seenImposter: boolean;
  winScheduled: boolean;
  particles: Particle[];
  flares: Flare[];
}

function makeGameState(): GameState {
  return {
    movers: [],
    spawnIndex: 0,
    nextSpawnAt: 0,
    adamX: 360,
    targetX: 360,
    denyFlashT0: -1e9,
    doorOpen: [0, 0, 0],
    lobby: 0,
    denied: 0,
    seenReal: false,
    seenImposter: false,
    winScheduled: false,
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

function starPath(
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

function adamLaneAt(x: number): number {
  for (let i = 0; i < LANES.length; i++) {
    if (Math.abs(x - LANES[i].cx) < LANE_GRAB) return i;
  }
  return -1;
}

/** Depth scale: arrivals start small and grow as they approach. */
function depthScale(y: number): number {
  return 0.72 + clamp((y - SPAWN_Y) / (DOOR_Y - SPAWN_Y), 0, 1) * 0.33;
}

/* ────────────────────── canvas draw helpers ───────────────────── */

/** The static lobby scene: sky, marquee, lanes, door frames, floor. */
function drawScene(ctx: CanvasRenderingContext2D) {
  const W = CANVAS_W;
  const H = CANVAS_H;
  ctx.clearRect(0, 0, W, H);

  // ── Arcade night backdrop ──
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#140a2e");
  sky.addColorStop(0.55, "#221448");
  sky.addColorStop(1, "#2a1a55");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 24; i++) {
    const sx = prand(i * 3 + 60) * W;
    const sy = prand(i * 3 + 61) * H * 0.35;
    ctx.fillStyle = `rgba(220, 235, 255, ${(0.12 + 0.35 * prand(i * 3 + 62)).toFixed(2)})`;
    ctx.beginPath();
    ctx.arc(sx, sy, 1.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Neon floor with a perspective grid ──
  const floorY = 344;
  const floor = ctx.createLinearGradient(0, floorY, 0, H);
  floor.addColorStop(0, "#1b1140");
  floor.addColorStop(1, "#241847");
  ctx.fillStyle = floor;
  ctx.fillRect(0, floorY, W, H - floorY);
  ctx.strokeStyle = "rgba(56, 225, 255, 0.16)";
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 5; i++) {
    const gy = floorY + 8 + i * i * 5 + i * 6;
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(W, gy);
    ctx.stroke();
  }
  for (let i = -6; i <= 6; i++) {
    ctx.beginPath();
    ctx.moveTo(360 + i * 40, floorY);
    ctx.lineTo(360 + i * 90, H);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(255, 93, 241, 0.35)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, floorY + 1);
  ctx.lineTo(W, floorY + 1);
  ctx.stroke();

  // ── Side neon tubes ──
  for (const [tx, tc] of [
    [22, "#ff5df1"],
    [698, "#38e1ff"],
  ] as Array<[number, string]>) {
    ctx.save();
    ctx.shadowColor = tc;
    ctx.shadowBlur = 12;
    ctx.strokeStyle = tc;
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(tx, 88);
    ctx.lineTo(tx, 336);
    ctx.stroke();
    ctx.restore();
  }

  // ── Entry lanes ──
  for (const lane of LANES) {
    const lx = lane.cx - LANE_W / 2;
    roundRectPath(ctx, lx, 70, LANE_W, 276, 14);
    ctx.fillStyle = "rgba(255, 255, 255, 0.045)";
    ctx.fill();
    // Neon rails.
    ctx.save();
    ctx.shadowColor = lane.color;
    ctx.shadowBlur = 10;
    ctx.strokeStyle = lane.color;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 3;
    for (const rx of [lx, lx + LANE_W]) {
      ctx.beginPath();
      ctx.moveTo(rx, 74);
      ctx.lineTo(rx, 342);
      ctx.stroke();
    }
    ctx.restore();
    // Soft chevrons pointing toward the door.
    ctx.strokeStyle = lane.color;
    ctx.globalAlpha = 0.14;
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    for (let cy = 104; cy < 250; cy += 46) {
      ctx.beginPath();
      ctx.moveTo(lane.cx - 20, cy);
      ctx.lineTo(lane.cx, cy + 13);
      ctx.lineTo(lane.cx + 20, cy);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.lineCap = "butt";
  }

  // ── Keeper zone dashes ──
  ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 10]);
  ctx.beginPath();
  ctx.moveTo(64, 322);
  ctx.lineTo(656, 322);
  ctx.stroke();
  ctx.setLineDash([]);

  // ── Door frames (sliding panels are drawn on the fx layer) ──
  for (const lane of LANES) {
    const fx = lane.cx - DOOR_W / 2 - 8;
    roundRectPath(ctx, fx, 292, DOOR_W + 16, 60, 10);
    ctx.fillStyle = "#241543";
    ctx.fill();
    ctx.save();
    ctx.shadowColor = lane.color;
    ctx.shadowBlur = 12;
    ctx.strokeStyle = lane.color;
    ctx.globalAlpha = 0.8;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
    // Dark doorway interior.
    ctx.fillStyle = "#0b0620";
    ctx.fillRect(lane.cx - DOOR_W / 2, 300, DOOR_W, 44);
    // Lamp on top of the frame.
    ctx.save();
    ctx.shadowColor = lane.color;
    ctx.shadowBlur = 10;
    ctx.fillStyle = lane.color;
    ctx.beginPath();
    ctx.arc(lane.cx, 292, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ── Marquee ──
  roundRectPath(ctx, 150, 8, 420, 46, 12);
  const mq = ctx.createLinearGradient(0, 8, 0, 54);
  mq.addColorStop(0, "#33206b");
  mq.addColorStop(1, "#241549");
  ctx.fillStyle = mq;
  ctx.fill();
  ctx.save();
  ctx.shadowColor = "#ff5df1";
  ctx.shadowBlur = 14;
  ctx.strokeStyle = "rgba(255, 93, 241, 0.85)";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.shadowColor = "rgba(255, 209, 102, 0.8)";
  ctx.shadowBlur = 10;
  ctx.fillStyle = "#ffd166";
  ctx.font = `900 21px ${FONT_STACK}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("GAME NIGHT LOBBY", 360, 32);
  ctx.restore();
  // Marquee bulbs.
  for (let i = 0; i < 10; i++) {
    const bx = 172 + i * 42;
    ctx.fillStyle = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    ctx.beginPath();
    ctx.arc(bx, 54, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** One arriving player (teammate or glitchy imposter). */
function drawMover(ctx: CanvasRenderingContext2D, m: Mover, t: number) {
  const laneX = LANES[m.lane].cx + m.xOff;
  let s = depthScale(m.y);
  let alpha = m.alpha;
  if (m.state === "enter") {
    const eo = clamp((m.y - DOOR_Y) / 36, 0, 1);
    s *= 1 - 0.28 * eo;
    alpha *= 1 - eo;
  }
  if (alpha <= 0.01) return;

  const glitchOn =
    m.kind === "imposter" &&
    m.state !== "deny" &&
    prand(Math.floor(t * 6) + m.id * 13) > 0.35;
  const jx = glitchOn ? (prand(Math.floor(t * 10) + m.id * 7) - 0.5) * 3.6 : 0;
  const bob =
    m.state === "walk" || m.state === "bonkback"
      ? Math.sin(t * 6 + m.bobPhase) * 2.2
      : Math.sin(t * 2.5 + m.bobPhase) * 1.2;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(laneX + jx, m.y + bob);
  ctx.scale(s, s);
  ctx.rotate(m.rot);

  // Shadow.
  ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
  ctx.beginPath();
  ctx.ellipse(0, 36, 19, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Feet (little shuffle while walking).
  const step =
    m.state === "walk" || m.state === "bonkback"
      ? Math.sin(t * 9 + m.bobPhase) * 3.5
      : 0;
  ctx.fillStyle = "#2a2140";
  roundRectPath(ctx, -13, 24 + step * 0.4, 11, 9, 4);
  ctx.fill();
  roundRectPath(ctx, 2, 24 - step * 0.4, 11, 9, 4);
  ctx.fill();

  // Body.
  roundRectPath(ctx, -17, -14, 34, 40, 15);
  ctx.fillStyle = m.body;
  ctx.fill();
  ctx.strokeStyle = "rgba(15, 8, 30, 0.5)";
  ctx.lineWidth = 2;
  ctx.stroke();
  // Belly sheen.
  ctx.fillStyle = "rgba(255, 255, 255, 0.14)";
  ctx.beginPath();
  ctx.ellipse(-5, -4, 8, 12, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Arms.
  ctx.fillStyle = m.body;
  for (const ax of [-19, 19]) {
    ctx.beginPath();
    ctx.arc(ax, 4, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Head + hair.
  ctx.beginPath();
  ctx.arc(0, -30, 13, 0, Math.PI * 2);
  ctx.fillStyle = m.skin;
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = m.hair;
  ctx.beginPath();
  ctx.arc(0, -32, 13, Math.PI * 1.05, Math.PI * 1.95);
  ctx.lineTo(0, -38);
  ctx.closePath();
  ctx.fill();

  // Face.
  const pupil = glitchOn ? "#63ffe0" : "#2b2320";
  ctx.fillStyle = pupil;
  ctx.beginPath();
  ctx.arc(-4.5, -30, 1.9, 0, Math.PI * 2);
  ctx.arc(4.5, -30, 1.9, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#2b2320";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(0, -26, 4.5, Math.PI * 0.2, Math.PI * 0.8);
  ctx.stroke();

  if (m.kind === "real") {
    // The glowing gold TEAM BADGE.
    const pulse = 1 + Math.sin(t * 4 + m.bobPhase) * 0.1;
    ctx.save();
    ctx.shadowColor = "#7dffab";
    ctx.shadowBlur = 14 * pulse;
    ctx.fillStyle = "#ffd93d";
    starPath(ctx, 0, 4, 5, 9 * pulse, 4.2 * pulse);
    ctx.fill();
    ctx.strokeStyle = "#b8860b";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.restore();
  } else {
    // No badge: a dark empty chest patch with a faint "?".
    ctx.fillStyle = "rgba(20, 12, 36, 0.85)";
    ctx.beginPath();
    ctx.ellipse(0, 4, 9, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(205, 205, 225, 0.55)";
    ctx.font = `900 12px ${FONT_STACK}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("?", 0, 4);
    // Glitch shimmer bars.
    if (glitchOn) {
      const sy1 = -44 + prand(Math.floor(t * 8) + m.id * 3) * 66;
      const sy2 = -44 + prand(Math.floor(t * 8) + m.id * 5 + 90) * 66;
      ctx.fillStyle = "rgba(80, 255, 240, 0.4)";
      ctx.fillRect(-15, sy1, 40, 4);
      ctx.fillStyle = "rgba(255, 80, 230, 0.4)";
      ctx.fillRect(-25, sy2, 40, 4);
    }
  }

  ctx.restore();
}

/** Adam, the keeper, at his standing line. */
function drawAdam(
  ctx: CanvasRenderingContext2D,
  x: number,
  t: number,
  denyAge: number
) {
  ctx.save();
  ctx.translate(x, KEEPER_Y + Math.sin(t * 2.8) * 1.5);

  // Deny zap ring (green = you blocked correctly).
  if (denyAge >= 0 && denyAge < 0.6) {
    const k = denyAge / 0.6;
    ctx.save();
    ctx.strokeStyle = `rgba(109, 255, 158, ${(0.9 * (1 - k)).toFixed(3)})`;
    ctx.lineWidth = 5;
    ctx.shadowColor = "#6dff9e";
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(0, -6, 42 + k * 30, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Shadow.
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.beginPath();
  ctx.ellipse(0, 42, 26, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Planted legs.
  ctx.fillStyle = "#233a75";
  roundRectPath(ctx, -17, 26, 12, 16, 5);
  ctx.fill();
  roundRectPath(ctx, 5, 26, 12, 16, 5);
  ctx.fill();

  // Goalkeeper arms, stretched wide.
  ctx.strokeStyle = "rgba(12, 20, 50, 0.55)";
  ctx.lineWidth = 2;
  for (const dir of [-1, 1]) {
    ctx.save();
    ctx.translate(dir * 18, -6);
    ctx.rotate(dir * -0.28);
    roundRectPath(ctx, dir === -1 ? -27 : 0, -5, 27, 10, 5);
    ctx.fillStyle = "#3f7bff";
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#ffd9b8";
    ctx.beginPath();
    ctx.arc(dir * 28, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // Body.
  roundRectPath(ctx, -19, -16, 38, 44, 16);
  ctx.fillStyle = "#3f7bff";
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "rgba(255, 255, 255, 0.16)";
  ctx.beginPath();
  ctx.ellipse(-6, -6, 9, 14, 0.3, 0, Math.PI * 2);
  ctx.fill();
  // Belt.
  ctx.fillStyle = "#ffb347";
  ctx.fillRect(-19, 18, 38, 6);

  // Adam's own team badge.
  const pulse = 1 + Math.sin(t * 4) * 0.08;
  ctx.save();
  ctx.shadowColor = "#7dffab";
  ctx.shadowBlur = 12 * pulse;
  ctx.fillStyle = "#ffd93d";
  starPath(ctx, 0, 0, 5, 9.5 * pulse, 4.4 * pulse);
  ctx.fill();
  ctx.strokeStyle = "#b8860b";
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.restore();

  // Head, hair, visor.
  ctx.strokeStyle = "rgba(12, 20, 50, 0.55)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -34, 15, 0, Math.PI * 2);
  ctx.fillStyle = "#ffd9b8";
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#5b3a1e";
  ctx.beginPath();
  ctx.arc(0, -37, 15, Math.PI * 1.05, Math.PI * 1.95);
  ctx.lineTo(0, -44);
  ctx.closePath();
  ctx.fill();
  ctx.save();
  ctx.shadowColor = "#38e1ff";
  ctx.shadowBlur = 8;
  ctx.fillStyle = "rgba(56, 225, 255, 0.9)";
  roundRectPath(ctx, -15, -44, 30, 6, 3);
  ctx.fill();
  ctx.restore();

  // Face.
  ctx.fillStyle = "#2b2320";
  ctx.beginPath();
  ctx.arc(-5, -33, 2.1, 0, Math.PI * 2);
  ctx.arc(5, -33, 2.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#2b2320";
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(0, -29, 5.5, Math.PI * 0.15, Math.PI * 0.85);
  ctx.stroke();

  // Name pill.
  roundRectPath(ctx, -26, -74, 52, 18, 9);
  ctx.fillStyle = "rgba(10, 20, 40, 0.75)";
  ctx.fill();
  ctx.strokeStyle = "rgba(56, 225, 255, 0.6)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = "#7df0ff";
  ctx.font = `800 10.5px ${FONT_STACK}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("ADAM", 0, -64.5);

  ctx.restore();
}

/** Sliding door panels + warm lobby glow when a door is open. */
function drawDoors(ctx: CanvasRenderingContext2D, doorOpen: number[]) {
  for (let i = 0; i < LANES.length; i++) {
    const lane = LANES[i];
    const o = doorOpen[i];
    const left = lane.cx - DOOR_W / 2;
    // Warm party glow spilling out of an open doorway.
    if (o > 0.02) {
      ctx.fillStyle = `rgba(255, 214, 110, ${(0.14 + 0.3 * o).toFixed(3)})`;
      ctx.fillRect(left, 300, DOOR_W, 44);
    }
    // Two sliding panels.
    const panelW = (DOOR_W / 2) * (1 - o);
    if (panelW > 0.5) {
      for (const side of [0, 1]) {
        const px = side === 0 ? left : left + DOOR_W - panelW;
        ctx.fillStyle = "#1c1240";
        ctx.fillRect(px, 300, panelW, 44);
        ctx.strokeStyle = lane.color;
        ctx.globalAlpha = 0.5;
        ctx.lineWidth = 2;
        ctx.strokeRect(px + 1, 301, Math.max(1, panelW - 2), 42);
        ctx.globalAlpha = 1;
        // Porthole window.
        if (panelW > 22) {
          ctx.fillStyle = "rgba(125, 240, 255, 0.2)";
          ctx.beginPath();
          ctx.arc(px + panelW / 2, 318, 7, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }
}

/** Bobbing amber arrow over a returning imposter: "block this one!" */
function drawHintArrow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number
) {
  const bob = Math.sin(t * 5) * 6;
  const ay = y - 66 + bob;
  ctx.save();
  ctx.shadowColor = "#ffb347";
  ctx.shadowBlur = 12;
  ctx.fillStyle = "#ffb347";
  ctx.beginPath();
  ctx.moveTo(x - 13, ay - 14);
  ctx.lineTo(x + 13, ay - 14);
  ctx.lineTo(x, ay + 4);
  ctx.closePath();
  ctx.fill();
  ctx.font = `900 13px ${FONT_STACK}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("BLOCK!", x, ay - 26);
  ctx.restore();
}

/** Speech bubble for a real friend politely waiting behind Adam. */
function drawWaitBubble(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const bx = clamp(x, 90, CANVAS_W - 90);
  const by = y - 104;
  ctx.save();
  roundRectPath(ctx, bx - 78, by, 156, 32, 12);
  ctx.fillStyle = "rgba(255, 255, 255, 0.94)";
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - 7, by + 31);
  ctx.lineTo(x + 7, by + 31);
  ctx.lineTo(x, by + 42);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#2a1548";
  ctx.font = `800 13px ${FONT_STACK}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("My badge! Let me in!", bx, by + 16);
  ctx.restore();
}

/* ─────────────────────── particle spawning ────────────────────── */

function spawnDenySparks(gs: GameState, x: number, y: number) {
  for (let i = 0; i < 18; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 130 + Math.random() * 240;
    const life = 0.45 + Math.random() * 0.3;
    gs.particles.push({
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 60,
      size: 2.6 + Math.random() * 3,
      color: ["#6dff9e", "#b8ffd0", "#7df0ff"][i % 3],
      rot: 0,
      vr: 0,
      life,
      maxLife: life,
      grav: 420,
      shape: "dot",
    });
  }
}

function spawnBonkDust(gs: GameState, x: number, y: number) {
  for (let i = 0; i < 10; i++) {
    const a = Math.PI + Math.random() * Math.PI; // upward fan
    const sp = 60 + Math.random() * 120;
    const life = 0.4 + Math.random() * 0.25;
    gs.particles.push({
      x,
      y,
      vx: Math.cos(a) * sp * 0.6,
      vy: Math.sin(a) * sp,
      size: 3 + Math.random() * 3,
      color: ["#cbbfa6", "#ffd8a6"][i % 2],
      rot: 0,
      vr: 0,
      life,
      maxLife: life,
      grav: 320,
      shape: "dot",
    });
  }
}

function spawnDoorConfetti(gs: GameState, x: number) {
  for (let i = 0; i < 26; i++) {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.9;
    const sp = 120 + Math.random() * 210;
    const life = 0.9 + Math.random() * 0.6;
    gs.particles.push({
      x,
      y: 306,
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

export default function LobbyKeeper({
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
  const [lobbyCount, setLobbyCount] = useState(0);
  const [deniedCount, setDeniedCount] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);
  const [hint, setHint] = useState<{ text: string; color: string }>({
    text: "Drag Adam left and right. Only badge carriers get in!",
    color: "#e7ecff",
  });

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<HTMLCanvasElement | null>(null);
  const fxRef = useRef<HTMLCanvasElement | null>(null);
  const fxCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  const gsRef = useRef<GameState>(makeGameState());
  const phaseRef = useRef<Phase>("intro");
  const draggingRef = useRef(false);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const timersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

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
    fxCtxRef.current = fs.ctx;
    drawScene(ss.ctx);
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

  /* ── game loop ── */
  useEffect(() => {
    let raf = 0;
    let running = true;
    let last = performance.now();

    const spawnNext = (now: number) => {
      const gs = gsRef.current;
      const def = ARRIVALS[gs.spawnIndex];
      gs.movers.push({
        id: gs.spawnIndex,
        kind: def.kind,
        lane: def.lane,
        y: SPAWN_Y,
        xOff: 0,
        vx: 0,
        vy: 0,
        rot: 0,
        alpha: 1,
        state: "walk",
        retry: 0,
        resolved: false,
        bobPhase: Math.random() * Math.PI * 2,
        body: def.body,
        hair: def.hair,
        skin: def.skin,
      });
      gs.spawnIndex++;
      gs.nextSpawnAt = now + 1e9; // re-armed when this arrival resolves
      if (def.kind === "real") {
        setHint(
          gs.seenReal
            ? {
                text: "A glowing badge is coming! Keep that lane clear.",
                color: "#8bffb0",
              }
            : {
                text: "See the glowing badge? That is a real teammate. Let them walk in!",
                color: "#8bffb0",
              }
        );
        gs.seenReal = true;
      } else {
        setHint(
          gs.seenImposter
            ? {
                text: "Another glitchy stranger! Get in the lane and block!",
                color: "#ffd166",
              }
            : {
                text: "No badge... and all glitchy! Slide Adam into that lane to block!",
                color: "#ffd166",
              }
        );
        gs.seenImposter = true;
      }
    };

    const checkWin = () => {
      const gs = gsRef.current;
      if (
        gs.lobby >= TEAMMATES_TOTAL &&
        gs.denied >= IMPOSTERS_TOTAL &&
        !gs.winScheduled
      ) {
        gs.winScheduled = true;
        const t1 = setTimeout(() => {
          audio.unlock();
          setPhase("win");
          setHint({
            text: "Party safe! Only real teammates got in. Game on!",
            color: "#8bffb0",
          });
          spawnWinConfetti(gsRef.current);
          const t2 = setTimeout(() => {
            if (!completedRef.current) {
              completedRef.current = true;
              onCompleteRef.current();
            }
          }, WIN_DELAY_MS);
          timersRef.current.push(t2);
        }, 1000);
        timersRef.current.push(t1);
      }
    };

    const loop = (now: number) => {
      if (!running) return;
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      const t = now / 1000;
      const gs = gsRef.current;
      const currentPhase = phaseRef.current;

      /* Adam glides toward the drag target. */
      gs.adamX += (gs.targetX - gs.adamX) * Math.min(1, dt * 10);
      const adamLane = adamLaneAt(gs.adamX);

      /* Spawning: one arrival at a time, gated on the last resolving. */
      if (
        currentPhase === "play" &&
        gs.spawnIndex < ARRIVALS.length &&
        gs.movers.every((m) => m.resolved) &&
        now >= gs.nextSpawnAt
      ) {
        spawnNext(now);
      }

      /* Mover physics. */
      for (const m of gs.movers) {
        if (m.resolved) continue;
        const laneCx = LANES[m.lane].cx;
        switch (m.state) {
          case "walk": {
            m.y += WALK_SPEED * dt;
            const contact = adamLane === m.lane;
            if (contact && m.y >= BLOCK_Y && m.y <= DOOR_Y - 12) {
              if (m.kind === "imposter") {
                // Green zap: the child correctly blocked an imposter.
                m.state = "deny";
                m.vx =
                  (m.lane === 0 ? -1 : m.lane === 2 ? 1 : Math.random() < 0.5 ? -1 : 1) *
                  340;
                m.vy = -300;
                gs.denyFlashT0 = now;
                gs.denied++;
                setDeniedCount(gs.denied);
                audio.correct();
                spawnDenySparks(gs, laneCx, m.y);
                gs.flares.push({
                  text: "DENIED!",
                  x: laneCx,
                  y: m.y - 26,
                  color: "#6dff9e",
                  size: 30,
                  t0: now,
                });
                setHint({
                  text: "DENIED! Great block, keeper!",
                  color: "#6dff9e",
                });
                checkWin();
              } else if (m.y <= BLOCK_Y + 22) {
                // A real friend never gets zapped. They just wait.
                m.state = "wait";
                setHint({
                  text: "That is a real friend with your badge. Slide aside and let them in!",
                  color: "#7df0ff",
                });
              }
            }
            if (m.state === "walk" && m.y >= DOOR_Y) {
              if (m.kind === "real") {
                m.state = "enter";
              } else {
                // Soft miss: bonk on the inner door, float back, retry.
                m.state = "bonkback";
                m.retry++;
                audio.wrong();
                spawnBonkDust(gs, laneCx, DOOR_Y - 6);
                gs.flares.push({
                  text: "BONK!",
                  x: laneCx,
                  y: DOOR_Y - 40,
                  color: "#ffb347",
                  size: 26,
                  t0: now,
                });
                setHint({
                  text: "It bounced off the door! Follow the arrow and block it this time.",
                  color: "#ffb347",
                });
              }
            }
            break;
          }
          case "wait": {
            if (adamLane !== m.lane) {
              m.state = "walk";
              setHint({
                text: "Badge checked. In they go!",
                color: "#8bffb0",
              });
            }
            break;
          }
          case "bonkback": {
            m.y -= FLOAT_BACK_SPEED * dt;
            if (m.y <= RETRY_Y) {
              m.y = RETRY_Y;
              m.state = "walk";
            }
            break;
          }
          case "deny": {
            m.xOff += m.vx * dt;
            m.y += m.vy * dt;
            m.vy += 500 * dt;
            m.rot += dt * 7;
            m.alpha -= dt * 1.4;
            if (m.alpha <= 0) {
              m.alpha = 0;
              m.resolved = true;
              gs.nextSpawnAt = now + 800;
            }
            break;
          }
          case "enter": {
            m.y += WALK_SPEED * 1.3 * dt;
            if (m.y >= DOOR_Y + 34) {
              m.resolved = true;
              gs.lobby++;
              setLobbyCount(gs.lobby);
              audio.correct();
              spawnDoorConfetti(gs, laneCx);
              gs.flares.push({
                text: "HIGH FIVE!",
                x: laneCx,
                y: 276,
                color: "#8bffb0",
                size: 26,
                t0: now,
              });
              setHint({
                text: "High five! A real teammate is in the lobby.",
                color: "#8bffb0",
              });
              gs.nextSpawnAt = now + 800;
              checkWin();
            }
            break;
          }
        }
      }

      /* Door openness eases toward its target. */
      for (let i = 0; i < LANES.length; i++) {
        const target = gs.movers.some(
          (m) => !m.resolved && m.state === "enter" && m.lane === i
        )
          ? 1
          : 0;
        gs.doorOpen[i] += (target - gs.doorOpen[i]) * Math.min(1, dt * 6);
      }

      /* ── drawing ── */
      const ctx = fxCtxRef.current;
      if (ctx) {
        ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

        // Entering movers go behind the door panels.
        for (const m of gs.movers) {
          if (!m.resolved && m.state === "enter") drawMover(ctx, m, t);
        }
        drawDoors(ctx, gs.doorOpen);

        // Everyone else, far-to-near.
        const rest = gs.movers
          .filter((m) => !m.resolved && m.state !== "enter")
          .sort((a, b) => a.y - b.y);
        for (const m of rest) drawMover(ctx, m, t);

        drawAdam(ctx, gs.adamX, t, (now - gs.denyFlashT0) / 1000);

        // Retry hint arrow + wait bubble.
        for (const m of rest) {
          if (m.kind === "imposter" && m.retry > 0 && m.state !== "deny") {
            drawHintArrow(ctx, LANES[m.lane].cx, m.y, t);
          }
          if (m.state === "wait") {
            drawWaitBubble(ctx, LANES[m.lane].cx, m.y);
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
    // `audio` is a stable memoised facade - including it never re-runs the loop.
  }, [audio]);

  /* ── one horizontal drag input ── */
  const setTargetFromEvent = useCallback(
    (e: { clientX: number; clientY: number }) => {
      const scene = sceneRef.current;
      if (!scene) return;
      const pos = getPointerLogicalPos(scene, e, CANVAS_W, CANVAS_H);
      gsRef.current.targetX = clamp(pos.x, ADAM_MIN_X, ADAM_MAX_X);
    },
    []
  );

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (phaseRef.current !== "play") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    draggingRef.current = true;
    audio.tap(); // one cue per grab - never on pointer move
    setTargetFromEvent(e);
    setHasDragged(true);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    setTargetFromEvent(e);
  };

  const handlePointerUp = () => {
    draggingRef.current = false;
  };

  const startPlay = () => {
    gsRef.current.nextSpawnAt = performance.now() + 700;
    setPhase("play");
  };

  const abs: CSSProperties = {
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
              THE LOBBY KEEPER
            </div>
            <div style={{ fontSize: 13, opacity: 0.75 }}>
              Only badge carriers get into your game.
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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
                TEAM
              </span>
              {Array.from({ length: TEAMMATES_TOTAL }, (_, i) => (
                <PixIcon
                  key={i}
                  emoji="⭐"
                  size={24}
                  style={{
                    filter:
                      i < lobbyCount ? "none" : "grayscale(1) opacity(0.3)",
                  }}
                />
              ))}
            </div>
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
                  color: "#7df0ff",
                }}
              >
                BLOCKED
              </span>
              {Array.from({ length: IMPOSTERS_TOTAL }, (_, i) => (
                <PixIcon
                  key={i}
                  emoji="🚫"
                  size={24}
                  style={{
                    filter:
                      i < deniedCount ? "none" : "grayscale(1) opacity(0.3)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Lobby stage ── */}
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
            cursor: phase === "play" ? "grab" : "default",
            boxShadow:
              "inset 0 0 24px rgba(0, 0, 0, 0.45), 0 0 0 2px rgba(255, 93, 241, 0.2)",
          }}
        >
          <canvas ref={sceneRef} style={abs} />
          <canvas ref={fxRef} style={{ ...abs, pointerEvents: "none" }} />

          {/* Pulsing left-right drag hint until the first touch */}
          <AnimatePresence>
            {phase === "play" && !hasDragged && (
              <motion.div
                key="drag-hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, x: [-46, 46, -46] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "60%",
                  marginLeft: -30,
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  background: "rgba(125, 240, 255, 0.22)",
                  border: "3px dashed rgba(125, 240, 255, 0.8)",
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
                  top: "9%",
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
                PARTY SAFE!
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
                  touchAction: "pan-y",
                  textAlign: "center",
                  padding: 24,
                  zIndex: 8,
                  background:
                    "radial-gradient(circle at 50% 30%, rgba(60, 30, 100, 0.9) 0%, rgba(18, 10, 40, 0.95) 75%)",
                }}
              >
                {/* margin:auto wrapper = centred when it fits, top-anchored +
                    scrollable when it doesn't (never clips the start button). */}
                <div
                  style={{
                    margin: "auto",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 12,
                    width: "100%",
                  }}
                >
                  <PixIcon emoji="🎮" size={52} />
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#ffd166" }}>
                    Game night at Adam&apos;s lobby!
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      lineHeight: 1.5,
                      maxWidth: 460,
                      opacity: 0.92,
                    }}
                  >
                    Real teammates carry your glowing gold team badge. Glitchy
                    strangers with NO badge want to sneak in. Drag Adam left and
                    right like a goalkeeper: block the glitchy ones, step aside
                    for your friends!
                  </div>
                  {narration && narration.lines.length > 0 && (
                    <div style={{ width: "100%", maxWidth: 460, textAlign: "left" }}>
                      <InfoNarration lines={narration.lines} accent={accent ?? "#ff3cb4"} />
                    </div>
                  )}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startPlay}
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
                    Start guarding!
                  </motion.button>
                </div>
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
            color: hint.color,
          }}
        >
          {phase !== "intro" ? hint.text : ""}
        </div>

        {/* ── Teach zone ── */}
        <div style={{ minHeight: 96, position: "relative" }}>
          <AnimatePresence>
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
                  Lobby full of real friends. Game on!
                  <PixIcon emoji="⭐" size={24} />
                </div>
                {[
                  "You are the bouncer of your own game lobby.",
                  "Check the badge first: do I actually KNOW this player?",
                  "No badge? No entry. Block them, and tell a grown-up if a stranger keeps knocking.",
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
