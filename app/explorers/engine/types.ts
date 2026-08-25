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
  /** Whether WREN's voice is on — mechanics with a review beat use it to speak
   *  the answer back during the "look it over" hold. */
  voiceOn?: boolean;
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
  /** WREN reviews the answer aloud during the "look it over" hold (public/ path). */
  doneAudio?: string;
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

export interface LeverRound {
  /** The barker's live line — the con working you in real time. */
  line: string;
  /** id of the pressure lever this line pulls (hurry|scarcity|authority|liking|fear|payback). */
  answer: string;
  /** Shown after a correct call — why it's that lever, and how naming it kills it. */
  why: string;
}

/**
 * LEVER — "Call the Lever" (Block 2 carnival signature). A barker works you
 * one line at a time; before the pitch lands the child taps the pressure lever
 * being pulled. Naming it right snaps it. A wrong tap buzzes and makes them read
 * the con again (no answer given). Self-contained carnival styling — the human-
 * factor block's deliberate break from the Signal Room look.
 */
export interface LeverPayload {
  intro: string;
  rounds: LeverRound[];
  doneLine: string;
  /** WREN's in-ear review, played on completion during the "look it over" hold. */
  doneAudio?: string;
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

export interface SortItem {
  id: string;
  label: string;
  /** id of the bucket this item belongs in. */
  bucket: string;
  /** Shown if the child drops it in the wrong bucket. */
  why: string;
}

export interface SortBucket {
  id: string;
  label: string;
  /** One-word helper under the bucket title ("keep private"). */
  hint?: string;
}

/**
 * SORT — triage under a rule (debuts M02). A pool of items, two or three
 * labelled buckets; the child taps an item then taps its bucket. A wrong
 * drop bounces back with a reason. Teaches the safe/scam, public/private
 * split as a physical sorting act, not another multiple-choice.
 */
export interface SortPayload {
  intro: string;
  buckets: SortBucket[];
  items: SortItem[];
  doneLine: string;
}

export interface MeterZone {
  /** Upper bound of this zone on the 0-100 track (inclusive). Ascending. */
  upTo: number;
  label: string;
  /** The live readout for this zone ("cracked in 2 seconds"). */
  caption: string;
  good: boolean;
}

/**
 * METER — set a level and watch it react (debuts M03). The child drags a
 * single slider; a live gauge + readout update per zone, and they must
 * park it in the safe zone to answer. Makes an abstract trade-off
 * (password length, how much to share) physical and immediate.
 */
export interface MeterPayload {
  intro: string;
  /** What the slider controls, kid-worded. */
  prompt: string;
  minLabel: string;
  maxLabel: string;
  /** Label above the live readout ("Time to crack:"). */
  readoutLabel: string;
  /** Sorted ascending by `upTo`; the last zone must reach 100. */
  zones: MeterZone[];
  doneLine: string;
  /** WREN reviews the answer aloud during the 15s "look it over" hold (public/ path). */
  doneAudio?: string;
}

export interface RedactSpan {
  id: string;
  text: string;
  /** True = private, must be blacked out; false = safe, bounces if tapped. */
  risky: boolean;
  why: string;
}

/**
 * REDACT — hide what's private (debuts M04). A real post/photo caption
 * split into spans; the child taps the risky ones to black them out and
 * leaves the safe ones alone. Tapping a safe span bounces with why it's
 * fine. The inverse of INSPECT: the action is to COVER, not to find.
 */
export interface RedactPayload {
  intro: string;
  /** Whose surface this is ("Maya's photo caption"). */
  surface: string;
  spans: RedactSpan[];
  doneLine: string;
  /** Completion button label (default "POST IT SAFELY"; a form uses e.g. "DONE"). */
  doneLabel?: string;
  /** WREN's spoken review, played on completion during the 15s "look it over" hold. */
  doneAudio?: string;
}

export interface UnmaskItem {
  id: string;
  /** The friendly "From" name the child sees first. */
  displayName: string;
  /** The real email address hiding behind the name (revealed on tap). */
  address: string;
  /** True = the address's real owner genuinely matches the brand. */
  real: boolean;
  /** Shown after submit — why this sender is genuine or a fake. */
  why: string;
}

/**
 * UNMASK — names lie, addresses don't (debuts M01, Skill 3). Each message shows
 * only a trusted-looking display name; the child taps to peel it back and reveal
 * the real address underneath, then calls REAL or FAKE on every one and submits
 * together. A two-step act — look first, judge second — so a friendly name can
 * never be taken at face value.
 */
export interface UnmaskPayload {
  intro: string;
  /** The brand every item claims to be, for the real/fake call. */
  brand: string;
  items: UnmaskItem[];
  doneLine: string;
  /** WREN reviews the answer aloud during the "look it over" hold (public/ path). */
  doneAudio?: string;
  /** The chip on each card ("SENDER" by default; a QR-code round uses "QR CODE"). */
  sourceLabel?: string;
  /** The reveal-button text (defaults to revealing an email address; QR "scans"). */
  revealText?: string;
}

export type FieldworkDef =
  | { verb: "INSPECT"; payload: InspectPayload }
  | { verb: "DECIDE"; payload: DecidePayload }
  | { verb: "PROFILE"; payload: ProfilePayload }
  | { verb: "TRACE"; payload: TracePayload }
  | { verb: "SIMULATE"; payload: SimulatePayload }
  | { verb: "BUILD"; payload: BuildPayload }
  | { verb: "CIPHER"; payload: CipherPayload }
  | { verb: "SORT"; payload: SortPayload }
  | { verb: "METER"; payload: MeterPayload }
  | { verb: "REDACT"; payload: RedactPayload }
  | { verb: "UNMASK"; payload: UnmaskPayload }
  | { verb: "LEVER"; payload: LeverPayload };

/* ------------------------------------------------------------ cycles */

export interface PredictionQ {
  question: string;
  options: string[];
  answer: number;
  right: string;
  wrong: string;
  /** Optional "Need a hint?" nudge the child can reveal before answering. */
  hint?: string;
}

export interface CheckpointQ {
  id: string;
  question: string;
  options: string[];
  answer: number;
}

export interface ArtifactHotspot {
  id: string;
  /** Short callout header ("The countdown"). */
  label: string;
  /** The teaching that appears when this spot is tapped. */
  reveal: string;
  /** WREN voice for the reveal (public/ path). */
  audio?: string;
}

/**
 * ARTIFACT lesson — an alternative to chat-bubble beats. The real scam
 * message fills the screen; the child taps its suspicious parts and the
 * teaching pops ON the message. They uncover the lesson by exploring, so
 * nothing is "dumped at the end". One of the per-case delivery styles: a
 * cycle uses this when `intel.artifact` is set, otherwise it uses `beats`.
 */
export interface ArtifactLesson {
  /** Bold "your mission" line above the artifact, voiced. */
  intro: string;
  introAudio?: string;
  device?: { app: string; owner: string };
  /** The message in order; a segment with a hotspotId is tappable. */
  segments: { id: string; text: string; hotspotId?: string; mono?: boolean }[];
  hotspots: ArtifactHotspot[];
  /** Shown once every hotspot is uncovered, voiced. */
  doneLine: string;
  doneAudio?: string;
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
    /** Alternative delivery: teach ON the real message instead of chat bubbles. Takes precedence over `beats` when set. */
    artifact?: ArtifactLesson;
    /** Optional mid-lesson "your call". Structure v2 (teach->practice->test) OMITS
     * this — the LEARN stage is pure teaching, then goes straight to PRACTICE. */
    prediction?: PredictionQ;
    /** WREN voices the "your call" question when it appears, then reacts to the
     * answer (right/wrong), turning the checkpoint into a real back-and-forth. */
    predictionAudio?: { question?: string; right?: string; wrong?: string };
  };
  fieldwork: FieldworkDef;
  /** WREN VO that explains the PLAY exercise set-up (public/ path); played once when PLAY opens. */
  playAudio?: string;
  /** Optional per-skill quiz. Structure v2 OMITS this — the only graded test is
   * the end-of-case `catchThem`. When absent the cycle is just LEARN -> PRACTICE. */
  checkpoint?: { questions: CheckpointQ[] };
}

