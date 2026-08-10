"use client";

/**
 * Mission 18 incident — "The Offer".
 *
 * The coordinator's first, veiled contact. The child hears the pitch,
 * walks away clean, and files the report that becomes the thread to
 * the coordinator. Three DISTINCT beats, not three menus:
 *   1. STOP THE TAPE — the pitch reveals one line at a time (flattery,
 *      money, then the "tiny favor" that is the whole crime). Walk away;
 *      the sooner you go, the less the recruiter's hook can set.
 *   2. RIGHT RESPONSE — one decisive verdict: what do you owe the offer?
 *   3. TELL AN ADULT — the responsible close: report it and let ARC
 *      trace it. Filing reveals the signature: this was the COORDINATOR,
 *      first contact (breadcrumb ⑤), and your report becomes the lead.
 */

import { useState } from "react";
import { AmberButton, Bubble, Eyebrow, GhostButton } from "../engine/primitives";
import { MONO, T } from "../engine/tokens";
import type { IncidentProps } from "../engine/types";
import { BossIntro, PhasePips } from "./BossChrome";

/* Phase 1 — the recruiter's pitch, escalating one line at a time.
   Flattery, then money, then the "tiny favor" that is the whole crime. */
const PITCH = [
  "“You're wasted at ARC. All that talent, spent playing defense for other people.”",
  "“Come to the other side. Real work, real money, and nobody grading your homework.”",
  "“Tiny first job, just to prove you're in: lend me your account for one quick transfer.”",
];

/** The recruiter's hook, by lines read (index = linesRead - 1). Higher = worse. */
const HOOK = [15, 50, 85];

/** What walking away now means, by how many lines you read first. */
const WALK_NOTES = [
  // walked after line 1 (the flattery)
  "Gone before the first favor. You read one line, felt the pitch, and left. The recruiter got a wave into empty air. That is the whole skill.",
  // walked after line 2 (the money)
  "Clean exit, and you handed over nothing. Still, notice: the flattery in line one was already the hook. The smart move is to leave the second it turns into a pitch.",
  // walked after line 3 (the favor that is the crime)
  "You still walked, and that is what counts. But you read all the way to the ask. A pitch never gets safer the longer you listen. Next time, leave at the flattery.",
];

/* Phase 2 — one decisive verdict: the right response to the offer. */
const OFFER = [
  {
    id: "hear",
    label: "“Sure, tell me more.” It's just talk, no harm listening",
    correct: false,
    outcome:
      "Every extra line is a lever tightening. “Just listening” is how the yes gets built. The exit is now, before the hook.",
  },
  {
    id: "exit",
    label: "Stop reading, don't reply, don't engage. The offer is the attack",
    correct: true,
    outcome:
      "Correct. You don't debate a recruiter any more than you argue with a phishing email. Silence gives them nothing to work with.",
  },
  {
    id: "insult",
    label: "Reply “I know exactly what you are, loser” to shut them down",
    correct: false,
    outcome:
      "A reply proves you're a real, reachable kid who's rattled. That's exactly what they want. Cleverness isn't the goal. Silence is.",
  },
];

/* Phase 3 — one decisive verdict: the responsible close. Tell a trusted
   adult and file it; the report is what ARC traces to the coordinator. */
const WALKS = [
  {
    id: "block",
    label: "Block, screenshot the message for evidence, tell a trusted adult tonight",
    correct: true,
    outcome:
      "The clean close: no reply, evidence saved, a trusted adult told the same day. Then ARC runs the sender's signature and the board lights up: PHANTOM HOOK, SIREN, PACKRAT, MIMIC, and GHOSTWRITER, plus the CASE 015 architect. Six actors, one hand. Tonight the COORDINATOR reached out to YOU, and your quiet report just became the thread that finds them.",
  },
  {
    id: "delete",
    label: "Just delete it and never mention it to anyone",
    correct: false,
    outcome:
      "Deleting alone erases the evidence AND the warning. Recruiters work whole schools. Your quiet report protects kids you'll never meet.",
  },
  {
    id: "string",
    label: "Play along to gather more intel on them yourself",
    correct: false,
    outcome:
      "That's an actor's move, not an analyst's. You're not trained to play spy, and talking to them is the risk. Report it. Let ARC and adults trace.",
  },
];

