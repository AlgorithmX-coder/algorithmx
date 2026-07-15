"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { useAdaptiveQuality, type QualityTier } from "@/app/lib/gameEngine/adaptiveQuality";

/**
 * CyberHeroes3DScene — the WebGL ambient layer behind the /cyberheroes
 * hero. A uniform, depth-layered cosmic field (no single focal object, so
 * it reads the SAME calm-but-alive at every scroll framing of the fixed
 * canvas), built from spatial distributions:
 *
 *   1. a full spherical-shell additive starfield (deep backdrop)
 *   2. a constellation network — evenly-scattered nodes joined by faint
 *      additive lines with bright spark-dots at the joints (the "cyber web")
 *   3. a mid band of small wireframe crystals on an aspect-derived jittered
 *      grid across the whole frustum
 *   4. a few near accent shards ringed to the frame edges (parallax cue)
 *   5. elegant large elliptical rings sweeping the frame as graceful arcs
 *
 * Depth + gentle drift + a layered parallax "diorama" tilt are the wow: on
 * pointer move the camera pans AND the near crystals/constellation swing
 * toward the cursor while the far stars/rings hold, so depth really reads.
 *
 * Client-only (dynamic import, ssr:false). Adapts to the device:
 *  - GPU tier (adaptiveQuality) → drops bloom + rings + constellation, trims
 *    crystals and stars + caps dpr on weak/mobile GPUs.
 *  - prefers-reduced-motion (live) → a frozen, fully-composed static frame
 *    (frameloop "demand"), no animation. Evenness is structural.
 *  - pauses the render loop when scrolled past the hero / tab hidden.
 *  - distribution derives from live viewport aspect, so portrait, desktop
 *    and ultrawide all stay evenly filled without crowding the headline.
 */

const C = {
  cyan: "#00e5ff",
  cyanSoft: "#7df0ff",
  violet: "#a78bff",
  pink: "#ff9bd0",
  gold: "#ffd158",
  lime: "#7eff97",
  white: "#eaf6ff",
};

const FOV = 55;
const CAM_Z = 12;
/** Half-height of the view frustum at a given world z (camera at CAM_Z). */
function halfHeightAt(z: number) {
  return Math.tan((FOV * Math.PI) / 180 / 2) * (CAM_Z - z);
}

type PointerRef = RefObject<{ x: number; y: number }>;

/* Position-only, de-duplicated geometry from a (non-indexed) polyhedron —
 * so vertex spark-dots render once per REAL vertex, not once per face-corner
 * (platonic solids duplicate each vertex ~5× across adjacent faces). */
function dedupePositions(src: THREE.BufferGeometry): THREE.BufferGeometry {
  const pos = src.getAttribute("position");
  const seen = new Map<string, [number, number, number]>();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const key = `${x.toFixed(4)},${y.toFixed(4)},${z.toFixed(4)}`;
    if (!seen.has(key)) seen.set(key, [x, y, z]);
  }
  const arr = new Float32Array(seen.size * 3);
  let i = 0;
  for (const p of seen.values()) {
    arr[i * 3] = p[0];
    arr[i * 3 + 1] = p[1];
    arr[i * 3 + 2] = p[2];
    i++;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
  return g;
}

/* Tiny deterministic PRNG (pure — avoids Math.random during render). */
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Live prefers-reduced-motion (updates if the OS setting is toggled). */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  return reduced;
}

/* Page activity for the render loop. The canvas is position:fixed so it
 * can't be observed directly; we watch scroll + visibility instead.
 *  - hidden:    tab backgrounded → stop rendering entirely.
 *  - belowHero: scrolled past the hero → keep rendering, but gently (slower
 *               motion + heaviest effects dropped) to save GPU. Hysteresis
 *               (0.9vh / 1.2vh dead-band) stops it flickering at the edge. */
function usePageActivity() {
  const tabHidden = () =>
    typeof document !== "undefined" && document.visibilityState === "hidden";
  const [belowHero, setBelowHero] = useState(
    () => typeof window !== "undefined" && window.scrollY > window.innerHeight * 1.1,
  );
  const [hidden, setHidden] = useState(tabHidden);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const h = window.innerHeight;
      setBelowHero((prev) => (prev ? y > h * 0.9 : y > h * 1.2));
    };
    const onVis = () => setHidden(tabHidden());
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);
  return { belowHero, hidden };
}

