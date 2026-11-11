"use client";

import type { ReactNode } from "react";
import { display } from "../../office/formula";
import { W } from "../../tokens";
import { FakeButton, FigureFrame, Part, type PartInfo } from "./parts";

/* A spreadsheet, drawn the way Excel shows it, with every part numbered:
 * the file name, the ribbon, the Name Box and formula bar, the column
 * letters and row numbers, the headings, a row, a column, the selected
 * cell and the sheet tabs. A lesson opens on the whole sheet, then lights
 * up one part at a time. Lessons can relabel a part (`what`) to say what
 * it means in their example. */

export type SheetPart = "file" | "ribbon" | "namebox" | "formulabar" | "letters" | "numbers" | "headings" | "row" | "column" | "cell" | "tabs";

export const SHEET_PARTS: Record<SheetPart, PartInfo> = {
  file: { n: 1, name: "File name", what: "The workbook's name, and whether your changes are saved." },
  ribbon: { n: 2, name: "The ribbon", what: "Excel's buttons: Save, Sort, Filter, £, % and more." },
  namebox: { n: 3, name: "Name Box", what: "The name of the cell you've selected, like B4." },
  formulabar: { n: 4, name: "Formula bar", what: "What's really typed in the selected cell. For a formula, it shows the formula, not the answer." },
  letters: { n: 5, name: "Column letters", what: "A, B, C across the top. Each column is one detail." },
  numbers: { n: 6, name: "Row numbers", what: "1, 2, 3 down the side. Each row is one thing." },
  headings: { n: 7, name: "Headings", what: "Row 1 says what each column holds." },
  row: { n: 8, name: "A row", what: "Everything about one thing, across the sheet." },
  column: { n: 9, name: "A column", what: "One detail, for every row, down the sheet." },
  cell: { n: 10, name: "The selected cell", what: "The green box: where you type. Its name is its column letter, then its row number." },
  tabs: { n: 11, name: "Sheet tabs", what: "Each tab is a separate sheet in the same workbook. Click one to open it." },
};

export const STOCK_SHEET: string[][] = [
  ["Item", "Boxes", "Location", "Counted by"],
  ["Pallet wrap", "24", "C-01", "SP"],
  ["Labels (1000)", "18", "C-02", "SP"],
  ["Paper cups 8oz", "40", "C-03", "SP"],
  ["Lids 8oz", "35", "C-04", "SP"],
  ["Napkins", "95", "C-08", "SP"],
  ["Sauce pots", "50", "C-14", "SP"],
];

const ROW_H = 30;
const NUM_W = 40;
const GUTTER = 46;

export interface SheetFigureProps {
  grid?: string[][];
  /* What each cell shows, when it isn't what's typed. Formulas show their
   * answer anyway, worked out as the practice Excel does. */
  shown?: (r: number, c: number) => string | undefined;
  /* A background for a cell, e.g. a highlight rule's red. */
  tint?: (r: number, c: number) => string | undefined;
  widths?: number[];
  file?: string;
  saved?: boolean;
  /* The selected cell, row and column from 0, and the row and column
   * picked out by the "row" and "column" parts. */
  cell?: [number, number];
  row?: number;
  column?: number;
  tabs?: string[];
  activeTab?: number;
  focus?: SheetPart[];
  /* Replace what a part's key says, for this example. */
  what?: Partial<Record<SheetPart, string>>;
  /* Leave parts out of the picture and the key. */
  omit?: SheetPart[];
  title?: string;
  note?: string;
  /* Extra rows below the sheet, e.g. a chart. */
  children?: ReactNode;
}

const colLetter = (c: number) => String.fromCharCode(65 + c);

