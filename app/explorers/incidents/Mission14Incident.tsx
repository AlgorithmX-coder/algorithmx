"use client";

/**
 * Mission 14 incident — "Trojan Delivery".
 *
 * Five pending installs on the student's tablet. Triage them like an
 * analyst: flag the dangerous two, handle the horse correctly, then
 * raise the armor. Phases:
 *   1. SORT THE DELIVERIES — flag the 2 bad installs among 5
 *   2. HANDLE THE HORSE — what happens to a trojan you caught?
 *   3. RAISE THE ARMOR — the finishing sweep
 */

import { useState } from "react";
import { AmberButton, Bubble, Eyebrow, GhostButton } from "../engine/primitives";
import { MONO, T } from "../engine/tokens";
import type { IncidentProps } from "../engine/types";

const DELIVERIES = [
  { id: "d1", label: "PIXEL QUEST · official store, needs storage only", bad: false },
  { id: "d2", label: "GameHub_FREE_PREMIUM_installer.zip · from a forum link", bad: true },
  { id: "d3", label: "School app update · from the official store", bad: false },
  { id: "d4", label: "TORCH+ FLASHLIGHT · store app, wants contacts, mic, location", bad: true },
  { id: "d5", label: "Browser security patch · from the system updater", bad: false },
];

const HANDLES = [
  {
    id: "peek",
    label: "Run it in a corner “just to see what it does”",
    correct: false,
    outcome:
      "Running it IS the attack. There's no safe peek on your own tablet. That's why ARC has a sealed range and you don't.",
  },
  {
    id: "delete",
    label: "Delete the zip, report the forum post, warn without forwarding the link",
    correct: true,
    outcome:
      "Textbook. The horse never gets in. The forum post gets reported. Your warning carries no live link.",
  },
  {
    id: "keep",
    label: "Keep it zipped, unopened means harmless, right?",
    correct: false,
    outcome:
      "Unopened means harmless TODAY. Bored future-you opens it one rainy Saturday. That's exactly who GHOSTWRITER wrapped it for. Don't keep a loaded trap.",
  },
];

const ARMORS = [
  {
    id: "updates",
    label: "Run the two real updates now, deny the torch's extra powers, install from the store only",
    correct: true,
    outcome:
      "Armor up: holes plugged, powers trimmed, downloads clean. This tablet just became the toughest target around.",
  },
  {
    id: "wipe",
    label: "Factory-reset the whole tablet to be safe",
    correct: false,
    outcome:
      "Nothing bad ever ran. A full wipe deletes your homework and photos too. That's too big a fix for a problem you already caught.",
  },
  {
    id: "noapps",
    label: "Ban all new apps forever",
    correct: false,
    outcome:
      "Hiding isn't defending. The real skill is reading powers and sources. You just proved you have it. Use it, don't hide.",
  },
];

