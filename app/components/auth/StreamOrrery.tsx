"use client";

import { useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, RoundedBox, ContactShadows } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { ACCESS, STREAM_ACCENT } from "./accessTokens";
import { STREAMS } from "./streams";
import LearningCore, { type CoreStage } from "./LearningCore";

/**
 * Stream Orrery — the AlgorithmX auth centrepiece (Batch 2: static object
 * + state wiring; choreography polish, the success open/hub reveal and the
 * camera dolly are later batches).
 *
 * A precision instrument, not a reactor:
 *   1. Command core — a machined ovoid housing (closed segments) around an
 *      internal light-engine. At rest only a thin glowing equatorial seam
 *      shows (dormant); fully powered it reads bright (charged). Segments
 *      separate to reveal the core at SUCCESS — a later batch; here we only
 *      support the closed + fully-bright states.
 *   2. Six articulated arms on an equatorial brass collar — folded inward
 *      (closed pod) at rest, swung out and locked into a tilted six-spoke
 *      halo when powered. Each arm has a visible machined joint.
 *   3. Six stream modules at the arm tips — a metal casing with a glass
 *      lens in the stream's accent (dark when dormant, lit when online).
 *
 * Rig (Canvas, DPR caps, baked Lightformer Environment, ContactShadows,
 * GlowSprite, EffectComposer, fixed-tilt + slow inner-yaw, quality tiers,
 * dynamic ssr:false, asset disposal) is ported from LearningCore.
 */

export type OrreryPhase = "idle" | "armed" | "submitting" | "success" | "error";

export interface OrreryState {
  modulesOnline: number; // 0–6: arms deployed / modules lit
  focus: "name" | "email" | "password" | "confirm" | null;
  phase: OrreryPhase;
  reducedMotion: boolean;
  quality: "high" | "medium" | "low";
}

/* ── Material palette (warm brass against dark anodised metal) ── */
const DARK_METAL = "#15132a";
const LIGHT_METAL = "#2a2647";
const BRASS = "#c2a05a";
const C_VIOLET = "#8b6cff";
const C_CYAN = "#36dbff";

const COLLAR_R = 0.6;
const STRUT_LEN = 0.62;
const FOLD_Z = 1.5; // arms point up — closed pod
const DEPLOY_Z = -0.12; // arms radial, tips slightly up — tilted halo

const lerp = THREE.MathUtils.lerp;
const damp = (cur: number, target: number, dt: number, speed = 5) => lerp(cur, target, Math.min(1, dt * speed));

/** Charge 0–1 for the core; full only at success (modulesOnline forced 6). */
function chargeOf(s: OrreryState): number {
  return Math.min(1, s.modulesOnline / 6);
}

