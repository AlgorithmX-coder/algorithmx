"use client";

import { CSSProperties, ReactNode, useEffect, useId, useRef, useState } from "react";

/* ─────────────────── CyberBackground ─────────────────── */
const PARTICLE_COLORS = ["#60a5fa", "#34d399", "#f97316", "#f59e0b"];
const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  color: PARTICLE_COLORS[i % 4],
  size: 3 + ((i * 11) % 5),
  left: (i * 37 + 11) % 100,
  top: (i * 53 + 7) % 100,
  duration: 12 + ((i * 7) % 14),
  delay: -((i * 1.3) % 20),
  pathIdx: i % 4,
  opacity: 0.15 + ((i * 13) % 26) / 100,
}));

const H_TRACES = [
  { y: "22%", dur: 5, delay: 0 },
  { y: "52%", dur: 6, delay: -2 },
  { y: "78%", dur: 7, delay: -4 },
];
const V_TRACES = [
  { x: "25%", dur: 5.5, delay: -1 },
  { x: "55%", dur: 6.5, delay: -3 },
  { x: "80%", dur: 7.5, delay: -5 },
];
const JUNCTIONS = [
  { cx: "25%", cy: "22%" },
  { cx: "55%", cy: "22%" },
  { cx: "80%", cy: "22%" },
  { cx: "25%", cy: "52%" },
  { cx: "80%", cy: "52%" },
  { cx: "25%", cy: "78%" },
  { cx: "55%", cy: "78%" },
  { cx: "80%", cy: "78%" },
];

// Deterministic pseudo-random helper for binary rain content
const BINARY_RAIN = Array.from({ length: 12 }, (_, i) => {
  const bits = Array.from({ length: 15 }, (_, j) => (((i * 7 + j * 13 + 3) % 2) === 0 ? "0" : "1")).join("\n");
  return {
    left: (i * 9 + 4) % 100,
    duration: 8 + ((i * 5) % 11),
    delay: -((i * 1.7) % 12),
    color: i % 3 === 0 ? "rgba(52,211,153,0.06)" : "rgba(96,165,250,0.06)",
    bits,
  };
});

const HEX_FRAGMENTS = [
  { text: "0x4F2A", left: "8%", top: "15%", duration: 14, delay: 0 },
  { text: "0xB7E3", left: "88%", top: "28%", duration: 17, delay: -3 },
  { text: "0xFF01", left: "18%", top: "68%", duration: 13, delay: -6 },
  { text: "0x9C8D", left: "72%", top: "80%", duration: 19, delay: -9 },
  { text: "0xA1F0", left: "48%", top: "18%", duration: 12, delay: -2 },
  { text: "0x3D7B", left: "62%", top: "55%", duration: 20, delay: -5 },
];

