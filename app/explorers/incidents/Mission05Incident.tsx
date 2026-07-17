"use client";

/**
 * Mission 05 incident — "The Flood" (Block 1 finale).
 *
 * PHANTOM HOOK opens every channel at once. Volume is the weapon —
 * and hidden in the spray is one spear that did its homework. Three
 * phases, none repeating the cycle mechanics:
 *   1. HOLD THE QUEUE — six messages, tap the four that belong to
 *      the storm (two are legit; flooding teaches false positives)
 *   2. FIND THE SPEAR — one storm message KNOWS things; find it
 *   3. TRACE THE DATA — where did the spear's details come from?
 *      Breadcrumb ②: the actors are connected.
 */

import { useState } from "react";
import { AmberButton, Bubble, Eyebrow, GhostButton } from "../engine/primitives";
import { MONO, T } from "../engine/tokens";
import type { IncidentProps } from "../engine/types";

/* Phase 1 — the wall. Four storm messages share the fingerprints
   (countdown / verify-domain / login ask); two are genuinely fine. */
const WALL = [
  { id: "w1", label: "[SMS] LIBRARY ALERT: locked! fix within 12 hrs → lib-renew-check.net", storm: true },
  { id: "w2", label: "[SCHOOL APP] Reminder: mufti day Friday — bring £1 for charity", storm: false },
  { id: "w3", label: "[DM] game account flagged!! verify quick → account-fix-verify.net", storm: true },
  { id: "w4", label: "[EMAIL] “Canteen Office”: balance expiring in 6 hrs → pay-canteen-verify.net", storm: true },
  { id: "w5", label: "[DM] Leo: bro did you see the match last night", storm: false },
  { id: "w6", label: "[SMS] Your parcel needs a fee within 24 hrs → parcel-hold-verify.net", storm: true },
];

/* Phase 2 — the four storm messages again; one is a spear. */
const STORM = [
  { id: "s1", label: "LIBRARY ALERT — locked, 12 hrs, generic “dear student”", spear: false },
  { id: "s2", label: "GAME FLAG — verify quick, no name, blasted to hundreds", spear: false },
  { id: "s3", label: "“Hi! Your 8G form room moved — Mr. Ortega asked me to send you the new login link”", spear: true },
  { id: "s4", label: "PARCEL FEE — 24 hrs, sent to every number in the area", spear: false },
];

/* Phase 3 — where did the spear's details come from? */
const TRACES = [
  {
    id: "lucky",
    label: "Lucky guess — form rooms aren't secret",
    correct: false,
    outcome:
      "A guess doesn't name your form AND your teacher AND time it to room changes. That's not luck. That's data.",
  },
  {
    id: "bought",
    label: "Bought — the details match a collector's file",
    correct: true,
    outcome:
      "Confirmed. Form, teacher, timing — all in the file PACKRAT auctioned last case. PHANTOM HOOK was the buyer. The actors are CONNECTED. Filed.",
  },
  {
    id: "newsletter",
    label: "The school newsletter mentioned it",
    correct: false,
    outcome:
      "The newsletter doesn't know which form YOU'RE in. Somebody assembled that. Think about who collects crumbs.",
  },
];

