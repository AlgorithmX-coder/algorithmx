"use client";

import { useCallback } from "react";
import { T } from "./tokens";
import { buildTest, collectDoneTopicIds } from "./quizPool";
import TestRunner from "./TestRunner";

/* Cyber Pro "Test me": an optional, anytime self-test the learner can take
 * whenever they like. It pulls a handful of questions at random from the
 * topics they have finished so far (or Module 1 as a starter), one at a time,
 * single attempt with the answer and explanation revealed, then a score.
 *
 * It never blocks anything and saves nothing; it is purely for the learner to
 * check what has stuck. Progress is read the same way the hub reads it:
 * localStorage checkpoints merged with the server record. The run itself is
 * the shared TestRunner, so it matches the in-lesson "Test me" exactly. */

export default function TestMe() {
  const load = useCallback(async () => {
    const { questions, starter } = await buildTest(await collectDoneTopicIds(), 10);
    const note = starter
      ? "A starter round from Module 1 to get you going. Finish more lessons and your tests draw from everything you have covered."
      : "Pulled at random from the topics you have finished. One attempt each, then the answer is explained.";
    return { questions, note };
  }, []);

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

        <TestRunner
          load={load}
          emptyNode={
            <div style={{ marginTop: 20, background: T.panel, border: `1px solid ${T.edge}`, borderRadius: 12, padding: "20px 22px" }}>
              <p style={{ fontSize: 15.5, color: T.body, lineHeight: 1.6, margin: 0 }}>There are no questions to pull yet. Finish a lesson first, then come back and test yourself on it.</p>
              <a href="/pro/module01" style={{ display: "inline-block", marginTop: 14, fontFamily: T.display, fontSize: 14, fontWeight: 700, color: "#fff", textDecoration: "none", background: `linear-gradient(135deg, ${T.primary}, ${T.cyan})`, borderRadius: 10, padding: "11px 20px" }}>Start Module 1</a>
            </div>
          }
          secondaryAction={
            <a href="/pro/course" style={{ fontFamily: T.display, fontSize: 14, fontWeight: 700, color: T.ink, textDecoration: "none", background: "transparent", border: `1px solid ${T.edge}`, borderRadius: 10, padding: "12px 22px" }}>Back to course</a>
          }
        />
      </div>
    </div>
  );
}

function Spark() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l2.2 6.3L20.5 10.5 14.2 12.7 12 19l-2.2-6.3L3.5 10.5 9.8 8.3z" />
    </svg>
  );
}