/* ───────────────────────── SOFT GLOW SPRITE (ported) ───────────────────────── */
function GlowSprite() {
  const tex = useMemo(() => {
    const size = 256;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d");
    if (ctx) {
      const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      g.addColorStop(0, "rgba(150,118,255,0.5)");
      g.addColorStop(0.4, "rgba(90,80,200,0.16)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
    }
    return new THREE.CanvasTexture(c);
  }, []);
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <mesh position={[0, 0, -1.5]}>
      <planeGeometry args={[7, 7]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </mesh>
  );
}

/* ───────────────────────── COMMAND CORE ───────────────────────── */
function CommandCore({ state }: { state: OrreryState }) {
  const seamMat = useRef<THREE.MeshStandardMaterial>(null);
  const engineMat = useRef<THREE.MeshStandardMaterial>(null);
  const engine = useRef<THREE.Mesh>(null);
  const dormant = useMemo(() => new THREE.Color(ACCESS.dormant), []);
  const charged = useMemo(() => new THREE.Color(ACCESS.charged), []);
  const warn = useMemo(() => new THREE.Color(ACCESS.warn), []);
  const target = useMemo(() => new THREE.Color(), []);

  useFrame((st, dt) => {
    const motion = !state.reducedMotion;
    const k = Math.min(1, dt * (motion ? 5 : 14));
    const charge = chargeOf(state);
    const isError = state.phase === "error";

    target.copy(dormant).lerp(charged, charge);
    if (isError) target.copy(warn);

    if (seamMat.current) {
      seamMat.current.color.lerp(target, k);
      seamMat.current.emissive.lerp(target, k);
      seamMat.current.emissiveIntensity = damp(seamMat.current.emissiveIntensity, isError ? 1 : 0.35 + charge * 1.8, dt, motion ? 4 : 14);
    }
    if (engineMat.current) {
      engineMat.current.emissive.lerp(target, k);
      engineMat.current.emissiveIntensity = damp(engineMat.current.emissiveIntensity, isError ? 0.8 : 0.4 + charge * 2.2, dt, motion ? 4 : 14);
    }
    if (engine.current) {
      const breathe = motion ? 1 + Math.sin(st.clock.elapsedTime * 1.5) * 0.04 : 1;
      engine.current.scale.setScalar(damp(engine.current.scale.x, breathe, dt));
    }
  });

  return (
    <group scale={[1, 1.12, 1]}>
      {/* Housing — two closed metal caps with a thin equatorial gap */}
      <mesh>
        <sphereGeometry args={[0.5, 48, 28, 0, Math.PI * 2, 0, Math.PI * 0.47]} />
        <meshStandardMaterial color={DARK_METAL} metalness={1} roughness={0.3} envMapIntensity={1.7} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.5, 48, 28, 0, Math.PI * 2, Math.PI * 0.53, Math.PI * 0.47]} />
        <meshStandardMaterial color={DARK_METAL} metalness={1} roughness={0.3} envMapIntensity={1.7} />
      </mesh>

      {/* Brass meridian inlays — read as interlocking segments */}
      {Array.from({ length: 4 }).map((_, i) => (
        <mesh key={i} rotation={[0, (i / 4) * Math.PI, 0]}>
          <torusGeometry args={[0.5, 0.012, 8, 48, Math.PI * 0.9]} />
          <meshStandardMaterial color={BRASS} metalness={1} roughness={0.34} envMapIntensity={1.5} />
        </mesh>
      ))}

      {/* Glowing equatorial seam */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.022, 12, 96]} />
        <meshStandardMaterial ref={seamMat} color={ACCESS.dormant} emissive={ACCESS.dormant} emissiveIntensity={0.35} roughness={0.4} metalness={0.2} toneMapped={false} />
      </mesh>

      {/* Internal light-engine (mostly occluded; carries bloom + spill) */}
      <mesh ref={engine}>
        <icosahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial ref={engineMat} color={C_VIOLET} emissive={C_VIOLET} emissiveIntensity={0.4} roughness={0.3} metalness={0.1} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ───────────────────────── EQUATORIAL COLLAR ───────────────────────── */
function Collar() {
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <mesh>
        <torusGeometry args={[COLLAR_R, 0.05, 16, 96]} />
        <meshStandardMaterial color={BRASS} metalness={1} roughness={0.33} envMapIntensity={1.6} />
      </mesh>
      <mesh>
        <torusGeometry args={[COLLAR_R - 0.07, 0.018, 10, 96]} />
        <meshStandardMaterial color={LIGHT_METAL} metalness={1} roughness={0.28} envMapIntensity={1.7} />
      </mesh>
    </group>
  );
}

