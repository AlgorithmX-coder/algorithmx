"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { JetBrains_Mono } from "next/font/google";
import { setupHiDpiCanvas } from "@/app/lib/gameEngine/canvas";
import "./course-home.css";

/* The shared frame of the two Night Console course homes (landing lab round 6,
 * homes-a v1 DARK, owner 2026-11-23): /explorers and /operators/portfolio.
 *
 * It owns only the look around the page: the idle layer (the Explorers
 * reticle, or the Ops hairline grid with one travelling pulse on a canvas at
 * 30 fps, DPR capped at 1.5), the key light, the vignette, the entrance
 * (data-in on the root after first paint), scroll reveals (data-in on each
 * [data-reveal]), count-ups ([data-count]) and the Pause control. All state
 * is data-* attributes; the canvas stops when paused, when the tab is hidden
 * and under reduced motion. The pages keep every piece of their own data and
 * behaviour. */

const jet = JetBrains_Mono({ weight: ["400", "500", "700", "800"], subsets: ["latin"], variable: "--ch6-jet", display: "swap" });

type Course = "explorers" | "ops";
const PauseCtx = createContext<{ paused: boolean; toggle: () => void }>({ paused: false, toggle: () => {} });

/** The Pause control. Pages place it in their own chrome: on wide screens it
 * is fixed bottom left in the side gutter (never over text); narrower than
 * that it stays where the page put it, in the flow. */
export function CourseHomePause() {
  const { paused, toggle } = useContext(PauseCtx);
  return (
    <button className="ch6-motion" type="button" aria-pressed={paused} aria-label={paused ? "Play the background motion" : "Pause the background motion"} onClick={toggle}>
      <svg className="pa" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="5" y="4" width="5" height="16" rx="1" /><rect x="14" y="4" width="5" height="16" rx="1" /></svg>
      <svg className="pl" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4l14 8-14 8z" /></svg>
    </button>
  );
}

const reducedNow = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function countUp(el: HTMLElement, target: number, ms: number) {
  const t0 = performance.now();
  const tick = (now: number) => {
    const p = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - p, 3);
    el.textContent = String(Math.round(target * e));
    if (p < 1) requestAnimationFrame(tick); else el.textContent = String(target);
  };
  requestAnimationFrame(tick);
}

/* Ops idle: one pulse travels one grid line at a time. */
function opsPulse(host: HTMLElement, paused: () => boolean): () => void {
  const cv = document.createElement("canvas");
  host.appendChild(cv);
  let ctx: CanvasRenderingContext2D | null = null;
  const size = () => { const set = setupHiDpiCanvas(cv, { logicalWidth: window.innerWidth, logicalHeight: window.innerHeight, maxDpr: 1.5 }); ctx = set ? set.ctx : null; };
  size();
  window.addEventListener("resize", size);
  const Gs = 56;
  type Pulse = { horiz: boolean; pos: number; dir: number; p: number; dur: number };
  let pulse: Pulse | null = null, wait = 0.4, raf = 0, acc = 0, last = performance.now();
  const pick = (): Pulse => {
    const W = window.innerWidth, Hh = window.innerHeight, ox = (W / 2) % Gs, horiz = Math.random() < 0.5;
    const n = horiz ? Math.floor(Hh / Gs) : Math.floor(W / Gs), i = 1 + Math.floor(Math.random() * (n - 1));
    return { horiz, pos: horiz ? i * Gs : ox + i * Gs, dir: Math.random() < 0.5 ? 1 : -1, p: 0, dur: 2.2 + Math.random() * 1.2 };
  };
  const frame = (t: number) => {
    raf = 0;
    if (paused() || document.hidden) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (t - last) / 1000); last = t; acc += dt; if (acc < 1 / 30) return; acc = 0;
    const c = ctx; if (!c) return;
    const W = window.innerWidth, Hh = window.innerHeight; c.clearRect(0, 0, W, Hh);
    if (!pulse) { wait -= 1 / 30; if (wait <= 0) pulse = pick(); return; }
    pulse.p += 1 / 30 / pulse.dur; if (pulse.p >= 1) { pulse = null; wait = 0.5 + Math.random() * 0.6; return; }
    const ee = pulse.p < 0.5 ? 2 * pulse.p * pulse.p : 1 - Math.pow(-2 * pulse.p + 2, 2) / 2;
    const len = 160, L = pulse.horiz ? W : Hh, head = pulse.dir > 0 ? ee * (L + len) : L - ee * (L + len), a = Math.sin(pulse.p * Math.PI);
    const g = pulse.horiz ? c.createLinearGradient(head - pulse.dir * len, 0, head, 0) : c.createLinearGradient(0, head - pulse.dir * len, 0, head);
    g.addColorStop(0, "rgba(201,194,255,0)"); g.addColorStop(1, `rgba(201,194,255,${(0.9 * a).toFixed(3)})`);
    c.strokeStyle = g; c.lineWidth = 1.2; c.beginPath();
    if (pulse.horiz) { c.moveTo(head - pulse.dir * len, pulse.pos + 0.5); c.lineTo(head, pulse.pos + 0.5); } else { c.moveTo(pulse.pos + 0.5, head - pulse.dir * len); c.lineTo(pulse.pos + 0.5, head); }
    c.stroke(); c.fillStyle = `rgba(226,222,255,${(0.9 * a).toFixed(3)})`; c.beginPath();
    if (pulse.horiz) c.arc(head, pulse.pos + 0.5, 1.6, 0, 7); else c.arc(pulse.pos + 0.5, head, 1.6, 0, 7);
    c.fill();
  };
  const start = () => { if (!raf && !paused() && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); } };
  const onVis = () => start();
  document.addEventListener("visibilitychange", onVis);
  window.addEventListener("ch6:paused", onVis);
  start();
  return () => { if (raf) cancelAnimationFrame(raf); raf = 0; window.removeEventListener("resize", size); document.removeEventListener("visibilitychange", onVis); window.removeEventListener("ch6:paused", onVis); cv.remove(); };
}

