"use client";

/**
 * Mission 03 incident — "Ten Thousand Doors".
 *
 * Distinct boss shape (NOT Case 001's triage or Case 002's find-the-hub).
 * SKELETON KEY's rig is chewing through a wall of doors. Three phases:
 *   1. READ THE QUEUE — tap the doors in the order the rig cracks them
 *      (weakest first), proving you can see which keys fall first.
 *   2. CUT THE MASTER KEY — the reuse: one key opens three doors (blind
 *      pick, submit, reveal).
 *   3. HOLD THE WALL — choose the replacement that actually holds (blind
 *      pick, submit, reveal), then raise it and the rig stalls.
 */

import { useState } from "react";
import { AmberButton, Bubble, Eyebrow, GhostButton } from "../engine/primitives";
import { MONO, T } from "../engine/tokens";
import type { IncidentProps } from "../engine/types";

interface Door {
  id: string;
  label: string;
  note: string;
  /** 1 = the rig cracks it first (weakest); 4 = last to fall (strongest). */
  rank: number;
}

/* Laid out in a scrambled order on purpose — the child has to read the keys,
   not just tap top-to-bottom. */
const DOORS: Door[] = [
  { id: "email", label: "Email — Biscuit2013!", note: "name + birth year + a !", rank: 3 },
  { id: "bank", label: "Parent's bank — velvet-otter-cannon-77", note: "four random words", rank: 4 },
  { id: "locker", label: "Locker app — 1234", note: "four digits", rank: 1 },
  { id: "game", label: "GameHub — biscuit", note: "one real word (his dog)", rank: 2 },
];

const CUTS = [
  { id: "one", label: "Change just the one password that leaked", correct: false, outcome: "That's one door. The same key still opens the other two, and SKELETON KEY already has the list. You have to change them ALL." },
  { id: "unique", label: "Give email, game and school each its own long, unique password", correct: true, outcome: "That's the cut. Unique keys mean one leak opens one door, never three. And the master door, email, is long and its own again." },
  { id: "bang", label: "Add a ! and a 9 to the reused password", correct: false, outcome: "Still one key on three doors, and ! plus 9 is right there on the rig's list. You dressed the problem up, you didn't fix it." },
];

const WALLS = [
  { id: "clever", label: "S3cur3P@ss! — it looks really strong", correct: false, outcome: "Short, and every swap in it is on the rig's list. It looks tough and falls in minutes. Looks aren't length." },
  { id: "phrase", label: "otter-cannon-velvet-thunder, kept in a manager", correct: true, outcome: "That's the wall. Four random, unrelated words, long enough that the rig's clock jumps to centuries, and a manager to remember it." },
  { id: "personal", label: "LiverpoolLiverpool2013 — nice and long", correct: false, outcome: "Long, sure, but it's his team twice plus his birth year, all guessable. Length only wins when it's RANDOM." },
];

