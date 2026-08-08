"use client";

/**
 * Mission 07 incident — "Two Best Friends".
 *
 * Two chats claim to be Leo. Both use his real name, photo, and typing
 * style — one is his second (backup) account, one is MIMIC wearing him.
 * Reading cannot settle it; the protocol can. Three DISTINCT beats, no
 * repeated menu:
 *   1. READ THE TWINS — verdict grid: mark each line a TELL or STYLE, and
 *      learn that even a correct read only buys suspicion, never proof
 *   2. RUN PROTOCOL   — order the out-of-band check: freeze, verify off-app,
 *      then act (wrong order thuds)
 *   3. THE RESCUE     — one decisive call to hand Leo his face back, cleanly
 */

import { useState } from "react";
import { AmberButton, Eyebrow, GhostButton } from "../engine/primitives";
import { MONO, T } from "../engine/tokens";
import type { IncidentProps } from "../engine/types";
import { BossIntro, PhasePips } from "./BossChrome";

type Verdict = "TELL" | "STYLE";

interface ChatLine {
  id: string;
  from: string;
  text: string;
  truth: Verdict;
  why: string;
}

/* Phase 1 — the twin chats, line by line. A TELL is a clue someone is
   working you (an ask, a code grab, an explain-away excuse). STYLE is
   just Leo's voice, which anyone can copy. Tells land in BOTH chats and
   both nail his voice: that is why reading alone can never name the faker. */
const LINES: ChatLine[] = [
  {
    id: "code",
    from: "CHAT A · Leo ⚡",
    text: "there's a code coming to your phone, send it over?",
    truth: "TELL",
    why: "A code grab. The real Leo never needs the login code from YOUR phone. That is the whole trick, not a habit.",
  },
  {
    id: "pretext",
    from: "CHAT A · Leo ⚡",
    text: "phone died so I'm on my old account",
    truth: "TELL",
    why: "An excuse that explains away a strange account before you can ask about it. Mimics hand you the reason first.",
  },
  {
    id: "greeting",
    from: "CHAT A · Leo ⚡",
    text: "yo it's me!! 🙏 ⚡",
    truth: "STYLE",
    why: "Pure Leo voice. A mimic studies his slang and emoji and copies them first. Voice can't prove who is typing.",
  },
  {
    id: "backup",
    from: "CHAT B · Leo ⚡",
    text: "it's my backup account, main one's being weird",
    truth: "TELL",
    why: "Same shape as the other chat's excuse. BOTH accounts explain themselves. A tell warns you, it can't name the faker.",
  },
  {
    id: "banter",
    from: "CHAT B · Leo ⚡",
    text: "haha you still owe me a snack btw ⚡",
    truth: "STYLE",
    why: "No ask, no pressure, just Leo being Leo. And his voice lands on BOTH sides. That is exactly the trap.",
  },
];

/* Phase 2 — the out-of-band protocol, in order. Freeze first, verify on a
   channel neither chat controls, then act. The in-chat quiz is a distractor:
   MIMIC holds Leo's whole history and would just look the answer up. */
const STEPS: { id: string; label: string; order?: number; decoy?: boolean }[] = [
  { id: "freeze", label: "Stop replying. Send nothing to EITHER chat yet.", order: 1 },
  { id: "verify", label: "Go off-app: video-call Leo's real number, a channel neither chat controls.", order: 2 },
  { id: "confirm", label: "Act only once the real Leo answers and confirms.", order: 3 },
  { id: "quiz", label: "Ask both chats a secret question only the real Leo would know.", decoy: true },
];

const STEP_HINTS: Record<number, string> = {
  1: "Step one: freeze. Don't hand anything to either account until you know who is who.",
  2: "Now go out-of-band: a channel neither chat can control. His real number, face and voice.",
  3: "Last step: act only after the real Leo confirms. Then you help him, not the mimic.",
};

/* Phase 3 — the rescue call. One decisive verdict. */
const RESCUES = [
  {
    id: "blast",
    label: "Screenshot the fake chat and blast it to every group: “LEO IS HACKED!!”",
    correct: false,
    outcome:
      "Your screenshot carries MIMIC's live link into every group chat in school. Sharing the bait just spreads the bait.",
  },
  {
    id: "clean",
    label: "Tell Leo out-of-band; he reports the theft; you warn friends with plain text, no links",
    correct: true,
    outcome:
      "Textbook. Leo starts account recovery. The app gets the report. The warning that goes out has no live bait in it. Face returned to owner.",
  },
  {
    id: "duel",
    label: "Message MIMIC: “I know it's you. Give the account back.”",
    correct: false,
    outcome:
      "Now MIMIC knows he's spotted. He'll move fast, hitting everyone in Leo's list within the hour. Never tip off a thief mid-theft.",
  },
];

