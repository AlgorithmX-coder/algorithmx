"use client";

/**
 * Mission 12 incident — "The Intercept".
 *
 * PACKRAT is sniffing the coffee-shop Wi-Fi. Get the messages home
 * sealed. Phases:
 *   1. THE SNIFFER — see the traffic like PACKRAT does: tap every
 *      line he can actually READ
 *   2. SEAL THE CHANNEL — choose the fix that seals the journey
 *   3. THE GIBBERISH PRIZE — what did the nest actually collect?
 */

import { useState } from "react";
import { AmberButton, Bubble, Eyebrow, GhostButton } from "../engine/primitives";
import { MONO, T } from "../engine/tokens";
import type { IncidentProps } from "../engine/types";

/* Phase 1 — the sniffer's view. Readable = unsealed lines. */
const TRAFFIC = [
  { id: "t1", label: "Maya's quiz answers → quiz site — NO padlock", readable: true },
  { id: "t2", label: "Jake's banking app — end-to-end sealed", readable: false },
  { id: "t3", label: "Group chat login → old forum — NO padlock", readable: true },
  { id: "t4", label: "School portal homework — padlock showing", readable: false },
  { id: "t5", label: "Leo's photo upload → sketchy sticker site — NO padlock", readable: true },
];

const SEALS = [
  {
    id: "warn",
    label: "Warn everyone off the unsealed sites — switch those logins to sealed pages or phone data",
    correct: true,
    outcome:
      "Sealed. The three postcards leave the room as envelopes: padlocked pages for the quiz and forum, phone data for the upload. PACKRAT's feed goes quiet mid-sentence.",
  },
  {
    id: "router",
    label: "Unplug the café's router",
    correct: false,
    outcome:
      "The whole café loses Wi-Fi, PACKRAT reconnects when it returns, and now everyone's staring at you. Seal the traffic, not the room.",
  },
  {
    id: "confront",
    label: "Walk over to the suspicious laptop and confront whoever's sniffing",
    correct: false,
    outcome:
      "Sniffers are invisible — that laptop's probably just someone's homework. The fix is technical, not theatrical: seal the journeys.",
  },
];

const PRIZES = [
  {
    id: "everything",
    label: "Everything — he was on the network the whole time",
    correct: false,
    outcome:
      "Being on the road isn't the same as reading the mail. Check what each message looked like as it passed him.",
  },
  {
    id: "gibberish",
    label: "Three postcards from before the fix — and pure gibberish after",
    correct: true,
    outcome:
      "Exactly. The unsealed minutes cost three postcards — real lesson, real cost. But every sealed message crossed his claws as noise. Math beat the nest.",
  },
  {
    id: "nothing",
    label: "Nothing at all — sniffing never works",
    correct: false,
    outcome:
      "He got the early postcards — that's why the fix mattered. Honest ledger: sealing protects from NOW on. It can't unsend the past.",
  },
];

