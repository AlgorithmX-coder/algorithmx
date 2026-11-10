import { inbound, officeFolders, PEOPLE, SIGNATURE } from "../northfield";
import type { Check, Email, Job, OfficeState } from "../types";

/* E1.1 Monday's inbox (criteria OL-1, OL-8, SAFE-1). Twelve emails from
 * the weekend: file each into Deliveries, Invoices or HR, flag the two
 * that need a reply today, and report the fake e-signature email without
 * opening its link. Daniel's email gives the filing rules, as a real
 * manager would on a new starter's first Monday. */

type Folder = "Deliveries" | "Invoices" | "HR";
const FOLDERS: Folder[] = ["Deliveries", "Invoices", "HR"];
const KIND: Record<Folder, string> = { Deliveries: "delivery", Invoices: "invoice", HR: "HR" };

/* Where each email belongs, and whether it needs a reply today. */
const PLAN: Record<string, { folder?: Folder; today?: boolean; scam?: boolean }> = {
  "m-daniel": {},
  "m-sarah-short": { folder: "Deliveries", today: true },
  "m-kent": { folder: "Deliveries", today: true },
  "m-hale": { folder: "Invoices" },
  "m-bright": { folder: "Invoices" },
  "m-flour": { folder: "Deliveries" },
  "m-rota": { folder: "HR" },
  "m-xmas": { folder: "HR" },
  "m-pay": { folder: "HR" },
  "m-scam": { scam: true },
  "m-credit": { folder: "Invoices" },
  "m-dn": { folder: "Deliveries" },
  "m-starter": { folder: "HR" },
};

function seed(): OfficeState {
  const emails: Email[] = [
    inbound({
      id: "m-daniel",
      from: PEOPLE.daniel,
      subject: "Your inbox this morning",
      time: "08:31",
      body: `Morning,\n\nYou'll have a pile of emails from the weekend. Can you get your inbox to empty before 9:30?\n\nFile each one into the right folder:\n- Deliveries: anything about goods coming in or going out\n- Invoices: bills, credit notes and anything about paying\n- HR: rotas, pay, holidays and forms\n\nFlag the ones that need a reply from you today, so we can go through them at 9:30.\n\nIf anything looks dodgy, don't open the links. Report it.\n\nThanks,\nDaniel\n\n${SIGNATURE.daniel}`,
    }),
    inbound({
      id: "m-sarah-short",
      from: PEOPLE.sarah,
      subject: "Delivery 4417 is two pallets short",
      time: "Sat 07:40",
      body: `Hi,\n\nThe delivery that came in on Saturday morning (order 4417) is two pallets short. The delivery note says 12, but we counted 10.\n\nCould you check with the supplier and let me know by 3pm today?\n\nThanks,\nSarah\n\n${SIGNATURE.sarah}`,
    }),
    inbound({
      id: "m-kent",
      from: PEOPLE.imran,
      subject: "Late delivery on Friday",
      time: "Fri 16:55",
      body: "Hello,\n\nOur flour order on Friday arrived at 11:40, not 08:00 as booked. We had to close the bakery counter for the morning.\n\nPlease reply today to let us know what happened, and how you will stop it happening again.\n\nImran Ahmed\nOwner, Kent Bakery",
    }),
    inbound({
      id: "m-hale",
      from: PEOPLE.tom,
      subject: "Invoice HP-2291",
      time: "Fri 15:10",
      body: "Hi,\n\nPlease find invoice HP-2291 attached for order 4417, 12 pallets of wrap.\n\nPayment is due within 30 days.\n\nKind regards,\nTom Hale\nAccount Manager, Harlow Packaging",
      attachments: [{ name: "HP-2291.pdf" }],
    }),
    inbound({
      id: "m-bright",
      from: PEOPLE.brightwater,
      subject: "Invoice BC-5518 attached",
      time: "Fri 14:02",
      body: "Good afternoon,\n\nPlease find attached invoice BC-5518 for 30 cases of paper cups.\n\nBrightwater Cups Accounts",
      attachments: [{ name: "BC-5518.pdf" }],
    }),
    inbound({
      id: "m-flour",
      from: PEOPLE.kentFlour,
      subject: "Delivery booked for Thursday 12 November",
      time: "Fri 11:20",
      body: "Hello,\n\nThis is to confirm your delivery of 40 sacks of plain flour on Thursday 12 November, between 07:00 and 09:00.\n\nKent Flour Mills",
    }),
    inbound({
      id: "m-rota",
      from: PEOPLE.hr,
      subject: "Your rota for next week",
      time: "Fri 10:05",
      body: "Hi,\n\nYour shifts for 16 to 22 November are on the rota in the HR site. Let us know by Thursday if anything needs to change.\n\nHR Team",
    }),
    inbound({
      id: "m-xmas",
      from: PEOPLE.emma,
      subject: "Christmas holiday requests",
      time: "Thu 16:30",
      body: "Hi all,\n\nIf you'd like time off over Christmas, please send in a holiday request form by Friday 20 November. Requests are agreed in the order they arrive.\n\nThanks,\nEmma",
    }),
    inbound({
      id: "m-pay",
      from: PEOPLE.hr,
      subject: "Your October payslip is ready",
      time: "Thu 09:00",
      body: "Hi,\n\nYour payslip for October is ready to view in the HR site, under Pay.\n\nHR Team",
    }),
    inbound({
      id: "m-scam",
      from: { name: "DocShare Secure", address: "no-reply@docshare-secure-mail.example" },
      subject: "Invoice waiting for your signature",
      time: "Sun 23:14",
      body: "Dear user,\n\nA document has been shared with you and needs your signature within 24 hours, or it will expire.\n\nSign in with your work email and password to view it.\n\nDocShare Secure Team",
      fakeLink: { text: "Review and sign document", url: "northfield-supplies.docshare-login.example/sign-in" },
    }),
    inbound({
      id: "m-credit",
      from: PEOPLE.priya,
      subject: "Credit note from Harlow, no action needed",
      time: "Thu 14:45",
      body: "Hi,\n\nJust so you know: Harlow have sent a credit note for last month's damaged wrap. I've dealt with it, so nothing for you to do.\n\nPriya",
    }),
    inbound({
      id: "m-dn",
      from: PEOPLE.sarah,
      subject: "Missing delivery note for DN-40890",
      time: "Thu 13:12",
      body: `Hi,\n\nThe paper delivery note for DN-40890 has turned up in the canteen. I've put it back in the goods-in tray, so it's sorted.\n\nSarah\n\n${SIGNATURE.sarah}`,
    }),
    inbound({
      id: "m-starter",
      from: PEOPLE.emma,
      subject: "New starter form: signed copy received",
      time: "Wed 11:00",
      body: "Hi,\n\nThanks for sending your signed new starter form. It's all on file now.\n\nEmma",
    }),
  ];
  return { version: 0, files: officeFolders(), emails, mailFolders: [...FOLDERS] };
}

