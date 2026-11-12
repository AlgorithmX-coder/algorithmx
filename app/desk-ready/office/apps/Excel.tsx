"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { W } from "../../tokens";
import { cellName, colLetter, display, evaluate, moveRowRefs, numeric, shiftRefs } from "../formula";
import { SheetPictureView } from "../paperwork";
import { PlacePicker } from "../places";
import type { Chart, Grid, Highlight, OfficeState, Path, Tab } from "../types";
import { AppButton, Dialog, TitleBar } from "../ui";

/* Excel, for the office jobs. A workbook opened from a file is edited in
 * a working copy and only changes the file on Save, as Excel does with
 * AutoSave off. A template (.xltx) opens as a new, unsaved workbook, so
 * Save asks where to put it and the template itself is never overwritten.
 *
 * A workbook has sheets on tabs along the bottom: click to switch, double
 * click to rename, + to add one. Sort A to Z or Z to A sorts the data rows
 * by the selected column (row 1 is the headings), keeping each row's own
 * formulas pointing at itself, and Filter shows only the rows that match
 * one value, without deleting anything. £ and % show the selected cell as
 * money or a percentage, and Fill down copies the selected cell's formula
 * down to the last row of data, moving its references row by row, as
 * double-clicking Excel's fill handle does.
 *
 * In `practice` mode (a lesson) there is no File, Save or Close: the sheet
 * is the whole task, and the lesson checks it.
 *
 * Keys work as in Excel: type to replace a cell, F2 or a double click to
 * edit it, Enter moves down, Tab moves right, the arrows move, Delete
 * clears, Esc cancels. Formulas are worked out by ../formula. */

export interface ExcelDoc {
  fileId: string | null; // null until a new workbook is first saved
  name: string;
  path: Path | null;
  tabs: Tab[];
  active: number;
  widths: number[];
  dirty: boolean;
}

const ROW_H = 30;
const HEAD_W = 44;
const headerOn = `color-mix(in srgb, ${W.excel} 18%, ${W.sunk})`;

/* The last row with anything in it, so sorting leaves the empty rows below. */
const lastDataRow = (g: Grid) => g.reduce((last, row, i) => (row.some((x) => x.trim() !== "") ? i : last), 0);

function compare(a: string, b: string): number {
  const na = Number(a.replace(/[£,]/g, ""));
  const nb = Number(b.replace(/[£,]/g, ""));
  if (a.trim() === "") return 1;
  if (b.trim() === "") return -1;
  if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
  return a.localeCompare(b, "en-GB", { sensitivity: "base", numeric: true });
}

