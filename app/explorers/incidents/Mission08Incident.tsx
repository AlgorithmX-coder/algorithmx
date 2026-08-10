"use client";

/**
 * Mission 08 incident — "The Pen Pal".
 *
 * The full two-week friendship, laid out as a timeline. The child
 * finds the TURN (where farming became harvesting), holds the line
 * against the stacked ask, then sees the unmasking. Scam framing
 * throughout (money/codes) per the sensitive-topics policy.
 * Phases:
 *   1. READ THE TIMELINE — tap the message where the con turned
 *   2. HOLD THE LINE — answer the stacked ask correctly
 *   3. THE UNMASKING — conclude what the pen pal really was
 */

import { useState } from "react";
import { AmberButton, Bubble, Eyebrow, GhostButton } from "../engine/primitives";
import { MONO, T } from "../engine/tokens";
import type { IncidentProps } from "../engine/types";

/* Phase 1 — the friendship timeline. The pivot is the manufactured
   crisis: the first message shaped to need something from you. */
const TIMELINE = [
  { id: "d1", label: "DAY 1: “you like Star Chasers?? we're basically twins 😂”", pivot: false },
  { id: "d3", label: "DAY 3: “you're literally the funniest person I know”", pivot: false },
  { id: "d6", label: "DAY 6: inside jokes, shared playlists, daily streaks", pivot: false },
  { id: "d9", label: "DAY 9: “ugh, family stuff… my data runs out tomorrow and mum won't top up 😞”", pivot: true },
  { id: "d10", label: "DAY 10: “could you send a gift card code? a tiny one, I'll pay you back 🙏”", pivot: false },
];

const ASKS = [
  {
    id: "once",
    label: "Send one small code, it's tiny and they're a friend",
    correct: false,
    outcome:
      "Small is the point. The first code proves the scam works. The asks only grow from here. There is no “just once” in a script.",
  },
  {
    id: "hold",
    label: "A kind, firm no. Then stop the favor talk and tell an adult",
    correct: true,
    outcome:
      "Held. No anger, no long explanation, no code. The ask can't grow, and an adult is now watching.",
  },
  {
    id: "accuse",
    label: "“You're a BOT and I'm exposing you!!”",
    correct: false,
    outcome:
      "Accusations end the evidence trail. The account deletes and returns with a new name tomorrow. Exit quietly, report properly.",
  },
];

const VERDICTS = [
  {
    id: "real",
    label: "The friend was real, just poor and embarrassed",
    correct: false,
    outcome:
      "ARC checked. No school record. No mutual friends. Photos made by a machine. It ran from a scam factory. There was never anyone to be embarrassed.",
  },
  {
    id: "generated",
    label: "The whole friend was fake. Report it, and check who else it's chatting with",
    correct: true,
    outcome:
      "Confirmed. Profile, photos, warmth: all fake, running the same script on nine other students. Your report just unplugged all nine chats.",
  },
  {
    id: "prank",
    label: "Classmates pranking you",
    correct: false,
    outcome:
      "A prank doesn't run for two weeks. Not with perfect patience and a gift-card ask. Patience plus payment means a pro.",
  },
];

