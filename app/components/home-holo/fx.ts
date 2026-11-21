/* Small motion helpers for the Hologram Deck homepage. Vanilla, imperative,
 * run from effects. Ported from landing-lab/lab.js. */

export const reduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Reveal on scroll: elements matching sel inside root get .in when they enter. */
export function reveal(root: ParentNode, sel = "[data-reveal]"): () => void {
  const els = Array.from(root.querySelectorAll<HTMLElement>(sel));
  if (reduced() || !("IntersectionObserver" in window)) {
    els.forEach((e) => { e.setAttribute("data-in", ""); e.classList.add("in"); });
    return () => {};
  }
  /* Revealed state is an attribute React does not manage (data-in), so a
   * later re-render of the component cannot wipe it the way it wipes a
   * class added to className. The .in class is kept for any styles that
   * still read it. */
  const mark = (el: Element) => { el.setAttribute("data-in", ""); el.classList.add("in"); };
  const io = new IntersectionObserver(
    (ents) => ents.forEach((en) => { if (en.isIntersecting) { mark(en.target); io.unobserve(en.target); } }),
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
  );
  els.forEach((e) => { if (e.hasAttribute("data-in")) e.classList.add("in"); else io.observe(e); });
  return () => io.disconnect();
}

/* Count a number up inside el, keeping prefix/suffix like £ and %. */
export function countUp(el: HTMLElement, text: string, ms = 1100) {
  const m = String(text).match(/^([^\d]*)([\d.,]+)(.*)$/);
  if (!m || reduced()) { el.textContent = text; return; }
  const [, pre, num, post] = m;
  const target = parseFloat(num.replace(/,/g, ""));
  const dec = (num.split(".")[1] || "").length;
  const t0 = performance.now();
  const tick = (now: number) => {
    const p = Math.min(1, (now - t0) / ms);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = pre + (target * e).toFixed(dec) + post;
    if (p < 1) requestAnimationFrame(tick); else el.textContent = text;
  };
  requestAnimationFrame(tick);
}

/* Permanently scrambling ciphertext, like the live encrypted cards. */
const CIPHER = "0123456789ABCDEF%#@&<>=/+$";
export const cipher = (len: number) => { let s = ""; for (let i = 0; i < len; i++) s += CIPHER[(Math.random() * CIPHER.length) | 0]; return s; };
export function scramble(el: HTMLElement, len = 14, every = 90): () => void {
  el.textContent = cipher(len);
  if (reduced()) return () => {};
  const id = window.setInterval(() => {
    if (document.hidden) return;
    const a = (el.textContent || "").split("");
    if (a.length !== len) { el.textContent = cipher(len); return; }
    a[(Math.random() * len) | 0] = CIPHER[(Math.random() * CIPHER.length) | 0];
    el.textContent = a.join("");
  }, every);
  return () => clearInterval(id);
}

/* Sparkline path data from points. */
export function sparkPath(pts: ReadonlyArray<number>, w = 120, h = 36) {
  const max = Math.max(...pts), min = Math.min(...pts);
  const x = (i: number) => (i / (pts.length - 1)) * (w - 4) + 2;
  const y = (v: number) => h - 3 - ((v - min) / (max - min || 1)) * (h - 6);
  const d = pts.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const last = pts.length - 1;
  return { d, cx: +x(last).toFixed(1), cy: +y(pts[last]).toFixed(1) };
}

/* Pointer tilt: el rotates toward the pointer via --rx/--ry, max degrees. */
export function tilt(el: HTMLElement, max = 6, zone: Window | HTMLElement = window): () => void {
  if (reduced()) return () => {};
  let rx = 0, ry = 0, tx = 0, ty = 0, raf = 0;
  const loop = () => {
    rx += (tx - rx) * 0.08; ry += (ty - ry) * 0.08;
    el.style.setProperty("--rx", rx.toFixed(2) + "deg"); el.style.setProperty("--ry", ry.toFixed(2) + "deg");
    if (Math.abs(tx - rx) > 0.01 || Math.abs(ty - ry) > 0.01) raf = requestAnimationFrame(loop); else raf = 0;
  };
  const onMove = (e: PointerEvent) => {
    ty = ((e.clientX / window.innerWidth) - 0.5) * 2 * max;
    tx = -((e.clientY / window.innerHeight) - 0.5) * 2 * max;
    if (!raf) raf = requestAnimationFrame(loop);
  };
  zone.addEventListener("pointermove", onMove as EventListener);
  return () => { zone.removeEventListener("pointermove", onMove as EventListener); cancelAnimationFrame(raf); };
}

/* Deterministic pseudo-random for anything rendered on the server (no hydration drift). */
export function seeded(seed: number) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

export const ICONS: Record<string, string> = {
  shield: "M12 2l8 3v6c0 5-3.5 8-8 11-4.5-3-8-6-8-11V5l8-3z M9 12l2 2 4-4",
  target: "M12 4a8 8 0 100 16 8 8 0 000-16z M12 9a3 3 0 100 6 3 3 0 000-6z M12 2v3M12 19v3M2 12h3M19 12h3",
  monitor: "M3 4h18v12H3z M9 20h6M12 16v4",
  lock: "M5 11h14v10H5z M8 11V7a4 4 0 018 0v4",
  bolt: "M13 2L3 14h7l-1 8 10-12h-7l1-8z",
  arrow: "M5 12h14M13 6l6 6-6 6",
  chevron: "M6 9l6 6 6-6",
  plus: "M12 5v14M5 12h14",
  search: "M11 4a7 7 0 100 14 7 7 0 000-14z M20 20l-3.5-3.5",
  terminal: "M4 17l6-5-6-5M12 19h8",
};
