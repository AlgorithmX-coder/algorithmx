"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * HeroSelectAtmosphere - a calmer, more contemplative cousin of
 * BossEnergyCore. Sits behind the CHOOSE YOUR HERO screen as a live
 * 3D backdrop. Sets a "preparation" mood: slower rotation, deeper
 * starfield, drifting auroras, paler palette than the combat reactor.
 *
 * No pointer events; drops behind the UI.
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

/* ───────────────────────── CRYSTAL CORE - calmer ─────────────── */
function CrystalCore() {
  const ref = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);
  useFrame(({ clock }, dt) => {
    if (ref.current) {
      ref.current.rotation.y += dt * 0.18;
      ref.current.rotation.x += dt * 0.08;
      const t = clock.getElapsedTime();
      const s = 1 + Math.sin(t * 1.0) * 0.05;
      ref.current.scale.setScalar(s);
    }
    if (halo.current) {
      const t = clock.getElapsedTime();
      const s = 1 + Math.sin(t * 0.7) * 0.13;
      halo.current.scale.setScalar(s);
    }
  });
  return (
    <>
      <mesh ref={halo}>
        <sphereGeometry args={[0.85, 32, 24]} />
        <meshBasicMaterial color={PALETTE.cosmic} transparent opacity={0.14} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.6, 28, 20]} />
        <meshBasicMaterial color={PALETTE.violet} transparent opacity={0.22} />
      </mesh>
      <mesh ref={ref}>
        <icosahedronGeometry args={[0.42, 0]} />
        <meshStandardMaterial
          color={PALETTE.violet}
          emissive={PALETTE.cosmic}
          emissiveIntensity={1.0}
          metalness={0.6}
          roughness={0.3}
          flatShading
        />
      </mesh>
    </>
  );
}

/* ───────────────────────── WIRE SHELLS ───────────────────────── */
function WireShells() {
  const sphere = useRef<THREE.LineSegments>(null);
  const ico = useRef<THREE.LineSegments>(null);
  useFrame((_, dt) => {
    if (sphere.current) {
      sphere.current.rotation.y += dt * 0.12;
      sphere.current.rotation.x += dt * 0.04;
    }
    if (ico.current) {
      ico.current.rotation.y -= dt * 0.08;
      ico.current.rotation.z += dt * 0.05;
    }
  });
  const sphereEdges = useMemo(
    () => new THREE.EdgesGeometry(new THREE.SphereGeometry(1.6, 24, 16)),
    [],
  );
  const icoEdges = useMemo(
    () => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(2.1, 1)),
    [],
  );
  return (
    <>
      <lineSegments ref={sphere} geometry={sphereEdges}>
        <lineBasicMaterial color={PALETTE.cyan} transparent opacity={0.42} />
      </lineSegments>
      <lineSegments ref={ico} geometry={icoEdges}>
        <lineBasicMaterial color={PALETTE.violet} transparent opacity={0.32} />
      </lineSegments>
    </>
  );
}

/* ───────────────────────── ORBITAL SATELLITES ────────────────── */
function OrbitalRing({
  radius,
  tilt,
  speed,
  satellite,
  ringColor,
  startAngle = 0,
}: {
  radius: number;
  tilt: [number, number, number];
  speed: number;
  satellite: { color: string; size: number };
  ringColor: string;
  startAngle?: number;
}) {
  const ringRef = useRef<THREE.LineLoop>(null);
  const satGroupRef = useRef<THREE.Group>(null);

  const ringGeom = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const segments = 96;
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [radius]);

  useFrame(({ clock }, dt) => {
    if (ringRef.current) ringRef.current.rotation.y += dt * speed * 0.3;
    if (satGroupRef.current) {
      const t = clock.getElapsedTime() * speed + startAngle;
      satGroupRef.current.position.set(
        Math.cos(t) * radius,
        0,
        Math.sin(t) * radius,
      );
    }
  });

  return (
    <group rotation={tilt}>
      <lineLoop ref={ringRef} geometry={ringGeom}>
        <lineBasicMaterial color={ringColor} transparent opacity={0.32} />
      </lineLoop>
      <group ref={satGroupRef}>
        <mesh>
          <sphereGeometry args={[satellite.size, 18, 14]} />
          <meshStandardMaterial
            color={satellite.color}
            emissive={satellite.color}
            emissiveIntensity={1.6}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[satellite.size * 2.6, 16, 12]} />
          <meshBasicMaterial color={satellite.color} transparent opacity={0.2} />
        </mesh>
      </group>
    </group>
  );
}

