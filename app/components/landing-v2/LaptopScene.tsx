"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoundedBox, Environment, Lightformer } from "@react-three/drei";
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
  /* Lighter brushed-aluminum body. Was #4a505f, which paired with the
   * high metalness (0.82) and roughness (0.38) read as dark grey while
   * the studio HDR was still loading from the drei CDN. With this
   * brighter base the diffuse contribution alone keeps the chassis
   * silver, so the laptop never has the "dark grey -> suddenly silver"
   * pop on first paint. */
  steel: "#7d8294",
  steelEdge: "#9095a5",
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

/* Soft wide bloom that sits behind the brand wordmark on the lid.
 * Separate from the brand texture so it can breathe on its own slow
 * wave and have a much wider radius without smearing the letterforms.
 * Reads as ambient light spill around the logo, not a second logo. */
function useLidBloomTexture(): THREE.Texture | null {
  return useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 512;
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    ctx.clearRect(0, 0, c.width, c.height);
    const g = ctx.createRadialGradient(
      c.width / 2, c.height / 2, 24,
      c.width / 2, c.height / 2, c.width / 2.4,
    );
    g.addColorStop(0, "rgba(0,245,255,0.42)");
    g.addColorStop(0.35, "rgba(0,229,255,0.18)");
    g.addColorStop(0.7, "rgba(0,180,220,0.05)");
    g.addColorStop(1, "rgba(0,160,200,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, c.width, c.height);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 16;
    tex.needsUpdate = true;
    return tex;
  }, []);
}

/* LIVING SCREEN - multi-stage canvas texture that repaints as scroll
 * crosses chapter boundaries. Replaces the previous static screen with
 * a real boot sequence -> dashboard -> projects -> READY narrative.
 *
 * Stages (computed from scroll progress in useFrame):
 *   0  DORMANT      pure black with a tiny power-led indicator
 *   1-6 BOOT        6 progressive lines of OS boot text + OK badges
 *   7  STREAMS      6-stream dashboard with status / age / project
 *   8  PROJECTS     active-project progression panel with progress bars
 *   9  READY        big "READY" stamp + 6-stream dots + CTA hint
 *
 * Repaints only happen on stage changes (max 10 times across the whole
 * cinematic) so it's cheap. The texture object is stable; we just push
 * new pixels and set needsUpdate. */
const FONT_MONO = "ui-monospace, 'JetBrains Mono', 'Courier New', monospace";
const FONT_SANS = "ui-sans-serif, system-ui, sans-serif";

const BOOT_LINES: ReadonlyArray<{ pre: string; main: string; color: string }> = [
  { pre: "INITIALISING ", main: "ALGORITHMX OS v1.0", color: "#00f5ff" },
  { pre: "LOADING ", main: "curriculum.json", color: "#ffd07a" },
  { pre: "DETECTING AGE RANGE: ", main: "6 → ADULT", color: "#5fffa3" },
  { pre: "LOADING ", main: "6 LEARNING STREAMS", color: "#cba8ff" },
  { pre: "STATUS: ", main: "CYBER HEROES ACADEMY LIVE", color: "#5fffa3" },
  { pre: "STATUS: ", main: "STUDENT PATHWAYS READY", color: "#9ff5ff" },
];

/* `outcome` is the verb+ambition line per stream, written for the
 * audience that actually takes the course. Currently consumed by
 * SubjectShowcase below the hero; kept on STREAMS here so the laptop
 * screen content can surface it in future iterations if needed. */
const STREAMS = [
  { name: "CYBERSECURITY",         status: "LIVE", age: "9-16", project: "Password defender",  outcome: "DEFEND AGAINST CYBER ATTACKS", color: "#5fffa3" },
  { name: "GAME DEVELOPMENT",      status: "2026", age: "8-16", project: "Pixel platformer",   outcome: "DESIGN GAMES PEOPLE PLAY",     color: "#9ff5ff" },
  { name: "AI & MACHINE LEARNING", status: "2026", age: "11+",  project: "Image classifier",   outcome: "BUILD INTELLIGENT MACHINES",   color: "#cba8ff" },
  { name: "APP DEVELOPMENT",       status: "2027", age: "12+",  project: "Habit tracker",      outcome: "DELIVER REAL INDUSTRY PROJECTS", color: "#ffd07a" },
  { name: "ENTREPRENEURSHIP",      status: "2027", age: "13+",  project: "Pitch deck builder", outcome: "LAUNCH YOUR OWN COMPANY",      color: "#ffc94a" },
  { name: "ROBOTICS",              status: "2027", age: "10+",  project: "Maze-solver bot",    outcome: "ENGINEER ROBOTS THAT MOVE",    color: "#ff3ad6" },
] as const;

