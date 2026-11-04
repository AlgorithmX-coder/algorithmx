import { prisma } from "@/app/lib/prisma";
import { opsAlert } from "@/app/lib/opsAlert";

/* Closing an org's access immediately, independent of trial/paid status
 * - shared by schools and firms since both are Organisation rows. See
 * the revokedAt field comment in schema.prisma for the school-pupil
 * caveat (this does not retroactively cut off pupils already added).
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
