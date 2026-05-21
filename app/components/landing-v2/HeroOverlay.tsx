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

const EYEBROW = "// REINVENTING TECHNOLOGY EDUCATION";
const HEADLINE = "Technology education for every stage of life.";
const SUBLINE =
  "Game-first lessons that make real cybersecurity, coding, AI, and product thinking land for ages 6 to adult. Cyber Heroes Academy is the first course, available today.";

export default function HeroOverlay({ progress }: HeroOverlayProps) {
  /* Visibility timing — pulled forward so the headline reveals DURING
   * the motion phase (when light streaks are flying past the chip), not
   * just at the rest beat. Modelled on terminal-industries.com's pattern:
   * "subject moves through space, headline fades in" rather than "subject
   * sits still, headline appears after".
   *
   * 0.08 → opacity starts climbing
   * 0.28 → fully visible
   * Holds through to the AX glyph reveal. */
  const opacity = useTransform(progress, [0.08, 0.28], [0, 1]);
  const y = useTransform(progress, [0.08, 0.28], [22, 0]);
  const blur = useTransform(progress, [0.08, 0.28], [8, 0]);
  const filter = useTransform(blur, (v) => `blur(${v}px)`);
  const scrimOpacity = useTransform(progress, [0.05, 0.28], [0, 1]);

  /* The brand wordmark is always present at scroll 0; it fades out once
   * the headline takes over (no longer needed because the brand is in
   * the eyebrow). */
  const wordmarkOpacity = useTransform(progress, [0, 0.08, 0.28], [1, 1, 0]);

  return (
    <>
      {/* Persistent ALGORITHMX wordmark - visible from scroll 0 so the
       *  brand is on screen even before the headline fades in. Sits
       *  in the top-left of the viewport. */}
      <motion.div
        style={{
          opacity: wordmarkOpacity,
          position: "absolute",
          top: "calc(var(--lv2-rail) * 0.85)",
          left: "var(--lv2-rail)",
          zIndex: 4,
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: "var(--lv2-paper)",
        }}
      >
        <span
          aria-hidden
          style={{
            width: 10,
            height: 10,
            borderRadius: 2,
            background: "var(--lv2-cyan)",
            boxShadow: "0 0 14px rgba(0,229,255,0.65)",
          }}
        />
        <span
          style={{
            fontFamily: "var(--lv2-font-mono)",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            textShadow: "0 2px 18px rgba(4,5,13,0.95)",
          }}
        >
          ALGORITHMX
        </span>
      </motion.div>

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
      {/* Radial scrim - keeps the headline legible against the
       *  cosmic-violet bloom without darkening the whole scene. */}
      <motion.div
        aria-hidden
        style={{
          opacity: scrimOpacity,
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 70% 55% at 32% 50%, " +
            "rgba(4,5,13,0.7) 0%, rgba(4,5,13,0.45) 40%, " +
            "rgba(4,5,13,0) 75%)",
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
            maxWidth: "18ch",
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
            maxWidth: "54ch",
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
            href="/cyberheroes"
            data-plausible="landing-v2-hero-primary"
            style={ctaPrimary}
          >
            Explore Cyber Heroes
            <span aria-hidden style={{ marginLeft: 8 }}>→</span>
          </Link>
          <Link
            href="/signup"
            data-plausible="landing-v2-hero-secondary"
            style={ctaSecondary}
          >
            Get Started
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
