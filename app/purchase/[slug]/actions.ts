"use server";

import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { grantEntitlement, hasEntitlement } from "@/app/lib/entitlements";

/**
 * Server action invoked by the PaymentButton.
 *
 * What it does TODAY (stub flow):
 *   - Verifies the session server-side (never trust the client about
 *     who is buying).
 *   - Confirms the slug resolves to an ACTIVE Product.
 *   - Refuses to charge for something the user already owns.
 *   - Skips payment processing entirely (the STRIPE SEAM below).
 *   - Calls grantEntitlement(...) with source=PURCHASE.
 *   - Redirects to /purchase/<slug>?status=success.
 *
 * What it does LATER (real flow): the STRIPE SEAM block creates a
 * Checkout Session and returns/redirects to its URL. The webhook
 * handler — not this action — then calls grantEntitlement on the
 * `checkout.session.completed` event. The success-state page stays
 * unchanged because the entitlement is already written by the time
 * the user lands back.
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
  // ▼ Replace this block when Stripe is reintroduced. ▼
  //
  //   Today:    we skip payment entirely and grant the entitlement
  //             inline. Test mode only.
  //
  //   Tomorrow: create a Stripe Checkout Session and redirect the
  //             user to session.url. Do NOT call grantEntitlement
  //             here — let the webhook fire it on
  //             `checkout.session.completed`. The webhook handler
  //             must call the SAME grantEntitlement(userId, slug,
  //             "PURCHASE") so the success page below works
  //             identically for stub + real payments.
  //
  //   Example (sketch only — do not uncomment until Stripe is back):
  //     const checkout = await stripe.checkout.sessions.create({
  //       mode: "payment",
  //       customer_email: session.user.email,
  //       line_items: [{ price: priceIdForSlug(slug), quantity: 1 }],
  //       metadata: { userId: session.user.id, productSlug: slug },
  //       success_url: `${origin}/purchase/${slug}?status=success`,
  //       cancel_url: `${origin}/purchase/${slug}`,
  //     });
  //     redirect(checkout.url!);
  //
  await grantEntitlement(session.user.id, product.slug, "PURCHASE");
  // ▲ End of STRIPE SEAM ▲
  // ───────────────────────────────────────────────────────────────────

  redirect(`/purchase/${product.slug}?status=success`);
}
