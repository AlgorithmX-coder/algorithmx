import { bestExcel, bestTyping, realExcel, realTyping, typingPassed } from "./agency";
import type { AgencyRecord, WordBlock, WordDoc } from "./types";
import { STYLES, WORD, isHeading, para, px, sizeOf } from "./word";

/* Word's line height, as the page draws it (apps/WordParts LINE). */
const LINE = 1.3;

/* Module 13: a CV in the office's own Word (E13.1, criteria WD-1, WD-4),
 * kept free of React so the lesson's practice and the office job read a
 * CV the same way: its sections, its skill lines, whether they are the
 * learner's own words, and whether it fits on one page. */

export const CV_TEMPLATE = "CV.dotx";
export const CV_TEMPLATE_PATH = ["OneDrive", "Documents", "Custom Office Templates"] as const;

/* A one-page CV for a desk job: the name as the Title, a contact line with
 * a town (never a home address), then Profile, Skills, Experience and
 * Education (and References) as real Heading 1s. Every gap is a [placeholder] of 40
 * characters or fewer, so Word selects it in one click. */
export function cvTemplateDoc(): WordDoc {
  return {
    blocks: [
      para("[Your name]", "title"),
      para("[Town] · [Phone number] · [Email address]"),
      para("Profile", "h1"),
      para("[Who you are and the job you want]"),
      para("Skills", "h1"),
      para("[An office skill, in your own words]", "bullet"),
      para("[An office skill, in your own words]", "bullet"),
      para("[An office skill, in your own words]", "bullet"),
      para("Experience", "h1"),
      para("[Job title], [Employer]", "h2"),
      para("[Month and year] to [Month and year]"),
      para("[What you did, in office words]", "bullet"),
      para("[What you did, in office words]", "bullet"),
      para("Education", "h1"),
      para("[School or college, what you got, year]"),
      para("References", "h1"),
      para("Available on request."),
    ],
  };
}

/* ── starting lines: what the learner has actually done ──────────────────
 * Each finished office job offers one line a CV can use, in office words.
 * The learner is asked to make each one their own, not copy it.
 *
 * The seam for the course's final task: anything else that proves a skill
 * (the Monday morning scorecard, an agency test) comes in as `extra`, with
 * where it came from, and is offered the same way. */

export interface ProofLine {
  /* What it came from, said to the learner: "The morning delivery report". */
  from: string;
  line: string;
}

export const JOB_LINES: Readonly<Record<string, ProofLine>> = {
  m1j1: { from: "Monday's inbox", line: "Sorted a busy shared inbox into folders and flagged the urgent emails" },
  m1j2: { from: "Reply, Reply all or Forward?", line: "Replied to customers and suppliers, copying in the right colleagues" },
  m3j1: { from: "Book the stock meeting", line: "Booked meetings in Outlook, finding a time and a room that suited everyone" },
  m3j2: { from: "On the call", line: "Joined Teams calls and shared my screen to talk a manager through a rota" },
  m3j3: { from: "Chat or email?", line: "Wrote up meeting actions with an owner and a deadline for each" },
  m4j1: { from: "Fix the stock count", line: "Corrected a stock count in Excel against the warehouse's paper count" },
  m4j2: { from: "Start December's rota", line: "Set up a monthly staff rota in Excel" },
  m5j1: { from: "The morning delivery report", line: "Logged daily deliveries in Excel and flagged shortages" },
  m6j1: { from: "Make the sheet add up", line: "Totalled orders in Excel with SUM, AVERAGE and COUNT formulas" },
  m6j2: { from: "A quote with VAT", line: "Priced customer quotes in Excel, with VAT worked out by formula" },
  m6j3: { from: "Count the late ones", line: "Counted late deliveries with COUNTIF and reported the figure to a manager" },
  m7j1: { from: "Answer the manager's question", line: "Answered a manager's question from a sales sheet, with a chart" },
  m7j2: { from: "The number that can't be right", line: "Spotted and fixed a wrong figure in a weekly sales summary" },
  m8j1: { from: "A letter on the letterhead", line: "Wrote customer letters on the company letterhead and sent them as PDFs" },
  m8j2: { from: "Book your holiday", line: "Filled in HR forms and filed them where HR could find them" },
  m8j3: { from: "Review the delivery procedure", line: "Reviewed a procedure with Track Changes and explained each change" },
};

/* Offered when nothing is finished yet, with a warning to use only what
 * the learner can really do. */
export const GENERAL_LINES: readonly ProofLine[] = [
  { from: "Any office job", line: "Kept records up to date in Excel" },
  { from: "Any office job", line: "Answered customer emails politely and on time" },
  { from: "Any office job", line: "Saved and named files so the team could find them" },
];

/* The agency's tests as proof, once the learner has taken them for real. */
export function agencyLines(a: AgencyRecord | null): ProofLine[] {
  if (!a) return [];
  const out: ProofLine[] = [];
  const t = bestTyping(realTyping(a));
  if (t && typingPassed(t)) out.push({ from: "Pennyford's typing test", line: `Type at ${t.net} words a minute with ${Math.floor(t.accuracy)}% accuracy (agency test, November 2026)` });
  const e = bestExcel(realExcel(a));
  if (e && e.right.length >= 8) out.push({ from: "Pennyford's Excel test", line: `Scored ${e.right.length} out of 10 on an agency Excel test: formulas, sorting and formatting` });
  return out;
}

/* The lines to offer: one for every finished job, in course order, then
 * any extra proof. `general` is true when there was nothing to go on. */
