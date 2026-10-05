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
  | "prize" | "crack" | "pinboard" | "storm"
  // per-case worlds (Block 2 — matches each case's "app" identity)
  | "ripple" | "loop" | "glint" | "bond" | "ringer"
  // per-case worlds (Block 3 — the Console)
  | "vault" | "cipher" | "backdoor" | "install" | "browser"
  // per-case worlds (Block 4 — the War Room)
  | "harvest" | "deepfake" | "crossroads" | "convergence" | "unmask";

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
    // ripple (B2 case 6 "Ripple" — emotional pressure spreading outward)
    let ripples: { x: number; y: number; r: number; max: number; sp: number; col: [number, number, number] }[] = [];
    let rippleClock = 0;
    // loop (B2 case 7 "Loop" — a stolen identity echoing/duplicating)
    let loopOrbits: { cx: number; cy: number; rad: number; ang: number; sp: number; trail: number[]; col: [number, number, number] }[] = [];
    // glint (B2 case 8 "Glint" — AI ghostwriting streaming out, too perfect)
    let glintLines: { x: number; y: number; w: number; chars: number; max: number; sp: number; col: [number, number, number] }[] = [];
    let glintSparkle: { x: number; y: number; t: number; life: number }[] = [];
    // bond (B2 case 9 "Bond" — a slow-drip trust timeline, weeks ticking by)
    let bondNodes: { x: number; y: number; lit: number }[] = [];
    let bondDrip = 0;
    // ringer (B2 case 10 "Ringer" — a voice clone, two waveforms converging)
    let ringerPhase = 0;
    let ringerPulses: { t: number; sp: number }[] = [];
    // vault (B3 case 11 — tumblers turning, building a lock that holds)
    let tumblers: { cx: number; cy: number; r: number; ang: number; sp: number; ticks: number }[] = [];
    // cipher (B3 case 12 — ciphertext columns that briefly resolve to plaintext)
    let cipherCols: { x: number; y: number; sp: number; chars: string[]; resolve: number }[] = [];
    const CIPHER_CHARS = "!@#$%&*?<>~^".split("");
    const PLAIN_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    // backdoor (B3 case 13 — a wall of code with one cell glitching open)
    let wallCells: { x: number; y: number; s: number }[] = [];
    let doorCell = 0;
    let doorClock = 0;
    // install (B3 case 14 — permissions cascading, a progress bar that never finishes)
    let permGlyphs: { x: number; y: number; sp: number; shape: number }[] = [];
    let installBar = 0;
    // browser (B3 case 15 — two near-identical windows, a URL bar that glitches)
    let urlGlitch = 0;
    // harvest (B4 case 16 — data tags drifting into a broker's collection)
    let dataTags: { x: number; y: number; vx: number; vy: number; shape: number }[] = [];
    let harvestCenter = { x: 0, y: 0 };
    // deepfake (B4 case 17 — a face that glitches between two states)
    let faceGlitch = 0;
    let faceCenter = { x: 0, y: 0 };
    // crossroads (B4 case 18 — a path forks, one branch pulses)
    let forkClock = 0;
    let forkPick = 0;
    // convergence (B4 case 19 — every earlier signal style, all at once)
    let convStreaks: { ang: number; d: number; sp: number; col: [number, number, number] }[] = [];
    let convCenter = { x: 0, y: 0 };
    // unmask (B4 case 20 — a redacted glyph that periodically resolves)
    let unmaskBlocks: { x: number; y: number; s: number; on: boolean }[] = [];
    let unmaskClock = 0;

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
      } else if (variant === "ripple") {
        ripples = [];
        for (let i = 0; i < 3; i++) ripples.push({ x: R(W * 0.2, W * 0.8), y: R(H * 0.2, H * 0.8), r: R(0, 160), max: R(200, 340), sp: R(0.02, 0.04), col: pal[i % pal.length] });
        rippleClock = 0;
      } else if (variant === "loop") {
        const n = Math.max(4, Math.round((W * H) / 180000));
        loopOrbits = Array.from({ length: n }, () => ({
          cx: R(W * 0.1, W * 0.9), cy: R(H * 0.1, H * 0.9), rad: R(16, 42), ang: R(0, Math.PI * 2),
          sp: R(0.006, 0.016) * (Math.random() > 0.5 ? 1 : -1), trail: [], col: pal[Math.floor(Math.random() * pal.length)],
        }));
      } else if (variant === "glint") {
        const lh = 26;
        const rows = Math.ceil(H / lh);
        glintLines = Array.from({ length: rows }, (_, i) => ({
          x: 14, y: i * lh + R(0, lh * 0.4), w: R(W * 0.18, W * 0.5), chars: 0, max: R(20, 60), sp: R(0.3, 0.9), col: pal[Math.floor(Math.random() * pal.length)],
        }));
        glintSparkle = [];
      } else if (variant === "bond") {
        const n = Math.max(7, Math.round(W / 130));
        bondNodes = Array.from({ length: n }, (_, i) => ({ x: (W / (n + 1)) * (i + 1), y: H * 0.5 + R(-24, 24), lit: 0 }));
        bondDrip = 0;
      } else if (variant === "ringer") {
        ringerPhase = 0;
        ringerPulses = Array.from({ length: 5 }, (_, i) => ({ t: i * 0.7, sp: 0.6 }));
        // Off-centre: a centred phone shell would otherwise sit right on top of
        // the ring's epicentre and hide it. Bloom from the open side margin.
        center = { x: W * 0.82, y: H * 0.38 };
      } else if (variant === "vault") {
        // Off-centre: a centred console panel would otherwise sit right over
        // the dial and hide it. Turn it in the open side margin instead.
        tumblers = Array.from({ length: 3 }, (_, i) => ({
          cx: W * 0.18, cy: H * 0.5, r: 70 + i * 48, ang: R(0, Math.PI * 2),
          sp: (i % 2 === 0 ? 1 : -1) * R(0.0006, 0.0014), ticks: 10 + i * 4,
        }));
      } else if (variant === "cipher") {
        const step = 22;
        const n = Math.max(6, Math.floor(W / step));
        cipherCols = Array.from({ length: n }, (_, i) => ({
          x: i * step + 4, y: R(-H, 0), sp: R(1, 2.6),
          chars: Array.from({ length: Math.ceil(H / 16) + 2 }, () => CIPHER_CHARS[Math.floor(Math.random() * CIPHER_CHARS.length)]),
          resolve: Math.random() > 0.75 ? Math.floor(R(0, 6)) : -1,
        }));
      } else if (variant === "backdoor") {
        const step = 34;
        const cols = Math.ceil(W / step), rowsN = Math.ceil(H / step);
        wallCells = [];
        for (let gx = 0; gx < cols; gx++) for (let gy = 0; gy < rowsN; gy++) if (Math.random() > 0.55) wallCells.push({ x: gx * step, y: gy * step, s: step - 6 });
        doorCell = Math.floor(Math.random() * Math.max(1, wallCells.length));
        doorClock = 0;
      } else if (variant === "install") {
        const n = Math.max(10, Math.round((W * H) / 70000));
        permGlyphs = Array.from({ length: n }, () => ({ x: R(0, W), y: R(-H, H), sp: R(0.3, 0.9), shape: Math.floor(R(0, 3)) }));
        installBar = 0;
      } else if (variant === "browser") {
        urlGlitch = 0;
      } else if (variant === "harvest") {
        harvestCenter = { x: W * 0.5, y: H * 0.5 };
        const n = Math.max(14, Math.round((W * H) / 42000));
        dataTags = Array.from({ length: n }, () => ({ x: R(0, W), y: R(0, H), vx: 0, vy: 0, shape: Math.floor(R(0, 3)) }));
      } else if (variant === "deepfake") {
        faceGlitch = 0;
        // Off-centre, same reason as vault — the console panel would hide a
        // face drawn dead-centre.
        faceCenter = { x: W * 0.84, y: H * 0.42 };
      } else if (variant === "crossroads") {
        forkClock = 0; forkPick = 0;
      } else if (variant === "convergence") {
        convCenter = { x: W * 0.5, y: H * 0.5 };
        const n = Math.max(30, Math.round((W * H) / 20000));
        convStreaks = Array.from({ length: n }, () => ({ ang: R(0, Math.PI * 2), d: R(0.3, 1) * Math.max(W, H) * 0.65, sp: R(1.6, 4.6), col: pal[Math.floor(Math.random() * pal.length)] }));
      } else if (variant === "unmask") {
        // Off-centre, same reason as vault/deepfake.
        const cell = 16, cols = 11, rowsN = 13;
        const ox = W * 0.18 - (cols * cell) / 2, oy = H * 0.5 - (rowsN * cell) / 2;
        unmaskBlocks = [];
        for (let gx = 0; gx < cols; gx++) for (let gy = 0; gy < rowsN; gy++) {
          const dx = gx - cols / 2, dy = gy - rowsN / 2;
          if (dx * dx * 1.3 + dy * dy < (cols / 2) * (rowsN / 2) * 0.55) unmaskBlocks.push({ x: ox + gx * cell, y: oy + gy * cell, s: cell - 2, on: Math.random() > 0.5 });
        }
        unmaskClock = 0;
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

    // ---------- RIPPLE (B2 case 6 · pressure spreads outward) ----------
    const drawRipple = (dt: number, live: boolean) => {
      clear(1);
      if (live) {
        rippleClock += dt;
        if (rippleClock > 1400 && ripples.length < 6) {
          rippleClock = 0;
          ripples.push({ x: R(W * 0.1, W * 0.9), y: R(H * 0.1, H * 0.9), r: 0, max: R(220, 380), sp: R(0.025, 0.045), col: pal[Math.floor(Math.random() * pal.length)] });
        }
      }
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        const a = Math.max(0, 1 - rp.r / rp.max);
        for (let k = 0; k < 3; k++) {
          const rr = rp.r - k * 26;
          if (rr <= 0) continue;
          cx.beginPath(); cx.arc(rp.x, rp.y, rr, 0, Math.PI * 2);
          cx.strokeStyle = rgba(rp.col, a * (0.5 - k * 0.14)); cx.lineWidth = 1.4; cx.stroke();
        }
        if (live) { rp.r += rp.sp * dt * 6; if (rp.r > rp.max + 60) ripples.splice(i, 1); }
      }
    };

    // ---------- LOOP (B2 case 7 · a stolen identity echoing) ----------
    const drawLoop = (dt: number, live: boolean) => {
      clear(1);
      for (const o of loopOrbits) {
        const x = o.cx + Math.cos(o.ang) * o.rad, y = o.cy + Math.sin(o.ang) * o.rad;
        // ghost trail of past positions (the "echo")
        for (let t = 0; t < o.trail.length; t += 2) {
          const ta = o.trail[t], tr = o.trail[t + 1];
          const tx = o.cx + Math.cos(ta) * tr, ty = o.cy + Math.sin(ta) * tr;
          const age = 1 - t / o.trail.length;
          cx.beginPath(); cx.arc(tx, ty, 2.4, 0, Math.PI * 2); cx.fillStyle = rgba(o.col, 0.25 * age); cx.fill();
        }
        // faint orbit ring + the live head
        cx.beginPath(); cx.arc(o.cx, o.cy, o.rad, 0, Math.PI * 2); cx.strokeStyle = rgba(o.col, 0.1); cx.lineWidth = 1; cx.stroke();
        cx.beginPath(); cx.arc(x, y, 3, 0, Math.PI * 2); cx.fillStyle = rgba(accH, 0.85); cx.fill();
        if (live) {
          o.ang += o.sp * dt * 0.06;
          o.trail.unshift(o.ang, o.rad); if (o.trail.length > 16) o.trail.length = 16;
        }
      }
    };

    // ---------- GLINT (B2 case 8 · AI ghostwriting, too perfect) ----------
    const drawGlint = (dt: number, live: boolean) => {
      clear(1);
      cx.font = "12px monospace"; cx.textBaseline = "top";
      for (const ln of glintLines) {
        const shown = Math.min(ln.max, Math.floor(ln.chars));
        cx.fillStyle = rgba(ln.col, 0.16);
        cx.fillRect(ln.x, ln.y, (ln.w * shown) / ln.max, 3);
        // the typing cursor glints bright at the write-head
        if (shown < ln.max) {
          cx.fillStyle = rgba(accH, 0.6);
          cx.fillRect(ln.x + (ln.w * shown) / ln.max, ln.y - 1, 2, 5);
        }
        if (live) { ln.chars += ln.sp * dt * 0.05; if (ln.chars > ln.max + 40) ln.chars = 0; }
      }
      if (live && Math.random() > 0.93 && glintSparkle.length < 10) glintSparkle.push({ x: R(0, W), y: R(0, H), t: 0, life: R(400, 800) });
      for (let i = glintSparkle.length - 1; i >= 0; i--) {
        const s = glintSparkle[i]; const a = Math.sin((s.t / s.life) * Math.PI);
        cx.strokeStyle = rgba(accH, a * 0.8); cx.lineWidth = 1.2;
        const r = 4 + a * 4;
        cx.beginPath(); cx.moveTo(s.x - r, s.y); cx.lineTo(s.x + r, s.y); cx.moveTo(s.x, s.y - r); cx.lineTo(s.x, s.y + r); cx.stroke();
        if (live) { s.t += dt; if (s.t > s.life) glintSparkle.splice(i, 1); }
      }
    };

    // ---------- BOND (B2 case 9 · trust accrues slowly, weeks tick by) ----------
    const drawBond = (dt: number, live: boolean) => {
      clear(1);
      const y = H * 0.5;
      cx.strokeStyle = rgba(acc, 0.14); cx.lineWidth = 1.4;
      cx.beginPath(); cx.moveTo(bondNodes[0]?.x ?? 0, y); cx.lineTo(bondNodes[bondNodes.length - 1]?.x ?? W, y); cx.stroke();
      for (let i = 0; i < bondNodes.length; i++) {
        const n = bondNodes[i];
        const lit = live ? Math.max(0, Math.min(1, (Date.now() / 1000 - i * 0.9) % (bondNodes.length * 0.9 + 2))) : 0.5;
        const on = lit < 1;
        cx.beginPath(); cx.arc(n.x, y, on ? 4 : 2.6, 0, Math.PI * 2);
        cx.fillStyle = on ? rgba(accH, 0.9) : rgba(acc, 0.3);
        cx.fill();
        if (on) { cx.beginPath(); cx.arc(n.x, y, 9, 0, Math.PI * 2); cx.strokeStyle = rgba(accH, 0.3); cx.lineWidth = 1; cx.stroke(); }
      }
      // a slow drip falling from the line (patience, time passing)
      if (live) {
        bondDrip += dt * 0.05;
        const dx = W * 0.5 + Math.sin(bondDrip * 0.2) * W * 0.3;
        const dy = y + ((bondDrip * 14) % (H * 0.4));
        cx.beginPath(); cx.arc(dx, dy, 1.8, 0, Math.PI * 2); cx.fillStyle = rgba(accH, 0.5); cx.fill();
      }
    };

    // ---------- RINGER (B2 case 10 · a cloned voice, two waveforms meeting) ----------
    const drawRinger = (dt: number, live: boolean) => {
      clear(1);
      const cxp = center.x, cyp = center.y;
      // expanding ring pulses, like an incoming call, blooming from the margin
      for (const p of ringerPulses) {
        const r = (p.t % 1) * Math.min(W, H) * 0.55;
        const a = Math.max(0, 1 - (p.t % 1));
        cx.beginPath(); cx.arc(cxp, cyp, r, 0, Math.PI * 2); cx.strokeStyle = rgba(accH, a * 0.42); cx.lineWidth = 1.6; cx.stroke();
        if (live) p.t += p.sp * dt * 0.001;
      }
      cx.beginPath(); cx.arc(cxp, cyp, 3, 0, Math.PI * 2); cx.fillStyle = rgba(accH, 0.7); cx.fill();
      // two waveform ribbons at mid-height, one real one cloned, drifting out
      // of phase then back in sync — the whole width, so it reads in the open
      // margins either side of the phone even though the ring sits off to one.
      const t = live ? Date.now() * 0.0015 : 0;
      const wy = H * 0.5;
      for (let w2 = 0; w2 < 2; w2++) {
        cx.beginPath();
        const amp = 22, phase = w2 === 0 ? t : t + Math.sin(t * 0.3) * 1.4; // the clone drifts off-phase, then converges
        for (let x = 0; x <= W; x += 8) {
          const yy = wy + Math.sin(x * 0.02 + phase) * amp * (0.6 + 0.4 * Math.sin(x * 0.004 + t));
          if (x === 0) cx.moveTo(x, yy); else cx.lineTo(x, yy);
        }
        cx.strokeStyle = rgba(w2 === 0 ? acc : accH, 0.3); cx.lineWidth = 1.4; cx.stroke();
      }
    };

    // ---------- VAULT (B3 case 11 · tumblers turning into place) ----------
    const drawVault = (dt: number, live: boolean) => {
      clear(1);
      for (const t of tumblers) {
        cx.beginPath(); cx.arc(t.cx, t.cy, t.r, 0, Math.PI * 2); cx.strokeStyle = rgba(acc, 0.14); cx.lineWidth = 1.2; cx.stroke();
        for (let i = 0; i < t.ticks; i++) {
          const a = t.ang + (i / t.ticks) * Math.PI * 2;
          const x1 = t.cx + Math.cos(a) * (t.r - 6), y1 = t.cy + Math.sin(a) * (t.r - 6);
          const x2 = t.cx + Math.cos(a) * (t.r + 6), y2 = t.cy + Math.sin(a) * (t.r + 6);
          cx.beginPath(); cx.moveTo(x1, y1); cx.lineTo(x2, y2);
          cx.strokeStyle = rgba(i === 0 ? accH : acc, i === 0 ? 0.8 : 0.22); cx.lineWidth = i === 0 ? 2 : 1; cx.stroke();
        }
        if (live) t.ang += t.sp * dt;
      }
      cx.beginPath(); cx.arc(tumblers[0]?.cx ?? W / 2, tumblers[0]?.cy ?? H / 2, 4, 0, Math.PI * 2);
      cx.fillStyle = rgba(accH, 0.7); cx.fill();
    };

    // ---------- CIPHER (B3 case 12 · ciphertext that briefly resolves) ----------
    const drawCipher = (dt: number, live: boolean) => {
      clear(live ? 0.22 : 1);
      cx.font = "13px monospace"; cx.textAlign = "left"; cx.textBaseline = "top";
      const lh = 16;
      for (const c of cipherCols) {
        for (let k = 0; k < c.chars.length; k++) {
          const yy = c.y + k * lh;
          if (yy < -lh || yy > H) continue;
          const inResolve = c.resolve >= 0 && k >= c.resolve && k < c.resolve + 4;
          cx.fillStyle = inResolve ? rgba(accH, 0.75) : rgba(acc, 0.22);
          cx.fillText(inResolve ? PLAIN_CHARS[Math.floor(Math.random() * PLAIN_CHARS.length) % PLAIN_CHARS.length] : c.chars[k], c.x, yy);
        }
        if (live) {
          c.y += c.sp * dt * 0.1;
          if (Math.random() > 0.92) c.chars[Math.floor(Math.random() * c.chars.length)] = CIPHER_CHARS[Math.floor(Math.random() * CIPHER_CHARS.length)];
          if (c.y > H) { c.y = -c.chars.length * lh - R(0, H * 0.4); c.resolve = Math.random() > 0.7 ? Math.floor(R(0, 6)) : -1; }
        }
      }
    };

    // ---------- BACKDOOR (B3 case 13 · a wall of code, one cell glitches open) ----------
    const drawBackdoor = (dt: number, live: boolean) => {
      clear(1);
      for (let i = 0; i < wallCells.length; i++) {
        const c = wallCells[i];
        const isDoor = i === doorCell;
        const flicker = isDoor ? 0.5 + 0.5 * Math.sin(doorClock * 0.012) : 1;
        cx.fillStyle = isDoor ? rgba(accH, 0.5 * flicker) : rgba(acc, 0.05);
        cx.fillRect(c.x, c.y, c.s, c.s);
        if (isDoor) { cx.strokeStyle = rgba(accH, 0.6 * flicker); cx.lineWidth = 1.2; cx.strokeRect(c.x - 1, c.y - 1, c.s + 2, c.s + 2); }
      }
      if (live) { doorClock += dt; if (Math.random() > 0.995) doorCell = Math.floor(Math.random() * Math.max(1, wallCells.length)); }
    };

    // ---------- INSTALL (B3 case 14 · permissions cascading, never finishes) ----------
    const drawInstall = (dt: number, live: boolean) => {
      clear(1);
      for (const g of permGlyphs) {
        cx.strokeStyle = rgba(acc, 0.22); cx.lineWidth = 1.3;
        if (g.shape === 0) { cx.strokeRect(g.x - 5, g.y - 6, 10, 12); cx.beginPath(); cx.moveTo(g.x - 5, g.y - 2); cx.lineTo(g.x + 5, g.y - 2); cx.stroke(); }
        else if (g.shape === 1) { cx.beginPath(); cx.moveTo(g.x, g.y - 7); cx.lineTo(g.x + 6, g.y - 3); cx.lineTo(g.x + 6, g.y + 4); cx.lineTo(g.x, g.y + 7); cx.lineTo(g.x - 6, g.y + 4); cx.lineTo(g.x - 6, g.y - 3); cx.closePath(); cx.stroke(); }
        else { cx.beginPath(); cx.moveTo(g.x - 4, g.y); cx.lineTo(g.x - 1, g.y + 4); cx.lineTo(g.x + 5, g.y - 5); cx.stroke(); }
        if (live) { g.y += g.sp * dt * 0.1; if (g.y > H + 10) g.y = -10; }
      }
      // a progress bar along the bottom that fills, then resets — never finishes
      if (live) installBar = (installBar + dt * 0.00006) % 1;
      const bw = W * 0.7, bx = W * 0.15, by = H - 26;
      cx.strokeStyle = rgba(acc, 0.18); cx.lineWidth = 1; cx.strokeRect(bx, by, bw, 6);
      cx.fillStyle = rgba(accH, 0.35); cx.fillRect(bx, by, bw * installBar, 6);
    };

    // ---------- BROWSER (B3 case 15 · two near-identical windows) ----------
    const drawBrowser = (dt: number, live: boolean) => {
      clear(1);
      if (live) urlGlitch += dt;
      const draw = (ox: number, oy: number, a: number, urlLen: number) => {
        const w2 = W * 0.34, h2 = H * 0.26;
        cx.strokeStyle = rgba(acc, a); cx.lineWidth = 1.3;
        cx.strokeRect(ox, oy, w2, h2);
        cx.fillStyle = rgba(acc, a * 0.6); cx.fillRect(ox, oy, w2, 18);
        cx.strokeStyle = rgba(accH, a * 1.3); cx.strokeRect(ox + 8, oy + 5, urlLen, 8);
      };
      const glitch = Math.sin(urlGlitch * 0.002) > 0.7;
      draw(W * 0.08, H * 0.14, 0.16, 90);
      draw(W * 0.56, H * 0.56, 0.16, glitch ? 94 : 86); // the fake's URL is a hair off, and it swims
    };

    // ---------- HARVEST (B4 case 16 · your data, drifting to a buyer) ----------
    const drawHarvest = (dt: number, live: boolean) => {
      clear(1);
      const cxp = harvestCenter.x, cyp = harvestCenter.y;
      // the collector: a small database-stack icon at centre
      cx.strokeStyle = rgba(accH, 0.4); cx.lineWidth = 1.3;
      for (let i = 0; i < 3; i++) { cx.beginPath(); cx.ellipse(cxp, cyp - 8 + i * 7, 16, 5, 0, 0, Math.PI * 2); cx.stroke(); }
      for (const t of dataTags) {
        const dx = cxp - t.x, dy = cyp - t.y, dist = Math.hypot(dx, dy) || 1;
        cx.fillStyle = rgba(pal[t.shape % pal.length], 0.4);
        if (t.shape === 0) cx.fillRect(t.x - 4, t.y - 3, 8, 6);
        else { cx.beginPath(); cx.arc(t.x, t.y, 3, 0, Math.PI * 2); cx.fill(); }
        // a faint thread toward the collector
        cx.strokeStyle = rgba(acc, Math.max(0, 0.14 - dist / 4000)); cx.lineWidth = 0.8;
        cx.beginPath(); cx.moveTo(t.x, t.y); cx.lineTo(cxp, cyp); cx.stroke();
        if (live) {
          t.vx += (dx / dist) * 0.0025 * dt; t.vy += (dy / dist) * 0.0025 * dt;
          t.x += t.vx; t.y += t.vy;
          if (dist < 20) { t.x = R(0, W); t.y = R(0, H); t.vx = 0; t.vy = 0; }
        }
      }
    };

    // ---------- DEEPFAKE (B4 case 17 · a face that glitches between two states) ----------
    const drawDeepfake = (dt: number, live: boolean) => {
      clear(1);
      if (live) faceGlitch += dt;
      const glitching = Math.sin(faceGlitch * 0.0022) > 0.75;
      const fx = faceCenter.x + (glitching ? R(-4, 4) : 0), fy = faceCenter.y;
      cx.strokeStyle = rgba(glitching ? accH : acc, glitching ? 0.5 : 0.22); cx.lineWidth = 1.3;
      cx.beginPath(); cx.ellipse(fx, fy, 60, 78, 0, 0, Math.PI * 2); cx.stroke();
      // eyes + mouth as a wireframe "key points" mesh
      for (const [ex, ey] of [[-22, -14], [22, -14], [0, 10], [-18, 30], [18, 30]] as [number, number][]) {
        cx.beginPath(); cx.arc(fx + ex, fy + ey, 2.4, 0, Math.PI * 2); cx.fillStyle = rgba(accH, glitching ? 0.7 : 0.3); cx.fill();
      }
      // scanline sweep
      if (live) {
        const sy = (faceGlitch * 0.08) % (H + 60) - 30;
        const g = cx.createLinearGradient(0, sy - 20, 0, sy + 20);
        g.addColorStop(0, rgba(accH, 0)); g.addColorStop(0.5, rgba(accH, 0.08)); g.addColorStop(1, rgba(accH, 0));
        cx.fillStyle = g; cx.fillRect(0, sy - 20, W, 40);
      }
    };

    // ---------- CROSSROADS (B4 case 18 · the fork, and the choice) ----------
    const drawCrossroads = (dt: number, live: boolean) => {
      clear(1);
      if (live) { forkClock += dt; if (Math.random() > 0.996) forkPick = forkPick ? 0 : 1; }
      const ox = W * 0.5, oy = H * 0.72;
      cx.strokeStyle = rgba(acc, 0.3); cx.lineWidth = 1.6;
      cx.beginPath(); cx.moveTo(ox, H + 20); cx.lineTo(ox, oy); cx.stroke();
      const ends: [number, number][] = [[W * 0.18, H * 0.1], [W * 0.82, H * 0.1]];
      for (let i = 0; i < 2; i++) {
        const picked = i === forkPick;
        const pulse = picked ? 0.55 + 0.25 * Math.sin(forkClock * 0.004) : 0.14;
        cx.strokeStyle = rgba(picked ? accH : acc, pulse); cx.lineWidth = picked ? 2 : 1.2;
        cx.beginPath(); cx.moveTo(ox, oy); cx.lineTo(ends[i][0], ends[i][1]); cx.stroke();
      }
    };

    // ---------- CONVERGENCE (B4 case 19 · every trick, all at once) ----------
    const drawConvergence = (dt: number, live: boolean) => {
      clear(live ? 0.3 : 1);
      const cxp = convCenter.x, cyp = convCenter.y;
      for (const s of convStreaks) {
        const x1 = cxp + Math.cos(s.ang) * s.d, y1 = cyp + Math.sin(s.ang) * s.d;
        const x2 = cxp + Math.cos(s.ang) * (s.d - 36), y2 = cyp + Math.sin(s.ang) * (s.d - 36);
        const a = Math.max(0, Math.min(0.6, 1 - s.d / (Math.max(W, H) * 0.65)));
        cx.strokeStyle = rgba(s.col, a); cx.lineWidth = 1.4;
        cx.beginPath(); cx.moveTo(x1, y1); cx.lineTo(x2, y2); cx.stroke();
        if (live) { s.d -= s.sp * dt * 0.12; if (s.d < 8) { s.ang = R(0, Math.PI * 2); s.d = R(0.6, 1) * Math.max(W, H) * 0.65; } }
      }
      const pulse = live ? 0.6 + Math.sin(Date.now() * 0.005) * 0.4 : 0.8;
      cx.fillStyle = rgba(accH, pulse); cx.beginPath(); cx.arc(cxp, cyp, 3.5, 0, Math.PI * 2); cx.fill();
    };

    // ---------- UNMASK (B4 case 20 · the mastermind resolves into focus) ----------
    const drawUnmask = (dt: number, live: boolean) => {
      clear(1);
      if (live) unmaskClock += dt;
      const sharp = Math.max(0, Math.sin(unmaskClock * 0.0009)); // breathes in and out of focus
      for (const b of unmaskBlocks) {
        const lit = b.on ? sharp > 0.3 : sharp <= 0.3;
        cx.fillStyle = lit ? rgba(accH, 0.35 + sharp * 0.3) : rgba(acc, 0.06);
        cx.fillRect(b.x, b.y, b.s, b.s);
      }
      // converging lines from the four corners, as if every earlier case's
      // evidence is pointing here (the glyph itself sits off-centre; aim at it)
      const cxp = W * 0.18, cyp = H * 0.5;
      for (const [cx0, cy0] of [[0, 0], [W, 0], [0, H], [W, H]] as [number, number][]) {
        cx.strokeStyle = rgba(acc, 0.05); cx.lineWidth = 1;
        cx.beginPath(); cx.moveTo(cx0, cy0); cx.lineTo(cxp, cyp); cx.stroke();
      }
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
      else if (variant === "ripple") drawRipple(dt, live);
      else if (variant === "loop") drawLoop(dt, live);
      else if (variant === "glint") drawGlint(dt, live);
      else if (variant === "bond") drawBond(dt, live);
      else if (variant === "ringer") drawRinger(dt, live);
      else if (variant === "vault") drawVault(dt, live);
      else if (variant === "cipher") drawCipher(dt, live);
      else if (variant === "backdoor") drawBackdoor(dt, live);
      else if (variant === "install") drawInstall(dt, live);
      else if (variant === "browser") drawBrowser(dt, live);
      else if (variant === "harvest") drawHarvest(dt, live);
      else if (variant === "deepfake") drawDeepfake(dt, live);
      else if (variant === "crossroads") drawCrossroads(dt, live);
      else if (variant === "convergence") drawConvergence(dt, live);
      else if (variant === "unmask") drawUnmask(dt, live);
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
