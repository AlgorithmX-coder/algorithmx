/**
 * The case journal — a running, kid-plain recap of what each closed skill
 * actually taught, written to the agent's own case file so it survives a
 * reload and can be revisited later. One entry per skill, in skill order;
 * `note` reuses that skill's own `goal` line (already kid-plain, already
 * the single clearest summary of the skill — no separate copy to author
 * or let drift out of sync with the real lesson).
 */
export interface JournalEntry {
  skillN: number;
  title: string;
  note: string;
}

const key = (caseId: string) => `explorers:journal:${caseId}`;

export function loadJournal(caseId: string): JournalEntry[] {
  try {
    const raw = localStorage.getItem(key(caseId));
    if (raw) return JSON.parse(raw) as JournalEntry[];
  } catch {}
  return [];
}

/** Idempotent per skill (a resumed/replayed skill doesn't duplicate its entry). */
export function addJournalEntry(caseId: string, entry: JournalEntry): JournalEntry[] {
  const existing = loadJournal(caseId);
  const next = existing.some((e) => e.skillN === entry.skillN)
    ? existing
    : [...existing, entry].sort((a, b) => a.skillN - b.skillN);
  try {
    localStorage.setItem(key(caseId), JSON.stringify(next));
  } catch {}
  return next;
}
