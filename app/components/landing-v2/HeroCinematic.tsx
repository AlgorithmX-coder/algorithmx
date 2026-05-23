"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring, type MotionValue } from "framer-motion";
import dynamic from "next/dynamic";
import HeroOverlay from "./HeroOverlay";

/**
 * HeroCinematic. The scroll-pinned wrapper for the AlgorithmX OS
 * cinematic: 6 scroll-locked chapters narrating the platform from
 * "system dormant" through "start your journey".
 *
 *   Chapter 01 (0.00-0.15)  System dormant       - closed laptop, brand only
 *   Chapter 02 (0.15-0.32)  Platform activating  - lid lifting, boot text begins
 *   Chapter 03 (0.32-0.50)  Curriculum loading   - lid open, screen ignites, headline reveals
 *   Chapter 04 (0.50-0.68)  Choose your stream   - dashboard shows the 6 streams
 *   Chapter 05 (0.68-0.85)  Build real projects  - project progression
 *   Chapter 06 (0.85-1.00)  Start your journey   - READY state, CTA emphasis
 *
 * Reduce-motion: progress is force-set to 1 on mount, so the scene
 * renders the final frame and the overlay is fully visible. The
 * sticky pin still works; the user just doesn't see the choreography.
 */

export const CHAPTERS: ReadonlyArray<{ id: string; title: string; range: [number, number] }> = [
  { id: "01", title: "System dormant", range: [0.0, 0.15] },
  { id: "02", title: "Platform activating", range: [0.15, 0.32] },
  { id: "03", title: "Curriculum loading", range: [0.32, 0.5] },
  { id: "04", title: "Choose your stream", range: [0.5, 0.68] },
  { id: "05", title: "Build real projects", range: [0.68, 0.85] },
  { id: "06", title: "Start your journey", range: [0.85, 1.0] },
];

const VaultScene = dynamic(() => import("./LaptopScene"), { ssr: false });

export default function HeroCinematic() {
  const railRef = useRef<HTMLElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const { scrollYProgress } = useScroll({
    target: railRef,
    offset: ["start start", "end end"],
  });

  /* Spring-damp the scroll progress so every scroll-tied animation
   * (camera path, lid lift, die ignite, glyph assemble) advances
   * smoothly rather than stepping with the wheel. Tuned for "follows
   * scroll quickly enough to feel responsive, smooth enough to never
   * jitter".
   *
   * - stiffness 90 / damping 28 / mass 0.4 -> ~150ms settling at
   *   typical scroll velocities, no visible lag, no overshoot. */
  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 28,
    mass: 0.4,
  });

  /* If reduced motion is on, clamp progress to 1 so VaultScene renders
   * the final state and HeroOverlay is fully visible from frame 0. */
  const progress = useTransform(smoothScroll, (v) =>
    reducedMotion ? 1 : v,
  );

  /* Backdrop gradient that subtly hue-shifts with progress. */
  const bgOpacity = useTransform(smoothScroll, [0, 0.4], [0.65, 1]);

  return (
    <section
      ref={railRef}
      style={{
        position: "relative",
        /* 280vh = 6 scroll-locked chapters with breathing room. Each
         * chapter gets ~30vh of scroll budget after rest pads. Long
         * enough to be guided, short enough not to drag. */
        height: "280vh",
        background: "var(--lv2-ink, #04050d)",
      }}
    >
      {/* Sticky pin that holds the cinematic in the viewport. */}
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          width: "100%",
          overflow: "hidden",
        }}
      >
        {/* Layer 0 - radial backdrop. Quiet on its own; the canvas
         *  paints over the top of it. */}
        <motion.div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            opacity: bgOpacity,
            background:
              "radial-gradient(ellipse at 50% 60%, rgba(124,92,255,0.22), transparent 55%), " +
              "radial-gradient(ellipse at 30% 30%, rgba(0,229,255,0.16), transparent 60%), " +
              "var(--lv2-ink, #04050d)",
          }}
        />

        {/* Layer 1 - the 3D scene */}
        <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
          <VaultScene progress={progress} reducedMotion={reducedMotion} />
        </div>

        {/* Layer 2 - vignette to keep edges dark */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse at center, transparent 55%, rgba(4,5,13,0.6) 100%)",
          }}
        />

        {/* Layer 3 - static brand UI (headline reveals at Chapter 03) */}
        <HeroOverlay progress={progress} />

        {/* Layer 4 - chapter label - small corner cue that crossfades
         *  between the 6 chapter titles as scroll advances. Acts like a
         *  film "Chapter 01 / 06 ---  SYSTEM DORMANT" subtitle. */}
        <ChapterRail progress={progress} />

        {/* Layer 5 - scroll prompt, visible during the cinematic.
         *  Driven by the smoothed scroll value so the fade-out tracks
         *  the rest of the cinematic. */}
        <ScrollHint scrollYProgress={smoothScroll} />
      </div>
    </section>
  );
}

