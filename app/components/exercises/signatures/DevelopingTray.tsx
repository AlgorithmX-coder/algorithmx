"use client";

/*
 * THE DEVELOPING TRAY - Week 8 signature exercise (Photos & Videos).
 *
 * Darkroom fantasy: a blank photo sits in a developer tray. The child
 * RUBS it (drag) and the picture is revealed under their fingertip via
 * a scratch-off (destination-out) cover layer over a canvas-drawn
 * illustration. SHARE and KEEP stay locked until the photo is fully
 * developed - "you can't share what you haven't looked at" is the whole
 * lesson. The drawn photo hides three leaks around the edges (house
 * number, school pennant, a friend who never said yes), so the right
 * verdict is KEEP. Choosing SHARE triggers a forgiving red-wash teach
 * beat, then the child keeps it anyway. No timer, no losable state.
 *
 * Canvas stack (all hi-DPI via setupHiDpiCanvas, logical 720x460):
 *   photo  (bottom)  - the illustration, drawn once
 *   cover  (middle)  - developer film, erased by scrub stamps
 *   fx     (top)     - flash / red leak rings / confetti, rAF loop
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

/* ────────────────────────── constants ────────────────────────── */

const CANVAS_W = 720;
const CANVAS_H = 460;
const PHOTO_MARGIN = 12; // white photo-paper border inside the canvas

const BRUSH_R = 46; // generous fingertip for small hands
const STAMP_STEP = BRUSH_R * 0.35; // stroke interpolation step

// Coverage grid for the "how developed is it" percentage.
const GRID_X = 30;
const GRID_Y = 20;
const CELL_W = CANVAS_W / GRID_X;
const CELL_H = CANVAS_H / GRID_Y;
const TOTAL_CELLS = GRID_X * GRID_Y;
// Forgiving: at 95% real coverage a warm "developing surge" clears the
// last slivers so kids never grind the final corners.
const SURGE_AT = 0.95;

const WIN_DELAY_MS = 2600;

const CONFETTI_COLORS = [
  "#ffd166",
  "#7df0ff",
  "#ff6b6b",
  "#8bffb0",
  "#c9a7ff",
  "#fff3d6",
];

const FONT_STACK = "'Fredoka', 'Quicksand', ui-rounded, system-ui, sans-serif";

type Phase = "intro" | "develop" | "verdict" | "teach" | "win";

interface Stamp {
  x: number;
  y: number;
  r: number;
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

type FxMode = "none" | "flash" | "leaks" | "confetti";

interface FxState {
  mode: FxMode;
  modeStart: number;
  particles: Particle[];
}

interface Leak {
  id: string;
  /** Ring drawn on the fx canvas during the red-wash teach beat. */
  ring: { x: number; y: number; w: number; h: number };
  /** DOM callout chip over the photo (percent coords + placement). */
  chip: string;
  chipLeftPct: number;
  chipTopPct: number;
  /** Bullet line in the teach panel. */
  bullet: string;
  icon: string;
}

const LEAKS: Leak[] = [
  {
    id: "house",
    ring: { x: 38, y: 184, w: 92, h: 66 },
    chip: "Your house number!",
    chipLeftPct: ((38 + 46) / CANVAS_W) * 100,
    chipTopPct: ((184 + 66 + 10) / CANVAS_H) * 100,
    bullet: "Your house number 42 is right there on the door",
    icon: "🏠",
  },
  {
    id: "school",
    ring: { x: 534, y: 22, w: 180, h: 92 },
    chip: "Your school name!",
    chipLeftPct: ((534 + 90) / CANVAS_W) * 100,
    chipTopPct: ((22 + 92 + 10) / CANVAS_H) * 100,
    bullet: "Your school name is on the wall pennant",
    icon: "🏫",
  },
  {
    id: "friend",
    ring: { x: 572, y: 302, w: 140, h: 150 },
    chip: "No YES from your friend!",
    chipLeftPct: ((572 + 70) / CANVAS_W) * 100,
    chipTopPct: ((302 - 34) / CANVAS_H) * 100,
    bullet: "Your friend is in the photo, and they never said YES",
    icon: "🙋",
  },
];

/* ────────────────────── canvas draw helpers ───────────────────── */

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

/** Deterministic 0..1 noise so the cover blotches are stable across redraws. */
function prand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** The "photo": a kid with a trophy in the center, leaks around the edges. */
function drawPhotoScene(ctx: CanvasRenderingContext2D) {
  const W = CANVAS_W;
  const H = CANVAS_H;
  const M = PHOTO_MARGIN;

  ctx.clearRect(0, 0, W, H);

  // Photo paper (white border all around).
  ctx.fillStyle = "#f7f3ea";
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  roundRectPath(ctx, M, M, W - M * 2, H - M * 2, 10);
  ctx.clip();

  // ── Party wall + floor ──
  const wall = ctx.createLinearGradient(0, M, 0, H);
  wall.addColorStop(0, "#ffe9c6");
  wall.addColorStop(1, "#ffd8a2");
  ctx.fillStyle = wall;
  ctx.fillRect(M, M, W - M * 2, H - M * 2);

  ctx.fillStyle = "#c98d5e";
  ctx.fillRect(M, 374, W - M * 2, H - 374 - M);
  ctx.strokeStyle = "rgba(122, 76, 40, 0.35)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    const fx = M + 40 + i * 118;
    ctx.beginPath();
    ctx.moveTo(fx, 380);
    ctx.lineTo(fx - 26, H - M);
    ctx.stroke();
  }

