"use client";

/**
 * Mission 20 incident - "Signal Zero" (the capstone finale).
 *
 * ZERO runs the whole season at the operative, solo. The finale is
 * synthesis, so the three phases are three DISTINCT interactions, each
 * reusing a pattern the season already taught (no new engine):
 *   1. MATCH  - build the wall. Six of the season's greatest-hits tricks,
 *      each paired to the ONE defense that stops it. Defense-in-depth,
 *      built by hand, all standing at once.
 *   2. UNMASK - one decisive verdict: the coordinator is an ex-ARC analyst.
 *   3. HAND OFF - one decisive verdict: seal it, hand it to the adults.
 *
 * ARC chrome never corrupts, even here (locked). No new mechanics.
 */

import { useState } from "react";
import { AmberButton, Eyebrow, GhostButton } from "../engine/primitives";
import { MONO, T } from "../engine/tokens";
import type { IncidentProps } from "../engine/types";
import { BossIntro, PhasePips } from "./BossChrome";

/* Phase 1: the season's six tricks, each stopped by exactly one defense.
   Match all six and the wall stands. This proves defense-in-depth by
   construction: the kid builds the whole wall. */
const TRICKS = [
  { id: "lure", label: "The lure: “You won! Tap to claim your prize.”", defense: "eyes" },
  { id: "mirror", label: "The mirror site: a login page that looks just right", defense: "type" },
  { id: "clone", label: "The cloned call: a voice that sounds like family", defense: "code" },
  { id: "face", label: "The borrowed-face DM: a friend's photo, a stranger's ask", defense: "second" },
  { id: "installer", label: "The fake installer: a “free” game with something hidden inside", defense: "source" },
  { id: "favor", label: "The “tiny favor”: “just send me that one little code”", defense: "sayno" },
];

/* Defenses live in a scrambled order so the match means something. */
const DEFENSES = [
  { id: "second", label: "Check on a second channel first" },
  { id: "source", label: "Install from the official source only" },
  { id: "eyes", label: "Slow down. Trained eyes, no rush" },
  { id: "sayno", label: "Remember the Code. Say no" },
  { id: "type", label: "Type the address yourself. Open the vault" },
  { id: "code", label: "Ask for the family code word" },
];

/* The one-line proof shown when a correct pair latches. */
const PAIR_NOTE: Record<string, string> = {
  lure: "Trained eyes catch the lure. Nobody wins a prize they never entered.",
  mirror: "You type the real address and open the vault. The mirror catches nothing.",
  clone: "The code word stops the clone. Only real family knows it.",
  face: "A second channel unmasks the borrowed face in seconds.",
  installer: "Official source only. The hidden payload never gets to run.",
  favor: "You remember the Code and say no. One “tiny favor” is how it always starts.",
};

const UNMASKS = [
  {
    id: "genius",
    label: "A criminal mastermind from nowhere",
    correct: false,
    outcome:
      "Look at the badge in the file. This isn't a stranger. The access, the ARC methods, the inside knowledge. Who knew all this?",
  },
  {
    id: "exarc",
    label: "An ex-ARC analyst: someone with your exact training who chose the other path",
    correct: true,
    outcome:
      "There it is. The coordinator was an operative once, cleared like you, taught like you. Then they chose to aim it all at people. Every skill you have, they had. The only difference was the choice. That's why the Code was the whole course.",
  },
  {
    id: "robot",
    label: "Just an AI running by itself",
    correct: false,
    outcome:
      "The recruiting message had a person's pride in it: “better than them”, “you'd fit”. Machines don't get jealous of ARC. A person did this.",
  },
];

const HANDOFFS = [
  {
    id: "confront",
    label: "Message them one last time: “I beat you.”",
    correct: false,
    outcome:
      "The last word isn't the win. Tipping them off is the loss. Analysts stay quiet and let the evidence speak in the right room.",
  },
  {
    id: "clean",
    label: "Seal the file, hand it to ARC's adults and the platform, let them act",
    correct: true,
    outcome:
      "Mastery. Every receipt, filed. The people whose job this is take it from here. The coordinator is ended by the rules they threw away. You never became them. That is the whole victory.",
  },
  {
    id: "keep",
    label: "Keep hunting them yourself, forever",
    correct: false,
    outcome:
      "A good analyst knows where their job ends. You see, you document, you hand off. Carrying it alone forever is how analysts burn out. It's also how they drift.",
  },
];

