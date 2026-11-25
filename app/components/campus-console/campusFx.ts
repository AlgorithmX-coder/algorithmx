/* Campus Console backdrops (landing lab round 6, family schools, v1): the UK
 * globe for the school pages and the office pulse for the firm pages.
 * Vanilla, imperative, run from one effect in CampusShell.tsx. 30 fps, DPR
 * capped at 1.5 through setupHiDpiCanvas, stopped when the tab is hidden or
 * Pause is pressed, one still frame under reduced motion. */

import { setupHiDpiCanvas } from "@/app/lib/gameEngine/canvas";
import { LAND, UK } from "@/app/schools/SchoolsGlobe";

export interface FxEnv { paused: () => boolean; still: boolean }
export interface Backdrop { kick: () => void; destroy: () => void }

function fullCanvas(host: HTMLElement, onFit?: () => void) {
  const cv = document.createElement("canvas");
  host.appendChild(cv);
  let ctx: CanvasRenderingContext2D | null = null;
  /* onFit runs on resize only: the callers draw their own first frame once the handle exists */
  const fit = (resized = true) => {
    const set = setupHiDpiCanvas(cv, { logicalWidth: window.innerWidth, logicalHeight: window.innerHeight, maxDpr: 1.5 });
    ctx = set ? set.ctx : null;
    if (resized) onFit?.();
  };
  fit(false);
  const onResize = () => fit();
  window.addEventListener("resize", onResize);
  return { ctx: () => ctx, destroy: () => { window.removeEventListener("resize", onResize); cv.remove(); } };
}

function loop(env: FxEnv, draw: (dt: number) => void, fps = 30): Backdrop {
  let raf = 0, last = 0, acc = 0, dead = false;
  const step = 1 / fps;
  const tick = (t: number) => {
    raf = 0;
    if (dead || document.hidden || env.paused()) return;
    const dt = last ? Math.min(0.1, (t - last) / 1000) : step;
    last = t; acc += dt;
    if (acc >= step) { draw(acc); acc = 0; }
    raf = requestAnimationFrame(tick);
  };
  const kick = () => { if (!dead && !raf && !env.paused()) { last = 0; raf = requestAnimationFrame(tick); } };
  document.addEventListener("visibilitychange", kick);
  kick();
  return { kick, destroy() { dead = true; document.removeEventListener("visibilitychange", kick); if (raf) cancelAnimationFrame(raf); } };
}

/* THE UK GLOBE: a dotted Earth rising at the bottom right, Britain gold,
 * five great-circle routes out of London. Dots are batched per shade bucket
 * (one path per bucket), as the live SchoolsGlobe does. Dots that fall under
 * the console drop three shades so nothing competes with the text. */
