import { BRIGHTWATER, GOODS_IN, HARLOW, INVOICE_BW5520, INVOICE_HP2291, INVOICE_KF1175, KENT_FLOUR, NORTHFIELD, NORTHFIELD_ACCOUNTS, pad, paperOf, PO_3307, timed } from "../../admin";
import { fromMin, ROOMS, toMin } from "../../meetings";
import { inbound, KENT_STAFF, officeFolders, PEOPLE, SIGNATURE, YOU } from "../../northfield";
import { EMMA_CLARKSON, HARLOW_MAIN_CALL, IT_HELPDESK, PHONE_BOOK, PRIYA_CALL, SCAM_CALL, scamEmail, TOM_CALL, TOM_NUMBER } from "../../safety";
import type { BizDoc, Busy, Chat, Email, Grid, Meeting, OfficeFile, OfficeState, Path, Person, PhoneCall } from "../../types";
import { APPROVED, pdfFile, PRIYA_SIGNATURE, TO_APPROVE } from "../invoiceCheck";

/* The final task: Monday morning at the desk (criteria doc, "The capstone").
 * Monday 16 November 2026, 08:30 to 12:30 office time, the week after the
 * modules' week. This file holds the office as it is at 08:30 and the ten
 * things that land during the morning, each at its own office time: eight
 * emails, a Teams message and a phone call. Nothing tells the learner which
 * tool to use or in what order; the work arrives the way real work does.
 * Everything is invented: phone numbers sit in Ofcom's drama ranges and
 * every address ends .example. */

export const MORNING_ID = "finalj1";
export const DAY = "2026-11-16";
export const TODAY = "16/11/2026";
/* The morning, in office minutes after 08:30. */
export const START = 8 * 60 + 30;
export const LENGTH = 240;
export const clockAt = (minute: number) => fromMin(START + Math.max(0, Math.min(LENGTH, Math.floor(minute))));
export const minuteOf = (time: string) => toMin(time) - START;

/* ── where things live ──────────────────────────────────────────────── */

export const DELIVERIES: Path = ["Operations Team", "Documents", "Deliveries"];
export const D2026: Path = [...DELIVERIES, "2026"];
export const D2025: Path = [...DELIVERIES, "2025"];
export const ORDERS: Path = ["Operations Team", "Documents", "Orders"];
export const ORDERS_2026: Path = [...ORDERS, "2026"];
export const MY_DOCS: Path = ["OneDrive", "Documents"];
export { APPROVED, TO_APPROVE };
export const MAIL_FOLDERS = ["Customers", "Deliveries", "Invoices", "HR"];

/* ── the paperwork ──────────────────────────────────────────────────── */

const WRAP = { code: "PW-400", item: "Pallet wrap, 400 mm clear (36 rolls)", unit: "pallet", price: 48 };
const FLOUR = { code: "FL-25P", item: "Plain flour, 25 kg sack", unit: "sack", price: 14.2 };
const CUPS = { code: "PC-500", item: "Paper cups, 8 oz (case of 500)", unit: "case", price: 18 };
const footer = "Goods received in good condition unless noted above. Please count before you sign.";

/* This morning's three delivery notes (08:30, from Sarah). */
export const DN_77851: BizDoc = { kind: "delivery", number: "DN-77851", date: TODAY, from: HARLOW, to: NORTHFIELD, shipTo: GOODS_IN, refs: [["Your order", "PO 3318"], ["Driver", "K. Moss"]], lines: [{ ...WRAP, qty: 10, delivered: 10 }], signed: "Sarah Patel", signedRole: "Goods in", note: "All 10 in. SP", footer };
export const DN_40944: BizDoc = { kind: "delivery", number: "DN-40944", date: TODAY, from: KENT_FLOUR, to: NORTHFIELD, shipTo: GOODS_IN, refs: [["Your order", "PO 3320"], ["Driver", "R. Patel"]], lines: [{ ...FLOUR, qty: 40, delivered: 40 }], signed: "Sarah Patel", signedRole: "Goods in", note: "All 40 in. SP", footer };
export const DN_11671: BizDoc = { kind: "delivery", number: "DN-11671", date: TODAY, from: BRIGHTWATER, to: NORTHFIELD, shipTo: GOODS_IN, refs: [["Your order", "PO 3321"], ["Driver", "J. Wood"]], lines: [{ ...CUPS, qty: 30, delivered: 27 }], signed: "Sarah Patel", signedRole: "Goods in", note: "Only 27 on the van. 3 short. SP", footer };

/* What a correct report row says for each of them. */
export interface TodayDelivery {
  dn: string;
  supplier: string;
  item: string;
  expected: number;
  received: number;
  supplierKey: RegExp;
  itemKey: RegExp;
}
export const TODAYS: TodayDelivery[] = [
  { dn: "DN-77851", supplier: "Harlow Packaging", item: "Pallet wrap", expected: 10, received: 10, supplierKey: /harlow/i, itemKey: /wrap/i },
  { dn: "DN-40944", supplier: "Kent Flour Mills", item: "Plain flour 25kg", expected: 40, received: 40, supplierKey: /kent/i, itemKey: /flour/i },
  { dn: "DN-11671", supplier: "Brightwater Cups", item: "Paper cups (case of 500)", expected: 30, received: 27, supplierKey: /brightwater/i, itemKey: /cup/i },
];

