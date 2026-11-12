import { CLARKSON_REPLY, EMMA_CLARKSON } from "../../safety";
import type { Job, MorningResult, MorningState, OfficeState, Person } from "../../types";
import { checkMorning, isDone, MORNING_JOBS, overtimeLeaks, scamOf, type MorningCheck, type MorningJob } from "./checks";
import { ARRIVALS, clockAt, LENGTH, minuteOf, MORNING_ID, RING_FOR, RITA_CALL_ID, RITA_VOICEMAIL, seed, TODAY } from "./data";

/* The final task's clock and its scorecard, as pure functions of the office
 * record, so the timed morning, the scorecard page and the tests all agree.
 *
 * - advance(): the clock moves on, and whatever is due lands at its time.
 * - watch(): after any change, note when each job became done (or undone),
 *   when the scam was reported, and stamp sent mail with the office time.
 * - finish(): the morning is over; the result is kept in the record.
 * - score(): the one-page scorecard. */

export const EMPTY_MORNING: MorningState = { minute: 0, started: false, paused: false, arrived: [], doneAt: {} };
export const morningOf = (s: OfficeState): MorningState => s.morning ?? EMPTY_MORNING;
export const isOver = (s: OfficeState) => morningOf(s).endedAt !== undefined;
export const timeOf = (s: OfficeState) => clockAt(morningOf(s).endedAt ?? morningOf(s).minute);

/* Land everything due by now, in the order it was sent, each stamped with
 * its own office time. */
function land(s: OfficeState): OfficeState {
  const m = morningOf(s);
  const due = ARRIVALS.filter((a) => a.at <= m.minute && !m.arrived.includes(a.id));
  if (!due.length) return s;
  let next = s;
  for (const a of due) next = a.land(next, clockAt(a.at));
  return { ...next, morning: { ...m, arrived: [...m.arrived, ...due.map((a) => a.id)] } };
}

/* The clock moves on `n` office minutes (starting it, the first time). */
export function advance(s: OfficeState, n: number): OfficeState {
  const m = morningOf(s);
  if (m.endedAt !== undefined) return s;
  const minute = Math.min(LENGTH, m.minute + Math.max(0, n));
  const next = voicemail(land({ ...s, morning: { ...m, minute, started: true } }));
  return minute >= LENGTH ? finish(next) : next;
}

/* A phone left ringing stops, as a real one does, and the caller leaves a voicemail. */
function voicemail(s: OfficeState): OfficeState {
  const rang = ARRIVALS.find((a) => a.how === "phone");
  const calls = s.phone?.calls ?? [];
  const call = calls.find((c) => c.id === RITA_CALL_ID);
  if (!rang || !call?.ringing || (s.phone?.answered ?? []).includes(RITA_CALL_ID) || morningOf(s).minute < rang.at + RING_FOR) return s;
  return { ...s, phone: { calls: calls.map((c) => (c.id === RITA_CALL_ID ? { ...RITA_VOICEMAIL, time: c.time } : c)), answered: s.phone?.answered ?? [] } };
}

/* What needs noting after a change, or null when nothing does (so the
 * office isn't written to for nothing). */
export function watch(s: OfficeState): OfficeState | null {
  const m = morningOf(s);
  if (!m.started || m.endedAt !== undefined) return null;
  let changed = false;
  const doneAt = { ...m.doneAt };
  for (const j of MORNING_JOBS) {
    const done = isDone(j.check(s));
    if (done && doneAt[j.id] === undefined) {
      doneAt[j.id] = m.minute;
      changed = true;
    } else if (!done && doneAt[j.id] !== undefined) {
      delete doneAt[j.id];
      changed = true;
    }
  }
  const scam = scamOf(s);
  const reportedAt = m.reportedAt ?? (scam?.reported ? m.minute : undefined);
  if (reportedAt !== m.reportedAt) changed = true;
  /* sent mail and calls show the office time, not "Just now" */
  const now = clockAt(m.minute);
  let emails = s.emails;
  if (emails.some((e) => e.folder === "sent" && e.time === "Just now")) {
    emails = emails.map((e) => (e.folder === "sent" && e.time === "Just now" ? { ...e, time: now } : e));
    changed = true;
  }
  /* the wrong Emma writes back, as she would */
  const oops = `mm-clarkson-oops`;
  if (overtimeLeaks(s).some((p) => p.address === EMMA_CLARKSON.address) && !emails.some((e) => e.id === oops)) {
    emails = [{ ...CLARKSON_REPLY, id: oops, time: clockAt(Math.min(LENGTH, m.minute + 1)), subject: "Re: last week's overtime" }, ...emails];
    changed = true;
  }
  return changed ? { ...s, emails, morning: { ...m, doneAt, reportedAt } } : null;
}

/* The morning is over: at 12:30, or when the learner says they're done.
 * Whatever is done now counts at this minute if it wasn't noted already,
 * and the result is kept in the record. */
