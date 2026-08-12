"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Ico, useMagnetic, useMediaQuery } from "./utilities";

/**
 * Landing-v2 top nav — a futuristic "live control bar".
 *
 * The strip is built in depth layers so it reads as a system interface
 * rather than a flat dark bar:
 *  - a layered glass background (gradient veil + faint scan texture +
 *    a slow highlight sweep + cyan/violet edge lighting top & bottom)
 *  - a holographic 3D brand cube: translucent glass faces, a pulsing
 *    inner energy core, an orbiting light spark, hover parallax, slow
 *    float + breathing bloom (all CSS transforms, reduced-motion safe)
 *  - a live telemetry console: stronger status pulse, signal bars, a
 *    scan shimmer and a ticking latency read-out with a trend caret
 *  - a magnetic, dimensional "Get Started" CTA with an energy sweep
 *
 * The signup + login paths are always visible/clickable so they're never
 * gated out by the hero cinematic. Magnetic CTA → /signup, "Log In" → /login.
 */
export default function Nav() {
  /* PERF (2026-07-17): store the >24px BOOLEAN, not the raw scrollY.
   * Under Lenis, scroll events fire every rAF — storing the pixel value
   * re-rendered the entire Nav subtree at 60fps for the whole page.
   * React bails out on identical state, so this now re-renders only on
   * threshold crossings. */
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* The whole page sits on the unified dark backdrop, so the nav stays
   * dark throughout. The only state change is "barely-there at the top
   * vs. a lifted glass panel once scrolled" — to mark the page is alive. */
  const isLight = false;

  /* Layered gradient glass (gives the bar internal depth vs. a flat fill). */
  const bg = scrolled
    ? "linear-gradient(180deg, rgba(8,13,30,0.84) 0%, rgba(4,5,13,0.66) 100%)"
    : "linear-gradient(180deg, rgba(8,13,30,0.42) 0%, rgba(4,5,13,0.20) 100%)";
  const border = scrolled
    ? "1px solid rgba(0,229,255,0.18)"
    : "1px solid rgba(0,229,255,0.06)";
  /* Glassy at the very top → settles onto a lifted shadow once scrolled,
   * so the strip reads as a layer lifting off the page. No layout change. */
  const shadow = scrolled
    ? "0 14px 44px rgba(2,4,12,0.5), 0 1px 0 rgba(0,229,255,0.06) inset"
    : "0 0 0 rgba(0,0,0,0)";
  const textColorMuted = "rgba(232,237,255,0.82)";

  const ctaRef = useRef<HTMLAnchorElement>(null);
  useMagnetic(ctaRef, { strength: 0.28, radius: 80 });

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: bg,
        backdropFilter: "blur(22px) saturate(1.7)",
        WebkitBackdropFilter: "blur(22px) saturate(1.7)",
        borderBottom: border,
        boxShadow: shadow,
        transition:
          "background .35s ease, border-color .35s ease, box-shadow .35s ease",
      }}
    >
      {/* ── Ambient depth layers (behind content, non-interactive) ── */}
      <span aria-hidden className="lv2-nav-scan" />
      <span aria-hidden className="lv2-nav-sweep" />
      <span
        aria-hidden
        className="lv2-nav-topedge"
        style={{ opacity: scrolled ? 0.9 : 0.45 }}
      />

      <div
        className="lv2-nav-inner"
        style={{
          maxWidth: "100%",
          margin: "0 auto",
          padding: "0 clamp(28px, 3.5vw, 96px)",
          height: 68,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 28,
          position: "relative",
          zIndex: 1,
        }}
      >
        <Link
          href="/"
          className="lv2-brand"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 13,
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <BrandCube />
          <span className="lv2-wordmark">
            <span className="lv2-wordmark-main">ALGORITHM</span>
            <span className="lv2-wordmark-x">X</span>
          </span>
        </Link>

        <LiveTelemetry isLight={isLight} />

        <div className="lv2-nav-links">
          {/* Root-relative on purpose: this Nav also renders on
           *  /cybersecurity, where a bare "#subjects" points at nothing
           *  (0 matching ids -> dead click). "/#subjects" keeps the
           *  same-document scroll on the homepage and navigates home to
           *  the section from anywhere else. */}
          <a
            className="lv2-nav-secondary"
            href="/#subjects"
            style={{ ...navLink, color: textColorMuted }}
          >
            Courses
          </a>
          <Link
            className="lv2-nav-secondary lv2-nav-login"
            href="/login"
            style={{ ...navLink, color: textColorMuted }}
          >
            Log In
          </Link>
          <Link
            ref={ctaRef}
            href="/signup"
            data-cta
            className="lv2-nav-cta"
            style={ctaPill}
          >
            {/* Inner wrapper carries the hover lift + arrow nudge. The lift
                can't live on the <a> itself because useMagnetic owns its
                transform every frame. */}
            <span className="lv2-nav-cta-inner">
              <span className="lv2-nav-cta-label">Get Started</span>
              <Ico name="arrow" size={14} sw={2.4} />
            </span>
          </Link>
        </div>
      </div>

      {/* Sweeping light beam along the bottom hairline — ambient motion
          so the strip never reads as a static bar. */}
      <span aria-hidden className="lv2-nav-beam" />

      <style jsx>{`
        .lv2-nav-links {
          display: flex;
          align-items: center;
          gap: 32px;
          flex-shrink: 0;
        }

        /* ── Background depth layers ───────────────────────────────── */

        /* Faint horizontal scan texture — reads as a powered console
           surface up close, invisible at a glance. */
        .lv2-nav-scan {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background-image: repeating-linear-gradient(
            0deg,
            rgba(180, 240, 255, 0.022) 0px,
            rgba(180, 240, 255, 0.022) 1px,
            transparent 1px,
            transparent 3px
          );
          opacity: 0.6;
        }
        /* Slow, soft cyan highlight gliding across the panel. Driven by
           background-position (not translate) so it never overflows the
           bar and needs no clipping. */
        .lv2-nav-sweep {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background: linear-gradient(
            100deg,
            transparent 36%,
            rgba(0, 229, 255, 0.07) 50%,
            rgba(124, 92, 255, 0.05) 56%,
            transparent 66%
          );
          background-size: 250% 100%;
          background-position: 200% 0;
          animation: lv2NavSweep 9s ease-in-out infinite;
        }
        @keyframes lv2NavSweep {
          0% {
            background-position: 200% 0;
          }
          55%,
          100% {
            background-position: -60% 0;
          }
        }
        /* Cyan→violet edge light along the very top of the bar. */
        .lv2-nav-topedge {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          z-index: 1;
          pointer-events: none;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(0, 229, 255, 0.55) 35%,
            rgba(124, 92, 255, 0.45) 62%,
            transparent
          );
          transition: opacity 0.35s ease;
        }

        /* Bottom-edge light beam. Container clips; inner ::after sweeps. */
        .lv2-nav-beam {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 1.5px;
          overflow: hidden;
          pointer-events: none;
          z-index: 2;
        }
        .lv2-nav-beam::after {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          width: 34%;
          background: linear-gradient(
            90deg,
            transparent,
            var(--lv2-cyan),
            #7c5cff,
            transparent
          );
          filter: blur(0.5px);
          animation: lv2NavBeam 5s ease-in-out infinite;
        }
        @keyframes lv2NavBeam {
          0% {
            transform: translateX(-130%);
            opacity: 0;
          }
          18% {
            opacity: 1;
          }
          82% {
            opacity: 1;
          }
          100% {
            transform: translateX(420%);
            opacity: 0;
          }
        }

        /* ── Wordmark ──────────────────────────────────────────────── */
        /* "ALGORITHM" carries a slow light shimmer + a one-shot boot
           flicker on mount; the trailing "X" is a fixed cyan→violet brand
           accent with its own glow, so the lockup reads as ALGORITHM·X. */
        .lv2-wordmark {
          display: inline-flex;
          align-items: baseline;
          font-family: var(--lv2-font-mono);
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          line-height: 1;
        }
        .lv2-wordmark-main {
          color: var(--lv2-paper);
          background-image: linear-gradient(
            110deg,
            var(--lv2-paper) 0%,
            var(--lv2-paper) 42%,
            #ffffff 48%,
            var(--lv2-cyan-soft) 51%,
            var(--lv2-paper) 58%,
            var(--lv2-paper) 100%
          );
          background-size: 260% 100%;
          background-position: 100% 0;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: lv2WordBoot 0.7s ease-out 1 both,
            lv2WordShimmer 8s ease-in-out 1.2s infinite;
        }
        .lv2-wordmark-x {
          margin-left: 0.04em;
          background-image: linear-gradient(
            150deg,
            var(--lv2-cyan-soft),
            var(--lv2-cyan) 45%,
            #7c5cff
          );
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 8px rgba(0, 229, 255, 0.45));
          animation: lv2WordBoot 0.7s ease-out 0.08s 1 both;
        }
        @keyframes lv2WordShimmer {
          0%,
          70% {
            background-position: 100% 0;
          }
          100% {
            background-position: -40% 0;
          }
        }
        @keyframes lv2WordBoot {
          0% {
            opacity: 0;
          }
          30% {
            opacity: 0.4;
          }
          45% {
            opacity: 0.15;
          }
          70% {
            opacity: 0.9;
          }
          100% {
            opacity: 1;
          }
        }

        /* ── Get Started CTA ───────────────────────────────────────── */
        /* A breathing cyan/violet glow with an inset top highlight (the
           pill reads as a lit, dimensional control), an energy sweep that
           speeds up on hover, a lift+scale on hover, an arrow nudge, a
           press state and a clear focus ring. The lift lives on the inner
           span because useMagnetic drives the <a>'s transform. */
        :global(.lv2-nav-cta) {
          animation: lv2CtaGlow 3.6s ease-in-out infinite;
        }
        :global(.lv2-nav-cta)::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            110deg,
            transparent 30%,
            rgba(255, 255, 255, 0.6) 50%,
            transparent 70%
          );
          background-size: 220% 100%;
          background-position: 180% 0;
          pointer-events: none;
          animation: lv2CtaSweep 6s ease-in-out infinite;
        }
        :global(.lv2-nav-cta-inner) {
          position: relative;
          z-index: 1;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        /* svg comes from the <Ico> component (different file) so it carries
           no styled-jsx scope — these selectors must be fully global to
           match it, including the .lv2-nav-cta-inner span in the chain. */
        :global(.lv2-nav-cta-inner svg) {
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        :global(.lv2-nav-cta:hover .lv2-nav-cta-inner),
        :global(.lv2-nav-cta:focus-visible .lv2-nav-cta-inner) {
          transform: translateY(-1.5px) scale(1.015);
        }
        :global(.lv2-nav-cta:active .lv2-nav-cta-inner) {
          transform: translateY(0) scale(0.97);
        }
        :global(.lv2-nav-cta:hover .lv2-nav-cta-inner svg),
        :global(.lv2-nav-cta:focus-visible .lv2-nav-cta-inner svg) {
          transform: translateX(3px);
        }
        :global(.lv2-nav-cta:hover) {
          animation-duration: 2.4s;
        }
        :global(.lv2-nav-cta:hover)::before {
          animation-duration: 3s;
        }
        :global(.lv2-nav-cta:focus-visible) {
          outline: 2px solid var(--lv2-cyan);
          outline-offset: 3px;
        }
        @keyframes lv2CtaGlow {
          0%,
          100% {
            box-shadow: 0 6px 22px rgba(0, 229, 255, 0.32),
              inset 0 1px 0 rgba(255, 255, 255, 0.55),
              inset 0 0 0 1px rgba(255, 255, 255, 0.16);
          }
          50% {
            box-shadow: 0 10px 34px rgba(0, 229, 255, 0.6),
              0 4px 18px rgba(124, 92, 255, 0.32),
              inset 0 1px 0 rgba(255, 255, 255, 0.6),
              inset 0 0 0 1px rgba(255, 255, 255, 0.22);
          }
        }
        @keyframes lv2CtaSweep {
          0% {
            background-position: 180% 0;
          }
          45%,
          100% {
            background-position: -80% 0;
          }
        }

        /* ── Secondary nav links ───────────────────────────────────── */
        /* A cyan underline that scans in from the left, a faint text glow,
           a 1px lift and a brighten on hover/focus. The underline doubles
           as the keyboard focus indicator and is absolutely positioned, so
           there's no layout shift. */
        :global(.lv2-nav-secondary) {
          position: relative;
          display: inline-block;
          transition: color 0.25s ease, text-shadow 0.25s ease,
            transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        :global(.lv2-nav-secondary)::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: -6px;
          height: 1.5px;
          background: linear-gradient(
            90deg,
            transparent,
            var(--lv2-cyan),
            transparent
          );
          transform: scaleX(0);
          transform-origin: left;
          opacity: 0;
          transition: transform 0.32s cubic-bezier(0.16, 1, 0.3, 1),
            opacity 0.25s ease;
        }
        :global(.lv2-nav-secondary:hover),
        :global(.lv2-nav-secondary:focus-visible) {
          color: var(--lv2-paper);
          text-shadow: 0 0 12px rgba(0, 229, 255, 0.55);
          transform: translateY(-1px);
        }
        :global(.lv2-nav-secondary:hover)::after,
        :global(.lv2-nav-secondary:focus-visible)::after {
          transform: scaleX(1);
          opacity: 1;
        }
        :global(.lv2-nav-secondary:focus-visible) {
          outline: 2px solid rgba(0, 229, 255, 0.55);
          outline-offset: 4px;
          border-radius: 2px;
        }

        /* Tablet: hide the anchor links so the bar never overflows —
           but Log In stays (existing customers on iPad portrait must
           always have a sign-in path; there is no hamburger). CTA pill
           stays visible too. */
        @media (max-width: 900px) {
          :global(.lv2-nav-secondary) {
            display: none !important;
          }
          :global(.lv2-nav-login) {
            display: inline-block !important;
          }
        }
        /* Phone: shrink the CTA pill so it doesn't wrap or push the
           wordmark off-screen. */
        @media (max-width: 540px) {
          :global(.lv2-nav-cta) {
            padding: 9px 14px !important;
            font-size: 11px !important;
            letter-spacing: 0.14em !important;
            gap: 6px !important;
          }
          .lv2-wordmark {
            font-size: 14px;
            letter-spacing: 0.24em;
          }
        }
        @media (max-width: 380px) {
          :global(.lv2-nav-cta) {
            padding: 9px 12px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .lv2-nav-sweep,
          .lv2-nav-beam::after {
            animation: none;
          }
          .lv2-nav-beam::after {
            opacity: 0.35;
            transform: translateX(130%);
          }
          /* Drop continuous motion; keep the resting look. The wordmark
             reverts to a flat fill (no clipped-gradient flicker); the CTA
             keeps its static glow; sweeps are removed. Hover/focus state
             changes still apply — they're user-driven. */
          .lv2-wordmark-main {
            animation: none;
            background-image: none;
            -webkit-text-fill-color: var(--lv2-paper);
            color: var(--lv2-paper);
          }
          .lv2-wordmark-x {
            animation: none;
          }
          :global(.lv2-nav-cta) {
            animation: none;
          }
          :global(.lv2-nav-cta)::before {
            animation: none;
            opacity: 0;
          }
          :global(.lv2-nav-cta-inner),
          :global(.lv2-nav-cta-inner svg),
          :global(.lv2-nav-secondary),
          :global(.lv2-nav-secondary)::after {
            transition: none;
          }
        }
      `}</style>
    </nav>
  );
}

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
function BrandCube() {
  const S = 20; // cube edge (px)
  const T = S / 2; // translateZ to each face
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

  const face: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    width: S,
    height: S,
    background:
      "linear-gradient(135deg, rgba(0,229,255,0.24), rgba(124,92,255,0.10))",
    border: "1px solid rgba(120,240,255,0.72)",
    boxShadow:
      "inset 0 0 8px rgba(0,229,255,0.45), inset 0 0 2px rgba(255,255,255,0.5)",
    borderRadius: 3,
  };

  return (
    <span
      ref={wrapRef}
      aria-hidden
      className="lv2-cube-wrap"
      style={{
        width: S,
        height: S,
        flexShrink: 0,
        display: "inline-block",
        perspective: 460,
      }}
    >
      <span ref={sceneRef} className="lv2-cube-scene">
        <span className="lv2-cube">
          <span style={{ ...face, transform: `rotateY(0deg) translateZ(${T}px)` }} />
          <span style={{ ...face, transform: `rotateY(90deg) translateZ(${T}px)` }} />
          <span style={{ ...face, transform: `rotateY(180deg) translateZ(${T}px)` }} />
          <span style={{ ...face, transform: `rotateY(270deg) translateZ(${T}px)` }} />
          <span style={{ ...face, transform: `rotateX(90deg) translateZ(${T}px)` }} />
          <span style={{ ...face, transform: `rotateX(-90deg) translateZ(${T}px)` }} />
          {/* Inner energy core */}
          <span className="lv2-cube-core" />
        </span>
        {/* Orbiting light spark on a tilted ring */}
        <span className="lv2-cube-orbit">
          <span className="lv2-cube-orbit-ring" />
          <span className="lv2-cube-orbit-spin">
            <span className="lv2-cube-orbit-dot" />
          </span>
        </span>
      </span>

      <style jsx>{`
        /* Wrapper carries the slow float + breathing bloom. */
        .lv2-cube-wrap {
          animation: lv2CubeFloat 6s ease-in-out infinite,
            lv2CubeGlow 4.5s ease-in-out infinite;
        }
        /* Scene applies hover-parallax tilt (CSS vars), eased back on leave. */
        .lv2-cube-scene {
          position: relative;
          display: block;
          width: ${S}px;
          height: ${S}px;
          transform-style: preserve-3d;
          transform: rotateX(var(--lv2-cube-rx, 0deg))
            rotateY(var(--lv2-cube-ry, 0deg));
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        /* Inner cube spins continuously around Y with a constant tilt. */
        .lv2-cube {
          position: absolute;
          inset: 0;
          transform-style: preserve-3d;
          animation: lv2CubeSpin 9s linear infinite;
        }
        .lv2-cube-core {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 9px;
          height: 9px;
          margin: -4.5px 0 0 -4.5px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            #ffffff 0%,
            var(--lv2-cyan-soft) 38%,
            rgba(0, 229, 255, 0) 72%
          );
          box-shadow: 0 0 10px 2px rgba(0, 229, 255, 0.85);
          transform: translateZ(0);
          animation: lv2CorePulse 2.8s ease-in-out infinite;
        }
        /* Tilted orbit plane around the cube. */
        .lv2-cube-orbit {
          position: absolute;
          inset: -4px;
          transform-style: preserve-3d;
          transform: rotateX(72deg);
        }
        .lv2-cube-orbit-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 1px solid rgba(0, 229, 255, 0.22);
        }
        .lv2-cube-orbit-spin {
          position: absolute;
          inset: 0;
          animation: lv2OrbitSpin 4.5s linear infinite;
        }
        .lv2-cube-orbit-dot {
          position: absolute;
          top: -2px;
          left: 50%;
          width: 4px;
          height: 4px;
          margin-left: -2px;
          border-radius: 50%;
          background: #c7f7ff;
          box-shadow: 0 0 7px 1.5px rgba(0, 229, 255, 0.95);
        }
        @keyframes lv2CubeSpin {
          from {
            transform: rotateX(-12deg) rotateY(0deg);
          }
          to {
            transform: rotateX(-12deg) rotateY(360deg);
          }
        }
        @keyframes lv2CubeFloat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-2.5px);
          }
        }
        @keyframes lv2CubeGlow {
          0%,
          100% {
            filter: drop-shadow(0 0 4px rgba(0, 229, 255, 0.4));
          }
          50% {
            filter: drop-shadow(0 0 9px rgba(0, 229, 255, 0.75));
          }
        }
        @keyframes lv2CorePulse {
          0%,
          100% {
            opacity: 0.85;
            transform: translateZ(0) scale(0.85);
          }
          50% {
            opacity: 1;
            transform: translateZ(0) scale(1.12);
          }
        }
        @keyframes lv2OrbitSpin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .lv2-cube-wrap {
            animation: none;
            filter: drop-shadow(0 0 5px rgba(0, 229, 255, 0.5));
          }
          .lv2-cube {
            animation: none;
            transform: rotateX(-14deg) rotateY(-30deg);
          }
          .lv2-cube-orbit-spin {
            animation: none;
          }
          .lv2-cube-core {
            animation: none;
            opacity: 1;
          }
        }
      `}</style>
    </span>
  );
}

