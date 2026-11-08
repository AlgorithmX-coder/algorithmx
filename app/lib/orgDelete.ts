import { prisma } from "@/app/lib/prisma";
import { opsAlert } from "@/app/lib/opsAlert";

/**
 * Deleting an organisation for good.
 *
 * THE RULE: access must already be closed. Closing access is reversible and
 * takes one click; this is neither. Requiring the closed state first means a
 * deletion is always a second, deliberate act with a gap in between, and
 * that gap is the only thing standing between a misclick and a school's
 * year of work. The check is here, on the server, not only on the button:
 * an API route is a public endpoint whatever renders the page.
 *
 * WHAT GOES, AND THE ONE THING THAT MAKES SCHOOLS DIFFERENT. A school's
 * pupils are accounts that exist only because that school made them: a
 * first name, a colour, and a synthetic address on a domain that can never
 * receive mail. Nothing outside the school refers to them, and the
 * Organisation cascade would not reach them (a class is cascaded, but a
 * pupil's `classId` is SET NULL), so deleting the school without deleting
 * them would leave orphaned children's records with nothing to attach them
 * to. They are deleted explicitly.
 *
 * A firm's learners are the opposite: real people with real work addresses
 * who may hold a consumer course of their own. Deleting the firm must never
 * delete them. It takes their seats, enrolments and membership with it, and
 * leaves the person.
 *
 * Teachers are treated as people too: their OrgMember row goes, their
 * account stays.
 */

export type DeleteFailure = "not_found" | "not_closed";

export interface DeleteSummary {
  name: string;
  /** Pupil accounts removed. Always 0 for a firm. */
  pupilsDeleted: number;
  classesDeleted: number;
}

export async function deleteOrganisation(
  orgId: string,
  by: { name: string; email: string | null },
): Promise<{ ok: true; summary: DeleteSummary } | { ok: false; error: DeleteFailure }> {
  const org = await prisma.organisation.findUnique({
    where: { id: orgId },
    select: {
      id: true,
      name: true,
      slug: true,
      revokedAt: true,
      school: { select: { id: true } },
    },
  });
  if (!org) return { ok: false, error: "not_found" };

  /* The gate. Not a confirmation dialog, which a tired person clicks
     through: a state someone had to set earlier, on purpose. */
  if (!org.revokedAt) return { ok: false, error: "not_closed" };

  const isLearnerOrg = org.school !== null;

  /* Pupil accounts, gathered before anything is deleted. Scoped through the
     class relation so this can only ever reach children of THIS org. */
  const pupilUserIds = isLearnerOrg
    ? (
        await prisma.childProfile.findMany({
          where: { class: { orgId: org.id } },
          select: { userId: true },
        })
      ).map((p) => p.userId)
    : [];

  const classesDeleted = isLearnerOrg
    ? await prisma.class.count({ where: { orgId: org.id } })
    : 0;

  await prisma.$transaction(async (tx) => {
    /* Pupils first. Deleting the user cascades their profile and progress.
       Done before the org so that a failure here stops the whole thing
       rather than leaving children with no school. */
    if (pupilUserIds.length) {
      await tx.user.deleteMany({ where: { id: { in: pupilUserIds }, role: "pupil" } });
    }
    /* Then the organisation. Classes, members, invites, seats, enrolments,
       purchases and the places ledger all cascade from it. */
    await tx.organisation.delete({ where: { id: org.id } });
  });

  await opsAlert({
    what: "Organisation deleted",
    detail: {
      org: org.name,
      slug: org.slug,
      kind: isLearnerOrg ? "school or organisation" : "firm",
      pupilsDeleted: pupilUserIds.length,
      classesDeleted,
      deletedBy: by.email ?? by.name,
    },
  });

  return {
    ok: true,
    summary: { name: org.name, pupilsDeleted: pupilUserIds.length, classesDeleted },
  };
}

/**
 * What deleting this organisation would take with it, for the confirmation.
 *
 * Shown before the fact rather than reported after it: "this will delete 48
 * pupil accounts" is the sentence that stops the wrong click.
 */
export async function deletionPreview(orgId: string): Promise<DeleteSummary & { closed: boolean }> {
  const [org, pupils, classes] = await Promise.all([
    prisma.organisation.findUnique({ where: { id: orgId }, select: { name: true, revokedAt: true } }),
    prisma.childProfile.count({ where: { class: { orgId } } }),
    prisma.class.count({ where: { orgId } }),
  ]);
  return {
    name: org?.name ?? "",
    closed: Boolean(org?.revokedAt),
    pupilsDeleted: pupils,
    classesDeleted: classes,
  };
}