/* Chapter label rail - one motion.div per chapter, all stacked in the
 * same screen position; each fades in over its scroll range and out at
 * the next chapter so the user sees the active chapter highlighted. */
function ChapterRail({ progress }: { progress: MotionValue<number> }) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        bottom: "calc(var(--lv2-rail) * 2.4)",
        left: "var(--lv2-rail)",
        zIndex: 4,
        pointerEvents: "none",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      {CHAPTERS.map((ch, i) => (
        <ChapterLabel
          key={ch.id}
          progress={progress}
          idx={i}
          chapter={ch}
          total={CHAPTERS.length}
        />
      ))}
    </div>
  );
}

function ChapterLabel({
  progress,
  chapter,
  idx,
  total,
}: {
  progress: MotionValue<number>;
  chapter: (typeof CHAPTERS)[number];
  idx: number;
  total: number;
}) {
  const [lo, hi] = chapter.range;
  /* Visible across this chapter's range, with a small lead-in and
   * lead-out so adjacent chapters crossfade. */
  const fadeLead = 0.04;
  const opacity = useTransform(
    progress,
    [lo - fadeLead, lo + 0.01, hi - 0.02, hi + fadeLead],
    [0, 1, 1, 0],
  );
  const y = useTransform(
    progress,
    [lo - fadeLead, lo + 0.01, hi - 0.02, hi + fadeLead],
    [10, 0, 0, -10],
  );
  return (
    <motion.div
      style={{
        opacity,
        y,
        position: "absolute",
        bottom: 0,
        left: 0,
        display: "flex",
        alignItems: "center",
        gap: 14,
        color: "var(--lv2-paper)",
        fontFamily: "var(--lv2-font-mono)",
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.32em",
        textTransform: "uppercase",
        textShadow: "0 2px 18px rgba(4,5,13,0.95)",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          color: "rgba(232,237,255,0.45)",
        }}
      >
        {String(idx + 1).padStart(2, "0")}
        <span style={{ opacity: 0.45, margin: "0 6px" }}>/</span>
        {String(total).padStart(2, "0")}
      </span>
      <span
        aria-hidden
        style={{
          display: "inline-block",
          width: 22,
          height: 1,
          background: "var(--lv2-cyan)",
          boxShadow: "0 0 8px rgba(0,229,255,0.65)",
        }}
      />
      <span style={{ color: "var(--lv2-paper)" }}>{chapter.title}</span>
    </motion.div>
  );
}

function ScrollHint({
  scrollYProgress,
}: {
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  /* Visible immediately at frame 0 (no dead-zone fade-in), fades out
   * around mid-scroll once the cinematic is in motion. */
  const opacity = useTransform(scrollYProgress, [0, 0.4, 0.55], [1, 1, 0]);
  return (
    <motion.div
      style={{
        opacity,
        position: "absolute",
        bottom: "calc(var(--lv2-rail) * 1.1)",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
        color: "var(--lv2-paper)",
        fontFamily: "var(--lv2-font-mono)",
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: "0.32em",
        textTransform: "uppercase",
        pointerEvents: "none",
        textShadow: "0 2px 18px rgba(4,5,13,0.95)",
      }}
      aria-hidden
    >
      <motion.span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 18px",
          borderRadius: 999,
          border: "1px solid rgba(0,229,255,0.45)",
          background: "rgba(4,5,13,0.55)",
          backdropFilter: "blur(6px)",
        }}
        animate={{ opacity: [0.65, 1, 0.65] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <span
          aria-hidden
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            background: "var(--lv2-cyan)",
            boxShadow: "0 0 12px rgba(0,229,255,0.85)",
          }}
        />
        Scroll to continue
      </motion.span>
      <motion.div
        animate={{ y: [0, 8, 0], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}
      >
        <Chevron />
        <Chevron muted />
      </motion.div>
    </motion.div>
  );
}

function Chevron({ muted = false }: { muted?: boolean }) {
  return (
    <svg
      width="22"
      height="10"
      viewBox="0 0 22 10"
      fill="none"
      aria-hidden
      style={{ opacity: muted ? 0.35 : 1 }}
    >
      <path
        d="M2 2L11 8L20 2"
        stroke="var(--lv2-cyan)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
