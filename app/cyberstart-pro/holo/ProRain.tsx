"use client";

import { useEffect, useRef } from "react";
import { reduced } from "@/app/components/home-holo/fx";

/* The live page's code rain (CodeRainBg), tuned for the platinum ground:
 * the same glyph set, column maths and ~18 fps cadence, but the trails fade
 * with destination-out so the canvas stays transparent over the light page,
 * and the glyphs are rust orange. Fixed behind the whole page, masked away
 * under the hero copy by the stylesheet. DPR capped at 1.5. Not drawn under
 * reduced motion; stopped by the Pause control (`motion` false). */

const GLYPHS = "0123456789abcdef{}[]()<>/;=+-*!&|$#";
const CELL = 15;

export default function ProRain({ motion }: { motion: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const motionRef = useRef(motion);
  const startRef = useRef<() => void>(() => {});
  useEffect(() => { motionRef.current = motion; if (motion) startRef.current(); }, [motion]);

  useEffect(() => {
    const cv = ref.current;
    if (!cv || reduced()) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    let cols: { y: number; s: number }[] = [], W = 0, H = 0, raf = 0, last = 0;
    const setup = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = window.innerWidth; H = window.innerHeight;
      cv.width = Math.floor(W * dpr); cv.height = Math.floor(H * dpr);
      cv.style.width = W + "px"; cv.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      cols = Array.from({ length: Math.ceil(W / CELL) }, () => ({ y: Math.random() * H / CELL, s: 0.22 + Math.random() * 0.4 }));
      ctx.font = `${CELL}px ui-monospace, "Cascadia Code", Consolas, monospace`;
    };
    const frame = (now: number) => {
      raf = 0;
      if (now - last < 55) { raf = requestAnimationFrame(frame); return; }
      last = now;
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(194,65,12,0.42)";
      for (let i = 0; i < cols.length; i++) {
        const c = cols[i];
        ctx.fillText(GLYPHS[(Math.random() * GLYPHS.length) | 0], i * CELL, c.y * CELL);
        c.y += c.s;
        if (c.y * CELL > H && Math.random() > 0.975) c.y = 0;
      }
      if (motionRef.current && !document.hidden) raf = requestAnimationFrame(frame);
    };
    const start = () => { if (!raf && motionRef.current && !document.hidden) raf = requestAnimationFrame(frame); };
    startRef.current = start;
    let rt = 0;
    const onResize = () => { window.clearTimeout(rt); rt = window.setTimeout(setup, 150); };
    document.addEventListener("visibilitychange", start);
    window.addEventListener("resize", onResize);
    setup(); start();
    return () => {
      startRef.current = () => {};
      if (raf) cancelAnimationFrame(raf);
      window.clearTimeout(rt);
      document.removeEventListener("visibilitychange", start);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas className="rain" ref={ref} aria-hidden="true" />;
}
