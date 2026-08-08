"use client";

/**
 * Mission 11 incident — "Locksmith's Nightmare".
 *
 * SKELETON KEY returns with the M03 rig against Jake's NEW defenses —
 * and bounces, live. Three DISTINCT interactions, not three menus:
 *   1. WATCH THE RIG  — hold to let the brute-force rig run; the
 *      guesses/sec spins into the millions while the door stays SHUT
 *      (strong unique password + 2FA). Holding proves the attack burns
 *      out against a good lock.
 *   2. REUSED KEYS    — one stolen forum password; tap every one of
 *      Jake's doors that same key still opens (reused + no 2FA). A live
 *      AT RISK tally climbs; unique or 2FA-on doors are safe decoys.
 *   3. THE LAST RESORT — one decisive verdict: SK stops guessing and
 *      starts asking (phishing for the master passphrase). Refuse it.
 */

import { useEffect, useRef, useState } from "react";
import { AmberButton, Eyebrow, GhostButton } from "../engine/primitives";
import { MONO, T } from "../engine/tokens";
import type { IncidentProps } from "../engine/types";
import { BossIntro, PhasePips } from "./BossChrome";

type PhaseProps = { reduced: boolean; audio: IncidentProps["audio"]; onDone: () => void };

/* Phase 2: which of Jake's doors does the ONE stolen key still open?
   at-risk = reused that password AND no second lock; safe = unique key
   OR 2FA standing guard (even on a reused password). */
const KEYS = [
  {
    id: "fanforum",
    label: "Fan art forum · same password as the leak · no 2FA",
    atRisk: true,
    note: "Reused key, no second lock. This door swings open. Flag it.",
  },
  {
    id: "retro",
    label: "Retro games site · reused that same password · no 2FA",
    atRisk: true,
    note: "Same key, same open door. Good flag.",
  },
  {
    id: "stream",
    label: "Streaming account · reused password · 2FA never switched on",
    atRisk: true,
    note: "One more reused door with nothing behind it. At risk.",
  },
  {
    id: "email",
    label: "Email · unique 20-character password · 2FA on",
    atRisk: false,
    note: "The crown jewel, and it was never reused. The stolen key does not fit, and 2FA waits behind it anyway.",
  },
  {
    id: "bank",
    label: "Bank app · unique password · 2FA on",
    atRisk: false,
    note: "Never reused, double locked. This door has never met that key.",
  },
  {
    id: "cloud",
    label: "Cloud photos · reused the leaked password · BUT 2FA is on",
    atRisk: false,
    note: "Reused, yes, but 2FA blocks the stolen key right at the door. Turn 2FA on and even an old mistake holds. Not at risk.",
  },
];
const AT_RISK_TOTAL = KEYS.filter((k) => k.atRisk).length;

/* Phase 3: the last resort. SK phishes for the master passphrase itself
   (M01's lure aimed at the new crown jewel). One decisive verdict. */
const PHISH = [
  {
    id: "enter",
    label: "Enter the master passphrase, the vault says it needs re-checking",
    correct: false,
    outcome:
      "That page is PHANTOM HOOK's oldest lure wearing vault clothing. The master passphrase typed there hands SKELETON KEY all forty doors at once.",
  },
  {
    id: "refuse",
    label: "Refuse: real vaults never email for the master key. Open the app yourself",
    correct: true,
    outcome:
      "Case 1's rule protects Case 11's treasure. Never type anything on a page a message sent you. The real app shows no alert. And notice: the manager refused to autofill on that fake site. Your tools back each other up.",
  },
  {
    id: "half",
    label: "Type just the first half of it, to test if the page is real",
    correct: false,
    outcome:
      "Half a master key is half a disaster. The page records every key you press. Fakes don't get halves. They get nothing.",
  },
];

export default function Mission11Incident({ reduced, audio, onPhaseCleared, onComplete }: IncidentProps) {
  const [phase, setPhase] = useState(1);

  return (
    <div>
      {phase === 1 && (
        <BossIntro
          codename="SKELETON KEY"
          taunt="New locks, little warden? I kept my rig. Let's hear it sing."
        />
      )}

      <PhasePips phase={phase} labels={["WATCH THE RIG", "REUSED KEYS", "THE LAST RESORT"]} />

      {phase === 1 && (
        <WatchRigPhase
          reduced={reduced}
          audio={audio}
          onDone={() => {
            onPhaseCleared(1);
            setPhase(2);
          }}
        />
      )}

      {phase === 2 && (
        <ReusedKeysPhase
          reduced={reduced}
          audio={audio}
          onDone={() => {
            onPhaseCleared(2);
            setPhase(3);
          }}
        />
      )}

      {phase === 3 && (
        <VerdictPhase
          reduced={reduced}
          audio={audio}
          onDone={() => {
            onPhaseCleared(3);
            window.setTimeout(onComplete, reduced ? 250 : 700);
          }}
        />
      )}
    </div>
  );
}

/* --------------------------------------------- phase 1: watch the rig */
/* A hold-gauge as spectacle: the kid presses and HOLDS while the rig's
   guesses/sec spins up fast and the door stays LOCKED. The bar is the
   rig burning itself out; when it fills, the rig gives up. */

