import { officeFolders, PEOPLE } from "../northfield";
import { pathText, samePath, type Check, type Job, type OfficeFile, type OfficeState, type WordBlock, type WordDoc } from "../types";
import { emptyRequired, fieldValue, para, sameDay } from "../word";
import { FOOTER, HEADER, withLetterhead } from "./letterhead";

/* E8.2 Book your holiday (criteria WD-5, ADM-3). Emma in HR asks everyone
 * who wants Christmas week off to fill in the holiday form and put it in
 * HR > Forms > Completed by Friday. The form is a Word template with
 * fields to click and type in (a date picker, drop-down lists, a tick
 * box), as HR forms are. The learner wants Monday 21 to Wednesday 23
 * December: 3 working days. Daniel approves holidays. */

const BLANK = ["HR", "Forms", "Blank"] as const;
const COMPLETED = ["HR", "Forms", "Completed"] as const;
const TODAY = "2026-11-13";

const field = (key: string, label: string, kind: NonNullable<WordBlock["field"]>["kind"], required = true, options?: string[], text = ""): WordBlock => ({ id: `hf-${key}`, style: "normal", text, field: { key, label, kind, required, options } });

export const MANAGERS = ["Daniel Okafor", "Emma Clarke", "Priya Shah", "Sarah Patel"];

export function holidayFormDoc(filled?: Record<string, string>): WordDoc {
  const f = (key: string, label: string, kind: NonNullable<WordBlock["field"]>["kind"], required = true, options?: string[]) => field(key, label, kind, required, options, filled?.[key] ?? "");
  return {
    header: HEADER,
    footer: FOOTER,
    blocks: [
      para("Holiday request", "title"),
      para("Fill in every box marked with a star (*). Ask at least two weeks before your first day off. Your manager approves it, then HR books it in."),
      para("Your details", "h2"),
      f("name", "Your name", "text"),
      f("job", "Job title", "text", false),
      f("team", "Team", "choice", true, ["Office", "Warehouse", "Accounts", "HR"]),
      para("The holiday", "h2"),
      f("start", "First day off", "date"),
      f("end", "Last day off", "date"),
      f("days", "Working days off", "text"),
      f("note", "Anything HR should know", "text", false),
      para("Approval", "h2"),
      f("approver", "Approved by (your manager)", "choice", true, MANAGERS),
      f("signed", "Signed (type your name)", "text"),
      f("dated", "Date of request", "date"),
      f("agreed", "I have checked these dates with my manager", "check"),
    ],
  };
}

function seed(): OfficeState {
  const files: OfficeFile[] = withLetterhead(officeFolders());
  const dir = (path: readonly string[], name: string) => files.push({ id: `seed-dir-${[...path, name].join("/")}`, path, name, kind: "folder", modified: "02/11/2026", by: "Emma Clarke", seeded: true });
  dir(["HR", "Forms"], "Blank");
  dir(["HR", "Forms"], "Completed");
  files.push({ id: "seed-holiday-form", path: [...BLANK], name: "Holiday request.dotx", kind: "dotx", modified: "05/01/2026", by: "Emma Clarke", doc: holidayFormDoc(), seeded: true });
  files.push({ id: "seed-expenses-form", path: [...BLANK], name: "Expense claim.dotx", kind: "dotx", modified: "05/01/2026", by: "Emma Clarke", doc: { header: HEADER, footer: FOOTER, blocks: [para("Expense claim", "title"), para("Use this form to claim back money you spent for work. Attach every receipt.")] }, seeded: true });
  files.push({
    id: "seed-holiday-sarah",
    path: [...COMPLETED],
    name: "2026-11-02 Holiday request Sarah Patel.docx",
    kind: "docx",
    modified: "02/11/2026",
    by: "Sarah Patel",
    doc: holidayFormDoc({ name: "Sarah Patel", job: "Warehouse Supervisor", team: "Warehouse", start: "28/12/2026", end: "31/12/2026", days: "4", approver: "Daniel Okafor", signed: "Sarah Patel", dated: "02/11/2026", agreed: "yes" }),
    seeded: true,
  });
  return {
    version: 0,
    files,
    emails: [
      {
        id: "mail-emma-holiday",
        folder: "inbox",
        from: PEOPLE.emma,
        to: [{ name: "Office team", address: "office@northfieldsupplies.example" }],
        cc: [],
        subject: "Christmas holidays: forms by Friday",
        time: "Mon 09:30",
        unread: true,
        body: "Hi all,\n\nIf you want Christmas week off, fill in the holiday form and put it in Forms > Completed by Friday.\n\nThe blank form is on the HR site, in Forms > Blank. Daniel approves holidays for the office team. Save yours as the date, then Holiday request and your name, like 2026-11-02 Holiday request Sarah Patel.docx.\n\nThanks,\nEmma\n\nEmma Clarke\nHR | Northfield Supplies\n01632 960 405",
        attachments: [],
        links: [],
      },
      {
        id: "mail-daniel-friday",
        folder: "inbox",
        from: PEOPLE.daniel,
        to: [{ name: "You", address: "you@northfieldsupplies.example" }],
        cc: [],
        subject: "Christmas week",
        time: "08:52",
        unread: true,
        body: "Morning,\n\nHappy for you to have the 21st to the 23rd of December off. Just get the form in to Emma today so HR can book it.\n\nDaniel",
        attachments: [],
        links: [],
      },
    ],
  };
}

/* ── marking ─────────────────────────────────────────────────────────── */

const isForm = (f: OfficeFile) => f.kind === "docx" && !f.seeded && !!f.doc?.blocks.some((b) => b.field?.key === "start");

