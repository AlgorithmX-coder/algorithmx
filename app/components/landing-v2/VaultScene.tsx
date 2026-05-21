"use client";

import { useMemo, useRef, Suspense } from "react";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { RoundedBox, Text, Environment, ContactShadows } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  DepthOfField,
  Vignette,
  Noise,
} from "@react-three/postprocessing";
import { KernelSize, BlendFunction } from "postprocessing";
import type { MotionValue } from "framer-motion";
import * as THREE from "three";

/**
 * VaultScene - "AX-1 silicon hologram" cinematic.
 *
 * A fully procedural holographic chip diorama. Pure 3D geometry +
 * emissive line edges, lit only by post-processing bloom against a
 * pure-ink void. Reads as a sci-fi engineering blueprint: a chunky
 * silicon substrate with a glowing cyan die, BGA pin grid below it,
 * a holographic circuit trace floor, and orbiting data nodes.
 *
 * No photo, no asset hunt - it's just maths and lines. That means it
 * is genuinely 3D from every angle and never breaks down into "a flat
 * thing on a plane".
 *
 *   Act 1  (0.00 - 0.10)  Closed chip rotating, hero shot
 *   Act 2  (0.10 - 0.30)  Camera lowers + orbits left
 *   Act 3  (0.30 - 0.55)  Lid lifts, die ignites, components rise
 *   Act 4  (0.55 - 0.78)  Camera pulls wide, exploded view, nodes orbit
 *   Act 5  (0.78 - 1.00)  Chip dissolves into particles, AX glyph forms
 */

const LV2 = {
  ink: "#04050d",
  /* Cool primary - electric cyan, brighter than before */
  cyan: "#00f5ff",
  cyanSoft: "#9ff5ff",
  cyanDeep: "#0084a0",
  /* Cool secondary - shifted from blue-violet toward pink-violet so it's
   * visually MUCH more distinctive against the cyan. */
  cosmic: "#a667ff",
  cosmicSoft: "#cba8ff",
  steel: "#b8c1d1",
  steelDark: "#3a4150",
  white: "#ffffff",
  /* Warm accents - energy / heat. Pushed more saturated. */
  gold: "#ffc94a",
  amber: "#ff7a3d",
  amberSoft: "#ffd07a",
  /* Hot magenta - rare highlight for priority / alert beats. Used
   * sparingly so it pops when it appears. */
  magenta: "#ff3ad6",
  /* Lime green - system-online accent. Used on a couple of code
   * snippets + occasional data nodes. */
  lime: "#5fffa3",
} as const;

const RIG_X = 1.9;

/* Floating code snippets that drift in 3D space around the chip. They
 * persist through acts 1-4 then dim during the AX glyph reveal. */
const CODE_SNIPPETS: { text: string; color: string }[] = [
  { text: "function encrypt(data, key) {", color: "#9ff5ff" },
  { text: "  const cipher = AES.cbc(data);", color: "#9ff5ff" },
  { text: "  return cipher.toBase64();", color: "#9ff5ff" },
  { text: "}", color: "#9ff5ff" },
  /* Highlights cycle through the accent palette to add colour variety */
  { text: "trainModel(dataset);", color: "#ffd07a" }, // amber soft
  { text: "deployToEdge(node);", color: "#cba8ff" }, // pink-violet
  { text: "const hash = SHA256(buf);", color: "#9ff5ff" },
  { text: "0x4A12-FF8C  AX-1", color: "#ffc94a" }, // gold
  { text: "verifyToken(jwt);", color: "#5fffa3" }, // lime - system online
  { text: "firewall.allow(443);", color: "#ff3ad6" }, // magenta - critical
  { text: "algorithmx.run();", color: "#00f5ff" }, // electric cyan
  { text: "parseHeaders(request);", color: "#9ff5ff" },
  { text: "scanPort(0x1F90);", color: "#ff3ad6" }, // magenta - alert
  { text: "encryptPayload(buffer);", color: "#5fffa3" }, // lime
];

interface VaultSceneProps {
  progress: MotionValue<number>;
  reducedMotion?: boolean;
}

export default function VaultScene({
  progress,
  reducedMotion = false,
}: VaultSceneProps) {
  return (
    <Canvas
      /* Higher DPR for retina sharpness on lines + text + edges. 2.5
       * cap keeps it from hammering low-end GPUs at 4K. */
      dpr={[1.5, 2.5]}
      camera={{ position: [0, 3.4, 7.6], fov: 34 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
      }}
      style={{
        width: "100%",
        height: "100%",
        background: "transparent",
        pointerEvents: "none",
      }}
    >
      <color attach="background" args={[LV2.ink]} />
      <fog attach="fog" args={[LV2.ink, 12, 30]} />

      {/* Studio HDR environment for real reflections on metal. Intensity
       *  tuned low so the dark scene isn't blown out; the reflections
       *  still pick up on brushed aluminium and the substrate. */}
      <Suspense fallback={null}>
        <Environment preset="studio" environmentIntensity={0.42} />
      </Suspense>

      {/* Three-point studio lighting */}
      <ambientLight intensity={0.32} color="#dde6ff" />
      <directionalLight
        position={[4, 8, 5]}
        intensity={1.0}
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
      />
      <pointLight position={[-3, 3, 4]} intensity={0.5} color={LV2.cyan} />
      <pointLight position={[3, 2, -3]} intensity={0.42} color={LV2.cosmic} />
      <spotLight
        position={[1.5, 6, 1.8]}
        angle={0.5}
        penumbra={0.85}
        intensity={1.6}
        color="#e9f3ff"
      />

      <Suspense fallback={null}>
        {/* Horizon glow sits far behind everything for atmospheric depth */}
        <HorizonGlow />
        {/* Light streaks live outside the rig group so they always
         *  read as flying past the camera regardless of orbit. */}
        <LightStreaks progress={progress} reducedMotion={reducedMotion} />
        <Diorama progress={progress} reducedMotion={reducedMotion} />
        {/* Real contact shadow grounds the chip on the grid */}
        <ContactShadows
          position={[RIG_X, -SUBSTRATE_H / 2 - 0.04, 0]}
          opacity={0.7}
          scale={9}
          blur={2.4}
          far={3}
          resolution={1024}
          color={LV2.ink}
        />
      </Suspense>

      <EffectComposer multisampling={4}>
        <Bloom
          intensity={0.95}
          luminanceThreshold={0.42}
          luminanceSmoothing={0.28}
          kernelSize={KernelSize.LARGE}
          mipmapBlur
        />
        <DepthOfField
          focusDistance={0.014}
          focalLength={0.022}
          bokehScale={reducedMotion ? 0 : 0.9}
          height={480}
        />
        <ChromaticAberration
          offset={new THREE.Vector2(0.0004, 0.0006)}
          radialModulation={false}
          modulationOffset={0.15}
        />
        <Noise opacity={0.018} blendFunction={BlendFunction.OVERLAY} />
        <Vignette
          eskil={false}
          offset={0.2}
          darkness={0.86}
          blendFunction={BlendFunction.NORMAL}
        />
      </EffectComposer>
    </Canvas>
  );
}

/* -------------------------------- DIORAMA -------------------------------- */

const SUBSTRATE_W = 3.0;
const SUBSTRATE_D = 3.0;
const SUBSTRATE_H = 0.32;
const DIE_W = 1.6;
const DIE_D = 1.6;
const PIN_GRID = 12;