export default function Mission07Incident({ reduced, audio, onPhaseCleared, onComplete }: IncidentProps) {
  const [phase, setPhase] = useState(1);

  // phase 1: read the twins (verdict grid)
  const [verdicts, setVerdicts] = useState<Record<string, Verdict | undefined>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const correctCount = LINES.filter((l) => verdicts[l.id] === l.truth).length;
  const allMarked = correctCount === LINES.length;

  // phase 2: run the protocol (order)
  const [ordered, setOrdered] = useState<string[]>([]);
  const [stepMiss, setStepMiss] = useState<string | null>(null);
  const nextStep = ordered.length + 1;
  const protocolRun = ordered.length === 3;

  // phase 3: the rescue (single verdict)
  const [rescue, setRescue] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const rescueChoice = RESCUES.find((o) => o.id === rescue) ?? null;

  const mark = (l: ChatLine, v: Verdict) => {
    if (verdicts[l.id] === l.truth) return; // correct rows lock
    setVerdicts((s) => ({ ...s, [l.id]: v }));
    if (v === l.truth) {
      audio.latch();
      setNotes((n) => ({ ...n, [l.id]: l.why }));
    } else {
      audio.thud();
      setNotes((n) => ({
        ...n,
        [l.id]: "Not quite. Judge the ask, not the voice: is this a move on you, or just how Leo talks?",
      }));
    }
  };

  const tapStep = (s: (typeof STEPS)[number]) => {
    if (protocolRun) return;
    if (s.order === nextStep) {
      setOrdered((o) => [...o, s.id]);
      setStepMiss(null);
      audio.latch();
    } else {
      setStepMiss(s.id);
      audio.thud();
    }
  };

  const pickRescue = (id: string) => {
    if (rescue && RESCUES.find((o) => o.id === rescue)?.correct) return;
    setRescue(id);
    if (RESCUES.find((o) => o.id === id)?.correct) audio.latch();
    else audio.thud();
  };

  return (
    <div>
      {phase === 1 && (
        <BossIntro
          codename="MIMIC"
          taunt="Which of us is your friend, darling? Even his mother couldn't tell. I've worn better faces than his."
        />
      )}

      <PhasePips phase={phase} labels={["READ THE TWINS", "RUN PROTOCOL", "THE RESCUE"]} />

      {/* ------------------------------------------ PHASE 1: read the twins */}
      {phase === 1 && (
        <div style={{ maxWidth: 640 }}>
          <Eyebrow
            text="Phase 1. Both chats sound like Leo. Mark each line: TELL (a clue someone is working you) or STYLE (just how Leo talks)."
            color={T.actionAmber}
          />
          <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
            {LINES.map((l) => {
              const v = verdicts[l.id];
              const settled = v === l.truth;
              return (
                <div
                  key={l.id}
                  style={{
                    background: T.paper,
                    color: T.fileInk,
                    borderRadius: 2,
                    padding: "14px 16px",
                    boxShadow: "0 2px 0 rgba(0,0,0,0.55)",
                    border: settled ? `1px solid ${T.confirmedGreen}` : "1px solid transparent",
                  }}
                >
                  <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", color: "#A66A00", marginBottom: 6 }}>
                    {l.from}
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.5, margin: "0 0 10px" }}>{l.text}</p>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    {(["TELL", "STYLE"] as Verdict[]).map((opt) => {
                      const chosen = v === opt;
                      const chosenColor = opt === l.truth ? T.confirmedGreen : T.threatRed;
                      return (
                        <button
                          key={opt}
                          onClick={() => mark(l, opt)}
                          className="sr-btn"
                          disabled={settled}
                          style={{
                            fontFamily: MONO,
                            fontSize: 11,
                            letterSpacing: "0.08em",
                            padding: "6px 14px",
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
                    {notes[l.id] && (
                      <span
                        role="status"
                        style={{ fontSize: 12.5, lineHeight: 1.5, color: settled ? "#1F7A4D" : "#8A2E2E", flex: 1, minWidth: 220 }}
                      >
                        {notes[l.id]}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 16 }}>
            <span style={{ fontFamily: MONO, fontSize: 12, color: allMarked ? T.confirmedGreen : T.textSecondary }}>
              {correctCount}/{LINES.length} MARKED CORRECTLY
            </span>
            {allMarked && (
              <div role="status" style={{ marginTop: 12, borderLeft: `2px solid ${T.confirmedGreen}`, paddingLeft: 14 }}>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>
                  Sorted. But look: tells showed up in BOTH chats, and both nail his voice. Reading gets you suspicion, never
                  proof. You need a channel neither chat controls.
                </p>
                <div style={{ marginTop: 12 }}>
                  <AmberButton
                    label="READING WON'T SETTLE IT: RUN PROTOCOL"
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
        </div>
      )}

      {/* ------------------------------------------- PHASE 2: run protocol */}
      {phase === 2 && (
        <div style={{ maxWidth: 640 }}>
          <Eyebrow
            text="Phase 2. Reading is out. Run the check neither chat can fake. Tap the steps in the RIGHT ORDER."
            color={T.actionAmber}
          />
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {STEPS.map((s) => {
              const doneStep = ordered.includes(s.id);
              const missed = stepMiss === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => tapStep(s)}
                  className="sr-btn"
                  disabled={doneStep}
                  style={{
                    textAlign: "left",
                    fontFamily: MONO,
                    fontSize: 12.5,
                    lineHeight: 1.5,
                    color: doneStep ? T.confirmedGreen : missed ? T.threatRed : T.textPrimary,
                    background: doneStep ? `${T.confirmedGreen}14` : T.panelRaised,
                    border: `1px solid ${doneStep ? T.confirmedGreen : missed ? T.threatRed : T.hairline}`,
                    borderRadius: 3,
                    padding: "12px 14px",
                    cursor: doneStep ? "default" : "pointer",
                  }}
                >
                  {doneStep ? `■ ${ordered.indexOf(s.id) + 1}. ` : "□ "}
                  {s.label}
                </button>
              );
            })}
          </div>
          <p role="status" style={{ margin: "12px 0 0", fontSize: 13, color: protocolRun ? T.confirmedGreen : T.textSecondary }}>
            {protocolRun
              ? "PROTOCOL RUN: freeze, verify off-app, then act. That is out-of-band done right."
              : stepMiss === "quiz"
                ? "MIMIC holds Leo's whole chat history. He'd look the answer up. Never quiz a thief with the answer sheet open."
                : STEP_HINTS[nextStep]}
          </p>
          {protocolRun && (
            <div style={{ marginTop: 14 }}>
              <AmberButton
                label="HIJACK CONFIRMED: RESCUE LEO"
                onClick={() => {
                  audio.stamp();
                  onPhaseCleared(2);
                  setPhase(3);
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* --------------------------------------------- PHASE 3: the rescue */}
      {phase === 3 && !done && (
        <div style={{ maxWidth: 640 }}>
          <Eyebrow
            text="Phase 3. CHAT A is MIMIC, mid-trick on half the class. Make the rescue call."
            color={T.actionAmber}
          />
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {RESCUES.map((o) => {
              const isChosen = rescue === o.id;
              const stateColor = o.correct ? T.confirmedGreen : T.threatRed;
              return (
                <button
                  key={o.id}
                  onClick={() => pickRescue(o.id)}
                  className="sr-btn"
                  disabled={!!rescueChoice?.correct}
                  style={{
                    textAlign: "left",
                    fontSize: 13.5,
                    lineHeight: 1.55,
                    color: isChosen ? stateColor : T.textPrimary,
                    background: isChosen ? `${stateColor}14` : T.panelRaised,
                    border: `1px solid ${isChosen ? stateColor : T.hairline}`,
                    borderRadius: 3,
                    padding: "12px 14px",
                    cursor: rescueChoice?.correct ? "default" : "pointer",
                  }}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
          {rescueChoice && (
            <div role="status" style={{ marginTop: 14, borderLeft: `2px solid ${rescueChoice.correct ? T.confirmedGreen : T.threatRed}`, paddingLeft: 14 }}>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{rescueChoice.outcome}</p>
              <div style={{ marginTop: 12 }}>
                {rescueChoice.correct ? (
                  <AmberButton
                    label="RETURN THE FACE"
                    onClick={() => {
                      setDone(true);
                      audio.stamp();
                      onPhaseCleared(3);
                      window.setTimeout(onComplete, reduced ? 250 : 700);
                    }}
                  />
                ) : (
                  <GhostButton label="RECONSIDER" onClick={() => setRescue(null)} />
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {phase === 3 && done && (
        <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.06em", color: T.confirmedGreen, margin: 0 }}>
          FACE RETURNED: ACCOUNT RECOVERED. MIMIC EXITS WEARING NOBODY.
        </p>
      )}
    </div>
  );
}
