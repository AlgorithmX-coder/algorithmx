import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { landingRouteFor } from "./courseLandings";

/**
 * Owner, 2026-10-16: "when you log out I want you to land on the cyber heroes
 * page not the algorithmx one."
 *
 * A parent signing out of their child's course wants that course in front of
 * them, with its own log-in on it, not the top of a multi-product company
 * site they then have to navigate back down.
 */
describe("logging out of Cyber Heroes", () => {
  it("lands on the Cyber Heroes page", () => {
    expect(landingRouteFor("cyber-heroes")).toBe("/cyberheroes");
  });

  it("is what both logout actions actually do", () => {
    for (const f of ["app/dashboard/page.tsx", "app/parent/page.tsx"]) {
      const src = readFileSync(f, "utf8");
      const m = src.match(/signOut\(\{\s*redirectTo:\s*([^}]+)\}\)/);
      expect(m, `no signOut redirect found in ${f}`).not.toBeNull();
      const target = (m as RegExpMatchArray)[1];
      expect(target, `${f} still sends people to the AlgorithmX home page`).toContain("landingRouteFor");
      expect(target).not.toMatch(/redirectTo:\s*"\/"/);
    }
  });
});
