"use client";

/**
 * THE HUB FIELD — Block 3's own backdrop, replacing the shared MatrixRain/
 * BlockBackdrop device entirely. Owner: the console should read as a
 * "futuristic hacker hub" — a bright core terminal with energy waves and
 * beam lines radiating out of it, floating in a deep-space field — and
 * needs to look structurally unlike every other block, not just recoloured.
 *
 * Three independent layers, all `position:fixed` so they center on the
 * viewport the same way the console panel itself does (flex-centered in
 * ConsoleRuntime's <main>), with no ref/measurement needed to line them up:
 *   1. A canvas starfield + a few soft nebula blooms (drift is intentionally
 *      near-imperceptible — this is atmosphere, not a distraction behind a
 *      reading surface).
 *   2. CSS "ping" rings expanding out from the console's center and fading.
 *   3. CSS beam lines radiating outward at fixed angles, pulsing in place.
 * Rings/beams are pure CSS (cheap, and trivially recolour with the active
 * case's accent) rather than canvas, so re-theming per case is just a prop.
 */

import { useEffect, useRef } from "react";

const BEAM_COUNT = 14;
const RING_COUNT = 4;

/** The star/nebula canvas only — renders BELOW the readability scrim. */
export function HubStarfield({ accent, reduced }: { accent: string; reduced: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const cx = cv.getContext("2d");
    if (!cx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;
    let raf = 0;
    let t0 = performance.now();

    type Star = { x: number; y: number; r: number; base: number; speed: number; phase: number; drift: number };
    let stars: Star[] = [];
    type Bloom = { x: number; y: number; r: number; hue: string };
    let blooms: Bloom[] = [];

    const NEBULA_HUES = [`${accent}`, "#6B5CFF", "#2BD4B4"];

    const setup = () => {
      W = cv.clientWidth;
      H = cv.clientHeight;
      cv.width = Math.floor(W * dpr);
      cv.height = Math.floor(H * dpr);
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.floor((W * H) / 5200);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 0.5 + Math.random() * 1.6,
        base: 0.25 + Math.random() * 0.55,
        speed: 0.4 + Math.random() * 1.1,
        phase: Math.random() * Math.PI * 2,
        drift: 0.004 + Math.random() * 0.01,
      }));
      blooms = Array.from({ length: 3 }, (_, i) => ({
        x: W * (0.15 + Math.random() * 0.7),
        y: H * (0.15 + Math.random() * 0.7),
        r: Math.max(W, H) * (0.22 + Math.random() * 0.12),
        hue: NEBULA_HUES[i % NEBULA_HUES.length],
      }));
    };

    const paint = (now: number) => {
      const t = (now - t0) / 1000;
      cx.clearRect(0, 0, W, H);
      cx.fillStyle = "#04050a";
      cx.fillRect(0, 0, W, H);
      for (const b of blooms) {
        const g = cx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        g.addColorStop(0, `${b.hue}14`);
        g.addColorStop(1, `${b.hue}00`);
        cx.fillStyle = g;
        cx.fillRect(0, 0, W, H);
      }
      for (const s of stars) {
        const tw = reduced ? s.base : s.base + Math.sin(t * s.speed + s.phase) * 0.3;
        cx.globalAlpha = Math.max(0, Math.min(1, tw));
        cx.fillStyle = "#EAF2FF";
        cx.beginPath();
        cx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        cx.fill();
        if (!reduced) { s.y -= s.drift; if (s.y < -2) s.y = H + 2; }
      }
      cx.globalAlpha = 1;
    };

    setup();
    paint(t0);
    if (!reduced) {
      const loop = (now: number) => { paint(now); raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop);
    }
    const onResize = () => { setup(); paint(performance.now()); };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, [accent, reduced]);

  return (
    <canvas ref={ref} aria-hidden style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }} />
  );
}

/**
 * The energy rings + beam lines + core glow — renders ABOVE the readability
 * scrim (still below the console panel itself). This is the dramatic,
 * eye-catching layer, so unlike the starfield it should NOT be muted for
 * readability; nothing sits directly on top of it except the panel.
 */
export function HubEnergy({ accent, reduced }: { accent: string; reduced: boolean }) {
  return (
    <>
      <style>{`
        @keyframes hub-ring{0%{transform:translate(-50%,-50%) scale(.14);opacity:.85}70%{opacity:.25}100%{transform:translate(-50%,-50%) scale(1);opacity:0}}
        @keyframes hub-beam{0%,100%{opacity:.25}50%{opacity:.85}}
        @keyframes hub-core{0%,100%{opacity:.5;transform:translate(-50%,-50%) scale(1)}50%{opacity:.85;transform:translate(-50%,-50%) scale(1.08)}}
      `}</style>
      <div aria-hidden style={{ position: "fixed", top: "50%", left: "50%", width: 0, height: 0, zIndex: 0, pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 640,
            height: 640,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${accent}3d 0%, ${accent}14 42%, transparent 72%)`,
            transform: "translate(-50%,-50%)",
            animation: reduced ? "none" : "hub-core 3.2s ease-in-out infinite",
            filter: "blur(2px)",
          }}
        />
        {!reduced &&
          Array.from({ length: BEAM_COUNT }).map((_, i) => {
            const angle = (360 / BEAM_COUNT) * i;
            return (
              <div
                key={`b${i}`}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: 3,
                  height: 640,
                  background: `linear-gradient(to bottom, ${accent}e6 0%, ${accent}66 30%, transparent 70%)`,
                  boxShadow: `0 0 6px ${accent}99`,
                  transformOrigin: "top center",
                  transform: `rotate(${angle}deg)`,
                  animation: `hub-beam ${4.2 + (i % 4) * 0.6}s ease-in-out ${(i % 7) * 0.3}s infinite`,
                }}
              />
            );
          })}
        {Array.from({ length: RING_COUNT }).map((_, i) => (
          <div
            key={`r${i}`}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 1400,
              height: 1400,
              border: `2px solid ${accent}`,
              boxShadow: `0 0 18px ${accent}80, inset 0 0 18px ${accent}40`,
              borderRadius: "50%",
              transform: "translate(-50%,-50%) scale(.14)",
              opacity: 0,
              animation: reduced ? "none" : `hub-ring 5s ease-out ${i * 1.3}s infinite`,
            }}
          />
        ))}
      </div>
    </>
  );
}
