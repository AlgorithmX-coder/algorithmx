import { NextRequest } from "next/server";
import { auth } from "@/app/lib/auth";
import { getAdminContext, orgRefOf, nudge } from "@/app/lib/aiClearedAdmin";
import { firstNameOf } from "@/app/lib/aiCleared";

/* POST /api/org/nudge: a reminder to everyone who has not finished, under
 * the admin's name with reply-to set to them (owner decision 2026-09-28). */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in first." }, { status: 401 });
  const ctx = await getAdminContext(session.user.id, orgRefOf(req));
  if (!ctx) return Response.json({ error: "Not an admin." }, { status: 403 });
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "www.algorithmx.co.uk";
  const result = await nudge({ orgId: ctx.orgId, firmName: ctx.org.name, origin: `${proto}://${host}`, adminName: ctx.user.name?.trim() || firstNameOf(ctx.user.name, ctx.user.email), adminEmail: ctx.user.email });
  return Response.json({ ok: true, ...result });
}
