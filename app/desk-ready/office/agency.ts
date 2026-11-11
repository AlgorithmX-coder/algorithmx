import { cellName, numeric } from "./formula";
import type { AgencyRecord, ExcelTestResult, Grid, OfficeState, Tab, TypingResult } from "./types";

/* Module 13: the recruitment agency and its online tests (E13.2, criteria
 * WIN-1, XL-1, XL-5), kept free of React so the test centre app, the
 * lesson's practice and the job's checks all mark a test the same way.
 *
 * Pennyford Recruitment is invented, as is everyone in it. UK office
 * agencies test new candidates the same two ways: a timed typing test,
 * scored as gross and net words a minute with an accuracy figure, and a
 * short Excel test against the clock. The pass marks are the ones most
 * office clients ask for: 35 words a minute at 95% accuracy, and 8 of 10. */

export const AGENCY = Object.freeze({
  name: "Pennyford Recruitment",
  short: "Pennyford",
  site: "tests.pennyford.example",
  /* the agency's own brand colour, used only inside its test centre */
  colour: "#0b6e69",
  soft: "#e3f2f0",
  consultant: { name: "Jo Marsh", address: "jo.marsh@pennyford.example" },
  phone: "0116 496 0752",
});

export const PASS = Object.freeze({ wpm: 35, accuracy: 95, excel: 8, typingSeconds: 180, excelSeconds: 900 });

/* ── the typing test ──────────────────────────────────────────────────── */

/* A business letter, the kind agencies use: ordinary words, a few numbers
 * written out, nothing to trip on but the typing itself. Long enough that
 * nobody runs out in three minutes. */
export const PASSAGE = [
  "Thank you for your order, which arrived this morning. We have checked the stock and can send everything on your list by Thursday, apart from the large paper cups. These are due in from our supplier next week, so we will send them on as soon as they arrive, at no extra charge. Please let us know if you would rather wait and have the whole order in one delivery.",
  "Our delivery van will reach your area between nine and twelve. If nobody will be there to sign for the boxes, you can tell the driver where to leave them safely. You can also change the day of your delivery, as long as you call us before four o'clock on the afternoon before.",
  "Your invoice will follow by email once the goods have gone out. It shows the price of each item, the total before tax and the total with tax added. Payment is due within thirty days. If anything on the invoice does not match what you received, please reply to the email and we will put it right straight away.",
  "We are always looking for ways to improve. Next month we will start sending a short text on the morning of each delivery, so you know roughly when to expect the van. If you would prefer not to get these messages, just let the office know and we will take your number off the list.",
  "Thank you again for choosing to work with us. We value your custom and look forward to helping your business through the busy months ahead. If you have any questions about this order, or would like to talk about a regular weekly delivery, please get in touch with the sales team at any time during office hours.",
] as const;

export const passageWords = (p: readonly string[] = PASSAGE) => p.join(" ").split(/\s+/).filter(Boolean);

export type TypingScore = Omit<TypingResult, "at" | "practice">;

/* How a typing test is marked, word by word, the way agency tests mark it.
 * Each word typed is set against the word in the same place in the
 * passage, so one slip costs one word, not the rest of the line. A word
 * still being typed when the clock stops counts as right if it is right so
 * far. Gross speed is characters typed (spaces included) over five, a
 * minute; net speed takes off one word for each word left wrong; accuracy
 * is the share of characters typed that were right. */
export function scoreTyping(typed: string, seconds: number, words: readonly string[] = passageWords()): TypingScore & { wrongAt: number[] } {
  const got = typed.split(/\s+/).filter(Boolean);
  const finishedLast = /\s$/.test(typed);
  let chars = 0;
  let wrongChars = 0;
  const wrongAt: number[] = [];
  got.forEach((w, i) => {
    const want = words[i] ?? "";
    const last = i === got.length - 1 && !finishedLast;
    const target = last ? want.slice(0, w.length) : want;
    let same = 0;
    for (let k = 0; k < Math.min(w.length, target.length); k++) if (w[k] === target[k]) same++;
    const bad = Math.max(w.length, target.length) - same;
    chars += w.length + (i > 0 ? 1 : 0);
    wrongChars += Math.min(bad, w.length + (i > 0 ? 1 : 0));
    if (bad > 0) wrongAt.push(i);
  });
  const minutes = Math.max(seconds, 1) / 60;
  const gross = chars / 5 / minutes;
  const net = Math.max(0, gross - wrongAt.length / minutes);
  const accuracy = chars ? Math.max(0, ((chars - wrongChars) / chars) * 100) : 0;
  return { seconds: Math.round(seconds), chars, words: got.length, errors: wrongAt.length, gross: Math.round(gross), net: Math.round(net), accuracy: Math.floor(accuracy * 10) / 10, wrongAt };
}