function WatchRigPhase({ reduced, audio, onDone }: PhaseProps) {
  const [progress, setProgress] = useState(0);
  const [guesses, setGuesses] = useState(0);
  const [done, setDone] = useState(false);
  const timer = useRef<number | null>(null);

  const stop = () => {
    if (timer.current !== null) {
      window.clearInterval(timer.current);
      timer.current = null;
    }
  };

  useEffect(() => stop, []);

  const finish = () => {
    stop();
    setDone(true);
    audio.latch();
  };

  const start = () => {
    if (done || reduced) return;
    stop();
    timer.current = window.setInterval(() => {
      setProgress((p) => {
        const next = Math.min(100, p + 7);
        if (next >= 100) finish();
        return next;
      });
      setGuesses((g) => g + 1_700_000 + Math.floor(Math.random() * 1_500_000));
    }, 90);
  };

  const runReduced = () => {
    if (done) return;
    setProgress(100);
    setGuesses(41_800_000);
    finish();
  };

  // guesses/sec spins up with the hold, then stalls dead when the door holds
  const gps = done ? 0 : Math.round((progress / 100) * 46_000_000);

  const line = (label: string, value: string, color: string) => (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "3px 0" }}>
      <span style={{ color: T.textSecondary }}>{label}</span>
      <span style={{ color, fontWeight: 600 }}>{value}</span>
    </div>
  );

  return (
    <div style={{ maxWidth: 640 }}>
      <Eyebrow
        text="Phase 1. The rig opens on Jake's game account. Let it run. Watch what a strong, unique password plus 2FA does to it."
        color={T.actionAmber}
      />

      {/* live rig telemetry — the spectacle */}
      <div
        className="sr-card"
        style={{
          margin: "14px 0",
          background: T.panelRaised,
          border: `1px solid ${T.hairline}`,
          borderRadius: 3,
          padding: "14px 16px",
          fontFamily: MONO,
          fontSize: 12.5,
          letterSpacing: "0.04em",
        }}
      >
        {line("RIG TARGET", "GAMEHUB", T.textPrimary)}
        {line("LOCK", "20-CHAR UNIQUE + 2FA", T.textPrimary)}
        {line("GUESSES/SEC", gps.toLocaleString(), T.glowCyan)}
        {line("TOTAL GUESSES", guesses.toLocaleString(), T.arcCyan)}
        {line("DOOR", done ? "LOCKED · RIG STALLED" : "LOCKED", T.confirmedGreen)}
        {line("CRACK ETA", "6 CENTURIES", T.confirmedGreen)}
      </div>

      {!done ? (
        reduced ? (
          <AmberButton label="LET THE RIG RUN" onClick={runReduced} />
        ) : (
          <button
            onPointerDown={start}
            onPointerUp={stop}
            onPointerLeave={stop}
            className="sr-btn sr-scanfill"
            style={{
              fontFamily: MONO,
              fontSize: 13,
              letterSpacing: "0.06em",
              color: T.inkBlack,
              background: T.actionAmber,
              border: "none",
              borderRadius: 3,
              padding: "14px 26px",
              cursor: "pointer",
            }}
          >
            <span className="sr-scanfill-bar" style={{ width: `${progress}%` }} />
            <span style={{ position: "relative" }}>HOLD: LET THE RIG RUN · {progress}%</span>
          </button>
        )
      ) : (
        <div role="status" style={{ borderLeft: `2px solid ${T.confirmedGreen}`, paddingLeft: 14 }}>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>
            Three million guesses. Twenty million. The counter spins, the door doesn't. Projected crack
            time: 6 centuries. The rig is singing to a wall.
          </p>
          <div style={{ marginTop: 12 }}>
            <AmberButton
              label="IT HELD. HERE COMES THE OLD TRICK"
              onClick={() => {
                audio.stamp();
                onDone();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------- phase 2: reused keys hunt */
/* One stolen key. Tap every door it still opens. Live AT RISK tally;
   unique-password or 2FA-on doors thud as safe decoys. */

function ReusedKeysPhase({ audio, onDone }: PhaseProps) {
  const [flagged, setFlagged] = useState<string[]>([]);
  const [note, setNote] = useState<{ text: string; ok: boolean } | null>(null);

  const allFound = flagged.length >= AT_RISK_TOTAL;

  const tap = (k: (typeof KEYS)[number]) => {
    if (allFound) return;
    if (k.atRisk) {
      if (flagged.includes(k.id)) return;
      setFlagged((f) => [...f, k.id]);
      setNote({ text: k.note, ok: true });
      audio.latch();
    } else {
      setNote({ text: k.note, ok: false });
      audio.thud();
    }
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <Eyebrow
        text="Phase 2. SKELETON KEY has ONE stolen password from a forum leak. Tap every door of Jake's that same key still opens."
        color={T.actionAmber}
      />

      <div style={{ margin: "14px 0", background: T.paper, borderRadius: 2, padding: "14px 16px", boxShadow: "0 2px 0 rgba(0,0,0,0.5)" }}>
        <p style={{ margin: 0, fontFamily: MONO, fontSize: 13, lineHeight: 1.6, color: T.fileInk }}>
          STOLEN KEY LOADED: forum password from an old leak · testing it against Jake's other doors…
        </p>
      </div>

      {/* live tally */}
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", color: T.textSecondary, margin: "0 0 10px" }}>
        <span>AT RISK</span>
        <span style={{ color: allFound ? T.confirmedGreen : T.threatRed, fontWeight: 600 }}>
          {flagged.length} of {AT_RISK_TOTAL} REUSED DOORS FOUND
        </span>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {KEYS.map((k) => {
          const hit = flagged.includes(k.id);
          return (
            <button
              key={k.id}
              onClick={() => tap(k)}
              className="sr-btn"
              disabled={hit || allFound}
              style={{
                textAlign: "left",
                fontSize: 13.5,
                lineHeight: 1.55,
                color: hit ? T.threatRed : T.textPrimary,
                background: hit ? `${T.threatRed}14` : T.panelRaised,
                border: `1px solid ${hit ? T.threatRed : T.hairline}`,
                borderRadius: 3,
                padding: "12px 14px",
                cursor: hit || allFound ? "default" : "pointer",
                opacity: allFound && !k.atRisk ? 0.5 : 1,
              }}
            >
              {hit ? "⚑ " : ""}
              {k.label}
            </button>
          );
        })}
      </div>

      {note && !allFound && (
        <p role="status" style={{ margin: "12px 0 0", fontSize: 14, lineHeight: 1.6, color: note.ok ? T.confirmedGreen : T.textSecondary }}>
          {note.text}
        </p>
      )}

      {allFound && (
        <div role="status" style={{ marginTop: 14, borderLeft: `2px solid ${T.confirmedGreen}`, paddingLeft: 14 }}>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>
            Every door that stolen key opens, found. Jake gives each one a brand new unique password and
            switches on 2FA. One leak, forty doors: that is SKELETON KEY's whole trick, and you just shut
            it down.
          </p>
          <div style={{ marginTop: 12 }}>
            <AmberButton
              label="REUSE KILLED. ONE MOVE LEFT"
              onClick={() => {
                audio.stamp();
                onDone();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------- phase 3: the last resort */
/* One decisive verdict. SK stops guessing and starts asking: a phish for
   the master passphrase itself. Refuse it. */

function VerdictPhase({ audio, onDone }: PhaseProps) {
  const [phish, setPhish] = useState<string | null>(null);
  const [sealed, setSealed] = useState(false);

  const choice = PHISH.find((o) => o.id === phish) ?? null;

  const pick = (id: string) => {
    if (phish && PHISH.find((o) => o.id === phish)?.correct) return;
    setPhish(id);
    const o = PHISH.find((x) => x.id === id);
    if (o?.correct) audio.latch();
    else audio.thud();
  };

  if (sealed) {
    return (
      <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.06em", color: T.confirmedGreen, margin: 0 }}>
        RIG RETIRED. FORTY DOORS, ZERO OPENED. THE NIGHTMARE WAS HIS.
      </p>
    );
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <Eyebrow
        text="Phase 3. The last resort. SKELETON KEY stops guessing and starts asking. An email lands."
        color={T.actionAmber}
      />
      <div style={{ margin: "14px 0", background: T.paper, borderRadius: 2, padding: "14px 16px", boxShadow: "0 2px 0 rgba(0,0,0,0.5)" }}>
        <p style={{ margin: 0, fontFamily: MONO, fontSize: 13, lineHeight: 1.6, color: T.fileInk }}>
          “URGENT: your password vault needs re-checking. Enter your master passphrase here within 24
          hours or your vault will be locked.” → vault-verify-center.net
        </p>
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {PHISH.map((o) => {
          const isChosen = phish === o.id;
          const stateColor = o.correct ? T.confirmedGreen : T.threatRed;
          return (
            <button
              key={o.id}
              onClick={() => pick(o.id)}
              className="sr-btn"
              disabled={!!choice?.correct}
              style={{
                textAlign: "left",
                fontSize: 13.5,
                lineHeight: 1.55,
                color: isChosen ? stateColor : T.textPrimary,
                background: isChosen ? `${stateColor}14` : T.panelRaised,
                border: `1px solid ${isChosen ? stateColor : T.hairline}`,
                borderRadius: 3,
                padding: "12px 14px",
                cursor: choice?.correct ? "default" : "pointer",
              }}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      {choice && (
        <div role="status" style={{ marginTop: 14, borderLeft: `2px solid ${choice.correct ? T.confirmedGreen : T.threatRed}`, paddingLeft: 14 }}>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{choice.outcome}</p>
          <div style={{ marginTop: 12 }}>
            {choice.correct ? (
              <AmberButton
                label="VAULT SEALED. RETIRE THE RIG"
                onClick={() => {
                  audio.stamp();
                  setSealed(true);
                  onDone();
                }}
              />
            ) : (
              <GhostButton label="RECONSIDER" onClick={() => setPhish(null)} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
