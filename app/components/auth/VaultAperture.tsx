"use client";

import { useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, ContactShadows } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { ACCESS, STREAM_ACCENT } from "./accessTokens";
import { STREAMS } from "./streams";
import LearningCore, { type CoreStage } from "./LearningCore";

/**
 * Vault Aperture — the AlgorithmX auth centrepiece (Batch 2b: static states
 * + state wiring; polished success cinematics, weighted springs and the full
 * error-vent are later batches).
 *
 * A machined circular vault set into a recessed frame, faced near head-on
 * with a slight 3/4 tilt. The DOOR is the six streams: six thick beveled
 * sectors around a central locking boss. Each valid field unlocks a sector
 * (brass edge + inner light-channel light in its accent, bolt retracts);
 * armed cracks the door open with light bleeding through; success irises the
 * six sectors out and reveals the internal light-engine behind.
 *
 * Rig (Canvas, DPR caps, baked Lightformer Environment, ContactShadows,
 * GlowSprite, EffectComposer, fixed-tilt + subtle inner sway, quality tiers,
 * dynamic ssr:false, asset disposal) is ported from StreamOrrery. Only the
 * geometry + per-state logic differ. (The head-on framing means the inner
 * "yaw" is a bounded sway, not an accumulating spin, so the door never turns
 * away from the viewer — the one rig deviation the framing requires.)
 */

export type AuthMachinePhase = "idle" | "armed" | "submitting" | "success" | "error";

export interface AuthMachineState {
  modulesOnline: number; // 0–6: sectors unlocked / lit
  focus: "name" | "email" | "password" | "confirm" | null;
  phase: AuthMachinePhase;
  reducedMotion: boolean;
  quality: "high" | "medium" | "low";
}

/* ── Material palette (warm brass against dark anodised metal) ── */
const DARK_METAL = "#15132a";
const BRASS = "#d2a24c"; // pushed warmer than the orrery's brass
const C_VIOLET = "#8b6cff";
const C_CYAN = "#36dbff";

/* ── Aperture geometry constants ── */
const R_INNER = 0.16;
const R_OUTER = 1.3;
const SLOT = Math.PI / 3 - 0.05; // 60° minus a thin seam gap
const DEPTH = 0.18;

const lerp = THREE.MathUtils.lerp;
const damp = (cur: number, target: number, dt: number, speed = 5) => lerp(cur, target, Math.min(1, dt * speed));

/** Charge 0–1 for the core/seam; full only at success (modulesOnline forced 6). */
function chargeOf(s: AuthMachineState): number {
  return Math.min(1, s.modulesOnline / 6);
}

/** An annular sector (pie segment) centred on the +X axis, extruded along Z. */
function makeSectorGeometry(): THREE.ExtrudeGeometry {
  const half = SLOT / 2;
  const shape = new THREE.Shape();
  shape.moveTo(Math.cos(-half) * R_INNER, Math.sin(-half) * R_INNER);
  shape.lineTo(Math.cos(-half) * R_OUTER, Math.sin(-half) * R_OUTER);
  shape.absarc(0, 0, R_OUTER, -half, half, false);
  shape.lineTo(Math.cos(half) * R_INNER, Math.sin(half) * R_INNER);
  shape.absarc(0, 0, R_INNER, half, -half, true);
  return new THREE.ExtrudeGeometry(shape, {
    depth: DEPTH,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 2,
    curveSegments: 96, // crisp, perfectly round sector arcs
  });
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
    <mesh position={[0, 0, -1.6]}>
      <planeGeometry args={[7, 7]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </mesh>
  );
}

