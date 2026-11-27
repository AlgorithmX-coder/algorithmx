import { beforeEach, describe, expect, it, vi } from "vitest";
import { claimTeamLink, ensureTeamLink, notifySeatsFull, remindNotJoined, rotateTeamLink, setTeamDomainLock } from "./firmTeamLink";

/* The team link claim and the seats-full email, with the database, the
 * mail and the enrolment mocked out. The rules themselves are pinned in
 * teamLink.test.ts; this checks the claim acts on them: what it writes,
 * what it leaves alone, and that the count is taken under the lock. */

const h = vi.hoisted(() => ({
  orgFindUnique: vi.fn(),
  orgUpdateMany: vi.fn(),
  productCount: vi.fn(),
  userFindUnique: vi.fn(),
  seatFindMany: vi.fn(),
  seatFindFirst: vi.fn(),
  seatCreate: vi.fn(),
  seatUpdate: vi.fn(),
  memberUpsert: vi.fn(),
  queryRaw: vi.fn(),
  enrol: vi.fn(),
  sendEmail: vi.fn(),
  orgUpdate: vi.fn(),
  peek: vi.fn(),
  hit: vi.fn(),
}));

const tx = {
  $queryRaw: h.queryRaw,
  seat: { findMany: h.seatFindMany, create: h.seatCreate, update: h.seatUpdate },
  orgMember: { upsert: h.memberUpsert },
};

vi.mock("@/app/lib/prisma", () => ({
  prisma: {
    organisation: { findUnique: h.orgFindUnique, updateMany: h.orgUpdateMany, update: h.orgUpdate },
    product: { count: h.productCount },
    user: { findUnique: h.userFindUnique },
    seat: { findMany: h.seatFindMany, findFirst: h.seatFindFirst },
    $transaction: (fn: (t: typeof tx) => unknown) => fn(tx),
  },
}));
vi.mock("@/app/lib/aiCleared", () => ({ enrolOnEveryTrack: h.enrol }));
vi.mock("@/app/lib/aiClearedAdmin", () => ({ newInviteToken: (p: string) => `${p}-newtoken` }));
vi.mock("@/app/lib/resend", () => ({ sendEmail: h.sendEmail }));
vi.mock("@/app/lib/rateLimit", () => ({ peek: h.peek, hit: h.hit, rateKey: (b: string, s: string) => `${b}:${s}` }));

const ORG = { id: "org1", name: "Kestrel Mutual", slug: "kestrel-mutual", seatsPurchased: 50, revokedAt: null, teamDomain: "kestrel.co.uk" };
const at = new Date("2026-11-20T10:00:00Z");

/* findMany is called twice per count: this person's seats, then everyone's. */
function seats(mine: unknown[], used: number) {
  h.seatFindMany.mockImplementation((args: { distinct?: string[] }) =>
    Promise.resolve(args.distinct ? Array.from({ length: used }, (_, i) => ({ email: `p${i}@kestrel.co.uk` })) : mine),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  h.orgFindUnique.mockResolvedValue(ORG);
  h.productCount.mockResolvedValue(3);
  h.userFindUnique.mockResolvedValue({ email: "Tom@Kestrel.co.uk" });
  h.queryRaw.mockResolvedValue([{ ok: 1 }]);
  h.seatCreate.mockImplementation(({ data }) => Promise.resolve({ id: "new", role: "LEARNER", team: null, ...data }));
  h.seatUpdate.mockImplementation(({ where }) => Promise.resolve({ id: where.id, role: "LEARNER", team: "Finance" }));
  h.memberUpsert.mockResolvedValue({});
  h.enrol.mockResolvedValue([]);
  h.sendEmail.mockResolvedValue({ id: "e1" });
});

