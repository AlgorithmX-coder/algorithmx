/**
 * Does a recap's narration line restate its "Up next" pill word for word?
 *
 * Owner, 2026-10-17, on the Concept 1 recap of week 2: "said next, next,
 * twice. Why did it do that? We should have absolutely checked these kind of
 * things."
 *
 * The pill prints "Up next: what's fine to share and what stays locked away".
 * The closing spoken line is "Next, we'll learn what's fine to share and what
 * stays locked away. Come and see!" The narration panel PRINTS its lines as
 * well as speaking them, so the same clause lands on screen twice, inches
 * apart, with the word "next" opening both. Measured across the course: 42 of
 * 100 recaps do this, in fourteen weeks.
 *
 * The SPOKEN line is not the mistake. The build standard requires a recap to
 * name the next concept aloud so the following Learn can open by naming it.
 * Only the printing duplicates, so ConceptRecap drops just the printing (via
 * InfoNarration's `showOnly`). Leaving the audio alone also means no clip
 * hash changes anywhere, so nothing has to be re-recorded.
 *
 * Lives in its own module so a test can reach it: importing ConceptRecap
 * drags in the sound layer and next-auth, which will not load under vitest.
 */

const norm = (t: string) =>
  t
    .toLowerCase()
    .replace(/\[[a-z ]*\]/g, " ")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export function restatesNext(line: string, next: string): boolean {
  const n = norm(next);
  /* A short pointer ("one quick review") is ordinary enough to appear in a
   * line that is not restating anything; below 12 characters, stand down. */
  if (n.length < 12) return false;
  return norm(line).includes(n);
}

/**
 * Which line indices a recap should PRINT, given what its pill already says.
 *
 * Returns undefined to mean "print them all", which is what happens when
 * there is no pill, when nothing duplicates it, or when filtering would empty
 * the panel - a recap that renders a blank narration box is worse than one
 * that repeats itself.
 */
export function printableRecapLines(lines: string[], next?: string): number[] | undefined {
  if (!next) return undefined;
  const keep = lines.map((l, i) => (restatesNext(l, next) ? -1 : i)).filter((i) => i >= 0);
  return keep.length && keep.length < lines.length ? keep : undefined;
}