export const typingPassed = (r: Pick<TypingResult, "net" | "accuracy">) => r.net >= PASS.wpm && r.accuracy >= PASS.accuracy;

/* The real test counts only when it ran its full three minutes, or the
 * candidate typed the whole passage before the clock ran out. */
export const fullTest = (r: TypingResult, words = passageWords().length) => !r.practice && (r.seconds >= PASS.typingSeconds - 1 || r.words >= words);

/* The attempt that says most about the candidate: a pass if there is one
 * (the fastest), else the one closest to passing on its weaker measure. */
export function bestTyping(list: readonly TypingResult[]): TypingResult | null {
  if (!list.length) return null;
  const nearness = (r: TypingResult) => Math.min(r.net / PASS.wpm, r.accuracy / PASS.accuracy);
  return [...list].sort((a, b) => Number(typingPassed(b)) - Number(typingPassed(a)) || (typingPassed(a) ? b.net - a.net : nearness(b) - nearness(a)))[0];
}

/* ── the Excel test ───────────────────────────────────────────────────── */

const ORDERS: string[][] = [
  ["Item", "Supplier", "Qty", "Unit price", "Cost", "Share of total"],
  ["A4 copier paper (box)", "Paper Direct", "6", "21.50", "", ""],
  ["Ballpoint pens (pack of 50)", "Office Hub", "4", "7.20", "", ""],
  ["Printer toner", "Office Hub", "", "64.00", "", ""],
  ["Envelopes (box of 500)", "Paper Direct", "3", "18.40", "", ""],
  ["Box files", "Office Hub", "10", "3.95", "", ""],
  ["Desk diary 2027", "Paper Direct", "5", "6.80", "", ""],
  ["Whiteboard markers", "Office Hub", "8", "4.25", "", ""],
  ["Lever arch files", "Paper Direct", "12", "2.60", "", ""],
  ["", "", "", "", "", ""],
  ["", "", "", "", "", ""],
  ["Total", "", "", "", "", ""],
  ["Average cost", "", "", "", "", ""],
  ["Paper Direct items", "", "", "", "", ""],
  ["", "", "", "", "", ""],
  ["", "", "", "", "", ""],
];

export const STAFF: string[][] = [
  ["First name", "Surname", "Team", "Start date", "", ""],
  ["Aisha", "Rahman", "Accounts", "03/02/2025", "", ""],
  ["Tom", "Bell", "Warehouse", "14/07/2024", "", ""],
  ["Grace", "Okoro", "Sales", "01/09/2025", "", ""],
  ["Liam", "Hughes", "Warehouse", "22/04/2023", "", ""],
  ["Megan", "Evans", "Office", "10/11/2025", "", ""],
  ["Ravi", "Mistry", "Sales", "05/01/2026", "", ""],
  ["Sophie", "Carter", "Accounts", "18/03/2024", "", ""],
  ["Kwame", "Asante", "Office", "27/10/2025", "", ""],
  ["", "", "", "", "", ""],
  ["", "", "", "", "", ""],
  ["", "", "", "", "", ""],
  ["", "", "", "", "", ""],
  ["", "", "", "", "", ""],
  ["", "", "", "", "", ""],
  ["", "", "", "", "", ""],
];

export const EXCEL_TEST_FILE = "Pennyford Excel test.xlsx";
export const EXCEL_WIDTHS = [220, 116, 62, 92, 96, 120];

/* A fresh copy of the test workbook: an office supplies order to finish,
 * and a staff list to sort. */
export function excelTestBook(): Tab[] {
  return [
    { name: "Orders", grid: ORDERS.map((r) => [...r]) },
    { name: "Staff", grid: STAFF.map((r) => [...r]) },
  ];
}

export interface ExcelTestTask {
  n: number;
  code: string;
  /* What the candidate is asked, as the test sheet words it. */
  text: string;
  /* Where to look, said in a practice run when it isn't right yet. */
  hint: string;
  check: (tabs: readonly Tab[]) => boolean;
}

