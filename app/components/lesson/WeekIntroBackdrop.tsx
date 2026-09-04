"use client";

/**
 * WeekIntroBackdrop — a live-moving canvas backdrop for the ATLAS "Mission
 * Command" briefing (WeekIntroScene). Every week gets its OWN bespoke scene
 * (a genuinely different animation, not just a recolour): the Vault turns its
 * tumbler dials, the Arcade rushes down a neon corridor, the Rabbit-Hole zooms
 * you inward, the Alert Centre sweeps a radar, the Snowfield falls in parallax,
 * the Ceremony throws spotlights + confetti...
 *
 * Scenes are drawn in that week's palette (from WEEK_THEMES) and kept tasteful
 * (glow-additive, moderate speed) so they read as atmosphere behind the
 * briefing. Hi-DPI aware, pauses when the tab is hidden, one still frame under
 * prefers-reduced-motion.
 */

import { useEffect, useRef } from "react";
import { WEEK_THEMES } from "@/app/lesson/weekContent/weekThemes";

type RGB = [number, number, number];
interface Palette {
  accentHex: string;
  accent: RGB;
  second: RGB;
  third: RGB;
}
type SceneDraw = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number, // seconds elapsed
  dt: number // seconds since last frame
) => void;
type SceneFactory = (p: Palette) => SceneDraw;

const TAU = Math.PI * 2;
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(arr: T[]): T => arr[(Math.random() * arr.length) | 0];
const rgba = (c: RGB, a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function hexToRgb(hex: string): RGB {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/(.)/g, "$1$1") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const numToRgb = (n: number): RGB => [(n >> 16) & 255, (n >> 8) & 255, n & 255];

const WHITE: RGB = [235, 242, 255];

function buildPalette(week: number, fallback: string): Palette {
  const theme = WEEK_THEMES[week];
  const accentHex = theme?.accent ?? fallback;
  const parts = theme?.arena.particles ?? [];
  const accent = hexToRgb(accentHex);
  return {
    accentHex,
    accent,
    second: parts[1] != null ? numToRgb(parts[1]) : accent,
    third: parts[2] != null ? numToRgb(parts[2]) : accent,
  };
}

/* ───────────────────────── bespoke scenes ───────────────────────── */

// WK1 · Vault — concentric tumbler dials turning at different speeds.
const sceneVault: SceneFactory = (p) => (ctx, w, h, t) => {
  const cx = w / 2;
  const cy = h * 0.46;
  const base = Math.min(w, h);
  const rings = [
    { r: 0.42, sp: 0.22, ticks: 48, notch: 6 },
    { r: 0.30, sp: -0.36, ticks: 36, notch: 4 },
    { r: 0.19, sp: 0.55, ticks: 24, notch: 3 },
  ];
  ctx.lineCap = "round";
  rings.forEach((ring, ri) => {
    const R = base * ring.r;
    const ang = t * ring.sp;
    ctx.strokeStyle = rgba(p.accent, 0.13);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, TAU);
    ctx.stroke();
    const per = ring.ticks / ring.notch;
    for (let i = 0; i < ring.ticks; i++) {
      const a = ang + (i / ring.ticks) * TAU;
      const major = i % per === 0;
      const inner = R - 6;
      const outer = R + (major ? 14 : 6);
      ctx.strokeStyle = rgba(p.accent, major ? 0.5 : 0.2);
      ctx.lineWidth = major ? 3 : 1.5;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
      ctx.lineTo(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer);
      ctx.stroke();
    }
    for (let i = 0; i < ring.notch; i++) {
      const a = ang + (i / ring.notch) * TAU + ri;
      const x = cx + Math.cos(a) * R;
      const y = cy + Math.sin(a) * R;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, TAU);
      ctx.fillStyle = rgba(p.accent, 0.75);
      ctx.shadowColor = rgba(p.accent, 0.8);
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  });
  ctx.beginPath();
  ctx.arc(cx, cy, base * 0.05, 0, TAU);
  ctx.fillStyle = rgba(p.accent, 0.1);
  ctx.fill();
  ctx.strokeStyle = rgba(p.accent, 0.5);
  ctx.lineWidth = 2;
  ctx.stroke();
};

