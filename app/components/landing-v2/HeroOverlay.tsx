"use client";

import Link from "next/link";
import { motion, type MotionValue, useTransform } from "framer-motion";

/**
 * HeroOverlay. The static brand UI that fades in over the cinematic.
 * Eyebrow + headline + sub-line + dual CTAs.
 *
 * Driven by the same `progress` MotionValue as VaultScene. Stays
 * invisible until scroll-progress passes ~0.7 (the moment the AX
 * glyph starts forming), then fades up with a slight lift to land
 * on top of the vault interior.
 */

interface HeroOverlayProps {
  progress: MotionValue<number>;
}

/* Eyebrow rewritten - "AGES 6 TO ADULT" framing read as a parents-
 * brochure spec sheet (and was redundant with the headline's "every
 * stage of life"). Replaced with a mission-grade line that signals
 * the platform's ambition before the headline lands. */
const EYEBROW = "// SIX FIELDS  ·  BUILT FOR THE FUTURE";
const HEADLINE = "Technology education for every stage of life.";
const SUBLINE =
  "Six technology streams for ages 6 to adult — cybersecurity, game development, AI, app development, entrepreneurship and robotics. Cyber Heroes is live today; the rest land through 2026–27.";

export default function HeroOverlay({ progress }: HeroOverlayProps) {
  /* Headline reveals AFTER the keyboard has lit up - so the sequence
   * reads "lid opens -> screen boots -> keys glow -> headline appears".
   * Pushed back from 0.42 -> 0.55 to 0.68 -> 0.78 so each beat gets
   * its own moment instead of stacking in the middle. */
  const opacity = useTransform(progress, [0.68, 0.78], [0, 1]);
  const y = useTransform(progress, [0.68, 0.78], [22, 0]);
  const blur = useTransform(progress, [0.68, 0.78], [8, 0]);
  const filter = useTransform(blur, (v) => `blur(${v}px)`);
  const scrimOpacity = useTransform(progress, [0.66, 0.78], [0, 1]);

  /* The persistent ALGORITHMX wordmark previously rendered here was
   * removed: the global Nav (Nav.tsx) carries the brand from scroll 0,
   * and the duplicate created visual noise in the top-left corner. */

  return (
    <>
      <motion.div
        style={{
          opacity,
          y,
          filter,
          position: "absolute",
          inset: 0,
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding:
            "calc(var(--lv2-rail) * 1.2) var(--lv2-rail) " +
            "calc(var(--lv2-rail) * 1.6)",
          color: "var(--lv2-paper)",
          pointerEvents: "none",
        }}
      >
      {/* Radial scrim - stronger core (0.78 -> 0.88) so the headline
       *  reads with maximum contrast against the dark backdrop, plus a
       *  faster falloff on the right (60% -> 52%) so the laptop sits
       *  in completely clean dark space - no scrim penumbra at all. */}
      <motion.div
        aria-hidden
        style={{
          opacity: scrimOpacity,
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 46% 52% at 20% 52%, " +
            "rgba(4,5,13,0.92) 0%, rgba(4,5,13,0.5) 26%, " +
            "rgba(4,5,13,0) 50%)",
          pointerEvents: "none",
        }}
      />
      {/* Inner content div has pointerEvents: none so its empty right
       *  half (the 1180px-wide centred container extends well past the
       *  headline column) doesn't swallow pointer events destined for
       *  the 3D canvas underneath — that's where the interactive hero
       *  slabs live. Pointer events are re-enabled on the actual
       *  interactive elements: the CTA row below. */}
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "calc(var(--lv2-rail) * 0.4)",
          pointerEvents: "none",
          position: "relative",
        }}
      >
        <span
          style={{
            fontFamily: "var(--lv2-font-mono)",
            fontSize: "0.6875rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--lv2-cyan-soft)",
            textShadow: "0 0 12px rgba(0,229,255,0.45)",
          }}
        >
          {EYEBROW}
        </span>

        <h1
          style={{
            fontFamily: "var(--lv2-font-display)",
            /* Slightly reduced (6vw -> 5.4vw, cap 6rem -> 5.25rem) for
             * better balance against the laptop on wide viewports.
             * Still reads as the primary headline; just doesn't
             * dominate the frame the way 96px did. */
            fontSize: "clamp(2.25rem, 5.4vw, 5.25rem)",
            lineHeight: 0.97,
            letterSpacing: "-0.028em",
            fontWeight: 400,
            margin: 0,
            color: "var(--lv2-paper)",
            maxWidth: "13ch",
            textShadow:
              "0 1px 6px rgba(4,5,13,0.9), 0 4px 24px rgba(4,5,13,0.7)",
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
          }}
        >
          {HEADLINE}
        </h1>

        <p
          style={{
            fontFamily: "var(--lv2-font-display)",
            fontSize: "clamp(0.95rem, 1.2vw, 1.0625rem)",
            lineHeight: 1.55,
            color: "rgba(232, 237, 255, 0.92)",
            maxWidth: "42ch",
            margin: "calc(var(--lv2-rail) * 0.25) 0 0",
            textShadow:
              "0 1px 4px rgba(4,5,13,0.9), 0 2px 14px rgba(4,5,13,0.6)",
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
          }}
        >
          {SUBLINE}
        </p>

        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: "calc(var(--lv2-rail) * 0.6)",
            flexWrap: "wrap",
            pointerEvents: "auto",
          }}
        >
          <Link
            href="#subjects"
            data-plausible="landing-v2-hero-primary"
            className="lv2-hero-cta lv2-hero-cta-primary"
          >
            Explore courses
            <span aria-hidden style={{ marginLeft: 8 }}>→</span>
          </Link>
        </div>
      </div>
    </motion.div>

    {/* Scoped CSS for the hero CTAs — needed for :hover/:focus states,
     *  which inline style objects can't express. Both CTAs share a
     *  geometry; the secondary gets a refined glass treatment with
     *  cyan-accented border, inner highlight, and an ambient cyan
     *  glow that intensifies on hover so it reads as premium rather
     *  than ghosted. */}
    <style jsx global>{`
      .lv2-hero-cta {
        font-family: var(--lv2-font-mono);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        padding: 14px 22px;
        border-radius: 999px;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        transition:
          transform 0.22s cubic-bezier(0.16, 1, 0.3, 1),
          box-shadow 0.28s ease,
          border-color 0.22s ease,
          background 0.22s ease,
          color 0.22s ease;
        will-change: transform, box-shadow;
      }
      .lv2-hero-cta-primary {
        background: var(--lv2-cyan);
        color: var(--lv2-ink);
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.35),
          0 8px 28px rgba(0, 229, 255, 0.32);
      }
      .lv2-hero-cta-primary:hover,
      .lv2-hero-cta-primary:focus-visible {
        transform: translateY(-1px);
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.45),
          0 10px 36px rgba(0, 229, 255, 0.48);
      }
      .lv2-hero-cta-secondary {
        /* Glass tint MORE opaque (0.55 → 0.72) so the button never
         * gets swallowed by the hex floor pattern underneath. Border
         * cyan is held back to 0.30 and the ambient glow trimmed
         * (0.14 → 0.10) so the secondary doesn't compete with the
         * primary cyan CTA — it reads as a confident dark companion. */
        background: rgba(11, 16, 28, 0.72);
        color: var(--lv2-paper);
        border: 1px solid rgba(0, 229, 255, 0.3);
        backdrop-filter: blur(14px) saturate(1.35);
        -webkit-backdrop-filter: blur(14px) saturate(1.35);
        box-shadow:
          inset 0 1px 0 rgba(232, 237, 255, 0.08),
          inset 0 0 0 1px rgba(0, 229, 255, 0.05),
          0 8px 26px rgba(0, 229, 255, 0.1);
      }
      .lv2-hero-cta-secondary:hover,
      .lv2-hero-cta-secondary:focus-visible {
        transform: translateY(-1px);
        background: rgba(15, 22, 38, 0.82);
        border-color: rgba(0, 229, 255, 0.55);
        box-shadow:
          inset 0 1px 0 rgba(232, 237, 255, 0.14),
          inset 0 0 0 1px rgba(0, 229, 255, 0.16),
          0 12px 34px rgba(0, 229, 255, 0.22);
      }
      @media (prefers-reduced-motion: reduce) {
        .lv2-hero-cta {
          transition: none;
        }
        .lv2-hero-cta:hover,
        .lv2-hero-cta:focus-visible {
          transform: none;
        }
      }
    `}</style>
    </>
  );
}