function Diorama({
  progress,
  reducedMotion,
}: {
  progress: MotionValue<number>;
  reducedMotion: boolean;
}) {
  /* ---------- GEOMETRY MEMOS ---------- */
  const substrateEdges = useMemo(
    () =>
      new THREE.EdgesGeometry(
        new THREE.BoxGeometry(SUBSTRATE_W, SUBSTRATE_H, SUBSTRATE_D),
      ),
    [],
  );
  const dieEdges = useMemo(
    () => new THREE.EdgesGeometry(new THREE.BoxGeometry(DIE_W, 0.08, DIE_D)),
    [],
  );
  const lidEdges = useMemo(
    () =>
      new THREE.EdgesGeometry(
        new THREE.BoxGeometry(SUBSTRATE_W * 0.85, 0.18, SUBSTRATE_D * 0.85),
      ),
    [],
  );

  /* Circuit trace geometry - a holographic blueprint floor below the
   * substrate. Lines fan out from the die centre to the substrate edge
   * in a step / Manhattan pattern. */
  const traceLines = useMemo(() => {
    const lines: Array<[THREE.Vector3, THREE.Vector3]> = [];
    const buses = 32;
    const innerR = 0.85;
    const outerR = SUBSTRATE_W * 0.48;
    for (let i = 0; i < buses; i++) {
      const angle = (i / buses) * Math.PI * 2 + Math.PI / buses;
      const fromX = Math.cos(angle) * innerR;
      const fromZ = Math.sin(angle) * innerR;
      const toX = Math.cos(angle) * outerR;
      const toZ = Math.sin(angle) * outerR;
      /* Step pattern: from -> mid (90deg jog) -> to */
      const midF = 0.55;
      const midX = fromX + (toX - fromX) * midF;
      const midZ = fromZ + (toZ - fromZ) * midF;
      lines.push([
        new THREE.Vector3(fromX, -SUBSTRATE_H / 2 - 0.01, fromZ),
        new THREE.Vector3(midX, -SUBSTRATE_H / 2 - 0.01, midZ),
      ]);
      lines.push([
        new THREE.Vector3(midX, -SUBSTRATE_H / 2 - 0.01, midZ),
        new THREE.Vector3(toX, -SUBSTRATE_H / 2 - 0.01, toZ),
      ]);
    }
    /* Inner ring around the die - 4 ortho L-paths */
    const ring = 0.95;
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        lines.push([
          new THREE.Vector3(sx * ring, -SUBSTRATE_H / 2 - 0.01, sz * 0.1),
          new THREE.Vector3(sx * ring, -SUBSTRATE_H / 2 - 0.01, sz * ring),
        ]);
        lines.push([
          new THREE.Vector3(sx * 0.1, -SUBSTRATE_H / 2 - 0.01, sz * ring),
          new THREE.Vector3(sx * ring, -SUBSTRATE_H / 2 - 0.01, sz * ring),
        ]);
      }
    }
    /* Flatten into BufferGeometry positions */
    const positions: number[] = [];
    for (const [a, b] of lines) {
      positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
    return {
      positions: new Float32Array(positions),
      count: lines.length,
    };
  }, []);

  const traceGeom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(traceLines.positions, 3),
    );
    return g;
  }, [traceLines]);

  /* ---------- PIN GRID INSTANCES ---------- */
  const pinMatrix = useMemo(() => new THREE.Matrix4(), []);
  const pinsRef = useRef<THREE.InstancedMesh>(null);
  const pinSpacing = useMemo(
    () => (SUBSTRATE_W * 0.78) / (PIN_GRID - 1),
    [],
  );
  const pinStart = useMemo(() => -(SUBSTRATE_W * 0.78) / 2, []);

  /* ---------- ORBITING DATA NODES ---------- */
  const dataNodes = useMemo(() => {
    const count = reducedMotion ? 18 : 36;
    const nodes: Array<{
      orbit: number;
      tilt: number;
      speed: number;
      phase: number;
      size: number;
      colour: THREE.Color;
    }> = [];
    const cyan = new THREE.Color(LV2.cyan);
    const cosmic = new THREE.Color(LV2.cosmic);
    const gold = new THREE.Color(LV2.gold);
    const magenta = new THREE.Color(LV2.magenta);
    const lime = new THREE.Color(LV2.lime);
    for (let i = 0; i < count; i++) {
      /* Distribution:
       *   45% electric cyan
       *   25% pink-violet
       *   15% gold
       *   10% magenta (priority alerts)
       *   5% lime (system-online) */
      const roll = Math.random();
      const c =
        roll < 0.45
          ? cyan
          : roll < 0.7
            ? cosmic
            : roll < 0.85
              ? gold
              : roll < 0.95
                ? magenta
                : lime;
      nodes.push({
        orbit: 3.2 + Math.random() * 2.4,
        tilt: (Math.random() - 0.5) * 1.6,
        speed: 0.05 + Math.random() * 0.18,
        phase: Math.random() * Math.PI * 2,
        size: 0.05 + Math.random() * 0.05,
        colour: c,
      });
    }
    return nodes;
  }, [reducedMotion]);

  const nodeRefs = useRef<(THREE.Mesh | null)[]>([]);

  /* ---------- STAR/PARTICLE FIELD ---------- */
  const starCount = reducedMotion ? 240 : 480;
  const { starGeom, starPhase } = useMemo(() => {
    const positions = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    const phase = new Float32Array(starCount);
    for (let i = 0; i < starCount; i++) {
      const r = 7 + Math.random() * 14;
      const theta = Math.random() * Math.PI * 2;
      const yspan = (Math.random() - 0.5) * 9;
      positions[i * 3 + 0] = Math.cos(theta) * r;
      positions[i * 3 + 1] = yspan;
      positions[i * 3 + 2] = Math.sin(theta) * r;
      sizes[i] = 0.03 + Math.random() * 0.08;
      phase[i] = Math.random() * Math.PI * 2;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    return { starGeom: g, starPhase: phase };
  }, [starCount]);

  const starTexture = useMemo(() => makeStarTexture(), []);
  const brushedNormal = useMemo(() => makeBrushedNormal(), []);
  const dieFloorplan = useMemo(() => makeDieFloorplan(), []);
  /* Real CPU photograph used as the lid skin - the gold LGA pad pattern
   * from a real Intel chip. Adds photographic realism to the lid surface
   * that can't be matched procedurally. Cropped via UV transform. */
  const chipLidPhoto = useLoader(THREE.TextureLoader, "/landing-v2/chip-lid.jpg");
  useMemo(() => {
    chipLidPhoto.colorSpace = THREE.SRGBColorSpace;
    chipLidPhoto.anisotropy = 16;
    chipLidPhoto.minFilter = THREE.LinearMipmapLinearFilter;
    chipLidPhoto.magFilter = THREE.LinearFilter;
    /* Crop tightly to the central gold-pad region of the photo so we
     * don't see the surrounding desk/background. */
    chipLidPhoto.repeat.set(0.66, 0.66);
    chipLidPhoto.offset.set(0.17, 0.18);
    chipLidPhoto.needsUpdate = true;
  }, [chipLidPhoto]);

  /* ---------- AX GLYPH PARTICLES ---------- */
  const glyphCount = reducedMotion ? 420 : 780;
  const { glyphTarget, glyphSource } = useMemo(() => {
    const source = new Float32Array(glyphCount * 3);
    /* Source: scattered through the chip volume so they appear to
     * burst outward from the silicon. */
    for (let i = 0; i < glyphCount; i++) {
      source[i * 3 + 0] = (Math.random() - 0.5) * SUBSTRATE_W;
      source[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
      source[i * 3 + 2] = (Math.random() - 0.5) * SUBSTRATE_D;
    }
    const target: number[] = [];
    const pushLine = (
      from: [number, number],
      to: [number, number],
      n: number,
    ) => {
      for (let k = 0; k < n; k++) {
        const t = k / Math.max(1, n - 1);
        target.push(
          from[0] + (to[0] - from[0]) * t + (Math.random() - 0.5) * 0.014,
          from[1] + (to[1] - from[1]) * t + (Math.random() - 0.5) * 0.014,
          (Math.random() - 0.5) * 0.03,
        );
      }
    };
    const Aw = 1.15;
    const Ah = 1.85;
    const Ax = -1.2;
    const Ay = -Ah / 2 + 0.05;
    pushLine([Ax, Ay], [Ax + Aw / 2, Ay + Ah], Math.floor(glyphCount * 0.22));
    pushLine(
      [Ax + Aw / 2, Ay + Ah],
      [Ax + Aw, Ay],
      Math.floor(glyphCount * 0.22),
    );
    pushLine(
      [Ax + Aw * 0.18, Ay + Ah * 0.42],
      [Ax + Aw * 0.82, Ay + Ah * 0.42],
      Math.floor(glyphCount * 0.1),
    );
    const Xw = 1.15;
    const Xh = 1.85;
    const Xx = 0.2;
    const Xy = -Xh / 2 + 0.05;
    pushLine([Xx, Xy], [Xx + Xw, Xy + Xh], Math.floor(glyphCount * 0.23));
    pushLine([Xx + Xw, Xy], [Xx, Xy + Xh], Math.floor(glyphCount * 0.23));
    while (target.length / 3 < glyphCount) target.push(0, 0, 0);
    return {
      glyphTarget: new Float32Array(target.slice(0, glyphCount * 3)),
      glyphSource: source,
    };
  }, [glyphCount]);

  const glyphGeom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(glyphSource.slice(), 3),
    );
    return g;
  }, [glyphSource]);

  /* ---------- REFS ---------- */
  const rig = useRef<THREE.Group>(null);
  const parallax = useRef<THREE.Group>(null);
  const chip = useRef<THREE.Group>(null);
  const lidGroup = useRef<THREE.Group>(null);
  const dieGroup = useRef<THREE.Group>(null);
  const dieMat = useRef<THREE.MeshStandardMaterial>(null);
  const dieEdgeMat = useRef<THREE.LineBasicMaterial>(null);
  const traceMat = useRef<THREE.LineBasicMaterial>(null);
  const substrateMat = useRef<THREE.MeshPhysicalMaterial>(null);
  const substrateEdgeMat = useRef<THREE.LineBasicMaterial>(null);
  const lidMat = useRef<THREE.MeshPhysicalMaterial>(null);
  const glyphPoints = useRef<THREE.Points>(null);
  const stars = useRef<THREE.Points>(null);

  const { pointer } = useThree();

  /* ---------- FRAME LOOP ---------- */
  useFrame((state) => {
    const p = progress.get();
    const t = state.clock.elapsedTime;

    const a2 = smoothstep(0.1, 0.3, p);
    const a3 = smoothstep(0.3, 0.55, p);
    const a4 = smoothstep(0.55, 0.78, p);
    const a5 = smoothstep(0.78, 1.0, p);

    /* Mouse parallax */
    if (parallax.current) {
      parallax.current.rotation.y = THREE.MathUtils.lerp(
        parallax.current.rotation.y,
        pointer.x * 0.08,
        0.04,
      );
      parallax.current.rotation.x = THREE.MathUtils.lerp(
        parallax.current.rotation.x,
        -pointer.y * 0.05,
        0.04,
      );
    }

    /* Continuous chip yaw + slight pitch breathing - the chip is
     * always alive. */
    if (chip.current) {
      const baseYaw = t * 0.18;
      const scrollYaw =
        lerp(0, -0.6, a2) + lerp(0, -0.2, a3) + lerp(0, 0.8, a4) + lerp(0, 0.2, a5);
      chip.current.rotation.y = baseYaw + scrollYaw;
      chip.current.rotation.x =
        -0.18 + Math.sin(t * 0.55) * 0.025 + lerp(0, -0.06, a3);
      /* Slight float */
      chip.current.position.y = Math.sin(t * 0.8) * 0.03 + lerp(0, 0.15, a4);
    }

    /* Camera - constrained orbit on the right composition (rig at
     * RIG_X), lookAt biased LEFT of rig so rig sits right-of-centre. */
    const camAz =
      lerp(0.0, -0.35, a2) + lerp(0, -0.15, a3) + lerp(0, 0.6, a4) + lerp(0, -0.4, a5);
    const camEl =
      lerp(0.42, 0.32, a2) + lerp(0, 0.1, a3) + lerp(0, 0.18, a4) + lerp(0, 0.05, a5);
    const camR =
      lerp(8.4, 6.4, a2) + lerp(0, -0.4, a3) + lerp(0, 2.4, a4) + lerp(0, -1.6, a5);
    const ground = Math.cos(camEl) * camR;
    state.camera.position.set(
      RIG_X + Math.sin(camAz) * ground,
      Math.max(0.6, Math.sin(camEl) * camR),
      Math.cos(camAz) * ground,
    );
    const lookX = RIG_X - 0.6 + lerp(0, -1.4, a5);
    const lookY = lerp(0, 0.25, a3) + lerp(0, 0.6, a5);
    state.camera.lookAt(lookX, lookY, 0);

    /* LID lift + tilt during act 2-3 */
    if (lidGroup.current) {
      const lift = lerp(0, 1.6, a2) + lerp(0, 1.2, a4);
      const tilt = lerp(0, 0.5, a2);
      const drift = lerp(0, 0.9, a2) + lerp(0, 0.9, a4);
      lidGroup.current.position.y = SUBSTRATE_H / 2 + 0.18 / 2 + lift;
      lidGroup.current.position.x = drift;
      lidGroup.current.rotation.x = -tilt;
      lidGroup.current.rotation.z = lerp(0, -0.32, a2);
      /* Fade lid during act 5 */
      const op = 1 - a5;
      if (lidMat.current) {
        lidMat.current.transparent = true;
        lidMat.current.opacity = op;
      }
    }

    /* DIE ignite - emissive ramps in act 3 and warms from cyan toward
     * amber as it reaches peak intensity, like silicon heating under
     * load. Cools back to cyan in act 5 as the chip dissolves. */
    if (dieMat.current) {
      dieMat.current.emissiveIntensity =
        lerp(0.02, 1.7, a3) * (1 - a5 * 0.55);
      const heat = clamp01(a3) * (1 - a5);
      const hot = new THREE.Color(LV2.amber);
      const cool = new THREE.Color(LV2.cyan);
      dieMat.current.emissive.copy(cool).lerp(hot, heat * 0.55);
    }
    if (dieEdgeMat.current) {
      dieEdgeMat.current.opacity = 0.85 * (1 - a5 * 0.5);
    }
    if (traceMat.current) {
      const pulse = 0.6 + Math.sin(t * 2.6) * 0.18;
      traceMat.current.opacity = lerp(0.25, pulse, a3) * (1 - a5 * 0.6);
    }
    if (dieGroup.current) {
      dieGroup.current.position.y = lerp(0, 0.15, a3) + lerp(0, 0.5, a4);
      dieGroup.current.scale.setScalar(1 - a5 * 0.5);
    }

    /* Substrate + edges fade during act 5 */
    if (substrateMat.current) {
      substrateMat.current.transparent = true;
      substrateMat.current.opacity = 1 - a5 * 0.92;
    }
    if (substrateEdgeMat.current) {
      substrateEdgeMat.current.opacity = 0.9 * (1 - a5 * 0.85);
    }

    /* PIN GRID - subtle ripple, fall away during exploded view (act 4) */
    if (pinsRef.current) {
      for (let r = 0; r < PIN_GRID; r++) {
        for (let c = 0; c < PIN_GRID; c++) {
          const i = r * PIN_GRID + c;
          const restY = -SUBSTRATE_H / 2 - 0.045;
          const ripple =
            Math.sin((r + c) * 0.55 - t * 1.6) * 0.04 * (1 - a4);
          const fall = lerp(0, -1.6 - ((i * 37) % 9) * 0.1, a4);
          pinMatrix.makeTranslation(
            pinStart + c * pinSpacing,
            restY + ripple + fall,
            pinStart + r * pinSpacing,
          );
          pinsRef.current.setMatrixAt(i, pinMatrix);
        }
      }
      pinsRef.current.instanceMatrix.needsUpdate = true;
      const mat = pinsRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.transparent = true;
        mat.opacity = 1 - a5;
      }
    }

    /* Orbiting data nodes - the holographic atmosphere */
    for (let i = 0; i < dataNodes.length; i++) {
      const n = dataNodes[i];
      const ref = nodeRefs.current[i];
      if (!ref) continue;
      const angle = t * n.speed + n.phase;
      const orbitR = n.orbit + lerp(0, 1.2, a4) - lerp(0, 1.4, a5);
      const x = Math.cos(angle) * orbitR;
      const z = Math.sin(angle) * orbitR;
      const y = Math.sin(angle * 1.4 + n.tilt) * n.tilt;
      ref.position.set(x, y, z);
      const mat = ref.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.transparent = true;
        mat.opacity = (0.6 + Math.sin(t * 1.8 + n.phase) * 0.3) * (1 - a5 * 0.6);
      }
    }

    /* Star field twinkle */
    if (stars.current) {
      const sizes = stars.current.geometry.attributes
        .size as THREE.BufferAttribute;
      const a = sizes.array as Float32Array;
      for (let i = 0; i < starCount; i++) {
        const base = 0.04 + ((i * 7) % 9) * 0.01;
        a[i] = base * (0.7 + Math.sin(t * 1.4 + starPhase[i]) * 0.3);
      }
      sizes.needsUpdate = true;
      stars.current.rotation.y = t * 0.012;
    }

    /* AX GLYPH assemble */
    if (glyphPoints.current) {
      const attr = glyphPoints.current.geometry.attributes
        .position as THREE.BufferAttribute;
      const a = attr.array as Float32Array;
      const eased = smoothstep(0, 1, a5);
      for (let i = 0; i < glyphCount * 3; i++) {
        a[i] = lerp(glyphSource[i], glyphTarget[i], eased);
      }
      attr.needsUpdate = true;
      const mat = glyphPoints.current.material as THREE.PointsMaterial;
      mat.opacity = clamp01(a5 * 1.1);
      mat.size = 0.055 + a5 * 0.04;
      const scale = 1 + Math.sin(t * 1.9) * 0.012 * a5;
      glyphPoints.current.scale.setScalar(scale);
      /* Position the glyph in the foreground LEFT of the rig so it
       * sits alongside the headline column, not over the rig. */
      glyphPoints.current.position.set(
        lerp(0, -0.8, a5),
        lerp(0.4, 1.1, a5),
        lerp(0, 1.8, a5),
      );
    }
  });

  return (
    <group ref={parallax}>
      <group ref={rig} position={[RIG_X, 0, 0]}>
        {/* Holographic horizontal grid floor under the chip */}
        <HoloGrid />

        <group ref={chip}>
          {/* CENTRAL CHIP - the AX-1 silicon hero anchor.
           *  All the original premium chip cinematic geometry: ceramic
           *  substrate, brushed-aluminium lid with the real CPU photo,
           *  engraved ALGORITHMX brand, silicon die with floorplan,
           *  BGA gold pin grid, edge LEDs, board-dressing components. */}
          <RoundedBox
            args={[SUBSTRATE_W, SUBSTRATE_H, SUBSTRATE_D]}
            radius={0.05}
            smoothness={4}
            castShadow
          >
            <meshPhysicalMaterial
              ref={substrateMat}
              color="#11141e"
              metalness={0.38}
              roughness={0.55}
              clearcoat={0.7}
              clearcoatRoughness={0.32}
              envMapIntensity={0.9}
            />
          </RoundedBox>
          <lineSegments geometry={substrateEdges}>
            <lineBasicMaterial
              ref={substrateEdgeMat}
              color={LV2.cyan}
              transparent
              opacity={0.22}
              toneMapped={false}
              blending={THREE.AdditiveBlending}
            />
          </lineSegments>
          <group ref={lidGroup}>
            <RoundedBox
              args={[SUBSTRATE_W * 0.85, 0.18, SUBSTRATE_D * 0.85]}
              radius={0.04}
              smoothness={4}
              castShadow
            >
              <meshPhysicalMaterial
                ref={lidMat}
                color={LV2.steel}
                metalness={1.0}
                roughness={0.32}
                clearcoat={0.9}
                clearcoatRoughness={0.18}
                anisotropy={0.7}
                anisotropyRotation={0}
                normalMap={brushedNormal}
                normalScale={new THREE.Vector2(0.18, 0.18)}
                envMapIntensity={1.6}
              />
            </RoundedBox>
            <lineSegments geometry={lidEdges}>
              <lineBasicMaterial
                color={LV2.cyanSoft}
                transparent
                opacity={0.18}
                toneMapped={false}
                blending={THREE.AdditiveBlending}
              />
            </lineSegments>
            <mesh
              position={[0, SUBSTRATE_H / 2 + 0.18 + 0.001, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry
                args={[SUBSTRATE_W * 0.78, SUBSTRATE_D * 0.78]}
              />
              <meshStandardMaterial
                map={chipLidPhoto}
                metalness={0.42}
                roughness={0.55}
              />
            </mesh>
            <Text
              position={[0, SUBSTRATE_H / 2 + 0.18 + 0.004, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={0.2}
              letterSpacing={0.08}
              fontWeight={700}
              color={LV2.cyan}
              anchorX="center"
              anchorY="middle"
              outlineColor={LV2.ink}
              outlineWidth={0.008}
              outlineOpacity={0.95}
            >
              ALGORITHMX
            </Text>
            <Text
              position={[0, SUBSTRATE_H / 2 + 0.18 + 0.004, 0.42]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={0.08}
              letterSpacing={0.18}
              color={LV2.cyanSoft}
              anchorX="center"
              anchorY="middle"
              outlineColor={LV2.ink}
              outlineWidth={0.005}
              outlineOpacity={0.9}
            >
              AX-1  /  CYBER  /  0x4A12-FF8C
            </Text>
            <LidScanLine />
          </group>
          <group ref={dieGroup}>
            <mesh position={[0, SUBSTRATE_H / 2 + 0.04, 0]}>
              <boxGeometry args={[DIE_W, 0.08, DIE_D]} />
              <meshStandardMaterial
                ref={dieMat}
                color="#050813"
                metalness={0.55}
                roughness={0.4}
                map={dieFloorplan.diffuse}
                emissiveMap={dieFloorplan.emissive}
                emissive={LV2.cyan}
                emissiveIntensity={0}
              />
            </mesh>
            <lineSegments
              geometry={dieEdges}
              position={[0, SUBSTRATE_H / 2 + 0.04, 0]}
            >
              <lineBasicMaterial
                ref={dieEdgeMat}
                color={LV2.cyan}
                transparent
                opacity={0.35}
                toneMapped={false}
                blending={THREE.AdditiveBlending}
              />
            </lineSegments>
            <DieCoreLattice yOffset={SUBSTRATE_H / 2 + 0.045} />
          </group>
          <instancedMesh
            ref={pinsRef}
            args={[undefined, undefined, PIN_GRID * PIN_GRID]}
          >
            <sphereGeometry args={[0.05, 12, 12]} />
            <meshStandardMaterial
              color="#c89a4e"
              metalness={0.95}
              roughness={0.22}
              emissive="#c89a4e"
              emissiveIntensity={0.18}
            />
          </instancedMesh>
          <lineSegments geometry={traceGeom}>
            <lineBasicMaterial
              ref={traceMat}
              color={LV2.cyan}
              transparent
              opacity={0.5}
              toneMapped={false}
              blending={THREE.AdditiveBlending}
            />
          </lineSegments>
          <RadarSweep />
          <ChipLeds progress={progress} />
          <BgaPinGrid progress={progress} />
          <BoardDressing progress={progress} />

          {/* SIX SUBJECT SATELLITES orbiting the central chip - one per
           *  AlgorithmX stream. Each is a small crystal node with its
           *  accent colour + billboard label + spoke connecting it back
           *  to the chip. Tells the story: "this chip powers six fields
           *  of technology education." */}
          {NODE_DATA.map((n, i) => (
            <SubjectNode
              key={n.id}
              data={n}
              index={i}
              progress={progress}
            />
          ))}

          {/* Network lines: hex perimeter (6) + diameters (3) + spokes
           *  from chip centre to each satellite (6). */}
          <NetworkLines progress={progress} />

          {/* Energy pulses flowing along network + spokes */}
          <EnergyPulses progress={progress} />
        </group>

        {/* Orbiting holographic data nodes - small glowing dots that
         *  drift around the chip on tilted orbital paths. */}
        {dataNodes.map((n, i) => (
          <mesh
            key={i}
            ref={(el) => {
              nodeRefs.current[i] = el;
            }}
          >
            <sphereGeometry args={[n.size, 8, 8]} />
            <meshBasicMaterial
              color={n.colour}
              transparent
              opacity={0.7}
              toneMapped={false}
            />
          </mesh>
        ))}

        {/* Constellation lines between nearby data nodes - live
         *  network-graph effect. */}
        <Constellations nodeRefs={nodeRefs} />

        {/* Floating code snippets in 3D space - cyber atmosphere */}
        <CodeSwarm progress={progress} reducedMotion={reducedMotion} />

        {/* Live HUD readouts beside the chip */}
        <HudReadouts progress={progress} />

        {/* Circuit-trace pulses flowing around the chip */}
        <TracePulses count={28} radius={SUBSTRATE_W * 0.48} />

        {/* Data-stream transformation chip -> AX glyph (act 4-5) */}
        <DataStream
          progress={progress}
          targetGetter={() =>
            glyphPoints.current
              ? glyphPoints.current.position
              : new THREE.Vector3(0, 0.4, 0)
          }
        />

        {/* Star field - distant particles for ambient depth */}
        <points ref={stars} geometry={starGeom}>
          <pointsMaterial
            map={starTexture}
            color={LV2.cyanSoft}
            transparent
            opacity={0.75}
            sizeAttenuation
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </points>

        {/* AX glyph particles */}
        <points ref={glyphPoints} position={[0, 0.4, 0]}>
          <primitive object={glyphGeom} attach="geometry" />
          <pointsMaterial
            map={starTexture}
            color={LV2.cyanSoft}
            size={0.055}
            transparent
            opacity={0}
            sizeAttenuation
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </points>
      </group>
    </group>
  );
}

/* -------------------------------------------------------------------------- *
 * SIX-NODE SUBJECT CONSTELLATION
 *
 * The central visual: six glowing hexagonal nodes - one per AlgorithmX
 * subject - arranged on a hexagon in 3D space, connected by a network of
 * glowing edges with energy pulses flowing between them. Maps directly to
 * the brand promise "Six streams of technology education." Multi-age
 * friendly, not engineer-coded, reuses all atmospheric scaffolding.
 * -------------------------------------------------------------------------- */
/* Satellites orbit at this radius so they sit comfortably outside the
 * chip body (substrate half-width ~1.5 + board dressing extends to ~2.6). */
const HEX_R = 3.2;
const SAT_Y = 0.4;
const NODE_DATA: Array<{
  id: string;
  code: string;
  title: string;
  age: string;
  status: string;
  color: string;
}> = [
  {
    id: "cyber",
    code: "CYBER",
    title: "Cybersecurity",
    age: "AGES 6 - ADULT",
    status: "LIVE",
    color: "#00f5ff",
  },
  {
    id: "games",
    code: "GAMES",
    title: "Game Development",
    age: "AGES 8 - ADULT",
    status: "2026",
    color: "#5fffa3",
  },
  {
    id: "ai",
    code: "AI",
    title: "AI / Machine Learning",
    age: "AGES 10 - ADULT",
    status: "2026",
    color: "#a667ff",
  },
  {
    id: "apps",
    code: "APPS",
    title: "App Development",
    age: "AGES 10 - ADULT",
    status: "2027",
    color: "#ff7a3d",
  },
  {
    id: "biz",
    code: "BIZ",
    title: "Tech Entrepreneurship",
    age: "AGES 14 - ADULT",
    status: "2027",
    color: "#ffc94a",
  },
  {
    id: "robo",
    code: "ROBO",
    title: "Robotic Engineering",
    age: "AGES 8 - ADULT",
    status: "2027",
    color: "#ff3ad6",
  },
];

function nodeAngle(i: number) {
  return -Math.PI / 2 + (i / NODE_DATA.length) * Math.PI * 2;
}
function nodePos(i: number): [number, number, number] {
  const a = nodeAngle(i);
  return [Math.cos(a) * HEX_R, SAT_Y, Math.sin(a) * HEX_R];
}

function SubjectNode({
  data,
  index,
  progress,
}: {
  data: (typeof NODE_DATA)[number];
  index: number;
  progress: MotionValue<number>;
}) {
  const root = useRef<THREE.Group>(null);
  const labelGroup = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const [bx, by, bz] = nodePos(index);
  /* Each satellite ignites at its own scroll cue. Staggered after the
   * chip's edge LEDs so the cascade reads: chip boots -> subjects light up. */
  const trigger = 0.32 + index * 0.025;

  useFrame((state) => {
    const root_ = root.current;
    if (!root_) return;
    const p = progress.get();
    const t = state.clock.elapsedTime;
    const lit = smoothstep(trigger, trigger + 0.05, p);
    const a4 = smoothstep(0.55, 0.82, p);
    const a5 = smoothstep(0.78, 1.0, p);

    /* Gentle bob + orbital drift so satellites feel alive */
    const orbitAng = nodeAngle(index) + t * 0.06;
    const bobY = Math.sin(t * 0.55 + index * 1.3) * 0.08;
    const explodeR = a4 * 1.2;
    root_.position.x = Math.cos(orbitAng) * (HEX_R + explodeR);
    root_.position.z = Math.sin(orbitAng) * (HEX_R + explodeR);
    root_.position.y = by + bobY + a4 * 0.5;
    /* Slow tumble of the crystal itself */
    root_.rotation.y = t * 0.4;
    root_.rotation.x = t * 0.22;

    /* Emissive ignition with breathing pulse */
    if (matRef.current) {
      const breathe = 0.9 + Math.sin(t * 1.7 + index * 0.7) * 0.22;
      const fade = 1 - a5 * 0.85;
      matRef.current.emissiveIntensity = lit * breathe * 2.2 * fade;
    }
    if (haloRef.current) {
      const mat = haloRef.current.material as THREE.MeshBasicMaterial;
      const breathe = 0.85 + Math.sin(t * 1.3 + index) * 0.15;
      mat.opacity = lit * breathe * 0.65 * (1 - a5 * 0.75);
    }
    /* Billboard the label group so text always faces the camera. */
    if (labelGroup.current) {
      labelGroup.current.lookAt(state.camera.position);
      labelGroup.current.traverse((c) => {
        const m = (c as THREE.Mesh).material as THREE.Material | undefined;
        if (m && "opacity" in m) {
          (m as THREE.Material & { opacity: number }).transparent = true;
          (m as THREE.Material & { opacity: number }).opacity =
            lit * (1 - a5 * 0.92);
        }
      });
    }
  });

  return (
    <group ref={root} position={[bx, by, bz]}>
      {/* Crystal body - faceted icosahedron, reads as gemstone */}
      <mesh castShadow>
        <icosahedronGeometry args={[0.34, 0]} />
        <meshStandardMaterial
          ref={matRef}
          color={data.color}
          metalness={0.4}
          roughness={0.28}
          emissive={data.color}
          emissiveIntensity={0}
        />
      </mesh>
      {/* Wireframe overlay edges for that crystal facet look */}
      <mesh>
        <icosahedronGeometry args={[0.345, 0]} />
        <meshBasicMaterial
          color={data.color}
          wireframe
          transparent
          opacity={0.55}
          toneMapped={false}
        />
      </mesh>
      {/* Halo glow disc behind the crystal (always faces camera) */}
      <mesh
        ref={haloRef}
        position={[0, 0, 0]}
      >
        <sphereGeometry args={[0.55, 16, 16]} />
        <meshBasicMaterial
          color={data.color}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      {/* Label cluster - billboarded so it always reads */}
      <group ref={labelGroup} position={[0, 0.6, 0]}>
        <Text
          fontSize={0.14}
          fontWeight={700}
          letterSpacing={0.08}
          color={data.color}
          anchorX="center"
          anchorY="middle"
          outlineColor={LV2.ink}
          outlineWidth={0.012}
          outlineOpacity={0.96}
        >
          {data.code}
        </Text>
        <Text
          position={[0, -0.18, 0]}
          fontSize={0.07}
          fontWeight={600}
          color="#e8edff"
          anchorX="center"
          anchorY="middle"
          maxWidth={2}
          outlineColor={LV2.ink}
          outlineWidth={0.008}
          outlineOpacity={0.92}
        >
          {data.title}
        </Text>
        <Text
          position={[0, -0.31, 0]}
          fontSize={0.05}
          letterSpacing={0.18}
          color={data.color}
          anchorX="center"
          anchorY="middle"
          outlineColor={LV2.ink}
          outlineWidth={0.005}
          outlineOpacity={0.88}
        >
          {data.age}  ·  {data.status}
        </Text>
      </group>
    </group>
  );
}

/* Network lines: hex perimeter (6) + diameters (3) + spokes from chip
 * centre to each satellite (6) = 15 lines total. Lines fade in during
 * act 3 - the moment the user sees "this chip drives six fields".
 *
 * Spokes use the sentinel index -1 to mean "chip centre". */
const CHIP_CENTRE = -1;
const NETWORK_PAIRS: Array<[number, number]> = [
  /* Spokes from chip centre to each satellite */
  [CHIP_CENTRE, 0], [CHIP_CENTRE, 1], [CHIP_CENTRE, 2],
  [CHIP_CENTRE, 3], [CHIP_CENTRE, 4], [CHIP_CENTRE, 5],
  /* Hex perimeter between satellites */
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0],
  /* Diameters across the hexagon */
  [0, 3], [1, 4], [2, 5],
];

function pairEndpoint(idx: number): [number, number, number] {
  if (idx === CHIP_CENTRE) return [0, SUBSTRATE_H / 2 + 0.18, 0];
  return nodePos(idx);
}

function pairColor(idx: number): string {
  if (idx === CHIP_CENTRE) return "#00f5ff";
  return NODE_DATA[idx].color;
}

function NetworkLines({ progress }: { progress: MotionValue<number> }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(NETWORK_PAIRS.length * 6);
    for (let i = 0; i < NETWORK_PAIRS.length; i++) {
      const [a, b] = NETWORK_PAIRS[i];
      const pa = pairEndpoint(a);
      const pb = pairEndpoint(b);
      arr[i * 6 + 0] = pa[0];
      arr[i * 6 + 1] = pa[1];
      arr[i * 6 + 2] = pa[2];
      arr[i * 6 + 3] = pb[0];
      arr[i * 6 + 4] = pb[1];
      arr[i * 6 + 5] = pb[2];
    }
    return arr;
  }, []);
  const colors = useMemo(() => {
    const arr = new Float32Array(NETWORK_PAIRS.length * 6);
    for (let i = 0; i < NETWORK_PAIRS.length; i++) {
      const [a, b] = NETWORK_PAIRS[i];
      const ca = new THREE.Color(pairColor(a));
      const cb = new THREE.Color(pairColor(b));
      arr[i * 6 + 0] = ca.r;
      arr[i * 6 + 1] = ca.g;
      arr[i * 6 + 2] = ca.b;
      arr[i * 6 + 3] = cb.r;
      arr[i * 6 + 4] = cb.g;
      arr[i * 6 + 5] = cb.b;
    }
    return arr;
  }, []);
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  }, [positions, colors]);
  const matRef = useRef<THREE.LineBasicMaterial>(null);
  useFrame((state) => {
    const p = progress.get();
    const t = state.clock.elapsedTime;
    const a3 = smoothstep(0.25, 0.55, p);
    const a5 = smoothstep(0.78, 1.0, p);
    if (matRef.current) {
      const pulse = 0.85 + Math.sin(t * 1.4) * 0.12;
      matRef.current.opacity = a3 * pulse * (1 - a5 * 0.85);
    }
  });
  return (
    <lineSegments geometry={geom}>
      <lineBasicMaterial
        ref={matRef}
        vertexColors
        transparent
        opacity={0}
        toneMapped={false}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  );
}

