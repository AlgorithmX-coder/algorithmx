"use client";

import { useEffect, useRef, useState } from "react";
import { playSound } from "@/app/lib/sounds";
import {
  badgeEarnedCelebration,
  correctAnswerBurst,
} from "@/app/lib/celebrations";

export interface FirewallBuilderProps {
  onComplete: (score: number) => void;
  onCorrect?: () => void;
  onWrong?: () => void;
}

// Play area dimensions
const CANVAS_W = 520;
const CANVAS_H = 550;
const PLAY_W = 300;
const PLAY_H = 450;
const PLAY_X = (CANVAS_W - PLAY_W) / 2;
const PLAY_Y = 50;
const COLS = 5;
const COL_W = PLAY_W / COLS; // 60
const BLOCK_H = 30;
const ROWS = Math.floor(PLAY_H / BLOCK_H); // 15

interface BlockDef {
  text: string;
  kind: "good" | "bad";
  primary: string;
  secondary: string;
}

const GOOD_BLOCKS: BlockDef[] = [
  { text: "Strong Passwords", kind: "good", primary: "#22c55e", secondary: "#15803d" },
  { text: "Enable 2FA", kind: "good", primary: "#3b82f6", secondary: "#1d4ed8" },
  { text: "Avoid Unknown Links", kind: "good", primary: "#22d3ee", secondary: "#0891b2" },
  { text: "Keep Software Updated", kind: "good", primary: "#22c55e", secondary: "#15803d" },
  { text: "Password Manager", kind: "good", primary: "#3b82f6", secondary: "#1d4ed8" },
  { text: "Check URLs Carefully", kind: "good", primary: "#22d3ee", secondary: "#0891b2" },
  { text: "Log Out When Done", kind: "good", primary: "#22c55e", secondary: "#15803d" },
  { text: "Use Antivirus", kind: "good", primary: "#3b82f6", secondary: "#1d4ed8" },
];

const BAD_BLOCKS: BlockDef[] = [
  { text: "Share Passwords", kind: "bad", primary: "#ef4444", secondary: "#991b1b" },
  { text: "Click Every Link", kind: "bad", primary: "#f97316", secondary: "#9a3412" },
  { text: "Use 'password123'", kind: "bad", primary: "#ef4444", secondary: "#991b1b" },
  { text: "Ignore Updates", kind: "bad", primary: "#f97316", secondary: "#9a3412" },
];

interface Falling {
  def: BlockDef;
  col: number; // 0..COLS-1
  y: number; // top y in play-area coords
  landed: boolean;
}

interface StackCell {
  def: BlockDef;
  flashUntil: number;
  cracked: boolean;
}

interface Floater {
  id: number;
  x: number;
  y: number;
  text: string;
  colour: string;
  bornAt: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  colour: string;
  rot: number;
  rotSpeed: number;
}

const WIN_GOOD = 15;
const LOSE_BAD = 5;
const LEVEL_THRESHOLDS = [5, 10, 15];

