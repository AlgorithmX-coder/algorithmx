import { beforeEach, describe, expect, it, vi } from "vitest";

/* eraseLearner with Prisma stubbed: a firm learner holding the seat's
 * BUNDLE entitlements is erased, every table that holds their data is
 * emptied for them inside one transaction, and a refused account is left
 * completely untouched. The row-by-row proof against a real database is
 * eraseLearner.db.test.ts. */

const h = vi.hoisted(() => {
  const table = () => ({ deleteMany: vi.fn(async () => ({ count: 1 })) });
  const tx = {
    seat: { update: vi.fn(async () => ({})), deleteMany: vi.fn(async () => ({ count: 1 })) },
    verificationToken: table(),
    waitlistEntry: table(),
    modelCall: table(),
    playbookEntry: table(),
    sandboxAttempt: table(),
    moduleProgress: table(),
    certificate: table(),
    enrolment: table(),
    entitlement: table(),
    orgMember: table(),
    session: table(),
    account: table(),
    passwordResetToken: table(),
    userPreference: table(),
    packShareLink: table(),
    user: { delete: vi.fn(async () => ({})) },
  };
  return {
    tx,
    userFind: vi.fn(),
    seatFind: vi.fn(),
    teacherInviteCount: vi.fn(),
    orgMemberCount: vi.fn(),
    transaction: vi.fn(async (fn: (t: typeof tx) => Promise<unknown>) => fn(tx)),
  };
});

vi.mock("@/app/lib/prisma", () => ({
  prisma: {
    user: { findUnique: h.userFind },
    seat: { findMany: h.seatFind },
    teacherInvite: { count: h.teacherInviteCount },
    orgMember: { count: h.orgMemberCount },
    $transaction: h.transaction,
  },
}));
vi.mock("@/app/lib/opsAlert", () => ({ opsAlert: vi.fn() }));

import { eraseLearner } from "./aiClearedOps";

const ent = (source: string, slug: string, name: string) => ({ source, product: { slug, name } });
const FIRM_SEAT = [ent("BUNDLE", "ai-cleared", "AI Cleared"), ent("BUNDLE", "ai-fluent", "AI Fluent"), ent("BUNDLE", "cyber-awareness", "Cyber Awareness")];

function learner(over: Record<string, unknown> = {}) {
  return {
    id: "u1",
    role: "learner",
    _count: { children: 0, proProgress: 0, classesTaught: 0 },
    entitlements: FIRM_SEAT,
    enrolments: [
      { id: "e1", certificate: { id: "c1" }, org: { name: "Kestrel Mutual" } },
      { id: "e2", certificate: null, org: { name: "Kestrel Mutual" } },
    ],
    orgMemberships: [{ orgId: "o1", role: "LEARNER" }],
    ...over,
  };
}

const claimed = { id: "s1", orgId: "o1", course: "CYBER_SECURED", userId: "u1", claimedAt: new Date(2026, 9, 2), invitedAt: new Date(2026, 9, 1), org: { name: "Kestrel Mutual" }, user: { email: "amara@kestrel.example" } };
const pending = { id: "s2", orgId: "o2", course: "CYBER_SECURED", userId: null, claimedAt: null, invitedAt: new Date(2026, 9, 3), org: { name: "Other Ltd" }, user: null };

beforeEach(() => {
  vi.clearAllMocks();
  h.userFind.mockResolvedValue(learner());
  h.seatFind.mockResolvedValue([claimed, pending]);
  h.teacherInviteCount.mockResolvedValue(0);
  h.orgMemberCount.mockResolvedValue(1);
});

