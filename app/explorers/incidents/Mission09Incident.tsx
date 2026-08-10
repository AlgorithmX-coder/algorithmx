"use client";

/**
 * Mission 09 incident — "The Collector".
 *
 * SIREN's collector account has farmed a whole server with
 * generosity. Three phases:
 *   1. SPOT THE FARM — five generous DMs; tap the card that proves
 *      it's a SCRIPT, not kindness
 *   2. FIND THE TURN — Zaid's chat: tap where giving became taking
 *   3. COACH THE EXIT — walk Zaid out cleanly, no shame, no payment
 */

import { useState } from "react";
import { AmberButton, Bubble, Eyebrow, GhostButton } from "../engine/primitives";
import { MONO, T } from "../engine/tokens";
import type { IncidentProps } from "../engine/types";

/* Phase 1 — the server's DMs. One card is the proof of scripting. */
const FARM = [
  { id: "f1", label: "TO JAY: “free skin! you're too good at this game not to have it 😊”", proof: false },
  { id: "f2", label: "SIDE-BY-SIDE: “you're literally the only one I trust 💛” sent to Jay AND Priya, 4 minutes apart", proof: true },
  { id: "f3", label: "TO PRIYA: “held a tournament spot for you, no big deal”", proof: false },
  { id: "f4", label: "TO ZAID: “your build videos deserve way more views tbh”", proof: false },
  { id: "f5", label: "TO SAM: “here's 100 coins, pay me back never lol”", proof: false },
];

/* Phase 2 — Zaid's chat timeline. Tap where giving turned to taking. */
const TIMELINE = [
  { id: "z1", label: "WEEK 1: “that clutch was insane, take this skin, you earned it”", turn: false },
  { id: "z2", label: "WEEK 2: “rough day? talk to me. I've always got you”", turn: false },
  { id: "z3", label: "WEEK 3: “hold these coins for me… actually keep them 😄”", turn: false },
  { id: "z4", label: "WEEK 4: “remember that skin? tiny favor back: lend me your login, one day only”", turn: true },
];

const EXITS = [
  {
    id: "sunk",
    label: "“Do it, Zaid. You've taken his stuff for a month, you kind of owe him”",
    correct: false,
    outcome:
      "That's the debt feeling doing the collector's work for him. Bait isn't a loan. Zaid signed nothing.",
  },
  {
    id: "clean",
    label: "“Stop replying, keep the chats as evidence, and tell an adult today. This was never your fault.”",
    correct: true,
    outcome:
      "The clean exit, coached word for word. No shame, no payment, evidence kept. The report reaches the platform before the collector cons anyone else.",
  },
  {
    id: "expose",
    label: "“Post his whole chat log on the server: EXPOSED!!”",
    correct: false,
    outcome:
      "The collector deletes, renames, and returns by Friday. And Zaid's private chats are now public forever. Exits are quiet. Reports are loud.",
  },
];

