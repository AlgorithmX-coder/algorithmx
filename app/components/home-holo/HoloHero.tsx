"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValue } from "framer-motion";
import BrandCube from "@/app/components/BrandCube";
import HoloMachine from "./HoloMachine";
import { AX } from "./content";
import { ICONS, reduced } from "./fx";

/* The Hologram Deck hero.
 *
 * Left: the headline is PRINTED BY THE CANVAS. Coloured points fly in and
 * gather into the letterforms (construct), melt into crisp type that the
 * canvas itself draws (settle), and from then on a scan head runs along each
 * line in turn: just ahead of the head the letters dissolve into points,
 * behind it the points fall back and the letters re-print. The title is
 * therefore always being re-created, never just decorated. The real <h1>
 * stays in the DOM for assistive tech and search, visually blank while the
 * canvas carries it; under prefers-reduced-motion the DOM text simply shows.
 * The real neon brand cube sits inline after "firms." and switches on when
 * the words settle.
 *
 * Right: HoloMachine, the hologram laptop on the old hero's rig, opening on
 * the same timeline (0 shut to 1 open and lit). */

const PAD_X = 60, PAD_Y = 80;
const STOPS = [[10, 112, 133], [79, 70, 229], [87, 68, 201], [165, 17, 127]];
const NB = 24;
const T = { construct: 1800, settle: 900 };
const SCAN = { line: 1400, gap: 200, pause: 900, ahead: 40, behind: 120 };

interface Pt { x: number; y: number; vx: number; vy: number; j: number; s: number; tx: number; ty: number; c: number; line: number; o?: [number, number, number]; depth?: number; }
interface Glyph { w: string; x: number; y: number; lead: boolean; }
interface Line { min: number; max: number; top: number; bottom: number; }

function makeCubePoints(cyan: number, lite: number, mag: number): Pt[] {
  const out: Pt[] = [];
  const V: [number, number, number][] = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]];
  const E: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
  const seg = (a: [number, number, number], b: [number, number, number], n: number, c: number) => { for (let i = 0; i <= n; i++) { const f = i / n; out.push({ x: 0, y: 0, vx: 0, vy: 0, j: Math.random() * Math.PI * 2, s: 2, tx: 0, ty: 0, c, line: -1, o: [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f] }); } };
  E.forEach(([a, b], i) => seg(V[a], V[b], 11, i % 5 === 0 ? lite : cyan));
  const g = (x: number, y: number): [number, number, number] => [x, y, 1.001];
  ([[g(-0.6, 0), g(-0.24, -0.38)], [g(-0.6, 0), g(-0.24, 0.38)], [g(0.12, -0.44), g(-0.12, 0.44)], [g(0.6, 0), g(0.24, -0.38)], [g(0.6, 0), g(0.24, 0.38)]] as [[number, number, number], [number, number, number]][]).forEach(([a, b]) => seg(a, b, 5, mag));
  return out;
}

