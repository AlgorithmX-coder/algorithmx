import { describe, expect, it } from "vitest";
import { numeric } from "../../formula";
import { calOf } from "../../meetings";
import { KENT_STAFF, PEOPLE, YOU } from "../../northfield";
import { EMMA_CLARKSON, SCAM_EMAIL_ID } from "../../safety";
import { samePath, type Email, type Meeting, type OfficeFile, type OfficeState, type Person } from "../../types";
import { checkMorning, isDone, MORNING_JOBS } from "./checks";
import {
  APPROVED,
  ARRIVALS,
  clockAt,
  D2025,
  D2026,
  DANIEL_CHAT,
  HP2291_ID,
  KF1180_ID,
  LENGTH,
  LOG_ID,
  LOOSE,
  MAIL,
  MEETING_SLOT,
  minuteOf,
  ORDERS_2026,
  OVERTIME_ID,
  QUOTE_TEMPLATE,
  report,
  REPORT_WIDTHS,
  SHORT_LAST_WEEK,
  TODAYS,
} from "./data";
import { advance, carry, finish, mondayMorning, morningOf, PASS_MARK, score, watch } from "./morning";

/* The final task: a fresh morning fails every job; a morning done well
 * passes, on time; each planted mistake fails its own check; and the pass
 * rule and the "late" rule hold. */

const fresh = () => advance(mondayMorning.seed(), 0);
/* The whole morning delivered, with nothing done. */
const allIn = () => advance(mondayMorning.seed(), LENGTH - 1);
const failing = (s: OfficeState, job: string) =>
  checkMorning(s)
    .filter((c) => c.job === job && !c.ok)
    .map((c) => c.id.replace(`${job}-`, ""));
const statusOf = (s: OfficeState, job: string) => score(s).jobs.find((j) => j.job.id === job)!.status;

let n = 0;
const sent = (to: Person[], subject: string, body: string, over: Partial<Email> = {}): Email => ({ id: `mail-t${n++}`, folder: "sent", from: YOU, to, cc: [], subject, body, time: "Just now", attachments: [], links: [], ...over });
const send = (s: OfficeState, e: Email): OfficeState => ({ ...s, emails: [...s.emails, e] });
const file = (s: OfficeState, id: string) => s.files.find((f) => f.id === id)!;
const put = (s: OfficeState, f: OfficeFile): OfficeState => ({ ...s, files: [...s.files.filter((x) => x.id !== f.id), f] });
const move = (s: OfficeState, id: string, path: readonly string[], name?: string): OfficeState => put(s, { ...file(s, id), path, name: name ?? file(s, id).name });
const drop = (s: OfficeState, id: string): OfficeState => ({ ...s, files: s.files.filter((f) => f.id !== id) });

/* ── each job, done the way a good admin does it ────────────────────── */

const REPORT: OfficeFile = {
  id: "my-report",
  path: D2026,
  name: "2026-11-16 Delivery report.xlsx",
  kind: "xlsx",
  modified: "Today",
  by: "You",
  sheet: report(TODAYS.map((d) => ["16/11/2026", d.dn, d.supplier, d.item, String(d.expected), String(d.received), "AB"])),
  widths: REPORT_WIDTHS,
};
const doReport = (s: OfficeState, f: OfficeFile = REPORT) =>
  send(put(s, f), sent([PEOPLE.sarah], "Re: This morning's deliveries", "Hi Sarah,\n\nDone, the report is in Deliveries > 2026. DN-11671 from Brightwater came 3 cases short.\n\nThanks", { inReplyTo: MAIL.report, links: [{ name: REPORT.name, path: D2026, fileName: REPORT.name }] }));

const doScam = (s: OfficeState) =>
  send({ ...s, emails: s.emails.map((e) => (e.id === SCAM_EMAIL_ID ? { ...e, reported: true, folder: "junk" } : e)) }, sent([PEOPLE.priya], "Don't pay HP-2291 to new bank details", "Hi Priya,\n\nAn email asking us to pay HP-2291 to new bank details is a scam. I've reported it. Please don't pay it.\n\nThanks"));

