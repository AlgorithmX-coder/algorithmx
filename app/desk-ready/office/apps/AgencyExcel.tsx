"use client";

import { useEffect, useRef, useState } from "react";
import { W } from "../../tokens";
import { AGENCY, EXCEL_TASKS, EXCEL_TEST_FILE, EXCEL_WIDTHS, PASS, clock, excelTestBook, markExcel } from "../agency";
import type { Tab } from "../types";
import { AppButton, Dialog } from "../ui";
import { BAD } from "./AgencyTyping";
import Excel, { type ExcelDoc } from "./Excel";

/* The agency's Excel test (Module 13, E13.2): ten tasks down the left, the
 * office's own Excel on the right, and a clock. The tasks can be done in
 * any order; each is marked from the sheet itself when the test is handed
 * in (office/agency, EXCEL_TASKS). A real run has fifteen minutes and hands
 * itself in when they are up; a practice run has no clock, and "Check my
 * answers" shows which tasks are right so far, with a pointer for the rest. */

export interface ExcelRun {
  right: number[];
  seconds: number;
  timedOut: boolean;
}

export function ExcelTest({ practice, seconds = PASS.excelSeconds, onFinish, onLeave, tasks = EXCEL_TASKS, book = excelTestBook, height = "100%" }: { practice: boolean; seconds?: number; onFinish: (r: ExcelRun) => void; onLeave?: () => void; tasks?: typeof EXCEL_TASKS; book?: () => Tab[]; height?: number | string }) {
  const [doc, setDoc] = useState<ExcelDoc>(() => ({ fileId: null, name: EXCEL_TEST_FILE, path: null, tabs: book(), active: 0, widths: EXCEL_WIDTHS, dirty: false }));
  const [start] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const [checked, setChecked] = useState<number[] | null>(null);
  const [confirm, setConfirm] = useState(false);
  const handed = useRef(false);
  const elapsed = (now - start) / 1000;
  const left = Math.max(0, seconds - elapsed);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);

  const handIn = (timedOut: boolean) => {
    if (handed.current) return;
    handed.current = true;
    const right = markExcel(doc.tabs).filter((n) => tasks.some((t) => t.n === n));
    onFinish({ right, seconds: Math.min(seconds, Math.round(elapsed)), timedOut });
  };

  useEffect(() => {
    if (!practice && left <= 0) handIn(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, practice]);

  return (
    <div style={{ position: "relative", height, display: "grid", gridTemplateColumns: "minmax(250px, 300px) minmax(0, 1fr)", minHeight: 0, fontFamily: W.font, color: W.ink }}>
      {/* the test sheet */}
      <aside aria-label="Your tasks" style={{ display: "flex", flexDirection: "column", minHeight: 0, borderRight: `1px solid ${W.edge}`, background: "#fbfbfa" }}>
        <div style={{ padding: "10px 12px", borderBottom: `1px solid ${W.edge}`, display: "grid", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
            <span style={{ fontSize: 13, color: W.muted }}>{practice ? "Practice: no time limit" : "Time left"}</span>
            <b aria-label={practice ? "Time taken" : "Time left"} style={{ fontSize: 24, fontWeight: 600, fontVariantNumeric: "tabular-nums", color: !practice && left <= 60 ? BAD : W.ink }}>
              {clock(practice ? elapsed : Math.ceil(left))}
            </b>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {practice && (
              <AppButton onClick={() => setChecked(markExcel(doc.tabs))} style={{ minHeight: 36 }}>
                Check my answers
              </AppButton>
            )}
            <AppButton primary colour={AGENCY.colour} onClick={() => setConfirm(true)} style={{ minHeight: 36 }}>
              {practice ? "Finish practice" : "Hand in my test"}
            </AppButton>
          </div>
        </div>
        <ol style={{ listStyle: "none", margin: 0, padding: "8px 8px 14px", overflowY: "auto", flex: 1, minHeight: 0, display: "grid", gap: 6, alignContent: "start" }}>
          {tasks.map((t) => {
            const mark = checked ? checked.includes(t.n) : null;
            return (
              <li key={t.n} style={{ display: "flex", gap: 10, padding: "8px 8px", borderRadius: 6, background: mark === true ? "#dff6dd" : mark === false ? "#fff4ce" : W.page, border: `1px solid ${W.edge}` }}>
                <span aria-hidden style={{ flexShrink: 0, width: 24, height: 24, borderRadius: "50%", background: mark === true ? W.excel : AGENCY.colour, color: "#fff", fontSize: 12.5, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  {mark === true ? "✓" : t.n}
                </span>
                <span style={{ fontSize: 14, lineHeight: 1.45, minWidth: 0 }}>
                  <span className="sr-only" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
                    Task {t.n}{mark === true ? ", right" : mark === false ? ", not right yet" : ""}.
                  </span>
                  {t.text}
                  {mark === false && <span style={{ display: "block", marginTop: 4, fontSize: 13, color: "#7a5a00" }}>{t.hint}</span>}
                </span>
              </li>
            );
          })}
        </ol>
      </aside>

      {/* the office's own Excel */}
      <div style={{ minWidth: 0, minHeight: 0 }}>
        <Excel practice doc={doc} onChange={(tabs, active) => setDoc((d) => ({ ...d, tabs, active, dirty: true }))} onSave={() => {}} onSaveAs={() => {}} onClose={() => {}} />
      </div>

      {confirm && (
        <Dialog title={practice ? "Finish this practice?" : "Hand in your test?"} onClose={() => setConfirm(false)} width={480}>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5 }}>{practice ? "You'll see which tasks were right, and how to do the others." : "Your sheet is marked as it is now. You can't change it after this."}</p>
          <div style={{ display: "flex", justifyContent: "flex-end", flexWrap: "wrap", gap: 10, marginTop: 18 }}>
            {practice && onLeave && (
              <AppButton onClick={onLeave} style={{ marginRight: "auto" }}>
                Leave without marking
              </AppButton>
            )}
            <AppButton onClick={() => setConfirm(false)}>Keep going</AppButton>
            <AppButton
              primary
              colour={AGENCY.colour}
              onClick={() => {
                setConfirm(false);
                handIn(false);
              }}
            >
              {practice ? "Finish" : "Hand in"}
            </AppButton>
          </div>
        </Dialog>
      )}
    </div>
  );
}

/* The marked test: the score, then every task with a tick or a pointer. */
export function ExcelResultCard({ run, practice, tasks = EXCEL_TASKS }: { run: Pick<ExcelRun, "right" | "seconds" | "timedOut">; practice: boolean; tasks?: typeof EXCEL_TASKS }) {
  const pass = run.right.length >= PASS.excel;
  return (
    <div style={{ display: "grid", gap: 12, fontFamily: W.font, color: W.ink }}>
      <div role="status" style={{ padding: "12px 16px", borderRadius: 6, background: pass ? "#dff6dd" : "#fff4ce", border: `1px solid ${pass ? "#9fd89f" : "#f2d48a"}`, fontSize: 16, lineHeight: 1.5 }}>
        <b style={{ fontSize: 20 }}>
          {run.right.length} of {tasks.length} right.
        </b>{" "}
        {pass ? `A pass: our clients ask for ${PASS.excel} or more.` : `Our clients ask for ${PASS.excel} or more. Practise the ones below, then take it again.`}
        <span style={{ display: "block", marginTop: 4, color: W.muted, fontSize: 14 }}>
          {run.timedOut ? "The clock ran out, so it was handed in for you." : `Handed in after ${clock(run.seconds)}.`}
          {practice ? " This was a practice run. It isn't sent to anyone." : ""}
        </span>
      </div>
      <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 6 }}>
        {tasks.map((t) => {
          const ok = run.right.includes(t.n);
          return (
            <li key={t.n} style={{ display: "flex", gap: 10, padding: "8px 10px", borderRadius: 6, border: `1px solid ${W.edge}`, background: W.page }}>
              <span aria-label={ok ? "Right" : "Not right"} style={{ flexShrink: 0, width: 24, height: 24, borderRadius: "50%", background: ok ? W.excel : BAD, color: "#fff", fontSize: 13, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                {ok ? "✓" : "✕"}
              </span>
              <span style={{ fontSize: 14.5, lineHeight: 1.45 }}>
                <b style={{ fontWeight: 600 }}>{t.n}.</b> {t.text}
                {!ok && <span style={{ display: "block", marginTop: 3, fontSize: 13.5, color: W.muted }}>How to do it: {t.hint}</span>}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
