"use client";

import { useEffect, useRef } from "react";

/**
 * IdleWorldLayer — fixed-position canvas behind all content that runs
 * a tiny particle simulation. Real PC games keep the world breathing
 * even when you're not interacting; otherwise the screen feels frozen.
 *
 * Cheap: ~50 particles, 60fps via rAF, draws into a single 2D canvas.
 * Honours the global `data-ax-reduce-motion` flag — if the user has
 * enabled "Reduce motion" in settings, the canvas just renders 5
 * static dim points and skips the rAF loop.
 *
 * Visual: slow upward drift, gentle horizontal sway, three colour
 * tiers (cyan / cosmic / pink) blended via additive composite. A few
 * bigger "spark" particles every 3-5s for a beat of life.
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  hue: number; /* 0..1 — drives colour pick */
  life: number;
  max: number;
  spark: boolean;
}

const COLOURS = [
  { r: 0, g: 229, b: 255 },     // cyan
  { r: 124, g: 92, b: 255 },    // cosmic violet
  { r: 255, g: 95, b: 179 },    // neon pink
  { r: 125, g: 240, b: 255 },   // cyan-soft
];

function pickColour(hue: number) {
  return COLOURS[Math.floor(hue * COLOURS.length) % COLOURS.length];
}

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function spawn(width: number, height: number, spark = false): Particle {
  const max = spark ? rand(2400, 3600) : rand(5000, 9000);
  return {
    x: rand(0, width),
    y: spark ? rand(0, height) : height + rand(0, 60),
    vx: rand(-0.05, 0.05),
    vy: spark ? rand(-0.05, 0.05) : -rand(0.06, 0.18),
    size: spark ? rand(2.4, 4.2) : rand(0.6, 2.0),
    hue: Math.random(),
    life: 0,
    max,
    spark,
  };
}

export default function IdleWorldLayer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const reducedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    let width = window.innerWidth;
    let height = window.innerHeight;

    function resize() {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    const resizeHandler = () => resize();
    window.addEventListener("resize", resizeHandler);

    /* Initial seed — half the cap, distributed up the screen so we
     * don't have an obvious wave of new particles entering from the
     * bottom on first render. */
    particlesRef.current = [];
    for (let i = 0; i < 26; i++) {
      const p = spawn(width, height);
      p.y = rand(0, height); /* spread vertically */
      p.life = rand(0, p.max * 0.6);
      particlesRef.current.push(p);
    }

    /* Honour reduce-motion: render once + bail. */
    const reduce =
      document.documentElement.dataset.axReduceMotion === "true";
    reducedRef.current = reduce;

    if (reduce) {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < 5; i++) {
        const c = pickColour(Math.random());
        ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},0.18)`;
        const x = rand(0, width);
        const y = rand(0, height);
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
      return () => window.removeEventListener("resize", resizeHandler);
    }

    let raf = 0;
    let last = performance.now();
    let nextSpark = performance.now() + rand(2400, 4800);
    let paused = document.hidden;

    /* Pause the rAF loop when the tab is backgrounded — saves battery
     * and avoids burning CPU on a canvas no one can see. */
    const onVisibility = () => {
      if (document.hidden) {
        paused = true;
        if (raf) {
          window.cancelAnimationFrame(raf);
          raf = 0;
        }
      } else if (paused) {
        paused = false;
        /* Reset `last` so the first frame after resume doesn't see a
         * giant `dt` and warp every particle off-screen. */
        last = performance.now();
        raf = window.requestAnimationFrame(tick);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    function tick(now: number) {
      if (!ctx) return;
      const dt = Math.min(48, now - last);
      last = now;

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      const arr = particlesRef.current;
      for (let i = arr.length - 1; i >= 0; i--) {
        const p = arr[i];
        p.life += dt;
        if (p.life >= p.max || p.y < -20 || p.x < -20 || p.x > width + 20) {
          arr.splice(i, 1);
          continue;
        }

        /* Sway — gentle horizontal sine. */
        p.x += p.vx * dt + Math.sin((p.life + p.hue * 1000) / 600) * 0.04;
        p.y += p.vy * dt;

        /* Fade curve — ease in/out across life. */
        const t = p.life / p.max;
        const fadeIn = Math.min(1, t * 6);
        const fadeOut = Math.min(1, (1 - t) * 4);
        const alphaBase = Math.min(fadeIn, fadeOut);
        const alpha = (p.spark ? 0.55 : 0.32) * alphaBase;

        const c = pickColour(p.hue);
        ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},${alpha})`;

        if (p.spark) {
          /* Spark — small radial gradient via 2 stacked circles. */
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},${alpha * 0.18})`;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},${alpha})`;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      /* Maintain population. */
      while (arr.length < 38) {
        arr.push(spawn(width, height));
      }

      /* Periodic spark beat. */
      if (now > nextSpark) {
        arr.push(spawn(width, height, true));
        nextSpark = now + rand(2400, 5200);
      }

      raf = window.requestAnimationFrame(tick);
    }
    if (!paused) raf = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", resizeHandler);
      document.removeEventListener("visibilitychange", onVisibility);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        opacity: 0.85,
      }}
    />
  );
}
