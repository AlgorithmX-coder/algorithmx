"use client";

/* Per-module animated backdrop for the Cyber Ops range. Each module gets its
 * own themed, full-field canvas world (owner-approved concepts) so a learner
 * always knows which engagement they're in; `theme="aurora"` is the calm
 * orientation backdrop. Fixed + pointer-events:none + aria-hidden so it never
 * interferes; DPR-capped; pauses when the tab is hidden; renders one still
 * frame under prefers-reduced-motion. A centre-weighted scrim keeps the lesson
 * column readable while the theme fills the margins. */

import { useEffect, useRef } from "react";

const BG = "#0A0B0F";
const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
const TAU = Math.PI * 2;
const MONO = "'IBM Plex Mono', ui-monospace, Menlo, Consolas, monospace";
const DISP = "'Chakra Petch', ui-sans-serif, system-ui, sans-serif";

type Ctx = CanvasRenderingContext2D;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type State = any;
type Draw = (x: Ctx, w: number, h: number, t: number, C: string[], S: State) => void;
type Theme = { C: string[]; draw: Draw };

/* ---- the sixteen module worlds (full-field) ---- */
const THEMES: Record<number, Theme> = {
  1: { C: ["#8B7BFF", "#B9ADFF", "#5FE6FF"], draw: (x, w, h, t, C) => {
    x.strokeStyle = rgba(C[0], 0.08); x.lineWidth = 1; const g = 42;
    for (let i = g; i < w; i += g) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); }
    for (let j = g; j < h; j += g) { x.beginPath(); x.moveTo(0, j); x.lineTo(w, j); x.stroke(); }
    const bx = (Math.sin(t * 0.5) * 0.5 + 0.5) * w; const grad = x.createLinearGradient(bx - 90, 0, bx + 90, 0);
    grad.addColorStop(0, rgba(C[2], 0)); grad.addColorStop(0.5, rgba(C[2], 0.14)); grad.addColorStop(1, rgba(C[2], 0));
    x.fillStyle = grad; x.fillRect(bx - 90, 0, 180, h);
  } },
  2: { C: ["#5FE6FF", "#2DD4BF", "#8B7BFF"], draw: (x, w, h, t, C, S) => {
    if (!S.n) { S.n = []; const N = Math.round((w * h) / 46000); for (let i = 0; i < N; i++) S.n.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 12, vy: (Math.random() - 0.5) * 12, p: Math.random() * TAU }); }
    S.n.forEach((n: State) => { n.x += n.vx * 0.016; n.y += n.vy * 0.016; if (n.x < 8 || n.x > w - 8) n.vx *= -1; if (n.y < 8 || n.y > h - 8) n.vy *= -1; });
    for (let i = 0; i < S.n.length; i++) for (let j = i + 1; j < S.n.length; j++) { const a = S.n[i], b = S.n[j]; const d = Math.hypot(a.x - b.x, a.y - b.y); if (d < 150) { x.strokeStyle = rgba(C[0], (1 - d / 150) * 0.32); x.lineWidth = 1; x.beginPath(); x.moveTo(a.x, a.y); x.lineTo(b.x, b.y); x.stroke(); } }
    S.n.forEach((n: State) => { const r = 2 + 1.4 * (0.5 + 0.5 * Math.sin(t * 2 + n.p)); x.fillStyle = rgba(C[2], 0.8); x.shadowColor = C[0]; x.shadowBlur = 10; x.beginPath(); x.arc(n.x, n.y, r, 0, TAU); x.fill(); x.shadowBlur = 0; });
  } },
  3: { C: ["#8B7BFF", "#5FE6FF", "#B9ADFF"], draw: (x, w, h, t, C, S) => {
    const lanes = Math.max(4, Math.round(h / 90));
    if (!S.c || S.lanes !== lanes) { S.lanes = lanes; S.c = []; const L = ["GET", "200 OK", "POST", "301", "PUT", "403", "HEAD", "204", "PATCH", "401"]; for (let i = 0; i < lanes * 2; i++) S.c.push({ x: Math.random() * w, lane: i % lanes, dir: i % 2 ? 1 : -1, txt: L[i % L.length], sp: 30 + Math.random() * 40 }); }
    x.font = `600 12px ${MONO}`; x.textBaseline = "middle";
    S.c.forEach((c: State) => { c.x += c.dir * c.sp * 0.016; if (c.x > w + 50) c.x = -50; if (c.x < -50) c.x = w + 50; const y = h * ((c.lane + 0.5) / lanes); const col = c.dir > 0 ? C[0] : C[1]; const tw = x.measureText(c.txt).width + 18; x.fillStyle = rgba(col, 0.1); x.beginPath(); x.roundRect(c.x - tw / 2, y - 10, tw, 20, 7); x.fill(); x.strokeStyle = rgba(col, 0.4); x.lineWidth = 1; x.stroke(); x.fillStyle = rgba(c.dir > 0 ? C[2] : C[1], 0.85); x.textAlign = "center"; x.fillText(c.txt, c.x, y); });
    x.textAlign = "left";
  } },
  4: { C: ["#E8A33D", "#F6C36B", "#8B7BFF"], draw: (x, w, h, t, C, S) => {
    x.save(); x.translate(w * 0.5, h * 0.5); x.rotate(t * 0.4); x.strokeStyle = rgba(C[0], 0.09); x.lineWidth = 3; x.beginPath(); x.arc(0, 0, Math.min(w, h) * 0.34, 0, TAU * 0.8); x.stroke(); x.restore();
    if (!S.k) { S.k = []; const N = Math.round(w / 90); for (let i = 0; i < N; i++) S.k.push({ x: Math.random() * w, y: Math.random() * h, vy: 16 + Math.random() * 26, s: 0.8 + Math.random() * 0.9, r: Math.random() * TAU }); }
    S.k.forEach((k: State) => { k.y += k.vy * 0.016; k.r += 0.02; if (k.y > h + 16) { k.y = -16; k.x = Math.random() * w; } x.save(); x.translate(k.x, k.y); x.rotate(k.r); x.scale(k.s, k.s); x.strokeStyle = rgba(C[1], 0.7); x.lineWidth = 1.6; x.beginPath(); x.arc(0, -6, 3.6, 0, TAU); x.stroke(); x.beginPath(); x.moveTo(0, -2.4); x.lineTo(0, 9); x.moveTo(0, 5); x.lineTo(3.4, 5); x.moveTo(0, 9); x.lineTo(3.4, 9); x.stroke(); x.restore(); });
  } },
  5: { C: ["#4ADE80", "#9CF6B8", "#2DD4BF"], draw: (x, w, h, t, C, S) => {
    const fs = 14; x.font = `600 ${fs}px ${MONO}`; x.textBaseline = "top";
    const cols = Math.floor(w / fs);
    if (!S.col || S.cols !== cols) { S.cols = cols; S.col = []; for (let i = 0; i < cols; i++) S.col.push({ y: Math.random() * -h, sp: 40 + Math.random() * 90 }); }
    const ch = "01<>'=-UNIONSELECT*";
    S.col.forEach((c: State, i: number) => { c.y += c.sp * 0.016; if (c.y > h + fs) { c.y = Math.random() * -h * 0.4; c.sp = 40 + Math.random() * 90; } const cx = i * fs; x.fillStyle = rgba(C[1], 0.85); x.fillText(ch[(i + ((t * 4) | 0)) % ch.length], cx, c.y); x.fillStyle = rgba(C[0], 0.4); for (let k = 1; k < 6; k++) x.fillText(ch[(i * 3 + k + ((t * 4) | 0)) % ch.length], cx, c.y - k * fs); });
  } },
  6: { C: ["#FF5BD0", "#FF9BE3", "#8B7BFF"], draw: (x, w, h, t, C, S) => {
    if (!S.it) { S.it = []; const L = ["<script>", "alert()", "onerror=", "</>", "<img>", "eval(", "<svg>", "onload="]; const N = Math.round(w / 130); for (let i = 0; i < N; i++) S.it.push({ x: Math.random() * w, y: Math.random() * h, vy: -(10 + Math.random() * 14), txt: L[i % L.length] }); S.pops = []; S.last = 0; }
    x.font = `600 13px ${MONO}`; x.textBaseline = "middle"; x.textAlign = "center";
    S.it.forEach((o: State) => { o.y += o.vy * 0.016; if (o.y < -10) { o.y = h + 10; o.x = Math.random() * w; } x.fillStyle = rgba(C[1], 0.7); x.fillText(o.txt, o.x, o.y); });
    if (t - S.last > 0.8) { S.last = t; S.pops.push({ x: Math.random() * w, y: Math.random() * h, r: 2, a: 1 }); }
    S.pops.forEach((p: State) => { p.r += 1.4; p.a -= 0.01; x.strokeStyle = rgba(C[0], Math.max(0, p.a)); x.lineWidth = 2; x.beginPath(); x.arc(p.x, p.y, p.r, 0, TAU); x.stroke(); });
    S.pops = S.pops.filter((p: State) => p.a > 0); x.textAlign = "left";
  } },
  7: { C: ["#4ADE80", "#FF5B62", "#8B7BFF"], draw: (x, w, h, t, C, S) => {
    const cell = 76, gap = 10; const cols = Math.ceil(w / cell), rows = Math.ceil(h / cell);
    if (!S.c || S.cols !== cols || S.rows !== rows) { S.cols = cols; S.rows = rows; S.c = []; for (let i = 0; i < cols * rows; i++) S.c.push({ open: Math.random() < 0.4, nt: 0.5 + Math.random() * 4 }); }
    const cw = (w - gap) / cols - gap, ch = (h - gap) / rows - gap;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const cObj = S.c[r * cols + c]; if (t > cObj.nt) { cObj.open = !cObj.open; cObj.nt = t + 1.2 + Math.random() * 4; } const px = gap + c * (cw + gap), py = gap + r * (ch + gap); const col = cObj.open ? C[0] : C[1]; x.fillStyle = rgba(col, 0.06); x.strokeStyle = rgba(col, 0.32); x.lineWidth = 1; x.beginPath(); x.roundRect(px, py, cw, ch, 7); x.fill(); x.stroke(); x.strokeStyle = rgba(col, 0.6); x.lineWidth = 2; const mx = px + cw / 2, my = py + ch / 2; if (cObj.open) { x.beginPath(); x.arc(mx, my - 3, 4, Math.PI * 0.1, Math.PI * 1.1); x.stroke(); x.fillStyle = rgba(col, 0.6); x.fillRect(mx - 4, my, 8, 7); } else { x.beginPath(); x.arc(mx, my - 4, 4, Math.PI, TAU); x.stroke(); x.fillStyle = rgba(col, 0.6); x.fillRect(mx - 4, my - 1, 8, 8); } }
  } },
  8: { C: ["#2DD4BF", "#7FF0E3", "#5FE6FF"], draw: (x, w, h, t, C, S) => {
    const fs = 15; x.font = `600 ${fs}px ${MONO}`; x.textBaseline = "top";
    const cols = Math.floor(w / (fs * 1.4));
    if (!S.col || S.cols !== cols) { S.cols = cols; S.col = []; for (let i = 0; i < cols; i++) S.col.push({ y: Math.random() * -h, sp: 24 + Math.random() * 50, off: Math.floor(Math.random() * 64) }); }
    const b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    S.col.forEach((c: State, i: number) => { c.y += c.sp * 0.016; if (c.y > h + fs) { c.y = Math.random() * -h * 0.5; } const cx = i * fs * 1.4 + fs * 0.3; for (let k = 0; k < 5; k++) { const idx = (c.off + i * 5 + k + ((t * 3) | 0)) % 64; x.fillStyle = rgba(k === 0 ? C[1] : C[0], 0.55 - k * 0.08); x.fillText(b64[idx], cx, c.y + k * fs); } });
  } },
  9: { C: ["#A78BFA", "#C9B8FF", "#5FE6FF"], draw: (x, w, h, t, C, S) => {
    x.font = `500 12px ${MONO}`; x.textBaseline = "top"; const hx = "0123456789abcdef"; const colw = 52, cols = Math.ceil(w / colw);
    if (!S.c || S.cols !== cols) { S.cols = cols; S.c = []; for (let i = 0; i < cols; i++) S.c.push({ y: Math.random() * -h, sp: 30 + Math.random() * 70, hit: Math.random() < 0.16 }); }
    S.c.forEach((c: State, i: number) => { c.y += c.sp * 0.016; if (c.y > h + 10) { c.y = Math.random() * -h * 0.5; c.hit = Math.random() < 0.16; } let s = ""; for (let k = 0; k < 10; k++) s += hx[(i * 7 + k + ((t * 3) | 0)) % 16]; x.fillStyle = c.hit ? rgba(C[2], 0.9) : rgba(C[0], 0.45); x.fillText(s, i * colw + 4, c.y); if (c.hit) { x.fillStyle = rgba(C[1], 0.35); x.fillText(s, i * colw + 4, c.y - 16); } });
  } },
  10: { C: ["#39FF88", "#9CF6B8", "#2DD4BF"], draw: (x, w, h, t, C, S) => {
    const cx = w / 2, cy = h / 2, R = Math.hypot(w, h) * 0.5;
    x.strokeStyle = rgba(C[0], 0.14); x.lineWidth = 1; for (let r = 1; r <= 4; r++) { x.beginPath(); x.arc(cx, cy, (R * r) / 4, 0, TAU); x.stroke(); }
    const ang = t * 1.1; const g = x.createLinearGradient(cx, cy, cx + Math.cos(ang) * R, cy + Math.sin(ang) * R); g.addColorStop(0, rgba(C[0], 0.28)); g.addColorStop(1, rgba(C[0], 0)); x.fillStyle = g; x.beginPath(); x.moveTo(cx, cy); x.arc(cx, cy, R, ang - 0.5, ang); x.closePath(); x.fill();
    if (!S.b) { S.b = []; for (let i = 0; i < 16; i++) S.b.push({ a: Math.random() * TAU, d: (0.2 + Math.random() * 0.8) * R, lit: 0 }); }
    S.b.forEach((b: State) => { const da = ((ang - b.a) % TAU + TAU) % TAU; if (da < 0.3) b.lit = 1; b.lit *= 0.975; const bx = cx + Math.cos(b.a) * b.d, by = cy + Math.sin(b.a) * b.d; x.fillStyle = rgba(C[1], 0.2 + b.lit * 0.7); x.beginPath(); x.arc(bx, by, 2.4 + b.lit * 2.5, 0, TAU); x.fill(); });
  } },
  11: { C: ["#E8A33D", "#F6C36B", "#8B7BFF"], draw: (x, w, h, t, C, S) => {
    x.font = `400 11px ${MONO}`;
    if (!S.logs) { S.logs = []; const msgs = ["auth.log  session opened", "sysmon  proc created cmd.exe", "net  outbound 10.0.0.4:4444", "file  /tmp/.x written", "auth.log  sudo root"]; for (let i = 0; i < 12; i++) S.logs.push({ x: Math.random() * w, y: Math.random() * h, m: msgs[i % msgs.length] }); }
    S.logs.forEach((l: State) => { x.fillStyle = rgba(C[0], 0.14); x.fillText(l.m, l.x, l.y); });
    const y = h * 0.5; x.strokeStyle = rgba(C[0], 0.28); x.lineWidth = 1.5; x.beginPath(); x.moveTo(0, y); x.lineTo(w, y); x.stroke();
    if (!S.e) { S.e = [0.1, 0.24, 0.38, 0.5, 0.63, 0.77, 0.9].map((p) => ({ p, r: Math.random() * TAU })); }
    S.e.forEach((e: State) => { const ex = w * e.p; x.strokeStyle = rgba(C[0], 0.28); x.beginPath(); x.moveTo(ex, y - 7); x.lineTo(ex, y + 7); x.stroke(); const pulse = 0.5 + 0.5 * Math.sin(t * 2 + e.r); x.fillStyle = rgba(C[1], 0.5 + pulse * 0.5); x.shadowColor = C[0]; x.shadowBlur = 8; x.beginPath(); x.arc(ex, y - 20, 3 + pulse * 1.6, 0, TAU); x.fill(); x.shadowBlur = 0; });
    const ph = (Math.sin(t * 0.4) * 0.5 + 0.5) * w; x.strokeStyle = rgba(C[2], 0.65); x.lineWidth = 1.5; x.beginPath(); x.moveTo(ph, h * 0.2); x.lineTo(ph, h * 0.8); x.stroke();
  } },
  12: { C: ["#FF6B4A", "#FFB199", "#E8A33D"], draw: (x, w, h, t, C, S) => {
    const cx = w / 2, cy = h / 2; const span = Math.hypot(w, h) * 0.5;
    for (let k = 0; k < 3; k++) { const r = ((t * 60) + k * span / 3) % span; x.strokeStyle = rgba(C[0], Math.max(0, 0.32 * (1 - r / span))); x.lineWidth = 2; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.stroke(); }
    x.fillStyle = rgba(C[0], 0.8 + 0.2 * Math.sin(t * 4)); x.shadowColor = C[0]; x.shadowBlur = 16; x.beginPath(); x.arc(cx, cy, 6, 0, TAU); x.fill(); x.shadowBlur = 0;
    const sz = Math.min(w, h) * (0.22 + 0.12 * (0.5 + 0.5 * Math.sin(t * 1.0))); x.strokeStyle = rgba(C[2], 0.5); x.lineWidth = 1.5; x.setLineDash([8, 6]); x.strokeRect(cx - sz, cy - sz, sz * 2, sz * 2); x.setLineDash([]);
  } },
  13: { C: ["#E8A33D", "#FF5B62", "#F6C36B"], draw: (x, w, h, t, C, S) => {
    if (!S.m) { S.m = []; const N = Math.round(w / 110); for (let i = 0; i < N; i++) S.m.push({ x: Math.random() * w, y: Math.random() * h, vy: -(8 + Math.random() * 14), bad: Math.random() < 0.4 }); }
    S.m.forEach((m: State) => { m.y += m.vy * 0.016; if (m.y < -14) { m.y = h + 14; m.x = Math.random() * w; m.bad = Math.random() < 0.4; } const col = m.bad ? C[1] : C[0]; x.strokeStyle = rgba(col, 0.6); x.fillStyle = rgba(col, 0.1); x.lineWidth = 1.3; x.beginPath(); x.roundRect(m.x - 12, m.y - 9, 24, 18, 3); x.fill(); x.stroke(); x.beginPath(); x.moveTo(m.x - 12, m.y - 9); x.lineTo(m.x, m.y + 1); x.lineTo(m.x + 12, m.y - 9); x.stroke(); if (m.bad) { x.fillStyle = rgba(C[1], 0.9); x.beginPath(); x.moveTo(m.x + 10, m.y - 9); x.lineTo(m.x + 16, m.y - 7); x.lineTo(m.x + 10, m.y - 4); x.closePath(); x.fill(); } });
    const hx = w * 0.5 + Math.sin(t * 0.8) * w * 0.34; x.strokeStyle = rgba(C[2], 0.5); x.lineWidth = 1.4; x.beginPath(); x.moveTo(hx, 0); x.lineTo(hx, h * 0.34); x.arc(hx - 6, h * 0.34, 6, 0, Math.PI, false); x.stroke();
  } },
  14: { C: ["#8B7BFF", "#B9ADFF", "#FF5B62"], draw: (x, w, h, t, C, S) => {
    if (!S.cards) { S.cards = []; const N = Math.round((w * h) / 150000); for (let i = 0; i < N; i++) S.cards.push({ x: Math.random() * w, y: Math.random() * h, vy: -(6 + Math.random() * 10), sev: Math.random() }); }
    S.cards.forEach((c: State) => { c.y += c.vy * 0.016; if (c.y < -70) { c.y = h + 70; c.x = Math.random() * w; } const cw = 120, ch = 66; x.fillStyle = rgba(C[0], 0.05); x.strokeStyle = rgba(C[0], 0.22); x.lineWidth = 1; x.beginPath(); x.roundRect(c.x, c.y, cw, ch, 6); x.fill(); x.stroke(); for (let k = 0; k < 4; k++) { x.fillStyle = rgba(C[1], 0.3); x.fillRect(c.x + 10, c.y + 12 + k * 11, (cw - 20) * (k === 0 ? 0.6 : 0.9 - k * 0.12), 3); } const sevCol = c.sev > 0.66 ? C[2] : c.sev > 0.33 ? C[2] : C[1]; x.fillStyle = rgba(sevCol, 0.5); x.fillRect(c.x + cw - 7, c.y + 6, 3, ch - 12); });
  } },
  15: { C: ["#8B7BFF", "#5FE6FF", "#E8A33D"], draw: (x, w, h, t, C, S) => {
    const bands = [0.32, 0.5, 0.68]; const N = 6;
    bands.forEach((by, bi) => { const pts: { x: number; y: number }[] = []; for (let i = 0; i < N; i++) pts.push({ x: w * (0.04 + i * (0.92 / (N - 1))), y: h * by + Math.sin(i * 1.2 + bi * 2 + t * 0.3) * h * 0.05 });
      for (let i = 0; i < N - 1; i++) { x.strokeStyle = rgba(C[0], 0.3); x.lineWidth = 2; x.beginPath(); x.moveTo(pts[i].x, pts[i].y); x.lineTo(pts[i + 1].x, pts[i + 1].y); x.stroke(); }
      const head = ((t * 0.5 + bi * 1.3) % N); for (let i = 0; i < N; i++) { const on = i <= head; const col = i / (N - 1) < 0.5 ? C[0] : C[2]; const pulse = Math.abs(i - head) < 0.5 ? 1 : 0; x.fillStyle = on ? rgba(col, 0.85) : rgba(C[0], 0.18); x.shadowColor = col; x.shadowBlur = pulse ? 16 : 5; x.beginPath(); x.arc(pts[i].x, pts[i].y, 4.5 + pulse * 3, 0, TAU); x.fill(); x.shadowBlur = 0; } });
  } },
  16: { C: ["#E8A33D", "#F6C36B", "#8B7BFF"], draw: (x, w, h, t, C, S) => {
    const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.42;
    if (!S.s) { S.s = []; for (let i = 0; i < 16; i++) S.s.push({ a: (i / 16) * TAU - Math.PI / 2, r: R * (0.55 + ((i % 3) * 0.22)) }); }
    const prog = (Math.sin(t * 0.35) * 0.5 + 0.5) * 16;
    S.s.forEach((s: State, i: number) => { const px = cx + Math.cos(s.a) * s.r, py = cy + Math.sin(s.a) * s.r; if (i < prog) { x.strokeStyle = rgba(C[0], 0.22); x.lineWidth = 1; x.beginPath(); x.moveTo(px, py); x.lineTo(cx, cy); x.stroke(); } x.fillStyle = i < prog ? rgba(C[1], 0.85) : rgba(C[2], 0.22); x.beginPath(); x.arc(px, py, 2.6, 0, TAU); x.fill(); });
    const g = x.createRadialGradient(cx, cy, 0, cx, cy, R); g.addColorStop(0, rgba(C[0], 0.16 + 0.08 * Math.sin(t * 2))); g.addColorStop(1, rgba(C[0], 0)); x.fillStyle = g; x.beginPath(); x.arc(cx, cy, R, 0, TAU); x.fill();
  } },
  17: { C: ["#B15BFF", "#D6A8FF", "#5FE6FF"], draw: (x, w, h, t, C, S) => {
    if (!S.it) { S.it = []; const L = ["ignore above", "system:", "you are now", "jailbreak", "role:", "}}}", "<|end|>", "reveal the", "new rules:", "DAN"]; const N = Math.round(w / 150); for (let i = 0; i < N; i++) S.it.push({ x: Math.random() * w, y: Math.random() * h, vy: -(9 + Math.random() * 13), txt: L[i % L.length], ph: Math.random() * TAU }); }
    x.font = `600 13px ${MONO}`; x.textBaseline = "middle"; x.textAlign = "center";
    S.it.forEach((o: State) => { o.y += o.vy * 0.016; if (o.y < -14) { o.y = h + 14; o.x = Math.random() * w; } const a = 0.5 + 0.3 * Math.sin(t * 1.5 + o.ph); x.fillStyle = rgba(C[1], a * 0.78); x.fillText(o.txt, o.x, o.y); });
    const car = (Math.sin(t * 3) > 0) ? 1 : 0; x.fillStyle = rgba(C[2], 0.5 * car); x.fillRect(w * 0.5 - 1, h * 0.12, 2, 16);
    x.textAlign = "left";
  } },
};

