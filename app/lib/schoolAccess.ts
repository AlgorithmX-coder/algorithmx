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
 * This used to carry a TODO saying it could not tell a school from a law
 * firm, because `sector` is free text and a fresh firm has no `FirmProfile`
 * row either, so neither could be gated on. The fix it asked for was a
 * `SchoolProfile` mirroring `FirmProfile`, and that now exists on every
 * school and youth organisation we create, so the gate below is the fix
 * rather than the note. The residual overlap it described, an AI Cleared
 * firm admin opening a primary school lesson plan, is closed.
 */
export interface TeacherContext {
  orgId: string;
  orgName: string;
  role: "ADMIN" | "MANAGER";
}

export async function getTeacherContext(userId: string): Promise<TeacherContext | null> {
  if (!userId) return null;
  const member = await prisma.orgMember.findFirst({
    where: { userId, role: { in: ["ADMIN", "MANAGER"] }, org: { school: { isNot: null } } },
    orderBy: { createdAt: "asc" },
    select: { role: true, org: { select: { id: true, name: true } } },
  });
  if (!member) return null;
  return {
    orgId: member.org.id,
    orgName: member.org.name,
    role: member.role as "ADMIN" | "MANAGER",
  };
}
