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
 * Auth required - userId is attached as `client_reference_id` so the
 * webhook can match the payment back to a User row.
 *
 * Idempotency: if the user already has stripeStatus = 'active', we
 * refuse to create another session (they'd be charged twice for
 * lifetime access).  The dashboard hides the Subscribe button in that
 * case anyway, but defence-in-depth.
 */
export async function POST(req: Request) {
  /* Fail fast with a clear error if the Stripe secret is missing.
   * Without this the error surfaces as a generic 500 from the SDK
   * deep inside `stripe.checkout.sessions.create()` and the parent
   * is left with no recourse. */
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("[api/checkout] STRIPE_SECRET_KEY is not set");
    return NextResponse.json(
      {
        error:
          "Checkout is temporarily unavailable. Please contact support@algorithmx.co.uk.",
      },
      { status: 500 },
    );
  }

  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json(
      { error: "You need to be signed in to enrol. Please log in or create an account first." },
      { status: 401 },
    );
  }

  let user;
  try {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        stripeCustomerId: true,
        stripeStatus: true,
      },
    });
  } catch (err) {
    console.error("[api/checkout] DB lookup failed", err);
    return NextResponse.json(
      {
        error:
          "We couldn't reach the account database. Please try again in a moment.",
      },
      { status: 500 },
    );
  }
  if (!user) {
    return NextResponse.json({ error: "Account not found. Please log out and back in." }, { status: 404 });
  }
  if (user.stripeStatus === "active" || user.stripeStatus === "paid") {
    return NextResponse.json(
      { error: "You're already enrolled. Head to the dashboard to start your first lesson." },
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
      // Surface the support contact on the Stripe-hosted checkout
      // page so the parent has a clear path if anything goes wrong
      // mid-payment. Stripe also includes this on receipts.
      custom_text: {
        submit: {
          message:
            "Need help? Email support@algorithmx.co.uk and we will respond within one working day.",
        },
      },
      // 30 minutes. Generous, matches Stripe default.
      expires_at: Math.floor(Date.now() / 1000) + 60 * 30,
    });

    if (!checkoutSession.url) {
      throw new Error("Stripe did not return a Checkout URL");
    }
    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    /* Surface a meaningful error to the client. Stripe errors carry
     * useful info (auth failures, account-not-activated, invalid
     * configuration). We pass the message through in non-prod for
     * easier debugging; in prod we keep it concise and point users
     * at support. */
    console.error("[api/checkout] failed", err);
    const message = err instanceof Error ? err.message : String(err);
    const isAuthError =
      /invalid api key|no such|account.*not.*activated/i.test(message);
    const userMessage = isAuthError
      ? "Payments are temporarily unavailable. Please contact support@algorithmx.co.uk."
      : "We couldn't start the payment. Please try again or contact support@algorithmx.co.uk if it keeps failing.";
    return NextResponse.json(
      {
        error: userMessage,
        ...(process.env.NODE_ENV !== "production" ? { detail: message } : {}),
      },
      { status: 500 },
    );
  }
}
