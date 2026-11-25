"use client";

import { useEffect, useRef } from "react";
import { AXO } from "./content";
import { reduced } from "./fx";

/* The holographic accent: "Do the real work." is drawn from coloured points
 * (violet to magenta), sampled from an offscreen canvas in the page's own
 * font, that fly in and settle into the crisp gradient type. The real text
 * stays in the DOM for reading and assistive tech (the accent span fades in
 * as the points settle, data-on; under prefers-reduced-motion it simply
 * shows, data-still).
 *
 * Signature interaction: the pointer near the words pushes the points away
 * and re-lights them; they flow back into the letters. `motion` (the Pause
 * button) gates the interaction and the idle sparkle, never the one-time
 * construction. Ported from landing-lab/o01.html. */

const PAD = 70;
const STOPS = [[87, 68, 201], [124, 92, 255], [224, 31, 184]];
const NB = 22;

interface Pt { x: number; y: number; vx: number; vy: number; j: number; s: number; tx: number; ty: number; c: number }

export default function OpsHeadline({ motion }: { motion: boolean }) {
  const hwrapRef = useRef<HTMLDivElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const accRef = useRef<HTMLSpanElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const motionRef = useRef(motion);
  const startRef = useRef<() => void>(() => {});
  /* Pause stops the loop once the words have settled; Play restarts it */
  useEffect(() => { motionRef.current = motion; startRef.current(); }, [motion]);

  useEffect(() => {
    const cv = cvRef.current, hwrap = hwrapRef.current, h1 = h1Ref.current, acc = accRef.current;
    if (!cv || !hwrap || !h1 || !acc) return;
    const hero = cv.closest<HTMLElement>(".hero") || hwrap;
    if (reduced()) { acc.setAttribute("data-still", ""); return; }
    const ctx = cv.getContext("2d", { alpha: true });
    if (!ctx) { acc.setAttribute("data-still", ""); return; }
    const palette: string[] = [];
    for (let b = 0; b < NB; b++) { const t = (b / (NB - 1)) * (STOPS.length - 1), i = Math.min(STOPS.length - 2, Math.floor(t)), f = t - i; palette.push(`rgb(${STOPS[i].map((v, k) => Math.round(v + (STOPS[i + 1][k] - v) * f)).join(",")})`); }
    const SPK = palette.length; palette.push("#ffffff");
    let W = 0, Hh = 0, pts: Pt[] = [], raf = 0, last = 0, t0 = 0, built = false, vis = true, center = { x: 0, y: 0 }, still = 0;
    const ptr = { x: -1e4, y: -1e4 };
    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const wordRects = (node: HTMLElement) => {
      const tn = node.firstChild, out: { w: string; r: DOMRect }[] = [];
      if (!tn || tn.nodeType !== 3) return out;
      const text = tn.textContent || "", re = /\S+/g; let m: RegExpExecArray | null;
      while ((m = re.exec(text))) { const r = document.createRange(); r.setStart(tn, m.index); r.setEnd(tn, m.index + m[0].length); out.push({ w: m[0], r: r.getBoundingClientRect() }); }
      return out;
    };
    function build() {
      const hr = hwrap!.getBoundingClientRect(); W = Math.round(hr.width + PAD * 2); Hh = Math.round(hr.height + PAD * 2);
      /* DPR capped at 1.5: the points are tiny squares, more pixels buy nothing */
      const dpr = Math.min(1.5, window.devicePixelRatio || 1); cv!.width = Math.round(W * dpr); cv!.height = Math.round(Hh * dpr); ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const ox = hr.left - PAD, oy = hr.top - PAD, cs = getComputedStyle(h1!);
      const oc = document.createElement("canvas"); oc.width = W; oc.height = Hh; const o = oc.getContext("2d"); if (!o) return;
      /* the computed font-family has the real family names in it; never a var() */
      o.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      if ("letterSpacing" in o) (o as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = cs.letterSpacing;
      o.textBaseline = "alphabetic"; o.fillStyle = "#000";
      const asc = o.measureText("H").fontBoundingBoxAscent || parseFloat(cs.fontSize) * 0.78;
      const wr = wordRects(acc!); if (!wr.length) return;
      let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
      wr.forEach(({ w, r }) => { const x = r.left - ox, y = r.top - oy; o.fillText(w, x, y + asc); minX = Math.min(minX, x); maxX = Math.max(maxX, x + r.width); minY = Math.min(minY, y); maxY = Math.max(maxY, y + r.height); });
      const img = o.getImageData(0, 0, W, Hh).data; let step = 3, list: [number, number][] = [];
      for (let tries = 0; tries < 3; tries++) { list = []; for (let y = 0; y < Hh; y += step) for (let x = 0; x < W; x += step) { if (img[((y | 0) * W + (x | 0)) * 4 + 3] > 110) list.push([x, y]); } if (list.length <= 1900) break; step += 0.5; }
      center = { x: (minX + maxX) / 2, y: (minY + maxY) / 2 }; const span = Math.max(1, maxX - minX), prev = pts;
      pts = list.map((t, i) => {
        const p: Pt = prev[i] || { x: 0, y: 0, vx: 0, vy: 0, j: Math.random() * Math.PI * 2, s: Math.random() < 0.22 ? 2.6 : 1.9, tx: 0, ty: 0, c: 0 };
        p.tx = t[0] + rand(-0.4, 0.4); p.ty = t[1] + rand(-0.4, 0.4); p.c = Math.max(0, Math.min(NB - 1, Math.round(((t[0] - minX) / span) * (NB - 1))));
        if (!prev[i]) { const a = Math.atan2(p.ty - center.y, p.tx - center.x) + rand(-0.7, 0.7), d = rand(70, 260); p.x = p.tx + Math.cos(a) * d; p.y = p.ty + Math.sin(a) * d - 40; }
        return p;
      });
      built = true;
    }
    function step(now: number) {
      raf = 0; if (!built) { raf = requestAnimationFrame(step); return; }
      const dt = Math.min(32, now - last) / 16.7; last = now; const el = now - t0, t = now * 0.001, on = motionRef.current;
      let aCol = 1, aSpk = 0, jitter = 0.9; const ease = 0.075;
      if (el < 1500) aCol = Math.min(1, el / 320);
      else if (el < 2100) { const f = (el - 1500) / 600; aCol = 1 - f; aSpk = f * 0.22; jitter = 0.3; acc!.setAttribute("data-on", ""); }
      else { aCol = 0; aSpk = 0.22; jitter = on ? 0.22 : 0; }
      const idle = el >= 2100, R = 86;
      ctx!.clearRect(0, 0, W, Hh);
      const buckets = new Map<number, (Pt | number)[]>();
      const push = (ci: number, p: Pt, a: number, s: number) => { let arr = buckets.get(ci); if (!arr) { arr = []; buckets.set(ci, arr); } arr.push(p, a, s); };
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i]; let tx = p.tx + Math.sin(t * 1.4 + p.j) * jitter, ty = p.ty + Math.cos(t * 1.2 + p.j * 1.7) * jitter, near = 0;
        if (idle && on) { const dx = p.tx - ptr.x, dy = p.ty - ptr.y, d = Math.hypot(dx, dy); if (d < R) { near = 1 - d / R; const k = near * near * 34; tx += (dx / (d || 1)) * k; ty += (dy / (d || 1)) * k; } }
        const ax = (tx - p.x) * ease, ay = (ty - p.y) * ease; p.vx = (p.vx + ax * dt) * 0.78; p.vy = (p.vy + ay * dt) * 0.78; p.x += p.vx * dt; p.y += p.vy * dt;
        const col = Math.max(aCol, near * 0.95); if (col > 0) push(p.c, p, col, p.s + near);
        if (aSpk > 0 && p.j < 2.3 && on) push(SPK, p, aSpk * (0.5 + 0.5 * Math.sin(t * 3 + p.j)), 1.6);
      }
      for (const [ci, arr] of buckets) { ctx!.fillStyle = palette[ci]; for (let i = 0; i < arr.length; i += 3) { const p = arr[i] as Pt, s = arr[i + 2] as number; ctx!.globalAlpha = Math.min(1, arr[i + 1] as number); ctx!.fillRect(p.x - s / 2, p.y - s / 2, s, s); } }
      ctx!.globalAlpha = 1;
      /* paused: let the points flow home for a second, then hold the frame */
      still = idle && !on ? still + 1 : 0;
      if (vis && !document.hidden && still < 60) raf = requestAnimationFrame(step);
    }
    const start = () => { still = 0; if (!raf && vis && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(step); } };
    const stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0; };
    startRef.current = start;
    const onMove = (ev: PointerEvent) => { const r = cv.getBoundingClientRect(); ptr.x = ev.clientX - r.left; ptr.y = ev.clientY - r.top; if (motionRef.current) start(); };
    const onLeave = () => { ptr.x = -1e4; ptr.y = -1e4; };
    const onVis = () => (document.hidden ? stop() : start());
    hero.addEventListener("pointermove", onMove); hero.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVis);
    const io = new IntersectionObserver((en) => { vis = en[0].isIntersecting; if (vis) start(); else stop(); }, { threshold: 0.05 });
    io.observe(hero);
    let rt = 0; const onResize = () => { clearTimeout(rt); rt = window.setTimeout(build, 120); };
    addEventListener("resize", onResize);
    let cancelled = false;
    const boot = () => { if (cancelled) return; build(); t0 = performance.now() + 250; start(); };
    const ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    ready.then(boot, boot);
    return () => {
      cancelled = true; stop(); startRef.current = () => {}; io.disconnect(); clearTimeout(rt);
      hero.removeEventListener("pointermove", onMove); hero.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVis); removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="hwrap" ref={hwrapRef}>
      <h1 className="h1" ref={h1Ref}>
        <span className="ld">{AXO.hero.h1Line1}</span>
        <span className="acc" ref={accRef}>{AXO.hero.h1Line2}</span>
      </h1>
      <canvas className="hcanvas" ref={cvRef} aria-hidden="true" />
      <noscript><style>{`.ov1 .h1 .acc{opacity:1}`}</style></noscript>
    </div>
  );
}
