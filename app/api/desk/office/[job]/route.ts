import type { Prisma } from "@prisma/client";
import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/app/lib/auth";
import { clearDeskOffice, DESK_ITEM, DESK_OFFICE_MAX_BYTES, getDeskOffice, saveDeskOffice } from "@/app/lib/deskProgress";

/* One Desk Ready office job's pretend office, so a signed-in learner can
 * carry a job on from another computer. Additive over the client's
 * localStorage, best-effort like /api/desk/progress.
 *
 *   GET    -> { state, signedIn }, state null when nothing is saved
 *   PUT    { state }  save the office (replaces what was there)
 *   DELETE            forget it ("Start the job again")
 *
 * The state holds emails the learner wrote, so it is checked for shape and
 * size, never logged, and the route is on Sentry's private-text list. */

export const runtime = "nodejs";

type Ctx = { params: Promise<{ job: string }> };

const State = z
  .object({
    version: z.number(),
    savedAt: z.number().optional(),
    files: z.array(z.record(z.string(), z.unknown())).max(400),
    emails: z.array(z.record(z.string(), z.unknown())).max(200),
    mailFolders: z.array(z.string()).max(20).optional(),
  })
  .passthrough();
const Put = z.object({ state: State });

async function jobOf(ctx: Ctx) {
  const { job } = await ctx.params;
  return DESK_ITEM.test(job) && /j/.test(job) ? job : null;
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  const session = await auth();
  const job = await jobOf(ctx);
  if (!session?.user?.id || !job) return Response.json({ state: null, signedIn: !!session?.user?.id });
  const row = await getDeskOffice(session.user.id, job);
  return Response.json({ state: row?.state ?? null, signedIn: true });
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const session = await auth();
  const job = await jobOf(ctx);
  if (!session?.user?.id) return Response.json({ ok: false }, { status: 401 });
  if (!job) return Response.json({ ok: false }, { status: 404 });
  const text = await req.text().catch(() => "");
  if (text.length > DESK_OFFICE_MAX_BYTES) return Response.json({ ok: false }, { status: 413 });
  let body: unknown = null;
  try {
    body = JSON.parse(text);
  } catch {
    /* falls through to 400 */
  }
  const parsed = Put.safeParse(body);
  if (!parsed.success) return Response.json({ ok: false }, { status: 400 });
  return Response.json({ ok: await saveDeskOffice(session.user.id, job, parsed.data.state as Prisma.InputJsonValue) });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const session = await auth();
  const job = await jobOf(ctx);
  if (!session?.user?.id) return Response.json({ ok: false }, { status: 401 });
  if (!job) return Response.json({ ok: false }, { status: 404 });
  return Response.json({ ok: await clearDeskOffice(session.user.id, job) });
}
