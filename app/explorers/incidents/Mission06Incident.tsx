"use client";

/**
 * Mission 06 incident — "The Carnival".
 *
 * SIREN runs a midway of rapid mini-cons. Call the lever BEFORE each
 * reveal — speed rounds that drill the six-lever board into reflex.
 * Three phases:
 *   1. WARM-UP BOOTHS — two single-lever cons, call each
 *   2. STACKED LEVERS — two cons pulling two levers; call the one
 *      doing the real work
 *   3. THE CLOSER — one con aimed at YOU, the operative
 */

import { useState } from "react";
import { AmberButton, Bubble, Eyebrow } from "../engine/primitives";
import { MONO, T } from "../engine/tokens";
import type { IncidentProps } from "../engine/types";

interface Round {
  id: string;
  con: string;
  options: [string, string, string];
  answer: 0 | 1 | 2;
  why: string;
}

const PHASE_ROUNDS: Round[][] = [
  /* phase 1 — warm-up: one lever each */
  [
    {
      id: "r1",
      con: "“⚡ FLASH DROP! The skin bundle disappears at midnight TONIGHT!”",
      options: ["HURRY", "LIKING", "PAYBACK"],
      answer: 0,
      why: "A ticking clock aimed at your reflexes. Classic hurry.",
    },
    {
      id: "r2",
      con: "“Admin here. Your account is flagged. Send your login for review or it's banned.”",
      options: ["SCARCITY", "AUTHORITY", "LIKING"],
      answer: 1,
      why: "A title plus a threat of punishment. Authority doing the lifting.",
    },
  ],
  /* phase 2 — stacked: which lever does the real work? */
  [
    {
      id: "r3",
      con: "“You're literally my favorite person on this server 💛 … can you lend me 500 coins? I always pay back!”",
      options: ["LIKING is doing the real work", "HURRY is doing the real work", "FEAR is doing the real work"],
      answer: 0,
      why: "The compliments are the con. The coin ask only works because the LIKING was built first.",
    },
    {
      id: "r4",
      con: "“Last 2 tournament slots. And if your team misses out, everyone will know it was YOUR fault.”",
      options: ["SCARCITY is the muscle", "FEAR is the muscle", "PAYBACK is the muscle"],
      answer: 1,
      why: "The “2 slots” opens the door. But “everyone will blame YOU” pushes people through it.",
    },
  ],
  /* phase 3 — the closer, aimed at the operative */
  [
    {
      id: "r5",
      con: "“I've watched you clear every case, Operative. You're the best ARC has. Prove it: solve MY puzzle. Just log in here.”",
      options: ["AUTHORITY plus fear", "LIKING plus a dare: flattery aimed at YOU", "SCARCITY plus payback"],
      answer: 1,
      why: "Flattery plus a challenge. This lever works on people who are proud of being good. Being good at this game IS your button. Now you know it.",
    },
  ],
];

const PHASE_INTROS = [
  "Phase 1. Warm-up booths: two quick cons. Call the lever before the reveal.",
  "Phase 2. Stacked levers: two levers per con. Call the one doing the REAL work.",
  "Phase 3. The closer: this one's aimed at you, Operative.",
];

export default function Mission06Incident({ reduced, audio, onPhaseCleared, onComplete }: IncidentProps) {
  const [phase, setPhase] = useState(1);
  const [roundIdx, setRoundIdx] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [cleared, setCleared] = useState(false);

  const rounds = PHASE_ROUNDS[phase - 1];
  const round = rounds[roundIdx];
  const revealed = chosen !== null;
  const lastRoundOfPhase = roundIdx === rounds.length - 1;
  const lastPhase = phase === PHASE_ROUNDS.length;

  const call = (i: number) => {
    if (revealed) return;
    setChosen(i);
    if (i === round.answer) audio.latch();
    else audio.thud();
  };

  const next = () => {
    audio.click();
    if (!lastRoundOfPhase) {
      setRoundIdx((r) => r + 1);
      setChosen(null);
      return;
    }
    audio.stamp();
    onPhaseCleared(phase);
    if (lastPhase) {
      setCleared(true);
      window.setTimeout(onComplete, reduced ? 250 : 700);
    } else {
      setPhase((p) => p + 1);
      setRoundIdx(0);
      setChosen(null);
    }
  };

  return (
    <div>
      {phase === 1 && roundIdx === 0 && !revealed && (
        <div style={{ marginBottom: 18, maxWidth: 560 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: T.threatRed, marginBottom: 8 }}>
            INTERCEPTED: SIREN, ON THE WIRE
          </div>
          <Bubble who="villain">
            <em>&ldquo;Welcome to my carnival, clever thing. Every booth has a prize. Every prize has a string.&rdquo;</em>
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

      <div style={{ maxWidth: 640 }}>
        <Eyebrow text={PHASE_INTROS[phase - 1]} color={T.actionAmber} />

        <div style={{ margin: "14px 0", background: T.paper, borderRadius: 2, padding: "14px 16px", boxShadow: "0 2px 0 rgba(0,0,0,0.5)" }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: "#A66A00", marginBottom: 6 }}>
            BOOTH {round.id.toUpperCase()} · CON INCOMING
          </div>
          <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: T.fileInk }}>{round.con}</p>
        </div>

        <p style={{ margin: "0 0 10px", fontFamily: MONO, fontSize: 12.5, letterSpacing: "0.06em", color: T.actionAmber }}>
          CALL THE LEVER:
        </p>
        <div style={{ display: "grid", gap: 10 }}>
          {round.options.map((o, i) => {
            const isChosen = chosen === i;
            const isAnswer = revealed && i === round.answer;
            const color = isAnswer ? T.confirmedGreen : isChosen ? T.threatRed : T.textPrimary;
            return (
              <button
                key={o}
                onClick={() => call(i)}
                className="sr-btn"
                disabled={revealed}
                style={{
                  textAlign: "left",
                  fontFamily: MONO,
                  fontSize: 13,
                  lineHeight: 1.5,
                  color,
                  background: isAnswer || isChosen ? `${color}14` : T.panelRaised,
                  border: `1px solid ${isAnswer || isChosen ? color : T.hairline}`,
                  borderRadius: 3,
                  padding: "12px 14px",
                  cursor: revealed ? "default" : "pointer",
                }}
              >
                {o}
              </button>
            );
          })}
        </div>

        {revealed && (
          <div role="status" style={{ marginTop: 14, borderLeft: `2px solid ${chosen === round.answer ? T.confirmedGreen : T.threatRed}`, paddingLeft: 14 }}>
            <p style={{ margin: 0, fontFamily: MONO, fontSize: 11, letterSpacing: "0.1em", color: chosen === round.answer ? T.confirmedGreen : T.threatRed }}>
              {chosen === round.answer ? "CALLED IT." : "THE LEVER WAS:"}
            </p>
            <p style={{ margin: "8px 0 0", fontSize: 14, lineHeight: 1.6 }}>{round.why}</p>
            <div style={{ marginTop: 12 }}>
              {cleared ? (
                <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.06em", color: T.confirmedGreen, margin: 0 }}>
                  CARNIVAL CLOSED. EVERY LEVER NAMED. NO PRIZES FOR SIREN TONIGHT.
                </p>
              ) : (
                <AmberButton
                  label={lastRoundOfPhase ? (lastPhase ? "CLOSE THE CARNIVAL" : "NEXT PHASE") : "NEXT BOOTH"}
                  onClick={next}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