/* Energy pulses flowing along each network line - small bright spheres
 * cycling 0 -> 1 along each line. Sized in InstancedMesh for performance. */
function EnergyPulses({ progress }: { progress: MotionValue<number> }) {
  const COUNT = NETWORK_PAIRS.length * 2;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const pulses = useMemo(() => {
    return Array.from({ length: COUNT }, (_, i) => {
      const lineIdx = i % NETWORK_PAIRS.length;
      const halfOffset = Math.floor(i / NETWORK_PAIRS.length) * 0.5;
      return {
        lineIdx,
        phase: Math.random() + halfOffset,
        speed: 0.32 + Math.random() * 0.2,
      };
    });
  }, [COUNT]);
  const tmpA = useMemo(() => new THREE.Vector3(), []);
  const tmpB = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const p = progress.get();
    const t = state.clock.elapsedTime;
    const a3 = smoothstep(0.3, 0.55, p);
    const a5 = smoothstep(0.78, 1.0, p);
    const intensity = a3 * (1 - a5 * 0.85);
    for (let i = 0; i < COUNT; i++) {
      const pulse = pulses[i];
      const [na, nb] = NETWORK_PAIRS[pulse.lineIdx];
      const pa = pairEndpoint(na);
      const pb = pairEndpoint(nb);
      tmpA.set(pa[0], pa[1], pa[2]);
      tmpB.set(pb[0], pb[1], pb[2]);
      const f = (t * pulse.speed + pulse.phase) % 1;
      tmpA.lerp(tmpB, f);
      dummy.position.copy(tmpA);
      const fade = Math.sin(f * Math.PI);
      dummy.scale.setScalar((0.04 + fade * 0.05) * intensity);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    const mat = mesh.material as THREE.MeshBasicMaterial;
    mat.opacity = intensity;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
      <sphereGeometry args={[1, 12, 12]} />
      <meshBasicMaterial
        color="#7df0ff"
        transparent
        opacity={0}
        toneMapped={false}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
}

/* -------------------------------------------------------------------------- *
 * Radar sweep - a pool of 3 thin emissive rings that expand outward from
 * the chip in a staggered cycle. Reads as "the chip is scanning the world
 * around it" - on-brand for a cybersecurity processor.
 * -------------------------------------------------------------------------- */
function RadarSweep() {
  const meshes = useRef<(THREE.Mesh | null)[]>([null, null, null]);
  const PERIOD = 4.5;
  const MAX_R = 5.5;
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    for (let i = 0; i < 3; i++) {
      const m = meshes.current[i];
      if (!m) continue;
      /* Each ring offset by 1/3 period so one is always near peak */
      const phase = (i / 3) * PERIOD;
      const f = ((t + phase) % PERIOD) / PERIOD;
      const scale = 0.6 + f * MAX_R;
      m.scale.set(scale, scale, 1);
      const mat = m.material as THREE.MeshBasicMaterial;
      /* Brighter at start of sweep, fades as it expands */
      mat.opacity = Math.pow(1 - f, 1.4) * 0.85;
    }
  });
  /* Each ring in its own colour so the sweeps read as layered signals */
  const ringColors = [LV2.cyan, LV2.cosmic, LV2.gold];
  return (
    <group position={[0, -SUBSTRATE_H / 2 + 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshes.current[i] = el;
          }}
        >
          <ringGeometry args={[0.95, 1.0, 80]} />
          <meshBasicMaterial
            color={ringColors[i]}
            transparent
            opacity={0}
            toneMapped={false}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

/* -------------------------------------------------------------------------- *
 * Constellation lines - dynamic edges drawn between nearby orbiting data
 * nodes. Pairs within a distance threshold get connected; brightness scales
 * with proximity. Capped at MAX_LINES segments to bound performance.
 *
 * The effect: a live network graph that breathes as nodes orbit, occasionally
 * lighting up bright when nodes pass close, dimming when they spread.
 * -------------------------------------------------------------------------- */
const CONSTELLATION_MAX = 24;
function Constellations({
  nodeRefs,
}: {
  nodeRefs: React.RefObject<(THREE.Mesh | null)[]>;
}) {
  const positions = useMemo(
    () => new Float32Array(CONSTELLATION_MAX * 6),
    [],
  );
  const colors = useMemo(
    () => new Float32Array(CONSTELLATION_MAX * 6),
    [],
  );
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  }, [positions, colors]);

  useFrame(() => {
    const nodes = (nodeRefs.current || []).filter(
      (n): n is THREE.Mesh => n !== null,
    );
    if (nodes.length < 2) return;

    /* Find all pairs under the threshold distance. We sort by distance
     * and keep the closest N. */
    const THRESHOLD = 3.6;
    const pairs: Array<{ i: number; j: number; d: number }> = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const d = nodes[i].position.distanceTo(nodes[j].position);
        if (d < THRESHOLD) pairs.push({ i, j, d });
      }
    }
    pairs.sort((a, b) => a.d - b.d);
    const top = pairs.slice(0, CONSTELLATION_MAX);

    for (let k = 0; k < CONSTELLATION_MAX; k++) {
      if (k < top.length) {
        const { i, j, d } = top[k];
        const p1 = nodes[i].position;
        const p2 = nodes[j].position;
        /* Brightness curve: bright when very close, fades to 0 at
         * threshold. Squared falloff feels more natural. */
        const alpha = Math.pow(1 - d / THRESHOLD, 2.0) * 0.85;
        positions[k * 6 + 0] = p1.x;
        positions[k * 6 + 1] = p1.y;
        positions[k * 6 + 2] = p1.z;
        positions[k * 6 + 3] = p2.x;
        positions[k * 6 + 4] = p2.y;
        positions[k * 6 + 5] = p2.z;
        for (let v = 0; v < 2; v++) {
          colors[k * 6 + v * 3 + 0] = alpha * 0.3;
          colors[k * 6 + v * 3 + 1] = alpha * 0.85;
          colors[k * 6 + v * 3 + 2] = alpha;
        }
      } else {
        /* Hide unused slots by zeroing the line + colour */
        for (let v = 0; v < 6; v++) {
          positions[k * 6 + v] = 0;
          colors[k * 6 + v] = 0;
        }
      }
    }
    geom.attributes.position.needsUpdate = true;
    geom.attributes.color.needsUpdate = true;
  });

  return (
    <lineSegments geometry={geom}>
      <lineBasicMaterial
        vertexColors
        transparent
        opacity={1}
        toneMapped={false}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  );
}

