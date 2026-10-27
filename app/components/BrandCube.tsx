"use client";

import { useEffect, useRef, type CSSProperties } from "react";

/*
 * EXTRACTED from landing-v2/Nav.tsx, unchanged, so surfaces WITHOUT the nav
 * can show the real brand mark instead of the flat CubeMark stamp. The nav
 * renders <BrandCube /> with no props and is pixel-identical to before.
 */
/**
 * BrandCube — a holographic glass cube as the brand mark.
 *
 * Layers (all GPU transforms / opacity):
 *  - 6 translucent glass faces with lit cyan edges (you see through it)
 *  - a pulsing inner energy core glowing at the centre
 *  - an orbiting light spark riding a tilted ring around the cube
 *  - a slow vertical float + a breathing cyan bloom on the wrapper
 *  - hover parallax: the cube tilts toward the cursor while hovered
 *
 * Falls back to a static, lit, angled cube under prefers-reduced-motion.
 */
/* Bracket Core brand mark (owner pick 2026-09-17, from the Cube Concepts
 * page): a neon wire-frame cube with binary etched into the glass and the
 * coder's </> glowing at its centre. The frame turns every 14 s; every 7 s
 * the edges flare, the symbol pulses and the slash retypes itself.
 *
 * Sizing: every measurement is in --u (one design pixel of a 20 px cube),
 * so the mark scales from a single --s. Desktop (wider than 1100px) is
 * 24 px; tablets and phones keep 20 px, sized separately later (owner
 * parked phone/tablet dimension work). */
const CUBE_FACES = ["f1", "f2", "f3", "f4", "f5", "f6"] as const;

