import { describe, it, expect } from "vitest";
import { summariseOrg, type OrgStatsInput } from "./orgStats";

const BLANK: OrgStatsInput = {
  placesLicensed: 0,
  placesSpent: 0,
  placesHeldByLeavers: 0,
  liveClasses: [],
  classesArchived: 0,
};

describe("summariseOrg", () => {
  it("counts what is left of a licence", () => {
    const s = summariseOrg({ ...BLANK, placesLicensed: 50, placesSpent: 18 });
    expect(s.placesLeft).toBe(32);
  });

  /* Staff can lower a licence below what has already been spent. Showing
     "-3 left" would be nonsense, and worse, it would look like a bug. */
  it("never shows a negative number of places left", () => {
    const s = summariseOrg({ ...BLANK, placesLicensed: 15, placesSpent: 18 });
    expect(s.placesLeft).toBe(0);
    expect(s.placesSpent).toBe(18);
  });

  it("separates pupils who have started from pupils merely added", () => {
    const s = summariseOrg({
      ...BLANK,
      liveClasses: [
        {
          courseName: "Cyber Heroes",
          pupils: [
            { startedAt: [new Date("2026-11-01")] },
            { startedAt: [] },
            { startedAt: [] },
          ],
        },
      ],
    });
    expect(s.pupilsInLiveClasses).toBe(3);
    expect(s.pupilsStarted).toBe(1);
  });

  it("takes the latest moment across every pupil and every class", () => {
    const s = summariseOrg({
      ...BLANK,
      liveClasses: [
        { courseName: "Cyber Heroes", pupils: [{ startedAt: [new Date("2026-11-01"), new Date("2026-11-09")] }] },
        { courseName: "Cyber Explorers", pupils: [{ startedAt: [new Date("2026-11-05")] }] },
      ],
    });
    expect(s.lastActivity?.toISOString()).toBe(new Date("2026-11-09").toISOString());
  });

  it("reports no activity rather than a date when nobody has started", () => {
    const s = summariseOrg({ ...BLANK, liveClasses: [{ courseName: "Cyber Heroes", pupils: [{ startedAt: [] }] }] });
    expect(s.lastActivity).toBeNull();
  });

  it("lists each course once, in a stable order", () => {
    const s = summariseOrg({
      ...BLANK,
      liveClasses: [
        { courseName: "Cyber Heroes", pupils: [] },
        { courseName: "Cyber Explorers", pupils: [] },
        { courseName: "Cyber Heroes", pupils: [] },
      ],
    });
    expect(s.courses).toEqual(["Cyber Explorers", "Cyber Heroes"]);
  });

  it("counts archived classes without counting their pupils as live", () => {
    const s = summariseOrg({ ...BLANK, classesArchived: 4, liveClasses: [] });
    expect(s.classesArchived).toBe(4);
    expect(s.classesLive).toBe(0);
    expect(s.pupilsInLiveClasses).toBe(0);
  });

  /* A place follows the child: removing a pupil does not hand the place
     back. Staff need to see how much of a licence is held that way. */
  it("reports places still held by pupils who have left", () => {
    const s = summariseOrg({ ...BLANK, placesLicensed: 50, placesSpent: 30, placesHeldByLeavers: 7 });
    expect(s.placesHeldByLeavers).toBe(7);
    expect(s.placesLeft).toBe(20);
  });

  it("handles a school with nothing set up yet", () => {
    const s = summariseOrg(BLANK);
    expect(s).toMatchObject({ placesLeft: 0, pupilsInLiveClasses: 0, classesLive: 0, courses: [], lastActivity: null });
  });
});
