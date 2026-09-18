"use client";

import { useEffect, useRef, useState } from "react";

/**
 * SchoolsGlobe: the environment behind /schools and /schools/login.
 *
 * Britain lit on a globe of code, sending lessons out along arcs of light to
 * the places British schools teach: Dubai, Singapore, Madrid, Nairobi, Sydney
 * and the rest. What travels along each arc is real code from this repository,
 * one character at a time; when it lands, the school pin turns green and names
 * its city. It says "built in the UK, for UK and British schools worldwide"
 * before a word of the page is read.
 *
 * Deliberately no counter and no class codes: we are not claiming a number of
 * schools we do not have.
 *
 * Drawn entirely in the browser. No map image, no 3D library: coastlines are
 * coarse lat/lon polygons sampled onto a dot grid once per size, and the arcs
 * are great circles (slerp) lifted off the surface. The globe sways around
 * London rather than spinning, so Britain never rotates out of view.
 *
 * Accessibility: a "Pause animation" control (WCAG 2.2.2) stops the loop and
 * is remembered across visits; it starts paused under prefers-reduced-motion.
 *
 * School hardware: 30 fps cap, devicePixelRatio capped at 1.5, pre-rendered
 * glow sprites, the sky in CSS so it paints before hydration, and the loop
 * stops on hidden tabs. Fixed, pointer-events: none, z-index: -1.
 */

const D2R = Math.PI / 180;
const FRAME_MS = 1000 / 30;
const MOTION_KEY = "ax-schools-motion";
const TILT = 20 * D2R;

/** Real lines from this codebase: the cargo on every arc. */
const CODE =
  'const lesson = await loadWeek(5); if (safe) award("phishing-spotter"); teacher.sync({ class: "OAK-4" }); ';

/* Coarse coastlines. Accurate enough to read as Earth at dot resolution. */
const LAND: number[][][] = [
  // Africa
  [[35, -6], [37, 10], [33, 22], [31, 32], [23, 36], [12, 43], [5, 48], [-1, 42], [-11, 40], [-20, 35], [-26, 33], [-34, 20], [-30, 17], [-22, 14], [-12, 13], [-5, 12], [4, 9], [6, 3], [5, -4], [10, -14], [14, -17], [20, -17], [27, -13], [32, -9]],
  // Europe
  [[36, -9], [43, -9], [43, -2], [48, -5], [51, 2], [53, 5], [55, 8], [58, 11], [60, 18], [65, 22], [70, 25], [68, 30], [60, 30], [52, 30], [46, 30], [45, 29], [41, 26], [40, 20], [42, 16], [38, 15], [40, 9], [43, 3], [38, -1]],
  // Asia
  [[40, 30], [45, 40], [48, 50], [55, 60], [62, 70], [68, 80], [72, 95], [70, 110], [71, 130], [66, 142], [60, 150], [52, 142], [45, 135], [40, 128], [34, 127], [30, 122], [22, 110], [20, 106], [10, 105], [8, 100], [6, 96], [8, 80], [13, 74], [20, 70], [23, 68], [25, 60], [30, 48], [36, 36], [38, 32]],
  // North America
  [[70, -160], [71, -140], [70, -120], [68, -100], [64, -88], [60, -78], [56, -65], [48, -60], [45, -63], [40, -72], [35, -76], [30, -81], [26, -80], [25, -92], [22, -97], [19, -95], [16, -92], [19, -104], [23, -110], [30, -114], [35, -120], [42, -124], [48, -125], [55, -131], [60, -145], [65, -155]],
  // South America
  [[12, -72], [11, -64], [6, -55], [1, -50], [-5, -35], [-13, -38], [-23, -43], [-30, -50], [-35, -58], [-42, -64], [-50, -68], [-54, -70], [-45, -74], [-33, -72], [-23, -70], [-12, -77], [-2, -80], [8, -77]],
  // Australia
  [[-11, 131], [-12, 137], [-16, 146], [-20, 149], [-28, 153], [-34, 151], [-38, 146], [-38, 140], [-35, 137], [-32, 128], [-35, 117], [-31, 115], [-22, 114], [-17, 122], [-14, 127]],
  // Greenland
  [[83, -35], [80, -20], [73, -22], [66, -35], [60, -44], [66, -52], [76, -60], [81, -55]],
  // Madagascar
  [[-1, 29], [-8, 32], [-14, 29], [-18, 35], [-25, 32], [-22, 28], [-12, 24], [-4, 26]],
  // Ireland
  [[55, -7], [55, -6], [54, -6], [52, -6], [51, -9], [53, -10], [55, -9]],
];