const MEETING: Meeting = { id: "my-meeting", title: "Christmas cover rota", organiser: YOU, attendees: [PEOPLE.sarah, PEOPLE.emma], teams: true, ...MEETING_SLOT, body: "Plan the Christmas cover rota", sent: true };
const withMeeting = (s: OfficeState, m: Meeting) => ({ ...s, calendar: { ...calOf(s), meetings: [...calOf(s).meetings, m] } });
const chatDaniel = (s: OfficeState, text: string): OfficeState => ({ ...s, teams: { ...s.teams!, chats: s.teams!.chats.map((c) => (c.id === DANIEL_CHAT ? { ...c, messages: [...c.messages, { id: `m${n++}`, from: YOU, text, time: "09:05" }] } : c)) } });
const doMeeting = (s: OfficeState) => chatDaniel(withMeeting(s, MEETING), "Done, booked Wednesday 14:00 to 14:45 on Teams.");

const quoteSheet = () => {
  const g = QUOTE_TEMPLATE();
  g[1][1] = "Bright Cafe";
  g[2][1] = "16/11/2026";
  g[5] = ["Paper cups, 8 oz", "15", "£18.00", "=B6*C6"];
  g[7][3] = "=D6";
  g[8][3] = "=D8*0.2";
  g[9][3] = "=D8+D9";
  return g;
};
const QUOTE_FILE: OfficeFile = { id: "my-quote", path: ORDERS_2026, name: "2026-11-16 Quote Bright Cafe.xlsx", kind: "xlsx", modified: "Today", by: "You", sheet: quoteSheet() };
const doQuote = (s: OfficeState, f: OfficeFile = QUOTE_FILE) =>
  send(put(s, f), sent([EMMA_CLARKSON], "Re: Price for cups, please", "Hi Emma,\n\n15 cases of 8 oz paper cups come to £270.00, plus VAT of £54.00: £324.00 in all. The quote is attached.\n\nKind regards,\nAlex", { inReplyTo: MAIL.quote, attachments: [{ name: f.name, sheet: f.sheet }] }));

const doInvoice = (s: OfficeState) => send(move(s, KF1180_ID, APPROVED), sent([PEOPLE.priya], "Re: Invoice KF-1180: OK to pay?", "Hi Priya,\n\nKF-1180 matches PO 3312 and DN-40915, so I've moved it to Approved.\n\nThanks"));

const PHONE_BODY = "Hi Sarah,\n\nRita Fenwick from Oak Street Deli rang at 09:50. She'd like 10 packs of napkins added to Wednesday's delivery (order 4436). Please ring her back to confirm before 12, on 0116 496 0519.\n\nThanks";
const doPhone = (s: OfficeState, body = PHONE_BODY) => send(s, sent([PEOPLE.sarah], "Phone message: Oak Street Deli wants 10 packs of napkins on Wednesday", body));

const totalled = (s: OfficeState) => {
  const f = file(s, OVERTIME_ID);
  const g = f.sheet!.map((r) => [...r]);
  g[7] = ["Total", "", "", "=SUM(D2:D6)", "", "=SUM(F2:F6)"];
  return { ...f, sheet: g };
};
const doOvertime = (s: OfficeState, to: Person[] = [PEOPLE.emma]) => {
  const f = totalled(s);
  return send(put(s, f), sent(to, "Last week's overtime", "Hi Emma,\n\nHere are last week's overtime figures, with the total at the bottom.\n\nThanks", { attachments: [{ name: f.name, sheet: f.sheet }] }));
};

const doThanks = (s: OfficeState) => ({ ...s, emails: s.emails.map((e) => (e.id === MAIL.thanks ? { ...e, folder: "Customers" } : e)) });

const doShort = (s: OfficeState, body = "Hi Daniel,\n\n4 deliveries came in short last week.\n\nThanks") => {
  const f = file(s, LOG_ID);
  const g = f.sheet!.map((r) => [...r]);
  g[15] = ["", "", "", "", "", "", "Short deliveries", '=COUNTIF(H2:H13,"Short")'];
  return send(put(s, { ...f, sheet: g, by: "You" }), sent([PEOPLE.daniel], "Re: Short deliveries last week", body, { inReplyTo: MAIL.short }));
};

const doTidy = (s: OfficeState) => {
  let t = drop(s, "mm-copy");
  for (const l of LOOSE.filter((x) => x.id !== "mm-copy")) t = move(t, l.id, l.year === "2025" ? D2025 : D2026, l.example);
  return send(t, sent([PEOPLE.sarah], "Re: Tidy the 2026 deliveries folder before the audit", "Done, the 2026 folder is tidy for the audit.", { inReplyTo: MAIL.tidy }));
};