const AURORA_C = ["#8B7BFF", "#5FE6FF", "#B57BFF", "#2DD4BF"];
function auroraDraw(x: Ctx, w: number, h: number, t: number) {
  x.globalCompositeOperation = "lighter";
  for (let k = 0; k < 4; k++) {
    const amp = h * (0.1 + k * 0.05), cy = h * (0.3 + k * 0.13), freq = 0.005 + k * 0.0014, sp = 0.3 + k * 0.16, ph = k * 1.7;
    x.beginPath(); x.moveTo(0, h);
    for (let px = 0; px <= w; px += 12) { const y = cy + Math.sin(px * freq + t * sp + ph) * amp + Math.sin(px * freq * 2.3 + t * sp * 0.6) * amp * 0.3; x.lineTo(px, y); }
    x.lineTo(w, h); x.closePath(); const g = x.createLinearGradient(0, cy - amp, 0, h); g.addColorStop(0, rgba(AURORA_C[k], 0.16)); g.addColorStop(1, rgba(AURORA_C[k], 0)); x.fillStyle = g; x.fill();
  }
  for (let b = 0; b < 3; b++) { const bx = w * (0.3 + 0.3 * Math.sin(t * 0.2 + b * 2)), by = h * (0.4 + 0.2 * Math.cos(t * 0.17 + b * 2.5)); const g = x.createRadialGradient(bx, by, 0, bx, by, 180); g.addColorStop(0, rgba(AURORA_C[b], 0.12)); g.addColorStop(1, rgba(AURORA_C[b], 0)); x.fillStyle = g; x.fillRect(bx - 180, by - 180, 360, 360); }
  x.globalCompositeOperation = "source-over";
}

