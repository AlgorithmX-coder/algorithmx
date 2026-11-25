import { beforeEach, describe, expect, it, vi } from "vitest";

/* Email verification with Prisma and Resend stubbed: only the hash is
 * stored, a link works once, an expired link verifies nothing, and staff by
 * email needs a verified address. */

const h = vi.hoisted(() => ({
  tokenCreate: vi.fn(async () => ({})),
  tokenFind: vi.fn(),
  tokenClaim: vi.fn(),
  userUpdate: vi.fn(async () => ({})),
  userFind: vi.fn(),
  userFindFirst: vi.fn(),
  sendEmail: vi.fn(async (_opts: { to: string; subject: string; html: string; text: string }) => ({ id: "e1" })),
}));

vi.mock("@/app/lib/prisma", () => ({
  prisma: {
    emailVerificationToken: { create: h.tokenCreate, findUnique: h.tokenFind, updateMany: h.tokenClaim },
    user: { update: h.userUpdate, findUnique: h.userFind, findFirst: h.userFindFirst },
  },
}));
vi.mock("@/app/lib/resend", async (orig) => ({ ...(await orig<typeof import("./resend")>()), sendEmail: h.sendEmail }));

import { createVerifyToken, hashVerifyToken, redeemVerifyToken, sendWelcomeVerify, VERIFY_EXPIRY_DAYS } from "./emailVerification";
import { isStaffUser } from "./aiClearedStaff";

const NOW = Date.UTC(2026, 10, 25, 12, 0, 0);
const DAY = 24 * 60 * 60 * 1000;

beforeEach(() => {
  for (const f of Object.values(h)) f.mockClear();
  vi.spyOn(console, "error").mockImplementation(() => {});
  process.env.PLATFORM_STAFF_EMAILS = "owner@example.com";
});

describe("createVerifyToken", () => {
  it("stores only the hash, with a seven-day expiry", async () => {
    const raw = await createVerifyToken("u1", NOW);
    expect(raw.length).toBeGreaterThan(30);
    expect(h.tokenCreate).toHaveBeenCalledWith({ data: { tokenHash: hashVerifyToken(raw), userId: "u1", expiresAt: new Date(NOW + VERIFY_EXPIRY_DAYS * DAY) } });
    expect(JSON.stringify(h.tokenCreate.mock.calls)).not.toContain(raw);
  });
});

describe("sendWelcomeVerify", () => {
  it("emails a /verify-email link to the address", async () => {
    expect(await sendWelcomeVerify({ userId: "u1", email: "a@b.com", name: "Ada Lovelace", origin: "https://algorithmx.io" })).toBe(true);
    const sent = h.sendEmail.mock.calls[0][0];
    expect(sent.to).toBe("a@b.com");
    expect(sent.text).toMatch(/https:\/\/algorithmx\.io\/verify-email\/[A-Za-z0-9_-]+/);
    expect(sent.html).toContain("Hi Ada,");
  });
  it("never throws when the email fails", async () => {
    h.sendEmail.mockRejectedValueOnce(new Error("down"));
    expect(await sendWelcomeVerify({ userId: "u1", email: "a@b.com", origin: "https://x" })).toBe(false);
  });
});

describe("redeemVerifyToken", () => {
  const live = { id: "t1", userId: "u1", usedAt: null, expiresAt: new Date(NOW + DAY), user: { emailVerified: null } };

  it("verifies the user once", async () => {
    h.tokenFind.mockResolvedValue(live);
    h.tokenClaim.mockResolvedValue({ count: 1 });
    expect(await redeemVerifyToken("raw", NOW)).toBe("verified");
    expect(h.tokenFind).toHaveBeenCalledWith(expect.objectContaining({ where: { tokenHash: hashVerifyToken("raw") } }));
    expect(h.tokenClaim).toHaveBeenCalledWith({ where: { id: "t1", usedAt: null }, data: { usedAt: new Date(NOW) } });
    expect(h.userUpdate).toHaveBeenCalledWith({ where: { id: "u1" }, data: { emailVerified: new Date(NOW) } });
  });
  it("says already when the link was used and the address is verified", async () => {
    h.tokenFind.mockResolvedValue({ ...live, usedAt: new Date(NOW - 1), user: { emailVerified: new Date(NOW - 1) } });
    expect(await redeemVerifyToken("raw", NOW)).toBe("already");
    expect(h.userUpdate).not.toHaveBeenCalled();
  });
  it("refuses an expired link", async () => {
    h.tokenFind.mockResolvedValue({ ...live, expiresAt: new Date(NOW - 1) });
    expect(await redeemVerifyToken("raw", NOW)).toBe("expired");
    expect(h.userUpdate).not.toHaveBeenCalled();
  });
  it("refuses an unknown or empty link", async () => {
    h.tokenFind.mockResolvedValue(null);
    expect(await redeemVerifyToken("nope", NOW)).toBe("invalid");
    expect(await redeemVerifyToken("", NOW)).toBe("invalid");
  });
  it("counts a double click once", async () => {
    h.tokenFind.mockResolvedValue(live);
    h.tokenClaim.mockResolvedValue({ count: 0 });
    expect(await redeemVerifyToken("raw", NOW)).toBe("invalid");
    expect(h.userUpdate).not.toHaveBeenCalled();
  });
});

describe("staff by email needs a verified address", () => {
  it("refuses a listed address that is not verified", async () => {
    h.userFind.mockResolvedValue({ role: "learner", email: "owner@example.com", emailVerified: null, createdAt: new Date(NOW) });
    h.userFindFirst.mockResolvedValue(null);
    expect(await isStaffUser("u1")).toBe(false);
  });
  it("accepts a listed address once verified", async () => {
    h.userFind.mockResolvedValue({ role: "learner", email: "owner@example.com", emailVerified: new Date(NOW), createdAt: new Date(NOW) });
    h.userFindFirst.mockResolvedValue(null);
    expect(await isStaffUser("u1")).toBe(true);
  });
  it("still accepts role staff without verification", async () => {
    h.userFind.mockResolvedValue({ role: "staff", email: "someone@else.com", emailVerified: null, createdAt: new Date(NOW) });
    expect(await isStaffUser("u1")).toBe(true);
  });
});
