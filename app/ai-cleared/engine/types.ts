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
  /* The published reports a real case is drawn from, listed under the
   * detail once it is open. Each opens in a new tab. */
  sources?: { label: string; href: string }[];
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
      /* A prompt and its reply on the left, the improved prompt and its
       * reply on the right, revealed on tap. The whole of AI Fluent is
       * about that difference. */
      kind: "beforeAfter";
      eyebrow: string;
      heading: string;
      lead?: string;
      sim: SimRef;
      before: { prompt: string; reply: string; note: string };
      after: { prompt: string; reply: string; note: string };
      revealLabel: string;
      cta: string;
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
  /* For the Office views: the same material as a sheet, an inbox or a
   * transcript. Absent = derived from the sections. */
  table?: { columns: string[]; rows: string[][] };
  emails?: { from: string; subject: string; time: string; preview: string }[];
  transcript?: { who: string; line: string }[];
}

/* Where a Fluent practice runs: Copilot inside an Office app, or chat. */
export type OfficeApp = "word" | "excel" | "outlook" | "teams";

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

/* ---- AI Fluent practices ---- */

/* The eight prompt elements the Fluent rubric scores. */
export type RubricElement = "role" | "reader" | "task" | "format" | "length" | "constraints" | "material" | "scope";
export const RUBRIC_ELEMENTS: readonly RubricElement[] = ["role", "reader", "task", "format", "length", "constraints", "material", "scope"];
export const RUBRIC_LABEL: Record<RubricElement, string> = {
  role: "Role",
  reader: "Reader",
  task: "Task",
  format: "Format",
  length: "Length",
  constraints: "Constraints",
  material: "Material",
  scope: "One thing at a time",
};

/* What a good prompt for this turn must contain, and what a good output
 * must do (one sentence the model reads). */
export interface Rubric {
  requires: RubricElement[];
  goal: string;
}

export interface LoopTurn {
  /* What the screen asks the learner to do on this turn. */
  instruction: string;
  /* Absent = the turn is scored on its move only (moved, repeated, wandered). */
  rubric?: Rubric;
  placeholder?: string;
}

/* Fluent's main practice: one or more sends, scored on the rubric, with
 * the conversation kept when `followUp` is true (turn two sees turn one's
 * reply) or a fresh chat each send when it is false. */
export interface LoopPractise {
  kind: "loop";
  tool?: Tool;
  task: string;
  /* The brief: what the person needs, in the words they would get it in. */
  brief: string;
  /* The desk material the tool has, shown as an attachment. */
  material?: AttachedDocument;
  /* On Copilot, run inside this Office app with the material open; the
   * other three tools show the material as an attachment instead. */
  office?: OfficeApp;
  /* A weak prompt to start from; the composer holds it on turn one. */
  starter?: string;
  followUp: boolean;
  turns: LoopTurn[];
  /* The tool's web mode is on: replies cite numbered sources. */
  webMode?: boolean;
  /* Offered at the end: save the best prompt to the playbook under this workflow. */
  playbook?: { workflow: string; whenToUse: string; check: string };
}

/* A reply with a planted mistake to find. Scripted, never live: the
 * mistake must land every time. */
export interface SpotPractise {
  kind: "spot";
  tool?: Tool;
  task: string;
  prompt: string;
  sentences: string[];
  errorIndex: number;
  why: string;
  material?: AttachedDocument;
}

/* A reply that cites sources; the learner marks the invented one. */
export interface SourcesPractise {
  kind: "sources";
  tool?: Tool;
  task: string;
  prompt: string;
  reply: string;
  sources: { label: string; real: boolean; note: string }[];
}

/* ---- Cyber Awareness practices ---- */

/* A working morning, one moment after another (an email, a call, a
 * visitor, a chat message). The learner flags the moments where someone
 * was working on them and names the pressure button each one pressed.
 * A moment with `levers` is one of those: the ids it lists are the
 * buttons accepted as right, the first being the main one. Every other
 * moment is ordinary, and flagging it only shows why. */
