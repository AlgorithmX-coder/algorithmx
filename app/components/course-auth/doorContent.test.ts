import { describe, it, expect } from "vitest";
import { COURSE_AUTH_CONTENT, SECURED_AUTH, authPack, type CourseAuthKey } from "./content";
import { DOOR_COURSES, DOOR_SIDE, SECURED_FORM, SECURED_SIDE, isDoorCourse } from "./doorContent";

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

describe("the Cyber Secured door", () => {
  it("names the three tracks a seat opens, with their module counts", () => {
    expect(SECURED_SIDE.tracks.map((t) => t.name)).toEqual(["AI Cleared", "AI Fluent", "Cyber Awareness"]);
    expect(SECURED_SIDE.tracks.map((t) => t.count)).toEqual(["5 modules", "9 modules", "8 modules"]);
  });

  it("signs in to the firm portal, with its own reset page", () => {
    expect(SECURED_AUTH.home).toBe("/cyber-secured");
    expect(SECURED_AUTH.base).toBe("/cyber-secured");
    expect(authPack("secured")).toBe(SECURED_AUTH);
    expect(authPack("cleared")).toBe(COURSE_AUTH_CONTENT.cleared);
  });

  it("has no em-dashes in its words", () => {
    expect(JSON.stringify([SECURED_SIDE, SECURED_FORM, SECURED_AUTH])).not.toMatch(/\u2014/);
  });
});
