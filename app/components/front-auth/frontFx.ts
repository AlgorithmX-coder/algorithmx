/* Front door motion: the key light and "Six streams. One key." Vanilla and
 * imperative, run from one effect in FrontShell.tsx. Ported from the lab's
 * r6-auth.js light and r7-front.js streams (landing lab round 7). Every loop
 * reads `paused()` each frame and stops when the page is hidden; everything
 * returns a cleanup. */

import { setupHiDpiCanvas } from "@/app/lib/gameEngine/canvas";

export const reduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ── THE KEY LIGHT ── one source at the top left. The console's sheen and
   rim read it through --lx/--ly and the cyan pool leans with it. Focusing a
   field leans it a few degrees toward that field; submit flashes it. */
export function keyLight(root: HTMLElement, consoleEl: HTMLElement, keyEl: HTMLElement, still: boolean) {
  let kx = 0.17, ky = -0.08, tx = kx, ty = ky, raf = 0, focusEl: HTMLElement | null = null, flashing = false;
  let flashTimer: ReturnType<typeof setTimeout> | undefined;
  const base = () => (window.innerWidth < 640 ? { x: 0.3, y: -0.06 } : { x: 0.17, y: -0.08 });
  function target() {
    const b = base();
    if (focusEl && !still) {
      const r = focusEl.getBoundingClientRect();
      const fx = (r.left + r.width / 2) / window.innerWidth, fy = (r.top + r.height / 2) / window.innerHeight;
      tx = b.x + (fx - b.x) * 0.14; ty = b.y + (fy - b.y) * 0.14;
    } else { tx = b.x; ty = b.y; }
  }
  function frame() {
    raf = 0;
    const k = flashing ? 0.16 : 0.07;
    kx += (tx - kx) * k; ky += (ty - ky) * k;
    const W = window.innerWidth, H = window.innerHeight, LX = W * kx, LY = H * ky;
    const b = base();
    keyEl.style.setProperty("--fra-kx", ((kx - b.x) * W).toFixed(1) + "px");
    keyEl.style.setProperty("--fra-ky", ((ky - b.y) * H).toFixed(1) + "px");
    const r = consoleEl.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      consoleEl.style.setProperty("--lx", Math.max(-200, Math.min(300, ((LX - r.left) / r.width) * 100)).toFixed(1) + "%");
      consoleEl.style.setProperty("--ly", Math.max(-300, Math.min(400, ((LY - r.top) / r.height) * 100)).toFixed(1) + "%");
    }
    if (focusEl) {
      const fr = focusEl.getBoundingClientRect();
      const hair = focusEl.parentElement?.querySelector<HTMLElement>(".fra-hair");
      if (hair && fr.width > 0) hair.style.setProperty("--hx", Math.max(5, Math.min(95, ((LX - fr.left) / fr.width) * 100)).toFixed(0) + "%");
    }
    if (Math.abs(tx - kx) > 0.0004 || Math.abs(ty - ky) > 0.0004) raf = requestAnimationFrame(frame);
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
  const onResize = () => { target(); kick(); };
  const onFocusIn = (e: FocusEvent) => { const el = e.target as HTMLElement; if (el?.matches?.(".fra-input")) { focusEl = el; target(); kick(); } };
  const onFocusOut = (e: FocusEvent) => { if (e.target === focusEl) { focusEl = null; target(); kick(); } };
  window.addEventListener("resize", onResize);
  root.addEventListener("focusin", onFocusIn);
  root.addEventListener("focusout", onFocusOut);
  target(); kx = tx; ky = ty; kick();
  return {
    flash() {
      if (still) return;
      const b = base(); flashing = true; tx = b.x + 0.05; ty = b.y + 0.08; kick();
      clearTimeout(flashTimer);
      flashTimer = setTimeout(() => { flashing = false; target(); kick(); }, 260);
    },
    destroy() {
      window.removeEventListener("resize", onResize);
      root.removeEventListener("focusin", onFocusIn);
      root.removeEventListener("focusout", onFocusOut);
      if (raf) cancelAnimationFrame(raf);
      clearTimeout(flashTimer);
    },
  };
}

