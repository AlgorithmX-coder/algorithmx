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
  grantEntitlement: vi.fn(),
  findFirst: vi.fn(),
  free: false,
  open: false,
  awaiting: vi.fn(),
}));
vi.mock("next/navigation", () => ({ redirect: m.redirect }));
vi.mock("@/app/lib/auth", () => ({ auth: m.auth }));
vi.mock("@/app/lib/entitlements", () => ({ hasEntitlement: m.hasEntitlement, grantEntitlement: m.grantEntitlement }));
vi.mock("@/app/lib/launchSwitch", () => ({
  get TESTER_FREE_ACCESS() {
    return m.free;
  },
  get CONSUMER_CHECKOUT_OPEN() {
    return m.open;
  },
}));
vi.mock("@/app/lib/prisma", () => ({ prisma: { childProfile: { findFirst: m.findFirst } } }));
vi.mock("@/app/lib/parentConsent", () => ({ WAITING_FOR_PARENT_PATH: "/waiting-for-grown-up", isAwaitingParent: m.awaiting }));

import { CONSUMER_COURSES, PUPIL_NO_COURSE, requireCourse, type ConsumerCourseSlug } from "./courseAccess";

const SLUGS = Object.keys(CONSUMER_COURSES) as ConsumerCourseSlug[];

describe("requireCourse (launch switch off: nothing is free)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.free = false;
    m.open = false;
    m.awaiting.mockResolvedValue(false);
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

    it(`${slug}: once checkout is open, a non-owner goes to that course's buy page`, async () => {
      m.open = true;
      await expect(requireCourse(slug, "/x")).rejects.toThrow(`REDIRECT /purchase/${slug}`);
      m.open = false;
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

  it("never grants anything", async () => {
    await expect(requireCourse("desk-ready", "/x")).rejects.toThrow("REDIRECT");
    expect(m.grantEntitlement).not.toHaveBeenCalled();
  });
});

describe("requireCourse (launch switch on: testers stay open)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.free = true;
    m.awaiting.mockResolvedValue(false);
    m.auth.mockResolvedValue({ user: { id: "u1" } });
    m.hasEntitlement.mockResolvedValue(false);
    m.findFirst.mockResolvedValue(null);
  });

  for (const slug of SLUGS) {
    it(`${slug}: a signed-in adult without it is granted it (as signup does) and let in`, async () => {
      await expect(requireCourse(slug, "/x")).resolves.toMatchObject({ userId: "u1" });
      expect(m.grantEntitlement).toHaveBeenCalledWith("u1", slug, "MANUAL");
      expect(m.grantEntitlement).toHaveBeenCalledTimes(1);
    });
  }

  it("an owner is let through without a new grant", async () => {
    m.hasEntitlement.mockResolvedValue(true);
    await expect(requireCourse("cyberstart-pro", "/x")).resolves.toMatchObject({ userId: "u1" });
    expect(m.grantEntitlement).not.toHaveBeenCalled();
  });

  it("signed out still goes to the course sign-in", async () => {
    m.auth.mockResolvedValue(null);
    await expect(requireCourse("desk-ready", "/desk-ready/course")).rejects.toThrow("REDIRECT /desk-ready/login");
    expect(m.grantEntitlement).not.toHaveBeenCalled();
  });

  it("a school pupil is never auto-granted: closed school gets the quiet page", async () => {
    m.findFirst.mockResolvedValue({ class: { product: { slug: "cyber-heroes" } } });
    await expect(requireCourse("cyber-heroes", "/lesson")).rejects.toThrow(`REDIRECT ${PUPIL_NO_COURSE}`);
    expect(m.grantEntitlement).not.toHaveBeenCalled();
  });

  it("a school pupil on another course goes there, not granted this one", async () => {
    m.findFirst.mockResolvedValue({ class: { product: { slug: "cyberexplorers" } } });
    m.hasEntitlement.mockImplementation(async (_u: string, s: string) => s === "cyberexplorers");
    await expect(requireCourse("cyber-heroes", "/lesson")).rejects.toThrow("REDIRECT /explorers");
    expect(m.grantEntitlement).not.toHaveBeenCalled();
  });

  it("if the grant fails, falls back to the landing page", async () => {
    m.grantEntitlement.mockRejectedValue(new Error("no product"));
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(requireCourse("desk-ready", "/x")).rejects.toThrow(`REDIRECT ${CONSUMER_COURSES["desk-ready"].landing}`);
    err.mockRestore();
  });
});

describe("requireCourse (a child under 13 waiting for a parent)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.auth.mockResolvedValue({ user: { id: "kid" } });
    m.awaiting.mockResolvedValue(true);
    m.findFirst.mockResolvedValue(null);
  });

  it("goes to the waiting page even when they hold the course", async () => {
    m.free = false;
    m.hasEntitlement.mockResolvedValue(true);
    await expect(requireCourse("cyberexplorers", "/explorers")).rejects.toThrow("REDIRECT /waiting-for-grown-up");
  });

  it("is not let in by the tester switch, and is granted nothing", async () => {
    m.free = true;
    m.hasEntitlement.mockResolvedValue(false);
    await expect(requireCourse("cyberstart", "/x")).rejects.toThrow("REDIRECT /waiting-for-grown-up");
    expect(m.grantEntitlement).not.toHaveBeenCalled();
    m.free = false;
  });

  it("is let in once the parent has said yes", async () => {
    m.awaiting.mockResolvedValue(false);
    m.hasEntitlement.mockResolvedValue(true);
    await expect(requireCourse("cyberexplorers", "/x")).resolves.toMatchObject({ userId: "kid" });
  });
});
