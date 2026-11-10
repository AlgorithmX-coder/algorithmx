"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { W } from "../../tokens";
import { cellName, colLetter, display, evaluate, moveRowRefs } from "../formula";
import type { Grid, Path, Tab } from "../types";
import { AppButton, TitleBar } from "../ui";

/* Excel, for the office jobs. A workbook opened from a file is edited in
 * a working copy and only changes the file on Save, as Excel does with
 * AutoSave off. A template (.xltx) opens as a new, unsaved workbook, so
 * Save asks where to put it and the template itself is never overwritten.
 *
 * A workbook has sheets on tabs along the bottom: click to switch, double
 * click to rename, + to add one. Sort A to Z or Z to A sorts the data rows
 * by the selected column (row 1 is the headings), keeping each row's own
 * formulas pointing at itself, and Filter shows only the rows that match
 * one value, without deleting anything.
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
}: {
  doc: ExcelDoc | null;
  /* An edit to the sheets (dirty) or just a switch of tab (not dirty). */
  onChange: (tabs: Tab[], active: number, dirty: boolean) => void;
  onSave: () => void;
  onSaveAs: () => void;
  onClose: () => void;
}) {
  const [sel, setSel] = useState<[number, number]>([1, 0]);
  const [draft, setDraft] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  /* Editing in the formula bar keeps focus there; editing in the cell
   * moves focus into the cell. */
  const [inBar, setInBar] = useState(false);
  const [filterOn, setFilterOn] = useState(false);
  const [filter, setFilter] = useState<{ col: number; value: string } | null>(null);
  const [filterMenu, setFilterMenu] = useState<number | null>(null);
  const [renaming, setRenaming] = useState<{ i: number; name: string } | null>(null);
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

  const setGrid = (next: Grid) => onChange(doc.tabs.map((t, i) => (i === doc.active ? { ...t, grid: next } : t)), doc.active, true);
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
    order.forEach((from, i) => {
      const to = i + 1;
      next[to] = g[from].map((v) => moveRowRefs(v, from, to));
    });
    setGrid(next);
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
  /* Rows on show: the headings always, data rows only when they match the filter. */
  const shown = g.map((_, rr) => rr).filter((rr) => rr === 0 || !filter || display(g, rr, filter.col).trim() === filter.value);
  const at = (rr: number) => shown.indexOf(rr);
  const values = (cc: number) => [...new Set(g.slice(1, lastDataRow(g) + 1).map((_, i) => display(g, i + 1, cc).trim()))].filter(Boolean).sort((a, b) => compare(a, b));

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: W.page, fontFamily: W.font, color: W.ink }}>
      <TitleBar colour={W.excel} app="Excel" name={`${doc.name} · ${doc.dirty ? "Not saved" : "Saved"}`}>
        <span style={{ fontSize: 12.5, opacity: 0.85 }}>AutoSave off</span>
        <button type="button" onClick={onClose} aria-label="Close workbook" style={{ width: 36, height: 32, border: "none", background: "transparent", color: "#fff", fontSize: 17, cursor: "pointer" }}>
          ✕
        </button>
      </TitleBar>

      {/* ribbon */}
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: W.chrome, borderBottom: `1px solid ${W.edge}`, flexWrap: "wrap" }}>
        <AppButton primary colour={W.excel} onClick={() => setMenu((m) => !m)}>
          File ▾
        </AppButton>
        <AppButton onClick={onSave} title="Ctrl+S">
          Save
        </AppButton>
        <AppButton onClick={onSaveAs}>Save as</AppButton>
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
        <span style={{ marginLeft: "auto", fontSize: 13, color: W.muted }}>Enter moves down · Tab moves right · formulas start with =</span>
        {menu && (
          <div role="menu" style={{ position: "absolute", top: "100%", left: 10, zIndex: 20, width: 200, background: W.page, border: `1px solid ${W.edge}`, borderRadius: 6, boxShadow: W.float, padding: 4 }}>
            {(
              [
                ["Save", onSave],
                ["Save as", onSaveAs],
                ["Close", onClose],
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

      {/* the grid */}
      <div
        ref={gridRef}
        tabIndex={0}
        role="grid"
        aria-label={`${tab.name}, cell ${cellName(r, c)}`}
        onKeyDown={gridKey}
        style={{ flex: 1, minHeight: 0, overflow: "auto", position: "relative", outline: "none", background: W.page }}
      >
        <div style={{ position: "relative", width: total, height: (shown.length + 1) * ROW_H, fontSize: 14.5 }}>
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
                const shownText = display(g, rr, cc);
                const v = evaluate(g, rr, cc);
                const numberLike = typeof v === "number" || /^£?-?[0-9][0-9,.]*$/.test(shownText);
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
                      background: rr === 0 && shownText ? "#e6f2ea" : W.page,
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