export interface PressureLever {
  id: string;
  label: string;
  desc: string;
}
export interface Moment {
  time: string;
  /* Where it arrived: "Email", "Phone call", "Reception", "Teams". */
  where: string;
  from: string;
  text: string;
  levers?: string[];
  why: string;
}
export interface MomentsPractise {
  kind: "moments";
  task: string;
  /* One line that sets the morning up. */
  scene?: string;
  levers: PressureLever[];
  moments: Moment[];
}

/* An inbox to triage: emails, texts and chat messages. The learner marks
 * each one phishing or fine and, for each phish, names the tell that
 * gives it away. As in a real mail app, what a message shows (a display
 * name, the words on a button) hides what is behind it (the real address,
 * where the link really goes); hovering, or tapping a sender and pressing
 * and holding a link on a phone, reveals it. A message with `tells` is
 * phishing: the ids it lists are the tells accepted as right, the first
 * being the main one. Every other message is genuine. */
export interface InboxTell {
  id: string;
  label: string;
  desc: string;
}
export interface InboxMessage {
  channel: "email" | "sms" | "teams";
  time: string;
  /* What the app shows: a display name, a contact or a number. */
  from: string;
  /* What sits behind it: the real address, number or account. */
  realFrom: string;
  /* Teams: the account is outside the firm and carries the External label. */
  external?: boolean;
  subject?: string;
  text: string;
  /* An attachment or shared file, by name. */
  file?: string;
  /* A link or button: the words it shows, and where it really goes. */
  link?: { label: string; href: string };
  tells?: string[];
  why: string;
}
export interface InboxPractise {
  kind: "inbox";
  task: string;
  /* One line under the task: how to look behind a message here. */
  scene?: string;
  tells: InboxTell[];
  messages: InboxMessage[];
}

/* A day on your phone: sign-in prompts and account alerts arrive one at a
 * time on the lock screen, each with what you were doing when it came
 * (the only way to know whether you started it), and sometimes a message
 * that arrives just before it. The learner answers each one with one of
 * three actions (approve, deny, report) and sees why before the next
 * arrives. `accept` lists the actions taken as right, the first being the
 * best; every other action is shown as not quite, with the same reason. */
export type PhoneAction = "approve" | "deny" | "report";
export interface PhoneEvent {
  time: string;
  /* What you are doing when it arrives. */
  doing: string;
  /* A message that lands just before the notification. */
  message?: { channel: string; from: string; text: string };
  /* The app the notification comes from: "Authenticator", "Account alert". */
  app: string;
  title: string;
  /* The detail rows under the title: account, device, place. */
  lines: string[];
  /* More than one of the same, shown as a stack with a count. */
  count?: number;
  accept: PhoneAction[];
  why: string;
}
export interface PhonePractise {
  kind: "phone";
  task: string;
  /* One line under the task that sets the day up. */
  scene?: string;
  actions: { id: PhoneAction; label: string; desc: string }[];
  events: PhoneEvent[];
}

/* A place to look round: one or more drawn views (a café table, then
 * your laptop screen), each with numbered spots on it. The learner opens
 * each spot, reads what is there, and calls it: needs fixing, or fine as
 * it is. A spot with `risk` needs fixing; the others only look risky, and
 * every call shows why. The drawings are art the engine owns (`art` picks
 * one); every word the learner reads comes from here. Each spot is a real
 * button, reachable by keyboard and labelled, not only a picture. */
