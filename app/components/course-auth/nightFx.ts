/* Night Console motion: the key light and the eight course idles. Vanilla,
 * imperative, run from one effect in NightShell.tsx. Ported from the lab's
 * a03.js (landing lab round 5, family 03) and r6-auth.js (round 6: Desk
 * Ready, AI Cleared, AI Fluent, Cyber Awareness). Every loop reads
 * `paused()` each frame and stops when the page is hidden; everything
 * returns a cleanup. The round 6 idles lay themselves out in the free zones
 * around the console and relayout when it or the window changes size, so
 * nothing ever moves under the text. */

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
function fullCanvas(host: HTMLElement, onFit?: () => void) {
  const cv = document.createElement("canvas");
  host.appendChild(cv);
  let ctx: CanvasRenderingContext2D | null = null;
  const fit = () => {
    const set = setupHiDpiCanvas(cv, { logicalWidth: window.innerWidth, logicalHeight: window.innerHeight, maxDpr: 1.5 });
    ctx = set ? set.ctx : null;
    onFit?.();
  };
  fit();
  window.addEventListener("resize", fit);
  return { cv, ctx: () => ctx, destroy: () => { window.removeEventListener("resize", fit); cv.remove(); } };
}

function loop(env: FxEnv, draw: (t: number, dt: number) => void, fps = 60): Idle {
  let raf = 0, last = 0, acc = 0, dead = false;
  const tick = (t: number) => {
    raf = 0;
    if (dead || document.hidden || env.paused()) return;
    const dt = last ? Math.min(0.05, (t - last) / 1000) : 0.016;
    last = t;
    if (fps >= 60) draw(t, dt);
    else { acc += dt; if (acc >= 1 / fps) { draw(t, acc); acc = 0; } }
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

/* ── round 6: the idles of the four adult consoles ── */

const DPR = () => Math.min(1.5, window.devicePixelRatio || 1);
const seeded = (n: number) => { let s = n; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
const ease = (p: number) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
type Zone = { x: number; y: number; w: number; h: number };
/* The free zones around the console: motion lives here and never under the text. */
function zones(consoleEl: HTMLElement, pad = 26) {
  const r = consoleEl.getBoundingClientRect(), W = window.innerWidth, H = window.innerHeight;
  const left: Zone = { x: 0, y: 0, w: Math.max(0, r.left - pad), h: H };
  const right: Zone = { x: r.right + pad, y: 0, w: Math.max(0, W - r.right - pad), h: H };
  const top: Zone = { x: 0, y: 0, w: W, h: Math.max(0, r.top - pad) };
  const bottom: Zone = { x: 0, y: r.bottom + pad, w: W, h: Math.max(0, H - r.bottom - pad - 8) };
  return { left, right, top, bottom, r, W, H };
}
function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
/* Relayout when the console changes size (a message appears, a flow swaps its body). */
function watchConsole(consoleEl: HTMLElement, layout: () => void) {
  if (typeof ResizeObserver === "undefined") return () => {};
  let first = true;
  const ro = new ResizeObserver(() => { if (first) { first = false; return; } layout(); });
  ro.observe(consoleEl);
  return () => ro.disconnect();
}

/* Desk Ready: a faint desktop grid (CSS on the host); four soft windows in the
 * margins and a cursor that moves between them, clicking as it lands. The
 * cursor crosses sides only through a corridor under (or above) the console,
 * never through it. */
export function deskIdle(host: HTMLElement, consoleEl: HTMLElement, env: FxEnv): Idle {
  type Win = { x: number; y: number; w: number; h: number; side: number; li: number };
  type Pt = { x: number; y: number };
  let wins: Win[] = [], cur: Pt = { x: 0, y: 0 }, from: Pt = { x: 0, y: 0 }, path: Pt[] = [];
  let seg = 0, segT = 0, segDur = 1.5, dwell = 1.2, active = -1, click = 0, corridor: number | null = null;
  const rnd = seeded(11);
  const lines = Array.from({ length: 4 }, () => Array.from({ length: 5 }, () => 0.4 + rnd() * 0.5));
  function layout() {
    const z = zones(consoleEl, 30);
    wins = [];
    const place = (zone: Zone, n: number, side: number) => {
      if (zone.w < 190 || zone.h < 170) return;
      const w = Math.min(292, zone.w - 40), h = Math.round(w * 0.6);
      if (n === 2 && zone.h > 2 * h + 150) {
        wins.push({ x: zone.x + (zone.w - w) / 2 - w * 0.08, y: zone.y + 76 + (zone.h - 76) * 0.12, w, h, side, li: wins.length % 4 });
        wins.push({ x: zone.x + (zone.w - w) / 2 + w * 0.08, y: zone.y + 76 + (zone.h - 76) * 0.5, w, h, side, li: wins.length % 4 });
      } else wins.push({ x: zone.x + (zone.w - w) / 2, y: zone.y + Math.max(76, (zone.h - h) / 2), w, h, side, li: wins.length % 4 });
    };
    place(z.left, 2, 0); place(z.right, 2, 1);
    if (!wins.length && z.bottom.h >= 140) {
      const w = Math.min(180, (z.bottom.w - 60) / 2), h = Math.round(w * 0.6);
      wins.push({ x: z.W / 2 - w - 12, y: z.bottom.y + 14, w, h, side: 0, li: 0 });
      wins.push({ x: z.W / 2 + 12, y: z.bottom.y + 14, w, h, side: 0, li: 1 });
    }
    corridor = z.bottom.h >= 48 ? z.r.bottom + 26 : z.top.h >= 48 && z.r.top - 26 > 72 ? z.r.top - 26 : null;
    if (wins.length) { active = 0; cur = { x: wins[0].x + wins[0].w * 0.55, y: wins[0].y + wins[0].h * 0.55 }; path = []; seg = 0; }
  }
  let c: ReturnType<typeof fullCanvas> | null = null;
  const relayout = () => { layout(); if (env.still) drawStill(); };
  const cursorPath = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 15); ctx.lineTo(x + 3.6, y + 11.6); ctx.lineTo(x + 6.2, y + 16.4); ctx.lineTo(x + 8.4, y + 15.3); ctx.lineTo(x + 5.8, y + 10.6); ctx.lineTo(x + 10.5, y + 10.4); ctx.closePath();
  };
  function drawWin(ctx: CanvasRenderingContext2D, w: Win, a: number, fill: number) {
    ctx.strokeStyle = `rgba(127,178,255,${a})`; ctx.lineWidth = 1;
    if (fill) { ctx.fillStyle = `rgba(127,178,255,${fill})`; rrect(ctx, w.x, w.y, w.w, w.h, 8); ctx.fill(); }
    rrect(ctx, w.x + 0.5, w.y + 0.5, w.w, w.h, 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w.x, w.y + 24.5); ctx.lineTo(w.x + w.w, w.y + 24.5); ctx.stroke();
    ctx.fillStyle = `rgba(127,178,255,${a})`;
    for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(w.x + 12 + k * 10, w.y + 12.5, 2.4, 0, 7); ctx.fill(); }
    ctx.fillStyle = `rgba(222,236,255,${a * 0.55})`;
    const L = lines[w.li];
    for (let k = 0; k < L.length; k++) { const y = w.y + 44 + k * 18; if (y + 4 > w.y + w.h - 14) break; rrect(ctx, w.x + 16, y, (w.w - 32) * L[k], 4, 2); ctx.fill(); }
    ctx.strokeStyle = `rgba(127,178,255,${a})`; rrect(ctx, w.x + w.w - 74.5, w.y + w.h - 30.5, 58, 18, 5); ctx.stroke();
  }
  const pointIn = (to: Win): Pt => ({ x: to.x + 24 + Math.random() * (to.w - 60), y: to.y + 34 + Math.random() * (to.h - 54) });
  function goTo(j: number, viaCorridor: boolean) {
    const t = pointIn(wins[j]);
    path = viaCorridor && corridor !== null ? [{ x: cur.x, y: corridor }, { x: t.x, y: corridor }, t] : [t];
    active = j; seg = 0; segT = 0; segDur = viaCorridor ? 0.9 : 1.3 + Math.random() * 0.6;
  }
  function nextTarget() {
    if (wins.length < 2) return;
    let j = Math.floor(Math.random() * wins.length);
    if (j === active) j = (j + 1) % wins.length;
    const crossing = !!wins[active] && wins[active].side !== wins[j].side;
    if (crossing && corridor === null) {
      const k = wins.findIndex((w, i) => i !== active && w.side === wins[active].side);
      if (k >= 0) goTo(k, false);
      return;
    }
    goTo(j, crossing);
  }
  function drawStill() {
    const ctx = c?.ctx(); if (!ctx) return;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    wins.forEach((w, i) => drawWin(ctx, w, i === 0 ? 0.3 : 0.14, i === 0 ? 0.04 : 0));
    if (wins[0]) { ctx.fillStyle = "rgba(240,246,255,.9)"; cursorPath(ctx, cur.x, cur.y); ctx.fill(); }
  }
  c = fullCanvas(host, relayout);
  const cv = c;
  const unwatch = watchConsole(consoleEl, relayout);
  if (env.still) {
    drawStill();
    return { kick: () => {}, destroy() { unwatch(); cv.destroy(); } };
  }
  const l = loop(env, (_t, dt) => {
    const ctx = cv.ctx(); if (!ctx) return;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    if (!wins.length) return;
    if (!path.length) {
      dwell -= dt;
      if (dwell <= 0) { nextTarget(); from = { ...cur }; if (!path.length) dwell = 1.6; }
    } else {
      segT += dt / segDur;
      const p = ease(Math.min(1, segT)), to = path[seg];
      cur = { x: from.x + (to.x - from.x) * p, y: from.y + (to.y - from.y) * p };
      if (segT >= 1) { seg++; from = { ...cur }; segT = 0; if (seg >= path.length) { path = []; click = 0.6; dwell = 1.6 + Math.random() * 1.4; } }
    }
    wins.forEach((w, i) => { const on = i === active && !path.length; drawWin(ctx, w, on ? 0.28 : 0.13, on ? 0.035 : 0); });
    if (click > 0) {
      click -= dt;
      const p = 1 - click / 0.6;
      ctx.strokeStyle = `rgba(183,211,255,${(0.6 * (1 - p)).toFixed(3)})`; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(cur.x + 2, cur.y + 2, 4 + 16 * p, 0, 7); ctx.stroke();
    }
    ctx.fillStyle = "rgba(240,246,255,.92)"; ctx.strokeStyle = "rgba(7,11,23,.9)"; ctx.lineWidth = 1.2;
    cursorPath(ctx, cur.x, cur.y); ctx.fill(); ctx.stroke();
  });
  return { kick: l.kick, destroy() { l.destroy(); unwatch(); cv.destroy(); } };
}

