"use client";

import { useMemo, useRef, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoundedBox, Environment } from "@react-three/drei";
import {
  EffectComposer,
  Vignette,
  Noise,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";

interface LaptopSceneProps {
  progress: MotionValue<number>;
  reducedMotion?: boolean;
}

const COLORS = {
  ink: "#04050d",
  /* Premium space-gray aluminum body (was generic silver). Tuned to sit
   * just above pure black so the laptop reads with edge definition
   * against the dark scene. */
  steel: "#4a505f",
  steelEdge: "#646b7b",
  /* Deep matte panels */
  keyboard: "#080a10",
  trackpad: "#11141c",
  steelDark: "#1a1d28",
  cyan: "#00f5ff",
  cyanSoft: "#9ff5ff",
};

const RIG_X = 1.4;
const BASE_W = 3.6;
/* 2026-ultrabook ratio: base ~0.08 thick relative to ~3.6 wide gives a
 * slim 1:45 profile. Lid is even thinner. */
const BASE_H = 0.08;
const BASE_D = 2.5;
const LID_W = 3.55;
const LID_H = 0.05;
const LID_D = 2.42;
const LID_CLOSED_ANGLE = 0; // fully closed at scroll 0
const LID_OPEN_ANGLE = -2.0; // ~115° back when open

/* Canvas-painted glowing brand logo for the lid. Rendered at 2x
 * resolution then sampled down so the wordmark stays razor-sharp on
 * a 3D plane. Light halo + tight shadow so letters don't blur. */
function useLidBrandTexture(): THREE.Texture | null {
  return useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = 2048;
    c.height = 1024;
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    ctx.clearRect(0, 0, c.width, c.height);

    /* TIGHT halo behind the logo - stays close to the wordmark instead
     *  of bleeding across the whole lid. Inner radius bigger, outer
     *  radius much smaller than before. */
    const haloR = c.width / 4.2;
    const halo = ctx.createRadialGradient(
      c.width / 2,
      c.height / 2,
      haloR * 0.35,
      c.width / 2,
      c.height / 2,
      haloR,
    );
    halo.addColorStop(0, "rgba(0,245,255,0.22)");
    halo.addColorStop(0.6, "rgba(0,245,255,0.07)");
    halo.addColorStop(1, "rgba(0,245,255,0)");
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, c.width, c.height);

    /* AX chevron badge - bold filled mark above the wordmark, sized to
     *  match the wordmark proportions. */
    ctx.shadowColor = "rgba(0,245,255,1)";
    ctx.shadowBlur = 10;
    ctx.fillStyle = "#9ff5ff";
    ctx.beginPath();
    ctx.moveTo(c.width / 2 - 90, c.height / 2 - 160);
    ctx.lineTo(c.width / 2, c.height / 2 - 220);
    ctx.lineTo(c.width / 2 + 90, c.height / 2 - 160);
    ctx.lineTo(c.width / 2 + 64, c.height / 2 - 160);
    ctx.lineTo(c.width / 2, c.height / 2 - 200);
    ctx.lineTo(c.width / 2 - 64, c.height / 2 - 160);
    ctx.closePath();
    ctx.fill();

    /* Wordmark - bright cyan with TIGHT shadow so the letterforms stay
     *  crisp instead of blurring into a halo lake. */
    ctx.shadowColor = "rgba(0,245,255,0.85)";
    ctx.shadowBlur = 8;
    ctx.fillStyle = "#00f5ff";
    ctx.font = "900 180px ui-sans-serif, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    /* Manual letter-spacing draw */
    const letters = "ALGORITHMX";
    const spacing = 12;
    const totalW = letters
      .split("")
      .reduce((sum, ch) => sum + ctx.measureText(ch).width + spacing, -spacing);
    let cursorX = c.width / 2 - totalW / 2;
    for (const ch of letters) {
      const w = ctx.measureText(ch).width;
      ctx.fillText(ch, cursorX + w / 2, c.height / 2 + 20);
      cursorX += w + spacing;
    }

    /* Thin accent rule under the wordmark - clean nameplate finish */
    ctx.shadowBlur = 4;
    ctx.fillStyle = "rgba(0,245,255,0.45)";
    ctx.fillRect(c.width / 2 - 260, c.height / 2 + 110, 520, 3);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 16;
    tex.needsUpdate = true;
    return tex;
  }, []);
}

/* OLED-sharp screen texture. Pure-black background + multi-coloured
 * syntax tokens (keywords cyan, status badges in subject accent, paths
 * white, comments amber). Rendered at 2x resolution then sampled with
 * 16x anisotropic filtering so the text reads razor-sharp on the lid
 * plane. No soft tint background washes - real OLED panels have pure
 * black pixels with vibrant emissive content. */
