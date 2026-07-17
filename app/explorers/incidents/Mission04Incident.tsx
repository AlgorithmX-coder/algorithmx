"use client";

/**
 * Mission 04 incident — "Paper Trail".
 *
 * PACKRAT is auctioning the compiled file on Priya. You can't delete
 * a file you don't hold — but you CAN make it worthless. Three phases,
 * none repeating the mission's cycle mechanics:
 *   1. READ THE FILE — the auction listing: tap the claim that came
 *      from the most dangerous leak (the where-and-when)
 *   2. SCRUB THE SOURCES — take sources down in priority order
 *   3. POISON THE AUCTION — the final call: make the file go stale
 */

import { useState } from "react";
import { AmberButton, Bubble, Eyebrow, GhostButton } from "../engine/primitives";
import { MONO, T } from "../engine/tokens";
import type { IncidentProps } from "../engine/types";

/* Phase 1 — the auction listing's claims, each traced to a crumb. */
const CLAIMS = [
  { id: "team", label: "“Plays goalie for a Riverdale team” — from the handle and bio", danger: false },
  { id: "school", label: "“Attends Riverdale Academy” — from the crest in the match photo", danger: false },
  { id: "when", label: "“At the pitch every Tuesday until 6pm” — from a public comment", danger: true },
  { id: "bday", label: "“Birth year, via the lucky-number joke post”", danger: false },
];

/* Phase 2 — scrub order: the where-and-when, then the located photo,
   then the birthday math. The homework post is a distractor. */
const SOURCES: { id: string; label: string; order?: number; harmless?: boolean }[] = [
  { id: "sched", label: "THE SCHEDULE COMMENT — “practice every Tuesday til 6”", order: 1 },
  { id: "photo", label: "THE MATCH PHOTO — crest, street sign, location tag", order: 2 },
  { id: "quiz", label: "THE LUCKY-NUMBER POST — birthday math", order: 3 },
  { id: "hw", label: "THE HOMEWORK QUESTION — “how do you solve q4”", harmless: true },
];

const SOURCE_HINTS: Record<number, string> = {
  1: "Priority one: the crumb that says WHERE she'll be and WHEN.",
  2: "Next: the photo — it pins her school to a map.",
  3: "Last source still live: the birthday joke. Close it out.",
};

/* Phase 3 — the finishing move. */
const MOVES = [
  {
    id: "callout",
    label: "Post everywhere: “PACKRAT IS SELLING OUR INFO — SHARE THIS!!”",
    correct: false,
    outcome:
      "You just advertised the auction to every buyer who hadn't heard of it. Outrage is amplification. Analysts move quietly.",
  },
  {
    id: "stale",
    label: "Change what the file relies on — new handle, private account, report the auction",
    correct: true,
    outcome:
      "That's the move. The file said WHERE, WHEN, and WHAT NAME. All three just stopped being true — and the report is filed. Stale data sells for nothing.",
  },
  {
    id: "dm",
    label: "DM PACKRAT and demand he deletes it",
    correct: false,
    outcome:
      "He just learned the file matters enough to chase — and that this account is live and scared. You fed the nest. Never negotiate with a collector.",
  },
];