export default function Mission09Incident({ reduced, audio, onPhaseCleared, onComplete }: IncidentProps) {
  const [phase, setPhase] = useState(1);
  const [wrongFarm, setWrongFarm] = useState<string | null>(null);
  const [proofFound, setProofFound] = useState(false);
  const [wrongTurn, setWrongTurn] = useState<string | null>(null);
  const [turnFound, setTurnFound] = useState(false);
  const [exit, setExit] = useState<string | null>(null);
  const [closed, setClosed] = useState(false);

  const tapFarm = (f: (typeof FARM)[number]) => {
    if (proofFound) return;
    if (f.proof) {
      setProofFound(true);
      setWrongFarm(null);
      audio.stamp();
      onPhaseCleared(1);
    } else {
      setWrongFarm(f.id);
      audio.thud();
    }
  };

  const tapTurn = (z: (typeof TIMELINE)[number]) => {
    if (turnFound) return;
    if (z.turn) {
      setTurnFound(true);
      setWrongTurn(null);
      audio.stamp();
      onPhaseCleared(2);
    } else {
      setWrongTurn(z.id);
      audio.thud();
    }
  };

  const chooseExit = (id: string) => {
    if (exit && EXITS.find((e) => e.id === exit)?.correct) return;
    setExit(id);
    const e = EXITS.find((x) => x.id === id);
    if (e?.correct) audio.latch();
    else audio.thud();
  };

  const exitChoice = EXITS.find((e) => e.id === exit) ?? null;

  return (
    <div>
      {phase === 1 && (
        <div style={{ marginBottom: 18, maxWidth: 560 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: T.threatRed, marginBottom: 8 }}>
            INTERCEPTED: SIREN, ON THE WIRE
          </div>
          <Bubble who="villain">
            <em>&ldquo;Special? Oh, sweetheart. You're Tuesday. There's a whole calendar of you.&rdquo;</em>
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

      {/* ---------------- phase 1: spot the farm ---------------- */}
      {phase === 1 && (
        <div style={{ maxWidth: 640 }}>
          <Eyebrow text="Phase 1: Five very generous messages. One card PROVES it's a script. Tap it." color={T.actionAmber} />
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {FARM.map((f) => (
              <button
                key={f.id}
                onClick={() => tapFarm(f)}
                className="sr-btn"
                style={{
                  textAlign: "left",
                  fontFamily: MONO,
                  fontSize: 12.5,
                  lineHeight: 1.5,
                  color: proofFound && f.proof ? T.confirmedGreen : wrongFarm === f.id ? T.threatRed : T.fileInk,
                  background: T.paper,
                  border: "none",
                  outline: `2px solid ${proofFound && f.proof ? T.confirmedGreen : wrongFarm === f.id ? T.threatRed : "transparent"}`,
                  outlineOffset: -2,
                  borderRadius: 2,
                  padding: "12px 14px",
                  boxShadow: "0 2px 0 rgba(0,0,0,0.5)",
                  cursor: proofFound ? "default" : "pointer",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
          <p role="status" style={{ margin: "12px 0 0", fontSize: 13, color: proofFound ? T.confirmedGreen : T.textSecondary }}>
            {proofFound
              ? "SCRIPT CONFIRMED: “only one I trust,” twice, four minutes apart. Only-ones don't come in pairs."
              : wrongFarm
                ? "Generous, sure. But generosity alone proves nothing. One card here proves it's a SCRIPT."
                : "Kindness can be real. Find the card kindness can't explain."}
          </p>
          {proofFound && (
            <div style={{ marginTop: 14 }}>
              <AmberButton label="FARM CONFIRMED: CHECK ON ZAID" onClick={() => { audio.click(); setPhase(2); }} />
            </div>
          )}
        </div>
      )}

      {/* ---------------- phase 2: find the turn ---------------- */}
      {phase === 2 && (
        <div style={{ maxWidth: 640 }}>
          <Eyebrow text="Phase 2: Zaid's month with the collector. Tap the message where giving became TAKING." color={T.actionAmber} />
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {TIMELINE.map((z) => (
              <button
                key={z.id}
                onClick={() => tapTurn(z)}
                className="sr-btn"
                style={{
                  textAlign: "left",
                  fontFamily: MONO,
                  fontSize: 12.5,
                  lineHeight: 1.5,
                  color: turnFound && z.turn ? T.confirmedGreen : wrongTurn === z.id ? T.threatRed : T.textPrimary,
                  background: turnFound && z.turn ? `${T.confirmedGreen}14` : T.panelRaised,
                  border: `1px solid ${turnFound && z.turn ? T.confirmedGreen : wrongTurn === z.id ? T.threatRed : T.hairline}`,
                  borderRadius: 3,
                  padding: "12px 14px",
                  cursor: turnFound ? "default" : "pointer",
                }}
              >
                {z.label}
              </button>
            ))}
          </div>
          <p role="status" style={{ margin: "12px 0 0", fontSize: 13, color: turnFound ? T.confirmedGreen : T.textSecondary }}>
            {turnFound
              ? "THE TURN: “remember that skin?” The gift comes back as a debt. The payback, fully stretched."
              : wrongTurn
                ? "Still depositing: warmth going in, nothing asked. Find where the account gets COLLECTED."
                : "For weeks the collector only gives. Find the collection."}
          </p>
          {turnFound && (
            <div style={{ marginTop: 14 }}>
              <AmberButton label="TURN FOUND: COACH THE EXIT" onClick={() => { audio.click(); setPhase(3); }} />
            </div>
          )}
        </div>
      )}

      {/* ---------------- phase 3: coach the exit ---------------- */}
      {phase === 3 && (
        <div style={{ maxWidth: 640 }}>
          <Eyebrow text="Phase 3: Zaid asks you what to do. Your coaching decides how this ends." color={T.actionAmber} />
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {EXITS.map((e) => {
              const isChosen = exit === e.id;
              const stateColor = e.correct ? T.confirmedGreen : T.threatRed;
              return (
                <button key={e.id} onClick={() => chooseExit(e.id)} className="sr-btn" disabled={!!exit && !!exitChoice?.correct}
                  style={{ textAlign: "left", fontSize: 13.5, lineHeight: 1.55, color: isChosen ? stateColor : T.textPrimary, background: isChosen ? `${stateColor}14` : T.panelRaised, border: `1px solid ${isChosen ? stateColor : T.hairline}`, borderRadius: 3, padding: "12px 14px", cursor: exit && exitChoice?.correct ? "default" : "pointer" }}>
                  {e.label}
                </button>
              );
            })}
          </div>
          {exitChoice && (
            <div role="status" style={{ marginTop: 14, borderLeft: `2px solid ${exitChoice.correct ? T.confirmedGreen : T.threatRed}`, paddingLeft: 14 }}>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{exitChoice.outcome}</p>
              <div style={{ marginTop: 12 }}>
                {exitChoice.correct ? (
                  !closed ? (
                    <AmberButton
                      label="WALK HIM OUT"
                      onClick={() => {
                        setClosed(true);
                        audio.stamp();
                        onPhaseCleared(3);
                        window.setTimeout(onComplete, reduced ? 250 : 700);
                      }}
                    />
                  ) : (
                    <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.06em", color: T.confirmedGreen, margin: 0 }}>
                      EXIT CLEAN: DEBT CANCELLED. IT WAS NEVER REAL.
                    </p>
                  )
                ) : (
                  <GhostButton label="RECONSIDER" onClick={() => setExit(null)} />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
