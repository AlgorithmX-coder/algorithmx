"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import * as THREE from "three";
import { STREAMS } from "../auth/streams";
import { STREAM_ACCENT } from "../auth/accessTokens";
import { QUALITY, REACTOR, RIG } from "./authReactorConfig";
import type { AuthReactorStage, ReactorQuality } from "./authReactorTypes";

/**
 * AuthReactorModel — TEMPORARY engineered prototype (Phase 13).
 *
 * Six independently-hinged armour panels (real pivots) with retracting clamps,
 * three concentric spinning rings, a crystalline core (crystal + smoked glass
 * + emitter), per-channel energy paths and status lights. Driven entirely by
 * the derived stage/channels/energy. State transitions use frame-loop damping
 * (deterministic + reversible); the Stage-7 success burst is a GSAP one-shot.
 *
 * This is intentionally simple and swappable: replace this whole file with the
 * gltfjsx-generated AuthReactorModel.gen.tsx (same props) once the production
 * GLB (see docs/auth-reactor-asset-spec.md) is delivered. It is NOT a match for
 * the concept render — it is a working stand-in for the activation sequence.
 */

const lerp = THREE.MathUtils.lerp;

interface ModelProps {
  stage: AuthReactorStage;
  channels: number;
  energy: number;
  reducedMotion: boolean;
  quality: ReactorQuality;
  /** Dev (leva) overrides — optional. */
  openOverride?: number | null;
  coreOverride?: number | null;
}

/* ── One hinged armour panel (a stream channel) ── */
function Panel({
  index,
  accent,
  stage,
  channels,
  reducedMotion,
  openOverride,
}: {
  index: number;
  accent: string;
  stage: AuthReactorStage;
  channels: number;
  reducedMotion: boolean;
  openOverride?: number | null;
}) {
  const hinge = useRef<THREE.Group>(null);
  const clamp = useRef<THREE.Mesh>(null);
  const stripMat = useRef<THREE.MeshStandardMaterial>(null);
  const pathMat = useRef<THREE.MeshBasicMaterial>(null);
  const lightMat = useRef<THREE.MeshStandardMaterial>(null);
  const a = (index / 6) * Math.PI * 2;
  const accentCol = useMemo(() => new THREE.Color(accent), [accent]);
  const cold = useMemo(() => new THREE.Color(REACTOR.dormant), []);
  const rim = 1.02;

  useFrame((_, dt) => {
    const k = Math.min(1, dt * (reducedMotion ? 14 : 5));
    const active = index < channels || stage >= 7;
    const open = openOverride != null ? openOverride : stage >= 7 ? 1 : active ? (stage >= 5 ? 1 : 0.6) : 0;
    if (hinge.current) hinge.current.rotation.y = lerp(hinge.current.rotation.y, open * RIG.panelOpenAngle, k);
    if (clamp.current) clamp.current.position.z = lerp(clamp.current.position.z, active ? RIG.clampRetractedZ : RIG.clampSeatedZ, k);
    if (stripMat.current) {
      stripMat.current.emissive.lerp(active ? accentCol : cold, k);
      stripMat.current.emissiveIntensity = lerp(stripMat.current.emissiveIntensity, active ? 1.6 : 0.04, k);
    }
    if (pathMat.current) {
      pathMat.current.color.lerp(active ? accentCol : cold, k);
      pathMat.current.opacity = lerp(pathMat.current.opacity, active ? 0.7 : 0.05, k);
    }
    if (lightMat.current) {
      lightMat.current.emissive.lerp(active ? accentCol : cold, k);
      lightMat.current.emissiveIntensity = lerp(lightMat.current.emissiveIntensity, active ? 2 : 0.05, k);
    }
  });

  return (
    <group rotation={[0, 0, a]}>
      {/* Energy path (rim → core) revealed as the panel opens. On the
          core's face plane (RIG.coreZ): at z=0 (the pivot plane) the six
          spokes converged at a point that projected AWAY from the orb
          under tilt/sway - the crosshair read misaligned. */}
      <mesh position={[rim / 2, 0, RIG.coreZ]} renderOrder={15}>
        <boxGeometry args={[rim - 0.2, 0.03, 0.015]} />
        <meshBasicMaterial ref={pathMat} color={REACTOR.dormant} transparent opacity={0.05} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} depthTest={false} />
      </mesh>
      {/* Status light pip near the frame */}
      <mesh position={[rim + 0.2, 0, 0.18]}>
        <sphereGeometry args={[0.05, 24, 24]} />
        <meshStandardMaterial ref={lightMat} color="#0a0a14" emissive={REACTOR.dormant} emissiveIntensity={0.05} roughness={0.3} metalness={0.2} toneMapped={false} />
      </mesh>
      {/* Hinge pivot at the rim; panel tips toward the viewer to open */}
      <group ref={hinge} position={[rim, 0, 0.1]}>
        <RoundedBox args={[0.72, 0.92, 0.14]} radius={0.05} smoothness={4} position={[-0.37, 0, 0]}>
          <meshStandardMaterial color={REACTOR.darkMetal} metalness={1} roughness={0.34} envMapIntensity={1.9} />
        </RoundedBox>
        <mesh position={[-0.37, 0, 0.085]}>
          <boxGeometry args={[0.5, 0.05, 0.02]} />
          <meshStandardMaterial ref={stripMat} color={REACTOR.brass} emissive={REACTOR.dormant} emissiveIntensity={0.04} metalness={1} roughness={0.3} toneMapped={false} />
        </mesh>
        <mesh ref={clamp} position={[-0.06, 0, RIG.clampSeatedZ]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.12, 32]} />
          <meshStandardMaterial color={REACTOR.brass} metalness={1} roughness={0.28} envMapIntensity={1.8} />
        </mesh>
      </group>
    </group>
  );
}

