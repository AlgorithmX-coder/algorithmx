"use client";

/**
 * Mission 20 incident — "Signal Zero" (the capstone finale).
 *
 * The coordinator runs the full discipline at the operative, solo.
 * Phases:
 *   1. THE LAST FLOOD — every actor's trick at once; pick the one
 *      response that covers them all (defense-in-depth as reflex)
 *   2. THE UNMASKING — the coordinator revealed: an ex-ARC analyst
 *   3. THE HANDOFF — end it clean, by the rules; ULTRA earned
 *
 * ARC chrome never corrupts, even here (locked). No new mechanics.
 */

import { useState } from "react";
import { AmberButton, Bubble, Eyebrow, GhostButton } from "../engine/primitives";
import { MONO, T } from "../engine/tokens";
import type { IncidentProps } from "../engine/types";

const FLOODS = [
  {
    id: "onebyone",
    label: "Answer each trick one at a time as it arrives",
    correct: false,
    outcome:
      "Six tricks at once will outrun one-at-a-time forever. You don't out-click a coordinator — you stand behind layers that were already up.",
  },
  {
    id: "layers",
    label: "Trust the system you built: trained eyes, the vault, 2FA, out-of-band, the code word — all already on",
    correct: true,
    outcome:
      "The whole course, standing as one wall. The lure hits trained eyes. The mirror hits the vault. The clone hits the code word. Nothing lands. You built this over twenty cases — tonight it just holds.",
  },
  {
    id: "offline",
    label: "Panic and pull the plug on everything",
    correct: false,
    outcome:
      "Going dark is surrender, and it teaches nothing. Your defenses were designed for exactly this night. Let them work.",
  },
];

const UNMASKS = [
  {
    id: "genius",
    label: "A criminal mastermind from nowhere",
    correct: false,
    outcome:
      "Look at the badge in the file. This isn't a stranger — the access, the ARC methods, the insider routing. Who knew all this?",
  },
  {
    id: "exarc",
    label: "An ex-ARC analyst — someone who had this exact training and chose the other path",
    correct: true,
    outcome:
      "There it is. The coordinator was an operative once, cleared like you, taught like you — and chose to aim it all at people. Every skill you have, they had. The only difference was the choice. That's why the Code was the whole course.",
  },
  {
    id: "robot",
    label: "Just an AI running by itself",
    correct: false,
    outcome:
      "The recruitment message had a person's ego in it — “better than them”, “you'd fit”. Machines don't get jealous of ARC. A person did this.",
  },
];

const HANDOFFS = [
  {
    id: "confront",
    label: "Message them one last time: “I beat you.”",
    correct: false,
    outcome:
      "The last word isn't the win. Tipping them off is the loss. Analysts stay quiet and let the evidence speak in the right room.",
  },
  {
    id: "clean",
    label: "Seal the dossier, hand it to ARC's adults and the platform, and let the proper channels act",
    correct: true,
    outcome:
      "Mastery. Every receipt, filed. The people whose job this is take it from here — and the coordinator is ended by the rules they threw away. You never became them. That is the whole victory.",
  },
  {
    id: "keep",
    label: "Keep hunting them yourself, forever",
    correct: false,
    outcome:
      "A good analyst knows where their job ends. You see, you document, you hand off. Carrying it alone forever is how analysts burn out — and how they drift.",
  },
];

export default function Mission20Incident({ reduced, audio, onPhaseCleared, onComplete }: IncidentProps) {
  const [phase, setPhase] = useState(1);
  const [flood, setFlood] = useState<string | null>(null);
  const [unmask, setUnmask] = useState<string | null>(null);
  const [handoff, setHandoff] = useState<string | null>(null);
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

  const floodChoice = FLOODS.find((o) => o.id === flood) ?? null;
  const unmaskChoice = UNMASKS.find((o) => o.id === unmask) ?? null;
  const handoffChoice = HANDOFFS.find((o) => o.id === handoff) ?? null;

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
          <p style={{ margin: 0, fontFamily: MONO, fontSize: 13, lineHeight: 1.65, color: T.fileInk }}>{scene}</p>
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
            INTERCEPTED — K-STATIC, THE COORDINATOR
          </div>
          <Bubble who="villain">
            <em>&ldquo;You're the best they ever trained, Operative. I know — I was, once. Come now. One last favor, and all of this stops.&rdquo;</em>
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
          "Phase 1 — Every trick in the tier, all at once, aimed at you alone. How do you hold?",
          "INCOMING (simultaneous): lure · mirror site · cloned call · borrowed-face DM · fake installer · a “tiny favor”.",
          FLOODS,
          flood,
          floodChoice,
          pick(setFlood, FLOODS, flood),
          "LINE HELD — TRACE THE SOURCE",
          () => {
            audio.stamp();
            onPhaseCleared(1);
            setPhase(2);
          },
          () => setFlood(null),
        )}

      {phase === 2 &&
        stage(
          "Phase 2 — The trace resolves. The dossier board lights up one final node. Who is the coordinator?",
          "IDENTITY RESOLVED: former ARC clearance ✓ · insider routing knowledge ✓ · trained on the same methods you were ✓ · status: went dark 4 years ago.",
          UNMASKS,
          unmask,
          unmaskChoice,
          pick(setUnmask, UNMASKS, unmask),
          "UNMASKED — MAKE THE HANDOFF",
          () => {
            audio.stamp();
            onPhaseCleared(2);
            setPhase(3);
          },
          () => setUnmask(null),
        )}

      {phase === 3 && !done &&
        stage(
          "Phase 3 — Everything is proven. WREN: “Your call, Operative. How does this end?”",
          null,
          HANDOFFS,
          handoff,
          handoffChoice,
          pick(setHandoff, HANDOFFS, handoff),
          "CASE CLOSED — SIGN OFF",
          () => {
            setDone(true);
            audio.stamp();
            onPhaseCleared(3);
            window.setTimeout(onComplete, reduced ? 300 : 1000);
          },
          () => setHandoff(null),
        )}

      {phase === 3 && done && (
        <div role="status" style={{ borderLeft: `2px solid ${T.confirmedGreen}`, paddingLeft: 14 }}>
          <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.06em", color: T.confirmedGreen, margin: 0 }}>
            SIGNAL ZERO SILENCED — SIX ACTORS AND ONE COORDINATOR, HANDED OVER CLEAN.
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: T.textPrimary, margin: "10px 0 0" }}>
            You started at CASE 001 as a trainee. You finish as ULTRA — the analyst who beat the whole network without ever becoming it. The dossier wall is complete. The card reprints with a new name on it: <strong>yours</strong>.
          </p>
        </div>
      )}
    </div>
  );
}