describe("claimTeamLink", () => {
  it("gives a newcomer a claimed seat under their lowercased address, as a learner, and enrols them", async () => {
    seats([], 32);
    const r = await claimTeamLink({ token: "team-x", userId: "u1", track: "finance" });
    expect(r).toEqual({ ok: true, orgName: "Kestrel Mutual", orgId: "org1" });
    expect(h.queryRaw).toHaveBeenCalledTimes(1);
    expect(h.seatCreate).toHaveBeenCalledWith({ data: expect.objectContaining({ orgId: "org1", email: "tom@kestrel.co.uk", role: "LEARNER", course: "CYBER_SECURED", userId: "u1", claimedAt: expect.any(Date) }) });
    expect(h.memberUpsert).toHaveBeenCalledWith(expect.objectContaining({ create: expect.objectContaining({ orgId: "org1", userId: "u1", role: "LEARNER" }) }));
    expect(h.enrol).toHaveBeenCalledWith({ userId: "u1", orgId: "org1", track: "finance" });
  });

  it("takes nothing when the seats are full", async () => {
    seats([], 50);
    const r = await claimTeamLink({ token: "team-x", userId: "u1", track: "finance" });
    expect(r).toEqual({ ok: false, reason: "full", orgId: "org1" });
    expect(h.seatCreate).not.toHaveBeenCalled();
    expect(h.memberUpsert).not.toHaveBeenCalled();
    expect(h.enrol).not.toHaveBeenCalled();
  });

  it("does not add a second seat for someone already in", async () => {
    seats([{ id: "s1", email: "tom@kestrel.co.uk", userId: "u1", claimedAt: at, removedAt: null, role: "LEARNER", team: null }], 32);
    const r = await claimTeamLink({ token: "team-x", userId: "u1", track: "finance" });
    expect(r.ok).toBe(true);
    expect(h.seatCreate).not.toHaveBeenCalled();
    expect(h.seatUpdate).not.toHaveBeenCalled();
  });

  it("claims the invite already sent to their address instead of adding a seat", async () => {
    seats([{ id: "s9", email: "tom@kestrel.co.uk", userId: null, claimedAt: null, removedAt: null, role: "LEARNER", team: "Finance" }], 50);
    const r = await claimTeamLink({ token: "team-x", userId: "u1", track: "finance" });
    expect(r.ok).toBe(true);
    expect(h.seatUpdate).toHaveBeenCalledWith({ where: { id: "s9" }, data: { userId: "u1", claimedAt: expect.any(Date) } });
    expect(h.seatCreate).not.toHaveBeenCalled();
  });

  it("keeps someone outside the firm's domain out", async () => {
    h.userFindUnique.mockResolvedValue({ email: "tom@gmail.com" });
    seats([], 10);
    expect(await claimTeamLink({ token: "team-x", userId: "u1", track: "finance" })).toEqual({ ok: false, reason: "wrong-domain", orgId: "org1" });
    expect(h.seatCreate).not.toHaveBeenCalled();
  });

  it("says not found for a link that has been replaced", async () => {
    h.orgFindUnique.mockResolvedValue(null);
    expect(await claimTeamLink({ token: "team-old", userId: "u1", track: "finance" })).toEqual({ ok: false, reason: "not-found" });
  });
});

describe("notifySeatsFull", () => {
  beforeEach(() => {
    h.seatFindFirst.mockResolvedValue({ email: "amara@kestrel.co.uk", user: { name: "Amara Osei", email: "amara@kestrel.co.uk" } });
    h.orgFindUnique.mockImplementation((args: { select?: Record<string, boolean> }) =>
      Promise.resolve(args.select?.contactName ? { contactName: null } : { name: "Kestrel Mutual", seatsPurchased: 50 }),
    );
  });

  it("emails the lead when it is the first refusal of the day", async () => {
    h.orgUpdateMany.mockResolvedValue({ count: 1 });
    expect(await notifySeatsFull({ orgId: "org1", origin: "https://algorithmx.io", now: at })).toBe(true);
    const where = h.orgUpdateMany.mock.calls[0][0].where;
    expect(where.OR[1].teamFullNotifiedAt.lt).toEqual(new Date(at.getTime() - 24 * 60 * 60 * 1000));
    expect(h.sendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: "amara@kestrel.co.uk" }));
    expect(h.sendEmail.mock.calls[0][0].text).toContain("All 50 seats are taken.");
    expect(h.sendEmail.mock.calls[0][0].text).toContain("https://algorithmx.io/corporate/buy");
  });

  it("sends nothing when the lead was told in the last day", async () => {
    h.orgUpdateMany.mockResolvedValue({ count: 0 });
    expect(await notifySeatsFull({ orgId: "org1", origin: "https://algorithmx.io", now: at })).toBe(false);
    expect(h.sendEmail).not.toHaveBeenCalled();
  });
});

describe("ensureTeamLink", () => {
  it("returns the link a firm already has without touching it", async () => {
    h.orgFindUnique.mockResolvedValue({ teamToken: "team-abc", teamDomain: "kestrel.co.uk" });
    expect(await ensureTeamLink("org1")).toEqual({ token: "team-abc", domain: "kestrel.co.uk" });
    expect(h.orgUpdateMany).not.toHaveBeenCalled();
  });

  it("makes one, locked to the lead's domain, only if the firm has none", async () => {
    h.orgFindUnique.mockResolvedValueOnce({ teamToken: null, teamDomain: null }).mockResolvedValueOnce({ contactName: null }).mockResolvedValueOnce({ teamToken: "team-new", teamDomain: "kestrel.co.uk" });
    h.seatFindFirst.mockResolvedValue({ email: "amara@kestrel.co.uk", user: null });
    h.orgUpdateMany.mockResolvedValue({ count: 1 });
    expect(await ensureTeamLink("org1")).toEqual({ token: "team-new", domain: "kestrel.co.uk" });
    expect(h.orgUpdateMany).toHaveBeenCalledWith({ where: { id: "org1", teamToken: null }, data: { teamToken: expect.stringMatching(/^team-/), teamDomain: "kestrel.co.uk" } });
  });
});

