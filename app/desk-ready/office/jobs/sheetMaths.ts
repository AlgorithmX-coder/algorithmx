import { numeric } from "../formula";
import { inbound, officeFolders, PEOPLE } from "../northfield";
import { pathText, samePath, tabsOf, type Check, type Grid, type Job, type OfficeFile, type OfficeState, type Person } from "../types";

/* The three Module 6 jobs (criteria XL-5, XL-6, XL-7, SP-6), in one file
 * because they share their sheet helpers:
 *
 * - E6.1 Make the sheet add up: line totals, then a total, an average
 *   order and an order count, all as formulas, saved, and Priya told.
 * - E6.2 A quote with VAT: from the quote template, saved as a new quote
 *   named like the others, and sent to the customer as an attachment
 *   (they are outside the company, so not a link).
 * - E6.3 Count the late ones: COUNTIF on October's log, saved where it
 *   lives, and the number sent to Daniel. */

const ORDERS_DIR = ["Operations Team", "Documents", "Orders", "2026"];
const DELIVERIES_DIR = ["Operations Team", "Documents", "Deliveries", "2026"];
const isFormula = (g: Grid | undefined, r: number, c: number) => (g?.[r]?.[c] ?? "").trim().startsWith("=");
const near = (a: number | null, b: number, tol = 0.005) => a !== null && Math.abs(a - b) < tol;
const pad = (rows: string[][], cols: number, total: number): Grid => {
  const g = rows.map((r) => [...r, ...Array(Math.max(0, cols - r.length)).fill("")]);
  while (g.length < total) g.push(Array(cols).fill(""));
  return g;
};
/* Every formula cell in a sheet, with what it works out. */
const formulaCells = (g: Grid) => g.flatMap((row, r) => row.map((v, c) => ({ r, c, v, n: isFormula(g, r, c) ? numeric(g, r, c) : null })).filter((x) => x.n !== null));
const sentTo = (s: OfficeState, p: Person) => s.emails.filter((e) => e.folder === "sent" && [...e.to, ...e.cc].some((x) => x.address === p.address));

/* ── E6.1 Make the sheet add up ─────────────────────────────────────── */

const ORDER_ROWS: string[][] = [
  ["4401", "03/11/2026", "Harlow Foods", "Pallet wrap", "12", "£4.50"],
  ["4402", "03/11/2026", "Bright Cafe", "Paper cups (500)", "6", "£18.00"],
  ["4403", "04/11/2026", "Kent Bakery", "Flour 25kg", "20", "£14.20"],
  ["4404", "04/11/2026", "Harlow Foods", "Labels (1000)", "3", "£9.99"],
  ["4405", "05/11/2026", "Oak Street Deli", "Napkins", "10", "£3.25"],
  ["4406", "05/11/2026", "Bright Cafe", "Lids (500)", "6", "£11.40"],
  ["4407", "06/11/2026", "Kent Bakery", "Sugar 25kg", "8", "£21.00"],
  ["4408", "06/11/2026", "Mill Lane Pub", "Glass cloths", "24", "£1.80"],
  ["4409", "07/11/2026", "Oak Street Deli", "Paper bags", "15", "£6.75"],
  ["4410", "07/11/2026", "Harlow Foods", "Pallet wrap", "10", "£4.50"],
];
const LINE_TOTALS = [54, 108, 284, 29.97, 32.5, 68.4, 168, 43.2, 101.25, 45];
const ORDERS_ID = "seed-orders-nov";

function seedTotals(): OfficeState {
  const grid = pad([["Order no", "Date", "Customer", "Item", "Qty", "Unit price", "Total", ""], ...ORDER_ROWS.map((r) => [...r, "", ""])], 8, 22);
  const files: OfficeFile[] = [...officeFolders(), { id: ORDERS_ID, path: ORDERS_DIR, name: "Orders November.xlsx", kind: "xlsx", modified: "07/11/2026", by: "Priya Shah", sheet: grid, widths: [80, 100, 140, 150, 60, 90, 100, 110], seeded: true }];
  return {
    version: 0,
    files,
    emails: [
      inbound({
        id: "m-priya-totals",
        from: PEOPLE.priya,
        subject: "November orders: can you add the totals?",
        time: "11:20",
        body: "Hi,\n\nCould you finish off the November orders sheet (Operations Team > Documents > Orders > 2026 > Orders November.xlsx)?\n\n1. Put each order's total in column G (quantity times unit price).\n2. Under the list, put the total of all orders, the average order and how many orders there were, each with a label beside it.\n\nUse formulas, please, so it all updates if an order changes. Save it, and send me the total.\n\nThanks,\nPriya",
      }),
    ],
  };
}

