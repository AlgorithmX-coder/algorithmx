"use client";

import { useEffect } from "react";
import { playSound } from "@/app/lib/sounds";

export interface ExerciseIntroProps {
  title: string;
  description: string;
  icon: string;
  controls: string;
  onStart: () => void;
}

const STYLES = `
@keyframes exIntroIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes exIntroPop {
  from { opacity: 0; transform: translateY(14px) scale(0.92); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes exIntroIconFloat {
  0%,100% { transform: translateY(0) rotate(-2deg); }
  50%     { transform: translateY(-10px) rotate(2deg); }
}
@keyframes exIntroBtnPulse {
  0%,100% { box-shadow: 0 0 18px rgba(249,115,22,0.55), 0 0 0 rgba(249,115,22,0); }
  50%     { box-shadow: 0 0 30px rgba(249,115,22,0.85), 0 0 60px rgba(249,115,22,0.35); }
}
@keyframes exIntroHaloSpin {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@keyframes exIntroHaloSpinRev {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(-360deg); }
}
@keyframes exIntroOrbitDot {
  0%   { transform: rotate(var(--start, 0deg)) translateX(var(--orbit, 80px)) rotate(calc(var(--start, 0deg) * -1)); }
  100% { transform: rotate(calc(var(--start, 0deg) + 360deg)) translateX(var(--orbit, 80px)) rotate(calc((var(--start, 0deg) + 360deg) * -1)); }
}
@keyframes exIntroParticleRise {
  0%   { transform: translate(0, 0); opacity: 0; }
  18%  { opacity: 0.85; }
  82%  { opacity: 0.85; }
  100% { transform: translate(var(--px, 12px), -160px); opacity: 0; }
}
@keyframes exIntroGlowPulse {
  0%,100% { opacity: 0.55; transform: translate(-50%, -50%) scale(1); }
  50%     { opacity: 1;    transform: translate(-50%, -50%) scale(1.15); }
}
@keyframes exIntroRingPulse {
  0%   { transform: translate(-50%, -50%) scale(0.6); opacity: 0.8; }
  100% { transform: translate(-50%, -50%) scale(1.4); opacity: 0; }
}
`;

let injected = false;
function ensureStyles() {
  if (typeof document === "undefined" || injected) return;
  const el = document.createElement("style");
  el.id = "ax-exercise-intro-keyframes";
  el.textContent = STYLES;
  document.head.appendChild(el);
  injected = true;
}

/**
 * Layered icon showcase used at the top of every ExerciseIntro overlay.
 * The user complained that the bare emoji icon felt "2D and plain", so
 * we surround whatever glyph is passed in with:
 *   - a soft pulsing radial glow behind it (gives perceived depth)
 *   - a slow conic-gradient halo (rotating colour wheel of cyan / violet
 *     / pink / amber so different exercises don't all look the same)
 *   - a counter-rotating dashed orbit ring
 *   - 4 orbital dots circling the icon at varying radii / speeds
 *   - 8 rising particle sparks behind the whole composition
 *   - the icon itself sits on a glass disc with inner shadow + perspective
 *     tilt so it reads as a physical token rather than a flat emoji.
 *
 * Pure CSS / inline SVG — no external library required.
 */
