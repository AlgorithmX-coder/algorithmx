"use client";

/*
 * MissionBriefScene - Pixar 2.5D storybook briefing.
 *
 * Pure HTML/CSS/SVG + framer-motion. No WebGL, no R3F, no three.js.
 * The "3D feel" comes from layered depth: parallax sky, painted ridges,
 * stacked-CSS pedestal with beam, perspective-tilted mission cards,
 * and floating dust motes. Bulletproof rendering - no GPU contention,
 * no context loss, deterministic layout.
 *
 * Contract preserved with parent LessonPlayer Case 1:
 *   - phase: 0..3, mission cards reveal sequentially
 *   - onAccept(): fires when user taps "Accept Mission"
 *   - missions: length 3, see Mission type below
 */

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import PixIcon from "@/app/components/lesson/PixIcon";

/* ───────────────────────── PUBLIC API ───────────────────────── */

export type Mission = {
  icon: string;
  text: string;
  colour: string;
  glow: string;
};

export interface MissionBriefSceneProps {
  phase: number;
  onAccept: () => void;
  missions: Mission[];
  title?: string;
  subtitle?: string;
}

export default function MissionBriefScene({
  phase,
  onAccept,
  missions,
  title = "YOUR MISSION",
}: MissionBriefSceneProps) {
  // SCREEN-AUDIT REBUILD (user mandate): the brief is interactive — the
  // objective cards arrive face-down and the child TAPS each one to flip
  // it open. Accept is never disabled (gate-button class): while cards
  // remain face-down it reads "Tap your objectives!" and wobbles them.
  // The real Hacker Raccoon and the heroes stand in the scene.
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const [nudgeNonce, setNudgeNonce] = useState(0);
  const allFlipped = flipped.size >= missions.length;
  const flipCard = (i: number) => {
    setFlipped((s) => {
      if (s.has(i)) return s;
      const next = new Set(s);
      next.add(i);
      return next;
    });
  };

  // Subtle mouse-parallax for storybook depth
  const [px, setPx] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setPx({ x, y });
    };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "min(82vh, 760px)",
        borderRadius: 28,
        overflow: "hidden",
        background: "#04050d",
        boxShadow:
          "0 40px 90px -30px rgba(8, 10, 22, 0.7), " +
          "0 0 0 1px rgba(125, 240, 255, 0.25) inset, " +
          "0 0 60px rgba(0, 229, 255, 0.12) inset",
        fontFamily:
          "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
      }}
    >
      <SkyBackdrop px={px} />
      <DistantRidges px={px} />
      <StarField />
      <FloatingParticles />
      <WoodFloor />
      <HoloPedestal />
      <BeamRays />

      <CastRow px={px} />
      <MissionCardsRow
        missions={missions}
        phase={phase}
        flipped={flipped}
        onFlip={flipCard}
        nudgeNonce={nudgeNonce}
      />

      <TitlePlate title={title} />
      <ProgressDots phase={phase} />
      <AcceptButton
        phase={phase}
        allFlipped={allFlipped}
        onAccept={() => {
          if (allFlipped) onAccept();
          else setNudgeNonce((n) => n + 1);
        }}
      />

      <Vignette />
      <KeyframeStyles />
    </div>
  );
}

/* ───────────────────────── CAST ─────────────────────────
   The heroes and the REAL Hacker Raccoon stand in the scene — the
   briefing is a stand-off, not a slideshow. Art from the shared
   character set; parallax keeps them in the world. */

