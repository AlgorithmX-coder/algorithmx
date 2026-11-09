import { prisma } from "@/app/lib/prisma";
import { MILESTONES } from "@/app/lib/certificates";
import { resolveActiveChildProfileId } from "@/app/lib/progressService";
import { getSchoolContext } from "@/app/lib/schoolClasses";

/**
 * May this caller have this child's certificate for this milestone, and has
 * the child actually earned it?
 *
 * Two questions, and the certificate route used to ask neither. It printed
 * the name, rank and date it was handed in the query string, which made the
 * document worthless as a record: anybody, signed out, could mint one in any
 * name at any rank. The /schools page promises a school "certificates for
 * every pupil", and that promise is only worth making if the certificate
 * says something true.
 *
 * WHO MAY ASK. Three people, and nobody else:
 *
 *  - the child, for themselves, which is the school pupil case
 *  - the parent who owns the ChildProfile, which is the consumer case
 *  - a member of staff at the school whose class the child sits in, which is
 *    how a teacher prints a set for a wall display
 *
 * The staff case is scoped through `class: { orgId }` in the same query,
 * never checked afterwards, which is the rule the rest of the school code
 * follows: a child profile id from another school comes back as not found.
 *
 * WHETHER IT IS EARNED. Completed weeks of Cyber Heroes, counted against the
 * milestone, the same arithmetic getAchievedMilestones does on screen. The
 * date printed is the day the milestone week was finished, not today, so a
 * certificate reprinted next year still carries the day it was won.
 */

export const CERTIFICATE_PRODUCT_SLUG = "cyber-heroes";

export type CertificateRefusal = "unauthenticated" | "not_yours" | "not_earned" | "no_child";

export type CertificateGrant =
  | { ok: true; childName: string; completedDate: string; childProfileId: string }
  | { ok: false; reason: CertificateRefusal; error: string };

function dayOf(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export async function certificateFor(args: {
  userId: string;
  week: number;
  /** Only a teacher needs this. Without it, the caller's own active child. */
  childProfileId?: string | null;
}): Promise<CertificateGrant> {
  if (!args.userId) {
    return { ok: false, reason: "unauthenticated", error: "Sign in first." };
  }
  const milestone = MILESTONES.find((m) => m.week === args.week);
  if (!milestone) {
    return { ok: false, reason: "not_earned", error: "That is not a milestone week." };
  }

  let childProfileId = args.childProfileId?.trim() || null;

  if (childProfileId) {
    /* Asked for by id, so it is either the caller's own child or one of
       their pupils. Own first, because it needs no school lookup. */
    const own = await prisma.childProfile.findFirst({
      where: { id: childProfileId, userId: args.userId },
      select: { id: true },
    });
    if (!own) {
      const school = await getSchoolContext(args.userId);
      const pupil = school
        ? await prisma.childProfile.findFirst({
            /* Scoped in the query. Another school's pupil is not found. */
            where: { id: childProfileId, class: { orgId: school.orgId } },
            select: { id: true },
          })
        : null;
      if (!pupil) {
        return {
          ok: false,
          reason: "not_yours",
          error: "There is no certificate here for you.",
        };
      }
    }
  } else {
    childProfileId = await resolveActiveChildProfileId(args.userId);
    if (!childProfileId) {
      return { ok: false, reason: "no_child", error: "There is no learner on this account." };
    }
  }

  const child = await prisma.childProfile.findUnique({
    where: { id: childProfileId },
    select: { id: true, name: true },
  });
  if (!child) {
    return { ok: false, reason: "not_yours", error: "There is no certificate here for you." };
  }

  const product = await prisma.product.findUnique({
    where: { slug: CERTIFICATE_PRODUCT_SLUG },
    select: { id: true },
  });
  if (!product) {
    return { ok: false, reason: "not_earned", error: "That course is not set up." };
  }

  const done = await prisma.progress.findMany({
    where: { childProfileId: child.id, productId: product.id, completedAt: { not: null } },
    select: { week: true, completedAt: true },
  });
  if (done.length < milestone.week) {
    return {
      ok: false,
      reason: "not_earned",
      error: `This one is earned at week ${milestone.week}.`,
    };
  }

  /* The day the milestone week itself was finished. A child can finish weeks
     out of order, so this is that week's own row rather than the latest
     one; if that week is not among the completed ones (finished the count
     some other way), the most recent completion is the honest fallback. */
  const own = done.find((r) => r.week === milestone.week)?.completedAt ?? null;
  const latest = done
    .map((r) => r.completedAt)
    .filter((d): d is Date => d !== null)
    .sort((a, b) => b.getTime() - a.getTime())[0];

  return {
    ok: true,
    childProfileId: child.id,
    childName: child.name ?? "Cyber Hero",
    completedDate: dayOf(own ?? latest ?? new Date()),
  };
}