/* -------------------------------------------------------------------------- *
 * Animated scan-line on the chip lid. A thin emissive stripe sweeps across
 * the lid's top surface in a slow loop, giving the chip a "diagnostic /
 * live electronics" feel.
 * -------------------------------------------------------------------------- */
function LidScanLine() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const m = meshRef.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    /* Sweep from -1.1 to +1.1 along the lid's Z, then loop */
    const period = 3.6;
    const f = (t % period) / period;
    const z = -SUBSTRATE_D * 0.42 + f * SUBSTRATE_D * 0.84;
    m.position.z = z;
    const mat = m.material as THREE.MeshBasicMaterial;
    /* Fade in at the start of the sweep, fade out at the end */
    mat.opacity =
      Math.sin(f * Math.PI) * 0.9 *
      /* Strong opacity in the centre of the lid, low at edges */
      (0.6 + Math.sin(t * 2) * 0.1);
  });
  return (
    <mesh
      ref={meshRef}
      position={[0, 0.094, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[SUBSTRATE_W * 0.82, 0.04]} />
      <meshBasicMaterial
        color={LV2.cyanSoft}
        transparent
        opacity={0}
        toneMapped={false}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

/* -------------------------------------------------------------------------- *
 * Horizon glow - a faint gradient quad far behind the scene that gives the
 * black void a sense of "this is space, with light somewhere beyond".
 * Subtle, never the focus. Cyan-violet mix.
 * -------------------------------------------------------------------------- */
function HorizonGlow() {
  const tex = useMemo(() => {
    if (typeof document === "undefined") return new THREE.Texture();
    const W = 64;
    const H = 256;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    /* Mid-screen subtle band - violet to cyan to fade. */
    g.addColorStop(0, "rgba(124,92,255,0)");
    g.addColorStop(0.42, "rgba(124,92,255,0.18)");
    g.addColorStop(0.55, "rgba(0,229,255,0.28)");
    g.addColorStop(0.68, "rgba(0,229,255,0.16)");
    g.addColorStop(1, "rgba(4,5,13,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    const t = new THREE.CanvasTexture(canvas);
    t.needsUpdate = true;
    return t;
  }, []);
  return (
    <mesh position={[0, 0, -22]}>
      <planeGeometry args={[36, 18]} />
      <meshBasicMaterial
        map={tex}
        transparent
        opacity={0.85}
        depthWrite={false}
        toneMapped={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* -------------------------------------------------------------------------- *
 * Light streaks - the "moving through cyberspace" feel.
 *
 * Long thin line segments distributed across a cylindrical volume around
 * the camera. Each frame they translate in +Z (toward camera) at a speed
 * keyed to scroll progress, then respawn at the far end when they pass.
 *
 * Inspired by the truck-through-landscape effect on terminal-industries.com:
 * the chip stays roughly anchored while the world streams past it,
 * communicating "we're moving forward" without the chip itself translating.
 *
 * Density: ~140 streaks. Speed: rests at a slow drift, ramps up during the
 * journey phase (scroll 0.05 - 0.45), settles for the AX reveal.
 * -------------------------------------------------------------------------- */
const STREAK_COUNT = 140;

function LightStreaks({
  progress,
  reducedMotion,
}: {
  progress: MotionValue<number>;
  reducedMotion: boolean;
}) {
  const count = reducedMotion ? 40 : STREAK_COUNT;
  const positions = useRef<Float32Array>(new Float32Array(count * 6));
  const colors = useRef<Float32Array>(new Float32Array(count * 6));
  const seeds = useRef<Float32Array>(new Float32Array(count));

  useMemo(() => {
    const cyan = new THREE.Color(LV2.cyan);
    const cyanSoft = new THREE.Color(LV2.cyanSoft);
    const cosmic = new THREE.Color(LV2.cosmic);
    const gold = new THREE.Color(LV2.gold);
    const magenta = new THREE.Color(LV2.magenta);
    for (let i = 0; i < count; i++) {
      const r = 3.2 + Math.random() * 6;
      const theta = Math.random() * Math.PI * 2;
      const x = Math.cos(theta) * r;
      const y = Math.sin(theta) * r * 0.55;
      const z = -Math.random() * 38 - 4;
      const length = 0.8 + Math.random() * 2.4;
      positions.current[i * 6 + 0] = x;
      positions.current[i * 6 + 1] = y;
      positions.current[i * 6 + 2] = z;
      positions.current[i * 6 + 3] = x;
      positions.current[i * 6 + 4] = y;
      positions.current[i * 6 + 5] = z - length;
      /* Colour mix - more distinctive distribution:
       *   42% electric cyan
       *   16% cyanSoft (pale highlight)
       *   20% pink-violet
       *   15% gold (warm energy)
       *   7% magenta (rare alert pop) */
      const roll = Math.random();
      const tint =
        roll < 0.42
          ? cyan
          : roll < 0.58
            ? cyanSoft
            : roll < 0.78
              ? cosmic
              : roll < 0.93
                ? gold
                : magenta;
      for (let k = 0; k < 2; k++) {
        colors.current[i * 6 + k * 3 + 0] = tint.r;
        colors.current[i * 6 + k * 3 + 1] = tint.g;
        colors.current[i * 6 + k * 3 + 2] = tint.b;
      }
      seeds.current[i] = Math.random();
    }
  }, [count]);

  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions.current, 3));
    g.setAttribute("color", new THREE.BufferAttribute(colors.current, 3));
    return g;
  }, []);

  const matRef = useRef<THREE.LineBasicMaterial>(null);

  useFrame((state, dt) => {
    const p = progress.get();
    /* Speed envelope: gentle drift at rest, ramps up during 0.05 - 0.45,
     * decays during the lid lift, very slow at the AX reveal. */
    const journey = smoothstep(0.02, 0.2, p) * (1 - smoothstep(0.45, 0.85, p));
    const baseSpeed = reducedMotion ? 0 : 4 + journey * 22;
    const speed = baseSpeed * dt;

    const arr = positions.current;
    /* Camera Z position (varies by act). When a streak goes past
     * camera, respawn at far end. */
    const camZ = state.camera.position.z;
    for (let i = 0; i < count; i++) {
      arr[i * 6 + 2] += speed;
      arr[i * 6 + 5] += speed;
      if (arr[i * 6 + 2] > camZ + 2) {
        const r = 3.2 + Math.random() * 6;
        const theta = Math.random() * Math.PI * 2;
        const x = Math.cos(theta) * r;
        const y = Math.sin(theta) * r * 0.55;
        const length = 0.8 + Math.random() * 2.4;
        const farZ = camZ - 40 - Math.random() * 12;
        arr[i * 6 + 0] = x;
        arr[i * 6 + 1] = y;
        arr[i * 6 + 2] = farZ;
        arr[i * 6 + 3] = x;
        arr[i * 6 + 4] = y;
        arr[i * 6 + 5] = farZ - length;
      }
    }
    const posAttr = geom.attributes.position as THREE.BufferAttribute;
    posAttr.needsUpdate = true;

    /* Opacity envelope: visible during the motion phase, fades out for
     * the AX glyph reveal so it doesn't compete with the brand mark. */
    if (matRef.current) {
      const visible = (0.35 + journey * 0.55) * (1 - smoothstep(0.78, 1.0, p) * 0.85);
      matRef.current.opacity = visible;
    }
  });

  return (
    <lineSegments geometry={geom}>
      <lineBasicMaterial
        ref={matRef}
        vertexColors
        transparent
        opacity={0.4}
        toneMapped={false}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  );
}

/* -------------------------------------------------------------------------- *
 * Live HUD readouts. Two small monospace panels float beside the chip with
 * fake-but-believable telemetry (frequency / temp / AI ops). Numbers tick
 * each frame so the panels feel "live" rather than static.
 * -------------------------------------------------------------------------- */
function HudReadouts({ progress }: { progress: MotionValue<number> }) {
  const panel1 = useRef<THREE.Group>(null);
  const panel2 = useRef<THREE.Group>(null);
  const freqText = useRef<THREE.Mesh>(null);
  const tempText = useRef<THREE.Mesh>(null);
  const opsText = useRef<THREE.Mesh>(null);
  const chanText = useRef<THREE.Mesh>(null);

  /* mutable state for the readouts */
  const state = useRef({ freq: 4.78, temp: 42.6, ops: 2.41, chan: 0x4A12 });

  useFrame((s) => {
    const p = progress.get();
    const t = s.clock.elapsedTime;
    const a5 = smoothstep(0.78, 1.0, p);

    /* Tick the values with small wobbles */
    state.current.freq = 4.8 + Math.sin(t * 1.3) * 0.18;
    state.current.temp = 42.5 + Math.sin(t * 0.7) * 1.6;
    state.current.ops = 2.4 + Math.sin(t * 0.9 + 1.2) * 0.18;
    if (Math.random() < 0.06) {
      state.current.chan = (0x4A00 + Math.floor(Math.random() * 0xFF)) & 0xFFFF;
    }

    if (freqText.current) {
      const tt = freqText.current as unknown as { text: string };
      tt.text = `CORE  ${state.current.freq.toFixed(2)} GHz`;
    }
    if (tempText.current) {
      const tt = tempText.current as unknown as { text: string; color: string };
      tt.text = `TEMP  ${state.current.temp.toFixed(1)}°C`;
      /* Tint amber when temperature crosses the warm threshold. Reads
       * as "this chip is doing real work" - real CPU monitoring tools
       * do exactly this. */
      tt.color = state.current.temp > 43.5 ? LV2.amber : LV2.cyanSoft;
    }
    if (opsText.current) {
      const tt = opsText.current as unknown as { text: string };
      tt.text = `AI OPS  ${state.current.ops.toFixed(2)} PFLOPS`;
    }
    if (chanText.current) {
      const tt = chanText.current as unknown as { text: string };
      tt.text = `CHAN  0x${state.current.chan.toString(16).toUpperCase().padStart(4, "0")}`;
    }

    /* Subtle bob + fade with act 5 */
    const op = 1 - a5 * 0.9;
    [panel1, panel2].forEach((ref, i) => {
      if (!ref.current) return;
      ref.current.position.y = (i === 0 ? 1.4 : -1.3) + Math.sin(t * 0.6 + i) * 0.06;
      ref.current.traverse((c) => {
        const m = (c as THREE.Mesh).material as
          | THREE.Material
          | undefined;
        if (m && "opacity" in m) {
          (m as THREE.Material & { opacity: number }).transparent = true;
          (m as THREE.Material & { opacity: number }).opacity = op;
        }
      });
    });
  });

  return (
    <group>
      {/* Upper-left panel */}
      <group ref={panel1} position={[-2.4, 1.4, 0.2]}>
        <Text
          ref={freqText as unknown as React.Ref<THREE.Mesh>}
          fontSize={0.16}
          letterSpacing={0.1}
          color={LV2.cyan}
          anchorX="left"
          anchorY="middle"
          outlineColor={LV2.ink}
          outlineWidth={0.005}
        >
          CORE  4.78 GHz
        </Text>
        <Text
          ref={tempText as unknown as React.Ref<THREE.Mesh>}
          position={[0, -0.25, 0]}
          fontSize={0.13}
          letterSpacing={0.1}
          color={LV2.cyanSoft}
          anchorX="left"
          anchorY="middle"
          outlineColor={LV2.ink}
          outlineWidth={0.005}
        >
          TEMP  42.6°C
        </Text>
      </group>
      {/* Lower-right panel */}
      <group ref={panel2} position={[2.4, -1.3, 0.2]}>
        <Text
          ref={opsText as unknown as React.Ref<THREE.Mesh>}
          fontSize={0.16}
          letterSpacing={0.1}
          color={LV2.cyan}
          anchorX="right"
          anchorY="middle"
          outlineColor={LV2.ink}
          outlineWidth={0.005}
        >
          AI OPS  2.41 PFLOPS
        </Text>
        <Text
          ref={chanText as unknown as React.Ref<THREE.Mesh>}
          position={[0, -0.25, 0]}
          fontSize={0.13}
          letterSpacing={0.1}
          color={LV2.cyanSoft}
          anchorX="right"
          anchorY="middle"
          outlineColor={LV2.ink}
          outlineWidth={0.005}
        >
          CHAN  0x4A12
        </Text>
      </group>
    </group>
  );
}

/* -------------------------------------------------------------------------- *
 * Trace pulses. Small bright sprites that flow along the existing circuit
 * trace paths. They cycle constantly, giving the chip a "live circuit" feel.
 * -------------------------------------------------------------------------- */
function TracePulses({
  count = 24,
  radius,
}: {
  count?: number;
  radius: number;
}) {
  /* Each pulse has its own angle around the chip + a forward progress.
   * They move outward from inner radius to outer radius then respawn. */
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const pulses = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      angle: (i / count) * Math.PI * 2 + Math.random() * 0.4,
      phase: Math.random(),
      speed: 0.35 + Math.random() * 0.3,
    }));
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    const innerR = 0.85;
    const outerR = radius * 0.95;
    for (let i = 0; i < count; i++) {
      const p = pulses[i];
      const f = ((t * p.speed + p.phase) % 1);
      const r = innerR + f * (outerR - innerR);
      dummy.position.set(
        Math.cos(p.angle) * r,
        -SUBSTRATE_H / 2 - 0.005,
        Math.sin(p.angle) * r,
      );
      const fade = Math.sin(f * Math.PI);
      dummy.scale.setScalar(0.06 + fade * 0.05);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial
        color={LV2.cyanSoft}
        transparent
        opacity={0.95}
        toneMapped={false}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
}

