"use client";

/**
 * Mission 03 incident — "Ten Thousand Doors".
 *
 * SKELETON KEY's rig reaches the school's wall of account doors. The
 * child defends by PRIORITY, not panic — three phases, none repeating
 * the mission's cycle mechanics:
 *   1. SPOT THE WEAK DOOR — read the locks like the rig does; tap the
 *      one that falls first
 *   2. BREAK THE CHAIN — reinforce in triage order (master door first)
 *   3. HOLD THE WALL — choose the replacement key; watch the rig bounce
 */

import { useState } from "react";
import { AmberButton, Bubble, Eyebrow, GhostButton } from "../engine/primitives";
import { MONO, T } from "../engine/tokens";
import type { IncidentProps } from "../engine/types";

/* Phase 1 — five doors, one soft lock. The rig goes pattern-first, so
   name+year falls before anything else on the wall. */
const DOORS = [
  { id: "staff", label: "STAFF PORTAL: 18-character random passphrase", weak: false },
  { id: "email", label: "JAKE'S EMAIL: Jake2014!", weak: true },
  { id: "blog", label: "CLASS BLOG: biscuit-orbit-window-9", weak: false },
  { id: "wiki", label: "SCIENCE WIKI: kV7#mQz9&xw", weak: false },
  { id: "library", label: "LIBRARY: six random words, unique", weak: false },
];

/* Phase 2 — reinforce in triage order. Email is the master door; the
   reused pair shares the leaked key; the game account rounds it out.
   The staff portal is a distractor that's already strong. */
const CHAIN: { id: string; label: string; order?: number; strong?: boolean }[] = [
  { id: "email", label: "JAKE'S EMAIL: resets every other account", order: 1 },
  { id: "school", label: "SCHOOL ACCOUNT: same key as the leaked forum", order: 2 },
  { id: "game", label: "GAMEHUB: same key as the leaked forum", order: 3 },
  { id: "staff", label: "STAFF PORTAL: already strong", strong: true },
];

const CHAIN_HINTS: Record<number, string> = {
  1: "Master door first. Which account can reset all the others?",
  2: "Now the leaked key. Two doors still share it. Take the school one next.",
  3: "One door still uses the stolen key. Close the chain.",
};

/* Phase 3 — pick the key that holds. */
const KEYS = [
  {
    id: "swap",
    label: "P@ssw0rd!2026",
    correct: false,
    outcome: "Letter-swaps are ON the rig's list. It looks armored. It's cardboard.",
  },
  {
    id: "year",
    label: "Jake2015!",
    correct: false,
    outcome: "That's last year's password plus one. The rig literally tries that next.",
  },
  {
    id: "phrase",
    label: "thunder-biscuit-ladder-52, wait, no biscuit. thunder-marble-ladder-52",
    correct: true,
    outcome:
      "Good catch on the dog's name: nothing about you in it. Long, random, brand new. Seal it.",
  },
  {
    id: "qwerty",
    label: "qwerty123456",
    correct: false,
    outcome: "Keyboard rows are guess number one. The rig opens this before you finish typing it.",
  },
];

