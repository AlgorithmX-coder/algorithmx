"use client";

/**
 * MissionRuntime — walks a MissionManifest through the six locked
 * beats (template §1): transmission → briefing → cycles ×3 →
 * incident → debrief → case closed, full stop.
 *
 * The runtime owns everything mechanics must not: navigation, award
 * events (idempotent, RULES-table priced), save/resume, and the
 * celebration attach points. The full-stop ending is rendered here,
 * which is what makes it structurally unskippable.
 *
 * Slice transport: localStorage + a dev event ledger. The server award
 * route swaps in behind `emit()` without touching scenes (template §5–6).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { playWren, stopWren, useSignalAudio } from "./audio";
import {
  AmberButton,
  Bubble,
  ClassificationBand,
  EngineStyles,
  Eyebrow,
  Face,
  GhostButton,
  HandlerChip,
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
import Inspect from "../mechanics/Inspect";
import Decide from "../mechanics/Decide";
import Profile from "../mechanics/Profile";
import Trace from "../mechanics/Trace";

const eventKey = (e: AwardEvent) => `${e.type}:${e.sourceKey}`;

function nextPos(pos: BeatPos, manifest: MissionManifest): BeatPos {
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

function describePos(pos: BeatPos, manifest: MissionManifest): string {
  if (pos.beat === "cycle") return `CYCLE ${pos.cycleIndex + 1} — ${manifest.cycles[pos.cycleIndex].title.toUpperCase()} · ${pos.stage.toUpperCase()}`;
  if (pos.beat === "incident") return `INCIDENT — ${manifest.incident.title.toUpperCase()}`;
  return pos.beat.toUpperCase();
}

/** The color journey: each beat type tints the room. */
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

/** Mission journey as 8 segments: tx, briefing, 3 cycles, incident, debrief, closed. */
function progressFor(pos: BeatPos): { done: number; frac: number } {
  if (pos.beat === "transmission") return { done: 0, frac: 0.3 };
  if (pos.beat === "briefing") return { done: 1, frac: 0.3 };
  if (pos.beat === "cycle") {
    const stageFrac = pos.stage === "intel" ? 0.15 : pos.stage === "fieldwork" ? 0.5 : 0.85;
    return { done: 2 + pos.cycleIndex, frac: stageFrac };
  }
  if (pos.beat === "incident") return { done: 5, frac: 0.5 };
  if (pos.beat === "debrief") return { done: 6, frac: 0.5 };
  return { done: 8, frac: 0 };
}

