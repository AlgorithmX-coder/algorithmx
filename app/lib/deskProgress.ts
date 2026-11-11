import type { Prisma } from "@prisma/client";
import { prisma } from "@/app/lib/prisma";

/* Server-side progress for Desk Ready, the same shape and spirit as Cyber
 * Pro's (proProgress.ts): the client keeps localStorage as its primary
 * store and treats this as an additive, best-effort sync, so every function
 * here swallows errors and degrades to "no server progress". A missing
 * table (before its migration deploys) or a passing DB fault can never
 * break the course, only pause cross-device sync. */

/* Ids look like "m5t2" (a lesson) or "m5j1" (an office job), or "finalj1"
 * (the final task, Monday morning at the desk); the module is
 * the part before the t or j. */
export const DESK_ITEM = /^(m(1[0-3]|[0-9])|final)[tj][0-9]{1,2}$/;
export const moduleOfItem = (itemId: string) => itemId.replace(/[tj][0-9]+$/, "");

/* An office record is capped well above any real job (a job seeds a few
 * KB), so a client can't park a huge blob in the table. */
export const DESK_OFFICE_MAX_BYTES = 200_000;

/** The lesson and job ids this user has finished. */
export async function getDeskDone(userId: string): Promise<string[]> {
  if (!userId) return [];
  try {
    const rows = await prisma.deskProgress.findMany({ where: { userId }, select: { itemId: true } });
    return rows.map((r) => r.itemId);
  } catch {
    return [];
  }
}

/** Mark lessons or jobs finished (idempotent; the first finish date stays). */
export async function markDeskDone(userId: string, itemIds: string[]): Promise<boolean> {
  const ids = [...new Set(itemIds)].filter((id) => DESK_ITEM.test(id));
  if (!userId || ids.length === 0) return false;
  try {
    await prisma.$transaction(
      ids.map((itemId) =>
        prisma.deskProgress.upsert({
          where: { userId_itemId: { userId, itemId } },
          update: {},
          create: { userId, itemId, moduleId: moduleOfItem(itemId) },
        }),
      ),
    );
    return true;
  } catch {
    return false;
  }
}

/** A job's saved office, with when it was last saved, or null. */
export async function getDeskOffice(userId: string, jobId: string): Promise<{ state: unknown; updatedAt: Date } | null> {
  if (!userId || !DESK_ITEM.test(jobId)) return null;
  try {
    const row = await prisma.deskOffice.findUnique({ where: { userId_jobId: { userId, jobId } }, select: { state: true, updatedAt: true } });
    return row ?? null;
  } catch {
    return null;
  }
}

/** Save a job's office, replacing what was there. */
export async function saveDeskOffice(userId: string, jobId: string, state: Prisma.InputJsonValue): Promise<boolean> {
  if (!userId || !DESK_ITEM.test(jobId)) return false;
  try {
    await prisma.deskOffice.upsert({ where: { userId_jobId: { userId, jobId } }, update: { state }, create: { userId, jobId, state } });
    return true;
  } catch {
    return false;
  }
}

/** Forget a job's office ("Start the job again"). */
export async function clearDeskOffice(userId: string, jobId: string): Promise<boolean> {
  if (!userId || !DESK_ITEM.test(jobId)) return false;
  try {
    await prisma.deskOffice.deleteMany({ where: { userId, jobId } });
    return true;
  } catch {
    return false;
  }
}
