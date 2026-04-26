"use client";

/**
 * CyberFutureScenes — futuristic atmospheric backdrops.
 *
 * Parallel to PixarScenes but tuned for the navy + glow Cyber Heroes
 * Lab aesthetic. Each scene is a fixed-position layer (zIndex 0,
 * pointer-events:none) meant to drop behind a normal page. CSS / SVG
 * / motion only — no WebGL — so they're cheap to mount and don't
 * compete for GPU contexts with R3F components like CyberGlobe.
 *
 * Conventions:
 *   <CyberSpaceBackdrop/>      — abyss + drifting starfield + nebula
 *   <ParticleNetworkScene/>    — pulsing connected node graph
 *   <CodeRainScene/>           — vertical streams of glowing characters
 *   <HoloGridScene/>           — perspective grid + radar sweep
 *   <NeonCityScene/>            — distant skyline silhouette
 *   <CircuitTraceScene/>        — animated traces over a hex grid
 *   <DataLabScene/>             — drifting glyphs + data tickers
 *   <VoidPortalScene/>          — concentric pulse rings + halo
 *   <CyberPanelBackdrop/>       — side-panel companion (login layout)
 *
 * Every scene assumes the page itself has set the dark navy
 * background (CYBER_GRAD.page). These scenes add LIGHT on top of that.
 */

import { useMemo } from "react";
import { CYBER_PALETTE } from "@/app/components/scene/cyberTokens";

const KEYFRAMES = `
@keyframes cfStarTwinkle {
  0%,100% { opacity: 0.35; transform: scale(1); }
  50%     { opacity: 1;    transform: scale(1.3); }
}
@keyframes cfMoteDrift {
  0%   { transform: translate(0, 0); opacity: 0; }
  12%  { opacity: 0.85; }
  88%  { opacity: 0.85; }
  100% { transform: translate(var(--mx, 0), -55vh); opacity: 0; }
}
@keyframes cfNebulaDrift {
  0%,100% { transform: translate(-4%, 0%) scale(1); }
  50%     { transform: translate(4%, -2%) scale(1.04); }
}
@keyframes cfScanline {
  from { transform: translateY(-100%); }
  to   { transform: translateY(100vh); }
}
@keyframes cfRadarSweep {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes cfPulseRing {
  0%   { transform: translate(-50%, -50%) scale(0.4); opacity: 0.85; }
  100% { transform: translate(-50%, -50%) scale(2.6); opacity: 0; }
}
@keyframes cfTraceFlow {
  to { stroke-dashoffset: -200; }
}
@keyframes cfCodeFall {
  0%   { transform: translateY(-100%); opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { transform: translateY(100vh); opacity: 0; }
}
@keyframes cfGlyphFloat {
  0%,100% { transform: translateY(0) rotate(0deg); opacity: 0.18; }
  50%     { transform: translateY(-14px) rotate(8deg); opacity: 0.42; }
}
@keyframes cfBeamSweep {
  0%,100% { transform: translateX(-30%) skewX(-12deg); opacity: 0.0; }
  35%     { opacity: 0.45; }
  65%     { opacity: 0.45; }
  100%    { transform: translateX(110%) skewX(-12deg); opacity: 0.0; }
}
@keyframes cfHoloShift {
  0%,100% { filter: drop-shadow(-1px 0 0 rgba(0, 229, 255, 0.55)) drop-shadow(1px 0 0 rgba(255, 95, 179, 0.55)); }
  50%     { filter: drop-shadow(-2px 0 0 rgba(0, 229, 255, 0.75)) drop-shadow(2px 0 0 rgba(255, 95, 179, 0.75)); }
}
@keyframes cfCircuitBlink {
  0%,100% { opacity: 0.2; }
  50%     { opacity: 1; }
}
@keyframes cfPortalRotate {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to   { transform: translate(-50%, -50%) rotate(360deg); }
}
@keyframes cfTickerScroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
`;

/* ───────────────────────── BASE LAYERS ──────────────────── */

function PageGradient() {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        background:
          "radial-gradient(ellipse at 50% -10%, #1d1f4d 0%, #0f1530 35%, #080a16 70%, #04050d 100%)",
      }}
    />
  );
}

