"use client";

/**
 * Mission 19 incident — "All Frequencies".
 *
 * The coordinated wave, every actor's signature in sequence. Hold the
 * line phase by phase; the campaign's cadence reveals where the
 * coordinator transmits from (setup for M20). Phases:
 *   1. HOLD THE LURES — a multi-channel flood; match each to its layer
 *   2. CONTAIN THE SPREAD — the borrowed-face wave; stop it cold
 *   3. READ THE CADENCE — the rhythm points home
 */

import { useState } from "react";
import { AmberButton, Bubble, Eyebrow, GhostButton } from "../engine/primitives";
import { MONO, T } from "../engine/tokens";
import type { IncidentProps } from "../engine/types";

/* Phase 1 — five incoming attacks; tap the two that would actually
   break a well-layered defense (trick question: none do — but the
   design here is "flag the ones aimed at UN-prepared people"). To
   keep it a clean detection, flag the 3 live threats vs 2 harmless. */
const WAVE = [
  { id: "w1", label: "PHANTOM HOOK: “verify your school account NOW” — mass DM", threat: true },
  { id: "w2", label: "The real PE teacher: “bring trainers Thursday”", threat: false },
  { id: "w3", label: "SIREN: “free tournament entry, first 50 only!”", threat: true },
  { id: "w4", label: "MIMIC: a QR poster in the corridor → gamehub.verify-now.net", threat: true },
  { id: "w5", label: "The library: “new books in, come browse”", threat: false },
];

const CONTAINS = [
  {
    id: "ignore",
    label: "Ignore it — only a handful of accounts got taken",
    correct: false,
    outcome:
      "A handful becomes the whole school by home time — each stolen account messages its friends. Contain small, or clean up huge.",
  },
  {
    id: "contain",
    label: "Blast the code-word reminder school-wide, trigger recovery on the taken accounts, out-of-band checks on",
    correct: true,
    outcome:
      "The spread hits a wall. Every kid you trained runs the out-of-band check on the “lend me your login” messages. Borrowed faces get nothing. The wave stalls.",
  },
  {
    id: "shame",
    label: "Post the names of everyone who got caught so people are careful",
    correct: false,
    outcome:
      "Shame silences victims — now nobody reports, and the spread runs in the dark. Contain the attack, protect the people.",
  },
];

const CADENCES = [
  {
    id: "taunt",
    label: "Reply to the coordinator: “nice try, you lost”",
    correct: false,
    outcome:
      "A reply is a gift — it confirms you, and it throws away the one thing worth having: their silence to measure. Analysts don't taunt. They trace.",
  },
  {
    id: "read",
    label: "Log every actor's timing and map the wave's rhythm — the cadence points to the source",
    correct: true,
    outcome:
      "There it is. Recon at 2, lures at 3, access at 3:02, spread at 3:20 — a schedule that precise runs from one clock. The cadence triangulates the coordinator's transmit point. One case left.",
  },
  {
    id: "wall",
    label: "Just keep blocking every message as it comes",
    correct: false,
    outcome:
      "Blocking survives the wave but learns nothing. The win condition isn't outlasting it — it's reading it. The rhythm is the map.",
  },
];

