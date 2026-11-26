import { describe, expect, it } from "vitest";
import { CONSUMER_CATALOGUE, consumerCourse, enrolHref, formatPence, isConsumerCourseSlug, vatIncludedPence } from "./consumerCatalogue";

/* The owner's price list, 2026-11-26. VAT included, one-off, one course
 * per purchase. If one of these changes, it changes here on purpose. */
const OWNER_PRICES: Record<string, number> = {
  "cyber-heroes": 9900,
  cyberexplorers: 9900,
  cyberstart: 9900,
  "cyberstart-pro": 9900,
  "desk-ready": 2500,
  "ai-cleared": 4200,
  "ai-fluent": 4200,
  "cyber-awareness": 4200,
};

describe("consumer catalogue", () => {
  it("charges exactly the owner's prices, and sells nothing else", () => {
    expect(Object.fromEntries(CONSUMER_CATALOGUE.map((c) => [c.slug, c.pence]))).toEqual(OWNER_PRICES);
  });

  it("has one row per slug, every price a positive whole number of pence", () => {
    const slugs = CONSUMER_CATALOGUE.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const c of CONSUMER_CATALOGUE) {
      expect(Number.isInteger(c.pence)).toBe(true);
      expect(c.pence).toBeGreaterThan(0);
    }
  });

  it("marks only the three workplace courses as workplace", () => {
    expect(CONSUMER_CATALOGUE.filter((c) => c.workplace).map((c) => c.slug).sort()).toEqual(["ai-cleared", "ai-fluent", "cyber-awareness"]);
  });

  it("does not sell the firm licence itself", () => {
    expect(isConsumerCourseSlug("cyber-secured")).toBe(false);
    expect(consumerCourse("nope")).toBeNull();
    expect(consumerCourse(null)).toBeNull();
    expect(consumerCourse(" Cyber-Heroes ")?.slug).toBe("cyber-heroes");
  });

  it("formats prices the way the pages print them", () => {
    expect(formatPence(9900)).toBe("£99");
    expect(formatPence(2500)).toBe("£25");
    expect(formatPence(4250)).toBe("£42.50");
  });

  it("works out the VAT already inside each price", () => {
    expect(vatIncludedPence(9900)).toBe(1650);
    expect(vatIncludedPence(4200)).toBe(700);
    expect(vatIncludedPence(2500)).toBe(417);
    expect(vatIncludedPence(0)).toBe(0);
  });

  it("points landing buttons at sign-up while checkout is shut, and at the buy page once open", () => {
    expect(enrolHref("cyber-heroes", false)).toBe("/cyberheroes/signup");
    expect(enrolHref("cyber-heroes", true)).toBe("/purchase/cyber-heroes");
    expect(enrolHref("cyberstart", true)).toBe("/purchase/cyberstart");
    expect(enrolHref("unknown", true)).toBe("/");
  });
});
