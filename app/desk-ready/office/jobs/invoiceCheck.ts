import { DN_40877, DN_77812, INVOICE_BW5520, INVOICE_HP2291, INVOICE_KF1175, PO_3305, PO_3307, PO_3310, fold, paperOf } from "../admin";
import { inbound, officeFolders, PEOPLE } from "../northfield";
import { pathText, samePath, type BizDoc, type Check, type Email, type Job, type OfficeFile, type OfficeState, type Path } from "../types";

/* E10.1 Check the invoice before it gets paid (criteria ADM-1, ADM-2).
 * Priya asks for invoice HP-2291 from Harlow to be checked against its
 * purchase order and delivery note before she pays it. PO 3307 ordered 12
 * pallets at £48.00 and the invoice bills all 12 (£576.00 + VAT £115.20 =
 * £691.20), but delivery note DN-77812 shows only 10 came. So the invoice
 * must NOT be approved (moved to Invoices > Approved), and Priya is told
 * that 2 are missing, that £115.20 including VAT should be held, and that
 * a credit note is needed for the 2 missing pallets. */

export const TO_APPROVE: Path = ["Finance", "Invoices", "To approve"];
export const APPROVED: Path = ["Finance", "Invoices", "Approved"];
const ORDERS: Path = ["Operations Team", "Documents", "Orders", "2026"];
const DELIVERIES: Path = ["Operations Team", "Documents", "Deliveries", "2026"];
export const INVOICE_ID = "seed-inv-hp2291";
const INVOICE_NAME = "2026-11-10 Harlow invoice HP-2291.pdf";

export const PRIYA_SIGNATURE = "Priya Shah\nAccounts | Northfield Supplies\n01632 960 405";

/* A PDF in the office, drawn from its paperwork. */
export function pdfFile(id: string, path: Path, name: string, doc: BizDoc, modified: string, by: string): OfficeFile {
  return { id, path, name, kind: "pdf", modified, by, paper: paperOf(doc), seeded: true };
}

function seed(): OfficeState {
  const files: OfficeFile[] = [
    ...officeFolders(),
    pdfFile(INVOICE_ID, TO_APPROVE, INVOICE_NAME, INVOICE_HP2291, "10/11/2026", "Priya Shah"),
    pdfFile("seed-inv-kf1175", TO_APPROVE, "2026-11-09 Kent Flour invoice KF-1175.pdf", INVOICE_KF1175, "09/11/2026", "Priya Shah"),
    pdfFile("seed-inv-bw5520", APPROVED, "2026-11-03 Brightwater invoice BW-5520.pdf", INVOICE_BW5520, "05/11/2026", "Priya Shah"),
    pdfFile("seed-po-3305", ORDERS, "2026-10-30 Purchase order 3305 Kent Flour.pdf", PO_3305, "30/10/2026", "Sarah Patel"),
    pdfFile("seed-po-3307", ORDERS, "2026-11-02 Purchase order 3307 Harlow.pdf", PO_3307, "02/11/2026", "Sarah Patel"),
    pdfFile("seed-po-3310", ORDERS, "2026-11-04 Purchase order 3310 Brightwater.pdf", PO_3310, "04/11/2026", "Priya Shah"),
    pdfFile("seed-dn-40877", DELIVERIES, "2026-11-09 Delivery note DN-40877.pdf", DN_40877, "09/11/2026", "Daniel Okafor"),
    pdfFile("seed-dn-77812", DELIVERIES, "2026-11-10 Delivery note DN-77812.pdf", DN_77812, "10/11/2026", "Sarah Patel"),
  ];
  return {
    version: 0,
    files,
    emails: [
      inbound({
        id: "m-priya-hp2291",
        from: PEOPLE.priya,
        subject: "Invoice HP-2291 from Harlow",
        time: "10:20",
        body: `Hi,\n\nInvoice HP-2291 from Harlow is in Finance > Invoices > To approve. Can you check it against the PO and the delivery note before I pay it?\n\nIf it all matches, move it to Approved and I'll pay it on Friday. If something's wrong, tell me what, and how much I should hold back.\n\nThanks,\nPriya\n\n${PRIYA_SIGNATURE}`,
        links: [{ name: INVOICE_NAME, path: TO_APPROVE, fileName: INVOICE_NAME }],
      }),
      inbound({
        id: "m-fire-drill",
        from: PEOPLE.facilities,
        subject: "Fire drill on Thursday at 11:00",
        time: "Mon 15:30",
        unread: false,
        body: "Hello all,\n\nThe alarm will sound for about two minutes on Thursday at 11:00. Please leave by the nearest exit and meet in the car park.\n\nFacilities Team",
      }),
    ],
  };
}

/* ── marking ─────────────────────────────────────────────────────────── */

const words = (e: Email) => `${e.subject}\n${e.body}`;