export default function Mission03Incident({ reduced, audio, onPhaseCleared, onComplete }: IncidentProps) {
  const [phase, setPhase] = useState(1);
  const [order, setOrder] = useState<string[]>([]);
  const [wrongDoor, setWrongDoor] = useState<string | null>(null);

  const nextRank = order.length + 1;
  const queueDone = order.length === DOORS.length;

  const tapDoor = (d: Door) => {
    if (queueDone || order.includes(d.id)) return;
    if (d.rank === nextRank) {
      setOrder((o) => [...o, d.id]);
      setWrongDoor(null);
      audio.latch();
      if (nextRank === DOORS.length) audio.stamp();
    } else {
      setWrongDoor(d.id);
      audio.thud();
    }
  };

  return (
    <div>
      {phase === 1 && (
        <div style={{ marginBottom: 18, maxWidth: 560 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: T.threatRed, marginBottom: 8 }}>
            INTERCEPTED: SKELETON KEY, ON THE WIRE
          </div>
          <Bubble who="villain">
            <em>&ldquo;Ten thousand doors on my ring tonight, kid, and a key filed for every one. Go on. Show me which of yours actually holds.&rdquo;</em>
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

      {/* ---------------- phase 1: read the queue ---------------- */}
      {phase === 1 && (
        <div>
          <Eyebrow text="Phase 1. The rig is hammering four doors at once. It always cracks the weakest first. Tap the doors in the order they'll fall." color={T.actionAmber} />
          <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
            {DOORS.map((d) => {
              const idx = order.indexOf(d.id);
              const cracked = idx !== -1;
              const isWrong = wrongDoor === d.id;
              const last = cracked && idx === DOORS.length - 1;
              return (
                <button
                  key={d.id}
                  onClick={() => tapDoor(d)}
                  className="sr-btn"
                  disabled={queueDone || cracked}
                  style={{
                    textAlign: "left", display: "flex", alignItems: "center", gap: 12,
                    fontFamily: MONO, fontSize: 13, lineHeight: 1.4,
                    color: cracked ? (last ? T.confirmedGreen : T.threatRed) : isWrong ? T.threatRed : T.fileInk,
                    background: T.paper, border: "none",
                    outline: `2px solid ${cracked ? (last ? T.confirmedGreen : T.threatRed) : isWrong ? T.threatRed : "transparent"}`,
                    outlineOffset: -2, borderRadius: 2, padding: "12px 14px", boxShadow: "0 2px 0 rgba(0,0,0,0.5)",
                    cursor: queueDone || cracked ? "default" : "pointer",
                  }}
                >
                  <span aria-hidden style={{ fontFamily: MONO, fontSize: 15, fontWeight: 700, minWidth: 22, color: cracked ? (last ? T.confirmedGreen : T.threatRed) : `${T.fileInk}66` }}>
                    {cracked ? (last ? "✓" : `${idx + 1}`) : "·"}
                  </span>
                  <span>
                    {d.label}
                    <span style={{ display: "block", fontSize: 11, color: `${T.fileInk}99` }}>{d.note}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <p role="status" style={{ margin: "12px 0 0", fontSize: 13, color: queueDone ? T.confirmedGreen : T.textSecondary }}>
            {queueDone
              ? "That's the queue. The four-digit locker fell first, the passphrase held the longest. You can read the rig now."
              : wrongDoor
                ? "Not next in line. The rig always goes for the EASIEST guess first. Which of these has the least to guess?"
                : "Tap them weakest-first, in the order the rig would break them."}
          </p>
          {queueDone && (
            <div style={{ marginTop: 14 }}>
              <AmberButton label="QUEUE READ · NEXT" onClick={() => { audio.click(); onPhaseCleared(1); setPhase(2); }} />
            </div>
          )}
        </div>
      )}

      {phase === 2 && <CutKeyPhase audio={audio} onDone={() => { onPhaseCleared(2); setPhase(3); }} />}
      {phase === 3 && <WallPhase reduced={reduced} audio={audio} onDone={() => { onPhaseCleared(3); onComplete(); }} />}
    </div>
  );
}

/* -------------------------------------------------- phase 2: cut the master key */

function CutKeyPhase({ audio, onDone }: { audio: IncidentProps["audio"]; onDone: () => void }) {
  const [chosen, setChosen] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const option = CUTS.find((o) => o.id === chosen) ?? null;
  const choose = (id: string) => { if (submitted) return; audio.click(); setChosen(id); };
  const submit = () => { if (!chosen) return; setSubmitted(true); if (option?.correct) audio.latch(); else audio.thud(); };

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: 12, fontSize: 13, lineHeight: 1.6, color: T.textSecondary }}>
        The rig cracked Jake's email in seconds, and the same key, <span style={{ fontFamily: MONO, color: T.threatRed }}>Biscuit2013!</span>, opens his game and his school login too. One key, three doors.
      </div>
      <Eyebrow text="Phase 2 · Cut the master key: one move stops one leak opening every door. Make your call, then submit." color={T.actionAmber} />
      <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
        {CUTS.map((o) => {
          const isChosen = chosen === o.id;
          const col = submitted && isChosen ? (o.correct ? T.confirmedGreen : T.threatRed) : isChosen ? T.arcCyan : T.hairline;
          return (
            <button key={o.id} onClick={() => choose(o.id)} className="sr-btn" disabled={submitted} aria-pressed={isChosen}
              style={{ textAlign: "left", fontFamily: MONO, fontSize: 13, lineHeight: 1.5, color: isChosen ? T.textPrimary : T.textSecondary, background: isChosen ? `${col}1F` : T.panelRaised, border: `1px solid ${col}`, borderRadius: 3, padding: "12px 14px", cursor: submitted ? "default" : "pointer" }}>
              {o.label}
            </button>
          );
        })}
      </div>
      {!submitted ? (
        <div style={{ marginTop: 14 }}>
          {chosen ? <AmberButton label="SUBMIT MY CALL" onClick={submit} /> : <span style={{ fontFamily: MONO, fontSize: 12, color: T.textSecondary }}>Pick the cut, then submit.</span>}
        </div>
      ) : option ? (
        <div role="status" style={{ marginTop: 14, borderLeft: `2px solid ${option.correct ? T.confirmedGreen : T.threatRed}`, paddingLeft: 14 }}>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{option.outcome}</p>
          <div style={{ marginTop: 12 }}>
            {option.correct ? <AmberButton label="MASTER KEY SNAPPED · NEXT" onClick={onDone} /> : <GhostButton label="RECONSIDER" onClick={() => { setSubmitted(false); setChosen(null); }} />}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------- phase 3: hold the wall */

function WallPhase({ reduced, audio, onDone }: { reduced: boolean; audio: IncidentProps["audio"]; onDone: () => void }) {
  const [chosen, setChosen] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [raised, setRaised] = useState(false);
  const option = WALLS.find((o) => o.id === chosen) ?? null;
  const choose = (id: string) => { if (submitted) return; audio.click(); setChosen(id); };
  const submit = () => { if (!chosen) return; setSubmitted(true); if (option?.correct) audio.latch(); else audio.thud(); };

  return (
    <div style={{ maxWidth: 640 }}>
      <Eyebrow text="Phase 3 · Hold the wall: pick the new key that actually stops the rig, then raise it." color={T.actionAmber} />
      <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
        {WALLS.map((o) => {
          const isChosen = chosen === o.id;
          const col = submitted && isChosen ? (o.correct ? T.confirmedGreen : T.threatRed) : isChosen ? T.arcCyan : T.hairline;
          return (
            <button key={o.id} onClick={() => choose(o.id)} className="sr-btn" disabled={submitted} aria-pressed={isChosen}
              style={{ textAlign: "left", fontFamily: MONO, fontSize: 13, lineHeight: 1.5, color: isChosen ? T.textPrimary : T.textSecondary, background: isChosen ? `${col}1F` : T.panelRaised, border: `1px solid ${col}`, borderRadius: 3, padding: "12px 14px", cursor: submitted ? "default" : "pointer" }}>
              {o.label}
            </button>
          );
        })}
      </div>
      {!submitted ? (
        <div style={{ marginTop: 14 }}>
          {chosen ? <AmberButton label="SUBMIT MY CALL" onClick={submit} /> : <span style={{ fontFamily: MONO, fontSize: 12, color: T.textSecondary }}>Pick the new key, then submit.</span>}
        </div>
      ) : option ? (
        <div role="status" style={{ marginTop: 14, borderLeft: `2px solid ${option.correct ? T.confirmedGreen : T.threatRed}`, paddingLeft: 14 }}>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{option.outcome}</p>
          <div style={{ marginTop: 12 }}>
            {option.correct ? (
              !raised ? <AmberButton label="RAISE THE WALL" onClick={() => { setRaised(true); audio.stamp(); window.setTimeout(onDone, reduced ? 250 : 800); }} />
                : <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.06em", color: T.confirmedGreen, margin: 0 }}>WALL UP. RIG STALLED.</p>
            ) : <GhostButton label="RECONSIDER" onClick={() => { setSubmitted(false); setChosen(null); }} />}
          </div>
        </div>
      ) : null}
    </div>
  );
}
