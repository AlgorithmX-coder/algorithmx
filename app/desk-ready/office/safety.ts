import { fold, HARLOW, INVOICE_HP2291, timed } from "./admin";
import { inbound, KENT_STAFF, PEOPLE } from "./northfield";
import type { BizDoc, Contact, DialScript, Email, Grid, OfficeState, Person, PhoneEntry } from "./types";

/* Module 11: Staying safe at work. The people, numbers and messages that
 * the lessons and the office jobs share, so the scam a learner takes apart
 * in a lesson is the very email that later lands in the office. Every
 * company, number and address is invented: phone numbers sit in Ofcom's
 * drama ranges, our own addresses end .example, and the scammer's look-
 * alike address is the one the course criteria give (E11.1). No real bank
 * or helpline is ever named. */

export const DOMAIN = "northfieldsupplies.example";

/* Inside the company, or outside it: what Outlook's warnings go by. */
export const isInternal = (address: string) => address.toLowerCase().endsWith(`@${DOMAIN}`);

/* ── the scam: "Harlow Packaging Accounts" ───────────────────────────── */

export const REAL_DOMAIN = "harlowpackaging.example";
export const SCAM_DOMAIN = "harlow-packaging-uk.co";
export const SCAMMER: Person = { name: "Harlow Packaging Accounts", address: `accounts@${SCAM_DOMAIN}` };
/* Tom's own line, as the company holds it. Not printed in the scam. */
export const TOM_NUMBER = "0116 496 0412";
/* Harlow's main line, on the real invoice and in the phone's contacts. */
export const HARLOW_MAIN = HARLOW.phone ?? "01632 960 552";
/* The number the scam email gives: it rings the scammer. */
export const SCAM_NUMBER = "07700 900 461";
export const SCAM_LINK = { text: "View and pay invoice HP-2291", url: `https://${SCAM_DOMAIN}/pay/HP-2291` };
export const SCAM_BANK = { name: "HP Accounts Services", sortCode: "40-11-62", account: "73920154" };
export const SCAM_SUBJECT = "URGENT: new bank details, pay invoice HP-2291 today";

export const SCAM_BODY = [
  "Dear Customer,",
  "Please note our new bank details below and pay invoice HP-2291 today to avoid a late fee.",
  `Our bank account has changed. Please update your records and use these details from now on:\nAccount name: ${SCAM_BANK.name}\nSort code: ${SCAM_BANK.sortCode}\nAccount number: ${SCAM_BANK.account}`,
  "Payment of £691.20 must reach us by 5pm today, or a £150 late fee will be added.",
  `Any questions, call our accounts team on ${SCAM_NUMBER}.`,
  "Kind regards,\nAccounts Department\nHarlow Packaging",
].join("\n\n");

export const SCAM_EMAIL_ID = "m-scam-bank";

export function scamEmail(): Email {
  return inbound({ id: SCAM_EMAIL_ID, from: SCAMMER, subject: SCAM_SUBJECT, time: "08:40", body: SCAM_BODY, fakeLink: { text: SCAM_LINK.text, url: SCAM_LINK.url } });
}

/* The real invoice, as Harlow sent it, and the fake one a scammer would
 * draw from it: same look, same number, same total, new bank and contact
 * details and a "pay today" demand. */
export const REAL_INVOICE: BizDoc = INVOICE_HP2291;
export const FAKE_INVOICE: BizDoc = {
  ...INVOICE_HP2291,
  from: { ...HARLOW, phone: SCAM_NUMBER, email: SCAMMER.address },
  bank: SCAM_BANK,
  terms: "Pay today to avoid a £150 late fee.",
  due: "11/11/2026",
};

/* ── the people Outlook suggests, and what it says under each name ───── */

export const IT_HELPDESK: Contact = { name: "IT Helpdesk", address: `it.helpdesk@${DOMAIN}`, detail: "IT support, Northfield Supplies" };
export const EMMA_CLARKSON: Contact = { name: "Emma Clarkson", address: "emma.clarkson@brightcafe.example", detail: "Bright Cafe (a customer)" };

