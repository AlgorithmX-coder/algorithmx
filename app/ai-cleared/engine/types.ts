/* Content contract for an AI Cleared module. Modules are content
 * (app/ai-cleared/manifests/moduleN.ts); the engine (ClearedPlayer) is
 * structure. The manifest is data-only: authoring a module never touches
 * engine code, and a track is a different desk, never a different engine.
 *
 * Shape: Learn (three or four screens, one action each) -> Practise (one
 * task in a simulator with the grader) -> Prove (five items, pass at four).
 * The shared Learn screens are written once; the per-track block supplies
 * the data pack, the desk, the task, the builder and the prove bank. */

/* The four data classes, the one colour system of the whole course. */
export type DataClass = "P" | "I" | "C" | "R";
export const CLASS_ORDER: readonly DataClass[] = ["P", "I", "C", "R"];
export const CLASS_RANK: Record<DataClass, number> = { P: 0, I: 1, C: 2, R: 3 };
export const CLASS_DEFAULT_NAME: Record<DataClass, string> = {
  P: "PUBLIC",
  I: "INTERNAL",
  C: "CONFIDENTIAL",
  R: "RESTRICTED",
};

export type Track =
  | "finance"
  | "legal"
  | "hr"
  | "sales"
  | "support"
  | "ops"
  | "it"
  | "leadership"
  | "general";

export const TRACKS: readonly Track[] = ["finance", "legal", "hr", "sales", "support", "ops", "it", "leadership", "general"];

export const TRACK_LABEL: Record<Track, string> = {
  finance: "Finance and payroll",
  legal: "Legal and compliance",
  hr: "HR and people",
  sales: "Sales and marketing",
  support: "Customer support",
  ops: "Operations and admin",
  it: "Engineering and IT",
  leadership: "Leadership",
  general: "General",
};

export type Tool = "copilot" | "chatgpt" | "gemini" | "claude";
export const TOOL_LABEL: Record<Tool, string> = {
  copilot: "Copilot",
  chatgpt: "ChatGPT",
  gemini: "Gemini",
  claude: "Claude",
};

/* ok = cleared, warn = over-shared (CONFIDENTIAL went out), crit = leaked
 * (RESTRICTED went out). Mirrors SandboxVerdict in Prisma. */
export type Verdict = "ok" | "warn" | "crit";
export const VERDICT_RANK: Record<Verdict, number> = { ok: 0, warn: 1, crit: 2 };

/* ---- the data pack: what the rules layer knows ---- */

/* One entity from the practice data. `pattern` is a regex source so the
 * manifest stays serialisable (it crosses the server/client boundary). */
export interface PackEntity {
  pattern: string;
  flags?: string;
  cls: DataClass;
  label: string;
  /* What the local rewrite swaps the text for. Empty = drop it. */
  placeholder: string;
}

export interface DataPack {
  /* One paragraph the grader's system prompt carries, listing every
   * invented fact so the model can classify what the rules missed. */
  facts: string;
  entities: PackEntity[];
  /* Added to the rewrite when a RESTRICTED item was removed. */
  restrictedFallback?: string;
}

/* ---- the desk (dock) ---- */

export interface DeskRow {
  key: string;
  value: string;
  cls: DataClass;
}

export interface DeskDocument {
  title: string;
  cls: DataClass;
  rows: DeskRow[];
}

/* ---- Learn ---- */

export interface QuickCheck {
  question: string;
  snippet: string;
  options: DataClass[];
  answer: DataClass;
  why: string;
}

export interface TextPart {
  text: string;
  mark?: "redact" | "placeholder";
}

