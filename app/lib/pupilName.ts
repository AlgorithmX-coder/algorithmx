/**
 * A pupil's name: how a teacher types it, and how a child is shown it.
 *
 * WHY A FAMILY NAME AT ALL (owner, 2026-11-27). With first names only, two
 * children called Tom in one class could not be told apart by anybody: not
 * by the teacher reading the class list, not on the printed login cards
 * (which came out identical), and not by the children on the pick list,
 * where the first Tom to sign in claimed whichever account he tapped.
 *
 * So the teacher gives a family name and sees it. A child never does: the
 * pick list and the login cards show a first name, plus an initial only when
 * two children in the class share that first name. The family name itself is
 * never sent to a child's screen or printed on a card.
 *
 * Pure on purpose, so both rules are tested without a database.
 */

/** Longest first name, and longest family name, a teacher can give. */
export const PUPIL_NAME_MAX = 30;

export type SplitName = { name: string; familyName: string | null };

/**
 * One pupil as typed: "first name, then family name".
 *
 * Split at the FIRST run of whitespace. The first word is the first name and
 * everything after it is the family name, so "Lily van Dyke" keeps "van
 * Dyke" whole. A one word line has no family name. "Surname, First" is not
 * attempted: commas separate pupils, because that is what a pasted register
 * uses them for.
 */
export function splitPupilName(raw: string): SplitName | null {
  const line = raw.trim();
  if (!line) return null;
  const m = /^(\S+)\s+(.+)$/.exec(line);
  if (!m) return { name: line, familyName: null };
  /* Inner runs of spaces collapse, so a stray double space in a register
     does not become part of the name a teacher reads back. */
  const familyName = m[2].trim().replace(/\s+/g, " ");
  return { name: m[1], familyName: familyName || null };
}

/**
 * A whole pasted register, one pupil per line. Commas and semicolons
 * separate pupils too, exactly as line breaks do.
 */
export function splitPupilList(raw: string): SplitName[] {
  return raw
    .split(/[\n,;]+/)
    .map(splitPupilName)
    .filter((p): p is SplitName => p !== null);
}

/**
 * The first part of a pupil that is over the length limit, or null when both
 * fit. Returned as the text itself so the message can name it.
 */
export function tooLongPart(pupils: readonly SplitName[]): { part: "first" | "family"; text: string } | null {
  for (const p of pupils) {
    if (p.name.length > PUPIL_NAME_MAX) return { part: "first", text: p.name };
    if (p.familyName && p.familyName.length > PUPIL_NAME_MAX) return { part: "family", text: p.familyName };
  }
  return null;
}

/** What a teacher reads: the first name and the family name, when there is one. */
export function fullName(p: { name: string; familyName?: string | null }): string {
  return `${p.name} ${p.familyName ?? ""}`.trim();
}

/**
 * What a child sees, per pupil.
 *
 * The first name, or the first name and the family name's initial ("Tom B",
 * no full stop) when at least two pupils in the list share that first name,
 * case-insensitively, and this one has a family name to take an initial
 * from. Pass the WHOLE class: a sheet of only the new cards must still mark
 * the Tom who joined in January apart from the Tom who was already there.
 *
 * Never returns the family name itself.
 */
export function shownNames(
  pupils: readonly { id: string; name: string; familyName?: string | null }[],
): Map<string, string> {
  const counts = new Map<string, number>();
  for (const p of pupils) {
    const key = p.name.trim().toLocaleLowerCase("en-GB");
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const out = new Map<string, string>();
  for (const p of pupils) {
    const first = p.name.trim();
    const shared = (counts.get(first.toLocaleLowerCase("en-GB")) ?? 0) > 1;
    const initial = p.familyName?.trim().charAt(0).toLocaleUpperCase("en-GB") ?? "";
    out.set(p.id, shared && initial ? `${first} ${initial}` : first);
  }
  return out;
}