/* ───────────────────────── ONE DOOR SECTOR ───────────────────────── */
function Sector({ index, accent, state, geom }: { index: number; accent: string; state: AuthMachineState; geom: THREE.ExtrudeGeometry }) {
  const slide = useRef<THREE.Group>(null);
  const channelMat = useRef<THREE.MeshStandardMaterial>(null);
  const edgeMat = useRef<THREE.MeshStandardMaterial>(null);
  const bolt = useRef<THREE.Mesh>(null);
  const a = (index / 6) * Math.PI * 2;
  const accentCol = useMemo(() => new THREE.Color(accent), [accent]);
  const cold = useMemo(() => new THREE.Color(ACCESS.dormant), []);
  const brassCol = useMemo(() => new THREE.Color(BRASS), []);

  useFrame((_, dt) => {
    const motion = !state.reducedMotion;
    const k = Math.min(1, dt * (motion ? 5 : 14));
    const unlocked = index < state.modulesOnline;
    const armed = state.phase === "armed" || state.phase === "submitting";
    const success = state.phase === "success";
    const focused = state.focus !== null && index === state.modulesOnline && !success;

    // Radial iris: sealed → crack (armed) → retract back+out (success).
    const openX = success ? 0.42 : armed ? 0.07 : 0;
    const openZ = success ? -0.12 : 0;
    if (slide.current) {
      slide.current.position.x = lerp(slide.current.position.x, openX, k);
      slide.current.position.z = lerp(slide.current.position.z, openZ, k);
    }
    // Inner light-channel.
    if (channelMat.current) {
      channelMat.current.emissive.lerp(unlocked ? accentCol : cold, Math.min(1, dt * 4));
      channelMat.current.emissiveIntensity = damp(channelMat.current.emissiveIntensity, unlocked ? (focused ? 2.3 : 1.5) : 0.05, dt, motion ? 5 : 14);
    }
    // Brass edge warms when unlocked.
    if (edgeMat.current) {
      edgeMat.current.emissive.lerp(unlocked ? accentCol : cold, Math.min(1, dt * 4));
      edgeMat.current.emissiveIntensity = damp(edgeMat.current.emissiveIntensity, unlocked ? 0.5 : 0, dt, motion ? 5 : 14);
      edgeMat.current.color.lerp(brassCol, Math.min(1, dt * 4));
    }
    // Bolt retracts (recedes in Z) when unlocked.
    if (bolt.current) bolt.current.position.z = lerp(bolt.current.position.z, unlocked ? 0.06 : 0.16, k);
  });

  const mid = (R_INNER + R_OUTER) / 2;
  return (
    <group rotation={[0, 0, a]}>
      <group ref={slide}>
        {/* Sector body — dark anodised, clearcoat for richer reflections */}
        <mesh geometry={geom}>
          <meshPhysicalMaterial color={DARK_METAL} metalness={1} roughness={0.34} clearcoat={0.6} clearcoatRoughness={0.3} envMapIntensity={1.9} />
        </mesh>
        {/* Brass outer-edge arc */}
        <mesh rotation={[0, 0, -SLOT / 2]} position={[0, 0, DEPTH]}>
          <torusGeometry args={[R_OUTER - 0.03, 0.018, 20, 128, SLOT]} />
          <meshStandardMaterial ref={edgeMat} color={BRASS} emissive={ACCESS.dormant} emissiveIntensity={0} metalness={1} roughness={0.26} envMapIntensity={1.7} />
        </mesh>
        {/* Recessed inner light-channel (the stream's signal) */}
        <mesh position={[mid, 0, DEPTH + 0.005]}>
          <boxGeometry args={[R_OUTER - R_INNER - 0.18, 0.04, 0.02]} />
          <meshStandardMaterial ref={channelMat} color="#0a0a14" emissive={ACCESS.dormant} emissiveIntensity={0.05} roughness={0.25} metalness={0.2} toneMapped={false} />
        </mesh>
        {/* Bolt near the inner edge */}
        <mesh ref={bolt} position={[R_INNER + 0.12, 0, 0.16]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.1, 40]} />
          <meshStandardMaterial color={BRASS} metalness={1} roughness={0.26} envMapIntensity={1.8} />
        </mesh>
      </group>
    </group>
  );
}

