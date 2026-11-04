import Stripe from "stripe";
import { stripe } from "@/app/lib/stripe";

/* Refunding a real corporate purchase. SeatPurchase only stores the
 * Checkout Session id (set by the webhook); the amount paid and the
 * payment intent behind it are looked up live from Stripe rather than
 * duplicated into our own schema - Stripe stays the one source of
 * truth for money. Server-only - never import from a client component. */

export interface PurchaseAmount {
  amountPence: number;
  currency: string;
  refundedPence: number;
}

export async function getPurchaseAmount(stripeCheckoutSessionId: string): Promise<PurchaseAmount | null> {
  const s = stripe();
  const session = await s.checkout.sessions.retrieve(stripeCheckoutSessionId, { expand: ["payment_intent.latest_charge"] });
  const pi = session.payment_intent;
  if (!pi || typeof pi === "string") return { amountPence: session.amount_total ?? 0, currency: session.currency ?? "gbp", refundedPence: 0 };
  const charge = (pi as Stripe.PaymentIntent).latest_charge;
  const refundedPence = charge && typeof charge !== "string" ? (charge as Stripe.Charge).amount_refunded : 0;
  return { amountPence: session.amount_total ?? 0, currency: session.currency ?? "gbp", refundedPence };
}

export async function refundPurchase(args: { stripeCheckoutSessionId: string; amountPence: number }): Promise<{ ok: true; refundId: string } | { ok: false; error: string }> {
  const s = stripe();
  try {
    const session = await s.checkout.sessions.retrieve(args.stripeCheckoutSessionId);
    const paymentIntent = session.payment_intent;
    if (!paymentIntent || typeof paymentIntent !== "string") return { ok: false, error: "No payment found for that purchase." };
    const refund = await s.refunds.create({ payment_intent: paymentIntent, amount: args.amountPence });
    return { ok: true, refundId: refund.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "The refund did not go through." };
  }
}