export default function Mission03Incident({ reduced, audio, onPhaseCleared, onComplete }: IncidentProps) {
  const [phase, setPhase] = useState(1);
  const [wrongDoor, setWrongDoor] = useState<string | null>(null);
  const [weakFound, setWeakFound] = useState(false);
  const [reinforced, setReinforced] = useState<string[]>([]);
  const [chainMiss, setChainMiss] = useState<string | null>(null);
  const [key, setKey] = useState<string | null>(null);
  const [sealed, setSealed] = useState(false);

  const tapDoor = (d: (typeof DOORS)[number]) => {
    if (weakFound) return;
    if (d.weak) {
      setWeakFound(true);
      setWrongDoor(null);
      audio.stamp();
      onPhaseCleared(1);
    } else {
      setWrongDoor(d.id);
      audio.thud();
    }
  };

  const nextChainStep = reinforced.length + 1;

  const tapChain = (c: (typeof CHAIN)[number]) => {
    if (reinforced.length >= 3) return;
    if (c.order === nextChainStep) {
      const done = [...reinforced, c.id];
      setReinforced(done);
      setChainMiss(null);
      audio.latch();
      if (done.length === 3) {
        audio.stamp();
        onPhaseCleared(2);
      }
    } else {
      setChainMiss(c.id);
      audio.thud();
    }
  };

  const chooseKey = (id: string) => {
    if (key && KEYS.find((k) => k.id === key)?.correct) return;
    setKey(id);
    const k = KEYS.find((x) => x.id === id);
    if (k?.correct) audio.latch();
    else audio.thud();
  };

  const keyChoice = KEYS.find((k) => k.id === key) ?? null;

  return (
    <div>
      {phase === 1 && (
        <div style={{ marginBottom: 18, maxWidth: 560 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: T.threatRed, marginBottom: 8 }}>
            INTERCEPTED: SKELETON KEY, ON THE WIRE
          </div>
          <Bubble who="villain">
            <em>&ldquo;Ten thousand doors, little warden. I only need one lazy lock. The rig has all night.&rdquo;</em>
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

      {/* ---------------- phase 1: spot the weak door ---------------- */}
      {phase === 1 && (
        <div style={{ maxWidth: 640 }}>
          <Eyebrow text="Phase 1. The wall: five doors, five locks. Think like the rig. Tap the door that falls FIRST." color={T.actionAmber} />
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {DOORS.map((d) => (
              <button
                key={d.id}
                onClick={() => tapDoor(d)}
                className="sr-btn"
                style={{
                  textAlign: "left",
                  fontFamily: MONO,
                  fontSize: 12.5,
                  lineHeight: 1.5,
                  color: weakFound && d.weak ? T.confirmedGreen : wrongDoor === d.id ? T.threatRed : T.fileInk,
                  background: T.paper,
                  border: "none",
                  outline: `2px solid ${weakFound && d.weak ? T.confirmedGreen : wrongDoor === d.id ? T.threatRed : "transparent"}`,
                  outlineOffset: -2,
                  borderRadius: 2,
                  padding: "12px 14px",
                  boxShadow: "0 2px 0 rgba(0,0,0,0.5)",
                  cursor: weakFound ? "default" : "pointer",
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
          <p role="status" style={{ margin: "12px 0 0", fontSize: 13, color: weakFound ? T.confirmedGreen : T.textSecondary }}>
            {weakFound
              ? "WEAK DOOR FLAGGED: name plus year. The rig's very first guess family."
              : wrongDoor
                ? "That lock holds for now. The rig goes pattern-first: names, years, pets."
                : "The rig tries the most common patterns first. Which lock is a pattern?"}
          </p>
          {weakFound && (
            <div style={{ marginTop: 14 }}>
              <AmberButton label="DOOR FLAGGED: REINFORCE" onClick={() => { audio.click(); setPhase(2); }} />
            </div>
          )}
        </div>
      )}

      {/* ---------------- phase 2: break the chain ---------------- */}
      {phase === 2 && (
        <div style={{ maxWidth: 640 }}>
          <Eyebrow text="Phase 2. Triage: the forum key is loose and the rig is moving. Reinforce doors in the RIGHT ORDER." color={T.actionAmber} />
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {CHAIN.map((c) => {
              const done = reinforced.includes(c.id);
              const missed = chainMiss === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => tapChain(c)}
                  className="sr-btn"
                  disabled={done}
                  style={{
                    textAlign: "left",
                    fontFamily: MONO,
                    fontSize: 12.5,
                    lineHeight: 1.5,
                    color: done ? T.confirmedGreen : missed ? T.threatRed : T.textPrimary,
                    background: done ? `${T.confirmedGreen}14` : T.panelRaised,
                    border: `1px solid ${done ? T.confirmedGreen : missed ? T.threatRed : T.hairline}`,
                    borderRadius: 3,
                    padding: "12px 14px",
                    cursor: done ? "default" : "pointer",
                  }}
                >
                  {done ? `■ ${reinforced.indexOf(c.id) + 1}. ` : "□ "}
                  {c.label}
                </button>
              );
            })}
          </div>
          <p role="status" style={{ margin: "12px 0 0", fontSize: 13, color: reinforced.length === 3 ? T.confirmedGreen : T.textSecondary }}>
            {reinforced.length === 3
              ? "CHAIN BROKEN: master door, then the leaked pair. Textbook triage."
              : chainMiss === "staff"
                ? "Already holds. Spend your minutes on the soft locks."
                : chainMiss
                  ? CHAIN_HINTS[nextChainStep]
                  : CHAIN_HINTS[nextChainStep]}
          </p>
          {reinforced.length === 3 && (
            <div style={{ marginTop: 14 }}>
              <AmberButton label="CHAIN BROKEN: BUILD THE WALL" onClick={() => { audio.click(); setPhase(3); }} />
            </div>
          )}
        </div>
      )}

      {/* ---------------- phase 3: hold the wall ---------------- */}
      {phase === 3 && (
        <div style={{ maxWidth: 640 }}>
          <Eyebrow text="Phase 3. The new key: Jake needs a replacement the rig can't touch. Choose it." color={T.actionAmber} />
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {KEYS.map((k) => {
              const isChosen = key === k.id;
              const stateColor = k.correct ? T.confirmedGreen : T.threatRed;
              return (
                <button
                  key={k.id}
                  onClick={() => chooseKey(k.id)}
                  className="sr-btn"
                  disabled={!!key && !!keyChoice?.correct}
                  style={{ textAlign: "left", fontFamily: MONO, fontSize: 13, lineHeight: 1.5, color: isChosen ? stateColor : T.textPrimary, background: isChosen ? `${stateColor}14` : T.panelRaised, border: `1px solid ${isChosen ? stateColor : T.hairline}`, borderRadius: 3, padding: "12px 14px", cursor: key && keyChoice?.correct ? "default" : "pointer" }}
                >
                  {k.label}
                </button>
              );
            })}
          </div>
          {keyChoice && (
            <div role="status" style={{ marginTop: 14, borderLeft: `2px solid ${keyChoice.correct ? T.confirmedGreen : T.threatRed}`, paddingLeft: 14 }}>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{keyChoice.outcome}</p>
              <div style={{ marginTop: 12 }}>
                {keyChoice.correct ? (
                  !sealed ? (
                    <AmberButton
                      label="SEAL THE DOOR"
                      onClick={() => {
                        setSealed(true);
                        audio.stamp();
                        onPhaseCleared(3);
                        window.setTimeout(onComplete, reduced ? 250 : 700);
                      }}
                    />
                  ) : (
                    <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.06em", color: T.confirmedGreen, margin: 0 }}>
                      SEALED. RIG STALLED. PROJECTED CRACK TIME: 400 YEARS.
                    </p>
                  )
                ) : (
                  <GhostButton label="RECONSIDER" onClick={() => setKey(null)} />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
