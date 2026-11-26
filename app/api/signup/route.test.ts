import { beforeEach, describe, expect, it, vi } from "vitest";

/* Signup's free course grant follows the one launch switch
 * (app/lib/launchSwitch.ts): on during the tester period, off at launch. */

const m = vi.hoisted(() => ({
  findUnique: vi.fn(),
  create: vi.fn(),
  grantEntitlement: vi.fn(),
  free: true,
  sendParent: vi.fn(),
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

vi.mock("@/app/lib/parentConsent", () => ({ sendParentConsentEmail: m.sendParent }));

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

/* UK GDPR Article 8: the Cyber Explorers and Cyber Ops sign-ups ask for a
 * date of birth; under 13 needs a parent's email, and the account waits for
 * that parent's consent with nothing granted. */
const kidSignup = (body: Record<string, unknown>) =>
  POST(
    new Request("http://x/api/signup", {
      method: "POST",
      body: JSON.stringify({ name: "Kid", email: "kid@example.invalid", password: "Password!1", course: "cyberexplorers", ...body }),
    }),
  );

function yearsAgo(n: number, plusDays = 0): string {
  const d = new Date();
  d.setUTCFullYear(d.getUTCFullYear() - n);
  d.setUTCDate(d.getUTCDate() + plusDays);
  return d.toISOString().slice(0, 10);
}

describe("/api/signup date of birth and parent consent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.free = true;
    m.findUnique.mockResolvedValue(null);
    m.create.mockResolvedValue({ id: "kid1" });
    m.sendParent.mockResolvedValue({ sent: true });
  });

  it("refuses an Explorers sign-up without a date of birth", async () => {
    const res = await kidSignup({});
    expect(res.status).toBe(400);
    expect(m.create).not.toHaveBeenCalled();
  });

  it("refuses an under-13 without a parent's email, or with their own", async () => {
    expect((await kidSignup({ dob: yearsAgo(10) })).status).toBe(400);
    expect((await kidSignup({ dob: yearsAgo(10), parentEmail: "kid@example.invalid" })).status).toBe(400);
    expect(m.create).not.toHaveBeenCalled();
  });

  it("makes an under-13 account that waits for a parent, emails the parent and grants nothing", async () => {
    const res = await kidSignup({ dob: yearsAgo(12, 1), parentEmail: "Parent@Example.invalid" });
    expect(res.status).toBe(201);
    expect(m.create.mock.calls[0][0].data).toMatchObject({ needsParentConsent: true, parentEmail: "parent@example.invalid" });
    expect(m.sendParent).toHaveBeenCalledWith(expect.objectContaining({ userId: "kid1", courseSlug: "cyberexplorers" }));
    expect(m.grantEntitlement).not.toHaveBeenCalled();
  });

  it("keeps only the year for a 13-year-old and lets them straight in", async () => {
    const dob = yearsAgo(13);
    const res = await kidSignup({ dob, course: "cyberstart" });
    expect(res.status).toBe(201);
    expect(m.create.mock.calls[0][0].data).toMatchObject({ birthYear: Number(dob.slice(0, 4)), needsParentConsent: false, parentEmail: null });
    expect(m.sendParent).not.toHaveBeenCalled();
    expect(m.grantEntitlement).toHaveBeenCalledWith("kid1", "cyberstart", "MANUAL");
  });

  it("does not ask Cyber Heroes (a parent's own account) for a date of birth", async () => {
    const res = await kidSignup({ course: "cyber-heroes" });
    expect(res.status).toBe(201);
    expect(m.create.mock.calls[0][0].data).toMatchObject({ birthYear: null, needsParentConsent: false });
  });
});
