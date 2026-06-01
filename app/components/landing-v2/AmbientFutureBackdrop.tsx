"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import * as THREE from "three";

/**
 * AmbientFutureBackdrop. A single fixed-position WebGL layer that
 * carries FIVE distinct scene moods across the landing-page scroll
 * while staying ONE coherent visual universe.
 *
 * Scene 1 — Analytical Galaxy    (// THE STATE OF PLAY)
 * Scene 2 — Constellation Selector (// PICK YOUR STREAM)
 * Scene 3 — Orbital Journey       (// HOW IT WORKS)
 * Scene 4 — Protective Aurora     (// WHY FAMILIES TRUST ALGORITHMX)
 * Scene 5 — Launch Sequence       (// BEFORE YOU START)
 *
 * One Canvas hosts all five scenes. Each scene reads the scroll
 * progress MotionValue in its own useFrame and computes its own
 * 4-stop opacity envelope. Adjacent scenes' envelopes overlap by
 * about 4 percentage points of scroll progress, so the user never
 * sees a hard scene boundary — only one scene crossfading into
 * the next.
 *
 * Cohesion: shared circle sprite, shared additive-blending idiom,
 * shared cyan/teal/violet/magenta palette, single wrapping group
 * for cursor parallax, same CSS atmospheric glow underneath.
 *
 * Hard-gated off on prefers-reduced-motion and on small viewports
 * (≤ 640px) — the entire component returns null and no Canvas
 * mounts.
 */

/* ─────────────────────────────────────────────────────────────────
 * SHARED TEXTURES
 * ───────────────────────────────────────────────────────────────── */

function makeCircleSprite(): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.45, "rgba(255,255,255,0.75)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  tex.needsUpdate = true;
  return tex;
}

function makeGlowTexture(
  coreColor: string,
  edgeColor: string,
): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, coreColor);
  g.addColorStop(0.35, edgeColor);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/* Tiny deterministic hash so a single texture build is reproducible
 * even though we use Math.random — keeps the cosmic look consistent
 * between page loads while still allowing variety across textures.
 * (Math.random IS used; this is purely a small helper for the per-
 * texture seeded jitter loops below.) */
function rand01(): number {
  return Math.random();
}

function makeNebulaTexture(
  coreColor: string,
  midColor: string,
): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  const SIZE = 768;
  const c = document.createElement("canvas");
  c.width = c.height = SIZE;
  const ctx = c.getContext("2d");
  if (!ctx) return null;

  /* PASS 1 — Six big stretched elliptical blobs at varied rotations
   * and aspect ratios. Real nebulae aren't symmetric discs; they
   * elongate and clump. Random rotation + scale-y between 0.4-1.0
   * = organic non-radial silhouettes every time. Placement biased
   * off-centre via the offset (0.2 vs 0.5) so the cloud never sits
   * neatly in the middle. */
  const N_BIG = 6;
  for (let i = 0; i < N_BIG; i++) {
    const x = SIZE * (0.20 + rand01() * 0.60);
    const y = SIZE * (0.20 + rand01() * 0.60);
    const r = SIZE * (0.20 + rand01() * 0.25);
    const alpha = 0.50 + rand01() * 0.30;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rand01() * Math.PI);
    ctx.scale(1, 0.4 + rand01() * 0.55);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
    g.addColorStop(0, coreColor.replace("ALPHA", String(alpha)));
    g.addColorStop(0.42, midColor.replace("ALPHA", String(alpha * 0.5)));
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(-r * 1.5, -r * 1.5, r * 3, r * 3);
    ctx.restore();
  }

  /* PASS 2 — Many small accent blobs scattered across the canvas
   * to break up the smooth gradient mass. These add the "wisp" feel
   * that a clean radial gradient never has. */
  const N_SMALL = 22;
  for (let i = 0; i < N_SMALL; i++) {
    const x = SIZE * rand01();
    const y = SIZE * rand01();
    const r = SIZE * (0.05 + rand01() * 0.10);
    const alpha = 0.18 + rand01() * 0.28;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, coreColor.replace("ALPHA", String(alpha)));
    g.addColorStop(0.5, midColor.replace("ALPHA", String(alpha * 0.4)));
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, SIZE, SIZE);
  }

  /* PASS 3 — DUST LANES. Curved dark sweeps cut THROUGH the existing
   * cloud via destination-out. Real galaxies have dark dust bands that
   * obscure background light; the canvas equivalent is to ERASE part
   * of what's already drawn. Quadratic curves with variable widths
   * give natural fibrous shapes. */
  ctx.globalCompositeOperation = "destination-out";
  const N_LANES = 4;
  for (let i = 0; i < N_LANES; i++) {
    const x1 = rand01() * SIZE;
    const y1 = rand01() * SIZE;
    const len = SIZE * (0.32 + rand01() * 0.40);
    const angle = rand01() * Math.PI;
    const x2 = x1 + Math.cos(angle) * len;
    const y2 = y1 + Math.sin(angle) * len;
    const midX = (x1 + x2) / 2 + (rand01() - 0.5) * 80;
    const midY = (y1 + y2) / 2 + (rand01() - 0.5) * 80;
    const g = ctx.createLinearGradient(x1, y1, x2, y2);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(0.4, "rgba(0,0,0,0.55)");
    g.addColorStop(0.6, "rgba(0,0,0,0.55)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.strokeStyle = g;
    ctx.lineWidth = SIZE * (0.04 + rand01() * 0.05);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(midX, midY, x2, y2);
    ctx.stroke();
  }
  ctx.globalCompositeOperation = "source-over";

  /* PASS 4 — BRIGHT KNOTS. Small concentrated bright spots using
   * additive ("lighter") blend so they POP within the cloud — the
   * cosmic equivalent of denser star-forming regions. Stops the
   * cloud from reading as uniformly soft. */
  ctx.globalCompositeOperation = "lighter";
  const N_KNOTS = 7;
  for (let i = 0; i < N_KNOTS; i++) {
    const x = SIZE * (0.15 + rand01() * 0.7);
    const y = SIZE * (0.15 + rand01() * 0.7);
    const r = SIZE * (0.025 + rand01() * 0.05);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, coreColor.replace("ALPHA", "0.55"));
    g.addColorStop(0.4, midColor.replace("ALPHA", "0.18"));
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, SIZE, SIZE);
  }
  ctx.globalCompositeOperation = "source-over";

  /* PASS 5 — PROCEDURAL NOISE. Per-pixel ±~15-step random jitter
   * on RGB only (alpha untouched so the cloud silhouette is
   * unchanged). This is the single biggest cinematic upgrade: it
   * removes the "smooth gradient" tell and gives the cloud the
   * grainy texture of real long-exposure astrophotography. ~2.3M
   * pixel ops, runs once at mount, never per frame. */
  const img = ctx.getImageData(0, 0, SIZE, SIZE);
  const data = img.data;
  for (let i = 0; i < data.length; i += 4) {
    /* Only jitter pixels that are actually visible — saves work on
     * the transparent background and keeps the silhouette sharp at
     * the cloud edges. */
    if (data[i + 3] < 8) continue;
    const n = (rand01() - 0.5) * 26;
    data[i] = Math.max(0, Math.min(255, data[i] + n));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + n));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + n));
  }
  ctx.putImageData(img, 0, 0);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.needsUpdate = true;
  return tex;
}

