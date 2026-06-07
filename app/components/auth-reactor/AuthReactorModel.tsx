"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import * as THREE from "three";
import { STREAMS } from "../auth/streams";
import { QUALITY, REACTOR, RIG } from "./authReactorConfig";
import type { AuthReactorStage, ReactorQuality } from "./authReactorTypes";

/**
 * AuthReactorModel — TEMPORARY engineered prototype, reshaped to approximate
 * the reference render: six flat trapezoidal armour panels (with edge-light
 * strips) ringed around a glowing OCTAGONAL core "eye", inside an outer frame.
 * Driven by the derived stage/channels/energy; the Stage-7 success beat is a
 * GSAP one-shot. Swap this file for the gltfjsx-generated component (same
 * props) once the production GLB lands — it is NOT a pixel match for the render.
 */

const lerp = THREE.MathUtils.lerp;
const AMBER = "#e0a44a";

/* Trapezoidal panel centred on the +X axis (narrow inner edge → wide outer).
 * Chunky depth + rounded bevels so the side faces catch the studio lights and
 * the panel reads as a machined block, not a flat plate. */
const P = { rIn: 0.46, rOut: 1.32, wIn: 0.16, wOut: 0.66, depth: 0.36 };
function makePanelGeometry(): THREE.ExtrudeGeometry {
  const s = new THREE.Shape();
  s.moveTo(P.rIn, -P.wIn);
  s.lineTo(P.rOut, -P.wOut);
  s.lineTo(P.rOut, P.wOut);
  s.lineTo(P.rIn, P.wIn);
  s.closePath();
  return new THREE.ExtrudeGeometry(s, { depth: P.depth, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.045, bevelSegments: 3, curveSegments: 6 });
}

interface ModelProps {
  stage: AuthReactorStage;
  channels: number;
  energy: number;
  reducedMotion: boolean;
  quality: ReactorQuality;
  openOverride?: number | null;
  coreOverride?: number | null;
}

/* ── One trapezoidal armour panel (a stream channel) ── */
function Panel({ index, accent, stage, channels, reducedMotion, geom }: { index: number; accent: string; stage: AuthReactorStage; channels: number; reducedMotion: boolean; geom: THREE.ExtrudeGeometry }) {
  const arm = useRef<THREE.Group>(null);
  const stripMat = useRef<THREE.MeshBasicMaterial>(null);
  const coreMat = useRef<THREE.MeshBasicMaterial>(null);
  const pulse = useRef<THREE.Mesh>(null);
  const a = (index / 6) * Math.PI * 2;
  const accentCol = useMemo(() => new THREE.Color(accent), [accent]);
  const cold = useMemo(() => new THREE.Color("#070a12"), []);
  const hot = useMemo(() => new THREE.Color("#eaffff"), []);

  const mid = (P.rIn + P.rOut) / 2;
  const len = P.rOut - P.rIn - 0.06;

  useFrame((st, dt) => {
    const k = Math.min(1, dt * (reducedMotion ? 14 : 5));
    const granted = stage === 7;
    const active = granted || index < channels;
    const open = granted ? 1 : stage === 6 ? 0.4 : 0;
    if (arm.current) {
      arm.current.position.x = lerp(arm.current.position.x, open * 0.3, k);
      arm.current.rotation.y = lerp(arm.current.rotation.y, -0.05 - open * 0.5, k);
    }
    if (stripMat.current) stripMat.current.color.lerp(active ? accentCol : cold, k);
    if (coreMat.current) coreMat.current.color.lerp(active ? hot : cold, k);
    // Energy pulse travels outward along the lit strip.
    if (pulse.current) {
      const pm = pulse.current.material as THREE.MeshBasicMaterial;
      if (active && !reducedMotion) {
        const f = ((st.clock.elapsedTime * 0.9 + index * 0.37) % 1);
        pulse.current.position.x = mid - len / 2 + f * len;
        pm.opacity = lerp(pm.opacity, Math.sin(f * Math.PI), k);
        pulse.current.visible = true;
      } else {
        pm.opacity = lerp(pm.opacity, 0, k);
        if (pm.opacity < 0.02) pulse.current.visible = false;
      }
    }
  });

  return (
    <group rotation={[0, 0, a]}>
      <group ref={arm}>
        <mesh geometry={geom} castShadow>
          <meshStandardMaterial color={REACTOR.darkMetal} metalness={1} roughness={0.24} envMapIntensity={2.4} />
        </mesh>
        {/* Recessed dark groove the LED sits in */}
        <mesh position={[mid, 0, P.depth + 0.05]}>
          <boxGeometry args={[len + 0.05, 0.105, 0.04]} />
          <meshStandardMaterial color="#04050b" metalness={0.6} roughness={0.5} envMapIntensity={0.6} />
        </mesh>
        {/* Coloured LED bar (thin + sharp) */}
        <mesh position={[mid, 0, P.depth + 0.078]}>
          <boxGeometry args={[len, 0.05, 0.02]} />
          <meshBasicMaterial ref={stripMat} color="#070a12" toneMapped={false} />
        </mesh>
        {/* White-hot core line for a crisp LED filament */}
        <mesh position={[mid, 0, P.depth + 0.092]}>
          <boxGeometry args={[len, 0.015, 0.012]} />
          <meshBasicMaterial ref={coreMat} color="#070a12" toneMapped={false} />
        </mesh>
        {/* Travelling energy pulse */}
        <mesh ref={pulse} position={[mid, 0, P.depth + 0.1]} visible={false}>
          <boxGeometry args={[0.09, 0.07, 0.02]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0} toneMapped={false} />
        </mesh>
        {/* Brass outer-edge cap */}
        <mesh position={[P.rOut - 0.02, 0, P.depth / 2]}>
          <boxGeometry args={[0.05, P.wOut * 1.9, P.depth + 0.06]} />
          <meshStandardMaterial color={REACTOR.brass} metalness={1} roughness={0.28} envMapIntensity={1.7} />
        </mesh>
      </group>
    </group>
  );
}

