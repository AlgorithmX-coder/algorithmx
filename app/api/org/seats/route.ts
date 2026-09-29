import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { getAdminContext, orgRefOf, inviteSeats, sendInvite } from "@/app/lib/aiClearedAdmin";
import { firstNameOf } from "@/app/lib/aiCleared";
import { TRACKS } from "@/app/ai-cleared/engine/types";

/* POST /api/org/seats
 *   { emails: string[], team?, track?, role? }  invite new seats
 *   { resend: seatId }                           resend one invite
 * DELETE /api/org/seats { seatId }               remove an unclaimed seat */

const Invite = z.object({
  emails: z.array(z.string().max(200)).min(1).max(200),
  team: z.string().max(80).optional().nullable(),
  track: z.enum(TRACKS).optional().nullable(),
  role: z.enum(["LEARNER", "MANAGER", "ADMIN"]).optional(),
});
const Resend = z.object({ resend: z.string().min(1) });
const Remove = z.object({ seatId: z.string().min(1) });

function originOf(req: NextRequest): string {
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "www.algorithmx.co.uk";
  return `${proto}://${host}`;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in first." }, { status: 401 });
  const ctx = await getAdminContext(session.user.id, orgRefOf(req));
  if (!ctx) return Response.json({ error: "Not an admin." }, { status: 403 });
  const body = await req.json().catch(() => null);
  const adminName = ctx.user.name?.trim() || firstNameOf(ctx.user.name, ctx.user.email);

  const resend = Resend.safeParse(body);
  if (resend.success) {
    const seat = await prisma.seat.findFirst({ where: { id: resend.data.resend, orgId: ctx.orgId } });
    if (!seat) return Response.json({ error: "No such seat." }, { status: 404 });
    try {
      await sendInvite({ to: seat.email, token: seat.inviteToken, firmName: ctx.org.name, origin: originOf(req), adminName, adminEmail: ctx.user.email });
      return Response.json({ ok: true });
    } catch (err) {
      console.error("[ai-cleared/admin] resend failed", err instanceof Error ? err.message : err);
      return Response.json({ error: "The email could not be sent just now. Copy the link instead." }, { status: 502 });
    }
  }

  const parsed = Invite.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Bad request." }, { status: 400 });
  if (parsed.data.role === "ADMIN" && ctx.role !== "ADMIN") return Response.json({ error: "Only an admin can invite another admin." }, { status: 403 });
  const result = await inviteSeats({
    orgId: ctx.orgId,
    orgSlug: ctx.org.slug,
    firmName: ctx.org.name,
    emails: parsed.data.emails,
    team: parsed.data.team ?? null,
    track: parsed.data.track ?? null,
    role: parsed.data.role ?? "LEARNER",
    origin: originOf(req),
    adminName,
    adminEmail: ctx.user.email,
  });
  return Response.json({ ok: true, ...result });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in first." }, { status: 401 });
  const ctx = await getAdminContext(session.user.id, orgRefOf(req));
  if (!ctx) return Response.json({ error: "Not an admin." }, { status: 403 });
  const parsed = Remove.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Bad request." }, { status: 400 });
  const seat = await prisma.seat.findFirst({ where: { id: parsed.data.seatId, orgId: ctx.orgId } });
  if (!seat) return Response.json({ error: "No such seat." }, { status: 404 });
  if (seat.claimedAt) return Response.json({ error: "That seat has been claimed. Ask admissions@algorithmx.co.uk to remove a learner." }, { status: 409 });
  await prisma.seat.delete({ where: { id: seat.id } });
  return Response.json({ ok: true });
}
