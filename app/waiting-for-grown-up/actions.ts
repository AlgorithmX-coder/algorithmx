"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { RESEND_AFTER_MS, WAITING_FOR_PARENT_PATH, awaitingParent, sendParentConsentEmail } from "@/app/lib/parentConsent";

/* "Send the email again", from the waiting page. Only for the signed-in
 * child's own account, only while it is waiting, and at most once every
 * couple of minutes so it cannot be used to flood a parent's inbox. */
export async function resendParentEmailAction(): Promise<void> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      needsParentConsent: true,
      parentConsentAt: true,
      parentConsentTokens: { orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true, courseSlug: true } },
    },
  });
  if (!awaitingParent(user)) redirect(WAITING_FOR_PARENT_PATH);

  const last = user?.parentConsentTokens[0];
  if (last && Date.now() - last.createdAt.getTime() < RESEND_AFTER_MS) redirect(`${WAITING_FOR_PARENT_PATH}?wait=1`);

  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "www.algorithmx.co.uk";
  await sendParentConsentEmail({ userId, courseSlug: last?.courseSlug ?? "cyberexplorers", origin: `${proto}://${host}` });
  redirect(`${WAITING_FOR_PARENT_PATH}?sent=1`);
}
