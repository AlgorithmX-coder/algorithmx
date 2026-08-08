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
import { playWren, stopWren, useSignalAudio } from "./audio";
import {
  AmberButton,
  Bubble,
  EngineStyles,
  Eyebrow,
  Face,
  GhostButton,
  Resolve,
  RoomBackdrop,
  StampMark,
  TypingDots,
  useReducedMotion,
} from "./primitives";
import { BODY, MONO, T } from "./tokens";
import type {
  AwardEvent,
  BeatPos,
  CheckpointEvidence,
  CycleDef,
  MissionCheckpoint,
  MissionManifest,
} from "./types";
import { checkpointStorageKey, xpForEvent } from "./types";
import { BLOCK_FILMS, BlockFilm, filmId, filmSeen, markFilmSeen } from "./BlockFilm";
import Inspect from "../mechanics/Inspect";
import Decide from "../mechanics/Decide";
import Profile from "../mechanics/Profile";
import Trace from "../mechanics/Trace";
import Simulate from "../mechanics/Simulate";
import Build from "../mechanics/Build";
import Cipher from "../mechanics/Cipher";

const eventKey = (e: AwardEvent) => `${e.type}:${e.sourceKey}`;

function nextPos(pos: BeatPos): BeatPos {
  if (pos.beat === "transmission") return { beat: "briefing" };
  if (pos.beat === "briefing") return { beat: "cycle", cycleIndex: 0, stage: "intel" };
  if (pos.beat === "cycle") {
    if (pos.stage === "intel") return { ...pos, stage: "fieldwork" };
    if (pos.stage === "fieldwork") return { ...pos, stage: "checkpoint" };
    if (pos.cycleIndex < 2) return { beat: "cycle", cycleIndex: (pos.cycleIndex + 1) as 0 | 1 | 2, stage: "intel" };
    return { beat: "incident", incidentPhase: 0 };
  }
  if (pos.beat === "incident") return { beat: "debrief" };
  if (pos.beat === "debrief") return { beat: "closed" };
  return pos;
}

/** Kid-plain position label for the HUD. */
function describePos(pos: BeatPos): string {
  if (pos.beat === "cycle") {
    const stage = pos.stage === "intel" ? "LEARN" : pos.stage === "fieldwork" ? "PLAY" : "QUICK QUIZ";
    return `SKILL ${pos.cycleIndex + 1} · ${stage}`;
  }
  if (pos.beat === "incident") return "BOSS";
  if (pos.beat === "debrief") return "MISSION REPORT";
  if (pos.beat === "closed") return "REWARDS";
  return "MISSION START";
}