export default function Excel({
  doc,
  onChange,
  onSave,
  onSaveAs,
  onClose,
  practice,
  office,
  onExportPdf,
}: {
  doc: ExcelDoc | null;
  /* An edit to the sheets (dirty) or just a switch of tab (not dirty). */
  onChange: (tabs: Tab[], active: number, dirty: boolean) => void;
  onSave: () => void;
  onSaveAs: () => void;
  onClose: () => void;
  practice?: boolean;
  /* The office's files, for Insert > Pictures (Module 10). Without it the
   * Pictures button is not shown, as in a lesson. */
  office?: OfficeState;
  /* ── Module 9 ── File > Export > Create PDF: what the sheet shows now
   * (the headings and the rows the filter leaves), as the cells display. */
  onExportPdf?: (rows: string[][], sheet: string) => void;
}) {
  const [sel, setSel] = useState<[number, number]>([1, 0]);
  const [draft, setDraft] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  /* Editing in the formula bar keeps focus there; editing in the cell
   * moves focus into the cell. */
  const [inBar, setInBar] = useState(false);
  const [filterOn, setFilterOn] = useState(false);
  const [filter, setFilter] = useState<{ col: number; value: string } | null>(null);
  const [filterMenu, setFilterMenu] = useState<number | null>(null);
  const [renaming, setRenaming] = useState<{ i: number; name: string } | null>(null);
  const [hlMenu, setHlMenu] = useState(false);
  const [hlAsk, setHlAsk] = useState<{ op: Highlight["op"]; value: string } | null>(null);
  const [chartAsk, setChartAsk] = useState<Chart | null>(null);
  /* Insert > Pictures: the file picker, a "not a picture" warning, and the picture selected on the sheet */
  const [picPick, setPicPick] = useState(false);
  const [picWarn, setPicWarn] = useState<string | null>(null);
  const [picSel, setPicSel] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const editRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (draft !== null && !inBar) editRef.current?.focus();
  }, [draft, inBar]);

  if (!doc) {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", background: W.page }}>
        <TitleBar colour={W.excel} app="Excel" />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: W.font, fontSize: 16, color: W.muted, textAlign: "center" }}>
          No workbook is open. Open one from File Explorer.
        </div>
      </div>
    );
  }

  const tab = doc.tabs[doc.active] ?? doc.tabs[0];
  const g = tab.grid;
  const rows = g.length;
  const cols = g[0]?.length ?? 8;
  const [r, c] = sel;
  const raw = g[r]?.[c] ?? "";

  const formats = tab.formats ?? {};
  const fmt = (rr: number, cc: number) => formats[cellName(rr, cc)];
  const setGrid = (next: Grid, nextFormats: Tab["formats"] = tab.formats) => onChange(doc.tabs.map((t, i) => (i === doc.active ? { ...t, grid: next, formats: nextFormats } : t)), doc.active, true);
  const toggleFormat = (f: "money" | "percent") => {
    const key = cellName(r, c);
    const next = { ...formats };
    if (next[key] === f) delete next[key];
    else next[key] = f;
    setGrid(g, next);
  };
  /* Down as far as the column beside it has data, as Excel's double-click
   * on the fill handle does; the whole list when there's nothing beside. */
  const fillEnd = () => {
    for (const side of [c - 1, c + 1]) {
      if (side < 0 || side >= cols || !(g[r + 1]?.[side] ?? "").trim()) continue;
      let end = r + 1;
      while (end + 1 < rows && (g[end + 1]?.[side] ?? "").trim()) end++;
      return end;
    }
    return lastDataRow(g);
  };
  const fillDown = () => {
    const end = fillEnd();
    if (!raw.trim() || r >= end) return;
    const next = g.map((row) => [...row]);
    const nextFormats = { ...formats };
    for (let rr = r + 1; rr <= end; rr++) {
      next[rr][c] = shiftRefs(raw, rr - r);
      if (formats[cellName(r, c)]) nextFormats[cellName(rr, c)] = formats[cellName(r, c)];
    }
    setGrid(next, nextFormats);
  };
  /* Change the open tab's highlights or chart, keeping everything else. */
  const setTab = (patch: Partial<Tab>) => onChange(doc.tabs.map((t, i) => (i === doc.active ? { ...t, ...patch } : t)), doc.active, true);
  const highlighted = (rr: number, cc: number) =>
    rr > 0 &&
    (tab.highlights ?? []).some((h) => {
      if (h.col !== cc) return false;
      const shown = display(g, rr, cc, fmt(rr, cc)).trim();
      if (!shown) return false;
      const n = numeric(g, rr, cc);
      const want = Number(h.value.replace(/[£,%\s]/g, ""));
      if (h.op !== "=" && n !== null && !Number.isNaN(want)) return h.op === ">" ? n > want : n < want;
      return h.op === "=" && (n !== null && !Number.isNaN(want) ? n === want : shown.toLowerCase() === h.value.trim().toLowerCase());
    });
  const headers = (g[0] ?? []).map((h, i) => ({ i, h: h.trim() || `Column ${colLetter(i)}` }));
  const put = (rr: number, cc: number, value: string) => {
    if ((g[rr]?.[cc] ?? "") === value) return;
    const next = g.map((row) => [...row]);
    next[rr][cc] = value;
    setGrid(next);
  };
  const moveTo = (rr: number, cc: number) => {
    setSel([Math.max(0, Math.min(rows - 1, rr)), Math.max(0, Math.min(cols - 1, cc))]);
  };
  const commit = (dr: number, dc: number) => {
    if (draft !== null) put(r, c, draft);
    setDraft(null);
    moveTo(r + dr, c + dc);
    gridRef.current?.focus();
  };

  const sort = (dir: 1 | -1) => {
    const end = lastDataRow(g);
    if (end < 2) return;
    const order = Array.from({ length: end }, (_, i) => i + 1).sort((a, b) => dir * compare(display(g, a, c), display(g, b, c)) || a - b);
    const next = g.map((row) => [...row]);
    const nextFormats = { ...formats };
    order.forEach((from, i) => {
      const to = i + 1;
      next[to] = g[from].map((v) => moveRowRefs(v, from, to));
      /* a row's formats travel with it */
      for (let cc = 0; cc < cols; cc++) {
        const f = formats[cellName(from, cc)];
        if (f) nextFormats[cellName(to, cc)] = f;
        else delete nextFormats[cellName(to, cc)];
      }
    });
    setGrid(next, nextFormats);
  };

  const switchTab = (i: number) => {
    if (draft !== null) put(r, c, draft);
    setDraft(null);
    setFilter(null);
    setFilterOn(false);
    onChange(doc.tabs, i, doc.dirty);
  };
  const addTab = () => {
    let n = doc.tabs.length + 1;
    while (doc.tabs.some((t) => t.name.toLowerCase() === `sheet${n}`)) n++;
    const blank: Grid = Array.from({ length: rows }, () => Array(cols).fill(""));
    onChange([...doc.tabs, { name: `Sheet${n}`, grid: blank }], doc.tabs.length, true);
    setFilter(null);
    setFilterOn(false);
  };
  const finishRename = () => {
    if (!renaming) return;
    const name = renaming.name.trim();
    if (name && !doc.tabs.some((t, i) => i !== renaming.i && t.name.toLowerCase() === name.toLowerCase())) {
      onChange(doc.tabs.map((t, i) => (i === renaming.i ? { ...t, name } : t)), doc.active, true);
    }
    setRenaming(null);
  };

  const startEdit = (text: string) => {
    setInBar(false);
    setDraft(text);
  };
  const gridKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (draft !== null) return;
    const k = e.key;
    if (picSel !== null && (k === "Delete" || k === "Backspace")) {
      e.preventDefault();
      setTab({ pictures: (tab.pictures ?? []).filter((_, i) => i !== picSel) });
      setPicSel(null);
      return;
    }
    const moves: Record<string, [number, number]> = { ArrowDown: [1, 0], Enter: [1, 0], ArrowUp: [-1, 0], ArrowRight: [0, 1], ArrowLeft: [0, -1], Tab: [0, e.shiftKey ? -1 : 1] };
    if (moves[k]) {
      e.preventDefault();
      moveTo(r + moves[k][0], c + moves[k][1]);
    } else if (k === "Delete" || k === "Backspace") {
      e.preventDefault();
      put(r, c, "");
    } else if (k === "F2") {
      e.preventDefault();
      startEdit(raw);
    } else if ((e.ctrlKey || e.metaKey) && k.toLowerCase() === "s") {
      e.preventDefault();
      onSave();
    } else if (k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      startEdit(k);
    }
  };
  const editKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      commit(e.key === "Enter" ? 1 : 0, e.key === "Tab" ? (e.shiftKey ? -1 : 1) : 0);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setDraft(null);
      gridRef.current?.focus();
    }
  };

  const left = (cc: number) => HEAD_W + doc.widths.slice(0, cc).reduce((a, b) => a + b, 0);
  const total = left(cols);
  /* pictures float to the right of the cells, one under another */
  const pictures = tab.pictures ?? [];
  const PIC_W = 220;
  /* Rows on show: the headings always, data rows only when they match the filter. */
  const shown = g.map((_, rr) => rr).filter((rr) => rr === 0 || !filter || display(g, rr, filter.col, fmt(rr, filter.col)).trim() === filter.value);
  const at = (rr: number) => shown.indexOf(rr);
  const values = (cc: number) => [...new Set(g.slice(1, lastDataRow(g) + 1).map((_, i) => display(g, i + 1, cc, fmt(i + 1, cc)).trim()))].filter(Boolean).sort((a, b) => compare(a, b));

  return (
    <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", background: W.page, fontFamily: W.font, color: W.ink }}>
      <TitleBar colour={W.excel} app="Excel" name={practice ? doc.name : `${doc.name} · ${doc.dirty ? "Not saved" : "Saved"}`}>
        {!practice && <span style={{ fontSize: 12.5, opacity: 0.85 }}>AutoSave off</span>}
        {!practice && (
          <button type="button" onClick={onClose} aria-label="Close workbook" style={{ width: 36, height: 32, border: "none", background: "transparent", color: "#fff", fontSize: 17, cursor: "pointer" }}>
            ✕
          </button>
        )}
      </TitleBar>

      {/* ribbon */}
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: W.chrome, borderBottom: `1px solid ${W.edge}`, flexWrap: "wrap" }}>
        {!practice && (
          <>
            <AppButton primary colour={W.excel} onClick={() => setMenu((m) => !m)}>
              File ▾
            </AppButton>
            <AppButton onClick={onSave} title="Ctrl+S">
              Save
            </AppButton>
            <AppButton onClick={onSaveAs}>Save as</AppButton>
            <span style={{ width: 1, alignSelf: "stretch", background: W.edge, margin: "0 2px" }} />
          </>
        )}
        <AppButton onClick={() => toggleFormat("money")} title="Show the selected cell as money" style={fmt(r, c) === "money" ? { background: W.select, border: `1px solid ${W.excel}` } : undefined}>
          £
        </AppButton>
        <AppButton onClick={() => toggleFormat("percent")} title="Show the selected cell as a percentage" style={fmt(r, c) === "percent" ? { background: W.select, border: `1px solid ${W.excel}` } : undefined}>
          %
        </AppButton>
        <AppButton onClick={fillDown} disabled={!raw.trim().startsWith("=")} title="Copy this formula down to the last row of data">
          ⇩ Fill down
        </AppButton>
        <span style={{ width: 1, alignSelf: "stretch", background: W.edge, margin: "0 2px" }} />
        <AppButton onClick={() => sort(1)} title={`Sort the rows by column ${colLetter(c)}, smallest or A first`}>
          Sort A→Z
        </AppButton>
        <AppButton onClick={() => sort(-1)} title={`Sort the rows by column ${colLetter(c)}, largest or Z first`}>
          Sort Z→A
        </AppButton>
        <AppButton
          onClick={() => {
            setFilterOn((f) => !f);
            setFilter(null);
            setFilterMenu(null);
          }}
          style={filterOn ? { background: W.select, border: `1px solid ${W.excel}` } : undefined}
        >
          ⏷ Filter
        </AppButton>
        <span style={{ width: 1, alignSelf: "stretch", background: W.edge, margin: "0 2px" }} />
        <span style={{ position: "relative" }}>
          <AppButton onClick={() => setHlMenu((m) => !m)} title={`Colour cells in column ${colLetter(c)} that match a rule`} style={(tab.highlights ?? []).length ? { background: "#fde7e9", border: "1px solid #c4314b" } : undefined}>
            🖍 Highlight ▾
          </AppButton>
          {hlMenu && (
            <span role="menu" style={{ position: "absolute", top: "100%", left: 0, zIndex: 20, marginTop: 4, width: 240, background: W.page, border: `1px solid ${W.edge}`, borderRadius: 6, boxShadow: W.float, padding: 4, display: "block" }}>
              {(
                [
                  [">", "Greater than…"],
                  ["<", "Less than…"],
                  ["=", "Equal to…"],
                ] as const
              ).map(([op, label]) => (
                <button
                  key={op}
                  type="button"
                  role="menuitem"
                  className="of-row"
                  onClick={() => {
                    setHlMenu(false);
                    setHlAsk({ op, value: "" });
                  }}
                  style={menuItem}
                >
                  {label} <span style={{ color: W.muted }}>in column {colLetter(c)}</span>
                </button>
              ))}
              <button
                type="button"
                role="menuitem"
                className="of-row"
                onClick={() => {
                  setHlMenu(false);
                  setTab({ highlights: [] });
                }}
                style={menuItem}
              >
                Clear highlights
              </button>
            </span>
          )}
        </span>
        <AppButton onClick={() => setChartAsk(tab.chart ?? { title: "", labelCol: 0, valueCol: Math.min(1, cols - 1) })} title="Make a bar chart from two columns">
          📊 {tab.chart ? "Edit chart" : "Chart"}
        </AppButton>
        {office && (
          <AppButton onClick={() => setPicPick(true)} title="Put a picture on the sheet, such as a photo of a receipt">
            🖼 Pictures
          </AppButton>
        )}
        <span style={{ marginLeft: "auto", fontSize: 13, color: W.muted }}>Enter moves down · Tab moves right · formulas start with =</span>
        {menu && (
          <div role="menu" style={{ position: "absolute", top: "100%", left: 10, zIndex: 20, width: 220, background: W.page, border: `1px solid ${W.edge}`, borderRadius: 6, boxShadow: W.float, padding: 4 }}>
            {(
              [
                ["Save", onSave],
                ["Save as", onSaveAs],
              ] as const
            ).map(([label, fn]) => (
              <button
                key={label}
                type="button"
                role="menuitem"
                className="of-row"
                onClick={() => {
                  setMenu(false);
                  fn();
                }}
                style={{ width: "100%", minHeight: 40, textAlign: "left", padding: "6px 12px", border: "none", background: "transparent", fontFamily: W.font, fontSize: 15, borderRadius: 4 }}
              >
                {label}
              </button>
            ))}
            {onExportPdf && (
              <>
                <button type="button" role="menuitem" aria-expanded={exportOpen} className="of-row" onClick={() => setExportOpen((o) => !o)} style={{ width: "100%", minHeight: 40, display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left", padding: "6px 12px", border: "none", background: "transparent", fontFamily: W.font, fontSize: 15, borderRadius: 4 }}>
                  Export <span style={{ color: W.muted }}>{exportOpen ? "▾" : "›"}</span>
                </button>
                {exportOpen && (
                  <button
                    type="button"
                    role="menuitem"
                    className="of-row"
                    onClick={() => {
                      setMenu(false);
                      setExportOpen(false);
                      onExportPdf(
                        shown.map((rr) => g[rr].map((_, cc) => display(g, rr, cc, fmt(rr, cc)))),
                        tab.name,
                      );
                    }}
                    style={{ width: "100%", minHeight: 40, textAlign: "left", padding: "6px 12px 6px 28px", border: "none", background: "transparent", fontFamily: W.font, fontSize: 15, borderRadius: 4 }}
                  >
                    Create PDF
                  </button>
                )}
              </>
            )}
            <button
              type="button"
              role="menuitem"
              className="of-row"
              onClick={() => {
                setMenu(false);
                onClose();
              }}
              style={{ width: "100%", minHeight: 40, textAlign: "left", padding: "6px 12px", border: "none", background: "transparent", fontFamily: W.font, fontSize: 15, borderRadius: 4 }}
            >
              Close
            </button>
          </div>
        )}
      </div>

      {/* name box and formula bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderBottom: `1px solid ${W.edge}` }}>
        <span aria-label="Selected cell" style={{ width: 74, minHeight: 32, display: "inline-flex", alignItems: "center", padding: "0 8px", border: `1px solid ${W.edge}`, fontSize: 15, boxSizing: "border-box" }}>
          {cellName(r, c)}
        </span>
        <i style={{ fontFamily: "serif", color: W.muted }}>fx</i>
        <input
          aria-label="Formula bar"
          value={draft ?? raw}
          onFocus={() => setInBar(true)}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={editKey}
          style={{ flex: 1, minWidth: 0, minHeight: 32, border: `1px solid ${W.edge}`, padding: "0 10px", fontFamily: "Consolas, ui-monospace, monospace", fontSize: 15, color: W.ink, background: W.page }}
        />
      </div>
      {filter && (
        <div role="status" style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 12px", background: "#fff4ce", fontSize: 14, borderBottom: `1px solid ${W.edge}` }}>
          Showing only rows where {g[0]?.[filter.col] || `column ${colLetter(filter.col)}`} is &ldquo;{filter.value}&rdquo; ({shown.length - 1} of {lastDataRow(g)}).
          <AppButton onClick={() => setFilter(null)} style={{ minHeight: 32, padding: "2px 10px" }}>
            Clear filter
          </AppButton>
        </div>
      )}

      {/* the grid, and the chart beside it when there is one */}
      <div style={{ flex: 1, minHeight: 0, display: "flex", position: "relative" }}>
      <div
        ref={gridRef}
        tabIndex={0}
        role="grid"
        aria-label={`${tab.name}, cell ${cellName(r, c)}`}
        onKeyDown={gridKey}
        style={{ flex: 1, minWidth: 0, minHeight: 0, overflow: "auto", position: "relative", outline: "none", background: W.page }}
      >
        <div style={{ position: "relative", width: total + (pictures.length ? PIC_W + 40 : 0), height: Math.max((shown.length + 1) * ROW_H, pictures.length * 300 + ROW_H), fontSize: 14.5 }}>
          {/* column letters */}
          <div style={{ position: "sticky", top: 0, zIndex: 3, height: ROW_H, width: total }}>
            <span style={{ position: "absolute", left: 0, top: 0, width: HEAD_W, height: ROW_H, background: W.sunk, borderRight: `1px solid ${W.edge}`, borderBottom: `1px solid ${W.edge}` }} />
            {Array.from({ length: cols }, (_, cc) => (
              <span
                key={cc}
                style={{ position: "absolute", left: left(cc), top: 0, width: doc.widths[cc], height: ROW_H, display: "flex", alignItems: "center", justifyContent: "center", background: cc === c ? headerOn : W.sunk, color: cc === c ? W.excel : W.muted, fontWeight: cc === c ? 700 : 400, borderRight: `1px solid ${W.edge}`, borderBottom: `1px solid ${W.edge}`, fontSize: 13.5 }}
              >
                {colLetter(cc)}
              </span>
            ))}
          </div>
          {shown.map((rr) => (
            <div key={rr} style={{ position: "absolute", left: 0, top: (at(rr) + 1) * ROW_H, height: ROW_H, width: total }}>
              <span style={{ position: "absolute", left: 0, width: HEAD_W, height: ROW_H, display: "flex", alignItems: "center", justifyContent: "center", background: rr === r ? headerOn : W.sunk, color: filter && rr > 0 ? "#0f6cbd" : rr === r ? W.excel : W.muted, fontWeight: rr === r ? 700 : 400, borderRight: `1px solid ${W.edge}`, borderBottom: `1px solid ${W.edge}`, fontSize: 13.5 }}>
                {rr + 1}
              </span>
              {g[rr].map((_, cc) => {
                const shownText = display(g, rr, cc, fmt(rr, cc));
                const v = evaluate(g, rr, cc);
                const numberLike = typeof v === "number" || /^-?£?-?[0-9][0-9,.]*%?$/.test(shownText);
                const on = rr === r && cc === c;
                return (
                  <span
                    key={cc}
                    role="gridcell"
                    aria-selected={on}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      if (draft !== null) put(r, c, draft);
                      setDraft(null);
                      setPicSel(null);
                      setSel([rr, cc]);
                      gridRef.current?.focus();
                    }}
                    onDoubleClick={() => startEdit(g[rr][cc])}
                    style={{
                      position: "absolute",
                      left: left(cc),
                      width: doc.widths[cc],
                      height: ROW_H,
                      boxSizing: "border-box",
                      padding: rr === 0 && filterOn ? "0 28px 0 6px" : "0 6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: numberLike && rr > 0 ? "flex-end" : "flex-start",
                      borderRight: `1px solid ${W.edge}`,
                      borderBottom: `1px solid ${W.edge}`,
                      background: rr === 0 && shownText ? "#e6f2ea" : highlighted(rr, cc) ? "#fde2e4" : W.page,
                      color: highlighted(rr, cc) ? "#9c1c2c" : undefined,
                      fontWeight: rr === 0 ? 700 : 400,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      cursor: "cell",
                      outline: on ? `2px solid ${W.excel}` : "none",
                      outlineOffset: -2,
                      zIndex: on ? 2 : 1,
                    }}
                  >
                    {shownText}
                  </span>
                );
              })}
              {rr === 0 &&
                filterOn &&
                g[0].map((h, cc) =>
                  h.trim() ? (
                    <button
                      key={`f${cc}`}
                      type="button"
                      aria-label={`Filter ${h}`}
                      onClick={() => setFilterMenu(filterMenu === cc ? null : cc)}
                      style={{ position: "absolute", zIndex: 3, left: left(cc) + doc.widths[cc] - 26, top: 4, width: 22, height: 22, border: `1px solid ${W.edge}`, borderRadius: 3, background: filter?.col === cc ? W.select : W.page, fontSize: 11, cursor: "pointer", padding: 0 }}
                    >
                      ▾
                    </button>
                  ) : null,
                )}
            </div>
          ))}
          {filterMenu !== null && (
            <div role="menu" aria-label="Show only" style={{ position: "absolute", zIndex: 6, left: Math.max(HEAD_W, left(filterMenu) + doc.widths[filterMenu] - 220), top: 2 * ROW_H, width: 220, maxHeight: 260, overflowY: "auto", background: W.page, border: `1px solid ${W.edge}`, borderRadius: 6, boxShadow: W.float, padding: 4 }}>
              <button
                type="button"
                role="menuitem"
                className="of-row"
                onClick={() => {
                  setFilter(null);
                  setFilterMenu(null);
                }}
                style={menuItem}
              >
                (Show everything)
              </button>
              {values(filterMenu).map((v) => (
                <button
                  key={v}
                  type="button"
                  role="menuitem"
                  className="of-row"
                  onClick={() => {
                    setFilter({ col: filterMenu, value: v });
                    setFilterMenu(null);
                  }}
                  style={{ ...menuItem, fontWeight: filter?.col === filterMenu && filter.value === v ? 700 : 400 }}
                >
                  {v}
                </button>
              ))}
            </div>
          )}
          {pictures.map((p, i) => (
            <div
              key={`${p.fileId}-${i}`}
              role="img"
              aria-label={`Picture: ${p.name}`}
              onMouseDown={(e) => {
                e.preventDefault();
                setPicSel(i);
                gridRef.current?.focus();
              }}
              style={{ position: "absolute", zIndex: 5, left: total + 20, top: ROW_H + 10 + i * 300, width: PIC_W, cursor: "move", outline: picSel === i ? `2px solid ${W.excel}` : "none", outlineOffset: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.25)" }}
            >
              <SheetPictureView paper={p.paper} name={p.name} width={PIC_W} />
              {picSel === i && (
                <span style={{ position: "absolute", left: 0, right: 0, top: "100%", marginTop: 6, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, fontFamily: W.font, fontSize: 12.5, color: W.muted }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                  <button
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={() => {
                      setTab({ pictures: pictures.filter((_, j) => j !== i) });
                      setPicSel(null);
                    }}
                    style={{ minHeight: 30, padding: "2px 10px", border: `1px solid ${W.edge}`, borderRadius: 4, background: W.page, fontFamily: W.font, fontSize: 13, cursor: "pointer", color: W.ink }}
                  >
                    Delete picture
                  </button>
                </span>
              )}
            </div>
          ))}
          {draft !== null && !inBar && at(r) >= 0 && (
            <input
              ref={editRef}
              aria-label={`Editing ${cellName(r, c)}`}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={editKey}
              onBlur={() => {
                if (draft !== null) put(r, c, draft);
                setDraft(null);
              }}
              style={{ position: "absolute", zIndex: 4, left: left(c), top: (at(r) + 1) * ROW_H, width: Math.max(doc.widths[c], 140), height: ROW_H, boxSizing: "border-box", border: `2px solid ${W.excel}`, padding: "0 5px", fontFamily: W.font, fontSize: 14.5, color: W.ink, background: W.page, outline: "none" }}
            />
          )}
        </div>
      </div>
      {tab.chart && <BarChart g={g} chart={tab.chart} fmt={fmt} onEdit={() => setChartAsk(tab.chart ?? null)} />}
      </div>

      {hlAsk && (
        <Dialog title={`Highlight cells in column ${colLetter(c)}`} onClose={() => setHlAsk(null)} width={460}>
          <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15.5 }}>
            <span>{hlAsk.op === ">" ? "Greater than" : hlAsk.op === "<" ? "Less than" : "Equal to"}</span>
            <input
              autoFocus
              aria-label="Value"
              value={hlAsk.value}
              onChange={(e) => setHlAsk({ ...hlAsk, value: e.target.value })}
              style={{ flex: 1, minHeight: 40, padding: "6px 10px", border: `1px solid ${W.faint}`, borderRadius: 4, fontFamily: W.font, fontSize: 16 }}
            />
          </label>
          <p style={{ margin: "10px 0 0", fontSize: 14, color: W.muted }}>Cells in {headers[c]?.h ?? `column ${colLetter(c)}`} that match turn red, from row 2 down.</p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
            <AppButton onClick={() => setHlAsk(null)}>Cancel</AppButton>
            <AppButton
              primary
              colour={W.excel}
              disabled={!hlAsk.value.trim()}
              onClick={() => {
                setTab({ highlights: [...(tab.highlights ?? []).filter((h) => h.col !== c), { col: c, op: hlAsk.op, value: hlAsk.value.trim() }] });
                setHlAsk(null);
              }}
            >
              OK
            </AppButton>
          </div>
        </Dialog>
      )}
      {chartAsk && (
        <Dialog title={tab.chart ? "Edit chart" : "Insert a bar chart"} onClose={() => setChartAsk(null)} width={520}>
          {(
            [
              ["Names along the bottom", "labelCol"],
              ["Numbers up the side", "valueCol"],
            ] as const
          ).map(([label, key]) => (
            <label key={key} style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, fontSize: 15.5 }}>
              <span style={{ width: 200 }}>{label}</span>
              <select aria-label={label} value={chartAsk[key]} onChange={(e) => setChartAsk({ ...chartAsk, [key]: Number(e.target.value) })} style={{ flex: 1, minHeight: 40, padding: "4px 8px", border: `1px solid ${W.faint}`, borderRadius: 4, fontFamily: W.font, fontSize: 15.5 }}>
                {headers.map((h) => (
                  <option key={h.i} value={h.i}>
                    {colLetter(h.i)}: {h.h}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, fontSize: 15.5 }}>
            <span style={{ width: 200 }}>Chart title</span>
            <input aria-label="Chart title" value={chartAsk.title} onChange={(e) => setChartAsk({ ...chartAsk, title: e.target.value })} placeholder="Say what it shows" style={{ flex: 1, minHeight: 40, padding: "6px 10px", border: `1px solid ${W.faint}`, borderRadius: 4, fontFamily: W.font, fontSize: 16 }} />
          </label>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
            {tab.chart && (
              <AppButton
                onClick={() => {
                  setTab({ chart: undefined });
                  setChartAsk(null);
                }}
                style={{ marginRight: "auto" }}
              >
                Remove chart
              </AppButton>
            )}
            <AppButton onClick={() => setChartAsk(null)}>Cancel</AppButton>
            <AppButton
              primary
              colour={W.excel}
              onClick={() => {
                setTab({ chart: { ...chartAsk, title: chartAsk.title.trim() } });
                setChartAsk(null);
              }}
            >
              OK
            </AppButton>
          </div>
        </Dialog>
      )}

      {picPick && office && (
        <PlacePicker
          state={office}
          mode={{ kind: "file", title: "Insert picture", action: "Insert", at: ["OneDrive", "Downloads"] as Path }}
          onCancel={() => setPicPick(false)}
          onFile={(f) => {
            setPicPick(false);
            if (f.kind !== "jpg") return setPicWarn(`"${f.name}" isn't a picture, so it can't go on the sheet. Pick a photo: its name ends in .jpg.`);
            setTab({ pictures: [...pictures, { fileId: f.id, name: f.name, paper: f.paper }] });
            setPicSel(pictures.length);
          }}
        />
      )}
      {picWarn && (
        <Dialog title="Insert picture" onClose={() => setPicWarn(null)} width={480}>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5 }}>{picWarn}</p>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <AppButton primary colour={W.excel} onClick={() => setPicWarn(null)}>
              OK
            </AppButton>
          </div>
        </Dialog>
      )}

      {/* sheet tabs */}
      <div style={{ display: "flex", alignItems: "stretch", minHeight: 36, background: W.chrome, borderTop: `1px solid ${W.edge}`, fontSize: 14, paddingLeft: HEAD_W - 8 }}>
        {doc.tabs.map((t, i) =>
          renaming?.i === i ? (
            <input
              key={i}
              autoFocus
              aria-label="Sheet name"
              value={renaming.name}
              onChange={(e) => setRenaming({ i, name: e.target.value })}
              onBlur={finishRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") finishRename();
                if (e.key === "Escape") setRenaming(null);
              }}
              style={{ width: 130, margin: "3px 2px", padding: "0 8px", border: `2px solid ${W.excel}`, fontFamily: W.font, fontSize: 14 }}
            />
          ) : (
            <button
              key={i}
              type="button"
              onClick={() => switchTab(i)}
              onDoubleClick={() => setRenaming({ i, name: t.name })}
              title="Double-click to rename"
              aria-pressed={i === doc.active}
              style={{ minHeight: 36, padding: "0 16px", border: "none", borderBottom: i === doc.active ? `3px solid ${W.excel}` : "3px solid transparent", background: i === doc.active ? W.page : "transparent", color: i === doc.active ? W.excel : W.ink, fontWeight: i === doc.active ? 700 : 400, fontFamily: W.font, fontSize: 14, cursor: "pointer" }}
            >
              {t.name}
            </button>
          ),
        )}
        <button type="button" onClick={addTab} aria-label="New sheet" title="New sheet" style={{ width: 40, border: "none", background: "transparent", fontSize: 20, color: W.muted, cursor: "pointer" }}>
          ⊕
        </button>
        <span style={{ marginLeft: "auto", padding: "0 14px", display: "flex", alignItems: "center", color: W.muted }}>{doc.path ? doc.path.join(" > ") : "Not saved yet"}</span>
      </div>
    </div>
  );
}

