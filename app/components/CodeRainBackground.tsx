"use client";

import { useEffect, useRef } from "react";

type Props = {
  /** Solid base colour (hex) the trails fade back into. */
  bg?: string;
  /** Leading-glyph colours for the default / accent-1 / accent-2 streams. */
  head?: string;
  accentA?: string;
  accentB?: string;
  /** `true` (default) pins the canvas to the viewport; `false` positions it
   *  absolutely so it fills the nearest positioned ancestor instead. */
  fixed?: boolean;
};

/* Low-end device: weak laptops, Chromebooks and old phones. We draw a single
 * static frame for these instead of a per-frame loop, so a school computer
 * never pays for a full-screen animation. */
function isLowEndDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const cores = navigator.hardwareConcurrency;
  const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
  if (typeof cores === "number" && cores > 0 && cores <= 4) return true;
  if (typeof mem === "number" && mem > 0 && mem <= 4) return true;
  return false;
}

/**
 * Futuristic "live coding" backdrop — a fixed, full-viewport canvas of
 * streaming code glyphs with depth and the occasional accent stream. Kept
 * deliberately dim so foreground copy always wins; a veil sits above it.
 *
 * Built to stay cheap on every device: capped DPR, a single global fade for
 * the trails, and it stops drawing whenever it can't help — a static frame
 * (no loop) under prefers-reduced-motion OR on a low-end device, a 30fps cap
 * on the live loop, a pause when the tab is hidden, and a pause when it is
 * scrolled out of view.
 */
export default function CodeRainBackground({
  bg = "#05070d",
  head = "rgba(120,224,255,0.92)",
  accentA = "rgba(150,135,255,0.9)",
  accentB = "rgba(74,222,128,0.85)",
  fixed = true,
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const still = reduce || isLowEndDevice();

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

    // Cap the live loop at ~30fps: the fall is slow ambient motion, so 30 is
    // indistinguishable from 60 and roughly halves the per-frame paint cost.
    const FRAME_MS = 1000 / 30;
    let lastDraw = -Infinity;
    let running = false;
    let onScreen = true;

    function step(now: number) {
      if (!running) return;
      raf = requestAnimationFrame(step);
      if (now - lastDraw < FRAME_MS) return;
      lastDraw = now;
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

    // The loop runs only while the canvas is on-screen AND the tab is
    // visible. `onScreen` is tracked by the IntersectionObserver below; for a
    // viewport-fixed canvas it is always true, so nothing is lost there.
    function startLoop() {
      if (still || running || !onScreen || document.hidden) return;
      running = true;
      lastDraw = -Infinity;
      raf = requestAnimationFrame(step);
    }
    function stopLoop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    resize();
    if (still) staticFrame();
    else startLoop();

    const onResize = () => { resize(); if (still) staticFrame(); };
    const onVis = () => {
      if (still) return;
      if (document.hidden) stopLoop();
      else startLoop();
    };

    const io =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            (entries) => {
              onScreen = entries.some((e) => e.isIntersecting);
              if (still) return;
              if (onScreen) startLoop();
              else stopLoop();
            },
            { rootMargin: "120px" },
          )
        : null;
    io?.observe(cv);

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      stopLoop();
      io?.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [bg, head, accentA, accentB]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{ position: fixed ? "fixed" : "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }}
    />
  );
}
