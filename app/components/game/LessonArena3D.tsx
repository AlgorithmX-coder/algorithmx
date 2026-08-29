"use client";

/**
 * LessonArena3D - calm Three.js environment for lesson screens.
 *
 * Shares the visual language of Arena3D (hex floor, holo screens,
 * drifting code snippets) but with warmer, brighter lighting and
 * fewer animated elements, so it reads as a backdrop for reading
 * rather than a combat arena.
 */

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { getQualitySettings } from "@/app/lib/gameEngine";

export interface LessonArena3DProps {
  width: number;
  height: number;
  mood: "normal" | "correct" | "wrong" | "celebration";
  /** Increment to trigger a visual pulse (shockwave, code flash, screen brighten). */
  pulseKey: number;
  /**
   * Optional per-week palette override for the calm "normal" mood + drifting
   * particles (from WeekTheme.arena). Undefined = the default cosmic look.
   * The feedback moods (correct/wrong/celebration) are never overridden — they
   * carry meaning.
   */
  themePalette?: {
    ambient: string;
    key: string;
    spot: string;
    fill: string;
    particles: number[];
  };
}

type Mood = LessonArena3DProps["mood"];

// ──────────────────────────────────────────────────────────
// Palettes
// ──────────────────────────────────────────────────────────

const MOOD_PALETTE = {
  normal: {
    ambient: new THREE.Color("#7c8aa8"),
    ambientI: 0.95,
    key: new THREE.Color("#bfdbfe"),
    keyI: 1.25,
    spot: new THREE.Color("#22d3ee"),
    spotI: 0.85,
    fill: new THREE.Color("#a855f7"),
    fillI: 0.55,
  },
  correct: {
    ambient: new THREE.Color("#3e6954"),
    ambientI: 0.58,
    key: new THREE.Color("#86efac"),
    keyI: 0.9,
    spot: new THREE.Color("#34d399"),
    spotI: 0.55,
    fill: new THREE.Color("#10b981"),
    fillI: 0.28,
  },
  wrong: {
    ambient: new THREE.Color("#5a3e44"),
    ambientI: 0.5,
    key: new THREE.Color("#fca5a5"),
    keyI: 0.65,
    spot: new THREE.Color("#f87171"),
    spotI: 0.4,
    fill: new THREE.Color("#ef4444"),
    fillI: 0.22,
  },
  celebration: {
    ambient: new THREE.Color("#5c4a2a"),
    ambientI: 0.62,
    key: new THREE.Color("#fde047"),
    keyI: 0.95,
    spot: new THREE.Color("#fbbf24"),
    spotI: 0.6,
    fill: new THREE.Color("#fb923c"),
    fillI: 0.3,
  },
} as const;

const CODE_SNIPPETS = [
  "learn()",
  "const safe = true",
  "protect(data)",
  "if (strong) {",
  "validate()",
  "encrypt()",
  "shield.on()",
  "class Hero {",
];

const BRAND_COLOURS = [0x60a5fa, 0x34d399, 0x7c3aed, 0xfbbf24];

// ──────────────────────────────────────────────────────────
// Texture builders
// ──────────────────────────────────────────────────────────