/* The formula in a cell, upper case, without spaces or $ signs. */
const formulaAt = (g: Grid, ref: string) => {
  const m = /^([A-Z])(\d+)$/.exec(ref)!;
  const raw = (g[Number(m[2]) - 1]?.[m[1].charCodeAt(0) - 65] ?? "").trim();
  return raw.startsWith("=") ? raw.toUpperCase().replace(/[\s$]/g, "") : "";
};
const rawAt = (g: Grid, ref: string) => {
  const m = /^([A-Z])(\d+)$/.exec(ref)!;
  return (g[Number(m[2]) - 1]?.[m[1].charCodeAt(0) - 65] ?? "").trim();
};
const num = (g: Grid, ref: string) => {
  const m = /^([A-Z])(\d+)$/.exec(ref)!;
  return numeric(g, Number(m[2]) - 1, m[1].charCodeAt(0) - 65);
};
const near = (a: number | null, b: number | null) => a !== null && b !== null && Math.abs(a - b) < 0.005;
const orders = (tabs: readonly Tab[]) => tabs.find((t) => t.name === "Orders")?.grid ?? tabs[0]?.grid ?? [];
const staff = (tabs: readonly Tab[]) => tabs.find((t) => t.name === "Staff")?.grid ?? tabs[1]?.grid ?? [];
const rows = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

/* A cost cell holds Qty times Unit price for its own row, as a formula. */
const costRight = (g: Grid, r: number) => {
  const f = formulaAt(g, `E${r}`);
  if (!f || !f.includes(`C${r}`) || !f.includes(`D${r}`)) return false;
  return near(num(g, `E${r}`), (num(g, `C${r}`) ?? 0) * (num(g, `D${r}`) ?? 0));
};

