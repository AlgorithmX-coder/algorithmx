"use client";

import type { CSSProperties, ReactNode } from "react";
import { AGENCY } from "../../office/agency";
import { W } from "../../tokens";
import { FigureFrame, Part, type PartInfo } from "./parts";

/* An agency's online tests, drawn with every part numbered (Module 13):
 * the typing test while it runs, its result, and one task of the Excel
 * test. They match the Pennyford test centre the learner uses in the
 * office, so nothing there is new when they meet it. The figures agree
 * with the test's own marking (office/agency, scoreTyping): accuracy is
 * letters typed right, and net speed takes the mistakes left in off the
 * gross speed, shared over the minutes of the test. */

const keep: CSSProperties = { whiteSpace: "nowrap" };
const BAD = "#a4262c";
/* a lit part's outline sits a few pixels clear of what it holds */
const tight: CSSProperties = { padding: 3, margin: -3 };

function Site({ path, children }: { path: string; children: ReactNode }) {
  return (
    <div style={{ borderRadius: 8, boxShadow: W.float, border: `1px solid ${W.edge}`, background: W.page, overflowWrap: "normal" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 32, padding: "0 12px", background: W.sunk, borderRadius: "8px 8px 0 0" }}>
        <span style={{ flex: 1, minWidth: 0, padding: "3px 12px", borderRadius: 14, background: W.page, fontSize: 12.5, color: W.body, overflow: "hidden", textOverflow: "ellipsis", ...keep }}>
          https://{AGENCY.site}/{path}
        </span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0 10px", minHeight: 40, padding: "4px 14px", background: AGENCY.colour, color: "#fff" }}>
        <b style={{ fontSize: 14.5 }}>{AGENCY.name}</b>
        <span style={{ fontSize: 12, opacity: 0.9 }}>Candidate test centre</span>
      </div>
      {children}
    </div>
  );
}

function Stat({ label, value, colour }: { label: string; value: string; colour?: string }) {
  return (
    <div style={{ padding: "6px 10px", borderRadius: 6, background: W.chrome, border: `1px solid ${W.edge}` }}>
      <span style={{ display: "block", fontSize: 11.5, color: W.muted, ...keep }}>{label}</span>
      <b style={{ display: "block", fontSize: 22, fontWeight: 600, lineHeight: 1.2, color: colour ?? W.ink, ...keep }}>{value}</b>
    </div>
  );
}

/* ── 1. the typing test, running ──────────────────────────────────────── */

export type TypingPart = "timer" | "speed" | "accuracy" | "passage" | "slip" | "current" | "box";

export const TYPING_PARTS: Record<TypingPart, PartInfo> = {
  timer: { n: 1, name: "Time left", what: "Three minutes, counting down. It starts when you type the first letter, not before." },
  speed: { n: 2, name: "Speed", what: "Words a minute, so far, with the mistakes taken off. A \"word\" is any five keys, spaces included, so long words don't count against you." },
  accuracy: { n: 3, name: "Accuracy", what: "The share of letters typed right. Here 40 of the 42 letters and spaces typed are right: 95%." },
  passage: { n: 4, name: "The text to copy", what: "An ordinary business letter. Words you've typed right turn green." },
  slip: { n: 5, name: "A wrong word", what: "Red and underlined: \"ordre\" for \"order\". Backspace and fix it, or it counts as a mistake." },
  current: { n: 6, name: "The word you're on", what: "Shaded, so your eyes can keep their place while your fingers type." },
  box: { n: 7, name: "Where you type", what: "Click here and type. You can't paste into it." },
};

const WORDS = "Thank you for your order, which arrived this morning. We have checked the stock and can send everything on your list by Thursday, apart from the large paper cups. These are due in from our supplier next week.".split(" ");
const DONE = 7;
const SLIP = 4;

