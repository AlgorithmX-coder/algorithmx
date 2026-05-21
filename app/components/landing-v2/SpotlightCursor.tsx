"use client";

import { useEffect, useRef } from "react";

/**
 * Soft spotlight that follows the cursor across the whole page.
 *
 * Uses mix-blend-mode: screen so the spotlight only adds brightness; it
 * has no visible effect on white/bright backgrounds. On the dark zones
 * (cinematic + footer) it creates a cyan flashlight effect that adds
 * tactile "I am here" feedback for the user. On the bright product
 * sections it stays invisible. Best of both.
 *
 * pointer-events: none so it never intercepts clicks. z-index: 9000 sits
 * below the nav (z-50) but above content.
 */
export default function SpotlightCursor() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    /* Start off-screen until first move */
    el.style.transform = "translate3d(-9999px, -9999px, 0)";

    let raf = 0;
    let targetX = -9999;
    let targetY = -9999;
    let curX = -9999;
    let curY = -9999;

    const tick = () => {
      /* Smooth follow */
      curX += (targetX - curX) * 0.22;
      curY += (targetY - curY) * 0.22;
      el.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX - 220;
      targetY = e.clientY - 220;
    };
    const onLeave = () => {
      targetX = -9999;
      targetY = -9999;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: 440,
        height: 440,
        pointerEvents: "none",
        zIndex: 9000,
        mixBlendMode: "screen",
        background:
          "radial-gradient(circle at center, rgba(0,229,255,0.22) 0%, rgba(124,92,255,0.12) 35%, transparent 70%)",
        willChange: "transform",
      }}
    />
  );
}
