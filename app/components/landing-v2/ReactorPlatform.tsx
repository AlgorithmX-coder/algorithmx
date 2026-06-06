"use client";

/**
 * ReactorPlatform — the geometric "energy chamber" structure around the
 * laptop. Replaces the old concentric metal-tier bowl with a scatter of
 * dark navy chamfered PANELS (subtle glowing blue edge-trim) sitting on
 * the flowing-ribbon floor, plus a few tall dark MONOLITHS far back for
 * depth — matching the reference command-centre look.
 *
 * Each panel's edge-trim ignites in sequence with scroll `progress`
 * (zone-by-zone power-up) then holds with a gentle out-of-phase pulse, so
 * the chamber still "comes online" as the cinematic plays. Self-lit
 * (emissive edges + the scene's existing lights/Environment) — it adds NO
 * new lights, so the locked laptop render is unaffected. Reduced motion
 * freezes the pulse (edges settle to their full online state); low-power
 * drops the dimmest far monoliths.
 */

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";

const RIG_X = 1.4; // chamber centre (matches LaptopScene)

const smoothstep = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

type BlockDef = {
  pos: [number, number, number];
  size: [number, number, number];
  ignite: [number, number];
  hue: string; // edge-trim colour
  edge: number; // base edge opacity
  far?: boolean; // dim far monolith (dropped on low-power)
};

/* Positions are relative to the chamber centre (RIG_X). The laptop sits
 * near the origin, so panels are scattered clear of its footprint. */
const BLOCKS: BlockDef[] = [
  /* near + mid floor panels — raised tech steps flanking the laptop */
  { pos: [-3.2, -0.05, 1.2], size: [1.8, 0.42, 1.5], ignite: [0.18, 0.36], hue: "#33a6ff", edge: 0.5 },
  { pos: [3.4, -0.08, 0.2], size: [1.6, 0.46, 1.7], ignite: [0.24, 0.42], hue: "#33a6ff", edge: 0.5 },
  { pos: [-2.4, -0.1, -2.4], size: [1.4, 0.5, 1.4], ignite: [0.32, 0.5], hue: "#2f8fff", edge: 0.42 },
  { pos: [3.0, -0.12, -2.8], size: [1.7, 0.5, 1.5], ignite: [0.4, 0.58], hue: "#7c5cff", edge: 0.38 },
  { pos: [-4.8, -0.15, -0.6], size: [1.3, 0.6, 1.3], ignite: [0.46, 0.64], hue: "#2f8fff", edge: 0.36 },
  { pos: [4.7, -0.16, -1.8], size: [1.2, 0.6, 1.2], ignite: [0.5, 0.68], hue: "#33a6ff", edge: 0.34 },
  /* far monoliths — tall dark slabs receding into the chamber depth */
  { pos: [-3.0, 1.2, -8.0], size: [1.4, 5.0, 0.6], ignite: [0.3, 0.7], hue: "#1f4f8f", edge: 0.26, far: true },
  { pos: [3.5, 1.6, -8.6], size: [1.1, 6.0, 0.6], ignite: [0.35, 0.75], hue: "#1f4f8f", edge: 0.22, far: true },
  { pos: [0.4, 2.0, -9.2], size: [1.6, 6.6, 0.5], ignite: [0.4, 0.8], hue: "#1f4f8f", edge: 0.2, far: true },
];

function Block({
  def,
  progress,
  reducedMotion,
  bodyMat,
}: {
  def: BlockDef;
  progress: MotionValue<number>;
  reducedMotion: boolean;
  bodyMat: THREE.Material;
}) {
  const geo = useMemo(() => new THREE.BoxGeometry(...def.size), [def]);
  const edges = useMemo(() => new THREE.EdgesGeometry(geo), [geo]);
  const lineRef = useRef<THREE.LineBasicMaterial>(null);

  useFrame((state) => {
    if (!lineRef.current) return;
    const p = progress.get();
    const lit = smoothstep(def.ignite[0], def.ignite[1], p);
    const pulse = reducedMotion
      ? 1
      : 0.8 + Math.sin(state.clock.elapsedTime * 1.2 + def.pos[0] * 1.7) * 0.2;
    /* baseline so the panel edges read from the top of the hero, with a
     * scroll-driven boost as each zone ignites. */
    lineRef.current.opacity = (0.4 + lit * 0.6) * def.edge * pulse;
  });

  return (
    <group position={def.pos}>
      <mesh geometry={geo} material={bodyMat} />
      <lineSegments geometry={edges}>
        <lineBasicMaterial
          ref={lineRef}
          color={def.hue}
          transparent
          opacity={0}
          toneMapped={false}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}

export default function ReactorPlatform({
  progress,
  reducedMotion = false,
  lowPower = false,
}: {
  progress: MotionValue<number>;
  reducedMotion?: boolean;
  lowPower?: boolean;
}) {
  /* shared dark-navy panel body — memoised, reused across every block. */
  const bodyMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#0b1220",
        metalness: 0.55,
        roughness: 0.55,
        envMapIntensity: 0.4,
      }),
    [],
  );

  const blocks = useMemo(
    () => (lowPower ? BLOCKS.filter((b) => !b.far) : BLOCKS),
    [lowPower],
  );

  return (
    <group position={[RIG_X, 0, 0]}>
      {blocks.map((def, i) => (
        <Block
          key={i}
          def={def}
          progress={progress}
          reducedMotion={reducedMotion}
          bodyMat={bodyMat}
        />
      ))}
    </group>
  );
}
