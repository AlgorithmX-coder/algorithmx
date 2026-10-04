"use client";

/**
 * BLOCK BACKDROP — a bespoke, animated canvas "world" per block, so arriving at
 * a new block feels like levelling up into a different place (owner mandate).
 * One canvas for the whole cover. Same typography/layout everywhere; only the
 * living background changes:
 *
 *   signals  (Block 1 · cyan)   scanning oscilloscope waveforms  "reading the airwaves"
 *   human    (Block 2 · pink)   sonar pings + drifting messages  "someone's reaching for you"
 *   systems  (Block 3 · amber)  circuit traces + travelling pulses "under the hood"
 *   network  (Block 4 · violet) a node web pulsing to one mind    "the long game"
 *
 * Honours reduced-motion by painting a single static field. Colours are driven
 * by the block theme so each world is unmistakably its own.
 */

import { useEffect, useRef } from "react";

export type BackdropVariant =
  // block covers
  | "signals" | "human" | "systems" | "network"
  // per-case worlds (Block 1)
  | "prize" | "crack" | "pinboard" | "storm";

const GROUND = "#060810";

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
}
const rgba = (c: [number, number, number], a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

export function BlockBackdrop({
  variant,
  colors,
  accent,
  accentHi,
  reduced = false,
  opacity = 0.9,
}: {
  variant: BackdropVariant;
  colors: string[];
  accent: string;
  accentHi: string;
  reduced?: boolean;
  opacity?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const cx = cv.getContext("2d");
    if (!cx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pal = colors.map(hexToRgb);
    const acc = hexToRgb(accent);
    const accH = hexToRgb(accentHi);
    let W = 0;
    let H = 0;
    let raf = 0;

    // ---- per-variant state, (re)built on setup ----
    // signals
    let waves: { y: number; amp: number; freq: number; speed: number; phase: number; col: [number, number, number]; w: number }[] = [];
    // human
    let pings: { x: number; y: number; r: number; max: number; col: [number, number, number] }[] = [];
    let bubbles: { x: number; y: number; w: number; h: number; vy: number; col: [number, number, number]; a: number }[] = [];
    // systems
    type Seg = { x1: number; y1: number; x2: number; y2: number };
    let traces: Seg[] = [];
    let nodesS: { x: number; y: number }[] = [];
    let pulses: { seg: number; t: number; speed: number; col: [number, number, number] }[] = [];
    // network
    let netNodes: { x: number; y: number; vx: number; vy: number; r: number }[] = [];
    let edges: { a: number; b: number }[] = [];
    let sparks: { edge: number; t: number; speed: number; dir: number }[] = [];
    let center = { x: 0, y: 0 };
    // prize
    let coins: { x: number; y: number; vy: number; r: number; spin: number; sp: number; col: [number, number, number]; conf: boolean }[] = [];
    let glints: { x: number; y: number; t: number; life: number }[] = [];
    // crack
    let cols: { x: number; y: number; sp: number; lit: number; chars: string[] }[] = [];
    let crackScan = 0;
    // pinboard
    let pins: { x: number; y: number }[] = [];
    let threads: { a: number; b: number }[] = [];
    let threadPulse: { edge: number; t: number; sp: number }[] = [];
    // storm
    let streaks: { ang: number; d: number; sp: number; len: number; col: [number, number, number] }[] = [];
    let sweep = 0;

    const R = (a: number, b: number) => a + Math.random() * (b - a);
    const MASK = "0123456789ABCDEF!@#$%*abcdef".split("");

    const setup = () => {
      W = cv.clientWidth;
      H = cv.clientHeight;
      cv.width = Math.max(1, Math.floor(W * dpr));
      cv.height = Math.max(1, Math.floor(H * dpr));
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (variant === "signals") {
        const rows = Math.max(4, Math.round(H / 120));
        waves = Array.from({ length: rows }, (_, i) => ({
          y: (H / (rows + 1)) * (i + 1),
          amp: R(8, 26),
          freq: R(0.008, 0.02),
          speed: R(0.4, 1.1) * (Math.random() > 0.5 ? 1 : -1),
          phase: R(0, Math.PI * 2),
          col: pal[i % pal.length],
          w: R(1, 2),
        }));
      } else if (variant === "human") {
        pings = [];
        bubbles = Array.from({ length: Math.max(6, Math.round((W * H) / 130000)) }, () => ({
          x: R(0, W),
          y: R(0, H),
          w: R(34, 74),
          h: R(20, 34),
          vy: R(0.12, 0.4),
          col: pal[Math.floor(Math.random() * pal.length)],
          a: R(0.05, 0.16),
        }));
      } else if (variant === "systems") {
        // Orthogonal circuit traces on a coarse grid, with junction nodes.
        const step = 46;
        const cols = Math.ceil(W / step) + 1;
        const rowsN = Math.ceil(H / step) + 1;
        traces = [];
        nodesS = [];
        for (let gx = 0; gx < cols; gx++) {
          for (let gy = 0; gy < rowsN; gy++) {
            if (Math.random() > 0.42) continue;
            const x = gx * step;
            const y = gy * step;
            const horiz = Math.random() > 0.5;
            const len = step * (Math.random() > 0.6 ? 2 : 1);
            const seg = horiz ? { x1: x, y1: y, x2: x + len, y2: y } : { x1: x, y1: y, x2: x, y2: y + len };
            traces.push(seg);
            if (Math.random() > 0.4) nodesS.push({ x, y });
          }
        }
        pulses = Array.from({ length: Math.min(60, Math.round(traces.length * 0.5)) }, () => ({
          seg: Math.floor(Math.random() * Math.max(1, traces.length)),
          t: Math.random(),
          speed: R(0.006, 0.02),
          col: Math.random() > 0.5 ? accH : pal[Math.floor(Math.random() * pal.length)],
        }));
      } else if (variant === "prize") {
        // falling coins + confetti, a gaudy "you won" shower (denser = more motion)
        coins = Array.from({ length: Math.max(22, Math.round((W * H) / 26000)) }, () => ({
          x: R(0, W), y: R(-H, H), vy: R(0.5, 1.7), r: R(7, 16), spin: R(0, Math.PI * 2),
          sp: R(-0.05, 0.05), col: pal[Math.floor(Math.random() * pal.length)], conf: Math.random() > 0.55,
        }));
        glints = [];
      } else if (variant === "crack") {
        // columns of streaming masked passwords / hex being brute-forced
        const step = 20;
        const n = Math.max(6, Math.floor(W / step));
        cols = Array.from({ length: n }, (_, i) => ({
          x: i * step + 4, y: R(-H, 0), sp: R(1.2, 3.4), lit: Math.random() > 0.85 ? 1 : 0,
          chars: Array.from({ length: Math.ceil(H / 15) + 2 }, () => MASK[Math.floor(Math.random() * MASK.length)]),
        }));
        crackScan = H;
      } else if (variant === "pinboard") {
        // an evidence corkboard: pins joined by red string, clue pulses travel (denser = more motion)
        const count = Math.max(14, Math.round((W * H) / 52000));
        pins = Array.from({ length: count }, () => ({ x: R(W * 0.05, W * 0.95), y: R(H * 0.08, H * 0.95) }));
        threads = [];
        const thr = Math.min(W, H) * 0.38;
        for (let i = 0; i < pins.length; i++) {
          for (let j = i + 1; j < pins.length; j++) {
            const dx = pins[i].x - pins[j].x, dy = pins[i].y - pins[j].y;
            if (dx * dx + dy * dy < thr * thr && Math.random() > 0.42) threads.push({ a: i, b: j });
          }
        }
        threadPulse = Array.from({ length: Math.min(18, threads.length) }, () => ({
          edge: Math.floor(Math.random() * Math.max(1, threads.length)), t: Math.random(), sp: R(0.004, 0.014),
        }));
      } else if (variant === "storm") {
        // incoming signal streaks converging on one target (the child) + radar sweep
        center = { x: W * 0.5, y: H * 0.5 };
        streaks = Array.from({ length: Math.max(40, Math.round((W * H) / 15000)) }, () => ({
          ang: R(0, Math.PI * 2), d: R(0.35, 1) * Math.max(W, H) * 0.7, sp: R(1.4, 4.2), len: R(30, 90),
          col: pal[Math.floor(Math.random() * pal.length)],
        }));
        sweep = 0;
      } else {
        // network: nodes drifting, edges between near ones, pulses toward a mind.
        center = { x: W * 0.5, y: H * 0.42 };
        const count = Math.max(18, Math.round((W * H) / 42000));
        netNodes = Array.from({ length: count }, () => ({
          x: R(0, W),
          y: R(0, H),
          vx: R(-0.18, 0.18),
          vy: R(-0.18, 0.18),
          r: R(1.4, 3),
        }));
        edges = [];
        const thr = Math.min(W, H) * 0.22;
        for (let i = 0; i < netNodes.length; i++) {
          for (let j = i + 1; j < netNodes.length; j++) {
            const dx = netNodes[i].x - netNodes[j].x;
            const dy = netNodes[i].y - netNodes[j].y;
            if (dx * dx + dy * dy < thr * thr && Math.random() > 0.5) edges.push({ a: i, b: j });
          }
        }
        sparks = Array.from({ length: Math.min(40, Math.round(edges.length * 0.4)) }, () => ({
          edge: Math.floor(Math.random() * Math.max(1, edges.length)),
          t: Math.random(),
          speed: R(0.004, 0.014),
          dir: Math.random() > 0.5 ? 1 : -1,
        }));
      }
    };

    const clear = (trail: number) => {
      cx.fillStyle = trail >= 1 ? GROUND : rgba([6, 8, 16], trail);
      cx.fillRect(0, 0, W, H);
    };

    // ---------- SIGNALS ----------
    let scan = 0;
    const drawSignals = (dt: number, live: boolean) => {
      clear(live ? 0.16 : 1);
      cx.lineWidth = 1;
      scan = (scan + (live ? dt * 0.00028 * W : 0)) % (W * 1.3);
      for (const wv of waves) {
        cx.beginPath();
        cx.lineWidth = wv.w;
        for (let x = 0; x <= W; x += 6) {
          const y = wv.y + Math.sin(x * wv.freq + wv.phase) * wv.amp;
          if (x === 0) cx.moveTo(x, y);
          else cx.lineTo(x, y);
        }
        const grad = cx.createLinearGradient(0, 0, W, 0);
        grad.addColorStop(0, rgba(wv.col, 0.12));
        const sp = Math.max(0, 1 - Math.abs((scan - W * 0.5) - 0) / (W * 0.5));
        grad.addColorStop(Math.min(0.98, Math.max(0.02, scan / W)), rgba(wv.col, 0.55 + sp * 0.35));
        grad.addColorStop(1, rgba(wv.col, 0.12));
        cx.strokeStyle = grad;
        cx.stroke();
        if (live) wv.phase += wv.speed * dt * 0.006;
      }
      // vertical scan sweep
      if (live) {
        const g = cx.createLinearGradient(scan - 60, 0, scan + 12, 0);
        g.addColorStop(0, rgba(accH, 0));
        g.addColorStop(1, rgba(accH, 0.22));
        cx.fillStyle = g;
        cx.fillRect(scan - 60, 0, 72, H);
        cx.fillStyle = rgba(accH, 0.5);
        cx.fillRect(scan, 0, 1.5, H);
      }
    };

    // ---------- HUMAN ----------
    let pingClock = 0;
    const drawHuman = (dt: number, live: boolean) => {
      clear(live ? 0.12 : 1);
      // spawn pings
      if (live) {
        pingClock += dt;
        if (pingClock > 620 && pings.length < 8) {
          pingClock = 0;
          pings.push({ x: R(W * 0.1, W * 0.9), y: R(H * 0.15, H * 0.9), r: 4, max: R(160, 300), col: pal[Math.floor(Math.random() * pal.length)] });
        }
      } else if (pings.length === 0) {
        for (let i = 0; i < 4; i++) pings.push({ x: R(W * 0.1, W * 0.9), y: R(H * 0.15, H * 0.9), r: R(40, 200), max: 260, col: pal[i % pal.length] });
      }
      for (let i = pings.length - 1; i >= 0; i--) {
        const p = pings[i];
        const a = Math.max(0, 1 - p.r / p.max);
        cx.beginPath();
        cx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        cx.strokeStyle = rgba(p.col, a * 0.5);
        cx.lineWidth = 1.4;
        cx.stroke();
        cx.beginPath();
        cx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        cx.fillStyle = rgba(p.col, a * 0.8);
        cx.fill();
        if (live) p.r += dt * 0.055;
        if (p.r > p.max) pings.splice(i, 1);
      }
      // drifting chat bubbles
      for (const b of bubbles) {
        const r = 8;
        const x = b.x, y = b.y, w = b.w, h = b.h;
        cx.beginPath();
        cx.moveTo(x + r, y);
        cx.arcTo(x + w, y, x + w, y + h, r);
        cx.arcTo(x + w, y + h, x, y + h, r);
        cx.lineTo(x + 16, y + h);
        cx.lineTo(x + 10, y + h + 7);
        cx.lineTo(x + 9, y + h);
        cx.arcTo(x, y + h, x, y, r);
        cx.arcTo(x, y, x + w, y, r);
        cx.closePath();
        cx.strokeStyle = rgba(b.col, b.a + 0.06);
        cx.lineWidth = 1.2;
        cx.stroke();
        // dots inside
        cx.fillStyle = rgba(b.col, b.a + 0.12);
        for (let d = 0; d < 3; d++) { cx.beginPath(); cx.arc(x + 16 + d * 12, y + h / 2, 1.6, 0, Math.PI * 2); cx.fill(); }
        if (live) { b.y -= b.vy; if (b.y + b.h + 10 < 0) { b.y = H + 10; b.x = R(0, W); } }
      }
    };

    // ---------- SYSTEMS ----------
    const drawSystems = (dt: number, live: boolean) => {
      clear(1);
      // faint grid
      cx.strokeStyle = rgba(acc, 0.05);
      cx.lineWidth = 1;
      const gs = 46;
      cx.beginPath();
      for (let x = 0; x <= W; x += gs) { cx.moveTo(x, 0); cx.lineTo(x, H); }
      for (let y = 0; y <= H; y += gs) { cx.moveTo(0, y); cx.lineTo(W, y); }
      cx.stroke();
      // traces
      cx.strokeStyle = rgba(acc, 0.16);
      cx.lineWidth = 1.3;
      cx.beginPath();
      for (const s of traces) { cx.moveTo(s.x1, s.y1); cx.lineTo(s.x2, s.y2); }
      cx.stroke();
      // junction nodes
      for (const nd of nodesS) {
        cx.beginPath();
        cx.rect(nd.x - 2.2, nd.y - 2.2, 4.4, 4.4);
        cx.fillStyle = rgba(acc, 0.28);
        cx.fill();
      }
      // travelling pulses
      for (const p of pulses) {
        const s = traces[p.seg];
        if (!s) continue;
        const px = s.x1 + (s.x2 - s.x1) * p.t;
        const py = s.y1 + (s.y2 - s.y1) * p.t;
        const glow = cx.createRadialGradient(px, py, 0, px, py, 9);
        glow.addColorStop(0, rgba(p.col, 0.95));
        glow.addColorStop(1, rgba(p.col, 0));
        cx.fillStyle = glow;
        cx.beginPath();
        cx.arc(px, py, 9, 0, Math.PI * 2);
        cx.fill();
        if (live) {
          p.t += p.speed * dt * 0.06;
          if (p.t > 1) { p.t = 0; p.seg = Math.floor(Math.random() * traces.length); }
        }
      }
    };

    // ---------- NETWORK ----------
    const drawNetwork = (dt: number, live: boolean) => {
      clear(1);
      if (live) {
        for (const n of netNodes) {
          n.x += n.vx; n.y += n.vy;
          if (n.x < 0 || n.x > W) n.vx *= -1;
          if (n.y < 0 || n.y > H) n.vy *= -1;
        }
      }
      // edges
      cx.lineWidth = 1;
      for (const e of edges) {
        const a = netNodes[e.a], b = netNodes[e.b];
        cx.strokeStyle = rgba(acc, 0.1);
        cx.beginPath();
        cx.moveTo(a.x, a.y);
        cx.lineTo(b.x, b.y);
        cx.stroke();
      }
      // lines to the mind, faint
      cx.strokeStyle = rgba(accH, 0.06);
      for (let i = 0; i < netNodes.length; i += 3) {
        cx.beginPath(); cx.moveTo(netNodes[i].x, netNodes[i].y); cx.lineTo(center.x, center.y); cx.stroke();
      }
      // travelling sparks
      for (const sp of sparks) {
        const e = edges[sp.edge];
        if (!e) continue;
        const a = netNodes[e.a], b = netNodes[e.b];
        const t = sp.dir > 0 ? sp.t : 1 - sp.t;
        const x = a.x + (b.x - a.x) * t;
        const y = a.y + (b.y - a.y) * t;
        cx.fillStyle = rgba(accH, 0.9);
        cx.beginPath(); cx.arc(x, y, 1.8, 0, Math.PI * 2); cx.fill();
        if (live) { sp.t += sp.speed * dt * 0.06; if (sp.t > 1) { sp.t = 0; sp.edge = Math.floor(Math.random() * edges.length); sp.dir = Math.random() > 0.5 ? 1 : -1; } }
      }
      // nodes
      for (const n of netNodes) {
        cx.fillStyle = rgba(pal[0], 0.5);
        cx.beginPath(); cx.arc(n.x, n.y, n.r, 0, Math.PI * 2); cx.fill();
      }
      // the mind — bright pulsing core
      const pulse = live ? 0.75 + Math.sin(Date.now() * 0.003) * 0.25 : 0.85;
      const core = cx.createRadialGradient(center.x, center.y, 0, center.x, center.y, 40);
      core.addColorStop(0, rgba(accH, 0.9 * pulse));
      core.addColorStop(0.4, rgba(acc, 0.4 * pulse));
      core.addColorStop(1, rgba(acc, 0));
      cx.fillStyle = core;
      cx.beginPath(); cx.arc(center.x, center.y, 40, 0, Math.PI * 2); cx.fill();
      cx.fillStyle = rgba(accH, pulse);
      cx.beginPath(); cx.arc(center.x, center.y, 3.5, 0, Math.PI * 2); cx.fill();
    };

    // ---------- PRIZE (case 2 · greed) ----------
    const drawPrize = (dt: number, live: boolean) => {
      clear(1);
      const t = Date.now() * 0.001;
      // rotating "jackpot" burst rays from top-centre
      const rays = 16, cxp = W * 0.5, cyp = -30, spin = live ? t * 0.15 : 0;
      cx.save();
      for (let i = 0; i < rays; i++) {
        const a = spin + (i / rays) * Math.PI * 2;
        cx.beginPath(); cx.moveTo(cxp, cyp);
        const R2 = Math.max(W, H) * 1.1;
        cx.lineTo(cxp + Math.cos(a - 0.05) * R2, cyp + Math.sin(a - 0.05) * R2);
        cx.lineTo(cxp + Math.cos(a + 0.05) * R2, cyp + Math.sin(a + 0.05) * R2);
        cx.closePath();
        cx.fillStyle = rgba(i % 2 ? accH : pal[2] ?? acc, 0.04);
        cx.fill();
      }
      cx.restore();
      // soft gold glow up top, gently pulsing
      const pulse = live ? 0.10 + Math.sin(t * 2) * 0.05 : 0.12;
      const g = cx.createRadialGradient(W * 0.5, -40, 0, W * 0.5, -40, Math.max(W, H) * 0.62);
      g.addColorStop(0, rgba(accH, pulse)); g.addColorStop(1, rgba(accH, 0));
      cx.fillStyle = g; cx.fillRect(0, 0, W, H);
      for (const c of coins) {
        cx.save();
        cx.translate(c.x, c.y);
        cx.rotate(c.spin);
        if (c.conf) {
          cx.fillStyle = rgba(c.col, 0.5);
          cx.fillRect(-c.r * 0.5, -c.r * 0.28, c.r, c.r * 0.55);
        } else {
          // coin: rim + face + glint
          const sc = Math.abs(Math.cos(c.spin)); // fake spin squash
          cx.scale(0.35 + sc * 0.65, 1);
          cx.beginPath(); cx.arc(0, 0, c.r, 0, Math.PI * 2);
          cx.fillStyle = rgba(c.col, 0.42); cx.fill();
          cx.lineWidth = 1.5; cx.strokeStyle = rgba(accH, 0.6); cx.stroke();
          cx.fillStyle = rgba(accH, 0.7); cx.font = `${Math.round(c.r)}px monospace`;
          cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText("★", 0, 1);
        }
        cx.restore();
        if (live) { c.y += c.vy * dt * 0.12; c.spin += c.sp * dt; if (c.y - c.r > H) { c.y = -c.r - R(0, H * 0.4); c.x = R(0, W); } }
      }
      // sparkle glints (more frequent = busier win screen)
      if (live && Math.random() > 0.74 && glints.length < 24) glints.push({ x: R(0, W), y: R(0, H), t: 0, life: R(500, 1100) });
      for (let i = glints.length - 1; i >= 0; i--) {
        const gl = glints[i]; const a = Math.sin((gl.t / gl.life) * Math.PI);
        cx.strokeStyle = rgba(accH, a * 0.8); cx.lineWidth = 1.4;
        const s = 6 + a * 5;
        cx.beginPath(); cx.moveTo(gl.x - s, gl.y); cx.lineTo(gl.x + s, gl.y); cx.moveTo(gl.x, gl.y - s); cx.lineTo(gl.x, gl.y + s); cx.stroke();
        if (live) { gl.t += dt; if (gl.t > gl.life) glints.splice(i, 1); }
      }
    };

    // ---------- CRACK (case 3 · brute force) ----------
    const drawCrack = (dt: number, live: boolean) => {
      clear(live ? 0.2 : 1);
      cx.font = "13px monospace"; cx.textAlign = "left"; cx.textBaseline = "top";
      const lh = 15;
      for (const c of cols) {
        for (let k = 0; k < c.chars.length; k++) {
          const yy = c.y + k * lh;
          if (yy < -lh || yy > H) continue;
          const head = k === c.chars.length - 1;
          cx.fillStyle = head ? rgba(accH, 0.9) : rgba(acc, c.lit ? 0.5 : 0.22);
          cx.fillText(c.chars[k], c.x, yy);
        }
        if (live) {
          c.y += c.sp * dt * 0.12;
          if (Math.random() > 0.9) c.chars[Math.floor(Math.random() * c.chars.length)] = MASK[Math.floor(Math.random() * MASK.length)];
          if (c.y > H) { c.y = -c.chars.length * lh - R(0, H * 0.5); c.lit = Math.random() > 0.85 ? 1 : 0; }
        }
      }
      // a bright "cracking" scan sweeping up
      if (live) {
        crackScan -= dt * 0.12; if (crackScan < -40) crackScan = H + 40;
        const sg = cx.createLinearGradient(0, crackScan - 30, 0, crackScan + 30);
        sg.addColorStop(0, rgba(accH, 0)); sg.addColorStop(0.5, rgba(accH, 0.16)); sg.addColorStop(1, rgba(accH, 0));
        cx.fillStyle = sg; cx.fillRect(0, crackScan - 30, W, 60);
      }
    };

    // ---------- PINBOARD (case 4 · what you leak) ----------
    const drawPinboard = (dt: number, live: boolean) => {
      clear(1);
      // faint board grain
      cx.strokeStyle = rgba(acc, 0.04); cx.lineWidth = 1;
      // red string threads
      for (const th of threads) {
        const a = pins[th.a], b = pins[th.b];
        cx.strokeStyle = rgba(pal[0], 0.16); cx.lineWidth = 1;
        cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(b.x, b.y); cx.stroke();
      }
      // clue pulses travelling threads
      for (const p of threadPulse) {
        const e = threads[p.edge]; if (!e) continue;
        const a = pins[e.a], b = pins[e.b];
        const x = a.x + (b.x - a.x) * p.t, y = a.y + (b.y - a.y) * p.t;
        cx.fillStyle = rgba(accH, 0.85); cx.beginPath(); cx.arc(x, y, 2, 0, Math.PI * 2); cx.fill();
        if (live) { p.t += p.sp * dt * 0.06; if (p.t > 1) { p.t = 0; p.edge = Math.floor(Math.random() * threads.length); } }
      }
      // slow magnifier sweep drifting over the board
      if (live) {
        const tt = Date.now() * 0.0004;
        const mx = W * (0.5 + 0.34 * Math.sin(tt)), my = H * (0.5 + 0.3 * Math.cos(tt * 0.8));
        const mg = cx.createRadialGradient(mx, my, 0, mx, my, 120);
        mg.addColorStop(0, rgba(accH, 0.10)); mg.addColorStop(0.7, rgba(acc, 0.04)); mg.addColorStop(1, rgba(acc, 0));
        cx.fillStyle = mg; cx.beginPath(); cx.arc(mx, my, 120, 0, Math.PI * 2); cx.fill();
        cx.strokeStyle = rgba(accH, 0.14); cx.lineWidth = 1.5; cx.beginPath(); cx.arc(mx, my, 118, 0, Math.PI * 2); cx.stroke();
      }
      // pins (pushpins)
      const pulse = live ? 0.6 + Math.sin(Date.now() * 0.004) * 0.4 : 0.8;
      for (let i = 0; i < pins.length; i++) {
        const p = pins[i];
        const gl = cx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 7);
        gl.addColorStop(0, rgba(acc, 0.5 * (i % 3 === 0 ? pulse : 0.6))); gl.addColorStop(1, rgba(acc, 0));
        cx.fillStyle = gl; cx.beginPath(); cx.arc(p.x, p.y, 7, 0, Math.PI * 2); cx.fill();
        cx.fillStyle = rgba(accH, 0.85); cx.beginPath(); cx.arc(p.x, p.y, 2.2, 0, Math.PI * 2); cx.fill();
      }
    };

    // ---------- STORM (case 5 · targeted at you) ----------
    const drawStorm = (dt: number, live: boolean) => {
      clear(live ? 0.22 : 1);
      const cxp = center.x, cyp = center.y;
      // radar rings + crosshair on the target (you)
      cx.strokeStyle = rgba(acc, 0.12); cx.lineWidth = 1;
      for (let r = 40; r < Math.max(W, H); r += 70) { cx.beginPath(); cx.arc(cxp, cyp, r, 0, Math.PI * 2); cx.stroke(); }
      cx.strokeStyle = rgba(acc, 0.18);
      cx.beginPath(); cx.moveTo(cxp - 26, cyp); cx.lineTo(cxp + 26, cyp); cx.moveTo(cxp, cyp - 26); cx.lineTo(cxp, cyp + 26); cx.stroke();
      // incoming streaks converging on the target
      for (const s of streaks) {
        const x1 = cxp + Math.cos(s.ang) * s.d, y1 = cyp + Math.sin(s.ang) * s.d;
        const x2 = cxp + Math.cos(s.ang) * (s.d - s.len), y2 = cyp + Math.sin(s.ang) * (s.d - s.len);
        const a = Math.max(0, Math.min(0.7, 1 - s.d / (Math.max(W, H) * 0.7)));
        const lg = cx.createLinearGradient(x1, y1, x2, y2);
        lg.addColorStop(0, rgba(s.col, 0)); lg.addColorStop(1, rgba(s.col, 0.55 + a * 0.3));
        cx.strokeStyle = lg; cx.lineWidth = 1.6; cx.beginPath(); cx.moveTo(x1, y1); cx.lineTo(x2, y2); cx.stroke();
        if (live) { s.d -= s.sp * dt * 0.12; if (s.d < 10) { s.ang = R(0, Math.PI * 2); s.d = R(0.6, 1) * Math.max(W, H) * 0.7; } }
      }
      // rotating radar sweep
      if (live) sweep = (sweep + dt * 0.0012) % (Math.PI * 2);
      const sg = cx.createRadialGradient(cxp, cyp, 0, cxp, cyp, Math.max(W, H) * 0.55);
      sg.addColorStop(0, rgba(accH, 0.14)); sg.addColorStop(1, rgba(accH, 0));
      cx.save(); cx.translate(cxp, cyp); cx.rotate(sweep);
      cx.beginPath(); cx.moveTo(0, 0); cx.arc(0, 0, Math.max(W, H) * 0.55, -0.35, 0.02); cx.closePath();
      cx.fillStyle = sg; cx.fill(); cx.restore();
      // target core
      const pulse = live ? 0.7 + Math.sin(Date.now() * 0.006) * 0.3 : 0.8;
      cx.fillStyle = rgba(accH, pulse); cx.beginPath(); cx.arc(cxp, cyp, 3.2, 0, Math.PI * 2); cx.fill();
      // red alert-flicker vignette + occasional glitch bar (storm closing in)
      if (live) {
        const fl = Math.max(0, Math.sin(Date.now() * 0.0013)) ** 6;
        if (fl > 0.02) {
          const vg = cx.createRadialGradient(cxp, cyp, Math.min(W, H) * 0.2, cxp, cyp, Math.max(W, H) * 0.7);
          vg.addColorStop(0, rgba(acc, 0)); vg.addColorStop(1, rgba(acc, 0.14 * fl));
          cx.fillStyle = vg; cx.fillRect(0, 0, W, H);
        }
        if (Math.random() > 0.94) {
          const gy = Math.random() * H;
          cx.fillStyle = rgba(accH, 0.12); cx.fillRect(0, gy, W, 1 + Math.random() * 2);
        }
      }
    };

    const frame = (dt: number, live: boolean) => {
      if (variant === "signals") drawSignals(dt, live);
      else if (variant === "human") drawHuman(dt, live);
      else if (variant === "systems") drawSystems(dt, live);
      else if (variant === "prize") drawPrize(dt, live);
      else if (variant === "crack") drawCrack(dt, live);
      else if (variant === "pinboard") drawPinboard(dt, live);
      else if (variant === "storm") drawStorm(dt, live);
      else drawNetwork(dt, live);
    };

    let last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(60, t - last);
      last = t;
      frame(dt, true);
      raf = requestAnimationFrame(loop);
    };

    setup();
    if (reduced) {
      frame(0, false);
    } else {
      // A few warm-up frames so systems/pulses aren't all bunched at t=0.
      raf = requestAnimationFrame(loop);
    }

    const onResize = () => { setup(); if (reduced) frame(0, false); };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [variant, colors, accent, accentHi, reduced]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none", opacity }}
    />
  );
}
