"use client";

import { useEffect, useRef, useState } from "react";
import { buildSkyline, paintSkyline, skylineHeight, type Skyline } from "./schoolSkyline";

/**
 * SchoolsBackdrop: "Dawn Campus", the environment behind /schools and
 * /schools/login (the rest of the site keeps the deep-space GlobalBackdrop).
 *
 * Research (Sept 2026) on school buyers: heads, computing leads and
 * safeguarding leads trust pages that look like their category, and
 * safeguarding guidance warns against hacker and threat imagery. So the page
 * keeps the AlgorithmX dark brand but trades outer space for the world of a
 * school at the start of the day:
 *
 *   • DAWN: a navy night sky warming to an amber and coral sunrise behind a
 *     British school on the horizon (bell tower, academy block, sports hall,
 *     railings). Classroom lights come on as the reader scrolls toward the
 *     enquiry form. The school clocks show the real time.
 *   • EXERCISE BOOK: faint squared paper (24px squares, a heavier line every
 *     five) with the red margin line drawn just left of the text column,
 *     and a fine grain over everything.
 *   • CONNECTED CAMPUS: in the margins, pupil desktops, network hubs and
 *     shield nodes sit on the squares. Pulses of light travel between them;
 *     one that reaches a shield blooms into a green "safe" ring, one that
 *     reaches the margin line lights it like a teacher's tick.
 *
 * Accessibility: a "Pause animation" control (WCAG 2.2.2) stops every loop
 * and auto-update and is remembered across visits; it starts paused under
 * prefers-reduced-motion. Moving parts stay in the margins, never behind text.
 *
 * School hardware: the network draws into two canvases sized to its band in
 * the margins (not a full-screen one) at 30 fps with devicePixelRatio capped
 * at 1.5, glows are pre-rendered sprites (no shadowBlur, no CSS blur), the
 * sky glows are static (no screen-sized layer animating on a 4K whiteboard),
 * the skyline repaints only when a light changes, and everything stops on
 * hidden tabs. Tablets and phones have no margin, so they get the sky, paper
 * and school with no loop.
 *
 * Fixed, pointer-events: none, z-index: -1. Styles use a plain <style> tag
 * so the sky paints with the server HTML, before hydration.
 */

const GRID = 24; // one exercise-book square (px); nodes snap to it
const MAJOR = GRID * 5; // heavier grid line every five squares
const FRAME_MS = 1000 / 30;
const PARALLAX = 0.12; // the network drifts up at 12% of scroll speed
const MIN_BAND = 56; // px of margin needed before the network appears
const MAX_BAND = 360; // widest the network gets on very wide screens
const MOTION_KEY = "ax-schools-motion";

// Fine grain: a small fractal-noise tile the browser rasterises once.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.6 0'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E\")";

type Side = 0 | 1;
type Kind = "desk" | "hub" | "shield";
interface NetNode {
  x: number;
  y: number;
  kind: Kind;
  glow: number;
  side: Side;
}
interface Edge {
  pts: [number, number][];
  lens: number[];
  total: number;
  a: number; // node index at pts[0], or -1 for the margin line
  b: number; // node index at the last point, or -1 for the margin line
  side: Side;
}
interface Pulse {
  edge: number;
  d: number;
  speed: number;
  rev: boolean;
  warm: boolean;
}
interface Burst {
  x: number;
  y: number;
  t: number;
  kind: "safe" | "tick";
  side: Side;
}

