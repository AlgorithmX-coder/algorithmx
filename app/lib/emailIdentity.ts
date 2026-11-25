import { prisma } from "@/app/lib/prisma";

/* One rule for what an email address IS when it identifies an account.
 *
 * User.email is a plain @unique text column, so Postgres compares it case
 * sensitively: "Owner@x.com" and "owner@x.com" were two different accounts.
 * Signup stored whatever was typed, while the staff check (aiClearedStaff.ts)
 * lowercases before matching PLATFORM_STAFF_EMAILS, so a stranger could sign
 * up as the owner's address in capitals and be treated as staff.
 *
 * Every path that writes an address onto an account, or looks an account up
 * by address, goes through here: trimmed and lowercased on the way in, and
 * looked up case-insensitively so rows written before this rule still sign
 * in. Never import from a client component. */

export function normaliseEmail(raw: unknown): string {
  return typeof raw === "string" ? raw.trim().toLowerCase() : "";
}

/* Prisma filter: this address, whatever case the row was stored in. */
export function emailEquals(raw: unknown) {
  return { equals: normaliseEmail(raw), mode: "insensitive" as const };
}

/* The account for an address. An exact match on the normalised form wins
 * (every row written from now on); failing that, the oldest row that
 * matches ignoring case, which is the original owner of the address if a
 * mixed-case duplicate was ever created. */
export async function findUserByEmail(raw: unknown) {
  const email = normaliseEmail(raw);
  if (!email) return null;
  const exact = await prisma.user.findUnique({ where: { email } });
  if (exact) return exact;
  return prisma.user.findFirst({ where: { email: emailEquals(email) }, orderBy: { createdAt: "asc" } });
}

/* True when any account already holds this address, in any case. */
export async function emailTaken(raw: unknown): Promise<boolean> {
  const email = normaliseEmail(raw);
  if (!email) return false;
  const hit = await prisma.user.findFirst({ where: { email: emailEquals(email) }, select: { id: true } });
  return !!hit;
}
