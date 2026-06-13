"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";

/**
 * AuthPortalBackground — a dark sci-fi portal chamber behind the Access Layer.
 *
 * A "vault gateway": a glowing concentric-ring portal (varied ring weights,
 * segmented arcs, a rotating tick ring, all with a soft canvas glow) with a hot
 * core, a shaft of light pouring in from above, and a reflective tiled floor
 * whose rings ripple out to a horizon and reflect the portal as a vertical
 * streak. Faint pillars frame the edges; haze + dust add depth.
 *
 * All decorative; pointer-events off; freezes under reduced-motion; the heavy
 * bits (floor, pillars) drop on low-power devices.
 */

type Quality = "high" | "medium" | "low";

const Q: Record<Quality, { dpr: [number, number]; dust: number; floor: boolean }> = {
  high: { dpr: [1, 1.8], dust: 34, floor: true },
  medium: { dpr: [1, 1.5], dust: 20, floor: true },
  low: { dpr: [1, 1.3], dust: 12, floor: false },
};

const VIOLET = "#8b6cff";
const CYAN = "#36dbff";

/* ───────────────────────── canvas textures (client only) ───────────────────────── */

function makeGlow(): THREE.Texture {
  const s = 128;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const x = c.getContext("2d")!;
  const g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.22, "rgba(214,222,255,0.85)");
  g.addColorStop(0.55, "rgba(140,150,255,0.22)");
  g.addColorStop(1, "rgba(120,130,255,0)");
  x.fillStyle = g;
  x.fillRect(0, 0, s, s);
  return new THREE.CanvasTexture(c);
}

/** The HUD ring portal: central glow, faint grid, crosshair, glowing rings. */
function makePortal(): THREE.Texture {
  const s = 1024;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const x = c.getContext("2d")!;
  const cx = s / 2;
  const cy = s / 2;

  // central radial glow
  const g = x.createRadialGradient(cx, cy, 0, cx, cy, s * 0.34);
  g.addColorStop(0, "rgba(190,180,255,0.95)");
  g.addColorStop(0.4, "rgba(110,120,255,0.3)");
  g.addColorStop(1, "rgba(80,90,255,0)");
  x.fillStyle = g;
  x.beginPath();
  x.arc(cx, cy, s * 0.34, 0, Math.PI * 2);
  x.fill();

  // faint inner grid, clipped to a circle (crisp, no glow)
  x.save();
  x.beginPath();
  x.arc(cx, cy, s * 0.3, 0, Math.PI * 2);
  x.clip();
  x.strokeStyle = "rgba(150,170,255,0.09)";
  x.lineWidth = 1;
  for (let i = -7; i <= 7; i++) {
    const o = i * (s * 0.042);
    x.beginPath();
    x.moveTo(cx + o, cy - s * 0.3);
    x.lineTo(cx + o, cy + s * 0.3);
    x.stroke();
    x.beginPath();
    x.moveTo(cx - s * 0.3, cy + o);
    x.lineTo(cx + s * 0.3, cy + o);
    x.stroke();
  }
  x.restore();

  // crosshair
  x.strokeStyle = "rgba(150,180,255,0.14)";
  x.lineWidth = 1.2;
  x.beginPath();
  x.moveTo(cx, cy - s * 0.36);
  x.lineTo(cx, cy + s * 0.36);
  x.stroke();
  x.beginPath();
  x.moveTo(cx - s * 0.36, cy);
  x.lineTo(cx + s * 0.36, cy);
  x.stroke();

  // glowing concentric rings — varied weights, a couple dashed
  const ringDefs: { r: number; w: number; c: string; dash: number[] | null }[] = [
    { r: 0.2, w: 2.6, c: "rgba(150,210,255,0.85)", dash: null },
    { r: 0.255, w: 1.4, c: "rgba(150,165,255,0.5)", dash: [4, 12] },
    { r: 0.31, w: 3.2, c: "rgba(120,215,255,0.9)", dash: null },
    { r: 0.365, w: 1.3, c: "rgba(155,175,255,0.45)", dash: [3, 10] },
    { r: 0.42, w: 2.4, c: "rgba(130,200,255,0.75)", dash: null },
    { r: 0.47, w: 1.2, c: "rgba(155,175,255,0.4)", dash: [8, 16] },
  ];
  ringDefs.forEach((d) => {
    x.save();
    x.beginPath();
    x.arc(cx, cy, s * d.r, 0, Math.PI * 2);
    x.strokeStyle = d.c;
    x.lineWidth = d.w;
    if (d.dash) x.setLineDash(d.dash);
    x.shadowColor = d.c;
    x.shadowBlur = 14;
    x.stroke();
    x.restore();
  });

  const t = new THREE.CanvasTexture(c);
  t.needsUpdate = true;
  return t;
}

