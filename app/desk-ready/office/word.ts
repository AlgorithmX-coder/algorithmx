import type { Path, WordBlock, WordDoc, WordStyle } from "./types";

/* Module 8: the Word document model's working parts, kept free of React so
 * the app, the lessons' practice and the office jobs' checks all read a
 * document the same way: its styles, its placeholders, its spelling, its
 * form answers and its tracked changes. */

/* ── the look: Word's own defaults (Microsoft 365) ─────────────────────── */

export const WORD = Object.freeze({
  body: "Aptos, Calibri, 'Segoe UI', Arial, sans-serif",
  display: "'Aptos Display', Aptos, 'Calibri Light', Calibri, 'Segoe UI', sans-serif",
  heading: "#0f4761",
  canvas: "#e8e8e8",
  ribbon: "#f3f2f1",
  /* who made a tracked change: the first reviewer red, you blue */
  them: "#c50f1f",
  you: "#0f6cbd",
  comment: "#fff2b8",
  placeholder: "#e6e6e6",
  spelling: "#e81123",
  grammar: "#2b579a",
  /* a page at 100%: A4, with Word's 2.54cm margins */
  pageW: 794,
  pageH: 1123,
  margin: 92,
});

export interface StyleSpec {
  label: string;
  font: string;
  pt: number;
  colour: string;
  weight: number;
  before: number; // pt
  after: number; // pt
}

export const STYLES: Record<WordStyle, StyleSpec> = {
  normal: { label: "Normal", font: WORD.body, pt: 12, colour: "#000000", weight: 400, before: 0, after: 6 },
  title: { label: "Title", font: WORD.display, pt: 28, colour: "#000000", weight: 400, before: 0, after: 6 },
  h1: { label: "Heading 1", font: WORD.display, pt: 20, colour: WORD.heading, weight: 400, before: 16, after: 6 },
  h2: { label: "Heading 2", font: WORD.display, pt: 16, colour: WORD.heading, weight: 400, before: 10, after: 4 },
  bullet: { label: "List Bullet", font: WORD.body, pt: 12, colour: "#000000", weight: 400, before: 0, after: 2 },
  number: { label: "List Number", font: WORD.body, pt: 12, colour: "#000000", weight: 400, before: 0, after: 2 },
};

export const px = (pt: number) => Math.round(pt * (96 / 72) * 10) / 10;

/* The size a paragraph shows at: typed straight on, or its style's. */
export const sizeOf = (b: WordBlock) => b.size ?? STYLES[b.style].pt;

/* Normal text dressed up as a heading: bold, or bigger than 12pt, on a
 * Normal paragraph. Word's navigation pane, a screen reader and a table of
 * contents can't see it as a heading (criteria WD-1). */
export const isFakeHeading = (b: WordBlock) => b.style === "normal" && !b.table && !b.field && b.text.trim() !== "" && (sizeOf(b) > 12 || (!!b.bold && b.text.trim().split(/\s+/).length <= 8));

export const isHeading = (b: WordBlock) => b.style === "h1" || b.style === "h2" || b.style === "title";

let counter = 0;
export const blockId = () => `b-${Date.now().toString(36)}-${(counter++).toString(36)}`;

export const para = (text: string, style: WordStyle = "normal", extra: Partial<WordBlock> = {}): WordBlock => ({ id: blockId(), style, text, ...extra });

/* ── reading a document ─────────────────────────────────────────────────── */

/* Every piece of text a reader sees, paragraph by paragraph: tables cell by
 * cell, form fields as their answers. */
export function lines(doc: WordDoc): string[] {
  const out: string[] = [];
  for (const b of doc.blocks) {
    if (b.table) b.table.forEach((r) => out.push(r.join(" ")));
    else if (b.field) out.push(b.field.kind === "check" ? "" : b.text);
    else out.push(b.text);
  }
  return out;
}

export const docText = (doc: WordDoc) => lines(doc).join("\n");

