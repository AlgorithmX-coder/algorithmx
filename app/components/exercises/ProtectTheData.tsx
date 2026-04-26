"use client";

/*
 * ProtectTheData — Pixar 2.5D commercial polish.
 *
 * Game logic preserved: move the shield horizontally, block private
 * info from landing, let safe info pass. Visuals fully redesigned:
 * sunset sky with painted clouds drifting overhead (replacing the
 * pixel-invader formation), paper-card falling items in warm tints,
 * a golden Pixar shield, tactile motion for the win screen.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { playSound } from "@/app/lib/sounds";
import { correctAnswerBurst } from "@/app/lib/celebrations";
import ExerciseIntro from "./ExerciseIntro";
import ExerciseHowTo from "./ExerciseHowTo";
import { COLOR, SHADOW, SPRING } from "@/app/components/scene/tokens";

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
  x: number;
  y: number;
  vx: number;
  vy: number;
  spin: number;
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
const SHIELD_W = 130;
const SHIELD_H = 44;
const SHIELD_Y = CANVAS_H - 64;
const ITEM_W = 188;
const ITEM_H = 54;

/* ───────────────── PIXAR CANVAS PALETTE ───────────────── */

const PV = {
  // Sky stops (top to bottom) — cyber abyss → midnight → twilight
  // navy. Was a warm sunset gradient bleeding orange into the floor;
  // user spotted that when the cards floated past.
  skyTop: "#04050d",
  skyMid: "#0f1530",
  skyHorizon: "#1a2147",
  skyHaze: "#252d5e",
  skyFloor: "#1a2147",
  // Star sparkles in upper sky
  starColor: "rgba(255, 250, 220, ",
  // Clouds (silhouette)
  cloudFar: "rgba(60, 28, 60, 0.45)",
  cloudMid: "rgba(80, 36, 60, 0.55)",
  cloudNear: "rgba(40, 18, 40, 0.65)",
  // Floor scan
  floorLine: "rgba(124, 92, 255, 0.35)",
  // Falling items (paper cards)
  cardShadow: "rgba(40, 18, 8, 0.4)",
  cardPrivateBody: "#1a2147",
  cardPrivateAccent: "#ff7a59",
  cardSafeBody: "#fdf6ee",
  cardSafeAccent: "#4a9a6a",
  cardText: "#3b2615",
  // Shield (golden)
  shieldHalo: "rgba(255, 220, 160, 0.5)",
  shieldGradTop: "#ffe9b8",
  shieldGradMid: "#ffc97a",
  shieldGradBottom: "#3a7bff",
  shieldRim: "rgba(255, 245, 220, 0.8)",
  shieldGlow: "#7c5cff",
  // Edge flash
  edgeFlashGood: "#7eff97",
  edgeFlashBad: "#ff7a59",
  edgeFlashWarn: "#e89938",
  // Floaters
  floaterCorrect: "#7eff97",
  floaterWrong: "#ff7a59",
  floaterSlow: "#e89938",
  // HUD
  hudBlocked: "#a0ffb0",
  hudSafe: "#fcd34d",
  hudCounter: "#00e5ff",
  hudStreak: "#ff5fb3",
} as const;

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
      addFloater("BLOCKED!", PV.floaterCorrect);
      burst(PV.floaterCorrect, 14);
      state.current.blockedPrivate += 1;
      state.current.correct += 1;
      state.current.streak += 1;
      item.bounceVy = -10;
      item.vy = -10;
      onCorrect?.();
    } else if (outcome === "passed") {
      playSound("sortCorrect");
      addFloater("SAFE ✓", PV.floaterCorrect);
      burst(PV.floaterCorrect, 8);
      state.current.allowedSafe += 1;
      state.current.correct += 1;
      state.current.streak += 1;
      onCorrect?.();
    } else if (outcome === "wrong-block") {
      playSound("wrong");
      addFloater("OOPS! That was safe!", PV.floaterSlow);
      burst(PV.floaterSlow, 10);
      state.current.edgeFlash = { colour: PV.edgeFlashWarn, until: now + 250 };
      state.current.streak = 0;
      item.bounceVy = -8;
      item.vy = -8;
      onWrong?.();
    } else {
      playSound("wrong");
      addFloater("EXPOSED!", PV.floaterWrong);
      burst(PV.floaterWrong, 14);
      state.current.edgeFlash = { colour: PV.edgeFlashBad, until: now + 300 };
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
    const onMouseDown = (e: MouseEvent) => onMove(canvasToLocal(e.clientX));
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) onMove(canvasToLocal(e.touches[0].clientX));
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) onMove(canvasToLocal(e.touches[0].clientX));
    };
    const NAV_CODES = new Set([
      "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
      "KeyA", "KeyD", "KeyW", "KeyS",
    ]);
    const onKey = (e: KeyboardEvent) => {
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

      s.shieldX += (s.shieldTarget - s.shieldX) * Math.min(1, 0.25 * frames);

      if (!s.current && !s.finished) {
        if (s.currentIdx >= shuffled.length) {
          finish();
        } else if (now >= s.nextSpawnAt) {
          spawnItem(s.currentIdx);
        }
      }

      if (s.current) {
        const c = s.current;
        if (!c.resolved) {
          c.x += c.vx * frames;
          c.y += c.vy * frames;
          c.spin += 0.04 * frames;
          if (c.x < c.width / 2 + 10) {
            c.x = c.width / 2 + 10;
            c.vx = Math.abs(c.vx);
          } else if (c.x > CANVAS_W - c.width / 2 - 10) {
            c.x = CANVAS_W - c.width / 2 - 10;
            c.vx = -Math.abs(c.vx);
          }

          const shieldLeft = s.shieldX - SHIELD_W / 2;
          const shieldRight = s.shieldX + SHIELD_W / 2;
          const shieldTop = SHIELD_Y;
          const shieldBottom = SHIELD_Y + SHIELD_H;
          const itemLeft = c.x - c.width / 2;
          const itemRight = c.x + c.width / 2;
          const itemBottom = c.y + c.height;
          const overlapsX = itemRight > shieldLeft && itemLeft < shieldRight;
          const overlapsY = itemBottom > shieldTop && c.y < shieldBottom;
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

      s.floaters = s.floaters.filter((f) => now - f.bornAt < 900);
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

      // Sunset gradient sky
      const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
      bgGrad.addColorStop(0, PV.skyTop);
      bgGrad.addColorStop(0.25, PV.skyMid);
      bgGrad.addColorStop(0.55, PV.skyHorizon);
      bgGrad.addColorStop(0.78, PV.skyHaze);
      bgGrad.addColorStop(1, PV.skyFloor);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Soft sun glow
      const sun = ctx.createRadialGradient(
        CANVAS_W * 0.78,
        CANVAS_H * 0.42,
        4,
        CANVAS_W * 0.78,
        CANVAS_H * 0.42,
        140
      );
      sun.addColorStop(0, "rgba(255, 250, 220, 0.85)");
      sun.addColorStop(0.4, "rgba(255, 200, 130, 0.35)");
      sun.addColorStop(1, "rgba(255, 160, 90, 0)");
      ctx.fillStyle = sun;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Twinkling stars in upper purple
      for (let i = 0; i < 40; i++) {
        const sx = (i * 97.3) % CANVAS_W;
        const sy = (i * 61.7) % 130;
        const r = ((i * 13) % 3) / 2 + 0.4;
        const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(now * 0.002 + i * 0.7));
        ctx.fillStyle = PV.starColor + (0.25 + 0.45 * tw) + ")";
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Drifting clouds (3 layers, parallax)
      const cloudPhase = now / 18000;
      const drawCloud = (
        baseX: number,
        y: number,
        scale: number,
        colour: string,
        speed: number
      ) => {
        const x = ((baseX + cloudPhase * speed) % (CANVAS_W + 200)) - 100;
        ctx.fillStyle = colour;
        ctx.beginPath();
        ctx.arc(x, y, 22 * scale, 0, Math.PI * 2);
        ctx.arc(x + 24 * scale, y - 6 * scale, 26 * scale, 0, Math.PI * 2);
        ctx.arc(x + 50 * scale, y, 22 * scale, 0, Math.PI * 2);
        ctx.arc(x + 32 * scale, y + 8 * scale, 20 * scale, 0, Math.PI * 2);
        ctx.fill();
      };
      drawCloud(80, 70, 1.0, PV.cloudFar, 480);
      drawCloud(360, 95, 1.2, PV.cloudFar, 420);
      drawCloud(580, 65, 0.9, PV.cloudFar, 520);
      drawCloud(180, 130, 1.1, PV.cloudMid, 360);
      drawCloud(480, 145, 1.0, PV.cloudMid, 320);
      drawCloud(40, 180, 1.3, PV.cloudNear, 240);
      drawCloud(420, 195, 1.15, PV.cloudNear, 220);

      // Warm horizon ground line
      ctx.strokeStyle = PV.floorLine;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, SHIELD_Y + 26);
      ctx.lineTo(CANVAS_W, SHIELD_Y + 26);
      ctx.stroke();

      // Edge flash
      if (s.edgeFlash && now < s.edgeFlash.until) {
        const alpha = (s.edgeFlash.until - now) / 300;
        ctx.strokeStyle = s.edgeFlash.colour;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 18;
        ctx.strokeRect(9, 9, CANVAS_W - 18, CANVAS_H - 18);
        ctx.globalAlpha = 1;
      } else if (s.edgeFlash && now >= s.edgeFlash.until) {
        s.edgeFlash = null;
      }

      // Falling card
      if (s.current) {
        const c = s.current;
        const tilt = Math.sin(c.spin) * 0.08;
        ctx.save();
        ctx.translate(c.x, c.y + c.height / 2);
        ctx.rotate(tilt);

        // Soft drop shadow
        ctx.fillStyle = PV.cardShadow;
        roundRect(
          ctx,
          -c.width / 2 + 3,
          -c.height / 2 + 5,
          c.width,
          c.height,
          14
        );
        ctx.fill();

        // Holographic card body — IDENTICAL for safe and private
        // pre-decision (was giving the answer away by tinting safe
        // green / private yellow before the kid acted). Player has
        // to read the text to classify; reveal happens via the
        // post-tap outcome animation, not here.
        const grad = ctx.createLinearGradient(0, -c.height / 2, 0, c.height / 2);
        grad.addColorStop(0, "rgba(232, 237, 255, 0.96)");
        grad.addColorStop(1, "rgba(197, 205, 240, 0.92)");
        ctx.fillStyle = grad;
        roundRect(ctx, -c.width / 2, -c.height / 2, c.width, c.height, 14);
        ctx.fill();

        // Cyan accent strip along top — same on every card
        ctx.fillStyle = "rgba(0, 229, 255, 0.85)";
        roundRect(ctx, -c.width / 2, -c.height / 2, c.width, 6, 14);
        ctx.fill();

        // Tag dot (left) — neutral cosmic violet on every card
        ctx.fillStyle = "rgba(124, 92, 255, 0.85)";
        ctx.beginPath();
        ctx.arc(-c.width / 2 + 18, 0, 6, 0, Math.PI * 2);
        ctx.fill();

        // Border — neutral cyan on every card (the post-tap outcome
        // overlay handles the green/pink reveal feedback)
        ctx.strokeStyle = "rgba(0, 229, 255, 0.55)";
        ctx.lineWidth = 2;
        roundRect(ctx, -c.width / 2, -c.height / 2, c.width, c.height, 14);
        ctx.stroke();

        // Text
        ctx.fillStyle = PV.cardText;
        ctx.font = "700 14px ui-rounded, 'Fredoka', system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(c.text, 6, 1, c.width - 36);
        ctx.restore();
      }

      // Golden Pixar shield
      const sx = s.shieldX;
      const sy = SHIELD_Y;
      // Halo above
      const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, 110);
      halo.addColorStop(0, PV.shieldHalo);
      halo.addColorStop(1, "rgba(255, 220, 160, 0)");
      ctx.fillStyle = halo;
      ctx.fillRect(sx - 110, sy - 80, 220, 90);
      // Body
      const sGrad = ctx.createLinearGradient(0, sy, 0, sy + SHIELD_H);
      sGrad.addColorStop(0, PV.shieldGradTop);
      sGrad.addColorStop(0.5, PV.shieldGradMid);
      sGrad.addColorStop(1, PV.shieldGradBottom);
      ctx.fillStyle = sGrad;
      roundRect(ctx, sx - SHIELD_W / 2, sy, SHIELD_W, SHIELD_H, 22);
      ctx.fill();
      // Top highlight
      const highlight = ctx.createLinearGradient(0, sy, 0, sy + 14);
      highlight.addColorStop(0, "rgba(255, 255, 230, 0.7)");
      highlight.addColorStop(1, "rgba(255, 255, 230, 0)");
      ctx.fillStyle = highlight;
      roundRect(ctx, sx - SHIELD_W / 2 + 4, sy + 2, SHIELD_W - 8, 14, 16);
      ctx.fill();
      // Rim
      ctx.strokeStyle = PV.shieldRim;
      ctx.lineWidth = 2;
      roundRect(ctx, sx - SHIELD_W / 2, sy, SHIELD_W, SHIELD_H, 22);
      ctx.stroke();
      // Glow
      ctx.shadowColor = PV.shieldGlow;
      ctx.shadowBlur = 24;
      roundRect(ctx, sx - SHIELD_W / 2, sy, SHIELD_W, SHIELD_H, 22);
      ctx.stroke();
      ctx.shadowBlur = 0;
      // Centre crest
      ctx.fillStyle = "#5a2e14";
      ctx.font = "900 18px ui-rounded, 'Fredoka', system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🛡", sx, sy + SHIELD_H / 2 + 1);

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

      // Floaters with warm dark stroke
      for (const f of s.floaters) {
        const age = now - f.bornAt;
        const alpha = Math.max(0, 1 - age / 900);
        const dy = -age * 0.08;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = f.colour;
        ctx.strokeStyle = "rgba(40, 18, 12, 0.7)";
        ctx.lineWidth = 4;
        ctx.font = "900 20px ui-rounded, 'Fredoka', system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeText(f.text, f.x, f.y + dy);
        ctx.fillText(f.text, f.x, f.y + dy);
      }
      ctx.globalAlpha = 1;

      // HUD
      ctx.font = "800 14px ui-rounded, 'Fredoka', system-ui, sans-serif";
      ctx.textBaseline = "top";
      ctx.textAlign = "left";
      ctx.fillStyle = PV.hudBlocked;
      ctx.fillText(`BLOCKED ${s.blockedPrivate}/${s.totalPrivate}`, 16, 14);
      ctx.textAlign = "right";
      ctx.fillStyle = PV.hudSafe;
      ctx.fillText(`SAFE ${s.allowedSafe}/${s.totalSafe}`, CANVAS_W - 16, 14);
      ctx.textAlign = "center";
      ctx.fillStyle = PV.hudCounter;
      const curNum = Math.min(shuffled.length, s.currentIdx + (s.current ? 1 : 0));
      ctx.fillText(`Item ${curNum} of ${shuffled.length}`, CANVAS_W / 2, 14);
      if (s.streak >= 3) {
        ctx.fillStyle = PV.hudStreak;
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
        borderRadius: 28,
        overflow: "hidden",
        background:
          "linear-gradient(180deg, #0f1530 0%, #1a2147 55%, #252d5e 100%)",
        boxShadow: SHADOW.sceneFrame,
        touchAction: "none",
        fontFamily:
          "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
        color: COLOR.inkDeep,
      }}
      tabIndex={0}
    >
      <ExerciseHowTo
        title="Protect the Data"
        steps={[
          { glyph: "🖱️", text: "Move your shield with the mouse or ←/→ keys" },
          { glyph: "🛡️", text: "BLOCK private info before it lands" },
          { glyph: "✅", text: "Let SAFE info through to score" },
        ]}
        accent="#3a7bff"
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
        <FinishOverlay
          correct={s.correct}
          total={shuffled.length}
          stars={stars}
          blocked={s.blockedPrivate}
          totalPrivate={s.totalPrivate}
          safe={s.allowedSafe}
          totalSafe={s.totalSafe}
          onContinue={() => {
            playSound("click");
            onComplete(s.correct);
          }}
          onRetry={() => {
            playSound("select");
            resetExercise();
          }}
        />
      )}
      {showIntro && (
        <ExerciseIntro
          title="Protect the Data!"
          description="Private info is falling from the sky. Move your golden shield to block it — but let safe info through!"
          icon="🛡️"
          controls="Move mouse or arrow keys"
          onStart={() => setShowIntro(false)}
        />
      )}
      <span style={{ display: "none" }}>{render}</span>
    </div>
  );
}

