"use client";

/**
 * ReactorPlatform — the PHYSICAL, layered reactor the laptop floats above.
 *
 * This replaces the "drawn on the floor" read with manufactured 3D structure:
 * a central machined pedestal, a descending bowl of concentric dark-metal
 * tier walls (real depth between layers), emissive trims on each tier rim, an
 * instanced segmented light ring, and embedded light modules. The existing
 * additive instrument-plate / sweep / nodes continue to glow on the TOP
 * surface as the luminous inlay — so the platform reads as illuminated
 * circuitry cut into engineered metal, matching the reference art direction.
 *
 * Driven by the same scroll `progress` as the rest of the hero: tiers and
 * trims ignite OUTWARD in sequence (pedestal → inner tier → outer tiers →
 * segmented ring), rotating at slightly different speeds. Self-lit emissive +
 * the scene's existing lights/Environment render it — it adds NO new lights,
 * so the locked laptop render is unaffected. Reduced motion freezes rotation
 * (emissive settles to the full online state); low-power drops segment counts.
 */

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";

const RIG_X = 1.4; // platform centre (matches LaptopScene)

const smoothstep = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

type Tier = {
  rTop: number;
  rBottom: number;
  y: number;
  height: number;
  ignite: [number, number]; // progress window the trim lights in
  spin: number; // rad/sec
};

