"use client";

/**
 * Mission 15 incident — "Hall of Mirrors" (Block 3 finale).
 *
 * Five login pages, one real. Trust the tools. Phases:
 *   1. THE EYES TEST — accept that looking cannot settle it
 *   2. READ THE ADDRESSES — five domains, one real (incl. the
 *      subdomain suffix trap)
 *   3. THE LIE DETECTOR — the vault fills once; the registry trace
 *      lands breadcrumb ④: six actors, one architect
 */

import { useState } from "react";
import { AmberButton, Bubble, Eyebrow, GhostButton } from "../engine/primitives";
import { MONO, T } from "../engine/tokens";
import type { IncidentProps } from "../engine/types";

const EYES = [
  {
    id: "logo",
    label: "Pick the one with the crispest logo",
    correct: false,
    outcome:
      "All five logos are the SAME FILE — four are stolen copies of the fifth. Crispness is free.",
  },
  {
    id: "speed",
    label: "Pick the one that loads fastest",
    correct: false,
    outcome:
      "Mirror sites are tiny — they often load FASTER than the real thing. Speed measures nothing.",
  },
  {
    id: "none",
    label: "None — looking can't settle this. Read the addresses.",
    correct: true,
    outcome:
      "Correct call. Five identical faces means zero visual information. The addresses are the only witnesses left.",
  },
];

const ADDRESSES = [
  { id: "a1", label: "gamehub-login.net/signin", real: false, hint: "Right to left: gamehub-login.net is its own site — a costume with a hyphen." },
  { id: "a2", label: "gamehub.com/login", real: true, hint: "" },
  { id: "a3", label: "account-gamehub.com/signin", real: false, hint: "account-gamehub.com is NOT gamehub.com. The words before the slash must match exactly." },
  { id: "a4", label: "gamehub.security-check.net/login", real: false, hint: "Read right to left: security-check.net. The gamehub in front is decoration." },
  { id: "a5", label: "gamehub.com.account-verify.net/login", real: false, hint: "The nastiest trap: it STARTS with gamehub.com — but keep reading. It ends at account-verify.net. The END is the owner." },
];

const TRACES = [
  {
    id: "random",
    label: "Four random scammers copied the same site by coincidence",
    correct: false,
    outcome:
      "Registered the same week, same hidden registrar, same name-pattern? Four strangers don't share handwriting.",
  },
  {
    id: "architect",
    label: "One entity registered ALL four mirrors — the same signature behind every actor's infrastructure",
    correct: true,
    outcome:
      "Confirmed. The registry signature matches PHANTOM HOOK's lure domains, SIREN's prize factory, the clone-call routing — everything. Six actors. One architect. The board just became one case.",
  },
  {
    id: "gamehub",
    label: "GameHub built them to test its users",
    correct: false,
    outcome:
      "Companies don't phish their own players — and the registrations trace AWAY from GameHub, into the dark. Follow the records, not the guesses.",
  },
];