function check(s: OfficeState): Check[] {
  const byId = (id: string) => s.emails.find((e) => e.id === id);
  const out: Check[] = [];
  const add = (c: Omit<Check, "ok" | "fix">, ok: boolean, fix?: string) => out.push({ ...c, ok, fix: ok ? undefined : fix });

  for (const f of FOLDERS) {
    const wanted = Object.entries(PLAN).filter(([, p]) => p.folder === f).map(([id]) => byId(id)!);
    const wrong = wanted.filter((e) => e.folder !== f);
    const intruders = s.emails.filter((e) => e.folder === f && PLAN[e.id]?.folder !== f);
    const where = (e: Email) => (e.folder === "inbox" ? "is still in your Inbox" : `is in ${e.folder === "junk" ? "Junk email" : e.folder}`);
    add(
      { id: `folder-${f}`, code: "OL-8", group: "Filing", label: `Every ${KIND[f]} email is in ${f} (${wanted.length})` },
      wrong.length === 0 && intruders.length === 0,
      wrong.length
        ? `"${wrong[0].subject}" ${where(wrong[0])}. Open it, then Move to > ${f}.`
        : `"${intruders[0]?.subject}" is in ${f}, but it belongs ${PLAN[intruders[0]?.id ?? ""]?.folder ? `in ${PLAN[intruders[0].id].folder}` : "somewhere else"}.`,
    );
  }
  add(
    { id: "empty", code: "OL-8", group: "Filing", label: "Your inbox is empty" },
    s.emails.filter((e) => e.folder === "inbox" && e.id !== "m-daniel").length === 0,
    `${s.emails.filter((e) => e.folder === "inbox" && e.id !== "m-daniel").length} emails are still in your Inbox. Daniel's own email can stay.`,
  );

  const today = Object.entries(PLAN).filter(([, p]) => p.today).map(([id]) => byId(id)!);
  const missed = today.filter((e) => !e.flagged);
  const extra = s.emails.filter((e) => e.flagged && !PLAN[e.id]?.today && e.id !== "m-daniel");
  add(
    { id: "flags", code: "OL-1", group: "What needs doing today", label: "Flagged the two that need a reply today, and only those" },
    missed.length === 0 && extra.length === 0,
    missed.length
      ? `"${missed[0].subject}" asks for a reply today. Flag it so it gets dealt with.`
      : `"${extra[0]?.subject}" is flagged, but it doesn't need a reply today. Flags are for what you must act on, so unflag it.`,
  );

  const scam = byId("m-scam");
  add(
    { id: "reported", code: "SAFE-1", group: "Staying safe", label: "Reported the fake e-signature email" },
    !!scam?.reported,
    'The "Invoice waiting for your signature" email is a scam: an unknown sender, a 24-hour threat and a request for your password. Open it and press Report.',
  );
  add(
    { id: "no-click", code: "SAFE-1", group: "Staying safe", label: "Didn't click the link in it" },
    !scam?.clicked,
    "You clicked the link in the scam email. At work, tell IT at once and change your password. Next time, report it without opening anything in it.",
  );
  return out;
}

export const mondayInbox: Job = {
  id: "m1j1",
  slug: "monday-inbox",
  moduleId: "m1",
  moduleLabel: "Module 1: The work inbox",
  title: "Monday's inbox",
  summary: "Twelve emails from the weekend. File them, flag what needs a reply today, and spot the one that isn't what it seems.",
  clock: "08:32",
  deadline: "Daniel wants it done by 09:30",
  doneLine: "Inbox empty, today's two replies flagged, and the scam reported. That's a Monday handled.",
  brief: "Daniel has emailed you about your inbox. Read his email first, then do what he asks. When you think it's done, press Check my work.",
  hints: [
    "Open Daniel's email at the top. It tells you which folder is for what.",
    "Open each email, read what it's about, then use Move to and pick the folder.",
    "If an email asks for a reply today, press Flag before you move it.",
    "An email from someone you don't know, with a deadline and a sign-in link, is a scam. Use Report, and don't open the link.",
  ],
  seed,
  check,
  habits: [
    { label: "Put it where the brief says", checks: ["folder-Deliveries", "folder-Invoices", "folder-HR", "empty"] },
    { label: "Check your own work", checks: ["flags"] },
  ],
};
