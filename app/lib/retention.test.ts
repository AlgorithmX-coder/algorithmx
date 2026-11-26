import { beforeEach, describe, expect, it, vi } from "vitest";

/* A Prisma stand-in: every model method the job touches, as a mock. Nothing
   here talks to a database. */
const db = vi.hoisted(() => {
  const model = () => ({
    findMany: vi.fn(async () => [] as unknown[]),
    count: vi.fn(async () => 0),
    deleteMany: vi.fn(async () => ({ count: 0 })),
    delete: vi.fn(async () => ({})),
    update: vi.fn(async () => ({})),
  });
  return {
    user: model(),
    orgMember: model(),
    seatPurchase: model(),
    placePurchase: model(),
    schoolEnquiry: model(),
    waitlistEntry: model(),
    modelCall: model(),
    rateLimit: model(),
    passwordResetToken: model(),
    verificationToken: model(),
  };
});
const sent = vi.hoisted(() => ({ sendEmail: vi.fn(async () => ({ id: null })) }));
const erase = vi.hoisted(() => ({ eraseLearner: vi.fn(async () => ({ ok: true })) }));

vi.mock("@/app/lib/prisma", () => ({ prisma: db }));
vi.mock("@/app/lib/resend", () => sent);
vi.mock("@/app/lib/aiClearedOps", () => erase);
vi.mock("@/app/lib/opsAlert", () => ({ OPS_ALERT_TO: "ops@example.invalid" }));
vi.mock("@/app/lib/aiClearedStaff", () => ({ staffEmails: () => new Set(["owner@example.invalid"]) }));

import {
  RETENTION_DELETE_ENABLED,
  applyRetention,
  deleteForPlan,
  planRetention,
  sendRetentionSummary,
  summarise,
} from "./retention";
import { daysBefore } from "./retentionRule";

const now = new Date("2029-06-01T00:00:00Z");
const ago = (d: number) => daysBefore(now, d);
const allMocks = () => Object.values(db).flatMap((m) => Object.values(m));

beforeEach(() => {
  for (const m of allMocks()) m.mockClear();
  sent.sendEmail.mockClear();
  erase.eraseLearner.mockClear();
});

function seed() {
  /* user.findMany is called twice: individuals first, then pupils. */
  db.user.findMany
    .mockResolvedValueOnce([
      { id: "u-del", email: "gone@example.invalid", createdAt: ago(1000), lastSignInAt: ago(760), retentionWarnedAt: ago(40), entitlements: [] },
      { id: "u-warn", email: "quiet@example.invalid", createdAt: ago(1000), lastSignInAt: ago(710), retentionWarnedAt: null, entitlements: [] },
      { id: "u-paid", email: "paid@example.invalid", createdAt: ago(1000), lastSignInAt: ago(760), retentionWarnedAt: ago(40), entitlements: [{ grantedAt: ago(900) }] },
      { id: "u-owner", email: "Owner@example.invalid", createdAt: ago(1000), lastSignInAt: ago(760), retentionWarnedAt: ago(40), entitlements: [] },
    ])
    .mockResolvedValueOnce([
      { id: "p-old", children: [{ classId: "c1", class: { org: { revokedAt: ago(100), trialExpiresAt: null } } }] },
      { id: "p-recent", children: [{ classId: "c2", class: { org: { revokedAt: ago(20), trialExpiresAt: null } } }] },
      { id: "p-orphan", children: [{ classId: null, class: null }] },
    ]);
  db.orgMember.findMany.mockResolvedValueOnce([
    { user: { id: "l-1", email: "learner@firm.invalid", role: "learner", orgMemberships: [{ role: "LEARNER", org: { revokedAt: ago(120), trialExpiresAt: null } }] } },
    { user: { id: "l-2", email: "busy@firm.invalid", role: "learner", orgMemberships: [
      { role: "LEARNER", org: { revokedAt: ago(120), trialExpiresAt: null } },
      { role: "LEARNER", org: { revokedAt: null, trialExpiresAt: null } },
    ] } },
  ]);
  db.seatPurchase.findMany.mockResolvedValueOnce([{ id: "sp-1" }]);
  db.schoolEnquiry.findMany.mockResolvedValueOnce([{ id: "e-1" }, { id: "e-2" }]);
  db.modelCall.count.mockResolvedValueOnce(7);
}

