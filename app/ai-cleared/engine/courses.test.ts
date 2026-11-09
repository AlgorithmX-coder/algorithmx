import { describe, expect, it } from "vitest";
import { COURSES, courseByKey, courseOfSerial, isCourseSlug } from "./courses";

/* The three courses share one platform; these are the facts the shared
 * pages, the certificate prefixes and the seat claim rely on. Cyber
 * Awareness has no Seat.course value yet, so courseByKey only resolves
 * the two seat-keyed courses. */
describe("courses", () => {
  it("names every course with its path and serial prefix", () => {
    expect(COURSES["ai-cleared"].base).toBe("/ai-cleared");
    expect(COURSES["ai-fluent"].base).toBe("/ai-fluent");
    expect(COURSES["cyber-awareness"].base).toBe("/cyber-awareness");
    expect(COURSES["ai-cleared"].serialPrefix).toBe("AXC");
    expect(COURSES["ai-fluent"].serialPrefix).toBe("AXF");
    expect(COURSES["ai-cleared"].modules).toBe(5);
    expect(COURSES["ai-fluent"].modules).toBe(9);
    expect(COURSES["cyber-awareness"].modules).toBe(8);
  });

  it("issues a certificate only on AI Cleared and AI Fluent", () => {
    expect(COURSES["ai-cleared"].certificate).toBe(true);
    expect(COURSES["ai-fluent"].certificate).toBe(true);
    expect(COURSES["cyber-awareness"].certificate).toBe(false);
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

  it("accepts only the three slugs", () => {
    expect(isCourseSlug("ai-cleared")).toBe(true);
    expect(isCourseSlug("ai-fluent")).toBe(true);
    expect(isCourseSlug("cyber-awareness")).toBe(true);
    expect(isCourseSlug("ai-anything")).toBe(false);
    expect(isCourseSlug(undefined)).toBe(false);
  });
});