/* ── SIX STREAMS, ONE KEY ── six thin lines in the homepage's six course
   colours (Heroes, Explorers, Ops, Pro, Desk Ready, Workplace) rise in the
   free margins beside the console, never under it or the chrome. A packet
   travels each in turn, one every 1.35 s; on success all six fire. At phone
   width they become six short risers under the console. 40 fps cap. */
export const STREAM_COLOURS = ["224,152,31", "43,189,208", "139,123,255", "255,122,61", "127,178,255", "47,182,122"] as const;

type Pt = { x: number; y: number };
type Line = { pts: Pt[]; c: string; phase: number; dur: number; fire: number; y0: number; y1: number };

export interface Rect { left: number; right: number; bottom: number }

/** The two side zones (and their x positions) the streams may use, or null for the phone strip. */
export function streamZones(W: number, r: Rect): { x: number; w: number; side: -1 | 1 }[] | null {
  const pad = 34;
  const lw = r.left - pad, rw = W - r.right - pad;
  if (lw >= 110 && rw >= 110) return [{ x: 64, w: lw - 64, side: -1 }, { x: r.right + pad, w: rw - 24, side: 1 }];
  return null;
}

/** A cubic from the bottom edge up to `top`, sampled into 141 points. */
export function streamPath(x0: number, zw: number, top: number, H: number, idx: number, side: number): Pt[] {
  const y0 = H + 6, y1 = top, sway = Math.min(46, zw * 0.12) * (idx % 2 ? 1 : -1);
  const p0 = { x: x0, y: y0 }, p1 = { x: x0 + sway, y: y0 - (y0 - y1) * 0.35 }, p2 = { x: x0 - sway * 0.8, y: y0 - (y0 - y1) * 0.7 }, p3 = { x: x0 + side * Math.min(18, zw * 0.05), y: y1 };
  const pts: Pt[] = [];
  for (let i = 0; i <= 140; i++) {
    const t = i / 140, u = 1 - t;
    pts.push({
      x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
      y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
    });
  }
  return pts;
}

export interface Streams { kick: () => void; fire: () => void; destroy: () => void }

