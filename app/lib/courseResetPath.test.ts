import { describe, it, expect } from "vitest";
import { resetPathFor, GENERIC_RESET_PATH } from "./courseResetPath";
import { COURSE_AUTH_CONTENT, SECURED_AUTH } from "@/app/components/course-auth/content";

describe("resetPathFor", () => {
  it("sends every course auth pack's slug to that course's own reset page", () => {
    for (const pack of [...Object.values(COURSE_AUTH_CONTENT), SECURED_AUTH]) {
      expect(resetPathFor(pack.slug)).toBe(`${pack.base}/reset-password`);
    }
  });

  it("falls back to the generic page for anything else", () => {
    expect(resetPathFor(undefined)).toBe(GENERIC_RESET_PATH);
    expect(resetPathFor(null)).toBe(GENERIC_RESET_PATH);
    expect(resetPathFor("")).toBe(GENERIC_RESET_PATH);
    expect(resetPathFor("some-future-course")).toBe(GENERIC_RESET_PATH);
    expect(resetPathFor("https://evil.example/")).toBe(GENERIC_RESET_PATH);
    expect(resetPathFor("//evil.example")).toBe(GENERIC_RESET_PATH);
    expect(resetPathFor("toString")).toBe(GENERIC_RESET_PATH);
    expect(resetPathFor("__proto__")).toBe(GENERIC_RESET_PATH);
    expect(resetPathFor(["cyber-heroes"])).toBe(GENERIC_RESET_PATH);
  });
});
