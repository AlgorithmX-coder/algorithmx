"use server";

import { CATALOGUE } from "@/app/lib/courseIntent";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { hasEntitlement } from "@/app/lib/entitlements";
import { FIRM_BUY_PATH, isFirmProduct } from "@/app/lib/cyberSecured";

/**
 * The checkout seam for a consumer course.
 *
 * It NEVER grants anything. Until 2026-11-25 this action skipped payment
 * and wrote a PURCHASE entitlement inline, which meant any signed-in
 * account could open /purchase/<slug> and take any course for free. The
 * owner's rule: one person pays for one course, and at launch nothing is
 * free. So the grant is gone and buying shows "opens soon" instead.
 *
 * When the real checkout lands, this is where a Stripe Checkout Session is
 * created and the buyer is redirected to it. The entitlement is then
 * written by the Stripe webhook on `checkout.session.completed`, through
 * grantEntitlement(userId, slug, "PURCHASE"), and never by this action.
 *
 * Today, after the same checks the real flow will need, it sends the buyer
 * back to the purchase page: to the success view if they already own the
 * course, otherwise to the "Buying opens soon" state. A hand-crafted call
 * therefore cannot mint access.
 */
export async function startCheckoutAction(slug: string): Promise<void> {
  if (!slug || typeof slug !== "string") {
    throw new Error("startCheckoutAction: slug required");
  }

  // Firm courses are licensed per seat by a firm, never bought here.
  if (isFirmProduct(slug)) redirect(FIRM_BUY_PATH);

  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/purchase/${slug}`)}`);
  }

  const product = await prisma.product.findUnique({
    where: { slug },
    select: { id: true, slug: true, status: true },
  });
  if (!product) redirect(CATALOGUE);
  if (product.status !== "ACTIVE") redirect(CATALOGUE);

  if (await hasEntitlement(session.user.id, product.slug)) {
    redirect(`/purchase/${product.slug}?status=success`);
  }

  // STRIPE SEAM: create the Checkout Session here and redirect to it.
  // Until then there is nothing to buy with, so no access is granted.
  redirect(`/purchase/${product.slug}`);
}
