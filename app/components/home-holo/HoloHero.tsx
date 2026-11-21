"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValue } from "framer-motion";
import BrandCube from "@/app/components/BrandCube";
import HeroCinematicV3 from "@/app/components/landing-v2/HeroCinematicV3";
import { AX } from "./content";
import { ICONS, reduced } from "./fx";

/* The Hologram Deck hero (owner's pick, 2026-11-21, iterated to v3 in the
 * landing-lab). Left: the headline drawn by coloured points with the real
 * neon brand cube inline after "firms.", looping construct -> settle (crisp
 * type fades in under the dots) -> hold -> switch off -> dark -> rebuild.
 * Right: the hologram machine, a frosted glass slab with a keyboard of light
 * and a bezel-less pane that renders ALGORITHMX_OS. All copy from content.ts. */

const PAD_X = 60, PAD_Y = 80;
const PHASES = ["construct", "settle", "hold", "off", "dark"] as const;
type Phase = (typeof PHASES)[number];
const STOPS = [[10, 112, 133], [79, 70, 229], [87, 68, 201], [165, 17, 127]];
const NB = 24;

interface Pt { x: number; y: number; vx: number; vy: number; j: number; s: number; stray: boolean; tx: number; ty: number; sx: number; sy: number; c: number; spk: number; o?: [number, number, number]; depth?: number; line?: number; }

/* The dotted cube that builds and scatters with the words: 12 edges plus a
 * sparse </> on the front face, in unit coordinates. While the headline
 * holds, these points hide and the real neon BrandCube shows in their place. */