export function SheetFigure({
  grid = STOCK_SHEET,
  shown,
  widths,
  file = "Stock November.xlsx",
  saved = true,
  cell = [4, 1],
  row = 5,
  column = 1,
  tabs = ["Aisle A", "Aisle B", "Aisle C"],
  activeTab = 2,
  focus,
  what = {},
  omit = [],
  title = "A spreadsheet in Excel",
  note,
  tint,
  children,
}: SheetFigureProps) {
  const cols = grid[0]?.length ?? 4;
  const w = widths ?? Array.from({ length: cols }, (_, c) => (c === 0 ? 150 : 104));
  const left = (c: number) => NUM_W + w.slice(0, c).reduce((a, b) => a + b, 0);
  const total = left(cols) + 80; // a little empty sheet to the right
  const rows = grid.length + 1;
  const info = Object.fromEntries((Object.entries(SHEET_PARTS) as [SheetPart, PartInfo][]).filter(([k]) => !omit.includes(k)).map(([k, p]) => [k, what[k] ? { ...p, what: what[k] } : p])) as Record<SheetPart, PartInfo>;
  const has = (k: SheetPart) => !omit.includes(k);
  const raw = grid[cell[0]]?.[cell[1]] ?? "";
  const box = (k: SheetPart, x: number, y: number, bw: number, bh: number, badge: "left" | "right" | "top" | "bottom" | "corner") =>
    has(k) && (
      <Part k={k} badge={badge === "bottom" ? "top" : badge} style={{ position: "absolute", left: x, top: y, width: bw, height: bh, pointerEvents: "none", zIndex: 2 }}>
        <span />
      </Part>
    );

  return (
    <FigureFrame info={info} focus={focus} title={title} note={note} minWidth={GUTTER + total + 50}>
      <div style={{ background: W.page, borderRadius: 8, boxShadow: W.float, border: `1px solid ${W.edge}` }}>
        {/* title bar */}
        <div style={{ display: "flex", alignItems: "center", minHeight: 34, padding: `0 12px 0 ${GUTTER}px`, background: W.excel, color: "#fff", fontSize: 13.5, borderRadius: "8px 8px 0 0" }}>
          {has("file") ? (
            <Part k="file" block={false} badge="right">
              <span>
                <b>Excel</b> &nbsp;{file} · {saved ? "Saved" : "Not saved"}
              </span>
            </Part>
          ) : (
            <span>
              <b>Excel</b> &nbsp;{file}
            </span>
          )}
        </div>
        {/* ribbon */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: `8px 12px 8px ${GUTTER}px`, background: W.chrome, borderBottom: `1px solid ${W.edge}` }}>
          {has("ribbon") ? (
            <Part k="ribbon" block={false} badge="left">
              <span style={{ display: "inline-flex", gap: 6 }}>
                <FakeButton primary colour={W.excel}>
                  File ▾
                </FakeButton>
                <FakeButton>Save</FakeButton>
                <FakeButton>£</FakeButton>
                <FakeButton>%</FakeButton>
                <FakeButton>Sort A→Z</FakeButton>
                <FakeButton>⏷ Filter</FakeButton>
              </span>
            </Part>
          ) : (
            <span style={{ display: "inline-flex", gap: 6 }}>
              <FakeButton>Save</FakeButton>
              <FakeButton>Sort A→Z</FakeButton>
            </span>
          )}
        </div>
        {/* name box and formula bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: `8px 46px 8px ${GUTTER}px`, borderBottom: `1px solid ${W.edge}` }}>
          <Part k="namebox" block={false} badge="left">
            <span style={{ display: "inline-flex", alignItems: "center", width: 70, minHeight: 28, padding: "0 8px", border: `1px solid ${W.edge}`, fontSize: 14 }}>
              {colLetter(cell[1])}
              {cell[0] + 1}
            </span>
          </Part>
          <i style={{ fontFamily: "serif", color: W.muted }}>fx</i>
          <Part k="formulabar" style={{ flex: 1 }} badge="right">
            <span style={{ display: "flex", alignItems: "center", minHeight: 28, padding: "0 10px", border: `1px solid ${W.edge}`, fontFamily: "Consolas, ui-monospace, monospace", fontSize: 14 }}>{raw}</span>
          </Part>
        </div>
        {/* the grid */}
        <div style={{ position: "relative", height: (rows + 0.5) * ROW_H + 30, margin: `30px 0 6px ${GUTTER}px`, width: total, fontSize: 14 }}>
          {/* column letters */}
          <div style={{ position: "absolute", left: 0, top: 0, width: total, height: ROW_H, background: W.sunk, borderBottom: `1px solid ${W.edge}` }}>
            {Array.from({ length: cols + 1 }, (_, c) => (
              <span key={c} style={{ position: "absolute", left: left(c), top: 0, width: c < cols ? w[c] : 80, height: ROW_H, display: "flex", alignItems: "center", justifyContent: "center", borderRight: `1px solid ${W.edge}`, color: c === cell[1] ? W.excel : W.muted, fontWeight: c === cell[1] ? 700 : 400, fontSize: 13 }}>
                {colLetter(c)}
              </span>
            ))}
          </div>
          {/* row numbers */}
          <div style={{ position: "absolute", left: 0, top: ROW_H, width: NUM_W, height: (rows - 1) * ROW_H + ROW_H / 2, background: W.sunk, borderRight: `1px solid ${W.edge}` }}>
            {Array.from({ length: rows }, (_, r) => (
              <span key={r} style={{ position: "absolute", left: 0, top: r * ROW_H, width: NUM_W, height: ROW_H, display: "flex", alignItems: "center", justifyContent: "center", borderBottom: `1px solid ${W.edge}`, color: r === cell[0] ? W.excel : W.muted, fontWeight: r === cell[0] ? 700 : 400, fontSize: 13 }}>
                {r + 1}
              </span>
            ))}
          </div>
          {/* cells */}
          {grid.map((rowCells, r) =>
            rowCells.map((v, c) => {
              const text = shown?.(r, c) ?? (v.trim().startsWith("=") ? display(grid, r, c) : v);
              const numeric = r > 0 && /^-?£?[0-9][0-9,.]*%?$/.test(text);
              return (
                <span
                  key={`${r}-${c}`}
                  style={{ position: "absolute", left: left(c), top: (r + 1) * ROW_H, width: w[c], height: ROW_H, boxSizing: "border-box", padding: "0 6px", display: "flex", alignItems: "center", justifyContent: numeric ? "flex-end" : "flex-start", borderRight: `1px solid ${W.edge}`, borderBottom: `1px solid ${W.edge}`, background: r === 0 ? "#e6f2ea" : (tint?.(r, c) ?? W.page), fontWeight: r === 0 ? 700 : 400, whiteSpace: "nowrap", overflow: "hidden" }}
                >
                  {text}
                </span>
              );
            }),
          )}
          {/* the selected cell's green box */}
          <span style={{ position: "absolute", left: left(cell[1]), top: (cell[0] + 1) * ROW_H, width: w[cell[1]], height: ROW_H, boxSizing: "border-box", outline: `2px solid ${W.excel}`, outlineOffset: -2, zIndex: 1 }} />
          {/* the parts, as outlines over the grid */}
          {box("letters", NUM_W, 0, left(cols) - NUM_W, ROW_H, "left")}
          {box("numbers", 0, ROW_H, NUM_W, (rows - 1) * ROW_H, "left")}
          {box("headings", NUM_W, ROW_H, left(cols) - NUM_W, ROW_H, "right")}
          {box("row", 0, (row + 1) * ROW_H, left(cols), ROW_H, "right")}
          {box("column", left(column), 0, w[column], (grid.length + 1) * ROW_H, "top")}
          {box("cell", left(cell[1]), (cell[0] + 1) * ROW_H, w[cell[1]], ROW_H, "corner")}
        </div>
        {children}
        {/* sheet tabs */}
        <div style={{ display: "flex", alignItems: "stretch", minHeight: 34, padding: `0 12px 0 ${GUTTER + NUM_W}px`, background: W.chrome, borderTop: `1px solid ${W.edge}`, borderRadius: "0 0 8px 8px", fontSize: 13.5 }}>
          <Part k="tabs" block={false} badge="left">
            <span style={{ display: "inline-flex" }}>
              {tabs.map((t, i) => (
                <span key={t} style={{ padding: "8px 14px", background: i === activeTab ? W.page : "transparent", color: i === activeTab ? W.excel : W.ink, fontWeight: i === activeTab ? 700 : 400, borderBottom: i === activeTab ? `3px solid ${W.excel}` : "3px solid transparent" }}>
                  {t}
                </span>
              ))}
              <span style={{ padding: "8px 10px", color: W.muted }}>⊕</span>
            </span>
          </Part>
        </div>
      </div>
    </FigureFrame>
  );
}