/* ───────────────────────── DEEP STARFIELD ────────────────────── */
function StarField({ count = 200 }: { count?: number }) {
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
      ref.current.rotation.y += dt * 0.015;
      ref.current.rotation.x += dt * 0.005;
    }
  });

  return (
    <points ref={ref} geometry={geom}>
      <pointsMaterial color={PALETTE.cream} size={0.035} transparent opacity={0.85} sizeAttenuation />
    </points>
  );
}

/* ───────────────────────── COSMIC DUST ───────────────────────── */
function DustCloud({ count = 70 }: { count?: number }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 2.5 + Math.random() * 2.0;
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
      ref.current.rotation.y -= dt * 0.04;
      ref.current.rotation.z += dt * 0.02;
    }
  });
  return (
    <points ref={ref} geometry={geom}>
      <pointsMaterial color={PALETTE.pink} size={0.06} transparent opacity={0.55} sizeAttenuation />
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
  // Tube geometry following a wavy circular path - gives a thin
  // curving aurora-like ribbon that drifts slowly.
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
      <meshBasicMaterial color={color} transparent opacity={0.45} />
    </mesh>
  );
}

/* ───────────────────────── HERO SELECT ATMOSPHERE ────────────── */
export default function HeroSelectAtmosphere() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.5, 7.2], fov: 48 }}
      style={{ width: "100%", height: "100%", background: "transparent", pointerEvents: "none" }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.55} />
      <pointLight position={[3, 2, 3]} intensity={1.2} color={PALETTE.cosmic} />
      <pointLight position={[-3, -2, 3]} intensity={0.85} color={PALETTE.pink} />
      <pointLight position={[0, 4, -2]} intensity={0.6} color={PALETTE.amber} />

      <StarField count={200} />
      <DustCloud count={70} />

      {/* Two slowly-drifting aurora ribbons - was three; trimmed for
          GPU load. Same atrium feel without the jank. */}
      <AuroraRibbon color={PALETTE.cosmic} radius={3.2} tilt={[Math.PI / 2.1, 0, 0]}        speed={0.025} thickness={0.05} />
      <AuroraRibbon color={PALETTE.pink}   radius={3.6} tilt={[Math.PI / 2.6, Math.PI / 5, 0]} speed={-0.018} thickness={0.04} />

      <WireShells />
      <CrystalCore />

      <OrbitalRing
        radius={2.4}
        tilt={[Math.PI / 2.4, 0, 0]}
        speed={0.32}
        ringColor={PALETTE.cyan}
        satellite={{ color: PALETTE.cyanBright, size: 0.09 }}
        startAngle={0}
      />
      <OrbitalRing
        radius={2.75}
        tilt={[Math.PI / 3, Math.PI / 6, 0]}
        speed={-0.24}
        ringColor={PALETTE.pink}
        satellite={{ color: PALETTE.pink, size: 0.085 }}
        startAngle={1.5}
      />
      <OrbitalRing
        radius={3.05}
        tilt={[Math.PI / 2.1, 0, Math.PI / 5]}
        speed={0.18}
        ringColor={PALETTE.amber}
        satellite={{ color: PALETTE.amber, size: 0.1 }}
        startAngle={3.0}
      />
    </Canvas>
  );
}
