/**
 * Shared case-title metadata used by:
 *   - SceneTitleCard (full-screen fade between cases)
 *   - LessonHUD (slim chip in the bar showing current case)
 *
 * Keep both consumers in sync by reading from this single source.
 * The labels are intentionally kid-friendly ("CASE 7", "BOSS",
 * "PROLOGUE") rather than internal screen indices.
 */

export interface CaseMeta {
  /** Small kicker (CASE 7 / BOSS / PROLOGUE / VICTORY). */
  label: string;
  /** The named scene shown to the player. */
  title: string;
}

export const CASE_TITLES: Record<number, CaseMeta> = {
  0: { label: "PROLOGUE", title: "Welcome, Hero" },
  1: { label: "MISSION BRIEF", title: "Your Training Begins" },
  2: { label: "CASE 1", title: "Lock the Locks" },
  3: { label: "CASE 2", title: "Quick Drill" },
  4: { label: "CASE 3", title: "Shield Up" },
  5: { label: "CASE 4", title: "Quick Drill" },
  6: { label: "CASE 5", title: "Password Lab" },
  7: { label: "CASE 6", title: "Firewall Builder" },
  8: { label: "CASE 7", title: "Memory Match" },
  9: { label: "CASE 8", title: "Sort the Data" },
  10: { label: "CASE 9", title: "Crack the Code" },
  11: { label: "CASE 10", title: "Quick Drill" },
  12: { label: "CASE 11", title: "Choose Your Path" },
  13: { label: "CASE 12", title: "Phishing Hunt" },
  14: { label: "CASE 13", title: "What Would You Do?" },
  15: { label: "BOSS", title: "Hacker Raccoon" },
  16: { label: "VICTORY", title: "Hero Defeated the Hacker" },
  17: { label: "GRADUATION", title: "Cyber Hero" },
};

export function getCaseMeta(screen: number): CaseMeta | undefined {
  return CASE_TITLES[screen];
}