/* Debounced viewport-aspect bucket: settles ~160ms after the last resize so
 * heavy graph/line rebuilds fire once on release, not on every drag frame. */
function useDebouncedBucket(delay = 160) {
  const size = useThree((s) => s.size);
  const live = Math.round((size.width / Math.max(1, size.height)) * 100) / 100;
  const [settled, setSettled] = useState(live);
  useEffect(() => {
    const id = setTimeout(() => setSettled(live), delay);
    return () => clearTimeout(id);
  }, [live, delay]);
  return settled;
}

/* One shared, normalised (-1..1) pointer target driven by a single window
 * listener (the canvas is pointer-events:none, so R3F's own pointer state
 * never fires). Camera pan + diorama tilt both read this ref. */
function usePointer(reduced: boolean): PointerRef {
  const ref = useRef({ x: 0, y: 0 });
  useEffect(() => {
    if (reduced) {
      ref.current.x = 0;
      ref.current.y = 0;
      return;
    }
    const onMove = (e: PointerEvent) => {
      ref.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      ref.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced]);
  return ref;
}

/* Eased parallax camera pan toward the pointer. */
function CameraParallax({ pointer, reduced }: { pointer: PointerRef; reduced: boolean }) {
  useFrame(({ camera }) => {
    if (reduced) {
      // Re-centre so the frozen reduced-motion frame is never left panned.
      camera.position.set(0, 0, CAM_Z);
      camera.lookAt(0, 0, 0);
      return;
    }
    const t = pointer.current;
    camera.position.x += (t.x * 1.15 - camera.position.x) * 0.035;
    camera.position.y += (-t.y * 0.65 - camera.position.y) * 0.035;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

/* Diorama tilt: eases the wrapped (near/mid) layers' rotation toward the
 * pointer, so they swing while the far stars/rings hold — strong layered
 * depth on mouse-move without dragging any focal object across the frame. */
function ParallaxGroup({
  pointer,
  reduced,
  children,
}: {
  pointer: PointerRef;
  reduced: boolean;
  children: ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    if (reduced) {
      // Un-tilt so the frozen reduced-motion frame sits square.
      g.rotation.set(0, 0, 0);
      return;
    }
    const t = pointer.current;
    // Reinforce the camera pan on BOTH axes (a node at negative z needs a
    // negated rotation.y to swing the same way the pan does) so the diorama
    // depth reads evenly however the cursor moves.
    g.rotation.y += (-t.x * 0.05 - g.rotation.y) * 0.04;
    g.rotation.x += (-t.y * 0.045 - g.rotation.x) * 0.04;
  });
  return <group ref={ref}>{children}</group>;
}

/* Deep parallax starfield — uniform spherical shell, blue-white with a few
 * violet accents. Rotationally symmetric, so density reads identical in
 * every screen region at every framing. */
function Starfield({ count, reduced, slow }: { count: number; reduced: boolean; slow: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const { geom, mat } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const a = new THREE.Color(C.cyanSoft);
    const b = new THREE.Color(C.violet);
    const w = new THREE.Color(C.white);
    const rng = mulberry32(0x9e3779 + count);
    for (let i = 0; i < count; i++) {
      const r = 9 + rng() * 22;
      const phi = Math.acos(2 * rng() - 1);
      const theta = rng() * Math.PI * 2;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      const pick = rng();
      const c = pick < 0.18 ? b : pick < 0.4 ? a : w;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const m = new THREE.PointsMaterial({
      size: 0.05,
      transparent: true,
      opacity: 0.62,
      sizeAttenuation: true,
      vertexColors: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { geom: g, mat: m };
  }, [count]);
  // We own these (passed via props), so dispose them ourselves.
  useEffect(() => () => {
    geom.dispose();
    mat.dispose();
  }, [geom, mat]);
  useFrame((_, dt) => {
    if (ref.current && !reduced) {
      const sp = slow ? 0.4 : 1;
      ref.current.rotation.y += dt * 0.01 * sp;
      ref.current.rotation.x += dt * 0.003 * sp;
    }
  });
  return <points ref={ref} geometry={geom} material={mat} />;
}

/* ---------------------------------------------------------------------- */
/* Constellation network — evenly-scattered nodes joined to near neighbours */
/* ---------------------------------------------------------------------- */

const CONSTELLATION_PALETTE = [C.cyanSoft, C.cyan, C.violet, C.white];

function buildConstellation(aspect: number, tier: QualityTier, seed: number) {
  const rng = mulberry32(seed);
  const portrait = aspect < 1;
  const z0 = -6.5;
  const hH = halfHeightAt(z0);
  const hW = hH * aspect;
  const cols = tier === "high" ? (portrait ? 4 : 6) : portrait ? 3 : 5;
  const rows = tier === "high" ? (portrait ? 6 : 4) : portrait ? 5 : 3;

  // Each node carries a position + a depth-dimmed colour (far = fainter),
  // so lines gradient between node colours and recede into the dark.
  const nodes: { pos: [number, number, number]; col: [number, number, number] }[] = [];
  const tmp = new THREE.Color();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = (((c + 0.5) / cols) * 2 - 1) * hW * 0.95;
      const cy = (((r + 0.5) / rows) * 2 - 1) * hH * 0.95;
      const jx = (rng() - 0.5) * (hW / cols) * 0.8;
      const jy = (rng() - 0.5) * (hH / rows) * 0.8;
      const z = z0 + (rng() - 0.5) * 3; // [-8, -5]
      const bright = 0.55 + 0.45 * Math.min(1, Math.max(0, (z + 8) / 3));
      tmp.set(CONSTELLATION_PALETTE[Math.floor(rng() * CONSTELLATION_PALETTE.length)]);
      nodes.push({ pos: [cx + jx, cy + jy, z], col: [tmp.r * bright, tmp.g * bright, tmp.b * bright] });
    }
  }

  // Connect each node to its 1–2 nearest neighbours within a radius.
  const maxDist = Math.max(hW / cols, hH / rows) * 1.7;
  const seen = new Set<string>();
  const pairs: [number, number][] = [];
  for (let i = 0; i < nodes.length; i++) {
    const near: [number, number][] = [];
    for (let j = 0; j < nodes.length; j++) {
      if (j === i) continue;
      const dx = nodes[i].pos[0] - nodes[j].pos[0];
      const dy = nodes[i].pos[1] - nodes[j].pos[1];
      const d = Math.hypot(dx, dy);
      if (d < maxDist) near.push([d, j]);
    }
    near.sort((a, b) => a[0] - b[0]);
    for (let n = 0; n < Math.min(2, near.length); n++) {
      const j = near[n][1];
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (!seen.has(key)) {
        seen.add(key);
        pairs.push([i, j]);
      }
    }
  }

  // Flat endpoint pairs + matching vertex colours for the fat <Line segments>.
  const linePoints: [number, number, number][] = [];
  const lineColors: [number, number, number][] = [];
  pairs.forEach(([a, b]) => {
    linePoints.push(nodes[a].pos, nodes[b].pos);
    lineColors.push(nodes[a].col, nodes[b].col);
  });
  // Node spark-dots — a touch brighter than the line endpoints.
  const dotPositions = new Float32Array(nodes.length * 3);
  const dotColors = new Float32Array(nodes.length * 3);
  nodes.forEach((n, i) => {
    dotPositions.set(n.pos, i * 3);
    dotColors[i * 3] = Math.min(1, n.col[0] * 1.35);
    dotColors[i * 3 + 1] = Math.min(1, n.col[1] * 1.35);
    dotColors[i * 3 + 2] = Math.min(1, n.col[2] * 1.35);
  });

  // Adjacency + node positions so energy pulses can walk the network graph.
  const adjacency: number[][] = nodes.map(() => []);
  pairs.forEach(([a, b]) => {
    adjacency[a].push(b);
    adjacency[b].push(a);
  });
  const nodePositions = nodes.map((n) => n.pos);
  return { linePoints, lineColors, dotPositions, dotColors, nodePositions, adjacency };
}

/* Energy pulses — bright glints that walk node-to-node along the network
 * graph, like data moving through it. Positions update in place each frame
 * (no per-frame allocation); only runs in motion. */
interface PulseSim {
  cur: Int32Array;
  nxt: Int32Array;
  spd: Float32Array;
  tt: Float32Array;
  n: number;
  rng: () => number;
}

function EnergyPulses({
  nodePositions,
  adjacency,
  reduced,
  slow,
}: {
  nodePositions: [number, number, number][];
  adjacency: number[][];
  reduced: boolean;
  slow: boolean;
}) {
  const ref = useRef<THREE.Points>(null);
  const { geom, mat, initSim } = useMemo(() => {
    const rng = mulberry32(0xc0ffee);
    const n = Math.min(14, Math.max(4, Math.round(adjacency.length * 0.5)));
    const positions = new Float32Array(n * 3);
    const cur = new Int32Array(n);
    const nxt = new Int32Array(n);
    const spd = new Float32Array(n);
    const tt = new Float32Array(n);
    const total = Math.max(1, nodePositions.length);
    for (let i = 0; i < n; i++) {
      let s = Math.floor(rng() * total);
      let tries = 0;
      while (adjacency[s] && adjacency[s].length === 0 && tries < 12) {
        s = Math.floor(rng() * total);
        tries++;
      }
      cur[i] = s;
      const adj = adjacency[s] ?? [];
      nxt[i] = adj.length ? adj[Math.floor(rng() * adj.length)] : s;
      spd[i] = 0.22 + rng() * 0.4;
      tt[i] = rng();
      const a = nodePositions[cur[i]];
      const b = nodePositions[nxt[i]];
      positions[i * 3] = a[0] + (b[0] - a[0]) * tt[i];
      positions[i * 3 + 1] = a[1] + (b[1] - a[1]) * tt[i];
      positions[i * 3 + 2] = a[2] + (b[2] - a[2]) * tt[i];
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const m = new THREE.PointsMaterial({
      color: new THREE.Color(C.cyanSoft),
      size: 0.2,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    return { geom: g, mat: m, initSim: { cur, nxt, spd, tt, n, rng } as PulseSim };
  }, [nodePositions, adjacency]);
  useEffect(() => () => {
    geom.dispose();
    mat.dispose();
  }, [geom, mat]);
  // Mutable sim lives in a ref so per-frame writes are ref-based (allowed);
  // re-sync when the graph (and thus the memo) changes.
  const simRef = useRef<PulseSim>(initSim);
  useEffect(() => {
    simRef.current = initSim;
  }, [initSim]);
  useFrame((_, dt) => {
    const points = ref.current;
    const sim = simRef.current;
    if (reduced || !points) return;
    const pos = points.geometry.attributes.position.array as Float32Array;
    const sp = slow ? 0.4 : 1;
    const n = Math.min(sim.n, (pos.length / 3) | 0);
    for (let i = 0; i < n; i++) {
      sim.tt[i] += dt * sim.spd[i] * sp;
      while (sim.tt[i] >= 1) {
        sim.tt[i] -= 1;
        sim.cur[i] = sim.nxt[i];
        const adj = adjacency[sim.cur[i]] ?? [];
        sim.nxt[i] = adj.length ? adj[Math.floor(sim.rng() * adj.length)] : sim.cur[i];
      }
      const a = nodePositions[sim.cur[i]];
      const b = nodePositions[sim.nxt[i]];
      pos[i * 3] = a[0] + (b[0] - a[0]) * sim.tt[i];
      pos[i * 3 + 1] = a[1] + (b[1] - a[1]) * sim.tt[i];
      pos[i * 3 + 2] = a[2] + (b[2] - a[2]) * sim.tt[i];
    }
    points.geometry.attributes.position.needsUpdate = true;
  });
  return <points ref={ref} geometry={geom} material={mat} />;
}

/* Constellation network — fat, additive, colour-gradient lines (drei <Line>
 * = Line2, so they have real width + glow, not 1px hardware lines) with
 * brighter spark-dots at the nodes. */
function Constellation({ tier, reduced, slow }: { tier: QualityTier; reduced: boolean; slow: boolean }) {
  // Debounced so the graph + pulses + fat-line geometry rebuild once on
  // resize-settle, not on every drag frame.
  const bucket = useDebouncedBucket();
  const dotMat = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 0.13,
        transparent: true,
        opacity: 0.9,
        sizeAttenuation: true,
        vertexColors: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    [],
  );
  useEffect(() => () => dotMat.dispose(), [dotMat]);
  const { linePoints, lineColors, dotGeom, nodePositions, adjacency } = useMemo(() => {
    const built = buildConstellation(bucket, tier, 9157);
    const dg = new THREE.BufferGeometry();
    dg.setAttribute("position", new THREE.BufferAttribute(built.dotPositions, 3));
    dg.setAttribute("color", new THREE.BufferAttribute(built.dotColors, 3));
    return {
      linePoints: built.linePoints,
      lineColors: built.lineColors,
      dotGeom: dg,
      nodePositions: built.nodePositions,
      adjacency: built.adjacency,
    };
  }, [bucket, tier]);
  useEffect(() => () => dotGeom.dispose(), [dotGeom]);
  return (
    <group>
      <Line
        segments
        points={linePoints}
        vertexColors={lineColors}
        lineWidth={1.7}
        transparent
        opacity={0.62}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
      <points geometry={dotGeom} material={dotMat} />
      {!reduced && (
        <EnergyPulses nodePositions={nodePositions} adjacency={adjacency} reduced={reduced} slow={slow} />
      )}
    </group>
  );
}

/* ---------------------------------------------------------------------- */
/* Crystal field                                                          */
/* ---------------------------------------------------------------------- */

type CrystalKind = "icosa" | "octa" | "dodeca" | "tetra";
interface CrystalData {
  position: [number, number, number];
  kind: CrystalKind;
  scale: number;
  color: string;
  opacity: number;
  sx: number;
  sy: number;
  bobPhase: number;
  bobAmp: number;
  bobFreq: number;
}

// Bias toward the geodesic icosphere — the dominant shape in the reference.
const WEIGHTED_KINDS: CrystalKind[] = ["icosa", "icosa", "icosa", "octa", "dodeca", "tetra"];

/* Build the seeded, evenly-distributed crystal field for a given aspect +
 * tier. Pure: same inputs → same field (so the frozen frame is balanced).
 * The mid band is a jittered grid across the whole frustum; the near band
 * is a few accents ringed to the frame edges, out of the central text box. */
function buildCrystals(aspect: number, tier: QualityTier, seed: number): CrystalData[] {
  const rng = mulberry32(seed);
  const portrait = aspect < 1;
  const out: CrystalData[] = [];

  // ---- MID band: jittered grid across the full frustum ----
  const midZ = -6;
  const hH = halfHeightAt(midZ);
  const hW = hH * aspect;
  let cols: number, rows: number, drop: number;
  if (tier === "high") {
    cols = portrait ? 3 : 4;
    rows = portrait ? 4 : 3;
    drop = 1;
  } else if (tier === "medium") {
    cols = 3;
    rows = 3;
    drop = 1;
  } else {
    cols = portrait ? 2 : 3;
    rows = portrait ? 3 : 2;
    drop = 0;
  }

  const cells: { x: number; y: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = (((c + 0.5) / cols) * 2 - 1) * hW * 0.92;
      const cy = (((r + 0.5) / rows) * 2 - 1) * hH * 0.92;
      const jx = (rng() - 0.5) * (hW / cols) * 0.7;
      const jy = (rng() - 0.5) * (hH / rows) * 0.7;
      cells.push({ x: cx + jx, y: cy + jy });
    }
  }

  // Drop the cell nearest the headline anchor (screen ~36% / 44%).
  const tax = -0.28 * hW;
  const tay = 0.12 * hH;
  if (drop > 0 && cells.length > 0) {
    let mi = 0;
    let md = Infinity;
    cells.forEach((p, i) => {
      const d = (p.x - tax) ** 2 + (p.y - tay) ** 2;
      if (d < md) {
        md = d;
        mi = i;
      }
    });
    cells.splice(mi, 1);
  }

  const cool = [C.cyanSoft, C.violet, C.white, C.cyan];
  const mid: CrystalData[] = cells.map((p, i) => {
    const z = midZ + (rng() - 0.5) * 4; // [-8, -4] — wider depth spread reads as deep space
    return {
      position: [p.x, p.y, z],
      kind: WEIGHTED_KINDS[Math.floor(rng() * WEIGHTED_KINDS.length)],
      scale: 0.42 + rng() * 0.34,
      color: cool[i % cool.length],
      opacity: 0.3 + rng() * 0.14,
      sx: (rng() - 0.5) * 0.14,
      sy: (rng() - 0.5) * 0.14,
      bobPhase: rng() * Math.PI * 2,
      bobAmp: 0.2,
      bobFreq: 0.22,
    };
  });

  // Exactly one gold + one lime accent, placed toward the right/edge cells
  // (away from the left/centre headline) so no warm hotspot forms on text.
  const byX = mid.map((_, i) => i).sort((a, c) => mid[c].position[0] - mid[a].position[0]);
  if (byX[0] !== undefined) mid[byX[0]].color = C.gold;
  if (byX[1] !== undefined) mid[byX[1]].color = C.lime;
  // Crystals nearest the headline get clamped to the faint end.
  mid.forEach((m) => {
    if (Math.hypot(m.position[0] - tax, m.position[1] - tay) < hW * 0.25) m.opacity = 0.22;
  });
  out.push(...mid);

  // ---- NEAR band: sparse accents ringed to the frame edges/corners ----
  const nearZ = -3.5;
  const hHn = halfHeightAt(nearZ);
  const hWn = hHn * aspect;
  const quads: [number, number][] = [
    [-1, 1],
    [1, 1],
    [-1, -1],
    [1, -1],
  ];
  let chosen: [number, number][];
  if (tier === "low") chosen = [quads[0], quads[3]];
  else if (tier === "medium") chosen = [quads[0], quads[1], quads[3]];
  else chosen = quads;

  const nearCool = [C.cyanSoft, C.violet, C.cyan];
  chosen.forEach((s, i) => {
    const x = s[0] * hWn * (0.72 + rng() * 0.1);
    const y = s[1] * hHn * (0.4 + rng() * 0.15);
    const z = -2.5 - rng() * 2; // [-4.5, -2.5] — nearest band, strongest parallax
    let color = nearCool[i % nearCool.length];
    if (s[0] > 0 && s[1] < 0) color = C.gold; // one warm spark, lower-right
    out.push({
      position: [x, y, z],
      kind: WEIGHTED_KINDS[Math.floor(rng() * WEIGHTED_KINDS.length)],
      scale: 0.7 + rng() * 0.45,
      color,
      opacity: 0.36 + rng() * 0.16,
      sx: 0.04 + rng() * 0.02,
      sy: 0.05 + rng() * 0.03,
      bobPhase: rng() * Math.PI * 2,
      bobAmp: 0.26,
      bobFreq: 0.26,
    });
  });

  return out;
}

/* A single geodesic crystal "orb" — a finely triangulated wireframe with
 * additive glowing edges + bright vertex spark-dots (so it reads as a
 * faceted network-sphere floating in space, like the reference), not a flat
 * low-poly shape. Shares one geometry per kind; drifts + gently bobs. */
function Crystal({
  data,
  geom,
  dotGeom,
  reduced,
  slow,
}: {
  data: CrystalData;
  geom: THREE.BufferGeometry;
  dotGeom: THREE.BufferGeometry;
  reduced: boolean;
  slow: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  // Accumulate scaled time so the bob (not just the spin) slows in gentle
  // mode without a phase jump when the speed changes.
  const bobT = useRef(0);
  useFrame((_, dt) => {
    if (!ref.current || reduced) return;
    const sp = slow ? 0.4 : 1;
    ref.current.rotation.x += dt * data.sx * sp;
    ref.current.rotation.y += dt * data.sy * sp;
    bobT.current += dt * sp;
    ref.current.position.y =
      data.position[1] + Math.sin(bobT.current * data.bobFreq + data.bobPhase) * data.bobAmp;
  });
  // Dots render once per real vertex now (deduped), so they need a higher
  // opacity to read as bright sparks than when ~5 stacked additively.
  const dotOpacity = Math.min(0.95, data.opacity * 3);
  return (
    <group ref={ref} position={data.position} scale={data.scale}>
      {/* Glowing triangulated edges. */}
      <mesh geometry={geom}>
        <meshBasicMaterial
          color={data.color}
          wireframe
          transparent
          opacity={data.opacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      {/* Bright spark-dots, one per real vertex (deduped point geometry). */}
      <points geometry={dotGeom}>
        <pointsMaterial
          color={data.color}
          size={data.scale * 0.09}
          transparent
          opacity={dotOpacity}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>
    </group>
  );
}

/* The even crystal field — distribution derived from live viewport aspect
 * so it fills the frame evenly on portrait / desktop / ultrawide. */
function CrystalField({ reduced, tier, slow }: { reduced: boolean; tier: QualityTier; slow: boolean }) {
  const size = useThree((s) => s.size);
  const aspect = size.width / Math.max(1, size.height);
  const bucket = Math.round(aspect * 100) / 100; // fine steps → smooth stretch on resize, no discrete pop
  // Geodesic subdivision by tier: the icosphere is the reference's hero
  // shape, so it gets the most facets the GPU can afford.
  const icoDetail = tier === "high" ? 2 : tier === "medium" ? 1 : 0;
  const octDetail = tier === "low" ? 0 : 1;
  const geoms = useMemo<Record<CrystalKind, THREE.BufferGeometry>>(
    () => ({
      icosa: new THREE.IcosahedronGeometry(1, icoDetail),
      octa: new THREE.OctahedronGeometry(1, octDetail),
      dodeca: new THREE.DodecahedronGeometry(1, 0),
      tetra: new THREE.TetrahedronGeometry(1, 0),
    }),
    [icoDetail, octDetail],
  );
  useEffect(() => () => {
    (Object.values(geoms) as THREE.BufferGeometry[]).forEach((g) => g.dispose());
  }, [geoms]);
  // Deduped position-only geometries for the spark-dots (one point per real
  // vertex, no face-corner duplicates).
  const dotGeoms = useMemo<Record<CrystalKind, THREE.BufferGeometry>>(
    () => ({
      icosa: dedupePositions(geoms.icosa),
      octa: dedupePositions(geoms.octa),
      dodeca: dedupePositions(geoms.dodeca),
      tetra: dedupePositions(geoms.tetra),
    }),
    [geoms],
  );
  useEffect(() => () => {
    (Object.values(dotGeoms) as THREE.BufferGeometry[]).forEach((g) => g.dispose());
  }, [dotGeoms]);
  const crystals = useMemo(() => buildCrystals(bucket, tier, 1337), [bucket, tier]);
  return (
    <group>
      {crystals.map((d, i) => (
        <Crystal key={i} data={d} geom={geoms[d.kind]} dotGeom={dotGeoms[d.kind]} reduced={reduced} slow={slow} />
      ))}
    </group>
  );
}

/* ---------------------------------------------------------------------- */
/* Nebula depth-clouds                                                    */
/* ---------------------------------------------------------------------- */

/* Procedural soft radial glow texture (white core → transparent edge). */
function makeGlowTexture() {
  const s = 128;
  const cv = document.createElement("canvas");
  cv.width = cv.height = s;
  const ctx = cv.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(cv);
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.45)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  return new THREE.CanvasTexture(cv);
}

const NEBULA = [
  { pos: [-9, 4.5, -15] as [number, number, number], size: 12, color: C.violet, opacity: 0.08 },
  { pos: [8.5, -3.5, -17] as [number, number, number], size: 14, color: C.cyan, opacity: 0.055 },
  { pos: [2.5, 6.5, -13.5] as [number, number, number], size: 9, color: C.pink, opacity: 0.05 },
  { pos: [-4, -6, -16] as [number, number, number], size: 11, color: C.cyanSoft, opacity: 0.05 },
];

/* Soft additive colour clouds deep behind everything — atmospheric depth so
 * the orbs feel suspended in space. Bloom-tier only (large additive fill). */
function NebulaClouds() {
  const tex = useMemo(() => makeGlowTexture(), []);
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <>
      {NEBULA.map((c, i) => (
        <sprite key={i} position={c.pos} scale={[c.size, c.size, 1]}>
          <spriteMaterial
            map={tex}
            color={c.color}
            transparent
            opacity={c.opacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </sprite>
      ))}
    </>
  );
}

/* ---------------------------------------------------------------------- */
/* Elegant elliptical rings                                               */
/* ---------------------------------------------------------------------- */

const RINGS = [
  { r: 15, color: C.cyan, opacity: 0.2, z: -13, rot: [1.32, 0.18, 0.4] as [number, number, number], speed: 0.012 },
  { r: 18, color: C.violet, opacity: 0.14, z: -16, rot: [1.18, -0.22, -0.35] as [number, number, number], speed: -0.009 },
  { r: 21, color: C.cyanSoft, opacity: 0.1, z: -19, rot: [1.46, 0.1, 0.08] as [number, number, number], speed: 0.006 },
];

type RingData = (typeof RINGS)[number];

/* A single elegant ring — a large, thin glowing torus seen at a tilt so it
 * reads as a wide ellipse sweeping the frame, not a focal loop. */
function ElegantRing({ rg, reduced, slow }: { rg: RingData; reduced: boolean; slow: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current && !reduced) ref.current.rotation.z += dt * rg.speed * (slow ? 0.4 : 1);
  });
  return (
    <mesh ref={ref} position={[0, 0, rg.z]} rotation={rg.rot}>
      <torusGeometry args={[rg.r, 0.03, 8, 128]} />
      <meshBasicMaterial
        color={rg.color}
        transparent
        opacity={rg.opacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

/* The elliptical rings — graceful arcs across the whole frame implying a
 * vast slow shell. Only ever rendered on bloom (medium/high). */
function ElegantRings({ reduced, slow }: { reduced: boolean; slow: boolean }) {
  return (
    <>
      {RINGS.map((rg, i) => (
        <ElegantRing key={i} rg={rg} reduced={reduced} slow={slow} />
      ))}
    </>
  );
}

/* Throttles the render loop to a target FPS. R3F "always" renders at the
 * monitor's refresh rate (60/120/144Hz) — a fullscreen bloom scene at 144Hz
 * is brutal. In "demand" mode we invalidate() at a fixed cadence instead, so
 * the whole scene (and its useFrame animations, which scale by dt) runs at
 * TARGET_FPS regardless of refresh rate. */
function RenderThrottle({ fps }: { fps: number }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    let raf = 0;
    let last = 0;
    const interval = 1000 / fps;
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (t - last >= interval) {
        last = t;
        invalidate();
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [fps, invalidate]);
  return null;
}

const TARGET_FPS = 30;

export default function CyberHeroes3DScene() {
  const reduced = usePrefersReducedMotion();
  const { belowHero, hidden } = usePageActivity();
  const q = useAdaptiveQuality();
  const pointer = usePointer(reduced);

  const dprMax = Math.min(q.dprCap, 1.1);
  const starCount = Math.max(60, Math.round(300 * q.particleMultiplier));
  // Keep animating the whole page; once below the hero, render GENTLY (slower
  // ambient motion + the heaviest effects dropped) rather than freezing. Stop
  // entirely only when the tab is hidden.
  const gentle = belowHero && !reduced;
  // Render on "demand" and drive it at TARGET_FPS via <RenderThrottle> (below),
  // instead of "always" (= uncapped monitor refresh). Reduced-motion also uses
  // demand but with no throttle → a single static frame. Hidden = never.
  const frameloop = hidden ? "never" : "demand";
  const heavyFx = q.blurAllowed && !gentle; // bloom + nebula clouds (costliest)

  return (
    <Canvas
      frameloop={frameloop}
      dpr={[1, dprMax]}
      camera={{ position: [0, 0, 12], fov: 55 }}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%", background: "transparent", pointerEvents: "none" }}
    >
      {/* Cap the loop to TARGET_FPS (skip when reduced-motion = static frame). */}
      {!reduced && !hidden && <RenderThrottle fps={TARGET_FPS} />}
      <CameraParallax pointer={pointer} reduced={reduced} />

      {/* Far, stable depth layers (camera pan only, no diorama tilt). */}
      {heavyFx && <NebulaClouds />}
      <Starfield count={starCount} reduced={reduced} slow={gentle} />
      {q.blurAllowed && <ElegantRings reduced={reduced} slow={gentle} />}

      {/* Near/mid layers swing toward the pointer for layered depth. The
          constellation is cheap so it stays on every tier; only the bloom +
          nebula + 128-seg rings are gated to medium/high. */}
      <ParallaxGroup pointer={pointer} reduced={reduced}>
        <CrystalField reduced={reduced} tier={q.tier} slow={gentle} />
        <Constellation tier={q.tier} reduced={reduced} slow={gentle} />
      </ParallaxGroup>

      {/* Bloom only where the GPU can afford it (medium/high), and only near
          the hero — dropped below the fold to keep the gentle pass cheap. */}
      {heavyFx && (
        <EffectComposer multisampling={0}>
          <Bloom
            mipmapBlur
            intensity={0.9}
            luminanceThreshold={0.16}
            luminanceSmoothing={0.9}
            radius={0.72}
          />
        </EffectComposer>
      )}
    </Canvas>
  );
}
