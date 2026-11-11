import { CLAIM_MONEY, CLAIM_TEMPLATE, CLAIM_WIDTHS, COFFEE_RECEIPT, pad, paperOf, TIMESHEET_TEMPLATE, TIMESHEET_WIDTHS, TRAIN_RECEIPT } from "../admin";
import { display, numeric } from "../formula";
import { inbound, officeFolders, PEOPLE, SIGNATURE, YOU } from "../northfield";
import { pathText, samePath, tabsOf, type Check, type Grid, type Job, type OfficeFile, type OfficeState, type Path } from "../types";

/* E10.2 Your timesheet and an expense (criterion ADM-3). Emma reminds the
 * learner that timesheets are due Friday at noon, and not to forget
 * Tuesday's train fare. The week was 08:30 to 17:00 with 30 minutes for
 * lunch, and Thursday until 18:30: 8 + 8 + 8 + 9.5 + 8 = 41.5 hours, 1.5
 * of them overtime. The return train from Leicester to Nottingham for a
 * supplier visit cost £14.60.
 *
 * Both forms are Excel templates in HR > Forms > Blank, as in most small
 * UK offices. The timesheet goes in HR > Forms > Completed; the expense
 * claim goes in Finance > Expenses > 2026 with a photo of the receipt put
 * on it (Excel's Insert > Pictures), both named by the house rule. The
 * photo is one of two the learner emailed themselves from the station:
 * the other is a coffee, which is not being claimed. */

const BLANK: Path = ["HR", "Forms", "Blank"];
export const COMPLETED: Path = ["HR", "Forms", "Completed"];
export const EXPENSES: Path = ["Finance", "Expenses", "2026"];
const DOWNLOADS: Path = ["OneDrive", "Downloads"];
export const TRAIN_ID = "seed-img-4471";
const COFFEE_ID = "seed-img-4469";

const HOURS = [8, 8, 8, 9.5, 8];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

function folder(path: Path, name: string, by = "Emma Clarke"): OfficeFile {
  return { id: `seed-dir-${[...path, name].join("/")}`, path, name, kind: "folder", modified: "02/11/2026", by, seeded: true };
}

/* Someone else's finished claim, so the folder shows the naming by example. */
function sarahsClaim(): Grid {
  const g = CLAIM_TEMPLATE.map((r) => [...r]);
  g[1] = ["04/11/2026", "Parking at Kent Flour Mills, supplier visit", "Travel", "£6.50"];
  g[8] = ["Name", "Sarah Patel", "", ""];
  g[9] = ["Date of claim", "06/11/2026", "", ""];
  return g;
}

function seed(): OfficeState {
  const files: OfficeFile[] = [
    ...officeFolders(),
    folder(["HR", "Forms"], "Blank"),
    folder(["HR", "Forms"], "Completed"),
    folder(["Finance", "Expenses"], "2026", "Priya Shah"),
    { id: "seed-timesheet", path: BLANK, name: "Timesheet.xltx", kind: "xltx", modified: "05/01/2026", by: "Emma Clarke", sheet: TIMESHEET_TEMPLATE, tabs: [{ name: "Timesheet", grid: TIMESHEET_TEMPLATE }], widths: TIMESHEET_WIDTHS, seeded: true },
    { id: "seed-claim", path: BLANK, name: "Expense claim.xltx", kind: "xltx", modified: "05/01/2026", by: "Emma Clarke", sheet: CLAIM_TEMPLATE, tabs: [{ name: "Expense claim", grid: CLAIM_TEMPLATE, formats: CLAIM_MONEY }], widths: CLAIM_WIDTHS, seeded: true },
    { id: "seed-holiday", path: BLANK, name: "Holiday request.docx", kind: "docx", modified: "05/01/2026", by: "Emma Clarke", seeded: true },
    { id: "seed-claim-sarah", path: EXPENSES, name: "2026-11-06 Expense claim Sarah Patel.xlsx", kind: "xlsx", modified: "06/11/2026", by: "Sarah Patel", sheet: sarahsClaim(), tabs: [{ name: "Expense claim", grid: sarahsClaim() }], widths: CLAIM_WIDTHS, seeded: true },
    { id: COFFEE_ID, path: DOWNLOADS, name: "IMG_4469.jpg", kind: "jpg", modified: "10/11/2026", by: "You", paper: paperOf(COFFEE_RECEIPT), seeded: true },
    { id: TRAIN_ID, path: DOWNLOADS, name: "IMG_4471.jpg", kind: "jpg", modified: "10/11/2026", by: "You", paper: paperOf(TRAIN_RECEIPT), seeded: true },
    { id: "seed-download-price", path: DOWNLOADS, name: "Harlow price list 2026.pdf", kind: "pdf", modified: "09/11/2026", by: "You", seeded: true },
  ];
  return {
    version: 0,
    files,
    emails: [
      inbound({
        id: "m-emma-timesheet",
        from: PEOPLE.emma,
        subject: "Timesheet and expenses",
        time: "Thu 16:30",
        body: "Hi,\n\nTimesheets are due Friday at noon. Don't forget your train fare from Tuesday.\n\nThe blank forms are in HR > Forms > Blank. Save your timesheet in HR > Forms > Completed. Your expense claim goes in Finance > Expenses > 2026, with a photo of the receipt on it. Name them the usual way, date first.\n\nThanks,\nEmma",
      }),
      inbound({
        id: "m-daniel-late",
        from: PEOPLE.daniel,
        subject: "Thanks for staying late",
        time: "Thu 18:35",
        unread: false,
        body: `Hi,\n\nThanks for staying on until 18:30 tonight to get the Harlow return packed. Put the extra time on your timesheet as overtime.\n\nDaniel\n\n${SIGNATURE.daniel}`,
      }),
      inbound({
        id: "m-you-receipts",
        from: YOU,
        subject: "Receipts",
        time: "Tue 07:55",
        unread: false,
        body: "Sent from my phone",
        attachments: [
          { name: "IMG_4469.jpg", paper: paperOf(COFFEE_RECEIPT) },
          { name: "IMG_4471.jpg", paper: paperOf(TRAIN_RECEIPT) },
        ],
      }),
    ],
  };
}