export default function Mission05Incident({ reduced, audio, onPhaseCleared, onComplete }: IncidentProps) {
  const [phase, setPhase] = useState(1);
  const [held, setHeld] = useState<string[]>([]);
  const [wallMiss, setWallMiss] = useState<string | null>(null);
  const [wrongSpear, setWrongSpear] = useState<string | null>(null);
  const [spearFound, setSpearFound] = useState(false);
  const [trace, setTrace] = useState<string | null>(null);
  const [filed, setFiled] = useState(false);

  const stormCount = WALL.filter((w) => w.storm).length;

  const tapWall = (w: (typeof WALL)[number]) => {
    if (held.length >= stormCount || held.includes(w.id)) return;
    if (w.storm) {
      const done = [...held, w.id];
      setHeld(done);
      setWallMiss(null);
      audio.latch();
      if (done.length === stormCount) {
        audio.stamp();
        onPhaseCleared(1);
      }
    } else {
      setWallMiss(w.id);
      audio.thud();
    }
  };

  const tapSpear = (s: (typeof STORM)[number]) => {
    if (spearFound) return;
    if (s.spear) {
      setSpearFound(true);
      setWrongSpear(null);
      audio.stamp();
      onPhaseCleared(2);
    } else {
      setWrongSpear(s.id);
      audio.thud();
    }
  };

  const chooseTrace = (id: string) => {
    if (trace && TRACES.find((t) => t.id === trace)?.correct) return;
    setTrace(id);
    const t = TRACES.find((x) => x.id === id);
    if (t?.correct) audio.latch();
    else audio.thud();
  };

  const traceChoice = TRACES.find((t) => t.id === trace) ?? null;

  return (
    <div>
      {phase === 1 && (
        <div style={{ marginBottom: 18, maxWidth: 560 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: T.threatRed, marginBottom: 8 }}>
            INTERCEPTED — PHANTOM HOOK, ON THE WIRE
          </div>
          <Bubble who="villain">
            <em>&ldquo;You cut one line, minnow. Tonight I cast a thousand. Somebody always bites.&rdquo;</em>
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

      {/* ---------------- phase 1: hold the queue ---------------- */}
      {phase === 1 && (
        <div style={{ maxWidth: 640 }}>
          <Eyebrow text="Phase 1 — The wall: six messages just landed. Tap every one that belongs to the storm. Don't flag the real ones." color={T.actionAmber} />
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {WALL.map((w) => {
              const done = held.includes(w.id);
              const missed = wallMiss === w.id;
              return (
                <button
                  key={w.id}
                  onClick={() => tapWall(w)}
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
          <p role="status" style={{ margin: "12px 0 0", fontSize: 13, color: held.length === stormCount ? T.confirmedGreen : T.textSecondary }}>
            {held.length === stormCount
              ? "QUEUE HELD — four flagged, two cleared. False positives waste analyst time; you flagged clean."
              : wallMiss
                ? "That one's real. Check the fingerprints: countdown, verify-domain, login ask."
                : `${held.length}/${stormCount} flagged. Fingerprints: the clock, the domain family, the ask.`}
          </p>
          {held.length === stormCount && (
            <div style={{ marginTop: 14 }}>
              <AmberButton label="QUEUE HELD — SCAN FOR THE SPEAR" onClick={() => { audio.click(); setPhase(2); }} />
            </div>
          )}
        </div>
      )}

      {/* ---------------- phase 2: find the spear ---------------- */}
      {phase === 2 && (
        <div style={{ maxWidth: 640 }}>
          <Eyebrow text="Phase 2 — Four storm messages. Three are spray. One did its homework. Tap the spear." color={T.actionAmber} />
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {STORM.map((s) => (
              <button
                key={s.id}
                onClick={() => tapSpear(s)}
                className="sr-btn"
                style={{
                  textAlign: "left",
                  fontFamily: MONO,
                  fontSize: 12.5,
                  lineHeight: 1.5,
                  color: spearFound && s.spear ? T.confirmedGreen : wrongSpear === s.id ? T.threatRed : T.textPrimary,
                  background: spearFound && s.spear ? `${T.confirmedGreen}14` : T.panelRaised,
                  border: `1px solid ${spearFound && s.spear ? T.confirmedGreen : wrongSpear === s.id ? T.threatRed : T.hairline}`,
                  borderRadius: 3,
                  padding: "12px 14px",
                  cursor: spearFound ? "default" : "pointer",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
          <p role="status" style={{ margin: "12px 0 0", fontSize: 13, color: spearFound ? T.confirmedGreen : T.textSecondary }}>
            {spearFound
              ? "SPEAR ISOLATED — it knows your form, your teacher, your timing. That's research, not luck."
              : wrongSpear
                ? "That's spray — loud, generic, sent to hundreds. Which message knows things about YOU?"
                : "Spray guesses. Spears know. Find the one that knows."}
          </p>
          {spearFound && (
            <div style={{ marginTop: 14 }}>
              <AmberButton label="SPEAR ISOLATED — TRACE IT" onClick={() => { audio.click(); setPhase(3); }} />
            </div>
          )}
        </div>
      )}

      {/* ---------------- phase 3: trace the data ---------------- */}
      {phase === 3 && (
        <div style={{ maxWidth: 640 }}>
          <Eyebrow text="Phase 3 — The spear knew your form and your teacher. Where did that data COME from?" color={T.actionAmber} />
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {TRACES.map((t) => {
              const isChosen = trace === t.id;
              const stateColor = t.correct ? T.confirmedGreen : T.threatRed;
              return (
                <button
                  key={t.id}
                  onClick={() => chooseTrace(t.id)}
                  className="sr-btn"
                  disabled={!!trace && !!traceChoice?.correct}
                  style={{ textAlign: "left", fontSize: 13.5, lineHeight: 1.55, color: isChosen ? stateColor : T.textPrimary, background: isChosen ? `${stateColor}14` : T.panelRaised, border: `1px solid ${isChosen ? stateColor : T.hairline}`, borderRadius: 3, padding: "12px 14px", cursor: trace && traceChoice?.correct ? "default" : "pointer" }}
                >
                  {t.label}
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
                      label="FILE THE CONNECTION"
                      onClick={() => {
                        setFiled(true);
                        audio.stamp();
                        onPhaseCleared(3);
                        window.setTimeout(onComplete, reduced ? 250 : 700);
                      }}
                    />
                  ) : (
                    <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.06em", color: T.confirmedGreen, margin: 0 }}>
                      FILED — TWO ACTORS, ONE SUPPLY CHAIN. STORM OVER.
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
