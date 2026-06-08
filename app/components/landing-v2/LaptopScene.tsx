"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoundedBox, Environment, Lightformer } from "@react-three/drei";
import {
  EffectComposer,
  Vignette,
  Noise,
  SMAA,
  Bloom,
  N8AO,
  BrightnessContrast,
  HueSaturation,
} from "@react-three/postprocessing";
import { BlendFunction, SMAAPreset } from "postprocessing";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";
import TechChamber from "./TechChamber";

interface LaptopSceneProps {
  progress: MotionValue<number>;
  reducedMotion?: boolean;
  /* Dev-only (/dev/herocap): forces an always-on loop + readable drawing
   * buffer so each scroll position can be captured with canvas.toDataURL
   * for the scroll-scrubbed playback frames. Never set in production. */
  capture?: boolean;
}

const COLORS = {
  ink: "#04050d",
  /* Dark gunmetal aluminium body, matched to the reference product
   * shots: a deep blue-slate anodised finish that reads near-black in
   * shadow and picks up a bright machined sheen on the top edges where
   * the studio rim light grazes it. (Was #7d8294 silver.) The dark base
   * is the intended resting colour now — no "dark -> silver" pop to
   * avoid; the env map only adds subtle reflections on top of the dark
   * diffuse, so first paint and lit paint are both gunmetal. */
  steel: "#2b2f3a",
  steelEdge: "#5a6273",
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

    /* The wordmark is now rendered with NORMAL blending against the
     *  lid surface (was additive — additive cyan on a bright specular
     *  highlight washes out the letters into the highlight). So this
     *  texture is letters-only on a transparent background; the soft
     *  cyan halo around the logo is provided by the separate bloom
     *  plane (still additive) sitting just below this mesh in render
     *  order. Result: letters read crisply regardless of how the lid
     *  is catching the light, while the surrounding glow is unchanged. */

    /* AX chevron — opaque cyan with a tight glow */
    ctx.shadowColor = "rgba(0,245,255,0.85)";
    ctx.shadowBlur = 8;
    ctx.fillStyle = "#a8f5ff";
    ctx.beginPath();
    ctx.moveTo(c.width / 2 - 90, c.height / 2 - 160);
    ctx.lineTo(c.width / 2, c.height / 2 - 220);
    ctx.lineTo(c.width / 2 + 90, c.height / 2 - 160);
    ctx.lineTo(c.width / 2 + 64, c.height / 2 - 160);
    ctx.lineTo(c.width / 2, c.height / 2 - 200);
    ctx.lineTo(c.width / 2 - 64, c.height / 2 - 160);
    ctx.closePath();
    ctx.fill();

    /* Wordmark — solid bright cyan, opaque. Stroke first for a
     *  slightly heavier letterform that holds up against any lid
     *  state; fill on top with the bright body colour. */
    ctx.shadowColor = "rgba(0,229,255,0.65)";
    ctx.shadowBlur = 6;
    ctx.font = "900 180px ui-sans-serif, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeStyle = "#7df0ff";
    ctx.lineWidth = 4;
    ctx.fillStyle = "#b8faff";

    const letters = "ALGORITHMX";
    const spacing = 12;
    const totalW = letters
      .split("")
      .reduce((sum, ch) => sum + ctx.measureText(ch).width + spacing, -spacing);
    let cursorX = c.width / 2 - totalW / 2;
    for (const ch of letters) {
      const w = ctx.measureText(ch).width;
      ctx.strokeText(ch, cursorX + w / 2, c.height / 2 + 20);
      ctx.fillText(ch, cursorX + w / 2, c.height / 2 + 20);
      cursorX += w + spacing;
    }

    /* Thin accent rule under the wordmark — clean nameplate finish */
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(125,240,255,0.75)";
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

/* DECK BADGE — a ThinkPad-X1-style brand badge for the palm rest
 * (front-right of the deck). "Algorithm" in brushed silver with a
 * glowing red dot on the "i", followed by an oversized glowing red
 * "X". Returns TWO textures sharing the exact same layout:
 *   - crisp:  the silver letters + sharp red glyphs (normal-blended)
 *   - glow:   ONLY the red elements, drawn big + blurred + with a hot
 *             pinkish core, so an additive plane on top adds real,
 *             bloom-catching red light (the "brighter light" cue).
 * Both planes share one transform so they register pixel-for-pixel. */
const BADGE_W = 512;
const BADGE_H = 256;
function badgeLayout(ctx: CanvasRenderingContext2D) {
  const x0 = 40;
  const baseY = 188;
  const algoFont = "800 70px ui-sans-serif, system-ui, sans-serif";
  const xFont = "900 156px ui-sans-serif, system-ui, sans-serif";
  ctx.font = algoFont;
  const algoW = ctx.measureText("Algorithm").width;
  const preI = ctx.measureText("Algor").width;
  const iW = ctx.measureText("i").width;
  return {
    x0,
    baseY,
    algoFont,
    xFont,
    algoW,
    dotX: x0 + preI + iW * 0.5,
    dotY: baseY - 52,
    dotR: 7,
    xX: x0 + algoW - 6,
    xY: baseY + 22,
  };
}
function makeDeckBadgeTextures(): {
  crisp: THREE.Texture | null;
  glow: THREE.Texture | null;
} {
  if (typeof document === "undefined") return { crisp: null, glow: null };
  const mk = () => {
    const c = document.createElement("canvas");
    c.width = BADGE_W;
    c.height = BADGE_H;
    const ctx = c.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
    }
    return { c, ctx };
  };

  /* ── crisp layer ── */
  const { c: cc, ctx: cctx } = mk();
  if (!cctx) return { crisp: null, glow: null };
  const L = badgeLayout(cctx);
  /* brushed-silver vertical gradient for the wordmark */
  const silver = cctx.createLinearGradient(0, L.baseY - 56, 0, L.baseY + 6);
  silver.addColorStop(0, "#f2f5fa");
  silver.addColorStop(0.5, "#c2c9d4");
  silver.addColorStop(1, "#9aa2b0");
  cctx.font = L.algoFont;
  cctx.fillStyle = silver;
  cctx.shadowColor = "rgba(8,10,16,0.6)";
  cctx.shadowBlur = 3;
  cctx.shadowOffsetY = 1;
  cctx.fillText("Algorithm", L.x0, L.baseY);
  cctx.shadowOffsetY = 0;
  /* big red X */
  cctx.font = L.xFont;
  cctx.shadowColor = "rgba(255,40,60,0.95)";
  cctx.shadowBlur = 18;
  cctx.fillStyle = "#ff2f40";
  cctx.fillText("X", L.xX, L.xY);
  /* hot core pass so the X reads bright, not flat */
  cctx.shadowBlur = 0;
  cctx.fillStyle = "rgba(255,150,165,0.55)";
  cctx.font = L.xFont;
  cctx.fillText("X", L.xX, L.xY);
  /* red dot on the i */
  cctx.shadowColor = "rgba(255,40,60,0.95)";
  cctx.shadowBlur = 14;
  cctx.fillStyle = "#ff3344";
  cctx.beginPath();
  cctx.arc(L.dotX, L.dotY, L.dotR, 0, Math.PI * 2);
  cctx.fill();
  const crisp = new THREE.CanvasTexture(cc);
  crisp.colorSpace = THREE.SRGBColorSpace;
  crisp.anisotropy = 16;
  crisp.needsUpdate = true;

  /* ── glow layer (red only, big + blurred + hot pink core → blooms) ── */
  const { c: gc, ctx: gctx } = mk();
  if (gctx) {
    gctx.globalCompositeOperation = "lighter";
    /* soft red light pool behind the X */
    const pool = gctx.createRadialGradient(
      L.xX + 70, L.xY - 50, 4,
      L.xX + 70, L.xY - 50, 150,
    );
    pool.addColorStop(0, "rgba(255,60,80,0.55)");
    pool.addColorStop(1, "rgba(255,40,60,0)");
    gctx.fillStyle = pool;
    gctx.fillRect(0, 0, gc.width, gc.height);
    /* blurred red X */
    gctx.shadowColor = "rgba(255,50,70,1)";
    gctx.shadowBlur = 40;
    gctx.font = L.xFont;
    gctx.fillStyle = "#ff5566";
    gctx.fillText("X", L.xX, L.xY);
    /* hot near-white-pink core so it crosses the bloom threshold */
    gctx.shadowBlur = 10;
    gctx.fillStyle = "rgba(255,170,185,0.9)";
    gctx.fillText("X", L.xX, L.xY);
    /* blurred i-dot */
    gctx.shadowColor = "rgba(255,50,70,1)";
    gctx.shadowBlur = 22;
    gctx.fillStyle = "#ff6677";
    gctx.beginPath();
    gctx.arc(L.dotX, L.dotY, L.dotR + 1, 0, Math.PI * 2);
    gctx.fill();
  }
  const glow = new THREE.CanvasTexture(gc);
  glow.colorSpace = THREE.SRGBColorSpace;
  glow.anisotropy = 16;
  glow.needsUpdate = true;

  return { crisp, glow };
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
  /* Two states only now: 0 = dormant (lid closed, screen dark), 1 = the
   * full NEXORA-style orbital dashboard (always on once the lid opens and
   * the screen ignites at ~0.50). The dashboard is static, so it repaints
   * just once on the 0→1 transition. */
  return p < 0.5 ? 0 : 1;
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

/* COSMIC-SWIRL WALLPAPER — the blue tilted-orbital desktop background
 * from the reference product shots. A deep blue core haze, a set of
 * tilted concentric orbit rings (partial arcs so they read as orbits
 * in motion), a bright diagonal cross-flare through a hot centre, and a
 * deterministic particle starfield that fans out along the orbital
 * plane. Painted directly on the screen canvas BELOW the OS narrative,
 * so the laptop matches the photos on load while the boot/dashboard
 * story still plays on top. `intensity` dims the whole wallpaper so it
 * can sit full-strength under the dormant/boot stages and pushed-back
 * under the busy dashboard stages. Fully deterministic (sine-hash) so
 * every repaint and the SSR/reduced-motion bake are identical. */
function paintCosmicSwirl(
  ctx: CanvasRenderingContext2D,
  c: HTMLCanvasElement,
  intensity: number,
) {
  if (intensity <= 0.01) return;
  const cx = c.width * 0.5;
  const cy = c.height * 0.46;
  const tilt = -0.32; // orbital-plane tilt to match the photos
  const hash = (n: number) => {
    const s = Math.sin(n * 127.1) * 43758.5453;
    return s - Math.floor(s);
  };
  ctx.save();

  /* 1. Deep blue core haze pooling at the orbital centre */
  const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, c.width * 0.52);
  core.addColorStop(0, `rgba(30,96,156,${0.5 * intensity})`);
  core.addColorStop(0.28, `rgba(14,52,98,${0.36 * intensity})`);
  core.addColorStop(0.62, `rgba(5,20,44,${0.2 * intensity})`);
  core.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = core;
  ctx.fillRect(0, 0, c.width, c.height);

  /* 2. Tilted concentric orbit rings — partial elliptical arcs */
  ctx.lineCap = "round";
  const rings = 9;
  for (let i = 0; i < rings; i++) {
    const t = (i + 1) / rings;
    const rx = c.width * (0.07 + t * 0.45);
    const ry = rx * (0.3 + 0.1 * Math.sin(i * 1.3));
    const a0 = hash(i * 3.1) * Math.PI * 2;
    const a1 = a0 + Math.PI * (0.65 + hash(i * 7.7) * 1.15);
    const alpha = (0.46 - t * 0.3) * intensity;
    if (alpha <= 0.02) continue;
    /* soft glow underlay */
    ctx.strokeStyle = `rgba(64,182,236,${alpha * 0.5})`;
    ctx.shadowColor = "rgba(46,166,232,0.85)";
    ctx.shadowBlur = 22 * intensity;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, tilt, a0, a1);
    ctx.stroke();
    /* crisp cyan core line */
    ctx.shadowBlur = 0;
    ctx.strokeStyle = `rgba(156,236,255,${alpha})`;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, tilt, a0, a1);
    ctx.stroke();
  }

  /* 3. Bright diagonal cross-flare through the hot centre */
  const flares = [
    { ang: tilt + 0.16, len: c.width * 0.5, w: 3 },
    { ang: tilt + Math.PI / 2 + 0.12, len: c.width * 0.3, w: 2 },
  ];
  ctx.shadowColor = "rgba(150,228,255,0.95)";
  ctx.shadowBlur = 36 * intensity;
  for (const f of flares) {
    const x0 = cx - Math.cos(f.ang) * f.len;
    const y0 = cy - Math.sin(f.ang) * f.len;
    const x1 = cx + Math.cos(f.ang) * f.len;
    const y1 = cy + Math.sin(f.ang) * f.len;
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, "rgba(130,222,255,0)");
    g.addColorStop(0.5, `rgba(206,247,255,${0.85 * intensity})`);
    g.addColorStop(1, "rgba(130,222,255,0)");
    ctx.strokeStyle = g;
    ctx.lineWidth = f.w;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;

  /* 4. Hot core glint */
  const glint = ctx.createRadialGradient(cx, cy, 0, cx, cy, c.width * 0.09);
  glint.addColorStop(0, `rgba(224,250,255,${0.8 * intensity})`);
  glint.addColorStop(0.5, `rgba(124,212,255,${0.28 * intensity})`);
  glint.addColorStop(1, "rgba(124,212,255,0)");
  ctx.fillStyle = glint;
  ctx.fillRect(0, 0, c.width, c.height);

  /* 5. Particle starfield fanning out along the tilted orbital plane */
  for (let i = 0; i < 260; i++) {
    const ang = hash(i * 1.7) * Math.PI * 2;
    const rad = Math.pow(hash(i * 2.3), 0.6) * c.width * 0.5;
    const px = cx + Math.cos(ang + tilt) * rad;
    const py = cy + Math.sin(ang + tilt) * rad * 0.42;
    const b = (1 - rad / (c.width * 0.54)) * intensity;
    if (b <= 0.05) continue;
    const size = hash(i * 5.1) * 1.7 + 0.4;
    ctx.fillStyle = `rgba(${Math.round(180 + hash(i * 9) * 60)},230,255,${
      b * (0.45 + hash(i * 4) * 0.55)
    })`;
    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/* NEXORA-STYLE ORBITAL DASHBOARD — the laptop's on-screen UI (reference 1).
 * A full mission-control layout: top nav bar, left system-status sidebar, a
 * central real-time orbital visualisation (reuses the cosmic-swirl), right-
 * hand SYSTEM HEALTH / MISSION FEED / QUICK ACTIONS panels, and a bottom
 * orbital-parameters strip. Static — painted once when the screen lights. */
function paintOrbitalDashboard(
  ctx: CanvasRenderingContext2D,
  c: HTMLCanvasElement,
) {
  const W = c.width;
  const H = c.height;
  const CY = "#3fd0ff";
  const OK = "#4be08a";
  const DIM = "rgba(205,218,242,0.5)";
  const TXT = "#e9f0ff";

  /* deep navy base */
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#070c18");
  bg.addColorStop(1, "#04070f");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const T = (
    s: string,
    x: number,
    y: number,
    font: string,
    color: string,
    align: CanvasTextAlign = "left",
    baseline: CanvasTextBaseline = "alphabetic",
  ) => {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    ctx.fillText(s, x, y);
  };
  const panel = (x: number, y: number, w: number, h: number) => {
    roundRect(ctx, x, y, w, h, 16);
    ctx.fillStyle = "rgba(9,15,28,0.9)";
    ctx.fill();
    ctx.strokeStyle = "rgba(90,150,220,0.22)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  };
  const dot = (x: number, y: number, r: number, col: string) => {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  };

  /* central orbital visualisation, clipped to the centre column */
  ctx.save();
  ctx.beginPath();
  ctx.rect(372, 150, 1010, 880);
  ctx.clip();
  paintCosmicSwirl(ctx, c, 1.0);
  ctx.restore();

  /* centre labels over the viz */
  T("ORBITAL OVERVIEW", 410, 224, `700 46px ${FONT_SANS}`, TXT);
  dot(424, 258, 7, CY);
  T("REAL-TIME VIEW", 442, 266, `600 20px ${FONT_MONO}`, CY);
  T("CORE", 928, 432, `600 20px ${FONT_MONO}`, DIM);
  T("ENERGY OUTPUT", 928, 462, `500 17px ${FONT_MONO}`, DIM);
  T("98.7%", 928, 500, `700 30px ${FONT_SANS}`, CY);

  /* ---------- TOP BAR ---------- */
  ctx.fillStyle = "rgba(6,11,22,0.92)";
  ctx.fillRect(0, 0, W, 104);
  ctx.strokeStyle = "rgba(90,150,220,0.18)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 104);
  ctx.lineTo(W, 104);
  ctx.stroke();
  ctx.strokeStyle = CY;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(80, 52, 16, 0, Math.PI * 2);
  ctx.stroke();
  dot(80, 52, 5, CY);
  T("ALGORITHMX", 112, 63, `700 30px ${FONT_SANS}`, TXT);
  const tabs = ["OVERVIEW", "SYSTEMS", "NETWORK", "ANALYTICS", "LOGS"];
  let tx = 720;
  tabs.forEach((tb, i) => {
    const active = i === 0;
    T(tb, tx, 60, `600 20px ${FONT_MONO}`, active ? TXT : DIM);
    ctx.font = `600 20px ${FONT_MONO}`;
    const w = ctx.measureText(tb).width;
    if (active) {
      ctx.fillStyle = CY;
      ctx.fillRect(tx, 78, w, 3);
    }
    tx += w + 54;
  });
  T("SYS-07", W - 80, 60, `600 20px ${FONT_MONO}`, CY, "right");
  dot(W - 196, 52, 9, CY);
  ctx.strokeStyle = DIM;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(W - 300, 50, 9, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(W - 293, 57);
  ctx.lineTo(W - 285, 65);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(W - 246, 50, 9, Math.PI, Math.PI * 2);
  ctx.stroke();

  /* ---------- LEFT SIDEBAR ---------- */
  panel(36, 128, 312, 1064);
  T("SYSTEM STATUS", 66, 186, `600 16px ${FONT_MONO}`, DIM);
  T("100%", 66, 248, `700 56px ${FONT_SANS}`, CY);
  T("OPERATIONAL", 66, 282, `600 15px ${FONT_MONO}`, DIM);
  /* mini waveform */
  ctx.strokeStyle = CY;
  ctx.lineWidth = 2;
  ctx.beginPath();
  const wy = 320;
  for (let i = 0; i <= 40; i++) {
    const x = 66 + i * 6;
    const yy = wy + Math.sin(i * 0.9) * (i % 7 === 0 ? 14 : 6);
    if (i === 0) ctx.moveTo(x, yy);
    else ctx.lineTo(x, yy);
  }
  ctx.stroke();
  /* nav list */
  const nav = [
    "DASHBOARD",
    "ORBITAL MAP",
    "ASSETS",
    "MISSIONS",
    "CONFIGURATION",
    "SECURITY",
    "REPORTS",
  ];
  let ny = 392;
  nav.forEach((n, i) => {
    const active = i === 0;
    if (active) {
      roundRect(ctx, 52, ny - 30, 280, 52, 10);
      ctx.fillStyle = "rgba(63,208,255,0.12)";
      ctx.fill();
      ctx.fillStyle = CY;
      ctx.fillRect(52, ny - 30, 4, 52);
    }
    /* little square glyph */
    ctx.strokeStyle = active ? CY : DIM;
    ctx.lineWidth = 2;
    ctx.strokeRect(72, ny - 12, 18, 18);
    T(n, 108, ny + 4, `600 19px ${FONT_MONO}`, active ? TXT : DIM);
    ny += 68;
  });
  /* system time */
  T("SYSTEM TIME", 66, 1110, `600 15px ${FONT_MONO}`, DIM);
  T("23:47:12", 66, 1152, `700 34px ${FONT_SANS}`, CY);
  T("UTC −00:00", 66, 1180, `500 15px ${FONT_MONO}`, DIM);

  /* ---------- RIGHT: SYSTEM HEALTH ---------- */
  const rx = W - 36 - 600;
  const rw = 600;
  panel(rx, 128, rw, 420);
  T("SYSTEM HEALTH", rx + 30, 184, `600 18px ${FONT_MONO}`, TXT);
  T("×", rx + rw - 34, 188, `500 26px ${FONT_SANS}`, DIM, "right");
  /* gauge */
  const gx = rx + 130;
  const gy = 330;
  const gr = 76;
  ctx.lineWidth = 16;
  ctx.strokeStyle = "rgba(90,150,220,0.18)";
  ctx.beginPath();
  ctx.arc(gx, gy, gr, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = CY;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(gx, gy, gr, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * 0.999);
  ctx.stroke();
  ctx.lineCap = "butt";
  T("100%", gx, gy - 4, `700 36px ${FONT_SANS}`, TXT, "center", "middle");
  T("OPTIMAL", gx, gy + 30, `600 14px ${FONT_MONO}`, DIM, "center", "middle");
  /* metric list */
  const metrics = ["POWER", "SHIELDS", "ENGINES", "COMMS"];
  let my = 270;
  metrics.forEach((m) => {
    dot(gx + 130, my - 6, 5, CY);
    T(m, gx + 150, my, `600 18px ${FONT_MONO}`, DIM);
    T("100%", rx + rw - 30, my, `700 20px ${FONT_SANS}`, TXT, "right");
    my += 44;
  });

  /* ---------- RIGHT: MISSION FEED ---------- */
  panel(rx, 568, rw, 380);
  T("MISSION FEED", rx + 30, 624, `600 18px ${FONT_MONO}`, TXT);
  T("×", rx + rw - 34, 628, `500 26px ${FONT_SANS}`, DIM, "right");
  const feed = [
    ["23:46:58", "System check complete"],
    ["23:46:31", "All nodes operational"],
    ["23:46:02", "Data synchronization complete"],
  ];
  let fy = 690;
  feed.forEach(([time, msg]) => {
    dot(rx + 36, fy + 6, 5, OK);
    T(time, rx + 56, fy, `600 16px ${FONT_MONO}`, CY);
    T(msg, rx + 56, fy + 30, `500 18px ${FONT_SANS}`, "rgba(225,233,250,0.82)");
    fy += 78;
  });
  T("VIEW ALL", rx + rw / 2, 922, `700 16px ${FONT_MONO}`, CY, "center");

  /* ---------- RIGHT: QUICK ACTIONS ---------- */
  panel(rx, 968, rw, 224);
  T("QUICK ACTIONS", rx + 30, 1024, `600 18px ${FONT_MONO}`, TXT);
  const actions = ["SCAN", "PING", "SYNC"];
  const bw = (rw - 60 - 40) / 3;
  actions.forEach((a, i) => {
    const bx = rx + 30 + i * (bw + 20);
    const by = 1060;
    roundRect(ctx, bx, by, bw, 96, 12);
    ctx.fillStyle = "rgba(63,208,255,0.08)";
    ctx.fill();
    ctx.strokeStyle = "rgba(63,208,255,0.3)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.strokeStyle = CY;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(bx + bw / 2, by + 36, 13, 0, Math.PI * 2);
    ctx.stroke();
    T(a, bx + bw / 2, by + 78, `700 16px ${FONT_MONO}`, TXT, "center");
  });

  /* ---------- BOTTOM: ORBITAL PARAMETERS ---------- */
  panel(372, 1064, 1010, 128);
  T("ORBITAL PARAMETERS", 402, 1104, `600 15px ${FONT_MONO}`, DIM);
  const params: [string, string][] = [
    ["ALTITUDE", "35,786 km"],
    ["VELOCITY", "7.67 km/s"],
    ["INCLINATION", "98.2°"],
    ["PERIOD", "92.7 min"],
  ];
  const pcw = 1010 / 4;
  params.forEach(([k, v], i) => {
    const px = 402 + i * pcw;
    T(k, px, 1144, `500 15px ${FONT_MONO}`, DIM);
    T(v, px, 1178, `700 26px ${FONT_SANS}`, TXT);
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
    /* Dormant (lid closed): a dim orbital wallpaper + a tiny power dot so
     * the screen reads as an idle desktop, not a broken display. */
    paintCosmicSwirl(ctx, canvas, 0.5);
    ctx.fillStyle = "rgba(0,245,255,0.55)";
    ctx.shadowColor = "rgba(0,245,255,0.9)";
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(96, 90, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    return;
  }
  /* Lit: the full orbital dashboard, always on. */
  paintOrbitalDashboard(ctx, canvas);
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

/* ──────────────────────────────────────────────────────────────────────
 * ALGORITHMX CORE — environment textures (replaces the old hex grid).
 *
 * The floor is no longer a hex field. It is a precision-machined POLAR
 * INSTRUMENT PLATE centred under the laptop: a few asymmetric, segmented
 * engineered rings, ~16 radial circuit CHANNELS that conduct light inward
 * toward the device, encoder ticks, via nodes, and a couple of deliberate
 * VOID-GAP sectors cut clean through the plate so the haze / strata / true
 * void read beneath it. Everything is additive + self-lit (no scene lights
 * touch it → the laptop render is untouched). Bloom is faked with baked
 * canvas shadowBlur (real Bloom crashes this drei/three combo).
 *
 * Three variants share this one generator so the whole platform is just a
 * couple of canvas allocations:
 *   - "surface": the crisp top plate (rings + channels + ticks + via + core)
 *   - "soft":    a larger, blurred-only GHOST of the plate for the mid
 *                parallax stratum (atmospheric perspective beneath)
 *   - "deep":    only the faint outer arc fragments for the deepest stratum
 *
 * Determinism: every "random" placement is a fixed sine-hash so SSR and the
 * reduced-motion static bake are identical every mount. */
/* Shared quality tuning for the additive GROUND/ENVIRONMENT textures. These
 * planes are viewed at a very shallow (near edge-on) camera angle, so without
 * anisotropic filtering they minify into a blurry/aliased smear toward the
 * far edge. Max anisotropy + trilinear mipmaps keep the rings, circuit lines
 * and haze crisp at distance. (Laptop-grounding textures are deliberately
 * NOT routed through this — they're part of the locked laptop look.) */
function tuneGroundTexture(tex: THREE.Texture): void {
  tex.anisotropy = 16;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
}

/* PLATFORM SUBSTRATE — dense machined gunmetal the reactor arcs are recessed
 * into. Concentric PANEL BANDS divided into plates by radial seams, each plate
 * tone-varied with a lit outer rim + dark inner shadow, sparse inset greebles
 * and tiny embedded light dots. NORMAL-blended so it paints real darks (the
 * manufactured detail in the reference). */
function makePlatformSubstrateTexture(): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  const S = 2048;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, S, S);
  const cx = S / 2;
  const cy = S / 2;
  const Rmax = S * 0.46;
  const hash = (n: number) => {
    const s = Math.sin(n * 127.1) * 43758.5453;
    return s - Math.floor(s);
  };

  /* CLEAN DEEP-NAVY SURFACE — a smooth dark base the flowing ribbons sit
   * on (replaces the old concentric machined-plate circuitry, which
   * clashed with the new ribbon floor). Deep navy at the centre, fading
   * to transparent before the edge so the platform still reads as
   * suspended over the void, with a faint cooler pool under the chassis. */
  const base = ctx.createRadialGradient(cx, cy, 0, cx, cy, Rmax * 1.04);
  base.addColorStop(0, "rgba(16,26,46,0.96)");
  base.addColorStop(0.45, "rgba(10,17,33,0.9)");
  base.addColorStop(0.78, "rgba(5,9,20,0.6)");
  base.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, S, S);

  /* very faint cool sheen pooling under the chassis */
  const sheen = ctx.createRadialGradient(cx, cy, 0, cx, cy, S * 0.3);
  sheen.addColorStop(0, "rgba(40,90,150,0.12)");
  sheen.addColorStop(1, "rgba(40,90,150,0)");
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, S, S);

  /* extremely subtle concentric brushed tone — low contrast, no plates,
   * just enough to keep the dark surface from banding flat. */
  for (let i = 0; i < 22; i++) {
    const r = (i / 22) * Rmax;
    const v = i % 2 ? 22 : 8;
    ctx.strokeStyle = `rgba(${v},${v + 8},${v + 20},0.04)`;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  void hash;

  /* near-camera fade */
  ctx.globalCompositeOperation = "destination-out";
  const ncf = ctx.createLinearGradient(0, 0, 0, S);
  ncf.addColorStop(0.0, "rgba(0,0,0,0)");
  ncf.addColorStop(0.52, "rgba(0,0,0,0)");
  ncf.addColorStop(0.66, "rgba(0,0,0,0.6)");
  ncf.addColorStop(0.8, "rgba(0,0,0,0.92)");
  ncf.addColorStop(1.0, "rgba(0,0,0,1)");
  ctx.fillStyle = ncf;
  ctx.fillRect(0, 0, S, S);
  ctx.globalCompositeOperation = "source-over";

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tuneGroundTexture(tex);
  tex.needsUpdate = true;
  return tex;
}

/* REACTOR ARCS (illumination) — concentric arc-SEGMENT rings glowing in a
 * disciplined cyan -> electric-blue -> sparse-violet family (NO white cores).
 * Brightest in a mid radius band, fading inner + outer, with dotted tech
 * segments on some arcs and a fine concentric hub. Additive; sits inside the
 * substrate grooves. The "soft" / "deep" variants are blurred ghosts for the
 * parallax strata. */
function makeInstrumentPlateTexture(
  variant: "surface" | "soft" | "deep" = "surface",
): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  const S = 2048;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, S, S);
  const soft = variant === "soft";
  const deep = variant === "deep";
  const cx = S / 2;
  const cy = S / 2;
  const Rmax = S * (deep ? 0.46 : soft ? 0.42 : 0.4);
  const hash = (n: number) => {
    const s = Math.sin(n * 127.1) * 43758.5453;
    return s - Math.floor(s);
  };
  /* FLOWING-RIBBON ENERGY FLOOR — smooth, glowing, organically-drifting
   * elliptical light ribbons sweeping around the chassis (replaces the
   * busy segmented-ring/circuitry plate). Few, thick, smooth and bloom-
   * fed so the floor reads as a high-end "energy chamber" surface, not a
   * reticle. Deterministic (sine-hash) so SSR + reduced-motion bakes are
   * identical. */

  /* central energy pool under the chassis — brighter blue-white core */
  if (!deep) {
    const pool = ctx.createRadialGradient(cx, cy, 0, cx, cy, S * 0.24);
    pool.addColorStop(0, soft ? "rgba(80,185,255,0.12)" : "rgba(130,212,255,0.3)");
    pool.addColorStop(0.42, soft ? "rgba(40,130,255,0.05)" : "rgba(48,150,255,0.13)");
    pool.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = pool;
    ctx.fillRect(0, 0, S, S);
  }

  ctx.lineCap = "round";
  const glow = (blur: number, col: string) => {
    ctx.shadowColor = col;
    ctx.shadowBlur = blur;
  };
  const noGlow = () => {
    ctx.shadowBlur = 0;
  };

  const N = deep ? 7 : soft ? 9 : 12;
  const baseTilt = -0.18; // shared tilt so the outer bands read as a family
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    /* fairly even spacing so the outer bands space like a parallel family */
    const rN = 0.12 + Math.pow(t, 1.05) * 0.92;
    const rx = rN * Rmax;
    /* HYBRID: round/concentric near the centre → progressively FLAT,
     * elongated parallel bands toward the edges (the reference's
     * curved-wall flow). `flat` runs 0 (inner) → 1 (outer). */
    const flat = smoothstep(0.25, 0.85, rN);
    const squash = lerp(0.6, 0.15, flat);
    const ry = rx * squash;
    /* per-ribbon centre drift shrinks outward so the flat outer bands
     * nest as near-parallel streaks; inner ones keep an organic offset. */
    const driftA = hash(i * 7.1) * Math.PI * 2;
    const driftR = (hash(i * 2.9) - 0.5) * S * 0.05 * (1 - flat * 0.7);
    const ex = cx + Math.cos(driftA) * driftR;
    const ey = cy + Math.sin(driftA) * driftR * 0.4;
    /* tilt converges to the shared base tilt outward (parallel family) */
    const rot = baseTilt + (hash(i * 5.7) - 0.5) * 0.32 * (1 - flat * 0.6);
    /* longer arcs toward the edges so the flat bands sweep right across */
    const a0 = hash(i * 4.3) * Math.PI * 2;
    const a1 = a0 + Math.PI * (1.0 + hash(i * 9.2) * 0.6 + flat * 0.45);
    const a = (1 - rN * 0.5) * (soft ? 0.6 : deep ? 0.42 : 1.0);
    if (a < 0.03) continue;
    /* palette: mostly cyan/blue with sparse violet accents */
    const isViolet = i === 3 || i === 8;
    const isBlue = i % 3 === 1;
    const rgb = isViolet ? "138,108,255" : isBlue ? "46,128,255" : "40,206,255";
    const lite = isViolet ? "196,176,255" : isBlue ? "170,212,255" : "160,238,255";
    /* soft wide glow underlay (bloom feeds on this) */
    ctx.strokeStyle = `rgba(${rgb},${a * (soft ? 0.5 : 0.42)})`;
    ctx.lineWidth = soft ? 8 : deep ? 5 : 6;
    glow(soft ? 15 : 11, `rgba(${rgb},0.95)`);
    ctx.beginPath();
    ctx.ellipse(ex, ey, rx, ry, rot, a0, a1);
    ctx.stroke();
    noGlow();
    if (!soft && !deep) {
      /* crisp colour body */
      ctx.strokeStyle = `rgba(${rgb},${a})`;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.ellipse(ex, ey, rx, ry, rot, a0, a1);
      ctx.stroke();
      /* bright inner core for the hot centre of the ribbon */
      ctx.strokeStyle = `rgba(${lite},${a * 0.85})`;
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.ellipse(ex, ey, rx, ry, rot, a0, a1);
      ctx.stroke();
    }
  }

  /* CROSS-FLOW STREAKS — a few long smooth sweeping light trails for the
   * "data in motion" read, kept subtle so they support, not clutter. */
  if (!deep) {
    const streaks = soft ? 2 : 3;
    for (let i = 0; i < streaks; i++) {
      const yy = cy + (hash(i * 13.1) - 0.5) * S * 0.5;
      const amp = S * (0.08 + hash(i * 6.3) * 0.1);
      const col = i % 2 ? "46,128,255" : "40,206,255";
      ctx.strokeStyle = `rgba(${col},${soft ? 0.14 : 0.26})`;
      ctx.lineWidth = soft ? 5 : 3.5;
      glow(soft ? 10 : 8, `rgba(${col},0.9)`);
      ctx.beginPath();
      ctx.moveTo(-S * 0.05, yy);
      ctx.quadraticCurveTo(cx, yy - amp, S * 1.05, yy + amp * 0.4);
      ctx.stroke();
      noGlow();
    }
  }

  /* bright centre core glint (surface) */
  if (!soft && !deep) {
    const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, S * 0.06);
    core.addColorStop(0, "rgba(184,240,255,0.6)");
    core.addColorStop(0.5, "rgba(96,194,255,0.2)");
    core.addColorStop(1, "rgba(96,194,255,0)");
    ctx.fillStyle = core;
    ctx.fillRect(0, 0, S, S);
  }

  /* near-camera fade */
  ctx.globalCompositeOperation = "destination-out";
  const ncf = ctx.createLinearGradient(0, 0, 0, S);
  ncf.addColorStop(0.0, "rgba(0,0,0,0)");
  ncf.addColorStop(0.52, "rgba(0,0,0,0)");
  ncf.addColorStop(0.66, "rgba(0,0,0,0.6)");
  ncf.addColorStop(0.8, "rgba(0,0,0,0.92)");
  ncf.addColorStop(1.0, "rgba(0,0,0,1)");
  ctx.fillStyle = ncf;
  ctx.fillRect(0, 0, S, S);
  ctx.globalCompositeOperation = "source-over";

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tuneGroundTexture(tex);
  tex.needsUpdate = true;
  return tex;
}