export default function FirewallBuilder({
  onComplete,
  onCorrect,
  onWrong,
}: FirewallBuilderProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const state = useRef({
    falling: null as Falling | null,
    nextSpawnAt: 0,
    stacks: Array.from({ length: COLS }, () => [] as StackCell[]),
    goodLanded: 0,
    badLanded: 0,
    goodRejected: 0,
    wrongRejected: 0,
    level: 0,
    speed: 2, // px/frame at 60fps
    floaters: [] as Floater[],
    particles: [] as Particle[],
    floaterId: 0,
    particleId: 0,
    shakeUntil: 0,
    levelFlashUntil: 0,
    levelFlashText: "",
    won: false,
    lost: false,
    finished: false,
  });

  const [render, setRender] = useState(0);

  // Stack height in px for a column (counting blocks from bottom)
  const stackHeightPx = (col: number) => state.current.stacks[col].length * BLOCK_H;

  const spawnBlock = () => {
    const s = state.current;
    const pickGood = Math.random() < 0.7;
    const pool = pickGood ? GOOD_BLOCKS : BAD_BLOCKS;
    const def = pool[Math.floor(Math.random() * pool.length)];
    const col = Math.floor(Math.random() * COLS);
    s.falling = { def, col, y: 0, landed: false };
  };

  const addFloater = (
    text: string,
    xInPlay: number,
    yInPlay: number,
    colour: string
  ) => {
    const s = state.current;
    s.floaters.push({
      id: ++s.floaterId,
      x: PLAY_X + xInPlay,
      y: PLAY_Y + yInPlay,
      text,
      colour,
      bornAt: performance.now(),
    });
  };

  const burst = (xInPlay: number, yInPlay: number, colour: string, count: number) => {
    const s = state.current;
    const x0 = PLAY_X + xInPlay;
    const y0 = PLAY_Y + yInPlay;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 2 + Math.random() * 4;
      s.particles.push({
        id: ++s.particleId,
        x: x0,
        y: y0,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 2,
        life: 700,
        colour,
        rot: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.3,
      });
    }
  };

  const onLandGood = (f: Falling) => {
    const s = state.current;
    const col = f.col;
    s.stacks[col].push({
      def: f.def,
      flashUntil: performance.now() + 300,
      cracked: false,
    });
    s.goodLanded += 1;
    playSound("correct");
    onCorrect?.();
    burst(col * COL_W + COL_W / 2, PLAY_H - stackHeightPx(col) + BLOCK_H / 2, "#4ade80", 10);
    const milestone = LEVEL_THRESHOLDS.indexOf(s.goodLanded);
    if (milestone >= 0) {
      s.level = milestone + 1;
      s.levelFlashText = `FIREWALL LEVEL ${s.level}!`;
      s.levelFlashUntil = performance.now() + 1500;
      playSound("streak3");
    }
    if (s.goodLanded >= WIN_GOOD) {
      s.won = true;
      s.finished = true;
      playSound("confetti");
      void correctAnswerBurst();
      void badgeEarnedCelebration();
      setRender((n) => n + 1);
      return;
    }
    // Speed curve: +0.5 every 5 blocks
    s.speed = 2 + Math.floor(s.goodLanded / 5) * 0.5;
  };

  const onLandBad = (f: Falling) => {
    const s = state.current;
    const col = f.col;
    // Cracked-top: if there is a top block, crack it and pop it off
    if (s.stacks[col].length > 0) {
      s.stacks[col].pop();
    }
    s.badLanded += 1;
    s.shakeUntil = performance.now() + 450;
    playSound("wrong");
    onWrong?.();
    burst(col * COL_W + COL_W / 2, PLAY_H - stackHeightPx(col), "#ef4444", 14);
    addFloater("FIREWALL HIT!", col * COL_W + COL_W / 2, PLAY_H - stackHeightPx(col) - 12, "#ef4444");
    if (s.badLanded >= LOSE_BAD) {
      s.lost = true;
      s.finished = true;
      setRender((n) => n + 1);
    }
  };

  const move = (dir: -1 | 1) => {
    const s = state.current;
    if (!s.falling || s.falling.landed || s.finished) return;
    const next = s.falling.col + dir;
    if (next < 0 || next >= COLS) return;
    // Can't move into a column where the block would collide with the stack at current y
    const topYOfCol = PLAY_H - stackHeightPx(next);
    if (s.falling.y + BLOCK_H > topYOfCol) return;
    s.falling.col = next;
    playSound("pop");
  };

  const reject = () => {
    const s = state.current;
    if (!s.falling || s.falling.landed || s.finished) return;
    const f = s.falling;
    if (f.def.kind === "bad") {
      // good reject: explode + reward
      playSound("sortCorrect");
      onCorrect?.();
      burst(f.col * COL_W + COL_W / 2, f.y + BLOCK_H / 2, "#f97316", 14);
      addFloater("REJECTED!", f.col * COL_W + COL_W / 2, f.y, "#fbbf24");
      s.goodRejected += 1;
    } else {
      // wrong reject
      playSound("wrong");
      onWrong?.();
      addFloater("OOPS! That was good!", f.col * COL_W + COL_W / 2, f.y, "#f97316");
      s.wrongRejected += 1;
      // good block bypassed = a loss of potential. count slightly: no penalty beyond
    }
    s.falling = null;
    s.nextSpawnAt = performance.now() + 1500;
  };

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (state.current.finished) return;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        move(-1);
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        move(1);
      } else if (
        e.key === " " ||
        e.key === "ArrowDown" ||
        e.key === "s" ||
        e.key === "S"
      ) {
        e.preventDefault();
        reject();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Touch: tap left half moves left, right half moves right, hold center rejects
  const onCanvasTap = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = CANVAS_W / rect.width;
    const x = (e.clientX - rect.left) * scale;
    const y = (e.clientY - rect.top) * scale;
    // if tap inside play area top-half: move by clicking target column
    if (x < CANVAS_W * 0.33) move(-1);
    else if (x > CANVAS_W * 0.66) move(1);
    else if (y > CANVAS_H - 80) reject();
  };

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;

    let running = true;
    let lastTime = performance.now();
    state.current.nextSpawnAt = performance.now() + 400;

    const tick = (now: number) => {
      if (!running) return;
      const dt = Math.min(50, now - lastTime);
      lastTime = now;
      const frames = dt / (1000 / 60);
      const s = state.current;

      if (!s.falling && !s.finished) {
        if (now >= s.nextSpawnAt) spawnBlock();
      }

      if (s.falling && !s.falling.landed && !s.finished) {
        const f = s.falling;
        f.y += s.speed * frames;
        // Check collision with stack or floor
        const topYOfCol = PLAY_H - stackHeightPx(f.col);
        if (f.y + BLOCK_H >= topYOfCol) {
          f.y = topYOfCol - BLOCK_H;
          f.landed = true;
          if (f.def.kind === "good") onLandGood(f);
          else onLandBad(f);
          s.falling = null;
          s.nextSpawnAt = now + 1500;
        }
      }

      // Particles
      s.particles = s.particles
        .map((p) => ({
          ...p,
          x: p.x + p.vx * frames,
          y: p.y + p.vy * frames,
          vy: p.vy + 0.3 * frames,
          rot: p.rot + p.rotSpeed * frames,
          life: p.life - dt,
        }))
        .filter((p) => p.life > 0);
      s.floaters = s.floaters.filter((f) => now - f.bornAt < 900);

      // DRAW
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

      // Shake
      const shakeX = now < s.shakeUntil ? (Math.random() - 0.5) * 6 : 0;
      const shakeY = now < s.shakeUntil ? (Math.random() - 0.5) * 4 : 0;

      // Background
      const bg = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
      bg.addColorStop(0, "#0a1020");
      bg.addColorStop(1, "#050814");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      ctx.save();
      ctx.translate(shakeX, shakeY);

      // Play area
      ctx.fillStyle = "#050a18";
      ctx.fillRect(PLAY_X, PLAY_Y, PLAY_W, PLAY_H);
      // Grid
      ctx.strokeStyle = "rgba(96,165,250,0.08)";
      ctx.lineWidth = 1;
      for (let c = 1; c < COLS; c++) {
        ctx.beginPath();
        ctx.moveTo(PLAY_X + c * COL_W, PLAY_Y);
        ctx.lineTo(PLAY_X + c * COL_W, PLAY_Y + PLAY_H);
        ctx.stroke();
      }
      for (let r = 1; r < ROWS; r++) {
        ctx.beginPath();
        ctx.moveTo(PLAY_X, PLAY_Y + r * BLOCK_H);
        ctx.lineTo(PLAY_X + PLAY_W, PLAY_Y + r * BLOCK_H);
        ctx.stroke();
      }

      // Side tech frames
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(PLAY_X - 8, PLAY_Y, 6, PLAY_H);
      ctx.fillRect(PLAY_X + PLAY_W + 2, PLAY_Y, 6, PLAY_H);
      ctx.fillStyle = "#60a5fa";
      for (let i = 0; i < 12; i++) {
        const y = PLAY_Y + 10 + i * 38;
        ctx.fillRect(PLAY_X - 7, y, 4, 4);
        ctx.fillRect(PLAY_X + PLAY_W + 3, y, 4, 4);
      }
      // Foundation
      ctx.fillStyle = "#1e3a5f";
      ctx.fillRect(PLAY_X - 14, PLAY_Y + PLAY_H, PLAY_W + 28, 12);

      // Stacked blocks
      for (let c = 0; c < COLS; c++) {
        const stack = s.stacks[c];
        for (let i = 0; i < stack.length; i++) {
          const cell = stack[i];
          const x = PLAY_X + c * COL_W + 2;
          const y = PLAY_Y + PLAY_H - (i + 1) * BLOCK_H;
          const flashing = now < cell.flashUntil;
          drawBlock(ctx, x, y, COL_W - 4, BLOCK_H - 2, cell.def, flashing);
        }
      }

      // Falling block
      if (s.falling) {
        const x = PLAY_X + s.falling.col * COL_W + 2;
        const y = PLAY_Y + s.falling.y;
        drawBlock(ctx, x, y, COL_W - 4, BLOCK_H - 2, s.falling.def, false);
      }

      ctx.restore();

      // Particles
      for (const p of s.particles) {
        const alpha = Math.max(0, p.life / 700);
        ctx.globalAlpha = alpha;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.colour;
        ctx.fillRect(-4, -4, 8, 8);
        ctx.restore();
      }
      ctx.globalAlpha = 1;

      // Floaters
      for (const f of s.floaters) {
        const age = now - f.bornAt;
        const alpha = Math.max(0, 1 - age / 900);
        const dy = -age * 0.06;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = f.colour;
        ctx.strokeStyle = "rgba(0,0,0,0.7)";
        ctx.lineWidth = 3;
        ctx.font = "900 14px 'Space Grotesk', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeText(f.text, f.x, f.y + dy);
        ctx.fillText(f.text, f.x, f.y + dy);
      }
      ctx.globalAlpha = 1;

      // Level-up flash
      if (now < s.levelFlashUntil) {
        const age = now - (s.levelFlashUntil - 1500);
        const alpha = age < 300 ? age / 300 : 1 - (age - 300) / 1200;
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.fillStyle = "#fde047";
        ctx.strokeStyle = "rgba(0,0,0,0.8)";
        ctx.lineWidth = 4;
        ctx.font = "900 32px 'Space Grotesk', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeText(s.levelFlashText, CANVAS_W / 2, CANVAS_H / 2);
        ctx.fillText(s.levelFlashText, CANVAS_W / 2, CANVAS_H / 2);
      }
      ctx.globalAlpha = 1;

      // HUD
      ctx.font = "800 13px 'Space Grotesk', sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillStyle = "#86efac";
      ctx.fillText(`FIREWALL LEVEL ${s.level}`, 14, 12);
      ctx.textAlign = "right";
      ctx.fillStyle = "#7dd3fc";
      ctx.fillText(`BLOCKS ${s.goodLanded}/${WIN_GOOD}`, CANVAS_W - 14, 12);
      ctx.textAlign = "center";
      ctx.fillStyle = s.badLanded >= LOSE_BAD - 1 ? "#ef4444" : "#fbbf24";
      ctx.fillText(`VIRUSES ${s.badLanded}/${LOSE_BAD}`, CANVAS_W / 2, 12);

      // Current indicator at bottom
      if (s.falling) {
        ctx.fillStyle =
          s.falling.def.kind === "good" ? "#4ade80" : "#f87171";
        ctx.font = "900 14px 'Space Grotesk', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          s.falling.def.kind === "good" ? "CATCH IT!" : "REJECT IT!",
          CANVAS_W / 2,
          CANVAS_H - 22
        );
      } else {
        ctx.fillStyle = "#64748b";
        ctx.font = "600 11px 'Space Grotesk', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("← → move · SPACE reject", CANVAS_W / 2, CANVAS_H - 22);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const s = state.current;
  const stars =
    s.won && s.badLanded === 0 ? 3 : s.goodLanded >= 12 ? 2 : 1;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 540,
        margin: "0 auto",
        borderRadius: 24,
        overflow: "hidden",
        background: "linear-gradient(180deg, #05060f 0%, #010106 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        color: "#e2e8f0",
      }}
      tabIndex={0}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={onCanvasTap}
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          touchAction: "manipulation",
        }}
        aria-label="Firewall Builder"
      />

      {s.finished && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(4,6,14,0.94)",
            backdropFilter: "blur(6px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: 24,
          }}
        >
          <div
            style={{
              fontSize: 30,
              fontWeight: 900,
              background: s.won
                ? "linear-gradient(135deg, #4ade80, #22d3ee, #fde047)"
                : "linear-gradient(135deg, #ef4444, #f97316)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: 2,
            }}
          >
            {s.won ? "FIREWALL BUILT!" : "FIREWALL BREACHED"}
          </div>
          <div style={{ marginTop: 8, fontSize: 18 }}>
            Level {s.level} &nbsp;·&nbsp; Blocks {s.goodLanded}/{WIN_GOOD}
          </div>
          <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
            Viruses caught: {s.goodRejected} &nbsp;·&nbsp; Let through:{" "}
            {s.badLanded}
          </div>
          <div style={{ fontSize: 36, margin: "14px 0" }}>
            {s.won ? (
              <>
                {"★".repeat(stars)}
                <span style={{ color: "rgba(148,163,184,0.4)" }}>
                  {"★".repeat(3 - stars)}
                </span>
              </>
            ) : (
              <span style={{ color: "rgba(148,163,184,0.6)" }}>☆☆☆</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              playSound("click");
              onComplete(s.won ? stars : Math.max(1, s.level));
            }}
            style={{
              background: "linear-gradient(135deg, #f97316, #f59e0b)",
              color: "#fff",
              fontWeight: 800,
              borderRadius: 14,
              padding: "14px 36px",
              fontSize: 17,
              border: "none",
              cursor: "pointer",
              boxShadow: "0 0 18px rgba(249,115,22,0.5)",
            }}
          >
            Continue &rarr;
          </button>
        </div>
      )}
      <span style={{ display: "none" }}>{render}</span>
    </div>
  );
}

function drawBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  def: BlockDef,
  flash: boolean
) {
  const grad = ctx.createLinearGradient(x, y, x, y + h);
  grad.addColorStop(0, def.primary);
  grad.addColorStop(1, def.secondary);
  ctx.fillStyle = grad;
  roundRect(ctx, x, y, w, h, 6);
  ctx.fill();
  ctx.strokeStyle = flash
    ? "#fff"
    : def.kind === "good"
      ? "rgba(255,255,255,0.35)"
      : "rgba(0,0,0,0.35)";
  ctx.lineWidth = flash ? 2 : 1;
  roundRect(ctx, x, y, w, h, 6);
  ctx.stroke();
  // Icon
  ctx.font = "900 12px 'Space Grotesk', sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  if (def.kind === "bad") {
    ctx.fillText("⚠", x + 4, y + h / 2);
  } else {
    ctx.fillText("✓", x + 4, y + h / 2);
  }
  // Text
  ctx.font = "700 9px 'Space Grotesk', sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  const label = def.text;
  // truncate if too long
  const max = w - 18;
  let t = label;
  if (ctx.measureText(t).width > max) {
    while (t.length > 4 && ctx.measureText(t + "…").width > max) t = t.slice(0, -1);
    t = t + "…";
  }
  ctx.fillText(t, x + 16, y + h / 2);
}

function roundRect(
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
  ctx.lineTo(x + w - rad, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
  ctx.lineTo(x + w, y + h - rad);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
  ctx.lineTo(x + rad, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
  ctx.lineTo(x, y + rad);
  ctx.quadraticCurveTo(x, y, x + rad, y);
  ctx.closePath();
}
