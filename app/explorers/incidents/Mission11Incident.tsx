"use client";

/**
 * Mission 11 incident — "Locksmith's Nightmare".
 *
 * SKELETON KEY returns with the M03 rig against Jake's NEW defenses —
 * and bounces, live. The landing page's "watch them hold." Phases:
 *   1. THE RIG SINGS — brute force meets the generated monster
 *   2. THE OLD TRICK — the breach list meets forty unique keys
 *   3. THE LAST RESORT — SK phishes for the master passphrase itself
 *      (M01's lure aimed at the new crown jewel — full synthesis)
 */

import { useState } from "react";
import { AmberButton, Bubble, Eyebrow, GhostButton } from "../engine/primitives";
import { MONO, T } from "../engine/tokens";
import type { IncidentProps } from "../engine/types";

const RIG = [
  {
    id: "watch",
    label: "Let the rig run against the manager's 20-character monster",
    correct: true,
    outcome:
      "Three million guesses. Twenty million. The counter spins, the door doesn't. Projected crack time: 6 centuries. The rig is singing to a wall.",
  },
  {
    id: "unplug",
    label: "Panic and delete Jake's accounts before the rig finishes",
    correct: false,
    outcome:
      "The vault was BUILT for this moment. Deleting everything is surrender dressed as safety. Let your engineering do its job.",
  },
  {
    id: "stronger",
    label: "Quickly change the password mid-attack, just in case",
    correct: false,
    outcome:
      "Mid-panic changes cause typos, lockouts, and weak choices. The monster holds. Trust the build you tested.",
  },
];

const BREACH = [
  {
    id: "why",
    label: "The stolen key opens nothing — every door has a DIFFERENT key now",
    correct: true,
    outcome:
      "Exactly. The forum key fits the forum, and nothing else on earth. SK's favorite move — one leak, forty doors — died on slot two of your build.",
  },
  {
    id: "lucky",
    label: "Jake got lucky — the leaked site didn't matter much",
    correct: false,
    outcome:
      "Luck had nothing to do with it. Look at the build: the generator made every key unique. That CHOICE is what's holding.",
  },
  {
    id: "fast",
    label: "The rig was too slow this time",
    correct: false,
    outcome:
      "The rig didn't even need to guess — it HAD a real stolen key. It failed because the key only fits one door now. Uniqueness, not speed.",
  },
];

const PHISH = [
  {
    id: "enter",
    label: "Enter the master passphrase — the vault says it needs re-verifying",
    correct: false,
    outcome:
      "That page is PHANTOM HOOK's oldest lure wearing vault clothing. The master passphrase typed there hands SK all forty doors at once.",
  },
  {
    id: "refuse",
    label: "Refuse: real vaults never email for the master key — open the app yourself",
    correct: true,
    outcome:
      "M01's rule, protecting M11's treasure: never enter anything on a page a message sent you. The real app shows no alert. And notice — the manager itself refused to autofill on that fake domain. Your tools vouch for each other.",
  },
  {
    id: "half",
    label: "Type just the first half of it, to test if the page is real",
    correct: false,
    outcome:
      "Half a master key is half a disaster — and the page records every keystroke. Fakes don't get halves. They get nothing.",
  },
];

export default function Mission11Incident({ reduced, audio, onPhaseCleared, onComplete }: IncidentProps) {
  const [phase, setPhase] = useState(1);
  const [rig, setRig] = useState<string | null>(null);
  const [breach, setBreach] = useState<string | null>(null);
  const [phish, setPhish] = useState<string | null>(null);
  const [held, setHeld] = useState(false);

  const pick =
    (set: (v: string | null) => void, list: { id: string; correct: boolean }[], cur: string | null) =>
    (id: string) => {
      if (cur && list.find((o) => o.id === cur)?.correct) return;
      set(id);
      const o = list.find((x) => x.id === id);
      if (o?.correct) audio.latch();
      else audio.thud();
    };

  const rigChoice = RIG.find((o) => o.id === rig) ?? null;
  const breachChoice = BREACH.find((o) => o.id === breach) ?? null;
  const phishChoice = PHISH.find((o) => o.id === phish) ?? null;

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
          <p style={{ margin: 0, fontFamily: MONO, fontSize: 13, lineHeight: 1.6, color: T.fileInk }}>{scene}</p>
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
            INTERCEPTED — SKELETON KEY, ON THE WIRE
          </div>
          <Bubble who="villain">
            <em>&ldquo;New locks, little warden? I kept my rig. Let's hear it sing.&rdquo;</em>
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
          "Phase 1 — The rig opens on Jake's game account. Your move, chief engineer.",
          "RIG OUTPUT: guesses/sec: 300 · target: GAMEHUB · password: [20-char generated] · progress: 0 doors",
          RIG,
          rig,
          rigChoice,
          pick(setRig, RIG, rig),
          "IT HELD — HERE COMES THE OLD TRICK",
          () => {
            audio.stamp();
            onPhaseCleared(1);
            setPhase(2);
          },
          () => setRig(null),
        )}

      {phase === 2 &&
        stage(
          "Phase 2 — SK plays his classic: a REAL stolen key from a forum breach. Why does it fail?",
          "BREACH LIST LOADED: forum key [stolen, real] → trying EMAIL … DENIED. GAMEHUB … DENIED. CLOUD … DENIED.",
          BREACH,
          breach,
          breachChoice,
          pick(setBreach, BREACH, breach),
          "CHAIN DEAD — ONE MOVE LEFT",
          () => {
            audio.stamp();
            onPhaseCleared(2);
            setPhase(3);
          },
          () => setBreach(null),
        )}

      {phase === 3 && !held &&
        stage(
          "Phase 3 — The last resort: SK stops guessing and starts ASKING. An email arrives.",
          "“URGENT: your password vault needs re-verification. Enter your master passphrase here within 24 hours or your vault will be locked.” → vault-verify-center.net",
          PHISH,
          phish,
          phishChoice,
          pick(setPhish, PHISH, phish),
          "VAULT SEALED — RETIRE THE RIG",
          () => {
            setHeld(true);
            audio.stamp();
            onPhaseCleared(3);
            window.setTimeout(onComplete, reduced ? 250 : 700);
          },
          () => setPhish(null),
        )}

      {phase === 3 && held && (
        <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.06em", color: T.confirmedGreen, margin: 0 }}>
          RIG RETIRED — FORTY DOORS, ZERO OPENED. THE NIGHTMARE WAS HIS.
        </p>
      )}
    </div>
  );
}
