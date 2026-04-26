"use client";

/*
 * PixarScenes — a small library of distinct, animated backdrops that
 * share the warm dusk Pixar palette but each carry their own unique
 * visual hook (3D globe halo, lighthouse beam, drifting alchemy
 * glyphs, mountain ridges, etc).
 *
 * Each scene is a fixed-position layer (zIndex 0, pointer-events: none)
 * meant to sit behind a normal page. They are all CSS/SVG/motion based
 * — no WebGL, no GPU contention.
 *
 * Conventions:
 *   <ScenePage variant>   — drop in once at the top of a page
 *   <ScenePanelGlobe>     — a side-panel scene used in split-screen
 *                           layouts (e.g. /login right-half)
 */

import { useMemo } from "react";

const KEYFRAMES = `
@keyframes pxStarTwinkle {
  0%,100% { opacity: 0.35; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.25); }
}
@keyframes pxMoteRise {
  0% { transform: translate(0, 0); opacity: 0; }
  15% { opacity: 1; }
  85% { opacity: 1; }
  100% { transform: translate(var(--mx, 0), -55vh); opacity: 0; }
}
@keyframes pxFireflyFloat {
  0%,100% { transform: translate(0, 0); }
  25% { transform: translate(20px, -30px); }
  50% { transform: translate(-12px, -54px); }
  75% { transform: translate(8px, -32px); }
}
@keyframes pxLightSweep {
  0%,100% { transform: rotate(-25deg); opacity: 0.4; }
  50% { transform: rotate(25deg); opacity: 0.85; }
}
@keyframes pxAuroraDrift {
  0%,100% { transform: translateX(-8%); opacity: 0.6; }
  50% { transform: translateX(8%); opacity: 0.95; }
}
@keyframes pxRuneDrift {
  0%,100% { transform: translateY(0) rotate(0deg); opacity: 0.18; }
  50% { transform: translateY(-14px) rotate(8deg); opacity: 0.4; }
}
@keyframes pxBookFloat {
  0%,100% { transform: translateY(0) rotate(var(--r, 0deg)); }
  50% { transform: translateY(-22px) rotate(calc(var(--r, 0deg) + 6deg)); }
}
@keyframes pxConstellationDraw {
  from { stroke-dashoffset: var(--len, 200); }
  to { stroke-dashoffset: 0; }
}
@keyframes pxBeaconPulse {
  0%,100% { opacity: 0.4; }
  50% { opacity: 1; }
}
@keyframes pxCloudDrift {
  from { transform: translateX(-10%); }
  to { transform: translateX(110%); }
}
@keyframes pxHeroBob {
  0%,100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
`;

const PALETTE = {
  // Sky stops — used by all variants
  duskTop: "#1a0612",
  duskMid: "#2a0d2e",
  duskHorizon: "#5a2540",
  duskHaze: "#a04a4a",
  duskFloor: "#e88550",
  duskGlow: "#fcd58a",
  // Accents
  goldLight: "#ffd58a",
  goldMid: "#ff9b4a",
  goldDeep: "#d4733a",
  coral: "#f08e7e",
  ember: "#c4513a",
  moss: "#7cc89a",
  blossom: "#f7c1d6",
  cream: "#fff7e6",
  violet: "#a06aff",
};

/* ───────────────────────── BASE LAYERS ───────────────────────── */

function SkyGradientLayer({
  bottom = false,
}: {
  bottom?: boolean;
}) {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        background: bottom
          ? `linear-gradient(180deg, ${PALETTE.duskTop} 0%, ${PALETTE.duskMid} 30%, ${PALETTE.duskHorizon} 60%, ${PALETTE.duskHaze} 88%, ${PALETTE.duskFloor} 100%)`
          : `radial-gradient(ellipse at 50% -10%, #4a1a4a 0%, ${PALETTE.duskMid} 35%, ${PALETTE.duskTop} 70%, #0a0410 100%)`,
      }}
    />
  );
}

