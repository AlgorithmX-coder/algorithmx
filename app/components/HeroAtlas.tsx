"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * HeroAtlas — a richer companion to <CyberGlobe/>.
 *
 * Built for the signup right panel: a layered 3D atlas with a pulsing
 * crystalline core, multiple wireframe shells (sphere + icosahedron),
 * four tilted orbital rings each carrying a glowing skill satellite,
 * a slow energy beam from core to active satellite, and a deep
 * starfield. Warm Pixar palette only — gold, coral, violet — no cyber
 * cyans.
 *
 * No drei, no orbit controls, no pointer events — drops behind UI.
 */

const PALETTE = {
  goldLight: "#ffd58a",
  goldMid: "#ff9b4a",
  goldDeep: "#d4733a",
  coral: "#f08e7e",
  ember: "#c4513a",
  blossom: "#f7c1d6",
  violet: "#a06aff",
  cream: "#fff7e6",
};

/* ───────────────────────── CRYSTAL CORE ─────────────────────────
 * An icosahedron with emissive gold — pulses scale + intensity. */
function CrystalCore() {
  const ref = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);
  useFrame(({ clock }, dt) => {
    if (ref.current) {
      ref.current.rotation.y += dt * 0.4;
      ref.current.rotation.x += dt * 0.15;
      const t = clock.getElapsedTime();
      const s = 1 + Math.sin(t * 1.6) * 0.06;
      ref.current.scale.setScalar(s);
    }
    if (halo.current) {
      const t = clock.getElapsedTime();
      const s = 1 + Math.sin(t * 1.2) * 0.12;
      halo.current.scale.setScalar(s);
    }
  });
  return (
    <>
      {/* Outer warm halo */}
      <mesh ref={halo}>
        <sphereGeometry args={[0.95, 32, 24]} />
        <meshBasicMaterial color={PALETTE.coral} transparent opacity={0.12} />
      </mesh>
      {/* Mid glow */}
      <mesh>
        <sphereGeometry args={[0.7, 28, 20]} />
        <meshBasicMaterial color={PALETTE.goldMid} transparent opacity={0.22} />
      </mesh>
      {/* Solid crystal */}
      <mesh ref={ref}>
        <icosahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial
          color={PALETTE.goldLight}
          emissive={PALETTE.goldMid}
          emissiveIntensity={0.9}
          metalness={0.6}
          roughness={0.25}
          flatShading
        />
      </mesh>
    </>
  );
}

/* ───────────────────────── WIRE SHELLS ──────────────────────── */
function WireShells() {
  const sphere = useRef<THREE.LineSegments>(null);
  const ico = useRef<THREE.LineSegments>(null);
  const outer = useRef<THREE.LineSegments>(null);
  useFrame((_, dt) => {
    if (sphere.current) {
      sphere.current.rotation.y += dt * 0.18;
      sphere.current.rotation.x += dt * 0.04;
    }
    if (ico.current) {
      ico.current.rotation.y -= dt * 0.12;
      ico.current.rotation.z += dt * 0.05;
    }
    if (outer.current) {
      outer.current.rotation.y += dt * 0.05;
      outer.current.rotation.x -= dt * 0.03;
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
        <lineBasicMaterial color={PALETTE.goldLight} transparent opacity={0.55} />
      </lineSegments>
      <lineSegments ref={ico} geometry={icoEdges}>
        <lineBasicMaterial color={PALETTE.coral} transparent opacity={0.45} />
      </lineSegments>
      <lineSegments ref={outer} geometry={outerEdges}>
        <lineBasicMaterial color={PALETTE.violet} transparent opacity={0.3} />
      </lineSegments>
    </>
  );
}

/* ───────────────────────── ORBITAL RING + SATELLITE ─────────────
 * Each ring carries a glowing satellite that orbits at a constant
 * speed. The ring itself is rendered as a faint gold trail. */
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
      // Orbit the satellite (and its halo) in the ring's local plane.
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
        <lineBasicMaterial color={ringColor} transparent opacity={0.35} />
      </lineLoop>
      <group ref={satGroupRef}>
        <mesh>
          <sphereGeometry args={[satellite.size, 18, 14]} />
          <meshStandardMaterial
            color={satellite.color}
            emissive={satellite.color}
            emissiveIntensity={1.4}
          />
        </mesh>
        {/* Satellite halo follows automatically — same group */}
        <mesh>
          <sphereGeometry args={[satellite.size * 2.4, 16, 12]} />
          <meshBasicMaterial color={satellite.color} transparent opacity={0.18} />
        </mesh>
      </group>
    </group>
  );
}

