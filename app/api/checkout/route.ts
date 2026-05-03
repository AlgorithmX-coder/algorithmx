import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import {
  stripe,
  CYBER_HEROES_PRICE_GBP,
  CYBER_HEROES_PRODUCT_NAME,
  CYBER_HEROES_PRODUCT_DESC,
} from "@/app/lib/stripe";

/**
 * POST /api/checkout
 *
 * Creates a Stripe Checkout Session for the £99 one-time Cyber Heroes
 * Academy purchase and returns the hosted-checkout URL.  The client
 * does `window.location.href = url` to redirect.
 *
 * Auth required — userId is attached as `client_reference_id` so the
 * webhook can match the payment back to a User row.
 *
 * Idempotency: if the user already has stripeStatus = 'active', we
 * refuse to create another session (they'd be charged twice for
 * lifetime access).  The dashboard hides the Subscribe button in that
 * case anyway, but defence-in-depth.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      stripeCustomerId: true,
      stripeStatus: true,
    },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (user.stripeStatus === "active" || user.stripeStatus === "paid") {
    return NextResponse.json(
      { error: "Already enrolled" },
      { status: 409 },
    );
  }

  const origin =
    req.headers.get("origin") ??
    process.env.NEXTAUTH_URL ??
    "http://localhost:3000";

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "gbp",
            unit_amount: CYBER_HEROES_PRICE_GBP,
            product_data: {
              name: CYBER_HEROES_PRODUCT_NAME,
              description: CYBER_HEROES_PRODUCT_DESC,
            },
          },
        },
      ],
      // Pre-fill email so the parent doesn't have to retype it.
      customer_email: user.stripeCustomerId ? undefined : user.email,
      customer: user.stripeCustomerId ?? undefined,
      // Used by the webhook to match payment → user.
      client_reference_id: user.id,
      metadata: { userId: user.id, product: "cyber-heroes-academy" },
      success_url: `${origin}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard?payment=cancelled`,
      // 30 minutes — generous, matches Stripe default.
      expires_at: Math.floor(Date.now() / 1000) + 60 * 30,
    });

    if (!checkoutSession.url) {
      throw new Error("Stripe did not return a Checkout URL");
    }
    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("[api/checkout] failed", err);
    return NextResponse.json(
      { error: "Could not start checkout. Try again in a moment." },
      { status: 500 },
    );
  }
}
