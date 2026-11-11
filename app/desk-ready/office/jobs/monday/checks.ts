import { fold } from "../../admin";
import { numeric } from "../../formula";
import { calOf, clashes, dayLong, minutes, saidTo, timeRange, toMin, WORK_END, WORK_START } from "../../meetings";
import { KENT_STAFF, PEOPLE, YOU } from "../../northfield";
import { EMMA_CLARKSON, isInternal, SCAM_DOMAIN, SCAM_EMAIL_ID, SCAM_NUMBER } from "../../safety";
import { pathText, samePath, tabsOf, type Check, type Email, type Grid, type OfficeFile, type OfficeState, type Person } from "../../types";
import { followsHouseRule } from "../../word";
import {
  APPROVED,
  D2025,
  D2026,
  DELIVERIES,
  FILED_IDS,
  HP2291_ID,
  KF1180_ID,
  LOG_ID,
  LOOSE,
  MAIL,
  MEETING_SLOT,
  minuteOf,
  ORDERS_2026,
  OVERTIME_HOURS,
  OVERTIME_ID,
  OVERTIME_STAFF,
  PAIR,
  QUOTE,
  RITA_NUMBER,
  SHORT_LAST_WEEK,
  TO_APPROVE,
  TODAY,
  TODAYS,
  type Loose,
  type TodayDelivery,
} from "./data";

/* The ten jobs of Monday morning, each marked on the end state of the one
 * office record, never on the clicks. Every check carries its criterion
 * code, a plain label, and a kind fix that says what went wrong and how to
 * put it right. A check marked `core` is part of what "done" means for its
 * job (the criteria doc's "What a good admin does"); the others are the
 * habits and finer points, shown on the scorecard but not needed to count
 * the job as done. Where a module job already marks the same thing, these
 * follow its rules and wording, on this morning's data. */

export interface MorningCheck extends Check {
  job: string;
  core: boolean;
}

export interface MorningJob {
  id: string;
  title: string;
  /* The arrival that brings it (data.ts ARRIVALS). */
  arrival: string;
  /* After this office minute, a finished job counts as late. */
  due: number;
  dueText: string;
  /* What to do differently when it was late. */
  lateFix: string;
  /* A line for a CV (Module 13), in office words. */
  cv: string;
  check: (s: OfficeState) => MorningCheck[];
}

/* ── shared helpers ─────────────────────────────────────────────────── */

const sent = (s: OfficeState) => s.emails.filter((e) => e.folder === "sent");
const everyone = (e: Email) => [...e.to, ...e.cc, ...(e.bcc ?? [])];
const has = (people: Person[], p: Person) => people.some((x) => x.address.toLowerCase() === p.address.toLowerCase());
const sentTo = (s: OfficeState, p: Person) => sent(s).filter((e) => has(everyone(e), p));
const near = (a: number | null, b: number, tol = 0.005) => a !== null && Math.abs(a - b) < tol;
const isFormula = (g: Grid, r: number, c: number) => (g[r]?.[c] ?? "").trim().startsWith("=");
/* Every formula cell in a sheet, with what it works out. */
const formulaCells = (g: Grid) => g.flatMap((row, r) => row.map((v, c) => ({ r, c, v, n: isFormula(g, r, c) ? numeric(g, r, c) : null })).filter((x) => x.n !== null));
const lines = (body: string) => body.split("\n").map((l) => l.trim()).filter(Boolean);
const GREETING = /^(hi|hello|dear|good (morning|afternoon)|morning)\b/i;
/* The first line that isn't a greeting. */
const firstLine = (body: string) => lines(body).find((l) => !GREETING.test(l) && !/^[A-Z][a-z]+,$/.test(l)) ?? "";
const SIGN_OFF = /\b(kind regards|best wishes|many thanks|thanks|thank you|regards|best|cheers|all the best)\b/i;

function maker(job: string, out: MorningCheck[]) {
  return (c: { id: string; code: string; group: string; label: string; core?: boolean }, ok: boolean, fix?: string) => out.push({ ...c, id: `${job}-${c.id}`, job, core: c.core ?? true, ok, fix: ok ? undefined : fix });
}

/* ── 08:30 Sarah: this morning's delivery report ────────────────────── */

const REPORT_NAME = "2026-11-16 Delivery report.xlsx";
const dnKey = (s: string) => s.toUpperCase().replace(/[^0-9]/g, "");
const cellText = (g: Grid, r: number, c: number) => (g[r]?.[c] ?? "").trim();
function rowsFor(g: Grid, d: TodayDelivery): number[] {
  const out: number[] = [];
  g.forEach((row, r) => {
    if (r > 0 && dnKey(row[1] ?? "") === dnKey(d.dn)) out.push(r);
  });
  return out;
}
const hasToday = (f: OfficeFile) => !!f.sheet && TODAYS.some((d) => rowsFor(f.sheet as Grid, d).length > 0);

/* The report the learner made: the best placed of the sheets that hold
 * today's delivery notes. */
export function reportFile(s: OfficeState): { file?: OfficeFile; all: OfficeFile[] } {
  const all = s.files.filter((f) => (f.kind === "xlsx" || f.kind === "xltx") && !f.seeded && hasToday(f));
  const target = (f: OfficeFile) => samePath(f.path, D2026) && f.name.toLowerCase() === REPORT_NAME.toLowerCase();
  return { file: all.find(target) ?? all.find((f) => samePath(f.path, D2026)) ?? all[0], all };
}

