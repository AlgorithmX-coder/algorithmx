import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { landingRouteFor, logoutDestinationFor } from "./courseLandings";

/**
 * Owner, 2026-10-16: "when you log out I want you to land on the cyber heroes
 * page not the algorithmx one."
 *
 * A parent signing out of their child's course wants that course in front of
 * them, with its own log-in on it, not the top of a multi-product company
 * site they then have to navigate back down.
 *
 * This file used to assert that rule by grepping both pages for the string
 * "landingRouteFor" inside their signOut call. That guarded the decision
 * right up until the decision grew a second case, and then it failed on a
 * change that honoured it. So the rule now lives in one function, these
 * tests check what that function returns, and the only thing still read out
 * of the pages is that they both go through it.
 */
describe("logging out of Cyber Heroes", () => {
  it("lands on the Cyber Heroes page", () => {
    expect(landingRouteFor("cyber-heroes")).toBe("/cyberheroes");
  });

  it("sends a parent to their course, never to the company home page", () => {
    expect(logoutDestinationFor({ slug: "cyber-heroes" })).toBe("/cyberheroes");
    expect(logoutDestinationFor({ slug: "cyberexplorers" })).toBe("/cyberexplorers");
  });

  /**
   * The case the 2026-10-16 decision did not have to cover, because a pupil
   * could not sign out at all. A child on a shared classroom machine must
   * not be dropped on a sales page carrying a parent's log-in, with their
   * own way back in nowhere on it.
   */
  it("sends a school pupil to the school door", () => {
    expect(logoutDestinationFor({ slug: "cyber-heroes", pupil: true })).toBe("/schools/login");
    expect(logoutDestinationFor({ slug: "cyberexplorers", pupil: true })).toBe("/schools/login");
  });

  it("falls back to the site root only for a course with no landing page", () => {
    expect(logoutDestinationFor({ slug: "no-such-course" })).toBe("/");
  });

  it("is what both logout actions actually go through", () => {
    for (const f of ["app/dashboard/page.tsx", "app/parent/page.tsx"]) {
      const src = readFileSync(f, "utf8");
      expect(src, `${f} does not use the shared logout destination`).toContain(
        "logoutDestinationFor",
      );
      /* The one literal still worth banning outright: it is the exact thing
         the owner asked us to stop doing. */
      expect(src).not.toMatch(/signOut\(\{\s*redirectTo:\s*"\/"\s*\}\)/);
    }
  });
});