export default function Mission19Incident({ reduced, audio, onPhaseCleared, onComplete }: IncidentProps) {
  const [phase, setPhase] = useState(1);
  const [flagged, setFlagged] = useState<string[]>([]);
  const [miss, setMiss] = useState<string | null>(null);
  const [contain, setContain] = useState<string | null>(null);
  const [cadence, setCadence] = useState<string | null>(null);
  const [read, setRead] = useState(false);

  const threatCount = WAVE.filter((w) => w.threat).length;

  const tapWave = (w: (typeof WAVE)[number]) => {
    if (flagged.length >= threatCount || flagged.includes(w.id)) return;
    if (w.threat) {
      const done = [...flagged, w.id];
      setFlagged(done);
      setMiss(null);
      audio.latch();
      if (done.length === threatCount) {
        audio.stamp();
        onPhaseCleared(1);
      }
    } else {
      setMiss(w.id);
      audio.thud();
    }
  };

  const pick =
    (set: (v: string | null) => void, list: { id: string; correct: boolean }[], cur: string | null) =>
    (id: string) => {
      if (cur && list.find((o) => o.id === cur)?.correct) return;
      set(id);
      const o = list.find((x) => x.id === id);
      if (o?.correct) audio.latch();
      else audio.thud();
    };

  const containChoice = CONTAINS.find((o) => o.id === contain) ?? null;
  const cadenceChoice = CADENCES.find((o) => o.id === cadence) ?? null;

  return (
    <div>
      {phase === 1 && (
        <div style={{ marginBottom: 18, maxWidth: 560 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: T.threatRed, marginBottom: 8 }}>
            INTERCEPTED — ALL ACTORS, ON EVERY FREQUENCY
          </div>
          <Bubble who="villain">
            <em>&ldquo;All of us, all at once, little operative. One school can't hold against the whole network. Let's watch you try.&rdquo;</em>
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

      {/* ---------------- phase 1: hold the lures ---------------- */}
      {phase === 1 && (
        <div style={{ maxWidth: 640 }}>
          <Eyebrow text="Phase 1 — Five signals hit at once. Flag the THREE that are the wave. Leave the real ones." color={T.actionAmber} />
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {WAVE.map((w) => {
              const done = flagged.includes(w.id);
              const missed = miss === w.id;
              return (
                <button
                  key={w.id}
                  onClick={() => tapWave(w)}
                  className="sr-btn"
                  disabled={done}
                  style={{
                    textAlign: "left",
                    fontFamily: MONO,
                    fontSize: 12.5,
                    lineHeight: 1.5,
                    color: done ? T.confirmedGreen : missed ? T.threatRed : T.fileInk,
                    background: done ? `${T.confirmedGreen}14` : T.paper,
                    border: "none",
                    outline: `2px solid ${done ? T.confirmedGreen : missed ? T.threatRed : "transparent"}`,
                    outlineOffset: -2,
                    borderRadius: 2,
                    padding: "11px 13px",
                    boxShadow: "0 2px 0 rgba(0,0,0,0.5)",
                    cursor: done ? "default" : "pointer",
                  }}
                >
                  {done ? "■ FLAGGED · " : "□ "}
                  {w.label}
                </button>
              );
            })}
          </div>
          <p role="status" style={{ margin: "12px 0 0", fontSize: 13, color: flagged.length === threatCount ? T.confirmedGreen : T.textSecondary }}>
            {flagged.length === threatCount
              ? "LURES HELD — three actors flagged, two real messages left alone. Even in a flood, you don't panic-flag the innocent."
              : miss
                ? "That's a real message — pressure, prizes, and costume-links are the wave. Normal school notices aren't."
                : `${flagged.length}/${threatCount} flagged. Read each one: is it pressure/prize/costume, or just school?`}
          </p>
          {flagged.length === threatCount && (
            <div style={{ marginTop: 14 }}>
              <AmberButton label="LURES HELD — CONTAIN THE SPREAD" onClick={() => { audio.click(); setPhase(2); }} />
            </div>
          )}
        </div>
      )}

      {/* ---------------- phase 2: contain the spread ---------------- */}
      {phase === 2 && (
        <div style={{ maxWidth: 640 }}>
          <Eyebrow text="Phase 2 — A few accounts fell, and now they're messaging friends. Stop the spread." color={T.actionAmber} />
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {CONTAINS.map((c) => {
              const isChosen = contain === c.id;
              const stateColor = c.correct ? T.confirmedGreen : T.threatRed;
              return (
                <button key={c.id} onClick={() => pick(setContain, CONTAINS, contain)(c.id)} className="sr-btn" disabled={!!contain && !!containChoice?.correct}
                  style={{ textAlign: "left", fontSize: 13.5, lineHeight: 1.55, color: isChosen ? stateColor : T.textPrimary, background: isChosen ? `${stateColor}14` : T.panelRaised, border: `1px solid ${isChosen ? stateColor : T.hairline}`, borderRadius: 3, padding: "12px 14px", cursor: contain && containChoice?.correct ? "default" : "pointer" }}>
                  {c.label}
                </button>
              );
            })}
          </div>
          {containChoice && (
            <div role="status" style={{ marginTop: 14, borderLeft: `2px solid ${containChoice.correct ? T.confirmedGreen : T.threatRed}`, paddingLeft: 14 }}>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{containChoice.outcome}</p>
              <div style={{ marginTop: 12 }}>
                {containChoice.correct ? (
                  <AmberButton label="SPREAD CONTAINED — READ THE CADENCE" onClick={() => { audio.stamp(); onPhaseCleared(2); setPhase(3); }} />
                ) : (
                  <GhostButton label="RECONSIDER" onClick={() => setContain(null)} />
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------- phase 3: read the cadence ---------------- */}
      {phase === 3 && (
        <div style={{ maxWidth: 640 }}>
          <div style={{ margin: "0 0 14px", background: T.paper, borderRadius: 2, padding: "14px 16px", boxShadow: "0 2px 0 rgba(0,0,0,0.5)" }}>
            <p style={{ margin: 0, fontFamily: MONO, fontSize: 12.5, lineHeight: 1.7, color: T.fileInk }}>
              WAVE TIMELINE — recon 14:00 · lures 15:00 · access 15:02 · spread 15:20 · probe 15:45. Interval precision: machine-exact.
            </p>
          </div>
          <Eyebrow text="Phase 3 — The wave is failing. Its timing is showing. What does the analyst do?" color={T.actionAmber} />
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {CADENCES.map((c) => {
              const isChosen = cadence === c.id;
              const stateColor = c.correct ? T.confirmedGreen : T.threatRed;
              return (
                <button key={c.id} onClick={() => pick(setCadence, CADENCES, cadence)(c.id)} className="sr-btn" disabled={!!cadence && !!cadenceChoice?.correct}
                  style={{ textAlign: "left", fontSize: 13.5, lineHeight: 1.55, color: isChosen ? stateColor : T.textPrimary, background: isChosen ? `${stateColor}14` : T.panelRaised, border: `1px solid ${isChosen ? stateColor : T.hairline}`, borderRadius: 3, padding: "12px 14px", cursor: cadence && cadenceChoice?.correct ? "default" : "pointer" }}>
                  {c.label}
                </button>
              );
            })}
          </div>
          {cadenceChoice && (
            <div role="status" style={{ marginTop: 14, borderLeft: `2px solid ${cadenceChoice.correct ? T.confirmedGreen : T.threatRed}`, paddingLeft: 14 }}>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{cadenceChoice.outcome}</p>
              <div style={{ marginTop: 12 }}>
                {cadenceChoice.correct ? (
                  !read ? (
                    <AmberButton
                      label="TRIANGULATE THE SOURCE"
                      onClick={() => {
                        setRead(true);
                        audio.stamp();
                        onPhaseCleared(3);
                        window.setTimeout(onComplete, reduced ? 250 : 700);
                      }}
                    />
                  ) : (
                    <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.06em", color: T.confirmedGreen, margin: 0 }}>
                      SOURCE TRIANGULATED — THE LINE HELD, AND THE WAVE DREW US A MAP HOME. ONE CASE LEFT.
                    </p>
                  )
                ) : (
                  <GhostButton label="RECONSIDER" onClick={() => setCadence(null)} />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
