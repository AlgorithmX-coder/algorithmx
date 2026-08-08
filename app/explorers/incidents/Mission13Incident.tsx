"use client";

/**
 * Mission 13 incident — "The Side Door".
 *
 * SKELETON KEY ignores Jake's beautiful vault entirely and heads for
 * the recovery path. Slam it. Phases:
 *   1. THE IGNORED DOOR — read his route: which door is he taking?
 *   2. SLAM THE SIDE DOOR — pick the fix that actually blocks it
 *   3. THE DEVICE SWEEP — an unknown session from last month surfaces
 */

import { useState } from "react";
import { AmberButton, Bubble, Eyebrow, GhostButton } from "../engine/primitives";
import { MONO, T } from "../engine/tokens";
import type { IncidentProps } from "../engine/types";

const DOORS = [
  {
    id: "front",
    label: "THE FRONT DOOR: the 20-character monster passphrase",
    correct: false,
    outcome:
      "He's not even looking at it. The rig retired in CASE 011. Attackers don't fight strength, they go around it.",
  },
  {
    id: "side",
    label: "THE SIDE DOOR: “Forgot password?” and three little questions",
    correct: true,
    outcome:
      "That's his route. The recovery robot asks about pets and schools. Jake's old answers are all TRUE. The crumb file is already open on SK's screen.",
  },
  {
    id: "window",
    label: "THE WINDOW: the 2FA code on Jake's phone",
    correct: false,
    outcome:
      "Double-locked since CASE 011. He'd need the phone in his hand. Cold. Where does a locksmith go when the locks all hold?",
  },
];

const SLAMS = [
  {
    id: "longer",
    label: "Make the master passphrase even longer",
    correct: false,
    outcome:
      "He isn't AT that door. Guarding the front while the side hangs open helps no one.",
  },
  {
    id: "harden",
    label: "Swap the true answers for vault-stored nonsense, and send recovery to the 2FA-locked email",
    correct: true,
    outcome:
      "Slammed. The questions now expect “purple-staircase-42”. The reset email lands behind two locks. The crumb file just became waste paper.",
  },
  {
    id: "delete",
    label: "Delete the recovery options completely",
    correct: false,
    outcome:
      "Now one forgotten password locks Jake out of his own life forever. Recovery isn't the enemy. GUESSABLE recovery is.",
  },
];

const SWEEPS = [
  {
    id: "ignore",
    label: "It's probably an old school computer, leave it",
    correct: false,
    outcome:
      "“Probably” is not a check. An unknown session is an open door, maybe with someone inside. Check, don't hope.",
  },
  {
    id: "all",
    label: "Sign out ALL devices, change the master passphrase, report the strange session",
    correct: true,
    outcome:
      "Full sweep. Every session dies. That includes the one SK planted from the library computer weeks ago. The report gives the platform his fingerprint.",
  },
  {
    id: "one",
    label: "Remove just the unknown device and move on",
    correct: false,
    outcome:
      "If he had one session, assume he made spares. Half a sweep leaves half a door. Sign out everything, everywhere, once.",
  },
];

export default function Mission13Incident({ reduced, audio, onPhaseCleared, onComplete }: IncidentProps) {
  const [phase, setPhase] = useState(1);
  const [door, setDoor] = useState<string | null>(null);
  const [slam, setSlam] = useState<string | null>(null);
  const [sweep, setSweep] = useState<string | null>(null);
  const [swept, setSwept] = useState(false);

  const pick =
    (set: (v: string | null) => void, list: { id: string; correct: boolean }[], cur: string | null) =>
    (id: string) => {
      if (cur && list.find((o) => o.id === cur)?.correct) return;
      set(id);
      const o = list.find((x) => x.id === id);
      if (o?.correct) audio.latch();
      else audio.thud();
    };

  const doorChoice = DOORS.find((o) => o.id === door) ?? null;
  const slamChoice = SLAMS.find((o) => o.id === slam) ?? null;
  const sweepChoice = SWEEPS.find((o) => o.id === sweep) ?? null;

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
            INTERCEPTED: SKELETON KEY, ON THE WIRE
          </div>
          <Bubble who="villain">
            <em>&ldquo;Beautiful lock, little warden. Truly. I'll just ask the nice recovery robot to let me in instead.&rdquo;</em>
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
          "Phase 1: SK is moving on Jake's account. Which door is he heading for?",
          "ATTACK LOG: password attack … SKIPPED. 2FA bypass … SKIPPED. next move: loading…",
          DOORS,
          door,
          doorChoice,
          pick(setDoor, DOORS, door),
          "ROUTE READ: SLAM IT",
          () => {
            audio.stamp();
            onPhaseCleared(1);
            setPhase(2);
          },
          () => setDoor(null),
        )}

      {phase === 2 &&
        stage(
          "Phase 2: He's at the recovery questions NOW. Pick the slam.",
          "RECOVERY ROBOT: “First pet's name?” … SK types: b-i-s-c-u-i-t…",
          SLAMS,
          slam,
          slamChoice,
          pick(setSlam, SLAMS, slam),
          "DOOR SLAMMED: RUN THE SWEEP",
          () => {
            audio.stamp();
            onPhaseCleared(2);
            setPhase(3);
          },
          () => setSlam(null),
        )}

      {phase === 3 && !swept &&
        stage(
          "Phase 3: Final check on the logged-in devices list. One entry is wrong.",
          "DEVICES: Jake's phone (now) · home laptop (today) · UNKNOWN DESKTOP · 'library-pc-04', 3 weeks ago",
          SWEEPS,
          sweep,
          sweepChoice,
          pick(setSweep, SWEEPS, sweep),
          "SWEEP COMPLETE",
          () => {
            setSwept(true);
            audio.stamp();
            onPhaseCleared(3);
            window.setTimeout(onComplete, reduced ? 250 : 700);
          },
          () => setSweep(null),
        )}

      {phase === 3 && swept && (
        <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.06em", color: T.confirmedGreen, margin: 0 }}>
          EVERY DOOR CLOSED: FRONT, SIDE, AND THE ONE NOBODY REMEMBERED. BUILDING SECURE.
        </p>
      )}
    </div>
  );
}
