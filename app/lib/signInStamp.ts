import { prisma } from "@/app/lib/prisma";

/**
 * Record that this person just signed in.
 *
 * The retention policy deletes an individual account two years after its
 * last sign-in (app/lib/retentionRule.ts), and before this nothing recorded
 * one: the session is a JWT, so no row was ever written. Called from every
 * place a password is checked and a session handed out.
 *
 * Never throws and never blocks a sign-in: a missed stamp only means the
 * account looks a little older to a job that warns 30 days before it acts.
 */
export async function stampSignIn(userId: string | undefined | null): Promise<void> {
  if (!userId) return;
  try {
    await prisma.user.update({ where: { id: userId }, data: { lastSignInAt: new Date() } });
  } catch (err) {
    console.error("[sign-in] could not stamp lastSignInAt", err instanceof Error ? err.message : err);
  }
}
