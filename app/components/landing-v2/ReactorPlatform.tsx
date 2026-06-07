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
/* Edge hues are deliberately BRIGHT near-white-cyan/blue: a saturated
 * mid-cyan sits below the bloom luminance threshold and never blooms, so
 * the edges read as flat 1px lines. These lighter tints cross the
 * threshold and bloom into the crisp glowing edge-trim the reference has. */
const BLOCKS: BlockDef[] = [
  /* near + mid floor panels — biased toward the laptop (right) so they
   * frame it instead of crowding the headline column on the left. */
  { pos: [3.2, -0.06, 1.0], size: [1.6, 0.4, 1.5], ignite: [0.18, 0.36], hue: "#bfeaff", edge: 0.9 },
  { pos: [4.6, -0.12, -0.9], size: [1.5, 0.5, 1.6], ignite: [0.26, 0.44], hue: "#bfeaff", edge: 0.85 },
  { pos: [2.8, -0.12, -2.9], size: [1.7, 0.5, 1.5], ignite: [0.36, 0.54], hue: "#a9d4ff", edge: 0.8 },
  { pos: [5.2, -0.16, -2.6], size: [1.3, 0.6, 1.3], ignite: [0.44, 0.62], hue: "#cbbcff", edge: 0.7 }, // violet accent
  /* a couple on the left, pushed BACK so they add depth without sitting
   * under the headline. */
  { pos: [-3.4, -0.12, -3.4], size: [1.5, 0.5, 1.5], ignite: [0.3, 0.5], hue: "#a9d4ff", edge: 0.75 },
  { pos: [-4.8, -0.18, -1.6], size: [1.3, 0.62, 1.3], ignite: [0.4, 0.6], hue: "#bfeaff", edge: 0.7 },
  /* far monoliths — tall dark slabs receding into the chamber depth */
  { pos: [-3.0, 1.2, -8.2], size: [1.4, 5.0, 0.6], ignite: [0.3, 0.7], hue: "#6fa8e0", edge: 0.5, far: true },
  { pos: [3.6, 1.6, -8.8], size: [1.1, 6.0, 0.6], ignite: [0.35, 0.75], hue: "#6fa8e0", edge: 0.46, far: true },
  { pos: [0.6, 2.0, -9.4], size: [1.6, 6.6, 0.5], ignite: [0.4, 0.8], hue: "#6fa8e0", edge: 0.42, far: true },
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
  const groupRef = useRef<THREE.Group>(null);

  /* Reveal window: the panel scales up from nothing (assembles in) as the
   * laptop lid opens. Clamped so NOTHING appears while the laptop is closed
   * (< ~0.30); each panel is staggered off its own ignite start so they
   * build in sequence rather than all at once. */
  const revealStart = Math.max(0.3, def.ignite[0]);
  const revealEnd = revealStart + 0.2;

  useFrame((state) => {
    const p = progress.get();
    const reveal = smoothstep(revealStart, revealEnd, p);
    if (groupRef.current) {
      // floor at a hair above 0 so the geometry never degenerates to NaN
      groupRef.current.scale.setScalar(Math.max(0.0001, reveal));
    }
    if (lineRef.current) {
      const lit = smoothstep(def.ignite[0], def.ignite[1], p);
      const pulse = reducedMotion
        ? 1
        : 0.8 + Math.sin(state.clock.elapsedTime * 1.2 + def.pos[0] * 1.7) * 0.2;
      /* edge-trim ignites as each zone powers up, multiplied by the reveal
       * so it ramps with the assemble-in instead of popping on. */
      lineRef.current.opacity = (0.4 + lit * 0.6) * def.edge * pulse * reveal;
    }
  });

  return (
    /* starts at ~0 scale so there's no flash of full-size panels on first
     * paint at the top of the hero (progress 0). */
    <group ref={groupRef} position={def.pos} scale={0.0001}>
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
  /* shared panel body — a lighter navy than before with a faint emissive
   * floor so the faces read as lit PANELS (catching the key light as a
   * gradient across the face, like the reference) instead of black holes.
   * Memoised, reused across every block. */
  const bodyMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#16223a",
        metalness: 0.5,
        roughness: 0.5,
        envMapIntensity: 0.75,
        emissive: new THREE.Color("#0a1426"),
        emissiveIntensity: 0.6,
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
