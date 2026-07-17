"use client";

/**
 * Mission 18 incident — "The Offer".
 *
 * The coordinator's first, veiled contact. The child hears the pitch,
 * walks away clean, and files the report that becomes the thread to
 * the coordinator. Phases:
 *   1. HEAR THE OFFER — the escalating pitch; when do you exit?
 *   2. WALK AWAY CLEAN — the exit that leaves no leverage
 *   3. FILE THE THREAD — breadcrumb ⑤: the signature is the
 *      coordinator; the report becomes the lead
 */

import { useState } from "react";
import { AmberButton, Bubble, Eyebrow, GhostButton } from "../engine/primitives";
import { MONO, T } from "../engine/tokens";
import type { IncidentProps } from "../engine/types";

/* Phase 1 — the pitch escalates over three lines; the RIGHT answer is
   to exit at the very first ask, before any hook is set. */
const OFFER = [
  {
    id: "hear",
    label: "“Sure, tell me more” — it's just talk, no harm listening",
    correct: false,
    outcome:
      "Every extra line is a lever tightening. “Just listening” is how the yes gets built. The exit is now, before the hook.",
  },
  {
    id: "exit",
    label: "Stop reading, don't reply, don't engage — the offer is the attack",
    correct: true,
    outcome:
      "Correct. You don't debate a recruiter any more than you argue with a phishing email. Silence gives them nothing to work with.",
  },
  {
    id: "insult",
    label: "Reply “I know exactly what you are, loser” to shut them down",
    correct: false,
    outcome:
      "A reply confirms a real, reachable kid who's rattled — exactly the profile they refine. Cleverness isn't the goal. Silence is.",
  },
];

const WALKS = [
  {
    id: "block",
    label: "Block, screenshot the message for evidence, tell a trusted adult tonight",
    correct: true,
    outcome:
      "The clean walk: no engagement, evidence preserved, an adult in the loop the same day. Nothing for them to escalate, everything for ARC to trace.",
  },
  {
    id: "delete",
    label: "Just delete it and never mention it to anyone",
    correct: false,
    outcome:
      "Deleting alone erases the evidence AND the warning. Recruiters work whole schools — your quiet report protects kids you'll never meet.",
  },
  {
    id: "string",
    label: "Play along to gather more intel on them yourself",
    correct: false,
    outcome:
      "That's an actor's move, not an analyst's — you're not equipped to run a source, and engaging is the risk. Report; let ARC and adults trace.",
  },
];

const THREADS = [
  {
    id: "nobody",
    label: "Some random scammer — nothing special, forget it",
    correct: false,
    outcome:
      "Run the signature before you shrug. That channel fingerprint has appeared before… four times. Check the board.",
  },
  {
    id: "coord",
    label: "The signature matches every actor AND the architect — this is the COORDINATOR, first contact",
    correct: true,
    outcome:
      "There it is. The recruiter's fingerprint matches PHANTOM HOOK, SIREN, PACKRAT, MIMIC, GHOSTWRITER — and the M15 architect. Six actors, one hand, and tonight it reached out to YOU. Your refusal became a sample of their signature. The report IS the thread that finds them.",
  },
  {
    id: "arc",
    label: "A test by ARC to check your loyalty",
    correct: false,
    outcome:
      "ARC signs its messages and never dangles crime as bait. This came from the dark — and the signature proves where. Trust the trace, not the flattery-shaped doubt.",
  },
];

export default function Mission18Incident({ reduced, audio, onPhaseCleared, onComplete }: IncidentProps) {
  const [phase, setPhase] = useState(1);
  const [offer, setOffer] = useState<string | null>(null);
  const [walk, setWalk] = useState<string | null>(null);
  const [thread, setThread] = useState<string | null>(null);
  const [filed, setFiled] = useState(false);

  const pick =
    (set: (v: string | null) => void, list: { id: string; correct: boolean }[], cur: string | null) =>
    (id: string) => {
      if (cur && list.find((o) => o.id === cur)?.correct) return;
      set(id);
      const o = list.find((x) => x.id === id);
      if (o?.correct) audio.latch();
      else audio.thud();
    };

  const offerChoice = OFFER.find((o) => o.id === offer) ?? null;
  const walkChoice = WALKS.find((o) => o.id === walk) ?? null;
  const threadChoice = THREADS.find((o) => o.id === thread) ?? null;

  const stage = (
    intro: string,
    scene: string | null,
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
      {scene && (
        <div style={{ margin: "14px 0", background: T.paper, borderRadius: 2, padding: "14px 16px", boxShadow: "0 2px 0 rgba(0,0,0,0.5)" }}>
          <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.65, color: T.fileInk }}>{scene}</p>
        </div>
      )}
      <div style={{ display: "grid", gap: 10, marginTop: scene ? 0 : 14 }}>
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
            INTERCEPTED — [SIGNATURE UNRESOLVED], ON THE WIRE
          </div>
          <Bubble who="villain">
            <em>&ldquo;They taught you so much, didn't they. Such a shame to waste it defending. I could make you something. Just one small favor to start…&rdquo;</em>
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

      {phase === 1 &&
        stage(
          "Phase 1 — The offer is on your screen. When do you exit?",
          "“You're wasted at ARC.” … “Real work, real money.” … “Tiny first job — just lend me your account for one transfer.”",
          OFFER,
          offer,
          offerChoice,
          pick(setOffer, OFFER, offer),
          "EXITED CLEAN — NOW WALK",
          () => {
            audio.stamp();
            onPhaseCleared(1);
            setPhase(2);
          },
          () => setOffer(null),
        )}

      {phase === 2 &&
        stage(
          "Phase 2 — You've stopped engaging. Now leave it so they have zero leverage.",
          null,
          WALKS,
          walk,
          walkChoice,
          pick(setWalk, WALKS, walk),
          "WALKED CLEAN — FILE IT",
          () => {
            audio.stamp();
            onPhaseCleared(2);
            setPhase(3);
          },
          () => setWalk(null),
        )}

      {phase === 3 && !filed &&
        stage(
          "Phase 3 — ARC runs the sender's signature against the whole dossier board. Who was that?",
          "SIGNATURE TRACE: matching against known actors… PHANTOM HOOK ✓ SIREN ✓ PACKRAT ✓ MIMIC ✓ GHOSTWRITER ✓ … architect (CASE 015) ✓ … resolving identity…",
          THREADS,
          thread,
          threadChoice,
          pick(setThread, THREADS, thread),
          "FILE THE THREAD",
          () => {
            setFiled(true);
            audio.stamp();
            onPhaseCleared(3);
            window.setTimeout(onComplete, reduced ? 250 : 700);
          },
          () => setThread(null),
        )}

      {phase === 3 && filed && (
        <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.06em", color: T.confirmedGreen, margin: 0 }}>
          FILED — THE COORDINATOR REACHED OUT, AND YOU HANDED ARC THE THREAD. THE CODE, RE-SIGNED.
        </p>
      )}
    </div>
  );
}
