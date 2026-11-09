"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { D } from "../tokens";
import type { LabProps } from "./types";
import { Button, Cross, StepBar, Tick } from "./ui";

/* SheetLab: a pretend Excel sheet the learner types business data into.
 * Drawn in code (green title bar, name box, formula bar, column letters,
 * row numbers) so the real thing looks familiar later. Every cell is a
 * real input, so it works with a mouse, a keyboard or a finger: Enter
 * and the arrow keys move like Excel, Tab moves right.
 *
 * Sort moves whole rows, as Excel does, and Filter hides rows without
 * deleting them. Row 1 is the header row. A lesson supplies the starting
 * sheet, which cells are locked, and the checks to run on "Check my
 * sheet". Paperwork, when a task has it, sits above the sheet so the sheet
 * keeps the full width. Nothing is saved anywhere: it is practice. */

export type Grid = string[][];

export interface SheetView {
  /* Filter: show only data rows whose cell in `col` equals `value`. */
  filter: { col: number; value: string } | null;
}

export interface SheetRule {
  label: string;
  test: (g: Grid, v: SheetView) => boolean;
  hint: string;
}

export interface SheetTask {
  scenario: string;
  /* Shown in the title bar, e.g. "Deliveries.xlsx". */
  file: string;
  cols: number;
  rows: number;
  initial: Grid;
  /* Cells the learner cannot change, e.g. the given headings. */
  locked?: (r: number, c: number) => boolean;
  /* Paperwork shown beside the sheet (a delivery note, a list). */
  paper?: { title: string; lines: string[] };
  tools?: { sort?: boolean; filter?: boolean };
  rules: SheetRule[];
}

export const colLetter = (c: number) => String.fromCharCode(65 + c);
export const cellName = (r: number, c: number) => `${colLetter(c)}${r + 1}`;

/* Helpers lessons use in their checks. Row 0 is the header row. */
export const cell = (g: Grid, r: number, c: number) => (g[r]?.[c] ?? "").trim();
export const dataRows = (g: Grid) => g.slice(1).filter((row) => row.some((x) => x.trim() !== ""));
export const column = (g: Grid, c: number) => dataRows(g).map((row) => (row[c] ?? "").trim());

function blank(rows: number, cols: number, initial: Grid): Grid {
  return Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => initial[r]?.[c] ?? ""));
}