describe("rotateTeamLink", () => {
  it("replaces the token, so the old link stops working", async () => {
    h.orgFindUnique.mockResolvedValue({ teamToken: "team-old" });
    const t = await rotateTeamLink("org1");
    expect(t).toMatch(/^team-/);
    expect(t).not.toBe("team-old");
    expect(h.orgUpdate).toHaveBeenCalledWith({ where: { id: "org1" }, data: { teamToken: t } });
  });
});

describe("setTeamDomainLock", () => {
  beforeEach(() => {
    h.orgFindUnique.mockImplementation((args: { select?: Record<string, boolean> }) => Promise.resolve(args.select?.contactName ? { contactName: null } : { teamToken: "team-abc", teamDomain: null }));
  });
  it("locks to the lead's domain", async () => {
    h.seatFindFirst.mockResolvedValue({ email: "amara@kestrel.co.uk", user: null });
    expect(await setTeamDomainLock("org1", true)).toEqual({ ok: true, domain: "kestrel.co.uk" });
  });
  it("refuses to lock a free-provider lead's link to everyone at Gmail", async () => {
    h.seatFindFirst.mockResolvedValue({ email: "amara@gmail.com", user: null });
    const r = await setTeamDomainLock("org1", true);
    expect(r.ok).toBe(false);
    expect(h.orgUpdate).not.toHaveBeenCalled();
  });
  it("switches off", async () => {
    expect(await setTeamDomainLock("org1", false)).toEqual({ ok: true, domain: null });
    expect(h.orgUpdate).toHaveBeenCalledWith({ where: { id: "org1" }, data: { teamDomain: null } });
  });
});

describe("remindNotJoined", () => {
  const args = { orgId: "org1", firmName: "Kestrel Mutual", origin: "https://algorithmx.io", adminName: "Amara Osei", adminEmail: "amara@kestrel.co.uk" };
  beforeEach(() => {
    h.orgFindUnique.mockResolvedValue({ teamToken: "team-abc", teamDomain: "kestrel.co.uk" });
    h.seatFindMany.mockResolvedValue([
      { email: "in@kestrel.co.uk", claimedAt: at, removedAt: null },
      { email: "gone@kestrel.co.uk", claimedAt: at, removedAt: at },
    ]);
    h.peek.mockResolvedValue({ ok: true });
    h.hit.mockResolvedValue({ ok: true });
  });

  it("reminds only the people still to join, with the team link, under the admin's name", async () => {
    const r = await remindNotJoined({ ...args, emails: ["In@kestrel.co.uk", "gone@kestrel.co.uk", "tom@kestrel.co.uk", "sam@gmail.com", "not an address"] });
    expect(r).toEqual({ ok: true, sent: ["tom@kestrel.co.uk"], joined: ["in@kestrel.co.uk"], removed: ["gone@kestrel.co.uk"], recent: [], offDomain: ["sam@gmail.com"], invalid: ["not an address"], failed: [], overLimit: [] });
    expect(h.sendEmail).toHaveBeenCalledTimes(1);
    const mail = h.sendEmail.mock.calls[0][0];
    expect(mail.to).toBe("tom@kestrel.co.uk");
    expect(mail.replyTo).toBe("amara@kestrel.co.uk");
    expect(mail.text).toContain("https://algorithmx.io/ai-cleared/join/team-abc");
  });

  it("sends nobody a second reminder the same day", async () => {
    h.peek.mockResolvedValue({ ok: false });
    const r = await remindNotJoined({ ...args, emails: ["tom@kestrel.co.uk"] });
    expect(r.ok && r.recent).toEqual(["tom@kestrel.co.uk"]);
    expect(h.sendEmail).not.toHaveBeenCalled();
  });

  it("stops at the firm's daily ceiling", async () => {
    h.hit.mockResolvedValue({ ok: false });
    const r = await remindNotJoined({ ...args, emails: ["tom@kestrel.co.uk"] });
    expect(r.ok && r.overLimit).toEqual(["tom@kestrel.co.uk"]);
    expect(h.sendEmail).not.toHaveBeenCalled();
  });
});
