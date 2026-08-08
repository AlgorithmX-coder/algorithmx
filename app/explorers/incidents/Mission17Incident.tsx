"use client";

/**
 * Mission 17 incident — "The Rumor Mill".
 *
 * A fake screenshot of Mr. Ortega is ripping through the school
 * chats. Trace it, break it, contain it kindly — forwarding is
 * amplifying (Heroes W5's bystander idea, mechanized). Phases:
 *   1. FIND THE SOURCE — who actually started it?
 *   2. BREAK THE CLAIM — the lateral-reading kill shot
 *   3. STILL THE MILL — the reply that stops it without shame
 */

import { useState } from "react";
import { AmberButton, Bubble, Eyebrow, GhostButton } from "../engine/primitives";
import { MONO, T } from "../engine/tokens";
import type { IncidentProps } from "../engine/types";

/* Phase 1 — candidates for the origin. */
const SOURCES = [
  { id: "s1", label: "LEO: forwarded it to your group first", origin: false },
  { id: "s2", label: "THE YEAR 8 CHAT: it was there an hour earlier", origin: false },
  { id: "s3", label: "@riverdale_confessions: 3-day-old account, posted “LEAKED”, follows nobody", origin: true },
  { id: "s4", label: "MAYA: she reacted with shock seventeen times", origin: false },
];

const BREAKS = [
  {
    id: "zoom",
    label: "Zoom way in on the screenshot to find pixel flaws",
    correct: false,
    outcome:
      "Maybe you find a seam. Next month's fake won't have one. Pixel-hunting is a race you lose. Break the CLAIM, not the image.",
  },
  {
    id: "lateral",
    label: "Lateral read: check the school's real channels and ask Mr. Ortega's actual class",
    correct: true,
    outcome:
      "Second tab, real world. No announcement, no proof. His class was on a trip when the “post” went up. The claim dies outside its own echo.",
  },
  {
    id: "poll",
    label: "Run a poll in the chat: “real or fake?”",
    correct: false,
    outcome:
      "Truth isn't a vote. The poll also re-shows the fake to 40 more kids. Popularity measures spread, not fact.",
  },
];

const STILLS = [
  {
    id: "shame",
    label: "“Everyone who forwarded this is part of the problem. Shame on you.”",
    correct: false,
    outcome:
      "Forwarders weren't villains. They were the mill's delivery service, same as anyone. Shame makes people defend the fake. Kind wins.",
  },
  {
    id: "attach",
    label: "Post the correction WITH the screenshot attached, so everyone sees the fake",
    correct: false,
    outcome:
      "You just showed the fake to everyone who hadn't seen it, with a caption on top. A correction should never carry the fake with it.",
  },
  {
    id: "kind",
    label: "Plain text, no image: “That screenshot is fake, I checked with the school. Please stop forwarding. Not your fault if you already did.” Plus a quiet word to a teacher.",
    correct: true,
    outcome:
      "The mill needs pushes. You just removed forty hands. No fake attached, no shame, an adult in the loop. And Mr. Ortega hears it from the school, not the chat.",
  },
];

