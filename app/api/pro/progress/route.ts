import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/app/lib/auth";
import { getDoneTopics, markTopicsDone, resetModuleProgress } from "@/app/lib/proProgress";

/* Cyber Pro course progress, additive over the client's localStorage.
 *
 *   GET    -> { done: string[] }  the user's completed topic ids (empty when
 *             not signed in, so the client simply uses local progress).
 *   POST   { moduleId, topicIds } mark topics complete (idempotent).
 *   DELETE { moduleId }           clear a module's progress ("start over").
 *
 * The user is always resolved from the session, never from the body. Every
 * handler is best-effort: the client never depends on it succeeding, so a
 * failure just means no cross-device sync, never a broken course. */

export const runtime = "nodejs";

const Post = z.object({
  moduleId: z.string().min(1).max(64),
  topicIds: z.array(z.string().min(1).max(64)).min(1).max(50),
});

const Del = z.object({ moduleId: z.string().min(1).max(64) });

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ done: [] });
  const done = await getDoneTopics(session.user.id);
  return Response.json({ done });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ ok: false }, { status: 401 });
  const parsed = Post.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ ok: false }, { status: 400 });
  const ok = await markTopicsDone(session.user.id, parsed.data.moduleId, parsed.data.topicIds);
  return Response.json({ ok });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ ok: false }, { status: 401 });
  const parsed = Del.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ ok: false }, { status: 400 });
  const ok = await resetModuleProgress(session.user.id, parsed.data.moduleId);
  return Response.json({ ok });
}
