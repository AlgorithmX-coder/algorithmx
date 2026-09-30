import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { getEnrolment, TRACK_TO_DB } from "@/app/lib/aiCleared";
import { TRACKS } from "@/app/ai-cleared/engine/types";

/* POST /api/ai-cleared/track { track, course? }
 * The one-time track change the invite page promises, per course. A
 * second change goes through the firm's admin. Modules already cleared
 * stay cleared. */

const Body = z.object({ track: z.enum(TRACKS), course: z.enum(["ai-cleared", "ai-fluent"]).optional() });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in first." }, { status: 401 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Bad request." }, { status: 400 });

  const enrolment = await getEnrolment(session.user.id, parsed.data.course ?? "ai-cleared");
  if (!enrolment) return Response.json({ error: "No enrolment." }, { status: 403 });
  if (enrolment.trackChangedAt) return Response.json({ error: "Your desk has already been changed once. Ask your admin for another change." }, { status: 409 });
  if (TRACK_TO_DB[parsed.data.track] === enrolment.track) return Response.json({ ok: true, unchanged: true });

  await prisma.enrolment.update({ where: { id: enrolment.id }, data: { track: TRACK_TO_DB[parsed.data.track], trackChangedAt: new Date() } });
  return Response.json({ ok: true });
}
