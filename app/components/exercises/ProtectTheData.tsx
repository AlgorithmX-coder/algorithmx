"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { playSound } from "@/app/lib/sounds";
import { correctAnswerBurst } from "@/app/lib/celebrations";
import ExerciseIntro from "./ExerciseIntro";
import ExerciseHowTo from "./ExerciseHowTo";

export interface ProtectTheDataItem {
  text: string;
  isPrivate: boolean;
}

export interface ProtectTheDataProps {
  items: ProtectTheDataItem[];
  onComplete: (score: number) => void;
  onCorrect?: () => void;
  onWrong?: () => void;
}

interface FallingItem {
  idx: number;
  text: string;
  isPrivate: boolean;
  x: number; // centre x
  y: number; // top y
  vx: number;
  vy: number;
  spin: number; // radians offset for rotation oscillation
  width: number;
  height: number;
  resolved: boolean;
  resolvedAs: "blocked" | "passed" | "wrong-block" | "leaked" | null;
  bounceVy?: number;
  exitAt?: number;
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
}

const CANVAS_W = 720;
const CANVAS_H = 500;
const SHIELD_W = 120;
const SHIELD_H = 40;
const SHIELD_Y = CANVAS_H - 60;
const ITEM_W = 180;
const ITEM_H = 50;

function speedForIndex(i: number): number {
  if (i < 4) return 2;
  if (i < 8) return 3;
  return 4;
}