export default function Mission15Incident({ reduced, audio, onPhaseCleared, onComplete }: IncidentProps) {
  const [phase, setPhase] = useState(1);
  const [eyes, setEyes] = useState<string | null>(null);
  const [wrongAddr, setWrongAddr] = useState<string | null>(null);
  const [realFound, setRealFound] = useState(false);
  const [trace, setTrace] = useState<string | null>(null);
  const [filed, setFiled] = useState(false);

  const eyesChoice = EYES.find((o) => o.id === eyes) ?? null;
  const traceChoice = TRACES.find((o) => o.id === trace) ?? null;

  const tapAddress = (a: (typeof ADDRESSES)[number]) => {
    if (realFound) return;
    if (a.real) {
      setRealFound(true);
      setWrongAddr(null);
      audio.stamp();
      onPhaseCleared(2);
    } else {
      setWrongAddr(a.id);
      audio.thud();
    }
  };

  const wrongAddrObj = ADDRESSES.find((a) => a.id === wrongAddr);

  return (
    <div>
      {phase === 1 && (
        <div style={{ marginBottom: 18, maxWidth: 560 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: T.threatRed, marginBottom: 8 }}>
            INTERCEPTED — MIMIC, ON THE WIRE
          </div>
          <Bubble who="villain">
            <em>&ldquo;Four of my mirrors, one of your originals, darling. Even the pixels can't tell themselves apart.&rdquo;</em>
          </Bubble>
        </div>
      )}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[1, 2, 3].map((p) => (
          <span key={p} style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", padding: "3px 8px", borderRadius: 2, border: `1px solid ${p === phase ? T.threatRed : T.hairline}`, color: p === phase ? T.threatRed : p < phase ? T.confirmedGreen : T.textDisabled }}>
            {p < phase ? "■" : "□"} PHASE {p}
          </span>
        ))}
      </div>

      {/* ---------------- phase 1: the eyes test ---------------- */}
      {phase === 1 && (
        <div style={{ maxWidth: 640 }}>
          <Eyebrow text="Phase 1 — Five identical login pages fill the wall. Find the real one… by looking?" color={T.actionAmber} />
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {EYES.map((o) => {
              const isChosen = eyes === o.id;
              const stateColor = o.correct ? T.confirmedGreen : T.threatRed;
              return (
                <button key={o.id} onClick={() => { if (eyes && eyesChoice?.correct) return; setEyes(o.id); if (o.correct) audio.latch(); else audio.thud(); }} className="sr-btn" disabled={!!eyes && !!eyesChoice?.correct}
                  style={{ textAlign: "left", fontSize: 13.5, lineHeight: 1.55, color: isChosen ? stateColor : T.textPrimary, background: isChosen ? `${stateColor}14` : T.panelRaised, border: `1px solid ${isChosen ? stateColor : T.hairline}`, borderRadius: 3, padding: "12px 14px", cursor: eyes && eyesChoice?.correct ? "default" : "pointer" }}>
                  {o.label}
                </button>
              );
            })}
          </div>
          {eyesChoice && (
            <div role="status" style={{ marginTop: 14, borderLeft: `2px solid ${eyesChoice.correct ? T.confirmedGreen : T.threatRed}`, paddingLeft: 14 }}>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{eyesChoice.outcome}</p>
              <div style={{ marginTop: 12 }}>
                {eyesChoice.correct ? (
                  <AmberButton label="EYES DOWN — ADDRESSES UP" onClick={() => { audio.stamp(); onPhaseCleared(1); setPhase(2); }} />
                ) : (
                  <GhostButton label="RECONSIDER" onClick={() => setEyes(null)} />
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------- phase 2: read the addresses ---------------- */}
      {phase === 2 && (
        <div style={{ maxWidth: 640 }}>
          <Eyebrow text="Phase 2 — The five address bars, side by side. Tap the ONLY real one." color={T.actionAmber} />
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {ADDRESSES.map((a) => (
              <button
                key={a.id}
                onClick={() => tapAddress(a)}
                className="sr-btn"
                style={{
                  textAlign: "left",
                  fontFamily: MONO,
                  fontSize: 13,
                  letterSpacing: "0.04em",
                  lineHeight: 1.5,
                  color: realFound && a.real ? T.confirmedGreen : wrongAddr === a.id ? T.threatRed : T.fileInk,
                  background: T.paper,
                  border: "none",
                  outline: `2px solid ${realFound && a.real ? T.confirmedGreen : wrongAddr === a.id ? T.threatRed : "transparent"}`,
                  outlineOffset: -2,
                  borderRadius: 2,
                  padding: "12px 14px",
                  boxShadow: "0 2px 0 rgba(0,0,0,0.5)",
                  cursor: realFound ? "default" : "pointer",
                }}
              >
                {a.label}
              </button>
            ))}
          </div>
          <p role="status" style={{ margin: "12px 0 0", fontSize: 13, color: realFound ? T.confirmedGreen : T.textSecondary }}>
            {realFound
              ? "REAL SITE CONFIRMED — gamehub.com, read right to left, ending exactly where it should."
              : wrongAddrObj
                ? wrongAddrObj.hint
                : "Right to left. The words just before the first slash are the owner."}
          </p>
          {realFound && (
            <div style={{ marginTop: 14 }}>
              <AmberButton label="ONE REAL — RUN THE DETECTOR" onClick={() => { audio.click(); setPhase(3); }} />
            </div>
          )}
        </div>
      )}

      {/* ---------------- phase 3: the lie detector + breadcrumb ---------------- */}
      {phase === 3 && (
        <div style={{ maxWidth: 640 }}>
          <div style={{ margin: "0 0 14px", background: T.paper, borderRadius: 2, padding: "14px 16px", boxShadow: "0 2px 0 rgba(0,0,0,0.5)" }}>
            <p style={{ margin: 0, fontFamily: MONO, fontSize: 13, lineHeight: 1.7, color: T.fileInk }}>
              VAULT AUTOFILL SWEEP: mirror 1 … silent. mirror 2 … silent. mirror 3 … silent. mirror 4 … silent. gamehub.com … FILLED.
              <br />
              REGISTRY TRACE on the four silent domains: one registrant. Hidden. Same signature as… loading…
            </p>
          </div>
          <Eyebrow text="Phase 3 — The vault spoke once and went quiet four times. Now read the registry trace: who built the mirrors?" color={T.actionAmber} />
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {TRACES.map((o) => {
              const isChosen = trace === o.id;
              const stateColor = o.correct ? T.confirmedGreen : T.threatRed;
              return (
                <button key={o.id} onClick={() => { if (trace && traceChoice?.correct) return; setTrace(o.id); if (o.correct) audio.latch(); else audio.thud(); }} className="sr-btn" disabled={!!trace && !!traceChoice?.correct}
                  style={{ textAlign: "left", fontSize: 13.5, lineHeight: 1.55, color: isChosen ? stateColor : T.textPrimary, background: isChosen ? `${stateColor}14` : T.panelRaised, border: `1px solid ${isChosen ? stateColor : T.hairline}`, borderRadius: 3, padding: "12px 14px", cursor: trace && traceChoice?.correct ? "default" : "pointer" }}>
                  {o.label}
                </button>
              );
            })}
          </div>
          {traceChoice && (
            <div role="status" style={{ marginTop: 14, borderLeft: `2px solid ${traceChoice.correct ? T.confirmedGreen : T.threatRed}`, paddingLeft: 14 }}>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{traceChoice.outcome}</p>
              <div style={{ marginTop: 12 }}>
                {traceChoice.correct ? (
                  !filed ? (
                    <AmberButton
                      label="FILE THE ARCHITECT"
                      onClick={() => {
                        setFiled(true);
                        audio.stamp();
                        onPhaseCleared(3);
                        window.setTimeout(onComplete, reduced ? 250 : 700);
                      }}
                    />
                  ) : (
                    <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.06em", color: T.confirmedGreen, margin: 0 }}>
                      FILED — SIX ACTORS, ONE ARCHITECT. THE BOARD IS ONE CASE NOW.
                    </p>
                  )
                ) : (
                  <GhostButton label="RECONSIDER" onClick={() => setTrace(null)} />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
