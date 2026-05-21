"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * StickyFeatures (Act 3). Sticky-scroll section that pins a two-column
 * layout while the user scrolls. Left column: three feature lines whose
 * colour fills from muted-grey to solid-paper as their slot in the
 * scroll timeline approaches. Right column: a quiet static visual.
 *
 * Time-budget defence (per build trade-off): the right column does NOT
 * swap visuals between lines. Instead it is a single calm cyan-ringed
 * panel that holds throughout. Per the brief, we shipped narrower-but-
 * working over broader-but-half-done.
 */

const FEATURES: { kicker: string; text: string }[] = [
  {
    kicker: "Phase 01",
    text: "Every lesson is a playable mission, not a slideshow.",
  },
  {
    kicker: "Phase 02",
    text: "Boss battles, password labs, phishing inspectors. Real reps.",
  },
  {
    kicker: "Phase 03",
    text: "Parent dashboard tracks progress, badges, and skill growth.",
  },
];

export default function StickyFeatures() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  return (
    <section
      ref={ref}
      style={{
        position: "relative",
        background: "var(--lv2-paper, #e8edff)",
        color: "var(--lv2-ink, #04050d)",
        // Tall enough for the sticky pin + scroll-through.
        minHeight: "180vh",
        padding:
          "calc(var(--lv2-rail) * 2.5) var(--lv2-rail) " +
          "calc(var(--lv2-rail) * 2.5)",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: "calc(var(--lv2-rail) * 1.5)",
          display: "grid",
          gridTemplateColumns: "1.05fr 1fr",
          gap: "calc(var(--lv2-rail) * 1.5)",
          alignItems: "center",
          maxWidth: 1320,
          margin: "0 auto",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <span
            style={{
              fontFamily: "var(--lv2-font-mono)",
              fontSize: 11,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(4,5,13,0.55)",
            }}
          >
            02 / How it works
          </span>
          <h2
            style={{
              fontFamily: "var(--lv2-font-display)",
              fontSize: "clamp(2rem, 4.5vw, 4.375rem)",
              lineHeight: 1.0,
              letterSpacing: "-0.03em",
              fontWeight: 400,
              margin: 0,
              maxWidth: "16ch",
            }}
          >
            A real curriculum, taught the way kids actually want to learn.
          </h2>

          <ul
            style={{
              listStyle: "none",
              margin: "calc(var(--lv2-rail) * 0.5) 0 0",
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: "calc(var(--lv2-rail) * 0.55)",
            }}
          >
            {FEATURES.map((feature, i) => (
              <FeatureLine
                key={i}
                index={i}
                kicker={feature.kicker}
                text={feature.text}
                scrollYProgress={scrollYProgress}
              />
            ))}
          </ul>
        </div>

        <Panel />
      </div>
    </section>
  );
}

/* Each feature reads the section scroll progress and lights up across
 * its own slice. Three features evenly split across the centre portion
 * of the section (0.15 - 0.75 of the section's scroll). */
function FeatureLine({
  index,
  kicker,
  text,
  scrollYProgress,
}: {
  index: number;
  kicker: string;
  text: string;
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const span = 0.6 / FEATURES.length; // 0.2 per feature
  const start = 0.15 + index * span;
  const end = start + span;

  const colour = useTransform(
    scrollYProgress,
    [start, end],
    ["#a2a6b4", "#04050d"],
  );
  const opacityKicker = useTransform(
    scrollYProgress,
    [start - 0.04, start],
    [0.4, 1],
  );

  return (
    <li
      style={{
        borderTop: "1px solid rgba(4,5,13,0.12)",
        paddingTop: "calc(var(--lv2-rail) * 0.4)",
      }}
    >
      <motion.span
        style={{
          display: "block",
          fontFamily: "var(--lv2-font-mono)",
          fontSize: 11,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "rgba(4,5,13,0.65)",
          opacity: opacityKicker,
          marginBottom: 8,
        }}
      >
        {kicker}
      </motion.span>
      <motion.span
        style={{
          color: colour,
          fontFamily: "var(--lv2-font-display)",
          fontSize: "clamp(1.4rem, 2.4vw, 2.25rem)",
          lineHeight: 1.15,
          letterSpacing: "-0.02em",
          fontWeight: 400,
          display: "block",
        }}
      >
        {text}
      </motion.span>
    </li>
  );
}

/* Right column visual. Quiet cyan-ringed panel with a faint hex motif.
 * Could be swapped for a screen-grab of the lesson UI later. */
function Panel() {
  return (
    <div
      style={{
        position: "relative",
        aspectRatio: "1 / 1",
        borderRadius: 22,
        overflow: "hidden",
        background:
          "linear-gradient(135deg, #04050d 0%, #1a1244 55%, #04050d 100%)",
        border: "1px solid rgba(0,229,255,0.32)",
        boxShadow:
          "0 24px 60px -16px rgba(124,92,255,0.45), inset 0 0 0 1px rgba(0,229,255,0.08)",
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 400 400"
        preserveAspectRatio="xMidYMid meet"
        style={{ position: "absolute", inset: 0 }}
        aria-hidden
      >
        <defs>
          <radialGradient id="lv2-panel-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.65" />
            <stop offset="60%" stopColor="#7c5cff" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#04050d" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="200" cy="200" r="180" fill="url(#lv2-panel-glow)" />
        {/* Hex outline */}
        <polygon
          points="200,80 297,135 297,245 200,300 103,245 103,135"
          fill="none"
          stroke="#7df0ff"
          strokeWidth="1.5"
          opacity="0.7"
        />
        {/* Inner hex */}
        <polygon
          points="200,130 252,160 252,220 200,250 148,220 148,160"
          fill="none"
          stroke="#7c5cff"
          strokeWidth="1.2"
          opacity="0.55"
        />
        {/* Centre glyph - placeholder AX */}
        <text
          x="50%"
          y="58%"
          textAnchor="middle"
          fontFamily="var(--lv2-font-mono), monospace"
          fontSize="34"
          fontWeight="600"
          letterSpacing="6"
          fill="#00e5ff"
        >
          AX
        </text>
      </svg>
    </div>
  );
}