/* AI Cleared: two documents in the margins; a slow sweep moves down each page
 * and the blurred (redacted) lines clear behind it, then it sweeps again and
 * redacts them. Pre-rendered, so a frame is a few drawImage calls. 30 fps. */
export function clearedIdle(host: HTMLElement, consoleEl: HTMLElement, env: FxEnv): Idle {
  type Doc = { x: number; y: number; w: number; h: number; red: HTMLCanvasElement; clr: HTMLCanvasElement };
  let docs: Doc[] = [];
  const rnd = seeded(23);
  const widths = Array.from({ length: 60 }, () => 0.5 + rnd() * 0.48), shorts = Array.from({ length: 60 }, () => rnd());
  function build() {
    const z = zones(consoleEl, 34);
    docs = [];
    const mk = (zone: Zone, k: number) => {
      if (zone.w < 200 || zone.h < 150) return;
      const w = Math.min(300, zone.w - 48), top = Math.max(zone.y + 84, zone.y + zone.h * 0.16), h = Math.min(zone.h - (top - zone.y) - 40, 420);
      if (h < 120) return;
      const x = zone.x + (zone.w - w) / 2, lh = 17, n = Math.floor(h / lh), d = DPR();
      const red = document.createElement("canvas"), clr = document.createElement("canvas");
      red.width = clr.width = Math.ceil(w * d); red.height = clr.height = Math.ceil(h * d);
      const rc = red.getContext("2d"), cc = clr.getContext("2d");
      if (!rc || !cc) return;
      rc.scale(d, d); cc.scale(d, d);
      rc.filter = "blur(2.2px)"; rc.fillStyle = "rgba(205,247,255,.17)";
      cc.fillStyle = "rgba(43,189,208,.5)";
      for (let i = 0; i < n; i++) {
        const y = i * lh + 4, para = shorts[(i + k * 7) % 60] < 0.14, ww = para ? w * 0.42 * widths[(i + k * 11) % 60] : w * widths[(i + k * 11) % 60];
        rrect(rc, 0, y, ww, 8, 3); rc.fill();
        rrect(cc, 0, y + 3, ww, 2.2, 1); cc.fill();
        if (!para && shorts[(i + k * 3) % 60] > 0.72) {
          cc.fillStyle = "rgba(127,227,239,.75)";
          const sx = ww * (0.2 + 0.5 * shorts[(i + k * 5) % 60]);
          rrect(cc, sx, y + 2, Math.min(44, ww - sx), 4, 2); cc.fill();
          cc.fillStyle = "rgba(43,189,208,.5)";
        }
      }
      docs.push({ x, y: top, w, h, red, clr });
    };
    mk(z.left, 0); mk(z.right, 1);
    if (!docs.length && z.bottom.h >= 150) mk({ x: 24, y: z.bottom.y - 60, w: z.W - 48, h: z.bottom.h + 60 }, 2);
  }
  const SWEEP = 7, HOLD = 2.4;
  let T = env.still ? SWEEP * 0.55 : 0;
  let c: ReturnType<typeof fullCanvas> | null = null;
  function frame() {
    const ctx = c?.ctx(); if (!ctx) return;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const d0 = DPR(), cycle = (SWEEP + HOLD) * 2, tt = T % cycle, clearing = tt < SWEEP + HOLD, local = clearing ? tt : tt - SWEEP - HOLD, p = Math.min(1, local / SWEEP);
    for (const d of docs) {
      const sy = d.h * p, band = 26;
      const top = clearing ? d.clr : d.red, bot = clearing ? d.red : d.clr;
      const draw = (img: HTMLCanvasElement, y0: number, y1: number) => { if (y1 - y0 <= 0) return; ctx.drawImage(img, 0, y0 * d0, img.width, (y1 - y0) * d0, d.x, d.y + y0, d.w, y1 - y0); };
      draw(top, 0, sy); draw(bot, sy, d.h);
      if (p < 1 && local < SWEEP) {
        ctx.globalAlpha = 0.5; draw(bot, Math.max(0, sy - band), sy); ctx.globalAlpha = 1;
        const g = ctx.createLinearGradient(d.x, 0, d.x + d.w, 0);
        g.addColorStop(0, "rgba(43,189,208,0)"); g.addColorStop(0.5, "rgba(127,227,239,.9)"); g.addColorStop(1, "rgba(43,189,208,0)");
        ctx.strokeStyle = g; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(d.x, d.y + sy + 0.5); ctx.lineTo(d.x + d.w, d.y + sy + 0.5); ctx.stroke();
        const gl = ctx.createLinearGradient(0, d.y + sy - 18, 0, d.y + sy);
        gl.addColorStop(0, "rgba(43,189,208,0)"); gl.addColorStop(1, "rgba(43,189,208,.12)"); ctx.fillStyle = gl; ctx.fillRect(d.x, d.y + sy - 18, d.w, 18);
      }
      /* a small cleared stamp at the top right once the page is clear */
      if (clearing && p >= 1) {
        ctx.strokeStyle = "rgba(127,227,239,.55)"; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.arc(d.x + d.w - 12, d.y - 16, 7, 0, 7); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(d.x + d.w - 15.5, d.y - 16); ctx.lineTo(d.x + d.w - 13, d.y - 13.4); ctx.lineTo(d.x + d.w - 8.5, d.y - 18.6); ctx.stroke();
      }
    }
  }
  /* the still frame redraws after every relayout; the loop redraws anyway */
  const relayout = () => { build(); if (env.still) frame(); };
  c = fullCanvas(host, relayout);
  const cv = c;
  const unwatch = watchConsole(consoleEl, relayout);
  if (env.still) {
    frame();
    return { kick: () => {}, destroy() { unwatch(); cv.destroy(); } };
  }
  const l = loop(env, (_t, dt) => { T += dt; frame(); }, 30);
  return { kick: l.kick, destroy() { l.destroy(); unwatch(); cv.destroy(); } };
}