/* -------------------------------------------------------------------------- *
 * Data stream - the transformation effect. During act 4-5, bright comet
 * trails spawn from random points on the chip and follow curved bezier
 * paths to the AX glyph position. Reads as "the chip is broadcasting its
 * essence into the brand mark".
 *
 * Each comet is a line segment: HEAD (current bezier position, bright)
 * + TAIL (bezier slightly behind, transparent). Vertex colours interpolate
 * along the line so the trail fades back to invisible. Single LineSegments
 * mesh holds all comets - one draw call total.
 * -------------------------------------------------------------------------- */
const DATASTREAM_COUNT = 28;

function DataStream({
  progress,
  targetGetter,
}: {
  progress: MotionValue<number>;
  targetGetter: () => THREE.Vector3;
}) {
  const streams = useMemo(() => {
    return Array.from({ length: DATASTREAM_COUNT }, () => {
      const r = 0.5 + Math.random() * 1.0;
      const a = Math.random() * Math.PI * 2;
      return {
        origin: new THREE.Vector3(
          Math.cos(a) * r,
          (Math.random() - 0.5) * 0.2,
          Math.sin(a) * r,
        ),
        ctrl: new THREE.Vector3(
          Math.cos(a) * r * 1.4 + (Math.random() - 0.5),
          1.6 + Math.random() * 1.0,
          Math.sin(a) * r * 1.4 + (Math.random() - 0.5),
        ),
        phase: Math.random(),
        speed: 0.42 + Math.random() * 0.34,
      };
    });
  }, []);

  const positions = useMemo(
    () => new Float32Array(DATASTREAM_COUNT * 6),
    [],
  );
  const colors = useMemo(
    () => new Float32Array(DATASTREAM_COUNT * 6),
    [],
  );
  /* Initialise colors: head bright in a varied palette, tail transparent
   * black. With additive blending the gradient yields a glowing head
   * fading to invisible tail. Mix of cyan, magenta, gold, pink-violet
   * keeps the stream visually rich. */
  useMemo(() => {
    const palette = [
      new THREE.Color(LV2.cyan),
      new THREE.Color(LV2.cyan),
      new THREE.Color(LV2.cyan),
      new THREE.Color(LV2.cosmic),
      new THREE.Color(LV2.cosmic),
      new THREE.Color(LV2.gold),
      new THREE.Color(LV2.magenta),
    ];
    for (let i = 0; i < DATASTREAM_COUNT; i++) {
      const c = palette[i % palette.length];
      /* head (first vertex) */
      colors[i * 6 + 0] = c.r;
      colors[i * 6 + 1] = c.g;
      colors[i * 6 + 2] = c.b;
      /* tail (second vertex) - black for additive blending fade */
      colors[i * 6 + 3] = 0;
      colors[i * 6 + 4] = 0;
      colors[i * 6 + 5] = 0;
    }
  }, [colors]);

  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  }, [positions, colors]);

  const matRef = useRef<THREE.LineBasicMaterial>(null);

  const a = useMemo(() => new THREE.Vector3(), []);
  const b = useMemo(() => new THREE.Vector3(), []);
  const head = useMemo(() => new THREE.Vector3(), []);
  const tail = useMemo(() => new THREE.Vector3(), []);

  /* Bezier evaluation helper - quadratic via lerp */
  const evalBezier = (
    out: THREE.Vector3,
    origin: THREE.Vector3,
    ctrl: THREE.Vector3,
    target: THREE.Vector3,
    f: number,
  ) => {
    a.copy(origin).lerp(ctrl, f);
    b.copy(ctrl).lerp(target, f);
    out.copy(a).lerp(b, f);
  };

  useFrame((state) => {
    const p = progress.get();
    const t = state.clock.elapsedTime;
    const a4 = smoothstep(0.5, 0.85, p);
    const intensity = Math.max(a4, 0);
    const visibleTarget = targetGetter();
    /* Trail length expressed as bezier progress delta; 0.06 = 6% of
     * the curve trails behind the head. */
    const trailLen = 0.06;

    for (let i = 0; i < DATASTREAM_COUNT; i++) {
      const s = streams[i];
      const fHead = (t * s.speed + s.phase) % 1;
      const fTail = Math.max(0, fHead - trailLen);
      evalBezier(head, s.origin, s.ctrl, visibleTarget, fHead);
      evalBezier(tail, s.origin, s.ctrl, visibleTarget, fTail);
      positions[i * 6 + 0] = head.x;
      positions[i * 6 + 1] = head.y;
      positions[i * 6 + 2] = head.z;
      positions[i * 6 + 3] = tail.x;
      positions[i * 6 + 4] = tail.y;
      positions[i * 6 + 5] = tail.z;
    }
    geom.attributes.position.needsUpdate = true;
    if (matRef.current) matRef.current.opacity = intensity;
  });

  return (
    <lineSegments geometry={geom}>
      <lineBasicMaterial
        ref={matRef}
        vertexColors
        transparent
        opacity={0}
        toneMapped={false}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  );
}