  // ── Bunting across the top ──
  ctx.strokeStyle = "rgba(122, 76, 40, 0.55)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(M, 44);
  ctx.quadraticCurveTo(300, 92, 520, 52);
  ctx.stroke();
  const buntingColors = ["#ff6b6b", "#ffd166", "#7dd9ff", "#8bffb0", "#c9a7ff"];
  for (let i = 0; i < 9; i++) {
    const t = 0.06 + i * 0.105;
    const bx =
      (1 - t) * (1 - t) * M + 2 * (1 - t) * t * 300 + t * t * 520;
    const by = (1 - t) * (1 - t) * 44 + 2 * (1 - t) * t * 92 + t * t * 52;
    ctx.fillStyle = buntingColors[i % buntingColors.length];
    ctx.beginPath();
    ctx.moveTo(bx - 13, by);
    ctx.lineTo(bx + 13, by);
    ctx.lineTo(bx, by + 26);
    ctx.closePath();
    ctx.fill();
  }

  // ── LEAK 1: front door with the house number 42 (left edge) ──
  ctx.fillStyle = "#7a5230";
  ctx.fillRect(24, 134, 122, 300);
  ctx.fillStyle = "#3f5f8f";
  ctx.strokeStyle = "#2c4468";
  ctx.lineWidth = 3;
  roundRectPath(ctx, 34, 144, 102, 290, 6);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
  ctx.lineWidth = 2.5;
  roundRectPath(ctx, 48, 262, 74, 74, 6);
  ctx.stroke();
  roundRectPath(ctx, 48, 352, 74, 66, 6);
  ctx.stroke();
  ctx.fillStyle = "#ffd76e";
  ctx.beginPath();
  ctx.arc(124, 306, 5.5, 0, Math.PI * 2);
  ctx.fill();
  // Brass number plaque - the readable leak.
  roundRectPath(ctx, 52, 194, 66, 46, 8);
  ctx.fillStyle = "#f9e9b5";
  ctx.fill();
  ctx.strokeStyle = "#b48a3c";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "#4a3411";
  ctx.font = `800 30px ${FONT_STACK}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("42", 85, 219);

  // ── LEAK 2: school pennant (top-right wall) ──
  ctx.strokeStyle = "#8a6a4a";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(548, 26);
  ctx.lineTo(548, 112);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(552, 34);
  ctx.lineTo(704, 68);
  ctx.lineTo(552, 102);
  ctx.closePath();
  ctx.fillStyle = "#2f7d4f";
  ctx.fill();
  ctx.strokeStyle = "#245f3c";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "#eaf6ee";
  ctx.textAlign = "left";
  ctx.font = `800 16px ${FONT_STACK}`;
  ctx.fillText("OAKWOOD", 562, 62);
  ctx.font = `700 13px ${FONT_STACK}`;
  ctx.fillText("SCHOOL", 562, 82);

  // ── LEAK 3: friend peeking in the bottom-right corner ──
  // Jumper (school green, matching the pennant).
  roundRectPath(ctx, 582, 392, 130, 62, 26);
  ctx.fillStyle = "#2e8b57";
  ctx.fill();
  ctx.strokeStyle = "#1f5c3c";
  ctx.lineWidth = 3;
  ctx.stroke();
  // Collar.
  ctx.fillStyle = "#eab98d";
  ctx.beginPath();
  ctx.ellipse(646, 396, 22, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  // Head.
  ctx.fillStyle = "#eab98d";
  ctx.beginPath();
  ctx.arc(646, 352, 42, 0, Math.PI * 2);
  ctx.fill();
  // Short dark hair cap.
  ctx.fillStyle = "#2f2a26";
  ctx.beginPath();
  ctx.arc(646, 348, 43, Math.PI * 1.02, Math.PI * 1.98);
  ctx.closePath();
  ctx.fill();
  // Uncertain face: raised brows, dot eyes, wobbly flat mouth.
  ctx.strokeStyle = "#3a2c20";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(624, 336);
  ctx.lineTo(638, 332);
  ctx.moveTo(654, 332);
  ctx.lineTo(668, 336);
  ctx.stroke();
  ctx.fillStyle = "#2b2320";
  ctx.beginPath();
  ctx.arc(632, 348, 4.2, 0, Math.PI * 2);
  ctx.arc(660, 348, 4.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#3a2c20";
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(632, 370);
  ctx.quadraticCurveTo(646, 365, 660, 370);
  ctx.stroke();
  // Tiny school crest on the jumper.
  roundRectPath(ctx, 634, 416, 24, 26, 5);
  ctx.fillStyle = "#f4e9c9";
  ctx.fill();
  ctx.strokeStyle = "#1f5c3c";
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.fillStyle = "#1f5c3c";
  ctx.font = `800 13px ${FONT_STACK}`;
  ctx.textAlign = "center";
  ctx.fillText("O", 646, 430);
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.font = `700 10px ${FONT_STACK}`;
  ctx.fillText("OAKWOOD", 685, 448);

  // ── Center: the kid with the trophy (the fun bit, revealed first) ──
  // Trophy glow.
  const glow = ctx.createRadialGradient(360, 108, 8, 360, 108, 86);
  glow.addColorStop(0, "rgba(255, 210, 80, 0.4)");
  glow.addColorStop(1, "rgba(255, 210, 80, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(360, 108, 86, 0, Math.PI * 2);
  ctx.fill();

  // Legs + shoes.
  ctx.fillStyle = "#3b6ea5";
  roundRectPath(ctx, 334, 326, 20, 62, 8);
  ctx.fill();
  roundRectPath(ctx, 366, 326, 20, 62, 8);
  ctx.fill();
  ctx.fillStyle = "#2b2320";
  roundRectPath(ctx, 328, 384, 30, 14, 7);
  ctx.fill();
  roundRectPath(ctx, 362, 384, 30, 14, 7);
  ctx.fill();

  // Arms up to the trophy.
  ctx.strokeStyle = "#ffcf9f";
  ctx.lineCap = "round";
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.moveTo(328, 258);
  ctx.quadraticCurveTo(312, 190, 326, 128);
  ctx.moveTo(392, 258);
  ctx.quadraticCurveTo(408, 190, 394, 128);
  ctx.stroke();

  // Torso (bright tee).
  roundRectPath(ctx, 315, 236, 90, 98, 24);
  ctx.fillStyle = "#ff6b6b";
  ctx.fill();
  ctx.strokeStyle = "#d94f4f";
  ctx.lineWidth = 3;
  ctx.stroke();
  starPath(ctx, 360, 284, 5, 16, 7);
  ctx.fillStyle = "#fff3d6";
  ctx.fill();

  // Head + hair + happy face.
  ctx.fillStyle = "#ffcf9f";
  ctx.beginPath();
  ctx.arc(360, 190, 46, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#5b3a1e";
  ctx.beginPath();
  ctx.arc(360, 184, 47, Math.PI * 1.05, Math.PI * 1.95);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#2b2320";
  ctx.beginPath();
  ctx.arc(346, 186, 4.6, 0, Math.PI * 2);
  ctx.arc(374, 186, 4.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#a3502e";
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(360, 198, 15, Math.PI * 0.15, Math.PI * 0.85);
  ctx.stroke();
  ctx.fillStyle = "rgba(255, 140, 120, 0.5)";
  ctx.beginPath();
  ctx.arc(332, 202, 6, 0, Math.PI * 2);
  ctx.arc(388, 202, 6, 0, Math.PI * 2);
  ctx.fill();

  // Trophy.
  ctx.fillStyle = "#ffc93c";
  ctx.strokeStyle = "#d99a1a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(330, 76);
  ctx.lineTo(390, 76);
  ctx.quadraticCurveTo(388, 112, 360, 120);
  ctx.quadraticCurveTo(332, 112, 330, 76);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(324, 88, 12, Math.PI * 0.4, Math.PI * 1.6);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(396, 88, 12, Math.PI * 1.4, Math.PI * 0.6);
  ctx.stroke();
  ctx.fillStyle = "#ffc93c";
  ctx.fillRect(353, 118, 14, 14);
  roundRectPath(ctx, 338, 132, 44, 12, 5);
  ctx.fill();
  ctx.stroke();
  starPath(ctx, 360, 94, 5, 11, 4.5);
  ctx.fillStyle = "#fff6d8";
  ctx.fill();

  // Hands over the trophy handles.
  ctx.fillStyle = "#ffcf9f";
  ctx.beginPath();
  ctx.arc(324, 118, 11, 0, Math.PI * 2);
  ctx.arc(396, 118, 11, 0, Math.PI * 2);
  ctx.fill();

  // Confetti flecks in the air around the middle.
  for (let i = 0; i < 16; i++) {
    const cx = 200 + prand(i * 3 + 1) * 320;
    const cy = 70 + prand(i * 3 + 2) * 210;
    // Keep flecks off the leaks so they stay legible.
    if (cx > 520 && cy < 130) continue;
    ctx.fillStyle = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(prand(i * 7 + 3) * Math.PI);
    ctx.fillRect(-4, -2.5, 8, 5);
    ctx.restore();
  }

  // Soft photo vignette so it reads as a printed picture.
  const vig = ctx.createRadialGradient(
    W / 2,
    H / 2,
    H * 0.35,
    W / 2,
    H / 2,
    H * 0.72
  );
  vig.addColorStop(0, "rgba(90, 60, 20, 0)");
  vig.addColorStop(1, "rgba(90, 60, 20, 0.18)");
  ctx.fillStyle = vig;
  ctx.fillRect(M, M, W - M * 2, H - M * 2);

  ctx.restore();
}

/** The undeveloped "film": milky chemical wash hiding the photo. */
function drawCoverScene(ctx: CanvasRenderingContext2D) {
  const W = CANVAS_W;
  const H = CANVAS_H;

  ctx.clearRect(0, 0, W, H);
  const base = ctx.createLinearGradient(0, 0, 0, H);
  base.addColorStop(0, "#ded4c2");
  base.addColorStop(1, "#c6baa4");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, W, H);

  // Chemical blotches (stable pseudo-random).
  for (let i = 0; i < 26; i++) {
    const bx = prand(i * 5 + 11) * W;
    const by = prand(i * 5 + 12) * H;
    const br = 26 + prand(i * 5 + 13) * 56;
    ctx.fillStyle =
      i % 2 === 0 ? "rgba(120, 105, 80, 0.07)" : "rgba(255, 255, 255, 0.07)";
    ctx.beginPath();
    ctx.ellipse(bx, by, br, br * 0.7, prand(i * 5 + 14) * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  // Diagonal liquid sheen.
  const sheen = ctx.createLinearGradient(0, 0, W, H);
  sheen.addColorStop(0.32, "rgba(255, 255, 255, 0)");
  sheen.addColorStop(0.5, "rgba(255, 255, 255, 0.1)");
  sheen.addColorStop(0.68, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, W, H);

  // Edge darkening so the film reads as paper sitting in fluid.
  ctx.strokeStyle = "rgba(90, 75, 55, 0.35)";
  ctx.lineWidth = 10;
  roundRectPath(ctx, 3, 3, W - 6, H - 6, 12);
  ctx.stroke();

  // Faint stamped hint on the film itself.
  ctx.fillStyle = "rgba(90, 75, 55, 0.4)";
  ctx.font = `800 27px ${FONT_STACK}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("RUB TO DEVELOP", W / 2, H / 2 - 12);
  ctx.font = `700 16px ${FONT_STACK}`;
  ctx.fillStyle = "rgba(90, 75, 55, 0.32)";
  ctx.fillText("every corner counts", W / 2, H / 2 + 22);
}