export default function Mission17Incident({ reduced, audio, onPhaseCleared, onComplete }: IncidentProps) {
  const [phase, setPhase] = useState(1);
  const [wrongSource, setWrongSource] = useState<string | null>(null);
  const [sourceFound, setSourceFound] = useState(false);
  const [brk, setBrk] = useState<string | null>(null);
  const [still, setStill] = useState<string | null>(null);
  const [stilled, setStilled] = useState(false);

  const tapSource = (s: (typeof SOURCES)[number]) => {
    if (sourceFound) return;
    if (s.origin) {
      setSourceFound(true);
      setWrongSource(null);
      audio.stamp();
      onPhaseCleared(1);
    } else {
      setWrongSource(s.id);
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

  const brkChoice = BREAKS.find((o) => o.id === brk) ?? null;
  const stillChoice = STILLS.find((o) => o.id === still) ?? null;

  return (
    <div>
      {phase === 1 && (
        <div style={{ marginBottom: 18, maxWidth: 560 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: T.threatRed, marginBottom: 8 }}>
            INTERCEPTED: GHOSTWRITER ON THE WIRE
          </div>
          <Bubble who="villain">
            <em>&ldquo;I wrote tomorrow's gossip yesterday, little reader. The mill only needs one push. Your friends do the rest.&rdquo;</em>
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

      {/* ---------------- phase 1: find the source ---------------- */}
      {phase === 1 && (
        <div style={{ maxWidth: 640 }}>
          <Eyebrow text="Phase 1: a fake screenshot of Mr. Ortega is everywhere. Forwarders aren't sources. Find the SOURCE." color={T.actionAmber} />
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {SOURCES.map((s) => (
              <button
                key={s.id}
                onClick={() => tapSource(s)}
                className="sr-btn"
                style={{
                  textAlign: "left",
                  fontFamily: MONO,
                  fontSize: 12.5,
                  lineHeight: 1.5,
                  color: sourceFound && s.origin ? T.confirmedGreen : wrongSource === s.id ? T.threatRed : T.fileInk,
                  background: T.paper,
                  border: "none",
                  outline: `2px solid ${sourceFound && s.origin ? T.confirmedGreen : wrongSource === s.id ? T.threatRed : "transparent"}`,
                  outlineOffset: -2,
                  borderRadius: 2,
                  padding: "12px 14px",
                  boxShadow: "0 2px 0 rgba(0,0,0,0.5)",
                  cursor: sourceFound ? "default" : "pointer",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
          <p role="status" style={{ margin: "12px 0 0", fontSize: 13, color: sourceFound ? T.confirmedGreen : T.textSecondary }}>
            {sourceFound
              ? "SOURCE FOUND. A three-day-old account with one job. Everyone else was just the mill's delivery service."
              : wrongSource
                ? "That's a FORWARDER, a hand on the wheel, not the builder. Trace upstream."
                : "Follow the timestamps upstream. Who posted it FIRST?"}
          </p>
          {sourceFound && (
            <div style={{ marginTop: 14 }}>
              <AmberButton label="SOURCE PINNED: BREAK THE CLAIM" onClick={() => { audio.click(); setPhase(2); }} />
            </div>
          )}
        </div>
      )}

      {/* ---------------- phase 2: break the claim ---------------- */}
      {phase === 2 && (
        <div style={{ maxWidth: 640 }}>
          <Eyebrow text="Phase 2: the screenshot looks perfect. Break the CLAIM, not the pixels." color={T.actionAmber} />
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {BREAKS.map((b) => {
              const isChosen = brk === b.id;
              const stateColor = b.correct ? T.confirmedGreen : T.threatRed;
              return (
                <button key={b.id} onClick={() => pick(setBrk, BREAKS, brk)(b.id)} className="sr-btn" disabled={!!brk && !!brkChoice?.correct}
                  style={{ textAlign: "left", fontSize: 13.5, lineHeight: 1.55, color: isChosen ? stateColor : T.textPrimary, background: isChosen ? `${stateColor}14` : T.panelRaised, border: `1px solid ${isChosen ? stateColor : T.hairline}`, borderRadius: 3, padding: "12px 14px", cursor: brk && brkChoice?.correct ? "default" : "pointer" }}>
                  {b.label}
                </button>
              );
            })}
          </div>
          {brkChoice && (
            <div role="status" style={{ marginTop: 14, borderLeft: `2px solid ${brkChoice.correct ? T.confirmedGreen : T.threatRed}`, paddingLeft: 14 }}>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{brkChoice.outcome}</p>
              <div style={{ marginTop: 12 }}>
                {brkChoice.correct ? (
                  <AmberButton label="CLAIM BROKEN: STILL THE MILL" onClick={() => { audio.stamp(); onPhaseCleared(2); setPhase(3); }} />
                ) : (
                  <GhostButton label="RECONSIDER" onClick={() => setBrk(null)} />
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------- phase 3: still the mill ---------------- */}
      {phase === 3 && (
        <div style={{ maxWidth: 640 }}>
          <Eyebrow text="Phase 3: forty kids are mid-forward. One message stops the mill. Choose it." color={T.actionAmber} />
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {STILLS.map((s) => {
              const isChosen = still === s.id;
              const stateColor = s.correct ? T.confirmedGreen : T.threatRed;
              return (
                <button key={s.id} onClick={() => pick(setStill, STILLS, still)(s.id)} className="sr-btn" disabled={!!still && !!stillChoice?.correct}
                  style={{ textAlign: "left", fontSize: 13.5, lineHeight: 1.55, color: isChosen ? stateColor : T.textPrimary, background: isChosen ? `${stateColor}14` : T.panelRaised, border: `1px solid ${isChosen ? stateColor : T.hairline}`, borderRadius: 3, padding: "12px 14px", cursor: still && stillChoice?.correct ? "default" : "pointer" }}>
                  {s.label}
                </button>
              );
            })}
          </div>
          {stillChoice && (
            <div role="status" style={{ marginTop: 14, borderLeft: `2px solid ${stillChoice.correct ? T.confirmedGreen : T.threatRed}`, paddingLeft: 14 }}>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{stillChoice.outcome}</p>
              <div style={{ marginTop: 12 }}>
                {stillChoice.correct ? (
                  !stilled ? (
                    <AmberButton
                      label="SEND IT"
                      onClick={() => {
                        setStilled(true);
                        audio.stamp();
                        onPhaseCleared(3);
                        window.setTimeout(onComplete, reduced ? 250 : 700);
                      }}
                    />
                  ) : (
                    <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.06em", color: T.confirmedGreen, margin: 0 }}>
                      SENT. THE WHEEL SLOWS, THE STREAM CLEARS. MILLS DIE WITHOUT HANDS.
                    </p>
                  )
                ) : (
                  <GhostButton label="RECONSIDER" onClick={() => setStill(null)} />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