function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default function ProtectTheData({
  items,
  onComplete,
  onCorrect,
  onWrong,
}: ProtectTheDataProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [shuffleKey, setShuffleKey] = useState(0);
  const shuffled = useMemo(() => shuffle(items), [items, shuffleKey]);
  const [showIntro, setShowIntro] = useState(true);

  // Mutable game state in refs (not React state — every frame)
  const state = useRef({
    shieldX: CANVAS_W / 2,
    shieldTarget: CANVAS_W / 2,
    current: null as FallingItem | null,
    currentIdx: 0,
    nextSpawnAt: 0,
    floaters: [] as Floater[],
    particles: [] as Particle[],
    edgeFlash: null as { colour: string; until: number } | null,
    floaterId: 0,
    particleId: 0,
    blockedPrivate: 0,
    totalPrivate: 0,
    allowedSafe: 0,
    totalSafe: 0,
    correct: 0,
    streak: 0,
    finished: false,
  });

  const [render, setRender] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    state.current.totalPrivate = shuffled.filter((s) => s.isPrivate).length;
    state.current.totalSafe = shuffled.length - state.current.totalPrivate;
  }, [shuffled]);

  const spawnItem = (idx: number) => {
    const it = shuffled[idx];
    state.current.current = {
      idx,
      text: it.text,
      isPrivate: it.isPrivate,
      x: 100 + Math.random() * (CANVAS_W - 200),
      y: -ITEM_H,
      vx: (Math.random() - 0.5) * 0.5,
      vy: speedForIndex(idx),
      spin: Math.random() * Math.PI * 2,
      width: ITEM_W,
      height: ITEM_H,
      resolved: false,
      resolvedAs: null,
    };
  };

  const resolveItem = (
    item: FallingItem,
    outcome: "blocked" | "passed" | "wrong-block" | "leaked"
  ) => {
    if (item.resolved) return;
    item.resolved = true;
    item.resolvedAs = outcome;
    const now = performance.now();
    item.exitAt = now + 700;

    const addFloater = (text: string, colour: string) => {
      state.current.floaters.push({
        id: ++state.current.floaterId,
        x: item.x,
        y: item.y,
        text,
        colour,
        bornAt: now,
      });
    };

    const burst = (colour: string, count: number) => {
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 2 + Math.random() * 4;
        state.current.particles.push({
          id: ++state.current.particleId,
          x: item.x,
          y: item.y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 2,
          life: 700,
          colour,
        });
      }
    };

    if (outcome === "blocked") {
      playSound("shieldBlock");
      addFloater("BLOCKED!", "#4ade80");
      burst("#4ade80", 14);
      state.current.blockedPrivate += 1;
      state.current.correct += 1;
      state.current.streak += 1;
      item.bounceVy = -10;
      item.vy = -10;
      onCorrect?.();
    } else if (outcome === "passed") {
      playSound("sortCorrect");
      addFloater("SAFE ✓", "#86efac");
      burst("#86efac", 8);
      state.current.allowedSafe += 1;
      state.current.correct += 1;
      state.current.streak += 1;
      onCorrect?.();
    } else if (outcome === "wrong-block") {
      playSound("wrong");
      addFloater("OOPS! That was safe!", "#f97316");
      burst("#f97316", 10);
      state.current.edgeFlash = { colour: "#f97316", until: now + 250 };
      state.current.streak = 0;
      item.bounceVy = -8;
      item.vy = -8;
      onWrong?.();
    } else {
      playSound("wrong");
      addFloater("EXPOSED!", "#ef4444");
      burst("#ef4444", 14);
      state.current.edgeFlash = { colour: "#ef4444", until: now + 300 };
      state.current.streak = 0;
      onWrong?.();
    }
  };

  // Input handlers
  useEffect(() => {
    const wrap = wrapperRef.current;
    if (!wrap) return;

    const canvasToLocal = (clientX: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return CANVAS_W / 2;
      const rect = canvas.getBoundingClientRect();
      const scale = CANVAS_W / rect.width;
      return (clientX - rect.left) * scale;
    };

    const onMove = (x: number) => {
      state.current.shieldTarget = Math.max(
        SHIELD_W / 2,
        Math.min(CANVAS_W - SHIELD_W / 2, x)
      );
    };
    // Mouse: track movement AND treat clicks as a snap-to-tap so kids
    // playing on a trackpad without dragging still work.
    const onMouse = (e: MouseEvent) => onMove(canvasToLocal(e.clientX));
    const onMouseDown = (e: MouseEvent) => onMove(canvasToLocal(e.clientX));
    // Touch: respond to both touch start and touch move so a tap on the
    // tablet snaps the shield to that finger position immediately.
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) onMove(canvasToLocal(e.touches[0].clientX));
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) onMove(canvasToLocal(e.touches[0].clientX));
    };
    // Keyboard: arrow keys + WASD. Previous implementation only handled
    // ArrowLeft/Right; add A/D so kids can use either side of the
    // keyboard, and W/S as no-ops so accidental presses don't bubble
    // up and scroll the page. Using `e.code` so layouts are predictable.
    const NAV_CODES = new Set([
      "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
      "KeyA", "KeyD", "KeyW", "KeyS",
    ]);
    const onKey = (e: KeyboardEvent) => {
      // Don't interfere when typing.
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      if (!NAV_CODES.has(e.code)) return;
      const step = 24;
      if (e.code === "ArrowLeft" || e.code === "KeyA") {
        state.current.shieldTarget = Math.max(
          SHIELD_W / 2,
          state.current.shieldTarget - step
        );
        e.preventDefault();
      } else if (e.code === "ArrowRight" || e.code === "KeyD") {
        state.current.shieldTarget = Math.min(
          CANVAS_W - SHIELD_W / 2,
          state.current.shieldTarget + step
        );
        e.preventDefault();
      } else {
        // Up/Down/W/S — block default scroll so the lesson doesn't jump
        // around while the player is concentrating on the canvas.
        e.preventDefault();
      }
    };
    wrap.addEventListener("mousemove", onMouse);
    wrap.addEventListener("mousedown", onMouseDown);
    wrap.addEventListener("touchstart", onTouchStart, { passive: true });
    wrap.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      wrap.removeEventListener("mousemove", onMouse);
      wrap.removeEventListener("mousedown", onMouseDown);
      wrap.removeEventListener("touchstart", onTouchStart);
      wrap.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const resetExercise = () => {
    state.current = {
      shieldX: CANVAS_W / 2,
      shieldTarget: CANVAS_W / 2,
      current: null,
      currentIdx: 0,
      nextSpawnAt: 0,
      floaters: [],
      particles: [],
      edgeFlash: null,
      floaterId: 0,
      particleId: 0,
      blockedPrivate: 0,
      totalPrivate: state.current.totalPrivate,
      allowedSafe: 0,
      totalSafe: state.current.totalSafe,
      correct: 0,
      streak: 0,
      finished: false,
    };
    setShuffleKey((k) => k + 1);
    setShowIntro(true);
    setRender((n) => n + 1);
  };

  // Render loop
  useEffect(() => {
    if (showIntro) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;

    let lastTime = performance.now();
    let running = true;
    state.current.nextSpawnAt = performance.now() + 500;

    const finish = () => {
      if (state.current.finished) return;
      state.current.finished = true;
      void correctAnswerBurst();
      setRender((n) => n + 1);
    };

    const tick = (now: number) => {
      if (!running) return;
      const dt = Math.min(50, now - lastTime);
      lastTime = now;
      const frames = dt / (1000 / 60);

      const s = state.current;

      // shield lerp
      s.shieldX += (s.shieldTarget - s.shieldX) * Math.min(1, 0.25 * frames);

      // spawn next
      if (!s.current && !s.finished) {
        if (s.currentIdx >= shuffled.length) {
          finish();
        } else if (now >= s.nextSpawnAt) {
          spawnItem(s.currentIdx);
        }
      }

      // tick current item
      if (s.current) {
        const c = s.current;
        if (!c.resolved) {
          c.x += c.vx * frames;
          c.y += c.vy * frames;
          c.spin += 0.04 * frames;
          // reflect horizontally at edges
          if (c.x < c.width / 2 + 10) {
            c.x = c.width / 2 + 10;
            c.vx = Math.abs(c.vx);
          } else if (c.x > CANVAS_W - c.width / 2 - 10) {
            c.x = CANVAS_W - c.width / 2 - 10;
            c.vx = -Math.abs(c.vx);
          }

          // collision w/ shield (AABB, bottom edge of item vs shield rect)
          const shieldLeft = s.shieldX - SHIELD_W / 2;
          const shieldRight = s.shieldX + SHIELD_W / 2;
          const shieldTop = SHIELD_Y;
          const shieldBottom = SHIELD_Y + SHIELD_H;
          const itemLeft = c.x - c.width / 2;
          const itemRight = c.x + c.width / 2;
          const itemBottom = c.y + c.height;
          const overlapsX = itemRight > shieldLeft && itemLeft < shieldRight;
          const overlapsY =
            itemBottom > shieldTop && c.y < shieldBottom;
          if (overlapsX && overlapsY) {
            resolveItem(c, c.isPrivate ? "blocked" : "wrong-block");
          } else if (c.y > CANVAS_H - 10) {
            resolveItem(c, c.isPrivate ? "leaked" : "passed");
          }
        } else {
          c.y += c.vy * frames;
          c.vy += 0.35 * frames;
          c.x += c.vx * frames;
          if (c.exitAt && now >= c.exitAt) {
            s.current = null;
            s.currentIdx += 1;
            s.nextSpawnAt = now + (c.resolvedAs === "leaked" ? 900 : 700);
          }
        }
      }

      // tick floaters
      s.floaters = s.floaters.filter((f) => now - f.bornAt < 900);
      // tick particles
      s.particles = s.particles
        .map((p) => ({
          ...p,
          x: p.x + p.vx * frames,
          y: p.y + p.vy * frames,
          vy: p.vy + 0.35 * frames,
          life: p.life - dt,
        }))
        .filter((p) => p.life > 0);

      // ── DRAW ──
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

      // Background — deep space gradient + twinkling stars + retro Space-
      // Invaders march across the upper half (purely decorative; never
      // interacts with the actual gameplay).
      const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
      bgGrad.addColorStop(0, "#0d1633");
      bgGrad.addColorStop(0.5, "#080c1f");
      bgGrad.addColorStop(1, "#02030a");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Twinkling stars
      for (let i = 0; i < 70; i++) {
        const sx = (i * 97.3) % CANVAS_W;
        const sy = (i * 173.7) % CANVAS_H;
        const r = ((i * 13) % 3) / 2 + 0.4;
        const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(now * 0.002 + i * 0.7));
        ctx.fillStyle = `rgba(255,255,255,${0.25 + 0.45 * tw})`;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Retro pixel-invader grid (3 rows × 7 cols, two-frame "march" anim).
      // Each invader is drawn from a tiny bitmap so it reads as proper
      // pixel-art rather than a smooth shape.  Colours & opacity are dialled
      // way down so the player's eye stays on the falling cards.
      const INVADER_A = [
        "..X.....X..",
        "...X...X...",
        "..XXXXXXX..",
        ".XX.XXX.XX.",
        "XXXXXXXXXXX",
        "X.XXXXXXX.X",
        "X.X.....X.X",
        "...XX.XX...",
      ];
      const INVADER_B = [
        "..X.....X..",
        "X..X...X..X",
        "X.XXXXXXX.X",
        "XXX.XXX.XXX",
        "XXXXXXXXXXX",
        ".XXXXXXXXX.",
        "..X.....X..",
        ".X.......X.",
      ];
      const INVADER_C = [
        "....XXX....",
        ".XXXXXXXXX.",
        "XXXXXXXXXXX",
        "XXX.XXX.XXX",
        "XXXXXXXXXXX",
        "..X.X.X.X..",
        ".X.X...X.X.",
        "X.X.....X.X",
      ];
      const INVADER_TYPES = [INVADER_A, INVADER_B, INVADER_C];
      const INVADER_COLS = ["#a78bfa", "#22d3ee", "#f472b6"];
      const PX = 3;
      const INV_W = 11 * PX;
      const INV_H = 8 * PX;
      const INV_GAP_X = 22;
      const INV_GAP_Y = 20;
      const COLS = 7;
      const ROWS = 3;
      const totalW = COLS * INV_W + (COLS - 1) * INV_GAP_X;
      // March: bounce horizontally, step every ~0.7s (alternates frame)
      const period = 5200;
      const t = (now % period) / period;
      const sway = Math.sin(t * Math.PI * 2) * 18;
      const startX = (CANVAS_W - totalW) / 2 + sway;
      const startY = 28;
      const frame = Math.floor(now / 700) % 2;
      for (let r = 0; r < ROWS; r++) {
        const pat = INVADER_TYPES[r];
        const colour = INVADER_COLS[r];
        for (let c = 0; c < COLS; c++) {
          const ox = startX + c * (INV_W + INV_GAP_X);
          const oy = startY + r * (INV_H + INV_GAP_Y);
          // Two-frame wobble: every other invader uses opposite frame so the
          // formation reads as marching together.
          const flip = frame ^ ((c + r) & 1);
          ctx.fillStyle = colour;
          ctx.globalAlpha = 0.22;
          for (let py = 0; py < pat.length; py++) {
            for (let px = 0; px < pat[py].length; px++) {
              if (pat[py][px] === "X") {
                const dx = flip ? (10 - px) : px;
                ctx.fillRect(ox + dx * PX, oy + py * PX, PX, PX);
              }
            }
          }
        }
      }
      ctx.globalAlpha = 1;

      // Occasional laser bolt streaking down from the invader formation
      // (deterministic from time so we don't need extra state).
      const boltCycle = 1800;
      const boltT = (now % boltCycle) / boltCycle;
      if (boltT < 0.18) {
        const seed = Math.floor(now / boltCycle);
        const bx = startX + ((seed * 5) % COLS) * (INV_W + INV_GAP_X) + INV_W / 2;
        const by = startY + ROWS * (INV_H + INV_GAP_Y) + boltT * 6 * 220;
        ctx.fillStyle = "rgba(248,113,113,0.55)";
        ctx.fillRect(bx, by - 8, 2, 8);
        ctx.fillStyle = "rgba(248,113,113,0.85)";
        ctx.fillRect(bx, by - 4, 2, 4);
      }

      // Subtle scan-line floor near the shield: classic arcade "ground"
      ctx.strokeStyle = "rgba(96,165,250,0.18)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, SHIELD_Y + 22);
      ctx.lineTo(CANVAS_W, SHIELD_Y + 22);
      ctx.stroke();

      // Edge flash
      if (s.edgeFlash && now < s.edgeFlash.until) {
        const alpha =
          (s.edgeFlash.until - now) / 300;
        ctx.strokeStyle = s.edgeFlash.colour;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 18;
        ctx.strokeRect(9, 9, CANVAS_W - 18, CANVAS_H - 18);
        ctx.globalAlpha = 1;
      } else if (s.edgeFlash && now >= s.edgeFlash.until) {
        s.edgeFlash = null;
      }

      // Current item
      if (s.current) {
        const c = s.current;
        const tilt = Math.sin(c.spin) * 0.08;
        ctx.save();
        ctx.translate(c.x, c.y + c.height / 2);
        ctx.rotate(tilt);
        // Card shadow
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.fillRect(-c.width / 2 + 3, -c.height / 2 + 3, c.width, c.height);
        // Card body
        const tint = c.isPrivate
          ? "rgba(239,68,68,0.12)"
          : "rgba(34,197,94,0.10)";
        const border = c.isPrivate
          ? "rgba(248,113,113,0.55)"
          : "rgba(134,239,172,0.55)";
        const grad = ctx.createLinearGradient(
          0,
          -c.height / 2,
          0,
          c.height / 2
        );
        grad.addColorStop(0, "rgba(30,41,59,0.95)");
        grad.addColorStop(1, "rgba(15,23,42,0.95)");
        ctx.fillStyle = grad;
        roundRect(
          ctx,
          -c.width / 2,
          -c.height / 2,
          c.width,
          c.height,
          10
        );
        ctx.fill();
        ctx.fillStyle = tint;
        roundRect(
          ctx,
          -c.width / 2,
          -c.height / 2,
          c.width,
          c.height,
          10
        );
        ctx.fill();
        ctx.strokeStyle = border;
        ctx.lineWidth = 2;
        roundRect(
          ctx,
          -c.width / 2,
          -c.height / 2,
          c.width,
          c.height,
          10
        );
        ctx.stroke();
        // text
        ctx.fillStyle = "#f1f5f9";
        ctx.font = "600 14px 'Space Grotesk', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(c.text, 0, 0, c.width - 16);
        ctx.restore();
      }

      // Shield
      const sx = s.shieldX;
      const sy = SHIELD_Y;
      // Energy field (above)
      const field = ctx.createRadialGradient(sx, sy, 0, sx, sy, 90);
      field.addColorStop(0, "rgba(96,165,250,0.35)");
      field.addColorStop(1, "rgba(96,165,250,0)");
      ctx.fillStyle = field;
      ctx.fillRect(sx - 90, sy - 60, 180, 70);
      // Shield body
      const sGrad = ctx.createLinearGradient(
        sx - SHIELD_W / 2,
        sy,
        sx + SHIELD_W / 2,
        sy + SHIELD_H
      );
      sGrad.addColorStop(0, "#60a5fa");
      sGrad.addColorStop(0.5, "#22d3ee");
      sGrad.addColorStop(1, "#34d399");
      ctx.fillStyle = sGrad;
      roundRect(ctx, sx - SHIELD_W / 2, sy, SHIELD_W, SHIELD_H, 18);
      ctx.fill();
      // Rim
      ctx.strokeStyle = "rgba(255,255,255,0.85)";
      ctx.lineWidth = 2;
      roundRect(ctx, sx - SHIELD_W / 2, sy, SHIELD_W, SHIELD_H, 18);
      ctx.stroke();
      // Glow
      ctx.shadowColor = "#60a5fa";
      ctx.shadowBlur = 18;
      roundRect(ctx, sx - SHIELD_W / 2, sy, SHIELD_W, SHIELD_H, 18);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Particles
      for (const p of s.particles) {
        const alpha = Math.max(0, Math.min(1, p.life / 700));
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.colour;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Floating texts
      for (const f of s.floaters) {
        const age = now - f.bornAt;
        const alpha = Math.max(0, 1 - age / 900);
        const dy = -age * 0.08;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = f.colour;
        ctx.strokeStyle = "rgba(0,0,0,0.7)";
        ctx.lineWidth = 3;
        ctx.font = "900 20px 'Space Grotesk', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeText(f.text, f.x, f.y + dy);
        ctx.fillText(f.text, f.x, f.y + dy);
      }
      ctx.globalAlpha = 1;

      // HUD
      ctx.font = "800 14px 'Space Grotesk', sans-serif";
      ctx.textBaseline = "top";
      ctx.textAlign = "left";
      ctx.fillStyle = "#7dd3fc";
      ctx.fillText(
        `BLOCKED ${s.blockedPrivate}/${s.totalPrivate}`,
        16,
        14
      );
      ctx.textAlign = "right";
      ctx.fillStyle = "#86efac";
      ctx.fillText(`SAFE ${s.allowedSafe}/${s.totalSafe}`, CANVAS_W - 16, 14);
      ctx.textAlign = "center";
      ctx.fillStyle = "#fbbf24";
      const curNum = Math.min(shuffled.length, s.currentIdx + (s.current ? 1 : 0));
      ctx.fillText(`Item ${curNum} of ${shuffled.length}`, CANVAS_W / 2, 14);
      if (s.streak >= 3) {
        ctx.fillStyle = "#f97316";
        ctx.fillText(`STREAK x${s.streak}`, CANVAS_W / 2, 34);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (ctx) ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shuffled, showIntro]);

  const s = state.current;
  const stars = s.correct >= 10 ? 3 : s.correct >= 8 ? 2 : 1;
  const finished = s.finished;

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 760,
        margin: "0 auto",
        maxHeight: "calc(100vh - 140px)",
        borderRadius: 24,
        overflow: "hidden",
        background: "linear-gradient(180deg, #05060f 0%, #010106 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        touchAction: "none",
      }}
      tabIndex={0}
    >
      <ExerciseHowTo
        title="Protect the Data"
        steps={[
          { glyph: "🖱️", text: "Move your shield with the mouse or ←/→ keys" },
          { glyph: "🛡️", text: "BLOCK private info (red) before it lands" },
          { glyph: "✅", text: "Let SAFE info (green) through to score" },
        ]}
        accent="#60a5fa"
      />
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          cursor: "none",
        }}
        aria-label="Protect the Data game"
      />
      {finished && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(4,6,14,0.94)",
            backdropFilter: "blur(6px)",
            color: "#e2e8f0",
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
              background:
                "linear-gradient(135deg, #60a5fa, #22d3ee, #4ade80)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: 2,
            }}
          >
            MISSION COMPLETE!
          </div>
          <div style={{ marginTop: 10, fontSize: 18 }}>
            {s.correct} / {shuffled.length} correct
          </div>
          <div style={{ color: "#94a3b8", marginTop: 4, fontSize: 13 }}>
            Blocked {s.blockedPrivate}/{s.totalPrivate} private &nbsp;·&nbsp;
            Let {s.allowedSafe}/{s.totalSafe} safe through
          </div>
          <div style={{ fontSize: 36, margin: "14px 0" }}>
            {"★".repeat(stars)}
            <span style={{ color: "rgba(148,163,184,0.4)" }}>
              {"★".repeat(3 - stars)}
            </span>
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => {
                playSound("click");
                onComplete(s.correct);
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
            <button
              type="button"
              onClick={() => { playSound("select"); resetExercise(); }}
              style={{
                background: "transparent",
                color: "#93c5fd",
                fontWeight: 700,
                borderRadius: 14,
                padding: "12px 24px",
                fontSize: 14,
                border: "2px solid rgba(96,165,250,0.55)",
                cursor: "pointer",
              }}
            >
              🔄 Try Again
            </button>
          </div>
        </div>
      )}
      {showIntro && (
        <ExerciseIntro
          title="Protect the Data!"
          description="Private information is falling from the sky! Move your shield to block it — but let safe information through!"
          icon="🛡️"
          controls="Move mouse or arrow keys"
          onStart={() => setShowIntro(false)}
        />
      )}
    </div>
  );
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
