"use client";

/**
 * Mission 16 incident — "The Auction".
 *
 * PACKRAT's final sale. The file can't be stolen back, but its VALUE
 * lives in the links, and links can be cut before the gavel. Three
 * distinct beats, not three menus:
 *   1. READ THE LOT    — find the one thing buyers actually pay for
 *   2. SEVER THE LINKS — cut each real link and watch the price crash
 *   3. THE GAVEL       — the honest ledger of what the buyers received
 */

import { useState } from "react";
import { AmberButton, Eyebrow, GhostButton } from "../engine/primitives";
import { MONO, T } from "../engine/tokens";
import type { IncidentProps } from "../engine/types";
import { BossIntro, PhasePips } from "./BossChrome";

/* Phase 1: tap the one thing buyers actually pay for. */
const LOT = [
  { id: "scores", label: "Years of high scores and playlists", real: false, note: "Trivia. Nobody bids on your space-shooter record. Look for what buyers can USE." },
  { id: "links", label: "THE LINKS: one handle tying school, habits, photos, and answers into one person", real: true, note: "That's the merchandise. Linked crumbs are a person, packaged. The links are the lot." },
  { id: "onephoto", label: "One park photo with a location tag", real: false, note: "A single crumb, worth pennies alone. The value is what ties crumbs together." },
  { id: "memes", label: "A folder of saved memes", real: false, note: "Worth nothing. Value lives in linkage, not volume." },
  { id: "dead", label: "An old game account, long abandoned", real: false, note: "A dead crumb, valuable only once it's LINKED to the rest." },
];

/* Phase 2: three real cuts crash the price; two decoys do nothing. */
const SEVERS = [
  { id: "handles", label: "Vary the handles: a different name on every app", real: true, note: "One handle was the thread. Cut it, and the apps stop pointing at one person." },
  { id: "private", label: "Switch the live accounts to private", real: true, note: "Private-first. Collectors can't scrape what they can't see." },
  { id: "deaddoor", label: "Close the dead account nobody watches", real: true, note: "The oldest open door, shut. No more free crumbs from age-nine you." },
  { id: "onephoto", label: "Delete one old park photo", real: false, note: "One page out of a linked book. The handle still ties the rest together." },
  { id: "buyback", label: "Bid on the file and destroy it", real: false, note: "Paying a collector funds the next collection, and he keeps copies. Never buy back what you can devalue." },
];
/** Linkage integrity by number of real cuts made (0..3). */
const INTEGRITY = [100, 64, 38, 11];

/* Phase 3: the honest ledger, one decisive read. */
const GAVELS = [
  { id: "full", label: "The full file, the sale went through anyway", correct: false, outcome: "The sale went through, yes. But check what the file CONTAINED by then. Follow the links you cut." },
  { id: "scraps", label: "Unlinked scraps that could be anyone: the buyers got a pile, not a person", correct: true, outcome: "Exactly. The gavel fell on waste paper. Every cheated buyer chips PACKRAT's reputation. Devalue beats destroy." },
  { id: "nothing", label: "Nothing, the auction was cancelled", correct: false, outcome: "Collectors never cancel. The auction ran. The honest ledger asks what the lot was WORTH by gavel time." },
];

