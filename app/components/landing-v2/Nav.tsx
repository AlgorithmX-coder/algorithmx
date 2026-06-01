"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Ico, useMagnetic, useMediaQuery } from "./utilities";

/**
 * Landing-v2 top nav.
 *
 * Adaptive theme:
 *  - Over the cinematic (scroll < ~cinematic height): dark glass + white text
 *  - Over the bright product page: light glass + dark text
 * Smoothly transitions across the boundary.
 *
 * Motion: the strip is deliberately "alive" rather than a flat bar —
 *  - a slowly rotating 3D brand cube (CSS 3D, reduced-motion safe)
 *  - a cyan→violet light beam sweeping the bottom hairline
 *  - a live telemetry HUD (pulsing online dot + ticking latency)
 *
 * Magnetic "Get Started" CTA pill → /signup. "Log In" → /login. Both are
 * always visible/clickable so the signup + login paths are never gated
 * out by the hero cinematic.
 */
export default function Nav() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* The whole page now sits on the unified dark backdrop, so the nav
   * stays dark throughout. The only state change is "transparent at top
   * vs. faintly tinted once scrolled" - to mark the page is "alive". */
  const isLight = false;

  const bg =
    scrollY > 24
      ? "rgba(4,5,13,0.72)"
      : "rgba(4,5,13,0.36)";
  const border =
    scrollY > 24
      ? "1px solid rgba(0,229,255,0.16)"
      : "1px solid transparent";
  /* Glassy at the very top → settles onto a faint shadow once scrolled,
   * so the strip reads as a layer lifting off the page. No layout change. */
  const shadow =
    scrollY > 24 ? "0 10px 34px rgba(2,4,12,0.45)" : "0 0 0 rgba(0,0,0,0)";
  const textColorMuted = "rgba(232,237,255,0.78)";

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
        backdropFilter: "blur(20px) saturate(1.6)",
        WebkitBackdropFilter: "blur(20px) saturate(1.6)",
        borderBottom: border,
        boxShadow: shadow,
        transition:
          "background .3s ease, border-color .3s ease, box-shadow .3s ease",
      }}
    >
      <div
        style={{
          maxWidth: 1320,
          margin: "0 auto",
          padding: "0 var(--lv2-rail)",
          height: 68,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            textDecoration: "none",
          }}
        >
          <BrandCube />
          <span
            className="lv2-wordmark"
            style={{
              fontFamily: "var(--lv2-font-mono)",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
            }}
          >
            ALGORITHMX
          </span>
        </Link>

        <LiveTelemetry isLight={isLight} />

        <div className="lv2-nav-links">
          <a
            className="lv2-nav-secondary"
            href="#subjects"
            style={{ ...navLink, color: textColorMuted }}
          >
            Courses
          </a>
          <a
            className="lv2-nav-secondary"
            href="#how"
            style={{ ...navLink, color: textColorMuted }}
          >
            How It Works
          </a>
          <Link
            className="lv2-nav-secondary"
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
            {/* Inner wrapper carries the 1px hover lift + arrow nudge.
                The lift can't live on the <a> itself because useMagnetic
                owns its transform every frame. */}
            <span className="lv2-nav-cta-inner">
              <span className="lv2-nav-cta-label">Get Started</span>
              <Ico name="arrow" size={14} sw={2.2} />
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
          gap: 24px;
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

        /* ── Wordmark: resting paper colour, with a slow light shimmer
           sweeping across the letters every few seconds, plus a one-shot
           "boot" flicker as the strip mounts. The base colour stays paper,
           so it reads identically except for the passing highlight. */
        .lv2-wordmark {
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

        /* ── Get Started CTA: a soft cyan glow that breathes, a gentle
           gradient sweep across the fill, a 1px inner lift + arrow nudge
           on hover, and a clear focus-visible ring. The lift lives on the
           inner span because useMagnetic drives the <a>'s transform. */
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
            rgba(255, 255, 255, 0.55) 50%,
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
          transform: translateY(-1px);
        }
        :global(.lv2-nav-cta:hover .lv2-nav-cta-inner svg),
        :global(.lv2-nav-cta:focus-visible .lv2-nav-cta-inner svg) {
          transform: translateX(3px);
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
            box-shadow: 0 6px 22px rgba(0, 229, 255, 0.32);
          }
          50% {
            box-shadow: 0 8px 30px rgba(0, 229, 255, 0.55);
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

        /* ── Secondary nav links: a thin cyan underline that scans in from
           the left, a faint text glow, and a brighten on hover/focus.
           The underline doubles as the keyboard focus indicator (plus a
           subtle outline) and is absolutely positioned, so no layout shift. */
        :global(.lv2-nav-secondary) {
          position: relative;
          transition: color 0.25s ease, text-shadow 0.25s ease;
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
          text-shadow: 0 0 12px rgba(0, 229, 255, 0.5);
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

        /* Tablet: hide secondary links earlier (was 900px) so the bar
         * never overflows. CTA pill stays visible. */
        @media (max-width: 900px) {
          :global(.lv2-nav-secondary) {
            display: none !important;
          }
        }
        /* Phone: shrink the CTA pill so it doesn't wrap or push the
         * wordmark off-screen. Just an icon-style pill with a short
         * label, plenty of touch area without dominating the bar. */
        @media (max-width: 540px) {
          :global(.lv2-nav-cta) {
            padding: 9px 14px !important;
            font-size: 11px !important;
            letter-spacing: 0.14em !important;
            gap: 6px !important;
          }
          :global(.lv2-nav-cta-label) {
            /* Optional: tighten if needed */
          }
        }
        @media (max-width: 380px) {
          :global(.lv2-nav-cta) {
            padding: 9px 12px !important;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .lv2-nav-beam::after {
            animation: none;
            opacity: 0.35;
            transform: translateX(130%);
          }
          /* Drop continuous motion; keep the resting look. The wordmark
             reverts to a flat paper fill (no clipped-gradient flicker),
             the CTA keeps its static glow, and the sweep is removed.
             Hover/focus state changes still apply — they're user-driven. */
          .lv2-wordmark {
            animation: none;
            background-image: none;
            -webkit-text-fill-color: var(--lv2-paper);
            color: var(--lv2-paper);
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
 * BrandCube — a small CSS-3D cube that rotates around its Y axis as the
 * "system online" brand mark. Four side faces (front/right/back/left)
 * are enough for a Y-spin; a constant rotateX tilt gives it depth.
 * Falls back to a static angled face under prefers-reduced-motion.
 */
function BrandCube() {
  const S = 13; // cube edge (px)
  const T = S / 2; // translateZ to each face
  const face: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    width: S,
    height: S,
    background: "linear-gradient(135deg, var(--lv2-cyan), #7c5cff)",
    border: "1px solid rgba(0,229,255,0.75)",
    boxShadow: "inset 0 0 6px rgba(0,229,255,0.55)",
    borderRadius: 2,
  };
  return (
    <span
      aria-hidden
      className="lv2-cube-wrap"
      style={{
        width: S,
        height: S,
        flexShrink: 0,
        display: "inline-block",
        perspective: 280,
      }}
    >
      <span
        className="lv2-cube"
        style={{
          position: "relative",
          display: "block",
          width: S,
          height: S,
          transformStyle: "preserve-3d",
        }}
      >
        <span style={{ ...face, transform: `rotateY(0deg) translateZ(${T}px)` }} />
        <span style={{ ...face, transform: `rotateY(90deg) translateZ(${T}px)` }} />
        <span style={{ ...face, transform: `rotateY(180deg) translateZ(${T}px)` }} />
        <span style={{ ...face, transform: `rotateY(270deg) translateZ(${T}px)` }} />
      </span>
      <style jsx>{`
        /* Soft cyan halo that breathes around the mark — the cube reads as
           a powered-on status light rather than a flat icon. */
        .lv2-cube-wrap {
          animation: lv2CubeGlow 4.5s ease-in-out infinite;
        }
        .lv2-cube {
          animation: lv2CubeSpin 7s linear infinite;
        }
        @keyframes lv2CubeSpin {
          from {
            transform: rotateX(-18deg) rotateY(0deg);
          }
          to {
            transform: rotateX(-18deg) rotateY(360deg);
          }
        }
        @keyframes lv2CubeGlow {
          0%,
          100% {
            filter: drop-shadow(0 0 3px rgba(0, 229, 255, 0.35));
          }
          50% {
            filter: drop-shadow(0 0 7px rgba(0, 229, 255, 0.7));
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .lv2-cube {
            animation: none;
            transform: rotateX(-18deg) rotateY(-32deg);
          }
          .lv2-cube-wrap {
            animation: none;
            filter: drop-shadow(0 0 4px rgba(0, 229, 255, 0.45));
          }
        }
      `}</style>
    </span>
  );
}

/**
 * LiveTelemetry — the centred "this site is alive" HUD. A pulsing green
 * status dot plus a few platform facts and a ticking latency read-out.
 * Hidden under 1100px so the bar never overflows on tablets.
 */
function LiveTelemetry({ isLight }: { isLight: boolean }) {
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [latency, setLatency] = useState(42);
  // Drift the latency read-out by ±1–3ms every couple of seconds, kept in
  // a believable 38–47ms band, so it reads as a live measurement rather
  // than a number that randomly leaps around. Paused under reduced motion.
  useEffect(() => {
    if (reduceMotion) return;
    const i = setInterval(() => {
      setLatency((prev) => {
        const step = 1 + Math.floor(Math.random() * 3); // 1–3ms
        const dir = Math.random() < 0.5 ? -1 : 1;
        const next = prev + step * dir;
        if (next < 38) return 38 + step;
        if (next > 47) return 47 - step;
        return next;
      });
    }, 2600);
    return () => clearInterval(i);
  }, [reduceMotion]);
  const textColor = isLight
    ? "rgba(10,15,28,0.7)"
    : "rgba(232,237,255,0.7)";
  return (
    <div
      className="lv2-telemetry"
      aria-hidden
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        fontFamily: "var(--lv2-font-mono)",
        fontSize: 11,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: textColor,
        transition: "color .3s ease",
      }}
    >
      <span
        className="lv2-tel-item"
        style={{ display: "flex", alignItems: "center", gap: 7, animationDelay: "0.05s" }}
      >
        <span className="lv2-tel-dot" aria-hidden />
        SYSTEMS ONLINE
      </span>
      <span className="lv2-tel-item" style={{ opacity: 0.7, animationDelay: "0.12s" }}>
        6 STREAMS
      </span>
      <span className="lv2-tel-item" style={{ opacity: 0.7, animationDelay: "0.19s" }}>
        4 AGE TRACKS
      </span>
      <span className="lv2-tel-item" style={{ opacity: 0.7, animationDelay: "0.26s" }}>
        LATENCY{" "}
        {/* key remounts the value on each change so it gets a tiny fade-in
            blip — reads as a fresh reading landing. */}
        <span className="lv2-tel-latency" key={latency}>
          {latency}ms
        </span>
      </span>
      <style jsx>{`
        /* Staggered fade-down as the strip mounts. Only the entrance
           opacity is keyed, so each item settles to its own resting
           opacity (the dim facts stay dim). */
        .lv2-tel-item {
          animation: lv2TelReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes lv2TelReveal {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
        }
        .lv2-tel-latency {
          display: inline-block;
          animation: lv2TelBlip 0.5s ease;
        }
        @keyframes lv2TelBlip {
          from {
            opacity: 0.35;
          }
          to {
            opacity: 1;
          }
        }
        .lv2-tel-dot {
          position: relative;
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: #5fffa3;
          box-shadow: 0 0 10px #5fffa3cc;
          animation: lv2TelPulse 2.6s ease-in-out infinite;
        }
        /* Soft outer ring breathing outward — a calm "ping", not a blink. */
        .lv2-tel-dot::after {
          content: "";
          position: absolute;
          inset: -2px;
          border-radius: 999px;
          border: 1px solid #5fffa3;
          opacity: 0;
          animation: lv2TelRing 2.6s ease-out infinite;
        }
        @keyframes lv2TelPulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.65;
            transform: scale(0.88);
          }
        }
        @keyframes lv2TelRing {
          0% {
            opacity: 0.5;
            transform: scale(1);
          }
          70%,
          100% {
            opacity: 0;
            transform: scale(2.6);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .lv2-tel-item,
          .lv2-tel-latency,
          .lv2-tel-dot,
          .lv2-tel-dot::after {
            animation: none;
          }
          .lv2-tel-dot::after {
            opacity: 0;
          }
        }
        @media (max-width: 1100px) {
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
  fontWeight: 500,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  textDecoration: "none",
  // includes text-shadow so the hover glow eases in (the .lv2-nav-secondary
  // CSS transition is otherwise overridden by this inline rule).
  transition: "color .25s ease, text-shadow .25s ease",
};

const ctaPill: React.CSSProperties = {
  background: "var(--lv2-cyan)",
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
  boxShadow: "0 6px 22px rgba(0,229,255,0.32)",
  willChange: "transform",
};