/* ───────────────────────── FINISH OVERLAY ───────────────────────── */

function FinishOverlay({
  correct,
  total,
  stars,
  blocked,
  totalPrivate,
  safe,
  totalSafe,
  onContinue,
  onRetry,
}: {
  correct: number;
  total: number;
  stars: number;
  blocked: number;
  totalPrivate: number;
  safe: number;
  totalSafe: number;
  onContinue: () => void;
  onRetry: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(180deg, rgba(15, 21, 48, 0.95) 0%, rgba(20, 8, 24, 0.96) 100%)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        color: COLOR.cream,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: 28,
        gap: 4,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: 5,
          color: "#00e5ff",
          textTransform: "uppercase",
          marginBottom: 4,
        }}
      >
        ✦ Mission Complete ✦
      </div>
      <div
        style={{
          fontSize: 36,
          fontWeight: 900,
          background:
            "linear-gradient(135deg, #00e5ff, #7c5cff, #3a7bff)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: 1,
        }}
      >
        SHIELDED!
      </div>
      <div style={{ marginTop: 4, fontSize: 16, opacity: 0.92 }}>
        {correct} / {total} correct
      </div>
      <div
        style={{
          marginTop: 4,
          fontSize: 12,
          opacity: 0.75,
          letterSpacing: 1,
        }}
      >
        Blocked {blocked}/{totalPrivate} private &nbsp;·&nbsp; Let {safe}/{totalSafe} safe through
      </div>
      <div style={{ display: "flex", gap: 4, margin: "12px 0" }}>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={{
              opacity: i < stars ? 1 : 0.25,
              scale: 1,
              rotate: 0,
            }}
            transition={{
              ...SPRING.bouncy,
              delay: 0.3 + i * 0.18,
            }}
            style={{
              fontSize: 38,
              filter:
                i < stars
                  ? "drop-shadow(0 0 14px rgba(255, 200, 100, 0.7))"
                  : "grayscale(0.6)",
            }}
          >
            ★
          </motion.span>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          gap: 12,
          justifyContent: "center",
          flexWrap: "wrap",
          marginTop: 8,
        }}
      >
        <motion.button
          type="button"
          onClick={onContinue}
          whileHover={{ y: -3, scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          transition={SPRING.snappy}
          style={{
            border: "none",
            cursor: "pointer",
            padding: "14px 36px",
            fontSize: 16,
            fontWeight: 800,
            color: COLOR.goldDark,
            background:
              `linear-gradient(135deg, ${COLOR.goldLight}, ${COLOR.goldMid})`,
            borderRadius: 999,
            fontFamily: "inherit",
            letterSpacing: 0.5,
            boxShadow: SHADOW.primaryButton,
          }}
        >
          Continue →
        </motion.button>
        <motion.button
          type="button"
          onClick={onRetry}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          transition={SPRING.snappy}
          style={{
            border: "none",
            cursor: "pointer",
            padding: "12px 24px",
            fontSize: 14,
            fontWeight: 800,
            color: COLOR.cream,
            background: "rgba(15, 21, 48, 0.65)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            borderRadius: 999,
            fontFamily: "inherit",
            letterSpacing: 0.5,
            boxShadow: SHADOW.drop,
          }}
        >
          ↻ Try Again
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ───────────────────────── HELPERS ───────────────────────── */

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