function useScreenTexture(): THREE.Texture | null {
  return useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = 2048;
    c.height = 1280;
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    /* Best-quality canvas rendering */
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    /* OLED pure-black background */
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, c.width, c.height);

    /* Top-bar subtle cyan accent strip (mimics "active terminal" bar) */
    ctx.fillStyle = "rgba(0,245,255,0.06)";
    ctx.fillRect(0, 0, c.width, 6);

    /* Boot header - mixed colours: prompt "$ >" in dim cyan, command
     *  body in bright white, comments / status in accents. Crisp shadow
     *  only - no big halo. */
    const fontMono = "ui-monospace, 'JetBrains Mono', 'Courier New', monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    const drawTokens = (
      tokens: Array<{ text: string; color: string; bold?: boolean }>,
      x: number,
      y: number,
      size: number,
    ) => {
      let cursorX = x;
      for (const tok of tokens) {
        const weight = tok.bold ? "bold" : "500";
        ctx.font = `${weight} ${size}px ${fontMono}`;
        ctx.shadowBlur = 0;
        ctx.fillStyle = tok.color;
        ctx.fillText(tok.text, cursorX, y);
        cursorX += ctx.measureText(tok.text).width;
      }
    };

    /* HEADER */
    drawTokens(
      [
        { text: "> ", color: "rgba(0,245,255,0.55)" },
        { text: "ALGORITHMX_OS", color: "#00f5ff", bold: true },
        { text: " v1.0", color: "#7df0ff" },
        { text: "    // booting", color: "rgba(0,245,255,0.5)" },
      ],
      88,
      120,
      48,
    );
    drawTokens(
      [
        { text: "> ", color: "rgba(0,245,255,0.55)" },
        { text: "loading", color: "#ffd07a" },
        { text: " curriculum.json...", color: "#ffffff" },
      ],
      88,
      188,
      44,
    );
    drawTokens(
      [
        { text: "> ", color: "rgba(0,245,255,0.55)" },
        { text: "6 streams ready", color: "#5fffa3" },
        { text: "  /  ", color: "rgba(255,255,255,0.4)" },
        { text: "ages 6", color: "#ffffff" },
        { text: " — ", color: "rgba(255,255,255,0.4)" },
        { text: "adult", color: "#ffffff" },
      ],
      88,
      256,
      40,
    );

    /* Thin divider rule */
    ctx.fillStyle = "rgba(0,245,255,0.18)";
    ctx.fillRect(88, 310, c.width - 176, 2);

    /* SIX SUBJECT LINES - each with its accent + status badge */
    const subjects: Array<{ name: string; status: string; color: string }> = [
      { name: "CYBERSECURITY", status: "LIVE", color: "#5fffa3" },
      { name: "GAME DEV", status: "2026", color: "#9ff5ff" },
      { name: "AI & ML", status: "2026", color: "#cba8ff" },
      { name: "APP DEV", status: "2027", color: "#ffd07a" },
      { name: "ENTREPRENEURSHIP", status: "2027", color: "#ffc94a" },
      { name: "ROBOTICS", status: "2027", color: "#ff3ad6" },
    ];
    subjects.forEach((s, i) => {
      const y = 380 + i * 78;
      /* Indicator dot in the accent color */
      ctx.fillStyle = s.color;
      ctx.shadowColor = s.color;
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(110, y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      /* Subject name in accent colour */
      ctx.font = `bold 44px ${fontMono}`;
      ctx.fillStyle = s.color;
      ctx.fillText(s.name, 150, y);
      /* Status badge - solid filled pill, bold text inside */
      const badgeText = s.status;
      ctx.font = `bold 30px ${fontMono}`;
      const tw = ctx.measureText(badgeText).width;
      const padX = 28;
      const bw = tw + padX * 2;
      const bh = 50;
      const bx = c.width - 110 - bw;
      const by = y - bh / 2;
      ctx.fillStyle = s.color;
      ctx.beginPath();
      const r = 8;
      ctx.moveTo(bx + r, by);
      ctx.lineTo(bx + bw - r, by);
      ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + r);
      ctx.lineTo(bx + bw, by + bh - r);
      ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - r, by + bh);
      ctx.lineTo(bx + r, by + bh);
      ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - r);
      ctx.lineTo(bx, by + r);
      ctx.quadraticCurveTo(bx, by, bx + r, by);
      ctx.closePath();
      ctx.fill();
      /* Badge text in deep ink against the accent fill */
      ctx.fillStyle = "#04050d";
      ctx.textAlign = "center";
      ctx.fillText(badgeText, bx + bw / 2, y + 2);
      ctx.textAlign = "left";
    });

    /* Footer brand strip - very subtle */
    ctx.fillStyle = "rgba(0,245,255,0.2)";
    ctx.fillRect(88, c.height - 70, c.width - 176, 1);
    ctx.font = `600 28px ${fontMono}`;
    ctx.fillStyle = "rgba(0,245,255,0.6)";
    ctx.textAlign = "center";
    ctx.fillText(
      "ALGORITHMX  //  TECHNOLOGY EDUCATION",
      c.width / 2,
      c.height - 38,
    );

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 16;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = true;
    tex.needsUpdate = true;
    return tex;
  }, []);
}

/* Lazy texture cache for keyboard key labels. Cached by `label|haloColor`
 * so the same letter painted with different halo hues (per-column RGB)
 * produces a unique texture per hue. White core is shared - it carries
 * the readability; the halo carries the column's brand hue. */
const keyLabelCache = new Map<string, THREE.Texture | null>();
/* Convert hex (#rrggbb) to "r,g,b" so we can build shadowColor with
 *  alpha. Returns "159,245,255" for "#9ff5ff" etc. */