function compare(a: string, b: string): number {
  const na = Number(a.replace(/,/g, ""));
  const nb = Number(b.replace(/,/g, ""));
  if (a !== "" && b !== "" && !Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
  return a.localeCompare(b, "en-GB", { sensitivity: "base" });
}

const toolSelect: CSSProperties = { minHeight: 40, borderRadius: 8, border: `1px solid ${D.edge}`, background: D.panel, fontFamily: D.sans, fontSize: 15.5, color: D.ink, padding: "4px 8px" };

function Sheet({ task, grid, setGrid, view, setView }: { task: SheetTask; grid: Grid; setGrid: (g: Grid) => void; view: SheetView; setView: (v: SheetView) => void }) {
  /* Start on the first cell the learner is meant to type in (row 1 when
   * the task is the headings), falling back to A2 when all are locked. */
  const [at, setAt] = useState<{ r: number; c: number }>(() => {
    for (let r = 0; r < task.rows; r++) for (let c = 0; c < task.cols; c++) if (!(task.locked?.(r, c) ?? false)) return { r, c };
    return { r: 1, c: 0 };
  });
  const refs = useRef<(HTMLInputElement | null)[][]>([]);
  const [sortCol, setSortCol] = useState(0);
  const [filterCol, setFilterCol] = useState(0);

  const headers = grid[0].map((h, c) => h.trim() || `Column ${colLetter(c)}`);
  const visible = (r: number) => r === 0 || !view.filter || (grid[r][view.filter.col] ?? "").trim() === view.filter.value;

  function move(r: number, c: number) {
    if (r < 0 || r >= task.rows || c < 0 || c >= task.cols) return;
    refs.current[r]?.[c]?.focus();
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>, r: number, c: number) {
    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      move(r + 1, c);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      move(r - 1, c);
    }
  }

  function edit(r: number, c: number, value: string) {
    setGrid(grid.map((row, i) => (i === r ? row.map((x, j) => (j === c ? value : x)) : row)));
  }

  function sort() {
    const head = grid[0];
    const body = grid.slice(1);
    const filled = body.filter((row) => row.some((x) => x.trim() !== ""));
    const empty = body.filter((row) => row.every((x) => x.trim() === ""));
    filled.sort((a, b) => compare((a[sortCol] ?? "").trim(), (b[sortCol] ?? "").trim()));
    setGrid([head, ...filled, ...empty]);
  }

  const filterValues = Array.from(new Set(column(grid, filterCol).filter(Boolean))).sort((a, b) => compare(a, b));

  return (
    <div style={{ border: `1px solid ${D.edge}`, borderRadius: 12, overflow: "hidden", background: D.panel, boxShadow: D.lift }}>
      <div style={{ background: D.excel, color: D.onAccent, padding: "8px 14px", fontSize: 14, fontWeight: 700, display: "flex", justifyContent: "space-between", gap: 10 }}>
        <span>{task.file}</span>
        <span style={{ fontWeight: 400, opacity: 0.9 }}>Practice only</span>
      </div>

      {(task.tools?.sort || task.tools?.filter) && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", padding: "10px 12px", borderBottom: `1px solid ${D.edge}`, background: D.panelSoft }}>
          {task.tools?.sort && (
            <span style={{ display: "inline-flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
              <label style={{ fontSize: 15.5, fontWeight: 700, color: D.ink }}>
                Sort by{" "}
                <select aria-label="Sort by column" value={sortCol} onChange={(e) => setSortCol(Number(e.target.value))} style={toolSelect}>
                  {headers.map((h, c) => (
                    <option key={c} value={c}>
                      {h}
                    </option>
                  ))}
                </select>
              </label>
              <Button kind="secondary" onClick={sort} style={{ minHeight: 40, padding: "6px 14px", fontSize: 15.5 }}>
                Sort A to Z
              </Button>
            </span>
          )}
          {task.tools?.filter && (
            <span style={{ display: "inline-flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
              <label style={{ fontSize: 15.5, fontWeight: 700, color: D.ink }}>
                Filter{" "}
                <select aria-label="Filter column" value={filterCol} onChange={(e) => setFilterCol(Number(e.target.value))} style={toolSelect}>
                  {headers.map((h, c) => (
                    <option key={c} value={c}>
                      {h}
                    </option>
                  ))}
                </select>
              </label>
              <select
                aria-label="Show only"
                value={view.filter && view.filter.col === filterCol ? view.filter.value : ""}
                onChange={(e) => setView({ filter: e.target.value ? { col: filterCol, value: e.target.value } : null })}
                style={toolSelect}
              >
                <option value="">Show everything</option>
                {filterValues.map((v) => (
                  <option key={v} value={v}>
                    Only {v}
                  </option>
                ))}
              </select>
            </span>
          )}
        </div>
      )}

      {/* name box + formula bar */}
      <div style={{ display: "flex", alignItems: "stretch", borderBottom: `1px solid ${D.edge}`, fontSize: 15 }}>
        <span aria-label="Selected cell" style={{ width: 64, flexShrink: 0, padding: "8px 10px", borderRight: `1px solid ${D.edge}`, fontWeight: 700, color: D.ink, textAlign: "center" }}>
          {cellName(at.r, at.c)}
        </span>
        <span aria-hidden style={{ padding: "8px 10px", color: D.faint, fontStyle: "italic", borderRight: `1px solid ${D.edge}` }}>
          fx
        </span>
        <span style={{ padding: "8px 10px", color: D.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{grid[at.r][at.c]}</span>
      </div>

      {view.filter && (
        <div style={{ padding: "8px 12px", background: D.warnSoft, fontSize: 15, color: D.body, borderBottom: `1px solid ${D.edge}` }}>
          Filter on: showing only <b>{view.filter.value}</b> in {headers[view.filter.col]}. The other rows are hidden, not deleted.
        </div>
      )}

      {/* phones only: the sheet is wider than the screen, as real Excel is */}
      <p className="desk-swipe" style={{ margin: 0, padding: "8px 12px", fontSize: 14.5, color: D.muted, borderBottom: `1px solid ${D.edge}` }}>
        Swipe the sheet sideways to see every column.
      </p>
      <style>{"@media (min-width: 760px) { .desk-swipe { display: none; } }"}</style>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", fontSize: 16, minWidth: "100%" }}>
          <thead>
            <tr>
              <th style={{ width: 40, background: D.sunk, border: `1px solid ${D.edge}` }} />
              {Array.from({ length: task.cols }, (_, c) => (
                <th key={c} scope="col" style={{ minWidth: 150, padding: "4px 0", background: at.c === c ? "rgba(16,124,65,0.14)" : D.sunk, border: `1px solid ${D.edge}`, fontWeight: 600, color: D.muted, fontSize: 14 }}>
                  {colLetter(c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map((row, r) =>
              visible(r) ? (
                <tr key={r}>
                  <th scope="row" style={{ background: at.r === r ? "rgba(16,124,65,0.14)" : D.sunk, border: `1px solid ${D.edge}`, fontWeight: 600, color: D.muted, fontSize: 14, padding: "0 6px" }}>
                    {r + 1}
                  </th>
                  {row.map((value, c) => {
                    const lockedCell = task.locked?.(r, c) ?? false;
                    const selected = at.r === r && at.c === c;
                    return (
                      <td key={c} style={{ border: `1px solid ${D.edge}`, padding: 0, outline: selected ? `2px solid ${D.excel}` : "none", outlineOffset: -2, background: r === 0 ? D.panelSoft : D.panel }}>
                        <input
                          ref={(el) => {
                            refs.current[r] = refs.current[r] ?? [];
                            refs.current[r][c] = el;
                          }}
                          aria-label={`Cell ${cellName(r, c)}`}
                          value={value}
                          readOnly={lockedCell}
                          onFocus={() => setAt({ r, c })}
                          onChange={(e) => edit(r, c, e.target.value)}
                          onKeyDown={(e) => onKey(e, r, c)}
                          style={{ width: "100%", minWidth: 150, boxSizing: "border-box", border: "none", outline: "none", background: "transparent", padding: "10px 8px", fontFamily: D.sans, fontSize: 16, fontWeight: r === 0 ? 700 : 400, color: lockedCell && r !== 0 ? D.muted : D.ink }}
                        />
                      </td>
                    );
                  })}
                </tr>
              ) : null,
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function SheetLab({ tasks, onDone }: LabProps & { tasks: SheetTask[] }) {
  const [at, setAt] = useState(0);
  const [grids, setGrids] = useState<Grid[]>(() => tasks.map((t) => blank(t.rows, t.cols, t.initial)));
  const [views, setViews] = useState<SheetView[]>(() => tasks.map(() => ({ filter: null })));
  const [results, setResults] = useState<(boolean[] | null)[]>(() => tasks.map(() => null));
  const [finished, setFinished] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const task = tasks[at];
  const result = results[at];
  const allPass = !!result && result.every(Boolean);

  useEffect(() => {
    if (result) resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [result]);

  function check() {
    const r = task.rules.map((rule) => rule.test(grids[at], views[at]));
    setResults((rs) => rs.map((x, i) => (i === at ? r : x)));
  }

  function next() {
    if (at + 1 < tasks.length) {
      setAt(at + 1);
      return;
    }
    const total = tasks.reduce((n, t) => n + t.rules.length, 0);
    const correct = results.reduce((n, r) => n + (r ? r.filter(Boolean).length : 0), 0);
    setFinished(true);
    onDone({ correct, total });
  }

  if (finished) {
    return (
      <div role="status" style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 14px", borderRadius: 12, background: D.goodSoft, fontSize: 16.5, lineHeight: 1.5, color: D.body }}>
        <Tick />
        <span>Done. Nothing in these sheets is saved anywhere: it was practice.</span>
      </div>
    );
  }

  return (
    <div>
      {tasks.length > 1 && <StepBar at={at + 1} of={tasks.length} label="Task" />}
      <div style={{ marginTop: tasks.length > 1 ? 14 : 0, whiteSpace: "pre-wrap", background: D.accentSoft, border: "1px solid rgba(43,89,195,0.25)", borderRadius: 12, padding: "12px 14px", fontSize: 16.5, lineHeight: 1.55, color: D.body }}>{task.scenario}</div>

      <div style={{ marginTop: 14, display: "grid", gap: 14 }}>
        {task.paper && (
          <div style={{ background: D.paper, border: `1px solid ${D.edge}`, borderRadius: 6, padding: "14px 16px", boxShadow: "2px 3px 0 rgba(23,25,31,0.06)", fontSize: 15.5, lineHeight: 1.7, color: D.body }}>
            <p style={{ margin: "0 0 6px", fontWeight: 700, color: D.ink, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: 13.5 }}>{task.paper.title}</p>
            {task.paper.lines.map((l) => (
              <div key={l}>{l}</div>
            ))}
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <Sheet
            key={at}
            task={task}
            grid={grids[at]}
            setGrid={(g) => setGrids((gs) => gs.map((x, i) => (i === at ? g : x)))}
            view={views[at]}
            setView={(v) => setViews((vs) => vs.map((x, i) => (i === at ? v : x)))}
          />
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <Button onClick={check}>Check my sheet</Button>
      </div>

      {result && (
        <div ref={resultRef} role="status" style={{ marginTop: 16, background: D.panel, border: `1px solid ${D.edge}`, borderRadius: 14, padding: "16px 16px 18px" }}>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: D.ink }}>{allPass ? "That sheet is spot on." : "Nearly there. Fix these, then check again:"}</p>
          <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0", display: "grid", gap: 10 }}>
            {task.rules.map((rule, i) => (
              <li key={rule.label} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 16.5, lineHeight: 1.45 }}>
                {result[i] ? <Tick /> : <Cross />}
                <span>
                  <b style={{ color: D.ink }}>{rule.label}</b>
                  {!result[i] && <span style={{ display: "block", color: D.muted }}>{rule.hint}</span>}
                </span>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 16 }}>
            {allPass ? (
              <Button onClick={next}>{at + 1 < tasks.length ? "Next task" : "Finish"}</Button>
            ) : (
              <Button kind="plain" onClick={next}>
                Skip this one for now
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
