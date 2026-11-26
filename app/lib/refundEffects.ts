/**
 * What a refund DOES, for all three ways of paying us.
 *
 *   - One person's course (ConsumerPurchase): once the whole payment is
 *     back, that one course's PURCHASE access is removed.
 *   - A firm's seats (SeatPurchase): the firm's licence comes down by the
 *     share of the seats the refund paid back.
 *   - An organisation's places (PlacePurchase): the same, for places.
 *
 * A licence never goes below what is already in use: people holding a
 * seat, or places already spent on a child. When it would, it stops there
 * and staff get an ops alert naming the organisation, because somebody has
 * to decide what happens to those people.
 *
 * ONE STATE, HOWEVER THE REFUND HAPPENED. A refund made in /admin and one
 * made in the Stripe dashboard both produce a charge.refunded event, and
 * the admin route also applies its refund at once so staff see it. Every
 * function here works from Stripe's running total on the charge
 * (amount_refunded) and from what was last recorded, never from "this
 * refund", and the write is conditional on the recorded total not having
 * moved. So the second arrival changes nothing, and the order does not
 * matter. Every change sends one ops alert, to support@.
 *
 * Server only.
 */
import type Stripe from "stripe";
import { prisma } from "@/app/lib/prisma";
import { stripe } from "@/app/lib/stripe";
import { opsAlert } from "@/app/lib/opsAlert";
import { seatsLeft } from "@/app/lib/aiClearedAdmin";
import { placesUsed } from "@/app/lib/schoolPlaces";
import { consumerCourse } from "@/app/lib/consumerCatalogue";
import { consumerFullyRefunded, lowerCount, refundedUnits } from "@/app/lib/refundMath";

/** The totals that matter, read off a Stripe charge. */
export interface ChargeTotals {
  chargeId: string;
  paymentIntentId: string | null;
  /** What the charge took, VAT included. */
  paidPence: number;
  /** Everything refunded on it so far, all refunds together. */
  refundedPence: number;
  /** Stripe's own flag for "refunded in full". */
  fully: boolean;
  currency: string;
}

export function totalsOf(charge: Pick<Stripe.Charge, "id" | "payment_intent" | "amount" | "amount_refunded" | "refunded" | "currency">): ChargeTotals {
  const pi = charge.payment_intent;
  return {
    chargeId: charge.id,
    paymentIntentId: typeof pi === "string" ? pi : pi?.id ?? null,
    paidPence: charge.amount,
    refundedPence: charge.amount_refunded,
    fully: Boolean(charge.refunded),
    currency: charge.currency,
  };
}

export type RefundOutcome =
  | { skipped: string }
  | { lane: "consumer"; changed: boolean; full: boolean; revoked: boolean }
  | { lane: "seats" | "places"; changed: boolean; removed: number; clamped: boolean };

function pounds(pence: number, currency = "gbp"): string {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: currency.toUpperCase() }).format(pence / 100);
}

/* ─────────────────────────── one person's course ─────────────────────────── */

export async function applyConsumerRefund(id: string, t: ChargeTotals, by: string): Promise<RefundOutcome> {
  const row = await prisma.consumerPurchase.findUnique({
    where: { id },
    select: { id: true, userId: true, slug: true, amountPence: true, refundedPence: true, refundedAt: true, buyerEmail: true, user: { select: { email: true } } },
  });
  if (!row) return { skipped: "that course purchase does not exist" };

  let changed = false;
  if (t.refundedPence > row.refundedPence) {
    const n = await prisma.consumerPurchase.updateMany({ where: { id, refundedPence: row.refundedPence }, data: { refundedPence: t.refundedPence } });
    changed = n.count > 0;
  }
  const refunded = Math.max(t.refundedPence, row.refundedPence);
  const full = consumerFullyRefunded({ paidPence: row.amountPence, refundedPence: refunded, fully: t.fully });

  /* Removing access is repeated on every delivery rather than only on the
     first, so a delivery that recorded the total and then failed is put
     right by Stripe's retry. Only PURCHASE access goes: a course staff
     have since granted by hand (MANUAL) is theirs to keep. */
  let revoked = false;
  if (full) {
    await prisma.consumerPurchase.updateMany({ where: { id, refundedAt: null }, data: { refundedAt: new Date() } });
    const otherPaid = await prisma.consumerPurchase.count({ where: { userId: row.userId, slug: row.slug, refundedAt: null, id: { not: id } } });
    if (otherPaid === 0) {
      const r = await prisma.entitlement.deleteMany({ where: { userId: row.userId, source: "PURCHASE", product: { slug: row.slug } } });
      revoked = r.count > 0;
    }
  }

  if (changed) {
    const course = consumerCourse(row.slug)?.name ?? row.slug;
    await opsAlert({
      what: full ? `Refund: ${course} refunded in full, access removed` : `Refund: part of a ${course} purchase refunded, access kept`,
      detail: {
        course,
        account: row.user.email,
        paidBy: row.buyerEmail,
        paid: pounds(row.amountPence, t.currency),
        refundedSoFar: pounds(refunded, t.currency),
        accessRemoved: revoked ? "yes" : full ? "nothing left to remove" : "no, partial refund",
        by,
        purchaseId: row.id,
        chargeId: t.chargeId,
      },
    });
  }
  return { lane: "consumer", changed, full, revoked };
}

/* ─────────────────────── a firm's seats, an organisation's places ─────────────────────── */

type LicenceLane = "seats" | "places";

