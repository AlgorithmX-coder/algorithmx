/**
 * The Zero File — UAT addition (Abdullah, Block 4): a collectible evidence
 * file that grows across all five War Room cases, one entry per case,
 * awarded on close (test passed, retries included — a case that eventually
 * passes still earns its clue, same as everywhere else in this game).
 * Unlike the journal (per-case, resets each case) this is BLOCK-WIDE and
 * accumulates: clue 1 from Case 16 is still there when Case 20 opens it.
 *
 * Each clue's text is written from what that case's skills actually taught,
 * reframed as evidence pointing at ZERO — per the brief, "earning it proves
 * they understood the lesson," and the named actor in each case (PACKRAT,
 * GHOSTWRITER, COORD, the Case 19 campaign) appears as part of ZERO's wider
 * network, never as ZERO themself until Case 20's reveal.
 */

export interface ZeroClue {
  caseId: string;
  caseNumber: string;
  n: number;
  text: string;
}

// Single source of truth for clue content — imported by both the runtime
// (to award/display them) and case20.ts (to reference them in the deduction
// beat), so the clue a player reads in the file is word-for-word the one
// Case 20 quotes back at them.
export const ZERO_CLUES: ZeroClue[] = [
  {
    caseId: "explorers-m16",
    caseNumber: "016",
    n: 1,
    text: "PACKRAT's auction records show one buyer purchasing profiles in bulk, no name on the account, paid in crypto, handle just 'Z'. Whoever this is, they don't build files themselves. They buy wholesale from brokers like PACKRAT.",
  },
  {
    caseId: "explorers-m17",
    caseNumber: "017",
    n: 2,
    text: "The fake story traced back to a seeding account with dozens of fabricated posts, each one quietly amplified by the same cluster of bot accounts, timed too precisely for one person working alone. GHOSTWRITER's tool is being run like a machine, not played like a hobby.",
  },
  {
    caseId: "explorers-m18",
    caseNumber: "018",
    n: 3,
    text: "COORD's recruitment pitch (the levers, the small ask, the trap) was too practiced to be a first attempt. This is a script that's been run before, refined each time it worked.",
  },
  {
    caseId: "explorers-m19",
    caseNumber: "019",
    n: 4,
    text: "Four separate attack lines (data harvesting, a fake story, a recruitment pitch, a live campaign) all went quiet on the same three days, then started again together. One schedule. One planner, coordinating every actor in this file.",
  },
  {
    caseId: "explorers-m20",
    caseNumber: "020",
    n: 5,
    // Owner UAT: Case 20 should contribute its OWN clue, like every other
    // case, so the deduction in its boss fight runs on 5 clues, not 4 —
    // not just hand the player the answer at the very end. This one is
    // added mid-case (after Skill 6, "The turncoat"), BEFORE the "who is
    // it" deduction, so it has to be real evidence, never the reveal
    // itself — no name here, same as every other clue in the file.
    text: "Fingerprint analysis on the coordinator's own tradecraft matches training patterns taught only inside ARC. Whoever Signal Zero really is, they didn't learn this craft from outside. They learned it from us.",
  },
];

const KEY = "explorers:zerofile";

function load(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as string[];
  } catch {}
  return [];
}

/** The clues collected so far, in case order — not all 5 until Case 20 closes. */
export function loadZeroFile(): ZeroClue[] {
  const collected = new Set(load());
  return ZERO_CLUES.filter((c) => collected.has(c.caseId));
}

export function hasZeroClue(caseId: string): boolean {
  return load().includes(caseId);
}

/**
 * Idempotent: a case already logged is a no-op, never double-added.
 * Returns true only when a NEW clue was actually added, so callers can
 * show a one-time "clue added" moment (UAT: every clue needs its own
 * on-screen beat, not just a silent localStorage write) instead of firing
 * on a resumed/replayed case that already has it.
 */
/**
 * TESTER TOOL, not a child-facing control.
 *
 * Abdullah, UAT, 27 October 2026: "I need you to reset the clues ... I can't
 * test the pop up screen as I've already got all the clues."
 *
 * He is right that there was no way back. The file is block-wide and
 * permanent by design - that is the whole point of it - so once all five
 * clues are in, addZeroClue() returns false forever and the one-time "new
 * clue" moment can never fire again in that browser. Emptying the file puts
 * all five of those moments back on the table.
 *
 * Clears the dossier and NOTHING else: cases stay closed, XP, rank, streak
 * and per-case journals are untouched. Reached from the map with
 * /explorers?clues=0, behind the same ?qa unlock as the ?case= deep-link.
 */
export function resetZeroFile(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}

export function addZeroClue(caseId: string): boolean {
  if (hasZeroClue(caseId)) return false;
  const next = [...load(), caseId];
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  return true;
}
