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
  status: "booked" | "cancelled";
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
