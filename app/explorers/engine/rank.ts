/**
 * Explorers agent rank — a named identity tied to lifetime XP, separate
 * from each block's CONFIDENTIAL/SECRET/TOP SECRET/ULTRA clearance ladder
 * (that one tracks which blocks are finished; this one tracks how far an
 * agent has come overall, and is what makes "you've leveled up" legible).
 *
 * Thresholds are tuned to a full 20-case playthrough (roughly 300-500 XP per
 * case between skills, boss and the case-closing bonus) so MAVERICK lands
 * near a genuine full clear, not partway through Block 1.
 */
export interface ExplorersRankInfo {
  name: string;
  minXP: number;
  colour: string;
}

export const EXPLORERS_RANKS: ExplorersRankInfo[] = [
  { name: "RECRUIT", minXP: 0, colour: "#8A93A6" },
  { name: "OPERATIVE", minXP: 800, colour: "#3FD1C4" },
  { name: "TRACKER", minXP: 2000, colour: "#4FA8FF" },
  { name: "ANALYST", minXP: 3800, colour: "#B07CFF" },
  { name: "SPECIALIST", minXP: 6000, colour: "#FFC24B" },
  { name: "MAVERICK", minXP: 8500, colour: "#FF5FA2" },
];

export interface ExplorersRankState {
  current: ExplorersRankInfo;
  next: ExplorersRankInfo | null;
  /** 0-1 progress from `current`'s threshold toward `next`'s (1 if maxed). */
  progress: number;
}

export function getExplorersRank(totalXp: number): ExplorersRankState {
  let current = EXPLORERS_RANKS[0];
  let next: ExplorersRankInfo | null = null;
  for (let i = 0; i < EXPLORERS_RANKS.length; i++) {
    if (totalXp >= EXPLORERS_RANKS[i].minXP) {
      current = EXPLORERS_RANKS[i];
      next = EXPLORERS_RANKS[i + 1] ?? null;
    }
  }
  const progress = next ? Math.min(1, (totalXp - current.minXP) / (next.minXP - current.minXP)) : 1;
  return { current, next, progress };
}
