"use client";

/**
 * MissionRuntime v2 — rebuilt to the Kid Contract
 * (docs/explorers/mission-experience-spec-v2.md).
 *
 * The spine is the MISSION MAP: a literal checklist (Skill 1/2/3 →
 * BOSS → Report) the child returns to after every completed step.
 * One screen = one job = one action; the instruction strip is the
 * only amber text; displayed vocabulary is kid-plain (LEARN / PLAY /
 * QUICK QUIZ / BOSS / MISSION REPORT / REWARDS) with fiction demoted
 * to subtitles. BeatPos and the award ledger are unchanged, so old
 * checkpoints still resume.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { playWren, stopWren, useSignalAudio, useWrenSpeaking } from "./audio";
import {
  AmberButton,
  Bubble,
  EngineStyles,
  Eyebrow,
  Face,
  GhostButton,
  Resolve,
  StampMark,
  TypingDots,
  useReducedMotion,
} from "./primitives";
import { BODY, MONO, T } from "./tokens";
import type {
  ArtifactLesson,
  AwardEvent,
  BeatPos,
  CatchThemDef,
  CheckpointEvidence,
  CycleDef,
  MissionCheckpoint,
  MissionManifest,
} from "./types";
import { checkpointStorageKey, xpForEvent } from "./types";
import { BLOCK_FILMS, BlockFilm, filmId, filmSeen, markFilmSeen } from "./BlockFilm";
import { MatrixRain } from "../MatrixRain";
import Inspect from "../mechanics/Inspect";
import Decide from "../mechanics/Decide";
import Profile from "../mechanics/Profile";
import Trace from "../mechanics/Trace";
import Simulate from "../mechanics/Simulate";
import Build from "../mechanics/Build";
import Cipher from "../mechanics/Cipher";
import Sort from "../mechanics/Sort";
import Meter from "../mechanics/Meter";
import Redact from "../mechanics/Redact";

const eventKey = (e: AwardEvent) => `${e.type}:${e.sourceKey}`;

function nextPos(pos: BeatPos, hasCatch = false, hasCheckpoint = true): BeatPos {
  if (pos.beat === "transmission") return { beat: "briefing" };
  if (pos.beat === "briefing") return { beat: "cycle", cycleIndex: 0, stage: "intel" };
  if (pos.beat === "cycle") {
    if (pos.stage === "intel") return { ...pos, stage: "fieldwork" };
    const afterCycle: BeatPos = pos.cycleIndex < 2
      ? { beat: "cycle", cycleIndex: (pos.cycleIndex + 1) as 0 | 1 | 2, stage: "intel" }
      : { beat: "incident", incidentPhase: 0 };
    // Structure v2: a cycle with no checkpoint goes LEARN -> PRACTICE -> next.
    if (pos.stage === "fieldwork") return hasCheckpoint ? { ...pos, stage: "checkpoint" } : afterCycle;
    return afterCycle; // checkpoint stage
  }
  // The must-pass gate sits between the boss and the report, when present.
  if (pos.beat === "incident") return hasCatch ? { beat: "catch" } : { beat: "debrief" };
  if (pos.beat === "catch") return { beat: "debrief" };
  if (pos.beat === "debrief") return { beat: "closed" };
  return pos;
}

/** Kid-plain position label for the HUD. */
function describePos(pos: BeatPos): string {
  if (pos.beat === "cycle") {
    const stage = pos.stage === "intel" ? "LEARN" : pos.stage === "fieldwork" ? "PRACTICE" : "SKILL CHECK";
    return `SKILL ${pos.cycleIndex + 1} · ${stage}`;
  }
  if (pos.beat === "incident") return "BOSS";
  if (pos.beat === "catch") return "THE TEST";
  if (pos.beat === "debrief") return "MISSION REPORT";
  if (pos.beat === "closed") return "REWARDS";
  return "MISSION START";
}

function toneFor(pos: BeatPos): string {
  if (pos.beat === "incident") return T.threatRed;
  if (pos.beat === "catch") return T.arcCyan; // a calm exam room, not the alarm-red boss
  if (pos.beat === "debrief") return T.confirmedGreen;
  if (pos.beat === "closed") return T.clearanceBrass;
  if (pos.beat === "cycle") {
    if (pos.stage === "fieldwork") return T.actionAmber;
    if (pos.stage === "checkpoint") return T.confirmedGreen;
  }
  return T.arcCyan;
}

/** How far through the checklist are we? 0=start, 1..3=skills done, 4=boss done, 5=report done. */
function stepsDone(pos: BeatPos): number {
  if (pos.beat === "transmission" || pos.beat === "briefing") return 0;
  if (pos.beat === "cycle") return pos.cycleIndex;
  if (pos.beat === "incident") return 3;
  if (pos.beat === "catch") return 3; // the gate lives inside the boss step
  if (pos.beat === "debrief") return 4;
  return 5;
}

/* ================================================================= map */

