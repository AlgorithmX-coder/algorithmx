"use client";

/**
 * Mission 01 incident — "The Second Wave".
 *
 * PHANTOM HOOK, burned in round one, floods the class group with four
 * messages at once. Three phases, each a different composition of the
 * mission's skills (never a re-run of a cycle mechanic):
 *   1. TRIAGE  — call THREAT or SAFE on four live messages
 *   2. CUT THE HOOK — one containment decision
 *   3. TRANSMIT — hold to file the report; the interference collapses
 *
 * Takeover-grade interference lives here and only here, on the STATIC
 * feed (evidence), never on ARC chrome. Reduced motion gets the static
 * corrupt-border treatment instead (art doc Appendix A.3).
 */

import { useRef, useState } from "react";
import { AmberButton, Eyebrow, GhostButton } from "../engine/primitives";
import { MONO, T } from "../engine/tokens";
import type { IncidentProps } from "../engine/types";

type Verdict = "THREAT" | "SAFE";

interface WaveMessage {
  id: string;
  from: string;
  text: string;
  truth: Verdict;
  why: string;
}

const WAVE: WaveMessage[] = [
  {
    id: "login-note",
    from: "news@gamehub.com",
    text: "New sign-in to your account from your usual device. If this was you, no action is needed.",
    truth: "SAFE",
    why: "Real domain, no link, no pressure — it even says 'no action needed.' Informational, not a lure.",
  },
  {
    id: "photo-lock",
    from: "admin@school-photos-verify.net",
    text: "Your class photo folder will be LOCKED in 6 hours. Confirm your school password now: school-photos-verify.net/confirm",
    truth: "THREAT",
    why: "Deadline pressure plus a password ask on a look-alike domain. That's the M.O., point for point.",
  },
  {
    id: "teacher",
    from: "j.ortega@lincolnms.edu",
    text: "Reminder — permission slips for the museum trip are due Friday. Paper copies in the bin by my desk.",
    truth: "SAFE",
    why: "Known sender, real domain, nothing requested but a paper form. Boring is usually safe.",
  },
  {
    id: "prize",
    from: "rewards@gamehub.gift-prize-center.com",
    text: "Congratulations! You won a $50 GameHub card. Claim within 30 minutes: gamehub.gift-prize-center.com/claim",
    truth: "THREAT",
    why: "A prize you never entered for, a countdown, and gamehub riding in front of a stranger's domain.",
  },
];

const CONTAINMENT = [
  {
    id: "forward",
    label: "Forward the fake email to the whole group with a warning",
    correct: false,
    outcome:
      "You just re-delivered the weapon — the live link is now in forty more inboxes, wearing your name as the sender. Warn people, never re-send the bait.",
  },
  {
    id: "report",
    label: "Report the sender, block it, and post a plain-text warning with no link",
    correct: true,
    outcome:
      "Clean containment. The platform takes the sender down, the block protects this inbox, and the warning protects everyone else's — without spreading the hook.",
  },
  {
    id: "delete",
    label: "Delete it quietly and move on",
    correct: false,
    outcome:
      "You're safe. The other thirty-nine kids aren't. Analysts protect the network, not just their own inbox.",
  },
];