export default function ModuleBackdrop({ theme }: { theme: number | "aurora" }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    let reduce = false;
    try { reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { /* noop */ }

    const isAurora = theme === "aurora";
    const th = !isAurora ? (THEMES[theme as number] || THEMES[1]) : null;
    const state: State = {};
    let w = 0, h = 0, last = 0, raf = 0;

    function size_() {
      w = canvas!.clientWidth; h = canvas!.clientHeight;
      canvas!.width = Math.round(w * DPR); canvas!.height = Math.round(h * DPR);
      ctx!.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    function render(t: number) {
      ctx!.clearRect(0, 0, w, h);
      if (isAurora) auroraDraw(ctx!, w, h, t);
      else th!.draw(ctx!, w, h, t, th!.C, state);
    }
    function tick(now: number) {
      if (!last) last = now; const t = (now - last) / 1000 + 0.5;
      render(t);
      raf = requestAnimationFrame(tick);
    }

    size_();
    if (reduce) render(0.8);
    else raf = requestAnimationFrame(tick);

    let rt: ReturnType<typeof setTimeout>;
    const onResize = () => { clearTimeout(rt); rt = setTimeout(size_, 150); };
    window.addEventListener("resize", onResize);
    const onVis = () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else if (!raf && !reduce) { last = 0; raf = requestAnimationFrame(tick); } };
    document.addEventListener("visibilitychange", onVis);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); document.removeEventListener("visibilitychange", onVis); clearTimeout(rt); };
  }, [theme]);

  return (
    <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", background: BG, overflow: "hidden" }}>
      <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />
      {/* readability scrim: darkest through the centre where the lesson column sits, theme stays visible in the margins */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(130% 92% at 50% 30%, rgba(10,11,15,0.85), rgba(10,11,15,0.52) 50%, rgba(10,11,15,0.3))" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(10,11,15,0.45), rgba(10,11,15,0) 14%, rgba(10,11,15,0) 86%, rgba(10,11,15,0.5))" }} />
    </div>
  );
}
