import { beforeEach, describe, expect, it, vi } from "vitest";
import { removePerson } from "./aiClearedAdmin";

/* The lead removing someone from the firm's seats: what is deleted, what
 * is only marked, and who may not be removed. Database mocked out. */

const h = vi.hoisted(() => ({
  seatFindFirst: vi.fn(),
  seatFindMany: vi.fn(),
  seatDelete: vi.fn(),
  seatUpdate: vi.fn(),
  seatCount: vi.fn(),
  userFindUnique: vi.fn(),
  memberFindUnique: vi.fn(),
  memberCount: vi.fn(),
  memberDeleteMany: vi.fn(),
  entDeleteMany: vi.fn(),
}));

vi.mock("@/app/lib/prisma", () => {
  const tx = {
    seat: { update: h.seatUpdate, count: h.seatCount },
    orgMember: { deleteMany: h.memberDeleteMany },
    entitlement: { deleteMany: h.entDeleteMany },
  };
  return {
    prisma: {
      seat: { findFirst: h.seatFindFirst, findMany: h.seatFindMany, delete: h.seatDelete },
      user: { findUnique: h.userFindUnique },
      orgMember: { findUnique: h.memberFindUnique, count: h.memberCount },
      $transaction: (fn: (t: typeof tx) => unknown) => fn(tx),
    },
  };
});
vi.mock("@/app/lib/resend", () => ({ sendEmail: vi.fn() }));
vi.mock("@/app/lib/opsAlert", () => ({ opsAlert: vi.fn() }));

const at = new Date("2026-11-20T10:00:00Z");
const LEAD = { email: "amara@kestrel.co.uk", role: "ADMIN" as const, staff: false };
const claimed = { id: "s1", orgId: "org1", email: "tom@kestrel.co.uk", userId: "u1", claimedAt: at, removedAt: null, role: "LEARNER" };

beforeEach(() => {
  vi.clearAllMocks();
  h.userFindUnique.mockResolvedValue({ email: "tom@kestrel.co.uk" });
  h.memberFindUnique.mockResolvedValue({ role: "LEARNER" });
  h.seatFindMany.mockResolvedValue([{ id: "s1" }]);
  h.seatCount.mockResolvedValue(0);
  h.memberCount.mockResolvedValue(1);
});

describe("removePerson", () => {
  it("deletes an invite nobody has opened, as before", async () => {
    h.seatFindFirst.mockResolvedValue({ ...claimed, userId: null, claimedAt: null });
    expect(await removePerson({ orgId: "org1", seatId: "s1", actor: LEAD })).toEqual({ ok: true, deleted: true });
    expect(h.seatDelete).toHaveBeenCalledWith({ where: { id: "s1" } });
  });

  it("marks a claimed seat removed, kills its link, takes them out of the firm and closes the courses", async () => {
    h.seatFindFirst.mockResolvedValue(claimed);
    expect(await removePerson({ orgId: "org1", seatId: "s1", actor: LEAD })).toEqual({ ok: true, deleted: false });
    expect(h.seatDelete).not.toHaveBeenCalled();
    expect(h.seatUpdate).toHaveBeenCalledWith({ where: { id: "s1" }, data: { removedAt: expect.any(Date), inviteToken: expect.stringMatching(/^removed-/) } });
    expect(h.memberDeleteMany).toHaveBeenCalledWith({ where: { orgId: "org1", userId: "u1" } });
    expect(h.entDeleteMany).toHaveBeenCalledWith({ where: { userId: "u1", source: "BUNDLE", product: { slug: { in: expect.arrayContaining(["ai-cleared", "ai-fluent"]) } } } });
  });

  it("leaves the courses open for someone who still holds a seat at another firm", async () => {
    h.seatFindFirst.mockResolvedValue(claimed);
    h.seatCount.mockResolvedValue(1);
    await removePerson({ orgId: "org1", seatId: "s1", actor: LEAD });
    expect(h.entDeleteMany).not.toHaveBeenCalled();
  });

  it("will not let the lead remove themselves", async () => {
    h.seatFindFirst.mockResolvedValue({ ...claimed, email: "amara@kestrel.co.uk", role: "ADMIN" });
    h.userFindUnique.mockResolvedValue({ email: "amara@kestrel.co.uk" });
    const r = await removePerson({ orgId: "org1", seatId: "s1", actor: LEAD });
    expect(r.ok).toBe(false);
    expect(h.seatUpdate).not.toHaveBeenCalled();
  });

  it("will not let a manager remove an admin", async () => {
    h.seatFindFirst.mockResolvedValue({ ...claimed, role: "ADMIN" });
    const r = await removePerson({ orgId: "org1", seatId: "s1", actor: { ...LEAD, role: "MANAGER" } });
    expect(r).toMatchObject({ ok: false, status: 403 });
  });

  it("will not remove the firm's last admin", async () => {
    h.seatFindFirst.mockResolvedValue({ ...claimed, role: "ADMIN" });
    h.memberCount.mockResolvedValue(0);
    const r = await removePerson({ orgId: "org1", seatId: "s1", actor: LEAD });
    expect(r).toMatchObject({ ok: false, status: 409 });
  });

  it("does nothing twice", async () => {
    h.seatFindFirst.mockResolvedValue({ ...claimed, removedAt: at });
    expect(await removePerson({ orgId: "org1", seatId: "s1", actor: LEAD })).toEqual({ ok: true, deleted: false });
    expect(h.seatUpdate).not.toHaveBeenCalled();
  });
});
