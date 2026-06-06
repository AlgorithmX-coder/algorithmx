"use client";

import { useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, Instances, Instance } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { ACCESS, STREAM_ACCENT } from "./accessTokens";
import { STREAMS } from "./streams";
import LearningCore, { type CoreStage } from "./LearningCore";

/**
 * Living Hub — the AlgorithmX auth centrepiece (Batch 3a: the SCENE + the
 * choreography, with PLACEHOLDER worlds). The real world art replaces the
 * placeholders next; polished success cinematics + the responsive mobile
 * treatment are later batches.
 *
 * The centrepiece is no longer an object — it's a deep premium void you
 * bring to life. Six "worlds" (the streams) sleep far off in a staggered
 * constellation; each valid field wakes one — it ignites in its accent,
 * drifts in, and throws an energy thread to the centre. Armed draws them
 * into formation; submit converges energy inward; success flies the camera
 * IN through the formation to a bright central hub.
 *
 * Rig INFRASTRUCTURE (Canvas, DPR caps, baked Lightformer Environment,
 * EffectComposer/Bloom/Vignette, quality tiers, dynamic ssr:false, asset
 * disposal, the AuthMachineState plumbing + low-tier LearningCore-emblem
 * fallback) is reused from VaultAperture/StreamOrrery; the composition is
 * new (a scene with depth + a moving camera, not a centred object).
 */

export type AuthMachinePhase = "idle" | "armed" | "submitting" | "success" | "error";

export interface AuthMachineState {
  modulesOnline: number; // 0–6: worlds awake
  focus: "name" | "email" | "password" | "confirm" | null;
  phase: AuthMachinePhase;
  reducedMotion: boolean;
  quality: "high" | "medium" | "low";
}

const C_VIOLET = "#8b6cff";
const C_CYAN = "#36dbff";
const HUB = new THREE.Vector3(0, 0, -0.5);

const lerp = THREE.MathUtils.lerp;
const damp = (cur: number, target: number, dt: number, speed = 4) => lerp(cur, target, Math.min(1, dt * speed));

function chargeOf(s: AuthMachineState): number {
  return Math.min(1, s.modulesOnline / 6);
}

type ColoredObject = THREE.Object3D & { color: THREE.Color };

/** Deterministic PRNG (mulberry32) so dust positions are pure + stable. */
function makeDust(count: number): Float32Array {
  let seed = 0x9e3779b9;
  const rand = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    arr[i * 3] = (rand() - 0.5) * 16;
    arr[i * 3 + 1] = (rand() - 0.5) * 10;
    arr[i * 3 + 2] = -rand() * 14 + 2;
  }
  return arr;
}

interface WorldDef {
  dormant: THREE.Vector3;
  formation: THREE.Vector3;
  converge: THREE.Vector3;
  dim: THREE.Color;
  bright: THREE.Color;
}

function buildWorlds(): WorldDef[] {
  return STREAMS.map((s, i) => {
    const a = (i / 6) * Math.PI * 2;
    const accent = new THREE.Color(STREAM_ACCENT[s.id] ?? C_CYAN);
    return {
      // Staggered in depth (i % 3) so it's a real constellation, not a row.
      dormant: new THREE.Vector3(Math.cos(a) * 6, Math.sin(a * 0.7) * 3 + (i % 2 ? 1.2 : -1.2), -7 - (i % 3) * 2.2),
      formation: new THREE.Vector3(Math.cos(a) * (2.2 + (i % 3) * 0.35), Math.sin(a) * (1.5 + (i % 2) * 0.5), -1.3 - (i % 3) * 0.7),
      converge: new THREE.Vector3(Math.cos(a) * 0.28, Math.sin(a) * 0.28, -0.5),
      dim: accent.clone().multiplyScalar(0.12),
      bright: accent.clone().multiplyScalar(1.5),
    };
  });
}

/* ───────────────────────── SOFT GLOW SPRITE (ported) ───────────────────────── */
function useGlowTexture(inner: string, mid: string) {
  const tex = useMemo(() => {
    const size = 256;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d");
    if (ctx) {
      const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      g.addColorStop(0, inner);
      g.addColorStop(0.4, mid);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
    }
    return new THREE.CanvasTexture(c);
  }, [inner, mid]);
  useEffect(() => () => tex.dispose(), [tex]);
  return tex;
}

