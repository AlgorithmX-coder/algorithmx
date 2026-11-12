/* The pretend office: one saved record that every practice app reads and
 * writes (docs/desk-ready "Desk Ready: skills criteria and hands-on
 * exercises", owner 2026-11-10). A job seeds it, the learner works in it
 * with Outlook, File Explorer and Excel look-alikes, and the job's checks
 * mark what ends up in it, never the clicks on the way. */

export type Grid = string[][];

/* A place in the file system, root first:
 * ["Operations Team", "Documents", "Deliveries", "2026"]. */
export type Path = readonly string[];

/* A scanned piece of paper (a delivery note, a letter), drawn by the
 * viewer. Kept as data so a check can read it too. */
export interface Paper {
  heading: string;
  from: string[];
  meta: [string, string][];
  table?: { head: string[]; rows: string[][] };
  /* Handwriting in the margin, e.g. "2 short. SP". */
  note?: string;
  footer?: string;
}

export type FileKind = "folder" | "xlsx" | "xltx" | "docx" | "dotx" | "pdf" | "jpg"; // jpg: Module 10 (a photo of a receipt)

/* A highlight rule (Excel's conditional formatting), on one column from
 * row 2 down: cells that match are coloured. */
export interface Highlight {
  col: number;
  op: ">" | "<" | "=";
  value: string;
}

/* A bar chart drawn from two columns: names along the bottom, numbers up
 * the side. */
export interface Chart {
  title: string;
  labelCol: number;
  valueCol: number;
}

/* One sheet of a workbook, by its tab name. `formats` holds the cells
 * set to show as money or a percentage, by cell name ("G2"). */
export interface Tab {
  name: string;
  grid: Grid;
  formats?: Record<string, "money" | "percent">;
  highlights?: Highlight[];
  chart?: Chart;
}

export interface OfficeFile {
  id: string;
  path: Path; // the folder it sits in
  name: string; // with its extension, except folders
  kind: FileKind;
  modified: string; // as shown: "Today 08:12", "06/11/2026"
  by: string;
  /* The first sheet, which most jobs read. */
  sheet?: Grid;
  /* Every sheet, when a workbook has more than one. Saving keeps `sheet`
   * equal to the first tab's grid. */
  tabs?: Tab[];
  /* Column widths in px for a sheet, A first. */
  widths?: number[];
  paper?: Paper;
  /* Seeded by the job, so a check can tell the learner's files apart. */
  seeded?: boolean;
  /* ── Module 8: Documents ── a Word document (.docx, .dotx), or the
   * snapshot a PDF made from one carries, so it opens read-only. */
  doc?: WordDoc;
  /* ── Module 9: Files and sharing ── */
  /* A seeded file the learner may rename, move, delete and share (Sarah
   * asked them to tidy it), unlike other people's files. */
  editable?: boolean;
  /* Earlier versions, oldest first. The file itself is the current one. */
  versions?: FileVersion[];
  /* People given access to this file directly, beyond the site's members. */
  access?: AccessGrant[];
  /* Sharing links made for it with Copy link or Share. */
  shareLinks?: ShareLink[];
  /* The version a restore brought back, e.g. "2.0", shown in its history. */
  restoredFrom?: string;
}

export interface Person {
  name: string;
  address: string;
}

export interface Attachment {
  name: string;
  /* A copy travels with the email. */
  paper?: Paper;
  sheet?: Grid;
  tabs?: Tab[];
  /* ── Module 8: Documents ── a PDF or Word file's pages. */
  doc?: WordDoc;
}

export interface EmailLink {
  name: string;
  path: Path;
  fileName: string;
}

export interface Email {
  id: string;
  /* "inbox", "sent", "junk" (reported), or one of the job's mail folders. */
  folder: string;
  from: Person;
  to: Person[];
  cc: Person[];
  bcc?: Person[];
  subject: string;
  body: string;
  time: string;
  unread?: boolean;
  attachments: Attachment[];
  links: EmailLink[];
  /* The email this one replies to or forwards. */
  inReplyTo?: string;
  flagged?: boolean;
  /* Reported as phishing with the Report button. */
  reported?: boolean;
  /* A link in the body (a scam's "View invoice"), and whether it was clicked. */
  fakeLink?: { text: string; url: string };
  clicked?: boolean;
}

