"use client";

import { useEffect, useRef } from "react";

/**
 * AuthCodeRain — a faint, slow stream of blue "code" falling behind the portal
 * chamber. A cheap 2D canvas (no WebGL), kept deliberately subtle: low opacity,
 * blue (not Matrix green), ~18fps. AuthBackdrop masks it out over the portal so
 * it only fills the dark space. Decorative; freezes under reduced-motion.
 */

const GLYPHS = "01</>{}();=+*01XA01[]:01".split("");
const FONT = 16;

export default function AuthCodeRain({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Non-null at capture: the effect runs after mount (canvas is rendered) and
    // a 2D context is always available. Asserting here lets the nested rAF/resize
    // closures use them without TS re-widening to null.
    const cv = ref.current!;
    const cx = cv.getContext("2d")!;
    if (!cx) return;

    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    let w = 0;
    let h = 0;
    let cols = 0;
    let drops: number[] = [];
    let speeds: number[] = [];

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      cv.width = Math.floor(w * dpr);
      cv.height = Math.floor(h * dpr);
      cv.style.width = w + "px";
      cv.style.height = h + "px";
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx.font = `${FONT}px ui-monospace, "JetBrains Mono", monospace`;
      cx.textBaseline = "top";
      cols = Math.ceil(w / FONT);
      drops = Array.from({ length: cols }, () => Math.random() * (h / FONT));
      speeds = Array.from({ length: cols }, () => 0.25 + Math.random() * 0.5);
    }

    const TRAIL = 16;
    function frame(time: number) {
      cx.clearRect(0, 0, w, h);
      for (let i = 0; i < cols; i++) {
        const x = i * FONT;
        const head = drops[i];
        for (let k = 0; k < TRAIL; k++) {
          const row = Math.floor(head) - k;
          if (row < 0) continue;
          const y = row * FONT;
          if (y > h) continue;
          const a = 1 - k / TRAIL;
          const g = GLYPHS[(row * 7 + i * 13 + (k === 0 ? Math.floor(time / 140) : 0)) % GLYPHS.length];
          cx.fillStyle = k === 0 ? `rgba(190,238,255,${0.85 * a})` : `rgba(70,165,235,${0.5 * a})`;
          cx.fillText(g, x, y);
        }
        drops[i] += speeds[i];
        if (drops[i] * FONT > h + TRAIL * FONT) drops[i] = -Math.random() * 24;
      }
    }

    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    if (reducedMotion) {
      frame(0); // single static field
    } else {
      let last = 0;
      const loop = (t: number) => {
        raf = requestAnimationFrame(loop);
        if (t - last < 55) return; // ~18fps — rain reads better slow + cheaper
        last = t;
        frame(t);
      };
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [reducedMotion]);

  return <canvas ref={ref} aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}