function StarLayer({ count = 35, topPct = 80 }: { count?: number; topPct?: number }) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: (i * 37 + 13) % 100,
        top: (i * 19 + 7) % topPct,
        size: 1 + ((i * 11) % 3) * 0.5,
        opacity: 0.35 + ((i * 7) % 5) / 12,
        delay: (i * 0.13) % 4,
      })),
    [count, topPct],
  );
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
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
            background: PALETTE.cream,
            opacity: s.opacity,
            boxShadow: `0 0 ${s.size * 3}px rgba(255, 240, 200, 0.6)`,
            animation: `pxStarTwinkle ${3 + (i % 3)}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function MoteLayer({
  count = 22,
  color = "rgba(255, 220, 170, 0.85)",
  duration = 14,
}: {
  count?: number;
  color?: string;
  duration?: number;
}) {
  const motes = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: (i * 41 + 17) % 100,
        top: 30 + ((i * 19) % 60),
        size: 2 + ((i * 5) % 4),
        duration: duration + ((i * 3) % 8),
        delay: (i * 0.41) % 8,
        drift: ((i * 11) % 30) - 15,
      })),
    [count, duration],
  );
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      {motes.map((m, i) => (
        <span
          key={i}
          style={
            {
              position: "absolute",
              left: `${m.left}%`,
              top: `${m.top}%`,
              width: m.size,
              height: m.size,
              borderRadius: "50%",
              background: color,
              boxShadow: `0 0 ${m.size * 4}px rgba(255, 200, 140, 0.6)`,
              animation: `pxMoteRise ${m.duration}s ease-in-out ${m.delay}s infinite`,
              "--mx": `${m.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

function MountainRidges({ tint = PALETTE.duskMid }: { tint?: string }) {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        height: "38vh",
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      <svg viewBox="0 0 1200 240" preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block" }}>
        <path
          d="M0,240 L0,160 Q60,140 120,150 Q200,120 280,140 Q360,110 460,135 Q540,105 640,130 Q740,100 840,125 Q940,95 1040,115 Q1130,135 1200,120 L1200,240 Z"
          fill="#3a1a3e"
          opacity="0.65"
        />
        <path
          d="M0,240 L0,180 Q90,150 180,170 Q280,135 380,165 Q480,145 580,170 Q680,140 780,165 Q880,145 980,170 Q1090,150 1200,165 L1200,240 Z"
          fill={tint}
          opacity="0.78"
        />
        <path
          d="M0,240 L0,205 Q120,180 240,195 Q360,170 480,195 Q600,175 720,200 Q840,180 960,205 Q1080,185 1200,205 L1200,240 Z"
          fill={PALETTE.duskTop}
          opacity="0.92"
        />
      </svg>
    </div>
  );
}

function SunGlow({
  x = "78%",
  y = "22%",
  size = 360,
  intensity = 0.7,
}: {
  x?: string;
  y?: string;
  size?: number;
  intensity?: number;
}) {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        left: x,
        top: y,
        width: size,
        height: size,
        transform: "translate(-50%, -50%)",
        borderRadius: "50%",
        background: `radial-gradient(circle, rgba(255, 250, 220, ${intensity}) 0%, rgba(255, 220, 150, ${intensity * 0.5}) 18%, rgba(255, 160, 90, ${intensity * 0.2}) 50%, transparent 100%)`,
        filter: "blur(2px)",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}

/* ───────────────────────── SCENE: DUSK VALLEY ─────────────────────────
 * Default Pixar dusk — sky gradient, drifting motes, twinkling stars,
 * mountain silhouettes, sun glow. Used by the dashboards. */

export function DuskValleyScene() {
  return (
    <>
      <style>{KEYFRAMES}</style>
      <SkyGradientLayer />
      <StarLayer count={45} />
      <SunGlow />
      <MoteLayer count={26} />
      <MountainRidges />
    </>
  );
}

/* ───────────────────────── SCENE: AURORA DAWN ─────────────────────────
 * Bright auroral curtains for landing/marketing. Less moody, more wow. */

export function AuroraDawnScene() {
  return (
    <>
      <style>{KEYFRAMES}</style>
      <SkyGradientLayer />
      <StarLayer count={30} topPct={60} />
      {/* Aurora ribbon */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          left: "-15%",
          right: "-15%",
          top: "10%",
          height: "55vh",
          zIndex: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(247, 193, 214, 0.28) 0%, rgba(160, 106, 255, 0.18) 30%, rgba(255, 178, 110, 0.16) 55%, transparent 75%)",
          filter: "blur(40px)",
          animation: "pxAuroraDrift 16s ease-in-out infinite",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "fixed",
          left: "-20%",
          right: "-20%",
          top: "30%",
          height: "40vh",
          zIndex: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(255, 213, 138, 0.32) 0%, rgba(255, 155, 74, 0.18) 40%, transparent 80%)",
          filter: "blur(50px)",
          animation: "pxAuroraDrift 22s ease-in-out 2s infinite reverse",
        }}
      />
      <SunGlow x="20%" y="15%" size={420} intensity={0.55} />
      <MoteLayer count={32} color="rgba(255, 213, 168, 0.85)" duration={11} />
    </>
  );
}

