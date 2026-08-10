"use client";

/**
 * Mission 13 incident — "The Side Door".
 *
 * SKELETON KEY ignores Jake's beautiful vault entirely and goes around it.
 * Three DISTINCT beats, not three menus:
 *   1. READ HIS ROUTE  — FIND-ONE: tap the door he is actually using
 *   2. SLAM THE DOOR   — VERDICT: the one fix that shuts the side door
 *   3. SWEEP THE DEVICES — FIND-ONE: end the one session that is not Jake
 */

import { useState } from "react";
import { AmberButton, Eyebrow, GhostButton } from "../engine/primitives";
import { MONO, T } from "../engine/tokens";
import type { IncidentProps } from "../engine/types";
import { BossIntro, PhasePips } from "./BossChrome";

/* Phase 1: tap the door SK is taking now that the front door is strong. */
const DOORS = [
  {
    id: "front",
    label: "THE FRONT DOOR: the 20-character monster passphrase",
    real: false,
    note: "He's not even looking at it. The rig retired in CASE 011. Attackers don't fight strength, they go around it.",
  },
  {
    id: "side",
    label: "THE SIDE DOOR: “Forgot password?” and three little questions",
    real: true,
    note: "That's his route. The recovery robot asks about pets and schools. Jake's old answers are all TRUE. The crumb file is already open on SK's screen.",
  },
  {
    id: "window",
    label: "THE WINDOW: the 2FA code on Jake's phone",
    real: false,
    note: "Double-locked since CASE 011. He'd need the phone in his hand. Cold. Where does a locksmith go when the locks all hold?",
  },
];

/* Phase 2: one decisive verdict. Only one fix actually slams the door. */
const SLAMS = [
  {
    id: "longer",
    label: "Make the master passphrase even longer",
    correct: false,
    outcome: "He isn't AT that door. Guarding the front while the side hangs open helps no one.",
  },
  {
    id: "harden",
    label: "Swap the true answers for vault-stored nonsense, and send recovery to the 2FA-locked email",
    correct: true,
    outcome: "Slammed. The questions now expect “purple-staircase-42”. The reset email lands behind two locks. The crumb file just became waste paper.",
  },
  {
    id: "delete",
    label: "Delete the recovery options completely",
    correct: false,
    outcome: "Now one forgotten password locks Jake out of his own life forever. Recovery isn't the enemy. GUESSABLE recovery is.",
  },
];

/* Phase 3: the live device list. Three are Jake. One never left. */
const DEVICES = [
  {
    id: "phone",
    label: "Jake's phone",
    meta: "signed in just now",
    rogue: false,
    note: "That's your phone, right here in your hand. A device you use every day. Keep it.",
  },
  {
    id: "laptop",
    label: "Home laptop",
    meta: "signed in today · home",
    rogue: false,
    note: "Your own laptop, signed in from home today. That one is you. Leave it running.",
  },
  {
    id: "tablet",
    label: "Jake's tablet",
    meta: "signed in this week",
    rogue: false,
    note: "Your tablet, the one you read on at night. Not the stranger. Look again.",
  },
  {
    id: "rogue",
    label: "UNKNOWN DESKTOP",
    meta: "‘library-pc-04’ · 3 weeks ago",
    rogue: true,
    note: "Ended. That was the session SK planted from a library computer weeks ago, still open all this time. Report it, then sign out everywhere once so no spare sessions remain. The report gives the platform his fingerprint. No door left ajar.",
  },
];