export type SceneArt = "cafe" | "laptop";
export interface SceneSpot {
  /* Where the marker sits on the drawing, in percent from the left and top. */
  x: number;
  y: number;
  /* What the spot is: read out by a screen reader, and the heading once opened. */
  label: string;
  /* What you see when you look closer. */
  seen: string;
  risk: boolean;
  why: string;
}
export interface SceneView {
  /* The tab: "The café", "Your screen". */
  label: string;
  art: SceneArt;
  /* The whole drawing in one sentence, for a screen reader. */
  alt: string;
  spots: SceneSpot[];
}
export interface ScenePractise {
  kind: "scene";
  task: string;
  /* One line under the task that sets the scene. */
  scene?: string;
  /* The two calls, in the learner's words. */
  calls: { risk: string; fine: string };
  views: SceneView[];
}

/* An outbox before send: emails and file shares queued to go, one at a
 * time. Each shows what you meant to do, then the draft itself, part by
 * part (To, Bcc, the attachment, who can open a link, when it ends). The
 * learner can look closer at a part (unhide the tabs, copy the text under
 * the black boxes, show the full address), then either sends it as it is
 * or presses Fix on the part that is wrong. Either way the item is put
 * right, the parts that change show what they became, and the reason
 * shows. An item with `fault` has something wrong: the ids it lists are
 * the parts accepted as right, the first being the main one. Every other
 * item is fine to send. Every control is a labelled button. */
export interface OutboxPart {
  id: string;
  /* The field's name in the draft: "To", "Bcc", "Attached", "Who can open it". */
  label: string;
  /* What the draft shows. */
  value: string;
  /* An address outside the firm, tagged External the way a mail app does. */
  external?: boolean;
  /* A small preview of a document under the row. Text in [[double
   * brackets]] sits under a black box, until the part is looked at closely. */
  preview?: string;
  /* Looking closer: the button's words, what you find, and a table when
   * what you find is a sheet. */
  look?: { action: string; found: string; table?: { columns: string[]; rows: string[][] } };
  /* What the part reads once the item has been put right. */
  fixed?: string;
}
export interface OutboxItem {
  kind: "email" | "share";
  /* The subject line, or the name of what is being shared. */
  title: string;
  /* What you meant to do, in a sentence. */
  meant: string;
  /* The firm's data class on the draft, shown as its label. */
  cls?: DataClass;
  parts: OutboxPart[];
  /* The message itself, for an email. */
  body?: string;
  fault?: string[];
  why: string;
}
export interface OutboxPractise {
  kind: "outbox";
  task: string;
  /* One line under the task that sets the scene. */
  scene?: string;
  items: OutboxItem[];
}

/* A queue of payment requests that reach your desk across a week: a
 * supplier's new bank details, an urgent request from the top, an invoice
 * that matches its order. All of them sit in the queue at once and can be
 * opened in any order. On each, the learner can take checks (call the
 * number on file, read the address letter by letter, match the purchase
 * order), each of which shows what it finds, then decides: pay, hold and
 * verify, or report. `accept` lists the decisions taken as right, the
 * first being the best; `outcomes` says what each decision leads to, so
 * every choice explains itself, and `why` is the lesson under all three.
 * Every control is a labelled button. */
export type PaymentDecision = "pay" | "hold" | "report";
export interface PaymentCheck {
  /* The button's words: "Call the number on file". */
  action: string;
  /* What the check finds. */
  found: string;
  /* How it reads against what you already hold: it matches, it does not,
   * or it is simply information. Shown only once the check is taken. */
  result: "match" | "mismatch" | "info";
}
export interface PaymentRequest {
  /* When it arrived: "Mon 09:05". */
  when: string;
  /* How it arrived: "Email", "Text message", "Invoice by email". */
  channel: string;
  /* Who it is from, as your screen shows it. */
  from: string;
  /* The address or number behind it, as shown. */
  address: string;
  subject: string;
  text: string;
  /* An attachment, by name. */
  file?: string;
  /* Who the money would go to, and how much. */
  payee: string;
  amount: string;
  /* The bank details on the request, when it gives any. */
  bank?: string;
  checks: PaymentCheck[];
  accept: PaymentDecision[];
  outcomes: Record<PaymentDecision, string>;
  why: string;
}
export interface PaymentsPractise {
  kind: "payments";
  task: string;
  /* One line under the task that sets the week up. */
  scene?: string;
  /* The three decisions, in the learner's words. */
  decisions: { id: PaymentDecision; label: string; desc: string }[];
  requests: PaymentRequest[];
}

