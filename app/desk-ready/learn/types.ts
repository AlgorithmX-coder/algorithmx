import type { ComponentType, ReactNode } from "react";

/* Content contract for a Desk Ready lesson ("topic"). Lessons are content
 * (app/desk-ready/lessons/mN.tsx); the engine (TopicPlayer) is structure.
 *
 * The loop is the Pro loop made gentler for an adult who is new to
 * computers: Learn (one idea per screen) -> Try it (in a pretend office)
 * -> three quick questions -> done. No real-company case studies and no
 * written "explain it back": the doing is the proof.
 *
 * A manifest holds functions (the Try components and their checking
 * rules), so it is imported by a client component, never passed across
 * the server/client boundary as a prop. */

/* A short example shown inside a Learn screen: a line of an email, a
 * subject, a greeting. `good` reads green with a tick, `bad` red with a
 * cross, so the learner sees "do this, not this" at a glance. */
export interface Example {
  text: string;
  note?: string;
}

export interface LearnCard {
  heading: string;
  /* A drawn picture of the real thing (learn/figures): the whole email or
   * sheet with its parts numbered, or one part lit up. Every lesson opens
   * with the whole picture (owner 2026-11-11). */
  figure?: ReactNode;
  /* Plain English, short sentences. One idea per card. */
  body: string[];
  good?: Example[];
  bad?: Example[];
  /* One practical tip, set apart. */
  tip?: string;
}

/* A Try activity's score, when it can measure one. The player nudges a
 * learner below 80% to have another go (soft gate, the owner's Pro rule). */
export type TryScore = { correct: number; total: number };

export interface LabProps {
  /* Called each time the learner finishes or re-checks the activity. */
  onDone: (score?: TryScore) => void;
}

export interface TryIt {
  title: string;
  /* One or two lines telling the learner what to do. */
  intro: string;
  Lab: ComponentType<LabProps>;
}

export interface QuizQuestion {
  q: string;
  options: string[];
  answer: number; // index of the correct option, before shuffling
  /* One reason per option, parallel to `options`. A wrong pick shows its
   * reason and lets the learner try again; the right pick shows its own. */
  reasons: string[];
}

export interface Topic {
  id: string; // "m2t1", unique across the whole course
  title: string;
  minutes: number;
  /* A warm one- or two-sentence introduction ("In this lesson ..."). */
  brief: string;
  learn: LearnCard[];
  tryIt: TryIt;
  check: QuizQuestion[];
  /* What to remember, shown on the done screen. */
  takeaways: string[];
}

export interface ModuleManifest {
  id: string; // "m2", matches the syllabus id and the route
  number: number;
  title: string;
  intro: string;
  /* What the learner can do once the module is finished. */
  outcomes: string[];
  topics: Topic[];
}
