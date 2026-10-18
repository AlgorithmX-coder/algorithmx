/**
 * Phone status-bar clock. Every case used to show the same "9:41" (the
 * iOS-marketing-screenshot convention) everywhere; owner wants variation
 * across cases instead of one repeated time (UAT item #17), not a live
 * ticking clock. Deterministic per case id, so the same case's status bar,
 * home-screen clock and "Today ..." divider always agree with each other,
 * while different cases show different times.
 */
const CASE_CLOCK_TIMES = ["4:12", "4:47", "5:03", "5:29", "6:08", "3:38", "7:16"];

export function caseClockTime(caseId: string): string {
  let hash = 0;
  for (let i = 0; i < caseId.length; i++) hash = (hash * 31 + caseId.charCodeAt(i)) >>> 0;
  return CASE_CLOCK_TIMES[hash % CASE_CLOCK_TIMES.length];
}