function makeMegastructureTexture(): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  const W = 1024;
  const H = 512;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  ctx.clearRect(0, 0, W, H);
  ctx.lineCap = "round";
  // right-biased centre for the distant ring
  const mx = W * 0.66;
  const my = H * 0.92;
  ctx.shadowColor = "rgba(0,229,255,0.7)";
  // a few faint concentric arc fragments
  const arcs = [
    { r: 150, a0: -2.4, a1: -0.9, a: 0.1 },
    { r: 210, a0: -2.2, a1: -1.4, a: 0.07 },
    { r: 270, a0: -2.6, a1: -1.8, a: 0.05 },
    { r: 120, a0: -1.6, a1: -0.5, a: 0.08 },
  ];
  for (const arc of arcs) {
    ctx.strokeStyle = `rgba(0,229,255,${arc.a})`;
    ctx.lineWidth = 2.2;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(mx, my, arc.r, arc.a0, arc.a1);
    ctx.stroke();
  }
  // a couple of thin distant spires (violet-tinted secondary accent)
  const spires = [
    { x: W * 0.5, top: H * 0.42, a: 0.05 },
    { x: W * 0.78, top: H * 0.5, a: 0.045 },
    { x: W * 0.6, top: H * 0.55, a: 0.04 },
  ];
  for (const sp of spires) {
    ctx.strokeStyle = `rgba(124,92,255,${sp.a})`;
    ctx.lineWidth = 1.6;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(sp.x, my);
    ctx.lineTo(sp.x, sp.top);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tuneGroundTexture(tex);
  tex.needsUpdate = true;
  return tex;
}

