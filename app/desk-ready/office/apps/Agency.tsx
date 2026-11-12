"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { W } from "../../tokens";
import { AGENCY, PASS, addResult, agencyOf, bestExcel, bestTyping, clock, excelPassed, fullTest, realExcel, realTyping, typingPassed, type TypingScore } from "../agency";
import type { ExcelTestResult, TypingResult } from "../types";
import { AppButton } from "../ui";
import { ExcelResultCard, ExcelTest, type ExcelRun } from "./AgencyExcel";
import { BAD, TypingResultCard, TypingTest } from "./AgencyTyping";
import type { OfficeAppProps } from "./registry";

/* The recruitment agency's online test centre (Module 13, E13.2), opened
 * in a web browser on the office desktop. It has the two tests UK office
 * agencies set: typing, and Excel. Each can be practised with no clock and
 * nothing recorded against you, or taken for real. Every run, practice
 * included, goes into the office record (OfficeState.agency), where the
 * job's checks and the module page read the best real one.
 *
 * During a real test the site hides its menu, as agency sites do, so the
 * only way out is to finish. */

type View =
  | { page: "home" }
  | { page: "typing"; practice: boolean; stage: "intro" | "run" | "done"; result?: TypingScore; key: number }
  | { page: "excel"; practice: boolean; stage: "intro" | "run" | "done"; result?: ExcelRun; key: number };

let runs = 0;

