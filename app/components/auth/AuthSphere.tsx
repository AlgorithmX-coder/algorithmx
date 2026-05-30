"use client";

import { useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CYBER_PALETTE } from "@/app/components/scene/cyberTokens";

/**
 * AuthSphere - the central security sphere on the login/signup pages.
 *
 * The sphere is NOT decoration. It reacts to form progress so the kid
 * can watch the access portal come online as they fill the form in:
 *
 *   identityRing   - outer ring activates when the name is entered
 *   commsRing      - middle ring activates when the email is valid
 *   shieldLayer    - inner shell brightens when the password is strong
 *   vaultLock      - core flips to lime when the confirm matches
 *   accessGranted  - portal-open: rings align, core flares cyan-lime
 *
 * On `login`, name + confirm don't exist, so only commsRing /
 * shieldLayer / accessGranted are driven.
 *
 * Honors prefers-reduced-motion: rotations freeze, ring opacities
 * still update so the kid still sees the state change.
 */

export interface AuthSphereStage {
  identityRing?: boolean;
  commsRing?: boolean;
  shieldLayer?: boolean;
  vaultLock?: boolean;
  accessGranted?: boolean;
}

/* ────────────────────────────────────────────────────────────────
 * Reactive ring: opacity + colour lerp toward an "active" target
 * inside useFrame so prop changes feel smooth, not stepped.
 * ────────────────────────────────────────────────────────────── */
function ReactiveRing({
  radius,
  tilt,
  baseColor,
  activeColor,
  active,
  speed,
  reduced,
}: {
  radius: number;
  tilt: number;
  baseColor: string;
  activeColor: string;
  active: boolean;
  speed: number;
  reduced: boolean;
}) {
  const ref = useRef<THREE.LineLoop>(null);
  const mat = useRef<THREE.LineBasicMaterial>(null);
  const colourTarget = useMemo(() => new THREE.Color(activeColor), [activeColor]);
  const colourBase = useMemo(() => new THREE.Color(baseColor), [baseColor]);

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
    if (ref.current && !reduced) ref.current.rotation.y += dt * speed;
    if (mat.current) {
      const targetOpacity = active ? 0.92 : 0.18;
      mat.current.opacity = THREE.MathUtils.lerp(mat.current.opacity, targetOpacity, dt * 4);
      const target = active ? colourTarget : colourBase;
      mat.current.color.lerp(target, dt * 4);
    }
  });

  return (
    <lineLoop ref={ref} geometry={geom} rotation={[tilt, 0, 0]}>
      <lineBasicMaterial
        ref={mat}
        color={baseColor}
        transparent
        opacity={0.18}
        linewidth={2}
      />
    </lineLoop>
  );
}

/* Wireframe shells: outer lat/long sphere always present; an inner
 * shield-glow halo brightens when shieldLayer is on. */
function Shells({ shieldLayer, reduced }: { shieldLayer: boolean; reduced: boolean }) {
  const outer = useRef<THREE.LineSegments>(null);
  const inner = useRef<THREE.LineSegments>(null);
  const halo = useRef<THREE.Mesh>(null);
  const haloMat = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((_, dt) => {
    if (!reduced) {
      if (outer.current) {
        outer.current.rotation.y += dt * 0.16;
        outer.current.rotation.x += dt * 0.04;
      }
      if (inner.current) {
        inner.current.rotation.y -= dt * 0.12;
        inner.current.rotation.z += dt * 0.05;
      }
    }
    if (haloMat.current) {
      const target = shieldLayer ? 0.34 : 0.08;
      haloMat.current.opacity = THREE.MathUtils.lerp(haloMat.current.opacity, target, dt * 4);
    }
    if (halo.current) {
      const target = shieldLayer ? 1.0 : 0.85;
      const s = THREE.MathUtils.lerp(halo.current.scale.x, target, dt * 4);
      halo.current.scale.setScalar(s);
    }
  });

  const outerEdges = useMemo(
    () => new THREE.EdgesGeometry(new THREE.SphereGeometry(1.6, 26, 16)),
    [],
  );
  const innerEdges = useMemo(
    () => new THREE.EdgesGeometry(new THREE.SphereGeometry(1.2, 18, 12)),
    [],
  );

  return (
    <>
      <lineSegments ref={outer} geometry={outerEdges}>
        <lineBasicMaterial color="#22d3ee" transparent opacity={0.4} />
      </lineSegments>
      <lineSegments ref={inner} geometry={innerEdges}>
        <lineBasicMaterial color="#8b5cf6" transparent opacity={0.35} />
      </lineSegments>
      {/* Shield-layer halo - swells + brightens when password strong */}
      <mesh ref={halo}>
        <sphereGeometry args={[1.85, 32, 24]} />
        <meshBasicMaterial ref={haloMat} color={CYBER_PALETTE.cyan} transparent opacity={0.08} />
      </mesh>
    </>
  );
}