// WK6 · Neon Arcade — a perspective corridor rushing toward the viewer.
const sceneCorridor: SceneFactory = (p) => (ctx, w, h, t) => {
  const cx = w / 2;
  const vy = h * 0.5;
  const speed = 0.5;
  ctx.lineWidth = 1.5;
  const N = 15;
  for (let i = 0; i < N; i++) {
    const f = ((i / N + (t * speed) % (1 / N)) % 1);
    const depth = f * f;
    const yF = vy + (h - vy) * depth;
    const yC = vy - vy * depth;
    const alpha = 0.04 + 0.24 * (1 - f);
    ctx.strokeStyle = rgba(p.accent, alpha);
    ctx.beginPath();
    ctx.moveTo(0, yF);
    ctx.lineTo(w, yF);
    ctx.stroke();
    ctx.strokeStyle = rgba(p.second, alpha * 0.85);
    ctx.beginPath();
    ctx.moveTo(0, yC);
    ctx.lineTo(w, yC);
    ctx.stroke();
  }
  const cols = 9;
  for (let i = -cols; i <= cols; i++) {
    const x = cx + (i / cols) * w;
    const a = 0.05 + 0.1 * (1 - Math.abs(i) / cols);
    ctx.strokeStyle = rgba(p.accent, a);
    ctx.beginPath();
    ctx.moveTo(cx, vy);
    ctx.lineTo(x, h);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, vy);
    ctx.lineTo(x, 0);
    ctx.stroke();
  }
  const g = ctx.createRadialGradient(cx, vy, 0, cx, vy, w * 0.42);
  g.addColorStop(0, rgba(p.accent, 0.2));
  g.addColorStop(1, rgba(p.accent, 0));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
};

// WK10 · Glowing Burrow — a tunnel of rings zooming inward (the rabbit hole).
const sceneTunnel: SceneFactory = (p) => (ctx, w, h, t) => {
  const cx = w / 2;
  const cy = h * 0.44;
  const N = 11;
  const maxR = Math.max(w, h) * 0.95;
  for (let i = 0; i < N; i++) {
    const f = ((i / N + (t * 0.13) % (1 / N)) % 1);
    const R = f * f * maxR + 6;
    const alpha = 0.05 + 0.26 * (1 - f);
    ctx.strokeStyle = rgba(i % 2 ? p.accent : p.second, alpha);
    ctx.lineWidth = 1.5 + 3 * (1 - f);
    ctx.beginPath();
    ctx.ellipse(cx, cy, R, R * 0.82, 0, 0, TAU);
    ctx.stroke();
  }
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.3);
  g.addColorStop(0, rgba(p.accent, 0.24));
  g.addColorStop(1, rgba(p.accent, 0));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
};

// WK11 · Alert Centre — a radar with range rings, a sweep, and lighting blips.
const sceneRadar: SceneFactory = (p) => {
  const blips = Array.from({ length: 7 }, () => ({ a: rnd(0, TAU), r: rnd(0.25, 0.92), lit: 0 }));
  return (ctx, w, h, t, dt) => {
    const cx = w / 2;
    const cy = h * 0.45;
    const R = Math.min(w, h) * 0.52;
    ctx.strokeStyle = rgba(p.accent, 0.12);
    ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy, (R * i) / 4, 0, TAU);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(cx - R, cy);
    ctx.lineTo(cx + R, cy);
    ctx.moveTo(cx, cy - R);
    ctx.lineTo(cx, cy + R);
    ctx.stroke();
    const ang = (t * 0.9) % TAU;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
    g.addColorStop(0, rgba(p.accent, 0.28));
    g.addColorStop(1, rgba(p.accent, 0));
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(ang);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, R, -0.38, 0);
    ctx.closePath();
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = rgba(p.accent, 0.5);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(R, 0);
    ctx.stroke();
    ctx.restore();
    for (const b of blips) {
      const da = ((ang - b.a) % TAU + TAU) % TAU;
      if (da < 0.12) b.lit = 1;
      b.lit = Math.max(0, b.lit - dt * 0.5);
      if (b.lit > 0.01) {
        const bx = cx + Math.cos(b.a) * R * b.r;
        const by = cy + Math.sin(b.a) * R * b.r;
        ctx.beginPath();
        ctx.arc(bx, by, 3 + b.lit * 2, 0, TAU);
        ctx.fillStyle = rgba(p.accent, b.lit);
        ctx.shadowColor = rgba(p.accent, b.lit);
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
  };
};

