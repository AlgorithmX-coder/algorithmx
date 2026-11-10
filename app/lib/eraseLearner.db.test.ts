import { afterAll, beforeAll, describe, expect, it } from "vitest";

/* eraseLearner against a REAL, PRIVATE Postgres: seed a firm learner with
 * a row in every table that can hold them, erase, and count what is left.
 *
 * Skipped unless ERASE_TEST_DATABASE_URL is set, and refuses to run unless
 * that database is on this machine and is not the shared algorithmx_dev.
 * Never point it at a shared or production database. To run it:
 *   initdb a throwaway cluster, createdb erase_private, then
 *   DATABASE_URL=<url> npx prisma migrate deploy
 *   ERASE_TEST_DATABASE_URL=<url> npx vitest run app/lib/eraseLearner.db.test.ts */

const URL_ = process.env.ERASE_TEST_DATABASE_URL;

function safe(url: string | undefined): boolean {
  if (!url) return false;
  const u = new URL(url);
  const db = u.pathname.replace(/^\//, "");
  if (!["localhost", "127.0.0.1", "::1", "[::1]"].includes(u.hostname)) throw new Error("ERASE_TEST_DATABASE_URL must be a local database.");
  if (!db || db === "algorithmx_dev" || db === "algorithmx") throw new Error("ERASE_TEST_DATABASE_URL must be a private throwaway database, not the shared one.");
  return true;
}

const RUN = safe(URL_);
if (RUN) process.env.DATABASE_URL = URL_;

describe.skipIf(!RUN)("eraseLearner on a private database", async () => {
  const { prisma } = await import("@/app/lib/prisma");
  const { eraseLearner } = await import("@/app/lib/aiClearedOps");
  const { seatsLeft } = await import("@/app/lib/aiClearedAdmin");

  const run = Math.random().toString(36).slice(2, 8);
  const email = `amara-${run}@kestrel.example`;
  const bystanderEmail = `ben-${run}@kestrel.example`;
  const buyerEmail = `cara-${run}@home.example`;
  let orgId = "";
  let userId = "";
  let enrolmentIds: string[] = [];
  let bystanderId = "";

  async function product(slug: string, name: string) {
    return prisma.product.upsert({
      where: { slug },
      update: {},
      create: { slug, name, ageMin: 18, ageMax: 99, priceGBP: 0, weeks: 5, emoji: "x", ageRange: "18+", duration: "1h", weeksCount: 0, status: "ACTIVE" },
    });
  }

  beforeAll(async () => {
    const tracks = await Promise.all([product("ai-cleared", "AI Cleared"), product("ai-fluent", "AI Fluent"), product("cyber-awareness", "Cyber Awareness")]);
    const pro = await product("cyberstart-pro", "Cyber Pro");
    const org = await prisma.organisation.create({ data: { name: `Kestrel ${run}`, slug: `kestrel-${run}`, seatsPurchased: 10 } });
    const other = await prisma.organisation.create({ data: { name: `Other ${run}`, slug: `other-${run}`, seatsPurchased: 5 } });
    orgId = org.id;

    const user = await prisma.user.create({ data: { email, name: "Amara Osei" } });
    userId = user.id;
    const bystander = await prisma.user.create({ data: { email: bystanderEmail, name: "Ben" } });
    bystanderId = bystander.id;
    await prisma.orgMember.create({ data: { orgId, userId: bystanderId, role: "ADMIN" } });

    /* The person: two claimed seats at Kestrel from before the licence
       (old Cleared + old Fluent: one person, one seat), an unclaimed invite
       at another firm, membership, enrolments with every child row. */
    await prisma.seat.create({ data: { orgId, email, userId, inviteToken: `t1-${run}`, course: "AI_CLEARED", team: "Finance", trackHint: "FINANCE", claimedAt: new Date() } });
    await prisma.seat.create({ data: { orgId, email, userId, inviteToken: `t2-${run}`, course: "AI_FLUENT", claimedAt: new Date() } });
    await prisma.seat.create({ data: { orgId: other.id, email, inviteToken: `t3-${run}` } });
    await prisma.seat.create({ data: { orgId, email: bystanderEmail, userId: bystanderId, inviteToken: `t4-${run}`, role: "ADMIN", claimedAt: new Date() } });
    await prisma.orgMember.create({ data: { orgId, userId, role: "LEARNER", team: "Finance" } });
    for (const t of tracks) await prisma.entitlement.create({ data: { userId, productId: t.id, source: "BUNDLE" } });
    for (const t of tracks) await prisma.entitlement.create({ data: { userId: bystanderId, productId: t.id, source: "BUNDLE" } });
    const enrolments = await Promise.all(tracks.map((t) => prisma.enrolment.create({ data: { userId, productId: t.id, orgId } })));
    enrolmentIds = enrolments.map((e) => e.id);
    await prisma.moduleProgress.create({ data: { enrolmentId: enrolmentIds[0], module: 1, completedAt: new Date() } });
    await prisma.sandboxAttempt.create({ data: { enrolmentId: enrolmentIds[0], module: 2, tool: "COPILOT", verdict: "OK" } });
    await prisma.playbookEntry.create({ data: { enrolmentId: enrolmentIds[1], module: 1, workflow: "w", tool: "CLAUDE", prompt: "my own words" } });
    await prisma.certificate.create({ data: { enrolmentId: enrolmentIds[0], orgId, serial: `AXC-${run}`, score: 90, expiresAt: new Date(Date.now() + 864e8) } });
    await prisma.modelCall.create({ data: { userId, course: "AI_CLEARED", route: "grade" } });
    await prisma.modelCall.create({ data: { userId: bystanderId, course: "AI_CLEARED", route: "grade" } });
    await prisma.session.create({ data: { userId, sessionToken: `st-${run}`, expires: new Date(Date.now() + 864e5) } });
    await prisma.account.create({ data: { userId, type: "oauth", provider: "google", providerAccountId: `g-${run}` } });
    await prisma.passwordResetToken.create({ data: { userId, tokenHash: `h-${run}`, expiresAt: new Date(Date.now() + 36e5) } });
    await prisma.userPreference.create({ data: { userId } });
    await prisma.verificationToken.create({ data: { identifier: email, token: `vt-${run}`, expires: new Date(Date.now() + 36e5) } });
    await prisma.waitlistEntry.create({ data: { email, productId: pro.id } });

    /* A consumer who paid, to show a refusal touches nothing. */
    const buyer = await prisma.user.create({ data: { email: buyerEmail } });
    await prisma.entitlement.create({ data: { userId: buyer.id, productId: pro.id, source: "PURCHASE" } });
    await prisma.entitlement.create({ data: { userId: buyer.id, productId: tracks[0].id, source: "BUNDLE" } });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { in: [bystanderEmail, buyerEmail] } } });
    await prisma.modelCall.deleteMany({ where: { userId: bystanderId } });
    await prisma.organisation.deleteMany({ where: { slug: { in: [`kestrel-${run}`, `other-${run}`] } } });
    await prisma.$disconnect();
  });

  it("refuses the consumer who paid, and leaves their account exactly as it was", async () => {
    const r = await eraseLearner(buyerEmail);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toMatch(/bought Cyber Pro as an individual/);
    expect(await prisma.user.count({ where: { email: buyerEmail } })).toBe(1);
    expect(await prisma.entitlement.count({ where: { user: { email: buyerEmail } } })).toBe(2);
  });

  it("erases the firm learner: no row anywhere still points at them", async () => {
    const before = await seatsLeft(orgId);
    const r = await eraseLearner(email.toUpperCase());
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r).toMatchObject({ deletedAccount: true, seatsAnonymised: 2, invitesRemoved: 1, certificatesRemoved: 1 });

    const left = {
      user: await prisma.user.count({ where: { id: userId } }),
      userByEmail: await prisma.user.count({ where: { email } }),
      enrolment: await prisma.enrolment.count({ where: { OR: [{ userId }, { id: { in: enrolmentIds } }] } }),
      moduleProgress: await prisma.moduleProgress.count({ where: { enrolmentId: { in: enrolmentIds } } }),
      sandboxAttempt: await prisma.sandboxAttempt.count({ where: { enrolmentId: { in: enrolmentIds } } }),
      playbookEntry: await prisma.playbookEntry.count({ where: { enrolmentId: { in: enrolmentIds } } }),
      certificate: await prisma.certificate.count({ where: { enrolmentId: { in: enrolmentIds } } }),
      entitlement: await prisma.entitlement.count({ where: { userId } }),
      orgMember: await prisma.orgMember.count({ where: { userId } }),
      session: await prisma.session.count({ where: { userId } }),
      account: await prisma.account.count({ where: { userId } }),
      passwordResetToken: await prisma.passwordResetToken.count({ where: { userId } }),
      userPreference: await prisma.userPreference.count({ where: { userId } }),
      modelCall: await prisma.modelCall.count({ where: { userId } }),
      verificationToken: await prisma.verificationToken.count({ where: { identifier: email } }),
      waitlistEntry: await prisma.waitlistEntry.count({ where: { email } }),
      seatByEmail: await prisma.seat.count({ where: { email } }),
      seatByUser: await prisma.seat.count({ where: { userId } }),
      seatOldLinks: await prisma.seat.count({ where: { inviteToken: { in: [`t1-${run}`, `t2-${run}`, `t3-${run}`] } } }),
    };
    expect(left).toEqual(Object.fromEntries(Object.keys(left).map((k) => [k, 0])));

    /* The claimed seats stay, anonymised, and still count as one used seat. */
    const kept = await prisma.seat.findMany({ where: { orgId, email: { endsWith: "@removed.invalid" } } });
    expect(kept).toHaveLength(2);
    expect(new Set(kept.map((s) => s.email)).size).toBe(1);
    for (const s of kept) expect(s).toMatchObject({ userId: null, team: null, trackHint: null, claimedAt: expect.any(Date) });
    expect(await seatsLeft(orgId)).toEqual(before);
  });

  it("leaves everyone else alone", async () => {
    expect(await prisma.user.count({ where: { id: bystanderId } })).toBe(1);
    expect(await prisma.entitlement.count({ where: { userId: bystanderId } })).toBe(3);
    expect(await prisma.modelCall.count({ where: { userId: bystanderId } })).toBe(1);
    expect(await prisma.seat.count({ where: { email: bystanderEmail } })).toBe(1);
  });
});