/** A ring of tick marks + bright segmented arcs — rotates over the portal. */
function makeTicks(): THREE.Texture {
  const s = 1024;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const x = c.getContext("2d")!;
  const cx = s / 2;
  const cy = s / 2;

  const tickR = s * 0.435;
  const n = 96;
  x.strokeStyle = "rgba(165,210,255,0.6)";
  x.shadowColor = "rgba(120,200,255,0.7)";
  x.shadowBlur = 6;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const long = i % 6 === 0;
    const r2 = tickR + (long ? s * 0.022 : s * 0.011);
    x.lineWidth = long ? 2.6 : 1.4;
    x.beginPath();
    x.moveTo(cx + Math.cos(a) * tickR, cy + Math.sin(a) * tickR);
    x.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
    x.stroke();
  }
  // bright segmented arcs on an inner radius
  const arcR = s * 0.335;
  x.strokeStyle = "rgba(130,215,255,0.8)";
  x.lineWidth = 3.4;
  x.shadowBlur = 12;
  ([[-0.4, 0.5], [2.2, 3.0], [4.0, 4.5]] as const).forEach(([a0, a1]) => {
    x.beginPath();
    x.arc(cx, cy, arcR, a0, a1);
    x.stroke();
  });

  const t = new THREE.CanvasTexture(c);
  t.needsUpdate = true;
  return t;
}

