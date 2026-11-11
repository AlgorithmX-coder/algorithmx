import type { BizDoc, CourierAddress, DocParty, Grid, Paper, PhoneCall } from "./types";

/* Module 10: Admin in practice. The paperwork, people and places that the
 * lessons and the office jobs share, so a purchase order in a lesson is
 * the same page the learner later checks in the office. Every company,
 * number and address is invented; phone numbers sit in Ofcom's drama
 * ranges and email addresses end .example. */

export const NORTHFIELD: DocParty = { name: "Northfield Supplies", lines: ["Unit 2, Abbey Trade Park", "Leicester LE4 5AQ"], phone: "01632 960 400", email: "accounts@northfieldsupplies.example" };
export const NORTHFIELD_ACCOUNTS: DocParty = { name: "Northfield Supplies", lines: ["Accounts payable", "Unit 2, Abbey Trade Park", "Leicester LE4 5AQ"] };
export const GOODS_IN: DocParty = { name: "Northfield Supplies, Goods in", lines: ["Unit 2, Abbey Trade Park", "Rear yard, gate B", "Leicester LE4 5AQ"] };
export const HARLOW: DocParty = { name: "Harlow Packaging Ltd", lines: ["Unit 9, Canal Business Park", "Leicester LE4 0XA"], phone: "01632 960 552", email: "accounts@harlowpackaging.example", vatNo: "GB 293 4471 58" };
export const KENT_FLOUR: DocParty = { name: "Kent Flour Mills", lines: ["Mill Lane, Ashford", "Kent TN24 8QH"], phone: "01632 960 870", email: "orders@kentflourmills.example", vatNo: "GB 418 2290 31" };
export const BRIGHTWATER: DocParty = { name: "Brightwater Cups Ltd", lines: ["14 Station Road", "Derby DE1 2QY"], phone: "01632 960 633", email: "accounts@brightwatercups.example", vatNo: "GB 377 1054 62" };

const WRAP = { code: "PW-400", item: "Pallet wrap, 400 mm clear (36 rolls)", unit: "pallet", price: 48 };

/* ── E10.1: PO 3307, delivery note DN-77812, invoice HP-2291 ─────────── */

export const PO_3307: BizDoc = {
  kind: "po",
  number: "3307",
  date: "02/11/2026",
  from: NORTHFIELD,
  to: HARLOW,
  shipTo: GOODS_IN,
  refs: [
    ["Ordered by", "Sarah Patel"],
    ["Deliver by", "10/11/2026"],
  ],
  lines: [{ ...WRAP, qty: 12 }],
  signed: "Daniel Okafor",
  signedRole: "Office Manager",
  footer: "Please quote our PO number on every delivery note and invoice. Goods in is open Monday to Friday, 07:00 to 15:00.",
};

export const DN_77812: BizDoc = {
  kind: "delivery",
  number: "DN-77812",
  date: "10/11/2026",
  from: HARLOW,
  to: NORTHFIELD,
  shipTo: GOODS_IN,
  refs: [
    ["Your order", "PO 3307"],
    ["Driver", "K. Moss"],
  ],
  lines: [{ ...WRAP, qty: 12, delivered: 10 }],
  signed: "Sarah Patel",
  signedRole: "Goods in",
  note: "Only 10 on the van. 2 short. SP",
  footer: "Goods received in good condition unless noted above. Please count before you sign.",
};

export const INVOICE_HP2291: BizDoc = {
  kind: "invoice",
  number: "HP-2291",
  date: "10/11/2026",
  from: HARLOW,
  to: NORTHFIELD_ACCOUNTS,
  shipTo: GOODS_IN,
  refs: [
    ["Your order", "PO 3307"],
    ["Delivery note", "DN-77812"],
    ["Account", "NOR014"],
  ],
  lines: [{ ...WRAP, qty: 12 }],
  vatRate: 0.2,
  bank: { name: "Harlow Packaging Ltd", sortCode: "30-94-57", account: "21748390" },
  terms: "30 days from the invoice date.",
  due: "10/12/2026",
  footer: "Harlow Packaging Ltd, registered in England no 08812345. Queries to accounts@harlowpackaging.example or 01632 960 552.",
};

