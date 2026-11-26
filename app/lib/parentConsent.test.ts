import { beforeEach, describe, expect, it, vi } from "vitest";

/* The parent's consent link: only a hash is stored, a link runs out after
 * seven days, a fresh one ends the old ones, and consent is recorded once.
 * Database and email are stubbed. */

const db = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), updateMany: vi.fn(), count: vi.fn() },
  parentConsentToken: { updateMany: vi.fn(), create: vi.fn(), findUnique: vi.fn() },
  $transaction: vi.fn(),
}));
const m = vi.hoisted(() => ({ sendEmail: vi.fn(), opsAlert: vi.fn() }));
vi.mock("@/app/lib/prisma", () => ({ prisma: db }));
vi.mock("@/app/lib/resend", () => ({ sendEmail: m.sendEmail }));
vi.mock("@/app/lib/opsAlert", () => ({ opsAlert: m.opsAlert }));
vi.mock("@/app/lib/aiClearedStaff", () => ({ staffEmails: () => new Set(["owner@example.invalid"]) }));

import { awaitingParent, findConsentLink, hashToken, isStaffEmail, recordParentConsent, sendParentConsentEmail } from "./parentConsent";
import { consumerSessionParams } from "./consumerCheckout";
import { consumerCourse } from "./consumerCatalogue";

vi.mock("@/app/lib/stripe", () => ({ stripe: vi.fn(), vatMode: () => "none", vatInclusiveTaxRateId: vi.fn() }));

beforeEach(() => {
  vi.clearAllMocks();
  db.$transaction.mockImplementation(async (ops: unknown[]) => ops);
  db.user.findUnique.mockResolvedValue({ name: "Sam Child", parentEmail: "parent@example.invalid" });
  m.sendEmail.mockResolvedValue({ id: "e1" });
});

describe("awaitingParent", () => {
  it("is true only for an under-13 account without consent yet", () => {
    expect(awaitingParent({ needsParentConsent: true, parentConsentAt: null })).toBe(true);
    expect(awaitingParent({ needsParentConsent: true, parentConsentAt: new Date() })).toBe(false);
    expect(awaitingParent({ needsParentConsent: false, parentConsentAt: null })).toBe(false);
    expect(awaitingParent(null)).toBe(false);
  });
});

describe("sendParentConsentEmail", () => {
  it("stores only a hash, ends older links, and emails the link to the parent", async () => {
    const r = await sendParentConsentEmail({ userId: "kid1", courseSlug: "cyberexplorers", origin: "https://x.test" });
    expect(r).toEqual({ sent: true });
    const created = db.parentConsentToken.create.mock.calls[0][0].data;
    expect(created.tokenHash).toMatch(/^[0-9a-f]{64}$/);
    expect(created.courseSlug).toBe("cyberexplorers");
    const days = (created.expiresAt.getTime() - Date.now()) / 86400000;
    expect(days).toBeGreaterThan(6.99);
    expect(days).toBeLessThanOrEqual(7);
    expect(db.parentConsentToken.updateMany).toHaveBeenCalled();

    const mail = m.sendEmail.mock.calls[0][0];
    expect(mail.to).toBe("parent@example.invalid");
    expect(mail.subject).toBe("Sam would like to join Cyber Explorers");
    const raw = /parent-approve\/([A-Za-z0-9_-]+)/.exec(mail.text)?.[1] ?? "";
    expect(raw.length).toBeGreaterThan(30);
    expect(hashToken(raw)).toBe(created.tokenHash);
    expect(mail.text).not.toContain(created.tokenHash);
  });

  it("tells ops when the email does not send", async () => {
    m.sendEmail.mockRejectedValue(new Error("down"));
    expect(await sendParentConsentEmail({ userId: "kid1", courseSlug: "cyberstart", origin: "https://x.test" })).toEqual({ sent: false });
    expect(m.opsAlert).toHaveBeenCalledTimes(1);
  });
});

describe("findConsentLink", () => {
  it("looks a link up by its hash and refuses an expired one", async () => {
    const raw = "a".repeat(43);
    db.parentConsentToken.findUnique.mockResolvedValue({ id: "t1", expiresAt: new Date(Date.now() + 1000), user: {} });
    expect(await findConsentLink(raw)).toMatchObject({ id: "t1" });
    expect(db.parentConsentToken.findUnique.mock.calls[0][0].where).toEqual({ tokenHash: hashToken(raw) });

    db.parentConsentToken.findUnique.mockResolvedValue({ id: "t1", expiresAt: new Date(Date.now() - 1000), user: {} });
    expect(await findConsentLink(raw)).toBeNull();
    expect(await findConsentLink("short")).toBeNull();
  });
});

describe("recordParentConsent", () => {
  it("keeps the first consent time", async () => {
    await recordParentConsent({ id: "t1", user: { id: "kid1" } } as Parameters<typeof recordParentConsent>[0]);
    expect(db.user.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "kid1", parentConsentAt: null } }));
    expect(db.parentConsentToken.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "t1", usedAt: null } }));
  });
});

describe("isStaffEmail", () => {
  it("is true for a listed staff address or a staff account", async () => {
    expect(await isStaffEmail("Owner@Example.invalid")).toBe(true);
    db.user.count.mockResolvedValue(0);
    expect(await isStaffEmail("parent@example.invalid")).toBe(false);
    expect(await isStaffEmail(null)).toBe(false);
  });
});

describe("a parent paying for a child", () => {
  it("puts the course on the child's account and the receipt in the parent's inbox", () => {
    const course = consumerCourse("cyberexplorers")!;
    const p = consumerSessionParams(
      course,
      { slug: course.slug, userId: "kid1", email: "parent@example.invalid", waiverConsentAt: new Date(), origin: "https://x.test", successPath: "/parent-approve/tok?status=paid", cancelPath: "/parent-approve/tok", paidBy: "parent" },
      { automaticTax: false },
    );
    expect(p.metadata).toMatchObject({ product: "consumer-course", slug: "cyberexplorers", userId: "kid1", paidBy: "parent" });
    expect(p.customer_email).toBe("parent@example.invalid");
    expect(p.payment_intent_data?.receipt_email).toBe("parent@example.invalid");
    expect(p.line_items![0].price_data?.unit_amount).toBe(9900);
    expect(p.success_url).toBe("https://x.test/parent-approve/tok?status=paid&session_id={CHECKOUT_SESSION_ID}");
  });
});
