import { numeric } from "../formula";
import { inbound, officeFolders, PEOPLE } from "../northfield";
import { tabsOf, type Check, type Grid, type Job, type OfficeFile, type OfficeState, type Person } from "../types";

/* The two Module 7 jobs (criteria XL-6, XL-8, XL-9, OL-4):
 *
 * - E7.1 Answer the manager's question: who was the biggest customer in
 *   November, and are they up on October? SUMIF each customer's spend,
 *   work out the change, chart it with a title, save, and answer Daniel
 *   in one line.
 * - E7.2 The number that can't be right: a weekly summary says Bright
 *   Cafe spent over £1,000. Highlight anything over £500, fix the typo
 *   from the order form (1080 for 108.00), save, and tell Priya. */

const ORDERS_DIR = ["Operations Team", "Documents", "Orders", "2026"];
const isFormula = (g: Grid | undefined, r: number, c: number) => (g?.[r]?.[c] ?? "").trim().startsWith("=");
const near = (a: number | null, b: number, tol = 0.005) => a !== null && Math.abs(a - b) < tol;
const pad = (rows: string[][], cols: number, total: number): Grid => {
  const g = rows.map((r) => [...r, ...Array(Math.max(0, cols - r.length)).fill("")]);
  while (g.length < total) g.push(Array(cols).fill(""));
  return g;
};
const sentTo = (s: OfficeState, p: Person) => s.emails.filter((e) => e.folder === "sent" && [...e.to, ...e.cc].some((x) => x.address === p.address));

/* ── E7.1 Answer the manager's question ─────────────────────────────── */

const SPEND_ID = "seed-spend";
const CUSTOMERS: [string, number, number][] = [
  ["Harlow Foods", 128.97, 140.2],
  ["Bright Cafe", 176.4, 150],
  ["Kent Bakery", 452, 389.5],
  ["Oak Street Deli", 133.75, 120],
  ["Mill Lane Pub", 43.2, 51.6],
];
/* Columns: A-G the orders, then I-L the summary by customer. */
const SUM_C = { name: 8, nov: 9, oct: 10, change: 11 };

function spendSheet(): Grid {
  const orders: string[][] = [
    ["4401", "03/11/2026", "Harlow Foods", "Pallet wrap", "12", "£4.50", "=E2*F2"],
    ["4402", "03/11/2026", "Bright Cafe", "Paper cups (500)", "6", "£18.00", "=E3*F3"],
    ["4403", "04/11/2026", "Kent Bakery", "Flour 25kg", "20", "£14.20", "=E4*F4"],
    ["4404", "04/11/2026", "Harlow Foods", "Labels (1000)", "3", "£9.99", "=E5*F5"],
    ["4405", "05/11/2026", "Oak Street Deli", "Napkins", "10", "£3.25", "=E6*F6"],
    ["4406", "05/11/2026", "Bright Cafe", "Lids (500)", "6", "£11.40", "=E7*F7"],
    ["4407", "06/11/2026", "Kent Bakery", "Sugar 25kg", "8", "£21.00", "=E8*F8"],
    ["4408", "06/11/2026", "Mill Lane Pub", "Glass cloths", "24", "£1.80", "=E9*F9"],
    ["4409", "07/11/2026", "Oak Street Deli", "Paper bags", "15", "£6.75", "=E10*F10"],
    ["4410", "07/11/2026", "Harlow Foods", "Pallet wrap", "10", "£4.50", "=E11*F11"],
  ];
  const g = pad([["Order no", "Date", "Customer", "Item", "Qty", "Unit price", "Total", "", "Customer", "November", "October", "Change"], ...orders.map((r) => [...r, ""])], 12, 18);
  CUSTOMERS.forEach(([name, , oct], i) => {
    g[i + 1][SUM_C.name] = name;
    g[i + 1][SUM_C.oct] = `£${oct.toFixed(2)}`;
  });
  return g;
}