function checkReport(s: OfficeState): MorningCheck[] {
  const out: MorningCheck[] = [];
  const add = maker("report", out);
  const { file, all } = reportFile(s);
  const g = file?.sheet ?? [];
  const counts = TODAYS.map((d) => rowsFor(g, d).length);
  const missing = TODAYS.filter((_, i) => counts[i] === 0).map((d) => d.dn);
  const doubled = TODAYS.filter((_, i) => counts[i] > 1).map((d) => d.dn);
  const group = "The report";
  add(
    { id: "rows", code: "XL-2", group, label: "All three deliveries are in, one row each" },
    !!file && !missing.length && !doubled.length,
    !file
      ? "No saved report has this morning's deliveries in it. Open the template in Deliveries, add the three delivery notes from Sarah's email, one row each, and save it."
      : missing.length
        ? `${missing.join(" and ")} ${missing.length === 1 ? "is" : "are"} missing from the report. Add a row for it, with the delivery note number in the Delivery note column.`
        : `${doubled.join(" and ")} ${doubled.length === 1 ? "is" : "are"} in twice. Delete the extra row.`,
  );
  const wrong: string[] = [];
  TODAYS.forEach((d) => {
    const r = rowsFor(g, d)[0];
    if (r === undefined) return;
    if (!d.supplierKey.test(cellText(g, r, 2))) wrong.push(`${d.dn}: the supplier should be ${d.supplier}.`);
    else if (!d.itemKey.test(cellText(g, r, 3))) wrong.push(`${d.dn}: the item should be ${d.item}.`);
    else if (numeric(g, r, 4) !== d.expected) wrong.push(`${d.dn}: Expected should be ${d.expected}, the number ordered.`);
    else if (numeric(g, r, 5) !== d.received) wrong.push(`${d.dn}: Received should be ${d.received}, the number that came off the van.`);
    else if (numeric(g, r, 6) !== d.expected - d.received) wrong.push(`${d.dn}: Short by should be ${d.expected - d.received}. Expected take away Received, as the older reports work it out.`);
    else if (!cellText(g, r, 7)) wrong.push(`${d.dn} has nobody in Checked by. Put your initials there.`);
  });
  add({ id: "facts", code: "XL-2", group, label: "Each row matches its delivery note, with Short by and Checked by filled in" }, !!file && missing.length < 3 && !wrong.length, wrong[0] ?? "Add the deliveries first.");
  const badDate = TODAYS.map((d) => rowsFor(g, d)[0]).find((r) => r !== undefined && cellText(g, r, 0) !== TODAY);
  add(
    { id: "dates", code: "XL-3", group, label: `Dates are written ${TODAY}, like every other report` },
    !!file && missing.length < 3 && badDate === undefined,
    badDate !== undefined ? `One date says "${cellText(g, badDate, 0) || "nothing"}". Write every date the same way: ${TODAY}.` : "Add the deliveries first.",
  );
  add(
    { id: "place", code: "SP-3", group: "Where you saved it", label: `Saved in ${pathText(D2026)}` },
    !!file && samePath(file.path, D2026),
    file ? `It's in ${pathText(file.path)}. Sarah asked for the 2026 folder in Deliveries. In File Explorer, select it and use Move to.` : "Save the report first: File > Save as.",
  );
  add(
    { id: "name", code: "SP-4", group: "Where you saved it", label: `Named "${REPORT_NAME}", like the others` },
    !!file && file.name.toLowerCase() === REPORT_NAME.toLowerCase(),
    file ? `It's called "${file.name}". The others are named year-month-day, then Delivery report: "${REPORT_NAME}". Select it in File Explorer and press Rename.` : "Save the report first.",
  );
  const strays = all.filter((f) => f !== file);
  add(
    { id: "one", code: "SP-3", group: "Where you saved it", label: "One copy only", core: false },
    !!file && !strays.length,
    file ? `There's a second copy: ${pathText(strays[0]?.path ?? [])} > ${strays[0]?.name}. Delete the extra one, so everyone works on the same report.` : "Save the report first.",
  );
  const toSarah = sentTo(s, PEOPLE.sarah).filter((e) => e.inReplyTo === MAIL.report || e.links.some((l) => !!file && l.fileName === file.name) || /deliver|report/i.test(e.subject));
  const mail = toSarah.find((e) => e.links.length > 0) ?? toSarah[toSarah.length - 1];
  const linked = !!mail && !!file && mail.links.some((l) => samePath(l.path, file.path) && l.fileName === file.name);
  const attached = !!mail && mail.attachments.length > 0;
  add(
    { id: "link", code: "SP-6", group: "Telling Sarah", label: "You replied to Sarah with a link to it" },
    linked && !attached,
    !mail
      ? "Nothing about the report has gone to Sarah. Open her email, press Reply, and use Insert link to add the report."
      : attached && !linked
        ? "You attached a copy. Sarah asked for a link, so everyone works on the one file in SharePoint. Reply again with Insert link instead."
        : mail.links.length
          ? `Your link goes to "${mail.links[0].fileName}", not this morning's report.`
          : "Your reply has no link. Reply again and use Insert link to add the report.",
  );
  add(
    { id: "short-told", code: "OL-4", group: "Telling Sarah", label: "You told her DN-11671 came 3 cases short", core: false },
    !!mail && (/11671/.test(mail.body) || (/short/i.test(mail.body) && /\b(3|three)\b/i.test(mail.body))),
    "Say the one thing she needs to know: DN-11671 from Brightwater came 3 cases short.",
  );
  return out;
}

/* ── 08:40 the changed-bank-details scam ────────────────────────────── */

const SCAM_WORDS = /hp-?2291|harlow|bank|scam|phish|fake|fraud|suspicious|dodgy|not genuine/i;
export const scamOf = (s: OfficeState) => s.emails.find((e) => e.id === SCAM_EMAIL_ID);
const rang = (s: OfficeState, number: string) => (s.phone?.calls ?? []).some((c) => c.way === "out" && fold(c.number) === fold(number));

