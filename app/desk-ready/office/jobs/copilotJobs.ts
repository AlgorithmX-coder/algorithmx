import { BRIEFS, COMPLAINT_PEOPLE, COMPLAINTS_TEXT, complaintPersonalLeft, countifCell, markPrompt, topicsIn } from "../copilot";
import { inbound, officeFolders, PEOPLE, SIGNATURE } from "../northfield";
import { tabsOf, type Check, type Email, type Grid, type Job, type OfficeFile, type OfficeState, type Person } from "../types";

/* The three Module 12 jobs (criteria AI-1 to AI-4), with Copilot on the
 * taskbar, in an Outlook reply and down the side of Excel. Copilot here is
 * scripted (../copilot): its drafts carry planted mistakes, and it never
 * refuses, so the learner does the checking and the keeping-out.
 *
 * - E12.1 Let Copilot draft it, then check it: Kent Bakery wants Thursday's
 *   flour change confirmed. The prompt must give the facts, the reader and
 *   the tone; Copilot's draft says Friday and offers a 10% discount nobody
 *   agreed, and both must be fixed before it goes.
 * - E12.2 What not to paste: Daniel wants a summary of the week's
 *   complaints. The list holds names, phone numbers and a customer's card
 *   digits, and none of them may go into Copilot.
 * - E12.3 Explain this formula: Priya asks what =COUNTIF(F:F,"Late") does.
 *   Copilot explains it; the learner writes it in November's log and gets
 *   3 (Copilot's own count, if asked, is 4). */

const MODULE = { moduleId: "m12", moduleLabel: "Module 12: AI as your assistant" } as const;
const DELIVERIES_DIR = ["Operations Team", "Documents", "Deliveries", "2026"];
const sentTo = (s: OfficeState, p: Person): Email[] => s.emails.filter((e) => e.folder === "sent" && [...e.to, ...e.cc].some((x) => x.address === p.address));
const turnsOf = (s: OfficeState) => s.copilot?.turns ?? [];
const outcome = (out: Check[]) => (c: Omit<Check, "ok" | "fix">, ok: boolean, fix?: string) => out.push({ ...c, ok, fix: ok ? undefined : fix });

const COPILOT_ON = inbound({
  id: "m-copilot-on",
  from: PEOPLE.daniel,
  subject: "Copilot is switched on",
  time: "Mon 08:30",
  unread: false,
  body: `Morning all,\n\nCopilot is now switched on for everyone. It's on the taskbar, and in Outlook and Excel.\n\nUse it to save time on drafts and summaries. But you're responsible for what you send, so read every line before it goes. And never paste in customer details, passwords or anything about pay.\n\nThanks,\nDaniel\n\n${SIGNATURE.daniel}`,
});

/* ── E12.1 Let Copilot draft it, then check it ──────────────────────── */

function seedDraft(): OfficeState {
  return {
    version: 0,
    files: officeFolders(),
    emails: [
      inbound({
        id: "m-kent-confirm",
        from: PEOPLE.imran,
        subject: "Thursday's flour",
        time: "09:12",
        body: "Hi,\n\nCan you confirm Thursday's flour change?\n\nThanks,\nImran Ahmed\nKent Bakery",
      }),
      inbound({
        id: "m-sarah-flour",
        from: PEOPLE.sarah,
        subject: "Kent Bakery: flour change booked",
        time: "08:47",
        body: `Hi,\n\nMr Ahmed rang yesterday. I've changed Kent Bakery's flour for this week from 20 sacks to 30. It's still Thursday 12 November, on the first van, so it gets there before 10:00. Same price per sack as always.\n\nHe'll probably email asking you to confirm. Copilot can draft the reply if you like, but read it before it goes.\n\nThanks,\nSarah\n\n${SIGNATURE.sarah}`,
      }),
      COPILOT_ON,
    ],
    copilot: { turns: [], brief: "kent-flour" },
  };
}

