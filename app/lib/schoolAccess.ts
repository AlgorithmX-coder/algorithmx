import { prisma } from "@/app/lib/prisma";

/**
 * Who may open a teacher pack.
 *
 * The packs are not marketing. They carry the answers to every question in the
 * week, the script for the whole lesson, and on some weeks a safeguarding
 * briefing written for an adult. A child who found them would have the answers
 * to their own week, which is why this is gated at all.
 *
 * A school is an `Organisation`. That model is already product neutral (name,
 * slug, sector, seats, plan) and the firm specific parts live in the separate
 * `FirmProfile`, so a school needed no new table and Phase 1 ships with no
 * migration at all. A teacher is an `OrgMember` with ADMIN or MANAGER, the same
 * shape AI Cleared already uses for a firm's admins. Pupils are deliberately
 * not members of anything: a child needs no email, no password and no account,
 * and nothing here should ever make one necessary.
 *
 * TODO(phase-3): this cannot yet tell a school from a law firm. `sector` is
 * free text typed by whoever onboards the customer, so gating on it would lock
 * a real teacher out of a live lesson because somebody wrote "Primary
 * education" instead of "School", and a fresh firm has no `FirmProfile` row
 * either, so its absence proves nothing. The honest fix is a `SchoolProfile`
 * that mirrors `FirmProfile`, which lands with the `Class` model in phase 3.
 * Until then the residual overlap is that an AI Cleared firm admin could open
 * a primary school lesson plan. That is our own teaching material rather than
 * anybody's data, and it is written down here rather than papered over.
 */
export interface TeacherContext {
  orgId: string;
  orgName: string;
  role: "ADMIN" | "MANAGER";
}

export async function getTeacherContext(userId: string): Promise<TeacherContext | null> {
  if (!userId) return null;
  const member = await prisma.orgMember.findFirst({
    where: { userId, role: { in: ["ADMIN", "MANAGER"] } },
    select: { role: true, org: { select: { id: true, name: true } } },
  });
  if (!member) return null;
  return {
    orgId: member.org.id,
    orgName: member.org.name,
    role: member.role as "ADMIN" | "MANAGER",
  };
}