export type LearnScreen =
  | {
      kind: "intro";
      eyebrow: string;
      heading: string;
      lead: string;
      note?: string;
      cta: string;
    }
  | {
      kind: "tiles";
      eyebrow: string;
      heading: string;
      tiles: { cls: DataClass; title: string; body: string }[];
      check: QuickCheck;
    }
  | {
      kind: "reveal";
      eyebrow: string;
      heading: string;
      lead?: string;
      items: { title: string; body: string }[];
    }
  | {
      kind: "compare";
      eyebrow: string;
      heading: string;
      lead?: string;
      before: { label: string; parts: TextPart[] };
      after: { label: string; parts: TextPart[]; note: string };
      revealLabel: string;
      cta: string;
    };

/* ---- Practise ---- */

export interface BuilderChoice {
  label: string;
  /* The words that go into the prompt when this is picked. */
  value: string;
  cls: DataClass | "clear";
  note: string;
}

export interface BuilderGroup {
  key: string;
  question: string;
  choices: BuilderChoice[];
}

export interface SandboxPractise {
  kind: "sandbox";
  /* Which simulator to mount. Absent = the firm's approved tool. */
  tool?: Tool;
  task: string;
  deskIntro: string;
  desk: DeskDocument[];
  builder: BuilderGroup[];
  /* Template with {KEY} slots for each builder group, e.g. "Write ... to {A}". */
  assemble: string;
  freeWrite: { heading: string; lead: string; placeholder: string };
}

/* ---- Prove ---- */

export interface ProveItem {
  kind: "classify";
  stem: string;
  options: DataClass[];
  answer: DataClass;
  why: string;
}

/* ---- the per-track block and the module ---- */

export interface TrackBlock {
  dataPack: DataPack;
  practise: SandboxPractise;
  prove: ProveItem[];
}

export interface ModuleManifest {
  n: 1 | 2 | 3 | 4 | 5;
  slug: string;
  title: string;
  minutes: number;
  promise: string;
  learn: LearnScreen[];
  tracks: Partial<Record<Track, TrackBlock>>;
  /* Correct prove items needed, out of the track's prove.length. */
  passMark: number;
}

/* ---- what the player knows about the firm (client-safe view) ---- */

export interface FirmView {
  name: string;
  contactName: string;
  contactRole: string;
  approvedTools: string[];
  askFirstTools: string[];
  bannedTools: string[];
  classNames: Record<DataClass, string>;
}

export const DEFAULT_FIRM: FirmView = {
  name: "your firm",
  contactName: "your data protection lead",
  contactRole: "",
  approvedTools: ["Microsoft 365 Copilot on your work account"],
  askFirstTools: [],
  bannedTools: ["Personal ChatGPT", "Browser extensions that read the page"],
  classNames: { ...CLASS_DEFAULT_NAME },
};

/* Pick the desk for a track, falling back to General, then the first
 * authored track. Phase 1 ships Finance only, so every track reads Finance
 * until its own block is written. */
export function resolveTrack(manifest: ModuleManifest, track: Track): { track: Track; block: TrackBlock } {
  const direct = manifest.tracks[track];
  if (direct) return { track, block: direct };
  const general = manifest.tracks.general;
  if (general) return { track: "general", block: general };
  const first = (Object.keys(manifest.tracks) as Track[])[0];
  return { track: first, block: manifest.tracks[first]! };
}

/* {{firm.name}}, {{firm.contact}}, {{firm.contactRole}}, {{firm.approved}},
 * {{tool}} resolve at render time so one manifest serves every firm. */
export function fill(text: string, ctx: { firm: FirmView; tool: Tool }): string {
  return text
    .replaceAll("{{firm.name}}", ctx.firm.name)
    .replaceAll("{{firm.contact}}", ctx.firm.contactName)
    .replaceAll("{{firm.contactRole}}", ctx.firm.contactRole)
    .replaceAll("{{firm.approved}}", ctx.firm.approvedTools[0] ?? "your approved tool")
    .replaceAll("{{tool}}", TOOL_LABEL[ctx.tool]);
}

/* Where a learner is inside a module. Persisted as ModuleProgress. */
export type Phase = "learn" | "practise" | "prove" | "done";