function checkScam(s: OfficeState): MorningCheck[] {
  const out: MorningCheck[] = [];
  const add = maker("scam", out);
  const scam = scamOf(s);
  const group = "The scam email";
  const toScammer = sent(s).filter((e) => everyone(e).some((p) => p.address.toLowerCase().endsWith(`@${SCAM_DOMAIN}`)));
  const toPriya = sentTo(s, PEOPLE.priya);
  const fresh = toPriya.filter((e) => e.inReplyTo !== SCAM_EMAIL_ID && SCAM_WORDS.test(`${e.subject}\n${e.body}`));
  const forwarded = toPriya.some((e) => e.inReplyTo === SCAM_EMAIL_ID);
  const chatted = saidTo(s, PEOPLE.priya).some((x) => SCAM_WORDS.test(x.text));
  add(
    { id: "reported", code: "SAFE-1", group, label: "You reported it as phishing" },
    !!scam?.reported,
    "The email from harlow-packaging-uk.co is still in the mailbox. Open it and press Report, so it goes to Junk and IT can warn everyone. Its tells: a look-alike address, \"Dear Customer\", a rush to pay today, and new bank details.",
  );
  add(
    { id: "no-click", code: "SAFE-1", group, label: "You didn't open its payment link" },
    !scam?.clicked,
    `You opened "View and pay invoice HP-2291". It goes to ${SCAM_DOMAIN}, the scammer's own site. At work, tell IT straight away. Next time, point at a link first and read where it really goes, without clicking.`,
  );
  add(
    { id: "no-reply", code: "SAFE-2", group, label: "You didn't reply to the scammer" },
    !toScammer.length,
    "You emailed the scammer's address. Whatever you ask, they'll say it's genuine, and now they know someone reads this mailbox. Check with the real supplier instead, on a number you already hold.",
  );
  add(
    { id: "priya", code: "SAFE-2", group: "Telling Priya", label: "You told Priya not to pay it" },
    fresh.length > 0 || chatted || rang(s, "Ext 405"),
    forwarded
      ? "You forwarded the scam itself to Priya, link and all. Write her a new email instead (or a Teams message, or ring ext 405): the email about HP-2291's new bank details is a scam, so she mustn't pay it or change Harlow's details."
      : "Priya pays suppliers today. Tell her, by email, Teams or on ext 405: the email about HP-2291's new bank details is a scam, so she mustn't pay it or change Harlow's details.",
  );
  add(
    { id: "not-scam-number", code: "SAFE-2", group: "Telling Priya", label: "You didn't ring the number printed in the email", core: false },
    !rang(s, SCAM_NUMBER),
    `You rang ${SCAM_NUMBER}, the number in the scam. A scammer prints their own number, so the check reaches them. To check, ring Tom on the number we already hold, in the phone's Contacts.`,
  );
  return out;
}

/* ── 08:55 Daniel on Teams: book 45 minutes with Sarah and Emma ─────── */

const { sarah, emma, daniel, priya } = PEOPLE;
export const bookedInvites = (s: OfficeState) => calOf(s).meetings.filter((m) => m.sent && m.organiser.address === YOU.address && !m.id.startsWith("seed-") && (has(m.attendees, sarah) || has(m.attendees, emma)));

function checkMeeting(s: OfficeState): MorningCheck[] {
  const out: MorningCheck[] = [];
  const add = maker("meeting", out);
  const all = bookedInvites(s);
  const m = all[all.length - 1];
  const none = "Open Calendar and press New event. Add Sarah and Emma, find the time on the Scheduling Assistant, then press Send.";
  const group = "The invite";
  add(
    { id: "people", code: "TM-2", group, label: "An invite went to Sarah and Emma" },
    !!m && has(m.attendees, sarah) && has(m.attendees, emma),
    !m ? none : `It went to ${m.attendees.map((p) => p.name).join(" and ") || "nobody"}. Open it in your calendar, press Edit, and put Sarah Patel and Emma Clarke in Required attendees.`,
  );
  add({ id: "length", code: "TM-2", group, label: "45 minutes long" }, !!m && minutes(m) === 45, !m ? none : `It's ${minutes(m)} minutes. Daniel asked for 45: set the end time 45 minutes after the start.`);
  const hits = m ? clashes(s, m, m.room ? [YOU, sarah, emma, m.room] : [YOU, sarah, emma], m.id) : [];
  const inHours = !!m && toMin(m.start) >= WORK_START && toMin(m.end) <= WORK_END;
  add(
    { id: "free", code: "TM-2", group, label: `At the one time all three of you are free: ${dayLong(MEETING_SLOT.day)}, ${timeRange(MEETING_SLOT)}` },
    !!m && inHours && !hits.length,
    !m
      ? none
      : !inHours
        ? `It's at ${timeRange(m)}, outside working hours. Look between 09:00 and 17:30.`
        : `On ${dayLong(m.day)} at ${timeRange(m)}, ${hits.map((h) => `${h.who.address === YOU.address ? "you are" : `${h.who.name} is`} busy ${timeRange(h.busy)}`).join(", and ")}. Open the Scheduling Assistant and go day by day until every row is clear for 45 minutes.`,
  );
  add({ id: "where", code: "TM-2", group, label: "A room or a Teams link" }, !!m && (m.teams || !!m.room), "Daniel said a room or Teams. Turn on Teams meeting, or press Browse rooms and pick a free one.");
  add({ id: "agenda", code: "TM-2", group, label: "A title and a one-line agenda" }, !!m && m.title.trim().length > 2 && m.body.trim().length > 4, !m ? none : !m.title.trim() ? "Give it a title people will recognise, like \"Christmas cover rota\"." : "Add one line under the time saying what it's for, like \"Plan the Christmas cover rota\".");
  add({ id: "one", code: "TM-2", group, label: "Just one invite, so nobody gets two", core: false }, all.length <= 1, `You sent ${all.length} invites for this. Open the extra ones in your calendar and press Cancel meeting.`);
  const chat = saidTo(s, daniel).some((x) => /book|done|sent|invite|wed|18|14[:.]00|2pm|diary|calendar/i.test(x.text));
  const emailed = sentTo(s, daniel).some((e) => /book|invite|meeting|rota|wed/i.test(`${e.subject}\n${e.body}`));
  add(
    { id: "told", code: "TM-4", group: "Telling Daniel", label: "You told Daniel in his Teams chat that it's booked", core: false },
    chat,
    emailed ? "You emailed Daniel. He asked on Teams, and a quick \"Done\" is a chat message: email is for things that need a record." : "Close the loop in Daniel's Teams chat, in one line: \"Done, booked Wednesday 14:00 to 14:45.\"",
  );
  return out;
}

