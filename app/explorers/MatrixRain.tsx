"use client";

/**
 * Full-screen matrix digital rain (canvas). One canvas for the whole page,
 * so it stays cheap. Bright lead glyph + green trail, classic fade. Honors
 * reduced-motion by painting a single static field instead of animating.
 */

import { useEffect, useRef } from "react";

const CHARS =
  "01ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌ0123456789ABCDEF#$%*<>/=+".split("");

export function MatrixRain({
  color = "#26E063",
  head = "#CFFFE0",
  reduced = false,
  opacity = 0.5,
}: {
  color?: string;
  head?: string;
  reduced?: boolean;
  opacity?: number;
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
    let raf = 0;

    const rnd = () => CHARS[Math.floor(Math.random() * CHARS.length)];

    const setup = () => {
      W = cv.clientWidth;
      H = cv.clientHeight;
      cv.width = Math.floor(W * dpr);
      cv.height = Math.floor(H * dpr);
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.max(1, Math.floor(W / fontSize));
      drops = new Array(cols).fill(0).map(() => Math.floor(Math.random() * -60));
      cx.textBaseline = "top";
    };

    const paintStatic = () => {
      cx.fillStyle = "#040804";
      cx.fillRect(0, 0, W, H);
      cx.font = `${fontSize}px monospace`;
      for (let i = 0; i < cols; i++) {
        for (let y = 0; y < H; y += fontSize) {
          if (Math.random() > 0.55) {
            cx.globalAlpha = 0.25 + Math.random() * 0.5;
            cx.fillStyle = color;
            cx.fillText(rnd(), i * fontSize, y);
          }
        }
      }
      cx.globalAlpha = 1;
    };

    const frame = () => {
      cx.fillStyle = "rgba(4, 8, 4, 0.10)";
      cx.fillRect(0, 0, W, H);
      cx.font = `${fontSize}px monospace`;
      for (let i = 0; i < cols; i++) {
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        cx.fillStyle = color;
        cx.fillText(rnd(), x, y - fontSize);
        cx.fillStyle = head;
        cx.fillText(rnd(), x, y);
        if (y > H && Math.random() > 0.975) drops[i] = Math.floor(Math.random() * -20);
        drops[i]++;
      }
      raf = requestAnimationFrame(frame);
    };

    setup();
    if (reduced) paintStatic();
    else raf = requestAnimationFrame(frame);

    const onResize = () => {
      setup();
      if (reduced) paintStatic();
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [color, head, reduced]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none", opacity }}
    />
  );
}
