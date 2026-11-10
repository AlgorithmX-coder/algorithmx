"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Excel, { type ExcelDoc } from "../office/apps/Excel";
import { OFFICE_CSS } from "../office/ui";
import type { Grid, Tab } from "../office/types";
import { D, W } from "../tokens";
import type { LabProps } from "./types";
import { Button, Cross, Kicker, StepBar, Tick, Workspace } from "./ui";

/* ExcelLab: a lesson task in the office's own Excel (office/apps/Excel),
 * so formulas really work them out, Fill down really copies, and £ and %
 * really format, the same Excel the learner meets in the office jobs. It
 * runs in practice mode (no File or Save), and "Check my sheet" runs the
 * lesson's rules on what the learner typed. Nothing is saved anywhere. */

export interface ExcelRule {
  label: string;
  /* `formats` holds the cells set to £ or % on the first tab; `tab` is the
   * whole tab, with its highlights and chart. */
  test: (g: Grid, formats: NonNullable<Tab["formats"]>, tab: Tab) => boolean;
  hint: string;
}

export interface ExcelTask {
  scenario: string;
  file: string;
  grid: Grid;
  widths: number[];
  rules: ExcelRule[];
}

/* Pad a sheet to a few empty rows below the data, as a real sheet has. */
export function sheetOf(rows: string[][], cols: number, total = 14): Grid {
  const g = rows.map((r) => [...r, ...Array(Math.max(0, cols - r.length)).fill("")]);
  while (g.length < total) g.push(Array(cols).fill(""));
  return g;
}

export function ExcelLab({ tasks, onDone }: LabProps & { tasks: ExcelTask[] }) {
  const [at, setAt] = useState(0);
  const [docs, setDocs] = useState<ExcelDoc[]>(() => tasks.map((t) => ({ fileId: null, name: t.file, path: null, tabs: [{ name: "Sheet1", grid: t.grid.map((r) => [...r]) }], active: 0, widths: t.widths, dirty: false })));
  const [results, setResults] = useState<(boolean[] | null)[]>(() => tasks.map(() => null));
  const [finished, setFinished] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const task = tasks[at];
  const doc = docs[at];
  const result = results[at];
  const allPass = !!result && result.every(Boolean);

  useEffect(() => {
    if (result) resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [result]);

  function check() {
    const first = doc.tabs[0];
    const r = task.rules.map((rule) => rule.test(first.grid, first.formats ?? {}, first));
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
      <div role="status" style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "13px 16px", borderRadius: 14, background: D.goodSoft, border: `1px solid ${D.goodEdge}`, fontSize: 16.5, lineHeight: 1.55, color: D.body }}>
        <Tick />
        <span>Done. Nothing in these sheets is saved anywhere: it was practice.</span>
      </div>
    );
  }

  return (
    <div>
      {tasks.length > 1 && <StepBar at={at + 1} of={tasks.length} label="Task" />}
      <div style={{ marginTop: tasks.length > 1 ? 14 : 0, whiteSpace: "pre-wrap", background: D.accentSoft, border: `1px solid ${D.accentEdge}`, borderRadius: 14, padding: "13px 16px", fontSize: 16.5, lineHeight: 1.6, color: D.body }}>
        <Kicker style={{ marginBottom: 6 }}>The job</Kicker>
        <div>{task.scenario}</div>
      </div>

      <Workspace style={{ marginTop: 14 }}>
        <div className="of-office" style={{ height: 430, borderRadius: 8, overflow: "hidden", boxShadow: W.float, colorScheme: "light" }}>
          <Excel
            key={at}
            practice
            doc={doc}
            onChange={(tabs, active) => setDocs((ds) => ds.map((d, i) => (i === at ? { ...d, tabs, active } : d)))}
            onSave={() => {}}
            onSaveAs={() => {}}
            onClose={() => {}}
          />
        </div>
        <style>{OFFICE_CSS}</style>
      </Workspace>

      <div style={{ marginTop: 14 }}>
        <Button onClick={check}>Check my sheet</Button>
      </div>

      {result && (
        <div
          ref={resultRef}
          role="status"
          className="dr-glass"
          style={{ marginTop: 16, position: "relative", background: allPass ? D.goodSoft : D.warnSoft, border: `1px solid ${allPass ? D.goodEdge : D.warnEdge}`, borderRadius: 16, padding: "18px 18px 20px", color: D.body, ["--acc" as string]: allPass ? D.good : D.warn } as CSSProperties}
        >
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