function StarLayer({
  count = 60,
  topPct = 100,
}: {
  count?: number;
  topPct?: number;
}) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: (i * 37 + 13) % 100,
        top: (i * 19 + 7) % topPct,
        size: 1 + ((i * 11) % 3) * 0.5,
        opacity: 0.4 + ((i * 7) % 5) / 12,
        delay: (i * 0.13) % 4,
        hue: i % 4 === 0
          ? CYBER_PALETTE.cyan
          : i % 4 === 1
          ? CYBER_PALETTE.cosmic
          : i % 4 === 2
          ? CYBER_PALETTE.neon
          : CYBER_PALETTE.textBright,
      })),
    [count, topPct]
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
            background: s.hue,
            opacity: s.opacity,
            boxShadow: `0 0 ${s.size * 4}px ${s.hue}`,
            animation: `cfStarTwinkle ${3 + (i % 3)}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function NebulaLayer() {
  // Two huge soft radial blobs in cyan + cosmic violet, drifting
  // slowly. Mimics a distant nebula behind the starfield.
  return (
    <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: "-10%",
          top: "-10%",
          width: "70vw",
          height: "70vh",
          background:
            "radial-gradient(ellipse, rgba(0, 229, 255, 0.18) 0%, rgba(0, 229, 255, 0.06) 35%, transparent 65%)",
          filter: "blur(40px)",
          animation: "cfNebulaDrift 20s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: "-15%",
          top: "30%",
          width: "65vw",
          height: "65vh",
          background:
            "radial-gradient(ellipse, rgba(124, 92, 255, 0.22) 0%, rgba(124, 92, 255, 0.07) 40%, transparent 70%)",
          filter: "blur(48px)",
          animation: "cfNebulaDrift 26s ease-in-out 4s infinite reverse",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "30%",
          bottom: "-10%",
          width: "55vw",
          height: "55vh",
          background:
            "radial-gradient(ellipse, rgba(255, 95, 179, 0.15) 0%, rgba(255, 95, 179, 0.05) 40%, transparent 70%)",
          filter: "blur(50px)",
          animation: "cfNebulaDrift 30s ease-in-out 8s infinite",
        }}
      />
    </div>
  );
}

function ScanlineLayer() {
  // Faint horizontal lines crawling down the screen — CRT phosphor
  // texture. Kept low-opacity so it reads as "alive surface", not noise.
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent 0, transparent 3px, rgba(125, 240, 255, 0.025) 3px, rgba(125, 240, 255, 0.025) 4px)",
      }}
    />
  );
}

function MoteRiseLayer({
  count = 22,
  hue = CYBER_PALETTE.cyan,
  duration = 16,
}: {
  count?: number;
  hue?: string;
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
    [count, duration]
  );
  return (
    <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
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
              background: hue,
              boxShadow: `0 0 ${m.size * 5}px ${hue}`,
              animation: `cfMoteDrift ${m.duration}s ease-in-out ${m.delay}s infinite`,
              "--mx": `${m.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

function VolumetricBeams() {
  // Two diagonal light shafts sweeping across the page. Subtle,
  // additive, occasional (long animation duration). Adds "spotlight"
  // depth without distracting.
  return (
    <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          top: "-20%",
          left: 0,
          width: "30vw",
          height: "140vh",
          background:
            "linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.10), transparent)",
          mixBlendMode: "screen",
          animation: "cfBeamSweep 18s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "-20%",
          left: 0,
          width: "26vw",
          height: "140vh",
          background:
            "linear-gradient(90deg, transparent, rgba(124, 92, 255, 0.10), transparent)",
          mixBlendMode: "screen",
          animation: "cfBeamSweep 22s ease-in-out 6s infinite",
        }}
      />
    </div>
  );
}

/* ───────────────────────── SCENE: CYBER SPACE ──────────────
 * The default backdrop. Deep abyss + drifting stars + soft nebula +
 * scanlines + occasional volumetric light beams. Used for most
 * pages as the base atmosphere. */

export function CyberSpaceBackdrop() {
  return (
    <>
      <style>{KEYFRAMES}</style>
      <PageGradient />
      <NebulaLayer />
      <StarLayer count={70} />
      <VolumetricBeams />
      <ScanlineLayer />
    </>
  );
}

/* ───────────────────────── SCENE: PARTICLE NETWORK ─────────
 * Pulsing nodes connected by faint lines — the classic "neural
 * network" look. Used where we want intelligence/connection
 * imagery (login, cyberheroes hero). */