/* The core - colour shifts (cyan/violet → lime → portal flare) and
 * scales on success. Acts as the visible "lock state". */
function Core({
  vaultLock,
  accessGranted,
  reduced,
}: {
  vaultLock: boolean;
  accessGranted: boolean;
  reduced: boolean;
}) {
  const inner = useRef<THREE.Mesh>(null);
  const outer = useRef<THREE.Mesh>(null);
  const innerMat = useRef<THREE.MeshBasicMaterial>(null);
  const outerMat = useRef<THREE.MeshBasicMaterial>(null);

  // Pre-allocate the color targets once.
  const cCool = useMemo(() => new THREE.Color("#a78bfa"), []);
  const cVault = useMemo(() => new THREE.Color(CYBER_PALETTE.lime), []);
  const cAccess = useMemo(() => new THREE.Color(CYBER_PALETTE.cyan), []);
  const cOuterCool = useMemo(() => new THREE.Color("#22d3ee"), []);
  const cOuterAccess = useMemo(() => new THREE.Color(CYBER_PALETTE.lime), []);

  useFrame(({ clock }, dt) => {
    if (innerMat.current) {
      const target = accessGranted ? cAccess : vaultLock ? cVault : cCool;
      innerMat.current.color.lerp(target, dt * 5);
      const targetOpacity = accessGranted ? 0.85 : vaultLock ? 0.55 : 0.32;
      innerMat.current.opacity = THREE.MathUtils.lerp(innerMat.current.opacity, targetOpacity, dt * 4);
    }
    if (outerMat.current) {
      const target = accessGranted ? cOuterAccess : cOuterCool;
      outerMat.current.color.lerp(target, dt * 5);
      const targetOpacity = accessGranted ? 0.32 : 0.12;
      outerMat.current.opacity = THREE.MathUtils.lerp(outerMat.current.opacity, targetOpacity, dt * 4);
    }
    if (inner.current) {
      // Subtle breathing always; portal flare overshoots briefly.
      const t = reduced ? 0 : clock.getElapsedTime();
      const base = 1 + Math.sin(t * 1.6) * 0.05;
      const flare = accessGranted ? 1.35 : 1;
      const s = THREE.MathUtils.lerp(inner.current.scale.x, base * flare, dt * 5);
      inner.current.scale.setScalar(s);
    }
  });

  return (
    <>
      <mesh ref={outer}>
        <sphereGeometry args={[0.6, 24, 18]} />
        <meshBasicMaterial ref={outerMat} color="#22d3ee" transparent opacity={0.12} />
      </mesh>
      <mesh ref={inner}>
        <sphereGeometry args={[0.42, 24, 18]} />
        <meshBasicMaterial ref={innerMat} color="#a78bfa" transparent opacity={0.32} />
      </mesh>
    </>
  );
}

