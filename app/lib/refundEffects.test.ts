import { beforeEach, describe, expect, it, vi } from "vitest";
import type Stripe from "stripe";

/* What a refund does, for each lane, and that a refund made in /admin and
 * the webhook Stripe then sends end in the same state: the second arrival
 * changes nothing and sends no second alert. Database, Stripe and email are
 * stubbed. */

const db = vi.hoisted(() => ({
  consumerPurchase: { findUnique: vi.fn(), updateMany: vi.fn(), count: vi.fn() },
  seatPurchase: { findUnique: vi.fn(), updateMany: vi.fn() },
  placePurchase: { findUnique: vi.fn(), updateMany: vi.fn() },
  organisation: { findUnique: vi.fn(), update: vi.fn() },
  entitlement: { deleteMany: vi.fn() },
  $transaction: vi.fn(),
}));
const m = vi.hoisted(() => ({ opsAlert: vi.fn(), seatsLeft: vi.fn(), placesUsed: vi.fn(), sessionsList: vi.fn() }));
vi.mock("@/app/lib/prisma", () => ({ prisma: db }));
vi.mock("@/app/lib/opsAlert", () => ({ opsAlert: m.opsAlert }));
vi.mock("@/app/lib/aiClearedAdmin", () => ({ seatsLeft: m.seatsLeft }));
vi.mock("@/app/lib/schoolPlaces", () => ({ placesUsed: m.placesUsed }));
vi.mock("@/app/lib/stripe", () => ({ stripe: () => ({ checkout: { sessions: { list: m.sessionsList } } }) }));

import { applyChargeRefund, applyConsumerRefund, applyPlaceRefund, applySeatRefund, totalsOf } from "./refundEffects";

function charge(amount: number, refunded: number, full = refunded >= amount): Stripe.Charge {
  return { id: "ch_1", payment_intent: "pi_1", amount, amount_refunded: refunded, refunded: full, currency: "gbp" } as unknown as Stripe.Charge;
}

const consumerRow = { id: "cp1", userId: "u1", slug: "cyber-heroes", amountPence: 9900, refundedPence: 0, refundedAt: null, buyerEmail: "a@b.test", user: { email: "a@b.test" } };
const seatRow = { id: "sp1", orgId: "o1", seats: 50, refundedPence: 0, refundedSeats: 0, org: { name: "Acme LLP", slug: "acme" } };
const placeRow = { id: "pp1", orgId: "o2", places: 50, refundedPence: 0, refundedPlaces: 0, org: { name: "Youth Club", slug: "yc" } };

beforeEach(() => {
  vi.clearAllMocks();
  db.$transaction.mockImplementation(async (fn: (tx: typeof db) => unknown) => fn(db));
  db.consumerPurchase.findUnique.mockResolvedValue({ ...consumerRow });
  db.consumerPurchase.updateMany.mockResolvedValue({ count: 1 });
  db.consumerPurchase.count.mockResolvedValue(0);
  db.entitlement.deleteMany.mockResolvedValue({ count: 1 });
  db.seatPurchase.updateMany.mockResolvedValue({ count: 1 });
  db.placePurchase.updateMany.mockResolvedValue({ count: 1 });
  db.organisation.findUnique.mockResolvedValue({ seatsPurchased: 100 });
  m.seatsLeft.mockResolvedValue({ licensed: 100, used: 20, left: 80 });
  m.placesUsed.mockResolvedValue(20);
});

describe("one person's course", () => {
  it("a full refund records it, removes that one course's PURCHASE access and alerts once", async () => {
    const r = await applyConsumerRefund("cp1", totalsOf(charge(9900, 9900)), "staff@x.test");
    expect(r).toEqual({ lane: "consumer", changed: true, full: true, revoked: true });
    expect(db.consumerPurchase.updateMany).toHaveBeenCalledWith({ where: { id: "cp1", refundedPence: 0 }, data: { refundedPence: 9900 } });
    expect(db.entitlement.deleteMany).toHaveBeenCalledWith({ where: { userId: "u1", source: "PURCHASE", product: { slug: "cyber-heroes" } } });
    expect(m.opsAlert).toHaveBeenCalledTimes(1);
    expect(m.opsAlert.mock.calls[0][0].what).toContain("access removed");
  });

  it("the same total arriving again (webhook after /admin) changes nothing and sends no alert", async () => {
    db.consumerPurchase.findUnique.mockResolvedValue({ ...consumerRow, refundedPence: 9900, refundedAt: new Date() });
    db.entitlement.deleteMany.mockResolvedValue({ count: 0 });
    const r = await applyConsumerRefund("cp1", totalsOf(charge(9900, 9900)), "Stripe");
    expect(r).toMatchObject({ changed: false, full: true });
    /* Only the "refundedAt still empty" guard runs; the total is not rewritten. */
    expect(db.consumerPurchase.updateMany).toHaveBeenCalledTimes(1);
    expect(m.opsAlert).not.toHaveBeenCalled();
  });

  it("a partial refund keeps the course", async () => {
    const r = await applyConsumerRefund("cp1", totalsOf(charge(9900, 2000)), "Stripe");
    expect(r).toEqual({ lane: "consumer", changed: true, full: false, revoked: false });
    expect(db.entitlement.deleteMany).not.toHaveBeenCalled();
    expect(m.opsAlert.mock.calls[0][0].what).toContain("access kept");
  });
});