export function CyberBackground() {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
      }}
    >
      <style>{`
        /* Layer 1: breathing grid */
        @keyframes cyberGridBreathe {
          0%,100% { opacity: 0.5; }
          50% { opacity: 1.2; }
        }
        /* Layer 2: particle motion paths */
        @keyframes cyberPartA {
          0%,100% { transform: translate(0,0) scale(1); }
          25% { transform: translate(40px,-50px) scale(1.2); }
          50% { transform: translate(-30px,-80px) scale(0.85); }
          75% { transform: translate(-50px,20px) scale(1.1); }
        }
        @keyframes cyberPartB {
          0%,100% { transform: translate(0,0) scale(1); }
          30% { transform: translate(-60px,40px) scale(1.3); }
          60% { transform: translate(70px,-30px) scale(0.8); }
        }
        @keyframes cyberPartC {
          0%,100% { transform: translate(0,0) scale(1); }
          20% { transform: translate(20px,60px) scale(0.9); }
          50% { transform: translate(50px,-40px) scale(1.15); }
          80% { transform: translate(-40px,30px) scale(1.05); }
        }
        @keyframes cyberPartD {
          0%,100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(-40px,-60px) scale(1.2); }
          66% { transform: translate(60px,-40px) scale(0.9); }
        }
        /* Layer 3: trace pulse glow */
        @keyframes cyberTracePulseA { 0%,100% { opacity: 0.3; } 50% { opacity: 0.75; } }
        @keyframes cyberTracePulseB { 0%,100% { opacity: 0.4; } 50% { opacity: 0.85; } }
        /* Layer 3: data pulse dots travelling along traces */
        @keyframes cyberDataH {
          0% { left: -6px; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
        @keyframes cyberDataV {
          0% { top: -6px; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        /* Layer 4: node core pulse */
        @keyframes cyberNodePulse {
          0%,100% { r: 2; opacity: 0.7; }
          50% { r: 6; opacity: 1; }
        }
        /* Layer 4: radar ping */
        @keyframes cyberRadarPing {
          0% { r: 3; opacity: 0.7; }
          100% { r: 25; opacity: 0; }
        }
        /* Layer 5: glow drift */
        @keyframes cyberGlowDrift {
          0%,100% { transform: translate(0,0); }
          25% { transform: translate(40px,-30px); }
          50% { transform: translate(-20px,35px); }
          75% { transform: translate(30px,20px); }
        }
        /* Layer 6: scanning lines */
        @keyframes cyberScanLine {
          0% { top: -2px; }
          100% { top: 100vh; }
        }
        @keyframes cyberScanLineV {
          0% { left: -2px; }
          100% { left: 100vw; }
        }
        /* New: binary rain */
        @keyframes cyberBinRain {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        /* New: hex fragments drift */
        @keyframes cyberHexDrift {
          0%,100% { transform: translate(0,0); opacity: 0; }
          20% { opacity: 1; }
          50% { transform: translate(-30px,-20px); opacity: 0.8; }
          80% { opacity: 0.6; }
        }
        /* New: corner HUD pulse */
        @keyframes cyberCornerPulse {
          0%,100% { opacity: 0.1; }
          50% { opacity: 0.2; }
        }
      `}</style>

      {/* Layer 1: Breathing grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(96,165,250,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.06) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          animation: "cyberGridBreathe 8s ease-in-out infinite",
        }}
      />

      {/* Layer 5: Blurred glow spots */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: "-10%",
          width: 560,
          height: 560,
          borderRadius: "50%",
          background: "rgba(96,165,250,0.12)",
          filter: "blur(110px)",
          animation: "cyberGlowDrift 20s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-12%",
          right: "-10%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "rgba(52,211,153,0.12)",
          filter: "blur(120px)",
          animation: "cyberGlowDrift 20s ease-in-out infinite",
          animationDelay: "-7s",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "35%",
          left: "40%",
          width: 520,
          height: 520,
          borderRadius: "50%",
          background: "rgba(249,115,22,0.12)",
          filter: "blur(120px)",
          animation: "cyberGlowDrift 20s ease-in-out infinite",
          animationDelay: "-13s",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "70%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "rgba(245,158,11,0.12)",
          filter: "blur(110px)",
          animation: "cyberGlowDrift 20s ease-in-out infinite",
          animationDelay: "-16s",
        }}
      />

      {/* Layer 2: Flowing data particles */}
      {PARTICLES.map((p, i) => (
        <div
          key={`part-${i}`}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: p.color,
            opacity: p.opacity,
            boxShadow: `0 0 8px ${p.color}`,
            animation: `cyberPart${"ABCD"[p.pathIdx]} ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
            willChange: "transform",
          }}
        />
      ))}

      {/* Layer 3: Circuit traces */}
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="cybHoriz" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="rgba(96,165,250,0)" />
            <stop offset="50%" stopColor="rgba(96,165,250,0.7)" />
            <stop offset="100%" stopColor="rgba(96,165,250,0)" />
          </linearGradient>
          <linearGradient id="cybHorizG" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="rgba(52,211,153,0)" />
            <stop offset="50%" stopColor="rgba(52,211,153,0.7)" />
            <stop offset="100%" stopColor="rgba(52,211,153,0)" />
          </linearGradient>
          <linearGradient id="cybVert" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(96,165,250,0)" />
            <stop offset="50%" stopColor="rgba(96,165,250,0.7)" />
            <stop offset="100%" stopColor="rgba(96,165,250,0)" />
          </linearGradient>
          <linearGradient id="cybVertG" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(52,211,153,0)" />
            <stop offset="50%" stopColor="rgba(52,211,153,0.7)" />
            <stop offset="100%" stopColor="rgba(52,211,153,0)" />
          </linearGradient>
        </defs>

        <line
          x1="0" y1="22%" x2="100%" y2="22%"
          stroke="url(#cybHoriz)" strokeWidth="1.5"
          style={{ animation: "cyberTracePulseA 6s ease-in-out infinite" }}
        />
        <line
          x1="0" y1="52%" x2="100%" y2="52%"
          stroke="url(#cybHorizG)" strokeWidth="1.5"
          style={{ animation: "cyberTracePulseB 7s ease-in-out infinite", animationDelay: "-2s" }}
        />
        <line
          x1="0" y1="78%" x2="100%" y2="78%"
          stroke="url(#cybHoriz)" strokeWidth="1.5"
          style={{ animation: "cyberTracePulseA 8s ease-in-out infinite", animationDelay: "-4s" }}
        />

        <line
          x1="25%" y1="0" x2="25%" y2="100%"
          stroke="url(#cybVert)" strokeWidth="1.5"
          style={{ animation: "cyberTracePulseB 6.5s ease-in-out infinite" }}
        />
        <line
          x1="55%" y1="0" x2="55%" y2="100%"
          stroke="url(#cybVertG)" strokeWidth="1.5"
          style={{ animation: "cyberTracePulseA 7.5s ease-in-out infinite", animationDelay: "-3s" }}
        />
        <line
          x1="80%" y1="0" x2="80%" y2="100%"
          stroke="url(#cybVert)" strokeWidth="1.5"
          style={{ animation: "cyberTracePulseB 8.5s ease-in-out infinite", animationDelay: "-5s" }}
        />

        {/* Layer 4: junction nodes (pulsing core) */}
        {JUNCTIONS.map((n, i) => (
          <circle
            key={`node-${i}`}
            cx={n.cx}
            cy={n.cy}
            r="2"
            fill="#60a5fa"
            style={{
              filter: "drop-shadow(0 0 6px #60a5fa)",
              animation: "cyberNodePulse 3s ease-in-out infinite",
              animationDelay: `${-i}s`,
            }}
          />
        ))}

        {/* Layer 4: junction radar ping */}
        {JUNCTIONS.map((n, i) => (
          <circle
            key={`ping-${i}`}
            cx={n.cx}
            cy={n.cy}
            r="3"
            fill="none"
            stroke="#60a5fa"
            strokeWidth="1"
            style={{
              animation: "cyberRadarPing 3s ease-out infinite",
              animationDelay: `${-(i * 0.4)}s`,
            }}
          />
        ))}
      </svg>

      {/* Layer 3: travelling data pulse dots (horizontal) */}
      {H_TRACES.map((t, i) => (
        <div
          key={`pulseH-${i}`}
          style={{
            position: "absolute",
            top: `calc(${t.y} - 4px)`,
            left: 0,
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#60a5fa",
            color: "#60a5fa",
            filter: "drop-shadow(0 0 10px currentColor) drop-shadow(0 0 4px currentColor)",
            animation: `cyberDataH ${t.dur}s linear infinite`,
            animationDelay: `${t.delay}s`,
            willChange: "left",
          }}
        />
      ))}

      {/* Layer 3: travelling data pulse dots (vertical) */}
      {V_TRACES.map((t, i) => (
        <div
          key={`pulseV-${i}`}
          style={{
            position: "absolute",
            left: `calc(${t.x} - 4px)`,
            top: 0,
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#34d399",
            color: "#34d399",
            filter: "drop-shadow(0 0 10px currentColor) drop-shadow(0 0 4px currentColor)",
            animation: `cyberDataV ${t.dur}s linear infinite`,
            animationDelay: `${t.delay}s`,
            willChange: "top",
          }}
        />
      ))}

      {/* New Layer: Binary rain */}
      {BINARY_RAIN.map((col, i) => (
        <div
          key={`bin-${i}`}
          style={{
            position: "absolute",
            left: `${col.left}%`,
            top: 0,
            width: 14,
            fontFamily: "'Courier New', monospace",
            fontSize: 10,
            lineHeight: 1.4,
            color: col.color,
            whiteSpace: "pre",
            pointerEvents: "none",
            animation: `cyberBinRain ${col.duration}s linear infinite`,
            animationDelay: `${col.delay}s`,
            willChange: "transform",
          }}
        >
          {col.bits}
        </div>
      ))}

      {/* New Layer: Hex code fragments */}
      {HEX_FRAGMENTS.map((h, i) => (
        <div
          key={`hex-${i}`}
          style={{
            position: "absolute",
            left: h.left,
            top: h.top,
            fontFamily: "'Courier New', monospace",
            fontSize: 11,
            fontWeight: 600,
            color: "rgba(96,165,250,0.08)",
            pointerEvents: "none",
            animation: `cyberHexDrift ${h.duration}s ease-in-out infinite`,
            animationDelay: `${h.delay}s`,
            willChange: "transform, opacity",
          }}
        >
          {h.text}
        </div>
      ))}

      {/* Layer 6: scanning line (horizontal) */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: 1,
          background:
            "linear-gradient(to right, transparent 0%, rgba(96,165,250,0.2) 50%, transparent 100%)",
          animation: "cyberScanLine 15s linear infinite",
          willChange: "top",
          pointerEvents: "none",
        }}
      />

      {/* Layer 6: scanning line (vertical) */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1,
          height: "100%",
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(96,165,250,0.2) 50%, transparent 100%)",
          animation: "cyberScanLineV 20s linear infinite",
          willChange: "left",
          pointerEvents: "none",
        }}
      />

      {/* New Layer: Corner HUD brackets */}
      {[
        { top: 16, left: 16, bT: true, bL: true, delay: "0s" },
        { top: 16, right: 16, bT: true, bR: true, delay: "-1s" },
        { bottom: 16, left: 16, bB: true, bL: true, delay: "-2s" },
        { bottom: 16, right: 16, bB: true, bR: true, delay: "-3s" },
      ].map((c, i) => (
        <div
          key={`corner-${i}`}
          style={{
            position: "absolute",
            top: c.top,
            left: c.left,
            right: c.right,
            bottom: c.bottom,
            width: 30,
            height: 30,
            borderTop: c.bT ? "1px solid rgba(96,165,250,0.15)" : undefined,
            borderLeft: c.bL ? "1px solid rgba(96,165,250,0.15)" : undefined,
            borderRight: c.bR ? "1px solid rgba(96,165,250,0.15)" : undefined,
            borderBottom: c.bB ? "1px solid rgba(96,165,250,0.15)" : undefined,
            animation: "cyberCornerPulse 4s ease-in-out infinite",
            animationDelay: c.delay,
            pointerEvents: "none",
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────── RevealOnScroll ─────────────────── */
export function RevealOnScroll({
  children,
  delay = 0,
  direction = "up",
  className,
}: {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "left" | "right" | "scale";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const hiddenTransform =
    direction === "up"
      ? "translateY(24px)"
      : direction === "left"
        ? "translateX(-24px)"
        : direction === "right"
          ? "translateX(24px)"
          : "scale(0.95)";

  const style: CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? "none" : hiddenTransform,
    transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    willChange: "opacity, transform",
  };

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}

/* ─────────────────── AnimatedBar ─────────────────── */
export function AnimatedBar({
  percent,
  gradient,
  glowColor,
  height = 16,
  delay = 400,
}: {
  percent: number;
  gradient: string;
  glowColor: string;
  height?: number;
  delay?: number;
}) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(Math.max(0, Math.min(100, percent))), delay);
    return () => clearTimeout(t);
  }, [percent, delay]);

  return (
    <div
      style={{
        width: "100%",
        height,
        background: "rgba(255,255,255,0.06)",
        borderRadius: 999,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${width}%`,
          height: "100%",
          background: gradient,
          borderRadius: 999,
          boxShadow: `0 0 16px ${glowColor}`,
          transition: "width 1.2s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      />
    </div>
  );
}

/* ─────────────────── AnimatedRing ─────────────────── */
export function AnimatedRing({
  percent,
  radius = 54,
  strokeWidth = 10,
  size = 130,
}: {
  percent: number;
  radius?: number;
  strokeWidth?: number;
  size?: number;
}) {
  const gradId = useId().replace(/:/g, "");
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percent));
  const targetOffset = circumference * (1 - clamped / 100);
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const t = setTimeout(() => setOffset(targetOffset), 500);
    return () => clearTimeout(t);
  }, [targetOffset]);

  const cx = size / 2;
  const cy = size / 2;

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size}>
        <defs>
          <linearGradient id={`ring-${gradId}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={`url(#ring-${gradId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <span style={{ color: "#fff", fontSize: size * 0.22, fontWeight: 900, lineHeight: 1 }}>
          {Math.round(clamped)}%
        </span>
        <span style={{ color: "#9ca3af", fontSize: 11, fontWeight: 600, marginTop: 2 }}>
          Complete
        </span>
      </div>
    </div>
  );
}

/* ─────────────────── StaggeredList ─────────────────── */
export function StaggeredList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const rawId = useId();
  const cls = `stagger-${rawId.replace(/:/g, "")}`;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const delayRules = Array.from({ length: 20 }, (_, i) =>
    `.${cls} > *:nth-child(${i + 1}) { transition-delay: ${i * 60}ms; }`,
  ).join("\n");

  return (
    <>
      <style>{`
        .${cls} > * {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1);
          will-change: opacity, transform;
        }
        .${cls}.visible > * {
          opacity: 1;
          transform: none;
        }
        ${delayRules}
      `}</style>
      <div
        ref={ref}
        className={`${cls}${visible ? " visible" : ""}${className ? ` ${className}` : ""}`}
      >
        {children}
      </div>
    </>
  );
}
