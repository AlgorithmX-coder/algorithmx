"use client";

import { useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, RoundedBox, ContactShadows } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { ACCESS } from "./accessTokens";
import { STREAMS } from "./streams";

/**
 * AlgorithmX Access Machine (Learning Reactor) — the signature auth object.
 *
 * A single coherent machine: a layered energy core sealed inside a machined
 * containment capsule, suspended in a stream ring that carries six physical
 * stream nodes and an illuminated power conduit. Filling the form powers it
 * up, subsystem by subsystem; success cracks the capsule open and reveals
 * the hub. It is a state machine driven by the same booleans the fields
 * validate against:
 *
 *   identityRing  name      · core wakes, conduit ignites, node 1 powers on
 *   commsRing     email     · power flows round the ring, more nodes light
 *   shieldLayer   password   · a containment ring forms, core gains energy
 *   vaultLock     confirm    · all nodes lit, conduit full — system ready
 *   accessGranted submit     · capsule opens, core flares, hub portal reveals
 *
 * Quality tiers: high (desktop — full lighting + bloom + contact shadow),
 * medium (tablet — no post / no shadow, lower DPR), low (mobile — CSS
 * emblem, no R3F). Reduced-motion keeps every state change but drops spin,
 * breathing, travelling pulses and the camera dolly.
 */

export interface CoreStage {
  identityRing?: boolean;
  commsRing?: boolean;
  shieldLayer?: boolean;
  vaultLock?: boolean;
  accessGranted?: boolean;
}

export type CoreQuality = "high" | "medium" | "low";

function progressOf(s: CoreStage): number {
  return [s.identityRing, s.commsRing, s.shieldLayer, s.vaultLock].filter(Boolean).length;
}
/** How many of the six stream nodes are lit for a given stage (sequential). */
export function activeStreamCount(s: CoreStage): number {
  if (s.accessGranted) return 6;
  return Math.round((progressOf(s) / 4) * 6);
}

const C_VIOLET = "#8b6cff";
const C_CHARGED = "#c2acff";
const C_CYAN = "#36dbff";
const METAL = "#0d1226";
const METAL_LIGHT = "#1a2444";

const lerp = THREE.MathUtils.lerp;
const damp = (cur: number, target: number, dt: number, speed = 4) => lerp(cur, target, Math.min(1, dt * speed));

const RING_R = 1.24;