/* What a supplier sends when they have charged for something that didn't
 * come: a credit note, taken off what we owe. */
export const CREDIT_HPC118: BizDoc = {
  kind: "credit",
  number: "HP-C118",
  date: "12/11/2026",
  from: HARLOW,
  to: NORTHFIELD_ACCOUNTS,
  refs: [
    ["Your order", "PO 3307"],
    ["Against invoice", "HP-2291"],
  ],
  lines: [{ ...WRAP, item: "Pallet wrap, 400 mm clear: not delivered on DN-77812", qty: 2 }],
  vatRate: 0.2,
  footer: "This credit will be taken off your account. No payment is due on this note.",
};

/* Others in the same folders, so the right ones have to be found. */
export const PO_3305: BizDoc = {
  kind: "po",
  number: "3305",
  date: "30/10/2026",
  from: NORTHFIELD,
  to: KENT_FLOUR,
  shipTo: GOODS_IN,
  refs: [
    ["Ordered by", "Sarah Patel"],
    ["Deliver by", "09/11/2026"],
  ],
  lines: [{ code: "FL-25P", item: "Plain flour, 25 kg sack", qty: 40, unit: "sack", price: 14.2 }],
  signed: "Daniel Okafor",
  signedRole: "Office Manager",
  footer: PO_3307.footer,
};

export const PO_3310: BizDoc = {
  kind: "po",
  number: "3310",
  date: "04/11/2026",
  from: NORTHFIELD,
  to: BRIGHTWATER,
  shipTo: GOODS_IN,
  refs: [
    ["Ordered by", "Priya Shah"],
    ["Deliver by", "12/11/2026"],
  ],
  lines: [{ code: "PC-500", item: "Paper cups, 8 oz (case of 500)", qty: 30, unit: "case", price: 18 }],
  signed: "Daniel Okafor",
  signedRole: "Office Manager",
  footer: PO_3307.footer,
};

export const DN_40877: BizDoc = {
  kind: "delivery",
  number: "DN-40877",
  date: "09/11/2026",
  from: KENT_FLOUR,
  to: NORTHFIELD,
  shipTo: GOODS_IN,
  refs: [
    ["Your order", "PO 3305"],
    ["Driver", "R. Patel"],
  ],
  lines: [{ code: "FL-25P", item: "Plain flour, 25 kg sack", qty: 40, delivered: 40 }],
  signed: "Daniel Okafor",
  signedRole: "Goods in",
  note: "All 40 in. DO",
  footer: DN_77812.footer,
};

/* Flour is food, so it carries no VAT. */
export const INVOICE_KF1175: BizDoc = {
  kind: "invoice",
  number: "KF-1175",
  date: "09/11/2026",
  from: KENT_FLOUR,
  to: NORTHFIELD_ACCOUNTS,
  shipTo: GOODS_IN,
  refs: [
    ["Your order", "PO 3305"],
    ["Delivery note", "DN-40877"],
    ["Account", "NORTH2"],
  ],
  lines: [{ code: "FL-25P", item: "Plain flour, 25 kg sack", qty: 40, unit: "sack", price: 14.2 }],
  vatRate: 0,
  bank: { name: "Kent Flour Mills", sortCode: "60-17-42", account: "55120384" },
  terms: "28 days from the invoice date.",
  due: "07/12/2026",
  footer: "Flour is zero-rated for VAT.",
};

