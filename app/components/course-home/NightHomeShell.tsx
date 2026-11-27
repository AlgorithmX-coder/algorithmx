"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { JetBrains_Mono } from "next/font/google";
import { setupHiDpiCanvas } from "@/app/lib/gameEngine/canvas";
import "./course-night.css";

/* The shared frame of the two adult course homes (landing lab round 6,
 * homes-b v1 DARK, owner 2026-11-23): /pro/course and /desk-ready/course.
 *
 * Owns only the look around the page: the key light, the idle backdrop (Pro:
 * drifting packet and hex tokens; Desk: faint office windows with a cursor),
 * drawn ONLY in the free side margins so nothing moves under text, at 30 fps
 * with DPR capped at 1.5, stopped by Pause, a hidden tab and reduced motion;
 * scroll reveals (data-in="1") and the Pause control. The pages keep all of
 * their own data and behaviour. */

const jet = JetBrains_Mono({ weight: ["400", "500", "600", "700", "800"], subsets: ["latin"], variable: "--hb6-jet", display: "swap" });

type Course = "pro" | "desk";
const PauseCtx = createContext<{ paused: boolean; toggle: () => void }>({ paused: false, toggle: () => {} });

export function NightHomePause() {
  const { paused, toggle } = useContext(PauseCtx);
  return (
    <button className="hb6-motion" type="button" aria-pressed={paused} aria-label={paused ? "Play motion" : "Pause motion"} onClick={toggle}>
      <svg className="pa" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><rect x="2" y="1.5" width="3" height="9" rx="1" /><rect x="7" y="1.5" width="3" height="9" rx="1" /></svg>
      <svg className="pl" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="M3 1.5v9l7.5-4.5z" /></svg>
    </button>
  );
}

const TOK = ["0x3f", "0x7a", "SYN", "ACK", "GET /login 302", "TLS 1.3", "sha256:", "DNS A 93.184", "POST /api 401", "icmp seq=4", "ARP who-has", "deny tcp any", "ssh -p 2222", "nmap -sV", "443/tcp open", "uid=1001", "grep -i fail", "0x00 0xff", "chmod 600", "HTTP/2 200"];

type Line = { y: number; t: string; a: number; hot: boolean };
type Col = { kind: "col"; x: number; v: number; lines: Line[] };
type Win = { x: number; y: number; w: number; h: number; lines: number; ph: number };
type Cur = { x: number; y: number; tx: number; ty: number; t: number; i: number; click: number; arm?: boolean };
type DeskItem = { kind: "desk"; wins: Win[]; cur: Cur };