/* ───────────────────────── CENTRAL BOSS + SEAM + CORE ───────────────────────── */
function CoreAndBoss({ state }: { state: AuthMachineState }) {
  const boss = useRef<THREE.Group>(null);
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
    const armed = state.phase === "armed" || state.phase === "submitting";
    const success = state.phase === "success";
    const isError = state.phase === "error";

    target.copy(dormant).lerp(charged, charge);
    if (isError) target.copy(warn);

    if (seamMat.current) {
      seamMat.current.color.lerp(target, k);
      seamMat.current.emissive.lerp(target, k);
      seamMat.current.emissiveIntensity = damp(seamMat.current.emissiveIntensity, isError ? 1 : 0.3 + charge * 1.8, dt, motion ? 4 : 14);
    }
    if (engineMat.current) {
      engineMat.current.emissive.lerp(target, k);
      engineMat.current.emissiveIntensity = damp(engineMat.current.emissiveIntensity, isError ? 0.8 : 0.4 + charge * 2.4 + (success ? 1.2 : 0), dt, motion ? 4 : 14);
    }
    if (engine.current) {
      const breathe = motion ? 1 + Math.sin(st.clock.elapsedTime * 1.5) * 0.04 : 1;
      engine.current.scale.setScalar(damp(engine.current.scale.x, breathe * (success ? 1.2 : 1), dt));
    }
    // Boss disengages (lifts forward) when armed; lifts + shrinks on success.
    if (boss.current) {
      const z = success ? 0.5 : armed ? 0.12 : 0;
      const s = success ? 0.4 : 1;
      boss.current.position.z = lerp(boss.current.position.z, z, k);
      boss.current.scale.setScalar(lerp(boss.current.scale.x, s, k));
      if (motion && armed) boss.current.rotation.z += dt * 0.4;
    }
  });

  return (
    <group>
      {/* Internal light-engine behind the door */}
      <mesh ref={engine} position={[0, 0, -0.05]}>
        <icosahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial ref={engineMat} color={C_VIOLET} emissive={C_VIOLET} emissiveIntensity={0.4} roughness={0.3} metalness={0.1} toneMapped={false} />
      </mesh>
      {/* Bright node for bloom when the aperture opens */}
      <mesh position={[0, 0, -0.05]}>
        <sphereGeometry args={[0.16, 48, 48]} />
        <meshBasicMaterial color="#eaf6ff" toneMapped={false} />
      </mesh>

      {/* Central locking boss + main seam */}
      <group ref={boss}>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.13]}>
          <cylinderGeometry args={[0.18, 0.18, 0.26, 96]} />
          <meshStandardMaterial color={DARK_METAL} metalness={1} roughness={0.26} envMapIntensity={1.9} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.27]}>
          <cylinderGeometry args={[0.12, 0.12, 0.04, 96]} />
          <meshStandardMaterial color={BRASS} metalness={1} roughness={0.26} envMapIntensity={1.8} />
        </mesh>
        <mesh position={[0, 0, 0.285]}>
          <torusGeometry args={[0.2, 0.01, 20, 200]} />
          <meshStandardMaterial ref={seamMat} color={ACCESS.dormant} emissive={ACCESS.dormant} emissiveIntensity={0.3} roughness={0.4} metalness={0.2} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

/* ───────────────────────── FRAME / HOUSING ───────────────────────── */
function Frame() {
  return (
    <group>
      {/* Recessed barrel wall */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.1]}>
        <cylinderGeometry args={[1.5, 1.5, 0.6, 256, 1, true]} />
        <meshStandardMaterial color={DARK_METAL} metalness={1} roughness={0.34} envMapIntensity={1.8} side={THREE.DoubleSide} />
      </mesh>
      {/* Front bezel face */}
      <mesh position={[0, 0, 0.19]}>
        <ringGeometry args={[1.32, 1.52, 256]} />
        <meshPhysicalMaterial color={DARK_METAL} metalness={1} roughness={0.3} clearcoat={0.5} envMapIntensity={2} side={THREE.DoubleSide} />
      </mesh>
      {/* Brass inner lip — the most prominent circle line: high tessellation */}
      <mesh position={[0, 0, 0.2]}>
        <torusGeometry args={[1.32, 0.028, 28, 320]} />
        <meshStandardMaterial color={BRASS} metalness={1} roughness={0.24} envMapIntensity={1.9} />
      </mesh>
      {/* Crisp brass step ring just inside the lip for a sharper edge read */}
      <mesh position={[0, 0, 0.205]}>
        <torusGeometry args={[1.28, 0.012, 20, 320]} />
        <meshStandardMaterial color={BRASS} metalness={1} roughness={0.22} envMapIntensity={2} />
      </mesh>
      {/* Back-plate so opening reveals metal, not the page */}
      <mesh position={[0, 0, -0.26]}>
        <circleGeometry args={[1.34, 200]} />
        <meshStandardMaterial color="#0c0a18" metalness={1} roughness={0.5} envMapIntensity={1.2} />
      </mesh>
    </group>
  );
}

