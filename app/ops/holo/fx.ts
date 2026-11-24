/* Imperative helpers for the Hologram /ops page. reveal and reduced are the
 * shared ones from the homepage port; powerWires is this page's own: the
 * Ops mark powering the six module groups along SVG wires. */

export { reveal, reduced } from "@/app/components/home-holo/fx";

/* One wire + one travelling pulse per .group from the source at the top
 * centre of wrap, redrawn on resize. Hovering or focusing a group sends a
 * fast cyan pulse down its wire and lights the source (.src) in that
 * group's colour (its --g custom property). Returns a stop function. */
export function powerWires(wrap: HTMLElement): () => void {
  const svg = wrap.querySelector<SVGSVGElement>(".wires");
  const src = wrap.querySelector<HTMLElement>(".src");
  const cards = Array.from(wrap.querySelectorAll<HTMLElement>(".group"));
  if (!svg || !src || !cards.length) return () => {};
  const sy = 72;
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
      return `<path class="wire" data-i="${i}" d="${d}" pathLength="100"/><path class="pulse" data-i="${i}" d="${d}" pathLength="100" style="--i:${i}"/>`;
    }).join("");
  };
  const ro = new ResizeObserver(draw);
  ro.observe(wrap);
  draw();
  const offs: Array<() => void> = [() => ro.disconnect()];
  cards.forEach((c, i) => {
    const hot = (on: boolean) => {
      const g = getComputedStyle(c).getPropertyValue("--g").trim();
      svg.querySelectorAll(`[data-i="${i}"]`).forEach((p) => p.classList.toggle("hot", on));
      src.classList.toggle("lit", on);
      src.style.setProperty("--hot", g);
    };
    const on = () => hot(true), off = () => hot(false);
    c.addEventListener("pointerenter", on); c.addEventListener("pointerleave", off);
    c.addEventListener("focus", on); c.addEventListener("blur", off);
    offs.push(() => { c.removeEventListener("pointerenter", on); c.removeEventListener("pointerleave", off); c.removeEventListener("focus", on); c.removeEventListener("blur", off); });
  });
  return () => offs.forEach((f) => f());
}
