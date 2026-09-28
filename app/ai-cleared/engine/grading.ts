import type { DataClass, Verdict } from "./types";

/* Client-safe grading text shared by the browser (instant rules verdict)
 * and the grade route (the fallback when the model is unavailable). */

export interface GradeResult {
  verdict: Verdict;
  findings: { text: string; cls: DataClass; why: string }[];
  rewrite: string;
  coach: string;
  counts: Record<DataClass, number>;
  source: "rules" | "model";
}

export const DEFAULT_WHY: Record<DataClass, string> = {
  P: "Already public. Fine anywhere.",
  I: "Allowed in the firm's enterprise tool, never in a personal one.",
  C: "A client could be identified from this.",
  R: "This class never enters a prompt.",
};

export const DEFAULT_COACH: Record<Verdict, string> = {
  ok: "Nothing above INTERNAL left the building, and INTERNAL is allowed in the firm's enterprise tool. Cleared.",
  warn: "The draft would have been just as good with a placeholder. A client name in a transcript is a record the firm now has to protect.",
  crit: "RESTRICTED data in a prompt is a reportable incident whether or not anyone reads it. In real life, this is the moment you tell your data protection lead.",
};

export const VERDICT_LINE: Record<Verdict, string> = {
  ok: "Nothing above INTERNAL left the building.",
  warn: "CONFIDENTIAL detail went out that a placeholder would have covered.",
  crit: "RESTRICTED data was in the prompt.",
};
