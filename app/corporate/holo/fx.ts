/* Imperative helpers for the Hologram Office page. The generic ones (reveal,
 * countUp, tilt, reduced) are shared with the homepage port; the two below
 * are this page's own: the shield wires that power the course cards and the
 * holographic accent of the headline. */

import { reduced } from "@/app/components/home-holo/fx";

export { reveal, countUp, tilt, reduced } from "@/app/components/home-holo/fx";

/* The Cleared Shield "powering" the course cards along SVG wires. Draws one
 * wire + one travelling pulse per card from the source at the top centre,
 * redraws on resize, and lights a card's wire (and the source, via --c) on
 * hover or focus. Returns a stop function. */
export function powerWires(wrap: HTMLElement, accents: ReadonlyArray<string>, idle = "#5f8dff"): () => void {
  const svg = wrap.querySelector<SVGSVGElement>(".wires");
  const cards = Array.from(wrap.querySelectorAll<HTMLElement>(".ccard"));
  if (!svg || !cards.length) return () => {};
  const pos = (el: HTMLElement) => {
    let x = 0, y = 0;
    for (let n: HTMLElement | null = el; n && n !== wrap; n = n.offsetParent as HTMLElement | null) { x += n.offsetLeft; y += n.offsetTop; }
    return [x, y];
  };
  const draw = () => {
    const w = wrap.clientWidth, h = wrap.clientHeight;
    if (!w) return;
    svg.setAttribute("width", String(w)); svg.setAttribute("height", String(h)); svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    const sx = w / 2, sy = 68;
    svg.innerHTML = cards.map((c, i) => {
      const [cx0, cy0] = pos(c);
      const ex = cx0 + c.offsetWidth / 2, ey = cy0;
      const d = `M${sx} ${sy} L${sx} ${sy + 14} C${sx} ${sy + (ey - sy) * 0.7}, ${ex} ${ey - (ey - sy) * 0.5}, ${ex} ${ey}`;
      return `<path class="wire" data-w="${i}" d="${d}" pathLength="100"/><path class="pulse" data-w="${i}" d="${d}" pathLength="100" style="--i:${i}"/>`;
    }).join("");
  };
  const ro = new ResizeObserver(draw);
  ro.observe(wrap);
  draw();
  const offs: Array<() => void> = [() => ro.disconnect()];
  cards.forEach((c, i) => {
    const on = () => { wrap.style.setProperty("--c", accents[i] || idle); svg.querySelectorAll(`[data-w="${i}"]`).forEach((p) => p.classList.add("hot")); };
    const off = () => { wrap.style.setProperty("--c", idle); svg.querySelectorAll(".hot").forEach((p) => p.classList.remove("hot")); };
    c.addEventListener("pointerenter", on); c.addEventListener("pointerleave", off);
    c.addEventListener("focusin", on); c.addEventListener("focusout", off);
    offs.push(() => { c.removeEventListener("pointerenter", on); c.removeEventListener("pointerleave", off); c.removeEventListener("focusin", on); c.removeEventListener("focusout", off); });
  });
  return () => offs.forEach((f) => f());
}

/* The headline accent ("We have your firm covered.") drawn from coloured
 * points that fly in and settle into the gradient type; idle, a re-scan
 * band sweeps the words every 7 s and briefly re-lights the points. The DOM
 * span keeps the text for assistive tech and search; it fades in as the
 * points settle (data-on), or shows at once under reduced motion. */