/* ── 09:10 Bright Cafe: a price for 15 cases of cups, with VAT ──────── */

function checkQuote(s: OfficeState): MorningCheck[] {
  const out: MorningCheck[] = [];
  const add = maker("quote", out);
  const replies = sentTo(s, EMMA_CLARKSON).filter((e) => !/overtime/i.test(`${e.subject} ${e.attachments.map((a) => a.name).join(" ")}`));
  const mail = replies.find((e) => /324/.test(e.body)) ?? replies[replies.length - 1];
  /* the quote: a sheet the learner saved, or the one on the email */
  const sheets: { g: Grid; file?: OfficeFile }[] = [
    ...s.files.filter((f) => !f.seeded && f.kind === "xlsx").flatMap((f) => tabsOf(f).map((t) => ({ g: t.grid, file: f }))),
    ...replies.flatMap((e) => e.attachments.flatMap((a) => (a.tabs ?? (a.sheet ? [{ name: "", grid: a.sheet }] : [])).map((t) => ({ g: t.grid })))),
  ];
  const quote = sheets.find(({ g }) => formulaCells(g).some((x) => near(x.n, QUOTE.gross))) ?? sheets.find(({ g }) => formulaCells(g).some((x) => near(x.n, QUOTE.net)));
  const g = quote?.g;
  const got = (n: number) => !!g && formulaCells(g).some((x) => near(x.n, n));
  const missing = !got(QUOTE.net) ? "net" : !got(QUOTE.vat) ? "VAT" : !got(QUOTE.gross) ? "total" : null;
  add(
    { id: "figures", code: "XL-6", group: "The quote", label: "Worked out with formulas: £270.00 net, £54.00 VAT, £324.00 with VAT" },
    !missing,
    !g
      ? "No quote with the right sums is saved. Open Quote template.xltx in Orders, put 15 cases of 8 oz cups at £18.00 (from the price list), and let formulas do the sums: =B6*C6 for the net, =D8*0.2 for the VAT, =D8+D9 for the total. Then save it."
      : `The ${missing} isn't worked out by a formula. Net is 15 × £18.00 = £270.00; VAT is 20% of that, £54.00; the total is £324.00. Use =D8*0.2 for the VAT and =D8+D9 for the total.`,
  );
  add(
    { id: "price", code: "OL-4", group: "Replying to Bright Cafe", label: "You replied to Emma Clarkson with the price: £324.00 including VAT" },
    !!mail && /324/.test(mail.body),
    !mail ? "Nothing has gone back to Bright Cafe. Open Emma Clarkson's email, press Reply, and give the price." : "Put the price in the email itself, so she sees it at once: £324.00 including VAT.",
  );
  const body = mail?.body ?? "";
  const greeted = GREETING.test(lines(body)[0] ?? "");
  const signed = lines(body).slice(-4).some((l) => SIGN_OFF.test(l));
  add(
    { id: "manners", code: "OL-3", group: "Replying to Bright Cafe", label: "It opens with a greeting and ends with a sign-off" },
    !!mail && greeted && signed,
    !mail ? "Reply to Emma Clarkson first." : !greeted ? "Open with a greeting for a customer, like \"Hi Emma\" or \"Dear Emma\"." : "End with a sign-off, like \"Kind regards\", then your name.",
  );
  const saved = s.files.find((f) => !f.seeded && f.kind === "xlsx" && /quote/i.test(f.name) && /bright/i.test(f.name));
  const savedOk = !!saved && samePath(saved.path, ORDERS_2026) && followsHouseRule(saved.name) && saved.name.startsWith("2026-11-16");
  add(
    { id: "saved", code: "SP-4", group: "The quote", label: 'Saved in Orders > 2026 as "2026-11-16 Quote Bright Cafe.xlsx", like the others', core: false },
    savedOk,
    saved ? `It's saved as ${pathText(saved.path)} > ${saved.name}. The others are named like "2026-11-10 Quote Bright Cafe.xlsx", in Orders > 2026: use today's date.` : "Save the quote in Operations Team > Documents > Orders > 2026, named like the others: \"2026-11-16 Quote Bright Cafe.xlsx\".",
  );
  add(
    { id: "attached", code: "SP-6", group: "Replying to Bright Cafe", label: "The quote is attached, not linked", core: false },
    !!mail && mail.attachments.some((a) => /quote/i.test(a.name)) && !mail.links.length,
    !mail ? "Reply to Emma Clarkson first." : mail.links.length ? "Bright Cafe are outside the company, so a SharePoint link won't open for them. Attach the quote instead." : "Attach the quote you saved, so they have it in writing.",
  );
  return out;
}

/* ── 09:25 Priya: is invoice KF-1180 OK to pay? ─────────────────────── */

