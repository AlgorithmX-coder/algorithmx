"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  Float,
  Sparkles,
} from "@react-three/drei";
import {
  Bloom,
  EffectComposer,
  ChromaticAberration,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction, KernelSize } from "postprocessing";
import * as THREE from "three";

/**
 * HeroSelectAtmosphere — premium holographic atrium.
 *
 * A live 3D backdrop for the CHOOSE YOUR HERO screen. Built around the
 * @react-three/drei + @react-three/postprocessing stack so we get
 * iridescent / transmissive materials, real bloom on emissive surfaces,
 * environment reflections, and natural Float-driven motion — all the
 * things that separate a "scene with shapes" from a "premium holo UI".
 *
 * No pointer events; sits behind the cards.
 */

const PALETTE = {
  cyan: "#7df0ff",
  cyanBright: "#00e5ff",
  cosmic: "#7c5cff",
  violet: "#a06aff",
  pink: "#ff5fb3",
  pinkLight: "#ff9bcb",
  amber: "#ffd158",
  cream: "#fff7e6",
};

/* ───────────────────────── IRIDESCENT TORUS KNOT ─────────────
 * Centrepiece — a slowly-rotating torus knot rendered with the
 * MeshPhysicalMaterial iridescence channel. The thin-film effect
 * shifts colour with viewing angle, giving the proper holographic
 * "fuel ribbon" look. */
function HoloTorusKnot() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.x += dt * 0.18;
      ref.current.rotation.y += dt * 0.24;
    }
  });
  return (
    <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.6}>
      <mesh ref={ref}>
        <torusKnotGeometry args={[0.85, 0.18, 220, 28, 2, 5]} />
        <meshPhysicalMaterial
          color={PALETTE.cosmic}
          metalness={0.95}
          roughness={0.18}
          iridescence={1}
          iridescenceIOR={1.6}
          iridescenceThicknessRange={[100, 800]}
          clearcoat={1}
          clearcoatRoughness={0.1}
          envMapIntensity={1.2}
          emissive={PALETTE.cosmic}
          emissiveIntensity={0.45}
        />
      </mesh>
    </Float>
  );
}

/* ───────────────────────── HOLO ICOSAHEDRON CRYSTAL ──────────
 * A faceted glass icosahedron with high transmission so the
 * starfield refracts through it. Reads as a sci-fi crystal at
 * the centre of the atrium. */
function HoloCrystal() {
  const ref = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }, dt) => {
    if (ref.current) {
      ref.current.rotation.y -= dt * 0.12;
      ref.current.rotation.x += dt * 0.05;
      const t = clock.getElapsedTime();
      const s = 1 + Math.sin(t * 0.8) * 0.04;
      ref.current.scale.setScalar(s);
    }
    if (haloRef.current) {
      const t = clock.getElapsedTime();
      const s = 1 + Math.sin(t * 0.6) * 0.12;
      haloRef.current.scale.setScalar(s);
    }
  });
  return (
    <>
      {/* Outer halo — additive emissive sphere giving the bloom
          something to latch onto. */}
      <mesh ref={haloRef}>
        <sphereGeometry args={[0.55, 28, 20]} />
        <meshBasicMaterial color={PALETTE.cosmic} transparent opacity={0.28} />
      </mesh>
      {/* The faceted crystal — physical material with transmission so
          the background reads through it. */}
      <mesh ref={ref}>
        <icosahedronGeometry args={[0.42, 0]} />
        <meshPhysicalMaterial
          color={PALETTE.cyanBright}
          metalness={0.2}
          roughness={0.05}
          transmission={0.85}
          thickness={0.5}
          ior={1.5}
          clearcoat={1}
          clearcoatRoughness={0.04}
          envMapIntensity={1.4}
          emissive={PALETTE.cyan}
          emissiveIntensity={0.3}
          flatShading
        />
      </mesh>
    </>
  );
}

/* ───────────────────────── FLOATING HOLO SHAPES ──────────────
 * Chamfered geometric primitives at varied positions, each with an
 * iridescent or transmissive material. Wrapped in <Float> so they
 * bob naturally. */