/* -------------------------------------------------------------------------- *
 * Floating code snippets in 3D space. Each snippet drifts slowly along its
 * own axis, billboards toward the camera, and reads as if the chip is
 * emitting algorithm code into the surrounding cyber-space.
 * -------------------------------------------------------------------------- */
function CodeSwarm({
  progress,
  reducedMotion,
}: {
  progress: MotionValue<number>;
  reducedMotion: boolean;
}) {
  const snippets = useMemo(() => {
    /* Generate stable random starting positions + drift vectors for
     * each snippet. Random seeded by index so the layout is
     * deterministic. */
    return CODE_SNIPPETS.map((s, i) => {
      const seed = i * 9301 + 49297;
      const rand = (n: number) => {
        const v = Math.sin(seed + n * 12.9898) * 43758.5453;
        return v - Math.floor(v);
      };
      /* Place around the chip in a 3D shell. Bias toward back / sides
       * so they don't crowd the chip silhouette. */
      const theta = rand(1) * Math.PI * 2;
      const yspread = (rand(2) - 0.5) * 5;
      const radius = 4 + rand(3) * 4;
      return {
        ...s,
        startX: Math.cos(theta) * radius,
        startY: yspread,
        startZ: Math.sin(theta) * radius - 1.5,
        driftX: (rand(4) - 0.5) * 0.4,
        driftY: (rand(5) - 0.5) * 0.25,
        speed: 0.06 + rand(6) * 0.08,
        phase: rand(7) * Math.PI * 2,
        fontSize: 0.16 + rand(8) * 0.08,
      };
    });
  }, []);

  const refs = useRef<(THREE.Group | null)[]>([]);

  useFrame((state) => {
    const p = progress.get();
    const t = state.clock.elapsedTime;
    const a5 = smoothstep(0.78, 1.0, p);
    for (let i = 0; i < snippets.length; i++) {
      const ref = refs.current[i];
      if (!ref) continue;
      const s = snippets[i];
      ref.position.x = s.startX + Math.sin(t * s.speed + s.phase) * s.driftX;
      ref.position.y = s.startY + Math.cos(t * s.speed * 0.7 + s.phase) * s.driftY;
      ref.position.z = s.startZ;
      /* Billboard - face the camera roughly */
      ref.lookAt(state.camera.position);
      /* Opacity pulse + dim during AX glyph reveal */
      const pulse = 0.55 + Math.sin(t * 0.9 + s.phase) * 0.25;
      const visible = pulse * (1 - a5 * 0.8);
      ref.traverse((c) => {
        const m = (c as THREE.Mesh).material as
          | THREE.Material
          | undefined;
        if (m && "opacity" in m) {
          (m as THREE.Material & { opacity: number }).transparent = true;
          (m as THREE.Material & { opacity: number }).opacity = visible;
        }
      });
    }
  });

  return (
    <group>
      {snippets.map((s, i) => (
        <group
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          position={[s.startX, s.startY, s.startZ]}
        >
          <Text
            fontSize={s.fontSize}
            letterSpacing={0.04}
            color={s.color}
            anchorX="center"
            anchorY="middle"
            outlineColor="#04050d"
            outlineWidth={0.006}
            outlineOpacity={0.8}
          >
            {s.text}
          </Text>
        </group>
      ))}
    </group>
  );
}

/* -------------------------------------------------------------------------- *
 * Holographic grid floor - a faint cyan tile pattern that grounds the chip
 * spatially. Built from line segments on a single XZ plane.
 * -------------------------------------------------------------------------- */
function HoloGrid() {
  const geom = useMemo(() => {
    const lines: number[] = [];
    const size = 8;
    const divisions = 16;
    const step = size / divisions;
    for (let i = 0; i <= divisions; i++) {
      const t = -size / 2 + i * step;
      lines.push(-size / 2, -SUBSTRATE_H / 2 - 0.6, t);
      lines.push(size / 2, -SUBSTRATE_H / 2 - 0.6, t);
      lines.push(t, -SUBSTRATE_H / 2 - 0.6, -size / 2);
      lines.push(t, -SUBSTRATE_H / 2 - 0.6, size / 2);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(lines), 3),
    );
    return g;
  }, []);
  return (
    <lineSegments geometry={geom}>
      <lineBasicMaterial
        color="#3aa8c2"
        transparent
        opacity={0.32}
        toneMapped={false}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
}

/* -------------------------------------------------------------------------- *
 * Die core lattice - the cyan grid pattern on the silicon die top.
 * Four sub-blocks (one per compute core) plus an outer IO ring + radial
 * bus stubs. All drawn as line segments on a single plane just above the
 * die surface so the bloom can render it as glowing silicon etchings.
 * -------------------------------------------------------------------------- */
function DieCoreLattice({ yOffset }: { yOffset: number }) {
  const { coreLines, busLines, ringLines } = useMemo(() => {
    const half = DIE_W / 2;
    const coreLines: number[] = [];
    /* 4 cores in a 2x2 - each has a grid */
    const coreSize = DIE_W * 0.36;
    const offs = DIE_W * 0.22;
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const cx = sx * offs;
        const cz = sz * offs;
        /* Outer rect */
        coreLines.push(cx - coreSize / 2, 0.001, cz - coreSize / 2);
        coreLines.push(cx + coreSize / 2, 0.001, cz - coreSize / 2);

        coreLines.push(cx + coreSize / 2, 0.001, cz - coreSize / 2);
        coreLines.push(cx + coreSize / 2, 0.001, cz + coreSize / 2);

        coreLines.push(cx + coreSize / 2, 0.001, cz + coreSize / 2);
        coreLines.push(cx - coreSize / 2, 0.001, cz + coreSize / 2);

        coreLines.push(cx - coreSize / 2, 0.001, cz + coreSize / 2);
        coreLines.push(cx - coreSize / 2, 0.001, cz - coreSize / 2);
        /* Internal lattice */
        for (let i = 1; i < 5; i++) {
          const f = (i / 5) * coreSize - coreSize / 2;
          coreLines.push(cx + f, 0.001, cz - coreSize / 2);
          coreLines.push(cx + f, 0.001, cz + coreSize / 2);
          coreLines.push(cx - coreSize / 2, 0.001, cz + f);
          coreLines.push(cx + coreSize / 2, 0.001, cz + f);
        }
      }
    }
    /* IO ring around the whole die */
    const r = half - 0.02;
    const ringLines: number[] = [];
    ringLines.push(-r, 0.001, -r, r, 0.001, -r);
    ringLines.push(r, 0.001, -r, r, 0.001, r);
    ringLines.push(r, 0.001, r, -r, 0.001, r);
    ringLines.push(-r, 0.001, r, -r, 0.001, -r);
    /* Radial bus stubs from cores out to ring */
    const busLines: number[] = [];
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const innerR = 0.25;
      const outerR = half - 0.03;
      busLines.push(
        Math.cos(a) * innerR,
        0.001,
        Math.sin(a) * innerR,
        Math.cos(a) * outerR,
        0.001,
        Math.sin(a) * outerR,
      );
    }
    return {
      coreLines: new Float32Array(coreLines),
      busLines: new Float32Array(busLines),
      ringLines: new Float32Array(ringLines),
    };
  }, []);

  const coreGeom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(coreLines, 3));
    return g;
  }, [coreLines]);
  const busGeom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(busLines, 3));
    return g;
  }, [busLines]);
  const ringGeom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(ringLines, 3));
    return g;
  }, [ringLines]);

  return (
    <group position={[0, yOffset, 0]}>
      <lineSegments geometry={coreGeom}>
        <lineBasicMaterial
          color={LV2.cyanSoft}
          transparent
          opacity={0.85}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
      <lineSegments geometry={busGeom}>
        <lineBasicMaterial
          color={LV2.cyan}
          transparent
          opacity={0.7}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
      <lineSegments geometry={ringGeom}>
        <lineBasicMaterial
          color={LV2.cyan}
          transparent
          opacity={0.9}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}

/* ----------------------------- TEXTURES ----------------------------- */

/* -------------------------------------------------------------------------- *
 * Board dressing - real PCB components around the main chip. Each component
 * lifts off in cascading stagger as the user scrolls past act 3, exposing
 * gold solder pads underneath where it used to sit.
 *
 *   - 4 ceramic capacitors (black cylinders with bronze tops)
 *   - 2 support ICs (low-profile dark chips with pin-1 dots)
 *   - Each leaves a gold solder pad behind when it lifts
 * -------------------------------------------------------------------------- */
function BoardDressing({ progress }: { progress: MotionValue<number> }) {
  /* More density - 8 caps + 2 ICs + 4 DRAM modules + 2 inductors so
   * there's genuinely a lot of hardware to watch deconstruct. */
  const capPositions: Array<[number, number]> = [
    [-SUBSTRATE_W * 0.62, -SUBSTRATE_D * 0.42],
    [-SUBSTRATE_W * 0.62, -SUBSTRATE_D * 0.14],
    [-SUBSTRATE_W * 0.62, SUBSTRATE_D * 0.14],
    [-SUBSTRATE_W * 0.62, SUBSTRATE_D * 0.42],
    [SUBSTRATE_W * 0.62, -SUBSTRATE_D * 0.42],
    [SUBSTRATE_W * 0.62, -SUBSTRATE_D * 0.14],
    [SUBSTRATE_W * 0.62, SUBSTRATE_D * 0.14],
    [SUBSTRATE_W * 0.62, SUBSTRATE_D * 0.42],
  ];
  const supportIcs: Array<[number, number, number, number]> = [
    [0, SUBSTRATE_D * 0.82, 0.5, 0.5],
    [0, -SUBSTRATE_D * 0.82, 0.4, 0.4],
  ];
  /* DRAM modules: long thin PCB strips standing vertically beside the chip */
  const dramPositions: Array<[number, number, number]> = [
    [-SUBSTRATE_W * 0.92, SUBSTRATE_D * 0.0, 0],
    [-SUBSTRATE_W * 1.08, SUBSTRATE_D * 0.0, 0],
    [SUBSTRATE_W * 0.92, SUBSTRATE_D * 0.0, 0],
    [SUBSTRATE_W * 1.08, SUBSTRATE_D * 0.0, 0],
  ];
  /* Power inductors: chunky ferrite cubes on the corners */
  const inductorPositions: Array<[number, number]> = [
    [-SUBSTRATE_W * 0.32, SUBSTRATE_D * 0.78],
    [SUBSTRATE_W * 0.32, SUBSTRATE_D * 0.78],
  ];
  return (
    <group>
      {capPositions.map(([x, z], i) => (
        <CeramicCap key={`cap-${i}`} x={x} z={z} index={i} progress={progress} />
      ))}
      {supportIcs.map(([x, z, w, d], i) => (
        <SupportIc
          key={`ic-${i}`}
          x={x}
          z={z}
          w={w}
          d={d}
          index={i}
          progress={progress}
        />
      ))}
      {dramPositions.map(([x, z], i) => (
        <DramModule key={`dram-${i}`} x={x} z={z} index={i} progress={progress} />
      ))}
      {inductorPositions.map(([x, z], i) => (
        <PowerInductor
          key={`ind-${i}`}
          x={x}
          z={z}
          index={i}
          progress={progress}
        />
      ))}
      {/* Heatsink finned tower sits on top of the lid, lifts off first */}
      <Heatsink progress={progress} />
    </group>
  );
}