const FRIDAY = /\bfri(day)?\b|\b13(th)?\s*(of\s*)?nov|\b13\/11\b/i;
const THURSDAY = /\bthu(rs(day)?)?\b|\b12(th)?\s*(of\s*)?nov|\b12\/11\b/i;
const DISCOUNT = /\d+\s*(%|per\s*cent|percent)|\bdiscount|\boff (this|your|the) order/i;

function checkDraft(s: OfficeState): Check[] {
  const out: Check[] = [];
  const add = outcome(out);
  const turns = turnsOf(s).filter((t) => t.kind === "draft" || t.kind === "vague");
  const good = turns.find((t) => t.kind === "draft");
  const lastTry = turns.at(-1);
  const missing = lastTry ? markPrompt(lastTry.prompt, BRIEFS["kent-flour"]) : null;
  const gaps = missing ? [!missing.facts && "the facts (30 sacks, Thursday 12 November, before 10:00)", !missing.reader && "who it's for (Imran at Kent Bakery)", !missing.tone && 'the tone ("friendly", "polite")'].filter(Boolean).join(", ") : "";
  add(
    { id: "prompt", code: "AI-1", group: "Asking Copilot", label: "You asked Copilot for the draft with the facts, who it's for and the tone" },
    !!good,
    lastTry ? `Your prompt was missing ${gaps}. Ask again with all three.` : "Open Imran's email, press Reply, then Draft with Copilot. Tell it the facts, who it's for and the tone.",
  );
  const mail = sentTo(s, PEOPLE.imran).at(-1);
  add({ id: "sent", code: "OL-5", group: "The reply", label: "You replied to Imran at Kent Bakery" }, !!mail, "Open Imran's email and press Reply, so it goes back to him in the same conversation.");
  const body = mail?.body ?? "";
  add(
    { id: "day", code: "AI-2", group: "Checking the draft", label: "The day is right: Thursday 12 November, not Copilot's Friday" },
    !!mail && THURSDAY.test(body) && !FRIDAY.test(body),
    !mail ? "Send the reply first, with the day checked against Sarah's email." : FRIDAY.test(body) ? (/\b13/.test(body) ? "Your reply still has Copilot's date, the 13th (that's Friday). Sarah's email says Thursday 12 November: change it." : "Your reply still says Friday. Sarah's email says Thursday 12 November: change it.") : "Say the day in your reply: Thursday 12 November.",
  );
  add(
    { id: "discount", code: "AI-2", group: "Checking the draft", label: "Copilot's made-up 10% discount is gone" },
    !!mail && !DISCOUNT.test(body),
    !mail ? "Send the reply first, with anything Sarah didn't say taken out." : "Your reply still offers a discount. Nobody agreed one: Sarah says it's the same price per sack. Delete that sentence.",
  );
  add(
    { id: "facts", code: "AI-2", group: "Checking the draft", label: "It still gives the right facts: 30 sacks, before 10:00" },
    !!mail && /\b30\b|thirty/i.test(body) && /\b10\s*([:.]\s*00|am|a\.m|o'?clock)|\b(before|by)\s*10\b/i.test(body),
    !mail ? "Send the reply first." : "Check the reply still says 30 sacks and before 10:00, as in Sarah's email.",
  );
  return out;
}

export const copilotDraft: Job = {
  id: "m12j1",
  slug: "copilot-draft",
  ...MODULE,
  title: "Let Copilot draft it, then check it",
  summary: "Kent Bakery want their flour change confirmed. Get Copilot to draft the reply, then check every line before it goes.",
  clock: "09:14",
  deadline: "Imran wants an answer this morning",
  doneLine: "Imran has the right day, the right amount and no discount nobody agreed. Copilot wrote it; you made sure it was right.",
  brief: "Kent Bakery have emailed. Read Imran's email and Sarah's, then reply using Draft with Copilot. You're responsible for what goes. When you think it's done, press Check my work.",
  hints: [
    "Sarah's email has the facts: 30 sacks, Thursday 12 November, before 10:00, same price.",
    "Open Imran's email, press Reply, then Draft with Copilot. Tell it the facts, who it's for (Imran at Kent Bakery) and the tone (friendly, or polite).",
    "Press Keep it, then read the draft line by line against Sarah's email. Fix anything that doesn't match, and take out anything she didn't say.",
    "Copilot slipped twice: the day, and an offer nobody made. Fix both, then Send.",
  ],
  apps: ["copilot"],
  seed: seedDraft,
  check: checkDraft,
  habits: [
    { label: "Check your own work", checks: ["day", "discount", "facts"] },
    { label: "Close the loop", checks: ["sent"] },
  ],
};

/* ── E12.2 What not to paste ────────────────────────────────────────── */

function seedPaste(): OfficeState {
  return {
    version: 0,
    files: officeFolders(),
    emails: [
      inbound({
        id: "m-daniel-complaints",
        from: PEOPLE.daniel,
        subject: "This week's complaints",
        time: "09:02",
        body: `Hi,\n\nCan you get Copilot to summarise this week's customer complaints? I want the main themes for Monday's team meeting, in a few lines. Sarah's list is below.\n\nReply to me with the summary.\n\nThanks,\nDaniel\n\n${SIGNATURE.daniel}\n\n----------\n\n${COMPLAINTS_TEXT}`,
      }),
      COPILOT_ON,
    ],
    copilot: { turns: [], clip: { label: "the list from Daniel's email", text: COMPLAINTS_TEXT, people: COMPLAINT_PEOPLE } },
  };
}

function checkPaste(s: OfficeState): Check[] {
  const out: Check[] = [];
  const add = outcome(out);
  const turns = turnsOf(s);
  const leaked = [...new Set(turns.flatMap((t) => complaintPersonalLeft(t.prompt)))];
  const best = turns.map((t) => topicsIn(t.prompt).length).reduce((a, b) => Math.max(a, b), 0);
  const summary = turns.find((t) => t.kind === "summary" && topicsIn(t.prompt).length >= 4);
  add(
    { id: "private", code: "AI-4", group: "What went into Copilot", label: "No names, phone numbers or card digits went into Copilot" },
    turns.length > 0 && leaked.length === 0,
    turns.length === 0 ? "Nothing has gone into Copilot yet." : `These went into Copilot: ${leaked.join(", ")}. Once it's sent, it's sent. Press Start the job again, and take them out (or swap a name for "Customer A") before you send.`,
  );
  add(
    { id: "summary", code: "AI-4", group: "What went into Copilot", label: "Copilot summarised the complaints, and the summary still makes sense" },
    !!summary,
    turns.length === 0 ? "Open Copilot on the taskbar, paste the list in, take out the personal details, and ask for a summary." : best < 4 ? `What you sent had ${best} of the 5 complaints, so the summary misses some. Take out the personal details, but keep what each complaint is about.` : 'Ask Copilot to summarise: start with "Summarise these complaints:" and the list under it.',
  );
  const mail = sentTo(s, PEOPLE.daniel).at(-1);
  add(
    { id: "daniel", code: "OL-5", group: "Telling Daniel", label: "You sent Daniel the summary" },
    !!mail && topicsIn(mail.body).length >= 3,
    mail ? "Your email to Daniel doesn't give the summary. Copy Copilot's summary (Copy under its answer), and paste it into your reply." : "Reply to Daniel's email with the summary.",
  );
  return out;
}

export const whatNotToPaste: Job = {
  id: "m12j2",
  slug: "what-not-to-paste",
  ...MODULE,
  title: "What not to paste",
  summary: "Daniel wants Copilot to summarise the week's complaints. The list is full of customers' details, and none of them may go in.",
  clock: "09:05",
  deadline: "Daniel needs it for Monday's meeting",
  doneLine: "Daniel has his summary, and no customer's name, number or card went anywhere it shouldn't.",
  brief: "Daniel has asked for a summary of this week's complaints. Read his email, then use Copilot on the taskbar. Look closely at what you're about to send. When you think it's done, press Check my work.",
  hints: [
    "Open Copilot on the taskbar. Type \"Summarise these complaints:\" and paste the list under it (the Paste button does what Ctrl+V would).",
    "Before you send, take out every name, phone number and the card digits. Swap a name for Customer A, Customer B, so it still makes sense.",
    "Copilot won't stop you sending personal details. The red highlights show what's left: send only when there are none.",
    "Copy Copilot's summary, then reply to Daniel and paste it in.",
  ],
  apps: ["copilot"],
  seed: seedPaste,
  check: checkPaste,
  habits: [
    { label: "Check your own work", checks: ["private"] },
    { label: "Close the loop", checks: ["summary", "daniel"] },
  ],
};

/* ── E12.3 Explain this formula ─────────────────────────────────────── */

const LOG_ID = "seed-log-nov";
export const NOVEMBER_ROWS: string[][] = [
  ["02/11/2026", "DN-41102", "Harlow Packaging", "08:30", "08:40", "On time", ""],
  ["02/11/2026", "DN-41105", "Kent Flour Mills", "10:00", "09:55", "On time", ""],
  ["03/11/2026", "DN-41110", "Brightwater Cups", "09:00", "11:20", "Late", "Van broke down on the M1"],
  ["04/11/2026", "DN-41121", "Harlow Packaging", "09:00", "08:50", "On time", ""],
  ["04/11/2026", "DN-41126", "Kent Flour Mills", "09:30", "09:25", "On time", "Driver rang to say he'd be late"],
  ["05/11/2026", "DN-41130", "Brightwater Cups", "10:00", "09:58", "On time", ""],
  ["06/11/2026", "DN-41139", "Harlow Packaging", "10:00", "13:40", "Late", "2 pallets short as well"],
  ["06/11/2026", "DN-41142", "Fenwick Foods", "09:00", "08:45", "On time", ""],
  ["09/11/2026", "DN-41150", "Brightwater Cups", "08:30", "08:25", "On time", ""],
  ["10/11/2026", "DN-41164", "Kent Flour Mills", "09:30", "11:50", "Late", "Bakery told"],
  ["10/11/2026", "DN-41167", "Fenwick Foods", "09:00", "08:55", "On time", ""],
  ["11/11/2026", "DN-41170", "Harlow Packaging", "08:30", "08:20", "On time", ""],
];
/* The line Priya asks for, under the log: C15 says what it is, D15 is for the count. */
export const COUNT_ROW = 14;

export function novemberLog(): Grid {
  const g: Grid = [["Date", "Delivery note", "Supplier", "Booked", "Arrived", "Status", "Notes"], ...NOVEMBER_ROWS];
  while (g.length < 20) g.push(Array(7).fill(""));
  g[COUNT_ROW] = ["", "", "Late in November", "", "", "", ""];
  return g.map((r) => [...r, "", ""]);
}

function seedFormula(): OfficeState {
  const files: OfficeFile[] = [...officeFolders(), { id: LOG_ID, path: DELIVERIES_DIR, name: "2026-11 Delivery log.xlsx", kind: "xlsx", modified: "Today 08:05", by: "Sarah Patel", sheet: novemberLog(), widths: [100, 110, 150, 72, 72, 82, 230, 70, 70], seeded: true }];
  return {
    version: 0,
    files,
    emails: [
      inbound({
        id: "m-priya-countif",
        from: PEOPLE.priya,
        subject: "That COUNTIF formula",
        time: "13:52",
        body: 'Hi,\n\nDaniel says we can count late deliveries with =COUNTIF(F:F,"Late"). What does it actually do? Can you use it for November?\n\nThe log is 2026-11 Delivery log, in Operations Team > Documents > Deliveries > 2026. There\'s a line for it at the bottom, Late in November. Then let me know the number.\n\nThanks,\nPriya\n\nPriya Shah\nAccounts | Northfield Supplies\n01632 960 405',
        links: [{ name: "2026-11 Delivery log", path: DELIVERIES_DIR, fileName: "2026-11 Delivery log.xlsx" }],
      }),
      COPILOT_ON,
    ],
    copilot: { turns: [] },
  };
}

function checkFormula(s: OfficeState): Check[] {
  const out: Check[] = [];
  const add = outcome(out);
  const asked = turnsOf(s).some((t) => t.kind === "explain" && /COUNTIF/i.test(`${t.prompt} ${t.reply}`));
  add({ id: "asked", code: "AI-3", group: "Asking Copilot", label: "You asked Copilot what the formula does" }, asked, 'Open the log, press Copilot on Excel\'s ribbon, and ask: What does =COUNTIF(F:F,"Late") do?');
  const file = s.files.find((f) => f.id === LOG_ID);
  const g = file ? tabsOf(file)[0]?.grid : undefined;
  const right = g ? countifCell(g, 3) : null;
  const typed = g?.some((row) => row.some((v) => v.trim() === "3"));
  const other = g?.flatMap((row) => row.filter((v) => /^=.*COUNTIF/i.test(v.trim())))[0];
  add(
    { id: "formula", code: "AI-3", group: "The count", label: "You wrote the COUNTIF in the log yourself, and it gives 3" },
    !!right,
    other ? `Your formula ${other.trim()} doesn't give 3. Check it says F:F and "Late", and that it isn't in column F itself.` : typed ? 'That\'s the right number, but typed in. Use the formula: type =COUNTIF(F:F,"Late") in D15, so it updates as the log grows.' : 'In the log, click D15 (beside Late in November) and type =COUNTIF(F:F,"Late"), then press Enter.',
  );
  add({ id: "saved", code: "WIN-4", group: "The count", label: "Saved in the log, where it lives" }, !!file && file.by === "You", "Press Save in Excel, so Priya can see the count in the log.");
  const mail = sentTo(s, PEOPLE.priya).at(-1);
  add(
    { id: "priya", code: "XL-9", group: "Telling Priya", label: "You told Priya the number: 3 late in November" },
    !!mail && /\b(3|three)\b/i.test(mail.body) && !/\b(4|four)\b/i.test(mail.body),
    !mail ? "Reply to Priya with the number." : /\b(4|four)\b/i.test(mail.body) ? "Your email says 4. That's Copilot's count, and it's wrong: the formula gives 3." : "Give Priya the number in your email: 3 deliveries were late in November.",
  );
  return out;
}

export const explainFormula: Job = {
  id: "m12j3",
  slug: "explain-formula",
  ...MODULE,
  title: "Explain this formula",
  summary: "Priya has a formula she doesn't understand. Get Copilot to explain it, then use it yourself on November's log.",
  clock: "13:55",
  deadline: "Priya needs the number by 15:00",
  doneLine: "Priya knows what the formula does, and the count in the log is one you worked out yourself: 3.",
  brief: "Priya has asked about a formula. Read her email, ask Copilot to explain it, then use it on the log yourself. When you think it's done, press Check my work.",
  hints: [
    "Open the link in Priya's email, or find 2026-11 Delivery log.xlsx in Operations Team > Documents > Deliveries > 2026.",
    'In Excel, press Copilot on the ribbon and ask: What does =COUNTIF(F:F,"Late") do?',
    'Click D15, beside Late in November, type =COUNTIF(F:F,"Late") and press Enter. Then Save.',
    "Reply to Priya with the number the formula gives. If you asked Copilot to count, check its number against yours.",
  ],
  apps: ["copilot"],
  seed: seedFormula,
  check: checkFormula,
  habits: [
    { label: "Check your own work", checks: ["formula"] },
    { label: "One version, in one place", checks: ["saved"] },
    { label: "Close the loop", checks: ["priya"] },
  ],
};
