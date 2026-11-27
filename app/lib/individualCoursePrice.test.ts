import { describe, it, expect } from "vitest";
import { INDIVIDUAL_WORKPLACE_COURSE_PENCE, INDIVIDUAL_WORKPLACE_COURSE_SLUGS, poundsFigure } from "./individualCoursePrice";

describe("individual workplace course price", () => {
  it("is the owner's figure: 29 pounds, VAT included", () => {
    expect(INDIVIDUAL_WORKPLACE_COURSE_PENCE).toBe(2900);
    expect(poundsFigure(INDIVIDUAL_WORKPLACE_COURSE_PENCE)).toBe("29");
  });

  it("covers the three workplace courses and nothing else", () => {
    expect([...INDIVIDUAL_WORKPLACE_COURSE_SLUGS].sort()).toEqual(["ai-cleared", "ai-fluent", "cyber-awareness"]);
  });

  it("shows pence only when there are some", () => {
    expect(poundsFigure(2950)).toBe("29.50");
    expect(poundsFigure(9900)).toBe("99");
  });
});