// WK12 · Snowfield — three parallax layers of falling snow + a ground glow.
const sceneSnow: SceneFactory = (p) => {
  const defs = [
    { n: 34, sp: 14, r: [0.6, 1.4] as const, a: 0.22 },
    { n: 26, sp: 28, r: [1.2, 2.2] as const, a: 0.42 },
    { n: 16, sp: 46, r: [2, 3.4] as const, a: 0.7 },
  ];
  let flakes: { x: number; y: number; r: number; ph: number }[][] | null = null;
  return (ctx, w, h, t, dt) => {
    if (!flakes) {
      flakes = defs.map((L) =>
        Array.from({ length: L.n }, () => ({ x: rnd(0, w), y: rnd(0, h), r: rnd(L.r[0], L.r[1]), ph: rnd(0, TAU) }))
      );
    }
    const g = ctx.createLinearGradient(0, h * 0.68, 0, h);
    g.addColorStop(0, rgba(p.accent, 0));
    g.addColorStop(1, rgba(p.accent, 0.12));
    ctx.fillStyle = g;
    ctx.fillRect(0, h * 0.68, w, h * 0.32);
    defs.forEach((L, li) => {
      for (const fk of flakes![li]) {
        fk.y += L.sp * dt;
        fk.x += Math.sin(t * 0.6 + fk.ph) * 9 * dt;
        if (fk.y > h + 4) {
          fk.y = -4;
          fk.x = rnd(0, w);
        }
        ctx.beginPath();
        ctx.arc(fk.x, fk.y, fk.r, 0, TAU);
        ctx.fillStyle = rgba(WHITE, L.a);
        ctx.fill();
      }
    });
  };
};

// WK20 · Ceremony — sweeping spotlights, twinkling stars, falling confetti.
const sceneCeremony: SceneFactory = (p) => {
  const stars = Array.from({ length: 44 }, () => ({ x: Math.random(), y: Math.random() * 0.7, ph: rnd(0, TAU) }));
  let conf: { x: number; y: number; r: number; vy: number; rot: number; vr: number; c: RGB }[] | null = null;
  return (ctx, w, h, t, dt) => {
    if (!conf) {
      conf = Array.from({ length: 44 }, () => ({
        x: rnd(0, w), y: rnd(-h, 0), r: rnd(2, 5), vy: rnd(30, 70),
        rot: rnd(0, TAU), vr: rnd(-3, 3), c: pick([p.accent, p.second, WHITE]),
      }));
    }
    for (const s of stars) {
      const tw = 0.25 + 0.4 * Math.abs(Math.sin(t * 1.2 + s.ph));
      ctx.fillStyle = rgba(WHITE, tw * 0.5);
      ctx.fillRect(s.x * w, s.y * h, 2, 2);
    }
    for (let i = 0; i < 3; i++) {
      const baseX = w * (0.3 + 0.2 * i);
      const ang = Math.sin(t * 0.5 + i * 2) * 0.5;
      ctx.save();
      ctx.translate(baseX, -20);
      ctx.rotate(ang);
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, rgba(i === 1 ? p.accent : p.second, 0.16));
      grad.addColorStop(1, rgba(p.accent, 0));
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-90, h);
      ctx.lineTo(90, h);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    }
    for (const c of conf) {
      c.y += c.vy * dt;
      c.x += Math.sin(t + c.rot) * 10 * dt;
      c.rot += c.vr * dt;
      if (c.y > h + 8) {
        c.y = -8;
        c.x = rnd(0, w);
      }
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);
      ctx.fillStyle = rgba(c.c, 0.8);
      ctx.fillRect(-c.r / 2, -c.r / 2, c.r, c.r * 0.6);
      ctx.restore();
    }
  };
};

