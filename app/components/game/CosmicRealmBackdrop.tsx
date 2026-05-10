"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * CosmicRealmBackdrop - sits BEHIND Arena3D in the boss-battle stack.
 *
 * Adds an "other realm" feeling beyond the cyber-arena: deep starfield,
 * a huge distant nebula sphere, drifting aurora ribbons, and slowly
 * rotating cosmic crystal shapes at varied depths. The Arena3D
 * renderer is alpha-transparent so this layer shows through.
 *
 * No pointer events; no game-state hooks. Pure ambient atmosphere.
 */

const PALETTE = {
  cosmic: "#7c5cff",
  violet: "#a06aff",
  pink: "#ff5fb3",
  pinkLight: "#ff9bcb",
  amber: "#ffd158",
  coral: "#ff7a59",
  cyan: "#7df0ff",
  cream: "#fff7e6",
};

/* ───────────────────────── DEEP STARFIELD ─────────────────── */
function DeepStars({ count = 380 }: { count?: number }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Wide shell at varied radius for parallax depth.
      const r = 8 + Math.random() * 18;
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
      <pointsMaterial color={PALETTE.cream} size={0.045} transparent opacity={0.85} sizeAttenuation />
    </points>
  );
}

/* ───────────────────────── COSMIC DUST CLOUD ──────────────── */
function CosmicDust({ count = 110 }: { count?: number }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Closer-in dust for depth between camera and stars.
      const r = 4 + Math.random() * 6;
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
      ref.current.rotation.y -= dt * 0.025;
      ref.current.rotation.z += dt * 0.012;
    }
  });
  return (
    <points ref={ref} geometry={geom}>
      <pointsMaterial color={PALETTE.pink} size={0.07} transparent opacity={0.55} sizeAttenuation />
    </points>
  );
}

/* ───────────────────────── DISTANT NEBULA SPHERE ──────────── */
// A huge soft glowing sphere far behind everything, simulating a
// nebula / distant celestial body. Uses an additive material so it
// blends as light rather than a solid object.
function DistantNebula({ position, color, radius }: {
  position: [number, number, number];
  color: string;
  radius: number;
}) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[radius, 32, 24]} />
      <meshBasicMaterial color={color} transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
}

/* ───────────────────────── AURORA RIBBONS ─────────────────── */
function AuroraRibbon({
  color,
  radius,
  tilt,
  speed,
  thickness = 0.06,
  position = [0, 0, 0],
}: {
  color: string;
  radius: number;
  tilt: [number, number, number];
  speed: number;
  thickness?: number;
  position?: [number, number, number];
}) {
  const ref = useRef<THREE.Mesh>(null);
  const geom = useMemo(() => {
    const path = new THREE.CatmullRomCurve3(
      Array.from({ length: 80 }, (_, i) => {
        const a = (i / 80) * Math.PI * 2;
        const wob = Math.sin(a * 3) * 0.22 + Math.cos(a * 5) * 0.14;
        return new THREE.Vector3(
          Math.cos(a) * (radius + wob),
          Math.sin(a * 2) * 0.35 + wob * 0.5,
          Math.sin(a) * (radius + wob),
        );
      }),
      true,
    );
    return new THREE.TubeGeometry(path, 128, thickness, 10, true);
  }, [radius, thickness]);

  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.y += dt * speed;
      ref.current.rotation.x += dt * speed * 0.4;
    }
  });

  return (
    <mesh ref={ref} rotation={tilt} position={position} geometry={geom}>
      <meshBasicMaterial color={color} transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
}

/* ───────────────────────── FLOATING COSMIC CRYSTALS ───────── */
// Geometric primitives at varied depths slowly rotating. Read as
// "shards of an alien realm" suspended in deep space behind the arena.
function FloatingCrystals() {
  type ShapeKind = "octa" | "dodeca" | "ico" | "tetra";
  const shapes: {
    pos: [number, number, number];
    kind: ShapeKind;
    scale: number;
    color: string;
    speedY: number;
    speedX: number;
  }[] = useMemo(() => [
    { pos: [-7,  3, -10], kind: "octa",   scale: 0.85, color: PALETTE.cosmic, speedY: 0.18, speedX: 0.08 },
    { pos: [ 8,  2, -12], kind: "dodeca", scale: 1.0,  color: PALETTE.pink,   speedY: -0.14, speedX: 0.05 },
    { pos: [-9, -3, -14], kind: "ico",    scale: 1.1,  color: PALETTE.amber,  speedY: 0.12, speedX: -0.06 },
    { pos: [ 7, -4, -11], kind: "tetra",  scale: 0.9,  color: PALETTE.violet, speedY: 0.22, speedX: 0.10 },
    { pos: [ 0, -6, -16], kind: "dodeca", scale: 1.2,  color: PALETTE.pink,   speedY: 0.10, speedX: -0.04 },
  ], []);

  return (
    <>
      {shapes.map((s, i) => (
        <CrystalShape key={i} {...s} />
      ))}
    </>
  );
}