export function ParticleNetworkScene() {
  // Pre-compute deterministic node positions so the network is the
  // same each render (no jarring jumps on re-mount).
  const nodes = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        x: ((i * 137 + 50) % 1100) / 1100,
        y: ((i * 217 + 80) % 700) / 700,
        size: 2 + ((i * 5) % 3),
      })),
    []
  );
  const edges = useMemo(() => {
    const out: { a: number; b: number }[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 0.22) out.push({ a: i, b: j });
      }
    }
    return out;
  }, [nodes]);

  return (
    <>
      <style>{KEYFRAMES}</style>
      <PageGradient />
      <NebulaLayer />
      <StarLayer count={40} />

      {/* Connection layer — faint cyan lines pulsing in unison */}
      <svg
        aria-hidden
        viewBox="0 0 1100 700"
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
          <linearGradient id="cfEdgeGrad" x1="0" x2="1">
            <stop offset="0%" stopColor={CYBER_PALETTE.cyan} stopOpacity="0.0" />
            <stop offset="50%" stopColor={CYBER_PALETTE.cyan} stopOpacity="0.5" />
            <stop offset="100%" stopColor={CYBER_PALETTE.cosmic} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        {edges.map((e, i) => {
          const a = nodes[e.a];
          const b = nodes[e.b];
          return (
            <line
              key={i}
              x1={a.x * 1100}
              y1={a.y * 700}
              x2={b.x * 1100}
              y2={b.y * 700}
              stroke="url(#cfEdgeGrad)"
              strokeWidth="1"
              style={{
                animation: `cfStarTwinkle ${4 + (i % 5)}s ease-in-out ${i * 0.13}s infinite`,
              }}
            />
          );
        })}
        {nodes.map((n, i) => (
          <g key={i}>
            <circle
              cx={n.x * 1100}
              cy={n.y * 700}
              r={n.size * 2.4}
              fill={CYBER_PALETTE.cyan}
              opacity={0.15}
            />
            <circle
              cx={n.x * 1100}
              cy={n.y * 700}
              r={n.size}
              fill={CYBER_PALETTE.cyan}
              style={{
                filter: `drop-shadow(0 0 6px ${CYBER_PALETTE.cyan})`,
                animation: `cfStarTwinkle ${3 + (i % 4)}s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          </g>
        ))}
      </svg>

      <ScanlineLayer />
    </>
  );
}

/* ───────────────────────── SCENE: CODE RAIN ───────────────
 * Vertical streams of falling glyphs in cyan. Less intrusive than
 * Matrix rain — sparse columns, soft glow. Used for admin / tech
 * pages (signup, cyberheroes). */

export function CodeRainScene() {
  const cols = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        left: (i / 14) * 100 + Math.random() * 4,
        delay: -(i % 5) * 4,
        duration: 22 + (i % 5) * 4,
        chars:
          "01ABCDEFXY{}<>/#$%▓░▌▐■▢◆◇⌬⌧⌖⌥⌘⌭⏃⌬⏚".split("")
            .map((_, n) => "01ABCDEFXY{}<>/#$%▓░▌▐■▢◆◇⌬⌧⌖⌥⌘⌭⏃⌬⏚"[(i * 7 + n) % 35])
            .slice(0, 24)
            .join("\n"),
      })),
    []
  );

  return (
    <>
      <style>{KEYFRAMES}</style>
      <PageGradient />
      <NebulaLayer />
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        {cols.map((c, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${c.left}%`,
              top: 0,
              width: 22,
              fontFamily:
                "ui-monospace, 'JetBrains Mono', Menlo, monospace",
              fontSize: 12,
              color: i % 3 === 0 ? CYBER_PALETTE.cosmic : CYBER_PALETTE.cyan,
              opacity: 0.42,
              lineHeight: "16px",
              whiteSpace: "pre",
              textShadow: `0 0 8px ${i % 3 === 0 ? CYBER_PALETTE.cosmic : CYBER_PALETTE.cyan}`,
              animation: `cfCodeFall ${c.duration}s linear ${c.delay}s infinite`,
            }}
          >
            {c.chars}
          </div>
        ))}
      </div>
      <StarLayer count={30} topPct={50} />
      <ScanlineLayer />
    </>
  );
}

/* ───────────────────────── SCENE: HOLO GRID ────────────────
 * Perspective floor grid disappearing toward the horizon, with a
 * radar sweep emanating from a central point. Used for the lesson
 * floor / dashboard. */

