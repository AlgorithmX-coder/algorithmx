"use client";

/**
 * Full-screen matrix digital rain (canvas). One canvas for the whole page.
 * Multi-colour neon columns (not just green) at a calm, slow fall speed.
 * Honors reduced-motion by painting a single static field.
 */

import { useEffect, useRef } from "react";

const CHARS =
  "01ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌ0123456789ABCDEF#$%*<>/=+".split("");

const DEFAULT_COLORS = ["#34E1FF", "#FF5CA8", "#FFB23E", "#B98BFF", "#3BF57E"];

export function MatrixRain({
  colors = DEFAULT_COLORS,
  head = "#EAF6FF",
  reduced = false,
  opacity = 0.5,
  stepMs = 105,
}: {
  colors?: string[];
  head?: string;
  reduced?: boolean;
  opacity?: number;
  stepMs?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const cx = cv.getContext("2d");
    if (!cx) return;

    const fontSize = 15;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;
    let cols = 0;
    let drops: number[] = [];
    let colColors: string[] = [];
    let raf = 0;
    let last = -9999;

    const rnd = () => CHARS[Math.floor(Math.random() * CHARS.length)];

    const setup = () => {
      W = cv.clientWidth;
      H = cv.clientHeight;
      cv.width = Math.floor(W * dpr);
      cv.height = Math.floor(H * dpr);
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.max(1, Math.floor(W / fontSize));
      drops = new Array(cols).fill(0).map(() => Math.floor(Math.random() * -60));
      colColors = new Array(cols).fill(0).map(() => colors[Math.floor(Math.random() * colors.length)]);
      cx.textBaseline = "top";
    };

    const paintStatic = () => {
      cx.fillStyle = "#060810";
      cx.fillRect(0, 0, W, H);
      cx.font = `${fontSize}px monospace`;
      for (let i = 0; i < cols; i++) {
        cx.fillStyle = colColors[i];
        for (let y = 0; y < H; y += fontSize) {
          if (Math.random() > 0.55) {
            cx.globalAlpha = 0.2 + Math.random() * 0.5;
            cx.fillText(rnd(), i * fontSize, y);
          }
        }
      }
      cx.globalAlpha = 1;
    };

    const step = () => {
      // translucent wipe = trails
      cx.fillStyle = "rgba(6, 8, 16, 0.14)";
      cx.fillRect(0, 0, W, H);
      cx.font = `${fontSize}px monospace`;
      for (let i = 0; i < cols; i++) {
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        cx.fillStyle = colColors[i];
        cx.fillText(rnd(), x, y - fontSize);
        cx.fillStyle = head;
        cx.fillText(rnd(), x, y);
        if (y > H && Math.random() > 0.975) {
          drops[i] = Math.floor(Math.random() * -20);
          colColors[i] = colors[Math.floor(Math.random() * colors.length)];
        }
        drops[i]++;
      }
    };

    const loop = (t: number) => {
      if (t - last >= stepMs) {
        step();
        last = t;
      }
      raf = requestAnimationFrame(loop);
    };

    setup();
    if (reduced) paintStatic();
    else raf = requestAnimationFrame(loop);

    const onResize = () => {
      setup();
      if (reduced) paintStatic();
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [colors, head, reduced, stepMs]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none", opacity }}
    />
  );
}