function GlowSprite({ z, scale, inner, mid }: { z: number; scale: number; inner: string; mid: string }) {
  const tex = useGlowTexture(inner, mid);
  return (
    <mesh position={[0, 0, z]}>
      <planeGeometry args={[scale, scale]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </mesh>
  );
}

/* ───────────────────────── DRIFTING DUST ───────────────────────── */
function Dust({ count, motion }: { count: number; motion: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => makeDust(count), [count]);
  useFrame((_, dt) => {
    if (ref.current && motion) {
      ref.current.rotation.y += dt * 0.01;
      ref.current.rotation.z += dt * 0.004;
    }
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color="#aeb8e0" transparent opacity={0.45} sizeAttenuation depthWrite={false} toneMapped={false} />
    </points>
  );
}

/* ───────────────────────── CENTRAL HUB ───────────────────────── */
function Hub({ state }: { state: AuthMachineState }) {
  const core = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const dormant = useMemo(() => new THREE.Color(ACCESS.dormant), []);
  const charged = useMemo(() => new THREE.Color(ACCESS.charged), []);
  const warn = useMemo(() => new THREE.Color(ACCESS.warn), []);
  const target = useMemo(() => new THREE.Color(), []);
  useFrame((st, dt) => {
    const charge = chargeOf(state);
    const success = state.phase === "success";
    target.copy(dormant).lerp(charged, charge);
    if (state.phase === "error") target.copy(warn);
    if (mat.current) mat.current.color.lerp(target, Math.min(1, dt * 4));
    if (core.current) {
      const motion = !state.reducedMotion;
      const breathe = motion ? 1 + Math.sin(st.clock.elapsedTime * 1.5) * 0.06 : 1;
      const s = (0.12 + charge * 0.16 + (success ? 0.5 : 0)) * breathe;
      core.current.scale.setScalar(damp(core.current.scale.x, s, dt));
    }
  });
  return (
    <group position={[HUB.x, HUB.y, HUB.z]}>
      <mesh ref={core}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial ref={mat} color={ACCESS.dormant} toneMapped={false} />
      </mesh>
      <GlowSprite z={0} scale={2.6} inner="rgba(120,150,255,0.5)" mid="rgba(60,90,200,0.14)" />
    </group>
  );
}

/* ───────────────────────── CONSTELLATION (worlds + threads) ───────────────────────── */
function Constellation({ state }: { state: AuthMachineState }) {
  const worlds = useMemo(() => buildWorlds(), []);
  const inst = useRef<ColoredObject[]>([]);
  const lines = useRef<THREE.LineSegments[]>([]);
  const cur = useMemo(() => worlds.map((w) => w.dormant.clone()), [worlds]);
  const linePos = useMemo(() => worlds.map(() => new Float32Array(6)), [worlds]);
  const tmpCol = useMemo(() => new THREE.Color(), []);
  const warn = useMemo(() => new THREE.Color(ACCESS.warn), []);
  const tmpTarget = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, dt) => {
    const motion = !state.reducedMotion;
    const k = Math.min(1, dt * (motion ? 3 : 12));
    const success = state.phase === "success";
    const submitting = state.phase === "submitting";

    worlds.forEach((w, i) => {
      const awake = success || i < state.modulesOnline;
      const focused = state.focus !== null && i === state.modulesOnline && !success;
      const erroring = state.phase === "error" && i === state.modulesOnline;

      // Target position.
      if (success) tmpTarget.copy(w.converge);
      else if (awake) {
        tmpTarget.copy(w.formation);
        if (submitting) tmpTarget.lerp(HUB, 0.4); // energy converges inward
      } else tmpTarget.copy(w.dormant);
      if (focused) tmpTarget.lerp(w.formation, 0.4); // pull the next world a little
      if (erroring) tmpTarget.z -= 1.2; // flicker + recede

      const el = inst.current[i];
      if (el) {
        cur[i].lerp(tmpTarget, k);
        el.position.copy(cur[i]);
        // On success the worlds shrink as they dissolve into the hub.
        const sc = success ? 0.25 : awake ? (focused ? 1.25 : 1.05) : 0.55;
        el.scale.setScalar(damp(el.scale.x, sc, dt));
        tmpCol.copy(awake ? w.bright : w.dim);
        if (erroring) tmpCol.copy(warn);
        el.color.lerp(tmpCol, k);
      }

      // Energy thread world → hub.
      const lp = linePos[i];
      lp[0] = cur[i].x; lp[1] = cur[i].y; lp[2] = cur[i].z;
      lp[3] = HUB.x; lp[4] = HUB.y; lp[5] = HUB.z;
      const line = lines.current[i];
      if (line) {
        const attr = (line.geometry as THREE.BufferGeometry).attributes.position as THREE.BufferAttribute;
        attr.needsUpdate = true;
        const lm = line.material as THREE.LineBasicMaterial;
        lm.opacity = damp(lm.opacity, awake ? (submitting || success ? 0.55 : 0.32) : 0, dt);
        lm.color.lerp(awake ? w.bright : w.dim, k);
      }
    });
  });

  return (
    <group>
      {/* Placeholder worlds — faceted shards, instanced (real art next batch) */}
      <Instances limit={6} range={6} frustumCulled={false}>
        <icosahedronGeometry args={[0.4, 0]} />
        <meshBasicMaterial toneMapped={false} />
        {worlds.map((w, i) => (
          <Instance
            key={STREAMS[i].id}
            ref={(el: THREE.Object3D | null) => {
              if (el) inst.current[i] = el as ColoredObject;
            }}
            color={w.dim}
          />
        ))}
      </Instances>

      {/* Energy threads */}
      {worlds.map((w, i) => (
        <lineSegments
          key={STREAMS[i].id}
          ref={(el: THREE.LineSegments | null) => {
            if (el) lines.current[i] = el;
          }}
        >
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[linePos[i], 3]} />
          </bufferGeometry>
          <lineBasicMaterial color={w.dim} transparent opacity={0} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
        </lineSegments>
      ))}
    </group>
  );
}

