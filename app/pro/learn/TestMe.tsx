"use client";

import { useCallback, useEffect, useState } from "react";
import { T } from "./tokens";
import { buildTest, type PoolQuestion } from "./quizPool";

/* Cyber Pro "Test me": an optional, anytime self-test the learner can take
 * whenever they like. It pulls a handful of questions at random from the
 * topics they have finished so far (or Module 1 as a starter), one at a time,
 * single attempt with the answer and explanation revealed, then a score.
 *
 * It never blocks anything and saves nothing; it is purely for the learner to
 * check what has stuck. Progress is read the same way the hub reads it:
 * localStorage checkpoints merged with the server record. */

type Status = "loading" | "ready" | "empty";

async function doneTopicIds(): Promise<string[]> {
  const ids = new Set<string>();
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith("pro:lesson:")) continue;
      try {
        const cp = JSON.parse(localStorage.getItem(k) || "null");
        if (cp && cp.phase === "done" && cp.id) ids.add(cp.id);
      } catch { /* skip a corrupt checkpoint */ }
    }
  } catch { /* localStorage unavailable */ }
  try {
    const res = await fetch("/api/pro/progress", { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as { done?: string[] };
      if (Array.isArray(data.done)) for (const id of data.done) ids.add(id);
    }
  } catch { /* local set stands */ }
  return [...ids];
}