export function cvStartingLines(done: readonly string[], extra: readonly ProofLine[] = []): { lines: ProofLine[]; general: boolean } {
  const lines = [...Object.entries(JOB_LINES).filter(([id]) => done.includes(id)).map(([, l]) => l), ...extra];
  return lines.length ? { lines, general: false } : { lines: [...GENERAL_LINES], general: true };
}

/* Every line the course ever offers, to tell a copied line from one the
 * learner wrote. */
export const ALL_STARTING_LINES: readonly string[] = [...Object.values(JOB_LINES), ...GENERAL_LINES].map((l) => l.line);

/* ── reading a CV ─────────────────────────────────────────────────────── */

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9£%]+/g, " ")
    .trim();

/* A line left exactly as it was offered: the same words in the same order,
 * whatever the capitals, full stops or commas. Changing even a few words
 * makes it the learner's own. */
export const isCopied = (line: string, offered: readonly string[] = ALL_STARTING_LINES) => {
  const n = norm(line);
  return !!n && offered.some((o) => norm(o) === n);
};

/* The name at the top: the first Title, or the first line. */
export const cvName = (doc: WordDoc) => (doc.blocks.find((b) => b.style === "title") ?? doc.blocks.find((b) => b.text.trim()))?.text.replace(/\s+/g, " ").trim() ?? "";

/* What the PDF should be called: "Jordan Miles CV.pdf". */
export const cvFileName = (doc: WordDoc) => `${cvName(doc)} CV.pdf`;

/* The paragraphs under a heading, up to the next heading. */
export function section(doc: WordDoc, heading: RegExp): WordBlock[] {
  const start = doc.blocks.findIndex((b) => isHeading(b) && heading.test(b.text));
  if (start < 0) return [];
  const out: WordBlock[] = [];
  for (const b of doc.blocks.slice(start + 1)) {
    if (b.style === "h1" || b.style === "title") break;
    out.push(b);
  }
  return out;
}

/* The skill lines: what sits under Skills, one line each. Skills typed as
 * bold or bigger Normal text still count here; the heading check is where
 * that is marked. */
export function skillLines(doc: WordDoc): string[] {
  let blocks = section(doc, /skill/i);
  if (!blocks.length) {
    /* "Skills" typed as a fake heading: read down to the next short line
     * made bold, or a real heading */
    const i = doc.blocks.findIndex((b) => /^\s*(key\s+)?skills\s*:?\s*$/i.test(b.text));
    if (i >= 0) {
      const rest = doc.blocks.slice(i + 1);
      const end = rest.findIndex((b) => isHeading(b) || (!!b.bold && b.text.trim().split(/\s+/).length <= 3));
      blocks = end < 0 ? rest : rest.slice(0, end);
    }
  }
  return blocks.filter((b) => !b.table && !b.field).map((b) => b.text.trim()).filter(Boolean);
}

/* A real skill line: four words or more, and no [placeholder] in it. */
export const isSkillLine = (s: string) => s.split(/\s+/).filter(Boolean).length >= 4 && !/\[[^\]]*\]/.test(s);

/* A home address: a house number and a street, or a full postcode. A town
 * is all a CV needs. */
export function homeAddress(doc: WordDoc): string | null {
  const text = doc.blocks.map((b) => b.text).join("\n");
  const street = text.match(/\b\d{1,4}[a-z]?,?\s+(?:[A-Z][a-z]+\s+){1,3}(?:Road|Rd|Street|St|Avenue|Ave|Lane|Close|Way|Drive|Crescent|Grove|Terrace|Gardens|Court|Place|Walk|Mews)\b/);
  if (street) return street[0];
  const postcode = text.match(/\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/);
  return postcode ? postcode[0] : null;
}

/* ── pages ────────────────────────────────────────────────────────────────
 * How many A4 pages the document fills, worked out from its paragraphs the
 * way Word lays them out (Word's 2.54cm margins, the styles' sizes and
 * spacing, lines wrapped at the page's width), so a check can say "one
 * page" without a screen to measure. It errs a little long, never short. */

const CONTENT_W = WORD.pageW - 2 * WORD.margin;
const CONTENT_H = WORD.pageH - 2 * WORD.margin;

/* Average width of a character in Aptos, as a share of its size. */
const charW = (b: WordBlock) => px(sizeOf(b)) * (b.bold || b.style === "title" ? 0.53 : 0.5);

function linesOf(text: string, width: number, cw: number): number {
  if (!text.trim()) return 1;
  let lines = 0;
  for (const piece of text.split("\n")) {
    let line = 0;
    lines++;
    for (const word of piece.split(/\s+/).filter(Boolean)) {
      const w = word.length * cw;
      const space = line ? cw : 0;
      if (line && line + space + w > width) {
        lines++;
        line = w;
      } else line += space + w;
    }
  }
  return lines;
}

export function contentHeight(doc: WordDoc): number {
  let h = 0;
  let after = 0;
  for (const b of doc.blocks) {
    if (b.revPara === "del") continue;
    const s = STYLES[b.style];
    if (b.table) {
      h += Math.max(after, 6) + b.table.length * (px(11) * LINE + 12) + 14;
      after = 0;
      continue;
    }
    if (b.field) {
      h += Math.max(after, 4) + 40;
      after = 0;
      continue;
    }
    const indent = b.style === "bullet" || b.style === "number" ? 30 : 0;
    h += Math.max(after, px(s.before)) + linesOf(b.text, CONTENT_W - indent, charW(b)) * px(sizeOf(b)) * LINE;
    after = px(s.after);
  }
  if (doc.header) h += 92;
  if (doc.footer) h += 62;
  return h + after;
}

export const pagesOf = (doc: WordDoc) => Math.max(1, Math.ceil(contentHeight(doc) / CONTENT_H));