export default function MissionRuntime({ manifest }: { manifest: MissionManifest }) {
  const reduced = useReducedMotion();
  const audio = useSignalAudio();
  const storageKey = checkpointStorageKey(manifest.id);

  const [pos, setPos] = useState<BeatPos>({ beat: "transmission" });
  const [events, setEvents] = useState<AwardEvent[]>([]);
  const [resumeOffer, setResumeOffer] = useState<MissionCheckpoint | null>(null);
  const [ledgerOpen, setLedgerOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [xpPop, setXpPop] = useState<{ amount: number; key: number } | null>(null);
  const seen = useRef<Set<string>>(new Set());
  const prevXp = useRef(0);

  const xp = useMemo(() => events.reduce((sum, e) => sum + xpForEvent(e), 0), [events]);

  /* reward feedback: every award flies a +N off the XP counter */
  useEffect(() => {
    const diff = xp - prevXp.current;
    if (diff > 0 && prevXp.current > 0) {
      setXpPop({ amount: diff, key: Date.now() });
    } else if (diff > 0 && hydrated && !resumeOffer) {
      setXpPop({ amount: diff, key: Date.now() });
    }
    prevXp.current = xp;
  }, [xp, hydrated, resumeOffer]);

  /* ---- resume: offer a found checkpoint, never auto-jump ---- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const cp = JSON.parse(raw) as MissionCheckpoint;
        if (cp.missionId === manifest.id && cp.pos.beat !== "transmission") {
          setResumeOffer(cp);
        }
      }
    } catch {
      /* corrupt checkpoint → fresh start */
    }
    setHydrated(true);
  }, [storageKey, manifest.id]);

  /* ---- persist on every advance ---- */
  useEffect(() => {
    if (!hydrated || resumeOffer) return;
    const cp: MissionCheckpoint = { missionId: manifest.id, pos, events };
    try {
      localStorage.setItem(storageKey, JSON.stringify(cp));
    } catch {
      /* storage unavailable — session still plays */
    }
  }, [pos, events, hydrated, resumeOffer, storageKey, manifest.id]);

  /* ---- the award seam (server route swaps in here) ---- */
  const emit = useCallback((e: AwardEvent) => {
    const key = eventKey(e);
    if (seen.current.has(key)) return;
    seen.current.add(key);
    setEvents((prev) => [...prev, e]);
  }, []);

  const advance = useCallback(() => {
    audio.click();
    setPos((p) => nextPos(p, manifest));
    window.scrollTo({ top: 0 });
  }, [audio, manifest]);

  const restart = () => {
    try {
      localStorage.removeItem(storageKey);
    } catch {}
    seen.current = new Set();
    setEvents([]);
    setPos({ beat: "transmission" });
    setResumeOffer(null);
  };

  const resume = () => {
    if (!resumeOffer) return;
    seen.current = new Set(resumeOffer.events.map(eventKey));
    setEvents(resumeOffer.events);
    setPos(resumeOffer.pos);
    setResumeOffer(null);
  };

  /* ---- WREN voice: plays on story beats, mute-gated, cuts previous ---- */
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
  useEffect(() => {
    if (resumeOffer) return;
    const clip =
      pos.beat === "transmission"
        ? manifest.voice?.transmission
        : pos.beat === "briefing"
          ? manifest.voice?.briefing
          : pos.beat === "debrief"
            ? manifest.voice?.debrief
            : undefined;
    if (clip) playWren(clip, voiceOn);
    else stopWren();
  }, [pos.beat, resumeOffer, voiceOn, manifest.voice]);
  useEffect(() => () => stopWren(), []);

  const tone = toneFor(pos);
  const prog = progressFor(pos);

  return (
    <main style={{ minHeight: "100vh", background: T.inkBlack, color: T.textPrimary, fontFamily: BODY, position: "relative", overflow: "hidden" }}>
      <EngineStyles />
      <RoomBackdrop reduced={reduced} tone={tone} />

      {/* mission HUD — ARC chrome, never corrupted */}
      <div style={{ position: "relative", zIndex: 2, borderBottom: `1px solid ${T.hairline}`, background: `${T.panel}D9`, backdropFilter: "blur(8px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 18px" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 12, fontFamily: MONO, fontSize: 11.5, letterSpacing: "0.08em", color: T.textSecondary }}>
            {manifest.caseNumber} <span style={{ color: T.textDisabled }}>//</span>{" "}
            <span style={{ color: T.textPrimary }}>{manifest.title.toUpperCase()}</span>
            <button
              onClick={toggleVoice}
              aria-label={voiceOn ? "Turn WREN's voice off" : "Turn WREN's voice on"}
              style={{
                fontFamily: MONO,
                fontSize: 9.5,
                letterSpacing: "0.1em",
                color: voiceOn ? T.arcCyan : T.textDisabled,
                background: "transparent",
                border: `1px solid ${voiceOn ? `${T.arcCyan}66` : T.hairline}`,
                borderRadius: 2,
                padding: "4px 8px",
                cursor: "pointer",
              }}
            >
              VOICE {voiceOn ? "ON" : "OFF"}
            </button>
          </span>
          <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.08em", color: T.textSecondary, position: "relative" }}>
            <span style={{ color: tone, transition: "color 500ms" }}>{describePos(pos, manifest)}</span>
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
        {/* mission journey bar */}
        <div style={{ display: "flex", gap: 4, padding: "0 18px 10px" }}>
          {["TX", "BRIEF", "C1", "C2", "C3", "INCIDENT", "DEBRIEF", "CLOSED"].map((seg, i) => {
            const fill = i < prog.done ? 1 : i === prog.done ? prog.frac : 0;
            const live = i === prog.done && pos.beat !== "closed";
            return (
              <div key={seg} style={{ flex: seg === "INCIDENT" ? 1.4 : 1, height: 4, background: T.hairline, borderRadius: 2, overflow: "hidden" }}>
                <div
                  className={live ? "sr-seg sr-seg-live" : "sr-seg"}
                  style={{
                    width: `${fill * 100}%`,
                    height: "100%",
                    background: i >= 7 ? T.clearanceBrass : tone,
                    boxShadow: fill > 0 ? `0 0 8px ${tone}66` : "none",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 880, margin: "0 auto", padding: "40px 24px 90px" }}>
        {resumeOffer ? (
          <ResumeScene cp={resumeOffer} manifest={manifest} onResume={resume} onRestart={restart} />
        ) : (
          <div key={JSON.stringify(pos)} className="sr-scene">
            {pos.beat === "transmission" && <TransmissionScene manifest={manifest} reduced={reduced} onNext={advance} />}
            {pos.beat === "briefing" && <BriefingScene manifest={manifest} reduced={reduced} onNext={advance} />}
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
              <IncidentScene manifest={manifest} reduced={reduced} audio={audio} emit={emit} onNext={advance} />
            )}
            {pos.beat === "debrief" && <DebriefScene manifest={manifest} reduced={reduced} onNext={advance} />}
            {pos.beat === "closed" && <ClosedScene manifest={manifest} reduced={reduced} audio={audio} emit={emit} xp={xp} />}
          </div>
        )}
      </div>

      {/* dev event ledger — the engine made visible; remove before prod */}
      <div style={{ position: "fixed", bottom: 14, left: 16, zIndex: 3 }}>
        <button
          onClick={() => setLedgerOpen((o) => !o)}
          style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.06em", color: T.textDisabled, background: "transparent", border: `1px solid ${T.hairline}`, borderRadius: 2, padding: "4px 8px", cursor: "pointer" }}
        >
          EVENT LEDGER (DEV) — {events.length}
        </button>
        {ledgerOpen && (
          <div style={{ marginTop: 6, maxHeight: 180, overflowY: "auto", background: T.panel, border: `1px solid ${T.hairline}`, borderRadius: 3, padding: "8px 10px", minWidth: 300 }}>
            {events.length === 0 && (
              <div style={{ fontFamily: MONO, fontSize: 10, color: T.textDisabled }}>no claims yet</div>
            )}
            {events.map((e) => (
              <div key={eventKey(e)} style={{ fontFamily: MONO, fontSize: 10, lineHeight: 1.8, color: T.textSecondary }}>
                +{xpForEvent(e)} {e.type} <span style={{ color: T.textDisabled }}>{e.sourceKey}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {pos.beat !== "transmission" && !resumeOffer && (
        <button
          onClick={restart}
          style={{ position: "fixed", bottom: 14, right: 16, zIndex: 3, fontFamily: MONO, fontSize: 10, letterSpacing: "0.06em", color: T.textDisabled, background: "transparent", border: `1px solid ${T.hairline}`, borderRadius: 2, padding: "4px 8px", cursor: "pointer" }}
        >
          ↺ RESTART CASE (DEV)
        </button>
      )}
    </main>
  );
}

/* ================================================================ scenes */

function ResumeScene({ cp, manifest, onResume, onRestart }: { cp: MissionCheckpoint; manifest: MissionManifest; onResume: () => void; onRestart: () => void }) {
  return (
    <section style={{ maxWidth: 520, margin: "80px auto 0" }}>
      <Eyebrow text="ARC secure net — checkpoint on file" color={T.arcCyan} />
      <h1 style={{ fontFamily: MONO, fontSize: 26, fontWeight: 600, margin: "14px 0 8px" }}>Welcome back, Operative.</h1>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: T.textSecondary, margin: "0 0 22px" }}>
        {cp.pos.beat === "closed"
          ? "This case is closed and filed. You can reopen it for a fresh run."
          : `Your case is where you left it — ${describePos(cp.pos, manifest)}.`}
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {cp.pos.beat !== "closed" && <AmberButton label="RESUME CASE" onClick={onResume} />}
        <GhostButton label={cp.pos.beat === "closed" ? "REOPEN — FRESH RUN" : "RESTART FROM THE TOP"} onClick={onRestart} />
        {cp.pos.beat === "closed" && <AmberButton label="VIEW THE CLOSED CASE" onClick={onResume} />}
      </div>
    </section>
  );
}

function TransmissionScene({ manifest, reduced, onNext }: { manifest: MissionManifest; reduced: boolean; onNext: () => void }) {
  const total = manifest.transmission.lines.length;
  const [shown, setShown] = useState(reduced ? total : 0);
  useEffect(() => {
    if (reduced || shown >= total) return;
    const line = manifest.transmission.lines[shown];
    const t = window.setTimeout(() => setShown((s) => s + 1), 900 + Math.min(1600, line.length * 14));
    return () => window.clearTimeout(t);
  }, [shown, reduced, total, manifest.transmission.lines]);

  return (
    <section style={{ paddingTop: 56, maxWidth: 640 }}>
      <Eyebrow text="ARC secure net — incoming transmission" color={T.arcCyan} />
      <h1 style={{ fontFamily: MONO, fontSize: "clamp(34px, 6.5vw, 62px)", fontWeight: 600, margin: "18px 0 30px", minHeight: "1.2em", textShadow: `0 0 40px ${T.arcCyan}33` }}>
        <Resolve text={manifest.transmission.headline} reduced={reduced} />
      </h1>
      <div style={{ display: "grid", gap: 14 }}>
        {manifest.transmission.lines.slice(0, shown).map((line, i) => (
          <Bubble key={i} who="wren">
            {line}
          </Bubble>
        ))}
        {shown < total && (
          <div className="sr-msg" style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
            <Face who="wren" />
            <TypingDots />
          </div>
        )}
      </div>
      {shown >= total && (
        <div className="sr-msg" style={{ marginTop: 30, display: "flex", alignItems: "center", gap: 18 }}>
          <AmberButton label="OPEN BRIEFING" onClick={onNext} />
          <span style={{ fontFamily: MONO, fontSize: 11, color: T.textDisabled, letterSpacing: "0.06em" }}>{manifest.caseNumber}</span>
        </div>
      )}
    </section>
  );
}

function BriefingScene({ manifest, reduced, onNext }: { manifest: MissionManifest; reduced: boolean; onNext: () => void }) {
  return (
    <section>
      <div style={{ border: `1px solid ${T.hairline}`, borderRadius: 3, overflow: "hidden" }}>
        <ClassificationBand level={manifest.classification} />
        <div style={{ background: T.panel, padding: "22px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <Eyebrow text={`${manifest.caseNumber} // suspected actor: ${manifest.actor.codename}`} />
            <span style={{ fontFamily: MONO, fontSize: 11, color: T.textDisabled }}>ARC // SIGNAL ROOM</span>
          </div>
          <h2 style={{ fontFamily: MONO, fontSize: "clamp(26px, 4.5vw, 38px)", fontWeight: 600, margin: "14px 0 4px" }}>{manifest.title}</h2>
          <p style={{ color: T.textSecondary, fontSize: 16.5, lineHeight: 1.65, margin: "10px 0 24px", maxWidth: 580 }}>{manifest.briefing.summary}</p>
          <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 10, maxWidth: 520 }}>
            {manifest.briefing.objectives.map((o, i) => (
              <li key={o} className="sr-choice" style={{ fontFamily: MONO, fontSize: 14.5, color: T.textPrimary, background: T.panelRaised, border: `1px solid ${T.hairline}`, borderRadius: 3, padding: "14px 16px", display: "flex", gap: 14, alignItems: "center" }}>
                <span style={{ display: "grid", placeItems: "center", minWidth: 28, height: 28, borderRadius: 3, background: `${T.arcCyan}1A`, border: `1px solid ${T.arcCyan}55`, color: T.arcCyan, fontSize: 12.5, fontWeight: 600 }}>
                  {i + 1}
                </span>
                {o}
              </li>
            ))}
          </ol>
          <div style={{ marginTop: 26, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16 }}>
            <HandlerChip reduced={reduced} />
            <p style={{ margin: 0, fontSize: 15.5, color: T.textPrimary, fontStyle: "italic", flex: 1, minWidth: 240 }}>&ldquo;{manifest.briefing.wrenLine}&rdquo;</p>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 26 }}>
        <AmberButton label="START CYCLE 1" onClick={onNext} />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- cycles */

function CycleScene({
  cycle,
  cycleIndex,
  stage,
  reduced,
  audio,
  emit,
  onNext,
}: {
  cycle: CycleDef;
  cycleIndex: number;
  stage: "intel" | "fieldwork" | "checkpoint";
  reduced: boolean;
  audio: ReturnType<typeof useSignalAudio>;
  emit: (e: AwardEvent) => void;
  onNext: () => void;
}) {
  return (
    <section>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18, flexWrap: "wrap", gap: 8 }}>
        <Eyebrow text={`Cycle ${cycleIndex + 1} of 3 — ${cycle.title}`} color={T.arcCyan} />
        <span style={{ fontFamily: MONO, fontSize: 11, color: T.textDisabled, letterSpacing: "0.06em" }}>
          {["INTEL", "FIELDWORK", "CHECKPOINT"].map((s, i) => (
            <span key={s} style={{ color: s.toLowerCase() === stage ? T.arcCyan : T.textDisabled }}>
              {i > 0 ? " ▸ " : ""}
              {s}
            </span>
          ))}
        </span>
      </div>

      {stage === "intel" && (
        <IntelStage cycle={cycle} cycleIndex={cycleIndex} reduced={reduced} audio={audio} emit={emit} onNext={onNext} />
      )}
      {stage === "fieldwork" && (
        <FieldworkStage cycle={cycle} cycleIndex={cycleIndex} reduced={reduced} audio={audio} emit={emit} onNext={onNext} />
      )}
      {stage === "checkpoint" && (
        <CheckpointStage cycle={cycle} cycleIndex={cycleIndex} reduced={reduced} audio={audio} emit={emit} onNext={onNext} />
      )}
    </section>
  );
}

function IntelStage({ cycle, cycleIndex, reduced, audio, emit, onNext }: { cycle: CycleDef; cycleIndex: number; reduced: boolean; audio: ReturnType<typeof useSignalAudio>; emit: (e: AwardEvent) => void; onNext: () => void }) {
  const p = cycle.intel.prediction;
  const beats = cycle.intel.beats;
  const [shown, setShown] = useState(reduced ? beats.length : 0);
  const [replies, setReplies] = useState<{ text: string; ok: boolean; response: string }[]>([]);
  const settled = replies.some((r) => r.ok);
  const beatsDone = shown >= beats.length;

  /* WREN talks — reading-speed pacing, a soft tick per message */
  useEffect(() => {
    if (reduced || beatsDone) return;
    const t = window.setTimeout(() => {
      setShown((s) => s + 1);
      audio.click();
    }, 850 + Math.min(2200, beats[shown].length * 16));
    return () => window.clearTimeout(t);
  }, [shown, reduced, beatsDone, beats, audio]);

  const choose = (i: number) => {
    if (settled || replies.some((r) => r.text === p.options[i])) return;
    const ok = i === p.answer;
    setReplies((r) => [...r, { text: p.options[i], ok, response: ok ? p.right : p.wrong }]);
    if (ok) audio.latch();
    else audio.thud();
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ display: "grid", gap: 14 }}>
        {beats.slice(0, shown).map((b, i) => (
          <Bubble key={i} who="wren">
            {b}
          </Bubble>
        ))}
        {!beatsDone && (
          <div className="sr-msg" style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
            <Face who="wren" />
            <TypingDots />
          </div>
        )}

        {beatsDone && (
          <Bubble who="wren" tone={T.actionAmber}>
            <span style={{ display: "block", fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.12em", color: T.actionAmber, marginBottom: 6 }}>
              CALL IT, OPERATIVE
            </span>
            {p.question}
          </Bubble>
        )}

        {replies.map((r, i) => (
          <div key={i} style={{ display: "grid", gap: 14 }}>
            <div className="sr-msg" style={{ display: "flex", gap: 12, flexDirection: "row-reverse", alignItems: "flex-end" }}>
              <Face who="you" />
              <div style={{ maxWidth: "78%", background: r.ok ? `${T.confirmedGreen}12` : `${T.threatRed}10`, border: `1px solid ${r.ok ? T.confirmedGreen : T.threatRed}88`, borderRadius: "14px 14px 3px 14px", padding: "12px 16px", fontSize: 16, lineHeight: 1.6, color: T.textPrimary }}>
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
                <button
                  key={o}
                  onClick={() => choose(i)}
                  className="sr-btn sr-choice"
                  style={{
                    textAlign: "right",
                    fontSize: 15.5,
                    lineHeight: 1.55,
                    color: T.actionAmber,
                    background: `${T.actionAmber}0A`,
                    border: `1px solid ${T.actionAmber}55`,
                    borderRadius: "14px 14px 3px 14px",
                    padding: "13px 17px",
                    cursor: "pointer",
                    maxWidth: "82%",
                  }}
                >
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
            label="BEGIN FIELDWORK"
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


function FieldworkStage({ cycle, cycleIndex, reduced, audio, emit, onNext }: { cycle: CycleDef; cycleIndex: number; reduced: boolean; audio: ReturnType<typeof useSignalAudio>; emit: (e: AwardEvent) => void; onNext: () => void }) {
  const fw = cycle.fieldwork;
  const handle = (e: { kind: string; mastery?: boolean }) => {
    if (e.kind === "COMPLETED") {
      emit({ type: "FIELDWORK_COMPLETED", sourceKey: `cycle-${cycleIndex}`, mastery: !!e.mastery });
      onNext();
    }
  };
  const props = { reduced, audio, onEvent: handle } as const;
  if (fw.verb === "INSPECT") return <Inspect payload={fw.payload} {...props} />;
  if (fw.verb === "DECIDE") return <Decide payload={fw.payload} {...props} />;
  if (fw.verb === "TRACE") return <Trace payload={fw.payload} {...props} />;
  return <Profile payload={fw.payload} {...props} />;
}

function CheckpointStage({ cycle, cycleIndex, reduced, audio, emit, onNext }: { cycle: CycleDef; cycleIndex: number; reduced: boolean; audio: ReturnType<typeof useSignalAudio>; emit: (e: AwardEvent) => void; onNext: () => void }) {
  const questions = cycle.checkpoint.questions;
  const [qIndex, setQIndex] = useState(0);
  const [attempts, setAttempts] = useState(1);
  const [evidence, setEvidence] = useState<CheckpointEvidence[]>([]);
  const [passed, setPassed] = useState(false);
  const [thread, setThread] = useState<{ who: "wren" | "you"; text: string; ok?: boolean }[]>([
    { who: "wren", text: "Checkpoint, Operative. Prove it — no notes, just you." },
  ]);
  const q = questions[Math.min(qIndex, questions.length - 1)];

  const WRONG_LINES = [
    "Not that one. Think about what the case file already showed you.",
    "Closer than you think. Read the question like evidence.",
  ];

  const choose = (i: number) => {
    if (passed) return;
    const text = q.options[i];
    if (i === q.answer) {
      audio.latch();
      const record: CheckpointEvidence = { questionId: q.id, answerIndex: i, attempts };
      const nextEvidence = [...evidence, record];
      const isLast = qIndex + 1 >= questions.length;
      setThread((t) => [
        ...t,
        { who: "you", text, ok: true },
        { who: "wren", text: isLast ? "That's both. Checkpoint stamped — evidence filed." : "Correct. Next one." },
      ]);
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
      setThread((t) => [
        ...t,
        { who: "you", text, ok: false },
        { who: "wren", text: WRONG_LINES[(attempts - 1) % WRONG_LINES.length] },
      ]);
    }
  };

  const answered = new Set(thread.filter((m) => m.who === "you").map((m) => m.text));

  return (
    <div style={{ maxWidth: 640, position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
        <Eyebrow text="Checkpoint — prove it" color={T.confirmedGreen} />
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
              <div style={{ maxWidth: "78%", background: m.ok ? `${T.confirmedGreen}12` : `${T.threatRed}10`, border: `1px solid ${m.ok ? T.confirmedGreen : T.threatRed}88`, borderRadius: "14px 14px 3px 14px", padding: "12px 16px", fontSize: 16, lineHeight: 1.6, color: T.textPrimary }}>
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
                <button
                  key={o}
                  onClick={() => choose(i)}
                  className="sr-btn sr-choice"
                  style={{
                    textAlign: "right",
                    fontSize: 15.5,
                    lineHeight: 1.55,
                    color: T.confirmedGreen,
                    background: `${T.confirmedGreen}0A`,
                    border: `1px solid ${T.confirmedGreen}55`,
                    borderRadius: "14px 14px 3px 14px",
                    padding: "13px 17px",
                    cursor: "pointer",
                    maxWidth: "82%",
                  }}
                >
                  {o}
                </button>
              ),
            )}
          </div>
        )}
      </div>

      <StampMark text="PASSED" visible={passed} reduced={reduced} style={{ position: "absolute", top: -10, right: 8 }} />

      {passed && (
        <div className="sr-msg" style={{ marginTop: 22 }}>
          <AmberButton label={cycleIndex < 2 ? `START CYCLE ${cycleIndex + 2}` : "GO TO THE INCIDENT"} onClick={onNext} />
        </div>
      )}
    </div>
  );
}


/* ----------------------------------------------------------- incident */

function IncidentScene({ manifest, reduced, audio, emit, onNext }: { manifest: MissionManifest; reduced: boolean; audio: ReturnType<typeof useSignalAudio>; emit: (e: AwardEvent) => void; onNext: () => void }) {
  const Incident = manifest.incident.component;
  const [complete, setComplete] = useState(false);
  return (
    <section>
      {!complete && !reduced && <div className="sr-alert-edge" aria-hidden />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18, flexWrap: "wrap", gap: 8 }}>
        <Eyebrow text={`Incident — ${manifest.incident.title}`} color={T.threatRed} />
        <span style={{ fontFamily: MONO, fontSize: 11, color: T.threatRed, letterSpacing: "0.1em" }}>
          <span className="cxof-cursor" style={{ marginRight: 6 }}>●</span>LIVE CASE
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
            SIGNAL CLEAR — the wave is contained.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: T.textSecondary, margin: "10px 0 20px" }}>
            {manifest.actor.codename} just lost this one. WREN wants you in the debrief.
          </p>
          <AmberButton label="GO TO DEBRIEF" onClick={onNext} />
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------ debrief */

function DebriefScene({ manifest, reduced, onNext }: { manifest: MissionManifest; reduced: boolean; onNext: () => void }) {
  return (
    <section style={{ maxWidth: 640 }}>
      <Eyebrow text={`After-action report — ${manifest.caseNumber}`} />
      <div style={{ marginTop: 12, background: T.paper, color: T.fileInk, borderRadius: 2, padding: "26px 28px", boxShadow: "0 2px 0 rgba(0,0,0,0.55)" }}>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", opacity: 0.6, marginBottom: 10 }}>WHAT HAPPENED</div>
        {manifest.debrief.report.map((r) => (
          <p key={r} style={{ fontSize: 14, lineHeight: 1.65, margin: "0 0 8px" }}>
            • {r}
          </p>
        ))}
        <div style={{ borderTop: `1px solid ${T.fileInk}26`, marginTop: 16, paddingTop: 14 }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", opacity: 0.6, marginBottom: 6 }}>YOUR MOVE IN THE REAL WORLD</div>
          <p style={{ fontSize: 14, lineHeight: 1.65, margin: 0 }}>{manifest.debrief.realWorldMove}</p>
        </div>
      </div>
      <div style={{ marginTop: 18, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16 }}>
        <HandlerChip reduced={reduced} />
        <p style={{ margin: 0, fontSize: 14, color: T.textSecondary, fontStyle: "italic" }}>&ldquo;{manifest.debrief.wrenLine}&rdquo;</p>
      </div>
      <div style={{ marginTop: 22 }}>
        <AmberButton label="CLOSE THE CASE" onClick={onNext} />
      </div>
    </section>
  );
}

/* -------------------------------------------------------- case closed */

function ClosedScene({ manifest, reduced, audio, emit, xp }: { manifest: MissionManifest; reduced: boolean; audio: ReturnType<typeof useSignalAudio>; emit: (e: AwardEvent) => void; xp: number }) {
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
    <section style={{ maxWidth: 620, margin: "0 auto", paddingTop: 10 }}>
      <Eyebrow text={`Case file — ${manifest.caseNumber}`} color={T.clearanceBrass} />
      <div style={{ marginTop: 14, background: T.manila, color: T.fileInk, borderRadius: 2, padding: "26px 28px 30px", boxShadow: "0 2px 0 rgba(0,0,0,0.55)", position: "relative" }}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
          {manifest.actor.portrait ? (
            <div className="sr-scene" style={{ width: 128, height: 160, borderRadius: 3, overflow: "hidden", boxShadow: "0 8px 22px rgba(0,0,0,0.5)", border: `1px solid ${T.fileInk}33`, position: "relative" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={manifest.actor.portrait} alt={`Declassified surveillance photo of ${manifest.actor.codename}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              <span aria-hidden style={{ position: "absolute", bottom: 0, left: 0, right: 0, fontFamily: MONO, fontSize: 7.5, letterSpacing: "0.1em", color: "#E8E2D0", background: "rgba(20,24,29,0.75)", padding: "3px 6px" }}>
                DECLASSIFIED
              </span>
            </div>
          ) : (
            <div style={{ width: 108, height: 128, background: T.fileInk, borderRadius: 2, display: "grid", placeItems: "center", padding: 10 }}>
              <div style={{ display: "grid", gap: 6, width: "100%" }}>
                {[80, 100, 60, 90].map((w, i) => (
                  <div key={i} style={{ height: 8, width: `${w}%`, background: "#3A4654" }} />
                ))}
                <div style={{ fontFamily: MONO, fontSize: 8.5, color: T.textDisabled, marginTop: 6, letterSpacing: "0.06em" }}>
                  PORTRAIT PENDING
                  <br />
                  DECLASSIFICATION
                </div>
              </div>
            </div>
          )}
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", opacity: 0.6 }}>THREAT ACTOR DOSSIER</div>
            <div style={{ fontFamily: MONO, fontSize: 24, fontWeight: 600, margin: "6px 0 10px" }}>{manifest.actor.codename}</div>
            <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>
              <strong>M.O.:&nbsp;</strong>
              {manifest.dossier.mo}
            </p>
            <p style={{ fontSize: 14, lineHeight: 1.6, margin: "8px 0 0" }}>
              <strong>Defeated by:&nbsp;</strong>
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

      {/* brass appears here and only here */}
      <div style={{ marginTop: 18, background: T.panel, border: `1px solid ${T.hairline}`, borderRadius: 3, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.08em", color: T.clearanceBrass }}>
          CLEARANCE — TRAINEE ▸ CONFIDENTIAL
        </span>
        <span style={{ fontFamily: MONO, fontSize: 12, color: T.textSecondary }}>
          CASES CLOSED&nbsp;<span style={{ color: T.clearanceBrass }}>{stamped ? "1" : "0"}</span> / 5
        </span>
      </div>

      {stamped && (
        <div className="sr-scene" style={{ textAlign: "center", marginTop: 34 }}>
          <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.14em", color: T.textSecondary }}>MISSION XP</div>
          <div className="sr-xpnum" style={{ fontFamily: MONO, fontSize: 52, fontWeight: 600, color: T.clearanceBrass, textShadow: `0 0 34px ${T.clearanceBrass}55`, lineHeight: 1.1 }}>
            {xp}
          </div>
          <p style={{ marginTop: 22, fontFamily: MONO, fontSize: 13.5, color: T.textSecondary, letterSpacing: "0.06em" }}>
            That&rsquo;s the mission, Operative. ARC out.
          </p>
        </div>
      )}
    </section>
  );
}