/* ── marking ─────────────────────────────────────────────────────────── */

const cell = (g: Grid, r: number, c: number) => (g[r]?.[c] ?? "").trim();
const isTimesheet = (g: Grid) => /hours/i.test(cell(g, 0, 5)) && DAYS.every((d, i) => cell(g, i + 1, 0).toLowerCase() === d.toLowerCase());
const isClaim = (g: Grid) => /what it was for/i.test(cell(g, 0, 1));
const mine = (f: OfficeFile) => !f.seeded && f.kind === "xlsx";
const firstGrid = (f: OfficeFile) => tabsOf(f)[0]?.grid ?? [];
const weekName = (n: string) => /^2026-11-(09|1[0-3]) \S/.test(n);
const near = (a: number | null, b: number) => a !== null && Math.abs(a - b) < 0.001;

function check(s: OfficeState): Check[] {
  const sheets = s.files.filter((f) => mine(f) && isTimesheet(firstGrid(f)));
  const claims = s.files.filter((f) => mine(f) && isClaim(firstGrid(f)));
  const ts = sheets.find((f) => samePath(f.path, COMPLETED)) ?? sheets[sheets.length - 1];
  const ex = claims.find((f) => samePath(f.path, EXPENSES)) ?? claims[claims.length - 1];
  const g = ts ? firstGrid(ts) : [];
  const cg = ex ? firstGrid(ex) : [];
  const out: Check[] = [];
  const add = (c: Omit<Check, "ok" | "fix">, ok: boolean, fix?: string) => out.push({ ...c, ok, fix: ok ? undefined : fix });
  const none = "Open Timesheet.xltx in HR > Forms > Blank, fill it in, and save it.";

  /* The timesheet */
  add(
    { id: "ts-saved", code: "SP-3", group: "Your timesheet", label: `Saved in ${pathText(COMPLETED)}` },
    !!ts && samePath(ts.path, COMPLETED),
    ts ? `Your timesheet is in ${pathText(ts.path)}. Emma asked for ${pathText(COMPLETED)}. In File Explorer, select it and use Move to.` : none,
  );
  add(
    { id: "ts-name", code: "SP-4", group: "Your timesheet", label: 'Named date first, like "2026-11-13 Timesheet Sam Reid.xlsx"' },
    !!ts && weekName(ts.name) && /timesheet/i.test(ts.name),
    ts ? `It's called "${ts.name}". Start with today's date, year first, then say what it is: "2026-11-13 Timesheet" and your name. Use Rename in File Explorer.` : none,
  );
  const wrongDay = HOURS.findIndex((h, i) => !near(numeric(g, i + 1, 5), h));
  add(
    { id: "ts-days", code: "ADM-3", group: "Your timesheet", label: "Hours worked each day: 8, 8, 8, 9.5 on Thursday, 8" },
    !!ts && wrongDay < 0,
    !ts
      ? none
      : `${DAYS[wrongDay]} says "${display(g, wrongDay + 1, 5) || "nothing"}". ${wrongDay === 3 ? "Thursday ran from 08:30 to 18:30: that's 10 hours, less half an hour for lunch, so 9.5." : "08:30 to 17:00 is 8 and a half hours. Take away half an hour for lunch: 8."}`,
  );
  add(
    { id: "ts-thu", code: "ADM-3", group: "Your timesheet", label: "Thursday's finish time says 18:30" },
    !!ts && /^(18[:.]30|6[:.]30\s*pm)$/i.test(cell(g, 4, 3)),
    ts ? `Thursday's finish (D5) says "${cell(g, 4, 3) || "nothing"}". You stayed until 18:30: write it the way the form does, 18:30.` : none,
  );
  const overOk = near(numeric(g, 4, 6), 1.5) && [1, 2, 3, 5].every((r) => (numeric(g, r, 6) ?? 0) === 0);
  add(
    { id: "ts-over", code: "ADM-3", group: "Your timesheet", label: "Overtime: 1.5 hours, on Thursday" },
    !!ts && overOk,
    ts ? "A normal day is 8 hours. Only Thursday went over: 9.5 take away 8 is 1.5. Put 1.5 in Thursday's Overtime (G5), and nothing on the other days." : none,
  );
  add(
    { id: "ts-total", code: "ADM-3", group: "Your timesheet", label: "The total says 41.5 hours" },
    !!ts && near(numeric(g, 7, 5), 41.5) && near(numeric(g, 7, 6), 1.5),
    ts ? `The Total row says ${display(g, 7, 5) || "nothing"} hours and ${display(g, 7, 6) || "nothing"} overtime. Fix the days above it and the totals follow; they should be 41.5 and 1.5.` : none,
  );
  add({ id: "ts-who", code: "ADM-3", group: "Your timesheet", label: "Your name is on it" }, !!ts && cell(g, 9, 1) !== "", ts ? "Type your name in B10, beside Name, so Emma knows whose hours these are." : none);

  /* The expense claim */
  const noClaim = "Open Expense claim.xltx in HR > Forms > Blank, fill it in, and save it.";
  add(
    { id: "ex-saved", code: "SP-3", group: "Your expense claim", label: `Saved in ${pathText(EXPENSES)}` },
    !!ex && samePath(ex.path, EXPENSES),
    ex ? `Your claim is in ${pathText(ex.path)}. Expense claims go in ${pathText(EXPENSES)}, where Priya pays them from. Use Move to in File Explorer.` : noClaim,
  );
  add(
    { id: "ex-name", code: "SP-4", group: "Your expense claim", label: 'Named date first, like "2026-11-13 Expense claim Sam Reid.xlsx"' },
    !!ex && weekName(ex.name) && /expense/i.test(ex.name),
    ex ? `It's called "${ex.name}". Name it like Sarah's in the same folder: the date, then "Expense claim" and your name.` : noClaim,
  );
  const lines = [1, 2, 3, 4, 5].filter((r) => (numeric(cg, r, 3) ?? 0) !== 0);
  const train = lines.find((r) => near(numeric(cg, r, 3), 14.6));
  add(
    { id: "ex-amount", code: "ADM-3", group: "Your expense claim", label: "It claims £14.60 for the train, and nothing else" },
    !!ex && lines.length === 1 && train !== undefined && near(numeric(cg, 6, 3), 14.6),
    !ex
      ? noClaim
      : lines.some((r) => near(numeric(cg, r, 3), 3.1))
        ? "The coffee isn't part of this claim: Emma asked for the train fare. Clear the coffee's line, so the total is £14.60."
        : train === undefined
          ? "Put the fare in the Amount column: 14.60, as the receipt says."
          : `The total (D7) says ${display(cg, 6, 3) || "nothing"}. It should be £14.60.`,
  );
  add(
    { id: "ex-line", code: "ADM-3", group: "Your expense claim", label: "The line says the date (10/11/2026) and what it was for" },
    !!ex && train !== undefined && cell(cg, train, 0) === "10/11/2026" && /train|rail|nottingham/i.test(cell(cg, train, 1)),
    !ex || train === undefined
      ? "Fill in the train line first."
      : cell(cg, train, 0) !== "10/11/2026"
        ? `The date says "${cell(cg, train, 0) || "nothing"}". Use the day you spent the money, Tuesday, written like the form: 10/11/2026.`
        : 'Say what it was for, so Daniel can approve it at a glance: "Return train, Leicester to Nottingham, supplier visit".',
  );
  const pics = ex ? tabsOf(ex).flatMap((t) => t.pictures ?? []) : [];
  const hasTrain = pics.some((p) => p.fileId === TRAIN_ID || p.paper?.doc?.number === TRAIN_RECEIPT.number);
  const hasCoffee = pics.some((p) => p.fileId === COFFEE_ID || p.paper?.doc?.number === COFFEE_RECEIPT.number);
  add(
    { id: "ex-receipt", code: "ADM-3", group: "Your expense claim", label: "The train receipt is on the claim" },
    !!ex && hasTrain && !hasCoffee,
    !ex
      ? noClaim
      : hasCoffee && !hasTrain
        ? "That photo is the coffee receipt. Click it, press Delete picture, and put the train receipt on instead: it says Soar Valley Trains."
        : hasCoffee
          ? "The coffee receipt is on the claim too. Click it and press Delete picture: only the train is being claimed."
          : "No receipt yet. In Excel press 🖼 Pictures, go to Downloads and pick the photo of the train receipt. Open the photos first to see which is which.",
  );
  add(
    { id: "ex-who", code: "ADM-3", group: "Your expense claim", label: "Your name and the date of the claim are on it" },
    !!ex && cell(cg, 8, 1) !== "" && cell(cg, 9, 1) !== "",
    ex ? "Fill in B9 (your name) and B10 (today's date, 13/11/2026), so Priya knows who to pay." : noClaim,
  );

  /* One of each */
  add(
    { id: "one", code: "SP-3", group: "One of each", label: "One timesheet and one claim, with no spare copies" },
    sheets.length <= 1 && claims.length <= 1,
    `There ${sheets.length > 1 ? `are ${sheets.length} timesheets` : `are ${claims.length} expense claims`} saved. Delete the spare ones in File Explorer, so nobody pays you twice.`,
  );
  return out;
}

