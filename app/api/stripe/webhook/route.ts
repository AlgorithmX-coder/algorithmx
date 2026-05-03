import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/app/lib/stripe";
import { prisma } from "@/app/lib/prisma";

/**
 * POST /api/stripe/webhook
 *
 * Stripe → AlgorithmX webhook receiver.  Verifies the signature using
 * STRIPE_WEBHOOK_SECRET (per security.md best practice) and processes
 * a small set of event types.
 *
 * Local development:
 *   1. `stripe login`
 *   2. `stripe listen --forward-to localhost:3000/api/stripe/webhook`
 *   3. Copy the `whsec_…` printed by the CLI into STRIPE_WEBHOOK_SECRET
 *      in `.env.local`.
 *
 * Production:
 *   - Create a webhook endpoint in the Stripe Dashboard pointing to
 *     https://www.algorithmx.co.uk/api/stripe/webhook .
 *   - Subscribe to: checkout.session.completed,
 *     checkout.session.async_payment_succeeded,
 *     checkout.session.async_payment_failed.
 *   - Copy the signing secret into the prod env (Vercel → Environment
 *     Variables) as STRIPE_WEBHOOK_SECRET.
 *
 * Idempotency: handlers are written to be safe to re-run.  Stripe
 * retries failures, so any side-effect (DB write, email) must be a
 * no-op the second time.
 */

// We need the raw request body to verify the Stripe signature, so
// disable Next's automatic body parsing for this route.
export const runtime = "nodejs";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error(
      "[stripe/webhook] STRIPE_WEBHOOK_SECRET not set — refusing to process events",
    );
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 },
    );
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    console.error("[stripe/webhook] signature verification failed", err);
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        await markPaid(session);
        break;
      }
      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: { stripeStatus: "failed" },
          });
        }
        break;
      }
      default:
        // Not all subscribed events have side-effects yet.  Acknowledge
        // and move on so Stripe doesn't retry.
        break;
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[stripe/webhook] handler error", err);
    // Return 500 so Stripe retries.
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }
}

async function markPaid(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id;
  if (!userId) {
    console.error(
      "[stripe/webhook] checkout.session.completed missing client_reference_id",
      session.id,
    );
    return;
  }
  // payment_status is the source of truth — only mark active when it
  // genuinely settled.  For card payments this is 'paid' on completion.
  if (session.payment_status !== "paid") return;

  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeStatus: "active",
      stripePaidAt: new Date(),
      stripeCustomerId:
        typeof session.customer === "string" ? session.customer : undefined,
    },
  });
}