/* ── Octagonal core "eye" ── */
function Core({ stage, energy, reducedMotion, coreOverride, burst }: { stage: AuthReactorStage; energy: number; reducedMotion: boolean; coreOverride?: number | null; burst: { current: { v: number } } }) {
  const face = useRef<THREE.MeshStandardMaterial>(null);
  const center = useRef<THREE.Mesh>(null);
  const spokes = useRef<THREE.Group>(null);
  const dormant = useMemo(() => new THREE.Color(REACTOR.dormant), []);
  const charged = useMemo(() => new THREE.Color(REACTOR.charged), []);
  const warn = useMemo(() => new THREE.Color(REACTOR.warn), []);
  const target = useMemo(() => new THREE.Color(), []);

  useFrame((_, dt) => {
    const k = Math.min(1, dt * (reducedMotion ? 14 : 5));
    const e = coreOverride != null ? coreOverride : energy;
    target.copy(dormant).lerp(charged, e);
    if (stage === 8) target.copy(warn);
    if (face.current) {
      face.current.color.lerp(target, k);
      face.current.emissive.lerp(target, k);
      face.current.emissiveIntensity = lerp(face.current.emissiveIntensity, 0.35 + e * 2 + burst.current.v * 2, k);
    }
    if (center.current) center.current.scale.setScalar(lerp(center.current.scale.x, 0.7 + e * 0.5 + burst.current.v * 0.8, k));
    if (spokes.current && !reducedMotion) spokes.current.rotation.z += dt * (0.15 + e * 0.2);
  });

  return (
    <group>
      {/* brass octagonal rim — protrudes forward, framing a deep socket */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.04]}>
        <cylinderGeometry args={[0.52, 0.55, 0.22, 8]} />
        <meshStandardMaterial color={REACTOR.brass} metalness={1} roughness={0.22} envMapIntensity={2.4} />
      </mesh>
      {/* deep dark octagonal housing (socket walls) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.22]}>
        <cylinderGeometry args={[0.46, 0.5, 0.55, 8]} />
        <meshStandardMaterial color={REACTOR.darkMetal} metalness={1} roughness={0.3} envMapIntensity={1.8} side={THREE.DoubleSide} />
      </mesh>
      {/* dark octagon bezel (thin rim around the glow), recessed */}
      <mesh position={[0, 0, -0.04]} rotation={[0, 0, Math.PI / 8]}>
        <circleGeometry args={[0.44, 8]} />
        <meshStandardMaterial color="#0c0a18" emissive={REACTOR.cyan} emissiveIntensity={0.12} roughness={0.4} metalness={0.3} toneMapped={false} />
      </mesh>
      {/* glowing octagon face, recessed inside the socket */}
      <mesh position={[0, 0, 0.0]} rotation={[0, 0, Math.PI / 8]}>
        <circleGeometry args={[0.38, 8]} />
        <meshStandardMaterial ref={face} color={REACTOR.violet} emissive={REACTOR.violet} emissiveIntensity={0.35} roughness={0.3} metalness={0.1} toneMapped={false} />
      </mesh>
      {/* brighter inner octagon */}
      <mesh position={[0, 0, 0.03]} rotation={[0, 0, Math.PI / 8]}>
        <circleGeometry args={[0.23, 8]} />
        <meshBasicMaterial color="#bfeaff" transparent opacity={0.9} toneMapped={false} />
      </mesh>
      {/* internal spokes (kept inside the octagon) */}
      <group ref={spokes} position={[0, 0, 0.04]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} rotation={[0, 0, (i / 4) * Math.PI]}>
            <boxGeometry args={[0.46, 0.012, 0.01]} />
            <meshBasicMaterial color={REACTOR.cyan} transparent opacity={0.35} toneMapped={false} />
          </mesh>
        ))}
      </group>
      {/* bright hex centre */}
      <mesh ref={center} position={[0, 0, 0.06]}>
        <circleGeometry args={[0.13, 6]} />
        <meshBasicMaterial color={REACTOR.white} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ── Outer frame ── */
