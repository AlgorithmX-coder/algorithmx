"use client";

/**
 * BUILD — constructive defense (debuts M11 "The Master Key").
 *
 * Slot-by-slot assembly: each slot offers parts; good parts latch in
 * green, bad parts explain themselves and can be swapped. When every
 * slot holds, the build is stress-tested and the attack bounces —
 * the landing page's "watch them hold," on screen.
 */

import { useState } from "react";
import { AmberButton, Eyebrow } from "../engine/primitives";
import { MONO, T } from "../engine/tokens";
import type { BuildPayload, MechanicProps } from "../engine/types";

export default function Build({ payload, reduced, audio, onEvent }: MechanicProps<BuildPayload>) {
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [misses, setMisses] = useState(0);
  const [tested, setTested] = useState(false);

  const allGood = payload.slots.every((s) => {
    const p = picks[s.id];
    return p && s.options.find((o) => o.id === p)?.good;
  });

  const pick = (slotId: string, optId: string) => {
    const slot = payload.slots.find((s) => s.id === slotId);
    if (!slot || tested) return;
    const current = picks[slotId];
    if (current && slot.options.find((o) => o.id === current)?.good) return;
    const opt = slot.options.find((o) => o.id === optId);
    if (!opt) return;
    setPicks((p) => ({ ...p, [slotId]: optId }));
    if (opt.good) {
      audio.latch();
      onEvent({ kind: "HIT" });
    } else {
      setMisses((m) => m + 1);
      audio.thud();
      onEvent({ kind: "MISS" });
    }
  };

  const runTest = () => {
    if (!allGood || tested) return;
    setTested(true);
    audio.stamp();
    window.setTimeout(
      () => onEvent({ kind: "COMPLETED", mastery: misses === 0 }),
      reduced ? 400 : 1400,
    );
  };

  return (
    <section style={{ maxWidth: 640 }}>
      <Eyebrow text={payload.intro} color={T.actionAmber} />
      <p style={{ margin: "10px 0 14px", fontFamily: MONO, fontSize: 12.5, letterSpacing: "0.08em", color: T.arcCyan }}>
        BUILDING: {payload.target}
      </p>

      <div style={{ display: "grid", gap: 16 }}>
        {payload.slots.map((slot) => {
          const chosen = picks[slot.id];
          const chosenOpt = slot.options.find((o) => o.id === chosen);
          const locked = !!chosenOpt?.good;
          return (
            <div key={slot.id} style={{ background: T.panel, border: `1px solid ${locked ? `${T.confirmedGreen}66` : T.hairline}`, borderRadius: 3, padding: "14px 16px" }}>
              <div style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: "0.1em", color: locked ? T.confirmedGreen : T.textSecondary, marginBottom: 10 }}>
                {locked ? "■" : "□"} {slot.label}
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {slot.options.map((o) => {
                  const isChosen = chosen === o.id;
                  const color = isChosen ? (o.good ? T.confirmedGreen : T.threatRed) : T.textPrimary;
                  return (
                    <button
                      key={o.id}
                      onClick={() => pick(slot.id, o.id)}
                      className="sr-btn"
                      disabled={locked || tested}
                      style={{
                        textAlign: "left",
                        fontFamily: MONO,
                        fontSize: 12.5,
                        lineHeight: 1.5,
                        color,
                        background: isChosen ? `${color}14` : T.panelRaised,
                        border: `1px solid ${isChosen ? color : T.hairline}`,
                        borderRadius: 3,
                        padding: "10px 12px",
                        cursor: locked || tested ? "default" : "pointer",
                      }}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
              {chosenOpt && (
                <p role="status" style={{ margin: "10px 0 0", fontSize: 13, lineHeight: 1.55, color: chosenOpt.good ? T.confirmedGreen : T.threatRed }}>
                  {chosenOpt.why}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 16 }}>
        {!tested ? (
          allGood ? (
            <AmberButton label="RUN THE STRESS TEST" onClick={runTest} />
          ) : (
            <p style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: "0.06em", color: T.textSecondary, margin: 0 }}>
              Fill every slot with a part that holds.
            </p>
          )
        ) : (
          <div role="status" style={{ borderLeft: `2px solid ${T.confirmedGreen}`, paddingLeft: 14 }}>
            <p style={{ margin: 0, fontFamily: MONO, fontSize: 12, letterSpacing: "0.08em", color: T.confirmedGreen }}>
              {payload.testLine}
            </p>
            <p style={{ margin: "8px 0 0", fontSize: 14, lineHeight: 1.6, color: T.textPrimary }}>{payload.doneLine}</p>
          </div>
        )}
      </div>
    </section>
  );
}