export function TypingFigure({ focus, title = "An agency typing test", what, note }: { focus?: TypingPart[]; title?: string; what?: Partial<Record<TypingPart, string>>; note?: string }) {
  const info = { ...TYPING_PARTS } as Record<TypingPart, PartInfo>;
  for (const k of Object.keys(what ?? {}) as TypingPart[]) info[k] = { ...info[k], what: what![k]! };
  const typed = WORDS.slice(0, DONE).map((w, i) => (i === SLIP ? "ordre," : w)).join(" ") + " th";
  return (
    <FigureFrame info={info} focus={focus} title={title} note={note} minWidth={340}>
      <Site path="candidate/typing-test">
        <div style={{ padding: "14px 18px 18px 52px", display: "grid", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "12px 44px" }}>
            <Part k="timer" style={tight}>
              <Stat label="Time left" value="2:49" />
            </Part>
            <Part k="speed" style={tight}>
              <Stat label="Words a minute" value="40" colour={W.excel} />
            </Part>
            <Part k="accuracy" style={tight}>
              <Stat label="Accuracy" value="95%" colour={W.excel} />
            </Part>
          </div>
          <Part k="passage" style={tight}>
            <p style={{ margin: 0, padding: "34px 14px 10px", border: `1px solid ${W.edge}`, borderRadius: 6, fontSize: 15.5, lineHeight: 1.9 }}>
              {WORDS.map((w, i) => {
                const word =
                  i === DONE ? (
                    <Part k="current" block={false} badge="top" style={{ padding: "0 2px", borderRadius: 3 }}>
                      <span style={{ background: "#fff1b8", borderRadius: 3, padding: "0 2px" }}>{w}</span>
                    </Part>
                  ) : i === SLIP ? (
                    <Part k="slip" block={false} badge="top" style={{ padding: "0 2px", borderRadius: 3 }}>
                      <span style={{ color: BAD, textDecoration: "underline wavy", textDecorationColor: BAD }}>{w}</span>
                    </Part>
                  ) : (
                    <span style={{ color: i < DONE ? W.excel : W.body }}>{w}</span>
                  );
                return (
                  <span key={i}>
                    {word}{" "}
                  </span>
                );
              })}
            </p>
          </Part>
          <Part k="box" style={tight}>
            <div style={{ minHeight: 64, padding: "8px 12px", border: `2px solid ${AGENCY.colour}`, borderRadius: 6, fontSize: 15.5, lineHeight: 1.5 }}>
              {typed}
              <span aria-hidden style={{ display: "inline-block", width: 2, height: 18, marginLeft: 1, verticalAlign: "-3px", background: W.ink }} />
            </div>
          </Part>
        </div>
      </Site>
    </FigureFrame>
  );
}

/* ── 2. the typing test's result ──────────────────────────────────────── */

export type ResultPart = "verdict" | "gross" | "mistakes" | "net" | "acc";

export const RESULT_PARTS: Record<ResultPart, PartInfo> = {
  verdict: { n: 1, name: "Pass or not yet", what: "Against what the agency's clients ask for. Most office jobs: 35 words a minute at 95% accuracy." },
  gross: { n: 2, name: "Gross speed", what: "Everything you typed, right or wrong, in words a minute: 126 words in 3 minutes is 42." },
  mistakes: { n: 3, name: "Mistakes", what: "Words left wrong when the clock stopped. Ones you fixed don't count." },
  net: { n: 4, name: "Net speed", what: "Gross speed with the mistakes taken off, shared over the minutes of the test: 3 mistakes in 3 minutes takes 1 off 42. This is the speed employers mean." },
  acc: { n: 5, name: "Accuracy", what: "Letters typed right, as a percentage: 3 wrong words in about 630 letters is 99%. Agencies want 95% or more." },
};