function checkInvoice(s: OfficeState): MorningCheck[] {
  const out: MorningCheck[] = [];
  const add = maker("invoice", out);
  const kf = s.files.find((f) => f.id === KF1180_ID);
  const binned = (s.recycle ?? []).some((r) => r.file.id === KF1180_ID);
  const group = "The invoice";
  add(
    { id: "approved", code: "ADM-2", group, label: "KF-1180 matches its PO and DN-40915, so it's approved: moved to Finance > Invoices > Approved" },
    !!kf && samePath(kf.path, APPROVED),
    !kf
      ? binned
        ? "KF-1180 is in the Recycle bin. Never delete an invoice. Open the Recycle bin in File Explorer, restore it, then move it to Approved."
        : "Priya's invoice hasn't arrived yet, or is gone."
      : `It's still in ${pathText(kf.path)}. PO 3312 ordered 40 sacks at £14.20, DN-40915 shows all 40 arrived, and KF-1180 bills 40 at £14.20: £568.00, no VAT on flour. All three match, so select it in File Explorer and use Move to: Finance > Invoices > Approved.`,
  );
  const copies = s.files.filter((f) => f.id !== KF1180_ID && f.kind === "pdf" && /KF-?1180/i.test(f.name));
  add({ id: "once", code: "SP-3", group, label: "Moved, not copied: there's one KF-1180", core: false }, !copies.length, `There's a second KF-1180 in ${pathText(copies[0]?.path ?? [])}. Delete the copy, so Priya can't pay it twice.`);
  const hp = s.files.find((f) => f.id === HP2291_ID);
  add(
    { id: "hp-held", code: "ADM-1", group, label: "HP-2291 stays on hold in To approve" },
    !!hp && samePath(hp.path, TO_APPROVE),
    hp ? `HP-2291 is in ${pathText(hp.path)}. Priya asked for it to stay on hold until Harlow's credit note comes in. Move it back to Finance > Invoices > To approve.` : "HP-2291 has been deleted. Open the Recycle bin in File Explorer and restore it: Priya still has to pay for the 10 pallets that came.",
  );
  const told = sentTo(s, priya).some((e) => /kf-?1180|kent flour|approved|matches/i.test(`${e.subject}\n${e.body}`)) || saidTo(s, priya).some((x) => /kf-?1180|kent flour|approved/i.test(x.text));
  add({ id: "told", code: "OL-5", group: "Telling Priya", label: "You told Priya it's checked and approved", core: false }, told, "Close the loop with Priya in one line: \"KF-1180 matches the PO and DN-40915, so I've moved it to Approved.\"");
  return out;
}

/* ── 09:50 the phone: Oak Street Deli wants napkins on Wednesday ───── */

const RITA_DIGITS = fold(RITA_NUMBER);
const numbersIn = (t: string) => (t.match(/0[\d\s]{9,14}\d/g) ?? []).map((n) => fold(n)).filter((n) => n.length === 11);
export const phoneMessageMail = (s: OfficeState) => {
  const mails = sentTo(s, sarah).filter((e) => fold(e.body).includes(RITA_DIGITS) || /napkin|oak street|rita|fenwick|phone message/i.test(`${e.subject}\n${e.body}`));
  return mails.find((e) => fold(e.body).includes(RITA_DIGITS)) ?? mails[mails.length - 1];
};

function checkPhone(s: OfficeState): MorningCheck[] {
  const out: MorningCheck[] = [];
  const add = maker("phone", out);
  const mail = phoneMessageMail(s);
  const b = mail?.body ?? "";
  const answered = (s.phone?.answered ?? []).includes("mm-call-rita");
  const chatted = saidTo(s, sarah).some((x) => /napkin|oak street|rita/i.test(x.text));
  const first = chatted
    ? "You told Sarah on Teams. A phone message needs a record she can come back to, and she asked for those by email. Send it to her in Outlook."
    : answered
      ? "Nothing has gone to Sarah. In Outlook press New mail, send it to Sarah Patel, and put in who rang, what they want, the number and by when."
      : "The phone rang at 09:50 and nobody answered. Answer it (or open Phone) and listen to the call, then email the message to Sarah.";
  const group = "The message to Sarah";
  add({ id: "sent", code: "ADM-4", group, label: "You emailed the message to Sarah" }, !!mail, first);
  add({ id: "who", code: "ADM-4", group, label: "Who rang: Rita Fenwick from Oak Street Deli" }, !!mail && /(rita|fenwick)/i.test(b) && /oak street/i.test(b), !mail ? first : "Say who rang, with their company, in the email itself: Rita Fenwick from Oak Street Deli.");
  const what = b.replace(/0[\d\s]{9,14}\d/g, " ");
  add(
    { id: "what", code: "ADM-4", group, label: "What she wants: 10 packs of napkins added to Wednesday's delivery" },
    !!mail && /\b(10|ten)\b/i.test(what) && /napkin/i.test(what) && /wed/i.test(what),
    !mail ? first : "Give the change in full: 10 packs of napkins added to Wednesday's delivery (order 4436).",
  );
  const nums = numbersIn(b);
  add(
    { id: "number", code: "ADM-4", group, label: `The number to ring back: ${RITA_NUMBER}` },
    !!mail && fold(b).includes(RITA_DIGITS),
    !mail ? first : nums.length ? `The number in your email is ${nums[0].replace(/^(\d{4})(\d{3})(\d{4})$/, "$1 $2 $3")}. She said ${RITA_NUMBER}. Play the call again in Phone and check each digit.` : `Put her number in, so Sarah can ring straight back: ${RITA_NUMBER}.`,
  );
  add(
    { id: "deadline", code: "ADM-4", group, label: "By when: ring back before 12" },
    !!mail && /(before|by)\s*(12|twelve|noon|midday|lunch)|\b12\s*(pm|noon|o.?clock)|\b12[:.]00\b|\bnoon\b|\bmidday\b/i.test(b),
    !mail ? first : "Say by when she needs the call: before 12. Without it, Sarah might ring this afternoon, after Rita has gone.",
  );
  add(
    { id: "subject", code: "OL-2", group, label: "The subject says what it is", core: false },
    !!mail && /phone message|call/i.test(mail.subject) && /oak street|napkin|rita/i.test(mail.subject),
    !mail ? first : `Your subject is "${mail.subject || "(empty)"}". Say what it is and who it's from, like "Phone message: Oak Street Deli wants 10 packs of napkins on Wednesday".`,
  );
  return out;
}

