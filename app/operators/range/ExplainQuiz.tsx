"use client";

/* Task-variety "explain it" question (UAT): a short comprehension beat that
 * interrupts an input-heavy capture after a cleared stage, so a module isn't
 * type-run-next the whole way through. Options shuffle and each carries its own
 * feedback; pick the correct one to unlock the next step, after which the options
 * lock so the confirming feedback stays on screen. Shared by the input-heavy
 * modules (M5 pilot + rollout). */

import { C, MONO, AnswerReveal } from "./Engagement";

export type ExplainOption = { text: string; correct?: boolean; feedback: string };

export default function ExplainQuiz({
  q,
  options,
  onCorrect,
}: {
  q: string;
  options: ExplainOption[];
  onCorrect: () => void;
}) {
  return (
    <div style={{ borderTop: `1px solid ${C.green}33`, paddingTop: 12 }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: C.cyan, fontWeight: 700, marginBottom: 8 }}>▶ EXPLAIN IT · before you move on</div>
      <div style={{ fontSize: 13.5, color: C.ink, lineHeight: 1.5, marginBottom: 10 }}>{q}</div>
      <AnswerReveal
        options={options.map((o) => ({ text: o.text, correct: o.correct, reason: o.feedback }))}
        onAnswered={() => onCorrect()}
      />
    </div>
  );
}
