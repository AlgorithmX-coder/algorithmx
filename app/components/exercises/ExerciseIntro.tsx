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
    { a: "#ffd58a", b: "#ff9b4a", c: "#d4733a" }, // gold-coral-amber (warm sunset)
    { a: "#ffb079", b: "#c43c6a", c: "#a04a4a" }, // peach-rose-wine
    { a: "#7cc89a", b: "#4a9a6a", c: "#ffd58a" }, // moss-forest-gold (safe vibe)
    { a: "#fcd34d", b: "#f08e7e", c: "#c4513a" }, // amber-coral-terracotta
    { a: "#f7c1d6", b: "#a06aff", c: "#ffd58a" }, // blossom-violet-gold
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
          background: `radial-gradient(circle at 35% 30%, rgba(255, 245, 220, 0.25), rgba(40, 18, 38, 0.85) 60%)`,
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
      aria-modal="true"
      aria-label={title}
      style={{
        // Was position:absolute inset:0 — but exercise wrappers with
        // overflow:auto + maxHeight let the game body bleed past the
        // overlay's visible area on shorter viewports, so the intro
        // appeared to "stack" with the game UI. position:fixed covers
        // the actual viewport, so this can't happen regardless of how
        // the parent exercise lays out.
        position: "fixed",
        inset: 0,
        background:
          "linear-gradient(180deg, rgba(40, 18, 38, 0.97) 0%, rgba(20, 8, 24, 0.99) 100%)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        zIndex: 60,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        textAlign: "center",
        animation: "exIntroIn 0.35s ease-out both",
        fontFamily:
          "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          fontSize: 11,
          letterSpacing: 5,
          color: "#ffd58a",
          fontWeight: 800,
          textTransform: "uppercase",
          marginBottom: 14,
          animation: "exIntroPop 0.45s ease-out both",
        }}
      >
        ✦ Get Ready ✦
      </div>
      <IntroIconShowcase icon={icon} />
      <h2
        style={{
          fontSize: 32,
          fontWeight: 900,
          background: "linear-gradient(135deg, #ffd58a, #ff9b4a, #d4733a)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          margin: "6px 0 10px",
          letterSpacing: 0.5,
          animation: "exIntroPop 0.45s ease-out both",
          animationDelay: "0.08s",
          animationFillMode: "both",
        }}
      >
        {title}
      </h2>
      <p
        style={{
          fontSize: 16,
          color: "#ffe9c8",
          maxWidth: 460,
          lineHeight: 1.5,
          margin: "0 auto 18px",
          opacity: 0.92,
          animation: "exIntroPop 0.5s ease-out both",
          animationDelay: "0.16s",
          animationFillMode: "both",
          fontWeight: 500,
        }}
      >
        {description}
      </p>
      <div
        style={{
          fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
          fontSize: 11,
          color: "#ffd58a",
          marginBottom: 24,
          letterSpacing: 2.5,
          textTransform: "uppercase",
          fontWeight: 700,
          padding: "5px 14px",
          background: "rgba(40, 18, 38, 0.55)",
          borderStyle: "solid",
          borderWidth: 1,
          borderColor: "rgba(255, 220, 180, 0.35)",
          borderRadius: 999,
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
          background: "linear-gradient(135deg, #ffd58a, #ff9b4a)",
          color: "#3a1a06",
          fontWeight: 900,
          fontSize: 18,
          letterSpacing: 2,
          borderRadius: 999,
          padding: "16px 48px",
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
          boxShadow:
            "0 18px 36px -10px rgba(255,120,40,0.7), 0 0 0 1px rgba(255,235,200,0.6) inset, 0 -4px 0 rgba(180,80,30,0.45) inset",
          transition: "transform 0.18s ease",
        }}
        onMouseEnter={(e) => {
          playSound("hover");
          (e.currentTarget as HTMLButtonElement).style.transform =
            "translateY(-2px) scale(1.04)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform =
            "translateY(0) scale(1)";
        }}
      >
        START →
      </button>
    </div>
  );
}