// WK2 · Safehouse — slow diagonal light shafts (security light through shutters).
const sceneShafts: SceneFactory = (p) => (ctx, w, h, t) => {
  const n = 5;
  for (let i = 0; i < n; i++) {
    const phase = (t * 0.07 + i / n) % 1;
    const x = phase * (w + 320) - 160;
    const width = 60 + i * 12;
    const col = i % 2 ? p.second : p.accent;
    ctx.save();
    ctx.translate(x, 0);
    ctx.rotate(0.32);
    const g = ctx.createLinearGradient(-width, 0, width, 0);
    g.addColorStop(0, rgba(col, 0));
    g.addColorStop(0.5, rgba(col, 0.1));
    g.addColorStop(1, rgba(col, 0));
    ctx.fillStyle = g;
    ctx.fillRect(-width, -h, width * 2, h * 3);
    ctx.restore();
  }
};

// WK3 · Masquerade Street — warm lanterns swaying on strings.
const sceneLanterns: SceneFactory = (p) => {
  const lns = Array.from({ length: 7 }, (_, i) => ({
    x: (i + 0.5) / 7, y: rnd(0.14, 0.4), r: rnd(11, 20), ph: rnd(0, TAU), sp: rnd(0.4, 0.9),
  }));
  return (ctx, w, h, t) => {
    for (const l of lns) {
      const x = l.x * w + Math.sin(t * l.sp + l.ph) * 14;
      const y = l.y * h + Math.sin(t * l.sp * 0.7 + l.ph) * 6;
      ctx.strokeStyle = rgba(p.accent, 0.1);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(l.x * w, 0);
      ctx.lineTo(x, y);
      ctx.stroke();
      const g = ctx.createRadialGradient(x, y, 0, x, y, l.r * 3);
      g.addColorStop(0, rgba(p.accent, 0.5));
      g.addColorStop(1, rgba(p.accent, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, l.r * 3, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, l.r * 0.5, 0, TAU);
      ctx.fillStyle = rgba(p.accent, 0.85);
      ctx.fill();
    }
  };
};

// WK4 · Carnival of Fakes — a spinning carousel of chasing bulbs.
const sceneCarousel: SceneFactory = (p) => (ctx, w, h, t) => {
  const cx = w / 2;
  const cy = h * 0.45;
  const R = Math.min(w, h) * 0.34;
  const n = 16;
  const cols: RGB[] = [p.accent, p.second, p.third];
  for (let i = 0; i < n; i++) {
    const a = t * 0.5 + (i / n) * TAU;
    const x = cx + Math.cos(a) * R;
    const y = cy + Math.sin(a) * R * 0.6;
    const on = Math.sin(t * 4 + i) * 0.5 + 0.5;
    const col = cols[i % 3];
    const g = ctx.createRadialGradient(x, y, 0, x, y, 11);
    g.addColorStop(0, rgba(col, 0.3 + 0.5 * on));
    g.addColorStop(1, rgba(col, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, 11, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, TAU);
    ctx.fillStyle = rgba(col, 0.6 + 0.4 * on);
    ctx.fill();
  }
};

// WK5 · Warm Campfire — a base glow with sparks spiralling up in a cone.
const sceneCampfire: SceneFactory = (p) => {
  const sparks = Array.from({ length: 40 }, () => ({ x: rnd(-1, 1), sp: rnd(0.3, 0.8), ph: rnd(0, TAU), r: rnd(1, 2.6), a: rnd(0.3, 0.8) }));
  return (ctx, w, h, t) => {
    const cx = w / 2;
    const g = ctx.createRadialGradient(cx, h, 0, cx, h, h * 0.6);
    g.addColorStop(0, rgba(p.accent, 0.18 * (0.85 + 0.15 * Math.sin(t * 6))));
    g.addColorStop(1, rgba(p.accent, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    for (const s of sparks) {
      const life = (t * s.sp + s.ph) % 1;
      const y = h - life * h * 1.05;
      const spread = (1 - life) * w * 0.12 + 20;
      const x = cx + Math.sin((t + s.ph) * 2) * spread + s.x * spread * 0.5;
      const a = s.a * (1 - life);
      ctx.beginPath();
      ctx.arc(x, y, s.r, 0, TAU);
      ctx.fillStyle = rgba(p.accent, a);
      ctx.shadowColor = rgba(p.accent, a);
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  };
};

// WK7 · Loot Shop — falling, spinning coins that glint.
const sceneCoins: SceneFactory = (p) => {
  const coins = Array.from({ length: 22 }, () => ({ x: rnd(0, 1), y: rnd(-1, 1), r: rnd(6, 14), vy: rnd(0.06, 0.14), ph: rnd(0, TAU), spin: rnd(1.5, 3.5) }));
  return (ctx, w, h, t) => {
    for (const c of coins) {
      const y = ((c.y + t * c.vy) % 1.2) * h - h * 0.1;
      const x = c.x * w;
      const sw = Math.abs(Math.cos(t * c.spin + c.ph));
      const col = c.ph > 3 ? p.second : p.accent;
      ctx.save();
      ctx.translate(x, y);
      ctx.beginPath();
      ctx.ellipse(0, 0, c.r * sw + 1, c.r, 0, 0, TAU);
      ctx.fillStyle = rgba(col, 0.6);
      ctx.strokeStyle = rgba(col, 0.9);
      ctx.lineWidth = 1.5;
      ctx.fill();
      ctx.stroke();
      if (sw > 0.85) {
        ctx.fillStyle = rgba(WHITE, 0.55);
        ctx.beginPath();
        ctx.ellipse(0, -c.r * 0.3, c.r * 0.2, c.r * 0.4, 0, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }
  };
};

// WK8 · Darkroom — photos developing (fading in/out) under a red safelight.
const sceneDarkroom: SceneFactory = (p) => {
  const photos = Array.from({ length: 8 }, () => ({ x: rnd(0.12, 0.88), y: rnd(0.16, 0.8), pw: rnd(60, 110), phh: rnd(46, 80), ph: rnd(0, TAU), sp: rnd(0.15, 0.35) }));
  return (ctx, w, h, t) => {
    const g = ctx.createRadialGradient(w * 0.5, 0, 0, w * 0.5, 0, h * 0.9);
    g.addColorStop(0, rgba(p.accent, 0.1));
    g.addColorStop(1, rgba(p.accent, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    for (const ph of photos) {
      const dev = Math.sin(t * ph.sp + ph.ph) * 0.5 + 0.5;
      const x = ph.x * w;
      const y = ph.y * h;
      ctx.strokeStyle = rgba(p.accent, 0.15 + 0.3 * dev);
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x - ph.pw / 2, y - ph.phh / 2, ph.pw, ph.phh);
      ctx.fillStyle = rgba(p.second, 0.05 + 0.14 * dev);
      ctx.fillRect(x - ph.pw / 2, y - ph.phh / 2, ph.pw, ph.phh);
    }
  };
};

// WK9 · Conveyor — parallax belts carrying app tiles across.
const sceneConveyor: SceneFactory = (p) => (ctx, w, h, t) => {
  const belts = [
    { y: 0.35, sp: 60, size: 26, gap: 70, a: 0.5 },
    { y: 0.55, sp: 90, size: 34, gap: 90, a: 0.75 },
    { y: 0.75, sp: 130, size: 44, gap: 120, a: 1 },
  ];
  for (const b of belts) {
    const y = b.y * h;
    ctx.strokeStyle = rgba(p.accent, 0.12);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y + b.size * 0.7);
    ctx.lineTo(w, y + b.size * 0.7);
    ctx.stroke();
    const offset = (t * b.sp) % b.gap;
    for (let x = -b.gap + offset; x < w + b.gap; x += b.gap) {
      ctx.fillStyle = rgba(p.accent, 0.1 * b.a);
      ctx.strokeStyle = rgba(p.accent, 0.4 * b.a);
      ctx.lineWidth = 1.5;
      roundRect(ctx, x, y - b.size / 2, b.size, b.size, 6);
      ctx.fill();
      ctx.stroke();
    }
  }
};

// WK13 · Sunrise Balance — a rising sun with slow rotating rays.
const sceneSunrise: SceneFactory = (p) => (ctx, w, h, t) => {
  const cx = w / 2;
  const cy = h * 0.72 - Math.sin(t * 0.15) * 10;
  const g = ctx.createLinearGradient(0, cy - 120, 0, cy + 120);
  g.addColorStop(0, rgba(p.accent, 0));
  g.addColorStop(0.5, rgba(p.accent, 0.16));
  g.addColorStop(1, rgba(p.second, 0.06));
  ctx.fillStyle = g;
  ctx.fillRect(0, cy - 120, w, 240);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(t * 0.1);
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * TAU;
    const rg = ctx.createLinearGradient(0, 0, Math.cos(a) * h, Math.sin(a) * h);
    rg.addColorStop(0, rgba(p.accent, 0.14));
    rg.addColorStop(1, rgba(p.accent, 0));
    ctx.strokeStyle = rg;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * h, Math.sin(a) * h);
    ctx.stroke();
  }
  ctx.restore();
  const sg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80);
  sg.addColorStop(0, rgba(p.accent, 0.6));
  sg.addColorStop(1, rgba(p.accent, 0));
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.arc(cx, cy, 80, 0, TAU);
  ctx.fill();
};

// WK14 · Smart Home — a network of nodes with signal pulses down the links.
const sceneNetwork: SceneFactory = (p) => {
  const nodes: [number, number][] = [[0.2, 0.3], [0.5, 0.2], [0.8, 0.33], [0.7, 0.6], [0.35, 0.62], [0.5, 0.45], [0.15, 0.55], [0.85, 0.6]];
  const edges: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 5], [5, 4], [4, 6], [5, 1], [3, 7], [5, 0]];
  return (ctx, w, h, t) => {
    edges.forEach((e, ei) => {
      const a = nodes[e[0]];
      const b = nodes[e[1]];
      const ax = a[0] * w, ay = a[1] * h, bx = b[0] * w, by = b[1] * h;
      ctx.strokeStyle = rgba(p.accent, 0.14);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
      const f = (t * 0.4 + ei * 0.3) % 1;
      const px = ax + (bx - ax) * f, py = ay + (by - ay) * f;
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, TAU);
      ctx.fillStyle = rgba(p.accent, 0.9);
      ctx.shadowColor = rgba(p.accent, 0.9);
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
    nodes.forEach((nd, ni) => {
      const x = nd[0] * w, y = nd[1] * h;
      const pulse = 0.6 + 0.4 * Math.sin(t * 2 + ni);
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, TAU);
      ctx.fillStyle = rgba(p.accent, 0.4 + 0.4 * pulse);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, 9, 0, TAU);
      ctx.strokeStyle = rgba(p.accent, 0.3 * pulse);
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  };
};

// WK15 · Robot Lab — PCB traces with light pulses running along them.
const sceneCircuit: SceneFactory = (p) => {
  const paths: [number, number][][] = [
    [[0, 0.3], [0.3, 0.3], [0.3, 0.6], [0.6, 0.6], [0.6, 0.25], [1, 0.25]],
    [[0, 0.7], [0.25, 0.7], [0.25, 0.45], [0.55, 0.45], [0.55, 0.8], [1, 0.8]],
    [[0.1, 0.1], [0.1, 0.5], [0.45, 0.5], [0.45, 0.15], [0.9, 0.15]],
  ];
  return (ctx, w, h, t) => {
    paths.forEach((pts, pi) => {
      ctx.strokeStyle = rgba(p.accent, 0.16);
      ctx.lineWidth = 2;
      ctx.beginPath();
      pts.forEach((pt, i) => {
        const x = pt[0] * w, y = pt[1] * h;
        if (i) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      });
      ctx.stroke();
      pts.forEach((pt) => {
        ctx.beginPath();
        ctx.arc(pt[0] * w, pt[1] * h, 3, 0, TAU);
        ctx.fillStyle = rgba(p.second, 0.5);
        ctx.fill();
      });
      const segs = pts.length - 1;
      const f = ((t * 0.15 + pi * 0.33) % 1) * segs;
      const si = Math.floor(f);
      const lf = f - si;
      const a = pts[si];
      const b = pts[Math.min(si + 1, pts.length - 1)];
      const x = (a[0] + (b[0] - a[0]) * lf) * w;
      const y = (a[1] + (b[1] - a[1]) * lf) * h;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, TAU);
      ctx.fillStyle = rgba(p.accent, 0.95);
      ctx.shadowColor = rgba(p.accent, 0.9);
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  };
};

// WK16 · Doorway Maze — arched door frames receding down a corridor.
const sceneDoorways: SceneFactory = (p) => (ctx, w, h, t) => {
  const cx = w / 2;
  const cy = h * 0.46;
  const N = 10;
  for (let i = 0; i < N; i++) {
    const f = (i / N + (t * 0.1) % (1 / N)) % 1;
    const scale = f * f;
    const dw = w * 0.5 * scale + 30;
    const dh = h * 0.7 * scale + 40;
    const alpha = 0.05 + 0.28 * (1 - f);
    ctx.strokeStyle = rgba(i % 2 ? p.accent : p.second, alpha);
    ctx.lineWidth = 1.5 + 2 * (1 - f);
    const x = cx - dw / 2;
    const y = cy - dh / 2;
    ctx.beginPath();
    ctx.moveTo(x, y + dh);
    ctx.lineTo(x, y + dh * 0.2);
    ctx.quadraticCurveTo(x, y, x + dw * 0.5, y);
    ctx.quadraticCurveTo(x + dw, y, x + dw, y + dh * 0.2);
    ctx.lineTo(x + dw, y + dh);
    ctx.stroke();
  }
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.25);
  g.addColorStop(0, rgba(p.accent, 0.2));
  g.addColorStop(1, rgba(p.accent, 0));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
};

// WK17 · The Feed — columns of post cards scrolling upward (parallax).
const sceneFeed: SceneFactory = (p) => (ctx, w, h, t) => {
  const cols = [
    { x: 0.28, sp: 40, cw: 150, ch: 70, gap: 110, a: 0.6 },
    { x: 0.72, sp: 62, cw: 170, ch: 84, gap: 130, a: 0.9 },
  ];
  for (const c of cols) {
    const x = c.x * w;
    const off = (t * c.sp) % c.gap;
    for (let y = h + c.gap - off; y > -c.gap; y -= c.gap) {
      ctx.fillStyle = rgba(p.accent, 0.06 * c.a);
      ctx.strokeStyle = rgba(p.accent, 0.3 * c.a);
      ctx.lineWidth = 1.5;
      roundRect(ctx, x - c.cw / 2, y - c.ch / 2, c.cw, c.ch, 10);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = rgba(p.second, 0.5 * c.a);
      ctx.beginPath();
      ctx.arc(x - c.cw / 2 + 16, y - c.ch / 2 + 16, 6, 0, TAU);
      ctx.fill();
      ctx.fillStyle = rgba(p.accent, 0.35 * c.a);
      ctx.fillRect(x - c.cw / 2 + 28, y - c.ch / 2 + 12, c.cw * 0.5, 6);
      ctx.fillRect(x - c.cw / 2 + 14, y - c.ch / 2 + 34, c.cw * 0.7, 5);
    }
  }
};

// WK18 · Locker Room — a wall of lockers with a scanning highlight sweeping by.
const sceneLockers: SceneFactory = (p) => (ctx, w, h, t) => {
  const cols = Math.max(3, Math.ceil(w / 90));
  const rows = Math.max(2, Math.ceil(h / 150));
  const lw = w / cols;
  const lh = h / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * lw;
      const y = r * lh;
      ctx.strokeStyle = rgba(p.accent, 0.1);
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 4, y + 4, lw - 8, lh - 8);
      ctx.strokeStyle = rgba(p.accent, 0.07);
      for (let v = 0; v < 3; v++) {
        ctx.beginPath();
        ctx.moveTo(x + 14, y + 14 + v * 5);
        ctx.lineTo(x + lw - 14, y + 14 + v * 5);
        ctx.stroke();
      }
      ctx.fillStyle = rgba(p.accent, 0.12);
      ctx.fillRect(x + lw - 16, y + lh * 0.45, 4, 14);
    }
  }
  const sx = ((t * 0.12) % 1) * w;
  const g = ctx.createLinearGradient(sx - 80, 0, sx + 80, 0);
  g.addColorStop(0, rgba(p.accent, 0));
  g.addColorStop(0.5, rgba(p.accent, 0.16));
  g.addColorStop(1, rgba(p.accent, 0));
  ctx.fillStyle = g;
  ctx.fillRect(sx - 80, 0, 160, h);
};