export function finish(s: OfficeState, on: string = new Date().toISOString()): OfficeState {
  const m = morningOf(s);
  if (m.endedAt !== undefined) return s;
  const watched = watch({ ...s, morning: { ...m, started: true } }) ?? s;
  const wm = morningOf(watched);
  const ended: OfficeState = { ...watched, morning: { ...wm, started: true, paused: false, endedAt: wm.minute } };
  return { ...ended, morning: { ...morningOf(ended), result: summary(score(ended), on) } };
}

/* A fresh morning keeps the scorecards of the earlier ones. */
export function carry(old: OfficeState, fresh: OfficeState): OfficeState {
  const m = morningOf(old);
  const history = [...(m.history ?? []), ...(m.result ? [m.result] : [])];
  return { ...fresh, morning: { ...morningOf(fresh), history: history.length ? history : undefined } };
}

/* ── the scorecard ──────────────────────────────────────────────────── */

export type JobStatus = "done" | "late" | "missed" | "unreached";

export interface JobScore {
  job: MorningJob;
  /* When it arrived, in office minutes. */
  at: number;
  status: JobStatus;
  doneAt?: number;
  checks: MorningCheck[];
}

export interface HabitScore {
  label: string;
  met: number;
  of: number;
  /* The jobs where it was missed, by title, with the first fix. */
  misses: { job: string; fix: string }[];
}

export interface Scorecard {
  jobs: JobScore[];
  done: number;
  late: number;
  passed: boolean;
  paidScammer: boolean;
  leaked: Person[];
  endedAt: number;
  habits: HabitScore[];
  criteria: { code: string; label: string; met: boolean }[];
  /* The jobs in the order they were finished. */
  order: JobScore[];
  scam: { tone: "good" | "late" | "bad" | "none"; note: string };
}

export const PASS_MARK = 8;

export const HABITS: { label: string; checks: string[] }[] = [
  { label: "Put it where the brief says", checks: ["report-place", "quote-saved", "invoice-approved", "thanks-filed", "tidy-years"] },
  { label: "Name it so anyone can find it", checks: ["report-name", "quote-saved", "phone-subject", "tidy-names"] },
  { label: "One version, in one place", checks: ["report-one", "report-link", "invoice-once", "short-in-log", "tidy-dup"] },
  { label: "Close the loop", checks: ["report-link", "scam-priya", "meeting-told", "quote-price", "invoice-told", "phone-sent", "short-answer", "tidy-told"] },
  { label: "Check your own work", checks: ["report-facts", "report-dates", "quote-figures", "phone-number", "overtime-total", "overtime-only-hr"] },
];

/* The criteria the morning touches, in plain words. */
export const CRITERIA: Record<string, string> = {
  "XL-2": "One row per thing, every detail in its column",
  "XL-3": "Dates written the same way all the way down",
  "XL-5": "A total worked out with a formula",
  "XL-6": "VAT worked out with formulas",
  "XL-7": "COUNTIF to count what matches",
  "XL-9": "Answer the manager's question in the first line",
  "SP-3": "Files saved and moved to the right place, once",
  "SP-4": "Files named by the house rule",
  "SP-6": "A link for colleagues, an attachment for customers",
  "SAFE-1": "Spot a scam email and report it without clicking",
  "SAFE-2": "Stop a changed-bank-details request",
  "SAFE-4": "Check the To line before sending personal data",
  "TM-2": "Book a meeting everyone can make, with an agenda",
  "TM-4": "Chat for a quick word, email for a record",
  "OL-2": "A subject that says what's inside",
  "OL-3": "A greeting and sign-off to suit the reader",
  "OL-4": "The answer up front",
  "OL-5": "The right people, and nobody else",
  "OL-8": "File the inbox",
  "ADM-1": "Match an invoice to its order",
  "ADM-2": "Check an invoice against the delivery",
  "ADM-4": "Turn a phone message into an email",
  "WIN-5": "Folders that match the brief",
};

const minutesWord = (n: number) => (n === 1 ? "one minute" : n < 60 ? `${n} minutes` : `${Math.floor(n / 60)} hour${n >= 120 ? "s" : ""}${n % 60 ? ` ${n % 60} minutes` : ""}`);