/* AI Fluent: a prompt line types itself in the margin and an answer block
 * fades in under it; after a beat both fade and the next prompt starts. The
 * loop ring turns slowly on the other side (CSS). DOM text, aria-hidden (the
 * host is), state on data attributes. */
const FLUENT_PROMPTS = [
  "summarise this thread in three lines",
  "draft a polite reply, firm on the date",
  "turn these notes into an agenda",
  "rewrite this for a customer, plain English",
  "pull the numbers from this table into a list",
];
export function fluentIdle(host: HTMLElement, consoleEl: HTMLElement, env: FxEnv): Idle {
  const box = document.createElement("div");
  box.className = "na1-fl";
  box.innerHTML = '<div class="na1-fl-p"><span class="pr">&gt;</span> <span class="t"></span><i class="c"></i></div><div class="na1-fl-a"><i style="--w:92%"></i><i style="--w:71%"></i><i style="--w:84%"></i><i style="--w:38%"></i></div>';
  const ring = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  ring.setAttribute("class", "na1-loop");
  ring.setAttribute("viewBox", "0 0 120 120");
  ring.innerHTML = '<g fill="none" stroke="rgba(139,123,255,.55)" stroke-width="1.6" stroke-linecap="round"><path class="na1-loop-a" d="M60 14 a46 46 0 1 1 -32.5 13.5"/><path d="M60 14 l-9 -7 M60 14 l-9 7"/><circle cx="60" cy="60" r="30" stroke="rgba(139,123,255,.25)" stroke-dasharray="2 10"/></g>';
  host.appendChild(box);
  host.appendChild(ring);
  const t = box.querySelector(".t") as HTMLElement;
  function layout() {
    const z = zones(consoleEl, 34);
    const put = (el: HTMLElement | SVGElement, zone: Zone, w: number, dy: number) => {
      el.style.width = w + "px"; el.style.left = Math.round(zone.x + (zone.w - w) / 2) + "px"; el.style.top = Math.round(zone.y + dy) + "px"; el.style.display = "";
    };
    if (z.right.w >= 240 && z.left.w >= 240) {
      put(box, z.right, Math.min(300, z.right.w - 48), Math.max(96, z.H * 0.2));
      put(ring, z.left, Math.min(200, z.left.w - 80), Math.max(90, (z.H - 200) / 2));
    } else if (z.bottom.h >= 150) {
      put(box, { x: 24, y: z.bottom.y, w: z.W - 48, h: z.bottom.h }, z.W - 48, 10);
      ring.style.display = "none";
    } else { box.style.display = "none"; ring.style.display = "none"; }
  }
  layout();
  window.addEventListener("resize", layout);
  const unwatch = watchConsole(consoleEl, layout);
  const cleanup = () => { window.removeEventListener("resize", layout); unwatch(); box.remove(); ring.remove(); };
  if (env.still) {
    t.textContent = FLUENT_PROMPTS[0];
    box.setAttribute("data-in", "1");
    box.setAttribute("data-done", "");
    return { kick: () => {}, destroy: cleanup };
  }
  let i = 0, dead = false;
  const timers = new Set<ReturnType<typeof setTimeout>>();
  const later = (fn: () => void, ms: number) => { const id = setTimeout(() => { timers.delete(id); if (!dead) fn(); }, ms); timers.add(id); };
  function run() {
    const text = FLUENT_PROMPTS[i % FLUENT_PROMPTS.length];
    i++;
    let n = 0;
    box.removeAttribute("data-done"); box.setAttribute("data-in", "typing"); t.textContent = "";
    const type = () => {
      if (env.paused()) { later(type, 200); return; }
      n++; t.textContent = text.slice(0, n);
      if (n < text.length) later(type, 28 + Math.random() * 34);
      else later(() => { box.setAttribute("data-done", ""); box.setAttribute("data-in", "1"); later(() => { box.setAttribute("data-in", "0"); later(run, 900); }, 3400); }, 420);
    };
    later(type, 600);
  }
  later(run, 900);
  return { kick: () => {}, destroy() { dead = true; timers.forEach(clearTimeout); timers.clear(); cleanup(); } };
}

