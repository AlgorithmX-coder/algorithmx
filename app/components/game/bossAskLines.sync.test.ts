import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

/**
 * The boss read-out is built TWICE, and the two copies must agree exactly.
 *
 * QuizBoss builds the lines Sarah speaks at runtime; the narration generator
 * builds the same lines to decide what to record. The clip is looked up by a
 * hash of its text, so a single character of drift between the two means the
 * runtime asks for a clip that was never recorded, finds nothing, and falls
 * back to the browser's speech synthesis - a robot voice, on a green build,
 * with a valid manifest. That is exactly what shipped in #539 and put
 * nineteen weeks on the robot voice.
 *
 * CI already runs the generator's --check, which proves every line the
 * GENERATOR builds has a clip. Nothing proved the COMPONENT builds the same
 * lines. This does: it reads both sources and compares the construction
 * character for character, after normalising the two identifiers that are
 * deliberately named differently on each side.
 *
 * If this fails, you changed one copy. Change the other one too, re-record
 * the affected weeks, and add them to FLOWING_ASK_WEEKS in both files.
 */

const COMPONENT = "app/components/game/QuizBoss.tsx";
const GENERATOR = "scripts/elevenlabs-generate-narration.mjs";

/** The lead/option construction, lifted out of whichever file it is in. */
function askConstruction(src: string): string {
  const start = src.indexOf("const lead = i === 0");
  expect(start, "could not find the ask construction").toBeGreaterThan(-1);
  const end = src.indexOf("closeSentence", src.indexOf("else lines.push", start));
  expect(end, "could not find the end of the ask construction").toBeGreaterThan(start);
  return src
    .slice(start, end)
    /* Comments are allowed to differ - each file explains itself to whoever
     * is reading THAT file. Only the construction has to match. */
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\/\/[^\n]*/g, " ")
    .replace(/OPTION_LETTERS/g, "LETTERS")   // the component's name for it
    .replace(/\bo\.text\b/g, "text")         // the component iterates objects
    .replace(/\baskTail\b/g, "tail")         // the generator's name for it
    .replace(/\s+/g, " ")
    .trim();
}

describe("the boss read-out is built identically in both places", () => {
  it("QuizBoss and the narration generator construct the same lines", () => {
    const component = askConstruction(readFileSync(COMPONENT, "utf8"));
    const generator = askConstruction(readFileSync(GENERATOR, "utf8"));
    expect(component).toBe(generator);
  });

  it("both agree on which weeks use the flowing phrasing", () => {
    const grab = (file: string) => {
      const m = readFileSync(file, "utf8").match(/FLOWING_ASK_WEEKS = new Set\(\[([^\]]*)\]\)/);
      expect(m, `no FLOWING_ASK_WEEKS in ${file}`).not.toBeNull();
      return (m as RegExpMatchArray)[1].split(",").map((s) => s.trim()).filter(Boolean).sort();
    };
    expect(grab(COMPONENT)).toEqual(grab(GENERATOR));
  });

  it("closeSentence is the same function on both sides", () => {
    const grab = (file: string) => {
      const src = readFileSync(file, "utf8");
      const i = src.indexOf("function closeSentence");
      expect(i, `no closeSentence in ${file}`).toBeGreaterThan(-1);
      return src.slice(i, src.indexOf("\n}", i))
        .replace(/: string/g, "")      // the component is typed
        .replace(/\s+/g, " ")
        .trim();
    };
    expect(grab(COMPONENT)).toBe(grab(GENERATOR));
  });
});