export function score(s: OfficeState): Scorecard {
  const m = morningOf(s);
  const endedAt = m.endedAt ?? m.minute;
  const all = checkMorning(s);
  const jobs: JobScore[] = MORNING_JOBS.map((job) => {
    const at = ARRIVALS.find((a) => a.id === job.arrival)?.at ?? 0;
    const checks = all.filter((c) => c.job === job.id);
    const reached = m.arrived.includes(job.arrival);
    if (!reached) return { job, at, status: "unreached", checks };
    if (!isDone(checks)) return { job, at, status: "missed", checks };
    const doneAt = m.doneAt[job.id] ?? endedAt;
    return { job, at, status: doneAt > job.due ? "late" : "done", doneAt, checks };
  });
  const done = jobs.filter((j) => j.status === "done").length;
  const late = jobs.filter((j) => j.status === "late").length;
  const scam = scamOf(s);
  const paidScammer = !!scam?.clicked;
  const leaked = overtimeLeaks(s);
  const reachedChecks = jobs.filter((j) => j.status !== "unreached").flatMap((j) => j.checks);
  const byId = new Map(reachedChecks.map((c) => [c.id, c]));
  const habits: HabitScore[] = HABITS.map((h) => {
    const cs = h.checks.map((id) => byId.get(id)).filter((c): c is MorningCheck => !!c);
    return {
      label: h.label,
      met: cs.filter((c) => c.ok).length,
      of: cs.length,
      misses: cs.filter((c) => !c.ok).map((c) => ({ job: MORNING_JOBS.find((j) => j.id === c.job)?.title ?? c.job, fix: c.fix ?? c.label })),
    };
  });
  const codes = [...new Set(reachedChecks.map((c) => c.code))];
  const criteria = codes.map((code) => ({ code, label: CRITERIA[code] ?? code, met: reachedChecks.filter((c) => c.code === code).every((c) => c.ok) }));
  const order = jobs.filter((j) => j.doneAt !== undefined).sort((a, b) => (a.doneAt ?? 0) - (b.doneAt ?? 0));

  const scamJob = jobs.find((j) => j.job.id === "scam");
  const arrived = clockAt(scamJob?.at ?? 10);
  const stopped = m.reportedAt ?? scamJob?.doneAt;
  let scamNote: Scorecard["scam"];
  if (!scamJob || scamJob.status === "unreached") scamNote = { tone: "none", note: `You finished before the scam arrived at ${arrived}, so there was nothing to stop.` };
  else if (paidScammer)
    scamNote = {
      tone: "bad",
      note: `You opened the scam's "View and pay" link. On a real Monday, that's where the money goes, and it can't be got back.${stopped !== undefined && stopped > scamJob.job.due ? ` You reported it at ${clockAt(stopped)}; it arrived at ${arrived}.` : ""} A sudden change of bank details is always checked by phone, on a number you already hold, before anyone pays a penny.`,
    };
  else if (stopped === undefined) scamNote = { tone: "bad", note: `The scam arrived at ${arrived} and was never reported. It sat in the inbox all morning, where anyone could have paid it. Next time, report it and tell Priya the moment you spot it.` };
  else if (stopped > (scamJob.job.due ?? minuteOf("09:30"))) scamNote = { tone: "late", note: `You reported the scam at ${clockAt(stopped)}; it arrived at ${arrived}. Every minute it sat there, someone could have paid it. Next time, deal with a scam the moment you spot it: it takes two minutes, and nothing else on the list can cost as much.` };
  else {
    const gap = Math.max(0, stopped - scamJob.at);
    scamNote = { tone: "good", note: `You stopped the scam at ${clockAt(stopped)}, ${gap ? `${minutesWord(gap)} after it landed` : "the minute it landed"}. That's exactly right: a scam goes to the top of the pile.` };
  }

  return {
    jobs,
    done,
    late,
    passed: done + late >= PASS_MARK && !paidScammer && leaked.length === 0,
    paidScammer,
    leaked,
    endedAt,
    habits,
    criteria,
    order,
    scam: scamNote,
  };
}

export function summary(card: Scorecard, on: string): MorningResult {
  return {
    on,
    endedAt: card.endedAt,
    passed: card.passed,
    done: card.done,
    late: card.late,
    jobs: card.jobs.map((j) => ({ id: j.job.id, status: j.status, doneAt: j.doneAt })),
    paidScammer: card.paidScammer,
    leaked: card.leaked.length > 0,
  };
}

/* ── the job ────────────────────────────────────────────────────────── */

export const mondayMorning: Job = {
  id: MORNING_ID,
  slug: "monday-morning",
  moduleId: "final",
  moduleLabel: "The final task",
  title: "Monday morning at the desk",
  summary: "A real Monday morning at Northfield, 08:30 to 12:30, played in about an hour. Ten things land on your desk. You decide what to do, and in what order.",
  clock: "08:30",
  deadline: "The morning ends at 12:30",
  doneLine: "That's a Monday morning handled the way a good office administrator handles it.",
  brief: "Work lands on your desk as it would on a real Monday: in Outlook, in Teams and on the phone. Read each thing as it arrives, decide what matters most, and do it. Nobody will tell you which app to use, or what order to work in.",
  hints: [
    "Read each message as it lands: what is being asked, by whom, and by when?",
    "Some jobs have a deadline in the message. Some can wait. One should never wait.",
    "The taskbar's red numbers show what's new: unread email, a Teams message, a ringing phone.",
    "When a job is done, tell the person who asked, in one line.",
  ],
  apps: ["calendar", "teams", "phone", "morning"],
  seed,
  check: checkMorning,
  habits: HABITS,
  live: { clock: (s) => clockAt(morningOf(s).endedAt ?? morningOf(s).minute), date: TODAY, carry },
};

export { LENGTH, TODAY };