function seedBest(): OfficeState {
  const files: OfficeFile[] = [...officeFolders(), { id: SPEND_ID, path: ORDERS_DIR, name: "Customer spend November.xlsx", kind: "xlsx", modified: "08/11/2026", by: "Priya Shah", sheet: spendSheet(), widths: [70, 96, 130, 130, 44, 80, 84, 20, 130, 96, 96, 80], seeded: true }];
  return {
    version: 0,
    files,
    emails: [
      inbound({
        id: "m-daniel-best",
        from: PEOPLE.daniel,
        subject: "Biggest customer in November?",
        time: "08:50",
        body: "Hi,\n\nWho was our biggest customer in November, and are they up on October? One line is fine, I'm in meetings all day.\n\nPriya's started a sheet for it: Operations Team > Documents > Orders > 2026 > Customer spend November. Fill in November and the change for each customer, add a chart of November spend for the board, save it, and let me know.\n\nThanks,\nDaniel",
      }),
    ],
  };
}

function checkBest(s: OfficeState): Check[] {
  const file = s.files.find((f) => f.id === SPEND_ID);
  const tab = file ? tabsOf(file)[0] : undefined;
  const g = tab?.grid;
  const out: Check[] = [];
  const add = (c: Omit<Check, "ok" | "fix">, ok: boolean, fix?: string) => out.push({ ...c, ok, fix: ok ? undefined : fix });
  const badNov = CUSTOMERS.findIndex(([, nov], i) => !(isFormula(g, i + 1, SUM_C.nov) && near(numeric(g ?? [], i + 1, SUM_C.nov), nov)));
  add(
    { id: "november", code: "XL-5", group: "The sheet", label: "Each customer's November spend is worked out by a formula" },
    !!g && badNov === -1,
    badNov < 0 ? "" : `J${badNov + 2} (${CUSTOMERS[badNov][0]}) should work out ${CUSTOMERS[badNov][1].toFixed(2)}. Try =SUMIF(C2:C11,I${badNov + 2},G2:G11): add up column G where column C matches the name in I${badNov + 2}. Then Fill down.`,
  );
  const kentChange = numeric(g ?? [], 3, SUM_C.change);
  add(
    { id: "change", code: "XL-6", group: "The sheet", label: "The change on October is worked out: Kent Bakery is up 16%" },
    !!g && isFormula(g, 3, SUM_C.change) && near(kentChange, (452 - 389.5) / 389.5, 0.002),
    "In L2 type =(J2-K2)/K2, press %, then Fill down.",
  );
  const chart = tab?.chart;
  add(
    { id: "chart", code: "XL-9", group: "The chart", label: "A chart of November spend by customer" },
    !!chart && chart.labelCol === SUM_C.name && chart.valueCol === SUM_C.nov,
    !chart ? "Press 📊 Chart. Names along the bottom: I: Customer. Numbers up the side: J: November." : "Edit the chart: names from I: Customer, numbers from J: November.",
  );
  add({ id: "title", code: "XL-9", group: "The chart", label: "The chart has a title that says what it shows" }, !!chart && chart.title.split(/\s+/).filter(Boolean).length >= 2, "Give the chart a title, like \"Spend by customer, November 2026\".");
  add({ id: "saved", code: "WIN-4", group: "Answering Daniel", label: "Saved where Priya keeps it" }, !!file && file.by === "You", "Press Save in Excel.");
  const mail = sentTo(s, PEOPLE.daniel).at(-1);
  const body = mail?.body ?? "";
  const lines = body.split("\n").map((l) => l.trim()).filter(Boolean);
  const answer = lines.find((l) => !/^(hi|hello|dear|good (morning|afternoon))\b/i.test(l)) ?? "";
  add({ id: "answer", code: "XL-9", group: "Answering Daniel", label: "The first line answers: Kent Bakery, £452.00" }, /kent/i.test(answer) && /452/.test(answer), mail ? "Put the answer straight after the greeting: Kent Bakery, £452.00 in November." : "Reply to Daniel.");
  add({ id: "up", code: "XL-6", group: "Answering Daniel", label: "It says they're up on October, by about 16%" }, !!mail && /\b16(\.\d)?\s?%|sixteen per ?cent/i.test(body) && !/\bdown\b/i.test(answer), "Say how much they're up: about 16% on October.");
  add({ id: "short", code: "OL-4", group: "Answering Daniel", label: "Short, like he asked" }, !!mail && body.split(/\s+/).filter(Boolean).length <= 70, "Daniel said one line is fine. Keep it under about 70 words.");
  return out;
}