/* ── 10:15 Emma: last week's overtime, totalled, to HR only ─────────── */

const HR_ONLY = [PEOPLE.emma.address, PEOPLE.hr.address];
/* Does an email carry the overtime: the sheet attached or linked, or the names and hours typed in. */
const carriesOvertime = (e: Email) =>
  e.attachments.some((a) => /overtime/i.test(a.name)) || e.links.some((l) => /overtime/i.test(l.fileName)) || OVERTIME_STAFF.filter((r) => e.body.includes(r[0]) || e.body.includes(r[1])).length >= 2;

/* Everyone who got the overtime sheet who shouldn't have: anyone but Emma
 * Clarke and the HR mailbox. Payroll is for HR only. */
export function overtimeLeaks(s: OfficeState): Person[] {
  const out: Person[] = [];
  for (const e of sent(s).filter(carriesOvertime)) for (const p of everyone(e)) if (!HR_ONLY.includes(p.address.toLowerCase()) && !has(out, p)) out.push(p);
  return out;
}

function checkOvertime(s: OfficeState): MorningCheck[] {
  const out: MorningCheck[] = [];
  const add = maker("overtime", out);
  const withSheet = sent(s).filter(carriesOvertime);
  const toHr = withSheet.filter((e) => everyone(e).some((p) => HR_ONLY.includes(p.address.toLowerCase())));
  const file = s.files.find((f) => f.id === OVERTIME_ID);
  /* what HR got: the sheet on the email, or the file the link opens */
  const grids = toHr.flatMap((e) => [
    ...e.attachments.filter((a) => /overtime/i.test(a.name)).flatMap((a) => (a.tabs ?? (a.sheet ? [{ name: "", grid: a.sheet }] : [])).map((t) => t.grid)),
    ...e.links.filter((l) => /overtime/i.test(l.fileName)).flatMap((l) => s.files.filter((f) => samePath(f.path, l.path) && f.name === l.fileName).flatMap((f) => tabsOf(f).map((t) => t.grid))),
  ]);
  const totalled = grids.some((g) => formulaCells(g).some((x) => /SUM/i.test(x.v) && near(x.n, OVERTIME_HOURS)));
  const fileTotal = !!file && tabsOf(file).some((t) => formulaCells(t.grid).some((x) => /SUM/i.test(x.v) && near(x.n, OVERTIME_HOURS)));
  const leaks = overtimeLeaks(s);
  const group = "The overtime figures";
  add(
    { id: "to-hr", code: "SAFE-4", group, label: "The overtime sheet went to Emma Clarke in HR" },
    toHr.length > 0,
    `Nothing with the overtime sheet has gone to Emma Clarke (${PEOPLE.emma.address}). It's in your OneDrive > Documents: "${file?.name ?? "the overtime sheet"}". Total it, save it, then send it to her.`,
  );
  add(
    { id: "total", code: "XL-5", group, label: `The total hours are worked out with a formula: ${OVERTIME_HOURS}` },
    totalled,
    fileTotal
      ? "The sheet has its total now, but what Emma got was sent before you added it. Send her the saved sheet again."
      : `Under the last name, put a label and =SUM(D2:D6) in the Overtime hours column. It should come to ${OVERTIME_HOURS}. Save, then send it.`,
  );
  const leak = leaks[0];
  add(
    { id: "only-hr", code: "SAFE-4", group, label: "Nobody else got it" },
    !leak,
    leak
      ? !isInternal(leak.address)
        ? `It went to ${leak.name} (${leak.address}), outside the company. That's everyone's pay sent to a stranger: a data breach. Outlook marked the address External. At work, tell Daniel straight away and ask them to delete it. Next time, read the address under the name before you press Send.`
        : `It also went to ${leak.name}. Payroll is for HR only, even inside the company. At work, tell Daniel and ask them to delete it.`
      : undefined,
  );
  return out;
}

/* ── 10:40 Kent Bakery says thanks, four of their staff on Cc ──────── */

function checkThanks(s: OfficeState): MorningCheck[] {
  const out: MorningCheck[] = [];
  const add = maker("thanks", out);
  const e = s.emails.find((x) => x.id === MAIL.thanks);
  add(
    { id: "filed", code: "OL-8", group: "The thank-you email", label: "Filed in your Customers folder" },
    e?.folder === "Customers",
    !e ? "Kent Bakery's email hasn't arrived yet." : e.folder === "junk" ? "You reported a genuine thank-you as phishing. Open Junk email, select it and use Move to: Customers." : e.folder === "inbox" ? "It's still in your inbox. It needs no action, so file it: select it and use Move to: Customers." : `It's in ${e.folder}. It's from a customer, so file it in Customers, with the others.`,
  );
  const replyAll = sent(s).some((x) => x.inReplyTo === MAIL.thanks && KENT_STAFF.filter((p) => has(everyone(x), p)).length >= 2);
  add({ id: "no-reply-all", code: "OL-5", group: "The thank-you email", label: "No Reply all to the whole bakery", core: false }, !replyAll, "You replied to all five of them. A thank-you needs no reply, and a Reply all lands in five busy inboxes. If you want to answer, reply to Imran alone.");
  return out;
}