function check(s: OfficeState): Check[] {
  const forms = s.files.filter(isForm);
  const named = (f: OfficeFile) => f.name.toLowerCase() === `${TODAY} holiday request ${fieldValue(f.doc!, "name")}.docx`.toLowerCase();
  const form = forms.find((f) => samePath(f.path, COMPLETED) && named(f)) ?? forms.find((f) => samePath(f.path, COMPLETED)) ?? forms[forms.length - 1];
  const doc = form?.doc;
  const v = (k: string) => (doc ? fieldValue(doc, k) : "");
  const out: Check[] = [];
  const add = (c: Omit<Check, "ok" | "fix">, ok: boolean, fix?: string) => out.push({ ...c, ok, fix: ok ? undefined : fix });
  const none = "There's no filled-in holiday form saved yet. Open HR > Forms > Blank > Holiday request: it opens in Word as a new form. Fill it in and save it.";

  /* The form */
  const empty = doc ? emptyRequired(doc) : [];
  add({ id: "filled", code: "WD-5", group: "The form", label: "Every box marked * is filled in" }, !!doc && empty.length === 0, !doc ? none : `"${empty[0]}" is empty. Click its grey box and fill it in${empty.length > 1 ? `, and ${empty.length - 1} more` : ""}.`);
  add({ id: "start", code: "ADM-3", group: "The form", label: "First day off: Monday 21 December 2026" }, sameDay(v("start"), 21, 12, 2026), !doc ? none : `First day off says "${v("start") || "nothing"}". It should be Monday 21 December 2026: 21/12/2026.`);
  add({ id: "end", code: "ADM-3", group: "The form", label: "Last day off: Wednesday 23 December 2026" }, sameDay(v("end"), 23, 12, 2026), !doc ? none : `Last day off says "${v("end") || "nothing"}". It should be Wednesday 23 December 2026: 23/12/2026.`);
  add({ id: "days", code: "ADM-3", group: "The form", label: "Working days off: 3" }, /^(3|three)\b/i.test(v("days")), !doc ? none : `It says "${v("days") || "nothing"}". Monday, Tuesday and Wednesday are 3 working days.`);
  add({ id: "approver", code: "ADM-3", group: "The form", label: "Approved by Daniel Okafor, your manager" }, v("approver") === "Daniel Okafor", !doc ? none : `It says "${v("approver") || "nobody"}". Emma said Daniel approves holidays for the office team: pick Daniel Okafor.`);

  /* Where it went */
  const who = v("name");
  const want = `${TODAY} Holiday request ${who || "Your Name"}.docx`;
  add({ id: "place", code: "WD-5", group: "Where you put it", label: `In ${pathText(COMPLETED)}` }, !!form && samePath(form.path, COMPLETED), form ? `It's in ${pathText(form.path)}. Emma asked for ${pathText(COMPLETED)}. In File Explorer, select it and use Move to.` : none);
  add(
    { id: "name", code: "SP-4", group: "Where you put it", label: "Named the date, Holiday request, then your name" },
    !!form && who.length >= 2 && named(form),
    !form ? none : !who ? 'Type your name in "Your name" first, then name the file to match.' : `It's called "${form.name}". Name it like Sarah's: "${want}". In File Explorer, select it and use Rename.`,
  );
  const strays = forms.filter((f) => f !== form);
  add({ id: "one", code: "SP-3", group: "Where you put it", label: "One form, in one place" }, !!form && strays.length === 0, !form ? none : `There's a second copy: ${strays[0] ? `${pathText(strays[0].path)} > ${strays[0].name}` : ""}. Delete the extra one, so HR books the right dates.`);

  /* Telling Emma */
  const told = s.emails.some((e) => e.folder === "sent" && [...e.to, ...e.cc].some((p) => p.address === PEOPLE.emma.address));
  add({ id: "loop", code: "OL-5", group: "Telling Emma", label: "Emma knows it's in" }, told, "Close the loop: reply to Emma in one line, saying your form is in Forms > Completed.");
  return out;
}

export const holidayForm: Job = {
  id: "m8j2",
  slug: "book-your-holiday",
  moduleId: "m8",
  moduleLabel: "Module 8: Documents",
  title: "Book your holiday",
  summary: "Emma needs your Christmas holiday form in Forms > Completed by Friday. You want 21 to 23 December off.",
  clock: "09:10",
  deadline: "Friday 13 November",
  doneLine: "Your Christmas days are booked, and HR has everything it needs.",
  brief: "You'd like Monday 21 to Wednesday 23 December off: 3 working days. Emma in HR has emailed about it, and today is Friday. Do what she asks, the way she asks. When you think it's done, press Check my work.",
  apps: ["word"],
  start: "outlook",
  hints: [
    "Read Emma's email, and Daniel's.",
    "In File Explorer, go to HR > Forms > Blank and open Holiday request. It opens in Word as a new form.",
    "Click each grey box and fill it in. The ▼ beside a date opens a calendar. Tick the box at the end.",
    "File > Save As. Pick HR > Forms > Completed. Name it like Sarah's form there: today's date, Holiday request, your name.",
    "Reply to Emma in one line to say it's in.",
  ],
  seed,
  check,
  habits: [
    { label: "Put it where the brief says", checks: ["place"] },
    { label: "Name it so anyone can find it", checks: ["name"] },
    { label: "One version, in one place", checks: ["one"] },
    { label: "Close the loop", checks: ["loop"] },
    { label: "Check your own work", checks: ["filled", "start", "end", "days"] },
  ],
};