function makeCubePoints(cyan: number, lite: number, mag: number): Pt[] {
  const out: Pt[] = [];
  const V: [number, number, number][] = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]];
  const E: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
  const seg = (a: [number, number, number], b: [number, number, number], n: number, c: number) => { for (let i = 0; i <= n; i++) { const f = i / n; out.push({ x: 0, y: 0, vx: 0, vy: 0, j: Math.random() * Math.PI * 2, s: 2, stray: false, tx: 0, ty: 0, sx: 0, sy: 0, c, spk: 0, o: [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f] }); } };
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
  /* The original laptop (HeroCinematicV3) opens on this value: 0 shut, 1 open and lit. */
  const drive = useMotionValue(0);

  useEffect(() => {
    const cv = cvRef.current, hwrap = hwrapRef.current, h1 = h1Ref.current, txt = txtRef.current, lead = leadRef.current, acc = accRef.current, slot = slotRef.current, hero = heroRef.current;
    if (!cv || !hwrap || !h1 || !txt || !lead || !acc || !slot || !hero) return;
    const ctx = cv.getContext("2d", { alpha: true });
    if (!ctx) return;
    const holdParam = parseFloat(new URLSearchParams(window.location.search).get("hold") || "");
    const HOLD = Number.isFinite(holdParam) && holdParam >= 0 ? holdParam : 9;
    /* Owner (14:58): slower merge of the dots into the words, and the laptop
     * opens with them. construct = lid opening + dots flying in; settle = dots
     * melting into crisp type; off + dark = lid closing again. */
    /* Owner (15:40): one splat, then always in motion. The laptop opens with
     * the dots (construct), the dots melt into type (settle), and from then
     * on a wave runs left to right, line by line, re-drawing the title. No
     * closing cycle unless ?loop=1 (hold then uses ?hold= seconds). */
    const LOOP = new URLSearchParams(window.location.search).get("loop") === "1";
    const T: Record<Phase, number> = { construct: 1800, settle: 900, hold: LOOP ? HOLD * 1000 : Infinity, off: 900, dark: 1500 };
    /* ?open=0.4 freezes the lid at that angle (tuning aid, harmless in production) */
    const openParam = parseFloat(new URLSearchParams(window.location.search).get("open") || "");
    const openLock = Number.isFinite(openParam) ? Math.max(0, Math.min(1, openParam)) : null;
    let lastOpen = -1;
    const setOpen = (v: number) => { const o = openLock ?? v; if (o !== lastOpen) { lastOpen = o; drive.set(o); } };
    let lines: { min: number; max: number }[] = [];
    const total = PHASES.reduce((a, k) => a + T[k], 0);
    const palette: string[] = ["#0b0d12", "#0a7085"];
    for (let b = 0; b < NB; b++) { const t = (b / (NB - 1)) * (STOPS.length - 1), i = Math.min(STOPS.length - 2, Math.floor(t)), f = t - i; const c = STOPS[i].map((v, k) => Math.round(v + (STOPS[i + 1][k] - v) * f)); palette.push(`rgb(${c[0]},${c[1]},${c[2]})`); }
    const SPK_LEAD = palette.length; palette.push("#8ff4ff");
    const SPK_ACC = palette.length; palette.push("#ffffff");
    const CUBE_CYAN = palette.length; palette.push("#00bfe0");
    const CUBE_LITE = palette.length; palette.push("#7df0ff");
    const CUBE_MAG = palette.length; palette.push("#ff2bd6");
    const cube = makeCubePoints(CUBE_CYAN, CUBE_LITE, CUBE_MAG);
    let W = 0, Hh = 0, pts: Pt[] = [], raf = 0, last = 0, cycle0 = 0, phase: Phase | "" = "", center = { x: 0, y: 0 }, cubeC = { x: 0, y: 0, s: 18 }, built = false, paused = false, offTimer = 0;
    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const wordRects = (node: HTMLElement) => { const tn = node.firstChild; if (!tn || tn.nodeType !== 3) return [] as { w: string; r: DOMRect }[]; const text = tn.textContent || "", out: { w: string; r: DOMRect }[] = [], re = /\S+/g; let m: RegExpExecArray | null; while ((m = re.exec(text))) { const r = document.createRange(); r.setStart(tn, m.index); r.setEnd(tn, m.index + m[0].length); out.push({ w: m[0], r: r.getBoundingClientRect() }); } return out; };

    function build() {
      const hr = hwrap!.getBoundingClientRect();
      W = Math.round(hr.width + PAD_X * 2); Hh = Math.round(hr.height + PAD_Y * 2 - 10);
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      cv!.width = Math.round(W * dpr); cv!.height = Math.round(Hh * dpr); ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const ox = hr.left - PAD_X, oy = hr.top - PAD_Y;
      const cs = getComputedStyle(h1!);
      /* the cube is the height of the word next to it: cap height, about 0.7 em */
      setCubePx(Math.round((parseFloat(cs.fontSize) || 56) * 0.7));
      const oc = document.createElement("canvas"); oc.width = W; oc.height = Hh; const o = oc.getContext("2d")!;
      o.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`; if ("letterSpacing" in o) (o as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = cs.letterSpacing; o.textBaseline = "alphabetic";
      const asc = o.measureText("H").fontBoundingBoxAscent || parseFloat(cs.fontSize) * 0.78;
      const lr = wordRects(lead!), ar = wordRects(acc!); if (!lr.length || !ar.length) return;
      o.fillStyle = "#ff0000"; lr.forEach(({ w, r }) => o.fillText(w, r.left - ox, r.top - oy + asc));
      let minX = 1e9, maxX = -1e9;
      o.fillStyle = "#00ff00"; ar.forEach(({ w, r }) => { const x = r.left - ox; o.fillText(w, x, r.top - oy + asc); minX = Math.min(minX, x); maxX = Math.max(maxX, x + r.width); });
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
      const prev = pts;
      pts = list.map((t, i) => {
        const p: Pt = prev[i] || { x: center.x + rand(-W * 0.45, W * 0.45), y: center.y + rand(-Hh * 0.5, Hh * 0.5), vx: 0, vy: 0, j: Math.random() * Math.PI * 2, s: Math.random() < 0.2 ? 2.5 : 1.8, stray: Math.random() < 0.08, tx: 0, ty: 0, sx: 0, sy: 0, c: 0, spk: 0 };
        p.tx = t[0] + rand(-0.5, 0.5); p.ty = t[1] + rand(-0.5, 0.5);
        const isLead = t[2] === 0;
        p.c = isLead ? (Math.random() < 0.07 ? 1 : 0) : 2 + Math.max(0, Math.min(NB - 1, Math.round(((t[0] - minX) / span) * (NB - 1))));
        p.spk = isLead ? SPK_LEAD : SPK_ACC;
        const a = Math.atan2(p.ty - center.y, p.tx - center.x) + rand(-0.6, 0.6), d = rand(90, 240);
        p.sx = p.tx + Math.cos(a) * d; p.sy = p.ty + Math.sin(a) * d - 30;
        return p;
      });
      /* line membership for the left-to-right wave */
      const tops = [...new Set([...lr, ...ar].map((q) => Math.round(q.r.top - oy)))].sort((a, b) => a - b);
      lines = tops.map(() => ({ min: 1e9, max: -1e9 }));
      for (const p of pts) { let li = 0; for (let k = 0; k < tops.length; k++) if (p.ty >= tops[k] - 2) li = k; p.line = li; lines[li].min = Math.min(lines[li].min, p.tx); lines[li].max = Math.max(lines[li].max, p.tx); }
      const sr = slot!.getBoundingClientRect();
      cubeC = { x: sr.left - ox + sr.width / 2, y: sr.top - oy + sr.height / 2, s: sr.width * 0.36 };
      cube.forEach((q) => { if (!q.sx && !q.sy) { q.x = cubeC.x + rand(-120, 120); q.y = cubeC.y + rand(-90, 90); } const a = rand(0, Math.PI * 2), d = rand(80, 200); q.sx = cubeC.x + Math.cos(a) * d; q.sy = cubeC.y + Math.sin(a) * d - 20; });
      built = true;
    }
    function project(now: number) {
      const ry = (now / 14000) * Math.PI * 2, rx = -0.42, cy = Math.cos(ry), sy = Math.sin(ry), cx = Math.cos(rx), sx = Math.sin(rx), S = cubeC.s;
      for (const q of cube) {
        const [X, Y, Z] = q.o!;
        const x1 = X * cy + Z * sy, z1 = -X * sy + Z * cy;
        const y2 = Y * cx - z1 * sx, z2 = Y * sx + z1 * cx;
        q.tx = cubeC.x + x1 * S; q.ty = cubeC.y + y2 * S; q.depth = (z2 + 1.8) / 3.6;
      }
    }
    function setPhase(p: Phase) {
      if (p === phase) return; phase = p;
      if (p === "construct") { txt!.classList.remove("on", "flick"); slot!.classList.remove("on", "flick"); }
      if (p === "settle") { txt!.classList.add("on"); slot!.classList.add("on"); }
      if (p === "off") { txt!.classList.add("flick"); slot!.classList.add("flick"); offTimer = window.setTimeout(() => { txt!.classList.remove("on", "flick"); slot!.classList.remove("on", "flick"); }, 320); }
      if (p === "dark") { pts.forEach((q) => { if (Math.random() < 0.35) { q.x = center.x + rand(-W * 0.45, W * 0.45); q.y = center.y + rand(-Hh * 0.55, Hh * 0.55); q.vx = 0; q.vy = 0; } }); }
    }
    function phaseAt(el: number) { let a = 0; for (const k of PHASES) { if (!Number.isFinite(T[k])) return { k, f: 0 }; a += T[k]; if (el < a) return { k, f: (el - (a - T[k])) / T[k] }; } return { k: "dark" as Phase, f: 1 }; }
    function step(now: number) {
      raf = 0;
      if (!built) { raf = requestAnimationFrame(step); return; }
      const dt = Math.min(32, now - last) / 16.7; last = now;
      let el = now - cycle0;
      if (Number.isFinite(total) && el >= total) { cycle0 = now - (el % total); el = now - cycle0; }
      const ph = phaseAt(el); setPhase(ph.k);
      const f = ph.f, t = now * 0.001;
      project(now);
      let aCol = 1, aSpk = 0, toScatter = false, flare = 0, jitter = 0.6, ease = 0.07;
      /* the lid: eases open through construct, stays open, eases shut across off + dark */
      if (ph.k === "construct") setOpen(f * f * (3 - 2 * f));
      else if (ph.k === "settle" || ph.k === "hold") setOpen(1);
      else { const c = ph.k === "off" ? (f * T.off) / (T.off + T.dark) : (T.off + f * T.dark) / (T.off + T.dark); setOpen(1 - (c < 0.5 ? 2 * c * c : 1 - Math.pow(-2 * c + 2, 2) / 2)); }
      if (ph.k === "construct") { aCol = Math.min(1, f * 2.2); jitter = 1.2; ease = 0.05; }
      else if (ph.k === "settle") { const g = f * f * (3 - 2 * f); aCol = 1 - g; aSpk = g * 0.22; jitter = 0.3; }
      else if (ph.k === "hold") { aCol = 0; aSpk = 0.22; jitter = 0.2; }
      else if (ph.k === "off") { if (f < 0.17) { aCol = 1; flare = 1; } else { toScatter = true; const g = (f - 0.17) / 0.83; aCol = 1 - g; ease = 0.05; } }
      else { toScatter = true; aCol = 0; }
      ctx!.clearRect(0, 0, W, Hh);
      /* the wave: during hold a band sweeps each line left to right in turn,
       * lifting the points off the letters and letting them resettle */
      let waveLine = -1, waveX = 0;
      const BW = 64, LINE_MS = 1500, GAP_MS = 250, PAUSE_MS = 700;
      if (ph.k === "hold" && lines.length) {
        const holdEl = el - (T.construct + T.settle);
        const per = LINE_MS + GAP_MS, cyc = lines.length * per + PAUSE_MS, u = holdEl % cyc;
        const li = Math.floor(u / per);
        if (li < lines.length) { const w = (u - li * per) / LINE_MS; if (w <= 1) { waveLine = li; const L = lines[li]; waveX = L.min - BW + (L.max - L.min + 2 * BW) * w; } }
      }
      const buckets = new Map<number, (Pt | number)[]>();
      const push = (ci: number, p: Pt, a: number, s: number) => { let arr = buckets.get(ci); if (!arr) { arr = []; buckets.set(ci, arr); } arr.push(p, a, s); };
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        let k = 0;
        if (waveLine === p.line) { const d = Math.abs(p.tx - waveX); if (d < BW) k = Math.cos((d / BW) * Math.PI * 0.5); }
        const lift = k > 0 ? k : 0;
        const tx = (toScatter ? p.sx : p.tx) + Math.sin(t * 1.4 + p.j) * jitter + Math.sin(p.j * 3) * 10 * lift, ty = (toScatter ? p.sy : p.ty) + Math.cos(t * 1.2 + p.j * 1.7) * jitter - (16 + Math.cos(p.j * 5) * 10) * lift;
        const e2 = lift > 0 ? 0.14 : ease;
        const ax = (tx - p.x) * e2, ay = (ty - p.y) * e2;
        p.vx = (p.vx + ax * dt) * 0.78; p.vy = (p.vy + ay * dt) * 0.78; p.x += p.vx * dt; p.y += p.vy * dt;
        if (ph.k === "dark") { if (p.stray) push(p.c, p, 0.16, p.s); continue; }
        if (aCol > 0) push(p.c, p, aCol, p.s + flare);
        if (ph.k === "hold") {
          /* points near the band glow in colour; points that have just been passed are still resettling, drawn in colour too */
          const settling = Math.hypot(p.x - p.tx, p.y - p.ty);
          if (lift > 0) push(p.c, p, 0.55 + 0.45 * lift, p.s + 0.8 * lift);
          else if (settling > 1.2) push(p.c, p, Math.min(1, settling / 14) * 0.9, p.s);
        }
        if (aSpk > 0 && p.j < 3.4 && lift === 0) push(p.spk, p, aSpk * (0.6 + 0.4 * Math.sin(t * 3 + p.j)), 1.5);
      }
      /* the dotted cube: builds and scatters with the words, hides while the real cube shows */
      for (const q of cube) {
        const tx = toScatter ? q.sx : q.tx, ty = toScatter ? q.sy : q.ty;
        const ax = (tx - q.x) * (ease + 0.04), ay = (ty - q.y) * (ease + 0.04);
        q.vx = (q.vx + ax * dt) * 0.74; q.vy = (q.vy + ay * dt) * 0.74; q.x += q.vx * dt; q.y += q.vy * dt;
        if (ph.k === "dark" || ph.k === "hold" || aCol <= 0) continue;
        push(q.c, q, aCol * (0.45 + 0.55 * (q.depth || 0.5)), 1.3 + (q.depth || 0.5) * 1.1 + flare);
      }
      for (const [ci, arr] of buckets) { ctx!.fillStyle = palette[ci]; for (let i = 0; i < arr.length; i += 3) { const p = arr[i] as Pt, a = arr[i + 1] as number, s = arr[i + 2] as number; ctx!.globalAlpha = Math.max(0, Math.min(1, a)); ctx!.fillRect(p.x - s / 2, p.y - s / 2, s, s); } }
      ctx!.globalAlpha = 1;
      if (!paused && !document.hidden) raf = requestAnimationFrame(step);
    }
    function start() { if (!raf && !paused && !document.hidden) { last = performance.now(); cycle0 = last; phase = ""; pts.forEach((p) => { p.x = p.sx + rand(-40, 40); p.y = p.sy + rand(-30, 30); p.vx = 0; p.vy = 0; }); cube.forEach((q) => { q.x = q.sx; q.y = q.sy; q.vx = 0; q.vy = 0; }); txt!.classList.remove("on", "flick"); slot!.classList.remove("on", "flick"); raf = requestAnimationFrame(step); } }
    function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; }
    const onVis = () => { if (document.hidden) stop(); else start(); };
    const io = new IntersectionObserver((ents) => ents.forEach((en) => { paused = !en.isIntersecting; if (paused) stop(); else start(); }), { threshold: 0.05 });
    let rt = 0; const onResize = () => { clearTimeout(rt); rt = window.setTimeout(() => build(), 120); };
    const boot = () => { if (reduced()) { txt!.classList.add("still"); slot!.classList.add("on"); return; } build(); start(); io.observe(hero!); document.addEventListener("visibilitychange", onVis); addEventListener("resize", onResize); };
    let cancelled = false;
    const ready = document.fonts && document.fonts.load ? document.fonts.load('700 40px "Space Grotesk"') : Promise.resolve();
    ready.then(() => { if (!cancelled) boot(); }, () => { if (!cancelled) boot(); });
    return () => { cancelled = true; stop(); io.disconnect(); document.removeEventListener("visibilitychange", onVis); removeEventListener("resize", onResize); clearTimeout(rt); clearTimeout(offTimer); };
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
      {/* The original homepage laptop (HeroCinematicV3), same position as
          before, opening like a real one on the headline's timeline. */}
      <div className="stage old" aria-label="AlgorithmX laptop">
        <HeroCinematicV3 overlay={false} embedded drive={drive} />
      </div>
    </section>
  );
}
