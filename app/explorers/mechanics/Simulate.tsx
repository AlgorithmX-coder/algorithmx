"use client";

/**
 * SIMULATE — anticipation as defense (debuts M06 "Levers").
 *
 * The con plays out one move at a time. At each pause the child
 * predicts the attacker's NEXT move, then watches the reveal. Right
 * or wrong, the con continues — the lesson is reading one move ahead,
 * and a wrong guess teaches as loudly as a right one.
 *
 * Safety line: the child predicts attacks, never authors them.
 */

import { useState } from "react";
import { AmberButton, Bubble, Eyebrow } from "../engine/primitives";
import { MONO, T } from "../engine/tokens";
import type { MechanicProps, SimulatePayload } from "../engine/types";

export default function Simulate({ payload, reduced, audio, onEvent }: MechanicProps<SimulatePayload>) {
  const [stepIdx, setStepIdx] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [misses, setMisses] = useState(0);
  const [finished, setFinished] = useState(false);

  const step = payload.steps[stepIdx];
  const last = stepIdx === payload.steps.length - 1;
  const revealed = chosen !== null;

  const predict = (i: number) => {
    if (revealed) return;
    setChosen(i);
    if (i === step.answer) {
      audio.latch();
      onEvent({ kind: "HIT" });
    } else {
      setMisses((m) => m + 1);
      audio.thud();
      onEvent({ kind: "MISS" });
    }
  };

  const next = () => {
    audio.click();
    if (last) {
      setFinished(true);
      audio.stamp();
      window.setTimeout(
        () => onEvent({ kind: "COMPLETED", mastery: misses === 0 }),
        reduced ? 250 : 700,
      );
    } else {
      setStepIdx((s) => s + 1);
      setChosen(null);
    }
  };

  return (
    <section style={{ maxWidth: 700, margin: "0 auto" }}>
      <Eyebrow text={payload.intro} color={T.actionAmber} />

      {/* live-con progress */}
      <div style={{ display: "flex", gap: 8, margin: "12px 0 14px" }}>
        {payload.steps.map((_, i) => (
          <span
            key={i}
            style={{
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: "0.08em",
              padding: "3px 8px",
              borderRadius: 2,
              border: `1px solid ${i === stepIdx ? T.arcCyan : T.hairline}`,
              color: i < stepIdx ? T.confirmedGreen : i === stepIdx ? T.arcCyan : T.textDisabled,
            }}
          >
            {i < stepIdx ? "■" : "□"} MOVE {i + 1}
          </span>
        ))}
      </div>

      {/* the attacker's move so far */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: T.threatRed, marginBottom: 8 }}>
          LIVE CON — RANGE PLAYBACK
        </div>
        <Bubble who="villain">
          <em>{step.scene}</em>
        </Bubble>
      </div>

      {/* the prediction */}
      <div style={{ background: T.panel, border: `1px solid ${T.hairline}`, borderRadius: 3, padding: "16px 18px" }}>
        <p style={{ margin: 0, fontFamily: MONO, fontSize: 12.5, letterSpacing: "0.06em", color: T.actionAmber }}>
          PREDICT THE NEXT MOVE — {step.question}
        </p>
        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
          {step.options.map((o, i) => {
            const isChosen = chosen === i;
            const isAnswer = revealed && i === step.answer;
            const color = isAnswer ? T.confirmedGreen : isChosen ? T.threatRed : T.textPrimary;
            return (
              <button
                key={i}
                onClick={() => predict(i)}
                className="sr-btn"
                disabled={revealed}
                style={{
                  textAlign: "left",
                  fontSize: 13.5,
                  lineHeight: 1.5,
                  color,
                  background: isAnswer || isChosen ? `${color}14` : T.panelRaised,
                  border: `1px solid ${isAnswer || isChosen ? color : T.hairline}`,
                  borderRadius: 3,
                  padding: "12px 14px",
                  cursor: revealed ? "default" : "pointer",
                }}
              >
                {o}
              </button>
            );
          })}
        </div>
      </div>

      {/* the reveal */}
      {revealed && (
        <div
          role="status"
          style={{
            marginTop: 14,
            borderLeft: `2px solid ${chosen === step.answer ? T.confirmedGreen : T.threatRed}`,
            paddingLeft: 14,
          }}
        >
          <p style={{ margin: 0, fontFamily: MONO, fontSize: 11, letterSpacing: "0.1em", color: chosen === step.answer ? T.confirmedGreen : T.threatRed }}>
            {chosen === step.answer ? "CALLED IT." : "THE CON MOVED DIFFERENTLY:"}
          </p>
          <p style={{ margin: "8px 0 0", fontSize: 14, lineHeight: 1.6, color: T.textPrimary }}>{step.reveal}</p>
          <div style={{ marginTop: 12 }}>
            {finished ? (
              <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.06em", color: T.confirmedGreen, margin: 0 }}>
                {payload.doneLine}
              </p>
            ) : (
              <AmberButton label={last ? "END SIMULATION" : "NEXT MOVE"} onClick={next} />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