/* Each task reads only its own cells, so one slip never costs two marks. */
export const EXCEL_TASKS: readonly ExcelTestTask[] = [
  {
    n: 1,
    code: "XL-1",
    text: "The quantity of printer toner is missing. Type 2 in cell C4.",
    hint: "Click cell C4: column C (Qty), row 4 (Printer toner). Type 2 and press Enter.",
    check: (t) => rawAt(orders(t), "C4") === "2",
  },
  {
    n: 2,
    code: "XL-1",
    text: "Add one more item in row 10: Sticky notes, from Paper Direct, quantity 12, unit price 1.85.",
    hint: "Click A10 and type Sticky notes, then press Tab to move right for each of the other three.",
    check: (t) => {
      const g = orders(t);
      return /^sticky notes$/i.test(rawAt(g, "A10")) && /^paper direct$/i.test(rawAt(g, "B10")) && num(g, "C10") === 12 && near(num(g, "D10"), 1.85);
    },
  },
  {
    n: 3,
    code: "XL-5",
    text: "In E2, write a formula that works out the cost: the quantity times the unit price.",
    hint: "Click E2 and type =C2*D2, then press Enter. The * means times.",
    check: (t) => costRight(orders(t), 2),
  },
  {
    n: 4,
    code: "XL-5",
    text: "Copy the formula in E2 down, so every item from row 3 to row 10 has its cost.",
    hint: "Click E2, then press Fill down. Each row's formula should use its own row: E5 holds =C5*D5.",
    check: (t) => rows(3, 10).every((r) => costRight(orders(t), r)),
  },
  {
    n: 5,
    code: "XL-5",
    text: "In E12, add up the costs of all the items with the SUM function.",
    hint: "Click E12 and type =SUM(E2:E10). The colon means everything from E2 to E10.",
    check: (t) => /^=SUM\(E2:E1[01]\)$/.test(formulaAt(orders(t), "E12")),
  },
  {
    n: 6,
    code: "XL-5",
    text: "In E13, work out the average cost of an item with the AVERAGE function.",
    hint: "Click E13 and type =AVERAGE(E2:E10).",
    check: (t) => /^=AVERAGE\(E2:E1[01]\)$/.test(formulaAt(orders(t), "E13")),
  },
  {
    n: 7,
    code: "XL-3",
    text: "Show the total in E12 and the average in E13 as money, with a £ sign.",
    hint: "Click E12 and press the £ button. Then do the same for E13.",
    check: (t) => {
      const f = (t.find((x) => x.name === "Orders") ?? t[0])?.formats ?? {};
      return f.E12 === "money" && f.E13 === "money";
    },
  },
  {
    n: 8,
    code: "XL-7",
    text: "In E14, use COUNTIF to count how many items come from Paper Direct.",
    hint: 'Click E14 and type =COUNTIF(B2:B10,"Paper Direct"). The supplier goes in quotes.',
    check: (t) => {
      const g = orders(t);
      const f = formulaAt(g, "E14");
      const count = rows(2, 10).filter((r) => /^paper direct$/i.test(rawAt(g, `B${r}`))).length;
      return /^=COUNTIF\(B2:B1[01],/.test(f) && num(g, "E14") === count;
    },
  },
  {
    n: 9,
    code: "XL-6",
    text: "In F2, work out what share of the total cost E2 is, as a percentage. Use $E$12 so the total stays fixed, then copy it down to F10.",
    hint: "Click F2, type =E2/$E$12 and press Enter. Click F2 again, press %, then press Fill down.",
    check: (t) => {
      const g = orders(t);
      const tab = t.find((x) => x.name === "Orders") ?? t[0];
      const raw = (r: number) => (g[r - 1]?.[5] ?? "").replace(/\s/g, "").toUpperCase();
      const fixed = rows(2, 10).every((r) => raw(r).includes("$E$12") && raw(r).includes(`E${r}`) && near(num(g, `F${r}`), (num(g, `E${r}`) ?? 0) / (num(g, "E12") || NaN)));
      return fixed && tab?.formats?.F2 === "percent";
    },
  },
  {
    n: 10,
    code: "XL-4",
    text: "On the Staff sheet, sort the list by surname, A to Z, keeping each person's row together.",
    hint: "Click the Staff tab at the bottom, click any surname in column B, then press Sort A→Z.",
    check: (t) => {
      const g = staff(t);
      const people = g.slice(1, STAFF.length).filter((r) => r.some((x) => x.trim()));
      const wanted = STAFF.slice(1).filter((r) => r[0]).map((r) => r.join("|"));
      const sorted = people.every((r, i) => i === 0 || people[i - 1][1].localeCompare(r[1], "en-GB") <= 0);
      return people.length === wanted.length && sorted && people.every((r) => wanted.includes(r.join("|")));
    },
  },
];

export const markExcel = (tabs: readonly Tab[]): number[] =>
  EXCEL_TASKS.filter((task) => {
    try {
      return task.check(tabs);
    } catch {
      return false;
    }
  }).map((t) => t.n);

export const excelPassed = (r: Pick<ExcelTestResult, "right">) => r.right.length >= PASS.excel;

export function bestExcel(list: readonly ExcelTestResult[]): ExcelTestResult | null {
  if (!list.length) return null;
  return [...list].sort((a, b) => b.right.length - a.right.length || a.seconds - b.seconds)[0];
}

/* ── the record ───────────────────────────────────────────────────────── */

export const agencyOf = (s: Pick<OfficeState, "agency">): AgencyRecord => s.agency ?? { typing: [], excel: [] };

/* Add a result, keeping the last 30 of each kind. */
export function addResult(s: OfficeState, r: { typing?: TypingResult; excel?: ExcelTestResult }): OfficeState {
  const a = agencyOf(s);
  return {
    ...s,
    agency: {
      typing: r.typing ? [...a.typing, r.typing].slice(-30) : a.typing,
      excel: r.excel ? [...a.excel, r.excel].slice(-30) : a.excel,
    },
  };
}

export const realTyping = (a: AgencyRecord) => a.typing.filter((r) => fullTest(r));
export const realExcel = (a: AgencyRecord) => a.excel.filter((r) => !r.practice);

/* "Typing 41 wpm at 97%, Excel 9 of 10": the best real results, for the
 * module page and the CV. Null when no real test has been taken. */
export function bestLine(a: AgencyRecord): string | null {
  const t = bestTyping(realTyping(a));
  const e = bestExcel(realExcel(a));
  const parts = [t && `typing ${t.net} words a minute at ${Math.floor(t.accuracy)}%`, e && `Excel ${e.right.length} of 10`].filter(Boolean);
  return parts.length ? `Your best: ${parts.join(", ")}` : null;
}

/* The agency job's office record, read from this browser's storage (see
 * office/store). Used by the module page and by the CV job's notes. */
export function storedAgency(jobId = "m13j2"): AgencyRecord | null {
  try {
    const raw = window.localStorage.getItem(`desk:office:${jobId}`);
    if (!raw) return null;
    const s = JSON.parse(raw) as OfficeState;
    return s?.agency && Array.isArray(s.agency.typing) && Array.isArray(s.agency.excel) ? s.agency : null;
  } catch {
    return null;
  }
}

/* For a results table: "2:41" from seconds. */
export const clock = (secs: number) => `${Math.floor(Math.max(0, secs) / 60)}:${String(Math.floor(Math.max(0, secs) % 60)).padStart(2, "0")}`;

export const cellRef = cellName;
