import { MORNING_JOBS } from "../office/jobs/monday/checks";
import { MORNING_ID, seed } from "../office/jobs/monday/data";
import { carry } from "../office/jobs/monday/morning";
import { OFFICE_VERSION, officeKey, newerCopy } from "../office/store";
import type { MorningResult, OfficeState } from "../office/types";

/* The final task's record, read and written outside the office (the start
 * page and the scorecard), and the result other parts of the course can
 * show. The record is the office's own: this browser's copy under the
 * office key, kept on a signed-in learner's account by /api/desk/office,
 * the newer copy winning, exactly as the office itself does. */

const KEY = officeKey(MORNING_ID);
const isRecord = (x: unknown): x is OfficeState => {
  const s = x as OfficeState | null;
  return !!s && s.version === OFFICE_VERSION && Array.isArray(s.files) && Array.isArray(s.emails);
};

export function readMorningRecord(): OfficeState | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    const s: unknown = raw ? JSON.parse(raw) : null;
    return isRecord(s) ? s : null;
  } catch {
    return null;
  }
}

function writeMorningRecord(s: OfficeState): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* storage blocked: the office starts fresh, as it would anyway */
  }
}

/* This browser's record, brought up to date from the account when the
 * account's copy is newer (a morning played on another computer). */
export async function syncMorningRecord(): Promise<OfficeState | null> {
  const local = readMorningRecord();
  try {
    const res = await fetch(`/api/desk/office/${MORNING_ID}`, { cache: "no-store" });
    const body = (await res.json()) as { state?: unknown; signedIn?: boolean };
    if (local ? newerCopy(local, body.state, !!body.signedIn) === "down" : isRecord(body.state)) {
      if (isRecord(body.state)) {
        writeMorningRecord(body.state);
        return body.state;
      }
    }
  } catch {
    /* offline or signed out: this browser's copy stands */
  }
  return local;
}

/* Set up a fresh Monday morning (the clock at 08:30, stopped), keeping the
 * scorecards of earlier mornings. The office picks it up when it opens. */
export function startFreshMorning(): void {
  const old = readMorningRecord();
  const fresh: OfficeState = { ...seed(), version: OFFICE_VERSION, savedAt: Date.now() };
  writeMorningRecord(old ? carry(old, fresh) : fresh);
}

/* ── for Module 13: the morning as proof for a CV ──────────────────── */

export interface CapstoneResult {
  passed: boolean;
  /* Jobs done, on time or late, out of `outOf`. */
  score: number;
  outOf: number;
  late: number;
  /* When it was played (ISO). */
  finishedOn: string;
  /* What was done, each with a line in office words for a CV. */
  jobsDone: { id: string; title: string; cv: string; late: boolean }[];
}

function asResult(r: MorningResult): CapstoneResult {
  const done = r.jobs.filter((j) => j.status === "done" || j.status === "late");
  return {
    passed: r.passed,
    score: done.length,
    outOf: MORNING_JOBS.length,
    late: r.late,
    finishedOn: r.on,
    jobsDone: done.map((j) => {
      const job = MORNING_JOBS.find((x) => x.id === j.id);
      return { id: j.id, title: job?.title ?? j.id, cv: job?.cv ?? "", late: j.status === "late" };
    }),
  };
}

/* The learner's best finished morning in this record: a pass before a
 * fail, then the most jobs done, then the most recent. Null if no morning
 * has been finished. */
export function capstoneResultOf(s: OfficeState | null): CapstoneResult | null {
  const m = s?.morning;
  const all = [...(m?.history ?? []), ...(m?.result ? [m.result] : [])];
  if (!all.length) return null;
  const best = all.reduce((a, b) => (Number(b.passed) - Number(a.passed) || b.done + b.late - (a.done + a.late) || b.on.localeCompare(a.on)) >= 0 ? b : a);
  return asResult(best);
}

/* Module 13 calls this on the client: the best finished morning in this
 * browser, or null. (syncMorningRecord() first brings in a morning played
 * on another computer, for a signed-in learner.) */
export function readCapstoneResult(): CapstoneResult | null {
  return capstoneResultOf(readMorningRecord());
}