export default function Mission08Incident({ reduced, audio, onPhaseCleared, onComplete }: IncidentProps) {
  const [phase, setPhase] = useState(1);
  const [wrongDay, setWrongDay] = useState<string | null>(null);
  const [pivotFound, setPivotFound] = useState(false);
  const [ask, setAsk] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<string | null>(null);
  const [closed, setClosed] = useState(false);

  const tapDay = (d: (typeof TIMELINE)[number]) => {
    if (pivotFound) return;
    if (d.pivot) {
      setPivotFound(true);
      setWrongDay(null);
      audio.stamp();
      onPhaseCleared(1);
    } else {
      setWrongDay(d.id);
      audio.thud();
    }
  };

  const chooseAsk = (id: string) => {
    if (ask && ASKS.find((a) => a.id === ask)?.correct) return;
    setAsk(id);
    const a = ASKS.find((x) => x.id === id);
    if (a?.correct) audio.latch();
    else audio.thud();
  };

  const chooseVerdict = (id: string) => {
    if (verdict && VERDICTS.find((v) => v.id === verdict)?.correct) return;
    setVerdict(id);
    const v = VERDICTS.find((x) => x.id === id);
    if (v?.correct) audio.latch();
    else audio.thud();
  };

  const askChoice = ASKS.find((a) => a.id === ask) ?? null;
  const verdictChoice = VERDICTS.find((v) => v.id === verdict) ?? null;

  return (
    <div>
      {phase === 1 && (
        <div style={{ marginBottom: 18, maxWidth: 560 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: T.threatRed, marginBottom: 8 }}>
            INTERCEPTED · GHOSTWRITER, ON THE WIRE
          </div>
          <Bubble who="villain">
            <em>&ldquo;I wrote a friend you adored in forty seconds, little reader. Imagine what else I could write.&rdquo;</em>
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

      {/* ---------------- phase 1: read the timeline ---------------- */}
      {phase === 1 && (
        <div style={{ maxWidth: 640 }}>
          <Eyebrow text="Phase 1: Two weeks of friendship on one board. Tap where the scam turned." color={T.actionAmber} />
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {TIMELINE.map((d) => (
              <button
                key={d.id}
                onClick={() => tapDay(d)}
                className="sr-btn"
                style={{
                  textAlign: "left",
                  fontFamily: MONO,
                  fontSize: 12.5,
                  lineHeight: 1.5,
                  color: pivotFound && d.pivot ? T.confirmedGreen : wrongDay === d.id ? T.threatRed : T.fileInk,
                  background: T.paper,
                  border: "none",
                  outline: `2px solid ${pivotFound && d.pivot ? T.confirmedGreen : wrongDay === d.id ? T.threatRed : "transparent"}`,
                  outlineOffset: -2,
                  borderRadius: 2,
                  padding: "12px 14px",
                  boxShadow: "0 2px 0 rgba(0,0,0,0.5)",
                  cursor: pivotFound ? "default" : "pointer",
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
          <p role="status" style={{ margin: "12px 0 0", fontSize: 13, color: pivotFound ? T.confirmedGreen : T.textSecondary }}>
            {pivotFound
              ? "THE TURN: day 9. A problem appeared that only money fixes. The crisis is the doorway. The ask walks through it."
              : wrongDay === "d10"
                ? "That's the ask itself. But the scam turned EARLIER. What made the ask possible?"
                : wrongDay
                  ? "Still building trust. Warmth going in, nothing asked for yet. Find where the story starts NEEDING something."
                  : "For nine days the friend only gives. Find the message where that changes."}
          </p>
          {pivotFound && (
            <div style={{ marginTop: 14 }}>
              <AmberButton label="TURN FOUND: HOLD THE LINE" onClick={() => { audio.click(); setPhase(2); }} />
            </div>
          )}
        </div>
      )}

      {/* ---------------- phase 2: hold the line ---------------- */}
      {phase === 2 && (
        <div style={{ maxWidth: 640 }}>
          <Eyebrow text="Phase 2: The ask is live and the guilt is stacked. Choose your reply." color={T.actionAmber} />
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {ASKS.map((a) => {
              const isChosen = ask === a.id;
              const stateColor = a.correct ? T.confirmedGreen : T.threatRed;
              return (
                <button key={a.id} onClick={() => chooseAsk(a.id)} className="sr-btn" disabled={!!ask && !!askChoice?.correct}
                  style={{ textAlign: "left", fontSize: 13.5, lineHeight: 1.55, color: isChosen ? stateColor : T.textPrimary, background: isChosen ? `${stateColor}14` : T.panelRaised, border: `1px solid ${isChosen ? stateColor : T.hairline}`, borderRadius: 3, padding: "12px 14px", cursor: ask && askChoice?.correct ? "default" : "pointer" }}>
                  {a.label}
                </button>
              );
            })}
          </div>
          {askChoice && (
            <div role="status" style={{ marginTop: 14, borderLeft: `2px solid ${askChoice.correct ? T.confirmedGreen : T.threatRed}`, paddingLeft: 14 }}>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{askChoice.outcome}</p>
              <div style={{ marginTop: 12 }}>
                {askChoice.correct ? (
                  <AmberButton label="LINE HELD: UNMASK THE WRITER" onClick={() => { audio.stamp(); onPhaseCleared(2); setPhase(3); }} />
                ) : (
                  <GhostButton label="RECONSIDER" onClick={() => setAsk(null)} />
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------- phase 3: the unmasking ---------------- */}
      {phase === 3 && (
        <div style={{ maxWidth: 640 }}>
          <Eyebrow text="Phase 3: ARC's trace is back. What WAS the pen pal?" color={T.actionAmber} />
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {VERDICTS.map((v) => {
              const isChosen = verdict === v.id;
              const stateColor = v.correct ? T.confirmedGreen : T.threatRed;
              return (
                <button key={v.id} onClick={() => chooseVerdict(v.id)} className="sr-btn" disabled={!!verdict && !!verdictChoice?.correct}
                  style={{ textAlign: "left", fontSize: 13.5, lineHeight: 1.55, color: isChosen ? stateColor : T.textPrimary, background: isChosen ? `${stateColor}14` : T.panelRaised, border: `1px solid ${isChosen ? stateColor : T.hairline}`, borderRadius: 3, padding: "12px 14px", cursor: verdict && verdictChoice?.correct ? "default" : "pointer" }}>
                  {v.label}
                </button>
              );
            })}
          </div>
          {verdictChoice && (
            <div role="status" style={{ marginTop: 14, borderLeft: `2px solid ${verdictChoice.correct ? T.confirmedGreen : T.threatRed}`, paddingLeft: 14 }}>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{verdictChoice.outcome}</p>
              <div style={{ marginTop: 12 }}>
                {verdictChoice.correct ? (
                  !closed ? (
                    <AmberButton
                      label="CLOSE THE CASE"
                      onClick={() => {
                        setClosed(true);
                        audio.stamp();
                        onPhaseCleared(3);
                        window.setTimeout(onComplete, reduced ? 250 : 700);
                      }}
                    />
                  ) : (
                    <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.06em", color: T.confirmedGreen, margin: 0 }}>
                      FAKE FRIEND DELETED. IT NEVER DREW BREATH. THE KINDNESS WAS YOURS, NOT ITS.
                    </p>
                  )
                ) : (
                  <GhostButton label="RECONSIDER" onClick={() => setVerdict(null)} />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
