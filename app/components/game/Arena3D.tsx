"use client";

/**
 * Arena3D — Three.js "cyber command centre" arena for BossBattle.
 *
 * Renders behind the transparent PixiJS canvas. Features:
 *   1. Floating code snippets (drifting text planes)
 *   2. Binary streams on side walls (Matrix-style)
 *   3. Hexagonal data nodes + connecting lines
 *   4. Rotating wireframe globe (double shell)
 *   5. Hexagonal floor grid + data flow overlay
 *   6. Arena ring + shockwave pulses on impact
 *   7. Animated holographic screens (radar, log, shield, threat bars)
 *   8. Floating shield icons
 *   9. Impact reactions (shakeKey-driven)
 *  10. Electric arcs (periodic; red/frequent in phase 3)
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";

export interface Arena3DProps {
  width: number;
  height: number;
  /** Boss phase 0-3 — affects lighting, screens, arc frequency. */
  phase: 0 | 1 | 2 | 3;
  /** Camera shake magnitude. Decays internally; each pulse raises this. */
  shakeIntensity: number;
  /** Incrementing counter — bump to trigger a shake even if intensity is unchanged. */
  shakeKey?: number;
  /** Lighting & camera mood. */
  mood: "normal" | "danger" | "victory";
  /**
   * Pre-battle countdown signal. Bump `key` each tick; `label` is the text to
   * splash on all holo screens ("3" / "2" / "1" / "GO"). On "GO" the arena
   * does a full-room flash and every floating element pulses.
   */
  countdownPulse?: { label: string; key: number } | null;
}

type PhaseKey = 0 | 1 | 2 | 3;
type Mood = Arena3DProps["mood"];

// ──────────────────────────────────────────────────────────
// Palettes
// ──────────────────────────────────────────────────────────

const PHASE_PALETTE = {
  0: {
    ambient: new THREE.Color("#334155"),
    ambientI: 0.3,
    key: new THREE.Color("#60a5fa"),
    keyI: 0.6,
    spot: new THREE.Color("#34d399"),
    spotI: 0.4,
    fill: new THREE.Color("#7c3aed"),
    fillI: 0.3,
    fogColor: new THREE.Color("#0a0e2a"),
    fogDensity: 0.0,
  },
  1: {
    ambient: new THREE.Color("#3d3145"),
    ambientI: 0.28,
    key: new THREE.Color("#60a5fa"),
    keyI: 0.55,
    spot: new THREE.Color("#fbbf24"),
    spotI: 0.38,
    fill: new THREE.Color("#7c3aed"),
    fillI: 0.32,
    fogColor: new THREE.Color("#120e22"),
    fogDensity: 0.0,
  },
  2: {
    ambient: new THREE.Color("#3a1f22"),
    ambientI: 0.25,
    key: new THREE.Color("#f97316"),
    keyI: 0.5,
    spot: new THREE.Color("#f97316"),
    spotI: 0.42,
    fill: new THREE.Color("#7c3aed"),
    fillI: 0.28,
    fogColor: new THREE.Color("#1c0a0f"),
    fogDensity: 0.015,
  },
  3: {
    ambient: new THREE.Color("#2a0a0a"),
    ambientI: 0.2,
    key: new THREE.Color("#ef4444"),
    keyI: 0.7,
    spot: new THREE.Color("#ef4444"),
    spotI: 0.55,
    fill: new THREE.Color("#dc2626"),
    fillI: 0.35,
    fogColor: new THREE.Color("#1a0606"),
    fogDensity: 0.04,
  },
} as const;

const VICTORY_PALETTE = {
  ambient: new THREE.Color("#4a3a1f"),
  ambientI: 0.45,
  key: new THREE.Color("#fbbf24"),
  keyI: 0.9,
  spot: new THREE.Color("#fde047"),
  spotI: 0.7,
  fill: new THREE.Color("#fb923c"),
  fillI: 0.45,
  fogColor: new THREE.Color("#1f1a0a"),
  fogDensity: 0.0,
};

const DANGER_BOOST = { ambientI: 0.15, keyI: 0.2 };

const CODE_SNIPPETS = [
  "if (secure) {",
  "encrypt(data)",
  "firewall.active()",
  "const shield = true",
  "async defend()",
  "hash(password)",
  "return safety;",
  "scan(network)",
  "validate(input)",
  "authenticate()",
  "decrypt(msg)",
  "class CyberHero",
  "catch (threat)",
  "import shield",
  "await protect()",
] as const;

const BRAND_COLOURS = [0x60a5fa, 0x34d399, 0x7c3aed, 0xfbbf24];

// ──────────────────────────────────────────────────────────
// Canvas texture builders (baked once)
// ──────────────────────────────────────────────────────────

