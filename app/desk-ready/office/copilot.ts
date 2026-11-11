import { colLetter, evaluate } from "./formula";
import type { CopilotHost, CopilotTurn, Email, Grid, OfficeState } from "./types";

/* Copilot for the office and the lessons (Module 12), SCRIPTED, not live
 * AI (owner, 2026-11-10: "scripted, with drafts that carry planted
 * mistakes"). `respond` reads what the learner typed and picks which
 * written answer fits:
 *
 * - a request for a draft is marked on whether it gives the facts, the
 *   reader and the tone (AI-1). A weak one gets a vague draft and a gentle
 *   tip; after two weak tries the tip carries a good prompt to copy. A good
 *   one gets a good draft that still carries the brief's planted mistakes,
 *   which the learner must catch (AI-2).
 * - a formula gets explained in plain words (AI-3).
 * - a question about a count gets a confident, wrong number, because
 *   counting is where AI slips and the learner should work it out.
 * - pasted text gets summarised, whatever is in it: Copilot never refuses
 *   for the learner. Keeping personal details out is the learner's job
 *   (AI-4), and `findPersonal` lights them in the paste box.
 *
 * Matching is forgiving: whole words, any case, a typo or two in longer
 * words (Thrusday, freindly, profesional), and plenty of other ways to say
 * the same thing. */

/* ── matching words, typos and all ──────────────────────────────────── */

