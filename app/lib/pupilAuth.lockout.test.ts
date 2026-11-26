import { beforeEach, describe, expect, it, vi } from "vitest";

/* Picture sign-in lockout with Prisma, bcrypt and the limiter stubbed:
 * five wrong goes lock that pupil, a lock refuses even the right pictures,
 * the right pictures clear the slips, and a teacher reset lifts the lock. */

const h = vi.hoisted(() => ({
  child: vi.fn(),
  compare: vi.fn(),
  userUpdate: vi.fn(async () => ({})),
  counts: new Map<string, number>(),
  locks: new Set<string>(),
}));

vi.mock("@/app/lib/prisma", () => ({
  prisma: { childProfile: { findFirst: h.child }, user: { update: h.userUpdate, updateMany: vi.fn() } },
}));
vi.mock("bcryptjs", () => ({ default: { compare: h.compare, hash: vi.fn() } }));
vi.mock("@/app/lib/rateLimit", () => ({
  RULES: { pupilFail: { limit: 5, windowSec: 900 }, pupilClassFailIp: { limit: 50, windowSec: 900 } },
  PUPIL_LOCK_SEC: 900,
  rateKey: (b: string, s: string) => `${b}:${s}`,
  hit: vi.fn(async (k: string, r: { limit: number }) => {
    const n = (h.counts.get(k) ?? 0) + 1;
    h.counts.set(k, n);
    return { ok: n <= r.limit, count: n, retryAfterSec: 1 };
  }),
  peek: vi.fn(async (k: string, r: { limit: number }) => ({ ok: (h.counts.get(k) ?? 0) < r.limit, count: 0, retryAfterSec: 1 })),
  lock: vi.fn(async (k: string) => void h.locks.add(k)),
  lockedFor: vi.fn(async (k: string) => (h.locks.has(k) ? 600 : 0)),
  clear: vi.fn(async (k: string) => {
    h.counts.delete(k);
    h.locks.delete(k);
  }),
}));

import { authorisePupil, resetPupilPictures } from "./pupilAuth";

const SEQ = ["rocket", "key", "star"];

beforeEach(() => {
  h.counts.clear();
  h.locks.clear();
  h.child.mockResolvedValue({ name: "Ada", classId: "c1", userId: "u1", user: { id: "u1", hashedPassword: "hash" } });
});

describe("authorisePupil lockout", () => {
  it("locks the pupil on the fifth wrong go", async () => {
    h.compare.mockResolvedValue(false);
    for (let i = 0; i < 4; i++) expect(await authorisePupil("p1", SEQ, "1.2.3.4")).toEqual({ ok: false, reason: "wrong_pictures" });
    expect(await authorisePupil("p1", SEQ, "1.2.3.4")).toEqual({ ok: false, reason: "locked" });
  });

  it("refuses even the right pictures while locked, until a teacher resets", async () => {
    h.compare.mockResolvedValue(false);
    for (let i = 0; i < 5; i++) await authorisePupil("p1", SEQ, "1.2.3.4");
    h.compare.mockResolvedValue(true);
    expect(await authorisePupil("p1", SEQ, "1.2.3.4")).toEqual({ ok: false, reason: "locked" });
    expect(await resetPupilPictures("org1", "p1")).toBe(true);
    expect(await authorisePupil("p1", SEQ, "1.2.3.4")).toEqual({ ok: true, userId: "u1", name: "Ada" });
  });

  it("forgets earlier slips once the pictures are right", async () => {
    h.compare.mockResolvedValue(false);
    for (let i = 0; i < 4; i++) await authorisePupil("p1", SEQ);
    h.compare.mockResolvedValue(true);
    expect((await authorisePupil("p1", SEQ)).ok).toBe(true);
    h.compare.mockResolvedValue(false);
    expect(await authorisePupil("p1", SEQ)).toEqual({ ok: false, reason: "wrong_pictures" });
  });

  it("locks guessing spread across a class from one IP", async () => {
    h.counts.set("pupil-class-fail-ip:c1|9.9.9.9", 50);
    h.compare.mockResolvedValue(true);
    expect(await authorisePupil("p2", SEQ, "9.9.9.9")).toEqual({ ok: false, reason: "locked" });
    expect((await authorisePupil("p2", SEQ, "8.8.8.8")).ok).toBe(true);
  });
});
