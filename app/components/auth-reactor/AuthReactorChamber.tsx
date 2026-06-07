"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Grid, MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";
import { REACTOR } from "./authReactorConfig";
import type { ReactorQuality } from "./authReactorTypes";

/**
 * AuthReactorChamber — the moving 3D environment the reactor sits inside.
 *
 * Matches the reference: a back portal ring + concentric HUD arcs, a vertical
 * light shaft, a reflective floor with a perspective grid + rotating concentric
 * rings, side-wall circuitry with travelling light traces, and drifting dust.
 * Everything is in motion (slow, premium); reduced-motion freezes it to a clean
 * static pose. Quality-tiered so mobile stays cheap. Decorative only.
 */

const AMBER = "#e0a44a";

/** Deterministic PRNG (mulberry32) — pure dust positions, no Math.random. */
function makePoints(count: number, seed = 0x51ed2c91): Float32Array {
  let s = seed;
  const rand = () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    arr[i * 3] = (rand() - 0.5) * 14;
    arr[i * 3 + 1] = rand() * 6 - 1.5;
    arr[i * 3 + 2] = -rand() * 8 - 0.5;
  }
  return arr;
}

/* ── Back portal: concentric HUD arcs that counter-rotate ── */
function BackPortal({ reducedMotion }: { reducedMotion: boolean }) {
  const arcs = useRef<THREE.Group[]>([]);
  const rings = useMemo(
    () => [
      { r: 2.4, arc: Math.PI * 1.9, tube: 0.01, color: REACTOR.cyan, speed: 0.05 },
      { r: 2.95, arc: Math.PI * 1.95, tube: 0.008, color: "#5a6ad0", speed: -0.035 },
      { r: 3.55, arc: Math.PI * 1.85, tube: 0.006, color: REACTOR.cyan, speed: 0.025 },
    ],
    [],
  );
  useFrame((_, dt) => {
    if (reducedMotion) return;
    rings.forEach((r, i) => {
      const g = arcs.current[i];
      if (g) g.rotation.z += dt * r.speed;
    });
  });
  return (
    <group position={[0, 0.8, -3.4]}>
      {rings.map((r, i) => (
        <group key={i} ref={(el) => { if (el) arcs.current[i] = el; }} rotation={[0, 0, (i * Math.PI) / 3]}>
          <mesh rotation={[0, 0, -r.arc / 2]}>
            <torusGeometry args={[r.r, r.tube, 8, 220, r.arc]} />
            <meshBasicMaterial color={r.color} transparent opacity={0.4} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ── Reflective floor: grid + rotating concentric rings ── */
function Floor({ reducedMotion, quality }: { reducedMotion: boolean; quality: ReactorQuality }) {
  const ring = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ring.current && !reducedMotion) ring.current.rotation.z += dt * 0.08;
  });
  return (
    <group position={[0, -1.55, 0]}>
      {/* Reflective floor (desktop) — the reactor + platform glow reflect in it. */}
      {quality === "high" && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[70, 70]} />
          <MeshReflectorMaterial
            blur={[320, 90]}
            resolution={1024}
            mixBlur={1}
            mixStrength={30}
            roughness={0.9}
            depthScale={1.1}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.3}
            color="#080b18"
            metalness={0.55}
            mirror={0.45}
          />
        </mesh>
      )}
      <Grid
        args={[30, 30]}
        cellSize={0.7}
        cellThickness={0.55}
        cellColor="#223861"
        sectionSize={3}
        sectionThickness={1.1}
        sectionColor={REACTOR.cyan}
        fadeDistance={32}
        fadeStrength={1.1}
        infiniteGrid={quality !== "low"}
        position={[0, 0.012, 0]}
      />
      {/* concentric station rings */}
      <group ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <mesh>
          <torusGeometry args={[1.7, 0.012, 8, 200]} />
          <meshBasicMaterial color={REACTOR.cyan} transparent opacity={0.7} toneMapped={false} />
        </mesh>
        <mesh>
          <torusGeometry args={[1.5, 0.02, 8, 200]} />
          <meshBasicMaterial color={AMBER} transparent opacity={0.85} toneMapped={false} />
        </mesh>
        {/* outer ground rings sweeping out in front of the pedestal */}
        <mesh>
          <torusGeometry args={[2.55, 0.014, 8, 240]} />
          <meshBasicMaterial color={REACTOR.cyan} transparent opacity={0.6} toneMapped={false} />
        </mesh>
        <mesh>
          <torusGeometry args={[2.92, 0.02, 8, 240]} />
          <meshBasicMaterial color={AMBER} transparent opacity={0.5} toneMapped={false} />
        </mesh>
        <mesh>
          <torusGeometry args={[3.4, 0.008, 8, 260]} />
          <meshBasicMaterial color={REACTOR.cyan} transparent opacity={0.3} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

/* ── One side wall with travelling circuit traces ── */
function SideWall({ side, reducedMotion }: { side: 1 | -1; reducedMotion: boolean }) {
  const pulses = useRef<THREE.Mesh[]>([]);
  const lanes = useMemo(
    () => [
      { x: 0.0, color: REACTOR.cyan, speed: 1.4, offset: 0 },
      { x: 0.35, color: REACTOR.violet, speed: 1.0, offset: 2 },
      { x: -0.35, color: AMBER, speed: 1.8, offset: 4 },
    ],
    [],
  );
  useFrame((st) => {
    lanes.forEach((l, i) => {
      const m = pulses.current[i];
      if (!m) return;
      if (reducedMotion) {
        m.position.y = 0;
        return;
      }
      const t = (st.clock.elapsedTime * l.speed + l.offset) % 6;
      m.position.y = -3 + t; // travel up the wall, loop
    });
  });
  return (
    <group position={[side * 5.2, 0.4, -1.6]} rotation={[0, side * -0.5, 0]}>
      {/* dim static rails */}
      {lanes.map((l, i) => (
        <mesh key={`r${i}`} position={[l.x, 0, 0]}>
          <boxGeometry args={[0.02, 6, 0.02]} />
          <meshBasicMaterial color={l.color} transparent opacity={0.12} toneMapped={false} />
        </mesh>
      ))}
      {/* travelling pulses */}
      {lanes.map((l, i) => (
        <mesh key={`p${i}`} ref={(el) => { if (el) pulses.current[i] = el; }} position={[l.x, 0, 0.01]}>
          <boxGeometry args={[0.05, 0.7, 0.04]} />
          <meshBasicMaterial color={l.color} transparent opacity={0.9} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Drifting dust ── */
function Dust({ count, reducedMotion }: { count: number; reducedMotion: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => makePoints(count), [count]);
  useFrame((_, dt) => {
    if (ref.current && !reducedMotion) ref.current.rotation.y += dt * 0.012;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#aeb8e0" transparent opacity={0.5} sizeAttenuation depthWrite={false} toneMapped={false} />
    </points>
  );
}

/* ── Tiered pedestal the reactor stands on ── */
function Pedestal() {
  const metal = (rough: number, env: number) => (
    <meshStandardMaterial color={REACTOR.darkMetal} metalness={1} roughness={rough} envMapIntensity={env} />
  );
  return (
    <group position={[0, -1.5, 0]}>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[1.9, 2.05, 0.12, 80]} />
        {metal(0.42, 1.2)}
      </mesh>
      <mesh position={[0, 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.92, 0.012, 8, 200]} />
        <meshBasicMaterial color={REACTOR.cyan} transparent opacity={0.55} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.23, 0]}>
        <cylinderGeometry args={[1.5, 1.78, 0.16, 80]} />
        {metal(0.35, 1.4)}
      </mesh>
      <mesh position={[0, 0.32, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.52, 0.014, 8, 200]} />
        <meshBasicMaterial color={AMBER} transparent opacity={0.7} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[1.15, 1.42, 0.18, 80]} />
        {metal(0.3, 1.6)}
      </mesh>
      <mesh position={[0, 0.52, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.16, 0.012, 8, 200]} />
        <meshBasicMaterial color={REACTOR.cyan} transparent opacity={0.7} toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function AuthReactorChamber({ quality, reducedMotion }: { quality: ReactorQuality; reducedMotion: boolean }) {
  const high = quality === "high";
  const low = quality === "low";
  return (
    <group>
      {/* Soft nebula glow far back so the chamber reads as one lit volume. */}
      <mesh position={[0, 1.6, -6]}>
        <circleGeometry args={[3.6, 48]} />
        <meshBasicMaterial color="#27379e" transparent opacity={0.06} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <Floor reducedMotion={reducedMotion} quality={quality} />
      <Pedestal />
      <BackPortal reducedMotion={reducedMotion} />
      {/* Soft violet rim glow on the reactor's right edge (reference accent). */}
      <mesh position={[1.55, 0.15, -0.45]}>
        <circleGeometry args={[1.0, 48]} />
        <meshBasicMaterial color={REACTOR.violet} transparent opacity={0.07} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* (No light shaft — additive cone bloomed too hard; reference top beam is negligible.) */}
      {high && (
        <>
          <SideWall side={1} reducedMotion={reducedMotion} />
          <SideWall side={-1} reducedMotion={reducedMotion} />
        </>
      )}
      <Dust count={high ? 320 : low ? 90 : 180} reducedMotion={reducedMotion} />
    </group>
  );
}
