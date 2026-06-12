"use client";

/**
 * TechChamber — understated background depth behind the laptop. Two
 * additive light bands only (the dark architectural column silhouettes were
 * removed — they read as odd floating black blocks):
 *   - a central rear LIGHT SHAFT / portal beam (the bright vertical glow in
 *     the reference), additive, brightening through the activation phases
 *   - a faint atmospheric HAZE wash for aerial perspective
 *
 * Both are gated to be invisible while the laptop is closed (scroll < ~0.32)
 * and fade in as the lid opens, so the top of the hero reads as a clean,
 * empty backdrop with just the device, and the chamber assembles in on
 * scroll. All self-lit additive — adds NO new lights, so the laptop render
 * is untouched. Reduced motion only freezes the slow drift.
 */

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";

const RIG_X = 1.4;

const smoothstep = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

function makeBeamTexture(): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  const w = 128;
  const h = 512;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  ctx.clearRect(0, 0, w, h);
  // vertical shaft: bright base fading up + horizontal taper to soft edges
  const g = ctx.createLinearGradient(0, h, 0, 0);
  /* softer, dimmer cyan→violet portal beam so it whispers in deep space */
  g.addColorStop(0, "rgba(120,190,255,0.4)");
  g.addColorStop(0.4, "rgba(92,112,235,0.16)");
  g.addColorStop(1, "rgba(40,44,120,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const taper = ctx.createLinearGradient(0, 0, w, 0);
  taper.addColorStop(0, "rgba(0,0,0,1)");
  taper.addColorStop(0.5, "rgba(0,0,0,0)");
  taper.addColorStop(1, "rgba(0,0,0,1)");
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = taper;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = "source-over";
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function makeHazeTexture(): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  const S = 512;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  ctx.clearRect(0, 0, S, S);
  const g = ctx.createRadialGradient(S / 2, S * 0.66, 0, S / 2, S * 0.66, S * 0.62);
  /* deep-space depth glow (was a bright blue room wall) — dimmer + a touch
   * of violet so it reads as faint nebula depth, not a lit backdrop */
  g.addColorStop(0, "rgba(48,72,150,0.34)");
  g.addColorStop(0.45, "rgba(42,54,120,0.16)");
  g.addColorStop(0.75, "rgba(28,38,92,0.06)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export default function TechChamber({
  progress,
  reducedMotion = false,
}: {
  progress: MotionValue<number>;
  reducedMotion?: boolean;
  /* accepted but unused since the dark columns (the only lowPower-gated
   * geometry) were removed; kept so the call site needn't change. */
  lowPower?: boolean;
}) {
  const beamTex = useMemo(() => makeBeamTexture(), []);
  const hazeTex = useMemo(() => makeHazeTexture(), []);
  const beamRef = useRef<THREE.MeshBasicMaterial>(null);
  const hazeRef = useRef<THREE.MeshBasicMaterial>(null);
  const wallLightRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((state, delta) => {
    const p = progress.get();
    const t = state.clock.elapsedTime;
    /* All three bands stay at 0 until the lid begins to open (~0.32), then
     * fade in — so the closed-laptop state has a clean, empty backdrop. */
    if (beamRef.current) {
      const lit = smoothstep(0.32, 0.62, p);
      beamRef.current.opacity = lit * (reducedMotion ? 0.06 : 0.05 + Math.sin(t * 0.7) * 0.02);
    }
    if (hazeRef.current) {
      hazeRef.current.opacity = smoothstep(0.32, 0.82, p) * 0.08 * (reducedMotion ? 1 : 0.92 + Math.sin(t * 0.4) * 0.08);
    }
    if (wallLightRef.current) {
      /* distant wall bar removed for the deep-space backdrop */
      wallLightRef.current.opacity = 0;
    }
    void delta;
  });

  return (
    <group position={[RIG_X, 0, 0]}>
      {/* central rear light shaft / portal (the vertical glow behind laptop) */}
      {beamTex && (
        <mesh position={[0, 1.8, -7]}>
          <planeGeometry args={[2.6, 7]} />
          <meshBasicMaterial
            ref={beamRef}
            map={beamTex}
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}

      {/* faint distant wall light bar */}
      {beamTex && (
        <mesh position={[0, 3.4, -9]} rotation={[0, 0, Math.PI / 2]}>
          <planeGeometry args={[3, 16]} />
          <meshBasicMaterial
            ref={wallLightRef}
            map={beamTex}
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}

      {/* atmospheric haze wash for aerial perspective */}
      {hazeTex && (
        <mesh position={[0, 0.4, -6.5]}>
          <planeGeometry args={[50, 28]} />
          <meshBasicMaterial
            ref={hazeRef}
            map={hazeTex}
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}
    </group>
  );
}