export default function Mission12Incident({ reduced, audio, onPhaseCleared, onComplete }: IncidentProps) {
  const [phase, setPhase] = useState(1);
  const [found, setFound] = useState<string[]>([]);
  const [miss, setMiss] = useState<string | null>(null);
  const [seal, setSeal] = useState<string | null>(null);
  const [prize, setPrize] = useState<string | null>(null);
  const [closed, setClosed] = useState(false);

  const readableCount = TRAFFIC.filter((t) => t.readable).length;

  const tapTraffic = (t: (typeof TRAFFIC)[number]) => {
    if (found.length >= readableCount || found.includes(t.id)) return;
    if (t.readable) {
      const done = [...found, t.id];
      setFound(done);
      setMiss(null);
      audio.latch();
      if (done.length === readableCount) {
        audio.stamp();
        onPhaseCleared(1);
      }
    } else {
      setMiss(t.id);
      audio.thud();
    }
  };

  const chooseSeal = (id: string) => {
    if (seal && SEALS.find((s) => s.id === seal)?.correct) return;
    setSeal(id);
    const s = SEALS.find((x) => x.id === id);
    if (s?.correct) audio.latch();
    else audio.thud();
  };

  const choosePrize = (id: string) => {
    if (prize && PRIZES.find((p) => p.id === prize)?.correct) return;
    setPrize(id);
    const p = PRIZES.find((x) => x.id === id);
    if (p?.correct) audio.latch();
    else audio.thud();
  };

  const sealChoice = SEALS.find((s) => s.id === seal) ?? null;
  const prizeChoice = PRIZES.find((p) => p.id === prize) ?? null;

  return (
    <div>
      {phase === 1 && (
        <div style={{ marginBottom: 18, maxWidth: 560 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: T.threatRed, marginBottom: 8 }}>
            INTERCEPTED — PACKRAT, ON THE WIRE
          </div>
          <Bubble who="villain">
            <em>&ldquo;A whole café of postcards, little archivist. Read me your secrets — oh. You already are.&rdquo;</em>
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

      {/* ---------------- phase 1: the sniffer ---------------- */}
      {phase === 1 && (
        <div style={{ maxWidth: 640 }}>
          <Eyebrow text="Phase 1 — PACKRAT's view of the café. Tap every line he can actually READ." color={T.actionAmber} />
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {TRAFFIC.map((t) => {
              const done = found.includes(t.id);
              const missed = miss === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => tapTraffic(t)}
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
                  {done ? "■ READABLE · " : "□ "}
                  {t.label}
                </button>
              );
            })}
          </div>
          <p role="status" style={{ margin: "12px 0 0", fontSize: 13, color: found.length === readableCount ? T.confirmedGreen : T.textSecondary }}>
            {found.length === readableCount
              ? "SNIFFER MAPPED — three postcards in the air. The sealed two cross his claws as gibberish."
              : miss
                ? "That one's sealed — padlock or end-to-end. He sees noise. Find the POSTCARDS."
                : `${found.length}/${readableCount} readable lines flagged. No padlock = postcard.`}
          </p>
          {found.length === readableCount && (
            <div style={{ marginTop: 14 }}>
              <AmberButton label="POSTCARDS FOUND — SEAL THE CHANNEL" onClick={() => { audio.click(); setPhase(2); }} />
            </div>
          )}
        </div>
      )}

      {/* ---------------- phase 2: seal the channel ---------------- */}
      {phase === 2 && (
        <div style={{ maxWidth: 640 }}>
          <Eyebrow text="Phase 2 — Three postcards are still flowing. Pick the fix that seals them." color={T.actionAmber} />
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {SEALS.map((s) => {
              const isChosen = seal === s.id;
              const stateColor = s.correct ? T.confirmedGreen : T.threatRed;
              return (
                <button key={s.id} onClick={() => chooseSeal(s.id)} className="sr-btn" disabled={!!seal && !!sealChoice?.correct}
                  style={{ textAlign: "left", fontSize: 13.5, lineHeight: 1.55, color: isChosen ? stateColor : T.textPrimary, background: isChosen ? `${stateColor}14` : T.panelRaised, border: `1px solid ${isChosen ? stateColor : T.hairline}`, borderRadius: 3, padding: "12px 14px", cursor: seal && sealChoice?.correct ? "default" : "pointer" }}>
                  {s.label}
                </button>
              );
            })}
          </div>
          {sealChoice && (
            <div role="status" style={{ marginTop: 14, borderLeft: `2px solid ${sealChoice.correct ? T.confirmedGreen : T.threatRed}`, paddingLeft: 14 }}>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{sealChoice.outcome}</p>
              <div style={{ marginTop: 12 }}>
                {sealChoice.correct ? (
                  <AmberButton label="CHANNELS SEALED — CHECK THE NEST" onClick={() => { audio.stamp(); onPhaseCleared(2); setPhase(3); }} />
                ) : (
                  <GhostButton label="RECONSIDER" onClick={() => setSeal(null)} />
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------- phase 3: the gibberish prize ---------------- */}
      {phase === 3 && (
        <div style={{ maxWidth: 640 }}>
          <Eyebrow text="Phase 3 — The honest ledger: what did PACKRAT's nest actually collect tonight?" color={T.actionAmber} />
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {PRIZES.map((p) => {
              const isChosen = prize === p.id;
              const stateColor = p.correct ? T.confirmedGreen : T.threatRed;
              return (
                <button key={p.id} onClick={() => choosePrize(p.id)} className="sr-btn" disabled={!!prize && !!prizeChoice?.correct}
                  style={{ textAlign: "left", fontSize: 13.5, lineHeight: 1.55, color: isChosen ? stateColor : T.textPrimary, background: isChosen ? `${stateColor}14` : T.panelRaised, border: `1px solid ${isChosen ? stateColor : T.hairline}`, borderRadius: 3, padding: "12px 14px", cursor: prize && prizeChoice?.correct ? "default" : "pointer" }}>
                  {p.label}
                </button>
              );
            })}
          </div>
          {prizeChoice && (
            <div role="status" style={{ marginTop: 14, borderLeft: `2px solid ${prizeChoice.correct ? T.confirmedGreen : T.threatRed}`, paddingLeft: 14 }}>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{prizeChoice.outcome}</p>
              <div style={{ marginTop: 12 }}>
                {prizeChoice.correct ? (
                  !closed ? (
                    <AmberButton
                      label="CLOSE THE CASE"
                      onClick={() => {
                        setClosed(true);
                        audio.stamp();
                        onPhaseCleared(3);
                        window.setTimeout(onComplete, reduced ? 250 : 700);
                      }}
                    />
                  ) : (
                    <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.06em", color: T.confirmedGreen, margin: 0 }}>
                      NEST AUDITED — GIBBERISH FROM HERE ON. MATH BEATS PATIENCE.
                    </p>
                  )
                ) : (
                  <GhostButton label="RECONSIDER" onClick={() => setPrize(null)} />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
