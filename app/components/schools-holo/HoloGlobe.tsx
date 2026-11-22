"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef } from "react";
import { AXS } from "./content";
import { CITY, HOLES, LAND, LONDON, UK } from "./geo";
import { ICONS } from "./icons";
import { reduced } from "@/app/components/home-holo/fx";

/* The hologram globe: a lat/lon grid of points with land from the embedded
 * coast table, Britain gold with a glow, lesson arcs leaving London every
 * ~2 s as lifted great circles that land with a ring, a gold glow and a
 * flag chip carrying the city name. The globe rocks slowly rather than
 * spinning so Britain never leaves the disc; drag spins it with inertia.
 * The "UNITED KINGDOM / SOURCE · ALGORITHMX" label rides a glass pill with
 * a dashed leader drawn on the canvas. Everything is imperative, in one
 * effect; `motion` (the Pause button) only flips a ref and restarts the
 * loop, so toggling it never rebuilds the scene. Ported from
 * landing-lab/s01.html. */

const D = Math.PI / 180;
const TILT = 0.44;
const vec = (lat: number, lon: number): [number, number, number] => [Math.cos(lat * D) * Math.sin(lon * D), Math.sin(lat * D), Math.cos(lat * D) * Math.cos(lon * D)];
const pip = (x: number, y: number, poly: ReadonlyArray<readonly [number, number]>) => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};

type P = { v: [number, number, number]; land: boolean; uk: boolean; dot: number };
type Arc = { name: string; iso: string; a: [number, number, number]; b: [number, number, number]; t: number; dur: number; done: boolean; land: number };

/* built once per module: ~3,000 points, the same on every mount */
let POINTS: P[] | null = null;
function points(): P[] {
  if (POINTS) return POINTS;
  const out: P[] = [], STEP = 2.3, L = vec(LONDON.lat, LONDON.lon);
  let ring = 0;
  for (let lat = -58; lat <= 84; lat += STEP, ring++) {
    const n = Math.max(10, Math.round((360 / STEP) * Math.cos(lat * D)));
    for (let k = 0; k < n; k++) {
      const lon = -180 + ((k + (ring % 2) * 0.5) * 360) / n;
      const uk = pip(lon, lat, UK);
      const land = uk || LAND.some((p) => pip(lon, lat, p));
      if (land && HOLES.some((p) => pip(lon, lat, p))) continue;
      if (!land && (ring % 3 || k % 3)) continue;
      const v = vec(lat, lon);
      out.push({ v, land, uk, dot: v[0] * L[0] + v[1] * L[1] + v[2] * L[2] });
    }
  }
  POINTS = out;
  return out;
}