/* ───────────────────────── ONE ARTICULATED ARM ───────────────────────── */
function Arm({ index, accent, state }: { index: number; accent: string; state: OrreryState }) {
  const pivot = useRef<THREE.Group>(null);
  const lensMat = useRef<THREE.MeshStandardMaterial>(null);
  const haloMat = useRef<THREE.MeshBasicMaterial>(null);
  const a = (index / 6) * Math.PI * 2;
  const accentCol = useMemo(() => new THREE.Color(accent), [accent]);

  useFrame((_, dt) => {
    const motion = !state.reducedMotion;
    const k = Math.min(1, dt * (motion ? 5 : 14));
    const deployed = index < state.modulesOnline;
    const focused = state.focus !== null && index === state.modulesOnline && state.phase !== "success";

    const targetZ = (deployed ? DEPLOY_Z : FOLD_Z) + (focused ? -0.12 : 0);
    if (pivot.current) pivot.current.rotation.z = lerp(pivot.current.rotation.z, targetZ, k);
    if (lensMat.current) {
      lensMat.current.emissive.lerp(accentCol, Math.min(1, dt * 4));
      lensMat.current.emissiveIntensity = damp(lensMat.current.emissiveIntensity, deployed ? (focused ? 2.3 : 1.6) : 0.04, dt, motion ? 5 : 14);
    }
    if (haloMat.current) {
      haloMat.current.color.lerp(accentCol, Math.min(1, dt * 4));
      haloMat.current.opacity = damp(haloMat.current.opacity, deployed ? 0.5 : 0, dt, motion ? 5 : 14);
    }
  });

  return (
    <group rotation={[0, -a, 0]}>
      <group position={[COLLAR_R, 0, 0]}>
        <group ref={pivot} rotation={[0, 0, FOLD_Z]}>
          {/* Machined joint at the pivot */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.18, 20]} />
            <meshStandardMaterial color={BRASS} metalness={1} roughness={0.34} envMapIntensity={1.6} />
          </mesh>
          {/* Beveled strut */}
          <RoundedBox args={[STRUT_LEN, 0.13, 0.1]} radius={0.04} smoothness={4} position={[STRUT_LEN / 2 + 0.06, 0, 0]}>
            <meshStandardMaterial color={DARK_METAL} metalness={1} roughness={0.3} envMapIntensity={1.7} />
          </RoundedBox>
          {/* Module at the tip */}
          <group position={[STRUT_LEN + 0.12, 0, 0]}>
            <RoundedBox args={[0.28, 0.24, 0.22]} radius={0.05} smoothness={4}>
              <meshStandardMaterial color={DARK_METAL} metalness={1} roughness={0.32} envMapIntensity={1.6} />
            </RoundedBox>
            {/* Brass bezel */}
            <mesh position={[0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.1, 0.1, 0.06, 22]} />
              <meshStandardMaterial color={BRASS} metalness={1} roughness={0.3} envMapIntensity={1.7} />
            </mesh>
            {/* Glass / emissive lens */}
            <mesh position={[0.155, 0, 0]}>
              <sphereGeometry args={[0.072, 18, 18]} />
              <meshStandardMaterial ref={lensMat} color="#0a0a14" emissive={accent} emissiveIntensity={0.04} roughness={0.2} metalness={0.2} toneMapped={false} />
            </mesh>
            {/* Soft halo when online */}
            <mesh position={[0.17, 0, 0]}>
              <circleGeometry args={[0.16, 24]} />
              <meshBasicMaterial ref={haloMat} color={accent} transparent opacity={0} toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

/* ───────────────────────── ASSEMBLY (tilt + slow inner yaw) ───────────────────────── */
function Assembly({ state }: { state: OrreryState }) {
  const yaw = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (yaw.current && !state.reducedMotion) yaw.current.rotation.y += dt * 0.06;
  });
  return (
    <group rotation={[0.34, 0, 0]} scale={0.82}>
      <group ref={yaw}>
        <Collar />
        <CommandCore state={state} />
        {STREAMS.map((s, i) => (
          <Arm key={s.id} index={i} accent={STREAM_ACCENT[s.id] ?? C_CYAN} state={state} />
        ))}
      </group>
    </group>
  );
}

