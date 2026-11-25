import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({ findUnique: vi.fn() }));
vi.mock("@/app/lib/prisma", () => ({ prisma: { user: { findUnique: h.findUnique } } }));

import { sessionStillValid, signedInBeforeChange } from "./sessionValidity";

const CHANGED = new Date("2026-11-25T12:00:00Z");

beforeEach(() => {
  h.findUnique.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("signedInBeforeChange", () => {
  it("never ends a session when the password has not changed", () => {
    expect(signedInBeforeChange(undefined, null)).toBe(false);
    expect(signedInBeforeChange(1, null)).toBe(false);
  });
  it("ends a session that signed in before the change", () => {
    expect(signedInBeforeChange(CHANGED.getTime() - 1, CHANGED)).toBe(true);
  });
  it("keeps a session that signed in after the change", () => {
    expect(signedInBeforeChange(CHANGED.getTime() + 1, CHANGED)).toBe(false);
  });
  it("ends an unstamped session once the password has changed", () => {
    expect(signedInBeforeChange(undefined, CHANGED)).toBe(true);
    expect(signedInBeforeChange("soon", CHANGED)).toBe(true);
  });
});

describe("sessionStillValid", () => {
  it("reads the user's last change", async () => {
    h.findUnique.mockResolvedValue({ passwordChangedAt: CHANGED });
    expect(await sessionStillValid("u1", CHANGED.getTime() - 1000)).toBe(false);
    expect(await sessionStillValid("u1", CHANGED.getTime() + 1000)).toBe(true);
    expect(h.findUnique).toHaveBeenCalledWith({ where: { id: "u1" }, select: { passwordChangedAt: true } });
  });
  it("ends the session of a user who no longer exists", async () => {
    h.findUnique.mockResolvedValue(null);
    expect(await sessionStillValid("gone", Date.now())).toBe(false);
  });
  it("keeps the session when the database cannot be reached", async () => {
    h.findUnique.mockRejectedValue(new Error("db down"));
    expect(await sessionStillValid("u1", 0)).toBe(true);
  });
});