export default function Agency({ state, dispatch }: Pick<OfficeAppProps, "state" | "dispatch">) {
  const [view, setView] = useState<View>({ page: "home" });
  const a = agencyOf(state);
  const inTest = view.page !== "home" && view.stage === "run" && !view.practice;
  const path = view.page === "home" ? "candidate" : `candidate/${view.page === "typing" ? "typing-test" : "excel-test"}${view.practice ? "/practice" : ""}`;

  const saveTyping = (r: TypingScore, practice: boolean) => {
    const rec: TypingResult = { ...r, at: Date.now(), practice };
    dispatch({ type: "update", fn: (s) => addResult(s, { typing: rec }) });
  };
  const saveExcel = (r: ExcelRun, practice: boolean) => {
    const rec: ExcelTestResult = { at: Date.now(), practice, seconds: r.seconds, right: r.right, timedOut: r.timedOut || undefined };
    dispatch({ type: "update", fn: (s) => addResult(s, { excel: rec }) });
  };

  const go = (page: "typing" | "excel", practice: boolean) => setView({ page, practice, stage: "intro", key: ++runs });

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: W.page, fontFamily: W.font, color: W.ink }}>
      {/* the browser */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, minHeight: 38, padding: "0 10px", background: W.sunk, flexShrink: 0 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, maxWidth: 300, minHeight: 32, padding: "0 12px", borderRadius: "8px 8px 0 0", background: W.page, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden" }}>
          <Logo size={16} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{AGENCY.short} · Candidate test centre</span>
        </span>
        <span aria-hidden style={{ alignSelf: "center", fontSize: 18, color: W.muted, padding: "0 6px" }}>
          +
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 40, padding: "0 12px", background: W.page, borderBottom: `1px solid ${W.edge}`, flexShrink: 0 }}>
        <span aria-hidden style={{ fontSize: 16, color: W.faint, letterSpacing: 6 }}>
          ← → ↻
        </span>
        <span aria-label="Web address" style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 8, minHeight: 30, padding: "0 12px", borderRadius: 15, background: W.chrome, fontSize: 13.5, color: W.body, whiteSpace: "nowrap", overflow: "hidden" }}>
          <svg width="12" height="14" viewBox="0 0 12 14" aria-hidden style={{ display: "inline-block", flexShrink: 0 }}>
            <rect x="1" y="6" width="10" height="7" rx="1.5" fill={W.muted} />
            <path d="M3.5 6 V4 a2.5 2.5 0 0 1 5 0 V6" stroke={W.muted} strokeWidth="1.5" fill="none" />
          </svg>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
            https://{AGENCY.site}/{path}
          </span>
        </span>
      </div>

      {/* the agency's site */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, minHeight: 54, padding: "0 20px", background: AGENCY.colour, color: "#fff", flexShrink: 0 }}>
        <Logo size={30} light />
        <span style={{ lineHeight: 1.2 }}>
          <b style={{ display: "block", fontSize: 17, letterSpacing: "0.01em" }}>{AGENCY.name}</b>
          <span style={{ fontSize: 12.5, opacity: 0.9 }}>Candidate test centre</span>
        </span>
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          {inTest ? (
            <span style={{ fontSize: 13.5, fontWeight: 600, padding: "4px 10px", borderRadius: 99, background: "rgba(255,255,255,0.18)" }}>Test in progress</span>
          ) : (
            view.page !== "home" && (
              <button type="button" className="of-btn" onClick={() => setView({ page: "home" })} style={navBtn}>
                ← Your tests
              </button>
            )
          )}
          <span style={{ fontSize: 13, opacity: 0.9, whiteSpace: "nowrap" }}>Signed in as you</span>
        </span>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: view.page === "excel" && view.stage === "run" ? "hidden" : "auto", background: "#f6f8f8" }}>
        {view.page === "home" && <Home a={a} go={go} />}

        {view.page === "typing" && view.stage === "intro" && (
          <Intro
            title={view.practice ? "Typing test: practice" : "Typing test"}
            points={[
              "You'll see a short business letter. Type it into the box underneath, word for word, capitals and full stops too.",
              "Press Space between words. At the end of a paragraph, press Space and carry on.",
              "The clock starts with the first letter you type, and stops by itself after 3 minutes.",
              "Spot a slip? Backspace and fix it. A word left wrong counts as a mistake, and mistakes are taken off your speed.",
              view.practice ? "This is practice: nothing is recorded against you, and you can stop or start again any time." : `To pass: ${PASS.wpm} words a minute (net) at ${PASS.accuracy}% accuracy. You can take it again if you need to.`,
            ]}
            start={view.practice ? "Start practising" : "Start the test"}
            onStart={() => setView({ ...view, stage: "run" })}
            onBack={() => setView({ page: "home" })}
          />
        )}
        {view.page === "typing" && view.stage === "run" && (
          <Page>
            <h2 style={h2}>{view.practice ? "Typing test: practice" : "Typing test"}</h2>
            <div style={{ marginTop: 12 }}>
              <TypingTest
                key={view.key}
                seconds={PASS.typingSeconds}
                practice={view.practice}
                onFinish={(r) => {
                  saveTyping(r, view.practice);
                  setView({ ...view, stage: "done", result: r });
                }}
              />
            </div>
          </Page>
        )}
        {view.page === "typing" && view.stage === "done" && view.result && (
          <Page>
            <h2 style={h2}>{view.practice ? "Your practice result" : "Your typing test result"}</h2>
            <div style={{ marginTop: 12 }}>
              <TypingResultCard r={view.result} practice={view.practice} />
            </div>
            <Again onHome={() => setView({ page: "home" })} onPractise={() => go("typing", true)} onReal={() => go("typing", false)} />
          </Page>
        )}

        {view.page === "excel" && view.stage === "intro" && (
          <Intro
            title={view.practice ? "Excel test: practice" : "Excel test"}
            points={[
              "You'll get 10 short tasks on one workbook: an office supplies order, and a staff list on a second sheet.",
              "Each task names the cell to use, like E2. Click it, then type. Formulas start with =.",
              "Do them in any order. Stuck on one? Leave it and come back.",
              view.practice ? "This is practice: there's no clock, and Check my answers shows what's right so far." : `You have 15 minutes. The test hands itself in when the time is up. To pass: ${PASS.excel} or more right.`,
            ]}
            start={view.practice ? "Start practising" : "Start the test"}
            onStart={() => setView({ ...view, stage: "run" })}
            onBack={() => setView({ page: "home" })}
          />
        )}
        {view.page === "excel" && view.stage === "run" && (
          <ExcelTest
            key={view.key}
            practice={view.practice}
            onLeave={() => setView({ page: "home" })}
            onFinish={(r) => {
              saveExcel(r, view.practice);
              setView({ ...view, stage: "done", result: r });
            }}
          />
        )}
        {view.page === "excel" && view.stage === "done" && view.result && (
          <Page>
            <h2 style={h2}>{view.practice ? "Your practice result" : "Your Excel test result"}</h2>
            <div style={{ marginTop: 12 }}>
              <ExcelResultCard run={view.result} practice={view.practice} />
            </div>
            <Again onHome={() => setView({ page: "home" })} onPractise={() => go("excel", true)} onReal={() => go("excel", false)} />
          </Page>
        )}
      </div>
    </div>
  );
}