/* Calls that come in across a week, voice and video, from people the
 * learner knows: the managing director, a colleague in IT. Each makes an
 * unusual request. The learner answers, reads what the caller says (the
 * whole call is a visible transcript; nothing is heard), and picks a
 * response at each turn: go along with it, ask the agreed challenge
 * question, call back on the usual number, ask for it in writing. The
 * call reacts: an impostor deflects, pushes or gets angry, while a genuine
 * caller is happy to be checked. Some calls are genuine, so the lesson is
 * verify, never assume. Each response is graded (best, ok, wrong) and
 * explains itself, and `next` carries the call on to another turn; a
 * response without `next` ends the call, and `truth` then says who it
 * really was. Every control is a labelled button; the caller's picture is
 * drawn (initials and shapes), never a face. */
export interface CallOption {
  /* The button's words: "Ask the challenge question". */
  label: string;
  /* What you say, or do, in a sentence. */
  say: string;
  /* What the caller says back, when they get to say anything. */
  reply?: string;
  /* What happens next, narrated: "You hang up and ring Helen's mobile...". */
  then?: string;
  grade: "best" | "ok" | "wrong";
  why: string;
  /* The turn the call goes on to; absent = the call ends here. */
  next?: number;
}
export interface CallTurn {
  options: CallOption[];
}
export interface IncomingCall {
  kind: "voice" | "video";
  /* When it comes in: "Mon 09:10". */
  time: string;
  /* What you are doing when it rings. */
  doing: string;
  /* Who your screen says is calling, and their role. */
  caller: string;
  role: string;
  /* What the screen shows beneath the name: a number, an account, a link. */
  shown: string;
  /* Anyone else on a video call, by name, as the screen shows them. */
  others?: string[];
  /* What the caller says once you answer, line by line. */
  opening: string[];
  turns: CallTurn[];
  /* Who it really was, once the call is over. */
  genuine: boolean;
  truth: string;
}
export interface CallsPractise {
  kind: "calls";
  task: string;
  /* One line under the task that sets the week up. */
  scene?: string;
  calls: IncomingCall[];
}

/* A day of things going wrong, and the report the learner writes for each:
 * a link clicked and a password typed, an email to the wrong person, a
 * call that felt off, a laptop bag left on a train. Each incident shows
 * what happened (and, sometimes, the voice saying keep quiet), then the
 * learner builds the report in three steps: who to tell first and by which
 * channel, which details go in (the useful ones, not the noise), and what
 * to do while waiting. Each pick is graded (best, ok, wrong) and explains
 * itself, the details are checked one by one, and the draft fills in as
 * they go. Sending it shows a model report, what the contact does next,
 * minute by minute, and what keeping quiet would have cost. Every control
 * is a labelled button; the pictures are drawn, never photographs. */
export interface ReportChoice {
  /* The button's words: "Ring {{firm.contact}} now". */
  label: string;
  /* One line under the label: the channel, or what it means. */
  desc?: string;
  grade: "best" | "ok" | "wrong";
  why: string;
}
export interface ReportDetail {
  /* What the detail says, as it would read in the report. */
  text: string;
  /* Useful to whoever acts on the report; false = noise, or harmful to send. */
  useful: boolean;
  why: string;
}
export interface ReportIncident {
  /* When it happens: "Thu 09:40". */
  time: string;
  title: string;
  /* Which drawing heads it. */
  art: "link" | "mail" | "phone" | "laptop";
  /* What happened, in a few sentences. */
  happened: string;
  /* The voice that says keep quiet or sort it yourself, when there is one. */
  tempt?: string;
  /* Step 1: who you tell first, and how. */
  route: ReportChoice[];
  /* Step 2: what goes in the report. */
  details: ReportDetail[];
  /* Step 3: what you do while you wait. */
  meanwhile: ReportChoice[];
  /* A model report: who it goes to, how, and what it says. */
  model: { to: string; via: string; lines: string[] };
  /* What happens next, by the clock. */
  after: { time: string; text: string }[];
  /* What keeping quiet, or waiting, would have cost. */
  ifQuiet: string;
}
export interface ReportsPractise {
  kind: "reports";
  task: string;
  /* One line under the task that sets the day up. */
  scene?: string;
  incidents: ReportIncident[];
}

