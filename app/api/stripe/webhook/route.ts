import { NextRequest } from "next/server";
import type Stripe from "stripe";
import { fulfilCheckoutSession } from "@/app/lib/aiClearedCheckout";
import { fulfilConsumerCheckoutSession } from "@/app/lib/consumerCheckout";
import { stripe } from "@/app/lib/stripe";

/* POST /api/stripe/webhook: Stripe tells us a checkout completed. The
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
    try {
      const object = event.data.object as Stripe.Checkout.Session;
      // Dispatch on the metadata we stamped at session creation: the
      // corporate seat flow and the consumer course flow share this
      // webhook but fulfil very differently.
      const result =
        object.metadata?.product === "consumer-course"
          ? await fulfilConsumerCheckoutSession(object)
          : await fulfilCheckoutSession(object, `${proto}://${host}`);
      console.log("[stripe/webhook]", event.type, JSON.stringify(result));
    } catch (err) {
      console.error("[stripe/webhook] fulfilment failed", err instanceof Error ? err.message : err);
      return Response.json({ error: "Fulfilment failed; will retry." }, { status: 500 });
    }
  }
  return Response.json({ received: true });
}
