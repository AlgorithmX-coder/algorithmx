import { describe, it, expect } from "vitest";
import { safeCourseSlug, hubTargetFor } from "./courseIntent";

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

describe("hubTargetFor", () => {
  it("sends every cybersecurity course STRAIGHT to its own home, never the hub", () => {
    // Owner 2026-10-09: logging into a course must land in the course.
    expect(hubTargetFor("cyber-heroes")).toBe("/dashboard");
    expect(hubTargetFor("cyberexplorers")).toBe("/explorers");
    expect(hubTargetFor("cyberstart")).toBe("/operators/portfolio");
    expect(hubTargetFor("cyberstart-pro")).toBe("/pro/course");
  });

  it("none of the known course destinations point at the hub", () => {
    for (const slug of ["cyber-heroes", "cyberexplorers", "cyberstart", "cyberstart-pro"]) {
      expect(hubTargetFor(slug)).not.toContain("/hub");
    }
  });

  it("falls back to the hub only when there is no course context", () => {
    expect(hubTargetFor(null)).toBe("/hub");
  });

  it("an unknown course still carries its selection to the hub", () => {
    expect(hubTargetFor("some-future-course")).toBe("/hub?selected=some-future-course");
  });
});
