"use client";

/**
 * INSPECT v2 — single-zone per the Kid Contract: one focal object
 * (the captured phone), a big found-counter on the evidence itself,
 * and WREN's explanations arriving as toasts UNDER the evidence
 * instead of a competing side panel.
 */

import { useState } from "react";
import { AmberButton, Bubble, DeviceFrame } from "../engine/primitives";
import { MONO, T } from "../engine/tokens";
import type { EvidenceSegment, InspectPayload, MechanicProps } from "../engine/types";

export default function Inspect({ payload, reduced, audio, onEvent }: MechanicProps<InspectPayload>) {
  const [found, setFound] = useState<string[]>([]);
  const [missed, setMissed] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const allFound = found.length === payload.tells.length;

  const tap = (seg: EvidenceSegment) => {
    if (seg.tellId) {
      if (found.includes(seg.tellId)) return;
      const tell = payload.tells.find((t) => t.id === seg.tellId);
      if (!tell) return;
      setFound((f) => [...f, tell.id]);
      setNote({ ok: true, text: tell.why });
      audio.latch();
      onEvent({ kind: "HIT" });
    } else {
      setMissed(true);
      setNote({ ok: false, text: "That part is normal. Keep looking." });
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
    <section style={{ maxWidth: 560, margin: "0 auto" }}>
      {/* big found-counter rides the evidence, not a side panel */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <span style={{ fontFamily: MONO, fontSize: 17, fontWeight: 600, color: allFound ? T.confirmedGreen : T.actionAmber }}>
          FOUND {found.length} / {payload.tells.length}
        </span>
      </div>

      <DeviceFrame app={payload.device?.app ?? "MESSAGES"} owner={payload.device?.owner ?? "CAPTURED DEVICE"}>
        <div
          className={reduced ? undefined : "sr-whisper"}
          style={{ background: T.paper, color: T.fileInk, padding: "22px 24px", fontSize: 15.5, lineHeight: 1.7, position: "relative", overflow: "hidden" }}
        >
          <div style={{ fontFamily: MONO, fontSize: 12.5, borderBottom: `1px solid ${T.fileInk}22`, paddingBottom: 12, marginBottom: 14 }}>
            {payload.header.map((h) => (
              <div key={h.seg.id} style={{ marginTop: 4 }}>
                <span style={{ opacity: 0.55 }}>{h.label.padEnd(6, " ")}</span>
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

      {/* WREN reacts under the evidence */}
      {note && (
        <div className="sr-msg" style={{ marginTop: 14 }} role="status">
          <Bubble who="wren" tone={note.ok ? T.confirmedGreen : undefined}>
            {note.ok ? (
              <>
                <span style={{ display: "block", fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.12em", color: T.confirmedGreen, marginBottom: 6 }}>
                  CLUE FOUND
                </span>
                {note.text}
              </>
            ) : (
              note.text
            )}
          </Bubble>
        </div>
      )}

      {allFound && (
        <div className="sr-msg" style={{ marginTop: 18, display: "grid", gap: 12 }}>
          <Bubble who="wren" tone={T.confirmedGreen}>
            {payload.doneLine}
          </Bubble>
          <AmberButton label="SKILL CHECK →" onClick={() => onEvent({ kind: "COMPLETED", mastery: !missed })} />
        </div>
      )}
    </section>
  );
}
