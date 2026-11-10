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

export type FileKind = "folder" | "xlsx" | "xltx" | "docx" | "pdf";

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
  seed: () => OfficeState;
  check: (s: OfficeState) => Check[];
  /* The five habits (criteria doc), each met when all its checks pass. */
  habits: { label: string; checks: string[] }[];
}

export const pathText = (p: Path) => p.join(" > ");

/* A workbook's sheets, whether it was saved with tabs or as one sheet. */
export const tabsOf = (f: { sheet?: Grid; tabs?: Tab[] }): Tab[] => f.tabs ?? (f.sheet ? [{ name: "Sheet1", grid: f.sheet }] : []);
export const samePath = (a: Path, b: Path) => a.length === b.length && a.every((x, i) => x === b[i]);
