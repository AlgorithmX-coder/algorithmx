"use client";

/**
 * DECIDE — an incident-response call with visible consequences.
 * Choose, see the outcome play out, learn why. Wrong calls cost a
 * retry, never XP; a first-try correct call earns quiet mastery.
 */

import { useState } from "react";
import { AmberButton, GhostButton } from "../engine/primitives";
import { MONO, T } from "../engine/tokens";
import type { DecidePayload, MechanicProps } from "../engine/types";

export default function Decide({ payload, audio, onEvent }: MechanicProps<DecidePayload>) {
  const [chosen, setChosen] = useState<string | null>(null);
  const [wrongOnce, setWrongOnce] = useState(false);
  const option = payload.options.find((o) => o.id === chosen) ?? null;

  const choose = (id: string) => {
    if (chosen) return;
    const o = payload.options.find((x) => x.id === id);
    if (!o) return;
    setChosen(id);
    if (o.correct) {
      audio.latch();
      onEvent({ kind: "HIT" });
    } else {
      setWrongOnce(true);
      audio.thud();
      onEvent({ kind: "MISS" });
    }
  };

  return (
    <section style={{ maxWidth: 700, margin: "0 auto" }}>
      {/* No instruction heading here — the amber instruction strip above
          (rendered by PlayStage) is the single, canonical instruction. */}
      <div style={{ background: T.panel, border: `1px solid ${T.hairline}`, borderRadius: 3, padding: "20px 22px" }}>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: T.textPrimary }}>{payload.situation}</p>
        <p style={{ margin: "12px 0 0", fontFamily: MONO, fontSize: 13, letterSpacing: "0.04em", color: T.textSecondary }}>
          {payload.prompt}
        </p>
      </div>

      <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
        {payload.options.map((o) => {
          const isChosen = chosen === o.id;
          const showState = isChosen;
          const stateColor = o.correct ? T.confirmedGreen : T.threatRed;
          return (
            <button
              key={o.id}
              onClick={() => choose(o.id)}
              className="sr-btn"
              disabled={!!chosen}
              style={{
                textAlign: "left",
                fontFamily: MONO,
                fontSize: 13,
                lineHeight: 1.5,
                color: showState ? stateColor : T.textPrimary,
                background: showState ? `${stateColor}14` : T.panelRaised,
                border: `1px solid ${showState ? stateColor : T.hairline}`,
                borderRadius: 3,
                padding: "12px 14px",
                cursor: chosen ? "default" : "pointer",
              }}
            >
              {o.label}
            </button>
          );
        })}
      </div>

      {option && (
        <div
          role="status"
          style={{
            marginTop: 14,
            borderLeft: `2px solid ${option.correct ? T.confirmedGreen : T.threatRed}`,
            paddingLeft: 14,
          }}
        >
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: T.textPrimary }}>{option.outcome}</p>
          <div style={{ marginTop: 12 }}>
            {option.correct ? (
              <AmberButton label="LOG THE CALL" onClick={() => onEvent({ kind: "COMPLETED", mastery: !wrongOnce })} />
            ) : (
              <GhostButton label="RECONSIDER" onClick={() => setChosen(null)} />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
