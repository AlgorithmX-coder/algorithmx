import { beforeEach, describe, expect, it, vi } from "vitest";

/* The email identity rule and the staff check, with Prisma stubbed. The
 * hole this pins: signing up as the owner's address in capitals must not
 * make a second account, and must not make anyone staff. */

const h = vi.hoisted(() => ({
  findUnique: vi.fn(),
  findFirst: vi.fn(),
  update: vi.fn(),
}));

vi.mock("@/app/lib/prisma", () => ({
  prisma: { user: { findUnique: h.findUnique, findFirst: h.findFirst, update: h.update } },
}));

import { emailEquals, emailTaken, findUserByEmail, normaliseEmail } from "./emailIdentity";
import { isStaffUser, staffEmails } from "./aiClearedStaff";

beforeEach(() => {
  h.findUnique.mockReset();
  h.findFirst.mockReset();
  h.update.mockReset();
  h.update.mockResolvedValue({});
  process.env.PLATFORM_STAFF_EMAILS = "owner@example.com, Second@Example.com";
});

describe("normaliseEmail", () => {
  it("trims and lowercases", () => {
    expect(normaliseEmail("  OWNER@Example.COM ")).toBe("owner@example.com");
  });
  it("turns anything that is not a string into an empty string", () => {
    expect(normaliseEmail(undefined)).toBe("");
    expect(normaliseEmail(null)).toBe("");
    expect(normaliseEmail(42)).toBe("");
    expect(normaliseEmail({ email: "a@b.c" })).toBe("");
  });
  it("builds a case-insensitive Prisma filter on the normalised form", () => {
    expect(emailEquals(" A@B.com")).toEqual({ equals: "a@b.com", mode: "insensitive" });
  });
});

describe("findUserByEmail", () => {
  it("prefers the exact normalised row", async () => {
    h.findUnique.mockResolvedValue({ id: "u1" });
    expect(await findUserByEmail("Me@X.com")).toEqual({ id: "u1" });
    expect(h.findUnique).toHaveBeenCalledWith({ where: { email: "me@x.com" } });
    expect(h.findFirst).not.toHaveBeenCalled();
  });
  it("falls back to the oldest row matching in any case", async () => {
    h.findUnique.mockResolvedValue(null);
    h.findFirst.mockResolvedValue({ id: "legacy" });
    expect(await findUserByEmail("me@x.com")).toEqual({ id: "legacy" });
    expect(h.findFirst).toHaveBeenCalledWith({ where: { email: { equals: "me@x.com", mode: "insensitive" } }, orderBy: { createdAt: "asc" } });
  });
  it("does not query for a blank address", async () => {
    expect(await findUserByEmail("   ")).toBeNull();
    expect(h.findUnique).not.toHaveBeenCalled();
  });
});

describe("emailTaken", () => {
  it("is true when any case of the address is held", async () => {
    h.findFirst.mockResolvedValue({ id: "u1" });
    expect(await emailTaken("OWNER@example.com")).toBe(true);
    expect(h.findFirst).toHaveBeenCalledWith({ where: { email: { equals: "owner@example.com", mode: "insensitive" } }, select: { id: true } });
  });
  it("is false when nobody holds it", async () => {
    h.findFirst.mockResolvedValue(null);
    expect(await emailTaken("new@example.com")).toBe(false);
  });
});

describe("isStaffUser", () => {
  const created = new Date("2026-01-01T00:00:00Z");

  it("reads the env list case-insensitively", () => {
    expect(staffEmails()).toEqual(new Set(["owner@example.com", "second@example.com"]));
  });
  it("lets role staff in whatever the address", async () => {
    h.findUnique.mockResolvedValue({ role: "staff", email: "someone@else.com", createdAt: created });
    expect(await isStaffUser("u1")).toBe(true);
  });
  it("lets the original holder of a listed address in", async () => {
    h.findUnique.mockResolvedValue({ role: "learner", email: "owner@example.com", createdAt: created });
    h.findFirst.mockResolvedValue(null);
    expect(await isStaffUser("u1")).toBe(true);
    expect(h.update).toHaveBeenCalledWith({ where: { id: "u1" }, data: { role: "staff" } });
  });
  it("refuses a mixed-case copy of a listed address when an older account holds it", async () => {
    h.findUnique.mockResolvedValue({ role: "learner", email: "OWNER@example.com", createdAt: new Date("2026-06-01T00:00:00Z") });
    h.findFirst.mockResolvedValue({ id: "real-owner" });
    expect(await isStaffUser("intruder")).toBe(false);
    expect(h.update).not.toHaveBeenCalled();
    expect(h.findFirst).toHaveBeenCalledWith({
      where: { id: { not: "intruder" }, email: { equals: "owner@example.com", mode: "insensitive" }, createdAt: { lte: new Date("2026-06-01T00:00:00Z") } },
      select: { id: true },
    });
  });
  it("refuses an address that is not listed", async () => {
    h.findUnique.mockResolvedValue({ role: "learner", email: "nobody@example.com", createdAt: created });
    expect(await isStaffUser("u1")).toBe(false);
    expect(h.findFirst).not.toHaveBeenCalled();
  });
  it("refuses a missing user or id", async () => {
    expect(await isStaffUser("")).toBe(false);
    h.findUnique.mockResolvedValue(null);
    expect(await isStaffUser("ghost")).toBe(false);
  });
});
