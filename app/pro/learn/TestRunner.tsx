"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { T } from "./tokens";
import type { PoolQuestion } from "./quizPool";

/* The shared "Test me" runner: it takes a `load` that returns a set of
 * questions plus the intro line to show, then runs them one at a time,
 * single attempt with the answer and explanation revealed, and finishes on a
 * score with a "Test me again". Both the full-page Test Me (/pro/testme) and
 * the in-lesson modal use it, so the self-test looks and behaves identically
 * wherever it is taken. Chrome around it (headers) belongs to the caller. */

type Status = "loading" | "ready" | "empty";

export default function TestRunner({ load, emptyNode, secondaryAction }: {
  load: () => Promise<{ questions: PoolQuestion[]; note: string }>;
  emptyNode: ReactNode;
  secondaryAction?: ReactNode; // shown beside "Test me again" on the score screen
}) {
  const [status, setStatus] = useState<Status>("loading");
  const [questions, setQuestions] = useState<PoolQuestion[]>([]);
  const [note, setNote] = useState("");
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const run = useCallback(async () => {
    setStatus("loading");
    setIdx(0); setPicked(null); setScore(0); setFinished(false);
    try {
      const { questions: qs, note: n } = await load();
      if (qs.length === 0) { setStatus("empty"); return; }
      setQuestions(qs); setNote(n); setStatus("ready");
    } catch {
      setStatus("empty");
    }
  }, [load]);

  useEffect(() => { run(); }, [run]);

  const q = questions[idx];
  const rich = !!q && Array.isArray(q.reasons) && q.reasons.length === q.options.length;

  function pick(origIdx: number) {
    if (picked !== null || !q) return;
    setPicked(origIdx);
    if (origIdx === q.answer) setScore((s) => s + 1);
  }
  function next() {
    if (idx + 1 >= questions.length) { setFinished(true); return; }
    setIdx((i) => i + 1); setPicked(null);
  }

  if (status === "loading") {
    return <p style={{ fontSize: 15.5, color: T.muted, lineHeight: 1.6, marginTop: 20 }}>Building your test&hellip;</p>;
  }

  if (status === "empty") {
    return <>{emptyNode}</>;
  }

  if (finished) {
    return (
      <div style={{ marginTop: 20, background: T.panel, border: `1px solid ${T.primary}44`, borderRadius: 14, padding: "26px 24px", textAlign: "center" }}>
        <div style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: T.primary, marginBottom: 10 }}>Your score</div>
        <div style={{ fontFamily: T.display, fontSize: 44, fontWeight: 800, color: T.ink, lineHeight: 1 }}>{score} <span style={{ color: T.faint, fontSize: 28 }}>/ {questions.length}</span></div>
        <p style={{ fontSize: 15.5, color: T.muted, lineHeight: 1.6, margin: "14px auto 0", maxWidth: "46ch" }}>{verdict(score, questions.length)}</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 22 }}>
          <button onClick={run} style={{ fontFamily: T.display, fontSize: 14, fontWeight: 700, color: "#fff", background: `linear-gradient(135deg, ${T.primary}, ${T.cyan})`, border: "none", borderRadius: 10, padding: "12px 22px", cursor: "pointer" }}>Test me again</button>
          {secondaryAction}
        </div>
      </div>
    );
  }

  if (!q) return null;

  return (
    <>
      <p style={{ fontSize: 15, color: T.muted, lineHeight: 1.6, margin: "0 0 22px" }}>{note}</p>

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