export default function Mission13Incident({ reduced, audio, onPhaseCleared, onComplete }: IncidentProps) {
  const [phase, setPhase] = useState(1);

  // phase 1: find the door he is using
  const [doorFound, setDoorFound] = useState(false);
  const [doorNote, setDoorNote] = useState<string | null>(null);

  // phase 2: the verdict
  const [slam, setSlam] = useState<string | null>(null);

  // phase 3: end the rogue session
  const [deviceEnded, setDeviceEnded] = useState(false);
  const [deviceNote, setDeviceNote] = useState<string | null>(null);
  const [swept, setSwept] = useState(false);

  const slamChoice = SLAMS.find((o) => o.id === slam) ?? null;

  const tapDoor = (o: (typeof DOORS)[number]) => {
    if (doorFound) return;
    setDoorNote(o.note);
    if (o.real) {
      setDoorFound(true);
      audio.latch();
    } else audio.thud();
  };

  const pickSlam = (id: string) => {
    if (slam && SLAMS.find((o) => o.id === slam)?.correct) return;
    setSlam(id);
    if (SLAMS.find((o) => o.id === id)?.correct) audio.latch();
    else audio.thud();
  };

  const tapDevice = (o: (typeof DEVICES)[number]) => {
    if (deviceEnded) return;
    setDeviceNote(o.note);
    if (o.rogue) {
      setDeviceEnded(true);
      audio.latch();
    } else audio.thud();
  };

  return (
    <div>
      {phase === 1 && (
        <BossIntro
          codename="SKELETON KEY"
          taunt="Beautiful lock, little warden. Truly. I'll just ask the nice recovery robot to let me in instead."
        />
      )}

      <PhasePips phase={phase} labels={["READ HIS ROUTE", "SLAM THE DOOR", "SWEEP THE DEVICES"]} />

      {/* ------------------------------------------- PHASE 1: read his route */}
      {phase === 1 && (
        <div style={{ maxWidth: 640 }}>
          <Eyebrow text="Phase 1. The front door held, so SK went around it. Tap the door he is actually using." color={T.actionAmber} />
          <div style={{ margin: "14px 0", background: T.paper, borderRadius: 2, padding: "14px 16px", boxShadow: "0 2px 0 rgba(0,0,0,0.5)" }}>
            <p style={{ margin: 0, fontFamily: MONO, fontSize: 13, lineHeight: 1.6, color: T.fileInk }}>
              ATTACK LOG: password attack … SKIPPED. 2FA bypass … SKIPPED. next move: loading…
            </p>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {DOORS.map((o) => {
              const isRoute = doorFound && o.real;
              return (
                <button
                  key={o.id}
                  onClick={() => tapDoor(o)}
                  className="sr-btn"
                  disabled={doorFound}
                  style={{ textAlign: "left", fontSize: 13.5, lineHeight: 1.55, color: isRoute ? T.confirmedGreen : T.textPrimary, background: isRoute ? `${T.confirmedGreen}14` : T.panelRaised, border: `1px solid ${isRoute ? T.confirmedGreen : T.hairline}`, borderRadius: 3, padding: "12px 14px", cursor: doorFound ? "default" : "pointer", opacity: doorFound && !o.real ? 0.5 : 1 }}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
          {doorNote && (
            <div role="status" style={{ marginTop: 14, borderLeft: `2px solid ${doorFound ? T.confirmedGreen : T.threatRed}`, paddingLeft: 14 }}>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{doorNote}</p>
              {doorFound && (
                <div style={{ marginTop: 12 }}>
                  <AmberButton
                    label="ROUTE READ: SLAM IT"
                    onClick={() => {
                      audio.stamp();
                      onPhaseCleared(1);
                      setPhase(2);
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------- PHASE 2: slam the door */}
      {phase === 2 && (
        <div style={{ maxWidth: 640 }}>
          <Eyebrow text="Phase 2. He is at the recovery questions now. One fix actually slams this door." color={T.actionAmber} />
          <div style={{ margin: "14px 0", background: T.paper, borderRadius: 2, padding: "14px 16px", boxShadow: "0 2px 0 rgba(0,0,0,0.5)" }}>
            <p style={{ margin: 0, fontFamily: MONO, fontSize: 13, lineHeight: 1.6, color: T.fileInk }}>
              RECOVERY ROBOT: “First pet's name?” … SK types: b-i-s-c-u-i-t…
            </p>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {SLAMS.map((o) => {
              const isChosen = slam === o.id;
              const stateColor = o.correct ? T.confirmedGreen : T.threatRed;
              return (
                <button
                  key={o.id}
                  onClick={() => pickSlam(o.id)}
                  className="sr-btn"
                  disabled={!!slamChoice?.correct}
                  style={{ textAlign: "left", fontSize: 13.5, lineHeight: 1.55, color: isChosen ? stateColor : T.textPrimary, background: isChosen ? `${stateColor}14` : T.panelRaised, border: `1px solid ${isChosen ? stateColor : T.hairline}`, borderRadius: 3, padding: "12px 14px", cursor: slamChoice?.correct ? "default" : "pointer" }}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
          {slamChoice && (
            <div role="status" style={{ marginTop: 14, borderLeft: `2px solid ${slamChoice.correct ? T.confirmedGreen : T.threatRed}`, paddingLeft: 14 }}>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{slamChoice.outcome}</p>
              <div style={{ marginTop: 12 }}>
                {slamChoice.correct ? (
                  <AmberButton
                    label="DOOR SLAMMED: RUN THE SWEEP"
                    onClick={() => {
                      audio.stamp();
                      onPhaseCleared(2);
                      setPhase(3);
                    }}
                  />
                ) : (
                  <GhostButton label="RECONSIDER" onClick={() => setSlam(null)} />
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------ PHASE 3: sweep the devices */}
      {phase === 3 && !swept && (
        <div style={{ maxWidth: 640 }}>
          <Eyebrow text="Phase 3. Last check: the devices signed in to Jake's account. Do not guess. Find the one that is not Jake and tap it to end that session." color={T.actionAmber} />
          <div style={{ margin: "14px 0", background: T.paper, borderRadius: 2, padding: "14px 16px", boxShadow: "0 2px 0 rgba(0,0,0,0.5)" }}>
            <p style={{ margin: 0, fontFamily: MONO, fontSize: 13, lineHeight: 1.6, color: T.fileInk }}>
              ACTIVE SESSIONS: 4 signed in. Three are Jake. One is a stranger who never left.
            </p>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {DEVICES.map((o) => {
              const isRogueFound = deviceEnded && o.rogue;
              return (
                <button
                  key={o.id}
                  onClick={() => tapDevice(o)}
                  className="sr-btn"
                  disabled={deviceEnded}
                  style={{ textAlign: "left", fontSize: 13.5, lineHeight: 1.55, color: isRogueFound ? T.confirmedGreen : T.textPrimary, background: isRogueFound ? `${T.confirmedGreen}14` : T.panelRaised, border: `1px solid ${isRogueFound ? T.confirmedGreen : T.hairline}`, borderRadius: 3, padding: "12px 14px", cursor: deviceEnded ? "default" : "pointer", opacity: deviceEnded && !o.rogue ? 0.5 : 1 }}
                >
                  <span style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                    <span>
                      {isRogueFound ? "⛔ " : ""}
                      {o.label}
                    </span>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: T.textDisabled, whiteSpace: "nowrap" }}>{o.meta}</span>
                  </span>
                </button>
              );
            })}
          </div>
          {deviceNote && (
            <div role="status" style={{ marginTop: 14, borderLeft: `2px solid ${deviceEnded ? T.confirmedGreen : T.threatRed}`, paddingLeft: 14 }}>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{deviceNote}</p>
              {deviceEnded && (
                <div style={{ marginTop: 12 }}>
                  <AmberButton
                    label="SWEEP COMPLETE"
                    onClick={() => {
                      setSwept(true);
                      audio.stamp();
                      onPhaseCleared(3);
                      window.setTimeout(onComplete, reduced ? 250 : 700);
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {phase === 3 && swept && (
        <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.06em", color: T.confirmedGreen, margin: 0 }}>
          EVERY DOOR CLOSED: FRONT, SIDE, AND THE ONE NOBODY REMEMBERED. BUILDING SECURE.
        </p>
      )}
    </div>
  );
}