export function HoloGridScene() {
  return (
    <>
      <style>{KEYFRAMES}</style>
      <PageGradient />
      <NebulaLayer />
      <StarLayer count={45} topPct={50} />

      {/* Perspective grid floor */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          height: "55vh",
          zIndex: 0,
          pointerEvents: "none",
          background:
            "linear-gradient(180deg, transparent 0%, rgba(0, 229, 255, 0.06) 60%, rgba(0, 229, 255, 0.12) 100%)",
        }}
      >
        <svg
          viewBox="0 0 1200 600"
          preserveAspectRatio="none"
          style={{ width: "100%", height: "100%", display: "block" }}
        >
          <defs>
            <linearGradient id="cfFloorFade" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={CYBER_PALETTE.cyan} stopOpacity="0" />
              <stop offset="100%" stopColor={CYBER_PALETTE.cyan} stopOpacity="0.6" />
            </linearGradient>
          </defs>
          {/* Horizontal lines, denser toward the bottom */}
          {Array.from({ length: 14 }, (_, i) => {
            const t = i / 13;
            const y = 600 - Math.pow(1 - t, 1.6) * 600;
            return (
              <line
                key={`h-${i}`}
                x1="0"
                x2="1200"
                y1={y}
                y2={y}
                stroke="url(#cfFloorFade)"
                strokeWidth="1"
              />
            );
          })}
          {/* Vertical lines converging at vanishing point */}
          {Array.from({ length: 17 }, (_, i) => {
            const x = (i / 16) * 1200;
            return (
              <line
                key={`v-${i}`}
                x1="600"
                y1="0"
                x2={x}
                y2="600"
                stroke="url(#cfFloorFade)"
                strokeWidth="0.7"
              />
            );
          })}
        </svg>
      </div>

      {/* Radar sweep at the horizon */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          left: "50%",
          top: "45%",
          transform: "translate(-50%, -50%)",
          width: 600,
          height: 600,
          zIndex: 0,
          pointerEvents: "none",
          background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, ${CYBER_PALETTE.cyan}55 8deg, transparent 30deg)`,
          opacity: 0.6,
          filter: "blur(10px)",
          animation: "cfRadarSweep 8s linear infinite",
        }}
      />

      <ScanlineLayer />
    </>
  );
}

/* ───────────────────────── SCENE: NEON CITY ────────────────
 * Dark sky + distant skyline silhouette + floating windows. Used for
 * cyberexplorers (the "older kids' city" course). */

export function NeonCityScene() {
  return (
    <>
      <style>{KEYFRAMES}</style>
      <PageGradient />
      <NebulaLayer />
      <StarLayer count={50} topPct={55} />

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
        <svg viewBox="0 0 1200 280" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
          {/* Back row — taller, dimmer */}
          <path
            d="M0 280 L0 130 L40 130 L40 100 L80 100 L80 110 L120 110 L120 80 L160 80 L160 130 L200 130 L200 90 L240 90 L240 130 L280 130 L280 60 L320 60 L320 130 L360 130 L360 100 L400 100 L400 110 L440 110 L440 130 L480 130 L480 80 L520 80 L520 130 L560 130 L560 110 L600 110 L600 130 L640 130 L640 70 L680 70 L680 130 L720 130 L720 100 L760 100 L760 130 L800 130 L800 90 L840 90 L840 130 L880 130 L880 110 L920 110 L920 60 L960 60 L960 130 L1000 130 L1000 100 L1040 100 L1040 130 L1080 130 L1080 80 L1120 80 L1120 130 L1160 130 L1160 110 L1200 110 L1200 280 Z"
            fill={CYBER_PALETTE.midnight}
            opacity="0.85"
          />
          {/* Lit windows */}
          {Array.from({ length: 36 }).map((_, i) => {
            const x = ((i * 89) % 1190) + 6;
            const y = 110 + (i % 4) * 14;
            const lit = i % 3 !== 0;
            const colour =
              i % 6 === 0
                ? CYBER_PALETTE.neon
                : i % 5 === 0
                ? CYBER_PALETTE.cosmic
                : CYBER_PALETTE.cyan;
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width="3"
                height="3"
                fill={lit ? colour : "rgba(255,255,255,0.05)"}
                style={{
                  filter: lit ? `drop-shadow(0 0 4px ${colour})` : undefined,
                  animation: lit ? `cfCircuitBlink ${4 + (i % 5)}s ease-in-out ${i * 0.1}s infinite` : undefined,
                }}
              />
            );
          })}
          {/* Front row — closer, more saturated */}
          <path
            d="M0 280 L0 180 L60 180 L60 160 L120 160 L120 200 L180 200 L180 150 L240 150 L240 200 L300 200 L300 170 L360 170 L360 200 L420 200 L420 140 L480 140 L480 200 L540 200 L540 175 L600 175 L600 200 L660 200 L660 160 L720 160 L720 200 L780 200 L780 180 L840 180 L840 200 L900 200 L900 165 L960 165 L960 200 L1020 200 L1020 145 L1080 145 L1080 200 L1140 200 L1140 175 L1200 175 L1200 280 Z"
            fill={CYBER_PALETTE.abyss}
            opacity="0.95"
          />
        </svg>
      </div>

      <MoteRiseLayer count={20} hue={CYBER_PALETTE.cyan} duration={18} />
      <ScanlineLayer />
    </>
  );
}

/* ───────────────────────── SCENE: CIRCUIT TRACES ────────────
 * Animated traces flowing across a hex/grid background with blinking
 * solder pads. Used for cyberheroes (where "circuits = cyber academy"
 * reads cleanly). */

export function CircuitTraceScene() {
  return (
    <>
      <style>{KEYFRAMES}</style>
      <PageGradient />
      <NebulaLayer />

      {/* Faint hex grid */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          backgroundImage:
            "linear-gradient(rgba(0, 229, 255, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 229, 255, 0.08) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(ellipse at 50% 40%, black 30%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 50% 40%, black 30%, transparent 80%)",
        }}
      />

      {/* Animated circuit traces */}
      <svg
        aria-hidden
        viewBox="0 0 1200 700"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          pointerEvents: "none",
          opacity: 0.7,
        }}
      >
        <g
          fill="none"
          stroke={CYBER_PALETTE.cyan}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeDasharray="6 8"
          style={{ animation: "cfTraceFlow 8s linear infinite" }}
        >
          <path d="M 0 200 L 240 200 L 280 240 L 480 240" />
          <path d="M 720 240 L 920 240 L 960 200 L 1200 200" />
          <path d="M 0 480 L 200 480 L 240 440 L 480 440" />
          <path d="M 720 440 L 920 440 L 960 480 L 1200 480" />
        </g>
        {/* Solder pads — pulse */}
        {[
          [240, 200], [480, 240], [720, 240], [960, 200],
          [200, 480], [480, 440], [720, 440], [960, 480],
        ].map(([cx, cy], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r="3"
            fill={CYBER_PALETTE.cyan}
            style={{
              filter: `drop-shadow(0 0 6px ${CYBER_PALETTE.cyan})`,
              animation: `cfCircuitBlink ${3 + (i % 3)}s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </svg>

      <StarLayer count={28} topPct={60} />
      <ScanlineLayer />
    </>
  );
}