function CastRow({ px }: { px: { x: number; y: number } }) {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 5, pointerEvents: "none" }}>
      {/* Heroes — bottom left, facing in (transparent sprites; the duo
          PNG has a baked-in background so it can't sit in a scene) */}
      <motion.img
        src="/game/characters/adam-idle.png"
        alt=""
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0, y: [0, -5, 0] }}
        transition={{ opacity: { duration: 0.6, delay: 0.4 }, x: { duration: 0.6, delay: 0.4 }, y: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}
        style={{
          position: "absolute", left: "3%", bottom: "4%", height: "27%",
          transform: `translate(${px.x * 6}px, ${px.y * 3}px)`,
          filter: "drop-shadow(0 14px 20px rgba(2,4,12,0.7))",
        }}
      />
      <motion.img
        src="/game/characters/layla-idle.png"
        alt=""
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0, y: [0, -4, 0] }}
        transition={{ opacity: { duration: 0.6, delay: 0.55 }, x: { duration: 0.6, delay: 0.55 }, y: { duration: 3.3, repeat: Infinity, ease: "easeInOut" } }}
        style={{
          position: "absolute", left: "10.5%", bottom: "4%", height: "24%",
          transform: `translate(${px.x * 5}px, ${px.y * 3}px)`,
          filter: "drop-shadow(0 14px 20px rgba(2,4,12,0.7))",
        }}
      />
      <div style={{ position: "absolute", left: "3%", bottom: "3.5%", width: "16%", height: 16, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(2,4,12,0.5), transparent 70%)" }} />

      {/* The Hacker Raccoon — bottom right, plotting */}
      <motion.img
        src="/game/characters/raccoon-taunt.png"
        alt=""
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0, y: [0, -7, 0] }}
        transition={{ opacity: { duration: 0.6, delay: 0.7 }, x: { duration: 0.6, delay: 0.7 }, y: { duration: 3.4, repeat: Infinity, ease: "easeInOut" } }}
        style={{
          position: "absolute", right: "3%", bottom: "4%", height: "26%",
          transform: `translate(${px.x * 8}px, ${px.y * 4}px)`,
          filter: "drop-shadow(0 12px 18px rgba(2,4,12,0.7)) drop-shadow(0 0 24px rgba(124,92,255,0.25))",
        }}
      />
      <div style={{ position: "absolute", right: "4%", bottom: "3.5%", width: "12%", height: 14, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(2,4,12,0.5), transparent 70%)" }} />
    </div>
  );
}

/* ───────────────────────── SKY BACKDROP ───────────────────────── */

function SkyBackdrop({ px }: { px: { x: number; y: number } }) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: -20,
        zIndex: 0,
        // Cyber Heroes Lab sky - abyss → twilight navy → midnight,
        // replaces the warm sunset that was bleeding orange into the
        // mission brief surface.
        background:
          "linear-gradient(180deg, " +
          "#04050d 0%, " +
          "#0f1530 25%, " +
          "#1a2147 55%, " +
          "#252d5e 78%, " +
          "#1a2147 92%, " +
          "#0f1530 100%)",
        transform: `translate(${px.x * -4}px, ${px.y * -2}px)`,
        transition: "transform 0.5s ease-out",
      }}
    >
      {/* Cyan/cosmic halo - top right (replaces the warm sun) */}
      <div
        style={{
          position: "absolute",
          top: "32%",
          right: "22%",
          width: 320,
          height: 320,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0, 229, 255, 0.55) 0%, rgba(124, 92, 255, 0.32) 25%, rgba(124, 92, 255, 0.08) 55%, transparent 100%)",
          filter: "blur(4px)",
          animation: "sunPulse 6s ease-in-out infinite",
        }}
      />
    </div>
  );
}

/* ───────────────────────── DISTANT RIDGES ───────────────────────── */

function DistantRidges({ px }: { px: { x: number; y: number } }) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: "32%",
        height: "32%",
        zIndex: 1,
        pointerEvents: "none",
        transform: `translateX(${px.x * -8}px)`,
        transition: "transform 0.5s ease-out",
      }}
    >
      <svg
        viewBox="0 0 1200 240"
        preserveAspectRatio="none"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        {/* Far ridge */}
        <path
          d="M0,240 L0,160 Q60,140 120,150 Q200,120 280,140 Q360,110 460,135 Q540,105 640,130 Q740,100 840,125 Q940,95 1040,115 Q1130,135 1200,120 L1200,240 Z"
          fill="#3a1a3e"
          opacity="0.65"
        />
        {/* Mid ridge */}
        <path
          d="M0,240 L0,180 Q90,150 180,170 Q280,135 380,165 Q480,145 580,170 Q680,140 780,165 Q880,145 980,170 Q1090,150 1200,165 L1200,240 Z"
          fill="#5a2540"
          opacity="0.75"
        />
        {/* Near ridge */}
        <path
          d="M0,240 L0,205 Q120,180 240,195 Q360,170 480,195 Q600,175 720,200 Q840,180 960,205 Q1080,185 1200,205 L1200,240 Z"
          fill="#2a1230"
          opacity="0.9"
        />
      </svg>
    </div>
  );
}

