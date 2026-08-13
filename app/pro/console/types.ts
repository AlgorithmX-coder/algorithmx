import type { ComponentType } from "react";

/* Content contract for Cyber Pro console cases. Cases are content
 * (app/pro/cases/caseNN.ts); structure lives in the console engine.
 * Rule carried from the Explorers engine: the manifest is data-only so
 * authoring a new case never touches engine code. */

export type Severity = "low" | "medium" | "high" | "critical";

export type TriageClassification =
  | "false-positive"
  | "true-positive-benign"
  | "true-positive-malicious";

export const CLASSIFICATION_LABELS: Record<TriageClassification, string> = {
  "false-positive": "False positive",
  "true-positive-benign": "True positive, benign",
  "true-positive-malicious": "True positive, malicious",
};

/* One rendered line in the log viewer. `entities` lists entity ids
 * whose literal text appears in `text`; the viewer turns those spans
 * into clickable chips. */
export interface LogLine {
  t: string;              // "09:14:02"
  source: string;         // "DC-01/Security"
  eventId?: number;       // 4624, 4625, ...
  text: string;
  entities?: string[];
}

export interface EntityCardRow {
  k: string;
  v: string;
}

/* A pivotable entity (IP, account, host). All enrichment data is
 * offline training data baked into the manifest: the console makes no
 * network calls by design, same structural guarantee as the Ops range. */
export interface CaseEntity {
  id: string;
  kind: "ip" | "account" | "host";
  label: string;          // the literal text as it appears in logs
  title: string;
  rows: EntityCardRow[];
  note?: string;          // analyst-voice takeaway for this entity
}

export interface CaseVerdict {
  classification: TriageClassification;
  escalate: boolean;
  severity: Severity;
}

export interface CaseManifest {
  id: string;             // "case-01"
  alertId: string;        // "ALRT-4102"
  title: string;
  firedAt: string;        // display only
  source: string;         // detection source shown on the alert card
  severityAuto: Severity; // what the detection auto-assigned
  summary: string;        // the alert description an analyst first reads
  attack: { techniqueId: string; techniqueName: string };
  logs: LogLine[];
  entities: CaseEntity[];
  correct: CaseVerdict;
  /* Rubric: strings a strong ticket cites verbatim (event ids, IOCs,
   * account names). The review counts how many appear in the notes. */
  evidenceKeywords: string[];
  /* Hint ladder for a wrong classification; last rung all but states
   * the answer. Everyone gets the win (Ops range rule). */
  hints: string[];
  debrief: string[];
}

/* ---- resume + portfolio (localStorage for the skeleton) ----
 * Payload shape mirrors the Explorers MissionCheckpoint philosophy so
 * the eventual server swap is a transport change, not a redesign. */

export type ConsolePhase = "briefing" | "console" | "review";

export interface TicketDraft {
  classification: TriageClassification | null;
  severity: Severity | null;
  escalate: boolean;
  notes: string;
}

export interface CaseCheckpoint {
  caseId: string;
  phase: ConsolePhase;
  ticket: TicketDraft;
  hintsUsed: number;
  closedAt?: string; // ISO date when the case was closed correctly
}

export const caseCheckpointKey = (caseId: string) => `pro:checkpoint:${caseId}`;
export const PORTFOLIO_KEY = "pro:portfolio";

export interface PortfolioEntry {
  id: string;            // caseId
  title: string;
  markdown: string;
  savedAt: string;       // ISO date
}

/* Reserved seam for bespoke per-case interactive panels (the Ops range
 * `Act` pattern); unused by the skeleton but part of the contract so
 * week authoring can rely on it. */
export interface CasePanelProps {
  onEvidence: (keyword: string) => void;
}
export type CasePanel = ComponentType<CasePanelProps>;