/* ───────────────────────── ASSEMBLY (tilt + bounded sway) ───────────────────────── */
function Assembly({ state }: { state: AuthMachineState }) {
  const sway = useRef<THREE.Group>(null);
  const geom = useMemo(() => makeSectorGeometry(), []);
  useEffect(() => () => geom.dispose(), [geom]);
  useFrame((st, dt) => {
    if (sway.current && !state.reducedMotion) {
      const t = st.clock.elapsedTime;
      // Bounded sway keeps the door near head-on (no accumulating spin).
      sway.current.rotation.y = damp(sway.current.rotation.y, Math.sin(t * 0.3) * 0.07, dt, 2);
      sway.current.rotation.x = damp(sway.current.rotation.x, Math.sin(t * 0.23) * 0.03, dt, 2);
    }
  });
  return (
    <group rotation={[0.16, 0.12, 0]} scale={0.85}>
      <group ref={sway}>
        <Frame />
        <CoreAndBoss state={state} />
        {STREAMS.map((s, i) => (
          <Sector key={s.id} index={i} accent={STREAM_ACCENT[s.id] ?? C_CYAN} state={state} geom={geom} />
        ))}
      </group>
    </group>
  );
}

/* ───────────────────────── LIGHTING (ported, frontal key) ───────────────────────── */
function Lighting({ state }: { state: AuthMachineState }) {
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
    spill.current.intensity = damp(spill.current.intensity, 0.7 + charge * 2.4 + (state.phase === "success" ? 1.5 : 0), dt);
  });
  return (
    <>
      <ambientLight intensity={0.3} />
      {/* Frontal raking key so the machined relief + brass catch light */}
      <directionalLight position={[2.5, 2, 6]} intensity={1.5} color={C_CYAN} />
      <directionalLight position={[-5, 1, 1]} intensity={1} color={C_VIOLET} />
      <directionalLight position={[0, 4, 3]} intensity={0.4} color="#aab6e0" />
      <directionalLight position={[3, -2, 3]} intensity={0.4} color="#ffcaa0" />
      {/* Core spill pushes light out through the opening */}
      <pointLight ref={spill} position={[0, 0, -0.1]} intensity={0.7} color={ACCESS.dormant} distance={8} decay={2} />
    </>
  );
}

/* ───────────────────────── SCENE ───────────────────────── */
function Scene({ state }: { state: AuthMachineState }) {
  const high = state.quality === "high";
  return (
    <>
      <Lighting state={state} />
      <Environment resolution={high ? 256 : 128} frames={1}>
        <Lightformer form="rect" intensity={2.8} color={C_CYAN} position={[3, 2, 4]} scale={[6, 6, 1]} />
        <Lightformer form="rect" intensity={1.7} color={C_VIOLET} position={[-4, -1, 2]} scale={[6, 6, 1]} />
        <Lightformer form="circle" intensity={1.5} color="#ffffff" position={[0, 5, 1]} scale={3} />
        <Lightformer form="rect" intensity={1} color="#ffcaa0" position={[3, -3, 2]} scale={[4, 3, 1]} />
      </Environment>

      <GlowSprite />
      <Assembly state={state} />

      {high && <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={7} blur={2.6} far={4} resolution={1024} color="#04060f" />}

      {high && (
        // Tight bloom: only the brightest cores glow, so every line/edge
        // stays razor-sharp instead of smearing. 8x MSAA for crisp edges.
        <EffectComposer multisampling={8}>
          <Bloom intensity={0.55} luminanceThreshold={0.72} luminanceSmoothing={0.18} radius={0.42} mipmapBlur />
          <Vignette eskil={false} offset={0.24} darkness={0.78} />
        </EffectComposer>
      )}
    </>
  );
}

function ApertureCanvas({ state }: { state: AuthMachineState }) {
  return (
    <Canvas
      dpr={state.quality === "high" ? [1, 2] : [1, 1.75]}
      camera={{ position: [0, 0.1, 6.2], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%", background: "transparent", pointerEvents: "none" }}
    >
      <Scene state={state} />
    </Canvas>
  );
}

const ApertureCanvasLazy = dynamic(() => Promise.resolve({ default: ApertureCanvas }), { ssr: false });

/* Map onto the legacy CoreStage so the EXISTING mobile fallback (LearningCore's
 * CSS emblem) keeps working unchanged. The vault-specific emblem is the
 * responsive batch. */
function coreStageFromState(s: AuthMachineState): CoreStage {
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
 * VaultAperture — drop into the auth scene. `quality` (inside state) picks
 * the renderer: high/medium → R3F vault (lazy, client-only); low → the
 * existing CSS emblem fallback.
 */
export default function VaultAperture({ state }: { state: AuthMachineState }) {
  if (state.quality === "low") return <LearningCore stage={coreStageFromState(state)} quality="low" />;
  return <ApertureCanvasLazy state={state} />;
}
