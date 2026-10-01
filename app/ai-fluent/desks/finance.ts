import type { AttachedDocument, DataPack } from "@/app/ai-cleared/engine/types";

/* The Finance desk's world for AI Fluent: a month-end pack the learner
 * works through across modules 4 to 9, and the leak pack that sits under
 * every send. Every client, person, reference and number is invented.
 * The learner's own firm is whatever firm they belong to; the clients
 * below are theirs. */

export const FINANCE_PACK: DataPack = {
  facts:
    "Aged debtors at month end: Brightwater Logistics Ltd (contact Nadia Ferreira, n.ferreira@brightwater-logistics.example, 07700 900321) owes £42,300 across INV-3107 and INV-3122, 61 days; Cotton & Mather Ltd (contact Rob Askew) owes £9,850 on INV-3140, 34 days, disputed; Halcyon Dental Group (contact Priya Menon) owes £3,120 on INV-3151, 12 days; Oakhurst Fabrics (contact Lee Danvers) owes £27,600 on INV-3098, 92 days, on a payment plan. The firm's bank details are sort code 40-12-88, account 71203344. Credit controller Sam Whitlow's salary is £38,500. Board finance summary requested by finance director Helen Okonkwo for Thursday's board.",
  entities: [
    { pattern: "brightwater(\\s+logistics(\\s+ltd)?)?", cls: "C", label: "client name", placeholder: "[client A]" },
    { pattern: "nadia\\s+ferreira|ferreira|\\bnadia\\b", cls: "C", label: "client contact", placeholder: "[contact]" },
    { pattern: "n\\.ferreira@brightwater-logistics\\.example", cls: "C", label: "client email", placeholder: "[contact email]" },
    { pattern: "07700\\s?900\\s?321", cls: "C", label: "client phone", placeholder: "[contact phone]" },
    { pattern: "cotton\\s*(&|and)\\s*mather(\\s+ltd)?", cls: "C", label: "client name", placeholder: "[client B]" },
    { pattern: "rob\\s+askew|askew", cls: "C", label: "client contact", placeholder: "[contact]" },
    { pattern: "halcyon(\\s+dental(\\s+group)?)?", cls: "C", label: "client name", placeholder: "[client C]" },
    { pattern: "priya\\s+menon|menon", cls: "C", label: "client contact", placeholder: "[contact]" },
    { pattern: "oakhurst(\\s+fabrics)?", cls: "C", label: "client name", placeholder: "[client D]" },
    { pattern: "lee\\s+danvers|danvers", cls: "C", label: "client contact", placeholder: "[contact]" },
    { pattern: "40-12-88|71203344", flags: "g", cls: "R", label: "bank details", placeholder: "" },
    { pattern: "£?\\s?38,?500(\\.00)?", flags: "g", cls: "R", label: "a salary", placeholder: "" },
    { pattern: "sam\\s+whitlow|whitlow", cls: "C", label: "a colleague", placeholder: "[colleague]" },
    { pattern: "INV[-\\s]?3(107|122|140|151|098)", flags: "gi", cls: "I", label: "invoice reference", placeholder: "[invoice]" },
  ],
  restrictedFallback: "Leave the bank details and any salary out; add them yourself afterwards.",
};

/* The aged debtors export, as the tool sees it. Client names are in the
 * material because the tool is the firm's own enterprise tool; the pack
 * still marks them CONFIDENTIAL so the learner keeps them out of a
 * prompt on any other tool. */
export const AGED_DEBTORS: AttachedDocument = {
  title: "Aged debtors, month end",
  kind: "Spreadsheet export, 4 rows",
  table: {
    columns: ["Client", "Invoice", "Amount", "Days", "Status", "Contact"],
    rows: [
      ["Brightwater Logistics Ltd", "INV-3107, INV-3122", "£42,300", "61", "Two statements sent, no reply", "Nadia Ferreira"],
      ["Cotton & Mather Ltd", "INV-3140", "£9,850", "34", "Disputed: short delivery", "Rob Askew"],
      ["Halcyon Dental Group", "INV-3151", "£3,120", "12", "Within terms", "Priya Menon"],
      ["Oakhurst Fabrics", "INV-3098", "£27,600", "92", "Payment plan, £4,600 a month", "Lee Danvers"],
      ["Total", "", "£82,870", "", "", ""],
    ],
  },
  sections: [
    {
      heading: "Summary",
      paragraphs: [{ text: "Total outstanding £82,870 across four clients. Over 60 days: £69,900 (two clients). Disputed: £9,850 (one client). On a payment plan: £27,600 (one client)." }],
    },
    {
      heading: "Rows",
      paragraphs: [
        { text: "Brightwater Logistics Ltd · INV-3107 and INV-3122 · £42,300 · 61 days · two statements sent, no reply · contact Nadia Ferreira." },
        { text: "Cotton & Mather Ltd · INV-3140 · £9,850 · 34 days · disputed: they say the delivery was short · contact Rob Askew." },
        { text: "Halcyon Dental Group · INV-3151 · £3,120 · 12 days · within terms · contact Priya Menon." },
        { text: "Oakhurst Fabrics · INV-3098 · £27,600 · 92 days · payment plan agreed in August, £4,600 a month, two instalments received · contact Lee Danvers." },
      ],
    },
    {
      heading: "Notes from credit control",
      paragraphs: [{ text: "Brightwater's accounts contact has changed; the new one has not been reached. Cotton & Mather's dispute needs the delivery note from operations. Oakhurst's plan is on track." }],
    },
  ],
};