/* Small additive glow sprite used for the inward-travelling SIGNAL PACKETS
 * that ride the radial channels toward the laptop. A soft cyan core with a
 * near-white centre — the motion conveys direction, so the sprite itself is
 * a simple round glow (orientation-free). */
function makeSignalPacketTexture(): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  const S = 128;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  ctx.clearRect(0, 0, S, S);
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, "rgba(220,250,255,1)");
  g.addColorStop(0.3, "rgba(0,229,255,0.7)");
  g.addColorStop(1, "rgba(0,229,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tuneGroundTexture(tex);
  tex.needsUpdate = true;
  return tex;
}

/* Sub-surface MACHINE WELL — sits just beneath the instrument plate to give
 * the burst zone real depth: a soft recessed central well (darker core
 * ringed by a faint glow) plus a few concentric structural rings at a
 * DIFFERENT scale to the surface, so looking "into" the platform you sense a
 * more complex machine below the top plane. Additive + low opacity so it
 * reads as a glowing structural layer, never muddy. */
function makeMachineWellTexture(): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  const S = 1024;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  ctx.clearRect(0, 0, S, S);
  const cx = S / 2;
  const cy = S / 2;
  const hash = (n: number) => {
    const s = Math.sin(n * 127.1) * 43758.5453;
    return s - Math.floor(s);
  };
  /* soft recessed well — a faint ring of glow around a darker core */
  const well = ctx.createRadialGradient(cx, cy, 0, cx, cy, S * 0.34);
  well.addColorStop(0, "rgba(0,180,255,0.0)");
  well.addColorStop(0.55, "rgba(0,200,255,0.10)");
  well.addColorStop(0.78, "rgba(0,160,255,0.05)");
  well.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = well;
  ctx.fillRect(0, 0, S, S);
  /* concentric structural rings (different scale from the surface plate) */
  ctx.lineCap = "round";
  const rings = [0.2, 0.31, 0.45, 0.6];
  for (let i = 0; i < rings.length; i++) {
    const r = rings[i] * S * 0.5;
    const a = (1 - rings[i]) * 0.16;
    ctx.strokeStyle = `rgba(0,210,255,${a})`;
    ctx.lineWidth = i % 2 ? 1.0 : 1.8;
    ctx.shadowColor = "rgba(0,210,255,0.7)";
    ctx.shadowBlur = 6;
    ctx.beginPath();
    /* break each into a couple of arcs so it reads as engineered, not a disc */
    const segs = 3 + (i % 2);
    for (let s = 0; s < segs; s++) {
      const span = (Math.PI * 2) / segs;
      const j = (hash(i * 5.1 + s) - 0.5) * span * 0.3;
      ctx.beginPath();
      ctx.arc(cx, cy, r, s * span + j + 0.12, (s + 1) * span + j - 0.12);
      ctx.stroke();
    }
  }
  ctx.shadowBlur = 0;
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tuneGroundTexture(tex);
  tex.needsUpdate = true;
  return tex;
}