export const wordCount = (doc: WordDoc) => docText(doc).split(/\s+/).filter((w) => /[A-Za-z0-9£]/.test(w)).length;

/* A form field's answer, by its key. */
export const fieldValue = (doc: WordDoc, key: string) => doc.blocks.find((b) => b.field?.key === key)?.text.trim() ?? "";

/* Required form fields still empty, by their labels. */
export const emptyRequired = (doc: WordDoc) => doc.blocks.filter((b) => b.field?.required && !b.text.trim()).map((b) => b.field!.label);

/* ── placeholders: the [Date] and [Recipient name] a template leaves ───── */

export const PLACEHOLDER = /\[[^\]\n]{1,40}\]/g;

export function placeholdersIn(doc: WordDoc): string[] {
  return lines(doc).flatMap((l) => l.match(PLACEHOLDER) ?? []);
}

/* A new, untitled document from a template: the template's file stays as
 * it was, and the copy remembers where it came from. */
export function fromTemplate(doc: WordDoc, templateName: string): WordDoc {
  return { ...structuredClone(doc), blocks: doc.blocks.map((b) => ({ ...structuredClone(b), id: blockId() })), template: templateName, comments: [] };
}

/* ── spelling and grammar ────────────────────────────────────────────────
 * No dictionary: a list of the mistakes people really make (and the ones
 * the course plants), each with what Word would suggest. A name is never
 * on the list, as a real spelling check doesn't know names either; that's
 * why the course says read it back. */