export default function Mission01Incident({ reduced, audio, onPhaseCleared, onComplete }: IncidentProps) {
  const [phase, setPhase] = useState(1);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[1, 2, 3].map((p) => (
          <span
            key={p}
            style={{
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: "0.08em",
              padding: "3px 8px",
              borderRadius: 2,
              border: `1px solid ${p === phase ? T.threatRed : T.hairline}`,
              color: p === phase ? T.threatRed : p < phase ? T.confirmedGreen : T.textDisabled,
            }}
          >
            {p < phase ? "■" : "□"} PHASE {p}
          </span>
        ))}
      </div>

      {phase === 1 && (
        <TriagePhase
          reduced={reduced}
          audio={audio}
          onDone={() => {
            onPhaseCleared(1);
            setPhase(2);
          }}
        />
      )}
      {phase === 2 && (
        <ContainmentPhase
          audio={audio}
          onDone={() => {
            onPhaseCleared(2);
            setPhase(3);
          }}
        />
      )}
      {phase === 3 && (
        <TransmitPhase
          reduced={reduced}
          audio={audio}
          onDone={() => {
            onPhaseCleared(3);
            onComplete();
          }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------ phase 1: triage */

function TriagePhase({ reduced, audio, onDone }: { reduced: boolean; audio: IncidentProps["audio"]; onDone: () => void }) {
  const [verdicts, setVerdicts] = useState<Record<string, Verdict | undefined>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const correctCount = WAVE.filter((m) => verdicts[m.id] === m.truth).length;
  const allCorrect = correctCount === WAVE.length;

  const call = (m: WaveMessage, v: Verdict) => {
    if (verdicts[m.id] === m.truth) return;
    setVerdicts((s) => ({ ...s, [m.id]: v }));
    if (v === m.truth) {
      audio.latch();
      setNotes((n) => ({ ...n, [m.id]: m.why }));
    } else {
      audio.thud();
      setNotes((n) => ({ ...n, [m.id]: "Wrong call. Look at the sender and what it's asking of you, then call it again." }));
    }
  };

  return (
    <div>
      <Eyebrow text="Phase 1 — Triage: four messages just hit the class group. Call each one." color={T.actionAmber} />
      <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
        {WAVE.map((m) => {
          const v = verdicts[m.id];
          const settled = v === m.truth;
          const wrong = v !== undefined && !settled;
          return (
            <div
              key={m.id}
              className={!reduced && !settled ? "sr-takeover" : undefined}
              style={{
                background: T.paper,
                color: T.fileInk,
                borderRadius: 2,
                padding: "14px 16px",
                boxShadow: "0 2px 0 rgba(0,0,0,0.55)",
                border: settled ? `1px solid ${T.confirmedGreen}` : reduced ? undefined : "1px solid transparent",
              }}
            >
              <div style={{ fontFamily: MONO, fontSize: 12, opacity: 0.65, marginBottom: 6 }}>FROM: {m.from}</div>
              <p style={{ fontSize: 14, lineHeight: 1.55, margin: "0 0 10px" }}>{m.text}</p>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                {(["THREAT", "SAFE"] as Verdict[]).map((opt) => {
                  const chosen = v === opt;
                  const chosenColor = opt === m.truth ? T.confirmedGreen : T.threatRed;
                  return (
                    <button
                      key={opt}
                      onClick={() => call(m, opt)}
                      className="sr-btn"
                      style={{
                        fontFamily: MONO,
                        fontSize: 11,
                        letterSpacing: "0.08em",
                        padding: "6px 12px",
                        borderRadius: 2,
                        cursor: settled ? "default" : "pointer",
                        color: chosen ? T.paper : T.fileInk,
                        background: chosen ? chosenColor : "transparent",
                        border: `1px solid ${chosen ? chosenColor : T.fileInk}55`,
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
                {notes[m.id] && (
                  <span role="status" style={{ fontSize: 12.5, lineHeight: 1.5, color: settled ? "#1F7A4D" : "#8A2E2E", flex: 1, minWidth: 200 }}>
                    {notes[m.id]}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ fontFamily: MONO, fontSize: 12, color: allCorrect ? T.confirmedGreen : T.textSecondary }}>
          {correctCount}/{WAVE.length} CALLED CORRECTLY
        </span>
        {allCorrect && <AmberButton label="WAVE SORTED — NEXT" onClick={onDone} />}
      </div>
    </div>
  );
}

/* -------------------------------------------------- phase 2: containment */

function ContainmentPhase({ audio, onDone }: { audio: IncidentProps["audio"]; onDone: () => void }) {
  const [chosen, setChosen] = useState<string | null>(null);
  const option = CONTAINMENT.find((o) => o.id === chosen) ?? null;

  const choose = (id: string) => {
    if (chosen) return;
    const o = CONTAINMENT.find((x) => x.id === id);
    if (!o) return;
    setChosen(id);
    if (o.correct) audio.latch();
    else audio.thud();
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <Eyebrow text="Phase 2 — Cut the hook: the group is still getting hit. Your containment call." color={T.actionAmber} />
      <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
        {CONTAINMENT.map((o) => {
          const isChosen = chosen === o.id;
          const stateColor = o.correct ? T.confirmedGreen : T.threatRed;
          return (
            <button
              key={o.id}
              onClick={() => choose(o.id)}
              className="sr-btn"
              disabled={!!chosen}
              style={{
                textAlign: "left",
                fontFamily: MONO,
                fontSize: 13,
                lineHeight: 1.5,
                color: isChosen ? stateColor : T.textPrimary,
                background: isChosen ? `${stateColor}14` : T.panelRaised,
                border: `1px solid ${isChosen ? stateColor : T.hairline}`,
                borderRadius: 3,
                padding: "12px 14px",
                cursor: chosen ? "default" : "pointer",
              }}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      {option && (
        <div role="status" style={{ marginTop: 14, borderLeft: `2px solid ${option.correct ? T.confirmedGreen : T.threatRed}`, paddingLeft: 14 }}>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{option.outcome}</p>
          <div style={{ marginTop: 12 }}>
            {option.correct ? (
              <AmberButton label="CONTAINMENT SET — NEXT" onClick={onDone} />
            ) : (
              <GhostButton label="RECONSIDER" onClick={() => setChosen(null)} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------- phase 3: transmit */

function TransmitPhase({ reduced, audio, onDone }: { reduced: boolean; audio: IncidentProps["audio"]; onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [sent, setSent] = useState(false);
  const timer = useRef<number | null>(null);

  const start = () => {
    if (sent || reduced) return;
    stop();
    timer.current = window.setInterval(() => {
      setProgress((p) => {
        const next = Math.min(100, p + 8);
        if (next >= 100) {
          finish();
        }
        return next;
      });
    }, 90);
  };

  const stop = () => {
    if (timer.current !== null) {
      window.clearInterval(timer.current);
      timer.current = null;
    }
  };

  const finish = () => {
    stop();
    if (!sent) {
      setSent(true);
      audio.stamp();
      window.setTimeout(onDone, reduced ? 250 : 700);
    }
  };

  return (
    <div style={{ maxWidth: 560 }}>
      <Eyebrow text="Phase 3 — File it: your report takes the campaign off the board." color={T.actionAmber} />
      <p style={{ fontSize: 15, lineHeight: 1.6, color: T.textSecondary, margin: "12px 0 18px" }}>
        Triage logged. Containment set. One thing left — put it on the record so the platform, the school,
        and the next class see this coming.
      </p>
      {!sent ? (
        reduced ? (
          <AmberButton label="TRANSMIT REPORT" onClick={finish} />
        ) : (
          <button
            onPointerDown={start}
            onPointerUp={stop}
            onPointerLeave={stop}
            className="sr-btn sr-scanfill"
            style={{
              fontFamily: MONO,
              fontSize: 13,
              letterSpacing: "0.06em",
              color: T.inkBlack,
              background: T.actionAmber,
              border: "none",
              borderRadius: 3,
              padding: "14px 26px",
              cursor: "pointer",
            }}
          >
            <span className="sr-scanfill-bar" style={{ width: `${progress}%` }} />
            <span style={{ position: "relative" }}>HOLD TO TRANSMIT — {progress}%</span>
          </button>
        )
      ) : (
        <p role="status" style={{ fontFamily: MONO, fontSize: 13, letterSpacing: "0.06em", color: T.confirmedGreen, margin: 0 }}>
          REPORT FILED — SIGNAL CLEAR.
        </p>
      )}
    </div>
  );
}