export type Practise = SandboxPractise | SortPractise | SituationsPractise | TriagePractise | InspectPractise | LoopPractise | SpotPractise | SourcesPractise | MomentsPractise | InboxPractise | PhonePractise | ScenePractise | OutboxPractise | PaymentsPractise | CallsPractise | ReportsPractise;

/* ---- Prove ---- */

export type ProveItem =
  | { kind: "classify"; stem: string; options: DataClass[]; answer: DataClass; why: string; from?: number }
  | { kind: "choose"; stem: string; options: string[]; answer: number; why: string; sim?: SimRef; from?: number };

/* ---- the per-track block and the module ---- */

export interface TrackBlock {
  /* Only a sandbox practise needs a pack; the grade route refuses without one. */
  dataPack?: DataPack;
  /* One practice, or several in a row in `practises`. One of the two is set. */
  practise?: Practise;
  practises?: Practise[];
  prove: ProveItem[];
}

/* The practices of a block, in order. */
export function practisesOf(block: TrackBlock): Practise[] {
  return block.practises ?? (block.practise ? [block.practise] : []);
}

export interface ModuleManifest {
  n: number;
  slug: string;
  title: string;
  minutes: number;
  promise: string;
  /* Which course the module belongs to; AI Cleared when absent. */
  course?: "ai-cleared" | "ai-fluent" | "cyber-awareness";
  /* Shuffle each choose item's options once per attempt (held in state,
   * so a re-render never reorders them) so the right answer has no fixed
   * place. Absent = the authored order, which AI Cleared and AI Fluent use. */
  shuffleOptions?: boolean;
  /* What the dock (the right-hand column; the Desk drawer on a phone)
   * shows instead of the firm's AI tool rules and the four data classes,
   * for a course where those do not apply. Lines take {{firm.*}} slots. */
  dock?: { label: string; lines: string[] }[];
  /* The course's closing, for the module that ends a course with no final
   * assessment: shown on the result screen once the module is passed.
   * `done` heads it when every module is done, `pending` while some are
   * still to finish; then a lead and one habit per module. Lines take
   * {{firm.*}} slots. Absent = no closing, as on every other module. */
  outro?: { done: string; pending: string; lead: string; habits: { n: number; title: string; habit: string }[] };
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
 * {{tool}} resolve at render time so one manifest serves every firm, and
 * {{class.P}}, {{class.I}}, {{class.C}}, {{class.R}} to the firm's own
 * names for its four data classes. */
export function fill(text: string, ctx: { firm: FirmView; tool: Tool }): string {
  return text
    .replaceAll("{{firm.name}}", ctx.firm.name)
    .replaceAll("{{firm.contact}}", ctx.firm.contactName)
    .replaceAll("{{firm.contactRole}}", ctx.firm.contactRole)
    .replaceAll("{{firm.approved}}", ctx.firm.approvedTools[0] ?? "your approved tool")
    .replaceAll("{{tool}}", TOOL_LABEL[ctx.tool])
    .replace(/\{\{class\.([PICR])\}\}/g, (_, c: DataClass) => ctx.firm.classNames?.[c] || CLASS_DEFAULT_NAME[c]);
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