export function streams(
  host: HTMLElement,
  els: { consoleEl: HTMLElement; chromeEl: HTMLElement; avoid: () => HTMLElement[] },
  env: { paused: () => boolean; still: boolean },
): Streams {
  const cv = document.createElement("canvas");
  host.appendChild(cv);
  let ctx: CanvasRenderingContext2D | null = null;
  let lines: Line[] = [], W = 0, H = 0, T = 0, raf = 0, last = 0, acc = 0, dead = false;

  function layout() {
    if (dead) return;
    W = window.innerWidth; H = window.innerHeight;
    const set = setupHiDpiCanvas(cv, { logicalWidth: W, logicalHeight: H, maxDpr: 1.5 });
    ctx = set ? set.ctx : null;
    const rc = els.consoleEl.getBoundingClientRect();
    const r: Rect = { left: rc.left, right: rc.right, bottom: rc.bottom };
    for (const el of els.avoid()) {
      const q = el.getBoundingClientRect();
      if (q.width) { r.left = Math.min(r.left, q.left); r.right = Math.max(r.right, q.right); r.bottom = Math.max(r.bottom, q.bottom); }
    }
    const top = els.chromeEl.getBoundingClientRect().bottom + 36;
    const zs = streamZones(W, r);
    lines = [];
    const make = (x0: number, zw: number, y1: number, i: number, side: number): Line => ({
      pts: streamPath(x0, zw, y1, H, i, side), c: STREAM_COLOURS[i], phase: i * 1.35, dur: 3.4 + (i % 3) * 0.35, fire: -1, y0: H + 6, y1,
    });
    if (zs) {
      zs.forEach((z, zi) => { for (let j = 0; j < 3; j++) lines.push(make(z.x + z.w * (0.2 + 0.3 * j), z.w, top, zi * 3 + j, z.side)); });
    } else {
      const y0 = r.bottom + 24;
      if (H - y0 > 70) for (let i = 0; i < 6; i++) lines.push(make(W * (0.22 + i * 0.12), W * 0.14, y0, i, i < 3 ? -1 : 1));
    }
    draw();
  }

  function packet(c: CanvasRenderingContext2D, l: Line, p: number) {
    if (p < 0 || p > 1) return;
    const n = l.pts.length - 1, head = Math.floor(p * n), tail = Math.max(0, head - 26);
    const fade = Math.min(1, (1 - p) * 3.2) * Math.min(1, p * 8);
    const a = l.pts[tail], b = l.pts[head];
    const g = c.createLinearGradient(a.x, a.y, b.x, b.y);
    g.addColorStop(0, `rgba(${l.c},0)`); g.addColorStop(1, `rgba(${l.c},${(0.85 * fade).toFixed(3)})`);
    c.strokeStyle = g; c.lineWidth = 2.4; c.lineCap = "round"; c.beginPath();
    for (let i = tail; i <= head; i++) (i === tail ? c.moveTo(l.pts[i].x, l.pts[i].y) : c.lineTo(l.pts[i].x, l.pts[i].y));
    c.stroke();
    c.fillStyle = `rgba(${l.c},${(0.95 * fade).toFixed(3)})`; c.shadowColor = `rgba(${l.c},.8)`; c.shadowBlur = 12;
    c.beginPath(); c.arc(b.x, b.y, 2.6, 0, 7); c.fill(); c.shadowBlur = 0;
    c.fillStyle = `rgba(255,255,255,${(0.95 * fade).toFixed(3)})`; c.beginPath(); c.arc(b.x, b.y, 1.1, 0, 7); c.fill();
  }

  const CYCLE = 8.1; /* six packets, one every 1.35 s */
  function draw() {
    const c = ctx;
    if (!c) return;
    c.clearRect(0, 0, W, H);
    for (const l of lines) {
      const g = c.createLinearGradient(0, l.y1, 0, l.y0);
      g.addColorStop(0, `rgba(${l.c},0)`); g.addColorStop(0.35, `rgba(${l.c},.26)`); g.addColorStop(1, `rgba(${l.c},.46)`);
      c.strokeStyle = g; c.lineWidth = W > 1600 ? 1.8 : 1.5; c.lineCap = "butt"; c.beginPath();
      l.pts.forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y)));
      c.stroke();
    }
    if (env.still) return;
    for (const l of lines) {
      const t = (((T - l.phase) % CYCLE) + CYCLE) % CYCLE;
      packet(c, l, t / l.dur);
      if (l.fire >= 0) { packet(c, l, (T - l.fire) / 1.5); if (T - l.fire > 1.5) l.fire = -1; }
    }
  }

  const tick = (t: number) => {
    raf = 0;
    if (dead || document.hidden || env.paused()) return;
    const dt = last ? Math.min(0.05, (t - last) / 1000) : 0.016; last = t; acc += dt;
    if (acc >= 1 / 40) { T += acc; acc = 0; draw(); }
    raf = requestAnimationFrame(tick);
  };
  const kick = () => { if (!raf && !dead && !env.paused() && !env.still) { last = 0; raf = requestAnimationFrame(tick); } };

  let rt: ReturnType<typeof setTimeout> | undefined;
  const onResize = () => { clearTimeout(rt); rt = setTimeout(layout, 120); };
  window.addEventListener("resize", onResize);
  document.addEventListener("visibilitychange", kick);
  /* lay out once the console has risen into place, and again when it changes size */
  const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(onResize) : null;
  ro?.observe(els.consoleEl);
  layout();
  const settle = setTimeout(layout, 1300);
  document.fonts?.ready.then(() => layout()).catch(() => {});
  kick();

  return {
    kick,
    fire() { for (const l of lines) l.fire = T; kick(); },
    destroy() {
      dead = true;
      if (raf) cancelAnimationFrame(raf);
      clearTimeout(rt); clearTimeout(settle);
      ro?.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", kick);
      cv.remove();
    },
  };
}
