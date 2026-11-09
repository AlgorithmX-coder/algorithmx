import { describe, it, expect } from "vitest";
import {
  ORGANISATION_COURSE_SLUGS,
  SCHOOL_COURSE_SLUGS,
  courseSlugsFor,
} from "./schoolPlaces";

/**
 * Owner, 2026-11-09: "for schools, remove CyberPro because we're not doing
 * pro. Pro is only for organizations."
 *
 * A school and an organisation are the same Organisation row told apart by
 * SchoolProfile.kind, and they share one course picker, so this split is the
 * only thing keeping Cyber Pro off a school. It is worth a test because the
 * failure is silent: a school would simply be offered an 18+ course, and
 * nothing would complain.
 */
describe("which courses each kind of organisation may run", () => {
  it("keeps Cyber Pro away from a school", () => {
    expect(courseSlugsFor("SCHOOL")).not.toContain("cyberstart-pro");
    expect(SCHOOL_COURSE_SLUGS).not.toContain("cyberstart-pro");
  });

  it("offers Cyber Pro to an organisation", () => {
    expect(courseSlugsFor("ORGANISATION")).toContain("cyberstart-pro");
  });

  it("gives a school every course an organisation gets, bar Pro", () => {
    const school = [...courseSlugsFor("SCHOOL")];
    const org = [...courseSlugsFor("ORGANISATION")];
    expect(org).toEqual([...school, "cyberstart-pro"]);
    for (const slug of school) expect(org).toContain(slug);
  });

  /**
   * Both lists stay free of the corporate catalogue. A school picking AI
   * Cleared for a class of nine year olds must not be possible, and nor must
   * a youth club picking it for a group of twelve year olds.
   */
  it("never offers a corporate course to either", () => {
    for (const kind of ["SCHOOL", "ORGANISATION"] as const) {
      const slugs = courseSlugsFor(kind);
      for (const corporate of ["ai-cleared", "ai-fluent", "cyber-awareness", "desk-ready"]) {
        expect(slugs).not.toContain(corporate);
      }
    }
  });

  it("holds the three shared courses, youngest first", () => {
    expect([...SCHOOL_COURSE_SLUGS]).toEqual(["cyber-heroes", "cyberexplorers", "cyberstart"]);
    expect([...ORGANISATION_COURSE_SLUGS]).toHaveLength(4);
  });
});
