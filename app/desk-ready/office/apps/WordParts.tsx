"use client";

import type { CSSProperties, ReactNode } from "react";
import { W } from "../../tokens";
import type { WordBlock, WordDoc } from "../types";
import { STYLES, WORD, px, sizeOf } from "../word";

/* The pieces Word's window and a document's page share: how a paragraph
 * looks for its style, the letterhead, a read-only page (what a PDF shows),
 * and the ribbon's small drawn icons. No vendor artwork: every icon is a
 * few lines of SVG. */

export const LINE = 1.3;

/* A paragraph's look: its style, then anything typed straight on it. */
export function blockCss(b: WordBlock): CSSProperties {
  const s = STYLES[b.style];
  return {
    fontFamily: s.font,
    fontSize: px(sizeOf(b)),
    color: s.colour,
    fontWeight: b.bold ? 700 : s.weight,
    fontStyle: b.italic ? "italic" : "normal",
    textDecoration: b.underline ? "underline" : "none",
    textAlign: b.align ?? "left",
    lineHeight: LINE,
    letterSpacing: b.style === "title" ? "-0.01em" : undefined,
  };
}

export const blockMargin = (b: WordBlock) => `${px(STYLES[b.style].before)}px 0 ${px(STYLES[b.style].after)}px`;

/* The number each "number" paragraph shows: 1, 2, 3, starting again after
 * anything that isn't a numbered paragraph. */
export function listNumbers(blocks: WordBlock[], markup = false): Record<string, number> {
  const out: Record<string, number> = {};
  let n = 0;
  for (const b of blocks) {
    /* a step crossed out as a tracked change keeps its number until it's accepted */
    if (b.style === "number" && (markup || b.revPara !== "del")) out[b.id] = ++n;
    else if (b.style !== "number") n = 0;
  }
  return out;
}