export const wordsOf = (t: string) => t.toLowerCase().replace(/[’‘]/g, "'").match(/[a-z0-9']+/g) ?? [];

/* Edits to turn one word into another, a swap of two letters counting as one. */
export function typoDistance(a: string, b: string): number {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  return d[a.length][b.length];
}

/* A typed word matches a wanted one: the same, starts with it (friend in
 * friendly), or a slip or two away in a longer word. */
export function sameWord(typed: string, want: string): boolean {
  if (typed === want) return true;
  if (want.length >= 4 && typed.startsWith(want)) return true;
  if (want.length < 5 || Math.abs(typed.length - want.length) > 2) return false;
  return typoDistance(typed, want) <= (want.length >= 8 ? 2 : 1);
}

export const hasWord = (text: string, wanted: readonly string[]) => {
  const ws = wordsOf(text);
  return ws.some((w) => wanted.some((x) => sameWord(w, x)));
};

/* ── a draft's three ingredients ────────────────────────────────────── */

/* Words that say how it should sound. */
const TONES = {
  formal: ["formal", "professional", "respectful", "courteous", "businesslike", "official"],
  friendly: ["friendly", "warm", "kind", "cheerful", "upbeat", "informal", "casual", "chatty", "relaxed", "positive", "nice", "happy", "polite", "gentle", "reassuring", "helpful", "thankful", "grateful", "apologetic", "calm", "light"],
  short: ["short", "brief", "concise", "quick", "simple", "plain", "clear", "direct", "firm", "succinct", "snappy"],
} as const;

export type Tone = keyof typeof TONES;

export function toneOf(prompt: string): Tone | null {
  const ws = wordsOf(prompt);
  const found = (Object.keys(TONES) as Tone[]).filter((k) => ws.some((w) => TONES[k].some((x) => sameWord(w, x))));
  if (found.includes("short")) return "short";
  if (found.includes("formal")) return "formal";
  return found[0] ?? null;
}

export interface DraftBrief {
  id: string;
  /* Each fact a good prompt must give, and how to tell it is there. */
  facts: { name: string; test: (t: string) => boolean }[];
  /* A fact given wrongly ("Friday"), and what to say about it. */
  wrong?: { test: (t: string) => boolean; tip: string }[];
  /* Words that say who it is for. */
  reader: readonly string[];
  readerName: string;
  /* Where the learner finds the facts. */
  source: string;
  /* A good draft, carrying the planted mistakes, in the tone asked for. */
  draft: (tone: Tone | null, variant: number) => string;
  /* What a weak prompt gets back. */
  vague: (variant: number) => string;
  example: string;
  refs: string[];
}

const day = (name: string, short: string) => (t: string) => hasWord(t, [name, short]);
const time = (h: string, word: string) => (t: string) =>
  new RegExp(`\\b(before|by|for|until|no later than|at)\\s*${h}\\b|\\b${h}\\s*[:.]\\s*00\\b|\\b${h}\\s*(am|a\\.m)|\\b${h}\\s*o'?clock|\\b${word}\\s*(am|o'?clock)\\b`, "i").test(t);

/* E12.1: Kent Bakery's flour, from Sarah's email. Copilot's good draft says
 * Friday (it's Thursday) and offers a 10% discount nobody agreed. */
const KENT: DraftBrief = {
  id: "kent-flour",
  facts: [
    { name: "how many sacks (30)", test: (t) => /\b30\b/.test(t) || hasWord(t, ["thirty"]) },
    { name: "the day (Thursday 12 November)", test: (t) => day("thursday", "thurs")(t) || /\b12(th)?\s*(of\s*)?nov|\b12\/11\b/i.test(t) },
    { name: "the time (before 10:00)", test: time("10", "ten") },
  ],
  wrong: [{ test: (t) => hasWord(t, ["friday"]) && !hasWord(t, ["thursday"]), tip: "Your prompt says Friday, but Sarah's email says Thursday 12 November." }],
  reader: ["kent", "bakery", "baker", "ahmed", "imran", "customer", "client"],
  readerName: "Imran Ahmed at Kent Bakery",
  source: "Sarah's email",
  draft: (tone, v) => {
    if (tone === "short")
      return v % 2 === 0
        ? "Hi Imran,\n\nConfirmed: your flour order is now 30 sacks, delivered on Friday 13 November before 10:00, with 10% off this order.\n\nThanks,\nNorthfield Supplies"
        : "Hi Imran,\n\nAll sorted: 30 sacks of flour, arriving Friday 13 November before 10:00. We've taken 10% off this order too.\n\nThanks,\nNorthfield Supplies";
    if (tone === "formal")
      return v % 2 === 0
        ? "Dear Mr Ahmed,\n\nThank you for your email. I am pleased to confirm that your flour order has been changed to 30 sacks, and it will be delivered on Friday 13 November, before 10:00.\n\nAs a thank you for your custom, we are happy to offer you a 10% discount on this order.\n\nPlease do not hesitate to contact me if you need anything else.\n\nKind regards,\nNorthfield Supplies"
        : "Dear Mr Ahmed,\n\nThank you for getting in touch. I can confirm that we have updated your order to 30 sacks of flour, for delivery on Friday 13 November before 10:00.\n\nWe would also like to offer you 10% off this order, with our thanks for your patience.\n\nKind regards,\nNorthfield Supplies";
    return v % 2 === 0
      ? "Hi Imran,\n\nThanks for getting in touch. Good news: your flour order is now 30 sacks, and we'll have it with you on Friday 13 November, before 10:00.\n\nWe'd also like to give you 10% off this order, as a thank you.\n\nAny questions, just let me know.\n\nBest wishes,\nNorthfield Supplies"
      : "Hi Imran,\n\nThank you for your message. I'm happy to confirm the change: 30 sacks of flour, delivered on Friday 13 November before 10:00.\n\nAs a small thank you, we're taking 10% off this order.\n\nKind regards,\nNorthfield Supplies";
  },
  vague: (v) =>
    v % 2 === 0
      ? "Hi,\n\nThank you for your email. I'm happy to confirm the change to your order.\n\nPlease let me know if there's anything else you need.\n\nKind regards"
      : "Hello,\n\nThanks for your message. The change you asked for has been made.\n\nIf you have any questions, just let me know.\n\nBest regards",
  example: "Write a short, friendly reply to Imran Ahmed at Kent Bakery. Confirm his flour order is now 30 sacks, delivered on Thursday 12 November, before 10:00.",
  refs: ["Re: Thursday's flour"],
};

/* Lesson 2's practice: Rita at Oak Street Deli wants napkins added to
 * Wednesday's order. Its good draft slips to Thursday. */
const OAK: DraftBrief = {
  id: "oak-napkins",
  facts: [
    { name: "how many packs (10)", test: (t) => /\b10\b/.test(t) || hasWord(t, ["ten"]) },
    { name: "the day (Wednesday 11 November)", test: (t) => day("wednesday", "weds")(t) || /\b11(th)?\s*(of\s*)?nov|\b11\/11\b/i.test(t) },
    { name: "the time (before 12:00)", test: (t) => time("12", "twelve")(t) || /\b(before|by)\s*(noon|midday|lunch)/i.test(t) },
  ],
  wrong: [{ test: (t) => hasWord(t, ["thursday"]) && !hasWord(t, ["wednesday"]), tip: "Your prompt says Thursday, but the order is for Wednesday 11 November." }],
  reader: ["oak", "deli", "rita", "fenwick", "customer", "client"],
  readerName: "Rita Fenwick at Oak Street Deli",
  source: "the note",
  draft: (tone, v) => {
    const hi = tone === "formal" ? "Dear Ms Fenwick," : "Hi Rita,";
    const end = tone === "formal" ? "Kind regards,\nNorthfield Supplies" : "Thanks,\nNorthfield Supplies";
    const body =
      tone === "short"
        ? "Done: 10 packs of napkins added to your order, delivered Thursday 12 November before 12:00."
        : v % 2 === 0
          ? "Thanks for letting us know. I've added 10 packs of napkins to your order, and they'll arrive with the rest of it on Thursday 12 November, before 12:00."
          : "Happy to help. Your order now includes 10 extra packs of napkins, delivered on Thursday 12 November before 12:00.";
    return `${hi}\n\n${body}\n\n${end}`;
  },
  vague: (v) => (v % 2 === 0 ? "Hi,\n\nThanks for your message. I've made the change to your order.\n\nKind regards" : "Hello,\n\nYour order has been updated as requested.\n\nBest regards"),
  example: "Write a friendly reply to Rita Fenwick at Oak Street Deli. Say we've added 10 packs of napkins to her order for Wednesday 11 November, delivered before 12:00.",
  refs: ["Napkins for Wednesday"],
};

export const BRIEFS: Record<string, DraftBrief> = { [KENT.id]: KENT, [OAK.id]: OAK };

export interface PromptMarks {
  facts: boolean;
  reader: boolean;
  tone: boolean;
  /* The facts it is missing, named for the tip. */
  missing: string[];
  wrongTip?: string;
}

export function markPrompt(prompt: string, brief: DraftBrief): PromptMarks {
  const missing = brief.facts.filter((f) => !f.test(prompt)).map((f) => f.name);
  const wrongTip = brief.wrong?.find((w) => w.test(prompt))?.tip;
  return { facts: missing.length === 0 && !wrongTip, reader: hasWord(prompt, brief.reader), tone: toneOf(prompt) !== null, missing, wrongTip };
}

/* The tip after a weak prompt: what was missing, in plain words. */
function weakTip(m: PromptMarks, brief: DraftBrief): string {
  const gaps: string[] = [];
  if (m.wrongTip) gaps.push(m.wrongTip);
  else if (!m.facts) gaps.push(`Copilot didn't have the facts, so it wrote around them. Give it ${listOf(m.missing)}, from ${brief.source}.`);
  if (!m.reader) gaps.push(`Say who it's for (${brief.readerName}), so it writes to them.`);
  if (!m.tone) gaps.push('Say how it should sound: "friendly", "polite", "short" or "formal".');
  return gaps.join(" ");
}

const listOf = (xs: string[]) => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);

/* ── personal details in pasted text (AI-4) ─────────────────────────── */

export type PersonalKind = "name" | "phone" | "card" | "email" | "address" | "password" | "id";

export interface Personal {
  start: number;
  end: number;
  kind: PersonalKind;
  text: string;
}

export const PERSONAL_LABEL: Record<PersonalKind, [string, string]> = {
  name: ["a name", "names"],
  phone: ["a phone number", "phone numbers"],
  card: ["card digits", "card digits"],
  email: ["an email address", "email addresses"],
  address: ["an address", "addresses"],
  password: ["a password", "passwords"],
  id: ["an ID number", "ID numbers"],
};

/* First names common in the UK, for spotting "Leah Moss" in a list. */
const FIRST_NAMES = new Set(
  "aisha ali amy andrew anita ann anne arjun ayesha beth ben bilal brian chen chloe chris claire colin connor dave david deepak ellie ella emily emma fatima gary gemma george grace hannah harry hassan helen ian imran jack james jane jean jessica joe john jordan julie karen kate keith kevin laura leah liam linda lisa lucy luke margaret mark martin mary matthew megan michael mohammed muhammad nadia natalie neha neil nicola olivia omar oliver paul peter pooja priya rachel raj ravi rebecca richard rita robert ruby ryan sam sarah simon sophie stephen steve sunita susan thomas tom tony wei william yusuf zara zoe daniel amir kamal"
    .split(" "),
);
/* Words that make "Oak Street Deli" a business, not a person. */
const NOT_SURNAME = new Set("bakery cafe café deli supplies packaging team mills cups foods street road lane ltd limited".split(" "));

export function findPersonal(text: string, known: readonly string[] = []): Personal[] {
  const out: Personal[] = [];
  const add = (start: number, end: number, kind: PersonalKind) => {
    const raw = text.slice(start, end);
    const trimmed = raw.replace(/[\s,.;:]+$/, "");
    if (trimmed) out.push({ start, end: start + trimmed.length, kind, text: trimmed });
  };
  const each = (re: RegExp, kind: PersonalKind, group = 0) => {
    for (const m of text.matchAll(re)) {
      const at = (m.index ?? 0) + (group ? m[0].indexOf(m[group]) : 0);
      add(at, at + m[group].length, kind);
    }
  };
  each(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g, "email");
  each(/(?<![\d£])(?:\+44\s?\(0\)\s?|\+44\s?|0)\d(?:[\s-]?\d){8,9}(?!\d)/g, "phone");
  each(/\b(?:\d{4}[\s-]?){3}\d{4}\b/g, "card");
  each(/\b(?:card|ending|ends|last four|last 4)\b[^\d\n]{0,20}(\d{4})\b/gi, "card", 1);
  each(/\b\d{1,4}\s+(?:[A-Z][a-z]+\s){1,3}(?:Street|St|Road|Rd|Lane|Avenue|Ave|Close|Way|Drive|Court|Place|Crescent|Grove|Gardens|Terrace|Hill|Row)\b/g, "address");
  each(/\b[A-Z]{1,2}\d[A-Z\d]?\s\d[A-Z]{2}\b/g, "address");
  each(/\b(?:password|passcode|pin)\b\s*(?:is|:|=)\s*(\S+)/gi, "password", 1);
  each(/\b[A-CEGHJ-PR-TW-Z]{2}\s?\d{2}\s?\d{2}\s?\d{2}\s?[A-D]\b/g, "id");
  each(/\b(?:Mr|Mrs|Ms|Miss|Dr)\.?\s+[A-Z][a-z'-]+(?:\s+[A-Z][a-z'-]+)?/g, "name");
  for (const m of text.matchAll(/\b([A-Z][a-z'-]+)\s+([A-Z][a-z'-]+)\b/g)) {
    if (FIRST_NAMES.has(m[1].toLowerCase()) && !NOT_SURNAME.has(m[2].toLowerCase())) add(m.index ?? 0, (m.index ?? 0) + m[0].length, "name");
  }
  /* a name right before a phone number or email: "Joe Bennett, 07700..." */
  for (const m of text.matchAll(/\b([A-Z][a-z'-]+\s+[A-Z][a-z'-]+),?\s+(?=(?:\+44|0)\d|[\w.+-]+@)/g)) {
    if (!NOT_SURNAME.has(m[1].split(/\s+/)[1].toLowerCase())) add(m.index ?? 0, (m.index ?? 0) + m[1].length, "name");
  }
  for (const k of known) {
    for (const m of text.matchAll(new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi"))) add(m.index ?? 0, (m.index ?? 0) + m[0].length, "name");
  }
  /* one mark per stretch of text: the earliest, widest wins */
  out.sort((a, b) => a.start - b.start || b.end - a.end);
  const merged: Personal[] = [];
  for (const p of out) {
    const last = merged[merged.length - 1];
    if (last && p.start < last.end) {
      if (p.end > last.end) {
        last.end = p.end;
        last.text = text.slice(last.start, last.end);
      }
    } else merged.push({ ...p });
  }
  return merged;
}

/* "2 names, 2 phone numbers and card digits" */
export function describePersonal(found: Personal[]): string {
  const counts = new Map<PersonalKind, number>();
  for (const p of found) counts.set(p.kind, (counts.get(p.kind) ?? 0) + 1);
  return listOf([...counts].map(([k, n]) => (n === 1 || k === "card" ? PERSONAL_LABEL[k][0] : `${n} ${PERSONAL_LABEL[k][1]}`)));
}

/* ── this week's complaints (E12.2) ─────────────────────────────────── */

export const COMPLAINT_PEOPLE = ["Leah Moss", "Imran Ahmed", "Rita Fenwick"];

export const COMPLAINTS_TEXT = [
  "Customer complaints, week of 9 November",
  "",
  "Mon 9 Nov. Bright Cafe. Leah Moss, 07700 900214.",
  "Two sleeves of paper cups arrived split. Wants them replaced on Friday's van.",
  "",
  "Tue 10 Nov. Kent Bakery. Imran Ahmed, 0116 496 0738.",
  "2 sacks of flour were damp when opened. Wants them collected and replaced.",
  "",
  "Tue 10 Nov. Oak Street Deli. Rita Fenwick, 0116 496 0583.",
  "Napkins arrived at 14:00, after the lunch rush. Asks for morning deliveries.",
  "",
  "Wed 11 Nov. Bright Cafe. Leah Moss, 07700 900214.",
  "Card ending 4417 was charged twice for order 4429. Wants the second payment refunded.",
  "",
  "Thu 12 Nov. Oak Street Deli. Rita Fenwick, 0116 496 0583.",
  "Driver left 3 boxes outside in the rain. The paper bags inside got wet.",
].join("\n");

/* Each complaint, and the words that show it is still in the text. */
export const COMPLAINT_TOPICS = [
  { key: "cups", test: /\bcups?\b|sleeve|split/i, line: "Paper cups arrived split (Bright Cafe). They want replacements on Friday's van." },
  { key: "flour", test: /flour|damp/i, line: "2 sacks of flour were damp (Kent Bakery). They want them collected and replaced." },
  { key: "napkins", test: /napkin|lunch rush|14:00/i, line: "Napkins arrived after the lunch rush (Oak Street Deli). They'd like morning deliveries." },
  { key: "charged", test: /charg|twice|refund|payment/i, line: "A card payment was taken twice for order 4429 (Bright Cafe). They want the second one refunded." },
  { key: "rain", test: /\brain\b|outside|got wet/i, line: "The driver left 3 boxes outside in the rain (Oak Street Deli), and the paper bags got wet." },
] as const;

export const topicsIn = (text: string) => COMPLAINT_TOPICS.filter((t) => t.test.test(text)).map((t) => t.key);

/* Every personal detail from the complaint list still in a piece of text. */
export function complaintPersonalLeft(text: string): string[] {
  const left = new Set<string>();
  for (const full of COMPLAINT_PEOPLE) for (const part of full.split(" ")) if (new RegExp(`\\b${part}\\b`, "i").test(text)) left.add(full);
  const bare = (s: string) => s.replace(/[\s-]/g, "");
  const phones = ["07700 900214", "0116 496 0738", "0116 496 0583"];
  for (const phone of phones) if (bare(text).includes(bare(phone))) left.add(phone);
  if (/\b4417\b/.test(text)) left.add("card ending 4417");
  /* anything else personal the learner typed in, once each */
  for (const p of findPersonal(text)) if ((p.kind === "phone" || p.kind === "email" || p.kind === "address") && !phones.some((x) => bare(x) === bare(p.text))) left.add(p.text);
  return [...left];
}

function summarise(text: string): { reply: string; kind: string } {
  const found = COMPLAINT_TOPICS.filter((t) => t.test.test(text));
  if (found.length >= 2) {
    const lines = found.map((t) => `• ${t.line}`);
    const damaged = found.filter((t) => t.key === "cups" || t.key === "flour" || t.key === "rain").length;
    const theme = damaged >= 2 ? "Most of them are about goods arriving damaged or late, so it may be worth a word with the drivers." : "Each needs a reply from someone this week.";
    return { kind: "summary", reply: `Here's a summary of the ${found.length} complaints:\n\n${lines.join("\n")}\n\n${theme}` };
  }
  const sentences = text
    .split(/\n+|(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.split(/\s+/).length >= 4 && !/^(summar|please|can you|could you)/i.test(s));
  if (sentences.length === 0) return { kind: "nothing", reply: "There isn't enough here for me to summarise. Paste in the text you'd like summarised, under your request." };
  return { kind: "summary", reply: `Here are the main points:\n\n${sentences.slice(0, 4).map((s) => `• ${s}`).join("\n")}` };
}

/* ── formulas, in plain words (AI-3) ────────────────────────────────── */

const FORMULA = /=\s*[A-Za-z]+\s*\([^)]*\)?|=\s*[A-Za-z]\d+\s*[-+*/]\s*[A-Za-z0-9$]+/;

/* "F:F" or "D2:D41", described with the column's heading when there is one. */
function rangeWords(r: string, grid?: Grid): string {
  const whole = /^([A-Z]):([A-Z])$/i.exec(r);
  const head = (c: string) => {
    const h = grid?.[0]?.[c.toUpperCase().charCodeAt(0) - 65]?.trim();
    return h ? `, the ${h} column` : "";
  };
  if (whole && whole[1].toUpperCase() === whole[2].toUpperCase()) return `the whole of column ${whole[1].toUpperCase()}${head(whole[1])}, every row`;
  const part = /^([A-Z])(\d+):([A-Z])(\d+)$/i.exec(r);
  if (part && part[1].toUpperCase() === part[3].toUpperCase()) return `column ${part[1].toUpperCase()} from row ${part[2]} to row ${part[4]}${head(part[1])}`;
  return `the cells ${r.toUpperCase()}`;
}

export function explainFormula(formula: string, grid?: Grid): string | null {
  const f = formula.trim().replace(/^=?\s*/, "=").replace(/[“”]/g, '"');
  const countif = /^=\s*COUNTIF\s*\(\s*([A-Z]+\d*:[A-Z]+\d*)\s*,\s*"?([^")]*)"?\s*\)/i.exec(f);
  if (countif) {
    const [, r, what] = countif;
    const cmp = /^([<>]=?|<>)/.exec(what);
    const looks = cmp ? `cells holding a number ${cmp[1] === ">" ? "bigger than" : cmp[1] === "<" ? "smaller than" : cmp[1] === "<>" ? "other than" : cmp[1] === ">=" ? "at least" : "at most"} ${what.slice(cmp[1].length)}` : `cells that say exactly "${what}"`;
    const inside = /^([A-Z]):\1$/i.test(r) ? ` If you put it inside column ${r[0].toUpperCase()} itself, it would try to count its own cell, and Excel shows an error. So type it in an empty cell outside that column.` : "";
    return [
      `${f.toUpperCase().replace(/"[^"]*"/, `"${what}"`)} counts how many ${looks} in ${rangeWords(r, grid)}.`,
      "",
      `• COUNTIF means "count the cells that match".`,
      `• ${r.toUpperCase()} is where to look: ${rangeWords(r, grid)}.`,
      `• "${what}" is what to look for. Capital letters don't matter, but the spelling does, and a cell that says something else (like "On time") isn't counted.`,
      "",
      `So the answer is a number: how many rows say "${what}".${inside}`,
    ].join("\n");
  }
  const sumif = /^=\s*SUMIF\s*\(\s*([A-Z]+\d*:[A-Z]+\d*)\s*,\s*"?([^",)]*)"?\s*,\s*([A-Z]+\d*:[A-Z]+\d*)\s*\)/i.exec(f);
  if (sumif) {
    const [, r, what, sum] = sumif;
    return [
      `${f.toUpperCase().replace(/"[^"]*"/, `"${what}"`)} adds up the numbers in ${rangeWords(sum, grid)}, but only on the rows where ${rangeWords(r, grid)} says "${what}".`,
      "",
      `• SUMIF means "add up the ones that match".`,
      `• ${r.toUpperCase()} is where to check: it looks for "${what}" there.`,
      `• ${sum.toUpperCase()} is what to add up, from the same rows.`,
      "",
      `Change "${what}" to another name to get that customer's total instead.`,
    ].join("\n");
  }
  const simple = /^=\s*(SUM|AVERAGE|COUNT|MIN|MAX)\s*\(\s*([A-Z]+\d*:[A-Z]+\d*)\s*\)/i.exec(f);
  if (simple) {
    const verb = { SUM: "adds up", AVERAGE: "works out the average (the total, shared out evenly) of", COUNT: "counts how many numbers there are in", MIN: "finds the smallest number in", MAX: "finds the biggest number in" }[simple[1].toUpperCase() as "SUM"];
    return `${f.toUpperCase()} ${verb} ${simple[1].toUpperCase() === "SUM" ? "every number in " : ""}${rangeWords(simple[2], grid)}. Words and empty cells are skipped.`;
  }
  const maths = /^=\s*([A-Z]\d+)\s*([-+*/])\s*([A-Z]\d+|\d+(\.\d+)?)\s*$/i.exec(f);
  if (maths) {
    const op = { "+": "adds", "-": "takes away", "*": "multiplies", "/": "divides" }[maths[2] as "+"];
    return `${f.toUpperCase()} ${op} ${maths[2] === "-" ? `${maths[3].toUpperCase()} from ${maths[1].toUpperCase()}` : `${maths[1].toUpperCase()} and ${maths[3].toUpperCase()}`}${maths[2] === "/" ? ` (${maths[1].toUpperCase()} divided by ${maths[3].toUpperCase()})` : ""}, and shows the answer in this cell. If either cell changes, the answer changes too.`;
  }
  return null;
}

