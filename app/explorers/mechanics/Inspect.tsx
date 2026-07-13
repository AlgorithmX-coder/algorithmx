"use client";

/**
 * INSPECT — examine an artifact on paper; flag what doesn't belong.
 * The tier's core verb: anomaly detection. Evidence is the only
 * surface interference may touch; the analyst log (ARC chrome) never
 * corrupts.
 */

import { useState } from "react";
import { Eyebrow, AmberButton, DeviceFrame } from "../engine/primitives";
import { MONO, T } from "../engine/tokens";
import type { EvidenceSegment, InspectPayload, MechanicProps } from "../engine/types";

export default function Inspect({ payload, reduced, audio, onEvent }: MechanicProps<InspectPayload>) {
  const [found, setFound] = useState<string[]>([]);
  const [missed, setMissed] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "hit" | "miss"; text: string } | null>(null);
  const allFound = found.length === payload.tells.length;

  const tap = (seg: EvidenceSegment) => {
    if (seg.tellId) {
      if (found.includes(seg.tellId)) return;
      const tell = payload.tells.find((t) => t.id === seg.tellId);
      if (!tell) return;
      setFound((f) => [...f, tell.id]);
      setFeedback({ kind: "hit", text: `FLAGGED — ${tell.label}. ${tell.why}` });
      audio.latch();
      onEvent({ kind: "HIT" });
    } else {
      setMissed(true);
      setFeedback({ kind: "miss", text: "That part checks out. Keep looking." });
      audio.thud();
      onEvent({ kind: "MISS" });
    }
  };

  const renderSeg = (seg: EvidenceSegment) => (
    <button
      key={seg.id}
      className={seg.tellId ? "sr-tell" : "sr-decoy"}
      data-hit={(seg.tellId && found.includes(seg.tellId)) || undefined}
      onClick={() => tap(seg)}
      style={seg.mono ? { fontFamily: MONO, fontSize: 13 } : undefined}
    >
      {seg.text}
    </button>
  );

  return (
    <section className="sr-two-col" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 280px", gap: 20, alignItems: "start" }}>
      <div style={{ position: "relative" }}>
        <Eyebrow text={payload.intro} color={T.actionAmber} />
        <div style={{ marginTop: 12 }}>
        <DeviceFrame app={payload.device?.app ?? "MESSAGES"} owner={payload.device?.owner ?? "CAPTURED DEVICE"}>
        <div
          className={reduced ? undefined : "sr-whisper"}
          style={{
            background: T.paper,
            color: T.fileInk,
            padding: "22px 24px",
            fontSize: 14.5,
            lineHeight: 1.65,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ fontFamily: MONO, fontSize: 12.5, borderBottom: `1px solid ${T.fileInk}22`, paddingBottom: 12, marginBottom: 14 }}>
            {payload.header.map((h) => (
              <div key={h.seg.id} style={{ marginTop: 4 }}>
                <span style={{ opacity: 0.55 }}>{h.label.padEnd(6, " ")}</span>
                {renderSeg(h.seg)}
              </div>
            ))}
          </div>
          {payload.body.map((para, i) => (
            <p key={i} style={{ margin: i === payload.body.length - 1 ? 0 : "0 0 12px" }}>
              {para.map((seg) => renderSeg(seg))}
            </p>
          ))}
        </div>
        </DeviceFrame>
        </div>
      </div>

      <aside style={{ background: T.panel, border: `1px solid ${T.hairline}`, borderRadius: 3, padding: "16px 16px 18px", position: "sticky", top: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <Eyebrow text="Analyst log" />
          <span style={{ fontFamily: MONO, fontSize: 12, color: allFound ? T.confirmedGreen : T.textSecondary }}>
            {found.length}/{payload.tells.length}
          </span>
        </div>
        <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
          {payload.tells.map((t) => {
            const hit = found.includes(t.id);
            return (
              <div
                key={t.id}
                style={{
                  fontFamily: MONO,
                  fontSize: 12,
                  padding: "8px 10px",
                  borderRadius: 2,
                  border: `1px solid ${hit ? T.confirmedGreen : T.hairline}`,
                  color: hit ? T.confirmedGreen : T.textDisabled,
                  background: hit ? `${T.confirmedGreen}14` : "transparent",
                }}
              >
                {hit ? "■ " : "□ "}
                {hit ? t.label : "████████████"}
              </div>
            );
          })}
        </div>

        {feedback && (
          <p
            role="status"
            style={{
              fontSize: 12.5,
              lineHeight: 1.55,
              margin: "14px 0 0",
              color: feedback.kind === "hit" ? T.confirmedGreen : T.textSecondary,
            }}
          >
            {feedback.text}
          </p>
        )}

        {allFound && (
          <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
            <p style={{ margin: 0, fontSize: 13, color: T.textSecondary, fontStyle: "italic" }}>
              &ldquo;{payload.doneLine}&rdquo;
            </p>
            <AmberButton label="FILE THE FINDINGS" onClick={() => onEvent({ kind: "COMPLETED", mastery: !missed })} />
          </div>
        )}
      </aside>
    </section>
  );
}
