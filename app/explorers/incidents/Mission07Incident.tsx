"use client";

/**
 * Mission 07 incident — "Two Best Friends".
 *
 * Two chats claim to be Leo. Both use his real name, photo, and
 * typing style — one is his second (backup) account, one is MIMIC
 * wearing him. Reading cannot settle it; the protocol can. Phases:
 *   1. READ THE TWINS — accept that reading isn't enough
 *   2. RUN THE PROTOCOL — choose the true out-of-band check
 *   3. THE RESCUE — help the real Leo take his face back, cleanly
 */

import { useState } from "react";
import { AmberButton, Bubble, Eyebrow, GhostButton } from "../engine/primitives";
import { MONO, T } from "../engine/tokens";
import type { IncidentProps } from "../engine/types";

const READS = [
  {
    id: "left",
    label: "CHAT A is really Leo, it sounds exactly like him",
    correct: false,
    outcome:
      "It DOES sound like him. MIMIC read two years of Leo's messages before typing one. Sounding right is the whole trick.",
  },
  {
    id: "right",
    label: "CHAT B is really Leo, the emoji use matches",
    correct: false,
    outcome:
      "MIMIC copies emoji habits first. They're the easiest thing to fake. Style is a costume. You can't read your way out of this.",
  },
  {
    id: "neither",
    label: "Reading can't settle this, we need a different channel",
    correct: true,
    outcome:
      "Correct call. Both chats look right. That's exactly what a good mimic does. Time for protocol, not a hunch.",
  },
];

const PROTOCOLS = [
  {
    id: "inchat",
    label: "Ask both chats a secret question only Leo knows",
    correct: false,
    outcome:
      "MIMIC holds Leo's full chat history. Two years of secrets to look up. You'd be quizzing someone with the answer sheet open.",
  },
  {
    id: "call",
    label: "Video-call Leo's real number: a channel neither chat holds",
    correct: true,
    outcome:
      "Out-of-band. Leo answers from the bus, face and voice. He's confused: his main account logged him out an hour ago. CHAT A is MIMIC. Confirmed in twenty seconds.",
  },
  {
    id: "wait",
    label: "Wait and see which chat gives up first",
    correct: false,
    outcome:
      "While you wait, MIMIC is running the same trick on five classmates. Slow isn't safe here. Out-of-band is fast AND sure.",
  },
];

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
  const [read, setRead] = useState<string | null>(null);
  const [proto, setProto] = useState<string | null>(null);
  const [rescue, setRescue] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const pick =
    (set: (v: string | null) => void, list: { id: string; correct: boolean }[], cur: string | null) =>
    (id: string) => {
      if (cur && list.find((o) => o.id === cur)?.correct) return;
      set(id);
      const o = list.find((x) => x.id === id);
      if (o?.correct) audio.latch();
      else audio.thud();
    };

  const readChoice = READS.find((o) => o.id === read) ?? null;
  const protoChoice = PROTOCOLS.find((o) => o.id === proto) ?? null;
  const rescueChoice = RESCUES.find((o) => o.id === rescue) ?? null;

  const stageBlock = (
    intro: string,
    list: { id: string; label: string; correct: boolean; outcome: string }[],
    chosen: string | null,
    choiceObj: { correct: boolean; outcome: string } | null,
    onPick: (id: string) => void,
    advanceLabel: string,
    onAdvance: () => void,
  ) => (
    <div style={{ maxWidth: 640 }}>
      <Eyebrow text={intro} color={T.actionAmber} />
      <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
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
              <GhostButton
                label="RECONSIDER"
                onClick={() => {
                  if (phase === 1) setRead(null);
                  else if (phase === 2) setProto(null);
                  else setRescue(null);
                }}
              />
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
            INTERCEPTED: MIMIC, ON THE WIRE
          </div>
          <Bubble who="villain">
            <em>&ldquo;Which of us is your friend, darling? Even his mother couldn't tell. I've worn better faces than his.&rdquo;</em>
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

      {/* the twin chats, visible through every phase */}
      <div className="sr-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16, maxWidth: 640 }}>
        {[
          { tag: "CHAT A: “Leo ⚡”", lines: ["yo it's me, phone died so I'm on my old account", "listen I need a quick favor 🙏", "there's a code coming to your phone, send it over?"] },
          { tag: "CHAT B: “Leo ⚡”", lines: ["hey it's my backup account, main one's being weird", "wait did someone else message you as me??", "DON'T send anyone anything, I'm at school, find me"] },
        ].map((c) => (
          <div key={c.tag} style={{ background: T.paper, borderRadius: 2, padding: "12px 14px", boxShadow: "0 2px 0 rgba(0,0,0,0.5)" }}>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", color: "#A66A00", marginBottom: 8 }}>{c.tag}</div>
            {c.lines.map((l) => (
              <p key={l} style={{ margin: "0 0 6px", fontSize: 12.5, lineHeight: 1.5, color: T.fileInk }}>{l}</p>
            ))}
          </div>
        ))}
      </div>

      {phase === 1 &&
        stageBlock(
          "Phase 1: Two Leos. Same face, same style. Which is real?",
          READS,
          read,
          readChoice,
          pick(setRead, READS, read),
          "READING WON'T CUT IT: RUN PROTOCOL",
          () => {
            audio.stamp();
            onPhaseCleared(1);
            setPhase(2);
          },
        )}

      {phase === 2 &&
        stageBlock(
          "Phase 2: Pick the check that neither chat can fake.",
          PROTOCOLS,
          proto,
          protoChoice,
          pick(setProto, PROTOCOLS, proto),
          "HIJACK CONFIRMED: RESCUE LEO",
          () => {
            audio.stamp();
            onPhaseCleared(2);
            setPhase(3);
          },
        )}

      {phase === 3 && !done &&
        stageBlock(
          "Phase 3: CHAT A is MIMIC, mid-trick on half the class. Finish this cleanly.",
          RESCUES,
          rescue,
          rescueChoice,
          pick(setRescue, RESCUES, rescue),
          "RETURN THE FACE",
          () => {
            setDone(true);
            audio.stamp();
            onPhaseCleared(3);
            window.setTimeout(onComplete, reduced ? 250 : 700);
          },
        )}

      {phase === 3 && done && (
        <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.06em", color: T.confirmedGreen, margin: 0 }}>
          FACE RETURNED: ACCOUNT RECOVERED. MIMIC EXITS WEARING NOBODY.
        </p>
      )}
    </div>
  );
}
