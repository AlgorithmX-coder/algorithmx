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

export interface SimulateStep {
  /** What just happened in the con — shown as the attacker's move. */
  scene: string;
  /** The anticipation ask: what will they do NEXT? */
  question: string;
  options: [string, string, string];
  answer: 0 | 1 | 2;
  /** The con's actual next move, shown after the prediction. */
  reveal: string;
}

/**
 * SIMULATE — anticipation as defense (debuts M06). The child predicts
 * the attacker's next move and watches the reveal play out. Safety
 * line (art doc): the child PREDICTS attacks, never authors one — the
 * con plays itself; the child only reads it one move ahead.
 */
export interface SimulatePayload {
  intro: string;
  steps: SimulateStep[];
  doneLine: string;
}

export interface BuildSlotOption {
  id: string;
  label: string;
  good: boolean;
  why: string;
}

export interface BuildSlot {
  id: string;
  /** What this slot is for, kid-worded ("The master key"). */
  label: string;
  options: BuildSlotOption[];
}

/**
 * BUILD — constructive defense (debuts M11). The child assembles a
 * real defense from parts, slot by slot; a bad part explains itself
 * and can be swapped. When every slot holds a good part, the build
 * gets stress-tested and the attack bounces on screen.
 */
export interface BuildPayload {
  intro: string;
  /** What's being built ("Jake's password vault"). */
  target: string;
  slots: BuildSlot[];
  /** The stress-test result once the build is complete. */
  testLine: string;
  doneLine: string;
}

export interface CipherRound {
  id: string;
  /** Kid-framed task line for this round. */
  prompt: string;
  /** Plaintext (UPPERCASE A–Z + spaces); the mechanic derives the ciphertext. */
  plaintext: string;
  /** Caesar shift used to seal it (1–9). */
  shift: number;
  /** Shown once cracked. */
  why: string;
}

/**
 * CIPHER — make and break codes (debuts M12). The child cracks a
 * Caesar-sealed message by spinning a shift dial until it reads —
 * hands-on proof that simple ciphers always fall, setting up why
 * real encryption is different.
 */
export interface CipherPayload {
  intro: string;
  rounds: CipherRound[];
  doneLine: string;
}

export type FieldworkDef =
  | { verb: "INSPECT"; payload: InspectPayload }
  | { verb: "DECIDE"; payload: DecidePayload }
  | { verb: "PROFILE"; payload: ProfilePayload }
  | { verb: "TRACE"; payload: TracePayload }
  | { verb: "SIMULATE"; payload: SimulatePayload }
  | { verb: "BUILD"; payload: BuildPayload }
  | { verb: "CIPHER"; payload: CipherPayload };

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
  /** Plain one-line promise shown on the map ("You'll learn why 'free' online usually isn't."). Falls back to concept. */
  promise?: string;
  /** Verb-first instruction for the PLAY strip (≤10 words). Falls back to fieldwork payload intro. */
  instruction?: string;
  intel: {
    beats: string[];
    /** Narrator-led lessons: WREN VO per beat (public/ paths), 1:1 with `beats`. When present the LEARN beats auto-advance as each clip ends; a tap always overrides. */
    beatAudio?: string[];
    prediction: PredictionQ;
  };
  fieldwork: FieldworkDef;
  /** WREN VO that explains the PLAY exercise set-up (public/ path); played once when PLAY opens. */
  playAudio?: string;
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
  actor: { codename: string; mo: string; portrait?: string };
  transmission: { headline: string; lines: string[] };
  briefing: {
    summary: string;
    objectives: [string, string, string];
    wrenLine: string;
  };
  cycles: [CycleDef, CycleDef, CycleDef];
  /** One-line hook WREN speaks on the Mission Start map (≤20 words). Falls back to transmission.lines[0]. */
  hook?: string;
  /** Cinematic 21:9 cold-open scene image (public/ path) — the mission's establishing shot. */
  scene?: string;
  incident: {
    title: string;
    phases: number;
    /** Kid-worded phase names for the boss pips ("Find the hub"). Falls back to PHASE 1..N. */
    phaseNames?: string[];
    component: ComponentType<IncidentProps>;
  };
  debrief: { report: string[]; realWorldMove: string; wrenLine: string };
  dossier: { mo: string; defeatedBy: string; breadcrumb?: string };
  /** WREN VO clips per beat (public/ paths). Played mute-gated at 0.55. */
  voice?: { transmission?: string; briefing?: string; debrief?: string };
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