const OPS_GRID: React.CSSProperties = {
  backgroundImage: "linear-gradient(rgba(var(--acc-rgb),.085) 1px,transparent 1px),linear-gradient(90deg,rgba(var(--acc-rgb),.085) 1px,transparent 1px)",
  backgroundSize: "56px 56px", backgroundPosition: "center top",
  maskImage: "radial-gradient(ellipse 80% 75% at 50% 42%,#000 30%,transparent 100%)",
  WebkitMaskImage: "radial-gradient(ellipse 80% 75% at 50% 42%,#000 30%,transparent 100%)",
};

export default function CourseHomeShell({ course, children }: { course: Course; children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const idleRef = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);

  useEffect(() => {
    pausedRef.current = paused;
    window.dispatchEvent(new Event("ch6:paused"));
  }, [paused]);

  /* entrance after the first paint; reveals and count-ups on scroll */
  useEffect(() => {
    const root = rootRef.current; if (!root) return;
    const reduced = reducedNow();
    let raf = requestAnimationFrame(() => { raf = requestAnimationFrame(() => setEntered(true)); });
    const counted = new WeakSet<Element>();
    const count = (el: HTMLElement) => { if (counted.has(el)) return; counted.add(el); const n = Number(el.dataset.count); if (!reduced && Number.isFinite(n) && n > 0) countUp(el, n, 1200); };
    root.querySelectorAll<HTMLElement>("[data-count]").forEach(count);
    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (reduced || !("IntersectionObserver" in window)) { els.forEach((el) => el.setAttribute("data-in", "")); return () => cancelAnimationFrame(raf); }
    /* Blocks already on screen show at once; only then are the rest armed
     * (hidden until scrolled to), so nothing waits on JavaScript to appear. */
    els.forEach((el) => { if (el.getBoundingClientRect().top < window.innerHeight) el.setAttribute("data-in", ""); });
    root.setAttribute("data-armed", "");
    const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { en.target.setAttribute("data-in", ""); io.unobserve(en.target); } }), { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });
    els.forEach((el) => { if (!el.hasAttribute("data-in")) io.observe(el); });
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
  }, []);

  /* the Ops idle canvas */
  useEffect(() => {
    const host = idleRef.current;
    if (course !== "ops" || !host || reducedNow()) return;
    return opsPulse(host, () => pausedRef.current);
  }, [course]);

  return (
    <PauseCtx.Provider value={{ paused, toggle: () => setPaused((p) => !p) }}>
      <div ref={rootRef} className={`ch6 ${jet.variable}`} data-course={course} data-in={entered ? "" : undefined} data-paused={paused ? "" : undefined}>
        <div className="ch6-idle" ref={idleRef} aria-hidden="true" style={course === "ops" ? OPS_GRID : undefined}>
          {course === "explorers" && (
            <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid meet" style={{ left: "50%", top: "50%", width: "min(140vh,120vw)", height: "min(140vh,120vw)", transform: "translate(-50%,-50%)" }} aria-hidden="true">
              <g className="ch6-ret" fill="none" stroke="rgba(var(--acc-rgb),.16)" strokeWidth="1">
                <circle cx="500" cy="500" r="190" /><circle cx="500" cy="500" r="300" stroke="rgba(var(--acc-rgb),.12)" /><circle cx="500" cy="500" r="420" stroke="rgba(var(--acc-rgb),.08)" />
                <g stroke="rgba(var(--keyw),.22)">
                  <path d="M500 60v40M500 900v40M60 500h40M900 500h40" /><path d="M500 120v18M500 862v18M120 500h18M862 500h18" stroke="rgba(var(--keyw),.14)" />
                  <circle cx="500" cy="500" r="360" stroke="rgba(var(--acc-rgb),.18)" strokeDasharray="2 22" className="ch6-ret-dash" />
                </g>
              </g>
            </svg>
          )}
        </div>
        <div className="ch6-key" aria-hidden="true"><i className="breath" /><i className="b" /></div>
        <div className="ch6-vig" aria-hidden="true" />
        {children}
      </div>
    </PauseCtx.Provider>
  );
}
