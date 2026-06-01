"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Ico, useMagnetic } from "./utilities";

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
  const textColor = "var(--lv2-paper)";
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
            style={{
              fontFamily: "var(--lv2-font-mono)",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: textColor,
              transition: "color .3s ease",
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
            <span className="lv2-nav-cta-label">Get Started</span>
            <Ico name="arrow" size={14} sw={2.2} />
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
        @media (prefers-reduced-motion: reduce) {
          .lv2-cube {
            animation: none;
            transform: rotateX(-18deg) rotateY(-32deg);
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
  const [latency, setLatency] = useState(38);
  useEffect(() => {
    const i = setInterval(() => {
      setLatency(34 + Math.floor(Math.random() * 12));
    }, 1800);
    return () => clearInterval(i);
  }, []);
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
      <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <span className="lv2-tel-dot" aria-hidden />
        SYSTEMS ONLINE
      </span>
      <span style={{ opacity: 0.7 }}>6 STREAMS</span>
      <span style={{ opacity: 0.7 }}>4 AGE TRACKS</span>
      <span style={{ opacity: 0.7 }}>LATENCY {latency}ms</span>
      <style jsx>{`
        .lv2-tel-dot {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: #5fffa3;
          box-shadow: 0 0 10px #5fffa3cc;
          animation: lv2TelPulse 1.8s ease-in-out infinite;
        }
        @keyframes lv2TelPulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.45;
            transform: scale(0.7);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .lv2-tel-dot {
            animation: none;
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
  transition: "color .3s ease",
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
  gap: 8,
  boxShadow: "0 6px 22px rgba(0,229,255,0.32)",
  willChange: "transform",
};
