import { describe, it, expect } from "vitest";
import { pickSchool, type SchoolChoice } from "./schoolChoice";

/**
 * The owner onboarded "school test one", opened the portal, and was shown
 * "Robocode's trial ended on 9 November": a different school from an earlier
 * test. Nothing was wrong with the new school. The query that picks which
 * school you are looking at had no ORDER BY, so the database returned
 * whichever membership it felt like, and that one was dead.
 *
 * Every case below is that bug or a neighbour of it.
 */
const live = (orgId: string, name: string): SchoolChoice => ({ orgId, name, live: true });
const dead = (orgId: string, name: string): SchoolChoice => ({ orgId, name, live: false });

describe("which school a person is shown", () => {
  it("is nothing when they belong to none", () => {
    expect(pickSchool([])).toBeNull();
  });

  it("is the only one they belong to", () => {
    expect(pickSchool([live("a", "Oakfield")])?.orgId).toBe("a");
  });

  /* The newest membership first, which is the order the caller supplies:
     the school you joined last is the one you are most likely looking for. */
  it("is the one they joined most recently", () => {
    expect(pickSchool([live("new", "School Test One"), live("old", "Robocode")])?.orgId).toBe("new");
  });

  /* THE BUG, exactly: a dead school first in the list and a working one
     behind it. Showing the dead one blocks every screen. */
  it("skips a school whose trial has ended when a live one exists", () => {
    const picked = pickSchool([dead("robocode", "Robocode"), live("new", "School Test One")]);
    expect(picked?.orgId).toBe("new");
  });

  /* But a person whose ONLY school has lapsed must still see that school,
     and the notice that explains why nothing works. */
  it("shows the lapsed school when every school is lapsed", () => {
    const picked = pickSchool([dead("robocode", "Robocode"), dead("older", "Old Test")]);
    expect(picked?.orgId).toBe("robocode");
  });

  it("honours a choice they made, even a lapsed one", () => {
    const schools = [live("new", "School Test One"), dead("robocode", "Robocode")];
    expect(pickSchool(schools, "robocode")?.orgId).toBe("robocode");
  });

  /* The cookie is a preference, never an authorisation: it can only select
     among schools the person is already a member of. A stale or forged one
     falls back to the ordinary answer rather than granting anything. */
  it("ignores a preference for a school they do not belong to", () => {
    const schools = [live("new", "School Test One")];
    expect(pickSchool(schools, "someone-elses-school")?.orgId).toBe("new");
  });

  it("ignores an empty preference", () => {
    const schools = [live("new", "School Test One"), live("old", "Robocode")];
    expect(pickSchool(schools, "")?.orgId).toBe("new");
    expect(pickSchool(schools, null)?.orgId).toBe("new");
  });
});
