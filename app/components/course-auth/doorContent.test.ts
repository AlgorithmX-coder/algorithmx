import { describe, it, expect } from "vitest";
import { COURSE_AUTH_CONTENT, type CourseAuthKey } from "./content";
import { DOOR_COURSES, DOOR_SIDE, isDoorCourse } from "./doorContent";

describe("the daylight door", () => {
  it("opens for AI Cleared, AI Fluent and Cyber Awareness only", () => {
    const all = Object.keys(COURSE_AUTH_CONTENT) as CourseAuthKey[];
    expect(all.filter(isDoorCourse).sort()).toEqual(["awareness", "cleared", "fluent"]);
    for (const k of ["cyberheroes", "cyberexplorers", "ops", "pro", "desk"] as const) expect(isDoorCourse(k)).toBe(false);
  });

  it("gives every door course a side panel with three facts", () => {
    for (const k of DOOR_COURSES) {
      expect(DOOR_SIDE[k].facts).toHaveLength(3);
      expect(`${DOOR_SIDE[k].word[0]} ${DOOR_SIDE[k].word[1]}`).toBe(COURSE_AUTH_CONTENT[k].courseName);
    }
  });

  it("has no em-dashes in its words", () => {
    expect(JSON.stringify(DOOR_SIDE)).not.toMatch(/\u2014/);
  });
});