async function applyLicenceRefund(lane: LicenceLane, id: string, t: ChargeTotals, by: string): Promise<RefundOutcome> {
  const row =
    lane === "seats"
      ? await prisma.seatPurchase.findUnique({ where: { id }, select: { id: true, orgId: true, seats: true, refundedPence: true, refundedSeats: true, org: { select: { name: true, slug: true } } } })
      : await prisma.placePurchase.findUnique({ where: { id }, select: { id: true, orgId: true, places: true, refundedPence: true, refundedPlaces: true, org: { select: { name: true, slug: true } } } });
  if (!row) return { skipped: `that ${lane === "seats" ? "seat" : "place"} purchase does not exist` };
  if (t.refundedPence <= row.refundedPence) return { lane, changed: false, removed: 0, clamped: false };

  const bought = "seats" in row ? row.seats : row.places;
  const already = "refundedSeats" in row ? row.refundedSeats : row.refundedPlaces;
  const target = Math.max(already, refundedUnits({ units: bought, paidPence: t.paidPence, refundedPence: t.refundedPence, fully: t.fully }));
  const inUse = lane === "seats" ? (await seatsLeft(row.orgId)).used : await placesUsed(row.orgId);

  const result = await prisma.$transaction(async (tx) => {
    const data = { refundedPence: t.refundedPence, refundedAt: new Date() };
    const n =
      lane === "seats"
        ? await tx.seatPurchase.updateMany({ where: { id, refundedPence: row.refundedPence }, data: { ...data, refundedSeats: target } })
        : await tx.placePurchase.updateMany({ where: { id, refundedPence: row.refundedPence }, data: { ...data, refundedPlaces: target } });
    /* Somebody else recorded this total first: they made the change. */
    if (n.count === 0) return null;
    const org = await tx.organisation.findUnique({ where: { id: row.orgId }, select: { seatsPurchased: true } });
    const current = org?.seatsPurchased ?? 0;
    const lowered = lowerCount({ current, remove: target - already, inUse });
    if (lowered.removed > 0) await tx.organisation.update({ where: { id: row.orgId }, data: { seatsPurchased: lowered.next } });
    return { ...lowered, current };
  });
  if (!result) return { lane, changed: false, removed: 0, clamped: false };

  const noun = lane === "seats" ? "seat" : "place";
  const used = lane === "seats" ? "people already hold a seat" : "places already spent on learners";
  await opsAlert({
    what: `Refund: ${row.org.name}, ${result.removed} ${noun}${result.removed === 1 ? "" : "s"} taken off`,
    detail: {
      org: row.org.name,
      slug: row.org.slug,
      bought: `${bought} ${noun}s`,
      refundedSoFar: pounds(t.refundedPence, t.currency),
      paid: pounds(t.paidPence, t.currency),
      licence: `${result.current} -> ${result.next}`,
      by,
      purchaseId: row.id,
      chargeId: t.chargeId,
    },
  });
  if (result.clamped) {
    await opsAlert({
      what: `Refund: ${row.org.name} keeps more ${noun}s than it paid for`,
      detail: {
        org: row.org.name,
        slug: row.org.slug,
        shouldHaveComeOff: target - already,
        cameOff: result.removed,
        inUse,
        licenceNow: result.next,
        why: `The licence cannot go below ${inUse}: ${used}.`,
        fix: `Decide with ${row.org.name} who comes off, then lower the count from their page in /admin.`,
      },
    });
  }
  return { lane, changed: true, removed: result.removed, clamped: result.clamped };
}

export function applySeatRefund(id: string, t: ChargeTotals, by: string): Promise<RefundOutcome> {
  return applyLicenceRefund("seats", id, t, by);
}

export function applyPlaceRefund(id: string, t: ChargeTotals, by: string): Promise<RefundOutcome> {
  return applyLicenceRefund("places", id, t, by);
}

/* ─────────────────────────── from the webhook ─────────────────────────── */

/**
 * A charge.refunded event: find which purchase it was and apply it. A
 * consumer purchase is found by its payment intent; the older lanes store
 * only the Checkout Session, so Stripe is asked which session took this
 * payment.
 */
export async function applyChargeRefund(charge: Stripe.Charge, by = "Stripe (dashboard or webhook)"): Promise<RefundOutcome> {
  const t = totalsOf(charge);
  if (!t.paymentIntentId) return { skipped: "the refunded charge has no payment intent" };

  const consumer = await prisma.consumerPurchase.findUnique({ where: { paymentIntentId: t.paymentIntentId }, select: { id: true } });
  if (consumer) return applyConsumerRefund(consumer.id, t, by);

  const sessions = await stripe().checkout.sessions.list({ payment_intent: t.paymentIntentId, limit: 1 });
  const sessionId = sessions.data[0]?.id;
  if (!sessionId) return { skipped: "no checkout session took this payment" };

  const [c, s, p] = await Promise.all([
    prisma.consumerPurchase.findUnique({ where: { stripeSessionId: sessionId }, select: { id: true } }),
    prisma.seatPurchase.findUnique({ where: { stripeCheckoutSessionId: sessionId }, select: { id: true } }),
    prisma.placePurchase.findUnique({ where: { stripeCheckoutSessionId: sessionId }, select: { id: true } }),
  ]);
  if (c) return applyConsumerRefund(c.id, t, by);
  if (s) return applySeatRefund(s.id, t, by);
  if (p) return applyPlaceRefund(p.id, t, by);
  return { skipped: `no purchase recorded for checkout session ${sessionId}` };
}