export interface OfficeState {
  version: number;
  files: OfficeFile[];
  emails: Email[];
  /* The job's own mail folders, beside Inbox and Sent items. */
  mailFolders?: string[];
  /* When this browser last changed it (ms), so the newer of this browser's
   * copy and the account's copy wins. */
  savedAt?: number;
  /* ── Module 3: Meetings and messages (the Calendar and Teams apps) ── */
  calendar?: CalendarState;
  teams?: TeamsState;
  /* ── end Module 3 ── */
  /* ── Module 13: Show what you can do ── the agency's test results */
  agency?: AgencyRecord;
  /* ── Module 9: Files and sharing ── what was deleted, newest last, so it
   * can be put back. */
  recycle?: RecycledItem[];
  /* ── Module 12: AI as your assistant ── */
  copilot?: CopilotState;
}

export interface Check {
  id: string;
  code: string; // the criterion, e.g. "SP-4"
  group: string; // "The report", "Where you saved it", "Telling Sarah"
  label: string; // what good looks like, in plain words
  ok: boolean;
  /* What went wrong and how to fix it, when it did. */
  fix?: string;
}

export interface Job {
  id: string; // progress id, e.g. "m5j1"
  slug: string; // route, e.g. "morning-report"
  moduleId: string; // "m5"
  moduleLabel: string; // "Module 5: Putting business data in"
  title: string;
  /* One or two lines for the module page card. */
  summary: string;
  /* The office clock, shown on the task panel. */
  clock: string;
  deadline: string;
  /* The scorecard's headline when every check passes. */
  doneLine: string;
  /* What the panel says before the learner starts. */
  brief: string;
  hints: string[];
  /* The apps beyond Outlook, File Explorer and Excel that this job puts
   * on the taskbar, by their id in apps/registry. */
  apps?: string[];
  /* Built-in apps this job leaves off the taskbar. */
  hide?: ("outlook" | "explorer" | "excel")[];
  /* The app in front when the job opens. Outlook if not given. */
  start?: string;
  seed: () => OfficeState;
  check: (s: OfficeState) => Check[];
  /* The five habits (criteria doc), each met when all its checks pass. */
  habits: { label: string; checks: string[] }[];
  /* ── Module 13 ── a line for the job's card on the module page, read in
   * the browser ("Your best: typing 41 wpm at 97%"), or null for none. */
  best?: () => string | null;
}

export const pathText = (p: Path) => p.join(" > ");

/* A workbook's sheets, whether it was saved with tabs or as one sheet. */
export const tabsOf = (f: { sheet?: Grid; tabs?: Tab[] }): Tab[] => f.tabs ?? (f.sheet ? [{ name: "Sheet1", grid: f.sheet }] : []);
export const samePath = (a: Path, b: Path) => a.length === b.length && a.every((x, i) => x === b[i]);

/* ── Module 3: Meetings and messages ─────────────────────────────────
 * The learner's calendar and everyone else's free/busy, and the Teams
 * chats and the one call a job can hold, kept in the office record so a
 * job's checks can read them (criteria TM-1 to TM-5). A day is written
 * "2026-11-12" and a time "10:00", always in the week of Monday 9
 * November 2026. */

export type InviteResponse = "none" | "accepted" | "tentative" | "declined" | "proposed";

export interface Slot {
  day: string;
  start: string;
  end: string;
}

export interface Meeting extends Slot {
  id: string;
  title: string;
  organiser: Person;
  /* Required attendees, not counting the organiser. */
  attendees: Person[];
  /* A meeting room booked for it (a room is a Person with a room address). */
  room?: Person;
  /* Somewhere that isn't a bookable room ("Warehouse, aisle C"). */
  place?: string;
  /* Held as a Teams meeting, with a Join button. */
  teams: boolean;
  /* The agenda, or the message that came with the invite. */
  body: string;
  /* An invite the learner booked and sent. */
  sent?: boolean;
  /* An invite to the learner, and their answer to it. */
  response?: InviteResponse;
  proposed?: Slot;
  /* The inbox email that carried the invite, when there is one. */
  emailId?: string;
}

