import { beforeEach, describe, expect, it, vi } from "vitest";

/* Signup's free course grant follows the one launch switch
 * (app/lib/launchSwitch.ts): on during the tester period, off at launch. */

const m = vi.hoisted(() => ({
  findUnique: vi.fn(),
  create: vi.fn(),
  grantEntitlement: vi.fn(),
  free: true,
}));
vi.mock("@/app/lib/prisma", () => ({ prisma: { user: { findUnique: m.findUnique, create: m.create } } }));
vi.mock("@/app/lib/entitlements", () => ({ grantEntitlement: m.grantEntitlement }));
vi.mock("@/app/lib/rateLimit", () => ({
  RULES: { signupIp: {} },
  clientIp: () => "127.0.0.1",
  rateKey: (...p: string[]) => p.join(":"),
  hit: vi.fn(async () => ({ ok: true })),
  tooManyResponse: vi.fn(),
}));
vi.mock("@/app/lib/emailIdentity", () => ({
  normaliseEmail: (e: string) => e.trim().toLowerCase(),
  emailTaken: vi.fn(async () => false),
}));
vi.mock("bcryptjs", () => ({ default: { hash: vi.fn(async () => "hashed") } }));
vi.mock("@/app/lib/launchSwitch", () => ({
  get TESTER_FREE_ACCESS() {
    return m.free;
  },
}));

import { POST } from "./route";

const signup = (course: string) =>
  POST(new Request("http://x/api/signup", { method: "POST", body: JSON.stringify({ name: "T", email: "t@example.invalid", password: "Password!1", course }) }));

describe("/api/signup free course grant", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.findUnique.mockResolvedValue(null);
    m.create.mockResolvedValue({ id: "u1" });
  });

  it("switch on: grants the course signed up through", async () => {
    m.free = true;
    const res = await signup("desk-ready");
    expect(res.status).toBe(201);
    expect(m.grantEntitlement).toHaveBeenCalledWith("u1", "desk-ready", "MANUAL");
  });

  it("switch off: creates the account and grants nothing", async () => {
    m.free = false;
    const res = await signup("desk-ready");
    expect(res.status).toBe(201);
    expect(m.grantEntitlement).not.toHaveBeenCalled();
  });

  it("switch on: a course outside the free list is not granted", async () => {
    m.free = true;
    await signup("ai-cleared");
    expect(m.grantEntitlement).not.toHaveBeenCalled();
  });
});
