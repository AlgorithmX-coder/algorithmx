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
  /* One everyday analogy, set apart visually. */
  analogy?: { plain: string; realTerm: string };
  /* Optional captioned diagram slug the engine knows how to draw. */
  diagram?: "hash-oneway" | "avalanche";
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
  cases: CaseCard[];
  lab: LabDef;
  check: { explain: ExplainBack; quiz: QuizQuestion[] };
  /* Wrap-up: the real project this lesson kicks off, plus takeaways. */
  wrap: {
    takeaways: string[];
    project: { name: string; blurb: string };
    ethicsNote?: string; // CMA 1990 / responsible-use reminder where relevant
  };
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
