import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { restatesNext, printableRecapLines } from "@/app/lib/recapEcho";

/**
 * A recap must not print the same sentence twice.
 *
 * Owner, 2026-10-17, on the Concept 1 recap of week 2: "said next, next,
 * twice." The "Up next" pill and the closing narration line carried the same
 * clause, two inches apart, both opening with the word "next".
 *
 * The spoken line stays: the build standard requires a recap to name the next
 * concept aloud. ConceptRecap now drops that line from what it PRINTS. These
 * pin the matcher, then prove it fires on the real course data.
 */
describe("restatesNext", () => {
  const NEXT = "what's fine to share and what stays locked away";

  it("catches the real week 2 line", () => {
    expect(restatesNext("Next, we'll learn " + NEXT + ". Come and see!", NEXT)).toBe(true);
  });

  it("ignores punctuation, case and the voice-direction tag", () => {
    expect(restatesNext("[excited] WHAT'S FINE to share, and what stays locked away!", NEXT)).toBe(true);
  });

  it("leaves an unrelated line alone", () => {
    expect(restatesNext("Awesome start, Cyber Hero!", NEXT)).toBe(false);
  });

  it("stands down on a pointer short enough to match by coincidence", () => {
    expect(restatesNext("Time for a review of all five!", "a review")).toBe(false);
  });
});

describe("printableRecapLines", () => {
  const NEXT = "what's fine to share and what stays locked away";

  it("drops only the duplicating line", () => {
    const lines = ["Awesome start!", "You found all five.", "Next, we'll learn " + NEXT + "."];
    expect(printableRecapLines(lines, NEXT)).toEqual([0, 1]);
  });

  it("prints everything when nothing duplicates", () => {
    expect(printableRecapLines(["Awesome start!", "Well done."], NEXT)).toBeUndefined();
  });

  it("prints everything rather than emptying the panel", () => {
    /* A one-line recap whose only line IS the bridge: a blank narration box
     * would be worse than the repeat. */
    expect(printableRecapLines(["Next, we'll learn " + NEXT + "."], NEXT)).toBeUndefined();
  });

  it("prints everything when there is no pill at all", () => {
    expect(printableRecapLines(["Anything."], undefined)).toBeUndefined();
  });
});

describe("the course data", () => {
  function recaps(week: number): { next: string; lines: string[] }[] {
    let src: string;
    try {
      src = readFileSync("app/lesson/weekContent/week" + week + ".ts", "utf8");
    } catch {
      return [];
    }
    const out: { next: string; lines: string[] }[] = [];
    const re = /next:\s*"((?:[^"\\]|\\.)*)"/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(src))) {
      const after = src.slice(m.index, m.index + 1800);
      const lines = [...after.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((x) => x[1]).slice(1);
      out.push({ next: m[1], lines });
    }
    return out;
  }

  it("the duplication this was written for is real and widespread", () => {
    let dupes = 0;
    for (let w = 1; w <= 20; w++) {
      for (const r of recaps(w)) if (r.lines.some((l) => restatesNext(l, r.next))) dupes++;
    }
    /* Measured at 42 when the owner reported it. The guard that matters is
     * the lower bound: if this ever hits zero, someone has "fixed" the
     * duplication by deleting the SPOKEN bridge, which the build standard
     * requires to stay. */
    expect(dupes).toBeGreaterThan(20);
  });

  it("no recap in the course is filtered down to an empty panel", () => {
    for (let w = 1; w <= 20; w++) {
      for (const r of recaps(w)) {
        if (!r.lines.length) continue;
        const keep = printableRecapLines(r.lines, r.next);
        if (keep !== undefined) expect(keep.length).toBeGreaterThan(0);
      }
    }
  });
});
