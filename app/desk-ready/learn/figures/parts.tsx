"use client";

import { createContext, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { D, W } from "../../tokens";

/* The building blocks every Desk Ready figure uses (owner 2026-11-11: "show
 * an actual email ... show all the different parts to it ... give the
 * whole picture from the very beginning ... carry that out to every single
 * thing in Desk Ready").
 *
 * A figure is a drawn, light app window (an email, a sheet, a folder) with
 * its parts numbered, and a key underneath saying what each part is and
 * what it's for. A lesson opens with the whole picture (every part
 * numbered); later cards pass `focus` to light up only the parts they
 * teach, so the learner always sees where a part sits in the whole. */

export interface PartInfo {
  n: number;
  name: string;
  what: string;
}

/* Which parts are lit. Empty means the whole picture: every part shown,
 * numbered and in the key. */
const FocusContext = createContext<{ focus: readonly string[]; info: Record<string, PartInfo> }>({ focus: [], info: {} });

export function FigureProvider<K extends string>({ focus, info, children }: { focus?: readonly K[]; info: Record<K, PartInfo>; children: ReactNode }) {
  return <FocusContext.Provider value={{ focus: focus ?? [], info }}>{children}</FocusContext.Provider>;
}

/* Wraps one part of a drawn window: puts its number beside it, outlines it
 * when it's lit, and fades it when another part is the subject. */
/* `holds` names the parts drawn inside this one, so it stays clear (not
 * faded) when one of them is the subject. */
/* `noBadge` outlines a second piece of the same part (the right hand's
 * home keys) without numbering it twice. */
export function Part({ k, children, style, badge = "left", block = true, holds = [], noBadge }: { k: string; children: ReactNode; style?: CSSProperties; badge?: "left" | "right" | "top" | "corner"; block?: boolean; holds?: string[]; noBadge?: boolean }) {
  const { focus, info } = useContext(FocusContext);
  const p = info[k];
  const whole = focus.length === 0;
  const lit = focus.includes(k);
  const shown = whole || lit;
  const holdsLit = holds.some((h) => focus.includes(h));
  const Tag = block ? "div" : "span";
  return (
    <Tag
      data-part={k}
      data-lit={lit ? "" : undefined}
      style={{
        position: "relative",
        display: block ? "block" : "inline-block",
        borderRadius: 6,
        outline: lit ? "3px solid #f5b400" : "none",
        outlineOffset: 2,
        boxShadow: lit ? "0 0 0 7px rgba(245,180,0,0.18)" : "none",
        opacity: shown || holdsLit ? 1 : 0.32,
        transition: "opacity .2s ease",
        ...style,
      }}
    >
      {children}
      {p && shown && !noBadge && <Badge n={p.n} side={badge} />}
    </Tag>
  );
}

function Badge({ n, side }: { n: number; side: "left" | "right" | "top" | "corner" }) {
    /* in the gutter beside the part, never on top of its words */
  const pos: CSSProperties = side === "left" ? { left: -36, top: "50%", transform: "translateY(-50%)" } : side === "right" ? { right: -36, top: "50%", transform: "translateY(-50%)" } : side === "corner" ? { right: -14, top: -14 } : { left: "50%", top: -32, transform: "translateX(-50%)" };
  return (
    <span
      aria-hidden
      style={{
        position: "absolute",
        zIndex: 3,
        ...pos,
        width: 26,
        height: 26,
        borderRadius: "50%",
        background: "#f5b400",
        color: "#1b1b1b",
        border: "2px solid #ffffff",
        boxShadow: "0 2px 6px rgba(0,0,0,0.35)",
        fontFamily: D.sans,
        fontSize: 13,
        fontWeight: 800,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      {n}
    </span>
  );
}

/* A part's number when it's on show, for figures that draw the number
 * themselves (a key on the keyboard carries its own). */
export function usePartNumber(k: string): number | null {
  const { focus, info } = useContext(FocusContext);
  const p = info[k];
  return p && (focus.length === 0 || focus.includes(k)) ? p.n : null;
}

/* The dark stage a figure sits on, with its key underneath. */
/* `minWidth`: a figure that can't wrap (an inbox, a sheet) keeps its width
 * and scrolls sideways on a phone; an email wraps like a phone's Outlook. */
/* Where to scroll a figure wider than the screen, given where its lit
 * parts sit (px from its left edge): the position that shows the most lit
 * parts whole, with room for their badges. A lit part wider than the
 * screen (a total row across a sheet) can never show whole, so it counts
 * for nothing and the narrow parts beside it (the column the card is
 * about) decide. Ties go to the rightmost position: on a document the left
 * holds labels and the right the figures, the note, the bank details,
 * which are what a card is usually about (Module 10 review, 2026-11-11).
 * When no lit part can show whole, it opens at the first one's start.
 * Exported for its tests. */
export function bestScroll(spans: { left: number; right: number }[], view: number, max: number): number {
  const pad = 44; // the badge sits in a 36px gutter beside its part; the edge fade is 24px
  const clamp = (x: number) => Math.max(0, Math.min(max, x));
  const candidates = new Set<number>([0, max]);
  for (const sp of spans) {
    candidates.add(clamp(sp.left - pad));
    candidates.add(clamp(sp.right + pad - view));
    candidates.add(clamp((sp.left + sp.right) / 2 - view / 2));
  }
  let best = 0;
  let bestScore = -1;
  for (const x of [...candidates].sort((p, q) => p - q)) {
    /* sorted left to right, so on a tie the later (righter) one wins */
    /* a part at the very edge of the figure needs no margin past that edge */
    const whole = spans.filter((sp) => Math.max(0, sp.left - pad) >= x - 1 && Math.min(max + view, sp.right + pad) <= x + view + 1).length;
    /* then the most parts whose start, with its badge, is on screen */
    const starts = spans.filter((sp) => Math.max(0, sp.left - pad) >= x - 1 && sp.left + 40 <= x + view).length;
    /* a lit part counts first by its badge being on screen (so the key
     * can be matched to it), then by showing whole */
    const score = starts * 1000 + whole;
    if (score >= bestScore) {
      best = x;
      bestScore = score;
    }
  }
  /* No lit part fits whole (an address bar, a form row wider than the
   * phone): open at the start of the first one, where its badge and label
   * are, not at its far end (Module 10 review, third pass). */
  if (bestScore === 0) return clamp(Math.min(...spans.map((sp) => sp.left)) - pad);
  return best;
}

/* The dark stage a figure scrolls in. A figure wider than the screen (a
 * phone) scrolls sideways inside it, so on a phone: it opens scrolled to
 * the part the card lights, never on a dimmed corner; faded edges show
 * there is more on that side; and a line under it says to slide. A
 * Module 10 review found 15 cards whose lit part was off-screen with no
 * hint at all. */
/* When a card lights some parts, everything drawn outside the numbered
 * parts (a window's title, a table's other rows, the small print) dims
 * with the unlit parts, so the lit part stands out. Parts dim themselves;
 * this catches the rest. It picks only the outermost such element (whose
 * parent holds a part, or is the figure), so nothing dims twice, and
 * never anything inside a part. Reviews of Modules 9, 10 and 11 found
 * this on nearly every lit card. A part inside a lit part stays bright:
 * lighting the draft lights everything in it (Module 12 review). And a
 * part that holds a lit part stays bright too, so the lit part is never
 * washed out by its container (Module 13 review; the `holds` prop did
 * this by hand). */
const FIG_FOCUS_CSS = `.dr-fig-focus > :not([data-part]):not(:has([data-part])), .dr-fig-focus :not([data-part]):not([data-part] *):has([data-part]) > :not([data-part]):not(:has([data-part])) { opacity: 0.32; transition: opacity .2s ease; } .dr-fig-focus [data-lit] [data-part]:not([data-lit]) { opacity: 1 !important; } .dr-fig-focus [data-part]:not([data-lit]):has([data-lit]) { opacity: 1 !important; }`;

/* On a laptop a figure fits, so its frame does not scroll and a badge at
 * the figure's very edge may sit over the frame's border rather than be
 * cut off. On a phone it slides, with room at the sides for a badge. */
const FIG_SCROLL_CSS = `.dr-workspace.dr-fig-scroll { padding: 34px 26px 26px; overflow-x: visible; } @media (max-width: 720px) { .dr-workspace.dr-fig-scroll { padding: 34px 42px 26px; overflow-x: auto; } }`;

function Scroller({ children, focusKey }: { children: ReactNode; focusKey: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    /* only a frame that scrolls (a phone) has more to see */
    const scrolls = () => getComputedStyle(el).overflowX !== "visible";
    const measure = () => setEdges(scrolls() ? { left: el.scrollLeft > 4, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 } : { left: false, right: false });
    /* bring the lit parts into view; again when fonts or layout settle
     * (a measure taken before the fonts load is off by tens of pixels),
     * but never after the learner has moved it themselves */
    let moved = false;
    const place = () => {
      if (moved) return;
      const lit = [...el.querySelectorAll<HTMLElement>("[data-lit]")];
      if (lit.length && scrolls() && el.scrollWidth > el.clientWidth + 4) {
        const box = el.getBoundingClientRect();
        const spans = lit.map((n) => {
          const r = n.getBoundingClientRect();
          return { left: r.left - box.left + el.scrollLeft, right: r.right - box.left + el.scrollLeft };
        });
        el.scrollLeft = bestScroll(spans, el.clientWidth, el.scrollWidth - el.clientWidth);
      } else if (!lit.length) el.scrollLeft = 0;
      measure();
    };
    const mine = () => {
      moved = true;
    };
    place();
    let live = true;
    document.fonts?.ready.then(() => live && place());
    const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => place());
    if (ro && el.firstElementChild) ro.observe(el.firstElementChild);
    el.addEventListener("scroll", measure, { passive: true });
    for (const ev of ["pointerdown", "wheel", "touchstart", "keydown"]) el.addEventListener(ev, mine, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      live = false;
      ro?.disconnect();
      el.removeEventListener("scroll", measure);
      for (const ev of ["pointerdown", "wheel", "touchstart", "keydown"]) el.removeEventListener(ev, mine);
      window.removeEventListener("resize", measure);
    };
  }, [focusKey]);

  const fade = (side: "left" | "right"): CSSProperties => ({ position: "absolute", top: 0, bottom: 0, [side]: 0, width: 16, pointerEvents: "none", borderRadius: side === "left" ? "18px 0 0 18px" : "0 18px 18px 0", background: `linear-gradient(to ${side === "left" ? "right" : "left"}, rgba(4,8,20,0.55), rgba(4,8,20,0))` });
  const more = edges.left || edges.right;
  return (
    <>
      <div style={{ position: "relative" }}>
        <div ref={ref} className="dr-workspace dr-fig-scroll">
          {children}
        </div>
        {edges.left && <span aria-hidden style={fade("left")} />}
        {edges.right && <span aria-hidden style={fade("right")} />}
      </div>
      {/* on a phone the figure slides, so the sides need room for a badge
       * (36px out from its part); on a laptop it fits, so they don't */}
      <style>{FIG_SCROLL_CSS + FIG_FOCUS_CSS}</style>
      {more && (
        <p style={{ margin: "8px 0 0", display: "flex", alignItems: "center", gap: 8, fontFamily: D.mono, fontSize: 12.5, fontWeight: 700, letterSpacing: "0.08em", color: D.accent }}>
          <span aria-hidden style={{ whiteSpace: "nowrap" }}>{edges.left && edges.right ? "\u2190 \u2192" : edges.left ? "\u2190" : "\u2192"}</span>
          Slide to see more
        </p>
      )}
    </>
  );
}

export function FigureFrame<K extends string>({ title, info, focus, children, note, minWidth = 0 }: { title?: string; info: Record<K, PartInfo>; focus?: readonly K[]; children: ReactNode; note?: string; minWidth?: number }) {
  const keys = (Object.keys(info) as K[]).filter((k) => !focus || focus.length === 0 || focus.includes(k)).sort((a, b) => info[a].n - info[b].n);
  return (
    <FigureProvider focus={focus} info={info}>
      <figure style={{ margin: "20px 0 0" }}>
        <Scroller focusKey={(focus ?? []).join(",")}>
          <div className={focus && focus.length ? "dr-fig-focus" : undefined} style={{ minWidth, colorScheme: "light", fontFamily: W.font, color: W.ink, overflowWrap: "break-word" }}>
            {children}
          </div>
        </Scroller>
        <figcaption style={{ marginTop: 14 }}>
          {title && <p style={{ margin: "0 0 10px", fontFamily: D.mono, fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: D.faint }}>{title}</p>}
          <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8, gridTemplateColumns: keys.length > 4 ? "repeat(auto-fit, minmax(min(100%, 300px), 1fr))" : "1fr" }}>
            {keys.map((k) => (
              <li key={k} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 12px", borderRadius: 12, background: D.glass, border: `1px solid ${D.edge}` }}>
                <span aria-hidden style={{ flexShrink: 0, width: 26, height: 26, borderRadius: "50%", background: "#f5b400", color: "#1b1b1b", fontSize: 13, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  {info[k].n}
                </span>
                <span style={{ fontSize: 16, lineHeight: 1.5, color: D.body }}>
                  <b style={{ color: D.ink }}>{info[k].name}.</b> {info[k].what}
                </span>
              </li>
            ))}
          </ol>
          {note && <p style={{ margin: "12px 0 0", fontSize: 15, lineHeight: 1.5, color: D.muted }}>{note}</p>}
        </figcaption>
      </figure>
    </FigureProvider>
  );
}

/* A plain light window with a coloured title bar, as the office apps have. */
export function AppWindow({ app, colour, title, children, toolbar }: { app: string; colour: string; title?: string; children: ReactNode; toolbar?: ReactNode }) {
  return (
    <div style={{ background: W.page, borderRadius: 8, boxShadow: W.float, overflow: "visible", border: `1px solid ${W.edge}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 34, padding: "0 12px", background: colour, color: "#fff", fontSize: 13.5, borderRadius: "8px 8px 0 0" }}>
        <b>{app}</b>
        {title && <span style={{ opacity: 0.9 }}>{title}</span>}
      </div>
      {toolbar && <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, padding: "8px 12px", background: W.chrome, borderBottom: `1px solid ${W.edge}` }}>{toolbar}</div>}
      {children}
    </div>
  );
}

/* A pretend button, drawn rather than pressable. */
export function FakeButton({ children, primary, colour = W.outlook }: { children: ReactNode; primary?: boolean; colour?: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, minHeight: 32, padding: "4px 12px", borderRadius: 5, border: primary ? "none" : `1px solid ${W.edge}`, background: primary ? colour : W.page, color: primary ? "#fff" : W.ink, fontSize: 13.5, fontWeight: primary ? 700 : 500, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}