/* Kent Flour's invoice KF-1180 (09:25, from Priya), and the purchase order
 * and delivery note it must match. This one is right: 40 sacks ordered, 40
 * delivered, 40 billed at the PO price. Flour carries no VAT. */
export const PO_3312: BizDoc = {
  kind: "po",
  number: "3312",
  date: "04/11/2026",
  from: NORTHFIELD,
  to: KENT_FLOUR,
  shipTo: GOODS_IN,
  refs: [
    ["Ordered by", "Sarah Patel"],
    ["Deliver by", "10/11/2026"],
  ],
  lines: [{ ...FLOUR, qty: 40 }],
  signed: "Daniel Okafor",
  signedRole: "Office Manager",
  footer: PO_3307.footer,
};
export const DN_40915: BizDoc = { kind: "delivery", number: "DN-40915", date: "10/11/2026", from: KENT_FLOUR, to: NORTHFIELD, shipTo: GOODS_IN, refs: [["Your order", "PO 3312"], ["Driver", "R. Patel"]], lines: [{ ...FLOUR, qty: 40, delivered: 40 }], signed: "Sarah Patel", signedRole: "Goods in", note: "All 40 in. SP", footer };
export const INVOICE_KF1180: BizDoc = {
  kind: "invoice",
  number: "KF-1180",
  date: "13/11/2026",
  from: KENT_FLOUR,
  to: NORTHFIELD_ACCOUNTS,
  shipTo: GOODS_IN,
  refs: [
    ["Your order", "PO 3312"],
    ["Delivery note", "DN-40915"],
    ["Account", "NORTH2"],
  ],
  lines: [{ ...FLOUR, qty: 40 }],
  vatRate: 0,
  bank: { name: "Kent Flour Mills", sortCode: "60-17-42", account: "55120384" },
  terms: "28 days from the invoice date.",
  due: "11/12/2026",
  footer: "Flour is zero-rated for VAT.",
};
/* Last Friday's Harlow delivery, scanned and left loose as scan004.pdf. */
export const DN_77836: BizDoc = { kind: "delivery", number: "DN-77836", date: "13/11/2026", from: HARLOW, to: NORTHFIELD, shipTo: GOODS_IN, refs: [["Your order", "PO 3314"], ["Driver", "K. Moss"]], lines: [{ ...WRAP, qty: 10, delivered: 10 }], signed: "Daniel Okafor", signedRole: "Goods in", note: "All in. DO", footer };

/* ── the sheets ─────────────────────────────────────────────────────── */

export const REPORT_HEAD = ["Date", "Delivery note", "Supplier", "Item", "Expected", "Received", "Short by", "Checked by"];
export const REPORT_WIDTHS = [104, 116, 156, 184, 84, 84, 84, 104];

/* A delivery report: one row per delivery, Short by worked out. */
export function report(rows: string[][], total = 30): Grid {
  const g: Grid = [REPORT_HEAD, ...rows.map((r, i) => [...r.slice(0, 6), `=E${i + 2}-F${i + 2}`, r[6] ?? "SP"])];
  while (g.length < total) g.push(Array(REPORT_HEAD.length).fill(""));
  return g;
}

/* Last week's deliveries, Monday 9 to Friday 13 November: the daily
 * reports and the weekly log are both drawn from these, so they agree.
 * Four came in short. */
export const LAST_WEEK: [string, string, string, string, number, number, string][] = [
  ["09/11/2026", "DN-40877", "Kent Flour Mills", "Plain flour 25kg", 40, 40, "DO"],
  ["09/11/2026", "DN-77790", "Harlow Packaging", "Pallet wrap", 8, 8, "DO"],
  ["09/11/2026", "DN-11618", "Brightwater Cups", "Paper cups (case of 500)", 25, 25, "DO"],
  ["10/11/2026", "DN-77812", "Harlow Packaging", "Pallet wrap", 12, 10, "SP"],
  ["10/11/2026", "DN-40915", "Kent Flour Mills", "Plain flour 25kg", 40, 40, "SP"],
  ["10/11/2026", "DN-11630", "Brightwater Cups", "Paper cups (case of 500)", 30, 30, "SP"],
  ["11/11/2026", "DN-11641", "Brightwater Cups", "Lids (case of 500)", 20, 18, "SP"],
  ["11/11/2026", "DN-40922", "Kent Flour Mills", "Plain flour 25kg", 30, 30, "SP"],
  ["12/11/2026", "DN-77829", "Harlow Packaging", "Cardboard boxes, large", 150, 150, "SP"],
  ["12/11/2026", "DN-40926", "Kent Flour Mills", "Plain flour 25kg", 20, 17, "SP"],
  ["13/11/2026", "DN-77836", "Harlow Packaging", "Pallet wrap", 10, 10, "DO"],
  ["13/11/2026", "DN-11652", "Brightwater Cups", "Paper cups (case of 500)", 30, 26, "DO"],
];
export const SHORT_LAST_WEEK = LAST_WEEK.filter((r) => r[5] < r[4]).length; // 4
const rowsOn = (date: string) => LAST_WEEK.filter((r) => r[0] === date).map((r) => [r[0], r[1], r[2], r[3], String(r[4]), String(r[5]), r[6]]);