/* --------------------------------------------------------- catch them */

export interface CatchScenario {
  id: string;
  /** Which taught skill (cycle index, 0-based) this question checks. Every question
   *  MUST be 100% answerable from that skill's LEARN material — no outside knowledge. */
  skill: number;
  /** The fresh fake/situation the child has never seen before. */
  prompt: string;
  /** Optional evidence line shown in a mono panel (a link, a message). */
  evidence?: string;
  options: string[];
  answer: number;
}

/**
 * CASE TEST — the must-pass end-of-case exam (base = Mission 01). After the
 * boss, the child answers `scenarios` fresh questions BLIND (no right/wrong
 * shown per question). At the end they see only their score: `pass` or more
 * closes the case; below `pass` they must resit the WHOLE case (lessons +
 * test), and are never told which questions they missed. Optional — a mission
 * without a `catchThem` closes straight from the boss, unchanged.
 */
export interface CatchThemDef {
  /** WREN sets up the test. */
  intro: string;
  /** How many correct to pass and close the case (e.g. 4 of 5). */
  pass: number;
  scenarios: CatchScenario[];
  /** WREN voice for the intro + pass/fail beats (public/ paths). */
  voice?: { intro?: string; pass?: string; fail?: string };
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
  /** 3 to 5 skills. Three is the default spine; a case adds a 4th/5th only when
   *  the topic genuinely earns it. The tuple-plus-rest keeps a compile-time floor
   *  of three while allowing more; the engine derives every step from the length. */
  cycles: [CycleDef, CycleDef, CycleDef, ...CycleDef[]];
  /** One-line hook WREN speaks on the Mission Start map (≤20 words). Falls back to transmission.lines[0]. */
  hook?: string;
  /** Cinematic 21:9 cold-open scene image (public/ path) — the mission's establishing shot. */
  scene?: string;
  /** Optional world skin for the mission shell. "carnival" swaps the ink-black
   *  Signal Room ground for Block 2's warm carnival-at-night ground. Additive —
   *  omitting it keeps the default Signal Room look (all of Block 1). */
  theme?: "carnival";
  incident: {
    title: string;
    phases: number;
    /** Kid-worded phase names for the boss pips ("Find the hub"). Falls back to PHASE 1..N. */
    phaseNames?: string[];
    component: ComponentType<IncidentProps>;
  };
  /** Must-pass end gate: fresh fakes the child clears to close the case. Optional. */
  catchThem?: CatchThemDef;
  debrief: { report: string[]; realWorldMove: string; wrenLine: string };
  dossier: { mo: string; defeatedBy: string; breadcrumb?: string };
  /** WREN VO clips per beat (public/ paths). Played mute-gated at 0.55. */
  voice?: { transmission?: string; briefing?: string; debrief?: string };
}

/* ------------------------------------------------------- save/resume */

export type BeatPos =
  | { beat: "transmission" | "briefing" | "catch" | "debrief" | "closed" }
  | { beat: "cycle"; cycleIndex: number; stage: "intel" | "fieldwork" | "checkpoint" }
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