/* ── Concentric rings ── */
function Rings({ stage, energy, reducedMotion, segments }: { stage: AuthReactorStage; energy: number; reducedMotion: boolean; segments: number }) {
  const groups = useRef<THREE.Group[]>([]);
  const mats = useRef<THREE.MeshBasicMaterial[]>([]);
  const radii = [1.34, 0.62, 0.42];
  const colors = [REACTOR.cyan, REACTOR.brass, REACTOR.cyan];
  useFrame((_, dt) => {
    radii.forEach((_, i) => {
      const g = groups.current[i];
      const m = mats.current[i];
      if (g && !reducedMotion) {
        const boost = stage === 6 ? RIG.ringSubmitBoost : 1;
        const activeFactor = stage >= 2 ? 1 : 0.25;
        g.rotation.z += dt * RIG.ringBaseSpeed[i] * activeFactor * boost;
      }
      if (m) m.opacity = lerp(m.opacity, 0.12 + energy * 0.7, Math.min(1, dt * 3));
    });
  });
  /* Inner rings sit EXACTLY on the core's face plane - any z stagger at
     all reads as the ring circling the orb off-centre under tilt/sway
     (owner flagged it twice at high zoom). Coplanar is safe: additive
     blending + depthWrite:false means no z-fighting, and the orb draws
     above everything regardless. The outer ring hugs the frame lip. */
  return (
    <>
      {radii.map((r, i) => (
        <group key={i} ref={(el) => { if (el) groups.current[i] = el; }} position={[0, 0, i === 0 ? 0.2 : RIG.coreZ]}>
          {/* Inner rings draw ABOVE the armour (renderOrder + no depth
              test, like the orb): depth-tested they get top-clipped by
              the tilted panels while the bottom arc stays visible, and
              asymmetric arcs READ as off-centre even though the ring is
              geometrically concentric with the orb. */}
          <mesh renderOrder={i === 0 ? 0 : 16}>
            <torusGeometry args={[r, 0.012, 16, segments]} />
            <meshBasicMaterial ref={(el) => { if (el) mats.current[i] = el as THREE.MeshBasicMaterial; }} color={colors[i]} transparent opacity={0.12} toneMapped={false} depthTest={i === 0} depthWrite={false} />
          </mesh>
        </group>
      ))}
    </>
  );
}

