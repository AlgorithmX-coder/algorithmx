import { prisma } from "@/app/lib/prisma";
import { opsAlert } from "@/app/lib/opsAlert";

/* Closing an org's access immediately, independent of trial/paid status
 * - shared by schools and firms since both are Organisation rows. It
 * reaches the learners as well as the adults: a child at a closed school
 * cannot find their class to sign in, and accessClosedFor in
 * app/lib/entitlements.ts stops every BUNDLE entitlement the org granted.
 * Nothing is deleted, so unrevokeOrg restores all of it untouched.
 * Server-only (Prisma) - never import from a client component. "Is it
 * revoked" is a plain truthiness check on the field (no date math, so
 * no shared pure helper needed the way trialStatus() has one). */

export async function revokeOrg(orgId: string, by: { name: string; email: string | null }): Promise<void> {
  const org = await prisma.organisation.update({ where: { id: orgId }, data: { revokedAt: new Date() }, select: { name: true, slug: true } });
  await opsAlert({ what: "Organisation access revoked", detail: { org: org.name, slug: org.slug, by: by.email ?? by.name } });
}

export async function unrevokeOrg(orgId: string): Promise<void> {
  await prisma.organisation.update({ where: { id: orgId }, data: { revokedAt: null } });
}