function CrystalShape({
  pos,
  kind,
  scale,
  color,
  speedY,
  speedX,
}: {
  pos: [number, number, number];
  kind: "octa" | "dodeca" | "ico" | "tetra";
  scale: number;
  color: string;
  speedY: number;
  speedX: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }, dt) => {
    if (ref.current) {
      ref.current.rotation.y += dt * speedY;
      ref.current.rotation.x += dt * speedX;
      // Gentle vertical bob from a sin curve so each crystal drifts
      // in space without the same period.
      const t = clock.getElapsedTime();
      ref.current.position.y = pos[1] + Math.sin(t * 0.3 + pos[0]) * 0.4;
    }
  });
  return (
    <mesh ref={ref} position={pos} scale={scale}>
      {kind === "octa"   && <octahedronGeometry args={[1, 0]} />}
      {kind === "dodeca" && <dodecahedronGeometry args={[1, 0]} />}
      {kind === "ico"    && <icosahedronGeometry args={[1, 0]} />}
      {kind === "tetra"  && <tetrahedronGeometry args={[1, 0]} />}
      <meshBasicMaterial
        color={color}
        wireframe
        transparent
        opacity={0.42}
      />
    </mesh>
  );
}

/* ───────────────────────── ENERGY PORTAL RING ─────────────── */
// A massive distant ring far behind the action, rotating slowly.
// Reads as "the gateway to the realm" - implies the kid is fighting
// in front of something cosmically huge.
function EnergyPortalRing() {
  const inner = useRef<THREE.LineLoop>(null);
  const outer = useRef<THREE.LineLoop>(null);
  const innerGeom = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(a) * 6, Math.sin(a) * 6, 0));
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);
  const outerGeom = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(a) * 7.2, Math.sin(a) * 7.2, 0));
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  useFrame((_, dt) => {
    if (inner.current) inner.current.rotation.z += dt * 0.06;
    if (outer.current) outer.current.rotation.z -= dt * 0.04;
  });

  return (
    <group position={[0, 1, -22]}>
      <lineLoop ref={inner} geometry={innerGeom}>
        <lineBasicMaterial color={PALETTE.cosmic} transparent opacity={0.45} />
      </lineLoop>
      <lineLoop ref={outer} geometry={outerGeom}>
        <lineBasicMaterial color={PALETTE.pink} transparent opacity={0.32} />
      </lineLoop>
    </group>
  );
}

/* ───────────────────────── COSMIC REALM BACKDROP ──────────── */
export default function CosmicRealmBackdrop() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 8], fov: 60 }}
      style={{ width: "100%", height: "100%", background: "transparent", pointerEvents: "none" }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      {/* Distant celestial bodies - three soft glowing nebula spheres
          at varied positions and colours for the "other realm" depth. */}
      <DistantNebula position={[-12,  4, -28]} color={PALETTE.cosmic} radius={9} />
      <DistantNebula position={[ 14,  6, -32]} color={PALETTE.pink}   radius={10} />
      <DistantNebula position={[ 0,  -8, -34]} color={PALETTE.amber}  radius={8} />

      {/* Energy portal ring deep behind the action - reads as a
          gateway to the realm. */}
      <EnergyPortalRing />

      <DeepStars count={720} />
      <CosmicDust count={240} />

      {/* Aurora ribbons drifting through space at different planes -
          two is enough for parallax without overloading the GPU. */}
      <AuroraRibbon color={PALETTE.cosmic} radius={10} tilt={[Math.PI / 2.1, 0, 0]}            speed={0.018} thickness={0.07} position={[0, 0, -8]} />
      <AuroraRibbon color={PALETTE.pink}   radius={11} tilt={[Math.PI / 2.6, Math.PI / 5, 0]}  speed={-0.014} thickness={0.06} position={[0, 1, -10]} />

      {/* Floating cosmic crystal shards at varied depths */}
      <FloatingCrystals />
    </Canvas>
  );
}