/* ── counting: where AI slips ───────────────────────────────────────── */

/* Copilot "counts" by reading the sheet loosely: any row with the word in
 * any column. A note that says "late" on an on-time row gets counted too,
 * which is how a confident answer ends up wrong. */
function looseCount(grid: Grid, word: string): number {
  const records = grid.slice(1).filter((row) => row.filter((v) => v.trim()).length >= 3);
  return records.filter((row) => row.some((v) => new RegExp(`\\b${word}\\b`, "i").test(v))).length;
}

/* ── the answer ─────────────────────────────────────────────────────── */

export interface AskContext {
  host: CopilotHost;
  /* For counting the earlier weak prompts. */
  state?: Pick<OfficeState, "copilot">;
  /* The draft scenario: the job's, or a lesson's. */
  brief?: string;
  replyTo?: Email;
  grid?: Grid;
  fileName?: string;
  cell?: { name: string; raw: string };
  /* Regenerate: a different wording of the same answer. */
  variant?: number;
  /* Earlier weak prompts for this brief, when there is no office record. */
  weakSoFar?: number;
}

export type Answer = Omit<CopilotTurn, "id">;

const DRAFT_WORDS = ["draft", "write", "reply", "respond", "response", "email", "confirm", "message", "letter", "answer", "tell"];
const SUMMARY = /summar|sum (it|this|them) up|key points|main points|overview|themes|in short/i;