export const LOG_ID = "mm-log";
export const LOG_NAME = "2026-11-13 Weekly delivery log.xlsx";
function weeklyLog(): Grid {
  const rows = LAST_WEEK.map((r, i) => [r[0], r[1], r[2], r[3], String(r[4]), String(r[5]), `=E${i + 2}-F${i + 2}`, r[5] < r[4] ? "Short" : "Complete"]);
  return pad([[...REPORT_HEAD.slice(0, 7), "Status"], ...rows], 8, 22);
}

/* The overtime sheet: the learner made it from last week's timesheets.
 * Names, staff numbers and pay: personal data, for HR only. */
export const OVERTIME_ID = "mm-overtime";
export const OVERTIME_FILE = "2026-11-13 Overtime week of 9 November.xlsx";
export const OVERTIME_STAFF: [string, string, string, number, number][] = [
  ["Sarah Patel", "NS-0412", "Warehouse", 4.5, 18.45],
  ["Kieran Doyle", "NS-0418", "Warehouse", 7, 16.2],
  ["Hannah Price", "NS-0423", "Warehouse", 3, 16.2],
  ["Marek Nowak", "NS-0427", "Drivers", 8.5, 17.1],
  ["Ruth Adeyemi", "NS-0431", "Drivers", 6, 17.1],
];
export const OVERTIME_HOURS = OVERTIME_STAFF.reduce((t, r) => t + r[3], 0); // 29
function overtimeSheet(): Grid {
  const rows = OVERTIME_STAFF.map((r, i) => [r[0], r[1], r[2], String(r[3]), r[4].toFixed(2), `=D${i + 2}*E${i + 2}`]);
  return pad([["Name", "Staff no", "Team", "Overtime hours", "Rate (£ an hour)", "Overtime pay"], ...rows], 6, 16);
}

/* The price list the quote comes from. Prices are before VAT. */
export const CUP_PRICE = 18;
export const QUOTE_CASES = 15;
export const QUOTE = { net: 270, vat: 54, gross: 324 };
function priceList(): Grid {
  return pad(
    [
      ["Item", "Sold by", "Price before VAT"],
      ["Paper cups, 8 oz", "Case of 500", "£18.00"],
      ["Paper cups, 12 oz", "Case of 500", "£21.50"],
      ["Lids, 8 oz", "Case of 500", "£11.40"],
      ["Napkins", "Pack of 500", "£3.25"],
      ["Paper bags, small", "Pack of 250", "£6.75"],
      ["Glass cloths", "Each", "£1.80"],
      ["Pallet wrap, 400 mm", "Roll", "£4.50"],
      ["Labels", "Roll of 1000", "£9.99"],
      [],
      ["All prices are before VAT. Add VAT at 20%.", "", ""],
    ],
    3,
    18,
  );
}

export const QUOTE_TEMPLATE = (): Grid =>
  pad(
    [
      ["Northfield Supplies: quote", "", "", ""],
      ["Customer", "", "", ""],
      ["Date", "", "", ""],
      [],
      ["Item", "Qty", "Unit price", "Net"],
      ["", "", "", ""],
      [],
      ["", "", "Net", ""],
      ["", "", "VAT at 20%", ""],
      ["", "", "Total with VAT", ""],
    ],
    4,
    16,
  );
const QUOTE_WIDTHS = [220, 70, 130, 110];
function filledQuote(customer: string, date: string, item: string, qty: string, price: string): Grid {
  const g = QUOTE_TEMPLATE();
  g[1][1] = customer;
  g[2][1] = date;
  g[5] = [item, qty, price, "=B6*C6"];
  g[7][3] = "=D6";
  g[8][3] = "=D8*0.2";
  g[9][3] = "=D8+D9";
  return g;
}

/* ── the 2026 deliveries folder, as Sarah left it ───────────────────── */

/* A loose file Sarah asks to have tidied at 11:30: what it is called now,
 * where it belongs and a good name for it. */