const SOLVE: Record<string, (s: OfficeState) => OfficeState> = { report: doReport, scam: doScam, meeting: doMeeting, quote: doQuote, invoice: doInvoice, phone: doPhone, overtime: doOvertime, thanks: doThanks, short: doShort, tidy: doTidy };
/* A whole morning, each job finished at the minute given (default: just after it arrives). */
const play = (skip: string[] = [], at: Record<string, number> = {}) => {
  let s = mondayMorning.seed();
  const timed = MORNING_JOBS.map((j) => ({ j, when: at[j.id] ?? ARRIVALS.find((a) => a.id === j.arrival)!.at + 5 })).sort((a, b) => a.when - b.when);
  for (const { j, when } of timed) {
    s = advance(s, Math.max(0, when - morningOf(s).minute));
    if (!skip.includes(j.id)) s = SOLVE[j.id](s);
    s = watch(s) ?? s;
  }
  return s;
};

/* ── the clock and the arrivals ─────────────────────────────────────── */

describe("the Monday morning clock", () => {
  it("runs from 08:30 to 12:30", () => {
    expect(clockAt(0)).toBe("08:30");
    expect(clockAt(minuteOf("10:15"))).toBe("10:15");
    expect(clockAt(LENGTH)).toBe("12:30");
    expect(minuteOf("12:30")).toBe(240);
  });
  it("lands each arrival at its own office time, never all at once", () => {
    const s0 = fresh();
    expect(s0.emails.some((e) => e.id === MAIL.report)).toBe(true);
    expect(s0.emails.some((e) => e.id === SCAM_EMAIL_ID)).toBe(false);
    const s1 = advance(s0, minuteOf("08:39"));
    expect(s1.emails.some((e) => e.id === SCAM_EMAIL_ID)).toBe(false);
    const s2 = advance(s1, 1);
    const scam = s2.emails.find((e) => e.id === SCAM_EMAIL_ID)!;
    expect(scam.time).toBe("08:40");
    expect(scam.unread).toBe(true);
    expect(s2.emails[0].id).toBe(SCAM_EMAIL_ID); // newest first
    const s3 = advance(s2, minuteOf("08:55") - minuteOf("08:40"));
    expect(s3.teams!.chats.find((c) => c.id === DANIEL_CHAT)!.unread).toBe(1);
    const s4 = advance(s3, minuteOf("09:50") - minuteOf("08:55"));
    expect(s4.phone!.calls[0]).toMatchObject({ id: "mm-call-rita", ringing: true, time: "09:50" });
    expect(s4.files.some((f) => f.id === KF1180_ID)).toBe(true);
    expect(morningOf(s4).arrived).toHaveLength(6);
  });
  it("lands each arrival once, however the clock gets there", () => {
    const a = advance(mondayMorning.seed(), LENGTH - 1);
    const b = Array.from({ length: LENGTH - 1 }).reduce<OfficeState>((s) => advance(s, 1), advance(mondayMorning.seed(), 0));
    expect(morningOf(a).arrived).toEqual(ARRIVALS.map((x) => x.id));
    expect(b.emails.map((e) => e.id).sort()).toEqual(a.emails.map((e) => e.id).sort());
  });
  it("ends at 12:30 and keeps the result", () => {
    const s = advance(fresh(), 500);
    expect(morningOf(s).minute).toBe(LENGTH);
    expect(morningOf(s).endedAt).toBe(LENGTH);
    expect(morningOf(s).result).toMatchObject({ passed: false, done: 0 });
    expect(advance(s, 5)).toBe(s);
  });
  it("can be finished early, and what hasn't arrived counts as not reached", () => {
    const s = finish(advance(fresh(), minuteOf("10:00")));
    expect(morningOf(s).endedAt).toBe(minuteOf("10:00"));
    expect(statusOf(s, "tidy")).toBe("unreached");
    expect(statusOf(s, "report")).toBe("missed");
  });
  it("keeps the record well under the account's size limit", () => {
    expect(JSON.stringify(play()).length).toBeLessThan(200_000);
  });
});

/* ── the ten jobs ───────────────────────────────────────────────────── */

