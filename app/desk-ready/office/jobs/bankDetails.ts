import { fold, INVOICE_HP2291, paperOf } from "../admin";
import { inbound, officeFolders, PEOPLE } from "../northfield";
import { HARLOW_MAIN, HARLOW_MAIN_CALL, PHONE_BOOK, PRIYA_CALL, REAL_DOMAIN, SCAM_CALL, SCAM_DOMAIN, SCAM_EMAIL_ID, SCAM_NUMBER, scamEmail, TOM_CALL, TOM_NUMBER } from "../safety";
import type { Check, Email, Job, OfficeState, PhoneCall } from "../types";
import { pdfFile, PRIYA_SIGNATURE, TO_APPROVE } from "./invoiceCheck";

/* E11.1 The bank details have changed (criteria SAFE-1, SAFE-2). At 08:40
 * an email arrives from "Harlow Packaging Accounts"
 * <accounts@harlow-packaging-uk.co>: new bank details, pay invoice HP-2291
 * today to avoid a late fee. The real Harlow address is
 * harlowpackaging.example, and Tom Hale's number on file is 0116 496 0412
 * (in the desk phone's contacts, and on his own emails). Done means: no
 * reply to the scammer, nothing paid and its link never opened; the email
 * reported; Priya told; and Tom rung on the number we already hold, never
 * on the one printed in the email. */

export const BANK_INVOICE_ID = "seed-inv-hp2291";

const EARLIER: PhoneCall[] = [
  { id: "call-early-sarah", name: "Sarah Patel", company: "Warehouse, ext 412", number: "Ext 412", time: "08:21", way: "in", seconds: 62 },
  { id: "call-early-kent", name: "01632 960 870", company: "Kent Flour Mills", number: "01632 960 870", time: "Tue 16:05", way: "missed", seconds: 0 },
];

function seed(): OfficeState {
  const emails: Email[] = [
    scamEmail(),
    inbound({
      id: "m-priya-payrun",
      from: PEOPLE.priya,
      subject: "Supplier payments this afternoon",
      time: "08:15",
      body: `Morning,\n\nI'm doing the supplier payment run at 2pm today. If anything about a supplier's invoice or payment looks odd before then, tell me, and I'll hold it.\n\nThanks,\nPriya\n\n${PRIYA_SIGNATURE}`,
    }),
    inbound({
      id: "m-tom-hp2291",
      from: PEOPLE.tom,
      subject: "Invoice HP-2291",
      time: "Tue 15:10",
      unread: false,
      body: `Hi,\n\nPlease find invoice HP-2291 attached for PO 3307, 12 pallets of wrap. Payment is due within 30 days, by 10 December.\n\nKind regards,\nTom\n\nTom Hale\nAccount Manager | Harlow Packaging\nDirect line ${TOM_NUMBER}\ntom.hale@${REAL_DOMAIN}`,
      attachments: [{ name: "HP-2291.pdf", paper: paperOf(INVOICE_HP2291) }],
    }),
    inbound({
      id: "m-fire-drill",
      from: PEOPLE.facilities,
      subject: "Fire drill on Thursday at 11:00",
      time: "Mon 15:30",
      unread: false,
      body: "Hello all,\n\nThe alarm will sound for about two minutes on Thursday at 11:00. Please leave by the nearest exit and meet in the car park.\n\nFacilities Team",
    }),
  ];
  return {
    version: 0,
    files: [...officeFolders(), pdfFile(BANK_INVOICE_ID, TO_APPROVE, "2026-11-10 Harlow invoice HP-2291.pdf", INVOICE_HP2291, "10/11/2026", "Priya Shah")],
    emails,
    phone: { calls: EARLIER, answered: [] },
    phoneBook: PHONE_BOOK,
    dialable: [TOM_CALL, HARLOW_MAIN_CALL, SCAM_CALL, PRIYA_CALL],
  };
}

/* ── marking ─────────────────────────────────────────────────────────── */

const rang = (s: OfficeState, number: string) => (s.phone?.calls ?? []).some((c) => c.way === "out" && fold(c.number) === fold(number));
const toAddr = (e: Email) => [...e.to, ...e.cc, ...(e.bcc ?? [])].map((p) => p.address.toLowerCase());