export default function Mission04Incident({ reduced, audio, onPhaseCleared, onComplete }: IncidentProps) {
  const [phase, setPhase] = useState(1);
  const [wrongClaim, setWrongClaim] = useState<string | null>(null);
  const [dangerFound, setDangerFound] = useState(false);
  const [scrubbed, setScrubbed] = useState<string[]>([]);
  const [scrubMiss, setScrubMiss] = useState<string | null>(null);
  const [move, setMove] = useState<string | null>(null);
  const [closed, setClosed] = useState(false);

  const tapClaim = (c: (typeof CLAIMS)[number]) => {
    if (dangerFound) return;
    if (c.danger) {
      setDangerFound(true);
      setWrongClaim(null);
      audio.stamp();
      onPhaseCleared(1);
    } else {
      setWrongClaim(c.id);
      audio.thud();
    }
  };

  const nextScrub = scrubbed.length + 1;

  const tapSource = (s: (typeof SOURCES)[number]) => {
    if (scrubbed.length >= 3) return;
    if (s.order === nextScrub) {
      const done = [...scrubbed, s.id];
      setScrubbed(done);
      setScrubMiss(null);
      audio.latch();
      if (done.length === 3) {
        audio.stamp();
        onPhaseCleared(2);
      }
    } else {
      setScrubMiss(s.id);
      audio.thud();
    }
  };

  const chooseMove = (id: string) => {
    if (move && MOVES.find((m) => m.id === move)?.correct) return;
    setMove(id);
    const m = MOVES.find((x) => x.id === id);
    if (m?.correct) audio.latch();
    else audio.thud();
  };

  const moveChoice = MOVES.find((m) => m.id === move) ?? null;

  return (
    <div>
      {phase === 1 && (
        <div style={{ marginBottom: 18, maxWidth: 560 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: T.threatRed, marginBottom: 8 }}>
            INTERCEPTED — PACKRAT, ON THE WIRE
          </div>
          <Bubble who="villain">
            <em>&ldquo;Nothing is ever really deleted, little archivist. You drop crumbs. I keep them. Everything ends up in my nest.&rdquo;</em>
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

      {/* ---------------- phase 1: read the file ---------------- */}
      {phase === 1 && (
        <div style={{ maxWidth: 640 }}>
          <Eyebrow text="Phase 1 — The listing: four claims, each built from a crumb. Tap the claim that puts Priya in real-world danger." color={T.actionAmber} />
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {CLAIMS.map((c) => (
              <button
                key={c.id}
                onClick={() => tapClaim(c)}
                className="sr-btn"
                style={{
                  textAlign: "left",
                  fontFamily: MONO,
                  fontSize: 12.5,
                  lineHeight: 1.5,
                  color: dangerFound && c.danger ? T.confirmedGreen : wrongClaim === c.id ? T.threatRed : T.fileInk,
                  background: T.paper,
                  border: "none",
                  outline: `2px solid ${dangerFound && c.danger ? T.confirmedGreen : wrongClaim === c.id ? T.threatRed : "transparent"}`,
                  outlineOffset: -2,
                  borderRadius: 2,
                  padding: "12px 14px",
                  boxShadow: "0 2px 0 rgba(0,0,0,0.5)",
                  cursor: dangerFound ? "default" : "pointer",
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
          <p role="status" style={{ margin: "12px 0 0", fontSize: 13, color: dangerFound ? T.confirmedGreen : T.textSecondary }}>
            {dangerFound
              ? "FLAGGED — where plus when, in person. Every other claim is background noise next to this."
              : wrongClaim
                ? "Bad, but not the worst. Which claim tells a stranger where to STAND, and at what time?"
                : "All four are leaks. One of them is a place and a time."}
          </p>
          {dangerFound && (
            <div style={{ marginTop: 14 }}>
              <AmberButton label="CLAIM FLAGGED — SCRUB THE SOURCES" onClick={() => { audio.click(); setPhase(2); }} />
            </div>
          )}
        </div>
      )}

      {/* ---------------- phase 2: scrub the sources ---------------- */}
      {phase === 2 && (
        <div style={{ maxWidth: 640 }}>
          <Eyebrow text="Phase 2 — The auction closes in minutes. Scrub the live sources in the RIGHT ORDER." color={T.actionAmber} />
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {SOURCES.map((s) => {
              const done = scrubbed.includes(s.id);
              const missed = scrubMiss === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => tapSource(s)}
                  className="sr-btn"
                  disabled={done}
                  style={{
                    textAlign: "left",
                    fontFamily: MONO,
                    fontSize: 12.5,
                    lineHeight: 1.5,
                    color: done ? T.confirmedGreen : missed ? T.threatRed : T.textPrimary,
                    background: done ? `${T.confirmedGreen}14` : T.panelRaised,
                    border: `1px solid ${done ? T.confirmedGreen : missed ? T.threatRed : T.hairline}`,
                    borderRadius: 3,
                    padding: "12px 14px",
                    cursor: done ? "default" : "pointer",
                  }}
                >
                  {done ? `■ ${scrubbed.indexOf(s.id) + 1}. ` : "□ "}
                  {s.label}
                </button>
              );
            })}
          </div>
          <p role="status" style={{ margin: "12px 0 0", fontSize: 13, color: scrubbed.length === 3 ? T.confirmedGreen : T.textSecondary }}>
            {scrubbed.length === 3
              ? "SOURCES DOWN — where-and-when first, then the map pin, then the birthday. Textbook."
              : scrubMiss === "hw"
                ? "Harmless. A maths question feeds nothing. Spend your minutes on real crumbs."
                : SOURCE_HINTS[nextScrub]}
          </p>
          {scrubbed.length === 3 && (
            <div style={{ marginTop: 14 }}>
              <AmberButton label="SOURCES DOWN — POISON THE AUCTION" onClick={() => { audio.click(); setPhase(3); }} />
            </div>
          )}
        </div>
      )}

      {/* ---------------- phase 3: poison the auction ---------------- */}
      {phase === 3 && (
        <div style={{ maxWidth: 640 }}>
          <Eyebrow text="Phase 3 — The file still exists in the nest. Make it WORTHLESS. Pick the finishing move." color={T.actionAmber} />
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {MOVES.map((m) => {
              const isChosen = move === m.id;
              const stateColor = m.correct ? T.confirmedGreen : T.threatRed;
              return (
                <button
                  key={m.id}
                  onClick={() => chooseMove(m.id)}
                  className="sr-btn"
                  disabled={!!move && !!moveChoice?.correct}
                  style={{ textAlign: "left", fontSize: 13.5, lineHeight: 1.55, color: isChosen ? stateColor : T.textPrimary, background: isChosen ? `${stateColor}14` : T.panelRaised, border: `1px solid ${isChosen ? stateColor : T.hairline}`, borderRadius: 3, padding: "12px 14px", cursor: move && moveChoice?.correct ? "default" : "pointer" }}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
          {moveChoice && (
            <div role="status" style={{ marginTop: 14, borderLeft: `2px solid ${moveChoice.correct ? T.confirmedGreen : T.threatRed}`, paddingLeft: 14 }}>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{moveChoice.outcome}</p>
              <div style={{ marginTop: 12 }}>
                {moveChoice.correct ? (
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
                      AUCTION DEAD — FILE STALE. NOBODY BUYS OLD NEWS.
                    </p>
                  )
                ) : (
                  <GhostButton label="RECONSIDER" onClick={() => setMove(null)} />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