export default function ReactorPlatform({
  progress,
  reducedMotion = false,
  lowPower = false,
}: {
  progress: MotionValue<number>;
  reducedMotion?: boolean;
  lowPower?: boolean;
}) {
  /* descending bowl of tiers — outer ones sit lower + wider so the structure
   * recedes into a well beneath the floating laptop. */
  const tiers = useMemo<Tier[]>(
    () => [
      { rTop: 2.3, rBottom: 2.55, y: -0.2, height: 0.22, ignite: [0.12, 0.28], spin: 0.05 },
      { rTop: 4.1, rBottom: 4.4, y: -0.42, height: 0.26, ignite: [0.28, 0.45], spin: -0.035 },
      { rTop: 6.3, rBottom: 6.7, y: -0.7, height: 0.3, ignite: [0.45, 0.62], spin: 0.025 },
      { rTop: 8.8, rBottom: 9.3, y: -1.04, height: 0.34, ignite: [0.6, 0.8], spin: -0.018 },
    ],
    [],
  );

  const radialSeg = lowPower ? 64 : 128;

  /* shared materials — memoised, reused across all tiers (low draw-call,
   * single GPU upload). */
  const metalDark = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#13181f",
        metalness: 0.92,
        roughness: 0.42,
        envMapIntensity: 0.6,
      }),
    [],
  );
  const metalCharcoal = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#0c0f15",
        metalness: 0.85,
        roughness: 0.55,
        envMapIntensity: 0.45,
      }),
    [],
  );

  /* one emissive trim material PER tier so they can ignite in sequence. */
  const trimMats = useMemo(
    () =>
      tiers.map(
        () =>
          new THREE.MeshStandardMaterial({
            color: "#03070d",
            emissive: new THREE.Color("#00d6ff"),
            emissiveIntensity: 0,
            metalness: 0.4,
            roughness: 0.5,
          }),
      ),
    [tiers],
  );
  const coreMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#04090f",
        emissive: new THREE.Color("#37e0ff"),
        emissiveIntensity: 0,
        metalness: 0.5,
        roughness: 0.4,
      }),
    [],
  );
  const segMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#04090f",
        emissive: new THREE.Color("#28d6ff"),
        emissiveIntensity: 0,
        metalness: 0.3,
        roughness: 0.45,
        toneMapped: false,
      }),
    [],
  );
  const violetMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#05060d",
        emissive: new THREE.Color("#7c5cff"),
        emissiveIntensity: 0,
        metalness: 0.4,
        roughness: 0.5,
      }),
    [],
  );

  const tierGroupRefs = useRef<Array<THREE.Group | null>>([]);
  const coreRef = useRef<THREE.Mesh>(null);

  /* segmented light ring — instanced boxes around tier B. */
  const SEG_N = lowPower ? 36 : 60;
  const segRef = useRef<THREE.InstancedMesh>(null);
  const segMatrix = useMemo(() => new THREE.Object3D(), []);
  const SEG_R = 5.25;
  useMemo(() => {
    // matrices are set once via the ref callback below (deterministic)
  }, []);

  /* embedded light modules — small emissive blocks on the inner tier top. */
  const MOD_N = lowPower ? 8 : 14;
  const modRef = useRef<THREE.InstancedMesh>(null);
  const MOD_R = 3.2;

  const setupInstances = () => {
    if (segRef.current) {
      for (let i = 0; i < SEG_N; i++) {
        const a = (i / SEG_N) * Math.PI * 2;
        segMatrix.position.set(Math.cos(a) * SEG_R, -0.41, Math.sin(a) * SEG_R);
        segMatrix.rotation.set(0, -a, 0);
        segMatrix.scale.set(0.26, 0.05, 0.09);
        segMatrix.updateMatrix();
        segRef.current.setMatrixAt(i, segMatrix.matrix);
      }
      segRef.current.instanceMatrix.needsUpdate = true;
    }
    if (modRef.current) {
      for (let i = 0; i < MOD_N; i++) {
        const a = (i / MOD_N) * Math.PI * 2 + 0.2;
        segMatrix.position.set(Math.cos(a) * MOD_R, -0.17, Math.sin(a) * MOD_R);
        segMatrix.rotation.set(0, -a, 0);
        segMatrix.scale.set(0.18, 0.06, 0.12);
        segMatrix.updateMatrix();
        modRef.current.setMatrixAt(i, segMatrix.matrix);
      }
      modRef.current.instanceMatrix.needsUpdate = true;
    }
  };

  useFrame((state, delta) => {
    const p = progress.get();
    const t = state.clock.elapsedTime;
    const dt = Math.min(0.05, delta);

    /* Emissive intensities are pushed above the bloom luminance threshold so
     * the trims/seam/segments read as LIGHT (bloom-bled) rather than flat
     * painted edges. */
    if (coreRef.current) {
      const lit = smoothstep(0.04, 0.18, p);
      coreMat.emissiveIntensity = lit * (reducedMotion ? 2.2 : 2.0 + Math.sin(t * 1.4) * 0.3);
    }

    for (let i = 0; i < tiers.length; i++) {
      const tier = tiers[i];
      const lit = smoothstep(tier.ignite[0], tier.ignite[1], p);
      trimMats[i].emissiveIntensity =
        lit * (reducedMotion ? 1.9 : 1.7 + Math.sin(t * 1.1 + i * 1.3) * 0.3);
      const g = tierGroupRefs.current[i];
      if (g && !reducedMotion) g.rotation.y += tier.spin * dt;
    }

    // segmented ring + violet modules track the burst phase
    const segLit = smoothstep(0.4, 0.7, p);
    segMat.emissiveIntensity = segLit * (reducedMotion ? 2.6 : 2.2 + Math.sin(t * 2.0) * 0.4);
    violetMat.emissiveIntensity = smoothstep(0.5, 0.78, p) * 1.4;
    if (segRef.current && !reducedMotion) segRef.current.rotation.y += 0.06 * dt;
  });

  return (
    <group position={[RIG_X, 0, 0]}>
      {/* central machined pedestal the laptop floats above */}
      <mesh material={metalCharcoal} position={[0, -0.72, 0]} castShadow={false}>
        <cylinderGeometry args={[1.0, 1.25, 0.9, 64]} />
      </mesh>
      {/* pedestal emissive core seam ring */}
      <mesh ref={coreRef} material={coreMat} position={[0, -0.28, 0]}>
        <cylinderGeometry args={[1.02, 1.02, 0.06, 64, 1, true]} />
      </mesh>
      {/* pedestal cap (where the inlay plate sits) */}
      <mesh material={metalDark} position={[0, -0.26, 0]}>
        <cylinderGeometry args={[1.15, 1.05, 0.08, 64]} />
      </mesh>

      {/* descending concentric tier walls + emissive rim trims */}
      {tiers.map((tier, i) => (
        <group
          key={`tier-${i}`}
          ref={(el) => {
            tierGroupRefs.current[i] = el;
          }}
        >
          {/* dark metal ring wall (open cylinder = a band with real height) */}
          <mesh material={i % 2 ? metalCharcoal : metalDark} position={[0, tier.y - tier.height / 2, 0]}>
            <cylinderGeometry
              args={[tier.rTop, tier.rBottom, tier.height, radialSeg, 1, true]}
            />
          </mesh>
          {/* flat machined top trim (catches light, gives the tier a lip) */}
          <mesh material={metalDark} position={[0, tier.y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[tier.rTop - 0.18, tier.rTop + 0.04, radialSeg]} />
          </mesh>
          {/* emissive trim torus on the rim — ignites in sequence */}
          <mesh material={trimMats[i]} position={[0, tier.y + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[tier.rTop - 0.06, 0.025, 8, radialSeg]} />
          </mesh>
        </group>
      ))}

      {/* instanced segmented light ring (tier B) */}
      <instancedMesh
        ref={(el) => {
          segRef.current = el;
          if (el) setupInstances();
        }}
        args={[undefined, undefined, SEG_N]}
        material={segMat}
      >
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>

      {/* instanced embedded light modules (inner tier, restrained violet) */}
      <instancedMesh
        ref={(el) => {
          modRef.current = el;
          if (el) setupInstances();
        }}
        args={[undefined, undefined, MOD_N]}
        material={violetMat}
      >
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>
    </group>
  );
}
