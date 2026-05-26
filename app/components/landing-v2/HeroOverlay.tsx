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
      {/* Radial scrim - PULLED LEFT (32% -> 20%) and SHRUNK (70%/55% ->
       *  50%/45%) so it darkens only the headline area instead of
       *  bleeding across the laptop's left edge. Falls off faster on
       *  the right (75% -> 60%) so the chassis sits in clean dark
       *  space, not in the scrim's penumbra. */}
      <motion.div
        aria-hidden
        style={{
          opacity: scrimOpacity,
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 50% 45% at 20% 55%, " +
            "rgba(4,5,13,0.78) 0%, rgba(4,5,13,0.4) 32%, " +
            "rgba(4,5,13,0) 60%)",
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
            fontSize: "clamp(2.5rem, 6.2vw, 6rem)",
            lineHeight: 0.95,
            letterSpacing: "-0.03em",
            fontWeight: 400,
            margin: 0,
            color: "var(--lv2-paper)",
            /* 18ch -> 13ch: stops headline overlapping the laptop on
             *  ~1440-1920px viewports. Visual hierarchy: headline on the
             *  left, laptop on the right, clean negative space between. */
            maxWidth: "13ch",
            textShadow:
              "0 2px 12px rgba(4,5,13,0.9), 0 8px 36px rgba(4,5,13,0.7)",
          }}
        >
          {HEADLINE}
        </h1>

        <p
          style={{
            fontFamily: "var(--lv2-font-display)",
            fontSize: "clamp(0.95rem, 1.2vw, 1.0625rem)",
            lineHeight: 1.55,
            color: "rgba(232, 237, 255, 0.88)",
            /* 54ch -> 42ch: keeps the body copy inside the headline's
             *  column so the right edge stays clear of the laptop. */
            maxWidth: "42ch",
            margin: "calc(var(--lv2-rail) * 0.25) 0 0",
            textShadow:
              "0 1px 8px rgba(4,5,13,0.9), 0 4px 20px rgba(4,5,13,0.6)",
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
  fontWeight: 600,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  padding: "14px 22px",
  borderRadius: 999,
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  boxShadow: "0 8px 28px rgba(0,229,255,0.32)",
};

const ctaSecondary: React.CSSProperties = {
  background: "rgba(232,237,255,0.06)",
  color: "var(--lv2-paper)",
  border: "1px solid rgba(232,237,255,0.22)",
  fontFamily: "var(--lv2-font-mono)",
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  padding: "14px 22px",
  borderRadius: 999,
  textDecoration: "none",
  backdropFilter: "blur(8px)",
};