const navBtn: CSSProperties = { minHeight: 34, padding: "0 12px", border: "1px solid rgba(255,255,255,0.5)", borderRadius: 6, background: "transparent", color: "#fff", fontFamily: W.font, fontSize: 14, cursor: "pointer" };
const h2: CSSProperties = { margin: 0, fontSize: 24, fontWeight: 600, letterSpacing: "-0.01em" };

/* The agency's mark: a P cut into a rounded square. Invented. */
function Logo({ size, light }: { size: number; light?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden style={{ display: "inline-block", flexShrink: 0 }}>
      <rect x="1" y="1" width="30" height="30" rx="8" fill={light ? "#ffffff" : AGENCY.colour} />
      <path d="M11 24 V8 h6.5 a5 5 0 0 1 0 10 H11" stroke={light ? AGENCY.colour : "#ffffff"} strokeWidth="3.4" fill="none" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function Page({ children }: { children: ReactNode }) {
  return <div style={{ maxWidth: 860, margin: "0 auto", padding: "20px 22px 28px" }}>{children}</div>;
}

function Intro({ title, points, start, onStart, onBack }: { title: string; points: string[]; start: string; onStart: () => void; onBack: () => void }) {
  return (
    <Page>
      <h2 style={h2}>{title}</h2>
      <p style={{ margin: "6px 0 0", fontSize: 15, color: W.muted }}>Before you start:</p>
      <ul style={{ margin: "12px 0 0", padding: "14px 18px 14px 34px", background: W.page, border: `1px solid ${W.edge}`, borderRadius: 8, display: "grid", gap: 8, fontSize: 15.5, lineHeight: 1.5 }}>
        {points.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 16 }}>
        <AppButton primary colour={AGENCY.colour} onClick={onStart}>
          {start}
        </AppButton>
        <AppButton onClick={onBack}>Back</AppButton>
      </div>
    </Page>
  );
}

function Again({ onHome, onPractise, onReal }: { onHome: () => void; onPractise: () => void; onReal: () => void }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 16 }}>
      <AppButton primary colour={AGENCY.colour} onClick={onHome}>
        Back to your tests
      </AppButton>
      <AppButton onClick={onPractise}>Practise again</AppButton>
      <AppButton onClick={onReal}>Take the real test</AppButton>
    </div>
  );
}

