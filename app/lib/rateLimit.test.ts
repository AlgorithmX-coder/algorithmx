import { beforeEach, describe, expect, it, vi } from "vitest";

/* The limiter with Prisma stubbed: an in-memory table behind the same
 * calls, so the window maths, the fail-open rule and the pupil lock are
 * pinned without a database. */

const h = vi.hoisted(() => {
  const rows = new Map<string, number>();
  const id = (w: { key: string; windowStart: Date }) => `${w.key}@${w.windowStart.getTime()}`;
  return {
    rows,
    broken: { on: false },
    upsert: vi.fn(async (a: { where: { key_windowStart: { key: string; windowStart: Date } }; update: { count?: { increment: number } } }) => {
      if (h.broken.on) throw new Error("db down");
      const k = id(a.where.key_windowStart);
      const next = rows.has(k) ? rows.get(k)! + (a.update.count?.increment ?? 0) : 1;
      rows.set(k, next);
      return { count: next };
    }),
    findUnique: vi.fn(async (a: { where: { key_windowStart: { key: string; windowStart: Date } } }) => {
      if (h.broken.on) throw new Error("db down");
      const c = rows.get(id(a.where.key_windowStart));
      return c === undefined ? null : { count: c };
    }),
    findFirst: vi.fn(async (a: { where: { key: string; windowStart: { gt: Date } } }) => {
      const hits = [...rows.keys()]
        .map((k) => ({ key: k.slice(0, k.lastIndexOf("@")), at: Number(k.slice(k.lastIndexOf("@") + 1)) }))
        .filter((r) => r.key === a.where.key && r.at > a.where.windowStart.gt.getTime())
        .sort((x, y) => y.at - x.at);
      return hits[0] ? { windowStart: new Date(hits[0].at) } : null;
    }),
    deleteMany: vi.fn(async (a: { where: { key?: string } }) => {
      let n = 0;
      for (const k of [...rows.keys()]) if (a.where.key && k.startsWith(`${a.where.key}@`)) { rows.delete(k); n++; }
      return { count: n };
    }),
  };
});

vi.mock("@/app/lib/prisma", () => ({
  prisma: { rateLimit: { upsert: h.upsert, findUnique: h.findUnique, findFirst: h.findFirst, deleteMany: h.deleteMany } },
}));

import { clear, clientIp, hit, lock, lockedFor, loginAllowed, loginFailed, peek, rateKey, retryAfterSec, tooManyResponse, windowStartOf, RULES } from "./rateLimit";

const T0 = Date.UTC(2026, 10, 25, 10, 0, 0);
const rule = { limit: 3, windowSec: 60 };

beforeEach(() => {
  h.rows.clear();
  h.broken.on = false;
  vi.spyOn(Math, "random").mockReturnValue(0.99);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("helpers", () => {
  it("takes the first hop of x-forwarded-for", () => {
    expect(clientIp(new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" }))).toBe("203.0.113.7");
    expect(clientIp(new Request("https://x.test", { headers: { "x-real-ip": "198.51.100.2" } }))).toBe("198.51.100.2");
    expect(clientIp(new Headers())).toBe("unknown");
  });
  it("hashes the subject and ignores its case", () => {
    const k = rateKey("login", "Me@X.com");
    expect(k).toBe(rateKey("login", " me@x.com "));
    expect(k).toMatch(/^login:[0-9a-f]{40}$/);
    expect(k).not.toContain("me@x.com");
  });
  it("starts windows on whole multiples", () => {
    expect(windowStartOf(T0 + 59_000, 60).getTime()).toBe(T0);
    expect(windowStartOf(T0 + 60_000, 60).getTime()).toBe(T0 + 60_000);
    expect(retryAfterSec(T0 + 45_000, rule)).toBe(15);
  });
  it("answers 429 with a retry-after and a friendly message", async () => {
    const res = tooManyResponse({ ok: false, count: 9, retryAfterSec: 120 });
    expect(res.status).toBe(429);
    expect(res.headers.get("retry-after")).toBe("120");
    expect((await res.json()).error).toMatch(/Too many attempts/);
  });
});

describe("hit and peek", () => {
  it("allows up to the limit in a window, then refuses", async () => {
    const k = rateKey("t", "a");
    for (let i = 0; i < 3; i++) expect((await hit(k, rule, T0 + i)).ok).toBe(true);
    expect((await hit(k, rule, T0 + 10)).ok).toBe(false);
    expect((await peek(k, rule, T0 + 20)).ok).toBe(false);
  });
  it("starts again in the next window", async () => {
    const k = rateKey("t", "b");
    for (let i = 0; i < 4; i++) await hit(k, rule, T0);
    expect((await peek(k, rule, T0 + 60_000)).ok).toBe(true);
    expect((await hit(k, rule, T0 + 60_000)).count).toBe(1);
  });
  it("peek counts nothing", async () => {
    const k = rateKey("t", "c");
    await peek(k, rule, T0);
    expect((await peek(k, rule, T0)).count).toBe(0);
  });
  it("fails open when the table cannot be reached", async () => {
    h.broken.on = true;
    expect((await hit(rateKey("t", "d"), rule, T0)).ok).toBe(true);
    expect((await peek(rateKey("t", "d"), rule, T0)).ok).toBe(true);
  });
});

describe("sign-in counters", () => {
  it("refuses an address after ten failures, whatever the IP", async () => {
    for (let i = 0; i < RULES.loginFailEmail.limit; i++) await loginFailed("me@x.com", `10.0.0.${i}`);
    expect((await loginAllowed("ME@x.com", "10.9.9.9")).ok).toBe(false);
    expect((await loginAllowed("other@x.com", "10.9.9.9")).ok).toBe(true);
  });
});

describe("locks", () => {
  it("lasts the given time from when it started, and clears", async () => {
    const k = rateKey("pupil-lock", "kid1");
    expect(await lockedFor(k, 900, T0)).toBe(0);
    await lock(k, T0);
    expect(await lockedFor(k, 900, T0 + 60_000)).toBe(840);
    expect(await lockedFor(k, 900, T0 + 900_000)).toBe(0);
    await clear(k);
    expect(await lockedFor(k, 900, T0 + 1000)).toBe(0);
  });
});