function checkTotals(s: OfficeState): Check[] {
  const file = s.files.find((f) => f.id === ORDERS_ID);
  const g = file ? tabsOf(file)[0]?.grid : undefined;
  const out: Check[] = [];
  const add = (c: Omit<Check, "ok" | "fix">, ok: boolean, fix?: string) => out.push({ ...c, ok, fix: ok ? undefined : fix });
  const badLine = LINE_TOTALS.findIndex((t, i) => !(isFormula(g, i + 1, 6) && near(numeric(g ?? [], i + 1, 6), t)));
  add(
    { id: "lines", code: "XL-5", group: "The sheet", label: "Every order has a total worked out by a formula" },
    !!g && badLine === -1,
    badLine < 0 ? "" : !isFormula(g, badLine + 1, 6) ? `G${badLine + 2} has no formula. Type =E${badLine + 2}*F${badLine + 2}, or put =E2*F2 in G2 and use Fill down.` : `G${badLine + 2} works out ${numeric(g ?? [], badLine + 1, 6)}, but should be ${LINE_TOTALS[badLine]}. It should be quantity times unit price for its own row.`,
  );
  const below = g ? formulaCells(g).filter((x) => x.r >= 11) : [];
  const find = (want: number, fn: RegExp, tol?: number) => below.find((x) => fn.test(x.v) && near(x.n, want, tol));
  const total = find(934.32, /SUM/i);
  const avg = find(93.432, /AVERAGE/i, 0.01);
  const count = find(10, /COUNT/i);
  add({ id: "total", code: "XL-5", group: "The sheet", label: "A SUM under the list gives the total: £934.32" }, !!total, below.some((x) => near(x.n, 934.32)) ? "That total is right, but use =SUM(G2:G11), so it's clear what it adds up." : "Under the list, type =SUM(G2:G11).");
  add({ id: "average", code: "XL-5", group: "The sheet", label: "An AVERAGE gives the average order: £93.43" }, !!avg, "Under the total, type =AVERAGE(G2:G11).");
  add({ id: "count", code: "XL-5", group: "The sheet", label: "A COUNT gives how many orders: 10" }, !!count, "Under the average, type =COUNT(G2:G11). It counts the totals, so it counts the orders.");
  const labelled = [total, avg, count].every((x) => !x || (g?.[x.r]?.slice(0, x.c).some((v) => /[a-z]/i.test(v)) ?? false));
  add({ id: "labels", code: "XL-2", group: "The sheet", label: "Each result has a label beside it" }, !!(total && avg && count) && labelled, "Put a word to the left of each result, like Total, Average order and Orders, so Priya knows which is which.");
  add({ id: "saved", code: "WIN-4", group: "Sending it", label: "Saved into Priya's sheet, where it lives" }, !!file && file.by === "You", "Press Save in Excel, so Priya's file has your formulas.");
  const mail = sentTo(s, PEOPLE.priya).at(-1);
  add({ id: "told", code: "OL-4", group: "Sending it", label: "You sent Priya the total" }, !!mail && /934\.32/.test(mail.body), mail ? "Put the total in your email: £934.32." : "Reply to Priya with the total.");
  return out;
}

