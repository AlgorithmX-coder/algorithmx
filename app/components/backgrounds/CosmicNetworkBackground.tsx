"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";

/**
 * CosmicNetworkBackground — a scroll-assembled, living 3D galaxy backdrop.
 *
 * The whole universe is a function of scroll position (just like the hero
 * laptop opening): at the top it's near-empty deep space; as you scroll down,
 * thousands of light particles stream inward and ASSEMBLE the spiral galaxy,
 * the nebula knots ignite, the colour glows bloom and the HUD network draws
 * in. Scroll back up and every bit of it detaches and scatters — because
 * position + brightness are pure functions of progress, it's exactly
 * reversible.
 *
 *   formP (0..1)  scroll formation progress (over ~1.6 viewports)
 *   Layer  CosmicBaseLayer    faint colour wash + HUD (opacity ramps with formP)
 *   Layer  NebulaGlows        colour glows that bloom + scale with formP
 *   Layer  FormationField     particle galaxy/nebula/stars that assemble (canvas)
 *   Layer  ConstellationNet   sparse HUD link network that draws in with formP
 *   Layer  BackgroundScrim    readability dim + navy gradient
 *
 * Fixed at z-index -1, pointer-events:none, aria-hidden. One rAF loop (the
 * field). Honours prefers-reduced-motion (renders the fully-formed scene,
 * static), pauses when the tab is hidden, caps DPR, and scales density /
 * disables parallax + shooting stars on smaller / touch devices.
 *
 * TUNING props: intensity, starDensity, enableParallax, enableShootingStars,
 * dimCenter, overlayDarkness, formationViewports.
 */

export interface CosmicNetworkBackgroundProps {
  intensity?: number;
  enableParallax?: boolean;
  enableShootingStars?: boolean;
  starDensity?: number;
  dimCenter?: boolean;
  /** Navy readability overlay opacity (0..1). */
  overlayDarkness?: number;
  /** Scroll distance (in viewport heights) over which the universe forms. */
  formationViewports?: number;
  className?: string;
}

type Tier = "mobile" | "tablet" | "desktop";

interface Capabilities {
  ready: boolean;
  reducedMotion: boolean;
  isTouch: boolean;
  tier: Tier;
}

/* small deterministic RNG so layouts are stable across renders */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smooth = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function useCapabilities(): Capabilities {
  const [caps, setCaps] = useState<Capabilities>({
    ready: false,
    reducedMotion: false,
    isTouch: false,
    tier: "desktop",
  });
  useEffect(() => {
    if (typeof window === "undefined") return;
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const touch = window.matchMedia("(pointer: coarse)");
    const mobile = window.matchMedia("(max-width: 640px)");
    const tablet = window.matchMedia("(max-width: 1024px)");
    const compute = () =>
      setCaps({
        ready: true,
        reducedMotion: rm.matches,
        isTouch: touch.matches,
        tier: mobile.matches ? "mobile" : tablet.matches ? "tablet" : "desktop",
      });
    compute();
    rm.addEventListener("change", compute);
    touch.addEventListener("change", compute);
    mobile.addEventListener("change", compute);
    tablet.addEventListener("change", compute);
    return () => {
      rm.removeEventListener("change", compute);
      touch.removeEventListener("change", compute);
      mobile.removeEventListener("change", compute);
      tablet.removeEventListener("change", compute);
    };
  }, []);
  return caps;
}