/* ───────────────────────── SOFT GLOW SPRITE ───────────────────────── */
function GlowSprite() {
  const tex = useMemo(() => {
    const size = 256;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d");
    if (ctx) {
      const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      g.addColorStop(0, "rgba(150,118,255,0.55)");
      g.addColorStop(0.4, "rgba(70,90,200,0.16)");
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

/* ───────────────────────── LAYERED ENERGY CORE ───────────────────────── */
function Core({ stage, motion }: { stage: CoreStage; motion: boolean }) {
  const energy = useRef<THREE.Mesh>(null);
  const energyMat = useRef<THREE.MeshStandardMaterial>(null);
  const glassMat = useRef<THREE.MeshPhysicalMaterial>(null);
  const gyro = useRef<THREE.Group>(null);
  const node = useRef<THREE.Mesh>(null);
  const shield = useRef<THREE.Mesh>(null);
  const shieldMat = useRef<THREE.MeshBasicMaterial>(null);
  const colTmp = useMemo(() => new THREE.Color(), []);
  const cyan = useMemo(() => new THREE.Color(C_CYAN), []);
  const pop = useRef(0);
  const prev = useRef(progressOf(stage));
  const progress = progressOf(stage);

  useEffect(() => {
    if (progress > prev.current) pop.current = 1;
    prev.current = progress;
  }, [progress]);

  useFrame((state, dt) => {
    const granted = !!stage.accessGranted;
    colTmp.set(granted ? C_CYAN : stage.vaultLock ? C_CHARGED : C_VIOLET);
    pop.current = damp(pop.current, 0, dt, 3);

    if (energyMat.current) {
      energyMat.current.emissive.lerp(colTmp, Math.min(1, dt * 5));
      energyMat.current.color.lerp(colTmp, Math.min(1, dt * 5));
      energyMat.current.emissiveIntensity = damp(energyMat.current.emissiveIntensity, 0.55 + progress * 0.4 + (granted ? 2 : 0), dt);
    }
    if (energy.current) {
      const breathe = motion ? 1 + Math.sin(state.clock.elapsedTime * 1.6) * 0.045 : 1;
      energy.current.scale.setScalar(damp(energy.current.scale.x, (granted ? 1.25 : 1) * breathe + pop.current * 0.18, dt));
      if (motion) {
        energy.current.rotation.y += dt * (0.3 + progress * 0.12);
        energy.current.rotation.x += dt * 0.12;
      }
    }
    if (gyro.current && motion) {
      gyro.current.rotation.z += dt * (0.25 + progress * 0.15);
      gyro.current.rotation.x += dt * 0.1;
    }
    if (glassMat.current) glassMat.current.opacity = damp(glassMat.current.opacity, granted ? 0.16 : 0.34, dt);
    if (node.current) node.current.scale.setScalar(damp(node.current.scale.x, (granted ? 1.7 : 1) + pop.current * 0.5, dt));

    // Containment ring forms on a strong password, expands on success.
    if (shield.current && shieldMat.current) {
      const on = stage.shieldLayer || granted;
      shieldMat.current.color.lerp(cyan, Math.min(1, dt * 4));
      shieldMat.current.opacity = damp(shieldMat.current.opacity, on ? (granted ? 0.9 : 0.6) : 0, dt);
      const s = granted ? 1.28 : 1;
      shield.current.scale.setScalar(damp(shield.current.scale.x, s, dt));
      if (motion) shield.current.rotation.z += dt * 0.4;
    }
  });

  return (
    <group>
      {/* Translucent containment gem */}
      <mesh>
        <sphereGeometry args={[0.5, 48, 48]} />
        <meshPhysicalMaterial
          ref={glassMat}
          color="#0d1738"
          roughness={0.08}
          metalness={0}
          ior={1.45}
          clearcoat={1}
          clearcoatRoughness={0.15}
          transparent
          opacity={0.34}
          envMapIntensity={1.8}
          depthWrite={false}
        />
      </mesh>

      {/* Internal metal gyro — gives the core dark structure + depth */}
      <group ref={gyro}>
        <mesh rotation={[0.6, 0, 0]}>
          <torusGeometry args={[0.38, 0.022, 12, 64]} />
          <meshStandardMaterial color={METAL_LIGHT} metalness={1} roughness={0.25} envMapIntensity={1.8} />
        </mesh>
        <mesh rotation={[0, 0.5, 1.1]}>
          <torusGeometry args={[0.32, 0.018, 12, 64]} />
          <meshStandardMaterial color={METAL_LIGHT} metalness={1} roughness={0.3} envMapIntensity={1.6} />
        </mesh>
      </group>

      {/* Energy prism + bright pinpoint (bloom) */}
      <mesh ref={energy}>
        <icosahedronGeometry args={[0.27, 0]} />
        <meshStandardMaterial ref={energyMat} color={C_VIOLET} emissive={C_VIOLET} emissiveIntensity={0.55} roughness={0.3} metalness={0.15} toneMapped={false} />
      </mesh>
      <mesh ref={node}>
        <sphereGeometry args={[0.1, 18, 18]} />
        <meshBasicMaterial color="#eaf6ff" toneMapped={false} />
      </mesh>

      {/* Containment ring (security subsystem) */}
      <mesh ref={shield} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.66, 0.02, 10, 80]} />
        <meshBasicMaterial ref={shieldMat} color={C_CYAN} transparent opacity={0} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ───────────────────────── CONTAINMENT CAPSULE CAPS ───────────────────────── */
function Caps({ stage }: { stage: CoreStage }) {
  const top = useRef<THREE.Mesh>(null);
  const bottom = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    const open = stage.accessGranted ? 1 : 0;
    if (top.current) top.current.position.y = damp(top.current.position.y, lerp(0, 0.95, open), dt, 2.4);
    if (bottom.current) bottom.current.position.y = damp(bottom.current.position.y, lerp(0, -0.95, open), dt, 2.4);
  });
  const capMat = (
    <meshStandardMaterial color={METAL} metalness={1} roughness={0.34} envMapIntensity={1.5} />
  );
  return (
    <>
      <mesh ref={top}>
        <sphereGeometry args={[0.56, 40, 20, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
        {capMat}
      </mesh>
      <mesh ref={bottom}>
        <sphereGeometry args={[0.56, 40, 20, 0, Math.PI * 2, Math.PI * 0.6, Math.PI * 0.4]} />
        <meshStandardMaterial color={METAL} metalness={1} roughness={0.34} envMapIntensity={1.5} />
      </mesh>
      {/* Polar trim rings so the caps read as machined, not bald spheres */}
      <mesh position={[0, 0.44, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.3, 0.02, 10, 48]} />
        <meshStandardMaterial color={METAL_LIGHT} metalness={1} roughness={0.28} envMapIntensity={1.7} />
      </mesh>
    </>
  );
}

/* ───────────────────────── ONE STREAM NODE ───────────────────────── */
function StreamNode({ index, color, stage, motion }: { index: number; color: string; stage: CoreStage; motion: boolean }) {
  const grp = useRef<THREE.Group>(null);
  const lensMat = useRef<THREE.MeshStandardMaterial>(null);
  const haloMat = useRef<THREE.MeshBasicMaterial>(null);
  const accent = useMemo(() => new THREE.Color(color), [color]);
  const a = (index / 6) * Math.PI * 2;
  const dir = useMemo(() => new THREE.Vector3(Math.cos(a), 0, Math.sin(a)), [a]);

  useFrame((state, dt) => {
    const granted = !!stage.accessGranted;
    const active = granted || index < activeStreamCount(stage);
    if (grp.current) {
      const out = granted ? 0.12 : active ? 0.04 : 0;
      const breathe = motion && active && !granted ? Math.sin(state.clock.elapsedTime * 2 + index) * 0.01 : 0;
      const r = RING_R + out + breathe;
      grp.current.position.set(dir.x * r, 0, dir.z * r);
    }
    if (lensMat.current) {
      lensMat.current.emissive.lerp(accent, Math.min(1, dt * 4));
      lensMat.current.emissiveIntensity = damp(lensMat.current.emissiveIntensity, active ? (granted ? 2.6 : 1.6) : 0.04, dt);
    }
    if (haloMat.current) {
      haloMat.current.color.lerp(accent, Math.min(1, dt * 4));
      haloMat.current.opacity = damp(haloMat.current.opacity, active ? 0.5 : 0, dt);
    }
  });

  return (
    <group ref={grp} position={[dir.x * RING_R, 0, dir.z * RING_R]} rotation={[0, -a, 0]}>
      {/* Machined pod */}
      <RoundedBox args={[0.34, 0.22, 0.26]} radius={0.05} smoothness={5}>
        <meshStandardMaterial color={METAL} metalness={1} roughness={0.32} envMapIntensity={1.6} />
      </RoundedBox>
      {/* Metal bezel + glass lens facing outward */}
      <mesh position={[0.17, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 0.06, 24]} />
        <meshStandardMaterial color={METAL_LIGHT} metalness={1} roughness={0.26} envMapIntensity={1.8} />
      </mesh>
      <mesh position={[0.205, 0, 0]}>
        <sphereGeometry args={[0.075, 20, 20]} />
        <meshStandardMaterial ref={lensMat} color="#0a1024" emissive={color} emissiveIntensity={0.04} roughness={0.2} metalness={0.2} toneMapped={false} />
      </mesh>
      {/* Soft halo when lit */}
      <mesh position={[0.22, 0, 0]}>
        <circleGeometry args={[0.17, 24]} />
        <meshBasicMaterial ref={haloMat} color={color} transparent opacity={0} toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/* ───────────────────────── TRAVELLING POWER PULSE ───────────────────────── */
function PowerPulse({ stage, motion, offset, speed }: { stage: CoreStage; motion: boolean; offset: number; speed: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame((state, dt) => {
    const p = progressOf(stage);
    const live = motion && p > 0;
    if (ref.current) {
      const a = live ? state.clock.elapsedTime * speed + offset : offset;
      ref.current.position.set(Math.cos(a) * RING_R, 0, Math.sin(a) * RING_R);
    }
    if (mat.current) mat.current.opacity = damp(mat.current.opacity, live ? 0.25 + p * 0.18 : 0, dt);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.05, 12, 12]} />
      <meshBasicMaterial ref={mat} color={C_CYAN} transparent opacity={0} toneMapped={false} />
    </mesh>
  );
}

/* ───────────────────────── STREAM RING + CONDUIT ───────────────────────── */
function StreamRing({ stage, motion }: { stage: CoreStage; motion: boolean }) {
  const conduitMat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame((_, dt) => {
    if (conduitMat.current) {
      const op = 0.12 + (progressOf(stage) / 4) * 0.6 + (stage.accessGranted ? 0.2 : 0);
      conduitMat.current.opacity = damp(conduitMat.current.opacity, op, dt);
    }
  });
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      {/* Structural machined ring */}
      <mesh>
        <torusGeometry args={[RING_R, 0.07, 18, 120]} />
        <meshStandardMaterial color={METAL} metalness={1} roughness={0.3} envMapIntensity={1.6} />
      </mesh>
      {/* Inner trim */}
      <mesh>
        <torusGeometry args={[RING_R - 0.1, 0.02, 10, 120]} />
        <meshStandardMaterial color={METAL_LIGHT} metalness={1} roughness={0.26} envMapIntensity={1.8} />
      </mesh>
      {/* Illuminated power conduit (ramps with progress) */}
      <mesh>
        <torusGeometry args={[RING_R - 0.05, 0.028, 10, 120]} />
        <meshBasicMaterial ref={conduitMat} color={C_CYAN} transparent opacity={0.12} toneMapped={false} />
      </mesh>
      {/* Pulses ride the ring in the same (now-rotated) plane */}
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <PowerPulse stage={stage} motion={motion} offset={0} speed={0.9} />
        <PowerPulse stage={stage} motion={motion} offset={Math.PI} speed={0.9} />
      </group>
    </group>
  );
}

/* ───────────────────────── HUB PORTAL (success) ───────────────────────── */
function HubPortal({ stage, motion }: { stage: CoreStage; motion: boolean }) {
  const disc = useRef<THREE.Mesh>(null);
  const discMat = useRef<THREE.MeshBasicMaterial>(null);
  const cardMats = useRef<THREE.MeshBasicMaterial[]>([]);
  const cardRefs = useRef<THREE.Object3D[]>([]);
  const t = useRef(0);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, dt) => {
    const goal = stage.accessGranted ? 1 : 0;
    t.current = motion ? damp(t.current, goal, dt, 2.4) : goal;
    const v = t.current;
    if (discMat.current) discMat.current.opacity = v * 0.55;
    if (disc.current) {
      disc.current.scale.setScalar(lerp(0.2, 1, v));
      if (motion) disc.current.rotation.z += dt * 0.25;
    }
    cardRefs.current.forEach((c, i) => {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
      tmp.set(Math.cos(a) * 0.6 * v, Math.sin(a) * 0.6 * v, 0.04);
      c.position.copy(tmp);
      c.scale.setScalar(v);
      c.rotation.z = a + Math.PI / 2;
    });
    cardMats.current.forEach((m) => m && (m.opacity = Math.max(0, v - 0.3) * 1.4));
  });

  return (
    <group position={[0, 0, 0.15]}>
      <mesh ref={disc}>
        <circleGeometry args={[0.62, 48]} />
        <meshBasicMaterial ref={discMat} color={C_CYAN} transparent opacity={0} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      {STREAMS.map((s, i) => (
        <mesh
          key={s.id}
          ref={(el) => {
            if (el) cardRefs.current[i] = el;
          }}
        >
          <planeGeometry args={[0.22, 0.15]} />
          <meshBasicMaterial
            ref={(el) => {
              if (el) cardMats.current[i] = el as THREE.MeshBasicMaterial;
            }}
            color={s.color}
            transparent
            opacity={0}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ───────────────────────── MACHINE ASSEMBLY ───────────────────────── */
function Machine({ stage, motion }: { stage: CoreStage; motion: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (group.current && motion) group.current.rotation.y += dt * 0.06;
  });
  return (
    <group rotation={[0.34, 0, 0]} scale={0.92}>
      {/* Slow yaw lives on an inner group so the cinematic tilt stays put */}
      <group ref={group}>
        <StreamRing stage={stage} motion={motion} />
        {STREAMS.map((s, i) => (
          <StreamNode key={s.id} index={i} color={s.color} stage={stage} motion={motion} />
        ))}
        <Core stage={stage} motion={motion} />
        <Caps stage={stage} />
      </group>
      <HubPortal stage={stage} motion={motion} />
    </group>
  );
}

/* ───────────────────────── LIGHTING ───────────────────────── */
function Lighting({ stage }: { stage: CoreStage }) {
  const spill = useRef<THREE.PointLight>(null);
  const col = useMemo(() => new THREE.Color(C_VIOLET), []);
  const tmp = useMemo(() => new THREE.Color(), []);
  useFrame((_, dt) => {
    if (!spill.current) return;
    tmp.set(stage.accessGranted ? C_CYAN : stage.vaultLock ? C_CHARGED : C_VIOLET);
    col.lerp(tmp, Math.min(1, dt * 4));
    spill.current.color.copy(col);
    spill.current.intensity = damp(spill.current.intensity, 1 + progressOf(stage) * 0.4 + (stage.accessGranted ? 2.2 : 0), dt);
  });
  return (
    <>
      <ambientLight intensity={0.32} />
      <directionalLight position={[5, 3, 4]} intensity={1.4} color={C_CYAN} />
      <directionalLight position={[-5, 1, -2]} intensity={1} color={C_VIOLET} />
      <directionalLight position={[0, 4, 3]} intensity={0.4} color="#aab6e0" />
      <pointLight ref={spill} position={[0, 0, 0.4]} intensity={1} color={C_VIOLET} distance={8} decay={2} />
    </>
  );
}

/* ───────────────────────── CAMERA RIG ───────────────────────── */
function Rig({ stage, motion }: { stage: CoreStage; motion: boolean }) {
  useFrame((state, dt) => {
    const cam = state.camera;
    const tz = motion && stage.accessGranted ? 5.1 : 5.9;
    cam.position.z = damp(cam.position.z, tz, dt, 1.6);
    cam.position.y = damp(cam.position.y, 0.2, dt, 1.6);
    cam.lookAt(0, 0, 0);
  });
  return null;
}

/* ───────────────────────── SCENE ───────────────────────── */
function Scene({ stage, quality }: { stage: CoreStage; quality: CoreQuality }) {
  const reduced = !!useReducedMotion();
  const motion = !reduced;
  return (
    <>
      <Lighting stage={stage} />
      <Environment resolution={quality === "high" ? 256 : 128} frames={1}>
        <Lightformer form="rect" intensity={2.8} color={C_CYAN} position={[4, 2, 3]} scale={[6, 6, 1]} />
        <Lightformer form="rect" intensity={1.7} color={C_VIOLET} position={[-4, -1, 2]} scale={[6, 6, 1]} />
        <Lightformer form="circle" intensity={1.5} color="#ffffff" position={[0, 5, -3]} scale={3} />
        <Lightformer form="rect" intensity={0.8} color="#9fb4e0" position={[0, -4, 2]} scale={[5, 2, 1]} />
      </Environment>

      <GlowSprite />
      <Machine stage={stage} motion={motion} />

      {quality === "high" && (
        <ContactShadows position={[0, -1.65, 0]} opacity={0.4} scale={7} blur={2.8} far={4} resolution={512} color="#04060f" />
      )}

      <Rig stage={stage} motion={motion} />

      {quality === "high" && (
        // Mirrors the app's proven VaultScene composer (multisampling + mipmap bloom).
        <EffectComposer multisampling={4}>
          <Bloom intensity={0.78} luminanceThreshold={0.5} luminanceSmoothing={0.3} mipmapBlur />
          <Vignette eskil={false} offset={0.24} darkness={0.76} />
        </EffectComposer>
      )}
    </>
  );
}

function CoreCanvas({ stage, quality }: { stage: CoreStage; quality: CoreQuality }) {
  return (
    <Canvas
      dpr={quality === "high" ? [1, 1.75] : [1, 1.5]}
      camera={{ position: [0, 0.2, 5.9], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%", background: "transparent", pointerEvents: "none" }}
    >
      <Scene stage={stage} quality={quality} />
    </Canvas>
  );
}

const CoreCanvasLazy = dynamic(() => Promise.resolve({ default: CoreCanvas }), { ssr: false });

/* ───────────────────────── CSS EMBLEM (mobile / low) ───────────────────────── */
function CoreEmblem({ stage }: { stage: CoreStage }) {
  const reduced = !!useReducedMotion();
  const granted = !!stage.accessGranted;
  const active = activeStreamCount(stage);
  const coreColor = granted ? ACCESS.cyan : stage.vaultLock ? C_CHARGED : ACCESS.violet;

  return (
    <div
      aria-hidden
      style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", opacity: 0.55 }}
    >
      <div style={{ position: "relative", width: 250, height: 250, transform: "rotateX(24deg)" }}>
        {/* Atmospheric glow */}
        <div
          style={{
            position: "absolute",
            inset: -26,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${coreColor}33 0%, transparent 60%)`,
            filter: "blur(22px)",
            transition: "background 600ms ease",
          }}
        />
        {/* Stream ring (perspective ellipse) */}
        <div
          style={{
            position: "absolute",
            inset: "30% 6%",
            borderRadius: "50%",
            border: `2px solid ${ACCESS.line}`,
            boxShadow: `0 0 18px ${coreColor}22`,
            animation: reduced ? undefined : "emblemSpin 28s linear infinite",
          }}
        />
        {/* Six stream nodes on the ring */}
        {STREAMS.map((s, i) => {
          const a = (i / 6) * Math.PI * 2;
          const on = granted || i < active;
          const rx = 110;
          const ry = 44;
          return (
            <span
              key={s.id}
              style={{
                position: "absolute",
                top: `calc(50% + ${Math.sin(a) * ry}px)`,
                left: `calc(50% + ${Math.cos(a) * rx}px)`,
                width: on ? 14 : 9,
                height: on ? 14 : 9,
                marginLeft: on ? -7 : -4.5,
                marginTop: on ? -7 : -4.5,
                borderRadius: "50%",
                background: on ? s.color : "#1a2347",
                border: `1px solid ${on ? s.color : "rgba(150,168,224,0.2)"}`,
                boxShadow: on ? `0 0 12px ${s.color}` : "none",
                transition: "all 500ms ease",
              }}
            />
          );
        })}
        {/* Capsule caps */}
        {[-1, 1].map((d) => (
          <span
            key={d}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 58,
              height: 30,
              marginLeft: -29,
              marginTop: d === -1 ? -44 : 14,
              borderRadius: d === -1 ? "30px 30px 8px 8px" : "8px 8px 30px 30px",
              background: `linear-gradient(${d === -1 ? 180 : 0}deg, #161e3c, #0b1228)`,
              border: "1px solid rgba(150,168,224,0.18)",
              transform: `translateY(${granted ? d * 22 : 0}px)`,
              transition: "transform 600ms cubic-bezier(0.4,0,0.2,1)",
            }}
          />
        ))}
        {/* Gem core */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: granted ? 56 : 46,
            height: granted ? 56 : 46,
            marginLeft: granted ? -28 : -23,
            marginTop: granted ? -28 : -23,
            borderRadius: 12,
            transform: "rotate(45deg)",
            background: `linear-gradient(135deg, ${coreColor}, ${coreColor}55)`,
            border: `1px solid ${coreColor}`,
            boxShadow: `0 0 30px ${coreColor}aa, inset 0 0 16px ${coreColor}66`,
            transition: "all 500ms ease",
            animation: reduced ? undefined : "emblemPulse 3.2s ease-in-out infinite",
          }}
        />
      </div>
      <style>{`
        @keyframes emblemPulse { 0%,100% { filter: brightness(1); } 50% { filter: brightness(1.3); } }
        @keyframes emblemSpin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

/**
 * LearningCore — drop into the auth scene. `quality` selects renderer:
 *   high/medium → R3F Access Machine (lazy, client-only)
 *   low         → CSS emblem (no R3F; mobile / reduced-data friendly)
 */
export default function LearningCore({ stage, quality }: { stage: CoreStage; quality: CoreQuality }) {
  if (quality === "low") return <CoreEmblem stage={stage} />;
  return <CoreCanvasLazy stage={stage} quality={quality} />;
}