/* ───────────────────────── STAR FIELD ───────────────────────── */

function StarField() {
  // Stable positions via memo (not random per render)
  const stars = useMemo(
    () =>
      Array.from({ length: 50 }, (_, i) => ({
        left: (i * 37 + 13) % 100,
        top: ((i * 19 + 7) % 35),
        size: 1 + ((i * 11) % 3) * 0.5,
        opacity: 0.4 + ((i * 7) % 5) / 10,
        delay: (i * 0.13) % 4,
      })),
    []
  );

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
      }}
    >
      {stars.map((s, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            background: "#fff7e6",
            opacity: s.opacity,
            boxShadow: `0 0 ${s.size * 3}px rgba(255, 240, 200, 0.6)`,
            animation: `starTwinkle ${3 + (i % 3)}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ───────────────────────── FLOATING PARTICLES (dust motes) ───────────────────────── */

function FloatingParticles() {
  const motes = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        left: (i * 41 + 17) % 100,
        top: 30 + ((i * 23) % 60),
        size: 2 + ((i * 7) % 4),
        duration: 8 + ((i * 5) % 8),
        delay: (i * 0.43) % 8,
        drift: ((i * 13) % 30) - 15,
        // Alternate cyan / violet motes for cosmic palette coherence.
        // Replaces the warm gold dust that clashed with the cyber sky.
        cyan: i % 2 === 0,
      })),
    []
  );

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 3,
        pointerEvents: "none",
      }}
    >
      {motes.map((m, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: `${m.left}%`,
            top: `${m.top}%`,
            width: m.size,
            height: m.size,
            borderRadius: "50%",
            background: m.cyan ? "rgba(125, 240, 255, 0.85)" : "rgba(160, 143, 255, 0.85)",
            boxShadow: m.cyan
              ? `0 0 ${m.size * 4}px rgba(0, 229, 255, 0.6)`
              : `0 0 ${m.size * 4}px rgba(124, 92, 255, 0.6)`,
            animation: `moteFloat ${m.duration}s ease-in-out ${m.delay}s infinite`,
            ["--moteDrift" as string]: `${m.drift}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

/* ───────────────────────── CYBER FLOOR ───────────────────────── */
/*
 * Was a wooden floor (tonal mismatch - warm Pixar inside cyber sky).
 * Now a chrome / glass platform with cyan grid lines, matching the
 * Cyber Heroes Lab vocabulary used everywhere else in the player.
 */

function WoodFloor() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        left: "50%",
        bottom: "-8%",
        transform: "translateX(-50%)",
        width: "150%",
        height: "55%",
        zIndex: 2,
        pointerEvents: "none",
      }}
    >
      {/* Chrome plate - deep navy with cyan rim */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50% / 24%",
          background:
            "radial-gradient(ellipse at 50% 30%, " +
            "#1a2147 0%, " +
            "#0f1530 35%, " +
            "#080a16 70%, " +
            "#04050d 100%)",
          boxShadow:
            "inset 0 -40px 80px rgba(8, 10, 22, 0.65), " +
            "inset 0 0 0 1px rgba(125, 240, 255, 0.18)",
        }}
      />
      {/* Concentric cyan rings - radar/grid feel */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50% / 24%",
          background:
            "repeating-radial-gradient(ellipse at 50% 28%, " +
            "transparent 0px, " +
            "transparent 38px, " +
            "rgba(0, 229, 255, 0.10) 39px, " +
            "rgba(0, 229, 255, 0.10) 40px)",
          mixBlendMode: "screen",
          opacity: 0.85,
        }}
      />
      {/* Soft cyan glow at the centre of the disc */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "20%",
          transform: "translateX(-50%)",
          width: "55%",
          height: "30%",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, rgba(0, 229, 255, 0.18) 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />
    </div>
  );
}