export interface Loose {
  id: string;
  name: string;
  year: "2025" | "2026";
  date: string;
  says: RegExp;
  example: string;
}
export const LOOSE: Loose[] = [
  { id: "mm-12nov", name: "Delivery report 12th Nov.xlsx", year: "2026", date: "2026-11-12", says: /deliver|report/i, example: "2026-11-12 Delivery report.xlsx" },
  { id: "mm-final", name: "report final v2.xlsx", year: "2026", date: "2026-11-13", says: /deliver|report/i, example: "2026-11-13 Delivery report.xlsx" },
  { id: "mm-copy", name: "Copy of report final v2.xlsx", year: "2026", date: "2026-11-13", says: /deliver|report/i, example: "2026-11-13 Delivery report.xlsx" },
  { id: "mm-scan", name: "scan004.pdf", year: "2026", date: "2026-11-13", says: /delivery note|DN-?77836|harlow/i, example: "2026-11-13 Delivery note DN-77836.pdf" },
  { id: "mm-1812", name: "2025-12-18 Delivery report.xlsx", year: "2025", date: "2025-12-18", says: /deliver|report/i, example: "2025-12-18 Delivery report.xlsx" },
  { id: "mm-2212", name: "DR 22.12.25 SP.xlsx", year: "2025", date: "2025-12-22", says: /deliver|report/i, example: "2025-12-22 Delivery report.xlsx" },
];
/* The same report twice: one must go, one must stay. */
export const PAIR = ["mm-final", "mm-copy"];
/* Filed the house way already: these must stay, where they are. */
export const FILED_IDS = ["mm-r09", "mm-r10", "mm-r11", "mm-dn40915", LOG_ID, "mm-2025-a"];
export const DN_40915_NAME = "2026-11-10 Delivery note DN-40915.pdf";

function deliveryFiles(): OfficeFile[] {
  const xl = (id: string, name: string, path: Path, rows: string[][], modified: string, by: string, editable = false): OfficeFile => ({ id, path, name, kind: "xlsx", modified, by, sheet: report(rows, 20), widths: REPORT_WIDTHS, seeded: true, editable: editable || undefined });
  const r13 = rowsOn("13/11/2026");
  return [
    { id: "mm-template", path: DELIVERIES, name: "Delivery report template.xltx", kind: "xltx", modified: "14/01/2026", by: "Sarah Patel", sheet: report([]), widths: REPORT_WIDTHS, seeded: true },
    xl("mm-r09", "2026-11-09 Delivery report.xlsx", D2026, rowsOn("09/11/2026"), "09/11/2026", "Daniel Okafor"),
    xl("mm-r10", "2026-11-10 Delivery report.xlsx", D2026, rowsOn("10/11/2026"), "10/11/2026", "You"),
    xl("mm-r11", "2026-11-11 Delivery report.xlsx", D2026, rowsOn("11/11/2026"), "11/11/2026", "Sarah Patel"),
    pdfFile("mm-dn40915", D2026, DN_40915_NAME, DN_40915, "10/11/2026", "Sarah Patel"),
    xl("mm-12nov", "Delivery report 12th Nov.xlsx", D2026, rowsOn("12/11/2026"), "12/11/2026 16:02", "Sarah Patel", true),
    xl("mm-final", "report final v2.xlsx", D2026, r13, "13/11/2026 15:12", "Daniel Okafor", true),
    xl("mm-copy", "Copy of report final v2.xlsx", D2026, r13, "13/11/2026 15:40", "Daniel Okafor", true),
    { ...pdfFile("mm-scan", D2026, "scan004.pdf", DN_77836, "13/11/2026 16:20", "Daniel Okafor"), editable: true },
    xl("mm-1812", "2025-12-18 Delivery report.xlsx", D2026, [["18/12/2025", "DN-40512", "Kent Flour Mills", "Plain flour 25kg", "60", "60", "SP"]], "18/12/2025", "Sarah Patel", true),
    xl("mm-2212", "DR 22.12.25 SP.xlsx", D2026, [["22/12/2025", "DN-77650", "Harlow Packaging", "Cardboard boxes, large", "200", "200", "SP"]], "22/12/2025 12:14", "Sarah Patel", true),
    xl("mm-2025-a", "2025-12-15 Delivery report.xlsx", D2025, [["15/12/2025", "DN-11498", "Brightwater Cups", "Paper cups (case of 500)", "40", "40", "SP"]], "15/12/2025", "Sarah Patel"),
    { id: LOG_ID, path: D2026, name: LOG_NAME, kind: "xlsx", modified: "13/11/2026 17:05", by: "Sarah Patel", sheet: weeklyLog(), widths: [104, 116, 156, 184, 84, 84, 84, 100], seeded: true },
  ];
}

/* ── the office at 08:30 ────────────────────────────────────────────── */

export const RITA_NUMBER = "0116 496 0519";
export const KF1180_ID = "mm-inv-kf1180";
export const KF1180_NAME = "2026-11-13 Kent Flour invoice KF-1180.pdf";
export const HP2291_ID = "mm-inv-hp2291";
export const TEMPLATE_ID = "mm-quote-template";

