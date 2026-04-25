"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Lightweight rotating wireframe globe + floating particles + glowing core.
 * Built with raw R3F primitives (no @react-three/drei) so we add nothing
 * to the bundle beyond what's already installed (`@react-three/fiber`,
 * `three`).
 *
 * Designed to live behind/under a UI panel — it auto-rotates slowly, has
 * no controls, and accepts pointer events so the page doesn't intercept
 * clicks.
 */

function WireframeSphere() {
  const outer = useRef<THREE.LineSegments>(null);
  const inner = useRef<THREE.LineSegments>(null);
  useFrame((_, dt) => {
    if (outer.current) {
      outer.current.rotation.y += dt * 0.18;
      outer.current.rotation.x += dt * 0.04;
    }
    if (inner.current) {
      inner.current.rotation.y -= dt * 0.12;
      inner.current.rotation.z += dt * 0.05;
    }
  });
  // Wireframe via EdgesGeometry of a SphereGeometry — gives clean lat/long lines.
  const outerEdges = useMemo(() => new THREE.EdgesGeometry(new THREE.SphereGeometry(1.6, 26, 16)), []);
  const innerEdges = useMemo(() => new THREE.EdgesGeometry(new THREE.SphereGeometry(1.2, 18, 12)), []);
  return (
    <>
      <lineSegments ref={outer} geometry={outerEdges}>
        <lineBasicMaterial color="#22d3ee" transparent opacity={0.55} />
      </lineSegments>
      <lineSegments ref={inner} geometry={innerEdges}>
        <lineBasicMaterial color="#8b5cf6" transparent opacity={0.45} />
      </lineSegments>
      {/* Glowing core */}
      <mesh>
        <sphereGeometry args={[0.42, 24, 18]} />
        <meshBasicMaterial color="#a78bfa" transparent opacity={0.35} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.6, 24, 18]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.12} />
      </mesh>
    </>
  );
}

function OrbitalRing({ radius, tilt, colour, speed }: { radius: number; tilt: number; colour: string; speed: number }) {
  const ref = useRef<THREE.LineLoop>(null);
  const geom = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const segments = 96;
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [radius]);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * speed;
  });
  return (
    <lineLoop ref={ref} geometry={geom} rotation={[tilt, 0, 0]}>
      <lineBasicMaterial color={colour} transparent opacity={0.4} />
    </lineLoop>
  );
}

function FloatingPoints({ count = 80 }: { count?: number }) {
  // Random points in a thick spherical shell around the globe.
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 2.2 + Math.random() * 1.4;
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
      ref.current.rotation.y += dt * 0.06;
      ref.current.rotation.x += dt * 0.02;
    }
  });

  return (
    <points ref={ref} geometry={geom}>
      <pointsMaterial color="#22d3ee" size={0.04} transparent opacity={0.85} sizeAttenuation />
    </points>
  );
}

export default function CyberGlobe() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0.4, 5.8], fov: 45 }}
      style={{ width: "100%", height: "100%", background: "transparent", pointerEvents: "none" }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.8} />
      <pointLight position={[3, 3, 3]} intensity={1.2} color="#22d3ee" />
      <pointLight position={[-3, -2, 3]} intensity={0.8} color="#8b5cf6" />
      <WireframeSphere />
      <OrbitalRing radius={2.0} tilt={Math.PI / 2.4} colour="#22d3ee" speed={0.15} />
      <OrbitalRing radius={2.4} tilt={Math.PI / 3} colour="#8b5cf6" speed={-0.1} />
      <OrbitalRing radius={2.7} tilt={Math.PI / 2.1} colour="#a78bfa" speed={0.07} />
      <FloatingPoints count={80} />
    </Canvas>
  );
}
