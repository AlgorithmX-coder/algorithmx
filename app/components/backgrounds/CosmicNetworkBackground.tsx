"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";

/**
 * CosmicNetworkBackground — a living, cinematic, futuristic galaxy backdrop
 * for AlgorithmX. Procedurally generated (no source image), built from
 * several independent, GPU-friendly layers so it reads as a deep-space
 * technology universe rather than a particle demo:
 *
 *   Layer 1  CosmicBaseLayer      baked nebula + spiral-galaxy canvas (static)
 *   Layer 4  NebulaGlows          huge blurred radial glows drifting slowly
 *   Layer 2/3 StarField           depth-parallaxed star field (canvas, animated)
 *   Layer 6  (shooting stars)     rare streaks, folded into the StarField loop
 *   Layer 5  ConstellationNetwork sparse HUD line/node network (SVG, edge-biased)
 *   Readability BackgroundScrim   central dim + top/bottom navy gradient
 *
 * Sits fixed at z-index -1, pointer-events:none, aria-hidden. Honours
 * prefers-reduced-motion, pauses when the tab is hidden, caps DPR, and
 * scales density / disables parallax + shooting stars on smaller / touch
 * devices. One animation frame loop total (the StarField); every other
 * layer is static or pure CSS animation.
 *
 * TUNING (props with sensible defaults):
 *   intensity          overall glow/brightness multiplier        (default 1)
 *   enableParallax     cursor + scroll parallax                   (default true)
 *   enableShootingStars                                           (default true)
 *   starDensity        multiplier on star counts                  (default 1)
 *   dimCenter          extra central darkening for readability    (default true)
 */

