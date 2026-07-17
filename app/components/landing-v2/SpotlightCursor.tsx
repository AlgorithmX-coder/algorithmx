"use client";

import { useEffect, useRef } from "react";

/**
 * Cursor-reactive AlgorithmX OS light - a two-layer cyan/violet spotlight
 * that tracks the cursor across the whole page.
 *
 * Two layers stacked:
 *   1. Outer halo (560px, very soft cyan-to-violet falloff)
 *   2. Inner lens (180px, brighter cyan core)
 *
 * Both use mix-blend-mode: screen so they ONLY brighten what's beneath -
 * invisible on light backgrounds, vibrant on the dark sci-fi sections.
 * Inner lens is a touch faster to follow than the outer halo (lerp 0.32
 * vs 0.22) so it feels like the bright spot snaps to the cursor while
 * the soft halo trails behind. Gives the eye a sense of weight + speed.
 *
 * pointer-events: none on both. z-index between nav (50) and modal
 * level, but below the nav itself (so the nav doesn't get distorted).
 *
 * Disabled on touch-only devices (pointer:coarse) where a fixed
 * "flashlight" doesn't make sense.
 */
export default function SpotlightCursor() {
  const haloRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    /* Skip on touch-only devices - there's no persistent cursor */
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (!hasFinePointer) return;

    const halo = haloRef.current;
    const lens = lensRef.current;
    if (!halo || !lens) return;

    halo.style.transform = "translate3d(-9999px, -9999px, 0)";
    lens.style.transform = "translate3d(-9999px, -9999px, 0)";
    halo.style.opacity = "0";
    lens.style.opacity = "0";

    let raf = 0;
    let running = false;
    let targetX = -9999;
    let targetY = -9999;
    let haloX = -9999;
    let haloY = -9999;
    let lensX = -9999;
    let lensY = -9999;
    let visible = false;
    let targetOpacity = 0;
    let curOpacity = 0;

    const HALO_SIZE = 560;
    const LENS_SIZE = 180;

    const tick = () => {
      /* Different follow speeds give the cursor light a sense of mass:
       * the lens snaps, the halo trails. */
      haloX += (targetX - haloX) * 0.22;
      haloY += (targetY - haloY) * 0.22;
      lensX += (targetX - lensX) * 0.34;
      lensY += (targetY - lensY) * 0.34;
      curOpacity += (targetOpacity - curOpacity) * 0.18;
      halo.style.transform = `translate3d(${haloX - HALO_SIZE / 2}px, ${haloY - HALO_SIZE / 2}px, 0)`;
      lens.style.transform = `translate3d(${lensX - LENS_SIZE / 2}px, ${lensY - LENS_SIZE / 2}px, 0)`;
      halo.style.opacity = String(curOpacity);
      lens.style.opacity = String(curOpacity);
      /* IDLE-OUT (2026-07-17 perf pass): this loop used to run at 60fps
       * from mount, forever — even before any pointer movement and long
       * after the halo settled under a stationary cursor. Stop once
       * position and opacity have converged; onMove restarts it. */
      const settled =
        Math.abs(targetX - haloX) < 0.1 &&
        Math.abs(targetY - haloY) < 0.1 &&
        Math.abs(targetX - lensX) < 0.1 &&
        Math.abs(targetOpacity - curOpacity) < 0.002;
      if (settled) {
        curOpacity = targetOpacity;
        halo.style.opacity = String(curOpacity);
        lens.style.opacity = String(curOpacity);
        running = false;
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!visible) {
        /* First move: snap rather than slide from off-screen */
        haloX = targetX;
        haloY = targetY;
        lensX = targetX;
        lensY = targetY;
        visible = true;
      }
      targetOpacity = 1;
      wake();
    };
    const onLeave = () => {
      targetOpacity = 0;
      wake();
    };
    const onEnter = () => {
      targetOpacity = 1;
      wake();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
    };
  }, []);

  return (
    <>
      {/* Outer halo - soft cyan-to-violet falloff that trails the cursor */}
      <div
        ref={haloRef}
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 560,
          height: 560,
          pointerEvents: "none",
          zIndex: 25,
          mixBlendMode: "screen",
          background:
            "radial-gradient(circle at center, rgba(0,229,255,0.30) 0%, rgba(124,92,255,0.18) 30%, rgba(124,92,255,0.06) 55%, transparent 75%)",
          willChange: "transform, opacity",
          opacity: 0,
        }}
      />
      {/* Inner lens - tighter brighter cyan core that snaps to the cursor */}
      <div
        ref={lensRef}
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 180,
          height: 180,
          pointerEvents: "none",
          zIndex: 26,
          mixBlendMode: "screen",
          background:
            "radial-gradient(circle at center, rgba(0,245,255,0.45) 0%, rgba(0,229,255,0.18) 35%, transparent 70%)",
          willChange: "transform, opacity",
          opacity: 0,
        }}
      />
    </>
  );
}