function files(): OfficeFile[] {
  return [
    ...officeFolders(),
    ...deliveryFiles(),
    { id: "mm-prices", path: ORDERS, name: "2026-11-02 Price list.xlsx", kind: "xlsx", modified: "02/11/2026", by: "Priya Shah", sheet: priceList(), widths: [190, 130, 140], seeded: true },
    { id: TEMPLATE_ID, path: ORDERS, name: "Quote template.xltx", kind: "xltx", modified: "12/02/2026", by: "Priya Shah", sheet: QUOTE_TEMPLATE(), widths: QUOTE_WIDTHS, seeded: true },
    { id: "mm-quote-kent", path: ORDERS_2026, name: "2026-11-03 Quote Kent Bakery.xlsx", kind: "xlsx", modified: "03/11/2026", by: "Priya Shah", sheet: filledQuote("Kent Bakery", "03/11/2026", "Flour 25kg", "20", "£16.50"), widths: QUOTE_WIDTHS, seeded: true },
    { id: "mm-quote-bright", path: ORDERS_2026, name: "2026-11-10 Quote Bright Cafe.xlsx", kind: "xlsx", modified: "10/11/2026", by: "You", sheet: filledQuote("Bright Cafe", "10/11/2026", "Lids (500)", "20", "£11.40"), widths: QUOTE_WIDTHS, seeded: true },
    pdfFile("mm-po-3312", ORDERS_2026, "2026-11-04 Purchase order 3312 Kent Flour.pdf", PO_3312, "04/11/2026", "Sarah Patel"),
    pdfFile("mm-po-3307", ORDERS_2026, "2026-11-02 Purchase order 3307 Harlow.pdf", PO_3307, "02/11/2026", "Sarah Patel"),
    { ...pdfFile(HP2291_ID, TO_APPROVE, "2026-11-10 Harlow invoice HP-2291.pdf", INVOICE_HP2291, "10/11/2026", "Priya Shah"), editable: true },
    pdfFile("mm-inv-kf1175", APPROVED, "2026-11-09 Kent Flour invoice KF-1175.pdf", INVOICE_KF1175, "09/11/2026", "Priya Shah"),
    pdfFile("mm-inv-bw5520", APPROVED, "2026-11-03 Brightwater invoice BW-5520.pdf", INVOICE_BW5520, "05/11/2026", "Priya Shah"),
    { id: OVERTIME_ID, path: MY_DOCS, name: OVERTIME_FILE, kind: "xlsx", modified: "13/11/2026 16:48", by: "You", sheet: overtimeSheet(), widths: [140, 90, 110, 120, 130, 120], seeded: true, editable: true },
    { id: "mm-notes", path: MY_DOCS, name: "2026-11-09 Induction notes.pdf", kind: "pdf", modified: "09/11/2026", by: "You", seeded: true, editable: true },
  ];
}

function olderMail(): Email[] {
  return [
    inbound({
      id: "mm-daniel-monday",
      from: PEOPLE.daniel,
      subject: "Monday morning",
      time: "Fri 16:52",
      unread: false,
      body: `Hi,\n\nThanks for a great first week. A heads up for Monday: Sarah is on the warehouse floor most of the morning, Priya is doing a payment run, and I'm in and out of calls. So things will land on your desk as they come in.\n\nNobody will tell you which job to do first. Read each one as it arrives, work out what matters most, and get on with it. Shout if you're stuck.\n\nHave a good weekend,\nDaniel\n\n${SIGNATURE.daniel}`,
    }),
    inbound({
      id: "mm-priya-hold",
      from: PEOPLE.priya,
      subject: "HP-2291 is on hold",
      time: "Thu 14:05",
      unread: false,
      body: `Hi,\n\nThanks for spotting that Harlow's HP-2291 was 2 pallets short. I've left it in To approve until their credit note comes in, so please don't approve it.\n\nThanks,\nPriya\n\n${PRIYA_SIGNATURE}`,
    }),
    inbound({
      id: "mm-tom-hp2291",
      from: PEOPLE.tom,
      subject: "Invoice HP-2291",
      time: "Tue 10 Nov",
      unread: false,
      body: `Hi,\n\nPlease find invoice HP-2291 attached for PO 3307, 12 pallets of wrap. Payment is due within 30 days, by 10 December.\n\nKind regards,\nTom\n\nTom Hale\nAccount Manager | Harlow Packaging\nDirect line ${TOM_NUMBER}\ntom.hale@harlowpackaging.example`,
      attachments: [{ name: "HP-2291.pdf", paper: paperOf(INVOICE_HP2291) }],
    }),
    inbound({
      id: "mm-facilities",
      from: PEOPLE.facilities,
      subject: "Window cleaners on Tuesday",
      time: "Fri 11:20",
      unread: false,
      body: "Hello all,\n\nThe window cleaners are in on Tuesday 17 November from 07:30. Please clear your windowsills on Monday evening.\n\nThanks,\nFacilities Team",
    }),
  ];
}

