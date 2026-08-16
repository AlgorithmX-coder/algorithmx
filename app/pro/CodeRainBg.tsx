"use client";

import { useEffect, useRef } from "react";

/* A subtle, ambient "code rain" behind the course hub. Canvas-based and
 * deliberately faint: slow fall, low opacity, brand-cyan glyphs, with a
 * vignette over the top so it never competes with the content. Disabled
 * entirely for prefers-reduced-motion. Fixed, so it parallaxes gently as
 * the page scrolls. */
export default function CodeRainBg() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const glyphs = "0123456789abcdef{}[]()<>/;=+-*!&|$#".split("");
    const fontSize = 15;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0, height = 0, cols = 0;
    let drops: number[] = [];
    let speeds: number[] = [];

    const setup = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `${fontSize}px ui-monospace, "Cascadia Code", Consolas, monospace`;
      cols = Math.ceil(width / fontSize);
      drops = Array.from({ length: cols }, () => Math.random() * (height / fontSize));
      speeds = Array.from({ length: cols }, () => 0.22 + Math.random() * 0.4);
    };
    setup();

    let raf = 0;
    let last = 0;
    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      if (t - last < 55) return; // ~18fps: calm, not busy
      last = t;
      // fade the previous frame a touch to leave soft trails
      ctx.fillStyle = "rgba(8, 7, 18, 0.13)";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "rgba(53, 214, 240, 0.22)";
      for (let i = 0; i < cols; i++) {
        const ch = glyphs[(Math.random() * glyphs.length) | 0];
        ctx.fillText(ch, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > height && Math.random() > 0.975) drops[i] = 0;
        drops[i] += speeds[i];
      }
    };
    raf = requestAnimationFrame(frame);

    const onResize = () => setup();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", background: "#08070f" }}>
      <canvas ref={ref} style={{ display: "block", opacity: 0.55 }} />
      {/* brand glows on top + a soft vignette so the rain stays behind the reading column */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(1200px 620px at 50% -10%, rgba(139,109,255,0.16), transparent 60%), radial-gradient(900px 520px at 92% 3%, rgba(53,214,240,0.09), transparent 55%), radial-gradient(1100px 900px at 50% 42%, rgba(8,7,18,0.62), transparent 72%)" }} />
    </div>
  );
}