export default function HoloGlobe({ motion }: { motion: boolean }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const chipRef = useRef<HTMLDivElement>(null);
  const chipImgRef = useRef<HTMLImageElement>(null);
  const chipTxtRef = useRef<HTMLElement>(null);
  const motionRef = useRef(motion);
  const startRef = useRef<() => void>(() => {});

  useEffect(() => { motionRef.current = motion; startRef.current(); }, [motion]);

  useEffect(() => {
    const cv = cvRef.current, stage = stageRef.current, label = labelRef.current, chip = chipRef.current, chipImg = chipImgRef.current, chipTxt = chipTxtRef.current;
    if (!cv || !stage || !label || !chip || !chipImg || !chipTxt) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const pts = points();
    const cities = Object.keys(CITY);
    for (let a = cities.length - 1; a > 0; a--) { const b = (Math.random() * (a + 1)) | 0; [cities[a], cities[b]] = [cities[b], cities[a]]; }
    let W = 0, Hh = 0, R = 0, cx = 0, cy = 0, raf = 0, t0 = 0, last = 0, user = 0, vel = 0, cityI = 0, nextArc = 0, vis = true, labelOn = false, chipTimer = 0;
    let drag: { x: number; w: number } | null = null, arcs: Arc[] = [], landings: { v: [number, number, number]; t: number }[] = [];
    let chipLL: [number, number] | null = null, chipOn = false;
    const A = vec(LONDON.lat, LONDON.lon);

    function size() {
      const r = stage!.getBoundingClientRect(); W = Math.round(r.width); Hh = Math.round(r.height);
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      cv!.width = Math.round(W * dpr); cv!.height = Math.round(Hh * dpr); ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      R = Math.min(W, Hh) * 0.44; cx = W / 2; cy = Hh / 2 + 6;
    }
    function rot(v: [number, number, number], w: number): [number, number, number] {
      const c = Math.cos(w), s = Math.sin(w);
      const x = v[0] * c + v[2] * s, z = -v[0] * s + v[2] * c;
      const y2 = v[1] * Math.cos(TILT) - z * Math.sin(TILT), z2 = v[1] * Math.sin(TILT) + z * Math.cos(TILT);
      return [cx + x * R, cy - y2 * R, z2];
    }
    function slerp(a: [number, number, number], b: [number, number, number], s: number, lift: number): [number, number, number] {
      let d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; d = Math.max(-1, Math.min(1, d));
      const om = Math.acos(d), so = Math.sin(om) || 1e-6, ka = Math.sin((1 - s) * om) / so, kb = Math.sin(s * om) / so;
      const m = 1 + lift * Math.sin(Math.PI * s) * Math.min(1, om / 1.6);
      return [(a[0] * ka + b[0] * kb) * m, (a[1] * ka + b[1] * kb) * m, (a[2] * ka + b[2] * kb) * m];
    }
    function showChip(ar: Arc) {
      chipImg!.src = `/schools/flags/${ar.iso}.png`; chipTxt!.textContent = ar.name;
      chipLL = [CITY[ar.name][1], CITY[ar.name][2]]; chipOn = true; chip!.classList.add("on");
      clearTimeout(chipTimer); chipTimer = window.setTimeout(() => { chipOn = false; chip!.classList.remove("on"); }, 2300);
    }
    const glow = (x: number, y: number, r: number, a: number, z: number) => {
      if (z < 0) return;
      const g = ctx!.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(240,180,41,${a})`); g.addColorStop(1, "rgba(240,180,41,0)");
      ctx!.fillStyle = g; ctx!.fillRect(x - r, y - r, r * 2, r * 2);
    };
    const draw = (arr: number[], col: string, sz: number) => {
      ctx!.fillStyle = col;
      for (let i = 0; i < arr.length; i += 4) { const s = sz * (0.55 + 0.45 * arr[i + 3]); ctx!.globalAlpha = arr[i + 2]; ctx!.fillRect(arr[i] - s / 2, arr[i + 1] - s / 2, s, s); }
    };

    function frame(now: number) {
      raf = 0;
      const dt = Math.min(40, now - last) / 16.7; last = now;
      const el = now - t0, t = now * 0.001, on = motionRef.current;
      if (!drag) { user += vel * dt; vel *= 0.94; }
      const w = 0.46 + 0.3 * Math.sin((t * 2 * Math.PI) / 32) + user;
      const reveal = Math.min(1.25, -0.15 + el / 1100);
      ctx!.clearRect(0, 0, W, Hh);
      /* ground shadow, sphere body, limb */
      ctx!.save(); ctx!.translate(cx, cy + R * 1.04); ctx!.scale(1, 0.22);
      const sg = ctx!.createRadialGradient(0, 0, 0, 0, 0, R * 0.9); sg.addColorStop(0, "rgba(20,30,60,.22)"); sg.addColorStop(1, "rgba(20,30,60,0)");
      ctx!.fillStyle = sg; ctx!.beginPath(); ctx!.arc(0, 0, R * 0.9, 0, Math.PI * 2); ctx!.fill(); ctx!.restore();
      const bg = ctx!.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R); bg.addColorStop(0, "rgba(255,255,255,.98)"); bg.addColorStop(0.7, "rgba(236,241,250,.95)"); bg.addColorStop(1, "rgba(214,224,240,.9)");
      ctx!.fillStyle = bg; ctx!.beginPath(); ctx!.arc(cx, cy, R, 0, Math.PI * 2); ctx!.fill();
      ctx!.strokeStyle = "rgba(0,180,216,.35)"; ctx!.lineWidth = 1; ctx!.beginPath(); ctx!.arc(cx, cy, R + 0.5, 0, Math.PI * 2); ctx!.stroke();
      const lg = ctx!.createRadialGradient(cx, cy, R * 0.86, cx, cy, R * 1.06); lg.addColorStop(0, "rgba(0,229,255,0)"); lg.addColorStop(0.75, "rgba(0,229,255,.16)"); lg.addColorStop(1, "rgba(0,229,255,0)");
      ctx!.fillStyle = lg; ctx!.beginPath(); ctx!.arc(cx, cy, R * 1.06, 0, Math.PI * 2); ctx!.fill();
      /* gold glows: Britain always, landings fading */
      const ukp = rot(vec(54.5, -2.5), w);
      if (reveal > 0) glow(ukp[0], ukp[1], R * 0.22, 0.55 * Math.min(1, reveal * 2), ukp[2]);
      landings = landings.filter((l) => now - l.t < 2600);
      landings.forEach((l) => { const p = rot(l.v, w), f = 1 - (now - l.t) / 2600; glow(p[0], p[1], R * 0.17, 0.5 * f, p[2]); });
      /* points, batched by colour */
      const B = { ocean: [] as number[], land: [] as number[], uk: [] as number[] };
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i], q = rot(p.v, w); if (q[2] <= 0) continue;
        const ang = Math.acos(Math.max(-1, Math.min(1, p.dot)));
        let a = Math.max(0, Math.min(1, (reveal * 3.4 - ang) / 0.5)); if (a <= 0) continue;
        a *= 0.25 + 0.75 * Math.pow(q[2], 0.6);
        (p.uk ? B.uk : p.land ? B.land : B.ocean).push(q[0], q[1], a, q[2]);
      }
      draw(B.ocean, "#b9c6da", 1.5); draw(B.land, "#3f4f74", 2.3); ctx!.globalAlpha = 1;
      ctx!.shadowColor = "rgba(240,180,41,.9)"; ctx!.shadowBlur = 6; draw(B.uk, "#e8a71c", 3); ctx!.shadowBlur = 0; ctx!.globalAlpha = 1;
      /* arcs */
      if (on && el > 2000 && now >= nextArc) {
        const name = cities[cityI++ % cities.length], c = CITY[name];
        arcs.push({ name, iso: c[0], a: A, b: vec(c[1], c[2]), t: now, dur: 1700 + Math.random() * 500, done: false, land: 0 });
        nextArc = now + 2000 + Math.random() * 500;
      }
      arcs = arcs.filter((ar) => now - ar.t < ar.dur + 1500);
      ctx!.lineCap = "round";
      arcs.forEach((ar) => {
        const p = Math.min(1, (now - ar.t) / ar.dur), pe = 1 - Math.pow(1 - p, 2.2), head = pe, tail = Math.max(0, pe - 0.42), N = 40;
        let prev: [number, number, number] | null = null;
        for (let k = 0; k <= N; k++) {
          const s = tail + ((head - tail) * k) / N, q = rot(slerp(ar.a, ar.b, s, 0.3), w);
          if (prev && q[2] > -0.08 && prev[2] > -0.08) { const f = k / N; ctx!.strokeStyle = `rgba(0,190,230,${(0.15 + 0.85 * f * f) * Math.min(1, (q[2] + 0.08) * 4)})`; ctx!.lineWidth = 1 + 1.4 * f; ctx!.beginPath(); ctx!.moveTo(prev[0], prev[1]); ctx!.lineTo(q[0], q[1]); ctx!.stroke(); }
          prev = q;
        }
        if (prev && prev[2] > 0 && p < 1) { ctx!.fillStyle = "#00e5ff"; ctx!.shadowColor = "rgba(0,229,255,1)"; ctx!.shadowBlur = 10; ctx!.beginPath(); ctx!.arc(prev[0], prev[1], 2.6, 0, Math.PI * 2); ctx!.fill(); ctx!.shadowBlur = 0; }
        if (p >= 1) {
          if (!ar.done) { ar.done = true; ar.land = now; landings.push({ v: ar.b, t: now }); showChip(ar); }
          const f = (now - ar.land) / 1400, q = rot(ar.b, w);
          if (f < 1 && q[2] > 0) { ctx!.strokeStyle = `rgba(0,190,230,${1 - f})`; ctx!.lineWidth = 1.5; ctx!.beginPath(); ctx!.arc(q[0], q[1], 3 + f * 20, 0, Math.PI * 2); ctx!.stroke(); ctx!.fillStyle = "#f0b429"; ctx!.beginPath(); ctx!.arc(q[0], q[1], 2.6, 0, Math.PI * 2); ctx!.fill(); }
        }
      });
      /* London source dot + the label's leader */
      const lp = rot(A, w);
      if (lp[2] > 0 && reveal > 0.2) {
        ctx!.fillStyle = "#f0b429"; ctx!.shadowColor = "rgba(240,180,41,1)"; ctx!.shadowBlur = 12; ctx!.beginPath(); ctx!.arc(lp[0], lp[1], 3.4, 0, Math.PI * 2); ctx!.fill(); ctx!.shadowBlur = 0;
        ctx!.strokeStyle = "rgba(240,180,41,.55)"; ctx!.lineWidth = 1; ctx!.beginPath(); ctx!.arc(lp[0], lp[1], 7 + 3 * Math.sin(t * 3), 0, Math.PI * 2); ctx!.stroke();
        const lx = Math.min(W - 230, Math.max(8, lp[0] - 262)), ly = Math.max(6, lp[1] - 92);
        ctx!.strokeStyle = "rgba(138,84,0,.6)"; ctx!.setLineDash([3, 4]); ctx!.beginPath(); ctx!.moveTo(lx + 180, ly + 46); ctx!.lineTo(lp[0] - 10, lp[1] - 6); ctx!.stroke(); ctx!.setLineDash([]);
        label!.style.transform = `translate(${lx}px,${ly}px)`;
        if (!labelOn && el > 900) { labelOn = true; label!.classList.add("on"); }
      } else if (labelOn) { labelOn = false; label!.classList.remove("on"); }
      if (chipLL) { const q = rot(vec(chipLL[0], chipLL[1]), w); chip!.style.transform = `translate(${q[0]}px,${q[1] - 10}px) translate(-50%,-100%)`; chip!.style.opacity = q[2] > 0.05 && chipOn ? "" : "0"; }
      ctx!.globalAlpha = 1;
      if (vis && !document.hidden && (on || drag || Math.abs(vel) > 0.0005 || el < 3000)) raf = requestAnimationFrame(frame);
    }
    const start = () => { if (!raf && vis && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); } };
    startRef.current = start;
    const onDown = (ev: PointerEvent) => { drag = { x: ev.clientX, w: user }; vel = 0; stage!.setPointerCapture(ev.pointerId); start(); };
    const onMove = (ev: PointerEvent) => { if (!drag) return; const nu = drag.w + (ev.clientX - drag.x) * 0.0075; vel = (nu - user) * 0.5; user = nu; };
    const onUp = () => { drag = null; start(); };
    const onVis = () => { if (!document.hidden) start(); };
    stage.addEventListener("pointerdown", onDown); stage.addEventListener("pointermove", onMove); stage.addEventListener("pointerup", onUp); stage.addEventListener("pointercancel", onUp);
    document.addEventListener("visibilitychange", onVis);
    const io = new IntersectionObserver((en) => { vis = en[0].isIntersecting; if (vis) start(); }, { threshold: 0.05 });
    io.observe(stage);
    const ro = new ResizeObserver(() => { size(); start(); });
    ro.observe(stage);
    size();
    t0 = performance.now() + 350; if (!motionRef.current || reduced()) t0 = performance.now() - 5000;
    start();
    return () => {
      if (raf) cancelAnimationFrame(raf); raf = 0; startRef.current = () => {};
      clearTimeout(chipTimer); io.disconnect(); ro.disconnect();
      stage.removeEventListener("pointerdown", onDown); stage.removeEventListener("pointermove", onMove); stage.removeEventListener("pointerup", onUp); stage.removeEventListener("pointercancel", onUp);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const L = AXS.backdrop.label;
  return (
    <div className="stage" ref={stageRef}>
      <canvas ref={cvRef} aria-hidden="true" />
      <div className="glabel" ref={labelRef} aria-hidden="true">
        <span className="gl"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={ICONS.globe} /></svg></span>
        <span><div className="t1">{L.head}</div><div className="t2">{L.lead} · {L.brand}</div></span>
      </div>
      <div className="gchip" ref={chipRef} aria-hidden="true"><img ref={chipImgRef} alt="" /><b ref={chipTxtRef} /></div>
    </div>
  );
}