// WK19 · The Hearth — a wide flickering fire glow with slow drifting embers.
const sceneHearth: SceneFactory = (p) => {
  const embers = Array.from({ length: 24 }, () => ({ x: rnd(0.3, 0.7), sp: rnd(0.1, 0.25), ph: rnd(0, TAU), r: rnd(1, 2.4) }));
  return (ctx, w, h, t) => {
    const cx = w / 2;
    const flick = 0.8 + 0.2 * Math.sin(t * 5) + 0.05 * Math.sin(t * 13);
    const g = ctx.createRadialGradient(cx, h * 1.02, 0, cx, h * 1.02, h * 0.8);
    g.addColorStop(0, rgba(p.accent, 0.22 * flick));
    g.addColorStop(0.5, rgba(p.second, 0.08 * flick));
    g.addColorStop(1, rgba(p.accent, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    for (const e of embers) {
      const life = (t * e.sp + e.ph) % 1;
      const y = h - life * h;
      const x = e.x * w + Math.sin((t + e.ph) * 1.5) * 20;
      ctx.beginPath();
      ctx.arc(x, y, e.r, 0, TAU);
      ctx.fillStyle = rgba(p.accent, 0.6 * (1 - life));
      ctx.fill();
    }
  };
};

// Default (weeks not yet given a bespoke scene) — a calm drifting signal field.
const sceneDefault: SceneFactory = (p) => {
  let dots: { x: number; y: number; r: number; vx: number; vy: number; a: number; ph: number }[] | null = null;
  return (ctx, w, h, t, dt) => {
    if (!dots) {
      dots = Array.from({ length: 30 }, () => ({
        x: rnd(0, w), y: rnd(0, h), r: rnd(0.8, 2.2), vx: rnd(-3, 3), vy: rnd(-8, -2), a: rnd(0.2, 0.5), ph: rnd(0, TAU),
      }));
    }
    for (const d of dots) {
      d.x += (d.vx + Math.sin(t * 0.5 + d.ph) * 4) * dt;
      d.y += d.vy * dt;
      if (d.y < -10) d.y = h + 10;
      if (d.x < -10) d.x = w + 10;
      else if (d.x > w + 10) d.x = -10;
      const flick = 0.75 + 0.25 * Math.sin(t * 1.6 + d.ph);
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, TAU);
      ctx.fillStyle = rgba(p.accent, d.a * flick);
      ctx.shadowColor = rgba(p.accent, 0.5);
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  };
};

const SCENES: Record<number, SceneFactory> = {
  1: sceneVault, // Vault — tumbler dials
  2: sceneShafts, // Safehouse — light shafts
  3: sceneLanterns, // Masquerade Street — lanterns
  4: sceneCarousel, // Carnival of Fakes — carousel bulbs
  5: sceneCampfire, // Warm Campfire — sparks
  6: sceneCorridor, // Neon Arcade — corridor
  7: sceneCoins, // Loot Shop — spinning coins
  8: sceneDarkroom, // Darkroom — developing photos
  9: sceneConveyor, // Conveyor — app tiles
  10: sceneTunnel, // Glowing Burrow — tunnel zoom
  11: sceneRadar, // Alert Centre — radar sweep
  12: sceneSnow, // Snowfield — parallax snow
  13: sceneSunrise, // Sunrise Balance — sun + rays
  14: sceneNetwork, // Smart Home — network pulses
  15: sceneCircuit, // Robot Lab — PCB traces
  16: sceneDoorways, // Doorway Maze — receding doors
  17: sceneFeed, // The Feed — scrolling cards
  18: sceneLockers, // Locker Room — locker wall + scan
  19: sceneHearth, // The Hearth — fire glow
  20: sceneCeremony, // Ceremony — spotlights + confetti
};

export default function WeekIntroBackdrop({
  weekNumber,
  accent = "#e3b341",
}: {
  weekNumber: number;
  accent?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const palette = buildPalette(weekNumber, accent);
    const factory = SCENES[weekNumber] ?? sceneDefault;
    const draw = factory(palette);

    let w = 0;
    let h = 0;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    let raf = 0;
    let last = performance.now();
    let tSec = 0;
    let running = true;

    const frame = (now: number) => {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      tSec += dt;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      draw(ctx, w, h, tSec, dt);
      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(frame);
    };

    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    if (reduce) {
      ctx.globalCompositeOperation = "lighter";
      draw(ctx, w, h, 0.6, 0);
      ctx.globalCompositeOperation = "source-over";
    } else {
      raf = requestAnimationFrame(frame);
    }

    const onVis = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!reduce && !running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [weekNumber, accent]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }}
    />
  );
}
