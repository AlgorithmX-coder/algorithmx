"use client";

/**
 * DEV-ONLY frame-capture harness for the hero cinematic.
 *
 * Renders LaptopScene in `capture` mode (full quality, always-on loop,
 * preserveDrawingBuffer) with a progress MotionValue we can drive from
 * outside via `window.__setProgress(p)`. The capture script (scripts/
 * _herocapture.mjs) steps progress 0→1, reads the canvas with toDataURL
 * at each step, and writes the frames to public/hero-seq/. Those frames
 * are then scrubbed by scroll on integrated GPUs (HeroScrubSequence) so
 * the opening plays back smoothly without the live WebGL cost.
 *
 * Not linked anywhere and excluded from the site password gate (/dev/*).
 */

import { useEffect } from "react";
import { useMotionValue } from "framer-motion";
import dynamic from "next/dynamic";

const LaptopScene = dynamic(
  () => import("@/app/components/landing-v2/LaptopScene"),
  { ssr: false },
);

export default function HeroCapturePage() {
  const progress = useMotionValue(0);
  useEffect(() => {
    const w = window as unknown as {
      __setProgress?: (p: number) => void;
      __capReady?: boolean;
    };
    w.__setProgress = (p: number) => progress.set(Math.max(0, Math.min(1, p)));
    w.__capReady = true;
    return () => {
      delete w.__setProgress;
      delete w.__capReady;
    };
  }, [progress]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        /* Transparent so canvas.toDataURL captures the laptop with an
         * alpha background — the frames layer over the live GlobalBackdrop
         * on playback exactly like the live canvas does. */
        background: "transparent",
      }}
    >
      <LaptopScene progress={progress} reducedMotion={false} capture />
    </div>
  );
}