/* Mainland Britain, sampled finer so it reads as a shape, not a blob. */
const UK: number[][] = [
  [58.6, -5], [58.5, -3], [57.5, -2], [56, -2.5], [55.8, -2], [54.6, -1.2], [53.6, 0.2], [52.9, 0.3],
  [52, 1.7], [51.4, 1.4], [50.8, 0.3], [50.7, -1.3], [50.6, -3.5], [50.2, -5.3], [51.2, -4.2],
  [51.6, -3.1], [52.8, -4.6], [53.3, -4.7], [54.1, -3.2], [54.7, -3.6], [55.9, -5.2], [56.6, -6], [57.6, -6.2],
];

/** Cities where British schools teach. Places, not customer claims. */
const CITIES: [string, number, number][] = [
  ["DUBAI", 25.2, 55.3], ["SINGAPORE", 1.3, 103.8], ["HONG KONG", 22.3, 114.2],
  ["MADRID", 40.4, -3.7], ["NAIROBI", -1.3, 36.8], ["SYDNEY", -33.9, 151.2],
  ["NEW YORK", 40.7, -74], ["DOHA", 25.3, 51.5], ["MUMBAI", 19.1, 72.9],
  ["CAPE TOWN", -33.9, 18.4], ["KUALA LUMPUR", 3.1, 101.7], ["TORONTO", 43.7, -79.4],
];
const LONDON: [number, number] = [51.5, -0.12];

type Vec = [number, number, number];
interface Arc {
  name: string;
  a: Vec;
  b: Vec;
  t: number;
  lit: number;
  landed: boolean;
}
interface Flash {
  v: Vec;
  t: number;
}

const vec = (lat: number, lon: number): Vec => {
  const a = lat * D2R;
  const b = lon * D2R;
  return [Math.cos(a) * Math.sin(b), Math.sin(a), Math.cos(a) * Math.cos(b)];
};

function inPoly(lat: number, lon: number, poly: number[][]) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const yi = poly[i][0];
    const xi = poly[i][1];
    const yj = poly[j][0];
    const xj = poly[j][1];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function slerp(a: Vec, b: Vec, t: number): Vec {
  let d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  d = Math.max(-1, Math.min(1, d));
  const o = Math.acos(d);
  if (o < 1e-4) return [a[0], a[1], a[2]];
  const s = Math.sin(o);
  const k1 = Math.sin((1 - t) * o) / s;
  const k2 = Math.sin(t * o) / s;
  return [a[0] * k1 + b[0] * k2, a[1] * k1 + b[1] * k2, a[2] * k1 + b[2] * k2];
}

