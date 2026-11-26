import { describe, expect, it } from "vitest";
import { ageOn, asksDateOfBirth, maskEmail, needsParentConsent, parseDateOfBirth } from "./ageCheck";

const NOW = new Date(Date.UTC(2026, 10, 26)); // 26 November 2026

describe("ageCheck", () => {
  it("asks only on Cyber Explorers and Cyber Ops", () => {
    expect(asksDateOfBirth("cyberexplorers")).toBe(true);
    expect(asksDateOfBirth("cyberstart")).toBe(true);
    expect(asksDateOfBirth("cyber-heroes")).toBe(false);
    expect(asksDateOfBirth("cyberstart-pro")).toBe(false);
    expect(asksDateOfBirth(null)).toBe(false);
  });

  it("counts whole years on calendar dates", () => {
    expect(ageOn(new Date(Date.UTC(2013, 10, 26)), NOW)).toBe(13);
    expect(ageOn(new Date(Date.UTC(2013, 10, 27)), NOW)).toBe(12);
    expect(ageOn(new Date(Date.UTC(2014, 0, 1)), NOW)).toBe(12);
  });

  it("needs a parent until the 13th birthday, and not on it", () => {
    expect(needsParentConsent(new Date(Date.UTC(2013, 10, 27)), NOW)).toBe(true);
    expect(needsParentConsent(new Date(Date.UTC(2013, 10, 26)), NOW)).toBe(false);
    expect(needsParentConsent(new Date(Date.UTC(2017, 5, 1)), NOW)).toBe(true);
  });

  it("refuses dates that are not real, in the future, or absurdly long ago", () => {
    expect(parseDateOfBirth("2015-02-31", NOW)).toBeNull();
    expect(parseDateOfBirth("2027-01-01", NOW)).toBeNull();
    expect(parseDateOfBirth("1890-01-01", NOW)).toBeNull();
    expect(parseDateOfBirth("01/02/2015", NOW)).toBeNull();
    expect(parseDateOfBirth(20150101, NOW)).toBeNull();
    expect(parseDateOfBirth("2015-02-28", NOW)?.toISOString()).toBe("2015-02-28T00:00:00.000Z");
  });

  it("masks an email so a child can recognise it", () => {
    expect(maskEmail("parent@example.com")).toBe("p****@example.com");
    expect(maskEmail("ab@x.test")).toBe("a*@x.test");
  });
});

describe("looksLikeEmail", () => {
  it("takes an ordinary address and refuses obvious mistakes", async () => {
    const { looksLikeEmail } = await import("./ageCheck");
    expect(looksLikeEmail("parent@example.co.uk")).toBe(true);
    expect(looksLikeEmail("parent@example")).toBe(false);
    expect(looksLikeEmail("parent example@x.com")).toBe(false);
    expect(looksLikeEmail("@example.com")).toBe(false);
    expect(looksLikeEmail("a@b@c.com")).toBe(false);
    expect(looksLikeEmail("a@b.")).toBe(false);
  });
});
