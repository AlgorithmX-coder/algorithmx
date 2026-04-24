"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { playSound } from "@/app/lib/sounds";
import { correctAnswerBurst } from "@/app/lib/celebrations";

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

  const shuffled = useMemo(() => shuffle(items), [items]);

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
    const onMouse = (e: MouseEvent) => onMove(canvasToLocal(e.clientX));
    const onTouch = (e: TouchEvent) => {
      if (e.touches.length > 0) onMove(canvasToLocal(e.touches[0].clientX));
    };
    const onKey = (e: KeyboardEvent) => {
      const step = 16;
      if (e.key === "ArrowLeft") {
        state.current.shieldTarget = Math.max(
          SHIELD_W / 2,
          state.current.shieldTarget - step
        );
      } else if (e.key === "ArrowRight") {
        state.current.shieldTarget = Math.min(
          CANVAS_W - SHIELD_W / 2,
          state.current.shieldTarget + step
        );
      }
    };
    wrap.addEventListener("mousemove", onMouse);
    wrap.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      wrap.removeEventListener("mousemove", onMouse);
      wrap.removeEventListener("touchmove", onTouch);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // Render loop
  useEffect(() => {
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

      // Background starfield
      const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
      bgGrad.addColorStop(0, "#0b1225");
      bgGrad.addColorStop(1, "#05060f");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      for (let i = 0; i < 40; i++) {
        const sx = (i * 97.3) % CANVAS_W;
        const sy = (i * 173.7) % CANVAS_H;
        const r = ((i * 13) % 3) / 2 + 0.4;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
      }

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
  }, [shuffled]);

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
        borderRadius: 24,
        overflow: "hidden",
        background: "linear-gradient(180deg, #05060f 0%, #010106 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        touchAction: "none",
      }}
      tabIndex={0}
    >
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
        </div>
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