export default function HoloHero() {
  const sc = AX.hero.screen;
  const heroRef = useRef<HTMLElement>(null);
  const hwrapRef = useRef<HTMLDivElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const txtRef = useRef<HTMLSpanElement>(null);
  const leadRef = useRef<HTMLSpanElement>(null);
  const accRef = useRef<HTMLSpanElement>(null);
  const slotRef = useRef<HTMLSpanElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const [cubePx, setCubePx] = useState(52);
  const drive = useMotionValue(0);

  useEffect(() => {
    const cv = cvRef.current, hwrap = hwrapRef.current, h1 = h1Ref.current, txt = txtRef.current, lead = leadRef.current, acc = accRef.current, slot = slotRef.current, hero = heroRef.current;
    if (!cv || !hwrap || !h1 || !txt || !lead || !acc || !slot || !hero) return;
    const ctx = cv.getContext("2d", { alpha: true });
    if (!ctx) return;
    const openParam = parseFloat(new URLSearchParams(window.location.search).get("open") || "");
    const openLock = Number.isFinite(openParam) ? Math.max(0, Math.min(1, openParam)) : null;
    let lastOpen = -1;
    const setOpen = (v: number) => { const o = openLock ?? v; if (o !== lastOpen) { lastOpen = o; drive.set(o); } };

    const palette: string[] = ["#0b0d12", "#0a7085"];
    for (let b = 0; b < NB; b++) { const t = (b / (NB - 1)) * (STOPS.length - 1), i = Math.min(STOPS.length - 2, Math.floor(t)), f = t - i; const c = STOPS[i].map((v, k) => Math.round(v + (STOPS[i + 1][k] - v) * f)); palette.push(`rgb(${c[0]},${c[1]},${c[2]})`); }
    const CUBE_CYAN = palette.length; palette.push("#00bfe0");
    const CUBE_LITE = palette.length; palette.push("#7df0ff");
    const CUBE_MAG = palette.length; palette.push("#ff2bd6");
    const cube = makeCubePoints(CUBE_CYAN, CUBE_LITE, CUBE_MAG);

    let W = 0, Hh = 0, pts: Pt[] = [], glyphs: Glyph[] = [], lines: Line[] = [], font = "", letterSpacing = "", accX = [0, 1];
    let raf = 0, last = 0, t0 = 0, center = { x: 0, y: 0 }, cubeC = { x: 0, y: 0, s: 18 }, built = false, paused = false, settled = false;
    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const smooth = (x: number) => { const t = Math.max(0, Math.min(1, x)); return t * t * (3 - 2 * t); };
    const wordRects = (node: HTMLElement) => { const tn = node.firstChild; if (!tn || tn.nodeType !== 3) return [] as { w: string; r: DOMRect }[]; const text = tn.textContent || "", out: { w: string; r: DOMRect }[] = [], re = /\S+/g; let m: RegExpExecArray | null; while ((m = re.exec(text))) { const r = document.createRange(); r.setStart(tn, m.index); r.setEnd(tn, m.index + m[0].length); out.push({ w: m[0], r: r.getBoundingClientRect() }); } return out; };

    function build() {
      const hr = hwrap!.getBoundingClientRect();
      W = Math.round(hr.width + PAD_X * 2); Hh = Math.round(hr.height + PAD_Y * 2 - 10);
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      cv!.width = Math.round(W * dpr); cv!.height = Math.round(Hh * dpr); ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const ox = hr.left - PAD_X, oy = hr.top - PAD_Y;
      const cs = getComputedStyle(h1!);
      setCubePx(Math.round((parseFloat(cs.fontSize) || 56) * 0.7));
      font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`; letterSpacing = cs.letterSpacing;
      const oc = document.createElement("canvas"); oc.width = W; oc.height = Hh; const o = oc.getContext("2d")!;
      o.font = font; if ("letterSpacing" in o) (o as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = letterSpacing; o.textBaseline = "alphabetic";
      const asc = o.measureText("H").fontBoundingBoxAscent || parseFloat(cs.fontSize) * 0.78;
      const lr = wordRects(lead!), ar = wordRects(acc!); if (!lr.length || !ar.length) return;
      glyphs = [...lr.map(({ w, r }) => ({ w, x: r.left - ox, y: r.top - oy + asc, lead: true })), ...ar.map(({ w, r }) => ({ w, x: r.left - ox, y: r.top - oy + asc, lead: false }))];
      o.fillStyle = "#ff0000"; lr.forEach(({ w, r }) => o.fillText(w, r.left - ox, r.top - oy + asc));
      let minX = 1e9, maxX = -1e9;
      o.fillStyle = "#00ff00"; ar.forEach(({ w, r }) => { const x = r.left - ox; o.fillText(w, x, r.top - oy + asc); minX = Math.min(minX, x); maxX = Math.max(maxX, x + r.width); });
      accX = [minX, maxX];
      const img = o.getImageData(0, 0, W, Hh).data;
      let step = W > 560 ? 3 : 2.6, list: [number, number, number][] = [];
      for (let tries = 0; tries < 3; tries++) {
        list = [];
        for (let y = 0; y < Hh; y += step) for (let x = 0; x < W; x += step) { const k = ((y | 0) * W + (x | 0)) * 4; if (img[k + 3] > 110) list.push([x, y, img[k] > 120 ? 0 : 1]); }
        if (list.length <= 2400) break; step += 0.5;
      }
      for (let a = list.length - 1; a > 0; a--) { const b = (Math.random() * (a + 1)) | 0; [list[a], list[b]] = [list[b], list[a]]; }
      const span = Math.max(1, maxX - minX);
      const all = [...lr, ...ar].map((q) => q.r);
      const bx0 = Math.min(...all.map((r) => r.left)) - ox, bx1 = Math.max(...all.map((r) => r.right)) - ox, by0 = Math.min(...all.map((r) => r.top)) - oy, by1 = Math.max(...all.map((r) => r.bottom)) - oy;
      center = { x: (bx0 + bx1) / 2, y: (by0 + by1) / 2 };
      /* lines: top/bottom from the word rects, min/max x from the points */
      const tops = [...new Set(all.map((r) => Math.round(r.top - oy)))].sort((a, b) => a - b);
      lines = tops.map((top) => { const rs = all.filter((r) => Math.round(r.top - oy) === top); return { min: 1e9, max: -1e9, top, bottom: Math.max(...rs.map((r) => r.bottom - oy)) }; });
      const prev = pts;
      pts = list.map((t, i) => {
        const p: Pt = prev[i] || { x: center.x + rand(-W * 0.45, W * 0.45), y: center.y + rand(-Hh * 0.5, Hh * 0.5), vx: 0, vy: 0, j: Math.random() * Math.PI * 2, s: Math.random() < 0.2 ? 2.5 : 1.8, tx: 0, ty: 0, c: 0, line: 0 };
        p.tx = t[0] + rand(-0.5, 0.5); p.ty = t[1] + rand(-0.5, 0.5);
        p.c = t[2] === 0 ? (Math.random() < 0.07 ? 1 : 0) : 2 + Math.max(0, Math.min(NB - 1, Math.round(((t[0] - minX) / span) * (NB - 1))));
        let li = 0; for (let k = 0; k < tops.length; k++) if (p.ty >= tops[k] - 2) li = k; p.line = li;
        lines[li].min = Math.min(lines[li].min, p.tx); lines[li].max = Math.max(lines[li].max, p.tx);
        return p;
      });
      const sr = slot!.getBoundingClientRect();
      cubeC = { x: sr.left - ox + sr.width / 2, y: sr.top - oy + sr.height / 2, s: sr.width * 0.36 };
      cube.forEach((q) => { if (!q.x && !q.y) { q.x = cubeC.x + rand(-120, 120); q.y = cubeC.y + rand(-90, 90); } });
      built = true;
    }
    function project(now: number) {
      const ry = (now / 14000) * Math.PI * 2, rx = -0.42, cy = Math.cos(ry), sy = Math.sin(ry), cx = Math.cos(rx), sx = Math.sin(rx), S = cubeC.s;
      for (const q of cube) { const [X, Y, Z] = q.o!; const x1 = X * cy + Z * sy, z1 = -X * sy + Z * cy; const y2 = Y * cx - z1 * sx, z2 = Y * sx + z1 * cx; q.tx = cubeC.x + x1 * S; q.ty = cubeC.y + y2 * S; q.depth = (z2 + 1.8) / 3.6; }
    }
    /* the crisp title, drawn by the canvas at the DOM glyph positions */
    function drawType(alpha: number) {
      if (alpha <= 0) return;
      ctx!.save(); ctx!.globalAlpha = alpha; ctx!.font = font; if ("letterSpacing" in ctx!) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = letterSpacing; ctx!.textBaseline = "alphabetic";
      const g = ctx!.createLinearGradient(accX[0], 0, accX[1], 0); g.addColorStop(0, "#0a7085"); g.addColorStop(0.35, "#4f46e5"); g.addColorStop(0.65, "#5744c9"); g.addColorStop(1, "#a5117f");
      for (const q of glyphs) { ctx!.fillStyle = q.lead ? "#0b0d12" : g; ctx!.fillText(q.w, q.x, q.y); }
      ctx!.restore();
    }
    /* carve the dissolve/re-print zone out of the printed title on one line */
    function carve(L: Line, headX: number) {
      const x0 = headX - SCAN.behind, x1 = headX + SCAN.ahead, w = x1 - x0;
      const g = ctx!.createLinearGradient(x0, 0, x1, 0);
      g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop((SCAN.behind - 24) / w, "rgba(0,0,0,1)"); g.addColorStop(SCAN.behind / w, "rgba(0,0,0,1)"); g.addColorStop(1, "rgba(0,0,0,0)");
      ctx!.save(); ctx!.globalCompositeOperation = "destination-out"; ctx!.fillStyle = g; ctx!.fillRect(x0, L.top - 10, w, L.bottom - L.top + 20); ctx!.restore();
    }
    function step(now: number) {
      raf = 0;
      if (!built) { raf = requestAnimationFrame(step); return; }
      const dt = Math.min(32, now - last) / 16.7; last = now;
      const el = now - t0, t = now * 0.001;
      project(now);
      /* phases: construct -> settle -> re-print forever */
      let phase: "construct" | "settle" | "scan" = "scan", f = 0;
      if (el < T.construct) { phase = "construct"; f = el / T.construct; }
      else if (el < T.construct + T.settle) { phase = "settle"; f = (el - T.construct) / T.settle; }
      setOpen(phase === "construct" ? smooth(f) : 1);
      if (phase !== "construct" && !settled) { settled = true; slot!.classList.add("on"); }
      let aCol = 1, typeA = 0, jitter = 0.6, ease = 0.07;
      if (phase === "construct") { aCol = Math.min(1, f * 2.2); jitter = 1.2; ease = 0.05; }
      else if (phase === "settle") { const g = smooth(f); aCol = 1 - g; typeA = g; jitter = 0.3; }
      else { aCol = 0; typeA = 1; jitter = 0; }
      /* the scan head */
      let scanLine = -1, headX = 0;
      if (phase === "scan" && lines.length) {
        const sEl = el - T.construct - T.settle, per = SCAN.line + SCAN.gap, cyc = lines.length * per + SCAN.pause, u = sEl % cyc, li = Math.floor(u / per);
        if (li < lines.length) { const w = (u - li * per) / SCAN.line; if (w <= 1) { scanLine = li; const L = lines[li]; headX = L.min - SCAN.ahead - 10 + (L.max - L.min + SCAN.ahead + SCAN.behind + 20) * w; } }
      }
      ctx!.clearRect(0, 0, W, Hh);
      drawType(typeA);
      if (scanLine >= 0) carve(lines[scanLine], headX);
      const buckets = new Map<number, (Pt | number)[]>();
      const push = (ci: number, p: Pt, a: number, s: number) => { let arr = buckets.get(ci); if (!arr) { arr = []; buckets.set(ci, arr); } arr.push(p, a, s); };
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        let k = 0;
        if (scanLine === p.line) { const d = p.tx - headX; if (d >= 0 && d < SCAN.ahead) k = 1 - d / SCAN.ahead; else if (d < 0 && d > -SCAN.behind) k = 1 + d / SCAN.behind; }
        const tx = p.tx + Math.sin(t * 1.4 + p.j) * jitter + Math.sin(p.j * 3) * 9 * k, ty = p.ty + Math.cos(t * 1.2 + p.j * 1.7) * jitter - (14 + Math.cos(p.j * 5) * 12) * k;
        const e2 = k > 0 ? 0.16 : ease;
        const ax = (tx - p.x) * e2, ay = (ty - p.y) * e2;
        p.vx = (p.vx + ax * dt) * 0.78; p.vy = (p.vy + ay * dt) * 0.78; p.x += p.vx * dt; p.y += p.vy * dt;
        if (aCol > 0) push(p.c, p, aCol, p.s);
        if (phase === "scan") {
          if (k > 0) push(p.c, p, 0.4 + 0.6 * Math.sqrt(k), p.s + 0.9 * k);
          else { const away = Math.hypot(p.x - p.tx, p.y - p.ty); if (away > 1) push(p.c, p, Math.min(1, away / 10), p.s); }
        }
      }
      /* the dotted cube builds with the words and hands over to the real cube */
      if (aCol > 0) for (const q of cube) { const ax = (q.tx - q.x) * (ease + 0.04), ay = (q.ty - q.y) * (ease + 0.04); q.vx = (q.vx + ax * dt) * 0.74; q.vy = (q.vy + ay * dt) * 0.74; q.x += q.vx * dt; q.y += q.vy * dt; push(q.c, q, aCol * (0.45 + 0.55 * (q.depth || 0.5)), 1.3 + (q.depth || 0.5) * 1.1); }
      for (const [ci, arr] of buckets) { ctx!.fillStyle = palette[ci]; for (let i = 0; i < arr.length; i += 3) { const p = arr[i] as Pt, a = arr[i + 1] as number, s = arr[i + 2] as number; ctx!.globalAlpha = Math.max(0, Math.min(1, a)); ctx!.fillRect(p.x - s / 2, p.y - s / 2, s, s); } }
      ctx!.globalAlpha = 1;
      if (!paused && !document.hidden) raf = requestAnimationFrame(step);
    }
    function start() { if (!raf && !paused && !document.hidden) { last = performance.now(); if (!t0) t0 = last; raf = requestAnimationFrame(step); } }
    function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; }
    const onVis = () => { if (document.hidden) stop(); else { last = performance.now(); start(); } };
    const io = new IntersectionObserver((ents) => ents.forEach((en) => { paused = !en.isIntersecting; if (paused) stop(); else { last = performance.now(); start(); } }), { threshold: 0.05 });
    let rt = 0; const onResize = () => { clearTimeout(rt); rt = window.setTimeout(() => build(), 120); };
    const boot = () => { if (reduced()) { txt!.classList.add("still"); slot!.classList.add("on"); setOpen(1); return; } build(); start(); io.observe(hero!); document.addEventListener("visibilitychange", onVis); addEventListener("resize", onResize); };
    let cancelled = false;
    const ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    ready.then(() => { if (!cancelled) boot(); }, () => { if (!cancelled) boot(); });
    return () => { cancelled = true; stop(); io.disconnect(); document.removeEventListener("visibilitychange", onVis); removeEventListener("resize", onResize); clearTimeout(rt); };
  }, [drive]);

  return (
    <section className="hero wrap" id="hero" ref={heroRef}>
      <div className="copy">
        <div className="eyebrow"><i /><span>{sc.sys}</span></div>
        <div className="hwrap" ref={hwrapRef}>
          <h1 className="h" ref={h1Ref}>
            <span className="txt" ref={txtRef}>
              <span className="hlead" ref={leadRef}>{AX.hero.headlineLead.trim()}</span>{" "}
              <span className="acc" ref={accRef}>{AX.hero.headlineAccent}</span>
            </span>
            <span className="cubeSlot" ref={slotRef} aria-hidden="true"><BrandCube size={cubePx} /></span>
          </h1>
          <canvas id="hcanvas" ref={cvRef} aria-hidden="true" />
        </div>
        <noscript><style>{`.hv4 h1.h .txt,.hv4 h1.h .cubeSlot{opacity:1}`}</style></noscript>
        <p className="sub">{AX.hero.sub}</p>
        <a className="cta" href="#accreditations">{AX.hero.cta}<span className="chev"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={ICONS.chevron} /></svg></span></a>
      </div>
      <div className="stage holo" aria-label="AlgorithmX laptop">
        <HoloMachine drive={drive} />
      </div>
    </section>
  );
}
