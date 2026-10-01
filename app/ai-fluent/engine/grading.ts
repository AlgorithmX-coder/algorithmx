import type { RubricElement } from "@/app/ai-cleared/engine/types";
import type { GradeResult } from "@/app/ai-cleared/engine/grading";

/* Client-safe grading text and shapes for AI Fluent: what the rubric
 * grader returns, and the default lines the browser shows the instant a
 * send lands, before the model's own words replace them. */

export type FluentVerdict = "fluent" | "nearly" | "notyet";
export type Move = "moved" | "repeated" | "wandered";

export interface ElementScore {
  key: RubricElement;
  /* 0 absent, 1 present but weak, 2 present and apt. */
  score: 0 | 1 | 2;
  why: string;
}

export interface TurnScore {
  i: number;
  move: Move;
  why: string;
}

export interface FluentGrade {
  verdict: FluentVerdict;
  /* 0 to 100, the rubric's share of the marks earned. */
  score: number;
  elements: ElementScore[];
  turns: TurnScore[];
  coach: string;
  source: "rules" | "model";
  /* Set instead of a score when the leak rules caught something: the
   * Cleared panel shows and the turn does not count. */
  leak?: GradeResult;
}

export const FLUENT_RANK: Record<FluentVerdict, number> = { fluent: 0, nearly: 1, notyet: 2 };

export const FLUENT_LABEL: Record<FluentVerdict, string> = { fluent: "Fluent", nearly: "Nearly", notyet: "Not yet" };

export const FLUENT_LINE: Record<FluentVerdict, string> = {
  fluent: "The loop was run well: the prompt says what it wants and the turn moved the work on.",
  nearly: "One move is missing; the panel names it.",
  notyet: "The first answer was taken as the answer. Two or more moves are missing.",
};

export const FLUENT_COACH: Record<FluentVerdict, string> = {
  fluent: "This is the habit: say what you want, look, fix the prompt, check. Keep it.",
  nearly: "Nearly there. Add the missing element and send again; the reply will change more than you expect.",
  notyet: "Start with who the output is for and what they need to do with it, then the format and the length. The tool cannot guess those.",
};

export const MOVE_LABEL: Record<Move, string> = { moved: "Moved the work on", repeated: "Repeated the task", wandered: "Wandered" };

/* Default why lines by element and score, used until the model speaks. */
export const ELEMENT_WHY: Record<RubricElement, { 0: string; 2: string }> = {
  role: { 0: "No role given. Tell the tool who it is writing as.", 2: "A role is set." },
  reader: { 0: "No reader named. Who will use this, and what will they do with it?", 2: "The reader is named." },
  task: { 0: "No clear task. One verb and one object.", 2: "The task is clear." },
  format: { 0: "No format. A table, a list, an email, a memo: say which.", 2: "The format is fixed." },
  length: { 0: "No length. A number of words, bullets or pages.", 2: "The length is set." },
  constraints: { 0: "No constraints. Tone, what to include, what to leave out.", 2: "Constraints are given." },
  material: { 0: "The tool is not pointed at the material it needs.", 2: "The material is referenced." },
  scope: { 0: "More than one request in one prompt. Ask for one thing, then the next.", 2: "One thing at a time." },
};