/* The learner's own week, Monday 16 to Friday 20 November. */
const WK = ["2026-11-16", "2026-11-17", "2026-11-18", "2026-11-19", "2026-11-20"];
function myDiary(): Meeting[] {
  const huddles: Meeting[] = WK.map((day, i) => ({ id: `seed-mm-huddle-${i}`, title: "Morning huddle", organiser: PEOPLE.daniel, attendees: [YOU, PEOPLE.sarah, PEOPLE.priya, PEOPLE.emma], place: "Office floor", teams: false, day, start: "09:00", end: "09:15", body: "Ten minutes, standing up: what's on today, and anything that's stuck.", response: "accepted" }));
  return [
    ...huddles,
    { id: "seed-mm-excel", title: "Excel refresher", organiser: PEOPLE.priya, attendees: [YOU], room: ROOMS[0], teams: false, day: WK[1], start: "10:00", end: "11:00", body: "Formulas, filters and saving to SharePoint.", response: "accepted" },
    { id: "seed-mm-harlow", title: "Supplier call: Harlow Packaging", organiser: PEOPLE.daniel, attendees: [YOU, PEOPLE.tom], teams: true, day: WK[2], start: "11:00", end: "12:00", body: "Credit note for HP-2291, and December's orders.", response: "accepted" },
    { id: "seed-mm-team", title: "Weekly team meeting", organiser: PEOPLE.daniel, attendees: [YOU, PEOPLE.sarah, PEOPLE.priya, PEOPLE.emma], room: ROOMS[1], teams: true, day: WK[3], start: "15:00", end: "16:00", body: "1. The week's deliveries\n2. The audit\n3. Anything else", response: "accepted" },
    { id: "seed-mm-121", title: "One-to-one with Daniel", organiser: PEOPLE.daniel, attendees: [YOU], room: ROOMS[0], teams: false, day: WK[4], start: "14:00", end: "14:30", body: "How your first fortnight has gone.", response: "accepted" },
  ];
}

/* Sarah's and Emma's week. The only 45 minutes all three of you have
 * free, in working hours, is Wednesday 18 November, 14:00 to 14:45. */
export const MEETING_SLOT = { day: WK[2], start: "14:00", end: "14:45" };
function busy(): Busy[] {
  const s = PEOPLE.sarah.address;
  const e = PEOPLE.emma.address;
  const out: Busy[] = [];
  for (const day of WK) {
    for (const who of [s, e]) {
      out.push({ who, day, start: "08:00", end: "09:00" }, { who, day, start: "17:30", end: "18:00" }, { who, day, start: "09:00", end: "09:15" });
    }
  }
  out.push(
    { who: s, day: WK[0], start: "09:15", end: "17:30" },
    { who: e, day: WK[1], start: "09:15", end: "17:30" },
    { who: s, day: WK[2], start: "09:15", end: "14:00" },
    { who: e, day: WK[2], start: "14:45", end: "17:30" },
    { who: e, day: WK[2], start: "10:00", end: "12:00" },
    { who: s, day: WK[3], start: "09:15", end: "12:30" },
    { who: e, day: WK[3], start: "12:00", end: "17:30" },
    { who: s, day: WK[4], start: "13:00", end: "17:30" },
    { who: e, day: WK[4], start: "09:15", end: "17:30" },
    { who: ROOMS[1].address, day: WK[2], start: "13:30", end: "15:30" },
    { who: ROOMS[2].address, day: WK[2], start: "14:00", end: "16:00" },
    { who: ROOMS[0].address, day: WK[3], start: "09:00", end: "12:00" },
  );
  return out;
}

const msg = (id: string, from: Person, time: string, text: string) => ({ id, from, time, text });
export const DANIEL_CHAT = "mm-chat-daniel";
function chats(): Chat[] {
  return [
    { id: DANIEL_CHAT, people: [PEOPLE.daniel], messages: [msg("mm-d1", PEOPLE.daniel, "Fri 16:40", "Good first week. Enjoy the weekend!"), msg("mm-d2", YOU, "Fri 16:44", "Thanks Daniel, see you Monday.")] },
    { id: "mm-chat-sarah", people: [PEOPLE.sarah], messages: [msg("mm-s1", PEOPLE.sarah, "Fri 15:10", "I'm on the floor most of Monday morning. Email me anything that needs a record, and I'll pick it up on my phone.")] },
    { id: "mm-chat-priya", people: [PEOPLE.priya], messages: [msg("mm-p1", PEOPLE.priya, "Thu 14:07", "If anything ever looks odd about a supplier payment, tell me before I pay it. Ext 405 or here.")] },
    { id: "mm-chat-emma", people: [PEOPLE.emma], messages: [msg("mm-e1", PEOPLE.emma, "Wed 12:30", "Welcome to Northfield! I'm in HR, shout if you need anything.")] },
  ];
}