const MISSPELT: Record<string, string[]> = {
  recieve: ["receive"],
  recieved: ["received"],
  sory: ["sorry", "sore"],
  appologise: ["apologise"],
  apolagise: ["apologise"],
  appologies: ["apologies"],
  apologys: ["apologies"],
  occured: ["occurred"],
  occurence: ["occurrence"],
  seperate: ["separate"],
  seperately: ["separately"],
  definately: ["definitely"],
  accomodate: ["accommodate"],
  acommodate: ["accommodate"],
  adress: ["address"],
  bussiness: ["business"],
  buisness: ["business"],
  calender: ["calendar"],
  collegue: ["colleague"],
  colleage: ["colleague"],
  comittee: ["committee"],
  concious: ["conscious"],
  correspondance: ["correspondence"],
  embarass: ["embarrass"],
  enviroment: ["environment"],
  existance: ["existence"],
  febuary: ["February"],
  wensday: ["Wednesday"],
  wednsday: ["Wednesday"],
  tommorow: ["tomorrow"],
  tomorow: ["tomorrow"],
  goverment: ["government"],
  gaurantee: ["guarantee"],
  immediatly: ["immediately"],
  independant: ["independent"],
  liase: ["liaise"],
  maintainance: ["maintenance"],
  neccessary: ["necessary"],
  necessery: ["necessary"],
  noticable: ["noticeable"],
  occassion: ["occasion"],
  persue: ["pursue"],
  posession: ["possession"],
  prefered: ["preferred"],
  publically: ["publicly"],
  recomend: ["recommend"],
  reccomend: ["recommend"],
  refered: ["referred"],
  relevent: ["relevant"],
  remeber: ["remember"],
  responsable: ["responsible"],
  sincerly: ["sincerely"],
  sincerley: ["sincerely"],
  succesful: ["successful"],
  sucessful: ["successful"],
  supercede: ["supersede"],
  suprise: ["surprise"],
  untill: ["until"],
  wierd: ["weird"],
  writting: ["writing"],
  thier: ["their"],
  teh: ["the"],
  adn: ["and"],
  wich: ["which"],
  becuase: ["because"],
  beacuse: ["because"],
  freind: ["friend"],
  beleive: ["believe"],
  acheive: ["achieve"],
  refunfed: ["refunded"],
  refundd: ["refunded"],
  reciept: ["receipt"],
  invoce: ["invoice"],
  invioce: ["invoice"],
  delivary: ["delivery"],
  deliverys: ["deliveries"],
  dilivery: ["delivery"],
  customor: ["customer"],
  napkens: ["napkins"],
  quanity: ["quantity"],
  quantaty: ["quantity"],
  paymant: ["payment"],
  accross: ["across"],
  alot: ["a lot"],
  arguement: ["argument"],
  basicly: ["basically"],
  begining: ["beginning"],
  carefuly: ["carefully"],
  completly: ["completely"],
  confirmd: ["confirmed"],
  convinient: ["convenient"],
  dissapoint: ["disappoint"],
  dissapointed: ["disappointed"],
  excercise: ["exercise"],
  experiance: ["experience"],
  familar: ["familiar"],
  finaly: ["finally"],
  foward: ["forward"],
  fourty: ["forty"],
  grammer: ["grammar"],
  happend: ["happened"],
  harrass: ["harass"],
  hieght: ["height"],
  incidently: ["incidentally"],
  knowlege: ["knowledge"],
  lenght: ["length"],
  libary: ["library"],
  managment: ["management"],
  mispell: ["misspell"],
  monday: ["Monday"],
  tuesday: ["Tuesday"],
  wednesday: ["Wednesday"],
  thursday: ["Thursday"],
  friday: ["Friday"],
  december: ["December"],
  november: ["November"],
  oppurtunity: ["opportunity"],
  pallett: ["pallet"],
  palet: ["pallet"],
  plese: ["please"],
  pleese: ["please"],
  probaly: ["probably"],
  realy: ["really"],
  resturant: ["restaurant"],
  shedule: ["schedule"],
  similiar: ["similar"],
  supplys: ["supplies"],
  supliers: ["suppliers"],
  suplier: ["supplier"],
  thankyou: ["thank you"],
  truely: ["truly"],
  unfortunatly: ["unfortunately"],
  usualy: ["usually"],
  welcom: ["welcome"],
  wheather: ["whether", "weather"],
  im: ["I'm"],
  dont: ["don't"],
  cant: ["can't"],
  wont: ["won't"],
  didnt: ["didn't"],
  doesnt: ["doesn't"],
  isnt: ["isn't"],
  wasnt: ["wasn't"],
  couldnt: ["couldn't"],
  shouldnt: ["shouldn't"],
  ive: ["I've"],
  youre: ["you're"],
  procedur: ["procedure"],
  procedue: ["procedure"],
  holliday: ["holiday"],
  hoilday: ["holiday"],
  requst: ["request"],
};

export interface Issue {
  blockId: string;
  start: number;
  end: number;
  word: string;
  kind: "spelling" | "grammar";
  suggestions: string[];
  message: string;
}

const matchCase = (like: string, s: string) => (/^[A-Z]/.test(like) && /^[a-z]/.test(s) ? s[0].toUpperCase() + s.slice(1) : s);

/* Day and month names written in lower case are only wrong as words on
 * their own; "monday" is flagged, "Monday" is fine. */
