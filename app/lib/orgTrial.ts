import { prisma } from "@/app/lib/prisma";
import { opsAlert } from "@/app/lib/opsAlert";
export { trialStatus, type TrialStatus } from "@/app/lib/trialStatus";

/* A time-boxed "try before you buy" grant, shared by schools and firms:
 * both are Organisation rows, so one flag and one pair of functions cover
 * both admin tabs. trialExpiresAt says nothing about paid vs free - that
 * still comes from plan / seatsPurchased / stripeCustomerId as it always
 * has. Server-only (Prisma) - never import from a client component. The
 * client-safe trialStatus() re-exported above lives in ./trialStatus.ts;
 * import it from there directly in a client component. */

export async function grantTrial(orgId: string, days: 1 | 2, grantedBy: { name: string; email: string | null }): Promise<Date> {
  const trialExpiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  const org = await prisma.organisation.update({ where: { id: orgId }, data: { trialExpiresAt }, select: { name: true, slug: true } });
  await opsAlert({ what: "Trial granted", detail: { org: org.name, slug: org.slug, days, grantedBy: grantedBy.email ?? grantedBy.name } });
  return trialExpiresAt;
}

export async function clearTrial(orgId: string): Promise<void> {
  await prisma.organisation.update({ where: { id: orgId }, data: { trialExpiresAt: null } });
}
