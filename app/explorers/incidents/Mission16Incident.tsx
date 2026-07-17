"use client";

/**
 * Mission 16 incident — "The Auction".
 *
 * PACKRAT's final sale. The file can't be stolen back — but its
 * VALUE lives in the links, and links can be cut before the gavel.
 * Phases:
 *   1. READ THE LOT — what actually makes the file valuable?
 *   2. CUT THE LINKS — the move that crashes the price
 *   3. THE GAVEL — the honest ledger of what buyers received
 */

import { useState } from "react";
import { AmberButton, Bubble, Eyebrow, GhostButton } from "../engine/primitives";
import { MONO, T } from "../engine/tokens";
import type { IncidentProps } from "../engine/types";

const LOTS = [
  {
    id: "scores",
    label: "The high scores and playlists — years of them",
    correct: false,
    outcome:
      "Trivia. Nobody bids on your space-shooter record. Look for what buyers can USE.",
  },
  {
    id: "linked",
    label: "The LINKS — one handle tying school, habits, photos, and answers into one person",
    correct: true,
    outcome:
      "That's the merchandise. Separate crumbs are worth pennies. LINKED crumbs are a person, packaged. The links are the lot.",
  },
  {
    id: "memes",
    label: "The saved memes folder",
    correct: false,
    outcome:
      "PACKRAT has better memes than anyone, and they're worth nothing. Value lives in linkage, not volume.",
  },
];

const CUTS = [
  {
    id: "onephoto",
    label: "Delete the park photo — it has the location tag",
    correct: false,
    outcome:
      "One page out of a linked book. The handle still ties everything else together. Think bigger than one crumb.",
  },
  {
    id: "links",
    label: "Break the linkage: vary the handles, private the accounts, close the dead door",
    correct: true,
    outcome:
      "Price crash. The file is now a pile of unconnected scraps that COULD be anyone. Buyers pay for a person, not a pile.",
  },
  {
    id: "bid",
    label: "Bid on the file yourself and destroy it",
    correct: false,
    outcome:
      "Paying a collector funds the next collection — and he keeps copies. Never buy back what you can devalue.",
  },
];

const GAVELS = [
  {
    id: "full",
    label: "The full file — the sale went through anyway",
    correct: false,
    outcome:
      "The sale went through, yes — check what the file CONTAINED by then. Follow the links you cut.",
  },
  {
    id: "scraps",
    label: "Unlinked scraps that could be anyone — the buyers got a pile, not a person",
    correct: true,
    outcome:
      "Exactly. The gavel fell on waste paper. And every complaint from a cheated buyer chips PACKRAT's reputation in the market. Devalue beats destroy.",
  },
  {
    id: "nothing",
    label: "Nothing — the auction was cancelled",
    correct: false,
    outcome:
      "Collectors never cancel. The auction ran — the honest ledger asks what the lot was WORTH by gavel time.",
  },
];

export default function Mission16Incident({ reduced, audio, onPhaseCleared, onComplete }: IncidentProps) {
  const [phase, setPhase] = useState(1);
  const [lot, setLot] = useState<string | null>(null);
  const [cut, setCut] = useState<string | null>(null);
  const [gavel, setGavel] = useState<string | null>(null);
  const [closed, setClosed] = useState(false);

  const pick =
    (set: (v: string | null) => void, list: { id: string; correct: boolean }[], cur: string | null) =>
    (id: string) => {
      if (cur && list.find((o) => o.id === cur)?.correct) return;
      set(id);
      const o = list.find((x) => x.id === id);
      if (o?.correct) audio.latch();
      else audio.thud();
    };

  const lotChoice = LOTS.find((o) => o.id === lot) ?? null;
  const cutChoice = CUTS.find((o) => o.id === cut) ?? null;
  const gavelChoice = GAVELS.find((o) => o.id === gavel) ?? null;

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
            INTERCEPTED — PACKRAT, ON THE WIRE
          </div>
          <Bubble who="villain">
            <em>&ldquo;My masterpiece file, little archivist. Years in the collecting. Bid generously — oh. Why is it… crumbling?&rdquo;</em>
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
          "Phase 1 — The lot listing is up. What actually makes this file worth bidding on?",
          "LOT 47: one student, fully mapped. Handle-linked across 6 apps. School, habits, schedule, security answers. Opening bid: high.",
          LOTS,
          lot,
          lotChoice,
          pick(setLot, LOTS, lot),
          "VALUE FOUND — CUT IT",
          () => {
            audio.stamp();
            onPhaseCleared(1);
            setPhase(2);
          },
          () => setLot(null),
        )}

      {phase === 2 &&
        stage(
          "Phase 2 — The gavel is in one hour. One move crashes the price. Which?",
          "AUCTION STATUS: 12 bidders registered · lot value: HIGH · linkage integrity: 100%",
          CUTS,
          cut,
          cutChoice,
          pick(setCut, CUTS, cut),
          "LINKS CUT — TO THE GAVEL",
          () => {
            audio.stamp();
            onPhaseCleared(2);
            setPhase(3);
          },
          () => setCut(null),
        )}

      {phase === 3 && !closed &&
        stage(
          "Phase 3 — The gavel falls. The honest ledger: what did the buyers actually get?",
          "AUCTION CLOSED: lot sold · linkage integrity at gavel: 11% · buyer complaints: filing…",
          GAVELS,
          gavel,
          gavelChoice,
          pick(setGavel, GAVELS, gavel),
          "CLOSE THE LEDGER",
          () => {
            setClosed(true);
            audio.stamp();
            onPhaseCleared(3);
            window.setTimeout(onComplete, reduced ? 250 : 700);
          },
          () => setGavel(null),
        )}

      {phase === 3 && closed && (
        <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.06em", color: T.confirmedGreen, margin: 0 }}>
          LEDGER CLOSED — THE MASTERPIECE SOLD AS SCRAP. COLLECTIONS END WHEN LINKS DO.
        </p>
      )}
    </div>
  );
}
