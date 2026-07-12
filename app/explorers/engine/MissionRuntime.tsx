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
import { useSignalAudio } from "./audio";
import {
  AmberButton,
  ClassificationBand,
  EngineStyles,
  Eyebrow,
  GhostButton,
  HandlerChip,
  Resolve,
  StampMark,
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

export default function MissionRuntime({ manifest }: { manifest: MissionManifest }) {
  const reduced = useReducedMotion();
  const audio = useSignalAudio();
  const storageKey = checkpointStorageKey(manifest.id);

  const [pos, setPos] = useState<BeatPos>({ beat: "transmission" });
  const [events, setEvents] = useState<AwardEvent[]>([]);
  const [resumeOffer, setResumeOffer] = useState<MissionCheckpoint | null>(null);
  const [ledgerOpen, setLedgerOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const seen = useRef<Set<string>>(new Set());

  const xp = useMemo(() => events.reduce((sum, e) => sum + xpForEvent(e), 0), [events]);

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

  return (
    <main style={{ minHeight: "100vh", background: T.inkBlack, color: T.textPrimary, fontFamily: BODY, position: "relative", overflow: "hidden" }}>
      <EngineStyles />
      {/* the room */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(${T.hairline}22 1px, transparent 1px), linear-gradient(90deg, ${T.hairline}22 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
          pointerEvents: "none",
        }}
      />

      {/* mission HUD — ARC chrome, never corrupted */}
      <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: `1px solid ${T.hairline}`, background: `${T.panel}CC` }}>
        <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", color: T.textSecondary }}>
          {manifest.caseNumber} // {manifest.title.toUpperCase()}
        </span>
        <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", color: T.textSecondary }}>
          XP <span style={{ color: T.textPrimary }}>{xp}</span>
          <span aria-hidden style={{ color: T.textDisabled }}> · </span>
          <span style={{ color: T.arcCyan }}>{describePos(pos, manifest)}</span>
        </span>
      </div>

      <div style={{ position: "relative", maxWidth: 880, margin: "0 auto", padding: "44px 24px 90px" }}>
        {resumeOffer ? (
          <ResumeScene cp={resumeOffer} manifest={manifest} onResume={resume} onRestart={restart} />
        ) : (
          <>
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
            {pos.beat === "closed" && <ClosedScene manifest={manifest} reduced={reduced} audio={audio} emit={emit} />}
          </>
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
  return (
    <section style={{ paddingTop: 76 }}>
      <Eyebrow text="ARC secure net — incoming transmission" color={T.arcCyan} />
      <h1 style={{ fontFamily: MONO, fontSize: "clamp(30px, 6vw, 52px)", fontWeight: 600, margin: "18px 0 26px", minHeight: "1.2em" }}>
        <Resolve text={manifest.transmission.headline} reduced={reduced} />
      </h1>
      <div style={{ maxWidth: 560, borderLeft: `2px solid ${T.hairline}`, paddingLeft: 18 }}>
        {manifest.transmission.lines.map((line, i) => (
          <p key={i} style={{ fontSize: 16, lineHeight: 1.6, color: i === 0 ? T.textPrimary : T.textSecondary, margin: i === 0 ? 0 : "12px 0 0" }}>
            {line}
          </p>
        ))}
      </div>
      <div style={{ marginTop: 36, display: "flex", alignItems: "center", gap: 18 }}>
        <AmberButton label="OPEN BRIEFING" onClick={onNext} />
        <span style={{ fontFamily: MONO, fontSize: 11, color: T.textDisabled, letterSpacing: "0.06em" }}>{manifest.caseNumber}</span>
      </div>
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
          <h2 style={{ fontFamily: MONO, fontSize: 26, fontWeight: 600, margin: "14px 0 4px" }}>{manifest.title}</h2>
          <p style={{ color: T.textSecondary, fontSize: 15, lineHeight: 1.6, margin: "10px 0 22px", maxWidth: 560 }}>{manifest.briefing.summary}</p>
          <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8, maxWidth: 480 }}>
            {manifest.briefing.objectives.map((o, i) => (
              <li key={o} style={{ fontFamily: MONO, fontSize: 13, color: T.textPrimary, background: T.panelRaised, border: `1px solid ${T.hairline}`, borderRadius: 2, padding: "10px 14px", display: "flex", gap: 12 }}>
                <span style={{ color: T.arcCyan }}>{String(i + 1).padStart(2, "0")}</span>
                {o}
              </li>
            ))}
          </ol>
          <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16 }}>
            <HandlerChip reduced={reduced} />
            <p style={{ margin: 0, fontSize: 14, color: T.textSecondary, fontStyle: "italic" }}>&ldquo;{manifest.briefing.wrenLine}&rdquo;</p>
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
        <IntelStage cycle={cycle} cycleIndex={cycleIndex} audio={audio} emit={emit} onNext={onNext} />
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

function IntelStage({ cycle, cycleIndex, audio, emit, onNext }: { cycle: CycleDef; cycleIndex: number; audio: ReturnType<typeof useSignalAudio>; emit: (e: AwardEvent) => void; onNext: () => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [settled, setSettled] = useState(false);
  const p = cycle.intel.prediction;

  const choose = (i: number) => {
    if (settled) return;
    setPicked(i);
    if (i === p.answer) {
      setSettled(true);
      audio.latch();
    } else {
      audio.thud();
    }
  };

  return (
    <div style={{ maxWidth: 620 }}>
      <div style={{ background: T.panel, border: `1px solid ${T.hairline}`, borderRadius: 3, padding: "20px 22px" }}>
        {cycle.intel.beats.map((b, i) => (
          <p key={i} style={{ fontSize: 15, lineHeight: 1.65, color: T.textPrimary, margin: i === 0 ? 0 : "14px 0 0" }}>
            {b}
          </p>
        ))}
      </div>

      <div style={{ marginTop: 16, background: T.panelRaised, border: `1px solid ${T.hairline}`, borderRadius: 3, padding: "18px 20px" }}>
        <Eyebrow text="Prediction — call it before you see it" color={T.actionAmber} />
        <p style={{ fontSize: 15, lineHeight: 1.6, margin: "10px 0 12px" }}>{p.question}</p>
        <div style={{ display: "grid", gap: 8 }}>
          {p.options.map((o, i) => {
            const isPicked = picked === i;
            const state = isPicked ? (i === p.answer ? T.confirmedGreen : T.threatRed) : null;
            return (
              <button
                key={o}
                onClick={() => choose(i)}
                className="sr-btn"
                style={{
                  textAlign: "left",
                  fontFamily: MONO,
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: state ?? T.textPrimary,
                  background: state ? `${state}14` : T.panel,
                  border: `1px solid ${state ?? T.hairline}`,
                  borderRadius: 3,
                  padding: "11px 13px",
                  cursor: settled ? "default" : "pointer",
                }}
              >
                {o}
              </button>
            );
          })}
        </div>
        {picked !== null && (
          <p role="status" style={{ margin: "12px 0 0", fontSize: 13.5, lineHeight: 1.6, color: settled ? T.confirmedGreen : T.textSecondary }}>
            {settled ? p.right : p.wrong}
          </p>
        )}
      </div>

      {settled && (
        <div style={{ marginTop: 18 }}>
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
  return <Profile payload={fw.payload} {...props} />;
}

function CheckpointStage({ cycle, cycleIndex, reduced, audio, emit, onNext }: { cycle: CycleDef; cycleIndex: number; reduced: boolean; audio: ReturnType<typeof useSignalAudio>; emit: (e: AwardEvent) => void; onNext: () => void }) {
  const [qIndex, setQIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(1);
  const [evidence, setEvidence] = useState<CheckpointEvidence[]>([]);
  const [passed, setPassed] = useState(false);
  const questions = cycle.checkpoint.questions;
  const q = questions[Math.min(qIndex, questions.length - 1)];

  const choose = (i: number) => {
    if (passed || picked === i) return;
    setPicked(i);
    if (i === q.answer) {
      audio.latch();
      const record: CheckpointEvidence = { questionId: q.id, answerIndex: i, attempts };
      const nextEvidence = [...evidence, record];
      if (qIndex + 1 < questions.length) {
        window.setTimeout(() => {
          setEvidence(nextEvidence);
          setQIndex(qIndex + 1);
          setPicked(null);
          setAttempts(1);
        }, 650);
      } else {
        setEvidence(nextEvidence);
        setPassed(true);
        audio.stamp();
        emit({ type: "CHECKPOINT_PASSED", sourceKey: `cycle-${cycleIndex}`, evidence: nextEvidence });
      }
    } else {
      audio.thud();
      setAttempts((a) => a + 1);
    }
  };

  return (
    <div style={{ maxWidth: 620, position: "relative" }}>
      <div style={{ background: T.panel, border: `1px solid ${T.hairline}`, borderRadius: 3, padding: "20px 22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <Eyebrow text={`Checkpoint — prove it`} />
          <span style={{ fontFamily: MONO, fontSize: 12, color: T.textSecondary }}>
            {Math.min(qIndex + 1, questions.length)}/{questions.length}
          </span>
        </div>
        <p style={{ fontSize: 15, lineHeight: 1.6, margin: "12px 0 12px" }}>{q.question}</p>
        <div style={{ display: "grid", gap: 8 }}>
          {q.options.map((o, i) => {
            const isPicked = picked === i;
            const state = isPicked ? (i === q.answer ? T.confirmedGreen : T.threatRed) : null;
            return (
              <button
                key={o}
                onClick={() => choose(i)}
                className="sr-btn"
                style={{
                  textAlign: "left",
                  fontFamily: MONO,
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: state ?? T.textPrimary,
                  background: state ? `${state}14` : T.panelRaised,
                  border: `1px solid ${state ?? T.hairline}`,
                  borderRadius: 3,
                  padding: "11px 13px",
                  cursor: passed ? "default" : "pointer",
                }}
              >
                {o}
              </button>
            );
          })}
        </div>
        {picked !== null && picked !== q.answer && (
          <p role="status" style={{ margin: "12px 0 0", fontSize: 13, color: T.textSecondary }}>
            Not that one. Read it again — the case file already showed you the answer.
          </p>
        )}
        {passed && (
          <p role="status" style={{ margin: "12px 0 0", fontFamily: MONO, fontSize: 12, letterSpacing: "0.06em", color: T.confirmedGreen }}>
            CHECKPOINT PASSED — evidence filed.
          </p>
        )}
      </div>

      <StampMark text="PASSED" visible={passed} reduced={reduced} style={{ position: "absolute", top: -12, right: 14 }} />

      {passed && (
        <div style={{ marginTop: 18 }}>
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18, flexWrap: "wrap", gap: 8 }}>
        <Eyebrow text={`Incident — ${manifest.incident.title}`} color={T.threatRed} />
        <span style={{ fontFamily: MONO, fontSize: 11, color: T.textDisabled, letterSpacing: "0.06em" }}>LIVE CASE</span>
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

function ClosedScene({ manifest, reduced, audio, emit }: { manifest: MissionManifest; reduced: boolean; audio: ReturnType<typeof useSignalAudio>; emit: (e: AwardEvent) => void }) {
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
        <p style={{ textAlign: "center", marginTop: 44, fontFamily: MONO, fontSize: 13, color: T.textSecondary, letterSpacing: "0.06em" }}>
          That&rsquo;s the mission, Operative. ARC out.
        </p>
      )}
    </section>
  );
}