function toneFor(pos: BeatPos): string {
  if (pos.beat === "incident") return T.threatRed;
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
              <div style={{ fontFamily: MONO, fontSize: 14.5, fontWeight: 600, color: isDone ? T.confirmedGreen : isCurrent ? T.textPrimary : T.textSecondary }}>
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

export default function MissionRuntime({ manifest }: { manifest: MissionManifest }) {
  const reduced = useReducedMotion();
  const audio = useSignalAudio();
  const storageKey = checkpointStorageKey(manifest.id);

  const [pos, setPos] = useState<BeatPos>({ beat: "transmission" });
  const [intro, setIntro] = useState(true);
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
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const cp = JSON.parse(raw) as MissionCheckpoint;
        if (cp.missionId === manifest.id && cp.pos.beat !== "transmission") setResumeOffer(cp);
      }
    } catch {}
    setHydrated(true);
  }, [storageKey, manifest.id]);

  useEffect(() => {
    if (!hydrated || resumeOffer) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ missionId: manifest.id, pos, events } satisfies MissionCheckpoint));
    } catch {}
  }, [pos, events, hydrated, resumeOffer, storageKey, manifest.id]);

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
      const n = nextPos(p);
      if (p.beat === "cycle" && p.stage === "checkpoint") setMapGate(p.cycleIndex);
      if (p.beat === "incident") setMapGate(3);
      return n;
    });
    window.scrollTo({ top: 0 });
  }, [audio]);

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
    else stopWren();
  }, [atStart, pos.beat, resumeOffer, filmToPlay, voiceOn, manifest.voice]);
  useEffect(() => () => stopWren(), []);

  const tone = mapGate !== null ? T.confirmedGreen : toneFor(pos);
  const done = stepsDone(pos);

  return (
    <main style={{ minHeight: "100vh", background: T.inkBlack, color: T.textPrimary, fontFamily: BODY, position: "relative", overflow: "hidden" }}>
      <EngineStyles />
      <RoomBackdrop reduced={reduced} tone={tone} />

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

      {/* HUD — ARC chrome */}
      <div style={{ position: "relative", zIndex: 2, borderBottom: `1px solid ${T.hairline}`, background: `${T.panel}D9`, backdropFilter: "blur(8px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 18px" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 12, fontFamily: MONO, fontSize: 11.5, letterSpacing: "0.08em", color: T.textSecondary }}>
            {manifest.caseNumber} <span style={{ color: T.textDisabled }}>//</span>{" "}
            <span style={{ color: T.textPrimary }}>{manifest.title.toUpperCase()}</span>
            <button
              onClick={toggleVoice}
              aria-label={voiceOn ? "Turn WREN's voice off" : "Turn WREN's voice on"}
              style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.1em", color: voiceOn ? T.arcCyan : T.textDisabled, background: "transparent", border: `1px solid ${voiceOn ? `${T.arcCyan}66` : T.hairline}`, borderRadius: 2, padding: "4px 8px", cursor: "pointer" }}
            >
              VOICE {voiceOn ? "ON" : "OFF"}
            </button>
          </span>
          <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.08em", color: T.textSecondary, position: "relative" }}>
            <span style={{ color: tone, transition: "color 500ms" }}>{mapGate !== null ? "MISSION MAP" : describePos(pos)}</span>
            <span aria-hidden style={{ color: T.textDisabled }}> · </span>
            XP{" "}
            <span key={xp} className="sr-xpnum" style={{ color: T.textPrimary, fontSize: 15, fontWeight: 600 }}>
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
              />
            )}
            {pos.beat === "incident" && (
              <BossScene manifest={manifest} reduced={reduced} audio={audio} emit={emit} onNext={advance} />
            )}
            {pos.beat === "debrief" && <ReportScene manifest={manifest} reduced={reduced} onNext={advance} />}
            {pos.beat === "closed" && <RewardsScene manifest={manifest} reduced={reduced} audio={audio} emit={emit} xp={xp} />}
          </div>
        )}
      </div>

      {/* dev ledger */}
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
      {!atStart && !resumeOffer && (
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
      <h1 style={{ fontFamily: MONO, fontSize: 28, fontWeight: 600, margin: "14px 0 8px" }}>Your case is saved.</h1>
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
          <img src={manifest.scene} alt="" style={{ width: "100%", aspectRatio: "21/8", objectFit: "cover", display: "block" }} />
          <div aria-hidden style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, transparent 30%, ${T.inkBlack}E6 92%), linear-gradient(90deg, ${T.inkBlack}66, transparent 30%)` }} />
          <div style={{ position: "absolute", left: 22, right: 22, bottom: 14, display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
            <div>
              <Eyebrow text={`Mission ${missionNo}`} color={T.arcCyan} />
              <h1 style={{ fontFamily: MONO, fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 600, margin: "6px 0 0", textShadow: "0 2px 20px rgba(0,0,0,0.9)" }}>
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
        <h1 style={{ fontFamily: MONO, fontSize: "clamp(30px, 5.4vw, 46px)", fontWeight: 600, margin: "0 0 16px", textShadow: `0 0 40px ${T.arcCyan}33` }}>
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
      <h1 style={{ fontFamily: MONO, fontSize: "clamp(26px, 4.6vw, 38px)", fontWeight: 600, margin: "12px 0 18px" }}>
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

function CycleScene({ cycle, cycleIndex, stage, reduced, audio, emit, onNext }: { cycle: CycleDef; cycleIndex: number; stage: "intel" | "fieldwork" | "checkpoint"; reduced: boolean; audio: ReturnType<typeof useSignalAudio>; emit: (e: AwardEvent) => void; onNext: () => void }) {
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
            <div style={{ fontFamily: MONO, fontSize: "clamp(17px, 2.6vw, 22px)", fontWeight: 600, margin: "4px 0 2px" }}>{cycle.title}</div>
            <div style={{ fontSize: 13, color: T.textSecondary }}>{cycle.promise ?? cycle.concept}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {["LEARN", "PLAY", "QUIZ"].map((k, i) => {
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

      {stage === "intel" && <LearnStage cycle={cycle} cycleIndex={cycleIndex} reduced={reduced} audio={audio} emit={emit} onNext={onNext} />}
      {stage === "fieldwork" && <PlayStage cycle={cycle} cycleIndex={cycleIndex} reduced={reduced} audio={audio} emit={emit} onNext={onNext} />}
      {stage === "checkpoint" && <QuizStage cycle={cycle} cycleIndex={cycleIndex} reduced={reduced} audio={audio} emit={emit} onNext={onNext} />}
    </section>
  );
}

/* LEARN — tap-to-continue dialogue (law 8: the kid sets the pace) */
function LearnStage({ cycle, cycleIndex, reduced, audio, emit, onNext }: { cycle: CycleDef; cycleIndex: number; reduced: boolean; audio: ReturnType<typeof useSignalAudio>; emit: (e: AwardEvent) => void; onNext: () => void }) {
  const p = cycle.intel.prediction;
  const beats = cycle.intel.beats;
  const [shown, setShown] = useState(reduced ? beats.length : 1);
  const [replies, setReplies] = useState<{ text: string; ok: boolean; response: string }[]>([]);
  const settled = replies.some((r) => r.ok);
  const beatsDone = shown >= beats.length;

  const more = () => {
    audio.click();
    setShown((s) => Math.min(beats.length, s + 1));
  };

  const choose = (i: number) => {
    if (settled || replies.some((r) => r.text === p.options[i])) return;
    const ok = i === p.answer;
    setReplies((r) => [...r, { text: p.options[i], ok, response: ok ? p.right : p.wrong }]);
    if (ok) audio.latch();
    else audio.thud();
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <div style={{ display: "grid", gap: 14 }}>
        {beats.slice(0, shown).map((b, i) => (
          <Bubble key={i} who="wren">
            {b}
          </Bubble>
        ))}

        {!beatsDone && (
          <button onClick={more} className="sr-btn sr-choice" style={{ justifySelf: "start", display: "flex", gap: 10, alignItems: "center", background: T.panel, border: `1px solid ${T.arcCyan}55`, borderRadius: 12, padding: "10px 16px", cursor: "pointer", color: T.arcCyan, fontFamily: MONO, fontSize: 12.5, letterSpacing: "0.06em" }}>
            <TypingDots /> TAP FOR MORE
          </button>
        )}

        {beatsDone && (
          <Bubble who="wren" tone={T.actionAmber}>
            <span style={{ display: "block", fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.12em", color: T.actionAmber, marginBottom: 6 }}>
              YOUR CALL
            </span>
            {p.question}
          </Bubble>
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

        {beatsDone && !settled && (
          <div className="sr-msg" style={{ display: "grid", gap: 10, justifyItems: "end" }}>
            {p.options.map((o, i) =>
              replies.some((r) => r.text === o) ? null : (
                <button key={o} onClick={() => choose(i)} className="sr-btn sr-choice" style={{ textAlign: "right", fontSize: 15.5, lineHeight: 1.55, color: T.actionAmber, background: `${T.actionAmber}0A`, border: `1px solid ${T.actionAmber}55`, borderRadius: "14px 14px 3px 14px", padding: "13px 17px", cursor: "pointer", maxWidth: "82%" }}>
                  {o}
                </button>
              ),
            )}
          </div>
        )}
      </div>

      {settled && (
        <div className="sr-msg" style={{ marginTop: 22 }}>
          <AmberButton
            label="PLAY IT →"
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
function PlayStage({ cycle, cycleIndex, reduced, audio, emit, onNext }: { cycle: CycleDef; cycleIndex: number; reduced: boolean; audio: ReturnType<typeof useSignalAudio>; emit: (e: AwardEvent) => void; onNext: () => void }) {
  const fw = cycle.fieldwork;
  const instruction = cycle.instruction ?? fw.payload.intro;
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
    </div>
  );
}

/* QUICK QUIZ — chat quiz, plain label */
function QuizStage({ cycle, cycleIndex, reduced, audio, emit, onNext }: { cycle: CycleDef; cycleIndex: number; reduced: boolean; audio: ReturnType<typeof useSignalAudio>; emit: (e: AwardEvent) => void; onNext: () => void }) {
  const questions = cycle.checkpoint.questions;
  const [qIndex, setQIndex] = useState(0);
  const [attempts, setAttempts] = useState(1);
  const [evidence, setEvidence] = useState<CheckpointEvidence[]>([]);
  const [passed, setPassed] = useState(false);
  const [thread, setThread] = useState<{ who: "wren" | "you"; text: string; ok?: boolean }[]>([
    { who: "wren", text: "Quick quiz. Two questions. Show me you've got it." },
  ]);
  const q = questions[Math.min(qIndex, questions.length - 1)];
  const WRONG_LINES = ["Not that one. Think about what you just saw.", "Close. Read the question one more time."];

  const choose = (i: number) => {
    if (passed) return;
    const text = q.options[i];
    if (i === q.answer) {
      audio.latch();
      const record: CheckpointEvidence = { questionId: q.id, answerIndex: i, attempts };
      const nextEvidence = [...evidence, record];
      const isLast = qIndex + 1 >= questions.length;
      setThread((t) => [...t, { who: "you", text, ok: true }, { who: "wren", text: isLast ? "That's both. Quiz passed." : "Right. Next question." }]);
      if (isLast) {
        setEvidence(nextEvidence);
        setPassed(true);
        audio.stamp();
        emit({ type: "CHECKPOINT_PASSED", sourceKey: `cycle-${cycleIndex}`, evidence: nextEvidence });
      } else {
        setEvidence(nextEvidence);
        setQIndex(qIndex + 1);
        setAttempts(1);
      }
    } else {
      audio.thud();
      setAttempts((a) => a + 1);
      setThread((t) => [...t, { who: "you", text, ok: false }, { who: "wren", text: WRONG_LINES[(attempts - 1) % WRONG_LINES.length] }]);
    }
  };

  const answered = new Set(thread.filter((m) => m.who === "you").map((m) => m.text));

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
        <Eyebrow text="Quick quiz" color={T.confirmedGreen} />
        <span style={{ fontFamily: MONO, fontSize: 12, color: passed ? T.confirmedGreen : T.textSecondary }}>
          {Math.min(qIndex + (passed ? 1 : 0), questions.length)}/{questions.length}
        </span>
      </div>
      <div style={{ display: "grid", gap: 14 }}>
        {thread.map((m, i) =>
          m.who === "wren" ? (
            <Bubble key={i} who="wren" tone={i === 0 ? T.confirmedGreen : undefined}>
              {m.text}
            </Bubble>
          ) : (
            <div key={i} className="sr-msg" style={{ display: "flex", gap: 12, flexDirection: "row-reverse", alignItems: "flex-end" }}>
              <Face who="you" />
              <div style={{ maxWidth: "78%", background: m.ok ? `${T.confirmedGreen}12` : `${T.threatRed}10`, border: `1px solid ${m.ok ? T.confirmedGreen : T.threatRed}88`, borderRadius: "14px 14px 3px 14px", padding: "12px 16px", fontSize: 16, lineHeight: 1.6 }}>
                {m.text}
              </div>
            </div>
          ),
        )}
        {!passed && (
          <Bubble who="wren" tone={T.confirmedGreen}>
            <span style={{ display: "block", fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.12em", color: T.confirmedGreen, marginBottom: 6 }}>
              QUESTION {qIndex + 1} OF {questions.length}
            </span>
            {q.question}
          </Bubble>
        )}
        {!passed && (
          <div className="sr-msg" style={{ display: "grid", gap: 10, justifyItems: "end" }}>
            {q.options.map((o, i) =>
              answered.has(o) ? null : (
                <button key={o} onClick={() => choose(i)} className="sr-btn sr-choice" style={{ textAlign: "right", fontSize: 15.5, lineHeight: 1.55, color: T.confirmedGreen, background: `${T.confirmedGreen}0A`, border: `1px solid ${T.confirmedGreen}55`, borderRadius: "14px 14px 3px 14px", padding: "13px 17px", cursor: "pointer", maxWidth: "82%" }}>
                  {o}
                </button>
              ),
            )}
          </div>
        )}
      </div>
      <StampMark text="PASSED" visible={passed} reduced={reduced} color={T.confirmedGreen} style={{ position: "absolute", top: -10, right: 8 }} />
      {passed && (
        <div className="sr-msg" style={{ marginTop: 22 }}>
          <AmberButton label="BACK TO THE MAP →" onClick={onNext} />
        </div>
      )}
    </div>
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
        <h1 style={{ fontFamily: MONO, fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 600, margin: "12px 0 16px", textShadow: `0 0 40px ${T.threatRed}33` }}>
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
      <h1 style={{ fontFamily: MONO, fontSize: "clamp(26px, 4.6vw, 38px)", fontWeight: 600, margin: "12px 0 18px" }}>You learned 3 skills today.</h1>
      <div style={{ display: "grid", gap: 10, marginBottom: 18 }}>
        {manifest.cycles.map((c, i) => (
          <div key={c.id} style={{ display: "flex", gap: 14, alignItems: "center", background: `${T.confirmedGreen}0A`, border: `1px solid ${T.confirmedGreen}55`, borderRadius: 4, padding: "13px 16px" }}>
            <span style={{ display: "grid", placeItems: "center", minWidth: 32, height: 32, borderRadius: 3, background: T.confirmedGreen, color: T.inkBlack, fontFamily: MONO, fontSize: 15, fontWeight: 600 }}>
              ✓
            </span>
            <div>
              <div style={{ fontFamily: MONO, fontSize: 14.5, fontWeight: 600 }}>{c.title}</div>
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

function RewardsScene({ manifest, reduced, audio, emit, xp }: { manifest: MissionManifest; reduced: boolean; audio: ReturnType<typeof useSignalAudio>; emit: (e: AwardEvent) => void; xp: number }) {
  const [stamped, setStamped] = useState(false);
  useEffect(() => {
    emit({ type: "CASE_CLOSED", sourceKey: manifest.id });
    const t = window.setTimeout(() => {
      setStamped(true);
      audio.stamp();
    }, reduced ? 150 : 900);
    return () => window.clearTimeout(t);
  }, [emit, manifest.id, reduced, audio]);

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
        <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.08em", color: T.clearanceBrass }}>CLEARANCE: TRAINEE ▸ CONFIDENTIAL</span>
        <span style={{ fontFamily: MONO, fontSize: 12, color: T.textSecondary }}>
          CASES CLOSED&nbsp;<span style={{ color: T.clearanceBrass }}>{stamped ? "1" : "0"}</span> / 5
        </span>
      </div>

      {stamped && (
        <div className="sr-scene" style={{ textAlign: "center", marginTop: 30 }}>
          <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.14em", color: T.textSecondary }}>MISSION XP</div>
          <div className="sr-xpnum" style={{ fontFamily: MONO, fontSize: 52, fontWeight: 600, color: T.clearanceBrass, textShadow: `0 0 34px ${T.clearanceBrass}55`, lineHeight: 1.1 }}>
            {xp}
          </div>
          <p style={{ marginTop: 20, fontFamily: MONO, fontSize: 13.5, color: T.textSecondary, letterSpacing: "0.06em" }}>
            That&rsquo;s the mission, Operative. ARC out.
          </p>
        </div>
      )}
    </section>
  );
}
