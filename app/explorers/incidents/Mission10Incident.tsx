"use client";

/**
 * Mission 10 incident — "Caller ID" (Block 2 finale).
 *
 * An urgent call arrives in a voice the operative loves. Run the
 * protocol calmly under real pressure. Three DISTINCT beats, not three
 * menus:
 *   1. HOLD THE LINE   — press and hold to stay calm while the clone pushes
 *   2. THE WOBBLE      — one verdict: the tell that proves it is a clone
 *   3. THE SUPPLY CHAIN — flag the 3 real players behind the call
 */

import { useRef, useState } from "react";
import { AmberButton, Eyebrow, GhostButton } from "../engine/primitives";
import { MONO, T } from "../engine/tokens";
import type { IncidentProps } from "../engine/types";
import { BossIntro, PhasePips } from "./BossChrome";

/* Phase 2: one verdict — the tell that proves the caller is a clone. */
const TELLS = [
  {
    id: "knows",
    label: "It knew my nickname, so it has to be mum",
    correct: false,
    outcome:
      "The clone trained on years of family videos. It knows nicknames, birthdays, the lot. Knowing stuff proves nothing. Watch what it DOES, not what it knows.",
  },
  {
    id: "dodge",
    label: "Mum would just answer the code word. This voice dodged it and pushed harder",
    correct: true,
    outcome:
      "That is the tell. Real mum says the code word, or laughs and asks why you are being weird. Only a clone needs you to skip the one check it cannot pass. So you hang up, call her REAL number, and she answers from work, totally fine.",
  },
  {
    id: "crackle",
    label: "The line crackled once, so it is probably just a bad signal",
    correct: false,
    outcome:
      "A dodgy signal is not a tell. Perfect voice or bad line, you still ask the code word. The dodge is the proof, not the crackle.",
  },
];

/* Phase 3: flag the 3 real players; two decoys explain themselves and clear nothing. */
const CHAIN = [
  {
    id: "packrat",
    label: "PACKRAT scraped the family videos for voice clips",
    real: true,
    note: "Sixty seconds of birthday video, harvested. That is the training audio. PACKRAT's crumb.",
  },
  {
    id: "ghost",
    label: "GHOSTWRITER wrote the pressure script the voice read out",
    real: true,
    note: "‘No time, just read the code’ is a written line, reused on a hundred kids. GHOSTWRITER's pen.",
  },
  {
    id: "mimic",
    label: "MIMIC cloned the voice and dialed the call",
    real: true,
    note: "The voice, and the call itself. MIMIC's mask, live on the wire.",
  },
  {
    id: "confused",
    label: "It really was mum, just a bit confused",
    real: false,
    note: "Real mum was at work, phone on silent, in a meeting. Whoever called knew the exact minute she would be unreachable. That is not confusion, that is planning.",
  },
  {
    id: "prank",
    label: "A classmate's prank with a voice app",
    real: false,
    note: "A prank does not know your bank, mum's schedule, and your number. This took planning and money. That points higher up the chain.",
  },
];

