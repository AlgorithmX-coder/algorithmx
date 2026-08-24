"use client";

/**
 * UNMASK (practice) — "names lie, addresses don't" (M01, Skill 3). Each message
 * shows only a friendly display name. The child taps a card to peel the name back
 * and reveal the real email address underneath, then calls REAL or FAKE on every
 * one and submits together. Look first, judge second: a two-step act so a trusted
 * name is never taken at face value. Wrong submit -> the fakes they missed are
 * marked and they think again (never tap-until-green).
 */

import { useEffect, useState } from "react";
import { playWren, playWrenNudge, stopWren } from "../engine/audio";
import { AmberButton } from "../engine/primitives";
import { MONO, BODY, T } from "../engine/tokens";
import type { MechanicProps, UnmaskPayload } from "../engine/types";

type Verdict = "REAL" | "FAKE";

export default function Unmask({ payload, audio, onEvent, voiceOn }: MechanicProps<UnmaskPayload>) {
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [verdicts, setVerdicts] = useState<Record<string, Verdict>>({});
  const [submitted, setSubmitted] = useState(false);
  const [wrongOnce, setWrongOnce] = useState(false);
  const [locked, setLocked] = useState(false);
  const [passed, setPassed] = useState(false);
  const [reviewReady, setReviewReady] = useState(false);

  const allRevealed = payload.items.every((i) => revealed.has(i.id));
  const allJudged = payload.items.every((i) => verdicts[i.id]);
  const correct = (i: (typeof payload.items)[number]) => (verdicts[i.id] === "REAL") === i.real;
  const allCorrect = payload.items.every(correct);

  // After a clean submit, WREN reviews it aloud and CONTINUE is held so the
  // reveals + reasons get read + heard through.
  useEffect(() => {
    if (!passed) return;
    if (payload.doneAudio) playWren(payload.doneAudio, !!voiceOn);
    const t = setTimeout(() => setReviewReady(true), 15000);
    return () => { clearTimeout(t); stopWren(); };
  }, [passed]);

  const reveal = (id: string) => {
    if (submitted || locked || revealed.has(id)) return;
    audio.click();
    setRevealed((s) => new Set(s).add(id));
  };
  const judge = (id: string, v: Verdict) => {
    if (submitted || locked || !revealed.has(id)) return;
    audio.click();
    setVerdicts((m) => ({ ...m, [id]: v }));
  };
  const submit = () => {
    if (submitted || locked || !allRevealed || !allJudged) return;
    if (allCorrect) {
      setSubmitted(true);
      setPassed(true);
      audio.stamp();
    } else {
      setWrongOnce(true);
      setSubmitted(true);
      audio.thud();
      playWrenNudge(!!voiceOn); // "not quite, look again"
      onEvent({ kind: "MISS" });
      setLocked(true);
      setTimeout(() => { setLocked(false); setSubmitted(false); }, 4000);
    }
  };

  return (
    <section style={{ maxWidth: 640, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <span style={{ fontFamily: MONO, fontSize: 13, color: allRevealed ? T.arcCyan : T.textSecondary }}>
          {revealed.size}/{payload.items.length} unmasked
        </span>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {payload.items.map((it) => {
          const isRevealed = revealed.has(it.id);
          const v = verdicts[it.id];
          const isCorrect = correct(it);
          const showTruth = submitted;
          const edge = showTruth ? (isCorrect ? T.confirmedGreen : T.threatRed) : isRevealed ? T.arcCyan : T.hairline;
          return (
            <div key={it.id} style={{ background: T.paper, color: T.fileInk, borderRadius: 4, border: `1px solid ${edge}`, boxShadow: "0 2px 0 rgba(0,0,0,0.5)", overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: `1px solid ${T.fileInk}18` }}>
                <span style={{ fontFamily: BODY, fontSize: 14.5, fontWeight: 700 }}>{it.displayName}</span>
                <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", opacity: 0.55 }}>{payload.sourceLabel ?? "SENDER"}</span>
              </div>

              {!isRevealed ? (
                <button
                  onClick={() => reveal(it.id)}
                  className="sr-btn"
                  disabled={submitted || locked}
                  style={{ width: "100%", textAlign: "left", fontFamily: MONO, fontSize: 12.5, color: T.actionAmber, background: `${T.actionAmber}12`, border: "none", borderTop: `1px dashed ${T.actionAmber}`, padding: "12px 14px", cursor: "pointer" }}
                >
                  {payload.revealText ?? "▸ TAP TO REVEAL THE REAL ADDRESS"}
                </button>
              ) : (
                <div style={{ padding: "12px 14px" }}>
                  <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.06em", opacity: 0.6, marginBottom: 3 }}>REAL ADDRESS</div>
                  <div style={{ fontFamily: MONO, fontSize: 14, wordBreak: "break-all", marginBottom: 12 }}>{it.address}</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    {(["REAL", "FAKE"] as Verdict[]).map((opt) => {
                      const chosen = v === opt;
                      const bg = showTruth
                        ? (opt === "REAL") === it.real ? T.confirmedGreen : chosen ? T.threatRed : "transparent"
                        : chosen ? T.arcCyan : "transparent";
                      const filled = bg !== "transparent";
                      return (
                        <button
                          key={opt}
                          onClick={() => judge(it.id, opt)}
                          className="sr-btn"
                          disabled={submitted || locked}
                          aria-pressed={chosen}
                          style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", padding: "6px 14px", borderRadius: 2, cursor: submitted || locked ? "default" : "pointer", color: filled ? T.paper : T.fileInk, background: bg, border: `1px solid ${T.fileInk}55` }}
                        >
                          {opt === "REAL" ? "REALLY " + payload.brand.toUpperCase() : "A FAKE"}
                        </button>
                      );
                    })}
                    {showTruth && v && (
                      <span role="status" style={{ fontSize: 12.5, lineHeight: 1.5, color: isCorrect ? "#1F7A4D" : "#8A2E2E", flex: 1, minWidth: 190 }}>
                        {isCorrect ? it.why : `Look again — ${it.why}`}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 16 }}>
        {passed ? (
          reviewReady ? (
            <AmberButton label="CONTINUE →" onClick={() => onEvent({ kind: "COMPLETED", mastery: !wrongOnce })} />
          ) : (
            <div style={{ display: "inline-flex", flexDirection: "column", gap: 7, minWidth: 220 }} aria-label="review time">
              <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", color: T.confirmedGreen }}>{payload.doneLine}</span>
              <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.06em", color: T.textSecondary }}>LOOK IT OVER...</span>
              <span style={{ display: "block", height: 4, borderRadius: 2, background: T.hairline, overflow: "hidden" }}>
                <span style={{ display: "block", height: "100%", background: T.confirmedGreen, transformOrigin: "left", transform: "scaleX(0)", animation: "sr-read 15000ms linear forwards" }} />
              </span>
            </div>
          )
        ) : locked ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 7, width: 240 }} aria-label="look again">
            <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", color: T.threatRed }}>LOOK AGAIN...</span>
            <span style={{ display: "block", height: 4, borderRadius: 2, background: T.hairline, overflow: "hidden" }}>
              <span key={String(wrongOnce)} style={{ display: "block", height: "100%", background: T.threatRed, transformOrigin: "left", transform: "scaleX(0)", animation: "sr-read 4000ms linear forwards" }} />
            </span>
          </div>
        ) : allRevealed && allJudged ? (
          <AmberButton label="SUBMIT MY CALLS →" onClick={submit} />
        ) : (
          <span style={{ fontFamily: MONO, fontSize: 12, color: T.textSecondary }}>
            {allRevealed ? "Now call REAL or FAKE on each one." : "Unmask every sender, then call each one."}
          </span>
        )}
      </div>
    </section>
  );
}
