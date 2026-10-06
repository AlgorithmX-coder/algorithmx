import { NextRequest } from "next/server";
import type Stripe from "stripe";
import { fulfilCheckoutSession } from "@/app/lib/aiClearedCheckout";
import { stripe } from "@/app/lib/stripe";
import { opsAlert } from "@/app/lib/opsAlert";

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
    const session = event.data.object as Stripe.Checkout.Session;
    try {
      const result = await fulfilCheckoutSession(session, `${proto}://${host}`);
      console.log("[stripe/webhook]", event.type, JSON.stringify(result));
      /* A paid session that set nothing up is a customer waiting for an
       * email that is not coming. */
      if ("skipped" in result && session.payment_status === "paid") {
        await opsAlert({ what: "A paid Stripe session was not fulfilled", detail: { reason: result.skipped, sessionId: session.id, email: session.customer_details?.email ?? session.customer_email ?? "", firm: session.metadata?.firmName ?? "", course: session.metadata?.course ?? "", seats: session.metadata?.seats ?? "" } });
      }
    } catch (err) {
      console.error("[stripe/webhook] fulfilment failed", err instanceof Error ? err.message : err);
      await opsAlert({ what: "Stripe fulfilment threw; Stripe will retry", detail: { eventType: event.type, sessionId: session.id, email: session.customer_details?.email ?? "", firm: session.metadata?.firmName ?? "" }, error: err });
      return Response.json({ error: "Fulfilment failed; will retry." }, { status: 500 });
    }
  }
  return Response.json({ received: true });
}
