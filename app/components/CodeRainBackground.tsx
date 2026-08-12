"use client";

import { useEffect, useRef } from "react";

type Props = {
  /** Solid base colour (hex) the trails fade back into. */
  bg?: string;
  /** Leading-glyph colours for the default / accent-1 / accent-2 streams. */
  head?: string;
  accentA?: string;
  accentB?: string;
};

/**
 * Futuristic "live coding" backdrop — a fixed, full-viewport canvas of
 * streaming code glyphs with depth and the occasional accent stream. Kept
 * deliberately dim so foreground copy always wins; a veil sits above it.
 *
 * Cheap and well-behaved: capped DPR, single global fade for the trails,
 * pauses when the tab is hidden, and renders one static frame under
 * prefers-reduced-motion instead of animating.
 */
export default function CodeRainBackground({
  bg = "#05070d",
  head = "rgba(120,224,255,0.92)",
  accentA = "rgba(150,135,255,0.9)",
  accentB = "rgba(74,222,128,0.85)",
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // base colour -> "r,g,b" so the per-frame fade matches the ground exactly
    const hex = bg.replace("#", "");
    const rgb = hex.length === 6
      ? `${parseInt(hex.slice(0, 2), 16)},${parseInt(hex.slice(2, 4), 16)},${parseInt(hex.slice(4, 6), 16)}`
      : "5,7,13";

    const GLYPHS = "01{}()[]<>/=;:+-*&|!?.$#%01ABCDEFabcdef=>const<//>";
    const pick = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];

    let W = 0, H = 0, dpr = 1, cell = 18, cols = 0, raf = 0;
    type Col = { y: number; speed: number; accent: 0 | 1 | 2 };
    let drops: Col[] = [];

    const newCol = (): Col => ({
      y: Math.random() * -40,
      speed: 0.18 + Math.random() * 0.55,
      accent: Math.random() < 0.1 ? 1 : Math.random() < 0.06 ? 2 : 0,
    });

    function resize() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = cv!.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      cv!.width = Math.round(W * dpr); cv!.height = Math.round(H * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      cell = Math.max(15, Math.round(W / 95));
      cols = Math.ceil(W / cell) + 1;
      drops = Array.from({ length: cols }, newCol);
      ctx!.fillStyle = bg;
      ctx!.fillRect(0, 0, W, H);
      ctx!.textBaseline = "top";
    }

    const headColor = (a: Col) => (a.accent === 1 ? accentA : a.accent === 2 ? accentB : head);

    function step() {
      ctx!.fillStyle = `rgba(${rgb},0.085)`; // fade the trails
      ctx!.fillRect(0, 0, W, H);
      ctx!.font = `600 ${cell}px 'IBM Plex Mono', ui-monospace, Menlo, Consolas, monospace`;
      for (let i = 0; i < cols; i++) {
        const d = drops[i];
        const y = Math.floor(d.y) * cell;
        if (y > -cell && y < H) {
          ctx!.fillStyle = headColor(d);
          ctx!.fillText(pick(), i * cell, y);
        }
        d.y += d.speed;
        if (y > H && Math.random() > 0.972) drops[i] = newCol();
      }
      raf = requestAnimationFrame(step);
    }

    function staticFrame() {
      ctx!.font = `600 ${cell}px 'IBM Plex Mono', ui-monospace, monospace`;
      for (let i = 0; i < cols; i++) {
        const rows = Math.floor(H / cell);
        for (let r = 0; r < rows; r++) {
          if (Math.random() > 0.14) continue;
          ctx!.fillStyle = head.replace(/0?\.\d+\)$/, "0.10)");
          ctx!.fillText(pick(), i * cell, r * cell);
        }
      }
    }

    resize();
    if (reduce) staticFrame();
    else raf = requestAnimationFrame(step);

    const onResize = () => { resize(); if (reduce) staticFrame(); };
    const onVis = () => {
      if (reduce) return;
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(step);
    };
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [bg, head, accentA, accentB]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }}
    />
  );
}