/** Soft-edged eraser stamp on the cover layer. */
function drawStamp(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number
) {
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  const g = ctx.createRadialGradient(x, y, r * 0.35, x, y, r);
  g.addColorStop(0, "rgba(0, 0, 0, 1)");
  g.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/* ─────────────────────────── component ────────────────────────── */

export default function DevelopingTray({
  onComplete,
  narration,
  accent,
}: {
  onComplete: () => void;
  narration?: { speaker?: "adam" | "layla"; lines: string[] };
  accent?: string;
}) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [percent, setPercent] = useState(0);
  const [nudge, setNudge] = useState(0);
  const [showLockTip, setShowLockTip] = useState(false);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const photoRef = useRef<HTMLCanvasElement | null>(null);
  const coverRef = useRef<HTMLCanvasElement | null>(null);
  const fxRef = useRef<HTMLCanvasElement | null>(null);
  const coverCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const fxCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  const stampsRef = useRef<Stamp[]>([]);
  const cellsRef = useRef<Uint8Array>(new Uint8Array(TOTAL_CELLS));
  const scrubCountRef = useRef(0);
  const lastPctRef = useRef(0);
  const surgedRef = useRef(false);
  const scrubbingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  const fxStateRef = useRef<FxState>({
    mode: "none",
    modeStart: 0,
    particles: [],
  });

  const completedRef = useRef(false);
  const surgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const winTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── canvas setup (and re-setup on resize, replaying scrub strokes) ── */
  const setupCanvases = useCallback(() => {
    const photo = photoRef.current;
    const cover = coverRef.current;
    const fx = fxRef.current;
    if (!photo || !cover || !fx) return;

    const ps = setupHiDpiCanvas(photo, {
      logicalWidth: CANVAS_W,
      logicalHeight: CANVAS_H,
      maxDpr: 2,
    });
    const cs = setupHiDpiCanvas(cover, {
      logicalWidth: CANVAS_W,
      logicalHeight: CANVAS_H,
      maxDpr: 2,
    });
    const fs = setupHiDpiCanvas(fx, {
      logicalWidth: CANVAS_W,
      logicalHeight: CANVAS_H,
      maxDpr: 2,
    });
    if (!ps || !cs || !fs) return;

    coverCtxRef.current = cs.ctx;
    fxCtxRef.current = fs.ctx;

    drawPhotoScene(ps.ctx);
    if (surgedRef.current) {
      // Fully developed: the cover stays cleared (its element opacity is 0).
      cs.ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    } else {
      drawCoverScene(cs.ctx);
      for (const s of stampsRef.current) drawStamp(cs.ctx, s.x, s.y, s.r);
    }
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

  /* ── fx render loop (flash / leak rings / confetti) ── */
  useEffect(() => {
    let raf = 0;
    let running = true;
    let lastNow = performance.now();

    const loop = (now: number) => {
      if (!running) return;
      const dt = Math.min(0.05, (now - lastNow) / 1000);
      lastNow = now;
      const ctx = fxCtxRef.current;
      const st = fxStateRef.current;
      if (ctx) {
        ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
        if (st.mode === "flash") {
          const t = now - st.modeStart;
          if (t > 750) {
            st.mode = "none";
          } else {
            const a = 0.55 * (1 - t / 750);
            ctx.fillStyle = `rgba(255, 243, 214, ${a.toFixed(3)})`;
            ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
          }
        } else if (st.mode === "leaks") {
          const pulse = Math.sin(now / 280);
          ctx.fillStyle = `rgba(255, 60, 60, ${(0.14 + 0.06 * pulse).toFixed(3)})`;
          ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
          ctx.strokeStyle = "rgba(255, 82, 82, 0.95)";
          ctx.lineWidth = 4.5 + 1.5 * pulse;
          for (const leak of LEAKS) {
            roundRectPath(
              ctx,
              leak.ring.x,
              leak.ring.y,
              leak.ring.w,
              leak.ring.h,
              14
            );
            ctx.stroke();
          }
        } else if (st.mode === "confetti") {
          const alive: Particle[] = [];
          for (const p of st.particles) {
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
          }
          for (const p of st.particles) {
            if (p.life > 0 && p.y <= CANVAS_H + 30) alive.push(p);
          }
          st.particles = alive;
          if (alive.length === 0) st.mode = "none";
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
    };
  }, []);

  /* ── timers cleanup ── */
  useEffect(() => {
    return () => {
      if (surgeTimerRef.current) clearTimeout(surgeTimerRef.current);
      if (winTimerRef.current) clearTimeout(winTimerRef.current);
      if (tipTimerRef.current) clearTimeout(tipTimerRef.current);
    };
  }, []);

  /* ── scrub mechanics ── */
  const markCells = useCallback((x: number, y: number, r: number) => {
    const reach = r * 0.8;
    const minI = Math.max(0, Math.floor((x - reach) / CELL_W));
    const maxI = Math.min(GRID_X - 1, Math.floor((x + reach) / CELL_W));
    const minJ = Math.max(0, Math.floor((y - reach) / CELL_H));
    const maxJ = Math.min(GRID_Y - 1, Math.floor((y + reach) / CELL_H));
    const cells = cellsRef.current;
    for (let j = minJ; j <= maxJ; j++) {
      for (let i = minI; i <= maxI; i++) {
        const idx = j * GRID_X + i;
        if (cells[idx]) continue;
        const cx = (i + 0.5) * CELL_W;
        const cy = (j + 0.5) * CELL_H;
        const dx = cx - x;
        const dy = cy - y;
        if (dx * dx + dy * dy <= reach * reach) {
          cells[idx] = 1;
          scrubCountRef.current++;
        }
      }
    }
  }, []);

  const triggerSurge = useCallback(() => {
    if (surgedRef.current) return;
    surgedRef.current = true;
    setPercent(100);
    // Warm developer flash while the last slivers fade out.
    fxStateRef.current.mode = "flash";
    fxStateRef.current.modeStart = performance.now();
    const cover = coverRef.current;
    if (cover) {
      cover.style.transition = "opacity 750ms ease";
      cover.style.opacity = "0";
    }
    surgeTimerRef.current = setTimeout(() => {
      setPhase("verdict");
    }, 800);
  }, []);

  const stampAt = useCallback(
    (x: number, y: number) => {
      const ctx = coverCtxRef.current;
      if (!ctx || surgedRef.current) return;
      drawStamp(ctx, x, y, BRUSH_R);
      stampsRef.current.push({ x, y, r: BRUSH_R });
      markCells(x, y, BRUSH_R);
      const p = scrubCountRef.current / TOTAL_CELLS;
      // Display caps at 99 until the surge declares 100.
      const shown = Math.min(99, Math.round(p * 100));
      if (shown !== lastPctRef.current) {
        lastPctRef.current = shown;
        setPercent(shown);
      }
      if (p >= SURGE_AT) triggerSurge();
    },
    [markCells, triggerSurge]
  );

  const pointerToLogical = useCallback(
    (e: { clientX: number; clientY: number }) => {
      const cover = coverRef.current;
      if (!cover) return null;
      return getPointerLogicalPos(cover, e, CANVAS_W, CANVAS_H);
    },
    []
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (phase !== "develop") return;
    const pos = pointerToLogical(e);
    if (!pos) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    scrubbingRef.current = true;
    lastPosRef.current = pos;
    stampAt(pos.x, pos.y);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!scrubbingRef.current || phase !== "develop") return;
    const pos = pointerToLogical(e);
    if (!pos) return;
    const last = lastPosRef.current ?? pos;
    const dx = pos.x - last.x;
    const dy = pos.y - last.y;
    const dist = Math.hypot(dx, dy);
    const steps = Math.max(1, Math.floor(dist / STAMP_STEP));
    for (let s = 1; s <= steps; s++) {
      stampAt(last.x + (dx * s) / steps, last.y + (dy * s) / steps);
      if (surgedRef.current) break;
    }
    lastPosRef.current = pos;
  };

  const endScrub = () => {
    scrubbingRef.current = false;
    lastPosRef.current = null;
  };

  /* ── verdict mechanics ── */
  const unlocked = phase === "verdict" || phase === "teach";

  const handleLockedPress = () => {
    setNudge((n) => n + 1);
    setShowLockTip(true);
    if (tipTimerRef.current) clearTimeout(tipTimerRef.current);
    tipTimerRef.current = setTimeout(() => setShowLockTip(false), 1600);
  };

  const win = useCallback(() => {
    setPhase("win");
    const st = fxStateRef.current;
    st.mode = "confetti";
    st.modeStart = performance.now();
    st.particles = [];
    for (let i = 0; i < 110; i++) {
      st.particles.push({
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
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete();
      }
    }, WIN_DELAY_MS);
  }, [onComplete]);

  const handleShare = () => {
    if (phase !== "verdict") return;
    setPhase("teach");
    fxStateRef.current.mode = "leaks";
    fxStateRef.current.modeStart = performance.now();
  };

  const handleKeep = () => {
    if (phase !== "verdict" && phase !== "teach") return;
    win();
  };

  /* ── copy per phase ── */
  const hintText =
    phase === "develop"
      ? percent < 55
        ? "Rub the photo with your finger to develop it!"
        : "Great rubbing! Now get the edges and corners."
      : phase === "verdict"
        ? "Fully developed! LOOK at the whole photo, then choose."
        : phase === "teach"
          ? "Look at everything the photo gives away..."
          : phase === "win"
            ? "Photo kept safe. Hero move!"
            : "A fresh photo is in the tray.";

  /* ────────────────────────── render ────────────────────────── */
  return (
    <ExerciseFrame padding={24} touchActionNone>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          maxWidth: 860,
          margin: "0 auto",
        }}
      >
        {/* ── Darkroom header ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <motion.div
            aria-hidden
            animate={{ opacity: [0.55, 1, 0.55] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "radial-gradient(circle, #ff5a5a 0%, #a11515 70%)",
              boxShadow: "0 0 16px 5px rgba(255, 70, 70, 0.5)",
              flexShrink: 0,
            }}
          />
          <div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: 1.5,
                color: "#ffd9c4",
                textShadow: "0 0 18px rgba(255, 90, 90, 0.35)",
              }}
            >
              THE DEVELOPING TRAY
            </div>
            <div style={{ fontSize: 13, opacity: 0.75 }}>
              Darkroom rule: look at the WHOLE photo before you decide.
            </div>
          </div>
        </div>

        {/* ── The tray ── */}
        <div
          style={{
            position: "relative",
            borderRadius: 20,
            padding: 14,
            background:
              "linear-gradient(180deg, #34161a 0%, #23090d 60%, #1a070a 100%)",
            boxShadow:
              "inset 0 4px 14px rgba(0, 0, 0, 0.6), 0 8px 24px rgba(0, 0, 0, 0.35), 0 0 0 2px rgba(255, 120, 90, 0.14)",
          }}
        >
          {/* Canvas stack */}
          <div
            ref={wrapRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endScrub}
            onPointerCancel={endScrub}
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: `${CANVAS_W} / ${CANVAS_H}`,
              borderRadius: 12,
              overflow: "hidden",
              touchAction: "none",
              cursor: phase === "develop" ? "pointer" : "default",
              boxShadow: "inset 0 0 22px rgba(0, 0, 0, 0.45)",
            }}
          >
            <canvas
              ref={photoRef}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                display: "block",
              }}
            />
            <canvas
              ref={coverRef}
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
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                display: "block",
                pointerEvents: "none",
              }}
            />

            {/* Pulsing "rub here" pointer until the first strokes land */}
            <AnimatePresence>
              {phase === "develop" && percent < 4 && (
                <motion.div
                  key="rub-hint"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    x: [0, 42, -42, 0],
                    y: [0, -26, 26, 0],
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 2.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "56%",
                    marginLeft: -34,
                    marginTop: -34,
                    width: 68,
                    height: 68,
                    borderRadius: "50%",
                    background: "rgba(255, 214, 110, 0.28)",
                    border: "3px dashed rgba(255, 214, 110, 0.8)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none",
                  }}
                >
                  <PixIcon emoji="👆" size={38} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Leak callout chips during the red-wash teach beat */}
            <AnimatePresence>
              {phase === "teach" &&
                LEAKS.map((leak, i) => (
                  <motion.div
                    key={leak.id}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: 0.15 + i * 0.18, type: "spring" }}
                    style={{
                      position: "absolute",
                      left: `${leak.chipLeftPct}%`,
                      top: `${leak.chipTopPct}%`,
                      transform: "translateX(-50%)",
                      background: "#c92a2a",
                      color: "#fff",
                      fontSize: 12.5,
                      fontWeight: 800,
                      padding: "5px 10px",
                      borderRadius: 999,
                      whiteSpace: "nowrap",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
                      pointerEvents: "none",
                    }}
                  >
                    {leak.chip}
                  </motion.div>
                ))}
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
                    // "safe center" + internal scrolling: the spoken-instruction
                    // block makes the intro taller, so on short viewports the
                    // overlay scrolls and the start button stays reachable
                    // (never clipped by a centered overflow).
                    justifyContent: "safe center",
                    overflowY: "auto",
                    gap: 14,
                    textAlign: "center",
                    padding: 24,
                    background:
                      "radial-gradient(circle at 50% 30%, rgba(90, 20, 20, 0.88) 0%, rgba(26, 7, 10, 0.94) 75%)",
                  }}
                >
                  <PixIcon emoji="👆" size={54} />
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 800,
                      color: "#ffd9c4",
                    }}
                  >
                    Develop the photo!
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      lineHeight: 1.5,
                      maxWidth: 420,
                      opacity: 0.9,
                    }}
                  >
                    A new photo is in the tray. RUB it with your finger to
                    reveal the picture. A cyber hero looks at the WHOLE photo
                    before deciding what to do with it.
                  </div>
                  {narration && narration.lines.length > 0 && (
                    <div
                      style={{ width: "100%", maxWidth: 480, textAlign: "left" }}
                    >
                      <InfoNarration
                        lines={narration.lines}
                        accent={accent ?? "#ff6b3d"}
                      />
                    </div>
                  )}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPhase("develop")}
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
                    Start developing
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Win overlay: photo drops into the green private drawer */}
            <AnimatePresence>
              {phase === "win" && (
                <motion.div
                  key="win"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                  }}
                >
                  {/* SAFE badge pop */}
                  <motion.div
                    initial={{ scale: 0, rotate: -12 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 420,
                      damping: 18,
                      delay: 0.5,
                    }}
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "26%",
                      transform: "translate(-50%, -50%)",
                      marginLeft: -70,
                      width: 140,
                      textAlign: "center",
                      background:
                        "linear-gradient(180deg, #2ecc71 0%, #1f8a4c 100%)",
                      color: "#ffffff",
                      fontSize: 30,
                      fontWeight: 900,
                      letterSpacing: 2,
                      padding: "12px 0",
                      borderRadius: 20,
                      boxShadow: "0 10px 26px rgba(20, 90, 50, 0.55)",
                      border: "3px solid rgba(255, 255, 255, 0.75)",
                    }}
                  >
                    SAFE!
                  </motion.div>

                  {/* Drawer slides up and clunks shut over the lower photo */}
                  <motion.div
                    initial={{ y: "120%" }}
                    animate={{ y: 0 }}
                    transition={{ type: "spring", stiffness: 480, damping: 26 }}
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: 0,
                      height: "42%",
                      background:
                        "linear-gradient(180deg, #1f8a4c 0%, #14663a 100%)",
                      borderTop: "5px solid #2ecc71",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <motion.div
                      animate={{ x: [0, -6, 6, -4, 4, 0] }}
                      transition={{ delay: 0.32, duration: 0.4 }}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      {/* Drawer handle */}
                      <div
                        style={{
                          width: 84,
                          height: 10,
                          borderRadius: 999,
                          background: "rgba(255, 255, 255, 0.55)",
                          boxShadow: "inset 0 2px 3px rgba(0, 0, 0, 0.3)",
                        }}
                      />
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          fontSize: 21,
                          fontWeight: 900,
                          letterSpacing: 1.5,
                          color: "#ffffff",
                        }}
                      >
                        <PixIcon emoji="🔒" size={26} />
                        KEPT PRIVATE!
                      </div>
                      <div
                        style={{
                          fontSize: 13.5,
                          maxWidth: 460,
                          textAlign: "center",
                          color: "rgba(255, 255, 255, 0.92)",
                          lineHeight: 1.45,
                          padding: "0 16px",
                        }}
                      >
                        House number, school name, and a friend without a YES.
                        Keeping this photo private was the hero move!
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Developing meter (darkroom footer) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 12,
              padding: "0 4px",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: 2,
                color: "#ff9d7a",
                flexShrink: 0,
              }}
            >
              DEVELOPING
            </div>
            <div
              style={{
                flex: 1,
                height: 12,
                borderRadius: 999,
                background: "rgba(0, 0, 0, 0.5)",
                overflow: "hidden",
                boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.5)",
              }}
            >
              <div
                style={{
                  width: `${percent}%`,
                  height: "100%",
                  borderRadius: 999,
                  background:
                    percent >= 100
                      ? "linear-gradient(90deg, #2ecc71, #8bffb0)"
                      : "linear-gradient(90deg, #ffb347, #ffd166)",
                  transition: "width 140ms ease, background 400ms ease",
                }}
              />
            </div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: percent >= 100 ? "#8bffb0" : "#ffd166",
                width: 48,
                textAlign: "right",
                flexShrink: 0,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {percent}%
            </div>
          </div>
        </div>

        {/* ── Hint line ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontSize: 15,
            fontWeight: 700,
            minHeight: 24,
            color: phase === "teach" ? "#ff8a8a" : "#e7ecff",
            textAlign: "center",
          }}
        >
          {phase === "verdict" && <PixIcon emoji="👀" size={22} />}
          {hintText}
        </div>

        {/* ── Verdict zone: buttons / teach panel / win caption ── */}
        <div style={{ minHeight: 128, position: "relative" }}>
          <AnimatePresence mode="wait">
            {(phase === "intro" ||
              phase === "develop" ||
              phase === "verdict") && (
              <motion.div
                key={`buttons-${nudge}`}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  x: nudge > 0 && !unlocked ? [0, -8, 8, -5, 5, 0] : 0,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <AnimatePresence>
                  {showLockTip && !unlocked && (
                    <motion.div
                      key="lock-tip"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      style={{
                        background: "#4a3411",
                        color: "#ffd166",
                        fontSize: 14,
                        fontWeight: 800,
                        padding: "7px 16px",
                        borderRadius: 999,
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.35)",
                      }}
                    >
                      Not yet! Develop the WHOLE photo first.
                    </motion.div>
                  )}
                </AnimatePresence>

                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    width: "100%",
                    justifyContent: "center",
                  }}
                >
                  {/* SHARE */}
                  <motion.button
                    type="button"
                    aria-disabled={!unlocked}
                    aria-label={
                      unlocked
                        ? "Share the photo"
                        : "Share is locked until the photo is fully developed"
                    }
                    animate={
                      unlocked ? { scale: [1, 1.08, 1] } : { scale: 1 }
                    }
                    whileTap={unlocked ? { scale: 0.94 } : undefined}
                    onClick={unlocked ? handleShare : handleLockedPress}
                    style={{
                      flex: 1,
                      maxWidth: 250,
                      minHeight: 64,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                      fontSize: 20,
                      fontWeight: 800,
                      fontFamily: "inherit",
                      letterSpacing: 1,
                      borderRadius: 18,
                      border: "none",
                      cursor: unlocked ? "pointer" : "not-allowed",
                      color: unlocked ? "#08243a" : "rgba(231, 236, 255, 0.45)",
                      background: unlocked
                        ? "linear-gradient(180deg, #7dd9ff 0%, #45b1e8 100%)"
                        : "rgba(120, 128, 160, 0.25)",
                      boxShadow: unlocked
                        ? "0 6px 18px rgba(70, 170, 230, 0.4)"
                        : "none",
                      filter: unlocked ? "none" : "grayscale(0.8)",
                      transition: "background 300ms ease, color 300ms ease",
                    }}
                  >
                    {!unlocked && <PixIcon emoji="🔒" size={20} />}
                    <span aria-hidden>📤</span> SHARE
                  </motion.button>

                  {/* KEEP */}
                  <motion.button
                    type="button"
                    aria-disabled={!unlocked}
                    aria-label={
                      unlocked
                        ? "Keep the photo private"
                        : "Keep is locked until the photo is fully developed"
                    }
                    animate={
                      unlocked ? { scale: [1, 1.08, 1] } : { scale: 1 }
                    }
                    whileTap={unlocked ? { scale: 0.94 } : undefined}
                    onClick={unlocked ? handleKeep : handleLockedPress}
                    style={{
                      flex: 1,
                      maxWidth: 250,
                      minHeight: 64,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                      fontSize: 20,
                      fontWeight: 800,
                      fontFamily: "inherit",
                      letterSpacing: 1,
                      borderRadius: 18,
                      border: "none",
                      cursor: unlocked ? "pointer" : "not-allowed",
                      color: unlocked ? "#ffffff" : "rgba(231, 236, 255, 0.45)",
                      background: unlocked
                        ? "linear-gradient(180deg, #2ecc71 0%, #1f8a4c 100%)"
                        : "rgba(120, 128, 160, 0.25)",
                      boxShadow: unlocked
                        ? "0 6px 18px rgba(40, 160, 90, 0.4)"
                        : "none",
                      filter: unlocked ? "none" : "grayscale(0.8)",
                      transition: "background 300ms ease, color 300ms ease",
                    }}
                  >
                    {!unlocked && <PixIcon emoji="🔒" size={20} />}
                    <span aria-hidden>🔒</span> KEEP
                  </motion.button>
                </div>

                {!unlocked && (
                  <div style={{ fontSize: 12.5, opacity: 0.6 }}>
                    Locked until the photo is 100% developed
                  </div>
                )}
              </motion.div>
            )}

            {/* Teach panel after choosing SHARE */}
            {phase === "teach" && (
              <motion.div
                key="teach"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 26 }}
                style={{
                  background: "rgba(160, 30, 30, 0.28)",
                  border: "2px solid rgba(255, 82, 82, 0.6)",
                  borderRadius: 18,
                  padding: "16px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    color: "#ff9d9d",
                  }}
                >
                  Whoa, hold on!
                </div>
                <div style={{ fontSize: 14.5, opacity: 0.95 }}>
                  You almost shared secrets you rubbed right past:
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  {LEAKS.map((leak) => (
                    <div
                      key={leak.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        fontSize: 14.5,
                        fontWeight: 700,
                      }}
                    >
                      <PixIcon emoji={leak.icon} size={22} />
                      {leak.bullet}
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 14, opacity: 0.85 }}>
                  A photo with clues like these should stay private.
                </div>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleKeep}
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
                      "linear-gradient(180deg, #2ecc71 0%, #1f8a4c 100%)",
                    border: "none",
                    borderRadius: 16,
                    cursor: "pointer",
                    boxShadow: "0 6px 18px rgba(40, 160, 90, 0.45)",
                  }}
                >
                  <span aria-hidden>🔒</span> KEEP IT PRIVATE
                </motion.button>
              </motion.div>
            )}

            {/* Win caption */}
            {phase === "win" && (
              <motion.div
                key="win-caption"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  fontSize: 19,
                  fontWeight: 900,
                  color: "#8bffb0",
                  minHeight: 64,
                }}
              >
                <PixIcon emoji="⭐" size={26} />
                You made the right call!
                <PixIcon emoji="⭐" size={26} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </ExerciseFrame>
  );
}
