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
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  /* Shorten the cinematic rail on phones/small tablets. 280vh on a
   * 812-tall iPhone viewport is 2274px of scroll just for the hero -
   * brutal. 180vh (~1460px) keeps the 6 chapter beats but trims the
   * dead pad between them. */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 768px)");
    setIsCompact(mq.matches);
    const onChange = () => setIsCompact(mq.matches);
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

  /* Backdrop gradient that subtly hue-shifts with progress. Capped at
   * a lower max (was 1.0) so the violet/cyan radial glow stays quiet
   * - we want the laptop to dominate against a near-black void, not
   * sit inside a bright cosmic cloud. */
  const bgOpacity = useTransform(smoothScroll, [0, 0.4], [0.35, 0.6]);

  return (
    <section
      ref={railRef}
      style={{
        position: "relative",
        /* 280vh on desktop = 6 chapters with breathing room. 180vh on
         * phones/small tablets so the cinematic doesn't feel endless on
         * a tall portrait viewport. */
        height: isCompact ? "180vh" : "280vh",
        /* No background on the section itself — GlobalBackdrop (fixed,
         * z-index -1) carries the deep-ink colour and the ambient orb
         * + particle motion behind every section of the page. By
         * leaving this transparent the cinematic shares ONE continuous
         * environment with ChooseYourPath instead of stamping a slab
         * of ink that ended in a hard horizontal seam where the sticky
         * pin released. */
        background: "transparent",
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
        {/* Layer 0 - subtle radial wash that ADDS a touch of violet /
         *  cyan glow on top of GlobalBackdrop. The previous final stop
         *  was an opaque var(--lv2-ink) — that's what hid the page
         *  atmosphere behind a solid slab and produced the seam. Now
         *  the base is transparent so GlobalBackdrop's drifting orbs
         *  read THROUGH the hero, and the two radial gradients only
         *  paint where they intend to (no opaque fallback fill). */}
        <motion.div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            opacity: bgOpacity,
            background:
              "radial-gradient(ellipse at 50% 60%, rgba(124,92,255,0.10), transparent 55%), " +
              "radial-gradient(ellipse at 30% 30%, rgba(0,229,255,0.06), transparent 60%)",
          }}
        />

        {/* Layer 1 - the 3D scene */}
        <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
          <VaultScene progress={progress} reducedMotion={reducedMotion} />
        </div>

        {/* Layer 2 - softened edge vignette. Was a heavy edge-to-edge
         *  radial that crushed the bottom of the canvas to 60% ink
         *  exactly where the seam to the next section sat. Now lighter
         *  (0.6 -> 0.35 at edge, larger transparent core) so the
         *  vignette focuses without bruising. */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse at center, transparent 60%, rgba(4,5,13,0.35) 100%)",
          }}
        />

        {/* Layer 2a - TOP CRISP. Top stop pushed up to 0.94 ink so the
         *  area just under the nav is nearly fully dark — the navbar
         *  now reads as a crisp header strip with a hard shoulder of
         *  atmosphere below it, instead of the grey haze that was
         *  bleeding through before. */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "26vh",
            zIndex: 2,
            pointerEvents: "none",
            background:
              "linear-gradient(to bottom, " +
              "rgba(4,5,13,0.94) 0%, " +
              "rgba(4,5,13,0.6) 35%, " +
              "rgba(4,5,13,0.18) 75%, " +
              "rgba(4,5,13,0) 100%)",
          }}
        />

        {/* Layer 2c - PERSISTENT TEXT POCKET. A soft elliptical dark
         *  pool centred on the left text column that quietens the hex
         *  floor and atmosphere behind the headline. Runs from scroll
         *  0 (outside HeroOverlay's opacity gate, which only fades
         *  in at 0.68) so the pocket is established long before the
         *  headline arrives — the left third of the floor is already
         *  visually "the readable column" by the time text lands.
         *  Soft radial edges so it never reads as a rectangle. */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse 48% 70% at 22% 55%, " +
              "rgba(4,5,13,0.78) 0%, " +
              "rgba(4,5,13,0.5) 28%, " +
              "rgba(4,5,13,0.22) 50%, " +
              "rgba(4,5,13,0) 72%)",
          }}
        />

        {/* Layer 2b - DISSOLVE ZONE. The single most important layer
         *  for the cinematic feel: a tall gradient at the bottom of
         *  the sticky frame that fades the hero into atmosphere. The
         *  laptop floor at the lower-middle of the viewport gets a
         *  whisper of mist over it; the very bottom of the viewport
         *  reads as deep-ink fog. Crucially this also covers the
         *  exact pixel-row where the sticky pin will release into
         *  the next section, so the boundary becomes a soft mist
         *  shoulder rather than a horizontal cut. Sits above the
         *  vignette but below the brand UI (zIndex 3) so the headline
         *  and CTAs remain crisp. */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: "46vh",
            zIndex: 2,
            pointerEvents: "none",
            background:
              "linear-gradient(to bottom, " +
              "rgba(4,5,13,0) 0%, " +
              "rgba(4,5,13,0.18) 35%, " +
              "rgba(4,5,13,0.52) 72%, " +
              "rgba(4,5,13,0.78) 100%)",
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
 * the next chapter so the user sees the active chapter highlighted.
 *
 * Position: bottom-right corner of the viewport. The previous top-left
 * slot kept colliding with whatever HTML brand UI sat in the left
 * column — first the hero CTAs, then the eyebrow + headline. The
 * eyebrow and chapter labels share the same monospace ALL-CAPS // tag
 * style, so when they were stacked vertically the user read them as
 * one paragraph instead of two distinct UI elements.
 *
 * Bottom-right is also where premium cinematic experiences (Apple
 * product reveals, etc.) put chapter / progress indicators — film-cue
 * positioning, away from any HTML content. */
function ChapterRail({ progress }: { progress: MotionValue<number> }) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        bottom: "calc(var(--lv2-rail) * 1.0)",
        right: "var(--lv2-rail)",
        zIndex: 4,
        pointerEvents: "none",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        alignItems: "flex-end",
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
        right: 0,
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

/* Scroll hint - two phases:
 *
 *   Phase A (chapters 01-02, p 0..0.34)
 *     Full glassy capsule with pulsing cyan dot, mono caps "Scroll to
 *     continue" label, and a refined single chevron below. Reads as a
 *     deliberate system call-to-action.
 *
 *   Phase B (chapters 03-05, p 0.42..0.92)
 *     Minimal chevron-only indicator. Lives lower in the frame so it
 *     never competes with the headline or hero CTAs once they reveal.
 *     Reads as a subtle "still more below" system hint.
 *
 * Both phases share the same cyan accent + soft glow so they feel like
 * the same OS element at different scales. Crossfades between phases. */
function ScrollHint({
  scrollYProgress,
}: {
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const capsuleOpacity = useTransform(
    scrollYProgress,
    [0, 0.28, 0.38],
    [1, 1, 0],
  );
  const minimalOpacity = useTransform(
    scrollYProgress,
    [0.38, 0.5, 0.92, 1.0],
    [0, 1, 1, 0],
  );
  return (
    <>
      {/* PHASE A - glassy capsule */}
      <motion.div
        style={{
          opacity: capsuleOpacity,
          position: "absolute",
          bottom: "calc(var(--lv2-rail) * 1.2)",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          color: "var(--lv2-paper)",
          fontFamily: "var(--lv2-font-mono)",
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          pointerEvents: "none",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        }}
        aria-hidden
      >
        <motion.span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "9px 20px",
            borderRadius: 999,
            border: "1px solid rgba(0,229,255,0.28)",
            background: "rgba(4,5,13,0.58)",
            backdropFilter: "blur(14px) saturate(1.4)",
            WebkitBackdropFilter: "blur(14px) saturate(1.4)",
            boxShadow:
              "inset 0 1px 0 rgba(232,237,255,0.06), 0 8px 26px rgba(0,229,255,0.16)",
          }}
          animate={{
            boxShadow: [
              "inset 0 1px 0 rgba(232,237,255,0.06), 0 6px 22px rgba(0,229,255,0.10)",
              "inset 0 1px 0 rgba(232,237,255,0.06), 0 10px 32px rgba(0,229,255,0.28)",
              "inset 0 1px 0 rgba(232,237,255,0.06), 0 6px 22px rgba(0,229,255,0.10)",
            ],
          }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.span
            aria-hidden
            style={{
              width: 7,
              height: 7,
              borderRadius: 999,
              background: "var(--lv2-cyan)",
            }}
            animate={{
              boxShadow: [
                "0 0 8px rgba(0,229,255,0.55)",
                "0 0 16px rgba(0,229,255,0.95)",
                "0 0 8px rgba(0,229,255,0.55)",
              ],
            }}
            transition={{ duration: 2.0, repeat: Infinity, ease: "easeInOut" }}
          />
          Scroll to continue
        </motion.span>
        <motion.svg
          width="22"
          height="11"
          viewBox="0 0 22 11"
          fill="none"
          animate={{ y: [0, 4, 0], opacity: [0.55, 1, 0.55] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          style={{
            filter: "drop-shadow(0 0 6px rgba(0,229,255,0.45))",
          }}
        >
          <path
            d="M2 2L11 9L20 2"
            stroke="var(--lv2-cyan)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
      </motion.div>

      {/* PHASE B - minimal chevron + tiny SCROLL caption */}
      <motion.div
        style={{
          opacity: minimalOpacity,
          position: "absolute",
          bottom: "calc(var(--lv2-rail) * 0.85)",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          pointerEvents: "none",
        }}
        aria-hidden
      >
        <motion.svg
          width="18"
          height="9"
          viewBox="0 0 18 9"
          fill="none"
          animate={{ y: [0, 3, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.0, repeat: Infinity, ease: "easeInOut" }}
          style={{
            filter: "drop-shadow(0 0 4px rgba(0,229,255,0.5))",
          }}
        >
          <path
            d="M2 2L9 7L16 2"
            stroke="var(--lv2-cyan)"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
        <span
          style={{
            fontFamily: "var(--lv2-font-mono)",
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "rgba(232,237,255,0.4)",
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
          }}
        >
          Scroll
        </span>
      </motion.div>
    </>
  );
}
