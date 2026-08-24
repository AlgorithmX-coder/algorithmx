"use client";

/**
 * Mission 02 incident — "The Prize Factory".
 *
 * SIREN floods every channel with a giveaway funnel at once. Blind field
 * mission that uses every skill together:
 *   1. TRIAGE  — call SCAM or SAFE on the whole flood (blind; reveal on submit)
 *   2. CUT THE FUNNEL — one containment call kills the whole factory
 *   3. WARN    — send the message that actually helps the kids already hooked
 */

import { useState } from "react";
import { AmberButton, Bubble, Eyebrow, GhostButton } from "../engine/primitives";
import { MONO, T } from "../engine/tokens";
import type { IncidentProps } from "../engine/types";

type Verdict = "SCAM" | "SAFE";

interface WaveMessage {
  id: string;
  from: string;
  text: string;
  truth: Verdict;
  why: string;
}

const WAVE: WaveMessage[] = [
  {
    id: "skinstorm",
    from: "unknown number",
    text: "SKINSTORM: 500 FREE skins, today only! First come first served: skinstorm-event.net",
    truth: "SCAM",
    why: "Too good to be true (500 free), a fake clock, and a look-alike site. Bait, point for point.",
  },
  {
    id: "winner-dm",
    from: "@GameHub_Giveaway_Official_2024",
    text: "You WON our giveaway! DM your username and password to claim your prize 🎁",
    truth: "SCAM",
    why: "A bolted-on look-alike account, from a giveaway you never entered, asking for your password. That's the switch.",
  },
  {
    id: "library",
    from: "Ms. Okafor",
    text: "Reminder: library books are due back this Friday. Paper slips are on my desk.",
    truth: "SAFE",
    why: "Known sender, nothing to claim, no link, no pressure. Just a boring school note.",
  },
  {
    id: "giftcard",
    from: "rewards@free-cards-now.net",
    text: "Claim a FREE £100 gift card! Just finish 20 offers and pay a small processing fee.",
    truth: "SCAM",
    why: "'Free' that makes you jump through hoops and pay a fee is never free. The card never arrives.",
  },
  {
    id: "friend",
    from: "your friend Leo",
    text: "gg that last match was so close lol",
    truth: "SAFE",
    why: "Just a friend chatting. No prize, no link, no pressure. Safe.",
  },
  {
    id: "scarcity",
    from: "SKINSTORM promo",
    text: "⏳ Only 2 spots left! 998 already claimed! Scan the code to enter before it's gone!",
    truth: "SCAM",
    why: "Fake scarcity and a fake countdown to panic you, funnelling you to the same scam. A trap.",
  },
  {
    id: "newsletter",
    from: "news@gamehub.com",
    text: "Your monthly GameHub newsletter: three new games out this week. No action needed.",
    truth: "SAFE",
    why: "Real domain, no link to tap, no pressure, nothing asked. Just news.",
  },
];

const CUTS = [
  {
    id: "block",
    label: "Block the giveaway senders one by one",
    correct: false,
    outcome: "They're throwaway accounts. SIREN makes new ones faster than you can block. The accounts are disposable; the FORM is the factory.",
  },
  {
    id: "hub",
    label: "Report the one claim site every message points to, to the platform AND the game",
    correct: true,
    outcome: "That's the cut. Every funnel drains into that one form. Kill the collection point and all of it dies at once: root cause, not whack-a-mole.",
  },
  {
    id: "reply",
    label: "Reply to the giveaways telling SIREN to stop",
    correct: false,
    outcome: "Now she knows a real person is reading, and you're on her list for the next trick. Never reply. Report.",
  },
];

const WARNINGS = [
  {
    id: "forward",
    label: "Forward the giveaway to the group with “DON'T CLICK THIS!”",
    correct: false,
    outcome: "You just put the live hook back in front of forty kids. Some will click it BECAUSE it says don't. Never re-send the bait.",
  },
  {
    id: "shame",
    label: "“Anyone who fell for that is so silly lol”",
    correct: false,
    outcome: "Now nobody who clicked will admit it, so nobody changes their password. Shame protects the scam. Analysts protect people.",
  },
  {
    id: "plain",
    label: "Plain text, no link: “That skins giveaway is fake. If you typed anything, change your password now and tell an adult. Not your fault, it's built to fool people.”",
    correct: true,
    outcome: "Clean. No live link, no shame, a clear next step. That message just saved passwords you'll never hear about.",
  },
];

