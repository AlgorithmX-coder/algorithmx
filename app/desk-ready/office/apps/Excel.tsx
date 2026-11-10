"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { W } from "../../tokens";
import { cellName, colLetter, display, evaluate } from "../formula";
import type { Grid, Path } from "../types";
import { AppButton, TitleBar } from "../ui";

/* Excel, for the office jobs. A workbook opened from a file is edited in
 * a working copy and only changes the file on Save, as Excel does with
 * AutoSave off. A template (.xltx) opens as a new, unsaved workbook, so
 * Save asks where to put it and the template itself is never overwritten.
 *
 * Keys work as in Excel: type to replace a cell, F2 or a double click to
 * edit it, Enter moves down, Tab moves right, the arrows move, Delete
 * clears, Esc cancels. Formulas are worked out by ../formula. */

export interface ExcelDoc {
  fileId: string | null; // null until a new workbook is first saved
  name: string;
  path: Path | null;
  sheet: Grid;
  widths: number[];
  dirty: boolean;
}

const ROW_H = 30;
const HEAD_W = 44;
const headerOn = `color-mix(in srgb, ${W.excel} 18%, ${W.sunk})`;

export default function Excel({
  doc,
  onEdit,
  onSave,
  onSaveAs,
  onClose,
}: {
  doc: ExcelDoc | null;
  onEdit: (g: Grid) => void;
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

  const g = doc.sheet;
  const rows = g.length;
  const cols = g[0]?.length ?? 8;
  const [r, c] = sel;
  const raw = g[r]?.[c] ?? "";

  const put = (rr: number, cc: number, value: string) => {
    if ((g[rr]?.[cc] ?? "") === value) return;
    const next = g.map((row) => [...row]);
    next[rr][cc] = value;
    onEdit(next);
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

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: W.page, fontFamily: W.font, color: W.ink }}>
      <TitleBar colour={W.excel} app="Excel" name={`${doc.name} · ${doc.dirty ? "Not saved" : "Saved"}`}>
        <span style={{ fontSize: 12.5, opacity: 0.85 }}>AutoSave off</span>
        <button type="button" onClick={onClose} aria-label="Close workbook" style={{ width: 36, height: 32, border: "none", background: "transparent", color: "#fff", fontSize: 17, cursor: "pointer" }}>
          ✕
        </button>
      </TitleBar>

      {/* ribbon: File menu and a reminder of the keys */}
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: W.chrome, borderBottom: `1px solid ${W.edge}`, flexWrap: "wrap" }}>
        <AppButton primary colour={W.excel} onClick={() => setMenu((m) => !m)}>
          File ▾
        </AppButton>
        <AppButton onClick={onSave} title="Ctrl+S">
          Save
        </AppButton>
        <AppButton onClick={onSaveAs}>Save as</AppButton>
        <span style={{ marginLeft: "auto", fontSize: 13, color: W.muted }}>Type in a cell · Enter moves down · Tab moves right · formulas start with =</span>
        {menu && (
          <div role="menu" style={{ position: "absolute", top: "100%", left: 10, zIndex: 20, width: 200, background: W.page, border: `1px solid ${W.edge}`, borderRadius: 6, boxShadow: W.float, padding: 4 }}>
            {[
              ["Save", onSave],
              ["Save as", onSaveAs],
              ["Close", onClose],
            ].map(([label, fn]) => (
              <button
                key={label as string}
                type="button"
                role="menuitem"
                className="of-row"
                onClick={() => {
                  setMenu(false);
                  (fn as () => void)();
                }}
                style={{ width: "100%", minHeight: 40, textAlign: "left", padding: "6px 12px", border: "none", background: "transparent", fontFamily: W.font, fontSize: 15, borderRadius: 4 }}
              >
                {label as string}
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

      {/* the grid */}
      <div
        ref={gridRef}
        tabIndex={0}
        role="grid"
        aria-label={`Sheet, cell ${cellName(r, c)}`}
        onKeyDown={gridKey}
        style={{ flex: 1, minHeight: 0, overflow: "auto", position: "relative", outline: "none", background: W.page }}
      >
        <div style={{ position: "relative", width: total, height: (rows + 1) * ROW_H, fontSize: 14.5 }}>
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
          {g.map((row, rr) => (
            <div key={rr} style={{ position: "absolute", left: 0, top: (rr + 1) * ROW_H, height: ROW_H, width: total }}>
              <span style={{ position: "absolute", left: 0, width: HEAD_W, height: ROW_H, display: "flex", alignItems: "center", justifyContent: "center", background: rr === r ? headerOn : W.sunk, color: rr === r ? W.excel : W.muted, fontWeight: rr === r ? 700 : 400, borderRight: `1px solid ${W.edge}`, borderBottom: `1px solid ${W.edge}`, fontSize: 13.5 }}>
                {rr + 1}
              </span>
              {row.map((_, cc) => {
                const shown = display(g, rr, cc);
                const v = evaluate(g, rr, cc);
                const numberLike = typeof v === "number" || /^£?-?[0-9][0-9,.]*$/.test(shown);
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
                      padding: "0 6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: numberLike && rr > 0 ? "flex-end" : "flex-start",
                      borderRight: `1px solid ${W.edge}`,
                      borderBottom: `1px solid ${W.edge}`,
                      background: rr === 0 && shown ? "#e6f2ea" : W.page,
                      fontWeight: rr === 0 ? 700 : 400,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      cursor: "cell",
                      outline: on ? `2px solid ${W.excel}` : "none",
                      outlineOffset: -2,
                      zIndex: on ? 2 : 1,
                    }}
                  >
                    {shown}
                  </span>
                );
              })}
            </div>
          ))}
          {draft !== null && !inBar && (
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
              style={{ position: "absolute", zIndex: 4, left: left(c), top: (r + 1) * ROW_H, width: Math.max(doc.widths[c], 140), height: ROW_H, boxSizing: "border-box", border: `2px solid ${W.excel}`, padding: "0 5px", fontFamily: W.font, fontSize: 14.5, color: W.ink, background: W.page, outline: "none" }}
            />
          )}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "stretch", minHeight: 32, background: W.chrome, borderTop: `1px solid ${W.edge}`, fontSize: 14 }}>
        <span style={{ padding: "0 18px", display: "flex", alignItems: "center", background: W.page, color: W.excel, fontWeight: 700, borderBottom: `3px solid ${W.excel}`, marginLeft: HEAD_W }}>Sheet1</span>
        <span style={{ marginLeft: "auto", padding: "0 14px", display: "flex", alignItems: "center", color: W.muted }}>{doc.path ? doc.path.join(" > ") : "Not saved yet"}</span>
      </div>
    </div>
  );
}