/* ── 11:05 Daniel: how many deliveries were short last week? ────────── */

function checkShort(s: OfficeState): MorningCheck[] {
  const out: MorningCheck[] = [];
  const add = maker("short", out);
  const log = s.files.find((f) => f.id === LOG_ID);
  const logGrid = log ? tabsOf(log)[0]?.grid : undefined;
  const inLog = !!logGrid && formulaCells(logGrid).some((x) => /COUNTIF/i.test(x.v) && near(x.n, SHORT_LAST_WEEK));
  const elsewhere = s.files.filter((f) => !f.seeded && f.kind === "xlsx" && tabsOf(f).some((t) => t.grid.some((r) => r.includes("DN-11652")) && formulaCells(t.grid).some((x) => /COUNTIF/i.test(x.v) && near(x.n, SHORT_LAST_WEEK))));
  const anyCount = logGrid ? formulaCells(logGrid).find((x) => /COUNTIF/i.test(x.v)) : undefined;
  add(
    { id: "countif", code: "XL-7", group: "The count", label: `A COUNTIF counts the short deliveries: ${SHORT_LAST_WEEK}` },
    inLog || elsewhere.length > 0,
    anyCount
      ? `Your COUNTIF gives ${anyCount.n}. Point it at the Status column and the word "Short": =COUNTIF(H2:H13,"Short").`
      : `Open ${pathText(D2026)} > 2026-11-13 Weekly delivery log.xlsx. Under the list, type a label and =COUNTIF(H2:H13,"Short"), then save. It counts itself, so it updates if Sarah adds a note.`,
  );
  add({ id: "in-log", code: "SP-3", group: "The count", label: "Saved in the weekly log itself", core: false }, inLog, elsewhere.length ? `You saved your count in a copy (${elsewhere[0].name}). Put it in the log itself, so there's one version.` : "Save the count in the weekly log, where Daniel and Sarah will look.");
  const mails = sentTo(s, daniel).filter((e) => e.inReplyTo === MAIL.short || /short|deliver/i.test(`${e.subject}\n${e.body}`));
  const mail = mails[mails.length - 1];
  const answer = mail ? firstLine(mail.body) : "";
  add(
    { id: "answer", code: "XL-9", group: "Answering Daniel", label: `Your reply's first line gives the number: ${SHORT_LAST_WEEK}` },
    !!mail && /\b(4|four)\b/i.test(answer),
    !mail
      ? "Nothing has gone back to Daniel. Reply to his email with the number in the first line."
      : /\b(4|four)\b/i.test(mail.body)
        ? `The number is in there, but not first. Daniel asked for it in the first line: "${SHORT_LAST_WEEK} deliveries came in short last week."`
        : `Your reply doesn't give the right number. ${SHORT_LAST_WEEK} of last week's 12 deliveries came in short.`,
  );
  return out;
}

/* ── 11:30 Sarah: tidy the 2026 deliveries folder before the audit ──── */

const insideDeliveries = (f: OfficeFile) => f.path.length >= DELIVERIES.length && DELIVERIES.every((x, i) => f.path[i] === x);
const stem = (n: string) => n.replace(/\.[a-z]{3,4}$/i, "");

function checkTidy(s: OfficeState): MorningCheck[] {
  const out: MorningCheck[] = [];
  const add = maker("tidy", out);
  const now = (id: string) => s.files.find((f) => f.id === id);
  const binned = (id: string) => (s.recycle ?? []).some((r) => r.file.id === id || r.inside.some((f) => f.id === id));
  const pairLeft = PAIR.map(now).filter((f): f is OfficeFile => !!f);
  const kept = LOOSE.filter((l) => !PAIR.includes(l.id) || l.id === pairLeft[0]?.id)
    .map((l) => ({ l, f: now(l.id) }))
    .filter((x): x is { l: Loose; f: OfficeFile } => !!x.f);
  const group = "The 2026 folder";
  const badRule = kept.find(({ f }) => !followsHouseRule(f.name) || /\s[A-Z]{2,3}$/.test(stem(f.name)));
  const vague = kept.find(({ l, f }) => followsHouseRule(f.name) && !l.says.test(stem(f.name).slice(11)));
  const badDate = kept.find(({ l, f }) => followsHouseRule(f.name) && f.name.slice(0, 10) !== l.date);
  add(
    { id: "names", code: "SP-4", group, label: "Every file is named the house way: its own date, then what it is" },
    !badRule && !vague && !badDate,
    badRule
      ? `"${badRule.f.name}" doesn't follow the house rule. Year-month-day first, then a few words saying what it is, with no "final", "v2", "copy" or initials: for example "${badRule.l.example}". Select it in File Explorer and press Rename.`
      : vague
        ? `"${vague.f.name}" has the date right, but the words after it don't say what's in it. Open it and say what it is, like "${vague.l.example}".`
        : badDate
          ? `"${badDate.f.name}" has the wrong date. Open it: the date inside is ${badDate.l.date.split("-").reverse().join("/")}, so the name starts ${badDate.l.date}.`
          : undefined,
  );
  const wrongYear = kept.find(({ l, f }) => !samePath(f.path, l.year === "2025" ? D2025 : D2026));
  add(
    { id: "years", code: "WIN-5", group, label: "Last year's files are in the 2025 folder, this year's in 2026" },
    kept.length > 0 && !wrongYear,
    wrongYear ? `"${wrongYear.f.name}" is in ${pathText(wrongYear.f.path)}. It's from ${wrongYear.l.year}, so it goes in Deliveries > ${wrongYear.l.year}: select it and use Move to, or drag it onto the folder.` : "Move each file into its year's folder.",
  );
  add(
    { id: "dup", code: "SP-3", group, label: 'The "Copy of" duplicate is deleted, and one copy is kept' },
    pairLeft.length === 1,
    pairLeft.length === 2
      ? `"${pairLeft[1].name}" and "${pairLeft[0].name}" are the same report twice. Open both to see. Delete the copy, so there's one version in one place.`
      : "Both copies of last Friday's report are gone. Open the Recycle bin in File Explorer, pick one and press Restore: the auditors need one.",
  );
  const others = [...LOOSE.filter((l) => !PAIR.includes(l.id)).map((l) => l.id), ...FILED_IDS];
  const missing = others.find((id) => !now(id));
  const strayed = others.map(now).find((f) => f && !insideDeliveries(f));
  const nameOf = (id: string) => LOOSE.find((l) => l.id === id)?.name ?? (s.recycle ?? []).find((r) => r.file.id === id)?.file.name ?? "A file";
  add(
    { id: "kept", code: "SP-3", group, label: "Nothing else was deleted or moved out of Deliveries" },
    !missing && !strayed,
    missing
      ? `"${nameOf(missing)}" ${binned(missing) ? "is in the Recycle bin" : "is gone"}. Every file but the duplicate is needed for the audit. ${binned(missing) ? "Open the Recycle bin in File Explorer, select it and press Restore." : ""}`.trim()
      : strayed
        ? `"${strayed.name}" is now in ${pathText(strayed.path)}, outside Deliveries, where the auditors won't look. Move it back into its year's folder.`
        : undefined,
  );
  const told = sentTo(s, sarah).some((e) => e.inReplyTo === MAIL.tidy || /tid|sort|folder|audit/i.test(`${e.subject}\n${e.body}`));
  add({ id: "told", code: "OL-5", group: "Telling Sarah", label: "You told Sarah it's done", core: false }, told, 'Close the loop: reply to Sarah\'s email in one line, like "Done, the 2026 folder is tidy for the audit."');
  return out;
}

