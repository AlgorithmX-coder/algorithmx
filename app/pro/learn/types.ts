import type { ComponentType } from "react";

/* Content contract for a Cyber Pro lesson. Lessons are content
 * (app/pro/lessons/weekNN.ts); the engine (LessonPlayer) is structure.
 * The four beats mirror the canon teaching loop: Learn -> See -> Try ->
 * Check. Rule from the Explorers engine: the manifest is data-only, so
 * authoring a lesson never touches engine code. */

/* ---- LEARN ---- */

export interface LearnCard {
  heading: string;
  /* Plain-English teaching paragraphs. Adult voice, no jargon before
   * it is defined. */
  body: string[];
  /* A few concrete examples of the idea, to help it land. */
  examples?: string[];
  /* One everyday analogy, set apart visually. */
  analogy?: { plain: string; realTerm: string };
  /* Optional captioned diagram slug the engine knows how to draw. */
  diagram?: "hash-oneway" | "avalanche";
}

/* A key term the learner can hover/tap for a plain-language meaning.
 * Definitions are written in-house (never copied from a dictionary). */
export interface GlossaryEntry {
  term: string;
  definition: string;
}

/* ---- SEE (real cases; sourced public record only) ---- */

export interface CaseCard {
  org: string;
  year: string;
  headline: string;
  whatHappened: string;
  theMissedMeasure: string;
  theCost: string;
  /* Which of the Cyber Essentials five controls would have helped.
   * Ties every case back to the same recurring scorecard. */
  control: "access-control" | "secure-configuration" | "patching" | "malware-protection" | "firewalls";
  source: string; // primary reference, verified at authoring time
  /* Optional brand colour for the company logo chip (its real brand
   * colour where known). Falls back to the tier accent. */
  brandColor?: string;
  /* A real piece of press coverage, as a sourced headline card (we cite
   * the headline/outlet/date and link out; we never embed a copyrighted
   * article screenshot). Verify the headline + url at authoring time. */
  news?: { headline: string; outlet: string; date: string; url?: string };
}

/* ---- TRY ---- */

/* The play area is a bespoke per-lesson component the engine mounts.
 * It reports back when the learner has actually engaged with it, so the
 * engine can gate progress on doing, not just reading. */
export interface LabProps {
  onDidTry: () => void;
}
export type Lab = ComponentType<LabProps>;

export interface LabDef {
  title: string;
  /* One line shown above the lab (e.g. the zero-egress reassurance),
   * per-lesson so the engine stays content-agnostic. */
  intro?: string;
  /* Short nudges shown beside the lab to guide exploration. */
  prompts: string[];
  component: Lab;
}

/* ---- CHECK ---- */

export interface QuizQuestion {
  q: string;
  options: string[];
  answer: number; // index of the correct option
  why: string; // shown after answering, right or wrong
}

export interface ExplainBack {
  prompt: string;
  /* Revealed after the learner writes their own answer; a model of a
   * strong reply, never marked against their exact words. */
  modelAnswer: string;
}

/* ---- the whole lesson ---- */

export const FIVE_CONTROLS: Record<CaseCard["control"], string> = {
  "firewalls": "Firewalls",
  "secure-configuration": "Secure configuration",
  "access-control": "Access control",
  "malware-protection": "Malware protection",
  "patching": "Security update management",
};

export type LessonPhase = "intro" | "learn" | "see" | "try" | "check" | "done";

export interface LessonManifest {
  id: string; // "week-01"
  weekLabel: string; // "Week 1"
  act: string; // "Act 1 - Foundations you can touch"
  title: string;
  role: string; // the real job role this connects to
  minutes: number;
  /* One-line promise shown on the intro card. */
  promise: string;
  learn: LearnCard[];
  /* Key terms the learner can hover/tap in the Learn text for a
   * plain-language meaning. */
  glossary?: GlossaryEntry[];
  /* Heading for the See phase (defaults to a generic line). */
  seeHeading?: string;
  cases: CaseCard[];
  lab: LabDef;
  check: { explain: ExplainBack; quiz: QuizQuestion[] };
  /* Wrap-up: the real project this lesson kicks off, plus takeaways. */
  wrap: {
    /* The "lesson complete" headline (defaults to a generic line). */
    headline?: string;
    takeaways: string[];
    project: { name: string; blurb: string };
    ethicsNote?: string; // CMA 1990 / responsible-use reminder where relevant
  };
}

/* A topic is a single Learn -> See -> Try -> Check lesson. A week groups
 * several of them; `LessonManifest` and `TopicManifest` are the same shape. */
export type TopicManifest = LessonManifest;

/* ---- a WEEK: a group of topics ----
 * Feedback: one lesson is too short to be a whole week. A week now bundles
 * ~5 focused topics (each a full lesson), so a week is a proper ~2 hours.
 * The week adds an overview "map" and a completion screen on top. */
export interface WeekManifest {
  id: string; // "week-01"
  weekLabel: string; // "Week 1"
  act: string; // "Act 1 - Foundations you can touch"
  title: string; // the week's theme, e.g. "Passwords & account security"
  /* One-line overview shown on the week map. */
  intro: string;
  /* Why this whole week matters (career framing). */
  role: string;
  /* What the learner can do once the week is finished. */
  outcomes: string[];
  topics: TopicManifest[];
}

export const weekProgressKey = (id: string) => `pro:week:${id}`;

export interface WeekProgress {
  id: string;
  /* topic ids the learner has completed */
  doneTopics: string[];
}

/* ---- resume (localStorage for the prototype) ---- */

export const lessonCheckpointKey = (id: string) => `pro:lesson:${id}`;

export interface LessonCheckpoint {
  id: string;
  phase: LessonPhase;
  didTry: boolean;
  explainDraft: string;
  quizAnswers: (number | null)[];
}