/* Aurora ribbon — long horizontal band with vertical fade and
 * shimmer-style horizontal variation. Used by Scene 4. */
function makeAuroraTexture(coreRgb: string): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 256;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  /* Vertical gradient: transparent at top + bottom, peak at middle */
  const vGrad = ctx.createLinearGradient(0, 0, 0, c.height);
  vGrad.addColorStop(0, `rgba(${coreRgb},0)`);
  vGrad.addColorStop(0.5, `rgba(${coreRgb},0.9)`);
  vGrad.addColorStop(1, `rgba(${coreRgb},0)`);
  ctx.fillStyle = vGrad;
  ctx.fillRect(0, 0, c.width, c.height);
  /* Horizontal shimmer — destination-in lets us punch lower-alpha
   * stripes through the band so the aurora reads as organic light
   * rather than a flat coloured rectangle. */
  ctx.globalCompositeOperation = "destination-in";
  const stripes = 8;
  for (let i = 0; i < stripes; i++) {
    const x = (i / stripes) * c.width;
    const w = c.width / stripes;
    /* Deterministic-ish pattern — varied but stable per build */
    const alpha = 0.45 + ((i * 17 + 31) % 50) / 100;
    ctx.fillStyle = `rgba(0,0,0,${alpha})`;
    ctx.fillRect(x, 0, w, c.height);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/* ─────────────────────────────────────────────────────────────────
 * CLUSTERED STAR DATA — generates star positions biased toward a
 * handful of natural gravitational "centres" rather than uniformly
 * sprinkled across the volume. Real sky doesn't look like static-
 * noise TV; it has regions of density and regions of sparse
 * darkness. The clusters here are hand-placed off-centre so
 * cluster centres NEVER sit behind the centred content column.
 *
 * Returns positions + per-vertex colours encoding both COLOUR
 * TEMPERATURE (cool blue-white most common, occasional warm,
 * occasional violet, rare deep cyan) and BRIGHTNESS (most stars
 * dim, a handful bright). Because PointsMaterial uses a single
 * `size` prop, brightness encoded in colour produces perceived
 * size variation when combined with the circle sprite + additive
 * blending — dim stars sample near the soft edge of the sprite,
 * bright stars push the core to full brightness.
 * ───────────────────────────────────────────────────────────────── */
function generateClusteredStarData(
  count: number,
  zRange: [number, number],
  config?: { spread?: number; uniformPortion?: number },
): { positions: Float32Array; colors: Float32Array } {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const spread = config?.spread ?? 4.5;
  const uniformPortion = config?.uniformPortion ?? 0.18;

  /* Cluster centres — placed off the central viewport axis so the
   * brightest density NEVER sits directly behind text columns. */
  const clusters = [
    { x: -10, y:  4.5, z: -16, w: 0.26 },
    { x:   9, y: -2.0, z: -13, w: 0.22 },
    { x:  -3, y: -6.5, z: -20, w: 0.18 },
    { x:  12, y:  6.0, z: -18, w: 0.14 },
    { x:  -7, y:  1.0, z: -22, w: 0.12 },
    /* remaining ~8% picked uniformly via uniformPortion */
  ];

  for (let i = 0; i < count; i++) {
    let x: number, y: number, z: number;

    if (rand01() < uniformPortion) {
      /* Uniform background — keeps the field from feeling like
       * obvious clumps with empty space between them. */
      x = (rand01() - 0.5) * 32;
      y = (rand01() - 0.5) * 20;
      z = zRange[0] + rand01() * (zRange[1] - zRange[0]);
    } else {
      /* Weighted cluster pick */
      const roll = rand01();
      let cum = 0;
      let chosen = clusters[0];
      for (const c of clusters) {
        cum += c.w;
        if (roll < cum) {
          chosen = c;
          break;
        }
      }
      /* Two-roll trick approximates a Gaussian without Math.exp.
       * Most stars land near the cluster centre, fewer far out. */
      const sx = (rand01() + rand01() - 1) * spread;
      const sy = (rand01() + rand01() - 1) * spread * 0.7;
      const sz = (rand01() + rand01() - 1) * 3.5;
      x = chosen.x + sx;
      y = chosen.y + sy;
      z = chosen.z + sz;
      /* Clamp z to the requested range so cluster stars don't end
       * up in front of foreground content */
      if (z < zRange[0]) z = zRange[0];
      if (z > zRange[1]) z = zRange[1];
    }

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    /* BRIGHTNESS — power-law-ish: most stars dim, few bright */
    const bRoll = rand01();
    let b: number;
    if (bRoll < 0.05) b = 1.0;       // 5%  bright
    else if (bRoll < 0.22) b = 0.72; // 17% medium
    else if (bRoll < 0.55) b = 0.45; // 33% dim
    else b = 0.28;                    // 45% very dim

    /* COLOUR TEMPERATURE — biased to cool blue-white (real sky is
     * dominated by blue-white stars at this fidelity) with rare
     * warm + violet + cyan accents. */
    const cRoll = rand01();
    if (cRoll < 0.62) {
      colors[i * 3]     = 0.86 * b;
      colors[i * 3 + 1] = 0.93 * b;
      colors[i * 3 + 2] = 1.00 * b;
    } else if (cRoll < 0.80) {
      /* warm */
      colors[i * 3]     = 1.00 * b;
      colors[i * 3 + 1] = 0.84 * b;
      colors[i * 3 + 2] = 0.70 * b;
    } else if (cRoll < 0.92) {
      /* violet */
      colors[i * 3]     = 0.68 * b;
      colors[i * 3 + 1] = 0.52 * b;
      colors[i * 3 + 2] = 1.00 * b;
    } else {
      /* soft cyan */
      colors[i * 3]     = 0.42 * b;
      colors[i * 3 + 1] = 0.92 * b;
      colors[i * 3 + 2] = 1.00 * b;
    }
  }

  return { positions, colors };
}

/* ─────────────────────────────────────────────────────────────────
 * ENVELOPE HELPER — 4-stop opacity ramp:
 *   < a       : 0
 *   a → b     : 0 → 1 (smoothstep)
 *   b → c     : 1
 *   c → d     : 1 → 0 (smoothstep)
 *   > d       : 0
 * Used by every scene to compute its scroll-keyed visibility.
 * ───────────────────────────────────────────────────────────────── */
function envelope(p: number, a: number, b: number, c: number, d: number): number {
  if (p <= a || p >= d) return 0;
  if (p < b) {
    const t = (p - a) / (b - a);
    return t * t * (3 - 2 * t);
  }
  if (p < c) return 1;
  const t = (p - c) / (d - c);
  return 1 - t * t * (3 - 2 * t);
}

/* ─────────────────────────────────────────────────────────────────
 * SCENE 1 — ANALYTICAL GALAXY
 * State of Play. Tilted spiral disc with central glow, deep stars,
 * an ambient nebula and drifting data-square particles. The same
 * scene users saw in the previous iteration, but now scroll-gated
 * so it's just one chapter of the journey.
 * ───────────────────────────────────────────────────────────────── */
function Scene1AnalyticalGalaxy({
  progress,
  range,
  circleSprite,
}: {
  progress: MotionValue<number>;
  range: [number, number, number, number];
  circleSprite: THREE.Texture | null;
}) {
  /* Two nebula textures — different colour pairings for layered
   * depth. Each call to makeNebulaTexture produces a unique
   * silhouette (random blobs / lanes / knots) so the two layers
   * don't visually echo. */
  const nebulaCyan = useMemo(
    () =>
      makeNebulaTexture(
        "rgba(125,240,255,ALPHA)",
        "rgba(60,160,220,ALPHA)",
      ),
    [],
  );
  const nebulaViolet = useMemo(
    () =>
      makeNebulaTexture(
        "rgba(166,103,255,ALPHA)",
        "rgba(95,55,180,ALPHA)",
      ),
    [],
  );
  const coreOuterTex = useMemo(
    () => makeGlowTexture("rgba(232,237,255,0.85)", "rgba(166,103,255,0.45)"),
    [],
  );
  const coreInnerTex = useMemo(
    () => makeGlowTexture("rgba(255,255,255,0.95)", "rgba(125,240,255,0.55)"),
    [],
  );

  const DISC_COUNT = 320;
  const STAR_COUNT = 240;
  const FAR_STAR_COUNT = 180;
  const DATA_COUNT = 28;

  const discData = useMemo(() => {
    const positions = new Float32Array(DISC_COUNT * 3);
    const colors = new Float32Array(DISC_COUNT * 3);
    const SPIRAL_TWIST = 0.85;
    const MAX_R = 4.6;
    for (let i = 0; i < DISC_COUNT; i++) {
      const t = Math.random();
      const radius = 0.25 + Math.pow(t, 0.45) * MAX_R;
      const baseAngle = Math.random() * Math.PI * 2;
      const spiralAngle = baseAngle + radius * SPIRAL_TWIST;
      const zJitter = (Math.random() - 0.5) * 0.45 * Math.max(0.3, 1 - t);
      positions[i * 3] = Math.cos(spiralAngle) * radius;
      positions[i * 3 + 1] = zJitter;
      positions[i * 3 + 2] = Math.sin(spiralAngle) * radius;
      const distFactor = radius / MAX_R;
      const roll = Math.random();
      if (roll < 0.5) {
        const warm = 1 - distFactor * 0.45;
        colors[i * 3] = 0.85 * warm + 0.1;
        colors[i * 3 + 1] = 0.94 * warm + 0.06;
        colors[i * 3 + 2] = 1.0;
      } else if (roll < 0.78) {
        colors[i * 3] = 0.7 + distFactor * 0.15;
        colors[i * 3 + 1] = 0.5;
        colors[i * 3 + 2] = 1.0;
      } else {
        colors[i * 3] = 0.35;
        colors[i * 3 + 1] = 0.95;
        colors[i * 3 + 2] = 0.92;
      }
    }
    return { positions, colors };
  }, []);

  /* Mid-depth stars — clustered toward natural gravitational
   * centres rather than uniformly sprinkled, with brightness +
   * colour-temperature variation encoded per-vertex. */
  const starData = useMemo(
    () => generateClusteredStarData(STAR_COUNT, [-12, -18]),
    [],
  );
  /* Far-distance pinprick layer — tiny dim points sitting further
   * back. Uniformly distributed (not clustered) so they read as
   * the deep "background sky" the closer clustered layer sits
   * against. */
  const farStarData = useMemo(() => {
    const positions = new Float32Array(FAR_STAR_COUNT * 3);
    const colors = new Float32Array(FAR_STAR_COUNT * 3);
    for (let i = 0; i < FAR_STAR_COUNT; i++) {
      positions[i * 3] = (rand01() - 0.5) * 38;
      positions[i * 3 + 1] = (rand01() - 0.5) * 24;
      positions[i * 3 + 2] = -22 - rand01() * 10;
      /* Far stars are uniformly dim with slight cool-warm jitter */
      const b = 0.22 + rand01() * 0.18;
      const w = rand01();
      if (w < 0.75) {
        colors[i * 3] = 0.88 * b;
        colors[i * 3 + 1] = 0.94 * b;
        colors[i * 3 + 2] = 1.0 * b;
      } else {
        colors[i * 3] = 1.0 * b;
        colors[i * 3 + 1] = 0.82 * b;
        colors[i * 3 + 2] = 0.7 * b;
      }
    }
    return { positions, colors };
  }, []);

  const dataPositions = useMemo(() => {
    const arr = new Float32Array(DATA_COUNT * 3);
    for (let i = 0; i < DATA_COUNT; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 13;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 2] = -1.5 - Math.random() * 4;
    }
    return arr;
  }, []);

  const discRef = useRef<THREE.Points>(null);
  const starsRef = useRef<THREE.Points>(null);
  const farStarsRef = useRef<THREE.Points>(null);
  const dataRef = useRef<THREE.Points>(null);
  const discMat = useRef<THREE.PointsMaterial>(null);
  const starsMat = useRef<THREE.PointsMaterial>(null);
  const farStarsMat = useRef<THREE.PointsMaterial>(null);
  const dataMat = useRef<THREE.PointsMaterial>(null);
  const coreOuterMat = useRef<THREE.MeshBasicMaterial>(null);
  const coreInnerMat = useRef<THREE.MeshBasicMaterial>(null);
  const nebulaCyanMat = useRef<THREE.MeshBasicMaterial>(null);
  const nebulaVioletMat = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((_, delta) => {
    const env = envelope(progress.get(), range[0], range[1], range[2], range[3]);

    if (discMat.current) discMat.current.opacity = env * 0.92;
    if (starsMat.current) starsMat.current.opacity = env * 0.78;
    if (farStarsMat.current) farStarsMat.current.opacity = env * 0.55;
    if (dataMat.current) dataMat.current.opacity = env * 0.95;
    if (coreOuterMat.current) coreOuterMat.current.opacity = env * 0.55;
    if (coreInnerMat.current) coreInnerMat.current.opacity = env * 0.7;
    /* Two nebula planes at different opacities — cyan louder (closer
     * conceptually), violet much fainter and further back. The two
     * layers' DIFFERENT random silhouettes (each makeNebulaTexture
     * call uses fresh Math.random) means they overlap as real layered
     * gas, not as identical clouds. */
    if (nebulaCyanMat.current) nebulaCyanMat.current.opacity = env * 0.22;
    if (nebulaVioletMat.current) nebulaVioletMat.current.opacity = env * 0.14;

    if (discRef.current) discRef.current.rotation.y += delta * 0.045;
    if (starsRef.current) starsRef.current.rotation.y += 0.00010;
    /* Far stars drift at a different (slower) rate than the near
     * starfield — when the cursor parallax tilts the scene, the two
     * layers shift at different visual speeds, giving real parallax
     * depth between them. */
    if (farStarsRef.current) farStarsRef.current.rotation.y += 0.00004;

    /* Drift data particles slowly upward, wrap when off-top */
    if (dataRef.current) {
      const attr = dataRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const arr = attr.array as Float32Array;
      for (let i = 0; i < DATA_COUNT; i++) {
        arr[i * 3 + 1] += 0.0028;
        if (arr[i * 3 + 1] > 4) arr[i * 3 + 1] = -4;
      }
      attr.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Violet nebula — DEEPER layer, off-centre, smaller. Paints
       *  first so the cyan nebula above it carries the foreground
       *  warmth and the violet sits as a quieter background hint. */}
      {nebulaViolet && (
        <mesh position={[-6, 3, -14]} rotation={[0, 0, -0.7]}>
          <planeGeometry args={[20, 16]} />
          <meshBasicMaterial
            ref={nebulaVioletMat}
            map={nebulaViolet}
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}

      {/* Ambient cyan nebula — NEARER layer, larger, drives the
       *  primary cloud silhouette. Combined with the violet behind
       *  it the two layers parallax independently under cursor
       *  movement. */}
      {nebulaCyan && (
        <mesh position={[2.5, -1, -9]} rotation={[0, 0, 0.4]}>
          <planeGeometry args={[28, 22]} />
          <meshBasicMaterial
            ref={nebulaCyanMat}
            map={nebulaCyan}
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}

      {/* FAR pinprick starfield — uniform tiny dim points sitting
       *  way back behind the cluster layer. Real deep-sky pin pricks
       *  that the eye can resolve only when you look for them. */}
      <points ref={farStarsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[farStarData.positions, 3]} count={FAR_STAR_COUNT} />
          <bufferAttribute attach="attributes-color" args={[farStarData.colors, 3]} count={FAR_STAR_COUNT} />
        </bufferGeometry>
        <pointsMaterial
          ref={farStarsMat}
          size={0.024}
          vertexColors
          transparent
          opacity={0}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          map={circleSprite ?? undefined}
        />
      </points>

      {/* MID-DEPTH clustered starfield — naturally grouped around
       *  off-centre cluster centres, with brightness and colour-
       *  temperature variation per vertex. */}
      <points ref={starsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[starData.positions, 3]} count={STAR_COUNT} />
          <bufferAttribute attach="attributes-color" args={[starData.colors, 3]} count={STAR_COUNT} />
        </bufferGeometry>
        <pointsMaterial
          ref={starsMat}
          size={0.045}
          vertexColors
          transparent
          opacity={0}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          map={circleSprite ?? undefined}
        />
      </points>

      {/* Galaxy disc with central glow, tilted + off-centre */}
      <group position={[2.1, -0.4, -3.6]} rotation={[0.55, 0, 0.18]}>
        {coreOuterTex && (
          <mesh>
            <planeGeometry args={[3.8, 3.8]} />
            <meshBasicMaterial
              ref={coreOuterMat}
              map={coreOuterTex}
              transparent
              opacity={0}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        )}
        {coreInnerTex && (
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[1.8, 1.8]} />
            <meshBasicMaterial
              ref={coreInnerMat}
              map={coreInnerTex}
              transparent
              opacity={0}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        )}
        <points ref={discRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[discData.positions, 3]} count={DISC_COUNT} />
            <bufferAttribute attach="attributes-color" args={[discData.colors, 3]} count={DISC_COUNT} />
          </bufferGeometry>
          <pointsMaterial
            ref={discMat}
            size={0.07}
            vertexColors
            transparent
            opacity={0}
            sizeAttenuation
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            map={circleSprite ?? undefined}
          />
        </points>
      </group>

      {/* Foreground square data particles, drifting upward */}
      <points ref={dataRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dataPositions, 3]} count={DATA_COUNT} />
        </bufferGeometry>
        <pointsMaterial
          ref={dataMat}
          size={0.048}
          color="#9fe6ff"
          transparent
          opacity={0}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────────
 * SCENE 2 — CONSTELLATION SELECTOR
 * Pick Your Stream. Six small constellation clusters, one per
 * stream, each tinted in its stream's accent colour. Stars
 * connected by thin additive line segments. Slow per-cluster
 * rotation. Reads as "pathways in a digital universe", not as
 * astronomy.
 * ───────────────────────────────────────────────────────────────── */

const STREAM_COLORS = [
  "#5fffa3", // cybersecurity – green
  "#9ff5ff", // game dev      – cyan
  "#cba8ff", // ai & ml       – violet
  "#ffd07a", // app dev       – gold
  "#ffc94a", // entrepreneurship – amber
  "#ff3ad6", // robotics      – magenta
];

/* Hand-placed constellation anchor points so the six clusters are
 * spread across the viewport instead of overlapping in the middle. */
const CONSTELLATION_ANCHORS: Array<[number, number, number]> = [
  [-5.5,  2.5, -3.0],
  [ 5.0,  2.8, -4.0],
  [-4.2, -1.5, -2.5],
  [ 4.5, -2.0, -3.5],
  [-1.5,  3.5, -5.0],
  [ 2.0, -3.5, -2.0],
];

function generateConstellation(): { points: Float32Array; lines: Float32Array } {
  /* 5 vertices per cluster, dispersed in a small box */
  const N = 5;
  const pts: number[] = [];
  for (let i = 0; i < N; i++) {
    pts.push(
      (Math.random() - 0.5) * 1.6,
      (Math.random() - 0.5) * 1.4,
      (Math.random() - 0.5) * 0.6,
    );
  }
  /* 4 segments: connect sequentially, then close the last back to
   * the first so each constellation reads as a small enclosed
   * shape rather than a random scatter. */
  const linkOrder = [0, 1, 1, 2, 2, 3, 3, 4, 4, 0];
  const lines = new Float32Array(linkOrder.length * 3);
  for (let i = 0; i < linkOrder.length; i++) {
    const idx = linkOrder[i] * 3;
    lines[i * 3] = pts[idx];
    lines[i * 3 + 1] = pts[idx + 1];
    lines[i * 3 + 2] = pts[idx + 2];
  }
  return { points: new Float32Array(pts), lines };
}

function Scene2ConstellationSelector({
  progress,
  range,
  circleSprite,
}: {
  progress: MotionValue<number>;
  range: [number, number, number, number];
  circleSprite: THREE.Texture | null;
}) {
  /* One constellation per stream — geometry seeded once on mount. */
  const constellations = useMemo(
    () =>
      STREAM_COLORS.map((color, i) => ({
        color,
        anchor: CONSTELLATION_ANCHORS[i],
        geom: generateConstellation(),
      })),
    [],
  );

  const groupRefs = useRef<Array<THREE.Group | null>>(
    Array(STREAM_COLORS.length).fill(null),
  );
  const pointsMatRefs = useRef<Array<THREE.PointsMaterial | null>>(
    Array(STREAM_COLORS.length).fill(null),
  );
  const lineMatRefs = useRef<Array<THREE.LineBasicMaterial | null>>(
    Array(STREAM_COLORS.length).fill(null),
  );

  useFrame((_, delta) => {
    const env = envelope(progress.get(), range[0], range[1], range[2], range[3]);
    for (let i = 0; i < STREAM_COLORS.length; i++) {
      const pm = pointsMatRefs.current[i];
      const lm = lineMatRefs.current[i];
      const g = groupRefs.current[i];
      if (pm) pm.opacity = env * 0.88;
      if (lm) lm.opacity = env * 0.28;
      /* Each constellation rotates around its own local axis at a
       * different micro-rate. Combined effect: subtle "constellation
       * field is alive" without anything visibly spinning. */
      if (g) g.rotation.z += delta * (0.04 + i * 0.008);
    }
  });

  return (
    <group>
      {constellations.map((c, i) => (
        <group
          key={i}
          ref={(el) => {
            groupRefs.current[i] = el;
          }}
          position={c.anchor}
        >
          <points>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[c.geom.points, 3]}
                count={5}
              />
            </bufferGeometry>
            <pointsMaterial
              ref={(el) => {
                pointsMatRefs.current[i] = el;
              }}
              size={0.18}
              color={c.color}
              transparent
              opacity={0}
              sizeAttenuation
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              map={circleSprite ?? undefined}
            />
          </points>
          <lineSegments>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[c.geom.lines, 3]}
                count={c.geom.lines.length / 3}
              />
            </bufferGeometry>
            <lineBasicMaterial
              ref={(el) => {
                lineMatRefs.current[i] = el;
              }}
              color={c.color}
              transparent
              opacity={0}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </lineSegments>
        </group>
      ))}
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────────
 * SCENE 3 — ORBITAL JOURNEY
 * How It Works. Four faint elliptical orbit rings at staggered
 * tilts and depths, each with a small "traveler" point moving
 * along its path. Reads as a route map / navigation field.
 * ───────────────────────────────────────────────────────────────── */

interface OrbitDef {
  rx: number;
  rz: number;
  tilt: [number, number, number];
  position: [number, number, number];
  color: string;
  travelerColor: string;
  travelerSpeed: number;
}

const ORBIT_DEFS: OrbitDef[] = [
  { rx: 3.6, rz: 2.2, tilt: [0.6,  0.0,  0.2], position: [ 0.5,  0.5, -4], color: "#7df0ff", travelerColor: "#ffffff", travelerSpeed: 0.18 },
  { rx: 2.4, rz: 1.7, tilt: [0.4, -0.3, -0.1], position: [-1.5, -0.8, -3], color: "#a667ff", travelerColor: "#cba8ff", travelerSpeed: 0.24 },
  { rx: 4.5, rz: 2.8, tilt: [0.8,  0.4,  0.0], position: [ 1.5,  0.2, -5], color: "#5fffd0", travelerColor: "#a8ffe8", travelerSpeed: 0.12 },
  { rx: 3.0, rz: 1.9, tilt: [0.5, -0.2,  0.3], position: [-0.5,  1.5, -3.5], color: "#9ff5ff", travelerColor: "#ffffff", travelerSpeed: 0.20 },
];

function makeOrbitGeometry(rx: number, rz: number, segments = 96): Float32Array {
  /* LineLoop-friendly array: pairs of vertices for LineSegments so
   * each segment connects two adjacent points around the ellipse. */
  const positions = new Float32Array(segments * 2 * 3);
  for (let i = 0; i < segments; i++) {
    const a0 = (i / segments) * Math.PI * 2;
    const a1 = ((i + 1) / segments) * Math.PI * 2;
    positions[i * 6 + 0] = Math.cos(a0) * rx;
    positions[i * 6 + 1] = 0;
    positions[i * 6 + 2] = Math.sin(a0) * rz;
    positions[i * 6 + 3] = Math.cos(a1) * rx;
    positions[i * 6 + 4] = 0;
    positions[i * 6 + 5] = Math.sin(a1) * rz;
  }
  return positions;
}

function Scene3OrbitalJourney({
  progress,
  range,
  circleSprite,
}: {
  progress: MotionValue<number>;
  range: [number, number, number, number];
  circleSprite: THREE.Texture | null;
}) {
  const orbitGeoms = useMemo(
    () => ORBIT_DEFS.map((o) => makeOrbitGeometry(o.rx, o.rz)),
    [],
  );

  const lineRefs = useRef<Array<THREE.LineBasicMaterial | null>>(
    Array(ORBIT_DEFS.length).fill(null),
  );
  const travelerRefs = useRef<Array<THREE.Mesh | null>>(
    Array(ORBIT_DEFS.length).fill(null),
  );
  const travelerMatRefs = useRef<Array<THREE.MeshBasicMaterial | null>>(
    Array(ORBIT_DEFS.length).fill(null),
  );
  const travelerPhases = useRef<number[]>(
    ORBIT_DEFS.map((_, i) => (i / ORBIT_DEFS.length) * Math.PI * 2),
  );

  useFrame((_, delta) => {
    const env = envelope(progress.get(), range[0], range[1], range[2], range[3]);
    for (let i = 0; i < ORBIT_DEFS.length; i++) {
      const lm = lineRefs.current[i];
      const tm = travelerMatRefs.current[i];
      const t = travelerRefs.current[i];
      if (lm) lm.opacity = env * 0.32;
      if (tm) tm.opacity = env * 0.95;
      /* Advance traveler phase, position on ellipse */
      if (t) {
        const def = ORBIT_DEFS[i];
        travelerPhases.current[i] += delta * def.travelerSpeed;
        const a = travelerPhases.current[i];
        t.position.set(Math.cos(a) * def.rx, 0, Math.sin(a) * def.rz);
      }
    }
  });

  return (
    <group>
      {ORBIT_DEFS.map((def, i) => (
        <group
          key={i}
          position={def.position}
          rotation={def.tilt}
        >
          {/* Orbit ring drawn as LineSegments around the ellipse */}
          <lineSegments>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[orbitGeoms[i], 3]}
                count={orbitGeoms[i].length / 3}
              />
            </bufferGeometry>
            <lineBasicMaterial
              ref={(el) => {
                lineRefs.current[i] = el;
              }}
              color={def.color}
              transparent
              opacity={0}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </lineSegments>
          {/* Traveler — small bright point sliding along the orbit */}
          <mesh
            ref={(el) => {
              travelerRefs.current[i] = el;
            }}
          >
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshBasicMaterial
              ref={(el) => {
                travelerMatRefs.current[i] = el;
              }}
              color={def.travelerColor}
              transparent
              opacity={0}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
      {/* Use circleSprite var to satisfy linter — it's part of the
       *  shared design language even when this scene doesn't render
       *  a sprite-textured Points group. */}
      {circleSprite ? null : null}
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────────
 * SCENE 4 — PROTECTIVE AURORA
 * Why Families Trust. Three soft aurora ribbons drifting on long
 * wave cycles, plus a sparse ambient star layer. Pastel cyan and
 * violet — calmer than the other scenes. Fewer moving elements;
 * the goal is reassurance, not spectacle.
 * ───────────────────────────────────────────────────────────────── */

function Scene4ProtectiveAurora({
  progress,
  range,
  circleSprite,
}: {
  progress: MotionValue<number>;
  range: [number, number, number, number];
  circleSprite: THREE.Texture | null;
}) {
  const auroraCyan = useMemo(() => makeAuroraTexture("125,240,255"), []);
  const auroraViolet = useMemo(() => makeAuroraTexture("166,103,255"), []);
  const auroraTeal = useMemo(() => makeAuroraTexture("95,255,208"), []);

  /* Stars in the trust scene use the same clustered generator with
   * a softer spread + higher uniform portion — looks calmer than
   * Scene 1's dense cluster regions. */
  const STAR_COUNT = 110;
  const starData = useMemo(
    () =>
      generateClusteredStarData(STAR_COUNT, [-8, -16], {
        spread: 5.5,
        uniformPortion: 0.32,
      }),
    [],
  );

  const auroraRefs = useRef<Array<THREE.Mesh | null>>([null, null, null]);
  const auroraMatRefs = useRef<Array<THREE.MeshBasicMaterial | null>>([null, null, null]);
  const starMatRef = useRef<THREE.PointsMaterial>(null);

  /* Three aurora bands with hand-tuned positions / sizes / phases */
  const bands = [
    { tex: auroraCyan,   y:  1.5, z: -5, w: 20, h: 4.5, basePhase: 0.0,  speed: 0.18, opacity: 0.40 },
    { tex: auroraViolet, y: -1.2, z: -7, w: 22, h: 4.0, basePhase: 1.3,  speed: 0.13, opacity: 0.32 },
    { tex: auroraTeal,   y:  0.2, z: -3, w: 16, h: 3.0, basePhase: 0.6,  speed: 0.22, opacity: 0.28 },
  ];

  useFrame((state) => {
    const env = envelope(progress.get(), range[0], range[1], range[2], range[3]);
    const t = state.clock.elapsedTime;
    if (starMatRef.current) starMatRef.current.opacity = env * 0.5;
    for (let i = 0; i < bands.length; i++) {
      const mat = auroraMatRefs.current[i];
      const m = auroraRefs.current[i];
      if (mat) {
        /* Aurora bands breathe out of phase with each other so the
         * field never feels mechanical. Caps at the band's base
         * opacity. */
        const breathe = 0.65 + Math.sin(t * 0.25 + bands[i].basePhase) * 0.35;
        mat.opacity = env * bands[i].opacity * breathe;
      }
      if (m) {
        /* Drift the bands horizontally on long cycles — feels like
         * wind moving the aurora. */
        m.position.x =
          Math.sin(t * 0.05 + bands[i].basePhase * 0.7) * 1.4;
      }
    }
  });

  return (
    <group>
      {bands.map((band, i) =>
        band.tex ? (
          <mesh
            key={i}
            ref={(el) => {
              auroraRefs.current[i] = el;
            }}
            position={[0, band.y, band.z]}
          >
            <planeGeometry args={[band.w, band.h]} />
            <meshBasicMaterial
              ref={(el) => {
                auroraMatRefs.current[i] = el;
              }}
              map={band.tex}
              transparent
              opacity={0}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        ) : null,
      )}

      {/* Sparse calming stars — clustered (softly), with per-vertex
       *  brightness and colour temperature variation. Cooler overall
       *  than Scene 1's deep field, more uniform spread for the
       *  calmer "trust field" mood. */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[starData.positions, 3]}
            count={STAR_COUNT}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[starData.colors, 3]}
            count={STAR_COUNT}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={starMatRef}
          size={0.042}
          vertexColors
          transparent
          opacity={0}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          map={circleSprite ?? undefined}
        />
      </points>
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────────
 * SCENE 5 — LAUNCH SEQUENCE
 * Before You Start. A central energy build-up: three slowly-
 * rotating concentric rings, a soft glow core, and ~30 particles
 * spawning at the outer radius and drifting inward toward the
 * core. Reads as "powering up to begin".
 * ───────────────────────────────────────────────────────────────── */

function Scene5LaunchSequence({
  progress,
  range,
  circleSprite,
}: {
  progress: MotionValue<number>;
  range: [number, number, number, number];
  circleSprite: THREE.Texture | null;
}) {
  const glowTex = useMemo(
    () =>
      makeGlowTexture("rgba(232,237,255,0.92)", "rgba(125,240,255,0.45)"),
    [],
  );

  const PARTICLE_COUNT = 36;
  const SCENE_POS: [number, number, number] = [0, 0, -4];

  /* Particle initial seed positions — wide spherical shell, will
   * be respawned by useFrame as they reach the centre. */
  const initialPositions = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const r = 3 + Math.random() * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  const ringRefs = useRef<Array<THREE.Mesh | null>>([null, null, null]);
  const ringMatRefs = useRef<Array<THREE.MeshBasicMaterial | null>>([null, null, null]);
  const glowMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const particleMatRef = useRef<THREE.PointsMaterial>(null);

  const ringDefs = [
    { radius: 2.0, tube: 0.012, rot: [0.3,  0.0,  0.0] as [number, number, number], speed:  0.08, color: "#7df0ff", opacityBase: 0.32 },
    { radius: 3.4, tube: 0.010, rot: [0.5, -0.2,  0.2] as [number, number, number], speed: -0.06, color: "#a667ff", opacityBase: 0.22 },
    { radius: 4.8, tube: 0.008, rot: [0.2,  0.3, -0.1] as [number, number, number], speed:  0.04, color: "#5fffd0", opacityBase: 0.16 },
  ];

  useFrame((state, delta) => {
    const env = envelope(progress.get(), range[0], range[1], range[2], range[3]);
    const t = state.clock.elapsedTime;

    /* Convergence — every particle drifts toward the local origin
     * (centre of this scene's group); on arrival it respawns out
     * at the spherical shell. */
    if (particlesRef.current) {
      const attr = particlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const arr = attr.array as Float32Array;
      const speed = 0.45 * delta;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const x = arr[i * 3];
        const y = arr[i * 3 + 1];
        const z = arr[i * 3 + 2];
        const dist = Math.sqrt(x * x + y * y + z * z);
        if (dist > 0.4) {
          const k = 1 - speed / dist;
          arr[i * 3] = x * k;
          arr[i * 3 + 1] = y * k;
          arr[i * 3 + 2] = z * k;
        } else {
          /* Respawn at outer shell */
          const r = 3 + Math.random() * 3;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
          arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
          arr[i * 3 + 2] = r * Math.cos(phi);
        }
      }
      attr.needsUpdate = true;
    }

    /* Core pulse — central glow breathes faster than aurora to
     * give the launch scene more "active power" energy. */
    if (glowMatRef.current) {
      const pulse = 0.78 + Math.sin(t * 1.4) * 0.22;
      glowMatRef.current.opacity = env * 0.5 * pulse;
    }
    if (particleMatRef.current) particleMatRef.current.opacity = env * 0.95;

    /* Rings rotate independently */
    for (let i = 0; i < ringDefs.length; i++) {
      const m = ringRefs.current[i];
      const mat = ringMatRefs.current[i];
      if (m) m.rotation.z += delta * ringDefs[i].speed;
      if (mat) {
        const breathe = 0.7 + Math.sin(t * 0.6 + i * 0.7) * 0.3;
        mat.opacity = env * ringDefs[i].opacityBase * breathe;
      }
    }
  });

  return (
    <group position={SCENE_POS}>
      {/* Core glow */}
      {glowTex && (
        <mesh>
          <planeGeometry args={[6, 6]} />
          <meshBasicMaterial
            ref={glowMatRef}
            map={glowTex}
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}

      {/* Three concentric rings — torus geometry, all centred on
       *  the scene origin, each tilted differently. */}
      {ringDefs.map((d, i) => (
        <mesh
          key={i}
          ref={(el) => {
            ringRefs.current[i] = el;
          }}
          rotation={d.rot}
        >
          <torusGeometry args={[d.radius, d.tube, 8, 110]} />
          <meshBasicMaterial
            ref={(el) => {
              ringMatRefs.current[i] = el;
            }}
            color={d.color}
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* Converging particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[initialPositions, 3]}
            count={PARTICLE_COUNT}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={particleMatRef}
          size={0.07}
          color="#c2f5ff"
          transparent
          opacity={0}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          map={circleSprite ?? undefined}
        />
      </points>
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────────
 * UNIVERSE SCENE — wraps all five scenes in a single cursor-
 * parallax group. Every scene is always mounted; their opacity
 * envelopes (each gated on scroll progress) decide what's visible
 * at any moment. Adjacent envelopes overlap by ~4 points of
 * scroll, producing a smooth crossfade instead of a hard cut.
 * ───────────────────────────────────────────────────────────────── */
function UniverseScene({ progress }: { progress: MotionValue<number> }) {
  const groupRef = useRef<THREE.Group>(null);
  const circleSprite = useMemo(() => makeCircleSprite(), []);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      state.pointer.x * 0.045,
      0.02,
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      -state.pointer.y * 0.03,
      0.02,
    );
  });

  return (
    <group ref={groupRef}>
      <Scene1AnalyticalGalaxy
        progress={progress}
        range={[0.18, 0.26, 0.36, 0.44]}
        circleSprite={circleSprite}
      />
      <Scene2ConstellationSelector
        progress={progress}
        range={[0.36, 0.44, 0.54, 0.62]}
        circleSprite={circleSprite}
      />
      <Scene3OrbitalJourney
        progress={progress}
        range={[0.54, 0.62, 0.70, 0.78]}
        circleSprite={circleSprite}
      />
      <Scene4ProtectiveAurora
        progress={progress}
        range={[0.70, 0.78, 0.86, 0.92]}
        circleSprite={circleSprite}
      />
      <Scene5LaunchSequence
        progress={progress}
        range={[0.86, 0.92, 0.98, 1.0]}
        circleSprite={circleSprite}
      />
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────────
 * MAIN COMPONENT — capability gates + outer envelope + Canvas
 * ───────────────────────────────────────────────────────────────── */
export default function AmbientFutureBackdrop() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const smallViewport = window.matchMedia("(max-width: 640px)");
    const compute = () => {
      setEnabled(!reducedMotion.matches && !smallViewport.matches);
    };
    compute();
    reducedMotion.addEventListener("change", compute);
    smallViewport.addEventListener("change", compute);
    return () => {
      reducedMotion.removeEventListener("change", compute);
      smallViewport.removeEventListener("change", compute);
    };
  }, []);

  const { scrollYProgress } = useScroll();

  /* Outer fade — keeps the whole layer hidden through the hero
   * cinematic (which has its own scene) and gently dims toward the
   * very bottom of the page so the footer isn't lit by the
   * launch-sequence core. */
  const outerOpacity = useTransform(
    scrollYProgress,
    [0.14, 0.20, 0.98, 1.0],
    [0, 1, 1, 0],
  );

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      style={{
        opacity: outerOpacity,
        position: "fixed",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
        overflow: "hidden",
        /* Soft radial mask — keeps the centre of the viewport (where
         * text + cards live) ~55% visible while the edges stay at
         * 100%. Same readability protection that worked for the
         * single-galaxy iteration; applies uniformly to every scene
         * so the shared protection language stays consistent. */
        maskImage:
          "radial-gradient(ellipse 92% 70% at 50% 50%, " +
          "rgba(0,0,0,0.55) 0%, " +
          "rgba(0,0,0,0.88) 55%, " +
          "rgba(0,0,0,1) 100%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 92% 70% at 50% 50%, " +
          "rgba(0,0,0,0.55) 0%, " +
          "rgba(0,0,0,0.88) 55%, " +
          "rgba(0,0,0,1) 100%)",
      }}
    >
      {/* CSS atmospheric glow — broad cyan/violet drift across the
       *  entire scroll. Pure CSS, composited on the GPU; provides
       *  the always-on colour wash that ties every WebGL scene to
       *  the same dark base. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          width: "60vmax",
          height: "60vmax",
          top: "10%",
          left: "5%",
          background:
            "radial-gradient(circle, rgba(0,229,255,0.16) 0%, " +
            "rgba(124,92,255,0.10) 35%, transparent 70%)",
          filter: "blur(80px)",
          animation: "lv2-ambient-drift 36s ease-in-out infinite alternate",
          willChange: "transform",
        }}
      />

      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 6], fov: 55 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "default",
        }}
        style={{ position: "absolute", inset: 0 }}
      >
        <UniverseScene progress={scrollYProgress} />
      </Canvas>

      <style jsx>{`
        @keyframes lv2-ambient-drift {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(20vw, 10vh, 0) scale(1.1);
          }
          100% {
            transform: translate3d(35vw, 24vh, 0) scale(1.04);
          }
        }
      `}</style>
    </motion.div>
  );
}
