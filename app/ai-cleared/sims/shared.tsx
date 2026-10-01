"use client";

import type { CSSProperties, ReactNode } from "react";

/* Pieces every simulator shares: a lightweight renderer for the assistant's
 * reply (paragraphs, numbered and bulleted lists, bold), a typing indicator,
 * an action row under replies, and a line-icon helper. No vendor artwork. */

export function Icon({ d, size = 18, stroke = "currentColor", strokeWidth = 1.7, fill = "none", style }: { d: string; size?: number; stroke?: string; strokeWidth?: number; fill?: string; style?: CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden style={style}>
      <path d={d} />
    </svg>
  );
}

export const ICONS = {
  plus: "M12 5v14M5 12h14",
  pencilSquare: "M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3z M13.5 6.5l3 3",
  search: "M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zM20 20l-3.5-3.5",
  chat: "M4 5h16v11H8l-4 4V5z",
  page: "M7 3h7l5 5v13H7V3zM14 3v5h5",
  agents: "M12 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM4 21a8 8 0 0 1 16 0",
  folder: "M3 7h6l2 2h10v11H3V7z",
  mic: "M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM6 11a6 6 0 0 0 12 0M12 17v4",
  arrowUp: "M12 19V5M6 11l6-6 6 6",
  arrowRight: "M4 12h15M13 6l6 6-6 6",
  chevron: "M6 9l6 6 6-6",
  copy: "M9 9h10v11H9V9zM5 15V4h11",
  thumbUp: "M7 11v9H4v-9h3zm0 0l4-7a2 2 0 0 1 2 2v4h5a2 2 0 0 1 2 2l-1.5 7a2 2 0 0 1-2 1.5H7",
  thumbDown: "M17 13V4h3v9h-3zm0 0l-4 7a2 2 0 0 1-2-2v-4H6a2 2 0 0 1-2-2l1.5-7A2 2 0 0 1 7.5 3.5H17",
  refresh: "M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5",
  share: "M12 3v12M7 8l5-5 5 5M5 14v6h14v-6",
  more: "M5 12h.01M12 12h.01M19 12h.01",
  sliders: "M4 6h10M18 6h2M4 12h2M10 12h10M4 18h12M20 18h0",
  globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18",
  briefcase: "M4 8h16v12H4V8zM9 8V5h6v3M4 13h16",
  sparkle: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z",
  menu: "M4 7h16M4 12h16M4 17h16",
  gem: "M6 4h12l3 5-9 12L3 9l3-5zM3 9h18M9 4l3 5 3-5M9 21l3-12 3 12",
  settings: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4 12h2M18 12h2M12 4v2M12 18v2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M6.3 17.7l1.4-1.4M16.3 7.7l1.4-1.4",
  home: "M4 11l8-7 8 7v9h-5v-6H9v6H4v-9z",
  book: "M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2V5zM4 19a2 2 0 0 1 2-2h14",
  image: "M4 5h16v14H4V5zM8 13l3-3 4 4 2-2 3 3M9 9h.01",
  clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2",
  speaker: "M4 10v4h4l5 4V6L8 10H4zM16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12",
  attach: "M21 11.5l-8.5 8.5a5 5 0 0 1-7-7l9-9a3.5 3.5 0 0 1 5 5l-9 9a2 2 0 0 1-3-3l8-8",
};

/* Paragraphs, "1. " numbered lists, "- " bullets, **bold**, `code`. Enough
 * to make a scripted or streamed reply look like the real thing. */
export function Lite({ text, style }: { text: string; style?: CSSProperties }) {
  const blocks = text.split(/\n{2,}/);
  return (
    <div style={style}>
      {blocks.map((b, i) => {
        const lines = b.split("\n").filter((l) => l.trim().length);
        if (!lines.length) return null;
        const numbered = lines.every((l) => /^\s*\d+[.)]\s/.test(l));
        const bulleted = lines.every((l) => /^\s*[-*•]\s/.test(l));
        if (numbered || bulleted) {
          const items = lines.map((l) => l.replace(/^\s*(\d+[.)]|[-*•])\s/, ""));
          return numbered ? (
            <ol key={i} style={{ margin: "0 0 10px", paddingLeft: 22 }}>{items.map((it, j) => <li key={j} style={{ margin: "3px 0" }}><Inline text={it} /></li>)}</ol>
          ) : (
            <ul key={i} style={{ margin: "0 0 10px", paddingLeft: 22 }}>{items.map((it, j) => <li key={j} style={{ margin: "3px 0" }}><Inline text={it} /></li>)}</ul>
          );
        }
        return <p key={i} style={{ margin: "0 0 10px", whiteSpace: "pre-wrap" }}>{lines.map((l, j) => <span key={j}>{j > 0 && <br />}<Inline text={l} /></span>)}</p>;
      })}
    </div>
  );
}

function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("**") && p.endsWith("**")) return <strong key={i}>{p.slice(2, -2)}</strong>;
        if (p.startsWith("`") && p.endsWith("`")) return <code key={i} style={{ fontFamily: "ui-monospace, Consolas, monospace", fontSize: "0.92em", background: "rgba(0,0,0,0.06)", borderRadius: 4, padding: "1px 4px" }}>{p.slice(1, -1)}</code>;
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

export function TypingDots({ colour = "#8a8a8a" }: { colour?: string }) {
  return (
    <span aria-label="writing" style={{ display: "inline-flex", gap: 4, alignItems: "center", height: 18 }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: colour, animation: `sim-dot 1.2s ${i * 0.18}s ease-in-out infinite` }} />
      ))}
      <style>{`@keyframes sim-dot { 0%, 80%, 100% { opacity: 0.25; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-3px); } } @media (prefers-reduced-motion: reduce) { [aria-label=writing] span { animation: none !important; opacity: .6; } }`}</style>
    </span>
  );
}

/* The little row of copy / thumbs / regenerate under a finished reply. */
export function ActionRow({ colour, items = ["copy", "thumbUp", "thumbDown", "refresh"] as (keyof typeof ICONS)[], extra }: { colour: string; items?: (keyof typeof ICONS)[]; extra?: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2, marginTop: 6, color: colour }}>
      {items.map((k) => (
        <span key={k} style={{ display: "inline-flex", padding: 5, borderRadius: 6 }}><Icon d={ICONS[k]} size={15} /></span>
      ))}
      {extra}
    </div>
  );
}

export function initialOf(name: string): string {
  return (name.trim().charAt(0) || "Y").toUpperCase();
}

/* The file the tool was given, as the real tools show it: a chip above
 * the composer with the title and the kind. */
export function AttachmentChip({ title, kind, colour, edge }: { title: string; kind: string; colour: string; edge: string }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 8, padding: "6px 10px 6px 8px", border: `1px solid ${edge}`, borderRadius: 10, background: "#fff", fontSize: 12.5, color: colour, maxWidth: "100%" }}>
      <span aria-hidden style={{ flexShrink: 0, width: 26, height: 26, borderRadius: 6, background: "#e8f0fb", color: "#185abd", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Icon d={ICONS.page} size={14} /></span>
      <span style={{ minWidth: 0, display: "flex", flexDirection: "column", lineHeight: 1.3 }}>
        <b style={{ color: "inherit", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</b>
        <small style={{ fontSize: 11, opacity: 0.8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{kind}</small>
      </span>
    </div>
  );
}