export function seed(): OfficeState {
  return {
    version: 0,
    files: files(),
    emails: olderMail(),
    mailFolders: MAIL_FOLDERS,
    contacts: [EMMA_CLARKSON, IT_HELPDESK],
    phone: { calls: [{ id: "mm-call-sarah", name: "Sarah Patel", company: "Warehouse, ext 412", number: "Ext 412", time: "08:12", way: "in", seconds: 41 }], answered: [] },
    phoneBook: [...PHONE_BOOK, { name: "Rita Fenwick", company: "Oak Street Deli", role: "Manager", number: RITA_NUMBER, group: "Customers" }],
    dialable: [TOM_CALL, HARLOW_MAIN_CALL, SCAM_CALL, PRIYA_CALL],
    calendar: { today: DAY, meetings: myDiary(), busy: busy(), rooms: ROOMS },
    teams: { chats: chats(), windows: [] },
    morning: { minute: 0, started: false, paused: false, arrived: [], doneAt: {} },
  };
}

/* ── what arrives, and when ─────────────────────────────────────────── */

export const MAIL = {
  report: "mm-sarah-report",
  quote: "mm-bright-quote",
  invoice: "mm-priya-kf1180",
  overtime: "mm-emma-overtime",
  thanks: "mm-kent-thanks",
  short: "mm-daniel-short",
  tidy: "mm-sarah-tidy",
};
export const RITA_CALL_ID = "mm-call-rita";

export interface Arrival {
  id: string;
  /* Office minutes after 08:30. */
  at: number;
  how: "email" | "teams" | "phone";
  from: string;
  /* A few words for the panel and the toast. */
  what: string;
  land: (s: OfficeState, time: string) => OfficeState;
}

const addMail = (e: Email) => (s: OfficeState) => ({ ...s, emails: [e, ...s.emails] });
const mail = (e: Omit<Parameters<typeof inbound>[0], "time">) => (s: OfficeState, time: string) => addMail(inbound({ ...e, time }))(s);

export const RITA_CALL: PhoneCall = {
  id: RITA_CALL_ID,
  name: "Rita Fenwick",
  company: "Oak Street Deli",
  number: RITA_NUMBER,
  time: "09:50",
  way: "in",
  ringing: true,
  ...timed([
    { who: "you", text: "Good morning, Northfield Supplies, how can I help?" },
    { who: "them", text: "Morning, it's Rita Fenwick from Oak Street Deli. Is Sarah there, please?" },
    { who: "you", text: "She's out on the warehouse floor this morning. Can I take a message?" },
    { who: "them", text: "Please. We've got a delivery coming on Wednesday, order 4436. Could you add 10 packs of napkins to it? We've nearly run out." },
    { who: "you", text: "So that's 10 packs of napkins added to Wednesday's delivery, order 4436." },
    { who: "them", text: "That's it. Could Sarah ring me back to confirm before 12? I'm in the shop until then." },
    { who: "you", text: "Of course. What's the best number to call you on?" },
    { who: "them", text: "0116 496 0519." },
    { who: "you", text: "Let me read that back: 0116 496 0519. And it's Rita Fenwick, at Oak Street Deli." },
    { who: "them", text: "Perfect. Thanks very much. Bye now." },
  ]),
};

/* Nobody answered: after a few minutes the phone stops ringing and Rita
 * leaves a voicemail, which waits in the phone's call list. */
export const RING_FOR = 6;
export const RITA_VOICEMAIL: PhoneCall = {
  id: RITA_CALL_ID,
  name: "Rita Fenwick",
  company: "Oak Street Deli · left a voicemail",
  number: RITA_NUMBER,
  time: "09:50",
  way: "missed",
  ...timed([
    { who: "them", text: "Hello, it's Rita Fenwick from Oak Street Deli, for Sarah. We've got a delivery coming on Wednesday, order 4436. Could you add 10 packs of napkins to it, please? We've nearly run out." },
    { who: "them", text: "Could Sarah ring me back to confirm before 12? I'm in the shop until then. The number is 0116 496 0519. Again, that's 0116 496 0519. Thanks, bye now." },
  ]),
};

