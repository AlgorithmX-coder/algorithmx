"use client";

/**
 * Mission 10 incident — "Caller ID" (Block 2 finale).
 *
 * An urgent call arrives in a voice the operative loves. Run the
 * protocol calmly — the mission's whole toolkit under real pressure.
 * Phases:
 *   1. THE CALL — first response: the code-word question
 *   2. THE WOBBLE — hold the line when the voice pushes back
 *   3. THE TRACE — breadcrumb ③: three actors, one supply chain
 */

import { useState } from "react";
import { AmberButton, Bubble, Eyebrow, GhostButton } from "../engine/primitives";
import { MONO, T } from "../engine/tokens";
import type { IncidentProps } from "../engine/types";

const CALLS = [
  {
    id: "comply",
    label: "Read the code out, it's MUM and she's in trouble",
    correct: false,
    outcome:
      "The code was the whole heist. The account it unlocks empties in minutes. The voice was perfect; the ask was the tell.",
  },
  {
    id: "codeword",
    label: "Stay calm and ask the code-word question",
    correct: true,
    outcome:
      "The line goes quiet for exactly one beat too long. Real mum answers instantly, or laughs at you. Silence IS your answer.",
  },
  {
    id: "panic",
    label: "Hang up and turn the phone off",
    correct: false,
    outcome:
      "You're safe, but the clone dials your little brother next. Run the protocol properly and the whole family gets protected.",
  },
];

const WOBBLES = [
  {
    id: "give",
    label: "“Okay, okay, the code is…”",
    correct: false,
    outcome:
      "Pressure beat protocol by two seconds. That's all a clone ever needs. Hold one beat longer.",
  },
  {
    id: "hold",
    label: "Hold the line: “no code word, no codes.” Then call mum's REAL number yourself",
    correct: true,
    outcome:
      "You checked another way, the M07 move, under real pressure. Real mum answers from work, confused and totally fine. Your ears lied. Your protocol didn't.",
  },
  {
    id: "memory",
    label: "Quiz the voice about childhood memories",
    correct: false,
    outcome:
      "The clone trained on years of family videos. It may know the memories better than you. A memory quiz tests style, not truth. Only the code word does.",
  },
];

const TRACES = [
  {
    id: "confused",
    label: "It really was mum, just confused",
    correct: false,
    outcome:
      "Real mum was at work with her phone on silent, in a meeting. Whoever called knew the exact minute she'd be unreachable. That's not confusion. That's coordination.",
  },
  {
    id: "chain",
    label: "A clone: PACKRAT's scraped audio, reading GHOSTWRITER's script, dialed by MIMIC",
    correct: true,
    outcome:
      "Confirmed. Training audio from scraped family videos: PACKRAT's harvest. The script's pressure lines: GHOSTWRITER's pen. The voice: MIMIC's mask. Three actors. One supply chain. The dossier board just grew a spine.",
  },
  {
    id: "prank",
    label: "A classmate's prank with a voice app",
    correct: false,
    outcome:
      "A prank doesn't know your bank, your mum's schedule, and your number. This took planning and money. That points to ZERO.",
  },
];

