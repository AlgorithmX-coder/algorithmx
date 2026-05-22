"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
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

/* Canvas-painted texture for the screen content. ALGORITHMX OS boot
 * sequence that references all six fields of the platform - not just
 * Cyber Heroes. Communicates platform breadth at a glance. */
function useScreenTexture(): THREE.Texture | null {
  return useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 640;
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    /* Background gradient */
    const grad = ctx.createLinearGradient(0, 0, 0, c.height);
    grad.addColorStop(0, "#020610");
    grad.addColorStop(0.5, "#031024");
    grad.addColorStop(1, "#020610");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, c.width, c.height);

    /* Soft cyan glow vignette */
    const glow = ctx.createRadialGradient(
      c.width / 2,
      c.height / 2,
      40,
      c.width / 2,
      c.height / 2,
      c.width / 1.4,
    );
    glow.addColorStop(0, "rgba(0,245,255,0.15)");
    glow.addColorStop(1, "rgba(0,245,255,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, c.width, c.height);

    /* Boot lines */
    ctx.font = "28px ui-monospace, 'Courier New', monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,245,255,0.8)";
    ctx.shadowBlur = 10;
    ctx.fillStyle = COLORS.cyanSoft;
    const headerLines = [
      "> ALGORITHMX_OS v1.0",
      "> loading curriculum...",
      "> 6 streams ready  ages 6 - adult",
    ];
    headerLines.forEach((line, i) => {
      ctx.fillText(line, 56, 90 + i * 44);
    });

    /* Six subject lines in their accent colors - shows the breadth */
    const subjects: Array<[string, string, string]> = [
      ["CYBERSECURITY", "LIVE", "#5fffa3"],
      ["GAME DEV", "2026", "#9ff5ff"],
      ["AI & ML", "2026", "#cba8ff"],
      ["APP DEV", "2027", "#ffd07a"],
      ["ENTREPRENEURSHIP", "2027", "#ffc94a"],
      ["ROBOTICS", "2027", "#ff3ad6"],
    ];
    ctx.font = "24px ui-monospace, monospace";
    subjects.forEach(([name, status, color], i) => {
      const y = 250 + i * 38;
      ctx.shadowBlur = 8;
      ctx.shadowColor = color + "cc";
      ctx.fillStyle = color;
      ctx.fillText(">  " + name, 80, y);
      /* Status badge on the right */
      const statusX = c.width - 220;
      ctx.fillStyle = color;
      ctx.fillRect(statusX - 8, y - 14, 130, 28);
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#04050d";
      ctx.font = "bold 18px ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.fillText(status, statusX + 57, y + 1);
      ctx.font = "24px ui-monospace, monospace";
      ctx.textAlign = "left";
    });

    /* Footer brand mark */
    ctx.shadowBlur = 6;
    ctx.shadowColor = "rgba(0,245,255,0.8)";
    ctx.fillStyle = COLORS.cyanSoft;
    ctx.font = "bold 20px ui-monospace, monospace";
    ctx.textAlign = "center";
    ctx.fillText("ALGORITHMX  //  TECHNOLOGY EDUCATION", c.width / 2, c.height - 40);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }, []);
}

/* Lazy texture cache for keyboard key labels. Each unique label string
 * is painted to a tiny canvas once and reused across every key with
 * that label. Cyan-soft glowing letterforms so they self-illuminate
 * when rendered with additive blending - reads as "backlit keycaps". */