/* Someone else's (or a room's) busy time, as the Scheduling Assistant
 * shows it: no titles, just when. `who` is the person's or room's address. */
export interface Busy extends Slot {
  who: string;
}

export interface CalendarState {
  /* The office's today, so the week view can mark it. */
  today: string;
  meetings: Meeting[];
  busy: Busy[];
  rooms: Person[];
}

export interface ChatMessage {
  id: string;
  from: Person;
  text: string;
  time: string;
}

export interface Chat {
  id: string;
  /* A group chat's name; a one-to-one chat is named after the person. */
  title?: string;
  /* Everyone in it except the learner. */
  people: Person[];
  messages: ChatMessage[];
  /* Messages the learner hasn't opened yet. */
  unread?: number;
}

/* A window the Share tray offers. `private` marks one nobody else should
 * see (an email about your pay); the whole screen shows every window,
 * private ones included. */
export interface ShareWindow {
  id: string;
  app: "excel" | "outlook" | "explorer" | "screen";
  title: string;
  private?: boolean;
}

export interface Call {
  meetingId: string;
  title: string;
  people: Person[];
  stage: "prejoin" | "in" | "left";
  /* true is on: the microphone live, the camera showing you. */
  mic: boolean;
  camera: boolean;
  /* How the learner had them set as they pressed Join now. */
  joinedWith?: { mic: boolean; camera: boolean };
  /* What is on show now, and everything shown at any point in the call. */
  sharing: string | null;
  shared: string[];
  /* Bumped when another app (an invite's Join button) asks Teams to come
   * to the front. */
  ask?: number;
}

export interface TeamsState {
  chats: Chat[];
  windows: ShareWindow[];
  call?: Call;
}
/* ── end Module 3 ── */
/* ── Module 8: Documents (Word) ──────────────────────────────────────────
 * A Word document as data, so a check can read real styles, placeholders,
 * form answers and tracked changes. It is a list of blocks (paragraphs, a
 * table, a form field), each with a style, as Word keeps it. Formatting
 * typed straight onto a paragraph (bold, a bigger size) is kept apart from
 * the style, which is how a check tells a real Heading 1 from Normal text
 * made bold and bigger. Kept general, so a CV or a report can use it too. */

export type WordStyle = "title" | "h1" | "h2" | "normal" | "bullet" | "number";

/* A form field (Word calls it a content control): a grey box to click and
 * type in, a date picker, a drop-down list, or a tick box. */
export interface WordField {
  /* What a check reads it by: "start", "approver". */
  key: string;
  kind: "text" | "date" | "choice" | "check";
  label: string;
  required?: boolean;
  options?: string[];
}

export interface WordBlock {
  id: string;
  style: WordStyle;
  /* What the paragraph says now. A tick box holds "yes" or "". */
  text: string;
  /* Formatting put straight on the paragraph, over its style. */
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  size?: number; // points
  align?: "left" | "center" | "right";
  /* Tracked changes: the paragraph before them, and whose they are. The
   * changes themselves are the difference between `base` and `text`. A
   * whole paragraph added or removed is marked `revPara`. */
  base?: string;
  revBy?: string;
  revPara?: "ins" | "del";
  /* A table, row by row; the first row is the heading row. */
  table?: string[][];
  field?: WordField;
}

export interface WordComment {
  id: string;
  blockId: string;
  by: string;
  time: string;
  text: string;
}

export interface WordDoc {
  blocks: WordBlock[];
  /* The letterhead, printed at the top of every page. */
  header?: { name: string; lines: string[] };
  footer?: string;
  comments?: WordComment[];
  /* Track Changes is on: edits show as changes for someone to accept. */
  tracking?: boolean;
  /* Words the spelling check was told to ignore. */
  ignored?: string[];
  /* The template it was started from, e.g. "Letterhead.dotx". */
  template?: string;
}
/* ── Module 13: Show what you can do ────────────────────────────────────
 * The recruitment agency's online tests (E13.2): every typing test and
 * Excel test taken in its test centre, practice runs included, so a job's
 * checks and the module page can read the best of them. */