describe("a firm's seats", () => {
  it("takes the refunded share of the seats off the licence", async () => {
    db.seatPurchase.findUnique.mockResolvedValue({ ...seatRow });
    const r = await applySeatRefund("sp1", totalsOf(charge(300000, 150000)), "staff@x.test");
    expect(r).toEqual({ lane: "seats", changed: true, removed: 25, clamped: false });
    expect(db.seatPurchase.updateMany.mock.calls[0][0]).toMatchObject({ where: { id: "sp1", refundedPence: 0 }, data: { refundedPence: 150000, refundedSeats: 25 } });
    expect(db.organisation.update).toHaveBeenCalledWith({ where: { id: "o1" }, data: { seatsPurchased: 75 } });
    expect(m.opsAlert).toHaveBeenCalledTimes(1);
  });

  it("never goes below the people holding a seat, and names the firm in an alert", async () => {
    db.seatPurchase.findUnique.mockResolvedValue({ ...seatRow });
    m.seatsLeft.mockResolvedValue({ licensed: 100, used: 90, left: 10 });
    const r = await applySeatRefund("sp1", totalsOf(charge(300000, 300000)), "Stripe");
    expect(r).toEqual({ lane: "seats", changed: true, removed: 10, clamped: true });
    expect(db.organisation.update).toHaveBeenCalledWith({ where: { id: "o1" }, data: { seatsPurchased: 90 } });
    expect(m.opsAlert).toHaveBeenCalledTimes(2);
    expect(m.opsAlert.mock.calls[1][0].what).toContain("Acme LLP");
  });

  it("a second refund on the same purchase only takes off the difference", async () => {
    db.seatPurchase.findUnique.mockResolvedValue({ ...seatRow, refundedPence: 150000, refundedSeats: 25 });
    db.organisation.findUnique.mockResolvedValue({ seatsPurchased: 75 });
    const r = await applySeatRefund("sp1", totalsOf(charge(300000, 300000)), "Stripe");
    expect(r).toMatchObject({ removed: 25 });
    expect(db.organisation.update).toHaveBeenCalledWith({ where: { id: "o1" }, data: { seatsPurchased: 50 } });
  });

  it("does nothing when the same total was recorded first by the other path", async () => {
    db.seatPurchase.findUnique.mockResolvedValue({ ...seatRow, refundedPence: 150000, refundedSeats: 25 });
    expect(await applySeatRefund("sp1", totalsOf(charge(300000, 150000)), "Stripe")).toEqual({ lane: "seats", changed: false, removed: 0, clamped: false });
    expect(db.organisation.update).not.toHaveBeenCalled();
    expect(m.opsAlert).not.toHaveBeenCalled();
  });

  it("loses a race cleanly: the conditional write fails and nothing else moves", async () => {
    db.seatPurchase.findUnique.mockResolvedValue({ ...seatRow });
    db.seatPurchase.updateMany.mockResolvedValue({ count: 0 });
    expect(await applySeatRefund("sp1", totalsOf(charge(300000, 150000)), "Stripe")).toMatchObject({ changed: false });
    expect(db.organisation.update).not.toHaveBeenCalled();
    expect(m.opsAlert).not.toHaveBeenCalled();
  });
});

describe("an organisation's places", () => {
  it("never goes below the places already spent", async () => {
    db.placePurchase.findUnique.mockResolvedValue({ ...placeRow });
    db.organisation.findUnique.mockResolvedValue({ seatsPurchased: 50 });
    m.placesUsed.mockResolvedValue(12);
    const r = await applyPlaceRefund("pp1", totalsOf(charge(300000, 300000)), "staff@x.test");
    expect(r).toEqual({ lane: "places", changed: true, removed: 38, clamped: true });
    expect(db.placePurchase.updateMany.mock.calls[0][0].data).toMatchObject({ refundedPlaces: 50 });
    expect(db.organisation.update).toHaveBeenCalledWith({ where: { id: "o2" }, data: { seatsPurchased: 12 } });
  });
});

describe("applyChargeRefund (the webhook)", () => {
  it("finds a consumer purchase by its payment", async () => {
    db.consumerPurchase.findUnique.mockImplementation(async ({ where }: { where: Record<string, string> }) => (where.paymentIntentId === "pi_1" ? { id: "cp1" } : { ...consumerRow }));
    const r = await applyChargeRefund(charge(9900, 9900));
    expect(r).toMatchObject({ lane: "consumer", full: true });
    expect(m.sessionsList).not.toHaveBeenCalled();
  });

  it("asks Stripe which checkout took the payment for the older lanes", async () => {
    db.consumerPurchase.findUnique.mockResolvedValue(null);
    m.sessionsList.mockResolvedValue({ data: [{ id: "cs_9" }] });
    db.seatPurchase.findUnique.mockResolvedValue(null);
    db.placePurchase.findUnique.mockImplementation(async ({ where }: { where: Record<string, string> }) => (where.stripeCheckoutSessionId === "cs_9" ? { id: "pp1" } : { ...placeRow }));
    const r = await applyChargeRefund(charge(300000, 60000));
    expect(m.sessionsList).toHaveBeenCalledWith({ payment_intent: "pi_1", limit: 1 });
    expect(r).toMatchObject({ lane: "places", removed: 10 });
  });

  it("skips a payment that matches nothing here", async () => {
    db.consumerPurchase.findUnique.mockResolvedValue(null);
    m.sessionsList.mockResolvedValue({ data: [] });
    expect(await applyChargeRefund(charge(100, 100))).toHaveProperty("skipped");
  });
});