/* ───────────────────────── HOLO PEDESTAL ───────────────────────── */
/*
 * Was a brown wooden cylinder with warm gold emissive top - clashed
 * with the cyber sky.  Now a chrome / dark-navy pedestal with a
 * cyan emissive disc, matching the cyber palette throughout.
 */

function HoloPedestal() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        left: "50%",
        bottom: "8%",
        transform: "translateX(-50%)",
        zIndex: 4,
        pointerEvents: "none",
      }}
    >
      {/* Drop shadow on floor */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: -12,
          transform: "translateX(-50%)",
          width: 280,
          height: 30,
          borderRadius: "50%",
          background: "rgba(8, 10, 22, 0.65)",
          filter: "blur(18px)",
        }}
      />
      {/* Outer flange - chrome chamfer */}
      <div
        style={{
          position: "relative",
          width: 280,
          height: 32,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at 50% 35%, #1f2855 0%, #0a0e22 100%)",
          boxShadow:
            "0 6px 14px rgba(8, 10, 22, 0.6), inset 0 -3px 6px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(125, 240, 255, 0.22)",
        }}
      />
      {/* Cylinder body - chrome */}
      <div
        style={{
          position: "relative",
          marginTop: -14,
          marginLeft: 18,
          width: 244,
          height: 56,
          background:
            "linear-gradient(90deg, #0f1530 0%, #1a2147 25%, #252d5e 50%, #1a2147 75%, #0f1530 100%)",
          borderRadius: "8px / 4px",
          boxShadow:
            "inset 0 -8px 14px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(125, 240, 255, 0.18)",
        }}
      />
      {/* Top inset disc - chrome bowl */}
      <div
        style={{
          position: "relative",
          marginTop: -12,
          marginLeft: 22,
          width: 236,
          height: 28,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at 50% 35%, #1a2147 0%, #04050d 100%)",
          boxShadow:
            "inset 0 4px 10px rgba(0,0,0,0.6), 0 -2px 0 rgba(125, 240, 255, 0.18)",
        }}
      />
      {/* Glowing cyan emissive top - pulses */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 56,
          transform: "translateX(-50%)",
          width: 200,
          height: 22,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(220, 250, 255, 0.95) 0%, rgba(125, 240, 255, 0.85) 30%, rgba(0, 229, 255, 0.55) 60%, transparent 100%)",
          filter: "blur(2px)",
          animation: "pedestalGlow 2.4s ease-in-out infinite",
        }}
      />
      {/* Ring rim - cyan */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 60,
          transform: "translateX(-50%)",
          width: 220,
          height: 18,
          borderRadius: "50%",
          border: "2px solid rgba(0, 229, 255, 0.7)",
          boxShadow:
            "0 0 20px rgba(0, 229, 255, 0.55), inset 0 0 10px rgba(125, 240, 255, 0.4)",
        }}
      />
    </div>
  );
}

/* ───────────────────────── BEAM RAYS ───────────────────────── */

function BeamRays() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        left: "50%",
        bottom: "13%",
        transform: "translateX(-50%)",
        width: 400,
        height: "60%",
        zIndex: 3,
        pointerEvents: "none",
        clipPath: "polygon(38% 0%, 62% 0%, 88% 100%, 12% 100%)",
        // Was warm-gold beams (clashed with cyber sky). Now a cool
        // cyan/violet projector beam that reads as a holo emitter.
        background:
          "linear-gradient(to top, " +
          "rgba(0, 229, 255, 0) 0%, " +
          "rgba(0, 229, 255, 0.32) 35%, " +
          "rgba(125, 240, 255, 0.6) 75%, " +
          "rgba(220, 250, 255, 0.85) 100%)",
        mixBlendMode: "screen",
        animation: "beamShimmer 3.6s ease-in-out infinite",
      }}
    />
  );
}

/* ───────────────────────── MISSION CARDS ───────────────────────── */

