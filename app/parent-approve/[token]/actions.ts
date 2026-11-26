"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { findConsentLink, isStaffEmail, recordParentConsent } from "@/app/lib/parentConsent";
import { consumerCourse } from "@/app/lib/consumerCatalogue";
import { createConsumerCheckout } from "@/app/lib/consumerCheckout";
import { hasEntitlement } from "@/app/lib/entitlements";
import { CONSUMER_CHECKOUT_OPEN } from "@/app/lib/launchSwitch";

/* The two things a parent can do from /parent-approve/[token]. The token is
 * the only key, so both re-check it before doing anything. */

function here(token: string): string {
  return `/parent-approve/${encodeURIComponent(token)}`;
}

export async function giveConsentAction(token: string, formData: FormData): Promise<void> {
  const link = await findConsentLink(token);
  if (!link) redirect(here(token));
  if (formData.get("consent") !== "on") redirect(`${here(token)}?error=consent`);
  await recordParentConsent(link);
  redirect(here(token));
}

/**
 * The parent pays for the child's course. The course goes on the CHILD's
 * account (userId), the receipt to the parent (email). Open to the public
 * once CONSUMER_CHECKOUT_OPEN is on; before that only when the parent's
 * address is a member of staff's, so the owner can test it on the sandbox.
 */
export async function parentCheckoutAction(token: string, formData: FormData): Promise<void> {
  const link = await findConsentLink(token);
  if (!link || !link.user.parentConsentAt || !link.user.parentEmail) redirect(here(token));
  const course = consumerCourse(link.courseSlug);
  if (!course) redirect(here(token));
  if (await hasEntitlement(link.user.id, course.slug)) redirect(here(token));
  if (!CONSUMER_CHECKOUT_OPEN && !(await isStaffEmail(link.user.parentEmail))) redirect(here(token));
  if (formData.get("waiver") !== "on") redirect(`${here(token)}?error=consent`);

  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "www.algorithmx.co.uk";

  let url: string | null = null;
  try {
    const result = await createConsumerCheckout({
      slug: course.slug,
      userId: link.user.id,
      email: link.user.parentEmail,
      waiverConsentAt: new Date(),
      origin: `${proto}://${host}`,
      successPath: `${here(token)}?status=paid`,
      cancelPath: here(token),
      paidBy: "parent",
    });
    if ("url" in result) url = result.url;
    else console.error("[parent-approve] checkout refused", course.slug, result.error);
  } catch (err) {
    console.error("[parent-approve] checkout failed", course.slug, err instanceof Error ? err.message : err);
  }
  if (!url) redirect(`${here(token)}?error=unavailable`);
  redirect(url);
}