export function TypingResultFigure({ focus, title = "A typing test result", what, note }: { focus?: ResultPart[]; title?: string; what?: Partial<Record<ResultPart, string>>; note?: string }) {
  const info = { ...RESULT_PARTS } as Record<ResultPart, PartInfo>;
  for (const k of Object.keys(what ?? {}) as ResultPart[]) info[k] = { ...info[k], what: what![k]! };
  const cell = (k: ResultPart, label: string, value: string) => (
    <Part k={k} style={tight}>
      <div style={{ padding: "8px 12px", borderRadius: 6, border: `1px solid ${W.edge}` }}>
        <span style={{ display: "block", fontSize: 12.5, color: W.muted, ...keep }}>{label}</span>
        <b style={{ display: "block", fontSize: 22, fontWeight: 600, ...keep }}>{value}</b>
      </div>
    </Part>
  );
  return (
    <FigureFrame info={info} focus={focus} title={title} note={note}>
      <Site path="candidate/typing-test">
        <div style={{ padding: "14px 18px 18px 52px", display: "grid", gap: 14 }}>
          <b style={{ fontSize: 19 }}>Your typing test result</b>
          <Part k="verdict" style={tight}>
            <div style={{ padding: "10px 14px", borderRadius: 6, background: "#dff6dd", border: "1px solid #9fd89f", fontSize: 14.5 }}>
              <b>Pass.</b> That meets what most office clients ask for.
            </div>
          </Part>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "14px 44px" }}>
            {cell("gross", "Gross speed", "42 wpm")}
            {cell("mistakes", "Mistakes", "3")}
            {cell("net", "Net speed", "41 wpm")}
            {cell("acc", "Accuracy", "99%")}
          </div>
        </div>
      </Site>
    </FigureFrame>
  );
}

/* ── 3. one task of the Excel test ────────────────────────────────────── */

export type XlTestPart = "timer" | "task" | "address" | "namebox" | "formula" | "cell" | "tabs" | "handin";

export const XLTEST_PARTS: Record<XlTestPart, PartInfo> = {
  timer: { n: 1, name: "Time left", what: "Fifteen minutes for ten tasks: about a minute and a half each." },
  task: { n: 2, name: "The task", what: "One job, said in plain words. Read it twice: it says what to work out and where." },
  address: { n: 3, name: "The cell it names", what: "E12: column E, row 12. Getting the right cell is half the mark." },
  namebox: { n: 4, name: "Name box", what: "Shows the cell you've clicked. Check it says E12 before you type." },
  formula: { n: 5, name: "Formula bar", what: "What's really in the cell. The test checks for a formula, not a number you worked out yourself." },
  cell: { n: 6, name: "The answer in the cell", what: "The worked-out total, shown as money after the £ button." },
  tabs: { n: 7, name: "Sheet tabs", what: "Some tasks are on another sheet, like Staff. Click its tab." },
  handin: { n: 8, name: "Hand in my test", what: "Marks what's in the sheet. If time runs out, it hands itself in." },
};

/* Rows 7 to 12 of the test's Orders sheet, every column from A to E, as
 * Excel shows them when you scroll down to the total. */
const XL_ROWS: string[][] = [
  ["7", "Desk diary 2027", "Paper Direct", "5", "6.80", "34"],
  ["8", "Whiteboard markers", "Office Hub", "8", "4.25", "34"],
  ["9", "Lever arch files", "Paper Direct", "12", "2.60", "31.2"],
  ["10", "Sticky notes", "Paper Direct", "12", "1.85", "22.2"],
  ["11", "", "", "", "", ""],
  ["12", "Total", "", "", "", "£501.90"],
];
const XL_COLS = ["", "A", "B", "C", "D", "E"];
const XL_W = [30, 112, 86, 34, 46, 66];

