"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { grantEntitlement, hasEntitlement } from "@/app/lib/entitlements";
import { consumerCheckoutConfigured } from "@/app/lib/stripe";
import { createConsumerCheckout } from "@/app/lib/consumerCheckout";

/**
 * Server action invoked by the PaymentButton.
 *
 * Always:
 *   - Verifies the session server-side (never trust the client about
 *     who is buying).
 *   - Confirms the slug resolves to an ACTIVE Product.
 *   - Refuses to charge for something the user already owns.
 *
 * With a Stripe price configured for the slug (STRIPE_PRICE_<SLUG>):
 *   creates a Checkout Session and redirects the buyer to Stripe. The
 *   webhook handler — not this action — grants the entitlement on
 *   `checkout.session.completed` (the success page also verifies and
 *   fulfils when it beats the webhook; both are idempotent).
 *
 * Without one (test environments): skips payment entirely, grants the
 * entitlement inline and redirects to ?status=success.
 */
export async function startCheckoutAction(slug: string): Promise<void> {
  if (!slug || typeof slug !== "string") {
    throw new Error("startCheckoutAction: slug required");
  }

  const session = await auth();
  if (!session?.user?.id) {
    // Bounce through the login flow so we come back here after auth.
    redirect(`/login?callbackUrl=${encodeURIComponent(`/purchase/${slug}`)}`);
  }

  const product = await prisma.product.findUnique({
    where: { slug },
    select: { id: true, slug: true, status: true },
  });
  if (!product) redirect("/hub");

  // COMING_SOON tracks are listed for waitlist sign-ups only; rejecting
  // here means even a hand-crafted POST can't smuggle one through.
  if (product.status !== "ACTIVE") redirect("/hub");

  // Idempotency belt-and-braces: if they already own it (eg double-
  // submit), skip the grant and head straight to the success view.
  if (await hasEntitlement(session.user.id, product.slug)) {
    redirect(`/purchase/${product.slug}?status=success`);
  }

  // ─────────────────────────── STRIPE SEAM ───────────────────────────
  // With a price configured for this slug (STRIPE_PRICE_<SLUG>), the
  // real flow: create a Checkout Session and send the buyer to Stripe.
  // The entitlement is granted by the webhook on
  // `checkout.session.completed` (and by the success page's verify when
  // it beats the webhook) — never here. Without a price, the stub flow
  // remains: grant inline, test environments only.
  if (consumerCheckoutConfigured(product.slug)) {
    const h = await headers();
    const proto = h.get("x-forwarded-proto") ?? "https";
    const host = h.get("x-forwarded-host") ?? h.get("host") ?? "www.algorithmx.io";
    const checkout = await createConsumerCheckout({
      slug: product.slug,
      userId: session.user.id,
      email: session.user.email,
      origin: `${proto}://${host}`,
    });
    if ("error" in checkout) throw new Error(checkout.error);
    redirect(checkout.url);
  }

  await grantEntitlement(session.user.id, product.slug, "PURCHASE");
  // ▲ End of STRIPE SEAM ▲
  // ───────────────────────────────────────────────────────────────────

  redirect(`/purchase/${product.slug}?status=success`);
}