function MissionCardsRow({
  missions,
  phase,
  flipped,
  onFlip,
  nudgeNonce,
}: {
  missions: Mission[];
  phase: number;
  flipped: Set<number>;
  onFlip: (i: number) => void;
  nudgeNonce: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "38%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: 22,
        zIndex: 6,
        perspective: "1200px",
      }}
    >
      {missions.map((m, i) => (
        <MissionCard
          key={i}
          mission={m}
          index={i}
          visible={phase > i}
          isMiddle={i === Math.floor((missions.length - 1) / 2)}
          flipped={flipped.has(i)}
          onFlip={() => onFlip(i)}
          nudgeNonce={nudgeNonce}
        />
      ))}
    </div>
  );
}

function MissionCard({
  mission,
  index,
  visible,
  isMiddle,
  flipped,
  onFlip,
  nudgeNonce,
}: {
  mission: Mission;
  index: number;
  visible: boolean;
  isMiddle: boolean;
  flipped: boolean;
  onFlip: () => void;
  nudgeNonce: number;
}) {
  return (
    <motion.button
      type="button"
      onClick={onFlip}
      aria-pressed={flipped}
      aria-label={flipped ? mission.text : `Objective ${index + 1} — tap to reveal`}
      initial={{ opacity: 0, y: 50, scale: 0.6, rotateX: 30 }}
      animate={
        visible
          ? flipped || nudgeNonce === 0
            ? { opacity: 1, y: 0, scale: 1, rotateX: 0, x: 0 }
            : { opacity: 1, y: 0, scale: 1, rotateX: 0, x: [0, -6, 6, -3, 0] }
          : { opacity: 0, y: 50, scale: 0.6, rotateX: 30 }
      }
      transition={{
        type: "spring",
        stiffness: 220,
        damping: 22,
        delay: visible ? index * 0.08 : 0,
      }}
      // nudgeNonce keys the wobble so every Accept press replays it on
      // the cards that are still face-down.
      data-nudge={nudgeNonce}
      style={{
        position: "relative",
        width: 196,
        height: 154,
        border: "none",
        outline: "none",
        WebkitTapHighlightColor: "transparent",
        background: "transparent",
        padding: 0,
        cursor: flipped ? "default" : "pointer",
        touchAction: "manipulation",
        fontFamily: "inherit",
        transformStyle: "preserve-3d",
        WebkitTransformStyle: "preserve-3d",
        transform: isMiddle ? "translateY(-18px) scale(1.08)" : undefined,
      }}
    >
      {/* Outer glow halo */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: -16,
          borderRadius: 28,
          background: `radial-gradient(ellipse at 50% 50%, ${mission.glow} 0%, transparent 70%)`,
          filter: "blur(8px)",
          opacity: flipped ? 0.7 : 0.45,
          animation: `cardGlow 3.${index}s ease-in-out infinite`,
          transition: "opacity 400ms ease",
        }}
      />
      {/* 3D flipper */}
      {/* NOTE: no CSS `animation` here — a CSS transform animation
          overrides framer's rotateY and the flip never renders. */}
      <motion.div
        aria-hidden
        animate={{ rotateY: flipped ? 0 : 180 }}
        initial={false}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        style={{
          position: "absolute",
          inset: 0,
          transformStyle: "preserve-3d",
          WebkitTransformStyle: "preserve-3d",
          // Own compositing layer: steadier 3D rasterization, which also helps
          // suppress the mid-card seam on GPUs prone to it.
          willChange: "transform",
        }}
      >
        {/* FRONT (revealed objective) — glassy night panel */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 18,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            // Lift the two faces apart in depth (front +1px, back -1px) so they
            // are NOT coplanar. Coplanar preserve-3d faces z-fight on some GPUs
            // (notably Windows/Edge at high DPI), which rendered a stray line
            // straight down the middle of the card at rest. The 1px separation
            // is invisible in 2D but gives the compositor an unambiguous order.
            transform: "translateZ(1px)",
            // OPAQUE (no alpha): a semi-transparent face let the other face
            // bleed through along that seam. Solid navy can't.
            background: "linear-gradient(180deg, rgb(22,28,62) 0%, rgb(12,16,40) 100%)",
            // A dark 2px hairline at the very edge, with the accent ring just
            // INSIDE it. When the card turns edge-on mid-flip its outer sliver
            // reads dark (blends into the scene) instead of a bright accent-
            // coloured "line" — that stray line was most visible on the amber
            // objective card (looked yellow). Face-on is unchanged.
            boxShadow:
              `0 18px 40px -12px rgba(2, 4, 12, 0.75), ` +
              `0 0 0 2px rgba(4, 5, 13, 0.98) inset, ` +
              `0 0 0 3.5px ${mission.colour}88 inset, ` +
              `0 -3px 0 ${mission.colour}44 inset, ` +
              `0 0 30px ${mission.glow}`,
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, background: `linear-gradient(90deg, ${mission.colour}aa, ${mission.colour}, ${mission.colour}aa)` }} />
          <div style={{ position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)", fontSize: 44, lineHeight: 1, filter: `drop-shadow(0 0 18px ${mission.glow})` }}>
            <PixIcon emoji={mission.icon} size={52} />
          </div>
          <div style={{ position: "absolute", top: 74, left: 0, right: 0, textAlign: "center", color: mission.colour, fontSize: 10, fontWeight: 800, letterSpacing: 2 }}>
            OBJECTIVE 0{index + 1}
          </div>
          <div style={{ position: "absolute", top: 92, left: 12, right: 12, textAlign: "center", color: "#f2f6ff", fontSize: 13, fontWeight: 700, lineHeight: 1.25 }}>
            {mission.text}
          </div>
        </div>

        {/* BACK (face-down) — sealed envelope, tap to open */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 18,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            // rotateY keeps it on the reverse side; translateZ(1px) (applied in
            // its own rotated frame) pushes it a further 1px behind the front so
            // the two faces never share a plane — see the front face note.
            transform: "rotateY(180deg) translateZ(1px)",
            // OPAQUE so the front can't bleed through the seam either.
            background: "linear-gradient(180deg, rgb(26,33,71) 0%, rgb(15,21,48) 100%)",
            // Same dark-edge treatment as the front so the face-down card's
            // cyan edge doesn't flash a line as it turns edge-on mid-flip.
            boxShadow:
              `0 18px 40px -12px rgba(2, 4, 12, 0.75), ` +
              `0 0 0 2px rgba(4, 5, 13, 0.98) inset, ` +
              `0 0 0 3.5px rgba(125,240,255,0.4) inset, ` +
              `0 0 24px rgba(0,229,255,0.18)`,
            overflow: "hidden",
            display: "grid",
            placeItems: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40, lineHeight: 1, marginBottom: 8, filter: "drop-shadow(0 0 14px rgba(125,240,255,0.5))" }}>
              <PixIcon emoji="✉️" size={48} />
            </div>
            <div style={{ color: "#7df0ff", fontSize: 10, fontWeight: 800, letterSpacing: 2 }}>
              OBJECTIVE 0{index + 1}
            </div>
            <div style={{ color: "#f2f6ff", fontSize: 13, fontWeight: 800, marginTop: 4 }}>
              TAP TO OPEN
            </div>
          </div>
        </div>
      </motion.div>
    </motion.button>
  );
}

