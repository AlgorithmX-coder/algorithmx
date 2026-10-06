import { prisma } from "@/app/lib/prisma";

/* Server-side progress for the Cyber Pro course. Deliberately simple and
 * resilient: the client (WeekPlayer) keeps localStorage as its primary store
 * and treats this as an additive, best-effort sync, so every function here
 * swallows errors and degrades to "no server progress". That means a brief
 * absence of the ProProgress table (e.g. before its migration deploys), or
 * any transient DB issue, can never break the course, only disable cross-
 * device sync until it recovers. */

/** The topic ids this user has completed, across the whole Pro course. */
export async function getDoneTopics(userId: string): Promise<string[]> {
  if (!userId) return [];
  try {
    const rows = await prisma.proProgress.findMany({
      where: { userId },
      select: { topicId: true },
    });
    return rows.map((r) => r.topicId);
  } catch {
    return [];
  }
}

/** Mark one or more topics in a module complete for this user (idempotent). */
export async function markTopicsDone(
  userId: string,
  moduleId: string,
  topicIds: string[],
): Promise<boolean> {
  if (!userId || !moduleId || topicIds.length === 0) return false;
  try {
    await prisma.$transaction(
      topicIds.map((topicId) =>
        prisma.proProgress.upsert({
          where: { userId_topicId: { userId, topicId } },
          // Deliberate no-op on an existing row: preserves the original
          // completedAt, so a replay never resets the timestamp.
          update: {},
          create: { userId, moduleId, topicId },
        }),
      ),
    );
    return true;
  } catch {
    return false;
  }
}

/** Clear this user's progress for one module (its "start over"). */
export async function resetModuleProgress(
  userId: string,
  moduleId: string,
): Promise<boolean> {
  if (!userId || !moduleId) return false;
  try {
    await prisma.proProgress.deleteMany({ where: { userId, moduleId } });
    return true;
  } catch {
    return false;
  }
}
