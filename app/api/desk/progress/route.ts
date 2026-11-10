import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/app/lib/auth";
import { DESK_ITEM, getDeskDone, markDeskDone } from "@/app/lib/deskProgress";

/* Desk Ready progress, additive over the client's localStorage.
 *
 *   GET  -> { done: string[], signedIn }  finished lesson and job ids (empty
 *           when not signed in, so the client simply uses local progress).
 *   POST { ids }                mark lessons or jobs finished (idempotent).
 *
 * The user is always resolved from the session, never from the body. Both
 * are best-effort: a failure only means no cross-device sync. */

export const runtime = "nodejs";

const Post = z.object({ ids: z.array(z.string().regex(DESK_ITEM)).min(1).max(120) });

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ done: [], signedIn: false });
  return Response.json({ done: await getDeskDone(session.user.id), signedIn: true });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ ok: false }, { status: 401 });
  const parsed = Post.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ ok: false }, { status: 400 });
  return Response.json({ ok: await markDeskDone(session.user.id, parsed.data.ids) });
}