const menuItem = { width: "100%", minHeight: 38, textAlign: "left", padding: "6px 12px", border: "none", background: "transparent", fontFamily: W.font, fontSize: 14.5, borderRadius: 4 } as const;

/* The tab's bar chart, in a panel beside the grid: a bar for each row that
 * has a name and a number, the title on top, and the two headings as the
 * axis titles, the way Excel's quick chart labels them. */
function BarChart({ g, chart, fmt, onEdit }: { g: Grid; chart: Chart; fmt: (r: number, c: number) => "money" | "percent" | undefined; onEdit: () => void }) {
  const bars = g
    .slice(1)
    .map((row, i) => ({ label: (row[chart.labelCol] ?? "").trim(), n: numeric(g, i + 1, chart.valueCol), shown: display(g, i + 1, chart.valueCol, fmt(i + 1, chart.valueCol)) }))
    .filter((b): b is { label: string; n: number; shown: string } => !!b.label && b.n !== null);
  const max = Math.max(1, ...bars.map((b) => b.n));
  const H = 180;
  const bw = bars.length ? Math.min(46, 240 / bars.length) : 40;
  return (
    <aside aria-label={`Chart: ${chart.title || "untitled"}`} style={{ width: 340, flexShrink: 0, borderLeft: `1px solid ${W.edge}`, background: W.page, padding: "12px 14px", overflowY: "auto", fontFamily: W.font }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <b style={{ flex: 1, fontSize: 15, fontWeight: 600, color: chart.title ? W.ink : W.faint, lineHeight: 1.3 }}>{chart.title || "Chart title"}</b>
        <AppButton onClick={onEdit} style={{ minHeight: 32, padding: "2px 10px", fontSize: 13.5 }}>
          Edit
        </AppButton>
      </div>
      <svg width="312" height={H + 70} role="img" aria-hidden style={{ display: "block", marginTop: 10 }}>
        <text x="10" y={H / 2 + 10} fontSize="11.5" fill={W.muted} transform={`rotate(-90 10 ${H / 2 + 10})`} textAnchor="middle">
          {(g[0]?.[chart.valueCol] ?? "").trim()}
        </text>
        <line x1="30" y1="10" x2="30" y2={H + 10} stroke={W.edge} />
        <line x1="30" y1={H + 10} x2="306" y2={H + 10} stroke={W.edge} />
        {bars.map((b, i) => {
          const x = 40 + i * (bw + 8);
          const h = Math.max(1, (b.n / max) * (H - 20));
          return (
            <g key={i}>
              <rect x={x} y={H + 10 - h} width={bw} height={h} rx="2" fill={W.excel} />
              <text x={x + bw / 2} y={H + 4 - h} fontSize="10" textAnchor="middle" fill={W.ink}>
                {b.shown}
              </text>
              <text x={x + bw / 2} y={H + 24} fontSize="10.5" textAnchor="end" fill={W.body} transform={`rotate(-35 ${x + bw / 2} ${H + 24})`}>
                {b.label.length > 14 ? `${b.label.slice(0, 13)}…` : b.label}
              </text>
            </g>
          );
        })}
      </svg>
      <p style={{ margin: "2px 0 0", textAlign: "center", fontSize: 11.5, color: W.muted }}>{(g[0]?.[chart.labelCol] ?? "").trim()}</p>
    </aside>
  );
}