/* Volumetric depth haze — a single soft radial cyan-blue glow that sits
 * LOW inside the hex well, between the mid and deep strata. Drawn additive
 * at very low opacity so the gap beneath the floating surface reads as
 * luminous fog / atmosphere rather than empty black. This is what gives the
 * "space / void visible beneath" feel without adding any geometry. */
function makeDepthHazeTexture(): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  ctx.clearRect(0, 0, 512, 512);
  const g = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
  g.addColorStop(0, "rgba(40,180,255,0.5)");
  g.addColorStop(0.45, "rgba(20,120,220,0.18)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tuneGroundTexture(tex);
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

const SLAB_STREAM_ICONS: ReadonlyArray<string> = ["⛨", "❖", "▣"];

/* Per-card HUD metadata (reference 2): category label, blurb, a progress
 * bar value, level and duration. Indexed by the STREAMS array so the right
 * data lands on whichever streams the hero surfaces. */
type SlabMeta = {
  category: string;
  desc: string;
  progress: number;
  level: string;
  duration: string;
};
const SLAB_CARD_META: ReadonlyArray<SlabMeta> = [
  { category: "CYBER SECURITY", desc: "Learn to protect systems, analyze threats, and secure the digital world.", progress: 72, level: "Intermediate", duration: "12 Weeks" },
  { category: "GAME DEVELOPMENT", desc: "Design mechanics, animate pixel art, and ship a game people play.", progress: 40, level: "Beginner", duration: "14 Weeks" },
  { category: "AI & MACHINE LEARNING", desc: "Master AI foundations, machine learning, and build smart systems.", progress: 48, level: "Advanced", duration: "16 Weeks" },
  { category: "APP DEVELOPMENT", desc: "Build production-ready apps and solve real-world problems.", progress: 30, level: "Advanced", duration: "10 Weeks" },
  { category: "ENTREPRENEURSHIP", desc: "Validate ideas, craft a pitch, and launch a real business.", progress: 24, level: "Intermediate", duration: "12 Weeks" },
  { category: "ROBOTICS", desc: "Wire sensors and motors, then code robots that move.", progress: 20, level: "Beginner", duration: "12 Weeks" },
];

function makeSlabTexture(
  stream: (typeof STREAMS)[number],
  icon: string,
  meta: SlabMeta,
): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = 420;
  c.height = 540;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  const W = c.width;
  const H = c.height;
  const PAD = 30;

  const accent = stream.color;
  const rgb = hexToRgbStr(accent);

  /* Dark glass panel with a faint accent wash from the top corner */
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, "rgba(8,12,22,0.9)");
  bgGrad.addColorStop(1, "rgba(3,5,12,0.92)");
  ctx.fillStyle = bgGrad;
  roundRect(ctx, 0, 0, W, H, 20);
  ctx.fill();
  const wash = ctx.createRadialGradient(W * 0.5, 80, 20, W * 0.5, 80, W * 0.9);
  wash.addColorStop(0, `rgba(${rgb},0.16)`);
  wash.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, W, H);

  /* Glowing accent border */
  ctx.lineWidth = 2;
  ctx.strokeStyle = `rgba(${rgb},0.85)`;
  ctx.shadowColor = accent;
  ctx.shadowBlur = 18;
  roundRect(ctx, 4, 4, W - 8, H - 8, 17);
  ctx.stroke();
  ctx.shadowBlur = 0;

  /* Corner brackets on all four corners (HUD tell) */
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2.5;
  ctx.shadowColor = accent;
  ctx.shadowBlur = 8;
  const b = 26;
  const m = 16;
  ctx.beginPath();
  ctx.moveTo(m, m + b); ctx.lineTo(m, m); ctx.lineTo(m + b, m);
  ctx.moveTo(W - m - b, m); ctx.lineTo(W - m, m); ctx.lineTo(W - m, m + b);
  ctx.moveTo(m, H - m - b); ctx.lineTo(m, H - m); ctx.lineTo(m + b, H - m);
  ctx.moveTo(W - m - b, H - m); ctx.lineTo(W - m, H - m); ctx.lineTo(W - m, H - m - b);
  ctx.stroke();
  ctx.shadowBlur = 0;

  /* Hexagon icon (top-left) with a short circuit-line tail */
  const hx = PAD + 26;
  const hy = 70;
  const hr = 26;
  const hexPath = (cx: number, cy: number, r: number) => {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI / 2 + i * (Math.PI / 3);
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  };
  hexPath(hx, hy, hr);
  ctx.fillStyle = `rgba(${rgb},0.14)`;
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.shadowColor = accent;
  ctx.shadowBlur = 12;
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.font = `600 24px ${FONT_SANS}`;
  ctx.fillStyle = accent;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(icon, hx, hy + 1);
  /* circuit tail */
  ctx.strokeStyle = `rgba(${rgb},0.5)`;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(hx + hr + 4, hy);
  ctx.lineTo(hx + hr + 40, hy);
  ctx.lineTo(hx + hr + 52, hy - 12);
  ctx.stroke();
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(hx + hr + 52, hy - 12, 3, 0, Math.PI * 2);
  ctx.fill();

  /* Status badge (top-right) — filled for LIVE, outlined for COMING */
  const isLive = stream.status === "LIVE";
  const badge = isLive ? "LIVE NOW" : `COMING ${stream.status}`;
  ctx.font = `700 14px ${FONT_MONO}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  const dotW = isLive ? 16 : 0;
  const bw = ctx.measureText(badge).width + 24 + dotW;
  const bh = 30;
  const bx = W - PAD - bw;
  const by = 56;
  roundRect(ctx, bx, by, bw, bh, 15);
  if (isLive) {
    ctx.fillStyle = `rgba(${rgb},0.18)`;
    ctx.fill();
  }
  ctx.strokeStyle = `rgba(${rgb},0.7)`;
  ctx.lineWidth = 1.4;
  ctx.stroke();
  let btx = bx + 14;
  if (isLive) {
    ctx.fillStyle = accent;
    ctx.shadowColor = accent;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(btx, by + bh / 2, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    btx += dotW;
  }
  ctx.fillStyle = accent;
  ctx.fillText(badge, btx, by + bh / 2 + 1);

  /* Title (the outcome) — 2-line balanced split, auto-fit */
  const words = stream.outcome.split(" ");
  let lines: string[];
  if (words.length <= 2) {
    lines = words;
  } else {
    ctx.font = `800 40px ${FONT_SANS}`;
    let bestSplit = Math.ceil(words.length / 2);
    let bestDelta = Infinity;
    for (let i = 1; i < words.length; i++) {
      const a = words.slice(0, i).join(" ");
      const bb = words.slice(i).join(" ");
      const d = Math.abs(ctx.measureText(a).width - ctx.measureText(bb).width);
      if (d < bestDelta) { bestDelta = d; bestSplit = i; }
    }
    lines = [words.slice(0, bestSplit).join(" "), words.slice(bestSplit).join(" ")];
  }
  let size = 38;
  const maxW = W - PAD * 2;
  while (size > 22 && lines.some((ln) => {
    ctx.font = `800 ${size}px ${FONT_SANS}`;
    return ctx.measureText(ln).width > maxW;
  })) size -= 2;
  ctx.font = `800 ${size}px ${FONT_SANS}`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  const titleH = size * 1.08;
  let ty = 168;
  lines.forEach((ln, i) => ctx.fillText(ln, PAD, ty + i * titleH));
  ty += (lines.length - 1) * titleH;

  /* Description — word-wrapped, dim */
  const wrap = (text: string, mw: number, font: string) => {
    ctx.font = font;
    const ws = text.split(" ");
    const out: string[] = [];
    let line = "";
    for (const w of ws) {
      const test = line ? `${line} ${w}` : w;
      if (ctx.measureText(test).width > mw && line) {
        out.push(line);
        line = w;
      } else line = test;
    }
    if (line) out.push(line);
    return out;
  };
  const descFont = `500 18px ${FONT_SANS}`;
  const descLines = wrap(meta.desc, maxW, descFont).slice(0, 3);
  ctx.font = descFont;
  ctx.fillStyle = "rgba(220,228,245,0.62)";
  let dy = ty + 44;
  descLines.forEach((ln) => {
    ctx.fillText(ln, PAD, dy);
    dy += 27;
  });

  /* Progress bar */
  const py = H - 150;
  ctx.font = `600 13px ${FONT_MONO}`;
  ctx.fillStyle = "rgba(220,228,245,0.5)";
  ctx.textAlign = "left";
  ctx.fillText("PROGRESS", PAD, py);
  ctx.font = `700 18px ${FONT_SANS}`;
  ctx.fillStyle = accent;
  ctx.textAlign = "right";
  ctx.fillText(`${meta.progress}%`, W - PAD, py + 2);
  const barY = py + 16;
  const barW = W - PAD * 2;
  ctx.fillStyle = "rgba(230,238,255,0.1)";
  roundRect(ctx, PAD, barY, barW, 8, 4);
  ctx.fill();
  ctx.fillStyle = accent;
  ctx.shadowColor = accent;
  ctx.shadowBlur = 10;
  roundRect(ctx, PAD, barY, (barW * meta.progress) / 100, 8, 4);
  ctx.fill();
  ctx.shadowBlur = 0;

  /* Divider + LEVEL / DURATION footer */
  ctx.fillStyle = `rgba(${rgb},0.22)`;
  ctx.fillRect(PAD, H - 96, barW, 1);
  ctx.textAlign = "left";
  ctx.font = `600 12px ${FONT_MONO}`;
  ctx.fillStyle = "rgba(220,228,245,0.5)";
  ctx.fillText("LEVEL", PAD, H - 64);
  ctx.fillText("DURATION", W / 2 + 6, H - 64);
  ctx.font = `600 19px ${FONT_SANS}`;
  ctx.fillStyle = "#eef3ff";
  ctx.fillText(meta.level, PAD, H - 36);
  ctx.fillText(meta.duration, W / 2 + 6, H - 36);

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

export default function LaptopScene({ progress, reducedMotion = false, capture = false }: LaptopSceneProps) {
  /* Device quality tier — computed once on the client (this component is
   * ssr:false, so reading matchMedia/navigator here is safe and never
   * remounts the canvas). Low-power devices (touch / few cores) render at a
   * lower DPR ceiling + lighter MSAA to stay smooth; desktop gets the full
   * resolution + heavier MSAA for crisp geometry edges. SMAA runs on every
   * tier (cheap) and carries the thin-line / silhouette edge quality. The
   * APPROVED DESIGN is identical on every tier — only resolution / AA cost
   * scale. */
  const [lowPower] = useState(() => {
    if (typeof window === "undefined") return false;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const fewCores = (navigator.hardwareConcurrency || 8) <= 4;
    return coarse || fewCores;
  });
  const dprRange: [number, number] = lowPower ? [1.25, 2] : [1.5, 2.5];
  const msaa = lowPower ? 2 : 6;

  /* Pause the live render loop when the hero is scrolled out of view, so
   * the heavy scene doesn't keep burning GPU while the user reads the
   * sections below. (Integrated GPUs use the pre-rendered scrub instead and
   * never mount this; this benefits capable GPUs.) During capture we force
   * an always-on loop + readable buffer. */
  const wrapRef = useRef<HTMLDivElement>(null);
  const [frameloop, setFrameloop] = useState<"always" | "never">("always");
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setFrameloop(entry.isIntersecting ? "always" : "never"),
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const effectiveFrameloop = capture ? "always" : frameloop;

  return (
    <div ref={wrapRef} style={{ width: "100%", height: "100%" }}>
    <Canvas
      frameloop={effectiveFrameloop}
      dpr={capture ? 3 : dprRange}
      camera={{ position: [4.6, 3.4, 6.4], fov: 38 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        preserveDrawingBuffer: capture,
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
      <Environment background={false} resolution={lowPower ? 128 : 256} frames={1}>
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
      {/* LEFT-SIDE FILL — balances the right-front key. Pulled back
       *  from 0.85 to 0.55 once the lid material was made less
       *  reflective: with the calmer material, less fill is enough
       *  to remove the dark-side band, and lower fill keeps the
       *  central specular highlight from washing the brand out. */}
      <directionalLight position={[-4, 4, 5]} intensity={0.55} color="#e8eef8" />
      <pointLight position={[-3, 2.5, 4]} intensity={0.6} color={COLORS.cyan} />
      {/* Rim light from behind to highlight the lid's top edge */}
      <pointLight position={[2, 4, -3]} intensity={0.6} color="#ffffff" />

      {/* Background depth chamber (architectural silhouettes + rear light
       *  shaft + haze) — sits behind everything, self-lit, never competes. */}
      <TechChamber progress={progress} reducedMotion={reducedMotion} lowPower={lowPower} />

      {/* Geometric platform blocks removed — the laptop now sits over the
       *  open ribbon floor receding into the distance, no panels around it. */}

      <Laptop progress={progress} reducedMotion={reducedMotion} />

      {/* Cinematic post-processing.
       *  - multisampling = tiered MSAA (6 desktop / 2 low-power) AA's
       *    geometry edges (chassis silhouette, burst/echo rings, cards).
       *  - SMAA (added) AA's the FINAL image — geometry AND textured edges
       *    (the thin platform circuit lines), which MSAA alone can't reach;
       *    this is what removes the glancing-angle shimmer / crawling on the
       *    ground linework during motion. Same package (postprocessing), no
       *    new dependency.
       *  - Film grain kept low (0.012) so it dithers gradients without
       *    reading as fuzzy texture.
       *  - Post BLOOM intentionally NOT added: a scene/threshold bloom would
       *    alter the locked laptop (its bright screen/edges) and risks the
       *    known crash; the environment glow stays baked + SMAA-crisp. */}
      {/* RENDER-QUALITY POST STACK — this is what lifts the scene from "flat
       *  cartoon strokes" toward a cinematic product render:
       *   1. N8AO  — ambient occlusion: real contact-shadow depth between the
       *      laptop, the reactor tiers and the platform, so nothing reads as
       *      pasted-on. The single biggest anti-"flat" cue.
       *   2. Bloom — controlled, luminance-thresholded + mipmap-blurred so
       *      ONLY genuinely emissive surfaces (energy lines, ring trims,
       *      screen) bleed light; emissives stop looking like drawn strokes
       *      and start looking like light.
       *   3. SMAA  — edge AA / anti-shimmer.
       *   4. BrightnessContrast + HueSaturation — gentle grade: deeper blacks,
       *      richer contrast and a touch more colour so mid-tones aren't flat.
       *   5. Vignette + Noise — focus + gradient dither.
       *  AO/Bloom scale down (half-res, fewer samples, lower intensity) on the
       *  low-power tier to protect frame-rate. */}
      <EffectComposer multisampling={msaa} enableNormalPass={false}>
        <N8AO
          quality={lowPower ? "low" : "high"}
          aoRadius={1.0}
          distanceFalloff={1.0}
          intensity={lowPower ? 1.6 : 2.1}
          halfRes={lowPower}
          color="#03060c"
        />
        <Bloom
          intensity={lowPower ? 0.45 : 0.6}
          luminanceThreshold={0.62}
          luminanceSmoothing={0.28}
          radius={0.6}
          mipmapBlur
        />
        <SMAA preset={SMAAPreset.HIGH} />
        <BrightnessContrast brightness={-0.015} contrast={0.07} />
        <HueSaturation hue={0} saturation={0.08} />
        {/* Vignette darkness softened so the lower edge blends into the page
         *  mist instead of stamping a hard dark band at the section boundary. */}
        <Vignette
          eskil={false}
          offset={0.26}
          darkness={0.5}
          blendFunction={BlendFunction.NORMAL}
        />
        <Noise opacity={0.006} blendFunction={BlendFunction.OVERLAY} />
      </EffectComposer>
    </Canvas>
    </div>
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
    () => slabs.map((s) => makeSlabTexture(s.stream, s.icon, SLAB_CARD_META[s.streamIdx])),
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
  reducedMotion,
}: {
  progress: MotionValue<number>;
  reducedMotion: boolean;
}) {
  const lidBrandTex = useLidBrandTexture();
  const lidBloomTex = useLidBloomTexture();
  const deckBadge = useMemo(() => makeDeckBadgeTextures(), []);
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
  /* TEX_VERSION exists ONLY to invalidate Next.js Fast-Refresh's useMemo
   * cache. Bump it whenever the instrument-plate drawing params change so an
   * edit to the texture function regenerates the GPU texture on save. */
  const PLATE_TEX_VERSION = "v11-reactor-floor";
  /* Dark engineered SUBSTRATE the channels are recessed into (normal-blended
   * material with groove troughs + lit rim bevels). Sits beneath the glow. */
  const plateSubstrateTex = useMemo(
    () => makePlatformSubstrateTexture(),
    [PLATE_TEX_VERSION],
  );
  const plateSubstrateMatRef = useRef<THREE.MeshBasicMaterial>(null);
  /* Crisp top instrument plate (rings + channels + ticks + via + core). */
  const plateSurfaceTex = useMemo(
    () => makeInstrumentPlateTexture("surface"),
    [PLATE_TEX_VERSION],
  );
  /* Blurred ghost plate for the mid parallax stratum. */
  const plateSoftTex = useMemo(
    () => makeInstrumentPlateTexture("soft"),
    [PLATE_TEX_VERSION],
  );
  /* Faint outer-arc fragments for the deepest stratum. */
  const plateDeepTex = useMemo(
    () => makeInstrumentPlateTexture("deep"),
    [PLATE_TEX_VERSION],
  );
  const depthHazeTex = useMemo(() => makeDepthHazeTexture(), []);
  /* Tier-3 far megastructure silhouette + the inward signal-packet sprite. */
  const megaStructureTex = useMemo(() => makeMegastructureTexture(), []);
  const signalPacketTex = useMemo(() => makeSignalPacketTexture(), []);
  /* Sub-surface machine-well layer (depth beneath the burst). */
  const machineWellTex = useMemo(() => makeMachineWellTexture(), []);
  const machineWellMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const plateSurfaceMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const plateMidMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const plateDeepMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const plateMidMeshRef = useRef<THREE.Mesh>(null);
  const plateDeepMeshRef = useRef<THREE.Mesh>(null);
  const depthHazeMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const megaStructureMatRef = useRef<THREE.MeshBasicMaterial>(null);
  /* Outward ignition wavefront (a thin additive ring that sweeps out as the
   * lid opens) + the pool of inward-travelling signal packets. */
  const sweepMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const sweepMeshRef = useRef<THREE.Mesh>(null);
  const packetRefs = useRef<Array<THREE.Mesh | null>>([]);
  /* SECONDARY ACTIVATION — two follow-up "echo" ring ripples that fire after
   * the main sweep (staggered), and a ring of connection nodes that light up
   * in SEQUENCE as the burst energises (the platform powering up zone by
   * zone). All support the main sweep; none is louder than it. */
  const echoMeshRefs = useRef<Array<THREE.Mesh | null>>([]);
  const echoMatRefs = useRef<Array<THREE.MeshBasicMaterial | null>>([]);
  const nodeMatRefs = useRef<Array<THREE.MeshBasicMaterial | null>>([]);
  /* Six activation nodes on a ring around the laptop, at deterministic
   * angles, each with a sequence slot 0..1 for the power-up order. */
  const activationNodes = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const h = (n: number) => {
          const s = Math.sin(n * 91.7) * 43758.5453;
          return s - Math.floor(s);
        };
        const ang = (i / 6) * Math.PI * 2 + (h(i) - 0.5) * 0.25;
        const R = 5.0; // world radius on the bus ring
        return { x: Math.cos(ang) * R, z: Math.sin(ang) * R, seq: i / 6 };
      }),
    [],
  );
  /* Deterministic packet seeds: each rides a radial channel angle inward,
   * with its own phase + speed. 8 packets — restrained. */
  const packets = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => {
        const h = (n: number) => {
          const s = Math.sin(n * 127.1) * 43758.5453;
          return s - Math.floor(s);
        };
        const ch = Math.floor(h(i * 3.1) * 16); // pick one of 16 channels
        return {
          angle: (ch / 16) * Math.PI * 2 + (h(ch * 5.7) - 0.5) * 0.12,
          phase: h(i * 7.7),
          speed: 0.06 + h(i * 2.3) * 0.05,
        };
      }),
    [],
  );
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

  /* Lid hinge spring state - gives the lid mechanical inertia so it
   * overshoots slightly when scroll moves fast then settles, like a
   * real heavy aluminum lid. */
  const lidAngle = useRef(LID_CLOSED_ANGLE);
  const lidVelocity = useRef(0);

  /* Drifting glyph particles RETIRED for the AlgorithmX Core environment.
   * They were floating code-glyph icons that (a) read as exactly the
   * "random floating icons" the brief rejects and (b) were the only
   * environment element that drifted in FRONT of the laptop, additively
   * tinting its pixels. The instrument platform + inward signal packets +
   * far megastructure carry the "intelligent system" read instead. */

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

    /* Camera path — scroll-driven dolly + LOW-AMPLITUDE IDLE MICRO-
     * MOTION on top so the shot feels like a handheld product shoot
     * instead of a perfectly locked-off render.
     *
     * Opening shot now starts HIGH (y = 3.4) — looking down at the
     * dormant closed laptop from above — and descends to the previous
     * side-on framing (y = 2.4) as scroll progresses and the lid
     * opens. Reads as the camera "approaching" the device rather than
     * the laptop just being there in front of you. */
    const camP = smoothstep(0, 1, p);
    const microX = Math.sin(t * 0.51) * 0.025 + Math.sin(t * 1.27) * 0.012;
    const microY = Math.cos(t * 0.43) * 0.020 + Math.sin(t * 0.81) * 0.010;
    const microZ = Math.sin(t * 0.37) * 0.022;
    state.camera.position.set(
      lerp(4.6, 4.0, camP) + microX,
      lerp(3.4, 2.4, camP) + microY,
      lerp(6.4, 5.6, camP) + microZ,
    );
    /* Camera lookAt shifted LEFT of the laptop by 0.55 world units so
     * the chassis sits right-of-centre in the frame, opening up the
     * left third for the headline column. lookAt-Y starts negative
     * (camera tipped down onto the closed lid) and rises to 0.9
     * (eye-level on the open screen) so the descent feels guided. */
    const LOOKAT_LEFT_SHIFT = 0.55;
    state.camera.lookAt(
      RIG_X - LOOKAT_LEFT_SHIFT + microX * 0.3,
      lerp(-0.15, 0.9, camP) + microY * 0.3,
      0,
    );

    /* Mouse parallax - whole rig tilts subtly toward cursor. Disabled under
     * reduced motion (the rig eases back to a neutral, untilted rest pose);
     * the well's depth survives via the static atmospheric-perspective cue,
     * so reduced-motion users keep the suspended-floor read without the
     * pointer-driven sway. */
    if (parallaxRef.current) {
      const targetY = reducedMotion ? 0 : pointer.x * 0.12;
      const targetX = reducedMotion ? 0 : -pointer.y * 0.08;
      parallaxRef.current.rotation.y = THREE.MathUtils.lerp(
        parallaxRef.current.rotation.y,
        targetY,
        0.05,
      );
      parallaxRef.current.rotation.x = THREE.MathUtils.lerp(
        parallaxRef.current.rotation.x,
        targetX,
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

    /* ── ALGORITHMX CORE — environment activation ──────────────────────
     * Reads the existing scroll/lid progress `p` (never writes it) and the
     * clock `t`. The plate boots in with `draw`; the rings ignite OUTWARD via
     * the sweep wavefront as the lid opens; signal packets conduct INWARD
     * along the channels. Peak opacities stay low so the environment never
     * out-brightens or out-details the laptop. Under reduced motion every
     * time-based term is frozen and the sweep/packets settle to a static
     * end-state — the full architecture + depth still render. */
    const draw = smoothstep(0.18, 0.42, p);
    const pulse = reducedMotion ? 1 : 0.92 + Math.sin(t * 0.9) * 0.06;
    /* activationT tracks the lid opening (lid animates 0.32→0.50). */
    const activationT = smoothstep(0.3, 0.55, p);
    /* FLOOR REVEAL — at the very top of the hero ONLY the laptop is
     * visible; the whole energy-chamber floor stays hidden and then comes
     * in as the lid opens (lid animates 0.32→0.50). So every floor/depth
     * layer is gated on this curve with NO baseline — they are exactly 0
     * until the laptop starts opening, then ramp to full. */
    const floorReveal = smoothstep(0.32, 0.6, p);
    if (plateSubstrateMatRef.current) {
      plateSubstrateMatRef.current.opacity = floorReveal * 0.95;
    }
    if (plateSurfaceMatRef.current) {
      plateSurfaceMatRef.current.opacity = floorReveal * 0.87 * pulse;
    }
    if (plateMidMatRef.current) {
      const midPulse = reducedMotion ? 1 : 0.9 + Math.sin(t * 0.66 + 1.3) * 0.1;
      plateMidMatRef.current.opacity = floorReveal * 0.42 * midPulse;
    }
    if (plateDeepMatRef.current) {
      const deepPulse = reducedMotion ? 1 : 0.88 + Math.sin(t * 0.48 + 2.7) * 0.12;
      plateDeepMatRef.current.opacity = floorReveal * 0.22 * deepPulse;
    }
    if (depthHazeMatRef.current) {
      const hazePulse = reducedMotion ? 1 : 0.85 + Math.sin(t * 0.4) * 0.15;
      depthHazeMatRef.current.opacity = floorReveal * 0.09 * hazePulse;
    }
    if (megaStructureMatRef.current) {
      megaStructureMatRef.current.opacity = floorReveal * 0.09;
    }
    /* Sub-surface machine well — faint depth glow beneath the floor. */
    if (machineWellMatRef.current) {
      const wellPulse = reducedMotion ? 1 : 0.85 + Math.sin(t * 0.5 + 0.6) * 0.15;
      machineWellMatRef.current.opacity = floorReveal * 0.34 * wellPulse;
    }

    /* OUTWARD IGNITION SWEEP — a thin ring expanding chassis→edge as the lid
     * opens, brightest mid-sweep then gone (so steady + reduced-motion show
     * the static lit plate, not a parked ring). THE MAIN EXPLOSION — logic
     * unchanged from the approved version. */
    if (sweepMeshRef.current && sweepMatRef.current) {
      const sweepR = 0.4 + activationT * 12.5; // base ring radius is 1u
      sweepMeshRef.current.scale.set(sweepR, sweepR, 1);
      const sweepFade = Math.sin(Math.PI * activationT); // 0→1→0 across the open
      sweepMatRef.current.opacity = reducedMotion ? 0 : sweepFade * 0.28;
    }

    /* SECONDARY ECHO RIPPLES — two follow-up rings, each lagging the main
     * sweep by a staggered amount, expanding a bit further and fainter. They
     * read as energy echoes radiating from the burst. Transient: zero at rest
     * and under reduced motion (the static end-state is the lit plate). */
    for (let i = 0; i < echoMeshRefs.current.length; i++) {
      const em = echoMeshRefs.current[i];
      const emat = echoMatRefs.current[i];
      if (!em || !emat) continue;
      const lag = 0.05 + i * 0.06;
      const echoT = smoothstep(0.3 + lag, 0.58 + lag, p);
      const er = 0.4 + echoT * (13.5 + i * 1.5);
      em.scale.set(er, er, 1);
      emat.opacity = reducedMotion ? 0 : Math.sin(Math.PI * echoT) * (0.14 - i * 0.04);
    }

    /* SEQUENTIAL ACTIVATION NODES — light up in order as the burst energises
     * (zone-by-zone power-up), then hold with a gentle out-of-phase pulse.
     * Under reduced motion all nodes are simply lit (static end-state). */
    for (let i = 0; i < nodeMatRefs.current.length; i++) {
      const nmat = nodeMatRefs.current[i];
      if (!nmat) continue;
      const node = activationNodes[i];
      if (reducedMotion) {
        nmat.opacity = draw * 0.5;
        continue;
      }
      // each node switches on as activationT passes its sequence slot
      const on = smoothstep(node.seq * 0.85, node.seq * 0.85 + 0.12, activationT);
      const hold = 0.78 + Math.sin(t * 1.1 + i * 1.7) * 0.22;
      nmat.opacity = draw * on * hold * 0.55;
    }

    /* INWARD SIGNAL PACKETS — ride the radial channels toward the laptop.
     * `s` runs 0 (edge) → 1 (centre). Under reduced motion they freeze at
     * their seed phase as static lit nodes. */
    const PLATE_R = 11.5; // world radius of the active plate
    const platY = -BASE_H / 2 - 0.033;
    for (let i = 0; i < packets.length; i++) {
      const m = packetRefs.current[i];
      if (!m) continue;
      const pk = packets[i];
      const s = reducedMotion
        ? pk.phase
        : (pk.phase + t * pk.speed) % 1; // advances toward centre over time
      const r = (1 - s) * PLATE_R; // edge → centre
      m.position.set(
        RIG_X + Math.cos(pk.angle) * r,
        platY,
        Math.sin(pk.angle) * r,
      );
      const mat = m.material as THREE.MeshBasicMaterial;
      // visible across the run, fading at both ends; gated on activation+draw
      const along = Math.sin(Math.PI * s);
      mat.opacity = draw * activationT * along * 0.5;
    }

    /* Per-stratum idle drift — gives the depth life before the cursor moves.
     * Frozen under reduced motion. */
    if (!reducedMotion) {
      if (plateMidMeshRef.current) {
        plateMidMeshRef.current.position.x = RIG_X + Math.sin(t * 0.13) * 0.12;
        plateMidMeshRef.current.position.z = Math.cos(t * 0.11) * 0.12;
      }
      if (plateDeepMeshRef.current) {
        plateDeepMeshRef.current.position.x = RIG_X + Math.sin(t * 0.09 + 1.7) * 0.2;
        plateDeepMeshRef.current.position.z = Math.cos(t * 0.075 + 0.9) * 0.2;
      }
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
      /* Bloom toned WAY down (peak 0.32 → 0.16) so it sits as a
       * faint halo behind the wordmark instead of stacking with
       * the wordmark's own additive cyan and washing the logo
       * out. The logo is still the focal element; this is just
       * the soft light spill around it. */
      const bloomBreathe = 0.7 + Math.sin(t * 0.55 + 0.4) * 0.3;
      lidBloomMatRef.current.opacity = 0.16 * bloomBreathe;
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

      {/* DARK VOID FLOOR PLANE - true black with zero metalness and zero
       *  env contribution so the bright analytic lights can't bounce off
       *  it as grey. 200 units so its edge sits ~100 world units out, well
       *  past any camera ray (the old horizon-line concern).
       *
       *  PUSHED DOWN to -2.25 (was -0.045). This is the floor of the
       *  holographic well: the crisp hex surface now FLOATS ~2.2 units
       *  above it, with the mid + deep hex strata and the depth haze
       *  suspended in the gap between. Looking down through the
       *  semi-transparent surface, that gap reads as lit atmosphere
       *  receding into black — the "void visible beneath" the brief asks
       *  for. From the camera's shallow angle the 200-unit plane still
       *  fills the whole lower frame, so dropping it 2 units does NOT
       *  flood the page backdrop in; only the small region right under
       *  the laptop opens up into depth. */}
      <mesh
        position={[RIG_X, -BASE_H / 2 - 2.25, 0]}
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

      {/* PLATFORM SUBSTRATE — dark engineered material with the channels
       *  recessed into it (groove troughs + lit rim bevels). NORMAL-blended
       *  (so it can paint real darks/shadows, unlike the additive glow) and
       *  sits a hair BELOW the illumination plate so the bright cores read as
       *  light sitting INSIDE the grooves → the lines become dimensional,
       *  embedded channels instead of flat strokes. Self-lit material plane;
       *  it does not light or touch the laptop. */}
      {plateSubstrateTex && (
        <mesh
          position={[RIG_X, -BASE_H / 2 - 0.038, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          renderOrder={-1}
        >
          <planeGeometry args={[36, 36]} />
          <meshBasicMaterial
            ref={plateSubstrateMatRef}
            map={plateSubstrateTex}
            transparent
            opacity={0}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}

      {/* TIER 1 — INSTRUMENT PLATE (immediate platform beneath the laptop).
       *  The crisp polar plate: segmented engineered rings + radial circuit
       *  channels conducting inward + encoder ticks + via nodes + void-gap
       *  cutouts, all baked additive (self-lit, never touches the laptop
       *  render). Same transform/scale as the floor it replaces. */}
      {plateSurfaceTex && (
        <mesh
          position={[RIG_X, -BASE_H / 2 - 0.035, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[36, 36]} />
          <meshBasicMaterial
            ref={plateSurfaceMatRef}
            map={plateSurfaceTex}
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}

      {/* SUB-SURFACE MACHINE WELL — a recessed structural layer just below the
       *  plate, glimpsed through the void-gaps + centre, so the burst zone
       *  reads as the top of a deeper machine. Concentrated under the laptop,
       *  faint, never muddy. */}
      {machineWellTex && (
        <mesh
          position={[RIG_X, -BASE_H / 2 - 0.28, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[22, 22]} />
          <meshBasicMaterial
            ref={machineWellMatRef}
            map={machineWellTex}
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}

      {/* OUTWARD IGNITION SWEEP — a thin additive ring wavefront that expands
       *  from the chassis to the plate edge as the lid opens, reading as the
       *  rings "igniting outward". A transient: it fades to nothing once the
       *  lid is open, so the steady / reduced-motion state is the static
       *  lit plate (driven entirely in useFrame; frozen under reduced
       *  motion). THE MAIN EXPLOSION — preserved exactly. */}
      <mesh
        ref={sweepMeshRef}
        position={[RIG_X, -BASE_H / 2 - 0.034, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={1}
      >
        <ringGeometry args={[0.9, 1.0, 64]} />
        <meshBasicMaterial
          ref={sweepMatRef}
          color={COLORS.cyan}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* SECONDARY ECHO RIPPLES — two thinner follow-up rings that fire just
       *  after the main sweep (staggered), reading as energy echoes radiating
       *  from the burst. Fainter than the hero sweep; transient (gone at rest
       *  and under reduced motion). */}
      {[0, 1].map((i) => (
        <mesh
          key={`echo-${i}`}
          ref={(el) => {
            echoMeshRefs.current[i] = el;
          }}
          position={[RIG_X, -BASE_H / 2 - 0.0345, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.94, 1.0, 64]} />
          <meshBasicMaterial
            ref={(el) => {
              echoMatRefs.current[i] = el;
            }}
            color={i === 0 ? COLORS.cyan : COLORS.cyanSoft}
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* SEQUENTIAL ACTIVATION NODES — connection nodes on the bus ring that
       *  light up in order as the platform powers up, then hold with a gentle
       *  pulse. Static (all lit) under reduced motion. */}
      {signalPacketTex &&
        activationNodes.map((n, i) => (
          <mesh
            key={`node-${i}`}
            position={[RIG_X + n.x, -BASE_H / 2 - 0.033, n.z]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[0.62, 0.62]} />
            <meshBasicMaterial
              ref={(el) => {
                nodeMatRefs.current[i] = el;
              }}
              map={signalPacketTex}
              transparent
              opacity={0}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        ))}

      {/* INWARD SIGNAL PACKETS — a small pool of additive glow sprites that
       *  ride the radial channels from the plate edge inward toward the
       *  laptop (data conducting into the core). Positions are mutated in
       *  useFrame from deterministic seeds (no per-frame allocation); under
       *  reduced motion they freeze as static lit nodes along the channels. */}
      <group>
        {signalPacketTex &&
          packets.map((_, i) => (
            <mesh
              key={`pkt-${i}`}
              ref={(el) => {
                packetRefs.current[i] = el;
              }}
              position={[RIG_X, -BASE_H / 2 - 0.033, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[0.5, 0.5]} />
              <meshBasicMaterial
                map={signalPacketTex}
                transparent
                opacity={0}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
          ))}
      </group>

      {/* TIER 2 — MID-DEPTH GHOST PLATE + volumetric haze. A larger, blurred
       *  ghost of the plate plus the depth haze read as a second array
       *  receding into luminous fog beneath the surface. Static depth cue;
       *  kept in all modes (only the drift/pulse are frozen for reduced
       *  motion). */}
      {plateSoftTex && (
        <mesh
          ref={plateMidMeshRef}
          position={[RIG_X, -BASE_H / 2 - 0.9, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[40, 40]} />
          <meshBasicMaterial
            ref={plateMidMatRef}
            map={plateSoftTex}
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}

      {depthHazeTex && (
        <mesh
          position={[RIG_X, -BASE_H / 2 - 1.35, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[44, 44]} />
          <meshBasicMaterial
            ref={depthHazeMatRef}
            map={depthHazeTex}
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}

      {/* Deepest stratum — only the faint outer arc fragments, bluer, so the
       *  array dissolves into the void. */}
      {plateDeepTex && (
        <mesh
          ref={plateDeepMeshRef}
          position={[RIG_X, -BASE_H / 2 - 1.9, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[48, 48]} />
          <meshBasicMaterial
            ref={plateDeepMatRef}
            map={plateDeepTex}
            transparent
            opacity={0}
            color="#cfe8ff"
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}

      {/* TIER 3 — FAR MEGASTRUCTURE silhouette. A single, barely-visible
       *  distant arc-ring + spires set far back and right-biased, implying
       *  the array continues into deep space while the headline (left) third
       *  stays dark. Additive, very low opacity; static. */}
      {megaStructureTex && (
        <mesh position={[RIG_X + 1.5, 1.4, -9]}>
          <planeGeometry args={[26, 13]} />
          <meshBasicMaterial
            ref={megaStructureMatRef}
            map={megaStructureTex}
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

      {/* DRIFTING GLYPH PARTICLES retired — see note at their former
       *  declaration. The scene's "intelligent system" read is now carried
       *  by the instrument platform, the inward signal packets and the far
       *  megastructure, none of which draw in front of the laptop. */}

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
          {/* Dark gunmetal chassis. Higher metalness + env intensity than
           *  the old silver so the deep base still catches a bright
           *  machined sheen along the top edges (the reference look)
           *  instead of going flat matte black. */}
          <meshPhysicalMaterial
            color={COLORS.steel}
            metalness={0.62}
            roughness={0.66}
            clearcoat={0.3}
            clearcoatRoughness={0.5}
            anisotropy={0.78}
            anisotropyRotation={Math.PI / 2}
            normalMap={brushedNormalTex}
            normalScale={new THREE.Vector2(0.14, 0.14)}
            envMapIntensity={0.6}
          />
        </RoundedBox>

        {/* Keyboard well - recessed dark panel. Depth pulled in (0.55 ->
         *  0.44) and shifted back (z -0.15 -> -0.29) so the well hugs
         *  the key block and its front edge sits just below the last
         *  row. Previously it ran on toward the trackpad, leaving a
         *  dark "strip" between the keyboard and trackpad; now the
         *  gunmetal chassis shows through there as a real palm rest. */}
        <mesh
          position={[0, BASE_H / 2 + 0.005, -0.29]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[BASE_W * 0.86, BASE_D * 0.44]} />
          <meshStandardMaterial color={COLORS.keyboard} roughness={0.7} />
        </mesh>

        {/* Speaker grilles removed - they read as black blobs flanking
         *  the keyboard at this camera angle, not as ultrabook speakers. */}

        {/* BACKLIT KEYBOARD AMBIENT GLOW - cyan blanket that activates
         *  in Chapter 03 (keyboard "powers on" as the lid finishes
         *  opening). Opacity is driven per-frame from useFrame so the
         *  keyboard is visibly dark when the lid is closed. */}
        <mesh
          position={[0, BASE_H / 2 + 0.002, -0.30]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[BASE_W * 0.82, BASE_D * 0.42]} />
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
          position={[0, BASE_H / 2 + 0.0035, -0.30]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[BASE_W * 0.78, BASE_D * 0.40]} />
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

        {/* DECK BADGE — ThinkPad-X1-style: brushed-silver "Algorithm"
         *  with a glowing red i-dot + an oversized glowing red "X", set
         *  on a shallow ascending diagonal (text top toward top-right).
         *  Two stacked planes: an additive red GLOW underneath (the
         *  bright bloom-catching light) and the crisp silver+red wordmark
         *  on top. */}
        {deckBadge.glow && (
          <mesh
            position={[1.2, BASE_H / 2 + 0.0045, 0.92]}
            rotation={[-Math.PI / 2, 0, Math.PI / 7]}
          >
            <planeGeometry args={[0.56, 0.28]} />
            <meshBasicMaterial
              map={deckBadge.glow}
              transparent
              opacity={1}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        )}
        {deckBadge.crisp && (
          <mesh
            position={[1.2, BASE_H / 2 + 0.005, 0.92]}
            rotation={[-Math.PI / 2, 0, Math.PI / 7]}
          >
            <planeGeometry args={[0.52, 0.26]} />
            <meshBasicMaterial
              map={deckBadge.crisp}
              transparent
              opacity={1}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        )}

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
              {/* Satin-brushed aluminium — calmer than the first pass.
               *  The earlier numbers (metalness 0.62 / roughness 0.42 /
               *  envMap 0.85) made the lid pick up the scene's key
               *  light as a hot specular blob right where the brand
               *  wordmark sits, washing the logo out. These values
               *  keep most of the brushed look but tame the central
               *  highlight so the wordmark reads on first glance. */}
              <meshPhysicalMaterial
                color={COLORS.steel}
                metalness={0.62}
                roughness={0.66}
                clearcoat={0.34}
                clearcoatRoughness={0.48}
                anisotropy={0.85}
                anisotropyRotation={Math.PI / 2}
                normalMap={brushedNormalTex}
                normalScale={new THREE.Vector2(0.14, 0.14)}
                envMapIntensity={0.6}
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

            {/* BRAND LOGO on the outer lid face. Sized to ~55% of the
             *  lid width so the badge has breathing room around it.
             *  NORMAL blending (not additive): the letters now paint
             *  over the lid surface instead of adding light to it,
             *  so the wordmark stays crisp and readable even when
             *  the lid's specular highlight is bright underneath.
             *  Material ref so useFrame can still pulse the wordmark
             *  on a slow breath via opacity — gives the closed
             *  laptop a quiet "in standby" presence. */}
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
                  blending={THREE.NormalBlending}
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