function idle(cv: HTMLCanvasElement, root: HTMLElement, course: Course, paused: () => boolean, reduced: boolean): () => void {
  let ctx: CanvasRenderingContext2D | null = null;
  let W = 0, H = 0, items: Array<Col | DeskItem> = [], raf = 0, last = 0, acc = 0;
  const rnd = (a: number, b: number) => a + Math.random() * (b - a);
  const hex = () => Math.floor(Math.random() * 256).toString(16).padStart(2, "0");
  /* canvas fonts cannot read CSS variables, so take the resolved family off the canvas */
  const font = getComputedStyle(cv).fontFamily || "ui-monospace, monospace";
  const rr = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); };
  const layout = () => {
    W = window.innerWidth; H = window.innerHeight;
    const set = setupHiDpiCanvas(cv, { logicalWidth: W, logicalHeight: H, maxDpr: 1.5 }); ctx = set ? set.ctx : null;
    const main = root.querySelector(".hb6-main"); if (!main) return;
    const r = main.getBoundingClientRect();
    const zones: Array<{ x: number; w: number }> = [];
    if (r.left - 48 >= 120) zones.push({ x: 18, w: r.left - 48 });
    if (W - r.right - 48 >= 120) zones.push({ x: r.right + 30, w: W - r.right - 48 });
    items = [];
    for (const z of zones) {
      if (course === "pro") {
        const cols = Math.max(1, Math.min(3, Math.floor(z.w / 120)));
        for (let i = 0; i < cols; i++) {
          const lines: Line[] = [];
          const n = Math.ceil(H / 22) + 2;
          for (let k = 0; k < n; k++) lines.push({ y: k * 22 + rnd(0, 10), t: Math.random() < 0.55 ? `${hex()} ${hex()} ${hex()} ${hex()}` : TOK[(Math.random() * TOK.length) | 0], a: rnd(0.05, 0.18), hot: Math.random() < 0.08 });
          items.push({ kind: "col", x: z.x + i * (z.w / cols), v: rnd(6, 11), lines });
        }
      } else {
        const n = Math.max(1, Math.min(3, Math.floor(H / 260)));
        const wins: Win[] = [];
        const ww = Math.min(z.w, 300), wh = 150;
        for (let i = 0; i < n; i++) wins.push({ x: z.x + rnd(0, Math.max(0, z.w - ww)), y: 110 + i * ((H - 180) / n) + rnd(0, 30), w: ww, h: wh, lines: 4, ph: rnd(0, 6) });
        items.push({ kind: "desk", wins, cur: { x: wins[0].x + 40, y: wins[0].y + 70, tx: wins[0].x + 40, ty: wins[0].y + 70, t: rnd(0, 2), i: 0, click: 0 } });
      }
    }
  };
  const draw = (dt: number) => {
    const c = ctx; if (!c) return;
    c.clearRect(0, 0, W, H);
    const t = performance.now() / 1000;
    for (const it of items) {
      if (it.kind === "col") {
        c.font = `11px ${font}`; c.textBaseline = "top";
        for (const ln of it.lines) {
          ln.y -= it.v * dt;
          if (ln.y < -24) { ln.y += it.lines.length * 22; ln.t = Math.random() < 0.55 ? `${hex()} ${hex()} ${hex()} ${hex()}` : TOK[(Math.random() * TOK.length) | 0]; ln.hot = Math.random() < 0.08; }
          c.fillStyle = ln.hot ? `rgba(255,122,61,${(ln.a + 0.12).toFixed(3)})` : `rgba(255,228,205,${ln.a.toFixed(3)})`;
          c.fillText(ln.t, it.x, ln.y);
        }
      } else {
        const ink = "222,236,255";
        for (const w of it.wins) {
          const y = w.y + Math.sin(t * 0.5 + w.ph) * 3;
          c.strokeStyle = `rgba(${ink},.14)`; c.lineWidth = 1; c.fillStyle = `rgba(${ink},.03)`;
          rr(c, w.x, y, w.w, w.h, 8); c.fill(); c.stroke();
          c.fillStyle = `rgba(${ink},.22)`; for (let d = 0; d < 3; d++) { c.beginPath(); c.arc(w.x + 14 + d * 9, y + 13, 2.2, 0, 7); c.fill(); }
          c.fillStyle = `rgba(${ink},.1)`; for (let l = 0; l < w.lines; l++) { rr(c, w.x + 16, y + 38 + l * 18, [0.62, 0.48, 0.72, 0.4][l] * w.w, 5, 2.5); c.fill(); }
          c.strokeStyle = "rgba(127,178,255,.4)"; rr(c, w.x + w.w - 60, y + w.h - 28, 44, 14, 4); c.stroke();
        }
        const k = it.cur; k.t -= dt;
        if (k.t <= 0 && k.click <= 0) { k.i = (k.i + 1) % it.wins.length; const w = it.wins[k.i]; k.tx = w.x + w.w - 38; k.ty = w.y + w.h - 21; k.t = rnd(3.5, 6); k.arm = true; }
        const dx = k.tx - k.x, dy = k.ty - k.y;
        if (Math.hypot(dx, dy) > 0.5) { const f = Math.min(1, dt * 2.2); k.x += dx * f; k.y += dy * f; } else if (k.arm) { k.arm = false; k.click = 0.6; }
        if (k.click > 0) { k.click -= dt; const p = 1 - k.click / 0.6; c.strokeStyle = `rgba(127,178,255,${(0.5 * (1 - p)).toFixed(3)})`; c.lineWidth = 1.5; c.beginPath(); c.arc(k.x, k.y, 4 + p * 16, 0, 7); c.stroke(); }
        c.fillStyle = `rgba(${ink},.55)`; c.strokeStyle = "rgba(0,0,0,.4)"; c.lineWidth = 1;
        c.beginPath(); c.moveTo(k.x, k.y); c.lineTo(k.x, k.y + 13); c.lineTo(k.x + 3.5, k.y + 10); c.lineTo(k.x + 9, k.y + 10); c.closePath(); c.fill(); c.stroke();
      }
    }
  };
  const loop = (now: number) => {
    raf = 0;
    if (paused() || document.hidden) return;
    raf = requestAnimationFrame(loop);
    const dt = Math.min(0.1, (now - last) / 1000); last = now; acc += dt;
    if (acc < 1 / 30) return;
    const step = acc; acc = 0; draw(step);
  };
  const start = () => { if (!raf && !reduced && !paused() && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(loop); } };
  layout(); draw(0); start();
  let rt = 0;
  const onResize = () => { window.clearTimeout(rt); rt = window.setTimeout(() => { layout(); draw(0); }, 120); };
  window.addEventListener("resize", onResize);
  document.addEventListener("visibilitychange", start);
  window.addEventListener("hb6:paused", start);
  return () => { if (raf) cancelAnimationFrame(raf); raf = 0; window.clearTimeout(rt); window.removeEventListener("resize", onResize); document.removeEventListener("visibilitychange", start); window.removeEventListener("hb6:paused", start); };
}

