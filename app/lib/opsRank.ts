/**
 * Cyber Ops reputation ladder.
 *
 * Reputation is the tier's progression signal (the design spine's "Redoubt
 * reputation", deliberately NOT XP/leagues). It is stored per-week in
 * Progress.xp (max-merged so a replay never lowers it), and a learner's rank
 * is the SUM of that across their engagements — exactly the model the schema
 * comment on Progress.xp describes.
 *
 * Thresholds resolve the "reputation ladder names/thresholds" DECIDE from the
 * design spine (section 10). Five ranks across 16 engagements; per-engagement
 * rep rises through the course (~25 early to ~90 at the capstone), so a learner
 * who clears everything lands around Principal. Named after the spine's
 * Recruit -> Junior -> Operator -> Lead -> Principal progression.
 */

export type OpsRank = {
  name: string;
  /** Inclusive lower bound of total reputation for this rank. */
  at: number;
};

export const OPS_RANKS: OpsRank[] = [
  { name: "Recruit", at: 0 },
  { name: "Junior Operator", at: 100 },
  { name: "Operator", at: 300 },
  { name: "Lead Operator", at: 600 },
  { name: "Principal", at: 1000 },
];

export type RankStatus = {
  rank: string;
  /** The next rank up, or null at the top. */
  next: string | null;
  /** Total reputation to reach the next rank, or null at the top. */
  nextAt: number | null;
  /** Human progress label, e.g. "125 / 300 to Operator" or "Top rank". */
  label: string;
  /** 0..1 progress through the current rank band (1 at the top rank). */
  fraction: number;
};

export function rankFor(totalRep: number): RankStatus {
  const rep = Math.max(0, Math.trunc(totalRep));
  let i = 0;
  for (let k = 0; k < OPS_RANKS.length; k++) {
    if (rep >= OPS_RANKS[k].at) i = k;
  }
  const current = OPS_RANKS[i];
  const next = OPS_RANKS[i + 1] ?? null;
  if (!next) {
    return { rank: current.name, next: null, nextAt: null, label: "Top rank", fraction: 1 };
  }
  const span = next.at - current.at;
  const into = rep - current.at;
  return {
    rank: current.name,
    next: next.name,
    nextAt: next.at,
    label: `${rep} / ${next.at} to ${next.name}`,
    fraction: span > 0 ? Math.max(0, Math.min(1, into / span)) : 0,
  };
}