function computeScreenStage(p: number): number {
  /* Lid opens 0.32→0.50, screen ignites at 0.50, boot lines type
   * 0.52→0.62, dashboards land 0.65→0.95, READY is the final beat. */
  if (p < 0.50) return 0;
  if (p < 0.52) return 1;
  if (p < 0.54) return 2;
  if (p < 0.56) return 3;
  if (p < 0.58) return 4;
  if (p < 0.60) return 5;
  if (p < 0.65) return 6; // boot complete
  if (p < 0.86) return 7; // streams dashboard
  if (p < 0.95) return 8; // active projects
  return 9; // ready
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function paintTitleBar(
  ctx: CanvasRenderingContext2D,
  c: HTMLCanvasElement,
  stage: number,
) {
  ctx.font = `bold 36px ${FONT_MONO}`;
  ctx.fillStyle = "#00f5ff";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("ALGORITHMX_OS", 96, 90);
  ctx.font = `600 28px ${FONT_MONO}`;
  ctx.fillStyle = "rgba(232,237,255,0.55)";
  ctx.textAlign = "right";
  const mode =
    stage <= 6 ? "BOOTING" : stage === 7 ? "STREAMS" : stage === 8 ? "PROJECTS" : "READY";
  ctx.fillText(`MODE  ${mode}`, c.width - 96, 90);
  /* Mode-indicator dot — bloom cut (16 → 7) and radius trimmed
   * (9 → 6). Same logic as the streams-row dots: it was reading as
   * the brightest pixel in the title bar before this. */
  ctx.fillStyle = stage === 9 ? "#5fffa3" : "#00f5ff";
  ctx.shadowColor = stage === 9 ? "#5fffa3" : "#00f5ff";
  ctx.shadowBlur = 7;
  ctx.beginPath();
  ctx.arc(c.width - 96 - ctx.measureText(`MODE  ${mode}`).width - 22, 90, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  /* Divider */
  ctx.fillStyle = "rgba(0,245,255,0.18)";
  ctx.fillRect(96, 138, c.width - 192, 2);
}

function paintBrandStrip(ctx: CanvasRenderingContext2D, c: HTMLCanvasElement) {
  ctx.fillStyle = "rgba(0,245,255,0.16)";
  ctx.fillRect(96, c.height - 64, c.width - 192, 1);
  ctx.font = `600 24px ${FONT_MONO}`;
  ctx.fillStyle = "rgba(0,245,255,0.5)";
  ctx.textAlign = "center";
  ctx.fillText(
    "ALGORITHMX  //  TECHNOLOGY EDUCATION  //  AGES 6 → ADULT",
    c.width / 2,
    c.height - 32,
  );
}

function paintBootSequence(
  ctx: CanvasRenderingContext2D,
  c: HTMLCanvasElement,
  visibleLines: number,
) {
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  const startY = 230;
  const lineH = 96;
  for (let i = 0; i < visibleLines; i++) {
    const y = startY + i * lineH;
    const line = BOOT_LINES[i];
    let x = 112;
    /* > prompt */
    ctx.font = `bold 44px ${FONT_MONO}`;
    ctx.fillStyle = "rgba(0,245,255,0.55)";
    ctx.fillText("> ", x, y);
    x += ctx.measureText("> ").width;
    /* pre text in dim white */
    ctx.fillStyle = "rgba(232,237,255,0.78)";
    ctx.fillText(line.pre, x, y);
    x += ctx.measureText(line.pre).width;
    /* main in accent */
    ctx.fillStyle = line.color;
    ctx.fillText(line.main, x, y);
    x += ctx.measureText(line.main).width;
    /* OK badge on completed lines */
    if (i < visibleLines - 1) {
      ctx.font = `bold 26px ${FONT_MONO}`;
      const tw = ctx.measureText("OK").width;
      const padX = 20;
      const bw = tw + padX * 2;
      const bh = 38;
      const bx = x + 24;
      const by = y - bh / 2;
      ctx.fillStyle = "#5fffa3";
      roundRect(ctx, bx, by, bw, bh, 6);
      ctx.fill();
      ctx.fillStyle = "#04050d";
      ctx.textAlign = "center";
      ctx.fillText("OK", bx + bw / 2, y + 1);
      ctx.textAlign = "left";
    } else {
      /* Active line: cursor block */
      ctx.fillStyle = "#00f5ff";
      ctx.shadowColor = "#00f5ff";
      ctx.shadowBlur = 14;
      ctx.fillRect(x + 16, y - 24, 18, 48);
      ctx.shadowBlur = 0;
    }
  }
}

function paintStreamsDashboard(
  ctx: CanvasRenderingContext2D,
  c: HTMLCanvasElement,
) {
  ctx.font = `600 26px ${FONT_MONO}`;
  ctx.fillStyle = "rgba(232,237,255,0.55)";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("// 6 LEARNING STREAMS  /  CHOOSE YOUR PATH", 96, 184);

  const startY = 266;
  const rowH = 98;
  STREAMS.forEach((s, i) => {
    const y = startY + i * rowH;
    /* Accent indicator dot — bloom cut again (9 → 4) and dot radius
     * trimmed (9 → 7). With six rows of these, the cumulative glow
     * was what made the dashboard read as "neon city". */
    ctx.fillStyle = s.color;
    ctx.shadowColor = s.color;
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(116, y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    /* Stream name — accent colour at 65% alpha (was 0.88). Still
     * reads as the coloured row but doesn't shout. */
    ctx.font = `bold 38px ${FONT_MONO}`;
    ctx.fillStyle = `rgba(${hexToRgbStr(s.color)},0.65)`;
    ctx.textAlign = "left";
    ctx.fillText(s.name, 152, y - 14);
    /* Age + project subtitle — quieter (0.48 → 0.4) so the row
     * hierarchy points to the stream name, not the metadata. */
    ctx.font = `500 22px ${FONT_MONO}`;
    ctx.fillStyle = "rgba(232,237,255,0.4)";
    ctx.fillText(`AGES ${s.age}   //   ${s.project}`, 152, y + 22);
    /* Status badge — now an OUTLINED pill in the accent colour
     * instead of a saturated solid fill. The previous solid badge
     * was a bright accent rectangle on every row, six of them
     * stacked = a vertical column of neon stripes on the right.
     * Outlined feels like dashboard UI, not signage. */
    const badgeText = s.status;
    ctx.font = `bold 22px ${FONT_MONO}`;
    const tw = ctx.measureText(badgeText).width;
    const padX = 20;
    const bw = tw + padX * 2;
    const bh = 36;
    const bx = c.width - 118 - bw;
    const by = y - bh / 2;
    ctx.fillStyle = `rgba(${hexToRgbStr(s.color)},0.12)`;
    roundRect(ctx, bx, by, bw, bh, 7);
    ctx.fill();
    ctx.strokeStyle = `rgba(${hexToRgbStr(s.color)},0.55)`;
    ctx.lineWidth = 1.2;
    roundRect(ctx, bx, by, bw, bh, 7);
    ctx.stroke();
    ctx.fillStyle = `rgba(${hexToRgbStr(s.color)},0.92)`;
    ctx.textAlign = "center";
    ctx.fillText(badgeText, bx + bw / 2, y + 1);
    ctx.textAlign = "left";
  });
}

function paintProjectsDashboard(
  ctx: CanvasRenderingContext2D,
  c: HTMLCanvasElement,
) {
  ctx.font = `600 26px ${FONT_MONO}`;
  ctx.fillStyle = "rgba(232,237,255,0.55)";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("// ACTIVE PROJECTS  /  WHAT YOU'LL BUILD", 96, 184);

  const projects = [
    { name: "Password Defender", stream: "CYBERSECURITY", pct: 72, color: "#5fffa3" },
    { name: "Phishing Lab",      stream: "CYBERSECURITY", pct: 48, color: "#5fffa3" },
    { name: "Pixel Platformer",  stream: "GAME DEV",      pct: 30, color: "#9ff5ff" },
    { name: "Image Classifier",  stream: "AI & ML",       pct: 18, color: "#cba8ff" },
  ];
  const startY = 274;
  const rowH = 178;
  projects.forEach((p, i) => {
    const y = startY + i * rowH;
    /* Left accent rim — now 45% alpha so it reads as a quiet
     * vertical divider instead of a neon strip. */
    ctx.fillStyle = `rgba(${hexToRgbStr(p.color)},0.45)`;
    ctx.fillRect(96, y - 56, 3, 112);
    /* Project name — kept white but dropped to 92% alpha so the
     * pure-white edges stop punching through the screen glass. */
    ctx.font = `bold 38px ${FONT_MONO}`;
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.textAlign = "left";
    ctx.fillText(p.name, 130, y - 18);
    /* Stream subtitle — accent colour at 60% alpha, was full strength
     * which had the green / cyan text shouting alongside the bar. */
    ctx.font = `500 22px ${FONT_MONO}`;
    ctx.fillStyle = `rgba(${hexToRgbStr(p.color)},0.6)`;
    ctx.fillText(p.stream, 130, y + 22);
    /* Progress bar — alpha pulled DOWN HARD this pass (0.62 → 0.4)
     * and bar height trimmed (10 → 8 px). At 0.4 the fills register
     * as soft progress indicators, not neon stripes. */
    const barX = 130;
    const barY = y + 58;
    const barW = c.width - barX - 220;
    const barH = 8;
    ctx.fillStyle = "rgba(232,237,255,0.07)";
    roundRect(ctx, barX, barY, barW, barH, 4);
    ctx.fill();
    ctx.fillStyle = `rgba(${hexToRgbStr(p.color)},0.4)`;
    roundRect(ctx, barX, barY, barW * (p.pct / 100), barH, 4);
    ctx.fill();
    /* % label dimmed further (0.75 → 0.55) so the percentage stops
     * competing for attention with the project name. */
    ctx.font = `bold 26px ${FONT_MONO}`;
    ctx.fillStyle = `rgba(${hexToRgbStr(p.color)},0.55)`;
    ctx.textAlign = "right";
    ctx.fillText(`${p.pct}%`, c.width - 118, y + 68);
  });
}

function paintReadyState(
  ctx: CanvasRenderingContext2D,
  c: HTMLCanvasElement,
) {
  ctx.font = `600 26px ${FONT_MONO}`;
  ctx.fillStyle = "rgba(232,237,255,0.55)";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("// SYSTEM READY  /  AWAITING USER INPUT", 96, 184);

  /* Big READY stamp */
  ctx.font = `900 240px ${FONT_SANS}`;
  ctx.fillStyle = "#5fffa3";
  ctx.shadowColor = "rgba(95,255,163,0.85)";
  ctx.shadowBlur = 60;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("READY", c.width / 2, c.height / 2 - 40);
  ctx.shadowBlur = 0;

  /* Subtitle */
  ctx.font = `600 38px ${FONT_MONO}`;
  ctx.fillStyle = "rgba(232,237,255,0.6)";
  ctx.fillText("CHOOSE A STREAM TO BEGIN", c.width / 2, c.height / 2 + 160);

  /* Six stream dots strip near bottom */
  const dotY = c.height - 180;
  const span = 80;
  const startX = c.width / 2 - ((STREAMS.length - 1) * span) / 2;
  STREAMS.forEach((s, i) => {
    const x = startX + i * span;
    ctx.fillStyle = s.color;
    ctx.shadowColor = s.color;
    ctx.shadowBlur = 22;
    ctx.beginPath();
    ctx.arc(x, dotY, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  });
}

function paintScreen(canvas: HTMLCanvasElement, stage: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  /* OLED pure black */
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (stage === 0) {
    /* Dormant: tiny indicator near top-left so the screen isn't a
     * perfectly black rectangle (which can read as "broken display"). */
    ctx.fillStyle = "rgba(0,245,255,0.55)";
    ctx.shadowColor = "rgba(0,245,255,0.9)";
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(96, 90, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    return;
  }
  /* Top cyan accent strip */
  ctx.fillStyle = "rgba(0,245,255,0.08)";
  ctx.fillRect(0, 0, canvas.width, 6);
  paintTitleBar(ctx, canvas, stage);
  if (stage >= 1 && stage <= 6) paintBootSequence(ctx, canvas, stage);
  else if (stage === 7) paintStreamsDashboard(ctx, canvas);
  else if (stage === 8) paintProjectsDashboard(ctx, canvas);
  else paintReadyState(ctx, canvas);
  paintBrandStrip(ctx, canvas);
}

interface LivingScreen {
  tex: THREE.Texture | null;
  repaint: (stage: number) => void;
}

function useLivingScreen(): LivingScreen {
  const refs = useMemo<{ canvas: HTMLCanvasElement; tex: THREE.Texture } | null>(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 2048;
    canvas.height = 1280;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 16;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = true;
    return { canvas, tex };
  }, []);
  const repaint = useMemo(
    () => (stage: number) => {
      if (!refs) return;
      paintScreen(refs.canvas, stage);
      refs.tex.needsUpdate = true;
    },
    [refs],
  );
  /* Initial paint at stage 0 */
  useMemo(() => {
    if (refs) {
      paintScreen(refs.canvas, 0);
      refs.tex.needsUpdate = true;
    }
  }, [refs]);
  return { tex: refs?.tex ?? null, repaint };
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
  /* Crisp letter with a tight glow. shadowBlur 10 -> 5 keeps the halo
   * contained right around the letterform so the core stays razor
   * sharp instead of bleeding into a fuzzy aura. Halo alpha also
   * dropped 0.95 -> 0.7 so the cyan tint reads as accent rather than
   * dominant. */
  const rgb = hexToRgbStr(haloColor);
  ctx.shadowColor = `rgba(${rgb},0.7)`;
  ctx.shadowBlur = 5;
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
/* "0x" removed — at the cinematic camera distance it read as literal
 * floating text near the hero, not as a code-particle drift glyph
 * like the rest. The remaining seven single-char glyphs keep the
 * "code in the air" ambience without anyone going "what's that 0x?". */
const GLYPHS = ["0", "1", "{", "}", ">", "#", "/"] as const;

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

/* Hexagonal PCB-style grid texture. SINGLE-TILE rendering with a
 * built-in radial alpha mask, ClampToEdge wrapping — this completely
 * eliminates the seam artefacts the previous tiled implementation
 * suffered from (canvas dimensions were not integer multiples of the
 * hex pitch, so every tile edge cut hexes in half and the half-cells
 * overlapped at the joins).
 *
 * The texture is sampled exactly once across the whole floor plane:
 *   - no repeat → no joins → no doubled lines
 *   - built-in radial alpha → hexes are vivid under the laptop and
 *     fade naturally to invisible toward the floor edges (no need for
 *     extra masking planes / fog tricks)
 *   - sparse "via" nodes only on inner hex cells, deterministically
 *     hashed so the same node pattern paints every mount
 *
 * Pointy-top hex math: circumradius R, horizontal pitch R·√3, vertical
 * row pitch 1.5·R, odd rows offset by half a horizontal pitch. */
function makeHexGridTexture(): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  /* HD pass: canvas resolution doubled (1024 → 2048) and every
   * drawing dimension scaled with it (R, lineWidth, node radius) so
   * the *world* hex size is unchanged but each cell is rendered at
   * 4× the texel count. The previous 1024 canvas mapped across a
   * 36-unit plane was sampling at glancing camera angles into low
   * mip levels and producing stairstep / dotted artefacts on the
   * stroke outlines. 2048 + max anisotropy = crisp PCB look. */
  const S = 2048;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, S, S);

  const R = 16;
  const hexW = R * Math.sqrt(3);
  const rowH = R * 1.5;
  const cx = S / 2;
  const cy = S / 2;
  /* fadeR tightened further (0.46 → 0.40) for a true cinematic
   * stage pool. Outer hexes vanish hard so the laptop stands in a
   * spot-lit pool of light, not a tiled wallpaper. */
  const fadeR = S * 0.4;

  const cols = Math.ceil(S / hexW) + 2;
  const rows = Math.ceil(S / rowH) + 2;

  const hexes: Array<{ x: number; y: number; a: number }> = [];
  for (let row = -1; row < rows; row++) {
    const xOff = row & 1 ? hexW / 2 : 0;
    for (let col = -1; col < cols; col++) {
      const x = col * hexW + xOff;
      const y = row * rowH;
      const dx = (x - cx) / fadeR;
      const dy = (y - cy) / fadeR;
      const d2 = dx * dx + dy * dy;
      if (d2 > 1.0) continue;
      const t = Math.max(0, 1 - d2);
      /* Cubic falloff (was quadratic) - the inner pool stays vivid
       * but the outer hexes drop off faster, giving a more
       * deliberate "spot-lit stage" feel under the laptop instead
       * of a wallpaper texture filling the frame. */
      const a = t * t * t;
      hexes.push({ x, y, a });
    }
  }

  /* Centre accent pool — pumped up significantly. This is the
   * spot-light under the laptop. Inner stop brighter (0.22 → 0.38)
   * and outer stop tightened so the brightness falloff feels
   * deliberate, not diffused. Pool radius also pulled in a touch
   * (0.28 → 0.26) so the brightest area is concentrated under the
   * laptop rather than spread across the floor.
   *
   * Painted first so the hex strokes draw on top of it. */
  const poolGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, S * 0.26);
  poolGrad.addColorStop(0, "rgba(0,229,255,0.38)");
  poolGrad.addColorStop(0.4, "rgba(0,229,255,0.15)");
  poolGrad.addColorStop(1, "rgba(0,229,255,0)");
  ctx.fillStyle = poolGrad;
  ctx.fillRect(0, 0, S, S);

  /* Inner micro-pool — second radial gradient TIGHTER than the
   * main pool, providing the "really bright right under the laptop"
   * hotspot. Adds a deliberate light source feel — like a stage
   * spot pointed straight down. */
  const hotGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, S * 0.1);
  hotGrad.addColorStop(0, "rgba(127,240,255,0.25)");
  hotGrad.addColorStop(1, "rgba(127,240,255,0)");
  ctx.fillStyle = hotGrad;
  ctx.fillRect(0, 0, S, S);

  /* Pass 1: hex outlines. lineWidth scaled to the 2048 canvas (now
   * 1.7 px instead of sub-pixel 0.85) so each stroke renders as a
   * proper pixel-aligned line, not a sub-pixel ghost that the canvas
   * smears across two rows. Alpha multiplier also bumped (0.55 → 0.7)
   * for a brighter, more confidently "drawn" line. */
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const h of hexes) {
    if (h.a < 0.02) continue;
    ctx.strokeStyle = `rgba(0,229,255,${0.7 * h.a})`;
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const ang = (Math.PI / 3) * i + Math.PI / 6;
      const px = h.x + R * Math.cos(ang);
      const py = h.y + R * Math.sin(ang);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
  }

  /* Pass 2: via-style nodes — restricted to the INNER zone only so
   * they read as deliberate accents under the laptop, not random
   * peppering across the whole stage. Threshold tightened (0.05 →
   * 0.035) so fewer dots overall. Alpha cap above 0.45 only — the
   * outer hexes that DO get a node are too dim to register. */
  for (const h of hexes) {
    if (h.a < 0.45) continue; // inner zone only
    const seed = Math.sin(h.x * 12.9898 + h.y * 78.233) * 43758.5453;
    const r = seed - Math.floor(seed);
    if (r > 0.035) continue;
    const dotA = h.a * 1.0;
    ctx.fillStyle = `rgba(127,240,255,${dotA})`;
    ctx.shadowColor = "rgba(127,240,255,0.85)";
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(h.x, h.y, 2.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  /* PASS 3 — ASYMMETRIC VERTICAL FADE on the near-camera floor.
   *
   * The floor plane is rotated -π/2 around X, so canvas-bottom pixels
   * (high Y) render in the LOWER viewport (the floor area closest to
   * the camera). That area's bright hex pattern was creating the
   * visible seam against ProblemStats below, because the texture's
   * radial fade is symmetric and didn't account for the asymmetric
   * camera angle.
   *
   * `destination-out` composite subtracts alpha from already-drawn
   * pixels. Gradient stays at 0 (unchanged) through the centre half
   * of the canvas (laptop pool stays vivid), then ramps up to nearly
   * full erasure at the canvas bottom — so the near-camera floor
   * tapers cleanly into nothing instead of cutting off at a hard
   * edge. GlobalBackdrop now reads through the seam directly; no
   * heavy ink overlay needed downstream. */
  ctx.globalCompositeOperation = "destination-out";
  const nearCameraFade = ctx.createLinearGradient(0, 0, 0, S);
  nearCameraFade.addColorStop(0.0,  "rgba(0,0,0,0)");
  nearCameraFade.addColorStop(0.55, "rgba(0,0,0,0)");
  nearCameraFade.addColorStop(0.78, "rgba(0,0,0,0.55)");
  nearCameraFade.addColorStop(0.92, "rgba(0,0,0,0.88)");
  nearCameraFade.addColorStop(1.0,  "rgba(0,0,0,0.96)");
  ctx.fillStyle = nearCameraFade;
  ctx.fillRect(0, 0, S, S);
  ctx.globalCompositeOperation = "source-over";

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.anisotropy = 16;
  tex.generateMipmaps = true;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/* Soft cyan-blue contact-light glow projected onto the floor directly
 * beneath the laptop. Reads as "screen + chassis edge bleeding light
 * onto the polished surface". Cooler and weaker than the screen beam
 * so it grounds the laptop without competing with the chassis. */
function makeContactUnderglowTexture(): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  ctx.clearRect(0, 0, c.width, c.height);
  const g = ctx.createRadialGradient(
    c.width / 2,
    c.height / 2,
    24,
    c.width / 2,
    c.height / 2,
    c.width / 2.6,
  );
  g.addColorStop(0, "rgba(86,205,255,0.55)");
  g.addColorStop(0.35, "rgba(60,150,220,0.22)");
  g.addColorStop(0.7, "rgba(40,80,150,0.07)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, c.width, c.height);
  const tex = new THREE.CanvasTexture(c);
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

/* SCREEN-EMITTED SLABS — three holographic panels that emerge OUT of
 *  the screen face along Z toward the camera. Sized + positioned to
 *  stay within the laptop silhouette so they never crash into the
 *  headline column on the left of the frame. */

const SLAB_STREAM_ICONS: ReadonlyArray<string> = ["⌬", "◐", "▢"];

function makeSlabTexture(
  stream: (typeof STREAMS)[number],
  icon: string,
): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = 384;
  c.height = 512;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const accent = stream.color;
  const accentRgb = hexToRgbStr(accent);

  /* Dark glass panel — slightly translucent so the screen behind
   *  still bleeds through faintly. */
  const bgGrad = ctx.createLinearGradient(0, 0, 0, c.height);
  bgGrad.addColorStop(0, "rgba(6,9,18,0.80)");
  bgGrad.addColorStop(1, "rgba(2,4,10,0.84)");
  ctx.fillStyle = bgGrad;
  roundRect(ctx, 0, 0, c.width, c.height, 18);
  ctx.fill();

  /* Inner accent halo behind the outcome text */
  const halo = ctx.createRadialGradient(
    c.width / 2, c.height * 0.42, 14,
    c.width / 2, c.height * 0.42, c.width * 0.7,
  );
  halo.addColorStop(0, `rgba(${accentRgb},0.28)`);
  halo.addColorStop(0.55, `rgba(${accentRgb},0.06)`);
  halo.addColorStop(1, `rgba(${accentRgb},0)`);
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, c.width, c.height);

  /* Accent rim */
  ctx.lineWidth = 2;
  ctx.strokeStyle = `rgba(${accentRgb},0.85)`;
  ctx.shadowColor = accent;
  ctx.shadowBlur = 14;
  roundRect(ctx, 3, 3, c.width - 6, c.height - 6, 16);
  ctx.stroke();
  ctx.shadowBlur = 0;

  /* Corner brackets (JARVIS tell) */
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(20, 40); ctx.lineTo(20, 20); ctx.lineTo(40, 20);
  ctx.moveTo(c.width - 40, c.height - 20); ctx.lineTo(c.width - 20, c.height - 20); ctx.lineTo(c.width - 20, c.height - 40);
  ctx.stroke();

  /* Icon top */
  ctx.font = `bold 46px ${FONT_SANS}`;
  ctx.fillStyle = accent;
  ctx.shadowColor = accent;
  ctx.shadowBlur = 14;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(icon, 28, 80);
  ctx.shadowBlur = 0;

  /* Outcome — 2-line balanced split with auto-fit font size */
  const words = stream.outcome.split(" ");
  let lines: string[];
  if (words.length <= 2) {
    lines = words.length === 1 ? [words[0]] : words;
  } else {
    ctx.font = `900 56px ${FONT_SANS}`;
    let bestSplit = Math.ceil(words.length / 2);
    let bestDelta = Infinity;
    for (let i = 1; i < words.length; i++) {
      const a = words.slice(0, i).join(" ");
      const b = words.slice(i).join(" ");
      const d = Math.abs(ctx.measureText(a).width - ctx.measureText(b).width);
      if (d < bestDelta) { bestDelta = d; bestSplit = i; }
    }
    lines = [
      words.slice(0, bestSplit).join(" "),
      words.slice(bestSplit).join(" "),
    ];
  }
  let size = 54;
  const maxW = c.width - 56;
  while (
    size > 24 &&
    lines.some((ln) => {
      ctx.font = `900 ${size}px ${FONT_SANS}`;
      return ctx.measureText(ln).width > maxW;
    })
  ) {
    size -= 2;
  }
  ctx.font = `900 ${size}px ${FONT_SANS}`;
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = `rgba(${accentRgb},0.55)`;
  ctx.shadowBlur = 16;
  ctx.textAlign = "left";
  const lineH = size * 1.06;
  const blockTop = 140;
  const blockBot = c.height - 130;
  const blockH = lines.length * lineH;
  const startY = blockTop + (blockBot - blockTop - blockH) / 2 + size * 0.82;
  lines.forEach((ln, i) => {
    ctx.fillText(ln, 28, startY + i * lineH);
  });
  ctx.shadowBlur = 0;

  /* Divider */
  ctx.fillStyle = `rgba(${accentRgb},0.32)`;
  ctx.fillRect(28, c.height - 108, c.width - 56, 1);

  /* Stream name + age sub */
  ctx.font = `bold 17px ${FONT_MONO}`;
  ctx.fillStyle = accent;
  ctx.shadowColor = accent;
  ctx.shadowBlur = 8;
  ctx.fillText(stream.name, 28, c.height - 78);
  ctx.shadowBlur = 0;
  ctx.font = `500 13px ${FONT_MONO}`;
  ctx.fillStyle = "rgba(232,237,255,0.55)";
  ctx.fillText(`AGES ${stream.age}  ·  ${stream.project}`, 28, c.height - 56);

  /* Status pill bottom-right */
  ctx.font = `bold 13px ${FONT_MONO}`;
  const sw = ctx.measureText(stream.status).width;
  const spad = 11;
  const sbw = sw + spad * 2;
  const sbh = 22;
  const sbx = c.width - 28 - sbw;
  const sby = c.height - 42;
  ctx.fillStyle = accent;
  ctx.shadowColor = accent;
  ctx.shadowBlur = 10;
  roundRect(ctx, sbx, sby, sbw, sbh, 5);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#04050d";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(stream.status, sbx + sbw / 2, sby + sbh / 2);

  const out = new THREE.CanvasTexture(c);
  out.colorSpace = THREE.SRGBColorSpace;
  out.anisotropy = 16;
  out.minFilter = THREE.LinearMipmapLinearFilter;
  out.magFilter = THREE.LinearFilter;
  out.generateMipmaps = true;
  out.needsUpdate = true;
  return out;
}

/* Per-stream curriculum bullets surfaced when a slab is hovered.
 *  Indexed by the STREAMS array so the right bullets land on the
 *  right card regardless of which streams the hero surfaces. */
const SLAB_CURRICULUM: ReadonlyArray<readonly string[]> = [
  /* 0 CYBERSECURITY */
  ["Stop phishing scams cold", "Build passwords nobody cracks", "Hunt threats like a pro"],
  /* 1 GAME DEVELOPMENT */
  ["Design game mechanics that hook", "Animate pixel-art characters", "Publish your first game"],
  /* 2 AI & MACHINE LEARNING */
  ["Train models that see images", "Build a neural network from zero", "Spot bias before it ships"],
  /* 3 APP DEVELOPMENT */
  ["Design UIs people actually love", "Wire apps to live data", "Ship to the web in one click"],
  /* 4 ENTREPRENEURSHIP */
  ["Validate your idea fast", "Build a pitch that converts", "Win your first customer"],
  /* 5 ROBOTICS */
  ["Wire sensors and motors", "Code a maze-solving bot", "Build it for real"],
];

/* DETAIL slab texture — the richer face that crossfades over the
 *  compact one when a slab is hovered. Adds a "WHAT YOU'LL LEARN"
 *  bullets block above the stream details.
 *  Same 3:4 portrait aspect as makeSlabTexture (480x640 vs 384x512)
 *  so it shares the same planeGeometry — only the texture swaps. */
function makeSlabDetailTexture(
  stream: (typeof STREAMS)[number],
  icon: string,
  bullets: ReadonlyArray<string>,
): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = 480;
  c.height = 640;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const accent = stream.color;
  const accentRgb = hexToRgbStr(accent);

  /* Glass panel — slightly denser than the compact face so the
   *  hover state reads as "this card has more presence". */
  const bgGrad = ctx.createLinearGradient(0, 0, 0, c.height);
  bgGrad.addColorStop(0, "rgba(8,12,22,0.92)");
  bgGrad.addColorStop(1, "rgba(2,4,10,0.95)");
  ctx.fillStyle = bgGrad;
  roundRect(ctx, 0, 0, c.width, c.height, 22);
  ctx.fill();

  /* Inner accent halo behind the outcome */
  const halo = ctx.createRadialGradient(
    c.width / 2, c.height * 0.32, 18,
    c.width / 2, c.height * 0.32, c.width * 0.75,
  );
  halo.addColorStop(0, `rgba(${accentRgb},0.34)`);
  halo.addColorStop(0.55, `rgba(${accentRgb},0.08)`);
  halo.addColorStop(1, `rgba(${accentRgb},0)`);
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, c.width, c.height);

  /* Brighter accent rim than compact (active state) */
  ctx.lineWidth = 2;
  ctx.strokeStyle = `rgba(${accentRgb},0.95)`;
  ctx.shadowColor = accent;
  ctx.shadowBlur = 20;
  roundRect(ctx, 3, 3, c.width - 6, c.height - 6, 20);
  ctx.stroke();
  ctx.shadowBlur = 0;

  /* Corner brackets */
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(24, 48); ctx.lineTo(24, 24); ctx.lineTo(48, 24);
  ctx.moveTo(c.width - 48, c.height - 24); ctx.lineTo(c.width - 24, c.height - 24); ctx.lineTo(c.width - 24, c.height - 48);
  ctx.stroke();

  /* Icon top-left */
  ctx.font = `bold 44px ${FONT_SANS}`;
  ctx.fillStyle = accent;
  ctx.shadowColor = accent;
  ctx.shadowBlur = 16;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(icon, 32, 80);
  ctx.shadowBlur = 0;

  /* Status pill top-right */
  ctx.font = `bold 13px ${FONT_MONO}`;
  const stw = ctx.measureText(stream.status).width;
  const stbw = stw + 22;
  const stbh = 22;
  const stbx = c.width - 32 - stbw;
  const stby = 50;
  ctx.fillStyle = accent;
  ctx.shadowColor = accent;
  ctx.shadowBlur = 10;
  roundRect(ctx, stbx, stby, stbw, stbh, 5);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#04050d";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(stream.status, stbx + stbw / 2, stby + stbh / 2);

  /* Outcome — 2-line balanced split, smaller than compact (room for bullets) */
  const words = stream.outcome.split(" ");
  let lines: string[];
  if (words.length <= 2) {
    lines = words.length === 1 ? [words[0]] : words;
  } else {
    ctx.font = `900 48px ${FONT_SANS}`;
    let bestSplit = Math.ceil(words.length / 2);
    let bestDelta = Infinity;
    for (let i = 1; i < words.length; i++) {
      const a = words.slice(0, i).join(" ");
      const b = words.slice(i).join(" ");
      const d = Math.abs(ctx.measureText(a).width - ctx.measureText(b).width);
      if (d < bestDelta) { bestDelta = d; bestSplit = i; }
    }
    lines = [
      words.slice(0, bestSplit).join(" "),
      words.slice(bestSplit).join(" "),
    ];
  }
  let size = 48;
  const maxW = c.width - 64;
  while (
    size > 22 &&
    lines.some((ln) => {
      ctx.font = `900 ${size}px ${FONT_SANS}`;
      return ctx.measureText(ln).width > maxW;
    })
  ) {
    size -= 2;
  }
  ctx.font = `900 ${size}px ${FONT_SANS}`;
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = `rgba(${accentRgb},0.6)`;
  ctx.shadowBlur = 14;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  const lineH = size * 1.06;
  const outcomeStartY = 140 + size * 0.8;
  lines.forEach((ln, i) => {
    ctx.fillText(ln, 32, outcomeStartY + i * lineH);
  });
  ctx.shadowBlur = 0;

  /* Divider above bullets */
  ctx.fillStyle = `rgba(${accentRgb},0.32)`;
  ctx.fillRect(32, 280, c.width - 64, 1);

  /* Section header */
  ctx.font = `bold 12px ${FONT_MONO}`;
  ctx.fillStyle = `rgba(${accentRgb},0.85)`;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("// WHAT YOU'LL LEARN", 32, 308);

  /* Three bullets */
  const bulletY = 348;
  const bulletH = 38;
  bullets.forEach((b, i) => {
    /* Marker */
    ctx.font = `bold 22px ${FONT_SANS}`;
    ctx.fillStyle = accent;
    ctx.shadowColor = accent;
    ctx.shadowBlur = 6;
    ctx.fillText("▸", 32, bulletY + i * bulletH);
    ctx.shadowBlur = 0;
    /* Body — auto-shrink if too long */
    let bsz = 19;
    ctx.font = `500 ${bsz}px ${FONT_SANS}`;
    while (bsz > 14 && ctx.measureText(b).width > c.width - 80) {
      bsz -= 1;
      ctx.font = `500 ${bsz}px ${FONT_SANS}`;
    }
    ctx.fillStyle = "rgba(232,237,255,0.92)";
    ctx.fillText(b, 60, bulletY + i * bulletH);
  });

  /* Divider above footer */
  ctx.fillStyle = `rgba(${accentRgb},0.32)`;
  ctx.fillRect(32, 478, c.width - 64, 1);

  /* Stream name */
  ctx.font = `bold 16px ${FONT_MONO}`;
  ctx.fillStyle = accent;
  ctx.shadowColor = accent;
  ctx.shadowBlur = 8;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(stream.name, 32, 508);
  ctx.shadowBlur = 0;

  /* Age + first project sub-line */
  ctx.font = `500 12px ${FONT_MONO}`;
  ctx.fillStyle = "rgba(232,237,255,0.6)";
  ctx.fillText(`AGES ${stream.age}  ·  FIRST: ${stream.project}`, 32, 532);

  const out = new THREE.CanvasTexture(c);
  out.colorSpace = THREE.SRGBColorSpace;
  out.anisotropy = 16;
  out.minFilter = THREE.LinearMipmapLinearFilter;
  out.magFilter = THREE.LinearFilter;
  out.generateMipmaps = true;
  out.needsUpdate = true;
  return out;
}