/** Concentric floor rings + a bright reflection streak, laid flat for the floor. */
function makeFloorRings(): THREE.Texture {
  const s = 1024;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const x = c.getContext("2d")!;
  const cx = s / 2;
  const cy = s / 2;

  // bright hotspot
  const g = x.createRadialGradient(cx, cy, 0, cx, cy, s * 0.5);
  g.addColorStop(0, "rgba(220,225,255,0.85)");
  g.addColorStop(0.06, "rgba(150,175,255,0.5)");
  g.addColorStop(0.4, "rgba(80,120,255,0.08)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  x.fillStyle = g;
  x.fillRect(0, 0, s, s);

  // vertical reflection streak (maps to the floor axis toward the camera)
  const sg = x.createLinearGradient(cx - s * 0.05, 0, cx + s * 0.05, 0);
  sg.addColorStop(0, "rgba(150,180,255,0)");
  sg.addColorStop(0.5, "rgba(190,210,255,0.5)");
  sg.addColorStop(1, "rgba(150,180,255,0)");
  x.fillStyle = sg;
  x.fillRect(cx - s * 0.05, 0, s * 0.1, s);

  // glowing concentric rings
  const rings = [0.13, 0.2, 0.27, 0.34, 0.41, 0.48];
  rings.forEach((r, i) => {
    x.save();
    x.beginPath();
    x.arc(cx, cy, s * r, 0, Math.PI * 2);
    x.strokeStyle = i % 2 ? "rgba(150,110,255,0.5)" : "rgba(80,205,255,0.55)";
    x.lineWidth = 3;
    x.shadowColor = i % 2 ? "rgba(150,110,255,0.8)" : "rgba(80,205,255,0.8)";
    x.shadowBlur = 10;
    x.stroke();
    x.restore();
  });

  return new THREE.CanvasTexture(c);
}

/** Subtle perspective tile grid for the floor. */
function makeGrid(): THREE.Texture {
  const s = 1024;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const x = c.getContext("2d")!;
  x.strokeStyle = "rgba(120,150,255,0.10)";
  x.lineWidth = 1.5;
  const step = s / 18;
  for (let i = 0; i <= 18; i++) {
    x.beginPath();
    x.moveTo(i * step, 0);
    x.lineTo(i * step, s);
    x.stroke();
    x.beginPath();
    x.moveTo(0, i * step);
    x.lineTo(s, i * step);
    x.stroke();
  }
  return new THREE.CanvasTexture(c);
}

/** A soft vertical shaft of light. */
function makeBeam(): THREE.Texture {
  const w = 128;
  const h = 512;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const x = c.getContext("2d")!;
  const vg = x.createLinearGradient(0, 0, 0, h);
  vg.addColorStop(0, "rgba(200,220,255,0.85)");
  vg.addColorStop(0.5, "rgba(150,180,255,0.32)");
  vg.addColorStop(1, "rgba(120,150,255,0)");
  x.fillStyle = vg;
  x.fillRect(0, 0, w, h);
  // taper the sides
  x.globalCompositeOperation = "destination-in";
  const hg = x.createLinearGradient(0, 0, w, 0);
  hg.addColorStop(0, "rgba(0,0,0,0)");
  hg.addColorStop(0.5, "rgba(0,0,0,1)");
  hg.addColorStop(1, "rgba(0,0,0,0)");
  x.fillStyle = hg;
  x.fillRect(0, 0, w, h);
  return new THREE.CanvasTexture(c);
}

/* ───────────────────────── scene pieces ───────────────────────── */

function Portal({ reducedMotion, energy, submitting, success }: { reducedMotion: boolean; energy: number; submitting: boolean; success: boolean }) {
  const portalTex = useMemo(makePortal, []);
  const tickTex = useMemo(makeTicks, []);
  const glowTex = useMemo(makeGlow, []);
  const ticks = useRef<THREE.Mesh>(null);
  const portalPlane = useRef<THREE.Mesh>(null);
  const core = useRef<THREE.Sprite>(null);
  const shock = useRef<THREE.Mesh>(null);
  const e = useRef(0); // smoothed form energy 0..1
  const flare = useRef(0); // smoothed success flare 0..1
  const colCool = useMemo(() => new THREE.Color(VIOLET), []);
  const colHot = useMemo(() => new THREE.Color("#d6e8ff"), []);

  useFrame((st, dt) => {
    e.current += (energy - e.current) * Math.min(1, dt * 3);
    flare.current += ((success ? 1 : 0) - flare.current) * Math.min(1, dt * 3.2);
    const ec = e.current;
    const fl = flare.current;

    // tick ring: spins faster as the form charges; bursts on submit/success
    if (ticks.current) {
      if (!reducedMotion) ticks.current.rotation.z += dt * (0.05 + ec * 0.14 + (submitting ? 0.5 : 0) + fl * 1.9);
      (ticks.current.material as THREE.MeshBasicMaterial).opacity = 0.6 + ec * 0.35;
    }
    if (portalPlane.current) {
      (portalPlane.current.material as THREE.MeshBasicMaterial).opacity = 0.7 + ec * 0.3 + fl * 0.2;
    }
    // core: brightens, swells and shifts violet→hot-white as it charges
    if (core.current) {
      const breathe = reducedMotion ? 1 : 1 + Math.sin(st.clock.elapsedTime * 1.1) * 0.06;
      const s = 4 * breathe * (1 + ec * 0.32 + fl * 1.1);
      core.current.scale.set(s, s, 1);
      const m = core.current.material as THREE.SpriteMaterial;
      m.opacity = Math.min(1, 0.55 + ec * 0.45 + fl * 0.4);
      m.color.copy(colCool).lerp(colHot, Math.min(1, ec * 0.7 + fl));
    }
    // success shockwave: a ring that expands + fades once as flare ramps
    if (shock.current) {
      const sc = 1.4 + fl * 7;
      shock.current.scale.set(sc, sc, 1);
      (shock.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 4 * fl * (1 - fl)) * 0.85;
    }
  });

  return (
    <group>
      <mesh ref={portalPlane} position={[0, 0, -0.05]}>
        <planeGeometry args={[12, 12]} />
        <meshBasicMaterial map={portalTex} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={1} />
      </mesh>
      <mesh ref={ticks} position={[0, 0, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshBasicMaterial map={tickTex} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.95} />
      </mesh>
      {/* success shockwave */}
      <mesh ref={shock} position={[0, 0, -0.1]}>
        <ringGeometry args={[1.1, 1.32, 64]} />
        <meshBasicMaterial color={CYAN} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
      </mesh>
      {/* hot core glow (haloes the reactor) */}
      <sprite ref={core} position={[0, 0, -0.3]} scale={[4, 4, 1]}>
        <spriteMaterial map={glowTex} color={VIOLET} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={1} />
      </sprite>
    </group>
  );
}

function Beam() {
  const tex = useMemo(makeBeam, []);
  return (
    <mesh position={[0, 7, -1]}>
      <planeGeometry args={[3.4, 14]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.5} />
    </mesh>
  );
}

function Floor({ focusX, reducedMotion, energy, success }: { focusX: number; reducedMotion: boolean; energy: number; success: boolean }) {
  const ringsTex = useMemo(makeFloorRings, []);
  const gridTex = useMemo(makeGrid, []);
  const glowTex = useMemo(makeGlow, []);
  const ripple = useRef<THREE.Mesh>(null);
  const hot = useRef<THREE.Sprite>(null);
  const e = useRef(0);
  const flare = useRef(0);

  useFrame((st, dt) => {
    e.current += (energy - e.current) * Math.min(1, dt * 3);
    flare.current += ((success ? 1 : 0) - flare.current) * Math.min(1, dt * 3.2);
    const ec = e.current;
    const fl = flare.current;
    if (ripple.current) {
      const pulse = reducedMotion ? 0 : Math.sin(st.clock.elapsedTime * 0.8) * 0.1;
      (ripple.current.material as THREE.MeshBasicMaterial).opacity = 0.7 + ec * 0.25 + fl * 0.3 + pulse;
    }
    if (hot.current) {
      const s = 9 * (1 + ec * 0.25 + fl * 0.8);
      hot.current.scale.set(s, s, 1);
      (hot.current.material as THREE.SpriteMaterial).opacity = 0.55 + ec * 0.2 + fl * 0.35;
    }
  });

  return (
    <group position={[focusX, -3, -1]} rotation={[-Math.PI / 2, 0, 0]}>
      {/* tiled grid */}
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[44, 44]} />
        <meshBasicMaterial map={gridTex} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.5} />
      </mesh>
      {/* concentric light rings + reflection streak */}
      <mesh ref={ripple}>
        <planeGeometry args={[36, 36]} />
        <meshBasicMaterial map={ringsTex} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.78} />
      </mesh>
      {/* bright hotspot where the portal meets the floor */}
      <sprite ref={hot} position={[0, 0, 0.5]} scale={[9, 9, 1]}>
        <spriteMaterial map={glowTex} color={CYAN} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.6} />
      </sprite>
    </group>
  );
}