export const ARRIVALS: Arrival[] = [
  {
    id: "a-report",
    at: 0,
    how: "email",
    from: "Sarah Patel",
    what: "This morning's deliveries",
    land: mail({
      id: MAIL.report,
      from: PEOPLE.sarah,
      subject: "This morning's deliveries",
      body: `Morning,\n\nThree deliveries in already. The delivery notes are attached.\n\nCan you put them in today's delivery report, from the template in Deliveries, saved in the 2026 folder and named like the others? Send me a link when it's there. I need it by 09:30 for the warehouse stand-up.\n\nThanks,\nSarah\n\n${SIGNATURE.sarah}`,
      attachments: [DN_77851, DN_40944, DN_11671].map((d) => ({ name: `${d.number}.pdf`, paper: paperOf(d) })),
    }),
  },
  {
    id: "a-scam",
    at: minuteOf("08:40"),
    how: "email",
    from: "Harlow Packaging Accounts",
    what: "URGENT: new bank details",
    land: (s, time) => addMail({ ...scamEmail(), time })(s),
  },
  {
    id: "a-meeting",
    at: minuteOf("08:55"),
    how: "teams",
    from: "Daniel Okafor",
    what: "A meeting to book",
    land: (s, time) => {
      const t = s.teams ?? { chats: [], windows: [] };
      const text = "Morning! Could you book 45 minutes with Sarah and Emma this week, to plan the Christmas cover rota? A room or Teams, whichever's free. I'd like it in the diary before my 11:00 call, please.";
      return { ...s, teams: { ...t, chats: t.chats.map((c) => (c.id === DANIEL_CHAT ? { ...c, unread: (c.unread ?? 0) + 1, messages: [...c.messages, msg("mm-d3", PEOPLE.daniel, time, text)] } : c)) } };
    },
  },
  {
    id: "a-quote",
    at: minuteOf("09:10"),
    how: "email",
    from: "Emma Clarkson, Bright Cafe",
    what: "Price for cups, please",
    land: mail({
      id: MAIL.quote,
      from: EMMA_CLARKSON,
      subject: "Price for cups, please",
      body: "Hi,\n\nCould you send us a price for 15 cases of the 8 oz paper cups, including VAT? We put our weekly order in at 12, so before then would be lovely.\n\nMany thanks,\nEmma Clarkson\nBright Cafe, 22 Granby Street, Leicester",
    }),
  },
  {
    id: "a-invoice",
    at: minuteOf("09:25"),
    how: "email",
    from: "Priya Shah",
    what: "Invoice KF-1180: OK to pay?",
    land: (s, time) =>
      mail({
        id: MAIL.invoice,
        from: PEOPLE.priya,
        subject: "Invoice KF-1180: OK to pay?",
        body: `Hi,\n\nKent Flour's invoice KF-1180 is in Finance > Invoices > To approve. Could you check it against the purchase order and the delivery note? If it all matches, move it to Approved. I'm doing the payment run at 11.\n\nThanks,\nPriya\n\n${PRIYA_SIGNATURE}`,
        links: [{ name: KF1180_NAME, path: TO_APPROVE, fileName: KF1180_NAME }],
      })({ ...s, files: [...s.files, { ...pdfFile(KF1180_ID, TO_APPROVE, KF1180_NAME, INVOICE_KF1180, `Today ${time}`, "Priya Shah"), editable: true }] }, time),
  },
  {
    id: "a-phone",
    at: minuteOf("09:50"),
    how: "phone",
    from: "Oak Street Deli",
    what: "The phone is ringing",
    land: (s, time) => ({ ...s, phone: { calls: [{ ...RITA_CALL, time }, ...(s.phone?.calls ?? [])], answered: s.phone?.answered ?? [] } }),
  },
  {
    id: "a-overtime",
    at: minuteOf("10:15"),
    how: "email",
    from: "Emma Clarke",
    what: "Last week's overtime",
    land: mail({
      id: MAIL.overtime,
      from: PEOPLE.emma,
      subject: "Last week's overtime",
      body: "Hi,\n\nCould you send me last week's overtime figures, with the total hours at the bottom? I need them for payroll by 11:30.\n\nThanks,\nEmma\n\nEmma Clarke\nHR Advisor | Northfield Supplies",
    }),
  },
  {
    id: "a-thanks",
    at: minuteOf("10:40"),
    how: "email",
    from: "Imran Ahmed, Kent Bakery",
    what: "Thank you for sorting Thursday",
    land: mail({
      id: MAIL.thanks,
      from: PEOPLE.imran,
      cc: KENT_STAFF,
      subject: "Thank you for sorting Thursday",
      body: "Hi all,\n\nJust a quick note to say thank you for sorting out Thursday's extra flour at such short notice. The wedding order went out on time and the couple were thrilled.\n\nI've copied in the team, so they know who to thank.\n\nBest wishes,\nImran Ahmed\nKent Bakery",
    }),
  },
  {
    id: "a-short",
    at: minuteOf("11:05"),
    how: "email",
    from: "Daniel Okafor",
    what: "Short deliveries last week",
    land: mail({
      id: MAIL.short,
      from: PEOPLE.daniel,
      subject: "Short deliveries last week",
      body: `Hi,\n\nHow many deliveries came in short last week? I'm on a call with our suppliers at 12.\n\nThe weekly log is in Deliveries > 2026. Please count them in the log, so the number updates if Sarah adds a late note, and give me the number in the first line of your reply. One line is fine.\n\nThanks,\nDaniel\n\n${SIGNATURE.daniel}`,
    }),
  },
  {
    id: "a-tidy",
    at: minuteOf("11:30"),
    how: "email",
    from: "Sarah Patel",
    what: "Tidy the 2026 deliveries folder",
    land: mail({
      id: MAIL.tidy,
      from: PEOPLE.sarah,
      subject: "Tidy the 2026 deliveries folder before the audit",
      body: `Hi,\n\nThe auditors are in this afternoon, and they'll look through Deliveries > 2026. It's got messy. Can you tidy it before lunch?\n\nName everything the house way, put anything from last year in the 2025 folder, and delete any duplicates. Don't bin anything else, though: they'll want to see it all.\n\nThanks,\nSarah\n\n${SIGNATURE.sarah}`,
    }),
  },
];