/* ───────────────────────── CAMERA RIG (drift + fly-in) ───────────────────────── */
function Rig({ state }: { state: AuthMachineState }) {
  useFrame((st, dt) => {
    const cam = st.camera;
    const motion = !state.reducedMotion;
    const success = state.phase === "success";
    const submitting = state.phase === "submitting";
    // Reduced motion: no dolly — success becomes a quick fade-to-hub (the
    // hub brightens + worlds converge), camera holds.
    const targetZ = state.reducedMotion ? 7 : success ? 0.8 : submitting ? 6.2 : 7;
    const dx = motion && !success ? Math.sin(st.clock.elapsedTime * 0.1) * 0.4 : 0;
    const dy = (motion && !success ? Math.sin(st.clock.elapsedTime * 0.07) * 0.2 : 0) + 0.2;
    cam.position.z = damp(cam.position.z, targetZ, dt, success ? 2.2 : 1.4);
    cam.position.x = damp(cam.position.x, dx, dt, 1.4);
    cam.position.y = damp(cam.position.y, dy, dt, 1.4);
    cam.lookAt(HUB.x, HUB.y, HUB.z);
  });
  return null;
}

/* ───────────────────────── SCENE ───────────────────────── */
function Scene({ state }: { state: AuthMachineState }) {
  const high = state.quality === "high";
  const motion = !state.reducedMotion;
  const dustCount = high ? 520 : 260;
  return (
    <>
      <fogExp2 attach="fog" args={["#08060e", 0.045]} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[4, 3, 4]} intensity={0.8} color={C_CYAN} />
      <directionalLight position={[-4, -1, 2]} intensity={0.6} color={C_VIOLET} />
      <Environment resolution={high ? 256 : 128} frames={1}>
        <Lightformer form="rect" intensity={2} color={C_CYAN} position={[4, 2, 3]} scale={[6, 6, 1]} />
        <Lightformer form="rect" intensity={1.4} color={C_VIOLET} position={[-4, -1, 2]} scale={[6, 6, 1]} />
        <Lightformer form="circle" intensity={1.2} color="#ffffff" position={[0, 5, 1]} scale={3} />
      </Environment>

      {/* Atmosphere — soft volumetric-ish blooms far back */}
      <GlowSprite z={-9} scale={14} inner="rgba(91,63,214,0.16)" mid="rgba(40,30,90,0.06)" />
      <GlowSprite z={-11} scale={18} inner="rgba(10,90,150,0.1)" mid="rgba(10,40,80,0.04)" />

      <Dust count={dustCount} motion={motion} />
      <Constellation state={state} />
      <Hub state={state} />
      <Rig state={state} />

      {high && (
        // Ported from the app's proven VaultScene/LearningCore composer.
        <EffectComposer multisampling={4}>
          <Bloom intensity={0.9} luminanceThreshold={0.45} luminanceSmoothing={0.3} mipmapBlur />
          <Vignette eskil={false} offset={0.22} darkness={0.8} />
        </EffectComposer>
      )}
    </>
  );
}

function HubCanvas({ state }: { state: AuthMachineState }) {
  return (
    <Canvas
      dpr={state.quality === "high" ? [1, 1.75] : [1, 1.5]}
      camera={{ position: [0, 0.2, 7], fov: 46 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%", background: "transparent", pointerEvents: "none" }}
    >
      <Scene state={state} />
    </Canvas>
  );
}

const HubCanvasLazy = dynamic(() => Promise.resolve({ default: HubCanvas }), { ssr: false });

/* Low-tier mobile fallback maps onto the legacy CoreStage so LearningCore's
 * CSS emblem keeps working unchanged. The Living-Hub mobile treatment is a
 * later batch. */
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
 * LivingHub — drop into the auth scene. `quality` (inside state) picks the
 * renderer: high/medium → R3F scene (lazy, client-only); low → the existing
 * CSS emblem fallback.
 */
export default function LivingHub({ state }: { state: AuthMachineState }) {
  if (state.quality === "low") return <LearningCore stage={coreStageFromState(state)} quality="low" />;
  return <HubCanvasLazy state={state} />;
}