function glowSprite(rgb: string, size: number) {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const g = c.getContext("2d");
  if (!g) return c;
  const r = size / 2;
  const grad = g.createRadialGradient(r, r, 0, r, r, r);
  grad.addColorStop(0, `rgba(${rgb},0.95)`);
  grad.addColorStop(0.3, `rgba(${rgb},0.3)`);
  grad.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

/** Monospace sprite sheet: characters are stamped, never re-rendered. */
function makeAtlas(px: number, color: string, weight: string) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const font = `${weight} ${px}px var(--lv2-font-mono, ui-monospace, monospace)`;
  const probe = document.createElement("canvas").getContext("2d");
  let cw = Math.ceil(px * 0.6);
  if (probe) {
    probe.font = font;
    cw = Math.max(1, Math.ceil(probe.measureText("M").width));
  }
  const ch = Math.ceil(px * 1.34);
  const c = document.createElement("canvas");
  c.width = Math.ceil(cw * 95 * dpr);
  c.height = Math.ceil(ch * dpr);
  const g = c.getContext("2d");
  if (g) {
    g.scale(dpr, dpr);
    g.font = font;
    g.textBaseline = "alphabetic";
    g.fillStyle = color;
    for (let i = 0; i < 95; i++) g.fillText(String.fromCharCode(32 + i), i * cw, px);
  }
  return { c, cw, ch, sw: cw * dpr, sh: ch * dpr };
}
type Atlas = ReturnType<typeof makeAtlas>;