export default function NightHomeShell({ course, children }: { course: Course; children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);

  useEffect(() => { pausedRef.current = paused; window.dispatchEvent(new Event("hb6:paused")); }, [paused]);

  useEffect(() => {
    const root = rootRef.current, cv = cvRef.current; if (!root || !cv) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stopIdle = idle(cv, root, course, () => pausedRef.current, reduced);
    /* reveals: data-in="1"; what is already on screen comes in with the hero */
    const show = (el: Element) => el.setAttribute("data-in", "1");
    const seen = new WeakSet<Element>();
    let io: IntersectionObserver | null = null;
    const watch = () => {
      const els = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]")).filter((el) => !seen.has(el));
      els.forEach((el) => seen.add(el));
      if (reduced || !("IntersectionObserver" in window)) { els.forEach(show); return; }
      if (!io) io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { show(en.target); io?.unobserve(en.target); } }), { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });
      els.forEach((el) => { if (el.getBoundingClientRect().top < window.innerHeight) show(el); else io?.observe(el); });
      root.setAttribute("data-armed", "");
    };
    const raf = requestAnimationFrame(watch);
    /* client pages fill in progress after mount; pick up blocks that appear later */
    const mo = new MutationObserver(() => watch());
    mo.observe(root, { childList: true, subtree: true });
    return () => { cancelAnimationFrame(raf); mo.disconnect(); io?.disconnect(); stopIdle(); };
  }, [course]);

  return (
    <PauseCtx.Provider value={{ paused, toggle: () => setPaused((p) => !p) }}>
      <div ref={rootRef} className={`hb6 ${jet.variable}`} data-course={course} data-paused={paused ? "" : undefined}>
        <div className="hb6-idle" aria-hidden="true"><canvas ref={cvRef} style={{ fontFamily: "var(--hb6-mono)" }} /></div>
        <div className="hb6-key" aria-hidden="true"><i className="breath" /><i className="b" /></div>
        {children}
      </div>
    </PauseCtx.Provider>
  );
}