function check(s: OfficeState): Check[] {
  const scam = s.emails.find((e) => e.id === SCAM_EMAIL_ID);
  const sent = s.emails.filter((e) => e.folder === "sent");
  const toScammer = sent.filter((e) => toAddr(e).some((a) => a.endsWith(`@${SCAM_DOMAIN}`)));
  const toPriya = sent.filter((e) => toAddr(e).includes(PEOPLE.priya.address));
  /* Priya needs a fresh email that's about it, not the scam passed on, link and all */
  const fresh = toPriya.filter((e) => e.inReplyTo !== SCAM_EMAIL_ID && /hp-?2291|harlow|bank|scam|phish|fake|pay/i.test(`${e.subject}\n${e.body}`));
  const forwarded = toPriya.some((e) => e.inReplyTo === SCAM_EMAIL_ID);
  const told = fresh.length > 0 || rang(s, "Ext 405");
  const calledTom = rang(s, TOM_NUMBER) || rang(s, HARLOW_MAIN);
  const calledScam = rang(s, SCAM_NUMBER);
  const inv = s.files.find((f) => f.id === BANK_INVOICE_ID);
  const approved = !!inv && inv.path.join("/").endsWith("Approved");

  const out: Check[] = [];
  const add = (c: Omit<Check, "ok" | "fix">, ok: boolean, fix?: string) => out.push({ ...c, ok, fix: ok ? undefined : fix });

  add(
    { id: "reported", code: "SAFE-1", group: "The scam email", label: "You reported it as phishing" },
    !!scam?.reported,
    "It's still sitting in your mailbox. Open it and press Report, so it goes to Junk and IT can warn everyone. Its tells: a look-alike address (harlow-packaging-uk.co, not harlowpackaging.example), \"Dear Customer\", a rush to pay today, and new bank details.",
  );
  add(
    { id: "no-click", code: "SAFE-1", group: "The scam email", label: "You didn't open its link" },
    !scam?.clicked,
    `You clicked "View and pay invoice HP-2291". It went to ${SCAM_DOMAIN}, the scammer's own site. At work, tell IT straight away and change your password. Next time, point at a link first and read where it really goes, without clicking.`,
  );
  add(
    { id: "no-reply", code: "SAFE-2", group: "The scam email", label: "You didn't reply to the scammer" },
    toScammer.length === 0,
    `You sent an email to ${toScammer[0]?.to[0]?.address ?? `the ${SCAM_DOMAIN} address`}. Whatever you ask, the scammer will say it's genuine, and now they know someone reads this mailbox. Check with the real supplier, on a number you already hold.`,
  );
  add(
    { id: "no-pay", code: "SAFE-2", group: "The money", label: "Nothing was paid or approved" },
    !scam?.clicked && !approved,
    approved ? "You moved HP-2291 to Approved, so it would be paid. Move it back to Finance > Invoices > To approve, and let Priya know it's on hold." : "You opened the payment link. That's how the money would have gone. Report the email instead.",
  );
  add(
    { id: "called-tom", code: "SAFE-2", group: "The money", label: `You rang Tom on the number we already hold (${TOM_NUMBER})` },
    calledTom,
    calledScam
      ? `You only rang ${SCAM_NUMBER}, the number in the email. That goes to the scammer, who of course says it's genuine. Ring Tom on the number in the phone's Contacts: ${TOM_NUMBER}.`
      : `Check with the real supplier by phone. In the Phone app, open Contacts and call Tom Hale on ${TOM_NUMBER}, the number we already hold.`,
  );
  add(
    { id: "not-scam-number", code: "SAFE-2", group: "The money", label: "You didn't ring the number printed in the email" },
    !calledScam,
    `You rang ${SCAM_NUMBER}, the number in the scam email. A scammer puts their own number in, so the check reaches them. Always use a number you held before the email came.`,
  );
  add(
    { id: "priya", code: "SAFE-2", group: "Telling Priya", label: "You told Priya not to pay it" },
    told,
    forwarded
      ? "You forwarded the scam itself to Priya. Write her a new email instead (or ring her on ext 405), saying HP-2291's \"new bank details\" email is a scam and not to pay it. A forward passes the trap on."
      : "Priya pays the suppliers at 2pm. Email her (or ring her on ext 405): the email about HP-2291's new bank details is a scam, so she mustn't pay it or change Harlow's details.",
  );
  return out;
}

export const bankDetails: Job = {
  id: "m11j1",
  slug: "bank-details",
  moduleId: "m11",
  moduleLabel: "Module 11: Staying safe at work",
  title: "The bank details have changed",
  summary: "An email says a supplier's bank has changed and the invoice must be paid today. Check it the safe way.",
  clock: "Wed 11 Nov, 08:40",
  deadline: "Priya pays suppliers at 14:00",
  doneLine: "Nothing paid, the scam reported, Tom's word on it, and Priya told. That's a fraud stopped.",
  brief: "An email has just arrived about paying a supplier. Deal with it the way a careful admin would: read it closely before you do anything. The desk phone is on the taskbar. When you think it's done, press Check my work.",
  hints: [
    "Open the email. Point at the sender's name and the yellow button without clicking: where do they really go?",
    "Compare the address with Tom Hale's real email from Tuesday, further down your inbox.",
    "Don't use the phone number in the email. In the Phone app, open Contacts and ring Tom on the number we already hold.",
    "Report the email, and tell Priya (by email, or ring ext 405) before her 2pm payment run.",
  ],
  apps: ["phone"],
  seed,
  check,
  habits: [
    { label: "Check your own work", checks: ["called-tom", "not-scam-number"] },
    { label: "Close the loop", checks: ["priya"] },
  ],
};