function makeHexGridSoftTexture(size = 512): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#161b3d";
  ctx.fillRect(0, 0, size, size);

  const r = 40;
  const colW = 1.5 * r;
  const rowH = Math.sqrt(3) * r;

  ctx.strokeStyle = "#7dd3fc";
  ctx.lineWidth = 1.2;
  ctx.globalAlpha = 0.32;

  const hex = (cx: number, cy: number) => {
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
      hex(x, y);
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
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
  ctx.strokeStyle = "#60a5fa";
  ctx.lineWidth = 1.4;
  ctx.globalAlpha = 0.55;
  const rand = (i: number) => (Math.sin(i * 17.1 + 4.2) * 10000) % 1;
  for (let i = 0; i < 14; i++) {
    const y = Math.abs(rand(i)) * size;
    const xStart = Math.abs(rand(i + 50)) * size;
    const len = 40 + Math.abs(rand(i + 100)) * 120;
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
  grad.addColorStop(0, "rgba(147,197,253,1)");
  grad.addColorStop(0.5, "rgba(96,165,250,0.5)");
  grad.addColorStop(1, "rgba(59,130,246,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeCircuitSoftTexture(size = 512): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#15193e";
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = "#3b82f6";
  ctx.lineWidth = 1.3;
  ctx.globalAlpha = 0.45;
  const rand = (i: number) =>
    (Math.sin(i * 12.9 + 78.2) * 43758.5) % 1;
  for (let i = 0; i < 18; i++) {
    let x = Math.abs(rand(i)) * size;
    let y = Math.abs(rand(i + 100)) * size;
    ctx.beginPath();
    ctx.moveTo(x, y);
    const steps = 3 + Math.floor(Math.abs(rand(i + 50)) * 3);
    for (let s = 0; s < steps; s++) {
      const dir = Math.floor(Math.abs(rand(i + s * 7)) * 4);
      const len = 25 + Math.abs(rand(i + s * 11)) * 50;
      if (dir === 0) x += len;
      else if (dir === 1) x -= len;
      else if (dir === 2) y += len;
      else y -= len;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
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
  ctx.font = "bold 34px 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#86efac";
  ctx.shadowColor = "#34d399";
  ctx.shadowBlur = 6;
  ctx.fillText(text, w / 2, h / 2);
  const tex = new THREE.CanvasTexture(c);
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
  ctx.beginPath();
  ctx.moveTo(cx, top);
  ctx.quadraticCurveTo(size * 0.9, top, size * 0.85, size * 0.4);
  ctx.quadraticCurveTo(size * 0.85, size * 0.75, cx, bottom);
  ctx.quadraticCurveTo(size * 0.15, size * 0.75, size * 0.15, size * 0.4);
  ctx.quadraticCurveTo(size * 0.1, top, cx, top);
  ctx.closePath();
  ctx.fill();

  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.moveTo(cx, top + 12);
  ctx.quadraticCurveTo(size * 0.78, top + 12, size * 0.78, size * 0.42);
  ctx.quadraticCurveTo(size * 0.78, size * 0.72, cx, bottom - 10);
  ctx.quadraticCurveTo(size * 0.22, size * 0.72, size * 0.22, size * 0.42);
  ctx.quadraticCurveTo(size * 0.22, top + 12, cx, top + 12);
  ctx.closePath();
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(cx - 5, size * 0.35, 10, size * 0.35);
  ctx.fillRect(size * 0.3, size * 0.48, size * 0.4, 10);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ──────────────────────────────────────────────────────────
// Live canvas textures for the 3 holo screens
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

function drawScrollingCode(lt: LiveTex, scroll: number, mood: Mood) {
  const { ctx, size } = lt;
  ctx.fillStyle = "#04060a";
  ctx.fillRect(0, 0, size, size);

  ctx.font = "bold 13px 'Courier New', monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  const lines = [
    "function learn() {",
    "  const safe = true;",
    "  if (strong) {",
    "    shield.on();",
    "  }",
    "  return hero;",
    "}",
    "// stay curious",
    "class CyberHero {",
    "  protect() {",
    "    validate();",
    "  }",
    "}",
    "encrypt(message);",
    "// you got this",
  ];

  const lineH = 18;
  const startY = size - ((scroll * lineH) % (lines.length * lineH));
  ctx.globalAlpha = 0.9;

  const accentColour =
    mood === "correct"
      ? "#a7f3d0"
      : mood === "wrong"
        ? "#fca5a5"
        : mood === "celebration"
          ? "#fde68a"
          : "#86efac";

  for (let i = 0; i < lines.length * 2; i++) {
    const y = startY + i * lineH;
    if (y < -lineH || y > size) continue;
    const line = lines[i % lines.length];
    ctx.fillStyle = accentColour;
    ctx.fillText(line, 8, y);
  }

  lt.texture.needsUpdate = true;
}

function drawShieldLive(lt: LiveTex, t: number, mood: Mood) {
  const { ctx, size } = lt;
  ctx.fillStyle = "#04060a";
  ctx.fillRect(0, 0, size, size);

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.35;
  const col =
    mood === "celebration"
      ? "#fde047"
      : mood === "correct"
        ? "#34d399"
        : mood === "wrong"
          ? "#ef4444"
          : "#93c5fd";
  const brightness = 0.55 + 0.35 * Math.sin(t * 1.3);
  ctx.strokeStyle = col;
  ctx.lineWidth = 4;
  ctx.globalAlpha = brightness;
  ctx.shadowColor = col;
  ctx.shadowBlur = 20 * brightness;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.quadraticCurveTo(cx + r, cy - r, cx + r * 0.9, cy);
  ctx.quadraticCurveTo(cx + r * 0.85, cy + r * 0.7, cx, cy + r);
  ctx.quadraticCurveTo(cx - r * 0.85, cy + r * 0.7, cx - r * 0.9, cy);
  ctx.quadraticCurveTo(cx - r, cy - r, cx, cy - r);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx, cy - r * 0.55);
  ctx.lineTo(cx, cy + r * 0.55);
  ctx.moveTo(cx - r * 0.55, cy);
  ctx.lineTo(cx + r * 0.55, cy);
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = col;
  ctx.font = "bold 11px monospace";
  ctx.textAlign = "center";
  ctx.fillText("PROTECTED", cx, size * 0.88);

  lt.texture.needsUpdate = true;
}

function drawAXLogo(lt: LiveTex, t: number, mood: Mood) {
  const { ctx, size } = lt;
  ctx.fillStyle = "#04060a";
  ctx.fillRect(0, 0, size, size);

  const cx = size / 2;
  const cy = size / 2;

  // Subtle rotating ring behind the logo.
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(t * 0.3);
  ctx.strokeStyle =
    mood === "celebration" ? "#fbbf24" : mood === "correct" ? "#34d399" : "#60a5fa";
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.32, 0, Math.PI * 1.5);
  ctx.stroke();
  ctx.restore();

  // Rotating "AX" mark.
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(Math.sin(t * 0.6) * 0.15);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 64px 'Space Grotesk', 'DM Sans', sans-serif";
  const col =
    mood === "celebration"
      ? "#fde047"
      : mood === "correct"
        ? "#6ee7b7"
        : mood === "wrong"
          ? "#fca5a5"
          : "#93c5fd";
  ctx.globalAlpha = 0.95;
  ctx.shadowColor = col;
  ctx.shadowBlur = 16;
  ctx.fillStyle = col;
  ctx.fillText("AX", 0, 0);
  ctx.restore();

  ctx.shadowBlur = 0;
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = "#64748b";
  ctx.font = "bold 10px monospace";
  ctx.textAlign = "center";
  ctx.fillText("ALGORITHMX", cx, size * 0.88);

  lt.texture.needsUpdate = true;
}

// ──────────────────────────────────────────────────────────
// Types / refs
// ──────────────────────────────────────────────────────────

interface HoloScreen {
  mesh: THREE.Mesh;
  material: THREE.MeshBasicMaterial;
  live: LiveTex | null;
  kind: "code" | "shield" | "logo";
  baseY: number;
  bobDelay: number;
  logScroll: number;
  brightenUntil: number;
}

interface CodeSnippet {
  mesh: THREE.Mesh;
  material: THREE.MeshBasicMaterial;
  vx: number;
  vy: number;
  vz: number;
  rotSpeed: number;
  baseOpacity: number;
}

interface FloatingShield {
  mesh: THREE.Mesh;
  material: THREE.MeshBasicMaterial;
  rotSpeed: number;
  baseColour: THREE.Color;
}

interface Shockwave {
  mesh: THREE.Mesh;
  material: THREE.MeshBasicMaterial;
  startTime: number;
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

  floorTexture: THREE.Texture | null;
  dataFlowTexture: THREE.Texture | null;

  holoScreens: HoloScreen[];
  codeSnippets: CodeSnippet[];
  particles: THREE.Mesh[];
  particleBaseColours: Map<THREE.Material, THREE.Color>;
  floatingShields: FloatingShield[];

  shockwaves: Shockwave[];
  shockwavePool: Shockwave[];
  shockwaveGeom: THREE.BufferGeometry;

  codeFlashUntil: number;
  particleSpeedUntil: number;
  wrongShakeUntil: number;
  celebrationUntil: number;

  disposables: Array<
    | THREE.BufferGeometry
    | THREE.Material
    | THREE.Texture
    | THREE.WebGLRenderer
  >;
}

// ──────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────

function spawnShockwave(r: SceneRefs, now: number) {
  let pulse = r.shockwavePool.pop();
  if (!pulse) {
    const mat = new THREE.MeshBasicMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.6,
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
    pulse.material.opacity = 0.6;
    pulse.startTime = now;
  }
  r.shockwaves.push(pulse);
}

// ──────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────

export default function LessonArena3D({
  width,
  height,
  mood,
  pulseKey,
  themePalette,
}: LessonArena3DProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const refs = useRef<SceneRefs | null>(null);

  // A themed week recolours the calm "normal" lighting + particle colours.
  // Feedback moods stay standard (they signal correct/wrong). Built once.
  const themedNormal = useMemo(
    () =>
      themePalette
        ? {
            ...MOOD_PALETTE.normal,
            ambient: new THREE.Color(themePalette.ambient),
            key: new THREE.Color(themePalette.key),
            spot: new THREE.Color(themePalette.spot),
            fill: new THREE.Color(themePalette.fill),
          }
        : MOOD_PALETTE.normal,
    [themePalette]
  );
  const parts = themePalette?.particles ?? BRAND_COLOURS;

  const moodRef = useRef<Mood>(mood);
  const pulseKeyRef = useRef<number>(pulseKey);

  // Prop → ref sync + mood transition handlers
  useEffect(() => {
    const prev = moodRef.current;
    moodRef.current = mood;
    const r = refs.current;
    if (!r) return;
    const now = performance.now() / 1000;
    if (mood === "wrong" && prev !== "wrong") {
      r.wrongShakeUntil = now + 0.2;
    }
    if (mood === "correct" && prev !== "correct") {
      r.codeFlashUntil = Math.max(r.codeFlashUntil, now + 0.3);
      r.particleSpeedUntil = now + 0.5;
    }
    if (mood === "celebration" && prev !== "celebration") {
      r.celebrationUntil = now + 2.0;
      r.codeFlashUntil = Math.max(r.codeFlashUntil, now + 1.5);
    }
  }, [mood]);

  useEffect(() => {
    if (pulseKeyRef.current === pulseKey) return;
    pulseKeyRef.current = pulseKey;
    const r = refs.current;
    if (!r) return;
    const now = performance.now() / 1000;
    spawnShockwave(r, now);
    r.codeFlashUntil = Math.max(r.codeFlashUntil, now + 0.35);
    // Brighten a random screen briefly.
    if (r.holoScreens.length > 0) {
      const idx = Math.floor(Math.random() * r.holoScreens.length);
      r.holoScreens[idx].brightenUntil = now + 0.4;
    }
  }, [pulseKey]);

  // Scene setup (once)
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const isMobile = window.innerWidth < 768;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(
      45,
      Math.max(1, width) / Math.max(1, height),
      0.1,
      100
    );
    camera.position.set(0, 2.5, 7);
    camera.lookAt(0, 0.8, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    // Align with the shared adaptive-quality dpr cap so low-power
    // devices render the backdrop at 1x while high-end stays at 2x.
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, getQualitySettings().dprCap)
    );
    renderer.setSize(width, height, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.45;

    host.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    const disposables: SceneRefs["disposables"] = [renderer];

    // ── Floor ──
    const floorTex = makeHexGridSoftTexture();
    if (floorTex) {
      floorTex.repeat.set(6, 4);
      disposables.push(floorTex);
    }
    const floorGeom = new THREE.PlaneGeometry(12, 8);
    disposables.push(floorGeom);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0a1025,
      map: floorTex ?? undefined,
      metalness: 0.35,
      roughness: 0.7,
      emissive: new THREE.Color(0x0a1a3a),
      emissiveIntensity: 0.2,
    });
    disposables.push(floorMat);
    const floor = new THREE.Mesh(floorGeom, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Data flow overlay
    const dataFlowTex = makeDataFlowTexture();
    if (dataFlowTex) {
      dataFlowTex.repeat.set(6, 3);
      disposables.push(dataFlowTex);
    }
    const poolGeom = new THREE.PlaneGeometry(12, 8);
    disposables.push(poolGeom);
    const poolMat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      map: dataFlowTex ?? undefined,
      transparent: true,
      opacity: 0.04,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    disposables.push(poolMat);
    const pool = new THREE.Mesh(poolGeom, poolMat);
    pool.rotation.x = -Math.PI / 2;
    pool.position.y = -0.02;
    scene.add(pool);

    // Radial glow on centre floor
    const radialTex = makeRadialGlowTexture();
    if (radialTex) disposables.push(radialTex);
    const glowGeom = new THREE.PlaneGeometry(8, 8);
    disposables.push(glowGeom);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: radialTex ?? undefined,
      transparent: true,
      opacity: 0.05,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    disposables.push(glowMat);
    const floorGlow = new THREE.Mesh(glowGeom, glowMat);
    floorGlow.rotation.x = -Math.PI / 2;
    floorGlow.position.set(0, 0.015, 0);
    scene.add(floorGlow);

    // ── Back wall ──
    const circuitTex = makeCircuitSoftTexture();
    if (circuitTex) {
      circuitTex.repeat.set(2, 1);
      disposables.push(circuitTex);
    }
    const backGeom = new THREE.PlaneGeometry(14, 6);
    disposables.push(backGeom);
    const backMat = new THREE.MeshStandardMaterial({
      color: 0x0c1225,
      map: circuitTex ?? undefined,
      metalness: 0.25,
      roughness: 0.85,
      emissive: new THREE.Color(0x091022),
      emissiveIntensity: 0.2,
    });
    disposables.push(backMat);
    const backWall = new THREE.Mesh(backGeom, backMat);
    backWall.position.set(0, 3, -4.5);
    scene.add(backWall);

    // ── Holographic screens (3 on desktop, 2 on mobile) ──
    const holoScreens: HoloScreen[] = [];
    const screenConfigs: Array<{
      kind: HoloScreen["kind"];
      x: number;
      y: number;
      bobDelay: number;
    }> = isMobile
      ? [
          { kind: "code", x: -1.8, y: 3.6, bobDelay: 0 },
          { kind: "shield", x: 1.8, y: 3.6, bobDelay: 1.0 },
        ]
      : [
          { kind: "code", x: -3, y: 3.4, bobDelay: 0 },
          { kind: "shield", x: 0, y: 3.7, bobDelay: 1.0 },
          { kind: "logo", x: 3, y: 3.4, bobDelay: 2.0 },
        ];

    screenConfigs.forEach((cfg) => {
      const live = makeLiveCanvas(256);
      if (live) disposables.push(live.texture);
      const screenGeom = new THREE.PlaneGeometry(1.2, 0.8);
      disposables.push(screenGeom);
      const mat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: live?.texture,
        transparent: true,
        opacity: 0.06,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      disposables.push(mat);
      const mesh = new THREE.Mesh(screenGeom, mat);
      mesh.position.set(cfg.x, cfg.y, -4.35);
      scene.add(mesh);
      holoScreens.push({
        mesh,
        material: mat,
        live,
        kind: cfg.kind,
        baseY: cfg.y,
        bobDelay: cfg.bobDelay,
        logScroll: 0,
        brightenUntil: 0,
      });
    });

    // ── Side walls with dim edge lights ──
    const sideGeom = new THREE.PlaneGeometry(8, 6);
    disposables.push(sideGeom);
    const sideMat = new THREE.MeshStandardMaterial({
      color: 0x070a18,
      metalness: 0.15,
      roughness: 0.95,
      emissive: new THREE.Color(0x050a20),
      emissiveIntensity: 0.12,
    });
    disposables.push(sideMat);
    const sideLeft = new THREE.Mesh(sideGeom, sideMat);
    sideLeft.position.set(-6, 3, 0);
    sideLeft.rotation.y = Math.PI / 2.5;
    scene.add(sideLeft);
    const sideRight = new THREE.Mesh(sideGeom, sideMat);
    sideRight.position.set(6, 3, 0);
    sideRight.rotation.y = -Math.PI / 2.5;
    scene.add(sideRight);

    const stripGeom = new THREE.PlaneGeometry(0.1, 4.5);
    disposables.push(stripGeom);
    const stripMat = new THREE.MeshBasicMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.35,
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

    // ── Lighting (warmer/brighter than battle) ──
    const palette = themedNormal;
    const ambient = new THREE.AmbientLight(palette.ambient, palette.ambientI);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(palette.key, palette.keyI);
    keyLight.position.set(2, 5, 4);
    keyLight.target.position.set(0, 0.8, 0);
    scene.add(keyLight);
    scene.add(keyLight.target);

    const spotLight = new THREE.SpotLight(
      palette.spot,
      palette.spotI,
      14,
      (35 * Math.PI) / 180,
      0.5,
      1
    );
    spotLight.position.set(0, 6, 1.5);
    spotLight.target.position.set(0, 0, 0);
    scene.add(spotLight);
    scene.add(spotLight.target);

    const fillLeft = new THREE.PointLight(palette.fill, palette.fillI, 10, 2);
    fillLeft.position.set(-4, 2, 2);
    scene.add(fillLeft);
    const fillRight = new THREE.PointLight(palette.fill, palette.fillI, 10, 2);
    fillRight.position.set(4, 2, 2);
    scene.add(fillRight);

    // ── Code snippets ──
    const codeSnippets: CodeSnippet[] = [];
    const snippetCount = isMobile ? 4 : 8;
    const codeGeom = new THREE.PlaneGeometry(1.3, 0.26);
    disposables.push(codeGeom);
    for (let i = 0; i < snippetCount; i++) {
      const text = CODE_SNIPPETS[i % CODE_SNIPPETS.length];
      const tex = makeCodeSnippetTexture(text);
      if (tex) disposables.push(tex);
      const mat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: tex ?? undefined,
        transparent: true,
        opacity: 0.06,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      disposables.push(mat);
      const mesh = new THREE.Mesh(codeGeom, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 9,
        0.7 + Math.random() * 3,
        -3.5 + Math.random() * 5
      );
      mesh.rotation.z = (Math.random() - 0.5) * 0.2;
      mesh.rotation.y = (Math.random() - 0.5) * 0.35;
      const baseOp = 0.05 + Math.random() * 0.03;
      mat.opacity = baseOp;
      scene.add(mesh);
      codeSnippets.push({
        mesh,
        material: mat,
        vx: (Math.random() - 0.5) * 0.0025,
        vy: (Math.random() - 0.5) * 0.0018,
        vz: (Math.random() - 0.5) * 0.0015,
        rotSpeed: (Math.random() - 0.5) * 0.002,
        baseOpacity: baseOp,
      });
    }

    // ── Particles ──
    const particles: THREE.Mesh[] = [];
    const particleCount = isMobile ? 15 : 30;
    const partGeom = new THREE.SphereGeometry(1, 6, 6);
    disposables.push(partGeom);
    const partOpacities = [0.14, 0.17, 0.2, 0.16];
    const partMats = parts.map((c, i) => {
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
    const particleBaseColours = new Map<THREE.Material, THREE.Color>();
    partMats.forEach((mat, i) => {
      particleBaseColours.set(
        mat,
        new THREE.Color(parts[i % parts.length])
      );
    });
    for (let i = 0; i < particleCount; i++) {
      const mat = partMats[i % partMats.length];
      const p = new THREE.Mesh(partGeom, mat);
      p.scale.setScalar(0.025 + Math.random() * 0.03);
      p.position.set(
        (Math.random() - 0.5) * 9,
        Math.random() * 3.5,
        -1 + (Math.random() - 0.5) * 3
      );
      p.userData = {
        drift: 0.0014 + Math.random() * 0.0028,
        sway: Math.random() * Math.PI * 2,
        swaySpeed: 0.3 + Math.random() * 0.5,
      };
      scene.add(p);
      particles.push(p);
    }

    // ── Floating shields ──
    const floatingShields: FloatingShield[] = [];
    if (!isMobile) {
      const shieldAlpha = makeShieldAlphaTexture();
      if (shieldAlpha) disposables.push(shieldAlpha);
      const shieldGeom = new THREE.PlaneGeometry(1, 1);
      disposables.push(shieldGeom);
      for (let i = 0; i < 4; i++) {
        const colour = new THREE.Color(parts[i % parts.length]);
        const mat = new THREE.MeshBasicMaterial({
          color: colour.clone(),
          alphaMap: shieldAlpha ?? undefined,
          transparent: true,
          opacity: 0.08,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        disposables.push(mat);
        const mesh = new THREE.Mesh(shieldGeom, mat);
        mesh.scale.setScalar(0.35 + Math.random() * 0.15);
        mesh.position.set(
          (Math.random() - 0.5) * 7,
          1.2 + Math.random() * 2,
          -1.5 + Math.random() * 2
        );
        scene.add(mesh);
        floatingShields.push({
          mesh,
          material: mat,
          rotSpeed: 0.003 + Math.random() * 0.006,
          baseColour: colour,
        });
      }
    }

    // Shockwave geom (shared)
    const shockwaveGeom = new THREE.RingGeometry(0.45, 0.55, 48);
    disposables.push(shockwaveGeom);

    refs.current = {
      scene,
      camera,
      renderer,
      ambient,
      keyLight,
      spotLight,
      fillLeft,
      fillRight,
      floorTexture: floorTex,
      dataFlowTexture: dataFlowTex,
      holoScreens,
      codeSnippets,
      particles,
      particleBaseColours,
      floatingShields,
      shockwaves: [],
      shockwavePool: [],
      shockwaveGeom,
      codeFlashUntil: 0,
      particleSpeedUntil: 0,
      wrongShakeUntil: 0,
      celebrationUntil: 0,
      disposables,
    };

    // ── Render loop ──
    let rafId = 0;
    let lastTime = performance.now();
    let frameCount = 0;
    let running = true;

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

      const currentMood = moodRef.current;
      const palette = currentMood === "normal" ? themedNormal : MOOD_PALETTE[currentMood];
      const lerpSpeed = 1 - Math.pow(0.001, dt);

      // ── Lighting lerp ──
      r.ambient.color.lerp(palette.ambient, lerpSpeed);
      r.ambient.intensity +=
        (palette.ambientI - r.ambient.intensity) * lerpSpeed;
      r.keyLight.color.lerp(palette.key, lerpSpeed);
      r.keyLight.intensity +=
        (palette.keyI - r.keyLight.intensity) * lerpSpeed;
      r.spotLight.color.lerp(palette.spot, lerpSpeed);
      r.spotLight.intensity +=
        (palette.spotI - r.spotLight.intensity) * lerpSpeed;
      r.fillLeft.color.lerp(palette.fill, lerpSpeed);
      r.fillLeft.intensity +=
        (palette.fillI - r.fillLeft.intensity) * lerpSpeed;
      r.fillRight.color.lerp(palette.fill, lerpSpeed);
      r.fillRight.intensity +=
        (palette.fillI - r.fillRight.intensity) * lerpSpeed;

      // ── Floor scroll ──
      if (r.floorTexture) r.floorTexture.offset.y -= 0.00018 * (dt * 60);
      if (r.dataFlowTexture) r.dataFlowTexture.offset.x -= 0.005 * (dt * 60);

      // ── Holo screens ──
      r.holoScreens.forEach((s, i) => {
        s.mesh.position.y =
          s.baseY + Math.sin((t / 5) * Math.PI * 2 + s.bobDelay) * 0.08;
        const brightenActive = t < s.brightenUntil;
        const celebration = t < r.celebrationUntil;
        const baseOpacity = 0.06;
        const targetOp =
          celebration ? 0.16 : brightenActive ? 0.18 : baseOpacity;
        s.material.opacity += (targetOp - s.material.opacity) * lerpSpeed;

        if (s.live && (frameCount + i) % 12 === 0) {
          if (s.kind === "code") {
            s.logScroll += dt * 0.9;
            drawScrollingCode(s.live, s.logScroll, currentMood);
          } else if (s.kind === "shield") {
            drawShieldLive(s.live, t, currentMood);
          } else {
            drawAXLogo(s.live, t, currentMood);
          }
        }
      });

      // ── Code snippets ──
      const codeFlashing = t < r.codeFlashUntil;
      const celebration = t < r.celebrationUntil;
      r.codeSnippets.forEach((cs) => {
        const m = cs.mesh;
        m.position.x += cs.vx * (dt * 60);
        m.position.y += cs.vy * (dt * 60);
        m.position.z += cs.vz * (dt * 60);
        m.rotation.z += cs.rotSpeed * (dt * 60);
        if (m.position.x > 5) m.position.x = -5;
        if (m.position.x < -5) m.position.x = 5;
        if (m.position.y > 3.8) m.position.y = 0.5;
        if (m.position.y < 0.4) m.position.y = 3.8;
        if (m.position.z > 1.8) m.position.z = -3.8;
        if (m.position.z < -3.8) m.position.z = 1.8;

        let target = cs.baseOpacity;
        if (celebration) target = 0.16;
        else if (codeFlashing) target = 0.12;
        cs.material.opacity += (target - cs.material.opacity) * lerpSpeed;
      });

      // ── Particles ──
      const speedBoost = t < r.particleSpeedUntil ? 1.8 : 1.0;
      r.particles.forEach((p) => {
        const ud = p.userData as {
          drift: number;
          sway: number;
          swaySpeed: number;
        };
        p.position.y += ud.drift * speedBoost * (dt * 60);
        p.position.x +=
          Math.sin(t * ud.swaySpeed + ud.sway) * 0.0012 * (dt * 60);
        if (p.position.y > 3.8) {
          p.position.y = -0.2;
          p.position.x = (Math.random() - 0.5) * 9;
          p.position.z = -1 + (Math.random() - 0.5) * 3;
        }
        // On celebration, particles tint gold.
        const mat = p.material as THREE.MeshBasicMaterial;
        if (t < r.celebrationUntil) {
          mat.color.lerp(new THREE.Color(0xfde047), lerpSpeed);
        } else {
          // material colour can drift back - but since we share materials
          // across particles, drifting back touches all particles of that colour.
          // That's fine; celebration is a brief 2s window.
        }
      });

      // ── Floating shields ──
      r.floatingShields.forEach((fs) => {
        fs.mesh.rotation.y += fs.rotSpeed * (dt * 60);
        const target =
          t < r.celebrationUntil
            ? new THREE.Color(0xfde047)
            : fs.baseColour;
        fs.material.color.lerp(target, lerpSpeed);
        const op = t < r.celebrationUntil ? 0.24 : 0.08;
        fs.material.opacity += (op - fs.material.opacity) * lerpSpeed;
      });

      // After celebration ends, lerp shared particle materials back to their
      // brand colours so subsequent celebrations still read as "turning gold".
      if (t >= r.celebrationUntil) {
        r.particleBaseColours.forEach((brand, mat) => {
          (mat as THREE.MeshBasicMaterial).color.lerp(brand, lerpSpeed * 0.5);
        });
      }

      // ── Shockwaves ──
      for (let i = r.shockwaves.length - 1; i >= 0; i--) {
        const sw = r.shockwaves[i];
        const age = t - sw.startTime;
        const dur = 0.45;
        if (age >= dur) {
          sw.mesh.visible = false;
          r.shockwavePool.push(sw);
          r.shockwaves.splice(i, 1);
          continue;
        }
        const progress = age / dur;
        // Geom inner ~0.5; scale 2→6 maps to radius 1→3.
        const scale = 2 + progress * 4;
        sw.mesh.scale.set(scale, scale, 1);
        sw.material.opacity = 0.55 * (1 - progress);
      }

      // ── Camera: very gentle idle drift (0.3°, 8s cycle) ──
      const drift = Math.sin((t * Math.PI * 2) / 8) * (0.3 * Math.PI) / 180;
      const R = 7;
      const baseX = Math.sin(drift) * R;
      const baseZ = Math.cos(drift) * R;

      // Wrong-answer micro-shake (very subtle, 0.5 units, 0.2s).
      let shakeX = 0;
      let shakeY = 0;
      if (t < r.wrongShakeUntil) {
        const remaining = (r.wrongShakeUntil - t) / 0.2;
        const mag = 0.5 * remaining;
        shakeX = (Math.random() - 0.5) * mag * 0.04;
        shakeY = (Math.random() - 0.5) * mag * 0.04;
      }

      r.camera.position.set(baseX + shakeX, 2.5 + shakeY, baseZ);
      r.camera.lookAt(0, 0.8, 0);

      r.renderer.render(r.scene, r.camera);
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      running = false;
      cancelAnimationFrame(rafId);

      const r = refs.current;
      if (!r) return;

      r.shockwaves.forEach((sw) => sw.material.dispose());
      r.shockwavePool.forEach((sw) => sw.material.dispose());

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

  // Resize
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
