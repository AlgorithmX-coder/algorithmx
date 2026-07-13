/**
 * Cyber Explorers engine contracts — the definitive shapes behind
 * `docs/explorers/mission-template-v1.md` §4–§6.
 *
 * Missions are content; structure lives in the engine. A mission is a
 * MissionManifest plus one bespoke Incident component. Mechanics are
 * pure content-renderers: no XP math, no persistence, no navigation —
 * the runtime owns all three.
 */

import type { ComponentType } from "react";

export type Classification = "CONFIDENTIAL" | "SECRET" | "TOP SECRET" | "ULTRA";

/* ------------------------------------------------------- award events */

export type AwardEvent =
  | { type: "INTEL_COMPLETED"; sourceKey: string }
  | { type: "FIELDWORK_COMPLETED"; sourceKey: string; mastery: boolean }
  | { type: "CHECKPOINT_PASSED"; sourceKey: string; evidence: CheckpointEvidence[] }
  | { type: "INCIDENT_PHASE_CLEARED"; sourceKey: string }
  | { type: "CASE_CLOSED"; sourceKey: string };

/** Accreditation seam (template §7): outcome records, data-minimal. */
export interface CheckpointEvidence {
  questionId: string;
  answerIndex: number;
  attempts: number;
}

/**
 * The RULES table (template §6). Server-authoritative once the award
 * route lands; the slice runs the same table behind the runtime's stub
 * seam. An XP number appearing anywhere else is a bug.
 */
export const XP_RULES = {
  INTEL_COMPLETED: 10,
  FIELDWORK_COMPLETED: 20,
  FIELDWORK_MASTERY: 5,
  CHECKPOINT_PASSED: 25,
  INCIDENT_PHASE_CLEARED: 20,
  CASE_CLOSED: 50,
} as const;

export function xpForEvent(e: AwardEvent): number {
  const base = XP_RULES[e.type];
  if (e.type === "FIELDWORK_COMPLETED" && e.mastery) {
    return base + XP_RULES.FIELDWORK_MASTERY;
  }
  return base;
}

/* --------------------------------------------------- mechanic contract */

export interface SignalAudio {
  click(): void;
  latch(): void;
  thud(): void;
  stamp(): void;
}

export type MechanicEvent =
  | { kind: "HIT" }
  | { kind: "MISS" }
  | { kind: "COMPLETED"; mastery: boolean };

export interface MechanicProps<P> {
  payload: P;
  /** OS reduced-motion, resolved once by the runtime. */
  reduced: boolean;
  audio: SignalAudio;
  onEvent: (e: MechanicEvent) => void;
}

/* -------------------------------------------------- mechanic payloads */

export interface EvidenceSegment {
  id: string;
  text: string;
  /** Present = this segment is a tell; absent = decoy (miss on tap). */
  tellId?: string;
  mono?: boolean;
}

export interface InspectTell {
  id: string;
  label: string;
  why: string;
}

export interface InspectPayload {
  intro: string;
  /** Captured-screen framing: which app, whose device. */
  device?: { app: string; owner: string };
  header: { label: string; seg: EvidenceSegment }[];
  body: EvidenceSegment[][];
  tells: InspectTell[];
  doneLine: string;
}

export interface DecideOption {
  id: string;
  label: string;
  outcome: string;
  correct?: boolean;
}

export interface DecidePayload {
  intro: string;
  situation: string;
  prompt: string;
  options: DecideOption[];
}

export interface ProfileBehavior {
  id: string;
  label: string;
  matches: boolean;
}

export interface ProfilePayload {
  intro: string;
  evidence: string[];
  behaviors: ProfileBehavior[];
  picks: number;
  doneLine: string;
}

export interface TraceCard {
  id: string;
  surface: string;
  from: string;
  text: string;
  /** True = part of the campaign; false = decoy noise. */
  inCampaign: boolean;
  /** The fingerprint highlighted once pinned (campaign cards only). */
  clue?: string;
  /** Funnel position, 1-based (campaign cards only). */
  order?: number;
}

export interface TracePayload {
  intro: string;
  fingerprintHint: string;
  cards: TraceCard[];
  stage2Prompt: string;
  doneLine: string;
}

export type FieldworkDef =
  | { verb: "INSPECT"; payload: InspectPayload }
  | { verb: "DECIDE"; payload: DecidePayload }
  | { verb: "PROFILE"; payload: ProfilePayload }
  | { verb: "TRACE"; payload: TracePayload };

/* ------------------------------------------------------------ cycles */

export interface PredictionQ {
  question: string;
  options: string[];
  answer: number;
  right: string;
  wrong: string;
}

export interface CheckpointQ {
  id: string;
  question: string;
  options: string[];
  answer: number;
}

export interface CycleDef {
  id: string;
  title: string;
  concept: string;
  intel: { beats: string[]; prediction: PredictionQ };
  fieldwork: FieldworkDef;
  checkpoint: { questions: CheckpointQ[] };
}

/* ---------------------------------------------------------- incident */

export interface IncidentProps {
  reduced: boolean;
  audio: SignalAudio;
  onPhaseCleared: (phase: number) => void;
  onComplete: () => void;
}

/* ---------------------------------------------------------- manifest */

export interface MissionManifest {
  id: string;
  caseNumber: string;
  title: string;
  block: 1 | 2 | 3 | 4;
  classification: Classification;
  actor: { codename: string; mo: string };
  transmission: { headline: string; lines: string[] };
  briefing: {
    summary: string;
    objectives: [string, string, string];
    wrenLine: string;
  };
  cycles: [CycleDef, CycleDef, CycleDef];
  incident: {
    title: string;
    phases: number;
    component: ComponentType<IncidentProps>;
  };
  debrief: { report: string[]; realWorldMove: string; wrenLine: string };
  dossier: { mo: string; defeatedBy: string; breadcrumb?: string };
}

/* ------------------------------------------------------- save/resume */

export type BeatPos =
  | { beat: "transmission" | "briefing" | "debrief" | "closed" }
  | { beat: "cycle"; cycleIndex: 0 | 1 | 2; stage: "intel" | "fieldwork" | "checkpoint" }
  | { beat: "incident"; incidentPhase: number };

/**
 * Template §5. Slice transport: localStorage. Server transport: the
 * planned `Progress.checkpoint Json?` column — same payload, so the
 * swap is a transport change, not a redesign. `mechanicState` is
 * reserved; the slice resumes at sub-beat start.
 */
export interface MissionCheckpoint {
  missionId: string;
  pos: BeatPos;
  events: AwardEvent[];
  mechanicState?: unknown;
}

export const checkpointStorageKey = (missionId: string) =>
  `explorers:checkpoint:${missionId}`;
