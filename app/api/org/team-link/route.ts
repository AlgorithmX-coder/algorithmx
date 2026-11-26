import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/app/lib/auth";
import { getAdminContext, orgRefOf } from "@/app/lib/aiClearedAdmin";
import { firstNameOf } from "@/app/lib/aiCleared";
import { remindNotJoined, rotateTeamLink, setTeamDomainLock } from "@/app/lib/firmTeamLink";

/* POST /api/org/team-link
 *   { action: "rotate" }                    a new team link; the old one stops at once
 *   { action: "domain", on: boolean }       the firm-domain check on or off
 *   { action: "remind", emails: string[] }  email the link to people who have not joined
 * For the firm's admins and managers, or staff acting with ?org=. */

const Body = z.discriminatedUnion("action", [
  z.object({ action: z.literal("rotate") }),
  z.object({ action: z.literal("domain"), on: z.boolean() }),
  z.object({ action: z.literal("remind"), emails: z.array(z.string().max(200)).min(1).max(500) }),
]);

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
  if (ctx.org.revokedAt) return Response.json({ error: `${ctx.org.name}'s access is closed, so the team link is switched off.` }, { status: 409 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Bad request." }, { status: 400 });
  const body = parsed.data;

  if (body.action === "rotate") {
    const token = await rotateTeamLink(ctx.orgId);
    return Response.json({ ok: true, token });
  }

  if (body.action === "domain") {
    const r = await setTeamDomainLock(ctx.orgId, body.on);
    if (!r.ok) return Response.json({ error: r.message }, { status: 409 });
    return Response.json({ ok: true, domain: r.domain });
  }

  const adminName = ctx.user.name?.trim() || firstNameOf(ctx.user.name, ctx.user.email);
  const r = await remindNotJoined({ orgId: ctx.orgId, firmName: ctx.org.name, emails: body.emails, origin: originOf(req), adminName, adminEmail: ctx.user.email });
  if (!r.ok) return Response.json({ error: r.message }, { status: 409 });
  return Response.json(r);
}
