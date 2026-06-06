"use client";

/**
 * TechChamber — understated background depth so the platform no longer floats
 * in an empty void. Three depth bands behind the laptop:
 *   - far architectural SILHOUETTES (instanced dark columns ringing the scene)
 *   - a central rear LIGHT SHAFT / portal beam (the bright vertical glow in
 *     the reference), additive, brightening through the activation phases
 *   - a faint atmospheric HAZE wash for aerial perspective
 *
 * All self-lit additive / dark matte — adds NO new lights, so the laptop
 * render is untouched. Deliberately quiet: it supports the laptop and reads
 * as a chamber, never competing with the hero. Reduced motion only freezes
 * the slow drift; the depth + lighting state are preserved.
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
  g.addColorStop(0, "rgba(120,225,255,0.5)");
  g.addColorStop(0.4, "rgba(40,170,255,0.22)");
  g.addColorStop(1, "rgba(20,80,180,0)");
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
  const g = ctx.createRadialGradient(S / 2, S * 0.62, 0, S / 2, S * 0.62, S * 0.55);
  g.addColorStop(0, "rgba(30,110,190,0.4)");
  g.addColorStop(0.5, "rgba(18,60,130,0.14)");
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
  lowPower = false,
}: {
  progress: MotionValue<number>;
  reducedMotion?: boolean;
  lowPower?: boolean;
}) {
  const beamTex = useMemo(() => makeBeamTexture(), []);
  const hazeTex = useMemo(() => makeHazeTexture(), []);
  const beamRef = useRef<THREE.MeshBasicMaterial>(null);
  const hazeRef = useRef<THREE.MeshBasicMaterial>(null);
  const wallLightRef = useRef<THREE.MeshBasicMaterial>(null);

  /* Matte, near-light-absorbing material so the columns stay DARK
   * silhouettes (their whole job — depth framing). The previous
   * metalness 0.7 / roughness 0.6 / envMap 0.25 made them mirror the
   * bright white key Lightformer (intensity 3.4) + the 1.55 directional
   * light, so their faces blew out to flat white slabs in frame. Low
   * metalness + high roughness + near-zero env kills that specular so
   * they read as the dark architecture they're meant to be. */
  const columnMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#080b11",
        metalness: 0.1,
        roughness: 0.95,
        envMapIntensity: 0.04,
      }),
    [],
  );

  /* far architectural columns ringing the chamber (mostly behind + sides). */
  const COL_N = lowPower ? 7 : 12;
  const colRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const setupColumns = () => {
    if (!colRef.current) return;
    for (let i = 0; i < COL_N; i++) {
      // bias to the rear hemisphere so columns frame depth, not the foreground
      const a = Math.PI * 0.15 + (i / COL_N) * Math.PI * 1.7;
      const r = 22 + (i % 3) * 4;
      const hgt = 14 + (i % 4) * 5;
      dummy.position.set(Math.cos(a) * r, hgt / 2 - 6, Math.sin(a) * r - 4);
      dummy.rotation.set(0, -a, 0);
      dummy.scale.set(1.6 + (i % 2) * 0.8, hgt, 1.6 + (i % 3) * 0.5);
      dummy.updateMatrix();
      colRef.current.setMatrixAt(i, dummy.matrix);
    }
    colRef.current.instanceMatrix.needsUpdate = true;
  };

  useFrame((state, delta) => {
    const p = progress.get();
    const t = state.clock.elapsedTime;
    if (beamRef.current) {
      const lit = smoothstep(0.1, 0.6, p);
      beamRef.current.opacity = lit * (reducedMotion ? 0.34 : 0.3 + Math.sin(t * 0.7) * 0.06);
    }
    if (hazeRef.current) {
      hazeRef.current.opacity = (0.08 + smoothstep(0.2, 0.8, p) * 0.14) * (reducedMotion ? 1 : 0.92 + Math.sin(t * 0.4) * 0.08);
    }
    if (wallLightRef.current) {
      wallLightRef.current.opacity = smoothstep(0.3, 0.75, p) * 0.18;
    }
    void delta;
  });

  return (
    <group position={[RIG_X, 0, 0]}>
      {/* far architectural column silhouettes (depth + framing) */}
      <instancedMesh
        ref={(el) => {
          colRef.current = el;
          if (el) setupColumns();
        }}
        args={[undefined, undefined, COL_N]}
        material={columnMat}
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>

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
        <mesh position={[0, 1.2, -6]}>
          <planeGeometry args={[34, 20]} />
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
