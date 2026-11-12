import { MORNING_JOBS } from "../office/jobs/monday/checks";
import { MORNING_ID } from "../office/jobs/monday/data";
import type { MorningResult, OfficeState } from "../office/types";

/* The final task's result as proof, for Module 13's CV. Kept apart from
 * ./result (which reads and syncs the record through the office store, a
 * client module with React hooks) so the office jobs, which a server page
 * imports, can use it without pulling hooks into the server build. */

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

/* The best finished morning saved in this browser (the office's own record,
 * under the office key), or null. Client only; storage can be blocked. */
export function savedCapstoneResult(): CapstoneResult | null {
  try {
    const raw = window.localStorage.getItem(`desk:office:${MORNING_ID}`);
    return raw ? capstoneResultOf(JSON.parse(raw) as OfficeState) : null;
  } catch {
    return null;
  }
}
