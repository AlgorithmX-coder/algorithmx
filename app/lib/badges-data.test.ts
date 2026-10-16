import { describe, it, expect } from "vitest";
import { BADGE_CATALOGUE } from "./badges-data";
import { WEEK_CONTENT } from "@/app/lesson/weekContent";

/**
 * The badge case in Cyber HQ and the badge a week hands out are the same
 * badge. They were two hand-written lists, and the Cyber HQ one did not know
 * the bespoke medal art existed, so it showed a padlock emoji where the week
 * had a gold medal on disk.
 */
describe("the badge catalogue", () => {
  it("has exactly one badge per week, named by that week", () => {
    const weeks = Object.keys(WEEK_CONTENT).map(Number).sort((a, b) => a - b);
    expect(BADGE_CATALOGUE.map((b) => b.week)).toEqual(weeks);
    for (const b of BADGE_CATALOGUE) {
      expect(b.name, `week ${b.week}`).toBe(WEEK_CONTENT[b.week].badgeName);
      expect(b.id).toBe(`week-${b.week}`);
    }
  });

  it("uses the week's own medal art, not an emoji, wherever art exists", () => {
    const withoutArt = BADGE_CATALOGUE.filter((b) => !b.art).map((b) => b.week);
    expect(withoutArt, "these weeks would fall back to an emoji in Cyber HQ").toEqual([]);
  });
});