const DETAIL: Record<string, string> = {
  [PEOPLE.daniel.address]: "Office Manager, Northfield Supplies",
  [PEOPLE.sarah.address]: "Warehouse Supervisor, Northfield Supplies",
  [PEOPLE.priya.address]: "Accounts, Northfield Supplies",
  [PEOPLE.emma.address]: "HR Advisor, Northfield Supplies",
  [PEOPLE.hr.address]: "HR team mailbox, Northfield Supplies",
  [PEOPLE.facilities.address]: "Facilities, Northfield Supplies",
  [PEOPLE.tom.address]: "Account Manager, Harlow Packaging",
  [PEOPLE.imran.address]: "Owner, Kent Bakery",
  [PEOPLE.kentFlour.address]: "Kent Flour Mills (a supplier)",
  [PEOPLE.brightwater.address]: "Brightwater Cups (a supplier)",
  ...Object.fromEntries(KENT_STAFF.map((p) => [p.address, "Kent Bakery (a customer)"])),
};

/* The line under a name in Outlook's suggestions and contact card. */
export function detailOf(p: Person & { detail?: string }): string | undefined {
  return p.detail ?? DETAIL[p.address];
}

/* ── the desk phone's contacts, and the calls behind the numbers ──────── */

export const PHONE_BOOK: PhoneEntry[] = [
  { name: "Daniel Okafor", role: "Office Manager", number: "Ext 400", group: "Northfield Supplies" },
  { name: "Priya Shah", role: "Accounts", number: "Ext 405", group: "Northfield Supplies" },
  { name: "Sarah Patel", role: "Warehouse Supervisor", number: "Ext 412", group: "Northfield Supplies" },
  { name: "IT Helpdesk", role: "IT support", number: "Ext 444", group: "Northfield Supplies" },
  { name: "Tom Hale", company: "Harlow Packaging", role: "Account Manager", number: TOM_NUMBER, group: "Suppliers" },
  { name: "Harlow Packaging", company: "Harlow Packaging", role: "Main line", number: HARLOW_MAIN, group: "Suppliers" },
  { name: "Kent Flour Mills", company: "Kent Flour Mills", role: "Orders", number: "01632 960 870", group: "Suppliers" },
  { name: "Brightwater Cups", company: "Brightwater Cups", role: "Accounts", number: "01632 960 633", group: "Suppliers" },
  { name: "Jo Marsh", company: "Bright Cafe", role: "Owner", number: "07700 900 318", group: "Customers" },
  { name: "Mr Ahmed", company: "Kent Bakery", role: "Owner", number: "0116 496 0738", group: "Customers" },
];

const TOM_SAYS: { who: "them" | "you"; text: string }[] = [
  { who: "you", text: "Hi Tom, it's Northfield Supplies, from the office. We've had an email saying your bank details have changed, and asking us to pay HP-2291 today. Is that from you?" },
  { who: "them", text: "No, that isn't us. Our bank details haven't changed, and they're not going to." },
  { who: "you", text: "It came from accounts at harlow-packaging-uk.co." },
  { who: "them", text: "That's not our address. All our emails end harlowpackaging.example, with no dashes. Someone has copied our name." },
  { who: "them", text: "Please don't pay anything to those details. HP-2291 isn't due until the 10th of December, to the account printed on the invoice you already have." },
  { who: "you", text: "Thanks, Tom. We'll hold it, and I'll report the email." },
  { who: "them", text: "Thanks for checking with me. I'll warn our other customers too. Bye for now." },
];

export const TOM_CALL: DialScript = {
  name: "Tom Hale",
  company: "Harlow Packaging",
  number: TOM_NUMBER,
  ...timed([{ who: "them", text: "Tom Hale, Harlow Packaging. Good morning." }, ...TOM_SAYS]),
};

export const HARLOW_MAIN_CALL: DialScript = {
  name: "Harlow Packaging",
  company: "Main line, put through to Tom Hale",
  number: HARLOW_MAIN,
  ...timed([
    { who: "them", text: "Harlow Packaging, good morning, Leanne speaking." },
    { who: "you", text: "Hello, could I speak to Tom Hale, please? It's Northfield Supplies." },
    { who: "them", text: "Of course. Putting you through now." },
    { who: "them", text: "Tom Hale speaking." },
    ...TOM_SAYS,
  ]),
};

export const SCAM_CALL: DialScript = {
  name: SCAM_NUMBER,
  company: "The number in the email",
  number: SCAM_NUMBER,
  ...timed([
    { who: "them", text: "Harlow accounts, good morning." },
    { who: "you", text: "Hi, it's Northfield Supplies. We've had your email about new bank details. Is it genuine?" },
    { who: "them", text: "Yes, that's us. We've moved banks, so please use the new details today." },
    { who: "you", text: "Could I speak to Tom Hale, please?" },
    { who: "them", text: "Tom's out today, I'm dealing with it. The payment has to go before 5pm, or the late fee goes on." },
    { who: "you", text: "I'd like to check with him first." },
    { who: "them", text: "There's no need, the email is from us. When will you be sending the £691.20?" },
    { who: "you", text: "I'll come back to you." },
  ]),
};

