import { prisma } from "@/app/lib/prisma";
import { emailEquals, normaliseEmail } from "@/app/lib/emailIdentity";

/* Who counts as AlgorithmX staff for the AI Cleared ops console: a user
 * whose role is "staff", or whose email is listed in PLATFORM_STAFF_EMAILS
 * (comma-separated, case-insensitive). The env list is how the first
 * member of staff gets in before anyone can set the role. Never import
 * from a client component. */

export function staffEmails(): Set<string> {
  return new Set(
    (process.env.PLATFORM_STAFF_EMAILS ?? "")
      .split(/[,\s]+/)
      .map((e) => normaliseEmail(e))
      .filter(Boolean),
  );
}

export async function isStaffUser(userId: string): Promise<boolean> {
  if (!userId) return false;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true, email: true, createdAt: true } });
  if (!user) return false;
  if (user.role === "staff") return true;
  if (!staffEmails().has(normaliseEmail(user.email))) return false;
  /* The address only counts for the account that first held it. Before
     signup normalised addresses, "OWNER@x.com" could be registered beside
     "owner@x.com" as a second account, and lowercasing it here made that
     stranger staff. An older account holding the same address in any case
     means this one is the copy. */
  const older = await prisma.user.findFirst({
    where: { id: { not: userId }, email: emailEquals(user.email), createdAt: { lte: user.createdAt } },
    select: { id: true },
  });
  return !older;
}
