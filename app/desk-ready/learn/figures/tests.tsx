"use client";

import type { CSSProperties, ReactNode } from "react";
import { AGENCY } from "../../office/agency";
import { W } from "../../tokens";
import { FigureFrame, Part, type PartInfo } from "./parts";

/* An agency's online tests, drawn with every part numbered (Module 13):
 * the typing test while it runs, its result, and one task of the Excel
 * test. They match the Pennyford test centre the learner uses in the
 * office, so nothing there is new when they meet it. */

const keep: CSSProperties = { whiteSpace: "nowrap" };
const BAD = "#a4262c";

function Site({ path, children }: { path: string; children: ReactNode }) {
  return (
    <div style={{ borderRadius: 8, boxShadow: W.float, border: `1px solid ${W.edge}`, background: W.page, overflowWrap: "normal" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 32, padding: "0 12px", background: W.sunk, borderRadius: "8px 8px 0 0" }}>
        <span style={{ flex: 1, minWidth: 0, padding: "3px 12px", borderRadius: 14, background: W.page, fontSize: 12.5, color: W.body, overflow: "hidden", textOverflow: "ellipsis", ...keep }}>
          https://{AGENCY.site}/{path}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 40, padding: "0 14px", background: AGENCY.colour, color: "#fff" }}>
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

export type TypingPart = "timer" | "speed" | "accuracy" | "passage" | "current" | "slip" | "box";

export const TYPING_PARTS: Record<TypingPart, PartInfo> = {
  timer: { n: 1, name: "Time left", what: "Three minutes, counting down. It starts when you type the first letter, not before." },
  speed: { n: 2, name: "Speed", what: "Words a minute, so far. A \"word\" is any five keys, spaces included, so long words don't count against you." },
  accuracy: { n: 3, name: "Accuracy", what: "The share of letters typed right. It drops with every slip you leave in." },
  passage: { n: 4, name: "The text to copy", what: "An ordinary business letter. Words you've typed right turn green." },
  current: { n: 5, name: "The word you're on", what: "Shaded, so your eyes can keep their place while your fingers type." },
  slip: { n: 6, name: "A word left wrong", what: "Red and underlined. Backspace and fix it, or it costs you a word a minute." },
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
    <FigureFrame info={info} focus={focus} title={title} note={note} minWidth={560}>
      <Site path="candidate/typing-test">
        <div style={{ padding: "14px 18px 18px 52px", display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 44 }}>
            <Part k="timer">
              <Stat label="Time left" value="2:49" />
            </Part>
            <Part k="speed">
              <Stat label="Speed (words a minute)" value="38" colour={W.excel} />
            </Part>
            <Part k="accuracy">
              <Stat label="Accuracy" value="97%" colour={W.excel} />
            </Part>
          </div>
          <Part k="passage">
            <p style={{ margin: 0, padding: "34px 14px 10px", border: `1px solid ${W.edge}`, borderRadius: 6, fontSize: 15.5, lineHeight: 1.9 }}>
              {WORDS.map((w, i) => {
                const word =
                  i === DONE ? (
                    <Part k="current" block={false} badge="top">
                      <span style={{ background: "#fff1b8", borderRadius: 3, padding: "0 2px" }}>{w}</span>
                    </Part>
                  ) : i === SLIP ? (
                    <Part k="slip" block={false} badge="top">
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
          <Part k="box">
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
  gross: { n: 2, name: "Gross speed", what: "Everything you typed, right or wrong, in words a minute." },
  mistakes: { n: 3, name: "Mistakes", what: "Words left wrong when the clock stopped. Ones you fixed don't count." },
  net: { n: 4, name: "Net speed", what: "Gross speed, less a word a minute for every mistake. This is the speed employers mean." },
  acc: { n: 5, name: "Accuracy", what: "Letters typed right, as a percentage. Agencies want 95% or more." },
};

export function TypingResultFigure({ focus, title = "A typing test result", what, note }: { focus?: ResultPart[]; title?: string; what?: Partial<Record<ResultPart, string>>; note?: string }) {
  const info = { ...RESULT_PARTS } as Record<ResultPart, PartInfo>;
  for (const k of Object.keys(what ?? {}) as ResultPart[]) info[k] = { ...info[k], what: what![k]! };
  const cell = (k: ResultPart, label: string, value: string) => (
    <Part k={k}>
      <div style={{ padding: "8px 12px", borderRadius: 6, border: `1px solid ${W.edge}` }}>
        <span style={{ display: "block", fontSize: 12.5, color: W.muted, ...keep }}>{label}</span>
        <b style={{ display: "block", fontSize: 22, fontWeight: 600, ...keep }}>{value}</b>
      </div>
    </Part>
  );
  return (
    <FigureFrame info={info} focus={focus} title={title} note={note} minWidth={520}>
      <Site path="candidate/typing-test">
        <div style={{ padding: "14px 18px 18px 52px", display: "grid", gap: 12 }}>
          <b style={{ fontSize: 19 }}>Your typing test result</b>
          <Part k="verdict">
            <div style={{ padding: "10px 14px", borderRadius: 6, background: "#dff6dd", border: "1px solid #9fd89f", fontSize: 14.5 }}>
              <b>Pass.</b> That meets what most office clients ask for.
            </div>
          </Part>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "14px 44px" }}>
            {cell("gross", "Gross speed", "42 wpm")}
            {cell("mistakes", "Mistakes", "3")}
            {cell("net", "Net speed", "41 wpm")}
            {cell("acc", "Accuracy", "97%")}
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

export function ExcelTestFigure({ focus, title = "An agency Excel test", what, note }: { focus?: XlTestPart[]; title?: string; what?: Partial<Record<XlTestPart, string>>; note?: string }) {
  const info = { ...XLTEST_PARTS } as Record<XlTestPart, PartInfo>;
  for (const k of Object.keys(what ?? {}) as XlTestPart[]) info[k] = { ...info[k], what: what![k]! };
  const rows: string[][] = [
    ["", "A", "B", "E"],
    ["1", "Item", "Supplier", "Cost"],
    ["9", "Lever arch files", "Paper Direct", "31.2"],
    ["10", "Sticky notes", "Paper Direct", "22.2"],
    ["11", "", "", ""],
    ["12", "Total", "", "£501.90"],
  ];
  const widths = [36, 150, 112, 96];
  return (
    <FigureFrame info={info} focus={focus} title={title} note={note} minWidth={620}>
      <Site path="candidate/excel-test">
        <div style={{ display: "grid", gridTemplateColumns: "240px minmax(0, 1fr)", minHeight: 250 }}>
          <div style={{ padding: "12px 12px 12px 48px", borderRight: `1px solid ${W.edge}`, background: "#fbfbfa", display: "grid", gap: 12, alignContent: "start" }}>
            <Part k="timer">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", ...keep }}>
                <span style={{ fontSize: 12, color: W.muted }}>Time left</span>
                <b style={{ fontSize: 20, fontWeight: 600 }}>11:39</b>
              </div>
            </Part>
            <Part k="handin">
              <span style={{ display: "inline-flex", alignItems: "center", minHeight: 30, padding: "0 10px", borderRadius: 6, background: AGENCY.colour, color: "#fff", fontWeight: 700, fontSize: 13, ...keep }}>Hand in my test</span>
            </Part>
            <Part k="task" style={{ marginTop: 22 }}>
              <div style={{ display: "flex", gap: 8, padding: "8px", borderRadius: 6, border: `1px solid ${W.edge}`, background: W.page, fontSize: 13, lineHeight: 1.45 }}>
                <span style={{ flexShrink: 0, width: 20, height: 20, borderRadius: "50%", background: AGENCY.colour, color: "#fff", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>5</span>
                <span>
                  In{" "}
                  <Part k="address" block={false} badge="top">
                    <b style={{ background: "#fff1b8", padding: "0 2px" }}>E12</b>
                  </Part>
                  , add up the costs of all the items with the SUM function.
                </span>
              </div>
            </Part>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 32, padding: "0 10px", background: W.excel, color: "#fff", fontSize: 13 }}>
              <b>Excel</b> <span style={{ opacity: 0.9 }}>Pennyford Excel test.xlsx</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px 8px 46px", borderBottom: `1px solid ${W.edge}` }}>
              <Part k="namebox" block={false}>
                <span style={{ display: "inline-flex", alignItems: "center", width: 54, minHeight: 26, padding: "0 6px", border: `1px solid ${W.edge}`, fontSize: 13 }}>E12</span>
              </Part>
              <i style={{ fontFamily: "serif", color: W.muted }}>fx</i>
              <Part k="formula" block={false} badge="right" style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", minHeight: 26, padding: "3px 8px", border: `1px solid ${W.edge}`, fontFamily: "Consolas, ui-monospace, monospace", fontSize: 13, ...keep }}>=SUM(E2:E10)</span>
              </Part>
            </div>
            <div style={{ padding: "8px 10px 6px 46px", fontSize: 13 }}>
              {rows.map((r, ri) => (
                <div key={ri} style={{ display: "flex" }}>
                  {r.map((c, ci) => {
                    const sel = ri === 5 && ci === 3;
                    const content = (
                      <span style={{ display: "flex", alignItems: "center", justifyContent: ci === 3 && ri > 1 ? "flex-end" : ci === 0 || ri === 0 ? "center" : "flex-start", width: widths[ci], height: 24, padding: "0 5px", boxSizing: "border-box", borderRight: `1px solid ${W.edge}`, borderBottom: `1px solid ${W.edge}`, background: ri === 0 || ci === 0 ? W.sunk : ri === 1 ? "#e6f2ea" : W.page, color: ri === 0 || ci === 0 ? W.muted : W.ink, fontWeight: ri === 1 ? 700 : 400, outline: sel ? `2px solid ${W.excel}` : "none", outlineOffset: -2, ...keep }}>{c}</span>
                    );
                    return sel ? (
                      <Part key={ci} k="cell" block={false} badge="right">
                        {content}
                      </Part>
                    ) : (
                      <span key={ci}>{content}</span>
                    );
                  })}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 2, padding: "4px 10px 8px 46px" }}>
              <Part k="tabs" block={false}>
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