export const PRIYA_CALL: DialScript = {
  name: "Priya Shah",
  company: "Accounts, ext 405",
  number: "Ext 405",
  ...timed([
    { who: "them", text: "Priya Shah, Accounts." },
    { who: "you", text: "Hi Priya. An email says Harlow's bank details have changed, and asks us to pay HP-2291 today. It's from a look-alike address, so I think it's a scam." },
    { who: "them", text: "Thanks for telling me straight away. I won't pay it, and I won't change Harlow's bank details." },
    { who: "them", text: "I'll put a hold on Harlow's payments until it's sorted. Thanks." },
  ]),
};

/* A number with nobody behind it, or a saved one nobody answers. */
export function noAnswer(number: string, name?: string): DialScript {
  const words = name ? `Hello, you've reached ${name}. I can't take your call just now. Please leave a message after the tone.` : "Sorry, the number you have dialled has not been recognised. Please check the number and try again.";
  return { name: name ?? number, number, ...timed([{ who: "them", text: words }]) };
}

/* Which saved number or script a dialled number reaches. */
export function reach(number: string, dialable: DialScript[] = [], book: PhoneEntry[] = []): DialScript {
  const n = fold(number);
  const script = dialable.find((d) => fold(d.number) === n);
  if (script) return script;
  const saved = book.find((b) => fold(b.number) === n);
  return noAnswer(saved?.number ?? number, saved ? saved.name : undefined);
}

/* ── the overtime sheet (E11.2): payroll, so personal data ───────────── */

export const OVERTIME_NAME = "2026-11 Overtime November.xlsx";
export const OVERTIME: Grid = [
  ["Name", "Staff no", "Team", "Overtime hours", "Rate (£ an hour)", "Overtime pay"],
  ["Sarah Patel", "NS-0412", "Warehouse", "6", "18.45", "=D2*E2"],
  ["Kieran Doyle", "NS-0418", "Warehouse", "9.5", "16.20", "=D3*E3"],
  ["Hannah Price", "NS-0423", "Warehouse", "4", "16.20", "=D4*E4"],
  ["Marek Nowak", "NS-0427", "Drivers", "11", "17.10", "=D5*E5"],
  ["Ruth Adeyemi", "NS-0431", "Drivers", "7.5", "17.10", "=D6*E6"],
  ["Total", "", "", "=SUM(D2:D6)", "", "=SUM(F2:F6)"],
];

/* ── an answer to an email sent to the wrong person ──────────────────── */

export const CLARKSON_REPLY: Email = inbound({
  id: "m-clarkson-oops",
  from: EMMA_CLARKSON,
  subject: "Re: November's overtime sheet",
  time: "Just now",
  body: "Hi,\n\nI think this was meant for someone else? It's a list of your staff's names and pay. I'm Emma at Bright Cafe, one of your customers.\n\nShall I just delete it?\n\nEmma",
});

/* Work numbers Outlook's contact card shows, for the people we hold them for. */
export const PHONE_OF: Record<string, string> = {
  [PEOPLE.tom.address]: TOM_NUMBER,
  [PEOPLE.daniel.address]: "01632 960 400",
  [PEOPLE.priya.address]: "01632 960 405",
  [PEOPLE.sarah.address]: "01632 960 412",
};

/* Deliver any answer waiting on an email just sent (a customer who got
 * something meant for someone else writes back). */
export function deliverReplies(s: OfficeState, sent: Email): OfficeState {
  const to = [...sent.to, ...sent.cc, ...(sent.bcc ?? [])].map((p) => p.address.toLowerCase());
  const due = (s.replies ?? []).filter((r) => !r.sent && to.includes(r.to.toLowerCase()));
  if (!due.length) return s;
  return {
    ...s,
    emails: [...due.map((r) => ({ ...r.reply, id: `${r.reply.id}-${sent.id}`, inReplyTo: sent.id })), ...s.emails],
    replies: (s.replies ?? []).map((r) => (due.includes(r) ? { ...r, sent: true } : r)),
  };
}