export function campusGlobe(host: HTMLElement, consoleEl: HTMLElement, env: FxEnv): Backdrop {
  const D2R = Math.PI / 180;
  const rings = LAND.map((r) => {
    let a = 90, b = -90, c = 180, d = -180;
    for (const [la, lo] of r) { a = Math.min(a, la); b = Math.max(b, la); c = Math.min(c, lo); d = Math.max(d, lo); }
    return { r, bb: [a, b, c, d] };
  });
  const inRing = (la: number, lo: number, r: number[][]) => {
    let inside = false;
    for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
      const [yi, xi] = r[i], [yj, xj] = r[j];
      if (yi > la !== yj > la && lo < ((xj - xi) * (la - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  };
  const ukbb = (() => { let a = 90, b = -90, c = 180, d = -180; for (const [la, lo] of UK) { a = Math.min(a, la); b = Math.max(b, la); c = Math.min(c, lo); d = Math.max(d, lo); } return [a, b, c, d]; })();
  const inUK = (la: number, lo: number) => la >= ukbb[0] && la <= ukbb[1] && lo >= ukbb[2] && lo <= ukbb[3] && inRing(la, lo, UK);
  const onLand = (la: number, lo: number) => {
    for (const { r, bb } of rings) { if (la < bb[0] || la > bb[1] || lo < bb[2] || lo > bb[3]) continue; if (inRing(la, lo, r)) return true; }
    return false;
  };
  const phone = window.innerWidth < 640;
  const stepDeg = phone ? 3.4 : 2.4;
  const land: number[] = [], uk: number[] = [];
  for (let la = -56; la <= 84; la += stepDeg) {
    const n = Math.max(1, Math.round((360 * Math.cos(la * D2R)) / stepDeg)), off = (Math.round(la / stepDeg) % 2) * 0.5;
    for (let i = 0; i < n; i++) { const lo = -180 + ((i + off) * 360) / n; if (inUK(la, lo)) continue; if (onLand(la, lo)) land.push(la * D2R, lo * D2R); }
  }
  for (let la = ukbb[0]; la <= ukbb[1]; la += 0.6) for (let lo = ukbb[2]; lo <= ukbb[3]; lo += 0.6 / Math.cos(la * D2R)) if (inUK(la, lo)) uk.push(la * D2R, lo * D2R);
  type V3 = [number, number, number];
  const LONDON: [number, number] = [51.5, -0.12];
  const CITIES: [number, number][] = [[25.2, 55.3], [40.7, -74], [1.35, 103.8], [-33.9, 151.2], [-1.3, 36.8]];
  const vec = ([la, lo]: [number, number]): V3 => { const a = la * D2R, b = lo * D2R; return [Math.cos(a) * Math.cos(b), Math.sin(a), Math.cos(a) * Math.sin(b)]; };
  const slerp = (p: V3, q: V3, t: number): V3 => {
    const d = Math.acos(Math.max(-1, Math.min(1, p[0] * q[0] + p[1] * q[1] + p[2] * q[2])));
    const s = Math.sin(d), a = Math.sin((1 - t) * d) / s, b = Math.sin(t * d) / s, lift = 1 + 0.22 * Math.sin(Math.PI * t);
    return [(a * p[0] + b * q[0]) * lift, (a * p[1] + b * q[1]) * lift, (a * p[2] + b * q[2]) * lift];
  };
  const arcs = CITIES.map((cty, n) => { const pts: V3[] = []; const A = vec(LONDON), B = vec(cty); for (let i = 0; i <= 40; i++) pts.push(slerp(A, B, i / 40)); return { pts, t: -n * 4.5, dur: 7 + n * 1.3, every: 26 }; });
  const TILT = 22 * D2R, cT = Math.cos(TILT), sT = Math.sin(TILT);
  const bucketsLand: number[][] = Array.from({ length: 6 }, () => []), bucketsUK: number[] = [];
  let rect: DOMRect | null = null;
  const measure = () => { rect = consoleEl.getBoundingClientRect(); };
  measure();
  const late = window.setTimeout(measure, 1200);
  let ro: ResizeObserver | null = null;
  if (typeof ResizeObserver !== "undefined") { ro = new ResizeObserver(measure); ro.observe(consoleEl); }

  let T = 0;
  function draw() {
    const ctx = c.ctx(); if (!ctx) return;
    const W = window.innerWidth, H = window.innerHeight;
    ctx.clearRect(0, 0, W, H);
    const cx = phone ? W * 0.5 : W * 0.82, cy = phone ? H * 1.08 : H * 1.02, Rr = phone ? W * 0.72 : Math.min(H * 0.66, W * 0.42);
    /* the globe sways around Britain (26 degrees either way, 40 s) rather than spinning */
    const rot = 80 * D2R + 0.12 + 0.45 * Math.sin((T / 40) * Math.PI * 2);
    const cR = Math.cos(rot), sR = Math.sin(rot);
    const k0 = phone ? 0.42 : 1;
    const g = ctx.createRadialGradient(cx - Rr * 0.35, cy - Rr * 0.45, Rr * 0.1, cx, cy, Rr);
    g.addColorStop(0, `rgba(40,70,140,${0.42 * k0})`); g.addColorStop(0.7, `rgba(14,28,70,${0.5 * k0})`); g.addColorStop(1, `rgba(8,16,40,${0.7 * k0})`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, Rr, 0, 7); ctx.fill();
    ctx.strokeStyle = `rgba(62,230,214,${0.28 * k0})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, Rr + 1, 0, 7); ctx.stroke();
    const halo = ctx.createRadialGradient(cx, cy, Rr, cx, cy, Rr * 1.12);
    halo.addColorStop(0, `rgba(62,230,214,${0.16 * k0})`); halo.addColorStop(1, "rgba(62,230,214,0)");
    ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(cx, cy, Rr * 1.12, 0, 7); ctx.fill();
    ctx.strokeStyle = `rgba(120,160,255,${0.08 * k0})`; ctx.lineWidth = 0.8;
    for (let la = -60; la <= 60; la += 30) { const r = Math.cos(la * D2R), y = Math.sin(la * D2R); ctx.beginPath(); ctx.ellipse(cx, cy - y * cT * Rr, r * Rr, Math.abs(r * sT * Rr) + 0.01, 0, 0, 7); ctx.stroke(); }
    for (const b of bucketsLand) b.length = 0;
    bucketsUK.length = 0;
    const place = (la: number, lo: number, out: (x: number, y: number, k: number) => void) => {
      const ca = Math.cos(la), x = ca * Math.cos(lo + rot), y = Math.sin(la), z = ca * Math.sin(lo + rot);
      const y2 = y * cT - z * sT, z2 = y * sT + z * cT; if (z2 < 0.02) return;
      const sx = cx + x * Rr, sy = cy - y2 * Rr; if (sy > H + 4 || sx < -4 || sx > W + 4) return;
      const light = Math.max(0, -x * 0.55 + y2 * 0.5 + z2 * 0.75) * z2;
      let k = Math.min(5, Math.floor(light * 7));
      if (rect && sx > rect.left - 30 && sx < rect.right + 30 && sy > rect.top - 30 && sy < rect.bottom + 30) k = Math.max(0, k - 3);
      out(sx, sy, k);
    };
    for (let i = 0; i < land.length; i += 2) place(land[i], land[i + 1], (x, y, k) => bucketsLand[k].push(x, y));
    for (let i = 0; i < uk.length; i += 2) place(uk[i], uk[i + 1], (x, y, k) => bucketsUK.push(x, y, k));
    const dotR = phone ? 1.3 : 1.5;
    bucketsLand.forEach((b, k) => {
      if (!b.length) return;
      ctx.globalAlpha = (0.2 + k * 0.13) * k0; ctx.fillStyle = "rgb(140,196,255)"; ctx.beginPath();
      for (let i = 0; i < b.length; i += 2) { ctx.moveTo(b[i] + dotR, b[i + 1]); ctx.arc(b[i], b[i + 1], dotR, 0, 7); }
      ctx.fill();
    });
    if (bucketsUK.length) {
      ctx.globalAlpha = 0.95 * k0; ctx.fillStyle = "rgb(240,180,41)"; ctx.shadowColor = "rgba(240,180,41,.9)"; ctx.shadowBlur = 6; ctx.beginPath();
      for (let i = 0; i < bucketsUK.length; i += 3) { ctx.moveTo(bucketsUK[i] + dotR + 0.3, bucketsUK[i + 1]); ctx.arc(bucketsUK[i], bucketsUK[i + 1], dotR + 0.3, 0, 7); }
      ctx.fill(); ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1; ctx.lineCap = "round";
    for (const a of arcs) {
      const proj = a.pts.map(([x0, y0, z0]) => { const x = x0 * cR - z0 * sR, z = x0 * sR + z0 * cR, y = y0; const y2 = y * cT - z * sT, z2 = y * sT + z * cT; return [cx + x * Rr, cy - y2 * Rr, z2]; });
      const seg = (from: number, to: number, style: string, w: number) => {
        ctx.strokeStyle = style; ctx.lineWidth = w; ctx.beginPath(); let pen = false;
        for (let i = from; i <= to; i++) { const [x, y, z] = proj[i]; if (z < -0.05) { pen = false; continue; } if (!pen) { ctx.moveTo(x, y); pen = true; } else ctx.lineTo(x, y); }
        ctx.stroke();
      };
      seg(0, 40, `rgba(62,230,214,${0.14 * k0})`, 1);
      const p = a.t / a.dur;
      if (p >= 0 && p <= 1) {
        const head = Math.floor(p * 40), tail = Math.max(0, head - 12);
        seg(tail, head, `rgba(240,180,41,${0.85 * k0})`, 1.6);
        const [hx, hy, hz] = proj[head];
        if (hz > 0) { ctx.fillStyle = `rgba(255,236,200,${0.95 * k0})`; ctx.beginPath(); ctx.arc(hx, hy, 2.2, 0, 7); ctx.fill(); }
      }
      if (p > 1 && p < 1.4) {
        const [hx, hy, hz] = proj[40];
        if (hz > 0) { const e = (p - 1) / 0.4; ctx.strokeStyle = `rgba(62,230,214,${(1 - e) * 0.8 * k0})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(hx, hy, 3 + e * 14, 0, 7); ctx.stroke(); }
      }
    }
    const lon = vec(LONDON);
    const lx = lon[0] * cR - lon[2] * sR, lz = lon[0] * sR + lon[2] * cR, ly = lon[1];
    const ly2 = ly * cT - lz * sT, lz2 = ly * sT + lz * cT;
    if (lz2 > 0) {
      const px = cx + lx * Rr, py = cy - ly2 * Rr, ph = (T % 2.4) / 2.4;
      ctx.strokeStyle = `rgba(240,180,41,${(1 - ph) * 0.9 * k0})`; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(px, py, 3 + ph * 16, 0, 7); ctx.stroke();
      ctx.fillStyle = `rgba(255,236,200,${k0})`; ctx.beginPath(); ctx.arc(px, py, 2.4, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  const c = fullCanvas(host, () => { if (env.still) draw(); });
  const cleanup = () => { window.clearTimeout(late); ro?.disconnect(); c.destroy(); };
  if (env.still) {
    for (const a of arcs) a.t = a.dur * 0.6;
    T = 18; draw();
    return { kick: () => {}, destroy: cleanup };
  }
  const l = loop(env, (dt) => { T += dt; for (const a of arcs) { a.t += dt; if (a.t > a.every) a.t = -Math.random() * 3; } draw(); });
  return { kick: l.kick, destroy() { l.destroy(); cleanup(); } };
}

/* THE OFFICE: for the firm, a faint field of points on the grid
 * intersections breathing in a slow wave, and one blue pulse travelling a
 * grid line at a time. */
export function officePulse(host: HTMLElement, env: FxEnv): Backdrop {
  const G = 64;
  type Pulse = { horiz: boolean; pos: number; dir: number; p: number; dur: number };
  let pulse: Pulse | null = null, wait = 0.6, T = 0;
  const pick = (): Pulse => {
    const W = window.innerWidth, H = window.innerHeight, horiz = Math.random() < 0.5;
    const n = Math.max(2, horiz ? Math.floor(H / G) : Math.floor(W / G)), i = 1 + Math.floor(Math.random() * (n - 1)), dir = Math.random() < 0.5 ? 1 : -1;
    return { horiz, pos: horiz ? i * G : ((W / 2) % G) + i * G, dir, p: 0, dur: 2.4 + Math.random() * 1.4 };
  };
  const points = (ctx: CanvasRenderingContext2D) => {
    const W = window.innerWidth, H = window.innerHeight;
    ctx.fillStyle = "rgb(126,166,255)"; ctx.beginPath();
    for (let y = G; y < H; y += G) for (let x = (W / 2) % G; x < W; x += G) { const a = 0.5 + 0.5 * Math.sin(T * 0.6 + x * 0.012 + y * 0.009); ctx.moveTo(x + 1.2, y); ctx.arc(x, y, 1.2 + a * 0.6, 0, 7); }
    ctx.globalAlpha = 0.22; ctx.fill(); ctx.globalAlpha = 1;
  };
  const c = fullCanvas(host, () => { const ctx = c.ctx(); if (env.still && ctx) points(ctx); });
  if (env.still) { const ctx = c.ctx(); if (ctx) points(ctx); return { kick: () => {}, destroy: c.destroy }; }
  const l = loop(env, (dt) => {
    const ctx = c.ctx(); if (!ctx) return;
    T += dt;
    const W = window.innerWidth, H = window.innerHeight;
    ctx.clearRect(0, 0, W, H); points(ctx);
    if (!pulse) { wait -= dt; if (wait <= 0) pulse = pick(); return; }
    pulse.p += dt / pulse.dur;
    if (pulse.p >= 1) { pulse = null; wait = 0.6 + Math.random() * 0.8; return; }
    const e = pulse.p < 0.5 ? 2 * pulse.p * pulse.p : 1 - Math.pow(-2 * pulse.p + 2, 2) / 2;
    const len = 180, Ln = pulse.horiz ? W : H, head = pulse.dir > 0 ? e * (Ln + len) : Ln - e * (Ln + len), a = Math.sin(pulse.p * Math.PI);
    const g = pulse.horiz ? ctx.createLinearGradient(head - pulse.dir * len, 0, head, 0) : ctx.createLinearGradient(0, head - pulse.dir * len, 0, head);
    g.addColorStop(0, "rgba(185,205,255,0)"); g.addColorStop(1, `rgba(185,205,255,${(0.85 * a).toFixed(3)})`);
    ctx.strokeStyle = g; ctx.lineWidth = 1.2; ctx.beginPath();
    if (pulse.horiz) { ctx.moveTo(head - pulse.dir * len, pulse.pos + 0.5); ctx.lineTo(head, pulse.pos + 0.5); } else { ctx.moveTo(pulse.pos + 0.5, head - pulse.dir * len); ctx.lineTo(pulse.pos + 0.5, head); }
    ctx.stroke();
    ctx.fillStyle = `rgba(226,232,250,${(0.9 * a).toFixed(3)})`; ctx.beginPath();
    if (pulse.horiz) ctx.arc(head, pulse.pos + 0.5, 1.8, 0, 7); else ctx.arc(pulse.pos + 0.5, head, 1.8, 0, 7);
    ctx.fill();
  });
  return { kick: l.kick, destroy() { l.destroy(); c.destroy(); } };
}
