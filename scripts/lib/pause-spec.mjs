/**
 * How long a pause is, by what the writing puts there.
 *
 * One table, shared by everything that speaks, so a comma is the same beat in
 * a lesson card, an exercise and an ATLAS briefing. It used to live only in
 * the lesson narration generator, which is why the ATLAS briefings had no
 * pause discipline at all: measured on week 1, a 621ms break fell between
 * "Cyber" and "Hero", where the writing asks for nothing, while the full stop
 * after "Hero." got 168ms. Owner, 2026-10-16: "that voice needs to flow."
 */
export const SPEC_GAP = {
  butt: 0, join: 0.05, comma: 0.22,
  dash: 0.30,    // " - " and ";" read as a dash: a beat longer than a comma
  colon: 0.35,   // ":" leans forward into what it introduces
  trail: 0.55,   // "..." is a trailing thought, just short of a full stop
  stop: 0.65, thought: 0.85, reveal: 0.85,
};
export const SPEC_TAIL = 0.30;

/** Strip a bracketed delivery note and anything that is not a letter. */
export const normWord = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9']/g, "");

/**
 * What kind of pause the writing asks for AFTER this word.
 *
 * Reads the punctuation hanging off the end of the word as authored. The
 * ellipsis is tested first, because [.!?]+ would otherwise swallow it and a
 * trailing thought would be read as a full stop.
 */
export function markAfter(word) {
  const w = String(word || "");
  if (/(\.\.\.|…)$/.test(w)) return "trail";
  if (/[.!?]+["')\]]?$/.test(w)) return "stop";
  if (/:$/.test(w)) return "colon";
  if (/[;]$/.test(w)) return "dash";
  if (/,$/.test(w)) return "comma";
  return "join";
}