export const sheetTotals: Job = {
  id: "m6j1",
  slug: "order-totals",
  moduleId: "m6",
  moduleLabel: "Module 6: Making it do the maths",
  title: "Make the sheet add up",
  summary: "Priya needs November's orders totalled, with a grand total, an average and a count, all as formulas.",
  clock: "11:22",
  deadline: "Priya wants it before lunch",
  doneLine: "Every total is a formula, the summary is labelled, and Priya has her number. Change an order and it all still adds up.",
  brief: "Priya has asked you to finish the November orders sheet. Read her email and do it. When you think it's done, press Check my work.",
  hints: [
    "Open Orders November.xlsx from Operations Team > Documents > Orders > 2026.",
    "In G2 type =E2*F2. Then, with G2 selected, press ⇩ Fill down.",
    "Under the list, put Total, Average order and Orders in column F, with =SUM(G2:G11), =AVERAGE(G2:G11) and =COUNT(G2:G11) beside them in G.",
    "Save, then reply to Priya with the total.",
  ],
  seed: seedTotals,
  check: checkTotals,
  habits: [
    { label: "Check your own work", checks: ["lines", "total", "average", "count", "labels"] },
    { label: "Close the loop", checks: ["saved", "told"] },
  ],
};

/* ── E6.2 A quote with VAT ──────────────────────────────────────────── */

const LEAH: Person = { name: "Leah Morgan", address: "leah@brightcafe.example" };
const QUOTE_NAME = "2026-11-10 Quote Bright Cafe.xlsx";
const QUOTE_TEMPLATE = (): Grid =>
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

function seedQuote(): OfficeState {
  const kent = QUOTE_TEMPLATE();
  kent[1][1] = "Kent Bakery";
  kent[2][1] = "03/11/2026";
  kent[5] = ["Flour 25kg", "20", "£14.20", "=B6*C6"];
  kent[7][3] = "=D6";
  kent[8][3] = "=D8*0.2";
  kent[9][3] = "=D8+D9";
  const files: OfficeFile[] = [
    ...officeFolders(),
    { id: "seed-quote-template", path: ["Operations Team", "Documents", "Orders"], name: "Quote template.xltx", kind: "xltx", modified: "12/02/2026", by: "Priya Shah", sheet: QUOTE_TEMPLATE(), widths: [220, 70, 130, 110], seeded: true },
    { id: "seed-quote-kent", path: ORDERS_DIR, name: "2026-11-03 Quote Kent Bakery.xlsx", kind: "xlsx", modified: "03/11/2026", by: "Priya Shah", sheet: kent, widths: [220, 70, 130, 110], seeded: true },
  ];
  return {
    version: 0,
    files,
    emails: [
      inbound({
        id: "m-priya-quote",
        from: PEOPLE.priya,
        subject: "Can you do the Bright Cafe quote?",
        time: "13:05",
        body: "Hi,\n\nBright Cafe have asked for a price (their email's in your inbox). Could you do the quote from the quote template in Orders, save it in Orders > 2026 named like the others, and send it to them?\n\nLids (500) are £11.40 a case before VAT.\n\nThanks,\nPriya",
      }),
      inbound({
        id: "m-leah",
        from: LEAH,
        subject: "Price for lids",
        time: "12:48",
        body: "Hi,\n\nCould we have a price for 20 cases of lids, including VAT? We'd like to order this week.\n\nThanks,\nLeah Morgan\nBright Cafe",
      }),
    ],
  };
}