/* ───────────────────────── TITLE PLATE ───────────────────────── */

function TitlePlate({ title }: { title: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
      style={{
        position: "absolute",
        top: 28,
        left: 0,
        right: 0,
        textAlign: "center",
        zIndex: 8,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "inline-block",
          padding: "6px 20px",
          background: "rgba(0, 229, 255, 0.10)",
          border: "1px solid rgba(125, 240, 255, 0.55)",
          borderRadius: 999,
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          color: "#7df0ff",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 5,
          textTransform: "uppercase",
          marginBottom: 12,
          fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
          textShadow: "0 0 12px rgba(0, 229, 255, 0.55)",
        }}
      >
        ◇ Mission Briefing ◇
      </div>
      <h1
        style={{
          margin: 0,
          fontSize: "clamp(32px, 4.6vw, 54px)",
          fontWeight: 900,
          color: "#e8edff",
          letterSpacing: 0.5,
          lineHeight: 1,
          whiteSpace: "nowrap",
          textShadow:
            "0 4px 18px rgba(8, 10, 22, 0.65), " +
            "0 0 28px rgba(0, 229, 255, 0.55), " +
            "0 0 56px rgba(124, 92, 255, 0.4)",
        }}
      >
        {title}
      </h1>
    </motion.div>
  );
}

