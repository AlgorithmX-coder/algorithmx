import { describe, it, expect } from "vitest";
import { safeCourseSlug, courseHomeFor, pupilCourseHomeFor, CATALOGUE } from "./courseIntent";

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

describe("pupilCourseHomeFor", () => {
  /* A school pupil's class can be on any of the four courses. The login
   * used to send every child to the Cyber Heroes hub whatever their class
   * ran, so a place came off the school's licence and the child landed
   * somewhere with none of their own lessons on it. */
  it("sends a child to the course their own class runs", () => {
    expect(pupilCourseHomeFor("cyber-heroes")).toBe("/cyberhq");
    expect(pupilCourseHomeFor("cyberexplorers")).toBe("/explorers");
    expect(pupilCourseHomeFor("cyberstart")).toBe("/operators/portfolio");
    expect(pupilCourseHomeFor("cyberstart-pro")).toBe("/pro/course");
  });

  /* The adult's screen carries a sign-out and the account's children on
   * it, which is not what a child on a classroom device should be given. */
  it("never sends a child to the adult dashboard", () => {
    for (const slug of ["cyber-heroes", "cyberexplorers", "cyberstart", "cyberstart-pro", "some-future-course", null]) {
      expect(pupilCourseHomeFor(slug)).not.toBe("/dashboard");
    }
  });

  /* The catalogue invites you to buy a course, so it is the wrong fallback
   * for a nine year old whose class has gone missing. */
  it("falls back to Cyber Heroes, never to the catalogue", () => {
    expect(pupilCourseHomeFor(null)).toBe("/cyberhq");
    expect(pupilCourseHomeFor("some-future-course")).toBe("/cyberhq");
    expect(pupilCourseHomeFor(null)).not.toBe(CATALOGUE);
  });
});