describe("planRetention", () => {
  it("works out exactly which rows the policy would remove", async () => {
    seed();
    const plan = await planRetention(now);
    expect(plan.targets.individualIds).toEqual(["u-del"]);
    expect(plan.targets.warnIds).toEqual([{ id: "u-warn", email: "quiet@example.invalid" }]);
    expect(plan.targets.pupilUserIds).toEqual(["p-old", "p-orphan"]);
    expect(plan.targets.firmLearnerEmails).toEqual(["learner@firm.invalid"]);
    expect(plan.targets.seatPurchaseIds).toEqual(["sp-1"]);
    expect(plan.targets.schoolEnquiryIds).toEqual(["e-1", "e-2"]);

    const ind = plan.categories.find((c) => c.key === "individuals")!;
    expect(ind.wouldDelete).toBe(1);
    expect(ind.wouldWarn).toBe(1);
    expect(ind.held).toEqual([
      { reason: "holds a purchase under 6 years old", count: 1 },
      { reason: "AlgorithmX staff address", count: 1 },
    ]);
    expect(plan.categories.find((c) => c.key === "firmLearners")!.held).toEqual([
      { reason: "also belongs to an organisation still running", count: 1 },
    ]);
    expect(plan.categories.find((c) => c.key === "logs")!.wouldDelete).toBe(7);
    expect(plan.unmeasured.length).toBeGreaterThan(0);
  });

  it("only reads: planning deletes, updates and emails nothing", async () => {
    seed();
    await planRetention(now);
    for (const m of Object.values(db)) {
      expect(m.deleteMany).not.toHaveBeenCalled();
      expect(m.delete).not.toHaveBeenCalled();
      expect(m.update).not.toHaveBeenCalled();
    }
    expect(sent.sendEmail).not.toHaveBeenCalled();
  });

  it("summarise carries counts, never addresses or ids", async () => {
    seed();
    const s = JSON.stringify(summarise(await planRetention(now)));
    expect(s).not.toContain("@example.invalid");
    expect(s).not.toContain("u-del");
  });
});

describe("the switch", () => {
  it("is off in this release", () => {
    expect(RETENTION_DELETE_ENABLED).toBe(false);
  });

  it("applyRetention changes nothing while it is off", async () => {
    seed();
    const plan = await planRetention(now);
    const res = await applyRetention(plan);
    expect(res.ran).toBe(false);
    for (const m of Object.values(db)) {
      expect(m.deleteMany).not.toHaveBeenCalled();
      expect(m.delete).not.toHaveBeenCalled();
      expect(m.update).not.toHaveBeenCalled();
    }
    expect(erase.eraseLearner).not.toHaveBeenCalled();
    expect(sent.sendEmail).not.toHaveBeenCalled();
  });
});

describe("deleteForPlan (reached only through the switch)", () => {
  it("deletes exactly the planned rows, warns, and clears old logs", async () => {
    seed();
    const plan = await planRetention(now);
    db.seatPurchase.deleteMany.mockResolvedValueOnce({ count: 1 });
    db.schoolEnquiry.deleteMany.mockResolvedValueOnce({ count: 2 });
    db.modelCall.deleteMany.mockResolvedValue({ count: 0 });

    const res = await deleteForPlan(plan, now);

    expect(db.user.delete.mock.calls.map((c) => (c as unknown as [{ where: { id: string } }])[0].where.id)).toEqual(["u-del", "p-old", "p-orphan"]);
    expect(erase.eraseLearner).toHaveBeenCalledTimes(1);
    expect(erase.eraseLearner).toHaveBeenCalledWith("learner@firm.invalid");
    expect(sent.sendEmail).toHaveBeenCalledTimes(1);
    expect(sent.sendEmail.mock.calls[0]).toBeDefined();
    expect(db.user.update).toHaveBeenCalledWith({ where: { id: "u-warn" }, data: { retentionWarnedAt: now } });
    expect(db.seatPurchase.deleteMany).toHaveBeenCalledWith({ where: { id: { in: ["sp-1"] } } });
    expect(db.placePurchase.deleteMany).not.toHaveBeenCalled();
    expect(db.rateLimit.deleteMany).toHaveBeenCalledWith({ where: { windowStart: { lt: new Date(plan.logCutoff) } } });
    expect(res).toMatchObject({ ran: true, warned: 1, failures: [] });
    expect(res.deleted).toMatchObject({ individual: 1, pupil: 2, firmLearner: 1, seatPurchase: 1, schoolEnquiry: 2 });
  });

  it("reports a row that refuses and carries on with the rest", async () => {
    seed();
    const plan = await planRetention(now);
    db.user.delete.mockRejectedValueOnce(new Error("foreign key"));
    const res = await deleteForPlan(plan, now);
    expect(res.failures).toEqual(["individual u-del: foreign key"]);
    expect(res.deleted.pupil).toBe(2);
  });

  it("does not stamp a warning whose email failed, so it is tried again", async () => {
    seed();
    const plan = await planRetention(now);
    sent.sendEmail.mockRejectedValueOnce(new Error("resend down"));
    const res = await deleteForPlan(plan, now);
    expect(db.user.update).not.toHaveBeenCalled();
    expect(res.warned).toBe(0);
  });
});

describe("sendRetentionSummary", () => {
  it("emails ops once, saying it was a dry run, with counts only", async () => {
    seed();
    const plan = await planRetention(now);
    await sendRetentionSummary(plan, await applyRetention(plan));
    expect(sent.sendEmail).toHaveBeenCalledTimes(1);
    const arg = (sent.sendEmail.mock.calls[0] as unknown as [{ to: string; text: string }])[0];
    expect(arg.to).toBe("ops@example.invalid");
    expect(arg.text).toContain("dry run");
    expect(arg.text).not.toContain("gone@example.invalid");
  });
});
