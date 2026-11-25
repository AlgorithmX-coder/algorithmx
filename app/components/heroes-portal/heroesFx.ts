/* Heroes portal motion, ported from the lab's r6-heroes.js (landing lab
 * round 6, family "heroes"). The night sky: 150 twinkling stars (a few
 * warm) and eight amber motes that drift only in the outer 7% columns, so
 * nothing ever moves across text. About 30 fps, DPR capped at 1.5, stopped
 * while paused or when the tab is hidden. Everything returns a cleanup. */

import { setupHiDpiCanvas } from "@/app/lib/gameEngine/canvas";

export const reduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function nightSky(cv: HTMLCanvasElement, paused: () => boolean) {
  let ctx: CanvasRenderingContext2D | null = null;
  let W = 0, H = 0, raf = 0, last = 0, acc = 0, dead = false;
  const seed = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  let stars: { x: number; y: number; r: number; p: number; s: number; warm: boolean }[] = [];
  let motes: { x: number; y: number; v: number; r: number }[] = [];
  const still = reduced();

  function draw(t: number, dt: number) {
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    for (const s of stars) {
      ctx.globalAlpha = 0.35 + 0.5 * (0.5 + 0.5 * Math.sin(s.p + t * 0.001 * s.s));
      ctx.fillStyle = s.warm ? "#ffd59a" : "#ffffff";
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill();
    }
    for (const m of motes) {
      m.y -= m.v * dt; if (m.y < -10) m.y = H + 10;
      ctx.globalAlpha = 0.55; ctx.fillStyle = "#ffc46b";
      ctx.shadowColor = "rgba(255,179,71,.9)"; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, 6.283); ctx.fill(); ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
  }
  function size() {
    W = window.innerWidth; H = window.innerHeight;
    const set = setupHiDpiCanvas(cv, { logicalWidth: W, logicalHeight: H, maxDpr: 1.5 });
    ctx = set ? set.ctx : null;
    stars = Array.from({ length: 150 }, (_, i) => ({ x: seed(i) * W, y: seed(i + 99) * H, r: 0.5 + seed(i + 7) * 1.3, p: seed(i + 3) * 6.28, s: 0.4 + seed(i + 5) * 1.2, warm: seed(i + 11) > 0.82 }));
    motes = Array.from({ length: 8 }, (_, i) => ({ x: i % 2 ? W - seed(i + 40) * W * 0.07 : seed(i + 40) * W * 0.07, y: seed(i + 50) * H, v: 6 + seed(i + 60) * 8, r: 1.4 + seed(i + 70) * 1.6 }));
    draw(0, 0);
  }
  const tick = (t: number) => {
    raf = 0;
    if (dead || document.hidden || paused()) return;
    const dt = last ? Math.min(0.05, (t - last) / 1000) : 0.016;
    last = t; acc += dt;
    if (acc >= 1 / 30) { draw(t, acc); acc = 0; }
    raf = requestAnimationFrame(tick);
  };
  const kick = () => { if (!dead && !raf && !paused() && !still) { last = 0; raf = requestAnimationFrame(tick); } };
  const onVis = () => { if (!document.hidden) kick(); };
  const onResize = () => size();
  window.addEventListener("resize", onResize);
  document.addEventListener("visibilitychange", onVis);
  size();
  kick();
  return {
    kick,
    destroy() {
      dead = true;
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
    },
  };
}

/* The entrance: [data-rise] and [data-pop] get data-in once, in document
 * order 70 ms apart (capped), or at their own data-delay in ms. */
export function rise(root: HTMLElement) {
  const els = Array.from(root.querySelectorAll<HTMLElement>("[data-rise],[data-pop]")).filter((e) => !e.hasAttribute("data-in"));
  if (reduced()) { els.forEach((e) => e.setAttribute("data-in", "")); return () => {}; }
  const timers = els.map((e, i) => {
    const d = Number(e.dataset.delay || 0) || Math.min(i, 14) * 70;
    return setTimeout(() => e.setAttribute("data-in", ""), 60 + d);
  });
  return () => timers.forEach(clearTimeout);
}