function makeHexGridTexture(size = 512): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#0a0e2a";
  ctx.fillRect(0, 0, size, size);

  // Flat-top hexagons. Column width = 1.5r, row height = sqrt(3)*r.
  const r = 40;
  const colW = 1.5 * r;
  const rowH = Math.sqrt(3) * r;

  ctx.strokeStyle = "#3b82f6";
  ctx.lineWidth = 1;
  // Bumped from 0.18 → 0.24 so the hex grid reads clearly on the floor.
  ctx.globalAlpha = 0.24;

  const drawHex = (cx: number, cy: number) => {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i;
      const px = cx + r * Math.cos(a);
      const py = cy + r * Math.sin(a);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
  };

  for (let col = -1; col * colW < size + r; col++) {
    for (let row = -1; row * rowH < size + rowH; row++) {
      const x = col * colW;
      const y = row * rowH + (col & 1 ? rowH / 2 : 0);
      drawHex(x, y);
    }
  }

  // Subtle glowing dots at some vertices for depth.
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = "#3b82f6";
  for (let col = 0; col * colW < size; col += 2) {
    for (let row = 0; row * rowH < size; row += 2) {
      const x = col * colW;
      const y = row * rowH + (col & 1 ? rowH / 2 : 0);
      ctx.beginPath();
      ctx.arc(x, y, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeRadialGlowTexture(size = 256): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  if (!ctx) return null;

  ctx.clearRect(0, 0, size, size);
  const cx = size / 2;
  const cy = size / 2;
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size / 2);
  grad.addColorStop(0, "rgba(147, 197, 253, 1)");
  grad.addColorStop(0.35, "rgba(96, 165, 250, 0.55)");
  grad.addColorStop(1, "rgba(59, 130, 246, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeShadowGradientTexture(size = 256): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  if (!ctx) return null;

  ctx.clearRect(0, 0, size, size);
  const cx = size / 2;
  const cy = size / 2;
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size / 2);
  grad.addColorStop(0, "rgba(0, 0, 0, 1)");
  grad.addColorStop(0.55, "rgba(0, 0, 0, 0.45)");
  grad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeHazeTexture(size = 512): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  if (!ctx) return null;

  // Soft cloud field: stack of overlapping radial blobs.
  ctx.clearRect(0, 0, size, size);
  const rand = (i: number) =>
    Math.abs((Math.sin(i * 91.3 + 3.3) * 9999) % 1);
  for (let i = 0; i < 42; i++) {
    const cx = rand(i * 7) * size;
    const cy = rand(i * 11 + 3) * size;
    const r = 40 + rand(i * 17) * 120;
    const a = 0.04 + rand(i * 23) * 0.06;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, `rgba(255,255,255,${a})`);
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeDataFlowTexture(size = 256): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  if (!ctx) return null;

  ctx.clearRect(0, 0, size, size);
  ctx.strokeStyle = "#3b82f6";
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.2;

  const rand = (i: number) => (Math.sin(i * 17.1 + 4.2) * 10000) % 1;
  for (let i = 0; i < 18; i++) {
    const y = Math.abs(rand(i)) * size;
    const xStart = Math.abs(rand(i + 100)) * size;
    const len = 30 + Math.abs(rand(i + 200)) * 120;
    ctx.beginPath();
    ctx.moveTo(xStart, y);
    ctx.lineTo(xStart + len, y);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeBinaryStreamTexture(width = 64, height = 512): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  const ctx = c.getContext("2d");
  if (!ctx) return null;

  ctx.clearRect(0, 0, width, height);
  ctx.font = "bold 10px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const rowH = 12;
  const rows = Math.ceil(height / rowH);
  const rand = (i: number) => Math.abs((Math.sin(i * 91.3 + 3.3) * 9999) % 1);

  for (let r = 0; r < rows; r++) {
    for (let col = 0; col < 4; col++) {
      const ch = rand(r * 7 + col * 31) > 0.5 ? "1" : "0";
      const bright = rand(r * 13 + col) > 0.85;
      ctx.fillStyle = bright ? "#a7f3d0" : "#34d399";
      ctx.globalAlpha = bright ? 1 : 0.55;
      ctx.fillText(ch, (width / 4) * col + width / 8, r * rowH + rowH / 2);
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeCodeSnippetTexture(text: string): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  const w = 384;
  const h = 72;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) return null;

  ctx.clearRect(0, 0, w, h);
  ctx.font = "bold 36px 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#34d399";
  ctx.shadowColor = "#34d399";
  ctx.shadowBlur = 6;
  ctx.fillText(text, w / 2, h / 2);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 2;
  return tex;
}

function makeCircuitTexture(size = 512): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#0c1225";
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = "#1e3a8a";
  ctx.lineWidth = 1.2;
  ctx.globalAlpha = 0.5;

  const rand = (i: number) =>
    (Math.sin(i * 12.9898 + 78.233) * 43758.5453) % 1;

  for (let i = 0; i < 28; i++) {
    const x0 = Math.abs(rand(i)) * size;
    const y0 = Math.abs(rand(i + 100)) * size;
    let x = x0;
    let y = y0;
    ctx.beginPath();
    ctx.moveTo(x, y);
    const steps = 4 + Math.floor(Math.abs(rand(i + 50)) * 4);
    for (let s = 0; s < steps; s++) {
      const dir = Math.floor(Math.abs(rand(i + s * 7)) * 4);
      const len = 24 + Math.abs(rand(i + s * 11)) * 60;
      if (dir === 0) x += len;
      else if (dir === 1) x -= len;
      else if (dir === 2) y += len;
      else y -= len;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.fillStyle = "#3b82f6";
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.arc(x, y, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.5;
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeShieldAlphaTexture(size = 128): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  if (!ctx) return null;

  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = "#ffffff";
  const cx = size / 2;
  const top = size * 0.1;
  const bottom = size * 0.95;
  const sideY = size * 0.35;
  const sideX = size * 0.85;

  ctx.beginPath();
  ctx.moveTo(cx, top);
  ctx.lineTo(size - sideX + sideX, top + 2);
  ctx.bezierCurveTo(sideX, sideY, sideX, sideY, sideX, sideY + 5);
  ctx.lineTo(sideX, size * 0.55);
  ctx.bezierCurveTo(sideX, size * 0.78, size * 0.65, size * 0.88, cx, bottom);
  ctx.bezierCurveTo(size * 0.35, size * 0.88, size * 0.2, size * 0.78, size * 0.2, size * 0.55);
  ctx.lineTo(size * 0.2, sideY + 5);
  ctx.bezierCurveTo(size * 0.2, sideY, size * 0.2, sideY, size * 0.15, top + 2);
  ctx.closePath();
  ctx.fill();

  // Inner cutout (ring look)
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.moveTo(cx, top + 16);
  ctx.lineTo(sideX - 10, top + 16);
  ctx.lineTo(sideX - 10, size * 0.55);
  ctx.bezierCurveTo(sideX - 10, size * 0.72, size * 0.62, size * 0.82, cx, bottom - 12);
  ctx.bezierCurveTo(size * 0.38, size * 0.82, size * 0.2 + 10, size * 0.72, size * 0.2 + 10, size * 0.55);
  ctx.lineTo(size * 0.2 + 10, top + 16);
  ctx.closePath();
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";

  // Cross in the centre (restored — paint white)
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(cx - 6, size * 0.35, 12, size * 0.35);
  ctx.fillRect(size * 0.3, size * 0.48, size * 0.4, 12);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeShieldLogoTexture(size = 512): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  if (!ctx) return null;

  ctx.clearRect(0, 0, size, size);

  const cx = size / 2;
  const top = size * 0.08;
  const shoulderY = size * 0.28;
  const waistY = size * 0.5;
  const tipY = size * 0.7;
  const halfW = size * 0.34;
  const insetW = size * 0.05;

  const shieldPath = () => {
    ctx.beginPath();
    ctx.moveTo(cx, top);
    ctx.lineTo(cx + halfW, top);
    ctx.quadraticCurveTo(
      cx + halfW,
      shoulderY,
      cx + halfW - insetW,
      shoulderY + size * 0.02
    );
    ctx.lineTo(cx + halfW - insetW, waistY);
    ctx.quadraticCurveTo(cx + halfW - insetW, waistY + size * 0.12, cx, tipY);
    ctx.quadraticCurveTo(
      cx - halfW + insetW,
      waistY + size * 0.12,
      cx - halfW + insetW,
      waistY
    );
    ctx.lineTo(cx - halfW + insetW, shoulderY + size * 0.02);
    ctx.quadraticCurveTo(cx - halfW, shoulderY, cx - halfW, top);
    ctx.closePath();
  };

  const bodyGrad = ctx.createLinearGradient(cx, top, cx, tipY);
  bodyGrad.addColorStop(0, "#3b82f6");
  bodyGrad.addColorStop(1, "#34d399");
  ctx.fillStyle = bodyGrad;
  ctx.shadowColor = "rgba(96,165,250,0.9)";
  ctx.shadowBlur = size * 0.08;
  shieldPath();
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = "rgba(191,219,254,0.9)";
  ctx.lineWidth = size * 0.012;
  ctx.shadowColor = "rgba(147,197,253,1)";
  ctx.shadowBlur = size * 0.06;
  shieldPath();
  ctx.stroke();
  ctx.shadowBlur = 0;

  const emblemCx = cx;
  const emblemCy = size * 0.4;
  const eArm = size * 0.1;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = size * 0.045;
  ctx.lineCap = "round";
  ctx.shadowColor = "rgba(255,255,255,0.95)";
  ctx.shadowBlur = size * 0.06;
  ctx.beginPath();
  ctx.moveTo(emblemCx - eArm, emblemCy - eArm);
  ctx.lineTo(emblemCx + eArm, emblemCy + eArm);
  ctx.moveTo(emblemCx + eArm, emblemCy - eArm);
  ctx.lineTo(emblemCx - eArm, emblemCy + eArm);
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(255,255,255,0.8)";
  ctx.shadowBlur = size * 0.04;
  ctx.font = "bold 40px 'Space Grotesk', 'DM Sans', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("AX", cx, size * 0.84);
  ctx.shadowBlur = 0;

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

// ──────────────────────────────────────────────────────────
// Live canvas textures — redraw on demand
// ──────────────────────────────────────────────────────────

interface LiveTex {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  texture: THREE.CanvasTexture;
  size: number;
}

function makeLiveCanvas(size = 256): LiveTex | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return { canvas, ctx, texture, size };
}

function drawRadar(lt: LiveTex, t: number, warning: boolean) {
  const { ctx, size } = lt;
  ctx.fillStyle = "rgba(4, 8, 20, 0.25)"; // trail — creates comet tail on sweep
  ctx.fillRect(0, 0, size, size);

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.42;

  // Rings
  ctx.strokeStyle = warning ? "#ef4444" : "#34d399";
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 1;
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath();
    ctx.arc(cx, cy, (r / 3) * i, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Crosshair
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx, cy + r);
  ctx.moveTo(cx - r, cy);
  ctx.lineTo(cx + r, cy);
  ctx.stroke();

  // Sweep (gradient wedge)
  const angle = t * 1.8;
  const grad = ctx.createConicGradient(angle, cx, cy);
  const sweepCol = warning ? "rgba(239,68,68,0.6)" : "rgba(52,211,153,0.6)";
  grad.addColorStop(0, sweepCol);
  grad.addColorStop(0.15, "rgba(52,211,153,0.0)");
  grad.addColorStop(1, "rgba(52,211,153,0.0)");
  ctx.fillStyle = grad;
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, r, angle - Math.PI / 4, angle);
  ctx.closePath();
  ctx.fill();

  // Blips
  ctx.fillStyle = warning ? "#fca5a5" : "#a7f3d0";
  ctx.globalAlpha = 0.9;
  const blips = [
    [0.3, 0.4],
    [0.7, 0.6],
    [0.55, 0.25],
    [0.2, 0.7],
  ];
  blips.forEach(([bx, by], i) => {
    ctx.beginPath();
    const bp = Math.sin(t * 2 + i) * 0.5 + 0.5;
    ctx.arc(bx * size, by * size, 2 + bp * 1.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // Warning label
  if (warning) {
    ctx.fillStyle = "#ef4444";
    ctx.font = "bold 24px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.globalAlpha = Math.abs(Math.sin(t * 12));
    ctx.fillText("⚠ WARNING", cx, size * 0.9);
  }

  lt.texture.needsUpdate = true;
}

function drawLogFeed(lt: LiveTex, scroll: number, warning: boolean) {
  const { ctx, size } = lt;
  ctx.fillStyle = "#04060a";
  ctx.fillRect(0, 0, size, size);

  ctx.font = "bold 14px 'Courier New', monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  const lines = [
    "> scan 192.168.1.1 OK",
    "> firewall rule 42: ACCEPT",
    "> auth user#7324 granted",
    "> packet enc: AES-256",
    "> threat: NULL",
    "> fw log: 0 drops",
    "> key rotation complete",
    "> session token valid",
    "> shield layer 3: UP",
    "> heartbeat 120ms OK",
    "> SYN flood: mitigated",
    "> handshake verified",
    "> encryption: TLS1.3",
    "> port 443: listening",
    "> integrity check PASS",
  ];

  const lineH = 20;
  const startY = size - ((scroll * lineH) % (lines.length * lineH));
  ctx.globalAlpha = 0.85;

  for (let i = 0; i < lines.length * 2; i++) {
    const y = startY + i * lineH;
    if (y < -lineH || y > size) continue;
    const line = lines[i % lines.length];
    const isNew = i === Math.floor(scroll) % lines.length + lines.length;
    ctx.fillStyle = warning ? "#ef4444" : isNew ? "#a7f3d0" : "#34d399";
    ctx.fillText(line, 8, y);
  }

  if (warning) {
    ctx.fillStyle = "rgba(239,68,68,0.3)";
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "#fca5a5";
    ctx.font = "bold 28px monospace";
    ctx.textAlign = "center";
    ctx.fillText("⚠ WARNING", size / 2, size / 2 - 14);
  }

  lt.texture.needsUpdate = true;
}

function drawShieldGfx(
  lt: LiveTex,
  brightness: number,
  mood: Mood,
  warning: boolean
) {
  const { ctx, size } = lt;
  ctx.fillStyle = "#04060a";
  ctx.fillRect(0, 0, size, size);

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const col =
    mood === "victory" ? "#fde047" : warning ? "#ef4444" : "#60a5fa";
  ctx.strokeStyle = col;
  ctx.lineWidth = 4;
  ctx.globalAlpha = brightness;
  ctx.shadowColor = col;
  ctx.shadowBlur = 24 * brightness;

  // Shield outline
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.quadraticCurveTo(cx + r, cy - r, cx + r * 0.9, cy);
  ctx.quadraticCurveTo(cx + r * 0.85, cy + r * 0.7, cx, cy + r);
  ctx.quadraticCurveTo(cx - r * 0.85, cy + r * 0.7, cx - r * 0.9, cy);
  ctx.quadraticCurveTo(cx - r, cy - r, cx, cy - r);
  ctx.stroke();

  // Inner cross
  ctx.beginPath();
  ctx.moveTo(cx, cy - r * 0.55);
  ctx.lineTo(cx, cy + r * 0.55);
  ctx.moveTo(cx - r * 0.55, cy);
  ctx.lineTo(cx + r * 0.55, cy);
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = col;
  ctx.font = "bold 12px monospace";
  ctx.textAlign = "center";
  ctx.fillText("SHIELD", cx, size * 0.9);

  if (warning) {
    ctx.fillStyle = "rgba(239,68,68,0.35)";
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "#fca5a5";
    ctx.font = "bold 24px monospace";
    ctx.fillText("⚠ WARNING", cx, cy + r + 20);
  }

  lt.texture.needsUpdate = true;
}

function drawCountdownOverlay(lt: LiveTex, label: string) {
  const { ctx, size } = lt;
  ctx.fillStyle = "#020510";
  ctx.fillRect(0, 0, size, size);

  // Soft blue wash behind the number.
  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.05,
    size / 2,
    size / 2,
    size * 0.55
  );
  grad.addColorStop(0, "rgba(96,165,250,0.55)");
  grad.addColorStop(1, "rgba(96,165,250,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const big = label.toUpperCase() === "GO";
  ctx.font = big
    ? "bold 140px 'Space Grotesk', monospace"
    : "bold 200px 'Space Grotesk', monospace";
  ctx.fillStyle = big ? "#fde047" : "#e0f2fe";
  ctx.shadowColor = big ? "#fbbf24" : "#60a5fa";
  ctx.shadowBlur = 24;
  ctx.fillText(label, size / 2, size / 2);

  lt.texture.needsUpdate = true;
}

function drawThreatBars(
  lt: LiveTex,
  phase: PhaseKey,
  t: number,
  warning: boolean,
  variant: 0 | 1
) {
  const { ctx, size } = lt;
  ctx.fillStyle = "#04060a";
  ctx.fillRect(0, 0, size, size);

  ctx.font = "bold 14px monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText(variant === 0 ? "THREAT LEVEL" : "SYSTEM LOAD", 12, 18);

  const labels =
    variant === 0
      ? ["FIREWALL", "ENCRYPTION", "AUTH", "INTEGRITY", "MONITOR"]
      : ["CPU", "RAM", "NET", "GPU", "DISK"];

  const phaseBarLevel = (i: number): number => {
    // Baseline fill, plus some wobble + phase pressure.
    const wobble = 0.15 * Math.sin(t * 1.5 + i * 1.3);
    const phasePressure = (phase / 3) * 0.35;
    const base = 0.4 + phasePressure + wobble + i * 0.05;
    return Math.max(0.05, Math.min(1, base));
  };

  const barH = 20;
  const gap = 12;
  const yStart = 38;
  const barW = size - 100;

  for (let i = 0; i < labels.length; i++) {
    const y = yStart + i * (barH + gap);
    ctx.fillStyle = "#94a3b8";
    ctx.fillText(labels[i], 12, y + barH / 2);

    ctx.fillStyle = "#111827";
    ctx.fillRect(86, y, barW, barH);

    const fillPct = phaseBarLevel(i);
    const col =
      warning || phase >= 2
        ? fillPct > 0.7
          ? "#ef4444"
          : "#f97316"
        : fillPct > 0.8
          ? "#ef4444"
          : fillPct > 0.6
            ? "#fbbf24"
            : "#34d399";
    ctx.fillStyle = col;
    ctx.fillRect(86, y, barW * fillPct, barH);

    // Grid ticks
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.lineWidth = 1;
    for (let tk = 0; tk <= 10; tk++) {
      const tx = 86 + (barW / 10) * tk;
      ctx.beginPath();
      ctx.moveTo(tx, y);
      ctx.lineTo(tx, y + barH);
      ctx.stroke();
    }
  }

  if (warning) {
    ctx.fillStyle = "rgba(239,68,68,0.3)";
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "#fca5a5";
    ctx.font = "bold 26px monospace";
    ctx.textAlign = "center";
    ctx.fillText("⚠ WARNING", size / 2, size / 2);
  }

  lt.texture.needsUpdate = true;
}

// ──────────────────────────────────────────────────────────
// Geometry helpers
// ──────────────────────────────────────────────────────────

function makeHexagonGeometry(radius: number): THREE.BufferGeometry {
  // Flat hexagon with fan triangulation (centre + 6 outer).
  const geom = new THREE.BufferGeometry();
  const positions: number[] = [0, 0, 0];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i + Math.PI / 6;
    positions.push(radius * Math.cos(a), radius * Math.sin(a), 0);
  }
  const indices: number[] = [];
  for (let i = 0; i < 6; i++) {
    indices.push(0, i + 1, ((i + 1) % 6) + 1);
  }
  geom.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

function makeArcPositions(
  from: THREE.Vector3,
  to: THREE.Vector3,
  segments: number
): Float32Array {
  const out = new Float32Array((segments + 1) * 3);
  const dir = new THREE.Vector3().subVectors(to, from);
  const perpA = new THREE.Vector3(-dir.y, dir.x, 0).normalize();
  const perpB = new THREE.Vector3().crossVectors(dir, perpA).normalize();
  for (let i = 0; i <= segments; i++) {
    const tt = i / segments;
    const base = new THREE.Vector3().lerpVectors(from, to, tt);
    if (i > 0 && i < segments) {
      const jitter = 0.2;
      base.addScaledVector(perpA, (Math.random() - 0.5) * jitter);
      base.addScaledVector(perpB, (Math.random() - 0.5) * jitter);
    }
    out[i * 3] = base.x;
    out[i * 3 + 1] = base.y;
    out[i * 3 + 2] = base.z;
  }
  return out;
}

// ──────────────────────────────────────────────────────────
// Scene refs container
// ──────────────────────────────────────────────────────────

interface HexNode {
  mesh: THREE.Mesh;
  baseY: number;
  phase: number;
  freq: number;
  baseColour: THREE.Color;
}
interface NodeLink {
  line: THREE.Line;
  material: THREE.LineBasicMaterial;
  nodeA: number;
  nodeB: number;
  flashUntil: number;
}
interface CodeSnippetObj {
  mesh: THREE.Mesh;
  material: THREE.MeshBasicMaterial;
  vx: number;
  vy: number;
  vz: number;
  rotSpeed: number;
  baseOpacity: number;
}
interface BinaryStreamObj {
  mesh: THREE.Mesh;
  texture: THREE.Texture;
  material: THREE.MeshBasicMaterial;
  baseColour: THREE.Color;
  dangerColour: THREE.Color;
  baseOpacity: number;
}
interface HoloScreen {
  mesh: THREE.Mesh;
  backlight: THREE.Mesh;
  live: LiveTex | null;
  type: "radar" | "log" | "shield" | "threat0" | "threat1";
  logScroll: number;
  warningUntil: number;
  baseY: number;
  bobDelay: number;
  side: "left" | "right" | "centre";
}
interface ShockwavePulse {
  mesh: THREE.Mesh;
  material: THREE.MeshBasicMaterial;
  startTime: number;
}
interface ElectricArc {
  line: THREE.Line;
  geometry: THREE.BufferGeometry;
  material: THREE.LineBasicMaterial;
  activeUntil: number;
}
interface FloatingShield {
  mesh: THREE.Mesh;
  material: THREE.MeshBasicMaterial;
  rotSpeed: number;
  baseColour: THREE.Color;
}

interface LightBeam {
  mesh: THREE.Mesh;
  material: THREE.MeshBasicMaterial;
  rotSpeed: number;
}

interface Reflection {
  mesh: THREE.Mesh;
  material: THREE.MeshBasicMaterial;
  side: "hero" | "boss";
}

interface Conduit {
  line: THREE.Line;
  material: THREE.LineBasicMaterial;
  flashUntil: number;
  baseColour: THREE.Color;
}

type CameraMode = "default" | "phaseOrbit" | "victoryOrbit";
interface CameraState {
  mode: CameraMode;
  modeStart: number;
  // Lateral pulse triggered by a shake — peaks, then returns.
  lateralPulseStart: number;
  lateralPulseSide: number; // -1 (toward hero/left), +1 (toward boss/right), 0 (inactive)
}

interface SceneRefs {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  ambient: THREE.AmbientLight;
  keyLight: THREE.DirectionalLight;
  spotLight: THREE.SpotLight;
  fillLeft: THREE.PointLight;
  fillRight: THREE.PointLight;
  driftOrbs: THREE.PointLight[];
  floorTexture: THREE.Texture | null;
  dataFlowTexture: THREE.Texture | null;
  particles: THREE.Mesh[];
  particleBounds: { minY: number; maxY: number };

  // New:
  codeSnippets: CodeSnippetObj[];
  binaryStreams: BinaryStreamObj[];
  hexNodes: HexNode[];
  nodeLinks: NodeLink[];
  globeOuter: THREE.Mesh | null;
  globeInner: THREE.Mesh | null;
  globeCore: THREE.PointLight | null;
  globeMatOuter: THREE.MeshBasicMaterial | null;
  globeMatInner: THREE.MeshBasicMaterial | null;
  arenaRingInner: THREE.Mesh;
  arenaRingOuter: THREE.Mesh;
  floorLogo: THREE.Mesh;
  floorLogoMat: THREE.MeshBasicMaterial;
  floorLogoRing: THREE.Mesh;
  floorLogoRingMat: THREE.MeshBasicMaterial;
  floorLogoHalo: THREE.Mesh;
  floorLogoHaloMat: THREE.MeshBasicMaterial;
  shockwaves: ShockwavePulse[];
  shockwavePool: ShockwavePulse[];
  shockwaveGeom: THREE.BufferGeometry;
  holoScreens: HoloScreen[];
  floatingShields: FloatingShield[];
  electricArc: ElectricArc | null;
  arcNextAt: number;
  codeFlashUntil: number;
  nodeFlashUntil: number;
  binaryBoostUntil: number;
  binaryDangerUntil: number;

  // New — volumetric beams, reflections, conduits, haze, countdown, camera.
  lightBeams: LightBeam[];
  reflections: Reflection[];
  conduits: Conduit[];
  conduitNextAt: number;
  hazeMesh: THREE.Mesh | null;
  hazeMaterial: THREE.MeshBasicMaterial | null;
  hazeTexture: THREE.Texture | null;
  countdownLabel: string | null;
  countdownActiveUntil: number;
  goFlashUntil: number;
  cameraState: CameraState;

  disposables: Array<
    | THREE.BufferGeometry
    | THREE.Material
    | THREE.Texture
    | THREE.WebGLRenderer
  >;
}

// ──────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────

export default function Arena3D({
  width,
  height,
  phase,
  shakeIntensity,
  shakeKey = 0,
  mood,
  countdownPulse = null,
}: Arena3DProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const refs = useRef<SceneRefs | null>(null);

  const phaseRef = useRef<PhaseKey>(phase);
  const prevPhaseRef = useRef<PhaseKey>(phase);
  const moodRef = useRef<Mood>(mood);
  const shakeIntensityRef = useRef<number>(0);
  const currentShakeRef = useRef<number>(0);
  const moodZoomRef = useRef<{ targetZ: number; targetY: number }>({
    targetZ: 8,
    targetY: 3,
  });

  // ── Prop → ref sync ──
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    moodRef.current = mood;
    if (mood === "danger") {
      moodZoomRef.current = { targetZ: 7.5, targetY: 3 };
    } else if (mood === "victory") {
      moodZoomRef.current = { targetZ: 9, targetY: 4 };
    } else {
      moodZoomRef.current = { targetZ: 8, targetY: 3 };
    }
  }, [mood]);

  // ── Phase change → warn screens, flash nodes, kick off a 3s phase orbit ──
  useEffect(() => {
    if (prevPhaseRef.current === phase) return;
    prevPhaseRef.current = phase;
    const r = refs.current;
    if (!r) return;
    const now = performance.now() / 1000;
    const warnUntil = now + 1.5;
    r.holoScreens.forEach((s) => {
      s.warningUntil = warnUntil;
    });
    // Only trigger the orbital reveal when not already in victory mode.
    if (moodRef.current !== "victory") {
      r.cameraState.mode = "phaseOrbit";
      r.cameraState.modeStart = now;
    }
  }, [phase]);

  // ── Victory → switch camera into its slow pullback orbit ──
  useEffect(() => {
    if (mood !== "victory") return;
    const r = refs.current;
    if (!r) return;
    r.cameraState.mode = "victoryOrbit";
    r.cameraState.modeStart = performance.now() / 1000;
  }, [mood]);

  // ── Countdown pulse (BossBattle pre-battle 3/2/1/GO) ──
  const prevCountdownKeyRef = useRef<number | null>(null);
  useEffect(() => {
    if (!countdownPulse) {
      prevCountdownKeyRef.current = null;
      return;
    }
    if (prevCountdownKeyRef.current === countdownPulse.key) return;
    prevCountdownKeyRef.current = countdownPulse.key;
    const r = refs.current;
    if (!r) return;
    const now = performance.now() / 1000;
    r.countdownLabel = countdownPulse.label;
    r.countdownActiveUntil = now + 0.9;
    const isGo = countdownPulse.label.toUpperCase() === "GO";
    if (isGo) {
      r.goFlashUntil = now + 0.12;
      r.codeFlashUntil = now + 0.4;
      r.nodeFlashUntil = now + 0.35;
    }
    spawnShockwave(r, now);
  }, [countdownPulse]);

  // ── Shake pulse → shockwave + flashes + binary boost + side screen flash ──
  useEffect(() => {
    if (shakeIntensity > shakeIntensityRef.current) {
      shakeIntensityRef.current = shakeIntensity;
    } else if (shakeIntensity > 0) {
      shakeIntensityRef.current = Math.max(
        shakeIntensityRef.current,
        shakeIntensity
      );
    }
    const r = refs.current;
    if (!r || shakeIntensity === 0) return;

    const now = performance.now() / 1000;
    r.codeFlashUntil = now + 0.3;
    r.nodeFlashUntil = now + 0.25;
    r.binaryBoostUntil = now + 0.5;
    if (moodRef.current === "danger") {
      r.binaryDangerUntil = now + 0.5;
    }

    // Spawn a floor shockwave.
    spawnShockwave(r, now);

    // Flash the impact-side screen: danger=boss attacked hero (left screen),
    // normal=hero attacked boss (right screen).
    const targetSide: "left" | "right" =
      moodRef.current === "danger" ? "left" : "right";
    r.holoScreens.forEach((s) => {
      if (s.side === targetSide) {
        s.warningUntil = Math.max(s.warningUntil, now + 0.4);
      }
    });
    // Lateral camera pulse — boss attack (danger) pushes camera toward hero
    // side (−x), hero attack pushes it toward boss side (+x).
    r.cameraState.lateralPulseStart = now;
    r.cameraState.lateralPulseSide = moodRef.current === "danger" ? -1 : 1;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shakeIntensity, shakeKey]);

  // ── Setup (mount once) ──
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const isMobile = window.innerWidth < 768;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(
      50,
      Math.max(1, width) / Math.max(1, height),
      0.1,
      100
    );
    camera.position.set(0, 3, 8);
    camera.lookAt(0, 0.5, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    host.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    const disposables: SceneRefs["disposables"] = [renderer];

    // ── Floor (hexagonal grid) + underfloor data flow ──
    const hexFloorTex = makeHexGridTexture();
    if (hexFloorTex) {
      hexFloorTex.repeat.set(6, 4);
      disposables.push(hexFloorTex);
    }
    const floorGeom = new THREE.PlaneGeometry(12, 8, 1, 1);
    disposables.push(floorGeom);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0a0e2a,
      map: hexFloorTex ?? undefined,
      metalness: 0.4,
      roughness: 0.6,
      emissive: new THREE.Color(0x0a1a3a),
      emissiveIntensity: 0.25,
    });
    disposables.push(floorMat);
    const floor = new THREE.Mesh(floorGeom, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Data-flow overlay beneath floor (faster scroll)
    const dataFlowTex = makeDataFlowTexture();
    if (dataFlowTex) {
      dataFlowTex.repeat.set(8, 4);
      disposables.push(dataFlowTex);
    }
    const poolGeom = new THREE.PlaneGeometry(12, 8);
    disposables.push(poolGeom);
    const poolMat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      map: dataFlowTex ?? undefined,
      transparent: true,
      // Gentler (0.18 → 0.10): the flow is a hint under glass, not a billboard.
      opacity: 0.1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    disposables.push(poolMat);
    const pool = new THREE.Mesh(poolGeom, poolMat);
    pool.rotation.x = -Math.PI / 2;
    pool.position.y = -0.02;
    scene.add(pool);

    // Radial gradient glow under the two character positions — draws the
    // eye toward the fighters without overpowering the hex grid.
    const radialTex = makeRadialGlowTexture();
    if (radialTex) disposables.push(radialTex);
    const radialGeom = new THREE.PlaneGeometry(4, 4);
    disposables.push(radialGeom);
    const radialMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: radialTex ?? undefined,
      transparent: true,
      opacity: 0.06,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    disposables.push(radialMat);
    for (const fx of [-2.5, 2.5]) {
      const glow = new THREE.Mesh(radialGeom, radialMat);
      glow.rotation.x = -Math.PI / 2;
      glow.position.set(fx, 0.03, 0.4);
      scene.add(glow);
    }

    // ── Arena floor ring ──
    const ringGeomInner = new THREE.RingGeometry(3, 3.15, 64);
    disposables.push(ringGeomInner);
    const ringMatInner = new THREE.MeshBasicMaterial({
      // Brighter, more vibrant blue — the ring is the focal point.
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    disposables.push(ringMatInner);
    const ringInner = new THREE.Mesh(ringGeomInner, ringMatInner);
    ringInner.rotation.x = -Math.PI / 2;
    ringInner.position.y = 0.01;
    scene.add(ringInner);

    const ringGeomOuter = new THREE.RingGeometry(3.2, 3.4, 64);
    disposables.push(ringGeomOuter);
    const ringMatOuter = new THREE.MeshBasicMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    disposables.push(ringMatOuter);
    const ringOuter = new THREE.Mesh(ringGeomOuter, ringMatOuter);
    ringOuter.rotation.x = -Math.PI / 2;
    ringOuter.position.y = 0.015;
    scene.add(ringOuter);

    // ── Floor shield-logo watermark (centre, slightly forward) ──
    // Soft radial halo beneath the logo — spreads the glow across the floor.
    const logoHaloTex = makeRadialGlowTexture();
    if (logoHaloTex) disposables.push(logoHaloTex);
    const logoHaloGeom = new THREE.PlaneGeometry(4.2, 4.2);
    disposables.push(logoHaloGeom);
    const floorLogoHaloMat = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      map: logoHaloTex ?? undefined,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    disposables.push(floorLogoHaloMat);
    const floorLogoHalo = new THREE.Mesh(logoHaloGeom, floorLogoHaloMat);
    floorLogoHalo.rotation.x = -Math.PI / 2;
    floorLogoHalo.position.set(0, 0.018, 0.5);
    scene.add(floorLogoHalo);

    const logoTex = makeShieldLogoTexture();
    if (logoTex) disposables.push(logoTex);
    const logoGeom = new THREE.PlaneGeometry(2.5, 2.5);
    disposables.push(logoGeom);
    const floorLogoMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: logoTex ?? undefined,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    disposables.push(floorLogoMat);
    const floorLogo = new THREE.Mesh(logoGeom, floorLogoMat);
    floorLogo.rotation.x = -Math.PI / 2;
    floorLogo.position.set(0, 0.022, 0.5);
    scene.add(floorLogo);

    // Ring framing the logo — rotates opposite to the inner arena ring.
    const logoRingGeom = new THREE.RingGeometry(1.4, 1.5, 64);
    disposables.push(logoRingGeom);
    const floorLogoRingMat = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    disposables.push(floorLogoRingMat);
    const floorLogoRing = new THREE.Mesh(logoRingGeom, floorLogoRingMat);
    floorLogoRing.rotation.x = -Math.PI / 2;
    floorLogoRing.position.set(0, 0.016, 0.5);
    scene.add(floorLogoRing);

    // Shockwave pool — shared geometry, per-pulse material & mesh.
    const shockwaveGeom = new THREE.RingGeometry(0.45, 0.55, 48);
    disposables.push(shockwaveGeom);
    const shockwavePool: ShockwavePulse[] = [];

    // ── Back wall ──
    const circuitTex = makeCircuitTexture();
    if (circuitTex) {
      circuitTex.repeat.set(2, 1);
      disposables.push(circuitTex);
    }
    const backGeom = new THREE.PlaneGeometry(14, 6);
    disposables.push(backGeom);
    const backMat = new THREE.MeshStandardMaterial({
      color: 0x0c1225,
      map: circuitTex ?? undefined,
      metalness: 0.3,
      roughness: 0.8,
      emissive: new THREE.Color(0x081030),
      emissiveIntensity: 0.3,
    });
    disposables.push(backMat);
    const backWall = new THREE.Mesh(backGeom, backMat);
    // Pushed back an extra 0.5 to give the (repositioned) holo screens room
    // to float without clipping the wall.
    backWall.position.set(0, 3, -4.5);
    scene.add(backWall);

    // ── Holographic screens (animated) ──
    const holoScreens: HoloScreen[] = [];
    const holoConfigs: Array<{
      x: number;
      y: number;
      w: number;
      h: number;
      type: HoloScreen["type"];
      side: HoloScreen["side"];
      delay: number;
    // Screen dimensions are 70% of the original values; Y is pushed up 0.5 so
    // the panels read as background decor rather than foreground UI.
    }> = isMobile
      ? [
          { x: -2.8, y: 4.1, w: 1.4, h: 0.98, type: "log", side: "left", delay: 0 },
          { x: 0, y: 4.5, w: 1.54, h: 0.98, type: "radar", side: "centre", delay: 1.0 },
          { x: 2.8, y: 4.1, w: 1.4, h: 0.98, type: "shield", side: "right", delay: 0.5 },
        ]
      : [
          { x: -4.5, y: 3.9, w: 1.19, h: 0.84, type: "threat0", side: "left", delay: 0 },
          { x: -2.2, y: 4.5, w: 1.4, h: 0.91, type: "log", side: "left", delay: 1.2 },
          { x: 0, y: 4.6, w: 1.68, h: 1.05, type: "radar", side: "centre", delay: 0.6 },
          { x: 2.2, y: 4.5, w: 1.4, h: 0.91, type: "shield", side: "right", delay: 2.0 },
          { x: 4.5, y: 3.9, w: 1.19, h: 0.84, type: "threat1", side: "right", delay: 1.5 },
        ];

    holoConfigs.forEach((cfg) => {
      const live = makeLiveCanvas(256);
      if (live) disposables.push(live.texture);

      // Backlight glow plane (slightly larger, additive) — emissive halved
      // so the screens read as subtle background decor.
      const glowGeom = new THREE.PlaneGeometry(cfg.w + 0.2, cfg.h + 0.2);
      disposables.push(glowGeom);
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0x60a5fa,
        transparent: true,
        opacity: 0.125,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      disposables.push(glowMat);
      const glow = new THREE.Mesh(glowGeom, glowMat);
      // Screens pushed back (Z decreased 0.5) so they feel like distant
      // panels, not foreground UI. Back wall moved back accordingly.
      glow.position.set(cfg.x, cfg.y, -4.45);
      scene.add(glow);

      const screenGeom = new THREE.PlaneGeometry(cfg.w, cfg.h);
      disposables.push(screenGeom);
      const screenMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: live?.texture,
        transparent: true,
        opacity: 0.09,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      disposables.push(screenMat);
      const screen = new THREE.Mesh(screenGeom, screenMat);
      screen.position.set(cfg.x, cfg.y, -4.38);
      scene.add(screen);

      holoScreens.push({
        mesh: screen,
        backlight: glow,
        live,
        type: cfg.type,
        logScroll: 0,
        warningUntil: 0,
        baseY: cfg.y,
        bobDelay: cfg.delay,
        side: cfg.side,
      });
    });

    // ── Side walls ──
    const sideGeom = new THREE.PlaneGeometry(8, 6);
    disposables.push(sideGeom);
    const sideMat = new THREE.MeshStandardMaterial({
      color: 0x070a18,
      metalness: 0.2,
      roughness: 0.9,
      emissive: new THREE.Color(0x050a20),
      emissiveIntensity: 0.15,
    });
    disposables.push(sideMat);

    if (!isMobile) {
      const sideLeft = new THREE.Mesh(sideGeom, sideMat);
      sideLeft.position.set(-6, 3, 0);
      sideLeft.rotation.y = Math.PI / 2.5;
      scene.add(sideLeft);

      const sideRight = new THREE.Mesh(sideGeom, sideMat);
      sideRight.position.set(6, 3, 0);
      sideRight.rotation.y = -Math.PI / 2.5;
      scene.add(sideRight);

      const stripGeom = new THREE.PlaneGeometry(0.12, 5);
      disposables.push(stripGeom);
      const stripMat = new THREE.MeshBasicMaterial({
        color: 0x60a5fa,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      disposables.push(stripMat);
      const stripL = new THREE.Mesh(stripGeom, stripMat);
      stripL.position.set(-4.7, 2.8, -1.2);
      scene.add(stripL);
      const stripR = new THREE.Mesh(stripGeom, stripMat);
      stripR.position.set(4.7, 2.8, -1.2);
      scene.add(stripR);
    }

    // ── Binary streams on side walls ──
    const binaryStreams: BinaryStreamObj[] = [];
    if (!isMobile) {
      const baseColour = new THREE.Color(0x34d399);
      const dangerColour = new THREE.Color(0xef4444);
      const streamGeom = new THREE.PlaneGeometry(0.3, 5);
      disposables.push(streamGeom);

      const perSideConfigs: Array<{
        side: "left" | "right";
        zs: number[];
      }> = [
        { side: "left", zs: [1.5, 0, -1.8] },
        { side: "right", zs: [1.5, 0, -1.8] },
      ];

      perSideConfigs.forEach(({ side, zs }) => {
        zs.forEach((z) => {
          const tex = makeBinaryStreamTexture(64, 512);
          if (tex) {
            tex.repeat.set(1, 2);
            disposables.push(tex);
          }
          const mat = new THREE.MeshBasicMaterial({
            color: baseColour.clone(),
            map: tex ?? undefined,
            transparent: true,
            opacity: 0.08,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide,
          });
          disposables.push(mat);
          const m = new THREE.Mesh(streamGeom, mat);
          const xSign = side === "left" ? -1 : 1;
          m.position.set(xSign * 4.2, 2.8, z);
          // Angle toward the viewer, matching side wall tilt.
          m.rotation.y = side === "left" ? Math.PI / 2.5 : -Math.PI / 2.5;
          scene.add(m);
          if (tex) {
            binaryStreams.push({
              mesh: m,
              texture: tex,
              material: mat,
              baseColour,
              dangerColour,
              baseOpacity: 0.08 + Math.random() * 0.02,
            });
          }
        });
      });
    }

    // ── Ceiling ──
    const ceilGeom = new THREE.PlaneGeometry(14, 8);
    disposables.push(ceilGeom);
    const ceilMat = new THREE.MeshStandardMaterial({
      color: 0x040618,
      metalness: 0.1,
      roughness: 1.0,
    });
    disposables.push(ceilMat);
    const ceiling = new THREE.Mesh(ceilGeom, ceilMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 4;
    scene.add(ceiling);

    // ── Volumetric light beams (ceiling shafts) ──
    const lightBeams: LightBeam[] = [];
    const beamGeom = new THREE.ConeGeometry(1.5, 5, 24, 1, true);
    disposables.push(beamGeom);
    const beamConfigs: Array<{ x: number; z: number; tilt: number }> = isMobile
      ? [
          { x: -2.5, z: 0.4, tilt: 0.15 },
          { x: 2.5, z: 0.4, tilt: -0.15 },
        ]
      : [
          { x: -3.2, z: 0.2, tilt: 0.18 },
          { x: 0, z: -0.6, tilt: 0 },
          { x: 3.2, z: 0.2, tilt: -0.18 },
        ];
    beamConfigs.forEach((bc) => {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.02,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      disposables.push(mat);
      const mesh = new THREE.Mesh(beamGeom, mat);
      // Cone is apex-up by default; we want it hanging from the ceiling
      // with its apex AT the ceiling and widening downward to the floor.
      mesh.rotation.x = Math.PI; // flip so base is at the floor
      mesh.rotation.z = bc.tilt;
      mesh.position.set(bc.x, 1.5, bc.z);
      scene.add(mesh);
      lightBeams.push({
        mesh,
        material: mat,
        rotSpeed: 0.0003 * (bc.x < 0 ? 1 : -1),
      });
    });

    // ── Floor reflections / shadow pools under characters ──
    const shadowTex = makeShadowGradientTexture();
    if (shadowTex) disposables.push(shadowTex);
    const reflGeom = new THREE.PlaneGeometry(2, 2);
    disposables.push(reflGeom);
    const reflections: Reflection[] = [];
    const reflConfigs: Array<{ x: number; side: Reflection["side"] }> = [
      { x: -2.5, side: "hero" },
      { x: 2.5, side: "boss" },
    ];
    reflConfigs.forEach((rc) => {
      const mat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        map: shadowTex ?? undefined,
        alphaMap: shadowTex ?? undefined,
        transparent: true,
        opacity: 0.15,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      disposables.push(mat);
      const mesh = new THREE.Mesh(reflGeom, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(rc.x, 0.005, 0.5);
      scene.add(mesh);
      reflections.push({ mesh, material: mat, side: rc.side });
    });

    // ── Energy conduits on walls ──
    const conduits: Conduit[] = [];
    const conduitPaths: THREE.Vector3[][] = isMobile
      ? [
          // 4 conduits on mobile.
          [
            new THREE.Vector3(-6, 3.6, -4.48),
            new THREE.Vector3(-1.5, 3.6, -4.48),
            new THREE.Vector3(-1.5, 2.4, -4.48),
            new THREE.Vector3(6, 2.4, -4.48),
          ],
          [
            new THREE.Vector3(-5, 0.4, -4.48),
            new THREE.Vector3(5, 0.4, -4.48),
          ],
          [
            new THREE.Vector3(-2, 0.3, -4.48),
            new THREE.Vector3(-2, 5, -4.48),
          ],
          [new THREE.Vector3(2, 0.3, -4.48), new THREE.Vector3(2, 5, -4.48)],
        ]
      : [
          // Back wall horizontal top run with a kink.
          [
            new THREE.Vector3(-6.5, 3.8, -4.48),
            new THREE.Vector3(-1, 3.8, -4.48),
            new THREE.Vector3(-0.7, 4.1, -4.48),
            new THREE.Vector3(0.7, 4.1, -4.48),
            new THREE.Vector3(1, 3.8, -4.48),
            new THREE.Vector3(6.5, 3.8, -4.48),
          ],
          // Mid run
          [
            new THREE.Vector3(-5.5, 2.7, -4.48),
            new THREE.Vector3(-1.2, 2.7, -4.48),
            new THREE.Vector3(-1.2, 2.2, -4.48),
            new THREE.Vector3(1.2, 2.2, -4.48),
            new THREE.Vector3(1.2, 2.7, -4.48),
            new THREE.Vector3(5.5, 2.7, -4.48),
          ],
          // Low run (along the floor crease)
          [
            new THREE.Vector3(-6, 0.35, -4.48),
            new THREE.Vector3(6, 0.35, -4.48),
          ],
          // Vertical spine left
          [
            new THREE.Vector3(-3.5, 0.3, -4.48),
            new THREE.Vector3(-3.5, 5, -4.48),
          ],
          // Vertical spine right
          [
            new THREE.Vector3(3.5, 0.3, -4.48),
            new THREE.Vector3(3.5, 5, -4.48),
          ],
          // Diagonal
          [
            new THREE.Vector3(-5, 0.5, -4.48),
            new THREE.Vector3(-2, 2, -4.48),
            new THREE.Vector3(2, 2.4, -4.48),
            new THREE.Vector3(5, 4, -4.48),
          ],
          // Left-side wall vein (running with the tilt)
          [
            new THREE.Vector3(-4.6, 0.5, 1.6),
            new THREE.Vector3(-5.5, 2.5, 0.4),
            new THREE.Vector3(-5.9, 4.5, -1.4),
          ],
          // Right-side wall vein
          [
            new THREE.Vector3(4.6, 0.5, 1.6),
            new THREE.Vector3(5.5, 2.5, 0.4),
            new THREE.Vector3(5.9, 4.5, -1.4),
          ],
        ];
    const baseConduitColour = new THREE.Color(0x3b82f6);
    conduitPaths.forEach((path) => {
      const geom = new THREE.BufferGeometry().setFromPoints(path);
      disposables.push(geom);
      const mat = new THREE.LineBasicMaterial({
        color: baseConduitColour.clone(),
        transparent: true,
        opacity: 0.08,
        depthWrite: false,
      });
      disposables.push(mat);
      const line = new THREE.Line(geom, mat);
      scene.add(line);
      conduits.push({
        line,
        material: mat,
        flashUntil: 0,
        baseColour: baseConduitColour.clone(),
      });
    });

    // ── Ambient haze plane ──
    const hazeTex = makeHazeTexture();
    if (hazeTex) {
      hazeTex.repeat.set(1.2, 1);
      disposables.push(hazeTex);
    }
    const hazeGeom = new THREE.PlaneGeometry(14, 6);
    disposables.push(hazeGeom);
    const hazeMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: hazeTex ?? undefined,
      transparent: true,
      opacity: 0.03,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    disposables.push(hazeMat);
    const hazeMesh = new THREE.Mesh(hazeGeom, hazeMat);
    hazeMesh.position.set(0, 2.2, -1);
    scene.add(hazeMesh);

    // ── Lights ──
    const phase0 = PHASE_PALETTE[0];
    const ambient = new THREE.AmbientLight(phase0.ambient, phase0.ambientI);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(phase0.key, phase0.keyI);
    keyLight.position.set(0, 5, 5);
    keyLight.target.position.set(0, 0.5, 0);
    scene.add(keyLight);
    scene.add(keyLight.target);

    const spotLight = new THREE.SpotLight(
      phase0.spot,
      phase0.spotI,
      14,
      Math.PI / 6,
      0.5,
      1
    );
    spotLight.position.set(0, 6, 1);
    spotLight.target.position.set(0, 0, 0);
    scene.add(spotLight);
    scene.add(spotLight.target);

    const fillLeft = new THREE.PointLight(phase0.fill, phase0.fillI, 10, 2);
    fillLeft.position.set(-4, 2, 2);
    scene.add(fillLeft);

    const fillRight = new THREE.PointLight(phase0.fill, phase0.fillI, 10, 2);
    fillRight.position.set(4, 2, 2);
    scene.add(fillRight);

    const driftOrbs: THREE.PointLight[] = [];
    if (!isMobile) {
      const orbColours = [0x60a5fa, 0x34d399, 0xfbbf24];
      for (let i = 0; i < 3; i++) {
        const orb = new THREE.PointLight(orbColours[i], 0.15, 6, 2);
        orb.position.set(
          Math.cos((i / 3) * Math.PI * 2) * 3,
          1.5 + i * 0.3,
          Math.sin((i / 3) * Math.PI * 2) * 2
        );
        orb.userData = { phaseOffset: (i / 3) * Math.PI * 2 };
        scene.add(orb);
        driftOrbs.push(orb);
      }
    }

    // ── Floating particles ──
    // Fewer but larger + slightly brighter — better depth, less visual noise.
    const particles: THREE.Mesh[] = [];
    const particleCount = isMobile ? 20 : 50;
    const partGeom = new THREE.SphereGeometry(1, 6, 6);
    disposables.push(partGeom);
    // Varied per-colour opacity across the 0.2–0.4 range (fixed-per-material
    // is cheap and still reads as variance at 50 particles).
    const partOpacities = [0.22, 0.28, 0.34, 0.4];
    const partMats = BRAND_COLOURS.map((c, i) => {
      const m = new THREE.MeshBasicMaterial({
        color: c,
        transparent: true,
        opacity: partOpacities[i % partOpacities.length],
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      disposables.push(m);
      return m;
    });
    for (let i = 0; i < particleCount; i++) {
      const mat = partMats[i % partMats.length];
      const p = new THREE.Mesh(partGeom, mat);
      // Size 0.03–0.06 (was 0.02–0.05).
      p.scale.setScalar(0.03 + Math.random() * 0.03);
      p.position.set(
        (Math.random() - 0.5) * 10,
        Math.random() * 4,
        (Math.random() - 0.5) * 4 - 1
      );
      p.userData = {
        drift: 0.002 + Math.random() * 0.004,
        sway: Math.random() * Math.PI * 2,
        swaySpeed: 0.4 + Math.random() * 0.6,
      };
      scene.add(p);
      particles.push(p);
    }

    // ── Floating code snippets ──
    const codeSnippets: CodeSnippetObj[] = [];
    const snippetCount = isMobile ? 8 : 15;
    const codeGeom = new THREE.PlaneGeometry(1.5, 0.3);
    disposables.push(codeGeom);
    for (let i = 0; i < snippetCount; i++) {
      const text = CODE_SNIPPETS[i % CODE_SNIPPETS.length];
      const tex = makeCodeSnippetTexture(text);
      if (tex) disposables.push(tex);
      const mat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: tex ?? undefined,
        transparent: true,
        opacity: 0.1,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      disposables.push(mat);
      const mesh = new THREE.Mesh(codeGeom, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 10,
        0.5 + Math.random() * 3.5,
        -4 + Math.random() * 6
      );
      mesh.rotation.z = (Math.random() - 0.5) * 0.3;
      mesh.rotation.y = (Math.random() - 0.5) * 0.4;
      // Lower ceiling (max 0.10) — snippets should read as watermarks.
      const baseOp = 0.05 + Math.random() * 0.05;
      mat.opacity = baseOp;
      scene.add(mesh);
      // Drift ~30% slower than before.
      codeSnippets.push({
        mesh,
        material: mat,
        vx: (Math.random() - 0.5) * 0.0035,
        vy: (Math.random() - 0.5) * 0.0028,
        vz: (Math.random() - 0.5) * 0.0021,
        rotSpeed: (Math.random() - 0.5) * 0.0028,
        baseOpacity: baseOp,
      });
    }

    // ── Hexagonal data nodes + connecting lines ──
    const hexNodes: HexNode[] = [];
    const nodeLinks: NodeLink[] = [];
    const hexGeom = makeHexagonGeometry(0.15);
    disposables.push(hexGeom);
    const nodeCount = isMobile ? 6 : 10;
    const nodePositions: THREE.Vector3[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const x = (Math.random() - 0.5) * 9;
      const y = 1.5 + Math.random() * 2;
      const z = -3 + Math.random() * 4;
      nodePositions.push(new THREE.Vector3(x, y, z));

      const baseColour = new THREE.Color(
        BRAND_COLOURS[i % BRAND_COLOURS.length]
      );
      const mat = new THREE.MeshBasicMaterial({
        color: baseColour.clone(),
        transparent: true,
        // Emissive intensity reduced 40% (0.6 → 0.36) — subtle background.
        opacity: 0.36,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      disposables.push(mat);
      const mesh = new THREE.Mesh(hexGeom, mat);
      mesh.position.copy(nodePositions[i]);
      scene.add(mesh);
      hexNodes.push({
        mesh,
        baseY: y,
        phase: Math.random() * Math.PI * 2,
        freq: 0.4 + Math.random() * 0.5,
        baseColour,
      });
    }

    // Connect each node to its 1-2 nearest neighbours.
    const connections = new Set<string>();
    for (let i = 0; i < nodePositions.length; i++) {
      const dists = nodePositions
        .map((p, j) => ({ j, d: p.distanceTo(nodePositions[i]) }))
        .filter((o) => o.j !== i)
        .sort((a, b) => a.d - b.d);
      const k = Math.min(2, dists.length);
      for (let n = 0; n < k; n++) {
        const a = Math.min(i, dists[n].j);
        const b = Math.max(i, dists[n].j);
        const key = `${a}-${b}`;
        if (connections.has(key)) continue;
        connections.add(key);
        const geom = new THREE.BufferGeometry().setFromPoints([
          nodePositions[a],
          nodePositions[b],
        ]);
        disposables.push(geom);
        const lineMat = new THREE.LineBasicMaterial({
          color: 0x60a5fa,
          transparent: true,
          opacity: 0.06,
          depthWrite: false,
        });
        disposables.push(lineMat);
        const line = new THREE.Line(geom, lineMat);
        scene.add(line);
        nodeLinks.push({
          line,
          material: lineMat,
          nodeA: a,
          nodeB: b,
          flashUntil: 0,
        });
      }
    }

    // ── Rotating wireframe globe (double shell) ──
    let globeOuter: THREE.Mesh | null = null;
    let globeInner: THREE.Mesh | null = null;
    let globeCore: THREE.PointLight | null = null;
    let globeMatOuter: THREE.MeshBasicMaterial | null = null;
    let globeMatInner: THREE.MeshBasicMaterial | null = null;
    if (!isMobile) {
      const innerGeom = new THREE.SphereGeometry(1.2, 16, 12);
      disposables.push(innerGeom);
      const outerGeom = new THREE.SphereGeometry(1.25, 16, 12);
      disposables.push(outerGeom);
      globeMatInner = new THREE.MeshBasicMaterial({
        color: 0x60a5fa,
        wireframe: true,
        transparent: true,
        opacity: 0.1,
        depthWrite: false,
      });
      disposables.push(globeMatInner);
      globeMatOuter = new THREE.MeshBasicMaterial({
        color: 0x7c3aed,
        wireframe: true,
        transparent: true,
        opacity: 0.06,
        depthWrite: false,
      });
      disposables.push(globeMatOuter);
      globeInner = new THREE.Mesh(innerGeom, globeMatInner);
      globeInner.position.set(0, 3.5, -3.5);
      scene.add(globeInner);
      globeOuter = new THREE.Mesh(outerGeom, globeMatOuter);
      globeOuter.position.set(0, 3.5, -3.5);
      scene.add(globeOuter);
      globeCore = new THREE.PointLight(0x60a5fa, 0.1, 4, 2);
      globeCore.position.set(0, 3.5, -3.5);
      scene.add(globeCore);
    }

    // ── Floating shield icons ──
    const floatingShields: FloatingShield[] = [];
    const shieldAlpha = makeShieldAlphaTexture();
    if (shieldAlpha) disposables.push(shieldAlpha);
    const shieldCount = isMobile ? 3 : 5;
    const shieldGeom = new THREE.PlaneGeometry(1, 1);
    disposables.push(shieldGeom);
    for (let i = 0; i < shieldCount; i++) {
      const colour = new THREE.Color(BRAND_COLOURS[i % BRAND_COLOURS.length]);
      const mat = new THREE.MeshBasicMaterial({
        color: colour.clone(),
        alphaMap: shieldAlpha ?? undefined,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      disposables.push(mat);
      const mesh = new THREE.Mesh(shieldGeom, mat);
      const size = 0.3 + Math.random() * 0.2;
      mesh.scale.setScalar(size);
      mesh.position.set(
        (Math.random() - 0.5) * 8,
        1.2 + Math.random() * 2.5,
        -2 + Math.random() * 3
      );
      scene.add(mesh);
      floatingShields.push({
        mesh,
        material: mat,
        rotSpeed: 0.005 + Math.random() * 0.01,
        baseColour: colour,
      });
    }

    // ── Electric arc (single reusable) ──
    let electricArc: ElectricArc | null = null;
    if (!isMobile) {
      const arcSegs = 12;
      const arcGeom = new THREE.BufferGeometry();
      arcGeom.setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array((arcSegs + 1) * 3), 3)
      );
      disposables.push(arcGeom);
      const arcMat = new THREE.LineBasicMaterial({
        color: 0x93c5fd,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      disposables.push(arcMat);
      const line = new THREE.Line(arcGeom, arcMat);
      line.visible = false;
      scene.add(line);
      electricArc = {
        line,
        geometry: arcGeom,
        material: arcMat,
        activeUntil: 0,
      };
    }

    refs.current = {
      scene,
      camera,
      renderer,
      ambient,
      keyLight,
      spotLight,
      fillLeft,
      fillRight,
      driftOrbs,
      floorTexture: hexFloorTex,
      dataFlowTexture: dataFlowTex,
      particles,
      particleBounds: { minY: 0, maxY: 4 },

      codeSnippets,
      binaryStreams,
      hexNodes,
      nodeLinks,
      globeOuter,
      globeInner,
      globeCore,
      globeMatOuter,
      globeMatInner,
      arenaRingInner: ringInner,
      arenaRingOuter: ringOuter,
      floorLogo,
      floorLogoMat,
      floorLogoRing,
      floorLogoRingMat,
      floorLogoHalo,
      floorLogoHaloMat,
      shockwaves: [],
      shockwavePool,
      shockwaveGeom,
      holoScreens,
      floatingShields,
      electricArc,
      arcNextAt: performance.now() / 1000 + 4 + Math.random() * 4,
      codeFlashUntil: 0,
      nodeFlashUntil: 0,
      binaryBoostUntil: 0,
      binaryDangerUntil: 0,

      lightBeams,
      reflections,
      conduits,
      conduitNextAt: performance.now() / 1000 + 2 + Math.random() * 2,
      hazeMesh,
      hazeMaterial: hazeMat,
      hazeTexture: hazeTex,
      countdownLabel: null,
      countdownActiveUntil: 0,
      goFlashUntil: 0,
      cameraState: {
        mode: "default",
        modeStart: 0,
        lateralPulseStart: 0,
        lateralPulseSide: 0,
      },

      disposables,
    };

    // ── Render loop ──
    let rafId = 0;
    let lastTime = performance.now();
    const tmpColour = new THREE.Color();
    let running = true;
    let frameCount = 0;

    const render = () => {
      if (!running) return;
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      const t = now / 1000;
      frameCount++;

      const r = refs.current;
      if (!r) {
        rafId = requestAnimationFrame(render);
        return;
      }

      const currentPhase = phaseRef.current;
      const currentMood = moodRef.current;

      // ── Lighting interpolation ──
      const activePalette =
        currentMood === "victory"
          ? VICTORY_PALETTE
          : PHASE_PALETTE[currentPhase];
      const dangerBoost =
        currentMood === "danger" ? DANGER_BOOST : { ambientI: 0, keyI: 0 };
      const lerpSpeed = 1 - Math.pow(0.001, dt);

      r.ambient.color.lerp(activePalette.ambient, lerpSpeed);
      r.ambient.intensity +=
        (activePalette.ambientI + dangerBoost.ambientI - r.ambient.intensity) *
        lerpSpeed;

      r.keyLight.color.lerp(activePalette.key, lerpSpeed);
      r.keyLight.intensity +=
        (activePalette.keyI + dangerBoost.keyI - r.keyLight.intensity) *
        lerpSpeed;

      const pulseRate = currentPhase === 3 ? 4.5 : 1.2;
      const pulse = 0.85 + 0.15 * Math.sin(t * pulseRate);
      r.spotLight.color.lerp(activePalette.spot, lerpSpeed);
      r.spotLight.intensity +=
        (activePalette.spotI * pulse - r.spotLight.intensity) * lerpSpeed;

      r.fillLeft.color.lerp(activePalette.fill, lerpSpeed);
      r.fillRight.color.lerp(activePalette.fill, lerpSpeed);
      const fillTarget =
        activePalette.fillI * (0.85 + 0.15 * Math.sin(t * pulseRate + 1.2));
      r.fillLeft.intensity += (fillTarget - r.fillLeft.intensity) * lerpSpeed;
      r.fillRight.intensity += (fillTarget - r.fillRight.intensity) * lerpSpeed;

      // Fog
      if (activePalette.fogDensity > 0) {
        if (!r.scene.fog) {
          r.scene.fog = new THREE.FogExp2(
            activePalette.fogColor.getHex(),
            activePalette.fogDensity
          );
        } else {
          const fog = r.scene.fog as THREE.FogExp2;
          tmpColour.copy(fog.color).lerp(activePalette.fogColor, lerpSpeed);
          fog.color.copy(tmpColour);
          fog.density +=
            (activePalette.fogDensity - fog.density) * lerpSpeed;
        }
      } else if (r.scene.fog) {
        const fog = r.scene.fog as THREE.FogExp2;
        fog.density *= 1 - lerpSpeed;
        if (fog.density < 0.001) r.scene.fog = null;
      }

      // ── Floor + data flow scroll ──
      if (r.floorTexture) r.floorTexture.offset.y -= 0.0003 * (dt * 60);
      if (r.dataFlowTexture) r.dataFlowTexture.offset.x -= 0.008 * (dt * 60);

      // ── Arena ring ──
      r.arenaRingInner.rotation.z += 0.001 * (dt * 60);
      r.arenaRingOuter.rotation.z -= 0.0008 * (dt * 60);
      const innerRingMat = r.arenaRingInner.material as THREE.MeshBasicMaterial;
      const outerRingMat = r.arenaRingOuter.material as THREE.MeshBasicMaterial;
      if (currentMood === "victory") {
        innerRingMat.color.setHex(0xfde047);
        outerRingMat.color.setHex(0xfbbf24);
      } else if (currentPhase >= 2) {
        innerRingMat.color.setHex(currentPhase === 3 ? 0xef4444 : 0xf97316);
      } else {
        innerRingMat.color.setHex(0x93c5fd);
      }
      // Subtle 3s pulse between 0.35 and 0.45 — the ring breathes.
      const ringPulse = 0.4 + 0.05 * Math.sin((t * Math.PI * 2) / 3);
      innerRingMat.opacity = ringPulse;
      outerRingMat.opacity = ringPulse * 0.38;

      // ── Floor shield logo: glowing pulse + mood/phase tint ──
      const logoBreath = Math.sin((t * Math.PI * 2) / 4); // −1..1 over 4s
      const logoPulse = 0.3 + 0.08 * logoBreath;
      const haloPulse = 0.18 + 0.07 * logoBreath;
      let logoTargetOp: number;
      let haloTargetOp: number;
      let logoTargetCol: THREE.Color;
      let haloTargetCol: THREE.Color;
      let ringTargetCol: THREE.Color;
      let ringTargetOp: number;
      if (currentMood === "victory") {
        logoTargetOp = 0.6;
        haloTargetOp = 0.45;
        logoTargetCol = tmpColour.setHex(0xfde68a).clone();
        haloTargetCol = new THREE.Color(0xfbbf24);
        ringTargetCol = new THREE.Color(0xfde047);
        ringTargetOp = 0.4;
      } else if (currentPhase === 3) {
        logoTargetOp = 0.15;
        haloTargetOp = 0.12;
        logoTargetCol = tmpColour.setHex(0xfecaca).clone();
        haloTargetCol = new THREE.Color(0xef4444);
        ringTargetCol = new THREE.Color(0xef4444);
        ringTargetOp = 0.1;
      } else {
        logoTargetOp = logoPulse;
        haloTargetOp = haloPulse;
        logoTargetCol = tmpColour.setHex(0xffffff).clone();
        haloTargetCol = new THREE.Color(0x60a5fa);
        ringTargetCol = new THREE.Color(0x60a5fa);
        ringTargetOp = 0.18 + 0.05 * logoBreath;
      }
      r.floorLogoMat.opacity +=
        (logoTargetOp - r.floorLogoMat.opacity) * lerpSpeed;
      r.floorLogoMat.color.lerp(logoTargetCol, lerpSpeed);
      r.floorLogoHaloMat.opacity +=
        (haloTargetOp - r.floorLogoHaloMat.opacity) * lerpSpeed;
      r.floorLogoHaloMat.color.lerp(haloTargetCol, lerpSpeed);
      r.floorLogoRingMat.opacity +=
        (ringTargetOp - r.floorLogoRingMat.opacity) * lerpSpeed;
      r.floorLogoRingMat.color.lerp(ringTargetCol, lerpSpeed);
      r.floorLogoRing.rotation.z -= 0.0005 * (dt * 60);

      // ── Shockwaves ──
      for (let i = r.shockwaves.length - 1; i >= 0; i--) {
        const sw = r.shockwaves[i];
        const age = t - sw.startTime;
        const dur = 0.5;
        if (age >= dur) {
          sw.mesh.visible = false;
          r.shockwavePool.push(sw);
          r.shockwaves.splice(i, 1);
          continue;
        }
        const progress = age / dur;
        // Ring geom has mean radius 0.5; scale 1→8 maps to world radius 0.5→4.
        const scale = 1 + progress * 7;
        sw.mesh.scale.set(scale, scale, 1);
        sw.material.opacity = 0.7 * (1 - progress);
      }

      // ── Holo screens bob + live content ──
      const countdownActive = t < r.countdownActiveUntil && r.countdownLabel;
      r.holoScreens.forEach((s, i) => {
        s.mesh.position.y = s.baseY + Math.sin(t * 0.9 + s.bobDelay) * 0.1;
        s.backlight.position.y = s.mesh.position.y;
        const warning = t < s.warningUntil;
        // During countdown, every screen redraws immediately with the big
        // number; otherwise use reduced cadence for performance.
        const redrawEvery = s.type === "radar" ? 6 : 12;
        const shouldRedraw =
          countdownActive || (frameCount + i) % redrawEvery === 0;
        if (s.live && shouldRedraw) {
          if (countdownActive && r.countdownLabel) {
            drawCountdownOverlay(s.live, r.countdownLabel);
          } else if (s.type === "radar") {
            drawRadar(s.live, t, warning);
          } else if (s.type === "log") {
            s.logScroll += dt * (warning ? 2.8 : 0.9);
            drawLogFeed(s.live, s.logScroll, warning);
          } else if (s.type === "shield") {
            const brightness = 0.55 + 0.35 * Math.sin(t * 1.4 + s.bobDelay);
            drawShieldGfx(s.live, brightness, currentMood, warning);
          } else {
            drawThreatBars(
              s.live,
              currentPhase,
              t,
              warning,
              s.type === "threat0" ? 0 : 1
            );
          }
        }
        // Backlight warmth
        const glowMat = s.backlight.material as THREE.MeshBasicMaterial;
        const targetGlow = warning
          ? 0xef4444
          : currentMood === "victory"
            ? 0xfde047
            : currentPhase >= 2
              ? 0xf97316
              : 0x60a5fa;
        glowMat.color.lerp(new THREE.Color(targetGlow), lerpSpeed);
        // Halved — screens are decor, not foreground UI.
        glowMat.opacity = 0.1 + 0.04 * Math.sin(t * 1.3 + s.bobDelay);
      });

      // ── Drift orbs orbit ──
      r.driftOrbs.forEach((orb) => {
        const ud = orb.userData as { phaseOffset: number };
        const orbT = t * 0.25 + ud.phaseOffset;
        orb.position.x = Math.cos(orbT) * 3.2;
        orb.position.z = Math.sin(orbT) * 2.2 - 0.5;
        orb.position.y = 1.6 + Math.sin(t * 0.6 + ud.phaseOffset) * 0.4;
      });

      // ── Particles drift ──
      r.particles.forEach((p) => {
        const ud = p.userData as {
          drift: number;
          sway: number;
          swaySpeed: number;
        };
        p.position.y += ud.drift * (dt * 60);
        p.position.x += Math.sin(t * ud.swaySpeed + ud.sway) * 0.0015 * (dt * 60);
        if (p.position.y > r.particleBounds.maxY) {
          p.position.y = r.particleBounds.minY - Math.random() * 0.5;
          p.position.x = (Math.random() - 0.5) * 10;
          p.position.z = (Math.random() - 0.5) * 4 - 1;
        }
      });

      // ── Floating code snippets drift ──
      const codeFlashing = t < r.codeFlashUntil;
      r.codeSnippets.forEach((cs) => {
        const m = cs.mesh;
        m.position.x += cs.vx * (dt * 60);
        m.position.y += cs.vy * (dt * 60);
        m.position.z += cs.vz * (dt * 60);
        m.rotation.z += cs.rotSpeed * (dt * 60);

        // Wrap-around: if out of bounds, reset to opposite.
        if (m.position.x > 5.5) m.position.x = -5.5;
        if (m.position.x < -5.5) m.position.x = 5.5;
        if (m.position.y > 4.2) m.position.y = 0.3;
        if (m.position.y < 0.2) m.position.y = 4.2;
        if (m.position.z > 2.5) m.position.z = -4.5;
        if (m.position.z < -4.5) m.position.z = 2.5;

        // Flash target reduced 0.3 → 0.2 for a softer correct-answer pop.
        const target = codeFlashing ? 0.2 : cs.baseOpacity;
        cs.material.opacity += (target - cs.material.opacity) * lerpSpeed;
      });

      // ── Binary streams ──
      const binaryDanger = t < r.binaryDangerUntil;
      const binaryBoost = t < r.binaryBoostUntil;
      const scrollRate = binaryBoost ? 0.009 : 0.003;
      r.binaryStreams.forEach((bs) => {
        bs.texture.offset.y -= scrollRate * (dt * 60);
        const target = binaryDanger ? bs.dangerColour : bs.baseColour;
        bs.material.color.lerp(target, lerpSpeed);
        const targetOp = binaryBoost
          ? bs.baseOpacity * 2.2
          : bs.baseOpacity;
        bs.material.opacity += (targetOp - bs.material.opacity) * lerpSpeed;
      });

      // ── Hex nodes bob + flash ──
      const nodeFlashing = t < r.nodeFlashUntil;
      r.hexNodes.forEach((n) => {
        n.mesh.position.y = n.baseY + Math.sin(t * n.freq + n.phase) * 0.15;
        n.mesh.rotation.z += 0.003 * (dt * 60);
        const mat = n.mesh.material as THREE.MeshBasicMaterial;
        // Dimmer baseline + gentler flash peak (was 1.0 → 0.55).
        const targetOp = nodeFlashing ? 0.6 : 0.33;
        mat.opacity += (targetOp - mat.opacity) * lerpSpeed;
      });

      // ── Node link flashes ──
      const secondsUntilLinkFlash = 4 + Math.sin(t * 0.7) * 0.5;
      const linkIndex = Math.floor(t / secondsUntilLinkFlash) % Math.max(1, r.nodeLinks.length);
      if (r.nodeLinks.length > 0) {
        const targetLink = r.nodeLinks[linkIndex];
        if (t > targetLink.flashUntil - 0.1 && t < targetLink.flashUntil) {
          // just decaying
        } else if (
          Math.floor(t * 4) !== Math.floor((t - dt) * 4) &&
          Math.random() < 0.03
        ) {
          targetLink.flashUntil = t + 0.4;
        }
      }
      r.nodeLinks.forEach((link) => {
        const isFlashing = t < link.flashUntil;
        const forceFlash = nodeFlashing;
        // Dimmer flash peak + dimmer baseline (0.12 → 0.06).
        const target = isFlashing || forceFlash ? 0.45 : 0.06;
        link.material.opacity += (target - link.material.opacity) * lerpSpeed;
      });

      // ── Wireframe globe ──
      if (r.globeInner && r.globeOuter && r.globeMatInner && r.globeMatOuter) {
        const victory = currentMood === "victory";
        const spinMult = victory ? 3 : 1;
        r.globeInner.rotation.y += 0.002 * spinMult * (dt * 60);
        r.globeInner.rotation.x += 0.0005 * spinMult * (dt * 60);
        r.globeOuter.rotation.y -= 0.0015 * spinMult * (dt * 60);
        r.globeOuter.rotation.z += 0.0007 * spinMult * (dt * 60);
        const targetInnerCol = victory ? 0xfde047 : 0x60a5fa;
        const targetOuterCol = victory ? 0xfbbf24 : 0x7c3aed;
        r.globeMatInner.color.lerp(
          new THREE.Color(targetInnerCol),
          lerpSpeed
        );
        r.globeMatOuter.color.lerp(
          new THREE.Color(targetOuterCol),
          lerpSpeed
        );
        if (r.globeCore) {
          r.globeCore.color.copy(r.globeMatInner.color);
          r.globeCore.intensity = victory ? 0.25 : 0.1;
        }
      }

      // ── Floating shields ──
      r.floatingShields.forEach((fs) => {
        fs.mesh.rotation.y += fs.rotSpeed * (dt * 60);
        const victoryCol = new THREE.Color(0xfde047);
        const target =
          currentMood === "victory" ? victoryCol : fs.baseColour;
        fs.material.color.lerp(target, lerpSpeed);
        const targetOp = currentMood === "victory" ? 0.4 : 0.15;
        fs.material.opacity += (targetOp - fs.material.opacity) * lerpSpeed;
      });

      // ── Electric arcs ──
      if (r.electricArc) {
        const arc = r.electricArc;
        if (t < arc.activeUntil) {
          // still visible — no-op
        } else if (arc.line.visible) {
          arc.line.visible = false;
          arc.material.opacity = 0;
        }

        if (t >= r.arcNextAt && !arc.line.visible) {
          const from = new THREE.Vector3(
            -4.5 + Math.random() * 9,
            2.5 + Math.random() * 1.3,
            -3.5 + Math.random() * 3
          );
          const to = new THREE.Vector3(
            -4.5 + Math.random() * 9,
            2.5 + Math.random() * 1.3,
            -3.5 + Math.random() * 3
          );
          const positions = makeArcPositions(from, to, 12);
          const attr = arc.geometry.getAttribute(
            "position"
          ) as THREE.BufferAttribute;
          attr.array.set(positions);
          attr.needsUpdate = true;

          const phase3 = currentPhase === 3;
          arc.material.color.setHex(phase3 ? 0xef4444 : 0x93c5fd);
          arc.material.opacity = 0.4;
          arc.line.visible = true;
          arc.activeUntil = t + 0.15;

          const gap = phase3
            ? 2 + Math.random() * 1
            : 6 + Math.random() * 2;
          r.arcNextAt = t + gap;
        }
      }

      // ── Volumetric light beams ──
      const beamVictory = currentMood === "victory";
      const beamOpacityTarget = beamVictory ? 0.04 : 0.02;
      const beamColTarget = beamVictory ? 0xfde047 : 0xffffff;
      const beamColVec = new THREE.Color(beamColTarget);
      r.lightBeams.forEach((b) => {
        b.mesh.rotation.y += b.rotSpeed * (dt * 60);
        b.material.opacity +=
          (beamOpacityTarget - b.material.opacity) * lerpSpeed;
        b.material.color.lerp(beamColVec, lerpSpeed);
      });

      // ── Floor reflections ──
      r.reflections.forEach((refl) => {
        const mat = refl.material;
        if (currentMood === "victory") {
          // Hero pool warms to a faint gold; boss pool stays dark (losers stay grim).
          const target =
            refl.side === "hero"
              ? new THREE.Color(0xffd67a)
              : new THREE.Color(0x000000);
          mat.color.lerp(target, lerpSpeed);
          const op = refl.side === "hero" ? 0.22 : 0.15;
          mat.opacity += (op - mat.opacity) * lerpSpeed;
        } else {
          mat.color.lerp(new THREE.Color(0x000000), lerpSpeed);
          mat.opacity += (0.15 - mat.opacity) * lerpSpeed;
        }
      });

      // ── Energy conduits ──
      // Fire a new conduit pulse on a schedule — faster in phase 2+.
      const conduitInterval = currentPhase >= 2 ? 1.5 + Math.random() : 3 + Math.random();
      if (t >= r.conduitNextAt && r.conduits.length > 0) {
        const idx = Math.floor(Math.random() * r.conduits.length);
        r.conduits[idx].flashUntil = t + 0.3;
        r.conduitNextAt = t + conduitInterval;
      }
      const conduitHotCol = new THREE.Color(
        currentPhase === 3 ? 0xef4444 : currentPhase === 2 ? 0xf97316 : 0x93c5fd
      );
      const conduitColdCol = new THREE.Color(
        currentPhase === 3 ? 0xef4444 : currentPhase === 2 ? 0xf97316 : 0x3b82f6
      );
      r.conduits.forEach((c) => {
        const flashing = t < c.flashUntil;
        const target = flashing ? conduitHotCol : conduitColdCol;
        c.material.color.lerp(target, lerpSpeed);
        const targetOp = flashing ? 0.55 : 0.08;
        c.material.opacity += (targetOp - c.material.opacity) * lerpSpeed;
      });

      // ── Ambient haze drift ──
      if (r.hazeTexture) {
        r.hazeTexture.offset.x += 0.0005 * (dt * 60);
      }
      if (r.hazeMaterial) {
        const hazeTarget = new THREE.Color(
          currentPhase === 3 ? 0xff7070 : 0xffffff
        );
        r.hazeMaterial.color.lerp(hazeTarget, lerpSpeed);
      }

      // ── Countdown effects (ring pulse + GO flash) ──
      if (countdownActive) {
        // Extra pulse on the arena ring while counting — just bump opacity.
        innerRingMat.opacity = Math.min(0.85, innerRingMat.opacity + 0.35);
        outerRingMat.opacity = Math.min(0.6, outerRingMat.opacity + 0.2);
      }
      if (t < r.goFlashUntil) {
        // Full-scene flash: every "base" emissive bumped briefly.
        const flashBoost = 1.8;
        r.ambient.intensity *= flashBoost;
        r.keyLight.intensity *= flashBoost;
        r.spotLight.intensity *= flashBoost;
        innerRingMat.opacity = Math.min(1, innerRingMat.opacity + 0.4);
        r.lightBeams.forEach(
          (b) => (b.material.opacity = Math.min(0.15, b.material.opacity + 0.1))
        );
      }

      // ── Camera: state machine (default / phaseOrbit / victoryOrbit) ──
      const camState = r.cameraState;

      // Auto-exit phaseOrbit after 3s.
      if (camState.mode === "phaseOrbit" && t - camState.modeStart > 3) {
        camState.mode = "default";
      }

      // Lateral attack-pulse: sin hump peaking at t=0.15s, gone by t=0.3s.
      let lateral = 0;
      if (camState.lateralPulseSide !== 0) {
        const age = t - camState.lateralPulseStart;
        const dur = 0.3;
        if (age >= 0 && age <= dur) {
          lateral = camState.lateralPulseSide * 0.5 * Math.sin((age / dur) * Math.PI);
        } else if (age > dur) {
          camState.lateralPulseSide = 0;
        }
      }

      // Build target position per mode.
      const tmpTarget = new THREE.Vector3();
      if (camState.mode === "phaseOrbit") {
        const progress = (t - camState.modeStart) / 3;
        const angle = progress * Math.PI * 2;
        const R = 8.2;
        tmpTarget.set(Math.sin(angle) * R, 4.2, Math.cos(angle) * R);
      } else if (camState.mode === "victoryOrbit") {
        const age = t - camState.modeStart;
        // First 2s: rise + pull back. After that: slow orbit at wide radius.
        const rise = Math.min(1, age / 2);
        const baseR = 8 + rise * 2; // 8 → 10
        const baseY = 3 + rise * 2; // 3 → 5
        const angle = (age / 12) * Math.PI * 2; // very slow spin
        tmpTarget.set(Math.sin(angle) * baseR, baseY, Math.cos(angle) * baseR);
      } else {
        // Default: idle drift + mood zoom + lateral offset.
        const targetZ = moodZoomRef.current.targetZ;
        const targetY = moodZoomRef.current.targetY;
        const driftX = Math.sin((t * Math.PI * 2) / 6) * (Math.PI / 360);
        const orbitX = Math.sin(driftX) * targetZ;
        const orbitZ = Math.cos(driftX) * targetZ;
        tmpTarget.set(orbitX + lateral, targetY, orbitZ);
      }

      // Smooth lerp toward the target each frame (framerate-independent).
      const camLerp = 1 - Math.pow(1 - 0.03, dt * 60);
      r.camera.position.lerp(tmpTarget, camLerp);

      // Shake overlay (not smoothed — instant per-frame jitter).
      currentShakeRef.current = shakeIntensityRef.current;
      shakeIntensityRef.current *= Math.pow(0.85, dt * 60);
      if (shakeIntensityRef.current < 0.01) shakeIntensityRef.current = 0;
      const shake = currentShakeRef.current;
      r.camera.position.x += (Math.random() - 0.5) * shake * 0.02;
      r.camera.position.y += (Math.random() - 0.5) * shake * 0.02;

      // Victory gets a slightly elevated lookAt target so the wide shot feels epic.
      const lookY = camState.mode === "victoryOrbit" ? 1.2 : 0.5;
      r.camera.lookAt(0, lookY, 0);

      r.renderer.render(r.scene, r.camera);
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    // ── Cleanup ──
    return () => {
      running = false;
      cancelAnimationFrame(rafId);

      const r = refs.current;
      if (!r) return;

      // Dispose active shockwaves (their materials are unique per pulse).
      r.shockwaves.forEach((sw) => {
        sw.material.dispose();
      });
      r.shockwavePool.forEach((sw) => {
        sw.material.dispose();
      });

      r.disposables.forEach((d) => {
        try {
          if (d instanceof THREE.WebGLRenderer) {
            d.dispose();
            d.forceContextLoss?.();
          } else {
            (d as { dispose: () => void }).dispose();
          }
        } catch {
          /* noop */
        }
      });

      if (r.renderer.domElement.parentElement === host) {
        host.removeChild(r.renderer.domElement);
      }

      refs.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Resize ──
  useEffect(() => {
    const r = refs.current;
    if (!r) return;
    r.renderer.setSize(width, height, false);
    r.camera.aspect = Math.max(1, width) / Math.max(1, height);
    r.camera.updateProjectionMatrix();
  }, [width, height]);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

// ──────────────────────────────────────────────────────────
// Helpers used inside effects
// ──────────────────────────────────────────────────────────

function spawnShockwave(r: SceneRefs, now: number) {
  let pulse = r.shockwavePool.pop();
  if (!pulse) {
    const mat = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(r.shockwaveGeom, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.02;
    r.scene.add(mesh);
    pulse = { mesh, material: mat, startTime: now };
  } else {
    pulse.mesh.visible = true;
    pulse.material.opacity = 0.7;
    pulse.startTime = now;
  }
  // Colour reflects current mood.
  if (r.shockwaves) {
    // noop
  }
  r.shockwaves.push(pulse);
}
