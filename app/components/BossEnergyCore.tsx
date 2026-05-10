"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * BossEnergyCore - a 3D energy reactor sitting behind the boss-battle
 * lock screen's VS chip. Cousin of HeroAtlas (signup right panel) but
 * with the cyber-electric palette and a faster combat tempo: pulsing
 * crystal core, wireframe shells, three orbital rings carrying glowing
 * satellites, four crossing energy beams, dust shell + starfield.
 *
 * No pointer events; drops behind the UI as a live cinematic backdrop.
 */

const PALETTE = {
  cyan: "#7df0ff",
  cyanBright: "#00e5ff",
  cosmic: "#7c5cff",
  pink: "#ff5fb3",
  pinkLight: "#ff9bcb",
  amber: "#ffd158",
};

/* ───────────────────────── CRYSTAL CORE ───────────────────────── */
function CrystalCore() {
  const ref = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);
  useFrame(({ clock }, dt) => {
    if (ref.current) {
      ref.current.rotation.y += dt * 0.6;
      ref.current.rotation.x += dt * 0.25;
      const t = clock.getElapsedTime();
      const s = 1 + Math.sin(t * 2.4) * 0.09;
      ref.current.scale.setScalar(s);
    }
    if (halo.current) {
      const t = clock.getElapsedTime();
      const s = 1 + Math.sin(t * 1.6) * 0.18;
      halo.current.scale.setScalar(s);
    }
  });
  return (
    <>
      <mesh ref={halo}>
        <sphereGeometry args={[0.95, 32, 24]} />
        <meshBasicMaterial color={PALETTE.cyanBright} transparent opacity={0.18} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.7, 28, 20]} />
        <meshBasicMaterial color={PALETTE.cosmic} transparent opacity={0.28} />
      </mesh>
      <mesh ref={ref}>
        <icosahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial
          color={PALETTE.cyan}
          emissive={PALETTE.cosmic}
          emissiveIntensity={1.4}
          metalness={0.7}
          roughness={0.2}
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
  const outer = useRef<THREE.LineSegments>(null);
  useFrame((_, dt) => {
    if (sphere.current) {
      sphere.current.rotation.y += dt * 0.35;
      sphere.current.rotation.x += dt * 0.08;
    }
    if (ico.current) {
      ico.current.rotation.y -= dt * 0.22;
      ico.current.rotation.z += dt * 0.1;
    }
    if (outer.current) {
      outer.current.rotation.y += dt * 0.1;
      outer.current.rotation.x -= dt * 0.06;
    }
  });
  const sphereEdges = useMemo(
    () => new THREE.EdgesGeometry(new THREE.SphereGeometry(1.4, 22, 14)),
    [],
  );
  const icoEdges = useMemo(
    () => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.7, 1)),
    [],
  );
  const outerEdges = useMemo(
    () => new THREE.EdgesGeometry(new THREE.SphereGeometry(2.05, 26, 16)),
    [],
  );
  return (
    <>
      <lineSegments ref={sphere} geometry={sphereEdges}>
        <lineBasicMaterial color={PALETTE.cyan} transparent opacity={0.6} />
      </lineSegments>
      <lineSegments ref={ico} geometry={icoEdges}>
        <lineBasicMaterial color={PALETTE.pink} transparent opacity={0.5} />
      </lineSegments>
      <lineSegments ref={outer} geometry={outerEdges}>
        <lineBasicMaterial color={PALETTE.cosmic} transparent opacity={0.4} />
      </lineSegments>
    </>
  );
}

/* ───────────────────────── ORBITAL RING + SATELLITE ───────────── */
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
    if (ringRef.current) ringRef.current.rotation.y += dt * speed * 0.4;
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
        <lineBasicMaterial color={ringColor} transparent opacity={0.45} />
      </lineLoop>
      <group ref={satGroupRef}>
        <mesh>
          <sphereGeometry args={[satellite.size, 18, 14]} />
          <meshStandardMaterial
            color={satellite.color}
            emissive={satellite.color}
            emissiveIntensity={2.0}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[satellite.size * 2.6, 16, 12]} />
          <meshBasicMaterial color={satellite.color} transparent opacity={0.22} />
        </mesh>
      </group>
    </group>
  );
}

/* ───────────────────────── STARFIELD ───────────────────────── */
function StarField({ count = 240 }: { count?: number }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 4.5 + Math.random() * 4;
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
      ref.current.rotation.y += dt * 0.04;
      ref.current.rotation.x += dt * 0.01;
    }
  });

  return (
    <points ref={ref} geometry={geom}>
      <pointsMaterial color={PALETTE.cyan} size={0.04} transparent opacity={0.85} sizeAttenuation />
    </points>
  );
}

/* ───────────────────────── DUST SHELL ───────────────────────── */
function DustShell({ count = 90 }: { count?: number }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 2.3 + Math.random() * 1.3;
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
      ref.current.rotation.y -= dt * 0.08;
      ref.current.rotation.z += dt * 0.04;
    }
  });
  return (
    <points ref={ref} geometry={geom}>
      <pointsMaterial color={PALETTE.pink} size={0.06} transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

/* ───────────────────────── ENERGY BEAMS ───────────────────────── */
function EnergyBeams() {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.y += dt * 0.6;
      ref.current.rotation.z += dt * 0.2;
    }
  });
  const colors = [PALETTE.cyan, PALETTE.pink, PALETTE.cosmic, PALETTE.amber];
  return (
    <group ref={ref}>
      {[0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4].map((rot, i) => (
        <mesh key={i} rotation={[rot, 0, rot]}>
          <cylinderGeometry args={[0.014, 0.014, 4.2, 6]} />
          <meshBasicMaterial color={colors[i]} transparent opacity={0.45} />
        </mesh>
      ))}
    </group>
  );
}

/* ───────────────────────── BOSS ENERGY CORE ───────────────────── */
export default function BossEnergyCore() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0.4, 6.3], fov: 45 }}
      style={{ width: "100%", height: "100%", background: "transparent", pointerEvents: "none" }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[3, 2.5, 3]} intensity={1.6} color={PALETTE.cyan} />
      <pointLight position={[-3, -2, 3]} intensity={1.0} color={PALETTE.pink} />
      <pointLight position={[0, 4, -2]} intensity={0.8} color={PALETTE.cosmic} />

      <StarField count={220} />
      <DustShell count={90} />

      <EnergyBeams />
      <WireShells />
      <CrystalCore />

      <OrbitalRing
        radius={2.2}
        tilt={[Math.PI / 2.4, 0, 0]}
        speed={0.7}
        ringColor={PALETTE.cyan}
        satellite={{ color: PALETTE.cyanBright, size: 0.1 }}
        startAngle={0}
      />
      <OrbitalRing
        radius={2.55}
        tilt={[Math.PI / 3, Math.PI / 6, 0]}
        speed={-0.55}
        ringColor={PALETTE.pink}
        satellite={{ color: PALETTE.pink, size: 0.09 }}
        startAngle={1.2}
      />
      <OrbitalRing
        radius={2.85}
        tilt={[Math.PI / 2.1, 0, Math.PI / 5]}
        speed={0.4}
        ringColor={PALETTE.cosmic}
        satellite={{ color: PALETTE.cosmic, size: 0.11 }}
        startAngle={2.6}
      />
    </Canvas>
  );
}