export default function Mission10Incident({ reduced, audio, onPhaseCleared, onComplete }: IncidentProps) {
  const [phase, setPhase] = useState(1);
  const [call, setCall] = useState<string | null>(null);
  const [wobble, setWobble] = useState<string | null>(null);
  const [trace, setTrace] = useState<string | null>(null);
  const [closed, setClosed] = useState(false);

  const pick =
    (set: (v: string | null) => void, list: { id: string; correct: boolean }[], cur: string | null) =>
    (id: string) => {
      if (cur && list.find((o) => o.id === cur)?.correct) return;
      set(id);
      const o = list.find((x) => x.id === id);
      if (o?.correct) audio.latch();
      else audio.thud();
    };

  const callChoice = CALLS.find((o) => o.id === call) ?? null;
  const wobbleChoice = WOBBLES.find((o) => o.id === wobble) ?? null;
  const traceChoice = TRACES.find((o) => o.id === trace) ?? null;

  const stage = (
    intro: string,
    list: { id: string; label: string; correct: boolean; outcome: string }[],
    chosen: string | null,
    choiceObj: { correct: boolean; outcome: string } | null,
    onPick: (id: string) => void,
    advanceLabel: string,
    onAdvance: () => void,
    resetFn: () => void,
  ) => (
    <div style={{ maxWidth: 640 }}>
      <Eyebrow text={intro} color={T.actionAmber} />
      <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
        {list.map((o) => {
          const isChosen = chosen === o.id;
          const stateColor = o.correct ? T.confirmedGreen : T.threatRed;
          return (
            <button
              key={o.id}
              onClick={() => onPick(o.id)}
              className="sr-btn"
              disabled={!!chosen && !!choiceObj?.correct}
              style={{ textAlign: "left", fontSize: 13.5, lineHeight: 1.55, color: isChosen ? stateColor : T.textPrimary, background: isChosen ? `${stateColor}14` : T.panelRaised, border: `1px solid ${isChosen ? stateColor : T.hairline}`, borderRadius: 3, padding: "12px 14px", cursor: chosen && choiceObj?.correct ? "default" : "pointer" }}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      {choiceObj && (
        <div role="status" style={{ marginTop: 14, borderLeft: `2px solid ${choiceObj.correct ? T.confirmedGreen : T.threatRed}`, paddingLeft: 14 }}>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{choiceObj.outcome}</p>
          <div style={{ marginTop: 12 }}>
            {choiceObj.correct ? (
              <AmberButton label={advanceLabel} onClick={onAdvance} />
            ) : (
              <GhostButton label="RECONSIDER" onClick={resetFn} />
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div>
      {phase === 1 && (
        <div style={{ marginBottom: 18, maxWidth: 560 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: T.threatRed, marginBottom: 8 }}>
            INTERCEPTED · MIMIC ON THE WIRE
          </div>
          <Bubble who="villain">
            <em>&ldquo;I don't need her phone, little operative. I have her VOICE. Sixty seconds of birthday videos was plenty.&rdquo;</em>
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

      {phase === 1 && (
        <>
          <div style={{ margin: "0 0 14px", background: T.paper, borderRadius: 2, padding: "14px 16px", boxShadow: "0 2px 0 rgba(0,0,0,0.5)", maxWidth: 640 }}>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: "#A66A00", marginBottom: 6 }}>
              INCOMING CALL · “MUM” · VOICE MATCH 100%
            </div>
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: T.fileInk }}>
              “Sweetheart, thank god. Listen carefully. I'm in trouble. I need the code that just went to your phone. Quickly, love.”
            </p>
          </div>
          {stage(
            "Phase 1: The voice is perfect. Your move.",
            CALLS,
            call,
            callChoice,
            pick(setCall, CALLS, call),
            "SILENCE HEARD: HOLD THE LINE",
            () => {
              audio.stamp();
              onPhaseCleared(1);
              setPhase(2);
            },
            () => setCall(null),
          )}
        </>
      )}

      {phase === 2 && (
        <>
          <div style={{ margin: "0 0 14px", background: T.paper, borderRadius: 2, padding: "14px 16px", boxShadow: "0 2px 0 rgba(0,0,0,0.5)", maxWidth: 640 }}>
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: T.fileInk }}>
              “A code word? Darling, there's NO TIME for games. Do you want something to happen to me? Read. The. Code.”
            </p>
          </div>
          {stage(
            "Phase 2: The wobble. The voice is angry now. Hold.",
            WOBBLES,
            wobble,
            wobbleChoice,
            pick(setWobble, WOBBLES, wobble),
            "PROTOCOL HELD: TRACE THE CALL",
            () => {
              audio.stamp();
              onPhaseCleared(2);
              setPhase(3);
            },
            () => setWobble(null),
          )}
        </>
      )}

      {phase === 3 && !closed && (
        stage(
          "Phase 3: ARC's trace is back. What called you tonight?",
          TRACES,
          trace,
          traceChoice,
          pick(setTrace, TRACES, trace),
          "FILE THE SUPPLY CHAIN",
          () => {
            setClosed(true);
            audio.stamp();
            onPhaseCleared(3);
            window.setTimeout(onComplete, reduced ? 250 : 700);
          },
          () => setTrace(null),
        )
      )}

      {phase === 3 && closed && (
        <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.06em", color: T.confirmedGreen, margin: 0 }}>
          FILED: THREE ACTORS, ONE SUPPLY CHAIN. YOUR EARS LIED. YOUR PROTOCOL DIDN'T.
        </p>
      )}
    </div>
  );
}
