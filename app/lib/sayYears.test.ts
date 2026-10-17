import { describe, it, expect } from "vitest";
// @ts-expect-error - the audio scripts are plain ESM JavaScript, not typed
import { sayYears } from "../../scripts/lib/say-years.mjs";

/**
 * Say a year as a year.
 *
 * Owner, 2026-10-17, on week 2's "Your Secret Identity": "it said Emma 2 0 1 7
 * instead of pronouncing the year... if it's a year pronunciation, then say
 * 2017, instead of separate numbers."
 *
 * Most of what follows is about what the transform must NOT touch. Week 1
 * teaches that "123456" is a bad password and that line has to stay digit by
 * digit; week 15 says "nearly 2000 years ago", which is a count. Getting
 * either wrong would be worse than the bug being fixed.
 */
describe("sayYears", () => {
  it("reads a year glued to a username", () => {
    expect(sayYears("emma2017? The Raccoon reads that like a name tag!")).toBe(
      "emma twenty seventeen? The Raccoon reads that like a name tag!",
    );
  });

  it("reads the nineties", () => {
    expect(sayYears("born in 1999")).toBe("born in nineteen ninety-nine");
  });

  it("says a whole thousand as a count, not a year", () => {
    /* Week 15: "Vesuvius buried Pompeii nearly 2000 years ago." */
    expect(sayYears("nearly 2000 years ago")).toBe("nearly two thousand years ago");
  });

  it("says the early 2000s the way a child hears them", () => {
    expect(sayYears("SuperFan2000")).toBe("SuperFan two thousand");
    expect(sayYears("made in 2005")).toBe("made in two thousand and five");
  });

  it("LEAVES A PASSWORD ALONE - week 1 depends on this", () => {
    expect(sayYears("Not 123456 or 'password'")).toBe("Not 123456 or 'password'");
    expect(sayYears("12345678")).toBe("12345678");
    expect(sayYears("77777777")).toBe("77777777");
  });

  it("leaves a digit run that merely contains a year-like pair alone", () => {
    expect(sayYears("JacobSmith0511")).toBe("JacobSmith0511");
    expect(sayYears("hello123")).toBe("hello123");
    expect(sayYears("Qwerty123")).toBe("Qwerty123");
  });

  it("leaves a time of day alone", () => {
    expect(sayYears("Swim practice moved to 4pm")).toBe("Swim practice moved to 4pm");
  });

  it("leaves text with no digits untouched", () => {
    const s = "Pause and ask a trusted grown-up.";
    expect(sayYears(s)).toBe(s);
  });

  it("every year in the real course data comes out as words", () => {
    /* The ones the owner will actually hear, lifted from the weeks that have
     * them: 1, 2, 15, 17 and 20. */
    for (const sample of ["Sam2014", "OliviaSmith2016", "Sunflower2024", "Cabbage2017", "ArtKid2017", "mydogsname2014", "Buddy_Blaze2000"]) {
      expect(sayYears(sample)).not.toMatch(/[0-9]/);
    }
  });
});
