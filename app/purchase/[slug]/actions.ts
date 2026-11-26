"use server";

import { CATALOGUE } from "@/app/lib/courseIntent";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { hasEntitlement } from "@/app/lib/entitlements";
import { FIRM_BUY_PATH, isFirmProduct } from "@/app/lib/cyberSecured";
import { consumerCourse, purchasePath } from "@/app/lib/consumerCatalogue";
import { createConsumerCheckout } from "@/app/lib/consumerCheckout";
import { CONSUMER_CHECKOUT_OPEN } from "@/app/lib/launchSwitch";
import { isStaffUser } from "@/app/lib/aiClearedStaff";

/**
 * The buy button for one consumer course.
 *
 * It NEVER grants anything. It checks the buyer, the course and the
 * cancellation tick, then creates a Stripe Checkout Session and sends the
 * buyer to it. The entitlement is written by the Stripe webhook once the
 * payment clears (fulfilConsumerSession in app/lib/consumerCheckout.ts).
 *
 * While CONSUMER_CHECKOUT_OPEN (app/lib/launchSwitch.ts) is false only
 * staff reach Stripe; anyone else is sent back to the buy page, which tells
 * them buying opens soon. A hand-crafted call therefore cannot mint access
 * or open a checkout early.
 */
export async function startCheckoutAction(slug: string, formData?: FormData): Promise<void> {
  if (!slug || typeof slug !== "string") {
    throw new Error("startCheckoutAction: slug required");
  }

  const course = consumerCourse(slug);
  if (!course) {
    /* The firm licence itself is sold to firms on /corporate. */
    if (isFirmProduct(slug)) redirect(FIRM_BUY_PATH);
    redirect(CATALOGUE);
  }
  const here = purchasePath(course.slug);

  const session = await auth();
  if (!session?.user?.id) {
    redirect(`${course.signUp}?callbackUrl=${encodeURIComponent(here)}`);
  }
  const userId = session.user.id;

  const product = await prisma.product.findUnique({ where: { slug: course.slug }, select: { id: true } });
  if (!product) redirect(CATALOGUE);

  if (await hasEntitlement(userId, course.slug)) {
    redirect(`${here}?status=success`);
  }

  if (!CONSUMER_CHECKOUT_OPEN && !(await isStaffUser(userId))) redirect(here);

  /* The Consumer Contracts Regulations: digital content may start inside
     the 14-day cancellation period only with the buyer's express consent
     and their acknowledgement that they lose the right to cancel. */
  if (formData?.get("waiver") !== "on") redirect(`${here}?error=consent`);

  const email = session.user.email ?? (await prisma.user.findUnique({ where: { id: userId }, select: { email: true } }))?.email ?? "";
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "www.algorithmx.co.uk";

  let url: string | null = null;
  try {
    const result = await createConsumerCheckout({ slug: course.slug, userId, email, waiverConsentAt: new Date(), origin: `${proto}://${host}` });
    if ("url" in result) url = result.url;
    else console.error("[purchase] checkout refused", course.slug, result.error);
  } catch (err) {
    console.error("[purchase] checkout failed", course.slug, err instanceof Error ? err.message : err);
  }
  if (!url) redirect(`${here}?error=unavailable`);
  redirect(url);
}
