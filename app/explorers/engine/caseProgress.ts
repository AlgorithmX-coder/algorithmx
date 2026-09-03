/**
 * Per-case save/resume for the Phone / Console / War Room runtimes (Blocks 2-4).
 *
 * Block 1 (MissionRuntime) has its own richer checkpoint (it stores a full
 * beat `pos` + XP events under `explorers:checkpoint:*`). Blocks 2-4 run an
 * imperative async flow, so we persist a coarser "where were you" stage at
 * skill / boss / test granularity under a SEPARATE key namespace. On re-entry
 * the runtime offers Continue (resume from that stage) or Start over.
 */

export type CaseStage =
  | { kind: "skill"; index: number } // about to do skills[index]
  | { kind: "boss" }
  | { kind: "test" };

const key = (caseId: string) => `explorers:progress:${caseId}`;

export function readProgress(caseId: string): CaseStage | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key(caseId));
    if (!raw) return null;
    const s = JSON.parse(raw) as CaseStage;
    if (s && (s.kind === "skill" || s.kind === "boss" || s.kind === "test")) return s;
    return null;
  } catch {
    return null;
  }
}

export function saveProgress(caseId: string, stage: CaseStage): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key(caseId), JSON.stringify(stage));
  } catch {
    /* ignore quota / private-mode errors */
  }
}

export function clearProgress(caseId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key(caseId));
  } catch {
    /* ignore */
  }
}

/**
 * Is this a point worth offering "Continue" for? Skill 1 (index 0) is treated
 * as a fresh start (Continue would only skip the roadmap), so we resume only
 * from skill 2+, the boss, or the test.
 */
export function isResumable(s: CaseStage | null): s is CaseStage {
  return !!s && (s.kind === "boss" || s.kind === "test" || (s.kind === "skill" && s.index > 0));
}

/**
 * Mark a case complete for the MAP's progression gate. The map (page.tsx) reads
 * `explorers:checkpoint:{id}` and treats `pos.beat === "closed"` as done, which
 * unlocks the next case. Block 1's MissionRuntime writes this itself; Blocks 2-4
 * had no such write (so finishing a phone/console/war-room case never unlocked
 * the next one) — they now call this on passing the final test.
 */
export function markCaseComplete(caseId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`explorers:checkpoint:${caseId}`, JSON.stringify({ missionId: caseId, pos: { beat: "closed" }, events: [] }));
  } catch {
    /* ignore */
  }
}

/** Human label for the resume prompt ("Skill 3: The padlock", "The boss"...). */
export function stageLabel(s: CaseStage, skills: { n: number; title: string }[]): string {
  if (s.kind === "boss") return "the boss";
  if (s.kind === "test") return "the final test";
  const sk = skills[s.index];
  return sk ? `Skill ${sk.n}: ${sk.title}` : `Skill ${s.index + 1}`;
}