export function ExcelTestFigure({ focus, title = "An agency Excel test", what, note }: { focus?: XlTestPart[]; title?: string; what?: Partial<Record<XlTestPart, string>>; note?: string }) {
  const info = { ...XLTEST_PARTS } as Record<XlTestPart, PartInfo>;
  for (const k of Object.keys(what ?? {}) as XlTestPart[]) info[k] = { ...info[k], what: what![k]! };
  const cellBox = (c: string, ri: number, ci: number, head: boolean) => (
    <span
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: head || ci === 0 ? "center" : ci >= 3 ? "flex-end" : "flex-start",
        width: XL_W[ci],
        height: 24,
        padding: "0 4px",
        boxSizing: "border-box",
        borderRight: `1px solid ${W.edge}`,
        borderBottom: `1px solid ${W.edge}`,
        background: head || ci === 0 ? W.sunk : W.page,
        color: head || ci === 0 ? W.muted : W.ink,
        outline: ri === 5 && ci === 5 ? `2px solid ${W.excel}` : "none",
        outlineOffset: -2,
        overflow: "hidden",
        ...keep,
      }}
    >
      {c}
    </span>
  );
  return (
    <FigureFrame info={info} focus={focus} title={title} note={note} minWidth={340}>
      <Site path="candidate/excel-test">
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {/* the test sheet: time, the task, then hand in, top to bottom */}
          <div style={{ flex: "1 1 230px", padding: "14px 14px 14px 48px", background: "#fbfbfa", borderRight: `1px solid ${W.edge}`, display: "grid", gap: 16, alignContent: "start" }}>
            <Part k="timer" style={tight}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", ...keep }}>
                <span style={{ fontSize: 12, color: W.muted }}>Time left</span>
                <b style={{ fontSize: 20, fontWeight: 600 }}>11:39</b>
              </div>
            </Part>
            <Part k="task" style={{ ...tight, marginTop: 20 }}>
              <div style={{ padding: "8px 10px", borderRadius: 6, border: `1px solid ${W.edge}`, background: W.page, fontSize: 13.5, lineHeight: 1.5 }}>
                <span style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: W.muted }}>Task 5 of 10</span>
                In{" "}
                <Part k="address" block={false} badge="top" style={{ padding: "0 2px", borderRadius: 3 }}>
                  <b style={{ background: "#fff1b8", padding: "0 2px" }}>E12</b>
                </Part>
                , add up the costs of all the items with the SUM function.
              </div>
            </Part>
            <Part k="handin" style={{ ...tight, justifySelf: "start" }}>
              <span style={{ display: "inline-flex", alignItems: "center", minHeight: 30, padding: "0 10px", borderRadius: 6, background: AGENCY.colour, color: "#fff", fontWeight: 700, fontSize: 13, ...keep }}>Hand in my test</span>
            </Part>
          </div>
          {/* the office's Excel, scrolled down to the total */}
          <div style={{ flex: "1 1 470px", minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 32, padding: "0 10px", background: W.excel, color: "#fff", fontSize: 13 }}>
              <b>Excel</b> <span style={{ opacity: 0.9 }}>Pennyford Excel test.xlsx</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "36px 12px 8px 46px", borderBottom: `1px solid ${W.edge}` }}>
              <Part k="namebox" block={false} style={{ padding: 2, margin: -2 }}>
                <span style={{ display: "inline-flex", alignItems: "center", width: 50, minHeight: 26, padding: "0 6px", border: `1px solid ${W.edge}`, fontSize: 13 }}>E12</span>
              </Part>
              <i style={{ fontFamily: "serif", color: W.muted, marginLeft: 6 }}>fx</i>
              <Part k="formula" block={false} badge="top" style={{ flex: 1, minWidth: 0, padding: 2, margin: -2 }}>
                <span style={{ display: "block", minHeight: 26, padding: "3px 8px", border: `1px solid ${W.edge}`, fontFamily: "Consolas, ui-monospace, monospace", fontSize: 13, ...keep }}>=SUM(E2:E10)</span>
              </Part>
            </div>
            <div style={{ padding: "8px 48px 6px 46px", fontSize: 13 }}>
              <div style={{ display: "flex" }}>{XL_COLS.map((c, ci) => <span key={ci}>{cellBox(c, -1, ci, true)}</span>)}</div>
              {XL_ROWS.map((r, ri) => (
                <div key={ri} style={{ display: "flex" }}>
                  {r.map((c, ci) =>
                    ri === 5 && ci === 5 ? (
                      <Part key={ci} k="cell" block={false} badge="right" style={{ padding: 2, margin: -2 }}>
                        {cellBox(c, ri, ci, false)}
                      </Part>
                    ) : (
                      <span key={ci}>{cellBox(c, ri, ci, false)}</span>
                    ),
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 2, padding: "4px 10px 10px 46px" }}>
              <Part k="tabs" block={false} style={{ padding: 2, margin: -2 }}>
                <span style={{ display: "inline-flex", gap: 2, fontSize: 12.5 }}>
                  <span style={{ padding: "3px 12px", borderBottom: `3px solid ${W.excel}`, color: W.excel, fontWeight: 700 }}>Orders</span>
                  <span style={{ padding: "3px 12px" }}>Staff</span>
                </span>
              </Part>
            </div>
          </div>
        </div>
      </Site>
    </FigureFrame>
  );
}