/**
 * LiveTelemetry — the centred "this site is alive" console. A grouped
 * capsule of live read-outs: a pulsing online status, a signal-bar stream
 * count, an age-track count and a ticking latency value with a trend
 * caret. A soft scan shimmer glides across the group. Hidden under 1100px
 * so the bar never overflows on tablets.
 */
function LiveTelemetry({ isLight }: { isLight: boolean }) {
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [latency, setLatency] = useState(42);
  const [trend, setTrend] = useState<"up" | "down">("down");
  const latencyRef = useRef(42);

  // Drift the latency read-out by ±1–3ms every couple of seconds, kept in
  // a believable 38–47ms band, so it reads as a live measurement rather
  // than a number that randomly leaps around. Paused under reduced motion.
  useEffect(() => {
    if (reduceMotion) return;
    const i = setInterval(() => {
      const prev = latencyRef.current;
      const step = 1 + Math.floor(Math.random() * 3); // 1–3ms
      const dir = Math.random() < 0.5 ? -1 : 1;
      let next = prev + step * dir;
      if (next < 38) next = 38 + step;
      else if (next > 47) next = 47 - step;
      latencyRef.current = next;
      setLatency(next);
      setTrend(next >= prev ? "up" : "down");
    }, 2600);
    return () => clearInterval(i);
  }, [reduceMotion]);

  const baseColor = isLight ? "rgba(10,15,28,0.78)" : "rgba(232,237,255,0.82)";

  return (
    <div
      className="lv2-telemetry"
      aria-hidden
      style={{
        fontFamily: "var(--lv2-font-mono)",
        color: baseColor,
        transition: "color .3s ease",
      }}
    >
      <span className="lv2-tel-shell">
        <span className="lv2-tel-scan" aria-hidden />

        <span
          className="lv2-tel-item lv2-tel-status"
          style={{ animationDelay: "0.05s" }}
        >
          <span className="lv2-tel-dot" aria-hidden />
          <span className="lv2-tel-label">Systems</span>
          <span className="lv2-tel-online">Online</span>
        </span>

        <i className="lv2-tel-div" aria-hidden />

        <span className="lv2-tel-item" style={{ animationDelay: "0.12s" }}>
          <span className="lv2-tel-bars" aria-hidden>
            <i />
            <i />
            <i />
          </span>
          <span className="lv2-tel-num">6</span>
          <span className="lv2-tel-label">Streams</span>
        </span>

        <i className="lv2-tel-div" aria-hidden />

        <span className="lv2-tel-item" style={{ animationDelay: "0.19s" }}>
          <span className="lv2-tel-num">4</span>
          <span className="lv2-tel-label">Age Tracks</span>
        </span>

        <i className="lv2-tel-div" aria-hidden />

        <span
          className="lv2-tel-item lv2-tel-latency-item"
          style={{ animationDelay: "0.26s" }}
        >
          <span className="lv2-tel-label">Latency</span>
          {/* key remounts the value on each change so it gets a tiny fade-in
              blip — reads as a fresh reading landing. */}
          <span className="lv2-tel-latency" key={latency}>
            {latency}
            <span className="lv2-tel-unit">ms</span>
          </span>
          <span className={`lv2-tel-trend lv2-tel-trend-${trend}`}>
            {trend === "up" ? "▲" : "▼"}
          </span>
        </span>
      </span>

      <style jsx>{`
        .lv2-telemetry {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        /* Grouped capsule — gives the read-outs a console housing.
           nowrap keeps every read-out on a single line (no "AGE / TRACKS"
           wrapping when horizontal room gets tight). */
        .lv2-tel-shell {
          position: relative;
          display: inline-flex;
          align-items: center;
          white-space: nowrap;
          padding: 6px 6px;
          border-radius: 999px;
          border: 1px solid rgba(0, 229, 255, 0.14);
          background: linear-gradient(
            180deg,
            rgba(0, 229, 255, 0.05),
            rgba(124, 92, 255, 0.03)
          );
          box-shadow: inset 0 0 18px rgba(0, 229, 255, 0.05);
          overflow: hidden;
        }
        /* Scan shimmer gliding across the whole console. */
        .lv2-tel-scan {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          width: 36%;
          pointer-events: none;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(160, 240, 255, 0.12),
            transparent
          );
          transform: translateX(-60%);
          animation: lv2TelScan 7s ease-in-out infinite;
        }
        @keyframes lv2TelScan {
          0% {
            transform: translateX(-60%);
            opacity: 0;
          }
          12% {
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            transform: translateX(380%);
            opacity: 0;
          }
        }

        /* Staggered fade-down as the console boots. Only the entrance
           opacity is keyed, so each item settles to its resting state. */
        .lv2-tel-item {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 0 12px;
          font-size: 11px;
          animation: lv2TelReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes lv2TelReveal {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
        }
        .lv2-tel-div {
          width: 1px;
          height: 13px;
          background: linear-gradient(
            180deg,
            transparent,
            rgba(0, 229, 255, 0.35),
            transparent
          );
        }
        .lv2-tel-label {
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(232, 237, 255, 0.58);
        }
        .lv2-tel-num {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.02em;
          color: var(--lv2-cyan-soft);
          text-shadow: 0 0 10px rgba(0, 229, 255, 0.4);
        }
        .lv2-tel-online {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #7dffb0;
          text-shadow: 0 0 10px rgba(95, 255, 163, 0.45);
        }

        /* Live status dot — stronger pulse + breathing ping ring. */
        .lv2-tel-dot {
          position: relative;
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #5fffa3;
          box-shadow: 0 0 12px #5fffa3, 0 0 4px #ffffff inset;
          animation: lv2TelPulse 2.2s ease-in-out infinite;
        }
        .lv2-tel-dot::after {
          content: "";
          position: absolute;
          inset: -2px;
          border-radius: 999px;
          border: 1px solid #5fffa3;
          opacity: 0;
          animation: lv2TelRing 2.2s ease-out infinite;
        }
        @keyframes lv2TelPulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(0.82);
          }
        }
        @keyframes lv2TelRing {
          0% {
            opacity: 0.6;
            transform: scale(1);
          }
          70%,
          100% {
            opacity: 0;
            transform: scale(2.8);
          }
        }

        /* Mini signal-bar equaliser next to the stream count. */
        .lv2-tel-bars {
          display: inline-flex;
          align-items: flex-end;
          gap: 1.5px;
          height: 10px;
        }
        .lv2-tel-bars i {
          display: block;
          width: 2px;
          border-radius: 1px;
          background: var(--lv2-cyan);
          box-shadow: 0 0 5px rgba(0, 229, 255, 0.6);
          animation: lv2TelEq 1.5s ease-in-out infinite;
        }
        .lv2-tel-bars i:nth-child(1) {
          height: 4px;
          animation-delay: 0s;
        }
        .lv2-tel-bars i:nth-child(2) {
          height: 9px;
          animation-delay: 0.25s;
        }
        .lv2-tel-bars i:nth-child(3) {
          height: 6px;
          animation-delay: 0.5s;
        }
        @keyframes lv2TelEq {
          0%,
          100% {
            transform: scaleY(0.55);
            opacity: 0.7;
          }
          50% {
            transform: scaleY(1);
            opacity: 1;
          }
        }

        /* Latency value — bright, tabular, with a fade blip on refresh
           and a coloured trend caret. */
        .lv2-tel-latency {
          display: inline-flex;
          align-items: baseline;
          font-size: 13px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
          color: var(--lv2-cyan-soft);
          text-shadow: 0 0 10px rgba(0, 229, 255, 0.4);
          animation: lv2TelBlip 0.5s ease;
        }
        .lv2-tel-unit {
          font-size: 9px;
          font-weight: 600;
          margin-left: 1px;
          opacity: 0.7;
        }
        .lv2-tel-trend {
          font-size: 8px;
          line-height: 1;
        }
        .lv2-tel-trend-up {
          color: #ff9d6e;
        }
        .lv2-tel-trend-down {
          color: #5fffa3;
        }
        @keyframes lv2TelBlip {
          from {
            opacity: 0.35;
          }
          to {
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .lv2-tel-item,
          .lv2-tel-latency,
          .lv2-tel-dot,
          .lv2-tel-dot::after,
          .lv2-tel-bars i,
          .lv2-tel-scan {
            animation: none;
          }
          .lv2-tel-dot::after,
          .lv2-tel-scan {
            opacity: 0;
          }
          .lv2-tel-bars i {
            transform: none;
            opacity: 1;
          }
        }
        /* Hide the telemetry console below this width: with the brand,
           console and links all flex-shrink:0 (so nothing wraps), the
           console is the optional piece that's dropped first to keep the
           bar from overflowing and to give the links breathing room. */
        @media (max-width: 1240px) {
          .lv2-telemetry {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

const navLink: React.CSSProperties = {
  fontFamily: "var(--lv2-font-mono)",
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  textDecoration: "none",
  whiteSpace: "nowrap",
  // includes text-shadow + transform so the hover glow/lift ease in (the
  // .lv2-nav-secondary CSS transition is otherwise overridden by this rule).
  transition:
    "color .25s ease, text-shadow .25s ease, transform .25s cubic-bezier(0.16,1,0.3,1)",
};

const ctaPill: React.CSSProperties = {
  background:
    "linear-gradient(135deg, #2af0ff 0%, #00cfff 55%, #00b4f0 100%)",
  color: "var(--lv2-ink)",
  fontFamily: "var(--lv2-font-mono)",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  padding: "10px 18px",
  borderRadius: 999,
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  // position/overflow let the animated gradient sweep ride inside the
  // pill and stay clipped to its rounded edge.
  position: "relative",
  overflow: "hidden",
  boxShadow:
    "0 6px 22px rgba(0,229,255,0.32), inset 0 1px 0 rgba(255,255,255,0.55)",
  willChange: "transform",
};