export const timesheetExpense: Job = {
  id: "m10j2",
  slug: "timesheet-expense",
  moduleId: "m10",
  moduleLabel: "Module 10: Admin in practice",
  title: "Your timesheet and an expense",
  summary: "Emma needs your timesheet by noon, and you have a train fare to claim, with its receipt.",
  clock: "Fri 13 Nov, 10:05",
  deadline: "Timesheets are due at 12:00",
  doneLine: "41.5 hours and £14.60, both in the right place with the receipt. You'll be paid right, and on time.",
  brief: "It's Friday morning. This week you worked 08:30 to 17:00 each day, with 30 minutes for lunch, and on Thursday you stayed until 18:30. On Tuesday you took the train to a supplier in Nottingham. Read Emma's email and do what she asks. When you think it's done, press Check my work.",
  hints: [
    "In File Explorer, go to HR > Forms > Blank and open Timesheet.xltx. It opens as a new workbook.",
    "For each day, type the start, finish, lunch and hours worked. 08:30 to 17:00, less half an hour for lunch, is 8 hours. Anything over 8 hours goes in Overtime.",
    "Type your name in B10, then Save as: HR > Forms > Completed, named like 2026-11-13 Timesheet and your name.",
    "Open Expense claim.xltx. One line: 10/11/2026, the train, Travel, 14.60. Your name and today's date at the bottom.",
    "Press 🖼 Pictures in Excel and pick the train receipt from Downloads (open the photos in File Explorer first to see which one it is). Then Save as into Finance > Expenses > 2026.",
  ],
  seed,
  check,
  habits: [
    { label: "Put it where the brief says", checks: ["ts-saved", "ex-saved"] },
    { label: "Name it so anyone can find it", checks: ["ts-name", "ex-name"] },
    { label: "One version, in one place", checks: ["one"] },
    { label: "Check your own work", checks: ["ts-days", "ts-over", "ts-total", "ex-amount", "ex-receipt"] },
  ],
};

/* For the tests: a timesheet and a claim filled in as Emma wants. */
export function goodTimesheet(): Grid {
  const g = TIMESHEET_TEMPLATE.map((r) => [...r]);
  HOURS.forEach((h, i) => {
    g[i + 1][2] = "08:30";
    g[i + 1][3] = i === 3 ? "18:30" : "17:00";
    g[i + 1][4] = "0.5";
    g[i + 1][5] = String(h);
    g[i + 1][6] = i === 3 ? "1.5" : "";
  });
  g[9][1] = "Sam Reid";
  return g;
}

export function goodClaim(): Grid {
  const g = pad(CLAIM_TEMPLATE, 4, CLAIM_TEMPLATE.length);
  g[1] = ["10/11/2026", "Return train, Leicester to Nottingham, supplier visit", "Travel", "14.60"];
  g[8][1] = "Sam Reid";
  g[9][1] = "13/11/2026";
  return g;
}