export function holoAccent(opts: { canvas: HTMLCanvasElement; hwrap: HTMLElement; h1: HTMLElement; acc: HTMLElement; hero: Element }): () => void {
  const { canvas: cv, hwrap, h1, acc, hero } = opts;
  if (reduced()) { acc.setAttribute("data-still", ""); return () => {}; }
  const ctx = cv.getContext("2d", { alpha: true });
  if (!ctx) { acc.setAttribute("data-still", ""); return () => {}; }
  const PAD = 70;
  const STOPS = [[10, 156, 192], [124, 92, 255], [224, 31, 184]], NB = 22, palette: string[] = [];
  for (let b = 0; b < NB; b++) {
    const t = (b / (NB - 1)) * (STOPS.length - 1), i = Math.min(STOPS.length - 2, Math.floor(t)), f = t - i;
    palette.push(`rgb(${STOPS[i].map((v, k) => Math.round(v + (STOPS[i + 1][k] - v) * f)).join(",")})`);
  }
  const SPK = palette.length; palette.push("#ffffff");
  interface Pt { x: number; y: number; vx: number; vy: number; j: number; s: number; tx: number; ty: number; c: number }
  let W = 0, Hh = 0, pts: Pt[] = [], raf = 0, last = 0, t0 = 0, built = false, vis = true, minX = 0, span = 1;
  const rand = (a: number, b: number) => a + Math.random() * (b - a);
  const wordRects = (node: HTMLElement) => {
    const tn = node.firstChild, out: { w: string; r: DOMRect }[] = [], re = /\S+/g;
    if (!tn || tn.nodeType !== 3) return out;
    const text = tn.textContent || ""; let m: RegExpExecArray | null;
    while ((m = re.exec(text))) { const r = document.createRange(); r.setStart(tn, m.index); r.setEnd(tn, m.index + m[0].length); out.push({ w: m[0], r: r.getBoundingClientRect() }); }
    return out;
  };
  function build() {
    const hr = hwrap.getBoundingClientRect(); W = Math.round(hr.width + PAD * 2); Hh = Math.round(hr.height + PAD * 2);
    const dpr = Math.min(1.5, window.devicePixelRatio || 1); cv.width = W * dpr; cv.height = Hh * dpr; ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    const ox = hr.left - PAD, oy = hr.top - PAD, cs = getComputedStyle(h1);
    const oc = document.createElement("canvas"); oc.width = W; oc.height = Hh; const o = oc.getContext("2d");
    if (!o) return;
    /* the computed font string, never var(): canvas rejects custom properties */
    o.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    if ("letterSpacing" in o) (o as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = cs.letterSpacing;
    o.textBaseline = "alphabetic"; o.fillStyle = "#000";
    const asc = o.measureText("H").fontBoundingBoxAscent || parseFloat(cs.fontSize) * 0.78;
    const wr = wordRects(acc); if (!wr.length) return;
    let maxX = -1e9, minY = 1e9, maxY = -1e9; minX = 1e9;
    wr.forEach(({ w, r }) => { const x = r.left - ox, y = r.top - oy; o.fillText(w, x, y + asc); minX = Math.min(minX, x); maxX = Math.max(maxX, x + r.width); minY = Math.min(minY, y); maxY = Math.max(maxY, y + r.height); });
    const img = o.getImageData(0, 0, W, Hh).data; let step = 3, list: [number, number][] = [];
    for (let tries = 0; tries < 3; tries++) {
      list = [];
      for (let y = 0; y < Hh; y += step) for (let x = 0; x < W; x += step) { if (img[((y | 0) * W + (x | 0)) * 4 + 3] > 110) list.push([x, y]); }
      if (list.length <= 2200) break; step += 0.5;
    }
    const center = { x: (minX + maxX) / 2, y: (minY + maxY) / 2 }; span = Math.max(1, maxX - minX); const prev = pts;
    pts = list.map((t, i) => {
      const p: Pt = prev[i] || { x: 0, y: 0, vx: 0, vy: 0, j: Math.random() * Math.PI * 2, s: Math.random() < 0.22 ? 2.6 : 1.9, tx: 0, ty: 0, c: 0 };
      p.tx = t[0] + rand(-0.4, 0.4); p.ty = t[1] + rand(-0.4, 0.4);
      p.c = Math.max(0, Math.min(NB - 1, Math.round(((t[0] - minX) / span) * (NB - 1))));
      if (!prev[i]) { const a = Math.atan2(p.ty - center.y, p.tx - center.x) + rand(-0.7, 0.7), d = rand(70, 260); p.x = p.tx + Math.cos(a) * d; p.y = p.ty + Math.sin(a) * d - 40; }
      return p;
    });
    built = true;
  }
  function step(now: number) {
    raf = 0; if (!built) { raf = requestAnimationFrame(step); return; }
    const dt = Math.min(32, now - last) / 16.7; last = now; const el = now - t0, t = now * 0.001;
    let aCol = 1, aSpk = 0, jitter = 0.9;
    const ease = 0.075;
    if (el < 1500) { aCol = Math.min(1, el / 320); }
    else if (el < 2100) { const f = (el - 1500) / 600; aCol = 1 - f; aSpk = f * 0.2; jitter = 0.3; acc.setAttribute("data-on", ""); }
    else { aCol = 0; aSpk = 0.2; jitter = 0.22; }
    /* the re-scan: a band sweeps left to right across the accent every 7 s */
    let bx = -1e4; if (el >= 2100) { const sw = (el - 2100) % 7000; if (sw < 1100) bx = minX - 50 + (span + 100) * (sw / 1100); }
    ctx!.clearRect(0, 0, W, Hh);
    const buckets = new Map<number, (Pt | number)[]>();
    const push = (ci: number, p: Pt, a: number, s: number) => { let arr = buckets.get(ci); if (!arr) { arr = []; buckets.set(ci, arr); } arr.push(p, a, s); };
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i]; const tx = p.tx + Math.sin(t * 1.4 + p.j) * jitter, ty = p.ty + Math.cos(t * 1.2 + p.j * 1.7) * jitter;
      const ax = (tx - p.x) * ease, ay = (ty - p.y) * ease; p.vx = (p.vx + ax * dt) * 0.78; p.vy = (p.vy + ay * dt) * 0.78; p.x += p.vx * dt; p.y += p.vy * dt;
      const d = Math.abs(p.tx - bx), near = d < 40 ? 1 - d / 40 : 0;
      const col = Math.max(aCol, near * 0.9); if (col > 0) push(p.c, p, col, p.s + near * 0.8);
      if (aSpk > 0 && p.j < 2.2) push(SPK, p, aSpk * (0.5 + 0.5 * Math.sin(t * 3 + p.j)), 1.6);
    }
    for (const [ci, arr] of buckets) { ctx!.fillStyle = palette[ci]; for (let i = 0; i < arr.length; i += 3) { const p = arr[i] as Pt, s = arr[i + 2] as number; ctx!.globalAlpha = Math.min(1, arr[i + 1] as number); ctx!.fillRect(p.x - s / 2, p.y - s / 2, s, s); } }
    ctx!.globalAlpha = 1;
    if (vis && !document.hidden) raf = requestAnimationFrame(step);
  }
  const start = () => { if (!raf && vis && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(step); } };
  const stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0; };
  const onVis = () => (document.hidden ? stop() : start());
  const io = new IntersectionObserver((en) => { vis = en[0].isIntersecting; if (vis) start(); else stop(); }, { threshold: 0.05 });
  let rt = 0; const onResize = () => { clearTimeout(rt); rt = window.setTimeout(build, 120); };
  let cancelled = false;
  const boot = () => { if (cancelled) return; build(); t0 = performance.now() + 250; start(); io.observe(hero); document.addEventListener("visibilitychange", onVis); addEventListener("resize", onResize); };
  const ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  ready.then(boot, boot);
  return () => { cancelled = true; stop(); io.disconnect(); document.removeEventListener("visibilitychange", onVis); removeEventListener("resize", onResize); clearTimeout(rt); };
}

/* Section spy for the capsule chips: calls cb with the id of the section
 * under the reading line. */
export function spy(ids: ReadonlyArray<string>, cb: (id: string) => void): () => void {
  const secs = ids.map((id) => document.getElementById(id)).filter((s): s is HTMLElement => !!s);
  if (!secs.length || typeof IntersectionObserver === "undefined") return () => {};
  const io = new IntersectionObserver((ents) => { ents.forEach((en) => { if (en.isIntersecting) cb(en.target.id); }); }, { rootMargin: "-40% 0px -55% 0px" });
  secs.forEach((s) => io.observe(s));
  return () => io.disconnect();
}