export interface TypingResult {
  at: number; // when it was taken (ms)
  practice: boolean;
  seconds: number; // how long it ran
  chars: number; // characters typed, spaces included
  words: number; // words typed
  errors: number; // words left wrong
  gross: number; // words a minute, before mistakes
  net: number; // words a minute, after mistakes
  accuracy: number; // per cent of characters right
}

export interface ExcelTestResult {
  at: number;
  practice: boolean;
  seconds: number;
  /* The tasks marked right, by number (1 to 10). */
  right: number[];
  /* The clock ran out before it was handed in. */
  timedOut?: boolean;
}

export interface AgencyRecord {
  typing: TypingResult[];
  excel: ExcelTestResult[];
}
/* ── end Module 13 ── */
/* ── Module 10: Admin in practice ───────────────────────────────────────
 * Business paperwork drawn from data (a purchase order, an invoice, a
 * delivery note, a receipt), pictures on a sheet (a receipt on an expense
 * claim), the desk phone's calls and the courier site's bookings. Every
 * field is optional, so the other modules' offices are untouched. These
 * merge into the interfaces above. */

/* A party on a piece of paperwork: who it is from, or who it is to. */
export interface DocParty {
  name: string;
  lines: string[];
  phone?: string;
  email?: string;
  vatNo?: string;
}

export interface DocLine {
  code?: string;
  item: string;
  qty: number;
  unit?: string; // "pallet", "sack"
  price?: number; // each, before VAT
  /* A delivery note: how many came off the van. */
  delivered?: number;
}

export interface BizDoc {
  kind: "po" | "invoice" | "delivery" | "receipt" | "credit";
  number: string; // "3307", "HP-2291", "DN-77812"
  date: string; // "02/11/2026"
  from: DocParty;
  to: DocParty;
  /* Deliver to, when it differs from the buyer's address. */
  shipTo?: DocParty;
  /* Other references printed on it: ["Your order", "PO 3307"]. */
  refs: [string, string][];
  lines: DocLine[];
  vatRate?: number; // 0.2
  bank?: { name: string; sortCode: string; account: string };
  terms?: string; // "30 days from invoice date"
  due?: string; // "10/12/2026"
  /* Who signed it, in handwriting: a delivery note's receiver, a PO's approver. */
  signed?: string;
  signedRole?: string;
  /* Handwriting on the page: "Only 10 on the van. 2 short. SP". */
  note?: string;
  footer?: string;
  /* A receipt's own lines, printed as a till or ticket office does. */
  receipt?: { title: string; lines: [string, string][]; total: string; paid: string };
}

export interface Paper {
  /* Drawn as a real document (paperwork.tsx) when present. */
  doc?: BizDoc;
}

/* A picture inserted on a sheet (Insert > Pictures), with a copy of what
 * it shows, so it still draws if the photo is later moved. */
export interface SheetPicture {
  fileId: string;
  name: string;
  paper?: Paper;
}

export interface Tab {
  pictures?: SheetPicture[];
}

export interface CourierAddress {
  name: string;
  lines: string[];
  postcode: string;
  contact?: string;
  phone?: string;
}

export interface CourierBooking {
  ref: string;
  status: "booked" | "cancelled" | "collected";
  /* "collect": the courier picks up from you. "dropoff": you take it to a shop. */
  method: "collect" | "dropoff";
  from: CourierAddress;
  to: CourierAddress;
  date: string; // "2026-11-13"
  window: string; // "13:00 to 17:00"
  parcels: { kg: number; cm?: string }[];
  service: string;
  price: number;
  booked: string; // "12/11/2026 15:14"
}

/* A call on the desk phone. A recorded call keeps its words, so the
 * learner can play it back and read along. */
export interface PhoneCall {
  id: string;
  name: string;
  company?: string;
  number: string;
  time: string; // "14:20"
  /* "in": they rang you. "missed": nobody answered. "out": you rang them. */
  way: "in" | "missed" | "out";
  seconds: number;
  /* Rings when the job opens, until it is answered. */
  ringing?: boolean;
  /* The conversation, line by line, each at its second into the call. */
  lines?: { who: "them" | "you"; at: number; text: string }[];
}

export interface OfficeState {
  /* The desk phone: its call list, and which ringing calls were answered. */
  phone?: { calls: PhoneCall[]; answered: string[] };
  /* The courier site's account: every booking made, cancelled ones too. */
  courier?: { bookings: CourierBooking[] };
}
/* ── end Module 10 ── */