export default function Mission18Incident({ reduced, audio, onPhaseCleared, onComplete }: IncidentProps) {
  const [phase, setPhase] = useState(1);

  // phase 1: stop the tape
  const [linesRead, setLinesRead] = useState(1);
  const [walked, setWalked] = useState(false);

  // phase 2 + 3: verdicts
  const [offer, setOffer] = useState<string | null>(null);
  const [walk, setWalk] = useState<string | null>(null);
  const [filed, setFiled] = useState(false);

  const hook = HOOK[Math.min(linesRead, 3) - 1];
  const hookColor = hook >= 60 ? T.threatRed : hook >= 30 ? T.actionAmber : T.confirmedGreen;

  const readNext = () => {
    if (linesRead >= 3 || walked) return;
    setLinesRead((n) => n + 1);
    audio.thud(); // each extra line lets the hook set — a dull click of it catching
  };

  const walkAway = () => {
    if (walked) return;
    setWalked(true);
    audio.latch();
  };

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

  /* A single decisive verdict: pick one, read the outcome, advance on correct. */
  const verdict = (
    intro: string,
    sceneMono: string | null,
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
      {sceneMono && (
        <div style={{ margin: "14px 0", background: T.paper, borderRadius: 2, padding: "14px 16px", boxShadow: "0 2px 0 rgba(0,0,0,0.5)" }}>
          <p style={{ margin: 0, fontFamily: MONO, fontSize: 13, lineHeight: 1.6, color: T.fileInk }}>{sceneMono}</p>
        </div>
      )}
      <div style={{ display: "grid", gap: 10, marginTop: sceneMono ? 0 : 14 }}>
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
        <BossIntro
          codename="ZERO"
          taunt="They taught you so much, didn't they. Such a shame to waste it defending. I could make you something. Just one small favor to start…"
        />
      )}

      <PhasePips phase={phase} labels={["HEAR AND WALK", "RIGHT RESPONSE", "TELL AN ADULT"]} />

      {/* ------------------------------------------------ PHASE 1: stop the tape */}
      {phase === 1 && (
        <div style={{ maxWidth: 640 }}>
          <Eyebrow text="Phase 1. The pitch lands one line at a time. Read on, or walk. The sooner you walk, the less he gets." color={T.actionAmber} />

          {/* the recruiter's hook, rising with every line you let land */}
          <div style={{ margin: "14px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", color: T.textSecondary, marginBottom: 6 }}>
              <span>RECRUITER'S HOOK</span>
              <span style={{ color: hookColor, fontWeight: 600 }}>{hook}%</span>
            </div>
            <div style={{ height: 10, background: T.panelRaised, borderRadius: 5, overflow: "hidden", border: `1px solid ${T.hairline}` }}>
              <div style={{ width: `${hook}%`, height: "100%", background: hookColor, transition: reduced ? "none" : "width 500ms ease, background 500ms ease" }} />
            </div>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.06em", color: T.textDisabled, marginTop: 4 }}>
              {hook >= 60 ? "YOU'VE READ THE WHOLE PITCH: TIME TO GO" : hook >= 30 ? "THE PITCH IS DIGGING IN" : "HE HAS ALMOST NOTHING ON YOU"}
            </div>
          </div>

          {/* the DM thread, revealed line by line */}
          <div style={{ display: "grid", gap: 12, margin: "6px 0 4px" }}>
            {PITCH.slice(0, linesRead).map((line, i) => (
              <Bubble key={i} who="villain">
                <em>{line}</em>
              </Bubble>
            ))}
          </div>

          {!walked && (
            <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap", alignItems: "center" }}>
              <AmberButton label="WALK AWAY" onClick={walkAway} />
              {linesRead < 3 && <GhostButton label="READ NEXT LINE" onClick={readNext} />}
            </div>
          )}

          {walked && (
            <div role="status" style={{ marginTop: 16, borderLeft: `2px solid ${T.confirmedGreen}`, paddingLeft: 14 }}>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{WALK_NOTES[Math.min(linesRead, 3) - 1]}</p>
              <div style={{ marginTop: 12 }}>
                <AmberButton
                  label="WALKED CLEAN: WHAT NEXT"
                  onClick={() => {
                    audio.stamp();
                    onPhaseCleared(1);
                    setPhase(2);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* --------------------------------------------- PHASE 2: the right response */}
      {phase === 2 &&
        verdict(
          "Phase 2. He keeps pinging your screen. Name it: what do you owe that offer?",
          null,
          OFFER,
          offer,
          offerChoice,
          pick(setOffer, OFFER, offer),
          "RESPONSE LOCKED: NOW CLOSE IT",
          () => {
            audio.stamp();
            onPhaseCleared(2);
            setPhase(3);
          },
          () => setOffer(null),
        )}

      {/* ------------------------------------------------- PHASE 3: tell an adult */}
      {phase === 3 && !filed &&
        verdict(
          "Phase 3. The offer is dead to you. Now the responsible close: what do you do with it?",
          "INBOX: 1 message · unknown sender · signature: UNRESOLVED · your call decides what ARC gets",
          WALKS,
          walk,
          walkChoice,
          pick(setWalk, WALKS, walk),
          "FILE THE REPORT",
          () => {
            setFiled(true);
            audio.stamp();
            onPhaseCleared(3);
            window.setTimeout(onComplete, reduced ? 250 : 700);
          },
          () => setWalk(null),
        )}

      {phase === 3 && filed && (
        <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.06em", color: T.confirmedGreen, margin: 0 }}>
          FILED: THE COORDINATOR REACHED OUT, AND YOU HANDED ARC THE THREAD. THE CODE, RE-SIGNED.
        </p>
      )}
    </div>
  );
}