/* ───────────────────────── PROGRESS DOTS ───────────────────────── */

function ProgressDots({ phase }: { phase: number }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 28,
        right: 28,
        display: "flex",
        gap: 8,
        zIndex: 8,
      }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background:
              phase > i
                ? "linear-gradient(135deg, #7df0ff, #7c5cff)"
                : "rgba(125, 240, 255, 0.18)",
            boxShadow:
              phase > i
                ? "0 0 14px rgba(0, 229, 255, 0.7), 0 0 28px rgba(124, 92, 255, 0.4)"
                : "none",
            transition: "all 0.4s ease",
          }}
        />
      ))}
    </div>
  );
}

/* ───────────────────────── ACCEPT BUTTON ───────────────────────── */

function AcceptButton({
  phase,
  allFlipped,
  onAccept,
}: {
  phase: number;
  allFlipped: boolean;
  onAccept: () => void;
}) {
  const visible = phase >= 3;
  return (
    <div
      style={{
        position: "absolute",
        bottom: 30,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <motion.div
        initial={false}
        animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.button
          onClick={onAccept}
          whileHover={{ y: -3, scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 320, damping: 18 }}
          style={{
            border: "none",
            cursor: "pointer",
            padding: "16px 38px",
            fontSize: 18,
            fontWeight: 800,
            color: allFlipped ? "#080a16" : "#cfe0ff",
            background: allFlipped
              ? "linear-gradient(135deg, #00e5ff, #7c5cff)"
              : "linear-gradient(135deg, rgba(40,50,100,0.85), rgba(30,36,80,0.85))",
            borderRadius: 999,
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
            letterSpacing: 1,
            textTransform: "uppercase",
            boxShadow: allFlipped
              ? "0 0 24px rgba(0, 229, 255, 0.55), " +
                "0 8px 20px -6px rgba(0, 229, 255, 0.45), " +
                "0 0 0 1px rgba(125, 240, 255, 0.6) inset"
              : "0 8px 20px -8px rgba(2,4,12,0.7), 0 0 0 1px rgba(125, 240, 255, 0.35) inset",
            transition: "background 300ms ease, color 300ms ease",
          }}
        >
          {allFlipped ? "Accept Mission →" : "Tap your objectives!"}
        </motion.button>
      </motion.div>
    </div>
  );
}

/* ───────────────────────── VIGNETTE ───────────────────────── */

function Vignette() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 5,
        pointerEvents: "none",
        background:
          "radial-gradient(ellipse at center, transparent 50%, rgba(4, 5, 13, 0.65) 100%)",
      }}
    />
  );
}

/* ───────────────────────── KEYFRAMES ───────────────────────── */

function KeyframeStyles() {
  return (
    <style>{`
      @keyframes sunPulse {
        0%, 100% { opacity: 0.92; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.04); }
      }
      @keyframes starTwinkle {
        0%, 100% { opacity: 0.4; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.2); }
      }
      @keyframes moteFloat {
        0% { transform: translate(0, 0); opacity: 0; }
        15% { opacity: 1; }
        85% { opacity: 1; }
        100% { transform: translate(var(--moteDrift, 0), -120px); opacity: 0; }
      }
      @keyframes pedestalGlow {
        0%, 100% { opacity: 0.85; filter: blur(2px); }
        50% { opacity: 1; filter: blur(4px); }
      }
      @keyframes beamShimmer {
        0%, 100% { opacity: 0.85; }
        50% { opacity: 1; }
      }
      @keyframes cardGlow {
        0%, 100% { opacity: 0.55; }
        50% { opacity: 0.85; }
      }
      @keyframes cardBob {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-4px); }
      }
      @keyframes portraitBob {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-3px); }
      }
    `}</style>
  );
}