/* ── Core: crystal + smoked glass + emitter ── */
function Core({ stage, energy, reducedMotion, coreOverride, burst }: { stage: AuthReactorStage; energy: number; reducedMotion: boolean; coreOverride?: number | null; burst: { current: { v: number } } }) {
  const crystal = useRef<THREE.Mesh>(null);
  const crystalMat = useRef<THREE.MeshStandardMaterial>(null);
  const emitter = useRef<THREE.Mesh>(null);
  const glassMat = useRef<THREE.MeshPhysicalMaterial>(null);
  const dormant = useMemo(() => new THREE.Color(REACTOR.dormant), []);
  const charged = useMemo(() => new THREE.Color(REACTOR.charged), []);
  const warn = useMemo(() => new THREE.Color(REACTOR.warn), []);
  const target = useMemo(() => new THREE.Color(), []);

  useFrame((st, dt) => {
    const k = Math.min(1, dt * (reducedMotion ? 14 : 5));
    const e = coreOverride != null ? coreOverride : energy;
    target.copy(dormant).lerp(charged, e);
    if (stage === 8) target.copy(warn);
    if (crystalMat.current) {
      crystalMat.current.color.lerp(target, k);
      crystalMat.current.emissive.lerp(target, k);
      crystalMat.current.emissiveIntensity = lerp(crystalMat.current.emissiveIntensity, 0.3 + e * 2.2 + burst.current.v * 2, k);
    }
    if (crystal.current) {
      const breathe = reducedMotion ? 1 : 1 + Math.sin(st.clock.elapsedTime * 1.5) * 0.04;
      crystal.current.scale.setScalar(lerp(crystal.current.scale.x, breathe * (1 + burst.current.v * 0.4), k));
      if (!reducedMotion) crystal.current.rotation.y += dt * (0.2 + e * 0.3);
    }
    if (emitter.current) emitter.current.scale.setScalar(lerp(emitter.current.scale.x, 0.6 + e * 0.6 + burst.current.v * 0.8, k));
    if (glassMat.current) glassMat.current.opacity = lerp(glassMat.current.opacity, 0.22 - e * 0.08, k);
  });

  /* The whole assembly rides the dial's FACE plane (RIG.coreZ) so it stays
     centred inside the panel aperture under the static tilt and idle sway
     (at the old pivot z=0 it parallax-drifted out of the aperture). The
     shell is sized to nest INSIDE the closed-panel aperture (~0.30), and
     every layer draws above the armour (renderOrder + no depth test, same
     trick the LED already used) so flaps can never clip the orb. */
  return (
    <group position={[0, 0, RIG.coreZ]}>
      <mesh ref={crystal} renderOrder={18}>
        <icosahedronGeometry args={[0.22, 1]} />
        <meshStandardMaterial ref={crystalMat} color={REACTOR.violet} emissive={REACTOR.violet} emissiveIntensity={0.3} roughness={0.25} metalness={0.1} toneMapped={false} transparent depthTest={false} depthWrite={false} />
      </mesh>
      <mesh renderOrder={19}>
        <sphereGeometry args={[0.3, 48, 48]} />
        <meshPhysicalMaterial ref={glassMat} color="#0d1430" roughness={0.08} metalness={0} ior={1.45} clearcoat={1} transparent opacity={0.22} envMapIntensity={1.8} depthTest={false} depthWrite={false} />
      </mesh>
      <mesh ref={emitter} renderOrder={20}>
        <sphereGeometry args={[0.14, 32, 32]} />
        <meshBasicMaterial color={REACTOR.white} toneMapped={false} transparent depthTest={false} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ── Static frame/housing ── */
function Frame({ segments }: { segments: number }) {
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.1]}>
        <cylinderGeometry args={[1.5, 1.5, 0.5, segments, 1, true]} />
        <meshStandardMaterial color={REACTOR.darkMetal} metalness={1} roughness={0.34} envMapIntensity={1.8} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, 0.16]}>
        <torusGeometry args={[1.46, 0.03, 24, segments]} />
        <meshStandardMaterial color={REACTOR.brass} metalness={1} roughness={0.24} envMapIntensity={1.9} />
      </mesh>
      <mesh position={[0, 0, -0.24]}>
        <circleGeometry args={[1.46, segments]} />
        <meshStandardMaterial color="#0c0a18" metalness={1} roughness={0.5} envMapIntensity={1.1} />
      </mesh>
    </group>
  );
}

export default function AuthReactorModel({ stage, channels, energy, reducedMotion, quality, openOverride, coreOverride }: ModelProps) {
  const sway = useRef<THREE.Group>(null);
  const burst = useRef({ v: 0 });
  const segments = QUALITY[quality].ringSegments;

  // Stage-7 hero beat: GSAP one-shot (sequenced), read by useFrame above.
  useGSAP(() => {
    if (stage === 7) gsap.to(burst.current, { v: 1, duration: 0.55, ease: "power3.out" });
    else gsap.to(burst.current, { v: 0, duration: 0.4, ease: "power2.inOut" });
  }, [stage]);

  useFrame((st, dt) => {
    if (sway.current && !reducedMotion) {
      const t = st.clock.elapsedTime;
      sway.current.rotation.y = lerp(sway.current.rotation.y, Math.sin(t * 0.3) * 0.06, Math.min(1, dt * 2));
      sway.current.rotation.x = lerp(sway.current.rotation.x, Math.sin(t * 0.23) * 0.025, Math.min(1, dt * 2));
    }
  });

  return (
    <group rotation={RIG.tilt} scale={RIG.scale}>
      <group ref={sway}>
        <Frame segments={segments} />
        <Rings stage={stage} energy={energy} reducedMotion={reducedMotion} segments={segments} />
        <Core stage={stage} energy={energy} reducedMotion={reducedMotion} coreOverride={coreOverride} burst={burst} />
        {STREAMS.map((s, i) => (
          <Panel
            key={s.id}
            index={i}
            accent={STREAM_ACCENT[s.id] ?? REACTOR.cyan}
            stage={stage}
            channels={channels}
            reducedMotion={reducedMotion}
            openOverride={openOverride}
          />
        ))}
      </group>
    </group>
  );
}