function MissionMap({ manifest, pos, stampNew }: { manifest: MissionManifest; pos: BeatPos; stampNew?: number }) {
  const done = stepsDone(pos);
  const rows: { label: string; sub: string; idx: number }[] = [
    ...manifest.cycles.map((c, i) => ({
      label: `SKILL ${i + 1}: ${c.title}`,
      sub: c.promise ?? c.concept,
      idx: i,
    })),
    { label: `BOSS: ${manifest.incident.title}`, sub: `Use all 3 skills against ${manifest.actor.codename}`, idx: 3 },
    { label: "MISSION REPORT", sub: "What you learned + your move in real life", idx: 4 },
  ];
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {rows.map((r) => {
        const isDone = r.idx < done;
        const isCurrent = r.idx === done;
        const justStamped = stampNew !== undefined && r.idx === stampNew;
        const boss = r.idx === 3;
        const accent = boss ? T.threatRed : T.arcCyan;
        return (
          <div
            key={r.label}
            className={`sr-card${boss ? " sr-hazard" : ""}${justStamped ? " sr-scene" : ""}`}
            style={{
              display: "flex",
              gap: 14,
              alignItems: "center",
              background: isCurrent ? `${accent}0F` : `${T.panel}D9`,
              border: `1px solid ${isDone ? `${T.confirmedGreen}66` : isCurrent ? `${accent}88` : T.hairline}`,
              borderLeft: `3px solid ${isDone ? T.confirmedGreen : isCurrent ? accent : T.hairline}`,
              borderRadius: 4,
              padding: "14px 16px",
              position: "relative",
              boxShadow: isCurrent ? `0 0 24px -6px ${accent}44, 0 6px 16px -10px rgba(0,0,0,0.7)` : "0 4px 12px -8px rgba(0,0,0,0.5)",
            }}
          >
            <span
              style={{
                display: "grid",
                placeItems: "center",
                minWidth: 38,
                height: 38,
                borderRadius: 4,
                fontFamily: MONO,
                fontSize: 17,
                fontWeight: 600,
                color: isDone ? T.inkBlack : isCurrent ? accent : T.textDisabled,
                background: isDone ? T.confirmedGreen : "transparent",
                border: isDone ? "none" : `2px solid ${isCurrent ? accent : T.hairline}`,
              }}
            >
              {isDone ? "✓" : boss ? "!" : r.idx < 3 ? r.idx + 1 : "★"}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: BODY, fontSize: 15, fontWeight: 700, color: isDone ? T.confirmedGreen : isCurrent ? T.textPrimary : T.textSecondary }}>
                {r.label}
              </div>
              <div style={{ fontSize: 13, color: T.textSecondary, marginTop: 2 }}>{r.sub}</div>
            </div>
            {isCurrent && (
              <span className="sr-blink" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", color: accent }}>
                ▶ YOU ARE HERE
              </span>
            )}
            {justStamped && (
              <StampMark text="DONE" visible reduced={false} style={{ position: "absolute", right: 14, top: -8 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================== runtime */

export default function MissionRuntime({ manifest, devStartBeat, onExit, onNextCase }: { manifest: MissionManifest; devStartBeat?: BeatPos["beat"]; onExit?: () => void; onNextCase?: () => void }) {
  const reduced = useReducedMotion();
  const audio = useSignalAudio();
  const storageKey = checkpointStorageKey(manifest.id);

  const [pos, setPos] = useState<BeatPos>(
    devStartBeat === "incident" ? { beat: "incident", incidentPhase: 1 } : devStartBeat === "catch" ? { beat: "catch" } : { beat: "transmission" },
  );
  const [intro, setIntro] = useState(!devStartBeat);
  /** Map moment between steps: which row was just stamped. */
  const [mapGate, setMapGate] = useState<number | null>(null);
  const [events, setEvents] = useState<AwardEvent[]>([]);
  const [resumeOffer, setResumeOffer] = useState<MissionCheckpoint | null>(null);
  const [ledgerOpen, setLedgerOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [xpPop, setXpPop] = useState<{ amount: number; key: number } | null>(null);
  const [filmToPlay, setFilmToPlay] = useState<{ kind: "intro" | "outro"; id: string } | null>(null);
  const seen = useRef<Set<string>>(new Set());
  const prevXp = useRef(0);

  const xp = useMemo(() => events.reduce((sum, e) => sum + xpForEvent(e), 0), [events]);

  useEffect(() => {
    const diff = xp - prevXp.current;
    if (diff > 0 && hydrated && !resumeOffer) setXpPop({ amount: diff, key: Date.now() });
    prevXp.current = xp;
  }, [xp, hydrated, resumeOffer]);

  useEffect(() => {
    if (devStartBeat) {
      setHydrated(true); // dev boss-jump: skip the resume offer, don't touch saved progress
      return;
    }
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const cp = JSON.parse(raw) as MissionCheckpoint;
        if (cp.missionId === manifest.id && cp.pos.beat !== "transmission") setResumeOffer(cp);
      }
    } catch {}
    setHydrated(true);
  }, [storageKey, manifest.id, devStartBeat]);

  useEffect(() => {
    if (!hydrated || resumeOffer || devStartBeat) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ missionId: manifest.id, pos, events } satisfies MissionCheckpoint));
    } catch {}
  }, [pos, events, hydrated, resumeOffer, storageKey, manifest.id, devStartBeat]);

  const emit = useCallback((e: AwardEvent) => {
    const key = eventKey(e);
    if (seen.current.has(key)) return;
    seen.current.add(key);
    setEvents((prev) => [...prev, e]);
  }, []);

  const finishFilm = useCallback(() => {
    setFilmToPlay((f) => {
      if (f) markFilmSeen(f.id);
      return null;
    });
  }, []);

  /* Block INTRO film: the first time a kid opens a block's opening case. */
  useEffect(() => {
    if (!hydrated || resumeOffer || filmToPlay) return;
    if (pos.beat !== "transmission") return; // fresh start only, never mid-mission
    const cfg = BLOCK_FILMS[manifest.block];
    if (!cfg || cfg.openerId !== manifest.id || !cfg.intro) return;
    const id = filmId(manifest.block, "intro");
    if (filmSeen(id)) return;
    stopWren();
    setFilmToPlay({ kind: "intro", id });
    // pos.beat read for the fresh-start guard; effect keys off hydration/resume
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, resumeOffer, manifest.block, manifest.id]);

  /* Block OUTRO film: when a kid closes the block's final case. */
  useEffect(() => {
    if (pos.beat !== "closed" || resumeOffer || filmToPlay) return;
    const cfg = BLOCK_FILMS[manifest.block];
    if (!cfg || cfg.closerId !== manifest.id || !cfg.outro) return;
    const id = filmId(manifest.block, "outro");
    if (filmSeen(id)) return;
    stopWren();
    setFilmToPlay({ kind: "outro", id });
  }, [pos.beat, resumeOffer, filmToPlay, manifest.block, manifest.id]);

  /** Advance; crossing a step boundary opens a MAP MOMENT. */
  const advance = useCallback(() => {
    audio.click();
    setPos((p) => {
      const hasCheck = p.beat === "cycle" ? !!manifest.cycles[p.cycleIndex]?.checkpoint?.questions?.length : true;
      const n = nextPos(p, !!manifest.catchThem, hasCheck);
      // A skill is "done" (stamp it on the map) when it clears its last stage —
      // the checkpoint if it has one, otherwise the practice.
      if (p.beat === "cycle" && (p.stage === "checkpoint" || (p.stage === "fieldwork" && !hasCheck))) setMapGate(p.cycleIndex);
      // Skip the "back to map" beat when the boss flows straight into Catch Them.
      if (p.beat === "incident" && !manifest.catchThem) setMapGate(3);
      return n;
    });
    window.scrollTo({ top: 0 });
  }, [audio, manifest]);

  const startMission = () => {
    audio.click();
    setIntro(false);
    setPos({ beat: "cycle", cycleIndex: 0, stage: "intel" });
    window.scrollTo({ top: 0 });
  };

  const restart = () => {
    try {
      localStorage.removeItem(storageKey);
    } catch {}
    seen.current = new Set();
    setEvents([]);
    setPos({ beat: "transmission" });
    setResumeOffer(null);
    setIntro(true);
    setMapGate(null);
  };

  const resume = () => {
    if (!resumeOffer) return;
    seen.current = new Set(resumeOffer.events.map(eventKey));
    setEvents(resumeOffer.events);
    setPos(resumeOffer.pos);
    setResumeOffer(null);
    setIntro(resumeOffer.pos.beat === "transmission" || resumeOffer.pos.beat === "briefing");
  };

  /* ---- WREN voice ---- */
  const [voiceOn, setVoiceOn] = useState(true);
  useEffect(() => {
    try {
      const v = localStorage.getItem("explorers:voice");
      if (v !== null) setVoiceOn(v === "1");
    } catch {}
  }, []);
  const toggleVoice = () => {
    setVoiceOn((v) => {
      const n = !v;
      try {
        localStorage.setItem("explorers:voice", n ? "1" : "0");
      } catch {}
      if (!n) stopWren();
      return n;
    });
  };
  const atStart = intro && (pos.beat === "transmission" || pos.beat === "briefing");
  useEffect(() => {
    if (resumeOffer || filmToPlay) {
      stopWren();
      return;
    }
    const clip = atStart ? manifest.voice?.transmission : pos.beat === "debrief" ? manifest.voice?.debrief : undefined;
    if (clip) playWren(clip, voiceOn);
    // During a cycle the LEARN/PLAY stages own WREN (narrator-led lessons +
    // exercise set-ups); stopping here would race and cut them off on entry.
    else if (pos.beat !== "cycle") stopWren();
  }, [atStart, pos.beat, resumeOffer, filmToPlay, voiceOn, manifest.voice]);
  useEffect(() => () => stopWren(), []);

  const tone = mapGate !== null ? T.confirmedGreen : toneFor(pos);
  const done = stepsDone(pos);
  const speaking = useWrenSpeaking();

  return (
    <main style={{ minHeight: "100vh", background: T.inkBlack, color: T.textPrimary, fontFamily: BODY, position: "relative", overflow: "hidden" }}>
      <EngineStyles />
      {/* matrix-terminal backdrop, dimmed in-mission so it never fights the reading (kept for identity) */}
      <MatrixRain reduced={reduced} opacity={0.16} />
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.24) 0 1px, transparent 1px 3px)", opacity: 0.32 }} />
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", background: `radial-gradient(ellipse 82% 72% at 50% 34%, transparent 44%, ${tone}12 74%, rgba(3,5,12,0.9) 100%)`, transition: "background 700ms" }} />

      {filmToPlay &&
        (() => {
          const cfg = BLOCK_FILMS[manifest.block];
          const film = filmToPlay.kind === "intro" ? cfg?.intro : cfg?.outro;
          if (!film) return null;
          return (
            <BlockFilm
              film={film}
              label={cfg.label}
              kind={filmToPlay.kind}
              block={manifest.block}
              reduced={reduced}
              onDone={finishFilm}
            />
          );
        })()}

      {/* HUD — terminal chrome */}
      <div style={{ position: "relative", zIndex: 2, borderBottom: `1px solid ${T.arcCyan}2E`, background: "rgba(8,14,26,0.82)", backdropFilter: "blur(8px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "11px 18px", flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 9, fontFamily: MONO, fontSize: 11.5, letterSpacing: "0.05em", color: T.textSecondary }}>
            {onExit && (
              <button onClick={onExit} aria-label="Back to the mission map" style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.06em", color: T.textSecondary, background: "transparent", border: `1px solid ${T.hairline}`, borderRadius: 3, padding: "4px 9px", cursor: "pointer" }}>
                ← MISSIONS
              </button>
            )}
            <span aria-hidden style={{ display: "inline-flex", gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff5f56" }} />
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ffbd2e" }} />
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#27c93f" }} />
            </span>
            <span style={{ color: T.textDisabled }}>ARC · {manifest.caseNumber} ·</span>{" "}
            <span style={{ color: T.arcCyan, fontWeight: 600 }}>{manifest.title}</span>
            <button
              onClick={toggleVoice}
              aria-label={voiceOn ? "Turn WREN's voice off" : "Turn WREN's voice on"}
              style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.1em", color: voiceOn ? T.arcCyan : T.textDisabled, background: "transparent", border: `1px solid ${voiceOn ? `${T.arcCyan}66` : T.hairline}`, borderRadius: 2, padding: "4px 8px", cursor: "pointer" }}
            >
              VOICE {voiceOn ? "ON" : "OFF"}
            </button>
          </span>
          <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.06em", color: T.textSecondary, position: "relative" }}>
            [ <span style={{ color: tone, transition: "color 500ms" }}>{mapGate !== null ? "MISSION MAP" : describePos(pos)}</span> ]
            <span aria-hidden style={{ color: T.textDisabled }}> · </span>
            XP{" "}
            <span key={xp} className="sr-xpnum" style={{ color: T.confirmedGreen, fontSize: 15, fontWeight: 600 }}>
              {xp}
            </span>
            {xpPop && (
              <span key={`pop-${xpPop.key}`} className="sr-xppop">
                +{xpPop.amount} XP
              </span>
            )}
          </span>
        </div>
        {/* checklist echo bar: start + 3 skills + boss + report + rewards */}
        <div style={{ display: "flex", gap: 4, padding: "0 18px 10px" }}>
          {["S1", "S2", "S3", "BOSS", "REPORT"].map((seg, i) => {
            const fill = i < done ? 1 : i === done && pos.beat !== "closed" ? 0.45 : pos.beat === "closed" ? 1 : 0;
            const live = i === done && pos.beat !== "closed" && !atStart;
            return (
              <div key={seg} style={{ flex: seg === "BOSS" ? 1.3 : 1, height: 4, background: T.hairline, borderRadius: 2, overflow: "hidden" }}>
                <div className={live ? "sr-seg sr-seg-live" : "sr-seg"} style={{ width: `${fill * 100}%`, height: "100%", background: i === 3 ? T.threatRed : pos.beat === "closed" ? T.clearanceBrass : tone, boxShadow: fill > 0 ? `0 0 8px ${tone}66` : "none" }} />
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 880, margin: "0 auto", padding: "36px 24px 90px" }}>
        {resumeOffer ? (
          <ResumeScene cp={resumeOffer} onResume={resume} onRestart={restart} />
        ) : mapGate !== null ? (
          <MapMomentScene manifest={manifest} pos={pos} stamped={mapGate} xp={xp} audio={audio} onContinue={() => { audio.stamp(); setMapGate(null); }} />
        ) : (
          <div key={JSON.stringify(pos) + String(intro)} className="sr-scene">
            {atStart && <MissionStartScene manifest={manifest} reduced={reduced} onBegin={startMission} />}
            {pos.beat === "cycle" && (
              <CycleScene
                key={`${pos.cycleIndex}-${pos.stage}`}
                cycle={manifest.cycles[pos.cycleIndex]}
                cycleIndex={pos.cycleIndex}
                stage={pos.stage}
                reduced={reduced}
                audio={audio}
                emit={emit}
                onNext={advance}
                voiceOn={voiceOn}
              />
            )}
            {pos.beat === "incident" && (
              <BossScene manifest={manifest} reduced={reduced} audio={audio} emit={emit} onNext={advance} />
            )}
            {pos.beat === "catch" && manifest.catchThem && (
              <CatchThemStage def={manifest.catchThem} actor={manifest.actor.codename} reduced={reduced} audio={audio} emit={emit} onPass={advance} onResit={restart} voiceOn={voiceOn} />
            )}
            {pos.beat === "debrief" && <ReportScene manifest={manifest} reduced={reduced} onNext={advance} />}
            {pos.beat === "closed" && <RewardsScene manifest={manifest} reduced={reduced} audio={audio} emit={emit} xp={xp} onExit={onExit} onNextCase={onNextCase} />}
          </div>
        )}
      </div>

      {/* While WREN is talking, lock out every click in the content (they can't
          tap ahead or trigger another line). The HUD voice toggle sits above
          this (z 2), so muting is always the escape. Auto-clears when she ends. */}
      {speaking && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1, cursor: "default", background: "transparent" }}>
          <div style={{ position: "fixed", bottom: 22, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 10, alignItems: "center", background: "rgba(8,14,26,0.92)", border: `1px solid ${T.arcCyan}55`, borderRadius: 999, padding: "9px 18px", fontFamily: MONO, fontSize: 11.5, letterSpacing: "0.08em", color: T.arcCyan, boxShadow: `0 0 22px ${T.arcCyan}22` }}>
            <TypingDots /> WREN IS SPEAKING
          </div>
        </div>
      )}

      {/* dev tools (event ledger + restart) — hidden in production so kids never see them */}
      {process.env.NODE_ENV !== "production" && (
      <div style={{ position: "fixed", bottom: 14, left: 16, zIndex: 3 }}>
        <button onClick={() => setLedgerOpen((o) => !o)} style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.06em", color: T.textDisabled, background: "transparent", border: `1px solid ${T.hairline}`, borderRadius: 2, padding: "4px 8px", cursor: "pointer" }}>
          EVENT LEDGER (DEV): {events.length}
        </button>
        {ledgerOpen && (
          <div style={{ marginTop: 6, maxHeight: 180, overflowY: "auto", background: T.panel, border: `1px solid ${T.hairline}`, borderRadius: 3, padding: "8px 10px", minWidth: 300 }}>
            {events.map((e) => (
              <div key={eventKey(e)} style={{ fontFamily: MONO, fontSize: 10, lineHeight: 1.8, color: T.textSecondary }}>
                +{xpForEvent(e)} {e.type} <span style={{ color: T.textDisabled }}>{e.sourceKey}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      )}
      {process.env.NODE_ENV !== "production" && !atStart && !resumeOffer && (
        <button onClick={restart} style={{ position: "fixed", bottom: 14, right: 16, zIndex: 3, fontFamily: MONO, fontSize: 10, letterSpacing: "0.06em", color: T.textDisabled, background: "transparent", border: `1px solid ${T.hairline}`, borderRadius: 2, padding: "4px 8px", cursor: "pointer" }}>
          ↺ RESTART CASE (DEV)
        </button>
      )}
    </main>
  );
}

/* =============================================================== scenes */

function ResumeScene({ cp, onResume, onRestart }: { cp: MissionCheckpoint; onResume: () => void; onRestart: () => void }) {
  return (
    <section style={{ maxWidth: 520, margin: "70px auto 0" }}>
      <Eyebrow text="Welcome back" color={T.arcCyan} />
      <h1 style={{ fontFamily: BODY, fontSize: 28, fontWeight: 800, margin: "14px 0 8px" }}>Your case is saved.</h1>
      <p style={{ fontSize: 16, lineHeight: 1.6, color: T.textSecondary, margin: "0 0 22px" }}>
        {cp.pos.beat === "closed" ? "This case is finished. Reopen it for a fresh run." : "Jump back in right where you left off."}
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {cp.pos.beat !== "closed" && <AmberButton label="CONTINUE" onClick={onResume} />}
        <GhostButton label={cp.pos.beat === "closed" ? "PLAY AGAIN" : "START OVER"} onClick={onRestart} />
        {cp.pos.beat === "closed" && <AmberButton label="SEE MY REWARDS" onClick={onResume} />}
      </div>
    </section>
  );
}

/* one screen replaces training brief + transmission + briefing */
function MissionStartScene({ manifest, reduced, onBegin }: { manifest: MissionManifest; reduced: boolean; onBegin: () => void }) {
  const hook = manifest.hook ?? manifest.transmission.lines[0];
  const missionNo = parseInt(manifest.caseNumber.replace(/\D/g, ""), 10) || 1;
  return (
    <section style={{ maxWidth: 880, margin: "0 auto" }}>
      {/* the cold open — cinema first, then the plan */}
      {manifest.scene && (
        <div className="sr-scanin" style={{ position: "relative", borderRadius: 6, overflow: "hidden", border: `1px solid ${T.hairline}`, marginBottom: 18, boxShadow: "0 24px 60px -24px rgba(0,0,0,0.9)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={manifest.scene} alt="" style={{ width: "100%", aspectRatio: "21/8", objectFit: "cover", display: "block", filter: "brightness(1.18) saturate(1.05)" }} />
          <div aria-hidden style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, transparent 38%, ${T.inkBlack}C8 94%), linear-gradient(90deg, ${T.inkBlack}30, transparent 26%)` }} />
          <div style={{ position: "absolute", left: 22, right: 22, bottom: 14, display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
            <div>
              <Eyebrow text={`Mission ${missionNo}`} color={T.arcCyan} />
              <h1 style={{ fontFamily: BODY, fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 800, letterSpacing: "-0.01em", margin: "6px 0 0", textShadow: "0 2px 20px rgba(0,0,0,0.9)" }}>
                <Resolve text={manifest.title} reduced={reduced} />
              </h1>
            </div>
            <span style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.1em", color: T.textSecondary, textShadow: "0 1px 6px rgba(0,0,0,0.9)" }}>
              ABOUT 1 HOUR · SAVES AS YOU GO
            </span>
          </div>
        </div>
      )}
      {!manifest.scene && (
        <h1 style={{ fontFamily: BODY, fontSize: "clamp(30px, 5.4vw, 46px)", fontWeight: 800, letterSpacing: "-0.01em", margin: "0 0 16px", textShadow: `0 0 40px ${T.arcCyan}33` }}>
          <Resolve text={manifest.title} reduced={reduced} />
        </h1>
      )}

      <div style={{ margin: "0 0 18px" }}>
        <Bubble who="wren">{hook}</Bubble>
      </div>

      {/* map + the WANTED card side by side */}
      <div className="sr-two-col" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 250px", gap: 16, alignItems: "start" }}>
        <div className="sr-panel sr-brackets" style={{ border: `1px solid ${T.arcCyan}44`, padding: "18px 20px 20px" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.12em", color: T.textSecondary, marginBottom: 12 }}>
            TODAY&rsquo;S MISSION MAP
          </div>
          <MissionMap manifest={manifest} pos={{ beat: "transmission" }} />
        </div>

        {manifest.actor.portrait && (
          <div style={{ border: `1px solid ${T.threatRed}55`, borderRadius: 4, overflow: "hidden", background: T.panel, boxShadow: `0 0 34px ${T.threatRed}14, 0 14px 30px -16px rgba(0,0,0,0.8)` }}>
            <div className="sr-hazard" style={{ fontFamily: MONO, fontSize: 10, fontWeight: 600, letterSpacing: "0.22em", color: T.threatRed, textAlign: "center", padding: "6px 0", borderBottom: `1px solid ${T.threatRed}44` }}>
              SUSPECT
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={manifest.actor.portrait} alt={`Surveillance photo of ${manifest.actor.codename}`} style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", display: "block", filter: "saturate(0.85)" }} />
            <div style={{ padding: "10px 12px 12px" }}>
              <div style={{ fontFamily: MONO, fontSize: 15, fontWeight: 600, color: T.threatRed }}>{manifest.actor.codename}</div>
              <div style={{ fontSize: 12, lineHeight: 1.5, color: T.textSecondary, marginTop: 4 }}>{manifest.actor.mo}</div>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 22 }}>
        <AmberButton label="START SKILL 1 →" onClick={onBegin} />
      </div>
    </section>
  );
}

/* the map moment between steps */
function MapMomentScene({ manifest, pos, stamped, xp, audio, onContinue }: { manifest: MissionManifest; pos: BeatPos; stamped: number; xp: number; audio: ReturnType<typeof useSignalAudio>; onContinue: () => void }) {
  const done = stepsDone(pos);
  const nextLabel =
    done < 3 ? `NEXT: SKILL ${done + 1} · ${manifest.cycles[done].title}` : done === 3 ? `NEXT: BOSS · ${manifest.incident.title}` : "NEXT: MISSION REPORT";
  useEffect(() => {
    audio.stamp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <section style={{ maxWidth: 660, margin: "0 auto" }}>
      <Eyebrow text={stamped === 3 ? "Boss defeated" : `Skill ${stamped + 1} complete`} color={T.confirmedGreen} />
      <h1 style={{ fontFamily: BODY, fontSize: "clamp(26px, 4.6vw, 38px)", fontWeight: 800, margin: "12px 0 18px" }}>
        {stamped === 3 ? "You beat the boss." : "Nice work. One box down."}
      </h1>
      <div className="sr-panel sr-brackets" style={{ background: `${T.panelRaised}D9`, border: `1px solid ${T.confirmedGreen}44`, padding: "18px 20px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 11, letterSpacing: "0.12em", color: T.textSecondary, marginBottom: 12 }}>
          <span>MISSION MAP</span>
          <span>
            XP SO FAR: <span style={{ color: T.confirmedGreen }}>{xp}</span>
          </span>
        </div>
        <MissionMap manifest={manifest} pos={pos} stampNew={stamped} />
      </div>
      <div style={{ marginTop: 24 }}>
        <AmberButton label={nextLabel + " →"} onClick={onContinue} />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- cycles */

function CycleScene({ cycle, cycleIndex, stage, reduced, audio, emit, onNext, voiceOn }: { cycle: CycleDef; cycleIndex: number; stage: "intel" | "fieldwork" | "checkpoint"; reduced: boolean; audio: ReturnType<typeof useSignalAudio>; emit: (e: AwardEvent) => void; onNext: () => void; voiceOn: boolean }) {
  const stageIndex = stage === "intel" ? 0 : stage === "fieldwork" ? 1 : 2;
  const stageTones = [T.arcCyan, T.actionAmber, T.confirmedGreen];
  return (
    <section>
      <div className="sr-panel sr-brackets" style={{ background: `${T.panelRaised}D9`, border: `1px solid ${stageTones[stageIndex]}44`, padding: "14px 20px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.14em", color: stageTones[stageIndex] }}>
              SKILL {cycleIndex + 1} OF 3
            </div>
            <div style={{ fontFamily: BODY, fontSize: "clamp(17px, 2.6vw, 22px)", fontWeight: 700, margin: "4px 0 2px" }}>{cycle.title}</div>
            <div style={{ fontSize: 13, color: T.textSecondary }}>{cycle.promise ?? cycle.concept}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {(cycle.checkpoint?.questions?.length ? ["LEARN", "PRACTICE", "CHECK"] : ["LEARN", "PRACTICE"]).map((k, i) => {
              const active = i === stageIndex;
              const stageDone = i < stageIndex;
              return (
                <div key={k} style={{ fontFamily: MONO, fontSize: 12, fontWeight: 600, borderRadius: 3, padding: "8px 13px", border: `1px solid ${active ? stageTones[i] : stageDone ? `${T.confirmedGreen}66` : T.hairline}`, background: active ? `${stageTones[i]}14` : "transparent", color: active ? stageTones[i] : stageDone ? T.confirmedGreen : T.textDisabled }}>
                  {stageDone ? "✓ " : ""}
                  {k}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {stage === "intel" && <LearnStage cycle={cycle} cycleIndex={cycleIndex} reduced={reduced} audio={audio} emit={emit} onNext={onNext} voiceOn={voiceOn} />}
      {stage === "fieldwork" && <PlayStage cycle={cycle} cycleIndex={cycleIndex} reduced={reduced} audio={audio} emit={emit} onNext={onNext} voiceOn={voiceOn} />}
      {stage === "checkpoint" && <QuizStage cycle={cycle} cycleIndex={cycleIndex} reduced={reduced} audio={audio} emit={emit} onNext={onNext} />}
    </section>
  );
}

/* ARTIFACT — teach ON the real message. The child taps the suspicious parts
   and the lesson pops on the message itself; nothing is dumped at the end.
   A per-case delivery style, used instead of chat beats when set. */
function ArtifactReveal({ art, voiceOn, reduced, audio, onDone }: {
  art: ArtifactLesson; voiceOn: boolean; reduced: boolean;
  audio: ReturnType<typeof useSignalAudio>; onDone: () => void;
}) {
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [active, setActive] = useState<string | null>(null);
  const total = art.hotspots.length;
  const count = Object.keys(revealed).length;
  const allDone = count >= total;
  const activeHs = art.hotspots.find((h) => h.id === active) ?? null;
  const speaking = useWrenSpeaking(); // lock taps while WREN is explaining

  useEffect(() => {
    if (voiceOn && art.introAudio) playWren(art.introAudio, true);
    return () => stopWren();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tap = (hid: string) => {
    if (speaking) return; // can't tap another part until she's finished this one
    const hs = art.hotspots.find((h) => h.id === hid);
    if (!hs) return;
    setActive(hid);
    setRevealed((r) => {
      if (r[hid]) return r;
      const n = { ...r, [hid]: true };
      if (Object.keys(n).length >= total) audio.stamp(); else audio.latch();
      return n;
    });
    if (voiceOn && hs.audio) playWren(hs.audio, true);
  };

  return (
    <section>
      {/* bold YOUR MISSION banner (#5) */}
      <div style={{ display: "flex", gap: 13, alignItems: "center", background: `${T.actionAmber}18`, border: `1px solid ${T.actionAmber}66`, borderLeft: `4px solid ${T.actionAmber}`, borderRadius: 6, padding: "14px 18px", marginBottom: 16 }}>
        <span aria-hidden style={{ flexShrink: 0, display: "grid", placeItems: "center", width: 28, height: 28, borderRadius: "50%", border: `2px solid ${T.actionAmber}`, color: T.actionAmber, fontFamily: MONO, fontSize: 15, fontWeight: 800 }}>!</span>
        <div>
          <div style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.16em", color: T.actionAmber, marginBottom: 3 }}>YOUR MISSION</div>
          <div style={{ fontFamily: BODY, fontSize: 16, fontWeight: 700, lineHeight: 1.45, color: T.textPrimary }}>{art.intro}</div>
        </div>
      </div>

      {/* the real message */}
      <div style={{ background: T.paper, border: `1px solid ${T.hairline}`, borderRadius: 6, overflow: "hidden" }}>
        {art.device && (
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", color: T.fileInk, background: "rgba(0,0,0,0.05)", padding: "8px 14px", borderBottom: `1px solid ${T.hairline}` }}>
            <span>{art.device.app}</span><span>{art.device.owner}</span>
          </div>
        )}
        <div style={{ padding: "16px 18px", display: "grid", gap: 9, fontSize: 15.5, lineHeight: 1.7, color: T.fileInk }}>
          {art.segments.map((s) => {
            if (!s.hotspotId) return <div key={s.id} style={{ fontFamily: s.mono ? MONO : BODY }}>{s.text}</div>;
            const isR = revealed[s.hotspotId];
            const isA = active === s.hotspotId;
            return (
              <button key={s.id} onClick={() => tap(s.hotspotId!)} className="sr-btn" disabled={speaking && !isR} style={{
                justifySelf: "start", textAlign: "left", fontFamily: s.mono ? MONO : BODY, fontSize: "inherit", color: T.fileInk,
                background: isR ? `${T.threatRed}22` : `${T.actionAmber}22`,
                border: `2px ${isR ? "solid" : "dashed"} ${isR ? T.threatRed : T.actionAmber}`,
                borderRadius: 6, padding: "7px 12px", cursor: speaking ? "default" : "pointer",
                opacity: speaking && !isR ? 0.5 : 1,
                boxShadow: isA ? `0 0 0 3px ${T.actionAmber}44` : "none",
              }}>
                {s.text}{isR ? "  ✓" : ""}
              </button>
            );
          })}
        </div>
      </div>

      {/* progress + the lesson callout */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "14px 0 10px" }}>
        <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.06em", color: allDone ? T.confirmedGreen : T.textSecondary }}>
          {count} of {total} tricks uncovered
        </span>
        <span style={{ display: "flex", gap: 5 }}>
          {art.hotspots.map((h) => <span key={h.id} style={{ width: 9, height: 9, borderRadius: "50%", background: revealed[h.id] ? T.confirmedGreen : T.hairline, boxShadow: revealed[h.id] ? `0 0 6px ${T.confirmedGreen}88` : "none" }} />)}
        </span>
      </div>

      {activeHs ? (
        <div style={{ borderLeft: `3px solid ${T.threatRed}`, background: `${T.threatRed}0E`, borderRadius: "0 6px 6px 0", padding: "14px 16px" }}>
          <div style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em", color: T.threatRed, marginBottom: 6 }}>{activeHs.label.toUpperCase()}</div>
          <div style={{ fontSize: 15, lineHeight: 1.6, color: T.textPrimary }}>{activeHs.reveal}</div>
        </div>
      ) : (
        <div style={{ fontFamily: MONO, fontSize: 13, color: T.textSecondary, padding: "8px 4px" }}>Tap a highlighted part of the message to find out why it's a trick.</div>
      )}

      {allDone && (
        <div style={{ marginTop: 18 }}>
          <Bubble who="wren" tone={T.confirmedGreen}>{art.doneLine}</Bubble>
          <div style={{ marginTop: 14 }}>
            {speaking ? (
              <span style={{ display: "inline-flex", gap: 10, alignItems: "center", fontFamily: MONO, fontSize: 11.5, letterSpacing: "0.08em", color: T.textDisabled }}>
                <TypingDots /> WREN IS SPEAKING...
              </span>
            ) : (
              <AmberButton label="I'VE GOT IT →" onClick={() => { audio.click(); stopWren(); onDone(); }} />
            )}
          </div>
        </div>
      )}
    </section>
  );
}

/* LEARN — tap-to-continue dialogue (law 8: the kid sets the pace) */
function LearnStage({ cycle, cycleIndex, reduced, audio, emit, onNext, voiceOn }: { cycle: CycleDef; cycleIndex: number; reduced: boolean; audio: ReturnType<typeof useSignalAudio>; emit: (e: AwardEvent) => void; onNext: () => void; voiceOn: boolean }) {
  const p = cycle.intel.prediction;
  const beats = cycle.intel.beats;
  const beatAudio = cycle.intel.beatAudio;
  // Narrator-led: WREN reads each beat and the lesson auto-advances as the clip
  // ends. Falls back to silent tap-through when there's no VO, voice is off, or
  // reduced-motion is on (a tap always advances too).
  const narrated = !!beatAudio && voiceOn && !reduced;
  const predAudio = cycle.intel.predictionAudio;
  const [shown, setShown] = useState(reduced ? beats.length : 1);
  const [replies, setReplies] = useState<{ text: string; ok: boolean; response: string }[]>([]);
  const [hintShown, setHintShown] = useState(false);
  const settled = replies.some((r) => r.ok);
  const beatsDone = shown >= beats.length;
  // Force reading: a per-beat timer (scaled to the beat's length) must pass
  // before the next beat can be revealed, so kids can't machine-gun through.
  // Deliberately slow (~450ms/word, 3.5-9s) so they actually read it.
  const readMs = (t: string) => Math.min(9000, Math.max(3500, Math.round((t.trim().split(/\s+/).filter(Boolean).length || 1) * 450)));
  const [ready, setReady] = useState(reduced);
  // Delivery: teach ON the real message (artifact) when set, else chat beats.
  const artifact = cycle.intel.artifact;
  const [artifactDone, setArtifactDone] = useState(false);
  const taught = artifact ? artifactDone : beatsDone;
  // Structure v2: no mid-lesson "your call". When there's no prediction, the
  // lesson is done as soon as it's been taught, and goes straight to PRACTICE.
  const lessonDone = taught && (!p || settled);
  // Anti-brute-force (#4): a wrong "your call" pick locks the options for a
  // few seconds and tells them to read it again, so they can't spam to green.
  const [retryLock, setRetryLock] = useState(false);

  // Play the current beat's clip; when it finishes, reveal the next one.
  useEffect(() => {
    if (!narrated) {
      stopWren(); // cut any bookend VO bleeding in from the transmission
      return;
    }
    const clip = beatAudio?.[shown - 1];
    if (!clip) {
      stopWren();
      return;
    }
    let cancelled = false;
    playWren(clip, true, () => {
      if (cancelled) return;
      if (shown < beats.length) {
        setShown((s) => Math.min(beats.length, s + 1));
      } else if (predAudio?.question) {
        // Last beat finished — WREN asks the "your call" question out loud.
        playWren(predAudio.question, true);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, narrated]);
  // Silence WREN when leaving LEARN (e.g. into PLAY).
  useEffect(() => () => stopWren(), []);
  // Gate advancing whenever a new beat appears. Voice ON: the narrator paces it
  // and auto-advances when the clip ends — no early skip; a long safety fallback
  // only re-enables a manual tap if the audio can't play. Voice OFF: a slow
  // read-timer makes them actually read the message first.
  useEffect(() => {
    if (reduced || beatsDone) { setReady(true); return; }
    setReady(false);
    const t = setTimeout(() => setReady(true), narrated ? 15000 : readMs(beats[shown - 1] ?? ""));
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, reduced, beatsDone, narrated]);

  const more = () => {
    if (!ready) return;
    audio.click();
    setShown((s) => Math.min(beats.length, s + 1));
  };

  const choose = (i: number) => {
    if (!p) return;
    if (retryLock || settled || replies.some((r) => r.text === p.options[i])) return;
    const ok = i === p.answer;
    setReplies((r) => [...r, { text: p.options[i], ok, response: ok ? p.right : p.wrong }]);
    if (ok) audio.latch();
    else {
      audio.thud();
      setRetryLock(true); // make them stop and re-read before trying again
      setTimeout(() => setRetryLock(false), 5000);
    }
    // WREN reacts out loud to what they picked.
    if (voiceOn && !reduced) {
      const rc = ok ? predAudio?.right : predAudio?.wrong;
      if (rc) playWren(rc, true);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      {artifact && !artifactDone ? (
        <ArtifactReveal art={artifact} voiceOn={voiceOn} reduced={reduced} audio={audio} onDone={() => setArtifactDone(true)} />
      ) : (
      <div style={{ display: "grid", gap: 14 }}>
        {!artifact && beats.slice(0, shown).map((b, i) => (
          <Bubble key={i} who="wren">
            {b}
          </Bubble>
        ))}

        {!artifact && !beatsDone && (ready ? (
          <button onClick={more} className="sr-btn sr-choice" style={{ justifySelf: "start", display: "flex", gap: 10, alignItems: "center", background: T.panel, border: `1px solid ${T.arcCyan}55`, borderRadius: 12, padding: "10px 16px", cursor: "pointer", color: T.arcCyan, fontFamily: MONO, fontSize: 12.5, letterSpacing: "0.06em" }}>
            <TypingDots /> TAP FOR MORE
          </button>
        ) : narrated ? (
          <div style={{ justifySelf: "start", display: "flex", gap: 10, alignItems: "center", color: T.textDisabled, fontFamily: MONO, fontSize: 11.5, letterSpacing: "0.08em" }} aria-label="WREN is speaking">
            <TypingDots /> WREN IS SPEAKING...
          </div>
        ) : (
          <div style={{ justifySelf: "start", display: "flex", flexDirection: "column", gap: 7, width: 210 }} aria-label="read the message">
            <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: T.arcCyan }}>READ THE MESSAGE...</span>
            <span style={{ display: "block", height: 4, borderRadius: 2, background: T.hairline, overflow: "hidden" }}>
              <span key={shown} style={{ display: "block", height: "100%", background: T.arcCyan, transformOrigin: "left", transform: "scaleX(0)", animation: `sr-read ${readMs(beats[shown - 1] ?? "")}ms linear forwards` }} />
            </span>
          </div>
        ))}

        {taught && p && (
          <Bubble who="wren" tone={T.actionAmber}>
            <span style={{ display: "block", fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.12em", color: T.actionAmber, marginBottom: 6 }}>
              YOUR CALL
            </span>
            {p.question}
          </Bubble>
        )}

        {/* Optional guided help before answering */}
        {taught && p && !settled && p.hint && (
          hintShown ? (
            <Bubble who="wren" tone={T.arcCyan}>
              <span style={{ display: "block", fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.12em", color: T.arcCyan, marginBottom: 6 }}>HINT</span>
              {p.hint}
            </Bubble>
          ) : (
            <button
              onClick={() => { audio.click(); setHintShown(true); }}
              className="sr-btn"
              style={{ justifySelf: "start", background: `${T.arcCyan}14`, border: `1.5px solid ${T.arcCyan}88`, borderRadius: 10, padding: "10px 16px", cursor: "pointer", color: T.arcCyan, fontFamily: MONO, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", boxShadow: `0 0 14px ${T.arcCyan}22` }}
            >
              NEED A HINT?
            </button>
          )
        )}

        {replies.map((r, i) => (
          <div key={i} style={{ display: "grid", gap: 14 }}>
            <div className="sr-msg" style={{ display: "flex", gap: 12, flexDirection: "row-reverse", alignItems: "flex-end" }}>
              <Face who="you" />
              <div style={{ maxWidth: "78%", background: r.ok ? `${T.confirmedGreen}12` : `${T.threatRed}10`, border: `1px solid ${r.ok ? T.confirmedGreen : T.threatRed}88`, borderRadius: "14px 14px 3px 14px", padding: "12px 16px", fontSize: 16, lineHeight: 1.6 }}>
                {r.text}
              </div>
            </div>
            <Bubble who="wren" tone={r.ok ? T.confirmedGreen : undefined}>
              {r.response}
            </Bubble>
          </div>
        ))}

        {taught && p && !settled && (retryLock ? (
          <div style={{ justifySelf: "end", display: "flex", flexDirection: "column", gap: 7, width: 230, alignItems: "flex-end" }} aria-label="read it again">
            <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", color: T.threatRed }}>READ IT AGAIN, THEN TRY...</span>
            <span style={{ display: "block", width: "100%", height: 4, borderRadius: 2, background: T.hairline, overflow: "hidden" }}>
              <span key={replies.length} style={{ display: "block", height: "100%", background: T.threatRed, transformOrigin: "left", transform: "scaleX(0)", animation: "sr-read 5000ms linear forwards" }} />
            </span>
          </div>
        ) : (
          <div className="sr-msg" style={{ display: "grid", gap: 10, justifyItems: "end" }}>
            {p.options.map((o, i) =>
              replies.some((r) => r.text === o) ? null : (
                <button key={o} onClick={() => choose(i)} className="sr-btn sr-choice" style={{ textAlign: "right", fontSize: 15.5, lineHeight: 1.55, color: T.actionAmber, background: `${T.actionAmber}0A`, border: `1px solid ${T.actionAmber}55`, borderRadius: "14px 14px 3px 14px", padding: "13px 17px", cursor: "pointer", maxWidth: "82%" }}>
                  {o}
                </button>
              ),
            )}
          </div>
        ))}
      </div>
      )}

      {lessonDone && (
        <div className="sr-msg" style={{ marginTop: 22 }}>
          <AmberButton
            label="PRACTICE IT →"
            onClick={() => {
              emit({ type: "INTEL_COMPLETED", sourceKey: `cycle-${cycleIndex}` });
              onNext();
            }}
          />
        </div>
      )}
    </div>
  );
}

/* PLAY — instruction strip + one focal zone (mechanics render below) */
function PlayStage({ cycle, cycleIndex, reduced, audio, emit, onNext, voiceOn }: { cycle: CycleDef; cycleIndex: number; reduced: boolean; audio: ReturnType<typeof useSignalAudio>; emit: (e: AwardEvent) => void; onNext: () => void; voiceOn: boolean }) {
  const fw = cycle.fieldwork;
  const instruction = cycle.instruction ?? fw.payload.intro;
  // WREN explains the challenge once when PLAY opens (#4), then hands over.
  useEffect(() => {
    if (cycle.playAudio && voiceOn) playWren(cycle.playAudio, true);
    else stopWren();
    return () => stopWren();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handle = (e: { kind: string; mastery?: boolean }) => {
    if (e.kind === "COMPLETED") {
      emit({ type: "FIELDWORK_COMPLETED", sourceKey: `cycle-${cycleIndex}`, mastery: !!e.mastery });
      onNext();
    }
  };
  const props = { reduced, audio, onEvent: handle } as const;
  return (
    <div>
      {/* the instruction strip — the only amber text on screen */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, background: `${T.actionAmber}12`, border: `1px solid ${T.actionAmber}66`, borderRadius: 4, padding: "13px 16px", marginBottom: 16 }}>
        <span aria-hidden style={{ fontFamily: MONO, fontSize: 16, color: T.actionAmber }}>▶</span>
        <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 600, color: T.actionAmber, letterSpacing: "0.02em" }}>{instruction}</span>
      </div>
      {fw.verb === "INSPECT" && <Inspect payload={fw.payload} {...props} />}
      {fw.verb === "DECIDE" && <Decide payload={fw.payload} {...props} />}
      {fw.verb === "TRACE" && <Trace payload={fw.payload} {...props} />}
      {fw.verb === "PROFILE" && <Profile payload={fw.payload} {...props} />}
      {fw.verb === "SIMULATE" && <Simulate payload={fw.payload} {...props} />}
      {fw.verb === "BUILD" && <Build payload={fw.payload} {...props} />}
      {fw.verb === "CIPHER" && <Cipher payload={fw.payload} {...props} />}
      {fw.verb === "SORT" && <Sort payload={fw.payload} {...props} />}
      {fw.verb === "METER" && <Meter payload={fw.payload} {...props} />}
      {fw.verb === "REDACT" && <Redact payload={fw.payload} {...props} />}
    </div>
  );
}

/* SKILL CHECK — blind, must-pass gate. Four options, no right/wrong shown per
   question; the next skill stays locked until EVERY answer is right. A miss
   re-teaches this skill (replays its beats) and sends him back through the
   check. No tapping-until-green. */
/** An advance button that stays locked for a few seconds so the child actually
 *  reviews what's on screen before moving on (a filling bar shows the wait). */
function GatedButton({ label, onClick, delayMs = 3500, note = "TAKE A MOMENT TO REVIEW..." }: { label: string; onClick: () => void; delayMs?: number; note?: string }) {
  const [ready, setReady] = useState(delayMs <= 0);
  useEffect(() => {
    if (delayMs <= 0) return;
    const t = setTimeout(() => setReady(true), delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);
  if (ready) return <AmberButton label={label} onClick={onClick} />;
  return (
    <div style={{ display: "inline-flex", flexDirection: "column", gap: 7, minWidth: 230 }} aria-label="review time">
      <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", color: T.textSecondary }}>{note}</span>
      <span style={{ display: "block", height: 4, borderRadius: 2, background: T.hairline, overflow: "hidden" }}>
        <span style={{ display: "block", height: "100%", background: T.confirmedGreen, transformOrigin: "left", transform: "scaleX(0)", animation: `sr-read ${delayMs}ms linear forwards` }} />
      </span>
    </div>
  );
}

/** Shuffle a question's options so the correct answer isn't in a predictable
 *  slot; returns the reordered options with the remapped answer index. */
function shuffleQ<Q extends { options: string[]; answer: number }>(q: Q): Q {
  const order = q.options.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return { ...q, options: order.map((i) => q.options[i]), answer: order.indexOf(q.answer) };
}

function QuizStage({ cycle, cycleIndex, reduced, audio, emit, onNext }: { cycle: CycleDef; cycleIndex: number; reduced: boolean; audio: ReturnType<typeof useSignalAudio>; emit: (e: AwardEvent) => void; onNext: () => void }) {
  const questions = cycle.checkpoint?.questions ?? [];
  const [phase, setPhase] = useState<"check" | "reteach" | "passed">("check");
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const q = questions[idx];

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    setAnswers((a) => { const n = [...a]; n[idx] = i; return n; });
    audio.click(); // blind — never reveal right/wrong as you go
  };

  const next = () => {
    if (picked === null) return;
    if (idx + 1 < questions.length) { setIdx(idx + 1); setPicked(null); audio.click(); return; }
    const allRight = questions.every((qq, i) => (i === idx ? picked : answers[i]) === qq.answer);
    if (allRight) {
      setPhase("passed"); audio.stamp();
      emit({
        type: "CHECKPOINT_PASSED",
        sourceKey: `cycle-${cycleIndex}`,
        evidence: questions.map((qq, i) => ({ questionId: qq.id, answerIndex: (i === idx ? picked : answers[i]) ?? -1, attempts: 1 })),
      });
    } else {
      setPhase("reteach"); audio.thud();
    }
  };

  const retry = () => { audio.click(); setAnswers([]); setIdx(0); setPicked(null); setPhase("check"); };

  if (phase === "reteach") {
    return (
      <section style={{ maxWidth: 640, margin: "0 auto" }}>
        <Eyebrow text={`Not yet · ${cycle.title}`} color={T.actionAmber} />
        <div style={{ display: "grid", gap: 12, margin: "14px 0 22px" }}>
          <Bubble who="wren" tone={T.actionAmber}>Not quite. Let's go over it once more, and this time listen for the answers.</Bubble>
          {cycle.intel.beats.map((b, i) => (<Bubble key={i} who="wren">{b}</Bubble>))}
        </div>
        <AmberButton label="TRY THE CHECK AGAIN →" onClick={retry} />
      </section>
    );
  }

  if (phase === "passed") {
    return (
      <section style={{ maxWidth: 620, margin: "0 auto", position: "relative", textAlign: "center" }}>
        <StampMark text="PASSED" visible reduced={reduced} color={T.confirmedGreen} style={{ position: "absolute", top: -8, right: 8 }} />
        <Eyebrow text="Skill check passed" color={T.confirmedGreen} />
        <p style={{ fontFamily: MONO, fontSize: 16, color: T.confirmedGreen, margin: "14px 0 20px" }}>
          All {questions.length} right. Skill {cycleIndex + 1} locked in.
        </p>
        <AmberButton label="NEXT →" onClick={onNext} />
      </section>
    );
  }

  // phase "check" — blind, four options, must get every one right
  const answered = picked !== null;
  return (
    <section style={{ maxWidth: 680, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <Eyebrow text={`Skill check · question ${idx + 1} of ${questions.length}`} color={T.confirmedGreen} />
        <span style={{ display: "flex", gap: 6 }} aria-label={`question ${idx + 1} of ${questions.length}`}>
          {questions.map((_, i) => {
            const done = answers[i] != null || (i === idx && answered);
            const col = done ? T.confirmedGreen : i === idx ? T.actionAmber : T.hairline;
            return <span key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: col, boxShadow: col !== T.hairline ? `0 0 8px ${col}88` : "none" }} />;
          })}
        </span>
      </div>
      <div style={{ background: T.panel, border: `1px solid ${T.hairline}`, borderRadius: 4, padding: "18px 20px" }}>
        <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: T.textPrimary }}>{q.question}</p>
      </div>
      <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
        {q.options.map((o, i) => {
          const isPick = picked === i;
          return (
            <button key={i} onClick={() => pick(i)} className="sr-btn" disabled={answered}
              style={{
                textAlign: "left", fontFamily: MONO, fontSize: 14, lineHeight: 1.5,
                color: isPick ? T.arcCyan : T.textPrimary, background: isPick ? `${T.arcCyan}14` : T.panelRaised,
                border: `1.5px solid ${isPick ? T.arcCyan : T.hairline}`, borderRadius: 6, padding: "13px 16px",
                cursor: answered ? "default" : "pointer", opacity: answered && !isPick ? 0.5 : 1,
              }}>
              {o}
            </button>
          );
        })}
      </div>
      {answered && (
        <div style={{ marginTop: 16 }}>
          <AmberButton label={idx + 1 < questions.length ? "NEXT QUESTION →" : "FINISH THE CHECK →"} onClick={next} />
        </div>
      )}
    </section>
  );
}

/* --------------------------------------------------------- case test */

/**
 * CASE TEST — the must-pass end-of-case exam. The child answers every
 * question BLIND: no right/wrong is shown per question. At the end they see
 * only their score. `def.pass` or more closes the case; below it, they must
 * resit the WHOLE case, and are never told which questions they missed.
 */
function CatchThemStage({ def, actor, reduced, audio, emit, onPass, onResit, voiceOn }: {
  def: CatchThemDef; actor: string; reduced: boolean;
  audio: ReturnType<typeof useSignalAudio>; emit: (e: AwardEvent) => void;
  onPass: () => void; onResit: () => void; voiceOn: boolean;
}) {
  // Shuffle options once (correct answer not always first), and keep fresh order.
  const [scenarios] = useState(() => def.scenarios.map(shuffleQ));
  const [phase, setPhase] = useState<"intro" | "test" | "passed" | "failed">("intro");
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const s = scenarios[idx];
  const score = scenarios.reduce((n, sc, i) => n + (answers[i] === sc.answer ? 1 : 0), 0);

  const begin = () => { audio.click(); setPhase("test"); };

  // Change your answer freely until you press NEXT; nothing is revealed as you go.
  const pick = (i: number) => {
    setPicked(i);
    setAnswers((a) => { const n = [...a]; n[idx] = i; return n; });
    audio.click();
  };

  const next = () => {
    if (picked === null) return;
    if (idx + 1 < scenarios.length) { setIdx(idx + 1); setPicked(null); audio.click(); return; }
    // last question answered — tally (current pick may not be flushed into answers yet)
    const got = scenarios.reduce((n, sc, i) => n + ((i === idx ? picked : answers[i]) === sc.answer ? 1 : 0), 0);
    if (got >= def.pass) {
      setPhase("passed"); audio.stamp();
      emit({ type: "CHECKPOINT_PASSED", sourceKey: "case-test", evidence: [] });
      if (voiceOn && def.voice?.pass) playWren(def.voice.pass, true);
    } else {
      setPhase("failed"); audio.thud();
      if (voiceOn && def.voice?.fail) playWren(def.voice.fail, true);
    }
  };

  useEffect(() => {
    if (phase === "intro" && voiceOn && def.voice?.intro) playWren(def.voice.intro, true);
    return () => stopWren();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === "intro") {
    return (
      <section style={{ maxWidth: 620, margin: "0 auto", textAlign: "center" }}>
        <Eyebrow text="Final step · the test" color={T.arcCyan} />
        <h1 style={{ fontFamily: BODY, fontSize: "clamp(26px, 4.5vw, 40px)", fontWeight: 800, margin: "12px 0 18px" }}>
          Time for the Test
        </h1>
        <div style={{ textAlign: "left", marginBottom: 22 }}>
          <Bubble who="wren" tone={T.arcCyan}>{def.intro}</Bubble>
        </div>
        <p style={{ fontFamily: MONO, fontSize: 13, color: T.textSecondary, marginBottom: 20 }}>
          {scenarios.length} questions. Get {def.pass} right to close the case. Miss it and you sit the whole case again.
        </p>
        <AmberButton label="START THE TEST →" onClick={begin} />
      </section>
    );
  }

  if (phase === "passed") {
    return (
      <section style={{ maxWidth: 660, margin: "0 auto", textAlign: "center", position: "relative" }}>
        <StampMark text="PASSED" visible reduced={reduced} color={T.confirmedGreen} style={{ position: "absolute", top: -6, right: 8 }} />
        <Eyebrow text="Test passed" color={T.confirmedGreen} />
        <h1 style={{ fontFamily: BODY, fontSize: "clamp(26px, 4.5vw, 40px)", fontWeight: 800, margin: "12px 0 14px", color: T.confirmedGreen }}>
          You Passed
        </h1>
        <p style={{ fontFamily: MONO, fontSize: 18, fontWeight: 700, color: T.textPrimary, marginBottom: 16 }}>
          You scored {score} out of {scenarios.length}.
        </p>
        <div style={{ textAlign: "left", margin: "0 0 16px" }}>
          <Bubble who="wren" tone={T.confirmedGreen}>
            That's the real thing, Agent. You earned this yourself. Now here's how each one went.
          </Bubble>
        </div>
        {/* feedback AFTER passing — never during the test */}
        <div style={{ display: "grid", gap: 10, textAlign: "left", marginBottom: 22 }}>
          {scenarios.map((sc, i) => {
            const gotIt = answers[i] === sc.answer;
            return (
              <div key={sc.id} style={{ background: T.panel, border: `1px solid ${(gotIt ? T.confirmedGreen : T.threatRed)}55`, borderLeft: `3px solid ${gotIt ? T.confirmedGreen : T.threatRed}`, borderRadius: 4, padding: "12px 14px" }}>
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: T.textSecondary }}>{sc.prompt}</p>
                <p style={{ margin: "8px 0 0", fontFamily: MONO, fontSize: 13, color: T.confirmedGreen }}>✓ {sc.options[sc.answer]}</p>
                {!gotIt && (
                  <p style={{ margin: "4px 0 0", fontFamily: MONO, fontSize: 12.5, color: T.threatRed }}>You put: {sc.options[answers[i]] ?? "nothing"}</p>
                )}
              </div>
            );
          })}
        </div>
        <GatedButton label="CLOSE THE CASE →" onClick={onPass} delayMs={4000} note="LOOK OVER YOUR ANSWERS..." />
      </section>
    );
  }

  if (phase === "failed") {
    return (
      <section style={{ maxWidth: 620, margin: "0 auto", textAlign: "center" }}>
        <Eyebrow text="Not this time" color={T.actionAmber} />
        <h1 style={{ fontFamily: BODY, fontSize: "clamp(26px, 4.5vw, 40px)", fontWeight: 800, margin: "12px 0 14px", color: T.actionAmber }}>
          Not Quite Yet
        </h1>
        <p style={{ fontFamily: MONO, fontSize: 18, fontWeight: 700, color: T.textPrimary, marginBottom: 6 }}>
          You scored {score} out of {scenarios.length}.
        </p>
        <p style={{ fontFamily: MONO, fontSize: 13, color: T.textSecondary, marginBottom: 18 }}>
          You needed {def.pass} to pass.
        </p>
        <div style={{ textAlign: "left", margin: "0 0 22px" }}>
          <Bubble who="wren" tone={T.actionAmber}>
            Close, but not there yet. Run the case again and it'll stick. No shortcuts, that's how you really learn it.
          </Bubble>
        </div>
        <AmberButton label="RESIT THE CASE →" onClick={onResit} />
      </section>
    );
  }

  // phase === "test" — questions answered blind, no right/wrong shown
  const answered = picked !== null;
  return (
    <section style={{ maxWidth: 680, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <Eyebrow text={`The test · question ${idx + 1} of ${scenarios.length}`} color={T.arcCyan} />
        <span style={{ display: "flex", gap: 6 }} aria-label={`question ${idx + 1} of ${scenarios.length}`}>
          {scenarios.map((_, i) => {
            const isAnswered = answers[i] != null || (i === idx && answered);
            const col = isAnswered ? T.arcCyan : i === idx ? T.actionAmber : T.hairline;
            return <span key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: col, boxShadow: col !== T.hairline ? `0 0 8px ${col}88` : "none" }} />;
          })}
        </span>
      </div>

      <div style={{ background: T.panel, border: `1px solid ${T.hairline}`, borderRadius: 4, padding: "18px 20px" }}>
        <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: T.textPrimary }}>{s.prompt}</p>
        {s.evidence && (
          <p style={{ margin: "12px 0 0", fontFamily: MONO, fontSize: 13.5, color: T.arcCyan, background: T.inkBlack, border: `1px solid ${T.hairline}`, borderRadius: 3, padding: "10px 12px", wordBreak: "break-all" }}>
            {s.evidence}
          </p>
        )}
      </div>

      <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
        {s.options.map((o, i) => {
          const isPick = picked === i;
          return (
            <button
              key={i}
              onClick={() => pick(i)}
              className="sr-btn"
              aria-pressed={isPick}
              style={{
                textAlign: "left", fontFamily: MONO, fontSize: 14, lineHeight: 1.5,
                color: isPick ? T.arcCyan : T.textPrimary,
                background: isPick ? `${T.arcCyan}22` : T.panelRaised,
                border: `1.5px solid ${isPick ? T.arcCyan : T.hairline}`,
                borderRadius: 6, padding: "13px 16px", cursor: "pointer",
                boxShadow: isPick ? `0 0 0 2px ${T.arcCyan}33` : `inset 0 1px 0 rgba(255,255,255,0.05)`,
              }}
            >
              {o}
            </button>
          );
        })}
      </div>

      {answered && (
        <div style={{ marginTop: 16 }}>
          <AmberButton label={idx + 1 < scenarios.length ? "NEXT QUESTION →" : "FINISH THE TEST →"} onClick={next} />
        </div>
      )}
    </section>
  );
}

/* ---------------------------------------------------------------- boss */

function BossScene({ manifest, reduced, audio, emit, onNext }: { manifest: MissionManifest; reduced: boolean; audio: ReturnType<typeof useSignalAudio>; emit: (e: AwardEvent) => void; onNext: () => void }) {
  const Incident = manifest.incident.component;
  const [started, setStarted] = useState(false);
  const [complete, setComplete] = useState(false);
  const phaseNames = manifest.incident.phaseNames ?? Array.from({ length: manifest.incident.phases }, (_, i) => `PHASE ${i + 1}`);

  if (!started) {
    return (
      <section style={{ maxWidth: 640, margin: "0 auto" }}>
        {!reduced && <div className="sr-alert-edge" aria-hidden />}
        <Eyebrow text="Boss: live case" color={T.threatRed} />
        <h1 style={{ fontFamily: BODY, fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 800, letterSpacing: "-0.01em", margin: "12px 0 16px", textShadow: `0 0 40px ${T.threatRed}33` }}>
          <Resolve text={manifest.incident.title} reduced={reduced} />
        </h1>
        <div className="sr-panel sr-brackets" style={{ background: `${T.panelRaised}D9`, border: `1px solid ${T.threatRed}44`, padding: "18px 20px 20px" }}>
          <div style={{ display: "flex", gap: 18, alignItems: "center", marginBottom: 16 }}>
            {manifest.actor.portrait && (
              <div className={reduced ? undefined : "sr-takeover"} style={{ position: "relative", flexShrink: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={manifest.actor.portrait} alt={manifest.actor.codename} style={{ width: 118, height: 148, objectFit: "cover", borderRadius: 4, border: `2px solid ${T.threatRed}88`, boxShadow: `0 0 30px ${T.threatRed}44` }} />
                <span aria-hidden className="sr-blink" style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: "50%", background: T.threatRed, boxShadow: `0 0 10px ${T.threatRed}` }} />
              </div>
            )}
            <div>
              <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.12em", color: T.threatRed }}>
                {manifest.actor.codename} IS LIVE
              </div>
              <div style={{ fontSize: 15, lineHeight: 1.6, color: T.textSecondary, marginTop: 6 }}>
                Use your 3 skills. Beat the phases. No timer. Think, then act.
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {phaseNames.map((n, i) => (
              <div key={n} style={{ display: "flex", gap: 12, alignItems: "center", fontFamily: MONO, fontSize: 13, color: T.textSecondary }}>
                <span style={{ display: "grid", placeItems: "center", width: 26, height: 26, borderRadius: 3, border: `1px solid ${T.threatRed}66`, color: T.threatRed, fontSize: 12 }}>
                  {i + 1}
                </span>
                {n}
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 24 }}>
          <AmberButton label="FIGHT →" onClick={() => { audio.click(); setStarted(true); }} />
        </div>
      </section>
    );
  }

  return (
    <section>
      {!complete && !reduced && <div className="sr-alert-edge" aria-hidden />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18, flexWrap: "wrap", gap: 8 }}>
        <Eyebrow text={`Boss: ${manifest.incident.title}`} color={T.threatRed} />
        <span style={{ fontFamily: MONO, fontSize: 11, color: T.threatRed, letterSpacing: "0.1em" }}>
          <span className="sr-blink" style={{ marginRight: 6 }}>●</span>LIVE
        </span>
      </div>
      {!complete ? (
        <Incident
          reduced={reduced}
          audio={audio}
          onPhaseCleared={(phase) => emit({ type: "INCIDENT_PHASE_CLEARED", sourceKey: `phase-${phase}` })}
          onComplete={() => setComplete(true)}
        />
      ) : (
        <div style={{ maxWidth: 560 }}>
          <p style={{ fontFamily: MONO, fontSize: 14, letterSpacing: "0.06em", color: T.confirmedGreen, margin: 0 }}>
            BOSS DOWN. {manifest.actor.codename} just lost this one.
          </p>
          <div style={{ marginTop: 18 }}>
            <AmberButton label="BACK TO THE MAP →" onClick={onNext} />
          </div>
        </div>
      )}
    </section>
  );
}

/* -------------------------------------------------------------- report */

function ReportScene({ manifest, reduced, onNext }: { manifest: MissionManifest; reduced: boolean; onNext: () => void }) {
  return (
    <section style={{ maxWidth: 640 }}>
      <Eyebrow text="Mission report" color={T.confirmedGreen} />
      <h1 style={{ fontFamily: BODY, fontSize: "clamp(26px, 4.6vw, 38px)", fontWeight: 800, margin: "12px 0 18px" }}>You learned 3 skills today.</h1>
      <div style={{ display: "grid", gap: 10, marginBottom: 18 }}>
        {manifest.cycles.map((c, i) => (
          <div key={c.id} style={{ display: "flex", gap: 14, alignItems: "center", background: `${T.confirmedGreen}0A`, border: `1px solid ${T.confirmedGreen}55`, borderRadius: 4, padding: "13px 16px" }}>
            <span style={{ display: "grid", placeItems: "center", minWidth: 32, height: 32, borderRadius: 3, background: T.confirmedGreen, color: T.inkBlack, fontFamily: MONO, fontSize: 15, fontWeight: 600 }}>
              ✓
            </span>
            <div>
              <div style={{ fontFamily: BODY, fontSize: 15, fontWeight: 700 }}>{c.title}</div>
              <div style={{ fontSize: 13.5, color: T.textSecondary, marginTop: 2 }}>{c.promise ?? c.concept}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ background: T.paper, color: T.fileInk, borderRadius: 2, padding: "20px 24px", boxShadow: "0 2px 0 rgba(0,0,0,0.55)" }}>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", opacity: 0.6, marginBottom: 6 }}>YOUR MOVE IN THE REAL WORLD</div>
        <p style={{ fontSize: 15, lineHeight: 1.65, margin: 0 }}>{manifest.debrief.realWorldMove}</p>
      </div>
      <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14 }}>
        <Bubble who="wren">{manifest.debrief.wrenLine}</Bubble>
      </div>
      <div style={{ marginTop: 22 }}>
        <AmberButton label="COLLECT YOUR REWARDS →" onClick={onNext} />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- rewards */

function RewardsScene({ manifest, reduced, audio, emit, xp, onExit, onNextCase }: { manifest: MissionManifest; reduced: boolean; audio: ReturnType<typeof useSignalAudio>; emit: (e: AwardEvent) => void; xp: number; onExit?: () => void; onNextCase?: () => void }) {
  const [stamped, setStamped] = useState(false);
  useEffect(() => {
    emit({ type: "CASE_CLOSED", sourceKey: manifest.id });
    const t = window.setTimeout(() => {
      setStamped(true);
      audio.stamp();
    }, reduced ? 150 : 900);
    return () => window.clearTimeout(t);
  }, [emit, manifest.id, reduced, audio]);

  // Real program progress: count every case whose saved checkpoint is closed
  // (plus this one, which just closed), so the clearance line reflects reality
  // instead of a hardcoded 1 / 5.
  const PROGRAM_TOTAL = 20;
  const closedTotal = useMemo(() => {
    const ids = new Set<string>();
    if (typeof window !== "undefined") {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k || !k.startsWith("explorers:checkpoint:")) continue;
        try {
          const cp = JSON.parse(localStorage.getItem(k) || "{}");
          if (cp?.pos?.beat === "closed" && typeof cp?.missionId === "string") ids.add(cp.missionId);
        } catch {}
      }
    }
    ids.add(manifest.id);
    return ids.size;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stamped, manifest.id]);
  const { rank, tier } = useMemo(() => {
    if (closedTotal >= PROGRAM_TOTAL) return { rank: "ULTRA", tier: "ULTRA" };
    if (closedTotal >= 15) return { rank: "SPECIALIST", tier: "ULTRA" };
    if (closedTotal >= 10) return { rank: "SENIOR AGENT", tier: "TOP SECRET" };
    if (closedTotal >= 5) return { rank: "AGENT", tier: "SECRET" };
    return { rank: "TRAINEE", tier: "CONFIDENTIAL" };
  }, [closedTotal]);

  return (
    <section style={{ maxWidth: 620, margin: "0 auto", paddingTop: 6 }}>
      <Eyebrow text="Rewards: case closed" color={T.clearanceBrass} />
      <div style={{ marginTop: 14, background: T.manila, color: T.fileInk, borderRadius: 2, padding: "26px 28px 30px", boxShadow: "0 2px 0 rgba(0,0,0,0.55)", position: "relative" }}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
          {manifest.actor.portrait ? (
            <div className="sr-scene" style={{ width: 128, height: 160, borderRadius: 3, overflow: "hidden", boxShadow: "0 8px 22px rgba(0,0,0,0.5)", border: `1px solid ${T.fileInk}33`, position: "relative" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={manifest.actor.portrait} alt={`Declassified photo of ${manifest.actor.codename}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              <span aria-hidden style={{ position: "absolute", bottom: 0, left: 0, right: 0, fontFamily: MONO, fontSize: 7.5, letterSpacing: "0.1em", color: "#E8E2D0", background: "rgba(20,24,29,0.75)", padding: "3px 6px" }}>
                DECLASSIFIED
              </span>
            </div>
          ) : (
            <div style={{ width: 108, height: 128, background: T.fileInk, borderRadius: 2 }} />
          )}
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", opacity: 0.6 }}>VILLAIN FILE · DOSSIER</div>
            <div style={{ fontFamily: MONO, fontSize: 24, fontWeight: 600, margin: "6px 0 10px" }}>{manifest.actor.codename}</div>
            <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>
              <strong>Their trick:&nbsp;</strong>
              {manifest.dossier.mo}
            </p>
            <p style={{ fontSize: 14, lineHeight: 1.6, margin: "8px 0 0" }}>
              <strong>Beaten by:&nbsp;</strong>
              {manifest.dossier.defeatedBy}
            </p>
          </div>
        </div>
        {manifest.dossier.breadcrumb && (
          <div style={{ borderTop: `1px solid ${T.fileInk}26`, marginTop: 18, paddingTop: 12 }}>
            <p style={{ fontFamily: MONO, fontSize: 12, lineHeight: 1.6, margin: 0, opacity: 0.75 }}>{manifest.dossier.breadcrumb}</p>
          </div>
        )}
        <StampMark text="CASE CLOSED" visible={stamped} reduced={reduced} style={{ position: "absolute", top: 18, right: 22 }} />
      </div>

      <div style={{ marginTop: 18, background: T.panel, border: `1px solid ${T.hairline}`, borderRadius: 3, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.08em", color: T.clearanceBrass }}>CLEARANCE: {rank} ▸ {tier}</span>
        <span style={{ fontFamily: MONO, fontSize: 12, color: T.textSecondary }}>
          CASES CLOSED&nbsp;<span style={{ color: T.clearanceBrass }}>{stamped ? closedTotal : Math.max(0, closedTotal - 1)}</span> / {PROGRAM_TOTAL}
        </span>
      </div>

      {stamped && (
        <div className="sr-scene" style={{ textAlign: "center", marginTop: 30 }}>
          <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.14em", color: T.textSecondary }}>MISSION XP</div>
          <div className="sr-xpnum" style={{ fontFamily: MONO, fontSize: 52, fontWeight: 600, color: T.clearanceBrass, textShadow: `0 0 34px ${T.clearanceBrass}55`, lineHeight: 1.1 }}>
            {xp}
          </div>
          <p style={{ marginTop: 20, fontFamily: MONO, fontSize: 13.5, color: T.textSecondary, letterSpacing: "0.06em" }}>
            That&rsquo;s the mission, Agent. ARC out.
          </p>
          <div style={{ marginTop: 26, display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            {onNextCase && (
              <button onClick={onNextCase} style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", color: T.inkBlack, background: T.actionAmber, border: "none", borderRadius: 4, padding: "12px 24px", cursor: "pointer", boxShadow: `0 0 24px ${T.actionAmber}55` }}>
                NEXT CASE →
              </button>
            )}
            {onExit && (
              <button onClick={onExit} style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", color: T.arcCyan, background: "transparent", border: `1px solid ${T.arcCyan}88`, borderRadius: 4, padding: "12px 24px", cursor: "pointer" }}>
                ← BACK TO MISSIONS
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