/* ── the ten, in the order they arrive ──────────────────────────────── */

export const MORNING_JOBS: MorningJob[] = [
  { id: "report", title: "This morning's delivery report", arrival: "a-report", due: minuteOf("09:30"), dueText: "Sarah needed it by 09:30", lateFix: "Sarah needed it for her 09:30 stand-up. A job with a deadline goes first, or tell the person early if you can't make it.", cv: "Logged the morning's deliveries in Excel and saved the report to the team's SharePoint site", check: checkReport },
  { id: "scam", title: "The changed bank details", arrival: "a-scam", due: minuteOf("09:30"), dueText: "a scam is stopped as soon as it's spotted", lateFix: "A scam goes to the top of the pile: report it and tell Priya the moment you spot it. It takes two minutes.", cv: "Spotted and reported a changed-bank-details scam before any money was paid", check: checkScam },
  { id: "meeting", title: "Book 45 minutes with Sarah and Emma", arrival: "a-meeting", due: minuteOf("11:00"), dueText: "Daniel wanted it in the diary before 11:00", lateFix: "Daniel wanted it booked before his 11:00 call. Quick jobs with a deadline are worth doing early.", cv: "Found a free slot across three diaries and booked the meeting in Outlook", check: checkMeeting },
  { id: "quote", title: "A price for Bright Cafe, with VAT", arrival: "a-quote", due: minuteOf("12:00"), dueText: "Bright Cafe order at 12:00", lateFix: "Bright Cafe order at 12. A customer waiting on a price can take their order elsewhere.", cv: "Priced a customer quote with VAT using Excel formulas", check: checkQuote },
  { id: "invoice", title: "Is invoice KF-1180 OK to pay?", arrival: "a-invoice", due: minuteOf("11:00"), dueText: "Priya pays at 11:00", lateFix: "Priya's payment run was at 11. Late means the supplier waits another week for their money.", cv: "Checked a supplier invoice against the purchase order and delivery note before payment", check: checkInvoice },
  { id: "phone", title: "The phone call from Oak Street Deli", arrival: "a-phone", due: minuteOf("10:30"), dueText: "a phone message is passed on straight away", lateFix: "Rita needed a call back before 12. Pass a phone message on straight away, so the person has time to act.", cv: "Took a customer's phone message and passed it on accurately by email", check: checkPhone },
  { id: "overtime", title: "Last week's overtime, to HR", arrival: "a-overtime", due: minuteOf("11:30"), dueText: "Emma needed it by 11:30", lateFix: "Emma needed the figures by 11:30 for payroll. Late overtime means late pay for five people.", cv: "Totalled overtime with a formula and sent payroll data only to HR", check: checkOvertime },
  { id: "thanks", title: "Kent Bakery's thank-you", arrival: "a-thanks", due: minuteOf("12:30"), dueText: "by the end of the morning", lateFix: "", cv: "Kept a busy inbox filed and organised", check: checkThanks },
  { id: "short", title: "How many deliveries were short?", arrival: "a-short", due: minuteOf("12:00"), dueText: "Daniel's call was at 12:00", lateFix: "Daniel needed the number for his 12:00 call. An answer after the meeting is no use to him.", cv: "Counted short deliveries with COUNTIF and answered the manager in one line", check: checkShort },
  { id: "tidy", title: "Tidy the 2026 deliveries folder", arrival: "a-tidy", due: minuteOf("12:30"), dueText: "before lunch, for the audit", lateFix: "", cv: "Tidied a shared SharePoint folder to the house naming rule before an audit", check: checkTidy },
];

/* Every check of the morning, job by job. */
export const checkMorning = (s: OfficeState): MorningCheck[] => MORNING_JOBS.flatMap((j) => j.check(s));
/* Done means every one of the job's core checks passes. */
export const isDone = (checks: MorningCheck[]) => checks.filter((c) => c.core).every((c) => c.ok);