/* Floor sheen texture - simulates the polished floor catching the
 * chassis silhouette as a reflection, WITHOUT actually computing a
 * mirror render pass (drei's MeshReflectorMaterial was unstable on
 * this drei/three combo and produced sharp slab artifacts of the
 * laptop's underside). A vertical gradient that's brightest where
 * the chassis sits and fades into the floor, painted additively at
 * low opacity. Cheap, stable, gives the eye what it needs. */
function makeFloorSheenTexture(): THREE.Texture | null {
  if (typeof window === "undefined") return null;
  const w = 1024;
  const h = 512;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  ctx.clearRect(0, 0, w, h);
  /* Vertical sheen: brightest at the top (where the chassis "begins")
   * and fading to transparent at the bottom (where reflection naturally
   * dies). Cool cyan-blue tint matches the screen-glow palette. */
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0.0, "rgba(120,180,225,0.55)");
  g.addColorStop(0.18, "rgba(80,140,200,0.32)");
  g.addColorStop(0.45, "rgba(40,80,140,0.14)");
  g.addColorStop(0.85, "rgba(20,40,80,0.04)");
  g.addColorStop(1.0, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  /* Horizontal taper: punch alpha so the bright strip fades at the
   * left and right edges (matches the chassis silhouette better than
   * a rectangular slab). */
  const img = ctx.getImageData(0, 0, w, h);
  const cx = w / 2;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = (x - cx) / (w / 2);
      const taper = Math.max(0, 1 - dx * dx * 1.1);
      const i = (y * w + x) * 4;
      img.data[i + 3] = Math.round(img.data[i + 3] * taper);
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

/* Soft contact-shadow texture - radial gradient with smooth falloff so
 * the shadow under the laptop doesn't have a hard ellipse edge.
 * Strengthened (deeper core, longer falloff) for a heavier sense of
 * physical contact with the floor. */
function makeSoftShadowTexture(): THREE.Texture | null {
  if (typeof window === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  ctx.clearRect(0, 0, c.width, c.height);
  /* Two-stop gradient: tight black core under the chassis, longer soft
   * falloff out to the edge of the plane. */
  const g = ctx.createRadialGradient(
    c.width / 2,
    c.height / 2,
    18,
    c.width / 2,
    c.height / 2,
    c.width / 2.0,
  );
  g.addColorStop(0, "rgba(0,0,0,0.96)");
  g.addColorStop(0.2, "rgba(0,0,0,0.78)");
  g.addColorStop(0.5, "rgba(0,0,0,0.32)");
  g.addColorStop(0.85, "rgba(0,0,0,0.06)");
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
      {/* Canvas background intentionally left UNSET (alpha-clear). The
       *  page-level GlobalBackdrop sits behind every section and carries
       *  the deep-ink colour plus the ambient orb/particle motion. A
       *  transparent canvas lets that environment read THROUGH the hero
       *  instead of standing as an opaque ink slab — which is what used
       *  to produce the hard horizontal seam below the laptop when the
       *  sticky pin released and ChooseYourPath revealed the (different)
       *  backdrop underneath. Now hero + next section share one
       *  continuous atmosphere. */}

      {/* PROCEDURAL studio environment built from Lightformer rects -
       *  renders to a small cubemap on the very first frame, no CDN
       *  download, no Suspense fallback gap. Was Environment
       *  preset="studio" which depended on an HDR fetched from drei's
       *  CDN; while that file was in flight, scene.environment was
       *  null and the metallic chassis had nothing to reflect -
       *  THAT was the brief dark-grey flash on page load. With
       *  Lightformers the env is ready before paint 1 so the chassis
       *  reads as silver immediately and consistently.
       *
       *  resolution=128 + frames=1 means the cubemap renders once and
       *  is cached - effectively free at runtime. */}
      <Environment background={false} resolution={128} frames={1}>
        {/* Key light - bright warm-white from upper-front-right */}
        <Lightformer
          form="rect"
          intensity={3.4}
          color="#ffffff"
          position={[5, 6, 4]}
          rotation={[-Math.PI / 4, 0, 0]}
          scale={[6, 6, 1]}
        />
        {/* Fill - soft cool-blue from upper-left */}
        <Lightformer
          form="rect"
          intensity={2}
          color="#dde6ff"
          position={[-5, 4, 3]}
          rotation={[0, Math.PI / 3, 0]}
          scale={[6, 5, 1]}
        />
        {/* Rim - cooler back-light to give the lid edge a highlight */}
        <Lightformer
          form="rect"
          intensity={1.6}
          color="#aab8ff"
          position={[0, 5, -5]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[8, 4, 1]}
        />
        {/* Bottom bounce - subtle warm fill from below so the chassis
         *  underside isn't pitch-black */}
        <Lightformer
          form="rect"
          intensity={0.9}
          color="#3d4660"
          position={[0, -3, 2]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[10, 4, 1]}
        />
      </Environment>

      {/* Lighting dialled back further: directional 1.85 -> 1.55, ambient
       *  1.1 -> 1.0. Chassis still reads silver but the front-bottom
       *  edge no longer catches a hot specular bloom from the
       *  directional source - reads as brushed metal rather than
       *  glossy plastic. */}
      <ambientLight intensity={1.0} color="#dde6ff" />
      <directionalLight position={[4, 6, 5]} intensity={1.55} color="#ffffff" />
      {/* LEFT-SIDE FILL — balances the strong right-front key
       *  directional above. Without it, the LEFT face of the lid sat
       *  in shadow and read as a dark vertical band against the
       *  brushed-aluminium material. Neutral soft-white at moderate
       *  intensity (0.85) so it fills without flattening the key
       *  light's modelling. */}
      <directionalLight position={[-4, 4, 5]} intensity={0.85} color="#e8eef8" />
      <pointLight position={[-3, 2.5, 4]} intensity={0.6} color={COLORS.cyan} />
      {/* Rim light from behind to highlight the lid's top edge */}
      <pointLight position={[2, 4, -3]} intensity={0.6} color="#ffffff" />

      <Laptop progress={progress} reducedMotion={reducedMotion} />

      {/* Cinematic post-processing.
       *  - multisampling=4 enables MSAA inside the post-processing
       *    render target so chassis edges, card edges, and screen-text
       *    edges no longer go jaggy after Vignette/Noise sample them.
       *    (Was 0, which silently dropped the canvas-level antialias.)
       *  - Film grain dropped to almost imperceptible (0.035 -> 0.012)
       *    so it stops adding the perceived "fuzzy texture" over
       *    everything.
       *  - Bloom is still excluded - it crashes this drei/three combo. */}
      <EffectComposer multisampling={4} enableNormalPass={false}>
        {/* Vignette darkness softened (0.85 -> 0.5) so the lower edge
         *  no longer crushes into a deep ink ring right where the hero
         *  meets the next section. The frame still vignettes inward
         *  enough to focus the eye, but the bottom of the canvas now
         *  blends smoothly into the page mist instead of stamping a
         *  hard dark band that betrays the section boundary. */}
        <Vignette
          eskil={false}
          offset={0.26}
          darkness={0.5}
          blendFunction={BlendFunction.NORMAL}
        />
        <Noise opacity={0.012} blendFunction={BlendFunction.OVERLAY} />
      </EffectComposer>
    </Canvas>
  );
}

/* SCREEN SLABS — three holographic panels that emerge straight forward
 *  out of the laptop screen during the back half of chapter 05. Tight
 *  X spread (±0.46) keeps the cluster inside the laptop silhouette so
 *  it never overlaps the headline column. Z lerps from the screen
 *  face (~-0.4) out to in-front-of-screen (~+0.6) — that motion is
 *  the entire "coming out" effect. */
/* No-op raycast: visible meshes (compact / detail / rim) opt out of
 *  hit-testing so all pointer events route through the dedicated
 *  hit-plane mesh per slab. Without this, the cursor can flip between
 *  child meshes inside a group and fire spurious Enter/Leave events. */
const NO_RAYCAST = () => {};

function ScreenSlabs({ progress }: { progress: MotionValue<number> }) {
  const slabs = useMemo(
    () => [
      { stream: STREAMS[0], streamIdx: 0, icon: SLAB_STREAM_ICONS[0], x: -0.62 }, // CYBERSECURITY
      { stream: STREAMS[2], streamIdx: 2, icon: SLAB_STREAM_ICONS[1], x:  0.0  }, // AI & ML (centre)
      { stream: STREAMS[3], streamIdx: 3, icon: SLAB_STREAM_ICONS[2], x:  0.62 }, // APP DEV
    ],
    [],
  );

  /* Two texture sets: compact (default) and detail (revealed on hover). */
  const compactTextures = useMemo(
    () => slabs.map((s) => makeSlabTexture(s.stream, s.icon)),
    [slabs],
  );
  const detailTextures = useMemo(
    () =>
      slabs.map((s) =>
        makeSlabDetailTexture(s.stream, s.icon, SLAB_CURRICULUM[s.streamIdx]),
      ),
    [slabs],
  );

  const groupRefs = useRef<(THREE.Group | null)[]>([null, null, null]);
  const matRefs = useRef<(THREE.MeshBasicMaterial | null)[]>([null, null, null]);
  const detailMatRefs = useRef<(THREE.MeshBasicMaterial | null)[]>([null, null, null]);
  const rimRefs = useRef<(THREE.MeshBasicMaterial | null)[]>([null, null, null]);

  /* Hover state. Tracked as a ref so useFrame can read it without
   *  re-binding every render; mirrored from React state via effect. */
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const hoveredRef = useRef<number | null>(null);
  useEffect(() => {
    hoveredRef.current = hoveredIdx;
  }, [hoveredIdx]);

  /* Tiny debounce on Leave so cursor moves between child meshes (or
   *  briefly off the hit plane edge) don't flicker the bloom away.
   *  Enter cancels the pending clear. */
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Touch detection. `(pointer: coarse)` is the standard CSS media
   *  query for "primary input is touch" — covers phones, finger-only
   *  tablets, and anything where hover isn't reliable. iPad-with-
   *  trackpad reports `fine` and gets the desktop hover path. */
  const isTouchDevice = useRef(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    isTouchDevice.current = window.matchMedia("(pointer: coarse)").matches;
    return () => {
      if (leaveTimer.current) clearTimeout(leaveTimer.current);
      if (typeof document !== "undefined") document.body.style.cursor = "";
    };
  }, []);

  const handleEnter = (i: number) => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
    setHoveredIdx((prev) => (prev === i ? prev : i));
    if (typeof document !== "undefined") document.body.style.cursor = "pointer";
  };
  const handleLeave = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    leaveTimer.current = setTimeout(() => {
      setHoveredIdx(null);
      if (typeof document !== "undefined") document.body.style.cursor = "";
      leaveTimer.current = null;
    }, 60);
  };
  const handleClick = (stream: (typeof STREAMS)[number]) => {
    if (typeof window === "undefined") return;
    /* LIVE streams go straight to the course; planned streams scroll
     *  the user down to SubjectShowcase where they can join the
     *  waitlist or browse the others. */
    if (stream.status === "LIVE") {
      window.location.href = "/cyberheroes";
    } else {
      document.getElementById("subjects")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  /* Geometry constants for the emerge animation. SLAB_Y 1.55 +
   * SLAB_X_OFFSET 0.32 centre the cluster on the screen face. Slabs
   * travel along Z from START_Z (at the screen face) to END_Z
   * (clearly in front of the screen, toward camera). */
  const SLAB_Y = 1.55;
  const SLAB_X_OFFSET = 0.32;
  const START_Z = -0.4;
  const END_Z = 0.6;

  useFrame((state, delta) => {
    const p = progress.get();
    const t = state.clock.elapsedTime;
    const hovered = hoveredRef.current;
    /* Frame-rate-independent spring follow for hover transitions */
    const follow = 1 - Math.exp(-14 * Math.min(0.05, delta));

    /* Auto-dismiss the expanded card when the slabs scroll out of
     *  view (matters for touch users — without this, returning to
     *  the cinematic later would re-open whatever was last tapped). */
    if (hovered !== null && (p < 0.68 || p > 1.0)) {
      setHoveredIdx(null);
    }

    slabs.forEach((s, i) => {
      const g = groupRefs.current[i];
      const m = matRefs.current[i];
      const dm = detailMatRefs.current[i];
      const r = rimRefs.current[i];
      if (!g || !m) return;

      const delay = i === 1 ? 0 : 0.025;
      const emergeP = smoothstep(0.72 + delay, 0.86 + delay, p);

      const isHovered = hovered === i;
      const someoneHovered = hovered !== null;
      const isSibling = someoneHovered && !isHovered;

      /* Bloom multipliers: hovered = scale way up + lift forward
       *  (text needs to be comfortably readable, not just visible);
       *  sibling = recede hard to clear space for the much-larger
       *  hovered card. At 2.4× the outcome text lands around 60px
       *  and the bullets around 22px in viewport space — well above
       *  the 16-18px floor for body text. */
      const hoverScaleMul = isHovered ? 2.4 : isSibling ? 0.62 : 1.0;
      const hoverZLift = isHovered ? 0.42 : 0;

      const bob = Math.sin(t * 0.6 + i * 0.8) * 0.02;
      const targetX = RIG_X + SLAB_X_OFFSET + s.x;
      const targetY = SLAB_Y + bob * emergeP;
      const targetZ = lerp(START_Z, END_Z, emergeP) + hoverZLift * emergeP;

      /* Position is set directly (no spring) so the bob stays smooth
       *  and the Z lift on hover lerps via the targetZ value itself. */
      g.position.set(
        lerp(g.position.x, targetX, follow),
        lerp(g.position.y, targetY, follow),
        lerp(g.position.z, targetZ, follow),
      );

      /* Yaw drift — quieter when hovered (focused stillness) */
      const yawMul = isHovered ? 0.2 : 1.0;
      g.rotation.y = Math.sin(t * 0.35 + i) * 0.012 * emergeP * yawMul;

      const targetScale = lerp(0.4, hoverScaleMul, emergeP);
      const sc = lerp(g.scale.x, targetScale, follow);
      g.scale.set(sc, sc, sc);

      /* Compact face: full opacity when not hovered, fades almost out
       *  when this slab is hovered (detail face takes over), dims when
       *  a sibling is hovered. */
      const compactTarget = isHovered ? 0.05 : isSibling ? 0.4 : 0.92;
      m.opacity = lerp(m.opacity, emergeP * compactTarget, follow);

      /* Detail face: 0 unless hovered, then 0.96 */
      if (dm) {
        const detailTarget = isHovered ? 0.96 : 0;
        dm.opacity = lerp(dm.opacity, emergeP * detailTarget, follow);
      }

      /* Rim glow: brighter on hover, dimmer on siblings */
      if (r) {
        const breathe = 0.7 + Math.sin(t * 1.4 + i) * 0.3;
        const rimMul = isHovered ? 1.7 : isSibling ? 0.45 : 1.0;
        const rimTarget = emergeP * 0.18 * breathe * rimMul;
        r.opacity = lerp(r.opacity, rimTarget, follow);
      }
    });
  });

  return (
    <>
      {slabs.map((s, i) => {
        const tex = compactTextures[i];
        const dtex = detailTextures[i];
        if (!tex) return null;
        return (
          <group
            key={i}
            ref={(el) => {
              groupRefs.current[i] = el;
            }}
            position={[RIG_X + SLAB_X_OFFSET + s.x, SLAB_Y, START_Z]}
          >
            {/* Rim glow (back of stack) */}
            <mesh position={[0, 0, -0.002]} raycast={NO_RAYCAST}>
              <planeGeometry args={[0.64, 0.82]} />
              <meshBasicMaterial
                ref={(el) => {
                  rimRefs.current[i] = el;
                }}
                color={s.stream.color}
                transparent
                opacity={0}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>

            {/* Compact face (default) */}
            <mesh raycast={NO_RAYCAST}>
              <planeGeometry args={[0.54, 0.72]} />
              <meshBasicMaterial
                ref={(el) => {
                  matRefs.current[i] = el;
                }}
                map={tex}
                transparent
                opacity={0}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>

            {/* Detail face (revealed on hover) — slightly forward in
             *  local Z so it renders over the compact face when both
             *  are partially visible mid-crossfade. */}
            {dtex && (
              <mesh position={[0, 0, 0.001]} raycast={NO_RAYCAST}>
                <planeGeometry args={[0.54, 0.72]} />
                <meshBasicMaterial
                  ref={(el) => {
                    detailMatRefs.current[i] = el;
                  }}
                  map={dtex}
                  transparent
                  opacity={0}
                  depthWrite={false}
                  toneMapped={false}
                />
              </mesh>
            )}

            {/* Hit plane — invisible, slightly oversized, the ONLY mesh
             *  the raycaster considers. Pointer events bubble nowhere
             *  else so cursor transitions inside the group can't flicker
             *  the hover state.
             *
             *  Desktop (mouse): hover expands, click navigates.
             *  Touch  (phone / iPad finger): hover is unreliable or
             *    absent, so we route everything through click:
             *      1st tap on a card  → expand it
             *      2nd tap on same    → navigate
             *      tap on different   → switch the expanded card */}
            <mesh
              position={[0, 0, 0.01]}
              onPointerOver={(e) => {
                if (isTouchDevice.current) return;
                e.stopPropagation();
                handleEnter(i);
              }}
              onPointerOut={(e) => {
                if (isTouchDevice.current) return;
                e.stopPropagation();
                handleLeave();
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (!isTouchDevice.current) {
                  handleClick(s.stream);
                  return;
                }
                /* Touch: first tap on an unfocused card expands it;
                 *  second tap (already focused) navigates. */
                if (hoveredRef.current === i) {
                  handleClick(s.stream);
                } else {
                  if (leaveTimer.current) {
                    clearTimeout(leaveTimer.current);
                    leaveTimer.current = null;
                  }
                  setHoveredIdx(i);
                }
              }}
            >
              <planeGeometry args={[0.64, 0.82]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
          </group>
        );
      })}
    </>
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
  const lidBloomTex = useLidBloomTexture();
  /* Refs for the closed-laptop premium-polish layers: the wordmark
   *  pulses on a slow breath, the wider bloom behind it pulses on an
   *  out-of-phase slower wave so the glow never feels mechanical,
   *  and the front-edge standby LED pulses on its own subtle wave
   *  so the laptop reads as "in standby" even when fully closed. */
  const lidBrandMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const lidBloomMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const standbyLedMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const screen = useLivingScreen();
  const screenStageRef = useRef(-1);
  /* Crossfade state for MAJOR stage transitions (boot -> streams ->
   * projects -> ready). When a major transition fires, we dip the
   * screen content opacity for ~0.18s, repaint at the dip's midpoint,
   * then ramp back up. Boot-line transitions (1..6) don't trigger the
   * crossfade - those should pop one at a time like a typewriter. */
  const screenCrossfadeRef = useRef<
    | { startT: number; toStage: number; painted: boolean }
    | null
  >(null);
  const softShadowTex = useMemo(() => makeSoftShadowTexture(), []);
  const floorSheenTex = useMemo(() => makeFloorSheenTexture(), []);
  const screenBeamTex = useMemo(() => makeScreenGlowTexture(), []);
  const screenBeamRef = useRef<THREE.Mesh>(null);
  const fogHazeTex = useMemo(() => makeFogHazeTexture(), []);
  const dataRainTex = useMemo(() => makeDataRainTexture(), []);
  /* TEX_VERSION exists ONLY to invalidate Next.js Fast-Refresh's
   * useMemo cache. Bump it whenever makeHexGridTexture's drawing
   * params change (lineWidth, stroke alpha, R, fadeR). With empty
   * deps, an edit to the texture function wouldn't trigger a regen
   * on Fast Refresh — the stale GPU texture stayed bound. Including
   * a version literal in the deps forces useMemo to re-run on save. */
  const HEX_TEX_VERSION = "v4-near-camera-fade";
  const hexFloorTex = useMemo(
    () => makeHexGridTexture(),
    [HEX_TEX_VERSION],
  );
  const hexFloorMatRef = useRef<THREE.MeshBasicMaterial>(null);
  /* Underglow that grounds the laptop with a soft cyan-blue light pool
   * on the floor. Opacity is driven by the screen-ignite curve so the
   * floor only catches light once the screen is alive. */
  const contactGlowTex = useMemo(() => makeContactUnderglowTexture(), []);
  const contactGlowMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const brushedNormalTex = useMemo(() => makeBrushedNormalTexture(), []);
  const parallaxRef = useRef<THREE.Group>(null);
  const lidRef = useRef<THREE.Group>(null);
  const ledMat = useRef<THREE.MeshStandardMaterial>(null);
  const screenContentMat = useRef<THREE.MeshBasicMaterial>(null);
  const screenGlowMat = useRef<THREE.MeshBasicMaterial>(null);
  const keyboardBacklightMat = useRef<THREE.MeshBasicMaterial>(null);
  const screenSpillMat = useRef<THREE.MeshBasicMaterial>(null);
  /* KEYBOARD LIGHT WAVE state: refs to every per-key underglow material
   * (so useFrame can boost opacities), plus a one-shot start-time so
   * the wave fires exactly once as the lid hits its open angle. */
  const keyUnderglowRefs = useRef<
    Array<{ mat: THREE.MeshBasicMaterial | null; tx: number; baseOp: number }>
  >([]);
  const waveStartTimeRef = useRef(-1);
  const particleGroup = useRef<THREE.Group>(null);

  /* Lid hinge spring state - gives the lid mechanical inertia so it
   * overshoots slightly when scroll moves fast then settles, like a
   * real heavy aluminum lid. */
  const lidAngle = useRef(LID_CLOSED_ANGLE);
  const lidVelocity = useRef(0);

  /* Glyph textures (one per character). Particles each pick a random
   * index so the swarm reads as floating data fragments. */
  const glyphTextures = useMemo(() => makeGlyphTextures(), []);

  /* Particle data - reduced from 40 -> 12 in the composition pass. A
   * sparse handful reads as "ambient tech texture" without blanketing
   * the scene. Pushed slightly further out so they stay clear of the
   * laptop's silhouette. */
  const particles = useMemo(() => {
    return Array.from({ length: 12 }, () => ({
      x: (Math.random() - 0.5) * 9,
      y: 0.4 + Math.random() * 2.8,
      z: (Math.random() - 0.5) * 5,
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.6,
      size: 0.08 + Math.random() * 0.06,
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

  /* Cyan side-trim rails down each side of the lid. Refs so we can gate
   * their opacity on lid-open progress — when the laptop is closed the
   * trim should be dark, igniting as the lid lifts. */
  const lidTrimMatLeft = useRef<THREE.MeshBasicMaterial>(null);
  const lidTrimMatRight = useRef<THREE.MeshBasicMaterial>(null);

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
    /* Camera lookAt shifted LEFT of the laptop by 0.55 world units so
     * the chassis sits right-of-centre in the frame, opening up the
     * left third for the headline column. Without this offset the
     * camera framed the laptop dead-centre, which kept the headline
     * physically overlapping the screen content. */
    const LOOKAT_LEFT_SHIFT = 0.55;
    state.camera.lookAt(
      RIG_X - LOOKAT_LEFT_SHIFT + microX * 0.3,
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

    /* Lid hinge - SMOOTH DAMPING with no overshoot. Lid opens fully
     * across Chapter 03 (0.32 -> 0.50). The damped exponential follow
     * trails the scroll target by a beat, so even at the END of the
     * opening window the lid is still settling - which reads as
     * mechanical weight rather than a snap-to. */
    const openT = smoothstep(0.32, 0.5, p);
    const targetAngle = lerp(LID_CLOSED_ANGLE, LID_OPEN_ANGLE, openT);
    const dt = Math.min(0.05, delta);
    const followSpeed = 1 - Math.exp(-10 * dt);
    lidAngle.current = lerp(lidAngle.current, targetAngle, followSpeed);
    lidVelocity.current = 0;
    if (lidRef.current) {
      lidRef.current.rotation.x = lidAngle.current;
    }

    /* Living screen - stage transitions. The minor boot-line stages
     * (1..6) repaint immediately because they're meant to feel like a
     * typewriter. The MAJOR transitions (boot->streams at 6->7,
     * streams->projects at 7->8, projects->ready at 8->9) trigger a
     * brief opacity dip during which the canvas is repainted - the
     * dip masks the otherwise hard content swap. */
    const stage = computeScreenStage(p);
    const prevStage = screenStageRef.current;
    if (stage !== prevStage) {
      const isMajor =
        (prevStage <= 6 && stage >= 7) ||
        (prevStage === 7 && stage === 8) ||
        (prevStage === 8 && stage === 9);
      if (isMajor) {
        screenCrossfadeRef.current = { startT: t, toStage: stage, painted: false };
        // canvas keeps showing prev stage until the dip midpoint
      } else {
        screen.repaint(stage);
      }
      screenStageRef.current = stage;
    }
    /* Compute the crossfade opacity multiplier, doing the repaint at
     * the dip midpoint so the viewer never sees the cut. */
    let stageOpMul = 1.0;
    const cf = screenCrossfadeRef.current;
    if (cf) {
      const elapsed = t - cf.startT;
      const HALF = 0.2;
      if (elapsed < HALF) {
        stageOpMul = 1 - elapsed / HALF;
      } else if (elapsed < HALF * 2) {
        if (!cf.painted) {
          screen.repaint(cf.toStage);
          cf.painted = true;
        }
        stageOpMul = (elapsed - HALF) / HALF;
      } else {
        screenCrossfadeRef.current = null;
      }
    }

    /* Screen ignite - content fades up AFTER the lid lands open
     * (0.50 -> 0.60). Was 0.30 -> 0.50, which started the screen during
     * the lid's motion and made the two beats fight each other. Now
     * the lid lands, the screen is dark for a beat, then ignites. */
    const screenT = smoothstep(0.5, 0.6, p);
    if (screenContentMat.current) {
      screenContentMat.current.transparent = true;
      screenContentMat.current.opacity = screenT * stageOpMul;
    }
    if (screenGlowMat.current) {
      const breathe = 0.9 + Math.sin(t * 1.4) * 0.1;
      screenGlowMat.current.opacity = screenT * 0.08 * breathe * stageOpMul;
    }
    /* Screen-glow spill onto keyboard - tracks screenT so the spill
     * appears in lockstep with the screen content. */
    if (screenSpillMat.current) {
      const breathe = 0.92 + Math.sin(t * 1.1) * 0.08;
      screenSpillMat.current.opacity = screenT * 0.18 * breathe;
    }
    /* Keyboard backlight activation - now comes AFTER the screen has
     * ignited (0.58 -> 0.68). The eye reads the sequence as
     * "screen on -> keys glow on -> wave fires" rather than them all
     * lighting at once. */
    if (keyboardBacklightMat.current) {
      const backlight = smoothstep(0.58, 0.68, p);
      keyboardBacklightMat.current.opacity = backlight * 0.06;
    }

    /* Keyboard light wave - now also gated on the BACKLIGHT being mostly
     * on (and the lid being fully open), so the wave fires after the
     * keys have visibly powered on rather than during the lid motion. */
    if (waveStartTimeRef.current < 0 && openT > 0.85 && p > 0.6) {
      waveStartTimeRef.current = t;
    }
    if (waveStartTimeRef.current >= 0 && keyUnderglowRefs.current.length > 0) {
      const elapsed = t - waveStartTimeRef.current;
      const WAVE_DURATION = 1.6;
      if (elapsed < WAVE_DURATION + 0.4) {
        /* Wave position 0..1.2 (overshoots so the wave fully exits the
         * right edge before the boost is removed). */
        const wavePos = (elapsed / WAVE_DURATION) * 1.2;
        const WAVE_SIGMA = 0.13;
        const WAVE_PEAK = 0.65;
        for (const entry of keyUnderglowRefs.current) {
          if (!entry.mat) continue;
          const dist = entry.tx - wavePos;
          const boost = Math.exp(-(dist * dist) / (2 * WAVE_SIGMA * WAVE_SIGMA)) *
            WAVE_PEAK;
          entry.mat.opacity = Math.min(1, entry.baseOp + boost);
        }
      } else {
        /* Wave done - settle every key to its base opacity. */
        for (const entry of keyUnderglowRefs.current) {
          if (!entry.mat) continue;
          entry.mat.opacity = entry.baseOp;
        }
      }
    }

    /* LED breathing */
    if (ledMat.current) {
      ledMat.current.emissiveIntensity = 1.5 + Math.sin(t * 2.1) * 0.5;
    }

    /* Hex floor opacity dropped AGAIN, hard: 0.18 → 0.10 (peak
     * material alpha). Combined with the text-pocket scrim in
     * HeroCinematic, the floor reads as pure atmosphere — visible
     * just under the chassis as a faint cyan grounding pattern, and
     * almost gone everywhere else. The hierarchy headline > laptop
     * > CTAs > floor is now visually enforced, not just intended. */
    if (hexFloorMatRef.current) {
      const draw = smoothstep(0.18, 0.42, p);
      const pulse = 0.92 + Math.sin(t * 0.9) * 0.06;
      hexFloorMatRef.current.opacity = draw * 0.1 * pulse;
    }
    /* Contact underglow — soft cyan light pool grounding the chassis.
     * Now has a small always-on baseline so the CLOSED laptop reads
     * as a premium product with a faint shadow-and-glow under it, not
     * a model floating on a dark plate. Baseline holds throughout the
     * cinematic; an additional pop layers in when the screen ignites. */
    if (contactGlowMatRef.current) {
      const baseline = 0.07;
      const ignite = smoothstep(0.5, 0.7, p) * 0.12;
      const breathe = 0.9 + Math.sin(t * 1.2) * 0.1;
      contactGlowMatRef.current.opacity = (baseline + ignite) * breathe;
    }

    /* CLOSED-LAPTOP PREMIUM POLISH — three small per-frame pulses
     * that give the dormant device its "alive product" presence:
     *
     *   1. Brand wordmark breathes on a slow 0.85 Hz wave between 70%
     *      and 100% so the logo glow never feels static
     *   2. Soft outer bloom around the wordmark pulses on a SLOWER
     *      out-of-phase wave (0.55 Hz) so the layered glow never
     *      moves in lock-step
     *   3. Front-edge standby LED on its own 0.7 Hz wave at low
     *      amplitude — quiet "standby" tell, not an RGB strip
     *
     * All three run for the whole cinematic; none of them gate on
     * lid-open progress, because their job is to make the CLOSED
     * laptop feel premium. */
    if (lidBrandMatRef.current) {
      const brandBreathe = 0.78 + Math.sin(t * 0.85) * 0.18;
      lidBrandMatRef.current.opacity = brandBreathe;
    }
    if (lidBloomMatRef.current) {
      const bloomBreathe = 0.7 + Math.sin(t * 0.55 + 0.4) * 0.3;
      lidBloomMatRef.current.opacity = 0.32 * bloomBreathe;
    }
    if (standbyLedMatRef.current) {
      const ledBreathe = 0.5 + Math.sin(t * 0.7) * 0.2;
      standbyLedMatRef.current.opacity = ledBreathe;
    }

    /* DATA RAIN scrolls downward via texture offset.y. Slow speed so
     * it reads as ambient drift not a busy strobe. */
    if (dataRainTex) {
      dataRainTex.offset.y = (dataRainTex.offset.y + 0.025 * delta) % 1;
    }

    /* Screen back-light halo - tracks the screen ignite curve
     * (0.50 -> 0.60) so it appears with the screen content, not while
     * the lid is still moving. */
    if (screenBeamRef.current) {
      screenBeamRef.current.lookAt(state.camera.position);
      const mat = screenBeamRef.current.material as THREE.MeshBasicMaterial;
      const breathe = 0.9 + Math.sin(t * 1.3) * 0.1;
      mat.opacity = smoothstep(0.5, 0.6, p) * 0.16 * breathe;
      const s = 1 + smoothstep(0.5, 1, p) * 0.15;
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

    /* Side-trim rails only — gated on lid-open progress so they're
     *  dark when the lid is closed and light up as the lid lifts. The
     *  previous front-edge rolling-wave strip was removed (read as a
     *  cyan bar across the top of the open screen). */
    const lidLitMul = openT * openT;
    if (lidTrimMatLeft.current) lidTrimMatLeft.current.opacity = 0.55 * lidLitMul;
    if (lidTrimMatRight.current) lidTrimMatRight.current.opacity = 0.55 * lidLitMul;

    /* Subject motes intentionally hidden in this pass - 6 floating
     * accent orbs read as visual noise against the cleaner cinematic
     * direction. The on-screen stream dashboard already carries the
     * "6 streams" idea; we don't need motes too. */
    for (let i = 0; i < subjectOrbs.length; i++) {
      const ref = orbRefs.current[i];
      if (ref) {
        const mat = ref.material as THREE.MeshBasicMaterial;
        mat.opacity = 0;
      }
    }
  });

  return (
    <group ref={parallaxRef}>
      {/* Fog haze plane intentionally removed in this pass. Its
       *  cyan-violet radial gradient was bleeding around the laptop
       *  and brightening the floor area; with it gone the floor +
       *  surrounding space stay properly black. */}

      {/* Data rain layer intentionally removed in this pass - it added
       * "tech" texture but competed with the laptop and read as clutter
       * against the cleaner cinematic direction. The fog haze + hex
       * floor alone carry the atmospheric depth now. */}

      {/* DARK BASE FLOOR PLANE - true black with zero metalness and
       *  zero env contribution so the bright analytic lights can't
       *  bounce off it as grey. ENLARGED 60 → 200 units. The 60-unit
       *  edge was visible as a horizon line because the camera's
       *  top-of-frame ray (only ~1.9° below horizontal at this rig)
       *  intersects the floor ~74 world units away — past the old
       *  plane's edge. With 200 units the plane edge sits at ~100
       *  world units, well past any camera ray that could see it. */}
      <mesh
        position={[RIG_X, -BASE_H / 2 - 0.045, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial
          color="#000000"
          roughness={1}
          metalness={0}
          envMapIntensity={0}
        />
      </mesh>

      {/* HEX-PCB FLOOR - single source of truth for the visible floor
       *  pattern.
       *
       *  Previously this slab was a tangle of three coplanar layers
       *  (hex texture tiled 4x4, an orthogonal lineSegments cartesian
       *  grid, a shadow plane) all sitting within 0.012 units of each
       *  other in Y. The hex texture's tile pitch wasn't an integer
       *  divisor of its 512px canvas, so each of its 16 visible tile
       *  joins cut hexes in half and the half-cells overlapped at the
       *  seam — that was the "doubled lines / inconsistent pattern"
       *  the eye picked up. The cartesian line grid on top compounded
       *  the read as "what is this pattern actually?".
       *
       *  New approach:
       *    - Drop the cartesian line grid entirely (was fighting hex)
       *    - One 14x14 plane, sampled once across a 1024px canvas
       *      that bakes its radial alpha mask in (no tiling)
       *    - ClampToEdge so the canvas edge never repeats
       *    - Plane sits a touch below the shadow so the shadow's
       *      soft ellipse paints OVER the floor pattern at the
       *      contact point — keeps the grounding shadow readable
       *      while the hex pattern fills the surrounding floor.
       *
       *  Result: clean engineering grid, vivid near the chassis,
       *  soft natural fade outward, no joins, no doubled lines, no
       *  z-fighting. */}
      {hexFloorTex && (
        <mesh
          position={[RIG_X, -BASE_H / 2 - 0.035, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[36, 36]} />
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

      {/* CONTACT UNDERGLOW — scaled 0.86× from 6.4×4.0 to 5.5×3.44 to
       *  match the new laptop footprint. Otherwise the cyan pool
       *  would visibly extend past the chassis edge. */}
      {contactGlowTex && (
        <mesh
          position={[RIG_X, -BASE_H / 2 - 0.026, 0.18]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[5.5, 3.44]} />
          <meshBasicMaterial
            ref={contactGlowMatRef}
            map={contactGlowTex}
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}

      {/* Soft contact shadow under the laptop. Painted ABOVE the hex
       *  grid and the underglow so the chassis still reads as
       *  physically grounded. Plane scaled 0.86× (5.6×3.6 → 4.82×3.10)
       *  to match the new laptop footprint — otherwise the dark
       *  ellipse would extend a visible halo past the chassis edge. */}
      {softShadowTex && (
        <mesh
          position={[RIG_X, -BASE_H / 2 - 0.018, 0.3]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[4.82, 3.1]} />
          <meshBasicMaterial
            map={softShadowTex}
            transparent
            opacity={1.0}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* (Horizon mist plane removed — a flat 3D plane projects a hard
       *  diagonal top edge from the camera's perspective even when its
       *  texture fades to transparent, producing the dark trapezoid that
       *  was visible at chapter 01. The seam-smoothing job is fully
       *  handled by the CSS dissolve-zone layer in HeroCinematic, which
       *  fades in screen-space and so never projects an edge.) */}

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

      {/* LAPTOP - cinematic asymmetry from a 6° YAW only (Y axis). The
       *  previous build also had a 3° X-tilt which dropped the front of
       *  the chassis below the floor plane and lifted the back, making
       *  the laptop read as floating rather than sitting on the surface.
       *  Yaw alone keeps reflections gliding across the chassis edges
       *  while the chassis stays parallel to the ground. */}
      {/* Laptop scale 0.86 keeps the chassis clear of the headline
       *  column; the contact shadow + underglow planes below are
       *  sized to match. */}
      <group position={[RIG_X, 0, 0]} rotation={[0, -0.11, 0]} scale={0.86}>
        <RoundedBox args={[BASE_W, BASE_H, BASE_D]} radius={0.03} smoothness={5}>
          {/* Chassis matched to the lid's premium satin-aluminium
            * treatment so the lid + base read as one milled body. */}
          <meshPhysicalMaterial
            color={COLORS.steel}
            metalness={0.58}
            roughness={0.46}
            clearcoat={0.42}
            clearcoatRoughness={0.42}
            anisotropy={0.85}
            anisotropyRotation={Math.PI / 2}
            normalMap={brushedNormalTex}
            normalScale={new THREE.Vector2(0.15, 0.15)}
            envMapIntensity={0.78}
          />
        </RoundedBox>

        {/* Keyboard well - recessed dark panel. Bumped offset 0.001 ->
         *  0.005 to give clear depth separation from the chassis top
         *  surface (matches the trackpad fix). */}
        <mesh
          position={[0, BASE_H / 2 + 0.005, -0.15]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[BASE_W * 0.86, BASE_D * 0.55]} />
          <meshStandardMaterial color={COLORS.keyboard} roughness={0.7} />
        </mesh>

        {/* Speaker grilles removed - they read as black blobs flanking
         *  the keyboard at this camera angle, not as ultrabook speakers. */}

        {/* BACKLIT KEYBOARD AMBIENT GLOW - cyan blanket that activates
         *  in Chapter 03 (keyboard "powers on" as the lid finishes
         *  opening). Opacity is driven per-frame from useFrame so the
         *  keyboard is visibly dark when the lid is closed. */}
        <mesh
          position={[0, BASE_H / 2 + 0.002, -0.15]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[BASE_W * 0.82, BASE_D * 0.5]} />
          <meshBasicMaterial
            ref={keyboardBacklightMat}
            color={COLORS.cyan}
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>

        {/* SCREEN-GLOW SPILL onto the keyboard - additive cyan plane
         *  hovering a touch above the keyboard well. Its opacity tracks
         *  the screen-ignite curve, so as the lid opens and the screen
         *  ignites, you see cyan light "spilling" onto the keys (just
         *  like a real laptop's screen casts colour onto its keyboard
         *  in a dim room). Tinted slightly toward the screen with a
         *  vertical gradient via the texture. */}
        <mesh
          position={[0, BASE_H / 2 + 0.0035, -0.2]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[BASE_W * 0.78, BASE_D * 0.46]} />
          <meshBasicMaterial
            ref={screenSpillMat}
            color={"#7df0ff"}
            transparent
            opacity={0}
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

          /* Reset the wave-target registry on each render. Each key
           * gets a unique global index assigned in row-major order so
           * useFrame can update materials without re-allocating. */
          const FULL_KEYBOARD_W = 3.0;
          let globalKeyIdx = 0;
          keyUnderglowRefs.current = [];
          return ROWS.flatMap((row, rIdx) => {
            const totalW =
              row.keys.reduce((s, k) => s + k.w, 0) +
              KEY_GAP * (row.keys.length - 1);
            let cursorX = -totalW / 2;
            return row.keys.map((key, kIdx) => {
              const x = cursorX + key.w / 2;
              cursorX += key.w + KEY_GAP;
              /* Normalised horizontal position 0..1 across the
               * keyboard, used by the light-wave to compute boost. */
              const keyTx = Math.max(
                0,
                Math.min(1, (x + FULL_KEYBOARD_W / 2) / FULL_KEYBOARD_W),
              );
              const myKeyIdx = globalKeyIdx++;
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
                   *  of bleeding to neighbours. Registered with the
                   *  keyUnderglowRefs array so the keyboard light wave
                   *  can pulse this material's opacity as it sweeps. */}
                  <mesh position={[0, -0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[key.w * 1.0, row.depth * 1.0]} />
                    <meshBasicMaterial
                      ref={(el) => {
                        keyUnderglowRefs.current[myKeyIdx] = {
                          mat: el,
                          tx: keyTx,
                          baseOp: glowOp,
                        };
                      }}
                      color={accentColor}
                      transparent
                      opacity={glowOp}
                      blending={THREE.AdditiveBlending}
                      depthWrite={false}
                      toneMapped={false}
                    />
                  </mesh>
                  {/* GLOWING KEY LABEL - white-core letterform sitting on
                   *  a TIGHT column-hue halo. Haze pass dropped to 0.10
                   *  so the cyan accent is a whisper around the core
                   *  letter rather than a soft fuzz that masks it. */}
                  {labelTex && (
                    <>
                      {/* Tight column-hue haze behind the letter */}
                      <mesh
                        position={[0, 0.008, 0]}
                        rotation={[-Math.PI / 2, 0, 0]}
                      >
                        <planeGeometry args={[labelW * 1.06, labelH * 1.06]} />
                        <meshBasicMaterial
                          map={labelTex}
                          transparent
                          opacity={0.1}
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

        {/* Trackpad - bumped vertical offset from +0.001 to +0.008 above
         *  the chassis top. The previous 0.001 gap was small enough that
         *  perspective depth precision z-fought with the chassis top
         *  surface, causing a visible flicker on the trackpad. */}
        <mesh
          position={[0, BASE_H / 2 + 0.008, 0.78]}
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

        {/* HINGE BAR — slim metallic cylinder along the back edge of
         *  the chassis right at the lid-pivot line. Static (does NOT
         *  rotate with the lid) so it reads as the structural hinge
         *  the lid pivots on. Dark satin steel, slightly more reflec-
         *  tive than the chassis so the eye can pick it out as a
         *  separate mechanical part. */}
        <mesh
          position={[0, BASE_H / 2 + 0.002, -BASE_D / 2 + 0.04]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.018, 0.018, LID_W * 0.86, 16]} />
          <meshPhysicalMaterial
            color="#1c2030"
            metalness={0.7}
            roughness={0.38}
            clearcoat={0.5}
            clearcoatRoughness={0.35}
            envMapIntensity={0.9}
          />
        </mesh>
        {/* Hinge end-caps — tiny black washers at each end of the
         *  hinge bar. Reads as the screwed-down hinge mounts. */}
        {[-1, 1].map((side) => (
          <mesh
            key={`hinge-cap-${side}`}
            position={[
              side * (LID_W * 0.43),
              BASE_H / 2 + 0.002,
              -BASE_D / 2 + 0.04,
            ]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.026, 0.026, 0.012, 18]} />
            <meshPhysicalMaterial
              color="#0a0c14"
              metalness={0.55}
              roughness={0.5}
            />
          </mesh>
        ))}

        {/* STANDBY ACCENT LINE — a tiny cyan front-edge sliver on the
         *  base. Always faintly lit (driven by useFrame so it breathes
         *  gently) so the closed laptop reads as a powered-down-but-
         *  alive product, not a static prop. Sized small and placed
         *  near the front-right corner so it never feels like a light
         *  bar. */}
        <mesh
          position={[
            BASE_W / 2 - 0.45,
            -BASE_H / 2 - 0.0015,
            BASE_D / 2 + 0.0015,
          ]}
        >
          <boxGeometry args={[0.18, 0.005, 0.004]} />
          <meshBasicMaterial
            ref={standbyLedMatRef}
            color={COLORS.cyan}
            transparent
            opacity={0.45}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
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
            <RoundedBox args={[LID_W, LID_H, LID_D]} radius={0.025} smoothness={5}>
              {/* Premium satin-brushed aluminium. Bumped metalness +
               *  clearcoat for a tighter, more refined surface; anisotropy
               *  pushed to 0.9 with horizontal rotation so the brush
               *  pattern reads as a real machined grain rather than
               *  generic noise. envMapIntensity slightly higher so the
               *  bevel highlights catch light cleanly. */}
              <meshPhysicalMaterial
                color={COLORS.steel}
                metalness={0.62}
                roughness={0.42}
                clearcoat={0.5}
                clearcoatRoughness={0.38}
                anisotropy={0.9}
                anisotropyRotation={Math.PI / 2}
                normalMap={brushedNormalTex}
                normalScale={new THREE.Vector2(0.16, 0.16)}
                envMapIntensity={0.85}
              />
            </RoundedBox>

            {/* Rolling-wave lid edge strip removed — when the lid
             *  opens, that front edge becomes the top edge of the
             *  visible screen face, and the cyan light bar read as
             *  a gamer-laptop accent rather than a premium product
             *  detail. The side trim rails below stay (they live on
             *  the left/right edges and never sit above the screen). */}

            {/* Cyan trim down each side of the lid — opacity driven
             *  per-frame by useFrame against the lid-open progress so
             *  the trim is dark on a closed laptop. */}
            <mesh
              position={[-LID_W / 2 + 0.003, 0, 0]}
              rotation={[0, 0, 0]}
            >
              <boxGeometry args={[0.006, 0.012, LID_D * 0.88]} />
              <meshBasicMaterial
                ref={lidTrimMatLeft}
                color={COLORS.cyan}
                transparent
                opacity={0}
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
                ref={lidTrimMatRight}
                color={COLORS.cyan}
                transparent
                opacity={0}
                blending={THREE.AdditiveBlending}
                toneMapped={false}
                depthWrite={false}
              />
            </mesh>

            {/* Soft outer bloom plane — wider radial glow that sits
             *  just below the wordmark plate in render order. Slow
             *  out-of-phase breathe so the bloom feels separate from
             *  the wordmark and the laptop never reads as mechanical.
             *  Rendered FIRST so the brand plate paints on top. */}
            {lidBloomTex && (
              <mesh
                position={[0, LID_H / 2 + 0.0005, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <planeGeometry args={[LID_W * 0.82, LID_D * 0.62]} />
                <meshBasicMaterial
                  ref={lidBloomMatRef}
                  map={lidBloomTex}
                  transparent
                  opacity={0.3}
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                  toneMapped={false}
                />
              </mesh>
            )}

            {/* GLOWING BRAND LOGO on the outer lid face. Sized to ~55%
             *  of the lid width so the badge has breathing room around
             *  it. Material ref so useFrame can pulse the wordmark on
             *  a slow breath — gives the closed laptop a quiet "in
             *  standby" presence. */}
            {lidBrandTex && (
              <mesh
                position={[0, LID_H / 2 + 0.001, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <planeGeometry args={[LID_W * 0.55, LID_D * 0.35]} />
                <meshBasicMaterial
                  ref={lidBrandMatRef}
                  map={lidBrandTex}
                  transparent
                  opacity={1}
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

            {/* ACTUAL SCREEN BASE — widened (LID_W*0.86 → LID_W*0.93)
             *  to nearly fill the bezel horizontally. With the laptop
             *  yawed -0.11 rad, the LEFT bezel sits more
             *  perpendicular to the camera and renders at near-full
             *  width while the right is foreshortened — the old 5%
             *  bezel margin appeared as a noticeable dark band on the
             *  left. Modern-ultrabook-thin bezel everywhere is also
             *  closer to where premium laptop design has landed. */}
            <mesh
              position={[0, -LID_H / 2 - 0.001, 0]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[LID_W * 0.93, LID_D * 0.86]} />
              <meshBasicMaterial color="#02030a" toneMapped={false} />
            </mesh>

            {/* Screen CONTENT — matches the new wider screen base. */}
            {screen.tex && (
              <mesh
                position={[0, -LID_H / 2 - 0.0015, 0]}
                rotation={[Math.PI / 2, 0, 0]}
              >
                <planeGeometry args={[LID_W * 0.93, LID_D * 0.86]} />
                <meshBasicMaterial
                  ref={screenContentMat}
                  map={screen.tex}
                  transparent
                  opacity={0}
                  toneMapped={false}
                />
              </mesh>
            )}

            {/* Cyan ambient glow — scaled to match the new screen
             *  size so the additive tint covers the full visible
             *  display area (was 0.84/0.80, now 0.91/0.84). */}
            <mesh
              position={[0, -LID_H / 2 - 0.002, 0]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[LID_W * 0.91, LID_D * 0.84]} />
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

      {/* SCREEN SLABS — three holo panels that emerge straight out of
       *  the screen toward the camera. Rendered OUTSIDE the rotated
       *  laptop group (so they always face the viewer for legibility)
       *  but INSIDE parallaxRef so cursor parallax still applies. */}
      <ScreenSlabs progress={progress} />
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
