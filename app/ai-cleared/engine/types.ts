/* Content contract for an AI Cleared module. Modules are content
 * (app/ai-cleared/manifests/moduleN.ts); the engine (ClearedPlayer) is
 * structure. The manifest is data-only: authoring a module never touches
 * engine code, and a track is a different desk, never a different engine.
 *
 * Shape: Learn (three or four screens, one action each) -> Practise (one
 * task, one action per screen) -> Prove (five items, pass at four; the
 * final assessment draws ten from a bank, pass at eight). The shared Learn
 * screens are written once; the per-track block supplies the desk. */

import type { SimTier } from "../sims/types";
export type { SimTier } from "../sims/types";

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
export const TOOLS: readonly Tool[] = ["copilot", "chatgpt", "gemini", "claude"];
export const TOOL_LABEL: Record<Tool, string> = {
  copilot: "Copilot",
  chatgpt: "ChatGPT",
  gemini: "Gemini",
  claude: "Claude",
};
export const TIER_LABEL: Record<SimTier, string> = {
  "consumer-free": "Consumer, free",
  "consumer-paid": "Consumer, paid",
  enterprise: "Enterprise",
};

/* A window in a simulator: which tool, on which account. */
export interface SimRef {
  tool: Tool;
  tier: SimTier;
}

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

/* A card on a Learn screen. `detail` is revealed on tap when the screen
 * says so; `sim` draws a compact simulator window above the text. */
export interface LearnCard {
  title: string;
  body: string;
  detail?: string;
  tag?: string;
  tint?: DataClass | "ok" | "warn" | "crit";
  sim?: SimRef;
  /* An outbound page, opened in a new tab. */
  link?: { label: string; href: string };
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
      /* Button label pattern, "{n}" = the next number. Default "Show question {n}". */
      more?: string;
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
    }
  | {
      /* A grid of cards. With `reveal`, each card's detail opens on tap
       * and the screen gates on every card having been opened. With
       * `source`, the cards come from the firm profile or the vendor
       * matrix at render time instead of the manifest. */
      kind: "cards";
      eyebrow: string;
      heading: string;
      lead?: string;
      cards?: LearnCard[];
      source?: "firm.approved" | "firm.askFirst" | "firm.banned" | "firm.rules" | "vendors.terms";
      reveal?: boolean;
      columns?: 1 | 2;
      note?: string;
    }
  | {
      /* Switches the learner flips to see the consequence. Gates on every
       * switch having been flipped at least once. */
      kind: "toggles";
      eyebrow: string;
      heading: string;
      lead?: string;
      toggles: { label: string; off: string; on: string }[];
      note?: string;
    }
  | {
      /* Two vertical timelines, the second revealed on tap. */
      kind: "timeline";
      eyebrow: string;
      heading: string;
      lead?: string;
      before: { label: string; steps: string[] };
      after: { label: string; steps: string[] };
      revealLabel: string;
      note: string;
    }
  | {
      /* The firm's escalation contact, with what to say. */
      kind: "contact";
      eyebrow: string;
      heading: string;
      lead: string;
      script: string[];
      note?: string;
    }
  | {
      /* An assistant reply that cites sources. The learner taps each
       * source to check it; the invented one is revealed. Gates on every
       * source having been checked. */
      kind: "sources";
      eyebrow: string;
      heading: string;
      lead?: string;
      sim: SimRef;
      prompt: string;
      reply: string;
      sources: { label: string; real: boolean; note: string }[];
      note?: string;
    }
  | {
      /* A document with an instruction hidden inside it, and the reply the
       * assistant gave after reading it. The planted line is highlighted
       * on reveal. */
      kind: "injection";
      eyebrow: string;
      heading: string;
      lead?: string;
      document: AttachedDocument;
      sim: SimRef;
      prompt: string;
      reply: string;
      revealLabel: string;
      note: string;
    };

/* A document the simulator has attached: a few short sections, one of
 * which carries the planted instruction. */
export interface AttachedDocument {
  title: string;
  kind: string;
  sections: { heading: string; paragraphs: { text: string; planted?: boolean }[] }[];
}

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

/* Module 2: build a prompt, send it, get graded, fix it. */
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

/* Module 1: which tier is this window? One item per screen. */
export interface SortPractise {
  kind: "sort";
  task: string;
  bins: { id: SimTier; label: string; desc: string }[];
  items: { sim: SimRef; caption?: string; tell: string }[];
}

/* Module 3: is this fine here? One situation per screen. The answer can
 * be fixed, or resolved against the firm's own tool lists at render time
 * (`toolStatus`), which is how one manifest serves every firm. */
