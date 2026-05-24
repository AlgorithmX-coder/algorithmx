"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Ico, useCinematicReleaseProgress, useMagnetic } from "./utilities";

/**
 * Landing-v2 top nav.
 *
 * Adaptive theme:
 *  - Over the cinematic (scroll < ~cinematic height): dark glass + white text
 *  - Over the bright product page: light glass + dark text
 * Smoothly transitions across the boundary.
 *
 * Embedded LiveTelemetry chip (centered): "127 ACTIVE / 6 STREAMS / 41ms"
 * ticks live every couple seconds for the "this site is alive" feel.
 *
 * Magnetic "Get Started" CTA pill.
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

  /* CINEMATIC IMMERSION: hide the CTA pill while the LaptopScene
   * cinematic is still in its sticky pin. Threshold is viewport-aware
   * (cinematic rail is 280vh on desktop / 180vh on mobile) and lives
   * in a shared hook so Nav + Algo always agree on what "cinematic
   * is done" means. */
  const ctaOpacity = useCinematicReleaseProgress();
  const ctaPointer: "auto" | "none" = ctaOpacity < 0.5 ? "none" : "auto";

  const bg =
    scrollY > 24
      ? "rgba(4,5,13,0.72)"
      : "rgba(4,5,13,0.36)";
  const border =
    scrollY > 24
      ? "1px solid rgba(0,229,255,0.16)"
      : "1px solid transparent";
  const textColor = "var(--lv2-paper)";
  const textColorMuted = "rgba(232,237,255,0.78)";
  const indicatorColor = "var(--lv2-cyan)";

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
          <span
            aria-hidden
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: indicatorColor,
              boxShadow: `0 0 14px ${indicatorColor}b3`,
              transition: "background .3s ease, box-shadow .3s ease",
            }}
          />
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
            Subjects
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
            href="/cyberheroes"
            data-cta
            className="lv2-nav-cta"
            style={{
              ...ctaPill,
              opacity: ctaOpacity,
              pointerEvents: ctaPointer,
              transition: "opacity .35s ease",
            }}
            aria-hidden={ctaOpacity < 0.5}
            tabIndex={ctaOpacity < 0.5 ? -1 : 0}
          >
            <span className="lv2-nav-cta-label">Get Started</span>
            <Ico name="arrow" size={14} sw={2.2} />
          </Link>
        </div>
      </div>

      <style jsx>{`
        .lv2-nav-links {
          display: flex;
          align-items: center;
          gap: 24px;
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
      `}</style>
    </nav>
  );
}

function LiveTelemetry({ isLight }: { isLight: boolean }) {
  const [active, setActive] = useState(127);
  const [uptime, setUptime] = useState(41);
  useEffect(() => {
    const i = setInterval(() => {
      setActive(120 + Math.floor(Math.random() * 14));
      setUptime(38 + Math.floor(Math.random() * 8));
    }, 1800);
    return () => clearInterval(i);
  }, []);
  const textColor = isLight
    ? "rgba(10,15,28,0.7)"
    : "rgba(232,237,255,0.7)";
  const dotColor = isLight ? "#16a34a" : "#5fffa3";
  return (
    <div
      className="lv2-telemetry"
      aria-hidden
      style={{
        display: "flex",
        alignItems: "center",
        gap: 22,
        fontFamily: "var(--lv2-font-mono)",
        fontSize: 11,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: textColor,
        transition: "color .3s ease",
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: 999,
            background: dotColor,
            boxShadow: `0 0 10px ${dotColor}b3`,
            animation: "lv2NavPulse 1.6s ease-in-out infinite",
          }}
        />
        {active} ACTIVE
      </span>
      <span style={{ opacity: 0.7 }}>6 STREAMS</span>
      <span style={{ opacity: 0.7 }}>UPTIME {uptime}ms</span>
      <style jsx>{`
        @keyframes lv2NavPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
        @media (max-width: 1100px) {
          .lv2-telemetry { display: none !important; }
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