export default function CosmicNetworkBackground({
  intensity = 1,
  enableParallax = true,
  enableShootingStars = true,
  starDensity = 1,
  dimCenter = true,
  overlayDarkness = 0.3,
  formationViewports = 1.6,
  className,
}: CosmicNetworkBackgroundProps) {
  const caps = useCapabilities();

  /* scroll → formation progress (0..1). Reduced motion: lock fully formed. */
  const formP = useMotionValue(0);
  useEffect(() => {
    if (!caps.ready) return;
    if (caps.reducedMotion) {
      formP.set(1);
      return;
    }
    const update = () => {
      const range = Math.max(360, window.innerHeight * formationViewports);
      formP.set(clamp01(window.scrollY / range));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [caps.ready, caps.reducedMotion, formP, formationViewports]);

  const parallaxOn =
    enableParallax && !caps.reducedMotion && caps.tier !== "mobile";

  return (
    <div
      aria-hidden
      className={className}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
        overflow: "hidden",
        background: "#04050d",
        contain: "layout paint",
      }}
    >
      <CosmicBaseLayer tier={caps.tier} intensity={intensity} formP={formP} />
      <NebulaGlows reducedMotion={caps.reducedMotion} intensity={intensity} formP={formP} />
      <FormationField
        caps={caps}
        intensity={intensity}
        starDensity={starDensity}
        formP={formP}
        enableParallax={parallaxOn}
        enableShootingStars={
          enableShootingStars && !caps.reducedMotion && caps.tier !== "mobile"
        }
      />
      <ConstellationNetwork tier={caps.tier} reducedMotion={caps.reducedMotion} intensity={intensity} formP={formP} />
      <BackgroundScrim dimCenter={dimCenter} overlayDarkness={overlayDarkness} />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Base — faint colour wash + futuristic HUD (static canvas). Opacity ramps
 * with formP so deep space "deepens" as the universe forms. Camera drift +
 * scroll parallax give the living 3D feel.
 * ────────────────────────────────────────────────────────────────────── */
function paintCosmicBase(ctx: CanvasRenderingContext2D, w: number, h: number, tier: Tier) {
  const rnd = mulberry32(20260611);
  ctx.clearRect(0, 0, w, h);

  const base = ctx.createLinearGradient(0, 0, 0, h);
  base.addColorStop(0, "#060a16");
  base.addColorStop(0.5, "#05070f");
  base.addColorStop(1, "#03040a");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);

  const min = Math.min(w, h);

  /* faint colour clouds (the calm colour ground; the bright nebula bloom is
   * the CSS NebulaGlows + the particle knots) */
  type Cloud = { x: number; y: number; r: number; col: [number, number, number]; a: number };
  const clouds: Cloud[] = [
    { x: w * 0.82, y: h * 0.15, r: min * 0.34, col: [150, 95, 235], a: 0.3 },
    { x: w * 0.15, y: h * 0.64, r: min * 0.34, col: [60, 150, 245], a: 0.3 },
    { x: w * 0.52, y: h * 0.74, r: min * 0.22, col: [195, 80, 205], a: 0.16 },
    { x: w * 0.8, y: h * 0.62, r: min * 0.4, col: [70, 120, 235], a: 0.16 },
    { x: w * 0.45, y: h * 0.45, r: min * 0.55, col: [40, 70, 170], a: 0.08 },
  ];
  ctx.globalCompositeOperation = "lighter";
  for (const c of clouds) {
    for (let i = 0; i < 5; i++) {
      const ox = c.x + (rnd() - 0.5) * c.r * 0.8;
      const oy = c.y + (rnd() - 0.5) * c.r * 0.8;
      const rr = c.r * (0.4 + rnd() * 0.6);
      const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, rr);
      const [r, gn, b] = c.col;
      g.addColorStop(0, `rgba(${r},${gn},${b},${(c.a * (0.5 + rnd() * 0.5)) / 5})`);
      g.addColorStop(0.5, `rgba(${r},${gn},${b},${(c.a * 0.1) / 1})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }
  }

  /* ── faint futuristic HUD overlay ─────────────────────────────────────── */
  const PI2 = Math.PI * 2;
  const hud = (a: number) => `rgba(130,185,255,${a})`;
  ctx.lineWidth = 1;
  const rx = w * 0.1;
  const ry = h * 0.22;
  for (let i = 0; i < 4; i++) {
    const rr = min * (0.035 + i * 0.03);
    ctx.strokeStyle = hud(0.16 - i * 0.022);
    ctx.beginPath();
    const start = i % 2 ? -0.3 : 0.7;
    ctx.arc(rx, ry, rr, start, start + (i % 2 ? 4.4 : 5.3));
    ctx.stroke();
  }
  ctx.fillStyle = hud(0.4);
  ctx.beginPath();
  ctx.arc(rx, ry, 1.6, 0, PI2);
  ctx.fill();
  ctx.strokeStyle = hud(0.14);
  ctx.beginPath();
  ctx.moveTo(rx, ry);
  ctx.lineTo(rx + min * 0.13, ry - min * 0.055);
  ctx.stroke();
  for (const [fx, fy] of [
    [0.3, 0.11], [0.71, 0.4], [0.88, 0.31], [0.06, 0.46],
    [0.46, 0.16], [0.93, 0.72], [0.35, 0.88], [0.66, 0.27],
  ]) {
    const cx = fx * w;
    const cy = fy * h;
    ctx.strokeStyle = hud(0.24);
    ctx.beginPath();
    ctx.moveTo(cx - 4, cy);
    ctx.lineTo(cx + 4, cy);
    ctx.moveTo(cx, cy - 4);
    ctx.lineTo(cx, cy + 4);
    ctx.stroke();
  }
  const hx = w * 0.63;
  const hy = h * 0.54;
  const hr = min * 0.05;
  ctx.strokeStyle = hud(0.09);
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    const px = hx + Math.cos(a) * hr;
    const py = hy + Math.sin(a) * hr;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.strokeStyle = hud(0.12);
  ctx.beginPath();
  ctx.moveTo(w * 0.04, h * 0.86);
  ctx.lineTo(w * 0.12, h * 0.86);
  ctx.lineTo(w * 0.15, h * 0.9);
  ctx.lineTo(w * 0.23, h * 0.9);
  ctx.moveTo(w * 0.69, h * 0.08);
  ctx.lineTo(w * 0.78, h * 0.08);
  ctx.lineTo(w * 0.81, h * 0.12);
  ctx.stroke();
  ctx.save();
  ctx.setLineDash([4, 5]);
  ctx.strokeStyle = hud(0.14);
  ctx.beginPath();
  ctx.moveTo(w * 0.46, h * 0.93);
  ctx.lineTo(w * 0.6, h * 0.93);
  ctx.stroke();
  ctx.restore();

  ctx.globalCompositeOperation = "source-over";
  void tier;
}

function CosmicBaseLayer({
  tier,
  intensity,
  formP,
}: {
  tier: Tier;
  intensity: number;
  formP: MotionValue<number>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, tier === "mobile" ? 1 : 1.5);
      const w = window.innerWidth;
      const h = window.innerHeight * 1.12;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paintCosmicBase(ctx, w, h, tier);
    };
    draw();
    let t: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(draw);
      }, 200);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(t);
      cancelAnimationFrame(raf);
    };
  }, [tier]);

  /* base colour deepens as the scene forms */
  const opacity = useTransform(formP, [0, 1], [0.4 * intensity, Math.min(1, intensity)]);

  return (
    <>
      <div className="cnb-camera" style={{ position: "absolute", inset: 0 }}>
        <motion.canvas
          ref={canvasRef}
          style={{ position: "absolute", top: 0, left: 0, width: "100%", opacity }}
        />
      </div>
      <style jsx>{`
        .cnb-camera {
          will-change: transform;
          animation: cnbCamera 96s ease-in-out infinite alternate;
          transform-origin: 60% 60%;
        }
        @keyframes cnbCamera {
          0% { transform: translate3d(0, 0, 0) scale(1.02); }
          50% { transform: translate3d(1%, -0.7%, 0) scale(1.05); }
          100% { transform: translate3d(-0.8%, 0.5%, 0) scale(1.03); }
        }
        @media (prefers-reduced-motion: reduce) {
          .cnb-camera { animation: none !important; transform: scale(1.02); }
        }
      `}</style>
    </>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Nebula glows — colour blooms that grow + brighten as the scene forms.
 * ────────────────────────────────────────────────────────────────────── */
function NebulaGlows({
  reducedMotion,
  intensity,
  formP,
}: {
  reducedMotion: boolean;
  intensity: number;
  formP: MotionValue<number>;
}) {
  const opacity = useTransform(formP, [0, 0.35, 1], [0.12, 0.45, 1]);
  const scale = useTransform(formP, [0, 1], [0.78, 1]);
  const anim = (name: string, dur: number) =>
    reducedMotion ? undefined : `${name} ${dur}s ease-in-out infinite alternate`;
  return (
    <motion.div style={{ position: "absolute", inset: 0, opacity, scale, willChange: "transform, opacity" }}>
      <div
        className="cnb-glow"
        style={{
          top: "-16vmax",
          right: "-8vmax",
          width: "54vmax",
          height: "54vmax",
          background: `radial-gradient(circle, rgba(140,95,240,${0.4 * intensity}), transparent 62%)`,
          animation: anim("cnbDrift1", 64),
        }}
      />
      <div
        className="cnb-glow"
        style={{
          bottom: "-14vmax",
          left: "-12vmax",
          width: "52vmax",
          height: "52vmax",
          background: `radial-gradient(circle, rgba(45,150,240,${0.36 * intensity}), transparent 62%)`,
          animation: anim("cnbDrift2", 82),
        }}
      />
      <div
        className="cnb-glow"
        style={{
          top: "40vmax",
          right: "26vmax",
          width: "38vmax",
          height: "38vmax",
          background: `radial-gradient(circle, rgba(220,70,190,${0.18 * intensity}), transparent 60%)`,
          animation: anim("cnbDrift3", 96),
        }}
      />
      <style jsx>{`
        .cnb-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(58px);
          mix-blend-mode: screen;
          will-change: transform, opacity;
        }
        @keyframes cnbDrift1 {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          100% { transform: translate3d(-6vw, 5vh, 0) scale(1.12); }
        }
        @keyframes cnbDrift2 {
          0% { transform: translate3d(0, 0, 0) scale(1.05); }
          100% { transform: translate3d(7vw, -4vh, 0) scale(1); }
        }
        @keyframes cnbDrift3 {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          100% { transform: translate3d(-5vw, -6vh, 0) scale(1.18); }
        }
        @media (prefers-reduced-motion: reduce) {
          .cnb-glow { animation: none !important; }
        }
      `}</style>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Formation field — the assembling universe (one canvas, one rAF).
 * Each particle lerps from a dispersed position to its galaxy/nebula "home"
 * as formP rises, with a staggered window so they stream in (inner first).
 * ────────────────────────────────────────────────────────────────────── */
interface Particle {
  hx: number; hy: number; // home (fraction of w,h) — non-galaxy
  dx: number; dy: number; // dispersed (fraction)
  t0: number; t1: number; // formation window in formP
  size: number;
  baseA: number;
  hue: number; // 0 blue-white, 1 violet
  phase: number;
  tw: number;
  drift: number; // depth proxy for parallax + micro-drift
  /* galaxy stars store base-angle trig + radius so the spiral can spin every
   * frame (look identical when rot=0; just adds rotation) */
  gal: boolean;
  gCos: number; gSin: number; gRad: number; gjx: number; gjy: number;
}

const GCX = 0.8; // galaxy centre (fraction)
const GCY = 0.62;
const TILT = -0.5;
/* continuous galaxy spin (radians/sec) so it visibly moves as you scroll */
const GALAXY_SPIN = (Math.PI * 2) / 42;
/* max upward parallax drift (px) of the whole field across the page */
const FIELD_PARALLAX = 80;

function buildParticles(w: number, h: number, count: number): Particle[] {
  const rnd = mulberry32(1337 + count);
  const min = Math.min(w, h);
  const fx = min / w; // keep the galaxy round despite aspect
  const fy = min / h;
  const cx = 0.5;
  const cy = 0.5;
  const ps: Particle[] = [];

  const nG = Math.floor(count * 0.5);
  const nN = Math.floor(count * 0.18);
  const nF = count - nG - nN;
  const arms = 2;

  /* spiral galaxy (bottom-right) — winds in from outside, then spins */
  for (let i = 0; i < nG; i++) {
    const arm = i % arms;
    const t = Math.pow(rnd(), 0.85);
    const ang = (arm / arms) * Math.PI * 2 + t * Math.PI * 3.0 + (rnd() - 0.5) * 0.28;
    const rad = 0.03 + t * 0.2;
    /* dispersed: same arm, swung out + unwound */
    const dAng = ang + 0.9;
    const dRad = rad * 2.5 + 0.18;
    const dlx = Math.cos(dAng) * dRad;
    const dly = Math.sin(dAng) * dRad * 0.5;
    const drx = dlx * Math.cos(TILT) - dly * Math.sin(TILT);
    const dry = dlx * Math.sin(TILT) + dly * Math.cos(TILT);
    const t0 = 0.04 + t * 0.5 + rnd() * 0.05;
    ps.push({
      hx: 0, hy: 0, // galaxy home recomputed per frame (spin)
      gal: true,
      gCos: Math.cos(ang), gSin: Math.sin(ang), gRad: rad,
      gjx: (rnd() - 0.5) * 0.008, gjy: (rnd() - 0.5) * 0.008,
      dx: GCX + drx * fx + (rnd() - 0.5) * 0.1,
      dy: GCY + dry * fy + (rnd() - 0.5) * 0.1,
      t0, t1: Math.min(1, t0 + 0.32),
      size: 0.5 + rnd() * 1.4 * (1 - t * 0.4),
      baseA: 0.4 + rnd() * 0.5,
      hue: rnd() < 0.3 ? 1 : 0,
      phase: rnd() * 6.283,
      tw: rnd() < 0.4 ? 0.3 : 0.08,
      drift: 0.3 + rnd() * 0.7,
    });
  }

  /* nebula knots (violet TR, blue BL) — converge inward */
  const knots: Array<[number, number, number]> = [
    [0.8, 0.16, 1],
    [0.17, 0.64, 0],
  ];
  for (let i = 0; i < nN; i++) {
    const k = knots[i % 2];
    const a = rnd() * Math.PI * 2;
    const r = Math.pow(rnd(), 0.6) * 0.1;
    const hx = k[0] + Math.cos(a) * r;
    const hy = k[1] + Math.sin(a) * r * 0.85;
    const t0 = 0.18 + rnd() * 0.5;
    ps.push({
      hx, hy,
      gal: false, gCos: 0, gSin: 0, gRad: 0, gjx: 0, gjy: 0,
      dx: cx + (hx - cx) * 2.2 + (rnd() - 0.5) * 0.16,
      dy: cy + (hy - cy) * 2.2 + (rnd() - 0.5) * 0.16,
      t0, t1: Math.min(1, t0 + 0.3),
      size: 0.4 + rnd() * 1.2,
      baseA: 0.3 + rnd() * 0.5,
      hue: k[2] === 1 ? (rnd() < 0.7 ? 1 : 0) : rnd() < 0.4 ? 1 : 0,
      phase: rnd() * 6.283,
      tw: rnd() < 0.5 ? 0.35 : 0.1,
      drift: 0.4 + rnd() * 0.8,
    });
  }

  /* general field stars — drift in from beyond the edges */
  for (let i = 0; i < nF; i++) {
    const hx = rnd();
    const hy = rnd();
    const ex = 1.8 + rnd() * 0.9;
    const t0 = rnd() * 0.72;
    ps.push({
      hx, hy,
      gal: false, gCos: 0, gSin: 0, gRad: 0, gjx: 0, gjy: 0,
      dx: cx + (hx - cx) * ex + (rnd() - 0.5) * 0.08,
      dy: cy + (hy - cy) * ex + (rnd() - 0.5) * 0.08,
      t0, t1: Math.min(1, t0 + 0.3),
      size: 0.3 + rnd() * 0.95,
      baseA: 0.2 + rnd() * 0.45,
      hue: rnd() < 0.22 ? 1 : 0,
      phase: rnd() * 6.283,
      tw: rnd() < 0.35 ? 0.3 : 0.06,
      drift: 0.2 + rnd() * 1.0,
    });
  }
  return ps;
}

function FormationField({
  caps,
  intensity,
  starDensity,
  formP,
  enableParallax,
  enableShootingStars,
}: {
  caps: Capabilities;
  intensity: number;
  starDensity: number;
  formP: MotionValue<number>;
  enableParallax: boolean;
  enableShootingStars: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { tier, reducedMotion } = caps;

  const count = useMemo(() => {
    const baseCount = tier === "mobile" ? 240 : tier === "tablet" ? 460 : 640;
    return Math.max(80, Math.round(baseCount * starDensity));
  }, [tier, starDensity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, tier === "mobile" ? 1 : 1.5);
    let w = 0;
    let h = 0;
    let particles: Particle[] = [];
    let motes: Array<{ x: number; y: number; s: number; a: number; ph: number }> = [];
    let coreGrad: CanvasGradient | null = null;
    let docScroll = 1;
    let scrollY = typeof window !== "undefined" ? window.scrollY : 0;

    const build = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      docScroll = Math.max(1, document.documentElement.scrollHeight - h);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = buildParticles(w, h, count);
      /* hoist the galaxy-core gradient (geometry only changes on resize) so
       * it isn't reallocated every animation frame */
      coreGrad = ctx.createRadialGradient(GCX * w, GCY * h, 0, GCX * w, GCY * h, Math.min(w, h) * 0.12);
      coreGrad.addColorStop(0, "rgba(245,248,255,1)");
      coreGrad.addColorStop(0.35, "rgba(190,205,255,0.4)");
      coreGrad.addColorStop(1, "rgba(150,180,255,0)");
      const rnd = mulberry32(404);
      const mc = tier === "mobile" ? 18 : 40;
      motes = Array.from({ length: mc }, () => ({
        x: rnd(), y: rnd(), s: rnd() * 0.8 + 0.3, a: 0.06 + rnd() * 0.12, ph: rnd() * 6.283,
      }));
    };
    build();
    let rt: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(rt);
      rt = setTimeout(build, 180);
    };
    window.addEventListener("resize", onResize);

    /* cursor parallax (eased) */
    const target = { x: 0, y: 0 };
    const eased = { x: 0, y: 0 };
    const onPointer = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    if (enableParallax) window.addEventListener("pointermove", onPointer, { passive: true });

    /* page scroll drives the field parallax drift */
    const onPageScroll = () => {
      scrollY = window.scrollY;
    };
    window.addEventListener("scroll", onPageScroll, { passive: true });

    const TWO_PI = Math.PI * 2;

    const drawCore = (p: number, parY: number) => {
      const a = smooth((p - 0.42) / 0.5) * 0.85 * intensity;
      if (a <= 0.01 || !coreGrad) return;
      const r = Math.min(w, h) * 0.12;
      ctx.save();
      ctx.translate(0, parY);
      ctx.globalAlpha = a;
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(GCX * w, GCY * h, r, 0, TWO_PI);
      ctx.fill();
      ctx.restore();
    };

    const renderParticles = (p: number, ts: number, motion: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      const gmin = Math.min(w, h);
      const gfx = gmin / w;
      const gfy = gmin / h;
      const cosT = Math.cos(TILT);
      const sinT = Math.sin(TILT);
      const rot = motion ? ts * GALAXY_SPIN : 0;
      const cosR = Math.cos(rot);
      const sinR = Math.sin(rot);
      /* whole field drifts gently upward as you scroll (parallax depth) */
      const parY = motion ? -clamp01(scrollY / docScroll) * FIELD_PARALLAX : 0;

      /* always-on faint motes so the top of the page isn't pure black */
      for (const m of motes) {
        const tw = motion ? 1 + Math.sin(ts * 0.6 + m.ph) * 0.4 : 1;
        const a = m.a * tw * intensity;
        ctx.fillStyle = `rgba(200,220,255,${a})`;
        ctx.beginPath();
        ctx.arc(m.x * w, m.y * h + parY, m.s, 0, TWO_PI);
        ctx.fill();
      }

      drawCore(p, parY);

      for (let i = 0; i < particles.length; i++) {
        const s = particles[i];
        /* galaxy stars: recompute spinning home each frame (angle addition,
         * no per-particle trig) */
        let hx = s.hx;
        let hy = s.hy;
        if (s.gal) {
          const cosA = s.gCos * cosR - s.gSin * sinR;
          const sinA = s.gSin * cosR + s.gCos * sinR;
          const lx = cosA * s.gRad;
          const ly = sinA * s.gRad * 0.5;
          hx = GCX + (lx * cosT - ly * sinT) * gfx + s.gjx;
          hy = GCY + (lx * sinT + ly * cosT) * gfy + s.gjy;
        }
        const lp = smooth((p - s.t0) / (s.t1 - s.t0));
        if (lp <= 0.001) continue;
        let x = lerp(s.dx, hx, lp) * w;
        let y = lerp(s.dy, hy, lp) * h + parY;
        if (motion) {
          const dr = s.drift;
          x += eased.x * (2 + dr * 9) + Math.sin(ts * 0.18 + s.phase) * dr * 2.2;
          y += eased.y * (2 + dr * 9) + Math.cos(ts * 0.15 + s.phase) * dr * 2.0;
        }
        const twk = motion && s.tw > 0.1 ? 1 + Math.sin(ts * (0.5 + s.drift) + s.phase) * s.tw : 1;
        const alpha = clamp01(s.baseA * lp * twk * intensity);
        if (alpha < 0.02) continue;
        const size = lerp(s.size * 0.5, s.size, lp);
        ctx.fillStyle = s.hue === 1 ? `rgba(186,158,255,${alpha})` : `rgba(208,226,255,${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, TWO_PI);
        ctx.fill();
        /* soft halo on the brightest formed stars */
        if (size > 1.5 && alpha > 0.4) {
          ctx.fillStyle = s.hue === 1 ? `rgba(150,120,255,${alpha * 0.1})` : `rgba(150,200,255,${alpha * 0.1})`;
          ctx.beginPath();
          ctx.arc(x, y, size * 2.6, 0, TWO_PI);
          ctx.fill();
        }
      }
      ctx.globalCompositeOperation = "source-over";
    };

    /* reduced motion / SSR-safe: render the fully-formed scene once */
    if (reducedMotion) {
      renderParticles(1, 0, 0);
      const onResizeStatic = () => {
        build();
        renderParticles(1, 0, 0);
      };
      window.addEventListener("resize", onResizeStatic);
      return () => {
        window.removeEventListener("resize", onResizeStatic);
        window.removeEventListener("resize", onResize);
        window.removeEventListener("scroll", onPageScroll);
        if (enableParallax) window.removeEventListener("pointermove", onPointer);
        clearTimeout(rt);
      };
    }

    /* shooting stars (only once the field is mostly formed) */
    let shoot: { x: number; y: number; vx: number; vy: number; life: number; max: number; len: number } | null = null;
    let nextShootAt = 8000 + Math.random() * 12000;

    let raf = 0;
    let running = true;
    let last = performance.now();
    let elapsed = 0;

    const frame = (now: number) => {
      if (!running) return;
      const dt = Math.min(64, now - last);
      last = now;
      elapsed += dt;
      const ts = elapsed * 0.001;
      eased.x += (target.x - eased.x) * 0.045;
      eased.y += (target.y - eased.y) * 0.045;

      const p = formP.get();
      renderParticles(p, ts, 1);

      if (enableShootingStars && p > 0.5) {
        if (!shoot && elapsed > nextShootAt) {
          const fromLeft = Math.random() < 0.5;
          const sxp = fromLeft ? Math.random() * 0.3 : 0.7 + Math.random() * 0.3;
          const speed = (w + h) * 0.0006;
          const dir = fromLeft ? 1 : -1;
          shoot = {
            x: sxp * w, y: Math.random() * h * 0.4,
            vx: dir * speed * (0.8 + Math.random() * 0.5),
            vy: speed * (0.5 + Math.random() * 0.4),
            life: 0, max: 900 + Math.random() * 500, len: 120 + Math.random() * 120,
          };
        }
        if (shoot) {
          shoot.life += dt;
          shoot.x += shoot.vx * dt;
          shoot.y += shoot.vy * dt;
          const sp = shoot.life / shoot.max;
          const fade = Math.sin(Math.PI * sp);
          const ang = Math.atan2(shoot.vy, shoot.vx);
          const tx = shoot.x - Math.cos(ang) * shoot.len;
          const ty = shoot.y - Math.sin(ang) * shoot.len;
          const grad = ctx.createLinearGradient(shoot.x, shoot.y, tx, ty);
          grad.addColorStop(0, `rgba(220,238,255,${0.9 * fade})`);
          grad.addColorStop(0.4, `rgba(120,180,255,${0.4 * fade})`);
          grad.addColorStop(1, "rgba(120,180,255,0)");
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.6;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(shoot.x, shoot.y);
          ctx.lineTo(tx, ty);
          ctx.stroke();
          if (sp >= 1) {
            shoot = null;
            nextShootAt = elapsed + 12000 + Math.random() * 13000;
          }
        }
      }

      raf = requestAnimationFrame(frame);
    };

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    raf = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      clearTimeout(rt);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onPageScroll);
      if (enableParallax) window.removeEventListener("pointermove", onPointer);
    };
  }, [count, tier, reducedMotion, enableParallax, enableShootingStars, intensity, formP]);

  return (
    <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Constellation HUD network — sparse links that draw in with formP.
 * ────────────────────────────────────────────────────────────────────── */
function ConstellationNetwork({
  tier,
  reducedMotion,
  intensity,
  formP,
}: {
  tier: Tier;
  reducedMotion: boolean;
  intensity: number;
  formP: MotionValue<number>;
}) {
  const { nodes, links } = useMemo(() => {
    const rnd = mulberry32(7);
    const n = tier === "mobile" ? 0 : tier === "tablet" ? 9 : 14;
    const ns = Array.from({ length: n }, () => {
      const edge = rnd();
      let x: number;
      let y: number;
      if (edge < 0.5) {
        x = rnd() < 0.5 ? rnd() * 26 : 74 + rnd() * 26;
        y = rnd() * 100;
      } else {
        x = rnd() * 100;
        y = rnd() < 0.5 ? rnd() * 24 : 76 + rnd() * 24;
      }
      return { x, y, pulse: rnd() < 0.5 };
    });
    const ls: { a: number; b: number; flow: boolean }[] = [];
    for (let i = 0; i < ns.length; i++) {
      let best = -1;
      let bestD = Infinity;
      for (let j = 0; j < ns.length; j++) {
        if (i === j) continue;
        const d = (ns[i].x - ns[j].x) ** 2 + (ns[i].y - ns[j].y) ** 2;
        if (d < bestD && d < 30 * 30) {
          bestD = d;
          best = j;
        }
      }
      if (best >= 0 && best > i) ls.push({ a: i, b: best, flow: rnd() < 0.35 });
    }
    return { nodes: ns, links: ls };
  }, [tier]);

  const opacity = useTransform(formP, [0.25, 0.9], [0, 0.7 * intensity]);

  if (tier === "mobile" || nodes.length === 0) return null;

  return (
    <motion.svg
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ position: "absolute", inset: 0, opacity }}
    >
      {links.map((l, i) => {
        const a = nodes[l.a];
        const b = nodes[l.b];
        return (
          <line
            key={`l${i}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="rgba(120,190,255,0.18)"
            strokeWidth={0.08}
            vectorEffect="non-scaling-stroke"
          >
            {l.flow && !reducedMotion && (
              <animate
                attributeName="stroke"
                values="rgba(120,190,255,0.12);rgba(150,215,255,0.5);rgba(120,190,255,0.12)"
                dur={`${6 + (i % 5)}s`}
                repeatCount="indefinite"
              />
            )}
          </line>
        );
      })}
      {nodes.map((nd, i) => (
        <circle key={`n${i}`} cx={nd.x} cy={nd.y} r={0.32} fill="rgba(160,210,255,0.6)">
          {nd.pulse && !reducedMotion && (
            <animate
              attributeName="opacity"
              values="0.25;0.9;0.25"
              dur={`${5 + (i % 6)}s`}
              repeatCount="indefinite"
            />
          )}
        </circle>
      ))}
    </motion.svg>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Readability — central dim + navy gradient scrim.
 * ────────────────────────────────────────────────────────────────────── */
function BackgroundScrim({ dimCenter, overlayDarkness }: { dimCenter: boolean; overlayDarkness: number }) {
  return (
    <>
      {dimCenter && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 70% 55% at 50% 48%, rgba(3,4,10,0.6) 0%, rgba(3,4,10,0.3) 42%, rgba(3,4,10,0) 72%)",
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(to bottom, rgba(3,4,10,${Math.min(0.8, overlayDarkness + 0.2)}) 0%, rgba(3,4,10,0) 24%, rgba(3,4,10,0) 100%)`,
        }}
      />
    </>
  );
}