export default function Mission16Incident({ reduced, audio, onPhaseCleared, onComplete }: IncidentProps) {
  const [phase, setPhase] = useState(1);

  // phase 1: find the value
  const [lotFound, setLotFound] = useState(false);
  const [lotNote, setLotNote] = useState<string | null>(null);

  // phase 2: sever the links
  const [cuts, setCuts] = useState<string[]>([]);
  const [severNote, setSeverNote] = useState<{ text: string; ok: boolean } | null>(null);

  // phase 3: the gavel
  const [gavel, setGavel] = useState<string | null>(null);
  const [closed, setClosed] = useState(false);

  const realCuts = cuts.length;
  const integrity = INTEGRITY[Math.min(realCuts, 3)];
  const allCut = realCuts >= 3;
  const gavelChoice = GAVELS.find((o) => o.id === gavel) ?? null;

  const tapLot = (o: (typeof LOT)[number]) => {
    if (lotFound) return;
    setLotNote(o.note);
    if (o.real) {
      setLotFound(true);
      audio.latch();
    } else audio.thud();
  };

  const tapSever = (o: (typeof SEVERS)[number]) => {
    if (allCut) return;
    if (o.real) {
      if (cuts.includes(o.id)) return;
      setCuts((c) => [...c, o.id]);
      setSeverNote({ text: o.note, ok: true });
      audio.latch();
    } else {
      setSeverNote({ text: o.note, ok: false });
      audio.thud();
    }
  };

  const pickGavel = (id: string) => {
    if (gavel && GAVELS.find((o) => o.id === gavel)?.correct) return;
    setGavel(id);
    if (GAVELS.find((o) => o.id === id)?.correct) audio.latch();
    else audio.thud();
  };

  const meterColor = integrity > 50 ? T.threatRed : integrity > 20 ? T.actionAmber : T.confirmedGreen;

  return (
    <div>
      {phase === 1 && (
        <BossIntro
          codename="PACKRAT"
          taunt="My masterpiece file, little archivist. Years in the collecting. Bid generously. Oh. Why is it… crumbling?"
        />
      )}

      <PhasePips phase={phase} labels={["READ THE LOT", "SEVER THE LINKS", "THE GAVEL"]} />

      {/* ---------------------------------------------- PHASE 1: read the lot */}
      {phase === 1 && (
        <div style={{ maxWidth: 640 }}>
          <Eyebrow text="Phase 1. The lot listing is up. Tap the one thing that makes it worth bidding on." color={T.actionAmber} />
          <div style={{ margin: "14px 0", background: T.paper, borderRadius: 2, padding: "14px 16px", boxShadow: "0 2px 0 rgba(0,0,0,0.5)" }}>
            <p style={{ margin: 0, fontFamily: MONO, fontSize: 13, lineHeight: 1.6, color: T.fileInk }}>
              LOT 47: one student, fully mapped. Handle-linked across 6 apps. School, habits, schedule, security answers. Opening bid: high.
            </p>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {LOT.map((o) => {
              const isValue = lotFound && o.real;
              return (
                <button
                  key={o.id}
                  onClick={() => tapLot(o)}
                  className="sr-btn"
                  disabled={lotFound}
                  style={{ textAlign: "left", fontSize: 13.5, lineHeight: 1.55, color: isValue ? T.confirmedGreen : T.textPrimary, background: isValue ? `${T.confirmedGreen}14` : T.panelRaised, border: `1px solid ${isValue ? T.confirmedGreen : T.hairline}`, borderRadius: 3, padding: "12px 14px", cursor: lotFound ? "default" : "pointer", opacity: lotFound && !o.real ? 0.5 : 1 }}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
          {lotNote && (
            <div role="status" style={{ marginTop: 14, borderLeft: `2px solid ${lotFound ? T.confirmedGreen : T.threatRed}`, paddingLeft: 14 }}>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{lotNote}</p>
              {lotFound && (
                <div style={{ marginTop: 12 }}>
                  <AmberButton
                    label="VALUE FOUND: SEVER THE LINKS"
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

      {/* ------------------------------------------- PHASE 2: sever the links */}
      {phase === 2 && (
        <div style={{ maxWidth: 640 }}>
          <Eyebrow text="Phase 2. The gavel is in one hour. Cut every real link and crash the price." color={T.actionAmber} />

          {/* live linkage-integrity meter: the file's whole worth, falling */}
          <div style={{ margin: "14px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", color: T.textSecondary, marginBottom: 6 }}>
              <span>LINKAGE INTEGRITY</span>
              <span style={{ color: meterColor, fontWeight: 600 }}>{integrity}%</span>
            </div>
            <div style={{ height: 10, background: T.panelRaised, borderRadius: 5, overflow: "hidden", border: `1px solid ${T.hairline}` }}>
              <div style={{ width: `${integrity}%`, height: "100%", background: meterColor, transition: reduced ? "none" : "width 500ms ease, background 500ms ease" }} />
            </div>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.06em", color: T.textDisabled, marginTop: 4 }}>
              LOT VALUE: {integrity > 50 ? "HIGH" : integrity > 20 ? "FALLING" : "SCRAP"}
            </div>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {SEVERS.map((o) => {
              const done = cuts.includes(o.id);
              return (
                <button
                  key={o.id}
                  onClick={() => tapSever(o)}
                  className="sr-btn"
                  disabled={done || allCut}
                  style={{ textAlign: "left", fontSize: 13.5, lineHeight: 1.55, color: done ? T.confirmedGreen : T.textPrimary, background: done ? `${T.confirmedGreen}14` : T.panelRaised, border: `1px solid ${done ? T.confirmedGreen : T.hairline}`, borderRadius: 3, padding: "12px 14px", cursor: done || allCut ? "default" : "pointer", opacity: allCut && !o.real ? 0.5 : 1 }}
                >
                  {done ? "✂ " : ""}
                  {o.label}
                </button>
              );
            })}
          </div>

          {severNote && !allCut && (
            <p role="status" style={{ margin: "12px 0 0", fontSize: 14, lineHeight: 1.6, color: severNote.ok ? T.confirmedGreen : T.textSecondary }}>
              {severNote.text}
            </p>
          )}

          {allCut && (
            <div role="status" style={{ marginTop: 14, borderLeft: `2px solid ${T.confirmedGreen}`, paddingLeft: 14 }}>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>
                Price crash. The file is now a pile of unconnected scraps that could be anyone. Buyers pay for a person, not a pile.
              </p>
              <div style={{ marginTop: 12 }}>
                <AmberButton
                  label="PRICE CRASHED: TO THE GAVEL"
                  onClick={() => {
                    audio.stamp();
                    onPhaseCleared(2);
                    setPhase(3);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------- PHASE 3: the gavel */}
      {phase === 3 && !closed && (
        <div style={{ maxWidth: 640 }}>
          <Eyebrow text="Phase 3. The gavel falls. The honest ledger: what did the buyers actually get?" color={T.actionAmber} />
          <div style={{ margin: "14px 0", background: T.paper, borderRadius: 2, padding: "14px 16px", boxShadow: "0 2px 0 rgba(0,0,0,0.5)" }}>
            <p style={{ margin: 0, fontFamily: MONO, fontSize: 13, lineHeight: 1.6, color: T.fileInk }}>
              AUCTION CLOSED: lot sold · linkage integrity at gavel: 11% · buyer complaints: filing…
            </p>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {GAVELS.map((o) => {
              const isChosen = gavel === o.id;
              const stateColor = o.correct ? T.confirmedGreen : T.threatRed;
              return (
                <button
                  key={o.id}
                  onClick={() => pickGavel(o.id)}
                  className="sr-btn"
                  disabled={!!gavelChoice?.correct}
                  style={{ textAlign: "left", fontSize: 13.5, lineHeight: 1.55, color: isChosen ? stateColor : T.textPrimary, background: isChosen ? `${stateColor}14` : T.panelRaised, border: `1px solid ${isChosen ? stateColor : T.hairline}`, borderRadius: 3, padding: "12px 14px", cursor: gavelChoice?.correct ? "default" : "pointer" }}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
          {gavelChoice && (
            <div role="status" style={{ marginTop: 14, borderLeft: `2px solid ${gavelChoice.correct ? T.confirmedGreen : T.threatRed}`, paddingLeft: 14 }}>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{gavelChoice.outcome}</p>
              <div style={{ marginTop: 12 }}>
                {gavelChoice.correct ? (
                  <AmberButton
                    label="CLOSE THE LEDGER"
                    onClick={() => {
                      setClosed(true);
                      audio.stamp();
                      onPhaseCleared(3);
                      window.setTimeout(onComplete, reduced ? 250 : 700);
                    }}
                  />
                ) : (
                  <GhostButton label="RECONSIDER" onClick={() => setGavel(null)} />
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {phase === 3 && closed && (
        <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.06em", color: T.confirmedGreen, margin: 0 }}>
          LEDGER CLOSED: THE MASTERPIECE SOLD AS SCRAP. COLLECTIONS END WHEN LINKS DO.
        </p>
      )}
    </div>
  );
}