export default function SchoolsGlobe() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const setMotionRef = useRef<((paused: boolean) => void) | null>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(MOTION_KEY);
    } catch {}
    let isPaused = stored === "paused" || (stored !== "playing" && reduceMotion);

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let disposed = false;

    const GLOW = {
      cyan: glowSprite("125,240,255", 110),
      amber: glowSprite("255,196,107", 110),
      mint: glowSprite("156,255,138", 96),
    };

    let w = 0;
    let h = 0;
    let R = 0;
    let cx = 0;
    let cy = 0;
    let bx = 0; // canvas origin in page coordinates
    let by = 0;
    let bw = 0;
    let bh = 0;
    let land: Vec[] = [];
    let uk: Vec[] = [];
    let stars: { x: number; y: number; r: number; p: number }[] = [];
    let dotX = new Float32Array(0);
    let dotY = new Float32Array(0);
    let dotBucket = new Uint8Array(0);
    let arcs: Arc[] = [];
    let flashes: Flash[] = [];
    let cityAtlas: Atlas | null = null;
    let ukAtlas: Atlas | null = null;
    let dimAtlas: Atlas | null = null;
    let codeAtlas: Atlas | null = null;

    const blit = (a: Atlas, code: number, x: number, y: number, alpha: number) => {
      const i = (code | 0) - 32;
      if (i < 0 || i > 94 || alpha <= 0.01) return;
      ctx.globalAlpha = alpha;
      ctx.drawImage(a.c, i * a.sw, 0, a.sw, a.sh, x, y, a.cw, a.ch);
      ctx.globalAlpha = 1;
    };
    const text = (a: Atlas, str: string, x: number, y: number, alpha: number) => {
      for (let i = 0; i < str.length; i++) blit(a, str.charCodeAt(i), x + i * a.cw, y, alpha);
    };

    const build = () => {
      w = window.innerWidth;
      h = window.innerHeight;

      // The globe sits right of the reading column on wide screens, and drops
      // low and centred on phones so it never sits behind the copy.
      if (w >= 1100) {
        R = Math.min(w * 0.26, h * 0.42);
        cx = w * 0.76;
        cy = h * 0.6;
      } else if (w >= 700) {
        R = Math.min(w * 0.34, h * 0.34);
        cx = w * 0.7;
        cy = h * 0.48;
      } else {
        R = Math.min(w * 0.5, h * 0.26);
        cx = w * 0.56;
        cy = h * 0.72;
      }

      // Size the canvas to the globe plus its halo, clamped to the viewport.
      const reach = R * 1.8;
      bx = Math.max(0, Math.floor(cx - reach));
      by = Math.max(0, Math.floor(cy - reach));
      bw = Math.min(w, Math.ceil(cx + reach)) - bx;
      bh = Math.min(h, Math.ceil(cy + reach)) - by;
      canvas.style.left = `${bx}px`;
      canvas.style.top = `${by}px`;
      canvas.style.width = `${bw}px`;
      canvas.style.height = `${bh}px`;
      canvas.width = Math.max(1, Math.round(bw * dpr));
      canvas.height = Math.max(1, Math.round(bh * dpr));
      // Drawing stays in page coordinates; the transform does the offset.
      ctx.setTransform(dpr, 0, 0, dpr, -bx * dpr, -by * dpr);

      const px = Math.max(8, Math.round(R / 15));
      cityAtlas = makeAtlas(px, "#9cff8a", "600");
      ukAtlas = makeAtlas(px, "#ffc46b", "600");
      dimAtlas = makeAtlas(px, "#5c86b8", "500");
      codeAtlas = makeAtlas(Math.max(8, Math.round(R / 16)), "#eafcff", "600");

      const step = w < 700 ? 3 : 2;
      land = [];
      for (let lat = -56; lat <= 80; lat += step) {
        for (let lon = -180; lon <= 180; lon += step) {
          for (const poly of LAND) {
            if (inPoly(lat, lon, poly)) {
              land.push(vec(lat, lon));
              break;
            }
          }
        }
      }
      uk = [];
      for (let lat = 49.8; lat <= 59; lat += 0.55) {
        for (let lon = -8; lon <= 2.2; lon += 0.55) {
          if (inPoly(lat, lon, UK)) uk.push(vec(lat, lon));
        }
      }
      dotX = new Float32Array(land.length);
      dotY = new Float32Array(land.length);
      dotBucket = new Uint8Array(land.length);
      stars = [];
      for (let i = 0; i < 46; i++) {
        stars.push({ x: bx + Math.random() * bw, y: by + Math.random() * bh, r: 0.6 + Math.random() * 1.2, p: Math.random() * 6 });
      }
      const src = vec(LONDON[0], LONDON[1]);
      arcs = CITIES.map((c, i) => ({
        name: c[0],
        a: src,
        b: vec(c[1], c[2]),
        t: -i * 1.1,
        lit: 0,
        landed: false,
      }));
      flashes = [];
    };

    const draw = (t: number, dt: number) => {
      ctx.clearRect(bx, by, bw, bh);
      if (!cityAtlas || !ukAtlas || !dimAtlas || !codeAtlas) return;

      const rot = -LONDON[1] * D2R + Math.sin(t * 0.06) * 0.5;
      const cr = Math.cos(rot);
      const sr = Math.sin(rot);
      const ct = Math.cos(TILT);
      const st = Math.sin(TILT);
      const project = (v: Vec): [number, number, number] => {
        const x = v[0] * cr + v[2] * sr;
        const z0 = -v[0] * sr + v[2] * cr;
        const y = v[1] * ct - z0 * st;
        const z = v[1] * st + z0 * ct;
        return [cx + x * R, cy - y * R, z];
      };

      // Stars, so the empty half of the screen is not flat.
      for (const s of stars) {
        const tw = 0.4 + 0.35 * Math.sin(t * 0.7 + s.p);
        ctx.globalAlpha = tw * 0.6;
        ctx.fillStyle = "#cfe6ff";
        ctx.fillRect(s.x, s.y, s.r, s.r);
      }
      ctx.globalAlpha = 1;

      // Atmosphere and sphere.
      ctx.drawImage(GLOW.cyan, cx - R * 1.7, cy - R * 1.7, R * 3.4, R * 3.4);
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(6,20,48,0.72)";
      ctx.fill();
      ctx.strokeStyle = "rgba(125,240,255,0.22)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Graticule.
      ctx.strokeStyle = "rgba(125,240,255,0.1)";
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        for (let lon = -180; lon <= 180; lon += 6) {
          const p = project(vec(lat, lon));
          if (p[2] < 0) {
            ctx.stroke();
            ctx.beginPath();
            continue;
          }
          ctx.lineTo(p[0], p[1]);
        }
        ctx.stroke();
      }

      // Land, then Britain lit on top of it.
      const dot = Math.max(1.1, R / 105);
      ctx.fillStyle = "#67b6e6";
      let visible = 0;
      for (let i = 0; i < land.length; i++) {
        const v = land[i];
        const x = v[0] * cr + v[2] * sr;
        const z0 = -v[0] * sr + v[2] * cr;
        const y = v[1] * ct - z0 * st;
        const z = v[1] * st + z0 * ct;
        if (z < 0.04) continue;
        dotX[visible] = cx + x * R;
        dotY[visible] = cy - y * R;
        dotBucket[visible] = z < 0.3 ? 0 : z < 0.6 ? 1 : z < 0.85 ? 2 : 3;
        visible++;
      }
      const BUCKET_ALPHA = [0.32, 0.5, 0.67, 0.81];
      for (let b = 0; b < 4; b++) {
        ctx.globalAlpha = BUCKET_ALPHA[b];
        for (let i = 0; i < visible; i++) {
          if (dotBucket[i] !== b) continue;
          ctx.fillRect(dotX[i], dotY[i], dot, dot);
        }
      }
      ctx.fillStyle = "#ffd88f";
      for (const v of uk) {
        const p = project(v);
        if (p[2] < 0.04) continue;
        ctx.globalAlpha = 0.5 + p[2] * 0.5;
        ctx.fillRect(p[0], p[1], dot * 1.15, dot * 1.15);
      }
      ctx.globalAlpha = 1;

      const pulse = 0.72 + 0.28 * Math.sin(t * 1.5);
      const ukP = project(vec(LONDON[0], LONDON[1]));
      if (ukP[2] > 0) {
        ctx.globalAlpha = 0.55 * pulse;
        ctx.drawImage(GLOW.amber, ukP[0] - R * 0.36, ukP[1] - R * 0.36, R * 0.72, R * 0.72);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = `rgba(255,216,143,${0.5 * pulse})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(ukP[0], ukP[1], R * 0.1 * (1 + 0.25 * Math.sin(t * 1.5)), 0, Math.PI * 2);
        ctx.stroke();
        const ukFlip = ukP[0] > w * 0.7;
        const ukX = ukFlip ? ukP[0] - R * 0.12 - 14 * ukAtlas.cw : ukP[0] + R * 0.12;
        text(ukAtlas, "UNITED KINGDOM", ukX, ukP[1] - R * 0.17, 0.95);
        text(dimAtlas, "SOURCE . ALGORITHMX", ukX, ukP[1] - R * 0.17 + ukAtlas.ch * 1.4, 0.7);
      }

      // Lessons on their way out of the UK.
      for (const arc of arcs) {
        arc.t += dt * 0.2;
        if (arc.t > 1.8) arc.t = -0.2 - Math.random() * 0.6;
        const p = Math.max(0, Math.min(1, arc.t));
        const steps = 44;
        const span = (from: number, to: number, style: string, width: number) => {
          ctx.beginPath();
          let started = false;
          for (let i = 0; i <= steps; i++) {
            const k = from + ((to - from) * i) / steps;
            if (k < 0) continue;
            const v = slerp(arc.a, arc.b, k);
            const l = 1 + 0.3 * Math.sin(Math.PI * k);
            const pt = project([v[0] * l, v[1] * l, v[2] * l]);
            if (pt[2] < -0.25) {
              started = false;
              continue;
            }
            if (!started) {
              ctx.moveTo(pt[0], pt[1]);
              started = true;
            } else ctx.lineTo(pt[0], pt[1]);
          }
          ctx.strokeStyle = style;
          ctx.lineWidth = width;
          ctx.stroke();
        };
        span(0, 1, "rgba(125,240,255,0.16)", 1);
        if (p > 0.002) span(0, p, "rgba(160,245,255,0.62)", 1.2);
        if (arc.lit > 0.05) span(0, 1, `rgba(156,255,138,${arc.lit * 0.5})`, 1.4);

        if (arc.t > 0 && arc.t <= 1) {
          for (let k = 0; k < 4; k++) {
            const q = Math.max(0, p - k * 0.03);
            const v = slerp(arc.a, arc.b, q);
            const l = 1 + 0.3 * Math.sin(Math.PI * q);
            const pt = project([v[0] * l, v[1] * l, v[2] * l]);
            if (pt[2] < -0.25) continue;
            if (k === 0) {
              ctx.globalAlpha = 0.8;
              ctx.drawImage(GLOW.cyan, pt[0] - 16, pt[1] - 16, 32, 32);
              ctx.globalAlpha = 1;
            }
            blit(codeAtlas, CODE.charCodeAt((Math.floor(t * 12) + k * 5) % CODE.length), pt[0] - 3, pt[1] - 5, 1 - k * 0.22);
          }
        }
        if (arc.t > 1 && !arc.landed) {
          arc.landed = true;
          arc.lit = 1;
          flashes.push({ v: arc.b, t: 0 });
        }
        if (arc.t < 0.05) arc.landed = false;
        if (arc.lit > 0) arc.lit = Math.max(0, arc.lit - dt * 0.35);

        const pin = project(arc.b);
        if (pin[2] > 0.02) {
          const hot = arc.lit > 0.05;
          ctx.globalAlpha = hot ? 0.9 : 0.3;
          ctx.drawImage(hot ? GLOW.mint : GLOW.cyan, pin[0] - 13, pin[1] - 13, 26, 26);
          ctx.globalAlpha = 1;
          ctx.fillStyle = hot ? "#9cff8a" : "#7df0ff";
          ctx.fillRect(pin[0] - 1.6, pin[1] - 1.6, 3.2, 3.2);
          if (hot) {
            const flip = pin[0] > w - arc.name.length * cityAtlas.cw - 24;
            const lx = flip ? pin[0] - 7 - arc.name.length * cityAtlas.cw : pin[0] + 7;
            text(cityAtlas, arc.name, lx, pin[1] - cityAtlas.ch * 0.4, 1);
          }
        }
      }

      for (let i = flashes.length - 1; i >= 0; i--) {
        const f = flashes[i];
        f.t += dt * 0.9;
        if (f.t >= 1) {
          flashes.splice(i, 1);
          continue;
        }
        const p = project(f.v);
        if (p[2] < 0) continue;
        ctx.strokeStyle = `rgba(156,255,138,${(1 - f.t) * 0.85})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(p[0], p[1], 6 + f.t * R * 0.16, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    /* ---------------- loop and controls ---------------- */

    let raf = 0;
    let running = false;
    let last = 0;
    let prev = 0;

    const frame = (now: number) => {
      if (!running) return;
      raf = requestAnimationFrame(frame);
      if (now - last < FRAME_MS) return;
      const dt = Math.min(0.08, (now - (prev || now)) / 1000);
      prev = now;
      last = now;
      draw(now / 1000, dt);
    };
    const start = () => {
      if (running || isPaused || document.hidden) return;
      running = true;
      prev = 0;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const applyMotion = (pause: boolean) => {
      isPaused = pause;
      if (pause) {
        stop();
        draw(performance.now() / 1000, 0);
      } else {
        start();
      }
    };
    setMotionRef.current = applyMotion;

    let rt = 0;
    const onResize = () => {
      window.clearTimeout(rt);
      rt = window.setTimeout(() => {
        stop();
        build();
        if (isPaused) draw(performance.now() / 1000, 0);
        else start();
      }, 150);
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    build();
    applyMotion(isPaused);
    const labelTimer = isPaused ? window.setTimeout(() => setPaused(true), 0) : 0;
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      disposed = true;
      setMotionRef.current = null;
      stop();
      window.clearTimeout(rt);
      window.clearTimeout(labelTimer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      void disposed;
    };
  }, []);

  const toggleMotion = () => {
    const next = !paused;
    setPaused(next);
    setMotionRef.current?.(next);
    try {
      window.localStorage.setItem(MOTION_KEY, next ? "paused" : "playing");
    } catch {}
  };

  return (
    <>
      <div ref={rootRef} aria-hidden className="sg-root">
        <div className="sg-sky" />
        <canvas ref={canvasRef} className="sg-canvas" />
        <div className="sg-scrim" />
      </div>

      <button type="button" className="sg-motion" onClick={toggleMotion}>
        {paused ? (
          <svg viewBox="0 0 12 12" aria-hidden>
            <path d="M3 1.8v8.4L10.2 6z" fill="currentColor" />
          </svg>
        ) : (
          <svg viewBox="0 0 12 12" aria-hidden>
            <rect x="2.4" y="1.8" width="2.6" height="8.4" rx="0.6" fill="currentColor" />
            <rect x="7" y="1.8" width="2.6" height="8.4" rx="0.6" fill="currentColor" />
          </svg>
        )}
        <span className="sg-motion-label">{paused ? "Play animation" : "Pause animation"}</span>
      </button>

      <style>{`
        .sg-root {
          position: fixed;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          overflow: hidden;
          background: #03071a;
        }
        /* The sky is CSS, so it paints with the server HTML. */
        .sg-sky {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 60% at 72% 46%, rgba(18,52,104,0.85) 0%, rgba(8,20,54,0.5) 45%, rgba(3,7,26,0) 72%),
            linear-gradient(180deg, #071231 0%, #040a20 55%, #02050f 100%);
        }
        /* Sized and placed in script: it covers the globe, not the screen. */
        .sg-canvas {
          position: absolute;
          left: 0;
          top: 0;
        }
        /* Keeps the reading column calm and legible over the globe, and gives
           the nav and the top row a dark bed wherever the globe reaches. */
        .sg-scrim {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(3,7,26,0.92) 0px, rgba(3,7,26,0.72) 110px, rgba(3,7,26,0.18) 210px, rgba(3,7,26,0) 300px),
            radial-gradient(ellipse 52% 62% at 26% 50%, rgba(3,7,26,0.86) 0%, rgba(3,7,26,0.46) 58%, rgba(3,7,26,0) 84%);
        }
        @media (max-width: 699px) {
          .sg-scrim {
            background: linear-gradient(180deg, rgba(3,7,26,0.88) 0%, rgba(3,7,26,0.62) 46%, rgba(3,7,26,0.3) 72%, rgba(3,7,26,0.2) 100%);
          }
        }

        .sg-motion {
          position: fixed;
          left: max(14px, env(safe-area-inset-left));
          bottom: max(14px, env(safe-area-inset-bottom));
          z-index: 40;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 32px;
          padding: 0 13px 0 11px;
          border-radius: 999px;
          border: 1px solid rgba(125,240,255,0.26);
          background: rgba(5,12,32,0.88);
          color: rgba(233,242,255,0.82);
          font-family: var(--lv2-font-mono, ui-monospace, monospace);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          line-height: 1;
          cursor: pointer;
          transition: border-color 0.2s ease, color 0.2s ease;
        }
        .sg-motion:hover {
          border-color: rgba(125,240,255,0.6);
          color: #fff;
        }
        .sg-motion:focus-visible {
          outline: 2px solid #7df0ff;
          outline-offset: 3px;
        }
        .sg-motion svg {
          width: 11px;
          height: 11px;
          flex: none;
        }
        @media (max-width: 1099px) {
          .sg-motion {
            width: 36px;
            height: 36px;
            padding: 0;
            justify-content: center;
          }
          .sg-motion-label {
            position: absolute;
            width: 1px;
            height: 1px;
            overflow: hidden;
            clip-path: inset(50%);
            white-space: nowrap;
          }
        }
      `}</style>
    </>
  );
}
