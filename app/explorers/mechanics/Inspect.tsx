"use client";

/**
 * INSPECT v3 (practice) — SELECT-then-SUBMIT. The child taps to select every
 * part they think is a clue, then submits their whole answer at once. A wrong
 * pick (selecting a safe part) or a miss fails the submit and makes them think
 * again, so it's a real judgment call, not tap-until-it-lights-up.
 */

import { useEffect, useState } from "react";
import { playWren, stopWren } from "../engine/audio";
import { AmberButton, Bubble, DeviceFrame } from "../engine/primitives";
import { MONO, T } from "../engine/tokens";
import type { EvidenceSegment, InspectPayload, MechanicProps } from "../engine/types";

export default function Inspect({ payload, reduced, audio, onEvent, voiceOn }: MechanicProps<InspectPayload>) {
  const allSegs: EvidenceSegment[] = [...payload.header.map((h) => h.seg), ...payload.body.flat()];
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<null | { wrong: string[]; missed: number }>(null);
  const [wrongOnce, setWrongOnce] = useState(false);
  const [locked, setLocked] = useState(false);
  const [passed, setPassed] = useState(false);
  const [reviewReady, setReviewReady] = useState(false);
  // After a correct answer, WREN reviews it aloud and CONTINUE is held so they
  // read + hear it through first.
  useEffect(() => {
    if (!passed) return;
    if (payload.doneAudio) playWren(payload.doneAudio, !!voiceOn);
    const t = setTimeout(() => setReviewReady(true), 15000);
    return () => { clearTimeout(t); stopWren(); };
  }, [passed]);

  const toggle = (seg: EvidenceSegment) => {
    if (passed || locked) return;
    setResult(null);
    setSelected((s) => { const n = new Set(s); n.has(seg.id) ? n.delete(seg.id) : n.add(seg.id); return n; });
    audio.click();
  };

  const submit = () => {
    if (passed || locked || selected.size === 0) return;
    const wrong = [...selected].filter((id) => !allSegs.find((s) => s.id === id)?.tellId);
    const chosenTells = new Set([...selected].map((id) => allSegs.find((s) => s.id === id)?.tellId).filter(Boolean) as string[]);
    const missed = payload.tells.filter((t) => !chosenTells.has(t.id)).length;
    if (wrong.length === 0 && missed === 0) {
      setPassed(true); audio.stamp(); // COMPLETED fires on the CONTINUE click below
    } else {
      setWrongOnce(true); audio.thud();
      setResult({ wrong, missed });
      setLocked(true); setTimeout(() => setLocked(false), 4000);
      onEvent({ kind: "MISS" });
    }
  };

  const renderSeg = (seg: EvidenceSegment) => {
    const sel = selected.has(seg.id);
    const flagged = !!result && result.wrong.includes(seg.id);
    const done = passed && !!seg.tellId;
    const col = flagged ? T.threatRed : done ? T.confirmedGreen : sel ? T.actionAmber : `${T.fileInk}44`;
    return (
      <button
        key={seg.id}
        onClick={() => toggle(seg)}
        className="sr-btn"
        aria-pressed={sel}
        style={{
          font: "inherit", fontFamily: seg.mono ? MONO : "inherit", fontSize: seg.mono ? 13.5 : "inherit",
          color: T.fileInk, background: flagged ? `${T.threatRed}26` : done ? `${T.confirmedGreen}22` : sel ? `${T.actionAmber}2E` : "transparent",
          border: `${sel || flagged || done ? 2 : 1}px ${sel || flagged || done ? "solid" : "dashed"} ${col}`,
          borderRadius: 5, padding: "3px 7px", margin: "1px 1px", cursor: passed ? "default" : "pointer",
        }}
      >
        {seg.text}
      </button>
    );
  };

  const feedback = result
    ? [
        result.wrong.length ? "One of your picks is actually fine to see, take another look at the red one." : "",
        result.missed ? `You've still got ${result.missed} to find.` : "",
      ].filter(Boolean).join(" ")
    : "";

  return (
    <section style={{ maxWidth: 600, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 600, color: passed ? T.confirmedGreen : T.actionAmber }}>
          {selected.size} selected
        </span>
      </div>

      <DeviceFrame app={payload.device?.app ?? "MESSAGES"} owner={payload.device?.owner ?? "CAPTURED DEVICE"}>
        <div style={{ background: T.paper, color: T.fileInk, padding: "20px 22px", fontSize: 15.5, lineHeight: 2, position: "relative" }}>
          <div style={{ fontFamily: MONO, fontSize: 12.5, borderBottom: `1px solid ${T.fileInk}22`, paddingBottom: 12, marginBottom: 14 }}>
            {payload.header.map((h) => (
              <div key={h.seg.id} style={{ marginTop: 6 }}>
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

      {feedback && (
        <div className="sr-msg" style={{ marginTop: 14 }} role="status">
          <Bubble who="wren" tone={T.threatRed}>{feedback}</Bubble>
        </div>
      )}

      {!passed && (
        <div style={{ marginTop: 16 }}>
          {locked ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 7, width: 220 }} aria-label="look again">
              <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", color: T.threatRed }}>LOOK AGAIN...</span>
              <span style={{ display: "block", height: 4, borderRadius: 2, background: T.hairline, overflow: "hidden" }}>
                <span key={String(result?.missed) + String(result?.wrong.length)} style={{ display: "block", height: "100%", background: T.threatRed, transformOrigin: "left", transform: "scaleX(0)", animation: "sr-read 4000ms linear forwards" }} />
              </span>
            </div>
          ) : (
            <AmberButton label="SUBMIT MY ANSWER →" onClick={submit} />
          )}
        </div>
      )}

      {passed && (
        <div className="sr-msg" style={{ marginTop: 18, display: "grid", gap: 12 }}>
          <Bubble who="wren" tone={T.confirmedGreen}>{payload.doneLine}</Bubble>
          {reviewReady ? (
            <AmberButton label="CONTINUE →" onClick={() => onEvent({ kind: "COMPLETED", mastery: !wrongOnce })} />
          ) : (
            <div style={{ display: "inline-flex", flexDirection: "column", gap: 7, minWidth: 220 }} aria-label="review time">
              <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", color: T.textSecondary }}>LOOK IT OVER...</span>
              <span style={{ display: "block", height: 4, borderRadius: 2, background: T.hairline, overflow: "hidden" }}>
                <span style={{ display: "block", height: "100%", background: T.confirmedGreen, transformOrigin: "left", transform: "scaleX(0)", animation: "sr-read 15000ms linear forwards" }} />
              </span>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
