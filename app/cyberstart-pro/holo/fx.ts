/* Imperative helpers for the Hologram /pro page. The generic ones (reveal,
 * reduced) are shared with the homepage port; powerWires is this page's own:
 * the Pro mark powering the four act tiles along SVG wires. */

export { reveal, reduced } from "@/app/components/home-holo/fx";

/* Draws one wire + one travelling pulse per card from the source at the top
 * centre of `wrap`, redraws on resize, and lights a card's wire (and the
 * source, via data-lit) on hover or focus. Returns a stop function. */
export function powerWires(wrap: HTMLElement, cardSel: string, sy = 72): () => void {
  const svg = wrap.querySelector<SVGSVGElement>(".wires");
  const src = wrap.querySelector<HTMLElement>(".src");
  const cards = Array.from(wrap.querySelectorAll<HTMLElement>(cardSel));
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
    const sx = w / 2;
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
    const on = () => { svg.querySelectorAll(`[data-w="${i}"]`).forEach((p) => p.classList.add("hot")); src?.setAttribute("data-lit", ""); };
    const off = () => { svg.querySelectorAll(".hot").forEach((p) => p.classList.remove("hot")); src?.removeAttribute("data-lit"); };
    c.addEventListener("pointerenter", on); c.addEventListener("pointerleave", off);
    c.addEventListener("focusin", on); c.addEventListener("focusout", off);
    offs.push(() => { c.removeEventListener("pointerenter", on); c.removeEventListener("pointerleave", off); c.removeEventListener("focusin", on); c.removeEventListener("focusout", off); });
  });
  return () => offs.forEach((f) => f());
}