export const bestCustomer: Job = {
  id: "m7j1",
  slug: "best-customer",
  moduleId: "m7",
  moduleLabel: "Module 7: What the numbers mean",
  title: "Answer the manager's question",
  summary: "Daniel wants to know who the biggest customer was in November, and whether they're up on October. Work it out, chart it, answer in one line.",
  clock: "08:52",
  deadline: "Daniel is in meetings all day",
  doneLine: "Daniel has his answer in one line, and the board has a chart. The numbers behind it are all formulas.",
  brief: "Daniel has a question for you. Read his email, work it out in Priya's sheet, and answer him. When you think it's done, press Check my work.",
  hints: [
    "Open Customer spend November.xlsx from Operations Team > Documents > Orders > 2026.",
    "In J2 type =SUMIF(C2:C11,I2,G2:G11), then Fill down to J6.",
    "In L2 type =(J2-K2)/K2, press %, then Fill down to L6.",
    "Press 📊 Chart: names from I, numbers from J, and a title. Save, then answer Daniel in one line.",
  ],
  seed: seedBest,
  check: checkBest,
  habits: [
    { label: "Check your own work", checks: ["november", "change"] },
    { label: "Close the loop", checks: ["saved", "answer"] },
  ],
};

/* ── E7.2 The number that can't be right ───────────────────────────── */

const WEEK_ID = "seed-week-sales";
const WEEK: [string, string, string, string][] = [
  ["Mon", "Harlow Foods", "4411", "£54.00"],
  ["Mon", "Bright Cafe", "4412", "£108.00"],
  ["Tue", "Kent Bakery", "4413", "£284.00"],
  ["Tue", "Harlow Foods", "4414", "£29.97"],
  ["Wed", "Bright Cafe", "4415", "1080"],
  ["Wed", "Oak Street Deli", "4416", "£32.50"],
  ["Thu", "Bright Cafe", "4417", "£68.40"],
  ["Thu", "Kent Bakery", "4418", "£168.00"],
  ["Thu", "Mill Lane Pub", "4419", "£43.20"],
  ["Fri", "Oak Street Deli", "4420", "£101.25"],
  ["Fri", "Harlow Foods", "4421", "£45.00"],
  ["Fri", "Mill Lane Pub", "4422", "£60.00"],
];
const TYPO_ROW = 5; // row index of order 4415
/* The week's right total, with 4415 at £108.00. */
const WEEK_TOTAL = WEEK.reduce((sum, w, i) => sum + (i + 1 === TYPO_ROW ? 108 : Number(w[3].replace(/[£,]/g, ""))), 0);

function seedOdd(): OfficeState {
  const g = pad([["Day", "Customer", "Order no", "Value"], ...WEEK.map((r) => [...r]), [], ["", "", "Week total", "=SUM(D2:D13)"]], 4, 20);
  const files: OfficeFile[] = [...officeFolders(), { id: WEEK_ID, path: ORDERS_DIR, name: "Weekly sales summary.xlsx", kind: "xlsx", modified: "Today 08:30", by: "Priya Shah", sheet: g, widths: [70, 160, 100, 110], seeded: true }];
  return {
    version: 0,
    files,
    emails: [
      inbound({
        id: "m-priya-odd",
        from: PEOPLE.priya,
        subject: "Bright Cafe can't have spent that much",
        time: "09:40",
        body: "Hi,\n\nThe weekly sales summary (Orders > 2026) says Bright Cafe spent over a thousand pounds on Wednesday. They never spend that much.\n\nCan you highlight anything over £500 so it stands out, check it against their order form (attached), fix it, save it, and tell me what was wrong?\n\nThanks,\nPriya",
        attachments: [
          {
            name: "Order form 4415.pdf",
            paper: {
              heading: "Order form",
              from: ["Northfield Supplies", "Unit 2, Abbey Trade Park", "Leicester LE4 5AQ"],
              meta: [
                ["Order no", "4415"],
                ["Date", "11/11/2026"],
                ["Customer", "Bright Cafe"],
              ],
              table: { head: ["Item", "Qty", "Price", "Total"], rows: [["Paper cups (500)", "6", "£18.00", "£108.00"]] },
              footer: "Prices exclude VAT.",
            },
          },
        ],
      }),
    ],
  };
}

