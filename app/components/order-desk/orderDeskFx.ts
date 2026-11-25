/* Order Desk motion, ported from the lab's r6-buy.js (landing lab round 6,
 * family "buy"). The backdrop canvas: up to seventy points drifting up the
 * 64px grid, never drawn inside a text block that sits straight on the
 * backdrop. DPR capped at 1.5, stopped while paused or when the tab is
 * hidden. Returns a controller; everything cleans up in destroy(). */

import { setupHiDpiCanvas } from "@/app/lib/gameEngine/canvas";

export const reduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Text that sits straight on the backdrop (no panel behind it). */
const KEEP = ".odk-eyebrow,.odk-h1,.odk-lead,.odk-order > .odk-note,.odk-ctas,.odk-steps,.odk-foot,.odk-nav .cap,.odk-chip,.odk-pause";

export function ledgerBackdrop(host: HTMLElement, root: HTMLElement, paused: () => boolean) {
  const cv = document.createElement("canvas");
  cv.setAttribute("aria-hidden", "true");
  host.appendChild(cv);
  let ctx: CanvasRenderingContext2D | null = null;
  let W = 0, H = 0, raf = 0, dead = false;
  let keep: number[][] = [];
  let pts: { x: number; y: number; r: number; vx: number; vy: number; p: number }[] = [];
  const t0 = performance.now();
  const dot = getComputedStyle(root).getPropertyValue("--dot").trim() || "rgba(255,179,71,.55)";

  const measure = () => {
    keep = Array.from(root.querySelectorAll<HTMLElement>(KEEP)).map((el) => {
      const b = el.getBoundingClientRect();
      return [b.left - 10, b.top - 10, b.right + 10, b.bottom + 10];
    });
  };
  const inKeep = (x: number, y: number) => keep.some((k) => x >= k[0] && x <= k[2] && y >= k[1] && y <= k[3]);

  const size = () => {
    W = window.innerWidth; H = window.innerHeight;
    const set = setupHiDpiCanvas(cv, { logicalWidth: W, logicalHeight: H, maxDpr: 1.5 });
    ctx = set ? set.ctx : null;
    measure();
    const n = Math.min(70, Math.round((W * H) / 24000));
    pts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, r: 1 + Math.random() * 1.6, vx: (Math.random() - 0.5) * 0.08, vy: -0.04 - Math.random() * 0.08, p: Math.random() * 6.28 }));
  };

  const still = reduced();
  const moving = () => !still && !paused() && !document.hidden;

  const draw = (now: number) => {
    raf = 0;
    if (dead || !ctx) return;
    ctx.clearRect(0, 0, W, H);
    const t = (now - t0) / 1000;
    const go = moving();
    for (const p of pts) {
      if (go) {
        p.x += p.vx; p.y += p.vy;
        if (p.y < -4) { p.y = H + 4; p.x = Math.random() * W; }
        if (p.x < -4) p.x = W + 4;
        if (p.x > W + 4) p.x = -4;
      }
      if (inKeep(p.x, p.y)) continue;
      ctx.globalAlpha = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 0.9 + p.p));
      ctx.fillStyle = dot;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.28); ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (go) raf = requestAnimationFrame(draw);
  };
  const kick = () => { if (!dead && !raf) raf = requestAnimationFrame(draw); };
  const onResize = () => { size(); kick(); };
  const onScroll = () => { measure(); kick(); };
  const onVis = () => kick();

  size();
  kick();
  window.addEventListener("resize", onResize, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("visibilitychange", onVis);
  /* the entrance moves the text blocks; measure again once it has settled */
  const settle = setTimeout(() => { measure(); kick(); }, 1600);

  return {
    kick,
    /* layout changed (an error line appeared, a hint opened) */
    measure: () => { measure(); kick(); },
    destroy() {
      dead = true;
      if (raf) cancelAnimationFrame(raf);
      clearTimeout(settle);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVis);
      cv.remove();
    },
  };
}

/* The entrance: every [data-rise] in document order gets data-in, 70 ms
 * apart (an element with its own --d keeps it). */
export function rise(root: HTMLElement) {
  const els = Array.from(root.querySelectorAll<HTMLElement>("[data-rise]"));
  const go = () => els.forEach((el, i) => {
    if (!el.style.getPropertyValue("--d")) el.style.setProperty("--d", (0.12 + i * 0.07).toFixed(2) + "s");
    el.setAttribute("data-in", "");
  });
  if (reduced()) { go(); return () => {}; }
  let r2 = 0;
  const r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(go); });
  return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); };
}

/* Count a figure from one value to the next, formatted the whole way. */
export function tweenNumber(from: number, to: number, onFrame: (v: number) => void, ms = 420) {
  if (reduced() || from === to) { onFrame(to); return () => {}; }
  const t0 = performance.now();
  /* Whole pounds in, whole pounds on every frame: never a passing figure with pence it will not end on. */
  const step = from % 100 === 0 && to % 100 === 0 ? 100 : 1;
  let raf = 0;
  const tick = (now: number) => {
    const p = Math.min(1, (now - t0) / ms), k = 1 - Math.pow(1 - p, 3);
    onFrame(p < 1 ? Math.round((from + (to - from) * k) / step) * step : to);
    if (p < 1) raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}