/* ───────────────────────── SCENE: DATA LAB ─────────────────
 * Drifting alphanumeric glyphs + a subtle ticker readout at the
 * bottom. Used for cyberstart (lab-coded analyst vibe). */

export function DataLabScene() {
  const glyphs = ["✦", "⌬", "⏃", "◇", "✧", "⌧", "⌖", "❋", "⌘"];
  const tickerText = useMemo(
    () =>
      "ENC:256-BIT  ·  PING:24ms  ·  STATUS:SECURE  ·  HEROES:1247  ·  THREATS:0  ·  UPTIME:99.97%  ·  ".repeat(
        4
      ),
    []
  );
  return (
    <>
      <style>{KEYFRAMES}</style>
      <PageGradient />
      <NebulaLayer />
      <StarLayer count={45} />

      {/* Drifting glyphs */}
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        {glyphs.concat(glyphs).map((g, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              left: `${(i * 13 + 6) % 96}%`,
              top: `${(i * 19) % 88 + 4}%`,
              fontSize: 22 + (i % 3) * 12,
              color: i % 2 === 0 ? CYBER_PALETTE.cyan : CYBER_PALETTE.cosmic,
              opacity: 0.32,
              filter: `drop-shadow(0 0 10px ${i % 2 === 0 ? CYBER_PALETTE.cyan : CYBER_PALETTE.cosmic})`,
              animation: `cfGlyphFloat ${10 + (i % 4) * 3}s ease-in-out ${i * 1.4}s infinite`,
              fontFamily:
                "ui-monospace, 'JetBrains Mono', Menlo, monospace",
            }}
          >
            {g}
          </span>
        ))}
      </div>

      {/* Bottom ticker */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          height: 24,
          zIndex: 0,
          pointerEvents: "none",
          overflow: "hidden",
          background:
            "linear-gradient(180deg, transparent 0%, rgba(0, 229, 255, 0.08) 100%)",
          borderTop: "1px solid rgba(0, 229, 255, 0.18)",
        }}
      >
        <div
          style={{
            display: "inline-block",
            whiteSpace: "nowrap",
            fontFamily:
              "ui-monospace, 'JetBrains Mono', Menlo, monospace",
            fontSize: 11,
            color: CYBER_PALETTE.cyan,
            opacity: 0.65,
            letterSpacing: 2,
            textShadow: `0 0 6px ${CYBER_PALETTE.cyan}`,
            paddingTop: 5,
            animation: "cfTickerScroll 60s linear infinite",
          }}
        >
          {tickerText}
        </div>
      </div>

      <ScanlineLayer />
    </>
  );
}