function spellingIn(text: string): Omit<Issue, "blockId">[] {
  const out: Omit<Issue, "blockId">[] = [];
  for (const m of text.matchAll(/[A-Za-z][A-Za-z']*/g)) {
    const word = m[0].replace(/'+$/, "");
    const lower = word.toLowerCase();
    const sugg = MISSPELT[lower];
    if (!sugg || sugg.length === 0) continue;
    if (word !== lower && /^[A-Z][a-z]+$/.test(word) && ["monday", "tuesday", "wednesday", "thursday", "friday", "december", "november"].includes(lower)) continue;
    if (lower === "im" && word === "IM") continue;
    out.push({ start: m.index!, end: m.index! + word.length, word, kind: "spelling", suggestions: sugg.map((s) => matchCase(word, s)), message: "Not in the dictionary" });
  }
  return out;
}

const VOWEL_START = /^(?!one\b|once\b|use|usu|uni|euro|eu)[aeio]|^hour|^honest|^honour/i;

function grammarIn(text: string): Omit<Issue, "blockId">[] {
  const out: Omit<Issue, "blockId">[] = [];
  for (const m of text.matchAll(/\b([A-Za-z]+)(\s+)(\1)\b/gi)) {
    if (m[1].toLowerCase() === "had" || m[1].toLowerCase() === "that") continue;
    const start = m.index! + m[1].length;
    out.push({ start, end: start + m[2].length + m[3].length, word: m[2] + m[3], kind: "grammar", suggestions: [""], message: `"${m[1]}" twice in a row` });
  }
  for (const m of text.matchAll(/\b(a)(\s+)([A-Za-z]+)/g)) {
    if (!VOWEL_START.test(m[3])) continue;
    out.push({ start: m.index!, end: m.index! + 1, word: "a", kind: "grammar", suggestions: ["an"], message: `Use "an" before a word that starts with a vowel sound: an ${m[3]}` });
  }
  for (const m of text.matchAll(/(^|\s)(i)(?=[\s,]|$)/g)) {
    const start = m.index! + m[1].length;
    out.push({ start, end: start + 1, word: "i", kind: "grammar", suggestions: ["I"], message: 'On its own, "I" is always a capital' });
  }
  return out;
}

const ignoreKey = (i: Pick<Issue, "kind" | "word">) => (i.kind === "spelling" ? i.word.toLowerCase() : `g:${i.word.toLowerCase().trim()}`);

/* Issues in one piece of text, minus the ones the learner ignored. */
export function issuesIn(text: string, ignored: readonly string[] = []): Omit<Issue, "blockId">[] {
  return [...spellingIn(text), ...grammarIn(text)].filter((i) => !ignored.includes(ignoreKey(i))).sort((a, b) => a.start - b.start);
}

/* Every issue in a document's paragraphs, in reading order. Tables and
 * form answers are left alone, as Word's check is mostly run on prose. */
export function issues(doc: WordDoc, opts: { all?: boolean } = {}): Issue[] {
  const ignored = opts.all ? [] : (doc.ignored ?? []);
  return doc.blocks.filter((b) => !b.table && !b.field && b.revPara !== "del").flatMap((b) => issuesIn(b.text, ignored).map((i) => ({ ...i, blockId: b.id })));
}

export const ignoreIssue = (doc: WordDoc, i: Issue): WordDoc => ({ ...doc, ignored: [...(doc.ignored ?? []), ignoreKey(i)] });

export function changeIssue(doc: WordDoc, i: Issue, to: string): WordDoc {
  return {
    ...doc,
    blocks: doc.blocks.map((b) => {
      if (b.id !== i.blockId || b.text.slice(i.start, i.end) !== i.word) return b;
      let text = b.text.slice(0, i.start) + to + b.text.slice(i.end);
      text = text.replace(/ {2,}/g, " ");
      return withText(b, text, doc.tracking ? "You" : undefined);
    }),
  };
}

/* ── tracked changes ──────────────────────────────────────────────────────
 * A paragraph with changes keeps what it said before (`base`) beside what
 * it says now (`text`). The changes are the words that differ, found by
 * comparing the two word by word; a run of removed and added words next to
 * each other is one change ("48 hours" to "24 hours"), as Word shows it. */

export type Op = { t: "eq" | "del" | "ins"; s: string; hunk: number };

const tokens = (s: string) => s.match(/\s+|[^\s]+/g) ?? [];

export function diff(base: string, text: string): Op[] {
  const a = tokens(base);
  const b = tokens(text);
  const n = a.length;
  const m = b.length;
  const L: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const raw: { t: Op["t"]; s: string }[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      raw.push({ t: "eq", s: a[i++] });
      j++;
    }
    else if (L[i + 1][j] >= L[i][j + 1]) raw.push({ t: "del", s: a[i++] });
    else raw.push({ t: "ins", s: b[j++] });
  }
  while (i < n) raw.push({ t: "del", s: a[i++] });
  while (j < m) raw.push({ t: "ins", s: b[j++] });
  /* a lone space kept between two changes belongs to the change */
  for (let k = 1; k < raw.length - 1; k++) if (raw[k].t === "eq" && /^\s+$/.test(raw[k].s) && raw[k - 1].t !== "eq" && raw[k + 1].t !== "eq") raw.splice(k, 1, { t: "del", s: raw[k].s }, { t: "ins", s: raw[k].s });
  /* merge neighbours of a kind, removed words before added ones */
  const out: Op[] = [];
  let hunk = -1;
  let k = 0;
  while (k < raw.length) {
    if (raw[k].t === "eq") {
      const last = out[out.length - 1];
      if (last?.t === "eq") last.s += raw[k].s;
      else out.push({ t: "eq", s: raw[k].s, hunk: -1 });
      k++;
      continue;
    }
    hunk++;
    let del = "";
    let ins = "";
    while (k < raw.length && raw[k].t !== "eq") {
      if (raw[k].t === "del") del += raw[k].s;
      else ins += raw[k].s;
      k++;
    }
    if (del) out.push({ t: "del", s: del, hunk });
    if (ins) out.push({ t: "ins", s: ins, hunk });
  }
  return out;
}

/* The paragraph's changes as Word draws them. */
export function opsOf(b: WordBlock): Op[] {
  if (b.base === undefined) return [{ t: "eq", s: b.text, hunk: -1 }];
  if (b.revPara === "ins") return [{ t: "ins", s: b.text, hunk: 0 }];
  if (b.revPara === "del") return [{ t: "del", s: b.base, hunk: 0 }];
  return diff(b.base, b.text);
}

export interface Revision {
  blockId: string;
  hunk: number;
  by: string;
  del: string;
  ins: string;
  kind: "insert" | "delete" | "change";
}

export function revisions(doc: WordDoc): Revision[] {
  const out: Revision[] = [];
  for (const b of doc.blocks) {
    if (b.base === undefined) continue;
    const ops = opsOf(b);
    const n = Math.max(-1, ...ops.map((o) => o.hunk));
    for (let h = 0; h <= n; h++) {
      const del = ops.filter((o) => o.hunk === h && o.t === "del").map((o) => o.s).join("");
      const ins = ops.filter((o) => o.hunk === h && o.t === "ins").map((o) => o.s).join("");
      out.push({ blockId: b.id, hunk: h, by: b.revBy ?? "Someone", del, ins, kind: del && ins ? "change" : del ? "delete" : "insert" });
    }
  }
  return out;
}

/* A paragraph after one change is accepted or rejected: the change goes
 * into what it said before (accept), or out of what it says now (reject).
 * A paragraph that ends up gone (a rejected new one, an accepted removed
 * one) comes back as null. */
export function settle(b: WordBlock, hunk: number, accept: boolean): WordBlock | null {
  if (b.base === undefined) return b;
  if (b.revPara === "ins") return accept ? clean({ ...b, base: undefined }) : null;
  if (b.revPara === "del") return accept ? null : clean({ ...b, text: b.base, base: undefined });
  const ops = diff(b.base, b.text);
  const base = ops.map((o) => (o.t === "eq" ? o.s : o.hunk === hunk ? (accept === (o.t === "ins") ? o.s : "") : o.t === "del" ? o.s : "")).join("");
  const text = ops.map((o) => (o.t === "eq" ? o.s : o.hunk === hunk ? (accept === (o.t === "ins") ? o.s : "") : o.t === "ins" ? o.s : "")).join("");
  return clean({ ...b, base, text });
}

function clean(b: WordBlock): WordBlock {
  if (b.base !== undefined && b.base !== b.text) return b;
  const { base: _b, revBy: _r, revPara: _p, ...rest } = b;
  void _b;
  void _r;
  void _p;
  return rest;
}

export function settleIn(doc: WordDoc, r: Pick<Revision, "blockId" | "hunk">, accept: boolean): WordDoc {
  const blocks: WordBlock[] = [];
  for (const b of doc.blocks) {
    if (b.id !== r.blockId) blocks.push(b);
    else {
      const next = settle(b, r.hunk, accept);
      if (next) blocks.push(next);
    }
  }
  /* a comment on a paragraph that has gone goes with it */
  return { ...doc, blocks, comments: (doc.comments ?? []).filter((c) => blocks.some((b) => b.id === c.blockId)) };
}

export function settleAll(doc: WordDoc, accept: boolean): WordDoc {
  let d = doc;
  for (let guard = 0; guard < 400; guard++) {
    const r = revisions(d)[0];
    if (!r) break;
    d = settleIn(d, r, accept);
  }
  return d;
}

/* What a paragraph says once only other people's changes count: your own
 * tracked edits are left out, so a check can tell an untracked edit. */
export const committed = (b: WordBlock) => (b.revBy === "You" && b.base !== undefined ? b.base : b.text);

/* New text for a paragraph. With Track Changes on, the old words stay as
 * `base` so the edit shows as a change by `by`; with it off, the text just
 * changes. */
export function withText(b: WordBlock, text: string, by?: string): WordBlock {
  if (by && b.base === undefined && !b.table && !b.field) return clean({ ...b, base: b.text, revBy: by, text });
  return clean({ ...b, text });
}

/* ── dates typed into a form ──────────────────────────────────────────── */

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

/* "21/12/2026", "21/12/26", "21 December 2026", "Monday 21 December", "21 Dec"
 * all read as the same day. A year left off is taken as 2026. */
export function parseDate(s: string): { d: number; m: number; y: number } | null {
  const t = s.trim().toLowerCase().replace(/(\d)(st|nd|rd|th)\b/g, "$1").replace(/,/g, " ");
  let m = t.match(/^(?:[a-z]+\s+)?(\d{1,2})[/.-](\d{1,2})(?:[/.-](\d{2,4}))?$/);
  if (m) return valid(+m[1], +m[2], year(m[3]));
  m = t.match(/^(?:[a-z]+\s+)?(\d{1,2})\s+([a-z]+)(?:\s+(\d{2,4}))?$/);
  if (m) {
    const mi = MONTHS.findIndex((x) => x.startsWith(m![2].slice(0, 3)) && m![2].length >= 3 && x.startsWith(m![2]));
    if (mi >= 0) return valid(+m[1], mi + 1, year(m[3]));
  }
  return null;
}

const year = (y?: string) => (!y ? 2026 : y.length === 2 ? 2000 + Number(y) : Number(y));
function valid(d: number, m: number, y: number) {
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCDate() === d && date.getUTCMonth() === m - 1 ? { d, m, y } : null;
}

export const sameDay = (s: string, d: number, m: number, y: number) => {
  const p = parseDate(s);
  return !!p && p.d === d && p.m === m && p.y === y;
};

export const formatDate = (d: number, m: number, y: number) => `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;

/* ── where a document may be saved ────────────────────────────────────── */

/* The HR site is view only, except Forms > Completed, and Health and
 * safety is view only (criteria: where files live). */
export function canSaveIn(path: Path): boolean {
  if (path.length < 2) return false;
  if (path[0] === "HR") return path[1] === "Forms" && path[2] === "Completed";
  if (path[0] === "Operations Team" && path[2] === "Health and safety") return false;
  return true;
}

/* The house rule: "YYYY-MM-DD Short description.ext". */
export const followsHouseRule = (name: string) => /^\d{4}-\d{2}-\d{2} [A-Z][^/]*\.[a-z]{3,4}$/.test(name) && !/\b(final|v\d|new|copy)\b/i.test(name);