export default function Mission14Incident({ reduced, audio, onPhaseCleared, onComplete }: IncidentProps) {
  const [phase, setPhase] = useState(1);
  const [flagged, setFlagged] = useState<string[]>([]);
  const [miss, setMiss] = useState<string | null>(null);
  const [handle, setHandle] = useState<string | null>(null);
  const [armor, setArmor] = useState<string | null>(null);
  const [raised, setRaised] = useState(false);

  const badCount = DELIVERIES.filter((d) => d.bad).length;

  const tapDelivery = (d: (typeof DELIVERIES)[number]) => {
    if (flagged.length >= badCount || flagged.includes(d.id)) return;
    if (d.bad) {
      const done = [...flagged, d.id];
      setFlagged(done);
      setMiss(null);
      audio.latch();
      if (done.length === badCount) {
        audio.stamp();
        onPhaseCleared(1);
      }
    } else {
      setMiss(d.id);
      audio.thud();
    }
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

  const handleChoice = HANDLES.find((o) => o.id === handle) ?? null;
  const armorChoice = ARMORS.find((o) => o.id === armor) ?? null;

  return (
    <div>
      {phase === 1 && (
        <div style={{ marginBottom: 18, maxWidth: 560 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: T.threatRed, marginBottom: 8 }}>
            INTERCEPTED · GHOSTWRITER, ON THE WIRE
          </div>
          <Bubble who="villain">
            <em>&ldquo;I don't break into houses, little reader. I write gifts so lovely you carry them in yourselves.&rdquo;</em>
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

      {/* ---------------- phase 1: sort the deliveries ---------------- */}
      {phase === 1 && (
        <div style={{ maxWidth: 640 }}>
          <Eyebrow text="Phase 1: Five installs waiting. Flag the TWO that don't pass the gate." color={T.actionAmber} />
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {DELIVERIES.map((d) => {
              const done = flagged.includes(d.id);
              const missed = miss === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => tapDelivery(d)}
                  className="sr-btn"
                  disabled={done}
                  style={{
                    textAlign: "left",
                    fontFamily: MONO,
                    fontSize: 12.5,
                    lineHeight: 1.5,
                    color: done ? T.confirmedGreen : missed ? T.threatRed : T.fileInk,
                    background: done ? `${T.confirmedGreen}14` : T.paper,
                    border: "none",
                    outline: `2px solid ${done ? T.confirmedGreen : missed ? T.threatRed : "transparent"}`,
                    outlineOffset: -2,
                    borderRadius: 2,
                    padding: "11px 13px",
                    boxShadow: "0 2px 0 rgba(0,0,0,0.5)",
                    cursor: done ? "default" : "pointer",
                  }}
                >
                  {done ? "■ FLAGGED · " : "□ "}
                  {d.label}
                </button>
              );
            })}
          </div>
          <p role="status" style={{ margin: "12px 0 0", fontSize: 13, color: flagged.length === badCount ? T.confirmedGreen : T.textSecondary }}>
            {flagged.length === badCount
              ? "GATE SORTED. The forum zip and the greedy torch stay out. Trusted source and matching powers get through."
              : miss
                ? "That one's clean: official source, powers that match the job. Check sources AND powers."
                : `${flagged.length}/${badCount} flagged. A bad source OR bad powers fails the gate.`}
          </p>
          {flagged.length === badCount && (
            <div style={{ marginTop: 14 }}>
              <AmberButton label="GATE SORTED: HANDLE THE HORSE" onClick={() => { audio.click(); setPhase(2); }} />
            </div>
          )}
        </div>
      )}

      {/* ---------------- phase 2: handle the horse ---------------- */}
      {phase === 2 && (
        <div style={{ maxWidth: 640 }}>
          <Eyebrow text="Phase 2: The zip is sitting in downloads. What happens to a caught trojan?" color={T.actionAmber} />
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {HANDLES.map((h) => {
              const isChosen = handle === h.id;
              const stateColor = h.correct ? T.confirmedGreen : T.threatRed;
              return (
                <button key={h.id} onClick={() => pick(setHandle, HANDLES, handle)(h.id)} className="sr-btn" disabled={!!handle && !!handleChoice?.correct}
                  style={{ textAlign: "left", fontSize: 13.5, lineHeight: 1.55, color: isChosen ? stateColor : T.textPrimary, background: isChosen ? `${stateColor}14` : T.panelRaised, border: `1px solid ${isChosen ? stateColor : T.hairline}`, borderRadius: 3, padding: "12px 14px", cursor: handle && handleChoice?.correct ? "default" : "pointer" }}>
                  {h.label}
                </button>
              );
            })}
          </div>
          {handleChoice && (
            <div role="status" style={{ marginTop: 14, borderLeft: `2px solid ${handleChoice.correct ? T.confirmedGreen : T.threatRed}`, paddingLeft: 14 }}>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{handleChoice.outcome}</p>
              <div style={{ marginTop: 12 }}>
                {handleChoice.correct ? (
                  <AmberButton label="HORSE HANDLED: RAISE THE ARMOR" onClick={() => { audio.stamp(); onPhaseCleared(2); setPhase(3); }} />
                ) : (
                  <GhostButton label="RECONSIDER" onClick={() => setHandle(null)} />
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------- phase 3: raise the armor ---------------- */}
      {phase === 3 && (
        <div style={{ maxWidth: 640 }}>
          <Eyebrow text="Phase 3: The finishing sweep. Leave this tablet harder than you found it." color={T.actionAmber} />
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {ARMORS.map((a) => {
              const isChosen = armor === a.id;
              const stateColor = a.correct ? T.confirmedGreen : T.threatRed;
              return (
                <button key={a.id} onClick={() => pick(setArmor, ARMORS, armor)(a.id)} className="sr-btn" disabled={!!armor && !!armorChoice?.correct}
                  style={{ textAlign: "left", fontSize: 13.5, lineHeight: 1.55, color: isChosen ? stateColor : T.textPrimary, background: isChosen ? `${stateColor}14` : T.panelRaised, border: `1px solid ${isChosen ? stateColor : T.hairline}`, borderRadius: 3, padding: "12px 14px", cursor: armor && armorChoice?.correct ? "default" : "pointer" }}>
                  {a.label}
                </button>
              );
            })}
          </div>
          {armorChoice && (
            <div role="status" style={{ marginTop: 14, borderLeft: `2px solid ${armorChoice.correct ? T.confirmedGreen : T.threatRed}`, paddingLeft: 14 }}>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{armorChoice.outcome}</p>
              <div style={{ marginTop: 12 }}>
                {armorChoice.correct ? (
                  !raised ? (
                    <AmberButton
                      label="ARMOR UP"
                      onClick={() => {
                        setRaised(true);
                        audio.stamp();
                        onPhaseCleared(3);
                        window.setTimeout(onComplete, reduced ? 250 : 700);
                      }}
                    />
                  ) : (
                    <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.06em", color: T.confirmedGreen, margin: 0 }}>
                      ARMORED: PATCHED, TRIMMED, AND STORE-ONLY. THE HORSE NEVER GOT IN.
                    </p>
                  )
                ) : (
                  <GhostButton label="RECONSIDER" onClick={() => setArmor(null)} />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