function HoloFloatingShapes() {
  type ShapeKind = "octa" | "dodeca" | "ico" | "torus" | "tetra";
  const shapes: {
    pos: [number, number, number];
    kind: ShapeKind;
    scale: number;
    color: string;
    accent: string;
    floatSpeed: number;
    floatIntensity: number;
    rotIntensity: number;
  }[] = useMemo(() => [
    { pos: [-2.6,  0.9, -1.2], kind: "octa",   scale: 0.34, color: PALETTE.cyan,    accent: PALETTE.cyanBright, floatSpeed: 1.3, floatIntensity: 0.8, rotIntensity: 0.5 },
    { pos: [ 2.7,  1.1, -0.9], kind: "dodeca", scale: 0.40, color: PALETTE.pink,    accent: PALETTE.pink,       floatSpeed: 1.0, floatIntensity: 0.7, rotIntensity: 0.5 },
    { pos: [-2.3, -1.2, -0.4], kind: "tetra",  scale: 0.38, color: PALETTE.amber,   accent: PALETTE.amber,      floatSpeed: 1.6, floatIntensity: 0.9, rotIntensity: 0.7 },
    { pos: [ 2.4, -1.4, -0.6], kind: "ico",    scale: 0.32, color: PALETTE.violet,  accent: PALETTE.cosmic,     floatSpeed: 1.4, floatIntensity: 0.8, rotIntensity: 0.6 },
    { pos: [ 0.0,  2.3, -1.6], kind: "torus",  scale: 0.40, color: PALETTE.cyan,    accent: PALETTE.cosmic,     floatSpeed: 0.9, floatIntensity: 0.5, rotIntensity: 0.4 },
    { pos: [ 0.0, -2.2, -1.4], kind: "octa",   scale: 0.36, color: PALETTE.pink,    accent: PALETTE.amber,      floatSpeed: 1.1, floatIntensity: 0.6, rotIntensity: 0.5 },
  ], []);

  return (
    <>
      {shapes.map((s, i) => (
        <Float
          key={i}
          speed={s.floatSpeed}
          rotationIntensity={s.rotIntensity}
          floatIntensity={s.floatIntensity}
          position={s.pos}
        >
          <mesh scale={s.scale}>
            {s.kind === "octa"   && <octahedronGeometry args={[1, 0]} />}
            {s.kind === "dodeca" && <dodecahedronGeometry args={[1, 0]} />}
            {s.kind === "ico"    && <icosahedronGeometry args={[1, 0]} />}
            {s.kind === "tetra"  && <tetrahedronGeometry args={[1, 0]} />}
            {s.kind === "torus"  && <torusGeometry args={[0.7, 0.18, 12, 40]} />}
            <meshPhysicalMaterial
              color={s.color}
              metalness={0.85}
              roughness={0.18}
              iridescence={0.85}
              iridescenceIOR={1.5}
              iridescenceThicknessRange={[100, 600]}
              clearcoat={1}
              clearcoatRoughness={0.08}
              envMapIntensity={1.3}
              emissive={s.accent}
              emissiveIntensity={0.4}
              flatShading
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}

/* ───────────────────────── WIRE SHELLS ───────────────────────── */
function WireShells() {
  const sphere = useRef<THREE.LineSegments>(null);
  const ico = useRef<THREE.LineSegments>(null);
  useFrame((_, dt) => {
    if (sphere.current) {
      sphere.current.rotation.y += dt * 0.08;
      sphere.current.rotation.x += dt * 0.03;
    }
    if (ico.current) {
      ico.current.rotation.y -= dt * 0.05;
      ico.current.rotation.z += dt * 0.03;
    }
  });
  const sphereEdges = useMemo(
    () => new THREE.EdgesGeometry(new THREE.SphereGeometry(1.7, 24, 16)),
    [],
  );
  const icoEdges = useMemo(
    () => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(2.3, 1)),
    [],
  );
  return (
    <>
      <lineSegments ref={sphere} geometry={sphereEdges}>
        <lineBasicMaterial color={PALETTE.cyan} transparent opacity={0.32} />
      </lineSegments>
      <lineSegments ref={ico} geometry={icoEdges}>
        <lineBasicMaterial color={PALETTE.violet} transparent opacity={0.25} />
      </lineSegments>
    </>
  );
}

/* ───────────────────────── DEEP STARFIELD ────────────────────── */
function StarField({ count = 320 }: { count?: number }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 5 + Math.random() * 5;
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      arr[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count]);

  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  const ref = useRef<THREE.Points>(null);
  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.y += dt * 0.012;
      ref.current.rotation.x += dt * 0.004;
    }
  });

  return (
    <points ref={ref} geometry={geom}>
      <pointsMaterial color={PALETTE.cream} size={0.035} transparent opacity={0.85} sizeAttenuation />
    </points>
  );
}