function Frame({ segments, energy, reducedMotion }: { segments: number; energy: number; reducedMotion: boolean }) {
  const accent = useRef<THREE.Group>(null);
  const accentMat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame((_, dt) => {
    if (accent.current && !reducedMotion) accent.current.rotation.z += dt * 0.05;
    if (accentMat.current) accentMat.current.opacity = lerp(accentMat.current.opacity, 0.28 + energy * 0.65, Math.min(1, dt * 3));
  });
  return (
    <group>
      {/* chunky dark housing ring */}
      <mesh>
        <torusGeometry args={[1.54, 0.085, 20, segments]} />
        <meshStandardMaterial color={REACTOR.darkMetal} metalness={1} roughness={0.3} envMapIntensity={1.7} />
      </mesh>
      {/* inner dark lip framing the panels */}
      <mesh position={[0, 0, 0.04]}>
        <torusGeometry args={[1.4, 0.03, 12, segments]} />
        <meshStandardMaterial color="#08070f" metalness={1} roughness={0.45} envMapIntensity={1.2} />
      </mesh>
      {/* glowing light-ring hugging the panel cluster */}
      <group ref={accent}>
        <mesh>
          <torusGeometry args={[1.44, 0.02, 12, segments]} />
          <meshBasicMaterial ref={accentMat} color={REACTOR.cyan} transparent opacity={0.28} toneMapped={false} />
        </mesh>
      </group>
      {/* backplate so panel gaps reveal metal, not the page */}
      <mesh position={[0, 0, -0.22]}>
        <circleGeometry args={[1.48, segments]} />
        <meshStandardMaterial color="#0b0916" metalness={1} roughness={0.5} envMapIntensity={1.1} />
      </mesh>
    </group>
  );
}

/* ── Segmented HUD tick-ring orbiting the reactor (futuristic detail) ── */
function TickRing({ reducedMotion }: { reducedMotion: boolean }) {
  const g = useRef<THREE.Group>(null);
  const ticks = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);
  useFrame((_, dt) => {
    if (g.current && !reducedMotion) g.current.rotation.z -= dt * 0.04;
  });
  return (
    <group ref={g}>
      {ticks.map((i) => {
        const ang = (i / 60) * Math.PI * 2;
        const long = i % 5 === 0;
        return (
          <mesh key={i} position={[Math.cos(ang) * 1.68, Math.sin(ang) * 1.68, 0.02]} rotation={[0, 0, ang]}>
            <boxGeometry args={[long ? 0.085 : 0.045, 0.008, 0.005]} />
            <meshBasicMaterial color={REACTOR.cyan} transparent opacity={long ? 0.55 : 0.24} toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
}

export default function AuthReactorModel({ stage, channels, energy, reducedMotion, quality, coreOverride }: ModelProps) {
  const sway = useRef<THREE.Group>(null);
  const burst = useRef({ v: 0 });
  const segments = QUALITY[quality].ringSegments;
  const geom = useMemo(() => makePanelGeometry(), []);
  useEffect(() => () => geom.dispose(), [geom]);

  useGSAP(() => {
    if (stage === 7) gsap.to(burst.current, { v: 1, duration: 0.55, ease: "power3.out" });
    else gsap.to(burst.current, { v: 0, duration: 0.4, ease: "power2.inOut" });
  }, [stage]);

  useFrame((st, dt) => {
    if (sway.current && !reducedMotion) {
      const t = st.clock.elapsedTime;
      // Gentle parallax turn so the panel depth + socket read as a 3D object.
      sway.current.rotation.y = lerp(sway.current.rotation.y, Math.sin(t * 0.28) * 0.13, Math.min(1, dt * 2));
      sway.current.rotation.x = lerp(sway.current.rotation.x, Math.sin(t * 0.21) * 0.05, Math.min(1, dt * 2));
    }
  });

  return (
    <group rotation={RIG.tilt} scale={RIG.scale}>
      <group ref={sway}>
        <Frame segments={segments} energy={energy} reducedMotion={reducedMotion} />
        <TickRing reducedMotion={reducedMotion} />
        <Core stage={stage} energy={energy} reducedMotion={reducedMotion} coreOverride={coreOverride} burst={burst} />
        {STREAMS.map((s, i) => (
          <Panel key={s.id} index={i} accent={i % 2 === 0 ? REACTOR.cyan : AMBER} stage={stage} channels={channels} reducedMotion={reducedMotion} geom={geom} />
        ))}
      </group>
    </group>
  );
}
