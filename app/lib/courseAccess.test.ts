import { beforeEach, describe, expect, it, vi } from "vitest";

/* requireCourse: signed out goes to the course's own sign-in with a way
 * back, an owner is let through, anyone else goes to the course's landing
 * page, and a school pupil is never sent to a sales page. redirect throws,
 * as Next's does, so the test sees where it went. */

const m = vi.hoisted(() => ({
  redirect: vi.fn((to: string) => {
    throw new Error(`REDIRECT ${to}`);
  }),
  auth: vi.fn(),
  hasEntitlement: vi.fn(),
  findFirst: vi.fn(),
}));
vi.mock("next/navigation", () => ({ redirect: m.redirect }));
vi.mock("@/app/lib/auth", () => ({ auth: m.auth }));
vi.mock("@/app/lib/entitlements", () => ({ hasEntitlement: m.hasEntitlement }));
vi.mock("@/app/lib/prisma", () => ({ prisma: { childProfile: { findFirst: m.findFirst } } }));

import { CONSUMER_COURSES, PUPIL_NO_COURSE, requireCourse, type ConsumerCourseSlug } from "./courseAccess";

const SLUGS = Object.keys(CONSUMER_COURSES) as ConsumerCourseSlug[];

describe("requireCourse", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.auth.mockResolvedValue({ user: { id: "u1" } });
    m.hasEntitlement.mockResolvedValue(false);
    m.findFirst.mockResolvedValue(null);
  });

  for (const slug of SLUGS) {
    it(`${slug}: signed out goes to its own sign-in with a callback`, async () => {
      m.auth.mockResolvedValue(null);
      const to = `${CONSUMER_COURSES[slug].signIn}?callbackUrl=${encodeURIComponent("/somewhere/1")}`;
      await expect(requireCourse(slug, "/somewhere/1")).rejects.toThrow(`REDIRECT ${to}`);
      expect(m.hasEntitlement).not.toHaveBeenCalled();
    });

    it(`${slug}: the owner is let through`, async () => {
      m.hasEntitlement.mockImplementation(async (_u: string, s: string) => s === slug);
      await expect(requireCourse(slug, "/x")).resolves.toMatchObject({ userId: "u1" });
      expect(m.hasEntitlement).toHaveBeenCalledWith("u1", slug);
    });

    it(`${slug}: owning a different course does not open it`, async () => {
      m.hasEntitlement.mockImplementation(async (_u: string, s: string) => s !== slug);
      await expect(requireCourse(slug, "/x")).rejects.toThrow(`REDIRECT ${CONSUMER_COURSES[slug].landing}`);
    });
  }

  it("a pupil whose class is on another course they hold goes to that course", async () => {
    m.findFirst.mockResolvedValue({ class: { product: { slug: "cyberexplorers" } } });
    m.hasEntitlement.mockImplementation(async (_u: string, s: string) => s === "cyberexplorers");
    await expect(requireCourse("cyber-heroes", "/lesson")).rejects.toThrow("REDIRECT /explorers");
  });

  it("a pupil whose school access is closed gets the quiet page, never a sales page", async () => {
    m.findFirst.mockResolvedValue({ class: { product: { slug: "cyber-heroes" } } });
    await expect(requireCourse("cyber-heroes", "/lesson")).rejects.toThrow(`REDIRECT ${PUPIL_NO_COURSE}`);
  });

  it("a protocol-relative callback is never passed through", async () => {
    m.auth.mockResolvedValue(null);
    await expect(requireCourse("cyberstart", "//evil.example")).rejects.toThrow(`REDIRECT /ops/login?callbackUrl=${encodeURIComponent("/")}`);
  });
});