/* ───────────────────────── SCENE: CONSTELLATION ─────────────────────────
 * Stars connected by faint trails, like a constellation map. Used for
 * /signup. Each "constellation" draws on stagger. */

export function ConstellationScene() {
  return (
    <>
      <style>{KEYFRAMES}</style>
      <SkyGradientLayer />
      <StarLayer count={55} topPct={90} />
      {/* Connecting lines — 3 small constellation clusters */}
      <svg
        aria-hidden
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <defs>
          <linearGradient id="pxConstGrad" x1="0" x2="1">
            <stop offset="0%" stopColor={PALETTE.goldLight} stopOpacity="0.2" />
            <stop offset="50%" stopColor={PALETTE.goldLight} stopOpacity="0.65" />
            <stop offset="100%" stopColor={PALETTE.goldLight} stopOpacity="0.2" />
          </linearGradient>
        </defs>
        {/* Lyra-ish */}
        <g
          stroke="url(#pxConstGrad)"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          style={{
            strokeDasharray: 600,
            animation: "pxConstellationDraw 6s ease-out forwards",
          }}
        >
          <path d="M120 140 L 220 200 L 280 280 L 200 360 L 130 320 L 120 140" />
        </g>
        {/* Right cluster */}
        <g
          stroke="url(#pxConstGrad)"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          style={{
            strokeDasharray: 700,
            animation: "pxConstellationDraw 7s ease-out 0.8s forwards",
          }}
        >
          <path d="M880 90 L 980 160 L 1060 240 L 1110 340 L 1020 380 L 940 320 L 880 90" />
        </g>
        {/* Bottom cluster */}
        <g
          stroke="url(#pxConstGrad)"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          style={{
            strokeDasharray: 500,
            animation: "pxConstellationDraw 6s ease-out 1.6s forwards",
          }}
        >
          <path d="M340 620 L 460 580 L 580 640 L 540 720 L 420 700 L 340 620" />
        </g>
        {/* Constellation node circles */}
        {[
          [120, 140],
          [220, 200],
          [280, 280],
          [200, 360],
          [130, 320],
          [880, 90],
          [980, 160],
          [1060, 240],
          [1110, 340],
          [1020, 380],
          [940, 320],
          [340, 620],
          [460, 580],
          [580, 640],
          [540, 720],
          [420, 700],
        ].map(([cx, cy], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r="2.5"
            fill={PALETTE.goldLight}
            style={{
              filter: `drop-shadow(0 0 6px ${PALETTE.goldLight})`,
              animation: `pxStarTwinkle ${3 + (i % 4)}s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </svg>
      <MoteLayer count={20} color="rgba(247, 193, 214, 0.7)" duration={16} />
    </>
  );
}

/* ───────────────────────── SCENE: MAGIC LAB ─────────────────────────
 * Drifting alchemy glyphs in warm gold/violet. Used for /onboarding. */

export function MagicLabScene() {
  const glyphs = ["✦", "🜨", "🜂", "✧", "⚗", "☉", "⌬", "❋"];
  return (
    <>
      <style>{KEYFRAMES}</style>
      <SkyGradientLayer />
      <StarLayer count={30} />
      <SunGlow x="50%" y="25%" size={380} intensity={0.55} />
      {/* Drifting glyphs */}
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        {glyphs.concat(glyphs).map((g, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              left: `${(i * 13 + 6) % 96}%`,
              top: `${(i * 19) % 88 + 4}%`,
              fontSize: 22 + (i % 3) * 10,
              color: i % 2 === 0 ? PALETTE.goldLight : PALETTE.coral,
              opacity: 0.32,
              filter: `drop-shadow(0 0 10px ${i % 2 === 0 ? PALETTE.goldLight : PALETTE.coral})`,
              animation: `pxRuneDrift ${10 + (i % 4) * 3}s ease-in-out ${i * 1.4}s infinite`,
            }}
          >
            {g}
          </span>
        ))}
      </div>
      <MoteLayer count={28} duration={12} />
    </>
  );
}

/* ───────────────────────── SCENE: LIGHTHOUSE ─────────────────────────
 * Sweeping warm-gold beam over a soft horizon. Used for /forgot-password. */

export function LighthouseScene() {
  return (
    <>
      <style>{KEYFRAMES}</style>
      <SkyGradientLayer />
      <StarLayer count={35} topPct={55} />
      {/* Lighthouse silhouette */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          left: "50%",
          bottom: "0",
          transform: "translateX(-50%)",
          width: 60,
          height: 220,
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "70%",
            background: `linear-gradient(180deg, ${PALETTE.duskTop}, ${PALETTE.duskMid})`,
            clipPath: "polygon(20% 0, 80% 0, 100% 100%, 0 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "70%",
            left: "10%",
            right: "10%",
            height: "12%",
            background: PALETTE.duskTop,
          }}
        />
        {/* Light room */}
        <div
          style={{
            position: "absolute",
            bottom: "82%",
            left: "20%",
            right: "20%",
            height: "12%",
            borderRadius: "4px 4px 0 0",
            background: `linear-gradient(180deg, ${PALETTE.goldLight}, ${PALETTE.goldMid})`,
            boxShadow: `0 0 30px ${PALETTE.goldMid}`,
            animation: "pxBeaconPulse 3s ease-in-out infinite",
          }}
        />
      </div>
      {/* Sweeping beam */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          left: "50%",
          bottom: "32vh",
          width: "120vw",
          height: "100vh",
          transformOrigin: "50% 100%",
          background: `conic-gradient(from -25deg at 50% 100%, transparent 0deg, rgba(255, 220, 130, 0.18) 8deg, rgba(255, 220, 130, 0.32) 12deg, rgba(255, 220, 130, 0.18) 16deg, transparent 30deg)`,
          marginLeft: "-60vw",
          zIndex: 0,
          pointerEvents: "none",
          animation: "pxLightSweep 9s ease-in-out infinite",
          mixBlendMode: "screen",
          filter: "blur(2px)",
        }}
      />
      <SunGlow y="10%" size={300} intensity={0.5} />
      <MoteLayer count={22} duration={13} />
    </>
  );
}

/* ───────────────────────── SCENE: FOREST GLOW ─────────────────────────
 * Drifting fireflies + warm tree-line silhouettes. Used for cyberexplorers. */

export function ForestGlowScene() {
  const fireflies = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        left: (i * 41 + 7) % 100,
        top: 25 + ((i * 17) % 65),
        size: 3 + ((i * 5) % 3),
        delay: (i * 0.38) % 6,
        duration: 5 + ((i * 3) % 5),
      })),
    [],
  );
  return (
    <>
      <style>{KEYFRAMES}</style>
      <SkyGradientLayer />
      <StarLayer count={28} topPct={45} />
      {/* Tree silhouette layer */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          height: "32vh",
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <svg viewBox="0 0 1200 240" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
          {Array.from({ length: 12 }).map((_, i) => {
            const x = i * 110 + 30;
            return (
              <g key={i}>
                <rect x={x - 4} y="170" width="8" height="70" fill="#1a0612" opacity="0.85" />
                <ellipse cx={x} cy="160" rx="35" ry="60" fill="#1a0612" opacity="0.85" />
              </g>
            );
          })}
        </svg>
      </div>
      <SunGlow x="80%" y="15%" size={340} intensity={0.5} />
      {/* Fireflies */}
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        {fireflies.map((f, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              left: `${f.left}%`,
              top: `${f.top}%`,
              width: f.size,
              height: f.size,
              borderRadius: "50%",
              background: PALETTE.goldLight,
              boxShadow: `0 0 ${f.size * 4}px rgba(255, 213, 138, 0.85), 0 0 ${f.size * 8}px rgba(255, 200, 110, 0.45)`,
              animation: `pxFireflyFloat ${f.duration}s ease-in-out ${f.delay}s infinite, pxStarTwinkle ${2 + (i % 3)}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>
    </>
  );
}

/* ───────────────────────── SCENE: COSMIC LIBRARY ─────────────────────────
 * Floating storybook tomes + drifting gold dust. Used for cyberstart. */

export function CosmicLibraryScene() {
  const books = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        left: 8 + ((i * 13) % 84),
        top: 10 + ((i * 19) % 70),
        rotate: (i * 23) % 30 - 15,
        size: 50 + ((i * 7) % 40),
        delay: (i * 0.7) % 5,
        duration: 8 + ((i * 3) % 6),
        c1: ["#8b3a52", "#c47340", "#3a4a78", "#3a6e78", "#5a2e14", "#7a3a08", "#a06aff"][i % 7],
      })),
    [],
  );
  return (
    <>
      <style>{KEYFRAMES}</style>
      <SkyGradientLayer />
      <StarLayer count={45} />
      <SunGlow x="50%" y="50%" size={500} intensity={0.4} />
      {/* Floating books */}
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        {books.map((b, i) => (
          <span
            key={i}
            style={
              {
                position: "absolute",
                left: `${b.left}%`,
                top: `${b.top}%`,
                width: b.size,
                height: b.size * 0.8,
                background: `linear-gradient(135deg, ${b.c1}, #2a0d2e)`,
                borderRadius: 4,
                boxShadow:
                  "0 12px 24px -8px rgba(20, 6, 12, 0.7), inset 0 0 0 2px rgba(255, 220, 168, 0.25)",
                animation: `pxBookFloat ${b.duration}s ease-in-out ${b.delay}s infinite`,
                "--r": `${b.rotate}deg`,
                opacity: 0.45,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      <MoteLayer count={30} duration={14} />
    </>
  );
}

/* ───────────────────────── SCENE: CASTLE GATE ─────────────────────────
 * Storybook castle silhouette behind warm glow + dust motes. Used for
 * the /password gate. */

export function CastleGateScene() {
  return (
    <>
      <style>{KEYFRAMES}</style>
      <SkyGradientLayer />
      <StarLayer count={32} />
      <SunGlow x="50%" y="32%" size={420} intensity={0.55} />
      {/* Castle silhouette */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          height: "26vh",
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <svg viewBox="0 0 1200 240" preserveAspectRatio="xMidYMax slice" style={{ width: "100%", height: "100%" }}>
          <path
            d="M0 240 L0 180 L60 180 L60 140 L80 140 L80 180 L160 180 L160 100 L180 80 L200 100 L200 180 L260 180 L260 130 L280 130 L280 110 L320 110 L320 130 L340 130 L340 180 L420 180 L420 70 L440 50 L460 70 L460 180 L540 180 L540 130 L560 130 L560 110 L600 110 L600 130 L620 130 L620 180 L680 180 L680 100 L700 80 L720 100 L720 180 L780 180 L780 140 L800 140 L800 180 L880 180 L880 160 L920 160 L920 130 L960 130 L960 160 L1000 160 L1000 180 L1080 180 L1080 140 L1100 140 L1100 180 L1200 180 L1200 240 Z"
            fill={PALETTE.duskTop}
            opacity="0.88"
          />
          {/* Lit windows */}
          {[
            [80, 165],
            [160, 130],
            [200, 130],
            [260, 165],
            [340, 165],
            [420, 100],
            [460, 100],
            [540, 165],
            [620, 165],
            [680, 130],
            [720, 130],
            [800, 165],
            [880, 165],
            [960, 145],
            [1080, 165],
          ].map(([cx, cy], i) => (
            <rect
              key={i}
              x={cx - 3}
              y={cy - 3}
              width="6"
              height="8"
              fill={PALETTE.goldLight}
              opacity={0.85}
              style={{
                animation: `pxStarTwinkle ${3 + (i % 4)}s ease-in-out ${i * 0.18}s infinite`,
              }}
            />
          ))}
        </svg>
      </div>
      <MoteLayer count={24} duration={13} />
    </>
  );
}

/* ───────────────────────── SCENE: GLOBE PANEL ─────────────────────────
 * Side-panel scene for split-screen layouts (login, signup). Renders
 * a warm halo + drifting gold motes; the parent supplies the actual
 * 3D globe (or other centrepiece) on top. */

export function GlobePanelBackdrop() {
  return (
    <>
      <style>{KEYFRAMES}</style>
      {/* Layered radial glows */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            `radial-gradient(ellipse at 50% 35%, rgba(255, 215, 138, 0.25) 0%, transparent 55%),` +
            `radial-gradient(ellipse at 30% 85%, rgba(196, 60, 106, 0.20) 0%, transparent 55%),` +
            `linear-gradient(180deg, ${PALETTE.duskTop} 0%, ${PALETTE.duskMid} 50%, ${PALETTE.duskHorizon} 100%)`,
          pointerEvents: "none",
        }}
      />
      {/* Static stars */}
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {Array.from({ length: 30 }).map((_, i) => {
          const left = (i * 37 + 13) % 100;
          const top = (i * 19 + 7) % 50;
          const size = 1 + ((i * 11) % 3) * 0.5;
          const delay = (i * 0.13) % 4;
          return (
            <span
              key={i}
              style={{
                position: "absolute",
                left: `${left}%`,
                top: `${top}%`,
                width: size,
                height: size,
                borderRadius: "50%",
                background: PALETTE.cream,
                boxShadow: `0 0 ${size * 3}px rgba(255, 240, 200, 0.6)`,
                animation: `pxStarTwinkle ${3 + (i % 3)}s ease-in-out ${delay}s infinite`,
              }}
            />
          );
        })}
      </div>
      {/* Warm halo behind globe */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 480,
          height: 480,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255, 213, 138, 0.32), rgba(255, 155, 74, 0.14) 50%, transparent 75%)",
          filter: "blur(20px)",
          pointerEvents: "none",
        }}
      />
    </>
  );
}
