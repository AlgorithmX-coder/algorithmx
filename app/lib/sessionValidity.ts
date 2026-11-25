import { prisma } from "@/app/lib/prisma";

/* Ending other sessions when a password changes.
 *
 * Sessions are signed tokens, not database rows, so there is nothing to
 * delete when a password is reset: a stolen session cookie kept working for
 * its whole life. Instead every account carries passwordChangedAt, every
 * session records when it signed in, and a session that signed in before
 * the last change is refused. The person who just reset signs in again
 * after the reset, so theirs is newer and carries on.
 *
 * Never import from a client component. */

/** True when a session that signed in at `signedInAtMs` predates the change. */
export function signedInBeforeChange(signedInAtMs: unknown, changedAt: Date | null | undefined): boolean {
  if (!changedAt) return false;
  /* A session from before this check existed has no stamp. If the password
     has changed since this shipped, it cannot prove it is newer. */
  if (typeof signedInAtMs !== "number" || !Number.isFinite(signedInAtMs)) return true;
  return signedInAtMs < changedAt.getTime();
}

/** Whether a session for this user, signed in at that moment, still stands.
 *  Fails open on a database error: a blip must not sign everyone out. */
export async function sessionStillValid(userId: string, signedInAtMs: unknown): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { passwordChangedAt: true } });
    if (!user) return false;
    return !signedInBeforeChange(signedInAtMs, user.passwordChangedAt);
  } catch (err) {
    console.error("[session] validity check failed, keeping the session", err);
    return true;
  }
}