export default function Mission20Incident({ reduced, audio, onPhaseCleared, onComplete }: IncidentProps) {
  const [phase, setPhase] = useState(1);

  // phase 1: match the wall
  const [selected, setSelected] = useState<string | null>(null);
  const [paired, setPaired] = useState<string[]>([]);
  const [matchNote, setMatchNote] = useState<{ text: string; ok: boolean } | null>(null);

  // phases 2 & 3: single decisive verdicts
  const [unmask, setUnmask] = useState<string | null>(null);
  const [handoff, setHandoff] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const pairedDefenses = paired.map((tid) => TRICKS.find((t) => t.id === tid)!.defense);
  const wallHolds = paired.length === TRICKS.length;

  const tapTrick = (id: string) => {
    if (wallHolds || paired.includes(id)) return;
    setSelected((cur) => (cur === id ? null : id));
    audio.click();
  };

  const tapDefense = (id: string) => {
    if (wallHolds || pairedDefenses.includes(id)) return;
    if (!selected) {
      setMatchNote({ text: "Pick an incoming trick first, then tap the wall that stops it.", ok: false });
      return;
    }
    const trick = TRICKS.find((t) => t.id === selected)!;
    if (trick.defense === id) {
      setPaired((p) => [...p, trick.id]);
      setSelected(null);
      setMatchNote({ text: PAIR_NOTE[trick.id], ok: true });
      audio.latch();
    } else {
      setSelected(null);
      setMatchNote({ text: "Close, but that wall won't stop this trick. Pick the one built for it.", ok: false });
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

  const unmaskChoice = UNMASKS.find((o) => o.id === unmask) ?? null;
  const handoffChoice = HANDOFFS.find((o) => o.id === handoff) ?? null;

  /* Single decisive verdict (phases 2 and 3). */
  const verdict = (
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
          <p style={{ margin: 0, fontFamily: MONO, fontSize: 13, lineHeight: 1.65, color: T.fileInk }}>{scene}</p>
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
        <BossIntro
          codename="ZERO, THE COORDINATOR"
          taunt="You're the best they ever trained, Operative. I know. I was, once. Come now. One last favor, and all of this stops."
        />
      )}

      <PhasePips phase={phase} labels={["MATCH THE WALL", "UNMASK", "HAND OFF"]} />

      {/* ------------------------------------------ PHASE 1: match the wall */}
      {phase === 1 && (
        <div style={{ maxWidth: 680 }}>
          <Eyebrow text="Phase 1. Every trick you have faced, all at once, aimed at you alone." color={T.actionAmber} />
          <p style={{ margin: "10px 0 0", fontSize: 14, lineHeight: 1.6, color: T.textSecondary }}>
            You do not answer them one at a time. You build one wall. Tap a trick, then tap the defense that stops it.
          </p>

          {/* the wall, filling as you pair */}
          <div style={{ margin: "14px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", color: T.textSecondary, marginBottom: 6 }}>
              <span>WALL BUILT</span>
              <span style={{ color: wallHolds ? T.confirmedGreen : T.actionAmber, fontWeight: 600 }}>
                {paired.length} / {TRICKS.length}
              </span>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {TRICKS.map((_, i) => (
                <span
                  key={i}
                  style={{ flex: 1, height: 8, borderRadius: 2, background: i < paired.length ? T.confirmedGreen : T.panelRaised, border: `1px solid ${i < paired.length ? T.confirmedGreen : T.hairline}`, transition: reduced ? "none" : "background 300ms ease" }}
                />
              ))}
            </div>
          </div>

          <div className="sr-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {/* incoming tricks */}
            <div>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", color: T.threatRed, marginBottom: 8 }}>INCOMING TRICK</div>
              <div style={{ display: "grid", gap: 10 }}>
                {TRICKS.map((t) => {
                  const locked = paired.includes(t.id);
                  const isSel = selected === t.id;
                  const color = locked ? T.confirmedGreen : isSel ? T.actionAmber : T.textPrimary;
                  const bg = locked ? `${T.confirmedGreen}14` : isSel ? `${T.actionAmber}14` : T.panelRaised;
                  const bd = locked ? T.confirmedGreen : isSel ? T.actionAmber : T.hairline;
                  return (
                    <button
                      key={t.id}
                      onClick={() => tapTrick(t.id)}
                      className="sr-btn"
                      disabled={locked || wallHolds}
                      style={{ textAlign: "left", fontSize: 13, lineHeight: 1.5, color, background: bg, border: `1px solid ${bd}`, borderRadius: 3, padding: "12px 14px", cursor: locked || wallHolds ? "default" : "pointer" }}
                    >
                      {locked ? "✓ " : ""}
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* your wall */}
            <div>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", color: T.confirmedGreen, marginBottom: 8 }}>YOUR WALL</div>
              <div style={{ display: "grid", gap: 10 }}>
                {DEFENSES.map((d) => {
                  const used = pairedDefenses.includes(d.id);
                  const color = used ? T.confirmedGreen : T.textPrimary;
                  const bg = used ? `${T.confirmedGreen}14` : T.panelRaised;
                  const bd = used ? T.confirmedGreen : T.hairline;
                  return (
                    <button
                      key={d.id}
                      onClick={() => tapDefense(d.id)}
                      className="sr-btn"
                      disabled={used || wallHolds}
                      style={{ textAlign: "left", fontSize: 13, lineHeight: 1.5, color, background: bg, border: `1px solid ${bd}`, borderRadius: 3, padding: "12px 14px", cursor: used || wallHolds ? "default" : "pointer" }}
                    >
                      {used ? "✓ " : ""}
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {matchNote && !wallHolds && (
            <p role="status" style={{ margin: "12px 0 0", fontSize: 14, lineHeight: 1.6, color: matchNote.ok ? T.confirmedGreen : T.textSecondary }}>
              {matchNote.text}
            </p>
          )}

          {wallHolds && (
            <div role="status" style={{ marginTop: 14, borderLeft: `2px solid ${T.confirmedGreen}`, paddingLeft: 14 }}>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>
                Six tricks, six walls, all standing at once. This is the whole course in one picture. You did not dodge them one by one. You built a wall that holds them all.
              </p>
              <div style={{ marginTop: 12 }}>
                <AmberButton
                  label="LINE HELD: TRACE THE SOURCE"
                  onClick={() => {
                    audio.stamp();
                    onPhaseCleared(1);
                    setPhase(2);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------- PHASE 2: the unmask */}
      {phase === 2 &&
        verdict(
          "Phase 2: the trace comes back. The board lights up one final name. Who is the coordinator?",
          "IDENTITY FOUND: former ARC clearance ✓ · knew the inside routes ✓ · trained on the same methods as you ✓ · status: went dark 4 years ago.",
          UNMASKS,
          unmask,
          unmaskChoice,
          pick(setUnmask, UNMASKS, unmask),
          "UNMASKED: MAKE THE HANDOFF",
          () => {
            audio.stamp();
            onPhaseCleared(2);
            setPhase(3);
          },
          () => setUnmask(null),
        )}

      {/* --------------------------------------------- PHASE 3: the handoff */}
      {phase === 3 && !done &&
        verdict(
          "Phase 3: everything is proven. WREN: “Your call, Operative. How does this end?”",
          null,
          HANDOFFS,
          handoff,
          handoffChoice,
          pick(setHandoff, HANDOFFS, handoff),
          "CASE CLOSED: SIGN OFF",
          () => {
            setDone(true);
            audio.stamp();
            onPhaseCleared(3);
            window.setTimeout(onComplete, reduced ? 300 : 1000);
          },
          () => setHandoff(null),
        )}

      {phase === 3 && done && (
        <div role="status" style={{ borderLeft: `2px solid ${T.confirmedGreen}`, paddingLeft: 14 }}>
          <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.06em", color: T.confirmedGreen, margin: 0 }}>
            SIGNAL ZERO SILENCED: SIX ACTORS AND ONE COORDINATOR, HANDED OVER CLEAN.
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: T.textPrimary, margin: "10px 0 0" }}>
            You started at CASE 001 as a trainee. You finish as ULTRA: the analyst who beat the whole network without ever becoming it. The dossier wall is complete. The card reprints with a new name on it: <strong>yours</strong>.
          </p>
        </div>
      )}
    </div>
  );
}