export function respond(prompt: string, ctx: AskContext): Answer {
  const text = prompt.trim();
  const base = { host: ctx.host, prompt };
  if (!text) return { ...base, kind: "nothing", reply: "" };
  const variant = ctx.variant ?? 0;

  /* a formula, or "explain the formula" with one selected */
  const typed = FORMULA.exec(text)?.[0];
  const selected = ctx.cell?.raw.trim().startsWith("=") ? ctx.cell.raw.trim() : undefined;
  const asksFormula = /formula|countif|sumif|function/i.test(text);
  if (typed || (asksFormula && selected)) {
    const formula = typed ?? selected ?? "";
    const said = explainFormula(formula, ctx.grid);
    const refs = ctx.fileName ? [ctx.fileName] : [];
    if (said) return { ...base, kind: "explain", reply: said, refs };
    return { ...base, kind: "help", reply: `I can see ${formula.trim()}, but I'm not sure what it does. Check it's typed right, starting with = and with its brackets closed.`, refs };
  }
  if (asksFormula && /explain|what does|what is|mean|how does/i.test(text)) {
    return { ...base, kind: "help", reply: "Which formula would you like explained? Paste it in, starting with =, or click the cell that holds it and ask again." };
  }

  /* a count: Copilot reads loosely and gets it wrong */
  if (/how many|count|number of|total number/i.test(text) && ctx.grid && !SUMMARY.test(text)) {
    const word = /\blate\b/i.test(text) ? "late" : null;
    if (word) {
      const n = looseCount(ctx.grid, word);
      return {
        ...base,
        kind: "count",
        reply: `I count ${n} deliveries marked late in this sheet.`,
        refs: ctx.fileName ? [ctx.fileName] : [],
        tip: "Copilot's count is a guess from reading the sheet, and it's wrong here: one row only mentions \"late\" in its notes. Work it out yourself with the formula. That's the number to send.",
      };
    }
  }

  /* pasted text to summarise */
  const lines = text.split("\n").filter((l) => l.trim()).length;
  if (SUMMARY.test(text) || (text.length > 260 && lines >= 4)) {
    const s = summarise(text);
    return { ...base, kind: s.kind, reply: s.reply };
  }

  /* a draft */
  const briefId = ctx.brief ?? ctx.state?.copilot?.brief;
  const brief = briefId ? BRIEFS[briefId] : undefined;
  if (brief && (hasWord(text, DRAFT_WORDS) || ctx.host === "outlook")) {
    const m = markPrompt(text, brief);
    const marks = { facts: m.facts, reader: m.reader, tone: m.tone };
    if (m.facts && m.reader && m.tone) {
      return { ...base, kind: "draft", reply: brief.draft(toneOf(text), variant), marks, refs: brief.refs, tip: "That prompt has all three: the facts, who it's for and the tone. Now read the draft line by line against " + brief.source + " before you use it." };
    }
    const weakSoFar = ctx.weakSoFar ?? (ctx.state?.copilot?.turns ?? []).filter((t) => t.kind === "vague").length;
    return { ...base, kind: "vague", reply: brief.vague(variant + weakSoFar), marks, refs: brief.refs, tip: weakTip(m, brief), example: weakSoFar >= 1 ? brief.example : undefined };
  }
  if (hasWord(text, DRAFT_WORDS)) {
    return { ...base, kind: "vague", reply: "Hi,\n\nThank you for your email. I'm happy to help with this.\n\nKind regards", marks: { facts: false, reader: false, tone: toneOf(text) !== null }, tip: "Copilot only knows what you tell it. Give it the facts, who it's for, and the tone." };
  }
  return { ...base, kind: "help", reply: "I can draft an email, explain a formula, or summarise some text you paste in. What would you like to do?" };
}

/* What a whole column holds that matches, the way the real COUNTIF reads it. */
export const countIf = (grid: Grid, col: number, value: string) => grid.slice(1).filter((r) => (r[col] ?? "").trim().toLowerCase() === value.toLowerCase()).length;

/* A formula cell in a sheet that COUNTIFs and works out to `n`. */
export function countifCell(grid: Grid, n: number): { cell: string; raw: string } | null {
  for (let r = 0; r < grid.length; r++)
    for (let c = 0; c < (grid[r]?.length ?? 0); c++) {
      const raw = (grid[r][c] ?? "").trim();
      if (/^=.*COUNTIF/i.test(raw) && evaluate(grid, r, c) === n) return { cell: `${colLetter(c)}${r + 1}`, raw };
    }
  return null;
}