export const SUPPLIER_STATEMENT: AttachedDocument = {
  title: "Supplier statement, Penrose Office Supplies",
  kind: "Statement, September",
  sections: [
    { heading: "Balance", paragraphs: [{ text: "Balance brought forward £2,140. Invoices this month £3,865 (five invoices). Payments received £2,140. Balance carried forward £3,865." }] },
    { heading: "Items", paragraphs: [{ text: "PO-8891 stationery £412; PO-8894 printer consumables £1,208; PO-8897 chairs £1,540; PO-8902 stationery £385; PO-8905 franking credit £320." }] },
    { heading: "Terms", paragraphs: [{ text: "Thirty days from invoice. Early settlement discount 2 percent within ten days." }] },
  ],
};

export const BOARD_REQUEST: AttachedDocument = {
  title: "Email from Helen Okonkwo, finance director",
  kind: "Email, Tuesday 09:14",
  emails: [
    { from: "Helen Okonkwo", subject: "Board pack, debtors slide", time: "09:14", preview: "Can I have one page on debtors for Thursday? The board do not want the full export…" },
    { from: "Penrose Office Supplies", subject: "Statement, September", time: "Mon", preview: "Please find attached your statement for September. Balance carried forward £3,865…" },
    { from: "Sam Whitlow", subject: "Brightwater: new accounts contact?", time: "Mon", preview: "Their old contact has left. Anyone got a name for the new one before I chase again?" },
    { from: "Operations", subject: "Re: Cotton & Mather delivery note", time: "Fri", preview: "Still looking for it. The driver's copy may be in the depot office." },
  ],
  sections: [
    { heading: "Subject: Board pack, debtors slide", paragraphs: [{ text: "Can I have one page on debtors for Thursday? The board do not want the full export. They want to know the position, what has changed since last month, and the two things I am asking them to decide. Plain English, no jargon, they are not all finance people. By Wednesday noon please." }] },
  ],
};

export const MONTH_END_STANDUP: AttachedDocument = {
  title: "Month-end stand-up",
  kind: "Meeting recap, Tuesday, 14 minutes",
  transcript: [
    { who: "Helen Okonkwo", line: "Quick round on debtors before the board pack. Sam, where are we on the big one?" },
    { who: "Sam Whitlow", line: "Brightwater is still quiet. Two statements, no reply, and their accounts contact has moved on. I need a name before I chase again." },
    { who: "Helen Okonkwo", line: "Then it goes to a director-level call this week. I will take that one myself if nobody has a contact by Thursday." },
    { who: "Sam Whitlow", line: "Cotton and Mather say the delivery was short. Operations are still looking for the delivery note." },
    { who: "Dev Patel", line: "The driver's copy might be at the depot. I can go through the Friday run sheets tomorrow." },
    { who: "Helen Okonkwo", line: "Please do. Until we have it, that balance stays out of the total I give the board." },
    { who: "Sam Whitlow", line: "Oakhurst's plan is on track, two instalments in. Halcyon is within terms." },
    { who: "Helen Okonkwo", line: "Good. Actions: Sam chases a Brightwater contact, Dev finds the delivery note by Wednesday, I draft the board page. Anything else? No. Thanks all." },
  ],
  sections: [
    { heading: "Recap", paragraphs: [{ text: "Debtors round before the board pack: the largest overdue account is unresponsive and escalates to a director-level call this week; one balance is disputed pending a delivery note; the payment plan is on track; the newest balance is within terms. Three actions were agreed." }] },
  ],
};
