"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * CyberHeroesBackdrop — flagship marketing-page R3F backdrop.
 *
 * Sparser and slower than the in-product atmospheres (BossEnergyCore /
 * HeroSelectAtmosphere) — this is a reading page, not an action surface.
 * Layered cosmic depth: distant nebulae, deep starfield, two slow aurora
 * ribbons, four wireframe geometric shards at varied Z, all framed by a
 * soft mouse-parallax camera pan.
 *
 * No pointer events; sits at the back of the page.
 */

const PALETTE = {
  cosmic: "#7c5cff",
  violet: "#a06aff",
  pink: "#ff5fb3",
  pinkLight: "#ff9bcb",
  amber: "#ffd158",
  coral: "#ff7a59",
  cyan: "#7df0ff",
  cyanBright: "#00e5ff",
  cream: "#fff7e6",
};

/* ─── Mouse-parallax camera pan ─── */
function CameraParallax() {
  const targetRef = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      targetRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      targetRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onLeave = () => {
      targetRef.current.x = 0;
      targetRef.current.y = 0;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);
  useFrame(({ camera }) => {
    const t = targetRef.current;
    camera.position.x += (t.x * 0.7 - camera.position.x) * 0.04;
    camera.position.y += (-t.y * 0.4 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

/* ─── Distant nebula sphere (additive glow) ─── */
function Nebula({
  position,
  color,
  radius,
  opacity = 0.15,
}: {
  position: [number, number, number];
  color: string;
  radius: number;
  opacity?: number;
}) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[radius, 32, 24]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ─── Deep starfield ─── */
function Starfield({ count = 180 }: { count?: number }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 10 + Math.random() * 18;
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
      ref.current.rotation.y += dt * 0.008;
      ref.current.rotation.x += dt * 0.003;
    }
  });
  return (
    <points ref={ref} geometry={geom}>
      <pointsMaterial
        color={PALETTE.cream}
        size={0.05}
        transparent
        opacity={0.75}
        sizeAttenuation
      />
    </points>
  );
}

/* ─── Aurora ribbon ─── */
function Aurora({
  color,
  radius,
  tilt,
  speed,
  thickness = 0.07,
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
        const wob = Math.sin(a * 3) * 0.24 + Math.cos(a * 5) * 0.14;
        return new THREE.Vector3(
          Math.cos(a) * (radius + wob),
          Math.sin(a * 2) * 0.4 + wob * 0.5,
          Math.sin(a) * (radius + wob),
        );
      }),
      true,
    );
    return new THREE.TubeGeometry(path, 80, thickness, 6, true);
  }, [radius, thickness]);
  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.y += dt * speed;
      ref.current.rotation.x += dt * speed * 0.35;
    }
  });
  return (
    <mesh ref={ref} rotation={tilt} position={position} geometry={geom}>
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.45}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ─── Floating wireframe shape ─── */
function FloatingShape({
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
      const t = clock.getElapsedTime();
      ref.current.position.y = pos[1] + Math.sin(t * 0.3 + pos[0]) * 0.5;
    }
  });
  return (
    <mesh ref={ref} position={pos} scale={scale}>
      {kind === "octa" && <octahedronGeometry args={[1, 0]} />}
      {kind === "dodeca" && <dodecahedronGeometry args={[1, 0]} />}
      {kind === "ico" && <icosahedronGeometry args={[1, 0]} />}
      {kind === "tetra" && <tetrahedronGeometry args={[1, 0]} />}
      <meshBasicMaterial color={color} wireframe transparent opacity={0.4} />
    </mesh>
  );
}

/* ─── BACKDROP ─── */
export default function CyberHeroesBackdrop() {
  return (
    <Canvas
      dpr={[1, 1.2]}
      camera={{ position: [0, 0, 12], fov: 60 }}
      style={{
        width: "100%",
        height: "100%",
        background: "transparent",
        pointerEvents: "none",
      }}
      gl={{
        antialias: false,
        alpha: true,
        powerPreference: "low-power",
      }}
    >
      <ambientLight intensity={0.45} />
      <CameraParallax />

      {/* Distant nebulae — two colours at varied depths so the cosmic
          background isn't monochrome violet. (Cut from 4 → 2 to leave
          GPU headroom for the hero video.) */}
      <Nebula position={[-13, 4, -22]} color={PALETTE.cosmic} radius={10} opacity={0.16} />
      <Nebula position={[14, 6, -28]} color={PALETTE.pink} radius={11} opacity={0.14} />

      <Starfield count={180} />

      {/* One aurora ribbon (cut from 2). */}
      <Aurora color={PALETTE.cosmic} radius={9} tilt={[Math.PI / 2.1, 0, 0]} speed={0.010} thickness={0.07} position={[0, 1, -10]} />

      {/* Two floating shapes (cut from 4). */}
      <FloatingShape pos={[-7, 3, -8]} kind="octa" scale={0.7} color={PALETTE.cosmic} speedX={0.08} speedY={0.18} />
      <FloatingShape pos={[8, 2, -10]} kind="dodeca" scale={0.85} color={PALETTE.pink} speedX={0.05} speedY={-0.14} />
    </Canvas>
  );
}