function hexToRgbStr(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `${r},${g},${b}`;
}
function getKeyLabelTexture(
  label: string,
  haloColor: string = "#9ff5ff",
): THREE.Texture | null {
  const cacheKey = `${label}|${haloColor}`;
  if (keyLabelCache.has(cacheKey)) return keyLabelCache.get(cacheKey) ?? null;
  if (typeof document === "undefined") {
    keyLabelCache.set(cacheKey, null);
    return null;
  }
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext("2d");
  if (!ctx) {
    keyLabelCache.set(cacheKey, null);
    return null;
  }
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  /* Tighter halo (blur 18 -> 10) so the letter doesn't bleed into its
   *  neighbours. Halo colour now per-column for the RGB system. */
  const rgb = hexToRgbStr(haloColor);
  ctx.shadowColor = `rgba(${rgb},0.95)`;
  ctx.shadowBlur = 10;
  ctx.fillStyle = haloColor;
  const fontSize = label.length === 1 ? 220 : Math.max(112, 220 - label.length * 16);
  ctx.font = `900 ${fontSize}px ui-sans-serif, system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, c.width / 2, c.height / 2 + 8);
  /* Bright white core - sharp letterform on top of the coloured halo */
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#ffffff";
  ctx.fillText(label, c.width / 2, c.height / 2 + 8);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.needsUpdate = true;
  keyLabelCache.set(cacheKey, tex);
  return tex;
}

/* Per-column RGB palette for the keyboard. Curated luxe palette - NOT
 * a raw HSL rainbow. Each column gets a fixed hue based on its
 * horizontal position in the row, so the keyboard reads as vertical
 * stripes of colour. */
const COLUMN_PALETTE = [
  "#00e5ff", // cyan
  "#7df0ff", // cyan-pale
  "#cba8ff", // violet
  "#ff3ad6", // magenta
  "#ff7a9f", // coral
  "#ffd07a", // amber
  "#5fffa3", // green
];
function hueForRowPos(t: number): string {
  /* t in [0, 1] from left to right of a row */
  const tt = Math.max(0, Math.min(0.9999, t));
  return COLUMN_PALETTE[Math.floor(tt * COLUMN_PALETTE.length)];
}

/* Binary-glyph particle textures. Instead of generic circles drifting
 * in space, each particle is a small luminous "0", "1", or code fragment
 * — reads as "data / neural energy" not abstract noise. Built once at
 * module-mount on canvas, then shared across all particle instances. */
const GLYPHS = ["0", "1", "{", "}", ">", "#", "/", "0x"] as const;

function makeGlyphTextures(): (THREE.Texture | null)[] {
  if (typeof document === "undefined") return GLYPHS.map(() => null);
  return GLYPHS.map((glyph) => {
    const c = document.createElement("canvas");
    c.width = 128;
    c.height = 128;
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.shadowColor = "rgba(0,245,255,0.9)";
    ctx.shadowBlur = 14;
    ctx.fillStyle = "#9ff5ff";
    ctx.font = "bold 92px ui-monospace, 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(glyph, c.width / 2, c.height / 2 + 4);
    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  });
}

/* Soft radial cyan glow texture - used for the volumetric light beam
 * that projects out from the screen when the lid is open. */
function makeScreenGlowTexture(): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  ctx.clearRect(0, 0, c.width, c.height);
  const g = ctx.createRadialGradient(
    c.width / 2,
    c.height / 2,
    20,
    c.width / 2,
    c.height / 2,
    c.width / 2.1,
  );
  g.addColorStop(0, "rgba(0,245,255,0.55)");
  g.addColorStop(0.4, "rgba(0,245,255,0.18)");
  g.addColorStop(0.75, "rgba(0,245,255,0.05)");
  g.addColorStop(1, "rgba(0,245,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, c.width, c.height);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

/* Procedural brushed-aluminum normal map. Horizontal scratch lines
 * encoded as tangent-space perturbations - gives the lid + base a
 * directional brushed-metal microsurface so reflections shimmer like
 * real anodized aluminum instead of a perfect mirror. */
function makeBrushedNormalTexture(): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  const size = 512;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  /* Base = +Z normal (128, 128, 255) */
  ctx.fillStyle = "rgb(128,128,255)";
  ctx.fillRect(0, 0, size, size);
  /* Random horizontal scratch lines perturb the R channel */
  for (let i = 0; i < 700; i++) {
    const y = Math.random() * size;
    const len = 60 + Math.random() * 240;
    const x = Math.random() * (size - len);
    const r = 128 + (Math.random() - 0.5) * 28;
    const g = 128 + (Math.random() - 0.5) * 8;
    ctx.fillStyle = `rgb(${Math.round(r)},${Math.round(g)},255)`;
    ctx.fillRect(x, y, len, 1);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 0.7);
  tex.colorSpace = THREE.NoColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/* Slow data-rain texture - vertical columns of monospace characters.
 * Animated via offset.y in useFrame. Edges fade to transparent via a
 * radial mask so the rain reads as a contained "pool of data" behind
 * the laptop instead of blanketing the whole background. */
function makeDataRainTexture(): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 1024;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  /* Transparent base so the texture only contributes where chars are
   *  drawn (additive blending). */
  ctx.clearRect(0, 0, c.width, c.height);

  const chars = "01{}[]<>#%&*+=/⌬◇◢◣△◬◯";
  const cols = 22;
  const colW = c.width / cols;
  const rowH = 32;
  ctx.font = "bold 22px ui-monospace, 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let col = 0; col < cols; col++) {
    const x = col * colW + colW / 2;
    const colSeed = Math.random();
    const headY = colSeed * c.height;
    const colRows = Math.floor(c.height / rowH);
    for (let r = 0; r < colRows; r++) {
      const y = (headY + r * rowH) % c.height;
      /* Radial falloff so chars at the texture edges are much dimmer.
       *  This is what stops the rain from "covering all" - the edges
       *  fade out, leaving only the centre visible. */
      const dx = (x - c.width / 2) / (c.width / 2);
      const dy = (y - c.height / 2) / (c.height / 2);
      const distSq = dx * dx + dy * dy;
      const edgeFade = Math.max(0, 1 - distSq);
      const brightness = Math.max(0.02, 1 - r * 0.045) * edgeFade;
      if (brightness < 0.05) continue;
      ctx.fillStyle = `rgba(159, 245, 255, ${brightness * 0.5})`;
      const ch = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(ch, x, y);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  /* Only repeat vertically (so the falloff stays visible horizontally) */
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

/* Hexagonal PCB-style grid texture - replaces the line-based floor
 * grid with something that reads as a real engineering / circuit board
 * pattern. Tiles seamlessly when repeated. */
function makeHexGridTexture(): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  ctx.clearRect(0, 0, c.width, c.height);
  const hexR = 32;
  const hexW = hexR * Math.sqrt(3);
  const hexH = hexR * 1.5;
  ctx.strokeStyle = "rgba(0, 245, 255, 0.6)";
  ctx.lineWidth = 1.4;
  for (let row = -1; row <= c.height / hexH + 2; row++) {
    for (let col = -1; col <= c.width / hexW + 2; col++) {
      const x = col * hexW + (row % 2 === 0 ? 0 : hexW / 2);
      const y = row * hexH;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i + Math.PI / 6;
        const hx = x + hexR * Math.cos(angle);
        const hy = y + hexR * Math.sin(angle);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }
  /* Sparse highlighted vertices for "via points" - tiny brighter dots */
  ctx.fillStyle = "rgba(0, 245, 255, 0.95)";
  for (let row = -1; row <= c.height / hexH + 2; row++) {
    for (let col = -1; col <= c.width / hexW + 2; col++) {
      if ((row + col) % 5 !== 0) continue; // sparse pattern
      const x = col * hexW + (row % 2 === 0 ? 0 : hexW / 2);
      const y = row * hexH;
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  tex.needsUpdate = true;
  return tex;
}

/* Atmospheric haze texture - faint cyan-violet radial gradient on
 * canvas. Sits far behind the laptop and gives the scene depth without
 * adding a literal fog mesh (which would interact badly with our
 * additive elements). */
function makeFogHazeTexture(): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  ctx.clearRect(0, 0, c.width, c.height);
  const g = ctx.createRadialGradient(
    c.width / 2,
    c.height / 2 - 80,
    20,
    c.width / 2,
    c.height / 2 - 80,
    c.width / 1.8,
  );
  g.addColorStop(0, "rgba(0,229,255,0.22)");
  g.addColorStop(0.4, "rgba(124,92,255,0.10)");
  g.addColorStop(0.8, "rgba(124,92,255,0.04)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, c.width, c.height);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

/* Soft contact-shadow texture - radial gradient with smooth falloff so
 * the shadow under the laptop doesn't have a hard ellipse edge. */
function makeSoftShadowTexture(): THREE.Texture | null {
  if (typeof window === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  ctx.clearRect(0, 0, c.width, c.height);
  const g = ctx.createRadialGradient(
    c.width / 2,
    c.height / 2,
    20,
    c.width / 2,
    c.height / 2,
    c.width / 2.1,
  );
  g.addColorStop(0, "rgba(0,0,0,0.85)");
  g.addColorStop(0.35, "rgba(0,0,0,0.5)");
  g.addColorStop(0.75, "rgba(0,0,0,0.15)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, c.width, c.height);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

export default function LaptopScene({ progress, reducedMotion = false }: LaptopSceneProps) {
  return (
    <Canvas
      dpr={[1.5, 2.5]}
      camera={{ position: [4.6, 3.0, 6.5], fov: 38 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
      }}
      style={{
        width: "100%",
        height: "100%",
        background: "transparent",
      }}
      onCreated={({ camera }) => {
        camera.lookAt(RIG_X, 0, 0);
      }}
    >
      <color attach="background" args={[COLORS.ink]} />

      {/* HDRI environment lighting - studio preset wrapped in Suspense
       *  so a slow CDN fetch doesn't block the rest of the render. */}
      <Suspense fallback={null}>
        <Environment preset="studio" environmentIntensity={0.4} />
      </Suspense>

      <ambientLight intensity={0.85} color="#dde6ff" />
      <directionalLight position={[4, 6, 5]} intensity={1.8} color="#ffffff" />
      <pointLight position={[-3, 2.5, 4]} intensity={0.75} color={COLORS.cyan} />
      {/* Rim light from behind to highlight the lid's top edge */}
      <pointLight position={[2, 4, -3]} intensity={0.55} color="#ffffff" />

      <Laptop progress={progress} reducedMotion={reducedMotion} />

      {/* Cinematic post-processing - Vignette + Noise only. Bloom is
       *  excluded because it consistently kills the render in this
       *  combination of versions (@react-three/postprocessing 3.0.4 +
       *  postprocessing 6.39 + Next 16 Turbopack); the visible quality
       *  win from HDR + clearcoat materials covers most of what bloom
       *  would have added. */}
      <EffectComposer multisampling={0} enableNormalPass={false}>
        <Vignette
          eskil={false}
          offset={0.22}
          darkness={0.85}
          blendFunction={BlendFunction.NORMAL}
        />
        <Noise opacity={0.035} blendFunction={BlendFunction.OVERLAY} />
      </EffectComposer>
    </Canvas>
  );
}

function Laptop({
  progress,
  reducedMotion: _rm,
}: {
  progress: MotionValue<number>;
  reducedMotion: boolean;
}) {
  const lidBrandTex = useLidBrandTexture();
  const screenTex = useScreenTexture();
  const softShadowTex = useMemo(() => makeSoftShadowTexture(), []);
  const screenBeamTex = useMemo(() => makeScreenGlowTexture(), []);
  const screenBeamRef = useRef<THREE.Mesh>(null);
  const fogHazeTex = useMemo(() => makeFogHazeTexture(), []);
  const dataRainTex = useMemo(() => makeDataRainTexture(), []);
  const hexFloorTex = useMemo(() => makeHexGridTexture(), []);
  const hexFloorMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const brushedNormalTex = useMemo(() => makeBrushedNormalTexture(), []);
  const parallaxRef = useRef<THREE.Group>(null);
  const lidRef = useRef<THREE.Group>(null);
  const ledMat = useRef<THREE.MeshStandardMaterial>(null);
  const screenContentMat = useRef<THREE.MeshBasicMaterial>(null);
  const screenGlowMat = useRef<THREE.MeshBasicMaterial>(null);
  const gridMat = useRef<THREE.LineBasicMaterial>(null);
  const particleGroup = useRef<THREE.Group>(null);

  /* Lid hinge spring state - gives the lid mechanical inertia so it
   * overshoots slightly when scroll moves fast then settles, like a
   * real heavy aluminum lid. */
  const lidAngle = useRef(LID_CLOSED_ANGLE);
  const lidVelocity = useRef(0);

  /* Glyph textures (one per character). Particles each pick a random
   * index so the swarm reads as floating data fragments. */
  const glyphTextures = useMemo(() => makeGlyphTextures(), []);

  /* Particle data - 40 drifting glyph-fragments instead of generic dots */
  const particles = useMemo(() => {
    return Array.from({ length: 40 }, () => ({
      x: (Math.random() - 0.5) * 8,
      y: 0.4 + Math.random() * 2.5,
      z: (Math.random() - 0.5) * 5,
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.6,
      size: 0.09 + Math.random() * 0.07,
      glyphIdx: Math.floor(Math.random() * GLYPHS.length),
    }));
  }, []);

  /* SIX SUBJECT MOTES - one per stream, each in its accent colour.
   * Now small ambient particles orbiting far from the laptop (no halos,
   * no large cores) so they read as "data motes in their subject hue"
   * not "six colored balls competing with the laptop". */
  const subjectOrbs = useMemo(
    () => [
      { color: "#5fffa3", trigger: 0.5, radius: 3.6, y: 0.8, speed: 0.10, phase: 0 },
      { color: "#9ff5ff", trigger: 0.55, radius: 3.9, y: 1.4, speed: 0.12, phase: Math.PI / 3 },
      { color: "#cba8ff", trigger: 0.6, radius: 3.7, y: 1.8, speed: 0.09, phase: (Math.PI * 2) / 3 },
      { color: "#ffd07a", trigger: 0.65, radius: 4.0, y: 1.1, speed: 0.11, phase: Math.PI },
      { color: "#ffc94a", trigger: 0.7, radius: 3.65, y: 1.6, speed: 0.08, phase: (Math.PI * 4) / 3 },
      { color: "#ff3ad6", trigger: 0.75, radius: 3.85, y: 0.6, speed: 0.13, phase: (Math.PI * 5) / 3 },
    ],
    [],
  );
  const orbRefs = useRef<(THREE.Mesh | null)[]>([null, null, null, null, null, null]);

  /* Rolling-wave edge strip - 10 segments with phased opacity so a
   * bright pulse appears to travel along the front of the lid. */
  const EDGE_SEGMENTS = 10;
  const edgeStripRefs = useRef<(THREE.MeshBasicMaterial | null)[]>(
    Array(EDGE_SEGMENTS).fill(null),
  );

  /* Holographic floor grid geometry */
  const gridGeom = useMemo(() => {
    const size = 8;
    const divisions = 14;
    const step = size / divisions;
    const positions: number[] = [];
    for (let i = 0; i <= divisions; i++) {
      const t = -size / 2 + i * step;
      positions.push(-size / 2, 0, t);
      positions.push(size / 2, 0, t);
      positions.push(t, 0, -size / 2);
      positions.push(t, 0, size / 2);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(positions), 3),
    );
    return g;
  }, []);

  const { pointer } = useThree();

  useFrame((state, delta) => {
    const p = progress.get();
    const t = state.clock.elapsedTime;

    /* Camera path - scroll-driven dolly + LOW-AMPLITUDE IDLE MICRO-
     * MOTION on top so the shot feels like a handheld product shoot
     * instead of a perfectly locked-off render. Three offset sin waves
     * at different frequencies create the natural "breath" of a real
     * operator's hands. */
    const camP = smoothstep(0, 1, p);
    const microX = Math.sin(t * 0.51) * 0.025 + Math.sin(t * 1.27) * 0.012;
    const microY = Math.cos(t * 0.43) * 0.020 + Math.sin(t * 0.81) * 0.010;
    const microZ = Math.sin(t * 0.37) * 0.022;
    state.camera.position.set(
      lerp(4.6, 4.0, camP) + microX,
      lerp(1.6, 2.4, camP) + microY,
      lerp(5.8, 5.6, camP) + microZ,
    );
    state.camera.lookAt(
      RIG_X + microX * 0.3,
      lerp(0.1, 0.9, camP) + microY * 0.3,
      0,
    );

    /* Mouse parallax - whole rig tilts subtly toward cursor */
    if (parallaxRef.current) {
      parallaxRef.current.rotation.y = THREE.MathUtils.lerp(
        parallaxRef.current.rotation.y,
        pointer.x * 0.12,
        0.05,
      );
      parallaxRef.current.rotation.x = THREE.MathUtils.lerp(
        parallaxRef.current.rotation.x,
        -pointer.y * 0.08,
        0.05,
      );
    }

    /* Lid hinge with SMOOTH DAMPING - exponential follow with no
     * overshoot. Real laptop hinges have friction not springs, so the
     * lid trails the scroll-target by a beat (heavy / mechanical feel)
     * but never bounces past it. */
    const openT = smoothstep(0.2, 0.6, p);
    const targetAngle = lerp(LID_CLOSED_ANGLE, LID_OPEN_ANGLE, openT);
    const dt = Math.min(0.05, delta);
    /* lerpFactor = 1 - exp(-k * dt) gives a frame-rate-independent
     *  smooth approach. k=10 settles in ~0.3s; k=14 settles in ~0.2s.
     *  Tuned so the lid feels weighty but never overshoots. */
    const followSpeed = 1 - Math.exp(-12 * dt);
    lidAngle.current = lerp(lidAngle.current, targetAngle, followSpeed);
    /* Kept here only because the old spring used it - drain velocity
     *  toward zero so any leftover state from the previous build
     *  doesn't introduce phantom bounces. */
    lidVelocity.current = 0;
    if (lidRef.current) {
      lidRef.current.rotation.x = lidAngle.current;
    }

    /* Screen ignite - content fades up + glow breathes as lid opens.
     * Glow plane is now much subtler (was 0.4 peak, blew out the lid);
     * the screen content alone reads as the emissive light source. */
    const screenT = smoothstep(0.35, 0.65, p);
    if (screenContentMat.current) {
      screenContentMat.current.transparent = true;
      screenContentMat.current.opacity = screenT;
    }
    if (screenGlowMat.current) {
      const breathe = 0.9 + Math.sin(t * 1.4) * 0.1;
      screenGlowMat.current.opacity = screenT * 0.08 * breathe;
    }

    /* LED breathing */
    if (ledMat.current) {
      ledMat.current.emissiveIntensity = 1.5 + Math.sin(t * 2.1) * 0.5;
    }

    /* Holographic grid + hex-PCB floor draws in over the first half of
     * scroll. The legacy line grid (gridMat) stays as a faint accent
     * underneath; the hex texture is the main visible floor pattern. */
    if (gridMat.current) {
      const draw = smoothstep(0.0, 0.5, p);
      const pulse = 0.85 + Math.sin(t * 0.8) * 0.1;
      gridMat.current.opacity = draw * 0.12 * pulse;
    }
    if (hexFloorMatRef.current) {
      const draw = smoothstep(0.0, 0.5, p);
      const pulse = 0.9 + Math.sin(t * 0.9) * 0.08;
      /* Brighter floor (0.45 -> 0.7) so the laptop reads as physically
       * sitting on a surface, not floating in violet space. */
      hexFloorMatRef.current.opacity = draw * 0.7 * pulse;
    }

    /* DATA RAIN scrolls downward via texture offset.y. Slow speed so
     * it reads as ambient drift not a busy strobe. */
    if (dataRainTex) {
      dataRainTex.offset.y = (dataRainTex.offset.y + 0.025 * delta) % 1;
    }

    /* VOLUMETRIC SCREEN BEAM - soft cyan halo plane BEHIND the laptop.
     * Was a 5x5 in-front-of-camera beam that flooded the chassis. Now
     * a tight back-light cast that reads as "the screen is bleeding a
     * faint glow into the air behind the lid" - subtle, restrained. */
    if (screenBeamRef.current) {
      screenBeamRef.current.lookAt(state.camera.position);
      const mat = screenBeamRef.current.material as THREE.MeshBasicMaterial;
      const breathe = 0.9 + Math.sin(t * 1.3) * 0.1;
      mat.opacity = smoothstep(0.35, 0.6, p) * 0.16 * breathe;
      const s = 1 + smoothstep(0.35, 1, p) * 0.15;
      screenBeamRef.current.scale.set(s, s, 1);
    }

    /* Glyph particles drift + billboard toward camera */
    if (particleGroup.current) {
      particleGroup.current.children.forEach((child, i) => {
        const par = particles[i];
        if (!par) return;
        const drift = Math.sin(t * par.speed + par.phase) * 0.18;
        child.position.set(
          par.x + drift,
          par.y + Math.cos(t * par.speed * 0.7) * 0.1,
          par.z + Math.sin(t * par.speed * 0.5) * 0.15,
        );
        /* Always face the camera so glyphs are readable */
        child.lookAt(state.camera.position);
      });
    }

    /* ROLLING LIGHT WAVE on the edge strip - phased opacity per
     * segment. Slowed down to ~5s cycle so it reads as ambient breath,
     * not a strobe. */
    for (let i = 0; i < EDGE_SEGMENTS; i++) {
      const mat = edgeStripRefs.current[i];
      if (!mat) continue;
      const phase = (i / EDGE_SEGMENTS) * Math.PI * 2;
      const wave = Math.max(0, Math.sin(t * 1.1 - phase * 1.4));
      mat.opacity = 0.32 + wave * 0.55;
    }

    /* SUBJECT MOTES - small drifting motes on far orbits. Light up
     * subtly as scroll passes each subject's reveal trigger. No halos
     * anymore, no large scaling - they stay ambient. */
    for (let i = 0; i < subjectOrbs.length; i++) {
      const orb = subjectOrbs[i];
      const ref = orbRefs.current[i];
      const angle = orb.phase + t * orb.speed;
      const x = RIG_X + Math.cos(angle) * orb.radius;
      const z = Math.sin(angle) * orb.radius;
      const y = orb.y + Math.sin(t * 0.6 + i) * 0.08;
      const lit = smoothstep(orb.trigger, orb.trigger + 0.04, p);
      const breathe = 0.85 + Math.sin(t * 2.2 + i) * 0.15;
      if (ref) {
        ref.position.set(x, y, z);
        const mat = ref.material as THREE.MeshBasicMaterial;
        /* Lower-key opacity: 0.18 idle, 0.45 lit. No more scaling pop. */
        mat.opacity = 0.18 + lit * 0.27 * breathe;
      }
    }
  });

  return (
    <group ref={parallaxRef}>
      {/* ATMOSPHERIC FOG HAZE - large radial-gradient plane far behind
       *  the laptop. Adds Blade-Runner depth without literal volumetric
       *  fog (which would conflict with additive elements). */}
      {fogHazeTex && (
        <mesh position={[RIG_X, 1.0, -4.0]}>
          <planeGeometry args={[16, 12]} />
          <meshBasicMaterial
            map={fogHazeTex}
            transparent
            opacity={0.7}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}

      {/* SLOW DATA RAIN - vertical cascading code far behind the
       *  laptop. Sized + faded so it reads as a CONTAINED data pool
       *  behind the laptop, not a blanket covering the whole sky. */}
      {dataRainTex && (
        <mesh position={[RIG_X, 1.4, -7.5]}>
          <planeGeometry args={[7, 5]} />
          <meshBasicMaterial
            map={dataRainTex}
            transparent
            opacity={0.55}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}

      {/* Soft contact shadow under the laptop. Radial-gradient texture
       *  so the shadow has natural falloff instead of a hard ellipse
       *  edge. Stretched along Z so it matches the laptop's footprint. */}
      {softShadowTex && (
        <mesh
          position={[RIG_X, -BASE_H / 2 - 0.018, 0.3]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[5.6, 3.6]} />
          <meshBasicMaterial
            map={softShadowTex}
            transparent
            opacity={0.85}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* HEX-PCB FLOOR - hexagonal circuit-board pattern as the main
       *  visible floor texture. Reads as real engineering grid, not
       *  generic graph paper. Tiled 4x4 via texture repeat. */}
      {hexFloorTex && (
        <mesh
          position={[RIG_X, -BASE_H / 2 - 0.028, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[8, 8]} />
          <meshBasicMaterial
            ref={hexFloorMatRef}
            map={hexFloorTex}
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}

      {/* Holographic line grid - kept as a faint underlay so the floor
       *  has both hex pattern + subtle line accents. Opacity is now
       *  much lower than before. */}
      <lineSegments
        geometry={gridGeom}
        position={[RIG_X, -BASE_H / 2 - 0.03, 0]}
      >
        <lineBasicMaterial
          ref={gridMat}
          color={COLORS.cyan}
          transparent
          opacity={0}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {/* DRIFTING GLYPH PARTICLES - small luminous "0/1/{}/>" fragments
       *  reading as "data / neural energy" rather than abstract dots. */}
      <group ref={particleGroup}>
        {particles.map((par, i) => {
          const tex = glyphTextures[par.glyphIdx];
          if (!tex) return null;
          return (
            <mesh key={i} position={[par.x, par.y, par.z]}>
              <planeGeometry args={[par.size, par.size]} />
              <meshBasicMaterial
                map={tex}
                transparent
                opacity={0.85}
                blending={THREE.AdditiveBlending}
                toneMapped={false}
                depthWrite={false}
              />
            </mesh>
          );
        })}
      </group>

      {/* SCREEN BACK-LIGHT - small cyan halo plane placed BEHIND the
       *  laptop (z=-1.4) so it reads as "the screen is bleeding light
       *  onto the air behind the lid" rather than as a glow cloud
       *  floating in front of the chassis. Down from a 5x5 in-front
       *  beam to a 2.4x2.4 backlight at low opacity. */}
      {screenBeamTex && (
        <mesh ref={screenBeamRef} position={[RIG_X, 1.3, -1.4]}>
          <planeGeometry args={[2.4, 2.4]} />
          <meshBasicMaterial
            map={screenBeamTex}
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}

      {/* SUBJECT MOTES - one per AlgorithmX stream as small ambient
       *  motes on far orbits. No halos, no scaling - they just drift
       *  in their subject colours. */}
      {subjectOrbs.map((orb, i) => (
        <mesh
          key={`orb-${i}`}
          ref={(el) => {
            orbRefs.current[i] = el;
          }}
        >
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshBasicMaterial
            color={orb.color}
            transparent
            opacity={0.2}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* LAPTOP - cinematic asymmetry: ~6° yaw (-Y) turns the screen
       *  off the camera's normal axis so the emissive plane no longer
       *  blasts directly into the lens; ~3° tilt (-X) lifts the back so
       *  the screen faces slightly skyward, away from the high camera.
       *  Reflections now glide across the chassis edges instead of
       *  presenting as a flat front face. */}
      <group position={[RIG_X, 0, 0]} rotation={[-0.05, -0.11, 0]}>
        <RoundedBox args={[BASE_W, BASE_H, BASE_D]} radius={0.03} smoothness={4}>
          <meshPhysicalMaterial
            color={COLORS.steel}
            metalness={0.82}
            roughness={0.38}
            clearcoat={0.6}
            clearcoatRoughness={0.32}
            anisotropy={0.7}
            normalMap={brushedNormalTex}
            normalScale={new THREE.Vector2(0.18, 0.18)}
            envMapIntensity={1.2}
          />
        </RoundedBox>

        {/* Keyboard well - recessed dark panel */}
        <mesh
          position={[0, BASE_H / 2 + 0.001, -0.15]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[BASE_W * 0.86, BASE_D * 0.55]} />
          <meshStandardMaterial color={COLORS.keyboard} roughness={0.7} />
        </mesh>

        {/* Speaker grilles removed - they read as black blobs flanking
         *  the keyboard at this camera angle, not as ultrabook speakers. */}

        {/* BACKLIT KEYBOARD AMBIENT GLOW - very faint cyan blanket so
         *  the keyboard well shows a subtle backlight under the keys.
         *  Reduced again (0.08 -> 0.035) now that the per-column hues
         *  carry the brand colour. The blanket is just ambient "panel
         *  is alive" glow, not the main light source. */}
        <mesh
          position={[0, BASE_H / 2 + 0.002, -0.15]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[BASE_W * 0.82, BASE_D * 0.5]} />
          <meshBasicMaterial
            color={COLORS.cyan}
            transparent
            opacity={0.035}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>

        {/* REALISTIC KEYBOARD LAYOUT - 6 rows with varied key widths.
         *  Function row + number row + QWERTY + ASDF + ZXCV (with up
         *  arrow) + modifier row with wide spacebar. Subtle cyan
         *  underglow on most keys; accent colours only on WASD, arrows,
         *  space, enter so it reads as "modern ultrabook RGB" not
         *  "christmas tree gaming rig". */}
        {(() => {
          /* Row layout: each row is { z, keyDepth, keys: [{width, accent?}, ...] }.
           * Key widths are in laptop units. Total row width is the sum of
           * all key widths + a small gap between each. Rendering centres
           * each row horizontally. */
          type AccentKey = "wasd" | "space" | "enter" | "arrow" | "fn";
          interface Key {
            w: number; // width
            accent?: AccentKey;
            label?: string; // glowing letter painted on top
          }
          interface Row {
            z: number;
            depth: number;
            keys: Key[];
          }
          const U = 0.21; // unit width
          const FN_LABELS = ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12"];
          const NUM_LABELS = ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="];
          const QWERTY_LABELS = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"];
          const ASDF_LABELS = ["A", "S", "D", "F", "G", "H", "J", "K", "L"];
          const ZXCV_LABELS = ["Z", "X", "C", "V", "B", "N", "M", ",", ".", "/"];
          const ROWS: Row[] = [
            /* Function row - smaller height */
            {
              z: -0.65,
              depth: 0.08,
              keys: [
                { w: U * 0.85, accent: "fn", label: "esc" },
                ...FN_LABELS.map((label): Key => ({ w: U * 0.85, label })),
                { w: U * 0.85, accent: "fn", label: "del" },
              ],
            },
            /* Number row */
            {
              z: -0.50,
              depth: 0.13,
              keys: [
                ...NUM_LABELS.map((label): Key => ({ w: U, label })),
                { w: U * 1.4, label: "⌫" }, // Backspace
              ],
            },
            /* QWERTY row */
            {
              z: -0.34,
              depth: 0.13,
              keys: [
                { w: U * 1.4, label: "tab" },
                ...QWERTY_LABELS.map((label, i): Key => ({
                  w: U,
                  label,
                  accent: i === 1 ? "wasd" : undefined, // W
                })),
                { w: U, label: "[" },
                { w: U, label: "]" },
                { w: U * 1.0, label: "\\" },
              ],
            },
            /* ASDF row */
            {
              z: -0.18,
              depth: 0.13,
              keys: [
                { w: U * 1.6, label: "caps" },
                ...ASDF_LABELS.map((label, i): Key => ({
                  w: U,
                  label,
                  accent: i < 3 ? "wasd" : undefined, // A, S, D
                })),
                { w: U, label: ";" },
                { w: U, label: "'" },
                { w: U * 1.6, accent: "enter", label: "enter" },
              ],
            },
            /* ZXCV row */
            {
              z: -0.02,
              depth: 0.13,
              keys: [
                { w: U * 2.0, label: "shift" },
                ...ZXCV_LABELS.map((label): Key => ({ w: U, label })),
                { w: U * 1.5, label: "shift" },
                { w: U, accent: "arrow", label: "↑" },
              ],
            },
            /* Modifier row - wide spacebar + arrows */
            {
              z: 0.14,
              depth: 0.13,
              keys: [
                { w: U * 1.0, label: "ctrl" },
                { w: U * 0.85, accent: "fn", label: "fn" },
                { w: U * 0.85, label: "opt" },
                { w: U * 1.1, label: "⌘" },
                { w: U * 6.5, accent: "space" }, // SPACEBAR - no label
                { w: U * 1.1, label: "⌘" },
                { w: U, label: "←" },
                { w: U, accent: "arrow", label: "↓" },
                { w: U, label: "→" },
              ],
            },
          ];

          const KEY_GAP = 0.014;
          const COLOR_WASD = "#ff3ad6";
          const COLOR_ENTER = "#5fffa3";
          const COLOR_SPACE = "#9ff5ff";
          const COLOR_ARROW = "#ffc94a";
          const COLOR_FN = "#cba8ff";

          return ROWS.flatMap((row, rIdx) => {
            const totalW =
              row.keys.reduce((s, k) => s + k.w, 0) +
              KEY_GAP * (row.keys.length - 1);
            let cursorX = -totalW / 2;
            return row.keys.map((key, kIdx) => {
              const x = cursorX + key.w / 2;
              cursorX += key.w + KEY_GAP;
              /* Per-column hue from horizontal position in the row.
               * Accent keys (WASD / Space / Enter / Arrows / Fn) still
               * override with their explicit brand colour. */
              const colHue = hueForRowPos((x + totalW / 2) / totalW);
              const accentColor =
                key.accent === "wasd"
                  ? COLOR_WASD
                  : key.accent === "enter"
                    ? COLOR_ENTER
                    : key.accent === "space"
                      ? COLOR_SPACE
                      : key.accent === "arrow"
                        ? COLOR_ARROW
                        : key.accent === "fn"
                          ? COLOR_FN
                          : colHue;
              /* Lower underglow opacity (was 0.18/0.4) so the colours
               * read as discreet RGB segments not "carnival lights".
               * Accent keys still a touch brighter than column hues. */
              const glowOp = key.accent ? 0.26 : 0.11;
              const capColor =
                key.accent === "wasd" ? "#15101a" : "#0a0c13";
              const labelTex = key.label
                ? getKeyLabelTexture(key.label, accentColor)
                : null;
              /* Label plane size - scales with key width. Capped so wide
               * keys (Tab / Caps / Shift / Enter) don't get oversized
               * text, but bigger than before so letters read clearly. */
              const labelW = Math.min(key.w * 0.88, 0.22);
              const labelH = Math.min(row.depth * 0.88, 0.11);
              return (
                <group
                  key={`r${rIdx}-k${kIdx}`}
                  position={[x, BASE_H / 2 + 0.004, row.z]}
                >
                  {/* Machined keycap - taller bevel (0.005 -> 0.014) so
                   * the side faces catch HDR reflections and the keys
                   * read as physical objects, not stickers. Clearcoat
                   * adds the micro-spec response of anodised key tops. */}
                  <mesh>
                    <boxGeometry args={[key.w * 0.94, 0.014, row.depth * 0.94]} />
                    <meshPhysicalMaterial
                      color={capColor}
                      roughness={0.32}
                      metalness={0.62}
                      clearcoat={0.45}
                      clearcoatRoughness={0.28}
                      envMapIntensity={1.0}
                    />
                  </mesh>
                  {/* Tighter underglow - column-hue rim of light spilling
                   *  from beneath the keycap. Smaller plane (1.02 -> 1.0)
                   *  so the spill stays inside the key footprint instead
                   *  of bleeding to neighbours. */}
                  <mesh position={[0, -0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[key.w * 1.0, row.depth * 1.0]} />
                    <meshBasicMaterial
                      color={accentColor}
                      transparent
                      opacity={glowOp}
                      blending={THREE.AdditiveBlending}
                      depthWrite={false}
                      toneMapped={false}
                    />
                  </mesh>
                  {/* GLOWING KEY LABEL - white-core letterform sitting on
                   *  a TIGHT column-hue halo. Haze pass dropped from 0.5
                   *  to 0.22 so the letterform stays razor-sharp instead
                   *  of bleeding into the neighbouring keys. */}
                  {labelTex && (
                    <>
                      {/* Tight column-hue haze behind the letter */}
                      <mesh
                        position={[0, 0.008, 0]}
                        rotation={[-Math.PI / 2, 0, 0]}
                      >
                        <planeGeometry args={[labelW * 1.08, labelH * 1.08]} />
                        <meshBasicMaterial
                          map={labelTex}
                          transparent
                          opacity={0.22}
                          blending={THREE.AdditiveBlending}
                          depthWrite={false}
                          toneMapped={false}
                        />
                      </mesh>
                      {/* Crisp letter on the keycap top surface */}
                      <mesh
                        position={[0, 0.0086, 0]}
                        rotation={[-Math.PI / 2, 0, 0]}
                      >
                        <planeGeometry args={[labelW, labelH]} />
                        <meshBasicMaterial
                          map={labelTex}
                          transparent
                          opacity={1}
                          depthWrite={false}
                          toneMapped={false}
                        />
                      </mesh>
                    </>
                  )}
                </group>
              );
            });
          });
        })()}

        {/* TRACKPAD positioned below the keyboard */}

        {/* Trackpad */}
        <mesh
          position={[0, BASE_H / 2 + 0.001, 0.78]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[1.1, 0.7]} />
          <meshStandardMaterial color={COLORS.trackpad} roughness={0.35} />
        </mesh>

        {/* Power LED */}
        <mesh
          position={[BASE_W / 2 + 0.001, 0, -BASE_D / 2 + 0.35]}
          rotation={[0, -Math.PI / 2, 0]}
        >
          <circleGeometry args={[0.025, 16]} />
          <meshStandardMaterial
            ref={ledMat}
            color={COLORS.cyan}
            emissive={COLORS.cyan}
            emissiveIntensity={1.6}
            toneMapped={false}
          />
        </mesh>

        {/* AIR VENTS along the back edge of the base - parallel dark
         *  slots that signal "this thing has cooling". Visible from the
         *  3/4 camera angle when the laptop is closed. */}
        {Array.from({ length: 16 }).map((_, i) => (
          <mesh
            key={`vent-${i}`}
            position={[
              (i - 7.5) * 0.18,
              BASE_H / 2 - 0.018,
              -BASE_D / 2 + 0.015,
            ]}
          >
            <boxGeometry args={[0.14, 0.04, 0.012]} />
            <meshStandardMaterial
              color="#06080e"
              metalness={0.2}
              roughness={0.85}
            />
          </mesh>
        ))}

        {/* HINGES - two short cylinders at the back-top of the base
         *  where the lid pivots. Visible from the camera angle. */}
        <mesh
          position={[-BASE_W / 2 + 0.55, BASE_H / 2, -BASE_D / 2 + 0.06]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.035, 0.035, 0.32, 24]} />
          <meshStandardMaterial
            color={COLORS.steelEdge}
            metalness={0.85}
            roughness={0.32}
          />
        </mesh>
        <mesh
          position={[BASE_W / 2 - 0.55, BASE_H / 2, -BASE_D / 2 + 0.06]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.035, 0.035, 0.32, 24]} />
          <meshStandardMaterial
            color={COLORS.steelEdge}
            metalness={0.85}
            roughness={0.32}
          />
        </mesh>

        {/* HINGE GAP LINE - thin dark seam where lid base meets the
         *  substrate. Visible when the lid is open. Subtle but real-
         *  laptop detail credibility. */}
        <mesh
          position={[0, BASE_H / 2 + 0.0008, -BASE_D / 2 + 0.04]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[BASE_W * 0.85, 0.012]} />
          <meshStandardMaterial color="#02030a" roughness={0.95} />
        </mesh>

        {/* Rubber feet underneath - 4 small dark discs */}
        {[
          [-BASE_W / 2 + 0.25, BASE_D / 2 - 0.25],
          [BASE_W / 2 - 0.25, BASE_D / 2 - 0.25],
          [-BASE_W / 2 + 0.25, -BASE_D / 2 + 0.25],
          [BASE_W / 2 - 0.25, -BASE_D / 2 + 0.25],
        ].map(([x, z], i) => (
          <mesh
            key={`foot-${i}`}
            position={[x, -BASE_H / 2 - 0.008, z]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.05, 0.05, 0.014, 18]} />
            <meshStandardMaterial color="#020308" roughness={0.95} />
          </mesh>
        ))}

        {/* HINGE GROUP — rotation pivot at back-top edge of base. Rotation
         *  set per-frame in useFrame above, tied to scroll progress. */}
        <group
          ref={lidRef}
          position={[0, BASE_H / 2, -BASE_D / 2 + 0.04]}
        >
          <group position={[0, LID_H / 2, LID_D / 2 - 0.04]}>
            <RoundedBox args={[LID_W, LID_H, LID_D]} radius={0.025} smoothness={4}>
              <meshPhysicalMaterial
                color={COLORS.steel}
                metalness={0.85}
                roughness={0.32}
                clearcoat={0.7}
                clearcoatRoughness={0.26}
                anisotropy={0.8}
                normalMap={brushedNormalTex}
                normalScale={new THREE.Vector2(0.16, 0.16)}
                envMapIntensity={1.3}
              />
            </RoundedBox>

            {/* ROLLING-WAVE EDGE STRIP - 10 segments with phased opacity
             *  so a bright pulse appears to travel along the front of
             *  the lid like a real gaming-laptop light bar. */}
            {Array.from({ length: EDGE_SEGMENTS }).map((_, i) => {
              const totalSpan = LID_W * 0.82;
              const segW = totalSpan / EDGE_SEGMENTS;
              const x = -totalSpan / 2 + segW / 2 + i * segW;
              return (
                <mesh
                  key={`edge-${i}`}
                  position={[x, -LID_H / 2 - 0.002, LID_D / 2 - 0.005]}
                >
                  <boxGeometry args={[segW * 0.92, 0.012, 0.006]} />
                  <meshBasicMaterial
                    ref={(el) => {
                      edgeStripRefs.current[i] = el;
                    }}
                    color={COLORS.cyan}
                    transparent
                    opacity={0.4}
                    blending={THREE.AdditiveBlending}
                    toneMapped={false}
                    depthWrite={false}
                  />
                </mesh>
              );
            })}

            {/* Cyan trim down each side of the lid */}
            <mesh
              position={[-LID_W / 2 + 0.003, 0, 0]}
              rotation={[0, 0, 0]}
            >
              <boxGeometry args={[0.006, 0.012, LID_D * 0.88]} />
              <meshBasicMaterial
                color={COLORS.cyan}
                transparent
                opacity={0.55}
                blending={THREE.AdditiveBlending}
                toneMapped={false}
                depthWrite={false}
              />
            </mesh>
            <mesh
              position={[LID_W / 2 - 0.003, 0, 0]}
              rotation={[0, 0, 0]}
            >
              <boxGeometry args={[0.006, 0.012, LID_D * 0.88]} />
              <meshBasicMaterial
                color={COLORS.cyan}
                transparent
                opacity={0.55}
                blending={THREE.AdditiveBlending}
                toneMapped={false}
                depthWrite={false}
              />
            </mesh>

            {/* GLOWING BRAND LOGO on the outer lid face. Sized to ~55%
             *  of the lid width so the badge has breathing room around
             *  it - no more halo lake. Additive blending keeps it
             *  glowing on the dark aluminum. */}
            {lidBrandTex && (
              <mesh
                position={[0, LID_H / 2 + 0.001, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <planeGeometry args={[LID_W * 0.55, LID_D * 0.35]} />
                <meshBasicMaterial
                  map={lidBrandTex}
                  transparent
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                  toneMapped={false}
                />
              </mesh>
            )}

            {/* SCREEN BEZEL - dark border around the display. Slightly
             *  bigger than the actual screen, sits underneath everything
             *  so the display reads as inset within a real bezel. */}
            <mesh
              position={[0, -LID_H / 2 - 0.0005, 0]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[LID_W * 0.96, LID_D * 0.94]} />
              <meshStandardMaterial color="#0a0c14" roughness={0.6} metalness={0.4} />
            </mesh>

            {/* ACTUAL SCREEN BASE - smaller than the bezel so a clean
             *  ~3.5% bezel border shows around the active display. */}
            <mesh
              position={[0, -LID_H / 2 - 0.001, 0]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[LID_W * 0.86, LID_D * 0.82]} />
              <meshBasicMaterial color="#02030a" toneMapped={false} />
            </mesh>

            {/* Screen CONTENT - fades up as the lid opens. */}
            {screenTex && (
              <mesh
                position={[0, -LID_H / 2 - 0.0015, 0]}
                rotation={[Math.PI / 2, 0, 0]}
              >
                <planeGeometry args={[LID_W * 0.86, LID_D * 0.82]} />
                <meshBasicMaterial
                  ref={screenContentMat}
                  map={screenTex}
                  transparent
                  opacity={0}
                  toneMapped={false}
                />
              </mesh>
            )}

            {/* Cyan ambient glow above the screen content */}
            <mesh
              position={[0, -LID_H / 2 - 0.002, 0]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[LID_W * 0.84, LID_D * 0.80]} />
              <meshBasicMaterial
                ref={screenGlowMat}
                color={COLORS.cyan}
                transparent
                opacity={0}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>

            {/* CAMERA DOT - tiny black dot centered on the top bezel of
             *  the screen. Signals "this is a real laptop with a webcam". */}
            <mesh
              position={[0, -LID_H / 2 - 0.0008, LID_D * 0.43]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <circleGeometry args={[0.018, 18]} />
              <meshStandardMaterial color="#04050d" roughness={0.5} />
            </mesh>
            {/* Tiny green webcam status pinhole next to it */}
            <mesh
              position={[0.05, -LID_H / 2 - 0.0008, LID_D * 0.43]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <circleGeometry args={[0.005, 12]} />
              <meshStandardMaterial color="#0c1018" roughness={0.5} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

/* ----------------------------- MATH ----------------------------- */
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function clamp01(v: number) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}
function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}
