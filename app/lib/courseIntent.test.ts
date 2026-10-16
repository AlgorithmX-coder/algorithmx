import { describe, it, expect } from "vitest";
import { safeCourseSlug, courseHomeFor, CATALOGUE } from "./courseIntent";

describe("safeCourseSlug", () => {
  it("accepts catalog slug shapes", () => {
    expect(safeCourseSlug("cyber-heroes")).toBe("cyber-heroes");
    expect(safeCourseSlug("cyberstart-pro")).toBe("cyberstart-pro");
  });

  it("rejects unsafe or empty values", () => {
    expect(safeCourseSlug(null)).toBeNull();
    expect(safeCourseSlug("")).toBeNull();
    expect(safeCourseSlug("Cyber Heroes")).toBeNull();
    expect(safeCourseSlug("../hub")).toBeNull();
    expect(safeCourseSlug("a".repeat(41))).toBeNull();
  });
});

describe("courseHomeFor", () => {
  it("sends every cybersecurity course STRAIGHT to its own portal", () => {
    // Owner 2026-10-09: logging into a course must land in the course.
    expect(courseHomeFor("cyber-heroes")).toBe("/dashboard");
    expect(courseHomeFor("cyberexplorers")).toBe("/explorers");
    expect(courseHomeFor("cyberstart")).toBe("/operators/portfolio");
    expect(courseHomeFor("cyberstart-pro")).toBe("/pro/course");
  });

  /* The hub is decommissioned (owner 2026-10-16). This is the test that
   * keeps it decommissioned: nothing may route a learner back to it. */
  it("never routes anyone to the hub", () => {
    for (const slug of ["cyber-heroes", "cyberexplorers", "cyberstart", "cyberstart-pro", "some-future-course", null]) {
      expect(courseHomeFor(slug)).not.toContain("/hub");
    }
    expect(CATALOGUE).not.toContain("/hub");
  });

  it("falls back to the catalogue when there is no course context", () => {
    expect(courseHomeFor(null)).toBe(CATALOGUE);
  });

  it("an unknown course goes to the catalogue rather than nowhere", () => {
    expect(courseHomeFor("some-future-course")).toBe(CATALOGUE);
  });
});