function checkOdd(s: OfficeState): Check[] {
  const file = s.files.find((f) => f.id === WEEK_ID);
  const tab = file ? tabsOf(file)[0] : undefined;
  const g = tab?.grid;
  const out: Check[] = [];
  const add = (c: Omit<Check, "ok" | "fix">, ok: boolean, fix?: string) => out.push({ ...c, ok, fix: ok ? undefined : fix });
  add(
    { id: "highlight", code: "XL-8", group: "Finding it", label: "Values over £500 are highlighted" },
    !!tab && (tab.highlights ?? []).some((h) => h.col === 3 && h.op === ">" && Number(h.value.replace(/[£,]/g, "")) === 500),
    "Click a cell in the Value column (D), then 🖍 Highlight ▾ > Greater than…, type 500, OK. Save afterwards.",
  );
  add({ id: "fixed", code: "XL-8", group: "Fixing it", label: "Order 4415 now says £108.00, as on the form" }, !!g && near(numeric(g, TYPO_ROW, 3), 108), g ? `D${TYPO_ROW + 1} says ${(g[TYPO_ROW]?.[3] ?? "").trim() || "nothing"}. The order form says £108.00.` : "Open the summary first.");
  const others = WEEK.every((w, i) => i + 1 === TYPO_ROW || (g?.[i + 1]?.[3] ?? "").trim() === w[3]);
  add(
    { id: "nothing-else", code: "XL-8", group: "Fixing it", label: `Nothing else changed, and the total is now £${WEEK_TOTAL.toLocaleString("en-GB", { minimumFractionDigits: 2 })}` },
    !!g && others && near(numeric(g, 14, 3), WEEK_TOTAL),
    "Only order 4415 was wrong. Put any other changes back, and keep the total as =SUM(D2:D13).",
  );
  add({ id: "saved", code: "WIN-4", group: "Fixing it", label: "Saved into the summary" }, !!file && file.by === "You", "Press Save in Excel.");
  const mail = sentTo(s, PEOPLE.priya).at(-1);
  add(
    { id: "told", code: "OL-4", group: "Telling Priya", label: "You told Priya what was wrong: 1080 typed for £108.00" },
    !!mail && /108/.test(mail.body) && /(1080|decimal|point|typo|typed)/i.test(mail.body),
    mail ? "Say what was wrong in one line: order 4415 had 1080 typed instead of £108.00." : "Reply to Priya.",
  );
  return out;
}

export const oddNumber: Job = {
  id: "m7j2",
  slug: "odd-number",
  moduleId: "m7",
  moduleLabel: "Module 7: What the numbers mean",
  title: "The number that can't be right",
  summary: "A weekly summary says a small cafe spent over £1,000. Make the big numbers stand out, find the typo, fix it from the order form, and explain.",
  clock: "09:42",
  deadline: "Priya is closing the week today",
  doneLine: "The typo's fixed from the order form, the big numbers stand out, and Priya knows exactly what went wrong.",
  brief: "Priya thinks a number in the weekly sales summary is wrong. Read her email and sort it out. When you think it's done, press Check my work.",
  hints: [
    "Open the order form attached to Priya's email: order 4415 was £108.00.",
    "Open Weekly sales summary.xlsx from Operations Team > Documents > Orders > 2026.",
    "Click D2, then 🖍 Highlight ▾ > Greater than…, 500. The odd one turns red.",
    "Fix D6 to £108.00, save, and tell Priya what was wrong.",
  ],
  seed: seedOdd,
  check: checkOdd,
  habits: [
    { label: "Check your own work", checks: ["highlight", "fixed", "nothing-else"] },
    { label: "Close the loop", checks: ["saved", "told"] },
  ],
};