/* ───────────────────────── STAR FIELD ──────────────────────── */
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
      ref.current.rotation.y += dt * 0.02;
      ref.current.rotation.x += dt * 0.005;
    }
  });

  return (
    <points ref={ref} geometry={geom}>
      <pointsMaterial color={PALETTE.cream} size={0.035} transparent opacity={0.85} sizeAttenuation />
    </points>
  );
}

/* ───────────────────────── DUST SHELL ──────────────────────── */
function DustShell({ count = 110 }: { count?: number }) {
  // Closer-in warm gold dust — gives the volumetric haze around the
  // wire shells.
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
      ref.current.rotation.y -= dt * 0.04;
      ref.current.rotation.z += dt * 0.02;
    }
  });
  return (
    <points ref={ref} geometry={geom}>
      <pointsMaterial color={PALETTE.goldLight} size={0.05} transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

/* ───────────────────────── ENERGY BEAMS ──────────────────────── */
function EnergyBeams() {
  // Three thin rotating crossbeams that pass through the core to create
  // a "radiant" feel — gives an axis-of-power look without lens flare.
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.y += dt * 0.3;
      ref.current.rotation.z += dt * 0.1;
    }
  });
  return (
    <group ref={ref}>
      {[0, Math.PI / 3, (2 * Math.PI) / 3].map((rot, i) => (
        <mesh key={i} rotation={[rot, 0, rot]}>
          <cylinderGeometry args={[0.012, 0.012, 4.2, 6]} />
          <meshBasicMaterial
            color={i === 0 ? PALETTE.goldLight : i === 1 ? PALETTE.coral : PALETTE.blossom}
            transparent
            opacity={0.35}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ───────────────────────── HERO ATLAS ──────────────────────── */
export default function HeroAtlas() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0.6, 6.3], fov: 45 }}
      style={{ width: "100%", height: "100%", background: "transparent", pointerEvents: "none" }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.55} />
      <pointLight position={[3, 2.5, 3]} intensity={1.4} color={PALETTE.goldLight} />
      <pointLight position={[-3, -2, 3]} intensity={0.9} color={PALETTE.coral} />
      <pointLight position={[0, 4, -2]} intensity={0.7} color={PALETTE.violet} />

      <StarField count={220} />
      <DustShell count={100} />

      <EnergyBeams />
      <WireShells />
      <CrystalCore />

      {/* 4 orbital rings each carrying a glowing skill-satellite,
          tilted at different angles so they read as a 3D armillary. */}
      <OrbitalRing
        radius={2.2}
        tilt={[Math.PI / 2.4, 0, 0]}
        speed={0.4}
        ringColor={PALETTE.goldLight}
        satellite={{ color: PALETTE.goldLight, size: 0.09 }}
        startAngle={0}
      />
      <OrbitalRing
        radius={2.5}
        tilt={[Math.PI / 3, Math.PI / 6, 0]}
        speed={-0.32}
        ringColor={PALETTE.coral}
        satellite={{ color: PALETTE.coral, size: 0.085 }}
        startAngle={1.2}
      />
      <OrbitalRing
        radius={2.8}
        tilt={[Math.PI / 2.1, 0, Math.PI / 5]}
        speed={0.22}
        ringColor={PALETTE.violet}
        satellite={{ color: PALETTE.violet, size: 0.1 }}
        startAngle={2.6}
      />
      <OrbitalRing
        radius={3.05}
        tilt={[Math.PI / 4, -Math.PI / 5, 0]}
        speed={-0.18}
        ringColor={PALETTE.blossom}
        satellite={{ color: PALETTE.blossom, size: 0.075 }}
        startAngle={4.1}
      />
    </Canvas>
  );
}
