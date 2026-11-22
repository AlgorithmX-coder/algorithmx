/* Small motion helpers for the Saturday Morning /cyberheroes page. Vanilla,
 * imperative, run from effects. Same shape as app/components/home-holo/fx.ts. */

export const reduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Reveal on scroll: elements matching sel inside root get data-in when they
 * enter. The revealed state is an attribute React does not manage, so a later
 * re-render cannot wipe it the way it wipes a class added to className. */
export function reveal(root: ParentNode, sel = "[data-reveal]"): () => void {
  const els = Array.from(root.querySelectorAll<HTMLElement>(sel));
  const mark = (el: Element) => el.setAttribute("data-in", "");
  if (reduced() || !("IntersectionObserver" in window)) {
    els.forEach(mark);
    return () => {};
  }
  const io = new IntersectionObserver(
    (ents) => ents.forEach((en) => { if (en.isIntersecting) { mark(en.target); io.unobserve(en.target); } }),
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
  );
  els.forEach((e) => { if (!e.hasAttribute("data-in")) io.observe(e); });
  return () => io.disconnect();
}

/* Count a number up inside el, keeping prefix/suffix like + and %. */
export function countUp(el: HTMLElement, text: string, ms = 1400) {
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

/* Counters: zero every [data-count] inside root, then count each up once it
 * is half visible. Markup carries the final value, so no-JS and reduced
 * motion both read the real number. */
export function counters(root: ParentNode): () => void {
  const els = Array.from(root.querySelectorAll<HTMLElement>("[data-count]"));
  if (reduced() || !("IntersectionObserver" in window)) return () => {};
  els.forEach((el) => { const m = (el.dataset.count || "").match(/^([^\d]*)[\d.,]+(.*)$/); if (m) el.textContent = `${m[1]}0${m[2]}`; });
  const io = new IntersectionObserver(
    (ents) => ents.forEach((en) => { if (en.isIntersecting) { const el = en.target as HTMLElement; countUp(el, el.dataset.count || ""); io.unobserve(el); } }),
    { threshold: 0.5 },
  );
  els.forEach((el) => io.observe(el));
  return () => io.disconnect();
}

/* 24x24 stroke icons (path data only). */
export const ICONS = {
  shield: "M12 2l8 3v6c0 5-3.5 8-8 11-4.5-3-8-6-8-11V5l8-3z M9 12l2 2 4-4",
  lock: "M5 11h14v10H5z M8 11V7a4 4 0 018 0v4",
  arrow: "M5 12h14M13 6l6 6-6 6",
  check: "M20 6L9 17l-5-5",
  burger: "M4 7h16M4 12h16M4 17h16",
  close: "M6 6l12 12M18 6L6 18",
} as const;