function check(s: OfficeState): Check[] {
  const inv = s.files.find((f) => f.id === INVOICE_ID);
  const approved = !!inv && samePath(inv.path, APPROVED);
  const toPriya = s.emails.filter((e) => e.folder === "sent" && [...e.to, ...e.cc].some((p) => p.address === PEOPLE.priya.address));
  /* the best of what went to Priya: the one that names the money, else the latest */
  const mail = toPriya.slice().reverse().find((e) => /115\.20?\b/.test(e.body)) ?? toPriya[toPriya.length - 1];
  const body = mail?.body ?? "";
  const out: Check[] = [];
  const add = (c: Omit<Check, "ok" | "fix">, ok: boolean, fix?: string) => out.push({ ...c, ok, fix: ok ? undefined : fix });

  /* The invoice */
  add(
    { id: "held", code: "ADM-2", group: "The invoice", label: "HP-2291 is not approved, because the delivery was short" },
    !!inv && !approved,
    !inv
      ? "The invoice has been deleted. Never delete an invoice: Priya still has to pay for the 10 pallets that came. Start the job again."
      : `You moved it to ${pathText(APPROVED)}, so Priya would pay £691.20 for 12 pallets when only 10 came. In File Explorer, select it and use Move to, back to ${pathText(TO_APPROVE)}.`,
  );

  /* Telling Priya */
  add(
    { id: "told", code: "OL-5", group: "Telling Priya", label: "You emailed Priya back" },
    !!mail,
    "Nothing has gone to Priya yet. Open her email and press Reply, so she knows not to pay it all.",
  );
  const shortOk = (/\b10\b/.test(body) && /\b12\b/.test(body)) || /\b(2|two)\b[^.\n]{0,40}\b(short|missing|missed|didn.?t (come|arrive)|not (come|arrive|delivered))/i.test(body) || /\b(short|missing)\b[^.\n]{0,25}\b(2|two)\b/i.test(body);
  add(
    { id: "short", code: "ADM-2", group: "Telling Priya", label: "It says only 10 of the 12 pallets arrived" },
    !!mail && shortOk,
    mail ? "Say what you found: the invoice is for 12 pallets, but delivery note DN-77812 shows only 10 arrived." : "Reply to Priya first.",
  );
  const hold = /£?\s?115\.20?\b/.test(body);
  add(
    { id: "amount", code: "ADM-1", group: "Telling Priya", label: "It says to hold back £115.20, including VAT" },
    !!mail && hold,
    !mail
      ? "Reply to Priya first."
      : /\b96(\.00)?\b/.test(body)
        ? "£96.00 is the 2 pallets before VAT. Priya pays the total with VAT, so add the 20%: £96.00 + £19.20 = £115.20."
        : /691\.20?/.test(body)
          ? "£691.20 is the whole invoice. Only the 2 missing pallets should be held back: 2 × £48.00 = £96.00, plus VAT £19.20, is £115.20."
          : "Tell her how much to hold back: 2 pallets at £48.00 is £96.00, plus 20% VAT (£19.20), so £115.20.",
  );
  add(
    { id: "credit", code: "ADM-1", group: "Telling Priya", label: "It says a credit note is needed for the 2 missing pallets" },
    !!mail && /credit\s*note/i.test(body),
    mail ? 'Say that Harlow need to send a credit note for the 2 missing pallets, so the books match what arrived. Use the words "credit note".' : "Reply to Priya first.",
  );
  add(
    { id: "which", code: "OL-2", group: "Telling Priya", label: "It names the invoice, HP-2291" },
    !!mail && fold(words(mail)).includes("HP2291"),
    mail ? 'Priya has lots of invoices. Keep "Re: Invoice HP-2291 from Harlow" as the subject, or write HP-2291 in the email.' : "Reply to Priya first.",
  );
  return out;
}

export const invoiceCheck: Job = {
  id: "m10j1",
  slug: "invoice-check",
  moduleId: "m10",
  moduleLabel: "Module 10: Admin in practice",
  title: "Check the invoice before it gets paid",
  summary: "Priya wants Harlow's invoice HP-2291 checked against the purchase order and the delivery note before she pays it.",
  clock: "Wed 11 Nov, 10:22",
  deadline: "Priya pays invoices on Friday",
  doneLine: "Priya pays for what arrived, not what was billed. That check just saved Northfield £115.20.",
  brief: "Priya in Accounts has asked you to check an invoice before she pays it. Read her email, find the three pieces of paper, and compare them. When you think it's done, press Check my work.",
  hints: [
    "Open Priya's email. The link opens the invoice: look at what it charges for, and the PO number and delivery note number on it.",
    "In File Explorer, find the purchase order in Operations Team > Documents > Orders > 2026, and the delivery note in Operations Team > Documents > Deliveries > 2026.",
    "Compare the three: what was ordered, what came off the van, and what is being charged. Read the handwriting on the delivery note.",
    "Only move the invoice to Approved if all three match. If they don't, leave it where it is.",
    "Reply to Priya: what's wrong, how much to hold back with VAT, and that a credit note is needed.",
  ],
  seed,
  check,
  habits: [
    { label: "Put it where the brief says", checks: ["held"] },
    { label: "Check your own work", checks: ["short", "amount"] },
    { label: "Close the loop", checks: ["told", "credit", "which"] },
  ],
};