/* Generic helper to update component lift + the "solder pad" reveal
 * beneath. liftStart / liftEnd describe the scroll window during which
 * this piece rises off the board. */
function useLiftOff(
  rootRef: React.RefObject<THREE.Group | null>,
  padRef: React.RefObject<THREE.Mesh | null>,
  startPos: [number, number, number],
  progress: MotionValue<number>,
  liftStart: number,
  liftEnd: number,
  liftHeight: number,
  spin: { x: number; y: number; z: number },
  outwardDrift: number,
) {
  useFrame((state) => {
    const root = rootRef.current;
    if (!root) return;
    const p = progress.get();
    const t = state.clock.elapsedTime;
    const lift = smoothstep(liftStart, liftEnd, p);
    const a5 = smoothstep(0.78, 1.0, p);
    /* outward drift along the XZ vector from origin to start position */
    const dirX = startPos[0] === 0 ? 0 : Math.sign(startPos[0]);
    const dirZ = startPos[2] === 0 ? 0 : Math.sign(startPos[2]);
    root.position.x = startPos[0] + dirX * lift * outwardDrift;
    root.position.y = startPos[1] + lift * liftHeight;
    root.position.z = startPos[2] + dirZ * lift * outwardDrift;
    root.rotation.x = lift * spin.x + t * 0.18 * lift;
    root.rotation.y = lift * spin.y + t * 0.22 * lift;
    root.rotation.z = lift * spin.z + Math.sin(t * 0.6) * 0.04 * lift;
    /* Fade out for the AX reveal */
    root.traverse((c) => {
      const m = (c as THREE.Mesh).material as THREE.Material | undefined;
      if (m && "opacity" in m) {
        (m as THREE.Material & { opacity: number }).transparent = true;
        (m as THREE.Material & { opacity: number }).opacity = 1 - a5 * 0.92;
      }
    });
    /* Solder pad fade-in - appears as the piece lifts away */
    if (padRef.current) {
      const mat = padRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = lift * 0.85 * (1 - a5 * 0.7);
    }
  });
}

function CeramicCap({
  x,
  z,
  index,
  progress,
}: {
  x: number;
  z: number;
  index: number;
  progress: MotionValue<number>;
}) {
  const root = useRef<THREE.Group>(null);
  const pad = useRef<THREE.Mesh>(null);
  const liftStart = 0.32 + index * 0.025;
  useLiftOff(
    root,
    pad,
    [x, -SUBSTRATE_H / 2 + 0.085, z],
    progress,
    liftStart,
    liftStart + 0.28,
    1.6 + (index % 3) * 0.3,
    { x: 0.12, y: 0.8, z: 0.06 },
    0.4,
  );
  return (
    <>
      <group ref={root}>
        <mesh castShadow>
          <cylinderGeometry args={[0.075, 0.075, 0.17, 24]} />
          <meshPhysicalMaterial
            color="#1c1f2a"
            metalness={0.5}
            roughness={0.42}
            clearcoat={0.55}
            clearcoatRoughness={0.45}
          />
        </mesh>
        {/* Bronze top cap */}
        <mesh position={[0, 0.087, 0]}>
          <cylinderGeometry args={[0.068, 0.068, 0.008, 24]} />
          <meshStandardMaterial
            color="#c89a4e"
            metalness={0.95}
            roughness={0.25}
            emissive="#c89a4e"
            emissiveIntensity={0.18}
          />
        </mesh>
      </group>
      {/* Solder pad left behind when the cap lifts off */}
      <mesh
        ref={pad}
        position={[x, -SUBSTRATE_H / 2 + 0.001, z]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[0.08, 24]} />
        <meshStandardMaterial
          color="#c89a4e"
          metalness={0.95}
          roughness={0.18}
          emissive="#c89a4e"
          emissiveIntensity={0.32}
          transparent
          opacity={0}
        />
      </mesh>
    </>
  );
}

function SupportIc({
  x,
  z,
  w,
  d,
  index,
  progress,
}: {
  x: number;
  z: number;
  w: number;
  d: number;
  index: number;
  progress: MotionValue<number>;
}) {
  const root = useRef<THREE.Group>(null);
  const pad = useRef<THREE.Mesh>(null);
  const liftStart = 0.46 + index * 0.04;
  useLiftOff(
    root,
    pad,
    [x, -SUBSTRATE_H / 2 + 0.045, z],
    progress,
    liftStart,
    liftStart + 0.3,
    1.2,
    { x: 0.18, y: 0.6, z: 0.1 },
    0.36,
  );
  return (
    <>
      <group ref={root}>
        <RoundedBox
          args={[w, 0.08, d]}
          radius={0.012}
          smoothness={3}
          castShadow
        >
          <meshPhysicalMaterial
            color="#0c0e16"
            metalness={0.5}
            roughness={0.42}
            clearcoat={0.6}
            clearcoatRoughness={0.32}
          />
        </RoundedBox>
        {/* Pin-1 indicator */}
        <mesh
          position={[-w * 0.36, 0.041, -d * 0.36]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[0.018, 16]} />
          <meshBasicMaterial color={LV2.cyanSoft} toneMapped={false} />
        </mesh>
      </group>
      {/* Solder pad outline */}
      <mesh
        ref={pad}
        position={[x, -SUBSTRATE_H / 2 + 0.001, z]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[w * 1.05, d * 1.05]} />
        <meshStandardMaterial
          color="#c89a4e"
          metalness={0.95}
          roughness={0.22}
          emissive="#c89a4e"
          emissiveIntensity={0.28}
          transparent
          opacity={0}
        />
      </mesh>
    </>
  );
}

/* -------------------------------------------------------------------------- *
 * Finned aluminium heatsink. Sits on top of the lid in the rest state and
 * lifts off FIRST (earliest in the cascade) revealing the lid beneath.
 * -------------------------------------------------------------------------- */
