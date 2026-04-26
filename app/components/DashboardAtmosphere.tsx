"use client";

/*
 * DashboardAtmosphere — Pixar warm-dusk backdrop for the dashboard.
 *
 * Replaces the cold cyber CyberBackground SVG (drifting cyan circuit
 * traces) with the same sunset language the lesson uses: a soft fixed
 * radial-glow layer + a layer of drifting gold dust motes.
 *
 * Both layers are aria-hidden, pointer-events: none, and z-index 0
 * so the actual dashboard content sits cleanly on top.
 */

import { useMemo } from "react";

const RISE_KEYFRAMES = `
@keyframes dashMoteRise {
  0% { transform: translate(0, 0); opacity: 0; }
  15% { opacity: 1; }
  85% { opacity: 1; }
  100% { transform: translate(var(--mx, 0), -50vh); opacity: 0; }
}
@keyframes dashStarTwinkle {
  0%, 100% { opacity: 0.35; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.25); }
}
`;

export function DashboardSky() {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        background:
          "radial-gradient(ellipse at 78% 18%, rgba(255, 178, 110, 0.20) 0%, transparent 55%)," +
          "radial-gradient(ellipse at 22% 90%, rgba(196, 60, 106, 0.16) 0%, transparent 55%)," +
          "radial-gradient(ellipse at 50% 50%, rgba(255, 220, 168, 0.05) 0%, transparent 70%)",
      }}
    />
  );
}

export function DashboardParticles() {
  // Stable positions via memo — no Math.random per render
  const stars = useMemo(
    () =>
      Array.from({ length: 35 }, (_, i) => ({
        left: (i * 37 + 13) % 100,
        top: (i * 19 + 7) % 80,
        size: 1 + ((i * 11) % 3) * 0.5,
        opacity: 0.35 + ((i * 7) % 5) / 12,
        delay: (i * 0.13) % 4,
      })),
    [],
  );

  const motes = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        left: (i * 41 + 17) % 100,
        top: 30 + ((i * 19) % 50),
        size: 2 + ((i * 5) % 4),
        duration: 12 + ((i * 3) % 8),
        delay: (i * 0.41) % 8,
        drift: ((i * 11) % 30) - 15,
      })),
    [],
  );

  return (
    <>
      <style>{RISE_KEYFRAMES}</style>
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        {/* Faint stars in the upper sky */}
        {stars.map((s, i) => (
          <span
            key={`s-${i}`}
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
              animation: `dashStarTwinkle ${3 + (i % 3)}s ease-in-out ${s.delay}s infinite`,
            }}
          />
        ))}
        {/* Drifting gold dust motes */}
        {motes.map((m, i) => (
          <span
            key={`m-${i}`}
            style={
              {
                position: "absolute",
                left: `${m.left}%`,
                top: `${m.top}%`,
                width: m.size,
                height: m.size,
                borderRadius: "50%",
                background: "rgba(255, 220, 170, 0.85)",
                boxShadow: `0 0 ${m.size * 4}px rgba(255, 200, 140, 0.6)`,
                animation: `dashMoteRise ${m.duration}s ease-in-out ${m.delay}s infinite`,
                "--mx": `${m.drift}px`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </>
  );
}
