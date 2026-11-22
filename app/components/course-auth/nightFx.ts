/* Night Console motion: the key light and the four course idles. Vanilla,
 * imperative, run from one effect in NightConsole.tsx. Ported from the lab's
 * a03.js (landing lab round 5, family 03). Every loop reads `paused()` each
 * frame and stops when the page is hidden; everything returns a cleanup. */

import { setupHiDpiCanvas } from "@/app/lib/gameEngine/canvas";

export const reduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export interface FxEnv {
  /** Reads the Pause/Play state; loops consult it every frame. */
  paused: () => boolean;
  /** Prefers-reduced-motion at mount: draw one static frame or nothing. */
  still: boolean;
}

export interface Idle {
  /** Restart the loop after Play (a no-op while still paused). */
  kick: () => void;
  destroy: () => void;
}

/* ── THE KEY LIGHT ── one source at the top left. The console's sheen and
   rim read it through --lx/--ly. Signature: focusing a field leans the light
   a few degrees toward that field (its hairline origin follows too); submit
   flashes it toward the button. */
export function keyLight(root: HTMLElement, consoleEl: HTMLElement, keyEl: HTMLElement, still: boolean) {
  let kx = 0.17, ky = -0.08, tx = kx, ty = ky, raf = 0, focusEl: HTMLElement | null = null, flashing = false;
  let flashTimer: ReturnType<typeof setTimeout> | undefined;
  const base = () => (window.innerWidth < 640 ? { x: 0.3, y: -0.06 } : { x: 0.17, y: -0.08 });
  function target() {
    const b = base();
    if (focusEl && !still) {
      const r = focusEl.getBoundingClientRect();
      const fx = (r.left + r.width / 2) / window.innerWidth, fy = (r.top + r.height / 2) / window.innerHeight;
      /* a few degrees: 14% of the way toward the field */
      tx = b.x + (fx - b.x) * 0.14; ty = b.y + (fy - b.y) * 0.14;
    } else { tx = b.x; ty = b.y; }
  }
  function frame() {
    raf = 0;
    const k = flashing ? 0.16 : 0.07;
    kx += (tx - kx) * k; ky += (ty - ky) * k;
    const W = window.innerWidth, H = window.innerHeight, LX = W * kx, LY = H * ky;
    const b = base();
    keyEl.style.setProperty("--na1-kx", ((kx - b.x) * W).toFixed(1) + "px");
    keyEl.style.setProperty("--na1-ky", ((ky - b.y) * H).toFixed(1) + "px");
    const r = consoleEl.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      const lx = Math.max(-200, Math.min(300, ((LX - r.left) / r.width) * 100));
      const ly = Math.max(-300, Math.min(400, ((LY - r.top) / r.height) * 100));
      consoleEl.style.setProperty("--lx", lx.toFixed(1) + "%");
      consoleEl.style.setProperty("--ly", ly.toFixed(1) + "%");
    }
    if (focusEl) {
      const fr = focusEl.getBoundingClientRect();
      const hair = focusEl.parentElement?.querySelector<HTMLElement>(".na1-hair");
      if (hair && fr.width > 0) hair.style.setProperty("--hx", Math.max(5, Math.min(95, ((LX - fr.left) / fr.width) * 100)).toFixed(0) + "%");
    }
    if (Math.abs(tx - kx) > 0.0004 || Math.abs(ty - ky) > 0.0004) raf = requestAnimationFrame(frame);
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
  const onResize = () => { target(); kick(); };
  const onFocusIn = (e: FocusEvent) => { const el = e.target as HTMLElement; if (el?.matches?.(".na1-input")) { focusEl = el; target(); kick(); } };
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

/* ── canvas + loop helpers ── */
function fullCanvas(host: HTMLElement) {
  const cv = document.createElement("canvas");
  host.appendChild(cv);
  let ctx: CanvasRenderingContext2D | null = null;
  const fit = () => {
    const set = setupHiDpiCanvas(cv, { logicalWidth: window.innerWidth, logicalHeight: window.innerHeight, maxDpr: 1.5 });
    ctx = set ? set.ctx : null;
  };
  fit();
  window.addEventListener("resize", fit);
  return { cv, ctx: () => ctx, destroy: () => { window.removeEventListener("resize", fit); cv.remove(); } };
}

function loop(env: FxEnv, draw: (t: number, dt: number) => void): Idle {
  let raf = 0, last = 0, dead = false;
  const tick = (t: number) => {
    raf = 0;
    if (dead || document.hidden || env.paused()) return;
    draw(t, last ? Math.min(0.05, (t - last) / 1000) : 0.016);
    last = t;
    raf = requestAnimationFrame(tick);
  };
  const kick = () => { if (!dead && !raf && !env.paused()) { last = 0; raf = requestAnimationFrame(tick); } };
  document.addEventListener("visibilitychange", kick);
  kick();
  return {
    kick,
    destroy() { dead = true; document.removeEventListener("visibilitychange", kick); if (raf) cancelAnimationFrame(raf); },
  };
}

const NONE: Idle = { kick: () => {}, destroy: () => {} };

/* Heroes: a warm night sky. Stars twinkle; two slow shooting stars on offset timers. */
export function heroesIdle(host: HTMLElement, env: FxEnv): Idle {
  const c = fullCanvas(host);
  const seed = (n: number) => { let s = n; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
  const rnd = seed(7);
  const stars = Array.from({ length: 170 }, () => ({ x: rnd(), y: rnd(), r: 0.6 + rnd() * 1.4, p: rnd() * Math.PI * 2, s: 0.6 + rnd() * 1.2, warm: rnd() < 0.3 }));
  const streaks = [
    { t: -3, dur: 1.6, every: 9, x0: 0.72, y0: 0.08, dx: -0.34, dy: 0.22 },
    { t: -8, dur: 1.9, every: 13, x0: 0.98, y0: 0.3, dx: -0.3, dy: 0.17 },
  ];
  const drawStatic = () => {
    const ctx = c.ctx(); if (!ctx) return;
    const W = window.innerWidth, H = window.innerHeight; ctx.clearRect(0, 0, W, H);
    for (const s of stars) { ctx.globalAlpha = 0.6; ctx.fillStyle = s.warm ? "#ffd9a6" : "#dfe8ff"; ctx.beginPath(); ctx.arc(s.x * W, s.y * H, s.r, 0, 7); ctx.fill(); }
    ctx.globalAlpha = 1;
  };
  if (env.still) { drawStatic(); return { kick: () => {}, destroy: c.destroy }; }
  let T = 0;
  const l = loop(env, (_t, dt) => {
    const ctx = c.ctx(); if (!ctx) return;
    T += dt; const W = window.innerWidth, H = window.innerHeight; ctx.clearRect(0, 0, W, H);
    for (const s of stars) {
      const a = 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(T * s.s + s.p));
      ctx.globalAlpha = a; ctx.fillStyle = s.warm ? "#ffd9a6" : "#dfe8ff"; ctx.beginPath(); ctx.arc(s.x * W, s.y * H, s.r, 0, 7); ctx.fill();
    }
    for (const k of streaks) {
      k.t += dt; if (k.t > k.every) k.t = 0;
      const p = k.t / k.dur; if (p < 0 || p > 1) continue;
      const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      const x = (k.x0 + k.dx * e) * W, y = (k.y0 + k.dy * e) * H, len = 110 * Math.sin(p * Math.PI);
      const ang = Math.atan2(k.dy * H, k.dx * W);
      const g = ctx.createLinearGradient(x - Math.cos(ang) * len, y - Math.sin(ang) * len, x, y);
      g.addColorStop(0, "rgba(255,236,200,0)"); g.addColorStop(1, "rgba(255,236,200,.85)");
      ctx.globalAlpha = Math.sin(p * Math.PI); ctx.strokeStyle = g; ctx.lineWidth = 1.6; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(x - Math.cos(ang) * len, y - Math.sin(ang) * len); ctx.lineTo(x, y); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  });
  return { kick: l.kick, destroy() { l.destroy(); c.destroy(); } };
}

/* Explorers: the reticle is SVG + CSS (see NightConsole.tsx and the
 * na1ret keyframes); nothing to run. */
export function explorersIdle(): Idle { return NONE; }

/* Ops: a hairline grid (CSS on the host); one pulse travels one line at a time. */
export function opsIdle(host: HTMLElement, env: FxEnv): Idle {
  if (env.still) return NONE;
  const G = 56;
  const c = fullCanvas(host);
  type Pulse = { horiz: boolean; pos: number; dir: number; p: number; dur: number };
  let pulse: Pulse | null = null, wait = 0.4;
  const pick = (): Pulse => {
    const W = window.innerWidth, H = window.innerHeight, ox = (W / 2) % G;
    const horiz = Math.random() < 0.5;
    const n = Math.max(2, horiz ? Math.floor(H / G) : Math.floor(W / G));
    const i = 1 + Math.floor(Math.random() * (n - 1));
    const dir = Math.random() < 0.5 ? 1 : -1;
    return { horiz, pos: horiz ? i * G : ox + i * G, dir, p: 0, dur: 2.2 + Math.random() * 1.2 };
  };
  const l = loop(env, (_t, dt) => {
    const ctx = c.ctx(); if (!ctx) return;
    const W = window.innerWidth, H = window.innerHeight; ctx.clearRect(0, 0, W, H);
    if (!pulse) { wait -= dt; if (wait <= 0) pulse = pick(); return; }
    pulse.p += dt / pulse.dur; if (pulse.p >= 1) { pulse = null; wait = 0.5 + Math.random() * 0.6; return; }
    const e = pulse.p < 0.5 ? 2 * pulse.p * pulse.p : 1 - Math.pow(-2 * pulse.p + 2, 2) / 2;
    const len = 160, L = pulse.horiz ? W : H, head = pulse.dir > 0 ? e * (L + len) : L - e * (L + len);
    const a = Math.sin(pulse.p * Math.PI);
    const g = pulse.horiz ? ctx.createLinearGradient(head - pulse.dir * len, 0, head, 0) : ctx.createLinearGradient(0, head - pulse.dir * len, 0, head);
    g.addColorStop(0, "rgba(201,194,255,0)"); g.addColorStop(1, `rgba(201,194,255,${(0.9 * a).toFixed(3)})`);
    ctx.strokeStyle = g; ctx.lineWidth = 1.2; ctx.beginPath();
    if (pulse.horiz) { ctx.moveTo(head - pulse.dir * len, pulse.pos + 0.5); ctx.lineTo(head, pulse.pos + 0.5); } else { ctx.moveTo(pulse.pos + 0.5, head - pulse.dir * len); ctx.lineTo(pulse.pos + 0.5, head); }
    ctx.stroke();
    ctx.fillStyle = `rgba(226,222,255,${(0.9 * a).toFixed(3)})`; ctx.beginPath();
    if (pulse.horiz) ctx.arc(head, pulse.pos + 0.5, 1.6, 0, 7); else ctx.arc(pulse.pos + 0.5, head, 1.6, 0, 7);
    ctx.fill();
  });
  return { kick: l.kick, destroy() { l.destroy(); c.destroy(); } };
}

/* Pro: the sub types itself once, then holds (the title's cursor keeps
 * blinking). The full sentence sits in the DOM for screen readers from the
 * first frame; this only fills the aria-hidden typed copy. */
export function proIdle(typed: HTMLElement | null, env: FxEnv): Idle {
  if (!typed || env.still) return NONE;
  const text = typed.getAttribute("data-text") || "";
  let i = 0, timer: ReturnType<typeof setTimeout> | undefined, dead = false;
  const step = () => {
    if (dead) return;
    if (env.paused()) { timer = setTimeout(step, 200); return; }
    i++; typed.textContent = text.slice(0, i);
    if (i < text.length) timer = setTimeout(step, 18 + Math.random() * 30); else typed.setAttribute("data-done", "");
  };
  timer = setTimeout(step, 700);
  return { kick: () => {}, destroy() { dead = true; clearTimeout(timer); } };
}