function Heatsink({ progress }: { progress: MotionValue<number> }) {
  const root = useRef<THREE.Group>(null);
  const FIN_COUNT = 9;
  useFrame((state) => {
    const r = root.current;
    if (!r) return;
    const p = progress.get();
    const t = state.clock.elapsedTime;
    /* Lift FIRST in the cascade - earlier than the lid */
    const lift = smoothstep(0.08, 0.22, p);
    const a5 = smoothstep(0.78, 1.0, p);
    /* Base Y when resting = above the lid */
    const baseY = SUBSTRATE_H / 2 + 0.18 + 0.1;
    r.position.y = baseY + lift * 1.9;
    r.position.x = lift * -0.7;
    r.position.z = lift * 0.4;
    r.rotation.x = lift * -0.4 + t * 0.1 * lift;
    r.rotation.z = lift * 0.3;
    r.traverse((c) => {
      const m = (c as THREE.Mesh).material as THREE.Material | undefined;
      if (m && "opacity" in m) {
        (m as THREE.Material & { opacity: number }).transparent = true;
        (m as THREE.Material & { opacity: number }).opacity = 1 - a5 * 0.95;
      }
    });
  });
  return (
    <group ref={root}>
      {/* Base plate */}
      <RoundedBox
        args={[SUBSTRATE_W * 0.78, 0.06, SUBSTRATE_D * 0.78]}
        radius={0.025}
        smoothness={4}
        castShadow
      >
        <meshPhysicalMaterial
          color="#b8c1d1"
          metalness={1.0}
          roughness={0.3}
          clearcoat={0.85}
          clearcoatRoughness={0.2}
        />
      </RoundedBox>
      {/* Vertical fins along the Z axis */}
      {Array.from({ length: FIN_COUNT }, (_, i) => {
        const z =
          (i - (FIN_COUNT - 1) / 2) * (SUBSTRATE_D * 0.74) / FIN_COUNT;
        return (
          <mesh
            key={i}
            position={[0, 0.18, z]}
            castShadow
          >
            <boxGeometry args={[SUBSTRATE_W * 0.74, 0.32, 0.04]} />
            <meshPhysicalMaterial
              color="#9aa3b2"
              metalness={1.0}
              roughness={0.36}
              clearcoat={0.7}
              clearcoatRoughness={0.28}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/* DRAM module - long thin PCB stick with NAND chips, lifts off + tumbles */
function DramModule({
  x,
  z,
  index,
  progress,
}: {
  x: number;
  z: number;
  index: number;
  progress: MotionValue<number>;
}) {
  const root = useRef<THREE.Group>(null);
  const pad = useRef<THREE.Mesh>(null);
  const w = 0.12;
  const h = 1.1;
  const d = SUBSTRATE_D * 0.78;
  const liftStart = 0.36 + index * 0.025;
  useLiftOff(
    root,
    pad,
    [x, -SUBSTRATE_H / 2 + h / 2, z],
    progress,
    liftStart,
    liftStart + 0.3,
    1.8 + (index % 2) * 0.4,
    { x: 0.18, y: 0.6, z: 0.1 },
    0.5,
  );
  return (
    <>
      <group ref={root}>
        {/* PCB body */}
        <mesh castShadow>
          <boxGeometry args={[w, h, d]} />
          <meshPhysicalMaterial
            color="#0a3a2a"
            metalness={0.32}
            roughness={0.55}
            clearcoat={0.4}
            clearcoatRoughness={0.45}
          />
        </mesh>
        {/* 4 NAND chips on one side */}
        {[0, 1, 2, 3].map((i) => (
          <mesh
            key={i}
            position={[w / 2 + 0.012, h * 0.06, (i - 1.5) * (d * 0.22)]}
            castShadow
          >
            <boxGeometry args={[0.02, h * 0.55, d * 0.18]} />
            <meshPhysicalMaterial
              color="#0c0e16"
              metalness={0.45}
              roughness={0.42}
              clearcoat={0.55}
              clearcoatRoughness={0.32}
            />
          </mesh>
        ))}
        {/* Gold contacts at the bottom edge */}
        <mesh position={[0, -h / 2 + 0.015, 0]}>
          <boxGeometry args={[w + 0.004, 0.03, d * 0.95]} />
          <meshStandardMaterial
            color="#c89a4e"
            metalness={0.95}
            roughness={0.22}
            emissive="#c89a4e"
            emissiveIntensity={0.18}
          />
        </mesh>
      </group>
      {/* Slot outline left behind */}
      <mesh
        ref={pad}
        position={[x, -SUBSTRATE_H / 2 + 0.001, z]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[w * 1.4, d * 1.02]} />
        <meshStandardMaterial
          color="#c89a4e"
          metalness={0.9}
          roughness={0.25}
          emissive="#c89a4e"
          emissiveIntensity={0.32}
          transparent
          opacity={0}
        />
      </mesh>
    </>
  );
}

/* Power inductor - ferrite cube with a copper coil ring on top */
function PowerInductor({
  x,
  z,
  index,
  progress,
}: {
  x: number;
  z: number;
  index: number;
  progress: MotionValue<number>;
}) {
  const root = useRef<THREE.Group>(null);
  const pad = useRef<THREE.Mesh>(null);
  const liftStart = 0.5 + index * 0.04;
  useLiftOff(
    root,
    pad,
    [x, -SUBSTRATE_H / 2 + 0.11, z],
    progress,
    liftStart,
    liftStart + 0.3,
    1.4,
    { x: 0.2, y: 0.8, z: 0.12 },
    0.4,
  );
  return (
    <>
      <group ref={root}>
        <RoundedBox
          args={[0.22, 0.22, 0.22]}
          radius={0.018}
          smoothness={3}
          castShadow
        >
          <meshPhysicalMaterial
            color="#1a1d28"
            metalness={0.45}
            roughness={0.55}
            clearcoat={0.4}
            clearcoatRoughness={0.42}
          />
        </RoundedBox>
        {/* Copper coil indicator */}
        <mesh position={[0, 0.115, 0]}>
          <torusGeometry args={[0.075, 0.012, 12, 32]} />
          <meshStandardMaterial
            color="#c46a2a"
            metalness={0.9}
            roughness={0.32}
            emissive="#c46a2a"
            emissiveIntensity={0.18}
          />
        </mesh>
      </group>
      <mesh
        ref={pad}
        position={[x, -SUBSTRATE_H / 2 + 0.001, z]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[0.25, 0.25]} />
        <meshStandardMaterial
          color="#c89a4e"
          metalness={0.95}
          roughness={0.22}
          emissive="#c89a4e"
          emissiveIntensity={0.28}
          transparent
          opacity={0}
        />
      </mesh>
    </>
  );
}

/* -------------------------------------------------------------------------- *
 * Chip-edge LEDs. A row of 6 small status LEDs along the substrate edge that
 * light up sequentially as the user scrolls - power-on / boot-sequence feel.
 * Each LED has a different colour for status variety: lime (power), gold
 * (status), 3x cyan (data), magenta (alert).
 * -------------------------------------------------------------------------- */
const LED_DEFS: Array<{ color: string; trigger: number; label: string }> = [
  { color: "#5fffa3", trigger: 0.02, label: "PWR" },
  { color: "#ffc94a", trigger: 0.06, label: "STAT" },
  { color: "#00f5ff", trigger: 0.1, label: "DATA0" },
  { color: "#00f5ff", trigger: 0.14, label: "DATA1" },
  { color: "#00f5ff", trigger: 0.19, label: "DATA2" },
  { color: "#ff3ad6", trigger: 0.26, label: "ALERT" },
];

function ChipLeds({ progress }: { progress: MotionValue<number> }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const haloRefs = useRef<(THREE.Mesh | null)[]>([]);
  /* Lay them out evenly along the front edge of the substrate (the +Z side). */
  const positions = LED_DEFS.map((_, i) => {
    const span = SUBSTRATE_W * 0.78;
    const start = -span / 2;
    const step = span / (LED_DEFS.length - 1);
    return [
      start + i * step,
      SUBSTRATE_H / 2 + 0.008,
      SUBSTRATE_D / 2 - 0.12,
    ] as [number, number, number];
  });

  useFrame((state) => {
    const p = progress.get();
    const t = state.clock.elapsedTime;
    const a5 = smoothstep(0.78, 1.0, p);
    for (let i = 0; i < LED_DEFS.length; i++) {
      const def = LED_DEFS[i];
      const lit = smoothstep(def.trigger, def.trigger + 0.04, p);
      /* Subtle breathing once lit so they feel "alive" rather than static */
      const breath = 0.85 + Math.sin(t * 2.4 + i) * 0.15;
      const intensity = lit * breath * (1 - a5 * 0.6);

      const led = refs.current[i];
      if (led) {
        const mat = led.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = intensity * 2.8;
        mat.opacity = 1 - a5 * 0.7;
        mat.transparent = true;
      }
      const halo = haloRefs.current[i];
      if (halo) {
        const mat = halo.material as THREE.MeshBasicMaterial;
        mat.opacity = intensity * 0.7;
      }
    }
  });

  return (
    <group>
      {positions.map((p, i) => (
        <group key={i} position={p}>
          {/* LED body - small dome */}
          <mesh
            ref={(el) => {
              refs.current[i] = el;
            }}
          >
            <sphereGeometry args={[0.028, 16, 16]} />
            <meshStandardMaterial
              color={LED_DEFS[i].color}
              metalness={0.2}
              roughness={0.3}
              emissive={LED_DEFS[i].color}
              emissiveIntensity={0}
              toneMapped={false}
            />
          </mesh>
          {/* Soft halo glow underneath each LED */}
          <mesh
            ref={(el) => {
              haloRefs.current[i] = el;
            }}
            position={[0, -0.018, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <circleGeometry args={[0.12, 24]} />
            <meshBasicMaterial
              color={LED_DEFS[i].color}
              transparent
              opacity={0}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* -------------------------------------------------------------------------- *
 * BGA gold pin grid - the array of solder balls underneath the substrate.
 * Real chips have these (Ball Grid Array). When the chip tilts in 3D they
 * become visible and add a huge dose of "this is a real chip" credibility.
 * -------------------------------------------------------------------------- */
const BGA_GRID = 12;

function BgaPinGrid({ progress }: { progress: MotionValue<number> }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Matrix4(), []);
  const spacing = (SUBSTRATE_W * 0.78) / (BGA_GRID - 1);
  const start = -(SUBSTRATE_W * 0.78) / 2;

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const p = progress.get();
    const t = state.clock.elapsedTime;
    const a4 = smoothstep(0.55, 0.78, p);
    const a5 = smoothstep(0.78, 1.0, p);
    for (let r = 0; r < BGA_GRID; r++) {
      for (let c = 0; c < BGA_GRID; c++) {
        const i = r * BGA_GRID + c;
        const restY = -SUBSTRATE_H / 2 - 0.045;
        /* Subtle wave ripple at rest */
        const ripple =
          Math.sin((r + c) * 0.55 - t * 1.5) * 0.04 * (1 - a4);
        /* Cascade fall during act 4 explode */
        const fall = lerp(0, -1.5 - ((i * 41) % 9) * 0.1, a4);
        dummy.makeTranslation(
          start + c * spacing,
          restY + ripple + fall,
          start + r * spacing,
        );
        mesh.setMatrixAt(i, dummy);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
    const mat = mesh.material as THREE.MeshStandardMaterial;
    if (mat) {
      mat.transparent = true;
      mat.opacity = 1 - a5;
    }
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, BGA_GRID * BGA_GRID]}
      castShadow
    >
      <sphereGeometry args={[0.048, 14, 14]} />
      <meshStandardMaterial
        color="#c89a4e"
        metalness={0.95}
        roughness={0.22}
        emissive="#c89a4e"
        emissiveIntensity={0.18}
      />
    </instancedMesh>
  );
}

/* Procedural brushed-metal normal map. Horizontal scratches encoded as
 * tangent-space normals (mostly +Z, with subtle +/-X perturbation along
 * scratch lines). Drawn once at module mount. */
function makeBrushedNormal(): THREE.Texture {
  if (typeof document === "undefined") return new THREE.Texture();
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  /* Base = +Z normal (128, 128, 255) in RGB */
  ctx.fillStyle = "rgb(128,128,255)";
  ctx.fillRect(0, 0, size, size);
  /* Horizontal scratch lines as slight luminance variation in R channel.
   * Each scratch is a thin row with random R offset, simulating tangent
   * perturbation along the X axis. */
  for (let i = 0; i < 600; i++) {
    const y = Math.random() * size;
    const len = 60 + Math.random() * 220;
    const x = Math.random() * (size - len);
    const r = 128 + (Math.random() - 0.5) * 26;
    const g = 128 + (Math.random() - 0.5) * 8;
    ctx.fillStyle = `rgb(${Math.round(r)},${Math.round(g)},255)`;
    ctx.fillRect(x, y, len, 1);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 0.6);
  tex.colorSpace = THREE.NoColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/* Detailed silicon-die surface texture. Reads as etched circuit cores +
 * cache lanes + IO ring + AX wordmark. Used as a colour map + emissive
 * map on the die mesh so it reads as a real chip, not a glowing plate. */
function makeDieFloorplan(): {
  diffuse: THREE.Texture;
  emissive: THREE.Texture;
} {
  if (typeof document === "undefined")
    return { diffuse: new THREE.Texture(), emissive: new THREE.Texture() };
  const size = 1024;
  /* DIFFUSE PASS - subtle dark silicon backplate */
  const diffuse = document.createElement("canvas");
  diffuse.width = diffuse.height = size;
  const dctx = diffuse.getContext("2d")!;
  dctx.fillStyle = "#050813";
  dctx.fillRect(0, 0, size, size);

  /* EMISSIVE PASS - the glowing circuit etchings */
  const emissive = document.createElement("canvas");
  emissive.width = emissive.height = size;
  const ectx = emissive.getContext("2d")!;
  ectx.fillStyle = "#000000";
  ectx.fillRect(0, 0, size, size);
  ectx.lineCap = "square";

  /* Outer IO ring */
  ectx.strokeStyle = "rgba(0,229,255,0.9)";
  ectx.lineWidth = 4;
  ectx.strokeRect(48, 48, size - 96, size - 96);
  ectx.strokeRect(70, 70, size - 140, size - 140);

  /* Contact pads around the IO ring */
  const ringR = size / 2 - 80;
  const cx = size / 2;
  const cy = size / 2;
  ectx.fillStyle = "rgba(0,229,255,0.92)";
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    const x = cx + Math.cos(a) * ringR;
    const y = cy + Math.sin(a) * ringR;
    ectx.beginPath();
    ectx.arc(x, y, 4, 0, Math.PI * 2);
    ectx.fill();
    ectx.strokeStyle = "rgba(125,240,255,0.55)";
    ectx.lineWidth = 1.6;
    ectx.beginPath();
    ectx.moveTo(x, y);
    ectx.lineTo(
      cx + Math.cos(a) * (ringR - 38),
      cy + Math.sin(a) * (ringR - 38),
    );
    ectx.stroke();
  }

  /* 4 core clusters in a 2x2 grid */
  const coreSize = 180;
  const coreOff = 108;
  const corePositions = [
    [cx - coreOff - coreSize / 2, cy - coreOff - coreSize / 2],
    [cx + coreOff + coreSize / 2 - coreSize, cy - coreOff - coreSize / 2],
    [cx - coreOff - coreSize / 2, cy + coreOff + coreSize / 2 - coreSize],
    [
      cx + coreOff + coreSize / 2 - coreSize,
      cy + coreOff + coreSize / 2 - coreSize,
    ],
  ];
  let coreIdx = 0;
  for (const [x, y] of corePositions) {
    /* Core boundary */
    ectx.strokeStyle = "rgba(0,229,255,0.85)";
    ectx.lineWidth = 2;
    ectx.strokeRect(x, y, coreSize, coreSize);
    /* Compute lanes */
    ectx.strokeStyle = "rgba(125,240,255,0.6)";
    ectx.lineWidth = 1.4;
    for (let i = 1; i < 7; i++) {
      const f = (i / 7) * coreSize;
      ectx.beginPath();
      ectx.moveTo(x + f, y);
      ectx.lineTo(x + f, y + coreSize);
      ectx.stroke();
    }
    for (let i = 1; i < 5; i++) {
      const f = (i / 5) * coreSize;
      ectx.beginPath();
      ectx.moveTo(x, y + f);
      ectx.lineTo(x + coreSize, y + f);
      ectx.stroke();
    }
    /* Core label */
    ectx.fillStyle = "rgba(0,229,255,0.95)";
    ectx.font = "bold 26px ui-monospace, Menlo, monospace";
    ectx.textAlign = "center";
    ectx.textBaseline = "middle";
    ectx.fillText(`C${coreIdx}`, x + coreSize / 2, y + coreSize / 2);
    coreIdx++;
  }

  /* Cache strip between cores - horizontal */
  ectx.strokeStyle = "rgba(0,229,255,0.85)";
  ectx.lineWidth = 1.8;
  ectx.strokeRect(cx - 100, cy - 24, 200, 48);
  for (let i = 1; i < 14; i++) {
    const f = (i / 14) * 200;
    ectx.beginPath();
    ectx.moveTo(cx - 100 + f, cy - 24);
    ectx.lineTo(cx - 100 + f, cy + 24);
    ectx.stroke();
  }
  /* Memory controller block - vertical */
  ectx.strokeRect(cx - 24, cy - 100, 48, 200);
  for (let i = 1; i < 14; i++) {
    const f = (i / 14) * 200;
    ectx.beginPath();
    ectx.moveTo(cx - 24, cy - 100 + f);
    ectx.lineTo(cx + 24, cy - 100 + f);
    ectx.stroke();
  }

  /* AX wordmark engraved on the die */
  ectx.fillStyle = "rgba(125,240,255,0.95)";
  ectx.font = "bold 64px ui-sans-serif, system-ui, sans-serif";
  ectx.textAlign = "center";
  ectx.textBaseline = "middle";
  ectx.fillText("AX-1", cx, cy + 260);
  ectx.font = "bold 20px ui-monospace, Menlo, monospace";
  ectx.fillStyle = "rgba(125,240,255,0.7)";
  ectx.fillText("CYBER / 0x4A12-FF8C", cx, cy + 300);

  const diffuseTex = new THREE.CanvasTexture(diffuse);
  const emissiveTex = new THREE.CanvasTexture(emissive);
  diffuseTex.colorSpace = THREE.SRGBColorSpace;
  emissiveTex.colorSpace = THREE.SRGBColorSpace;
  diffuseTex.needsUpdate = true;
  emissiveTex.needsUpdate = true;
  return { diffuse: diffuseTex, emissive: emissiveTex };
}

function makeStarTexture(): THREE.Texture {
  if (typeof document === "undefined") return new THREE.Texture();
  /* 128px so points stay crisp at any zoom level. */
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  /* Tighter falloff for a sharper centre dot + softer halo. */
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.18, "rgba(255,255,255,0.9)");
  g.addColorStop(0.45, "rgba(255,255,255,0.32)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

/* ----------------------------- MATH ----------------------------- */
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function clamp01(v: number) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}
function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}