function Home({ a, go }: { a: ReturnType<typeof agencyOf>; go: (page: "typing" | "excel", practice: boolean) => void }) {
  const t = bestTyping(realTyping(a));
  const e = bestExcel(realExcel(a));
  const typingStatus = !t ? (a.typing.some((r) => !r.practice && !fullTest(r)) ? "Not finished: take it again" : "Not taken yet") : typingPassed(t) ? `Passed: ${t.net} wpm at ${Math.floor(t.accuracy)}%` : `Best so far: ${t.net} wpm at ${Math.floor(t.accuracy)}%`;
  const excelStatus = !e ? "Not taken yet" : excelPassed(e) ? `Passed: ${e.right.length} of 10` : `Best so far: ${e.right.length} of 10`;
  const history = [
    ...a.typing.map((r) => ({ at: r.at, test: "Typing", kind: r.practice ? "Practice" : fullTest(r) ? "Real test" : "Real test (stopped early)", result: `${r.net} wpm net, ${Math.floor(r.accuracy)}% accuracy`, pass: !r.practice && fullTest(r) && typingPassed(r), counts: !r.practice && fullTest(r) })),
    ...a.excel.map((r) => ({ at: r.at, test: "Excel", kind: r.practice ? "Practice" : "Real test", result: `${r.right.length} of 10 in ${clock(r.seconds)}`, pass: !r.practice && excelPassed(r), counts: !r.practice })),
  ].sort((x, y) => y.at - x.at);

  return (
    <Page>
      <h2 style={h2}>Your tests</h2>
      <p style={{ margin: "6px 0 0", fontSize: 15.5, lineHeight: 1.5, color: W.body, maxWidth: 640 }}>Jo has asked you to take these two tests. Practise as often as you like first: practice runs have no clock and are never sent to employers. We send your best real result.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14, marginTop: 16 }}>
        <TestCard
          title="Typing test"
          lines={["3 minutes, typing a business letter", `To pass: ${PASS.wpm} words a minute at ${PASS.accuracy}% accuracy`]}
          status={typingStatus}
          passed={!!t && typingPassed(t)}
          onPractise={() => go("typing", true)}
          onTake={() => go("typing", false)}
        />
        <TestCard title="Excel test" lines={["10 tasks in 15 minutes", `To pass: ${PASS.excel} or more of the 10 right`]} status={excelStatus} passed={!!e && excelPassed(e)} onPractise={() => go("excel", true)} onTake={() => go("excel", false)} />
      </div>

      <h3 style={{ margin: "24px 0 0", fontSize: 17, fontWeight: 600 }}>Your results</h3>
      {history.length === 0 ? (
        <p style={{ margin: "6px 0 0", fontSize: 15, color: W.muted }}>Nothing yet. Your practice runs and tests will show here.</p>
      ) : (
        <div style={{ marginTop: 8, border: `1px solid ${W.edge}`, borderRadius: 8, background: W.page, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14.5 }}>
            <thead>
              <tr style={{ background: W.chrome, textAlign: "left" }}>
                {["Test", "Kind", "Result", ""].map((h) => (
                  <th key={h} scope="col" style={{ padding: "8px 12px", fontWeight: 600, borderBottom: `1px solid ${W.edge}` }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.slice(0, 12).map((h, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${W.edge}` }}>
                  <td style={td}>{h.test}</td>
                  <td style={{ ...td, color: h.counts ? W.ink : W.muted }}>{h.kind}</td>
                  <td style={td}>{h.result}</td>
                  <td style={{ ...td, fontWeight: 600, color: h.pass ? W.excel : h.counts ? BAD : W.muted, whiteSpace: "nowrap" }}>{h.counts ? (h.pass ? "Pass" : "Not a pass") : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Page>
  );
}

const td: CSSProperties = { padding: "8px 12px", verticalAlign: "top" };

function TestCard({ title, lines, status, passed, onPractise, onTake }: { title: string; lines: string[]; status: string; passed: boolean; onPractise: () => void; onTake: () => void }) {
  return (
    <section aria-label={title} style={{ padding: "16px 18px", borderRadius: 10, background: W.page, border: `1px solid ${W.edge}`, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", display: "grid", gap: 8, alignContent: "start" }}>
      <h3 style={{ margin: 0, fontSize: 19, fontWeight: 600 }}>{title}</h3>
      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14.5, lineHeight: 1.5, color: W.body }}>
        {lines.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
      <span style={{ justifySelf: "start", fontSize: 13.5, fontWeight: 600, padding: "3px 10px", borderRadius: 99, background: passed ? "#dff6dd" : AGENCY.soft, color: passed ? W.excel : AGENCY.colour }}>{status}</span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
        <AppButton onClick={onPractise}>Practise</AppButton>
        <AppButton primary colour={AGENCY.colour} onClick={onTake}>
          Take the test
        </AppButton>
      </div>
    </section>
  );
}