export default function BrandCube({
  size,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const sceneRef = useRef<HTMLSpanElement>(null);

  /* Hover parallax — while the cursor is over the mark, ease the cube's
   * tilt toward the pointer via CSS vars on the scene. The spin animation
   * lives on the inner cube, so it composes cleanly with this. Skipped
   * entirely under reduced motion. */
  useEffect(() => {
    const wrap = wrapRef.current;
    const scene = sceneRef.current;
    if (!wrap || !scene) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;

    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let active = false;
    const tick = () => {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      scene.style.setProperty("--lv2-cube-rx", `${cy.toFixed(2)}deg`);
      scene.style.setProperty("--lv2-cube-ry", `${cx.toFixed(2)}deg`);
      /* PERF (2026-07-17): after mouseleave the loop used to run forever
       * (and each re-enter started ANOTHER loop, orphaning the old rAF
       * id — every hover cycle permanently added a per-frame style
       * writer). Once inactive and settled, snap to rest and stop;
       * onEnter starts a fresh loop. */
      if (!active && Math.abs(cx) < 0.01 && Math.abs(cy) < 0.01) {
        scene.style.setProperty("--lv2-cube-rx", "0deg");
        scene.style.setProperty("--lv2-cube-ry", "0deg");
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    const onMove = (e: MouseEvent) => {
      const r = wrap.getBoundingClientRect();
      const nx = (e.clientX - (r.left + r.width / 2)) / (r.width || 1);
      const ny = (e.clientY - (r.top + r.height / 2)) / (r.height || 1);
      tx = Math.max(-1, Math.min(1, nx)) * 16;
      ty = -Math.max(-1, Math.min(1, ny)) * 16;
    };
    const onEnter = () => {
      if (active) return;
      active = true;
      wrap.addEventListener("mousemove", onMove);
      /* Cancel any still-running wind-down loop before starting a new
       * one — otherwise a quick re-enter runs two loops at once. */
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    };
    const onLeave = () => {
      active = false;
      wrap.removeEventListener("mousemove", onMove);
      tx = 0;
      ty = 0;
    };
    wrap.addEventListener("mouseenter", onEnter);
    wrap.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      wrap.removeEventListener("mouseenter", onEnter);
      wrap.removeEventListener("mouseleave", onLeave);
      wrap.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <span
      ref={wrapRef}
      aria-hidden
      className={className ? `lv2-cube-wrap ${className}` : "lv2-cube-wrap"}
      /* An inline --s beats the stylesheet, INCLUDING its >1100px bump, so
       * the nav keeps its responsive 20/24px by passing nothing while a
       * caller that asks for a size gets exactly that size everywhere. */
      style={size ? ({ "--s": `${size}px` } as CSSProperties) : undefined}
    >
      <span ref={sceneRef} className="lv2-cube-scene">
        <span className="lv2-cube">
          {CUBE_FACES.map((f) => (
            <span key={f} className={`lv2-cube-face lv2-cube-${f}`} />
          ))}
        </span>
        <span className="lv2-cube-glyph">
          &lt;<span className="lv2-cube-slash">/</span>&gt;
        </span>
      </span>

      <style jsx>{`
        .lv2-cube-wrap {
          --s: 20px;
          --u: calc(var(--s) / 20);
          position: relative;
          display: inline-block;
          flex-shrink: 0;
          width: var(--s);
          height: var(--s);
          perspective: calc(var(--s) * 23);
          filter: drop-shadow(0 0 calc(var(--u) * 2.4) rgba(0, 229, 255, 0.5));
          animation: lv2CubeFloat 6s ease-in-out infinite,
            lv2CubeGlow 7s ease-in-out infinite;
        }
        @media (min-width: 1101px) {
          .lv2-cube-wrap {
            --s: 24px;
          }
        }
        /* Scene applies hover-parallax tilt (CSS vars), eased back on leave. */
        .lv2-cube-scene {
          position: absolute;
          inset: 0;
          transform-style: preserve-3d;
          transform: rotateX(var(--lv2-cube-rx, 0deg))
            rotateY(var(--lv2-cube-ry, 0deg));
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        /* The neon frame turns once every 14 s at a constant tilt. */
        .lv2-cube {
          position: absolute;
          inset: 0;
          transform-style: preserve-3d;
          transform: rotateX(-18deg) rotateY(-28deg);
          animation: lv2CubeSpin 14s linear infinite;
        }
        .lv2-cube-face {
          position: absolute;
          inset: 0;
          box-sizing: border-box;
          overflow: hidden;
          background: linear-gradient(
              rgba(125, 240, 255, 0.06) 1px,
              rgba(0, 229, 255, 0.03) 1px
            )
            0 0 / 100% calc(var(--u) * 2.2);
          border-style: solid;
          border-width: max(1px, calc(var(--u) * 0.9));
          border-color: rgba(186, 250, 255, 0.92);
          border-radius: calc(var(--u) * 1.2);
          box-shadow: 0 0 calc(var(--u) * 2) rgba(0, 229, 255, 0.28),
            inset 0 0 calc(var(--u) * 2) rgba(0, 229, 255, 0.16);
          animation: lv2CubeEdge 7s ease-in-out infinite;
        }
        .lv2-cube-f1 {
          transform: rotateY(0deg) translateZ(calc(var(--s) / 2));
        }
        .lv2-cube-f2 {
          transform: rotateY(90deg) translateZ(calc(var(--s) / 2));
        }
        .lv2-cube-f3 {
          transform: rotateY(180deg) translateZ(calc(var(--s) / 2));
        }
        .lv2-cube-f4 {
          transform: rotateY(-90deg) translateZ(calc(var(--s) / 2));
        }
        .lv2-cube-f5 {
          transform: rotateX(90deg) translateZ(calc(var(--s) / 2));
        }
        .lv2-cube-f6 {
          transform: rotateX(-90deg) translateZ(calc(var(--s) / 2));
        }
        /* The </> core. Sits in the scene (not the turning frame) so it
           always faces the viewer. */
        .lv2-cube-glyph {
          position: absolute;
          left: 50%;
          top: 50%;
          white-space: nowrap;
          font: 700 calc(var(--u) * 9.4) / 1 var(--lv2-font-mono);
          letter-spacing: calc(var(--u) * -0.2);
          color: #f2fdff;
          filter: drop-shadow(0 0 calc(var(--u) * 1.6) rgba(0, 229, 255, 0.95));
          transform: translate(-50%, -54%);
          animation: lv2GlyphPulse 7s ease-in-out infinite;
        }
        .lv2-cube-slash {
          display: inline-block;
          color: #ffffff;
        }
        @keyframes lv2CubeSpin {
          from {
            transform: rotateX(-18deg) rotateY(0deg);
          }
          to {
            transform: rotateX(-18deg) rotateY(360deg);
          }
        }
        @keyframes lv2CubeEdge {
          0%,
          100% {
            border-color: rgba(176, 246, 255, 0.82);
          }
          50% {
            border-color: rgba(255, 255, 255, 0.98);
          }
        }
        @keyframes lv2CubeFloat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(calc(var(--u) * -2.5));
          }
        }
        @keyframes lv2CubeGlow {
          0%,
          100% {
            filter: drop-shadow(0 0 calc(var(--u) * 2) rgba(0, 229, 255, 0.4));
          }
          50% {
            filter: drop-shadow(0 0 calc(var(--u) * 3.4) rgba(0, 229, 255, 0.7))
              drop-shadow(0 0 calc(var(--u) * 7) rgba(124, 92, 255, 0.28));
          }
        }
        @keyframes lv2GlyphPulse {
          0%,
          100% {
            transform: translate(-50%, -52%) scale(0.98);
          }
          50% {
            transform: translate(-50%, -52%) scale(1.06);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .lv2-cube-wrap,
          .lv2-cube,
          .lv2-cube-face,
          .lv2-cube-glyph {
            animation: none;
          }
        }
      `}</style>
    </span>
  );
}
