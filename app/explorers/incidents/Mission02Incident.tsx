"use client";

/**
 * Mission 02 incident — "The Prize Factory".
 *
 * Distinct boss shape (NOT Case 001's triage). SIREN's giveaway isn't one
 * scam, it's a factory: three funnels all draining into one collection hub.
 *   1. FIND THE HUB — trace the funnels to the one place they all end up
 *   2. CUT THE HUB  — the containment call (blind: pick, submit, reveal)
 *   3. WARN         — the message that actually helps the kids already hooked
 */

import { useState } from "react";
import { AmberButton, Bubble, Eyebrow, GhostButton } from "../engine/primitives";
import { MONO, T } from "../engine/tokens";
import type { IncidentProps } from "../engine/types";

interface Node {
  id: string;
  label: string;
  lane: 0 | 1 | 2;
  step: 0 | 1 | 2;
  isHub?: boolean;
}

/* Three funnels (school chat / stream chat / DMs), all draining into one
   collection site. The hub sits at the end of every lane. */
const NODES: Node[] = [
  { id: "a1", label: "School chat: “SKINSTORM 500: free skins drop!”", lane: 0, step: 0 },
  { id: "a2", label: "DM: “you're on the winner list!”", lane: 0, step: 1 },
  { id: "b1", label: "Stream chat spam: “SKINSTORM giveaway LIVE”", lane: 1, step: 0 },
  { id: "b2", label: "“Mod” DM: “claim before midnight”", lane: 1, step: 1 },
  { id: "c1", label: "Group text: “my cousin won already lol”", lane: 2, step: 0 },
  { id: "c2", label: "DM: “spots almost gone”", lane: 2, step: 1 },
  { id: "hub", label: "skinstorm-event.net — the CLAIM FORM (username, password, phone)", lane: 1, step: 2, isHub: true },
];

const CUTS = [
  { id: "chat", label: "Report the school-chat post and move on", correct: false, outcome: "One funnel down, two still running, and SIREN posts a new one in an hour. You're playing whack-a-mole with a machine that makes moles." },
  { id: "hub", label: "Report the claim site itself, to the platform AND the game company", correct: true, outcome: "That's the cut. Every funnel drains into that one form. Kill the collection point and all three funnels die at once: root cause, not symptoms." },
  { id: "dm", label: "Block the DM senders one by one", correct: false, outcome: "They're throwaway accounts. SIREN grows new ones faster than you can block. The accounts are disposable. The FORM is the factory." },
];

const WARNINGS = [
  { id: "forward", label: "Forward the giveaway to the group with “DON'T CLICK THIS!”", correct: false, outcome: "You just put the live hook back in front of forty kids. Some will click it BECAUSE it says don't. Never re-send the bait." },
  { id: "shame", label: "“Anyone who fell for that is so silly lol”", correct: false, outcome: "Now nobody who clicked will admit it, so nobody changes their password. Shame protects the scam. Analysts protect people." },
  { id: "plain", label: "Plain text, no link: “That skins giveaway is fake. If you typed anything, change your password now and tell an adult. Not your fault, it's built to fool people.”", correct: true, outcome: "Clean. No live link, no shame, a clear next step. That message just saved passwords you'll never hear about." },
];