function mulberry32(seed: number) {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeSprite(rgb: string, size: number) {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const g = c.getContext("2d");
  if (!g) return c;
  const r = size / 2;
  const grad = g.createRadialGradient(r, r, 0, r, r, r);
  grad.addColorStop(0, `rgba(${rgb},0.95)`);
  grad.addColorStop(0.22, `rgba(${rgb},0.5)`);
  grad.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

export default function SchoolsBackdrop() {
  const rootRef = useRef<HTMLDivElement>(null);
  const netLRef = useRef<HTMLCanvasElement>(null);
  const netRRef = useRef<HTMLCanvasElement>(null);
  const skyRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const dawnRef = useRef<HTMLDivElement>(null);
  const setMotionRef = useRef<((paused: boolean) => void) | null>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const netL = netLRef.current;
    const netR = netRRef.current;
    const skyCanvas = skyRef.current;
    const grid = gridRef.current;
    const dawn = dawnRef.current;
    if (!root || !netL || !netR || !skyCanvas || !grid || !dawn) return;
    const ctxL = netL.getContext("2d");
    const ctxR = netR.getContext("2d");
    const skyCtx = skyCanvas.getContext("2d");
    if (!ctxL || !ctxR || !skyCtx) return;

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

    const sprite = {
      cyan: makeSprite("125,240,255", 48),
      amber: makeSprite("255,179,71", 48),
      mint: makeSprite("95,255,163", 64),
      violet: makeSprite("176,160,255", 48),
      coral: makeSprite("255,138,101", 48),
    };

    let w = window.innerWidth;
    let h = window.innerHeight;
    let scrollY = window.scrollY;

    /* ---------------------------------------------------------------- *
     * The school on the horizon                                        *
     * ---------------------------------------------------------------- */

    let sky: Skyline | null = null;
    let litShare = 0.35;
    const lightsOff = new Set<number>();

    const paintSky = () => {
      if (!sky || disposed) return;
      paintSkyline(skyCtx, sky, litShare, lightsOff, sprite, new Date());
    };

    const buildSky = () => {
      const H = skylineHeight(w, h);
      skyCanvas.width = Math.round(w * dpr);
      skyCanvas.height = Math.round(H * dpr);
      skyCanvas.style.height = `${H}px`;
      root.style.setProperty("--sb-sky-h", `${H}px`);
      skyCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      lightsOff.clear();
      sky = buildSkyline(w, H, dpr, mulberry32(0x7a11 + Math.round(w / 160)));
      paintSky();
      skyCanvas.classList.add("is-on");
    };

    /* ---------------------------------------------------------------- *
     * The connected-campus network in the margins                      *
     * ---------------------------------------------------------------- */

    let tileH = 1440;
    let marginX = 0;
    let netW = 0;
    let netX = 0; // left edge of the left canvas (the right one mirrors it)
    let enabled = false;
    let nodes: NetNode[] = [];
    let edges: Edge[] = [];
    let pulses: Pulse[] = [];
    let bursts: Burst[] = [];

    const snap = (v: number) => Math.round(v / GRID) * GRID;

    const addEdge = (pts: [number, number][], a: number, b: number, side: Side) => {
      const lens: number[] = [];
      let total = 0;
      for (let i = 1; i < pts.length; i++) {
        const l = Math.abs(pts[i][0] - pts[i - 1][0]) + Math.abs(pts[i][1] - pts[i - 1][1]);
        lens.push(l);
        total += l;
      }
      if (total > 0) edges.push({ pts, lens, total, a, b, side });
    };

    const link = (ia: number, ib: number, horizontalFirst: boolean) => {
      const A = nodes[ia];
      const B = nodes[ib];
      if (A.x === B.x || A.y === B.y) addEdge([[A.x, A.y], [B.x, B.y]], ia, ib, A.side);
      else if (horizontalFirst) addEdge([[A.x, A.y], [B.x, A.y], [B.x, B.y]], ia, ib, A.side);
      else addEdge([[A.x, A.y], [A.x, B.y], [B.x, B.y]], ia, ib, A.side);
    };

    // Lays the network out in the page margins. Leaves `enabled` false when
    // the margins are too narrow to hold it (tablets, phones, small laptops).
    const buildNetwork = () => {
      nodes = [];
      edges = [];
      pulses = [];
      bursts = [];

      // Same geometry as .sch-section: a 1180px column with a --lv2-rail
      // (min(3.646vw, 5.833rem)) of padding either side.
      const column = Math.min(1180, w);
      const rail = Math.min(w * 0.03646, 93.33);
      const textLeft = (w - column) / 2 + rail;
      marginX = Math.floor((textLeft - 28) / GRID) * GRID;
      const inner = marginX - 16;
      const outer = Math.max(GRID, inner - MAX_BAND);
      enabled = inner - outer >= MIN_BAND;
      // Glows reach 32px beyond a node, so the canvas starts just outside
      // the band and ends just past the margin line.
      netX = enabled ? Math.max(0, Math.floor(outer - 40)) : 0;
      netW = enabled ? marginX + 20 - netX : 0;

      for (const [cv, c] of [
        [netL, ctxL],
        [netR, ctxR],
      ] as const) {
        cv.width = Math.max(1, Math.round(netW * dpr));
        cv.height = enabled ? Math.round(h * dpr) : 1;
        cv.style.width = `${netW}px`;
        cv.style[cv === netL ? "left" : "right"] = `${netX}px`;
        c.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      if (!enabled) return;

      tileH = Math.max(MAJOR * 12, snap(h * 1.6));
      const rand = mulberry32(0x5c4001 + Math.round(w / 120));
      const band = inner - outer;
      const cols = band >= 220 ? 2 : 1;
      const colW = band / cols;

      for (const side of [0, 1] as const) {
        const place = (x: number) => (side === 0 ? snap(x) : snap(w - x));
        const columns: number[][] = [];
        for (let c = 0; c < cols; c++) {
          const hi = inner - c * colW; // c = 0 is the column nearest the page
          const lo = hi - colW;
          const ids: number[] = [];
          let y = GRID * 3 + c * GRID * 3 + snap(rand() * 48);
          let i = 0;
          while (y < tileH - GRID * 3) {
            const x = place(lo + 10 + rand() * Math.max(0, colW - 20));
            const kind: Kind = c === 0 && i % 4 === 1 ? "shield" : rand() < 0.16 ? "hub" : "desk";
            ids.push(nodes.length);
            nodes.push({ x, y, kind, glow: 0, side });
            y += snap(120 + rand() * 132);
            i++;
          }
          columns.push(ids);
          for (let k = 1; k < ids.length; k++) {
            if (rand() < 0.14) continue;
            link(ids[k - 1], ids[k], rand() < 0.5);
          }
        }
        if (cols === 2) {
          for (const id of columns[1]) {
            if (rand() < 0.4) continue;
            let best = -1;
            let bestD = Infinity;
            for (const j of columns[0]) {
              const d = Math.abs(nodes[j].y - nodes[id].y);
              if (d < bestD) {
                bestD = d;
                best = j;
              }
            }
            if (best >= 0 && bestD <= MAJOR) link(id, best, true);
          }
        }
        // Spurs from the inner column out to the margin line.
        const lineX = side === 0 ? marginX : snap(w - marginX);
        for (const id of columns[0]) {
          if (nodes[id].kind !== "shield" && rand() < 0.45) continue;
          addEdge([[nodes[id].x, nodes[id].y], [lineX, nodes[id].y]], id, -1, side);
        }
      }
    };

    const pointAt = (e: Edge, dist: number): [number, number] => {
      let rem = Math.max(0, Math.min(e.total, dist));
      for (let i = 0; i < e.lens.length; i++) {
        if (rem <= e.lens[i]) {
          const [x0, y0] = e.pts[i];
          const [x1, y1] = e.pts[i + 1];
          const f = e.lens[i] ? rem / e.lens[i] : 0;
          return [x0 + (x1 - x0) * f, y0 + (y1 - y0) * f];
        }
        rem -= e.lens[i];
      }
      return e.pts[e.pts.length - 1];
    };

    let lastSpawn = 0;
    const spawn = (now: number) => {
      if (pulses.length >= 5 || now - lastSpawn < 900 || edges.length === 0) return;
      lastSpawn = now;
      const edge = Math.floor(Math.random() * edges.length);
      const e = edges[edge];
      const rev = Math.random() < 0.5;
      const target = rev ? e.a : e.b;
      pulses.push({
        edge,
        d: 0,
        speed: 64 + Math.random() * 56,
        rev,
        warm: target >= 0 && nodes[target].kind === "shield",
      });
    };

    const roundRect = (c: CanvasRenderingContext2D, x: number, y: number, ww: number, hh: number, r: number) => {
      c.beginPath();
      if (typeof c.roundRect === "function") c.roundRect(x, y, ww, hh, r);
      else c.rect(x, y, ww, hh);
    };

    const shieldPath = (c: CanvasRenderingContext2D, x: number, y: number, s: number) => {
      c.beginPath();
      c.moveTo(x, y - s);
      c.lineTo(x + s * 0.86, y - s * 0.62);
      c.lineTo(x + s * 0.8, y + s * 0.08);
      c.quadraticCurveTo(x + s * 0.56, y + s * 0.74, x, y + s);
      c.quadraticCurveTo(x - s * 0.56, y + s * 0.74, x - s * 0.8, y + s * 0.08);
      c.lineTo(x - s * 0.86, y - s * 0.62);
      c.closePath();
    };

    const drawTile = (c: CanvasRenderingContext2D, side: Side, off: number) => {
      // Circuit traces, one path with softened corners.
      c.beginPath();
      for (const e of edges) {
        if (e.side !== side) continue;
        const p = e.pts;
        if (Math.max(p[0][1], p[p.length - 1][1]) + off < -20) continue;
        if (Math.min(p[0][1], p[p.length - 1][1]) + off > h + 20) continue;
        c.moveTo(p[0][0], p[0][1] + off);
        if (p.length === 3) c.arcTo(p[1][0], p[1][1] + off, p[2][0], p[2][1] + off, 10);
        c.lineTo(p[p.length - 1][0], p[p.length - 1][1] + off);
      }
      c.strokeStyle = "rgba(125,240,255,0.2)";
      c.lineWidth = 1;
      c.stroke();

      // Where a spur meets the margin line.
      c.fillStyle = "rgba(255,160,120,0.6)";
      for (const e of edges) {
        if (e.side !== side || e.b !== -1) continue;
        const [tx, ty] = e.pts[e.pts.length - 1];
        const y = ty + off;
        if (y < -10 || y > h + 10) continue;
        c.beginPath();
        c.arc(tx, y, 2, 0, Math.PI * 2);
        c.fill();
      }

      // Travelling pulses with a short fading trail.
      for (const p of pulses) {
        const e = edges[p.edge];
        if (e.side !== side) continue;
        const sp = p.warm ? sprite.amber : sprite.cyan;
        for (let tr = 6; tr >= 0; tr--) {
          const along = p.d - tr * 6;
          if (along < 0 || along > e.total) continue;
          const [px, py] = pointAt(e, p.rev ? e.total - along : along);
          const y = py + off;
          if (y < -30 || y > h + 30) continue;
          const size = tr === 0 ? 26 : 14 - tr;
          c.globalAlpha = tr === 0 ? 1 : 0.75 * (1 - tr / 7);
          c.drawImage(sp, px - size / 2, y - size / 2, size, size);
        }
        c.globalAlpha = 1;
      }

      // Nodes: glow first, then the body on top.
      for (const n of nodes) {
        if (n.side !== side) continue;
        const y = n.y + off;
        if (y < -40 || y > h + 40) continue;
        if (n.glow > 0.02) {
          const sp = n.kind === "shield" ? sprite.amber : n.kind === "hub" ? sprite.violet : sprite.cyan;
          c.globalAlpha = Math.min(1, n.glow) * 0.85;
          c.drawImage(sp, n.x - 24, y - 24, 48, 48);
          c.globalAlpha = 1;
        }
        const lit = n.glow;
        if (n.kind === "shield") {
          shieldPath(c, n.x, y, 9);
          c.fillStyle = "rgba(24,17,28,0.96)";
          c.fill();
          c.strokeStyle = `rgba(255,179,71,${0.62 + lit * 0.38})`;
          c.lineWidth = 1.3;
          c.stroke();
          c.beginPath();
          c.moveTo(n.x - 3.2, y + 0.2);
          c.lineTo(n.x - 0.8, y + 2.6);
          c.lineTo(n.x + 3.6, y - 2.4);
          c.strokeStyle = `rgba(95,255,163,${0.6 + lit * 0.4})`;
          c.lineWidth = 1.5;
          c.stroke();
        } else if (n.kind === "hub") {
          roundRect(c, n.x - 8, y - 8, 16, 16, 4);
          c.fillStyle = "rgba(14,14,44,0.96)";
          c.fill();
          c.strokeStyle = `rgba(176,160,255,${0.55 + lit * 0.45})`;
          c.lineWidth = 1.1;
          c.stroke();
          c.fillStyle = `rgba(206,196,255,${0.6 + lit * 0.4})`;
          for (const [dx, dy] of [
            [-3.5, -3.5],
            [3.5, -3.5],
            [-3.5, 3.5],
            [3.5, 3.5],
          ]) {
            c.beginPath();
            c.arc(n.x + dx, y + dy, 1.4, 0, Math.PI * 2);
            c.fill();
          }
        } else {
          // A pupil's desktop: screen on a small stand.
          roundRect(c, n.x - 7.5, y - 6.5, 15, 10, 2);
          c.fillStyle = "rgba(8,16,40,0.96)";
          c.fill();
          if (lit > 0.02) {
            c.fillStyle = `rgba(125,240,255,${lit * 0.55})`;
            c.fillRect(n.x - 5.5, y - 4.5, 11, 6);
          }
          c.strokeStyle = `rgba(125,240,255,${0.5 + lit * 0.5})`;
          c.lineWidth = 1.1;
          roundRect(c, n.x - 7.5, y - 6.5, 15, 10, 2);
          c.stroke();
          c.beginPath();
          c.moveTo(n.x, y + 3.5);
          c.lineTo(n.x, y + 6.5);
          c.moveTo(n.x - 3.5, y + 6.5);
          c.lineTo(n.x + 3.5, y + 6.5);
          c.stroke();
        }
      }

      // Bursts: a green "safe" ring at shields, a tick of light on the margin.
      for (const b of bursts) {
        if (b.side !== side) continue;
        const y = b.y + off;
        if (y < -80 || y > h + 80) continue;
        if (b.kind === "safe") {
          c.beginPath();
          c.arc(b.x, y, 10 + b.t * 30, 0, Math.PI * 2);
          c.strokeStyle = `rgba(95,255,163,${(1 - b.t) * 0.7})`;
          c.lineWidth = 1.4;
          c.stroke();
          if (b.t < 0.55) {
            c.globalAlpha = (0.55 - b.t) * 1.3;
            c.drawImage(sprite.mint, b.x - 32, y - 32, 64, 64);
            c.globalAlpha = 1;
          }
        } else {
          const half = 28 + b.t * 34;
          const g = c.createLinearGradient(0, y - half, 0, y + half);
          g.addColorStop(0, "rgba(255,160,120,0)");
          g.addColorStop(0.5, `rgba(255,190,140,${(1 - b.t) * 0.9})`);
          g.addColorStop(1, "rgba(255,160,120,0)");
          c.fillStyle = g;
          c.fillRect(b.x - 1, y - half, 2.5, half * 2);
          c.globalAlpha = (1 - b.t) * 0.8;
          c.drawImage(sprite.coral, b.x - 12, y - 12, 24, 24);
          c.globalAlpha = 1;
        }
      }
    };

    const drawNetwork = (oy: number) => {
      if (!enabled) return;
      for (const side of [0, 1] as const) {
        const c = side === 0 ? ctxL : ctxR;
        c.clearRect(0, 0, netW, h);
        c.save();
        if (side === 1) c.translate(-(w - netX - netW), 0);
        else {
          c.translate(-netX, 0);
          // The exercise book's red margin line.
          const mg = c.createLinearGradient(0, 0, 0, h);
          mg.addColorStop(0, "rgba(255,122,89,0)");
          mg.addColorStop(0.12, "rgba(255,122,89,0.36)");
          mg.addColorStop(0.8, "rgba(255,122,89,0.36)");
          mg.addColorStop(1, "rgba(255,122,89,0.04)");
          c.fillStyle = mg;
          c.fillRect(marginX - 0.75, 0, 1.5, h);
        }
        for (const k of [0, 1]) {
          const off = oy + k * tileH;
          if (off > h + 40 || off + tileH < -40) continue;
          drawTile(c, side, off);
        }
        c.restore();
      }
    };

    /* ---------------------------------------------------------------- *
     * Scroll-linked pieces: grid drift, sunrise, classroom lights      *
     * ---------------------------------------------------------------- */

    const offsetFor = (sy: number) => -((sy * PARALLAX) % tileH);
    let lastGridShift = NaN;
    const syncGrid = (oy: number) => {
      const shift = ((oy % MAJOR) + MAJOR) % MAJOR;
      if (Math.abs(shift - lastGridShift) < 0.25) return;
      lastGridShift = shift;
      grid.style.transform = `translate3d(0, ${shift.toFixed(2)}px, 0)`;
    };

    let lastProgress = NaN;
    const syncProgress = () => {
      const room = document.documentElement.scrollHeight - h;
      const p = room > 0 ? Math.min(1, Math.max(0, scrollY / room)) : 0;
      if (Math.abs(p - lastProgress) < 0.004) return;
      lastProgress = p;
      dawn.style.opacity = (0.78 + 0.22 * p).toFixed(3);
      dawn.style.transform = isPaused ? "none" : `translate3d(0, ${((1 - p) * h * 0.05).toFixed(1)}px, 0)`;
      const share = Math.round((0.35 + 0.65 * p) * 50) / 50;
      if (share !== litShare) {
        litShare = share;
        paintSky();
      }
    };

    /* ---------------------------------------------------------------- *
     * Loops: network frames, light flicker, clocks                     *
     * ---------------------------------------------------------------- */

    let raf = 0;
    let running = false;
    let last = 0;
    let prev = 0;

    const frame = (now: number) => {
      if (!running) return;
      raf = requestAnimationFrame(frame);
      if (now - last < FRAME_MS) return;
      const dt = Math.min(0.1, (now - (prev || now)) / 1000);
      prev = now;
      last = now;

      spawn(now);
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.d += p.speed * dt;
        const e = edges[p.edge];
        if (p.d < e.total + 36) continue;
        const target = p.rev ? e.a : e.b;
        const [ex, ey] = p.rev ? e.pts[0] : e.pts[e.pts.length - 1];
        if (target >= 0) {
          const n = nodes[target];
          n.glow = 1;
          if (n.kind === "shield") bursts.push({ x: ex, y: ey, t: 0, kind: "safe", side: e.side });
        } else {
          bursts.push({ x: ex, y: ey, t: 0, kind: "tick", side: e.side });
        }
        pulses.splice(i, 1);
      }
      for (const n of nodes) if (n.glow > 0) n.glow = Math.max(0, n.glow - dt * 0.9);
      for (let i = bursts.length - 1; i >= 0; i--) {
        bursts[i].t += dt / (bursts[i].kind === "safe" ? 1.5 : 1.1);
        if (bursts[i].t >= 1) bursts.splice(i, 1);
      }

      const oy = offsetFor(scrollY);
      syncGrid(oy);
      drawNetwork(oy);
    };

    const startNetwork = () => {
      if (running || !enabled || isPaused || document.hidden) return;
      running = true;
      prev = 0;
      raf = requestAnimationFrame(frame);
    };
    const stopNetwork = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    // Now and then a classroom light goes off for a moment, as in a real
    // school first thing in the morning.
    let flickerTimer = 0;
    const flicker = () => {
      if (disposed || isPaused) return;
      if (sky && !document.hidden) {
        const candidates: number[] = [];
        sky.windows.forEach((wd, i) => {
          if (!wd.always && wd.order < litShare && !lightsOff.has(i)) candidates.push(i);
        });
        if (candidates.length) {
          const i = candidates[Math.floor(Math.random() * candidates.length)];
          const built = sky;
          lightsOff.add(i);
          paintSky();
          window.setTimeout(() => {
            if (sky !== built || !lightsOff.has(i)) return;
            lightsOff.delete(i);
            paintSky();
          }, 700 + Math.random() * 1400);
        }
      }
      flickerTimer = window.setTimeout(flicker, 1800 + Math.random() * 2600);
    };

    // Keep the school clocks on the real time.
    let lastMinute = new Date().getMinutes();
    const clockTimer = window.setInterval(() => {
      const m = new Date().getMinutes();
      if (m === lastMinute || isPaused || document.hidden) return;
      lastMinute = m;
      paintSky();
    }, 15000);

    // A still frame: no pulses mid-flight, every light steady.
    const freeze = () => {
      stopNetwork();
      window.clearTimeout(flickerTimer);
      pulses = [];
      bursts = [];
      for (const n of nodes) n.glow = 0;
      lightsOff.clear();
      const oy = offsetFor(scrollY);
      syncGrid(oy);
      drawNetwork(oy);
      dawn.style.transform = "none";
      paintSky();
    };

    const applyMotion = (pause: boolean) => {
      isPaused = pause;
      root.classList.toggle("is-paused", pause);
      if (pause) {
        freeze();
      } else {
        lastProgress = NaN;
        syncProgress();
        startNetwork();
        window.clearTimeout(flickerTimer);
        flickerTimer = window.setTimeout(flicker, 1200);
      }
    };
    setMotionRef.current = applyMotion;

    let scrollRaf = 0;
    const onScroll = () => {
      scrollY = window.scrollY;
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        syncProgress();
        if (!running && !isPaused) syncGrid(enabled ? offsetFor(scrollY) : 0);
      });
    };
    let rt = 0;
    const onResize = () => {
      window.clearTimeout(rt);
      rt = window.setTimeout(() => {
        stopNetwork();
        w = window.innerWidth;
        h = window.innerHeight;
        buildSky();
        buildNetwork();
        lastProgress = NaN;
        syncProgress();
        if (isPaused) freeze();
        else startNetwork();
      }, 150);
    };
    const onVisibility = () => {
      if (document.hidden) stopNetwork();
      else startNetwork();
    };

    buildSky();
    buildNetwork();
    syncProgress();
    syncGrid(enabled ? offsetFor(scrollY) : 0);
    applyMotion(isPaused);
    const labelTimer = isPaused ? window.setTimeout(() => setPaused(true), 0) : 0;
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      disposed = true;
      setMotionRef.current = null;
      stopNetwork();
      cancelAnimationFrame(scrollRaf);
      window.clearTimeout(rt);
      window.clearTimeout(flickerTimer);
      window.clearTimeout(labelTimer);
      window.clearInterval(clockTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
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
      <div ref={rootRef} aria-hidden className="sb-root">
        <div className="sb-sky" />
        <div className="sb-glow sb-glow-teal" />
        <div className="sb-glow sb-glow-blue" />
        <div ref={dawnRef} className="sb-dawn" />
        <div className="sb-paper">
          <div ref={gridRef} className="sb-grid" />
        </div>
        <canvas ref={netLRef} className="sb-net sb-net-l" />
        <canvas ref={netRRef} className="sb-net sb-net-r" />
        <canvas ref={skyRef} className="sb-skyline" />
        <div className="sb-grain" />
        <div className="sb-scrim" />
      </div>

      <button type="button" className="sb-motion" onClick={toggleMotion}>
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
        <span className="sb-motion-label">{paused ? "Play animation" : "Pause animation"}</span>
      </button>

      <style>{`
        .sb-root {
          --sb-sun-x: 63%;
          --sb-sky-h: 180px;
          position: fixed;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          overflow: hidden;
          background: #050a1a;
        }
        @media (max-width: 699px) {
          .sb-root { --sb-sun-x: 50%; }
        }
        .sb-sky {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, #040919 0%, #081230 34%, #0f1a42 58%, #1c1d48 80%, #30214c 100%);
        }
        .sb-glow {
          position: absolute;
          border-radius: 50%;
        }
        .sb-glow-teal {
          left: -24vmax;
          top: 4vh;
          width: 62vmax;
          height: 62vmax;
          background: radial-gradient(circle, rgba(46,230,197,0.14) 0%, rgba(0,229,255,0.06) 34%, rgba(0,229,255,0) 64%);
        }
        .sb-glow-blue {
          right: -22vmax;
          top: -30vmax;
          width: 66vmax;
          height: 66vmax;
          background: radial-gradient(circle, rgba(70,124,255,0.18) 0%, rgba(70,124,255,0.07) 38%, rgba(70,124,255,0) 66%);
        }
        .sb-dawn {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 82vh;
          opacity: 0.78;
          transform: translate3d(0, 4vh, 0);
          will-change: opacity, transform;
          background:
            radial-gradient(ellipse 30% 44% at var(--sb-sun-x) 100%, rgba(255,204,128,0.6) 0%, rgba(255,164,104,0.3) 32%, rgba(255,140,100,0) 72%),
            radial-gradient(ellipse 72% 78% at var(--sb-sun-x) 100%, rgba(255,120,96,0.3) 0%, rgba(214,90,160,0.14) 40%, rgba(120,80,200,0.04) 66%, rgba(120,80,200,0) 80%),
            linear-gradient(0deg, rgba(255,140,100,0.16) 0%, rgba(255,120,120,0.05) 24%, rgba(255,120,120,0) 44%);
        }
        .sb-paper {
          position: absolute;
          inset: 0;
          -webkit-mask-image:
            radial-gradient(ellipse 60% 72% at 50% 44%, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.4) 48%, #000 90%),
            linear-gradient(180deg, #000 0%, #000 52%, rgba(0,0,0,0.18) 86%);
          -webkit-mask-composite: source-in;
          mask-image:
            radial-gradient(ellipse 60% 72% at 50% 44%, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.4) 48%, #000 90%),
            linear-gradient(180deg, #000 0%, #000 52%, rgba(0,0,0,0.18) 86%);
          mask-composite: intersect;
        }
        .sb-grid {
          position: absolute;
          left: 0;
          right: 0;
          top: -${MAJOR}px;
          bottom: -${MAJOR}px;
          will-change: transform;
          background-image:
            linear-gradient(rgba(150,200,255,0.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(150,200,255,0.055) 1px, transparent 1px),
            linear-gradient(rgba(150,200,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(150,200,255,0.1) 1px, transparent 1px);
          background-size: ${GRID}px ${GRID}px, ${GRID}px ${GRID}px, ${MAJOR}px ${MAJOR}px, ${MAJOR}px ${MAJOR}px;
        }
        /* Margin network canvases; they fade out above the rooftops. */
        .sb-net {
          position: absolute;
          top: 0;
          height: 100%;
          width: 0;
          -webkit-mask-image: linear-gradient(180deg, #000 0, #000 calc(100% - var(--sb-sky-h) - 60px), transparent calc(100% - var(--sb-sky-h) * 0.5));
          mask-image: linear-gradient(180deg, #000 0, #000 calc(100% - var(--sb-sky-h) - 60px), transparent calc(100% - var(--sb-sky-h) * 0.5));
        }
        .sb-net-l { left: 0; }
        .sb-net-r { right: 0; }
        .sb-skyline {
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          height: 0;
          opacity: 0;
          transition: opacity 1.4s ease;
        }
        .sb-skyline.is-on {
          opacity: 1;
        }
        .sb-grain {
          position: absolute;
          inset: 0;
          background-image: ${GRAIN};
          background-size: 180px 180px;
          opacity: 0.06;
        }
        .sb-scrim {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 46% 60% at 50% 42%, rgba(4,8,24,0.46) 0%, rgba(4,8,24,0.18) 56%, rgba(4,8,24,0) 82%);
        }

        .sb-motion {
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
          border: 1px solid rgba(159,245,255,0.24);
          background: rgba(8,11,28,0.86);
          color: rgba(232,237,255,0.82);
          font-family: var(--lv2-font-mono, ui-monospace, monospace);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          line-height: 1;
          cursor: pointer;
          transition: border-color 0.2s ease, color 0.2s ease;
        }
        .sb-motion:hover {
          border-color: rgba(159,245,255,0.55);
          color: #fff;
        }
        .sb-motion:focus-visible {
          outline: 2px solid #00e5ff;
          outline-offset: 3px;
        }
        .sb-motion svg {
          width: 11px;
          height: 11px;
          flex: none;
        }
        @media (max-width: 1099px) {
          .sb-motion {
            width: 36px;
            height: 36px;
            padding: 0;
            justify-content: center;
          }
          .sb-motion-label {
            position: absolute;
            width: 1px;
            height: 1px;
            overflow: hidden;
            clip-path: inset(50%);
            white-space: nowrap;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .sb-skyline { transition: none; }
        }
      `}</style>
    </>
  );
}
