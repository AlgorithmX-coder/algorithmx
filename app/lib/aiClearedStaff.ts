import { prisma } from "@/app/lib/prisma";

/* Who counts as AlgorithmX staff for the AI Cleared ops console: a user
 * whose role is "staff", or whose email is listed in PLATFORM_STAFF_EMAILS
 * (comma-separated, case-insensitive). The env list is how the first
 * member of staff gets in before anyone can set the role. Never import
 * from a client component. */

export function staffEmails(): Set<string> {
  return new Set(
    (process.env.PLATFORM_STAFF_EMAILS ?? "")
      .split(/[,\s]+/)
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

export async function isStaffUser(userId: string): Promise<boolean> {
  if (!userId) return false;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true, email: true } });
  if (!user) return false;
  return user.role === "staff" || staffEmails().has(user.email.toLowerCase());
}