export default function Mission02Incident({ reduced, audio, onPhaseCleared, onComplete }: IncidentProps) {
  const [phase, setPhase] = useState(1);
  const [wrongNode, setWrongNode] = useState<string | null>(null);
  const [hubFound, setHubFound] = useState(false);

  const tapNode = (n: Node) => {
    if (hubFound) return;
    if (n.isHub) { setHubFound(true); setWrongNode(null); audio.stamp(); onPhaseCleared(1); }
    else { setWrongNode(n.id); audio.thud(); }
  };

  return (
    <div>
      {phase === 1 && (
        <div style={{ marginBottom: 18, maxWidth: 560 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: T.threatRed, marginBottom: 8 }}>
            INTERCEPTED: SIREN, ON THE WIRE
          </div>
          <Bubble who="villain">
            <em>&ldquo;Everybody wants a prize, sweetheart. I just help them want mine. Three doors, one prize room. Try to keep up. The factory never sleeps.&rdquo;</em>
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

      {/* ---------------- phase 1: find the hub ---------------- */}
      {phase === 1 && (
        <div>
          <Eyebrow text="Phase 1. The factory floor: three funnels are running. Every funnel drains somewhere. Follow the arrows and tap the collection point." color={T.actionAmber} />
          <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
            {[0, 1, 2].map((lane) => (
              <div key={lane} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, alignItems: "stretch" }} className="sr-two-col">
                {NODES.filter((n) => n.lane === lane || (n.isHub && lane === 1)).map((n) => (
                  <button key={n.id} onClick={() => tapNode(n)} className={n.isHub && !reduced && !hubFound ? "sr-btn sr-takeover" : "sr-btn"}
                    style={{ gridColumn: n.step + 1, textAlign: "left", fontFamily: n.isHub ? MONO : undefined, fontSize: n.isHub ? 12 : 12.5, lineHeight: 1.5, color: hubFound && n.isHub ? T.confirmedGreen : wrongNode === n.id ? T.threatRed : T.fileInk, background: T.paper, border: "none", outline: `2px solid ${hubFound && n.isHub ? T.confirmedGreen : wrongNode === n.id ? T.threatRed : "transparent"}`, outlineOffset: -2, borderRadius: 2, padding: "10px 12px", boxShadow: "0 2px 0 rgba(0,0,0,0.5)", cursor: hubFound ? "default" : "pointer" }}>
                    {n.label}
                    {n.step < 2 && <span aria-hidden style={{ fontFamily: MONO, color: "#A66A00" }}> →</span>}
                  </button>
                ))}
              </div>
            ))}
          </div>
          <p role="status" style={{ margin: "12px 0 0", fontSize: 13, color: hubFound ? T.confirmedGreen : T.textSecondary }}>
            {hubFound ? "HUB IDENTIFIED: three funnels, one form. Every trail ends at the same door."
              : wrongNode ? "That's a funnel piece: bait or a nudge. Follow the arrows, where does everything END UP?"
                : "Follow the arrows. The factory has one cash register."}
          </p>
          {hubFound && (
            <div style={{ marginTop: 14 }}>
              <AmberButton label="HUB LOCKED · CUT IT" onClick={() => { audio.click(); setPhase(2); }} />
            </div>
          )}
        </div>
      )}

      {phase === 2 && <CutPhase audio={audio} onDone={() => { onPhaseCleared(2); setPhase(3); }} />}
      {phase === 3 && <WarnPhase reduced={reduced} audio={audio} onDone={() => { onPhaseCleared(3); onComplete(); }} />}
    </div>
  );
}

/* -------------------------------------------------- phase 2: cut the hub */

function CutPhase({ audio, onDone }: { audio: IncidentProps["audio"]; onDone: () => void }) {
  const [chosen, setChosen] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const option = CUTS.find((o) => o.id === chosen) ?? null;
  const choose = (id: string) => { if (submitted) return; audio.click(); setChosen(id); };
  const submit = () => { if (!chosen) return; setSubmitted(true); if (option?.correct) audio.latch(); else audio.thud(); };

  return (
    <div style={{ maxWidth: 640 }}>
      <Eyebrow text="Phase 2 · Cut the hub: one move shuts the whole factory. Make your call, then submit." color={T.actionAmber} />
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
            {option.correct ? <AmberButton label="FACTORY DOWN · NEXT" onClick={onDone} /> : <GhostButton label="RECONSIDER" onClick={() => { setSubmitted(false); setChosen(null); }} />}
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
              !sent ? <AmberButton label="SEND IT" onClick={() => { setSent(true); audio.stamp(); window.setTimeout(onDone, reduced ? 250 : 700); }} />
                : <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.06em", color: T.confirmedGreen, margin: 0 }}>SENT. FACTORY SHUT.</p>
            ) : <GhostButton label="RECONSIDER" onClick={() => { setSubmitted(false); setChosen(null); }} />}
          </div>
        </div>
      ) : null}
    </div>
  );
}