describe("eraseLearner, allowed", () => {
  it("erases a firm learner whose only entitlements are the seat's BUNDLE grants", async () => {
    const r = await eraseLearner("  Amara@Kestrel.example ");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r).toMatchObject({ deletedAccount: true, seatsAnonymised: 1, invitesRemoved: 1, certificatesRemoved: 1, firms: ["Kestrel Mutual", "Other Ltd"] });
    expect(h.transaction).toHaveBeenCalledTimes(1);
  });

  it("deletes every table that holds the person, by their id, inside the transaction", async () => {
    await eraseLearner("amara@kestrel.example");
    const t = h.tx;
    const byUser = { where: { userId: "u1" } };
    const byEnrolment = { where: { enrolmentId: { in: ["e1", "e2"] } } };
    expect(t.modelCall.deleteMany).toHaveBeenCalledWith(byUser);
    expect(t.playbookEntry.deleteMany).toHaveBeenCalledWith(byEnrolment);
    expect(t.sandboxAttempt.deleteMany).toHaveBeenCalledWith(byEnrolment);
    expect(t.moduleProgress.deleteMany).toHaveBeenCalledWith(byEnrolment);
    expect(t.certificate.deleteMany).toHaveBeenCalledWith(byEnrolment);
    for (const k of ["enrolment", "entitlement", "orgMember", "session", "account", "passwordResetToken", "userPreference"] as const) {
      expect(t[k].deleteMany).toHaveBeenCalledWith(byUser);
    }
    expect(t.packShareLink.deleteMany).toHaveBeenCalledWith({ where: { createdById: "u1" } });
    expect(t.verificationToken.deleteMany).toHaveBeenCalledWith({ where: { identifier: "amara@kestrel.example" } });
    expect(t.waitlistEntry.deleteMany).toHaveBeenCalledWith({ where: { email: "amara@kestrel.example" } });
    expect(t.user.delete).toHaveBeenCalledWith({ where: { id: "u1" } });
  });

  it("keeps the claimed seat used but anonymised with a dead link, and removes the unclaimed invite", async () => {
    await eraseLearner("amara@kestrel.example");
    expect(h.tx.seat.update).toHaveBeenCalledTimes(1);
    const call = (h.tx.seat.update.mock.calls[0] as unknown as [{ where: { id: string }; data: Record<string, unknown> }])[0];
    expect(call.where).toEqual({ id: "s1" });
    expect(call.data.email).toMatch(/^removed-[0-9a-f]{12}@removed\.invalid$/);
    expect(call.data).toMatchObject({ userId: null, team: null, trackHint: null });
    expect(call.data.inviteToken).toEqual(expect.stringMatching(/^removed/));
    expect(call.data).not.toHaveProperty("claimedAt");
    expect(h.tx.seat.deleteMany).toHaveBeenCalledWith({ where: { id: { in: ["s2"] } } });
  });

  it("looks the seats up by address and by the account that claimed them", async () => {
    await eraseLearner("amara@kestrel.example");
    expect(h.seatFind.mock.calls[0][0].where).toEqual({ OR: [{ email: "amara@kestrel.example" }, { userId: "u1" }] });
  });
});

describe("eraseLearner, refused (nothing is written)", () => {
  async function refused(message: RegExp) {
    const r = await eraseLearner("amara@kestrel.example");
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.message).toMatch(message);
    expect(r.message).toMatch(/Nothing has been deleted\./);
    expect(h.transaction).not.toHaveBeenCalled();
  }

  it("a consumer who paid", async () => {
    h.userFind.mockResolvedValue(learner({ entitlements: [ent("PURCHASE", "cyberstart-pro", "Cyber Pro")] }));
    await refused(/bought Cyber Pro as an individual/);
  });

  it("a firm learner who also paid (mixed)", async () => {
    h.userFind.mockResolvedValue(learner({ entitlements: [...FIRM_SEAT, ent("PURCHASE", "cyber-heroes", "Cyber Heroes")] }));
    await refused(/bought Cyber Heroes/);
  });

  it("a seat at that address claimed by a different account", async () => {
    h.seatFind.mockResolvedValue([{ ...claimed, userId: "someone-else", user: { email: "amara.home@example.com" } }]);
    await refused(/claimed by a different account \(amara\.home@example\.com\)/);
  });

  it("a firm's only admin", async () => {
    h.userFind.mockResolvedValue(learner({ orgMemberships: [{ orgId: "o1", role: "ADMIN" }] }));
    h.orgMemberCount.mockResolvedValue(0);
    await refused(/only admin/);
  });

  it("someone on a school's staff", async () => {
    h.teacherInviteCount.mockResolvedValue(1);
    await refused(/school's staff/);
  });

  it("an address nobody holds", async () => {
    h.userFind.mockResolvedValue(null);
    h.seatFind.mockResolvedValue([]);
    await refused(/Nobody with that address/);
  });
});