export default function Mission10Incident({ reduced, audio, onPhaseCleared, onComplete }: IncidentProps) {
  const [phase, setPhase] = useState(1);

  return (
    <div>
      {phase === 1 && (
        <BossIntro
          codename="MIMIC"
          taunt="I don't need her phone, little operative. I have her VOICE. Sixty seconds of birthday videos was plenty."
        />
      )}

      <PhasePips phase={phase} labels={["HOLD THE LINE", "THE WOBBLE", "THE SUPPLY CHAIN"]} />

      {phase === 1 && (
        <HoldPhase
          reduced={reduced}
          audio={audio}
          onDone={() => {
            onPhaseCleared(1);
            setPhase(2);
          }}
        />
      )}

      {phase === 2 && (
        <WobblePhase
          audio={audio}
          onDone={() => {
            onPhaseCleared(2);
            setPhase(3);
          }}
        />
      )}

      {phase === 3 && (
        <ChainPhase
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

/* -------------------------------------------------- phase 1: hold the line */
/* The cloned voice pressures you to send a code fast. Press and HOLD to stay
   calm and ask the code word; the bar fills only while you keep holding.
   Let go early and it resets — the pressure won that round. */

function HoldPhase({ reduced, audio, onDone }: { reduced: boolean; audio: IncidentProps["audio"]; onDone: () => void }) {
  const [composure, setComposure] = useState(0);
  const [held, setHeld] = useState(false);
  const [slipped, setSlipped] = useState(false);
  const timer = useRef<number | null>(null);

  const stop = () => {
    if (timer.current !== null) {
      window.clearInterval(timer.current);
      timer.current = null;
    }
  };

  const finish = () => {
    stop();
    if (!held) {
      setHeld(true);
      setComposure(100);
      audio.latch();
    }
  };

  const start = () => {
    if (held || reduced) return;
    stop();
    setSlipped(false);
    timer.current = window.setInterval(() => {
      setComposure((c) => {
        const next = Math.min(100, c + 5);
        if (next >= 100) finish();
        return next;
      });
    }, 90);
  };

  const release = () => {
    if (held) return;
    stop();
    if (composure > 0) {
      audio.thud();
      setSlipped(true);
    }
    setComposure(0);
  };

  // the clone escalates as you hold, then cracks — playful, never scary
  const pressureLine =
    composure < 30
      ? "“Quickly, love, there's no time, just read it out!”"
      : composure < 70
        ? "“Why are you being so difficult? Read. The. Code.”"
        : "“…fine. FINE. Ask your silly code word then.”";

  return (
    <div style={{ maxWidth: 640 }}>
      <Eyebrow text="Phase 1. The voice sounds exactly like mum, and it wants a code right now." color={T.actionAmber} />

      {/* the incoming call — captured evidence */}
      <div style={{ margin: "14px 0", background: T.paper, borderRadius: 2, padding: "14px 16px", boxShadow: "0 2px 0 rgba(0,0,0,0.5)" }}>
        <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: "#A66A00", marginBottom: 6 }}>
          INCOMING CALL · “MUM” · VOICE MATCH 100%
        </div>
        <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: T.fileInk }}>
          {held ? "“…” The line goes quiet. One beat too long." : pressureLine}
        </p>
      </div>

      {!held && (
        <>
          {/* the pressure pushing back — high and pulsing while the clone talks */}
          <div style={{ margin: "0 0 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", color: T.textSecondary, marginBottom: 6 }}>
              <span>CALLER PRESSURE</span>
              <span style={{ color: T.threatRed, fontWeight: 600 }}>HIGH</span>
            </div>
            <div style={{ height: 8, background: T.panelRaised, borderRadius: 4, overflow: "hidden", border: `1px solid ${T.hairline}` }}>
              <div className={reduced ? undefined : "sr-seg-live"} style={{ width: "88%", height: "100%", background: T.threatRed }} />
            </div>
          </div>

          {reduced ? (
            <AmberButton label="STAY CALM · ASK THE CODE WORD" onClick={finish} />
          ) : (
            <button
              onPointerDown={start}
              onPointerUp={release}
              onPointerLeave={release}
              className="sr-btn sr-scanfill"
              style={{
                fontFamily: MONO,
                fontSize: 13,
                letterSpacing: "0.06em",
                color: T.inkBlack,
                background: T.actionAmber,
                border: "none",
                borderRadius: 3,
                padding: "16px 26px",
                cursor: "pointer",
                width: "100%",
                maxWidth: 420,
                textAlign: "left",
              }}
            >
              <span className="sr-scanfill-bar" style={{ width: `${composure}%` }} />
              <span style={{ position: "relative" }}>HOLD: STAY CALM, ASK THE CODE WORD · {composure}%</span>
            </button>
          )}

          {slipped && (
            <p role="status" style={{ margin: "12px 0 0", fontSize: 13.5, lineHeight: 1.55, color: T.textSecondary }}>
              You let go and the pressure won that round. Take a breath, press, and hold until you get your answer.
            </p>
          )}
        </>
      )}

      {held && (
        <div role="status" style={{ marginTop: 4, borderLeft: `2px solid ${T.confirmedGreen}`, paddingLeft: 14 }}>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>
            You held the line and asked the code word. Real mum answers in a heartbeat, or laughs at you for asking. That silence IS your answer.
          </p>
          <div style={{ marginTop: 12 }}>
            <AmberButton
              label="COMPOSURE HELD: THE WOBBLE"
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

/* ----------------------------------------------------- phase 2: the wobble */
/* One decisive verdict: spot the tell that proves the caller is a clone. */

function WobblePhase({ audio, onDone }: { audio: IncidentProps["audio"]; onDone: () => void }) {
  const [chosen, setChosen] = useState<string | null>(null);
  const choice = TELLS.find((o) => o.id === chosen) ?? null;

  const pick = (id: string) => {
    if (choice?.correct) return;
    setChosen(id);
    if (TELLS.find((o) => o.id === id)?.correct) audio.latch();
    else audio.thud();
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <Eyebrow text="Phase 2. The wobble. One thing the caller just did proves it is a clone, not mum. Call it." color={T.actionAmber} />

      <div style={{ margin: "14px 0", background: T.paper, borderRadius: 2, padding: "14px 16px", boxShadow: "0 2px 0 rgba(0,0,0,0.5)" }}>
        <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: T.fileInk }}>
          “A code word? Darling, we don't have TIME for games. Read me the code. Now.”
        </p>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {TELLS.map((o) => {
          const isChosen = chosen === o.id;
          const stateColor = o.correct ? T.confirmedGreen : T.threatRed;
          return (
            <button
              key={o.id}
              onClick={() => pick(o.id)}
              className="sr-btn"
              disabled={!!choice?.correct}
              style={{ textAlign: "left", fontSize: 13.5, lineHeight: 1.55, color: isChosen ? stateColor : T.textPrimary, background: isChosen ? `${stateColor}14` : T.panelRaised, border: `1px solid ${isChosen ? stateColor : T.hairline}`, borderRadius: 3, padding: "12px 14px", cursor: choice?.correct ? "default" : "pointer" }}
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
                label="TELL SPOTTED: TRACE THE CALL"
                onClick={() => {
                  audio.stamp();
                  onDone();
                }}
              />
            ) : (
              <GhostButton label="RECONSIDER" onClick={() => setChosen(null)} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------ phase 3: the supply chain */
/* Assemble the chain: tap the 3 real players, leave the 2 decoys. */

function ChainPhase({ reduced, audio, onDone }: { reduced: boolean; audio: IncidentProps["audio"]; onDone: () => void }) {
  const [flags, setFlags] = useState<string[]>([]);
  const [note, setNote] = useState<{ text: string; ok: boolean } | null>(null);
  const [closed, setClosed] = useState(false);

  const realFlags = flags.length;
  const allFlagged = realFlags >= 3;

  const tap = (o: (typeof CHAIN)[number]) => {
    if (allFlagged) return;
    if (o.real) {
      if (flags.includes(o.id)) return;
      setFlags((f) => [...f, o.id]);
      setNote({ text: o.note, ok: true });
      audio.latch();
    } else {
      setNote({ text: o.note, ok: false });
      audio.thud();
    }
  };

  if (closed) {
    return (
      <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.06em", color: T.confirmedGreen, margin: 0 }}>
        FILED: THREE PLAYERS, ONE SUPPLY CHAIN. YOUR EARS LIED. YOUR PROTOCOL DIDN'T.
      </p>
    );
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <Eyebrow text="Phase 3. ARC traced the call. Tap the 3 real players who built this attack. Leave the 2 fakes." color={T.actionAmber} />

      {/* the chain, assembling */}
      <div style={{ margin: "14px 0" }}>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", color: allFlagged ? T.confirmedGreen : T.textSecondary }}>
          CHAIN: <span style={{ color: allFlagged ? T.confirmedGreen : T.actionAmber, fontWeight: 600 }}>{realFlags}/3</span>
        </div>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {CHAIN.map((o) => {
          const done = flags.includes(o.id);
          return (
            <button
              key={o.id}
              onClick={() => tap(o)}
              className="sr-btn"
              disabled={done || allFlagged}
              style={{ textAlign: "left", fontSize: 13.5, lineHeight: 1.55, color: done ? T.confirmedGreen : T.textPrimary, background: done ? `${T.confirmedGreen}14` : T.panelRaised, border: `1px solid ${done ? T.confirmedGreen : T.hairline}`, borderRadius: 3, padding: "12px 14px", cursor: done || allFlagged ? "default" : "pointer", opacity: allFlagged && !o.real ? 0.5 : 1 }}
            >
              {done ? "⚑ " : ""}
              {o.label}
            </button>
          );
        })}
      </div>

      {note && !allFlagged && (
        <p role="status" style={{ margin: "12px 0 0", fontSize: 14, lineHeight: 1.6, color: note.ok ? T.confirmedGreen : T.textSecondary }}>
          {note.text}
        </p>
      )}

      {allFlagged && (
        <div role="status" style={{ marginTop: 14, borderLeft: `2px solid ${T.confirmedGreen}`, paddingLeft: 14 }}>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>
            Confirmed. Scraped audio: PACKRAT. Pressure script: GHOSTWRITER. Cloned voice: MIMIC. Three players, one supply chain. The dossier board just grew a spine.
          </p>
          <div style={{ marginTop: 12 }}>
            <AmberButton
              label="FILE THE SUPPLY CHAIN"
              onClick={() => {
                setClosed(true);
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
