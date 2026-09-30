import { describe, expect, it } from "vitest";
import { COURSES, courseByKey, courseOfSerial, isCourseSlug } from "./courses";

/* The two courses share one platform; these are the facts the shared
 * pages, the certificate prefixes and the seat claim rely on. */
describe("courses", () => {
  it("names both courses with their paths and serial prefixes", () => {
    expect(COURSES["ai-cleared"].base).toBe("/ai-cleared");
    expect(COURSES["ai-fluent"].base).toBe("/ai-fluent");
    expect(COURSES["ai-cleared"].serialPrefix).toBe("AXC");
    expect(COURSES["ai-fluent"].serialPrefix).toBe("AXF");
    expect(COURSES["ai-cleared"].modules).toBe(5);
    expect(COURSES["ai-fluent"].modules).toBe(9);
  });

  it("maps a seat's course key to its course", () => {
    expect(courseByKey("AI_CLEARED").slug).toBe("ai-cleared");
    expect(courseByKey("AI_FLUENT").slug).toBe("ai-fluent");
  });

  it("reads a serial's course from its prefix", () => {
    expect(courseOfSerial("AXC-B7KD-3NQ2")?.slug).toBe("ai-cleared");
    expect(courseOfSerial("axf-b7kd-3nq2")?.slug).toBe("ai-fluent");
    expect(courseOfSerial("XYZ-0000-0000")).toBeNull();
  });

  it("accepts only the two slugs", () => {
    expect(isCourseSlug("ai-cleared")).toBe(true);
    expect(isCourseSlug("ai-fluent")).toBe(true);
    expect(isCourseSlug("ai-anything")).toBe(false);
    expect(isCourseSlug(undefined)).toBe(false);
  });
});