const keyLabelCache = new Map<string, THREE.Texture | null>();
function getKeyLabelTexture(label: string): THREE.Texture | null {
  if (keyLabelCache.has(label)) return keyLabelCache.get(label) ?? null;
  if (typeof document === "undefined") {
    keyLabelCache.set(label, null);
    return null;
  }
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 128;
  const ctx = c.getContext("2d");
  if (!ctx) {
    keyLabelCache.set(label, null);
    return null;
  }
  ctx.clearRect(0, 0, c.width, c.height);
  /* Stronger cyan glow + bigger crisp letterform */
  ctx.shadowColor = "rgba(0,245,255,1)";
  ctx.shadowBlur = 22;
  ctx.fillStyle = "#ffffff";
  /* Size shrinks for longer labels (e.g., "shift", "enter", "tab") */
  const fontSize = label.length === 1 ? 96 : Math.max(48, 96 - label.length * 8);
  ctx.font = `900 ${fontSize}px ui-sans-serif, system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, c.width / 2, c.height / 2 + 4);
  /* Second pass without shadow to sharpen the core letterform */
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#e4f8ff";
  ctx.fillText(label, c.width / 2, c.height / 2 + 4);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  keyLabelCache.set(label, tex);
  return tex;
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
      camera={{ position: [4.6, 3.0, 6.5], fov: 38 }}
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

      <ambientLight intensity={1.1} color="#dde6ff" />
      <directionalLight position={[4, 6, 5]} intensity={2.0} color="#ffffff" />
      <pointLight position={[-3, 2.5, 4]} intensity={0.8} color={COLORS.cyan} />
      {/* Rim light from behind to highlight the lid's top edge */}
      <pointLight position={[2, 4, -3]} intensity={0.6} color="#ffffff" />

      <Laptop progress={progress} reducedMotion={reducedMotion} />
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

    /* Camera path - starts LOW and CLOSE so the closed-laptop slim
     *  profile reads as 3D (not a flat line from above). As the lid
     *  opens, camera rises + pulls back to frame the screen. */
    const camP = smoothstep(0, 1, p);
    state.camera.position.set(
      lerp(4.6, 4.0, camP),
      lerp(1.6, 2.4, camP),
      lerp(5.8, 5.6, camP),
    );
    state.camera.lookAt(RIG_X, lerp(0.1, 0.9, camP), 0);

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

    /* Lid hinge with SPRING INERTIA - the lid follows the scroll-derived
     * target angle through a damped spring, so it overshoots slightly
     * when scroll moves quickly then settles. Reads as "heavy aluminum
     * lid with real hinge mechanics" rather than perfect lerp tracking. */
    const openT = smoothstep(0.2, 0.6, p);
    const targetAngle = lerp(LID_CLOSED_ANGLE, LID_OPEN_ANGLE, openT);
    /* Critically-damped spring tuned for a hint of overshoot on fast
     *  scroll. stiffness ~38, damping ~7.5. Clamp dt to avoid the
     *  spring blowing up on tab refocus / first-frame spikes. */
    const dt = Math.min(0.05, delta);
    const stiffness = 38;
    const damping = 7.5;
    const force = (targetAngle - lidAngle.current) * stiffness;
    lidVelocity.current += (force - lidVelocity.current * damping) * dt;
    lidAngle.current += lidVelocity.current * dt;
    if (lidRef.current) {
      lidRef.current.rotation.x = lidAngle.current;
    }

    /* Screen ignite - content fades up + glow breathes as lid opens */
    const screenT = smoothstep(0.35, 0.65, p);
    if (screenContentMat.current) {
      screenContentMat.current.transparent = true;
      screenContentMat.current.opacity = screenT;
    }
    if (screenGlowMat.current) {
      const breathe = 0.85 + Math.sin(t * 1.4) * 0.15;
      screenGlowMat.current.opacity = screenT * 0.4 * breathe;
    }

    /* LED breathing */
    if (ledMat.current) {
      ledMat.current.emissiveIntensity = 1.5 + Math.sin(t * 2.1) * 0.5;
    }

    /* Holographic grid draws in over the first half of scroll */
    if (gridMat.current) {
      const draw = smoothstep(0.0, 0.5, p);
      const pulse = 0.85 + Math.sin(t * 0.8) * 0.1;
      gridMat.current.opacity = draw * 0.32 * pulse;
    }

    /* VOLUMETRIC SCREEN BEAM - soft cyan halo plane that floats above
     * the laptop, billboards to camera, opacity tied to lid-open. Reads
     * as "the screen is casting light into the room". */
    if (screenBeamRef.current) {
      screenBeamRef.current.lookAt(state.camera.position);
      const mat = screenBeamRef.current.material as THREE.MeshBasicMaterial;
      const breathe = 0.85 + Math.sin(t * 1.3) * 0.15;
      mat.opacity = smoothstep(0.35, 0.6, p) * 0.85 * breathe;
      /* Scale up a touch as the beam intensifies */
      const s = 1 + smoothstep(0.35, 1, p) * 0.3;
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

      {/* Holographic floor grid drawing in as you scroll */}
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

      {/* VOLUMETRIC SCREEN BEAM - large cyan radial glow plane that
       *  billboards to the camera. Hidden when lid is closed; ramps
       *  in as the screen ignites. */}
      {screenBeamTex && (
        <mesh ref={screenBeamRef} position={[RIG_X, 1.4, 0]}>
          <planeGeometry args={[5, 5]} />
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

      {/* LAPTOP */}
      <group position={[RIG_X, 0, 0]}>
        <RoundedBox args={[BASE_W, BASE_H, BASE_D]} radius={0.03} smoothness={4}>
          <meshStandardMaterial
            color={COLORS.steel}
            metalness={0.42}
            roughness={0.5}
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

        {/* SPEAKER GRILLES - perforated strips flanking the keyboard.
         *  Real ultrabooks (MacBook Pro 16, Razer Blade, XPS) have these
         *  bracketing the keyboard. Implemented as two thin dark panels
         *  with a dot-perforation overlay drawn on a separate canvas. */}
        {[-1, 1].map((side) => (
          <group
            key={`speaker-${side}`}
            position={[
              side * (BASE_W * 0.46),
              BASE_H / 2 + 0.001,
              -0.15,
            ]}
          >
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.16, BASE_D * 0.52]} />
              <meshStandardMaterial color="#040608" roughness={0.92} />
            </mesh>
            {/* Perforation dots (8 rows × 3 cols) */}
            {Array.from({ length: 8 }).flatMap((_, row) =>
              Array.from({ length: 3 }).map((_, col) => (
                <mesh
                  key={`${row}-${col}`}
                  position={[
                    (col - 1) * 0.045,
                    0.0005,
                    -0.5 + row * 0.14,
                  ]}
                  rotation={[-Math.PI / 2, 0, 0]}
                >
                  <circleGeometry args={[0.012, 10]} />
                  <meshStandardMaterial color="#0b1018" roughness={0.5} />
                </mesh>
              )),
            )}
          </group>
        ))}

        {/* BACKLIT KEYBOARD AMBIENT GLOW - very faint cyan blanket so
         *  the keyboard well shows a subtle backlight under the keys.
         *  Lowered opacity (0.2 -> 0.08) now that per-key underglows
         *  are also softer - the combined effect reads as real
         *  ultrabook backlight, not "carnival lights". */}
        <mesh
          position={[0, BASE_H / 2 + 0.002, -0.15]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[BASE_W * 0.82, BASE_D * 0.5]} />
          <meshBasicMaterial
            color={COLORS.cyan}
            transparent
            opacity={0.08}
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
                          : "#7df0ff"; // subtle cyan-soft default
              const glowOp = key.accent ? 0.4 : 0.18;
              const capColor =
                key.accent === "wasd" ? "#1a0e1a" : "#0e1018";
              const labelTex = key.label ? getKeyLabelTexture(key.label) : null;
              /* Label plane size - scales with key width. Capped so wide
               * keys (Tab / Caps / Shift / Enter) don't get oversized
               * text, but bigger than before so letters read clearly. */
              const labelW = Math.min(key.w * 0.88, 0.22);
              const labelH = Math.min(row.depth * 0.88, 0.11);
              return (
                <group
                  key={`r${rIdx}-k${kIdx}`}
                  position={[x, BASE_H / 2 + 0.003, row.z]}
                >
                  <mesh>
                    <boxGeometry args={[key.w * 0.94, 0.005, row.depth * 0.94]} />
                    <meshStandardMaterial
                      color={capColor}
                      roughness={0.5}
                      metalness={0.45}
                    />
                  </mesh>
                  {/* Subtle underglow */}
                  <mesh position={[0, -0.0028, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[key.w * 1.02, row.depth * 1.04]} />
                    <meshBasicMaterial
                      color={accentColor}
                      transparent
                      opacity={glowOp}
                      blending={THREE.AdditiveBlending}
                      depthWrite={false}
                      toneMapped={false}
                    />
                  </mesh>
                  {/* GLOWING KEY LABEL - cyan letterform painted on top
                   *  of the keycap. Additive blending so it reads as a
                   *  self-illuminated backlit letter, not a sticker. */}
                  {labelTex && (
                    <mesh
                      position={[0, 0.0032, 0]}
                      rotation={[-Math.PI / 2, 0, 0]}
                    >
                      <planeGeometry args={[labelW, labelH]} />
                      <meshBasicMaterial
                        map={labelTex}
                        transparent
                        opacity={0.95}
                        blending={THREE.AdditiveBlending}
                        depthWrite={false}
                        toneMapped={false}
                      />
                    </mesh>
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
              <meshStandardMaterial
                color={COLORS.steel}
                metalness={0.55}
                roughness={0.38}
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
