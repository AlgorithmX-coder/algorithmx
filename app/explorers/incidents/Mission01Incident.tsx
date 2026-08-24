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
import { AmberButton, Bubble, Eyebrow, GhostButton } from "../engine/primitives";
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
    why: "Real domain, no link, no pressure. It even says 'no action needed.' Informational, not a lure.",
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
    text: "Reminder: permission slips for the museum trip are due Friday. Paper copies in the bin by my desk.",
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
  {
    id: "qr-verify",
    from: "security@gamehub.account-check.net",
    text: "Scan the QR code in this email to verify your account. It opens: gamehub.account-check.net/verify",
    truth: "THREAT",
    why: "A QR is just a hidden link. Its real owner is account-check.net, a stranger, and it's rushing you to verify. Threat.",
  },
  {
    id: "coin-gen",
    from: "no-reply@gamehub-coins.net",
    text: "Download the free GameHub Coin Generator and get 10,000 coins instantly!",
    truth: "THREAT",
    why: "Free coin generators don't exist. That download is a virus, not coins. And the sender isn't even really GameHub.",
  },
  {
    id: "newsletter",
    from: "news@gamehub.com",
    text: "Your monthly GameHub newsletter: three new games out this week. No action needed.",
    truth: "SAFE",
    why: "Real domain, no link to tap, no pressure, nothing asked. Just news. Safe.",
  },
];

