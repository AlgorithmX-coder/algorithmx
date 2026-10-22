"use client";

/* Task-variety "explain it" question (UAT): a short comprehension beat that
 * interrupts an input-heavy capture after a cleared stage, so a module isn't
 * type-run-next the whole way through. Options shuffle and each carries its own
 * feedback; pick the correct one to unlock the next step, after which the options
 * lock so the confirming feedback stays on screen. Shared by the input-heavy
 * modules (M5 pilot + rollout). */

import { useState } from "react";
import { C, MONO, shuffle } from "./Engagement";

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
  const [picked, setPicked] = useState<number | null>(null);
  const [opts] = useState(() => shuffle(options));
  const solved = picked !== null && !!opts[picked].correct;
  return (
    <div style={{ borderTop: `1px solid ${C.green}33`, paddingTop: 12 }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: C.cyan, fontWeight: 700, marginBottom: 8 }}>▶ EXPLAIN IT · before you move on</div>
      <div style={{ fontSize: 13.5, color: C.ink, lineHeight: 1.5, marginBottom: 10 }}>{q}</div>
      <div style={{ display: "grid", gap: 8 }}>
        {opts.map((o, i) => {
          const isP = picked === i;
          return (
            <div key={i}>
              <button disabled={solved} onClick={() => { setPicked(i); if (o.correct) onCorrect(); }} className="co-opt" style={{ width: "100%", textAlign: "left", padding: "10px 12px", borderRadius: 9, border: `1px solid ${isP ? (o.correct ? C.green : C.red) : C.line}`, background: isP ? (o.correct ? "rgba(85,217,140,.08)" : "rgba(242,109,114,.06)") : C.carbon, color: C.ink, fontSize: 13, lineHeight: 1.4, cursor: solved ? "default" : "pointer" }}>
                <span style={{ fontFamily: MONO, color: isP ? (o.correct ? C.green : C.red) : C.mute, marginRight: 8 }}>{isP ? (o.correct ? "✓" : "✗") : String.fromCharCode(65 + i)}</span>{o.text}
              </button>
              {isP && <div style={{ padding: "7px 12px 2px", fontSize: 12.5, color: o.correct ? "#bff3d3" : C.soft, lineHeight: 1.5 }}>{o.feedback}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
