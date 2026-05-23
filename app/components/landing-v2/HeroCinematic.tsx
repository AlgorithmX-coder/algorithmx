"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import dynamic from "next/dynamic";
import HeroOverlay from "./HeroOverlay";

/**
 * HeroCinematic. The scroll-pinned wrapper that hosts the 3D VaultScene
 * canvas and the static HeroOverlay UI. Acts 1 + 2 of the landing.
 *
 * Anatomy:
 *
 *   <section>                       // tall outer rail (~250vh)
 *     <div style="sticky; top:0">   // pins to viewport
 *       <VaultScene progress={p} />   // R3F canvas, fills the pin
 *       <HeroOverlay progress={p} /> // static UI, fades in late
 *       <ScrollHint />              // "scroll" indicator on Act 1
 *     </div>
 *   </section>
 *
 * Scroll progress is captured via useScroll({ target, offset:
 * ["start start", "end end"] }) so `progress` advances 0→1 as the
 * user scrolls the height of the outer rail. Both children read this
 * single MotionValue.
 *
 * Reduce-motion: progress is force-set to 1 on mount, so the scene
 * renders the final frame and the overlay is fully visible. The
 * sticky pin still works; the user just doesn't see the choreography.
 */

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
        // 250vh = roughly 2.5 viewport heights of scroll for the
        // full cinematic + hero rest pad. Tuned by feel; cut to
        // 200vh later if it drags.
        height: "150vh",
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

        {/* Layer 3 - static brand UI */}
        <HeroOverlay progress={progress} />

        {/* Layer 4 - scroll prompt, visible during the cinematic.
         *  Driven by the smoothed scroll value so the fade-out tracks
         *  the rest of the cinematic. */}
        <ScrollHint scrollYProgress={smoothScroll} />
      </div>
    </section>
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