/* ── Module 9: Files and sharing ─────────────────────────────────────────
 * What OneDrive and SharePoint keep about a file beyond its contents: its
 * earlier versions, who can open it and how, and the Recycle bin. Kept as
 * data so a job's checks read who can edit, what was sent to whom, and
 * which version is current, never the clicks. */

/* One earlier version of a file, as Version history lists it. */
export interface FileVersion {
  /* "1.0", "2.0": SharePoint numbers every saved version. */
  no: string;
  /* When it was saved, as shown: "09/11/2026 17:42". */
  modified: string;
  by: string;
  sheet?: Grid;
  tabs?: Tab[];
  doc?: WordDoc;
  paper?: Paper;
  /* "Restored from version 2.0", when it came from a restore. */
  comment?: string;
}

export type ShareRole = "edit" | "view";

/* A person with access to one file: someone it was shared with by name. */
export interface AccessGrant {
  person: Person;
  role: ShareRole;
}

/* A sharing link, as OneDrive makes them: who it works for and what they
 * can do. "people" works only for the people named in it; "org" for anyone
 * at Northfield who has the link; "anyone" for anyone at all, even outside
 * the company; "existing" only for people who already have access. */
export interface ShareLink {
  id: string;
  scope: "anyone" | "org" | "people" | "existing";
  role: ShareRole;
  people: Person[];
  url: string;
}

/* A file or folder in the Recycle bin, with everything that was inside a
 * folder, and where it was. Restore puts them all back. */
export interface RecycledItem {
  id: string;
  file: OfficeFile;
  inside: OfficeFile[];
  deleted: string;
}
/* ── end Module 9 ── */
/* ── Module 11: Staying safe at work ───────────────────────────────────
 * The address book's extra people (a customer who shares a first name
 * with HR), the desk phone's contacts and the numbers it can ring, an
 * email's automatic answer, the two-step sign-in prompt on the learner's
 * own mobile, and the computer's lock screen. Every field is optional, so
 * the other modules' offices are untouched. These merge into the
 * interfaces above. */

/* Someone the To box can suggest, with the line Outlook shows under the
 * name ("HR Advisor, Northfield Supplies"). */
export interface Contact extends Person {
  detail?: string;
}

/* A saved number on the desk phone: the numbers the company already holds. */
export interface PhoneEntry {
  name: string;
  company?: string;
  role?: string;
  number: string;
  group: "Northfield Supplies" | "Suppliers" | "Customers";
}

/* A number the desk phone can ring, and the call that happens when it
 * does. Lines are timed when the job is seeded (admin.ts `timed`). */
export type DialScript = Pick<PhoneCall, "name" | "company" | "number" | "seconds" | "lines">;

/* The sign-in request that arrives on the learner's mobile. */
export interface SignInPrompt {
  at: string; // "15:02"
  app: string; // "Microsoft 365"
  location: string;
  /* "waiting": not arrived yet. "shown": on the phone, unanswered. */
  status: "waiting" | "shown" | "approved" | "denied";
  /* Reported to IT from the app, after denying it. */
  reported?: boolean;
}

export interface OfficeState {
  /* People the To box suggests on top of the company's own list. */
  contacts?: Contact[];
  /* The desk phone's saved numbers, and what happens when one is rung. */
  phoneBook?: PhoneEntry[];
  dialable?: DialScript[];
  /* An answer that arrives when the learner emails a given address. */
  replies?: { to: string; reply: Email; sent?: boolean }[];
  signIn?: SignInPrompt;
  /* The computer's lock screen: whether it is locked now, and whether it
   * was locked after the sign-in prompt had been dealt with. */
  screen?: { locked: boolean; locks: number; afterPrompt?: boolean };
}
/* ── end Module 11 ── */
/* ── Module 12: AI as your assistant (Copilot) ───────────────────────────
 * Everything the learner sends to Copilot, and what came back, kept in the
 * office record so a check can read exactly what went in: the prompt for a
 * draft (AI-1), the question about a formula (AI-3), and whether any
 * personal details were pasted (AI-4). Copilot here is scripted, not live
 * AI (owner, 2026-11-10): ./copilot.ts reads the prompt and picks a written
 * answer, and its drafts carry planted mistakes to catch (AI-2). */