describe("Monday morning: the ten jobs", () => {
  it("fails every job in a fresh office, with everything arrived", () => {
    const s = allIn();
    for (const j of MORNING_JOBS) expect(isDone(j.check(s)), j.id).toBe(false);
  });
  it("passes every check when each job is done well", () => {
    const s = play();
    expect(checkMorning(s).filter((c) => !c.ok).map((c) => c.id)).toEqual([]);
  });
  it("gives every check a criterion code, a label and a fix when missed", () => {
    for (const c of checkMorning(allIn())) {
      expect(c.code).toMatch(/^[A-Z]{2,4}-\d$/);
      expect(c.label.length).toBeGreaterThan(5);
      if (!c.ok) expect(c.fix?.length ?? 0, c.id).toBeGreaterThan(10);
      expect(`${c.label} ${c.fix ?? ""}`).not.toMatch(/[–—]/);
    }
  });

  it("report: wrong folder, wrong name, an attachment instead of a link", () => {
    const s = allIn();
    expect(failing(doReport(s), "report")).toEqual([]);
    const downloads = send(put(s, { ...REPORT, path: ["OneDrive", "Downloads"] }), sent([PEOPLE.sarah], "Re: This morning's deliveries", "Done", { inReplyTo: MAIL.report, links: [{ name: REPORT.name, path: ["OneDrive", "Downloads"], fileName: REPORT.name }] }));
    expect(failing(downloads, "report")).toContain("place");
    expect(failing(put(doReport(s), { ...REPORT, name: "delivery report final.xlsx" }), "report")).toContain("name");
    const attached = send(put(s, REPORT), sent([PEOPLE.sarah], "Re: This morning's deliveries", "Here it is. DN-11671 was 3 short.", { inReplyTo: MAIL.report, attachments: [{ name: REPORT.name, sheet: REPORT.sheet }] }));
    expect(failing(attached, "report")).toEqual(["link"]);
    const g = REPORT.sheet!.map((r) => [...r]);
    g[3][5] = "30";
    expect(failing(doReport(s, { ...REPORT, sheet: g }), "report")).toContain("facts");
    const d = REPORT.sheet!.map((r) => [...r]);
    d[1][0] = "16 Nov";
    expect(failing(doReport(s, { ...REPORT, sheet: d }), "report")).toContain("dates");
  });

  it("scam: a click is a payment; a reply or a forward is not stopping it", () => {
    const s = allIn();
    expect(failing(doScam(s), "scam")).toEqual([]);
    const clicked = { ...doScam(s), emails: doScam(s).emails.map((e) => (e.id === SCAM_EMAIL_ID ? { ...e, clicked: true } : e)) };
    expect(failing(clicked, "scam")).toEqual(["no-click"]);
    const scam = s.emails.find((e) => e.id === SCAM_EMAIL_ID)!;
    expect(failing(send(doScam(s), sent([scam.from], "Re: new bank details", "Is this genuine?", { inReplyTo: SCAM_EMAIL_ID })), "scam")).toEqual(["no-reply"]);
    const reported = { ...s, emails: s.emails.map((e) => (e.id === SCAM_EMAIL_ID ? { ...e, reported: true, folder: "junk" } : e)) };
    expect(failing(send(reported, sent([PEOPLE.priya], "FW: new bank details", "", { inReplyTo: SCAM_EMAIL_ID })), "scam")).toEqual(["priya"]);
  });

  it("meeting: the one free slot, 45 minutes, both people, a Teams line to Daniel", () => {
    const s = allIn();
    expect(failing(doMeeting(s), "meeting")).toEqual([]);
    const thu = chatDaniel(withMeeting(s, { ...MEETING, day: "2026-11-19", start: "11:00", end: "11:45" }), "Done, booked");
    expect(failing(thu, "meeting")).toEqual(["free"]);
    const short = chatDaniel(withMeeting(s, { ...MEETING, end: "14:30" }), "Done, booked");
    expect(failing(short, "meeting")).toEqual(["length"]);
    const room2 = chatDaniel(withMeeting(s, { ...MEETING, teams: false, room: calOf(s).rooms[1] }), "Done, booked");
    expect(failing(room2, "meeting")).toEqual(["free"]);
    expect(failing(withMeeting(s, { ...MEETING, attendees: [PEOPLE.sarah] }), "meeting")).toEqual(["people", "told"]);
    expect(failing(withMeeting(s, { ...MEETING, body: "" }), "meeting")).toEqual(["agenda", "told"]);
    const emailed = send(withMeeting(s, MEETING), sent([PEOPLE.daniel], "Meeting booked", "Booked Wednesday."));
    expect(failing(emailed, "meeting")).toEqual(["told"]);
    expect(isDone(MORNING_JOBS[2].check(emailed))).toBe(true);
  });

  it("quote: figures by formula, the price in the reply, a customer greeting", () => {
    const s = allIn();
    expect(failing(doQuote(s), "quote")).toEqual([]);
    const typed = quoteSheet();
    typed[8][3] = "54";
    typed[9][3] = "324";
    const typedQuote = send(put(s, { ...QUOTE_FILE, sheet: typed }), sent([EMMA_CLARKSON], "Re: Price", "Hi Emma,\n\n£324.00 with VAT.\n\nKind regards", { attachments: [{ name: QUOTE_FILE.name, sheet: typed }] }));
    expect(failing(typedQuote, "quote")).toEqual(["figures"]);
    expect(failing(send(put(s, QUOTE_FILE), sent([EMMA_CLARKSON], "Re: Price", "£324.00", { attachments: [{ name: QUOTE_FILE.name, sheet: QUOTE_FILE.sheet }] })), "quote")).toEqual(["manners"]);
    const linked = send(put(s, QUOTE_FILE), sent([EMMA_CLARKSON], "Re: Price", "Hi Emma,\n\n£324.00 with VAT.\n\nKind regards", { links: [{ name: QUOTE_FILE.name, path: ORDERS_2026, fileName: QUOTE_FILE.name }] }));
    expect(failing(linked, "quote")).toEqual(["attached"]);
    expect(failing(doQuote(s, { ...QUOTE_FILE, path: ["OneDrive", "Documents"] }), "quote")).toEqual(["saved"]);
  });

  it("invoice: approve the one that matches, leave HP-2291 on hold, move rather than copy", () => {
    const s = allIn();
    expect(failing(doInvoice(s), "invoice")).toEqual([]);
    expect(failing(s, "invoice")).toEqual(["approved", "told"]);
    expect(failing(move(doInvoice(s), HP2291_ID, APPROVED), "invoice")).toEqual(["hp-held"]);
    const copy = put(doInvoice(s), { ...file(s, KF1180_ID), id: "copy", seeded: undefined });
    expect(failing(copy, "invoice")).toEqual(["once"]);
  });

  it("phone: who, what, the number and by when, by email", () => {
    const s = allIn();
    expect(failing(doPhone(s), "phone")).toEqual([]);
    expect(failing(doPhone(s, PHONE_BODY.replace("0519", "0591")), "phone")).toEqual(["number"]);
    expect(failing(doPhone(s, PHONE_BODY.replace("before 12", "today")), "phone")).toEqual(["deadline"]);
    expect(failing(doPhone(s, PHONE_BODY.replace("10 packs of napkins", "some napkins")), "phone")).toEqual(["what"]);
    expect(failing(doPhone(s, PHONE_BODY.replace("Rita Fenwick from Oak Street Deli", "A customer")), "phone")).toEqual(["who"]);
  });

  it("overtime: totalled by a formula, to HR, and to nobody else", () => {
    const s = allIn();
    expect(failing(doOvertime(s), "overtime")).toEqual([]);
    const f = file(s, OVERTIME_ID);
    const untotalled = send(s, sent([PEOPLE.emma], "Overtime", "Here", { attachments: [{ name: f.name, sheet: f.sheet }] }));
    expect(failing(untotalled, "overtime")).toEqual(["total"]);
    expect(failing(doOvertime(s, [EMMA_CLARKSON]), "overtime")).toEqual(["to-hr", "total", "only-hr"]);
    expect(failing(doOvertime(s, [PEOPLE.emma, PEOPLE.sarah]), "overtime")).toEqual(["only-hr"]);
    expect(numeric(totalled(s).sheet!, 7, 3)).toBe(29);
  });

  it("thanks: filed in Customers, and no Reply all", () => {
    const s = allIn();
    expect(failing(doThanks(s), "thanks")).toEqual([]);
    expect(failing(s, "thanks")).toEqual(["filed"]);
    const all = send(doThanks(s), sent([PEOPLE.imran, ...KENT_STAFF], "Re: Thank you", "You're welcome!", { inReplyTo: MAIL.thanks }));
    expect(failing(all, "thanks")).toEqual(["no-reply-all"]);
    expect(isDone(MORNING_JOBS[7].check(all))).toBe(true);
  });

  it("short: a COUNTIF in the log, and the number in the first line", () => {
    const s = allIn();
    expect(SHORT_LAST_WEEK).toBe(4);
    expect(failing(doShort(s), "short")).toEqual([]);
    expect(failing(doShort(s, "Hi Daniel,\n\nI've counted them in the log.\nThere were 4.\n\nThanks"), "short")).toEqual(["answer"]);
    const typed = send(s, sent([PEOPLE.daniel], "Re: Short deliveries last week", "4 came in short.", { inReplyTo: MAIL.short }));
    expect(failing(typed, "short")).toEqual(["countif", "in-log"]);
  });

  it("tidy: house names, last year in 2025, the duplicate gone and nothing else", () => {
    const s = allIn();
    expect(failing(doTidy(s), "tidy")).toEqual([]);
    expect(failing(s, "tidy")).toEqual(["names", "years", "dup", "told"]);
    expect(failing(drop(doTidy(s), "mm-final"), "tidy")).toEqual(["dup"]);
    expect(failing(drop(doTidy(s), "mm-r10"), "tidy")).toEqual(["kept"]);
    expect(failing(move(doTidy(s), "mm-2212", D2026), "tidy")).toEqual(["years"]);
    expect(failing(move(doTidy(s), "mm-12nov", D2026, "2026-11-16 Delivery report.xlsx"), "tidy")).toEqual(["names"]);
    expect(samePath(file(doTidy(s), "mm-scan").path, D2026)).toBe(true);
  });
});

