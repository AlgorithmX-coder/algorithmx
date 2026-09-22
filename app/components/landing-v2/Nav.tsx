"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
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
type NavProps = {
  /** Page-owned content where the telemetry console normally sits. */
  centre?: ReactNode;
  /** Replaces the "Get Started" pill. A "#id" href stays on the page. */
  cta?: { label: string; href: string };
  /** One page-owned link, in the bar beside the CTA. */
  aside?: { label: string; href: string };
  /** The live telemetry console. */
  showTelemetry?: boolean;
  /** The Courses and Schools links. */
  showSiteLinks?: boolean;
  /** Which page the bar is sitting on. */
  tone?: "night" | "sand";
};

export default function Nav({ centre, cta, aside, showTelemetry = true, showSiteLinks = true, tone = "night" }: NavProps) {
  const onSand = tone === "sand";
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

  /* The console's wrapper colour is an inline style, so no stylesheet can
   * reach it: the tone has to arrive as this flag. Everything else about
   * the bar changes through data-tone. */
  const isLight = onSand;

  /* Layered gradient glass (gives the bar internal depth vs. a flat fill). */
  const bg = onSand
    ? scrolled
      ? "linear-gradient(180deg, rgba(255,253,248,0.96) 0%, rgba(250,245,236,0.9) 100%)"
      : "linear-gradient(180deg, rgba(255,253,248,0.8) 0%, rgba(250,245,236,0.66) 100%)"
    : scrolled
      ? "linear-gradient(180deg, rgba(8,13,30,0.84) 0%, rgba(4,5,13,0.66) 100%)"
      : "linear-gradient(180deg, rgba(8,13,30,0.42) 0%, rgba(4,5,13,0.20) 100%)";
  const border = onSand
    ? scrolled
      ? "1px solid rgba(70,58,44,0.18)"
      : "1px solid rgba(70,58,44,0.09)"
    : scrolled
      ? "1px solid rgba(0,229,255,0.18)"
      : "1px solid rgba(0,229,255,0.06)";
  /* Glassy at the very top → settles onto a lifted shadow once scrolled,
   * so the strip reads as a layer lifting off the page. No layout change. */
  /* On paper a bar stands out by lifting, not by darkening. */
  const shadow = onSand
    ? scrolled
      ? "0 10px 30px -14px rgba(86,68,45,0.5), inset 0 1px 0 rgba(255,255,255,0.9)"
      : "0 4px 18px -14px rgba(86,68,45,0.4)"
    : scrolled
      ? "0 14px 44px rgba(2,4,12,0.5), 0 1px 0 rgba(0,229,255,0.06) inset"
      : "0 0 0 rgba(0,0,0,0)";
  const ctaRef = useRef<HTMLAnchorElement>(null);
  useMagnetic(ctaRef, { strength: 0.28, radius: 80 });
  const ctaHref = cta?.href ?? "/signup";
  /* Inner wrapper carries the hover lift + arrow nudge. The lift can't live
     on the <a> itself because useMagnetic owns its transform every frame. */
  const ctaInner = (
    <span className="lv2-nav-cta-inner">
      <span className="lv2-nav-cta-label">{cta?.label ?? "Get Started"}</span>
      <Ico name="arrow" size={14} sw={2.4} />
    </span>
  );

  return (
    <nav
      data-tone={tone}
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

        {showTelemetry ? <LiveTelemetry isLight={isLight} /> : null}
        {centre}

        <div className="lv2-nav-links">
          {showSiteLinks ? (
            <>
              {/* Root-relative on purpose: this Nav also renders on
               *  /cybersecurity, where a bare "#subjects" points at nothing
               *  (0 matching ids -> dead click). "/#subjects" keeps the
               *  same-document scroll on the homepage and navigates home to
               *  the section from anywhere else. */}
              <a
                className="lv2-nav-secondary"
                href="/#subjects"
                style={onSand ? { ...navLink, color: "#075a6b" } : navLink}
              >
                Courses
              </a>
              <Link
                className="lv2-nav-secondary"
                href="/schools"
                style={onSand ? { ...navLink, color: "#075a6b" } : navLink}
              >
                Schools
              </Link>
            </>
          ) : null}
          {aside ? (
            <Link
              className="lv2-nav-secondary lv2-nav-aside"
              href={aside.href}
              style={navLink}
            >
              {aside.label}
            </Link>
          ) : null}
          {ctaHref.startsWith("#") ? (
            /* Same-page anchor: a plain <a> scrolls without a route change. */
            <a ref={ctaRef} href={ctaHref} data-cta className="lv2-nav-cta" style={ctaPill}>
              {ctaInner}
            </a>
          ) : (
            <Link ref={ctaRef} href={ctaHref} data-cta className="lv2-nav-cta" style={ctaPill}>
              {ctaInner}
            </Link>
          )}
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
            var(--lv2-brand-violet, #7c5cff),
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
          color: var(--lv2-word-mark, var(--lv2-paper));
          background-image: linear-gradient(
            110deg,
            var(--lv2-word-mark, var(--lv2-paper)) 0%,
            var(--lv2-word-mark, var(--lv2-paper)) 42%,
            var(--lv2-word-flash, #ffffff) 48%,
            var(--lv2-cyan-soft) 51%,
            var(--lv2-word-mark, var(--lv2-paper)) 58%,
            var(--lv2-word-mark, var(--lv2-paper)) 100%
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
            var(--lv2-brand-violet, #7c5cff)
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
        /* The page's own link: warm against the cyan chips, so a returning
           school finds its way in without competing with the CTA. */
        :global(.lv2-nav-aside) {
          color: var(--lv2-aside-ink, #ffca82);
          text-shadow: 0 0 14px rgba(255,180,90,0.55);
        }
        :global(.lv2-nav-aside)::after { background: var(--lv2-aside-ink, #ffca82) !important; }
        :global(.lv2-nav-aside):hover,
        :global(.lv2-nav-aside):focus-visible {
          color: #ffe2b8;
          text-shadow: 0 0 20px rgba(255,190,110,0.85);
        }

        /* Sand: the shimmer lightens the ink instead of punching a hole in
           it, and the secondary links carry a heavier edge because a
           hairline that reads on black disappears on paper. */
        nav[data-tone="sand"] {
          /* The shimmer lightens the ink instead of punching a hole in it,
             and the three brand colours come down to their sand values.
             Tokens rather than rules, because the wordmark's gradient and
             the aside's underline each read theirs more than once. */
          --lv2-word-flash: rgba(20, 22, 29, 0.32);
          --lv2-word-mark: var(--lv2-ink);
          --lv2-brand-violet: #5744c9;
          --lv2-aside-ink: #9a5f00;
        }
        /* The console on paper. Its night half stays in the base rules, so
           /cybersecurity keeps the bar it has always had. */
        nav[data-tone="sand"] :global(.lv2-tel-online) {
          color: #0e7a45 !important;
        }
        nav[data-tone="sand"] :global(.lv2-tel-dot) {
          background: #0e7a45 !important;
        }
        nav[data-tone="sand"] :global(.lv2-tel-dot)::after {
          border-color: #0e7a45 !important;
        }
        nav[data-tone="sand"] :global(.lv2-tel-trend-down) {
          color: #0e7a45 !important;
        }
        /* The CTA was being recoloured by the homepage's own page-scoped
           CSS, which is why /schools still showed the old bright cyan. It
           belongs to the tone, so both pages get it from one place. */
        nav[data-tone="sand"] :global(.lv2-nav-cta) {
          background: #0a7085 !important;
          color: #fffdfa !important;
          box-shadow: 0 10px 26px -12px rgba(10, 112, 133, 0.85),
            inset 0 1px 0 rgba(255, 255, 255, 0.4) !important;
        }
        nav[data-tone="sand"] :global(.lv2-nav-cta *) {
          color: #fffdfa !important;
        }
        nav[data-tone="sand"] :global(.lv2-nav-cta):hover {
          box-shadow: 0 14px 32px -12px rgba(10, 112, 133, 1),
            inset 0 1px 0 rgba(255, 255, 255, 0.5) !important;
        }

        /* Owner: the telemetry needs to stand out more. It was glass over
           glass with no edge anywhere, and its dividers, glows and bars
           were still neon values that vanish on paper. It gets a real
           housing and darker labels, but no extra colour: this is ambient
           status, and the CTA beside it has to stay the loudest thing. */
        nav[data-tone="sand"] :global(.lv2-tel-shell) {
          border: 1px solid rgba(70, 58, 44, 0.18) !important;
          background: linear-gradient(180deg, #fffdf8, #f7f2e8) !important;
          box-shadow: 0 6px 16px -12px rgba(86, 68, 45, 0.55),
            inset 0 1px 0 rgba(255, 255, 255, 0.9) !important;
        }
        nav[data-tone="sand"] :global(.lv2-tel-label) {
          color: rgba(43, 35, 24, 0.72) !important;
        }
        nav[data-tone="sand"] :global(.lv2-tel-num),
        nav[data-tone="sand"] :global(.lv2-tel-latency) {
          color: #0a7085 !important;
          text-shadow: none !important;
        }
        nav[data-tone="sand"] :global(.lv2-tel-online) {
          text-shadow: none !important;
        }
        nav[data-tone="sand"] :global(.lv2-tel-dot) {
          box-shadow: 0 0 0 3px rgba(14, 122, 69, 0.16) !important;
        }
        /* The scan shimmer was white light sweeping a dark capsule; on a
           near-white one it is invisible, so it sweeps a shadow instead. */
        nav[data-tone="sand"] :global(.lv2-tel-scan) {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(70, 58, 44, 0.07),
            transparent
          ) !important;
        }
        nav[data-tone="sand"] :global(.lv2-tel-div) {
          background: linear-gradient(
            180deg,
            transparent,
            rgba(70, 58, 44, 0.3),
            transparent
          ) !important;
        }
        nav[data-tone="sand"] :global(.lv2-tel-bars i) {
          background: #0a7085 !important;
          box-shadow: none !important;
        }
        /* Owner: make these stand out. A grey outline pill reads as
           furniture next to a solid primary, so they become tinted
           secondary buttons: a teal wash, a teal edge, a teal label and
           the same lift the cards get. Hierarchy is then tinted for
           secondary, solid for primary, rather than three weights of
           outline. Label #075a6b on the 0.16 wash measures 6.1:1. */
        /* Behind the same 641px breakpoint as the chip shape itself: the
           padding and the pill radius only exist above it, so tinting at
           every width gave phones a square teal slab behind plain text.
           Below it these are plain links and only need their ink. */
        @media (max-width: 640px) {
          nav[data-tone="sand"] :global(.lv2-nav-secondary:not(.lv2-nav-aside)) {
            color: #075a6b !important;
            text-shadow: none !important;
          }
        }
        @media (min-width: 641px) {
        nav[data-tone="sand"] :global(.lv2-nav-secondary:not(.lv2-nav-aside)) {
          border-color: rgba(10, 112, 133, 0.42) !important;
          background: rgba(10, 112, 133, 0.16) !important;
          color: #075a6b !important;
          font-weight: 700;
          /* Owner: put these in glowing fonts. A halo works on black by
             adding light; sand has no darkness to bloom into, so the glow
             is a teal bloom carried by the letterforms themselves, over a
             thin white lift that keeps them crisp on the wash. */
          text-shadow: 0 0 10px rgba(10, 112, 133, 0.55), 0 1px 0 rgba(255, 255, 255, 0.6) !important;
          box-shadow: 0 6px 16px -12px rgba(10, 112, 133, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.7) !important;
        }
        nav[data-tone="sand"] :global(.lv2-nav-secondary:not(.lv2-nav-aside):hover),
        nav[data-tone="sand"] :global(.lv2-nav-secondary:not(.lv2-nav-aside):focus-visible) {
          border-color: rgba(10, 112, 133, 0.75) !important;
          background: rgba(10, 112, 133, 0.26) !important;
          color: #05454f !important;
          text-shadow: 0 0 14px rgba(10, 112, 133, 0.85), 0 1px 0 rgba(255, 255, 255, 0.6) !important;
          box-shadow: 0 8px 20px -12px rgba(10, 112, 133, 1), inset 0 1px 0 rgba(255, 255, 255, 0.7) !important;
        }
        }
        :global(.lv2-nav-secondary) {
          position: relative;
          display: inline-block;
          transition: color 0.25s ease, text-shadow 0.25s ease,
            border-color 0.25s ease, background 0.25s ease,
            box-shadow 0.25s ease,
            transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        /* Not on the aside: it is the same class but its own amber, and
           this rule sits after the amber one, so it would win. */
        :global(.lv2-nav-secondary:not(.lv2-nav-aside)) {
          color: rgba(232, 237, 255, 0.82);
        }
        /* Owner 2026-09-21: "highlight these". Courses and Schools sat as
           plain grey text next to a solid cyan CTA and read as furniture.
           They now sit in lit chips at rest: outline chips for the
           secondary links, the solid pill for the primary one, so the bar
           has a hierarchy rather than three weights of the same thing.
           The page's own amber link keeps the underline treatment, and
           phones keep plain text because three chips plus a CTA do not fit
           a 390px bar. */
        @media (min-width: 641px) {
          :global(.lv2-nav-secondary:not(.lv2-nav-aside)) {
            padding: 7px 14px;
            border-radius: 999px;
            border: 1px solid rgba(159, 245, 255, 0.24);
            background: rgba(0, 229, 255, 0.06);
            box-shadow: inset 0 1px 0 rgba(232, 237, 255, 0.05);
            color: var(--lv2-word-mark, var(--lv2-paper));
          }
          /* the chip does the job the scanning underline used to do */
          :global(.lv2-nav-secondary:not(.lv2-nav-aside))::after {
            display: none;
          }
          :global(.lv2-nav-secondary:not(.lv2-nav-aside):hover),
          :global(.lv2-nav-secondary:not(.lv2-nav-aside):focus-visible) {
            border-color: rgba(0, 229, 255, 0.55);
            background: rgba(0, 229, 255, 0.14);
            box-shadow: 0 0 22px -8px rgba(0, 229, 255, 0.9),
              inset 0 1px 0 rgba(232, 237, 255, 0.08);
          }
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
          color: var(--lv2-word-mark, var(--lv2-paper));
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

        /* Phones: Courses, Schools and Get Started all stay in the bar
           (owner 2026-09-17; there is no hamburger). The bar tightens
           instead: side padding, gaps, a smaller wordmark and labels, and
           the CTA drops its arrow. Vertical padding on the links and the
           pill keeps each tap target near 40px without changing how they
           look. From 641px up the desktop sizes fit, so nothing hides at
           any width. */
        @media (max-width: 640px) {
          .lv2-nav-inner {
            padding: 0 12px !important;
            gap: 8px !important;
          }
          :global(.lv2-brand) {
            gap: 6px !important;
          }
          .lv2-wordmark {
            font-size: 11px;
            letter-spacing: 0.12em;
          }
          .lv2-nav-links {
            gap: 10px;
          }
          :global(.lv2-nav-secondary) {
            font-size: 10px !important;
            letter-spacing: 0.06em !important;
            padding: 12px 0 !important;
          }
          :global(.lv2-nav-secondary)::after {
            bottom: 6px;
          }
          :global(.lv2-nav-cta) {
            padding: 11px 12px !important;
            font-size: 10px !important;
            letter-spacing: 0.06em !important;
            gap: 0 !important;
          }
          :global(.lv2-nav-cta-inner svg) {
            display: none !important;
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
            -webkit-text-fill-color: var(--lv2-word-mark, var(--lv2-paper));
            color: var(--lv2-word-mark, var(--lv2-paper));
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

function BrandCube() {
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
    <span ref={wrapRef} aria-hidden className="lv2-cube-wrap">
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

  const baseColor = isLight ? "rgba(10,15,28,0.78)" : "rgba(232, 237, 255, 0.82)";

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
