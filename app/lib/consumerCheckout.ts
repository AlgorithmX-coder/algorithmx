import type Stripe from "stripe";
import { grantEntitlement } from "@/app/lib/entitlements";
import { consumerPriceIdFor, stripe } from "@/app/lib/stripe";

/* Card checkout for a consumer course: one payment, one entitlement.
 * The session's metadata carries who bought what; fulfilment funnels
 * through grantEntitlement, whose upsert makes it idempotent, so the
 * webhook and the success page can both call it safely for the same
 * session. */

export interface ConsumerCheckoutInput {
  slug: string;
  userId: string;
  email?: string | null;
  origin: string;
}

export async function createConsumerCheckout(
  input: ConsumerCheckoutInput,
): Promise<{ url: string } | { error: string }> {
  const price = consumerPriceIdFor(input.slug);
  if (!price) return { error: "Card checkout is not switched on for this course yet." };

  const email = input.email?.trim().toLowerCase();
  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    line_items: [{ price, quantity: 1 }],
    ...(email ? { customer_email: email } : {}),
    allow_promotion_codes: true,
    metadata: {
      product: "consumer-course",
      productSlug: input.slug,
      userId: input.userId,
    },
    success_url: `${input.origin}/purchase/${input.slug}?status=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${input.origin}/purchase/${input.slug}`,
  });
  if (!session.url) return { error: "Stripe did not return a checkout page. Try again in a moment." };
  return { url: session.url };
}

/* Called by the webhook on checkout.session.completed, and by the
 * success page when it beats the webhook. The entitlement is the only
 * side effect, so at-least-once delivery is harmless. */
export async function fulfilConsumerCheckoutSession(session: Stripe.Checkout.Session) {
  const m = session.metadata ?? {};
  if (m.product !== "consumer-course") return { skipped: "not a consumer course purchase" };
  if (session.payment_status !== "paid") return { skipped: `payment status ${session.payment_status}` };
  if (!m.userId || !m.productSlug) return { skipped: "session is missing the user or the product" };

  await grantEntitlement(m.userId, m.productSlug, "PURCHASE");
  return { granted: true, userId: m.userId, productSlug: m.productSlug };
}
