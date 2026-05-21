"use client";

import { useEffect, useRef } from "react";

/**
 * GlobalBackdrop - the single shared visual environment that runs behind
 * every section of the page. Solves three problems at once:
 *
 *   1. Color consistency - whole page sits on the same deep ink base, no
 *      more dark-cinematic-to-white-section seam.
 *   2. Live techy motion - drifting orb gradients + a slow particle field
 *      + a faint grid all animate continuously, so plain content areas
 *      never feel dead.
 *   3. Section flow - because the bg is shared, sections only need a
 *      subtle separator line (or nothing) for definition.
 *
 * Fixed-position, pointer-events: none, z-index: -1 so it sits under
 * the page content but above the body.
 */
export default function GlobalBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* Lightweight particle field via canvas - keeps content DOM small and
   * lets us animate at 60fps without re-rendering. */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = (canvas.width = window.innerWidth * window.devicePixelRatio);
    let h = (canvas.height = window.innerHeight * window.devicePixelRatio);
    const dpr = window.devicePixelRatio;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";

    const N = Math.min(120, Math.floor((w * h) / 32000));
    const dots = Array.from({ length: N }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.18 * dpr,
      vy: (Math.random() - 0.5) * 0.18 * dpr,
      r: (0.6 + Math.random() * 1.4) * dpr,
      phase: Math.random() * Math.PI * 2,
      hue: Math.random() < 0.7 ? "cyan" : Math.random() < 0.7 ? "violet" : "magenta",
    }));

    const onResize = () => {
      w = canvas.width = window.innerWidth * dpr;
      h = canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
    };
    window.addEventListener("resize", onResize);

    const tick = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0) d.x = w;
        if (d.x > w) d.x = 0;
        if (d.y < 0) d.y = h;
        if (d.y > h) d.y = 0;
        const twinkle = 0.45 + Math.sin(t * 0.001 + d.phase) * 0.35;
        const colour =
          d.hue === "cyan"
            ? `rgba(0,229,255,${twinkle * 0.55})`
            : d.hue === "violet"
              ? `rgba(166,103,255,${twinkle * 0.5})`
              : `rgba(255,58,214,${twinkle * 0.4})`;
        ctx.beginPath();
        ctx.fillStyle = colour;
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
        overflow: "hidden",
        background: "#04050d",
      }}
    >
      {/* Layer 1: subtle radial wash so the deep ink isn't pitch black */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 100% 60% at 50% 0%, rgba(0,229,255,0.06), transparent 65%), " +
            "radial-gradient(ellipse 80% 50% at 50% 100%, rgba(166,103,255,0.05), transparent 60%)",
        }}
      />

      {/* Layer 2: slow drifting orb gradients in brand colours.
       *  Three orbs at different positions / speeds. CSS keyframes
       *  translate each one in a slow loop. */}
      <div className="lv2-orb lv2-orb-cyan" />
      <div className="lv2-orb lv2-orb-violet" />
      <div className="lv2-orb lv2-orb-magenta" />

      {/* Layer 3: subtle grid overlay - reads as the holographic grid
       *  from the chip cinematic, continued out into the rest of the
       *  page. Mask fades the grid out at top/bottom so it never
       *  competes with content. */}
      <div className="lv2-grid" />

      {/* Layer 4: particle field via canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          mixBlendMode: "screen",
        }}
      />

      <style jsx>{`
        .lv2-orb {
          position: absolute;
          width: 60vmax;
          height: 60vmax;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.28;
          mix-blend-mode: screen;
          will-change: transform;
        }
        .lv2-orb-cyan {
          background: radial-gradient(circle, rgba(0,229,255,0.55), transparent 60%);
          top: -20vmax;
          left: -20vmax;
          animation: lv2OrbDrift1 26s ease-in-out infinite alternate;
        }
        .lv2-orb-violet {
          background: radial-gradient(circle, rgba(166,103,255,0.5), transparent 60%);
          bottom: -20vmax;
          right: -10vmax;
          animation: lv2OrbDrift2 32s ease-in-out infinite alternate;
        }
        .lv2-orb-magenta {
          background: radial-gradient(circle, rgba(255,58,214,0.32), transparent 60%);
          top: 30vmax;
          right: 20vmax;
          animation: lv2OrbDrift3 38s ease-in-out infinite alternate;
          opacity: 0.18;
        }

        @keyframes lv2OrbDrift1 {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(30vw, 18vh, 0); }
        }
        @keyframes lv2OrbDrift2 {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-26vw, -22vh, 0); }
        }
        @keyframes lv2OrbDrift3 {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-20vw, 30vh, 0); }
        }

        .lv2-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(0,229,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,229,255,0.06) 1px, transparent 1px);
          background-size: 56px 56px, 56px 56px;
          mask-image:
            radial-gradient(ellipse 80% 60% at 50% 50%, #000 0%, transparent 75%);
          -webkit-mask-image:
            radial-gradient(ellipse 80% 60% at 50% 50%, #000 0%, transparent 75%);
          opacity: 0.85;
        }
      `}</style>
    </div>
  );
}