/* ───────────────────────── SCENE: VOID PORTAL ──────────────
 * Centered concentric pulse rings + halo. Used for transitional
 * pages (forgot-password, password-gate, welcome). */

export function VoidPortalScene() {
  return (
    <>
      <style>{KEYFRAMES}</style>
      <PageGradient />
      <NebulaLayer />
      <StarLayer count={50} />

      {/* Central pulse rings — staggered */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          left: "50%",
          top: "50%",
          width: 0,
          height: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        {[0, 1.4, 2.8].map((d, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 200,
              height: 200,
              borderRadius: "50%",
              border: `2px solid ${CYBER_PALETTE.cyan}`,
              transform: "translate(-50%, -50%)",
              animation: `cfPulseRing 4.2s ease-out ${d}s infinite`,
              opacity: 0,
            }}
          />
        ))}
      </div>

      {/* Slow rotating halo */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          left: "50%",
          top: "50%",
          width: 520,
          height: 520,
          zIndex: 0,
          pointerEvents: "none",
          transform: "translate(-50%, -50%)",
          background:
            "conic-gradient(from 0deg, transparent 0deg, rgba(0, 229, 255, 0.18) 60deg, transparent 120deg, rgba(124, 92, 255, 0.18) 200deg, transparent 270deg, rgba(255, 95, 179, 0.14) 320deg, transparent 360deg)",
          filter: "blur(20px)",
          animation: "cfPortalRotate 24s linear infinite",
        }}
      />

      <ScanlineLayer />
    </>
  );
}

/* ───────────────────────── SCENE: PANEL BACKDROP ───────────
 * Side-panel companion for split-screen layouts (login right half).
 * Provides a cyber-glow halo + drifting motes; the parent supplies
 * the actual centerpiece (3D globe, etc.) on top. */

export function CyberPanelBackdrop() {
  return (
    <>
      <style>{KEYFRAMES}</style>
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            `radial-gradient(ellipse at 50% 35%, rgba(0, 229, 255, 0.18) 0%, transparent 55%),` +
            `radial-gradient(ellipse at 30% 85%, rgba(124, 92, 255, 0.18) 0%, transparent 55%),` +
            `linear-gradient(180deg, ${CYBER_PALETTE.midnight} 0%, ${CYBER_PALETTE.twilight} 50%, ${CYBER_PALETTE.midnight} 100%)`,
          pointerEvents: "none",
        }}
      />
      {/* Faint hex grid */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(0, 229, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 229, 255, 0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage:
            "radial-gradient(ellipse at 50% 50%, black 40%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 50% 50%, black 40%, transparent 80%)",
          pointerEvents: "none",
        }}
      />
      {/* Stars */}
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {Array.from({ length: 30 }).map((_, i) => {
          const left = (i * 37 + 13) % 100;
          const top = (i * 19 + 7) % 70;
          const size = 1 + ((i * 11) % 3) * 0.5;
          const delay = (i * 0.13) % 4;
          const colour =
            i % 4 === 0
              ? CYBER_PALETTE.cosmic
              : i % 4 === 1
              ? CYBER_PALETTE.neon
              : CYBER_PALETTE.cyan;
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
                background: colour,
                boxShadow: `0 0 ${size * 4}px ${colour}`,
                animation: `cfStarTwinkle ${3 + (i % 3)}s ease-in-out ${delay}s infinite`,
              }}
            />
          );
        })}
      </div>
      {/* Centre halo — visible behind whatever the parent renders */}
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
            "radial-gradient(circle, rgba(0, 229, 255, 0.32) 0%, rgba(124, 92, 255, 0.18) 45%, transparent 75%)",
          filter: "blur(20px)",
          pointerEvents: "none",
        }}
      />
    </>
  );
}