export default function Mission02Incident({ reduced, audio, onPhaseCleared, onComplete }: IncidentProps) {
  const [phase, setPhase] = useState(1);

  return (
    <div>
      {phase === 1 && (
        <div style={{ marginBottom: 18, maxWidth: 560 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: T.threatRed, marginBottom: 8 }}>
            INTERCEPTED: SIREN, ON THE WIRE
          </div>
          <Bubble who="villain">
            <em>&ldquo;Everybody wants a prize, sweetheart. I just help them want mine. A whole flood of them, all at once. Try to keep up.&rdquo;</em>
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

      {phase === 1 && <TriagePhase reduced={reduced} audio={audio} onDone={() => { onPhaseCleared(1); setPhase(2); }} />}
      {phase === 2 && <CutPhase audio={audio} onDone={() => { onPhaseCleared(2); setPhase(3); }} />}
      {phase === 3 && (
        <WarnPhase reduced={reduced} audio={audio} onDone={() => { onPhaseCleared(3); onComplete(); }} />
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
      <Eyebrow text="Phase 1 · Triage: SIREN's flood just hit the school. Call every one, then submit." color={T.actionAmber} />
      <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
        {WAVE.map((m) => {
          const v = verdicts[m.id];
          const correct = v === m.truth;
          return (
            <div key={m.id} className={!reduced && !submitted ? "sr-takeover" : undefined}
              style={{ background: T.paper, color: T.fileInk, borderRadius: 2, padding: "14px 16px", boxShadow: "0 2px 0 rgba(0,0,0,0.55)", border: submitted ? `1px solid ${correct ? T.confirmedGreen : T.threatRed}` : reduced ? undefined : "1px solid transparent" }}>
              <div style={{ fontFamily: MONO, fontSize: 12, opacity: 0.65, marginBottom: 6 }}>FROM: {m.from}</div>
              <p style={{ fontSize: 14, lineHeight: 1.55, margin: "0 0 10px" }}>{m.text}</p>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                {(["SCAM", "SAFE"] as Verdict[]).map((opt) => {
                  const chosen = v === opt;
                  const bg = submitted
                    ? opt === m.truth ? T.confirmedGreen : chosen ? T.threatRed : "transparent"
                    : chosen ? T.arcCyan : "transparent";
                  const filled = bg !== "transparent";
                  return (
                    <button key={opt} onClick={() => call(m, opt)} className="sr-btn" disabled={submitted}
                      style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", padding: "6px 12px", borderRadius: 2, cursor: submitted ? "default" : "pointer", color: filled ? T.paper : T.fileInk, background: bg, border: `1px solid ${T.fileInk}55` }}>
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
            <span style={{ fontFamily: MONO, fontSize: 12, color: T.textSecondary }}>Call all {WAVE.length}, then submit ({answered}/{WAVE.length})</span>
          )
        ) : allCorrect ? (
          <>
            <span style={{ fontFamily: MONO, fontSize: 12, color: T.confirmedGreen }}>ALL {WAVE.length} CALLED RIGHT</span>
            <AmberButton label="FLOOD SORTED · NEXT" onClick={onDone} />
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

/* -------------------------------------------------- phase 2: cut the funnel */

function CutPhase({ audio, onDone }: { audio: IncidentProps["audio"]; onDone: () => void }) {
  const [chosen, setChosen] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const option = CUTS.find((o) => o.id === chosen) ?? null;

  const choose = (id: string) => { if (submitted) return; audio.click(); setChosen(id); };
  const submit = () => { if (!chosen) return; setSubmitted(true); if (option?.correct) audio.latch(); else audio.thud(); };

  return (
    <div style={{ maxWidth: 640 }}>
      <Eyebrow text="Phase 2 · Cut the funnel: one move shuts the whole factory. Make your call, then submit." color={T.actionAmber} />
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
            {option.correct
              ? <AmberButton label="FACTORY DOWN · NEXT" onClick={onDone} />
              : <GhostButton label="RECONSIDER" onClick={() => { setSubmitted(false); setChosen(null); }} />}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------- phase 3: warn everyone */

function WarnPhase({ reduced, audio, onDone }: { reduced: boolean; audio: IncidentProps["audio"]; onDone: () => void }) {
  const [chosen, setChosen] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [sent, setSent] = useState(false);
  const option = WARNINGS.find((o) => o.id === chosen) ?? null;

  const choose = (id: string) => { if (submitted) return; audio.click(); setChosen(id); };
  const submit = () => { if (!chosen) return; setSubmitted(true); if (option?.correct) audio.latch(); else audio.thud(); };

  return (
    <div style={{ maxWidth: 640 }}>
      <Eyebrow text="Phase 3 · Warn everyone: some kids already typed things. Pick the message that actually helps, then submit." color={T.actionAmber} />
      <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
        {WARNINGS.map((o) => {
          const isChosen = chosen === o.id;
          const col = submitted && isChosen ? (o.correct ? T.confirmedGreen : T.threatRed) : isChosen ? T.arcCyan : T.hairline;
          return (
            <button key={o.id} onClick={() => choose(o.id)} className="sr-btn" disabled={submitted} aria-pressed={isChosen}
              style={{ textAlign: "left", fontSize: 13.5, lineHeight: 1.55, color: isChosen ? T.textPrimary : T.textSecondary, background: isChosen ? `${col}1F` : T.panelRaised, border: `1px solid ${col}`, borderRadius: 3, padding: "12px 14px", cursor: submitted ? "default" : "pointer" }}>
              {o.label}
            </button>
          );
        })}
      </div>
      {!submitted ? (
        <div style={{ marginTop: 14 }}>
          {chosen ? <AmberButton label="SUBMIT MY CALL" onClick={submit} /> : <span style={{ fontFamily: MONO, fontSize: 12, color: T.textSecondary }}>Pick the warning, then submit.</span>}
        </div>
      ) : option ? (
        <div role="status" style={{ marginTop: 14, borderLeft: `2px solid ${option.correct ? T.confirmedGreen : T.threatRed}`, paddingLeft: 14 }}>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{option.outcome}</p>
          <div style={{ marginTop: 12 }}>
            {option.correct ? (
              !sent ? (
                <AmberButton label="SEND IT" onClick={() => { setSent(true); audio.stamp(); window.setTimeout(onDone, reduced ? 250 : 700); }} />
              ) : (
                <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.06em", color: T.confirmedGreen, margin: 0 }}>SENT. FACTORY SHUT.</p>
              )
            ) : (
              <GhostButton label="RECONSIDER" onClick={() => { setSubmitted(false); setChosen(null); }} />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
