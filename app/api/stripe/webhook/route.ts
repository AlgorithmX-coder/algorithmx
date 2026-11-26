import { NextRequest } from "next/server";
import type Stripe from "stripe";
import { fulfilCheckoutSession } from "@/app/lib/aiClearedCheckout";
import { fulfilPlacesSession } from "@/app/lib/learnerPlaces";
import { CONSUMER_PRODUCT, fulfilConsumerSession } from "@/app/lib/consumerCheckout";
import { stripe } from "@/app/lib/stripe";
import { opsAlert } from "@/app/lib/opsAlert";
import { applyChargeRefund } from "@/app/lib/refundEffects";

/* POST /api/stripe/webhook: Stripe tells us a checkout completed, a charge
 * was refunded, or a payment was disputed. The
 * signature is checked against STRIPE_WEBHOOK_SECRET on the raw body;
 * anything unsigned is refused. Fulfilment is idempotent, so a repeated
 * delivery creates nothing twice. Always answers 200 once verified so
 * Stripe stops retrying; failures are logged for the ops console's
 * Vercel logs. */

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers.get("stripe-signature");
  if (!secret || !sig) return Response.json({ error: "Webhook is not configured." }, { status: 503 });

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    console.error("[stripe/webhook] bad signature", err instanceof Error ? err.message : err);
    return Response.json({ error: "Bad signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const proto = req.headers.get("x-forwarded-proto") ?? "https";
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "www.algorithmx.co.uk";
    const session = event.data.object as Stripe.Checkout.Session;
    try {
      /* Which lane paid. A firm buys seats on a corporate course; an
         educational organisation buys pupil places; one person buys one
         course for themselves. All arrive on this one endpoint because
         Stripe sends every event to one place, so the metadata written at
         checkout is what tells them apart. */
      const lane = session.metadata?.product;
      const result =
        lane === CONSUMER_PRODUCT
          ? await fulfilConsumerSession(session)
          : lane === "learner-places"
            ? await fulfilPlacesSession(session, `${proto}://${host}`)
            : await fulfilCheckoutSession(session, `${proto}://${host}`);
      console.log("[stripe/webhook]", event.type, JSON.stringify(result));
      /* A paid session that set nothing up is a customer waiting for an
       * email that is not coming. */
      if ("skipped" in result && session.payment_status === "paid") {
        await opsAlert({ what: "A paid Stripe session was not fulfilled", detail: { reason: result.skipped, sessionId: session.id, email: session.customer_details?.email ?? session.customer_email ?? "", firm: session.metadata?.firmName ?? "", org: session.metadata?.orgName ?? "", course: session.metadata?.course ?? "", seats: session.metadata?.seats ?? "", places: session.metadata?.places ?? "", slug: session.metadata?.slug ?? "", userId: session.metadata?.userId ?? "" } });
      }
    } catch (err) {
      console.error("[stripe/webhook] fulfilment failed", err instanceof Error ? err.message : err);
      await opsAlert({ what: "Stripe fulfilment threw; Stripe will retry", detail: { eventType: event.type, sessionId: session.id, email: session.customer_details?.email ?? "", firm: session.metadata?.firmName ?? "" }, error: err });
      return Response.json({ error: "Fulfilment failed; will retry." }, { status: 500 });
    }
  }

  /* A refund, from /admin or from the Stripe dashboard: both end here, and
   * both end in the same state (app/lib/refundEffects.ts works from the
   * charge's running total, so a second arrival changes nothing). */
  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    try {
      const result = await applyChargeRefund(charge);
      console.log("[stripe/webhook]", event.type, JSON.stringify(result));
      if ("skipped" in result) {
        await opsAlert({ what: "A Stripe refund matched no purchase here", detail: { reason: result.skipped, chargeId: charge.id, paymentIntent: typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id ?? "", refundedPence: charge.amount_refunded, email: charge.billing_details?.email ?? charge.receipt_email ?? "" } });
      }
    } catch (err) {
      console.error("[stripe/webhook] refund failed", err instanceof Error ? err.message : err);
      await opsAlert({ what: "Applying a Stripe refund threw; Stripe will retry", detail: { chargeId: charge.id, refundedPence: charge.amount_refunded }, error: err });
      return Response.json({ error: "Refund not applied; will retry." }, { status: 500 });
    }
  }

  /* A chargeback. Nothing changes on its own: a person answers it in the
   * Stripe dashboard before the deadline, so they are told at once. */
  if (event.type === "charge.dispute.created") {
    const dispute = event.data.object as Stripe.Dispute;
    await opsAlert({
      what: "A payment has been disputed (chargeback)",
      detail: {
        disputeId: dispute.id,
        chargeId: typeof dispute.charge === "string" ? dispute.charge : dispute.charge?.id ?? "",
        amount: `${(dispute.amount / 100).toFixed(2)} ${dispute.currency.toUpperCase()}`,
        reason: dispute.reason,
        status: dispute.status,
        respondBy: dispute.evidence_details?.due_by ? new Date(dispute.evidence_details.due_by * 1000).toISOString() : "",
        fix: "Answer it in the Stripe dashboard (Payments, Disputes) before the deadline. Access is unchanged until then.",
      },
    });
  }

  return Response.json({ received: true });
}
