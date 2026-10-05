import type { CourseKey } from "@prisma/client";
import { prisma } from "@/app/lib/prisma";

/* A ceiling on what one person can spend on the model in a day. Every
 * grade and every reply on either course is one call; a learner doing
 * three modules in a sitting makes perhaps forty. Over the line, the
 * routes answer 429 and the player scores by the rules alone until
 * tomorrow. The Claude Console's own spend cap is the backstop behind
 * this. MODEL_DAILY_ALLOWANCE on Vercel overrides the default. */

export const DAILY_ALLOWANCE = Math.max(10, Number(process.env.MODEL_DAILY_ALLOWANCE) || 150);
const DAY_MS = 24 * 60 * 60 * 1000;

export const ALLOWANCE_MESSAGE = "You have used today's practice allowance. This send is scored by the rules alone; your progress is saved, and the model is back tomorrow.";

export async function modelAllowance(userId: string): Promise<{ used: number; allowance: number; over: boolean }> {
  const used = await prisma.modelCall.count({ where: { userId, at: { gte: new Date(Date.now() - DAY_MS) } } });
  return { used, allowance: DAILY_ALLOWANCE, over: used >= DAILY_ALLOWANCE };
}

export async function recordModelCall(userId: string, course: CourseKey, route: "grade" | "reply") {
  try {
    await prisma.modelCall.create({ data: { userId, course, route } });
  } catch (err) {
    console.error("[model-allowance] could not record a call", err instanceof Error ? err.message : err);
  }
}

/* For the ops console: calls in the last 24 hours, across the platform
 * or for one firm's members. */
export async function modelCallsLastDay(orgId?: string): Promise<number> {
  const since = new Date(Date.now() - DAY_MS);
  if (!orgId) return prisma.modelCall.count({ where: { at: { gte: since } } });
  const members = await prisma.orgMember.findMany({ where: { orgId }, select: { userId: true } });
  if (!members.length) return 0;
  return prisma.modelCall.count({ where: { at: { gte: since }, userId: { in: members.map((m) => m.userId) } } });
}