export const INVOICE_BW5520: BizDoc = {
  kind: "invoice",
  number: "BW-5520",
  date: "03/11/2026",
  from: BRIGHTWATER,
  to: NORTHFIELD_ACCOUNTS,
  shipTo: GOODS_IN,
  refs: [
    ["Your order", "PO 3298"],
    ["Delivery note", "DN-11602"],
    ["Account", "NFS-77"],
  ],
  lines: [{ code: "PL-500", item: "Lids, 8 oz (case of 500)", qty: 20, unit: "case", price: 9.5 }],
  vatRate: 0.2,
  bank: { name: "Brightwater Cups Ltd", sortCode: "40-22-81", account: "70318826" },
  terms: "30 days from the invoice date.",
  due: "03/12/2026",
};

/* ── E10.2: the receipts on your phone ───────────────────────────────── */

export const TRAIN_RECEIPT: BizDoc = {
  kind: "receipt",
  number: "004417",
  date: "10/11/2026 07:52",
  from: { name: "Soar Valley Trains", lines: ["Leicester station", "Ticket office"] },
  to: { name: "", lines: [] },
  refs: [],
  lines: [],
  receipt: {
    title: "Anytime day return",
    lines: [
      ["Leicester to Nottingham", ""],
      ["Adult x 1", "£14.60"],
      ["VAT (zero rated)", "£0.00"],
    ],
    total: "£14.60",
    paid: "Paid by card, contactless",
  },
  footer: "Thank you for travelling with us",
};

export const COFFEE_RECEIPT: BizDoc = {
  kind: "receipt",
  number: "2207",
  date: "10/11/2026 07:41",
  from: { name: "The Platform Cafe", lines: ["Leicester station"] },
  to: { name: "", lines: [] },
  refs: [],
  lines: [],
  receipt: {
    title: "Takeaway",
    lines: [
      ["Flat white, regular", "£3.10"],
      ["VAT included", "£0.52"],
    ],
    total: "£3.10",
    paid: "Paid by card, contactless",
  },
  footer: "See you again soon",
};

/* ── E10.2: the HR forms, as Excel templates ─────────────────────────── */

export const TIMESHEET_WIDTHS = [150, 100, 80, 80, 104, 116, 96, 190];
export const TIMESHEET_TEMPLATE: Grid = pad(
  [
    ["Day", "Date", "Start", "Finish", "Lunch (hours)", "Hours worked", "Overtime", "Notes"],
    ["Monday", "09/11/2026"],
    ["Tuesday", "10/11/2026"],
    ["Wednesday", "11/11/2026"],
    ["Thursday", "12/11/2026"],
    ["Friday", "13/11/2026"],
    [],
    ["Total", "", "", "", "", "=SUM(F2:F6)", "=SUM(G2:G6)"],
    [],
    ["Name"],
    ["Week ending", "13/11/2026"],
    ["Normal day (hours)", "8"],
    ["Manager", "Daniel Okafor"],
  ],
  8,
  18,
);

export const CLAIM_WIDTHS = [150, 290, 110, 100];
export const CLAIM_TEMPLATE: Grid = pad(
  [
    ["Date", "What it was for", "Category", "Amount"],
    [],
    [],
    [],
    [],
    [],
    ["Total", "", "", "=SUM(D2:D6)"],
    [],
    ["Name"],
    ["Date of claim"],
    ["Approved by", "Daniel Okafor"],
    ["Categories", "Travel, Meals, Postage, Other"],
  ],
  4,
  18,
);

export function pad(rows: string[][], cols: number, total: number): Grid {
  const g = rows.map((r) => [...r, ...Array(Math.max(0, cols - r.length)).fill("")]);
  while (g.length < total) g.push(Array(cols).fill(""));
  return g;
}

/* ── E10.4 and the booking lesson: the courier account's address book ── */