/* The company letterhead, as it prints at the top of the page. */
export function Letterhead({ header }: { header: NonNullable<WordDoc["header"]> }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, paddingBottom: 12, marginBottom: 22, borderBottom: `2px solid ${WORD.heading}` }}>
      <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden style={{ display: "inline-block", flexShrink: 0 }}>
        <rect x="2" y="2" width="36" height="36" rx="8" fill={WORD.heading} />
        <path d="M11 29 V11 L29 29 V11" stroke="#ffffff" strokeWidth="3.6" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: WORD.display, fontSize: 21, fontWeight: 700, letterSpacing: "0.08em", color: WORD.heading, lineHeight: 1.1 }}>{header.name.toUpperCase()}</div>
        {header.lines.map((l) => (
          <div key={l} style={{ fontFamily: WORD.body, fontSize: 12, color: "#595959", lineHeight: 1.45 }}>
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Footer({ text }: { text: string }) {
  return <div style={{ marginTop: 36, paddingTop: 8, borderTop: "1px solid #d0d0d0", fontFamily: WORD.body, fontSize: 11, color: "#7a7a7a", textAlign: "center" }}>{text}</div>;
}

/* A field's answer on a printed page. */
function printedField(b: WordBlock) {
  if (b.field?.kind === "check") return b.text ? "☒" : "☐";
  return b.text || "";
}

/* A page that can't be typed in: what a PDF shows. Tracked changes show
 * as they now read, and comments are left off, as Word prints by default
 * once changes are dealt with. */
export function DocSheet({ doc, width = WORD.pageW, pad = WORD.margin }: { doc: WordDoc; width?: number; pad?: number }) {
  const nums = listNumbers(doc.blocks);
  const rows: ReactNode[] = [];
  let form: WordBlock[] = [];
  const flush = () => {
    if (!form.length) return;
    const group = form;
    form = [];
    rows.push(
      <table key={`f-${group[0].id}`} style={{ width: "100%", borderCollapse: "collapse", margin: "4px 0 14px", fontFamily: WORD.body, fontSize: px(11) }}>
        <tbody>
          {group.map((b) => (
            <tr key={b.id}>
              <td style={{ width: "38%", padding: "8px 10px", border: "1px solid #bfbfbf", background: "#f2f2f2", fontWeight: 600, verticalAlign: "top" }}>
                {b.field!.label}
                {b.field!.required ? " *" : ""}
              </td>
              <td style={{ padding: "8px 10px", border: "1px solid #bfbfbf", verticalAlign: "top" }}>{printedField(b)}</td>
            </tr>
          ))}
        </tbody>
      </table>,
    );
  };
  for (const b of doc.blocks) {
    if (b.field) {
      form.push(b);
      continue;
    }
    flush();
    if (b.revPara === "del") continue;
    if (b.table) {
      rows.push(
        <table key={b.id} style={{ width: "100%", borderCollapse: "collapse", margin: "6px 0 14px", fontFamily: WORD.body, fontSize: px(11) }}>
          <tbody>
            {b.table.map((r, ri) => (
              <tr key={ri}>
                {r.map((c, ci) => (
                  <td key={ci} style={{ border: "1px solid #000", padding: "5px 8px", fontWeight: ri === 0 ? 700 : 400, verticalAlign: "top" }}>
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>,
      );
      continue;
    }
    const list = b.style === "bullet" || b.style === "number";
    rows.push(
      <div key={b.id} style={{ ...blockCss(b), margin: blockMargin(b), position: "relative", paddingLeft: list ? 30 : 0, whiteSpace: "pre-wrap", minHeight: `${LINE}em` }}>
        {list && <span style={{ position: "absolute", left: 8 }}>{b.style === "bullet" ? "•" : `${nums[b.id]}.`}</span>}
        {b.text}
      </div>,
    );
  }
  flush();
  return (
    <div style={{ width, minHeight: Math.round(width * 1.414), boxSizing: "border-box", padding: pad, background: "#ffffff", boxShadow: "0 1px 3px rgba(0,0,0,0.18), 0 6px 18px -6px rgba(0,0,0,0.22)", color: "#000", textAlign: "left" }}>
      {doc.header && <Letterhead header={doc.header} />}
      {rows}
      {doc.footer && <Footer text={doc.footer} />}
    </div>
  );
}

/* ── the ribbon's icons ───────────────────────────────────────────────── */

const svg = (children: ReactNode, size = 20) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden style={{ display: "inline-block", flexShrink: 0 }}>
    {children}
  </svg>
);
const ink = "#323130";

export const Icon = {
  bullets: () =>
    svg(
      <>
        {[6, 12, 18].map((y) => (
          <g key={y}>
            <circle cx="5" cy={y} r="1.7" fill={ink} />
            <path d={`M9.5 ${y} H20`} stroke={ink} strokeWidth="1.6" />
          </g>
        ))}
      </>,
    ),
  numbering: () =>
    svg(
      <>
        {[6, 12, 18].map((y, i) => (
          <g key={y}>
            <text x="2.5" y={y + 2.6} fontSize="7.5" fontFamily="Segoe UI, sans-serif" fontWeight="700" fill={ink}>
              {i + 1}
            </text>
            <path d={`M9.5 ${y} H20`} stroke={ink} strokeWidth="1.6" />
          </g>
        ))}
      </>,
    ),
  align: (dir: "left" | "center" | "right") =>
    svg(
      <>
        {[5, 9.5, 14, 18.5].map((y, i) => {
          const w = i % 2 ? 10 : 16;
          const x = dir === "left" ? 4 : dir === "right" ? 20 - w : 12 - w / 2;
          return <path key={y} d={`M${x} ${y} H${x + w}`} stroke={ink} strokeWidth="1.6" />;
        })}
      </>,
    ),
  table: (size = 28) =>
    svg(
      <>
        <rect x="3" y="4" width="18" height="16" rx="1.5" fill="#ffffff" stroke={ink} strokeWidth="1.4" />
        <rect x="3" y="4" width="18" height="4.5" fill={W.word} />
        <path d="M3 12.5 H21 M3 16.3 H21 M9 8.5 V20 M15 8.5 V20" stroke={ink} strokeWidth="1.1" />
      </>,
      size,
    ),
  spelling: (size = 28) =>
    svg(
      <>
        <text x="1.5" y="11" fontSize="8.6" fontFamily="Segoe UI, sans-serif" fontWeight="700" fill={ink}>
          ABC
        </text>
        <path d="M6 17 L10 21 L19 12" stroke="#107c10" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </>,
      size,
    ),
  comment: (size = 28) =>
    svg(
      <>
        <path d="M4 5 H20 V16 H11 L6.5 20 V16 H4 Z" fill="#fff4ce" stroke="#8a6d00" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M12 8 V13 M9.5 10.5 H14.5" stroke="#8a6d00" strokeWidth="1.5" />
      </>,
      size,
    ),
  track: (size = 28) =>
    svg(
      <>
        <path d="M5 3 H15 L19 7 V21 H5 Z" fill="#ffffff" stroke={ink} strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M8 9 H16 M8 12.5 H13" stroke={WORD.them} strokeWidth="1.6" />
        <path d="M8 16 H16" stroke={ink} strokeWidth="1.3" />
        <path d="M13 19 L20.5 11.5 L22.5 13.5 L15 21 L12.6 21.4 Z" fill="#f7c948" stroke={ink} strokeWidth="1" strokeLinejoin="round" />
      </>,
      size,
    ),
  accept: (size = 28) =>
    svg(
      <>
        <path d="M5 3 H15 L19 7 V21 H5 Z" fill="#ffffff" stroke={ink} strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M8 13 L11 16 L17 9.5" stroke="#107c10" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </>,
      size,
    ),
  reject: (size = 28) =>
    svg(
      <>
        <path d="M5 3 H15 L19 7 V21 H5 Z" fill="#ffffff" stroke={ink} strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M8.5 10 L15.5 17 M15.5 10 L8.5 17" stroke="#c50f1f" strokeWidth="2.2" strokeLinecap="round" />
      </>,
      size,
    ),
  prev: () => svg(<path d="M15 5 L8 12 L15 19" stroke={ink} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />, 18),
  next: () => svg(<path d="M9 5 L16 12 L9 19" stroke={ink} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />, 18),
  save: (colour = "#ffffff") =>
    svg(
      <>
        <path d="M4 4 H17 L20 7 V20 H4 Z" fill="none" stroke={colour} strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M8 4 V9 H15 V4 M7.5 20 V14 H16.5 V20" fill="none" stroke={colour} strokeWidth="1.5" />
      </>,
      18,
    ),
  undo: (colour = "#ffffff") => svg(<path d="M9 7 L4.5 11.5 L9 16 M5 11.5 H15 A5 5 0 0 1 15 21.5 H11" fill="none" stroke={colour} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />, 18),
  redo: (colour = "#ffffff") => svg(<path d="M15 7 L19.5 11.5 L15 16 M19 11.5 H9 A5 5 0 0 0 9 21.5 H13" fill="none" stroke={colour} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />, 18),
  pdf: (size = 28) =>
    svg(
      <>
        <path d="M5 2.5 H15 L20 7.5 V21.5 H5 Z" fill="#ffffff" stroke="#c4314b" strokeWidth="1.4" strokeLinejoin="round" />
        <rect x="2.5" y="10.5" width="13" height="7.5" rx="1.2" fill="#c4314b" />
        <text x="3.8" y="16.4" fontSize="5.4" fontFamily="Segoe UI, sans-serif" fontWeight="800" fill="#ffffff">
          PDF
        </text>
      </>,
      size,
    ),
  book: (ok: boolean) =>
    svg(
      <>
        <path d="M4 5 C7 3.6 10 3.6 12 5 C14 3.6 17 3.6 20 5 V19 C17 17.6 14 17.6 12 19 C10 17.6 7 17.6 4 19 Z" fill="none" stroke={ink} strokeWidth="1.4" />
        {ok ? <path d="M8.5 11.5 L11 14 L15.5 9" stroke="#107c10" strokeWidth="2" fill="none" /> : <path d="M9.5 9 L14.5 14 M14.5 9 L9.5 14" stroke="#c50f1f" strokeWidth="2" />}
      </>,
      18,
    ),
};

/* What Word adds to the office's styles: the marks a document carries
 * (tracked changes, spelling, placeholders) and the ribbon's hover. */
export const WORD_CSS = `
  .wd-page [contenteditable] { outline: none; caret-color: #000; }
  .wd-page [contenteditable="true"] { cursor: text; }
  .wd-ins { text-decoration: underline; text-decoration-thickness: 1px; }
  .wd-del { text-decoration: line-through; }
  .wd-them { color: ${WORD.them}; }
  .wd-you { color: ${WORD.you}; }
  .wd-cur { background: rgba(15,108,189,0.16); border-radius: 2px; }
  [data-rev] { cursor: pointer; }
  .wd-sp { text-decoration: underline wavy ${WORD.spelling}; text-decoration-skip-ink: none; text-underline-offset: 3px; text-decoration-thickness: 1px; }
  .wd-gr { text-decoration: underline double ${WORD.grammar}; text-decoration-skip-ink: none; text-underline-offset: 3px; }
  .wd-on { background: rgba(232,17,35,0.14); }
  .wd-gr.wd-on { background: rgba(43,87,154,0.16); }
  .wd-ph { background: ${WORD.placeholder}; color: #595959; border-radius: 2px; }
  .wd-changed::before { content: ""; position: absolute; left: -26px; top: 2px; bottom: 2px; width: 2px; background: #595959; }
  .wd-rb { display: inline-flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; min-width: 52px; min-height: 64px; padding: 4px 6px; border: 1px solid transparent; border-radius: 4px; background: transparent; font-family: ${W.font}; font-size: 12.5px; color: ${W.ink}; cursor: pointer; line-height: 1.15; text-align: center; }
  .wd-rb.sm { flex-direction: row; min-width: 40px; min-height: 40px; padding: 0 8px; font-size: 15px; gap: 6px; }
  .wd-rb:not(:disabled):hover { background: #e1dfdd; }
  .wd-rb[aria-pressed="true"] { background: #c8c6c4; border-color: #8a8886; }
  .wd-rb:disabled { opacity: 0.4; cursor: not-allowed; }
  .wd-tile { display: flex; flex-direction: column; justify-content: space-between; width: 92px; height: 66px; padding: 6px 8px 5px; border: 1px solid ${W.edge}; border-radius: 3px; background: #ffffff; cursor: pointer; text-align: left; font-family: ${W.font}; overflow: hidden; }
  .wd-tile:hover:not(:disabled) { border-color: #8a8886; }
  .wd-tile:disabled { opacity: 0.55; cursor: not-allowed; }
  .wd-tile[aria-pressed="true"] { border: 2px solid ${W.word}; padding: 5px 7px 4px; background: #eef4fc; }
  .wd-tab { min-height: 36px; padding: 0 14px; border: none; background: transparent; color: #ffffff; font-family: ${W.font}; font-size: 14px; cursor: pointer; border-radius: 4px 4px 0 0; }
  .wd-tab:hover { background: rgba(255,255,255,0.14); }
  .wd-tab[aria-selected="true"] { background: ${WORD.ribbon}; color: ${W.word}; font-weight: 600; }
  .wd-field input::placeholder { color: #6b6b6b; }
  .wd-field:hover .wd-ctl, .wd-ctl:focus-within { box-shadow: 0 0 0 1px #8a8886; }
`;
