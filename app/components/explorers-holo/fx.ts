/* Imperative helpers for the Hologram /cyberexplorers page. The generic ones
 * (reveal, countUp, reduced) are shared with the homepage port; the two
 * below are this page's own. */

export { reveal, countUp, reduced } from "@/app/components/home-holo/fx";

/* The reticle mark "powering" the six included cards along SVG wires: one
 * wire + one travelling pulse per card from the source at the top centre,
 * redrawn on resize. Hovering or focusing a card sends a fast bright pulse
 * down its wire and lights the source. Returns a stop function. */
export function powerWires(wrap: HTMLElement): () => void {
  const svg = wrap.querySelector<SVGSVGElement>(".wires");
  const src = wrap.querySelector<HTMLElement>(".src");
  const cards = Array.from(wrap.querySelectorAll<HTMLElement>(".gcard"));
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
    const sx = w / 2, sy = 72;
    svg.innerHTML = cards.map((c, i) => {
      const [cx0, cy0] = pos(c);
      const ex = cx0 + c.offsetWidth / 2, ey = cy0;
      const d = `M${sx} ${sy} L${sx} ${sy + 14} C${sx} ${sy + (ey - sy) * 0.7}, ${ex} ${ey - (ey - sy) * 0.5}, ${ex} ${ey}`;
      return `<path class="wire" data-i="${i}" d="${d}" pathLength="100"/><path class="pulse" data-i="${i}" d="${d}" pathLength="100" style="--i:${i}"/>`;
    }).join("");
  };
  const ro = new ResizeObserver(draw);
  ro.observe(wrap);
  draw();
  const offs: Array<() => void> = [() => ro.disconnect()];
  cards.forEach((c, i) => {
    const hot = (on: boolean) => {
      svg.querySelectorAll(`[data-i="${i}"]`).forEach((p) => p.classList.toggle("hot", on));
      src?.classList.toggle("lit", on);
    };
    const on = () => hot(true), off = () => hot(false);
    c.addEventListener("pointerenter", on); c.addEventListener("pointerleave", off);
    c.addEventListener("focusin", on); c.addEventListener("focusout", off);
    offs.push(() => { c.removeEventListener("pointerenter", on); c.removeEventListener("pointerleave", off); c.removeEventListener("focusin", on); c.removeEventListener("focusout", off); });
  });
  return () => offs.forEach((f) => f());
}

/* Section spy for the capsule chips: calls cb with the id of the section
 * crossing the reading line, or "" when none does (hero, footer). */
export function spy(ids: ReadonlyArray<string>, cb: (id: string) => void): () => void {
  const secs = ids.map((id) => document.getElementById(id)).filter((s): s is HTMLElement => !!s);
  if (!secs.length || typeof IntersectionObserver === "undefined") return () => {};
  const vis = new Set<string>();
  const io = new IntersectionObserver((ents) => {
    ents.forEach((en) => { if (en.isIntersecting) vis.add(en.target.id); else vis.delete(en.target.id); });
    cb(ids.find((id) => vis.has(id)) ?? "");
  }, { rootMargin: "-40% 0px -50% 0px" });
  secs.forEach((s) => io.observe(s));
  return () => io.disconnect();
}

/* Count-up for every [data-count] under root once 40% of it is visible. */
export function countOnView(root: ParentNode, count: (el: HTMLElement, text: string) => void): () => void {
  const els = Array.from(root.querySelectorAll<HTMLElement>("[data-count]"));
  if (!els.length) return () => {};
  if (typeof IntersectionObserver === "undefined") { els.forEach((el) => { el.textContent = el.dataset.count || ""; }); return () => {}; }
  const io = new IntersectionObserver((ents) => ents.forEach((en) => {
    if (!en.isIntersecting) return;
    const el = en.target as HTMLElement;
    count(el, el.dataset.count || "");
    io.unobserve(el);
  }), { threshold: 0.4 });
  els.forEach((el) => io.observe(el));
  return () => io.disconnect();
}