export type SituationAnswer = "fine" | "ask" | "no";
export interface Situation {
  text: string;
  sim?: SimRef;
  answer?: SituationAnswer;
  /* Resolve from the firm profile: which tool and tier the situation is
   * really about. approved -> fine, ask first -> ask, banned/unknown -> no
   * or ask (see resolveSituation). */
  toolStatus?: SimRef;
  why: string;
  /* Why lines per resolved answer, used with toolStatus. */
  whyBy?: Partial<Record<SituationAnswer, string>>;
}
export interface SituationsPractise {
  kind: "situations";
  task: string;
  situations: Situation[];
}

/* Module 5: what do you do now? One incident per screen. */
export type TriageAnswer = "none" | "manager" | "today";
export interface Incident {
  title: string;
  body: string;
  answer: TriageAnswer;
  why: string;
}
export interface TriagePractise {
  kind: "triage";
  task: string;
  columns: { id: TriageAnswer; label: string; desc: string }[];
  incidents: Incident[];
}

/* Module 4: the simulator has a document attached. Ask for a summary (the
 * summary follows an instruction that arrived from inside the document),
 * find the planted line, then ask for sources and mark the invented one.
 * Replies are scripted, never live: the injection must land every time. */
export interface InspectPractise {
  kind: "inspect";
  task: string;
  document: AttachedDocument;
  summaryPrompt: string;
  summaryReply: string;
  injectionWhy: string;
  sourcesPrompt: string;
  sourcesReply: string;
  sources: { label: string; real: boolean; note: string }[];
}

export type Practise = SandboxPractise | SortPractise | SituationsPractise | TriagePractise | InspectPractise;

/* ---- Prove ---- */

export type ProveItem =
  | { kind: "classify"; stem: string; options: DataClass[]; answer: DataClass; why: string; from?: number }
  | { kind: "choose"; stem: string; options: string[]; answer: number; why: string; sim?: SimRef; from?: number };

/* ---- the per-track block and the module ---- */

export interface TrackBlock {
  /* Only a sandbox practise needs a pack; the grade route refuses without one. */
  dataPack?: DataPack;
  practise: Practise;
  prove: ProveItem[];
}

export interface ModuleManifest {
  n: number;
  slug: string;
  title: string;
  minutes: number;
  promise: string;
  learn: LearnScreen[];
  tracks: Partial<Record<Track, TrackBlock>>;
  /* Correct prove items needed, out of the items shown. */
  passMark: number;
  /* The final assessment: draw `draw` items, `fromTrack` of them from the
   * track's own prove bank, the rest from `bank`, spread across modules. */
  final?: { draw: number; fromTrack: number; bank: ProveItem[] };
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
 * authored track. */
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

/* Where the firm stands on a tool at a tier, read from its three lists by
 * keyword. "personal", "free" or "consumer" in an entry marks the consumer
 * tiers; "team", "enterprise", "work" or "workspace" marks enterprise. An
 * entry with neither applies to every tier. Unknown means the firm has not
 * said, and the safe answer is to ask first. */
export type ToolStatus = "approved" | "ask" | "banned" | "unknown";
export function toolStatus(firm: FirmView, ref: SimRef): ToolStatus {
  const key = TOOL_LABEL[ref.tool].toLowerCase();
  const consumer = ref.tier !== "enterprise";
  const matches = (entry: string) => {
    const e = entry.toLowerCase();
    if (!e.includes(key)) return 0;
    const saysConsumer = /personal|free|consumer|own account/.test(e);
    const saysEnterprise = /team|enterprise|work account|workspace|tenant|business/.test(e);
    if (saysConsumer && !consumer) return 0;
    if (saysEnterprise && consumer) return 0;
    return saysConsumer || saysEnterprise ? 2 : 1;
  };
  const best = (list: string[]) => list.reduce((a, e) => Math.max(a, matches(e)), 0);
  const scores: [ToolStatus, number][] = [
    ["approved", best(firm.approvedTools)],
    ["ask", best(firm.askFirstTools)],
    ["banned", best(firm.bannedTools)],
  ];
  scores.sort((a, b) => b[1] - a[1]);
  return scores[0][1] === 0 ? "unknown" : scores[0][0];
}

export function resolveSituation(s: Situation, firm: FirmView): { answer: SituationAnswer; why: string } {
  if (!s.toolStatus) return { answer: s.answer ?? "ask", why: s.why };
  const st = toolStatus(firm, s.toolStatus);
  const answer: SituationAnswer = st === "approved" ? "fine" : st === "banned" ? "no" : "ask";
  return { answer, why: s.whyBy?.[answer] ?? s.why };
}

/* Where a learner is inside a module. Persisted as ModuleProgress. */
export type Phase = "learn" | "practise" | "prove" | "done";
