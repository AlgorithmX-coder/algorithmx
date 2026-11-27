import { beforeEach, describe, expect, it, vi } from "vitest";
import type Stripe from "stripe";

/* One person buying one course. The money logic: the session charges the
 * catalogue price, VAT included, for that one course and tags the account it
 * is for; the webhook grants exactly that course once, however many times
 * Stripe delivers, and only for a paid session. */

const db = vi.hoisted(() => ({
  product: { findUnique: vi.fn() },
  entitlement: { upsert: vi.fn() },
  enrolment: { findUnique: vi.fn(), findFirst: vi.fn(), createMany: vi.fn() },
  organisation: { upsert: vi.fn() },
  user: { findUnique: vi.fn() },
  consumerPurchase: { findUnique: vi.fn(), create: vi.fn() },
}));
vi.mock("@/app/lib/prisma", () => ({ prisma: db }));
vi.mock("@/app/lib/stripe", () => ({ stripe: vi.fn(), vatMode: () => "fixed", vatInclusiveTaxRateId: async () => "txr_incl" }));

import { consumerSessionParams, fulfilConsumerSession, inclusiveTax } from "./consumerCheckout";
import { consumerCourse } from "./consumerCatalogue";

const AT = new Date("2026-11-26T10:00:00.000Z");

function paid(over: Partial<Stripe.Checkout.Session> = {}, meta: Record<string, string> = {}): Stripe.Checkout.Session {
  return {
    id: "cs_1",
    payment_status: "paid",
    amount_total: 9900,
    currency: "gbp",
    payment_intent: "pi_1",
    customer_details: { email: "Buyer@Example.test" },
    metadata: { product: "consumer-course", slug: "cyber-heroes", userId: "u1", waiverConsentAt: AT.toISOString(), ...meta },
    ...over,
  } as unknown as Stripe.Checkout.Session;
}

describe("consumerSessionParams", () => {
  it("charges the catalogue price once, VAT included, for that one course", async () => {
    const course = consumerCourse("ai-cleared")!;
    const p = consumerSessionParams(course, { slug: "ai-cleared", userId: "u1", email: " Me@Example.test ", waiverConsentAt: AT, origin: "https://x.test" }, await inclusiveTax());
    expect(p.mode).toBe("payment");
    expect(p.line_items).toHaveLength(1);
    const li = p.line_items![0];
    expect(li.quantity).toBe(1);
    expect(li.price_data?.unit_amount).toBe(2900);
    expect(li.price_data?.currency).toBe("gbp");
    expect(li.tax_rates).toEqual(["txr_incl"]);
    expect(p.customer_email).toBe("me@example.test");
    expect(p.metadata).toEqual({ product: "consumer-course", slug: "ai-cleared", userId: "u1", waiverConsentAt: AT.toISOString(), paidBy: "self" });
    expect(p.payment_intent_data?.metadata).toEqual(p.metadata);
    expect(p.payment_intent_data?.receipt_email).toBe("me@example.test");
    expect(p.success_url).toBe("https://x.test/purchase/ai-cleared?status=success&session_id={CHECKOUT_SESSION_ID}");
    expect(p.cancel_url).toBe("https://x.test/purchase/ai-cleared");
    expect(p).not.toHaveProperty("discounts");
    expect(p).not.toHaveProperty("allow_promotion_codes");
  });

  it("marks the price inclusive when Stripe works the VAT out", () => {
    const course = consumerCourse("desk-ready")!;
    const p = consumerSessionParams(course, { slug: "desk-ready", userId: "u1", email: "a@b.test", waiverConsentAt: AT, origin: "https://x.test" }, { taxBehavior: "inclusive", automaticTax: true });
    expect(p.line_items![0].price_data?.unit_amount).toBe(2500);
    expect(p.line_items![0].price_data?.tax_behavior).toBe("inclusive");
    expect(p.automatic_tax).toEqual({ enabled: true });
  });
});

describe("fulfilConsumerSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    db.consumerPurchase.findUnique.mockResolvedValue(null);
    db.user.findUnique.mockResolvedValue({ id: "u1" });
    db.product.findUnique.mockImplementation(async ({ where }: { where: { slug: string } }) => ({ id: `p-${where.slug}` }));
    db.enrolment.findUnique.mockResolvedValue(null);
    db.enrolment.findFirst.mockResolvedValue(null);
    db.organisation.upsert.mockResolvedValue({ id: "org-house" });
    db.consumerPurchase.create.mockResolvedValue({});
  });

  it("grants that one course as a PURCHASE and records the payment and the consent time", async () => {
    const r = await fulfilConsumerSession(paid());
    expect(r).toEqual({ granted: true, slug: "cyber-heroes", userId: "u1" });
    expect(db.entitlement.upsert).toHaveBeenCalledTimes(1);
    expect(db.entitlement.upsert.mock.calls[0][0]).toMatchObject({
      where: { userId_productId: { userId: "u1", productId: "p-cyber-heroes" } },
      create: { source: "PURCHASE" },
      update: { source: "PURCHASE" },
    });
    expect(db.consumerPurchase.create.mock.calls[0][0].data).toMatchObject({
      userId: "u1",
      slug: "cyber-heroes",
      amountPence: 9900,
      stripeSessionId: "cs_1",
      paymentIntentId: "pi_1",
      buyerEmail: "buyer@example.test",
      waiverConsentAt: AT,
    });
    expect(db.enrolment.createMany).not.toHaveBeenCalled();
  });

  it("does nothing twice when Stripe delivers the same session again", async () => {
    db.consumerPurchase.findUnique.mockResolvedValue({ slug: "cyber-heroes" });
    expect(await fulfilConsumerSession(paid())).toEqual({ already: true, slug: "cyber-heroes" });
    expect(db.entitlement.upsert).not.toHaveBeenCalled();
    expect(db.consumerPurchase.create).not.toHaveBeenCalled();
  });

  it("treats a lost race on the session id as already done", async () => {
    db.consumerPurchase.create.mockRejectedValue(Object.assign(new Error("dupe"), { code: "P2002" }));
    expect(await fulfilConsumerSession(paid())).toEqual({ already: true, slug: "cyber-heroes" });
  });

  it("grants nothing for an unpaid session, another lane, or a course not on the list", async () => {
    expect(await fulfilConsumerSession(paid({ payment_status: "unpaid" }))).toHaveProperty("skipped");
    expect(await fulfilConsumerSession(paid({}, { product: "learner-places" }))).toHaveProperty("skipped");
    expect(await fulfilConsumerSession(paid({}, { slug: "cyber-secured" }))).toHaveProperty("skipped");
    expect(db.entitlement.upsert).not.toHaveBeenCalled();
  });

  it("gives an individual buyer of a workplace course their own enrolment", async () => {
    const r = await fulfilConsumerSession(paid({ amount_total: 2900 }, { slug: "ai-cleared" }));
    expect(r).toMatchObject({ granted: true, slug: "ai-cleared" });
    expect(db.enrolment.createMany).toHaveBeenCalledWith({
      data: [{ userId: "u1", productId: "p-ai-cleared", orgId: "org-house", track: "GENERAL" }],
      skipDuplicates: true,
    });
  });

  it("leaves a firm enrolment exactly as it is", async () => {
    db.enrolment.findUnique.mockResolvedValue({ id: "e-firm" });
    await fulfilConsumerSession(paid({}, { slug: "ai-fluent" }));
    expect(db.enrolment.createMany).not.toHaveBeenCalled();
    expect(db.organisation.upsert).not.toHaveBeenCalled();
  });
});