/* ───────────────────────── AURORA RIBBONS ────────────────────── */
function AuroraRibbon({
  color,
  radius,
  tilt,
  speed,
  thickness = 0.04,
}: {
  color: string;
  radius: number;
  tilt: [number, number, number];
  speed: number;
  thickness?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const geom = useMemo(() => {
    const path = new THREE.CatmullRomCurve3(
      Array.from({ length: 64 }, (_, i) => {
        const a = (i / 64) * Math.PI * 2;
        const wob = Math.sin(a * 3) * 0.18 + Math.cos(a * 5) * 0.1;
        return new THREE.Vector3(
          Math.cos(a) * (radius + wob),
          Math.sin(a * 2) * 0.25 + wob * 0.4,
          Math.sin(a) * (radius + wob),
        );
      }),
      true,
    );
    return new THREE.TubeGeometry(path, 96, thickness, 8, true);
  }, [radius, thickness]);

  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.y += dt * speed;
      ref.current.rotation.x += dt * speed * 0.4;
    }
  });

  return (
    <mesh ref={ref} rotation={tilt} geometry={geom}>
      <meshBasicMaterial color={color} transparent opacity={0.55} />
    </mesh>
  );
}

/* ───────────────────────── HERO SELECT ATMOSPHERE ────────────── */
export default function HeroSelectAtmosphere() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0.5, 7.4], fov: 48 }}
      style={{ width: "100%", height: "100%", background: "transparent", pointerEvents: "none" }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      {/* Cinematic lighting rig — three coloured point-lights frame the
          central elements with warm/cool tension. */}
      <ambientLight intensity={0.45} />
      <pointLight position={[3, 2, 3]} intensity={1.6} color={PALETTE.cosmic} />
      <pointLight position={[-3, -2, 3]} intensity={1.1} color={PALETTE.pink} />
      <pointLight position={[0, 4, -2]} intensity={0.8} color={PALETTE.amber} />
      <directionalLight position={[5, 6, 5]} intensity={0.4} color={PALETTE.cream} />

      {/* HDR-ish environment map — drives realistic reflections on the
          metallic / iridescent materials. "night" preset is a deep
          starry skybox; cheap to load. */}
      <Environment preset="night" />

      <StarField count={320} />

      {/* Drei Sparkles — fine particle accents drifting through the
          scene, automatically managed instanced points. Two layers
          (close + far) for depth. */}
      <Sparkles
        count={60}
        scale={[8, 6, 6]}
        size={3}
        speed={0.3}
        opacity={0.8}
        color={PALETTE.cyan}
      />
      <Sparkles
        count={40}
        scale={[6, 5, 4]}
        size={5}
        speed={0.2}
        opacity={0.6}
        color={PALETTE.pink}
      />

      {/* Aurora ribbons — slow drifting tube curves */}
      <AuroraRibbon color={PALETTE.cosmic} radius={3.4} tilt={[Math.PI / 2.1, 0, 0]}        speed={0.022} thickness={0.05} />
      <AuroraRibbon color={PALETTE.pink}   radius={3.8} tilt={[Math.PI / 2.6, Math.PI / 5, 0]} speed={-0.016} thickness={0.04} />
      <AuroraRibbon color={PALETTE.cyan}   radius={4.2} tilt={[Math.PI / 3,    -Math.PI / 4, 0]} speed={0.012} thickness={0.035} />

      <WireShells />

      {/* Centre stack — iridescent torus knot orbiting a faceted
          transmissive crystal core. The iridescence channel + bloom
          give the proper holographic look. */}
      <HoloTorusKnot />
      <HoloCrystal />

      {/* Floating premium shapes around the centre */}
      <HoloFloatingShapes />

      {/* Postprocessing stack — bloom is what actually makes emissive
          materials read as "premium holographic" rather than just
          coloured geometry. ChromaticAberration adds a subtle lens
          quality. Vignette darkens corners cinematically. */}
      <EffectComposer multisampling={0}>
        <Bloom
          intensity={0.95}
          luminanceThreshold={0.18}
          luminanceSmoothing={0.55}
          kernelSize={KernelSize.LARGE}
          mipmapBlur
        />
        <ChromaticAberration
          offset={[0.0008, 0.0008]}
          radialModulation={false}
          modulationOffset={0}
          blendFunction={BlendFunction.NORMAL}
        />
        <Vignette
          eskil={false}
          offset={0.2}
          darkness={0.55}
          blendFunction={BlendFunction.NORMAL}
        />
      </EffectComposer>
    </Canvas>
  );
}