/* ── a bar chart ────────────────────────────────────────────────────── */

export type ChartPart = "title" | "bars" | "names" | "numbers";

export const CHART_PARTS: Record<ChartPart, PartInfo> = {
  title: { n: 1, name: "Chart title", what: "Says what the chart shows, and when. \"Chart 1\" tells nobody anything." },
  bars: { n: 2, name: "The bars", what: "One bar per row. The taller the bar, the bigger the number. The answer jumps out." },
  names: { n: 3, name: "Names along the bottom", what: "Which thing each bar is: here, each day. They come from one column of the sheet." },
  numbers: { n: 4, name: "Numbers up the side", what: "How much: here, the sales. They come from another column, and its heading labels the side." },
};

export function ChartFigure({ data, chartTitle, label, value, focus, title = "A bar chart", note }: { data: [string, number][]; chartTitle: string; label: string; value: string; focus?: ChartPart[]; title?: string; note?: string }) {
  const max = Math.max(...data.map((d) => d[1]));
  const H = 180;
  return (
    <FigureFrame info={CHART_PARTS} focus={focus} title={title} note={note} minWidth={520}>
      <div style={{ background: W.page, borderRadius: 8, boxShadow: W.float, border: `1px solid ${W.edge}`, padding: "22px 28px 18px 60px" }}>
        <Part k="title" block={false} badge="left">
          <span style={{ fontSize: 17, fontWeight: 600 }}>{chartTitle}</span>
        </Part>
        <div style={{ display: "flex", marginTop: 20, gap: 10 }}>
          <Part k="numbers" badge="left" style={{ display: "flex", alignItems: "center" }}>
            <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", fontSize: 12.5, color: W.muted, padding: "0 4px" }}>{value}</span>
          </Part>
          <div style={{ flex: 1, borderLeft: `1px solid ${W.edge}`, borderBottom: `1px solid ${W.edge}` }}>
            <Part k="bars" badge="right">
              <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: H, padding: "0 12px" }}>
                {data.map(([n, v]) => (
                  <div key={n} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                    <span style={{ fontSize: 11.5, color: W.ink, marginBottom: 3 }}>£{v.toFixed(2)}</span>
                    <span style={{ width: "70%", height: `${(v / max) * (H - 24)}px`, background: W.excel, borderRadius: "2px 2px 0 0" }} />
                  </div>
                ))}
              </div>
            </Part>
          </div>
        </div>
        <div style={{ marginLeft: 34 }}>
          <Part k="names" badge="right">
            <div style={{ display: "flex", gap: 16, padding: "6px 12px 0" }}>
              {data.map(([n]) => (
                <span key={n} style={{ flex: 1, textAlign: "center", fontSize: 12.5, color: W.body }}>
                  {n}
                </span>
              ))}
            </div>
            <div style={{ textAlign: "center", fontSize: 12.5, color: W.muted, marginTop: 4 }}>{label}</div>
          </Part>
        </div>
      </div>
    </FigureFrame>
  );
}