/* Drifting starfield - kept simple, decorative only. */
function FloatingPoints({ reduced }: { reduced: boolean }) {
  const positions = useMemo(() => {
    const count = 80;
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
  }, []);
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);
  const ref = useRef<THREE.Points>(null);
  useFrame((_, dt) => {
    if (ref.current && !reduced) {
      ref.current.rotation.y += dt * 0.05;
      ref.current.rotation.x += dt * 0.018;
    }
  });
  return (
    <points ref={ref} geometry={geom}>
      <pointsMaterial color="#22d3ee" size={0.04} transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

/* ────────────────────────────────────────────────────────────────
 * The actual canvas. Reads stage props and drives the children.
 * ────────────────────────────────────────────────────────────── */
function AuthSphereCanvas({ stage }: { stage: AuthSphereStage }) {
  const reduced = !!useReducedMotion();

  return (
    <Canvas
      dpr={[1, 1.8]}
      camera={{ position: [0, 0.4, 5.8], fov: 45 }}
      style={{ width: "100%", height: "100%", background: "transparent", pointerEvents: "none" }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.8} />
      <pointLight position={[3, 3, 3]} intensity={1.2} color="#22d3ee" />
      <pointLight position={[-3, -2, 3]} intensity={0.8} color="#8b5cf6" />

      <Shells shieldLayer={!!stage.shieldLayer} reduced={reduced} />

      {/* Identity ring (outer) - "you have a name" */}
      <ReactiveRing
        radius={2.7}
        tilt={Math.PI / 2.1}
        baseColor="#3a4670"
        activeColor={CYBER_PALETTE.cosmic}
        active={!!stage.identityRing || !!stage.accessGranted}
        speed={0.07}
        reduced={reduced}
      />
      {/* Comms ring (middle) - "your email is contactable" */}
      <ReactiveRing
        radius={2.4}
        tilt={Math.PI / 3}
        baseColor="#3a4670"
        activeColor={CYBER_PALETTE.cyan}
        active={!!stage.commsRing || !!stage.accessGranted}
        speed={-0.1}
        reduced={reduced}
      />
      {/* Inner ring - tied to shield (password strong) */}
      <ReactiveRing
        radius={2.0}
        tilt={Math.PI / 2.4}
        baseColor="#3a4670"
        activeColor={CYBER_PALETTE.cyanSoft}
        active={!!stage.shieldLayer || !!stage.accessGranted}
        speed={0.15}
        reduced={reduced}
      />

      <Core
        vaultLock={!!stage.vaultLock}
        accessGranted={!!stage.accessGranted}
        reduced={reduced}
      />
      <FloatingPoints reduced={reduced} />
    </Canvas>
  );
}

/* ────────────────────────────────────────────────────────────────
 * Mobile fallback - CSS-only halo + 4 SVG rings whose opacity tracks
 * the same stage props. No R3F, no GPU contention.
 * ────────────────────────────────────────────────────────────── */
function AuthSphereCss({ stage }: { stage: AuthSphereStage }) {
  const reduced = !!useReducedMotion();
  const rings = [
    { r: 110, color: CYBER_PALETTE.cosmic, active: !!stage.identityRing || !!stage.accessGranted, dur: 22 },
    { r: 85, color: CYBER_PALETTE.cyan, active: !!stage.commsRing || !!stage.accessGranted, dur: 16 },
    { r: 60, color: CYBER_PALETTE.cyanSoft, active: !!stage.shieldLayer || !!stage.accessGranted, dur: 12 },
  ];
  const coreColor = stage.accessGranted ? CYBER_PALETTE.cyan : stage.vaultLock ? CYBER_PALETTE.lime : "#a78bfa";

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        opacity: 0.55,
      }}
    >
      <div
        style={{
          position: "relative",
          width: 240,
          height: 240,
        }}
      >
        {/* Soft halo */}
        <div
          style={{
            position: "absolute",
            inset: -40,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${coreColor}55 0%, transparent 60%)`,
            filter: "blur(18px)",
            transition: "background 600ms ease",
          }}
        />
        {rings.map((ring, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: ring.r * 2,
              height: ring.r * 2,
              borderRadius: "50%",
              border: `1.5px solid ${ring.color}`,
              opacity: ring.active ? 0.85 : 0.22,
              transform: "translate(-50%, -50%)",
              transition: "opacity 600ms ease",
              animation: reduced ? undefined : `authMobileRingSpin ${ring.dur}s linear infinite ${i % 2 ? "reverse" : ""}`,
              boxShadow: ring.active ? `0 0 18px ${ring.color}88` : "none",
            }}
          />
        ))}
        {/* Core */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 36,
            height: 36,
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
            background: `radial-gradient(circle, ${coreColor} 0%, ${coreColor}66 60%, transparent 80%)`,
            boxShadow: `0 0 28px ${coreColor}aa, 0 0 56px ${coreColor}55`,
            transition: "background 500ms ease, box-shadow 500ms ease",
          }}
        />
      </div>
      <style>{`
        @keyframes authMobileRingSpin {
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
 * Lazy-load the R3F canvas client-side so the Three.js bundle ships
 * only for visitors that actually reach /login or /signup.
 * ────────────────────────────────────────────────────────────── */
const AuthSphereCanvasLazy = dynamic(
  () => Promise.resolve({ default: AuthSphereCanvas }),
  { ssr: false },
);

/**
 * AuthSphere - drop in behind the form. Pass `stage` props as the
 * user progresses through the form. The component picks the right
 * renderer for the viewport.
 *
 * Set `mobile` true to force the lightweight CSS variant (e.g. on
 * small screens or `prefers-reduced-data`).
 */
export default function AuthSphere({
  stage,
  mobile = false,
}: {
  stage: AuthSphereStage;
  mobile?: boolean;
}) {
  if (mobile) return <AuthSphereCss stage={stage} />;
  return <AuthSphereCanvasLazy stage={stage} />;
}

export { AuthSphereCss };