/* ── the scorecard: on time, late, and the pass rule ────────────────── */

describe("Monday morning: the scorecard", () => {
  it("passes a morning done well, every job on time", () => {
    const card = score(finish(play()));
    expect(card.passed).toBe(true);
    expect(card.done).toBe(10);
    expect(card.late).toBe(0);
    expect(card.scam.tone).toBe("good");
    expect(card.habits.every((h) => h.met === h.of)).toBe(true);
    expect(card.order.map((j) => j.job.id)).toEqual(MORNING_JOBS.map((j) => j.id));
  });
  it("marks a job finished after its deadline as late, and still counts it", () => {
    const card = score(finish(play([], { report: minuteOf("09:45") })));
    expect(card.jobs.find((j) => j.job.id === "report")!.status).toBe("late");
    expect(card.late).toBe(1);
    expect(card.passed).toBe(true);
  });
  it("calls out a scam left late, even when it was reported in the end", () => {
    const card = score(finish(play([], { scam: minuteOf("10:50") })));
    expect(card.jobs.find((j) => j.job.id === "scam")!.status).toBe("late");
    expect(card.scam.tone).toBe("late");
    expect(card.scam.note).toContain("You reported the scam at 10:50; it arrived at 08:40.");
  });
  it(`passes with ${PASS_MARK} of the 10 jobs done, and not with ${PASS_MARK - 1}`, () => {
    expect(score(finish(play(["thanks", "tidy"]))).passed).toBe(true);
    const seven = score(finish(play(["thanks", "tidy", "quote"])));
    expect(seven.done).toBe(7);
    expect(seven.passed).toBe(false);
  });
  it("fails any morning where the scammer was paid, however much else was done", () => {
    const s = play();
    const paid = { ...s, emails: s.emails.map((e) => (e.id === SCAM_EMAIL_ID ? { ...e, clicked: true } : e)) };
    const card = score(finish(paid));
    expect(card.paidScammer).toBe(true);
    expect(card.passed).toBe(false);
    expect(card.scam.tone).toBe("bad");
  });
  it("fails any morning where personal data went to the wrong person, and the wrong Emma writes back", () => {
    let s = play(["overtime"]);
    s = doOvertime(s, [EMMA_CLARKSON]);
    s = watch(s) ?? s;
    expect(s.emails.some((e) => e.id === "mm-clarkson-oops")).toBe(true);
    const card = score(finish(s));
    expect(card.leaked.map((p) => p.address)).toEqual([EMMA_CLARKSON.address]);
    expect(card.done).toBe(9);
    expect(card.passed).toBe(false);
  });
  it("notes when each job became done, clears it if undone, and stamps sent mail with the time", () => {
    let s = advance(fresh(), minuteOf("09:00"));
    s = watch(doReport(s)) ?? s;
    expect(morningOf(s).doneAt.report).toBe(minuteOf("09:00"));
    expect(s.emails.filter((e) => e.folder === "sent").every((e) => e.time === "09:00")).toBe(true);
    expect(watch(s)).toBeNull();
    s = watch(drop(s, "my-report")) ?? s;
    expect(morningOf(s).doneAt.report).toBeUndefined();
  });
  it("a fresh try keeps the earlier scorecards", () => {
    const done = finish(play());
    const again = carry(done, mondayMorning.seed());
    expect(morningOf(again).history).toHaveLength(1);
    expect(morningOf(again).history![0].passed).toBe(true);
    expect(morningOf(again).minute).toBe(0);
    expect(morningOf(carry(again, mondayMorning.seed())).history).toHaveLength(1);
  });
});