const CONTAINMENT = [
  {
    id: "forward",
    label: "Forward the fake email to the whole group with a warning",
    correct: false,
    outcome:
      "You just re-delivered the weapon. The live link is now in forty more inboxes, wearing your name as the sender. Warn people, never re-send the bait.",
  },
  {
    id: "report",
    label: "Report the sender, block it, and post a plain-text warning with no link",
    correct: true,
    outcome:
      "Clean containment. The platform takes the sender down, the block protects this inbox, and the warning protects everyone else's, without spreading the hook.",
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
      {phase === 1 && (
        <div style={{ marginBottom: 18, maxWidth: 560 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: T.threatRed, marginBottom: 8 }}>
            INTERCEPTED: PHANTOM HOOK, ON THE WIRE
          </div>
          <Bubble who="villain">
            <em>&ldquo;One email down, little analyst? Cute. I sent a whole WAVE while you were reading it. Links, codes, downloads, the lot. Sort THAT.&rdquo;</em>
          </Bubble>
        </div>
      )}
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
  const [submitted, setSubmitted] = useState(false);
  const answered = Object.keys(verdicts).length;
  const allAnswered = answered === WAVE.length;
  const correctCount = WAVE.filter((m) => verdicts[m.id] === m.truth).length;
  const allCorrect = correctCount === WAVE.length;

  // Blind: change your calls freely; nothing is revealed until you SUBMIT.
  const call = (m: WaveMessage, v: Verdict) => {
    if (submitted) return;
    audio.click();
    setVerdicts((s) => ({ ...s, [m.id]: v }));
  };
  const submit = () => {
    if (!allAnswered) return;
    setSubmitted(true);
    if (allCorrect) audio.stamp(); else audio.thud();
  };

  return (
    <div>
      <Eyebrow text="Phase 1 · Triage: a wave just hit the class group. Call every one, then submit." color={T.actionAmber} />
      <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
        {WAVE.map((m) => {
          const v = verdicts[m.id];
          const correct = v === m.truth;
          return (
            <div
              key={m.id}
              className={!reduced && !submitted ? "sr-takeover" : undefined}
              style={{
                background: T.paper,
                color: T.fileInk,
                borderRadius: 2,
                padding: "14px 16px",
                boxShadow: "0 2px 0 rgba(0,0,0,0.55)",
                border: submitted ? `1px solid ${correct ? T.confirmedGreen : T.threatRed}` : reduced ? undefined : "1px solid transparent",
              }}
            >
              <div style={{ fontFamily: MONO, fontSize: 12, opacity: 0.65, marginBottom: 6 }}>FROM: {m.from}</div>
              <p style={{ fontSize: 14, lineHeight: 1.55, margin: "0 0 10px" }}>{m.text}</p>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                {(["THREAT", "SAFE"] as Verdict[]).map((opt) => {
                  const chosen = v === opt;
                  // Pre-submit: neutral highlight on your pick. Post-submit: the
                  // TRUE answer goes green, and a wrong pick goes red.
                  const bg = submitted
                    ? opt === m.truth ? T.confirmedGreen : chosen ? T.threatRed : "transparent"
                    : chosen ? T.arcCyan : "transparent";
                  const filled = bg !== "transparent";
                  return (
                    <button
                      key={opt}
                      onClick={() => call(m, opt)}
                      className="sr-btn"
                      disabled={submitted}
                      style={{
                        fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", padding: "6px 12px", borderRadius: 2,
                        cursor: submitted ? "default" : "pointer",
                        color: filled ? T.paper : T.fileInk,
                        background: bg,
                        border: `1px solid ${T.fileInk}55`,
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
                {submitted && v && (
                  <span role="status" style={{ fontSize: 12.5, lineHeight: 1.5, color: correct ? "#1F7A4D" : "#8A2E2E", flex: 1, minWidth: 200 }}>
                    {correct ? m.why : `Wrong call — this one was ${m.truth}. ${m.why}`}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        {!submitted ? (
          allAnswered ? (
            <AmberButton label="SUBMIT ALL CALLS" onClick={submit} />
          ) : (
            <span style={{ fontFamily: MONO, fontSize: 12, color: T.textSecondary }}>Call all four, then submit ({answered}/{WAVE.length})</span>
          )
        ) : allCorrect ? (
          <>
            <span style={{ fontFamily: MONO, fontSize: 12, color: T.confirmedGreen }}>ALL {WAVE.length} CALLED RIGHT</span>
            <AmberButton label="WAVE SORTED · NEXT" onClick={onDone} />
          </>
        ) : (
          <>
            <span style={{ fontFamily: MONO, fontSize: 12, color: T.threatRed }}>{correctCount}/{WAVE.length} right — see the marks above.</span>
            <AmberButton label="TRY AGAIN" onClick={() => setSubmitted(false)} />
          </>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------- phase 2: containment */

function ContainmentPhase({ audio, onDone }: { audio: IncidentProps["audio"]; onDone: () => void }) {
  const [chosen, setChosen] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const option = CONTAINMENT.find((o) => o.id === chosen) ?? null;

  // Blind: pick and change freely; the outcome only shows after you submit.
  const choose = (id: string) => {
    if (submitted) return;
    audio.click();
    setChosen(id);
  };
  const submit = () => {
    if (!chosen) return;
    setSubmitted(true);
    if (option?.correct) audio.latch(); else audio.thud();
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <Eyebrow text="Phase 2 · Cut the hook: the group is still getting hit. Make your call, then submit." color={T.actionAmber} />
      <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
        {CONTAINMENT.map((o) => {
          const isChosen = chosen === o.id;
          // Pre-submit: neutral highlight on your pick. Post-submit: green if it
          // was right, red if it was wrong.
          const col = submitted && isChosen ? (o.correct ? T.confirmedGreen : T.threatRed) : isChosen ? T.arcCyan : T.hairline;
          return (
            <button
              key={o.id}
              onClick={() => choose(o.id)}
              className="sr-btn"
              disabled={submitted}
              aria-pressed={isChosen}
              style={{
                textAlign: "left", fontFamily: MONO, fontSize: 13, lineHeight: 1.5,
                color: isChosen ? T.textPrimary : T.textSecondary,
                background: isChosen ? `${col}1F` : T.panelRaised,
                border: `1px solid ${col}`,
                borderRadius: 3, padding: "12px 14px",
                cursor: submitted ? "default" : "pointer",
              }}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      {!submitted ? (
        <div style={{ marginTop: 14 }}>
          {chosen ? (
            <AmberButton label="SUBMIT MY CALL" onClick={submit} />
          ) : (
            <span style={{ fontFamily: MONO, fontSize: 12, color: T.textSecondary }}>Pick your containment call, then submit.</span>
          )}
        </div>
      ) : option ? (
        <div role="status" style={{ marginTop: 14, borderLeft: `2px solid ${option.correct ? T.confirmedGreen : T.threatRed}`, paddingLeft: 14 }}>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{option.outcome}</p>
          <div style={{ marginTop: 12 }}>
            {option.correct ? (
              <AmberButton label="CONTAINMENT SET · NEXT" onClick={onDone} />
            ) : (
              <GhostButton label="RECONSIDER" onClick={() => { setSubmitted(false); setChosen(null); }} />
            )}
          </div>
        </div>
      ) : null}
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
      <Eyebrow text="Phase 3 · File it: your report takes the campaign off the board." color={T.actionAmber} />
      <p style={{ fontSize: 15, lineHeight: 1.6, color: T.textSecondary, margin: "12px 0 18px" }}>
        Triage logged. Containment set. One thing left: put it on the record so the platform, the school,
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
            <span style={{ position: "relative" }}>HOLD TO TRANSMIT · {progress}%</span>
          </button>
        )
      ) : (
        <p role="status" style={{ fontFamily: MONO, fontSize: 13, letterSpacing: "0.06em", color: T.confirmedGreen, margin: 0 }}>
          REPORT FILED. SIGNAL CLEAR.
        </p>
      )}
    </div>
  );
}