function checkQuote(s: OfficeState): Check[] {
  const candidates = s.files.filter((f) => !f.seeded && f.kind === "xlsx" && f.sheet && formulaCells(f.sheet).some((x) => near(x.n, 228)));
  const quote = candidates.find((f) => samePath(f.path, ORDERS_DIR) && f.name.toLowerCase() === QUOTE_NAME.toLowerCase()) ?? candidates.find((f) => samePath(f.path, ORDERS_DIR)) ?? candidates[0];
  const g = quote?.sheet;
  const has = (want: number, fn?: RegExp) => !!g && formulaCells(g).some((x) => near(x.n, want) && (!fn || fn.test(x.v)));
  const out: Check[] = [];
  const add = (c: Omit<Check, "ok" | "fix">, ok: boolean, fix?: string) => out.push({ ...c, ok, fix: ok ? undefined : fix });
  add({ id: "net", code: "XL-5", group: "The quote", label: "The net price is worked out: 20 × £11.40 = £228.00" }, has(228), "Open the quote template. Put Lids (500), 20 and £11.40 in row 6, and =B6*C6 in D6. Save it first if you haven't.");
  add({ id: "vat", code: "XL-6", group: "The quote", label: "VAT at 20% is worked out: £45.60" }, has(45.6), "Put =D6 in D8 for the net, then =D8*0.2 in D9 for the VAT.");
  add({ id: "gross", code: "XL-6", group: "The quote", label: "The total with VAT is worked out: £273.60" }, has(273.6), "In D10, add the net and the VAT: =D8+D9.");
  add({ id: "customer", code: "XL-2", group: "The quote", label: "It says who it's for" }, !!g && /bright/i.test(g[1]?.[1] ?? ""), "Put Bright Cafe in B2, beside Customer.");
  add(
    { id: "where", code: "SP-4", group: "Saving it", label: `Saved as "${QUOTE_NAME}" in ${pathText(ORDERS_DIR)}` },
    !!quote && samePath(quote.path, ORDERS_DIR) && quote.name.toLowerCase() === QUOTE_NAME.toLowerCase(),
    !quote ? "Save the quote first: File > Save as." : `It's saved as ${pathText(quote.path)} > ${quote.name}. The other quote is named "2026-11-03 Quote Kent Bakery.xlsx", so this one is "${QUOTE_NAME}", in Orders > 2026.`,
  );
  const mail = sentTo(s, LEAH).at(-1);
  add({ id: "sent", code: "OL-5", group: "Sending it", label: "You replied to Leah at Bright Cafe" }, !!mail, "Open Leah's email and press Reply.");
  add(
    { id: "attached", code: "SP-6", group: "Sending it", label: "The quote is attached, not linked" },
    !!mail && mail.attachments.some((a) => /quote/i.test(a.name)) && mail.links.length === 0,
    !mail ? "Reply to Leah first." : mail.links.length ? "Bright Cafe are outside the company, so they can't open a SharePoint link. Remove the link and use Attach file instead." : "Use Attach file and pick the quote you saved.",
  );
  add({ id: "price", code: "OL-4", group: "Sending it", label: "Your email gives the price with VAT: £273.60" }, !!mail && /273\.60/.test(mail.body), "Put the total in the email too, so Leah sees it straight away: £273.60 including VAT.");
  return out;
}

export const vatQuote: Job = {
  id: "m6j2",
  slug: "vat-quote",
  moduleId: "m6",
  moduleLabel: "Module 6: Making it do the maths",
  title: "A quote with VAT",
  summary: "A customer wants a price with VAT. Build the quote from the template, save it properly, and send it to them.",
  clock: "13:06",
  deadline: "Bright Cafe want to order this week",
  doneLine: "Leah has a correct quote, with VAT, as an attachment she can open. Priya can find it in Orders > 2026.",
  brief: "Priya has asked you to quote for Bright Cafe. Read her email and Leah's, then do it. When you think it's done, press Check my work.",
  hints: [
    "Open Quote template.xltx from Operations Team > Documents > Orders.",
    "Fill in the customer and date, then Lids (500), 20 and £11.40 on row 6, with =B6*C6 in D6.",
    "Net in D8 (=D6), VAT in D9 (=D8*0.2), total in D10 (=D8+D9).",
    "Save as in Orders > 2026, named like the Kent Bakery quote. Then reply to Leah, attach the quote and give the total.",
  ],
  seed: seedQuote,
  check: checkQuote,
  habits: [
    { label: "Check your own work", checks: ["net", "vat", "gross"] },
    { label: "Name it so anyone can find it", checks: ["where"] },
    { label: "Close the loop", checks: ["sent", "attached", "price"] },
  ],
};

/* ── E6.3 Count the late ones ───────────────────────────────────────── */

const LOG_ID = "seed-log-oct";
const SUPPLIERS = ["Harlow Packaging", "Kent Flour Mills", "Brightwater Cups", "Fenwick Foods"];
const LATE_AT = new Set([3, 8, 14, 19, 23, 31, 36]);

function octoberLog(): Grid {
  const rows: string[][] = [];
  let day = 1;
  for (let i = 0; i < 40; i++) {
    while ([3, 4, 10, 11, 17, 18, 24, 25].includes(day)) day++;
    const supplier = SUPPLIERS[i % SUPPLIERS.length];
    rows.push([`${String(day).padStart(2, "0")}/10/2026`, `DN-${40700 + i * 7}`, supplier, LATE_AT.has(i) ? "Late" : "On time"]);
    if (i % 2 === 1) day++;
  }
  return pad([["Date", "Delivery note", "Supplier", "Status"], ...rows], 4, 48);
}