export interface CosmicNetworkBackgroundProps {
  intensity?: number;
  enableParallax?: boolean;
  enableShootingStars?: boolean;
  starDensity?: number;
  dimCenter?: boolean;
  /** Base cosmic image (place in /public). Falls back to the procedural
   *  galaxy if the file is missing, so the background never breaks. */
  imageSrc?: string;
  /** Navy overlay opacity on top of the image, for text contrast (0..1). */
  overlayDarkness?: number;
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
  imageSrc,
  overlayDarkness = 0.3,
  className,
}: CosmicNetworkBackgroundProps) {
  const caps = useCapabilities();
  const { scrollY } = useScroll();

  /* slow vertical parallax for the deep layers (distant moves least) */
  const baseY = useTransform(scrollY, [0, 4000], [0, -60]);
  const nebulaY = useTransform(scrollY, [0, 4000], [0, -110]);

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
      <CosmicBaseLayer
        tier={caps.tier}
        intensity={intensity}
        y={parallaxOn ? baseY : undefined}
        imageSrc={imageSrc}
        overlayDarkness={overlayDarkness}
      />
      <NebulaGlows reducedMotion={caps.reducedMotion} intensity={intensity} y={parallaxOn ? nebulaY : undefined} />
      <StarField
        caps={caps}
        intensity={intensity}
        starDensity={starDensity}
        enableParallax={parallaxOn}
        enableShootingStars={
          enableShootingStars && !caps.reducedMotion && caps.tier !== "mobile"
        }
      />
      <ConstellationNetwork tier={caps.tier} reducedMotion={caps.reducedMotion} intensity={intensity} />
      <BackgroundScrim dimCenter={dimCenter} />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Layer 1 — baked nebula + spiral galaxy (static canvas, redrawn on resize)
 * ────────────────────────────────────────────────────────────────────── */
function paintCosmicBase(ctx: CanvasRenderingContext2D, w: number, h: number, tier: Tier) {
  const rnd = mulberry32(20260607);
  ctx.clearRect(0, 0, w, h);

  /* deep-space vertical base */
  const base = ctx.createLinearGradient(0, 0, 0, h);
  base.addColorStop(0, "#060a16");
  base.addColorStop(0.5, "#05070f");
  base.addColorStop(1, "#03040a");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);

  const min = Math.min(w, h);

  /* nebula clouds — layered soft radial blobs matching the reference photo:
   * bright violet cluster top-right, blue/cyan cloud bottom-left, a soft
   * magenta core low-centre, and the galaxy halo bottom-right. */
  type Cloud = { x: number; y: number; r: number; col: [number, number, number]; a: number };
  const clouds: Cloud[] = [
    { x: w * 0.82, y: h * 0.15, r: min * 0.34, col: [150, 95, 235], a: 0.62 }, // violet cluster TR
    { x: w * 0.9, y: h * 0.1, r: min * 0.2, col: [120, 110, 255], a: 0.5 },
    { x: w * 0.75, y: h * 0.2, r: min * 0.16, col: [205, 130, 255], a: 0.4 }, // pink highlight TR
    { x: w * 0.15, y: h * 0.64, r: min * 0.34, col: [60, 150, 245], a: 0.6 }, // cyan-blue cloud BL
    { x: w * 0.11, y: h * 0.7, r: min * 0.2, col: [150, 100, 240], a: 0.42 }, // violet edge BL
    { x: w * 0.26, y: h * 0.6, r: min * 0.14, col: [120, 200, 255], a: 0.4 }, // cyan highlight BL
    { x: w * 0.52, y: h * 0.74, r: min * 0.22, col: [195, 80, 205], a: 0.3 }, // magenta core low-centre
    { x: w * 0.62, y: h * 0.84, r: min * 0.16, col: [165, 80, 220], a: 0.26 },
    { x: w * 0.8, y: h * 0.62, r: min * 0.4, col: [70, 120, 235], a: 0.34 }, // galaxy halo BR
    { x: w * 0.45, y: h * 0.45, r: min * 0.55, col: [40, 70, 170], a: 0.1 }, // faint deep wash
  ];
  ctx.globalCompositeOperation = "lighter";
  for (const c of clouds) {
    /* break each cloud into a few offset sub-blobs for organic turbulence */
    for (let i = 0; i < 6; i++) {
      const ox = c.x + (rnd() - 0.5) * c.r * 0.8;
      const oy = c.y + (rnd() - 0.5) * c.r * 0.8;
      const rr = c.r * (0.4 + rnd() * 0.6);
      const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, rr);
      const [r, gn, b] = c.col;
      g.addColorStop(0, `rgba(${r},${gn},${b},${(c.a * (0.5 + rnd() * 0.5)) / 6})`);
      g.addColorStop(0.5, `rgba(${r},${gn},${b},${(c.a * 0.1) / 1})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }
  }
  /* tiny bright knots inside the two main nebulae (star-forming glints) */
  for (const knot of [
    { x: w * 0.8, y: h * 0.16 },
    { x: w * 0.18, y: h * 0.64 },
  ]) {
    for (let i = 0; i < 9; i++) {
      const kx = knot.x + (rnd() - 0.5) * min * 0.16;
      const ky = knot.y + (rnd() - 0.5) * min * 0.16;
      const kr = rnd() * min * 0.012 + 1;
      const g = ctx.createRadialGradient(kx, ky, 0, kx, ky, kr * 6);
      g.addColorStop(0, `rgba(220,225,255,${0.5 * rnd() + 0.2})`);
      g.addColorStop(1, "rgba(120,140,255,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(kx, ky, kr * 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /* wispy filaments inside the two main nebulae for HD texture (elongated,
   * very faint soft streaks rather than uniform blobs) */
  for (const f of [
    { x: w * 0.8, y: h * 0.16, ang: -0.6, col: [185, 125, 255] as const },
    { x: w * 0.17, y: h * 0.64, ang: 0.5, col: [95, 170, 250] as const },
  ]) {
    for (let i = 0; i < 5; i++) {
      ctx.save();
      ctx.translate(f.x + (rnd() - 0.5) * min * 0.14, f.y + (rnd() - 0.5) * min * 0.14);
      ctx.rotate(f.ang + (rnd() - 0.5) * 0.8);
      ctx.scale(1, 0.28);
      const fr = min * (0.05 + rnd() * 0.09);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, fr);
      g.addColorStop(0, `rgba(${f.col[0]},${f.col[1]},${f.col[2]},${0.05 + rnd() * 0.04})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, fr, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  /* spiral galaxy bottom-right — bright core + logarithmic-spiral arms */
  const gx = w * 0.82;
  const gy = h * 0.62;
  const gr = min * 0.2;
  const tilt = -0.5;
  ctx.save();
  ctx.translate(gx, gy);
  ctx.rotate(tilt);
  ctx.scale(1, 0.5); // disc perspective
  /* disc halo */
  const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, gr * 1.6);
  halo.addColorStop(0, "rgba(180,200,255,0.5)");
  halo.addColorStop(0.3, "rgba(90,130,240,0.18)");
  halo.addColorStop(1, "rgba(40,80,200,0)");
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(0, 0, gr * 1.6, 0, Math.PI * 2);
  ctx.fill();
  /* spiral arms as drifts of faint stars */
  const arms = 2;
  const starsPerArm = tier === "mobile" ? 220 : 520;
  for (let arm = 0; arm < arms; arm++) {
    const base0 = (arm / arms) * Math.PI * 2;
    for (let i = 0; i < starsPerArm; i++) {
      const t = i / starsPerArm;
      const ang = base0 + t * Math.PI * 3.2;
      const rad = gr * 0.12 + t * gr * 1.35;
      const jitter = (rnd() - 0.5) * gr * 0.16 * (0.3 + t);
      const px = Math.cos(ang) * rad + (rnd() - 0.5) * gr * 0.12;
      const py = Math.sin(ang) * rad + jitter;
      const a = (1 - t) * 0.5 * (0.4 + rnd() * 0.6);
      ctx.fillStyle =
        rnd() < 0.25
          ? `rgba(190,170,255,${a})`
          : `rgba(170,205,255,${a})`;
      ctx.beginPath();
      ctx.arc(px, py, rnd() * 1.3 + 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
  /* galaxy core glint (drawn un-scaled so it stays round + bright) */
  const core = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr * 0.5);
  core.addColorStop(0, "rgba(245,248,255,0.9)");
  core.addColorStop(0.4, "rgba(190,205,255,0.35)");
  core.addColorStop(1, "rgba(150,180,255,0)");
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(gx, gy, gr * 0.5, 0, Math.PI * 2);
  ctx.fill();

  /* baked faint stars across the whole field for density */
  const bakedStars = tier === "mobile" ? 260 : tier === "tablet" ? 460 : 720;
  for (let i = 0; i < bakedStars; i++) {
    const x = rnd() * w;
    const y = rnd() * h;
    const s = rnd();
    const a = s < 0.85 ? 0.12 + rnd() * 0.35 : 0.5 + rnd() * 0.4;
    const size = s < 0.85 ? rnd() * 0.9 + 0.2 : rnd() * 1.3 + 0.7;
    ctx.fillStyle =
      rnd() < 0.2 ? `rgba(150,120,255,${a})` : `rgba(200,220,255,${a})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  /* hero stars — a few bright stars with a glow + 4-point diffraction spike
   * for that crisp, high-definition sparkle */
  const brightN = tier === "mobile" ? 6 : tier === "tablet" ? 11 : 16;
  for (let i = 0; i < brightN; i++) {
    const x = rnd() * w;
    const y = rnd() * h;
    const a = 0.55 + rnd() * 0.4;
    const violet = rnd() < 0.3;
    const col = violet ? "rgba(205,185,255," : "rgba(216,233,255,";
    const gr2 = 7 + rnd() * 9;
    const g = ctx.createRadialGradient(x, y, 0, x, y, gr2);
    g.addColorStop(0, `${col}${a * 0.85})`);
    g.addColorStop(1, `${col}0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, gr2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `${col}${a})`;
    ctx.beginPath();
    ctx.arc(x, y, 1 + rnd() * 0.7, 0, Math.PI * 2);
    ctx.fill();
    const sp = 5 + rnd() * 8;
    ctx.strokeStyle = `${col}${a * 0.45})`;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(x - sp, y);
    ctx.lineTo(x + sp, y);
    ctx.moveTo(x, y - sp);
    ctx.lineTo(x, y + sp);
    ctx.stroke();
  }

  /* ── faint futuristic HUD overlay (matches the reference photo) ───────── */
  const PI2 = Math.PI * 2;
  const hud = (a: number) => `rgba(130,185,255,${a})`;
  ctx.lineWidth = 1;

  /* concentric scanner rings, top-left */
  const rx = w * 0.1;
  const ry = h * 0.22;
  for (let i = 0; i < 4; i++) {
    const rr = min * (0.035 + i * 0.03);
    ctx.strokeStyle = hud(0.2 - i * 0.025);
    ctx.beginPath();
    const start = i % 2 ? -0.3 : 0.7;
    ctx.arc(rx, ry, rr, start, start + (i % 2 ? 4.4 : 5.3));
    ctx.stroke();
  }
  ctx.fillStyle = hud(0.5);
  ctx.beginPath();
  ctx.arc(rx, ry, 1.6, 0, PI2);
  ctx.fill();
  ctx.strokeStyle = hud(0.16);
  ctx.beginPath();
  ctx.moveTo(rx, ry);
  ctx.lineTo(rx + min * 0.13, ry - min * 0.055);
  ctx.stroke();

  /* small registration crosses, edge-biased (centre kept clear) */
  for (const [fx, fy] of [
    [0.3, 0.11], [0.71, 0.4], [0.88, 0.31], [0.06, 0.46],
    [0.46, 0.16], [0.93, 0.72], [0.35, 0.88], [0.66, 0.27],
  ]) {
    const cx = fx * w;
    const cy = fy * h;
    ctx.strokeStyle = hud(0.28);
    ctx.beginPath();
    ctx.moveTo(cx - 4, cy);
    ctx.lineTo(cx + 4, cy);
    ctx.moveTo(cx, cy - 4);
    ctx.lineTo(cx, cy + 4);
    ctx.stroke();
  }

  /* faint hexagon glyph, mid-right */
  const hx = w * 0.63;
  const hy = h * 0.54;
  const hr = min * 0.05;
  ctx.strokeStyle = hud(0.1);
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

  /* circuit traces with end nodes, lower-left + top */
  ctx.strokeStyle = hud(0.14);
  ctx.beginPath();
  ctx.moveTo(w * 0.04, h * 0.86);
  ctx.lineTo(w * 0.12, h * 0.86);
  ctx.lineTo(w * 0.15, h * 0.9);
  ctx.lineTo(w * 0.23, h * 0.9);
  ctx.moveTo(w * 0.69, h * 0.08);
  ctx.lineTo(w * 0.78, h * 0.08);
  ctx.lineTo(w * 0.81, h * 0.12);
  ctx.stroke();
  ctx.fillStyle = hud(0.4);
  for (const [nx, ny] of [[0.23, 0.9], [0.81, 0.12]]) {
    ctx.beginPath();
    ctx.arc(nx * w, ny * h, 1.6, 0, PI2);
    ctx.fill();
  }

  /* dashed scan segment, lower-centre */
  ctx.save();
  ctx.setLineDash([4, 5]);
  ctx.strokeStyle = hud(0.16);
  ctx.beginPath();
  ctx.moveTo(w * 0.46, h * 0.93);
  ctx.lineTo(w * 0.6, h * 0.93);
  ctx.stroke();
  ctx.restore();

  ctx.globalCompositeOperation = "source-over";
}

function CosmicBaseLayer({
  tier,
  intensity,
  y,
  imageSrc,
  overlayDarkness,
}: {
  tier: Tier;
  intensity: number;
  y?: MotionValue<number>;
  imageSrc?: string;
  overlayDarkness: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, tier === "mobile" ? 1 : 1.5);
      const w = window.innerWidth;
      /* overscan height so the parallax shift never reveals an edge */
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

  return (
    <>
      {/* parallaxed deep layer: procedural galaxy (fallback) + base image */}
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "112%",
          y,
          willChange: "transform",
        }}
      >
        {/* autonomous "camera" drift — slow float + breathe so the universe
         *  feels alive and 3D even when idle (disabled for reduced-motion) */}
        <div className="cnb-camera" style={{ position: "absolute", inset: 0 }}>
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            /* hide the procedural fallback once the image has painted in */
            opacity: imgLoaded ? 0 : Math.min(1, 0.92 * intensity),
            transition: "opacity 0.8s ease",
          }}
        />
        {imageSrc && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc}
            alt=""
            aria-hidden
            decoding="async"
            fetchPriority="high"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgLoaded(false)}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              opacity: imgLoaded ? Math.min(1, intensity) : 0,
              transition: "opacity 1.1s ease",
            }}
          />
        )}
        </div>
      </motion.div>
      {/* navy contrast overlay (not parallaxed → stable readability) */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(180deg,
            rgba(4,6,16,${Math.min(0.85, overlayDarkness + 0.08)}) 0%,
            rgba(4,6,16,${overlayDarkness * 0.5}) 26%,
            rgba(4,6,16,${overlayDarkness * 0.5}) 68%,
            rgba(4,6,16,${Math.min(0.9, overlayDarkness + 0.14)}) 100%)`,
        }}
      />
      <style jsx>{`
        .cnb-camera {
          will-change: transform;
          animation: cnbCamera 92s ease-in-out infinite alternate;
          transform-origin: 55% 60%;
        }
        @keyframes cnbCamera {
          0% { transform: translate3d(0, 0, 0) scale(1.02); }
          50% { transform: translate3d(1.1%, -0.8%, 0) scale(1.055); }
          100% { transform: translate3d(-0.9%, 0.5%, 0) scale(1.03); }
        }
        @media (prefers-reduced-motion: reduce) {
          .cnb-camera { animation: none !important; transform: scale(1.02); }
        }
      `}</style>
    </>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Layer 4 — nebula glows (CSS blurred radial gradients, slow drift)
 * ────────────────────────────────────────────────────────────────────── */
function NebulaGlows({
  reducedMotion,
  intensity,
  y,
}: {
  reducedMotion: boolean;
  intensity: number;
  y?: MotionValue<number>;
}) {
  const anim = (name: string, dur: number) =>
    reducedMotion ? undefined : `${name} ${dur}s ease-in-out infinite alternate`;
  return (
    <motion.div style={{ position: "absolute", inset: 0, y, willChange: "transform" }}>
      <div
        className="cnb-glow"
        style={{
          top: "-22vmax",
          right: "-14vmax",
          width: "62vmax",
          height: "62vmax",
          background: `radial-gradient(circle, rgba(118,86,230,${0.34 * intensity}), transparent 62%)`,
          animation: anim("cnbDrift1", 64),
        }}
      />
      <div
        className="cnb-glow"
        style={{
          bottom: "-20vmax",
          left: "-18vmax",
          width: "58vmax",
          height: "58vmax",
          background: `radial-gradient(circle, rgba(40,150,235,${0.3 * intensity}), transparent 62%)`,
          animation: anim("cnbDrift2", 82),
        }}
      />
      <div
        className="cnb-glow"
        style={{
          top: "34vmax",
          right: "24vmax",
          width: "40vmax",
          height: "40vmax",
          background: `radial-gradient(circle, rgba(220,70,190,${0.16 * intensity}), transparent 60%)`,
          animation: anim("cnbDrift3", 96),
        }}
      />
      <style jsx>{`
        .cnb-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          mix-blend-mode: screen;
          will-change: transform, opacity;
        }
        @keyframes cnbDrift1 {
          0% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.85; }
          100% { transform: translate3d(-7vw, 5vh, 0) scale(1.12); opacity: 1; }
        }
        @keyframes cnbDrift2 {
          0% { transform: translate3d(0, 0, 0) scale(1.05); opacity: 0.9; }
          100% { transform: translate3d(8vw, -4vh, 0) scale(1); opacity: 1; }
        }
        @keyframes cnbDrift3 {
          0% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.7; }
          100% { transform: translate3d(-5vw, -6vh, 0) scale(1.18); opacity: 0.95; }
        }
        @media (prefers-reduced-motion: reduce) {
          .cnb-glow { animation: none !important; }
        }
      `}</style>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Layers 2/3 + 6 — depth star field + shooting stars (one canvas, one rAF)
 * ────────────────────────────────────────────────────────────────────── */
interface Star {
  x: number; // 0..1
  y: number; // 0..1
  depth: number; // 0 (far) .. 1 (near)
  size: number;
  base: number; // base alpha
  tw: number; // twinkle amount
  phase: number;
  hue: number; // 0 white-blue, 1 violet
  driftX: number;
  driftY: number;
}

function StarField({
  caps,
  intensity,
  starDensity,
  enableParallax,
  enableShootingStars,
}: {
  caps: Capabilities;
  intensity: number;
  starDensity: number;
  enableParallax: boolean;
  enableShootingStars: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { tier, reducedMotion } = caps;

  const count = useMemo(() => {
    const baseCount = tier === "mobile" ? 36 : tier === "tablet" ? 72 : 124;
    return Math.max(12, Math.round(baseCount * starDensity));
  }, [tier, starDensity]);

  const stars = useMemo<Star[]>(() => {
    const rnd = mulberry32(99 + count);
    return Array.from({ length: count }, () => {
      const depth = rnd();
      return {
        x: rnd(),
        y: rnd(),
        depth,
        size: 0.4 + depth * 1.7,
        base: 0.18 + depth * 0.5,
        tw: rnd() < 0.35 ? 0.25 + rnd() * 0.4 : 0.06,
        phase: rnd() * Math.PI * 2,
        hue: rnd() < 0.22 ? 1 : 0,
        driftX: (rnd() - 0.5) * 0.6,
        driftY: (rnd() - 0.5) * 0.6,
      };
    });
  }, [count]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, tier === "mobile" ? 1 : 1.5);
    let w = 0;
    let h = 0;
    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    let rt: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(rt);
      rt = setTimeout(resize, 150);
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

    /* scroll parallax (read from a ref, no per-frame layout) */
    let scrollY = window.scrollY;
    const onScroll = () => {
      scrollY = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    /* shooting star state */
    let shoot: {
      x: number; y: number; vx: number; vy: number; life: number; max: number; len: number;
    } | null = null;
    let nextShootAt = 6000 + Math.random() * 12000;

    let raf = 0;
    let running = true;
    let last = performance.now();
    let elapsed = 0;
    const TWO_PI = Math.PI * 2;

    const frame = (now: number) => {
      if (!running) return;
      const dt = Math.min(64, now - last);
      last = now;
      elapsed += dt;
      const ts = elapsed * 0.001;

      eased.x += (target.x - eased.x) * 0.045;
      eased.y += (target.y - eased.y) * 0.045;

      ctx.clearRect(0, 0, w, h);

      const motionMul = reducedMotion ? 0 : 1;
      const scrollPar = scrollY * 0.02; // gentle scroll depth

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        /* extremely slow continuous drift (live, not static) */
        let sx = (s.x + s.driftX * ts * 0.0009 * motionMul) % 1;
        let sy = (s.y + s.driftY * ts * 0.0009 * motionMul) % 1;
        if (sx < 0) sx += 1;
        if (sy < 0) sy += 1;
        let px = sx * w;
        let py = sy * h;
        /* depth parallax: nearer stars shift more with cursor + scroll */
        const pf = 2 + s.depth * 10;
        px += eased.x * pf;
        py += eased.y * pf - scrollPar * (0.3 + s.depth);
        /* wrap scroll vertically so the field is endless down long pages */
        py = ((py % h) + h) % h;

        const twk =
          s.tw > 0.1 && motionMul
            ? 1 + Math.sin(ts * (0.5 + s.depth) + s.phase) * s.tw
            : 1;
        const alpha = Math.max(0, Math.min(1, s.base * twk * intensity));
        if (alpha < 0.02) continue;
        ctx.beginPath();
        ctx.arc(px, py, s.size, 0, TWO_PI);
        ctx.fillStyle =
          s.hue === 1
            ? `rgba(178,150,255,${alpha})`
            : `rgba(206,224,255,${alpha})`;
        ctx.fill();
        /* a soft halo on the brightest near stars only */
        if (s.depth > 0.82) {
          ctx.beginPath();
          ctx.arc(px, py, s.size * 2.6, 0, TWO_PI);
          ctx.fillStyle = `rgba(150,200,255,${alpha * 0.12})`;
          ctx.fill();
        }
      }

      /* shooting stars */
      if (enableShootingStars) {
        if (!shoot && elapsed > nextShootAt) {
          const fromLeft = Math.random() < 0.5;
          const sxp = fromLeft ? Math.random() * 0.3 : 0.7 + Math.random() * 0.3;
          const speed = (w + h) * 0.0006;
          const dir = fromLeft ? 1 : -1;
          shoot = {
            x: sxp * w,
            y: Math.random() * h * 0.4,
            vx: dir * speed * (0.8 + Math.random() * 0.5),
            vy: speed * (0.5 + Math.random() * 0.4),
            life: 0,
            max: 900 + Math.random() * 500,
            len: 120 + Math.random() * 120,
          };
        }
        if (shoot) {
          shoot.life += dt;
          shoot.x += shoot.vx * dt;
          shoot.y += shoot.vy * dt;
          const p = shoot.life / shoot.max;
          const fade = Math.sin(Math.PI * p); // 0→1→0
          const ang = Math.atan2(shoot.vy, shoot.vx);
          const tailX = shoot.x - Math.cos(ang) * shoot.len;
          const tailY = shoot.y - Math.sin(ang) * shoot.len;
          const grad = ctx.createLinearGradient(shoot.x, shoot.y, tailX, tailY);
          grad.addColorStop(0, `rgba(220,238,255,${0.9 * fade})`);
          grad.addColorStop(0.4, `rgba(120,180,255,${0.4 * fade})`);
          grad.addColorStop(1, "rgba(120,180,255,0)");
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.6;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(shoot.x, shoot.y);
          ctx.lineTo(tailX, tailY);
          ctx.stroke();
          if (p >= 1) {
            shoot = null;
            nextShootAt = elapsed + 12000 + Math.random() * 13000;
          }
        }
      }

      raf = requestAnimationFrame(frame);
    };

    /* reduced motion: draw a single static frame, no loop */
    if (reducedMotion) {
      last = performance.now();
      const drawStatic = () => {
        ctx.clearRect(0, 0, w, h);
        for (const s of stars) {
          const alpha = Math.max(0, Math.min(1, s.base * intensity));
          ctx.beginPath();
          ctx.arc(s.x * w, s.y * h, s.size, 0, TWO_PI);
          ctx.fillStyle =
            s.hue === 1 ? `rgba(178,150,255,${alpha})` : `rgba(206,224,255,${alpha})`;
          ctx.fill();
        }
      };
      drawStatic();
      const onResizeStatic = () => {
        resize();
        drawStatic();
      };
      window.addEventListener("resize", onResizeStatic);
      return () => {
        window.removeEventListener("resize", onResizeStatic);
        window.removeEventListener("resize", onResize);
        window.removeEventListener("scroll", onScroll);
        if (enableParallax) window.removeEventListener("pointermove", onPointer);
        clearTimeout(rt);
      };
    }

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
      window.removeEventListener("scroll", onScroll);
      if (enableParallax) window.removeEventListener("pointermove", onPointer);
    };
  }, [stars, tier, reducedMotion, enableParallax, enableShootingStars, intensity]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Layer 5 — constellation HUD network (sparse SVG, edge-biased, CSS pulses)
 * ────────────────────────────────────────────────────────────────────── */
function ConstellationNetwork({
  tier,
  reducedMotion,
  intensity,
}: {
  tier: Tier;
  reducedMotion: boolean;
  intensity: number;
}) {
  const { nodes, links } = useMemo(() => {
    const rnd = mulberry32(7);
    const n = tier === "mobile" ? 0 : tier === "tablet" ? 9 : 14;
    /* edge-biased placement: keep the centre clear for content */
    const ns = Array.from({ length: n }, () => {
      const edge = rnd();
      let x: number;
      let y: number;
      if (edge < 0.5) {
        x = rnd() < 0.5 ? rnd() * 26 : 74 + rnd() * 26; // left/right bands
        y = rnd() * 100;
      } else {
        x = rnd() * 100;
        y = rnd() < 0.5 ? rnd() * 24 : 76 + rnd() * 24; // top/bottom bands
      }
      return { x, y, pulse: rnd() < 0.5 };
    });
    /* connect each node to its nearest 1–2 neighbours, short links only */
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

  if (tier === "mobile" || nodes.length === 0) return null;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ position: "absolute", inset: 0, opacity: 0.7 * intensity }}
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
        <circle
          key={`n${i}`}
          cx={nd.x}
          cy={nd.y}
          r={0.32}
          fill="rgba(160,210,255,0.6)"
        >
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
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Readability — central dim + top/bottom navy gradient scrim
 * ────────────────────────────────────────────────────────────────────── */
function BackgroundScrim({ dimCenter }: { dimCenter: boolean }) {
  return (
    <>
      {dimCenter && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 70% 55% at 50% 48%, rgba(3,4,10,0.62) 0%, rgba(3,4,10,0.32) 42%, rgba(3,4,10,0) 72%)",
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          /* Top-only nav scrim. The previous bottom stop (0.55 navy at
           * 100%) painted a dark band hugging the bottom edge of every
           * viewport — because this layer is fixed, that strip rode the
           * bottom of the screen on every section. Dropped it so the
           * field fades cleanly to the base colour with no seam. */
          background:
            "linear-gradient(to bottom, rgba(3,4,10,0.5) 0%, rgba(3,4,10,0) 22%, rgba(3,4,10,0) 100%)",
        }}
      />
    </>
  );
}