/* ───────────────────────── LIGHTING (ported, warmed) ───────────────────────── */
function Lighting({ state }: { state: OrreryState }) {
  const spill = useRef<THREE.PointLight>(null);
  const dormant = useMemo(() => new THREE.Color(ACCESS.dormant), []);
  const charged = useMemo(() => new THREE.Color(ACCESS.charged), []);
  const warn = useMemo(() => new THREE.Color(ACCESS.warn), []);
  const col = useMemo(() => new THREE.Color(ACCESS.dormant), []);
  const target = useMemo(() => new THREE.Color(), []);
  useFrame((_, dt) => {
    if (!spill.current) return;
    const charge = chargeOf(state);
    target.copy(dormant).lerp(charged, charge);
    if (state.phase === "error") target.copy(warn);
    col.lerp(target, Math.min(1, dt * 4));
    spill.current.color.copy(col);
    spill.current.intensity = damp(spill.current.intensity, 0.8 + charge * 2.2, dt);
  });
  return (
    <>
      <ambientLight intensity={0.32} />
      <directionalLight position={[5, 3, 4]} intensity={1.35} color={C_CYAN} />
      <directionalLight position={[-5, 1, -2]} intensity={1} color={C_VIOLET} />
      <directionalLight position={[0, 4, 3]} intensity={0.4} color="#aab6e0" />
      {/* Warm fill to complement the brass */}
      <directionalLight position={[3, -2, 3]} intensity={0.35} color="#ffcaa0" />
      <pointLight ref={spill} position={[0, 0, 0.4]} intensity={0.8} color={ACCESS.dormant} distance={8} decay={2} />
    </>
  );
}

/* ───────────────────────── SCENE ───────────────────────── */
function Scene({ state }: { state: OrreryState }) {
  const high = state.quality === "high";
  return (
    <>
      <Lighting state={state} />
      <Environment resolution={high ? 256 : 128} frames={1}>
        <Lightformer form="rect" intensity={2.8} color={C_CYAN} position={[4, 2, 3]} scale={[6, 6, 1]} />
        <Lightformer form="rect" intensity={1.7} color={C_VIOLET} position={[-4, -1, 2]} scale={[6, 6, 1]} />
        <Lightformer form="circle" intensity={1.5} color="#ffffff" position={[0, 5, -3]} scale={3} />
        <Lightformer form="rect" intensity={1} color="#ffcaa0" position={[3, -3, 2]} scale={[4, 3, 1]} />
      </Environment>

      <GlowSprite />
      <Assembly state={state} />

      {high && (
        <ContactShadows position={[0, -1.55, 0]} opacity={0.4} scale={7} blur={2.8} far={4} resolution={512} color="#04060f" />
      )}

      {high && (
        // Ported from the app's proven VaultScene/LearningCore composer.
        <EffectComposer multisampling={4}>
          <Bloom intensity={0.74} luminanceThreshold={0.5} luminanceSmoothing={0.3} mipmapBlur />
          <Vignette eskil={false} offset={0.24} darkness={0.76} />
        </EffectComposer>
      )}
    </>
  );
}

function OrreryCanvas({ state }: { state: OrreryState }) {
  return (
    <Canvas
      dpr={state.quality === "high" ? [1, 1.75] : [1, 1.5]}
      camera={{ position: [0, 0.2, 6.2], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%", background: "transparent", pointerEvents: "none" }}
    >
      <Scene state={state} />
    </Canvas>
  );
}

const OrreryCanvasLazy = dynamic(() => Promise.resolve({ default: OrreryCanvas }), { ssr: false });

/* Map the orrery state onto the legacy CoreStage so the EXISTING mobile
 * fallback (LearningCore's CSS emblem) keeps working unchanged this batch.
 * The orrery-specific mobile emblem is a later batch. */
function coreStageFromOrrery(s: OrreryState): CoreStage {
  const p = Math.min(4, s.modulesOnline);
  return {
    identityRing: p >= 1,
    commsRing: p >= 2,
    shieldLayer: p >= 3,
    vaultLock: p >= 4,
    accessGranted: s.phase === "success",
  };
}

/**
 * StreamOrrery — drop into the auth scene. `quality` (inside state) picks
 * the renderer: high/medium → R3F orrery (lazy, client-only); low → the
 * existing CSS emblem fallback.
 */
export default function StreamOrrery({ state }: { state: OrreryState }) {
  if (state.quality === "low") return <LearningCore stage={coreStageFromOrrery(state)} quality="low" />;
  return <OrreryCanvasLazy state={state} />;
}