function seedLate(): OfficeState {
  const files: OfficeFile[] = [...officeFolders(), { id: LOG_ID, path: DELIVERIES_DIR, name: "2026-10 Delivery log.xlsx", kind: "xlsx", modified: "31/10/2026", by: "Sarah Patel", sheet: octoberLog(), widths: [110, 130, 170, 100], seeded: true }];
  return {
    version: 0,
    files,
    emails: [
      inbound({
        id: "m-daniel-late",
        from: PEOPLE.daniel,
        subject: "Late deliveries in October",
        time: "15:30",
        body: "Hi,\n\nHow many deliveries came late in October? I'm raising it with the haulier tomorrow.\n\nThe log is in Operations Team > Documents > Deliveries > 2026 (2026-10 Delivery log). Put the count at the bottom of it, so I can see how you got it, save it, and email me the number.\n\nThanks,\nDaniel",
      }),
    ],
  };
}

function checkLate(s: OfficeState): Check[] {
  const file = s.files.find((f) => f.id === LOG_ID);
  const g = file ? tabsOf(file)[0]?.grid : undefined;
  const counted = g ? formulaCells(g).find((x) => /COUNTIF/i.test(x.v) && near(x.n, 7)) : undefined;
  const anyCount = g ? formulaCells(g).find((x) => /COUNTIF/i.test(x.v)) : undefined;
  const out: Check[] = [];
  const add = (c: Omit<Check, "ok" | "fix">, ok: boolean, fix?: string) => out.push({ ...c, ok, fix: ok ? undefined : fix });
  add(
    { id: "countif", code: "XL-7", group: "The count", label: "A COUNTIF at the bottom of the log counts the late ones: 7" },
    !!counted,
    anyCount ? `Your COUNTIF gives ${anyCount.n}. Check it looks at the Status column (D2:D41) and the word "Late".` : 'Under the log, type =COUNTIF(D2:D41,"Late").',
  );
  add({ id: "label", code: "XL-2", group: "The count", label: "It has a label beside it" }, !!counted && (g?.[counted.r]?.slice(0, counted.c).some((v) => /[a-z]/i.test(v)) ?? false), "Put a word to its left, like Late deliveries, so Daniel knows what it is.");
  add({ id: "saved", code: "WIN-4", group: "Telling Daniel", label: "Saved into the log, where it lives" }, !!file && file.by === "You", "Press Save in Excel, so Daniel can see your count in the log.");
  const mail = sentTo(s, PEOPLE.daniel).at(-1);
  add({ id: "number", code: "XL-9", group: "Telling Daniel", label: "You emailed Daniel the number: 7" }, !!mail && /\b(7|seven)\b/i.test(mail.body), mail ? "Give Daniel the number in your email: 7 of October's deliveries were late." : "Reply to Daniel with the number.");
  return out;
}

export const lateCount: Job = {
  id: "m6j3",
  slug: "late-count",
  moduleId: "m6",
  moduleLabel: "Module 6: Making it do the maths",
  title: "Count the late ones",
  summary: "Daniel needs to know how many of October's 40 deliveries were late. Count it with a formula and tell him.",
  clock: "15:31",
  deadline: "Daniel sees the haulier tomorrow",
  doneLine: "Daniel has his number, and the formula in the log shows exactly how you got it.",
  brief: "Daniel needs a number from the October delivery log. Read his email and get it for him. When you think it's done, press Check my work.",
  hints: [
    "Open 2026-10 Delivery log.xlsx from Operations Team > Documents > Deliveries > 2026.",
    'Under the last row, type a label in C43, then =COUNTIF(D2:D41,"Late") in D43.',
    "Save it, then reply to Daniel with the number.",
  ],
  seed: seedLate,
  check: checkLate,
  habits: [
    { label: "Check your own work", checks: ["countif", "label"] },
    { label: "Close the loop", checks: ["saved", "number"] },
  ],
};