export default function TestMe() {
  const [status, setStatus] = useState<Status>("loading");
  const [questions, setQuestions] = useState<PoolQuestion[]>([]);
  const [starter, setStarter] = useState(false);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const load = useCallback(async () => {
    setStatus("loading");
    setIdx(0); setPicked(null); setScore(0); setFinished(false);
    try {
      const { questions: qs, starter: st } = await buildTest(await doneTopicIds(), 10);
      if (qs.length === 0) { setStatus("empty"); return; }
      setQuestions(qs); setStarter(st); setStatus("ready");
    } catch {
      setStatus("empty");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const q = questions[idx];
  const rich = !!q && Array.isArray(q.reasons) && q.reasons.length === q.options.length;

  function pick(origIdx: number) {
    if (picked !== null) return;
    setPicked(origIdx);
    if (origIdx === q.answer) setScore((s) => s + 1);
  }
  function next() {
    if (idx + 1 >= questions.length) { setFinished(true); return; }
    setIdx((i) => i + 1); setPicked(null);
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.body, fontFamily: T.sans }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "22px 24px 90px" }}>
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "6px 0 18px", borderBottom: `1px solid ${T.edge}` }}>
          <span style={{ fontFamily: T.display, fontWeight: 700, fontSize: 16, letterSpacing: "0.07em", color: T.ink }}>CYBER PRO</span>
          <a href="/pro/course" style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: T.muted, textDecoration: "none" }}>Back to course &rarr;</a>
        </header>

        <div style={{ display: "inline-flex", alignItems: "center", gap: 9, fontFamily: T.mono, fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: T.primary, margin: "34px 0 12px" }}>
          <Spark /> Test me
        </div>
        <h1 style={{ fontFamily: T.display, fontSize: "clamp(27px, 4vw, 36px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em", margin: "0 0 12px", color: T.ink }}>
          A quick check on what has stuck
        </h1>

        {status === "loading" && (
          <p style={{ fontSize: 15.5, color: T.muted, lineHeight: 1.6, marginTop: 20 }}>Building your test&hellip;</p>
        )}

        {status === "empty" && (
          <div style={{ marginTop: 20, background: T.panel, border: `1px solid ${T.edge}`, borderRadius: 12, padding: "20px 22px" }}>
            <p style={{ fontSize: 15.5, color: T.body, lineHeight: 1.6, margin: 0 }}>There are no questions to pull yet. Finish a lesson first, then come back and test yourself on it.</p>
            <a href="/pro/module01" style={{ display: "inline-block", marginTop: 14, fontFamily: T.display, fontSize: 14, fontWeight: 700, color: "#fff", textDecoration: "none", background: `linear-gradient(135deg, ${T.primary}, ${T.cyan})`, borderRadius: 10, padding: "11px 20px" }}>Start Module 1</a>
          </div>
        )}

        {status === "ready" && !finished && q && (
          <>
            <p style={{ fontSize: 15, color: T.muted, lineHeight: 1.6, margin: "0 0 22px" }}>
              {starter
                ? "A starter round from Module 1 to get you going. Finish more lessons and your tests draw from everything you have covered."
                : "Pulled at random from the topics you have finished. One attempt each, then the answer is explained."}
            </p>

            {/* progress */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
              <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: T.faint }}>QUESTION {idx + 1} OF {questions.length}</span>
              <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.green }}>{score} right</span>
            </div>
            <div style={{ height: 5, background: T.panelSoft, borderRadius: 3, overflow: "hidden", marginBottom: 22 }}>
              <div style={{ height: "100%", width: `${(idx / questions.length) * 100}%`, background: `linear-gradient(90deg, ${T.primary}, ${T.cyan})`, transition: "width 220ms ease" }} />
            </div>

            <div style={{ background: T.panel, border: `1px solid ${T.edge}`, borderRadius: 14, padding: "20px 22px" }}>
              <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: T.faint, marginBottom: 10 }}>Module {q.moduleN} &middot; {q.moduleTitle}</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: T.ink, lineHeight: 1.4, marginBottom: 16 }}>{q.q}</div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {q.order.map((origIdx) => {
                  const answered = picked !== null;
                  const isPick = picked === origIdx;
                  const isCorrect = origIdx === q.answer;
                  let border: string = T.edgeSoft, bg: string = T.panelSoft, fg: string = T.ink;
                  if (answered && isCorrect) { border = T.green; bg = T.greenSoft; }
                  else if (answered && isPick) { border = T.red; bg = T.redSoft; }
                  else if (answered) { fg = T.muted; }
                  return (
                    <button key={origIdx} className="tm-opt" onClick={() => pick(origIdx)} disabled={answered}
                      style={{ textAlign: "left", fontFamily: T.sans, fontSize: 15, fontWeight: 600, lineHeight: 1.45, color: fg, background: bg, border: `1px solid ${border}`, borderRadius: 9, padding: "12px 15px", cursor: answered ? "default" : "pointer" }}>
                      {q.options[origIdx]}
                    </button>
                  );
                })}
              </div>

              {picked !== null && (
                <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                  {rich && picked !== q.answer && (
                    <div style={{ fontSize: 13.5, lineHeight: 1.55, color: T.muted }}>
                      <span style={{ fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.08em", color: T.red, marginRight: 7 }}>WHY NOT</span>
                      {q.reasons![picked]}
                    </div>
                  )}
                  <div style={{ fontSize: 13.5, lineHeight: 1.55, color: T.body }}>
                    <span style={{ fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.08em", color: T.green, marginRight: 7 }}>{picked === q.answer ? "CORRECT" : "THE ANSWER"}</span>
                    {rich ? q.reasons![q.answer] : q.why}
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginTop: 22 }}>
              <button onClick={next} disabled={picked === null}
                style={{ fontFamily: T.display, fontSize: 15, fontWeight: 700, color: "#fff", background: picked === null ? T.edge : `linear-gradient(135deg, ${T.primary}, ${T.cyan})`, border: "none", borderRadius: 11, padding: "13px 26px", cursor: picked === null ? "not-allowed" : "pointer", opacity: picked === null ? 0.65 : 1 }}>
                {idx + 1 >= questions.length ? "See your score" : "Next question"}
              </button>
            </div>
          </>
        )}

        {finished && (
          <div style={{ marginTop: 20, background: T.panel, border: `1px solid ${T.primary}44`, borderRadius: 14, padding: "26px 24px", textAlign: "center" }}>
            <div style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: T.primary, marginBottom: 10 }}>Your score</div>
            <div style={{ fontFamily: T.display, fontSize: 44, fontWeight: 800, color: T.ink, lineHeight: 1 }}>{score} <span style={{ color: T.faint, fontSize: 28 }}>/ {questions.length}</span></div>
            <p style={{ fontSize: 15.5, color: T.muted, lineHeight: 1.6, margin: "14px auto 0", maxWidth: "46ch" }}>{verdict(score, questions.length)}</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 22 }}>
              <button onClick={load} style={{ fontFamily: T.display, fontSize: 14, fontWeight: 700, color: "#fff", background: `linear-gradient(135deg, ${T.primary}, ${T.cyan})`, border: "none", borderRadius: 10, padding: "12px 22px", cursor: "pointer" }}>Test me again</button>
              <a href="/pro/course" style={{ fontFamily: T.display, fontSize: 14, fontWeight: 700, color: T.ink, textDecoration: "none", background: "transparent", border: `1px solid ${T.edge}`, borderRadius: 10, padding: "12px 22px" }}>Back to course</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function verdict(score: number, total: number): string {
  if (total === 0) return "";
  const pct = score / total;
  if (pct === 1) return "Full marks. That has clearly stuck. Come back and test yourself again after the next module.";
  if (pct >= 0.7) return "Strong. A few to firm up, but you are on top of this. Revisit anything you missed above.";
  if (pct >= 0.4) return "A fair start. Worth going back over the ones you missed, then test yourself again.";
  return "Early days, and that is fine. Revisit those lessons, then come back and have another go.";
}

function Spark() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l2.2 6.3L20.5 10.5 14.2 12.7 12 19l-2.2-6.3L3.5 10.5 9.8 8.3z" />
    </svg>
  );
}