/* Cyber Awareness: a slow radar in the margin whose arm lights the dots it
 * passes; a few are flagged pink and keep a ring. On the other side an
 * envelope gets flagged every few seconds. 30 fps. */
export function awarenessIdle(host: HTMLElement, consoleEl: HTMLElement, env: FxEnv): Idle {
  const rnd = seeded(31);
  const dots = Array.from({ length: 16 }, (_, i) => ({ a: rnd() * Math.PI * 2, r: 0.25 + rnd() * 0.68, lit: 0, flag: i % 5 === 1 }));
  let radar: { cx: number; cy: number; R: number } | null = null, envl: { x: number; y: number } | null = null;
  let arm = env.still ? 0.8 : 0, envT = 2.5, flagA = 0;
  function layout() {
    const z = zones(consoleEl, 34);
    radar = envl = null;
    const big = z.left.w >= z.right.w ? z.left : z.right, other = big === z.left ? z.right : z.left;
    if (big.w >= 220 && big.h >= 260) { const R = Math.min(230, Math.min(big.w - 60, big.h - 140) * 0.42); radar = { cx: big.x + big.w / 2, cy: big.y + 80 + (big.h - 80) / 2, R }; }
    else if (z.bottom.h >= 150) { const R = Math.min(110, (z.bottom.h - 24) / 2); radar = { cx: z.W / 2, cy: z.bottom.y + z.bottom.h / 2, R }; }
    if (other.w >= 180 && other.h >= 200) envl = { x: other.x + other.w / 2, y: other.y + 80 + (other.h - 80) * 0.42 };
  }
  let c: ReturnType<typeof fullCanvas> | null = null;
  function frame(dt: number) {
    const ctx = c?.ctx(); if (!ctx) return;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    if (radar) {
      const { cx, cy, R } = radar;
      ctx.strokeStyle = "rgba(255,224,242,.1)"; ctx.lineWidth = 1;
      for (const f of [0.34, 0.67, 1]) { ctx.beginPath(); ctx.arc(cx, cy, R * f, 0, 7); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy); ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R); ctx.stroke();
      if (!env.still) arm += dt * ((Math.PI * 2) / 14);
      if (typeof ctx.createConicGradient === "function") {
        const g = ctx.createConicGradient(arm - 1.1, cx, cy);
        g.addColorStop(0, "rgba(240,106,184,0)"); g.addColorStop(0.17, "rgba(240,106,184,.22)"); g.addColorStop(0.1751, "rgba(240,106,184,0)"); g.addColorStop(1, "rgba(240,106,184,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, arm - 1.1, arm + 0.02); ctx.closePath(); ctx.fill();
      }
      ctx.strokeStyle = "rgba(255,166,216,.85)"; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(arm) * R, cy + Math.sin(arm) * R); ctx.stroke();
      for (const d of dots) {
        const da = (((arm - d.a) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        if (da < 0.06) d.lit = 1;
        else if (env.still && da < 2.4) d.lit = 1 - da / 2.4;
        else d.lit = Math.max(0, d.lit - dt * 0.35);
        const x = cx + Math.cos(d.a) * d.r * R, y = cy + Math.sin(d.a) * d.r * R;
        ctx.fillStyle = d.flag ? `rgba(240,106,184,${(0.35 + 0.65 * d.lit).toFixed(3)})` : `rgba(255,224,242,${(0.14 + 0.7 * d.lit).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(x, y, d.flag ? 3 : 2.2, 0, 7); ctx.fill();
        if (d.flag) {
          ctx.strokeStyle = `rgba(240,106,184,${(0.25 + 0.5 * d.lit).toFixed(3)})`; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(x, y, 7 + 2 * d.lit, 0, 7); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x + 9, y - 9); ctx.lineTo(x + 9, y - 1); ctx.moveTo(x + 9, y - 9); ctx.lineTo(x + 15, y - 7); ctx.lineTo(x + 9, y - 5); ctx.stroke();
        }
      }
    }
    if (envl) {
      const { x, y } = envl, w = 64, h = 44;
      if (!env.still) { envT -= dt; if (envT <= -3.2) envT = 5.5; flagA = envT <= 0 ? Math.min(1, flagA + dt * 3) : Math.max(0, flagA - dt * 2); } else flagA = 1;
      ctx.strokeStyle = "rgba(255,224,242,.26)"; ctx.lineWidth = 1.3; rrect(ctx, x - w / 2, y - h / 2, w, h, 6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - w / 2, y - h / 2 + 2); ctx.lineTo(x, y + 4); ctx.lineTo(x + w / 2, y - h / 2 + 2); ctx.stroke();
      if (flagA > 0) {
        const p = flagA, fx = x + w / 2 - 2, fy = y - h / 2 + 2;
        ctx.strokeStyle = `rgba(240,106,184,${(0.5 * (1 - p)).toFixed(3)})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(fx, fy, 10 + 18 * p, 0, 7); ctx.stroke();
        ctx.fillStyle = `rgba(240,106,184,${p.toFixed(3)})`; ctx.beginPath(); ctx.arc(fx, fy, 10, 0, 7); ctx.fill();
        ctx.strokeStyle = `rgba(43,6,25,${p.toFixed(3)})`; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.moveTo(fx - 3, fy - 5); ctx.lineTo(fx - 3, fy + 5); ctx.moveTo(fx - 3, fy - 5); ctx.lineTo(fx + 4, fy - 3); ctx.lineTo(fx - 3, fy - 1); ctx.stroke();
        ctx.fillStyle = `rgba(240,106,184,${(0.9 * p).toFixed(3)})`; ctx.font = "700 10px 'JetBrains Mono', ui-monospace, monospace"; ctx.textAlign = "center";
        ctx.fillText("FLAGGED", x, y + h / 2 + 18);
      }
    }
  }
  const relayout = () => { layout(); if (env.still) frame(0); };
  c = fullCanvas(host, relayout);
  const cv = c;
  const unwatch = watchConsole(consoleEl, relayout);
  if (env.still) {
    frame(0);
    return { kick: () => {}, destroy() { unwatch(); cv.destroy(); } };
  }
  const l = loop(env, (_t, dt) => frame(dt), 30);
  return { kick: l.kick, destroy() { l.destroy(); unwatch(); cv.destroy(); } };
}