/* Where Copilot was asked: its own app, a reply in Outlook, or Excel's pane. */
export type CopilotHost = "app" | "outlook" | "excel";

export interface CopilotTurn {
  id: string;
  host: CopilotHost;
  /* Exactly what the learner sent. */
  prompt: string;
  /* Which scripted answer it got: "draft", "vague", "summary", "explain",
   * "count", "nothing" or "help". */
  kind: string;
  reply: string;
  /* For a draft: which of the three a good prompt gives. */
  marks?: { facts: boolean; reader: boolean; tone: boolean };
  /* What the reply was drawn from, as Copilot's references line shows it. */
  refs?: string[];
  /* A note from Desk Ready (not from Copilot) on what to try next. */
  tip?: string;
  /* A good prompt to copy, offered after two weak tries. */
  example?: string;
  /* Which wording of the answer this is (Regenerate moves it on). */
  variant?: number;
}

export interface CopilotState {
  turns: CopilotTurn[];
  /* The job's draft scenario (a key in ./copilot.ts BRIEFS). */
  brief?: string;
  /* Text the paste box can drop in, as if copied from an email. */
  clip?: { label: string; text: string; people?: string[] };
}

/* What Outlook or Excel hands the Copilot pane it hosts. */
export interface CopilotPaneContext {
  host: "outlook" | "excel";
  close: () => void;
  /* Outlook: the email being answered, and putting a draft into the reply. */
  replyTo?: Email;
  insert?: (text: string) => void;
  /* Excel: the open workbook's name and sheet, and the selected cell. */
  fileName?: string;
  grid?: Grid;
  cell?: { name: string; raw: string };
}
/* ── end Module 12 ── */

/* ── Final task: Monday morning at the desk ──────────────────────────────
 * The capstone is one long timed job: Monday 16 November 2026, 08:30 to
 * 12:30 office time, played in about an hour. Its clock, what has arrived
 * so far, when each of its ten jobs was finished, and the scorecard it left
 * are all kept in the office record, so leaving and coming back carries on
 * where the learner was, and a signed-in learner's morning follows them to
 * another computer. Every field is optional, so the other jobs' offices are
 * untouched. These merge into the interfaces above. */

/* One finished morning, as kept for the learner (and offered to Module 13
 * as proof for a CV). Minutes are office minutes after 08:30. */
export interface MorningResult {
  /* When it was played (an ISO date and time). */
  on: string;
  endedAt: number;
  passed: boolean;
  done: number;
  late: number;
  jobs: { id: string; status: "done" | "late" | "missed" | "unreached"; doneAt?: number }[];
  paidScammer: boolean;
  leaked: boolean;
}

export interface MorningState {
  /* Office minutes since 08:30, from 0 to 240 (12:30). */
  minute: number;
  /* The clock has been started at least once. */
  started: boolean;
  paused: boolean;
  /* The arrivals that have landed, by id. */
  arrived: string[];
  /* When each of the ten jobs was last seen finished, by job id. */
  doneAt: Record<string, number>;
  /* When the scam email was reported, if it was. */
  reportedAt?: number;
  /* The morning is over: at 12:30, or when the learner said so. */
  endedAt?: number;
  result?: MorningResult;
  /* Earlier mornings, oldest first, kept when the learner tries again. */
  history?: MorningResult[];
}

export interface OfficeState {
  morning?: MorningState;
}

/* A timed job brings its own clock (shown on the taskbar, the task panel
 * and in the apps), and its own task panel in place of Check my work. */
export interface LiveJob {
  clock: (s: OfficeState) => string;
  /* The date under the time on the taskbar, "16/11/2026". */
  date?: string;
  /* What a fresh start keeps from the old record (earlier scorecards). */
  carry?: (old: OfficeState, fresh: OfficeState) => OfficeState;
  Panel?: import("react").ComponentType<{ state: OfficeState; dispatch: (a: import("./store").Action) => void; restart: () => void }>;
}

export interface Job {
  live?: LiveJob;
}
/* ── end Final task ── */
