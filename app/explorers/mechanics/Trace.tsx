"use client";

/**
 * TRACE — the evidence board. Debuts in Mission 02.
 *
 * Two stages, one skill: correlation.
 *   Stage 1 — PIN THE CAMPAIGN: among the noise, tap every piece of
 *   evidence that belongs to the same operation (shared fingerprint).
 *   Decoys thud. Pins snap.
 *   Stage 2 — ORDER THE FUNNEL: put the pinned evidence in the order
 *   the campaign runs it (bait → hook → net → haul).
 *
 * Mastery = zero wrong taps across both stages.
 */

import { useState } from "react";
import { AmberButton, Eyebrow } from "../engine/primitives";
import { MONO, T } from "../engine/tokens";
import type { MechanicProps, TraceCard, TracePayload } from "../engine/types";

export default function Trace({ payload, reduced, audio, onEvent }: MechanicProps<TracePayload>) {
  const [stage, setStage] = useState<1 | 2>(1);
  const [pinned, setPinned] = useState<string[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);
  const [sequence, setSequence] = useState<string[]>([]);
  const [missed, setMissed] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const campaign = payload.cards.filter((c) => c.inCampaign);
  const allPinned = pinned.length === campaign.length;
  const funnel = [...campaign].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const done = sequence.length === funnel.length;

  const tapStage1 = (card: TraceCard) => {
    if (stage !== 1 || pinned.includes(card.id)) return;
    if (card.inCampaign) {
      setPinned((p) => [...p, card.id]);
      setNote(`PINNED: ${card.clue ?? "same fingerprint."}`);
      audio.latch();
      onEvent({ kind: "HIT" });
    } else {
      setRejected((r) => (r.includes(card.id) ? r : [...r, card.id]));
      setMissed(true);
      setNote("Different fingerprint. That one's ordinary noise. Keep to the trail.");
      audio.thud();
      onEvent({ kind: "MISS" });
    }
  };

  const tapStage2 = (card: TraceCard) => {
    if (stage !== 2 || sequence.includes(card.id)) return;
    const expected = funnel[sequence.length];
    if (card.id === expected.id) {
      setSequence((s) => [...s, card.id]);
      setNote(null);
      audio.latch();
      onEvent({ kind: "HIT" });
    } else {
      setMissed(true);
      setNote("Not that step yet. Think like the campaign: what has to happen FIRST for the next part to work?");
      audio.thud();
      onEvent({ kind: "MISS" });
    }
  };

  const renderCard = (card: TraceCard) => {
    const isPinned = pinned.includes(card.id);
    const isRejected = rejected.includes(card.id);
    const seqIndex = sequence.indexOf(card.id);
    const inStage2 = stage === 2;
    if (inStage2 && !card.inCampaign) return null;
    const border = inStage2
      ? seqIndex >= 0
        ? T.confirmedGreen
        : T.actionAmber
      : isPinned
        ? T.actionAmber
        : isRejected
          ? T.hairline
          : T.hairline;
    return (
      <button
        key={card.id}
        onClick={() => (inStage2 ? tapStage2(card) : tapStage1(card))}
        className="sr-btn"
        style={{
          textAlign: "left",
          background: T.paper,
          color: T.fileInk,
          border: "none",
          outline: `2px solid ${border}`,
          outlineOffset: -2,
          borderRadius: 2,
          padding: "12px 14px",
          boxShadow: "0 2px 0 rgba(0,0,0,0.5)",
          cursor: (inStage2 ? seqIndex < 0 : !isPinned) ? "pointer" : "default",
          opacity: isRejected && !inStage2 ? 0.55 : 1,
          position: "relative",
        }}
      >
        {isPinned && !inStage2 && (
          <span aria-hidden style={{ position: "absolute", top: 6, right: 8, fontFamily: MONO, fontSize: 10, color: "#A66A00" }}>⚑ PINNED</span>
        )}
        {seqIndex >= 0 && (
          <span aria-hidden style={{ position: "absolute", top: 6, right: 8, fontFamily: MONO, fontSize: 12, fontWeight: 600, color: "#1F7A4D" }}>
            {seqIndex + 1}
          </span>
        )}
        <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.08em", opacity: 0.55, marginBottom: 4 }}>
          {card.surface} · FROM: {card.from}
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.5 }}>{card.text}</div>
        {isPinned && card.clue && (
          <div style={{ fontFamily: MONO, fontSize: 10, marginTop: 6, color: "#A66A00" }}>FINGERPRINT: {card.clue}</div>
        )}
      </button>
    );
  };

  return (
    <section>
      <Eyebrow text={stage === 1 ? payload.intro : payload.stage2Prompt} color={T.actionAmber} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "10px 0 12px", flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontFamily: MONO, fontSize: 11.5, color: T.textSecondary, letterSpacing: "0.05em" }}>
          {stage === 1 ? `HINT: ${payload.fingerprintHint}` : "TAP THE EVIDENCE IN THE ORDER THE TRICK RUNS."}
        </span>
        <span style={{ fontFamily: MONO, fontSize: 12, color: (stage === 1 ? allPinned : done) ? T.confirmedGreen : T.textSecondary }}>
          {stage === 1 ? `${pinned.length}/${campaign.length} PINNED` : `${sequence.length}/${funnel.length} ORDERED`}
        </span>
      </div>

      <div className="sr-two-col" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, background: T.panel, border: `1px solid ${T.hairline}`, borderRadius: 3, padding: 16 }}>
        {payload.cards.map(renderCard)}
      </div>

      {note && (
        <p role="status" style={{ margin: "12px 0 0", fontSize: 13, lineHeight: 1.55, color: note.startsWith("PINNED") ? T.confirmedGreen : T.textSecondary }}>
          {note}
        </p>
      )}

      {stage === 1 && allPinned && (
        <div style={{ marginTop: 16 }}>
          <AmberButton
            label="ALL PINNED: MAP THE FUNNEL"
            onClick={() => {
              audio.click();
              setStage(2);
              setNote(null);
            }}
          />
        </div>
      )}

      {stage === 2 && done && (
        <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
          <p style={{ margin: 0, fontSize: 13, color: T.textSecondary, fontStyle: "italic" }}>
            &ldquo;{payload.doneLine}&rdquo;
          </p>
          <AmberButton label="FILE THE TRAIL" onClick={() => onEvent({ kind: "COMPLETED", mastery: !missed })} />
        </div>
      )}
    </section>
  );
}
