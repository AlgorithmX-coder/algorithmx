import { beforeEach, describe, expect, it, vi } from "vitest";

/* The database is stubbed: these check what the route says for each answer
 * the ping can get, and that it never asks to be cached. A plain function
 * stands in for $queryRaw (not vi.fn) because a spy that returns a rejected
 * promise is reported as a test error even when the route catches it. */

const db = vi.hoisted(() => {
  const state = { fail: false, queries: [] as string[] };
  return {
    state,
    $queryRaw: (strings: TemplateStringsArray): Promise<unknown> => {
      state.queries.push(strings.join(""));
      return state.fail
        ? Promise.reject(new Error("connect ECONNREFUSED 10.0.0.1:5432 password=secret"))
        : Promise.resolve([{ "?column?": 1 }]);
    },
  };
});
vi.mock("@/app/lib/prisma", () => ({ prisma: db }));

import { GET } from "./route";

describe("GET /api/health", () => {
  beforeEach(() => {
    db.state.fail = false;
    db.state.queries = [];
  });

  it("says ok when the database answers", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, db: "ok" });
    expect(res.headers.get("cache-control")).toContain("no-store");
  });

  it("says down with a 503, and no error detail, when the database does not", async () => {
    db.state.fail = true;
    const res = await GET();
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body).toEqual({ ok: false, db: "down" });
    expect(JSON.stringify(body)).not.toMatch(/secret|ECONNREFUSED/);
    expect(res.headers.get("cache-control")).toContain("no-store");
  });

  it("only pings: one SELECT 1, nothing else", async () => {
    await GET();
    expect(db.state.queries).toEqual(["SELECT 1"]);
  });
});
