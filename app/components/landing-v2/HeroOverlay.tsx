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

const EYEBROW = "// SIX FIELDS  ·  AGES 6 TO ADULT";
const HEADLINE = "Technology education for every stage of life.";
const SUBLINE =
  "Six fields of technology — cybersecurity, coding, AI, apps, entrepreneurship, robotics — for ages 6 to adult. Cyber Heroes Academy, our first course, is live today.";

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
            "radial-gradient(ellipse 48% 50% at 20% 52%, " +
            "rgba(4,5,13,0.88) 0%, rgba(4,5,13,0.45) 28%, " +
            "rgba(4,5,13,0) 52%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "calc(var(--lv2-rail) * 0.4)",
          pointerEvents: "auto",
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
          }}
        >
          <Link
            href="#subjects"
            data-plausible="landing-v2-hero-primary"
            style={ctaPrimary}
          >
            Explore courses
            <span aria-hidden style={{ marginLeft: 8 }}>→</span>
          </Link>
          <Link
            href="/cyberheroes"
            data-plausible="landing-v2-hero-secondary"
            style={ctaSecondary}
          >
            Start with Cyber Heroes
          </Link>
        </div>
      </div>
    </motion.div>
    </>
  );
}

const ctaPrimary: React.CSSProperties = {
  background: "var(--lv2-cyan)",
  color: "var(--lv2-ink)",
  fontFamily: "var(--lv2-font-mono)",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  padding: "14px 22px",
  borderRadius: 999,
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  boxShadow: "0 8px 28px rgba(0,229,255,0.32)",
  WebkitFontSmoothing: "antialiased",
  MozOsxFontSmoothing: "grayscale",
};

const ctaSecondary: React.CSSProperties = {
  background: "rgba(232,237,255,0.06)",
  color: "var(--lv2-paper)",
  border: "1px solid rgba(232,237,255,0.22)",
  fontFamily: "var(--lv2-font-mono)",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  padding: "14px 22px",
  borderRadius: 999,
  textDecoration: "none",
  backdropFilter: "blur(8px)",
  WebkitFontSmoothing: "antialiased",
  MozOsxFontSmoothing: "grayscale",
};
