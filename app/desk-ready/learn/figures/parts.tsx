"use client";

import { createContext, useContext, type CSSProperties, type ReactNode } from "react";
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
export function FigureFrame<K extends string>({ title, info, focus, children, note, minWidth = 0 }: { title?: string; info: Record<K, PartInfo>; focus?: readonly K[]; children: ReactNode; note?: string; minWidth?: number }) {
  const keys = (Object.keys(info) as K[]).filter((k) => !focus || focus.length === 0 || focus.includes(k)).sort((a, b) => info[a].n - info[b].n);
  return (
    <FigureProvider focus={focus} info={info}>
      <figure style={{ margin: "20px 0 0" }}>
        <div className="dr-workspace" style={{ padding: "34px 26px 26px 26px", overflowX: "auto" }}>
          <div style={{ minWidth, colorScheme: "light", fontFamily: W.font, color: W.ink, overflowWrap: "anywhere" }}>{children}</div>
        </div>
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