function IntroIconShowcase({ icon }: { icon: string }) {
  // Deterministic per-exercise tint based on the glyph code-point so
  // consecutive intros visually contrast even when the surrounding
  // theme is similar.
  const code = icon.codePointAt(0) ?? 0;
  const TINTS = [
    { a: "#22d3ee", b: "#3b82f6", c: "#a78bfa" }, // cyan-blue-violet
    { a: "#a78bfa", b: "#f472b6", c: "#fbbf24" }, // violet-pink-gold
    { a: "#34d399", b: "#22d3ee", c: "#a78bfa" }, // green-cyan-violet
    { a: "#fbbf24", b: "#f97316", c: "#ef4444" }, // amber-orange-red
    { a: "#f472b6", b: "#a78bfa", c: "#22d3ee" }, // pink-violet-cyan
  ];
  const tint = TINTS[code % TINTS.length];
  const orbitDots = [
    { start: 0, orbit: 76, dur: 9, size: 8, c: tint.a },
    { start: 90, orbit: 84, dur: 11, size: 6, c: tint.b },
    { start: 180, orbit: 70, dur: 7, size: 7, c: tint.c },
    { start: 270, orbit: 88, dur: 13, size: 5, c: tint.a },
  ];
  return (
    <div
      style={{
        position: "relative",
        width: 200,
        height: 200,
        marginBottom: 14,
        perspective: "800px",
      }}
    >
      {/* Rising sparks behind the composition */}
      {Array.from({ length: 8 }).map((_, i) => {
        const left = 18 + (i * 23) % 165;
        const dur = 4 + (i % 4);
        const delay = (i * 0.4) % 4;
        const px = ((i % 3) - 1) * 14;
        const c = i % 3 === 0 ? tint.a : i % 3 === 1 ? tint.b : tint.c;
        return (
          <span
            key={`spk-${i}`}
            style={{
              position: "absolute",
              left,
              bottom: 10,
              width: 3,
              height: 3,
              borderRadius: "50%",
              background: c,
              boxShadow: `0 0 6px ${c}`,
              opacity: 0,
              animation: `exIntroParticleRise ${dur}s ease-in-out ${delay}s infinite`,
              ["--px" as string]: `${px}px`,
            } as React.CSSProperties}
          />
        );
      })}

      {/* Pulsing radial glow */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${tint.a}66 0%, ${tint.b}33 40%, transparent 70%)`,
          filter: "blur(8px)",
          animation: "exIntroGlowPulse 3s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />

      {/* Slow conic halo */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 170,
          height: 170,
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          background: `conic-gradient(from 0deg, transparent 0deg, ${tint.a}aa 30deg, transparent 70deg, ${tint.b}aa 150deg, transparent 200deg, ${tint.c}aa 280deg, transparent 320deg)`,
          filter: "blur(6px)",
          opacity: 0.65,
          animation: "exIntroHaloSpin 9s linear infinite",
          pointerEvents: "none",
        }}
      />

      {/* Dashed counter-rotating ring */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 150,
          height: 150,
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          border: `1.5px dashed ${tint.a}`,
          opacity: 0.55,
          animation: "exIntroHaloSpinRev 14s linear infinite",
          pointerEvents: "none",
        }}
      />

      {/* Pulsing ring shockwave */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 130,
          height: 130,
          borderRadius: "50%",
          border: `2px solid ${tint.b}`,
          animation: "exIntroRingPulse 2.4s ease-out infinite",
          pointerEvents: "none",
        }}
      />

      {/* Orbital dots */}
      {orbitDots.map((d, i) => (
        <span
          key={`orb-${i}`}
          aria-hidden
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: d.size,
            height: d.size,
            marginLeft: -d.size / 2,
            marginTop: -d.size / 2,
            borderRadius: "50%",
            background: d.c,
            boxShadow: `0 0 12px ${d.c}, 0 0 24px ${d.c}88`,
            animation: `exIntroOrbitDot ${d.dur}s linear infinite`,
            ["--start" as string]: `${d.start}deg`,
            ["--orbit" as string]: `${d.orbit}px`,
            pointerEvents: "none",
          } as React.CSSProperties}
        />
      ))}

      {/* Glass disc holding the icon — 3D-tilted */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%) rotateX(8deg)",
          transformStyle: "preserve-3d",
          width: 92,
          height: 92,
          borderRadius: "50%",
          background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.18), rgba(15,23,42,0.85) 60%)`,
          border: `1px solid ${tint.a}66`,
          boxShadow: `0 14px 30px ${tint.b}55, inset 0 -6px 14px rgba(0,0,0,0.4), inset 0 4px 10px rgba(255,255,255,0.08)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize: 54,
            lineHeight: 1,
            animation: "exIntroIconFloat 2.6s ease-in-out infinite",
            filter: `drop-shadow(0 6px 18px ${tint.b}aa) drop-shadow(0 0 20px ${tint.a}66)`,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function ExerciseIntro({
  title,
  description,
  icon,
  controls,
  onStart,
}: ExerciseIntroProps) {
  useEffect(ensureStyles, []);

  return (
    <div
      role="dialog"
      aria-label={title}
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(ellipse at 50% 35%, rgba(59,130,246,0.15) 0%, rgba(10,14,26,0.95) 55%, rgba(5,6,14,0.98) 100%)",
        backdropFilter: "blur(8px)",
        zIndex: 20,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        textAlign: "center",
        animation: "exIntroIn 0.35s ease-out both",
        borderRadius: "inherit",
      }}
    >
      <IntroIconShowcase icon={icon} />
      <h2
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 28,
          fontWeight: 900,
          color: "#f1f5f9",
          margin: "6px 0 10px",
          letterSpacing: 0.3,
          animation: "exIntroPop 0.45s ease-out both",
          animationDelay: "0.08s",
          animationFillMode: "both",
        }}
      >
        {title}
      </h2>
      <p
        style={{
          fontFamily: "'DM Sans', 'Space Grotesk', sans-serif",
          fontSize: 16,
          color: "#94a3b8",
          maxWidth: 400,
          lineHeight: 1.5,
          margin: "0 auto 18px",
          animation: "exIntroPop 0.5s ease-out both",
          animationDelay: "0.16s",
          animationFillMode: "both",
        }}
      >
        {description}
      </p>
      <div
        style={{
          fontFamily: "'Courier New', monospace",
          fontSize: 13,
          color: "#64748b",
          marginBottom: 24,
          letterSpacing: 0.5,
          animation: "exIntroPop 0.55s ease-out both",
          animationDelay: "0.24s",
          animationFillMode: "both",
        }}
      >
        {controls}
      </div>
      <button
        type="button"
        onClick={() => {
          playSound("select");
          onStart();
        }}
        style={{
          background: "linear-gradient(135deg, #f97316, #f59e0b)",
          color: "#fff",
          fontWeight: 900,
          fontSize: 18,
          letterSpacing: 2,
          borderRadius: 16,
          padding: "16px 48px",
          border: "none",
          cursor: "pointer",
          animation: "exIntroBtnPulse 1.4s ease-in-out infinite",
          fontFamily: "inherit",
        }}
        onMouseEnter={() => playSound("hover")}
      >
        START &rarr;
      </button>
    </div>
  );
}