export const ADDRESS_BOOK: CourierAddress[] = [
  { name: "Northfield Supplies, Reception", lines: ["Unit 2, Abbey Trade Park", "Front entrance", "Leicester"], postcode: "LE4 5AQ", contact: "Reception", phone: "01632 960 400" },
  { name: "Northfield Supplies, Goods in", lines: ["Unit 2, Abbey Trade Park", "Rear yard, gate B", "Leicester"], postcode: "LE4 5AQ", contact: "Sarah Patel", phone: "01632 960 412" },
  { name: "Brightwater Cups Ltd", lines: ["14 Station Road", "Derby"], postcode: "DE1 2QY", contact: "Returns desk", phone: "01632 960 633" },
  { name: "Bright Cafe", lines: ["22 Granby Street", "Leicester"], postcode: "LE1 6EJ", contact: "Jo Marsh", phone: "07700 900 318" },
  { name: "Harlow Packaging Ltd", lines: ["Unit 9, Canal Business Park", "Leicester"], postcode: "LE4 0XA", contact: "Tom Hale", phone: "01632 960 552" },
  { name: "Kent Flour Mills", lines: ["Mill Lane, Ashford", "Kent"], postcode: "TN24 8QH", contact: "Orders", phone: "01632 960 870" },
];

/* Fold a postcode or a phone number to compare: "de1 2qy" = "DE12QY". */
export const fold = (s: string) => s.toUpperCase().replace(/[^0-9A-Z]/g, "");

/* Is a booking's address this one? Matched on postcode and a word of the
 * name, so a typed-in address counts as much as one from the book. */
export const sameAddress = (a: CourierAddress | undefined, postcode: string, word: RegExp) => !!a && fold(a.postcode) === fold(postcode) && word.test([a.name, ...a.lines].join(" "));

/* ── a document's sums, and the plain Paper it also carries ─────────── */

export const money = (n: number) => `£${n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/* A document's sums, worked out from its lines, never typed in. */
export function totals(d: BizDoc) {
  const net = Math.round(d.lines.reduce((t, l) => t + l.qty * (l.price ?? 0), 0) * 100) / 100;
  const vat = Math.round(net * (d.vatRate ?? 0) * 100) / 100;
  return { net, vat, gross: Math.round((net + vat) * 100) / 100 };
}

export const TITLE: Record<BizDoc["kind"], string> = { po: "Purchase order", invoice: "Invoice", delivery: "Delivery note", receipt: "Receipt", credit: "Credit note" };

/* The plain Paper a document also carries, so anything that reads a
 * Paper (a check, an older viewer) still has the facts. */
export function paperOf(doc: BizDoc): Paper {
  const t = totals(doc);
  return {
    heading: TITLE[doc.kind],
    from: [doc.from.name, ...doc.from.lines],
    meta: [[`${TITLE[doc.kind]} no`, doc.number], ["Date", doc.date], ...doc.refs],
    table: {
      head: doc.kind === "delivery" ? ["Item", "Ordered", "Delivered"] : ["Item", "Qty", "Price", "Total"],
      rows: doc.lines.map((l) => (doc.kind === "delivery" ? [l.item, String(l.qty), String(l.delivered ?? l.qty)] : [l.item, String(l.qty), money(l.price ?? 0), money(l.qty * (l.price ?? 0))])),
    },
    note: doc.note,
    footer: doc.kind === "invoice" || doc.kind === "credit" ? `Net ${money(t.net)} · VAT ${money(t.vat)} · Total ${money(t.gross)}` : doc.footer,
    doc,
  };
}


/* ── a phone call's words, spread out in time ─────────────────────────── */

/* About how fast people talk, in letters a second. */
export const SPEED = 15;

/* Spread a conversation's lines out in time, each starting when the one
 * before has been said, with a short pause between. */
export function timed(lines: { who: "them" | "you"; text: string }[], pause = 0.8): { lines: NonNullable<PhoneCall["lines"]>; seconds: number } {
  let t = 1;
  const out = lines.map((l) => {
    const at = t;
    t += l.text.length / SPEED + pause;
    return { ...l, at: Math.round(at * 10) / 10 };
  });
  return { lines: out, seconds: Math.ceil(t) };
}


/* The claim's Amount column shows as money, D2 to D7, as the real form does. */
export const CLAIM_MONEY: Record<string, "money"> = { D2: "money", D3: "money", D4: "money", D5: "money", D6: "money", D7: "money" };