function Rig({ reducedMotion }: { reducedMotion: boolean }) {
  const mouse = useRef({ x: 0, y: 0 });
  useEffect(() => {
    if (reducedMotion) return;
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [reducedMotion]);

  useFrame((st) => {
    if (reducedMotion) {
      st.camera.position.set(0, 0, 12);
      st.camera.lookAt(0, 0.15, 0);
      return;
    }
    const t = st.clock.elapsedTime;
    const tx = mouse.current.x * 0.7 + Math.sin(t * 0.05) * 0.25;
    const ty = mouse.current.y * 0.5 + Math.cos(t * 0.045) * 0.18;
    st.camera.position.x += (tx - st.camera.position.x) * 0.025;
    st.camera.position.y += (ty - st.camera.position.y) * 0.025;
    st.camera.lookAt(0, 0.15, 0);
  });
  return null;
}

function Scene({
  quality,
  reducedMotion,
  offsetPx,
  energy,
  submitting,
  success,
}: {
  quality: Quality;
  reducedMotion: boolean;
  offsetPx: number;
  energy: number;
  submitting: boolean;
  success: boolean;
}) {
  const cfg = Q[quality];
  // Lock the portal to the reactor's real screen position. The reactor lives in
  // a max-1440 centred grid, so its column centre is a FIXED pixel offset to the
  // right of screen-centre at any width. Convert that pixel offset to world-x
  // (world units per pixel = viewport.width / size.width) so the portal tracks
  // the reactor on every monitor, regardless of aspect ratio.
  const viewport = useThree((s) => s.viewport);
  const size = useThree((s) => s.size);
  const focusX = (offsetPx / size.width) * viewport.width;

  // Core spill light brightens as the form charges.
  const light = useRef<THREE.PointLight>(null);
  const le = useRef(0);
  useFrame((_, dt) => {
    le.current += (energy - le.current) * Math.min(1, dt * 3);
    if (light.current) light.current.intensity = 22 + le.current * 26 + (success ? 34 : 0);
  });

  return (
    <>
      <fog attach="fog" args={["#05060f", 9, 32]} />
      <ambientLight intensity={0.18} />
      <pointLight ref={light} position={[focusX, 0.5, 2]} color={VIOLET} intensity={28} distance={32} />

      <group position={[focusX, 0.3, 0]}>
        <Portal reducedMotion={reducedMotion} energy={energy} submitting={submitting} success={success} />
        <Beam />
      </group>

      {cfg.floor && <Floor focusX={focusX} reducedMotion={reducedMotion} energy={energy} success={success} />}

      <Sparkles count={cfg.dust} scale={[26, 16, 10]} position={[focusX, 0.5, 0]} size={3} speed={reducedMotion ? 0 : 0.3} opacity={0.55} color="#bcd0ff" />
      <Rig reducedMotion={reducedMotion} />
    </>
  );
}

export default function AuthPortalBackground({
  quality = "high",
  reducedMotion = false,
  offsetPx = 0,
  energy = 0,
  submitting = false,
  success = false,
}: {
  quality?: Quality;
  reducedMotion?: boolean;
  /** Pixels to shift the portal centre right of screen-centre (= the reactor
   *  column's offset). 0 keeps it dead-centre (mobile). */
  offsetPx?: number;
  /** 0..1 form completion — charges the portal (rings, core, floor). */
  energy?: number;
  /** Submitting — gives the rings a spin burst. */
  submitting?: boolean;
  /** Success — flares the core + fires a shockwave (the "portal opens"). */
  success?: boolean;
}) {
  const cfg = Q[quality];
  return (
    <Canvas
      dpr={cfg.dpr}
      camera={{ position: [0, 0, 12], fov: 52 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%", background: "transparent", pointerEvents: "none" }}
      // Success drives a one-shot flare, so keep rendering even under
      // reduced-motion until it settles; otherwise idle on demand.
      frameloop={reducedMotion && !success ? "demand" : "always"}
    >
      <Scene quality={quality} reducedMotion={reducedMotion} offsetPx={offsetPx} energy={energy} submitting={submitting} success={success} />
    </Canvas>
  );
}
